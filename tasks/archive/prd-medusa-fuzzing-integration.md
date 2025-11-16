# Product Requirements Document: Medusa Fuzzing Integration

## Introduction/Overview

This PRD outlines the integration of Medusa (Trail of Bits' advanced smart contract fuzzer) into the Diamonds Dev Env project. The goal is to create a functional fuzzing test harness that works seamlessly with the existing Diamond proxy deployment infrastructure, LocalDiamondDeployer, and the Hardhat-Diamonds module.

**Problem Statement:** The current testing suite includes unit and integration tests but lacks comprehensive fuzzing capabilities to discover edge cases, invariant violations, and unexpected behaviors in Diamond proxy contracts and their facets. Medusa provides advanced fuzzing with coverage-guided testing, but it needs to be integrated with our Diamond-specific deployment and configuration system.

**Solution:** Build a fuzzing framework that leverages the existing Diamonds module functionality to deploy Diamond contracts on local and forked networks, automatically generate Solidity test contracts for Medusa to fuzz, and provide Hardhat tasks for easy execution.

## Goals

1. **Install Medusa** in the DevContainer environment for seamless availability to all developers
2. **Create a TypeScript fuzzing framework** that integrates with LocalDiamondDeployer and Diamonds module
3. **Generate Solidity test contracts** automatically based on Diamond deployment configuration
4. **Implement basic fuzzing tests** for critical facet functions in ExampleDiamond
5. **Provide Hardhat tasks** to run fuzzing tests with simple commands
6. **Support both local and forked networks** for fuzzing scenarios
7. **Generate comprehensive artifacts** including test results, coverage reports, corpus data, and Solidity contracts
8. **Establish foundational invariants** to test Diamond proxy integrity

## User Stories

### As a Smart Contract Developer

- I want to run fuzzing tests on my Diamond contract so that I can discover edge cases and vulnerabilities
- I want Medusa to be pre-installed in my DevContainer so that I don't have to manually set it up
- I want to execute fuzzing tests using familiar Hardhat tasks so that it fits my existing workflow
- I want the fuzzing framework to use my existing Diamond deployment configuration so that I don't duplicate setup code

### As a QA/Security Engineer

- I want to generate fuzzing test contracts automatically so that I can quickly test new facets
- I want access to fuzzing corpus and coverage reports so that I can analyze test effectiveness
- I want to test on forked networks so that I can fuzz against production-like state
- I want basic invariants tested automatically so that fundamental properties are always verified

### As a DevOps Engineer

- I want fuzzing to be available via Hardhat tasks so that I can integrate it into CI/CD pipelines in the future
- I want clear logs and artifacts so that I can debug test failures
- I want fuzzing setup to be reproducible across environments via DevContainer

## Functional Requirements

### FR1: DevContainer Medusa Installation

1.1. Medusa binary must be downloaded and installed during DevContainer post-create phase  
1.2. Installation script must be added to `.devcontainer/scripts/post-create.sh`  
1.3. Installation must download the latest stable release from GitHub  
1.4. Installation must verify the binary is executable and available on PATH  
1.5. Installation must handle errors gracefully and log success/failure

### FR2: Fuzzing Framework Core

2.1. Create a TypeScript class `MedusaFuzzingFramework` in `scripts/setup/`  
2.2. Framework must accept configuration including Diamond name, network, and Medusa options  
2.3. Framework must use LocalDiamondDeployer to deploy Diamond contracts  
2.4. Framework must retrieve deployed Diamond data (address, facets, selectors)  
2.5. Framework must support configuration via `hardhat.config.ts` using hardhat-diamonds settings

### FR3: Solidity Test Contract Generation

3.1. Framework must generate Solidity test contracts based on Diamond facet configuration  
3.2. Generated contracts must be written to `test/fuzzing/generated/` directory  
3.3. Test contracts must include a constructor that verifies Diamond deployment  
3.4. Test contracts must include fuzzing functions for manually configured critical facet functions  
3.5. Test contracts must implement basic Diamond proxy integrity invariants  
3.6. Generated contracts must use Solidity 0.8.x compatible syntax

### FR4: Fuzzing Function Generation

4.1. Framework must allow manual specification of which facet functions to fuzz  
4.2. Each fuzzing function must accept randomized inputs (addresses, uint256, bytes)  
4.3. Fuzzing functions must call the Diamond contract via low-level `call`  
4.4. Fuzzing functions must handle both successful and reverting calls gracefully  
4.5. Fuzzing functions must track call outcomes for statistical analysis

### FR5: Invariant Testing

5.1. Test contracts must include invariant: Diamond contract code exists at expected address  
5.2. Test contracts must include invariant: Facet addresses remain valid  
5.3. Test contracts must include invariant: Test contract maintains its own integrity  
5.4. Invariants must be testable by Medusa's property testing engine

### FR6: Medusa Configuration

6.1. Framework must generate `medusa.json` configuration file  
6.2. Configuration must specify target test contracts, workers, test limits, and timeout  
6.3. Configuration must support local Hardhat network deployment  
6.4. Configuration must support forked network via RPC URL and block number  
6.5. Configuration must define corpus directory for saving interesting inputs  
6.6. Configuration must configure sender addresses and contract balances

### FR7: Hardhat Task Integration

7.1. Create Hardhat task `medusa:fuzz` to run fuzzing tests  
7.2. Task must accept parameters: `--diamond`, `--network`, `--workers`, `--limit`  
7.3. Task must deploy Diamond using LocalDiamondDeployer  
7.4. Task must generate test contracts and Medusa configuration  
7.5. Task must execute Medusa and stream output to console  
7.6. Task must save artifacts (results, coverage, corpus) to configurable directory

### FR8: Example Fuzzing Tests for ExampleDiamond

8.1. Create manual configuration file specifying which ExampleDiamond functions to fuzz  
8.2. Include at least 3 critical facet functions in initial fuzzing tests  
8.3. Generate and validate test contract for ExampleDiamond  
8.4. Execute fuzzing campaign with at least 10,000 test cases  
8.5. Verify invariants pass during fuzzing

### FR9: Artifact Generation and Storage

9.1. Save generated Solidity test contracts in `test/fuzzing/generated/`  
9.2. Save Medusa configuration in `medusa.json` (gitignored)  
9.3. Save corpus data in `medusa-corpus/` directory (gitignored)  
9.4. Save coverage reports in `reports/fuzzing/`  
9.5. Generate timestamped log files for each fuzzing run

### FR10: Network Support

10.1. Framework must support deploying to Hardhat local network  
10.2. Framework must support deploying to Hardhat forked networks (mainnet, Sepolia, etc.)  
10.3. Framework must obtain provider and chain configuration from hardhat-multichain  
10.4. Framework must pass correct RPC URL and block number to Medusa for fork mode

## Non-Goals (Out of Scope)

- **Automatic facet function discovery:** Initially, we will manually configure which functions to fuzz rather than automatically detecting all facet functions
- **CI/CD pipeline integration:** While the framework will be task-based, actual CI/CD integration is out of scope for this phase
- **Advanced invariant generation:** Complex state invariants beyond Diamond proxy integrity are not included in this phase
- **GUI or dashboard:** All interaction will be via CLI and Hardhat tasks
- **Multi-Diamond fuzzing:** This phase focuses on single Diamond fuzzing; batch fuzzing is out of scope
- **Custom Medusa extensions:** We will use Medusa out-of-the-box without custom reporters or analyzers
- **Performance optimization:** Initial implementation prioritizes functionality over fuzzing performance tuning

## Design Considerations

### DevContainer Integration

- Medusa installation will occur in `.devcontainer/scripts/post-create.sh`
- Binary will be downloaded from GitHub releases to `/usr/local/bin/`
- Version will be pinned to latest stable release (to be determined during implementation)
- Installation failure will log error but not block container creation

### Directory Structure

```
scripts/
  setup/
    MedusaFuzzingFramework.ts  # Main fuzzing framework class
test/
  fuzzing/
    generated/                  # Auto-generated Solidity test contracts
    ExampleDiamond.fuzz.config.json  # Manual fuzzing configuration
medusa-corpus/                  # Gitignored - fuzzing corpus
reports/
  fuzzing/                      # Coverage and results reports
```

### Configuration Format

Fuzzing configuration will be stored as JSON:

```json
{
  "diamondName": "ExampleDiamond",
  "targetFunctions": [
    {
      "facet": "ExampleConstantsFacet",
      "function": "exampleFunction",
      "selector": "0x12345678"
    }
  ],
  "medusaConfig": {
    "workers": 10,
    "testLimit": 50000,
    "timeout": 0
  }
}
```

### TypeScript Framework Architecture

- `MedusaFuzzingFramework` class will be the main entry point
- Will accept `MedusaFuzzConfig` interface for configuration
- Will use LocalDiamondDeployer internally for Diamond deployment
- Will expose methods: `generateTestContract()`, `runMedusa()`, `parseResults()`
- Will integrate with hardhat-diamonds for path and configuration management

## Technical Considerations

### Dependencies

- **Medusa:** Latest stable release from crytic/medusa GitHub repository
- **LocalDiamondDeployer:** Existing class for Diamond deployment
- **Hardhat-Diamonds:** For Diamond configuration and paths
- **Hardhat-Multichain:** For multi-network provider management
- **@diamondslab/diamonds:** Core Diamond module with deployment strategies

### Constraints

- Medusa requires compiled Solidity contracts (will use Hardhat compilation)
- Fuzzing on forked networks requires valid RPC endpoint and may be rate-limited
- Generated test contracts must be compatible with Medusa's expected patterns
- Framework must handle both deployment modes: fresh deploy and using existing deployment data

### Integration Points

- Hardhat tasks system for CLI commands
- Hardhat compilation pipeline for Solidity test contracts
- LocalDiamondDeployer for consistent Diamond deployment
- Diamond deployment configuration files in `diamonds/ExampleDiamond/`
- Hardhat Runtime Environment (HRE) for network and signer access

### Error Handling

- Gracefully handle Medusa binary not found
- Handle Diamond deployment failures
- Handle Medusa execution errors with clear error messages
- Validate configuration before running fuzzing
- Log all errors to timestamped log files

## Success Metrics

### Implementation Success

- ✅ Medusa successfully installed in DevContainer
- ✅ MedusaFuzzingFramework class created and functional
- ✅ Solidity test contract generated for ExampleDiamond
- ✅ Hardhat task `medusa:fuzz` executes without errors
- ✅ At least 3 facet functions successfully fuzzed

### Fuzzing Effectiveness

- ✅ Minimum 10,000 test cases executed per fuzzing campaign
- ✅ All basic invariants pass during fuzzing
- ✅ Corpus contains diverse inputs
- ✅ Coverage report shows facet function coverage

### Integration Success

- ✅ Framework uses LocalDiamondDeployer without code duplication
- ✅ Framework reads configuration from hardhat-diamonds settings
- ✅ Fuzzing works on both local Hardhat network and forked Sepolia
- ✅ Artifacts (contracts, corpus, reports) generated correctly

### Developer Experience

- ✅ Developer can run fuzzing with single Hardhat task command
- ✅ Clear console output shows fuzzing progress
- ✅ Generated test contracts are readable and understandable
- ✅ Documentation explains how to configure and run fuzzing

## Open Questions

1. **Medusa Version:** Which specific version of Medusa should we pin for stability?
2. **Fuzzing Duration:** What should be the default test limit and timeout for a standard fuzzing run?
3. **Facet Selection:** Should we provide a helper script to list available facets and their selectors for easier configuration?
4. **Result Analysis:** Do we need additional tooling to analyze Medusa results, or is the default output sufficient?
5. **Upgrade Testing:** Should we include fuzzing of DiamondCut operations in the initial scope, or defer to later phase?
6. **Network Selection:** Should the framework default to local Hardhat, or should network be a required parameter?
7. **Corpus Management:** Should we provide tasks to clean/reset corpus between runs?

## Implementation Notes

### Phase 1: Foundation (Days 1-3)

- Install Medusa in DevContainer
- Create MedusaFuzzingFramework skeleton class
- Implement configuration interfaces
- Add basic Hardhat task structure

### Phase 2: Core Framework (Days 4-7)

- Implement Diamond deployment integration with LocalDiamondDeployer
- Build Solidity test contract generation logic
- Create Medusa configuration generation
- Implement Medusa execution wrapper

### Phase 3: ExampleDiamond Tests (Days 8-10)

- Create fuzzing configuration for ExampleDiamond
- Generate test contracts for selected facets
- Execute fuzzing campaigns
- Validate invariants and results

### Phase 4: Polish & Documentation (Days 11-14)

- Add error handling and validation
- Create artifact management
- Write user documentation
- Test on forked networks
- Final validation and cleanup

## Appendix: Reference Materials

- **Medusa GitHub:** https://github.com/crytic/medusa
- **Medusa Documentation:** https://github.com/crytic/medusa/wiki
- **ERC-2535 Diamond Standard:** https://eips.ethereum.org/EIPS/eip-2535
- **LocalDiamondDeployer:** `scripts/setup/LocalDiamondDeployer.ts`
- **Example Tests:** `test/deployment/DiamondDeployment.test.ts`
- **Hardhat-Diamonds:** `packages/hardhat-diamonds/`
