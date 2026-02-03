# Task List: Epic 5 - Task Integration & Error Handling

**Based on:** PRD Epic 5 - Task Integration & Error Handling  
**Epic ID:** E5  
**Target:** @diamondslab/hardhat-diamonds package  
**Working Directory:** `/packages/hardhat-diamonds`

---

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

---

## Tasks

- [x] 0.0 Create feature branch for Epic 5
  - [x] 0.1 Ensure current branch is `feature/diamond-discovery-epic2` (Epic 2 work)
  - [x] 0.2 Create and checkout new branch: `git checkout -b feature/epic5-task-integration`

- [x] 1.0 Create Error Handling Infrastructure
  - [x] 1.1 Create `packages/hardhat-diamonds/src/lib/errors.ts` file
  - [x] 1.2 Implement `FlattenError` class with properties: `code`, `suggestion`, `context`
  - [x] 1.3 Define `FlattenErrorCode` constant object with all 6 error codes (per FR-E5-3.2)
  - [x] 1.4 Add JSDoc documentation for `FlattenError` class
  - [x] 1.5 Add JSDoc documentation for each error code constant
  - [x] 1.6 Export `FlattenError` and `FlattenErrorCode` from errors.ts

- [x] 2.0 Implement Programmatic API
  - [x] 2.1 Open `packages/hardhat-diamonds/src/lib/DiamondFlattener.ts`
  - [x] 2.2 Add `flattenDiamond()` function with signature from FR-E5-2.1
  - [x] 2.3 Implement parameter handling with defaults (networkName, chainId, paths, verbose)
  - [x] 2.4 Create DiamondFlattener instance inside function
  - [x] 2.5 Call `flattener.flatten()` and return result
  - [x] 2.6 Add comprehensive JSDoc with @param, @returns, and @example
  - [x] 2.7 Include usage example in JSDoc showing import and basic call
  - [x] 2.8 Verify function throws `FlattenError` instances (not generic errors)

- [x] 3.0 Complete Task Action Handler
  - [x] 3.1 Open `packages/hardhat-diamonds/src/tasks/diamond-flatten.ts`
  - [x] 3.2 Import required modules: chalk, fs (mkdirSync, writeFileSync), path (resolve, dirname)
  - [x] 3.3 Import `FlattenError` from '../lib/errors'
  - [x] 3.4 Import `TaskHelpers` and `TaskValidation` from './shared'
  - [x] 3.5 Implement argument validation step (FR-E5-1.1) with verbose logging
  - [x] 3.6 Display validation warnings in yellow (FR-E5-1.2)
  - [x] 3.7 Create DiamondFlattener instance with options from args + HRE (FR-E5-1.3)
  - [x] 3.8 Execute `flattener.flatten()` with verbose progress message (FR-E5-1.4)
  - [x] 3.9 Implement stdout output when --output not specified (FR-E5-1.5)
  - [x] 3.10 Implement file output with directory creation (FR-E5-1.6)
  - [x] 3.11 Display output path in green when file written (FR-E5-1.6)
  - [x] 3.12 Implement summary display logic (verbose OR file output) (FR-E5-1.7)
  - [x] 3.13 Format summary statistics with all 6 metrics (FR-E5-1.8)
  - [x] 3.14 Display warnings in yellow if any exist (FR-E5-1.9)
  - [x] 3.15 Implement try/catch block with error handling (FR-E5-1.10)
  - [x] 3.16 Show stack trace only in verbose mode
  - [x] 3.17 Call `process.exit(1)` on error
  - [x] 3.18 Track execution time (Date.now() before/after)

- [x] 4.0 Update Module Exports
  - [x] 4.1 Open `packages/hardhat-diamonds/src/lib/index.ts`
  - [x] 4.2 Add export: `export { DiamondFlattener, flattenDiamond } from './DiamondFlattener';`
  - [x] 4.3 Add export: `export { SourceResolver } from './SourceResolver';`
  - [x] 4.4 Add export: `export { DependencyGraph } from './DependencyGraph';`
  - [x] 4.5 Add export: `export { OutputFormatter } from './OutputFormatter';`
  - [x] 4.6 Add export: `export { FlattenError, FlattenErrorCode } from './errors';`
  - [x] 4.7 Open `packages/hardhat-diamonds/src/tasks/index.ts`
  - [x] 4.8 Add export: `export { flattenDiamond, DiamondFlattener } from '../lib/DiamondFlattener';`
  - [x] 4.9 Add export: `export { FlattenError, FlattenErrorCode } from '../lib/errors';`

- [ ] 5.0 Implement Unit Tests
  - [ ] 5.1 Create `packages/hardhat-diamonds/test/lib/errors.test.ts`
  - [ ] 5.2 Test FlattenError class instantiation with all properties
  - [ ] 5.3 Test FlattenError extends Error properly
  - [ ] 5.4 Test all FlattenErrorCode constants are defined
  - [ ] 5.5 Create `packages/hardhat-diamonds/test/lib/flattenDiamond.test.ts`
  - [ ] 5.6 Test flattenDiamond() with minimal options (only diamondName)
  - [ ] 5.7 Test flattenDiamond() with all optional parameters specified
  - [ ] 5.8 Test flattenDiamond() throws FlattenError for invalid diamond
  - [ ] 5.9 Test flattenDiamond() returns DiamondFlattenResult structure
  - [ ] 5.10 Test default values are applied correctly (networkName, chainId, etc.)
  - [ ] 5.11 Create `packages/hardhat-diamonds/test/tasks/diamond-flatten-handler.test.ts`
  - [ ] 5.12 Test task handler validates arguments before execution
  - [ ] 5.13 Test task handler displays validation warnings
  - [ ] 5.14 Test task handler outputs to stdout when --output not specified
  - [ ] 5.15 Test task handler writes to file when --output specified
  - [ ] 5.16 Test task handler creates parent directories for output
  - [ ] 5.17 Test task handler shows summary in verbose mode
  - [ ] 5.18 Test task handler shows summary when writing to file
  - [ ] 5.19 Test task handler displays warnings array
  - [ ] 5.20 Test task handler exits with code 1 on error (mock process.exit)
  - [ ] 5.21 Test task handler shows stack trace only in verbose mode
  - [ ] 5.22 Run test coverage: `yarn test --coverage`
  - [ ] 5.23 Verify coverage is ≥ 90% for Epic 5 files

- [ ] 6.0 Implement Integration Tests
  - [ ] 6.1 Create `packages/hardhat-diamonds/test/integration/flatten-e2e.test.ts`
  - [ ] 6.2 Implement E5-AT1: Task outputs to stdout
  - [ ] 6.3 Verify E5-AT1: result.flattenedSource includes "pragma solidity"
  - [ ] 6.4 Implement E5-AT2: Task outputs to file
  - [ ] 6.5 Verify E5-AT2: output file exists and contains valid content
  - [ ] 6.6 Implement E5-AT3: Programmatic API works
  - [ ] 6.7 Verify E5-AT3: returns structured result with stats
  - [ ] 6.8 Implement E5-AT4: Errors include suggestions
  - [ ] 6.9 Verify E5-AT4: error is FlattenError with suggestion property
  - [ ] 6.10 Test end-to-end workflow: validate → flatten → output → summary
  - [ ] 6.11 Test programmatic API without Hardhat task system
  - [ ] 6.12 Test error propagation through full stack
  - [ ] 6.13 Run all integration tests: `yarn test test/integration/`

- [ ] 7.0 Update Documentation
  - [ ] 7.1 Create `packages/hardhat-diamonds/docs/flatten-api.md`
  - [ ] 7.2 Document `flattenDiamond()` function signature and usage
  - [ ] 7.3 Add CLI usage examples for all task arguments
  - [ ] 7.4 Add programmatic API examples (script, CI/CD, plugin)
  - [ ] 7.5 Document all error codes with trigger conditions and suggestions
  - [ ] 7.6 Document warning types and default behaviors
  - [ ] 7.7 Add troubleshooting section for common issues
  - [ ] 7.8 Update main README.md with flatten task section
  - [ ] 7.9 Add links to Appendices from PRD (error/warning tables)
  - [ ] 7.10 Review JSDoc comments for completeness
  - [ ] 7.11 Verify all example code in docs is tested and working

---

## Relevant Files

### Files to Create

- `packages/hardhat-diamonds/src/lib/errors.ts` - FlattenError class and error codes
- `packages/hardhat-diamonds/test/lib/errors.test.ts` - Unit tests for error handling
- `packages/hardhat-diamonds/test/lib/flattenDiamond.test.ts` - Unit tests for programmatic API
- `packages/hardhat-diamonds/test/tasks/diamond-flatten-handler.test.ts` - Unit tests for task handler
- `packages/hardhat-diamonds/test/integration/flatten-e2e.test.ts` - End-to-end integration tests
- `packages/hardhat-diamonds/docs/flatten-api.md` - API documentation for flatten feature

### Files to Modify

- `packages/hardhat-diamonds/src/lib/DiamondFlattener.ts` - Add flattenDiamond() export function
- `packages/hardhat-diamonds/src/tasks/diamond-flatten.ts` - Complete task action handler implementation
- `packages/hardhat-diamonds/src/lib/index.ts` - Add exports for new modules
- `packages/hardhat-diamonds/src/tasks/index.ts` - Add exports for programmatic API
- `packages/hardhat-diamonds/README.md` - Add flatten task documentation section

### Supporting Files (from previous Epics)

- `packages/hardhat-diamonds/src/tasks/shared/TaskOptions.ts` - Contains DiamondFlattenTaskArgs interface (Epic 1)
- `packages/hardhat-diamonds/src/tasks/shared/TaskValidation.ts` - Contains validateDiamondFlattenArgs() (Epic 1)
- `packages/hardhat-diamonds/src/lib/SourceResolver.ts` - Used by DiamondFlattener (Epic 3)
- `packages/hardhat-diamonds/src/lib/DependencyGraph.ts` - Used by DiamondFlattener (Epic 3)
- `packages/hardhat-diamonds/src/lib/OutputFormatter.ts` - Used by DiamondFlattener (Epic 4)

### Notes

- All test files should be placed in the `test/` directory matching the structure of `src/`
- Use `yarn test` to run all tests, or `yarn test <path>` for specific test files
- Coverage target is ≥ 90% for all Epic 5 code
- Task handler should use `chalk` for colored output (already a dependency)
- Error handling should use the new `FlattenError` class for all flatten-related errors
- Programmatic API should work independently of the Hardhat task system

---

**Status:** Phase 1 Complete - Parent tasks generated  
**Next Step:** User confirmation to generate sub-tasks
