# pi-package-search

A simple TypeScript pi package that adds `search_pi_packages` and `install_pi_package` tools, plus a matching skill for discovering installable pi packages on npm.

It searches the npm registry endpoint used by the pi package gallery and filters results with the `pi-package` keyword.

## What it adds

- **Extension tool:** `search_pi_packages`
- **Extension tool:** `install_pi_package`
- **Skill:** `/skill:pi-package-search`

## Install

```bash
pi install /absolute/path/to/pi-package-search
```

Or after publishing:

```bash
pi install npm:pi-package-search
```

## Usage

Ask pi something like:

- `Find pi packages for session search`
- `Search for pi packages related to browser automation`
- `/skill:pi-package-search browser automation`

The search tool returns package names, short descriptions, and copy-pasteable install commands like:

```bash
pi install npm:@scope/package-name
```

If the user already knows what they want, the install tool can install it directly in either global or project scope.

## Development

```bash
npm install
npm test
npm run lint
npm run typecheck
```

## Project hygiene

- **TDD:** tests cover the npm search URL builder, search client, tool formatting, and extension registration.
- **Biome:** formatting + linting via `npm run lint` and `npm run format`.
- **Git hooks:** `simple-git-hooks` runs lint/typecheck on pre-commit and tests on pre-push.
