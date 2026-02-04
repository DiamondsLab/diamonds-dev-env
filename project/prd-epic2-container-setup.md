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

1. The GitHub Actions workflow must use the Diamonds DevContainer image for all jobs
2. Node.js, Yarn, and all required tools must be available and functional in the container
3. Dependency installation must complete in under 5 minutes using Yarn cache
4. Environment variables must be set for RPC URLs and API keys
5. Security tokens (SNYK_TOKEN, ETHERSCAN_API_KEY, RPC URLs) must be configured via GitHub Secrets
6. The DevContainer image must be built and pushed to GitHub Container Registry (GHCR) automatically
7. Container image availability and tool functionality must be tested in CI
8. The container setup must support parallel job execution for optimal performance

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

- Dependency installation completes in under 5 minutes in CI
- All security tools authenticate successfully using configured secrets
- No "works on my machine" issues reported by developers
- Container image builds complete successfully and are available in GHCR
- CI jobs run without environment-related failures

## Open Questions

- What specific RPC URLs need to be configured for different test networks?
- How should container image versioning be handled for different branches?
- Are there any additional security tools that need secret configuration beyond the current set?
