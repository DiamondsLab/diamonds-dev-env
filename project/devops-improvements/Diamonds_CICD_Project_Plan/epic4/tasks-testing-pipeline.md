# Task List: Testing Pipeline (Epic 4)

## Relevant Files

- `.github/workflows/ci.yml` - Main GitHub Actions workflow file where the test job will be added
- `scripts/check-coverage.sh` - New script to check coverage threshold and report results
- `hardhat.config.ts` - Hardhat configuration file (verify solidity-coverage plugin is configured)
- `package.json` - Package file containing test scripts (verify `yarn test` command)
- `coverage/` - Directory where HTML coverage reports will be generated
- `coverage/coverage-summary.json` - JSON file containing coverage metrics for threshold checking
- `test/` - Directory containing all test files (unit, integration, deployment, fuzzing)

### Notes

- The test job depends on successful completion of the `compile` job from Epic 3
- Coverage reports are generated using the `solidity-coverage` Hardhat plugin
- The workflow uses GitHub Actions' artifact system to preserve compilation outputs and test reports
- Tests run sequentially in phases: unit → integration → deployment → fuzzing
- A custom bash script will parse coverage data and enforce the 80% threshold
- The DevContainer environment from Epic 2 provides all necessary tools (Node.js, Yarn, Hardhat)

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Ensure you're on the latest `main` branch (`git checkout main && git pull origin main`)
  - [x] 0.2 Create and checkout new branch `feature/epic4-testing-pipeline` (`git checkout -b feature/epic4-testing-pipeline`)
  - [x] 0.3 Verify branch was created successfully (`git branch --show-current`)

- [x] 1.0 Configure GitHub Actions test job structure
  - [x] 1.1 Read the existing `.github/workflows/ci.yml` file to understand current structure
  - [x] 1.2 Add new `test` job after the `compile` job
  - [x] 1.3 Set job name to "Run Hardhat Tests with Coverage"
  - [x] 1.4 Configure job to run on `ubuntu-latest` runner
  - [x] 1.5 Add `needs: compile` dependency to ensure compilation completes first
  - [x] 1.6 Set job timeout to 20 minutes (`timeout-minutes: 20`)
  - [x] 1.7 Add checkout step using `actions/checkout@v4`
  - [x] 1.8 Verify job structure is valid YAML syntax

- [x] 2.0 Set up artifact download and environment configuration
  - [x] 2.1 Add step to download artifacts from compile job using `actions/download-artifact@v4`
  - [x] 2.2 Configure artifact download to restore `node_modules/` directory
  - [x] 2.3 Configure artifact download to restore `artifacts/` directory (compiled contracts)
  - [x] 2.4 Configure artifact download to restore `typechain-types/` directory
  - [x] 2.5 Configure artifact download to restore `diamond-typechain-types/` directory
  - [x] 2.6 Add environment variable `NODE_ENV=test`
  - [x] 2.7 Add environment variable `HARDHAT_NETWORK=hardhat`
  - [x] 2.8 Configure RPC URLs and API keys from GitHub Secrets (reference Epic 2 secret configuration)
  - [x] 2.9 Verify all artifacts are available before proceeding to test execution

- [x] 3.0 Implement sequential test execution with retry logic
  - [x] 3.1 Add step named "Run Unit Tests" that executes `yarn test test/unit --coverage`
  - [x] 3.2 Add step named "Run Integration Tests" that executes `yarn test test/integration --coverage`
  - [x] 3.3 Add step named "Run Deployment Tests" that executes `yarn test test/deployment --coverage`
  - [x] 3.4 Add step named "Run Fuzzing Tests" that executes `yarn test test/fuzzing --coverage`
  - [x] 3.5 Wrap each test execution step with retry logic using `nick-fields/retry@v2` action
  - [x] 3.6 Configure retry action with `timeout_minutes: 5` per test phase
  - [x] 3.7 Configure retry action with `max_attempts: 2` (one retry)
  - [x] 3.8 Add `continue-on-error: false` to ensure job fails if tests fail after retry
  - [x] 3.9 Configure each step to log retry attempts clearly

- [x] 4.0 Generate and upload coverage reports
  - [x] 4.1 Add step named "Generate Coverage Report Summary" that runs after all tests
  - [x] 4.2 Verify `coverage/` directory exists and contains HTML reports
  - [x] 4.3 Verify `coverage/coverage-summary.json` exists with coverage metrics
  - [x] 4.4 Add step to display coverage summary in job logs (`cat coverage/coverage-summary.json`)
  - [x] 4.5 Add step using `actions/upload-artifact@v4` to upload coverage reports
  - [x] 4.6 Configure artifact name as `test-coverage-report`
  - [x] 4.7 Configure artifact path as `coverage/` directory
  - [x] 4.8 Set artifact retention to 90 days (`retention-days: 90`)
  - [x] 4.9 Ensure upload happens even if tests fail (`if: always()`)

- [x] 5.0 Implement coverage threshold enforcement
  - [x] 5.1 Create new file `scripts/check-coverage.sh` with bash script header
  - [x] 5.2 Add script logic to read `coverage/coverage-summary.json` using `jq`
  - [x] 5.3 Parse line coverage percentage from JSON (`jq '.total.lines.pct'`)
  - [x] 5.4 Parse branch coverage percentage from JSON (`jq '.total.branches.pct'`)
  - [x] 5.5 Parse function coverage percentage from JSON (`jq '.total.functions.pct'`)
  - [x] 5.6 Compare each coverage metric against 80% threshold using `bc` for floating point math
  - [x] 5.7 If any metric is below 80%, echo clear error message with actual percentages
  - [x] 5.8 Exit with status code 1 if coverage is below threshold, 0 if passing
  - [x] 5.9 Make script executable (`chmod +x scripts/check-coverage.sh`)
  - [x] 5.10 Add workflow step "Check Coverage Threshold" that runs `./scripts/check-coverage.sh`
  - [x] 5.11 Position this step after coverage generation but before artifact upload
  - [x] 5.12 Test script locally with sample coverage data

- [x] 6.0 Add job status reporting and error handling
  - [x] 6.1 Add step at the end of job to generate test summary for GitHub Actions UI
  - [x] 6.2 Use GitHub Actions summary syntax to output formatted results (`echo "..." >> $GITHUB_STEP_SUMMARY`)
  - [x] 6.3 Include total tests run, passed, and failed in summary
  - [x] 6.4 Include coverage percentages (lines, branches, functions) in summary
  - [x] 6.5 Add emoji indicators (✅ for pass, ❌ for fail) to summary
  - [x] 6.6 Configure step to run even if previous steps fail (`if: always()`)
  - [x] 6.7 Add error handling for missing artifacts (check if directories exist before using them)
  - [x] 6.8 Add error handling for coverage generation failures (check if coverage files exist)
  - [x] 6.9 Add clear error messages for common failure scenarios (timeout, missing dependencies, etc.)

- [ ] 7.0 Validate and test complete pipeline
  - [ ] 7.1 Commit all changes with message "feat: implement testing pipeline (Epic 4)"
  - [ ] 7.2 Push feature branch to remote (`git push -u origin feature/epic4-testing-pipeline`)
  - [ ] 7.3 Create pull request targeting `main` branch
  - [ ] 7.4 Verify GitHub Actions workflow triggers automatically on PR creation
  - [ ] 7.5 Monitor test job execution in GitHub Actions UI
  - [ ] 7.6 Verify all test phases execute sequentially (unit → integration → deployment → fuzzing)
  - [ ] 7.7 Verify coverage report is generated and uploaded as artifact
  - [ ] 7.8 Download coverage artifact from GitHub Actions and review HTML report
  - [ ] 7.9 Verify coverage threshold check passes (or fails appropriately if coverage < 80%)
  - [ ] 7.10 Verify retry logic works by temporarily introducing a flaky test (optional validation)
  - [ ] 7.11 Verify job summary displays correct test results and coverage metrics
  - [ ] 7.12 Test failure scenario: introduce a failing test and verify job fails appropriately
  - [ ] 7.13 Test timeout scenario: verify job times out after 20 minutes if tests hang (optional)
  - [ ] 7.14 Document any issues found and fixes applied in PR description
  - [ ] 7.15 Request review from team members
  - [ ] 7.16 Update Epic 4 status in project plan after successful validation
