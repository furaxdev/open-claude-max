// Tests du CLI : --dry-run, installation réelle dans un dossier temporaire, sauvegardes, confirmation, désinstallation.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { END, START } from '../src/block.js';
import { SKILLS } from '../src/skills.js';

const bin = fileURLToPath(new URL('../bin/open-claude-max.js', import.meta.url));
const ALL = SKILLS.map((s) => s.name);

const LAYOUT = {
  'claude-code': { skills: '.claude/skills', file: '.claude/CLAUDE.md' },
  codex: { skills: '.agents/skills', file: '.codex/AGENTS.md' },
  opencode: { skills: '.config/opencode/skills', file: '.config/opencode/AGENTS.md' },
};

function sandbox() {
  const home = mkdtempSync(join(tmpdir(), 'omax-'));
  const env = { PATH: process.env.PATH, HOME: home, USERPROFILE: home, NO_COLOR: '1' };
  const run = (args, input = '') => spawnSync(process.execPath, [bin, ...args], { env, input, encoding: 'utf8', timeout: 20_000 });
  const path = (rel) => join(home, rel);
  const files = () => {
    const out = [];
    const walk = (dir) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        e.isDirectory() ? walk(join(dir, e.name)) : out.push(join(dir, e.name).slice(home.length + 1));
      }
    };
    walk(home);
    return out.sort();
  };
  return { home, run, path, files, clean: () => rmSync(home, { recursive: true, force: true }) };
}

for (const [target, layout] of Object.entries(LAYOUT)) {
  test(`${target} : --dry-run liste les fichiers sans rien écrire`, () => {
    const sb = sandbox();
    const res = sb.run(['--target', target, '--dry-run']);
    assert.equal(res.status, 0, res.stderr);
    for (const name of ALL) assert.ok(res.stdout.includes(join(sb.home, layout.skills, name, 'SKILL.md')), name);
    assert.ok(res.stdout.includes(join(sb.home, layout.file)));
    assert.ok(res.stdout.includes('aucun fichier écrit'));
    assert.deepEqual(sb.files(), []);
    sb.clean();
  });

  test(`${target} : installation réelle, idempotence puis désinstallation`, () => {
    const sb = sandbox();
    const install = sb.run(['--target', target, '--yes', '--offline']);
    assert.equal(install.status, 0, install.stdout + install.stderr);

    for (const name of ALL) {
      const copied = readFileSync(sb.path(join(layout.skills, name, 'SKILL.md')), 'utf8');
      const source = readFileSync(new URL(`../skills/${name}/SKILL.md`, import.meta.url), 'utf8');
      assert.equal(copied, source, name);
    }
    const instructions = readFileSync(sb.path(layout.file), 'utf8');
    assert.ok(instructions.includes(START) && instructions.includes(END));
    for (const name of ALL) assert.ok(instructions.includes(`\`${name}\``));
    assert.equal(sb.files().length, ALL.length + 1);

    const again = sb.run(['--target', target, '--yes', '--offline']);
    assert.equal(again.status, 0);
    assert.ok(!sb.files().some((f) => f.includes('.bak')), 'aucune sauvegarde inutile');

    const uninstall = sb.run(['--target', target, '--uninstall', '--yes']);
    assert.equal(uninstall.status, 0, uninstall.stdout + uninstall.stderr);
    const left = sb.files();
    assert.ok(!left.some((f) => f.endsWith('SKILL.md')), 'skills retirés');
    assert.ok(left.every((f) => f.includes('.bak')), `il ne reste que des sauvegardes : ${left}`);
    sb.clean();
  });
}

test('un fichier existant est sauvegardé en .bak et le contenu utilisateur est conservé', () => {
  const sb = sandbox();
  mkdirSync(sb.path('.claude/skills/omax-code'), { recursive: true });
  writeFileSync(sb.path('.claude/skills/omax-code/SKILL.md'), 'ancienne version\n');
  writeFileSync(sb.path('.claude/CLAUDE.md'), '# Mes règles\n\nRègle perso.\n');

  const res = sb.run(['--target', 'claude-code', '--skills', 'omax-code', '--yes', '--offline']);
  assert.equal(res.status, 0, res.stdout);
  assert.ok(res.stdout.includes('sauvegarde'));
  assert.equal(readFileSync(sb.path('.claude/skills/omax-code/SKILL.md.bak'), 'utf8'), 'ancienne version\n');
  assert.equal(readFileSync(sb.path('.claude/CLAUDE.md.bak'), 'utf8'), '# Mes règles\n\nRègle perso.\n');
  const claudeMd = readFileSync(sb.path('.claude/CLAUDE.md'), 'utf8');
  assert.ok(claudeMd.startsWith('# Mes règles\n\nRègle perso.'));
  assert.ok(claudeMd.includes('`omax-code`') && !claudeMd.includes('`omax-chat`'));

  sb.run(['--target', 'claude-code', '--uninstall', '--skills', 'omax-code', '--yes']);
  assert.equal(readFileSync(sb.path('.claude/CLAUDE.md'), 'utf8'), '# Mes règles\n\nRègle perso.\n');
  assert.ok(!existsSync(sb.path('.claude/skills/omax-code/SKILL.md')));
  sb.clean();
});

test('sans réponse positive, rien n\'est écrit (refus, Entrée, entrée vide)', () => {
  for (const input of ['n\n', '\n', '']) {
    const sb = sandbox();
    const res = sb.run(['--target', 'claude-code', '--skills', 'omax-code', '--offline'], input);
    assert.equal(res.status, 1);
    assert.ok(res.stdout.includes("Rien n'a été écrit"));
    assert.deepEqual(sb.files(), [], `entrée ${JSON.stringify(input)}`);
    sb.clean();
  }
});

test('assistant interactif : choix de la cible, des skills puis confirmation "o"', () => {
  const sb = sandbox();
  const res = sb.run(['--offline'], '2\n3\no\n'); // Codex, omax-security, oui
  assert.equal(res.status, 0, res.stdout);
  assert.ok(res.stdout.includes('Étape 1/3') && res.stdout.includes('Étape 2/3') && res.stdout.includes('Étape 3/3'));
  assert.deepEqual(sb.files(), ['.agents/skills/omax-security/SKILL.md', '.codex/AGENTS.md']);
  sb.clean();
});

test('un skill ou une cible inconnus sont refusés sans écrire', () => {
  const sb = sandbox();
  assert.equal(sb.run(['--target', 'nimportequoi', '--dry-run']).status, 1);
  assert.equal(sb.run(['--target', 'codex', '--skills', 'inconnu', '--dry-run']).status, 1);
  assert.equal(sb.run(['--ref', '../x', '--dry-run', '--target', 'codex']).status, 1);
  assert.equal(sb.run(['--option-inconnue']).status, 2);
  assert.deepEqual(sb.files(), []);
  sb.clean();
});

test('cible personnalisée : dossier et fichier d\'instructions choisis par l\'utilisateur', () => {
  const sb = sandbox();
  const dir = sb.path('mes-skills');
  const file = sb.path('regles/AGENTS.md');
  const res = sb.run(['--target', 'custom', '--dir', dir, '--instructions', file, '--skills', 'omax-chat', '--yes', '--offline']);
  assert.equal(res.status, 0, res.stdout);
  assert.deepEqual(sb.files(), ['mes-skills/omax-chat/SKILL.md', 'regles/AGENTS.md']);
  const none = sb.run(['--target', 'custom', '--dir', sb.path('autre'), '--no-instructions', '--skills', 'omax-chat', '--yes', '--offline']);
  assert.equal(none.status, 0);
  assert.ok(sb.files().includes('autre/omax-chat/SKILL.md'));
  assert.equal(sb.run(['--target', 'custom', '--dir', '/', '--dry-run', '--no-instructions']).status, 1);
  sb.clean();
});

test('Codex : AGENTS.override.md non vide reçoit le bloc à la place de AGENTS.md', () => {
  const sb = sandbox();
  mkdirSync(sb.path('.codex'), { recursive: true });
  writeFileSync(sb.path('.codex/AGENTS.override.md'), 'Règles prioritaires\n');
  const res = sb.run(['--target', 'codex', '--skills', 'omax-chat', '--yes', '--offline']);
  assert.equal(res.status, 0, res.stdout);
  assert.ok(readFileSync(sb.path('.codex/AGENTS.override.md'), 'utf8').includes(START));
  assert.ok(!existsSync(sb.path('.codex/AGENTS.md')));
  sb.clean();
});

test('--help et --version fonctionnent', () => {
  const sb = sandbox();
  assert.ok(sb.run(['--help']).stdout.includes('--dry-run'));
  assert.match(sb.run(['--version']).stdout.trim(), /^\d+\.\d+\.\d+$/);
  sb.clean();
});

test('les chemins écrits restent sous HOME', () => {
  const sb = sandbox();
  sb.run(['--target', 'opencode', '--yes', '--offline']);
  for (const f of sb.files()) assert.ok(!dirname(f).startsWith('..'));
  sb.clean();
});
