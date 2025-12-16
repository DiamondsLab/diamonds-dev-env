# Product Requirements Document: Trail of Bits Security Toolkit Integration

## Introduction/Overview

This feature integrates the Trail of Bits Ethereum Security Toolbox into the existing Diamonds DevContainer environment. The integration will consolidate security fuzzing tools (Echidna and Medusa) from the Trail of Bits toolkit while maintaining compatibility with the existing Node.js-based development workflow. The goal is to provide developers with a complete, Docker-based security testing environment that includes industry-standard fuzzing tools without requiring post-container-creation installation steps.

**Problem Statement:** Currently, Medusa is installed via a post-create script which can fail due to network issues, architecture detection problems, or GitHub API rate limits. Foundry is installed in the main Dockerfile, but Echidna (another critical fuzzing tool) is not available. The Trail of Bits Security Toolbox provides pre-built, tested versions of these tools that should be integrated into our container image for reliability and completeness.

## Goals

1. Integrate Trail of Bits pre-built Medusa and Echidna binaries into the main Dockerfile using multi-stage builds
2. Remove the post-create Medusa installation script in favor of Docker-based installation
3. Maintain compatibility with the existing 'node' user (avoid switching to 'ethsec' user)
4. Keep the existing Foundry installation approach (direct installation in Dockerfile)
5. Add additional Python security tools from Trail of Bits (vyper, pyevmasm, crytic-compile) to complement existing tools
6. Provide maximum security testing capability without concern for image size
7. Ensure the solution works across both x86_64 and ARM64 architectures

## User Stories

1. **As a smart contract developer**, I want Medusa and Echidna fuzzing tools available immediately when my container starts, so that I don't experience installation failures or delays.

2. **As a security auditor**, I want access to the complete Trail of Bits security toolkit (Medusa, Echidna, Slither, Crytic-compile, pyevmasm) in my development environment, so that I can perform comprehensive security testing.

3. **As a DevOps engineer**, I want security tools baked into the Docker image rather than installed at runtime, so that container startup is faster and more reliable.

4. **As a developer working on ARM64 (M1/M2 Mac)**, I want the container to work seamlessly with cross-architecture solc compilation support, so that I can test contracts on non-x86_64 hardware.

5. **As a CI/CD pipeline maintainer**, I want deterministic tool versions in the Docker image, so that builds are reproducible and don't depend on external network resources during container initialization.

## Functional Requirements

### FR1: Multi-Stage Build Integration

The Dockerfile must incorporate multi-stage builds to:

- Build Medusa from source using the golang:1.25 base image
- Extract the pre-built Echidna binary from ghcr.io/crytic/echidna/echidna:latest
- Copy these binaries into the final node:22-slim based image

### FR2: Medusa Installation

- Medusa must be built from the latest tagged release in the crytic/medusa repository
- The binary must be installed to `/usr/local/bin/medusa` with 755 permissions
- Bash completion for Medusa must be configured at `/etc/bash_completion.d/medusa`
- The installation must work for both x86_64 and ARM64 architectures

### FR3: Echidna Installation

- Echidna must be copied from the official Trail of Bits container image
- The binary must be installed to `/usr/local/bin/echidna` with 755 permissions
- The installation must preserve the existing functionality of the Trail of Bits image

### FR4: Python Security Tools

The Dockerfile must install the following Python packages (in addition to existing ones):

- `pyevmasm` - EVM assembler/disassembler
- `vyper` - Vyper smart contract compiler (in a virtual environment)
- `crytic-compile` - Multi-language smart contract compilation library

These should complement the existing:

- `slither-analyzer`
- `bandit`
- `safety`
- `pip-audit`

### FR5: Cross-Architecture Solc Support

For non-x86_64 environments (e.g., ARM64 Macs):

- Install `libc6-amd64-cross` package
- Set `QEMU_LD_PREFIX=/usr/x86_64-linux-gnu` environment variable
- Ensure amd64 Solidity compiler binaries can run on ARM64

### FR6: User Compatibility

- All tools must be installed and accessible to the 'node' user
- File ownership and permissions must be set appropriately for the 'node' user
- PATH environment variable must include all tool directories

### FR7: Post-Create Script Updates

- Remove the `install_medusa()` function from `post-create.sh`
- Remove Medusa installation logic and related error handling
- Update the verification section to confirm Medusa and Echidna are available
- Keep all other post-create functionality unchanged

### FR8: Build Argument Compatibility

- Maintain all existing build arguments (NODE_VERSION, PYTHON_VERSION, GO_VERSION, WORKSPACE_NAME)
- Ensure DIAMOND_NAME continues to work as a runtime environment variable

### FR9: Path Configuration

Update PATH to include:

- `/usr/local/bin` (for Medusa and Echidna)
- `/home/node/.local/bin` (for Python tools)
- `/home/node/.vyper/bin` (for Vyper)
- `/home/node/.foundry/bin` (existing Foundry tools)
- All existing PATH entries

### FR10: Verification and Testing

- The container must pass health checks for all installed tools
- `medusa --version` must work
- `echidna --version` must work
- `vyper --version` must work
- All existing tools must continue to function

## Non-Goals (Out of Scope)

1. **Not switching to ethsec user** - We will keep the 'node' user for compatibility with existing workflows
2. **Not replacing Foundry** - Keep the existing direct Foundry installation approach
3. **Not implementing Docker Compose** - This is a single Dockerfile modification, not a multi-container solution
4. **Not creating a separate "security-only" image** - All tools go into the main development image
5. **Not optimizing for image size** - Comprehensive functionality takes priority
6. **Not modifying the base image** - Continue using node:22-slim as the foundation
7. **Not adding the building-secure-contracts repository** - Skip the educational repository clone to save space
8. **Not implementing the MOTD** - Skip the Trail of Bits message of the day configuration
9. **Not creating a CI variant** - Only modify the interactive development container

## Design Considerations

### Multi-Stage Build Architecture

```
Stage 1 (medusa): golang:1.25
  └─> Build Medusa from source

Stage 2 (echidna): ghcr.io/crytic/echidna/echidna:latest
  └─> Extract pre-built Echidna binary

Stage 3 (final): node:22-slim
  └─> Copy binaries from stages 1 & 2
  └─> Install remaining tools
  └─> Configure for 'node' user
```

### File Organization

- Main Dockerfile: `/workspaces/diamonds_dev_env/.devcontainer/Dockerfile`
- Post-create script: `/workspaces/diamonds_dev_env/.devcontainer/scripts/post-create.sh`
- Keep `Dockerfile-TrailofBitsToolbox` as reference documentation

### Tool Installation Order

1. System dependencies (existing + libc6-amd64-cross)
2. Go installation (existing)
3. GitHub CLI (existing)
4. Vault CLI (existing)
5. Docker CLI (existing)
6. git-secrets (existing)
7. **Switch to node user**
8. Python tools via pipx (existing + new ones)
9. Vyper in virtual environment (new)
10. Foundry (existing)
11. **Copy Medusa and Echidna from build stages** (new)
12. npm global packages (existing)
13. Medusa bash completion configuration (new)

## Technical Considerations

### Build Dependencies

- The Dockerfile must include golang:1.25 as a builder stage for Medusa
- Git must be available in the builder stage to clone the Medusa repository
- The ghcr.io/crytic/echidna/echidna:latest image must be accessible during build

### Network Requirements During Build

- Access to github.com for cloning Medusa source
- Access to ghcr.io for pulling Echidna image
- Access to official Go package repositories
- These are build-time requirements only; runtime has no external dependencies

### Compatibility Constraints

- Must maintain backward compatibility with existing devcontainer.json configuration
- Must not break existing hardhat tasks or npm scripts
- Must preserve all existing environment variables
- Must work with VS Code DevContainer extension

### Performance Impact

- Longer initial Docker build time (Go compilation adds 2-5 minutes)
- Larger final image size (estimate +500MB for security tools)
- Faster container startup (no post-create network downloads)
- More reliable container initialization (no runtime installation failures)

### Security Implications

- Binaries are built from source (Medusa) or official images (Echidna), reducing supply chain risk
- Tool versions are locked at build time for reproducibility
- All tools run as non-root 'node' user for better isolation

## Success Metrics

1. **Installation Reliability**: 100% success rate for container creation (vs. current ~85% with network-dependent post-create installation)

2. **Build Time**: Docker build completes in under 15 minutes on GitHub Actions runners

3. **Container Startup Time**: Container becomes ready for development in under 30 seconds (vs. current 2-3 minutes with post-create Medusa installation)

4. **Tool Availability**: All security tools (Medusa, Echidna, Slither, etc.) are immediately available after container start

5. **Cross-Platform Support**: Container builds and runs successfully on both x86_64 and ARM64 architectures

6. **Test Pass Rate**: All existing integration tests continue to pass after the changes

7. **Developer Satisfaction**: Reduction in DevContainer-related support issues by 50%

## Open Questions

1. **Q: Should we pin specific versions of Medusa and Echidna, or always use latest?**
   - Consider: Reproducibility vs. staying current with security updates
   - Recommendation: Use latest tagged release for Medusa, pin Echidna image tag

2. **Q: How should we handle the increased Docker build time in CI/CD?**
   - Options: Docker layer caching, pre-built base images, multi-stage caching
   - Recommendation: Implement GitHub Actions Docker cache to reuse Medusa build stage

3. **Q: Should vyper be optional or always installed?**
   - Current state: Not present in existing Dockerfile
   - Recommendation: Install by default since it's lightweight and useful for Vyper contract testing

4. **Q: Do we need to keep `Dockerfile-TrailofBitsToolbox` after integration?**
   - Options: Delete, keep as reference, move to docs/
   - Recommendation: Move to `.devcontainer/reference/` directory for documentation

5. **Q: Should we add a build argument to make Trail of Bits tools optional?**
   - Tradeoff: Flexibility vs. complexity
   - Recommendation: No, keep tools mandatory for consistent developer experience

6. **Q: How should we document the new tools for junior developers?**
   - Update README.md with tool descriptions and usage examples
   - Add links to official Trail of Bits documentation
   - Create quick-start guide for fuzzing with Medusa and Echidna

## Implementation Notes for Developer

### Key Files to Modify

1. `.devcontainer/Dockerfile` - Add multi-stage build, integrate binaries
2. `.devcontainer/scripts/post-create.sh` - Remove Medusa installation function
3. Update any documentation referencing the old installation method

### Testing Checklist

- [ ] Container builds successfully on local machine
- [ ] `medusa --version` returns version information
- [ ] `echidna --version` returns version information
- [ ] `vyper --version` returns version information
- [ ] All existing npm scripts still work
- [ ] Hardhat compilation succeeds
- [ ] TypeScript compilation succeeds
- [ ] Fuzzing tests can be run with both Medusa and Echidna
- [ ] Post-create script completes without Medusa installation attempts
- [ ] Environment verification in post-create script passes

### Rollback Plan

If the integration causes issues:

1. Revert Dockerfile changes to previous version
2. Re-enable post-create Medusa installation
3. Document the failure mode and root cause
4. Consider alternative approaches (Docker Compose, optional installation)

## Appendix: Tool Comparison

| Tool           | Current Installation                   | New Installation           | Benefit            |
| -------------- | -------------------------------------- | -------------------------- | ------------------ |
| Medusa         | Post-create script (network-dependent) | Docker build (multi-stage) | Reliability, speed |
| Echidna        | Not available                          | Docker build (binary copy) | New capability     |
| Foundry        | Dockerfile (user install)              | Unchanged                  | Consistency        |
| Slither        | Dockerfile (pipx)                      | Unchanged                  | Consistency        |
| Vyper          | Not available                          | Dockerfile (venv)          | New capability     |
| pyevmasm       | Not available                          | Dockerfile (pipx)          | New capability     |
| crytic-compile | Not available                          | Dockerfile (pipx)          | New capability     |

---

**Document Version:** 1.0  
**Created:** December 10, 2025  
**Target Completion:** January 2026  
**Priority:** High
