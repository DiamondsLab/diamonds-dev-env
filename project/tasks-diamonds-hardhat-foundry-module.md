# Task List: Diamonds-Hardhat-Foundry Module

Based on PRD: [prd-diamonds-hardhat-foundry-module.md](prd-diamonds-hardhat-foundry-module.md)

## Relevant Files

### Module Core Files

- `packages/diamonds-hardhat-foundry/src/index.ts` - Main entry point and plugin registration
- `packages/diamonds-hardhat-foundry/src/types/config.ts` - TypeScript interfaces for configuration
- `packages/diamonds-hardhat-foundry/src/utils/logger.ts` - Colored logging utility
- `packages/diamonds-hardhat-foundry/src/utils/validation.ts` - Configuration and dependency validation
- `packages/diamonds-hardhat-foundry/src/utils/foundry.ts` - Foundry command execution utilities

### Framework Classes

- `packages/diamonds-hardhat-foundry/src/framework/ForgeFuzzingFramework.ts` - Main orchestration class
- `packages/diamonds-hardhat-foundry/src/framework/DeploymentManager.ts` - Deployment lifecycle management
- `packages/diamonds-hardhat-foundry/src/framework/HelperGenerator.ts` - Solidity helper generation

### Hardhat Tasks

- `packages/diamonds-hardhat-foundry/src/tasks/init.ts` - diamonds-forge:init task
- `packages/diamonds-hardhat-foundry/src/tasks/deploy.ts` - diamonds-forge:deploy task
- `packages/diamonds-hardhat-foundry/src/tasks/generate-helpers.ts` - diamonds-forge:generate-helpers task
- `packages/diamonds-hardhat-foundry/src/tasks/test.ts` - diamonds-forge:test task

### Base Solidity Contracts

- `packages/diamonds-hardhat-foundry/contracts/DiamondForgeHelpers.sol` - Base helper contract
- `packages/diamonds-hardhat-foundry/contracts/DiamondFuzzBase.sol` - Base test contract

### Templates

- `packages/diamonds-hardhat-foundry/src/templates/DiamondDeployment.sol.template` - Deployment data template
- `packages/diamonds-hardhat-foundry/src/templates/ExampleUnitTest.t.sol.template` - Unit test example
- `packages/diamonds-hardhat-foundry/src/templates/ExampleIntegrationTest.t.sol.template` - Integration test example
- `packages/diamonds-hardhat-foundry/src/templates/ExampleFuzzTest.t.sol.template` - Fuzz test example

### Module Tests

- `packages/diamonds-hardhat-foundry/test/framework/ForgeFuzzingFramework.test.ts` - Framework class tests
- `packages/diamonds-hardhat-foundry/test/framework/DeploymentManager.test.ts` - DeploymentManager tests
- `packages/diamonds-hardhat-foundry/test/framework/HelperGenerator.test.ts` - HelperGenerator tests
- `packages/diamonds-hardhat-foundry/test/utils/validation.test.ts` - Validation utility tests

### Integration Tests (in diamonds-dev-env)

- `test/foundry/integration/diamonds-hardhat-foundry/deployment.t.sol` - Deployment integration tests
- `test/foundry/integration/diamonds-hardhat-foundry/helper-generation.t.sol` - Helper generation tests
- `test/foundry/integration/diamonds-hardhat-foundry/end-to-end.t.sol` - Full workflow tests

### Configuration & Documentation

- `packages/diamonds-hardhat-foundry/package.json` - Package metadata and dependencies
- `packages/diamonds-hardhat-foundry/tsconfig.json` - TypeScript configuration
- `packages/diamonds-hardhat-foundry/README.md` - Comprehensive module documentation
- `packages/diamonds-hardhat-foundry/.eslintrc.js` - ESLint configuration

### Notes

- Unit tests should be placed in `packages/diamonds-hardhat-foundry/test/` for module code
- Integration tests should be placed in `test/foundry/` at the project root level
- Use `pnpm test` in the module directory to run module unit tests
- Use `forge test` to run integration tests
- Base Solidity contracts will be in `packages/diamonds-hardhat-foundry/contracts/`
- Generated helpers will be in user projects at `test/foundry/helpers/`
- Module must maintain peer dependencies on `@diamondslab/diamonds` and `@diamondslab/hardhat-diamonds`
- All Hardhat tasks should be prefixed with `diamonds-forge:`
- Follow existing code style from `@nomicfoundation/hardhat-foundry`

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Create and checkout a new branch for this feature (e.g., `git checkout -b feature/diamonds-hardhat-foundry-module`)
- [ ] 1.0 Core Module Setup
  - [ ] 1.1 Review existing module structure in `packages/diamonds-hardhat-foundry`
  - [ ] 1.2 Update `package.json` with correct metadata (name, description, keywords, peer dependencies)
  - [ ] 1.3 Configure TypeScript build settings in `tsconfig.json`
  - [ ] 1.4 Set up ESLint configuration (`.eslintrc.js` or extend from workspace)
  - [ ] 1.5 Create source directory structure (`src/framework/`, `src/tasks/`, `src/utils/`, `src/types/`, `src/templates/`)
  - [ ] 1.6 Create `src/index.ts` as main entry point
  - [ ] 1.7 Implement basic Hardhat plugin registration in `src/index.ts`
  - [ ] 1.8 Create colored logger utility in `src/utils/logger.ts`
  - [ ] 1.9 Verify build works (`pnpm build` in module directory)
- [ ] 2.0 Configuration System
  - [ ] 2.1 Define TypeScript interfaces for `DiamondsFoundryConfig` in `src/types/config.ts`
  - [ ] 2.2 Define default configuration values in `src/types/config.ts`
  - [ ] 2.3 Create config validation function in `src/utils/validation.ts`
  - [ ] 2.4 Implement HRE extension to expose `diamondsFoundry` config
  - [ ] 2.5 Add Foundry installation check in `src/utils/validation.ts`
  - [ ] 2.6 Add peer dependency validation in `src/utils/validation.ts`
  - [ ] 2.7 Create unit tests for validation utilities
- [ ] 3.0 Programmatic API Implementation
  - [ ] 3.1 Create `src/framework/DeploymentManager.ts` skeleton
  - [ ] 3.2 Implement `DeploymentManager.deploy()` method using LocalDiamondDeployer
  - [ ] 3.3 Implement `DeploymentManager.getDeployment()` to read deployment records
  - [ ] 3.4 Implement `DeploymentManager.ensureDeployment()` for reuse logic
  - [ ] 3.5 Create `src/framework/HelperGenerator.ts` skeleton
  - [ ] 3.6 Implement `HelperGenerator.scaffoldProject()` for initial setup
  - [ ] 3.7 Implement `HelperGenerator.generateDeploymentHelpers()` for DiamondDeployment.sol
  - [ ] 3.8 Implement `HelperGenerator.generateExampleTests()` for test templates
  - [ ] 3.9 Create `src/framework/ForgeFuzzingFramework.ts` skeleton
  - [ ] 3.10 Implement `ForgeFuzzingFramework.runTests()` orchestration method
  - [ ] 3.11 Create utility functions in `src/utils/foundry.ts` for executing forge commands
  - [ ] 3.12 Write unit tests for `DeploymentManager` class
  - [ ] 3.13 Write unit tests for `HelperGenerator` class
  - [ ] 3.14 Write unit tests for `ForgeFuzzingFramework` class
- [ ] 4.0 Hardhat Tasks Implementation
  - [ ] 4.1 Create `src/tasks/init.ts` for `diamonds-forge:init` task
  - [ ] 4.2 Implement task logic: validate config, scaffold directories, generate base helpers
  - [ ] 4.3 Add task parameters: `--helpers-dir`, `--examples`, `--force`
  - [ ] 4.4 Create `src/tasks/deploy.ts` for `diamonds-forge:deploy` task
  - [ ] 4.5 Implement task logic: validate Foundry, deploy Diamond, save deployment record
  - [ ] 4.6 Add task parameters: `--network`, `--diamond-name`, `--reuse`
  - [ ] 4.7 Create `src/tasks/generate-helpers.ts` for `diamonds-forge:generate-helpers` task
  - [ ] 4.8 Implement task logic: read deployment, generate DiamondDeployment.sol
  - [ ] 4.9 Add task parameters: `--diamond-name`, `--output-dir`
  - [ ] 4.10 Create `src/tasks/test.ts` for `diamonds-forge:test` task
  - [ ] 4.11 Implement task logic: ensure deployment, generate helpers, run forge test
  - [ ] 4.12 Add task parameters: pass-through for forge test args (e.g., `--match-test`, `-vvv`)
  - [ ] 4.13 Register all tasks in `src/index.ts` during plugin initialization
  - [ ] 4.14 Add comprehensive logging to all tasks with colored output
- [ ] 5.0 Base Solidity Contracts & Templates
  - [ ] 5.1 Create `contracts/` directory in module root
  - [ ] 5.2 Create `contracts/DiamondForgeHelpers.sol` with common test utilities
  - [ ] 5.3 Implement helper functions: `getDiamondAddress()`, `getFacetAddress()`, `logDiamondInfo()`
  - [ ] 5.4 Create `contracts/DiamondFuzzBase.sol` as base contract for fuzz tests
  - [ ] 5.5 Implement setup methods in `DiamondFuzzBase.sol`
  - [ ] 5.6 Create `src/templates/DiamondDeployment.sol.template` with placeholders
  - [ ] 5.7 Create `src/templates/ExampleUnitTest.t.sol.template` showing basic test pattern
  - [ ] 5.8 Create `src/templates/ExampleIntegrationTest.t.sol.template` showing multi-facet testing
  - [ ] 5.9 Create `src/templates/ExampleFuzzTest.t.sol.template` showing fuzzing pattern
  - [ ] 5.10 Verify all base contracts and templates compile with forge
  - [ ] 5.11 Add imports and dependencies in Solidity files (Test, console from forge-std)
- [ ] 6.0 Integration Testing
  - [ ] 6.1 Create integration test directory structure in `test/foundry/integration/diamonds-hardhat-foundry/`
  - [ ] 6.2 Create test for `diamonds-forge:init` task (scaffolds correctly)
  - [ ] 6.3 Create test for `diamonds-forge:deploy` task (deploys Diamond successfully)
  - [ ] 6.4 Create test for `diamonds-forge:generate-helpers` task (generates valid helpers)
  - [ ] 6.5 Create test for `diamonds-forge:test` task (runs tests end-to-end)
  - [ ] 6.6 Create test for programmatic API usage (using classes directly)
  - [ ] 6.7 Verify generated `DiamondDeployment.sol` compiles and contains correct data
  - [ ] 6.8 Test with both Hardhat network and Anvil
  - [ ] 6.9 Run existing prototype tests and document necessary modifications
  - [ ] 6.10 Verify all integration tests pass
- [ ] 7.0 Documentation & Examples
  - [ ] 7.1 Write comprehensive README.md with installation instructions
  - [ ] 7.2 Add "Quick Start" section to README
  - [ ] 7.3 Document all Hardhat tasks with parameters and examples
  - [ ] 7.4 Document programmatic API (classes and methods) in README
  - [ ] 7.5 Add configuration schema documentation
  - [ ] 7.6 Create "Usage Examples" section with common workflows
  - [ ] 7.7 Add troubleshooting section for common issues
  - [ ] 7.8 Add inline JSDoc comments to all exported functions and classes
  - [ ] 7.9 Generate API documentation with TypeDoc (configure in package.json)
  - [ ] 7.10 Add code comments explaining complex logic
  - [ ] 7.11 Document peer dependency requirements
  - [ ] 7.12 Add migration notes explaining differences from prototype
- [ ] 8.0 Release Preparation
  - [ ] 8.1 Run full module test suite (`pnpm test` in module directory)
  - [ ] 8.2 Run full integration test suite (`forge test`)
  - [ ] 8.3 Fix any failing tests or identified issues
  - [ ] 8.4 Run linting and formatting (`pnpm lint:fix`)
  - [ ] 8.5 Verify TypeScript compilation has no errors (`pnpm build`)
  - [ ] 8.6 Update version in `package.json` to 1.0.0
  - [ ] 8.7 Build distribution package (`pnpm build`)
  - [ ] 8.8 Verify package contents in `dist/` directory
  - [ ] 8.9 Test package installation in a clean project (link locally or use `npm pack`)
  - [ ] 8.10 Create release notes documenting features and usage
  - [ ] 8.11 Update root workspace package.json to reference the module
  - [ ] 8.12 Tag release and push to repository
  - [ ] 8.13 Publish to npm (or prepare for publication with `npm pack` for review)
