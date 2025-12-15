# Foundry + Hardhat Hybrid Setup - Summary

## What Was Done

This repository has been successfully configured as a **hybrid Hardhat + Foundry Forge project**, allowing you to leverage the strengths of both frameworks.

### Key Changes

#### 1. Configuration Files

- **`foundry.toml`**: Configured Foundry to work alongside Hardhat
  - Solidity version: 0.8.19 (aligned with Hardhat)
  - Source directory: `contracts/` (shared with Hardhat or provided by Hardhat-Diamonds)
  - Test directory: `test/foundry/`
  - Cache directory: `cache_forge/` (separate from Hardhat)
  - Optimizer settings: Enabled with 200 runs (matching Hardhat)
  - Remappings for all project dependencies including forge-std

- **`hardhat.config.ts`**: Updated Solidity version to 0.8.19 for compatibility
  - Changed from 0.8.9 to 0.8.19
  - Adjusted optimizer runs from 1000 to 200 to match Foundry

#### 2. Dependencies Installed

- **forge-std**: Foundry's standard library installed in `lib/forge-std/`
  - Provides testing utilities, console logging, and cheatcodes
  - Installed as a git submodule (excluded from git tracking per `.gitignore`)

#### 3. Directory Structure Created

```
test/foundry/
├── unit/                          # Unit tests
│   └── ExampleConstantsFacet.t.sol
└── integration/                   # Integration tests
    └── ExampleDiamondIntegration.t.sol

scripts/foundry/                   # Foundry deployment scripts (empty for now)
```

#### 4. Package.json Scripts Added

New npm/yarn scripts for Foundry operations:

- `forge:build` - Build contracts with Forge
- `forge:test` - Run Forge tests with verbose output
- `forge:test:verbose` - Run with extra verbosity
- `forge:test:gas` - Run tests with gas reporting
- `forge:coverage` - Generate coverage reports
- `forge:snapshot` - Create gas snapshots
- `forge:clean` - Clean Forge artifacts
- `forge:fmt` - Format Solidity code
- `forge:fmt:check` - Check Solidity formatting
- `test:all` - Run both Hardhat and Forge tests

#### 5. Example Tests Created

**Unit Test**: `test/foundry/unit/ExampleConstantsFacet.t.sol`

- Tests all constants defined in ExampleConstantsFacet
- Demonstrates basic Foundry test patterns
- All 12 tests passing

**Integration Test**: `test/foundry/integration/ExampleDiamondIntegration.t.sol`

- Tests Diamond pattern deployment and facet management
- Shows ownership transfer functionality
- Includes fuzzing tests and gas benchmarks
- All 7 tests passing (including 256 fuzz runs)

#### 6. Documentation Added

**`FOUNDRY_GUIDE.md`**: Comprehensive guide covering:

- Why use a hybrid setup
- Directory structure explanation
- Getting started instructions
- Testing strategies
- Building and compiling
- Available scripts
- Best practices
- Common patterns
- Troubleshooting

**`FOUNDRY_QUICK_REFERENCE.md`**: Quick reference for:

- Common Foundry commands
- Test structure patterns
- Cheatcodes (vm.\* functions)
- Assertions
- Environment variables
- Forking
- Dependencies
- Tips & tricks
- VSCode integration

#### 7. Contract Fixes

- **`ExampleAccessControl.sol`**: Fixed override specifications to work with Solidity 0.8.19
  - Updated `renounceRole` and `revokeRole` override syntax
  - Added explicit import of `AccessControlUpgradeable`
  - Changed from `super.renounceRole()` to `AccessControlUpgradeable.renounceRole()`

#### 8. Git Ignore Updates

- Added `cache_forge/` to .gitignore (Foundry cache)
- Updated `lib/` pattern to only ignore `forge-std`
- Added `broadcast/` (Foundry deployment broadcasts)

## Test Results

### Foundry Tests

```
Running 2 test suites:

✓ ExampleConstantsFacetTest (12 tests)
  - All constant values verified
  - Mask operations tested
  - Gas usage: < 4k gas per test

✓ ExampleDiamondIntegrationTest (7 tests)
  - Diamond initialization verified
  - Facet introspection working
  - Ownership transfer tested
  - Fuzzing with 256 runs passed
  - Gas benchmarks logged

Total: 19 tests passed, 0 failed
```

### Hardhat Tests

```
137 tests passing
1 pending

Both frameworks work perfectly together!
```

## How to Use

### Run Foundry Tests

```bash
# Quick run
yarn forge:test

# With gas reporting
yarn forge:test:gas

# Specific test
forge test --match-test test_XMPLName
```

### Run Hardhat Tests

```bash
yarn test
```

### Run Both

```bash
yarn test:all
```

### Build with Foundry

```bash
yarn forge:build
```

### Build with Hardhat

```bash
yarn compile
```

## Benefits of This Setup

1. **Fast Development**: Foundry's Rust-based compiler is significantly faster than Hardhat
2. **Better Testing**: Write tests in Solidity (Foundry) or TypeScript (Hardhat) based on needs
3. **Fuzzing**: Built-in property-based testing with Foundry
4. **Gas Optimization**: Superior gas reporting and optimization tools in Foundry
5. **Deployment**: Continue using familiar Hardhat deployment scripts
6. **Diamond Tooling**: Keep using `hardhat-diamonds` plugin for Diamond operations
7. **Best of Both**: Use each tool where it excels

## What's Next

### Recommended Next Steps

1. **Write More Tests**: Convert existing Hardhat tests to Foundry for speed
2. **Add Fuzzing**: Identify critical functions that would benefit from fuzzing
3. **Gas Benchmarks**: Create snapshots for gas optimization tracking
4. **CI/CD Integration**: Add Foundry tests to CI pipeline
5. **Deployment Scripts**: Write Foundry scripts for deployment (optional)

### Advanced Foundry Features to Explore

- **Forking**: Test against mainnet state
- **Invariant Testing**: Advanced property-based testing
- **Symbolic Execution**: Use `hevm` for formal verification
- **Gas Snapshots**: Track gas changes across commits
- **Coverage**: Generate detailed coverage reports

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Invalid contract in override list"
**Solution**: Ensure Solidity versions match in `foundry.toml` and `hardhat.config.ts` (both should be 0.8.19)

**Issue**: Cannot find imported contracts
**Solution**: Check remappings in `foundry.toml` match your import paths

**Issue**: Foundry and Hardhat produce different results
**Solution**: Verify both use same compiler version and optimizer settings

## Files Modified/Created

### Modified

- `foundry.toml` - Foundry configuration
- `hardhat.config.ts` - Solidity version updated to 0.8.19
- `package.json` - Added Foundry scripts
- `.gitignore` - Added Foundry-specific ignores
- `contracts/examplediamond/ExampleAccessControl.sol` - Fixed override syntax

### Created

- `test/foundry/unit/ExampleConstantsFacet.t.sol` - Unit test example
- `test/foundry/integration/ExampleDiamondIntegration.t.sol` - Integration test example
- `FOUNDRY_GUIDE.md` - Comprehensive documentation
- `FOUNDRY_QUICK_REFERENCE.md` - Quick reference guide
- `FOUNDRY_SETUP_SUMMARY.md` - This file

### Installed

- `lib/forge-std/` - Foundry standard library (git submodule)

## Support & Resources

- **Foundry Book**: https://book.getfoundry.sh/
- **Forge Standard Library**: https://book.getfoundry.sh/reference/forge-std/
- **Hardhat Docs**: https://hardhat.org/docs
- **ERC-2535 Diamond**: https://eips.ethereum.org/EIPS/eip-2535

## Conclusion

This repository now supports both Hardhat and Foundry Forge, providing a professional development environment that leverages the strengths of each framework. You can:

- ✅ Write fast tests in Solidity (Foundry)
- ✅ Write complex tests in TypeScript (Hardhat)
- ✅ Use fuzzing for security testing
- ✅ Deploy with familiar Hardhat scripts
- ✅ Optimize gas with Foundry tools
- ✅ Maintain Diamond-specific workflows

Both frameworks work seamlessly together, compiling from the same `contracts/` directory and maintaining separate build artifacts to avoid conflicts.

Happy coding! 🚀
