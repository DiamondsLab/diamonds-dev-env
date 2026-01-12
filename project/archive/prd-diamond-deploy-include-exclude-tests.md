# Product Requirements Document: Diamond Deployment Include/Exclude Testing

## Introduction/Overview

The ERC-2535 Diamond Proxy pattern allows modular smart contract development through facets. Currently, the `@diamondslab/diamonds` module supports `deployInclude` and `deployExclude` configuration options to override default function selector registration behavior. However, this critical functionality lacks comprehensive test coverage, and its correctness has not been validated.

This feature will implement a test-driven development approach to:

1. Create comprehensive tests validating `deployInclude` and `deployExclude` behavior
2. Identify and fix any bugs in the selector registration logic within `BaseDeploymentStrategy.ts`
3. Ensure function selectors are correctly registered according to configuration rules

**Problem Statement:** Without proper testing, we cannot guarantee that `deployInclude` and `deployExclude` configurations work as intended, potentially leading to incorrect Diamond deployments where function selectors are registered with wrong facets or missing entirely.

**Goal:** Validate and ensure correct implementation of `deployInclude` and `deployExclude` functionality through comprehensive testing, fixing any discovered issues.

## Goals

1. **Test Coverage:** Create unit, integration, and E2E tests for `deployInclude` and `deployExclude` functionality
2. **Validation:** Verify that function selectors are registered with the correct facets based on configuration
3. **Bug Detection:** Identify any issues in the current `BaseDeploymentStrategy` selector registration logic
4. **Bug Resolution:** Fix any discovered bugs to ensure correct behavior
5. **Documentation:** Provide clear examples of how `deployInclude` and `deployExclude` should be used

## User Stories

### Story 1: Testing deployExclude Behavior

**As a** Diamond contract developer  
**I want to** exclude specific function selectors from a facet during deployment  
**So that** I can register them with a different facet that has lower priority (higher priority number)

**Acceptance Criteria:**

- When using `examplediamond-exclude.config.json` configuration
- The `testDeployExclude()` function selector (0xdc38f9ab) should NOT be registered with `ExampleTestDeployExcludeFacet`
- The `testDeployExclude()` function selector should BE registered with `ExampleTestDeployIncludeFacet` (which has lower priority)
- Tests validate this behavior through deployment and selector inspection

### Story 2: Testing deployInclude Behavior

**As a** Diamond contract developer  
**I want to** explicitly include specific function selectors for a facet during deployment  
**So that** I can override the default registration and ensure they're registered with the correct facet

**Acceptance Criteria:**

- When using `examplediamond-include.config.json` configuration
- The `testDeployInclude()` function selector (0x7f0c610c) should BE registered with `ExampleTestDeployIncludeFacet`
- Tests validate this behavior through deployment and selector inspection

### Story 3: Configuration Validation

**As a** Diamond contract developer  
**I want to** receive clear error messages when my configuration is invalid  
**So that** I can quickly identify and fix configuration issues

**Acceptance Criteria:**

- If `deployExclude` references a function that doesn't exist in the contract, deployment fails with descriptive error
- Error message clearly indicates which function and facet caused the issue
- Tests validate error handling behavior

## Functional Requirements

### FR1: Test Infrastructure Setup

1.1. Verify the two new test facet contracts:

- `ExampleTestDeployExclude.sol` with functions: `testDeployExclude()` and `testDeployInclude()`
- `ExampleTestDeployInclude.sol` with functions: `testDeployExclude()` and `testDeployInclude()`

  1.2. Verify two test configuration files:

- `examplediamond-exclude.config.json` (protocolVersion 1.0) with `ExampleTestDeployExcludeFacet` having `deployExclude: "testDeployExclude()"`
- `examplediamond-include.config.json` (protocolVersion 2.0) with `ExampleTestDeployIncludeFacet` having `deployInclude: "testDeployInclude()"`

  1.3. Verify facet priorities:

- `ExampleTestDeployExcludeFacet`: priority 50
- `ExampleTestDeployIncludeFacet`: priority 60 (lower priority)

### FR2: Unit Tests

2.1. Test selector calculation:

- Verify `testDeployExclude()` computes to selector `0xdc38f9ab`
- Verify `testDeployInclude()` computes to selector `0x7f0c610c`

  2.2. Test configuration parsing:

- Verify `deployExclude` arrays are correctly parsed from config files
- Verify `deployInclude` arrays are correctly parsed from config files
- Verify function signature to selector conversion

### FR3: Integration Tests

3.1. Test `deployExclude` behavior:

- Deploy Diamond using `examplediamond-exclude.config.json`
- Verify `testDeployExclude()` selector is NOT in `ExampleTestDeployExcludeFacet`'s registered selectors
- Verify `testDeployExclude()` selector IS in `ExampleTestDeployIncludeFacet`'s registered selectors
- Verify `testDeployInclude()` selector IS in `ExampleTestDeployIncludeFacet`'s registered selectors (default behavior)

  3.2. Test `deployInclude` behavior:

- Deploy Diamond using `examplediamond-include.config.json`
- Verify `testDeployInclude()` selector IS in `ExampleTestDeployIncludeFacet`'s registered selectors
- Verify both functions from both facets work correctly after deployment

  3.3. Test priority-based registration:

- When a function exists in multiple facets without `deployInclude`/`deployExclude`
- Verify selector is registered with the facet having higher priority (lower priority number)

### FR4: E2E Tests

4.1. Deploy to local Hardhat node:

- Start Hardhat node
- Deploy Diamond with exclude configuration
- Call `testDeployExclude()` via Diamond proxy and verify it executes from correct facet
- Deploy Diamond with include configuration
- Call `testDeployInclude()` via Diamond proxy and verify it executes from correct facet

  4.2. Create test template based on `DiamondDeployment.test.ts`:

- Follow existing test structure pattern from [test/deployment/DiamondDeployment.test.ts](../test/deployment/DiamondDeployment.test.ts)
- Use multichain test loop with `hardhat-multichain` provider management
- Implement snapshot management in `beforeEach`/`afterEach` for test isolation
- Use `LocalDiamondDeployer.getInstance(hre, config)` in `before` hook
- Load deployed Diamond contract using `loadDiamondContract<ExampleDiamond>()` utility
- Set up signers and owner in `before` hook following existing pattern
- Verify deployment records are correctly written
- Validate function selector registry matches expected configuration
- Use Chai `expect` assertions for validation

### FR5: Error Handling Tests

5.1. Invalid `deployExclude` configuration:

- Configure `deployExclude` with non-existent function name
- Verify deployment fails with descriptive error message
- Error should indicate: function name, facet name, and that function wasn't found

  5.2. Invalid `deployInclude` configuration:

- Configure `deployInclude` with non-existent function name
- Verify deployment fails with descriptive error message

### FR6: Bug Fixes in BaseDeploymentStrategy

6.1. If tests reveal bugs in `updateFunctionSelectorRegistryTasks()`:

- Analyze logic for handling `deployInclude` and `deployExclude`
- Fix selector registration to respect configuration overrides
- Ensure priority-based fallback works when no overrides specified

  6.2. If tests reveal bugs in `getFacetCuts()`:

- Verify facet cut operations correctly reflect configured selectors
- Ensure no orphaned selectors remain

## Non-Goals (Out of Scope)

1. **Version-specific behavior:** The `deployInclude`/`deployExclude` functionality is version-agnostic and works the same across all facet versions (0.0, 1.0, etc.)

2. **Testing other Diamond configurations:** This PRD focuses exclusively on `deployInclude` and `deployExclude`. Other configuration options (e.g., `upgradeInit`, `fromVersions`) are out of scope.

3. **UI/Frontend testing:** All tests are backend/smart contract focused. No frontend integration required.

4. **Gas optimization:** While important, gas optimization of the selector registration logic is not a goal of this feature.

5. **Multi-network deployments:** Tests will run on Hardhat local node only. Live network deployments are out of scope.

6. **Inverse validation tests:** We will NOT test that excluded selectors are absent from higher-priority facets, or that included selectors are absent from other facets. The default behavior is that all selectors are registered with the highest-priority facet, and `deployInclude`/`deployExclude` override this default.

## Design Considerations

### Test File Organization

```
test/deployment/
  ├── DeployIncludeExclude.test.ts (main integration/E2E tests)
  └── SelectorRegistration.test.ts (unit tests for selector logic)
```

### Configuration File Structure

- **exclude config:** Uses `deployExclude` on `ExampleTestDeployExcludeFacet` to move selector to lower-priority facet
- **include config:** Uses `deployInclude` on `ExampleTestDeployIncludeFacet` to explicitly include selector

### Test Patterns

Follow existing test structure patterns from `test/deployment/DiamondDeployment.test.ts`:

1. Network loop with `hardhat-multichain`
2. Singleton/Multiton deployment per network
3. `before` hooks for account setup
4. `beforeEach` hooks for test isolation
5. Chai `expect` assertions

## Technical Considerations

### Dependencies

- **Existing:** `@diamondslab/diamonds`, `@diamondslab/hardhat-diamonds`, `hardhat`, `ethers`, `chai`
- **Test frameworks:** Mocha (Hardhat tests), possibly Foundry (if Forge tests needed)

### Key Files to Modify/Create

- **Create:** `contracts/examplediamond/ExampleTestDeployExclude.sol`
- **Create:** `contracts/examplediamond/ExampleTestDeployInclude.sol`
- **Create:** `diamonds/ExampleDiamond/examplediamond-exclude.config.json`
- **Create:** `diamonds/ExampleDiamond/examplediamond-include.config.json`
- **Create:** `test/deployment/DeployIncludeExclude.test.ts`
- **Potentially modify:** `packages/diamonds/src/strategies/BaseDeploymentStrategy.ts` (if bugs found)

### Critical Implementation Details

1. **LocalDiamondDeployer Usage:**

   ```typescript
   // CRITICAL: Pass hre as first parameter to avoid HH9 circular dependency
   const deployer = await LocalDiamondDeployer.getInstance(hre, config);
   ```

2. **Function Selector Calculation:**
   - `testDeployExclude()` → `0xdc38f9ab`
   - `testDeployInclude()` → `0x7f0c610c`

3. **Priority Rules:**
   - Higher priority = lower priority number
   - `ExampleTestDeployExcludeFacet` (priority 50) > `ExampleTestDeployIncludeFacet` (priority 60)
   - By default, duplicate selectors register with higher priority facet
   - `deployExclude` on priority 50 facet moves selector to priority 60 facet
   - `deployInclude` on priority 60 facet explicitly includes selector regardless of priority

### Areas to Investigate in BaseDeploymentStrategy

Focus on `updateFunctionSelectorRegistryTasks()` method (lines 219-361):

- How are function selectors extracted from facet contracts?
- Where is `deployExclude` configuration applied?
- Where is `deployInclude` configuration applied?
- How does priority-based registration work?
- Are there edge cases where configuration is ignored?

## Success Metrics

### Primary Success Criteria

1. **Test Coverage:** 100% coverage of `deployInclude` and `deployExclude` code paths
2. **Test Pass Rate:** All tests pass after any necessary bug fixes
3. **Bug Resolution:** All bugs discovered in `BaseDeploymentStrategy` are fixed and validated

### Validation Criteria

1. **deployExclude test:** Selector `0xdc38f9ab` successfully moves from priority 50 to priority 60 facet
2. **deployInclude test:** Selector `0x7f0c610c` successfully registers with configured facet
3. **Error handling:** Invalid configurations produce clear, actionable error messages
4. **E2E validation:** Deployed Diamonds correctly execute functions from expected facets

## Open Questions

### Pre-Development Questions

1. Should we add TypeChain type regeneration to the test setup, or assume types are current?
   - **Recommendation:** Add `yarn diamond:generate-abi-typechain` to test setup to ensure types match configs

2. Should tests use existing `examplediamond.config.json` as baseline, or deploy fresh Diamonds?
   - **Recommendation:** Deploy fresh Diamonds with test configs to isolate functionality

3. Do we need Foundry tests in addition to Hardhat tests?
   - **Recommendation:** Start with Hardhat tests; add Foundry if needed for fuzzing

### Post-Development Questions

1. If bugs are found, should we create separate issues for fixing them, or fix them as part of this feature?
   - **Answer per requirements:** Fix bugs as part of this feature (Success Criteria 5B)

2. Should we add similar tests for other configuration options (e.g., `upgradeInit`)?
   - **Answer:** Out of scope for this PRD, but recommended for future work

3. Should we update documentation to include these test examples?
   - **Recommendation:** Yes, update relevant docs with test patterns as examples

## Implementation Notes

### Development Workflow

1. **Phase 1:** Create test facet contracts and configuration files (✅ Already complete)
2. **Phase 2:** Write unit tests for selector calculation and config parsing
3. **Phase 3:** Write integration tests for `deployExclude` behavior
4. **Phase 4:** Write integration tests for `deployInclude` behavior
5. **Phase 5:** Write E2E tests with local Hardhat node deployment
6. **Phase 6:** Write error handling tests
7. **Phase 7:** Run tests and identify any bugs
8. **Phase 8:** Fix bugs in `BaseDeploymentStrategy` if needed
9. **Phase 9:** Verify all tests pass

### Git Strategy

- Branch: `feature/diamond-include-exclude-tests` (✅ Already created and checked out)
- Commit strategy: Follow task-list management instructions
  - Commit after each completed sub-task
  - Use conventional commit format (feat:, fix:, test:)
  - Run full test suite before each commit

### Testing Strategy

```bash
# Run specific test file
yarn test test/deployment/DeployIncludeExclude.test.ts

# Run all deployment tests
yarn test test/deployment

# Run all tests
yarn test

# Compile and regenerate types
yarn compile
yarn diamond:generate-abi-typechain --diamond-name ExampleDiamond
```

## Acceptance Criteria Summary

✅ **Complete when:**

1. All test files created and located in `test/deployment/`
2. Tests validate both `deployExclude` and `deployInclude` configurations
3. Tests verify function selectors register with correct facets
4. Error handling tests validate clear error messages for invalid configs
5. Any bugs in `BaseDeploymentStrategy` are identified and fixed
6. All tests pass consistently
7. Code follows existing project patterns and conventions
8. Changes are committed following task-list management instructions

## References

- **ERC-2535 Diamond Standard:** https://eips.ethereum.org/EIPS/eip-2535
- **Project Architecture:** [/workspaces/diamonds_dev_env/docs/PROJECT_OVERVIEW.md](../docs/PROJECT_OVERVIEW.md)
- **Test Patterns:** [/workspaces/diamonds_dev_env/test/README.md](../test/README.md)
- **Build Process:** [/workspaces/diamonds_dev_env/docs/BUILD_AND_DEPLOYMENT.md](../docs/BUILD_AND_DEPLOYMENT.md)
- **BaseDeploymentStrategy:** [/workspaces/diamonds_dev_env/packages/diamonds/src/strategies/BaseDeploymentStrategy.ts](../packages/diamonds/src/strategies/BaseDeploymentStrategy.ts)
