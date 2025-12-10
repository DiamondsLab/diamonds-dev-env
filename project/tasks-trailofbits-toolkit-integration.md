# Task List: Trail of Bits Security Toolkit Integration

## Relevant Files

- `.devcontainer/Dockerfile` - Main Dockerfile that will be modified to add multi-stage builds for Medusa and Echidna
- `.devcontainer/scripts/post-create.sh` - Post-creation script that currently installs Medusa at runtime (needs removal)
- `.devcontainer/reference/Dockerfile-TrailofBitsToolbox` - Reference documentation (moved from root .devcontainer/)
- `README.md` - Project documentation that may need updates about new tools
- `.devcontainer/devcontainer.json` - DevContainer configuration (verify compatibility)

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

- [ ] 1.0 Add multi-stage build configuration to Dockerfile
  - [ ] 1.1 Read the current `.devcontainer/Dockerfile` to understand its structure
  - [ ] 1.2 Read the reference `Dockerfile-TrailofBitsToolbox` to understand the multi-stage build pattern
  - [ ] 1.3 Add the `# syntax=docker/dockerfile:1.6` directive at the top of the Dockerfile
  - [ ] 1.4 Create the first build stage: `FROM golang:1.25 AS medusa` (Medusa builder stage)
  - [ ] 1.5 Create the second build stage: `FROM ghcr.io/crytic/echidna/echidna:latest AS echidna` (Echidna extraction stage)
  - [ ] 1.6 Verify the existing `FROM node:22-slim` final stage remains intact

- [ ] 2.0 Integrate Medusa binary from build stage
  - [ ] 2.1 In the Medusa build stage, add `WORKDIR /src` directive
  - [ ] 2.2 Add `RUN git clone https://github.com/crytic/medusa.git` to clone the repository
  - [ ] 2.3 Add build commands to checkout latest tag and compile Medusa with proper flags
  - [ ] 2.4 Ensure the binary is built to `/usr/local/bin/medusa` with 755 permissions
  - [ ] 2.5 After switching to the `node` user in the final stage, add `COPY --chown=root:root --from=medusa /usr/local/bin/medusa /usr/local/bin/medusa` (must run as root before USER node)
  - [ ] 2.6 Configure Medusa bash completion: `RUN medusa completion bash > /etc/bash_completion.d/medusa` (as root)

- [ ] 3.0 Integrate Echidna binary from official image
  - [ ] 3.1 In the Echidna build stage, add `RUN chmod 755 /usr/local/bin/echidna` to ensure proper permissions
  - [ ] 3.2 After switching to the `node` user in the final stage, add `COPY --chown=root:root --from=echidna /usr/local/bin/echidna /usr/local/bin/echidna` (must run as root before USER node)
  - [ ] 3.3 Verify both Medusa and Echidna COPY commands are placed in the Dockerfile BEFORE the `USER node` directive

- [ ] 4.0 Add Python security tools (vyper, pyevmasm, crytic-compile)
  - [ ] 4.1 Locate the section in Dockerfile where Python tools are installed via pipx (after `USER node`)
  - [ ] 4.2 Add `pyevmasm` installation: `RUN pipx install pyevmasm` after existing pipx installs
  - [ ] 4.3 Add `crytic-compile` installation: `RUN pipx install crytic-compile` after pyevmasm
  - [ ] 4.4 Create Vyper virtual environment installation block (separate RUN command after pipx tools)
  - [ ] 4.5 Add Vyper installation: `RUN python3 -m venv ${HOME}/.vyper && ${HOME}/.vyper/bin/pip3 install --no-cache-dir vyper`
  - [ ] 4.6 Add Vyper PATH to .bashrc: `RUN echo '\nexport PATH=${PATH}:${HOME}/.vyper/bin' >> /home/node/.bashrc`

- [ ] 5.0 Add cross-architecture support for ARM64/M1 Macs
  - [ ] 5.1 Locate the system dependencies installation section (runs as root, before USER node)
  - [ ] 5.2 Add `libc6-amd64-cross` to the apt-get install package list
  - [ ] 5.3 Add conditional installation block for non-x86_64 architectures using the pattern from TrailofBits Dockerfile
  - [ ] 5.4 Update the ENV section to include `QEMU_LD_PREFIX=/usr/x86_64-linux-gnu` for cross-arch solc support
  - [ ] 5.5 Ensure the conditional block runs as root before the `USER node` directive

- [ ] 6.0 Update post-create script to remove Medusa installation
  - [ ] 6.1 Read `.devcontainer/scripts/post-create.sh` to locate the `install_medusa()` function
  - [ ] 6.2 Remove the entire `install_medusa()` function definition (approximately 80-100 lines)
  - [ ] 6.3 Remove the `install_medusa` function call from the `main()` function
  - [ ] 6.4 Update the `verify_environment()` function to check for Medusa and Echidna availability
  - [ ] 6.5 Add checks for `medusa --version` and `echidna --version` in the verification section
  - [ ] 6.6 Update the "Next steps" display to mention Medusa and Echidna are pre-installed

- [ ] 7.0 Update PATH and environment configuration
  - [ ] 7.1 Verify the PATH environment variable in Dockerfile includes `/usr/local/bin` (for Medusa/Echidna)
  - [ ] 7.2 Verify PATH includes `/home/node/.local/bin` (for pipx tools)
  - [ ] 7.3 Verify PATH includes `/home/node/.vyper/bin` (for Vyper)
  - [ ] 7.4 Verify PATH includes `/home/node/.foundry/bin` (existing Foundry tools)
  - [ ] 7.5 Ensure all PATH entries are in the correct order (system paths before user paths)

- [ ] 8.0 Test and verify all tools are working
  - [ ] 8.1 Build the Docker image locally: `docker build -f .devcontainer/Dockerfile --build-arg WORKSPACE_NAME=diamonds_dev_env -t diamonds-dev:test .`
  - [ ] 8.2 Run a test container: `docker run -it --rm diamonds-dev:test bash`
  - [ ] 8.3 Inside the container, verify `medusa --version` returns version information
  - [ ] 8.4 Inside the container, verify `echidna --version` returns version information
  - [ ] 8.5 Inside the container, verify `vyper --version` returns version information
  - [ ] 8.6 Inside the container, verify `pyevmasm --version` or `pyevmasm --help` works
  - [ ] 8.7 Inside the container, verify `crytic-compile --version` returns version information
  - [ ] 8.8 Inside the container, verify all existing tools still work (node, yarn, hardhat, forge, slither)
  - [ ] 8.9 Test the complete DevContainer build using VS Code "Rebuild Container" command
  - [ ] 8.10 Verify post-create script runs without attempting to install Medusa

- [ ] 9.0 Update documentation and finalize
  - [ ] 9.1 Move `Dockerfile-TrailofBitsToolbox` to `.devcontainer/reference/` directory for future reference
  - [ ] 9.2 Update README.md to document the new security tools (Medusa, Echidna, Vyper, pyevmasm, crytic-compile)
  - [ ] 9.3 Add usage examples for Medusa fuzzing in documentation
  - [ ] 9.4 Add usage examples for Echidna fuzzing in documentation
  - [ ] 9.5 Document the cross-architecture support for ARM64/M1 Macs
  - [ ] 9.6 Update any DevContainer documentation about tool installation process
  - [ ] 9.7 Commit all changes with descriptive commit message
  - [ ] 9.8 Create pull request with reference to the PRD document
