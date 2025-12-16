# Tasks: Echidna Fuzzing Integration

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch for this feature (e.g., `git checkout -b feature/echidna-fuzzing-integration`)

- [x] 1.0 Set up Echidna directory structure and configuration
  - [x] 1.1 Create `echidna/` directory in project root
  - [x] 1.2 Create `echidna/contracts/` subdirectory for test contracts
  - [x] 1.3 Create `echidna/setup/` subdirectory for deployment helpers
  - [x] 1.4 Create `echidna/config/` subdirectory for configuration files
  - [x] 1.5 Create `echidna.yaml` configuration file with sensible defaults (test sequences, corpus directory, coverage settings)
  - [x] 1.6 Add `echidna/corpus/` and `echidna/coverage/` to `.gitignore`

- [x] 2.0 Create Solidity deployment helper contracts
  - [x] 2.1 Analyze `scripts/setup/LocalDiamondDeployer.ts` and `test/deployment/DiamondDeployment.test.ts` to understand deployment logic
  - [x] 2.2 Create `echidna/setup/DiamondDeploymentHelper.sol` to handle Diamond deployment in Solidity
  - [x] 2.3 Implement constructor logic to deploy Diamond with test configuration
  - [x] 2.4 Add methods to retrieve deployed Diamond address and facet addresses
  - [x] 2.5 Ensure helper can read deployment configuration (hardcoded or from constructor parameters)
  - [x] 2.6 Generate or manually create Solidity interface from diamond-abi JSON for ExampleDiamond

- [x] 3.0 Implement example Echidna fuzzing test contract
  - [x] 3.1 Create `echidna/contracts/DiamondFuzzTest.sol` as the main test contract
  - [x] 3.2 Import `DiamondDeploymentHelper` and diamond-abi interface
  - [x] 3.3 Deploy Diamond in constructor using deployment helper
  - [x] 3.4 Implement `echidna_owner_not_zero()` invariant test (owner != address(0))
  - [x] 3.5 Implement `echidna_diamond_has_facets()` invariant test (diamond has at least one facet)
  - [x] 3.6 Add comprehensive comments explaining deployment, invariants, and how to add more tests
  - [x] 3.7 Test accessing facet functions through the diamond-abi interface

- [x] 4.0 Create npm scripts and tooling
  - [x] 4.1 Add `echidna:test` script to `package.json` to run Echidna with correct configuration
  - [x] 4.2 Add `echidna:setup` script to prepare environment (compile contracts, generate ABIs)
  - [x] 4.3 Create `scripts/setup/prepare-echidna.ts` helper script to clean artifacts and prepare test environment
  - [x] 4.4 Ensure Echidna script sets correct working directory and references config file
  - [x] 4.5 Add `echidna:clean` script to remove corpus and coverage artifacts
  - [x] 4.6 Test that `yarn echidna:setup` successfully prepares the environment

- [x] 5.0 Write comprehensive documentation
  - [x] 5.1 Create `echidna/README.md` with overview of Echidna integration
  - [x] 5.2 Document prerequisites (Echidna installation in DevContainer)
  - [x] 5.3 Write "Getting Started" section with steps to run first test
  - [x] 5.4 Document how to write new fuzzing tests with code examples
  - [x] 5.5 Explain relationship between `LocalDiamondDeployer`, diamond-abi, and test contracts
  - [x] 5.6 Provide examples of different invariant patterns (stateful vs stateless)
  - [x] 5.7 Document how to interpret Echidna output (coverage, failing tests, counterexamples)
  - [x] 5.8 Add troubleshooting section for common issues
  - [x] 5.9 Update main project `README.md` with reference to Echidna testing capability

- [x] 6.0 Test and validate the integration
  - [x] 6.1 Run `yarn echidna:setup` to ensure environment preparation works
  - [x] 6.2 Run Echidna and verify example test executes successfully
  - [x] 6.3 Verify invariants are tested and no violations are found (all 9 tests passing)
  - [x] 6.4 Check that coverage data is generated in expected directory
  - [x] 6.5 Verify deployment works correctly in test contract constructor
  - [x] 6.6 Verify `yarn echidna:test` script works correctly
  - [x] 6.7 Ensure Diamond configuration matches deployment expectations
  - [x] 6.8 Run complete test suite to ensure no regressions (176 tests passing)
  - [x] 6.9 Commit all changes with descriptive commit message

## Relevant Files

- `echidna/README.md` - Main documentation for Echidna fuzzing integration
- `echidna/config/echidna.yaml` - Echidna configuration file with test parameters
- `echidna/contracts/DiamondFuzzTest.sol` - Example fuzzing test contract demonstrating invariant testing
- `echidna/setup/DiamondDeploymentHelper.sol` - Solidity helper contract to deploy Diamond for Echidna tests
- `echidna/setup/IExampleDiamond.sol` - Solidity interface generated from diamond-abi JSON
- `scripts/setup/prepare-echidna.ts` - TypeScript helper script to prepare Echidna test environment
- `package.json` - Updated with Echidna npm scripts (echidna:test, echidna:setup, echidna:clean)
- `.gitignore` - Updated to exclude Echidna corpus and coverage artifacts
- `README.md` - Updated to reference Echidna testing capability
- `scripts/setup/LocalDiamondDeployer.ts` - Reference for understanding Diamond deployment logic

### Notes

- Echidna must be pre-installed in the DevContainer (not part of this task list)
- Tests will use Solidity deployment helpers rather than direct TypeScript integration to maintain Echidna compatibility
- Diamond-abi interfaces may need to be manually created from JSON initially; automation can be added later
- Focus on stateful fuzzing (sequences of operations) as it better tests Diamond proxy pattern
- Each Echidna test contract should deploy its own fresh Diamond instance in the constructor
- Use the ExampleDiamond contract for the proof-of-concept implementation
- Corpus and coverage data should be gitignored but preserved between test runs for continuity
- Run `npx hardhat compile` before running Echidna tests to ensure all contracts are compiled
