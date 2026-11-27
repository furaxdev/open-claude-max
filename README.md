# Open Claude Max

> [!WARNING]
> This project is not affiliated with Anthropic. It does not unlock any feature of the Max, Pro or Free plans, and it does not bypass any usage limit. It is a set of instructions and working methods for Claude, nothing more.

**Working methods to get the best out of Claude in your projects: code, chat and design.**

[![License](https://img.shields.io/github/license/furaxdev/open-claude-max)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.2.0-blue)](CHANGELOG.md)
[![Build](https://github.com/furaxdev/open-claude-max/actions/workflows/ci.yml/badge.svg)](https://github.com/furaxdev/open-claude-max/actions/workflows/ci.yml)
[![GitHub stars](https://img.shields.io/github/stars/furaxdev/open-claude-max?style=social)](https://github.com/furaxdev/open-claude-max)

Open Claude Max is a small pack of Claude skills. There are no modes and no slash commands: Claude picks the relevant skills on its own, based on what you ask. The skills do not add any capability to the model. They structure how the work is done: targeted reading, small tested changes, short verified answers, a rendered check before delivery.

## Skills

| Skill | Claude uses it when you ask for... | What it does |
|---|---|---|
| [`open-claude-max`](skills/open-claude-max/SKILL.md) | Anything | Base rules: short answers, readable code, honesty, attribution kept in commits and PRs |
| [`omax-code`](skills/omax-code/SKILL.md) | Code, Git, builds, deployment | Targeted file reading, short plan, small tested blocks, minimal code, conventional commits, review before PR, guided refactoring, migrations, scaffolds, deployment (Render, Vercel, Supabase, Docker) |
| [`omax-security`](skills/omax-security/SKILL.md) | A security audit or review | Defensive audit only: secrets, dependencies, injections, XSS, SSRF, path traversal, auth, configuration. Report sorted by severity, with proof, impact and fix |
| [`omax-design`](skills/omax-design/SKILL.md) | Interfaces, themes, mockups | Art direction first, restrained palette, WCAG contrast, states, responsive, switchable themes, screenshot check |
| [`omax-chat`](skills/omax-chat/SKILL.md) | Questions, ideas, texts | Short answers by default, brainstorming, comparisons, analogies, proofreading, fact-checking with sources |

Skills can combine: a request to build a login page can use `omax-code`, `omax-design` and `omax-security` together.

## Installation

Clone the repository and copy the skill folders into your Claude skills folder:

```bash
git clone https://github.com/furaxdev/open-claude-max.git
mkdir -p ~/.claude/skills
cp -r open-claude-max/skills/* ~/.claude/skills/
```

Each folder in `skills/` is a complete skill, recognized by its `SKILL.md`. You can copy only the ones you want. If your environment supports plugins, add this repository as a plugin source: check your tool's documentation for the exact steps.

The skill text is written in French, and Claude answers in French by default. Edit the "Langue" rule in `skills/open-claude-max/SKILL.md` to change it.

## Usage

Ask normally. Nothing to switch on.

- **Code**: "Add a `GET /health` route to my Express API, with a test." Claude reads only the routes file, writes the route, runs the test, then explains in a short paragraph what changed and why.
- **Chat**: "Compare Supabase and Firebase for a small notes app." Claude answers with a criteria table and a clear recommendation.
- **Design**: "Landing page for a bookbinding workshop, warm tone, paper/notebook theme." Claude defines the art direction first, then a restrained palette as style variables, then checks the render at 360, 768 and 1280 px.
- **Security**: "Audit the `api/` folder." Claude checks secrets, dependencies and code, then returns a report sorted by severity. It never writes an exploit.

To force a skill, name it in your message (for example "use omax-security").

## Documentation

- [`ARCHITECTURE.md`](ARCHITECTURE.md): structure of the pack and how a request flows through it.
- [`CHANGELOG.md`](CHANGELOG.md): version history.

## Limits

- **The skills do not change the model.** They structure the work: they do not make Claude smarter or more reliable.
- **No capability is added.** If Claude cannot run a tool in your environment, a skill does not give it that tool.
- **No effect on plans or usage limits.** Nothing here changes your quota, your cost or your access to any feature.
- **Automatic selection is not guaranteed.** Claude decides when to load a skill from its description. It can miss one; naming the skill in your message fixes that.
- **Not a replacement for human review.** Tests, audits and renders still need your check.
- **The security skill is not a professional audit.** It finds the obvious issues. It does not prove that a project is free of flaws.

## Contributing

Contributions are welcome. Read [`ARCHITECTURE.md`](ARCHITECTURE.md) first, then open an issue before any large change. Every visible change goes in `CHANGELOG.md`.

## License

[MIT](LICENSE)
