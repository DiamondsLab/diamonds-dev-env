# Product Requirements Document: Epic 3 - Compilation and Type Generation

## Introduction/Overview

This PRD defines the requirements for implementing a GitHub Actions compilation job that validates Solidity contract code, generates TypeScript types, and produces Diamond-specific ABIs for the Diamonds blockchain development project. The compilation job serves as the foundation for the CI/CD pipeline, ensuring that all contract code is syntactically correct and type-safe before downstream testing and security scanning jobs execute.

**Problem Statement:** Currently, developers may push code with compilation errors or outdated TypeScript types, leading to wasted time in review cycles and failed local builds for other team members. By catching compilation errors early in the CI pipeline, we prevent broken code from progressing through the development workflow.

**Goal:** Create an automated compilation job in GitHub Actions that compiles Solidity contracts, generates TypeChain types, produces Diamond ABIs, and makes compilation outputs available to downstream jobs efficiently.

---

## Goals

1. **Early Error Detection:** Catch Solidity compilation errors before code review begins
2. **Type Safety:** Ensure TypeChain types are always generated and up-to-date with contract code
3. **Diamond Support:** Generate Diamond-specific combined ABIs for ERC-2535 proxy contracts
4. **Performance:** Complete compilation within 2-5 minutes with intelligent caching
5. **Artifact Efficiency:** Share only necessary compilation outputs (artifacts/, typechain-types/, diamond-abi/, diamond-typechain-types/) with downstream jobs
6. **Fail Fast:** Block the pipeline immediately on any compilation error to save CI resources
7. **Cache Optimization:** Leverage GitHub Actions cache for node_modules to minimize dependency installation time

---

## User Stories

### Story 1: Developer Receives Immediate Compilation Feedback

**As a** developer  
**I want** compilation errors to be detected automatically when I create a PR  
**So that** I can fix issues immediately rather than discovering them during code review

**Acceptance Criteria:**

- PR status check shows compilation job results within 5 minutes
- Error messages include file names, line numbers, and error descriptions
- Job fails with clear error output if compilation fails

### Story 2: Reviewer Trusts Type Safety

**As a** code reviewer  
**I want** TypeChain types to be regenerated on every PR  
**So that** I can trust that contract interactions are type-safe and up-to-date

**Acceptance Criteria:**

- TypeChain types generated in `typechain-types/` directory
- Types match current contract ABIs exactly
- Compilation job uploads types as artifacts for test jobs

### Story 3: Diamond Developer Gets Combined ABIs

**As a** Diamond contract developer  
**I want** Diamond-specific ABIs generated automatically  
**So that** I can interact with Diamond proxies using a single combined ABI interface

**Acceptance Criteria:**

- `yarn diamond:generate-abi-typechain` executes during compilation
- Diamond ABIs saved to `diamond-abi/` directory
- Diamond TypeChain types saved to `diamond-typechain-types/` directory
- Both directories uploaded as artifacts

### Story 4: CI Pipeline Runs Efficiently

**As a** DevOps engineer  
**I want** node_modules cached across workflow runs  
**So that** dependency installation doesn't waste time and CI minutes

**Acceptance Criteria:**

- GitHub Actions cache used for Yarn cache and node_modules
- Cache hit reduces dependency installation from 5 minutes to <30 seconds
- Cache invalidates when package.json or yarn.lock changes

---

## Functional Requirements

### FR1: Workflow Job Definition

The compilation job MUST be defined in `.github/workflows/ci.yml` with the following characteristics:

- Job name: `compile`
- Runs on: `ubuntu-latest`
- Container: `ghcr.io/diamondslab/diamonds-dev-env:latest` (from Epic 2)
- Timeout: 10 minutes (allows 2-5 minute target with buffer)

### FR2: Repository Checkout

The job MUST check out the repository code with submodules:

- Use `actions/checkout@v4`
- Enable `submodules: recursive` to fetch all workspace packages
- Fetch full history for accurate commit information

### FR3: Dependency Caching

The job MUST implement GitHub Actions caching for dependencies:

- Cache key based on `yarn.lock` hash
- Cache paths: `~/.cache/yarn`, `node_modules`, `**/node_modules`
- Restore from cache before running `yarn install`
- Update cache after successful dependency installation

### FR4: Dependency Installation

The job MUST install project dependencies:

- Run `yarn install --frozen-lockfile` to ensure lock file integrity
- Fail if lock file is out of sync with package.json
- Skip installation if cache is fully restored and valid

### FR5: Solidity Compilation

The job MUST compile all Solidity contracts:

- Execute `yarn compile` command
- Compile all contracts in `contracts/` directory
- Generate contract ABIs in `artifacts/` directory
- Fail immediately on any compilation error

### FR6: TypeChain Type Generation

The job MUST generate TypeChain TypeScript types:

- TypeChain execution is part of `yarn compile` (Hardhat plugin)
- Generate types in `typechain-types/` directory
- Support ethers-v6 target for type generation
- Fail if type generation produces errors

### FR7: Diamond ABI Generation

The job MUST generate Diamond-specific combined ABIs:

- Execute `yarn diamond:generate-abi-typechain` after standard compilation
- Generate combined ABI for ExampleDiamond in `diamond-abi/ExampleDiamond.json`
- Generate Diamond TypeChain types in `diamond-typechain-types/`
- Include all facet functions in combined ABI

### FR8: Artifact Upload

The job MUST upload compilation outputs as GitHub Actions artifacts:

- Artifact name: `compilation-artifacts`
- Include paths:
  - `artifacts/` (Hardhat compilation outputs)
  - `typechain-types/` (standard TypeChain types)
  - `diamond-abi/` (Diamond combined ABIs)
  - `diamond-typechain-types/` (Diamond TypeChain types)
- Artifact retention: 7 days (configurable)
- Compression: Enabled for faster upload/download

### FR9: Error Handling

The job MUST fail fast on any error:

- Exit immediately on Solidity compilation errors
- Exit immediately on TypeChain generation errors
- Exit immediately on Diamond ABI generation errors
- Exit immediately on missing dependencies
- Provide clear error messages in job logs

### FR10: Performance Monitoring

The job MUST log compilation performance metrics:

- Log start and end timestamps
- Log number of contracts compiled
- Log cache hit/miss status
- Warn if compilation exceeds 2 minutes (target threshold)
- Fail if compilation exceeds 5 minutes (hard limit)

---

## Non-Goals (Out of Scope)

The following are explicitly **NOT** included in this epic:

1. **Contract Verification:** Flattening contracts or preparing for Etherscan verification is a deployment concern, not a compilation concern
2. **Test Execution:** Running tests is covered in Epic 4
3. **Security Scanning:** Contract analysis (Slither, Semgrep) is covered in Epic 5
4. **Deployment:** Deploying contracts to networks is not part of CI compilation
5. **Coverage Analysis:** Code coverage is a testing concern (Epic 4)
6. **Linting:** ESLint and Solhint are separate jobs (Epic 6)
7. **Gas Optimization Reports:** Gas analysis is a testing/deployment concern
8. **Documentation Generation:** NatSpec/docgen is a separate documentation workflow
9. **Foundry Compilation:** Using Forge to compile is out of scope (Hardhat only)
10. **Multi-Network Compilation:** Compilation is network-agnostic; network-specific builds are for deployment

---

## Design Considerations

### Workflow Structure

```yaml
jobs:
  compile:
    name: Compile Contracts & Generate Types
    runs-on: ubuntu-latest
    container:
      image: ghcr.io/diamondslab/diamonds-dev-env:latest
      volumes:
        - ~/.cache/yarn:/root/.cache/yarn
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          submodules: recursive

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

      - name: Compile contracts
        run: yarn compile

      - name: Generate Diamond ABIs
        run: yarn diamond:generate-abi-typechain

      - name: Upload compilation artifacts
        uses: actions/upload-artifact@v4
        with:
          name: compilation-artifacts
          path: |
            artifacts/
            typechain-types/
            diamond-abi/
            diamond-typechain-types/
          retention-days: 7
```

### Directory Structure (Post-Compilation)

```
artifacts/
├── build-info/
│   └── [build-info-hash].json
├── contracts/
│   └── examplediamond/
│       ├── ExampleDiamond.sol/
│       └── facets/
│           ├── DiamondCutFacet.sol/
│           ├── DiamondLoupeFacet.sol/
│           └── OwnershipFacet.sol/
└── @openzeppelin/

typechain-types/
├── contracts/
│   └── examplediamond/
│       ├── ExampleDiamond.ts
│       └── facets/
├── factories/
├── common.ts
├── hardhat.d.ts
└── index.ts

diamond-abi/
└── ExampleDiamond.json

diamond-typechain-types/
├── ExampleDiamond.ts
├── factories/
│   └── ExampleDiamond__factory.ts
├── common.ts
└── index.ts
```

---

## Technical Considerations

### 1. Hardhat Configuration

- The project already has `hardhat.config.ts` configured for TypeChain with ethers-v6 target
- Hardhat automatically runs TypeChain plugin during compilation
- No additional configuration needed for standard compilation flow

### 2. Diamond ABI Generation

- Custom Hardhat plugin: `@diamondslab/hardhat-diamonds`
- Task: `diamond:generate-abi-typechain`
- Reads Diamond configuration from `diamonds/ExampleDiamond/examplediamond.config.json`
- Combines all facet ABIs into a single Diamond ABI
- Generates TypeChain types specifically for the combined Diamond interface

### 3. Caching Strategy

- **Yarn Cache:** `~/.cache/yarn` contains downloaded packages (fast to restore)
- **node_modules Cache:** Full dependency tree (fastest to restore, largest size)
- **Cache Key:** Based on `yarn.lock` ensures cache invalidates on dependency changes
- **Fallback Keys:** Allow partial cache restoration if lock file changed slightly

### 4. Container Volume Mounting

- Epic 2 established container setup with Yarn cache volume
- Volume mount: `~/.cache/yarn:/root/.cache/yarn`
- Ensures Yarn cache persists across job steps

### 5. Monorepo Considerations

- Project uses Yarn Workspaces with multiple packages in `packages/` directory
- Each package is a git submodule requiring `submodules: recursive`
- Workspace dependencies must be compiled before root project
- `yarn compile` handles workspace compilation order automatically

### 6. Error Output Formatting

- Hardhat provides detailed error messages with file/line/column information
- GitHub Actions automatically annotates errors in PR file view
- No additional error formatting required

### 7. Performance Expectations

- **Cold cache (first run):** 4-5 minutes (1-2 min dependencies, 2-3 min compilation)
- **Warm cache (cache hit):** 2-3 minutes (30s dependencies, 1.5-2.5 min compilation)
- **Time distribution:**
  - Checkout: 10-15s
  - Cache restore: 15-20s
  - Dependency install: 30s (cache hit) to 90s (cache miss)
  - Contract compilation: 60-90s
  - Diamond ABI generation: 30-45s
  - Artifact upload: 15-20s

---

## Success Metrics

### Primary Metrics

1. **Compilation Success Rate:** 95%+ of PRs should have successful compilation on first run
2. **Job Duration:** Average compilation time under 3 minutes with cache hits
3. **Cache Hit Rate:** 80%+ of workflow runs should hit dependency cache
4. **Time to Feedback:** Developers receive compilation results within 5 minutes of PR creation

### Secondary Metrics

1. **Artifact Size:** Compilation artifacts under 50 MB compressed
2. **False Negatives:** Zero false negatives (job passes when compilation actually failed)
3. **Error Clarity:** 90%+ of compilation errors should be immediately actionable from error message
4. **Cache Effectiveness:** Cache reduces dependency installation from 90s to <30s

### Monitoring Points

- Track compilation duration trends over time (detect performance regressions)
- Monitor cache hit rates per branch (main/develop should have higher hit rates)
- Track number of contracts compiled (increases over time)
- Alert if compilation exceeds 5 minutes (investigate performance issues)

---

## Open Questions

### Q1: Should we compile contracts for multiple Solidity versions?

**Context:** Some projects compile for multiple Solidity compiler versions to ensure compatibility.  
**Current Assumption:** Single Solidity version (0.8.19 per project configuration)  
**Decision Needed:** Confirm if multi-version compilation is needed now or in future epics

### Q2: Should Diamond ABI generation be conditional?

**Context:** Not all branches may have Diamond contracts yet.  
**Current Assumption:** Always run Diamond ABI generation, fail if config missing  
**Decision Needed:** Should job continue gracefully if Diamond config doesn't exist?

### Q3: How should we handle workspace package compilation failures?

**Context:** Submodule packages may fail to compile independently.  
**Current Assumption:** Fail entire job if any workspace package fails  
**Decision Needed:** Should we attempt partial compilation or require all packages to succeed?

### Q4: Should we upload raw Solidity AST outputs?

**Context:** Hardhat generates detailed AST files in `artifacts/build-info/`.  
**Current Assumption:** Include in artifacts for downstream security scanning (Slither)  
**Decision Needed:** Confirm if AST files are needed or if we should exclude to reduce artifact size

### Q5: Should compilation run on every PR or only on contract file changes?

**Context:** GitHub Actions supports path filters to run jobs conditionally.  
**Current Assumption:** Run on every PR for consistency  
**Decision Needed:** Should we add path filters to skip compilation when only docs/tests changed?

---

## Implementation Checklist

- [ ] Create `compile` job in `.github/workflows/ci.yml`
- [ ] Configure container image and volume mounts
- [ ] Add checkout step with submodules support
- [ ] Implement GitHub Actions caching for dependencies
- [ ] Add dependency installation step
- [ ] Add contract compilation step
- [ ] Add Diamond ABI generation step
- [ ] Configure artifact upload
- [ ] Add performance monitoring logs
- [ ] Set appropriate timeout (10 minutes)
- [ ] Test with sample PR (successful compilation)
- [ ] Test with intentional compilation error (job fails correctly)
- [ ] Test cache hit scenario (fast execution)
- [ ] Test cache miss scenario (full dependency installation)
- [ ] Document cache key strategy in workflow comments
- [ ] Update Epic 3 status in project plan

---

## Dependencies

### Upstream Dependencies (Must Complete First)

- **Epic 2:** Container setup must be complete with image published to GHCR
- ✅ DevContainer image available at `ghcr.io/diamondslab/diamonds-dev-env:latest`

### Downstream Dependencies (Blocked Until Complete)

- **Epic 4:** Testing pipeline requires compilation artifacts
- **Epic 5:** Security scanning requires compiled contracts and ABIs
- **Epic 6:** Linting may benefit from TypeChain types for TS validation

### External Dependencies

- GitHub Actions services (cache, artifact storage)
- GHCR availability for container image
- Hardhat compiler and plugins
- TypeChain generator
- Diamond Hardhat plugin

---

## Risks and Mitigations

### Risk 1: Cache Corruption

**Description:** GitHub Actions cache may become corrupted causing build failures.  
**Impact:** High - All PRs would fail compilation  
**Likelihood:** Low  
**Mitigation:** Implement cache versioning in key (e.g., `v1-yarn-${{ hashFiles() }}`), allow manual cache invalidation

### Risk 2: Submodule Sync Issues

**Description:** Submodules may not be at correct commit, causing compilation failures.  
**Impact:** Medium - Specific PRs fail with confusing errors  
**Likelihood:** Medium  
**Mitigation:** Use `submodules: recursive` and document submodule update process

### Risk 3: Hardhat Version Conflicts

**Description:** Container Hardhat version may conflict with project requirements.  
**Impact:** Medium - Compilation fails with version errors  
**Likelihood:** Low (controlled container)  
**Mitigation:** Lock Hardhat version in package.json, update container in sync

### Risk 4: Artifact Storage Limits

**Description:** GitHub has storage limits for artifacts (500 MB per artifact).  
**Impact:** Low - Artifact upload fails  
**Likelihood:** Very Low (compilation artifacts ~20-30 MB)  
**Mitigation:** Monitor artifact sizes, exclude unnecessary files from upload

### Risk 5: Diamond ABI Generation Failure

**Description:** Diamond plugin may fail if configuration is invalid or facets missing.  
**Impact:** Medium - Blocks Diamond-specific development  
**Likelihood:** Medium (during refactoring)  
**Mitigation:** Validate Diamond config in pre-commit hooks, provide clear error messages

---

## Appendix: Related Commands

### Local Development Commands

```bash
# Full compilation (matches CI)
yarn compile

# Diamond ABI generation (matches CI)
yarn diamond:generate-abi-typechain

# Clean build
yarn clean
yarn compile

# Install dependencies (matches CI)
yarn install --frozen-lockfile
```

### Debugging Compilation Issues

```bash
# Verbose compilation
npx hardhat compile --show-stack-traces

# Check Hardhat version
npx hardhat --version

# Verify Diamond config
cat diamonds/ExampleDiamond/examplediamond.config.json

# Check TypeChain output
ls -la typechain-types/
ls -la diamond-typechain-types/
```

### Cache Management (GitHub CLI)

```bash
# List caches
gh cache list

# Delete specific cache
gh cache delete <cache-id>

# Delete all caches (nuclear option)
gh cache list | awk '{print $1}' | xargs -n1 gh cache delete
```

---

**Document Version:** 1.0  
**Created:** February 5, 2026  
**Status:** Draft - Pending Review  
**Approver:** DevOps Lead  
**Next Review:** After Epic 2 completion
