# Epic 3: Solidity Source Flattening Engine

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
