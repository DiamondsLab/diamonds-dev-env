# Task List: Epic 5 - Security Scanning Pipeline

## Relevant Files

- `.github/workflows/ci.yml` - Main CI/CD workflow file to add security scanning jobs
- `.github/workflows/security-scanning.yml` - Standalone security scanning workflow (optional alternative)
- `slither.config.json` - Slither configuration for Diamond-specific exclusions
- `.github/security-exceptions.yml` - Document approved security exceptions (to be created)
- `README.md` - Update with security scanning documentation and badges
- `docs/SECURITY_SCANNING.md` - Comprehensive security scanning documentation (to be created)
- `.gitignore` - Ensure security reports are not committed

### Notes

- Security tools run in parallel for optimal performance
- Phase 1 tools (git-secrets, Slither, npm audit) block PR merges on high/critical findings
- Phase 2 tools (Snyk, Semgrep, OSV-Scanner) report warnings only initially
- All reports uploaded as GitHub Actions artifacts with 30-day retention
- SARIF reports integrated with GitHub Code Scanning for centralized visibility
- DevContainer must include all required security tools

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

**CRITICAL WORKFLOW RULE:** Do NOT start the next sub-task until you ask the user for permission and they say "yes" or "y". After completing each sub-task, mark it complete and wait for user approval before proceeding.

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch for this feature: `git checkout -b feature/epic5-security-scanning-pipeline`
  - [x] 0.2 Verify current branch is correct: `git branch --show-current`

- [x] 1.0 Prerequisites and Environment Setup
  - [x] 1.1 Read existing `.github/workflows/ci.yml` to understand current workflow structure
  - [x] 1.2 Verify DevContainer includes required security tools (Slither, Semgrep, git-secrets, OSV-Scanner)
  - [x] 1.3 Check if `SNYK_TOKEN` GitHub Secret exists at https://github.com/DiamondsLab/diamonds-dev-env/settings/secrets/actions
  - [x] 1.4 If `SNYK_TOKEN` missing, document the requirement in a temporary note for later configuration
  - [x] 1.5 Review existing `slither.config.json` for any Diamond-specific exclusions needed
  - [x] 1.6 Run `git secrets --scan` locally to verify git-secrets is working properly
  - [ ] 1.7 Commit any prerequisite configuration changes with message: `chore: verify security tool prerequisites`

- [x] 2.0 Phase 1: Implement Critical Security Tools (git-secrets, Slither, npm audit)
  - [x] 2.1 Add git-secrets job to `.github/workflows/ci.yml` with proper job definition
  - [x] 2.2 Configure git-secrets job to run `git secrets --scan` on full repository
  - [x] 2.3 Set git-secrets job to block PR merge (`continue-on-error: false`)
  - [x] 2.4 Add artifact upload step for git-secrets report
  - [x] 2.5 Add Slither job to workflow with dependency on compile job
  - [x] 2.6 Configure Slither to generate both JSON and SARIF outputs
  - [x] 2.7 Add conditional blocking logic for Slither (HIGH/CRITICAL only)
  - [x] 2.8 Add artifact upload step for Slither reports (JSON and SARIF)
  - [x] 2.9 Add npm audit job to workflow with dependency on compile job
  - [x] 2.10 Configure npm audit to run `yarn npm audit --severity high`
  - [x] 2.11 Set npm audit to block PR merge on HIGH/CRITICAL vulnerabilities
  - [x] 2.12 Add artifact upload step for npm audit JSON report
  - [x] 2.13 Commit Phase 1 changes with message: `feat(ci): add Phase 1 security scanning (git-secrets, Slither, npm audit)`

- [x] 3.0 Phase 2: Implement Extended Security Tools (Snyk, Semgrep, OSV-Scanner)
  - [x] 3.1 Add Snyk job to workflow with `SNYK_TOKEN` secret authentication
  - [x] 3.2 Configure Snyk to generate JSON and SARIF outputs
  - [x] 3.3 Set Snyk job as non-blocking (`continue-on-error: true`)
  - [x] 3.4 Add artifact upload steps for Snyk reports
  - [x] 3.5 Add Semgrep job to workflow for TypeScript, JavaScript, and Solidity files
  - [x] 3.6 Configure Semgrep to use community security rules
  - [x] 3.7 Configure Semgrep to generate SARIF output
  - [x] 3.8 Set Semgrep job as non-blocking (`continue-on-error: true`)
  - [x] 3.9 Add artifact upload step for Semgrep SARIF report
  - [x] 3.10 Add OSV-Scanner job to workflow for lock file scanning
  - [x] 3.11 Configure OSV-Scanner to scan `yarn.lock` and `package-lock.json`
  - [x] 3.12 Set OSV-Scanner job as non-blocking (`continue-on-error: true`)
  - [x] 3.13 Add artifact upload step for OSV-Scanner JSON report
  - [x] 3.14 Commit Phase 2 changes with message: `feat(ci): add Phase 2 security scanning (Snyk, Semgrep, OSV-Scanner)`

- [x] 4.0 GitHub Code Scanning Integration and Artifact Management
  - [x] 4.1 Add `github/codeql-action/upload-sarif@v3` step to Slither job
  - [x] 4.2 Configure Slither SARIF upload with correct category and tool name
  - [x] 4.3 Add `github/codeql-action/upload-sarif@v3` step to Snyk job
  - [x] 4.4 Configure Snyk SARIF upload with correct category and tool name
  - [x] 4.5 Add `github/codeql-action/upload-sarif@v3` step to Semgrep job
  - [x] 4.6 Configure Semgrep SARIF upload with correct category and tool name
  - [x] 4.7 Verify all artifact uploads use consistent naming: `{tool-name}-report`
  - [x] 4.8 Set artifact retention to 30 days for all security reports
  - [x] 4.9 Add conditional logic to handle SARIF upload failures gracefully
  - [ ] 4.10 Commit Code Scanning integration with message: `feat(ci): integrate security tools with GitHub Code Scanning`

- [ ] 5.0 Testing and Validation
  - [ ] 5.1 Push feature branch to remote: `git push -u origin feature/epic5-security-scanning-pipeline`
  - [ ] 5.2 Create a draft PR to trigger the security scanning workflow
  - [ ] 5.3 Verify git-secrets job runs and completes (should pass if no secrets in code)
  - [ ] 5.4 Verify Slither job runs and generates SARIF report
  - [ ] 5.5 Verify npm audit job runs and checks dependencies
  - [ ] 5.6 Check GitHub Actions artifacts are uploaded for all Phase 1 tools
  - [ ] 5.7 Verify Snyk job runs (if `SNYK_TOKEN` configured) or fails gracefully
  - [ ] 5.8 Verify Semgrep job runs and generates SARIF report
  - [ ] 5.9 Verify OSV-Scanner job runs and scans lock files
  - [ ] 5.10 Check GitHub Actions artifacts are uploaded for all Phase 2 tools
  - [ ] 5.11 Navigate to PR "Security" tab and verify SARIF findings appear in Code Scanning
  - [ ] 5.12 Test blocking behavior by introducing a mock HIGH severity issue (optional, careful!)
  - [ ] 5.13 Verify parallel execution: all security jobs run simultaneously
  - [ ] 5.14 Measure total pipeline duration (target: under 10 minutes)
  - [ ] 5.15 Fix any issues discovered during testing
  - [ ] 5.16 Commit any fixes with descriptive messages

- [ ] 6.0 Documentation and Team Onboarding
  - [ ] 6.1 Create `docs/SECURITY_SCANNING.md` with comprehensive documentation
  - [ ] 6.2 Document each security tool's purpose and what it detects
  - [ ] 6.3 Explain blocking vs. non-blocking behavior for each tool
  - [ ] 6.4 Add section on how to review security findings in GitHub Code Scanning UI
  - [ ] 6.5 Document how to download and analyze security report artifacts
  - [ ] 6.6 Create troubleshooting guide for common security finding types
  - [ ] 6.7 Document the process for requesting security exception approval
  - [ ] 6.8 Update main `README.md` with security scanning section
  - [ ] 6.9 Add security scanning status badge to README (if available)
  - [ ] 6.10 Create `.github/security-exceptions.yml` template for documenting approved exceptions
  - [ ] 6.11 Add instructions for configuring `SNYK_TOKEN` in documentation
  - [ ] 6.12 Document expected security scan duration and performance metrics
  - [ ] 6.13 Commit documentation with message: `docs: add comprehensive security scanning documentation`
  - [ ] 6.14 Update PR description with summary of changes and testing results
  - [ ] 6.15 Mark PR as ready for review (remove draft status)
  - [ ] 6.16 Request review from team maintainers
