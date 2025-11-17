# Medusa Fuzzing Guide

A guide to using Medusa fuzzing for Diamond proxy contracts in the Diamonds Dev Env.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Running Fuzzing Tests](#running-fuzzing-tests)
- [Understanding Test Results](#understanding-test-results)
- [Writing Custom Fuzz Tests](#writing-custom-fuzz-tests)
- [Limitations](#limitations)
- [Troubleshooting](#troubleshooting)

---

## Overview

Medusa is a coverage-guided smart contract fuzzer from Trail of Bits. It generates random inputs to test contract functions and search for bugs, assertion failures, and security vulnerabilities.

### Key Features

- **Coverage-Guided**: Uses code coverage feedback to generate more effective test inputs
- **Property Testing**: Validates invariants and properties that should always hold
- **Corpus Generation**: Saves interesting inputs for regression testing
- **Integrated with Solidity**: Native understanding of Solidity contracts and types

### Comparison with Forge Fuzzing

| Feature                 | Medusa                   | Forge               |
| ----------------------- | ------------------------ | ------------------- |
| **Chain Forking**       | ❌ No                    | ✅ Yes              |
| **Coverage Guidance**   | ✅ Advanced              | ✅ Basic            |
| **Corpus Management**   | ✅ Automatic             | ⚠️ Manual           |
| **Slither Integration** | ✅ Built-in              | ❌ No               |
| **Test Speed**          | ⚠️ Slower                | ✅ Faster           |
| **Best For**            | Self-contained contracts | Integration testing |

**Important**: Medusa cannot fork from a running blockchain (like Hardhat node). It uses its own isolated EVM, making it best suited for testing self-contained contract logic rather than integration scenarios.

---

## Setup

### Prerequisites

1. **Medusa** - Installed via DevContainer (in `.devcontainer/scripts/post-create.sh`)
2. **solc-select** - Required for Solidity compilation
3. **crytic-compile** - Required for contract compilation

### Install Dependencies

If running outside the DevContainer or if dependencies are missing:

```bash
# Install solc-select and crytic-compile
pipx install solc-select
pipx install crytic-compile

# Install the Solidity compiler version
solc-select install 0.8.19
solc-select use 0.8.19
```

### Verify Installation

```bash
medusa --version
solc-select --version
crytic-compile --version
```

---

## Quick Start

### 1. Configure Fuzzing Targets

Create or edit `test/fuzzing/ExampleDiamond.fuzz.config.json`:

```json
{
  "diamondName": "ExampleDiamond",
  "targetFunctions": [
    {
      "facet": "ExampleOwnershipFacet",
      "function": "transferOwnership",
      "description": "Transfer contract ownership"
    },
    {
      "facet": "ExampleOwnershipFacet",
      "function": "owner",
      "description": "Get current owner"
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

### 2. Deploy Diamond (Optional for Reference)

While Medusa can't fork the deployment, deploying first ensures your Diamond configuration is valid:

```bash
# Start Hardhat node in separate terminal
npx hardhat node

# Deploy Diamond
npx hardhat forge:deploy --diamond ExampleDiamond --network localhost
```

### 3. Run Medusa Fuzzing

```bash
npx hardhat medusa:fuzz \
  --diamond ExampleDiamond \
  --network localhost \
  --workers 4 \
  --limit 10000 \
  --timeout 120
```

**Note**: The `--network` parameter is used for Diamond configuration but Medusa runs on its own EVM.

---

## Configuration

### Fuzzing Configuration File

Location: `test/fuzzing/[DiamondName].fuzz.config.json`

```json
{
  "diamondName": "ExampleDiamond",
  "targetFunctions": [
    {
      "facet": "FacetName",
      "function": "functionName",
      "description": "What this function does"
    }
  ],
  "medusaOptions": {
    "workers": 4, // Number of parallel workers
    "testLimit": 50000, // Maximum test cases
    "timeout": 0, // Timeout in seconds (0 = no timeout)
    "corpusDirectory": "./medusa-corpus", // Where to save interesting inputs
    "deployerAddress": "0x30000", // Address that deploys contracts
    "senderAddresses": [
      // Addresses that can call functions
      "0x10000",
      "0x20000",
      "0x30000"
    ],
    "blockNumberDelayMax": 60480, // Max blocks to advance
    "blockTimestampDelayMax": 604800 // Max seconds to advance
  }
}
```

### Medusa.json

Generated automatically by the framework at project root. Contains:

- **Fuzzing config**: Workers, test limits, timeouts
- **Compilation config**: Solidity version, compilation target
- **Chain config**: EVM settings, cheat codes

Example:

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
      "solcVersion": "0.8.19"
    }
  }
}
```

---

## Running Fuzzing Tests

### Basic Usage

```bash
npx hardhat medusa:fuzz --diamond ExampleDiamond
```

### With Custom Parameters

```bash
npx hardhat medusa:fuzz \
  --diamond ExampleDiamond \
  --workers 8 \
  --limit 100000 \
  --timeout 300
```

### Using Custom Config

```bash
npx hardhat medusa:fuzz \
  --diamond ExampleDiamond \
  --fuzz-config test/fuzzing/custom-config.json
```

### What Happens During a Run

1. **Deployment**: Diamond configuration is loaded and validated
2. **Test Generation**: Solidity test contract is auto-generated in `test/fuzzing/generated/`
3. **Compilation**: Test contract is compiled with `crytic-compile`
4. **Fuzzing**: Medusa runs the fuzzing campaign
5. **Results**: Findings are saved to `./medusa-corpus/`

---

## Understanding Test Results

### Generated Test Contract

Location: `test/fuzzing/generated/[DiamondName]Test.sol`

Structure:

```solidity
pragma solidity ^0.8.19;

contract ExampleDiamondTest {
    address private constant DIAMOND = 0x...;

    constructor() {
        require(DIAMOND.code.length > 0, "Diamond not found");
    }

    // Fuzzing functions
    function fuzz_0_transferOwnership(address addr1, uint256 val1, bytes memory data) public {
        callDiamond(0xf2fde38b, abi.encode(addr1, val1, data));
    }

    // Invariants
    function echidna_diamond_exists() public view returns (bool) {
        return DIAMOND.code.length > 0;
    }
}
```

### Corpus Directory

Medusa saves interesting test inputs to `./medusa-corpus/`:

```
medusa-corpus/
├── coverage/              # Coverage-related files
├── test_results/         # Test execution results
└── call_sequences/       # Saved call sequences
```

### Reading Output

Medusa output includes:

- **Coverage**: % of code paths executed
- **Calls**: Number of function calls tested
- **Failures**: Any assertion failures or reverts
- **Crashes**: Unexpected VM crashes

Example:

```
⇾ Running with a timeout of 60 seconds
⇾ Fuzzing with 4 workers
├─ Coverage: 45.2%
├─ Calls executed: 12,543
├─ Unique paths: 234
└─ Failures: 0
```

---

## Writing Custom Fuzz Tests

### Modifying Generated Tests

The generated test contract can be edited:

```solidity
// Add custom state
uint256 private callCount;

// Add setup logic
constructor() {
    require(DIAMOND.code.length > 0, "Diamond not found");
    callCount = 0;
}

// Enhanced fuzzing function
function fuzz_0_transferOwnership(address newOwner) public {
    callCount++;

    // Pre-condition
    require(newOwner != address(0), "Invalid owner");

    // Call Diamond
    (bool success,) = DIAMOND.call(
        abi.encodeWithSelector(0xf2fde38b, newOwner)
    );

    // Post-condition
    if (success) {
        assert(callCount > 0);
    }
}

// Custom invariant
function echidna_call_count_increases() public view returns (bool) {
    return callCount >= 0;
}
```

### Adding Invariants

Invariants are properties that should always be true:

```solidity
// Owner should never be zero address
function echidna_owner_not_zero() public view returns (bool) {
    (bool success, bytes memory data) = DIAMOND.staticcall(
        abi.encodeWithSelector(0x8da5cb5b) // owner()
    );
    if (!success) return true;
    address owner = abi.decode(data, (address));
    return owner != address(0);
}

// Diamond should always have code
function echidna_diamond_exists() public view returns (bool) {
    return DIAMOND.code.length > 0;
}
```

---

## Limitations

### 1. No Chain Forking

**Issue**: Medusa cannot fork from a running blockchain or Hardhat node.

**Impact**:

- Cannot test against already-deployed contracts
- Cannot use real chain state
- Limited to self-contained contract testing

**Workaround**:

- Deploy required contracts within the test
- Mock external dependencies
- Use Forge for integration testing instead

### 2. Diamond Address Hardcoding

**Issue**: The test contract references a specific Diamond address that doesn't exist in Medusa's EVM.

**Impact**: Constructor check fails: `"Diamond not found at address"`

**Workaround**:

- Comment out the Diamond existence check in generated contract
- Deploy a fresh Diamond in Medusa's test setup
- Use Medusa only for testing pure function logic

### 3. Compilation Dependencies

**Issue**: Requires `solc-select` and `crytic-compile` installed separately.

**Impact**: Additional setup steps needed outside DevContainer.

**Solution**: Install via `pipx` as shown in [Setup](#setup).

---

## Troubleshooting

### Error: `solc-select: command not found`

**Solution**:

```bash
pipx install solc-select
solc-select install 0.8.19
solc-select use 0.8.19
```

### Error: `crytic-compile: command not found`

**Solution**:

```bash
pipx install crytic-compile
```

### Error: `Diamond not found at address`

**Cause**: Medusa can't fork from Hardhat node.

**Solutions**:

1. **Remove the check**: Comment out the Diamond existence check in the generated test contract
2. **Use Forge instead**: For testing deployed contracts, use Forge which supports forking
3. **Deploy in test**: Add deployment logic to the test contract's setup

### Error: `No solc version exists that matches...`

**Cause**: Wrong Solidity version installed.

**Solution**:

```bash
solc-select use 0.8.19
# Or install if missing
solc-select install 0.8.19
solc-select use 0.8.19
```

### Low Code Coverage

**Possible Causes**:

- Test limit too low
- Timeout too short
- Invariants too restrictive
- Functions need specific setup

**Solutions**:

- Increase `--limit` parameter
- Increase `--timeout` parameter
- Add more `--workers`
- Adjust invariants to be less strict
- Add setup code to test contract

### Compilation Errors

**Cause**: Generated contract has syntax errors or incompatible Solidity.

**Solutions**:

1. Check Solidity version matches: `pragma solidity ^0.8.19`
2. Verify function selectors are correct
3. Manually fix generated contract in `test/fuzzing/generated/`

---

## Best Practices

### 1. Start Small

Begin with a small number of target functions and a low test limit:

```bash
npx hardhat medusa:fuzz --diamond ExampleDiamond --limit 1000
```

Gradually increase as you validate the setup.

### 2. Focus on Pure Logic

Medusa works best for:

- State transition logic
- Access control checks
- Mathematical operations
- Internal consistency

Avoid testing:

- External contract interactions
- Network-dependent features
- Time-sensitive operations requiring specific block state

### 3. Complement with Forge

Use both frameworks:

- **Medusa**: Deep coverage of individual contract logic
- **Forge**: Integration testing with real deployed state

### 4. Save Corpus

The corpus directory contains valuable regression tests:

```bash
# Commit corpus to version control
git add medusa-corpus/
git commit -m "Add Medusa fuzzing corpus"
```

### 5. Monitor Coverage

Track coverage over time:

```bash
# Run with coverage tracking
medusa fuzz --config medusa.json

# Check coverage reports in ./medusa-corpus/coverage/
```

---

## Additional Resources

- [Medusa Documentation](https://github.com/crytic/medusa)
- [Trail of Bits Blog](https://blog.trailofbits.com/)
- [Fuzzing Best Practices](https://github.com/crytic/building-secure-contracts/tree/master/program-analysis/echidna)
- [Solidity Security](https://github.com/crytic/building-secure-contracts)

---

## Summary

Medusa is a powerful fuzzing tool for discovering edge cases in smart contract logic. While it has limitations regarding chain forking, it excels at deep coverage of self-contained contract functionality. Use it alongside Forge fuzzing for comprehensive test coverage of Diamond proxy contracts.

**Quick Command Reference**:

```bash
# Setup (one-time)
pipx install solc-select crytic-compile
solc-select install 0.8.19 && solc-select use 0.8.19

# Run fuzzing
npx hardhat medusa:fuzz --diamond ExampleDiamond --workers 4 --limit 10000

# Check results
ls -lh medusa-corpus/
cat test/fuzzing/generated/ExampleDiamondTest.sol
```
