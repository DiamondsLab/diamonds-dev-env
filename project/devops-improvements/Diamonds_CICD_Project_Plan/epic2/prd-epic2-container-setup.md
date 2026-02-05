# PRD: GitHub Actions Container Setup and Environment Configuration (Epic 2)

## Introduction/Overview

This feature implements Epic 2 of the Diamonds CI/CD Project Plan, focusing on configuring GitHub Actions to use the existing Diamonds DevContainer for all pipeline jobs. The goal is to ensure environment parity between local development and CI/CD execution, enabling fast dependency installation, proper security tool configuration, and consistent builds across all environments.

## Goals

- Guarantee exact environment matching between local development and CI/CD pipeline
- Achieve dependency installation in under 5 minutes with effective caching
- Properly configure environment variables and secrets for security tools (SNYK_TOKEN, ETHERSCAN_API_KEY, RPC URLs)
- Use GitHub Container Registry (GHCR) with automated builds for the DevContainer image
- Ensure both developers and CI/CD maintainers benefit from consistent tooling

## User Stories

- As a developer, I want my local environment to match the CI environment exactly so that there are no "works on my machine" surprises
- As an engineer, I want all dependencies cached and installed quickly so that jobs complete in reasonable time
- As the team, I want environment variables and secrets properly configured so that security tools authenticate correctly
- As a CI/CD maintainer, I want automated container builds and registry management so that infrastructure is maintained without manual intervention
- As a developer, I want to focus on code changes without worrying about environment discrepancies between local and CI

## Functional Requirements

1. **CRITICAL**: The DevContainer image must be built and published to GHCR before CI workflow can use it
2. The DevContainer image must be available at `ghcr.io/diamondslab/diamonds-dev-env:latest` (and versioned tags)
3. The GitHub Actions workflow must use the Diamonds DevContainer image for all jobs
4. Node.js, Yarn, and all required tools must be available and functional in the container
5. Dependency installation must complete in under 5 minutes using Yarn cache
6. Environment variables must be set for RPC URLs and API keys
7. Security tokens (SNYK_TOKEN, ETHERSCAN_API_KEY, RPC URLs) must be configured via GitHub Secrets
8. The DevContainer image must be built and pushed to GitHub Container Registry (GHCR) automatically on changes
9. Container image availability and tool functionality must be tested in CI
10. The container setup must support parallel job execution for optimal performance

## Non-Goals (Out of Scope)

- Modifying the existing DevContainer configuration beyond CI/CD integration
- Implementing additional security tools beyond the current set
- Changing the local development workflow or DevContainer usage
- Adding new environment variables or secrets not related to security tools
- Optimizing container build times beyond automated GHCR builds

## Design Considerations

The implementation should integrate seamlessly with the existing GitHub Actions workflow structure established in Epic 1. Container configuration should be centralized in the workflow file for easy maintenance and updates.

## Technical Considerations

- The DevContainer must include all dependencies required for Hardhat, Foundry, and security scanning tools
- GitHub Secrets must be properly scoped and accessible only to the CI/CD pipeline
- Container builds should be triggered on DevContainer repository changes
- Environment parity requires testing both local and CI execution paths

## Success Metrics

- **CRITICAL**: DevContainer image successfully built and available on GHCR
- Dependency installation completes in under 5 minutes in CI
- All security tools authenticate successfully using configured secrets
- No "works on my machine" issues reported by developers
- Container image builds complete successfully and are available in GHCR
- CI jobs run without environment-related failures
- Image can be pulled locally and used for development

## Open Questions

- **RESOLVED**: Container image location will be `ghcr.io/diamondslab/diamonds-dev-env`
- **ACTION REQUIRED**: Initial build must be triggered before CI can use the image
- What specific RPC URLs need to be configured for different test networks?
- How should container image versioning be handled for different branches? (Current: latest for main, branch-sha for others)
- Are there any additional security tools that need secret configuration beyond the current set?

## Implementation Status

### ✅ Completed

- Build workflow created (`.github/workflows/build-devcontainer.yml`)
- CI workflow updated to reference GHCR image
- Environment variables configured
- Validation script created

### ⚠️ BLOCKED - Awaiting Completion

- **Container image build and publish to GHCR** - MUST be completed before CI workflow can function
- Full CI pipeline testing - blocked by missing GHCR image
- Environment parity validation - blocked by missing GHCR image
