# Tasks: Forge Diamond Fuzzing Implementation

## Relevant Files

- `test/foundry/helpers/DiamondABILoader.sol` - Library for loading and parsing Diamond ABI files (✅ Task 1.0)
- `test/foundry/helpers/DiamondABILoader.t.sol` - Test suite for DiamondABILoader (11/11 tests passing)
- `test/foundry/helpers/README_DiamondABILoader.md` - Documentation for ABI loading infrastructure (✅ Task 1.6)
- `test/foundry/poc/DiamondABILoadingPOC.t.sol` - Initial proof-of-concept tests (✅ Task 1.1-1.2)
- `test/foundry/poc/DiamondABIDebugTest.t.sol` - Debug tests for JSON parsing behavior
- `test/foundry/poc/JSONParseTest.t.sol` - Tests for vm.parseJson() empty array handling
- `foundry.toml` - Updated with file access permissions for Diamond ABI directory
- `test/foundry/helpers/DiamondFuzzBase.sol` - Abstract base contract for Diamond fuzzing tests with helper functions (✅ Task 3.2-3.14)
- `test/foundry/helpers/DiamondFuzzBase.t.sol` - Unit tests for DiamondFuzzBase helper library (✅ Task 3.15-3.18, 8/8 passing)
- `foundry.toml` - Updated with file access permissions for Diamond deployment files
- `test/foundry/fuzz/AccessControlFuzz.t.sol` - Fuzzing tests for ExampleAccessControl facet functions (✅ Task 4.2-4.15, 14 tests)
- `test/foundry/fuzz/DiamondRouting.t.sol` - Tests validating function selector routing to correct facets (✅ Task 4.16-4.20, 13 tests)
- `test/foundry/fuzz/DiamondInvariants.t.sol` - Invariant tests for Diamond state consistency (✅ Task 4.21-4.29, 14 tests)
- `scripts/test-deploy-diamond.ts` - TypeScript script to deploy ExampleDiamond for testing using LocalDiamondDeployer (✅ Task 2.2-2.6)
- `scripts/foundry/deploy-for-tests.sh` - Shell wrapper to manage deployment and save Diamond address (✅ Task 2.7-2.10)
- `.forge-diamond-address` - File storing deployed Diamond address for Forge tests (git-ignored, ✅ Task 2.4)
- `diamonds/ExampleDiamond/deployments/examplediamond-localhost-31337.json` - Full deployment data with facet addresses (✅ Task 2.2, 2.5)
- `diamond-abi/ExampleDiamond.json` - Generated Diamond ABI (already exists, used by tests)
- `.gitignore` - Updated to ignore test deployment artifacts (✅ Task 2.12)
- `package.json` - Added test:deploy-diamond and test:deploy-with-node scripts

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `DiamondFuzzBase.sol` and `DiamondFuzzBase.t.sol` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run Hardhat tests.
- Use `forge test --match-path test/foundry/fuzz/*` to run only fuzzing tests.
- Use `forge test --gas-report` to see gas consumption metrics.
- The Diamond ABI file is regenerated on each `yarn compile` - ensure compilation before running tests.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch for this feature (e.g., `git checkout -b feature/forge-diamond-fuzzing`)
  - [x] 0.2 Verify you are on the correct branch (`git branch --show-current`)
- [x] 1.0 Setup Diamond ABI loading infrastructure
  - [x] 1.1 Research and test `vm.parseJson()` cheatcode capability with Diamond ABI file
  - [x] 1.2 Create proof-of-concept test that successfully reads `./diamond-abi/ExampleDiamond.json`
  - [x] 1.3 Extract function selectors from the Diamond ABI JSON using `vm.parseJson()`
  - [x] 1.4 Extract function signatures from the Diamond ABI JSON for call encoding
  - [x] 1.5 Verify that extracted selectors match the actual Diamond deployment
  - [x] 1.6 Document the ABI loading approach and any limitations discovered
  - [x] 1.7 Create fallback strategy if `vm.parseJson()` has issues (e.g., using `vm.ffi()` or preprocessing)
- [x] 2.0 Create Hardhat deployment script for local testing
  - [x] 2.1 Review existing Hardhat deployment for ExampleDiamond in the tests using LocalDiamondDeployer
  - [x] 2.2 Create `scripts/forge-test-deploy-diamond.ts` that uses the same method for deploying ExampleDiamond to local Hardhat node as the current hardhat tests, by getting an instance of LocalDiamondDeployer configured to writeDiamondDeployedData to true which will write the deployed diamond data to `diamonds/ExampleDiamond/examplediamond-hardhat-31337.json`
  - [x] 2.3 Configure the deployment script to use Hardhat's default test accounts (no private keys needed)
  - [x] 2.4 Add getter logic to access the deployed Diamond address from the Diamond deployment record via the LocalDiamondDeployer instance using `getDeployedDiamondData()`
  - [x] 2.5 Include deployed facet addresses in the saved deployment info (for verification)
  - [x] 2.6 Add error handling for deployment failures (retry logic per FR2.2 requirements)
  - [x] 2.7 Create `scripts/foundry/deploy-for-tests.sh` shell script wrapper
  - [x] 2.8 Implement logic in shell script to start Hardhat node in background (if not running)
  - [x] 2.9 Add wait/retry logic to ensure Hardhat node is ready before deployment
  - [x] 2.10 Call the TypeScript deployment script from the shell wrapper
  - [x] 2.13 Test the deployment script manually to verify it works correctly
- [x] 3.0 Develop reusable Diamond testing library (DiamondFuzzBase)
  - [x] 3.1 Create directory structure `test/foundry/helpers/` if it doesn't exist
  - [x] 3.2 Create `test/foundry/helpers/DiamondFuzzBase.sol` as abstract contract
  - [x] 3.3 Import necessary dependencies (Test from forge-std, IDiamond interfaces, etc.)
  - [x] 3.4 Add state variable to store the deployed Diamond address
  - [x] 3.5 Implement `_loadDiamondAddress()` internal function to read from `getDeployedDiamondData()`
  - [x] 3.6 Implement `_loadDiamondABI()` internal function using `vm.parseJson()` approach
  - [x] 3.7 Create helper function `_callDiamond(bytes4 selector, bytes memory data)` for low-level calls
  - [x] 3.8 Create helper function `_callDiamondWithValue(bytes4 selector, bytes memory data, uint256 value)` for payable calls
  - [x] 3.9 Add helper function `_expectDiamondRevert(bytes4 selector, bytes memory data, bytes memory expectedError)`
  - [x] 3.10 Implement helper to verify function selector routes to expected facet address
  - [x] 3.11 Add gas profiling helper `_measureDiamondGas(bytes4 selector, bytes memory data)` returns gas used
  - [x] 3.12 Create helper to get Diamond owner and perform ownership checks
  - [x] 3.13 Add `setUp()` function that calls `_loadDiamondAddress()` and `_loadDiamondABI()`
  - [x] 3.14 Include comprehensive inline documentation with NatSpec comments
  - [x] 3.15 Create `test/foundry/helpers/DiamondFuzzBase.t.sol` for testing the helper library itself
  - [x] 3.16 Write unit tests verifying each helper function works correctly
  - [x] 3.17 Test that the base contract properly loads Diamond address and ABI
  - [x] 3.18 Ensure all tests pass before moving to next task
- [x] 4.0 Implement comprehensive fuzzing tests
  - [x] 4.1 Create directory `test/foundry/fuzz/` if it doesn't exist
  - [x] 4.2 Create `test/foundry/fuzz/AccessControlFuzz.t.sol` inheriting from DiamondFuzzBase
  - [x] 4.3 Add test preamble with SPDX, pragma, and imports
  - [x] 4.4 Define role constants from ExampleAccessControl (e.g., DEFAULT_ADMIN_ROLE, MINTER_ROLE)
  - [x] 4.5 Implement `testFuzz_GrantRole` - fuzz with random addresses and role values
  - [x] 4.6 Use `vm.assume()` to constrain role parameter to valid role values (FR4.5)
  - [x] 4.7 Add assertions to verify role was granted correctly using `hasRole()`
  - [x] 4.8 Implement `testFuzz_RevokeRole` - fuzz role revocation with random inputs
  - [x] 4.9 Verify that revoked addresses no longer have the role
  - [x] 4.10 Implement `testFuzz_RenounceRole` - test role renunciation from random addresses
  - [x] 4.11 Add test for unauthorized access attempts (should revert) using `vm.expectRevert()`
  - [x] 4.12 Implement `testFuzz_OnlyRoleModifier` - verify modifier prevents unauthorized calls
  - [x] 4.13 Test role admin functions with fuzzing (getRoleAdmin, setRoleAdmin)
  - [x] 4.14 Configure fuzzing runs to at least 256 (aim for 1000+ per PRD success metrics)
  - [x] 4.15 Add gas profiling to access control tests using helper functions
  - [x] 4.16 Create `test/foundry/fuzz/DiamondRouting.t.sol` for selector routing tests (FR4.1)
  - [x] 4.17 Implement test that validates function selectors route to correct facet addresses
  - [x] 4.18 Use DiamondLoupe interface to query facet addresses for each selector
  - [x] 4.19 Fuzz with random selectors and verify correct routing or revert for invalid selectors
  - [x] 4.20 Add test for function selector collision detection (should not have collisions)
  - [x] 4.21 Create `test/foundry/fuzz/DiamondInvariants.t.sol` for state consistency tests (FR4.3)
  - [x] 4.22 Define invariants that must hold after any valid function sequence
  - [x] 4.23 Implement `invariant_OwnershipConsistency` - owner should always be valid address
  - [x] 4.24 Implement `invariant_RoleHierarchy` - admin roles should maintain proper hierarchy
  - [x] 4.25 Implement `invariant_FacetAddressesValid` - all facet addresses should be non-zero and contain code
  - [x] 4.26 Add `invariant_NoSelectorCollisions` - no duplicate function selectors across facets
  - [x] 4.27 Use Foundry's invariant testing features with multiple random function calls
  - [x] 4.28 Add gas assertions to ensure gas consumption stays within acceptable bounds (FR4.4)
  - [x] 4.29 Create gas benchmarks for common operations (grant role, revoke role, call through diamond)
  - [x] 4.30 Run all fuzzing tests and verify they pass with at least 256 runs each
  - [x] 4.31 Fix any failing tests and document edge cases discovered
  - [x] 4.32 Verify all tests work with `--fork-url` pointing to local Hardhat node
- [ ] 5.0 Add documentation and CI/CD integration
  - [ ] 5.1 Create `test/foundry/helpers/README.md` with comprehensive usage documentation
  - [ ] 5.2 Document the purpose of DiamondFuzzBase and its helper functions
  - [ ] 5.3 Provide code examples showing how to inherit from DiamondFuzzBase
  - [ ] 5.4 Include step-by-step guide for writing new Diamond fuzzing tests
  - [ ] 5.5 Document the deployment workflow (how to deploy Diamond before tests)
  - [ ] 5.6 Explain the Diamond ABI loading mechanism and any limitations
  - [ ] 5.7 Add troubleshooting section for common issues (node not running, ABI not found, etc.)
  - [ ] 5.8 Update root `README.md` or relevant docs to mention the new fuzzing capability
  - [ ] 5.9 Add usage examples with actual test code snippets
  - [ ] 5.10 Document how to run fuzzing tests with different run counts (e.g., `FOUNDRY_FUZZ_RUNS=1000`)
  - [ ] 5.11 Update `package.json` to add convenience scripts for fuzzing tests
  - [ ] 5.12 Add `forge:test:fuzz` script that runs only fuzzing tests
  - [ ] 5.13 Add `forge:test:fuzz:ci` script for CI/CD with appropriate settings
  - [ ] 5.14 Create or update `forge:test:deploy` script that deploys Diamond then runs tests
  - [ ] 5.15 Document integration with existing `yarn forge:test` workflow
  - [ ] 5.16 Test the entire workflow from scratch (clean state to passing tests)
  - [ ] 5.17 Update `.github/workflows` or CI configuration to include fuzzing tests
  - [ ] 5.18 Ensure CI deploys Diamond before running Forge fuzzing tests
  - [ ] 5.19 Configure CI to fail if fuzzing tests don't meet minimum run threshold
  - [ ] 5.20 Add CI job to report gas usage metrics from fuzzing tests
  - [ ] 5.21 Create example demonstration showing the fuzzing tests in action
  - [ ] 5.22 Document success metrics and how to verify they are met (per PRD)
  - [ ] 5.23 Add notes about extending the framework to other Diamond implementations
  - [ ] 5.24 Review all documentation for clarity and completeness
  - [ ] 5.25 Run complete test suite (Hardhat + Foundry) to ensure nothing broke
  - [ ] 5.26 Create summary document of what was implemented and how to use it
