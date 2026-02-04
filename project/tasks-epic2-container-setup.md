## Relevant Files

- `.github/workflows/ci.yml` - Main GitHub Actions workflow file that needs container configuration updates
- `.devcontainer/Dockerfile` - DevContainer Dockerfile that will be built and pushed to GHCR
- `.devcontainer/devcontainer.json` - DevContainer configuration file
- `.github/workflows/build-devcontainer.yml` - New workflow for automated DevContainer builds (to be created)
- `scripts/test-container-setup.sh` - Script to test container functionality in CI (to be created)

### Notes

- Unit tests should typically be placed alongside the code files they are testing.
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch for this feature (e.g., `git checkout -b feature/epic2-container-setup`)
- [x] 1.0 Set up GitHub Container Registry access and permissions
  - [x] 1.1 Verify GitHub Container Registry (GHCR) is enabled for the repository
  - [x] 1.2 Configure repository settings to allow package creation and publishing to GHCR
  - [x] 1.3 Set up GitHub Actions permissions for GHCR access (GITHUB_TOKEN with packages:write)
  - [x] 1.4 Test GHCR access by attempting to pull an existing image (if any)
- [x] 2.0 Create automated DevContainer build workflow
  - [x] 2.1 Create `.github/workflows/build-devcontainer.yml` file
  - [x] 2.2 Configure workflow triggers (push to main/develop branches, changes to .devcontainer/)
  - [x] 2.3 Add build steps: checkout code, build Docker image, tag with appropriate version
  - [x] 2.4 Add push step to publish image to GHCR
  - [x] 2.5 Configure build caching to optimize build times
  - [x] 2.6 Test the build workflow by pushing a change to trigger it
- [ ] 3.0 Update CI workflow to use DevContainer image
  - [x] 3.1 Open `.github/workflows/ci.yml` and locate the jobs section
  - [x] 3.2 Add container configuration to each job using the GHCR image
  - [x] 3.3 Configure Yarn cache mounting for dependency caching
  - [x] 3.4 Set up environment variables for Node.js and Yarn
  - [x] 3.5 Verify parallel job execution still works with container setup
  - [ ] 3.6 Test the updated CI workflow with a sample PR
- [ ] 4.0 Configure environment variables and GitHub Secrets
  - [ ] 4.1 Navigate to repository Settings > Secrets and variables > Actions
  - [ ] 4.2 Add SNYK_TOKEN secret for security scanning
  - [ ] 4.3 Add ETHERSCAN_API_KEY secret for contract verification
  - [ ] 4.4 Add RPC URL environment variables (e.g., MAINNET_RPC_URL, SEPOLIA_RPC_URL)
  - [ ] 4.5 Configure environment variables in the CI workflow jobs
  - [ ] 4.6 Verify secrets are accessible in CI runs (without logging values)
- [ ] 5.0 Test and validate container setup in CI
  - [ ] 5.1 Create `scripts/test-container-setup.sh` script to validate container functionality
  - [ ] 5.2 Add validation steps: check Node.js/Yarn versions, verify tools availability
  - [ ] 5.3 Measure dependency installation time to ensure under 5 minutes
  - [ ] 5.4 Add container validation job to CI workflow
  - [ ] 5.5 Run full CI pipeline and verify all jobs pass with container setup
  - [ ] 5.6 Monitor for "works on my machine" issues and environment discrepancies
