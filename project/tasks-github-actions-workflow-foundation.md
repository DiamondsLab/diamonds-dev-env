# Task List: GitHub Actions Workflow Foundation

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

ub

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout new branch from main (e.g., `git checkout -b feature/github-actions-ci`)

- [x] 1.0 Set up workflow file structure and triggers
  - [x] 1.1 Create `.github/workflows/` directory if it doesn't exist
  - [x] 1.2 Create `ci.yml` file with workflow name and documentation header
  - [x] 1.3 Configure pull_request trigger with branch filters (main, develop)
  - [x] 1.4 Add workflow-level timeout and permissions settings

- [x] 2.0 Configure Node.js environment and dependency caching
  - [x] 2.1 Check for `.nvmrc` or `package.json` engines field to determine Node.js version
  - [x] 2.2 Add actions/checkout step with submodules: recursive
  - [x] 2.3 Add actions/setup-node step with version from context
  - [x] 2.4 Configure Yarn cache using actions/cache with yarn.lock hash as key
  - [x] 2.5 Add dependency installation step (yarn install)

- [x] 3.0 Implement compile job
  - [x] 3.1 Define compile job with ubuntu-latest runner
  - [x] 3.2 Add checkout, Node.js setup, cache, and install steps (reuse from 2.0)
  - [x] 3.3 Add workspace build step (yarn workspace:build)
  - [x] 3.4 Add Hardhat compile step (npx hardhat compile)
  - [x] 3.5 Set job timeout to 15 minutes

- [x] 4.0 Implement test job
  - [x] 4.1 Define test job with ubuntu-latest runner
  - [x] 4.2 Add checkout, Node.js setup, cache, and install steps
  - [x] 4.3 Add workspace build step (yarn workspace:build)
  - [x] 4.4 Add smoke test command to validate test framework runs (e.g., `yarn test --listTests` or similar)
  - [x] 4.5 Set job timeout to 15 minutes

- [x] 5.0 Implement lint job
  - [x] 5.1 Define lint job with ubuntu-latest runner
  - [x] 5.2 Add checkout, Node.js setup, cache, and install steps
  - [x] 5.3 Add lint step using existing package.json script (yarn lint)
  - [x] 5.4 Set job timeout to 15 minutes

- [x] 6.0 Implement security job placeholder
  - [x] 6.1 Define security job with ubuntu-latest runner
  - [x] 6.2 Add checkout, Node.js setup, cache, and install steps
  - [x] 6.3 Add placeholder step with echo message indicating future security scanning implementation
  - [x] 6.4 Set job timeout to 15 minutes

- [ ] 7.0 Test and validate workflow
  - [x] 7.1 Commit workflow file to feature branch
  - [x] 7.2 Push feature branch to GitHub
  - [x] 7.3 Create draft pull request targeting develop or main
  - [ ] 7.4 Verify workflow triggers automatically
  - [ ] 7.5 Check all four jobs appear in GitHub Actions tab
  - [ ] 7.6 Verify jobs run in parallel (check timestamps)
  - [ ] 7.7 Confirm dependency cache is created on first run
  - [ ] 7.8 Push additional commit to verify cache hit on second run
  - [ ] 7.9 Review job logs for errors or warnings
  - [ ] 7.10 Verify all jobs complete successfully with green checkmarks

- [ ] 8.0 Document workflow and configure branch protection
  - [ ] 8.1 Add workflow documentation to README.md or create docs/CI_CD_WORKFLOW.md
  - [ ] 8.2 Document what each job does and when workflow triggers
  - [ ] 8.3 Create GitHub issue or document steps for configuring branch protection rules
  - [ ] 8.4 Update PR to ready for review or merge if all checks pass

## Relevant Files

- `.github/workflows/ci.yml` - Main GitHub Actions workflow file (to be created)
- `package.json` - Check for `engines` field, verify lint script exists
- `.nvmrc` - Check for Node.js version specification (may not exist)
- `yarn.lock` - Used for cache key generation (existing file)
- `README.md` - Update with CI/CD workflow documentation
- `docs/CI_CD_WORKFLOW.md` - Optional: Create detailed workflow documentation

## Notes

### Workflow Testing

- This epic doesn't require traditional unit tests since the workflow itself is validated by running it on GitHub Actions
- Testing is done through the GitHub Actions UI by creating an actual pull request
- Verify workflow YAML syntax using `yamllint .github/workflows/ci.yml` or GitHub's built-in validator

### Node.js Version Detection

- Check `.nvmrc` first for Node.js version
- If not present, check `package.json` "engines.node" field
- Default to Node.js 18 LTS if neither is specified

### Caching Strategy

- Cache key format: `${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}`
- Cache paths: `~/.cache/yarn` and `node_modules`
- Cache will be invalidated automatically when `yarn.lock` changes

### Job Reusability

- All four jobs use identical setup steps (checkout, Node.js, cache, install)
- Consider using a reusable workflow or composite action in future epics for DRY principle
- For Epic 1, duplicate steps are acceptable to keep workflow simple and explicit

### Branch Protection Configuration

- Branch protection is configured in GitHub repository Settings > Branches
- Requires repository admin access
- Should be documented but may need separate permissions to implement

### Smoke Test Options

For the test job (4.4), choose one of these commands:

- `yarn test --listTests` - Lists all test files without running them
- `npx hardhat test --list` - If Hardhat supports listing tests
- `echo "Test framework validated"` - Simplest option for Epic 1

### Parallel Execution

- All jobs should start simultaneously (within seconds of each other)
- No `needs:` dependencies between jobs in Epic 1
- Expected total runtime: 5-10 minutes with cache, 8-15 minutes without cache
