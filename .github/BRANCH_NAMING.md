# Branch Naming Configuration

This repository uses the branch naming convention: `<issue-type>/<issue-number>-<issue-name>`

## Examples
- `feature/123-add-user-authentication`
- `bug/456-fix-login-error`
- `chore/789-update-dependencies`
- `docs/101-improve-readme`

## Automatic Branch Creation

### Method 1: GitHub Actions (Automated)
When you create or label an issue, a GitHub Actions workflow automatically creates a branch with the correct naming convention.

The workflow is defined in `.github/workflows/create-branch-from-issue.yml` and triggers on:
- Issue opened
- Issue labeled

### Method 2: GitHub UI "Create a branch" Feature
You can also create branches directly from the GitHub issue page using the "Create a branch" button.

**To configure the GitHub UI branch creation:**

1. Go to Repository Settings → General
2. Scroll to "Pull Requests" section  
3. Look for "Development" or "Automatically create branches" settings

**For the branch naming pattern:**
- If using GitHub Actions (recommended): The workflow automatically creates branches with the correct naming
- If using GitHub UI manual configuration: The exact configuration options depend on your GitHub plan
  - GitHub Free/Pro: Limited configuration options
  - GitHub Enterprise: More granular control over branch naming patterns

**Note:** The `.github/development.yml` file in this repository provides a configuration template that documents the desired branch naming pattern. However, GitHub's native UI settings must be configured manually in the repository settings, as GitHub does not currently support automated configuration of the "Create a branch" feature via a YAML file. The template serves as documentation and a reference for manual configuration.

## Issue Type Labels

The branch prefix is determined by the issue's labels:

| Label | Branch Prefix |
|-------|---------------|
| `bug` | `bug/` |
| `feature` | `feature/` |
| `enhancement` | `feature/` |
| `chore` | `chore/` |
| `documentation` | `docs/` |
| `docs` | `docs/` |
| `task` | `task/` |
| `hotfix` | `hotfix/` |
| `refactor` | `refactor/` |

If an issue has no matching label, `task/` is used as the default prefix.

## Label Priority

If an issue has multiple labels, the first matching label from the priority list is used:
1. `bug`
2. `feature`
3. `enhancement`
4. `hotfix`
5. `chore`
6. `docs`/`documentation`
7. `task`
8. `refactor`

## Contributing

When creating a new branch manually, please follow the same naming convention to maintain consistency across the repository.
