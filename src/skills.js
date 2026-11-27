// Rôle : liste des skills du pack, lecture des copies embarquées et téléchargement
// depuis le dépôt GitHub officiel. Ne fait que lire et valider du texte : rien n'est exécuté.
// Dépend de : node:fs/promises, node:url.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const REPO = 'furaxdev/open-claude-max';
export const DEFAULT_REF = 'main';

const RAW_HOST = 'raw.githubusercontent.com';
const MAX_CHARS = 100_000;
const TIMEOUT_MS = 15_000;

// `trigger` alimente le bloc d'instructions ajouté dans le fichier de la cible.
export const SKILLS = [
  {
    name: 'open-claude-max',
    trigger: 'toujours actif (réponses courtes et vérifiées, lisibilité, honnêteté, attribution conservée)',
  },
  {
    name: 'omax-code',
    trigger: 'dès que la tâche touche à du code, à Git, à un build ou à un déploiement',
  },
  {
    name: 'omax-security',
    trigger: "sur demande d'un audit ou d'une revue de sécurité, d'un scan de secrets ou de dépendances",
  },
  {
    name: 'omax-design',
    trigger: 'dès que la tâche touche à une interface, un composant, un thème ou une maquette',
  },
  {
    name: 'omax-chat',
    trigger: 'pour une question, une explication, une idée, un texte à écrire ou à corriger',
  },
];

export function validateRef(ref) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]{0,100}$/.test(ref) || ref.includes('..')) {
    throw new Error(`Référence Git invalide : "${ref}".`);
  }
  return ref;
}

export function skillUrl(name, ref) {
  return `https://${RAW_HOST}/${REPO}/${validateRef(ref)}/skills/${name}/SKILL.md`;
}

// Lit le front matter (valeurs sur une seule ligne) ou renvoie null s'il est absent.
export function parseFrontMatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2];
  }
  return data;
}

export function validateSkillText(name, text) {
  if (text.length > MAX_CHARS) throw new Error(`${name} : fichier trop gros.`);
  if (text.includes('\0')) throw new Error(`${name} : contenu binaire refusé.`);
  const fm = parseFrontMatter(text);
  if (!fm) throw new Error(`${name} : front matter absent.`);
  if (fm.name !== name) throw new Error(`${name} : le champ name vaut "${fm.name}".`);
  if (!fm.description) throw new Error(`${name} : description absente.`);
  return text;
}

export async function downloadSkill(name, { ref = DEFAULT_REF, fetchImpl = fetch } = {}) {
  const url = skillUrl(name, ref);
  const res = await fetchImpl(url, {
    redirect: 'error', // jamais de redirection vers un autre hôte
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'user-agent': 'open-claude-max-cli' },
  });
  if (!res.ok) throw new Error(`Téléchargement impossible (HTTP ${res.status}) : ${url}`);
  return validateSkillText(name, await res.text());
}

export async function readBundledSkill(name) {
  const path = fileURLToPath(new URL(`../skills/${name}/SKILL.md`, import.meta.url));
  return validateSkillText(name, await readFile(path, 'utf8'));
}
