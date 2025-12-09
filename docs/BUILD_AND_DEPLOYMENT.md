# Build and Deployment Process

## Overview

The Diamonds Dev Env uses TypeScript for scripts and tasks. This document explains the TypeScript configuration and module resolution strategy.

## TypeScript Configuration

The project uses **CommonJS** module format for compatibility with Hardhat's `ts-node` loader:

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node",
    "target": "ES2022",
    "outDir": "dist"
  },
  "ts-node": {
    "transpileOnly": true,
    "compilerOptions": {
      "module": "CommonJS"
    }
  }
}
```

### Why CommonJS?

Hardhat uses `ts-node` to execute TypeScript on-the-fly. While ESM (`module: "NodeNext"`) is modern, it creates compatibility issues:

1. **Import Resolution**: ESM requires `.js` extensions for relative imports, but `ts-node` needs `.ts` files
2. **Dynamic Imports**: ESM's `await import()` looks for compiled `.js` files that don't exist during ts-node execution
3. **Circular Dependencies**: Mixing CommonJS (Hardhat) and ESM creates module loading conflicts

Using CommonJS avoids these issues while maintaining full TypeScript type safety.

## Import Syntax

### Static Imports (in hardhat.config.ts)

```typescript
import "./scripts/tasks/forge"; // ✅ No file extension needed
import "./scripts/tasks/medusa"; // ✅ Works with ts-node
```

### Dynamic Imports (in task files)

```typescript
// Inside Hardhat tasks
const { ForgeFuzzingFramework } = await import(
  "../setup/ForgeFuzzingFramework" // ✅ No .js extension
);
```

## Build Process

### Standard Workflow

Hardhat tasks execute TypeScript directly using `ts-node` - **no compilation needed** for normal development:

```bash
# Deploy Diamond (TypeScript executed directly)
npx hardhat forge:deploy --diamond ExampleDiamond

# Run Forge tests (TypeScript executed directly)
npx hardhat forge:fuzz --diamond ExampleDiamond

# Run Medusa tests (TypeScript executed directly)
npx hardhat medusa:fuzz --diamond ExampleDiamond
```

### Optional Compilation

You can still compile TypeScript to JavaScript for distribution or CI/CD:

```bash
# Compile all TypeScript to dist/
yarn tsc

# Build everything (clean + compile)
yarn build
```

Compiled `.js` files in `dist/` are **not required** for Hardhat tasks to work.
cp dist/scripts/utils/medusaHelpers.js scripts/utils/
echo "✓ Copied compiled task dependencies"

````

Make it executable:

```bash
chmod +x scripts/copy-compiled-tasks.sh
````

## Forge Deployment and Testing

### Prerequisites

## Forge Fuzzing Workflow

### Prerequisites

1. Start a local Hardhat node:
   ```bash
   npx hardhat node
   ```

### Deploy Diamond for Forge Tests

```bash
npx hardhat forge:deploy --diamond ExampleDiamond --network localhost
```

This will:

1. Deploy the Diamond contract to Hardhat node
2. Generate `test/foundry/helpers/DiamondDeployment.sol`
3. Save deployment record to `diamonds/ExampleDiamond/deployments/`

### Run Forge Tests

```bash
npx hardhat forge:fuzz --diamond ExampleDiamond --network localhost
```

Or directly with Forge:

```bash
forge test --fork-url http://127.0.0.1:8545 -vv
```

## Medusa Fuzzing

### Prerequisites

Medusa requires additional dependencies:

```bash
# Install solc-select and crytic-compile
pipx install solc-select
pipx install crytic-compile

# Install and select Solidity version
solc-select install 0.8.19
solc-select use 0.8.19
```

### Run Medusa

```bash
npx hardhat medusa:fuzz --diamond ExampleDiamond --network localhost --workers 2 --limit 1000
```

**Note**: Medusa has limitations with chain forking - it cannot fork from a running Hardhat node like Forge can. Medusa uses its own EVM and is best suited for testing contracts that don't depend on external deployed state.

## Troubleshooting

### Module Resolution Issues

The project uses **CommonJS** modules for Hardhat compatibility. All imports work without file extensions:

```typescript
// ✅ Correct - no file extension
const { ForgeFuzzingFramework } = await import(
  "../setup/ForgeFuzzingFramework"
);
import "./scripts/tasks/forge";

// ❌ Incorrect - don't use .js or .ts extensions
const { ForgeFuzzingFramework } = await import(
  "../setup/ForgeFuzzingFramework.js"
);
import "./scripts/tasks/forge.ts";
```

### Forge Tests Fail: "Diamond has no code"

This means Forge can't find the Diamond at the expected address. Make sure:

1. Hardhat node is running
2. Diamond is deployed: `npx hardhat forge:deploy --diamond ExampleDiamond --network localhost`
3. Tests are run with `--fork-url`: `forge test --fork-url http://127.0.0.1:8545`
4. Or use the task: `npx hardhat forge:fuzz --diamond ExampleDiamond --network localhost`

### TypeScript Compilation Errors

If you see TypeScript errors about module resolution:

1. Check `tsconfig.json` uses `"module": "CommonJS"`
2. Verify `"moduleResolution": "node"` (not "nodenext" or "bundler")
3. Ensure no file extensions in imports

## Integration with CI/CD

For continuous integration, the workflow is simple since ts-node handles execution:

```yaml
- name: Run Forge Fuzzing
  run: |
    npx hardhat node &
    sleep 5
    npx hardhat forge:deploy --diamond ExampleDiamond --network localhost
    npx hardhat forge:fuzz --diamond ExampleDiamond --network localhost
```

Optional: Compile for distribution:

```yaml
- name: Build TypeScript
  run: yarn tsc
```

## Best Practices

1. **No build step required**: TypeScript executes directly via ts-node - just run the tasks
2. **Use the tasks**: Prefer `npx hardhat forge:fuzz` over running `forge test` directly
3. **Keep node running**: Keep the Hardhat node running for faster test iterations
4. **Check deployment**: Verify deployment records exist in `diamonds/[DiamondName]/deployments/` before running tests
5. **CommonJS consistency**: Don't mix ESM and CommonJS - stick with CommonJS for Hardhat compatibility
