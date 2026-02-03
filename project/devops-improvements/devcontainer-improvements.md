# DevContainer Improvements for DevOps System

## Issue Summary

The DevOps validation script (`scripts/devops/validate-templates.sh`) requires `yamllint` for YAML syntax validation of issue templates and workflows. Currently, `yamllint` is not installed in the DevContainer.

## Current State

The validation script handles missing yamllint gracefully:

- Warns when yamllint is not found
- Skips YAML validation
- Continues with other validations (markdown, CODEOWNERS, etc.)

However, for complete validation, yamllint should be available.

## Proposed Solution

Add yamllint to the DevContainer Dockerfile using pipx (Python package installer).

### Changes to `.devcontainer/Dockerfile`

Add after the pipx installation section (around line 140):

```dockerfile
# Install YAML linting tool for DevOps validation
RUN pipx install yamllint
```

### Optional: Add actionlint

For enhanced GitHub Actions workflow validation:

```dockerfile
# Install actionlint for GitHub Actions workflow validation
RUN go install github.com/rhysd/actionlint/cmd/actionlint@latest
```

## Implementation Steps

1. **Update Dockerfile:**

   ```dockerfile
   # After existing pipx installations (echidna, medusa, etc.)

   # DevOps tools for template and workflow validation
   RUN pipx install yamllint

   # Optional: Install actionlint via Go
   RUN go install github.com/rhysd/actionlint/cmd/actionlint@latest
   ```

2. **Rebuild DevContainer:**
   - Command Palette → "Dev Containers: Rebuild Container"
   - Or rebuild from scratch: "Dev Containers: Rebuild Without Cache"

3. **Verify Installation:**

   ```bash
   yamllint --version
   actionlint --version
   ```

4. **Test Validation Script:**
   ```bash
   ./scripts/devops/validate-templates.sh
   ```

## Benefits

1. **Complete Validation:** Full YAML syntax checking for templates and workflows
2. **Early Error Detection:** Catch YAML syntax errors before pushing to GitHub
3. **Workflow Validation:** actionlint provides GitHub Actions-specific checks
4. **Consistent Environment:** All developers have the same validation tools
5. **CI/CD Alignment:** Local validation matches CI/CD checks

## Impact

**Files to Update:**

- `.devcontainer/Dockerfile` (add 2-5 lines)
- `.devcontainer/README.md` (document new tools)

**DevContainer Rebuild:** Required (~5-10 minutes)

**Breaking Changes:** None - tools are additions only

## Alternatives Considered

### Alternative 1: Install via apt-get

```dockerfile
RUN apt-get update && apt-get install -y yamllint
```

**Pros:** System package manager
**Cons:** May not have latest version

### Alternative 2: Install via pip (not pipx)

```dockerfile
RUN pip install yamllint
```

**Pros:** Direct Python install
**Cons:** Less isolated, can conflict with system Python

### Alternative 3: Manual install per developer

```bash
pipx install yamllint
```

**Pros:** No Dockerfile changes
**Cons:** Not consistent across developers, easy to forget

## Recommendation

**Use pipx** (Alternative from main proposal) because:

- ✅ Isolated Python environment
- ✅ Latest versions
- ✅ Consistent with existing tool installations (echidna, medusa)
- ✅ Part of DevContainer image (no manual steps)

## Related Files

- `.devcontainer/Dockerfile` - Main DevContainer configuration
- `.devcontainer/README.md` - DevContainer documentation
- `scripts/devops/validate-templates.sh` - Validation script that uses yamllint
- `scripts/devops/README.md` - Documents yamllint as prerequisite

## Priority

**Medium** - Validation script works without yamllint, but provides better error detection with it.

## Future Enhancements

1. **Pre-commit Hook:** Add yamllint check to pre-commit hooks
2. **CI/CD Integration:** Run yamllint in GitHub Actions
3. **VS Code Extension:** Consider YAML extension for real-time validation
4. **Custom yamllint Config:** Create `.yamllint` config for project-specific rules

## Example yamllint Configuration

Create `.yamllint` in repository root:

```yaml
---
extends: default

rules:
  line-length:
    max: 120
    level: warning

  comments:
    min-spaces-from-content: 1

  indentation:
    spaces: 2
    indent-sequences: true

  # Allow duplicate keys in GitHub Forms (for multiple inputs)
  key-duplicates:
    forbid-duplicated-merge-keys: true
```

## Testing Plan

After implementation:

1. **Rebuild DevContainer**
2. **Verify yamllint installed:** `which yamllint`
3. **Test validation script:** `./scripts/devops/validate-templates.sh`
4. **Expected:** No warnings about missing yamllint
5. **Expected:** YAML files validated successfully
6. **Test on invalid YAML:** Introduce syntax error and verify detection

## References

- yamllint documentation: https://yamllint.readthedocs.io/
- actionlint documentation: https://github.com/rhysd/actionlint
- pipx documentation: https://pypa.github.io/pipx/
- DevContainers specification: https://containers.dev/
