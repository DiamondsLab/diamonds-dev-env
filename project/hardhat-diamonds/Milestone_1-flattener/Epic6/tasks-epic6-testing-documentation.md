# Task List: Epic 6 - Testing & Documentation

**Source:** prd-epic6-testing-documentation.md  
**Target:** @diamondslab/hardhat-diamonds package  
**Estimated Duration:** 9 working days (Sprint 4)  
**Coverage Goal:** ≥90% on all core modules  
**Test Execution Target:** <30 seconds for full suite

---

## Relevant Files

### Test Files to Create

- `packages/hardhat-diamonds/test/unit/lib/DiamondFlattener.test.ts` - Unit tests for DiamondFlattener class
- `packages/hardhat-diamonds/test/unit/lib/SourceResolver.test.ts` - Unit tests for SourceResolver class
- `packages/hardhat-diamonds/test/unit/lib/DependencyGraph.test.ts` - Unit tests for DependencyGraph class
- `packages/hardhat-diamonds/test/unit/lib/OutputFormatter.test.ts` - Unit tests for OutputFormatter class
- `packages/hardhat-diamonds/test/unit/tasks/DiamondFlatten.test.ts` - Unit tests for task validation
- `packages/hardhat-diamonds/test/integration/flatten.test.ts` - Integration tests for end-to-end scenarios
- `packages/hardhat-diamonds/test/utils/mockHRE.ts` - Mock Hardhat Runtime Environment helper
- `packages/hardhat-diamonds/test/utils/fixtureLoader.ts` - Test fixture loading utilities
- `packages/hardhat-diamonds/test/utils/testHelpers.ts` - Shared test helper functions

### Test Fixture Files to Create

- `packages/hardhat-diamonds/test/fixtures/flatten/simple/contracts/SimpleDiamond.sol` - Simple test diamond
- `packages/hardhat-diamonds/test/fixtures/flatten/simple/contracts/facets/FacetA.sol` - Basic facet A
- `packages/hardhat-diamonds/test/fixtures/flatten/simple/contracts/facets/FacetB.sol` - Basic facet B
- `packages/hardhat-diamonds/test/fixtures/flatten/simple/contracts/facets/FacetC.sol` - Basic facet C
- `packages/hardhat-diamonds/test/fixtures/flatten/simple/diamonds/SimpleDiamond/SimpleDiamond.config.json` - Config for simple diamond
- `packages/hardhat-diamonds/test/fixtures/flatten/complex/contracts/ComplexDiamond.sol` - Complex test diamond
- `packages/hardhat-diamonds/test/fixtures/flatten/complex/contracts/facets/OwnableFacet.sol` - Facet using OpenZeppelin
- `packages/hardhat-diamonds/test/fixtures/flatten/complex/contracts/facets/PausableFacet.sol` - Facet with pausable
- `packages/hardhat-diamonds/test/fixtures/flatten/complex/contracts/facets/AccessControlFacet.sol` - Facet with access control
- `packages/hardhat-diamonds/test/fixtures/flatten/with-init/contracts/InitDiamond.sol` - Diamond with init
- `packages/hardhat-diamonds/test/fixtures/flatten/with-init/contracts/init/DiamondInit.sol` - Init contract
- `packages/hardhat-diamonds/test/fixtures/flatten/with-libraries/contracts/LibraryDiamond.sol` - Diamond with libraries
- `packages/hardhat-diamonds/test/fixtures/flatten/with-libraries/contracts/libraries/MathLib.sol` - Shared math library
- `packages/hardhat-diamonds/test/fixtures/flatten/with-libraries/contracts/libraries/StringLib.sol` - Shared string library
- `packages/hardhat-diamonds/test/fixtures/flatten/edge-cases/contracts/EdgeCaseDiamond.sol` - Edge case diamond
- `packages/hardhat-diamonds/test/fixtures/flatten/edge-cases/contracts/facets/CircularA.sol` - Circular dependency A
- `packages/hardhat-diamonds/test/fixtures/flatten/edge-cases/contracts/facets/CircularB.sol` - Circular dependency B

### Documentation Files to Create/Modify

- `packages/hardhat-diamonds/docs/tasks/diamond-flatten.md` - Complete task documentation
- `packages/hardhat-diamonds/README.md` - Update with flatten task section

### Source Files to Document (JSDoc)

- `packages/hardhat-diamonds/src/lib/DiamondFlattener.ts` - Add comprehensive JSDoc comments
- `packages/hardhat-diamonds/src/lib/SourceResolver.ts` - Add comprehensive JSDoc comments
- `packages/hardhat-diamonds/src/lib/DependencyGraph.ts` - Add comprehensive JSDoc comments
- `packages/hardhat-diamonds/src/lib/OutputFormatter.ts` - Add comprehensive JSDoc comments
- `packages/hardhat-diamonds/src/tasks/diamond-flatten.ts` - Add comprehensive JSDoc comments

### CI/CD Files to Create

- `.github/workflows/test-flatten.yml` - GitHub Actions workflow for testing

### Configuration Files to Update

- `packages/hardhat-diamonds/package.json` - Add test scripts and dev dependencies

### Notes

- Tests use Mocha as the test runner (already configured in hardhat-diamonds)
- Chai with chai-as-promised for assertions
- Sinon.js for mocking HRE and file system operations
- Coverage reporting via c8 or nyc
- All tests must be run from `packages/hardhat-diamonds/` directory
- Test execution: `yarn test` or `npx mocha test/**/*.test.ts`
- Coverage: `yarn test:coverage`

---

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

---

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout new branch from feature/diamond-discovery-epic2: `git checkout -b feature/epic6-testing-documentation`
  - [x] 0.2 Verify branch is created and switched: `git branch --show-current`

- [x] 1.0 Set up test infrastructure and utilities
  - [x] 1.1 Navigate to hardhat-diamonds package: `cd packages/hardhat-diamonds`
  - [x] 1.2 Install test dependencies: `yarn add -D sinon @types/sinon chai-as-promised c8`
  - [x] 1.3 Create test directory structure: `mkdir -p test/unit/lib test/unit/tasks test/integration test/utils test/fixtures/flatten`
  - [x] 1.4 Create `test/utils/mockHRE.ts` - Mock Hardhat Runtime Environment factory
  - [x] 1.5 Add createMockHRE function with diamond config, paths, and artifacts mocking
  - [x] 1.6 Create `test/utils/fixtureLoader.ts` - Fixture loading utilities
  - [x] 1.7 Add loadFixtureContract, loadFixtureDiamond helper functions
  - [x] 1.8 Create `test/utils/testHelpers.ts` - Shared test utilities
  - [x] 1.9 Add expectError, expectSuccess, compareSourceCode helper functions
  - [x] 1.10 Update `package.json` - Add test scripts: `test:unit:flatten`, `test:integration:flatten`, `test:coverage:flatten`
  - [x] 1.11 Commit test infrastructure: `git add test/utils package.json && git commit -m "feat(epic6): set up test infrastructure and utilities"`

- [x] 2.0 Implement unit test suite for core modules
  - [x] 2.1 Create `test/unit/lib/DiamondFlattener.test.ts`
  - [x] 2.2 DiamondFlattener: Add test for successful flatten of simple diamond
  - [x] 2.3 DiamondFlattener: Add test for handling missing diamond configuration
  - [x] 2.4 DiamondFlattener: Add test for handling missing facet contracts (FR-15)
  - [x] 2.5 DiamondFlattener: Add test for verbose mode logging
  - [x] 2.6 DiamondFlattener: Add test for facet discovery integration
  - [x] 2.7 DiamondFlattener: Add test for selector mapping generation
  - [x] 2.8 DiamondFlattener: Add test for statistics calculation
  - [x] 2.9 DiamondFlattener: Add test for error propagation from dependencies
  - [x] 2.10 Run DiamondFlattener tests: `yarn test test/unit/lib/DiamondFlattener.test.ts`
  - [x] 2.11 Verify DiamondFlattener coverage ≥90%: `yarn test:coverage test/unit/lib/DiamondFlattener.test.ts`
  - [x] 2.12 Create `test/unit/lib/SourceResolver.test.ts`
  - [x] 2.13 SourceResolver: Add test for resolving contract source from artifacts
  - [x] 2.14 SourceResolver: Add test for handling file not found scenarios (FR-13)
  - [x] 2.15 SourceResolver: Add test for resolving imports correctly
  - [x] 2.16 SourceResolver: Add test for handling absolute vs relative paths
  - [x] 2.17 SourceResolver: Add test for OpenZeppelin dependency resolution
  - [x] 2.18 SourceResolver: Add test for node_modules path resolution
  - [x] 2.19 SourceResolver: Add test for local library resolution
  - [x] 2.20 SourceResolver: Add test for invalid import path handling
  - [x] 2.21 Run SourceResolver tests: `yarn test test/unit/lib/SourceResolver.test.ts`
  - [x] 2.22 Verify SourceResolver coverage ≥90%
  - [x] 2.23 Create `test/unit/lib/DependencyGraph.test.ts`
  - [x] 2.24 DependencyGraph: Add test for building graph with linear dependencies
  - [x] 2.25 DependencyGraph: Add test for building graph with shared dependencies
  - [x] 2.26 DependencyGraph: Add test for detecting circular dependencies (FR-3)
  - [x] 2.27 DependencyGraph: Add test for topological sort with valid graph
  - [x] 2.28 DependencyGraph: Add test for topological sort with circular deps (graceful handling)
  - [x] 2.29 DependencyGraph: Add test for deduplication of duplicate contracts
  - [x] 2.30 DependencyGraph: Add test for correct ordering of OpenZeppelin deps
  - [x] 2.31 DependencyGraph: Add test for library dependency ordering
  - [x] 2.32 Run DependencyGraph tests: `yarn test test/unit/lib/DependencyGraph.test.ts`
  - [x] 2.33 Verify DependencyGraph coverage ≥90%
  - [x] 2.34 Create `test/unit/lib/OutputFormatter.test.ts`
  - [x] 2.35 OutputFormatter: Add test for SPDX license consolidation (FR-4)
  - [x] 2.36 OutputFormatter: Add test for pragma directive handling (FR-4)
  - [x] 2.37 OutputFormatter: Add test for removing duplicate SPDX identifiers
  - [x] 2.38 OutputFormatter: Add test for handling multiple pragma versions
  - [x] 2.39 OutputFormatter: Add test for selector mapping table generation
  - [x] 2.40 OutputFormatter: Add test for facet separator comment formatting
  - [x] 2.41 OutputFormatter: Add test for header comment generation
  - [x] 2.42 OutputFormatter: Add test for import statement removal
  - [x] 2.43 Run OutputFormatter tests: `yarn test test/unit/lib/OutputFormatter.test.ts`
  - [x] 2.44 Verify OutputFormatter coverage ≥90%
  - [x] 2.45 Create `test/unit/tasks/DiamondFlatten.test.ts`
  - [x] 2.46 Task validation: Add test for missing --diamond-name argument (FR-5, FR-14)
  - [x] 2.47 Task validation: Add test for invalid diamond name
  - [x] 2.48 Task validation: Add test for valid arguments acceptance
  - [x] 2.49 Task validation: Add test for --output flag handling
  - [x] 2.50 Task validation: Add test for --verbose flag handling
  - [x] 2.51 Task validation: Add test for --network flag handling
  - [x] 2.52 Run task validation tests: `yarn test test/unit/tasks/DiamondFlatten.test.ts`
  - [x] 2.53 Verify task validation coverage ≥85%
  - [x] 2.54 Run all unit tests: `yarn test:unit:flatten`
  - [x] 2.55 Verify total unit test execution time <10 seconds (FR-11)
  - [x] 2.56 Commit unit tests: `git add test/unit && git commit -m "feat(epic6): implement unit test suite with ≥90% coverage"`

- [ ] 3.0 Create integration test fixtures and test suite
  - [ ] 3.1 Create simple diamond fixture directory: `mkdir -p test/fixtures/flatten/simple/contracts/facets test/fixtures/flatten/simple/diamonds/SimpleDiamond`
  - [ ] 3.2 Create `test/fixtures/flatten/simple/contracts/SimpleDiamond.sol` - Basic diamond contract (FR-16)
  - [ ] 3.3 Create `test/fixtures/flatten/simple/contracts/facets/FacetA.sol` - Simple getter/setter facet
  - [ ] 3.4 Create `test/fixtures/flatten/simple/contracts/facets/FacetB.sol` - Simple calculation facet
  - [ ] 3.5 Create `test/fixtures/flatten/simple/contracts/facets/FacetC.sol` - Simple view functions facet
  - [ ] 3.6 Create `test/fixtures/flatten/simple/diamonds/SimpleDiamond/SimpleDiamond.config.json` - Diamond config with 3 facets
  - [ ] 3.7 Create complex diamond fixture directory: `mkdir -p test/fixtures/flatten/complex/contracts/facets test/fixtures/flatten/complex/diamonds/ComplexDiamond`
  - [ ] 3.8 Create `test/fixtures/flatten/complex/contracts/ComplexDiamond.sol` - Complex diamond (FR-17)
  - [ ] 3.9 Create `test/fixtures/flatten/complex/contracts/facets/OwnableFacet.sol` - Uses @openzeppelin/contracts/access/Ownable.sol
  - [ ] 3.10 Create `test/fixtures/flatten/complex/contracts/facets/PausableFacet.sol` - Uses @openzeppelin/contracts/security/Pausable.sol
  - [ ] 3.11 Create `test/fixtures/flatten/complex/contracts/facets/AccessControlFacet.sol` - Uses @openzeppelin/contracts/access/AccessControl.sol
  - [ ] 3.12 Create `test/fixtures/flatten/complex/diamonds/ComplexDiamond/ComplexDiamond.config.json` - Config with OZ dependencies
  - [ ] 3.13 Create with-init fixture directory: `mkdir -p test/fixtures/flatten/with-init/contracts/init test/fixtures/flatten/with-init/diamonds/InitDiamond`
  - [ ] 3.14 Create `test/fixtures/flatten/with-init/contracts/InitDiamond.sol` - Diamond with init (FR-18)
  - [ ] 3.15 Create `test/fixtures/flatten/with-init/contracts/init/DiamondInit.sol` - Initialization contract
  - [ ] 3.16 Create `test/fixtures/flatten/with-init/contracts/facets/` - Add 2-3 basic facets
  - [ ] 3.17 Create `test/fixtures/flatten/with-init/diamonds/InitDiamond/InitDiamond.config.json` - Config with init contract
  - [ ] 3.18 Create with-libraries fixture directory: `mkdir -p test/fixtures/flatten/with-libraries/contracts/libraries test/fixtures/flatten/with-libraries/contracts/facets`
  - [ ] 3.19 Create `test/fixtures/flatten/with-libraries/contracts/LibraryDiamond.sol` - Diamond with libraries (FR-19)
  - [ ] 3.20 Create `test/fixtures/flatten/with-libraries/contracts/libraries/MathLib.sol` - Shared math library
  - [ ] 3.21 Create `test/fixtures/flatten/with-libraries/contracts/libraries/StringLib.sol` - Shared string library
  - [ ] 3.22 Create `test/fixtures/flatten/with-libraries/contracts/facets/MathFacet.sol` - Uses MathLib
  - [ ] 3.23 Create `test/fixtures/flatten/with-libraries/contracts/facets/StringFacet.sol` - Uses StringLib
  - [ ] 3.24 Create `test/fixtures/flatten/with-libraries/diamonds/LibraryDiamond/LibraryDiamond.config.json`
  - [ ] 3.25 Create edge-cases fixture directory: `mkdir -p test/fixtures/flatten/edge-cases/contracts/facets test/fixtures/flatten/edge-cases/diamonds/EdgeCaseDiamond`
  - [ ] 3.26 Create `test/fixtures/flatten/edge-cases/contracts/EdgeCaseDiamond.sol` - Edge case diamond (FR-20)
  - [ ] 3.27 Create `test/fixtures/flatten/edge-cases/contracts/facets/CircularA.sol` - Imports CircularB
  - [ ] 3.28 Create `test/fixtures/flatten/edge-cases/contracts/facets/CircularB.sol` - Imports CircularA
  - [ ] 3.29 Create `test/fixtures/flatten/edge-cases/diamonds/EdgeCaseDiamond/EdgeCaseDiamond.config.json`
  - [ ] 3.30 Commit test fixtures: `git add test/fixtures && git commit -m "feat(epic6): create integration test fixtures"`
  - [ ] 3.31 Create `test/integration/flatten.test.ts` - Main integration test file
  - [ ] 3.32 Integration: Add test setup with fixture compilation
  - [ ] 3.33 Integration: Add test for flattening simple diamond (FR-21)
  - [ ] 3.34 Integration: Verify simple diamond output structure and contract count
  - [ ] 3.35 Integration: Add test for flattening complex diamond with OZ deps (FR-22)
  - [ ] 3.36 Integration: Verify no duplicate OpenZeppelin contracts in output
  - [ ] 3.37 Integration: Add test for verifying flattened output compiles (FR-23)
  - [ ] 3.38 Integration: Use solc to compile flattened output and verify success
  - [ ] 3.39 Integration: Add test for validating selector mapping accuracy (FR-24)
  - [ ] 3.40 Integration: Compare selectors from config to generated mapping table
  - [ ] 3.41 Integration: Add test for CLI with --output flag (FR-25)
  - [ ] 3.42 Integration: Verify file is written to specified path with correct content
  - [ ] 3.43 Integration: Add test for CLI with --verbose flag (FR-26)
  - [ ] 3.44 Integration: Verify verbose logs are displayed during execution
  - [ ] 3.45 Integration: Add test for programmatic API usage (FR-27)
  - [ ] 3.46 Integration: Verify result object contains flattenedSource and stats
  - [ ] 3.47 Integration: Add test for SPDX license consolidation (FR-28)
  - [ ] 3.48 Integration: Verify only one SPDX identifier in flattened output
  - [ ] 3.49 Integration: Add test for pragma directive handling (FR-29)
  - [ ] 3.50 Integration: Verify pragma is properly normalized in output
  - [ ] 3.51 Integration: Add test for diamond with init contract
  - [ ] 3.52 Integration: Verify init contract is included in flattened output
  - [ ] 3.53 Integration: Add test for diamond with shared libraries
  - [ ] 3.54 Integration: Verify libraries appear once and are correctly ordered
  - [ ] 3.55 Integration: Add test for edge case with circular dependencies
  - [ ] 3.56 Integration: Verify graceful handling (warning or error message)
  - [ ] 3.57 Run integration tests: `yarn test:integration:flatten`
  - [ ] 3.58 Verify integration test execution time <20 seconds (FR-30)
  - [ ] 3.59 Verify all integration test scenarios pass (FR-2 goal: 100%)
  - [ ] 3.60 Commit integration tests: `git add test/integration && git commit -m "feat(epic6): implement integration test suite"`

- [ ] 4.0 Write comprehensive documentation
  - [ ] 4.1 Create documentation directory: `mkdir -p docs/tasks`
  - [ ] 4.2 Create `docs/tasks/diamond-flatten.md` with template structure (FR-31)
  - [ ] 4.3 Write Overview section - Feature description and problem solved
  - [ ] 4.4 Write Quick Start section - Basic CLI example (FR-32)
  - [ ] 4.5 Write CLI Usage section - Document --diamond-name argument (FR-34)
  - [ ] 4.6 CLI Usage: Document --output argument with example (FR-34)
  - [ ] 4.7 CLI Usage: Document --verbose argument with example (FR-34)
  - [ ] 4.8 CLI Usage: Document --network argument with example (FR-34)
  - [ ] 4.9 Write Programmatic Usage section with TypeScript example (FR-33)
  - [ ] 4.10 Add flattenDiamond function example with imports and types (FR-33)
  - [ ] 4.11 Write Output Format section - Describe flattened file structure
  - [ ] 4.12 Output Format: Include selector mapping table example (FR-42)
  - [ ] 4.13 Write Troubleshooting section - Common errors and solutions (FR-35)
  - [ ] 4.14 Troubleshooting: Add "Diamond not found" error resolution
  - [ ] 4.15 Troubleshooting: Add "Facet not found" error resolution
  - [ ] 4.16 Troubleshooting: Add "Compilation failed" error resolution
  - [ ] 4.17 Write Limitations section - Known issues and unsupported scenarios (FR-43)
  - [ ] 4.18 Limitations: Document Vyper contracts not supported
  - [ ] 4.19 Limitations: Document circular dependency handling approach
  - [ ] 4.20 Open `src/lib/DiamondFlattener.ts` for JSDoc additions (FR-36)
  - [ ] 4.21 DiamondFlattener: Add class-level JSDoc comment with description and examples
  - [ ] 4.22 DiamondFlattener: Add JSDoc to constructor with @param tags
  - [ ] 4.23 DiamondFlattener: Add JSDoc to flatten() method with @returns and @throws tags
  - [ ] 4.24 DiamondFlattener: Add JSDoc to private helper methods
  - [ ] 4.25 Open `src/lib/SourceResolver.ts` for JSDoc additions (FR-37)
  - [ ] 4.26 SourceResolver: Add class-level JSDoc comment
  - [ ] 4.27 SourceResolver: Add JSDoc to all public methods with @param, @returns, @throws
  - [ ] 4.28 SourceResolver: Add JSDoc to resolveSource() method
  - [ ] 4.29 SourceResolver: Add JSDoc to resolveImports() method
  - [ ] 4.30 Open `src/lib/DependencyGraph.ts` for JSDoc additions (FR-38)
  - [ ] 4.31 DependencyGraph: Add class-level JSDoc comment
  - [ ] 4.32 DependencyGraph: Add JSDoc to buildGraph() method
  - [ ] 4.33 DependencyGraph: Add JSDoc to topologicalSort() method with circular dep note
  - [ ] 4.34 DependencyGraph: Add JSDoc to detectCycles() method
  - [ ] 4.35 Open `src/lib/OutputFormatter.ts` for JSDoc additions (FR-39)
  - [ ] 4.36 OutputFormatter: Add class-level JSDoc comment
  - [ ] 4.37 OutputFormatter: Add JSDoc to format() method with @example
  - [ ] 4.38 OutputFormatter: Add JSDoc to formatSelectorTable() method
  - [ ] 4.39 OutputFormatter: Add JSDoc to consolidateSPDX() method
  - [ ] 4.40 Open `src/tasks/shared/TaskOptions.ts` for interface documentation (FR-40)
  - [ ] 4.41 TaskOptions: Add JSDoc to DiamondFlattenTaskArgs interface with property descriptions
  - [ ] 4.42 TaskOptions: Add JSDoc to DiamondFlattenOptions interface
  - [ ] 4.43 TaskOptions: Add JSDoc to DiamondFlattenResult interface
  - [ ] 4.44 TaskOptions: Add JSDoc to SelectorInfo interface
  - [ ] 4.45 TaskOptions: Add JSDoc to FlattenStats interface
  - [ ] 4.46 Open `README.md` to add flatten task section (FR-41)
  - [ ] 4.47 README: Add "Diamond Flatten" section under Tasks or Features heading
  - [ ] 4.48 README: Add brief description of flatten functionality
  - [ ] 4.49 README: Add quick example command: `npx hardhat diamond:flatten --diamond-name MyDiamond`
  - [ ] 4.50 README: Add link to full documentation: `[See full documentation](docs/tasks/diamond-flatten.md)`
  - [ ] 4.51 Commit documentation: `git add docs/ src/ README.md && git commit -m "docs(epic6): add comprehensive documentation and JSDoc comments"`

- [ ] 5.0 Set up CI/CD pipeline with GitHub Actions
  - [ ] 5.1 Create workflow directory: `mkdir -p .github/workflows`
  - [ ] 5.2 Create `.github/workflows/test-flatten.yml` workflow file (FR-45)
  - [ ] 5.3 Workflow: Add workflow name and description
  - [ ] 5.4 Workflow: Configure trigger on pull_request to main and develop branches (FR-46)
  - [ ] 5.5 Workflow: Configure trigger on push to feature/epic6-\* branches (FR-47)
  - [ ] 5.6 Workflow: Add job definition with ubuntu-latest runner
  - [ ] 5.7 Workflow: Set timeout-minutes to 10
  - [ ] 5.8 Workflow: Add step - Checkout code with submodules (FR-48)
  - [ ] 5.9 Workflow: Add step - Setup Node.js 18 with Yarn cache
  - [ ] 5.10 Workflow: Add step - Install dependencies: `yarn install --frozen-lockfile` (FR-48)
  - [ ] 5.11 Workflow: Add step - Build workspace packages: `yarn workspace:build` (FR-49)
  - [ ] 5.12 Workflow: Add step - Compile Hardhat contracts: `npx hardhat compile` (FR-50)
  - [ ] 5.13 Workflow: Add step - Run unit tests with coverage: `yarn test:unit:flatten --coverage` (FR-51)
  - [ ] 5.14 Workflow: Add step - Run integration tests: `yarn test:integration:flatten` (FR-52)
  - [ ] 5.15 Workflow: Add step - Upload coverage report to Codecov (FR-53)
  - [ ] 5.16 Workflow: Add step - Run ESLint on flatten files: `npx eslint src/lib/Diamond*.ts src/lib/Source*.ts` (FR-54)
  - [ ] 5.17 Workflow: Add step - Check coverage threshold ≥90% with jq (FR-55)
  - [ ] 5.18 Workflow: Add coverage threshold check script using coverage-summary.json
  - [ ] 5.19 Test workflow locally with act (if available) or commit and push to trigger
  - [ ] 5.20 Commit CI/CD workflow: `git add .github/workflows && git commit -m "ci(epic6): add GitHub Actions workflow for flatten testing"`
  - [ ] 5.21 Push branch to trigger workflow: `git push origin feature/epic6-testing-documentation`
  - [ ] 5.22 Verify workflow runs successfully in GitHub Actions
  - [ ] 5.23 Verify coverage report is generated and uploaded
  - [ ] 5.24 Fix any workflow failures and re-push if needed

- [ ] 6.0 Final validation and epic completion
  - [ ] 6.1 Run complete test suite: `yarn test:unit:flatten && yarn test:integration:flatten`
  - [ ] 6.2 Measure and verify total execution time <30 seconds (FR-3 goal)
  - [ ] 6.3 Generate coverage report: `yarn test:coverage:flatten`
  - [ ] 6.4 Verify overall coverage ≥90% on all core modules (FR-6 through FR-9)
  - [ ] 6.5 Manually test CLI: `npx hardhat diamond:flatten --diamond-name ExampleDiamond`
  - [ ] 6.6 Verify CLI output to stdout works correctly
  - [ ] 6.7 Manually test CLI with --output flag to file
  - [ ] 6.8 Verify output file is created with correct content
  - [ ] 6.9 Manually test CLI with --verbose flag
  - [ ] 6.10 Verify verbose logs are displayed
  - [ ] 6.11 Test programmatic usage in Node.js script
  - [ ] 6.12 Verify programmatic API returns correct result object
  - [ ] 6.13 Review all documentation for completeness and accuracy
  - [ ] 6.14 Check that all P0 requirements (FR-1 through FR-55) are met
  - [ ] 6.15 Run ESLint on all new files: `npx eslint test/ src/lib/Diamond*.ts`
  - [ ] 6.16 Fix any ESLint warnings or errors
  - [ ] 6.17 Run Prettier to format all new files: `npx prettier --write test/ src/ docs/`
  - [ ] 6.18 Review git diff to verify no unintended changes
  - [ ] 6.19 Create final commit if any fixes were made: `git add . && git commit -m "chore(epic6): final validation and cleanup"`
  - [ ] 6.20 Push final changes: `git push origin feature/epic6-testing-documentation`
  - [ ] 6.21 Create PR to merge into feature/hardhat-diamonds-flatten
  - [ ] 6.22 Add PR description with Epic 6 completion checklist
  - [ ] 6.23 Request code review from 2+ maintainers
  - [ ] 6.24 Address code review feedback if any
  - [ ] 6.25 Verify CI/CD checks pass on PR
  - [ ] 6.26 Merge PR after approvals
  - [ ] 6.27 Update project/hardhat-diamonds/Milestone_1-flattener/Epic6/epic6.md status to COMPLETE
  - [ ] 6.28 Update diamond-flatten-project-plan.md with Epic 6 completion notes
