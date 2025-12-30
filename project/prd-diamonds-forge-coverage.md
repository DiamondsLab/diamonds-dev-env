# Product Requirements Document: Forge Coverage Integration

## Introduction/Overview

This PRD defines the requirements for adding `forge coverage` functionality to the `@diamondslab/diamonds-hardhat-foundry` module. The new `diamonds-forge:coverage` Hardhat task will enable developers to generate test coverage reports for Diamond contracts using Foundry's coverage analysis tools. This feature provides the same capabilities as the native `forge coverage` command while integrating seamlessly with the Diamond deployment and testing workflow.

**Problem Statement:** Developers using `@diamondslab/diamonds-hardhat-foundry` currently lack a standardized way to measure test coverage for their Diamond contracts. They must manually run `forge coverage` commands with complex fork URLs and configuration, which doesn't integrate with the module's deployment and helper generation workflows.

**Goal:** Provide a single command (`npx hardhat diamonds-forge:coverage`) that automatically deploys the Diamond (if needed), generates helpers, and runs Foundry coverage analysis with full access to all `forge coverage` options and switches.

## Goals

1. **Seamless Integration**: Coverage command follows the same workflow as `diamonds-forge:test` (deploy → generate helpers → execute)
2. **Feature Parity**: Support all `forge coverage` command options and switches without limitations
3. **Multiple Report Formats**: Enable all Foundry coverage report types (summary, LCOV, debug, bytecode)
4. **Developer Experience**: Provide clear, actionable coverage reports with minimal configuration
5. **Quality Assurance**: Enable teams to measure and track test coverage for Diamond contracts
6. **Documentation/Compliance**: Generate coverage artifacts suitable for documentation and compliance requirements
7. **CI/CD Ready**: Support non-interactive execution for continuous integration pipelines

## User Stories

### Story 1: Basic Coverage Report

**As a** Diamond contract developer  
**I want to** run `npx hardhat diamonds-forge:coverage --diamond-name MyDiamond`  
**So that** I can see a summary of test coverage for my Diamond contracts

**Acceptance Criteria:**

- Command deploys Diamond to localhost network
- Generates DiamondDeployment.sol helper
- Runs forge coverage with fork URL
- Displays summary report in terminal

### Story 2: LCOV Report Generation

**As a** DevOps engineer  
**I want to** generate LCOV coverage reports  
**So that** I can integrate coverage data with CI/CD tools (SonarQube, Codecov, Coveralls)

**Acceptance Criteria:**

- `--report lcov` flag generates lcov.info file
- `--report-file` specifies custom output path
- Report includes all Diamond facets and libraries
- Compatible with standard coverage visualization tools

### Story 3: Coverage with Test Filtering

**As a** developer  
**I want to** run coverage for specific test contracts or functions  
**So that** I can focus on coverage for specific features

**Acceptance Criteria:**

- `--match-contract` filters by contract name
- `--match-test` filters by test function name
- `--match-path` filters by file path
- All forge test filtering options work with coverage

### Story 4: HTML Coverage Report

**As a** project manager  
**I want to** generate HTML coverage reports  
**So that** I can review coverage visually in a browser

**Acceptance Criteria:**

- Coverage data can be converted to HTML format
- Reports show line-by-line coverage
- Reports accessible via file browser
- Clear indication of covered/uncovered code

### Story 5: Coverage in CI/CD Pipeline

**As a** CI/CD pipeline  
**I want to** run coverage without manual intervention  
**So that** I can automatically track coverage metrics

**Acceptance Criteria:**

- `--force` flag redeploys Diamond
- `--json` flag outputs machine-readable logs
- Exit codes reflect coverage success/failure
- Works without interactive prompts

## Functional Requirements

### FR1: Core Coverage Command

The system must provide a new Hardhat task `diamonds-forge:coverage` that:

- Accepts a `--diamond-name` parameter (required)
- Accepts a `--network` parameter (default: "localhost")
- Automatically deploys the Diamond contract if needed
- Generates DiamondDeployment.sol helper file
- Executes `forge coverage` with appropriate fork URL

### FR2: Forge Coverage Pass-Through Options

The task must support all standard `forge coverage` options as pass-through flags:

**Report Options:**

- `--report <type>` - Report type (summary, lcov, debug, bytecode) - can be used multiple times
- `--report-file <path>` - Output path for report file
- `--lcov-version <version>` - LCOV format version (default: 1)
- `--include-libs` - Include libraries in coverage report
- `--exclude-tests` - Exclude tests from coverage report
- `--ir-minimum` - Enable viaIR with minimum optimization

**Test Filtering:**

- `--match-test <regex>` / `--mt` - Run tests matching regex
- `--no-match-test <regex>` / `--nmt` - Exclude tests matching regex
- `--match-contract <regex>` / `--mc` - Run contracts matching regex
- `--no-match-contract <regex>` / `--nmc` - Exclude contracts matching regex
- `--match-path <glob>` / `--mp` - Run files matching glob
- `--no-match-path <glob>` / `--nmp` - Exclude files matching glob
- `--no-match-coverage <regex>` / `--nmco` - Exclude files from coverage report

**Display Options:**

- `-v`, `--verbosity` - Verbosity level (can be repeated: -vv, -vvv, etc.)
- `-q`, `--quiet` - Suppress log output
- `--json` - Format output as JSON
- `--md` - Format output as Markdown
- `--color <mode>` - Color mode (auto, always, never)

**Test Execution Options:**

- `-j <threads>` / `--threads` - Number of threads
- `--fuzz-runs <runs>` - Number of fuzz runs
- `--fuzz-seed <seed>` - Seed for fuzz randomness
- `--fail-fast` - Stop on first failure
- `--allow-failure` - Exit 0 even if tests fail

**EVM Options:**

- `--fork-block-number <block>` - Fork from specific block
- `--initial-balance <balance>` - Initial balance for test contracts
- `--sender <address>` - Test sender address
- `--ffi` - Enable FFI cheatcode

**Build Options:**

- `--force` - Force recompile and redeploy
- `--no-cache` - Disable cache
- `--optimize` - Enable Solidity optimizer
- `--optimizer-runs <runs>` - Optimizer runs
- `--via-ir` - Use Yul IR compilation

### FR3: Deployment Integration

The task must integrate with existing deployment workflows:

- Check if Diamond is already deployed on target network
- If not deployed or `--force` flag present, deploy Diamond
- Use `DeploymentManager` to handle deployment (consistent with `diamonds-forge:test`)
- Generate DiamondDeployment.sol helper after deployment
- Use `HelperGenerator` for helper creation

### FR4: Fork URL Construction

The task must construct the appropriate fork URL:

- For `localhost` network: `http://127.0.0.1:8545`
- For named networks: Use RPC URL from `hardhat.config.ts`
- Pass fork URL to `forge coverage` via `--fork-url` flag
- Support `--fork-block-number` for pinned state

### FR5: Coverage Output Management

The task must respect Foundry's coverage output conventions:

- Default summary output to terminal
- LCOV output to `lcov.info` in project root (unless `--report-file` specified)
- Support multiple report types via repeated `--report` flags
- Preserve all Foundry coverage artifacts (coverage/, cache_forge/)
- Honor `.gitignore` patterns for coverage artifacts

### FR6: Error Handling

The task must handle common error scenarios:

- Network not running (localhost) - clear error message
- Diamond deployment failures - propagate error with context
- Forge coverage execution failures - display forge error output
- Missing deployment records - attempt deployment or show clear guidance
- Invalid command options - display help text

### FR7: Logging and Output

The task must provide informative logging:

- Display deployment status (deploying, reusing existing, skipped)
- Show helper generation confirmation
- Display forge coverage command being executed
- Stream forge coverage output to terminal
- Show coverage summary at completion
- Log file paths for generated reports

### FR8: Performance Considerations

The task must optimize for performance:

- Skip deployment if Diamond already deployed (unless `--force`)
- Use existing helpers if valid (unless regeneration needed)
- Pass through forge's native concurrency options (`--threads`)
- Support `--ffi` for faster external calls if needed

## Non-Goals (Out of Scope)

The following items are explicitly **not** included in this feature:

1. **Coverage Threshold Enforcement**: No built-in minimum coverage requirements or failure based on thresholds
2. **Coverage Comparison**: No diffing against previous coverage runs or branches
3. **Custom Coverage Formats**: Only formats supported by `forge coverage` (no custom parsers)
4. **HTML Report Generation**: No built-in HTML generation (users can use third-party tools with LCOV)
5. **Coverage Dashboard**: No web UI or dashboard (terminal/file output only)
6. **Multi-Diamond Coverage**: No aggregated coverage across multiple Diamonds (run separately)
7. **Coverage Trends**: No historical tracking or trend analysis
8. **Smart Contract Mutation Testing**: Coverage only, no mutation/fuzz-based quality metrics
9. **Gas Profiling Integration**: Coverage is separate from gas reporting (use `--gas-report` separately)

## Design Considerations

### Task Implementation Pattern

Follow the established pattern from `diamonds-forge:test`:

- Extend from existing base task structure
- Use `ForgeFuzzingFramework` as reference for forge command construction
- Integrate `DeploymentManager` for Diamond deployment
- Use `HelperGenerator` for helper file creation

### Code Reuse Strategy

Maximize reuse from existing `src/` modules:

- `framework/DeploymentManager.ts` - Diamond deployment logic
- `framework/HelperGenerator.ts` - Helper file generation
- `framework/ForgeFuzzingFramework.ts` - Forge command construction pattern
- `utils/foundry.ts` - Foundry installation detection
- `utils/logger.ts` - Consistent logging output
- `utils/validation.ts` - Input validation

### New Framework Class: `ForgeCoverageFramework`

Create a new framework class similar to `ForgeFuzzingFramework`:

```typescript
// src/framework/ForgeCoverageFramework.ts
export class ForgeCoverageFramework {
  constructor(private hre: HardhatRuntimeEnvironment) {}

  async runCoverage(
    diamondName: string,
    network: string,
    options: CoverageOptions,
  ): Promise<void> {
    // Build forge coverage command
    // Execute with proper fork URL
    // Handle output and errors
  }
}
```

### Configuration Type

Define TypeScript type for coverage options:

```typescript
// src/types/config.ts
export interface CoverageOptions {
  // Report options
  report?: string[];
  reportFile?: string;
  lcovVersion?: string;
  includeLibs?: boolean;
  excludeTests?: boolean;
  irMinimum?: boolean;

  // Test filtering
  matchTest?: string;
  noMatchTest?: string;
  matchContract?: string;
  noMatchContract?: string;
  matchPath?: string;
  noMatchPath?: string;
  noMatchCoverage?: string;

  // Display options
  verbosity?: number;
  quiet?: boolean;
  json?: boolean;
  md?: boolean;
  color?: "auto" | "always" | "never";

  // Test execution
  threads?: number;
  fuzzRuns?: number;
  fuzzSeed?: string;
  failFast?: boolean;
  allowFailure?: boolean;

  // EVM options
  forkBlockNumber?: number;
  initialBalance?: string;
  sender?: string;
  ffi?: boolean;

  // Build options
  force?: boolean;
  noCache?: boolean;
  optimize?: boolean;
  optimizerRuns?: number;
  viaIr?: boolean;
}
```

### Task File Structure

Create `src/tasks/coverage.ts` following the pattern of `test.ts`:

```typescript
task("diamonds-forge:coverage", "Run forge coverage for Diamond contracts")
  .addParam("diamondName", "Name of the Diamond contract")
  .addOptionalParam("network", "Network to deploy to", "localhost")
  // Add all coverage-specific params
  .setAction(async (taskArgs, hre) => {
    // 1. Validate inputs
    // 2. Deploy Diamond (if needed)
    // 3. Generate helpers
    // 4. Run coverage via ForgeCoverageFramework
    // 5. Display results
  });
```

## Technical Considerations

### Dependencies

- **Existing**: All functionality builds on existing peer dependencies
- **Foundry**: Requires forge binary (already required by module)
- **No New Dependencies**: No additional npm packages needed

### Hardhat Network Compatibility

- **Persistent Networks Required**: Coverage requires forking from a running node
- **Localhost Default**: Use `localhost` as default network (not ephemeral `hardhat`)
- **Validation**: Task should validate network is running before proceeding

### Deployment Record Management

- Use existing deployment record system from `@diamondslab/diamonds`
- Records stored in `diamonds/<DiamondName>/deployments/`
- Same format as `diamonds-forge:test` and `diamonds-forge:deploy`

### Fork URL Detection

```typescript
function getForkUrl(
  hre: HardhatRuntimeEnvironment,
  networkName: string,
): string {
  const network = hre.config.networks[networkName];
  if (networkName === "localhost") {
    return "http://127.0.0.1:8545";
  }
  if (!network || !network.url) {
    throw new Error(`Network ${networkName} not configured`);
  }
  return network.url;
}
```

### Command Construction

Build forge command with all options:

```typescript
const command = [
  "forge",
  "coverage",
  "--fork-url",
  forkUrl,
  ...buildReportOptions(options),
  ...buildFilterOptions(options),
  ...buildDisplayOptions(options),
  ...buildTestOptions(options),
  ...buildEvmOptions(options),
  ...buildBuildOptions(options),
].filter(Boolean);
```

### Output Streaming

Stream forge output to terminal in real-time:

```typescript
import { spawn } from "child_process";

const process = spawn("forge", coverageArgs, {
  cwd: hre.config.paths.root,
  stdio: "inherit",
});

await new Promise((resolve, reject) => {
  process.on("close", (code) => {
    code === 0 ? resolve(code) : reject(new Error(`forge coverage failed`));
  });
});
```

### Helper Generation Timing

Generate helpers before running coverage (same as test task):

1. Check deployment status
2. Deploy if needed or forced
3. Generate DiamondDeployment.sol
4. Run coverage command

### Integration with Existing Tasks

Coverage task should work alongside existing tasks:

- `diamonds-forge:init` - Sets up test structure (no changes needed)
- `diamonds-forge:deploy` - Can be used to pre-deploy before coverage
- `diamonds-forge:generate-helpers` - Can be used standalone
- `diamonds-forge:test` - Coverage complements testing

## Success Metrics

### Functional Success Criteria

1. **Command Execution**: `npx hardhat diamonds-forge:coverage --diamond-name ExampleDiamond` completes successfully
2. **Report Generation**: Coverage reports generated in expected formats (summary, LCOV, etc.)
3. **Deployment Integration**: Diamond auto-deploys when not present
4. **Helper Integration**: DiamondDeployment.sol auto-generates with correct addresses
5. **Fork Integration**: Tests execute against deployed Diamond via fork URL
6. **Option Pass-Through**: All `forge coverage` options work correctly
7. **Error Handling**: Clear error messages for common failure scenarios

### Quality Metrics

1. **Test Coverage**: Achieve 100% test pass rate for coverage task (matching module's 141/141 standard)
2. **Documentation Coverage**: Complete documentation in README, TROUBLESHOOTING, and dedicated guide
3. **Code Quality**: ESLint passes with Diamond-specific security rules
4. **TypeScript Safety**: Full type safety with no `any` types
5. **Performance**: Coverage execution <10s overhead compared to direct `forge coverage`

### Developer Experience Metrics

1. **Single Command**: Developer runs one command instead of 3+ manual steps
2. **Zero Configuration**: Works with default settings (localhost, summary report)
3. **Clear Output**: Coverage summary visible immediately after execution
4. **CI/CD Ready**: Works in non-interactive environments with `--json` flag
5. **Help Documentation**: `--help` flag shows all options with descriptions

### Adoption Metrics (Post-Release)

1. **Usage Rate**: Percentage of projects using coverage command
2. **Issue Reports**: Number of bug reports related to coverage (target: <5 in first month)
3. **Documentation References**: Frequency of documentation access for coverage
4. **Community Feedback**: Positive feedback on coverage usability

## Open Questions

### Q1: Default Report Type

**Question**: Should we default to `summary` (terminal only) or generate LCOV by default?
**Options**:

- A) Default to `summary` (matches forge default, minimal output)
- B) Default to `summary` + `lcov` (generate lcov.info automatically)
- C) Require explicit `--report` flag (no defaults)

**Recommendation**: Option A (summary only) - matches forge behavior, users can add `--report lcov` if needed

### Q2: Coverage Directory

**Question**: Where should coverage artifacts be stored?
**Options**:

- A) Use Foundry's default (`coverage/` in root)
- B) Use custom directory (`test/foundry/coverage/`)
- C) Configurable via task parameter

**Recommendation**: Option A (Foundry default) - don't fight the framework, users familiar with forge expect default location

### Q3: Clean Coverage Option

**Question**: Should we provide a `--clean-coverage` flag to remove old coverage data?
**Options**:

- A) Yes - add flag to clean coverage directory before running
- B) No - users can manually delete or use `forge clean`
- C) Auto-clean on `--force` flag

**Recommendation**: Option C (auto-clean with --force) - leverages existing flag, minimal new API surface

### Q4: Multi-Report Defaults

**Question**: When using multiple `--report` flags, should we validate combinations?
**Options**:

- A) No validation - pass all to forge as-is
- B) Validate common combinations (summary + lcov)
- C) Auto-add summary if not present

**Recommendation**: Option A (no validation) - let forge handle it, less complexity

### Q5: Network Running Check

**Question**: Should we attempt to start a Hardhat node automatically if localhost isn't running?
**Options**:

- A) Yes - auto-start node in background
- B) No - require manual node start
- C) Prompt user to start node with helpful message

**Recommendation**: Option C (helpful message) - explicit is better than implicit, avoids orphaned processes

### Q6: Coverage with Self-Deploying Tests

**Question**: How should coverage handle tests that deploy their own Diamond (not using DiamondFuzzBase)?
**Options**:

- A) Coverage works for all tests (they run in Forge's EVM)
- B) Warn users that some tests may not need deployment
- C) Detect test types and conditionally deploy

**Recommendation**: Option A - coverage works for all test types, deployment is safe even if unused

## Implementation Phases

### Phase 1: Core Coverage Task (Week 1)

- Create `ForgeCoverageFramework` class
- Implement `diamonds-forge:coverage` task
- Support basic coverage options (--report, --report-file)
- Integration with `DeploymentManager` and `HelperGenerator`
- Basic test suite (coverage task execution, report generation)

### Phase 2: Option Pass-Through (Week 1-2)

- Implement all forge coverage option pass-through
- TypeScript type definitions for `CoverageOptions`
- Test filtering options (match-test, match-contract, etc.)
- Display options (verbosity, json, md)
- Test execution options (threads, fail-fast)

### Phase 3: Documentation (Week 2)

- Create `FOUNDRY_FORGE_DIAMONDS_COVERAGE.md` guide
- Update README.md with coverage section
- Add coverage examples to TROUBLESHOOTING.md
- Update CHANGELOG.md with coverage feature
- Add JSDoc comments to all coverage code

### Phase 4: Testing & Validation (Week 2)

- Comprehensive test suite for coverage task
- Integration tests with ExampleDiamond
- Test all report formats (summary, lcov, debug)
- Validate CI/CD workflows
- Performance benchmarking

### Phase 5: Release Preparation (Week 2-3)

- Update package version to 2.2.0
- Update RELEASE_SUMMARY.md
- Create migration notes (if needed)
- Prepare release announcement
- Tag and publish to npm

## Target Audience

### Primary Audience: Diamond Contract Developers

- **Experience Level**: Intermediate to senior developers
- **Familiarity**: Comfortable with Hardhat, Foundry, and ERC-2535 Diamonds
- **Use Case**: Building production Diamond contracts, need quality metrics
- **Expectation**: Coverage works like `forge coverage` but with Diamond integration

### Secondary Audience: DevOps/QA Engineers

- **Experience Level**: Intermediate
- **Familiarity**: CI/CD pipelines, coverage tooling (Codecov, SonarQube)
- **Use Case**: Setting up automated coverage tracking
- **Expectation**: LCOV output compatible with standard coverage tools

### Tertiary Audience: Junior Developers

- **Experience Level**: Junior
- **Familiarity**: Basic Solidity, following team standards
- **Use Case**: Running coverage as part of development workflow
- **Expectation**: Single command with clear output, minimal configuration

## Documentation Requirements

### 1. Dedicated Guide: `FOUNDRY_FORGE_DIAMONDS_COVERAGE.md`

Location: `/workspaces/diamonds_dev_env/docs/`

**Contents**:

- Overview of coverage feature
- Basic usage with examples
- All command options with descriptions
- Report formats and interpretation
- CI/CD integration examples
- Troubleshooting common issues
- Best practices for coverage measurement

### 2. README.md Updates

Location: `/workspaces/diamonds_dev_env/packages/diamonds-hardhat-foundry/README.md`

**Additions**:

- Coverage section in Features list
- Quick start coverage example
- Link to dedicated coverage guide
- Coverage badge (if applicable)

### 3. TROUBLESHOOTING.md Updates

Location: `/workspaces/diamonds_dev_env/packages/diamonds-hardhat-foundry/TROUBLESHOOTING.md`

**Additions**:

- Coverage-specific error scenarios
- Report generation issues
- Network/fork problems with coverage
- LCOV compatibility issues

### 4. CHANGELOG.md Entry

Location: `/workspaces/diamonds_dev_env/packages/diamonds-hardhat-foundry/CHANGELOG.md`

**Entry for v2.2.0**:

```markdown
## [2.2.0] - YYYY-MM-DD

### Added

- **Coverage Task**: New `diamonds-forge:coverage` task for test coverage analysis
  - Full support for all `forge coverage` command options
  - Automatic Diamond deployment and helper generation
  - Multiple report formats (summary, LCOV, debug, bytecode)
  - Integration with CI/CD pipelines via LCOV output
- **ForgeCoverageFramework**: New framework class for coverage execution
- **Documentation**: Comprehensive coverage guide in docs/FOUNDRY_FORGE_DIAMONDS_COVERAGE.md
```

### 5. RELEASE_SUMMARY.md Updates

Location: `/workspaces/diamonds_dev_env/packages/diamonds-hardhat-foundry/RELEASE_SUMMARY.md`

**New Section**:

- Overview of coverage feature
- Key capabilities
- Usage examples
- Integration benefits

### 6. Inline Documentation (JSDoc)

All new classes and functions must include:

- Purpose description
- Parameter documentation
- Return value description
- Usage examples
- Error conditions

## Acceptance Criteria

### Must Have (Required for Release)

- [ ] `diamonds-forge:coverage` task implemented and functional
- [ ] All forge coverage options supported as pass-through flags
- [ ] Automatic Diamond deployment when not present
- [ ] DiamondDeployment.sol helper generation before coverage
- [ ] Fork URL construction for all network types
- [ ] Summary report output to terminal
- [ ] LCOV report generation with `--report lcov`
- [ ] Error handling for common scenarios
- [ ] TypeScript type definitions for all coverage options
- [ ] Test suite with >90% coverage of new code
- [ ] Integration tests with ExampleDiamond
- [ ] `FOUNDRY_FORGE_DIAMONDS_COVERAGE.md` guide created
- [ ] README.md updated with coverage section
- [ ] CHANGELOG.md entry for v2.2.0
- [ ] All existing tests still pass (141/141)

### Should Have (Highly Desired)

- [ ] `--force` flag forces redeployment and coverage
- [ ] `--json` flag for CI/CD machine-readable output
- [ ] Test filtering options (match-test, match-contract) working
- [ ] Verbosity levels (-v, -vv, -vvv) functional
- [ ] Coverage directory respects Foundry defaults
- [ ] TROUBLESHOOTING.md coverage section
- [ ] Examples for all major report formats
- [ ] CI/CD example configurations

### Could Have (Nice to Have)

- [ ] `--clean-coverage` flag or auto-clean with --force
- [ ] Network running validation with helpful error messages
- [ ] Coverage summary in JSON format for programmatic access
- [ ] Examples for integration with Codecov/SonarQube
- [ ] Performance benchmarks vs direct forge coverage

### Won't Have (Deferred)

- Coverage threshold enforcement
- Coverage comparison/diffing
- HTML report generation
- Multi-Diamond aggregated coverage
- Coverage trends/historical tracking

## Dependencies and Risks

### Dependencies

- **Foundry**: Requires forge binary with coverage support (already required)
- **DeploymentManager**: Reuses existing Diamond deployment logic
- **HelperGenerator**: Reuses existing helper generation logic
- **Network Node**: Requires running Hardhat node for localhost (same as test task)

### Risks and Mitigations

| Risk                             | Impact | Likelihood | Mitigation                                                 |
| -------------------------------- | ------ | ---------- | ---------------------------------------------------------- |
| Forge coverage command changes   | High   | Low        | Pin to stable forge version, test with multiple versions   |
| Complex option pass-through bugs | Medium | Medium     | Comprehensive test suite, validate all option combinations |
| Fork URL configuration issues    | Medium | Low        | Reuse proven network detection from test task              |
| Report format incompatibilities  | Low    | Low        | Use forge native formats, no custom parsing                |
| Performance degradation          | Low    | Low        | Coverage is inherently slower, set expectations in docs    |
| Network node not running         | Medium | Medium     | Clear error messages, documentation for setup              |

### Technical Debt Considerations

- **Code Duplication**: Some overlap with `ForgeFuzzingFramework` - consider refactoring common forge command logic
- **Option Explosion**: Many command flags - consider grouping/presets in future versions
- **Helper Generation**: Currently generates for every coverage run - could optimize with caching

## Version and Release Information

- **Target Version**: 2.2.0
- **Release Type**: Minor (new feature, backward compatible)
- **Breaking Changes**: None
- **Upgrade Path**: Drop-in upgrade, no migration needed
- **npm Tag**: `latest`

## Appendix

### Reference Commands

**Basic Coverage**:

```bash
npx hardhat diamonds-forge:coverage --diamond-name ExampleDiamond
```

**LCOV Report**:

```bash
npx hardhat diamonds-forge:coverage --diamond-name ExampleDiamond --report lcov
```

**Multiple Reports**:

```bash
npx hardhat diamonds-forge:coverage --diamond-name ExampleDiamond --report summary --report lcov --report debug
```

**With Test Filtering**:

```bash
npx hardhat diamonds-forge:coverage --diamond-name ExampleDiamond --match-contract "MyFacetTest"
```

**CI/CD Example**:

```bash
npx hardhat diamonds-forge:coverage --diamond-name ExampleDiamond --report lcov --json --force
```

**Custom Output Path**:

```bash
npx hardhat diamonds-forge:coverage --diamond-name ExampleDiamond --report lcov --report-file coverage/custom-lcov.info
```

### Forge Coverage Output Examples

**Summary Format** (default):

```
Analysing contracts...
Running tests...
| File                          | % Lines        | % Statements   | % Branches     | % Funcs        |
|-------------------------------|----------------|----------------|----------------|----------------|
| src/facets/ExampleFacet.sol   | 100.00% (25/25)| 100.00% (30/30)| 100.00% (8/8)  | 100.00% (5/5)  |
| src/Diamond.sol               | 95.00% (19/20) | 95.00% (22/23) | 90.00% (9/10)  | 100.00% (3/3)  |
| Total                         | 97.78% (44/45) | 98.11% (52/53) | 94.44% (17/18) | 100.00% (8/8)  |
```

**LCOV Format** (lcov.info):

```
TN:
SF:src/facets/ExampleFacet.sol
FN:15,constructor
FN:25,setValue
FNDA:1,constructor
FNDA:10,setValue
DA:16,1
DA:26,10
LH:2
LF:2
end_of_record
```

### Related Documentation

- [Forge Coverage Reference](https://book.getfoundry.sh/reference/forge/forge-coverage)
- [LCOV Format Specification](http://ltp.sourceforge.net/coverage/lcov/geninfo.1.php)
- [@diamondslab/diamonds-hardhat-foundry README](./packages/diamonds-hardhat-foundry/README.md)
- [Foundry Book - Testing](https://book.getfoundry.sh/forge/tests)

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-30  
**Status**: Draft - Awaiting Approval
