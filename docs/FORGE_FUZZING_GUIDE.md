# Forge Fuzzing Framework Guide

A comprehensive guide to using the Forge Fuzzing Framework for testing Diamond proxy contracts with Foundry.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Workflow](#workflow)
- [Task Reference](#task-reference)
- [Writing Tests](#writing-tests)
- [Network Options](#network-options)
- [Reusability](#reusability)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)

---

## Overview

The Forge Fuzzing Framework provides a seamless integration between Hardhat's Diamond deployment infrastructure and Foundry's advanced testing capabilities. It eliminates the need for custom deployment artifacts and provides a reusable harness for fuzzing Diamond-based contracts.

### Key Features

- **Integrated Deployment**: Leverages existing `LocalDiamondDeployer` for consistent deployments
- **Auto-Generated Helpers**: Creates Solidity libraries with deployment data for easy test access
- **Comprehensive Test Suite**: Includes fuzz, integration, and invariant test patterns
- **Multi-Network Support**: Works with Hardhat node, localhost, and Anvil
- **Reusable Framework**: Easily adaptable to new Diamond projects

### Design Decisions

1. **No Custom Artifacts**: Uses standard Diamond deployment records instead of `.forge-diamond-address` files
2. **Generated Library Pattern**: Auto-generates `DiamondDeployment.sol` from deployment data
3. **Singleton Pattern**: `ForgeFuzzingFramework` ensures consistent deployment instances
4. **Helper Base Contract**: `DiamondFuzzBase.sol` provides common utilities for all tests

---

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Hardhat Tasks Layer                      │
│  ┌──────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │ forge:deploy │  │ forge:generate │  │  forge:fuzz   │  │
│  │              │  │    -helpers    │  │               │  │
│  └──────┬───────┘  └────────┬───────┘  └───────┬───────┘  │
└─────────┼───────────────────┼──────────────────┼──────────┘
          │                   │                  │
          ▼                   ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│              ForgeFuzzingFramework (TypeScript)             │
│  ┌────────────────────┐        ┌──────────────────────┐    │
│  │ LocalDiamond       │◄───────┤  forgeHelpers.ts     │    │
│  │ Deployer           │        │  - generateSolidity  │    │
│  │ - deployDiamond()  │        │    HelperLibrary()   │    │
│  │ - getDeployedData()│        └──────────────────────┘    │
│  └────────────────────┘                                     │
└─────────────────────────────────────────────────────────────┘
          │                           │
          │ Writes deployment         │ Generates
          │ record                    │ Solidity library
          ▼                           ▼
┌──────────────────────┐    ┌─────────────────────────────────┐
│ Deployment Record    │    │  DiamondDeployment.sol          │
│ diamonds/            │    │  - DIAMOND_ADDRESS              │
│   ExampleDiamond/    │    │  - FACET_ADDRESSES              │
│     deployments/     │    │  - SELECTORS                    │
│       *.json         │    │  - Helper functions             │
└──────────────────────┘    └─────────────────────────────────┘
                                      │
                                      │ Used by
                                      ▼
                            ┌─────────────────────────────────┐
                            │  Forge Tests                    │
                            │  ┌──────────────────────────┐   │
                            │  │ DiamondFuzzBase.sol      │   │
                            │  │ - _callDiamond()         │   │
                            │  │ - _getDiamondOwner()     │   │
                            │  │ - _verifyFacetRouting()  │   │
                            │  └──────────────────────────┘   │
                            │           ▲                     │
                            │           │ extends             │
                            │  ┌────────┴─────────────────┐   │
                            │  │ Your Tests               │   │
                            │  │ - Fuzz tests             │   │
                            │  │ - Integration tests      │   │
                            │  │ - Invariant tests        │   │
                            │  └──────────────────────────┘   │
                            └─────────────────────────────────┘
```

### Key Components

#### 1. **ForgeFuzzingFramework** (`scripts/setup/ForgeFuzzingFramework.ts`)

Main orchestrator class that:

- Manages Diamond deployment via `LocalDiamondDeployer`
- Generates Solidity helper libraries
- Executes Forge tests via child process
- Validates deployment integrity

**Key Methods**:

- `getInstance(config)`: Get or create framework instance (singleton)
- `deployDiamond()`: Deploy Diamond using LocalDiamondDeployer
- `getDeployedDiamondData()`: Retrieve deployment data from records
- `generateHelperLibrary()`: Create `DiamondDeployment.sol` from deployment
- `runForgeTests()`: Execute `forge test` with options
- `runFuzzingCampaign()`: Complete workflow (deploy → generate → test)

#### 2. **Helper Generator** (`scripts/utils/forgeHelpers.ts`)

Utility functions for Solidity library generation:

- `generateSolidityHelperLibrary()`: Creates `DiamondDeployment.sol` library
  - Reads deployment record
  - Generates address constants
  - Creates selector mappings
  - Adds helper functions

**Generated Library Structure**:

```solidity
library DiamondDeployment {
    address constant DIAMOND_ADDRESS = 0x...;
    address constant OWNERSHIP_FACET = 0x...;
    bytes4 constant OWNERSHIP_SEL_0x8da5cb5b = 0x8da5cb5b; // owner()

    function getDiamondAddress() internal pure returns (address);
    function getFacetAddress(string memory) internal pure returns (address);
    function getSelector(string memory, string memory) internal pure returns (bytes4);
}
```

#### 3. **DiamondFuzzBase** (`test/foundry/helpers/DiamondFuzzBase.sol`)

Abstract base contract providing:

- Diamond address loading from `DiamondDeployment`
- Low-level call helpers for Diamond interactions
- Gas measurement utilities
- Access control helpers
- Facet routing verification

**Helper Functions**:

- `_loadDiamondAddress()`: Get Diamond address from library
- `_callDiamond(selector, data)`: Execute Diamond function
- `_getDiamondOwner()`: Get current owner
- `_hasRole(role, account)`: Check role assignment
- `_verifyFacetRouting(selector, expectedFacet)`: Validate selector routing
- `_measureDiamondGas(selector, data)`: Profile gas usage

#### 4. **Hardhat Tasks** (`tasks/forge.ts`)

Three main tasks for the workflow:

**`forge:deploy`**

- Deploys Diamond using ForgeFuzzingFramework
- Generates helper library automatically
- Parameters: `--diamond`, `--targetNetwork`, `--force-deploy`

**`forge:generate-helpers`**

- Regenerates helper library from existing deployment
- Useful when deployment record changes
- Parameters: `--diamond`, `--targetNetwork`

**`forge:fuzz`**

- Executes Forge tests with optional deployment
- Supports test filtering and network selection
- Parameters: `--diamond`, `--targetNetwork`, `--match-test`, `--force-deploy`

---

## Quick Start

### Prerequisites

1. Hardhat and Foundry installed
2. Diamond configuration file exists
3. Network (Hardhat node or Anvil) running

### Basic Workflow

```bash
# 1. Start a local network (in separate terminal)
npx hardhat node
# OR
anvil

# 2. Deploy Diamond and generate helpers
npx hardhat forge:deploy --diamond ExampleDiamond

# 3. Run Forge tests
npx hardhat forge:fuzz --diamond ExampleDiamond

# Or use yarn shortcuts
yarn forge:deploy
yarn forge:fuzz
```

### Expected Output

**Deploy Command**:

```
🚀 Deploying Diamond: ExampleDiamond
   Network: localhost
   Chain ID: 31337

✅ Diamond deployed successfully!
   Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3

📝 Generating Solidity helper library...
   Output: test/foundry/helpers/DiamondDeployment.sol
   Facets: 5
   Selectors: 23

✅ Setup complete! Ready for Forge testing.
```

**Fuzz Command**:

```
Running 36 tests for test/foundry/fuzz/ExampleDiamondAccessControl.t.sol
[PASS] testFuzz_GrantRole(address,uint8) (runs: 256, μ: 89234, ~: 89234)
[PASS] testFuzz_RevokeRole(address,uint8) (runs: 256, μ: 91456, ~: 91456)
...
Test result: ok. 36 passed; 0 failed; 0 skipped; finished in 12.34s
```

---

## Workflow

### Complete Deployment and Testing Flow

#### Step 1: Deploy Diamond

```bash
npx hardhat forge:deploy --diamond ExampleDiamond --targetNetwork localhost
```

**What happens**:

1. Creates `ForgeFuzzingFramework` instance
2. Configures `LocalDiamondDeployer` with:
   - `diamondName: "ExampleDiamond"`
   - `networkName: "localhost"`
   - `chainId: 31337`
   - `writeDeployedDiamondData: true`
3. Deploys Diamond contract to network
4. Writes deployment record to `diamonds/ExampleDiamond/deployments/examplediamond-localhost-31337.json`
5. Generates `test/foundry/helpers/DiamondDeployment.sol` library
6. Displays deployment summary

**Deployment Record Format**:

```json
{
  "DiamondAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "protocolVersion": 0,
  "DeployedFacets": {
    "ExampleOwnershipFacet": {
      "address": "0x...",
      "funcSelectors": ["0x8da5cb5b", "0xf2fde38b"]
    },
    "ExampleAccessControl": {
      "address": "0x...",
      "funcSelectors": ["0x2f2ff15d", "0x91d14854", "0xd547741f"]
    }
  }
}
```

#### Step 2: Generate Helpers (Optional)

```bash
npx hardhat forge:generate-helpers --diamond ExampleDiamond --targetNetwork localhost
```

**When to use**:

- After manual changes to deployment record
- To regenerate library with updated comments
- For debugging library generation

**What happens**:

1. Reads deployment record from `diamonds/ExampleDiamond/deployments/`
2. Parses facet addresses and selectors
3. Generates Solidity library code
4. Writes to `test/foundry/helpers/DiamondDeployment.sol`

#### Step 3: Run Tests

```bash
npx hardhat forge:fuzz --diamond ExampleDiamond --targetNetwork localhost
```

**What happens**:

1. Validates deployment exists
2. Optionally deploys if missing (with `--force-deploy`)
3. Executes `forge test` with configured parameters
4. Displays test results

**Test Execution Order**:

1. Fuzz tests (`test/foundry/fuzz/*.t.sol`)
2. Integration tests (`test/foundry/integration/*.t.sol`)
3. Invariant tests (`test/foundry/invariant/*.t.sol`)

---

## Task Reference

### `forge:deploy`

Deploy Diamond and generate helper library.

**Syntax**:

```bash
npx hardhat forge:deploy [options]
```

**Options**:

- `--diamond <name>` - Diamond name (default: "ExampleDiamond")
- `--targetNetwork <network>` - Network name (default: "localhost")
  - Options: `localhost`, `hardhat`, `anvil`
- `--force-deploy` - Force redeployment even if exists

**Examples**:

```bash
# Basic deployment
npx hardhat forge:deploy

# Deploy to Anvil
npx hardhat forge:deploy --targetNetwork anvil

# Force redeploy
npx hardhat forge:deploy --force-deploy

# Custom Diamond
npx hardhat forge:deploy --diamond MyDiamond --targetNetwork localhost
```

**Output Files**:

- `diamonds/{DiamondName}/deployments/{name}-{network}-{chainId}.json` - Deployment record
- `test/foundry/helpers/DiamondDeployment.sol` - Generated library

### `forge:generate-helpers`

Regenerate helper library from existing deployment.

**Syntax**:

```bash
npx hardhat forge:generate-helpers [options]
```

**Options**:

- `--diamond <name>` - Diamond name (default: "ExampleDiamond")
- `--targetNetwork <network>` - Network name (default: "localhost")

**Examples**:

```bash
# Regenerate for ExampleDiamond
npx hardhat forge:generate-helpers

# Regenerate for custom network
npx hardhat forge:generate-helpers --targetNetwork anvil
```

**Use Cases**:

- Update library after modifying deployment record
- Regenerate after Diamond upgrade
- Fix library generation issues

### `forge:fuzz`

Run Forge tests with optional deployment.

**Syntax**:

```bash
npx hardhat forge:fuzz [options]
```

**Options**:

- `--diamond <name>` - Diamond name (default: "ExampleDiamond")
- `--targetNetwork <network>` - Network name (default: "localhost")
- `--match-test <pattern>` - Filter tests by name pattern
- `--force-deploy` - Deploy before testing

**Examples**:

```bash
# Run all tests
npx hardhat forge:fuzz

# Run specific test pattern
npx hardhat forge:fuzz --match-test testFuzz_GrantRole

# Run with fresh deployment
npx hardhat forge:fuzz --force-deploy

# Run on Anvil network
npx hardhat forge:fuzz --targetNetwork anvil
```

**Forge Test Options** (passed through):

- Verbosity controlled by `forgeOptions.verbosity` in config
- Default: `-vv` (medium verbosity)
- Runs and depth from `foundry.toml` or `ExampleDiamond.forge.config.json`

---

## Writing Tests

### Test Structure

```
test/foundry/
├── helpers/
│   ├── DiamondDeployment.sol      # Auto-generated (DO NOT EDIT)
│   ├── DiamondFuzzBase.sol        # Base contract for tests
│   └── DiamondABILoader.sol       # ABI parsing utilities
├── fuzz/
│   ├── ExampleDiamondAccessControl.t.sol
│   └── ExampleDiamondOwnership.t.sol
├── integration/
│   └── ExampleDiamondIntegrationDeployed.t.sol
├── invariant/
│   └── DiamondProxyInvariant.t.sol
└── ExampleDiamond.forge.config.json
```

### Basic Fuzz Test Pattern

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../helpers/DiamondFuzzBase.sol";

contract MyDiamondFuzzTest is DiamondFuzzBase {

    function setUp() public override {
        super.setUp(); // Loads Diamond address and ABI

        // Your setup code here
    }

    /// @notice Fuzz test with random inputs
    /// @param user Random address
    /// @param amount Random uint256
    function testFuzz_MyFunction(address user, uint256 amount) public {
        // Constrain inputs to valid ranges
        vm.assume(user != address(0));
        vm.assume(amount > 0 && amount < 1e18);

        // Call Diamond function
        bytes4 selector = bytes4(keccak256("myFunction(address,uint256)"));
        bytes memory data = abi.encode(user, amount);
        (bool success, bytes memory returnData) = _callDiamond(selector, data);

        // Assertions
        assertTrue(success, "Call should succeed");

        // Verify state changes
        // ...
    }
}
```

### Integration Test Pattern

```solidity
contract MyIntegrationTest is DiamondFuzzBase {

    function test_CompleteWorkflow() public {
        // 1. Verify Diamond deployment
        assertTrue(diamond != address(0));

        // 2. Get initial state
        address owner = _getDiamondOwner();

        // 3. Perform operations
        vm.prank(owner);
        bytes4 selector = bytes4(keccak256("someFunction()"));
        (bool success,) = _callDiamond(selector, "");
        assertTrue(success);

        // 4. Verify all facets accessible
        bytes4[] memory selectors = _getDiamondSelectors();
        for (uint256 i = 0; i < selectors.length; i++) {
            address facetAddr = _verifyFacetRouting(selectors[i], address(0));
            assertTrue(facetAddr != address(0));
        }
    }
}
```

### Invariant Test Pattern

```solidity
contract MyInvariantTest is DiamondFuzzBase {

    /// @notice Invariant: Diamond must always have code
    function invariant_DiamondExists() public view {
        assertTrue(diamond != address(0));
        assertTrue(diamond.code.length > 0);
    }

    /// @notice Invariant: Owner must always be valid
    function invariant_OwnerValid() public view {
        address owner = _getDiamondOwner();
        assertTrue(owner != address(0));
    }
}
```

### Using DiamondDeployment Library

The auto-generated library provides direct access to deployment data:

```solidity
import "@helpers/DiamondDeployment.sol";

contract MyTest is DiamondFuzzBase {

    function test_UsingLibrary() public view {
        // Get Diamond address
        address diamondAddr = DiamondDeployment.getDiamondAddress();

        // Get facet address by name
        address ownershipFacet = DiamondDeployment.getFacetAddress("ExampleOwnershipFacet");

        // Get selector (if implemented)
        bytes4 selector = DiamondDeployment.getSelector("ExampleOwnershipFacet", "owner");
    }
}
```

### Helper Functions Reference

#### From DiamondFuzzBase

**Diamond Interaction**:

```solidity
// Low-level call
(bool success, bytes memory data) = _callDiamond(selector, encodedArgs);

// Call with value (payable)
(bool success, bytes memory data) = _callDiamondWithValue(selector, encodedArgs, 1 ether);

// Expect revert
_expectDiamondRevert(selector, encodedArgs, expectedError);
```

**State Queries**:

```solidity
// Get owner
address owner = _getDiamondOwner();

// Check role
bool hasRole = _hasRole(ADMIN_ROLE, account);

// Get all selectors
bytes4[] memory selectors = _getDiamondSelectors();
```

**Access Control**:

```solidity
// Grant role (as admin)
vm.prank(admin);
_grantRole(MINTER_ROLE, account);

// Revoke role
vm.prank(admin);
_revokeRole(MINTER_ROLE, account);
```

**Facet Verification**:

```solidity
// Verify selector routes to facet
address facet = _verifyFacetRouting(selector, expectedFacet);

// Measure gas
uint256 gas = _measureDiamondGas(selector, encodedArgs);
```

---

## Network Options

### Hardhat Node (Default)

**Start**:

```bash
npx hardhat node
```

**Configuration**:

- Default RPC: `http://127.0.0.1:8545`
- Chain ID: 31337
- Pre-funded accounts
- Deterministic addresses

**Usage**:

```bash
npx hardhat forge:deploy --targetNetwork localhost
```

### Anvil

**Start**:

```bash
anvil
```

**Configuration**:

- Default RPC: `http://127.0.0.1:8545`
- Chain ID: 31337 (configurable)
- Faster block times
- Advanced forking features

**Usage**:

```bash
npx hardhat forge:deploy --targetNetwork anvil
```

### Network Selection

The framework automatically configures RPC URLs:

| Network   | RPC URL               | Chain ID |
| --------- | --------------------- | -------- |
| localhost | http://127.0.0.1:8545 | 31337    |
| hardhat   | http://127.0.0.1:8545 | 31337    |
| anvil     | http://127.0.0.1:8545 | 31337    |

**Custom RPC** (in `ForgeFuzzConfig`):

```typescript
const config: ForgeFuzzConfig = {
  diamondName: "ExampleDiamond",
  networkName: "localhost",
  rpcUrl: "http://localhost:9545", // Custom port
  // ...
};
```

---

## Reusability

### Copying to New Diamond Project

The framework is designed to be portable. Follow these steps to use it in a new project:

#### 1. Copy Framework Files

```bash
# Core framework
cp -r scripts/setup/ForgeFuzzingFramework.ts your-project/scripts/setup/
cp -r scripts/utils/forgeHelpers.ts your-project/scripts/utils/

# Hardhat tasks
cp tasks/forge.ts your-project/tasks/

# Test helpers
cp -r test/foundry/helpers/ your-project/test/foundry/

# Test templates (optional)
cp -r test/foundry/fuzz/ your-project/test/foundry/
cp -r test/foundry/integration/ your-project/test/foundry/
cp -r test/foundry/invariant/ your-project/test/foundry/
```

#### 2. Update Hardhat Config

```typescript
// hardhat.config.ts
import "./tasks/forge";

// Ensure Diamond configuration exists
export default {
  // ... your config
};
```

#### 3. Create Diamond Config

```bash
mkdir -p diamonds/YourDiamond
```

Create `diamonds/YourDiamond/yourdiamond.config.json`:

```json
{
  "diamondName": "YourDiamond",
  "facets": [
    {
      "name": "YourFacet",
      "contract": "YourFacet"
    }
  ]
}
```

#### 4. Update Foundry Config

Add to `foundry.toml`:

```toml
[profile.default]
# ... existing config

# Add remapping for helpers
remappings = [
    "@helpers/=test/foundry/helpers/",
    # ... other remappings
]
```

#### 5. Customize Tests

```bash
# Rename test contracts
mv test/foundry/fuzz/ExampleDiamondAccessControl.t.sol \
   test/foundry/fuzz/YourDiamondAccessControl.t.sol

# Update contract names and test logic
```

#### 6. Update Package Scripts

```json
{
  "scripts": {
    "forge:deploy": "npx hardhat forge:deploy --diamond YourDiamond",
    "forge:fuzz": "npx hardhat forge:fuzz --diamond YourDiamond",
    "forge:generate-helpers": "npx hardhat forge:generate-helpers --diamond YourDiamond"
  }
}
```

#### 7. Deploy and Test

```bash
# Start network
npx hardhat node

# Deploy and test
yarn forge:deploy
yarn forge:fuzz
```

### Framework Checklist

- [ ] `ForgeFuzzingFramework.ts` copied
- [ ] `forgeHelpers.ts` copied
- [ ] `tasks/forge.ts` copied and registered
- [ ] `DiamondFuzzBase.sol` copied
- [ ] Diamond config created
- [ ] `foundry.toml` updated with `@helpers/` remapping
- [ ] `.gitignore` includes `test/foundry/helpers/DiamondDeployment.sol`
- [ ] Package scripts updated
- [ ] Tests customized for your Diamond

---

## Troubleshooting

### Common Issues

#### 1. "Diamond not deployed" Error

**Symptoms**:

```
Error: Diamond deployment not found
```

**Solutions**:

```bash
# Check deployment exists
ls diamonds/ExampleDiamond/deployments/

# Deploy if missing
npx hardhat forge:deploy --diamond ExampleDiamond

# Force redeploy
npx hardhat forge:deploy --force-deploy
```

#### 2. "DiamondDeployment library not found" Error

**Symptoms**:

```
Error: Could not find DiamondDeployment
```

**Solutions**:

```bash
# Check library exists
ls test/foundry/helpers/DiamondDeployment.sol

# Regenerate library
npx hardhat forge:generate-helpers --diamond ExampleDiamond

# Verify remapping in foundry.toml
grep "@helpers/" foundry.toml
```

#### 3. Network Connection Issues

**Symptoms**:

```
Error: Could not connect to RPC
Error: ECONNREFUSED 127.0.0.1:8545
```

**Solutions**:

```bash
# Ensure network is running
curl -X POST http://127.0.0.1:8545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Start Hardhat node
npx hardhat node

# Or start Anvil
anvil

# Check correct port
netstat -an | grep 8545
```

#### 4. Test Failures After Deployment Changes

**Symptoms**:

```
[FAIL] Test fails with outdated addresses
```

**Solutions**:

```bash
# Regenerate helper library
npx hardhat forge:generate-helpers

# Force redeploy and regenerate
npx hardhat forge:deploy --force-deploy

# Clear Forge cache
forge clean
```

#### 5. Import Resolution Issues

**Symptoms**:

```
Error: Could not resolve "@helpers/DiamondDeployment.sol"
```

**Solutions**:

```bash
# Check foundry.toml remappings
cat foundry.toml | grep remappings

# Ensure correct format
# remappings = [
#     "@helpers/=test/foundry/helpers/",
# ]

# Rebuild
forge build --force
```

#### 6. Gas Limit Exceeded

**Symptoms**:

```
[FAIL] OutOfGas
```

**Solutions**:

```toml
# In foundry.toml, increase gas limits
[profile.default]
gas_limit = 30000000  # Increase if needed
```

#### 7. Selector Collision

**Symptoms**:

```
Error: Function selector collision
```

**Solutions**:

- Check facet functions for duplicate names
- Verify Diamond deployment is clean
- Review DiamondCut operations

### Debugging Tips

#### Enable Verbose Logging

```bash
# Forge tests with max verbosity
forge test -vvvv

# Hardhat task debugging
DEBUG=ForgeFuzzingFramework npx hardhat forge:deploy
```

#### Check Deployment State

```bash
# View deployment record
cat diamonds/ExampleDiamond/deployments/examplediamond-localhost-31337.json | jq

# Verify Diamond on-chain
cast code <diamond-address> --rpc-url http://127.0.0.1:8545
```

#### Validate Helper Library

```bash
# Check generated library
cat test/foundry/helpers/DiamondDeployment.sol

# Verify it compiles
forge build
```

#### Test Individual Functions

```bash
# Run single test
forge test --match-test testFuzz_GrantRole -vvv

# Run single contract
forge test --match-contract ExampleDiamondAccessControl -vv
```

---

## Advanced Usage

### Custom Forge Options

Configure Forge behavior in `ForgeFuzzConfig`:

```typescript
const config: ForgeFuzzConfig = {
  diamondName: "ExampleDiamond",
  networkName: "localhost",
  forgeOptions: {
    workers: 8, // Parallel test workers
    testLimit: 1000, // Max tests per fuzz function
    timeout: 300, // Test timeout in seconds
    matchTest: "testFuzz_", // Test name filter
    verbosity: 3, // Logging level (1-4)
  },
  // ...
};
```

### Programmatic Usage

Use the framework directly in scripts:

```typescript
import { ForgeFuzzingFramework } from "./scripts/setup/ForgeFuzzingFramework";
import { ethers } from "hardhat";

async function deployAndTest() {
  const network = await ethers.provider.getNetwork();

  const config = {
    diamondName: "ExampleDiamond",
    networkName: "localhost",
    provider: ethers.provider,
    chainId: Number(network.chainId),
    configFilePath: "diamonds/ExampleDiamond/examplediamond.config.json",
    writeDeployedDiamondData: true,
  };

  const framework = await ForgeFuzzingFramework.getInstance(config);

  // Deploy
  await framework.deployDiamond();

  // Generate helpers
  await framework.generateHelperLibrary();

  // Run tests
  await framework.runForgeTests();
}

deployAndTest().catch(console.error);
```

### CI/CD Integration

#### GitHub Actions Example

```yaml
name: Forge Fuzzing Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1

      - name: Install Dependencies
        run: yarn install --frozen-lockfile

      - name: Start Hardhat Node
        run: |
          npx hardhat node &
          sleep 5

      - name: Deploy Diamond
        run: yarn forge:deploy

      - name: Run Forge Tests
        run: yarn forge:fuzz
```

### Custom Test Helpers

Extend `DiamondFuzzBase` with project-specific helpers:

```solidity
abstract contract MyProjectFuzzBase is DiamondFuzzBase {

    // Custom role constants
    bytes32 constant MY_ADMIN_ROLE = keccak256("MY_ADMIN_ROLE");

    // Custom helper
    function _setupAdminRole(address admin) internal {
        vm.prank(_getDiamondOwner());
        _grantRole(MY_ADMIN_ROLE, admin);
    }

    // Custom assertion
    function _assertDiamondState(uint256 expectedValue) internal view {
        // Your custom logic
    }
}
```

### Multi-Diamond Testing

Test multiple Diamonds in one suite:

```typescript
const diamonds = ["DiamondA", "DiamondB"];

for (const diamondName of diamonds) {
  const framework = await ForgeFuzzingFramework.getInstance({
    diamondName,
    // ... config
  });

  await framework.deployDiamond();
  await framework.generateHelperLibrary();
}
```

---

## Best Practices

### 1. **Always Use vm.assume() in Fuzz Tests**

```solidity
function testFuzz_Transfer(address user, uint256 amount) public {
    // Constrain inputs to valid ranges
    vm.assume(user != address(0));
    vm.assume(amount > 0 && amount <= MAX_AMOUNT);
    vm.assume(user.code.length == 0); // Not a contract

    // Test logic
}
```

### 2. **Organize Tests by Category**

```
fuzz/         # Property-based tests with random inputs
integration/  # End-to-end workflow tests
invariant/    # State invariant tests
unit/         # Specific function tests (if needed)
```

### 3. **Use Descriptive Test Names**

```solidity
// Good
function testFuzz_GrantRole_RevertsForUnauthorized(address user) public

// Bad
function test1(address a) public
```

### 4. **Document Expected Behavior**

```solidity
/// @notice Fuzz test: ownership transfer should fail for zero address
/// @dev Verifies that transferOwnership(address(0)) always reverts
function testFuzz_TransferOwnership_RevertsForZeroAddress() public
```

### 5. **Clean Up After Tests**

```solidity
function testFuzz_Something(address user) public {
    // ... test logic

    // Restore original owner if changed
    vm.prank(newOwner);
    _callDiamond(transferOwnershipSelector, abi.encode(originalOwner));
}
```

### 6. **Use Gas Snapshots**

```bash
# Create gas snapshot
forge snapshot

# Compare against snapshot
forge test --gas-report
```

### 7. **Keep Helper Library in .gitignore**

```gitignore
# Auto-generated - do not commit
test/foundry/helpers/DiamondDeployment.sol
```

### 8. **Version Control Deployment Records**

```bash
# Commit deployment records for production networks
git add diamonds/ExampleDiamond/deployments/examplediamond-mainnet-1.json

# Ignore local test deployments
echo "diamonds/*/deployments/*-localhost-*.json" >> .gitignore
echo "diamonds/*/deployments/*-hardhat-*.json" >> .gitignore
```

---

## Additional Resources

### Documentation

- [Foundry Book](https://book.getfoundry.sh/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [ERC-2535 Diamond Standard](https://eips.ethereum.org/EIPS/eip-2535)
- [Diamonds Module Documentation](../packages/diamonds/README.md)

### Related Guides

- [FOUNDRY_GUIDE.md](./FOUNDRY_GUIDE.md) - Foundry setup and basics
- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Project structure
- [FOUNDRY_QUICK_REFERENCE.md](./FOUNDRY_QUICK_REFERENCE.md) - Command reference

### Test Examples

- `test/foundry/fuzz/ExampleDiamondAccessControl.t.sol` - Access control fuzzing
- `test/foundry/fuzz/ExampleDiamondOwnership.t.sol` - Ownership fuzzing
- `test/foundry/integration/ExampleDiamondIntegrationDeployed.t.sol` - Integration patterns
- `test/foundry/invariant/DiamondProxyInvariant.t.sol` - Invariant patterns

---

## Summary

The Forge Fuzzing Framework provides:

✅ **Seamless Integration** - Leverages existing Diamond deployment infrastructure  
✅ **Auto-Generated Helpers** - No manual artifact management  
✅ **Comprehensive Tests** - Fuzz, integration, and invariant patterns  
✅ **Multi-Network Support** - Works with Hardhat node and Anvil  
✅ **Reusable Architecture** - Easy to adapt to new projects  
✅ **Production Ready** - Tested with ExampleDiamond

**Key Workflow**:

```bash
npx hardhat forge:deploy    # Deploy Diamond + generate helpers
npx hardhat forge:fuzz      # Run comprehensive test suite
```

For questions or issues, refer to the [Troubleshooting](#troubleshooting) section or check the example tests in `test/foundry/`.
