# Task List: Medusa Fuzzing Integration

## Relevant Files

- `.devcontainer/scripts/post-create.sh` - DevContainer post-create script where Medusa installation will be added
- `scripts/setup/MedusaFuzzingFramework.ts` - Main fuzzing framework class that integrates with LocalDiamondDeployer
- `scripts/setup/MedusaFuzzingFramework.test.ts` - Unit tests for the fuzzing framework
- `scripts/utils/medusaHelpers.ts` - Utility functions for Medusa configuration and contract generation
- `test/fuzzing/ExampleDiamond.fuzz.config.json` - Manual configuration file for ExampleDiamond fuzzing
- `test/fuzzing/generated/` - Directory for auto-generated Solidity test contracts
- `tasks/medusa.ts` - Hardhat task definitions for fuzzing operations
- `.gitignore` - Add entries for medusa-corpus, medusa.json, and other fuzzing artifacts
- `contracts/examplediamond/ExampleConstantsFacet.sol` - Reference for facet functions to fuzz
- `medusa-corpus/` - Directory for fuzzing corpus (gitignored)
- `reports/fuzzing/` - Directory for fuzzing reports and coverage data

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch named `feature/medusa-fuzzing-integration`
  - [x] 0.2 Verify branch creation with `git branch` command

- [x] 1.0 Install Medusa in DevContainer
  - [x] 1.1 Read existing `.devcontainer/scripts/post-create.sh` to understand structure
  - [x] 1.2 Add Medusa installation function to post-create.sh that downloads latest release from GitHub
  - [x] 1.3 Add logic to detect system architecture (amd64/arm64) for correct binary download
  - [x] 1.4 Download Medusa binary to `/usr/local/bin/medusa` with executable permissions
  - [x] 1.5 Add verification step to check Medusa is on PATH and executable
  - [x] 1.6 Add error handling and logging for installation success/failure
  - [x] 1.7 Test installation by rebuilding DevContainer and verifying `medusa --version` works

- [x] 2.0 Create MedusaFuzzingFramework TypeScript class
  - [x] 2.1 Create `scripts/setup/MedusaFuzzingFramework.ts` file with class skeleton
  - [x] 2.2 Define TypeScript interfaces: `MedusaFuzzConfig`, `FuzzTargetFunction`, `MedusaOptions`
  - [x] 2.3 Implement constructor that accepts MedusaFuzzConfig
  - [x] 2.4 Add method `deployDiamond()` that uses LocalDiamondDeployer to deploy Diamond contract
  - [x] 2.5 Add method `getDeployedDiamondData()` to retrieve Diamond address, facets, and selectors
  - [x] 2.6 Add method `generateMedusaConfig()` to create medusa.json configuration file
  - [x] 2.7 Add configuration support for workers, testLimit, timeout, and corpus directory
  - [x] 2.8 Add support for local Hardhat network and forked network configurations
  - [x] 2.9 Add method `generateTestContract()` (implementation in next task)
  - [x] 2.10 Add method `runMedusa()` to execute Medusa via child process
  - [x] 2.11 Add method `parseResults()` to read and parse fuzzing results
  - [x] 2.12 Add error handling and validation for all methods
  - [x] 2.13 Create unit tests in `scripts/setup/MedusaFuzzingFramework.test.ts`

- [x] 3.0 Implement Solidity test contract generation
  - [x] 3.1 Create `scripts/utils/medusaHelpers.ts` for utility functions
  - [x] 3.2 Implement function `generateSolidityTestContract()` that accepts Diamond data and target functions
  - [x] 3.3 Generate Solidity contract header with SPDX license and pragma
  - [x] 3.4 Generate constructor that verifies Diamond contract exists at deployment address
  - [x] 3.5 Add Diamond address as constant in generated contract
  - [x] 3.6 Generate fuzzing functions for each configured facet function with randomized parameters
  - [x] 3.7 Implement low-level `call()` wrapper function for calling Diamond contract
  - [x] 3.8 Add tracking for call success/failure statistics
  - [x] 3.9 Generate invariant function: `echidna_diamond_exists()` to verify Diamond code exists
  - [x] 3.10 Generate invariant function: `echidna_facets_valid()` to verify facet addresses
  - [x] 3.11 Generate invariant function: `echidna_test_integrity()` to verify test contract integrity
  - [x] 3.12 Write generated contract to `test/fuzzing/generated/[DiamondName]Test.sol`
  - [x] 3.13 Ensure generated contracts use Solidity 0.8.x syntax
  - [x] 3.14 Add comments to generated contract explaining purpose and structure
  - [x] 3.15 Integrate generation logic into MedusaFuzzingFramework.generateTestContract()

- [ ] 4.0 Create Hardhat task for fuzzing
  - [ ] 4.1 Create `tasks/medusa.ts` file for task definitions
  - [ ] 4.2 Define task `medusa:fuzz` with description
  - [ ] 4.3 Add task parameter `--diamond` (required) for Diamond contract name
  - [ ] 4.4 Add task parameter `--network` (optional, default: hardhat) for network selection
  - [ ] 4.5 Add task parameter `--workers` (optional, default: 10) for Medusa worker count
  - [ ] 4.6 Add task parameter `--limit` (optional, default: 50000) for test limit
  - [ ] 4.7 Add task parameter `--timeout` (optional, default: 0) for timeout duration
  - [ ] 4.8 Add task parameter `--config` (optional) for custom fuzzing config file path
  - [ ] 4.9 Implement task action that instantiates MedusaFuzzingFramework
  - [ ] 4.10 Load fuzzing configuration from `test/fuzzing/[DiamondName].fuzz.config.json`
  - [ ] 4.11 Deploy Diamond using LocalDiamondDeployer via framework
  - [ ] 4.12 Generate Solidity test contract
  - [ ] 4.13 Compile generated test contract using Hardhat compilation
  - [ ] 4.14 Generate medusa.json configuration
  - [ ] 4.15 Execute Medusa and stream output to console
  - [ ] 4.16 Save artifacts to appropriate directories
  - [ ] 4.17 Display summary of fuzzing results
  - [ ] 4.18 Register task in hardhat.config.ts by importing tasks/medusa.ts

- [ ] 5.0 Create ExampleDiamond fuzzing configuration and tests
  - [ ] 5.1 Analyze ExampleDiamond facets to identify 3 critical functions to fuzz
  - [ ] 5.2 Read ExampleConstantsFacet.sol to document available functions
  - [ ] 5.3 Read ExampleOwnershipFacet.sol to document available functions
  - [ ] 5.4 Read ExampleUpgradeFacet.sol to document available functions
  - [ ] 5.5 Create `test/fuzzing/ExampleDiamond.fuzz.config.json` configuration file
  - [ ] 5.6 Add `diamondName: "ExampleDiamond"` to configuration
  - [ ] 5.7 Add `targetFunctions` array with at least 3 functions and their selectors
  - [ ] 5.8 Add `medusaConfig` section with workers: 10, testLimit: 50000, timeout: 0
  - [ ] 5.9 Create `test/fuzzing/generated/` directory
  - [ ] 5.10 Run `npx hardhat medusa:fuzz --diamond ExampleDiamond` to test framework
  - [ ] 5.11 Verify Solidity test contract is generated in `test/fuzzing/generated/ExampleDiamondTest.sol`
  - [ ] 5.12 Verify medusa.json is created with correct configuration
  - [ ] 5.13 Verify Medusa executes and runs at least 10,000 test cases
  - [ ] 5.14 Verify all invariants pass during fuzzing
  - [ ] 5.15 Verify corpus directory is created with interesting inputs
  - [ ] 5.16 Check fuzzing reports are saved to `reports/fuzzing/`

- [ ] 6.0 Add .gitignore entries and documentation
  - [ ] 6.1 Add `medusa.json` to .gitignore
  - [ ] 6.2 Add `medusa-corpus/` to .gitignore
  - [ ] 6.3 Add `test/fuzzing/generated/` to .gitignore
  - [ ] 6.4 Add `.medusa/` to .gitignore (Medusa working directory)
  - [ ] 6.5 Ensure `reports/fuzzing/` is tracked but contents are optional
  - [ ] 6.6 Create `test/fuzzing/README.md` documenting fuzzing setup and usage
  - [ ] 6.7 Document how to configure target functions in fuzzing config
  - [ ] 6.8 Document available Hardhat task parameters and examples
  - [ ] 6.9 Document how to interpret fuzzing results and coverage reports
  - [ ] 6.10 Add fuzzing section to main project README.md
  - [ ] 6.11 Document troubleshooting common Medusa issues
  - [ ] 6.12 Commit all changes with descriptive commit message
  - [ ] 6.13 Push feature branch to remote repository
