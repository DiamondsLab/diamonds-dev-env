# Task List: Trail of Bits Security Toolkit Integration

## Relevant Files

- `.devcontainer/Dockerfile` - Modified to add multi-stage builds for Medusa, Echidna, and additional Python security tools
- `.devcontainer/scripts/post-create.sh` - Updated to remove runtime Medusa installation and add verification for pre-installed tools
- `.devcontainer/reference/Dockerfile-TrailofBitsToolbox` - Reference documentation (moved from .devcontainer/)
- `README.md` - Updated with new security tools documentation and usage examples
- `.devcontainer/README.md` - Updated with DevContainer security tools information and installation process changes
- `project/tasks-trailofbits-toolkit-integration.md` - This task list tracking implementation progress
- `project/prd-trailofbits-toolkit-integration.md` - Product requirements document for this feature

### Notes

- This integration involves Docker multi-stage builds, so testing requires rebuilding the container
- To test locally: `docker build -f .devcontainer/Dockerfile -t diamonds-dev:test .`
- The Medusa build stage can take 2-5 minutes due to Go compilation
- Cross-architecture testing (ARM64/x86_64) is important for this feature
- Use `docker system prune` to clean up old layers if disk space becomes an issue

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch for this feature: `git checkout -b feature/trailofbits-toolkit-docker`

- [x] 1.0 Add multi-stage build configuration to Dockerfile
  - [x] 1.1 Read the current `.devcontainer/Dockerfile` to understand its structure
  - [x] 1.2 Read the reference `Dockerfile-TrailofBitsToolbox` to understand the multi-stage build pattern
  - [x] 1.3 Add the `# syntax=docker/dockerfile:1.6` directive at the top of the Dockerfile
  - [x] 1.4 Create the first build stage: `FROM golang:1.25 AS medusa` (Medusa builder stage)
  - [x] 1.5 Create the second build stage: `FROM ghcr.io/crytic/echidna/echidna:latest AS echidna` (Echidna extraction stage)
  - [x] 1.6 Verify the existing `FROM node:22-slim` final stage remains intact

- [x] 2.0 Integrate Medusa binary from build stage
  - [x] 2.1 In the Medusa build stage, add `WORKDIR /src` directive
  - [x] 2.2 Add `RUN git clone https://github.com/crytic/medusa.git` to clone the repository
  - [x] 2.3 Add build commands to checkout latest tag and compile Medusa with proper flags
  - [x] 2.4 Ensure the binary is built to `/usr/local/bin/medusa` with 755 permissions
  - [x] 2.5 After switching to the `node` user in the final stage, add `COPY --chown=root:root --from=medusa /usr/local/bin/medusa /usr/local/bin/medusa` (must run as root before USER node)
  - [x] 2.6 Configure Medusa bash completion: `RUN medusa completion bash > /etc/bash_completion.d/medusa` (as root)

- [x] 3.0 Integrate Echidna binary from official image
  - [x] 3.1 In the Echidna build stage, add `RUN chmod 755 /usr/local/bin/echidna` to ensure proper permissions
  - [x] 3.2 After switching to the `node` user in the final stage, add `COPY --chown=root:root --from=echidna /usr/local/bin/echidna /usr/local/bin/echidna` (must run as root before USER node)
  - [x] 3.3 Verify both Medusa and Echidna COPY commands are placed in the Dockerfile BEFORE the `USER node` directive

- [x] 4.0 Add Python security tools (vyper, pyevmasm, crytic-compile)
  - [x] 4.1 Locate the section in Dockerfile where Python tools are installed via pipx (after `USER node`)
  - [x] 4.2 Add `pyevmasm` installation: `RUN pipx install pyevmasm` after existing pipx installs
  - [x] 4.3 Add `crytic-compile` installation: `RUN pipx install crytic-compile` after pyevmasm
  - [x] 4.4 Create Vyper virtual environment installation block (separate RUN command after pipx tools)
  - [x] 4.5 Add Vyper installation: `RUN python3 -m venv ${HOME}/.vyper && ${HOME}/.vyper/bin/pip3 install --no-cache-dir vyper`
  - [x] 4.6 Add Vyper PATH to .bashrc: `RUN echo '\nexport PATH=${PATH}:${HOME}/.vyper/bin' >> /home/node/.bashrc`

- [x] 5.0 Add cross-architecture support for ARM64/M1 Macs
  - [x] 5.1 Locate the system dependencies installation section (runs as root, before USER node)
  - [x] 5.2 Add `libc6-amd64-cross` to the apt-get install package list
  - [x] 5.3 Add conditional installation block for non-x86_64 architectures using the pattern from TrailofBits Dockerfile
  - [x] 5.4 Update the ENV section to include `QEMU_LD_PREFIX=/usr/x86_64-linux-gnu` for cross-arch solc support
  - [x] 5.5 Ensure the conditional block runs as root before the `USER node` directive

- [x] 6.0 Update post-create script to remove Medusa installation
  - [x] 6.1 Read `.devcontainer/scripts/post-create.sh` to locate the `install_medusa()` function
  - [x] 6.2 Remove the entire `install_medusa()` function definition (approximately 80-100 lines)
  - [x] 6.3 Remove the `install_medusa` function call from the `main()` function
  - [x] 6.4 Update the `verify_environment()` function to check for Medusa and Echidna availability
  - [x] 6.5 Add checks for `medusa --version` and `echidna --version` in the verification section
  - [x] 6.6 Update the "Next steps" display to mention Medusa and Echidna are pre-installed

- [x] 7.0 Update PATH and environment configuration
  - [x] 7.1 Verify the PATH environment variable in Dockerfile includes `/usr/local/bin` (for Medusa/Echidna)
  - [x] 7.2 Verify PATH includes `/home/node/.local/bin` (for pipx tools)
  - [x] 7.3 Verify PATH includes `/home/node/.vyper/bin` (for Vyper - added to .bashrc)
  - [x] 7.4 Verify PATH includes `/home/node/.foundry/bin` (existing Foundry tools - added during install)
  - [x] 7.5 Ensure all PATH entries are in the correct order (system paths before user paths)

- [x] 8.0 Test and verify all tools are working
  - [x] 8.1 Build the Docker image locally: `docker build -f .devcontainer/Dockerfile --build-arg WORKSPACE_NAME=diamonds_dev_env -t diamonds-dev:test .`
  - [x] 8.2 Run a test container: `docker run -it --rm diamonds-dev:test bash`
  - [x] 8.3 Inside the container, verify `medusa --version` returns version information
  - [x] 8.4 Inside the container, verify `echidna --version` returns version information
  - [x] 8.5 Inside the container, verify `vyper --version` returns version information
  - [x] 8.6 Inside the container, verify `evmasm --help` works (pyevmasm installs as `evmasm` command)
  - [x] 8.7 Inside the container, verify `crytic-compile --version` returns version information
  - [x] 8.8 Inside the container, verify all existing tools still work (node, yarn, hardhat, forge, slither)
  - [x] 8.9 Test the complete DevContainer build using VS Code "Rebuild Container" command
  - [x] 8.10 Verify post-create script runs without attempting to install Medusa

- [ ] 9.0 Update documentation and finalize
  - [x] 9.1 Move `Dockerfile-TrailofBitsToolbox` to `.devcontainer/reference/` directory for future reference
  - [x] 9.2 Update README.md to document the new security tools (Medusa, Echidna, Vyper, pyevmasm, crytic-compile)
  - [x] 9.3 Add usage examples for Medusa fuzzing in documentation
  - [x] 9.4 Add usage examples for Echidna fuzzing in documentation
  - [x] 9.5 Document the cross-architecture support for ARM64/M1 Macs
  - [x] 9.6 Update any DevContainer documentation about tool installation process
  - [x] 9.7 Commit all changes with descriptive commit message
  - [x] 9.8 Create pull request with reference to the PRD document
