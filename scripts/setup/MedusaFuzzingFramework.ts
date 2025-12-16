// import { DeployedDiamondData, Diamond } from '@diamondslab/diamonds';
// import { spawn } from 'child_process';
// import { debug } from 'debug';
// import { JsonRpcProvider } from 'ethers';
// import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
// import { join } from 'path';
// import { LocalDiamondDeployer, LocalDiamondDeployerConfig } from './LocalDiamondDeployer';

// const log: debug.Debugger = debug('MedusaFuzzingFramework');

// /**
//  * Configuration for a target function to fuzz
//  */
// export interface FuzzTargetFunction {
// 	facet: string;
// 	functionName: string;
// 	selector: string;
// 	inputTypes?: string[]; // Optional: Solidity types for inputs
// }

// /**
//  * Medusa-specific configuration options
//  */
// export interface MedusaOptions {
// 	workers?: number;
// 	testLimit?: number;
// 	timeout?: number;
// 	corpusDirectory?: string;
// 	deployerAddress?: string;
// 	senderAddresses?: string[];
// 	blockNumberDelayMax?: number;
// 	blockTimestampDelayMax?: number;
// }

// /**
//  * Configuration for Medusa fuzzing campaign
//  */
// export interface MedusaFuzzConfig {
// 	diamondName: string;
// 	networkName: string;
// 	provider: JsonRpcProvider;
// 	chainId: bigint | number;
// 	configFilePath: string;
// 	targetFunctions: FuzzTargetFunction[];
// 	medusaOptions?: MedusaOptions;
// 	writeDeployedDiamondData?: boolean;
// 	rpcUrl?: string;
// 	blockNumber?: number;
// }

// /**
//  * Medusa JSON configuration structure
//  */
// interface MedusaJsonConfig {
// 	fuzzing: {
// 		workers: number;
// 		testLimit: number;
// 		timeout: number;
// 		targetContracts: string[];
// 		targetContractBalances?: string[];
// 		constructorArgs?: Record<string, unknown>;
// 		deployerAddress?: string;
// 		senderAddresses?: string[];
// 		blockNumberDelayMax?: number;
// 		blockTimestampDelayMax?: number;
// 		corpusDirectory: string;
// 	};
// 	compilation: {
// 		platform: string;
// 		platformConfig: {
// 			target: string;
// 			solcVersion: string;
// 			exportDirectory?: string;
// 		};
// 	};
// 	chainConfig?: {
// 		codeSizeCheckDisabled?: boolean;
// 		cheatCodes?: {
// 			cheatCodesEnabled?: boolean;
// 			enableFFI?: boolean;
// 		};
// 	};
// }

// /**
//  * Framework for fuzzing Diamond contracts using Medusa
//  * Integrates with LocalDiamondDeployer and generates Solidity test contracts
//  */
// export class MedusaFuzzingFramework {
// 	private config: MedusaFuzzConfig;
// 	private diamond: Diamond | null = null;
// 	private deployedDiamondData: DeployedDiamondData | null = null;
// 	private diamondDeployer: LocalDiamondDeployer | null = null;
// 	private verbose: boolean = true;

// 	constructor(config: MedusaFuzzConfig) {
// 		this.config = config;
// 		log('MedusaFuzzingFramework initialized with config:', config.diamondName);
// 	}

// 	/**
// 	 * Deploy the Diamond contract using LocalDiamondDeployer
// 	 */
// 	public async deployDiamond(): Promise<Diamond> {
// 		if (this.diamond) {
// 			log('Diamond already deployed, returning existing instance');
// 			return this.diamond;
// 		}

// 		log('Deploying Diamond contract:', this.config.diamondName);

// 		const deployerConfig: LocalDiamondDeployerConfig = {
// 			diamondName: this.config.diamondName,
// 			networkName: this.config.networkName,
// 			provider: this.config.provider,
// 			chainId: this.config.chainId,
// 			writeDeployedDiamondData: this.config.writeDeployedDiamondData ?? false,
// 			configFilePath: this.config.configFilePath,
// 		};

// 		this.diamondDeployer = await LocalDiamondDeployer.getInstance(deployerConfig);
// 		await this.diamondDeployer.setVerbose(this.verbose);
// 		this.diamond = await this.diamondDeployer.getDiamondDeployed();

// 		log('Diamond deployed successfully');
// 		return this.diamond;
// 	}

// 	/**
// 	 * Get deployed Diamond data including address, facets, and selectors
// 	 */
// 	public getDeployedDiamondData(): DeployedDiamondData {
// 		if (!this.diamond) {
// 			throw new Error('Diamond not deployed. Call deployDiamond() first.');
// 		}

// 		this.deployedDiamondData ??= this.diamond.getDeployedDiamondData();

// 		return this.deployedDiamondData;
// 	}

// 	/**
// 	 * Generate Solidity test contract for Medusa fuzzing
// 	 * Implementation will be in medusaHelpers.ts
// 	 */
// 	public async generateTestContract(): Promise<string> {
// 		if (!this.diamond) {
// 			throw new Error('Diamond not deployed. Call deployDiamond() first.');
// 		}

// 		const deployedData = this.getDeployedDiamondData();
// 		const outputDir = join(process.cwd(), 'test', 'fuzzing', 'generated');

// 		// Ensure output directory exists
// 		if (!existsSync(outputDir)) {
// 			mkdirSync(outputDir, { recursive: true });
// 		}

// 		const outputPath = join(outputDir, `${this.config.diamondName}Test.sol`);
// //
// 		// Generate contract (will be implemented via medusaHelpers)
// 		const { generateSolidityTestContract } = await import('../utils/medusaHelpers');
// 		if (!deployedData.DiamondAddress) {
// 			throw new Error('Diamond address not found in deployed data');
// 		}
// 		const contractSource = generateSolidityTestContract(
// 			this.config.diamondName,
// 			deployedData.DiamondAddress,
// 			this.config.targetFunctions,
// 			deployedData,
// 		);

// 		writeFileSync(outputPath, contractSource, 'utf-8');
// 		log('Generated test contract:', outputPath);

// 		return outputPath;
// 	}

// 	/**
// 	 * Generate medusa.json configuration file
// 	 */
// 	public generateMedusaConfig(): string {
// 		const options = this.config.medusaOptions ?? {};
// 		const outputPath = join(process.cwd(), 'medusa.json');

// 		const medusaConfig: MedusaJsonConfig = {
// 			fuzzing: {
// 				workers: options.workers ?? 10,
// 				testLimit: options.testLimit ?? 50000,
// 				timeout: options.timeout ?? 0,
// 				targetContracts: [`${this.config.diamondName}Test`],
// 				targetContractBalances: ['0xffffffffffffffffffffffff'],
// 				constructorArgs: {},
// 				deployerAddress: options.deployerAddress ?? '0x30000',
// 				senderAddresses: options.senderAddresses ?? ['0x10000', '0x20000', '0x30000'],
// 				blockNumberDelayMax: options.blockNumberDelayMax ?? 60480,
// 				blockTimestampDelayMax: options.blockTimestampDelayMax ?? 604800,
// 				corpusDirectory: options.corpusDirectory ?? './medusa-corpus',
// 			},
// 			compilation: {
// 				platform: 'crytic-compile',
// 				platformConfig: {
// 					target: './test/fuzzing/generated',
// 					solcVersion: '0.8.19',
// 					exportDirectory: './crytic-export',
// 				},
// 			},
// 			chainConfig: {
// 				codeSizeCheckDisabled: true,
// 				cheatCodes: {
// 					cheatCodesEnabled: true,
// 					enableFFI: false,
// 				},
// 			},
// 		};

// 		writeFileSync(outputPath, JSON.stringify(medusaConfig, null, 2), 'utf-8');
// 		log('Generated Medusa config:', outputPath);

// 		return outputPath;
// 	}

// 	/**
// 	 * Execute Medusa fuzzing campaign
// 	 */
// 	public async runMedusa(): Promise<void> {
// 		log('Starting Medusa fuzzing campaign...');

// 		const args = ['fuzz', '--config', 'medusa.json'];

// 		// Add RPC parameters if provided
// 		if (this.config.rpcUrl) {
// 			args.push('--rpc-url', this.config.rpcUrl);
// 		}
// 		if (this.config.blockNumber) {
// 			args.push('--rpc-block', this.config.blockNumber.toString());
// 		}

// 		return new Promise((resolve, reject) => {
// 			const medusa = spawn('medusa', args, {
// 				stdio: 'inherit',
// 				env: { ...process.env },
// 			});

// 			medusa.on('close', (code) => {
// 				if (code === 0) {
// 					log('Medusa fuzzing completed successfully');
// 					resolve();
// 				} else {
// 					reject(new Error(`Medusa exited with code ${code}`));
// 				}
// 			});

// 			medusa.on('error', (err) => {
// 				reject(new Error(`Failed to start Medusa: ${err.message}`));
// 			});
// 		});
// 	}

// 	/**
// 	 * Parse Medusa results from corpus/coverage
// 	 */
// 	public parseResults(): unknown {
// 		const corpusDir = this.config.medusaOptions?.corpusDirectory ?? './medusa-corpus';
// 		const coveragePath = join(process.cwd(), corpusDir, 'coverage.json');

// 		try {
// 			if (existsSync(coveragePath)) {
// 				const coverage = JSON.parse(readFileSync(coveragePath, 'utf-8'));
// 				log('Parsed coverage results');
// 				return coverage;
// 			} else {
// 				log('No coverage file found at:', coveragePath);
// 				return null;
// 			}
// 		} catch (error) {
// 			log('Error parsing results:', error);
// 			return null;
// 		}
// 	}

// 	/**
// 	 * Set verbose logging
// 	 */
// 	public setVerbose(verbose: boolean): void {
// 		this.verbose = verbose;
// 		if (this.diamondDeployer) {
// 			this.diamondDeployer.setVerbose(verbose);
// 		}
// 	}

// 	/**
// 	 * Validate configuration before running
// 	 */
// 	private validateConfig(): void {
// 		if (!this.config.diamondName) {
// 			throw new Error('Diamond name is required');
// 		}
// 		if (!this.config.networkName) {
// 			throw new Error('Network name is required');
// 		}
// 		if (!this.config.provider) {
// 			throw new Error('Provider is required');
// 		}
// 		if (!this.config.targetFunctions || this.config.targetFunctions.length === 0) {
// 			throw new Error('At least one target function is required for fuzzing');
// 		}
// 	}

// 	/**
// 	 * Run complete fuzzing workflow: deploy, generate, configure, and fuzz
// 	 */
// 	public async runFuzzingCampaign(): Promise<void> {
// 		this.validateConfig();

// 		log('=== Starting Medusa Fuzzing Campaign ===');
// 		log('Diamond:', this.config.diamondName);
// 		log('Network:', this.config.networkName);
// 		log('Target Functions:', this.config.targetFunctions.length);

// 		// Step 1: Deploy Diamond
// 		await this.deployDiamond();

// 		// Step 2: Generate test contract
// 		await this.generateTestContract();

// 		// Step 3: Generate Medusa config
// 		this.generateMedusaConfig();

// 		// Step 4: Run Medusa
// 		await this.runMedusa();

// 		// Step 5: Parse results
// 		const results = this.parseResults();
// 		if (results) {
// 			log('Fuzzing results:', JSON.stringify(results, null, 2));
// 		}

// 		log('=== Fuzzing Campaign Complete ===');
// 	}
// }
