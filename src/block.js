// Rôle : construit, insère et retire le bloc d'instructions délimité par des marqueurs.
// Fonctions pures sur du texte : aucune lecture ni écriture de fichier ici.
// Dépend de : rien.

export const START = '<!-- open-claude-max:start -->';
export const END = '<!-- open-claude-max:end -->';

export function buildBlock(skills) {
  const lines = skills.map((s) => `- \`${s.name}\` : ${s.trigger}.`);
  return [
    START,
    '## Open Claude Max',
    '',
    "> Non affilié à Anthropic. Ce bloc ne donne accès à aucune fonctionnalité des plans Max, Pro ou Free et ne contourne aucune limite d'usage : ce sont des instructions pour l'agent, rien de plus.",
    '',
    "Ces skills sont installés. Utilise-les d'après la tâche, sans attendre de commande, et sans annoncer leur chargement :",
    '',
    ...lines,
    END,
  ].join('\n');
}

// Renvoie les positions du bloc, null s'il n'y en a pas, ou lève une erreur si les marqueurs sont incohérents.
function locate(text) {
  const s = text.indexOf(START);
  const e = text.indexOf(END);
  if (s === -1 && e === -1) return null;
  if (s === -1 || e === -1 || e < s || text.indexOf(START, s + 1) !== -1) {
    throw new Error('Marqueurs open-claude-max incohérents : corrige le fichier à la main avant de relancer.');
  }
  return { start: s, end: e + END.length };
}

export function hasBlock(text) {
  return locate(text) !== null;
}

export function upsertBlock(text, block) {
  const loc = locate(text);
  if (loc) return text.slice(0, loc.start) + block + text.slice(loc.end);
  const base = text.replace(/\s+$/, '');
  return (base ? `${base}\n\n` : '') + `${block}\n`;
}

export function removeBlock(text) {
  const loc = locate(text);
  if (!loc) return text;
  const before = text.slice(0, loc.start).replace(/\s+$/, '');
  const after = text.slice(loc.end).replace(/^\s+/, '');
  if (before && after) return `${before}\n\n${after}`;
  if (before) return `${before}\n`;
  return after;
}
