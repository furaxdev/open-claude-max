// Tests des skills : front matter valide, descriptions en français, avertissement, téléchargement simulé.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { SKILLS, downloadSkill, parseFrontMatter, skillUrl, validateRef, validateSkillText } from '../src/skills.js';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const FRENCH_WORDS = ['le', 'la', 'les', 'de', 'des', 'du', 'un', 'une', 'et', 'ou', 'pour', 'dès', 'avec', 'sans'];

test('la liste du CLI correspond aux dossiers de skills/', () => {
  const dirs = readdirSync(new URL('skills/', root)).sort();
  assert.deepEqual(dirs, SKILLS.map((s) => s.name).sort());
});

for (const { name } of SKILLS) {
  test(`${name} : front matter valide et description française`, () => {
    const text = read(`skills/${name}/SKILL.md`);
    const fm = parseFrontMatter(text);
    assert.ok(fm, 'front matter présent');
    assert.equal(fm.name, name);
    assert.ok(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name) && fm.name.length <= 64, 'nom en kebab-case');
    assert.ok(fm.description.length >= 150 && fm.description.length <= 1024, `longueur ${fm.description.length}`);
    // YAML : un scalaire simple ne doit contenir ni ": " ni " #".
    assert.ok(!fm.description.includes(': ') && !fm.description.includes(' #'), 'YAML valide');
    const words = fm.description.toLowerCase().split(/[^a-zàâçéèêëîïôûùüœ'-]+/);
    const hits = FRENCH_WORDS.filter((w) => words.includes(w));
    assert.ok(hits.length >= 5, `description en français (${hits.join(',')})`);
    assert.doesNotThrow(() => validateSkillText(name, text));
  });
}

test("l'avertissement de non-affiliation est dans le README et le SKILL.md principal", () => {
  const warning = "Ce projet n'est pas affilié à Anthropic. Il ne donne accès à aucune fonctionnalité des plans Max, Pro ou Free, et ne contourne aucune limite d'usage. C'est un ensemble d'instructions et de méthodes pour Claude, rien de plus.";
  const readme = read('README.md');
  const core = read('skills/open-claude-max/SKILL.md');
  assert.ok(readme.includes(`> [!WARNING]\n> ${warning}`));
  assert.ok(core.includes(`> [!WARNING]\n> ${warning}`));
  const afterTitle = readme.split('\n').slice(0, 4).join('\n');
  assert.ok(afterTitle.includes('[!WARNING]'), 'juste après le titre du README');
  const presentation = core.split('## Présentation\n\n')[1];
  assert.ok(presentation.startsWith('> [!WARNING]'), 'première ligne de la présentation');
});

test('aucune commande slash de mode ne subsiste dans les skills', () => {
  for (const { name } of SKILLS) {
    assert.ok(!/`\/(code|chat|design|secu|verbose|silence)`/.test(read(`skills/${name}/SKILL.md`)), name);
  }
});

test("l'URL de téléchargement vise uniquement le dépôt officiel", () => {
  const url = new URL(skillUrl('omax-code', 'main'));
  assert.equal(url.host, 'raw.githubusercontent.com');
  assert.equal(url.pathname, '/furaxdev/open-claude-max/main/skills/omax-code/SKILL.md');
  assert.throws(() => validateRef('../../evil'), /invalide/);
  assert.throws(() => validateRef('main?x=1'), /invalide/);
});

test('downloadSkill refuse les redirections, les erreurs HTTP et les contenus invalides', async () => {
  const good = read('skills/omax-chat/SKILL.md');
  let seen;
  const ok = async (url, init) => ((seen = { url, init }), { ok: true, text: async () => good });
  assert.equal(await downloadSkill('omax-chat', { ref: 'v1', fetchImpl: ok }), good);
  assert.equal(seen.init.redirect, 'error');
  assert.ok(seen.url.includes('/v1/skills/omax-chat/SKILL.md'));

  const notFound = async () => ({ ok: false, status: 404 });
  await assert.rejects(downloadSkill('omax-chat', { fetchImpl: notFound }), /HTTP 404/);

  const wrongName = async () => ({ ok: true, text: async () => good.replace('name: omax-chat', 'name: autre') });
  await assert.rejects(downloadSkill('omax-chat', { fetchImpl: wrongName }), /champ name/);

  const html = async () => ({ ok: true, text: async () => '<html>pas un skill</html>' });
  await assert.rejects(downloadSkill('omax-chat', { fetchImpl: html }), /front matter/);
});

test('le message sans CLI contient exactement le bloc que le CLI ajoute', async () => {
  const { buildBlock } = await import('../src/block.js');
  const doc = read('docs/install-sans-cli.md');
  assert.ok(doc.includes(buildBlock(SKILLS)), 'bloc identique');
  for (const { name } of SKILLS) assert.ok(doc.includes(`/skills/${name}/SKILL.md`), name);
  assert.ok(doc.includes('attends ma confirmation explicite'));
  assert.ok(doc.includes('deuxième confirmation'));
});
