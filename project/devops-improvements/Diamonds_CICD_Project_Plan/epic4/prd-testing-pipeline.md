# Product Requirements Document: Testing Pipeline (Epic 4)

## Introduction/Overview

The Testing Pipeline is a critical component of the Diamonds CI/CD infrastructure that automatically executes the complete Hardhat test suite on every pull request. This feature ensures that all contract functionality is validated before code merges to main branches, preventing regressions and maintaining code quality.

The pipeline will run tests sequentially in clear phases (fast tests first, then slower integration tests), generate HTML coverage reports, and enforce an 80% code coverage threshold. All test results and coverage reports will be saved as GitHub Actions artifacts for review and audit purposes.

**Problem Statement:** Currently, developers must manually run tests locally before submitting PRs, which can lead to:

- Tests being skipped or forgotten
- Broken code merged to main branches
- No centralized coverage tracking
- Inconsistent test execution environments

**Solution:** Automated testing pipeline that runs on every PR, provides consistent test execution, enforces coverage standards, and delivers clear feedback to developers.

---

## Goals

1. **Automated Test Execution:** Run the complete Hardhat test suite automatically on every pull request
2. **Coverage Enforcement:** Ensure 80% minimum code coverage threshold is met before PR merge
3. **Fast Feedback:** Provide clear test results and coverage reports within 15 minutes
4. **Artifact Preservation:** Save HTML coverage reports as GitHub Actions artifacts for every test run
5. **Test Reliability:** Implement retry logic for flaky tests to reduce false negatives
6. **Phase-Based Execution:** Run fast unit tests before slower integration/deployment tests for quicker feedback

---

## User Stories

### US-1: Automated Test Execution on PR

**As a** developer  
**I want** tests to run automatically when I create/update a PR  
**So that** I know my changes don't break existing functionality without manually running tests

**Acceptance Criteria:**

- Tests trigger automatically on PR open/update
- All test suites execute (unit, integration, deployment, fuzzing)
- Test output is visible in GitHub Actions UI
- Failed tests block PR merge

### US-2: Coverage Report Generation

**As a** maintainer  
**I want** HTML coverage reports generated for every test run  
**So that** I can track code coverage trends and identify untested code paths

**Acceptance Criteria:**

- HTML coverage report generated in `coverage/` directory
- Report uploaded as GitHub Actions artifact
- Report remains available for 90 days
- Coverage percentage visible in job summary

### US-3: Coverage Threshold Enforcement

**As a** team lead  
**I want** the pipeline to fail if coverage drops below 80%  
**So that** we maintain high test quality standards

**Acceptance Criteria:**

- Pipeline checks coverage percentage after test execution
- Job fails if coverage is below 80%
- Clear error message indicates coverage failure
- Coverage percentage shown in job logs

### US-4: Test Retry for Reliability

**As a** developer  
**I want** flaky tests to retry once before failing  
**So that** intermittent test failures don't block legitimate PRs

**Acceptance Criteria:**

- Failed tests automatically retry once
- Retry results clearly logged
- Only mark as failed after both attempts fail
- Retry count visible in test output

### US-5: Sequential Test Phases

**As a** reviewer  
**I want** fast tests to run before slow tests  
**So that** I get quick feedback on basic functionality before waiting for full suite

**Acceptance Criteria:**

- Unit tests run first (fastest feedback)
- Integration tests run second
- Deployment tests run third
- Fuzzing tests run last (slowest)
- Phase completion logged separately

---

## Functional Requirements

### FR-1: GitHub Actions Job Configuration

The testing pipeline must be implemented as a GitHub Actions job named `test` that:

- Depends on successful completion of the `compile` job
- Uses the Diamonds DevContainer environment
- Executes on `ubuntu-latest` runner
- Has a timeout of 20 minutes

### FR-2: Artifact Download

The test job must download compilation artifacts from the `compile` job:

- `node_modules/` directory
- `artifacts/` directory (compiled contracts)
- `typechain-types/` directory
- `diamond-typechain-types/` directory

### FR-3: Test Execution Command

The pipeline must execute tests using the command:

```bash
yarn test --coverage
```

This command must:

- Run all Hardhat tests in the `test/` directory
- Generate coverage data using `solidity-coverage` plugin
- Execute tests in sequential phases:
  1. `test/unit/` - Unit tests
  2. `test/integration/` - Integration tests
  3. `test/deployment/` - Deployment tests
  4. `test/fuzzing/` - Fuzzing tests

### FR-4: Test Retry Logic

The pipeline must implement retry logic:

- Use GitHub Actions retry mechanism or custom script
- Retry failed tests exactly once
- Log retry attempts clearly
- Mark as failed only if both attempts fail
- Do not retry if timeout occurs

### FR-5: Coverage Report Generation

The pipeline must generate an HTML coverage report:

- Output directory: `coverage/`
- Format: HTML with summary and detailed file views
- Include line coverage, branch coverage, function coverage
- Show covered/uncovered lines with color coding

### FR-6: Coverage Threshold Check

After test execution, the pipeline must:

- Parse coverage percentage from `coverage/coverage-summary.json`
- Compare against 80% threshold
- Fail the job if coverage is below 80%
- Display coverage percentage in job summary
- Provide clear error message: "Coverage of X% is below required 80% threshold"

### FR-7: Artifact Upload

The pipeline must upload test results as GitHub Actions artifacts:

- Artifact name: `test-coverage-report`
- Contents: Entire `coverage/` directory
- Retention: 90 days
- Compression: Enabled (default)

### FR-8: Job Status Reporting

The test job must clearly report status:

- Success: "✅ All tests passed (X/X) with Y% coverage"
- Failure: "❌ Tests failed (X/Y passed) or coverage below threshold (Z%)"
- Show summary in job logs and GitHub Actions UI

### FR-9: Environment Configuration

The test job must configure environment variables:

- `NODE_ENV=test`
- `HARDHAT_NETWORK=hardhat`
- All RPC URLs and API keys from GitHub Secrets
- Prevent test data from persisting between runs

### FR-10: Error Handling

The pipeline must handle errors gracefully:

- Catch compilation errors from missing artifacts
- Report test execution timeouts clearly
- Handle coverage generation failures
- Provide actionable error messages for debugging

---

## Non-Goals (Out of Scope)

The following items are **explicitly excluded** from Epic 4:

1. **Parallel Test Execution:** Tests will run sequentially for simplicity (optimization in future epic if needed)
2. **Test Sharding:** No splitting of tests across multiple runners
3. **Performance Benchmarking:** Not tracking test execution time trends
4. **Forge/Foundry Tests:** Only Hardhat tests included (Foundry in separate epic)
5. **Mutation Testing:** No automated mutation testing framework
6. **Visual Regression Testing:** No UI/frontend testing (contracts only)
7. **Load/Stress Testing:** No performance testing of contract execution
8. **Cobertura XML Export:** Only HTML reports (XML export can be added later for integrations)
9. **Coverage Trend Tracking:** No historical coverage comparison (can be added with third-party service)
10. **Slack/Discord Notifications:** Using GitHub's native notifications only

---

## Design Considerations

### Test Execution Flow

```
┌─────────────────────────────────────┐
│   Download Compilation Artifacts    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Phase 1: Run Unit Tests           │
│   (test/unit/*.test.ts)              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Phase 2: Run Integration Tests    │
│   (test/integration/*.test.ts)       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Phase 3: Run Deployment Tests     │
│   (test/deployment/*.test.ts)        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Phase 4: Run Fuzzing Tests        │
│   (test/fuzzing/*.test.ts)           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Generate Coverage Report (HTML)   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Check Coverage >= 80%             │
└──────────────┬──────────────────────┘
               │
         ┌─────┴─────┐
         │           │
      PASS         FAIL
         │           │
         ▼           ▼
   Upload Artifact  Upload Artifact
   Exit Success     Exit Failure
```

### Coverage Report Layout

The HTML coverage report should display:

- **Summary Page:** Overall coverage percentages (lines, branches, functions)
- **File List:** Each file with coverage percentage and link to details
- **File Detail:** Source code with line-by-line coverage highlighting
  - Green: Covered lines
  - Red: Uncovered lines
  - Yellow: Partially covered branches

### Job Configuration Example

```yaml
test:
  name: "Run Hardhat Tests with Coverage"
  runs-on: ubuntu-latest
  needs: compile
  timeout-minutes: 20

  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Download compilation artifacts
      uses: actions/download-artifact@v4

    - name: Run tests with coverage
      run: yarn test --coverage

    - name: Check coverage threshold
      run: |
        coverage=$(jq '.total.lines.pct' coverage/coverage-summary.json)
        if (( $(echo "$coverage < 80" | bc -l) )); then
          echo "❌ Coverage $coverage% is below 80% threshold"
          exit 1
        fi

    - name: Upload coverage report
      uses: actions/upload-artifact@v4
      with:
        name: test-coverage-report
        path: coverage/
        retention-days: 90
```

---

## Technical Considerations

### Dependencies

- **Hardhat:** Test execution framework
- **@nomicfoundation/hardhat-toolbox:** Includes test utilities
- **solidity-coverage:** Coverage report generation
- **@typechain/hardhat:** Contract type generation
- **chai:** Assertion library
- **ethers.js v6:** Ethereum interaction library

### Test Environment Setup

Tests must run with:

- Clean Hardhat Network instance (in-memory blockchain)
- Fresh contract deployments for each test file
- Snapshot/revert for test isolation
- Deterministic test accounts from mnemonic

### Coverage Tool Configuration

The `hardhat.config.ts` must include:

```typescript
import "solidity-coverage";

// Coverage options
solidity: {
  compilers: [
    {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  ];
}
```

### Test Retry Implementation

Option 1 - GitHub Actions native retry:

```yaml
- name: Run tests
  uses: nick-fields/retry@v2
  with:
    timeout_minutes: 15
    max_attempts: 2
    command: yarn test --coverage
```

Option 2 - Custom retry script:

```bash
#!/bin/bash
yarn test --coverage || yarn test --coverage
```

### Performance Considerations

- **No Optimization Required:** Execution time is not critical (< 20 minutes acceptable)
- **Sequential Execution:** Simpler to debug, easier to maintain
- **Artifact Size:** Coverage HTML reports typically 5-10 MB compressed

### Hardhat-Multichain Integration

The project uses `@diamondslab/hardhat-multichain` for multi-network testing. The pipeline must ensure:

- All configured networks in `config/networks/*.json` are available
- Tests run against Hardhat's in-memory network (not external networks)
- Network configuration errors don't cause test failures

### TypeScript Compilation Strategy

Per [BUILD_AND_DEPLOYMENT.md](../../../docs/BUILD_AND_DEPLOYMENT.md):

- Hardhat uses `ts-node` to execute TypeScript directly
- No TypeScript compilation needed before running tests
- All imports work without file extensions (CommonJS)

---

## Success Metrics

### Primary Metrics

1. **Test Success Rate:** 100% of tests pass on PR merge
2. **Coverage Achievement:** Maintain >= 80% code coverage across all PRs
3. **Pipeline Reliability:** < 5% false negative rate (flaky test failures)
4. **Execution Time:** Complete within 20 minutes (acceptable range)

### Secondary Metrics

1. **Artifact Usage:** Coverage reports downloaded and reviewed for 50%+ of PRs
2. **Developer Satisfaction:** Positive feedback on test feedback speed and clarity
3. **Regression Prevention:** Zero critical bugs reach main branch due to test failures being caught

### Tracking Methods

- **GitHub Actions Logs:** Test pass/fail rates tracked per PR
- **Coverage Reports:** Historical coverage data in artifacts
- **PR Comments:** Manual review of coverage trends
- **Post-Epic Survey:** Developer feedback on pipeline experience

---

## Open Questions

### Q1: Flaky Test Handling Strategy

**Question:** If a test passes on retry, should we still flag it as potentially flaky for investigation?  
**Impact:** High - affects test reliability and developer trust  
**Decision Needed By:** Implementation start  
**Options:**

- A) Log warning but allow PR to pass
- B) Pass PR but create automated GitHub issue for investigation
- C) Allow pass, no additional action

### Q2: Coverage Calculation Method

**Question:** Should coverage threshold apply to overall project coverage or just changed files?  
**Impact:** Medium - affects strictness of coverage enforcement  
**Decision Needed By:** Threshold check implementation  
**Options:**

- A) Overall project coverage must be >= 80%
- B) Changed files must have >= 80% coverage
- C) Both overall and changed file coverage checked

### Q3: Test Output Verbosity

**Question:** What level of detail should be shown in GitHub Actions logs?  
**Impact:** Low - affects debugging experience  
**Decision Needed By:** Test execution implementation  
**Options:**

- A) Minimal output (pass/fail summary only)
- B) Standard output (test names + pass/fail)
- C) Verbose output (all console.log, stack traces)

### Q4: Coverage Report Access

**Question:** Should coverage reports be published to GitHub Pages or just stored as artifacts?  
**Impact:** Low - affects accessibility of reports  
**Decision Needed By:** After initial implementation  
**Options:**

- A) Artifacts only (current plan)
- B) Publish to GitHub Pages for easier browsing
- C) Integrate with third-party service (Codecov, Coveralls)

### Q5: Test Data Cleanup

**Question:** How should we handle test artifacts generated during execution (logs, temporary files)?  
**Impact:** Low - affects artifact size and storage costs  
**Decision Needed By:** Implementation  
**Options:**

- A) Clean up all temporary files before artifact upload
- B) Include all files for debugging (larger artifacts)
- C) Upload separate debug artifact with full logs

---

## Implementation Checklist

### Pre-Implementation

- [ ] Review existing test suite structure
- [ ] Verify `yarn test --coverage` works locally
- [ ] Confirm compilation artifacts are available from Epic 3
- [ ] Test coverage threshold calculation logic locally

### Implementation Tasks

- [ ] Create `test` job in `.github/workflows/ci.yml`
- [ ] Configure job dependencies on `compile` job
- [ ] Add artifact download step
- [ ] Implement test execution command
- [ ] Add retry logic for test execution
- [ ] Implement coverage threshold check script
- [ ] Configure coverage report upload
- [ ] Add job status reporting
- [ ] Test complete workflow on feature branch

### Validation

- [ ] Verify tests run successfully in CI
- [ ] Confirm coverage report generated and uploaded
- [ ] Test coverage threshold enforcement (create PR with low coverage)
- [ ] Verify retry logic works (simulate flaky test)
- [ ] Review artifact retention settings
- [ ] Validate timeout behavior (tests taking > 20 minutes)

### Documentation

- [ ] Update Epic 4 task list with completion status
- [ ] Document coverage threshold in README
- [ ] Add troubleshooting guide for test failures
- [ ] Update CI/CD documentation with test pipeline details

---

## Appendix

### Example Test Output

```
Running Hardhat Tests with Coverage
=====================================

Phase 1: Unit Tests
  ✓ DiamondCutFacet: should add facet selectors (125ms)
  ✓ DiamondLoupeFacet: should return facet addresses (89ms)
  ✓ OwnershipFacet: should transfer ownership (156ms)

Phase 2: Integration Tests
  ✓ Diamond Deployment: full deployment succeeds (2341ms)
  ✓ Diamond Upgrade: facet replacement works (1876ms)

Phase 3: Deployment Tests
  ✓ LocalDiamondDeployer: deploys to hardhat network (3421ms)

Phase 4: Fuzzing Tests
  ✓ Diamond Cut: fuzzing 100 random operations (8934ms)

Summary
-------
Total Tests: 7
Passed: 7
Failed: 0
Duration: 17.2s

Coverage
--------
Statements: 84.3%
Branches: 78.9%
Functions: 86.2%
Lines: 84.1%

❌ Coverage Check FAILED
Overall coverage 84.1% meets threshold, but branch coverage 78.9% is below 80%
```

### Related Documentation

- [Diamonds Project CI/CD Plan](../Diamonds_CICD_Project_Plan.md)
- [Epic 3: Compilation and Type Generation](../epic3/prd-compilation-type-generation.md)
- [Build and Deployment Process](../../../docs/BUILD_AND_DEPLOYMENT.md)
- [Test Suite Documentation](../../../test/README.md)

---

**Document Version:** 1.0  
**Created:** February 8, 2026  
**Status:** Draft - Pending Review  
**Owner:** DevOps Team  
**Reviewers:** Development Team, QA Team
