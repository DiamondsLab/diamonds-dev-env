# PRD: Migrate LocalDiamondDeployer & Enhance Helper Contract Support

## Introduction/Overview

This PRD addresses the migration of `LocalDiamondDeployer` from the monorepo workspace to the `@diamondslab/hardhat-diamonds` peer dependency package, and the enhancement of the `@diamondslab/diamonds-hardhat-foundry` module to provide reusable Solidity helper contracts (`DiamondABILoader.sol` and `DiamondFuzzBase.sol`) as importable package resources.

**Problem Statement:**

1. The `LocalDiamondDeployer` class is currently being dynamically loaded from the workspace, which creates tight coupling and makes the module less portable
2. Critical helper contracts (`DiamondABILoader.sol`, `DiamondFuzzBase.sol`) exist only in the monorepo's test directory, making them unavailable to module users
3. Integration tests in the monorepo are incomplete, risking regressions and deployment issues

**Goal:**
Modernize the module architecture to use proper dependency management, provide essential Solidity utilities as first-class package exports, and validate the complete workflow through comprehensive integration testing.

## Goals

1. **Decouple from Workspace**: Remove dependency on workspace-specific file paths by importing `LocalDiamondDeployer` from `@diamondslab/hardhat-diamonds` peer dependency
2. **Provide Reusable Helpers**: Package `DiamondABILoader.sol` and `DiamondFuzzBase.sol` as importable Solidity contracts available to all users
3. **Validate Integration**: Complete core integration tests to ensure the module works correctly in real-world scenarios
4. **Maintain Quality**: Ensure existing fuzz and invariant tests continue to work with the new architecture
5. **Clear Migration Path**: Document breaking changes and provide upgrade guidance for existing users

## User Stories

### Story 1: Module Developer

**As a** module maintainer  
**I want** to import `LocalDiamondDeployer` from `@diamondslab/hardhat-diamonds` using static TypeScript imports  
**So that** the module is portable and doesn't depend on workspace-specific file paths

### Story 2: Plugin User

**As a** developer using `@diamondslab/diamonds-hardhat-foundry`  
**I want** to import helper contracts like `DiamondABILoader.sol` directly from the package  
**So that** I can build advanced tests without copying code from examples

### Story 3: Test Suite Maintainer

**As a** module developer  
**I want** comprehensive integration tests covering deployment, helper generation, and end-to-end workflows  
**So that** I can confidently release new versions knowing the core features work correctly

### Story 4: Advanced User

**As a** developer writing complex Diamond tests  
**I want** to extend configurable base classes like `DiamondFuzzBase`  
**So that** I can customize the testing framework for my specific Diamond implementation

## Functional Requirements

### Phase 1: LocalDiamondDeployer Migration (Priority: Critical)

**FR-1.1** Update `DeploymentManager.ts` to import `LocalDiamondDeployer` from `@diamondslab/hardhat-diamonds` using static TypeScript imports

- Remove dynamic `require()` logic
- Add proper TypeScript import statement
- Update peer dependency version requirements

**FR-1.2** Remove fallback logic for workspace-based LocalDiamondDeployer loading

- Delete `getDeployerClass()` method's file path resolution
- Simplify error handling to focus on peer dependency issues

**FR-1.3** Update `package.json` peer dependencies

- Specify minimum version of `@diamondslab/hardhat-diamonds` that exports `LocalDiamondDeployer`
- Document version compatibility requirements

**FR-1.4** Handle import errors gracefully

- Provide clear error messages if peer dependency is missing
- Suggest installation command in error output

### Phase 2: Helper Contracts as Package Resources (Priority: High)

**FR-2.1** Create `contracts/` directory in package root

- Structure: `packages/diamonds-hardhat-foundry/contracts/`
- Add to package.json `files` array for npm publishing

**FR-2.2** Copy and adapt `DiamondABILoader.sol`

- Place in `contracts/DiamondABILoader.sol`
- Make it configurable/extensible (virtual functions where appropriate)
- Add comprehensive NatSpec documentation
- Ensure Solidity version compatibility (^0.8.0)

**FR-2.3** Copy and adapt `DiamondFuzzBase.sol`

- Place in `contracts/DiamondFuzzBase.sol`
- Make it an abstract base class with virtual functions
- Allow users to override setup, validation, and helper methods
- Add comprehensive NatSpec documentation

**FR-2.4** Create helper utility contract `DiamondForgeHelpers.sol`

- Place in `contracts/DiamondForgeHelpers.sol`
- Include common assertion helpers
- Include address validation utilities
- Make functions reusable across test types

**FR-2.5** Update build process

- Ensure contracts are included in published npm package
- Verify contracts compile with standard Forge setup
- Test import paths work correctly

**FR-2.6** Update template generation

- Modify templates to import from package contracts instead of relative paths
- Example: `import "@diamondslab/diamonds-hardhat-foundry/contracts/DiamondFuzzBase.sol";`

### Phase 3: Core Integration Tests (Priority: High)

**FR-3.1** Complete `deployment.t.sol`

- Test: Diamond deployment via `diamonds-forge:deploy` task
- Test: Verify Diamond contract exists at returned address
- Test: Verify all facets are deployed and have code
- Test: Load deployment data from generated files
- Test: Validate deployer address matches expectation

**FR-3.2** Complete `end-to-end.t.sol`

- Test: Full workflow from init → deploy → generate → test
- Test: Programmatic API usage (DeploymentManager, HelperGenerator, ForgeFuzzingFramework)
- Test: Force redeployment with `--force` flag
- Test: Deployment reuse with `--reuse` flag
- Test: Example test generation
- Test: Custom configuration options

**FR-3.3** Complete `helper-generation.t.sol`

- Test: `DiamondDeployment.sol` file generation
- Test: Generated file has correct Diamond address
- Test: Generated file includes all facet addresses
- Test: Helper getter functions return valid addresses
- Test: Generated code compiles without errors

**FR-3.4** Complete `DiamondABILoader.t.sol`

- Test: ABI file loading from disk
- Test: Selector extraction accuracy
- Test: Signature extraction accuracy
- Test: Function info retrieval
- Test: Selector verification
- Test: Error handling for missing files

### Phase 4: Validate Existing Tests (Priority: Medium)

**FR-4.1** Verify `DiamondProxyInvariant.t.sol` works with new setup

- Ensure imports resolve correctly
- Run all invariant tests
- Validate no regressions

**FR-4.2** Verify `AccessControlFuzz.t.sol` works with new setup

- Update imports if needed
- Run all fuzz tests
- Validate access control scenarios

**FR-4.3** Verify `DiamondAccessControl.t.sol` works with new setup

- Update imports if needed
- Run all access control tests

**FR-4.4** Verify `DiamondInvariants.t.sol` works with new setup

- Update imports if needed
- Run all invariant tests

**FR-4.5** Verify `DiamondOwnership.t.sol` works with new setup

- Update imports if needed
- Run all ownership tests

**FR-4.6** Verify `DiamondRouting.t.sol` works with new setup

- Update imports if needed
- Run all routing tests

### Phase 5: Documentation & Migration (Priority: High)

**FR-5.1** Update README.md

- Add import examples for helper contracts
- Document `@diamondslab/hardhat-diamonds` peer dependency requirement
- Provide code examples using `DiamondFuzzBase` and `DiamondABILoader`

**FR-5.2** Create MIGRATION.md guide

- Document breaking changes from v1.x to v2.x
- Provide step-by-step upgrade instructions
- Include before/after code examples
- List all affected imports and file paths

**FR-5.3** Update CHANGELOG.md

- Document all breaking changes
- List new features (importable contracts)
- Provide migration guidance summary

**FR-5.4** Bump version to 2.0.0

- Update package.json version
- Follow semantic versioning (major version for breaking changes)

## Non-Goals (Out of Scope)

1. **Backward Compatibility**: This is a breaking change; we will NOT maintain compatibility with the old workspace-based approach
2. **Additional Helper Contracts**: Only `DiamondABILoader` and `DiamondFuzzBase` will be provided in this release
3. **Template Customization**: Templates will use the new import paths but won't be significantly redesigned
4. **Advanced Fuzz Testing Features**: Existing fuzz capabilities are sufficient; no new fuzzing strategies in this release
5. **Multi-Chain Testing**: Focus remains on single-network testing workflows
6. **Contract Upgrades Beyond Migration**: No new features for the helper contracts beyond making them configurable

## Design Considerations

### Import Path Structure

```solidity
// New import pattern for users
import "@diamondslab/diamonds-hardhat-foundry/contracts/DiamondFuzzBase.sol";
import "@diamondslab/diamonds-hardhat-foundry/contracts/DiamondABILoader.sol";
```

### TypeScript Import Pattern

```typescript
// New import in DeploymentManager.ts
import { LocalDiamondDeployer } from "@diamondslab/hardhat-diamonds";
```

### Package Structure

```
packages/diamonds-hardhat-foundry/
├── contracts/
│   ├── DiamondABILoader.sol       # Importable library
│   ├── DiamondFuzzBase.sol        # Importable base contract
│   └── DiamondForgeHelpers.sol    # Utility helpers
├── src/
│   ├── framework/
│   │   └── DeploymentManager.ts   # Updated to import from peer dep
│   └── templates/
│       └── *.template              # Updated to use package imports
├── dist/                           # Built output
└── package.json                    # Updated peer dependencies
```

### Extensibility Pattern

```solidity
// DiamondFuzzBase.sol - Configurable base class
abstract contract DiamondFuzzBase is Test {
    address public diamond;

    // Virtual setup - users can override
    function setUp() public virtual {
        diamond = _loadDiamondAddress();
    }

    // Internal virtual methods for customization
    function _loadDiamondAddress() internal virtual returns (address);
    function _configureFuzzParams() internal virtual returns (FuzzConfig memory);
}
```

## Technical Considerations

### Dependencies

- **Peer Dependency**: `@diamondslab/hardhat-diamonds` must export `LocalDiamondDeployer` as a public class
- **Version Pinning**: Specify minimum version that includes the export
- **Hardhat Compatibility**: Maintain compatibility with Hardhat ^2.26.0

### Build Process

- Ensure `contracts/` directory is included in npm package via `files` field
- Copy contracts to `dist/contracts/` during build
- Verify Solidity files are not transpiled (keep as .sol)

### Testing Strategy

1. **Unit Tests**: Test DeploymentManager imports and initialization
2. **Integration Tests**: Run complete workflows in monorepo
3. **Package Tests**: Test that published package imports work correctly

### Error Handling

- Graceful failure if `@diamondslab/hardhat-diamonds` is not installed
- Clear error messages pointing to peer dependency requirements
- Validation that imported `LocalDiamondDeployer` class is compatible

### Project Structure

- The project is a monorepo using Yarn Workspaces for the `@diamondslab` packages
- The `@diamondslab/diamonds-hardhat-foundry` package is located at `packages/diamonds-hardhat-foundry/`
- The `@diamondslab/hardhat-diamonds` package is located at `packages/hardhat-diamonds/`
- The monorepo is used for development and testing of interconnected packages
- The monorepo has tests for Foundry integration located in `test/foundry/`
- TypeScript is used for all module code

## Success Metrics

1. **Migration Success**: DeploymentManager successfully imports and uses `LocalDiamondDeployer` from peer dependency in 100% of test scenarios
2. **Helper Availability**: Users can import `DiamondFuzzBase.sol` and `DiamondABILoader.sol` from the package without errors
3. **Test Coverage**: All core integration tests (deployment, end-to-end, helper-generation) pass successfully
4. **Regression Prevention**: All existing fuzz/invariant tests continue to pass with new architecture
5. **Documentation Quality**: README and MIGRATION guide enable users to upgrade without support tickets
6. **Build Verification**: Package builds successfully and npm publish includes all contracts

## Open Questions

1. **Q**: Should we provide a compatibility layer or adapter for users still on old versions?  
   **A**: No - this is a breaking change (v2.0.0), users must upgrade

2. **Q**: Do we need to version the helper contracts separately from the package?  
   **A**: No - contracts will follow package versioning

3. **Q**: Should DiamondFuzzBase automatically load deployment from DiamondDeployment.sol?  
   **A**: Yes - provide default implementation but allow override via virtual method

4. **Q**: How do we handle Solidity version compatibility across different user projects?  
   **A**: Use `^0.8.0` pragma for maximum compatibility

5. **Q**: Should we add gas profiling utilities to DiamondForgeHelpers?  
   **A**: Defer to future release - out of scope for migration PR

## Implementation Phases

### Phase 1: Migration (Week 1)

- Update DeploymentManager with static imports
- Update peer dependencies
- Test in monorepo environment

### Phase 2: Helper Contracts (Week 1-2)

- Create contracts/ directory structure
- Copy and adapt DiamondABILoader.sol
- Copy and adapt DiamondFuzzBase.sol
- Update templates to use new imports
- Update build process

### Phase 3: Integration Tests (Week 2)

- Complete deployment.t.sol
- Complete end-to-end.t.sol
- Complete helper-generation.t.sol
- Complete DiamondABILoader.t.sol

### Phase 4: Validation (Week 2-3)

- Run all existing fuzz tests
- Run all invariant tests
- Fix any regressions
- Validate complete test suite

### Phase 5: Release (Week 3)

- Update all documentation
- Create migration guide
- Bump to v2.0.0
- Publish to npm

## Acceptance Criteria

- [ ] DeploymentManager imports LocalDiamondDeployer from @diamondslab/hardhat-diamonds
- [ ] DiamondABILoader.sol available at @diamondslab/diamonds-hardhat-foundry/contracts/
- [ ] DiamondFuzzBase.sol available at @diamondslab/diamonds-hardhat-foundry/contracts/
- [ ] All templates updated to use package imports
- [ ] deployment.t.sol complete and passing
- [ ] end-to-end.t.sol complete and passing
- [ ] helper-generation.t.sol complete and passing
- [ ] DiamondABILoader.t.sol complete and passing
- [ ] All existing fuzz tests passing
- [ ] All existing invariant tests passing
- [ ] README.md updated with import examples
- [ ] MIGRATION.md created with upgrade guide
- [ ] CHANGELOG.md updated with v2.0.0 details
- [ ] Package version bumped to 2.0.0
- [ ] Package builds and publishes successfully
- [ ] Contracts included in npm package
- [ ] Fresh installation in monorepo works end-to-end
