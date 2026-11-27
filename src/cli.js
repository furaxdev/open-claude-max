// Rôle : déroule l'assistant d'installation (cible, skills, liste des fichiers, confirmation, copie).
// Aucune écriture tant que l'utilisateur n'a pas confirmé (ou passé --yes). --dry-run n'écrit jamais.
// Dépend de : src/skills.js, src/targets.js, src/files.js, src/ui.js.
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, parse, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { applyInstall, applyUninstall, buildInstallPlan, buildUninstallPlan, describeOp } from './files.js';
import { DEFAULT_REF, SKILLS, downloadSkill, readBundledSkill, validateRef } from './skills.js';
import { TARGETS, TARGET_IDS, resolveTarget } from './targets.js';
import { createUi } from './ui.js';

const OPTIONS = {
  target: { type: 'string' },
  skills: { type: 'string' },
  dir: { type: 'string' },
  instructions: { type: 'string' },
  'no-instructions': { type: 'boolean' },
  yes: { type: 'boolean', short: 'y' },
  'dry-run': { type: 'boolean' },
  uninstall: { type: 'boolean' },
  offline: { type: 'boolean' },
  ref: { type: 'string' },
  help: { type: 'boolean', short: 'h' },
  version: { type: 'boolean', short: 'v' },
};

const HELP = `Open Claude Max : installe le pack de skills pour Claude Code, Codex ou OpenCode.

Utilisation
  npx @furaxdev/open-claude-max [options]

Options
  --target <id>        claude-code, codex, opencode ou custom
  --dir <dossier>      avec --target custom : dossier qui reçoit <skill>/SKILL.md
  --instructions <f>   avec --target custom : fichier d'instructions à compléter
  --no-instructions    n'ajoute aucun bloc d'instructions
  --skills <a,b>       skills à installer (par défaut : tous avec --yes ou --dry-run)
  --uninstall          retire les skills et le bloc d'instructions
  --dry-run            affiche les fichiers concernés sans rien écrire
  --yes, -y            passe la confirmation (scripts)
  --offline            utilise les copies embarquées au lieu de télécharger
  --ref <réf>          branche, tag ou commit à télécharger (défaut : ${DEFAULT_REF})
  --help, -h           affiche cette aide
  --version, -v        affiche la version

Sans option, l'assistant pose les questions. Rien n'est écrit sans confirmation.
Aucun appel réseau hors du dépôt GitHub officiel du projet.`;

class Cancelled extends Error {}

function expandPath(input, home) {
  const value = input.trim();
  const full = value === '~' || value.startsWith('~/') ? join(home, value.slice(1)) : value;
  const path = resolve(full);
  if (!value || path === parse(path).root || path === home) {
    throw new Error(`Dossier refusé : "${input}" (racine, dossier personnel ou chemin vide).`);
  }
  return path;
}

function parseSkillNames(list) {
  const names = list.split(',').map((s) => s.trim()).filter(Boolean);
  const unknown = names.filter((n) => !SKILLS.some((s) => s.name === n));
  if (unknown.length || !names.length) {
    throw new Error(`Skill inconnu : ${unknown.join(', ') || list}. Disponibles : ${SKILLS.map((s) => s.name).join(', ')}.`);
  }
  return SKILLS.filter((s) => names.includes(s.name));
}

async function askOrCancel(ui, question) {
  const answer = await ui.ask(question);
  if (answer === null) throw new Cancelled('Aucune réponse : annulé.');
  return answer.trim();
}

async function pickTarget(ui, opts) {
  if (opts.target) return opts.target;
  ui.println(ui.style.bold('Étape 1/3 : où installer ?'));
  const ids = [...TARGET_IDS, 'custom'];
  ids.forEach((id, i) => ui.println(`  ${i + 1}) ${id === 'custom' ? 'Autre dossier' : TARGETS[id].label}`));
  const answer = await askOrCancel(ui, `Choix [1-${ids.length}] : `);
  const chosen = ids[Number(answer) - 1] ?? (ids.includes(answer) ? answer : null);
  if (!chosen) throw new Error(`Choix invalide : "${answer}".`);
  return chosen;
}

async function pickSkills(ui, opts) {
  if (opts.skills) return parseSkillNames(opts.skills);
  if (opts.yes || opts['dry-run']) return SKILLS;
  ui.println(ui.style.bold('Étape 2/3 : quels skills ?'));
  SKILLS.forEach((s, i) => ui.println(`  ${i + 1}) ${s.name}`));
  const answer = await askOrCancel(ui, 'Numéros séparés par des virgules [Entrée = tous] : ');
  if (!answer) return SKILLS;
  const tokens = answer.split(',').map((t) => t.trim()).filter(Boolean);
  return parseSkillNames(tokens.map((t) => SKILLS[Number(t) - 1]?.name ?? t).join(','));
}

async function resolvePaths(ui, opts, ctx, targetId) {
  if (targetId !== 'custom') return resolveTarget(targetId, ctx);
  const dir = opts.dir ?? (await askOrCancel(ui, 'Dossier qui recevra <skill>/SKILL.md : '));
  let file = opts['no-instructions'] ? '' : opts.instructions;
  if (file === undefined) {
    file = await askOrCancel(ui, "Fichier d'instructions à compléter [Entrée = aucun] : ");
  }
  return {
    id: 'custom',
    label: 'Autre dossier',
    skillsDir: expandPath(dir, ctx.home),
    instructionsFile: file ? expandPath(file, ctx.home) : null,
    notes: [],
  };
}

function printPlan(ui, target, plan) {
  ui.println();
  ui.println(ui.style.bold(`Étape 3/3 : fichiers concernés (${target.label})`));
  for (const op of plan.ops) {
    const [verb, detail] = describeOp(plan, op);
    ui.println(`  ${ui.style.cyan(verb.padEnd(9))} ${detail}`);
  }
  for (const note of target.notes) ui.println(`  ${ui.style.yellow('à savoir')}  ${note}`);
  ui.println();
}

function printResults(ui, results) {
  for (const r of results) {
    const mark = r.status === 'déjà à jour' || r.status === 'ignoré' ? '=' : ui.style.green('✔');
    ui.println(`  ${mark} ${r.status.padEnd(14)} ${r.path}`);
    if (r.backup) ui.println(`    ${ui.style.yellow('sauvegarde')} ${r.backup}`);
  }
}

async function run(argv, ctx, ui) {
  let parsed;
  try {
    parsed = parseArgs({ args: argv, options: OPTIONS, allowPositionals: false, strict: true });
  } catch (err) {
    ui.println(`${ui.style.red('Erreur :')} ${err.message}\nVoir --help.`);
    return 2;
  }
  const opts = parsed.values;
  if (opts.help) {
    ui.println(HELP);
    return 0;
  }
  if (opts.version) {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    ui.println(pkg.version);
    return 0;
  }
  const ref = validateRef(opts.ref ?? DEFAULT_REF);

  ui.println(ui.style.bold('Open Claude Max') + ui.style.dim(' (non affilié à Anthropic, simples instructions pour l\'agent)'));
  ui.println();

  const targetId = await pickTarget(ui, opts);
  if (targetId !== 'custom' && !TARGETS[targetId]) {
    throw new Error(`Cible inconnue : "${targetId}". Choix : ${TARGET_IDS.join(', ')}, custom.`);
  }
  const target = await resolvePaths(ui, opts, ctx, targetId);
  const selected = await pickSkills(ui, opts);

  const uninstall = Boolean(opts.uninstall);
  const planArgs = { skillsDir: target.skillsDir, instructionsFile: target.instructionsFile, selected };
  const plan = uninstall ? await buildUninstallPlan(planArgs) : await buildInstallPlan(planArgs);
  printPlan(ui, target, plan);

  if (opts['dry-run']) {
    ui.println('Simulation (--dry-run) : aucun fichier écrit.');
    return 0;
  }
  if (!opts.yes) {
    const answer = (await askOrCancel(ui, 'Confirmer ? [o/N] : ')).toLowerCase();
    if (!['o', 'oui', 'y', 'yes'].includes(answer)) throw new Cancelled('Annulé.');
  }

  if (uninstall) {
    const results = await ui.spinner('Désinstallation', () => applyUninstall(plan));
    ui.println();
    printResults(ui, results);
    ui.println('\nTerminé. Les fichiers .bak éventuels sont conservés.');
    return 0;
  }

  // Tout est téléchargé et validé avant la première écriture.
  const contents = await ui.spinner(opts.offline ? 'Lecture des skills embarqués' : `Téléchargement des skills (${ref})`, async () => {
    const out = {};
    for (const op of plan.ops.filter((o) => o.type === 'skill')) {
      out[op.skill.name] = opts.offline
        ? await readBundledSkill(op.skill.name)
        : await downloadSkill(op.skill.name, { ref, fetchImpl: ctx.fetchImpl });
    }
    return out;
  });
  const results = await ui.spinner('Copie des fichiers', () => applyInstall(plan, contents));
  ui.println();
  printResults(ui, results);
  ui.println(`\nTerminé. Relance ${target.label === 'Autre dossier' ? "l'outil" : target.label} si les skills n'apparaissent pas.`);
  ui.println(`Pour retirer : npx @furaxdev/open-claude-max --uninstall --target ${target.id}`);
  return 0;
}

export async function main(argv, overrides = {}) {
  const ctx = {
    home: overrides.home ?? homedir(),
    env: overrides.env ?? process.env,
    fetchImpl: overrides.fetchImpl ?? fetch,
  };
  const ui = createUi({
    stdin: overrides.stdin ?? process.stdin,
    stdout: overrides.stdout ?? process.stdout,
    env: ctx.env,
  });
  try {
    return await run(argv, ctx, ui);
  } catch (err) {
    if (err instanceof Cancelled) {
      ui.println(`${err.message} Rien n'a été écrit.`);
    } else {
      ui.println(`${ui.style.red('Erreur :')} ${err.message}`);
    }
    return 1;
  } finally {
    ui.close();
  }
}
