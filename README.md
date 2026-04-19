<div align="center">

# pi-package-search

**Search npm for installable Pi packages, then install the right one without leaving Pi.**

<p>
  <a href="https://github.com/forjd/pi-package-search/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/forjd/pi-package-search/actions/workflows/ci.yml/badge.svg?branch=main"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
  <a href="package.json"><img alt="Node >= 20.6" src="https://img.shields.io/badge/node-%3E%3D20.6-339933?logo=node.js&logoColor=white"></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white"></a>
</p>

<p>
  <a href="https://biomejs.dev/"><img alt="Biome" src="https://img.shields.io/badge/Biome-60A5FA?logo=biome&logoColor=white"></a>
  <a href="https://vitest.dev/"><img alt="Vitest" src="https://img.shields.io/badge/tested%20with-Vitest-6E9F18?logo=vitest&logoColor=white"></a>
  <a href="https://github.com/forjd/pi-package-search/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/forjd/pi-package-search"></a>
  <a href="https://github.com/forjd/pi-package-search/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/forjd/pi-package-search"></a>
</p>

</div>

`pi-package-search` adds package discovery to Pi with two tools and a matching skill:

- `search_pi_packages` searches npm for packages tagged with `pi-package`
- `install_pi_package` installs the package the user chooses
- `/skill:pi-package-search` guides Pi to use the right workflow

It uses the same npm registry search endpoint behind the Pi package gallery, then formats results as ready-to-run `pi install` commands.

## Why this exists

Discovering Pi packages is easier when Pi can do the searching for you.

This package helps Pi:

- find relevant packages from npm
- stay focused on packages intended for Pi
- return short descriptions with copy-pasteable install commands
- install a selected package in global or project scope

## What's included

| Component | Name | Purpose |
| --- | --- | --- |
| Tool | `search_pi_packages` | Search npm for packages tagged with `pi-package` |
| Tool | `install_pi_package` | Run `pi install` for a chosen package |
| Skill | `/skill:pi-package-search` | Prompt Pi to use the package discovery workflow |

## Install

### From a local checkout

```bash
pi install /absolute/path/to/pi-package-search
```

### From npm

```bash
pi install npm:pi-package-search
```

> [!NOTE]
> Use the npm form after the package has been published.

## Usage

### Ask Pi naturally

- `Find pi packages for session search`
- `Search for pi packages related to browser automation`
- `Show me pi packages for git workflows`

### Or invoke the skill directly

```text
/skill:pi-package-search browser automation
```

### Example result

```text
Found 3 pi packages for "browser automation"

1. @scope/package-name@1.2.3
   Short description here.
   Install: pi install npm:@scope/package-name
   npm: https://www.npmjs.com/package/@scope/package-name
```

If the user already knows what they want, `install_pi_package` can install it directly:

- global scope: `pi install npm:@scope/package-name`
- project scope: `pi install -l npm:@scope/package-name`

## How it works

`search_pi_packages` calls the npm registry search API and automatically adds the `keywords:pi-package` filter.

Each result is normalized into:

- package name and version
- short description
- npm package URL
- homepage URL when available
- a copy-pasteable `pi install` command

`install_pi_package` accepts either:

- a bare package name like `@scope/pkg`
- a full npm source like `npm:@scope/pkg@1.2.3`

## Development

```bash
npm install
npm run check
```

Useful commands:

```bash
npm run test
npm run lint
npm run format
npm run typecheck
npm run e2e
npm run publish:dry-run
```

## Project structure

```text
extensions/index.ts          # Registers the tools with Pi
src/search-pi-packages.ts    # npm search client + result formatting
src/install-pi-package.ts    # pi install wrapper
skills/pi-package-search/    # matching discovery skill
tests/                       # Vitest coverage for tools and extension wiring
```

## E2E smoke test

Run the real Pi flow locally with your configured Pi model credentials:

```bash
npm run e2e
```

What it does:

1. creates a temporary git repo
2. installs this package into that repo
3. runs `/skill:pi-package-search session search`
4. verifies `search_pi_packages` was called
5. runs `Install @kaiserlich-dev/pi-session-search in this project.`
6. verifies `install_pi_package` was called and updated `.pi/settings.json`

Useful environment variables:

- `PI_PACKAGE_SEARCH_SOURCE` — override the package source, for example `npm:pi-package-search`
- `PI_E2E_TEST_INSTALL_PACKAGE` — package installed during the smoke test
- `PI_E2E_MODEL` — override the Pi model used during the run
- `PI_E2E_KEEP_TMPDIR=1` — keep the temp directory for debugging
- `PI_E2E_ISOLATE_AGENT_DIR=1` — use a clean Pi config directory instead of your current auth/config

## Publishing

Local publish sanity check:

```bash
npm run publish:dry-run
```

GitHub Actions workflows included in this repo:

- `CI` — lint, typecheck, unit tests, and `npm pack --dry-run`
- `E2E` — installs the package into a temp repo and exercises the real Pi flow
- `Publish to npm` — publishes the package and then runs the published-package E2E smoke test

> [!NOTE]
> The publish workflow needs `NPM_TOKEN` and `GEMINI_API_KEY` secrets.

## Quality checks

- Vitest covers URL building, result mapping, formatting, install behavior, and extension registration
- Biome handles formatting and linting
- GitHub Actions runs CI plus a real Pi E2E smoke test workflow
- simple-git-hooks runs checks before commit and push

## License

MIT © Dan
