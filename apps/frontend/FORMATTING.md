# Code Style & Formatting

This project uses [Prettier](https://prettier.io/) for consistent code formatting across the codebase.

## Configuration

The Prettier configuration is defined in `.prettierrc` with the following key settings:

- **Print Width**: 80 characters
- **Tab Width**: 2 spaces
- **Tabs**: Spaces (not tabs)
- **Semicolons**: Required
- **Quotes**: Single quotes for JS/TS, double quotes for CSS/HTML
- **Trailing Commas**: ES5 style (where valid in ES5)
- **Bracket Spacing**: `true` (spaces inside object literals)
- **Arrow Function Parentheses**: Always include parentheses
- **End of Line**: LF (Unix-style)

## File-specific Overrides

Special formatting rules apply to:
- JSON, YAML, and Markdown files (2 space indentation)
- CSS/SCSS files (double quotes instead of single)

## Ignored Files

See `.prettierignore` for the list of files excluded from formatting.

## Commands

- `npm run format` - Format all files in the project
- `npm run format:check` - Check if files need formatting without changing them
- `npm run format:staged` - Format only staged Git files

## Pre-commit Hooks

This project uses [Husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged) to automatically format code before commits:

1. When you commit code, the pre-commit hook will run
2. `lint-staged` will run Prettier on modified files
3. ESLint will also run on JavaScript/TypeScript files
4. If formatting or linting fails, the commit is blocked

## IDE Integration

For the best experience, install the Prettier extension for your editor:

- **VS Code**: [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- **IntelliJ/WebStorm**: [Prettier plugin](https://plugins.jetbrains.com/plugin/10456-prettier)

Configure your editor to format on save for maximum productivity.