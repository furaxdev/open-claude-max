# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the versioning follows [SemVer](https://semver.org/).

## [Unreleased]

## [0.2.0] - 2026-11-27

Full rewrite.

### Changed

- The single skill with four modes is replaced by five skills that Claude selects on its own from their descriptions: `open-claude-max`, `omax-code`, `omax-security`, `omax-design`, `omax-chat`.
- `README.md` is now in English.
- The CI workflow checks the front matter of every skill.

### Removed

- Modes and the `/code`, `/chat`, `/design`, `/secu`, `/verbose`, `/silence` commands. Detail on demand is now asked in plain words.
- The `docs/` folder: each skill now holds its own short instructions.

## [0.1.0] - 2026-11-27

### Added

- First version: one skill with four modes and the `docs/` guides.

[Unreleased]: https://github.com/furaxdev/open-claude-max/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/furaxdev/open-claude-max/compare/1e931d5...HEAD
[0.1.0]: https://github.com/furaxdev/open-claude-max/commit/fbd6f31
