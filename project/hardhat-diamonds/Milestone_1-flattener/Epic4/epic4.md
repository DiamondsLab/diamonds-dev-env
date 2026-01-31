# Epic 4: Output Formatting & Generation

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
