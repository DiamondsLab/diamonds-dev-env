# Echidna Fuzzing Tests for Diamond Contracts

This directory contains Echidna property-based fuzzing tests for the ExampleDiamond contract. Echidna is a powerful fuzzing tool that automatically generates test inputs to find bugs and verify invariants in Ethereum smart contracts.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Understanding the Test Structure](#understanding-the-test-structure)
- [Writing New Tests](#writing-new-tests)
- [Interpreting Results](#interpreting-results)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Examples](#examples)

## Overview

Echidna uses property-based testing to verify that certain invariants (properties that should always hold true) are maintained across all possible contract states. Unlike traditional unit tests that check specific scenarios, Echidna generates thousands of random transaction sequences to find edge cases and vulnerabilities.

**Key Benefits:**

- Discovers security vulnerabilities through automated fuzzing
- Tests invariants across complex state transitions
- Finds edge cases that manual testing might miss
- Validates Diamond proxy pattern implementation
- Tests facet interactions and upgrades

## Prerequisites

Echidna must be installed in your environment. It's pre-installed in the DevContainer.

**To verify Echidna is installed:**

```bash
echidna --version
```

**Manual installation (if needed):**

- macOS: `brew install echidna`
- Linux: Download from [Echidna releases](https://github.com/crytic/echidna/releases)
- From source: Follow [installation guide](https://github.com/crytic/echidna#building-from-source)

## Getting Started

### 1. Prepare the Environment

Before running Echidna tests, prepare the environment:

```bash
yarn echidna:setup
```

This command:

- Ensures directories exist (corpus, coverage)
- Compiles all Solidity contracts
- Generates Diamond ABI files
- Verifies Echidna installation

### 2. Run the Example Test

Run the included example fuzzing test:

```bash
yarn echidna:test
```

This will execute `DiamondFuzzTest.sol` with the configuration in `echidna/config/echidna.yaml`.

## Running Tests

### Available Commands

```bash
# Prepare environment (compile contracts, generate ABIs)
yarn echidna:setup

# Run Echidna fuzzing tests
yarn echidna:test

# Clean corpus and coverage artifacts
yarn echidna:clean

# Prepare with clean start
yarn echidna:setup --clean && yarn echidna:test
```

### Test Execution Flow

1. **Setup:** Echidna compiles the test contract
2. **Deployment:** The test contract constructor deploys a Diamond instance
3. **Fuzzing:** Echidna generates random transaction sequences
4. **Verification:** After each sequence, Echidna checks all invariant functions
5. **Reporting:** Results show which properties passed/failed

### Understanding Test Output

Echidna will display results for each invariant:

```
echidna_owner_not_zero: passed! 🎉
echidna_diamond_has_facets: passed! 🎉
echidna_supports_loupe_interface: passed! 🎉
```

If a test fails, Echidna provides a counterexample showing the sequence of calls that violated the property.

## Understanding the Test Structure

### Directory Structure

```
echidna/
├── config/
│   └── echidna.yaml          # Echidna configuration
├── contracts/
│   └── DiamondFuzzTest.sol   # Main fuzzing test contract
├── setup/
│   ├── DiamondDeploymentHelper.sol  # Handles Diamond deployment
│   └── IExampleDiamond.sol          # Diamond interface
├── corpus/                   # Saved test sequences (gitignored)
└── coverage/                 # Coverage reports (gitignored)
```

### Key Components

**1. DiamondDeploymentHelper.sol**

- Deploys Diamond contract with all facets
- Written in Solidity for Echidna compatibility
- Provides getter methods for addresses

**2. IExampleDiamond.sol**

- Interface combining all facet functions
- Generated from diamond-abi JSON
- Used to interact with Diamond in tests

**3. DiamondFuzzTest.sol**

- Main test contract containing invariants
- Deploys Diamond in constructor
- Defines properties to test

### How Deployment Works

```solidity
constructor() {
    // 1. Deploy Diamond using helper
    deploymentHelper = new DiamondDeploymentHelper();

    // 2. Get Diamond address
    diamondAddress = deploymentHelper.getDiamondAddress();

    // 3. Create interface to interact with Diamond
    diamond = IExampleDiamond(diamondAddress);
}
```

The `DiamondDeploymentHelper`:

1. Deploys `DiamondCutFacet`
2. Deploys `ExampleDiamond` with owner and DiamondCutFacet
3. Deploys all other facets (Loupe, Ownership, Init, Upgrade, Constants)
4. Executes diamond cut to add all facets
5. Returns deployed addresses

## Writing New Tests

### Invariant Functions

Invariant functions must:

- Start with `echidna_` prefix
- Return `bool` (true = property holds)
- Be public or external
- Not modify state (should be `view` or `pure`)

**Example:**

```solidity
/// @notice Invariant: Owner should never be zero address
function echidna_owner_not_zero() public view returns (bool) {
    address currentOwner = diamond.owner();
    return currentOwner != address(0);
}
```

### Common Invariant Patterns

**1. State Consistency:**

```solidity
function echidna_facet_count_consistent() public view returns (bool) {
    uint256 facetCount = diamond.facetAddresses().length;
    return facetCount >= 5; // At least the core facets
}
```

**2. Access Control:**

```solidity
function echidna_only_owner_has_admin_role() public view returns (bool) {
    bytes32 adminRole = diamond.DEFAULT_ADMIN_ROLE();
    // Owner must have admin role
    return diamond.hasRole(adminRole, owner);
}
```

**3. Mathematical Invariants:**

```solidity
uint256 initialBalance;

function echidna_balance_never_negative() public returns (bool) {
    if (initialBalance == 0) {
        initialBalance = address(diamond).balance;
    }
    return address(diamond).balance >= 0; // Always true in Solidity, but demonstrates pattern
}
```

**4. Interface Support:**

```solidity
function echidna_supports_required_interfaces() public view returns (bool) {
    return diamond.supportsInterface(type(IDiamondCut).interfaceId) &&
           diamond.supportsInterface(type(IDiamondLoupe).interfaceId);
}
```

### Testing Facet Interactions

To test specific facet functionality:

```solidity
function echidna_version_increases_monotonically() public view returns (bool) {
    uint256 currentVersion = diamond.getCurrentVersion();
    // Version should never decrease
    return currentVersion >= lastSeenVersion;
}
```

### Stateful vs Stateless Testing

**Stateless:** Each invariant check is independent

```solidity
function echidna_owner_not_zero() public view returns (bool) {
    return diamond.owner() != address(0);
}
```

**Stateful:** Invariants track state across sequences

```solidity
uint256 maxVersion;

function echidna_version_never_decreases() public returns (bool) {
    uint256 current = diamond.getCurrentVersion();
    if (current > maxVersion) {
        maxVersion = current;
    }
    return current >= maxVersion;
}
```

## Interpreting Results

### Successful Tests

```
echidna_owner_not_zero: passed! 🎉
```

- Property held true for all test sequences
- No counterexample found

### Failed Tests

```
echidna_some_property: failed!💥
  Call sequence:
    transferOwnership(0x0000000000000000000000000000000000000000)
```

- Echidna found a counterexample
- Shows the sequence of calls that violated the property
- Fix the bug or adjust the invariant

### Coverage Reports

Check `echidna/coverage/` for:

- **Text report:** Line-by-line coverage
- **HTML report:** Visual coverage display

Coverage helps identify:

- Untested code paths
- Missing test scenarios
- Dead code

### Corpus Management

The `echidna/corpus/` directory contains:

- Successful test sequences that achieved new coverage
- Can be reused across runs
- Helps with regression testing

**To start fresh:**

```bash
yarn echidna:clean
```

## Configuration

### echidna.yaml Settings

Located at `echidna/config/echidna.yaml`:

```yaml
testLimit: 10000 # Number of test sequences
seqLen: 100 # Max operations per sequence
coverage: true # Enable coverage tracking
corpusDir: "echidna/corpus"
```

**Key settings:**

- `testLimit`: More tests = better coverage but slower
- `seqLen`: Longer sequences test complex state transitions
- `testMode`: "assertion" for assert statements, "property" for echidna\_ functions
- `shrinkLimit`: How hard Echidna tries to minimize failing sequences

**To adjust for your needs:**

- Quick smoke test: `testLimit: 1000`, `seqLen: 10`
- Thorough fuzzing: `testLimit: 50000`, `seqLen: 200`
- Deep state exploration: Increase `seqLen`

## Troubleshooting

### Common Issues

**1. "Echidna not found"**

```bash
# Check installation
echidna --version

# Install if needed (macOS)
brew install echidna
```

**2. "Contract not found"**

```bash
# Ensure contracts are compiled
yarn echidna:setup

# Check that DiamondFuzzTest.sol exists
ls echidna/contracts/
```

**3. "Out of gas"**

```yaml
# In echidna.yaml, increase gas limit
gasLimit: 12000000
```

**4. "No tests run"**

```solidity
// Ensure functions start with echidna_
function echidna_my_test() public view returns (bool) {
    return true;
}
```

**5. "Compilation errors"**

```bash
# Check Solidity compiler version
npx hardhat compile

# Verify imports are correct
```

### Getting Help

- [Echidna Documentation](https://github.com/crytic/echidna)
- [Trail of Bits Blog](https://blog.trailofbits.com/)
- [Echidna Tutorial](https://github.com/crytic/building-secure-contracts/tree/master/program-analysis/echidna)

## Examples

### Example 1: Basic Ownership Invariant

```solidity
function echidna_owner_exists() public view returns (bool) {
    return diamond.owner() != address(0);
}
```

### Example 2: Role-Based Access Control

```solidity
function echidna_upgrader_role_exists() public view returns (bool) {
    bytes32 upgraderRole = diamond.UPGRADER_ROLE();
    return diamond.getRoleMemberCount(upgraderRole) >= 0;
}
```

### Example 3: Facet Count Consistency

```solidity
function echidna_minimum_facets() public view returns (bool) {
    // Should have at least DiamondCut, Loupe, Ownership, Init, Upgrade facets
    return diamond.facetAddresses().length >= 5;
}
```

### Example 4: Interface Support

```solidity
function echidna_erc165_support() public view returns (bool) {
    // Should support ERC-165
    return diamond.supportsInterface(0x01ffc9a7);
}
```

## Relationship with Other Testing

### Echidna vs Unit Tests

| Feature   | Echidna                | Unit Tests         |
| --------- | ---------------------- | ------------------ |
| Test Type | Property-based         | Example-based      |
| Coverage  | Automatic exploration  | Manual scenarios   |
| Best For  | Invariants, edge cases | Specific behaviors |
| Speed     | Slower (many tests)    | Faster (targeted)  |

**Use both:** Unit tests for known scenarios, Echidna for discovering unknown issues.

### Integration with Diamonds Module

Echidna tests leverage the Diamonds module:

- `LocalDiamondDeployer` pattern adapted to Solidity
- diamond-abi generation for interfaces
- Deployment configuration from `hardhat.config.ts`

The `DiamondDeploymentHelper` mirrors what `LocalDiamondDeployer.ts` does in TypeScript, but in Solidity for Echidna compatibility.

## Next Steps

1. **Run the example test:** `yarn echidna:test`
2. **Add custom invariants** to `DiamondFuzzTest.sol`
3. **Test your facets** by importing their interfaces
4. **Analyze coverage** to find untested code
5. **Iterate** on invariants based on results

## Resources

- [Echidna GitHub](https://github.com/crytic/echidna)
- [Property-Based Testing](https://blog.trailofbits.com/2018/03/23/use-echidna-to-test-smart-contracts/)
- [Smart Contract Security](https://github.com/crytic/building-secure-contracts)
- [ERC-2535 Diamond Standard](https://eips.ethereum.org/EIPS/eip-2535)
