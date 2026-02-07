# How to Trigger DevContainer Build in Monorepo with Submodules

## Current Setup Analysis

### Repository Structure

```
diamonds-dev-env/              # Main repo
├── .github/workflows/
│   └── build-devcontainer.yml # Build workflow HERE
├── .devcontainer/             # Git submodule → diamonds-devcontainer repo
│   └── Dockerfile
└── packages/                  # Other submodules
```

### The Problem

1. `.devcontainer` is a **git submodule** pointing to `diamonds-devcontainer`
2. The build workflow is in `diamonds-dev-env` repo
3. Pushing to `diamonds-devcontainer` does NOT trigger workflows in `diamonds-dev-env`
4. Submodule updates appear as single commit hash changes, not file changes

---

## Solution: 3 Ways to Trigger the Build

### Option 1: Update Submodule Reference (RECOMMENDED)

Update the submodule pointer in `diamonds-dev-env` to trigger the workflow.

```bash
cd /home/jamatulli/decentralization/diamonds/diamonds-dev-env

# 1. Update the submodule to latest commit
git submodule update --remote .devcontainer

# 2. Stage the submodule change
git add .devcontainer

# 3. Commit
git commit -m "chore: update devcontainer submodule to trigger build"

# 4. Push to feature branch
git push origin feature/epic2-container-setup
```

**Why this works**: Git sees `.devcontainer` path changed (the commit hash), triggering the workflow.

---

### Option 2: Modify Workflow to Build on Manual Trigger

Add workflow_dispatch to enable manual triggering.

```yaml
# .github/workflows/build-devcontainer.yml
on:
  workflow_dispatch: # ← Add this
  push:
    branches: [main, develop]
    paths: [".devcontainer/**"]
```

Then trigger manually:

```bash
gh workflow run build-devcontainer.yml --ref feature/epic2-container-setup
```

---

### Option 3: Touch a File in .devcontainer Directly

Create/modify a file in the submodule FROM the parent repo.

```bash
cd /home/jamatulli/decentralization/diamonds/diamonds-dev-env

# Create a marker file
echo "# Build trigger" >> .devcontainer/BUILD_TRIGGER.md

# Commit in parent repo (not submodule)
git add .devcontainer/BUILD_TRIGGER.md
git commit -m "trigger: force devcontainer build"
git push origin feature/epic2-container-setup
```

**Warning**: This creates a "dirty" submodule state.

---

## Current Workflow Behavior

### Triggers

- ✅ Push to `main` branch with `.devcontainer/**` changes
- ✅ Push to `develop` branch with `.devcontainer/**` changes
- ✅ PR with `.devcontainer/**` changes
- ❌ Push to `diamonds-devcontainer` repo (different repo!)
- ❌ Submodule update (commit hash change doesn't match `paths` filter)

### What Happens

1. Workflow checks out `diamonds-dev-env` with submodules
2. Builds Docker image from `.devcontainer/Dockerfile`
3. Pushes to `ghcr.io/diamondslab/diamonds-dev-env:latest`

---

## The Real Issue: Submodule vs Path Filter

The workflow uses `paths: ['.devcontainer/**']` which checks for **file content changes**, but submodule updates only change the **commit hash reference**, not file paths.

### Fix: Make Workflow Submodule-Aware

Replace the current workflow trigger:

```yaml
on:
  push:
    branches: [main, develop]
    paths:
      - ".devcontainer/**"
      - ".devcontainer" # ← Add this to catch submodule hash changes
  pull_request:
    paths:
      - ".devcontainer/**"
      - ".devcontainer" # ← Add this
  workflow_dispatch: # ← Add manual trigger
```

---

## Recommended Solution

1. **Immediate Fix**: Use Option 1 (update submodule reference)
2. **Long-term Fix**: Modify workflow to be submodule-aware
3. **For Testing**: Add `workflow_dispatch` for manual triggering

---

## Next Steps

1. Create the missing Epic 2 PR
2. Update submodule reference to trigger build
3. Verify image appears on GHCR
4. Test CI workflow with the published image
