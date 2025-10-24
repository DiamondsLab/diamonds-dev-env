# Copilot Instructions for Hardhat-Diamonds Project

These instructions guide you, the AI Coding Agent, in completing the "Hardhat-Diamonds" node module within the provided Hardhat-based development environment. You must adhere strictly to these guidelines to ensure professional, maintainable, and secure code. Follow best practices in software architecture, testing, and documentation. Do not deviate from the project structure or introduce unapproved dependencies.

## 1. Project Overview

- **Project Name**: Hardhat-Diamonds
- **Location**: The main development occurs in `./packages/hardhat-diamonds/`.
- **Purpose**: Build a professional NPM package for monitoring ERC-2535 Diamond Proxy contracts. Features include real-time monitoring, facet management, health checks, event tracking, and developer tools.
- **Dependencies**: Integrates with the "diamonds" module `node_modules/diamonds/` and the "hardhat-diamonds" module `node_modules/hardhat-diamonds/` for deployment and management of Diamond Proxies.
- **Tech Stack**:
  - **Languages**: TypeScript (primary), Solidity (for contracts).
  - **Framework**: Hardhat for Ethereum development (compilation, testing, deployment).
  - **Tools**: Yarn Workspaces (monorepo), ESLint/Prettier (linting/formatting), Husky (git hooks), GitHub Actions (CI/CD).
  - **Libraries**: Use pre-installed ones (e.g., ethers.js, chai for testing). Do not add new dependencies without explicit user approval.
- **Key Artifacts**:
  - Contracts in `./contracts/ExampleDiamond` (e.g., Diamond proxy and facets).
  - Tests in `./test/` and `./packages/hardhat-diamonds/test/`.
  - Scripts in `./scripts/` for deployment, ABI generation, etc.
  - Configuration: `.env`, `hardhat.config.ts`, `tsconfig.json`.

The project is a monorepo. Focus on completing the `hardhat-diamonds` package while ensuring integration with the overall environment. The parent monorepo project will need to be integrated and used for a variety of testing scenarios including deploying the contracts to the local Hardhat network and to testnets by using the scripts in `./scripts/deploy/rpc/`. This will also require the creation of additional test cases and new scripts to facilitate the monitor for this parent project.

## 2. Project Goals

- **Primary Objective**: Complete the `hardhat-diamonds` NPM package to be production-ready including complete integration with the `diamonds` module system.
- **Milestones**:
  1. Implement core classes.
  2. Add utilities for debugging and development.
  3. Ensure full test coverage (unit, integration, functional).
  4. Integrate with RPC deployment scripts for ERC-2535 proxies.
  5. Prepare for NPM publication (versioning, CI/CD).
- **Success Criteria**: 80%+ test coverage, passing lint/format checks, successful builds/deploys, comprehensive documentation.

## 3. Development Environment Constraints

- **Directory Structure**: Do not alter the existing structure. Key paths:
  - `./packages/hardhat-diamonds/src/`: Source code.
  - `./packages/hardhat-diamonds/dist/`: Compiled output.
  - `./contracts/`: Solidity contracts.
  - `./test/`: Hardhat tests.
  - `./scripts/`: Deployment and utility scripts.
  - `./deployments/`: Artifacts from deployments.
- **Tools and Commands**:
  - Use `yarn` for package management (e.g., `yarn install`, `yarn workspace hardhat-diamonds build`).
  - Compile contracts: `yarn compile`.
  - Run tests: `yarn test` or `yarn hardhat-diamonds:test`.
  - Lint/Format: `yarn lint`, `yarn format`.
  - Deploy: Use scripts like `npx hardhat run scripts/deploy/rpc/deploy.ts`.
  - No internet access for new installs; use existing libraries.
- **Networks**: Support local (Hardhat), testnets (Sepolia, Goerli), and mainnet. Use `.env` for RPC URLs and keys.
- **Version Control**: Assume Git. Commit messages follow Conventional Commits (e.g., `feat: add hardhat-diamonds class`).

## 4. Coding Best Practices and Methodologies

- **Architecture**:
  - Follow SOLID principles: Single Responsibility, Open-Closed, etc.
  - Use modular design: Break features into small, reusable classes/modules (e.g., separate logic from event handling).
  - Dependency Injection: Use constructors for injecting dependencies (e.g., providers, signers).
  - Error Handling: Use try-catch, custom errors, and logging. Never swallow errors.
- **TypeScript Guidelines**:
  - Strict typing: Use interfaces/types for all data structures.
  - Async/Await: Prefer over callbacks/promises for readability.
  - Immutability: Favor const over let; use readonly where possible.
  - No `any`: Always infer or specify types.
- **Solidity Guidelines** (for contracts):
  - Version: ^0.8.9 or higher.
  - Security: Follow OpenZeppelin best practices; use modifiers for access control.
  - Gas Optimization: Minimize storage operations; use immutable where possible.
  - Events: Emit for all state changes.
- **Testing Methodology**: Test-Driven Development (TDD).
  - Write tests first: Unit (isolated functions), Integration (cross-module), End-to-End (deployments).
  - Use Chai/Mocha: Expect assertions.
  - Coverage: Aim for 80%+; run `yarn coverage`.
  - Edge Cases: Test failures, invalid inputs, network errors.
- **Documentation**:
  - JSDoc: Comment all classes, methods, and parameters.
  - README: Update `./packages/hardhat-diamonds/README.md` with examples.
  - Inline Comments: Explain complex logic.
- **Code Quality**:
  - Linting: Adhere to ESLint rules.
  - Formatting: Use Prettier; run `yarn format` before commits.
  - Git Hooks: Husky enforces checks; do not bypass.
  - Refactoring: Keep methods <50 lines; extract helpers.
- **Security**:
  - No hard-coded secrets.
  - Validate inputs (e.g., addresses, selectors).
  - Use safe math libraries if needed.
  - Audit Mindset: Consider reentrancy, overflows in Solidity.
- **Performance**:
  - Optimize.
  - Batch operations in tools.
  - Use caching for repeated queries.

## 5. Workflow for Responding to User Queries

- **Understand Context**: Reference existing tests and documentation
- **Step-by-Step Reasoning**: Think aloud in comments before code.
- **Code Generation**:
  - Only generate code in requested files/directories.
  - Use descriptive variable names (e.g., `facetAddress` not `addr`).
  - Include imports explicitly.
  - End with tests if implementing features.
- **Refusals**: Do not generate code violating safety (e.g., no malicious contracts).
- **Integration with Diamonds Module**: Leverage the "diamonds" module for proxy management; extend where needed without modifying core files.
- **Testing**: Write tests for all new features and bug fixes.
- **Completion Check**: After main code, build and run tests.

## 6. Professional Methodologies

- **Agile**: Break tasks into small iterations (e.g., implement one feature + tests per response).
- **CI/CD Integration**: Ensure code passes GitHub Actions (testing, linting).
- **Versioning**: Use SemVer; update `package.json` accordingly.
- **Peer Review Mindset**: Write code as if for review – clean, commented, testable.

Follow these instructions precisely. If unclear, ask for clarification.
