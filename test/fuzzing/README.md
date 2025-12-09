# Medusa Fuzzing for Diamond Contracts

This directory contains fuzzing tests for Diamond contracts using [Medusa](https://github.com/crytic/medusa) by Trail of Bits.

## Overview

Medusa is a powerful smart contract fuzzer that generates random inputs to discover bugs, vulnerabilities, and edge cases in smart contracts. The fuzzing framework integrates with the Diamond standard deployment system to automatically:

1. Deploy Diamond contracts
2. Generate Solidity test contracts with fuzzing functions
3. Create Medusa configuration files
4. Execute fuzzing campaigns
5. Analyze results and verify invariants

## Directory Structure

```
test/fuzzing/
├── README.md                          # This file
├── ExampleDiamond.fuzz.config.json   # Configuration for ExampleDiamond fuzzing
├── generated/                         # Auto-generated test contracts (gitignored)
│   └── ExampleDiamondTest.sol
└── [YourDiamond].fuzz.config.json    # Your Diamond fuzzing configs
```

## Quick Start

### 1. Create a Fuzzing Configuration

Create a JSON configuration file for your Diamond contract:

```json
{
  "diamondName": "YourDiamond",
  "targetFunctions": [
    {
      "facet": "YourFacet",
      "function": "yourFunction",
      "description": "Description of what to test"
    }
  ],
  "medusaOptions": {
    "workers": 4,
    "testLimit": 10000,
    "timeout": 60,
    "corpusDirectory": "./medusa-corpus"
  }
}
```

### 2. Run Fuzzing Campaign

```bash
npx hardhat medusa:fuzz --diamond YourDiamond
```

### 3. Monitor Results

Medusa will:

- Deploy your Diamond contract
- Generate a Solidity test contract
- Run fuzzing tests with random inputs
- Report any invariant violations or failures

## Configuration File Format

### Required Fields

- **diamondName**: Name of your Diamond contract (must match the directory name in `diamonds/`)
- **targetFunctions**: Array of functions to fuzz test

### Target Function Format

```json
{
  "facet": "FacetName",
  "function": "functionName",
  "description": "What this function does and why we're testing it"
}
```

### Medusa Options

- **workers**: Number of parallel fuzzing workers (default: 10)
- **testLimit**: Maximum number of test cases to generate (default: 50000)
- **timeout**: Fuzzing timeout in seconds, 0 = no timeout (default: 0)
- **corpusDirectory**: Where to save interesting inputs (default: "./medusa-corpus")

## Command Line Options

The `medusa:fuzz` Hardhat task supports the following options:

```bash
npx hardhat medusa:fuzz --diamond <DIAMOND_NAME> [OPTIONS]
```

### Options

- `--diamond <name>` (required): Name of the Diamond contract to fuzz
- `--workers <number>`: Override config workers (default: 10)
- `--limit <number>`: Override config test limit (default: 50000)
- `--timeout <seconds>`: Override config timeout (default: 0)
- `--fuzz-config <path>`: Custom path to fuzzing config file

### Examples

```bash
# Basic fuzzing with defaults
npx hardhat medusa:fuzz --diamond ExampleDiamond

# Custom parameters
npx hardhat medusa:fuzz --diamond ExampleDiamond --workers 20 --limit 100000

# With timeout
npx hardhat medusa:fuzz --diamond ExampleDiamond --timeout 300

# Custom config file
npx hardhat medusa:fuzz --diamond MyDiamond --fuzz-config ./configs/custom-fuzz.json
```

## Generated Artifacts

### Test Contract

Generated in `test/fuzzing/generated/[DiamondName]Test.sol`:

```solidity
contract ExampleDiamondTest {
    address constant DIAMOND = 0x...;  // Deployed Diamond address

    // Fuzzing functions for each target function
    function fuzz_0_transferOwnership(address addr1, uint256 val1, bytes memory data) public {
        callDiamond(0x..., abi.encode(addr1, val1, data));
    }

    // Invariants
    function medusa_diamond_exists() public view returns (bool) {
        return DIAMOND.code.length > 0;
    }
}
```

### Medusa Configuration

Generated as `medusa.json` in project root:

```json
{
  "fuzzing": {
    "workers": 4,
    "testLimit": 10000,
    "timeout": 60,
    "targetContracts": ["ExampleDiamondTest"],
    "corpusDirectory": "./medusa-corpus"
  },
  "compilation": {
    "platform": "crytic-compile",
    "platformConfig": {
      "target": "./test/fuzzing/generated",
      "solcVersion": "0.8.28"
    }
  }
}
```

## Invariants

The generated test contracts include several default invariants:

1. **medusa_diamond_exists**: Diamond contract must always exist at the deployed address
2. **medusa_facets_valid**: All registered facets must have valid selectors
3. **medusa_test_integrity**: Test contract state must remain consistent

These invariants are checked after every fuzz test execution.

## Best Practices

### Choosing Target Functions

Focus on:

- **State-changing functions**: Functions that modify contract state
- **Access-controlled functions**: Functions with role/ownership checks
- **Complex logic**: Functions with multiple branches and conditions
- **Edge cases**: Functions that handle boundary conditions

### Invariants to Consider

Define invariants that should always hold:

- **Ownership invariants**: Owner should never be zero address
- **Role invariants**: Admin roles should have specific permissions
- **Balance invariants**: Token balances should never go negative
- **State consistency**: Related state variables should stay synchronized

### Fuzzing Duration

- **Quick tests**: 1,000 - 10,000 test cases (1-5 minutes)
- **Standard tests**: 10,000 - 50,000 test cases (5-30 minutes)
- **Deep tests**: 100,000+ test cases (hours)

Use timeouts to limit long-running campaigns.

## Troubleshooting

### Medusa Not Found

Ensure Medusa is installed in the DevContainer:

```bash
medusa --version
```

If not installed, rebuild the DevContainer or run:

```bash
# Installation handled by .devcontainer/scripts/post-create.sh
```

### Compilation Errors

If Solidity compilation fails:

1. Check that all facets are properly deployed
2. Verify function selectors are correct
3. Ensure Solidity version matches (`pragma solidity ^0.8.28`)

### No Interesting Inputs Found

This is normal for well-tested contracts. It means:

- Invariants are holding correctly
- No obvious bugs were discovered
- Consider adding more complex target functions

## Integration with CI/CD

Add fuzzing to your CI pipeline:

```yaml
- name: Run Fuzzing Tests
  run: |
    npx hardhat medusa:fuzz --diamond ExampleDiamond --limit 5000 --timeout 300
```

## Additional Resources

- [Medusa Documentation](https://github.com/crytic/medusa)
- [Trail of Bits Blog](https://blog.trailofbits.com/)
- [Smart Contract Fuzzing Guide](https://secure-contracts.com/program-analysis/medusa/index.html)
- [Diamond Standard (ERC-2535)](https://eips.ethereum.org/EIPS/eip-2535)

## Support

For issues or questions:

1. Check the Medusa GitHub issues
2. Review the MedusaFuzzingFramework source in `scripts/setup/`
3. Consult the PRD: `tasks/prd-medusa-fuzzing-integration.md`
