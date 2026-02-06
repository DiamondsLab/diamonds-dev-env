# BLOCKER: Epic 3 Task 9.0 - Workspace Package TypeScript Errors

## Status: 🔴 CRITICAL BLOCKER

**Date**: February 5, 2026  
**Task**: Epic 3, Task 9.0 - Test compilation job with successful build  
**Workflow Run**: [21726547032](https://github.com/DiamondsLab/diamonds-dev-env/actions/runs/21726547032)  
**Branch**: feature/epic2-container-setup  
**Impact**: Contract compilation job cannot complete - blocks Epic 3 progress

---

## Problem Summary

The GitHub Actions CI workflow fails during the "Build workspace packages" step (`yarn workspace:build`) due to TypeScript compilation errors in the following workspace packages:

1. **@diamondslab/diamonds** - Core Diamond library
2. **@diamondslab/hardhat-diamonds** - Hardhat plugin for Diamond ABIs
3. **@diamondslab/diamonds-monitor** - Diamond monitoring utilities

These packages are imported by `hardhat.config.ts` and are **required** for contract compilation to work.

---

## Error Details

### Primary Error Pattern
```
Cannot find module '@diamondslab/diamonds' or its corresponding type declarations
```

This appears in:
- `packages/diamonds-monitor/src/core/DiamondMonitor.ts`
- `packages/diamonds-monitor/src/core/FacetManager.ts`
- `packages/hardhat-diamonds/scripts/deploy/rpc/status-rpc.ts`
- Multiple other files in hardhat-diamonds package

### Secondary Errors

**Type Errors:**
```typescript
error TS2353: Object literal may only specify known properties, and 'diamondName' does not exist in type 'RPCDiamondDeployerConfig'
error TS2339: Property 'configFilePath' does not exist on type 'RPCDiamondDeployerConfig'
error TS2339: Property 'deploymentsPath' does not exist on type 'RPCDiamondDeployerConfig'
```

**Module Resolution Errors:**
```typescript
error TS2835: Relative import paths need explicit file extensions in ECMAScript imports when '--moduleResolution' is 'node16' or 'nodenext'. Did you mean './deploy-rpc-core.js'?
```

---

## Root Cause Analysis

### Circular Dependency Issue
The workspace packages have circular dependencies:
- `diamonds-monitor` depends on `@diamondslab/diamonds`
- `hardhat-diamonds` depends on `@diamondslab/diamonds`
- But these packages are built in the wrong order or have unresolved peer dependencies

### API Mismatches
Configuration interfaces in `hardhat-diamonds` are missing properties that are being used in the codebase:
- `diamondName` property missing from various config types
- `configFilePath` property missing
- `deploymentsPath` property missing

### Module Resolution Issues
TypeScript is configured with `"moduleResolution": "node16"` which requires explicit `.js` extensions for ESM imports, but the code uses `.ts` extension-less imports.

---

## Impact on Epic 3

### What Works ✅
1. Container authentication and image pull
2. Dependency installation (yarn install)
3. Checkout and caching steps
4. All container configuration issues resolved

### What's Blocked ❌
5. Workspace package build (`yarn workspace:build`) - **FAILS HERE**
6. Contract compilation (`yarn compile`)
7. Diamond ABI generation (`yarn diamond:generate-abi-typechain`)
8. Artifact upload
9. All Task 9.5-9.8 validation steps

---

## Attempted Fixes

### Session 1: Container Setup (6 commits)
1. ✅ Fixed GHCR image casing (commit 75aa29a)
2. ✅ Added container credentials (commit 9ad121c)  
3. ✅ Updated to branch-specific tag (commit 930f757)
4. ✅ Removed invalid volume mounts (commit 97b35c6)
5. ✅ Added --user root permission (commit 722f892)
6. ✅ Added workspace build step (commit 380bcbf) - **Revealed current blocker**

All container-related issues are now resolved. The current issue is **code quality** in the workspace packages, not CI configuration.

---

## Resolution Options

### Option 1: Fix All TypeScript Errors (Recommended)
**Effort**: Medium-High (4-8 hours)  
**Risk**: Low  
**Benefits**: 
- Proper long-term solution
- Improves overall code quality
- Makes workspace packages production-ready

**Tasks**:
1. Fix circular dependency between packages
2. Update interface definitions to include missing properties
3. Fix module resolution paths (add `.js` extensions or adjust tsconfig)
4. Verify all workspace packages compile cleanly
5. Re-run CI workflow

### Option 2: Minimal Dependencies Approach
**Effort**: Low-Medium (2-4 hours)  
**Risk**: Medium  
**Benefits**:
- Unblocks Epic 3 testing quickly
- Identifies truly required vs optional dependencies

**Tasks**:
1. Temporarily remove problematic imports from hardhat.config.ts:
   ```typescript
   // import '@diamondslab/diamonds-hardhat-foundry';
   // import '@diamondslab/diamonds-monitor';
   import '@diamondslab/hardhat-diamonds'; // Keep only if needed for Diamond ABI
   ```
2. Test if basic compilation works without these plugins
3. If Diamond ABI generation requires hardhat-diamonds:
   - Fix only the hardhat-diamonds package TypeScript errors
   - Skip the other two packages
4. Document which imports are optional vs required

### Option 3: Build Order Fix
**Effort**: Low (1-2 hours)  
**Risk**: High (may not fully resolve issue)  
**Benefits**:
- Quick potential fix if issue is just build order

**Tasks**:
1. Modify `yarn workspace:build` to build `@diamondslab/diamonds` first
2. Then build dependent packages
3. Use `yarn workspaces foreach -pt --topological run build`

---

## Recommendation

**Proceed with Option 1 (Fix All TypeScript Errors)**

**Rationale**:
- These workspace packages are core infrastructure
- TypeScript errors indicate API contract violations
- Other epics will likely encounter same issues
- Better to fix properly now than accumulate technical debt
- The errors are not complex - mostly missing interface properties and import paths

**Estimated Time**: 4-6 hours

**Next Steps**:
1. Create a separate branch: `fix/workspace-typescript-errors`
2. Fix errors package by package:
   - Start with `@diamondslab/diamonds` (no dependencies)
   - Then `@diamondslab/hardhat-diamonds`
   - Then `@diamondslab/diamonds-monitor`
   - Finally `@diamondslab/diamonds-hardhat-foundry`
3. Test each package individually: `yarn workspace @diamondslab/diamonds build`
4. Once all pass, test full workspace build
5. Merge fix and resume Epic 3 testing

---

## Alternative: Immediate Unblock (Temporary)

If fixing all errors is not feasible right now, **Option 2** can be used as a temporary workaround:

1. Comment out problematic imports in hardhat.config.ts
2. Test if contract compilation works without them
3. If Diamond ABI generation fails, only fix hardhat-diamonds package
4. Create technical debt ticket to fix all packages properly
5. Resume Epic 3 with limited functionality

**This allows Epic 3 to proceed while deferring workspace package fixes to a future epic.**

---

## Files Requiring Fixes

### @diamondslab/diamonds
- (May need fixes for export/import structure)

### @diamondslab/hardhat-diamonds
- `scripts/deploy/defender/*.ts` - Missing config properties
- `scripts/deploy/rpc/*.ts` - Missing config properties, import paths
- Type definitions need updates

### @diamondslab/diamonds-monitor  
- `src/core/DiamondMonitor.ts` - Missing @diamondslab/diamonds import
- `src/core/FacetManager.ts` - Missing @diamondslab/diamonds import

---

## Communication Plan

**To Team**:
- Document blocker in Epic 3 PR description
- Create separate GitHub issue for workspace package fixes
- Propose resolution option in team channel
- Get buy-in on Option 1 vs Option 2 approach

**To Stakeholders**:
- Epic 3 progress: 7/16 parent tasks complete (44%)
- Current blocker: Pre-existing TypeScript errors in workspace packages
- No issues with Epic 3 design or implementation
- Container setup fully working (Epic 2 success)
- Resolution ETA: 4-6 hours for full fix, 2 hours for temporary workaround

---

## Success Criteria

Blocker will be considered resolved when:
1. ✅ `yarn workspace:build` completes without errors
2. ✅ `yarn compile` completes successfully  
3. ✅ Artifacts are uploaded (4 directories)
4. ✅ CI workflow shows "success" status
5. ✅ Task 9.5-9.8 validation complete

---

**Status**: 🔴 **AWAITING DECISION ON RESOLUTION APPROACH**  
**Owner**: TBD  
**Target Resolution**: Within 1 business day  
**Last Updated**: February 5, 2026
