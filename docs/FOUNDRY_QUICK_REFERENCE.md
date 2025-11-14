# Foundry Quick Reference

## Common Commands

### Testing

```bash
# Run all tests
forge test

# Verbose output (shows logs)
forge test -vv

# Very verbose (shows stack traces)
forge test -vvv

# Extremely verbose (shows execution traces)
forge test -vvvv

# Run specific test
forge test --match-test test_FunctionName

# Run specific contract
forge test --match-contract ContractName

# Run tests with gas reporting
forge test --gas-report

# Watch mode (rerun on file changes)
forge test --watch
```

### Building

```bash
# Build all contracts
forge build

# Force rebuild
forge build --force

# Build with extra output
forge build --extra-output abi --extra-output metadata
```

### Code Quality

```bash
# Format Solidity code
forge fmt

# Check formatting without changing files
forge fmt --check

# Clean artifacts
forge clean
```

### Coverage

```bash
# Generate coverage report
forge coverage

# Generate lcov report for VSCode
forge coverage --report lcov
```

### Gas Snapshots

```bash
# Create gas snapshot
forge snapshot

# Check against snapshot
forge snapshot --check

# Diff snapshots
forge snapshot --diff
```

### Debugging

```bash
# Run debugger for specific test
forge test --debug test_FunctionName

# Use console.log in tests
import "forge-std/console.sol";
console.log("Value:", myVariable);
```

## Test Structure

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/MyContract.sol";

contract MyContractTest is Test {
    MyContract myContract;

    // Runs before each test
    function setUp() public {
        myContract = new MyContract();
    }

    // Basic test
    function test_Something() public {
        assertEq(myContract.getValue(), 42);
    }

    // Fuzz test
    function testFuzz_Math(uint256 x) public {
        vm.assume(x < type(uint128).max);
        assertGe(x * 2, x);
    }

    // Expected revert
    function testFail_Revert() public {
        myContract.failingFunction();
    }

    // Specific revert message
    function test_RevertMessage() public {
        vm.expectRevert("Error message");
        myContract.failingFunction();
    }
}
```

## Cheatcodes (vm.\*)

### Time Manipulation

```solidity
vm.warp(timestamp);        // Set block.timestamp
vm.roll(blockNumber);      // Set block.number
skip(seconds);             // Advance time
rewind(seconds);           // Go back in time
```

### Account Manipulation

```solidity
vm.prank(address);         // Next call from address
vm.startPrank(address);    // All calls from address
vm.stopPrank();            // Stop pranking
vm.deal(address, amount);  // Set ETH balance
```

### Expecting Events/Reverts

```solidity
vm.expectRevert();                    // Expect next call reverts
vm.expectRevert("message");           // Expect specific message
vm.expectRevert(CustomError.selector);// Expect custom error
vm.expectEmit(true, true, false, true);
emit MyEvent(param1, param2);         // Expect event
```

### Mock Calls

```solidity
vm.mockCall(
    address(target),
    abi.encodeWithSelector(Target.func.selector, arg),
    abi.encode(returnValue)
);
```

### Storage

```solidity
vm.load(address, bytes32 slot);      // Read storage
vm.store(address, bytes32 slot, bytes32 value); // Write storage
```

### Snapshots

```solidity
uint256 snapshot = vm.snapshot();    // Create snapshot
vm.revertTo(snapshot);               // Revert to snapshot
```

## Assertions

```solidity
// Equality
assertEq(a, b);
assertEq(a, b, "error message");

// Inequality
assertNotEq(a, b);

// Greater/Less than
assertGt(a, b);  // a > b
assertGe(a, b);  // a >= b
assertLt(a, b);  // a < b
assertLe(a, b);  // a <= b

// Boolean
assertTrue(condition);
assertFalse(condition);

// Approximate equality (for decimals)
assertApproxEqAbs(a, b, maxDelta);
assertApproxEqRel(a, b, maxPercentDelta);
```

## Project Structure

```
project/
├── src/                  # Contracts (or use contracts/)
├── test/                 # Tests
├── script/               # Deployment scripts
├── lib/                  # Dependencies (git submodules)
├── out/                  # Build artifacts
├── cache/                # Build cache
└── foundry.toml          # Configuration
```

## Environment Variables

Create `.env` file:

```bash
# RPC URLs
MAINNET_RPC_URL=https://eth.llamarpc.com
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# API Keys
ETHERSCAN_API_KEY=your_key_here

# Private Keys (NEVER commit!)
PRIVATE_KEY=0x...
```

Load in tests:

```solidity
string memory rpcUrl = vm.envString("MAINNET_RPC_URL");
uint256 privateKey = vm.envUint("PRIVATE_KEY");
```

## Forking

```bash
# Fork mainnet
forge test --fork-url $MAINNET_RPC_URL

# Fork at specific block
forge test --fork-url $MAINNET_RPC_URL --fork-block-number 15000000
```

In code:

```solidity
function setUp() public {
    vm.createSelectFork(vm.envString("MAINNET_RPC_URL"));
}
```

## Install Dependencies

```bash
# Install from GitHub
forge install OpenZeppelin/openzeppelin-contracts

# Install specific version
forge install OpenZeppelin/openzeppelin-contracts@v4.9.0

# Update dependencies
forge update
```

## Remappings

In `foundry.toml`:

```toml
remappings = [
    "@openzeppelin/=lib/openzeppelin-contracts/",
    "forge-std/=lib/forge-std/src/",
]
```

Or create `remappings.txt`:

```
@openzeppelin/=lib/openzeppelin-contracts/
forge-std/=lib/forge-std/src/
```

## Tips & Tricks

### 1. Use bound() for safer fuzzing

```solidity
function testFuzz_SafeMath(uint256 x) public {
    x = bound(x, 1, type(uint128).max);
    // x is now between 1 and type(uint128).max
}
```

### 2. Use hoax for quick address setup

```solidity
hoax(alice, 100 ether);  // Sets msg.sender to alice with 100 ETH
```

### 3. Label addresses for better traces

```solidity
vm.label(address(myContract), "MyContract");
vm.label(alice, "Alice");
```

### 4. Use stdError for revert checks

```solidity
import "forge-std/StdError.sol";

vm.expectRevert(stdError.arithmeticError);
myContract.overflow();
```

### 5. Profile gas usage

```bash
forge test --gas-report
```

### 6. Generate coverage reports

```bash
forge coverage --report summary
forge coverage --report lcov
```

## VSCode Integration

Install extension: `foundry-rs.forge-std`

`.vscode/settings.json`:

```json
{
  "solidity.compileUsingRemoteVersion": "v0.8.19",
  "solidity.defaultCompiler": "localFile",
  "solidity.compilerOptimization": 200,
  "[solidity]": {
    "editor.defaultFormatter": "JuanBlanco.solidity"
  }
}
```

## Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Forge Std](https://book.getfoundry.sh/reference/forge-std/)
- [Cheatcodes Reference](https://book.getfoundry.sh/cheatcodes/)
- [Best Practices](https://book.getfoundry.sh/tutorials/best-practices)
