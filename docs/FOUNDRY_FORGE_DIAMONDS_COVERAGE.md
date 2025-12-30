# Foundry Forge Coverage for Diamond Contracts

Complete guide to using `forge coverage` with ERC-2535 Diamond proxy contracts through the `@diamondslab/diamonds-hardhat-foundry` module.

## Overview

The `diamonds-forge:coverage` task provides seamless test coverage analysis for Diamond contracts using Foundry's `forge coverage` tool. It automatically handles Diamond deployment, helper generation, and coverage execution with full support for all forge coverage options.

### Key Features

- **Automatic Diamond Deployment** - Deploys or reuses existing Diamond contracts
- **Helper Generation** - Creates Solidity helpers with deployment addresses
- **Full Option Support** - All `forge coverage` flags available
- **Multiple Report Formats** - Summary, LCOV, Debug, Bytecode reports
- **Network Forking** - Access deployed contracts via fork URLs
- **CI/CD Ready** - JSON output and non-interactive execution

### Benefits

- **Single Command** - Replace complex multi-step workflows
- **Consistent Setup** - Same deployment and helper generation as testing
- **Quality Metrics** - Track test coverage for Diamond facets
- **Integration Ready** - LCOV format works with standard coverage tools
- **Developer Friendly** - Clear output and helpful error messages

## Getting Started

### Prerequisites

1. **Foundry installed** - [Installation guide](https://book.getfoundry.sh/getting-started/installation)
2. **Diamond configured** - Diamond configuration in `diamonds/` directory
3. **Hardhat node running** (for localhost network):
   ```bash
   npx hardhat node
   ```

### Basic Usage

**Simple coverage report:**

```bash
npx hardhat diamonds-forge:coverage --diamond-name ExampleDiamond
```

**Coverage with specific network:**

```bash
npx hardhat diamonds-forge:coverage --diamond-name ExampleDiamond --network localhost
```

**LCOV report for CI/CD:**

```bash
npx hardhat diamonds-forge:coverage --diamond-name ExampleDiamond --report lcov
```

## Command Options

All forge coverage options are supported. Options are organized by category below.

### Core Parameters

| Option           | Description                             | Required | Default         |
| ---------------- | --------------------------------------- | -------- | --------------- |
| `--diamond-name` | Name of Diamond to analyze              | Yes      | -               |
| `--network`      | Network to use (from hardhat.config.ts) | No       | Current network |

### Report Options

Control coverage report generation and format.

| Option                     | Description                                                          | Example                            |
| -------------------------- | -------------------------------------------------------------------- | ---------------------------------- |
| `--report <type>`          | Report type: summary, lcov, debug, bytecode (can use multiple times) | `--report summary --report lcov`   |
| `--report-file <path>`     | Output path for report file                                          | `--report-file coverage/lcov.info` |
| `--lcov-version <version>` | LCOV format version (1, 2.0, 2.2)                                    | `--lcov-version 2.0`               |
| `--include-libs`           | Include libraries in coverage                                        | `--include-libs`                   |
| `--exclude-tests`          | Exclude tests from coverage                                          | `--exclude-tests`                  |
| `--ir-minimum`             | Enable viaIR with minimum optimization                               | `--ir-minimum`                     |

**Example - Multiple reports:**

```bash
npx hardhat diamonds-forge:coverage \
  --diamond-name ExampleDiamond \
  --report summary \
  --report lcov \
  --report-file coverage/custom.info
```

### Test Filtering Options

Filter which tests to include in coverage analysis.

| Option                        | Description                        | Example                           |
| ----------------------------- | ---------------------------------- | --------------------------------- | ------ |
| `--match-test <regex>`        | Run tests matching pattern         | `--match-test "testTransfer"`     |
| `--no-match-test <regex>`     | Exclude tests matching pattern     | `--no-match-test "testFail"`      |
| `--match-contract <regex>`    | Run contracts matching pattern     | `--match-contract "ExampleFacet"` |
| `--no-match-contract <regex>` | Exclude contracts matching pattern | `--no-match-contract "Mock"`      |
| `--match-path <glob>`         | Run files matching glob            | `--match-path "test/unit/*"`      |
| `--no-match-path <glob>`      | Exclude files matching glob        | `--no-match-path "test/poc/*"`    |
| `--no-match-coverage <regex>` | Exclude files from coverage report | `--no-match-coverage "Mock        | Test"` |

**Example - Coverage for specific facet:**

```bash
npx hardhat diamonds-forge:coverage \
  --diamond-name ExampleDiamond \
  --match-contract "ExampleFacetTest"
```

### Display Options

Control output formatting and verbosity.

| Option              | Description                              | Example                   |
| ------------------- | ---------------------------------------- | ------------------------- |
| `--verbosity <1-5>` | Verbosity level (more v's = more output) | `--verbosity 3` or `-vvv` |
| `--quiet`           | Suppress log output                      | `--quiet`                 |
| `--json`            | Format output as JSON                    | `--json`                  |
| `--md`              | Format output as Markdown                | `--md`                    |
| `--color <mode>`    | Color mode: auto, always, never          | `--color always`          |

**Example - Verbose coverage:**

```bash
npx hardhat diamonds-forge:coverage \
  --diamond-name ExampleDiamond \
  --verbosity 4
```

### Test Execution Options

Configure test execution behavior.

| Option               | Description                | Example             |
| -------------------- | -------------------------- | ------------------- |
| `--threads <n>`      | Number of parallel threads | `--threads 4`       |
| `--fuzz-runs <n>`    | Number of fuzz test runs   | `--fuzz-runs 1000`  |
| `--fuzz-seed <seed>` | Seed for fuzz randomness   | `--fuzz-seed 12345` |
| `--fail-fast`        | Stop on first failure      | `--fail-fast`       |
| `--allow-failure`    | Exit 0 even if tests fail  | `--allow-failure`   |

**Example - Fast coverage check:**

```bash
npx hardhat diamonds-forge:coverage \
  --diamond-name ExampleDiamond \
  --fail-fast \
  --fuzz-runs 100
```

### EVM Options

Configure EVM behavior during coverage.

| Option                    | Description                        | Example                                               |
| ------------------------- | ---------------------------------- | ----------------------------------------------------- |
| `--fork-block-number <n>` | Fork from specific block           | `--fork-block-number 12345678`                        |
| `--initial-balance <wei>` | Initial balance for test contracts | `--initial-balance 1000000000000000000`               |
| `--sender <address>`      | Test sender address                | `--sender 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4` |
| `--ffi`                   | Enable FFI cheatcode               | `--ffi`                                               |

### Build Options

Control compilation and caching.

| Option                 | Description                  | Example                |
| ---------------------- | ---------------------------- | ---------------------- |
| `--force`              | Force recompile and redeploy | `--force`              |
| `--no-cache`           | Disable compiler cache       | `--no-cache`           |
| `--optimize`           | Enable Solidity optimizer    | `--optimize`           |
| `--optimizer-runs <n>` | Number of optimizer runs     | `--optimizer-runs 200` |
| `--via-ir`             | Use Yul IR compilation       | `--via-ir`             |

**Example - Clean coverage run:**

```bash
npx hardhat diamonds-forge:coverage \
  --diamond-name ExampleDiamond \
  --force \
  --no-cache
```

## Report Formats

### Summary Report (Default)

Terminal output with coverage statistics per file.

```bash
npx hardhat diamonds-forge:coverage --diamond-name ExampleDiamond
```

**Output:**

```
| File                          | % Lines        | % Statements   | % Branches     | % Funcs        |
|-------------------------------|----------------|----------------|----------------|----------------|
| src/facets/ExampleFacet.sol   | 100.00% (25/25)| 100.00% (30/30)| 100.00% (8/8)  | 100.00% (5/5)  |
| src/Diamond.sol               | 95.00% (19/20) | 95.00% (22/23) | 90.00% (9/10)  | 100.00% (3/3)  |
| Total                         | 97.78% (44/45) | 98.11% (52/53) | 94.44% (17/18) | 100.00% (8/8)  |
```

### LCOV Report

Standard LCOV format for integration with coverage tools.

```bash
npx hardhat diamonds-forge:coverage \
  --diamond-name ExampleDiamond \
  --report lcov \
  --report-file coverage/lcov.info
```

**Use with:**

- [Codecov](https://codecov.io/)
- [Coveralls](https://coveralls.io/)
- [SonarQube](https://www.sonarsource.com/products/sonarqube/)
- `lcov` HTML generator

**Generate HTML from LCOV:**

```bash
genhtml coverage/lcov.info --output-directory coverage/html
```

### Debug Report

Detailed coverage information for debugging.

```bash
npx hardhat diamonds-forge:coverage \
  --diamond-name ExampleDiamond \
  --report debug
```

### Bytecode Report

Raw bytecode-level coverage data.

```bash
npx hardhat diamonds-forge:coverage \
  --diamond-name ExampleDiamond \
  --report bytecode
```

### Multiple Reports

Generate multiple report types in one run:

```bash
npx hardhat diamonds-forge:coverage \
  --diamond-name ExampleDiamond \
  --report summary \
  --report lcov \
  --report debug
```

## Common Use Cases

### 1. Basic Coverage Check

Quick coverage summary during development:

```bash
npx hardhat diamonds-forge:coverage --diamond-name MyDiamond --network localhost
```

### 2. CI/CD Pipeline

Generate LCOV for automated coverage tracking:

```bash
npx hardhat diamonds-forge:coverage \
  --diamond-name MyDiamond \
  --network localhost \
  --report lcov \
  --json \
  --force
```

### 3. Specific Facet Coverage

Focus on a single facet's test coverage:

```bash
npx hardhat diamonds-forge:coverage \
  --diamond-name MyDiamond \
  --match-contract "MyFacetTest" \
  --network localhost
```

### 4. Exclude Mock Contracts

Get coverage excluding test mocks:

```bash
npx hardhat diamonds-forge:coverage \
  --diamond-name MyDiamond \
  --no-match-coverage "Mock|Test" \
  --network localhost
```

### 5. Coverage with Gas Profiling

Combine coverage with performance analysis:

```bash
# Run coverage first
npx hardhat diamonds-forge:coverage --diamond-name MyDiamond --network localhost

# Then run tests with gas report
npx hardhat diamonds-forge:test --diamond-name MyDiamond --network localhost --gas-report
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Coverage

on: [push, pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
        with:
          submodules: recursive

      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1

      - name: Install Dependencies
        run: yarn install

      - name: Start Hardhat Node
        run: |
          npx hardhat node &
          sleep 5

      - name: Run Coverage
        run: |
          npx hardhat diamonds-forge:coverage \
            --diamond-name ExampleDiamond \
            --network localhost \
            --report lcov \
            --force

      - name: Upload Coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./lcov.info
          fail_ci_if_error: true
```

### GitLab CI

```yaml
coverage:
  stage: test
  image: ghcr.io/foundry-rs/foundry:latest
  before_script:
    - curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    - apt-get install -y nodejs
    - npm install -g yarn
    - yarn install
  script:
    - npx hardhat node &
    - sleep 5
    - npx hardhat diamonds-forge:coverage --diamond-name ExampleDiamond --network localhost --report lcov --force
  coverage: '/Total.*?(\d+\.?\d*)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura.xml
```

## Understanding Coverage Output

### Coverage Metrics

- **% Lines** - Percentage of executable lines covered
- **% Statements** - Percentage of statements executed
- **% Branches** - Percentage of conditional branches covered
- **% Funcs** - Percentage of functions called

### Reading the Report

**High Coverage (>90%)**

- ✅ Well-tested code
- ✅ Most execution paths covered
- ✅ Good confidence in code behavior

**Medium Coverage (70-90%)**

- ⚠️ Some gaps in testing
- ⚠️ Consider adding edge case tests
- ⚠️ Review uncovered branches

**Low Coverage (<70%)**

- ❌ Significant testing gaps
- ❌ High risk of undetected bugs
- ❌ Requires immediate attention

### Coverage Limitations

Coverage doesn't guarantee:

- **Correctness** - Tests may not assert proper behavior
- **Security** - Covered code may still have vulnerabilities
- **Quality** - High coverage doesn't mean good test quality

**Best practice:** Combine coverage with:

- Manual code review
- Security audits
- Fuzz testing
- Invariant testing

## Troubleshooting

### Common Issues

**1. "Diamond has no code" error**

**Cause:** Network not running or Diamond not deployed

**Solution:**

```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Run coverage
npx hardhat diamonds-forge:coverage --diamond-name ExampleDiamond --network localhost
```

**2. Coverage shows 0% for all files**

**Cause:** Tests not executing against deployed Diamond

**Solution:** Ensure tests use `--fork-url` or extend `DiamondFuzzBase`:

```solidity
import {DiamondFuzzBase} from "@diamondslab/diamonds-hardhat-foundry/contracts/DiamondFuzzBase.sol";

contract MyTest is DiamondFuzzBase {
    // Tests will access deployed Diamond
}
```

**3. LCOV file not generated**

**Cause:** Missing `--report lcov` flag or incorrect path

**Solution:**

```bash
npx hardhat diamonds-forge:coverage \
  --diamond-name ExampleDiamond \
  --report lcov \
  --report-file lcov.info
```

**4. Coverage very slow**

**Causes:**

- Too many fuzz runs
- Complex contracts
- No parallelization

**Solutions:**

```bash
# Reduce fuzz runs
npx hardhat diamonds-forge:coverage --diamond-name ExampleDiamond --fuzz-runs 100

# Use multiple threads
npx hardhat diamonds-forge:coverage --diamond-name ExampleDiamond --threads 4

# Run coverage for specific contracts only
npx hardhat diamonds-forge:coverage --diamond-name ExampleDiamond --match-contract "MyFacet"
```

**5. "forge: command not found"**

**Cause:** Foundry not installed or not in PATH

**Solution:**

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Best Practices

### 1. Regular Coverage Checks

Run coverage regularly during development:

```bash
# Add to package.json scripts
{
  "scripts": {
    "coverage": "hardhat diamonds-forge:coverage --diamond-name ExampleDiamond --network localhost"
  }
}

# Run with: yarn coverage
```

### 2. Set Coverage Goals

Target specific coverage thresholds:

- **Critical Code:** 100% coverage (security, core logic)
- **Standard Code:** 90%+ coverage (facets, business logic)
- **Helpers/Utils:** 80%+ coverage (utilities, libraries)

### 3. Focus on Important Code

Use filters to focus coverage on key contracts:

```bash
npx hardhat diamonds-forge:coverage \
  --diamond-name MyDiamond \
  --match-path "src/facets/*" \
  --no-match-coverage "Mock|Test"
```

### 4. Combine Coverage Types

Use multiple coverage metrics:

- **Line coverage** - Basic metric
- **Branch coverage** - Conditional logic
- **Function coverage** - API surface
- **Statement coverage** - Execution paths

### 5. Track Coverage Over Time

Store coverage reports in version control:

```bash
# Generate report
npx hardhat diamonds-forge:coverage --diamond-name MyDiamond --report lcov

# Commit to repo
git add coverage/
git commit -m "chore: update coverage reports"
```

### 6. Integration Testing

Ensure coverage includes integration tests:

```bash
# Run full test suite for coverage
npx hardhat diamonds-forge:coverage \
  --diamond-name MyDiamond \
  --match-path "test/**/*" \
  --network localhost
```

## Advanced Usage

### Custom Coverage Directory

Organize coverage artifacts:

```bash
mkdir -p coverage/forge
npx hardhat diamonds-forge:coverage \
  --diamond-name ExampleDiamond \
  --report lcov \
  --report-file coverage/forge/lcov.info
```

### Coverage for Multiple Diamonds

Run coverage separately for each Diamond:

```bash
# Diamond 1
npx hardhat diamonds-forge:coverage --diamond-name Diamond1 --network localhost

# Diamond 2
npx hardhat diamonds-forge:coverage --diamond-name Diamond2 --network localhost
```

### Coverage with Historical State

Fork from specific block:

```bash
npx hardhat diamonds-forge:coverage \
  --diamond-name ExampleDiamond \
  --network localhost \
  --fork-block-number 12345678
```

### Coverage in Docker

Run coverage in containerized environment:

```dockerfile
FROM ghcr.io/foundry-rs/foundry:latest

WORKDIR /app
COPY . .

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn && \
    yarn install

CMD ["sh", "-c", "npx hardhat node & sleep 5 && npx hardhat diamonds-forge:coverage --diamond-name ExampleDiamond --network localhost"]
```

## Related Documentation

- [Forge Coverage Reference](https://book.getfoundry.sh/reference/forge/forge-coverage)
- [diamonds-hardhat-foundry README](../packages/diamonds-hardhat-foundry/README.md)
- [Foundry Testing Guide](https://book.getfoundry.sh/forge/tests)
- [LCOV Format Specification](http://ltp.sourceforge.net/coverage/lcov/geninfo.1.php)

## Support

For issues, questions, or contributions:

- **GitHub Issues:** [diamonds-hardhat-foundry/issues](https://github.com/DiamondsLab/diamonds-hardhat-foundry/issues)
- **Documentation:** [packages/diamonds-hardhat-foundry/](../packages/diamonds-hardhat-foundry/)
- **Discord:** [DiamondsLab Community](https://discord.gg/diamondslab)

---

**Last Updated:** 2025-12-30  
**Version:** 2.2.0  
**Module:** @diamondslab/diamonds-hardhat-foundry
