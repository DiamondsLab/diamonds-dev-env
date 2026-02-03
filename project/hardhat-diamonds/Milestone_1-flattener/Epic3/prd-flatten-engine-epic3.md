# Product Requirements Document: Solidity Source Flattening Engine (Epic 3)

**Version:** 1.0  
**Date:** January 31, 2026  
**Status:** Ready for Implementation  
**Epic ID:** E3  
**Dependencies:** Epic 2 (Diamond Discovery Engine)

---

## 1. Introduction/Overview

The Solidity Source Flattening Engine is the core component of the `diamond:flatten` feature that transforms a Diamond proxy contract and its facets into a single, auditable Solidity file. This engine handles the complex task of resolving dependencies, managing imports, deduplicating contracts, and assembling source files in the correct order.

**Problem Statement:** Auditors and developers need to review Diamond proxy contracts, but the modular nature of Diamonds (with multiple facets spread across files) makes comprehensive analysis difficult. Manually combining these files is error-prone and time-consuming.

**Solution:** An automated flattening engine that:

- Loads all Solidity source files (facets, Diamond contract, and dependencies)
- Resolves imports (local and node_modules)
- Builds a dependency graph
- Sorts files in topological order
- Deduplicates identical contracts
- Preserves all source code comments and documentation
- Produces a single, valid Solidity file ready for auditing

---

## 2. Goals

1. **Accurate Source Resolution:** Load all required Solidity files from local paths and node_modules (@openzeppelin, etc.) using Hardhat's resolution order
2. **Complete Dependency Graph:** Build a full dependency tree showing all import relationships between contracts
3. **Correct Ordering:** Sort contracts in topological order ensuring dependencies are defined before they're used
4. **Smart Deduplication:** Remove duplicate contract definitions while keeping the first occurrence and warning about duplicates
5. **Comment Preservation:** Maintain all inline comments, block comments, and NatSpec documentation from source files
6. **Circular Dependency Handling:** Detect circular imports, show warnings, but continue flattening with one copy of each contract
7. **Full Solidity Support:** Handle abstract contracts, interfaces, libraries, and all import syntax variants

---

## 3. User Stories

### Story 1: Auditor Reviews Flattened Diamond

**As an** auditor  
**I want** a single Solidity file containing all Diamond contracts  
**So that** I can review the entire codebase in one place with proper context

**Acceptance Criteria:**

- All facet contracts are included in the output
- All dependencies (OpenZeppelin, custom libraries) are included
- Contracts appear in dependency order (base contracts before derived)
- All comments and documentation are preserved
- File compiles successfully with solc

### Story 2: Developer Analyzes Contract Dependencies

**As a** developer  
**I want** to see which contracts import which dependencies  
**So that** I can understand the dependency structure and potential circular references

**Acceptance Criteria:**

- Verbose mode shows each import resolution
- Circular dependencies are detected and reported as warnings
- Dependency graph provides clear file relationship information
- Statistics show total contracts and deduplicated count

### Story 3: Team Onboards New Developer

**As a** team lead  
**I want** new developers to see the complete Diamond structure in one file  
**So that** they can understand the entire system without navigating multiple files

**Acceptance Criteria:**

- Output includes all facets in logical order
- Comments explain contract purpose and relationships
- Abstract contracts and interfaces are included
- File is readable and well-organized

---

## 4. Functional Requirements

### 4.1 Source File Resolution (Feature E3-F1)

**FR-3.1:** The system MUST load Solidity source files from local paths (relative and absolute)

**FR-3.2:** The system MUST resolve imports using Hardhat's resolution order:

1.  Check local project paths first
2.  Check node_modules second
3.  Follow Hardhat's configured remappings

**FR-3.3:** The system MUST support all Solidity import syntax variants:

- Relative imports: `import "./Relative.sol";`
- Parent directory imports: `import "../Parent.sol";`
- Named imports: `import { Contract } from "./Named.sol";`
- Multiple named imports: `import { A, B, C } from "./Multiple.sol";`
- Namespace imports: `import * as Lib from "./Library.sol";`
- Node modules imports: `import "@openzeppelin/contracts/token/ERC20/ERC20.sol";`

**FR-3.4:** The system MUST extract and parse all import statements from each source file

**FR-3.5:** The system MUST cache loaded sources to avoid redundant file reads

**FR-3.6:** The system MUST throw a descriptive error when a source file cannot be found, including:

- The import statement that failed
- The file that contained the import
- Paths that were searched
- Suggestion to check file paths and node_modules installation

**FR-3.7:** The system MUST extract contract names from file paths for dependency tracking

**FR-3.8:** The system MUST provide verbose logging showing each file resolution attempt (when verbose mode enabled)

### 4.2 Dependency Graph Construction (Feature E3-F2)

**FR-3.9:** The system MUST build a complete dependency graph starting from Diamond and facet contracts

**FR-3.10:** The system MUST recursively follow all imports depth-first to discover transitive dependencies

**FR-3.11:** The system MUST detect circular dependencies in the import graph

**FR-3.12:** When circular dependencies are detected, the system MUST:

- Log a warning message identifying the circular path
- Continue processing (not fail)
- Keep one copy of each contract in the cycle

**FR-3.13:** The system MUST implement topological sorting using Kahn's algorithm to determine correct contract order

**FR-3.14:** The system MUST ensure the flattening order follows: Dependencies → Facets → Diamond contract

**FR-3.15:** The system MUST track both forward dependencies (what a contract imports) and reverse dependencies (what imports a contract)

**FR-3.16:** The system MUST provide statistics including:

- Total contracts discovered
- Number of unique contracts
- Number of circular dependencies detected
- Dependency tree depth

**FR-3.17:** The system MUST handle complex dependency trees with multiple levels of nested imports

### 4.3 Source Deduplication (Feature E3-F3)

**FR-3.18:** The system MUST identify duplicate contract definitions across multiple source files

**FR-3.19:** When duplicate contracts are found, the system MUST:

- Keep the FIRST occurrence in dependency order
- Log a warning about the duplicate
- Skip subsequent occurrences
- Track deduplication statistics

**FR-3.20:** When the same contract appears with DIFFERENT content (different versions), the system MUST:

- Keep the first occurrence
- Log a warning about content mismatch
- Include file paths of both versions in the warning
- Continue processing without failing

**FR-3.21:** The system MUST identify duplicate contracts by extracting contract/interface/library definitions using regex patterns:

- `contract ContractName`
- `interface InterfaceName`
- `library LibraryName`
- `abstract contract AbstractName`

**FR-3.22:** The system MUST remove import statements from deduplicated sources

**FR-3.23:** The system MUST preserve all other content including:

- All inline comments (`//`)
- All block comments (`/* */`)
- NatSpec documentation (`///` and `/** */`)
- Pragma directives (handled separately)
- SPDX license identifiers (handled separately)
- Contract code and whitespace

**FR-3.24:** The system MUST provide deduplication statistics showing:

- Number of original sources
- Number of duplicates removed
- List of deduplicated contract names

### 4.4 Abstract Contracts and Interfaces

**FR-3.25:** The system MUST include abstract contracts in the flattened output with full support

**FR-3.26:** The system MUST include interfaces in the flattened output with full support

**FR-3.27:** The system MUST include libraries in the flattened output with full support

**FR-3.28:** The system MUST preserve all modifiers (abstract, virtual, override, etc.) on functions and contracts

### 4.5 Error Handling and Logging

**FR-3.29:** The system MUST provide verbose logging mode that shows:

- Each file being loaded
- Import resolution paths attempted
- Circular dependencies detected
- Contracts being deduplicated
- Topological sort order

**FR-3.30:** The system MUST throw clear, actionable errors for:

- Missing source files
- Unresolvable imports
- Invalid Solidity syntax (from parser)

**FR-3.31:** The system MUST accumulate non-critical warnings without stopping execution:

- Circular dependency warnings
- Duplicate contract warnings
- Version mismatch warnings

**FR-3.32:** The system MUST provide a method to retrieve all accumulated warnings after flattening completes

---

## 5. Non-Goals (Out of Scope)

The following are explicitly **NOT** included in Epic 3:

1. **SPDX License Handling:** Will be handled in Epic 4 (Output Formatting)
2. **Pragma Directive Consolidation:** Will be handled in Epic 4
3. **Output File Writing:** Will be handled in Epic 4
4. **Selector Table Generation:** Already completed in Epic 2
5. **Solidity Compilation:** The engine produces source code but doesn't compile it
6. **Code Optimization:** No code transformation or optimization is performed
7. **Security Analysis:** No vulnerability scanning or security checks
8. **Gas Optimization:** No gas usage analysis or optimization
9. **Configuration Stripping:** Comments are preserved (not configurable in this epic)
10. **Custom Import Remapping:** Uses Hardhat's configuration only

---

## 6. Design Considerations

### 6.1 Architecture

The flattening engine consists of three main classes:

```
┌─────────────────────────────────────────────────────────┐
│                   DiamondFlattener                      │
│  (Orchestrates the flattening process)                  │
└────────────┬────────────────────────────────────────────┘
             │
             ├─► SourceResolver
             │   - Loads .sol files
             │   - Resolves imports
             │   - Parses import statements
             │   - Caches sources
             │
             ├─► DependencyGraph
             │   - Builds dependency tree
             │   - Detects circular deps
             │   - Topological sorting
             │   - Tracks relationships
             │
             └─► deduplicateSources()
                 - Removes duplicates
                 - Preserves comments
                 - Removes imports
                 - Tracks statistics
```

### 6.2 Data Structures

**LoadedSource Interface:**

```typescript
interface LoadedSource {
  name: string; // Contract name
  path: string; // Absolute file path
  content: string; // Full source code
  imports: ImportInfo[]; // Parsed imports
}
```

**DependencyNode Interface:**

```typescript
interface DependencyNode {
  name: string;
  source: LoadedSource;
  dependencies: Set<string>; // What this imports
  dependents: Set<string>; // What imports this
  visited: boolean; // For cycle detection
  imports: ImportInfo[];
}
```

### 6.3 Algorithm: Topological Sort

Uses **Kahn's Algorithm** to ensure correct ordering:

1. Calculate in-degree for each node (number of dependencies)
2. Start with nodes that have zero in-degree
3. Process nodes, removing edges, updating in-degrees
4. Detect cycles if any nodes remain unprocessed
5. Return sorted list

### 6.4 Comment Preservation Strategy

- Comments are preserved by keeping source text intact
- Only import statements are removed via regex replacement
- No AST manipulation is performed (preserves formatting)
- Line numbers may change but relative positions remain

---

## 7. Technical Considerations

### 7.1 Dependencies

**Required:**

- Hardhat Runtime Environment (HRE) for path resolution
- Node.js fs/promises for async file operations
- TypeScript for type safety

**No External Parsers Required:**

- Import parsing uses regex (sufficient for this use case)
- Full AST parsing not needed (preserves original formatting)

### 7.2 Performance Considerations

**Caching Strategy:**

- `SourceResolver` maintains a `Map<string, LoadedSource>` cache
- Files are read only once
- Cache is per-flattening operation (not persistent)

**Memory Usage:**

- All sources loaded into memory simultaneously
- Typical Diamond with 10 facets + dependencies: ~500KB source
- Acceptable for target use case (not streaming required)

**Expected Performance:**

- 25 facets with OpenZeppelin dependencies: < 5 seconds
- Circular dependency detection: O(V + E) where V=contracts, E=imports
- Topological sort: O(V + E)

### 7.3 Integration with Epic 2

Epic 3 builds on Epic 2's discovery:

- Uses `DiscoveredFacet[]` from Epic 2 as starting points
- Uses `DiamondContractInfo` to locate Diamond source
- Extends `DiamondFlattener` class from Epic 2

### 7.4 Testing Strategy

**Unit Tests Required:**

- SourceResolver: Import resolution, caching, error handling
- DependencyGraph: Graph building, cycle detection, topological sort
- Deduplication: Duplicate detection, comment preservation, import removal

**Integration Tests Required:**

- End-to-end flattening with real OpenZeppelin contracts
- Complex dependency trees (5+ levels deep)
- Circular dependency handling
- Mixed local and node_modules imports

**Test Fixtures Needed:**

- Mock Diamond with multiple facets
- Contracts with circular dependencies
- Duplicate contracts (same name, same content)
- Duplicate contracts (same name, different content)
- All import syntax variants

---

## 8. Success Metrics

| Metric                        | Target             | Measurement Method                                  |
| ----------------------------- | ------------------ | --------------------------------------------------- |
| Source Resolution Accuracy    | 100%               | All imports resolved correctly in test suite        |
| Dependency Graph Completeness | 100%               | All transitive dependencies discovered              |
| Deduplication Correctness     | 100%               | No false positives/negatives in duplicate detection |
| Comment Preservation          | 100%               | All comments present in output                      |
| Circular Dependency Detection | 100%               | All cycles detected in test cases                   |
| Processing Speed              | < 5s for 25 facets | Benchmark test with ExampleDiamond                  |
| Test Coverage                 | ≥ 95%              | Jest coverage report                                |
| Zero Critical Bugs            | Pass               | All P0/P1 bugs resolved before Epic completion      |

**Definition of Done:**

- All functional requirements implemented
- All unit tests passing (≥95% coverage)
- Integration tests passing with real OpenZeppelin contracts
- Circular dependency test cases passing
- Code reviewed and approved
- Documentation updated (JSDoc on all public methods)

---

## 9. Open Questions

1. **Q:** Should we support remappings beyond Hardhat's default configuration?  
   **A:** No, out of scope for Epic 3. Use Hardhat's configuration only.

2. **Q:** What if a contract has syntax errors?  
   **A:** The engine doesn't parse Solidity syntax deeply. If the file can be read and imports extracted, it will be included. Syntax errors will be caught when the flattened file is compiled (Epic 5).

3. **Q:** How should we handle Solidity version pragmas that conflict?  
   **A:** Deferred to Epic 4 (Output Formatting). Epic 3 preserves them as-is.

4. **Q:** Should we support custom file extensions (e.g., `.yul`, `.vy`)?  
   **A:** No, only `.sol` files are supported. This is a Solidity-specific tool.

5. **Q:** What about dynamic imports (require, etc.)?  
   **A:** Not applicable to Solidity. Only static `import` statements are supported.

---

## Appendix A: Example Dependency Graph

```
Diamond.sol
├── DiamondCutFacet.sol
│   └── IDiamondCut.sol
├── DiamondLoupeFacet.sol
│   └── IDiamondLoupe.sol
├── OwnershipFacet.sol
│   ├── @openzeppelin/contracts/access/Ownable.sol
│   │   └── @openzeppelin/contracts/utils/Context.sol
│   └── LibDiamond.sol
└── ExampleFacet.sol
    └── LibExample.sol
        └── LibDiamond.sol (deduplicated)
```

**Flattening Order:**

1. Context.sol
2. Ownable.sol
3. IDiamondCut.sol
4. IDiamondLoupe.sol
5. LibDiamond.sol
6. LibExample.sol
7. DiamondCutFacet.sol
8. DiamondLoupeFacet.sol
9. OwnershipFacet.sol
10. ExampleFacet.sol
11. Diamond.sol

---

**Document Status:** ✅ Ready for Implementation  
**Next Steps:** Generate task list using `generate-tasks.md` workflow
