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

**To configure this feature:**

1. Go to Repository Settings → General
2. Scroll to "Pull Requests" section
3. Under "Development", configure the branch name pattern

**Recommended pattern:**
```
{label}/{issue-number}-{issue-title}
```

**Note:** The `.github/development.yml` file in this repository provides a configuration template, though GitHub's native UI settings take precedence.

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
