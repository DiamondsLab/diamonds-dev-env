# Task List: Forge Diamond Fuzzing Tests

## Relevant Files

- `test/foundry/helpers/DiamondFuzzBase.sol` - Abstract base contract providing reusable helpers for Diamond fuzzing tests
- `test/foundry/helpers/README.md` - Documentation for using the Diamond fuzzing helper library
- `test/foundry/fuzz/AccessControlFuzz.t.sol` - Fuzzing tests for ExampleAccessControl facet functions
- `scripts/foundry/deploy-diamond-local.ts` - TypeScript script to deploy Diamond to local Hardhat network
- `scripts/foundry/get-diamond-address.sh` - Shell script to retrieve deployed Diamond address for Forge tests
- `.forge-deployments/local.json` - Stored deployment addresses for local testing
- `package.json` - Updated with new test scripts for Diamond fuzzing

### Notes

- Forge tests will use `vm.parseJson()` to load the Diamond ABI from `./diamond-abi/ExampleDiamond.json`
- Diamond must be deployed to a local Hardhat network before running Forge tests
- Tests will use Forge's `--fork-url` to connect to the local Hardhat node
- The base helper contract should be abstract and reusable across different Diamond projects

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [ ] 1.0 Setup Infrastructure for Diamond Deployment
- [ ] 2.0 Create Reusable Diamond Fuzzing Base Contract
- [ ] 3.0 Implement Diamond ABI Loading Mechanism
- [ ] 4.0 Create Access Control Fuzzing Tests
- [ ] 5.0 Add Integration and Documentation
