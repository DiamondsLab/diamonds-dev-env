import { expect } from 'chai';
import { JsonRpcProvider } from 'ethers';
import hre from 'hardhat';
import { before, describe, it } from 'mocha';
import {
	FuzzTargetFunction,
	MedusaFuzzConfig,
	MedusaFuzzingFramework,
} from './MedusaFuzzingFramework';

describe('MedusaFuzzingFramework', function () {
	this.timeout(60000); // 60 second timeout for deployment tests

	let provider: JsonRpcProvider;
	let chainId: bigint;

	before(async function () {
		provider = hre.ethers.provider as unknown as JsonRpcProvider;
		const network = await provider.getNetwork();
		chainId = network.chainId;
	});

	describe('Constructor', function () {
		it('should initialize with valid configuration', async function () {
			const targetFunctions: FuzzTargetFunction[] = [
				{
					facet: 'ExampleConstantsFacet',
					functionName: 'testFunction',
					selector: '0x12345678',
				},
			];

			const config: MedusaFuzzConfig = {
				diamondName: 'ExampleDiamond',
				networkName: 'hardhat',
				provider: provider,
				chainId: chainId,
				configFilePath: 'diamonds/ExampleDiamond/examplediamond.config.json',
				targetFunctions: targetFunctions,
				writeDeployedDiamondData: false,
			};

			const framework = new MedusaFuzzingFramework(config);
			expect(framework).to.be.instanceOf(MedusaFuzzingFramework);
		});

		it('should accept medusa options', async function () {
			const targetFunctions: FuzzTargetFunction[] = [
				{
					facet: 'TestFacet',
					functionName: 'testFunction',
					selector: '0x12345678',
				},
			];

			const config: MedusaFuzzConfig = {
				diamondName: 'ExampleDiamond',
				networkName: 'hardhat',
				provider: provider,
				chainId: chainId,
				configFilePath: 'diamonds/ExampleDiamond/examplediamond.config.json',
				targetFunctions: targetFunctions,
				medusaOptions: {
					workers: 5,
					testLimit: 10000,
					timeout: 300,
					corpusDirectory: './test-corpus',
				},
			};

			const framework = new MedusaFuzzingFramework(config);
			expect(framework).to.be.instanceOf(MedusaFuzzingFramework);
		});
	});

	describe('Configuration Methods', function () {
		it('should generate valid medusa.json configuration', async function () {
			const targetFunctions: FuzzTargetFunction[] = [
				{
					facet: 'ExampleConstantsFacet',
					functionName: 'testFunction',
					selector: '0x12345678',
				},
			];

			const config: MedusaFuzzConfig = {
				diamondName: 'ExampleDiamond',
				networkName: 'hardhat',
				provider: provider,
				chainId: chainId,
				configFilePath: 'diamonds/ExampleDiamond/examplediamond.config.json',
				targetFunctions: targetFunctions,
				medusaOptions: {
					workers: 10,
					testLimit: 50000,
				},
			};

			const framework = new MedusaFuzzingFramework(config);
			const configPath = framework.generateMedusaConfig();

			expect(configPath).to.include('medusa.json');

			// Verify config file exists
			const fs = await import('fs');
			expect(fs.existsSync(configPath)).to.be.true;

			// Clean up
			fs.unlinkSync(configPath);
		});
	});

	describe('Verbose Mode', function () {
		it('should allow setting verbose mode', async function () {
			const targetFunctions: FuzzTargetFunction[] = [
				{
					facet: 'TestFacet',
					functionName: 'testFunction',
					selector: '0x12345678',
				},
			];

			const config: MedusaFuzzConfig = {
				diamondName: 'ExampleDiamond',
				networkName: 'hardhat',
				provider: provider,
				chainId: chainId,
				configFilePath: 'diamonds/ExampleDiamond/examplediamond.config.json',
				targetFunctions: targetFunctions,
			};

			const framework = new MedusaFuzzingFramework(config);
			framework.setVerbose(false);
			framework.setVerbose(true);

			// Should not throw
			expect(framework).to.be.instanceOf(MedusaFuzzingFramework);
		});
	});

	// Note: Full integration tests with actual Diamond deployment
	// are in the integration test suite to avoid timeout issues
});
