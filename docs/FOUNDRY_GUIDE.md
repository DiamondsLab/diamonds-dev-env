# Foundry + Hardhat Hybrid Project Guide

This project is configured as a hybrid **Hardhat + Foundry** development environment, allowing you to leverage the best features of both frameworks.

## Table of Contents

- [Overview](#overview)
- [Why Hybrid?](#why-hybrid)
- [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Building and Compiling](#building-and-compiling)
- [Available Scripts](#available-scripts)
- [Forge Fuzzing Framework](#forge-fuzzing-framework)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Overview

This repository uses:

- **Hardhat** for deployment scripts, TypeScript integration, and Hardhat-specific tooling
- **Foundry** for fast testing, fuzzing, gas optimization, and Solidity-native development

Both tools share the same `contracts/` directory and work seamlessly together.

## Why Hybrid?

### Hardhat Strengths

- Excellent TypeScript/JavaScript integration
- Rich plugin ecosystem
- Deployment and upgrade workflows
- Network management and forking
- Diamond-specific tooling (`hardhat-diamonds` plugin)

### Foundry Strengths

- Extremely fast compilation and testing (written in Rust)
- Native Solidity testing (no context switching)
- Built-in fuzzing capabilities
- Gas optimization tools
- Powerful debugging with `forge-std`
- Snapshot testing for gas benchmarks

## Directory Structure

```
diamonds_dev_env/
├── contracts/              # Shared Solidity contracts (used by both Hardhat & Foundry)
│   └── examplediamond/     # Diamond implementation contracts
├── test/
│   ├── foundry/           # Foundry tests (Solidity)
│   │   ├── unit/          # Unit tests
│   │   └── integration/   # Integration tests
│   ├── unit/              # Hardhat unit tests (TypeScript)
│   ├── integration/       # Hardhat integration tests
│   └── deployment/        # Hardhat deployment tests
├── scripts/
│   ├── foundry/           # Foundry deployment scripts (Solidity)
│   └── deploy/            # Hardhat deployment scripts (TypeScript)
├── lib/                   # Foundry dependencies (git submodules)
│   └── forge-std/         # Foundry standard library
├── out/                   # Foundry build artifacts
├── cache_forge/           # Foundry cache (separate from Hardhat)
├── artifacts/             # Hardhat build artifacts
├── cache/                 # Hardhat cache
├── foundry.toml           # Foundry configuration
└── hardhat.config.ts      # Hardhat configuration
```

## Getting Started

### Prerequisites

- Node.js and Yarn (for Hardhat)
- Foundry (already installed in the devcontainer)

### Installation

```bash
# Install Node dependencies
yarn install

# Install Foundry dependencies (already done, but for reference)
forge install
```

### Verify Setup

```bash
# Test Hardhat
yarn test

# Test Foundry
yarn forge:test

# Run both
yarn test:all
```

## Testing

### Foundry Tests (Solidity)

Create test files in `test/foundry/` with the `.t.sol` extension:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../../contracts/examplediamond/ExampleConstantsFacet.sol";

contract MyTest is Test {
    function setUp() public {
        // Setup code
    }

    function test_Something() public {
        assertEq(XMPL_NAME, "Example Tokens");
    }

    function testFuzz_Addition(uint256 a, uint256 b) public {
        // Foundry will run this with many random inputs
        vm.assume(a < type(uint256).max / 2);
        vm.assume(b < type(uint256).max / 2);
        assertEq(a + b, b + a);
    }
}
```

**Run Foundry Tests:**

```bash
# Basic run
forge test

# Verbose output
yarn forge:test

# Extra verbose (shows stack traces)
yarn forge:test:verbose

# With gas reporting
yarn forge:test:gas

# Run specific test
forge test --match-test test_Something

# Run specific contract
forge test --match-contract MyTest
```

### Hardhat Tests (TypeScript)

Hardhat tests remain in `test/unit/`, `test/integration/`, etc.

```bash
# Run Hardhat tests
yarn test

# Run specific test file
npx hardhat test test/unit/my-test.ts
```

### Running Both

```bash
# Run all tests (Hardhat + Foundry)
yarn test:all
```

## Building and Compiling

### Foundry

```bash
# Build with Foundry
yarn forge:build

# Clean Foundry artifacts
yarn forge:clean
```

### Hardhat

```bash
# Compile with Hardhat
yarn compile

# Clean Hardhat artifacts
yarn clean
```

Both tools maintain separate build artifacts and caches to avoid conflicts.

## Available Scripts

### Foundry Scripts

```bash
yarn forge:build              # Build contracts with Forge
yarn forge:test               # Run Forge tests with verbose output
yarn forge:test:verbose       # Run with extra verbosity (-vvv)
yarn forge:test:gas           # Run tests with gas reporting
yarn forge:coverage           # Generate coverage report
yarn forge:snapshot           # Create gas snapshots
yarn forge:clean              # Clean Forge artifacts
yarn forge:fmt                # Format Solidity code
yarn forge:fmt:check          # Check Solidity formatting

# Forge Fuzzing Framework (New)
yarn forge:deploy             # Deploy Diamond and generate test helpers
yarn forge:fuzz               # Run Forge fuzzing tests
yarn forge:generate-helpers   # Regenerate helper libraries
```

### Combined Scripts

```bash
yarn test:all                 # Run both Hardhat and Forge tests
```

### Hardhat Scripts

All existing Hardhat scripts continue to work as before.

## Best Practices

### When to Use Foundry

- **Unit tests** for pure Solidity logic
- **Fuzzing tests** to find edge cases
- **Gas optimization** and benchmarking
- **Quick iteration** during development
- **Property-based testing**

### When to Use Hardhat

- **Deployment scripts** with network management
- **Integration tests** requiring complex TypeScript logic
- **Tests involving** external APIs or off-chain components
- **Diamond-specific operations** using `hardhat-diamonds`
- **Upgrade testing** and governance workflows

### Shared Contracts

- Both frameworks compile from the same `contracts/` directory
- Keep contracts compatible with both toolchains
- Use Solidity `^0.8.19` for compatibility
- Avoid Hardhat-specific features in contracts that need Foundry testing

### Testing Strategy

1. **Unit Tests**: Write in Foundry (fast, Solidity-native)
2. **Integration Tests**: Use both (Foundry for on-chain, Hardhat for complex scenarios)
3. **Deployment Tests**: Use Hardhat (better network management)
4. **Gas Optimization**: Use Foundry (superior gas reporting)
5. **Fuzzing**: Use Foundry (built-in fuzzing)

## Common Patterns

### Testing Diamond Facets with Foundry

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../contracts/examplediamond/ExampleDiamond.sol";
import "../../contracts/examplediamond/ExampleConstantsFacet.sol";

contract DiamondTest is Test {
    ExampleDiamond diamond;

    function setUp() public {
        // Deploy diamond (simplified example)
        diamond = new ExampleDiamond();
    }

    function test_FacetFunction() public {
        // Test facet functionality
        assertEq(XMPL_NAME, "Example Tokens");
    }
}
```

### Using Forge-Std Utilities

```solidity
import "forge-std/Test.sol";

contract MyTest is Test {
    function test_WithCheatcodes() public {
        // Manipulate block timestamp
        vm.warp(block.timestamp + 1 days);

        // Manipulate msg.sender
        vm.prank(address(0x1234));

        // Expect a revert
        vm.expectRevert("Error message");
        someFunction();

        // Mock a call
        vm.mockCall(
            address(token),
            abi.encodeWithSelector(IERC20.balanceOf.selector),
            abi.encode(1000)
        );
    }
}
```

### Gas Snapshots

Create gas benchmarks:

```bash
# Create snapshot
yarn forge:snapshot

# Compare with snapshot (will show gas changes)
yarn forge:test
```

## Troubleshooting

### Compilation Issues

**Problem**: Contract compiles in Hardhat but not Foundry (or vice versa)
**Solution**: Check Solidity version compatibility in `foundry.toml` and `hardhat.config.ts`

**Problem**: Import paths not resolving
**Solution**: Check `remappings` in `foundry.toml` match your import structure

### Test Failures

**Problem**: Tests pass in Foundry but fail in Hardhat
**Solution**: Foundry and Hardhat may handle gas differently or have different default accounts

**Problem**: Cannot find `forge-std`
**Solution**: Ensure `lib/forge-std` exists. Run `forge install foundry-rs/forge-std`

### Performance

**Problem**: Slow Forge compilation
**Solution**: Use `forge build --force` to rebuild from scratch, or check `cache_forge/` for corruption

## Configuration Files

### foundry.toml

- Solidity version: `0.8.19`
- Source directory: `contracts/`
- Test directory: `test/foundry/`
- Cache directory: `cache_forge/`
- Output directory: `out/`
- Remappings include `@helpers/` for auto-generated test libraries

### hardhat.config.ts

- Maintains existing Hardhat configuration
- Diamond-specific plugins configured
- Network configurations for deployment
- Forge tasks registered via `import './tasks/forge'`

---

## Forge Fuzzing Framework

This project includes a comprehensive **Forge Fuzzing Framework** for testing Diamond contracts with advanced fuzzing capabilities.

### Quick Start

```bash
# 1. Start a local network
npx hardhat node

# 2. Deploy Diamond and generate test helpers
yarn forge:deploy

# 3. Run fuzzing tests
yarn forge:fuzz
```

### Features

- **Integrated Deployment**: Uses `LocalDiamondDeployer` for consistent Diamond deployment
- **Auto-Generated Helpers**: Creates `DiamondDeployment.sol` library with addresses and selectors
- **Comprehensive Tests**: Includes fuzz, integration, and invariant test patterns
- **Multi-Network Support**: Works with Hardhat node, localhost, and Anvil

### Framework Components

| Component               | Purpose                                               |
| ----------------------- | ----------------------------------------------------- |
| `ForgeFuzzingFramework` | TypeScript class orchestrating deployment and testing |
| `DiamondDeployment.sol` | Auto-generated library with deployment data           |
| `DiamondFuzzBase.sol`   | Base contract with helper functions for tests         |
| `forge:deploy` task     | Deploy Diamond and generate helpers                   |
| `forge:fuzz` task       | Run comprehensive Forge test suite                    |

### Test Structure

```
test/foundry/
├── helpers/
│   ├── DiamondDeployment.sol      # Auto-generated (DO NOT EDIT)
│   ├── DiamondFuzzBase.sol        # Base contract for tests
│   └── DiamondABILoader.sol       # ABI parsing utilities
├── fuzz/
│   ├── ExampleDiamondAccessControl.t.sol   # Access control fuzzing
│   └── ExampleDiamondOwnership.t.sol       # Ownership fuzzing
├── integration/
│   └── ExampleDiamondIntegrationDeployed.t.sol  # Integration tests
├── invariant/
│   └── DiamondProxyInvariant.t.sol         # Invariant tests
└── ExampleDiamond.forge.config.json        # Forge fuzzing config
```

### Writing Fuzz Tests

Example fuzz test using the framework:

```solidity
import "../helpers/DiamondFuzzBase.sol";

contract MyFuzzTest is DiamondFuzzBase {
    function setUp() public override {
        super.setUp(); // Loads Diamond address and ABI
    }

    function testFuzz_MyFunction(address user, uint256 amount) public {
        vm.assume(user != address(0));
        vm.assume(amount > 0 && amount < 1e18);

        bytes4 selector = bytes4(keccak256("myFunction(address,uint256)"));
        (bool success, ) = _callDiamond(selector, abi.encode(user, amount));

        assertTrue(success);
    }
}
```

### Complete Documentation

For comprehensive documentation on the Forge Fuzzing Framework, including:

- Detailed architecture explanation
- Task reference and options
- Writing different test types (fuzz, integration, invariant)
- Network configuration
- Reusability guide for new projects
- Troubleshooting common issues

**See**: [FORGE_FUZZING_GUIDE.md](./FORGE_FUZZING_GUIDE.md)

---

## Additional Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Forge-Std Documentation](https://book.getfoundry.sh/reference/forge-std/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [ERC-2535 Diamond Standard](https://eips.ethereum.org/EIPS/eip-2535)

## Contributing

When adding new features:

1. Consider which framework is best suited for the task
2. Write tests in the appropriate framework
3. Ensure both Hardhat and Foundry compilation succeeds
4. Update this guide if you add new patterns or workflows

## Support

For issues specific to:

- **Foundry**: Check [Foundry GitHub](https://github.com/foundry-rs/foundry)
- **Hardhat**: Check [Hardhat Documentation](https://hardhat.org/hardhat-runner/docs/getting-started)
- **This Setup**: Open an issue in this repository
