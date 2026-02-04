## Epic 6: Code Quality Checks

_Implement linting and formatting checks for changed files_

### Objective

Run ESLint and Prettier checks on changed files only to maintain code quality standards without redundant checking of unchanged code.

### User Stories

- As a developer, I want linting to check only my changed files to keep feedback focused
- As the team, I want consistent code style enforced through automated checks
- As a reviewer, I want pre-commit hooks to catch issues before CI so PRs are cleaner

### Acceptance Criteria

- Linting job created in workflow
- Changed files detected and passed to ESLint
- Formatting check with Prettier run
- Linting report uploaded as artifact
- Pre-commit hooks documented for local development

### Implementation Tasks

- Create `lint` job in workflow
- Use `actions/github-script` or similar to detect changed files
- Run ESLint on changed files only
- Generate JSON report
- Upload linting report as artifact
- Document pre-commit setup in README

### Estimated Effort

2 days

---
