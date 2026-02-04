## Epic 2: Container Setup and Environment Configuration

_Configure GitHub Actions to use the Diamonds DevContainer for all pipeline jobs_

### Objective

Ensure GitHub Actions uses the existing Diamonds DevContainer image, guaranteeing environment parity between local and CI/CD execution.

### User Stories

- As a developer, I want my local environment to match the CI environment exactly so that there are no "works on my machine" surprises
- As an engineer, I want all dependencies cached and installed quickly so that jobs complete in reasonable time
- As the team, I want environment variables and secrets properly configured so that security tools authenticate correctly

### Acceptance Criteria

- GitHub Actions uses Diamonds DevContainer image
- Node.js, Yarn, and all tools are available in the container
- Dependencies install in under 5 minutes with caching
- Environment variables set for RPC URLs and API keys
- Security tokens (`SNYK_TOKEN`, etc.) configured via GitHub Secrets

### Implementation Tasks

- Build and push DevContainer image to GitHub Container Registry (GHCR)
- Configure container image in workflow jobs
- Set up GitHub Secrets for API keys (`SNYK_TOKEN`, `ETHERSCAN_API_KEY`, etc.)
- Configure dependency caching (Yarn cache)
- Test container availability and tool functionality in CI

### Estimated Effort

3-4 days

---
