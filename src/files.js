// Rôle : prépare puis applique l'installation ou la désinstallation (skills + bloc d'instructions).
// Règle : un fichier existant n'est jamais écrasé sans copie `.bak` ; rien n'est écrit hors des chemins du plan.
// Dépend de : src/skills.js, src/block.js, node:fs/promises.
import { copyFile, mkdir, readFile, rm, rmdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { SKILLS } from './skills.js';
import { buildBlock, hasBlock, removeBlock, upsertBlock } from './block.js';

const skillPath = (dir, name) => join(dir, name, 'SKILL.md');

async function readIfExists(path) {
  try {
    return await readFile(path, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

// Un SKILL.md est "à nous" si son front matter porte le bon nom.
async function isOurSkill(path, name) {
  const text = await readIfExists(path);
  return text !== null && new RegExp(`^name: ${name}\\s*$`, 'm').test(text.slice(0, 2000));
}

async function installedSkills(skillsDir) {
  const found = [];
  for (const skill of SKILLS) {
    if (await isOurSkill(skillPath(skillsDir, skill.name), skill.name)) found.push(skill);
  }
  return found;
}

async function backupFile(path) {
  let candidate = `${path}.bak`;
  for (let i = 1; await readIfExists(candidate) !== null; i += 1) candidate = `${path}.bak.${i}`;
  await copyFile(path, candidate);
  return candidate;
}

async function writeWithBackup(path, previous, next) {
  const backup = previous === null ? null : await backupFile(path);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, next);
  return backup;
}

export async function buildInstallPlan({ skillsDir, instructionsFile, selected }) {
  const ops = [];
  for (const skill of selected) {
    const path = skillPath(skillsDir, skill.name);
    ops.push({ type: 'skill', skill, path, exists: (await readIfExists(path)) !== null });
  }
  const installed = await installedSkills(skillsDir);
  const blockSkills = SKILLS.filter((s) => selected.includes(s) || installed.includes(s));
  if (instructionsFile) {
    const text = await readIfExists(instructionsFile);
    ops.push({
      type: 'instructions',
      path: instructionsFile,
      exists: text !== null,
      hasBlock: text !== null && hasBlock(text),
    });
  }
  return { mode: 'install', ops, blockSkills };
}

export async function buildUninstallPlan({ skillsDir, instructionsFile, selected }) {
  const ops = [];
  for (const skill of selected) {
    const path = skillPath(skillsDir, skill.name);
    ops.push({ type: 'skill', skill, path, ours: await isOurSkill(path, skill.name) });
  }
  const installed = await installedSkills(skillsDir);
  const blockSkills = installed.filter((s) => !selected.includes(s));
  if (instructionsFile) {
    const text = await readIfExists(instructionsFile);
    ops.push({ type: 'instructions', path: instructionsFile, hasBlock: text !== null && hasBlock(text) });
  }
  return { mode: 'uninstall', ops, blockSkills };
}

// Renvoie [verbe, détail] pour l'affichage de la liste des fichiers concernés.
export function describeOp(plan, op) {
  if (plan.mode === 'install') {
    if (op.type === 'skill') {
      return op.exists
        ? ['remplacer', `${op.path}  (ancien fichier sauvegardé en .bak)`]
        : ['créer', op.path];
    }
    if (!op.exists) return ['créer', `${op.path}  (bloc open-claude-max)`];
    return op.hasBlock
      ? ['modifier', `${op.path}  (bloc mis à jour, fichier sauvegardé en .bak)`]
      : ['modifier', `${op.path}  (bloc ajouté à la fin, fichier sauvegardé en .bak)`];
  }
  if (op.type === 'skill') {
    return op.ours
      ? ['supprimer', op.path]
      : ['ignorer', `${op.path}  (absent ou non installé par open-claude-max)`];
  }
  if (!op.hasBlock) return ['ignorer', `${op.path}  (aucun bloc open-claude-max)`];
  return plan.blockSkills.length
    ? ['modifier', `${op.path}  (bloc mis à jour, fichier sauvegardé en .bak)`]
    : ['modifier', `${op.path}  (bloc retiré, fichier sauvegardé en .bak, supprimé s'il devient vide)`];
}

export async function applyInstall(plan, contents) {
  const results = [];
  for (const op of plan.ops) {
    const previous = await readIfExists(op.path);
    const next =
      op.type === 'skill'
        ? contents[op.skill.name]
        : upsertBlock(previous ?? '', buildBlock(plan.blockSkills));
    if (previous === next) {
      results.push({ path: op.path, status: 'déjà à jour' });
      continue;
    }
    const backup = await writeWithBackup(op.path, previous, next);
    results.push({ path: op.path, status: previous === null ? 'créé' : 'modifié', backup });
  }
  return results;
}

export async function applyUninstall(plan) {
  const results = [];
  for (const op of plan.ops) {
    if (op.type === 'skill') {
      if (!op.ours) {
        results.push({ path: op.path, status: 'ignoré' });
        continue;
      }
      await rm(op.path);
      await rmdir(dirname(op.path)).catch(() => {}); // le dossier reste s'il contient autre chose
      results.push({ path: op.path, status: 'supprimé' });
      continue;
    }
    if (!op.hasBlock) {
      results.push({ path: op.path, status: 'ignoré' });
      continue;
    }
    const previous = await readIfExists(op.path);
    const next = plan.blockSkills.length
      ? upsertBlock(previous, buildBlock(plan.blockSkills))
      : removeBlock(previous);
    const backup = await backupFile(op.path);
    if (next.trim() === '') {
      await rm(op.path);
      results.push({ path: op.path, status: 'supprimé (vide)', backup });
    } else {
      await writeFile(op.path, next);
      results.push({ path: op.path, status: 'modifié', backup });
    }
  }
  return results;
}
