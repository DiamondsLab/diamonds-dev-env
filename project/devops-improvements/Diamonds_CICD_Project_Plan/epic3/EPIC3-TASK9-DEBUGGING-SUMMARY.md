# Epic 3 Task 9.0: CI Workflow Debugging Summary

## Objective
Test the compilation job with successful build in GitHub Actions CI workflow.

## Issues Encountered and Resolved

### 1. Container Image Casing Issue
**Error**: `invalid reference format: repository name (diamondsLab/diamonds-dev-env) must be lowercase`
**Commit**: 75aa29a
**Fix**: Changed all instances from `ghcr.io/diamondsLab/` to `ghcr.io/diamondslab/` (5 occurrences)
**Status**: ✅ RESOLVED

### 2. GHCR Authentication
**Error**: `Error response from daemon: denied`
**Commit**: 9ad121c
**Fix**: Added credentials block to all container jobs:
```yaml
credentials:
  username: ${{ github.actor }}
  password: ${{ secrets.GITHUB_TOKEN }}
```
**Status**: ✅ RESOLVED

### 3. Container Image Tag Mismatch
**Error**: `Error response from daemon: manifest unknown`
**Root Cause**: DevContainer build workflow only creates `:latest` tag on default branch, not feature branches
**Commit**: 930f757
**Fix**: Changed container image tag from `:latest` to `:feature-epic2-container-setup`
**Note**: Will need to update back to `:latest` after merge to main/develop
**Status**: ✅ RESOLVED

### 4. Invalid Volume Mount Paths
**Error**: `"~/.cache/yarn" includes invalid characters for a local volume name`
**Root Cause**: Docker in GitHub Actions doesn't support tilde expansion in volume paths
**Commit**: 97b35c6
**Fix**: Removed all `volumes` blocks from container configurations
**Rationale**: Cache is already handled by `actions/cache@v3` action
**Status**: ✅ RESOLVED

### 5. Permission Denied in Container
**Error**: `EACCES: permission denied, open '/__w/_temp/_runner_file_commands/...'`
**Root Cause**: DevContainer runs as `node` user, but GitHub Actions needs root access to write temp files
**Commit**: 722f892
**Fix**: Added `options: --user root` to all container jobs
**Status**: ✅ RESOLVED

### 6. Workspace Packages Not Built
**Error**: `Cannot find module '.../diamonds-hardhat-foundry/dist/index.js'`
**Root Cause**: TypeScript workspace packages must be compiled before contract compilation
**Commit**: 380bcbf
**Fix**: Added `yarn workspace:build` step before `yarn compile`
**Status**: ✅ RESOLVED

## Workflow Configuration Updates

### Before (Original Epic 1 Configuration)
```yaml
compile:
  name: Compile Contracts
  runs-on: ubuntu-latest
  container:
    image: ghcr.io/diamondsLab/diamonds-dev-env:latest  # Incorrect casing
    volumes:
      - ~/.cache/yarn:/root/.cache/yarn  # Invalid path
  timeout-minutes: 15
  steps:
    - name: Checkout code
      uses: actions/checkout@v4
    - name: Install dependencies
      run: yarn install --immutable
    - name: Compile contracts
      run: npx hardhat compile  # Missing workspace build step
```

### After (Epic 3 Configuration with Fixes)
```yaml
compile:
  name: Compile Contracts & Generate Types
  runs-on: ubuntu-latest
  container:
    image: ghcr.io/diamondslab/diamonds-dev-env:feature-epic2-container-setup
    credentials:
      username: ${{ github.actor }}
      password: ${{ secrets.GITHUB_TOKEN }}
    options: --user root
  timeout-minutes: 10  # Epic 3 requirement
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
    ETHERSCAN_API_KEY: ${{ secrets.ETHERSCAN_API_KEY }}
    MAINNET_RPC_URL: ${{ secrets.MAINNET_RPC_URL }}
    SEPOLIA_RPC_URL: ${{ secrets.SEPOLIA_RPC_URL }}
  steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        submodules: recursive
        fetch-depth: 0
    - name: Cache dependencies
      uses: actions/cache@v3
      with:
        path: |
          ~/.cache/yarn
          node_modules
          **/node_modules
        key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}
        restore-keys: |
          ${{ runner.os }}-yarn-
    - name: Install dependencies
      run: yarn install --frozen-lockfile
    - name: Build workspace packages
      run: yarn workspace:build
    - name: Compile contracts
      run: yarn compile
    - name: Generate Diamond ABIs
      run: yarn diamond:generate-abi-typechain
    - name: Upload compilation artifacts
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: compilation-artifacts
        path: |
          artifacts/
          typechain-types/
          diamond-abi/
          diamond-typechain-types/
        retention-days: 7
```

## Permissions Added
```yaml
permissions:
  contents: read
  pull-requests: read
  packages: read  # Required for GHCR access
```

## Key Learnings

1. **Docker Registry Names**: GHCR requires all-lowercase repository names
2. **GitHub Actions Containers**: Need explicit authentication even with org packages
3. **Volume Mounts**: Must use absolute paths, tilde expansion not supported
4. **Container Users**: GitHub Actions requires root access for temp directory writes
5. **Monorepo Builds**: Workspace packages must be built before they can be imported
6. **Branch-Specific Tags**: DevContainer workflow creates feature-branch tags, not latest

## Commits in This Session
- 75aa29a: Fix GHCR image casing
- 9ad121c: Add GHCR credentials to all container jobs
- 930f757: Use branch-specific container tag  
- 97b35c6: Remove invalid volume mounts from container jobs
- 722f892: Run containers as root user for GitHub Actions compatibility
- 380bcbf: Add workspace packages build step before compilation

## Next Steps
1. Verify latest workflow run (21726547032) completes successfully
2. If successful, mark Task 9.0 complete
3. Proceed with Task 9.1-9.8 (verification tasks)
4. Update container tag to `:latest` in workflow after PR merge to main/develop

## Workflow Runs
- Initial failure: 21724509275
- After casing fix: 21725017178 (denied error)
- After credentials: 21725668400 (manifest unknown)
- After tag fix: 21725800096 (volume error)
- After volume removal: 21726070351 (permission denied)
- After user root: 21726339692 (module not found)
- After workspace build: 21726547032 (checking...)

## Status: IN PROGRESS
Awaiting confirmation of workflow run 21726547032 success.
