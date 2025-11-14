#!/usr/bin/env npx hardhat run

/**
 * Test deployment script for ExampleDiamond
 * Deploys to local Hardhat node for Forge testing using LocalDiamondDeployer
 *
 * Usage:
 *   npx hardhat run scripts/test-deploy-diamond.ts --network localhost
 *   yarn test:deploy-diamond
 *
 * Task 2.0: Create Hardhat deployment script for local testing
 * Task 2.2: Uses LocalDiamondDeployer with writeDeployedDiamondData: true
 */

import chalk from 'chalk';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import hre from 'hardhat';
import { join } from 'path';
import {
	LocalDiamondDeployer,
	LocalDiamondDeployerConfig,
} from './setup/LocalDiamondDeployer';

/**
 * Deployment info interface for .forge-diamond-address file
 */
interface ForgeDeploymentInfo {
	diamondAddress: string;
	deployerAddress: string;
	networkName: string;
	chainId: number;
	deployedAt: string;
	deploymentFilePath: string;
}

/**
 * Save deployment info to .forge-diamond-address file
 * Task 2.4: Provides quick access to Diamond address for Forge tests
 */
function saveForgeDeploymentInfo(info: ForgeDeploymentInfo): void {
	const outputPath = join(process.cwd(), '.forge-diamond-address');
	const content = JSON.stringify(info, null, 2);

	writeFileSync(outputPath, content, 'utf-8');

	console.log(chalk.green('✅ Forge deployment info saved to .forge-diamond-address'));
	console.log(chalk.dim(`   Path: ${outputPath}`));
}

/**
 * Main deployment function
 * Task 2.2: Deploy using LocalDiamondDeployer
 * Task 2.3: Uses Hardhat's default test accounts
 * Task 2.6: Error handling for deployment failures
 */
async function deployForTests(): Promise<void> {
	const startTime = Date.now();

	console.log(chalk.blue('\n🚀 Starting Diamond deployment for Forge tests...\n'));

	try {
		// Get network info
		const network = await hre.ethers.provider.getNetwork();
		const chainId = Number(network.chainId);
		const networkName = hre.network.name;

		console.log(chalk.cyan('📋 Configuration:'));
		console.log(chalk.dim(`   Diamond: ExampleDiamond`));
		console.log(chalk.dim(`   Network: ${networkName}`));
		console.log(chalk.dim(`   Chain ID: ${chainId}`));
		console.log('');

		// Task 2.2: Configure LocalDiamondDeployer
		const config: LocalDiamondDeployerConfig = {
			diamondName: 'ExampleDiamond',
			networkName: networkName,
			provider: hre.ethers.provider,
			chainId: BigInt(chainId),
			writeDeployedDiamondData: true, // Writes to diamonds/ExampleDiamond/deployments/
			configFilePath: 'diamonds/ExampleDiamond/examplediamond.config.json',
		};

		// Get deployer instance
		console.log(chalk.cyan('🔧 Initializing LocalDiamondDeployer...'));
		const deployer = await LocalDiamondDeployer.getInstance(config);
		await deployer.setVerbose(true);

		// Deploy Diamond
		console.log(chalk.cyan('💎 Deploying Diamond...'));
		const diamond = await deployer.getDiamondDeployed();

		// Task 2.4: Get deployment data
		const deployedData = diamond.getDeployedDiamondData();

		// Validate deployment
		if (!deployedData.DiamondAddress || deployedData.DiamondAddress === '') {
			throw new Error('Diamond deployment failed: No Diamond address returned');
		}

		// Get deployer address
		const [signer] = await hre.ethers.getSigners();
		const deployerAddress = await signer.getAddress();

		// Path to the auto-generated deployment file
		const deploymentFilePath = `diamonds/ExampleDiamond/deployments/examplediamond-${networkName}-${chainId}.json`;

		// Task 2.4: Save simplified info for Forge
		const forgeInfo: ForgeDeploymentInfo = {
			diamondAddress: deployedData.DiamondAddress,
			deployerAddress: deployerAddress,
			networkName: networkName,
			chainId: chainId,
			deployedAt: new Date().toISOString(),
			deploymentFilePath: deploymentFilePath,
		};

		saveForgeDeploymentInfo(forgeInfo);

		// Display summary
		const duration = (Date.now() - startTime) / 1000;
		console.log('');
		console.log(chalk.green('✅ Diamond deployment completed successfully!\n'));
		console.log(chalk.cyan('📊 Deployment Summary:'));
		console.log(chalk.dim(`   💎 Diamond Address: ${deployedData.DiamondAddress}`));
		console.log(chalk.dim(`   👤 Deployer Address: ${deployerAddress}`));
		console.log(chalk.dim(`   🎯 Network: ${networkName}`));
		console.log(chalk.dim(`   ⛽ Chain ID: ${chainId}`));
		console.log(chalk.dim(`   🔢 Protocol Version: ${deployedData.protocolVersion ?? 0}`));
		console.log(chalk.dim(`   ⏱️  Duration: ${duration.toFixed(2)}s`));
		console.log('');

		// Task 2.5: Display facet addresses from deployment data
		console.log(chalk.cyan('📦 Deployment Files:'));
		console.log(chalk.dim(`   Full deployment: ${deploymentFilePath}`));
		console.log(chalk.dim(`   Forge quick ref: .forge-diamond-address`));
		console.log('');

		// Verify deployment file was created
		if (existsSync(deploymentFilePath)) {
			console.log(chalk.green(`✅ Deployment file created: ${deploymentFilePath}`));
			const deploymentFile = JSON.parse(readFileSync(deploymentFilePath, 'utf-8'));

			if (deploymentFile.DeployedFacets) {
				console.log(chalk.cyan('\n📦 Deployed Facets:'));
				Object.entries(deploymentFile.DeployedFacets).forEach(([facetName, facetData]) => {
					const typedFacetData = facetData as { address?: string };
					if (typedFacetData?.address) {
						console.log(chalk.dim(`   - ${facetName}: ${typedFacetData.address}`));
					}
				});
			}
		} else {
			console.log(chalk.yellow(`⚠️  Deployment file not found: ${deploymentFilePath}`));
		}

		console.log('');
		console.log(chalk.green('🎉 Ready for Forge testing!'));
		console.log(chalk.dim('   Forge tests can read deployment info from:'));
		console.log(chalk.dim(`   - ${deploymentFilePath} (full details)`));
		console.log(chalk.dim('   - .forge-diamond-address (quick ref)'));
		console.log('');

		process.exit(0);
	} catch (error) {
		// Task 2.6: Error handling
		console.error(chalk.red('\n❌ Diamond deployment failed\n'));
		console.error(chalk.red('Error details:'));

		if (error instanceof Error) {
			console.error(chalk.dim(`   Message: ${error.message}`));
			console.error(chalk.dim('\nStack trace:'));
			console.error(chalk.dim(error.stack ?? 'No stack trace available'));
		} else {
			console.error(chalk.dim(`   ${String(error)}`));
		}

		console.error('');
		console.error(chalk.yellow('💡 Troubleshooting tips:'));
		console.error(chalk.dim('   1. Ensure Hardhat node is running: npx hardhat node'));
		console.error(chalk.dim('   2. Check network is accessible'));
		console.error(
			chalk.dim(
				'   3. Verify config file exists: diamonds/ExampleDiamond/examplediamond.config.json',
			),
		);
		console.error(chalk.dim('   4. Check for port conflicts on 8545'));
		console.error('');

		process.exit(1);
	}
}

// Run deployment if executed directly
if (require.main === module) {
	deployForTests()
		.then(() => {
			// Success handled in function
		})
		.catch((error) => {
			console.error(chalk.red('Fatal error in deployment script:'), error);
			process.exit(1);
		});
}

export { deployForTests, ForgeDeploymentInfo, saveForgeDeploymentInfo };
