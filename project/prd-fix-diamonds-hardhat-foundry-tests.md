# PRD: Fix diamonds-hardhat-foundry Module for Production Release

## Introduction/Overview

The `@diamondslab/diamonds-hardhat-foundry` module provides Foundry Forge testing integration for Diamond proxy contracts. While core functionality is implemented, **38 out of 130 tests are failing** due to test setup issues, preventing production release. The module must achieve 100% test pass rate with a simple, reliable workflow before external publication.

**Problem Statement:** Tests in `test/foundry/` are failing primarily due to incorrect test setup, particularly:

- Access control tests trying to call restricted functions without proper roles
- Tests not properly setting up required permissions in `setUp()`
- Inconsistent deployment state between test suites
- Test helpers not being generated with correct addresses

**Solution:** Systematically fix all test setup issues, ensure tests grant themselves necessary roles, verify deployment helpers are generated correctly, and validate the simple workflow (`init` → write tests → `test`) works end-to-end.

## Goals

1. **Achieve 100% test pass rate** - All 130 tests in `test/foundry/` must pass
2. **Fix test setup patterns** - Tests should properly initialize roles, permissions, and state in `setUp()`
3. **Validate simple workflow** - `npx hardhat diamonds-forge:test` must work out-of-the-box
4. **Ensure network auto-start works** - System should detect missing node and start one automatically
5. **Default to ephemeral deployments** - In-memory deployments for quick iteration (opt-in to save)
6. **Enable production release** - Module ready for external publication with confidence

## User Stories

### As a Diamond Contract Developer (External User)

- I want to run `npx hardhat diamonds-forge:init` to scaffold Forge test structure
- I want to write fuzz tests for my Diamond contract using provided helpers
- I want to run `npx hardhat diamonds-forge:test` and have all infrastructure set up automatically
- I want tests to pass consistently without manual network management
- I want clear error messages if something is misconfigured
- I want examples that work out-of-the-box as templates for my own tests

### As a Diamonds Lab Developer

- I want all 130 tests in `test/foundry/` to pass reliably
- I want tests to be self-contained with proper setUp() initialization
- I want to publish the module with confidence it works for external users
- I want comprehensive test coverage demonstrating all module capabilities

### As a CI/CD Pipeline

- I want `npx hardhat diamonds-forge:test` to run in a clean environment
- I want predictable, reproducible test results
- I want fast feedback on test failures

## Functional Requirements

### Core Test Fixes

**FR-1.1**: ALL access control tests MUST grant themselves necessary roles in `setUp()` before testing role-gated functions

**FR-1.2**: ALL fuzz tests MUST initialize Diamond owner and admin roles to test contract in `setUp()`

**FR-1.3**: ALL invariant tests MUST properly configure target contracts for invariant fuzzing

**FR-1.4**: ALL integration tests MUST verify Diamond deployment before running test logic

**FR-1.5**: Test helper `DiamondDeployment.sol` MUST be generated with actual deployed addresses, not empty values

### Test Setup Patterns

**FR-2.1**: `DiamondFuzzBase.setUp()` MUST load Diamond from deployment helper and validate it has code

**FR-2.2**: Access control test contracts MUST call `_grantRole(DEFAULT_ADMIN_ROLE, address(this))` in `setUp()`

**FR-2.3**: Ownership tests MUST save `originalOwner` in `setUp()` for restoration after fuzz runs

**FR-2.4**: Tests requiring deployer privileges MUST use `vm.prank(deployer)` or `vm.startPrank(deployer)`

**FR-2.5**: Invariant tests MUST call `targetContract(address(diamond))` in `setUp()` to enable fuzzing

### Network and Deployment Management

**FR-3.1**: `diamonds-forge:test` task MUST verify a Hardhat node is running on localhost before running tests

**FR-3.2**: If no node is detected, task MUST start a Hardhat node in the background automatically

**FR-3.3**: Default deployment mode MUST be ephemeral (in-memory, `writeDeployedDiamondData: false`)

**FR-3.4**: `--save-deployment` flag MUST enable persistent deployment file creation

**FR-3.5**: Helper generation MUST use deployment data from in-memory cache OR deployment file

### Workflow Validation

**FR-4.1**: `npx hardhat diamonds-forge:init` MUST create test directory structure and copy example tests

**FR-4.2**: `npx hardhat diamonds-forge:test` MUST complete full workflow:

- Detect/start Hardhat node (if network is localhost)
- Deploy Diamond using LocalDiamondDeployer
- Generate DiamondDeployment.sol helper with real addresses
- Compile Forge contracts
- Run forge test with correct fork URL
- Report test results

**FR-4.3**: All example tests (unit, integration, fuzz) MUST pass when run via the task

**FR-4.4**: Tests MUST work regardless of whether run from workspace root or package directory

## Non-Goals (Out of Scope)

**NG-1**: Performance optimization of test execution speed (can be addressed later)

**NG-2**: Supporting non-Diamond contract testing (module is Diamond-specific)

**NG-3**: Medusa integration (separate effort, not blocking release)

**NG-4**: Multi-chain deployment testing (future enhancement)

**NG-5**: Snapshot/restore advanced features (basic implementation sufficient for now)

**NG-6**: GUI or web interface for test management

## Technical Considerations

### Test Categories and Fix Requirements

**1. Access Control Tests** (`test/foundry/fuzz/AccessControlFuzz.t.sol`, `DiamondAccessControl.t.sol`)

- **Issue**: Tests call `grantRole()`, `revokeRole()` without DEFAULT_ADMIN_ROLE
- **Fix**: Add `vm.prank(owner); _grantRole(DEFAULT_ADMIN_ROLE, address(this))` in `setUp()`
- **Pattern**:

```solidity
function setUp() public override {
    super.setUp();

    address owner = _getDiamondOwner();
    vm.prank(owner);
    _grantRole(DEFAULT_ADMIN_ROLE, address(this));
}
```

**2. Ownership Tests** (`test/foundry/fuzz/DiamondOwnership.t.sol`)

- **Issue**: Tests fail when trying to transfer ownership without being owner
- **Fix**: Use `vm.prank(currentOwner)` before calling `transferOwnership()`
- **Expected behavior**: Test should validate transfer works from valid owner

**3. Invariant Tests** (`test/foundry/invariant/DiamondProxyInvariant.t.sol`, `test/foundry/fuzz/DiamondInvariants.t.sol`)

- **Issue**: "No contracts to fuzz" error
- **Fix**: Call `targetContract(address(diamond))` in `setUp()`
- **Pattern**:

```solidity
function setUp() public override {
    super.setUp();
    targetContract(address(diamond));
}
```

**4. Routing Tests** (`test/foundry/fuzz/DiamondRouting.t.sol`)

- **Issue**: "Selector has no facet" failures
- **Fix**: Verify helper loads correct facet addresses from deployment data
- **Validation**: Check `DiamondDeployment.sol` has all expected facet constants

**5. Integration Tests** (`test/foundry/integration/BasicDiamondIntegrationDeployed.t.sol`)

- **Issue**: Tests expect deployment but Diamond not deployed
- **Fix**: Ensure test runs with `--network localhost` and deployment exists
- **Alternative**: Make tests auto-deploy if needed

**6. Unit Tests** (`test/foundry/unit/ExampleUnit.t.sol`)

- **Issue**: Deployer address is zero
- **Fix**: Add deployer address to DiamondDeployment.sol generation
- **Required**: HelperGenerator must include `DEPLOYER_ADDRESS` constant

**7. POC Tests** (`test/foundry/poc/JSONParseTest.t.sol`)

- **Issue**: Test expects parsing empty array to fail but it succeeds
- **Fix**: Update test expectation OR wrap in try/catch to verify behavior
- **Decision needed**: Is this testing Forge behavior or our code?

### Deployment Helper Generation

**Current State**: `DiamondDeployment.sol` sometimes has empty addresses:

```solidity
address constant DIAMOND_ADDRESS = ;  // ❌ Invalid Solidity
```

**Required Fix**: HelperGenerator must validate deployment data before generating:

```typescript
private generateLibrarySource(deploymentData: DeployedDiamondData): string {
    if (!deploymentData.DiamondAddress || deploymentData.DiamondAddress === "") {
        throw new Error("Cannot generate helper: DiamondAddress is empty");
    }

    if (!deploymentData.DeployerAddress || deploymentData.DeployerAddress === "") {
        throw new Error("Cannot generate helper: DeployerAddress is empty");
    }

    // Generate valid Solidity...
}
```

### Network Auto-Start Logic

**Requirement**: Task should detect if localhost:8545 is available and start node if not

**Implementation Check**:

```typescript
// In ForgeFuzzingFramework.runTests()
if (networkName === "localhost") {
  const nodeRunning = await checkNodeRunning("http://127.0.0.1:8545");
  if (!nodeRunning) {
    Logger.info("Starting Hardhat node in background...");
    await startHardhatNode();
  }
}
```

**Note**: User says this should already be implemented. Verify it works correctly.

### Ephemeral vs Persistent Deployments

**Default Behavior** (ephemeral):

- `writeDeployedDiamondData: false`
- Diamond deployed to in-memory network
- Helper generated from in-memory deployment cache
- No files written to `diamonds/ExampleDiamond/deployments/`

**Persistent Behavior** (with `--save-deployment` flag):

- `writeDeployedDiamondData: true`
- Deployment record saved to file
- Subsequent runs can reuse existing deployment
- Useful for development iteration

## Success Metrics

**Primary Metrics**:

1. **Test Pass Rate**: 130/130 tests passing (100%)
2. **Workflow Success**: `npx hardhat diamonds-forge:test` runs successfully on clean workspace
3. **External Validation**: Module installs and works in separate project (integration test)
4. **Documentation Complete**: README has working examples for all major use cases

**Secondary Metrics**:

1. Test execution time < 5 minutes for full suite
2. Zero manual setup steps required beyond `npm install`
3. Clear error messages for all common failure scenarios
4. All examples in README can be copy-pasted and run successfully

## Test Fix Priority

### Critical Path (Must fix for release)

1. **Access Control Setup** - Fix all 9 failing tests in `AccessControlFuzz.t.sol`
2. **DiamondFuzzBase Role Initialization** - Fix `DiamondAccessControl.t.sol` setUp
3. **Invariant Test Configuration** - Fix 11 failing invariant tests
4. **Helper Generation Validation** - Ensure no empty addresses in generated helpers
5. **Ownership Test Permissions** - Fix `DiamondOwnership.t.sol` test

### High Priority (Should fix for quality)

6. **Routing Tests** - Fix "Selector has no facet" errors
7. **Integration Test Deployment** - Fix `BasicDiamondIntegrationDeployed.t.sol`
8. **Unit Test Deployer** - Add deployer address to helpers

### Low Priority (Can defer)

9. **POC Test Expectations** - Fix or document `JSONParseTest.t.sol`

## Implementation Plan

### Phase 1: Fix Test Base Classes (1-2 days)

1. Update `DiamondFuzzBase.sol` to grant DEFAULT_ADMIN_ROLE in setUp
2. Add role granting helpers to base class
3. Ensure all tests can call `_grantRoleToSelf(role)` helper

### Phase 2: Fix Individual Test Suites (2-3 days)

1. Fix AccessControlFuzz.t.sol (9 tests)
2. Fix DiamondAccessControl.t.sol (1 test)
3. Fix DiamondInvariants.t.sol (11 tests)
4. Fix DiamondOwnership.t.sol (1 test)
5. Fix DiamondRouting.t.sol (1 test)
6. Fix integration tests (2 tests)
7. Fix unit tests (1 test)
8. Fix POC tests (1 test)

### Phase 3: Validate Workflow (1 day)

1. Clean workspace completely
2. Run `npx hardhat diamonds-forge:init`
3. Run `npx hardhat diamonds-forge:test`
4. Verify 130/130 tests pass
5. Test in separate project directory

### Phase 4: Documentation and Release Prep (1 day)

1. Update README with confirmed working examples
2. Update CHANGELOG
3. Verify package.json metadata
4. Create release notes
5. Tag version for release

**Total Estimated Time**: 5-7 days for complete production readiness

## Open Questions

1. **Q**: Should invariant tests use targetContract() or targetSender()?
   **A**: Research best practice for Diamond proxy invariant testing

2. **Q**: What should happen if user runs tests without deploying first?
   **A**: Auto-deploy in ephemeral mode (current behavior seems correct)

3. **Q**: Should we keep POC tests or move them elsewhere?
   **A**: Decide if they're module tests or just exploration artifacts

4. **Q**: Do we need different test fixtures for different scenarios?
   **A**: Current setup with single Diamond deployment should be sufficient

5. **Q**: Should failing tests be skipped or fixed?
   **A**: All tests must be fixed to pass - no skipping for production release

## Acceptance Criteria

### Module Release Checklist

- [ ] All 130 tests in `test/foundry/` pass without failures
- [ ] `npx hardhat diamonds-forge:init` creates working test structure
- [ ] `npx hardhat diamonds-forge:test` runs full workflow successfully
- [ ] Network auto-start works when localhost node not running
- [ ] Ephemeral deployments work by default (no files created)
- [ ] `--save-deployment` flag creates persistent deployment records
- [ ] Generated `DiamondDeployment.sol` has valid addresses
- [ ] All access control tests properly grant roles in setUp()
- [ ] All invariant tests properly configure target contracts
- [ ] README examples are tested and work correctly
- [ ] CHANGELOG is updated with all changes
- [ ] Package version is bumped for release
- [ ] Module installs successfully in external project
- [ ] Full test suite runs in CI/CD environment

### Per-Test Category Acceptance

**Access Control Tests**:

- [ ] All 9 tests in AccessControlFuzz.t.sol pass
- [ ] DiamondAccessControl.t.sol setUp() test passes
- [ ] Tests can grant/revoke roles after self-granting admin role

**Ownership Tests**:

- [ ] testFuzz_TransferOwnershipZeroAddress passes with correct expectation
- [ ] All ownership transfer tests use vm.prank(owner) correctly

**Invariant Tests**:

- [ ] All 11 tests in DiamondInvariants.t.sol pass
- [ ] All 11 tests in DiamondProxyInvariant.t.sol pass
- [ ] targetContract() is called in setUp() for all invariant tests

**Routing Tests**:

- [ ] DiamondRouting.t.sol setUp() passes
- [ ] All selector routing tests find correct facets
- [ ] Helper has all expected facet address constants

**Integration Tests**:

- [ ] BasicDiamondIntegrationDeployed tests pass with deployment
- [ ] Tests work both with and without pre-existing deployment

**Unit Tests**:

- [ ] ExampleUnit.t.sol test_DeployerSet() passes
- [ ] Deployer address is available in DiamondDeployment helper

**POC Tests**:

- [ ] JSONParseTest.t.sol has correct expectations or is removed/archived

---

**Document Status**: Draft - Ready for Review and Task List Generation
**Created**: 2025-12-18
**Target Completion**: 2025-12-25 (1 week)
**Priority**: P0 - Critical for Production Release
