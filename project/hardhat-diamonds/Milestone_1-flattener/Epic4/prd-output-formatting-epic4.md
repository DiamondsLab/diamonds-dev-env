# PRD: Output Formatting & Generation (Epic 4)

## Introduction/Overview

This PRD defines the requirements for implementing formatted output generation for the Diamond contract flattening engine. After Epic 3 successfully implemented the core flattening pipeline (source loading, dependency resolution, and deduplication), Epic 4 focuses on assembling the processed sources into a beautifully formatted, production-ready Solidity file.

The output formatter will generate professional-looking flattened contracts with:

- **Function selector tables** mapping selectors to facets
- **Section headers** clearly delineating facets, dependencies, and the diamond contract
- **Summary headers** with metadata, statistics, and generation details
- **Final assembly** combining all components in the correct order

**Problem Statement:** While Epic 3 can successfully load, resolve, and deduplicate Solidity sources, the raw output lacks structure and documentation. Developers need clearly formatted output with selector mappings, section markers, and metadata to understand and verify the flattened contract.

**Solution:** Create an `OutputFormatter` utility class that generates formatted strings following the specifications in Epic 4, while keeping file I/O concerns separate in the `DiamondFlattener` class.

## Goals

1. **Generate Selector Tables** - Create formatted tables mapping function selectors to their source facets with proper alignment and box-drawing characters
2. **Produce Section Headers** - Generate visually distinct headers for facets, dependencies, init contracts, and the diamond contract
3. **Create Summary Headers** - Generate metadata-rich file headers with diamond information, statistics, timestamps, and warnings
4. **Assemble Final Output** - Combine all formatted components in the correct order: SPDX → Pragma → Summary → Selector Table → Dependencies → Facets → Diamond
5. **Handle Edge Cases Gracefully** - Generate valid output with warnings/placeholders when data is missing or invalid
6. **Maintain Clean Separation** - Keep formatting logic separate from I/O operations for testability and reusability

## User Stories

### Story 1: Developer Reviews Flattened Contract

**As a** smart contract developer  
**I want** clear section headers separating facets from dependencies  
**So that** I can quickly navigate the 5000+ line flattened file and find specific contracts

**Acceptance Criteria:**

- Each facet has a header showing name, priority, version, and selector count
- Dependencies section is clearly marked
- Diamond contract section is at the end with clear header
- All headers use consistent visual style with 80-character width

### Story 2: Developer Verifies Selector Mappings

**As a** smart contract auditor  
**I want** a formatted table at the top of the file showing all function selectors  
**So that** I can verify which facet handles each function without analyzing the code

**Acceptance Criteria:**

- Table is located after summary header, before contract code
- Columns show: Selector (12 chars), Facet Name (22 chars), Function Signature (50 chars)
- Selectors are sorted alphabetically for easy lookup
- Long function signatures are truncated with "..."
- Table uses box-drawing characters for professional appearance

### Story 3: Developer Understands Generation Context

**As a** team member reviewing a flattened contract  
**I want** a summary header with metadata about when and how it was generated  
**So that** I can understand the source, version, network, and scope of the flattened output

**Acceptance Criteria:**

- Summary header shows diamond name prominently
- Generation timestamp in ISO 8601 format
- Statistics: total contracts, facets, selectors, dependencies
- Generator version (plugin version)
- Network name (if deployed)
- Warning that file is auto-generated

### Story 4: Build System Generates Production Artifacts

**As a** DevOps engineer  
**I want** the formatter to handle missing data gracefully  
**So that** the build pipeline doesn't fail when optional information is unavailable

**Acceptance Criteria:**

- Missing selector map generates warning comment but continues
- Missing diamond contract generates placeholder header
- Empty dependencies section shows "None" instead of failing
- All edge cases produce valid Solidity syntax
- Warnings logged to console for visibility

## Functional Requirements

### FR1: OutputFormatter Class Creation

**Priority:** P0 (Blocking)

1.1. Create `src/lib/OutputFormatter.ts` with `OutputFormatter` class  
1.2. Class should be instantiated with no constructor parameters (utility class)  
1.3. Class should contain only public methods that return formatted strings  
1.4. Class should NOT handle file I/O or disk writes  
1.5. All formatting specifications (widths, styles) should be hardcoded per Epic 4 spec

### FR2: Function Selector Table Generation

**Priority:** P0 (Blocking)

2.1. Implement `generateSelectorTable(selectorMap: Map<string, SelectorInfo>): string`  
2.2. Use Unicode box-drawing characters: `║`, `═`, `╔`, `╗`, `╚`, `╝`, `╠`, `╣`, `╦`, `╩`  
2.3. Define three columns with exact widths:

- Selector: 12 characters (8 chars + padding)
- Facet: 22 characters
- Function Signature: 50 characters  
  2.4. Sort selectors alphabetically (ascending) before rendering  
  2.5. Truncate function signatures longer than 47 characters with "..."  
  2.6. Wrap entire table in Solidity block comment (`/* ... */`)  
  2.7. Handle empty selector map: return comment with "No function selectors found"  
  2.8. Pad all cells to align borders correctly

**Example Output:**

```solidity
/*
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                        DIAMOND FUNCTION SELECTOR MAP                         ║
 * ╠════════════╦══════════════════════╦══════════════════════════════════════════╣
 * ║  Selector  ║       Facet          ║             Function                     ║
 * ╠════════════╬══════════════════════╬══════════════════════════════════════════╣
 * ║ 0x01ffc9a7 ║ DiamondLoupeFacet    ║ supportsInterface(bytes4)                ║
 * ║ 0x1f931c1c ║ DiamondCutFacet      ║ diamondCut(FacetCut[],address,bytes)     ║
 * ║ 0x7a0ed627 ║ DiamondLoupeFacet    ║ facets()                                 ║
 * ╚════════════╩══════════════════════╩══════════════════════════════════════════╝
 */
```

### FR3: Section Header Generation

**Priority:** P0 (Blocking)

3.1. Implement `generateFacetHeader(facet: DiscoveredFacet): string`  
3.2. Implement `generateInitHeader(initContract: DiscoveredFacet): string`  
3.3. Implement `generateDependenciesHeader(): string`  
3.4. Implement `generateDiamondHeader(diamondName: string): string`

3.5. All headers must:

- Use `//` line comments (not block comments)
- Be exactly 80 characters wide (including `// ` prefix)
- Use `=` characters for horizontal rules
- Follow consistent formatting

  3.6. Facet header format:

```solidity
// ============================================================================
// FACET: ERC721Facet
// Priority: 100 | Version: 1.0.0 | Selectors: 12
// ============================================================================
```

3.7. Init contract header format:

```solidity
// ============================================================================
// INIT CONTRACT: DiamondInit
// Priority: 1 | Version: 1.0.0 | Selectors: 1
// ============================================================================
```

3.8. Dependencies header format:

```solidity
// ============================================================================
// SHARED DEPENDENCIES
// ============================================================================
```

3.9. Diamond header format:

```solidity
// ============================================================================
// DIAMOND: MyProtocolDiamond
// ============================================================================
```

3.10. Handle missing metadata gracefully:

- Missing priority: show "Priority: N/A"
- Missing version: show "Version: N/A"
- Selector count always calculated from actual selectors array

### FR4: Summary Header Generation

**Priority:** P0 (Blocking)

4.1. Implement `generateSummaryHeader(options: SummaryHeaderOptions): string`  
4.2. Define `SummaryHeaderOptions` interface:

```typescript
interface SummaryHeaderOptions {
  diamondName: string;
  totalContracts: number;
  totalFacets: number;
  totalSelectors: number;
  totalDependencies: number;
  generatorVersion: string;
  networkName?: string; // Optional
}
```

4.3. Summary header must include:

- Box-drawing border (same style as selector table)
- Diamond name prominently displayed
- Generation timestamp in ISO 8601 format (UTC)
- All statistics from options
- Generator version (hardhat-diamonds version)
- Network name (if provided)
- "AUTO-GENERATED - DO NOT EDIT" warning

  4.4. Format specification:

```solidity
/*
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                          FLATTENED DIAMOND CONTRACT                          ║
 * ║                              MyProtocolDiamond                               ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Generated: 2026-01-31T15:30:45.123Z                                         ║
 * ║  Generator: hardhat-diamonds v1.1.15                                         ║
 * ║  Network: localhost (31337)                                                  ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Statistics:                                                                 ║
 * ║    • Total Contracts: 23                                                     ║
 * ║    • Facets: 8                                                               ║
 * ║    • Function Selectors: 156                                                 ║
 * ║    • Dependencies: 15                                                        ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  ⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY                              ║
 * ║  This file was automatically generated by hardhat-diamonds.                  ║
 * ║  Any manual changes will be lost on the next regeneration.                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
```

4.5. Timestamp generation: Use `new Date().toISOString()`  
4.6. Network line: Only include if `networkName` provided in options  
4.7. Generator version: Read from package.json or pass as parameter

### FR5: Source Cleaning Methods

**Priority:** P0 (Blocking)

5.1. Implement `cleanSource(content: string): string` private helper  
5.2. Cleaning must remove:

- All SPDX license identifiers (`// SPDX-License-Identifier: ...`)
- All pragma statements (`pragma solidity ...`)
- All import statements (already done by deduplication, but verify)
- Excessive blank lines (more than 2 consecutive)

  5.3. Cleaning must preserve:

- All contract definitions
- All comments (inline, block, NatSpec)
- Function/variable/event definitions
- Line numbers (replace removed lines with single blank line)

  5.4. Implement `extractPragma(content: string): string | null`  
  5.5. Extract first pragma statement found in any source file  
  5.6. Return null if no pragma found (will use default)

  5.7. Implement `extractSPDX(content: string): string | null`  
  5.8. Extract first SPDX identifier found  
  5.9. Return null if none found (will use "UNLICENSED")

### FR6: Final Output Assembly Method

**Priority:** P0 (Blocking)

6.1. Implement assembly method in `DiamondFlattener` class:

```typescript
private assembleOutput(
  formatter: OutputFormatter,
  selectorMap: Map<string, SelectorInfo>,
  deduplicated: DeduplicatedSource[],
  facets: DiscoveredFacet[],
  diamondInfo: DiamondContractInfo
): string
```

6.2. Assembly order (MANDATORY - do not reorder):

1.  SPDX License Identifier
2.  Pragma Statement
3.  Blank line
4.  Summary Header
5.  Blank line
6.  Function Selector Table
7.  Blank line
8.  Shared Dependencies Header + Sources
9.  Blank line
10. Facets (each with header) + Sources
11. Blank line
12. Diamond Header + Source

6.3. For SPDX: Extract from first source, fallback to "UNLICENSED"  
6.4. For Pragma: Extract from first source, fallback to "^0.8.0"  
6.5. For Dependencies: Filter deduplicated sources where `kept=true` and not a facet/diamond  
6.6. For Facets: Use discovered facets list, include init contracts  
6.7. For Diamond: Use diamond contract info from discovery

6.8. Blank line handling:

- Use exactly 1 blank line between major sections
- Use exactly 2 blank lines before section headers
- No trailing blank lines at end of file

  6.9. Join all parts with `\n` (Unix line endings)

### FR7: Integration with DiamondFlattener

**Priority:** P1 (High)

7.1. Add `OutputFormatter` import to `DiamondFlattener.ts`  
7.2. Instantiate `OutputFormatter` in flatten workflow  
7.3. Call assembly method with formatter instance  
7.4. Write assembled output to file specified in options  
7.5. Return output string from flatten method for testing

### FR8: Error Handling & Edge Cases

**Priority:** P0 (Blocking)

8.1. Empty selector map:

- Generate table with "No function selectors found" message
- Continue with output assembly

  8.2. No facets discovered:

- Generate dependencies and diamond only
- Add warning comment before diamond section

  8.3. No diamond contract found:

- Generate placeholder diamond header with "Diamond contract not found"
- Log warning to console

  8.4. No dependencies:

- Skip dependencies section entirely (don't show header)

  8.5. Invalid facet metadata:

- Replace missing values with "N/A"
- Continue processing

  8.6. Missing SPDX/Pragma:

- Use sensible defaults (UNLICENSED, ^0.8.0)
- Continue processing

  8.7. All errors should:

- Generate valid Solidity syntax
- Include warning comments in output
- Log warnings to console (not thrown errors)

## Non-Goals (Out of Scope)

1. **File I/O Operations** - `OutputFormatter` does NOT write to disk; that's `DiamondFlattener`'s responsibility
2. **Configurable Formatting** - All widths, styles, and formats are hardcoded per spec (no user configuration)
3. **Syntax Validation** - Assumes input from Epic 3 is valid; doesn't validate Solidity syntax
4. **Code Optimization** - Doesn't minify, optimize, or transform contract code
5. **Multiple Output Formats** - Only produces Solidity `.sol` format (no JSON, TypeScript, etc.)
6. **Template System** - No external templates or configuration files; formatting is code-defined
7. **Localization** - All text in English only
8. **Custom Box Characters** - Unicode box-drawing chars are fixed (not ASCII alternatives)
9. **Conditional Formatting** - No "compact mode" or "verbose mode" for output
10. **Source Maps** - Doesn't generate source maps for debugging

## Design Considerations

### Class Structure

```typescript
// src/lib/OutputFormatter.ts
export class OutputFormatter {
  // No constructor needed (utility class)

  // Public API methods
  public generateSelectorTable(selectorMap: Map<string, SelectorInfo>): string;
  public generateFacetHeader(facet: DiscoveredFacet): string;
  public generateInitHeader(initContract: DiscoveredFacet): string;
  public generateDependenciesHeader(): string;
  public generateDiamondHeader(diamondName: string): string;
  public generateSummaryHeader(options: SummaryHeaderOptions): string;

  // Private helper methods
  private padCell(
    content: string,
    width: number,
    align?: "left" | "center" | "right",
  ): string;
  private wrapInBlockComment(content: string): string;
  private truncateSignature(signature: string, maxLength: number): string;
  private formatStatLine(label: string, value: string | number): string;
}
```

### Integration Pattern

```typescript
// In DiamondFlattener.ts
import { OutputFormatter } from './OutputFormatter';

public async flatten(): Promise<string> {
  // ... existing Epic 2 & 3 logic ...

  const formatter = new OutputFormatter();
  const output = this.assembleOutput(
    formatter,
    selectorMap,
    deduplicated,
    facets,
    diamondInfo
  );

  // Write to file
  await fs.writeFile(this.options.outputPath, output, 'utf-8');

  return output; // For testing
}
```

### Visual Consistency

- **Box-drawing characters** used for tables and summary (professional appearance)
- **Line comments** used for section headers (clearer in large files)
- **80-character width** enforced for all headers (standard terminal width)
- **Consistent spacing** between sections (1-2 blank lines)

### Unicode Support

All box-drawing uses Unicode characters from Box Drawing block (U+2500 to U+257F):

- Horizontal: `═` (U+2550)
- Vertical: `║` (U+2551)
- Corners: `╔` `╗` `╚` `╝`
- T-junctions: `╠` `╣` `╦` `╩`
- Cross: `╬` (U+256C)

## Technical Considerations

### Dependencies

- **Epic 2**: Requires diamond discovery functionality (`discoverFacets`, `buildSelectorMap`)
- **Epic 3**: Requires flattening engine (`SourceResolver`, `DependencyGraph`, `deduplicateSources`)
- **No new npm packages**: Uses only Node.js built-ins and existing dependencies

### Performance

- **Small overhead**: Formatting operations are string concatenation (O(n) where n = total source length)
- **No file I/O in formatter**: All methods return strings, no blocking operations
- **Memory efficient**: Builds output incrementally, doesn't duplicate large strings unnecessarily

### Testing Strategy

- **Unit tests**: Each `OutputFormatter` method tested independently with fixtures
- **Integration tests**: Full assembly tested with mock data from Epic 2 & 3
- **Snapshot tests**: Capture expected output format, detect unintended changes
- **Edge case tests**: Empty maps, missing data, malformed inputs

### Compatibility

- **Solidity versions**: Output compatible with any Solidity version (just concatenates valid Solidity)
- **Node.js**: Requires Node 18+ (for existing Hardhat compatibility)
- **TypeScript**: Strict mode compatible (no `any` types, proper null checks)

### Code Quality

- **JSDoc**: All public methods must have complete JSDoc with examples
- **Type safety**: Use interfaces for all options, no loosely-typed objects
- **Error messages**: Clear, actionable messages when warnings logged
- **Linting**: Must pass ESLint and Prettier checks

## Success Metrics

### Functional Success

1. **Output Validity** - 100% of generated files compile without syntax errors
2. **Format Compliance** - All outputs match Epic 4 visual specifications exactly
3. **Edge Case Handling** - All 7 edge cases handled gracefully without thrown errors
4. **Test Coverage** - ≥95% code coverage for `OutputFormatter` class

### Quality Metrics

1. **Visual Consistency** - All headers align to 80 characters, all table borders align perfectly
2. **Readability** - Developers can find specific facets/functions in <10 seconds
3. **Build Stability** - Zero build failures due to formatter edge cases
4. **Performance** - Formatting adds <100ms to total flatten time (for 50 contracts)

### Developer Experience

1. **API Clarity** - Junior developers understand method purposes from names alone
2. **Testability** - Each method can be tested independently with simple fixtures
3. **Debugging** - Generated output includes metadata to trace back to source
4. **Maintainability** - Formatting logic centralized, not scattered across codebase

## Open Questions

1. **Generator Version Source** - Should we read from package.json at runtime or pass as parameter? _(Recommendation: Read from package.json for accuracy)_

2. **Selector Map Type** - Current spec shows `Map<string, SelectorInfo>` but need to confirm `SelectorInfo` structure from Epic 2 _(Verify: Does it include facet name and function signature?)_

3. **Init Contract Handling** - Should init contracts appear in both selector table AND as separate section? _(Recommendation: Show in table but mark with special indicator)_

4. **Long Diamond Names** - What if diamond name exceeds 80 chars in summary header? _(Recommendation: Truncate with "..." or wrap to multiple lines)_

5. **Multiple SPDXs** - If dependencies have different SPDX licenses, which should we use? _(Recommendation: Use first found, add warning comment if conflicts detected)_

6. **Network Display** - Should we show chainId in addition to network name? _(Recommendation: Yes, format as "localhost (31337)")_

## Implementation Phases

Based on selection 5B (split implementation), this epic will be delivered in two phases:

### Phase 1: Selector Table & Headers (First PR)

- Implement `OutputFormatter` class skeleton
- Implement `generateSelectorTable()` with full box-drawing
- Implement all header generation methods (facet, init, dependencies, diamond)
- Unit tests for all Phase 1 methods
- 40 test cases minimum

**Acceptance Criteria:**

- Selector table renders perfectly with box-drawing
- All header formats match specifications
- Edge cases handled (empty map, missing metadata)
- 95%+ code coverage for implemented methods

### Phase 2: Summary & Final Assembly (Second PR)

- Implement `generateSummaryHeader()` with statistics
- Implement source cleaning helpers
- Implement `assembleOutput()` in `DiamondFlattener`
- Integration tests with full pipeline
- End-to-end flatten test producing real output

**Acceptance Criteria:**

- Summary header includes all metadata and warnings
- Final output assembles in correct order
- Full flatten produces valid, compilable Solidity
- Integration tests demonstrate full Epic 2-3-4 pipeline

---

## Appendix: Example Full Output

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                          FLATTENED DIAMOND CONTRACT                          ║
 * ║                              MyProtocolDiamond                               ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Generated: 2026-01-31T15:30:45.123Z                                         ║
 * ║  Generator: hardhat-diamonds v1.1.15                                         ║
 * ║  Network: localhost (31337)                                                  ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Statistics:                                                                 ║
 * ║    • Total Contracts: 23                                                     ║
 * ║    • Facets: 8                                                               ║
 * ║    • Function Selectors: 156                                                 ║
 * ║    • Dependencies: 15                                                        ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  ⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY                              ║
 * ║  This file was automatically generated by hardhat-diamonds.                  ║
 * ║  Any manual changes will be lost on the next regeneration.                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

/*
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                        DIAMOND FUNCTION SELECTOR MAP                         ║
 * ╠════════════╦══════════════════════╦══════════════════════════════════════════╣
 * ║  Selector  ║       Facet          ║             Function                     ║
 * ╠════════════╬══════════════════════╬══════════════════════════════════════════╣
 * ║ 0x01ffc9a7 ║ DiamondLoupeFacet    ║ supportsInterface(bytes4)                ║
 * ║ 0x1f931c1c ║ DiamondCutFacet      ║ diamondCut(FacetCut[],address,bytes)     ║
 * ║ 0x7a0ed627 ║ DiamondLoupeFacet    ║ facets()                                 ║
 * ╚════════════╩══════════════════════╩══════════════════════════════════════════╝
 */

// ============================================================================
// SHARED DEPENDENCIES
// ============================================================================

library LibDiamond {
    // ... library code ...
}

interface IERC165 {
    // ... interface code ...
}

// ============================================================================
// FACET: DiamondCutFacet
// Priority: 1 | Version: 1.0.0 | Selectors: 1
// ============================================================================

contract DiamondCutFacet {
    // ... facet code ...
}

// ============================================================================
// FACET: DiamondLoupeFacet
// Priority: 100 | Version: 1.0.0 | Selectors: 4
// ============================================================================

contract DiamondLoupeFacet {
    // ... facet code ...
}

// ============================================================================
// DIAMOND: MyProtocolDiamond
// ============================================================================

contract MyProtocolDiamond {
    // ... diamond code ...
}
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-31  
**Author:** Generated from Epic 4 specifications  
**Status:** Ready for Implementation
