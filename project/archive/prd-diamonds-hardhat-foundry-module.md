# Product Requirements Document: Diamonds-Hardhat-Foundry Module

## Introduction/Overview

This PRD outlines the development of `@diamondslab/diamonds-hardhat-foundry`, a comprehensive Hardhat plugin that integrates Foundry Forge testing capabilities with the Diamonds module ecosystem. The module extends the existing `@nomicfoundation/hardhat-foundry` plugin with Diamond-specific functionality, providing both programmatic APIs and Hardhat tasks for managing Diamond contract deployments, test harness generation, and fuzzing workflows.

**Problem Statement:** While the prototype Foundry integration in `diamonds-dev-env` successfully demonstrated fuzzing capabilities for Diamond contracts, it exists as project-specific scripts and utilities rather than a distributable package. External teams building Diamond-based projects need a reusable, well-tested module that seamlessly integrates Foundry testing with the existing Diamonds deployment infrastructure.

**Solution:** Create a production-ready npm module that packages the prototype's functionality into a modular, extensible Hardhat plugin. The module will provide both low-level programmatic APIs for advanced users and high-level Hardhat tasks for common workflows, making it accessible to developers of all skill levels.

## Goals

1. **Create distributable npm package** based on the forked `hardhat-foundry` module with Diamond-specific enhancements
2. **Provide modular, extensible architecture** that allows users to compose utilities as needed
3. **Expose both programmatic API and Hardhat tasks** for maximum flexibility
4. **Generate project-specific Solidity helpers** while providing base helpers in node_modules
5. **Integrate seamlessly with existing Diamonds ecosystem** (`@diamondslab/diamonds`, `@diamondslab/hardhat-diamonds`)
6. **Support fuzzing workflows** developed in the prototype with improved modularity
7. **Maintain production-quality code** with comprehensive tests and documentation
8. **Enable gradual adoption** by supporting incremental integration into existing projects

## User Stories

### As a Diamond Contract Developer (External Project)

- I want to install `@diamondslab/diamonds-hardhat-foundry` as a plugin, so I can add Foundry testing to my Diamond project without custom setup
- I want to run `npx hardhat diamonds-forge:init` to generate necessary helper files and configurations
- I want to deploy my Diamond using existing LocalDiamondDeployer and have deployment data available to my Forge tests
- I want to write Forge fuzz tests that interact with my deployed Diamond using generated Solidity helpers
- I want to run `npx hardhat diamonds-forge:test` to execute my Forge test suite with proper Diamond deployment

### As an Advanced Developer

- I want to import and use the `ForgeFuzzingFramework` class programmatically for custom deployment workflows
- I want to extend the base `DiamondForgeHelpers` contract with my own test utilities
- I want to configure deployment behavior via `hardhat.config.ts` for different network scenarios
- I want to generate custom Solidity helpers based on specific deployment configurations

### As a Diamonds Lab Internal Developer

- I want the module to work seamlessly with our existing dev container and Foundry setup
- I want comprehensive examples in the `diamonds-dev-env` project demonstrating all module capabilities
- I want the prototype's existing tests to pass with minimal modifications
- I want clear separation between module code and example/test code

### As a Junior Developer

- I want clear documentation explaining how to set up Foundry testing for my Diamond project
- I want sensible defaults that work out-of-the-box with minimal configuration
- I want helpful error messages when something is misconfigured
- I want examples showing common testing patterns for Diamond contracts

## Functional Requirements

### Core Module Structure

1. **FR-1.1**: Module MUST extend `@nomicfoundation/hardhat-foundry` functionality
2. **FR-1.2**: Module MUST export TypeScript classes and functions as programmatic API
3. **FR-1.3**: Module MUST register Diamond-specific Hardhat tasks in the HRE
4. **FR-1.4**: Module MUST be installable via npm/yarn/pnpm with peer dependencies on `@diamondslab/diamonds` and `@diamondslab/hardhat-diamonds`
5. **FR-1.5**: Module MUST provide TypeScript type definitions for all exports

### Configuration System

6. **FR-2.1**: Module MUST read configuration from `hardhat.config.ts` under a `diamondsFoundry` key
7. **FR-2.2**: Configuration MUST support specifying output directories for generated helpers
8. **FR-2.3**: Configuration MUST support specifying Diamond deployment networks (hardhat, localhost, anvil)
9. **FR-2.4**: Configuration MUST provide sensible defaults requiring minimal user input
10. **FR-2.5**: Configuration MUST validate required peer dependencies are installed

### Programmatic API

11. **FR-3.1**: Module MUST export `ForgeFuzzingFramework` class for deployment orchestration
12. **FR-3.2**: `ForgeFuzzingFramework` MUST support deploying Diamond via `LocalDiamondDeployer`
13. **FR-3.3**: `ForgeFuzzingFramework` MUST support reading existing deployment records
14. **FR-3.4**: `ForgeFuzzingFramework` MUST generate Solidity helper libraries from deployment data
15. **FR-3.5**: Module MUST export `HelperGenerator` utility for creating custom Solidity helpers
16. **FR-3.6**: Module MUST export `DeploymentManager` for managing deployment lifecycle
17. **FR-3.7**: All API classes MUST support both promise and async/await patterns

### Hardhat Tasks

18. **FR-4.1**: Module MUST provide `diamonds-forge:init` task to scaffold test structure
19. **FR-4.2**: `diamonds-forge:init` MUST generate base helper contracts in project's test directory
20. **FR-4.3**: `diamonds-forge:init` MUST create example test files demonstrating usage patterns
21. **FR-4.4**: Module MUST provide `diamonds-forge:deploy` task for deploying Diamond for tests
22. **FR-4.5**: `diamonds-forge:deploy` MUST accept network parameter (hardhat, localhost, anvil)
23. **FR-4.6**: Module MUST provide `diamonds-forge:generate-helpers` task for regenerating helpers
24. **FR-4.7**: `diamonds-forge:generate-helpers` MUST update DiamondDeployment.sol with current deployment data
25. **FR-4.8**: Module MUST provide `diamonds-forge:test` task that deploys and runs Forge tests
26. **FR-4.9**: `diamonds-forge:test` MUST pass additional arguments to underlying `forge test` command
27. **FR-4.10**: All tasks MUST provide verbose logging with colored output for user feedback

### Solidity Helpers

28. **FR-5.1**: Module MUST include base `DiamondForgeHelpers.sol` contract in published package
29. **FR-5.2**: `DiamondForgeHelpers.sol` MUST provide utility functions for common test operations
30. **FR-5.3**: Module MUST generate `DiamondDeployment.sol` in user project with deployment-specific data
31. **FR-5.4**: `DiamondDeployment.sol` MUST include Diamond proxy address as constant
32. **FR-5.5**: `DiamondDeployment.sol` MUST include all facet addresses as constants
33. **FR-5.6**: `DiamondDeployment.sol` MUST include network configuration details
34. **FR-5.7**: Generated helpers MUST be importable in Forge test contracts
35. **FR-5.8**: Module MUST provide base `DiamondFuzzBase.sol` test contract that users can extend

### Integration with Diamonds Ecosystem

36. **FR-6.1**: Module MUST utilize `LocalDiamondDeployer` from `@diamondslab/diamonds` for deployments
37. **FR-6.2**: Module MUST read Diamond configuration from `@diamondslab/hardhat-diamonds` HRE extensions
38. **FR-6.3**: Module MUST use standard Diamond deployment records (no custom artifacts like `.forge-diamond-address`)
39. **FR-6.4**: Module MUST support reading Diamond ABI from standard `diamond-abi/` directory
40. **FR-6.5**: Module MUST respect Diamond facet configuration from deployment records

### Testing Support

41. **FR-7.1**: Module MUST support deploying Diamond to local Hardhat network for testing
42. **FR-7.2**: Module MUST support deploying Diamond to Anvil for testing
43. **FR-7.3**: Module MUST support running fuzz tests against deployed Diamond
44. **FR-7.4**: Module MUST support running invariant tests against deployed Diamond
45. **FR-7.5**: Module MUST support running integration tests that combine multiple facets
46. **FR-7.6**: Generated test base contracts MUST provide setup methods for common scenarios

### Error Handling and Validation

47. **FR-8.1**: Module MUST validate Foundry is installed before running tasks
48. **FR-8.2**: Module MUST provide clear error messages when peer dependencies are missing
49. **FR-8.3**: Module MUST validate Diamond deployment exists before generating helpers
50. **FR-8.4**: Module MUST check for conflicts in output directories before file generation
51. **FR-8.5**: Module MUST validate Hardhat configuration has required Diamond settings

### Documentation and Examples

52. **FR-9.1**: Module MUST include comprehensive README.md with installation and usage instructions
53. **FR-9.2**: Module MUST provide API documentation for all exported classes and functions
54. **FR-9.3**: Module MUST include inline code comments for complex logic
55. **FR-9.4**: Package MUST include TypeDoc-generated API reference documentation
56. **FR-9.5**: README MUST include quick start guide for new users

## Non-Goals (Out of Scope)

1. **Migration tooling from prototype**: The prototype was experimental; no automated migration path will be provided
2. **Medusa fuzzing integration**: This module focuses on Forge; Medusa remains separate
3. **Custom Diamond deployment logic**: Module uses existing `LocalDiamondDeployer`; no custom deployment implementations
4. **Forge installation**: Users must have Foundry installed (DevContainer includes it, but module doesn't install it)
5. **Diamond ABI generation**: Module consumes existing ABIs; doesn't generate them (handled by `hardhat-diamonds`)
6. **Multi-chain deployment management**: Module focuses on local testing; production deployments out of scope
7. **GUI or web interface**: Command-line and programmatic API only
8. **Echidna integration**: Separate fuzzing tool; not included in this module
9. **Slither integration**: Static analysis remains separate
10. **Backwards compatibility with prototype**: Tests should pass with modifications, but API changes expected

## Design Considerations

### Architecture Overview

```
@diamondslab/diamonds-hardhat-foundry
├── src/
│   ├── index.ts                          # Main entry point, plugin registration
│   ├── tasks/                            # Hardhat task definitions
│   │   ├── init.ts                       # diamonds-forge:init task
│   │   ├── deploy.ts                     # diamonds-forge:deploy task
│   │   ├── generate-helpers.ts           # diamonds-forge:generate-helpers task
│   │   └── test.ts                       # diamonds-forge:test task
│   ├── framework/                        # Core framework classes
│   │   ├── ForgeFuzzingFramework.ts     # Main orchestration class
│   │   ├── DeploymentManager.ts         # Deployment lifecycle management
│   │   └── HelperGenerator.ts           # Solidity helper generation
│   ├── templates/                        # Solidity template files
│   │   ├── DiamondForgeHelpers.sol.template
│   │   ├── DiamondDeployment.sol.template
│   │   └── DiamondFuzzBase.sol.template
│   ├── utils/                           # Utility functions
│   │   ├── validation.ts                # Configuration and dependency validation
│   │   ├── foundry.ts                   # Foundry command execution
│   │   └── logger.ts                    # Colored logging utilities
│   └── types/                           # TypeScript type definitions
│       └── config.ts                    # Configuration interfaces
├── contracts/                           # Base Solidity helpers (distributed with package)
│   ├── DiamondForgeHelpers.sol         # Base helper contract
│   └── DiamondFuzzBase.sol             # Base test contract
├── test/                                # Module unit tests
│   └── framework/
│       ├── ForgeFuzzingFramework.test.ts
│       └── HelperGenerator.test.ts
└── README.md                            # Comprehensive documentation
```

### User Project Structure (After Init)

```
my-diamond-project/
├── contracts/
│   └── ... (user's Diamond contracts)
├── test/
│   └── foundry/
│       ├── helpers/
│       │   └── DiamondDeployment.sol    # Generated from deployment
│       ├── unit/
│       │   └── MyFacet.t.sol           # Example unit test
│       ├── integration/
│       │   └── DiamondIntegration.t.sol # Example integration test
│       └── fuzz/
│           └── DiamondFuzz.t.sol       # Example fuzz test
├── hardhat.config.ts
└── foundry.toml
```

### Configuration Schema

```typescript
// In hardhat.config.ts
export default {
  diamondsFoundry: {
    // Output directory for generated helpers (relative to project root)
    helpersDir: "test/foundry/helpers",

    // Whether to generate example tests on init
    generateExamples: true,

    // Example test templates to generate
    exampleTests: ["unit", "integration", "fuzz"],

    // Default network for deployments
    defaultNetwork: "hardhat",

    // Whether to reuse existing deployment or deploy fresh
    reuseDeployment: true,

    // Additional forge test arguments
    forgeTestArgs: ["--gas-report"],
  },
};
```

### Class Interaction Diagram

```
Hardhat Tasks
    │
    ├─── diamonds-forge:init ──────► HelperGenerator.scaffoldProject()
    │                                        │
    │                                        └─► Generate templates
    │
    ├─── diamonds-forge:deploy ────► DeploymentManager.deploy()
    │                                        │
    │                                        ├─► LocalDiamondDeployer.deploy()
    │                                        └─► Save deployment record
    │
    ├─── diamonds-forge:generate-helpers ──► HelperGenerator.generateDeploymentHelpers()
    │                                                │
    │                                                └─► Read deployment record
    │                                                    Generate DiamondDeployment.sol
    │
    └─── diamonds-forge:test ──────► ForgeFuzzingFramework.runTests()
                                            │
                                            ├─► DeploymentManager.ensureDeployment()
                                            ├─► HelperGenerator.generateDeploymentHelpers()
                                            └─► Execute forge test
```

### Module Distribution

- **Published to npm**: `@diamondslab/diamonds-hardhat-foundry`
- **Includes**:
  - Compiled TypeScript (dist/)
  - Base Solidity helpers (contracts/)
  - TypeScript type definitions
  - README and documentation
- **Excludes**:
  - Test files
  - Example projects
  - Development configuration

## Technical Considerations

### Dependencies

- **Peer Dependencies** (users must install):
  - `hardhat` ^2.26.0
  - `@diamondslab/diamonds` (workspace or published version)
  - `@diamondslab/hardhat-diamonds` (workspace or published version)
- **Runtime Dependencies**:
  - `picocolors` for colored console output
  - Inherited from `@nomicfoundation/hardhat-foundry`

- **Dev Dependencies**:
  - TypeScript tooling
  - Testing frameworks (Mocha, Chai)
  - Linting and formatting tools

### Foundry Integration

- Module assumes Foundry is installed and available in PATH
- DevContainer automatically includes Foundry installation
- Validation check on task execution provides helpful error if missing
- Uses `forge` CLI directly via child process execution
- Supports standard Forge arguments pass-through

### File Generation Strategy

1. **Base Helpers (Distributed)**:
   - `DiamondForgeHelpers.sol` - Common utilities
   - `DiamondFuzzBase.sol` - Base test contract
   - Located in module's `contracts/` directory
   - Users import from `@diamondslab/diamonds-hardhat-foundry/contracts`

2. **Generated Helpers (Project-Specific)**:
   - `DiamondDeployment.sol` - Deployment constants
   - Generated in user's `test/foundry/helpers/` (configurable)
   - Regenerated when deployment changes
   - Git-ignored by default (generated artifact)

3. **Example Tests (Optional)**:
   - Generated once during `diamonds-forge:init`
   - Users modify as starting point
   - Committed to version control

### Deployment Workflow

1. User runs `diamonds-forge:deploy` or `diamonds-forge:test`
2. Module checks for existing deployment record
3. If `reuseDeployment: true` and record exists, skip deployment
4. If deployment needed, use `LocalDiamondDeployer` with existing config
5. Save deployment record in standard Diamonds format
6. Generate `DiamondDeployment.sol` with deployment data
7. Proceed with test execution if applicable

### Testing Strategy

**Module Tests** (in `packages/diamonds-hardhat-foundry/test/`):

- Unit tests for each framework class
- Mock Hardhat runtime environment
- Mock file system operations
- Test helper generation logic
- Validate configuration parsing
- Minimal test suite focused on module code

**Integration Tests** (in `diamonds-dev-env/test/`):

- Full end-to-end workflow testing
- Actual Diamond deployment
- Real Forge test execution
- Validate generated helpers compile
- Test all Hardhat tasks
- Comprehensive test suite using module

### Error Scenarios

| Scenario                  | Detection                | User Message                                                                |
| ------------------------- | ------------------------ | --------------------------------------------------------------------------- |
| Foundry not installed     | Check `forge --version`  | "Foundry not found. Install from https://getfoundry.sh/"                    |
| Peer dependencies missing | Import validation        | "@diamondslab/diamonds is required. Run: npm install @diamondslab/diamonds" |
| No deployment found       | Check deployment records | "No Diamond deployment found. Run: npx hardhat diamonds-forge:deploy"       |
| Output directory conflict | File system check        | "Output directory already exists. Use --force to overwrite."                |
| Invalid configuration     | Schema validation        | "Invalid diamondsFoundry config: helpersDir must be a string"               |

## Success Metrics

1. **Installation Success**: Users can install module and run `diamonds-forge:init` without errors
2. **Deployment Success**: `diamonds-forge:deploy` creates valid deployment records 100% of the time
3. **Test Execution**: Generated helpers compile and tests execute without modification
4. **Documentation Completeness**: README includes working examples for all major features
5. **API Stability**: Programmatic API provides same functionality as tasks
6. **Developer Adoption**: Module used in at least 2 external Diamond projects within 3 months
7. **Test Coverage**: Module code maintains >80% test coverage
8. **Performance**: Helper generation completes in <5 seconds for typical deployments
9. **Error Handling**: All error scenarios provide actionable error messages
10. **Compatibility**: Works with all supported Hardhat versions (^2.26.0+)

## Open Questions

1. **Helper Import Paths**: Should generated helpers import base helpers using absolute paths (`@diamondslab/diamonds-hardhat-foundry/contracts/...`) or relative paths?
   - **Recommendation**: Absolute for clarity and refactoring safety

2. **Forge Configuration**: Should the module manage `foundry.toml` or expect users to configure it?
   - **Recommendation**: Expect users to configure; provide recommended settings in docs

3. **Network Management**: Should the module start/stop Hardhat node or Anvil automatically?
   - **Recommendation**: No - users control network lifecycle; module validates network is running

4. **TypeChain Integration**: Should generated helpers include TypeChain types for TypeScript tests?
   - **Recommendation**: Out of scope for v1; users can generate separately

5. **Versioning Strategy**: How to handle breaking changes between Diamond/Hardhat-Diamonds versions?
   - **Recommendation**: Use peer dependency ranges; document compatibility matrix

6. **Multi-Diamond Support**: Should framework support deploying multiple Diamonds in one project?
   - **Recommendation**: Single Diamond for v1; add multi-support in v2 if needed

7. **Continuous Testing**: Should module support watch mode for continuous test execution?
   - **Recommendation**: Yes - add `--watch` flag that calls `forge test --watch`

8. **Deployment Caching**: How long should deployment records be cached before regeneration?
   - **Recommendation**: Until user explicitly redeploys or deletes record

9. **Custom Facet Templates**: Should module support generating test templates for specific facet patterns?
   - **Recommendation**: Out of scope for v1; generic templates sufficient

10. **CI/CD Integration**: Should module include GitHub Actions or CI templates?
    - **Recommendation**: Include example workflow in README; no templates in package

## Implementation Phases

### Phase 1: Core Module Setup (Week 1-2)

- Set up package structure in `packages/diamonds-hardhat-foundry`
- Configure build, lint, and test scripts
- Implement basic Hardhat plugin registration
- Create configuration schema and validation
- Implement logger utility with colored output

### Phase 2: Programmatic API (Week 3-4)

- Implement `DeploymentManager` class
- Implement `ForgeFuzzingFramework` class
- Implement `HelperGenerator` class
- Create Solidity template files
- Write unit tests for framework classes

### Phase 3: Hardhat Tasks (Week 5-6)

- Implement `diamonds-forge:init` task
- Implement `diamonds-forge:deploy` task
- Implement `diamonds-forge:generate-helpers` task
- Implement `diamonds-forge:test` task
- Add task parameter validation

### Phase 4: Base Contracts & Templates (Week 6-7)

- Create `DiamondForgeHelpers.sol` base contract
- Create `DiamondFuzzBase.sol` base test contract
- Create example test templates (unit, integration, fuzz)
- Ensure all templates compile with forge

### Phase 5: Integration Testing (Week 7-8)

- Create comprehensive integration tests in `diamonds-dev-env`
- Test all workflows end-to-end
- Validate prototype tests still pass with modifications
- Test with different network configurations

### Phase 6: Documentation & Polish (Week 8-9)

- Write comprehensive README
- Generate API documentation with TypeDoc
- Create usage examples
- Add inline code documentation
- Create troubleshooting guide

### Phase 7: Release Preparation (Week 9-10)

- Final testing and bug fixes
- Performance optimization
- Prepare for npm publication
- Create release notes
- Version 1.0.0 release

## Acceptance Criteria

The module is considered complete when:

1. ✅ Package is installable via npm with all peer dependencies
2. ✅ `diamonds-forge:init` generates working test structure
3. ✅ `diamonds-forge:deploy` deploys Diamond using LocalDiamondDeployer
4. ✅ `diamonds-forge:generate-helpers` creates valid Solidity helpers
5. ✅ `diamonds-forge:test` runs Forge tests successfully
6. ✅ Generated helpers compile without errors in Forge
7. ✅ Base contracts (`DiamondForgeHelpers`, `DiamondFuzzBase`) are importable
8. ✅ Programmatic API provides same functionality as tasks
9. ✅ Configuration via `hardhat.config.ts` works as documented
10. ✅ All module unit tests pass with >80% coverage
11. ✅ Integration tests in `diamonds-dev-env` pass
12. ✅ README includes installation, configuration, and usage examples
13. ✅ API documentation is generated and accurate
14. ✅ Error messages are clear and actionable
15. ✅ Module works with Hardhat node and Anvil
16. ✅ Existing prototype tests pass with documented modifications
17. ✅ Package builds successfully with TypeScript
18. ✅ Package passes all linting and formatting checks
19. ✅ Version 1.0.0 is published to npm
20. ✅ At least one external project successfully integrates the module

---

**Document Version**: 1.0  
**Created**: December 15, 2025  
**Target Delivery**: February 15, 2026 (2 months)  
**Status**: Draft - Ready for Implementation
