# Diamonds Project CI/CD Pipeline

## GitHub Actions Integration with Dev Container

---

## Project Overview

This project plan outlines the implementation of a comprehensive CI/CD pipeline using GitHub Actions and the existing Diamonds DevContainer. The pipeline will automate testing, security scanning, and validation for all pull requests before merge.

The pipeline executes checks in parallel for optimal performance and stores all reports as GitHub Actions artifacts for review and audit purposes.

### Key Requirements

- Compile Solidity contracts and generate TypeChain types
- Run complete Hardhat test suite
- Execute security scans (Snyk, Semgrep, Slither, OSV-Scanner, git-secrets)
- Perform npm audit for dependency vulnerabilities
- Lint changed files only using ESLint
- Save all reports as downloadable GitHub Actions artifacts
- Execute all checks in parallel for speed
- Block PR merges if any check fails
- Notify via GitHub's native notification system on failures

---

## Epic 1: GitHub Actions Workflow Foundation

_Create the core GitHub Actions workflow file and establish pull request triggers_

### Objective

Set up a GitHub Actions workflow that triggers on pull requests, defines job structure, and establishes the foundation for all downstream checks.

### User Stories

- As a developer, I want the CI/CD pipeline to trigger automatically on every PR so that checks run before I request review
- As a maintainer, I want a consistent workflow structure with clear job naming so that we can extend it with additional checks
- As a team, I want the workflow configured for parallel execution so that feedback is fast

### Acceptance Criteria

- Workflow file exists at `.github/workflows/ci.yml`
- Triggers on `pull_request` events to `main` and `develop` branches
- Jobs defined with clear names: `compile`, `test`, `lint`, `security`
- Parallel job execution configured
- Workflow runs successfully with no syntax errors

### Implementation Tasks

- Create `.github/workflows/ci.yml` file
- Define workflow name and trigger conditions
- Configure jobs with Ubuntu runner (`ubuntu-latest`)
- Set up job dependencies and timeout values
- Test workflow with a sample PR

### Estimated Effort

2-3 days

---

## Epic 2: Container Setup and Environment Configuration

_Configure GitHub Actions to use the Diamonds DevContainer for all pipeline jobs_

### Objective

Ensure GitHub Actions uses the existing Diamonds DevContainer image, guaranteeing environment parity between local and CI/CD execution.

### User Stories

- As a developer, I want my local environment to match the CI environment exactly so that there are no "works on my machine" surprises
- As an engineer, I want all dependencies cached and installed quickly so that jobs complete in reasonable time
- As the team, I want environment variables and secrets properly configured so that security tools authenticate correctly

### Acceptance Criteria

- GitHub Actions uses Diamonds DevContainer image
- Node.js, Yarn, and all tools are available in the container
- Dependencies install in under 5 minutes with caching
- Environment variables set for RPC URLs and API keys
- Security tokens (`SNYK_TOKEN`, etc.) configured via GitHub Secrets

### Implementation Tasks

- Build and push DevContainer image to GitHub Container Registry (GHCR)
- Configure container image in workflow jobs
- Set up GitHub Secrets for API keys (`SNYK_TOKEN`, `ETHERSCAN_API_KEY`, etc.)
- Configure dependency caching (Yarn cache)
- Test container availability and tool functionality in CI

### Estimated Effort

3-4 days

---

## Epic 3: Compilation and Type Generation

_Implement contract compilation and TypeChain type generation jobs_

### Objective

Compile Solidity contracts and generate TypeScript types to ensure contract code is valid and types are up-to-date.

### User Stories

- As a developer, I want compilation errors caught early so that I don't waste time on broken contracts
- As a reviewer, I want TypeChain types regenerated to ensure type safety for contract interactions
- As the team, I want compilation to succeed in the first job so it doesn't block dependent tests

### Acceptance Criteria

- Compilation job exists and runs `yarn compile` command
- TypeChain types generated successfully
- Artifacts directory preserved for downstream jobs
- Compilation takes under 2 minutes
- Job fails if any compilation error occurs

### Implementation Tasks

- Create `compile` job in workflow
- Add checkout and dependency installation steps
- Configure `yarn compile` command
- Upload artifacts (node_modules, artifacts) for test jobs
- Configure error handling and failure notifications

### Estimated Effort

2 days

---

## Epic 4: Testing Pipeline

_Implement Hardhat test execution with coverage reporting_

### Objective

Run the complete Hardhat test suite and generate coverage reports to ensure contract functionality and code coverage requirements are met.

### User Stories

- As a developer, I want tests to run automatically so that regressions are caught before merge
- As a maintainer, I want coverage reports to track test quality trends
- As a reviewer, I want to see detailed test output to understand what was tested

### Acceptance Criteria

- Test job depends on compilation job
- `yarn test` command executes all Hardhat tests
- Coverage report generated in `coverage/` directory
- Test results uploaded as GitHub Actions artifact
- Tests complete in under 10 minutes

### Implementation Tasks

- Create `test` job in workflow
- Configure job to use compilation artifacts
- Add `yarn test` command with coverage flag
- Upload coverage reports as artifacts
- Configure test timeout and retry logic

### Estimated Effort

2-3 days

---

## Epic 5: Security Scanning Pipeline

_Implement parallel security scanning jobs for comprehensive vulnerability detection_

### Objective

Execute multiple security scanning tools in parallel to detect vulnerabilities, code issues, smart contract flaws, and leaked secrets.

### Security Tools Covered

- **npm audit** - Dependency vulnerability scanning
- **Snyk** - Comprehensive vulnerability database
- **Semgrep** - Static analysis for code security issues
- **Slither** - Solidity smart contract analysis
- **OSV-Scanner** - Open Source Vulnerabilities detection
- **git-secrets** - Secret and private key detection

### User Stories

- As a security engineer, I want multiple vulnerability scanners to catch different issue types
- As a developer, I want to know about secret leaks before they reach the repository
- As the team, I want parallel execution of security checks so that we get feedback quickly

### Acceptance Criteria

- Six separate jobs created for each security tool
- Jobs run in parallel for speed
- Each tool configured with appropriate authentication
- Reports generated and uploaded as artifacts
- All security jobs block PR if any issues found

### Implementation Tasks

#### npm audit Job

- Run `npm audit --audit-level=moderate` (or high)
- Generate audit report JSON
- Upload audit report as artifact

#### Snyk Job

- Authenticate with `SNYK_TOKEN` secret
- Run `snyk test` with JSON output
- Upload Snyk report as artifact

#### Semgrep Job

- Run Semgrep scan on full codebase
- Output SARIF format report
- Upload Semgrep report as artifact

#### Slither Job

- Run Slither analysis on `contracts/`
- Generate detailed report
- Upload Slither report as artifact

#### OSV-Scanner Job

- Run OSV-Scanner on lock files
- Generate report
- Upload OSV report as artifact

#### git-secrets Job

- Run `git secrets --scan`
- Detect private keys, mnemonics, API keys
- Fail job if secrets found

### Estimated Effort

4-5 days

---

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

## Epic 7: Artifact Management and Reporting

_Configure GitHub Actions artifact storage and reporting_

### Objective

Ensure all reports from tests and security scans are properly stored as GitHub Actions artifacts for review, audit, and historical tracking.

### Artifacts to Collect

- Test coverage reports (`coverage/`)
- Test results (`test-results.json`, `junit.xml`)
- npm audit report
- Snyk report
- Semgrep report
- Slither report
- OSV-Scanner report
- ESLint report

### User Stories

- As a reviewer, I want to download test reports to understand test coverage and security issues
- As an auditor, I want historical records of all CI/CD execution and findings
- As a developer, I want easy access to failure details without re-running the job

### Acceptance Criteria

- All reports uploaded to GitHub Actions artifacts
- Artifacts organized in named directories (`coverage/`, `security-reports/`, etc.)
- Artifacts retain 30+ days for audit purposes
- Download links accessible from GitHub Actions UI
- Artifacts available for pull request runs and merge runs

### Implementation Tasks

- Add artifact upload steps to each job
- Use `actions/upload-artifact@v4` for uploads
- Create directory structure for organized storage
- Configure retention policy
- Test artifact retrieval from Actions UI

### Estimated Effort

1-2 days

---

## Epic 8: Status Checks and Merge Blocking

_Configure GitHub branch protection rules to block merges on failed checks_

### Objective

Ensure all CI/CD jobs are required to pass before a pull request can merge, and that GitHub status checks accurately reflect job outcomes.

### User Stories

- As a maintainer, I want to prevent broken code from reaching main or develop branches
- As a reviewer, I want to see clear CI/CD status before I approve a PR
- As the team, I want GitHub notifications when checks fail

### Acceptance Criteria

- Branch protection rule configured on `main` branch
- All CI/CD jobs marked as required status checks
- Merge button disabled until all checks pass
- GitHub notifications sent on check failure
- Status checks appear in PR UI with clear pass/fail indicators

### Implementation Tasks

- Navigate to Settings > Branches > main
- Enable "Require status checks to pass before merging"
- Add all CI/CD jobs as required checks
- Require PR approvals (if not already set)
- Test with a sample PR to verify blocking behavior

### Estimated Effort

1 day

---

## Epic 9: Documentation and Team Enablement

_Create documentation and enable team members to work effectively with the new CI/CD pipeline_

### Objective

Provide clear documentation, runbooks, and guides so developers understand the CI/CD pipeline, can troubleshoot failures, and know how to set up their local environment.

### User Stories

- As a new team member, I want clear documentation on how the CI/CD pipeline works
- As a developer with a failing check, I want runbooks to troubleshoot issues
- As the team, I want pre-commit hooks set up locally to catch issues early

### Documentation to Create

- CI/CD Pipeline Overview
- Workflow Architecture Diagram
- Troubleshooting Guide for Common Failures
- Local Development Setup (pre-commit hooks, Hardhat)
- GitHub Secrets Configuration Guide
- Security Tools Configuration Details

### Acceptance Criteria

- CI/CD documentation added to `docs/` or `README.md`
- Architecture diagram created and included
- Troubleshooting guide covers all major tools
- Pre-commit hooks documented with setup instructions
- Team trained on using the pipeline

### Implementation Tasks

- Create `docs/CI-CD.md` file
- Write pipeline overview and architecture
- Add troubleshooting section with common issues and solutions
- Document pre-commit setup
- Create GitHub Secrets setup guide
- Conduct team sync/training session
- Update `README.md` with CI/CD badge and links

### Estimated Effort

2-3 days

---

## Implementation Timeline

_Recommended phased approach with parallel work_

### Phase 1: Foundation (Week 1)

- Epic 1: GitHub Actions Workflow Foundation
- Epic 2: Container Setup and Environment Configuration (start)

### Phase 2: Core Checks (Week 2-3)

- Epic 2: Container Setup (complete)
- Epic 3: Compilation and Type Generation
- Epic 4: Testing Pipeline
- Epic 6: Code Quality Checks

### Phase 3: Security (Week 3-4)

- Epic 5: Security Scanning Pipeline

### Phase 4: Finalization (Week 4)

- Epic 7: Artifact Management and Reporting
- Epic 8: Status Checks and Merge Blocking
- Epic 9: Documentation and Team Enablement

### Total Estimated Duration

3-4 weeks with one full-time engineer, or proportionally longer with part-time effort

---

## Success Metrics

Track these metrics to measure the success of the CI/CD pipeline implementation:

| Metric                    | Target                            |
| ------------------------- | --------------------------------- |
| CI Pipeline Success Rate  | 95%+ for valid PRs                |
| Average Run Time          | Under 20 minutes (parallel)       |
| Security Issues Caught    | 100% detection of critical issues |
| Merged PRs without Issues | 100% (zero broken merges)         |
| Artifact Retention        | 30+ days for audit                |

---

## Next Steps

- Review and approve this project plan with stakeholders
- Assign epic owners and team members
- Set up GitHub project or Jira board for tracking
- Gather GitHub Secrets values needed (API keys, tokens)
- Create feature branch for workflow implementation
- Schedule team kickoff meeting
- Begin Phase 1 implementation
