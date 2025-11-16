/**
 * @file ForgeFuzzingFramework.ts
 * @description Framework for fuzzing Diamond contracts using Foundry Forge
 * Integrates with LocalDiamondDeployer and generates Solidity test helpers
 * Mirrors architecture of MedusaFuzzingFramework for consistency
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';
import type { Provider, JsonRpcProvider } from 'ethers';
import debug from 'debug';
import type { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { LocalDiamondDeployer } from './LocalDiamondDeployer';
import type { Diamond, DeployedDiamondData } from '@diamondslab/diamonds';
import { generateSolidityHelperLibrary } from '../utils/forgeHelpers';

const log: debug.Debugger = debug('ForgeFuzzingFramework');

/**
 * Forge-specific configuration options
 */
export interface ForgeOptions {
	workers?: number;
	testLimit?: number;
	timeout?: number;
	matchTest?: string;
	verbosity?: number;
}

/**
 * Configuration for Forge fuzzing campaign
 */
export interface ForgeFuzzConfig {
	diamondName: string;
	networkName: string;
	provider: Provider | JsonRpcProvider;
	chainId: bigint | number;
	configFilePath: string;
	forgeOptions?: ForgeOptions;
	writeDeployedDiamondData?: boolean;
	rpcUrl?: string;
	forceRedeploy?: boolean;
}

/**
 * Framework for fuzzing Diamond contracts using Foundry Forge
 * Integrates with LocalDiamondDeployer and generates Solidity helper libraries
 */
export class ForgeFuzzingFramework {
	private static instances: Map<string, ForgeFuzzingFramework> = new Map();
	private config: ForgeFuzzConfig;
	private diamond: Diamond | null = null;
	private deployedDiamondData: DeployedDiamondData | null = null;
	private diamondDeployer: LocalDiamondDeployer | null = null;
	private verbose: boolean = true;

	private constructor(config: ForgeFuzzConfig) {
		this.config = config;
		log('ForgeFuzzingFramework initialized with config:', config.diamondName);
	}

	/**
	 * Get or create singleton instance of ForgeFuzzingFramework
	 */
	public static async getInstance(config: ForgeFuzzConfig): Promise<ForgeFuzzingFramework> {
		const key = `${config.diamondName}-${config.networkName}-${config.chainId}`;

		const existingInstance = this.instances.get(key);
		if (existingInstance && !config.forceRedeploy) {
			log('Returning existing ForgeFuzzingFramework instance');
			return existingInstance;
		}

		const instance = new ForgeFuzzingFramework(config);
		this.instances.set(key, instance);
		log('Created new ForgeFuzzingFramework instance');
		return instance;
	}

	/**
	 * Deploy the Diamond contract using LocalDiamondDeployer
	 */
	public async deployDiamond(): Promise<Diamond> {
		if (this.diamond && !this.config.forceRedeploy) {
			log('Diamond already deployed, returning existing instance');
			return this.diamond;
		}

		log('Deploying Diamond contract:', this.config.diamondName);

		const deployerConfig = {
			diamondName: this.config.diamondName,
			networkName: this.config.networkName,
			provider: this.config.provider,
			chainId: this.config.chainId,
			writeDeployedDiamondData: this.config.writeDeployedDiamondData ?? true,
			configFilePath: this.config.configFilePath,
		};

		this.diamondDeployer = await LocalDiamondDeployer.getInstance(deployerConfig);
		await this.diamondDeployer.setVerbose(this.verbose);
		this.diamond = await this.diamondDeployer.getDiamondDeployed();

		log('Diamond deployed successfully');
		return this.diamond;
	}

	/**
	 * Get deployed Diamond data including address, facets, and selectors from deployment record
	 */
	public getDeployedDiamondData(): DeployedDiamondData {
		if (!this.diamond) {
			throw new Error('Diamond not deployed. Call deployDiamond() first.');
		}

		this.deployedDiamondData ??= this.diamond.getDeployedDiamondData();

		return this.deployedDiamondData;
	}

	/**
	 * Generate Solidity helper library from deployment data
	 */
	public async generateHelperLibrary(): Promise<string> {
		if (!this.diamond) {
			throw new Error('Diamond not deployed. Call deployDiamond() first.');
		}

		const deployedData = this.getDeployedDiamondData();

		// Validate deployment data
		if (!deployedData.DiamondAddress || deployedData.DiamondAddress === '') {
			throw new Error('Invalid deployment data: missing Diamond address');
		}

		if (
			!deployedData.DeployedFacets ||
			Object.keys(deployedData.DeployedFacets).length === 0
		) {
			throw new Error('Invalid deployment data: no facets deployed');
		}

		log('Generating Solidity helper library...');

		const outputPath = await generateSolidityHelperLibrary(
			this.config.diamondName,
			this.config.networkName,
			this.config.chainId,
			deployedData.DiamondAddress,
			deployedData,
		);

		log('Helper library generated successfully at:', outputPath);
		return outputPath;
	}

	/**
	 * Execute Forge tests via child process
	 */
	public async runForgeTests(): Promise<void> {
		const options = this.config.forgeOptions ?? {};

		log('Running Forge tests...');

		const args = ['test'];

		// Add verbosity
		if (options.verbosity) {
			args.push(`-${'v'.repeat(options.verbosity)}`);
		} else {
			args.push('-vv'); // Default verbosity
		}

		// Add test filter if specified
		if (options.matchTest) {
			args.push('--match-test', options.matchTest);
		}

		return new Promise((resolve, reject) => {
			const forgeProcess = spawn('forge', args, {
				cwd: process.cwd(),
				stdio: 'inherit',
				env: {
					...process.env,
					HARDHAT_RPC_URL: this.config.rpcUrl ?? 'http://127.0.0.1:8545',
				},
			});

			forgeProcess.on('close', (code) => {
				if (code === 0) {
					log('Forge tests completed successfully');
					resolve();
				} else {
					reject(new Error(`Forge tests failed with exit code ${code}`));
				}
			});

			forgeProcess.on('error', (error) => {
				reject(new Error(`Failed to start Forge: ${error.message}`));
			});
		});
	}

	/**
	 * Validate that deployment record exists and is valid
	 */
	public validateDeployment(): boolean {
		try {
			const deploymentFileName = `${this.config.diamondName.toLowerCase()}-${this.config.networkName.toLowerCase()}-${this.config.chainId.toString()}.json`;
			const deploymentPath = join(
				process.cwd(),
				'diamonds',
				this.config.diamondName,
				'deployments',
				deploymentFileName,
			);

			if (!existsSync(deploymentPath)) {
				log('Deployment record not found at:', deploymentPath);
				return false;
			}

			// Try to get deployment data to validate it's readable
			if (this.diamond) {
				const data = this.getDeployedDiamondData();
				if (!data.DiamondAddress || data.DiamondAddress === '') {
					log('Invalid deployment data: missing Diamond address');
					return false;
				}
			}

			log('Deployment record validated successfully');
			return true;
		} catch (error) {
			log('Deployment validation failed:', error);
			return false;
		}
	}

	/**
	 * Set verbose logging
	 */
	public setVerbose(verbose: boolean): void {
		this.verbose = verbose;
	}

	/**
	 * Run complete fuzzing workflow: deploy, generate helpers, and run tests
	 */
	public async runFuzzingCampaign(): Promise<void> {
		try {
			log('Starting Forge fuzzing campaign...');

			// Validate configuration
			this.validateConfig();

			// Deploy Diamond if needed
			if (!this.validateDeployment() || this.config.forceRedeploy) {
				log('Deploying Diamond...');
				await this.deployDiamond();
			} else {
				log('Using existing deployment');
			}

			// Generate helper library
			log('Generating Solidity helper library...');
			await this.generateHelperLibrary();

			// Run Forge tests
			log('Running Forge tests...');
			await this.runForgeTests();

			log('Fuzzing campaign completed successfully');
		} catch (error) {
			log('Fuzzing campaign failed:', error);
			throw error;
		}
	}

	/**
	 * Validate configuration before running
	 */
	private validateConfig(): void {
		if (!this.config.diamondName || this.config.diamondName === '') {
			throw new Error('Diamond name is required');
		}

		if (!this.config.networkName || this.config.networkName === '') {
			throw new Error('Network name is required');
		}

		if (!this.config.provider) {
			throw new Error('Provider is required');
		}

		if (!this.config.configFilePath) {
			throw new Error('Config file path is required');
		}

		log('Configuration validated successfully');
	}
}
