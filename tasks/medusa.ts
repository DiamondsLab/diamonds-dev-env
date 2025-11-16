import chalk from 'chalk';
import * as fs from 'fs';
import { task, types } from 'hardhat/config';
import type { HardhatRuntimeEnvironment } from 'hardhat/types';
import * as path from 'path';

interface MedusaFuzzTaskArgs {
	diamond: string;
	workers?: number;
	limit?: number;
	timeout?: number;
	fuzzConfig?: string;
}

interface FuzzConfigFile {
	diamondName: string;
	targetFunctions: Array<{
		facet: string;
		function: string;
		description?: string;
	}>;
	medusaOptions?: {
		workers?: number;
		testLimit?: number;
		timeout?: number;
		corpusDirectory?: string;
	};
}

task('medusa:fuzz', 'Run Medusa fuzzing tests on Diamond contract')
	.addParam('diamond', 'Name of the Diamond contract to fuzz')
	.addOptionalParam('workers', 'Number of fuzzing workers', 10, types.int)
	.addOptionalParam('limit', 'Maximum number of test cases', 50000, types.int)
	.addOptionalParam('timeout', 'Fuzzing timeout in seconds (0 = no timeout)', 0, types.int)
	.addOptionalParam('fuzzConfig', 'Path to fuzzing configuration file')
	.setAction(async (taskArgs: MedusaFuzzTaskArgs, hre: HardhatRuntimeEnvironment) => {
		const startTime = Date.now();
		console.log(chalk.cyan('\n🔮 Medusa Fuzzing Task\n'));
		console.log(chalk.blue('Diamond:'), taskArgs.diamond);
		console.log(chalk.blue('Network:'), hre.network.name);
		console.log(chalk.blue('Workers:'), taskArgs.workers);
		console.log(chalk.blue('Test Limit:'), taskArgs.limit);
		console.log(
			chalk.blue('Timeout:'),
			taskArgs.timeout === 0 ? 'None' : `${taskArgs.timeout}s\n`,
		);

		try {
			const configPath =
				taskArgs.fuzzConfig ??
				path.join('test', 'fuzzing', `${taskArgs.diamond}.fuzz.config.json`);
			console.log(chalk.blue('📄 Loading configuration...'));
			console.log(chalk.gray(`  Config: ${configPath}`));

			if (!fs.existsSync(configPath)) {
				throw new Error(`Fuzzing configuration not found at: ${configPath}`);
			}

			const configFile = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as FuzzConfigFile;
			console.log(chalk.green('✓'), 'Configuration loaded');

			if (configFile.diamondName !== taskArgs.diamond) {
				console.log(chalk.yellow(`Warning: Config diamondName doesn't match task arg`));
			}

			if (!configFile.targetFunctions || configFile.targetFunctions.length === 0) {
				throw new Error('No target functions specified');
			}

			console.log(
				chalk.green('✓'),
				`Loaded ${configFile.targetFunctions.length} target function(s)`,
			);

			console.log(chalk.blue('\n🌐 Setting up network...'));
			const provider = hre.ethers.provider;
			const networkName = hre.network.name;
			console.log(chalk.green('✓'), `Connected to ${networkName}`);

			console.log(chalk.blue('\n🔧 Initializing fuzzing framework...'));
			const { MedusaFuzzingFramework } = await import(
				'../scripts/setup/MedusaFuzzingFramework.js'
			);
			const chainId = (await provider.getNetwork()).chainId;
			const diamondConfigPath = path.join(
				'diamonds',
				taskArgs.diamond,
				`${taskArgs.diamond.toLowerCase()}.config.json`,
			);

			const framework = new MedusaFuzzingFramework({
				diamondName: taskArgs.diamond,
				networkName: networkName,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				provider: provider as any,
				chainId,
				configFilePath: diamondConfigPath,
				targetFunctions: configFile.targetFunctions.map((t) => ({
					facet: t.facet,
					functionName: t.function,
					selector: '',
				})),
				medusaOptions: {
					workers: taskArgs.workers,
					testLimit: taskArgs.limit,
					timeout: taskArgs.timeout,
					...configFile.medusaOptions,
				},
			});

			framework.setVerbose(false);
			console.log(chalk.green('✓'), 'Framework initialized');

			console.log(chalk.blue('\n🚀 Deploying Diamond...'));
			await framework.deployDiamond();
			const deploymentData = framework.getDeployedDiamondData();
			console.log(
				chalk.green('✓'),
				`Diamond deployed to: ${deploymentData?.DiamondAddress ?? 'unknown'}`,
			);

			const facetNames = deploymentData?.DeployedFacets
				? Object.keys(deploymentData.DeployedFacets).join(', ')
				: 'none';
			console.log(`  Facets: ${facetNames}`);
			console.log(chalk.blue('\n📝 Generating Solidity test contract...'));
			const testContractPath = await framework.generateTestContract();
			console.log(chalk.green('✓'), `Test contract: ${testContractPath}`);

			console.log(chalk.blue('\n⚙️  Generating Medusa configuration...'));
			await framework.generateMedusaConfig();
			const medusaConfigPath = path.join(process.cwd(), 'medusa.json');
			console.log(chalk.green('✓'), `Medusa config: ${medusaConfigPath}`);

			console.log(chalk.blue('\n🔨 Compiling contracts...'));
			await hre.run('compile');
			console.log(chalk.green('✓'), 'Contracts compiled');

			console.log(chalk.blue('\n🐙 Running Medusa fuzzer...\n'));
			console.log(chalk.cyan('═'.repeat(60)));
			await framework.runMedusa();
			console.log(chalk.cyan('═'.repeat(60)));
			console.log(chalk.green('\n✓ Medusa execution completed'));

			console.log(chalk.blue('\n📊 Parsing results...'));
			const results = framework.parseResults();
			if (results) {
				console.log(chalk.green('✓'), 'Results parsed successfully');
			} else {
				console.log(chalk.yellow('⚠'), 'No results file found');
			}

			const duration = ((Date.now() - startTime) / 1000).toFixed(2);
			console.log(chalk.cyan('\n═'.repeat(60)));
			console.log(chalk.green('✅ Fuzzing Task Complete'));
			console.log(chalk.blue('Duration:'), `${duration}s`);
			console.log(chalk.blue('Artifacts:'));
			console.log(chalk.gray(`  - Test Contract: ${testContractPath}`));
			console.log(chalk.gray(`  - Medusa Config: ${medusaConfigPath}`));
			console.log(chalk.gray(`  - Corpus: ./medusa-corpus`));
			console.log(chalk.cyan('═'.repeat(60) + '\n'));
		} catch (error) {
			console.log(chalk.red('\n❌ Fuzzing task failed:'));
			if (error instanceof Error) {
				console.log(chalk.red(error.message));
			} else {
				console.log(chalk.red(String(error)));
			}
			process.exit(1);
		}
	});
