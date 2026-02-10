# PRD: GitHub Actions Workflow Foundation

## Introduction/Overview

This PRD defines the requirements for establishing a GitHub Actions CI/CD workflow foundation for the Diamonds Dev Env monorepo. The workflow will provide automated quality checks on every pull request, ensuring code quality, security, and functionality before code is merged into main branches. This foundation will serve as the base infrastructure for all future CI/CD enhancements.

**Problem Statement:** Currently, the project lacks automated CI/CD checks, which means code quality, security vulnerabilities, and test failures may not be caught until after merge or during manual review. This increases the risk of bugs reaching production and slows down the development process.

**Goal:** Create a reliable, fast, and extensible GitHub Actions workflow that automatically validates pull requests through compilation, testing, linting, and security checks.

## Goals

1. Establish automated CI/CD pipeline that triggers on all pull requests to `main` and `develop` branches
2. Create a clear, maintainable workflow structure that can be extended with additional jobs
3. Implement parallel job execution to provide fast feedback to developers
4. Block PR merging when critical checks fail to maintain code quality standards
5. Cache dependencies to optimize workflow execution time and reduce GitHub Actions minutes usage

## User Stories

1. **As a developer**, I want the CI/CD pipeline to trigger automatically on every PR so that I receive immediate feedback on my changes before requesting review

2. **As a developer**, I want to see clear job names and results so that I can quickly identify which check failed and why

3. **As a maintainer**, I want a consistent workflow structure with well-defined jobs so that we can easily extend the pipeline with additional checks in the future

4. **As a team member**, I want parallel job execution so that I don't have to wait long for all checks to complete

5. **As a maintainer**, I want failed checks to block PR merging automatically so that we maintain high code quality standards without manual intervention

6. **As a developer**, I want dependency caching so that workflow runs complete faster and I get feedback sooner

## Functional Requirements

### FR1: Workflow File Creation

The system must create a GitHub Actions workflow file at `.github/workflows/ci.yml`

### FR2: Pull Request Triggers

The workflow must trigger on `pull_request` events targeting the following branches:

- `main`
- `develop`

### FR3: Job Structure

The workflow must define four distinct jobs with the following names:

- `compile` - Verify code compiles successfully
- `test` - Run test suite validation
- `lint` - Check code style and quality
- `security` - Perform security scanning (placeholder for Epic 1)

### FR4: Runner Configuration

Each job must run on `ubuntu-latest` GitHub-hosted runner

### FR5: Parallel Execution

All jobs must be configured to run in parallel (no job dependencies in Epic 1)

### FR6: Timeout Configuration

Each job must have a reasonable timeout value (recommended: 15 minutes) to prevent stuck workflows

### FR7: Node.js Environment Setup

Each job must set up Node.js environment with the version specified in `.nvmrc` or `package.json` engines field

### FR8: Dependency Installation

Each job must install project dependencies using Yarn

### FR9: Workspace Build

The workflow must build all workspace packages using `yarn workspace:build`

### FR10: Compilation Check

The `compile` job must run `npx hardhat compile` and fail if compilation errors occur

### FR11: Test Framework Validation

The `test` job must execute a smoke test to verify the test framework runs successfully (e.g., `yarn test --version` or a minimal test command)

### FR12: Linting Execution

The `lint` job must run the existing lint script from package.json

### FR13: Security Check Placeholder

The `security` job must be defined with a placeholder step that always succeeds, preparing for future security scanning implementation

### FR14: Dependency Caching

The workflow must cache the following to improve performance:

- Yarn cache directory (`~/.cache/yarn`)
- `node_modules` directory

### FR15: Cache Key Strategy

Cache keys must be based on the hash of `yarn.lock` to ensure cache invalidation when dependencies change

### FR16: Branch Protection Integration

The workflow must be configured as a required status check for PRs (this will be set in GitHub repository settings)

## Non-Goals (Out of Scope)

The following items are explicitly **out of scope** for Epic 1:

1. **Full Test Suite Execution** - Epic 1 only validates that the test framework works; full test coverage will be added in a later epic
2. **Comprehensive Security Scanning** - The security job is a placeholder; actual Slither, Semgrep, and other security tools will be integrated in a later epic
3. **Artifact Uploading** - No test reports, coverage reports, or build artifacts will be saved in Epic 1
4. **Hardhat/Foundry Artifact Caching** - Only Node.js dependency caching is included; compilation artifact caching is deferred
5. **Matrix Builds** - No testing across multiple Node.js versions or operating systems
6. **Deployment Jobs** - No deployment or release automation
7. **Notification Integrations** - No Slack, Discord, or email notifications
8. **Code Coverage Reporting** - Coverage collection and reporting deferred to later epic
9. **Performance Benchmarking** - Not included in foundational workflow
10. **Docker Image Building** - Container builds deferred to later epic

## Design Considerations

### Workflow Structure

The workflow should follow GitHub Actions best practices:

- Use clear, descriptive job and step names
- Include `name` property for the workflow itself
- Use consistent formatting and indentation (2 spaces)
- Group related steps with comments

### Job Naming Convention

Jobs should use lowercase with hyphens for consistency:

- `compile` (not `Compile` or `compile-contracts`)
- `test` (not `Test` or `run-tests`)
- `lint` (not `Lint` or `linting`)
- `security` (not `Security` or `security-scan`)

### Error Handling

- Each step should fail fast if an error occurs
- Use `set -e` in shell commands to ensure errors propagate
- No `continue-on-error` in Epic 1 (all checks must pass)

## Technical Considerations

### Yarn Workspaces

The project uses Yarn Workspaces with multiple packages:

- `packages/diamonds/`
- `packages/hardhat-diamonds/`
- `packages/diamonds-hardhat-foundry/`
- `packages/diamonds-monitor/`
- `packages/hardhat-multichain/`

The workflow must install dependencies at the root level, which installs all workspace dependencies.

### TypeScript and ts-node

The project uses TypeScript with `ts-node` for Hardhat tasks. No TypeScript compilation is required for Hardhat commands to work (per BUILD_AND_DEPLOYMENT.md), but the compilation check ensures TypeScript types are valid.

### Hardhat Configuration

The project uses a custom Hardhat configuration (`hardhat.config.ts`) with:

- Multiple network configurations
- Diamond-specific plugins
- TypeChain type generation

### Git Submodules

Some workspace packages are git submodules. The workflow must use `actions/checkout` with `submodules: recursive` to ensure all code is available.

### Existing Scripts

Leverage existing package.json scripts:

- `yarn workspace:build` - Builds all workspace packages
- `yarn lint` - Runs ESLint with custom Diamond rules
- `yarn compile` - Compiles contracts and generates ABIs/types
- `yarn test` - Runs Hardhat tests (will be used in later epic)

### Node.js Version

The project should specify a Node.js version. Check for:

1. `.nvmrc` file
2. `package.json` engines field
3. Default to Node.js 18 LTS if not specified

### Cache Locations

Yarn cache directory varies by OS:

- Linux: `~/.cache/yarn`
- macOS: `~/Library/Caches/Yarn`
- Windows: `%LOCALAPPDATA%\Yarn\Cache`

For Epic 1, focus on Linux only (ubuntu-latest).

## Success Metrics

### Functional Success

1. **Workflow Creation**: `.github/workflows/ci.yml` file exists and is committed to repository
2. **Trigger Validation**: Workflow executes automatically when PR is opened/updated targeting `main` or `develop`
3. **Job Execution**: All four jobs (`compile`, `test`, `lint`, `security`) appear in GitHub Actions UI
4. **Parallel Execution**: Jobs run concurrently (not sequentially)
5. **Pass/Fail Status**: Each job reports clear success or failure status
6. **Merge Blocking**: Failed checks prevent PR merge (requires GitHub branch protection configuration)
7. **Cache Effectiveness**: Second workflow run shows cache hit for dependencies

### Performance Success

1. **Initial Run Time**: Complete workflow execution under 10 minutes (without cache)
2. **Cached Run Time**: Complete workflow execution under 5 minutes (with cache)
3. **Job Startup**: Each job starts within 30 seconds of trigger

### Quality Success

1. **No Syntax Errors**: Workflow YAML passes GitHub Actions validation
2. **No False Failures**: Jobs don't fail due to workflow configuration issues
3. **Clear Logs**: Job logs are readable and help debug failures

### Developer Experience Success

1. **Immediate Feedback**: Developer sees workflow status within 1 minute of PR creation
2. **Clear Failure Messages**: When checks fail, developers can identify the issue from logs
3. **Documentation**: Workflow includes comments explaining key sections

## Open Questions

1. **Node.js Version Strategy**: Should we test against multiple Node.js versions (matrix build) in a future epic, or standardize on one LTS version?

2. **Workflow Naming**: Should the workflow file be named `ci.yml`, `pull-request.yml`, or something else for clarity?

3. **Branch Protection Configuration**: Who will configure the GitHub branch protection rules to require these checks? Should this be documented in the PRD or a separate setup guide?

4. **Yarn Version**: Should we pin a specific Yarn version (1.x vs 3.x) using `packageManager` field in package.json?

5. **Failure Notification**: Do we need to notify the team when workflows fail on `main` branch (not PRs)?

6. **Concurrency Groups**: Should we cancel in-progress workflow runs when new commits are pushed to the same PR?

7. **Test Command**: What specific command should the `test` job run for smoke test validation? Options:
   - `yarn test --listTests` (just list tests)
   - `yarn test --version` (check framework version)
   - Create a minimal `test/smoke.test.ts` file

8. **Environment Variables**: Are there any required environment variables (API keys, etc.) needed for compilation or basic tests?

---

## Implementation Checklist

- [ ] Create `.github/workflows/ci.yml` file
- [ ] Define workflow name and documentation header
- [ ] Configure pull_request trigger with branch filters
- [ ] Set up checkout action with submodules
- [ ] Configure Node.js setup with version detection
- [ ] Implement Yarn dependency caching
- [ ] Create `compile` job with Hardhat compilation
- [ ] Create `test` job with smoke test
- [ ] Create `lint` job with ESLint execution
- [ ] Create `security` job with placeholder step
- [ ] Add timeout configuration to all jobs
- [ ] Test workflow with sample PR
- [ ] Verify parallel execution
- [ ] Document workflow in project README
- [ ] Configure GitHub branch protection rules (if applicable)
