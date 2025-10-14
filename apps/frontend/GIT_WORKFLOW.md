# Git Best Practices Guide

This document outlines our team's Git workflow and best practices for the comment-application project.

## Branching Strategy (Git Flow)

We follow a modified Git Flow branching strategy with the following branches:

### Main Branches

- **`main`** - Production code only. This branch is deployed to production environments.
- **`develop`** - Integration branch for features. This is deployed to development/staging environments.

### Supporting Branches

- **`feature/name-of-feature`** - For new features development
- **`bugfix/description-of-bug`** - For bug fixes that aren't urgent
- **`hotfix/description-of-issue`** - For critical production bugs that need immediate fixing
- **`release/vX.Y.Z`** - For preparing releases, including version bumps and final fixes

## Branch Naming Conventions

- Use lowercase letters and hyphens (kebab-case)
- Always include the branch type prefix
- Be descriptive but concise
- Examples:
  - ✅ `feature/user-authentication`
  - ✅ `bugfix/login-form-validation`
  - ✅ `hotfix/security-vulnerability`
  - ✅ `release/v1.2.0`
  - ❌ `feature_new_login` (use hyphens, not underscores)
  - ❌ `fix-bug` (missing prefix)
  - ❌ `featurenewbutton` (not descriptive, missing hyphen)

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi-colons, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or updating tests
- `chore`: Changes to build process, tooling, etc.
- `perf`: Performance improvements
- `ci`: CI/CD configuration changes

### Examples

- ✅ `feat(auth): add login functionality`
- ✅ `fix(comments): resolve issue with reply threading`
- ✅ `docs: update README with setup instructions`
- ✅ `style: format code according to styleguide`
- ✅ `test(api): add tests for comment endpoints`

## Pull Requests

- Create pull requests from feature branches to develop (or hotfixes to main)
- Use a descriptive title following commit conventions
- Fill out the PR template completely
- Keep PRs small and focused on a single issue/feature
- Require at least one approval before merging
- Set up status checks to ensure CI passes before merging

## Git Hooks

We use the following Git hooks for quality control:

1. **pre-commit**: Runs linting and formatting on staged files
2. **commit-msg**: Ensures commit messages follow conventional commits format
3. **prepare-commit-msg**: Automatically includes branch name in commit messages
4. **pre-push**: Runs tests and prevents pushing if they fail

## Workflow Examples

### Starting a new feature

```bash
# Start from develop branch
git checkout develop
git pull

# Create feature branch
git checkout -b feature/user-comments

# Make changes, then commit
git add .
git commit -m "feat(comments): implement user comment submission"

# Push branch to remote
git push -u origin feature/user-comments

# Create PR through GitHub interface
```

### Fixing a bug

```bash
# Start from develop branch
git checkout develop
git pull

# Create bugfix branch
git checkout -b bugfix/invalid-date-format

# Make changes, then commit
git add .
git commit -m "fix(dates): correct date format in comment timestamps"

# Push branch to remote
git push -u origin bugfix/invalid-date-format

# Create PR through GitHub interface
```

### Handling a hotfix

```bash
# Start from main branch
git checkout main
git pull

# Create hotfix branch
git checkout -b hotfix/security-auth-bypass

# Make changes, commit
git add .
git commit -m "fix(security): prevent authentication bypass vulnerability"

# Push branch to remote
git push -u origin hotfix/security-auth-bypass

# Create PR to main through GitHub interface
```

## Additional Best Practices

1. **Rebase instead of merge** when pulling from base branches to keep history clean
2. **Squash commits** when merging PRs to create a cleaner history
3. **Never force push** to shared branches (main, develop)
4. **Write meaningful commit messages** that explain why the change was made
5. **Keep commits atomic** - one logical change per commit
6. **Use issues/tickets** and reference them in commits and PRs
7. **Delete branches** after they're merged

## Tools & Configuration

This repository is set up with:

- **Husky**: For Git hooks
- **lint-staged**: For running linters on staged files
- **Prettier**: For code formatting
- **ESLint**: For code quality
- **Jest**: For testing

Run `npm install` to set up all the Git hooks after cloning the repository.
