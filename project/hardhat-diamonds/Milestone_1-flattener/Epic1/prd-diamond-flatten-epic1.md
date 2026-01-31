# Product Requirements Document: Diamond Flatten Epic 1

## Core Infrastructure & Task Registration

**Version:** 1.0  
**Date:** January 30, 2026  
**Status:** Ready for Implementation  
**Epic:** E1 - Core Infrastructure & Task Registration  
**Project:** Diamond Flatten Feature for @diamondslab/hardhat-diamonds

---

## 1. Introduction/Overview

### Problem Statement

The `@diamondslab/hardhat-diamonds` plugin currently lacks a way to flatten ERC-2535 Diamond Proxy contracts with all their facets into a single Solidity file. Auditors, security researchers, and developers need this capability to analyze the complete contract logic without navigating multiple files and understanding complex Diamond proxy patterns.

### Solution

Implement the foundational infrastructure for a `diamond:flatten` Hardhat task that will flatten Diamond contracts. Epic 1 establishes the core TypeScript interfaces, task registration system, argument validation, and integration patterns that subsequent epics will build upon.

### Goal

Create a production-ready foundation for the diamond flatten feature that follows existing hardhat-diamonds patterns, provides comprehensive validation, and enables seamless integration into the existing task ecosystem.

---

## 2. Goals

### Primary Goals

1. **Type Safety**: Define comprehensive TypeScript interfaces for all flatten operations with full JSDoc documentation
2. **Task Registration**: Register the `diamond:flatten` task in Hardhat's CLI with proper parameter definitions
3. **Validation**: Implement robust argument validation with helpful error messages and suggestions
4. **Pattern Consistency**: Follow existing task patterns from hardhat-diamonds (e.g., `diamond:generate-abi-typechain`)
5. **Developer Experience**: Provide clear CLI help and error messages for troubleshooting

### Success Criteria

- All TypeScript interfaces compile without errors
- Task appears in `npx hardhat --help` output
- Validation catches all invalid inputs with actionable error messages
- 100% unit test coverage for validation logic
- Zero `any` types in the codebase

---

## 3. User Stories

### User Story 1: Plugin Developer

**As a** hardhat-diamonds plugin developer  
**I want** strongly-typed interfaces for flatten operations  
**So that** I can build reliable flatten logic with compile-time safety and IDE autocomplete

**Acceptance Criteria:**

- All flatten-related data structures have TypeScript interfaces
- Interfaces include JSDoc comments explaining each property
- No use of `any` or `unknown` types
- Interfaces exported from public API

### User Story 2: Diamond Developer

**As a** Diamond contract developer  
**I want** to run `npx hardhat diamond:flatten --diamond-name MyDiamond`  
**So that** I can quickly flatten my Diamond contract for auditing

**Acceptance Criteria:**

- Task registered with name `diamond:flatten`
- Required `--diamond-name` parameter accepted
- Optional `--output`, `--verbose`, `--network` parameters accepted
- Task help documentation displays correctly

### User Story 3: CI/CD Engineer

**As a** CI/CD engineer  
**I want** the flatten task to fail fast with clear error messages  
**So that** I can quickly diagnose and fix pipeline issues

**Acceptance Criteria:**

- Invalid diamond names rejected with suggestions
- Missing required parameters show usage help
- File path validation prevents invalid outputs
- All errors include actionable suggestions

---

## 4. Functional Requirements

### FR-1: TypeScript Interface Definitions (Feature E1-F1)

**FR-1.1** Create `DiamondFlattenTaskArgs` interface in `src/tasks/shared/TaskOptions.ts`

- MUST include `diamondName: string` (required)
- MUST include `output?: string` (optional)
- MUST include `verbose?: boolean` (optional flag)
- MUST include `network?: string` (optional)
- MUST have JSDoc comment on interface
- MUST have JSDoc comment on each property

**FR-1.2** Create `DiamondFlattenOptions` interface

- MUST include `diamondName: string`
- MUST include `outputPath: string`
- MUST include `networkName: string`
- MUST include `hre: HardhatRuntimeEnvironment`
- MUST include `verbose: boolean`

**FR-1.3** Create `DiamondFlattenResult` interface

- MUST include `flattenedSource: string`
- MUST include `outputPath: string`
- MUST include `selectorMapping: SelectorInfo[]`
- MUST include `stats: FlattenStats`

**FR-1.4** Create `SelectorInfo` interface

- MUST include `selector: string` (0x prefixed 4-byte hex)
- MUST include `facetName: string`
- MUST include `functionName: string`
- MUST include `signature: string` (full function signature)

**FR-1.5** Create `FlattenStats` interface

- MUST include `totalContracts: number`
- MUST include `totalFacets: number`
- MUST include `totalLines: number`
- MUST include `deduplicatedContracts: number`

**FR-1.6** Create `DiscoveredFacet` interface

- MUST include `name: string`
- MUST include `contractPath: string`
- MUST include `selectors: string[]`
- MUST include `isInit: boolean`

**FR-1.7** Create `DiamondContractInfo` interface

- MUST include `name: string`
- MUST include `sourcePath: string`
- MUST include `found: boolean`

**FR-1.8** All interfaces MUST be exported from `src/tasks/index.ts`

### FR-2: Hardhat Task Registration (Feature E1-F2)

**FR-2.1** Create task file at `src/tasks/diamond-flatten.ts`

- MUST use Hardhat's `task()` function
- MUST set task name to `"diamond:flatten"`
- MUST set description to `"Flatten Diamond contract with all facets into single file"`

**FR-2.2** Register required parameter `diamondName`

- MUST use `.addParam("diamondName", ...)`
- MUST set as required parameter
- MUST include description: "Name of the diamond to flatten"
- MUST NOT have default value

**FR-2.3** Register optional parameter `output`

- MUST use `.addOptionalParam("output", ...)`
- MUST include description: "Output file path (defaults to stdout)"
- MAY set default to `undefined` (stdout)

**FR-2.4** Register optional flag `verbose`

- MUST use `.addFlag("verbose", ...)`
- MUST include description: "Enable verbose logging"
- MUST default to `false`

**FR-2.5** Register optional parameter `network`

- MUST use `.addOptionalParam("network", ...)`
- MUST include description: "Target network for configuration"
- MAY default to current network

**FR-2.6** Task handler MUST be async

- MUST accept `(taskArgs, hre)` parameters
- MUST call validation before execution
- MUST handle errors gracefully

### FR-3: Task Export Registration (Feature E1-F3)

**FR-3.1** Import task in `src/tasks/index.ts`

- MUST add `import "./diamond-flatten";` at top of file

**FR-3.2** Add to `HARDHAT_DIAMONDS_TASKS` constant

- MUST add entry for `DIAMOND_FLATTEN`
- MUST include `name: "diamond:flatten"`
- MUST include `description` matching task definition
- MUST list all parameters with types

**FR-3.3** Export all flatten types

- MUST export `DiamondFlattenTaskArgs`
- MUST export `DiamondFlattenOptions`
- MUST export `DiamondFlattenResult`
- MUST export `SelectorInfo`
- MUST export `FlattenStats`
- MUST export `DiscoveredFacet`
- MUST export `DiamondContractInfo`

### FR-4: Argument Validation (Feature E1-F4)

**FR-4.1** Create validation method in `src/tasks/shared/TaskValidation.ts`

- MUST add method `validateDiamondFlattenArgs(args: DiamondFlattenTaskArgs): ValidationResult`
- MUST return `ValidationResult` with `{ isValid, errors, warnings }`

**FR-4.2** Validate diamond name

- MUST reject if empty string
- MUST reject if contains invalid characters (regex: `/^[a-zA-Z0-9_-]+$/`)
- MUST reject if diamond does not exist in project
- Error message MUST suggest available diamond names

**FR-4.3** Validate output path (if provided)

- MUST reject if empty string when provided
- MUST warn if file extension is not `.sol`
- MUST validate parent directory exists (or can be created)
- MUST reject if path is directory (must be file)

**FR-4.4** Validate network (if provided)

- MUST reject if network not in hardhat config
- Error message MUST list available networks

**FR-4.5** Error message quality

- All errors MUST include field name
- All errors MUST include current invalid value
- All errors MUST include suggestion for fix
- Format: `"Invalid {field}: '{value}'. {suggestion}"`

---

## 5. Non-Goals (Out of Scope for Epic 1)

The following are **NOT** included in Epic 1:

1. **Actual Flattening Logic**: No source code parsing or flattening implementation
2. **Facet Discovery**: No logic to discover or load facets from configuration
3. **Output Generation**: No file writing or stdout formatting
4. **Selector Mapping**: No function selector extraction or mapping
5. **Integration Tests**: Only unit tests; no end-to-end task execution tests
6. **CLI Demo/Examples**: No example usage documentation

These will be addressed in subsequent epics (E2-E6).

---

## 6. Design Considerations

### File Structure

```
packages/hardhat-diamonds/
├── src/
│   ├── tasks/
│   │   ├── diamond-flatten.ts          # NEW: Task definition
│   │   ├── index.ts                    # MODIFY: Add exports
│   │   └── shared/
│   │       ├── TaskOptions.ts          # MODIFY: Add interfaces
│   │       └── TaskValidation.ts       # MODIFY: Add validation
│   └── lib/
│       └── index.ts                    # MODIFY: Export validation
└── test/
    └── tasks/
        └── diamond-flatten.test.ts      # NEW: Unit tests
```

### Pattern Reference: Existing Tasks

**Study these existing tasks for patterns:**

1. **`diamond:generate-abi-typechain`** (`src/tasks/generate-abi.ts`)
   - Parameter structure
   - Validation patterns
   - Error handling
   - HRE usage

2. **`diamond:deploy`** (`src/tasks/deploy.ts`)
   - Network handling
   - Configuration loading
   - Verbose logging

3. **`diamond:verify`** (`src/tasks/verify.ts`)
   - Optional parameters
   - Path validation
   - User feedback

### Code Style

- **TypeScript Strict Mode**: All code MUST compile with `strict: true`
- **ESLint Compliance**: Follow existing `.eslintrc.js` rules
- **Naming Conventions**:
  - Interfaces: PascalCase (e.g., `DiamondFlattenOptions`)
  - Functions: camelCase (e.g., `validateDiamondFlattenArgs`)
  - Constants: SCREAMING_SNAKE_CASE (e.g., `DIAMOND_FLATTEN`)
- **JSDoc**: Required on all public interfaces and methods

---

## 7. Technical Considerations

### Implementation Location

**Repository:** `packages/hardhat-diamonds/` (git submodule in diamonds-dev-env)

**Branch Strategy:**

1. Create feature branch from `develop`: `feature/diamond-flatten-epic1`
2. Implement all features in sequence (F1 → F2 → F3 → F4)
3. Commit after each feature with conventional commits:
   - `feat: add TypeScript interfaces for diamond:flatten`
   - `feat: register diamond:flatten Hardhat task`
   - `feat: add task exports for diamond:flatten`
   - `feat: implement argument validation for diamond:flatten`
4. Open PR to `develop` after all features complete

### Dependencies

**Required Imports:**

```typescript
// From Hardhat
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { task } from "hardhat/config";

// From hardhat-diamonds
import { TaskValidation } from "./shared/TaskValidation";
import { DiamondFlattenTaskArgs } from "./shared/TaskOptions";
```

**No New External Dependencies:** All functionality uses existing hardhat-diamonds and Hardhat core APIs.

### Testing Strategy

**Test File:** `test/tasks/diamond-flatten.test.ts`

**Test Framework:** Mocha + Chai (existing project standard)

**Test Coverage Requirements:**

- Unit tests for each validation rule (100% branch coverage)
- Integration test for task registration (verify task appears in CLI)
- Error message format tests
- TypeScript compilation tests

**Test Structure Pattern:**

```typescript
describe("DiamondFlattenTaskArgs Validation", () => {
  describe("validateDiamondFlattenArgs", () => {
    describe("diamond name validation", () => {
      it("should reject empty diamond name", () => { ... });
      it("should reject invalid characters in diamond name", () => { ... });
      it("should suggest available diamonds when invalid", () => { ... });
    });
    // ... more test suites
  });
});
```

### Known Technical Constraints

1. **Hardhat Task System**: Tasks execute in Hardhat's runtime environment, limiting access to certain Node.js APIs
2. **TypeScript Modules**: Must use CommonJS for Hardhat compatibility (see BUILD_AND_DEPLOYMENT.md)
3. **Circular Dependencies**: Avoid importing from `hardhat.config.ts` in task files
4. **HRE Access**: Must receive `HardhatRuntimeEnvironment` via task parameters, not direct imports

---

## 8. Success Metrics

### Quantitative Metrics

| Metric                 | Target                     | Measurement             |
| ---------------------- | -------------------------- | ----------------------- |
| TypeScript Compilation | 0 errors                   | `npm run build`         |
| Test Coverage          | ≥ 95%                      | `npm run test:coverage` |
| ESLint Violations      | 0                          | `npm run lint`          |
| CLI Help Display       | 100% params shown          | Manual verification     |
| Validation Error Rate  | 100% invalid inputs caught | Unit tests              |

### Qualitative Metrics

| Metric                     | Target                          | Measurement  |
| -------------------------- | ------------------------------- | ------------ |
| Code Readability           | Junior dev can understand       | Peer review  |
| Error Message Quality      | Actionable suggestions provided | User testing |
| Pattern Consistency        | Matches existing tasks          | Code review  |
| Documentation Completeness | All public APIs documented      | Doc review   |

### Verification Checklist

Before marking Epic 1 complete, verify:

- [ ] All 7 interfaces defined in TaskOptions.ts
- [ ] Task visible in `npx hardhat --help`
- [ ] Task help shows all 4 parameters
- [ ] All types exported from tasks/index.ts
- [ ] Validation rejects all invalid inputs
- [ ] All error messages include suggestions
- [ ] Unit tests achieve ≥95% coverage
- [ ] No TypeScript compilation errors
- [ ] No ESLint violations
- [ ] Code review approved
- [ ] All commits follow conventional commit format
- [ ] PR opens successfully against `develop` branch

---

## 9. Open Questions

### Q1: Diamond Discovery Strategy

**Question:** How should we discover available diamond names for validation error suggestions?  
**Options:**
A. Parse `hardhat.config.ts` for `config.diamonds.paths`  
 B. Scan `diamonds/` directory for subdirectories  
 C. Both A and B with fallback logic  
**Recommendation:** Option C - Try config first, fall back to directory scan  
**Decision Required By:** Before implementing FR-4.2

### Q2: Output Path Validation Depth

**Question:** How strict should output path validation be?  
**Options:**
A. Only validate extension (`.sol`)  
 B. Also validate parent directory exists  
 C. Also validate write permissions  
 D. Full path validation + automatic directory creation  
**Recommendation:** Option D for best UX  
**Decision Required By:** Before implementing FR-4.3

### Q3: Verbose Logging Integration

**Question:** Should verbose flag use existing logger or create new one?  
**Options:**
A. Use Hardhat's built-in `console.log`  
 B. Create custom logger in utils  
 C. Integrate with existing DiamondLogger if available  
**Recommendation:** Option C with fallback to A  
**Decision Required By:** Before implementing FR-2.4

### Q4: Task Execution Flow (for Epic 2+)

**Question:** Should the task handler directly call flattening logic or delegate to a service class?  
**Options:**
A. Task handler contains all logic (simple, monolithic)  
 B. Task handler delegates to `DiamondFlattener` class (clean separation)  
 C. Task handler delegates to multiple service classes (high modularity)  
**Recommendation:** Option B - aligns with existing patterns  
**Decision Required By:** Before starting Epic 2

---

## 10. Implementation Guidance

### Getting Started

**Step 1: Set up development environment**

```bash
cd /home/jamatulli/decentralization/diamonds/diamonds-dev-env
cd packages/hardhat-diamonds
git checkout develop
git pull origin develop
git checkout -b feature/diamond-flatten-epic1
```

**Step 2: Review existing patterns**

```bash
# Study these files for reference:
cat src/tasks/generate-abi.ts
cat src/tasks/shared/TaskOptions.ts
cat src/tasks/shared/TaskValidation.ts
```

**Step 3: Implement features in sequence**

1. E1-F1: TypeScript interfaces (start here)
2. E1-F2: Task registration
3. E1-F3: Task exports
4. E1-F4: Argument validation

**Step 4: Write tests as you go**

- Write unit test before implementing validation logic (TDD)
- Run tests after each feature: `npm test`
- Check coverage: `npm run test:coverage`

### Development Workflow

**For each feature:**

1. Create interfaces/types (if needed)
2. Implement core logic
3. Write unit tests
4. Run tests: `npm test`
5. Fix any issues
6. Commit with conventional format
7. Move to next feature

**Commit message examples:**

```bash
git commit -m "feat: add TypeScript interfaces for diamond:flatten" \
  -m "- Add DiamondFlattenTaskArgs interface" \
  -m "- Add DiamondFlattenOptions interface" \
  -m "- Add DiamondFlattenResult interface" \
  -m "- Add SelectorInfo interface" \
  -m "- Add FlattenStats interface" \
  -m "- Add DiscoveredFacet interface" \
  -m "- Add DiamondContractInfo interface" \
  -m "" \
  -m "All interfaces include JSDoc documentation." \
  -m "Related to Epic 1, Feature E1-F1"
```

### Testing Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --grep "DiamondFlattenTaskArgs"

# Check coverage
npm run test:coverage

# Lint code
npm run lint

# Build TypeScript
npm run build

# Verify task registration (after F2 complete)
npx hardhat --help | grep "diamond:flatten"
npx hardhat diamond:flatten --help
```

### Debugging Tips

**If TypeScript compilation fails:**

- Check `tsconfig.json` for strict mode settings
- Verify no circular imports
- Ensure all imports use correct paths

**If task doesn't appear in CLI:**

- Verify `import "./diamond-flatten"` in `src/tasks/index.ts`
- Check task name matches exactly: `"diamond:flatten"`
- Rebuild: `npm run build`

**If validation tests fail:**

- Review `ValidationResult` interface structure
- Ensure errors array contains `ValidationError` objects
- Check error message format matches pattern

---

## 11. Next Steps

### After Epic 1 Completion

1. **PR Review**: Submit PR to `develop` branch in hardhat-diamonds
2. **Epic 2 Planning**: Begin implementing facet discovery and configuration loading
3. **Integration Testing**: Verify task integrates with real Diamond projects
4. **Documentation**: Update README with task usage examples (deferred to Epic 6)

### Dependencies for Epic 2

Epic 2 (Diamond Configuration & Facet Discovery) will build on Epic 1's foundation:

- Uses `DiamondFlattenOptions` for configuration
- Populates `DiscoveredFacet[]` array
- Returns `DiamondContractInfo` from discovery

---

## Appendix A: Related Documentation

- [Diamond Flatten Project Plan](./diamond-flatten-project-plan.md) - Complete project overview
- [Epic 1 Specification](./Milestone_1-flattener/epic1.md) - Detailed epic breakdown
- [BUILD_AND_DEPLOYMENT.md](../../docs/BUILD_AND_DEPLOYMENT.md) - TypeScript module strategy
- [Hardhat Task API](https://hardhat.org/hardhat-runner/docs/advanced/creating-a-task) - Official Hardhat documentation

## Appendix B: Glossary

- **Diamond**: ERC-2535 Diamond Proxy pattern smart contract
- **Facet**: Individual contract implementing a subset of Diamond functions
- **Flatten**: Combine multiple Solidity files into a single file
- **Selector**: 4-byte function signature hash used in Diamond routing
- **HRE**: HardhatRuntimeEnvironment - Hardhat's runtime context
- **TDD**: Test-Driven Development - write tests before implementation

---

**Document Status:** ✅ Ready for Implementation  
**Last Updated:** January 30, 2026  
**Next Review:** After Epic 1 completion
