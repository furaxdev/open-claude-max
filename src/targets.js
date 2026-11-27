// Rôle : emplacements des skills et du fichier d'instructions pour chaque outil pris en charge.
// Chaque chemin vient de la documentation officielle de l'outil (voir `docs` et le README).
// Ce qu'elle ne précise pas est signalé dans `notes` au lieu d'être deviné.
// Dépend de : node:fs, node:path.
import { statSync } from 'node:fs';
import { join } from 'node:path';

function nonEmptyFile(path) {
  try {
    return statSync(path).size > 0;
  } catch {
    return false;
  }
}

export const TARGETS = {
  'claude-code': {
    label: 'Claude Code',
    docs: ['https://code.claude.com/docs/en/skills', 'https://code.claude.com/docs/en/memory'],
    resolve({ home, env }) {
      const notes = [];
      if (env.CLAUDE_CONFIG_DIR) {
        notes.push(
          'CLAUDE_CONFIG_DIR est défini : la documentation ne dit pas s\'il déplace les skills et CLAUDE.md. Les chemins ci-dessous restent sous ~/.claude.',
        );
      }
      return {
        skillsDir: join(home, '.claude', 'skills'),
        instructionsFile: join(home, '.claude', 'CLAUDE.md'),
        notes,
      };
    },
  },
  codex: {
    label: 'Codex',
    docs: [
      'https://learn.chatgpt.com/docs/build-skills',
      'https://learn.chatgpt.com/docs/agent-configuration/agents-md',
    ],
    resolve({ home, env }) {
      const notes = [];
      const codexHome = env.CODEX_HOME || join(home, '.codex');
      const override = join(codexHome, 'AGENTS.override.md');
      let instructionsFile = join(codexHome, 'AGENTS.md');
      if (nonEmptyFile(override)) {
        // Codex ne lit que le premier fichier non vide à ce niveau.
        instructionsFile = override;
        notes.push('AGENTS.override.md existe : Codex ignore AGENTS.md à ce niveau, le bloc y est donc ajouté.');
      }
      if (env.CODEX_HOME) {
        notes.push(
          "CODEX_HOME déplace AGENTS.md. La documentation ne dit pas s'il déplace les skills : ils restent dans ~/.agents/skills.",
        );
      }
      return { skillsDir: join(home, '.agents', 'skills'), instructionsFile, notes };
    },
  },
  opencode: {
    label: 'OpenCode',
    docs: ['https://opencode.ai/docs/skills/', 'https://opencode.ai/docs/rules/'],
    resolve({ home, env }) {
      const notes = [];
      if (env.XDG_CONFIG_HOME) {
        notes.push('XDG_CONFIG_HOME est défini : la documentation ne le mentionne pas. Le chemin reste ~/.config/opencode.');
      }
      const base = join(home, '.config', 'opencode');
      return { skillsDir: join(base, 'skills'), instructionsFile: join(base, 'AGENTS.md'), notes };
    },
  },
};

export const TARGET_IDS = Object.keys(TARGETS);

export function resolveTarget(id, ctx) {
  const target = TARGETS[id];
  if (!target) throw new Error(`Cible inconnue : "${id}". Choix : ${TARGET_IDS.join(', ')}, custom.`);
  return { id, label: target.label, ...target.resolve(ctx) };
}
