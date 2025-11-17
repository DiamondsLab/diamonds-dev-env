/**
 * @file forge.ts
 * @description Hardhat tasks for Forge fuzzing integration
 * Provides tasks for deploying Diamonds, generating helpers, and running Forge tests
 */

import { task } from 'hardhat/config';
import type { HardhatRuntimeEnvironment } from 'hardhat/types';

// Use dynamic imports to avoid circular dependency with hardhat config

/**
 * Task: forge:deploy
 * Deploy Diamond for Forge testing using LocalDiamondDeployer
 */
task('forge:deploy', 'Deploy Diamond for Forge fuzzing tests')
	.addParam('diamond', 'Name of the Diamond contract to deploy')
	.addOptionalParam(
		'targetNetwork',
		'Network to deploy to (localhost or anvil)',
		'localhost',
	)
	.addFlag('force', 'Force redeployment even if already deployed')
	.setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
		const { diamond, targetNetwork, force } = taskArgs;

		// Dynamic import to avoid circular dependency
		const { ForgeFuzzingFramework } = await import('../setup/ForgeFuzzingFramework');

		console.log('\n🚀 Starting Forge Diamond deployment...');
		console.log(`   Diamond: ${diamond}`);
		console.log(`   Network: ${targetNetwork}`);
		console.log('');

		try {
			const network = await hre.ethers.provider.getNetwork();
			const chainId = Number(network.chainId);
			const [signer] = await hre.ethers.getSigners();

			// Determine RPC URL based on network
			const rpcUrl =
				targetNetwork === 'anvil'
					? 'http://127.0.0.1:8545' // Anvil default
					: 'http://127.0.0.1:8545'; // Hardhat node default

			const config = {
				diamondName: diamond,
				networkName: hre.network.name,
				provider: hre.ethers.provider,
				chainId: BigInt(chainId),
				configFilePath: `diamonds/${diamond}/${diamond.toLowerCase()}.config.json`,
				writeDeployedDiamondData: true,
				forceRedeploy: force,
				rpcUrl,
			};

			const framework = await ForgeFuzzingFramework.getInstance(config);
			framework.setVerbose(true);

			// Deploy Diamond
			console.log('💎 Deploying Diamond contract...');
			const deployedDiamond = await framework.deployDiamond();
			const deploymentData = framework.getDeployedDiamondData();

			// Generate helper library
			console.log('\n📝 Generating Solidity helper library...');
			const helperPath = await framework.generateHelperLibrary();

			// Display summary
			console.log('\n✅ Deployment completed successfully!\n');
			console.log('📊 Deployment Summary:');
			console.log(`   💎 Diamond Address: ${deploymentData.DiamondAddress}`);
			console.log(`   🎯 Network: ${hre.network.name}`);
			console.log(`   ⛓️  Chain ID: ${chainId}`);

			const facetCount = Object.keys(deploymentData.DeployedFacets ?? {}).length;
			console.log(`   📦 Facets Deployed: ${facetCount}`);
			console.log(`   📝 Helper Library: ${helperPath}`);
			console.log('');

			// List facets
			if (deploymentData.DeployedFacets) {
				console.log('📦 Deployed Facets:');
				for (const [facetName, facetData] of Object.entries(
					deploymentData.DeployedFacets,
				)) {
					const facet = facetData as { address?: string };
					console.log(`   - ${facetName}: ${facet.address}`);
				}
				console.log('');
			}

			console.log('🎉 Ready for Forge testing!');
			console.log('   Run: forge test');
			console.log('   Or: npx hardhat forge:fuzz --diamond', diamond);
			console.log('');
		} catch (error) {
			console.error('\n❌ Deployment failed\n');
			if (error instanceof Error) {
				console.error('Error:', error.message);
			} else {
				console.error('Unknown error:', error);
			}
			process.exit(1);
		}
	});

/**
 * Task: forge:generate-helpers
 * Generate Solidity helper library from existing deployment
 */
task('forge:generate-helpers', 'Generate Solidity helper library from Diamond deployment')
	.addParam('diamond', 'Name of the Diamond contract')
	.addOptionalParam('targetNetwork', 'Network deployment to use', 'localhost')
	.setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
		const { diamond, targetNetwork } = taskArgs;

		// Dynamic import to avoid circular dependency
		const { ForgeFuzzingFramework } = await import('../setup/ForgeFuzzingFramework');

		console.log('\n📝 Generating Solidity helper library...');
		console.log(`   Diamond: ${diamond}`);
		console.log(`   Network: ${targetNetwork}`);
		console.log('');

		try {
			const network = await hre.ethers.provider.getNetwork();
			const chainId = Number(network.chainId);

			const config = {
				diamondName: diamond,
				networkName: hre.network.name,
				provider: hre.ethers.provider,
				chainId: BigInt(chainId),
				configFilePath: `diamonds/${diamond}/${diamond.toLowerCase()}.config.json`,
				writeDeployedDiamondData: false, // Don't redeploy
			};

			const framework = await ForgeFuzzingFramework.getInstance(config);

			// Validate deployment exists
			if (!framework.validateDeployment()) {
				console.error('❌ No deployment found for', diamond, 'on', hre.network.name);
				console.error('   Run: npx hardhat forge:deploy --diamond', diamond);
				process.exit(1);
			}

			// Need to get the diamond instance to access deployment data
			// This loads from the deployment record without redeploying
			await framework.deployDiamond();

			const helperPath = await framework.generateHelperLibrary();

			console.log('✅ Helper library generated successfully!');
			console.log(`   Output: ${helperPath}`);
			console.log('');
		} catch (error) {
			console.error('\n❌ Generation failed\n');
			if (error instanceof Error) {
				console.error('Error:', error.message);
			} else {
				console.error('Unknown error:', error);
			}
			process.exit(1);
		}
	});

/**
 * Task: forge:fuzz
 * Run Forge fuzzing tests
 */
task('forge:fuzz', 'Run Forge fuzzing tests for Diamond')
	.addParam('diamond', 'Name of the Diamond contract to test')
	.addOptionalParam('targetNetwork', 'Network to use', 'localhost')
	.addOptionalParam('matchTest', 'Filter tests by name pattern')
	.addFlag('force', 'Force redeployment before testing')
	.setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
		const { diamond, targetNetwork, matchTest, force } = taskArgs;

		// Dynamic import to avoid circular dependency
		const { ForgeFuzzingFramework } = await import('../setup/ForgeFuzzingFramework');

		console.log('\n🧪 Starting Forge fuzzing tests...');
		console.log(`   Diamond: ${diamond}`);
		console.log(`   Network: ${targetNetwork}`);
		if (matchTest) {
			console.log(`   Test Filter: ${matchTest}`);
		}
		console.log('');

		try {
			const network = await hre.ethers.provider.getNetwork();
			const chainId = Number(network.chainId);

			// Determine RPC URL based on network
			const rpcUrl =
				targetNetwork === 'anvil' ? 'http://127.0.0.1:8545' : 'http://127.0.0.1:8545';

			const config = {
				diamondName: diamond,
				networkName: hre.network.name,
				provider: hre.ethers.provider,
				chainId: BigInt(chainId),
				configFilePath: `diamonds/${diamond}/${diamond.toLowerCase()}.config.json`,
				writeDeployedDiamondData: !force, // Don't write if forcing redeploy
				forceRedeploy: force,
				rpcUrl,
				forgeOptions: {
					matchTest: matchTest,
					verbosity: 2, // -vv
				},
			};

			const framework = await ForgeFuzzingFramework.getInstance(config);
			framework.setVerbose(true);

			// Check if deployment exists, deploy if needed or forced
			if (!framework.validateDeployment() || force) {
				console.log('💎 Deploying Diamond...');
				await framework.deployDiamond();
				console.log('📝 Generating helper library...');
				await framework.generateHelperLibrary();
				console.log('');
			} else {
				console.log('✅ Using existing deployment');
				console.log('');
			}

			// Run Forge tests
			console.log('🧪 Running Forge tests...\n');
			await framework.runForgeTests();

			console.log('\n✅ Fuzzing tests completed successfully!\n');
		} catch (error) {
			console.error('\n❌ Fuzzing tests failed\n');
			if (error instanceof Error) {
				console.error('Error:', error.message);
			} else {
				console.error('Unknown error:', error);
			}
			process.exit(1);
		}
	});
