# Installer sans CLI

Pour les agents qui n'acceptent pas de commande (Claude cloud, Lovable, etc.), colle le message ci-dessous dans la conversation. Il décrit la même installation que le CLI, étape par étape, et oblige l'agent à demander ta confirmation avant d'écrire quoi que ce soit.

## Message à coller

```text
Je veux installer le pack de skills « Open Claude Max » (https://github.com/furaxdev/open-claude-max). Ce pack ne contient que des fichiers texte d'instructions. Suis ces étapes dans l'ordre.

ÉTAPE 0 - Avant toute écriture
Liste-moi tous les fichiers que tu vas créer ou modifier, avec leur chemin complet, puis attends ma confirmation explicite (« oui »). N'écris rien et ne lance aucune commande qui modifie des fichiers avant ma réponse.

ÉTAPE 1 - Récupérer les skills
Télécharge uniquement ces 5 fichiers en texte brut, sans rien exécuter :
- https://raw.githubusercontent.com/furaxdev/open-claude-max/main/skills/open-claude-max/SKILL.md
- https://raw.githubusercontent.com/furaxdev/open-claude-max/main/skills/omax-code/SKILL.md
- https://raw.githubusercontent.com/furaxdev/open-claude-max/main/skills/omax-security/SKILL.md
- https://raw.githubusercontent.com/furaxdev/open-claude-max/main/skills/omax-design/SKILL.md
- https://raw.githubusercontent.com/furaxdev/open-claude-max/main/skills/omax-chat/SKILL.md
Vérifie que chaque fichier commence par un front matter (ligne `---`) avec un champ `name:` égal au nom de son dossier et un champ `description:`. Sinon, arrête-toi et dis-le-moi.

ÉTAPE 2 - Copier les skills
Copie chaque fichier vers <dossier des skills>/<nom du skill>/SKILL.md, où <dossier des skills> est :
- Claude Code : ~/.claude/skills
- Codex : ~/.agents/skills
- OpenCode : ~/.config/opencode/skills
- Tout autre agent (Claude cloud, Lovable, etc.) : l'emplacement n'est pas vérifié. Demande-le-moi, ou dis-moi si l'outil n'accepte pas de fichiers de skills.
Si un fichier existe déjà, ne l'écrase pas : sauvegarde-le d'abord en SKILL.md.bak et dis-le-moi.

ÉTAPE 3 - Instructions de déclenchement (seulement après une deuxième confirmation)
Une fois les skills copiés, demande-moi une confirmation séparée avant de toucher au fichier d'instructions. Si je confirme, sauvegarde ce fichier en .bak, puis ajoute le bloc ci-dessous à la fin, sans modifier le reste :
- Claude Code : ~/.claude/CLAUDE.md
- Codex : ~/.codex/AGENTS.md (ou AGENTS.override.md s'il existe et n'est pas vide)
- OpenCode : ~/.config/opencode/AGENTS.md
- Tout autre agent : demande-moi quel fichier ou quel champ d'instructions personnalisées utiliser.
Si le bloc existe déjà entre ses marqueurs, remplace-le au lieu de le dupliquer.

<!-- open-claude-max:start -->
## Open Claude Max

> Non affilié à Anthropic. Ce bloc ne donne accès à aucune fonctionnalité des plans Max, Pro ou Free et ne contourne aucune limite d'usage : ce sont des instructions pour l'agent, rien de plus.

Ces skills sont installés. Utilise-les d'après la tâche, sans attendre de commande, et sans annoncer leur chargement :

- `open-claude-max` : toujours actif (réponses courtes et vérifiées, lisibilité, honnêteté, attribution conservée).
- `omax-code` : dès que la tâche touche à du code, à Git, à un build ou à un déploiement.
- `omax-security` : sur demande d'un audit ou d'une revue de sécurité, d'un scan de secrets ou de dépendances.
- `omax-design` : dès que la tâche touche à une interface, un composant, un thème ou une maquette.
- `omax-chat` : pour une question, une explication, une idée, un texte à écrire ou à corriger.
<!-- open-claude-max:end -->

ÉTAPE 4 - Rapport
Termine en listant les fichiers créés, modifiés et sauvegardés. Ne modifie rien d'autre.

Pour désinstaller plus tard : supprime les 5 dossiers de skills et le bloc entre les marqueurs.
```

## À savoir

- Le message télécharge depuis la branche `main`. Pour figer une version, remplace `main` par un tag (par exemple `v0.3.0`) dans les URL.
- Les emplacements de Claude Code, Codex et OpenCode viennent de leur documentation officielle (voir le README). Pour les autres agents, le message demande l'emplacement à l'utilisateur : rien n'est supposé.
- Le bloc de l'étape 3 est identique à celui que le CLI ajoute. Il est vérifié par les tests.
- Ce pack ne donne aucun accès à une fonctionnalité des plans Max, Pro ou Free : ce sont des fichiers d'instructions.
