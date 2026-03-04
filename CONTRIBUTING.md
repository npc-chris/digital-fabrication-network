# Contributing to Digital Fabrication Network

Thank you for your interest in contributing! This document outlines the standards and processes for contributing to this monorepo.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [CI/CD Pipeline](#cicd-pipeline)
- [Security](#security)

---

## Code of Conduct

Be respectful, inclusive, and constructive. Harassment, discrimination, or abusive behavior will not be tolerated.

---

## Repository Structure

```
digital-fabrication-network/
├── .github/              # GitHub configuration (workflows, templates)
│   ├── ISSUE_TEMPLATE/   # Standardized issue templates
│   ├── workflows/        # GitHub Actions CI/CD pipelines
│   ├── dependabot.yml    # Automated dependency updates
│   └── PULL_REQUEST_TEMPLATE.md
├── backend/              # Express + TypeScript API (Node.js)
├── frontend/             # Next.js + React application
├── CONTRIBUTING.md       # This file
├── SECURITY.md           # Security policy and disclosure process
└── package.json          # Root workspace configuration
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+ (for backend development)

### Setup

```bash
# Clone the repo
git clone https://github.com/npc-chris/digital-fabrication-network.git
cd digital-fabrication-network

# Install all workspace dependencies
npm install

# Copy environment variable templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Fill in values in the .env files (never commit secrets)

# Start development servers
npm run dev
```

---

## Commit Message Guidelines

This project follows [Conventional Commits](https://www.conventionalcommits.org/). All commit messages are enforced via [commitlint](https://commitlint.js.org/) using a Husky `commit-msg` hook.

### Format

```
<type>(<optional scope>): <short description>

[optional body]

[optional footer: refs #<issue-number>]
```

### Allowed Types

| Type       | Description                                          |
| ---------- | ---------------------------------------------------- |
| `feat`     | A new feature                                        |
| `fix`      | A bug fix                                            |
| `docs`     | Documentation only changes                           |
| `style`    | Formatting, whitespace (no logic change)             |
| `refactor` | Code change that is neither a fix nor a feature      |
| `perf`     | A code change that improves performance              |
| `test`     | Adding or correcting tests                           |
| `chore`    | Build process, dependency updates, tooling           |
| `ci`       | CI/CD configuration changes                          |
| `revert`   | Reverts a previous commit                            |

### Examples

```
feat(auth): add JWT refresh token support

fix(api): handle null response from third-party endpoint

docs: update README with deployment instructions

chore(deps): bump express from 4.18.2 to 4.19.0

ci: add security audit step to workflow

feat!: redesign user profile API (BREAKING CHANGE)
```

### Scopes

Use scopes to indicate the part of the codebase affected. Common scopes:

- `frontend`, `backend`, `api`, `auth`, `db`, `deps`, `ci`, `docs`

---

## Pull Request Process

1. **Branch from `develop`** (or `main` for hotfixes):
   ```bash
   git checkout -b feat/my-feature develop
   ```

2. **Make your changes**, following the coding standards below.

3. **Ensure all checks pass locally**:
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

4. **Open a PR** against `develop` (or `main` for hotfixes) and fill in the PR template.

5. **Link the related issue** using `Fixes #<issue-number>` in the PR description.

6. **Request a review** from at least one maintainer.

7. **Address review feedback** promptly; mark conversations as resolved when addressed.

8. PRs are merged using **squash and merge** to keep history clean.

### Coding Standards

- TypeScript is used throughout; avoid `any` types
- Run `npm run format` before committing to apply Prettier formatting
- Lint errors must be resolved before merging (`npm run lint`)
- All new features must include corresponding tests

---

## Issue Reporting

Use the provided issue templates:

- **Bug Report** – for reproducible bugs and unexpected behavior
- **Feature Request** – for new features or improvements

Please search existing issues before opening a new one to avoid duplicates.

### Labels

| Label             | Description                           |
| ----------------- | ------------------------------------- |
| `bug`             | Confirmed bug                         |
| `enhancement`     | New feature or improvement            |
| `needs-triage`    | Awaiting assessment                   |
| `in-progress`     | Actively being worked on              |
| `dependencies`    | Dependency update                     |
| `ci`              | CI/CD related                         |
| `documentation`   | Documentation improvement             |
| `security`        | Security-related issue                |

---

## CI/CD Pipeline

Every push and pull request runs the automated pipeline defined in `.github/workflows/ci-cd.yml`:

| Job                | Trigger           | Description                              |
| ------------------ | ----------------- | ---------------------------------------- |
| `lint-commits`     | All PRs           | Enforces Conventional Commit format      |
| `backend-test`     | Push / PR         | Lint, build, and test the backend        |
| `frontend-test`    | Push / PR         | Lint, build, and test the frontend       |
| `security-audit`   | Push / PR         | Runs `npm audit` across all workspaces   |
| `deploy-backend`   | Push to `main`    | Deploys backend to Railway               |
| `deploy-frontend`  | Push to `main`    | Deploys frontend to Vercel               |

**All CI checks must pass before a PR can be merged.**

---

## Security

Please review our [SECURITY.md](./SECURITY.md) for our security policy and responsible disclosure process. Never commit secrets or credentials; use `.env` files which are excluded by `.gitignore`.
