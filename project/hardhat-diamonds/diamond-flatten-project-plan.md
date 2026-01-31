# Diamond Flatten Feature - Project Plan & Epic Specification

## Project: `diamond:flatten` Task for @diamondslab/hardhat-diamonds

**Version:** 1.0  
**Date:** January 30, 2026  
**Status:** Planning  
**Milestone:** Diamond Flatten v1.0 Release

---

## Executive Summary

This document defines the complete implementation plan for the `diamond:flatten` Hardhat task. The feature enables flattening of ERC-2535 Diamond Proxy contracts with all facets into a single Solidity file for auditing and analysis.

**Total Effort:** 76 Story Points | ~152 Development Hours | 4 Sprints

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Epic 1: Core Infrastructure & Task Registration](#2-epic-1-core-infrastructure--task-registration)
3. [Epic 2: Diamond Configuration & Facet Discovery](#3-epic-2-diamond-configuration--facet-discovery)
4. [Epic 3: Solidity Source Flattening Engine](#4-epic-3-solidity-source-flattening-engine)
5. [Epic 4: Output Formatting & Generation](#5-epic-4-output-formatting--generation)
6. [Epic 5: Task Integration & Error Handling](#6-epic-5-task-integration--error-handling)
7. [Epic 6: Testing & Documentation](#7-epic-6-testing--documentation)
8. [Milestone Completion Criteria](#8-milestone-completion-criteria)

---

## 0. Project Overview

### 0.1 Objective

Deliver a production-ready `diamond:flatten` Hardhat task that:

- Flattens Diamond proxy contracts with all facets into a single .sol file
- Generates function selector mapping tables for audit reference
- Follows Hardhat flatten conventions for SPDX/pragma handling
- Provides both CLI and programmatic interfaces

### 0.2 Success Metrics

| Metric              | Target                     |
| ------------------- | -------------------------- |
| Test Coverage       | ≥ 90%                      |
| Task Execution Time | < 30s for 25-facet Diamond |
| Documentation       | 100% public API documented |
| Zero Critical Bugs  | All P0/P1 bugs resolved    |

### 0.3 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEW FILES TO CREATE                          │
├─────────────────────────────────────────────────────────────────┤
│  src/tasks/diamond-flatten.ts      Task definition              │
│  src/lib/DiamondFlattener.ts       Core flattening logic        │
│  src/lib/SourceResolver.ts         Source file resolution       │
│  src/lib/DependencyGraph.ts        Dependency management        │
│  src/lib/OutputFormatter.ts        Output formatting            │
├─────────────────────────────────────────────────────────────────┤
│                    FILES TO MODIFY                              │
├─────────────────────────────────────────────────────────────────┤
│  src/tasks/index.ts                Add flatten exports          │
│  src/tasks/shared/TaskOptions.ts   Add flatten interfaces       │
│  src/tasks/shared/TaskValidation.ts Add flatten validation      │
│  src/lib/index.ts                  Export new modules           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Epic 1: Core Infrastructure & Task Registration

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

## 2. Epic 2: Diamond Configuration & Facet Discovery

### 2.1 Epic Overview

| Attribute        | Value                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| **Epic ID**      | E2                                                                                                            |
| **Title**        | Diamond Configuration & Facet Discovery                                                                       |
| **Objective**    | Integrate with @DiamondsLab/Diamonds module to discover facets, extract selectors, and resolve contract paths |
| **Story Points** | 13                                                                                                            |
| **Sprint**       | Sprint 1                                                                                                      |
| **Dependencies** | Epic 1                                                                                                        |
| **Assignee**     | TBD                                                                                                           |

### 2.2 Features

---

#### Feature E2-F1: DiamondFlattener Class Foundation

**Objective:** Create the main DiamondFlattener class with Diamond module integration.

**File:** `src/lib/DiamondFlattener.ts`

**Class Structure:**

```typescript
export class DiamondFlattener {
  private hre: HardhatRuntimeEnvironment;
  private options: Required<DiamondFlattenOptions>;
  private diamond: Diamond | null = null;
  private warnings: string[] = [];

  constructor(hre: HardhatRuntimeEnvironment, options: DiamondFlattenOptions);

  // Public methods
  public async flatten(): Promise<DiamondFlattenResult>;
  public getDiamond(): Diamond;
  public getWarnings(): string[];

  // Protected methods for subclass access
  protected addWarning(message: string): void;
  protected log(message: string): void;

  // Private initialization
  private initializeDiamond(): void;
}
```

**Constructor Requirements:**

1. Accept HardhatRuntimeEnvironment and DiamondFlattenOptions
2. Set default values for optional options:
   - `networkName`: `hre.network.name`
   - `chainId`: `hre.network.config.chainId || 31337`
   - `diamondsPath`: `join(hre.config.paths.root, "diamonds")`
   - `contractsPath`: `hre.config.paths.sources`
   - `verbose`: `false`
3. Call `initializeDiamond()` to load Diamond instance
4. Throw `FlattenError` if diamond not found in configuration

**Completion Criteria:**

| #   | Criterion                                    | Verification |
| --- | -------------------------------------------- | ------------ |
| 1   | Class created at src/lib/DiamondFlattener.ts | File exists  |
| 2   | Constructor accepts HRE and options          | Unit test    |
| 3   | Default options applied correctly            | Unit test    |
| 4   | Diamond instance loaded from config          | Unit test    |
| 5   | Throws FlattenError for invalid diamond      | Unit test    |
| 6   | Warnings collection works                    | Unit test    |
| 7   | Verbose logging works                        | Unit test    |
| 8   | Exported from src/lib/index.ts               | Import test  |

---

#### Feature E2-F2: Facet Discovery

**Objective:** Discover all facets from Diamond configuration with priority ordering.

**Method to Implement:**

```typescript
/**
 * Discover all facets from Diamond configuration
 * @returns Array of discovered facets sorted by priority
 */
public async discoverFacets(): Promise<DiscoveredFacet[]> {
  const diamond = this.getDiamond();
  const deployConfig = diamond.getDeployConfig();
  const facetsConfig = deployConfig.facets || {};

  const discovered: DiscoveredFacet[] = [];

  for (const [facetName, facetConfig] of Object.entries(facetsConfig)) {
    try {
      // Resolve source path
      const sourcePath = await this.resolveContractPath(facetName);

      if (!sourcePath) {
        this.addWarning(`Source not found for facet: ${facetName}`);
        continue;
      }

      // Extract version
      const versions = Object.keys(facetConfig.versions || {}).map(Number);
      const version = versions.length > 0 ? Math.max(...versions) : 1;

      // Get selectors
      const selectors = await this.getFacetSelectors(facetName);

      discovered.push({
        name: facetName,
        sourcePath,
        priority: facetConfig.priority || 1000,
        version,
        selectors,
        isInit: this.isInitContract(facetName, deployConfig),
      });

      this.log(`  ✓ ${facetName}: ${selectors.length} selectors`);
    } catch (error) {
      this.addWarning(`Failed to process ${facetName}: ${error.message}`);
    }
  }

  // Sort by priority (lower = higher priority)
  return discovered.sort((a, b) => a.priority - b.priority);
}
```

**Helper Methods Required:**

1. `resolveContractPath(contractName: string): Promise<string | null>`
2. `isInitContract(facetName: string, deployConfig: any): boolean`

**Completion Criteria:**

| #   | Criterion                               | Verification |
| --- | --------------------------------------- | ------------ |
| 1   | Method discoverFacets() implemented     | Code review  |
| 2   | Returns all facets from configuration   | Unit test    |
| 3   | Facets sorted by priority ascending     | Unit test    |
| 4   | Source paths resolved correctly         | Unit test    |
| 5   | Missing sources logged as warnings      | Unit test    |
| 6   | Init contracts identified               | Unit test    |
| 7   | Version information extracted           | Unit test    |
| 8   | Continues after individual facet errors | Unit test    |

---

#### Feature E2-F3: Function Selector Extraction

**Objective:** Extract function selectors and build selector-to-facet mapping.

**Methods to Implement:**

```typescript
/**
 * Get function selectors for a facet
 */
private async getFacetSelectors(facetName: string): Promise<string[]> {
  // Try registry first, fallback to ABI extraction
}

/**
 * Extract selectors from contract ABI
 */
private extractSelectorsFromAbi(abi: any[]): string[] {
  // Parse ABI and compute selectors
}

/**
 * Build complete selector map for all facets
 */
public async buildSelectorMap(
  facets: DiscoveredFacet[]
): Promise<Map<string, SelectorInfo>> {
  const selectorMap = new Map<string, SelectorInfo>();

  for (const facet of facets) {
    const artifact = await this.hre.artifacts.readArtifact(facet.name);

    for (const item of artifact.abi) {
      if (item.type !== "function") continue;

      const signature = this.buildFunctionSignature(item);
      const selector = ethers.id(signature).slice(0, 10);

      // Check for duplicates
      if (selectorMap.has(selector)) {
        const existing = selectorMap.get(selector)!;
        this.addWarning(
          `Duplicate selector ${selector}: ` +
          `${existing.facetName}.${existing.functionName} vs ` +
          `${facet.name}.${item.name}`
        );
        continue;
      }

      selectorMap.set(selector, {
        selector,
        facetName: facet.name,
        functionName: item.name,
        signature: this.buildFullSignature(item),
      });
    }
  }

  return selectorMap;
}

/**
 * Build function signature for selector computation
 */
private buildFunctionSignature(abiItem: any): string {
  const params = (abiItem.inputs || []).map((i: any) => i.type).join(",");
  return `${abiItem.name}(${params})`;
}

/**
 * Build full signature with parameter names
 */
private buildFullSignature(abiItem: any): string {
  const params = (abiItem.inputs || [])
    .map((i: any) => `${i.type}${i.name ? " " + i.name : ""}`)
    .join(", ");
  return `${abiItem.name}(${params})`;
}
```

**Completion Criteria:**

| #   | Criterion                               | Verification |
| --- | --------------------------------------- | ------------ |
| 1   | getFacetSelectors() implemented         | Code review  |
| 2   | Selectors extracted from ABI            | Unit test    |
| 3   | buildSelectorMap() creates complete map | Unit test    |
| 4   | Duplicate selectors detected and warned | Unit test    |
| 5   | Function signatures correctly formatted | Unit test    |
| 6   | Full signatures include parameter names | Unit test    |
| 7   | Handles facets without functions        | Unit test    |

---

#### Feature E2-F4: Diamond Contract Discovery

**Objective:** Locate the main Diamond proxy contract.

**Method to Implement:**

```typescript
/**
 * Discover the main Diamond contract
 */
public async discoverDiamondContract(): Promise<DiamondContractInfo> {
  const diamond = this.getDiamond();
  const deployConfig = diamond.getDeployConfig();

  // Try configured name first
  const configuredName = deployConfig.diamondContractName ||
                         this.options.diamondName ||
                         "Diamond";

  let sourcePath = await this.resolveContractPath(configuredName);

  if (sourcePath) {
    this.log(`  ✓ Found Diamond: ${configuredName}`);
    return { name: configuredName, sourcePath, found: true };
  }

  // Try fallback names
  const fallbacks = ["Diamond", "DiamondProxy", `${this.options.diamondName}Diamond`];

  for (const name of fallbacks) {
    sourcePath = await this.resolveContractPath(name);
    if (sourcePath) {
      this.log(`  ✓ Found Diamond: ${name}`);
      return { name, sourcePath, found: true };
    }
  }

  this.addWarning(`Diamond contract not found. Tried: ${configuredName}, ${fallbacks.join(", ")}`);
  return { name: configuredName, sourcePath: "", found: false };
}
```

**Completion Criteria:**

| #   | Criterion                                       | Verification |
| --- | ----------------------------------------------- | ------------ |
| 1   | Method discoverDiamondContract() implemented    | Code review  |
| 2   | Tries configured name first                     | Unit test    |
| 3   | Falls back to common names                      | Unit test    |
| 4   | Returns found=true when found                   | Unit test    |
| 5   | Returns found=false with warning when not found | Unit test    |
| 6   | Verbose logging shows discovery                 | Unit test    |

---

### 2.3 Epic 2 Completion Criteria

| #   | Criterion                                     | Verification Method |
| --- | --------------------------------------------- | ------------------- |
| 1   | DiamondFlattener class fully implemented      | Code review         |
| 2   | Facet discovery returns all configured facets | Integration test    |
| 3   | Selector map contains all function selectors  | Integration test    |
| 4   | Diamond contract discovered                   | Integration test    |
| 5   | Missing facets produce warnings, not errors   | Unit test           |
| 6   | Duplicate selectors detected                  | Unit test           |
| 7   | Init contracts properly identified            | Unit test           |
| 8   | Code coverage ≥ 90%                           | Coverage report     |

### 2.4 Epic 2 Acceptance Tests

```typescript
describe("Epic 2 Acceptance", () => {
  let flattener: DiamondFlattener;

  beforeEach(() => {
    flattener = new DiamondFlattener(hre, {
      diamondName: "TestDiamond",
      verbose: false,
    });
  });

  it("E2-AT1: Discovers all configured facets", async () => {
    const facets = await flattener.discoverFacets();
    expect(facets.length).to.be.greaterThan(0);
    expect(facets.every((f) => f.sourcePath)).to.be.true;
  });

  it("E2-AT2: Builds complete selector map", async () => {
    const facets = await flattener.discoverFacets();
    const selectorMap = await flattener.buildSelectorMap(facets);
    expect(selectorMap.size).to.be.greaterThan(0);

    for (const [selector, info] of selectorMap) {
      expect(selector).to.match(/^0x[a-f0-9]{8}$/);
      expect(info.facetName).to.be.a("string");
      expect(info.signature).to.include("(");
    }
  });

  it("E2-AT3: Discovers Diamond contract", async () => {
    const diamondInfo = await flattener.discoverDiamondContract();
    expect(diamondInfo.found).to.be.true;
    expect(diamondInfo.sourcePath).to.not.be.empty;
  });

  it("E2-AT4: Handles missing facet sources gracefully", async () => {
    // Configure a facet with missing source
    const facets = await flattener.discoverFacets();
    const warnings = flattener.getWarnings();
    // Should have warnings but not throw
    expect(facets).to.be.an("array");
  });
});
```

---

## 3. Epic 3: Solidity Source Flattening Engine

### 3.1 Epic Overview

| Attribute        | Value                                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Epic ID**      | E3                                                                                                                               |
| **Title**        | Solidity Source Flattening Engine                                                                                                |
| **Objective**    | Implement core flattening logic: source loading, dependency resolution, topological sorting, deduplication, SPDX/pragma handling |
| **Story Points** | 21                                                                                                                               |
| **Sprint**       | Sprint 2                                                                                                                         |
| **Dependencies** | Epic 2                                                                                                                           |
| **Assignee**     | TBD                                                                                                                              |

### 3.2 Features

---

#### Feature E3-F1: Source File Resolution & Loading

**Objective:** Load Solidity source files with node_modules support.

**File:** `src/lib/SourceResolver.ts`

**Class Structure:**

```typescript
export interface LoadedSource {
  name: string; // Contract name
  absolutePath: string; // Full file path
  content: string; // Source code
  imports: ImportInfo[]; // Parsed imports
}

export interface ImportInfo {
  statement: string; // Full import statement
  path: string; // Import path
  namedImports: string[]; // Named imports if any
  start: number; // Position in source
  end: number;
}

export class SourceResolver {
  constructor(hre: HardhatRuntimeEnvironment);

  public async loadSource(filePath: string): Promise<LoadedSource>;
  public resolveAbsolutePath(importPath: string): string;
  public clearCache(): void;

  private parseImports(source: string): ImportInfo[];
  private resolveNodeModulesPath(importPath: string): string;
}
```

**Import Patterns to Support:**

```solidity
import "./Relative.sol";
import "../Parent.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Contract } from "./Named.sol";
import { A, B, C } from "./Multiple.sol";
import * as Lib from "./Library.sol";
```

**Completion Criteria:**

| #   | Criterion                                  | Verification |
| --- | ------------------------------------------ | ------------ |
| 1   | Class created at src/lib/SourceResolver.ts | File exists  |
| 2   | Loads local .sol files                     | Unit test    |
| 3   | Resolves relative imports (./ ../)         | Unit test    |
| 4   | Resolves node_modules imports (@org/...)   | Unit test    |
| 5   | Parses all import syntax variants          | Unit test    |
| 6   | Caches loaded sources                      | Unit test    |
| 7   | Throws for missing files                   | Unit test    |
| 8   | Extracts contract name from path           | Unit test    |

---

#### Feature E3-F2: Dependency Graph Construction

**Objective:** Build a complete dependency graph of all contracts.

**File:** `src/lib/DependencyGraph.ts`

**Class Structure:**

```typescript
export interface DependencyNode {
  name: string;
  path: string;
  source: string;
  dependencies: Set<string>; // Paths this depends on
  dependents: Set<string>; // Paths that depend on this
  isFacet: boolean;
  imports: ImportInfo[];
}

export class DependencyGraph {
  constructor(resolver: SourceResolver, verbose?: boolean);

  public async addRoot(filePath: string, isFacet?: boolean): Promise<void>;
  public getNodes(): Map<string, DependencyNode>;
  public hasCircularDependencies(): boolean;
  public topologicalSort(): DependencyNode[];
  public getSortedForFlattening(diamondPath?: string): DependencyNode[];
  public getStats(): GraphStats;

  private async resolveRecursively(
    filePath: string,
    isFacet: boolean,
    visited: Set<string>,
  ): Promise<void>;
}
```

**Algorithm Requirements:**

1. **Recursive Resolution:** Follow all imports depth-first
2. **Circular Detection:** Track visited nodes to detect cycles
3. **Topological Sort:** Use Kahn's algorithm for dependency ordering
4. **Flattening Order:** Dependencies → Facets → Diamond

**Completion Criteria:**

| #   | Criterion                                   | Verification     |
| --- | ------------------------------------------- | ---------------- |
| 1   | Class created at src/lib/DependencyGraph.ts | File exists      |
| 2   | addRoot() resolves all dependencies         | Unit test        |
| 3   | Dependencies tracked bidirectionally        | Unit test        |
| 4   | Circular dependencies detected              | Unit test        |
| 5   | topologicalSort() returns valid order       | Unit test        |
| 6   | getSortedForFlattening() puts Diamond last  | Unit test        |
| 7   | Handles complex dependency trees            | Integration test |
| 8   | getStats() returns accurate counts          | Unit test        |

---

#### Feature E3-F3: Source Deduplication

**Objective:** Remove duplicate contract definitions from flattened output.

**Methods to Implement in DiamondFlattener:**

```typescript
export interface DeduplicatedSource {
  name: string;
  source: string;  // Cleaned source (no imports)
  path: string;
  kept: boolean;   // true if kept, false if deduplicated
}

/**
 * Deduplicate sources by contract definition
 */
public deduplicateSources(sortedNodes: DependencyNode[]): DeduplicatedSource[] {
  const seen = new Set<string>();
  const result: DeduplicatedSource[] = [];

  for (const node of sortedNodes) {
    const definitions = this.extractDefinitions(node.source);

    let isDuplicate = false;
    for (const def of definitions) {
      if (seen.has(def)) {
        isDuplicate = true;
        this.log(`  ⊘ Skipping duplicate: ${def}`);
        break;
      }
    }

    if (!isDuplicate) {
      definitions.forEach(def => seen.add(def));
      result.push({
        name: node.name,
        source: this.removeImports(node.source),
        path: node.path,
        kept: true,
      });
    } else {
      result.push({
        name: node.name,
        source: "",
        path: node.path,
        kept: false,
      });
    }
  }

  return result;
}

/**
 * Extract contract/interface/library definitions
 */
private extractDefinitions(source: string): string[] {
  const definitions: string[] = [];
  const patterns = [
    /\bcontract\s+([A-Za-z_][A-Za-z0-9_]*)/g,
    /\binterface\s+([A-Za-z_][A-Za-z0-9_]*)/g,
    /\blibrary\s+([A-Za-z_][A-Za-z0-9_]*)/g,
    /\babstract\s+contract\s+([A-Za-z_][A-Za-z0-9_]*)/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(source)) !== null) {
      definitions.push(match[1]);
    }
  }

  return definitions;
}

/**
 * Remove import statements from source
 */
private removeImports(source: string): string {
  return source
    .replace(/import\s+.*?;/gs, "")
    .replace(/\n{3,}/g, "\n\n");
}
```

**Completion Criteria:**

| #   | Criterion                               | Verification |
| --- | --------------------------------------- | ------------ |
| 1   | deduplicateSources() removes duplicates | Unit test    |
| 2   | Extracts contract definitions           | Unit test    |
| 3   | Extracts interface definitions          | Unit test    |
| 4   | Extracts library definitions            | Unit test    |
| 5   | Extracts abstract contract definitions  | Unit test    |
| 6   | First occurrence kept                   | Unit test    |
| 7   | Imports removed from kept sources       | Unit test    |
| 8   | Verbose logging shows deduplication     | Unit test    |

---

#### Feature E3-F4: SPDX License Handling

**Objective:** Extract and consolidate SPDX licenses per Hardhat flatten behavior.

**Implementation:**

```typescript
export interface SpdxInfo {
  identifier: string;
  comment: string;
  sourcePath: string;
}

// License permissiveness ranking (higher = more permissive)
private readonly LICENSE_RANK: Record<string, number> = {
  "Unlicense": 100, "CC0-1.0": 100,
  "MIT": 90, "BSD-2-Clause": 85, "BSD-3-Clause": 85,
  "Apache-2.0": 80, "ISC": 80,
  "LGPL-2.0": 50, "LGPL-2.1": 50, "LGPL-3.0": 50,
  "GPL-2.0": 40, "GPL-3.0": 40,
  "AGPL-3.0": 30,
};

/**
 * Select most permissive license from all sources
 */
public selectLicense(sources: DeduplicatedSource[]): SpdxInfo {
  const licenses: SpdxInfo[] = [];

  for (const source of sources.filter(s => s.kept)) {
    const match = source.source.match(/\/\/\s*SPDX-License-Identifier:\s*(.+)/);
    if (match) {
      licenses.push({
        identifier: match[1].trim(),
        comment: match[0],
        sourcePath: source.path,
      });
    }
  }

  if (licenses.length === 0) {
    return { identifier: "UNLICENSED", comment: "// SPDX-License-Identifier: UNLICENSED", sourcePath: "" };
  }

  // Find most permissive
  let selected = licenses[0];
  let highestRank = this.getLicenseRank(selected.identifier);

  for (const license of licenses) {
    const rank = this.getLicenseRank(license.identifier);
    if (rank > highestRank) {
      highestRank = rank;
      selected = license;
    }
  }

  // Warn if mixed licenses
  const unique = new Set(licenses.map(l => l.identifier));
  if (unique.size > 1) {
    this.addWarning(`Multiple licenses: ${[...unique].join(", ")}. Using: ${selected.identifier}`);
  }

  return selected;
}

/**
 * Remove SPDX comments from source
 */
private removeSpdx(source: string): string {
  return source.replace(/\/\/\s*SPDX-License-Identifier:.*\n?/g, "");
}
```

**Completion Criteria:**

| #   | Criterion                                  | Verification |
| --- | ------------------------------------------ | ------------ |
| 1   | Extracts SPDX from all sources             | Unit test    |
| 2   | Selects most permissive license            | Unit test    |
| 3   | Handles OR expressions (MIT OR Apache-2.0) | Unit test    |
| 4   | Warns for conflicting licenses             | Unit test    |
| 5   | Defaults to UNLICENSED if none found       | Unit test    |
| 6   | Removes SPDX from individual sources       | Unit test    |

---

#### Feature E3-F5: Pragma Consolidation

**Objective:** Consolidate pragma statements from all sources.

**Implementation:**

```typescript
/**
 * Consolidate pragmas from all sources
 */
public consolidatePragmas(sources: DeduplicatedSource[]): string[] {
  const solidityVersions: string[] = [];
  const otherPragmas = new Set<string>();

  for (const source of sources.filter(s => s.kept)) {
    const pragmaRegex = /pragma\s+(\w+)\s+([^;]+);/g;
    let match;

    while ((match = pragmaRegex.exec(source.source)) !== null) {
      if (match[1] === "solidity") {
        solidityVersions.push(match[2].trim());
      } else {
        otherPragmas.add(match[0]);
      }
    }
  }

  const result: string[] = [];

  // Consolidate Solidity version
  if (solidityVersions.length > 0) {
    const consolidated = this.consolidateSolidityVersion(solidityVersions);
    result.push(`pragma solidity ${consolidated};`);
  }

  // Add other pragmas (abicoder, experimental)
  for (const pragma of otherPragmas) {
    result.push(pragma);
  }

  return result;
}

/**
 * Consolidate Solidity version constraints
 */
private consolidateSolidityVersion(versions: string[]): string {
  // Use most restrictive (highest minimum version)
  const normalized = versions.map(v => v.replace(/[\^~>=<]/g, "").trim());
  const unique = [...new Set(normalized)];

  if (unique.length === 1) return versions[0];

  // Sort descending and use caret version of highest
  unique.sort((a, b) => {
    const [aMaj, aMin] = a.split(".").map(Number);
    const [bMaj, bMin] = b.split(".").map(Number);
    return bMaj - aMaj || bMin - aMin;
  });

  return `^${unique[0]}`;
}

/**
 * Remove pragma statements from source
 */
private removePragmas(source: string): string {
  return source.replace(/pragma\s+\w+\s+[^;]+;\n?/g, "");
}
```

**Completion Criteria:**

| #   | Criterion                               | Verification |
| --- | --------------------------------------- | ------------ |
| 1   | Extracts pragmas from all sources       | Unit test    |
| 2   | Consolidates Solidity version           | Unit test    |
| 3   | Handles ^, ~, >=, < version operators   | Unit test    |
| 4   | Preserves abicoder pragma               | Unit test    |
| 5   | Preserves experimental pragma           | Unit test    |
| 6   | Removes pragmas from individual sources | Unit test    |
| 7   | Deduplicates identical pragmas          | Unit test    |

---

### 3.3 Epic 3 Completion Criteria

| #   | Criterion                             | Verification Method |
| --- | ------------------------------------- | ------------------- |
| 1   | SourceResolver loads all source types | Unit tests          |
| 2   | DependencyGraph builds correct graph  | Unit tests          |
| 3   | Topological sort produces valid order | Integration test    |
| 4   | Circular dependencies handled         | Unit test           |
| 5   | Deduplication removes duplicates      | Unit test           |
| 6   | SPDX handling matches Hardhat flatten | Comparison test     |
| 7   | Pragma consolidation works            | Unit test           |
| 8   | Code coverage ≥ 90%                   | Coverage report     |

### 3.4 Epic 3 Acceptance Tests

```typescript
describe("Epic 3 Acceptance", () => {
  it("E3-AT1: Resolves node_modules imports", async () => {
    const resolver = new SourceResolver(hre);
    const path = resolver.resolveAbsolutePath(
      "@openzeppelin/contracts/token/ERC20/ERC20.sol",
    );
    expect(path).to.include("node_modules");
  });

  it("E3-AT2: Topological sort produces compilable order", async () => {
    const resolver = new SourceResolver(hre);
    const graph = new DependencyGraph(resolver);
    await graph.addRoot("contracts/TestFacet.sol", true);

    const sorted = graph.topologicalSort();
    const positions = new Map(sorted.map((n, i) => [n.path, i]));

    // Every dependency must come before its dependent
    for (const node of sorted) {
      for (const dep of node.dependencies) {
        expect(positions.get(dep)).to.be.lessThan(positions.get(node.path)!);
      }
    }
  });

  it("E3-AT3: Deduplication removes shared dependencies", async () => {
    const flattener = new DiamondFlattener(hre, { diamondName: "TestDiamond" });
    // Facets sharing OpenZeppelin should result in single OZ inclusion
    const result = await flattener.flatten();

    const ozCount = (result.flattenedSource.match(/contract ERC165/g) || [])
      .length;
    expect(ozCount).to.equal(1);
  });

  it("E3-AT4: Selects most permissive license", () => {
    const flattener = new DiamondFlattener(hre, { diamondName: "TestDiamond" });
    const sources = [
      { source: "// SPDX-License-Identifier: GPL-3.0", kept: true },
      { source: "// SPDX-License-Identifier: MIT", kept: true },
    ] as any;

    const license = flattener.selectLicense(sources);
    expect(license.identifier).to.equal("MIT");
  });
});
```

---

## 4. Epic 4: Output Formatting & Generation

### 4.1 Epic Overview

| Attribute        | Value                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------- |
| **Epic ID**      | E4                                                                                      |
| **Title**        | Output Formatting & Generation                                                          |
| **Objective**    | Generate formatted output including selector table, section headers, and final assembly |
| **Story Points** | 13                                                                                      |
| **Sprint**       | Sprint 3                                                                                |
| **Dependencies** | Epic 2, Epic 3                                                                          |
| **Assignee**     | TBD                                                                                     |

### 4.2 Features

---

#### Feature E4-F1: Function Selector Table Generation

**Objective:** Generate a formatted table mapping selectors to facets.

**File:** `src/lib/OutputFormatter.ts`

**Output Format:**

```
/*
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                      DIAMOND FUNCTION SELECTOR MAPPING                       ║
 * ╠════════════╦══════════════════════╦══════════════════════════════════════════╣
 * ║ Selector   ║ Facet                ║ Function                                 ║
 * ╠════════════╬══════════════════════╬══════════════════════════════════════════╣
 * ║ 0x01ffc9a7 ║ DiamondLoupeFacet    ║ supportsInterface(bytes4)                ║
 * ║ 0x1f931c1c ║ DiamondCutFacet      ║ diamondCut(FacetCut[],address,bytes)     ║
 * ╚════════════╩══════════════════════╩══════════════════════════════════════════╝
 */
```

**Method Signature:**

```typescript
public generateSelectorTable(selectorMap: Map<string, SelectorInfo>): string
```

**Requirements:**

1. Box-drawing characters for table borders
2. Columns: Selector (12), Facet (22), Function (50)
3. Selectors sorted alphabetically
4. Long signatures truncated with "..."
5. Wrapped in Solidity block comment

**Completion Criteria:**

| #   | Criterion                         | Verification      |
| --- | --------------------------------- | ----------------- |
| 1   | Table uses box-drawing characters | Visual inspection |
| 2   | Three columns present             | Visual inspection |
| 3   | Selectors sorted alphabetically   | Unit test         |
| 4   | Long signatures truncated         | Unit test         |
| 5   | Valid Solidity comment syntax     | Compilation test  |
| 6   | Handles empty selector map        | Unit test         |

---

#### Feature E4-F2: Section Headers

**Objective:** Generate clear section headers for facets and dependencies.

**Output Formats:**

```solidity
// ============================================================================
// FACET: ERC721Facet
// Priority: 100 | Version: 1 | Selectors: 12
// ============================================================================

// ============================================================================
// INIT CONTRACT: DiamondInit
// Priority: 1 | Version: 1 | Selectors: 1
// ============================================================================

// ============================================================================
// SHARED DEPENDENCIES
// ============================================================================

// ============================================================================
// DIAMOND: MyProtocolDiamond
// ============================================================================
```

**Methods to Implement:**

```typescript
public generateFacetHeader(facet: DiscoveredFacet): string;
public generateDependenciesHeader(): string;
public generateDiamondHeader(diamondName: string): string;
```

**Completion Criteria:**

| #   | Criterion                                             | Verification      |
| --- | ----------------------------------------------------- | ----------------- |
| 1   | Facet headers show name, priority, version, selectors | Unit test         |
| 2   | Init contracts marked distinctly                      | Unit test         |
| 3   | Dependencies header generated                         | Unit test         |
| 4   | Diamond header generated                              | Unit test         |
| 5   | Consistent 80-character width                         | Visual inspection |

---

#### Feature E4-F3: Summary Header Generation

**Objective:** Generate file summary header with metadata.

**Output Format:**

```solidity
/*
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║              FLATTENED DIAMOND CONTRACT: MyProtocolDiamond                   ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║ Generated:       2026-01-30T12:00:00.000Z                                    ║
 * ║ Total Facets:    8                                                           ║
 * ║ Total Selectors: 47                                                          ║
 * ║ Total Contracts: 25                                                          ║
 * ║ Generator:       @diamondslab/hardhat-diamonds v1.0.0                        ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║ ⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY                               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
```

**Method Signature:**

```typescript
interface SummaryHeaderOptions {
  diamondName: string;
  totalFacets: number;
  totalSelectors: number;
  totalContracts: number;
  generatorVersion: string;
  networkName?: string;
}

public generateSummaryHeader(options: SummaryHeaderOptions): string;
```

**Completion Criteria:**

| #   | Criterion                          | Verification      |
| --- | ---------------------------------- | ----------------- |
| 1   | Diamond name displayed prominently | Visual inspection |
| 2   | Timestamp in ISO8601 format        | Unit test         |
| 3   | All statistics included            | Unit test         |
| 4   | Generator version included         | Unit test         |
| 5   | Network name shown if provided     | Unit test         |
| 6   | Auto-generated warning present     | Unit test         |

---

#### Feature E4-F4: Final Output Assembly

**Objective:** Assemble all components into final flattened file.

**Output Order (MANDATORY):**

1. SPDX License Identifier
2. Pragma Statements
3. Summary Header
4. Function Selector Table
5. Shared Dependencies (with header)
6. Facets (each with header)
7. Diamond Contract (with header)

**Method Implementation:**

```typescript
/**
 * Assemble final flattened output
 */
private assembleOutput(
  formatter: OutputFormatter,
  license: SpdxInfo,
  pragmas: string[],
  selectorMap: Map<string, SelectorInfo>,
  sources: DeduplicatedSource[],
  facets: DiscoveredFacet[],
  diamondInfo: DiamondContractInfo
): string {
  const parts: string[] = [];

  // 1. SPDX License
  parts.push(`// SPDX-License-Identifier: ${license.identifier}`);

  // 2. Pragmas
  parts.push(pragmas.join("\n"));
  parts.push("");

  // 3. Summary Header
  parts.push(formatter.generateSummaryHeader({
    diamondName: this.options.diamondName,
    totalFacets: facets.length,
    totalSelectors: selectorMap.size,
    totalContracts: sources.filter(s => s.kept).length,
    generatorVersion: this.getVersion(),
    networkName: this.options.networkName,
  }));
  parts.push("");

  // 4. Selector Table
  parts.push(formatter.generateSelectorTable(selectorMap));
  parts.push("");

  // 5. Dependencies
  const deps = sources.filter(s =>
    s.kept &&
    !facets.some(f => f.sourcePath === s.path) &&
    s.path !== diamondInfo.sourcePath
  );

  if (deps.length > 0) {
    parts.push(formatter.generateDependenciesHeader());
    for (const dep of deps) {
      parts.push(this.cleanSource(dep.source));
    }
  }

  // 6. Facets
  const facetPaths = new Set(facets.map(f => f.sourcePath));
  for (const source of sources) {
    if (!source.kept || !facetPaths.has(source.path)) continue;

    const facet = facets.find(f => f.sourcePath === source.path)!;
    parts.push(formatter.generateFacetHeader(facet));
    parts.push(this.cleanSource(source.source));
  }

  // 7. Diamond
  if (diamondInfo.found) {
    const diamondSource = sources.find(s => s.path === diamondInfo.sourcePath);
    if (diamondSource?.kept) {
      parts.push(formatter.generateDiamondHeader(diamondInfo.name));
      parts.push(this.cleanSource(diamondSource.source));
    }
  }

  return parts.join("\n");
}

/**
 * Clean source: remove SPDX, pragmas, imports, excess whitespace
 */
private cleanSource(source: string): string {
  let cleaned = this.removeSpdx(source);
  cleaned = this.removePragmas(cleaned);
  cleaned = this.removeImports(cleaned);
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  return cleaned.trim();
}
```

**Completion Criteria:**

| #   | Criterion                       | Verification     |
| --- | ------------------------------- | ---------------- |
| 1   | Output starts with SPDX license | Unit test        |
| 2   | Pragmas follow SPDX             | Unit test        |
| 3   | Summary header present          | Unit test        |
| 4   | Selector table present          | Unit test        |
| 5   | Dependencies before facets      | Unit test        |
| 6   | Facets have section headers     | Unit test        |
| 7   | Diamond contract is last        | Unit test        |
| 8   | No import statements in output  | Grep test        |
| 9   | No excessive blank lines        | Unit test        |
| 10  | Output compiles with solc       | Compilation test |

---

### 4.3 Epic 4 Completion Criteria

| #   | Criterion                          | Verification Method |
| --- | ---------------------------------- | ------------------- |
| 1   | Selector table properly formatted  | Visual inspection   |
| 2   | All section headers generated      | Unit test           |
| 3   | Summary header complete            | Unit test           |
| 4   | Output order matches specification | Unit test           |
| 5   | No imports in final output         | Grep test           |
| 6   | Output is valid Solidity           | solc compilation    |
| 7   | Code coverage ≥ 90%                | Coverage report     |

### 4.4 Epic 4 Acceptance Tests

```typescript
describe("Epic 4 Acceptance", () => {
  it("E4-AT1: Output compiles with solc", async () => {
    const flattener = new DiamondFlattener(hre, { diamondName: "TestDiamond" });
    const result = await flattener.flatten();

    // Write to temp file and compile
    const tempPath = "/tmp/flattened-test.sol";
    writeFileSync(tempPath, result.flattenedSource);

    // Should not throw
    await hre.run("compile", { sources: [tempPath], quiet: true });
  });

  it("E4-AT2: Output has correct section order", async () => {
    const flattener = new DiamondFlattener(hre, { diamondName: "TestDiamond" });
    const result = await flattener.flatten();
    const source = result.flattenedSource;

    const spdxPos = source.indexOf("SPDX-License-Identifier");
    const pragmaPos = source.indexOf("pragma solidity");
    const summaryPos = source.indexOf("FLATTENED DIAMOND CONTRACT");
    const tablePos = source.indexOf("FUNCTION SELECTOR MAPPING");
    const depsPos = source.indexOf("SHARED DEPENDENCIES");
    const diamondPos = source.lastIndexOf("// DIAMOND:");

    expect(spdxPos).to.be.lessThan(pragmaPos);
    expect(pragmaPos).to.be.lessThan(summaryPos);
    expect(summaryPos).to.be.lessThan(tablePos);
    expect(tablePos).to.be.lessThan(depsPos);
    expect(depsPos).to.be.lessThan(diamondPos);
  });

  it("E4-AT3: No import statements in output", async () => {
    const flattener = new DiamondFlattener(hre, { diamondName: "TestDiamond" });
    const result = await flattener.flatten();

    expect(result.flattenedSource).to.not.match(/^import\s/m);
  });

  it("E4-AT4: Selector table is accurate", async () => {
    const flattener = new DiamondFlattener(hre, { diamondName: "TestDiamond" });
    const result = await flattener.flatten();

    for (const [selector, info] of result.selectorMap) {
      expect(result.flattenedSource).to.include(selector);
      expect(result.flattenedSource).to.include(info.facetName);
    }
  });
});
```

---

## 5. Epic 5: Task Integration & Error Handling

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

---

## 6. Epic 6: Testing & Documentation

### 6.1 Epic Overview

| Attribute        | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| **Epic ID**      | E6                                                     |
| **Title**        | Testing & Documentation                                |
| **Objective**    | Comprehensive test coverage and complete documentation |
| **Story Points** | 13                                                     |
| **Sprint**       | Sprint 4                                               |
| **Dependencies** | Epic 5                                                 |
| **Assignee**     | TBD                                                    |

### 6.2 Features

---

#### Feature E6-F1: Unit Test Suite

**Objective:** Achieve ≥90% code coverage with unit tests.

**Test Files to Create:**

| File                                     | Tests For              |
| ---------------------------------------- | ---------------------- |
| `test/unit/lib/DiamondFlattener.test.ts` | DiamondFlattener class |
| `test/unit/lib/SourceResolver.test.ts`   | SourceResolver class   |
| `test/unit/lib/DependencyGraph.test.ts`  | DependencyGraph class  |
| `test/unit/lib/OutputFormatter.test.ts`  | OutputFormatter class  |
| `test/unit/tasks/DiamondFlatten.test.ts` | Task validation        |

**Coverage Requirements:**

| Module                      | Minimum Coverage |
| --------------------------- | ---------------- |
| DiamondFlattener.ts         | 90%              |
| SourceResolver.ts           | 90%              |
| DependencyGraph.ts          | 90%              |
| OutputFormatter.ts          | 90%              |
| diamond-flatten.ts          | 85%              |
| TaskValidation.ts (flatten) | 90%              |

**Completion Criteria:**

| #   | Criterion                       | Verification    |
| --- | ------------------------------- | --------------- |
| 1   | All test files created          | File check      |
| 2   | DiamondFlattener coverage ≥ 90% | Coverage report |
| 3   | SourceResolver coverage ≥ 90%   | Coverage report |
| 4   | DependencyGraph coverage ≥ 90%  | Coverage report |
| 5   | OutputFormatter coverage ≥ 90%  | Coverage report |
| 6   | All edge cases tested           | Code review     |
| 7   | All error paths tested          | Code review     |

---

#### Feature E6-F2: Integration Tests

**Objective:** End-to-end testing with real contracts.

**File:** `test/integration/flatten.test.ts`

**Test Fixtures Required:**

```
test/fixtures/
├── contracts/
│   ├── TestDiamond.sol
│   ├── facets/
│   │   ├── FacetA.sol
│   │   ├── FacetB.sol
│   │   └── FacetC.sol
│   ├── init/
│   │   └── DiamondInit.sol
│   └── libraries/
│       └── SharedLib.sol
├── diamonds/
│   └── TestDiamond/
│       └── TestDiamond.config.json
└── hardhat.config.ts
```

**Test Scenarios:**

1. Simple Diamond (3 facets)
2. Diamond with shared OpenZeppelin dependencies
3. Diamond with init contract
4. Diamond with circular dependencies (graceful handling)
5. CLI with --output flag
6. CLI with --verbose flag
7. Compilation verification of output

**Completion Criteria:**

| #   | Criterion                  | Verification |
| --- | -------------------------- | ------------ |
| 1   | Test fixtures created      | File check   |
| 2   | Simple Diamond test passes | Test run     |
| 3   | Shared deps test passes    | Test run     |
| 4   | Init contract test passes  | Test run     |
| 5   | CLI tests pass             | Test run     |
| 6   | Output compiles            | Test run     |

---

#### Feature E6-F3: Documentation

**Objective:** Complete documentation for users and developers.

**Files to Create/Update:**

1. **`docs/tasks/diamond-flatten.md`** - Full task documentation
2. **`README.md`** - Add flatten task section

**Documentation Requirements:**

**docs/tasks/diamond-flatten.md:**

````markdown
# diamond:flatten Task

## Overview

Flatten a Diamond contract with all facets into a single Solidity file.

## Usage

### CLI

```bash
# Output to stdout
npx hardhat diamond:flatten --diamond-name MyDiamond

# Output to file
npx hardhat diamond:flatten --diamond-name MyDiamond --output ./flattened/MyDiamond.sol

# Verbose mode
npx hardhat diamond:flatten --diamond-name MyDiamond --verbose
```
````

### Programmatic

```typescript
import { flattenDiamond } from "@diamondslab/hardhat-diamonds";

const result = await flattenDiamond(hre, {
  diamondName: "MyDiamond",
  verbose: true,
});

console.log(result.stats.totalSelectors);
```

## Parameters

| Parameter      | Required | Description              |
| -------------- | -------- | ------------------------ |
| --diamond-name | Yes      | Diamond name from config |
| --output       | No       | Output file path         |
| --verbose      | No       | Enable detailed logging  |
| --network      | No       | Target network           |

## Output Format

[Describe output structure]

## Troubleshooting

[Common issues and solutions]

```

**Completion Criteria:**

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | docs/tasks/diamond-flatten.md exists | File check |
| 2 | README updated with task | File check |
| 3 | All parameters documented | Review |
| 4 | Programmatic usage documented | Review |
| 5 | Output format explained | Review |
| 6 | Troubleshooting section | Review |

---

### 6.3 Epic 6 Completion Criteria

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| 1 | Unit test coverage ≥ 90% | Coverage report |
| 2 | All integration tests pass | Test run |
| 3 | Documentation complete | Review |
| 4 | README updated | Review |
| 5 | Test fixtures created | File check |
| 6 | All tests pass in CI | CI pipeline |

---

## 8. Milestone Completion Criteria

### 8.1 Feature Checklist

| # | Feature | Epic | Status |
|---|---------|------|--------|
| 1 | TypeScript interfaces defined | E1 | ⬜ |
| 2 | Task registered with Hardhat | E1 | ⬜ |
| 3 | Argument validation | E1 | ⬜ |
| 4 | DiamondFlattener class | E2 | ⬜ |
| 5 | Facet discovery | E2 | ⬜ |
| 6 | Selector extraction | E2 | ⬜ |
| 7 | Source resolution | E3 | ⬜ |
| 8 | Dependency graph | E3 | ⬜ |
| 9 | Topological sort | E3 | ⬜ |
| 10 | Deduplication | E3 | ⬜ |
| 11 | SPDX handling | E3 | ⬜ |
| 12 | Pragma handling | E3 | ⬜ |
| 13 | Selector table | E4 | ⬜ |
| 14 | Section headers | E4 | ⬜ |
| 15 | Output assembly | E4 | ⬜ |
| 16 | Task action handler | E5 | ⬜ |
| 17 | Programmatic API | E5 | ⬜ |
| 18 | Error handling | E5 | ⬜ |
| 19 | Unit tests | E6 | ⬜ |
| 20 | Integration tests | E6 | ⬜ |
| 21 | Documentation | E6 | ⬜ |

### 8.2 Quality Gates

| Gate | Requirement | Status |
|------|-------------|--------|
| TypeScript Compilation | No errors | ⬜ |
| ESLint | No errors, ≤5 warnings | ⬜ |
| Unit Test Coverage | ≥ 90% | ⬜ |
| Integration Tests | 100% passing | ⬜ |
| Documentation | Complete | ⬜ |
| Code Review | Approved | ⬜ |
| Performance | < 30s for 25-facet Diamond | ⬜ |

### 8.3 Release Checklist

- [ ] All epics completed
- [ ] All quality gates passed
- [ ] CHANGELOG updated
- [ ] Version bumped in package.json
- [ ] npm publish successful
- [ ] GitHub release created

---

## Appendix A: Timeline

| Sprint | Epics | Duration |
|--------|-------|----------|
| Sprint 1 | E1, E2 | 2 weeks |
| Sprint 2 | E3 | 2 weeks |
| Sprint 3 | E4, E5 | 2 weeks |
| Sprint 4 | E6 | 2 weeks |
| **Total** | | **8 weeks** |

---

## Appendix B: Effort Summary

| Epic | Story Points | Hours |
|------|--------------|-------|
| E1: Core Infrastructure | 8 | 16 |
| E2: Diamond Discovery | 13 | 26 |
| E3: Flattening Engine | 21 | 42 |
| E4: Output Generation | 13 | 26 |
| E5: Task Integration | 8 | 16 |
| E6: Testing & Docs | 13 | 26 |
| **Total** | **76** | **152** |

---

**Document Version:** 1.0
**Last Updated:** January 30, 2026
```
