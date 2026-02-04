# Branch Protection Configuration for GitHub Actions CI

This document provides instructions for configuring GitHub branch protection rules to enforce CI checks before merging pull requests.

## Overview

Branch protection rules ensure that all pull requests pass required CI checks before they can be merged into protected branches (`main` and `develop`). This maintains code quality and prevents broken code from reaching production.

## Prerequisites

- Repository admin access to DiamondsLab/diamonds-dev-env
- GitHub Actions CI workflow deployed (`.github/workflows/ci.yml`)

## Configuration Steps

### 1. Access Branch Protection Settings

1. Navigate to: https://github.com/DiamondsLab/diamonds-dev-env/settings/branches
2. Click "Add branch protection rule" or edit existing rule for `main`

### 2. Configure Protection for `main` Branch

#### Branch Name Pattern

```
main
```

#### Protection Rules

**Require a pull request before merging**

- ✅ Enable "Require a pull request before merging"
- ✅ Require approvals: `1` (recommended)
- ✅ Dismiss stale pull request approvals when new commits are pushed

**Require status checks to pass before merging**

- ✅ Enable "Require status checks to pass before merging"
- ✅ Enable "Require branches to be up to date before merging"

**Required Status Checks** (select all four):

- `Compile Contracts`
- `Test Framework Validation`
- `Lint Code`
- `Security Checks (Placeholder)`

**Additional Settings**

- ✅ Require conversation resolution before merging
- ✅ Require linear history (optional, recommended for clean history)
- ❌ Do not require signed commits (optional, can enable for extra security)
- ❌ Do not require deployments to succeed
- ✅ Lock branch (optional, restricts force pushes to admins only)

#### Who Can Push

- Restrict who can push to matching branches: Leave unchecked to allow all contributors with write access
- OR specify teams/users if you want tighter control

#### Bypass Settings

- Allow specified actors to bypass required pull requests: Leave unchecked
- OR add administrators if needed for emergency fixes

### 3. Configure Protection for `develop` Branch

Repeat the same steps for the `develop` branch:

#### Branch Name Pattern

```
develop
```

Use the same protection rules as `main` branch above.

### 4. Verify Configuration

After configuration:

1. Create a test PR targeting `main` or `develop`
2. Verify the four status checks appear and are required
3. Attempt to merge without passing checks - should be blocked
4. Wait for all checks to pass - merge button should become available

## Status Check Names

The four required status checks match the job names in `.github/workflows/ci.yml`:

| Job Name in Workflow | Status Check Name in GitHub     |
| -------------------- | ------------------------------- |
| `compile`            | `Compile Contracts`             |
| `test`               | `Test Framework Validation`     |
| `lint`               | `Lint Code`                     |
| `security`           | `Security Checks (Placeholder)` |

## Troubleshooting

### Status Checks Not Appearing

**Problem**: Required status checks don't show up in branch protection settings

**Solutions**:

1. Ensure the workflow has run at least once on a PR
2. Check that job names in `.github/workflows/ci.yml` exactly match the expected names
3. Verify the workflow is not failing before checks can be registered

### Merge Button Still Available with Failing Checks

**Problem**: PRs can be merged even with failing checks

**Solutions**:

1. Verify "Require status checks to pass before merging" is enabled
2. Check that all four status checks are selected in the required checks list
3. Ensure you're not an admin bypassing the rules (admins can override by default)

### Checks Show as "Expected" but Never Run

**Problem**: Status checks stuck in "expected" state

**Solutions**:

1. Verify the workflow trigger includes `pull_request` events
2. Check that the PR targets `main` or `develop` branches
3. Review GitHub Actions logs for workflow errors

## Recommended Settings Summary

```yaml
# Quick reference for branch protection
Branch: main, develop

Required Rules: ✅ Require pull request
  ✅ Require 1 approval
  ✅ Dismiss stale approvals
  ✅ Require status checks to pass
  ✅ Require branches up to date
  ✅ Require conversation resolution
  ✅ Require linear history (optional)
  ✅ Lock branch (optional)

Required Status Checks: ✅ Compile Contracts
  ✅ Test Framework Validation
  ✅ Lint Code
  ✅ Security Checks (Placeholder)
```

## Future Enhancements

As additional CI jobs are added in future epics, update the required status checks to include:

- Full test suite execution
- Code coverage minimum thresholds
- Security scanning (Slither, Semgrep, etc.)
- Contract size limits
- Gas usage limits
- Documentation generation

## References

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
- Epic 1 PRD: `project/prd-github-actions-workflow-foundation.md`
