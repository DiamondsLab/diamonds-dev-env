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

- [ ] 0.0 Create feature branch
- [ ] 1.0 Add multi-stage build configuration to Dockerfile
- [ ] 2.0 Integrate Medusa binary from build stage
- [ ] 3.0 Integrate Echidna binary from official image
- [ ] 4.0 Add Python security tools (vyper, pyevmasm, crytic-compile)
- [ ] 5.0 Add cross-architecture support for ARM64/M1 Macs
- [ ] 6.0 Update post-create script to remove Medusa installation
- [ ] 7.0 Update PATH and environment configuration
- [ ] 8.0 Test and verify all tools are working
- [ ] 9.0 Update documentation and finalize

---

I have generated the high-level tasks based on your requirements. Ready to generate the sub-tasks? Respond with 'Go' to proceed.
