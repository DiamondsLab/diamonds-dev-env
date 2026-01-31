# Epic 2: Diamond Configuration & Facet Discovery

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
