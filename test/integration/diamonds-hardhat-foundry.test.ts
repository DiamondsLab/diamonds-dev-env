import { expect } from 'chai';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';

/**
 * Integration Tests for diamonds-hardhat-foundry module
 *
 * These tests verify the complete workflow of the module including:
 * - File structure validation
 * - Documentation completeness
 * - Module exports
 * - Configuration validation
 *
 * Note: Most end-to-end tests require:
 * - Foundry installed
 * - LocalDiamondDeployer available in workspace
 * - Hardhat configuration with diamondsFoundry settings
 *
 * These are kept as placeholders for future implementation when
 * the full Hardhat environment is available in the test context.
 */
describe('diamonds-hardhat-foundry Integration', () => {
	// Find package root - handle both running from workspace root and from package directory
	const findPackageRoot = (): string => {
		const cwd = process.cwd();

		// Check if we're already in the package directory
		if (cwd.endsWith('diamonds-hardhat-foundry')) {
			return cwd;
		}

		// Check if package exists in standard workspace location
		const workspacePackagePath = join(cwd, 'packages/diamonds-hardhat-foundry');
		if (existsSync(workspacePackagePath)) {
			return workspacePackagePath;
		}

		// Check if we're in workspace root and package is a sibling
		const parentDir = join(cwd, '..');
		const siblingPath = join(parentDir, 'diamonds-hardhat-foundry');
		if (existsSync(siblingPath)) {
			return siblingPath;
		}

		throw new Error(`Cannot find diamonds-hardhat-foundry package from ${cwd}`);
	};

	const packageRoot = findPackageRoot();
	let testRoot: string;

	before(() => {
		console.log('=== Integration Test Suite ===');
		console.log('Testing diamonds-hardhat-foundry module structure and documentation');
		console.log(`Package root: ${packageRoot}`);
	});

	beforeEach(() => {
		testRoot = join(process.cwd(), '.test-integration');
		if (existsSync(testRoot)) {
			rmSync(testRoot, { recursive: true, force: true });
		}
		mkdirSync(testRoot, { recursive: true });
	});

	afterEach(() => {
		if (existsSync(testRoot)) {
			rmSync(testRoot, { recursive: true, force: true });
		}
	});

	describe('Task: diamonds-forge:init', () => {
		it('should have init task implementation', () => {
			const tasksPath = join(packageRoot, 'src/tasks');
			expect(existsSync(tasksPath), 'tasks directory should exist').to.be.true;

			// Verify tasks are exported from index
			const indexPath = join(packageRoot, 'dist/index.js');
			const indexContent = readFileSync(indexPath, 'utf-8');
			expect(indexContent).to.include('./tasks/init');
		});

		it('should have directory structure constants defined', () => {
			// Verify the init task file exists and has expected structure
			const initTaskPath = join(packageRoot, 'src/tasks/init.ts');
			expect(existsSync(initTaskPath), 'init.ts task should exist').to.be.true;

			const initContent = readFileSync(initTaskPath, 'utf-8');
			expect(initContent).to.include('helpers');
			expect(initContent).to.include('examples');
		});

		it('should support custom helpers directory configuration', () => {
			// Verify init task accepts helpersDir parameter
			const initTaskPath = join(packageRoot, 'src/tasks/init.ts');
			const initContent = readFileSync(initTaskPath, 'utf-8');
			expect(initContent).to.include('helpersDir');
		});
	});

	describe('Task: diamonds-forge:deploy', () => {
		it('should have deploy task implementation', () => {
			const deployTaskPath = join(packageRoot, 'src/tasks/deploy.ts');
			expect(existsSync(deployTaskPath), 'deploy.ts task should exist').to.be.true;

			const deployContent = readFileSync(deployTaskPath, 'utf-8');
			expect(deployContent).to.include('DeploymentManager');
		});

		it('should support save-deployment flag', () => {
			const testTaskPath = join(packageRoot, 'src/tasks/test.ts');
			const testContent = readFileSync(testTaskPath, 'utf-8');
			// The flag is in test.ts, not deploy.ts
			expect(testContent).to.include('saveDeployment');
		});

		it('should have DeploymentManager for managing deployments', () => {
			const deploymentManagerPath = join(
				packageRoot,
				'dist/framework/DeploymentManager.js',
			);
			expect(existsSync(deploymentManagerPath), 'DeploymentManager should exist').to.be
				.true;

			const managerContent = readFileSync(deploymentManagerPath, 'utf-8');
			expect(managerContent).to.include('deploy');
			expect(managerContent).to.include('DeploymentManager');
		});
	});

	describe('Task: diamonds-forge:generate-helpers', () => {
		it('should have HelperGenerator implementation', () => {
			const helperGenPath = join(packageRoot, 'dist/framework/HelperGenerator.js');
			expect(existsSync(helperGenPath), 'HelperGenerator should exist').to.be.true;

			const genContent = readFileSync(helperGenPath, 'utf-8');
			expect(genContent).to.include('generateDeploymentHelpers');
			expect(genContent).to.include('DiamondDeployment');
		});

		it('should generate Solidity helpers with facet addresses', () => {
			const helperGenPath = join(packageRoot, 'src/framework/HelperGenerator.ts');
			const genContent = readFileSync(helperGenPath, 'utf-8');

			// Verify it generates facet address constants
			expect(genContent).to.include('address');
			expect(genContent).to.include('constant');
		});

		it('should generate DiamondDeployment.sol programmatically', () => {
			const helperGenPath = join(packageRoot, 'src/framework/HelperGenerator.ts');
			const genContent = readFileSync(helperGenPath, 'utf-8');

			// Verify it generates the library source code dynamically
			expect(genContent).to.include('generateLibrarySource');
			expect(genContent).to.include('DiamondDeployment.sol');
		});
	});

	describe('Task: diamonds-forge:test', () => {
		it('should have test task implementation', () => {
			const testTaskPath = join(packageRoot, 'src/tasks/test.ts');
			expect(existsSync(testTaskPath), 'test.ts task should exist').to.be.true;

			const testContent = readFileSync(testTaskPath, 'utf-8');
			expect(testContent).to.include('ForgeFuzzingFramework');
		});

		it('should support forge test parameters', () => {
			const testTaskPath = join(packageRoot, 'src/tasks/test.ts');
			const testContent = readFileSync(testTaskPath, 'utf-8');

			// Verify it passes through forge test options
			expect(testContent).to.include('matchTest');
			expect(testContent).to.include('gasReport');
		});

		it('should have ForgeFuzzingFramework for test orchestration', () => {
			const frameworkPath = join(packageRoot, 'dist/framework/ForgeFuzzingFramework.js');
			expect(existsSync(frameworkPath), 'ForgeFuzzingFramework should exist').to.be.true;

			const frameworkContent = readFileSync(frameworkPath, 'utf-8');
			expect(frameworkContent).to.include('runTests');
		});
	});

	describe('Programmatic API', () => {
		it('should have package.json with correct exports', () => {
			const packageJsonPath = join(packageRoot, 'package.json');
			expect(existsSync(packageJsonPath), 'package.json should exist').to.be.true;

			const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
			expect(packageJson.name).to.equal('@diamondslab/diamonds-hardhat-foundry');
			expect(packageJson.main).to.exist;
		});

		it('should have compiled JavaScript in dist directory', () => {
			const distPath = join(packageRoot, 'dist');
			expect(existsSync(distPath), 'dist directory should exist').to.be.true;

			const indexPath = join(distPath, 'index.js');
			expect(existsSync(indexPath), 'dist/index.js should exist').to.be.true;
		});

		it('should have framework classes in dist', () => {
			const frameworkPath = join(packageRoot, 'dist/framework');
			expect(existsSync(frameworkPath), 'dist/framework should exist').to.be.true;

			const deploymentManagerPath = join(frameworkPath, 'DeploymentManager.js');
			const helperGeneratorPath = join(frameworkPath, 'HelperGenerator.js');
			const forgeFuzzingPath = join(frameworkPath, 'ForgeFuzzingFramework.js');

			expect(existsSync(deploymentManagerPath), 'DeploymentManager.js should exist').to.be
				.true;
			expect(existsSync(helperGeneratorPath), 'HelperGenerator.js should exist').to.be.true;
			expect(existsSync(forgeFuzzingPath), 'ForgeFuzzingFramework.js should exist').to.be
				.true;
		});
	});

	describe('Configuration', () => {
		it('should have TypeScript configuration', () => {
			const tsconfigPath = join(packageRoot, 'tsconfig.json');
			expect(existsSync(tsconfigPath), 'tsconfig.json should exist').to.be.true;

			const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
			expect(tsconfig.compilerOptions).to.exist;
			expect(tsconfig.compilerOptions.outDir).to.equal('./dist');
		});

		it('should have proper file structure', () => {
			const srcPath = join(packageRoot, 'src');
			const contractsPath = join(packageRoot, 'contracts');
			const testsPath = join(packageRoot, 'test');

			expect(existsSync(srcPath), 'src directory should exist').to.be.true;
			expect(existsSync(contractsPath), 'contracts directory should exist').to.be.true;
			expect(existsSync(testsPath), 'test directory should exist').to.be.true;
		});
	});

	describe('File Generation', () => {
		it('should have Solidity contract templates', () => {
			const contractsPath = join(packageRoot, 'contracts');

			const diamondForgeHelpersPath = join(contractsPath, 'DiamondForgeHelpers.sol');
			const diamondABILoaderPath = join(contractsPath, 'DiamondABILoader.sol');
			const diamondFuzzBasePath = join(contractsPath, 'DiamondFuzzBase.sol');

			expect(existsSync(diamondForgeHelpersPath), 'DiamondForgeHelpers.sol should exist').to
				.be.true;
			expect(existsSync(diamondABILoaderPath), 'DiamondABILoader.sol should exist').to.be
				.true;
			expect(existsSync(diamondFuzzBasePath), 'DiamondFuzzBase.sol should exist').to.be
				.true;
		});

		it('should have snapshot support in DiamondForgeHelpers', () => {
			const helpersPath = join(packageRoot, 'contracts/DiamondForgeHelpers.sol');
			const content = readFileSync(helpersPath, 'utf-8');

			expect(content).to.include('snapshotState');
			expect(content).to.include('revertToSnapshot');
			expect(content).to.include('vm.snapshotState()');
			expect(content).to.include('vm.revertToState(');
		});
	});

	describe('README Documentation', () => {
		it('should have comprehensive README', () => {
			const readmePath = join(packageRoot, 'README.md');
			expect(existsSync(readmePath), 'README.md should exist').to.be.true;

			const readme = readFileSync(readmePath, 'utf-8');
			expect(readme.length).to.be.greaterThan(1000);
		});

		it('should document Dynamic Helper Generation', () => {
			const readmePath = join(packageRoot, 'README.md');
			const readme = readFileSync(readmePath, 'utf-8');

			expect(readme).to.include('Dynamic Helper Generation');
			expect(readme).to.include('DiamondDeployment');
		});

		it('should document Deployment Management', () => {
			const readmePath = join(packageRoot, 'README.md');
			const readme = readFileSync(readmePath, 'utf-8');

			expect(readme).to.include('Deployment Management');
			expect(readme).to.include('ephemeral');
			expect(readme).to.include('persistent');
		});

		it('should document Snapshot/Restore', () => {
			const readmePath = join(packageRoot, 'README.md');
			const readme = readFileSync(readmePath, 'utf-8');

			expect(readme).to.include('Snapshot');
			expect(readme).to.include('snapshotState');
			expect(readme).to.include('revertToSnapshot');
		});

		it('should document task flags', () => {
			const readmePath = join(packageRoot, 'README.md');
			const readme = readFileSync(readmePath, 'utf-8');

			expect(readme).to.include('--save-deployment');
			expect(readme).to.include('--force-deploy');
			expect(readme).to.include('--match-test');
		});

		it('should have troubleshooting section', () => {
			const readmePath = join(packageRoot, 'README.md');
			const readme = readFileSync(readmePath, 'utf-8');

			expect(readme).to.include('Troubleshooting');
			expect(readme).to.include('Diamond has no code');
		});
	});

	describe('TESTING.md Documentation', () => {
		it('should have TESTING.md file', () => {
			const testingPath = join(packageRoot, 'TESTING.md');
			expect(existsSync(testingPath), 'TESTING.md should exist').to.be.true;
		});

		it('should document snapshot usage', () => {
			const testingPath = join(packageRoot, 'TESTING.md');
			const content = readFileSync(testingPath, 'utf-8');

			expect(content).to.include('Snapshot and Restore');
			expect(content).to.include('DiamondForgeHelpers.snapshotState()');
			expect(content).to.include('DiamondForgeHelpers.revertToSnapshot(');
		});

		it('should document fork-aware testing', () => {
			const testingPath = join(packageRoot, 'TESTING.md');
			const content = readFileSync(testingPath, 'utf-8');

			expect(content).to.include('Self-Deploying Tests');
			expect(content).to.include('Deployed Diamond Tests');
			expect(content).to.include('localhost');
		});
	});

	describe('CHANGELOG.md', () => {
		it('should have CHANGELOG.md file', () => {
			const changelogPath = join(packageRoot, 'CHANGELOG.md');
			expect(existsSync(changelogPath), 'CHANGELOG.md should exist').to.be.true;
		});

		it('should document new features', () => {
			const changelogPath = join(packageRoot, 'CHANGELOG.md');
			const content = readFileSync(changelogPath, 'utf-8');

			// Should document the new features we added
			expect(content).to.include('Dynamic Helper Generation');
			expect(content).to.include('Deployment Management');
			expect(content).to.include('Snapshot');
		});
	});
});
