## Epic 1: Core Infrastructure & Task Registration

### 1.1 Epic Overview

| Attribute        | Value                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| **Epic ID**      | E1                                                                                                         |
| **Title**        | Core Infrastructure & Task Registration                                                                    |
| **Objective**    | Establish foundational TypeScript interfaces, register the Hardhat task, and implement argument validation |
| **Story Points** | 8                                                                                                          |
| **Sprint**       | Sprint 1                                                                                                   |
| **Dependencies** | None                                                                                                       |
| **Assignee**     | TBD                                                                                                        |

### 1.2 Features

---

#### Feature E1-F1: TypeScript Interface Definitions

**Objective:** Define all TypeScript interfaces required for the flatten feature.

**File:** `src/tasks/shared/TaskOptions.ts`

**Interfaces to Implement:**

```typescript
/**
 * CLI task arguments for diamond:flatten
 */
export interface DiamondFlattenTaskArgs {
  /** Name of the diamond to flatten (required) */
  diamondName: string;
  /** Output file path - stdout if not specified */
  output?: string;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Target network for configuration */
  network?: string;
}

/**
 * Internal options for DiamondFlattener class
 */
export interface DiamondFlattenOptions {
  diamondName: string;
  networkName: string;
  chainId: number;
  diamondsPath: string;
  contractsPath: string;
  verbose: boolean;
}

/**
 * Result returned from flatten operation
 */
export interface DiamondFlattenResult {
  flattenedSource: string;
  selectorMap: Map<string, SelectorInfo>;
  includedContracts: string[];
  warnings: string[];
  stats: FlattenStats;
}

/**
 * Function selector metadata
 */
export interface SelectorInfo {
  selector: string; // 0x prefixed 4-byte selector
  facetName: string; // Contract name
  functionName: string; // Function name only
  signature: string; // Full signature with params
}

/**
 * Statistics from flatten operation
 */
export interface FlattenStats {
  totalContracts: number;
  totalFacets: number;
  totalSelectors: number;
  totalLines: number;
  deduplicatedContracts: number;
}

/**
 * Discovered facet information
 */
export interface DiscoveredFacet {
  name: string;
  sourcePath: string;
  priority: number;
  version: number;
  selectors: string[];
  isInit: boolean;
}

/**
 * Diamond contract information
 */
export interface DiamondContractInfo {
  name: string;
  sourcePath: string;
  found: boolean;
}
```

**Completion Criteria:**

| #   | Criterion                                   | Verification    |
| --- | ------------------------------------------- | --------------- |
| 1   | All 7 interfaces defined in TaskOptions.ts  | Code review     |
| 2   | JSDoc documentation on every interface      | Code review     |
| 3   | JSDoc documentation on every property       | Code review     |
| 4   | Interfaces exported from src/tasks/index.ts | Import test     |
| 5   | No TypeScript compilation errors            | `npm run build` |
| 6   | No use of `any` type                        | ESLint check    |

---

#### Feature E1-F2: Hardhat Task Registration

**Objective:** Create and register the `diamond:flatten` task with Hardhat.

**File:** `src/tasks/diamond-flatten.ts`

**Implementation Requirements:**

1. **Task Name:** `diamond:flatten`
2. **Task Description:** "Flatten Diamond contract with all facets into single file"
3. **Parameters:**

| Parameter     | Type   | Required | Default | Description                |
| ------------- | ------ | -------- | ------- | -------------------------- |
| `diamondName` | string | Yes      | -       | Name of diamond to flatten |
| `output`      | string | No       | stdout  | Output file path           |
| `verbose`     | flag   | No       | false   | Enable verbose logging     |
| `network`     | string | No       | current | Target network             |

**Code Structure:**

```typescript
// src/tasks/diamond-flatten.ts
const { task } = require("hardhat/config");

task(
  "diamond:flatten",
  "Flatten Diamond contract with all facets into single file",
)
  .addParam(
    "diamondName",
    "Name of the diamond to flatten",
    undefined,
    undefined,
    false,
  )
  .addOptionalParam(
    "output",
    "Output file path (writes to stdout if not specified)",
  )
  .addFlag("verbose", "Enable verbose logging")
  .addOptionalParam("network", "Target network for configuration resolution")
  .setAction(
    async (args: DiamondFlattenTaskArgs, hre: HardhatRuntimeEnvironment) => {
      // Action implementation in Epic 5
      throw new Error("Not implemented - see Epic 5");
    },
  );
```

**Completion Criteria:**

| #   | Criterion                                         | Verification                         |
| --- | ------------------------------------------------- | ------------------------------------ |
| 1   | Task file created at src/tasks/diamond-flatten.ts | File exists                          |
| 2   | Task registered with name `diamond:flatten`       | `npx hardhat --help` shows task      |
| 3   | `--diamond-name` is required parameter            | Task fails without it                |
| 4   | `--output` is optional parameter                  | Task accepts it                      |
| 5   | `--verbose` is boolean flag                       | Task accepts it                      |
| 6   | `--network` is optional parameter                 | Task accepts it                      |
| 7   | Task help displays correctly                      | `npx hardhat diamond:flatten --help` |

---

#### Feature E1-F3: Task Export Registration

**Objective:** Register the flatten task in the module exports.

**File:** `src/tasks/index.ts`

**Modifications Required:**

```typescript
// Add import at top
import "./diamond-flatten";

// Add to HARDHAT_DIAMONDS_TASKS constant
export const HARDHAT_DIAMONDS_TASKS = {
  // ... existing tasks ...

  "diamond:flatten": {
    name: "diamond:flatten",
    description: "Flatten Diamond contract with all facets into single file",
    category: "Diamond Proxy",
    requiredParams: ["diamondName"],
    optionalParams: ["output", "network"],
    flags: ["verbose"],
  },
} as const;

// Add type exports
export type {
  DiamondFlattenTaskArgs,
  DiamondFlattenOptions,
  DiamondFlattenResult,
  SelectorInfo,
  FlattenStats,
  DiscoveredFacet,
  DiamondContractInfo,
} from "./shared/TaskOptions";
```

**Completion Criteria:**

| #   | Criterion                               | Verification    |
| --- | --------------------------------------- | --------------- |
| 1   | diamond-flatten.ts imported in index.ts | Code review     |
| 2   | Task metadata in HARDHAT_DIAMONDS_TASKS | Code review     |
| 3   | All flatten types exported              | Import test     |
| 4   | getDiamondTasksHelp() includes flatten  | Function output |
| 5   | No circular dependency errors           | `npm run build` |

---

#### Feature E1-F4: Argument Validation

**Objective:** Implement validation for flatten task arguments.

**File:** `src/tasks/shared/TaskValidation.ts`

**Method to Implement:**

```typescript
/**
 * Validate diamond flatten task arguments
 * @param args - Task arguments to validate
 * @returns Validation result with errors and warnings
 */
public validateDiamondFlattenArgs(args: DiamondFlattenTaskArgs): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // 1. Diamond name validation (required)
  if (!args.diamondName || args.diamondName.trim() === "") {
    errors.push({
      field: "diamondName",
      message: "Diamond name is required",
      suggestion: "Provide: --diamond-name MyDiamond",
    });
  } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(args.diamondName)) {
    errors.push({
      field: "diamondName",
      message: "Invalid format: must start with letter, alphanumeric and underscores only",
      suggestion: "Example: MyDiamond or My_Diamond_V2",
    });
  } else {
    // 2. Diamond exists in configuration
    try {
      this.hre.diamonds?.getDiamondConfig(args.diamondName);
    } catch {
      errors.push({
        field: "diamondName",
        message: `Diamond "${args.diamondName}" not found in configuration`,
        suggestion: "Check diamonds.paths in hardhat.config.ts",
      });
    }
  }

  // 3. Output path validation (if provided)
  if (args.output !== undefined) {
    if (typeof args.output !== "string" || args.output.trim() === "") {
      errors.push({
        field: "output",
        message: "Output path must be non-empty string",
        suggestion: "Example: --output ./flattened/Diamond.sol",
      });
    } else if (!args.output.endsWith(".sol")) {
      warnings.push("Output file does not have .sol extension");
    }
  }

  // 4. Network validation (if provided)
  if (args.network) {
    const networkResult = this.validateNetwork(args.network);
    errors.push(...networkResult.errors);
  }

  return { isValid: errors.length === 0, errors, warnings };
}
```

**Completion Criteria:**

| #   | Criterion                                  | Verification |
| --- | ------------------------------------------ | ------------ |
| 1   | Method validateDiamondFlattenArgs() exists | Code review  |
| 2   | Rejects empty diamond name                 | Unit test    |
| 3   | Rejects invalid diamond name format        | Unit test    |
| 4   | Rejects non-existent diamond               | Unit test    |
| 5   | Rejects empty output path                  | Unit test    |
| 6   | Warns for non-.sol extension               | Unit test    |
| 7   | Validates network if provided              | Unit test    |
| 8   | All errors include suggestions             | Unit test    |

---

### 1.3 Epic 1 Completion Criteria

| #   | Criterion                               | Verification Method |
| --- | --------------------------------------- | ------------------- |
| 1   | All 7 interfaces defined and documented | Code review         |
| 2   | Task visible in `npx hardhat --help`    | CLI execution       |
| 3   | Task help shows all parameters          | CLI execution       |
| 4   | All types exported from tasks/index.ts  | Import test         |
| 5   | Validation rejects invalid inputs       | Unit tests pass     |
| 6   | Validation accepts valid inputs         | Unit tests pass     |
| 7   | No TypeScript compilation errors        | `npm run build`     |
| 8   | Code coverage ≥ 90% for new code        | Coverage report     |

### 1.4 Epic 1 Acceptance Tests

```typescript
describe("Epic 1 Acceptance", () => {
  it("E1-AT1: Task is registered with Hardhat", async () => {
    const tasks = Object.keys(hre.tasks);
    expect(tasks).to.include("diamond:flatten");
  });

  it("E1-AT2: Task requires diamondName parameter", async () => {
    await expect(hre.run("diamond:flatten", {})).to.be.rejectedWith(
      /diamondName/,
    );
  });

  it("E1-AT3: Validation rejects non-existent diamond", () => {
    const validation = new TaskValidation(hre);
    const result = validation.validateDiamondFlattenArgs({
      diamondName: "NonExistentDiamond",
    });
    expect(result.isValid).to.be.false;
    expect(result.errors[0].field).to.equal("diamondName");
  });

  it("E1-AT4: All interfaces are importable", () => {
    const imports = require("@diamondslab/hardhat-diamonds");
    expect(imports.DiamondFlattenTaskArgs).to.exist;
    expect(imports.DiamondFlattenResult).to.exist;
    expect(imports.SelectorInfo).to.exist;
  });
});
```

---
