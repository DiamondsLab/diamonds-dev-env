# Product Requirements Document: Forge Diamond Fuzzing Integration

## Introduction/Overview

This PRD outlines the refactoring and improvement of the Forge fuzzing integration to properly leverage the existing Diamonds deployment infrastructure. The current implementation creates unnecessary custom files and deployment scripts instead of utilizing the robust Diamond deployment system already in place.

**Problem Statement:** The current Forge integration creates redundant deployment artifacts (`.forge-diamond-address`, custom deployment scripts like `scripts/test-deploy-diamond.ts` and `scripts/foundry/deploy-for-tests.sh`) and doesn't properly integrate with the existing Diamonds module capabilities including LocalDiamondDeployer, deployment records, and Diamond ABI generation. This creates maintenance overhead and doesn't provide a reusable fuzzing harness for other Diamond-based projects.

**Solution:** Build a reusable Forge fuzzing framework that mirrors the Medusa integration architecture, using LocalDiamondDeployer for deployments, reading from standard Diamond deployment records, and generating Solidity helper libraries from deployment data. This provides a reference implementation that can be adopted by any Diamond-based project.

## Goals

1. **Create a reusable ForgeFuzzingFramework** TypeScript class that integrates with LocalDiamondDeployer
2. **Eliminate custom deployment artifacts** by using standard Diamond deployment records
3. **Generate Solidity helper libraries** from deployment data for easy test access
4. **Deploy once and reuse** deployment records across multiple test runs
5. **Support both Hardhat node and Anvil** for flexible testing workflows
6. **Integrate with Hardhat tasks** for seamless developer experience
7. **Provide comprehensive fuzzing capabilities** for both unit and integration testing
8. **Establish a reference implementation** that can be copied to other Diamond projects
9. **Maintain Diamond proxy integrity** through invariant testing

## User Stories

### As a Smart Contract Developer

- I want to run Forge fuzz tests using the same deployment system as my Hardhat tests so that I have consistency across testing frameworks
- I want to deploy a Diamond once and run multiple Forge test suites without redeploying so that I can iterate quickly
- I want access to deployed Diamond addresses and facet selectors in my Solidity tests without manual configuration
- I want to choose between Hardhat node or Anvil based on my testing needs

### As a Project Maintainer

- I want a reusable fuzzing framework that can be copied to new Diamond projects so that I don't rebuild this infrastructure
- I want to eliminate custom deployment scripts and artifacts so that maintenance is simplified
- I want Forge tests to use the same deployment records as Hardhat tests so that there's a single source of truth

### As a QA/Security Engineer

- I want to fuzz individual facet functions to discover edge cases
- I want to test Diamond upgrade scenarios and facet management operations
- I want invariant tests that verify Diamond proxy integrity across all operations
- I want to read function selectors from deployment data so that tests automatically use the correct selectors

### As a DevOps Engineer

- I want Forge fuzzing integrated with Hardhat tasks so that it fits into existing CI/CD workflows
- I want clear separation between deployment and testing so that I can optimize pipeline stages
- I want deployment records to be the single source of truth for all test frameworks

## Functional Requirements

### FR1: ForgeFuzzingFramework Core Class

1.1. Create TypeScript class `ForgeFuzzingFramework` in `scripts/setup/ForgeFuzzingFramework.ts`  
1.2. Framework must accept configuration including Diamond name, network, and Forge-specific options  
1.3. Framework must use LocalDiamondDeployer to deploy Diamond contracts  
1.4. Framework must retrieve deployed Diamond data using `getDeployedDiamondData()`  
1.5. Framework must support configuration via `hardhat.config.ts` using hardhat-diamonds settings  
1.6. Framework must mirror the architecture and patterns from MedusaFuzzingFramework

### FR2: Diamond Deployment Integration

2.1. Framework must use LocalDiamondDeployer with `writeDeployedDiamondData: true`  
2.2. Deployment must write to standard Diamond deployment record path: `diamonds/[DiamondName]/deployments/[diamondname]-[network]-[chainId].json`  
2.3. Framework must NOT create custom deployment artifacts like `.forge-diamond-address`  
2.4. Framework must support deploying to Hardhat node (localhost) or Anvil  
2.5. Framework must handle network detection and configuration automatically  
2.6. Deployment must be idempotent - check if already deployed before redeploying

### FR3: Solidity Helper Library Generation

3.1. Framework must generate a Solidity library from deployment data  
3.2. Generated library must be written to `test/foundry/helpers/DiamondDeployment.sol`  
3.3. Library must include Diamond address as a constant  
3.4. Library must include all deployed facet addresses as constants  
3.5. Library must include function selectors for each facet function from deployment record  
3.6. Library must include helper functions to get facet addresses and selectors  
3.7. Library must use Solidity 0.8.19+ syntax  
3.8. Generated library must be importable by all Forge tests  
3.9. Library must include comments explaining data source and generation timestamp

### FR4: Deployment Data Access

4.1. Forge tests must read Diamond deployment data from standard deployment records  
4.2. Function selectors must be sourced from deployment record's facet data  
4.3. Tests must NOT hardcode addresses or selectors  
4.4. Helper library must provide type-safe access to deployment data  
4.5. Tests must fail gracefully if deployment data is missing or invalid

### FR5: Forge Configuration

5.1. Framework must generate or update `foundry.toml` if needed  
5.2. Configuration must specify test directory and helper library paths  
5.3. Configuration must support both Hardhat RPC and Anvil  
5.4. Configuration must configure remappings for helper libraries  
5.5. Configuration must match Solidity compiler version with Hardhat

### FR6: Hardhat Task Integration

6.1. Create Hardhat task `forge:deploy` to deploy Diamond for Forge testing  
6.2. Create Hardhat task `forge:fuzz` to run fuzzing tests  
6.3. Create Hardhat task `forge:generate-helpers` to generate Solidity helper library  
6.4. Tasks must accept parameters: `--diamond`, `--network`  
6.5. `forge:deploy` must use LocalDiamondDeployer to deploy Diamond  
6.6. `forge:deploy` must generate Solidity helper library after deployment  
6.7. `forge:fuzz` must verify deployment exists before running tests  
6.8. `forge:fuzz` must optionally deploy if deployment record not found  
6.9. Tasks must support both `--network localhost` and `--network anvil`  
6.10. Register tasks in `hardhat.config.ts` by importing `scripts/tasks/forge.ts`

### FR7: Fuzzing Test Capabilities

7.1. Support unit testing of individual facet functions with fuzzing  
7.2. Support integration testing of Diamond lifecycle operations  
7.3. Provide base test contracts that import helper libraries  
7.4. Include invariant tests for Diamond proxy integrity  
7.5. Support testing facet upgrades and diamond cuts  
7.6. Provide example tests for ExampleDiamond demonstrating all capabilities

### FR8: Cleanup and Deprecation

8.1. Remove `.forge-diamond-address` file and all references  
8.2. Remove `scripts/test-deploy-diamond.ts` custom deployment script  
8.3. Remove `scripts/foundry/deploy-for-tests.sh` shell script  
8.4. Update documentation to reflect new deployment workflow  
8.5. Update `.gitignore` to remove deprecated file patterns

### FR9: Example Implementation for ExampleDiamond

9.1. Create comprehensive Forge tests for ExampleDiamond using new framework  
9.2. Include unit tests for critical facet functions with fuzzing  
9.3. Include integration tests for ownership transfer and access control  
9.4. Include invariant tests for Diamond proxy integrity  
9.5. Include tests demonstrating facet selector lookups from deployment data  
9.6. Document all test patterns for reference by other projects

### FR10: Documentation and Reusability

10.1. Create comprehensive README for Forge fuzzing framework  
10.2. Document how to copy framework to new Diamond projects  
10.3. Document workflow for deploying and testing with both Hardhat node and Anvil  
10.4. Include troubleshooting guide for common issues  
10.5. Provide examples of all test patterns (unit, integration, invariant)  
10.6. Document integration with CI/CD pipelines

## Non-Goals (Out of Scope)

1. **No custom deployment artifacts** - Will not support `.forge-diamond-address` or similar files
2. **No standalone deployment scripts** - All deployment through LocalDiamondDeployer
3. **No manual selector configuration** - All selectors from deployment records
4. **No support for non-Diamond contracts** - Framework specific to ERC-2535 Diamond pattern
5. **No web UI or dashboard** - Command-line and task-based workflow only
6. **No automatic test generation** - Developers write their own fuzz tests
7. **No cross-chain deployment** - Focus on local testing networks only
8. **No integration with third-party fuzzing tools** - Pure Foundry Forge fuzzing

## Design Considerations

### Architecture Alignment

- ForgeFuzzingFramework must mirror MedusaFuzzingFramework architecture
- Use same patterns: configuration interfaces, deployment flow, helper generation
- Maintain consistency with existing Diamonds module patterns
- Follow TypeScript/Hardhat best practices established in the project

### Helper Library Design

The generated Solidity helper library should follow this structure:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DiamondDeployment
 * @notice Auto-generated deployment data for ExampleDiamond
 * @dev Generated from: diamonds/ExampleDiamond/deployments/examplediamond-localhost-31337.json
 * @dev Generated at: 2025-11-16T10:30:00.000Z
 * DO NOT EDIT MANUALLY - Regenerate using: npx hardhat forge:generate-helpers
 */
library DiamondDeployment {
    // Diamond address
    address constant DIAMOND_ADDRESS = 0x...;

    // Facet addresses
    address constant OWNERSHIP_FACET = 0x...;
    address constant UPGRADE_FACET = 0x...;
    // ... other facets

    // Function selectors for OwnershipFacet
    bytes4 constant OWNERSHIP_OWNER = 0x...;
    bytes4 constant OWNERSHIP_TRANSFER = 0x...;
    // ... other selectors

    // Helper functions
    function getDiamondAddress() internal pure returns (address) {
        return DIAMOND_ADDRESS;
    }

    function getFacetAddress(string memory facetName) internal pure returns (address) {
        // Implementation with if/else for each facet
    }

    function getSelector(string memory facetName, string memory functionName) internal pure returns (bytes4) {
        // Implementation with if/else for each selector
    }
}
```

### Network Support

- **Hardhat Node (localhost)**: Default for integration with Hardhat ecosystem
- **Anvil**: Alternative for pure Forge workflow, faster startup
- Network selection via `--network` parameter in tasks
- Automatic RPC URL configuration based on network choice

### Deployment Workflow

1. Developer runs `npx hardhat forge:deploy --diamond ExampleDiamond --network localhost`
2. Framework uses LocalDiamondDeployer to deploy with `writeDeployedDiamondData: true`
3. Deployment record written to standard path
4. Solidity helper library auto-generated from deployment record
5. Developer runs `forge test` to execute fuzz tests
6. Tests import helper library to access addresses and selectors

## Technical Considerations

### Deployment Record Structure

Deployment records include:

- Diamond address
- Facet addresses
- Function selectors per facet (registered selectors)
- Deployer address
- Timestamp
- Chain ID and network name
- Protocol version

This data is complete and authoritative - no additional files needed.

### Forge Test Patterns

**Unit Test Pattern:**

```solidity
import {DiamondDeployment} from "../helpers/DiamondDeployment.sol";

contract MyFacetFuzzTest is Test {
    function setUp() public {
        // Diamond already deployed
        vm.createSelectFork(vm.envString("HARDHAT_RPC_URL"));
    }

    function testFuzz_MyFunction(uint256 x) public {
        bytes4 selector = DiamondDeployment.getSelector("MyFacet", "myFunction");
        // Call diamond using selector
    }
}
```

**Integration Test Pattern:**

```solidity
contract DiamondIntegrationTest is Test {
    address diamond;

    function setUp() public {
        diamond = DiamondDeployment.getDiamondAddress();
        // Setup for integration tests
    }

    function test_FacetUpgrade() public {
        // Test diamond cut operations
    }
}
```

### Error Handling

- Framework must validate deployment records exist and are valid
- Tasks must provide clear error messages if deployment missing
- Tests must fail gracefully with helpful error messages
- Include retry logic for RPC connection issues

### Performance Considerations

- Deploy once, reuse deployment record across test runs
- Helper library generation should be fast (< 1 second)
- Avoid unnecessary redeployments
- Cache deployment data in framework instance

## Success Metrics

1. **Elimination of custom artifacts**: No `.forge-diamond-address` or custom deployment scripts
2. **Deployment reuse**: Tests can run multiple times without redeploying (unless explicitly requested)
3. **Test execution speed**: Forge tests complete in < 30 seconds for comprehensive suite
4. **Framework reusability**: Can be copied to new Diamond project with < 30 minutes of adaptation
5. **Developer experience**: Single command to deploy and test (`npx hardhat forge:fuzz`)
6. **Test coverage**: Comprehensive unit, integration, and invariant tests for ExampleDiamond
7. **Documentation quality**: New developers can understand and use framework from docs alone
8. **Code consistency**: ForgeFuzzingFramework mirrors MedusaFuzzingFramework architecture

## Open Questions

1. **Should helper library be committed to git or regenerated each time?**
   - **Recommendation**: Commit to git for easy test execution without deployment
2. **Should framework support multiple Diamond deployments simultaneously?**
   - **Recommendation**: Start with single Diamond, extend later if needed
3. **Should there be a forge.config.json per Diamond like medusa has?**
   - **Recommendation**: Yes, for consistency - store in `test/foundry/[DiamondName].forge.config.json`
4. **Should framework auto-detect if deployment is stale and redeploy?**
   - **Recommendation**: No, explicit redeployment only via flag like `--force-deploy`
5. **How should framework handle Diamond upgrades during development?**
   - **Recommendation**: Developer manually redeploys with `forge:deploy`, helper lib regenerates
6. **Should invariant tests be auto-generated or manually written?**
   - **Recommendation**: Provide base contract with common invariants, developers extend
7. **Should framework support testing against forked networks?**
   - **Recommendation**: Yes, via `--fork-url` parameter to tasks, Forge handles fork details

## Dependencies

### Required Packages

- Existing: `@diamondslab/diamonds`, `@diamondslab/hardhat-diamonds`, `hardhat`, `foundry`
- No new package dependencies required

### Internal Dependencies

- `LocalDiamondDeployer` - for Diamond deployment
- `Diamond` class - for deployment data access
- `DeploymentRepository` - for reading deployment records
- Existing Hardhat configuration and tasks system

### External Dependencies

- Hardhat node or Anvil for local testing
- Forge/Foundry for test execution

## Migration Path

### Phase 1: Framework Creation

1. Create `ForgeFuzzingFramework.ts` class
2. Create helper library generation utilities in `scripts/utils/forgeHelpers.ts`
3. Create Hardhat tasks in `tasks/forge.ts`
4. Generate initial helper library for ExampleDiamond

### Phase 2: Test Migration

1. Rewrite existing Forge tests to use helper library
2. Add new fuzz tests demonstrating all capabilities
3. Add invariant tests for Diamond integrity

### Phase 3: Cleanup

1. Remove deprecated files (`.forge-diamond-address`, `test-deploy-diamond.ts`, `deploy-for-tests.sh`)
2. Update documentation
3. Update `.gitignore`

### Phase 4: Validation

1. Verify all tests pass with new framework
2. Test framework reusability by creating example in separate directory
3. Document any lessons learned

## Timeline Estimate

- **Framework Development**: 2-3 days
- **Test Migration**: 1-2 days
- **Documentation**: 1 day
- **Validation & Refinement**: 1 day

**Total**: 5-7 days for complete implementation

## Related Documents

- Original Medusa PRD: `tasks/prd-medusa-fuzzing-integration.md`
- Medusa Task List: `tasks/tasks-medusa-fuzzing-integration.md`
- Foundry Guide: `docs/FOUNDRY_GUIDE.md`
- Project Overview: `docs/PROJECT_OVERVIEW.md`
- LocalDiamondDeployer: `scripts/setup/LocalDiamondDeployer.ts`
- MedusaFuzzingFramework: `scripts/setup/MedusaFuzzingFramework.ts`

---

**Document Version:** 2.0  
**Created:** November 16, 2025  
**Updated:** November 16, 2025  
**Status:** Ready for Implementation  
**Priority:** High - Refactoring existing functionality
