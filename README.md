# Open Claude Max

> [!WARNING]
> Ce projet n'est pas affilié à Anthropic. Il ne donne accès à aucune fonctionnalité des plans Max, Pro ou Free, et ne contourne aucune limite d'usage. C'est un ensemble d'instructions et de méthodes pour Claude, rien de plus.

**Des méthodes de travail pour tirer le meilleur de Claude dans tes projets : code, chat et design.**

[![Licence](https://img.shields.io/github/license/furaxdev/open-claude-max)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.3.0-blue)](CHANGELOG.md)
[![Build](https://github.com/furaxdev/open-claude-max/actions/workflows/ci.yml/badge.svg)](https://github.com/furaxdev/open-claude-max/actions/workflows/ci.yml)
[![Étoiles GitHub](https://img.shields.io/github/stars/furaxdev/open-claude-max?style=social)](https://github.com/furaxdev/open-claude-max)

Open Claude Max est un pack de skills. Il n'y a ni mode, ni commande slash : Claude choisit lui-même les skills utiles d'après ta demande. Les skills n'ajoutent aucune capacité au modèle. Ils structurent le travail : lecture ciblée, petits changements testés, réponses courtes et vérifiées, rendu contrôlé avant livraison.

## Les skills

| Skill | Claude l'utilise quand tu demandes... | Ce qu'il apporte |
|---|---|---|
| [`open-claude-max`](skills/open-claude-max/SKILL.md) | Tout | Règles de base : silencieux par défaut, lisibilité, honnêteté, attribution conservée |
| [`omax-code`](skills/omax-code/SKILL.md) | Du code, Git, un déploiement | Lecture ciblée, plan court, tests, code minimal, commits conventionnels, revue avant PR, refactoring, migrations, scaffold, déploiement (Render, Vercel, Supabase, Docker) |
| [`omax-security`](skills/omax-security/SKILL.md) | Un audit de sécurité | Audit défensif uniquement : secrets, dépendances, code, auth, configuration. Rapport par gravité avec preuve, impact et correctif. Aucun exploit |
| [`omax-design`](skills/omax-design/SKILL.md) | Une interface, un thème | Direction artistique, hiérarchie, palette, contrastes WCAG, états, anti-patterns « AI slop », thèmes, vérification par capture |
| [`omax-chat`](skills/omax-chat/SKILL.md) | Une question, une idée, un texte | Réponses courtes, brainstorm, comparaisons, explications, relecture, faits vérifiés avec sources |

Les skills se combinent : une page de connexion peut déclencher `omax-code`, `omax-design` et `omax-security`.

## Installation

### Avec le CLI

```bash
npx @furaxdev/open-claude-max
```

L'assistant te pose trois questions, puis demande confirmation avant d'écrire quoi que ce soit :

1. **Où installer ?** Claude Code, Codex, OpenCode ou un autre dossier.
2. **Quels skills ?** Tous par défaut.
3. **Ces fichiers sont-ils corrects ?** La liste exacte des fichiers créés ou modifiés s'affiche, avec leurs chemins.

Ensuite il télécharge les skills depuis ce dépôt GitHub (spinner pendant l'opération) et affiche un résumé.

| Cible | Skills | Fichier d'instructions |
|---|---|---|
| Claude Code | `~/.claude/skills/<skill>/SKILL.md` | `~/.claude/CLAUDE.md` |
| Codex | `~/.agents/skills/<skill>/SKILL.md` | `~/.codex/AGENTS.md` (ou `AGENTS.override.md` s'il existe et n'est pas vide) |
| OpenCode | `~/.config/opencode/skills/<skill>/SKILL.md` | `~/.config/opencode/AGENTS.md` |
| Autre dossier | `<dossier>/<skill>/SKILL.md` | Celui que tu indiques, ou aucun |

Le CLI ajoute aussi un court bloc d'instructions de déclenchement dans le fichier d'instructions, entre `<!-- open-claude-max:start -->` et `<!-- open-claude-max:end -->`. Le reste du fichier n'est pas touché.

#### Options

| Option | Effet |
|---|---|
| `--target <id>` | `claude-code`, `codex`, `opencode` ou `custom` |
| `--dir <dossier>`, `--instructions <fichier>`, `--no-instructions` | Avec `--target custom` : dossier des skills et fichier d'instructions |
| `--skills a,b` | Skills à installer (tous par défaut avec `--yes` ou `--dry-run`) |
| `--dry-run` | Affiche les fichiers concernés sans rien écrire |
| `--yes`, `-y` | Passe la confirmation (scripts) |
| `--uninstall` | Retire les skills et le bloc d'instructions |
| `--offline` | Utilise les copies embarquées dans le paquet au lieu de télécharger |
| `--ref <réf>` | Branche, tag ou commit à télécharger (défaut : `main`) |

Exemples :

```bash
npx @furaxdev/open-claude-max --target claude-code --dry-run
npx @furaxdev/open-claude-max --target codex --skills omax-code,omax-chat --yes
npx @furaxdev/open-claude-max --target opencode --uninstall
```

#### Sécurité du CLI

- Aucun appel réseau hors de `raw.githubusercontent.com/furaxdev/open-claude-max`, sans redirection acceptée.
- Les fichiers téléchargés ne sont jamais exécutés : ce sont des fichiers texte, vérifiés (front matter, nom, taille) avant la première écriture.
- Aucune écriture sans réponse positive ou `--yes`. `--dry-run` n'écrit jamais.
- Un fichier existant n'est jamais écrasé sans copie `.bak` à côté, annoncée dans le résumé.
- Seuls les dossiers de l'outil choisi sont touchés (ou les chemins que tu fournis pour « Autre dossier »).

### Sans CLI

Pour les agents qui n'acceptent pas de commande (Claude cloud, Lovable, etc.), colle le message prêt à l'emploi de [`docs/install-sans-cli.md`](docs/install-sans-cli.md). Il demande à l'agent de lister les fichiers et d'attendre ta confirmation, puis de copier les skills et, après une seconde confirmation, d'ajouter le bloc d'instructions.

### À la main

```bash
git clone https://github.com/furaxdev/open-claude-max.git
mkdir -p ~/.claude/skills
cp -r open-claude-max/skills/* ~/.claude/skills/
```

## Utilisation

Demande normalement. Il n'y a rien à activer.

- **Code** : « Ajoute une route `GET /health` à mon API Express, avec un test. » Claude lit seulement le fichier de routes, écrit la route, lance le test, puis explique en un court paragraphe ce qui a changé et pourquoi.
- **Chat** : « Compare Supabase et Firebase pour une petite app de notes. » Claude répond avec un tableau de critères et une recommandation nette.
- **Design** : « Page d'accueil pour un atelier de reliure, ton chaleureux, thème papier/carnet. » Claude définit la direction artistique, puis une palette restreinte en variables de style, puis vérifie le rendu à 360, 768 et 1280 px.
- **Sécurité** : « Audite le dossier `api/`. » Claude vérifie secrets, dépendances et code, puis rend un rapport par gravité. Il n'écrit jamais d'exploit.

Pour forcer un skill, nomme-le dans ton message (par exemple « utilise omax-security »).

## Ce qui est certain, ce qui ne l'est pas

Les emplacements du tableau viennent de la documentation officielle de chaque outil, lue le 27 novembre 2026. Quelques points ne sont pas précisés par ces documentations, et le CLI ne les devine pas :

- **Claude Code** : la variable `CLAUDE_CONFIG_DIR` déplace les réglages et l'historique, mais la documentation ne dit pas si elle déplace aussi les skills et `CLAUDE.md`. Le CLI reste sous `~/.claude` et prévient si la variable est définie.
- **Codex** : `CODEX_HOME` déplace `AGENTS.md` (le CLI le suit). La documentation ne dit pas s'il déplace les skills : ils restent dans `~/.agents/skills`.
- **OpenCode** : `XDG_CONFIG_HOME` n'est pas mentionné dans la documentation. Le CLI reste sous `~/.config/opencode`. OpenCode lit aussi `~/.claude/skills` : n'installe pas les mêmes skills dans les deux dossiers si tu utilises les deux outils.
- **Autres agents** (Claude cloud, Lovable, etc.) : aucun emplacement n'est vérifié. Le message sans CLI demande le chemin à l'utilisateur.
- Les limites de longueur des champs `name` et `description` ne sont pas fixées par ces documentations. Les tests appliquent une borne prudente de 1024 caractères.

## Limites

- **Les skills ne changent pas le modèle.** Ils structurent le travail, ils ne rendent pas Claude plus intelligent ni plus fiable.
- **Aucune capacité ajoutée.** Si Claude ne peut pas lancer un outil dans ton environnement, un skill ne le lui donne pas.
- **Aucun effet sur les plans ni sur les limites d'usage.** Rien ici ne change ton quota, ton coût ou l'accès à une fonctionnalité.
- **Le déclenchement automatique n'est pas garanti.** Claude décide de charger un skill d'après sa description. Il peut en oublier un : le nommer dans ton message règle le problème.
- **Pas de remplacement de la relecture humaine.** Tests, audits et rendus restent à vérifier par toi.
- **Le skill de sécurité n'est pas un audit professionnel.** Il repère les points évidents, il ne prouve pas l'absence de failles.

## Documentation

- [`ARCHITECTURE.md`](ARCHITECTURE.md) : structure du dépôt, flux d'une demande, fonctionnement du CLI.
- [`docs/install-sans-cli.md`](docs/install-sans-cli.md) : message à coller pour les agents sans CLI.
- [`CHANGELOG.md`](CHANGELOG.md) : historique des versions.

## Contribuer

Les contributions sont bienvenues. Lis [`ARCHITECTURE.md`](ARCHITECTURE.md), lance `npm test`, et ouvre une issue avant un changement important. Chaque changement visible va dans `CHANGELOG.md`.

## Licence

[MIT](LICENSE)
