# Diamonds Development Environment

Professional development environment for the `Diamonds` node modules, associated hardhat node modules, and the DevContainer.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-FFDB1C.svg)](https://hardhat.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-%23363636.svg?logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Yarn](https://img.shields.io/badge/Yarn-2C8EBB?logo=yarn&logoColor=white)](https://yarnpkg.com/)

## �️ Project Structure

This repository serves as a professional development environment for building, testing, and deploying the `Diamonds` node modules, associated hardhat node modules, and the DevContainer.

```bash
diamonds-dev-env/
├── .devcontainer/                 # DevContainer configuration
├── .husky/                 # DevContainer configuration
├── .vscode/                       # VSCode workspace settings
├── packages/
|   └── diamonds/                  # Diamonds Main NPM package
|   └── hardhat-diamonds-monitor/  # Diamonds monitoring NPM package
│   └── hardhat-diamonds/          # Hardhat Diamonds NPM package
│       ├── src/                   # TypeScript source code
│       ├── dist/                  # Compiled output
│       ├── coverage/              # Test coverage reports
│       └── package.json           # Package configuration
├── contracts/                     # Diamond proxy contracts
├── test/                          # Contract tests
├── scripts/                       # Development scripts
├── deployments/                   # Deployment artifacts
```

## 🌟 Features

### Development Environment

- **🏗️ Yarn Workspaces**: Monorepo structure for managing multiple packages
- **🧪 Comprehensive Testing**: Unit tests, integration tests, fuzz tests, and coverage reporting
- **🔍 Advanced Fuzzing**: Medusa and Forge fuzzing frameworks for comprehensive security testing
- **🛠️ TypeScript Support**: Full type safety with modern TypeScript features
- **📋 Code Quality**: ESLint, Prettier, and Husky for code formatting and git hooks
- **🚀 CI/CD Pipeline**: Automated testing, building, and publishing via GitHub Actions
- **📦 Professional Packaging**: Ready for NPM publication with proper versioning

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18.0.0
- Yarn ≥ 4.0.0
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd diamonds-dev-env

# Install all dependencies
yarn install

# Build all packages
yarn workspace:build
```

### Development

```bash
# Start development mode (watches for changes)
yarn dev

# Build the hardhat-diamonds package
yarn hardhat-diamonds:build

# Run hardhat-diamonds tests
yarn hardhat-diamonds:test

# Run hardhat-diamonds with coverage
yarn workspace hardhat-diamonds run test:coverage

# Lint all code
yarn lint

# Format all code
yarn format

# Clean all build artifacts
yarn workspace:clean
```

### TypeScript Build Process

```bash
# Build TypeScript to JavaScript
yarn tsc

# Build and deploy task files (required for Hardhat tasks)
yarn tsc && cp dist/scripts/setup/*.js scripts/setup/ && cp dist/scripts/utils/*.js scripts/utils/
```

**Important**: Hardhat tasks use dynamic imports that require compiled `.js` files. After modifying TypeScript files in `scripts/`, you must rebuild and copy the compiled files. See [docs/BUILD_AND_DEPLOYMENT.md](docs/BUILD_AND_DEPLOYMENT.md) for details.

### Contract Compilation, Diamond-ABI and Typechain Generation

```bash
# Compile contracts
yarn compile

# Run contract tests
yarn test

# Generate diamond ABI
yarn generate-diamond-abi

# Generate diamond ABI with TypeChain types
yarn generate-diamond-abi-typechain
```

## 📦 Package Management

### Working with the Hardhat Diamonds Package

```bash
# Install package dependencies
yarn workspace hardhat-diamonds install

# Build the package
yarn workspace hardhat-diamonds run build

# Run package tests
yarn workspace hardhat-diamonds run test

# Run package linting
yarn workspace hardhat-diamonds run lint

# Watch mode for development
yarn workspace hardhat-diamonds run build:watch
```

### Publishing

The package is automatically published to NPM when changes are pushed to the main branch, provided the version has been updated.

```bash
# Manual publishing (from package directory)
cd packages/hardhat-diamonds
npm publish

# Beta release
npm publish --tag beta
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# RPC endpoints
MAINNET_RPC_URL=your_mainnet_rpc_url
GOERLI_RPC_URL=your_goerli_rpc_url
SEPOLIA_RPC_URL=your_sepolia_rpc_url

# Hardhat Private key for Account 0
TEST_PRIVATE_KEY=your_private_key

# API keys
ETHERSCAN_API_KEY=your_etherscan_api_key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
```

### Workspace Configuration

The project uses Yarn workspaces to manage multiple packages. Configuration is in:

- `package.json` - Root workspace configuration
- `packages/hardhat-diamonds/package.json` - Package-specific configuration
- `tsconfig.json` - TypeScript configuration with project references
- `.yarnrc.yml` - Yarn configuration

## 🧪 Testing

### Running Tests

```bash
# Run all tests
yarn workspace:test

# Run specific package tests
yarn monitor:test

# Run with coverage
yarn workspace hardhat-diamonds run test:coverage

# Run tests in watch mode
yarn workspace hardhat-diamonds run test:watch
```

### Test Structure

- Unit tests: `packages/hardhat-diamonds/src/__tests__/`
- Integration tests: `test/integration/`
- Contract tests: `test/`
- **Fuzzing tests**: `test/fuzzing/` - Medusa fuzzing configurations and generated tests
- **Forge tests**: `test/foundry/` - Foundry fuzz, integration, and invariant tests

### Fuzzing with Medusa

Run fuzzing tests on Diamond contracts using Medusa (Trail of Bits):

```bash
# Prerequisites: Install dependencies (if not in DevContainer)
pipx install solc-select crytic-compile
solc-select install 0.8.19 && solc-select use 0.8.19

# Run fuzzing campaign on ExampleDiamond
npx hardhat medusa:fuzz --diamond ExampleDiamond

# Custom workers and test limits
npx hardhat medusa:fuzz --diamond ExampleDiamond --workers 4 --limit 10000

# With timeout (in seconds)
npx hardhat medusa:fuzz --diamond ExampleDiamond --timeout 300
```

**Note**: Medusa uses its own EVM and cannot fork from Hardhat node. Best for testing self-contained contract logic.

See [docs/MEDUSA_FUZZING_GUIDE.md](docs/MEDUSA_FUZZING_GUIDE.md) for comprehensive Medusa fuzzing documentation.

### Fuzzing with Forge

Run Foundry-based fuzz, integration, and invariant tests with chain forking:

```bash
# Prerequisites: Start Hardhat node
npx hardhat node  # In separate terminal

# Deploy Diamond and generate helper library
npx hardhat forge:deploy --diamond ExampleDiamond --network localhost

# Run all Forge tests with forking (fuzz + integration + invariant)
npx hardhat forge:fuzz --diamond ExampleDiamond --network localhost

# Generate Solidity helpers from existing deployment
npx hardhat forge:generate-helpers --diamond ExampleDiamond --network localhost

# Or run directly with Forge (after deployment)
forge test --fork-url http://127.0.0.1:8545 -vv
```

Forge fuzzing supports testing against deployed state via chain forking, making it ideal for integration testing.

See [docs/FORGE_FUZZING_GUIDE.md](docs/FORGE_FUZZING_GUIDE.md) for comprehensive Forge fuzzing documentation.

## 📋 Code Quality

### Linting and Formatting

```bash
# Lint all code
yarn lint

# Format all code
yarn format

# Check formatting
yarn format --check
```

### Git Hooks

Husky is configured to run checks before commits:

- **pre-commit**: Runs lint-staged to format and lint staged files
- **pre-push**: Runs tests to ensure code quality

## 🚀 CI/CD

GitHub Actions workflows are configured for:

### CI Pipeline (`ci.yml`)

- **Testing**: Runs on Node.js 18.x and 20.x
- **Linting**: ESLint and Prettier checks
- **Building**: Compiles TypeScript and contracts
- **Coverage**: Uploads coverage reports to Codecov

### Publishing Pipeline

- **Automatic**: Publishes to NPM on main branch pushes (when version changes)
- **Beta**: Supports beta releases with `--tag beta`

## 📖 API Documentation

### Diamonds Monitor Package

The `hardhat-diamonds` package provides comprehensive tools for monitoring ERC-2535 Diamond Proxy contracts. See the [package README](./packages/hardhat-diamonds/README.md) for detailed API documentation.

Key classes:

- `DiamondMonitor` - Main monitoring functionality
- `FacetManager` - Facet management tools
- Utility functions for diamond development

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Maintain 80%+ test coverage
- Use conventional commit messages
- Ensure all CI checks pass

## 📋 Scripts Reference

### Root Level Scripts

| Script                   | Description                        |
| ------------------------ | ---------------------------------- |
| `yarn workspace:install` | Install all workspace dependencies |
| `yarn workspace:build`   | Build all packages                 |
| `yarn workspace:test`    | Run tests for all packages         |
| `yarn workspace:lint`    | Lint all packages                  |
| `yarn workspace:clean`   | Clean all build artifacts          |

### Package Level Scripts

| Script               | Description                           |
| -------------------- | ------------------------------------- |
| `yarn monitor:build` | Build hardhat-diamonds package        |
| `yarn monitor:test`  | Test hardhat-diamonds package         |
| `yarn monitor:lint`  | Lint hardhat-diamonds package         |
| `yarn monitor:dev`   | Development mode for hardhat-diamonds |

### Contract Scripts

| Script                      | Description                |
| --------------------------- | -------------------------- |
| `yarn compile`              | Compile Solidity contracts |
| `yarn test`                 | Run contract tests         |
| `yarn generate-diamond-abi` | Generate diamond ABI files |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📫 **Issues**: [GitHub Issues](https://github.com/GeniusVentures/hardhat-diamonds/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/GeniusVentures/hardhat-diamonds/discussions)
- 📖 **Documentation**: [Package Documentation](./packages/hardhat-diamonds/README.md)

---

- **DiamondCutFacet**: Handles diamond upgrades (add/replace/remove facets)
- **DiamondLoupeFacet**: Inspection functions for facets and selectors
- **ExampleOwnershipFacet**: Ownership management and access control
- **ExampleAccessControlFacet**: Role-based access control system
- **ExampleInitFacet**: Initialization and upgrade logic

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- Yarn (recommended) or npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/GeniusVentures/hardhat-diamonds-dev.git
cd hardhat-diamonds-dev

# Install dependencies
yarn install

# Copy environment template
cp .env.example .env
```

### Configuration

Set up your environment variables in `.env`:

```bash
# Network Configuration
MAINNET_RPC=https://mainnet.infura.io/v3/your-key
SEPOLIA_RPC=https://sepolia.infura.io/v3/your-key
POLYGON_RPC=https://polygon-mainnet.g.alchemy.com/v2/your-key

# Deployment Keys
PRIVATE_KEY=your_private_key_here
TEST_PRIVATE_KEY=your_test_private_key_here

# API Keys for Verification
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

### Compile Contracts

```bash
# Compile all contracts and generate Diamond ABI with TypeScript types
yarn compile

# Build TypeScript and compile contracts with Diamond ABI generation
yarn build

# Clean compiled artifacts
yarn clean
```

### Run Tests

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn coverage
```

## 📦 Deployment

### Available Scripts

The project includes the following yarn scripts defined in `package.json`:

```bash
# Development Scripts
yarn clean              # Clean compiled artifacts
yarn compile            # Compile contracts and generate Diamond ABI
yarn build              # Build TypeScript, compile contracts, and generate ABI (⚠️ currently has TypeScript errors)
yarn test               # Run all tests
yarn coverage           # Run tests with coverage report
```

> **Note**: The `yarn build` command currently has TypeScript compilation errors that need to be resolved. For development, use `yarn compile` which works correctly.

### Custom Deployment

For deployment, you'll need to use the deployment scripts directly:

```bash
# Example: Deploy using TypeScript scripts
npx ts-node scripts/deploy/rpc/deploy-rpc.ts ExampleDiamond sepolia

# Example: Deploy using Defender
npx ts-node scripts/deploy/defender/deploy-defender.ts ExampleDiamond mainnet
```

### Deployment Scripts

The project includes several deployment strategies using TypeScript scripts:

#### RPC Deployment (Direct)

```bash
# Basic deployment
npx ts-node scripts/deploy/rpc/deploy-rpc.ts ExampleDiamond sepolia

# With custom options (if supported by script)
npx ts-node scripts/deploy/rpc/deploy-rpc.ts ExampleDiamond sepolia --verbose

# Manual step-by-step deployment
npx ts-node scripts/deploy/rpc/deploy-rpc-manual.ts ExampleDiamond sepolia
```

#### Defender Deployment (Recommended for Production)

```bash
# Deploy via OpenZeppelin Defender
npx ts-node scripts/deploy/defender/deploy-defender.ts ExampleDiamond mainnet

# Check deployment status
npx ts-node scripts/deploy/defender/status-defender.ts ExampleDiamond mainnet
```

## 🔧 Development Tools

### Diamond Management

```bash
# Check deployment status
npx ts-node scripts/deploy/rpc/status-rpc.ts ExampleDiamond sepolia --detailed

# Verify deployment integrity
npx ts-node scripts/deploy/rpc/verify-rpc.ts ExampleDiamond sepolia --etherscan

# Upgrade diamond (add new facets or update existing ones)
npx ts-node scripts/deploy/rpc/upgrade-rpc.ts ExampleDiamond sepolia
```

### ABI Generation

The project automatically generates a combined Diamond ABI with TypeScript types:

```bash
# Generate Diamond ABI
yarn generate-diamond-abi

# Generate with TypeChain types
yarn generate-diamond-abi-typechain

# Build everything (compile + generate ABI)
yarn build
```

### Testing

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn coverage

# Run specific test files
yarn test test/unit/diamond-abi-generator.test.ts
yarn test test/integration/defender/DefenderDeployment.test.ts
```

## 📁 Project Structure

```bash
hardhat-diamonds-dev/
├── contracts/                    # Solidity smart contracts
│   └── examplediamond/           # Diamond facet contracts
│       ├── facets/               # Individual facet implementations
│       ├── interfaces/           # Solidity interfaces
│       ├── libraries/            # Shared libraries
│       └── upgradeInitializers/  # Upgrade initialization contracts
├── diamonds/                     # Diamond configuration
│   └── ExampleDiamond/          # Diamond-specific config
│       ├── deployments/          # Deployment records
│       ├── callbacks/            # Post-deployment callbacks
│       └── examplediamond.config.json  # Facet configuration
├── scripts/                      # Deployment and utility scripts
│   ├── deploy/                   # Deployment strategies
│   │   ├── rpc/                  # Direct RPC deployment
│   │   └── defender/             # OpenZeppelin Defender deployment
│   ├── setup/                    # Deployment infrastructure
│   └── utils/                    # Utility functions
├── test/                         # Test suite
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── deployment/               # Deployment tests
├── typechain-types/              # Generated TypeScript types
├── diamond-typechain-types/      # Diamond-specific TypeScript types
└── diamond-abi/                  # Generated Diamond ABI artifacts
```

## 🔧 Configuration

### Diamond Configuration

The diamond configuration is defined in `diamonds/ExampleDiamond/examplediamond.config.json`:

```json
{
  "protocolVersion": 1.0,
  "protocolInitFacet": "ExampleInitFacet",
  "facets": {
    "DiamondCutFacet": {
      "priority": 10,
      "versions": { "0.0": {} }
    },
    "DiamondLoupeFacet": {
      "priority": 20,
      "versions": { "0.0": {} }
    },
    "ExampleOwnershipFacet": {
      "priority": 30,
      "versions": { "0.0": {} }
    }
  }
}
```

### Hardhat Configuration

Key configurations in `hardhat.config.ts`:

- **Multi-chain support** via `hardhat-multichain`
- **Diamond configuration** via `hardhat-diamonds`
- **Network settings** for multiple EVM chains
- **Compiler optimization** for gas efficiency

## 🧪 Testing Strategy

### Test Categories

1. **Unit Tests**: Individual facet testing
2. **Integration Tests**: Cross-facet functionality
3. **Deployment Tests**: End-to-end deployment validation
4. **Multi-chain Tests**: Cross-network compatibility

### Test Environment

```bash
# Run tests with Hardhat
yarn test

# Test with coverage
yarn coverage

# Test specific files
yarn test test/specific-test-file.test.ts
```

### Test Utilities

- **Diamond test helpers**: Load and interact with deployed diamonds
- **Network utilities**: Multi-chain test orchestration
- **Mock contracts**: Isolated testing environments

## 🔒 Security

### Security Features

- **Multi-signature support** via OpenZeppelin Defender
- **Role-based access control** with granular permissions
- **Upgrade authorization** with ownership verification
- **Function selector collision prevention**
- **Comprehensive test coverage** including edge cases

### Security Tools

- **Slither**: Static analysis for vulnerability detection
- **OpenZeppelin Defender**: Production-grade security monitoring
- **Coverage reports**: Ensure comprehensive testing
- **Gas optimization**: Efficient contract execution

## 🚀 Deployment Strategies

### 1. Local Development

- Instant deployment and testing
- Full upgrade simulation
- Development-focused tooling

### 2. RPC Deployment

- Direct blockchain interaction
- Custom gas strategies
- Retry mechanisms for reliability

### 3. OpenZeppelin Defender

- Multi-signature workflow
- Automated monitoring
- Enterprise security features

## 📚 Advanced Usage

### Custom Facet Development

```solidity
// Example: Create a new facet
pragma solidity ^0.8.9;

import "../libraries/LibDiamond.sol";

contract CustomFacet {
    function customFunction() external {
        LibDiamond.enforceIsContractOwner();
        // Your logic here
    }
}
```

### Diamond Upgrades

```bash
# Add new facet
npx ts-node scripts/deploy/rpc/upgrade-rpc.ts ExampleDiamond sepolia

# Dry run upgrade (see what will change, if supported by script)
npx ts-node scripts/deploy/rpc/upgrade-rpc.ts ExampleDiamond sepolia --dry-run
```

### TypeScript Integration

```typescript
import { ExampleDiamond } from "../diamond-typechain-types";
import { ethers } from "hardhat";

// Type-safe contract interaction
const diamond = (await ethers.getContractAt(
  "ExampleDiamond",
  diamondAddress,
)) as ExampleDiamond;

// All functions are typed and auto-completed
await diamond.transferOwnership(newOwner);
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `yarn test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards

- **Solidity**: Follow official style guide
- **TypeScript**: ESLint + Prettier configuration
- **Testing**: Minimum 80% coverage required
- **Documentation**: Comprehensive inline documentation

## 📖 Documentation

- [Diamond Standard (EIP-2535)](https://eips.ethereum.org/EIPS/eip-2535)
- [OpenZeppelin Defender Docs](https://docs.openzeppelin.com/defender/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [TypeChain Documentation](https://github.com/dethcrypto/TypeChain)

## 🐛 Troubleshooting

### Common Issues

#### TypeScript build errors

```bash
# The yarn build command currently has TypeScript compilation errors
# Use yarn compile instead for development:
yarn clean
yarn compile
```

#### Diamond ABI generation fails

```bash
# Clean and regenerate
yarn clean
yarn compile
# OR
yarn build
```

#### Compilation errors

```bash
# Clean all artifacts and rebuild
yarn clean
yarn compile
```

#### Test failures related to missing artifacts

```bash
# Some tests may fail due to missing contract artifacts
# Ensure contracts are compiled first:
yarn compile
yarn test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [EIP-2535 Diamond Standard](https://eips.ethereum.org/EIPS/eip-2535) by Nick Mudge
- [OpenZeppelin](https://openzeppelin.com/) for security standards
- [Hardhat](https://hardhat.org/) for development framework
- [TypeChain](https://github.com/dethcrypto/TypeChain) for TypeScript integration
