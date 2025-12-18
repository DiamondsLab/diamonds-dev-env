# PRD: Migrate LocalDiamondDeployer to @diamondslab/hardhat-diamonds Module

## Introduction/Overview

This feature migrates the `LocalDiamondDeployer` class from the root project's `scripts/setup/` directory into the `@diamondslab/hardhat-diamonds` npm module. This migration will make the LocalDiamondDeployer functionality portable and available to all projects that use the hardhat-diamonds module, enabling better code reuse, versioning, and distribution across the Diamonds ecosystem.

The LocalDiamondDeployer is currently used in test files to create singleton instances for deploying Diamond contracts on Hardhat local nodes and forks. By moving it into the hardhat-diamonds module, we eliminate code duplication and make this essential testing utility available to the broader community.

## Goals

1. **Portability**: Make LocalDiamondDeployer available as an exported class from @diamondslab/hardhat-diamonds
2. **Maintainability**: Consolidate deployment logic in a single, versioned, distributable module
3. **Compatibility**: Ensure all existing tests continue to pass after migration with updated imports
4. **Documentation**: Provide comprehensive documentation and examples for using LocalDiamondDeployer
5. **Distribution**: Enable proper versioning and distribution of LocalDiamondDeployer through npm

## User Stories

1. **As a developer using hardhat-diamonds**, I want to import LocalDiamondDeployer directly from the module so that I don't need to copy utility files into my project.

2. **As a test author**, I want to use LocalDiamondDeployer from @diamondslab/hardhat-diamonds so that my tests can easily deploy diamonds on local Hardhat networks.

3. **As a module maintainer**, I want LocalDiamondDeployer to be part of hardhat-diamonds so that improvements and bug fixes are distributed through normal npm versioning.

4. **As a new developer**, I want clear documentation and examples showing how to use LocalDiamondDeployer so that I can quickly set up diamond deployments in my tests.

## Functional Requirements

### Migration Requirements

1. **Move File**: The `LocalDiamondDeployer.ts` file must be moved from `/workspaces/diamonds_dev_env/scripts/setup/LocalDiamondDeployer.ts` to `/workspaces/diamonds_dev_env/packages/hardhat-diamonds/src/lib/LocalDiamondDeployer.ts` and rewritten as necessary to function within the module context as a hardhat plugin.

2. **Update Imports**: All import statements within `LocalDiamondDeployer.ts` must be updated to reflect the new module location and dependencies

3. **Export Class**: The `LocalDiamondDeployer` class and `LocalDiamondDeployerConfig` interface must be exported from the hardhat-diamonds module's main entry point

4. **Minimal Changes**: The migration should preserve the existing functionality with only necessary changes to import paths and module structure

### Test Update Requirements

5. **Identify Test Files**: All test files in the `/test` directory that import or use `LocalDiamondDeployer` must be identified

6. **Update Test Imports**: All identified test files must have their imports updated from the local path (`../../scripts/setup/LocalDiamondDeployer`) to the module import (`@diamondslab/hardhat-diamonds`)

7. **Verify Test Execution**: All updated tests must pass successfully after the migration

8. **No Functional Changes**: Tests should not require logic changes, only import path updates

### Documentation Requirements

9. **Update hardhat-diamonds README**: The README.md in `packages/hardhat-diamonds/` must be updated to:
   - Include LocalDiamondDeployer in the API overview
   - Provide usage examples showing how to import and use the class
   - Document the LocalDiamondDeployerConfig interface

10. **Update PROJECT_OVERVIEW.md**: The `/docs/PROJECT_OVERVIEW.md` must be updated to:
    - Reflect that LocalDiamondDeployer is now part of hardhat-diamonds module
    - Update the import path in the example usage section
    - Maintain consistency with the new module structure

11. **Add API Documentation**: Create or update API documentation that includes:
    - Constructor parameters and configuration options
    - Public methods and their signatures
    - Return types and error conditions
    - Code examples demonstrating common use cases

12. **Provide Migration Examples**: Include at least one complete working example showing:
    - How to configure LocalDiamondDeployer
    - How to deploy a diamond in a test
    - How to retrieve and interact with the deployed diamond

### Module Export Requirements

13. **Update Package Exports**: The `packages/hardhat-diamonds/src/index.ts` must export:
    - `LocalDiamondDeployer` class
    - `LocalDiamondDeployerConfig` interface

14. **Maintain Type Definitions**: Ensure TypeScript type definitions are properly exported for consumers of the module

15. **Update Package Version**: Consider updating the package version to reflect the new functionality (following semantic versioning)

## Non-Goals (Out of Scope)

1. **Refactoring**: This migration will NOT include refactoring or improvements to the LocalDiamondDeployer logic itself
2. **New Features**: No new features or configuration options will be added to LocalDiamondDeployer
3. **External Projects**: Updating projects outside this monorepo that may use LocalDiamondDeployer
4. **Breaking Changes**: No breaking changes to the LocalDiamondDeployer API or behavior
5. **Performance Optimization**: Performance improvements are not included in this migration
6. **Additional Deployment Strategies**: Only LocalDiamondDeployer is being migrated, not other deployment utilities
7. **Cross-Module Testing**: Tests in other packages (diamonds, diamonds-monitor, etc.) are out of scope

## Technical Considerations

### Dependencies

- The hardhat-diamonds module must have all necessary dependencies that LocalDiamondDeployer requires
- Verify that @diamondslab/diamonds is already a dependency of hardhat-diamonds
- Ensure ethers, hardhat, and other peer dependencies are properly declared

### Import Path Updates

- Original import path pattern: `../../scripts/setup/LocalDiamondDeployer`
- New import path pattern: `@diamondslab/hardhat-diamonds`
- Named exports: `{ LocalDiamondDeployer, LocalDiamondDeployerConfig }`

### Module Structure

```
packages/hardhat-diamonds/
├── src/
│   ├── lib/
│   │   └── LocalDiamondDeployer.ts (new location)
│   └── index.ts (update exports)
├── README.md (update documentation)
└── package.json (verify dependencies)
```

### Testing Strategy

1. Run all tests in `/test` directory after migration
2. Verify singleton pattern still works correctly
3. Ensure Diamond ABI generation still functions
4. Confirm deployment callbacks execute properly

### Build Process

- Ensure TypeScript compilation includes the new file location
- Verify type definitions are generated correctly
- Check that the built package includes LocalDiamondDeployer in dist/

## Success Metrics

1. **Test Pass Rate**: 100% of existing tests using LocalDiamondDeployer pass after migration
2. **Import Updates**: All test files successfully import from @diamondslab/hardhat-diamonds
3. **Documentation Completeness**:
   - README includes LocalDiamondDeployer section with examples
   - PROJECT_OVERVIEW.md updated with new import paths
   - At least one complete working example provided
4. **No Regressions**: Existing functionality works identically after migration
5. **Module Exports**: LocalDiamondDeployer and LocalDiamondDeployerConfig are accessible via module imports

## Open Questions

1. **Version Bump**: Should this be a minor or patch version bump for hardhat-diamonds?
2. **Deprecation Notice**: Should we add a deprecation notice to the old file location or remove it entirely?
3. **Additional Utilities**: Are there other deployment utilities in `scripts/` that should be migrated in future iterations?
4. **Peer Dependencies**: Should LocalDiamondDeployer dependencies be listed as peer dependencies or regular dependencies in hardhat-diamonds?

## Implementation Notes

- Maintain the singleton pattern using the static `instances` Map
- Preserve all private and public method signatures
- Keep the hardhat task integration (`hre.run('diamond:generate-abi-typechain')`)
- Ensure the `cutKey` utility function is also available/imported correctly
- Verify that the `FileDeploymentRepository` import resolves correctly from @diamondslab/diamonds
