# Task List: Forge Diamond Fuzzing Integration

## Relevant Files

- `scripts/setup/ForgeFuzzingFramework.ts` - Main fuzzing framework class that integrates with LocalDiamondDeployer (CREATED, UPDATED)
- `scripts/setup/ForgeFuzzingFramework.test.ts` - Unit tests for the fuzzing framework (CREATED)
- `scripts/utils/forgeHelpers.ts` - Utility functions for Solidity helper library generation and Forge configuration (CREATED)
- `tasks/forge.ts` - Hardhat task definitions for Forge fuzzing operations
- `tasks/forge.ts` - Hardhat task definitions for Forge fuzzing operations
- `test/foundry/helpers/DiamondDeployment.sol` - Auto-generated Solidity library with deployment data
- `test/foundry/helpers/DiamondFuzzBase.sol` - Base contract for Diamond fuzzing tests with common utilities
- `test/foundry/fuzz/ExampleDiamondAccessControl.t.sol` - Fuzzing tests for ExampleDiamond access control
- `test/foundry/fuzz/ExampleDiamondOwnership.t.sol` - Fuzzing tests for ownership functionality
- `test/foundry/integration/ExampleDiamondIntegration.t.sol` - Integration tests for Diamond lifecycle (update existing)
- `test/foundry/invariant/DiamondProxyInvariant.t.sol` - Invariant tests for Diamond proxy integrity
- `test/foundry/ExampleDiamond.forge.config.json` - Forge fuzzing configuration for ExampleDiamond
- `docs/FORGE_FUZZING_GUIDE.md` - Comprehensive guide for using the Forge fuzzing framework
- `.gitignore` - Update to remove deprecated file patterns
- `hardhat.config.ts` - Import and register Forge tasks
- `package.json` - Update scripts for new Forge workflow

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch named `feature/forge-diamond-fuzzing-refactor`
  - [x] 0.2 Verify branch creation with `git branch` command

- [ ] 1.0 Create ForgeFuzzingFramework TypeScript class
  - [x] 1.1 Create `scripts/setup/ForgeFuzzingFramework.ts` file with class skeleton
  - [x] 1.2 Define TypeScript interfaces: `ForgeFuzzConfig`, `ForgeOptions`, mirroring MedusaFuzzingFramework patterns
  - [x] 1.3 Implement constructor that accepts ForgeFuzzConfig
  - [x] 1.3 Implement constructor that accepts ForgeFuzzConfig
  - [x] 1.4 Add method `deployDiamond()` that uses LocalDiamondDeployer with `writeDeployedDiamondData: true`
  - [x] 1.5 Add method `getDeployedDiamondData()` to retrieve Diamond address, facets, and selectors from deployment record
  - [ ] 1.6 Add method `generateHelperLibrary()` to create Solidity helper from deployment data (implementation in next task)
  - [x] 1.7 Add method `runForgeTests()` to execute Forge via child process
  - [x] 1.8 Add method `validateDeployment()` to check if deployment record exists and is valid
  - [x] 1.9 Add configuration support for Hardhat node and Anvil networks
  - [x] 1.10 Add error handling and validation for all methods
  - [x] 1.11 Implement singleton pattern similar to LocalDiamondDeployer (optional but recommended)
  - [x] 1.12 Create unit tests in `scripts/setup/ForgeFuzzingFramework.test.ts`

- [ ] 2.0 Implement Solidity helper library generation utilities
  - [x] 2.1 Create `scripts/utils/forgeHelpers.ts` for utility functions
  - [x] 2.2 Implement function `generateSolidityHelperLibrary()` that accepts DeployedDiamondData
  - [x] 2.3 Generate Solidity library header with SPDX license, pragma 0.8.19+, and metadata comments
  - [x] 2.4 Add Diamond address as constant `DIAMOND_ADDRESS`
  - [x] 2.5 Generate constants for all facet addresses (e.g., `OWNERSHIP_FACET`, `UPGRADE_FACET`)
  - [x] 2.6 Generate constants for function selectors per facet from deployment record's registered selectors
  - [x] 2.7 Implement helper function `getDiamondAddress()` returning Diamond address
  - [x] 2.8 Implement helper function `getFacetAddress(string memory facetName)` with if/else for each facet
  - [x] 2.9 Implement helper function `getSelector(string memory facetName, string memory functionName)` for selector lookup
  - [x] 2.10 Add comprehensive comments explaining data source, generation timestamp, and regeneration command
  - [x] 2.11 Write generated library to `test/foundry/helpers/DiamondDeployment.sol`
  - [x] 2.12 Ensure generated code uses consistent formatting and naming conventions
  - [x] 2.13 Create helper directory if it doesn't exist
  - [x] 2.14 Integrate generation logic into ForgeFuzzingFramework.generateHelperLibrary()
  - [x] 2.15 Add validation to ensure deployment data is complete before generation

- [ ] 3.0 Create Hardhat tasks for Forge fuzzing
  - [x] 3.1 Create `tasks/forge.ts` file for task definitions
  - [x] 3.2 Define task `forge:deploy` with description and parameters `--diamond`, `--network`
  - [x] 3.3 Implement `forge:deploy` action that instantiates ForgeFuzzingFramework
  - [x] 3.4 In `forge:deploy`, deploy Diamond using LocalDiamondDeployer via framework
  - [x] 3.5 In `forge:deploy`, generate Solidity helper library after successful deployment
  - [x] 3.6 In `forge:deploy`, display deployment summary (Diamond address, facets, network)
  - [x] 3.7 Define task `forge:generate-helpers` with parameters `--diamond`, `--network`
  - [x] 3.8 Implement `forge:generate-helpers` to regenerate helper library from existing deployment record
  - [x] 3.9 Add validation to ensure deployment record exists before generating helpers
  - [x] 3.10 Define task `forge:fuzz` with parameters `--diamond`, `--network`, `--match-test` (optional)
  - [x] 3.11 Implement `forge:fuzz` to check deployment exists, optionally deploy if missing
  - [x] 3.12 In `forge:fuzz`, execute `forge test` with appropriate parameters
  - [x] 3.13 Add support for `--force-deploy` flag to force redeployment
  - [x] 3.14 Add support for both `--network localhost` and `--network anvil` in all tasks
  - [x] 3.15 Configure RPC URLs based on network selection (localhost: http://127.0.0.1:8545, anvil: auto-detect)
  - [x] 3.16 Add error handling for missing deployment records and network connection issues
  - [x] 3.17 Register tasks in `hardhat.config.ts` by importing `tasks/forge.ts`
  - [x] 3.18 Update `package.json` scripts to include shortcuts (e.g., `yarn forge:deploy`, `yarn forge:fuzz`)

- [x] 4.0 Implement comprehensive Forge tests for ExampleDiamond
  - [x] 4.1 Create `test/foundry/helpers/DiamondFuzzBase.sol` base contract
  - [x] 4.2 In DiamondFuzzBase, import DiamondDeployment library
  - [x] 4.3 In DiamondFuzzBase, add helper functions for common Diamond interactions
  - [x] 4.4 In DiamondFuzzBase, add utility to call Diamond functions via low-level call with selector
  - [x] 4.5 Create `test/foundry/fuzz/ExampleDiamondAccessControl.t.sol` for access control fuzzing
  - [x] 4.6 In AccessControl test, implement fuzz test for role granting with random addresses and roles
  - [x] 4.7 In AccessControl test, implement fuzz test for role revocation
  - [x] 4.8 In AccessControl test, implement fuzz test for role renunciation
  - [x] 4.9 In AccessControl test, add checks for unauthorized access attempts (should revert)
  - [x] 4.10 Create `test/foundry/fuzz/ExampleDiamondOwnership.t.sol` for ownership fuzzing
  - [x] 4.11 In Ownership test, implement fuzz test for ownership transfer with random addresses
  - [x] 4.12 In Ownership test, add checks for ownership constraints (e.g., zero address rejection)
  - [x] 4.13 Update existing `test/foundry/integration/ExampleDiamondIntegration.t.sol` to use DiamondDeployment library
  - [x] 4.14 In integration test, add tests for facet upgrade scenarios using deployment data
  - [x] 4.15 Create `test/foundry/invariant/DiamondProxyInvariant.t.sol` for invariant testing
  - [x] 4.16 In invariant test, implement invariant: Diamond contract code exists at deployment address
  - [x] 4.17 In invariant test, implement invariant: All facet addresses remain valid and have code
  - [x] 4.18 In invariant test, implement invariant: Function selectors route to correct facets
  - [x] 4.19 In invariant test, implement invariant: Owner address is non-zero and valid
  - [x] 4.20 Create `test/foundry/ExampleDiamond.forge.config.json` configuration file
  - [x] 4.21 In config file, specify target functions, workers, test limits, and network settings
  - [x] 4.22 Add gas profiling tests to measure function call costs
  - [x] 4.23 Ensure all tests use `vm.assume()` to constrain fuzz inputs to valid ranges
  - [x] 4.24 Run all tests to verify they pass: `forge test -vv`

- [x] 5.0 Remove deprecated files and update configuration
  - [x] 5.1 Remove `.forge-diamond-address` file if it exists
  - [x] 5.2 Remove `scripts/test-deploy-diamond.ts` file
  - [x] 5.3 Remove `scripts/foundry/deploy-for-tests.sh` file
  - [x] 5.4 Remove `scripts/foundry/` directory if now empty
  - [x] 5.5 Update `.gitignore` to remove `.forge-diamond-address` pattern
  - [x] 5.6 Update `.gitignore` to add `test/foundry/helpers/DiamondDeployment.sol` (or decide to commit it)
  - [x] 5.7 Update `foundry.toml` to add remapping for helper library: `@helpers/=test/foundry/helpers/`
  - [x] 5.8 Verify no references to deprecated files exist in codebase (grep search)
  - [x] 5.9 Update existing Foundry tests to use new helper library if applicable
  - [x] 5.10 Run all tests (Hardhat + Forge) to ensure nothing broke: `yarn test:all`

- [x] 6.0 Add documentation and finalize framework
  - [x] 6.1 Create `docs/FORGE_FUZZING_GUIDE.md` comprehensive guide
  - [x] 6.2 In guide, document framework architecture and design decisions
  - [x] 6.3 In guide, document workflow: deploy → generate helpers → run tests
  - [x] 6.4 In guide, provide examples of all task usages (`forge:deploy`, `forge:fuzz`, etc.)
  - [x] 6.5 In guide, document how to use DiamondDeployment library in tests
  - [x] 6.6 In guide, provide example test patterns (unit, integration, invariant)
  - [x] 6.7 In guide, document network options (Hardhat node vs Anvil)
  - [x] 6.8 In guide, document how to copy framework to new Diamond projects
  - [x] 6.9 In guide, add troubleshooting section for common issues
  - [x] 6.10 Update `docs/FOUNDRY_GUIDE.md` to reference new Forge fuzzing framework
  - [x] 6.11 Add inline JSDoc comments to all ForgeFuzzingFramework methods
  - [x] 6.12 Add inline Solidity comments to generated helper library explaining each section
  - [x] 6.13 Create README in `test/foundry/` explaining test structure and usage
  - [ ] 6.14 Run final validation: deploy ExampleDiamond and run all Forge tests
  - [ ] 6.15 Verify helper library is correctly generated with all expected data
  - [ ] 6.16 Test framework reusability by simulating setup in a new directory (optional)
  - [ ] 6.17 Commit all changes with descriptive commit message
  - [ ] 6.18 Update main project README if necessary to mention Forge fuzzing capabilities
