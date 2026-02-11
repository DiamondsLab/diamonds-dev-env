# Snyk Token Configuration Required

## Status

⚠️ **Action Required**: `SNYK_TOKEN` GitHub Secret needs to be configured

## Purpose

The Snyk security scanning job in Phase 2 requires authentication with Snyk's API to scan for vulnerabilities in dependencies.

## Setup Instructions

### 1. Get Snyk API Token

1. Go to https://snyk.io/ and sign up/login
2. Navigate to Account Settings → General → Auth Token
3. Copy your API token

### 2. Add to GitHub Secrets

1. Go to: https://github.com/DiamondsLab/diamonds-dev-env/settings/secrets/actions
2. Click "New repository secret"
3. Name: `SNYK_TOKEN`
4. Value: Paste your Snyk API token
5. Click "Add secret"

### 3. Verify

After adding the secret, the Snyk job in `.github/workflows/ci.yml` will authenticate successfully and scan dependencies.

## Fallback

If `SNYK_TOKEN` is not configured, the Snyk job will:

- Report a warning (non-blocking)
- Allow PR to proceed
- Document the missing token in job logs

This is expected behavior for Phase 2 tools during initial rollout.

## Related

- PRD: `project/devops-improvements/Diamonds_CICD_Project_Plan/epic5/prd-epic5-security-scanning-pipeline.md`
- Epic: Epic 5 - Security Scanning Pipeline (Phase 2)
