# Epic 5: Task Integration & Error Handling

### 5.1 Epic Overview

| Attribute        | Value                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------- |
| **Epic ID**      | E5                                                                                        |
| **Title**        | Task Integration & Error Handling                                                         |
| **Objective**    | Complete task action handler with error handling, progress feedback, and programmatic API |
| **Story Points** | 8                                                                                         |
| **Sprint**       | Sprint 3                                                                                  |
| **Dependencies** | Epic 1, Epic 4                                                                            |
| **Assignee**     | TBD                                                                                       |

### 5.2 Features

---

#### Feature E5-F1: Task Action Handler

**Objective:** Implement complete task action handler.

**File:** `src/tasks/diamond-flatten.ts`

**Implementation:**

```typescript
.setAction(async (args: DiamondFlattenTaskArgs, hre: HardhatRuntimeEnvironment) => {
  const startTime = Date.now();
  const helpers = new TaskHelpers(hre);
  const validation = new TaskValidation(hre);

  try {
    // 1. Validate arguments
    if (args.verbose) console.log(chalk.blue("🔍 Validating arguments..."));

    const validationResult = validation.validateDiamondFlattenArgs(args);
    if (!validationResult.isValid) {
      TaskValidation.formatValidationResult(validationResult, args.verbose);
      throw new FlattenError("Validation failed", "VALIDATION_FAILED");
    }

    validationResult.warnings.forEach(w => console.log(chalk.yellow(`⚠ ${w}`)));

    // 2. Create flattener
    const flattener = new DiamondFlattener(hre, {
      diamondName: args.diamondName,
      networkName: args.network || hre.network.name,
      chainId: hre.network.config.chainId || 31337,
      verbose: args.verbose || false,
    });

    // 3. Execute flatten
    if (args.verbose) console.log(chalk.blue(`\n🔨 Flattening ${args.diamondName}...`));

    const result = await flattener.flatten();

    // 4. Output
    if (args.output) {
      const outputPath = resolve(hre.config.paths.root, args.output);
      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, result.flattenedSource, "utf-8");
      console.log(chalk.green(`\n✅ Written to: ${outputPath}`));
    } else {
      console.log(result.flattenedSource);
    }

    // 5. Summary (verbose or file output)
    if (args.verbose || args.output) {
      console.log(chalk.blue("\n📊 Summary:"));
      console.log(chalk.gray(`   Facets:     ${result.stats.totalFacets}`));
      console.log(chalk.gray(`   Selectors:  ${result.stats.totalSelectors}`));
      console.log(chalk.gray(`   Contracts:  ${result.stats.totalContracts}`));
      console.log(chalk.gray(`   Lines:      ${result.stats.totalLines}`));
      console.log(chalk.gray(`   Deduped:    ${result.stats.deduplicatedContracts}`));
      console.log(chalk.gray(`   Time:       ${Date.now() - startTime}ms`));
    }

    // 6. Warnings
    if (result.warnings.length > 0) {
      console.log(chalk.yellow(`\n⚠ ${result.warnings.length} warning(s):`));
      result.warnings.forEach(w => console.log(chalk.yellow(`   - ${w}`)));
    }

    return result;

  } catch (error) {
    console.error(chalk.red(`\n❌ Failed: ${error.message}`));
    if (args.verbose && error.stack) {
      console.error(chalk.gray(error.stack));
    }
    process.exit(1);
  }
});
```

**Completion Criteria:**

| #   | Criterion                              | Verification |
| --- | -------------------------------------- | ------------ |
| 1   | Validates arguments before execution   | Unit test    |
| 2   | Outputs to stdout when no --output     | CLI test     |
| 3   | Writes to file when --output specified | CLI test     |
| 4   | Creates parent directories for output  | CLI test     |
| 5   | Shows summary in verbose mode          | CLI test     |
| 6   | Shows summary when writing to file     | CLI test     |
| 7   | Displays warnings                      | CLI test     |
| 8   | Exits with code 1 on failure           | CLI test     |
| 9   | Shows execution time                   | CLI test     |

---

#### Feature E5-F2: Programmatic API

**Objective:** Export function for programmatic use.

**Implementation:**

````typescript
// src/lib/DiamondFlattener.ts - add export

/**
 * Flatten a Diamond contract programmatically
 *
 * @example
 * ```typescript
 * import { flattenDiamond } from '@diamondslab/hardhat-diamonds';
 *
 * const result = await flattenDiamond(hre, {
 *   diamondName: 'MyDiamond',
 *   verbose: true,
 * });
 *
 * console.log(result.stats.totalSelectors);
 * fs.writeFileSync('flattened.sol', result.flattenedSource);
 * ```
 */
export async function flattenDiamond(
  hre: HardhatRuntimeEnvironment,
  options: Partial<DiamondFlattenOptions> & { diamondName: string },
): Promise<DiamondFlattenResult> {
  const flattener = new DiamondFlattener(hre, {
    diamondName: options.diamondName,
    networkName: options.networkName || hre.network.name,
    chainId: options.chainId || hre.network.config.chainId || 31337,
    diamondsPath:
      options.diamondsPath || join(hre.config.paths.root, "diamonds"),
    contractsPath: options.contractsPath || hre.config.paths.sources,
    verbose: options.verbose || false,
  });

  return flattener.flatten();
}
````

**Exports to Add:**

```typescript
// src/lib/index.ts
export { DiamondFlattener, flattenDiamond } from "./DiamondFlattener";
export { SourceResolver } from "./SourceResolver";
export { DependencyGraph } from "./DependencyGraph";
export { OutputFormatter } from "./OutputFormatter";

// src/tasks/index.ts
export { flattenDiamond, DiamondFlattener } from "../lib/DiamondFlattener";
```

**Completion Criteria:**

| #   | Criterion                          | Verification |
| --- | ---------------------------------- | ------------ |
| 1   | flattenDiamond() function exported | Import test  |
| 2   | Accepts HRE and options            | Unit test    |
| 3   | Returns DiamondFlattenResult       | Unit test    |
| 4   | JSDoc with example                 | Code review  |
| 5   | Works without task system          | Unit test    |
| 6   | DiamondFlattener class exported    | Import test  |

---

#### Feature E5-F3: Error Handling

**Objective:** Implement comprehensive error handling with helpful messages.

**Implementation:**

```typescript
// src/lib/errors.ts

export class FlattenError extends Error {
  public readonly code: string;
  public readonly suggestion?: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    suggestion?: string,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "FlattenError";
    this.code = code;
    this.suggestion = suggestion;
    this.context = context;
  }
}

export const FlattenErrorCode = {
  DIAMOND_NOT_FOUND: "DIAMOND_NOT_FOUND",
  FACET_SOURCE_NOT_FOUND: "FACET_SOURCE_NOT_FOUND",
  DEPENDENCY_RESOLUTION_FAILED: "DEPENDENCY_RESOLUTION_FAILED",
  CIRCULAR_DEPENDENCY: "CIRCULAR_DEPENDENCY",
  FILE_WRITE_FAILED: "FILE_WRITE_FAILED",
  VALIDATION_FAILED: "VALIDATION_FAILED",
} as const;
```

**Error Usage Example:**

```typescript
// In DiamondFlattener.initializeDiamond()
try {
  const config = this.diamondsConfig.getDiamondConfig(this.options.diamondName);
} catch {
  throw new FlattenError(
    `Diamond "${this.options.diamondName}" not found in configuration`,
    FlattenErrorCode.DIAMOND_NOT_FOUND,
    "Check diamonds.paths in hardhat.config.ts",
    { diamondName: this.options.diamondName },
  );
}
```

**Completion Criteria:**

| #   | Criterion                      | Verification |
| --- | ------------------------------ | ------------ |
| 1   | FlattenError class created     | Code review  |
| 2   | All error codes defined        | Code review  |
| 3   | All errors include suggestions | Code review  |
| 4   | Context information available  | Unit test    |
| 5   | Errors properly caught in task | CLI test     |
| 6   | Stack traces in verbose only   | CLI test     |

---

### 5.3 Epic 5 Completion Criteria

| #   | Criterion                 | Verification Method |
| --- | ------------------------- | ------------------- |
| 1   | Task executes end-to-end  | CLI test            |
| 2   | stdout output works       | CLI test            |
| 3   | File output works         | CLI test            |
| 4   | Verbose mode shows detail | CLI test            |
| 5   | Programmatic API works    | Unit test           |
| 6   | Errors have suggestions   | Unit test           |
| 7   | Exit codes correct        | CLI test            |
| 8   | Code coverage ≥ 90%       | Coverage report     |

### 5.4 Epic 5 Acceptance Tests

```typescript
describe("Epic 5 Acceptance", () => {
  it("E5-AT1: Task outputs to stdout", async () => {
    const result = await hre.run("diamond:flatten", {
      diamondName: "TestDiamond",
    });
    expect(result.flattenedSource).to.include("pragma solidity");
  });

  it("E5-AT2: Task outputs to file", async () => {
    const output = "./test-output/E5-AT2.sol";
    await hre.run("diamond:flatten", {
      diamondName: "TestDiamond",
      output,
    });
    expect(existsSync(output)).to.be.true;
    const content = readFileSync(output, "utf-8");
    expect(content).to.include("pragma solidity");
  });

  it("E5-AT3: Programmatic API works", async () => {
    const result = await flattenDiamond(hre, {
      diamondName: "TestDiamond",
    });
    expect(result.flattenedSource).to.be.a("string");
    expect(result.stats.totalFacets).to.be.greaterThan(0);
  });

  it("E5-AT4: Errors include suggestions", async () => {
    try {
      await flattenDiamond(hre, { diamondName: "NonExistent" });
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).to.be.instanceOf(FlattenError);
      expect(error.suggestion).to.be.a("string");
    }
  });
});
```
