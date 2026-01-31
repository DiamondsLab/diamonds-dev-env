# Epic 6: Testing & Documentation

### 6.1 Epic Overview

| Attribute        | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| **Epic ID**      | E6                                                     |
| **Title**        | Testing & Documentation                                |
| **Objective**    | Comprehensive test coverage and complete documentation |
| **Story Points** | 13                                                     |
| **Sprint**       | Sprint 4                                               |
| **Dependencies** | Epic 5                                                 |
| **Assignee**     | TBD                                                    |

### 6.2 Features

---

#### Feature E6-F1: Unit Test Suite

**Objective:** Achieve ≥90% code coverage with unit tests.

**Test Files to Create:**

| File                                     | Tests For              |
| ---------------------------------------- | ---------------------- |
| `test/unit/lib/DiamondFlattener.test.ts` | DiamondFlattener class |
| `test/unit/lib/SourceResolver.test.ts`   | SourceResolver class   |
| `test/unit/lib/DependencyGraph.test.ts`  | DependencyGraph class  |
| `test/unit/lib/OutputFormatter.test.ts`  | OutputFormatter class  |
| `test/unit/tasks/DiamondFlatten.test.ts` | Task validation        |

**Coverage Requirements:**

| Module                      | Minimum Coverage |
| --------------------------- | ---------------- |
| DiamondFlattener.ts         | 90%              |
| SourceResolver.ts           | 90%              |
| DependencyGraph.ts          | 90%              |
| OutputFormatter.ts          | 90%              |
| diamond-flatten.ts          | 85%              |
| TaskValidation.ts (flatten) | 90%              |

**Completion Criteria:**

| #   | Criterion                       | Verification    |
| --- | ------------------------------- | --------------- |
| 1   | All test files created          | File check      |
| 2   | DiamondFlattener coverage ≥ 90% | Coverage report |
| 3   | SourceResolver coverage ≥ 90%   | Coverage report |
| 4   | DependencyGraph coverage ≥ 90%  | Coverage report |
| 5   | OutputFormatter coverage ≥ 90%  | Coverage report |
| 6   | All edge cases tested           | Code review     |
| 7   | All error paths tested          | Code review     |

---

#### Feature E6-F2: Integration Tests

**Objective:** End-to-end testing with real contracts.

**File:** `test/integration/flatten.test.ts`

**Test Fixtures Required:**

```
test/fixtures/
├── contracts/
│   ├── TestDiamond.sol
│   ├── facets/
│   │   ├── FacetA.sol
│   │   ├── FacetB.sol
│   │   └── FacetC.sol
│   ├── init/
│   │   └── DiamondInit.sol
│   └── libraries/
│       └── SharedLib.sol
├── diamonds/
│   └── TestDiamond/
│       └── TestDiamond.config.json
└── hardhat.config.ts
```

**Test Scenarios:**

1. Simple Diamond (3 facets)
2. Diamond with shared OpenZeppelin dependencies
3. Diamond with init contract
4. Diamond with circular dependencies (graceful handling)
5. CLI with --output flag
6. CLI with --verbose flag
7. Compilation verification of output

**Completion Criteria:**

| #   | Criterion                  | Verification |
| --- | -------------------------- | ------------ |
| 1   | Test fixtures created      | File check   |
| 2   | Simple Diamond test passes | Test run     |
| 3   | Shared deps test passes    | Test run     |
| 4   | Init contract test passes  | Test run     |
| 5   | CLI tests pass             | Test run     |
| 6   | Output compiles            | Test run     |

---

#### Feature E6-F3: Documentation

**Objective:** Complete documentation for users and developers.

**Files to Create/Update:**

1. **`docs/tasks/diamond-flatten.md`** - Full task documentation
2. **`README.md`** - Add flatten task section

**Documentation Requirements:**

**docs/tasks/diamond-flatten.md:**

````markdown
# diamond:flatten Task

## Overview

Flatten a Diamond contract with all facets into a single Solidity file.

## Usage

### CLI

```bash
# Output to stdout
npx hardhat diamond:flatten --diamond-name MyDiamond

# Output to file
npx hardhat diamond:flatten --diamond-name MyDiamond --output ./flattened/MyDiamond.sol

# Verbose mode
npx hardhat diamond:flatten --diamond-name MyDiamond --verbose
```
````

### Programmatic

```typescript
import { flattenDiamond } from "@diamondslab/hardhat-diamonds";

const result = await flattenDiamond(hre, {
  diamondName: "MyDiamond",
  verbose: true,
});

console.log(result.stats.totalSelectors);
```
