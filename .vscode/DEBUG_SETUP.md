# VS Code Debugger Setup for Package Debugging

## Changes Made

The VS Code launch configurations have been updated to enable step-through debugging into the local workspace packages (`packages/diamonds`, `packages/hardhat-diamonds`, and `packages/hardhat-multichain`).

## Updated Configurations

The following debug configurations now support debugging into package source code:

- **All Tests**
- **Multichain Plugin Test**
- **Multichain Deployment Tests**

## Key Changes

### 1. Extended `outFiles` Array

Added package dist directories to the outFiles array so the debugger can find the compiled JavaScript:

```json
"outFiles": [
  "${workspaceFolder}/dist/**/*.js",
  "${workspaceFolder}/packages/diamonds/dist/**/*.js",
  "${workspaceFolder}/packages/hardhat-diamonds/dist/**/*.js",
  "${workspaceFolder}/packages/hardhat-multichain/dist/**/*.js"
]
```

### 2. Enhanced `resolveSourceMapLocations`

Added both the compiled JavaScript locations and source TypeScript locations for proper source map resolution. Critically, this includes the `node_modules/@diamondslab/**` path to handle symlinked packages:

```json
"resolveSourceMapLocations": [
  "${workspaceFolder}/dist/**/*.js",
  "${workspaceFolder}/node_modules/@diamondslab/**/*.js",
  "${workspaceFolder}/packages/diamonds/dist/**/*.js",
  "${workspaceFolder}/packages/diamonds/src/**/*.ts",
  "${workspaceFolder}/packages/hardhat-diamonds/dist/**/*.js",
  "${workspaceFolder}/packages/hardhat-diamonds/src/**/*.ts",
  "${workspaceFolder}/packages/hardhat-multichain/dist/**/*.js",
  "${workspaceFolder}/packages/hardhat-multichain/src/**/*.ts",
  "${workspaceFolder}/**/*.ts",
  "!**/node_modules/**",
  "${workspaceFolder}/node_modules/@diamondslab/**"
]
```

### 3. Updated `skipFiles` to Allow Symlinked Packages

Changed to skip most node_modules but explicitly allow the `@diamondslab` scoped packages:

```json
"skipFiles": [
  "<node_internals>/**",
  "${workspaceFolder}/node_modules/*/**",
  "!${workspaceFolder}/node_modules/@diamondslab/**"
]
```

```json
"skipFiles": [
  "<node_internals>/**"
]
```

## How to Use

### Setting Breakpoints

1. Open any file in the packages (e.g., `packages/diamonds/src/strategies/BaseDeploymentStrategy.ts`)
2. Click in the left gutter to set a breakpoint on the desired line
3. You can now set breakpoints at line 46 where `diamondCutFactory.deploy()` is called

### Running the Debugger

1. Open the Debug panel (Ctrl+Shift+D or Cmd+Shift+D on Mac)
2. Select **"Multichain Deployment Tests"** from the dropdown
3. Press F5 or click the green play button
4. The debugger will stop at your breakpoints in the package code

### Debugging Features Available

- **Step Over** (F10): Execute the current line and move to the next
- **Step Into** (F11): Enter into function calls, including those in packages
- **Step Out** (Shift+F11): Exit the current function
- **Continue** (F5): Continue execution until the next breakpoint
- **Variable Inspection**: Hover over variables or check the Variables panel
- **Watch Expressions**: Add expressions to monitor in the Watch panel
- **Call Stack**: View the full call stack in the Call Stack panel

## Troubleshooting

### If Breakpoints Show as Gray/Unverified

1. Ensure packages are built: `cd packages/diamonds && yarn build`
2. Check that source maps exist: `ls packages/diamonds/dist/strategies/*.js.map`
3. Restart the debug session

### If Debugger Skips Over Package Code

1. Verify `skipFiles` doesn't include the package paths
2. Check that `resolveSourceMapLocations` includes the package paths
3. Ensure `sourceMaps` is set to `true`

### If Source Files Don't Load

1. Check that the source map paths are correct relative to the dist directory
2. Verify the `sources` field in the .js.map file points to the correct location
3. Example check: `head -5 packages/diamonds/dist/strategies/BaseDeploymentStrategy.js.map`

## Building Packages

Before debugging, ensure packages are compiled with source maps:

```bash
# Build all packages
yarn workspace:build

# Or build individual packages
cd packages/diamonds && yarn build
cd packages/hardhat-diamonds && yarn build
cd packages/hardhat-multichain && yarn build
```

## Package Configuration for Debugging

The `packages/diamonds/tsconfig.json` has been configured with the following options to support debugging:

```json
{
  "compilerOptions": {
    "sourceMap": true, // Generate .js.map files
    "inlineSources": true, // Embed source content in source maps
    "declarationMap": true // Generate .d.ts.map files
  }
}
```

The `inlineSources: true` option is critical for debugging because it embeds the TypeScript source directly in the source map file, ensuring the debugger can always find the source code even when dealing with symlinked packages in `node_modules/@diamondslab`.

## Notes

- The `--preserve-symlinks` flag is used to maintain symlink resolution for workspace packages
- Source maps are generated automatically when building with the TypeScript compiler (configured in each package's tsconfig.json)
- The `inlineSources` option ensures source code is embedded in source maps for reliable debugging
- The debugger configuration explicitly allows stepping into `node_modules/@diamondslab/**` packages while skipping other node_modules
- The debugger will now be able to step into any code in the local packages, making it much easier to diagnose issues
