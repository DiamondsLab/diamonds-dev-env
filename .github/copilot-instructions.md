# AI Coding Agent Instructions

## Project Architecture

This is a **Yarn Workspaces monorepo** for developing ERC-2535 Diamond Proxy smart contracts and associated tooling. The project combines Hardhat and Foundry testing frameworks with custom deployment strategies.

### Key Components

- **`packages/diamonds/`** - Core Diamond deployment library (git submodule)
- **`packages/hardhat-diamonds/`** - Hardhat plugin for Diamond configuration, ABI generation, and `LocalDiamondDeployer` (git submodule)
- **`packages/diamonds-hardhat-foundry/`** - Foundry integration for testing Diamond contracts (git submodule)
- **`packages/diamonds-monitor/`** - Diamond contract monitoring and analytics (git submodule)
- **`packages/hardhat-multichain/`** - Multi-chain deployment utilities (git submodule)
- **`contracts/examplediamond/`** - Example Diamond contract with facets
- **`diamonds/ExampleDiamond/`** - Deployment configs, records, and callbacks per Diamond
- **`test/`** - Hardhat tests (unit, integration, deployment, fuzzing)
- **`test/foundry/`** - Forge tests with generated helpers

### Diamond Deployment Flow

1. **Configuration**: Each Diamond has a `<diamondname>.config.json` in `diamonds/<DiamondName>/`
2. **Deployment Strategy**: Uses Strategy Pattern - base deployment + extensions (RPC, Defender)
3. **Deployment Records**: Saved as `<diamondname>-<chainname>-<chainId>.json` with addresses, facet selectors, and transaction IDs
4. **LocalDiamondDeployer**: Singleton class from `@diamondslab/hardhat-diamonds/dist/utils` for local/fork deployments
   - **Critical**: Must pass `hre` as first parameter to `getInstance(hre, config)` to avoid HH9 circular dependency
5. **Diamond ABI**: Combined ABI generated in `diamond-abi/` directory, used for TypeChain type generation in `diamond-typechain-types/`

### TypeScript Module Strategy

The project uses **CommonJS** (`module: "NodeNext"`) due to Hardhat's `ts-node` loader requirements. Hardhat tasks execute TypeScript directly - **no compilation needed** for normal development. Static imports use no extensions: `import "./scripts/tasks/forge"`. See [BUILD_AND_DEPLOYMENT.md](../docs/BUILD_AND_DEPLOYMENT.md) for details.

## Critical Developer Workflows

### Building and Testing

```bash
# Build all workspace packages
yarn workspace:build

# Compile contracts + generate Diamond ABI + TypeChain types
yarn compile

# Run all Hardhat tests (uses hardhat-multichain for multi-network testing)
yarn test

# Run specific test file
yarn test test/deployment/DiamondDeployment.test.ts

# Run Foundry tests
yarn forge:test

# Run both frameworks
yarn test:all
```

### Diamond ABI Generation

Always regenerate after changing facet configurations:

```bash
yarn diamond:generate-abi-typechain
# OR
npx hardhat diamond:generate-abi-typechain --diamond-name ExampleDiamond
```

This creates:

- `diamond-abi/ExampleDiamond.json` - Combined ABI
- `diamond-typechain-types/ExampleDiamond.ts` - Type-safe contract interface

### Foundry Integration Workflow

```bash
# Deploy Diamond to Hardhat node and generate helpers
npx hardhat diamonds-forge:deploy --diamond-name ExampleDiamond --network localhost

# Generates: test/foundry/helpers/DiamondDeployment.sol with addresses
# Then run Forge tests:
npx hardhat diamonds-forge:test --diamond-name ExampleDiamond
```

### Working with Workspace Packages

```bash
# Build specific package
yarn workspace @diamondslab/hardhat-diamonds build

# Run package tests
yarn workspace @diamondslab/hardhat-diamonds test

# All workspace commands from package.json
yarn hardhat-diamonds:build
yarn hardhat-diamonds:test
```

## Project-Specific Patterns

### LocalDiamondDeployer Usage

```typescript
import {
  LocalDiamondDeployer,
  LocalDiamondDeployerConfig,
} from "@diamondslab/hardhat-diamonds/dist/utils";
import hre from "hardhat";

const config: LocalDiamondDeployerConfig = {
  diamondName: "ExampleDiamond",
  networkName: "hardhat",
  provider: provider,
  chainId: (await provider.getNetwork()).chainId,
  writeDeployedDiamondData: false,
  configFilePath: "diamonds/ExampleDiamond/examplediamond.config.json",
};

// CRITICAL: Pass hre as first parameter to avoid HH9 circular dependency
const deployer = await LocalDiamondDeployer.getInstance(hre, config);
const diamond = await deployer.getDiamondDeployed();
```

### Loading Deployed Diamonds

```typescript
import { loadDiamondContract } from "@diamondslab/hardhat-diamonds/dist/lib";
import { ExampleDiamond } from "../../diamond-typechain-types";
import hre from "hardhat";

const deployedData = diamond.getDeployedDiamondData();
const exampleDiamond = await loadDiamondContract<ExampleDiamond>(
  diamond,
  deployedData.DiamondAddress ?? "",
  hre.ethers,
);
```

### Test Structure Pattern

All tests follow this consistent structure:

1. **Network loop**: Tests run on each configured network via hardhat-multichain
2. **Singleton/Multiton deployment**: One Diamond deployment per network
3. **`before` hooks**: Set up accounts and signed contracts
4. **`beforeEach` hooks**: Test isolation (snapshots/reverts)
5. **Assertions**: Chai `expect` for contract state and events

See [test/README.md](test/README.md) for full patterns.

### Hardhat Configuration

Configure Diamond paths in `hardhat.config.ts`:

```typescript
diamonds: {
  paths: {
    ExampleDiamond: {
      deploymentsPath: 'diamonds',
      contractsPath: 'contracts/examplediamond',
    },
  },
},
```

Access via HRE: `hre.config.diamonds.paths.ExampleDiamond`

## Code Quality Standards

- **ESLint**: Custom Diamond-specific security rules in `eslint-diamond-rules.js`
- **Security Scanning**: Run `yarn security-check` (includes Slither, Semgrep, OSV, Socket, Snyk)
- **Formatting**: Prettier enforced via `yarn format`
- **TypeScript**: Strict mode enabled - no `any` without warnings
- **Commit Conventions**: Conventional Commits enforced via Commitlint

## DevContainer Environment

This project uses a DevContainer with pre-configured security tools (Medusa, Echidna, Vyper, etc.). See [.devcontainer/README.md](.devcontainer/README.md). Cross-architecture support for ARM64/M1/M2 via QEMU.

## Common Gotchas

1. **Import paths for LocalDiamondDeployer**: Always use `@diamondslab/hardhat-diamonds/dist/utils`, not `@diamondslab/hardhat-diamonds` (prevents HH9 error)
2. **Diamond ABI regeneration**: Must run after any facet configuration changes or tests will use stale ABIs
3. **TypeChain types**: Generated in TWO directories: `typechain-types/` (contracts) and `diamond-typechain-types/` (Diamond ABIs)
4. **Git submodules**: Workspace packages are submodules - update with `git submodule update --remote`
5. **Deployment records**: Never commit deployment records with real private keys - they're in `.gitignore`

## Key Documentation

- [PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) - Architecture deep dive
- [BUILD_AND_DEPLOYMENT.md](docs/BUILD_AND_DEPLOYMENT.md) - TypeScript module strategy
- [FOUNDRY_GUIDE.md](docs/FOUNDRY_GUIDE.md) - Foundry integration details
- [MEDUSA_FUZZING_GUIDE.md](docs/MEDUSA_FUZZING_GUIDE.md) - Medusa fuzzing setup
- [packages/hardhat-diamonds/README.md](packages/hardhat-diamonds/README.md) - Hardhat plugin usage
- [packages/diamonds-hardhat-foundry/README.md](packages/diamonds-hardhat-foundry/README.md) - Foundry tasks and helpers
