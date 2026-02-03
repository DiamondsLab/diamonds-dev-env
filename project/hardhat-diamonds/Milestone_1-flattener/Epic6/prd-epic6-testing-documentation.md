# Product Requirements Document: Epic 6 - Testing & Documentation

**Project:** Diamond Flatten Feature - @diamondslab/hardhat-diamonds  
**Epic:** Epic 6 - Testing & Documentation  
**Version:** 1.0  
**Date:** February 1, 2026  
**Status:** Ready for Implementation  
**Target Audience:** Junior to Mid-Level Developers

---

## 1. Introduction/Overview

Epic 6 completes the Diamond Flatten feature by implementing comprehensive testing and documentation. This epic ensures the `diamond:flatten` task is production-ready through:

- **Unit tests** covering all core modules with ≥90% code coverage
- **Integration tests** validating end-to-end functionality with real Diamond contracts
- **Comprehensive documentation** for both users (CLI usage) and developers (API reference)
- **CI/CD automation** via GitHub Actions for continuous quality assurance

**Problem Solved:** Without thorough testing and documentation, the flatten feature would be unreliable and difficult for developers to use or maintain. This epic ensures code quality, catches regressions early, and provides clear guidance for all user types.

**Goal:** Deliver a battle-tested, well-documented `diamond:flatten` task that developers can confidently use in production environments.

---

## 2. Goals

| Goal ID | Objective                           | Success Metric                                 |
| ------- | ----------------------------------- | ---------------------------------------------- |
| G1      | Achieve comprehensive test coverage | ≥90% code coverage on all core modules         |
| G2      | Validate real-world functionality   | 100% of integration test scenarios passing     |
| G3      | Enable fast feedback loops          | Full test suite completes in <30 seconds       |
| G4      | Provide complete user documentation | 100% of CLI features documented with examples  |
| G5      | Enable developer contributions      | 100% of public APIs documented with JSDoc      |
| G6      | Automate quality checks             | CI/CD pipeline catches regressions on every PR |

---

## 3. User Stories

### Story 1: Developer Running Unit Tests

**As a** contributor developing the flatten feature  
**I want** to run unit tests quickly during development  
**So that** I get immediate feedback on code changes without waiting for slow integration tests

**Acceptance Criteria:**

- Unit tests execute in <10 seconds
- Tests can be run individually or as a suite
- Failed tests show clear error messages with context

---

### Story 2: QA Engineer Validating Integration

**As a** QA engineer testing the feature  
**I want** integration tests that verify end-to-end functionality with realistic diamonds  
**So that** I can confirm the feature works correctly in production-like scenarios

**Acceptance Criteria:**

- Integration tests cover simple, complex, and edge-case diamonds
- Tests validate compilation of flattened output
- Tests verify selector mappings are accurate

---

### Story 3: Junior Developer Learning the Task

**As a** junior developer new to the diamonds ecosystem  
**I want** clear, example-driven documentation for the `diamond:flatten` task  
**So that** I can quickly understand how to use it without asking for help

**Acceptance Criteria:**

- Documentation includes basic CLI examples
- Advanced use cases (output file, verbose mode) are documented
- Common troubleshooting scenarios are addressed

---

### Story 4: Senior Developer Integrating Programmatically

**As a** senior developer building automation tools  
**I want** complete API reference documentation with TypeScript types  
**So that** I can integrate the flatten functionality into scripts with type safety

**Acceptance Criteria:**

- All public functions have JSDoc comments
- TypeScript interfaces are fully documented
- API examples show programmatic usage patterns

---

### Story 5: Maintainer Reviewing Pull Requests

**As a** project maintainer reviewing PRs  
**I want** automated CI/CD checks that run tests on every commit  
**So that** I can catch regressions before merging without manual testing

**Acceptance Criteria:**

- GitHub Actions workflow runs on PR creation
- Coverage reports are generated and visible
- Failed checks block PR merging

---

## 4. Functional Requirements

### 4.1 Unit Test Suite Requirements

| Req ID | Requirement                                                                          | Priority |
| ------ | ------------------------------------------------------------------------------------ | -------- |
| FR-1   | Create unit tests for `DiamondFlattener` class covering all public methods           | P0       |
| FR-2   | Create unit tests for `SourceResolver` class with mocked file system                 | P0       |
| FR-3   | Create unit tests for `DependencyGraph` class including circular dependency handling | P0       |
| FR-4   | Create unit tests for `OutputFormatter` class with SPDX/pragma edge cases            | P0       |
| FR-5   | Create unit tests for task validation logic in `diamond-flatten.ts`                  | P0       |
| FR-6   | Achieve minimum 90% code coverage on `DiamondFlattener.ts`                           | P0       |
| FR-7   | Achieve minimum 90% code coverage on `SourceResolver.ts`                             | P0       |
| FR-8   | Achieve minimum 90% code coverage on `DependencyGraph.ts`                            | P0       |
| FR-9   | Achieve minimum 90% code coverage on `OutputFormatter.ts`                            | P0       |
| FR-10  | Achieve minimum 85% code coverage on `diamond-flatten.ts` task file                  | P1       |
| FR-11  | All unit tests must complete execution in <10 seconds                                | P1       |
| FR-12  | Mock Hardhat Runtime Environment (HRE) for unit tests                                | P0       |
| FR-13  | Test error handling paths for file not found scenarios                               | P0       |
| FR-14  | Test error handling for invalid diamond configurations                               | P0       |
| FR-15  | Test error handling for missing facet contracts                                      | P0       |

### 4.2 Integration Test Requirements

| Req ID | Requirement                                                                 | Priority |
| ------ | --------------------------------------------------------------------------- | -------- |
| FR-16  | Create test fixture: Simple Diamond with 3 basic facets                     | P0       |
| FR-17  | Create test fixture: Complex Diamond with OpenZeppelin dependencies         | P0       |
| FR-18  | Create test fixture: Diamond with init contract included                    | P0       |
| FR-19  | Create test fixture: Diamond with shared library dependencies               | P1       |
| FR-20  | Create test fixture: Edge case Diamond with circular dependencies           | P1       |
| FR-21  | Integration test: Flatten simple diamond and verify output structure        | P0       |
| FR-22  | Integration test: Flatten diamond with shared dependencies (no duplication) | P0       |
| FR-23  | Integration test: Verify flattened output compiles with `solc`              | P0       |
| FR-24  | Integration test: Validate selector mapping table accuracy                  | P0       |
| FR-25  | Integration test: CLI with `--output` flag writes to file correctly         | P0       |
| FR-26  | Integration test: CLI with `--verbose` flag shows detailed logs             | P1       |
| FR-27  | Integration test: Programmatic API usage returns correct result object      | P0       |
| FR-28  | Integration test: Verify SPDX license consolidation logic                   | P1       |
| FR-29  | Integration test: Verify pragma directive handling                          | P1       |
| FR-30  | All integration tests must complete in <20 seconds                          | P1       |

### 4.3 Documentation Requirements

| Req ID | Requirement                                                                          | Priority |
| ------ | ------------------------------------------------------------------------------------ | -------- |
| FR-31  | Create `docs/tasks/diamond-flatten.md` with complete task documentation              | P0       |
| FR-32  | Document all CLI usage patterns with code examples                                   | P0       |
| FR-33  | Document programmatic API usage with TypeScript examples                             | P0       |
| FR-34  | Document all task arguments (`--diamond-name`, `--output`, `--verbose`, `--network`) | P0       |
| FR-35  | Include troubleshooting section for common errors                                    | P1       |
| FR-36  | Add JSDoc comments to all public functions in `DiamondFlattener.ts`                  | P0       |
| FR-37  | Add JSDoc comments to all public functions in `SourceResolver.ts`                    | P0       |
| FR-38  | Add JSDoc comments to all public functions in `DependencyGraph.ts`                   | P0       |
| FR-39  | Add JSDoc comments to all public functions in `OutputFormatter.ts`                   | P0       |
| FR-40  | Document all TypeScript interfaces with property descriptions                        | P0       |
| FR-41  | Update main `README.md` with flatten task overview and link                          | P0       |
| FR-42  | Include example output showing selector mapping table format                         | P1       |
| FR-43  | Document limitations (e.g., Vyper contracts not supported)                           | P1       |
| FR-44  | Provide before/after examples of Diamond vs flattened output                         | P2       |

### 4.4 CI/CD Integration Requirements

| Req ID | Requirement                                                 | Priority |
| ------ | ----------------------------------------------------------- | -------- |
| FR-45  | Create `.github/workflows/test-flatten.yml` workflow file   | P0       |
| FR-46  | Configure workflow to run on pull requests to main branch   | P0       |
| FR-47  | Configure workflow to run on push to feature branches       | P1       |
| FR-48  | Workflow step: Install dependencies with Yarn               | P0       |
| FR-49  | Workflow step: Build workspace packages                     | P0       |
| FR-50  | Workflow step: Compile Hardhat contracts                    | P0       |
| FR-51  | Workflow step: Run unit tests with coverage reporting       | P0       |
| FR-52  | Workflow step: Run integration tests                        | P0       |
| FR-53  | Workflow step: Upload coverage report to Codecov or similar | P1       |
| FR-54  | Workflow step: Run ESLint on flatten-related files          | P1       |
| FR-55  | Configure workflow to fail if test coverage drops below 90% | P1       |
| FR-56  | Add status badge to README showing CI/CD status             | P2       |

---

## 5. Non-Goals (Out of Scope)

| Non-Goal                                                 | Rationale                                                              |
| -------------------------------------------------------- | ---------------------------------------------------------------------- |
| Performance testing / benchmarking                       | Epic 6 focuses on functional correctness, not performance optimization |
| Visual regression testing for output format              | Output format is text-based and validated through compilation          |
| Multi-language support (non-Solidity)                    | Flatten feature is Solidity-specific by design                         |
| Mutation testing                                         | Would significantly increase test execution time beyond 30s target     |
| End-user documentation (non-developers)                  | Target audience is developers only                                     |
| Automated deployment to npm registry                     | Deployment is handled separately from testing                          |
| Load testing / stress testing                            | Not applicable for a build-time CLI tool                               |
| Security penetration testing                             | Standard security practices covered by ESLint rules                    |
| Cross-platform compatibility testing (Windows/Mac/Linux) | CI/CD runs on Linux; cross-platform issues addressed reactively        |

---

## 6. Design Considerations

### 6.1 Test Fixture Architecture

```
test/fixtures/flatten/
├── simple/                          # 3-facet basic diamond
│   ├── contracts/
│   │   ├── SimpleDiamond.sol
│   │   └── facets/
│   │       ├── FacetA.sol
│   │       ├── FacetB.sol
│   │       └── FacetC.sol
│   └── diamonds/
│       └── SimpleDiamond/
│           └── SimpleDiamond.config.json
├── complex/                         # Diamond with OZ dependencies
│   ├── contracts/
│   │   ├── ComplexDiamond.sol
│   │   └── facets/
│   │       ├── OwnableFacet.sol    # Uses @openzeppelin/contracts
│   │       ├── PausableFacet.sol
│   │       └── AccessControlFacet.sol
│   └── diamonds/...
├── with-init/                       # Diamond with init contract
│   ├── contracts/
│   │   ├── InitDiamond.sol
│   │   ├── init/
│   │   │   └── DiamondInit.sol
│   │   └── facets/...
│   └── diamonds/...
├── with-libraries/                  # Shared library usage
│   ├── contracts/
│   │   ├── LibraryDiamond.sol
│   │   ├── libraries/
│   │   │   ├── MathLib.sol
│   │   │   └── StringLib.sol
│   │   └── facets/
│   │       ├── MathFacet.sol       # Uses MathLib
│   │       └── StringFacet.sol     # Uses StringLib
│   └── diamonds/...
└── edge-cases/                      # Circular deps, etc.
    ├── contracts/
    │   ├── EdgeCaseDiamond.sol
    │   └── facets/
    │       ├── CircularA.sol       # Imports CircularB
    │       └── CircularB.sol       # Imports CircularA
    └── diamonds/...
```

### 6.2 Test Organization Pattern

```typescript
// Unit test structure example
describe("DiamondFlattener", () => {
  let flattener: DiamondFlattener;
  let mockHRE: HardhatRuntimeEnvironment;

  beforeEach(() => {
    // Setup mocks and test instances
    mockHRE = createMockHRE();
    flattener = new DiamondFlattener(mockHRE, options);
  });

  describe("flatten()", () => {
    it("should flatten simple diamond successfully", async () => {
      // Arrange
      const expected = "...";

      // Act
      const result = await flattener.flatten();

      // Assert
      expect(result.flattenedSource).to.equal(expected);
      expect(result.stats.totalContracts).to.equal(4); // Diamond + 3 facets
    });

    it("should handle missing facet gracefully", async () => {
      // Arrange
      mockHRE.config.diamonds.paths.TestDiamond.contractsPath = "/invalid";

      // Act & Assert
      await expect(flattener.flatten()).to.be.rejectedWith("Facet not found");
    });
  });
});
```

### 6.3 Documentation Structure

**docs/tasks/diamond-flatten.md:**

- Overview (2-3 paragraphs)
- Quick Start (basic CLI example)
- CLI Usage (all arguments explained)
- Programmatic Usage (TypeScript examples)
- Output Format (selector table example)
- Troubleshooting (common errors)
- Limitations (known issues)

**JSDoc Example:**

````typescript
/**
 * Flattens a Diamond contract with all facets into a single Solidity file.
 *
 * @param hre - Hardhat Runtime Environment
 * @param options - Flatten configuration options
 * @returns Promise resolving to flatten result with source and metadata
 * @throws {DiamondNotFoundError} If diamond configuration doesn't exist
 * @throws {FacetNotFoundError} If any facet contract is missing
 *
 * @example
 * ```typescript
 * const result = await flattenDiamond(hre, {
 *   diamondName: 'MyDiamond',
 *   verbose: true
 * });
 * console.log(result.stats.totalSelectors);
 * ```
 */
export async function flattenDiamond(
  hre: HardhatRuntimeEnvironment,
  options: DiamondFlattenOptions,
): Promise<DiamondFlattenResult>;
````

---

## 7. Technical Considerations

### 7.1 Testing Framework Stack

- **Test Runner:** Mocha (already used in hardhat-diamonds)
- **Assertion Library:** Chai with chai-as-promised for async tests
- **Coverage Tool:** `c8` or `nyc` for Istanbul coverage reports
- **Mocking:** Sinon.js for HRE and file system mocks
- **Fixture Management:** Custom helper functions for loading test diamonds

### 7.2 CI/CD Pipeline Architecture

```yaml
# .github/workflows/test-flatten.yml
name: Test Diamond Flatten Feature

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [feature/diamond-flatten-*]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive # For git submodules

      - uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "yarn"

      - name: Install Dependencies
        run: yarn install --frozen-lockfile

      - name: Build Workspace Packages
        run: yarn workspace:build

      - name: Compile Contracts
        run: npx hardhat compile

      - name: Run Unit Tests
        run: yarn test:unit:flatten --coverage

      - name: Run Integration Tests
        run: yarn test:integration:flatten

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
          flags: flatten-feature

      - name: Check Coverage Threshold
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 90" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 90% threshold"
            exit 1
          fi
```

### 7.3 Dependencies

**New Dev Dependencies:**

- `@types/sinon` - Type definitions for mocking
- `sinon` - Mocking library for unit tests
- `c8` or `nyc` - Code coverage reporting
- `chai-as-promised` - Async assertion helpers

**Existing Dependencies (reused):**

- `mocha` - Test runner
- `chai` - Assertion library
- `hardhat` - Runtime environment

### 7.4 File System Mocking Strategy

```typescript
// test/utils/mockHRE.ts
import { HardhatRuntimeEnvironment } from "hardhat/types";
import sinon from "sinon";

export function createMockHRE(
  overrides?: Partial<HardhatRuntimeEnvironment>,
): HardhatRuntimeEnvironment {
  const mockConfig = {
    diamonds: {
      paths: {
        TestDiamond: {
          contractsPath: "/mock/contracts",
          deploymentsPath: "/mock/deployments",
        },
      },
    },
    paths: {
      sources: "/mock/contracts",
      artifacts: "/mock/artifacts",
    },
  };

  return {
    config: mockConfig,
    artifacts: createMockArtifacts(),
    ...overrides,
  } as HardhatRuntimeEnvironment;
}
```

### 7.5 Test Execution Time Budget

| Test Category     | Target Time     | Number of Tests | Avg per Test |
| ----------------- | --------------- | --------------- | ------------ |
| Unit Tests        | <10 seconds     | ~40 tests       | <250ms       |
| Integration Tests | <20 seconds     | ~15 tests       | <1.33s       |
| **Total Suite**   | **<30 seconds** | **~55 tests**   | **<545ms**   |

**Optimization Strategies:**

- Run unit tests in parallel where possible
- Reuse compiled contracts across integration tests
- Use in-memory file systems for fixtures
- Skip unnecessary Hardhat compilations in unit tests

---

## 8. Success Metrics

| Metric                      | Target                      | Measurement Method          |
| --------------------------- | --------------------------- | --------------------------- |
| Unit Test Coverage          | ≥90%                        | Coverage report from c8/nyc |
| Integration Test Coverage   | 100% scenarios passing      | Test execution results      |
| Test Execution Time         | <30 seconds                 | CI/CD pipeline timing       |
| Documentation Completeness  | 100% public APIs documented | JSDoc coverage check        |
| User Documentation Examples | ≥5 working examples         | Manual review               |
| CI/CD Pass Rate             | 100% on main branch         | GitHub Actions status       |
| Code Review Approval        | 2+ approvals required       | GitHub PR settings          |
| Zero Regressions            | No existing tests broken    | Test comparison report      |

---

## 9. Implementation Phases

### Phase 1: Unit Test Foundation (Days 1-3)

- Set up test infrastructure (mocks, fixtures, helpers)
- Implement unit tests for DiamondFlattener
- Implement unit tests for SourceResolver
- Implement unit tests for DependencyGraph
- Implement unit tests for OutputFormatter
- **Milestone:** Achieve 90% coverage on core modules

### Phase 2: Integration Testing (Days 4-5)

- Create test fixture diamonds (simple, complex, edge-cases)
- Implement integration test suite
- Validate compilation of flattened outputs
- Test CLI argument handling
- **Milestone:** All integration scenarios passing

### Phase 3: Documentation (Days 6-7)

- Write user-facing task documentation
- Add JSDoc comments to all public APIs
- Update main README with flatten section
- Create troubleshooting guide
- **Milestone:** 100% documentation coverage

### Phase 4: CI/CD Integration (Day 8)

- Create GitHub Actions workflow
- Configure coverage reporting
- Add status badges to README
- Test workflow with sample PRs
- **Milestone:** Automated testing operational

### Phase 5: Final Validation (Day 9)

- End-to-end testing of complete feature
- Performance validation (<30s target)
- Documentation review and polish
- Fix any remaining issues
- **Milestone:** Epic 6 complete and ready for merge

---

## 10. Open Questions

| Question ID | Question                                                                                  | Priority | Resolution Needed By |
| ----------- | ----------------------------------------------------------------------------------------- | -------- | -------------------- |
| Q1          | Should we include visual ASCII diagrams in documentation showing Diamond structure?       | Low      | Phase 3              |
| Q2          | Do we want to support custom output formatters (e.g., JSON export of selector mappings)?  | Low      | Epic 7 (future)      |
| Q3          | Should integration tests run against actual deployed diamonds on a local Hardhat network? | Medium   | Phase 2 start        |
| Q4          | Do we need separate workflows for unit vs integration tests, or combined?                 | Low      | Phase 4 start        |
| Q5          | Should we generate TypeDoc HTML documentation in addition to markdown?                    | Low      | Epic 7 (future)      |

---

## 11. Acceptance Criteria Summary

**Epic 6 is considered complete when:**

✅ All unit tests implemented with ≥90% coverage  
✅ All integration test scenarios passing  
✅ Full test suite executes in <30 seconds  
✅ Complete user documentation in `docs/tasks/diamond-flatten.md`  
✅ All public APIs have JSDoc comments  
✅ GitHub Actions workflow operational and passing  
✅ Coverage reports integrated with CI/CD  
✅ README updated with flatten task overview  
✅ No P0 or P1 bugs remaining  
✅ Code review approved by 2+ maintainers

---

## 12. Dependencies & Risks

### Dependencies

- **Epic 5 completion:** Task registration and error handling must be complete
- **Test fixtures:** Require valid Diamond configurations from main project
- **CI/CD access:** Need GitHub Actions permissions configured

### Risks

| Risk                                | Impact | Mitigation                                                        |
| ----------------------------------- | ------ | ----------------------------------------------------------------- |
| Test execution time exceeds 30s     | High   | Profile slow tests, optimize fixtures, parallelize where possible |
| Coverage tool compatibility issues  | Medium | Test with both c8 and nyc early, choose most reliable             |
| Complex integration tests are flaky | High   | Use deterministic test data, avoid timing-dependent assertions    |
| Documentation becomes stale         | Medium | Automate doc generation where possible, link to code examples     |
| CI/CD pipeline fails in PR workflow | High   | Test workflow extensively before requiring for PRs                |

---

## Appendix A: Test File Structure

```
packages/hardhat-diamonds/
├── test/
│   ├── unit/
│   │   └── lib/
│   │       ├── DiamondFlattener.test.ts       (8 test cases, ~250ms)
│   │       ├── SourceResolver.test.ts         (10 test cases, ~200ms)
│   │       ├── DependencyGraph.test.ts        (12 test cases, ~300ms)
│   │       └── OutputFormatter.test.ts        (10 test cases, ~150ms)
│   ├── integration/
│   │   └── flatten.test.ts                    (15 test cases, ~20s total)
│   ├── fixtures/
│   │   └── flatten/
│   │       ├── simple/
│   │       ├── complex/
│   │       ├── with-init/
│   │       ├── with-libraries/
│   │       └── edge-cases/
│   └── utils/
│       ├── mockHRE.ts
│       ├── fixtureLoader.ts
│       └── testHelpers.ts
```

---

## Appendix B: Coverage Report Example

```
File                       | % Stmts | % Branch | % Funcs | % Lines |
---------------------------|---------|----------|---------|---------|
All files                  |   92.45 |    88.23 |   94.11 |   93.67 |
 lib/                      |   93.12 |    90.45 |   95.00 |   94.23 |
  DiamondFlattener.ts      |   94.56 |    91.30 |   96.15 |   95.12 |
  SourceResolver.ts        |   92.34 |    89.47 |   93.75 |   93.21 |
  DependencyGraph.ts       |   91.87 |    88.88 |   94.44 |   92.56 |
  OutputFormatter.ts       |   93.45 |    91.66 |   95.83 |   94.01 |
 tasks/                    |   90.23 |    85.71 |   92.30 |   91.45 |
  diamond-flatten.ts       |   90.23 |    85.71 |   92.30 |   91.45 |
```

---

**Document Status:** Ready for Implementation  
**Next Steps:** Begin Phase 1 - Unit Test Foundation  
**Estimated Completion:** 9 working days (Sprint 4)
