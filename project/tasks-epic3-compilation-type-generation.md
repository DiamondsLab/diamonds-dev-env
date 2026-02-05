# Task List: Epic 3 - Compilation and Type Generation

## Relevant Files

- `.github/workflows/ci.yml` - Main GitHub Actions workflow file (to be updated with compile job)
- `project/prd-epic3-compilation-type-generation.md` - Product Requirements Document for this epic
- `hardhat.config.ts` - Hardhat configuration with TypeChain plugin settings
- `package.json` - Contains compilation scripts (`yarn compile`, `yarn diamond:generate-abi-typechain`)
- `diamonds/ExampleDiamond/examplediamond.config.json` - Diamond configuration for ABI generation

### Notes

- This epic depends on Epic 2 completion (DevContainer image must be available on GHCR)
- All tasks must be completed on a feature branch (`feature/epic3-compilation`)
- Test suite must pass before marking parent tasks complete

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [ ] 0.0 Create feature branch and verify prerequisites
  - [ ] 0.1 Verify Epic 2 completion: DevContainer image available at `ghcr.io/diamondslab/diamonds-dev-env:latest`
  - [ ] 0.2 Create and checkout feature branch: `git checkout -b feature/epic3-compilation`
  - [ ] 0.3 Verify current CI workflow structure in `.github/workflows/ci.yml`
  - [ ] 0.4 Test local compilation: `yarn compile` and `yarn diamond:generate-abi-typechain`
  - [ ] 0.5 Document expected compilation outputs (artifacts/, typechain-types/, diamond-abi/, diamond-typechain-types/)

- [ ] 1.0 Define compilation job structure in workflow
  - [ ] 1.1 Open `.github/workflows/ci.yml` and locate the jobs section
  - [ ] 1.2 Add `compile` job definition with name "Compile Contracts & Generate Types"
  - [ ] 1.3 Configure job to run on `ubuntu-latest`
  - [ ] 1.4 Add container configuration using `ghcr.io/diamondslab/diamonds-dev-env:latest`
  - [ ] 1.5 Configure container volume mount for Yarn cache: `~/.cache/yarn:/root/.cache/yarn`
  - [ ] 1.6 Set job timeout to 10 minutes: `timeout-minutes: 10`
  - [ ] 1.7 Add job to run unconditionally (no job dependencies yet)

- [ ] 2.0 Implement repository checkout step
  - [ ] 2.1 Add "Checkout code" step using `actions/checkout@v4`
  - [ ] 2.2 Configure `submodules: recursive` to fetch workspace packages
  - [ ] 2.3 Enable `fetch-depth: 0` for full git history (optional but recommended)
  - [ ] 2.4 Verify step includes required parameters for monorepo structure

- [ ] 3.0 Configure dependency caching
  - [ ] 3.1 Add "Cache dependencies" step using `actions/cache@v3`
  - [ ] 3.2 Configure cache paths: `~/.cache/yarn`, `node_modules`, `**/node_modules`
  - [ ] 3.3 Set cache key: `${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}`
  - [ ] 3.4 Add restore-keys for partial cache hits: `${{ runner.os }}-yarn-`
  - [ ] 3.5 Document cache strategy in workflow comments

- [ ] 4.0 Add dependency installation step
  - [ ] 4.1 Add "Install dependencies" step with name
  - [ ] 4.2 Configure command: `yarn install --frozen-lockfile`
  - [ ] 4.3 Add conditional execution based on cache miss (optional optimization)
  - [ ] 4.4 Verify step will fail if yarn.lock is out of sync

- [ ] 5.0 Implement contract compilation step
  - [ ] 5.1 Add "Compile contracts" step with descriptive name
  - [ ] 5.2 Configure command: `yarn compile`
  - [ ] 5.3 Add timing logs (start/end) for performance monitoring
  - [ ] 5.4 Ensure step fails immediately on compilation errors
  - [ ] 5.5 Add step description explaining it compiles Solidity and generates TypeChain types

- [ ] 6.0 Add Diamond ABI generation step
  - [ ] 6.1 Add "Generate Diamond ABIs" step after compilation
  - [ ] 6.2 Configure command: `yarn diamond:generate-abi-typechain`
  - [ ] 6.3 Add step description explaining Diamond combined ABI creation
  - [ ] 6.4 Verify step depends on successful compilation (implicit via job order)
  - [ ] 6.5 Ensure step fails if Diamond config is invalid

- [ ] 7.0 Configure artifact upload
  - [ ] 7.1 Add "Upload compilation artifacts" step using `actions/upload-artifact@v4`
  - [ ] 7.2 Set artifact name: `compilation-artifacts`
  - [ ] 7.3 Configure artifact paths:
    - `artifacts/`
    - `typechain-types/`
    - `diamond-abi/`
    - `diamond-typechain-types/`
  - [ ] 7.4 Set retention period: `retention-days: 7`
  - [ ] 7.5 Enable compression for faster upload
  - [ ] 7.6 Configure artifact to run even if previous steps fail (for debugging): `if: always()`

- [ ] 8.0 Add performance monitoring and warnings
  - [ ] 8.1 Add step to log start timestamp before compilation
  - [ ] 8.2 Add step to log end timestamp after compilation
  - [ ] 8.3 Calculate and log compilation duration
  - [ ] 8.4 Add warning annotation if compilation exceeds 2 minutes (target threshold)
  - [ ] 8.5 Configure step to fail if compilation exceeds 5 minutes (hard limit)

- [ ] 9.0 Test compilation job with successful build
  - [ ] 9.1 Commit workflow changes to feature branch
  - [ ] 9.2 Push branch to remote: `git push -u origin feature/epic3-compilation`
  - [ ] 9.3 Create draft PR to trigger workflow
  - [ ] 9.4 Monitor workflow run in GitHub Actions UI
  - [ ] 9.5 Verify job completes successfully within expected time (2-5 minutes)
  - [ ] 9.6 Download and inspect compilation artifacts
  - [ ] 9.7 Verify all expected directories present in artifact (4 directories)
  - [ ] 9.8 Check artifact size is reasonable (<50 MB compressed)

- [ ] 10.0 Test compilation job with intentional failure
  - [ ] 10.1 Create test commit with Solidity compilation error (e.g., syntax error in contract)
  - [ ] 10.2 Push to feature branch and trigger workflow
  - [ ] 10.3 Verify job fails immediately on compilation error
  - [ ] 10.4 Verify error message is clear and actionable
  - [ ] 10.5 Verify GitHub annotations show error in PR file view
  - [ ] 10.6 Revert intentional error commit

- [ ] 11.0 Test dependency caching behavior
  - [ ] 11.1 Trigger workflow run and note "Cache hit" or "Cache miss" in logs
  - [ ] 11.2 Trigger second workflow run without changes
  - [ ] 11.3 Verify cache hit occurs on second run
  - [ ] 11.4 Verify dependency installation takes <30 seconds with cache hit
  - [ ] 11.5 Make trivial change to yarn.lock to test cache invalidation
  - [ ] 11.6 Verify cache miss and full dependency installation on next run
  - [ ] 11.7 Revert yarn.lock change

- [ ] 12.0 Verify Diamond ABI generation
  - [ ] 12.1 Download artifacts from successful workflow run
  - [ ] 12.2 Extract and inspect `diamond-abi/ExampleDiamond.json`
  - [ ] 12.3 Verify combined ABI includes functions from all facets
  - [ ] 12.4 Inspect `diamond-typechain-types/ExampleDiamond.ts`
  - [ ] 12.5 Verify TypeChain types include all Diamond functions
  - [ ] 12.6 Compare Diamond ABI with local generation output for consistency

- [ ] 13.0 Performance validation and optimization
  - [ ] 13.1 Review compilation duration across multiple workflow runs
  - [ ] 13.2 Verify cold cache runs complete in 4-5 minutes
  - [ ] 13.3 Verify warm cache runs complete in 2-3 minutes
  - [ ] 13.4 Identify any performance bottlenecks in logs
  - [ ] 13.5 Optimize cache configuration if needed (key structure, paths)
  - [ ] 13.6 Document actual vs expected performance in PR description

- [ ] 14.0 Integration with downstream jobs (preparation)
  - [ ] 14.1 Document artifact structure for Epic 4 (testing) reference
  - [ ] 14.2 Verify artifact includes all files needed for testing
  - [ ] 14.3 Verify artifact includes all files needed for security scanning (Epic 5)
  - [ ] 14.4 Add workflow comments documenting artifact contents
  - [ ] 14.5 Create documentation for downloading/using artifacts in other jobs

- [ ] 15.0 Documentation and cleanup
  - [ ] 15.1 Update PRD with any implementation decisions or deviations
  - [ ] 15.2 Document cache key strategy in workflow comments
  - [ ] 15.3 Add inline comments explaining critical workflow steps
  - [ ] 15.4 Update "Relevant Files" section in this task list
  - [ ] 15.5 Create PR description summarizing Epic 3 implementation
  - [ ] 15.6 Include workflow run screenshots in PR
  - [ ] 15.7 Document any open questions from PRD that need team discussion

- [ ] 16.0 Final validation and PR preparation
  - [ ] 16.1 Run full test suite locally: `yarn test`
  - [ ] 16.2 Verify all tests pass (219 passing as baseline)
  - [ ] 16.3 Run security scans: `yarn security-check`
  - [ ] 16.4 Stage all changes: `git add .`
  - [ ] 16.5 Commit with descriptive message referencing Epic 3
  - [ ] 16.6 Push final changes to feature branch
  - [ ] 16.7 Convert draft PR to ready for review
  - [ ] 16.8 Request review from team lead

## Progress Notes

### Current Status

- Epic 3 PRD completed and approved
- Waiting to begin implementation
- Epic 2 status: COMPLETE (DevContainer image published)

### Blockers

- None (Epic 2 complete, DevContainer image available)

### Next Steps

1. Create feature branch (`feature/epic3-compilation`)
2. Begin with Task 0.0: Prerequisites verification
3. Implement compilation job in workflow
4. Test and validate

---

**Last Updated:** February 5, 2026  
**Status:** Not Started  
**Branch:** Not yet created  
**PR:** Not yet created
