import { expect } from 'chai';
import { rmSync, existsSync, readFileSync } from 'fs';
import { Interface } from 'ethers';
import hre from 'hardhat';

describe('Diamond ABI Integration Tests', () => {
	const testOutputDir = './test-assets/test-output/diamond-abi';
	const diamondName = 'ExampleDiamond';

	beforeEach(() => {
		// Clean up any existing test output
		if (existsSync(testOutputDir)) {
			rmSync(testOutputDir, { recursive: true, force: true });
		}
	});

	afterEach(() => {
		// Clean up test output
		if (existsSync(testOutputDir)) {
			rmSync(testOutputDir, { recursive: true, force: true });
		}
	});

	describe('End-to-End Diamond ABI Generation', () => {
		it('should generate complete diamond ABI and TypeChain types', async function () {
			this.timeout(60000); // Increase timeout for full compilation

			try {
				// Use hardhat task instead of direct function call
				await hre.run('diamond:generate-abi-typechain', {
					diamondName: diamondName,
					outputDir: 'diamond-abi',
					typechainOutDir: 'diamond-typechain-types',
					enableVerbose: true,
				});

				// Verify the output file exists
				const outputPath = 'diamond-abi/ExampleDiamond.json';
				expect(existsSync(outputPath)).to.be.true;

				// Read and verify the generated ABI
				const abiContent = readFileSync(outputPath, 'utf8');
				const abiArtifact = JSON.parse(abiContent);

				// Extract the ABI array from the Hardhat artifact
				expect(abiArtifact).to.have.property('abi');
				expect(abiArtifact.abi).to.be.an('array');
				expect(abiArtifact.abi.length).to.be.greaterThan(0);

				// Count functions in the ABI
				const functions = abiArtifact.abi.filter((item: any) => item.type === 'function');
				expect(functions.length).to.be.greaterThan(0);

				console.log(`Generated diamond ABI with ${functions.length} functions`);
			} catch (error) {
				console.error('Integration test failed:', error);
				throw error;
			}
		});

		it('should generate valid Ethereum ABI that can be parsed by ethers', async function () {
			this.timeout(60000);

			// Use hardhat task to generate ABI
			await hre.run('diamond:generate-abi-typechain', {
				diamondName: diamondName,
				outputDir: 'diamond-abi',
				typechainOutDir: 'diamond-typechain-types',
				enableVerbose: true,
			});

			// Read the generated ABI file
			const outputPath = 'diamond-abi/ExampleDiamond.json';
			expect(existsSync(outputPath)).to.be.true;

			const abiContent = readFileSync(outputPath, 'utf8');
			const abiArtifact = JSON.parse(abiContent);

			// Extract ABI from artifact and try to create an Interface
			expect(abiArtifact).to.have.property('abi');
			expect(() => {
				const iface = new Interface(abiArtifact.abi);
				expect(iface.fragments.length).to.be.greaterThan(0);
			}).to.not.throw();
		});

		it('should include key diamond functionality in generated ABI', async function () {
			this.timeout(60000);

			// Use hardhat task to generate ABI
			await hre.run('diamond:generate-abi-typechain', {
				diamondName: diamondName,
				outputDir: 'diamond-abi',
				typechainOutDir: 'diamond-typechain-types',
				enableVerbose: true,
			});

			// Read the generated ABI file
			const outputPath = 'diamond-abi/ExampleDiamond.json';
			const abiContent = readFileSync(outputPath, 'utf8');
			const abiArtifact = JSON.parse(abiContent);

			// Extract ABI from artifact and create interface to check for functions
			expect(abiArtifact).to.have.property('abi');
			const iface = new Interface(abiArtifact.abi);

			// Check for some essential functions that should be in ExampleDiamond
			const expectedFunctions = [
				'supportsInterface', // ERC165/DiamondLoupe
			];

			const availableFunctions = iface.fragments
				.filter((f) => f.type === 'function')
				.map((f) => (f as any).name);

			for (const funcName of expectedFunctions) {
				const hasFunction = availableFunctions.some((sig) => sig.startsWith(funcName));
				expect(hasFunction, `Missing expected function: ${funcName}`).to.be.true;
			}

			console.log(`Available functions: ${availableFunctions.length}`);
			console.log(`Sample functions: ${availableFunctions.slice(0, 5).join(', ')}`);
		});

		it('should generate TypeChain types that can be imported', async function () {
			this.timeout(60000);

			// Use hardhat task to generate ABI and TypeChain types
			await hre.run('diamond:generate-abi-typechain', {
				diamondName: diamondName,
				outputDir: 'diamond-abi',
				typechainOutDir: 'diamond-typechain-types',
				enableVerbose: true,
			});

			// Check if TypeChain generated the diamond types
			const expectedTypeFiles = [
				'diamond-typechain-types/ExampleDiamond.ts',
				'diamond-typechain-types/index.ts',
				'diamond-typechain-types/common.ts',
			];

			for (const typeFile of expectedTypeFiles) {
				expect(existsSync(typeFile), `Missing TypeChain file: ${typeFile}`).to.be.true;
			}

			// Verify the main diamond type file contains expected content
			const mainTypeFile = 'diamond-typechain-types/ExampleDiamond.ts';
			if (existsSync(mainTypeFile)) {
				const content = readFileSync(mainTypeFile, 'utf8');

				// Should contain TypeScript interface definition
				expect(content).to.include('export interface');
				expect(content).to.include('ExampleDiamond');
				expect(content).to.include('ethers');
			}
		});

		it('should handle large diamond with many facets efficiently', async function () {
			this.timeout(90000); // Extra time for large diamond

			const startTime = Date.now();

			// Use hardhat task to generate ABI
			await hre.run('diamond:generate-abi-typechain', {
				diamondName: diamondName,
				outputDir: 'diamond-abi',
				typechainOutDir: 'diamond-typechain-types',
				enableVerbose: true,
			});

			const endTime = Date.now();
			const duration = endTime - startTime;

			// Read the generated ABI to get stats
			const outputPath = 'diamond-abi/ExampleDiamond.json';
			const abiContent = readFileSync(outputPath, 'utf8');
			const abiArtifact = JSON.parse(abiContent);

			// Extract ABI and count functions
			expect(abiArtifact).to.have.property('abi');
			const functions = abiArtifact.abi.filter((item: any) => item.type === 'function');
			const facetCount = 5; // Expected number of facets for ExampleDiamond

			console.log(`Generation took ${duration}ms for ${facetCount} facets`);

			// Should complete within reasonable time (adjust based on your hardware)
			expect(duration).to.be.lessThan(60000); // 60 seconds max

			// Should have reasonable number of functions
			expect(functions.length).to.be.greaterThan(5);
		});

		it('should generate consistent output on multiple runs', async function () {
			this.timeout(90000);

			// Generate ABI twice using hardhat task
			await hre.run('diamond:generate-abi-typechain', {
				diamondName: diamondName,
				outputDir: 'diamond-abi',
				typechainOutDir: 'diamond-typechain-types',
				enableVerbose: false,
			});

			// Read first result
			const outputPath = 'diamond-abi/ExampleDiamond.json';
			const abiContent1 = readFileSync(outputPath, 'utf8');
			const abiArtifact1 = JSON.parse(abiContent1);

			await hre.run('diamond:generate-abi-typechain', {
				diamondName: diamondName,
				outputDir: 'diamond-abi',
				typechainOutDir: 'diamond-typechain-types',
				enableVerbose: false,
			});

			// Read second result
			const abiContent2 = readFileSync(outputPath, 'utf8');
			const abiArtifact2 = JSON.parse(abiContent2);

			// Results should be identical - extract ABIs
			expect(abiArtifact1).to.have.property('abi');
			expect(abiArtifact2).to.have.property('abi');

			const functions1 = abiArtifact1.abi.filter((item: any) => item.type === 'function');
			const functions2 = abiArtifact2.abi.filter((item: any) => item.type === 'function');
			const events1 = abiArtifact1.abi.filter((item: any) => item.type === 'event');
			const events2 = abiArtifact2.abi.filter((item: any) => item.type === 'event');

			expect(functions1.length).to.equal(functions2.length);
			expect(events1.length).to.equal(events2.length);

			// ABI arrays should have same length
			expect(abiArtifact1.abi.length).to.equal(abiArtifact2.abi.length);
		});
	});

	describe('Error Recovery and Edge Cases', () => {
		// it('should handle missing diamond configuration gracefully', async function() {
		//   this.timeout(30000);
		//   // Generate the diamond ABI using the refactored generator
		//   // Use diamond-abi directory instead of artifacts/diamond-abi to avoid hardhat conflicts
		//   const outputDir = join(process.cwd(), 'diamond-abi');
		//   const options: DiamondAbiGenerationOptions = {
		//     diamondName: 'NonExistentDiamond',
		//     verbose: true,
		//     outputDir,
		//     validateSelectors: true,
		//     includeSourceInfo: true,
		//     diamondsPath: './diamonds'
		//   };

		//   // Should not crash even with invalid diamond name
		//   const result = await generateDiamondAbiWithTypechain(options);

		//   expect(result).to.have.property('abi');
		//   expect(result.abi).to.be.an('array');
		// });

		it('should validate generated ABI structure', async function () {
			this.timeout(60000);

			// Use hardhat task to generate ABI
			await hre.run('diamond:generate-abi-typechain', {
				diamondName: diamondName,
				outputDir: 'diamond-abi',
				typechainOutDir: 'diamond-typechain-types',
				enableVerbose: false,
			});

			// Read the generated ABI
			const outputPath = 'diamond-abi/ExampleDiamond.json';
			const abiContent = readFileSync(outputPath, 'utf8');
			const abiArtifact = JSON.parse(abiContent);

			// Extract ABI from artifact and validate structure
			expect(abiArtifact).to.have.property('abi');
			const abi = abiArtifact.abi;

			// Validate ABI structure
			for (const abiItem of abi) {
				expect(abiItem).to.have.property('type');
				expect(['function', 'event', 'error', 'constructor']).to.include(abiItem.type);

				if (abiItem.type === 'function') {
					expect(abiItem).to.have.property('name');
					expect(abiItem).to.have.property('inputs');
					expect(abiItem).to.have.property('outputs');
					expect(abiItem).to.have.property('stateMutability');

					expect(abiItem.inputs).to.be.an('array');
					expect(abiItem.outputs).to.be.an('array');
				}

				if (abiItem.type === 'event') {
					expect(abiItem).to.have.property('name');
					expect(abiItem).to.have.property('inputs');

					expect(abiItem.inputs).to.be.an('array');
				}
			}
		});
	});
});
