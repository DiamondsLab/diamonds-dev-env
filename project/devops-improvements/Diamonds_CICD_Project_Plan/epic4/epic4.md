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
