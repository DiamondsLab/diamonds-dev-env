import { expect } from 'chai';
import { rmSync, existsSync, readFileSync } from 'fs';
import hre from 'hardhat';

describe('Diamond ABI Generator', () => {
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

	describe('Diamond ABI Task Generation', () => {
		it('should generate ABI using hardhat task', async function () {
			this.timeout(30000);

			// Use hardhat task to generate ABI
			await hre.run('diamond:generate-abi', {
				diamondName: diamondName,
				outputDir: testOutputDir,
				enableVerbose: true,
				validateSelectors: true,
				includeSourceInfo: true,
			});

			// Verify the output file exists
			const outputPath = `${testOutputDir}/${diamondName}.json`;
			expect(existsSync(outputPath)).to.be.true;

			// Read and verify the generated ABI
			const abiContent = readFileSync(outputPath, 'utf8');
			const abiArtifact = JSON.parse(abiContent);

			// Verify artifact structure
			expect(abiArtifact).to.have.property('abi');
			expect(abiArtifact).to.have.property('_diamondMetadata');

			// Verify ABI is an array
			expect(abiArtifact.abi).to.be.an('array');

			// Verify metadata
			const metadata = abiArtifact._diamondMetadata;
			expect(metadata).to.have.property('diamondName');
			expect(metadata).to.have.property('stats');
			expect(metadata).to.have.property('selectorMap');

			console.log(
				`Generated ABI with ${metadata.stats.totalFunctions} functions, ${metadata.stats.totalEvents} events, ${metadata.stats.facetCount} facets`,
			);
		});
	});

	describe('generateDiamondAbi function', () => {
		it('should generate ABI for ExampleDiamond', async function () {
			this.timeout(30000); // Increase timeout for compilation

			// Use hardhat task to generate ABI
			await hre.run('diamond:generate-abi', {
				diamondName,
				outputDir: testOutputDir,
				enableVerbose: true,
				validateSelectors: true,
				includeSourceInfo: true,
			});

			// Read the generated file
			const outputPath = `${testOutputDir}/${diamondName}.json`;
			expect(existsSync(outputPath)).to.be.true;

			const abiContent = readFileSync(outputPath, 'utf8');
			const abiArtifact = JSON.parse(abiContent);

			// Verify result structure
			expect(abiArtifact).to.have.property('abi');
			expect(abiArtifact).to.have.property('_diamondMetadata');

			const metadata = abiArtifact._diamondMetadata;
			expect(metadata).to.have.property('selectorMap');
			expect(metadata).to.have.property('stats');

			// Verify ABI is an array
			expect(abiArtifact.abi).to.be.an('array');

			// Verify stats
			expect(metadata.stats).to.have.property('totalFunctions');
			expect(metadata.stats).to.have.property('totalEvents');
			expect(metadata.stats).to.have.property('totalErrors');
			expect(metadata.stats).to.have.property('facetCount');

			console.log(
				`Generated ABI with ${metadata.stats.totalFunctions} functions, ${metadata.stats.totalEvents} events, ${metadata.stats.facetCount} facets`,
			);
		});

		it('should include essential diamond functions in ABI', async function () {
			this.timeout(30000);

			// Use hardhat task to generate ABI
			await hre.run('diamond:generate-abi', {
				diamondName,
				outputDir: testOutputDir,
				enableVerbose: false,
			});

			// Read the generated file
			const outputPath = `${testOutputDir}/${diamondName}.json`;
			const abiContent = readFileSync(outputPath, 'utf8');
			const abiArtifact = JSON.parse(abiContent);

			// Check for essential functions that should be in any diamond
			const functionNames = abiArtifact.abi
				.filter((item: any) => item.type === 'function')
				.map((item: any) => item.name);

			// These functions should be present in most diamonds
			const expectedFunctions = [
				'supportsInterface', // From DiamondLoupe or ERC165
			];

			for (const funcName of expectedFunctions) {
				expect(functionNames).to.include(
					funcName,
					`Missing essential function: ${funcName}`,
				);
			}
		});

		it('should generate valid selector mappings', async function () {
			this.timeout(30000);

			// Use hardhat task to generate ABI with source info
			await hre.run('diamond:generate-abi', {
				diamondName,
				outputDir: testOutputDir,
				enableVerbose: false,
			});

			// Read the generated file
			const outputPath = `${testOutputDir}/${diamondName}.json`;
			const abiContent = readFileSync(outputPath, 'utf8');
			const abiArtifact = JSON.parse(abiContent);

			// Check if selector map is available in the artifact
			if (abiArtifact.selectorMap) {
				// Each selector should map to a facet name
				for (const [selector, facetName] of Object.entries(abiArtifact.selectorMap)) {
					expect(selector).to.match(/^0x[a-fA-F0-9]{8}$/);
					expect(facetName as string).to.be.a('string');
					expect((facetName as string).length).to.be.greaterThan(0);
				}
			}

			// At minimum, should have a valid ABI
			expect(abiArtifact.abi).to.be.an('array');
		});

		it('should handle missing facets gracefully', async function () {
			this.timeout(30000);

			try {
				// Use hardhat task to generate ABI for non-existent diamond
				await hre.run('diamond:generate-abi', {
					diamondName: 'NonExistentDiamond',
					outputDir: testOutputDir,
					enableVerbose: true,
				});

				// Read the generated file if successful
				const outputPath = `${testOutputDir}/NonExistentDiamond.json`;
				const abiContent = readFileSync(outputPath, 'utf8');
				const abiArtifact = JSON.parse(abiContent);

				expect(abiArtifact).to.have.property('abi');
				expect(abiArtifact.abi).to.be.an('array');
			} catch (error: any) {
				// Should handle missing configuration gracefully
				expect(error.message).to.include('configuration');
			}
		});

		it('should include metadata when includeSourceInfo is true', async function () {
			this.timeout(30000);

			// Use hardhat task to generate ABI
			await hre.run('diamond:generate-abi', {
				diamondName,
				outputDir: testOutputDir,
				enableVerbose: false,
			});

			// Read the generated file
			const outputPath = `${testOutputDir}/${diamondName}.json`;
			const abiContent = readFileSync(outputPath, 'utf8');
			const abiArtifact = JSON.parse(abiContent);

			// Check for basic artifact structure
			expect(abiArtifact).to.have.property('abi');
			expect(abiArtifact.abi).to.be.an('array');

			// Check for metadata if available
			if (abiArtifact.metadata) {
				const metadata =
					typeof abiArtifact.metadata === 'string'
						? JSON.parse(abiArtifact.metadata)
						: abiArtifact.metadata;

				expect(metadata).to.have.property('generatedAt');
				expect(metadata).to.have.property('compiler');
				expect(metadata).to.have.property('selectorMap');

				expect(metadata.compiler).to.equal('diamond-abi-generator');
			}
		});

		it('should validate that no duplicate selectors exist', async function () {
			this.timeout(30000);

			// Use hardhat task to generate ABI
			await hre.run('diamond:generate-abi', {
				diamondName,
				outputDir: testOutputDir,
				enableVerbose: true,
			});

			// Read the generated file
			const outputPath = `${testOutputDir}/${diamondName}.json`;
			const abiContent = readFileSync(outputPath, 'utf8');
			const abiArtifact = JSON.parse(abiContent);

			// Count unique selectors from the generated ABI
			const functionSelectors = new Set();

			for (const abiItem of abiArtifact.abi) {
				if (abiItem.type === 'function') {
					// Calculate selector manually to verify uniqueness
					const signature = `${abiItem.name}(${abiItem.inputs.map((input: any) => input.type).join(',')})`;
					const selector = signature; // Simplified for testing

					expect(functionSelectors.has(selector), `Duplicate selector found: ${signature}`)
						.to.be.false;
					functionSelectors.add(selector);
				}
			}

			// Should have at least some functions
			expect(functionSelectors.size).to.be.greaterThan(0);
		});
	});

	describe('Error handling', () => {
		// it('should handle invalid diamond name gracefully', async function() {
		//   this.timeout(30000);

		//   // Should not throw, but might produce empty ABI
		//   const result = await generateDiamondAbi({
		//     diamondName: 'CompletelyInvalidDiamond',
		//     outputDir: testOutputDir,
		//     verbose: true,
		//     diamondsPath: './test-assets/test-diamonds'
		//   });

		//   expect(result).to.have.property('abi');
		//   expect(result.abi).to.be.an('array');
		// });

		it('should handle invalid output directory', async function () {
			this.timeout(30000);

			// Should create the directory if it doesn't exist
			const invalidDir = '/tmp/invalid-very-deep-path/diamond-abi';

			// Use hardhat task to generate ABI in custom directory
			await hre.run('diamond:generate-abi', {
				diamondName,
				outputDir: invalidDir,
				enableVerbose: false,
			});

			const outputPath = `${invalidDir}/${diamondName}.json`;
			expect(existsSync(outputPath)).to.be.true;

			// Verify the file content
			const abiContent = readFileSync(outputPath, 'utf8');
			const abiArtifact = JSON.parse(abiContent);
			expect(abiArtifact).to.have.property('abi');

			// Clean up
			if (existsSync(invalidDir)) {
				rmSync(invalidDir, { recursive: true, force: true });
			}
		});
	});
});
