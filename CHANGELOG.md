# Changelog

Toutes les modifications notables de ce projet sont documentées ici.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le versionnage suit [SemVer](https://semver.org/lang/fr/).

## [Unreleased]

## [0.3.0] - 2026-11-27

### Ajouté

- CLI `open-claude-max` (paquet npm `@furaxdev/open-claude-max`, sans dépendance) : choix de la cible, choix des skills, liste exacte des fichiers, confirmation, téléchargement avec spinner, résumé.
- Cibles : Claude Code, Codex, OpenCode, autre dossier.
- Options `--dry-run`, `--yes`, `--uninstall`, `--offline`, `--ref`, `--skills`.
- Sauvegarde `.bak` de tout fichier existant avant remplacement ou modification.
- Bloc d'instructions de déclenchement entre `<!-- open-claude-max:start -->` et `<!-- open-claude-max:end -->`, retirable avec `--uninstall`.
- `docs/install-sans-cli.md` : message à coller pour les agents sans CLI (confirmation demandée avant toute écriture).
- Tests `node:test` (bloc, skills, CLI) et exécution dans la CI.

### Modifié

- Le README repasse en français.
- Descriptions des skills réécrites en français avec les mots-clés de l'utilisateur. Les anciennes descriptions contenaient `: ` et n'étaient pas du YAML valide.

### Informations non confirmées par les documentations officielles

- Claude Code : `CLAUDE_CONFIG_DIR` déplace-t-il les skills et `CLAUDE.md` ? Non précisé. Le CLI reste sous `~/.claude`.
- Codex : `CODEX_HOME` déplace-t-il les skills ? Non précisé. Les skills restent dans `~/.agents/skills`. `AGENTS.md` suit `CODEX_HOME`.
- OpenCode : prise en compte de `XDG_CONFIG_HOME` ? Non mentionnée. Le CLI reste sous `~/.config/opencode`.
- Limites de longueur de `name` et `description` : non fixées. Les tests appliquent 1024 caractères pour `description`.
- Autres agents (Claude cloud, Lovable, etc.) : aucun emplacement vérifié.
- Les pages de documentation ont été lues par extraction automatique le 2026-11-27 : à revérifier avant chaque release.

## [0.2.0] - 2026-11-27

Réécriture : le skill unique à modes est remplacé par cinq skills sélectionnés par Claude d'après leur description (`open-claude-max`, `omax-code`, `omax-security`, `omax-design`, `omax-chat`). Suppression des commandes `/code`, `/chat`, `/design`, `/secu`, `/verbose` et `/silence`, et du dossier `docs/` d'alors. Non publiée.

## [0.1.0] - 2026-11-27

### Ajouté

- Première version : un skill avec quatre modes et des guides dans `docs/`.

[Unreleased]: https://github.com/furaxdev/open-claude-max/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/furaxdev/open-claude-max/compare/1e931d5...HEAD
[0.1.0]: https://github.com/furaxdev/open-claude-max/commit/fbd6f31
