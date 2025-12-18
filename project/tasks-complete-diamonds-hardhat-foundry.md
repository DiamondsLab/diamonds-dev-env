# Task List: Complete diamonds-hardhat-foundry Module

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch for diamonds-hardhat-foundry completion
  - [x] 0.1 Checkout new branch: `git checkout -b feature/complete-diamonds-hardhat-foundry`

- [ ] 1.0 Fix Dynamic Helper Generation (Critical Path)
  - [x] 1.1 Read current `HelperGenerator.generateDeploymentHelper()` implementation
  - [x] 1.2 Update method signature to accept `DeployedDiamondData` object instead of reading from file
  - [x] 1.3 Remove hardcoded addresses from template - use template variables
  - [x] 1.4 Add `deployerAddress` field to template from `deploymentData.DeployerAddress`
  - [x] 1.5 Add `DiamondAddress` from `deploymentData.DiamondAddress`
  - [x] 1.6 Iterate `deploymentData.DeployedFacets` to generate facet address constants
  - [x] 1.7 Add timestamp and source file path as comments in generated file
  - [x] 1.8 Update `ForgeFuzzingFramework.runTests()` to call helper generator with deployment data
  - [x] 1.9 Test helper generation produces correct addresses

- [x] 2.0 Fix Deployment Management ✅ with writeDeployedDiamondData Control
  - [x] 2.1 Read current `DeploymentManager.ensureDeployment()` implementation
  - [x] 2.2 Add `writeDeployedDiamondData?: boolean` parameter to `ensureDeployment()`
  - [x] 2.3 Add `writeDeployedDiamondData?: boolean` parameter to `deploy()` method
  - [x] 2.4 Pass `writeDeployedDiamondData` to `LocalDiamondDeployer` config
  - [x] 2.5 Update `getDeployment()` to work with in-memory deployments
  - [x] 2.6 Test deployment with `writeDeployedDiamondData: false` (ephemeral)
  - [x] 2.7 Test deployment with `writeDeployedDiamondData: true` (persistent)
  - [x] 2.8 Verify no files written when `writeDeployedDiamondData: false`

- [x] 3.0 Update Test Task with New Flags ✅
  - [x] 3.1 Read current `diamonds-forge:test` task implementation
  - [x] 3.2 Add `.addFlag("saveDeployment", "Write deployment data to file for reuse")`
  - [x] 3.3 Add `.addFlag("useSnapshot", "Use EVM snapshots for test isolation")`
  - [x] 3.4 Pass `saveDeployment` flag to `DeploymentManager` as `writeDeployedDiamondData`
  - [x] 3.5 Pass `useSnapshot` flag to `ForgeFuzzingFramework`
  - [x] 3.6 Update task to default `writeDeployedDiamondData: false` for tests
  - [x] 3.7 Test task with no flags (ephemeral deployment)
  - [x] 3.8 Test task with `--save-deployment` flag

- [ ] 4.0 Complete Integration Tests
  - [x] 4.1 Implement `test/foundry/integration/diamonds-hardhat-foundry/deployment.t.sol` ✅
    - [x] 4.1.1 Add test for DeploymentManager creates valid Diamond
    - [x] 4.1.2 Add test verifying deployment data includes all required fields
    - [x] 4.1.3 Add test that Diamond address has code deployed
    - [x] 4.1.4 Add test that all facets have code deployed
    - [x] 4.1.5 Add test verifying ABI file is generated
  - [x] 4.2 Implement `test/foundry/integration/diamonds-hardhat-foundry/helper-generation.t.sol` ✅
    - [x] 4.2.1 Add test that HelperGenerator creates DiamondDeployment.sol
    - [x] 4.2.2 Add test verifying generated file compiles
    - [x] 4.2.3 Add test that getDiamondAddress() returns correct address
    - [x] 4.2.4 Add test that getFacetAddress() returns correct facet addresses
    - [x] 4.2.5 Add test verifying deployer address is accessible
  - [x] 4.3 Implement `test/foundry/integration/diamonds-hardhat-foundry/end-to-end.t.sol` ✅
    - [x] 4.3.1 Add test for complete workflow: deploy → generate helpers → run tests
    - [x] 4.3.2 Add test with writeDeployedDiamondData: false (ephemeral)
    - [x] 4.3.3 Add test with writeDeployedDiamondData: true (persistent)
    - [x] 4.3.4 Add test for helper regeneration after facet upgrade
    - [x] 4.3.5 Add test verifying cleanup after test run
  - [x] 4.4 Update `test/foundry/helpers/DiamondABILoader.t.sol` ✅
    - [x] 4.4.1 Ensure test loads Diamond ABI from correct path
    - [x] 4.4.2 Ensure test extracts function selectors correctly
    - [x] 4.4.3 Ensure test extracts function signatures correctly
    - [x] 4.4.4 Ensure test validates selector-signature correspondence
    - [x] 4.4.5 Ensure test verifies selectors match on-chain Diamond
  - [x] 4.5 Fix `test/foundry/poc/DiamondABIDebugTest.t.sol` ✅
    - [x] 4.5.1 Fix JSON parsing to handle all ABI entry types
    - [x] 4.5.2 Fix handling of functions with no inputs
    - [x] 4.5.3 Fix handling of functions with multiple inputs
    - [x] 4.5.4 Ensure no reverts during extraction
  - [x] 4.6 Update `test/foundry/integration/ExampleIntegration.t.sol` ✅
    - [x] 4.6.1 Ensure test loads Diamond via DiamondDeployment.getDiamondAddress()
    - [x] 4.6.2 Add actual multi-facet interaction workflow test
    - [x] 4.6.3 Add actual cross-facet state management test
    - [x] 4.6.4 Use DiamondForgeHelpers.assertValidDiamond()
  - [x] 4.7 Verify `test/foundry/integration/BasicDiamondIntegration.t.sol`
    - [x] 4.7.1 Ensure test deploys its own Diamond in setUp()
    - [x] 4.7.2 Ensure all tests pass (self-deploying pattern)
  - [x] 4.8 Update `test/foundry/integration/BasicDiamondIntegrationDeployed.t.sol`
    - [x] 4.8.1 Ensure test extends DiamondFuzzBase correctly
    - [x] 4.8.2 Ensure test loads Diamond from deployment
    - [x] 4.8.3 Add override for \_loadDiamondAddress() using DiamondDeployment
    - [x] 4.8.4 Ensure all tests work with deployed Diamond
  - [x] 4.9 Run all integration tests and verify they pass
    - [x] 4.9.1 Run: `npx hardhat diamonds-forge:test --match-contract "Deployment"`
    - [x] 4.9.2 Run: `npx hardhat diamonds-forge:test --match-contract "HelperGeneration"`
    - [x] 4.9.3 Run: `npx hardhat diamonds-forge:test --match-contract "EndToEnd"`
    - [x] 4.9.4 Run: `npx hardhat diamonds-forge:test --match-contract "DiamondABILoader"`
    - [x] 4.9.5 Run: `npx hardhat diamonds-forge:test --match-contract "ExampleIntegration"`
    - [x] 4.9.6 Run: `npx hardhat diamonds-forge:test` (all tests)

- [x] 5.0 Add Snapshot/Restore Support
  - [x] 5.1 Add snapshot helpers to `contracts/DiamondForgeHelpers.sol`
    - [x] 5.1.1 Add `snapshotState() internal returns (uint256 snapshotId)` function
    - [x] 5.1.2 Add `revertToSnapshot(uint256 snapshotId) internal` function
  - [x] 5.2 Update `ForgeFuzzingFramework` to support snapshots
    - [x] 5.2.1 Detect if network supports snapshots (check if localhost/hardhat with running node)
    - [x] 5.2.2 Take snapshot before running tests if `useSnapshot: true`
    - [x] 5.2.3 Restore snapshot after test suite completion
    - [x] 5.2.4 Log snapshot ID for debugging
  - [x] 5.3 Add example test using snapshots
  - [x] 5.4 Test snapshot/restore workflow
  - [x] 5.5 Document snapshot usage in TESTING.md

- [x] 6.0 Update Documentation and Examples
  - [x] 6.1 Update `packages/diamonds-hardhat-foundry/README.md`
    - [x] 6.1.1 Add section on Dynamic Helper Generation
    - [x] 6.1.2 Add section on Deployment Management (ephemeral vs persistent)
    - [x] 6.1.3 Add section on Snapshot/Restore workflow
    - [x] 6.1.4 Add examples for all task flags
    - [x] 6.1.5 Add troubleshooting section
  - [x] 6.2 Update `TESTING.md` (if exists) or create it
    - [x] 6.2.1 Document one-off test workflow
    - [x] 6.2.2 Document persistent deployment workflow
    - [x] 6.2.3 Document upgrade testing workflow
    - [x] 6.2.4 Document CI/CD usage
    - [x] 6.2.5 Add best practices section
  - [x] 6.3 Add inline comments to generated DiamondDeployment.sol template
  - [x] 6.4 Update CHANGELOG.md with new features
  - [ ] 6.5 Update package.json version (if needed)

- [x] 7.0 Verify End-to-End Functionality
  - [x] 7.1 Clean workspace (remove old deployment files)
  - [x] 7.2 Run full test suite: `npx hardhat diamonds-forge:test`
  - [x] 7.3 Verify all tests pass
  - [x] 7.4 Test with `--save-deployment` flag
  - [x] 7.5 Run tests again against saved deployment (should reuse)
  - [ ] 7.6 Test with `--use-snapshot` flag
  - [x] 7.7 Verify generated DiamondDeployment.sol has no hardcoded addresses
  - [x] 7.9 Build package: `yarn build`
  - [x] 7.10 Run all tests one final time
  - [ ] 7.11 Commit all changes with descriptive message

## Relevant Files

### Core Implementation Files

- `packages/diamonds-hardhat-foundry/src/framework/HelperGenerator.ts` - Generates DiamondDeployment.sol helper with dynamic addresses from deployment data
- `packages/diamonds-hardhat-foundry/src/framework/DeploymentManager.ts` - Manages Diamond deployment with writeDeployedDiamondData control
- `packages/diamonds-hardhat-foundry/src/framework/ForgeFuzzingFramework.ts` - Main orchestration for test execution, snapshot support
- `packages/diamonds-hardhat-foundry/src/tasks/test.ts` - Hardhat task for running Forge tests with new flags
- `packages/diamonds-hardhat-foundry/src/tasks/deploy.ts` - Hardhat task for deploying Diamond

### Solidity Helper Files

- `packages/diamonds-hardhat-foundry/contracts/DiamondForgeHelpers.sol` - Forge test helpers including snapshot functions
- `test/foundry/helpers/DiamondDeployment.sol` - Generated helper with Diamond deployment addresses (output, not source)

### Integration Test Files

- `test/foundry/integration/diamonds-hardhat-foundry/deployment.t.sol` - Tests DeploymentManager functionality
- `test/foundry/integration/diamonds-hardhat-foundry/helper-generation.t.sol` - Tests HelperGenerator functionality
- `test/foundry/integration/diamonds-hardhat-foundry/end-to-end.t.sol` - Tests complete workflow
- `test/foundry/helpers/DiamondABILoader.t.sol` - Tests ABI loading and parsing
- `test/foundry/poc/DiamondABIDebugTest.t.sol` - Tests JSON parsing edge cases
- `test/foundry/integration/ExampleIntegration.t.sol` - Example integration test using deployment
- `test/foundry/integration/BasicDiamondIntegration.t.sol` - Self-deploying test example
- `test/foundry/integration/BasicDiamondIntegrationDeployed.t.sol` - Deployed Diamond test example

### Documentation Files

- `packages/diamonds-hardhat-foundry/README.md` - Main package documentation
- `packages/diamonds-hardhat-foundry/TESTING.md` - Testing workflows and best practices
- `packages/diamonds-hardhat-foundry/CHANGELOG.md` - Version history and changes

### Configuration Files

- `foundry.toml` - Forge configuration (may need ffi = true)
- `packages/diamonds-hardhat-foundry/package.json` - Package metadata and version

### Notes

- This task list implements the PRD: `prd-complete-diamonds-hardhat-foundry.md`
- Priority order: 1.0 (helpers) → 2.0 (deployment) → 3.0 (tasks) → 4.0 (tests) → 5.0 (snapshots) → 6.0 (docs) → 7.0 (verify)
- Snapshot support (Task 5.0) is nice-to-have and can be deferred if time-constrained
- All changes are in the `packages/diamonds-hardhat-foundry` directory unless noted
- Test files are in the workspace root's `test/foundry/` directory
- Use `cd /workspaces/diamonds_dev_env/ && npx hardhat diamonds-forge:test` to run tests after each major change
- Use `yarn build` in packages/diamonds-hardhat-foundry after TypeScript changes
