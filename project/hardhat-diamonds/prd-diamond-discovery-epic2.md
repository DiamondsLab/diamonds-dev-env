# Product Requirements Document: Diamond Discovery Engine (Epic 2)

## 1. Introduction/Overview

The Diamond Discovery Engine is the core component that integrates with the @diamondslab/diamonds module to automatically discover, analyze, and map all facets within an ERC-2535 Diamond Proxy contract. This feature solves the problem of manually tracking facets and their function selectors across complex Diamond implementations.

**Problem Statement:** Developers working with Diamond contracts need a reliable way to:

- Discover all facets from Diamond configuration files
- Extract function selectors from each facet's ABI
- Resolve contract source paths for flattening
- Build a complete mapping of selectors to facets

**Goal:** Create a robust discovery engine that automatically identifies all facets, extracts their function selectors, resolves contract paths, and builds comprehensive selector mappings with proper error handling and fallback mechanisms.

## 2. Goals

### Primary Goals

1. **Automatic Facet Discovery**: Discover all facets from Diamond configuration with 100% accuracy
2. **Selector Extraction**: Extract all function selectors from facet ABIs with proper 4-byte selector computation
3. **Path Resolution**: Resolve contract source file paths for all discovered facets and the main Diamond contract
4. **Selector Mapping**: Build complete selector-to-facet mapping for audit trail generation
5. **Robust Error Handling**: Implement mixed error handling strategy - fail fast for critical issues, warn and continue for non-critical issues

### Secondary Goals

6. **Diamond Module Integration**: Use @diamondslab/diamonds module directly with fallback mechanisms for missing data
7. **High Test Coverage**: Achieve ≥95% test coverage with both unit and integration tests
8. **Priority Ordering**: Support facet priority ordering for correct deployment sequence awareness

## 3. User Stories

### As a Smart Contract Developer

- I want to run `npx hardhat diamond:flatten --diamond-name MyDiamond` and have the tool automatically discover all facets so I don't have to manually list them
- I want to see warnings if any facet source files are missing so I can fix configuration issues before attempting to flatten
- I want the tool to identify which contracts are initialization contracts so they're handled correctly in the flattened output

### As a Security Auditor

- I want to see a complete mapping of function selectors to facets so I can verify which facet handles each function call
- I want to know if there are any duplicate selectors across facets so I can identify potential selector collision issues
- I want the tool to fail with a clear error message if critical Diamond configuration is invalid so I don't audit incomplete data

### As a DevOps Engineer

- I want the discovery process to continue even if non-critical facet data is missing so CI/CD pipelines don't fail unnecessarily
- I want verbose logging options to troubleshoot discovery issues in different environments
- I want clear differentiation between warnings (non-blocking) and errors (blocking) so I know what needs immediate attention

## 4. Functional Requirements

### FR1: DiamondFlattener Class (Feature E2-F1)

1. The system MUST create a `DiamondFlattener` class in `src/lib/DiamondFlattener.ts`
2. The constructor MUST accept `HardhatRuntimeEnvironment` and `DiamondFlattenOptions` parameters
3. The constructor MUST apply default values for optional options:
   - `networkName`: defaults to `hre.network.name`
   - `chainId`: defaults to `hre.network.config.chainId` or 31337
   - `diamondsPath`: defaults from hardhat config or "diamonds"
   - `contractsPath`: defaults from hardhat config or "contracts"
   - `verbose`: defaults to false
4. The constructor MUST call `initializeDiamond()` to load Diamond instance from @diamondslab/diamonds module
5. The system MUST throw `FlattenError` with descriptive message if Diamond configuration is not found
6. The class MUST maintain a warnings collection that accumulates non-critical issues
7. The class MUST support verbose logging mode that outputs detailed discovery information
8. The class MUST be exported from `src/lib/index.ts` for external use

### FR2: Facet Discovery (Feature E2-F2)

9. The system MUST implement `discoverFacets()` method that returns `Promise<DiscoveredFacet[]>`
10. The method MUST retrieve facet configuration from Diamond deployment configuration
11. The method MUST resolve contract source paths for each facet using `resolveContractPath()` helper
12. The method MUST identify initialization contracts using `isInitContract()` helper
13. The system MUST sort discovered facets by priority in ascending order (lowest priority first)
14. The system MUST extract version information from facet configuration when available
15. The system MUST log warnings (not errors) when facet source files cannot be located
16. The system MUST continue discovery even if individual facet processing fails (collect warnings)
17. The system MUST return empty array if no facets are configured (with warning)

### FR3: Function Selector Extraction (Feature E2-F3)

18. The system MUST implement `getFacetSelectors()` method that extracts selectors for a given facet
19. The method MUST try Diamond registry first, then fallback to ABI extraction
20. The system MUST implement `extractSelectorsFromAbi()` that computes 4-byte selectors from contract ABI
21. The system MUST implement `buildSelectorMap()` that creates complete selector-to-facet mapping
22. The selector computation MUST use keccak256 hash of function signature (first 4 bytes)
23. The system MUST build function signatures in format: `functionName(param1Type,param2Type)`
24. The system MUST build full signatures with parameter names: `functionName(type1 name1, type2 name2)`
25. The system MUST detect duplicate selectors across facets and add warning to collection
26. The system MUST handle facets with no functions gracefully (return empty array)
27. The system MUST include selector, facetName, functionName, and full signature in `SelectorInfo` objects

### FR4: Diamond Contract Discovery (Feature E2-F4)

28. The system MUST implement `discoverDiamondContract()` method that returns `Promise<DiamondContractInfo>`
29. The method MUST search for Diamond contract in multiple locations:
    - Configuration-specified path
    - Standard Diamond.sol location
    - Custom Diamond implementation files
30. The system MUST return `DiamondContractInfo` with name, sourcePath, and found status
31. The system MUST add warning if Diamond contract source file not found (but continue processing)
32. The system MUST validate Diamond contract has required diamond cut functions

### FR5: Error Handling Strategy (Mixed Approach)

33. The system MUST throw `FlattenError` immediately for critical failures:
    - Diamond configuration not found in hardhat config
    - Invalid Diamond instance (null or undefined)
    - Network configuration errors
34. The system MUST collect warnings for non-critical issues:
    - Missing facet source files
    - Missing Diamond contract source file
    - Facets with no functions
    - Duplicate function selectors
35. The system MUST provide clear error messages including:
    - What failed
    - Why it failed
    - How to fix it (actionable suggestion)
36. Warning messages MUST include severity level and affected component

### FR6: Diamond Module Integration (Hybrid Approach)

37. The system MUST import and use Diamond classes from @diamondslab/diamonds directly
38. The system MUST implement fallback mechanisms when Diamond data is unavailable:
    - Fallback to configuration files if Diamond instance methods fail
    - Fallback to ABI parsing if registry lookups fail
    - Fallback to file system search if path resolution fails
39. The system MUST log which fallback mechanism was used (when verbose mode enabled)
40. The system MUST validate Diamond instance compatibility on initialization

## 5. Non-Goals (Out of Scope)

The following are explicitly **NOT** included in Epic 2:

1. **Contract Flattening**: Actual merging of contract source code (Epic 3)
2. **SPDX License Handling**: License deduplication and consolidation (Epic 3)
3. **Import Statement Processing**: Import path resolution and rewriting (Epic 3)
4. **Output File Writing**: Writing flattened source to disk (Epic 5)
5. **CLI Output Formatting**: Pretty-printing selector tables or statistics (Epic 5)
6. **Network Deployment**: Deploying or interacting with on-chain Diamond contracts
7. **ABI Validation**: Verifying ABI format correctness or completeness
8. **Selector Collision Resolution**: Automatically fixing duplicate selectors
9. **Custom Facet Implementations**: Supporting non-standard Diamond patterns
10. **Performance Optimization**: Caching or parallel processing (can be added later)

## 6. Design Considerations

### Class Architecture

```typescript
// Main class structure
export class DiamondFlattener {
  private hre: HardhatRuntimeEnvironment;
  private options: Required<DiamondFlattenOptions>;
  private diamond: Diamond | null;
  private warnings: string[];

  constructor(hre: HardhatRuntimeEnvironment, options: DiamondFlattenOptions);

  // Public API
  public async discoverFacets(): Promise<DiscoveredFacet[]>;
  public async buildSelectorMap(
    facets: DiscoveredFacet[],
  ): Promise<Map<string, SelectorInfo>>;
  public async discoverDiamondContract(): Promise<DiamondContractInfo>;

  // Private helpers
  private initializeDiamond(): void;
  private resolveContractPath(contractName: string): Promise<string | null>;
  private isInitContract(facetName: string, deployConfig: any): boolean;
  private getFacetSelectors(facetName: string): Promise<string[]>;
  private extractSelectorsFromAbi(abi: any[]): string[];
  private buildFunctionSignature(abiItem: any): string;
  private buildFullSignature(abiItem: any): string;
}
```

### Error Hierarchy

```typescript
// Custom error class for flatten operations
export class FlattenError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
  ) {
    super(message);
    this.name = "FlattenError";
  }
}

// Error codes
const ErrorCodes = {
  DIAMOND_NOT_FOUND: "DIAMOND_NOT_FOUND",
  INVALID_CONFIGURATION: "INVALID_CONFIGURATION",
  NETWORK_ERROR: "NETWORK_ERROR",
  // ... more codes
};
```

### Implementation Sequence

Per user selection (1B - Core-first approach):

1. **Phase 1**: Implement F1 (DiamondFlattener foundation) + F2 (Facet Discovery) together
2. **Phase 2**: Implement F3 (Selector Extraction)
3. **Phase 3**: Implement F4 (Diamond Contract Discovery)

## 7. Technical Considerations

### Dependencies

- **@diamondslab/diamonds**: Core Diamond implementation module (peer dependency)
- **ethers.js v6**: For keccak256 hashing and signature computation
- **hardhat**: Runtime environment and configuration access
- **chalk v4**: Terminal output coloring (already in Epic 1)

### Integration Points

- **Epic 1 Integration**: DiamondFlattener uses interfaces from TaskOptions.ts
- **Hardhat Config**: Reads Diamond configuration from `hre.config.diamonds`
- **File System**: Resolves paths using `hre.config.paths` for artifacts and sources
- **Diamond Module**: Direct integration with fallback to configuration files

### Path Resolution Strategy

```typescript
// Priority order for contract path resolution:
1. Hardhat artifacts (compiled contracts)
2. Source contracts directory
3. Configuration-specified paths
4. Standard Diamond locations
5. Fallback: null with warning
```

### Selector Computation Algorithm

```typescript
// Function selector = first 4 bytes of keccak256(signature)
const signature = "transfer(address,uint256)";
const hash = ethers.keccak256(ethers.toUtf8Bytes(signature));
const selector = hash.slice(0, 10); // "0x" + 8 hex chars = 4 bytes
```

### Testing Strategy (Per user selection 2C)

- **Unit Tests**: Test each method in isolation with mocks (≥95% coverage)
- **Integration Tests**: Test full discovery flow with real Diamond configurations
- **Test Fixtures**: Create mock Diamond configurations and ABIs
- **Edge Cases**: Test empty facets, missing files, invalid ABIs, duplicate selectors

## 8. Success Metrics

Epic 2 is considered **successful** when:

### Functional Completeness (Per user selection 5B)

1. ✅ All facets discovered from valid Diamond configuration (100% accuracy)
2. ✅ All function selectors extracted and mapped to correct facets
3. ✅ All contract source paths resolved or warnings provided
4. ✅ Selector map built with complete metadata (selector, facet, function, signature)

### Quality Metrics

5. ✅ Test coverage ≥95% for all new code (unit + integration)
6. ✅ All tests passing (100% pass rate)
7. ✅ No TypeScript compilation errors
8. ✅ No ESLint violations
9. ✅ All public methods have JSDoc documentation

### Integration Metrics

10. ✅ DiamondFlattener can be instantiated with valid HRE and options
11. ✅ Discovery methods can be called independently or as a flow
12. ✅ Warnings collection works correctly (non-blocking issues accumulated)
13. ✅ Verbose logging provides useful debug information

### Error Handling Metrics

14. ✅ Critical errors throw FlattenError with clear messages
15. ✅ Non-critical issues logged as warnings without stopping execution
16. ✅ All error messages include actionable fix suggestions
17. ✅ Fallback mechanisms work when Diamond module data unavailable

### Performance Targets (Nice-to-have)

- Discovery completes in <2 seconds for typical Diamond (5-10 facets)
- Selector extraction completes in <1 second for 100+ functions
- Memory usage remains reasonable (<100MB) for large Diamonds

## 9. Open Questions

### Configuration Questions

1. **Q**: Should we support custom facet discovery strategies beyond Diamond configuration?
   - **Context**: Some projects may use alternative facet registration methods
   - **Impact**: Medium - affects flexibility but adds complexity
   - **Decision Needed By**: Before Phase 1 implementation

2. **Q**: How should we handle facets with identical selectors (intentional overrides)?
   - **Context**: Diamond pattern allows facet replacement with same selectors
   - **Impact**: Medium - affects selector mapping accuracy
   - **Decision Needed By**: Before Phase 2 implementation

### Integration Questions

3. **Q**: Should DiamondFlattener be a singleton or allow multiple instances?
   - **Context**: Multiple Diamonds might be flattened in same session
   - **Impact**: Low - affects API design but not functionality
   - **Decision Needed By**: Before Phase 1 implementation

4. **Q**: Should we cache discovered facets to avoid re-discovery?
   - **Context**: Could improve performance for repeated flatten operations
   - **Impact**: Low - performance optimization, not critical for MVP
   - **Decision Needed By**: Future enhancement (post-Epic 2)

### Testing Questions

5. **Q**: Should we create test fixtures in the repository or generate them dynamically?
   - **Context**: Need realistic Diamond configurations for integration tests
   - **Impact**: Low - affects test maintenance but not functionality
   - **Decision Needed By**: Before test implementation

6. **Q**: Should integration tests deploy real Diamond contracts to Hardhat node?
   - **Context**: More realistic but slower tests
   - **Impact**: Medium - affects test reliability and speed
   - **Decision Needed By**: During test implementation

---

## Appendix: Epic 2 Feature Breakdown

### Feature E2-F1: DiamondFlattener Foundation (FR1-8)

- **Story Points**: 3
- **Files**: `src/lib/DiamondFlattener.ts`, `src/lib/index.ts`
- **Tests**: `test/unit/lib/DiamondFlattener.test.ts`

### Feature E2-F2: Facet Discovery (FR9-17)

- **Story Points**: 3
- **Files**: Add methods to `DiamondFlattener.ts`
- **Tests**: Expand `DiamondFlattener.test.ts` with discovery tests

### Feature E2-F3: Selector Extraction (FR18-27)

- **Story Points**: 5
- **Files**: Add selector methods to `DiamondFlattener.ts`
- **Tests**: Add selector extraction and mapping tests

### Feature E2-F4: Diamond Contract Discovery (FR28-32)

- **Story Points**: 2
- **Files**: Add Diamond discovery to `DiamondFlattener.ts`
- **Tests**: Add Diamond contract discovery tests

**Total Story Points**: 13 (matches Epic 2 estimate)

---

**Document Version**: 1.0  
**Last Updated**: January 30, 2026  
**Status**: Ready for Implementation  
**Next Step**: Generate task list from this PRD
