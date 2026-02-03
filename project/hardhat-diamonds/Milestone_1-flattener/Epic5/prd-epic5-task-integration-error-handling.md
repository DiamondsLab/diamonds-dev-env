# Product Requirements Document: Epic 5 - Task Integration & Error Handling

**Feature Name:** Diamond Flatten Task Integration & Error Handling  
**Epic ID:** E5  
**Version:** 1.0  
**Date:** February 1, 2026  
**Author:** DiamondsLab Team  
**Status:** Draft

---

## 1. Introduction/Overview

This PRD defines the implementation requirements for Epic 5 of the Diamond Flatten feature, which focuses on integrating the flattening engine into a complete Hardhat task with comprehensive error handling and programmatic API support.

### Problem Statement

Developers need a robust, user-friendly way to flatten Diamond proxy contracts for:

- **Security audits**: Auditors require a single-file view of the entire Diamond contract system
- **CI/CD integration**: Automated pipelines need programmatic access to flattening functionality
- **Plugin development**: Third-party tools need to build on top of the flattening capability
- **Debugging**: Developers need clear error messages with actionable guidance when issues occur

Currently, the Diamond Flatten feature has the core flattening engine (from Epics 2-4), but lacks:

- A complete task action handler that orchestrates the flattening workflow
- Comprehensive error handling with detailed troubleshooting guidance
- A programmatic API for non-CLI usage scenarios
- Proper progress feedback and summary statistics

### Goal

Deliver a production-ready `diamond:flatten` Hardhat task with equal focus on three critical components:

1. **Task Handler**: Complete CLI integration with proper argument validation and output handling
2. **Programmatic API**: Export functions for use in scripts, CI/CD, and plugin development
3. **Error Handling**: Comprehensive error classes with detailed context and troubleshooting steps

---

## 2. Goals

### Primary Goals

1. **G1: Complete Task Integration**
   - Implement the full task action handler that orchestrates validation, flattening, and output
   - Support both stdout and file-based output modes
   - Provide summary statistics for all executions

2. **G2: Robust Error Handling**
   - Create detailed error messages with troubleshooting context
   - Continue execution with warnings for non-critical issues (graceful degradation)
   - Provide actionable suggestions for every error scenario

3. **G3: Programmatic API**
   - Export `flattenDiamond()` function for library usage
   - Support all usage scenarios: scripts, CI/CD pipelines, and plugin development
   - Maintain consistent behavior between CLI and programmatic modes

### Secondary Goals

1. **G4: Developer Experience**
   - Always show summary statistics (even in non-verbose mode)
   - Verbose mode provides additional execution details
   - Clear, color-coded console output

2. **G5: Production Readiness**
   - 90%+ code coverage for all new code
   - Comprehensive acceptance tests for end-to-end workflows
   - Documentation with usage examples

---

## 3. User Stories

### US-E5-1: Security Auditor Using CLI

**As a** security auditor  
**I want to** run `npx hardhat diamond:flatten --diamond-name MyDiamond --output audit.sol`  
**So that** I can review the entire Diamond contract system in a single file for my audit

**Acceptance Criteria:**

- Task validates the diamond name exists
- Flattened output is written to `audit.sol`
- Summary shows total facets, selectors, and contracts processed
- Any warnings are displayed (e.g., duplicate contracts, version mismatches)

---

### US-E5-2: DevOps Engineer in CI/CD Pipeline

**As a** DevOps engineer  
**I want to** programmatically flatten Diamonds in my deployment pipeline  
**So that** I can automatically generate audit artifacts for each release

**Acceptance Criteria:**

- Can import and call `flattenDiamond(hre, { diamondName: 'MyDiamond' })`
- Returns structured result with `flattenedSource` and `stats`
- Works without the Hardhat task system
- Throws typed errors that can be caught and handled

---

### US-E5-3: Plugin Developer Building Extensions

**As a** plugin developer  
**I want to** use the DiamondFlattener class directly  
**So that** I can build custom tooling on top of the flattening engine

**Acceptance Criteria:**

- `DiamondFlattener` class is exported from the package
- Can instantiate with custom options
- Can call `flatten()` method and receive structured results
- JSDoc provides usage examples

---

### US-E5-4: Developer Troubleshooting Configuration Issues

**As a** developer  
**I want to** receive detailed error messages when flattening fails  
**So that** I can quickly understand and fix the problem

**Acceptance Criteria:**

- Error message clearly states what went wrong
- Error includes suggestion (e.g., "Check diamonds.paths in hardhat.config.ts")
- Error includes context (e.g., which diamond name was not found)
- Verbose mode shows full stack trace

---

### US-E5-5: Developer Monitoring Flatten Progress

**As a** developer  
**I want to** see summary statistics after flattening  
**So that** I can verify the operation completed successfully

**Acceptance Criteria:**

- Summary always shown when writing to file
- Summary shows: facet count, selector count, contract count, lines, deduplicated contracts, execution time
- Verbose mode shows additional details during execution
- Color-coded output (blue for info, yellow for warnings, green for success, red for errors)

---

## 4. Functional Requirements

### FR-E5-1: Task Action Handler Implementation

**FR-E5-1.1** The task action handler MUST validate all arguments using `TaskValidation.validateDiamondFlattenArgs()` before execution

**FR-E5-1.2** The task action handler MUST display validation warnings (if any) in yellow using chalk

**FR-E5-1.3** The task action handler MUST create a `DiamondFlattener` instance with options derived from task arguments and HRE config

**FR-E5-1.4** The task action handler MUST execute `flattener.flatten()` and handle the returned `DiamondFlattenResult`

**FR-E5-1.5** When `--output` is NOT specified, the task MUST write the flattened source to stdout

**FR-E5-1.6** When `--output` IS specified, the task MUST:

- Resolve the output path relative to the Hardhat root
- Create parent directories recursively if they don't exist
- Write the flattened source to the specified file
- Display the output path in the console

**FR-E5-1.7** The task MUST display summary statistics when:

- Verbose mode is enabled (`--verbose`), OR
- Output file is specified (`--output <path>`)

**FR-E5-1.8** Summary statistics MUST include (in order):

1. Total facets processed
2. Total function selectors
3. Total contracts included
4. Total lines of code
5. Number of deduplicated contracts
6. Execution time in milliseconds

**FR-E5-1.9** The task MUST display all warnings from the flatten result in yellow

**FR-E5-1.10** The task MUST catch all errors and:

- Display error message in red
- Show stack trace only in verbose mode
- Exit with process code 1

---

### FR-E5-2: Programmatic API

**FR-E5-2.1** The package MUST export a `flattenDiamond()` function with signature:

```typescript
function flattenDiamond(
  hre: HardhatRuntimeEnvironment,
  options: Partial<DiamondFlattenOptions> & { diamondName: string },
): Promise<DiamondFlattenResult>;
```

**FR-E5-2.2** The `flattenDiamond()` function MUST accept required option `diamondName`

**FR-E5-2.3** The `flattenDiamond()` function MUST support all optional `DiamondFlattenOptions` properties:

- `networkName` (defaults to `hre.network.name`)
- `chainId` (defaults to `hre.network.config.chainId` or `31337`)
- `diamondsPath` (defaults to `<root>/diamonds`)
- `contractsPath` (defaults to `hre.config.paths.sources`)
- `verbose` (defaults to `false`)

**FR-E5-2.4** The `flattenDiamond()` function MUST create a `DiamondFlattener` instance internally and call `flatten()`

**FR-E5-2.5** The `flattenDiamond()` function MUST return the full `DiamondFlattenResult` object

**FR-E5-2.6** The `flattenDiamond()` function MUST include JSDoc with:

- Description of what the function does
- Parameter documentation
- Return type documentation
- Usage example showing import and basic usage

**FR-E5-2.7** The package MUST export `DiamondFlattener` class for advanced usage

**FR-E5-2.8** The package MUST export supporting classes from `src/lib/index.ts`:

- `SourceResolver`
- `DependencyGraph`
- `OutputFormatter`

**FR-E5-2.9** The package MUST export programmatic API from `src/tasks/index.ts` for convenience

---

### FR-E5-3: Error Handling

**FR-E5-3.1** The package MUST define a `FlattenError` class extending `Error` with properties:

- `code: string` - Machine-readable error code
- `suggestion?: string` - Human-readable suggestion for fixing the error
- `context?: Record<string, unknown>` - Additional context information

**FR-E5-3.2** The package MUST define `FlattenErrorCode` constant object with error codes:

- `DIAMOND_NOT_FOUND` - Diamond configuration not found
- `FACET_SOURCE_NOT_FOUND` - Facet source file not found
- `DEPENDENCY_RESOLUTION_FAILED` - Cannot resolve contract dependencies
- `CIRCULAR_DEPENDENCY` - Circular dependency detected
- `FILE_WRITE_FAILED` - Cannot write output file
- `VALIDATION_FAILED` - Argument validation failed

**FR-E5-3.3** Every `FlattenError` thrown MUST include:

- Clear error message describing what went wrong
- Appropriate error code from `FlattenErrorCode`
- Actionable suggestion (e.g., "Check diamonds.paths in hardhat.config.ts")
- Relevant context (e.g., `{ diamondName: 'MyDiamond' }`)

**FR-E5-3.4** When a Diamond is not found, the error MUST:

- Message: "Diamond "{name}" not found in configuration"
- Code: `DIAMOND_NOT_FOUND`
- Suggestion: "Check diamonds.paths in hardhat.config.ts"
- Context: `{ diamondName }`

**FR-E5-3.5** When a facet source file is not found, the error MUST:

- Message: "Source file for facet {facetName} not found at {path}"
- Code: `FACET_SOURCE_NOT_FOUND`
- Suggestion: "Ensure the contract is compiled and the path is correct"
- Context: `{ facetName, sourcePath }`

**FR-E5-3.6** When dependency resolution fails, the error MUST:

- Message: "Failed to resolve dependencies for {contractName}"
- Code: `DEPENDENCY_RESOLUTION_FAILED`
- Suggestion: "Run 'npx hardhat compile' and ensure all imports are valid"
- Context: `{ contractName, missingImports }`

**FR-E5-3.7** When a circular dependency is detected, the error MUST:

- Message: "Circular dependency detected: {cycle}"
- Code: `CIRCULAR_DEPENDENCY`
- Suggestion: "Refactor contracts to remove circular imports"
- Context: `{ cycle: string[] }`

**FR-E5-3.8** When file write fails, the error MUST:

- Message: "Failed to write output file to {path}"
- Code: `FILE_WRITE_FAILED`
- Suggestion: "Check directory permissions and available disk space"
- Context: `{ outputPath, originalError }`

**FR-E5-3.9** Non-critical issues MUST be handled as warnings (not errors):

- Pragma version mismatches (e.g., using ^0.8.0 for all contracts)
- SPDX license differences (e.g., using first encountered license)
- Duplicate contract definitions (using first occurrence)
- Missing NatSpec documentation

**FR-E5-3.10** All warnings MUST be collected in the `DiamondFlattenResult.warnings` array

---

### FR-E5-4: Console Output and Feedback

**FR-E5-4.1** Console output MUST use chalk for color coding:

- Blue for informational messages
- Yellow for warnings
- Green for success messages
- Red for errors
- Gray for secondary information (stats)

**FR-E5-4.2** Verbose mode MUST display:

- "🔍 Validating arguments..." before validation
- "🔨 Flattening {diamondName}..." before flattening
- Additional progress messages during execution

**FR-E5-4.3** Summary statistics MUST use consistent formatting:

```
📊 Summary:
   Facets:     5
   Selectors:  42
   Contracts:  18
   Lines:      2,456
   Deduped:    3
   Time:       1,234ms
```

**FR-E5-4.4** File output success MUST display:

```
✅ Written to: /path/to/output.sol
```

**FR-E5-4.5** Warnings MUST be displayed in a numbered list:

```
⚠ 2 warning(s):
   - Using pragma ^0.8.0 (found multiple versions)
   - Deduplicated 3 contracts
```

---

### FR-E5-5: Exit Codes and Process Handling

**FR-E5-5.1** The task MUST exit with code `0` on successful completion

**FR-E5-5.2** The task MUST exit with code `1` when any error occurs

**FR-E5-5.3** The task MUST call `process.exit(1)` explicitly in the catch block

---

### FR-E5-6: Module Exports

**FR-E5-6.1** `src/lib/index.ts` MUST export:

```typescript
export { DiamondFlattener, flattenDiamond } from "./DiamondFlattener";
export { SourceResolver } from "./SourceResolver";
export { DependencyGraph } from "./DependencyGraph";
export { OutputFormatter } from "./OutputFormatter";
export { FlattenError, FlattenErrorCode } from "./errors";
```

**FR-E5-6.2** `src/tasks/index.ts` MUST export:

```typescript
export { flattenDiamond, DiamondFlattener } from "../lib/DiamondFlattener";
export { FlattenError, FlattenErrorCode } from "../lib/errors";
```

---

## 5. Non-Goals (Out of Scope)

The following are explicitly **NOT** included in Epic 5:

**NG-E5-1** Interactive mode with user prompts (e.g., selecting which facets to include)

**NG-E5-2** Progress bars or spinners during execution

**NG-E5-3** Different output modes for different users (dev vs. CI vs. audit) - single unified output

**NG-E5-4** Configurable behavior flags (--strict vs --permissive modes) - single default behavior

**NG-E5-5** Retry mechanisms for transient failures

**NG-E5-6** Logging to files (only console output)

**NG-E5-7** Integration with external error tracking services

**NG-E5-8** Custom error formatters or output templates

**NG-E5-9** Error recovery workflows (e.g., "Would you like to retry?")

**NG-E5-10** Localization/internationalization of error messages

---

## 6. Design Considerations

### Console Output Design

**Color Scheme:**

- **Blue** (`chalk.blue`): Informational progress messages
- **Yellow** (`chalk.yellow`): Warnings and non-critical issues
- **Green** (`chalk.green`): Success confirmations
- **Red** (`chalk.red`): Error messages
- **Gray** (`chalk.gray`): Secondary stats and details

**Output Format Examples:**

```bash
# Standard execution (non-verbose, stdout)
$ npx hardhat diamond:flatten --diamond-name ExampleDiamond
// <flattened source code>

# Verbose execution to file
$ npx hardhat diamond:flatten --diamond-name ExampleDiamond --output flat.sol --verbose
🔍 Validating arguments...
⚠ Network not specified, using default: hardhat

🔨 Flattening ExampleDiamond...

✅ Written to: /path/to/flat.sol

📊 Summary:
   Facets:     5
   Selectors:  42
   Contracts:  18
   Lines:      2,456
   Deduped:    3
   Time:       1,234ms

⚠ 2 warning(s):
   - Using pragma ^0.8.0 (found multiple versions: 0.8.19, 0.8.20)
   - Deduplicated 3 contracts (IDiamondCut appeared in multiple facets)

# Error scenario
$ npx hardhat diamond:flatten --diamond-name NonExistent
🔍 Validating arguments...

❌ Failed: Diamond "NonExistent" not found in configuration
   💡 Suggestion: Check diamonds.paths in hardhat.config.ts
```

### API Design Philosophy

**Consistency:** Programmatic API should produce identical results to CLI usage with the same inputs

**Flexibility:** Support partial options with sensible defaults from HRE

**TypeScript-First:** Full type safety with exported interfaces and types

**Error Transparency:** Throw typed `FlattenError` instances that can be caught and inspected

---

## 7. Technical Considerations

### Dependencies

**Required Packages:**

- `chalk` - Console color output (already in dependencies)
- `fs` / `fs/promises` - File system operations (Node.js built-in)
- `path` - Path manipulation (Node.js built-in)

**No New Dependencies Required** - Epic 5 uses existing project dependencies

### File Structure

```
packages/hardhat-diamonds/src/
├── lib/
│   ├── DiamondFlattener.ts      [MODIFY: Add flattenDiamond() export]
│   ├── SourceResolver.ts         [EXISTS from Epic 3]
│   ├── DependencyGraph.ts        [EXISTS from Epic 3]
│   ├── OutputFormatter.ts        [EXISTS from Epic 4]
│   ├── errors.ts                 [NEW: Error classes]
│   └── index.ts                  [MODIFY: Add exports]
├── tasks/
│   ├── diamond-flatten.ts        [MODIFY: Complete action handler]
│   ├── index.ts                  [MODIFY: Add exports]
│   └── shared/
│       ├── TaskOptions.ts        [EXISTS: Interfaces defined in Epic 1]
│       └── TaskValidation.ts     [EXISTS: Validation from Epic 1]
└── test/
    └── tasks/
        ├── diamond-flatten.test.ts           [MODIFY: Add E5 tests]
        └── integration/
            └── flatten-integration.test.ts   [NEW: End-to-end tests]
```

### Integration Points

**Epic 1 Dependencies:**

- `TaskValidation.validateDiamondFlattenArgs()` - Argument validation
- `DiamondFlattenTaskArgs` interface
- Task registration (already in place)

**Epic 2 Dependencies:**

- `DiamondDiscovery` - Facet discovery (used by DiamondFlattener)
- `DiamondsConfig` - Diamond configuration access

**Epic 3 Dependencies:**

- `SourceResolver` - Source file resolution
- `DependencyGraph` - Dependency tracking

**Epic 4 Dependencies:**

- `OutputFormatter` - Final output generation

### Error Handling Strategy

**Graceful Degradation (FR-E5-3.9):**

Non-critical issues should NOT fail the flatten operation. Instead:

1. **Collect warnings** in an array
2. **Use reasonable defaults** (e.g., first encountered pragma version)
3. **Add warning message** explaining what happened
4. **Continue execution**

Examples:

- Multiple pragma versions → Use first encountered, warn about normalization
- Missing SPDX license → Use first encountered or "UNLICENSED", warn
- Duplicate contracts → Use first occurrence, warn about deduplication

**Critical Errors:**

Only fail the operation for:

- Diamond configuration not found
- Facet source files missing
- Unresolvable dependencies
- File system errors (write failures)
- Circular dependencies

### TypeScript Module Exports

**Two Export Points:**

1. **`src/lib/index.ts`** - Core library exports for advanced usage
2. **`src/tasks/index.ts`** - Convenience exports for task-level usage

**Why Two Entry Points?**

- Library users may not want task-related code
- Task consumers get everything in one import
- Follows Hardhat plugin conventions

### Performance Considerations

**Target: < 30s for 25-facet Diamond** (from project plan)

Epic 5 adds minimal overhead:

- Argument validation: ~5ms
- File I/O for output: ~10-50ms
- Console formatting: ~5-10ms

Most execution time is in Epics 2-4 (discovery, resolution, formatting)

### Testing Strategy

**Unit Tests (90% coverage target):**

- Task action handler error paths
- `flattenDiamond()` function with various options
- `FlattenError` instantiation and properties
- Exit code behavior (mocked `process.exit`)

**Integration Tests:**

- End-to-end task execution via `hre.run()`
- Programmatic API with real Diamond configs
- File output verification
- Warning collection and display

**Acceptance Tests (Epic 5 completion criteria):**

- E5-AT1: Task outputs to stdout
- E5-AT2: Task outputs to file
- E5-AT3: Programmatic API works
- E5-AT4: Errors include suggestions

---

## 8. Success Metrics

### Code Quality Metrics

| Metric                 | Target | Measurement Method             |
| ---------------------- | ------ | ------------------------------ |
| Test Coverage          | ≥ 90%  | Jest/Mocha coverage report     |
| TypeScript Strict Mode | 100%   | No `any` types, strict enabled |
| JSDoc Coverage         | 100%   | All public APIs documented     |
| Linting Errors         | 0      | ESLint with project config     |

### Functional Metrics

| Metric                    | Target | Verification Method                   |
| ------------------------- | ------ | ------------------------------------- |
| Task Execution Success    | 100%   | All acceptance tests pass             |
| Error Suggestion Coverage | 100%   | Every error code has suggestion       |
| Warning Capture           | 100%   | All non-critical issues → warnings    |
| Programmatic API Parity   | 100%   | CLI and API produce identical results |

### Performance Metrics

| Metric                    | Target  | Measurement Method           |
| ------------------------- | ------- | ---------------------------- |
| Task Overhead (vs Epic 4) | < 50ms  | Performance benchmarks       |
| File Write Operations     | < 100ms | File system timing tests     |
| Error Handling Overhead   | < 10ms  | Error path performance tests |

### User Experience Metrics

| Metric                     | Target | Measurement Method               |
| -------------------------- | ------ | -------------------------------- |
| Clear Error Messages       | 100%   | Manual review of all error paths |
| Console Output Consistency | 100%   | Color scheme used consistently   |
| Documentation Completeness | 100%   | All features have usage examples |

---

## 9. Open Questions

### OQ-E5-1: Error Context Serialization

**Question:** Should error context be JSON-serializable for logging/monitoring tools?

**Impact:** Medium - Affects how context objects are structured

**Options:**

- A) Keep as `Record<string, unknown>`, document that consumers may need to serialize
- B) Restrict to `Record<string, string | number | boolean>` for guaranteed serializability
- C) Provide `toJSON()` method on `FlattenError` for structured logging

**Recommendation:** Start with A (simple), add B or C if users request it

---

### OQ-E5-2: Verbose Mode Granularity

**Question:** Should verbose mode have multiple levels (e.g., `-v`, `-vv`, `-vvv`)?

**Impact:** Low - Can be added later without breaking changes

**Options:**

- A) Single `--verbose` flag (current design)
- B) Multiple levels: `--verbose`, `--very-verbose`, `--debug`
- C) Numeric levels: `--verbose=1`, `--verbose=2`, `--verbose=3`

**Recommendation:** Start with A (simpler), add levels if users request specific use cases

---

### OQ-E5-3: Error Recovery Hooks

**Question:** Should the programmatic API support error recovery hooks (e.g., `onWarning`, `onError` callbacks)?

**Impact:** Medium - Would require API design changes

**Options:**

- A) Current design - errors throw, warnings in result
- B) Add optional callbacks: `{ onWarning: (msg) => {...} }`
- C) Add event emitter pattern: `flattener.on('warning', ...)`

**Recommendation:** Start with A, consider B for v2 based on user feedback

---

### OQ-E5-4: Output to Multiple Formats

**Question:** Should the task support outputting to multiple destinations in one run?

**Impact:** Low - Out of scope for Epic 5, but worth considering

**Options:**

- A) Single output destination (current design)
- B) Allow multiple `--output` flags: `--output audit.sol --output analysis.sol`
- C) Support output manifest: `--output-config outputs.json`

**Recommendation:** Explicitly mark as out of scope (NG-E5-11), revisit in future epic

**Decision Required By:** Before Epic 5 development starts

---

### OQ-E5-5: Stack Trace Formatting

**Question:** Should verbose mode show formatted/prettified stack traces?

**Impact:** Very Low - Nice to have, not critical

**Options:**

- A) Show raw stack trace (current design)
- B) Use a library like `pretty-error` for formatted stacks
- C) Show only relevant stack frames (filter out node_modules)

**Recommendation:** Start with A (simple), consider B if verbose mode is used heavily

---

## 10. Acceptance Criteria Summary

Epic 5 is considered **COMPLETE** when:

### Development Complete

- [ ] All functional requirements (FR-E5-1 through FR-E5-6) implemented
- [ ] `FlattenError` class created with all error codes
- [ ] `flattenDiamond()` function exported and documented
- [ ] Task action handler complete with all console output
- [ ] Module exports configured in `lib/index.ts` and `tasks/index.ts`

### Testing Complete

- [ ] Unit test coverage ≥ 90%
- [ ] All 4 acceptance tests passing (E5-AT1 through E5-AT4)
- [ ] Integration tests for end-to-end workflows passing
- [ ] Error path coverage: all error codes tested

### Documentation Complete

- [ ] JSDoc for `flattenDiamond()` with usage example
- [ ] Error handling documentation with all error codes
- [ ] README examples for CLI and programmatic usage
- [ ] Troubleshooting guide with common errors

### Code Review Complete

- [ ] TypeScript strict mode compliance
- [ ] ESLint passing with no warnings
- [ ] Peer review of error messages and suggestions
- [ ] Console output manually verified for UX

---

## Appendix A: Error Reference Table

| Error Code                     | When Thrown                  | Suggestion                                      |
| ------------------------------ | ---------------------------- | ----------------------------------------------- |
| `DIAMOND_NOT_FOUND`            | Diamond config doesn't exist | Check diamonds.paths in hardhat.config.ts       |
| `FACET_SOURCE_NOT_FOUND`       | Facet .sol file missing      | Ensure contract is compiled and path is correct |
| `DEPENDENCY_RESOLUTION_FAILED` | Can't resolve imports        | Run 'npx hardhat compile' and check imports     |
| `CIRCULAR_DEPENDENCY`          | Import cycle detected        | Refactor contracts to remove circular imports   |
| `FILE_WRITE_FAILED`            | Can't write output file      | Check directory permissions and disk space      |
| `VALIDATION_FAILED`            | Task arguments invalid       | See validation errors above                     |

---

## Appendix B: Warning Reference Table

| Warning Type            | Trigger Condition                 | Default Behavior                        |
| ----------------------- | --------------------------------- | --------------------------------------- |
| Pragma version mismatch | Multiple pragma versions found    | Use first encountered, normalize others |
| SPDX license difference | Contracts have different licenses | Use first encountered license           |
| Duplicate contract      | Same contract in multiple facets  | Use first occurrence, skip duplicates   |
| Missing NatSpec         | Contract lacks documentation      | Continue without documentation          |

---

## Appendix C: Example Usage Scenarios

### Scenario 1: Security Audit Preparation

```bash
# Generate flattened file for audit
npx hardhat diamond:flatten \
  --diamond-name ProductionDiamond \
  --network mainnet \
  --output audit/ProductionDiamond-flat.sol \
  --verbose

# Output:
# 🔍 Validating arguments...
# 🔨 Flattening ProductionDiamond...
# ✅ Written to: audit/ProductionDiamond-flat.sol
# 📊 Summary:
#    Facets:     12
#    Selectors:  87
#    Contracts:  45
#    Lines:      5,432
#    Deduped:    8
#    Time:       2,145ms
```

### Scenario 2: CI/CD Integration

```typescript
// scripts/flatten-for-release.ts
import { flattenDiamond } from "@diamondslab/hardhat-diamonds";
import hre from "hardhat";
import fs from "fs/promises";

async function main() {
  console.log("Flattening all Diamonds for release...");

  const diamonds = ["CoreDiamond", "GovernanceDiamond", "TokenDiamond"];

  for (const diamondName of diamonds) {
    try {
      const result = await flattenDiamond(hre, {
        diamondName,
        networkName: "mainnet",
      });

      await fs.writeFile(
        `release/flattened/${diamondName}.sol`,
        result.flattenedSource,
      );

      console.log(
        `✅ ${diamondName}: ${result.stats.totalSelectors} selectors`,
      );
    } catch (error) {
      console.error(`❌ ${diamondName} failed:`, error.message);
      process.exit(1);
    }
  }
}

main();
```

### Scenario 3: Plugin Development

```typescript
// my-custom-plugin/src/analyzer.ts
import { DiamondFlattener } from "@diamondslab/hardhat-diamonds";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

export class DiamondAnalyzer {
  constructor(private hre: HardhatRuntimeEnvironment) {}

  async analyzeDiamond(diamondName: string) {
    const flattener = new DiamondFlattener(this.hre, {
      diamondName,
      networkName: this.hre.network.name,
      chainId: this.hre.network.config.chainId || 31337,
      verbose: false,
    });

    const result = await flattener.flatten();

    // Custom analysis logic
    return {
      complexity: this.calculateComplexity(result.flattenedSource),
      selectorCount: result.stats.totalSelectors,
      securityScore: this.analyzeSecurityPatterns(result.flattenedSource),
    };
  }

  private calculateComplexity(source: string): number {
    // Custom complexity calculation
    return source.split("\n").length;
  }

  private analyzeSecurityPatterns(source: string): number {
    // Custom security analysis
    return 0.95;
  }
}
```

---

**End of PRD**
