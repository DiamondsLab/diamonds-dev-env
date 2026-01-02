import { expect } from 'chai';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

describe('🧪 Function Selector Registration Unit Tests', function () {
	this.timeout(0);

	describe('Function Selector Calculation', function () {
		it('should calculate correct selector for testDeployExclude()', function () {
			// Calculate the function selector using ethers
			const functionSignature = 'testDeployExclude()';
			const selector = ethers.id(functionSignature).slice(0, 10);

			// Expected selector from PRD
			const expectedSelector = '0xdc38f9ab';

			expect(selector).to.equal(
				expectedSelector,
				`Selector for ${functionSignature} should be ${expectedSelector} but got ${selector}`,
			);
		});

		it('should calculate correct selector for testDeployInclude()', function () {
			// Calculate the function selector using ethers
			const functionSignature = 'testDeployInclude()';
			const selector = ethers.id(functionSignature).slice(0, 10);

			// Expected selector from PRD
			const expectedSelector = '0x7f0c610c';

			expect(selector).to.equal(
				expectedSelector,
				`Selector for ${functionSignature} should be ${expectedSelector} but got ${selector}`,
			);
		});
	});

	describe('Configuration File Parsing', function () {
		it('should correctly parse deployExclude from examplediamond-exclude.config.json', function () {
			// Load the exclude config file
			const configPath = path.join(
				__dirname,
				'../../diamonds/ExampleDiamond/examplediamond-exlcude.config .json',
			);

			expect(fs.existsSync(configPath), `Config file should exist at ${configPath}`).to.be
				.true;

			const configContent = fs.readFileSync(configPath, 'utf8');
			const config = JSON.parse(configContent);

			// Verify the config structure
			expect(config).to.have.property('facets');
			expect(config.facets).to.have.property('ExampleTestDeployExcludeFacet');

			const excludeFacet = config.facets.ExampleTestDeployExcludeFacet;
			expect(excludeFacet).to.have.property('priority', 50);
			expect(excludeFacet).to.have.property('versions');
			expect(excludeFacet.versions).to.have.property('1.0');

			const version = excludeFacet.versions['1.0'];
			expect(version).to.have.property('deployExclude');
			expect(version.deployExclude).to.equal('testDeployExclude()');
		});

		it('should correctly parse deployInclude from examplediamond-include.config.json', function () {
			// Load the include config file
			const configPath = path.join(
				__dirname,
				'../../diamonds/ExampleDiamond/examplediamond-include.config.json',
			);

			expect(fs.existsSync(configPath), `Config file should exist at ${configPath}`).to.be
				.true;

			const configContent = fs.readFileSync(configPath, 'utf8');
			const config = JSON.parse(configContent);

			// Verify the config structure
			expect(config).to.have.property('facets');
			expect(config.facets).to.have.property('ExampleTestDeployIncludeFacet');

			const includeFacet = config.facets.ExampleTestDeployIncludeFacet;
			expect(includeFacet).to.have.property('priority', 60);
			expect(includeFacet).to.have.property('versions');
			expect(includeFacet.versions).to.have.property('0.0');

			const version = includeFacet.versions['0.0'];
			expect(version).to.have.property('deployInclude');
			expect(version.deployInclude).to.equal('testDeployInclude()');
		});

		it('should verify facet priority ordering (ExampleTestDeployExcludeFacet has higher priority)', function () {
			// Load both config files
			const excludeConfigPath = path.join(
				__dirname,
				'../../diamonds/ExampleDiamond/examplediamond-exlcude.config .json',
			);
			const includeConfigPath = path.join(
				__dirname,
				'../../diamonds/ExampleDiamond/examplediamond-include.config.json',
			);

			const excludeConfig = JSON.parse(fs.readFileSync(excludeConfigPath, 'utf8'));
			const includeConfig = JSON.parse(fs.readFileSync(includeConfigPath, 'utf8'));

			// In both configs, verify the priorities
			const excludeFacetPriority =
				excludeConfig.facets.ExampleTestDeployExcludeFacet.priority;
			const includeFacetPriority =
				includeConfig.facets.ExampleTestDeployIncludeFacet.priority;

			// Lower priority number = higher priority
			expect(excludeFacetPriority).to.equal(50);
			expect(includeFacetPriority).to.equal(60);
			expect(excludeFacetPriority).to.be.lessThan(
				includeFacetPriority,
				'ExampleTestDeployExcludeFacet should have higher priority (lower number) than ExampleTestDeployIncludeFacet',
			);
		});
	});

	describe('Function Signature to Selector Conversion', function () {
		it('should convert various function signatures to correct selectors', function () {
			const testCases = [
				{ sig: 'testDeployExclude()', expected: '0xdc38f9ab' },
				{ sig: 'testDeployInclude()', expected: '0x7f0c610c' },
				{ sig: 'transfer(address,uint256)', expected: '0xa9059cbb' }, // Standard ERC20 transfer
				{ sig: 'balanceOf(address)', expected: '0x70a08231' }, // Standard ERC20 balanceOf
			];

			testCases.forEach(({ sig, expected }) => {
				const selector = ethers.id(sig).slice(0, 10);
				expect(selector).to.equal(
					expected,
					`Selector for ${sig} should be ${expected} but got ${selector}`,
				);
			});
		});
	});
});
