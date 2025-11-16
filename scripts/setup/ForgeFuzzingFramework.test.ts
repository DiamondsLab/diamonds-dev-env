/**
 * @file ForgeFuzzingFramework.test.ts
 * @description Unit tests for ForgeFuzzingFramework
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import { ForgeFuzzingFramework } from './ForgeFuzzingFramework.js';
import type { ForgeFuzzConfig } from './ForgeFuzzingFramework.js';

describe('ForgeFuzzingFramework', () => {
	let config: ForgeFuzzConfig;

	beforeEach(async () => {
		const [signer] = await ethers.getSigners();
		const network = await ethers.provider.getNetwork();

		config = {
			diamondName: 'ExampleDiamond',
			networkName: 'hardhat',
			provider: ethers.provider,
			chainId: Number(network.chainId),
			configFilePath: 'diamonds/ExampleDiamond/examplediamond.config.json',
			writeDeployedDiamondData: true,
			forceRedeploy: false,
		};
	});

	describe('getInstance', () => {
		it('should create a new instance', async () => {
			const framework = await ForgeFuzzingFramework.getInstance(config);
			expect(framework).to.be.instanceOf(ForgeFuzzingFramework);
		});

		it('should return same instance for same config', async () => {
			const framework1 = await ForgeFuzzingFramework.getInstance(config);
			const framework2 = await ForgeFuzzingFramework.getInstance(config);
			expect(framework1).to.equal(framework2);
		});

		it('should create new instance when forceRedeploy is true', async () => {
			const framework1 = await ForgeFuzzingFramework.getInstance(config);
			const framework2 = await ForgeFuzzingFramework.getInstance({
				...config,
				forceRedeploy: true,
			});
			expect(framework1).to.not.equal(framework2);
		});
	});

	describe('validateDeployment', () => {
		it('should return false when no deployment exists', async () => {
			const framework = await ForgeFuzzingFramework.getInstance({
				...config,
				diamondName: 'NonExistentDiamond',
			});
			expect(framework.validateDeployment()).to.be.false;
		});
	});

	describe('setVerbose', () => {
		it('should set verbose mode', async () => {
			const framework = await ForgeFuzzingFramework.getInstance(config);
			framework.setVerbose(false);
			// No direct assertion, just verify no error
			expect(framework).to.be.instanceOf(ForgeFuzzingFramework);
		});
	});

	// Note: Full integration tests require actual Diamond deployment
	// which is tested in integration test suites
});
