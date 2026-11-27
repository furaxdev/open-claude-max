# Open Claude Max

> [!WARNING]
> Ce projet n'est pas affilié à Anthropic. Il ne donne accès à aucune fonctionnalité des plans Max, Pro ou Free, et ne contourne aucune limite d'usage. C'est un ensemble d'instructions et de méthodes pour Claude, rien de plus.

**Des méthodes de travail pour tirer le meilleur de Claude dans tes projets : code, chat et design.**

[![Licence](https://img.shields.io/github/license/furaxdev/open-claude-max)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-blue)](CHANGELOG.md)
[![Build](https://github.com/furaxdev/open-claude-max/actions/workflows/ci.yml/badge.svg)](https://github.com/furaxdev/open-claude-max/actions/workflows/ci.yml)
[![Étoiles GitHub](https://img.shields.io/github/stars/furaxdev/open-claude-max?style=social)](https://github.com/furaxdev/open-claude-max)

Open Claude Max est un skill polyvalent. Il structure la façon dont Claude travaille : lecture ciblée, petits changements testés, réponses proportionnées, rendu vérifié. Il ne rend pas le modèle plus puissant et n'ajoute aucune capacité.

## Modes

| Commande | Mode | Ce que ça change |
|---|---|---|
| `/code` | Code | Lecture ciblée, plan court, tests après chaque bloc, code minimal, commits conventionnels, déploiement guidé |
| `/chat` | Chat | Réponses courtes par défaut, brainstorm, comparaisons, explications par analogie, relecture, sources citées |
| `/design` | Design | Direction artistique d'abord, palette restreinte, contrastes WCAG, états soignés, rendu vérifié par capture |
| `/secu` | Sécurité | Audit défensif uniquement : secrets, dépendances, code, auth, configuration, rapport classé par gravité |

Le mode se choisit automatiquement d'après ta demande. Une commande le force. `/verbose` affiche les étapes, `/silence` revient au mode par défaut.

Tous les modes respectent les mêmes règles de lisibilité : nommage clair, code court, commentaires qui expliquent le pourquoi, et un court paragraphe après chaque changement.

## Installation

### Copie du dossier

Copie le dossier du projet dans le dossier `skills` de ton environnement Claude :

```bash
git clone https://github.com/furaxdev/open-claude-max.git
cp -r open-claude-max ~/.claude/skills/open-claude-max
```

Le skill est reconnu grâce au fichier `SKILL.md` à la racine du dossier.

### Via un plugin

Si ton environnement gère les plugins, ajoute ce dépôt comme source de plugin. La procédure exacte dépend de ton outil : consulte sa documentation.

## Exemples d'utilisation

### `/code`

> Ajoute une route `GET /health` à mon API Express, avec un test.

Claude lit uniquement le fichier de routes, écrit la route, lance le test, puis ajoute un paragraphe : ce qui a changé et pourquoi.

### `/chat`

> Compare Supabase et Firebase pour une petite app de notes. Réponse courte.

Claude répond avec un tableau de critères et une recommandation nette, sans trois pages d'introduction.

### `/design`

> /design Page d'accueil pour un atelier de reliure, ton chaleureux, thème papier/carnet.

Claude définit d'abord la direction artistique, puis une palette restreinte en variables CSS, puis vérifie le rendu à 360, 768 et 1280 px.

### `/secu`

> /secu Audite le dossier `api/` de mon projet.

Claude parcourt les secrets, les dépendances, puis le code. Il rend un rapport classé par gravité, avec pour chaque point la preuve, l'impact et le correctif. Il n'écrit aucun exploit.

## Documentation

- [`SKILL.md`](SKILL.md) : instructions principales.
- [`docs/code.md`](docs/code.md), [`docs/chat.md`](docs/chat.md), [`docs/design.md`](docs/design.md), [`docs/securite.md`](docs/securite.md) : guides par mode.
- [`ARCHITECTURE.md`](ARCHITECTURE.md) : structure du skill et flux d'une demande.
- [`CHANGELOG.md`](CHANGELOG.md) : historique des versions.

## Limites

- **Le skill ne change pas le modèle.** Il structure le travail : il ne rend pas Claude plus intelligent ni plus fiable.
- **Aucune capacité ajoutée.** Si Claude ne peut pas lancer un outil dans ton environnement, le skill ne le lui donne pas.
- **Aucun effet sur les plans ni les limites d'usage.** Le skill peut réduire les étapes inutiles, mais il ne modifie ni le quota, ni le coût, ni l'accès à une fonctionnalité.
- **Pas un remplacement de la revue humaine.** Les tests, les audits et les rendus restent à vérifier par toi.
- **Le mode sécurité ne remplace pas un audit professionnel.** Il aide à trouver les points évidents ; il ne garantit pas l'absence de failles.
- **Les méthodes peuvent être imparfaites.** Ce sont des consignes écrites, pas des garanties.

## Contribuer

Les contributions sont bienvenues. Lis [`ARCHITECTURE.md`](ARCHITECTURE.md) pour le fonctionnement, puis ouvre une issue avant une modification importante. Chaque changement visible va dans `CHANGELOG.md`.

## Licence

[MIT](LICENSE)
