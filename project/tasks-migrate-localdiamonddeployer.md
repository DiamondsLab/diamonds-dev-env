## Relevant Files

- `scripts/setup/LocalDiamondDeployer.ts` - Original LocalDiamondDeployer class to be migrated
- `packages/hardhat-diamonds/src/lib/LocalDiamondDeployer.ts` - New location for LocalDiamondDeployer
- `packages/hardhat-diamonds/src/index.ts` - Module entry point, needs to export LocalDiamondDeployer
- `packages/hardhat-diamonds/package.json` - Module package file, verify dependencies
- `packages/hardhat-diamonds/tsconfig.json` - TypeScript configuration
- `packages/hardhat-diamonds/README.md` - Module documentation, needs LocalDiamondDeployer section
- `docs/PROJECT_OVERVIEW.md` - Project documentation, references LocalDiamondDeployer
- `test/deployment/DiamondDeployment.test.ts` - Uses LocalDiamondDeployer, needs import update
- `test/integration/e2e-diamond-monitoring.test.ts` - Uses LocalDiamondDeployer, needs import update
- `test/integration/performance-monitoring.test.ts` - Uses LocalDiamondDeployer, needs import update
- `test/integration/diamonds-hardhat-foundry.test.ts` - References LocalDiamondDeployer in comments

### Notes

- Unit tests should typically be placed alongside the code files they are testing.
- Run tests with `yarn test` or `npx hardhat test` for specific test files.
- The hardhat-diamonds module is in `packages/hardhat-diamonds/`
- Original LocalDiamondDeployer is in `scripts/setup/LocalDiamondDeployer.ts`
- After migration, rebuild the hardhat-diamonds module with `yarn workspace @diamondslab/hardhat-diamonds build`
- **IMPORTANT ARCHITECTURAL CHANGE**: LocalDiamondDeployer is exported from `@diamondslab/hardhat-diamonds/dist/utils` instead of the main index to prevent HH9 circular dependency error when hardhat.config.ts loads the module
- LocalDiamondDeployer now receives `hre` as a parameter in its constructor and `getInstance()` method, following the DiamondAbiGenerator pattern to avoid importing hardhat at module level

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch for both repositories
  - [x] 0.1 Create and checkout a new branch in the main diamonds-dev-env repo (e.g., `git checkout -b feature/migrate-localdiamonddeployer`)
  - [x] 0.2 Navigate to packages/hardhat-diamonds and create a branch there as well (e.g., `cd packages/hardhat-diamonds && git checkout -b feature/migrate-localdiamonddeployer`)

- [ ] 1.0 Migrate LocalDiamondDeployer to hardhat-diamonds module
  - [x] 1.1 Read the original LocalDiamondDeployer.ts file at `scripts/setup/LocalDiamondDeployer.ts` to understand its structure and dependencies
  - [x] 1.2 Create the `packages/hardhat-diamonds/src/lib/` directory if it doesn't exist
  - [x] 1.3 Copy `LocalDiamondDeployer.ts` to `packages/hardhat-diamonds/src/lib/LocalDiamondDeployer.ts`
  - [x] 1.4 Update import statements in the migrated file to use module imports instead of relative paths (e.g., `@diamondslab/diamonds` instead of `../../`)
  - [x] 1.5 Verify all dependencies are available in the new location (Diamond, FileDeploymentRepository, ethers, hardhat, etc.)
  - [x] 1.6 Ensure the cutKey utility function is imported correctly

- [x] 2.0 Update module exports and TypeScript configuration
  - [x] 2.1 Read `packages/hardhat-diamonds/src/index.ts` to understand current exports
  - [x] 2.2 Add export statements for LocalDiamondDeployer and LocalDiamondDeployerConfig to `packages/hardhat-diamonds/src/index.ts`
  - [x] 2.3 Verify `packages/hardhat-diamonds/package.json` has all required dependencies (@diamondslab/diamonds, ethers, hardhat)
  - [x] 2.4 Check `packages/hardhat-diamonds/tsconfig.json` includes the src/lib/ directory in compilation
  - [x] 2.5 Build the hardhat-diamonds module to verify it compiles: `yarn workspace @diamondslab/hardhat-diamonds build`
  - [x] 2.6 Verify TypeScript type definitions are generated correctly in the dist/ folder

- [x] 3.0 Update test file imports
  - [x] 3.1 Update `test/deployment/DiamondDeployment.test.ts` to import from `@diamondslab/hardhat-diamonds` instead of `../../scripts/setup/LocalDiamondDeployer`
  - [x] 3.2 Update `test/integration/e2e-diamond-monitoring.test.ts` to import from `@diamondslab/hardhat-diamonds`
  - [x] 3.3 Update `test/integration/performance-monitoring.test.ts` to import from `@diamondslab/hardhat-diamonds`
  - [x] 3.4 Check `test/integration/diamonds-hardhat-foundry.test.ts` for any LocalDiamondDeployer references that need updating (currently only in comments)
  - [x] 3.5 Verify no other test files reference the old LocalDiamondDeployer path by searching the codebase

- [x] 4.0 Update documentation
  - [x] 4.1 Read current `packages/hardhat-diamonds/README.md` to understand its structure
  - [x] 4.2 Add a new section to `packages/hardhat-diamonds/README.md` documenting LocalDiamondDeployer
  - [x] 4.3 Include API documentation with constructor parameters, methods, and configuration options
  - [x] 4.4 Add a usage example showing how to import and use LocalDiamondDeployer in tests
  - [x] 4.5 Update `docs/PROJECT_OVERVIEW.md` to reflect that LocalDiamondDeployer is now part of hardhat-diamonds module
  - [x] 4.6 Update the import path in the example usage section of PROJECT_OVERVIEW.md
  - [x] 4.7 Add note about the migration to help future developers understand the module structure

- [ ] 5.0 Verify tests and create example
  - [ ] 5.1 Run the DiamondDeployment test to verify it passes: `yarn test test/deployment/DiamondDeployment.test.ts`
  - [ ] 5.2 Run the e2e-diamond-monitoring test: `yarn test test/integration/e2e-diamond-monitoring.test.ts`
  - [ ] 5.3 Run the performance-monitoring test: `yarn test test/integration/performance-monitoring.test.ts`
  - [ ] 5.4 Run all tests to ensure no regressions: `yarn test`
  - [ ] 5.5 Verify the singleton pattern still works correctly across multiple test instances
  - [ ] 5.6 Verify Diamond ABI generation still functions properly
  - [ ] 5.7 Create or update an example in packages/hardhat-diamonds showing complete LocalDiamondDeployer usage
  - [ ] 5.8 Document any issues or considerations for future maintainers
