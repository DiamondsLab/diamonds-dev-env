/**
 * @file forgeHelpers.ts
 * @description Utility functions for Forge fuzzing framework
 * Generates Solidity helper libraries from Diamond deployment data
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { DeployedDiamondData } from '@diamondslab/diamonds';
import debug from 'debug';

const log: debug.Debugger = debug('forgeHelpers');

/**
 * Generate Solidity helper library from Diamond deployment data
 * Creates a library with Diamond address, facet addresses, and function selectors
 */
export function generateSolidityHelperLibrary(
	diamondName: string,
	diamondAddress: string,
	deploymentData: DeployedDiamondData,
	outputPath?: string,
): string {
	log('Generating Solidity helper library for', diamondName);

	const timestamp = new Date().toISOString();
	const networkInfo = `${deploymentData.networkName ?? 'unknown'}-${deploymentData.chainId ?? 'unknown'}`;
	const deploymentFileName = `${diamondName.toLowerCase()}-${networkInfo}.json`;
	const deploymentFilePath = `diamonds/${diamondName}/deployments/${deploymentFileName}`;

	// Start building the Solidity source
	let source = '';

	// Add SPDX license and pragma
	source += '// SPDX-License-Identifier: MIT\n';
	source += 'pragma solidity ^0.8.19;\n\n';

	// Add header comments
	source += '/**\n';
	source += ` * @title DiamondDeployment\n`;
	source += ` * @notice Auto-generated deployment data for ${diamondName}\n`;
	source += ` * @dev Generated from: ${deploymentFilePath}\n`;
	source += ` * @dev Generated at: ${timestamp}\n`;
	source += ` * DO NOT EDIT MANUALLY - Regenerate using: npx hardhat forge:generate-helpers\n`;
	source += ' */\n';
	source += 'library DiamondDeployment {\n';

	// Add Diamond address constant
	source += `    // Diamond address\n`;
	source += `    address constant DIAMOND_ADDRESS = ${diamondAddress};\n\n`;

	// Add facet addresses
	source += '    // Facet addresses\n';
	const facets = deploymentData.DeployedFacets ?? {};
	for (const [facetName, facetData] of Object.entries(facets)) {
		const constantName =
			facetName
				.replace(/Facet$/, '')
				.replace(/([A-Z])/g, '_$1')
				.toUpperCase()
				.replace(/^_/, '') + '_FACET';

		source += `    address constant ${constantName} = ${facetData.address};\n`;
	}
	source += '\n';

	// Add function selectors per facet
	source += '    // Function selectors\n';
	for (const [facetName, facetData] of Object.entries(facets)) {
		if (facetData.functionSelectors && facetData.functionSelectors.length > 0) {
			source += `    // ${facetName} selectors\n`;

			for (const selector of facetData.functionSelectors) {
				const selectorName = `${facetName.replace(/Facet$/, '').toUpperCase()}_${selector.replace('0x', 'SEL_')}`;
				source += `    bytes4 constant ${selectorName} = ${selector};\n`;
			}
			source += '\n';
		}
	}

	// Add helper functions
	source += '    /**\n';
	source += '     * @notice Get the Diamond contract address\n';
	source += '     * @return The address of the deployed Diamond\n';
	source += '     */\n';
	source += '    function getDiamondAddress() internal pure returns (address) {\n';
	source += '        return DIAMOND_ADDRESS;\n';
	source += '    }\n\n';

	source += '    /**\n';
	source += '     * @notice Get facet address by name\n';
	source += '     * @param facetName The name of the facet\n';
	source += '     * @return The address of the facet, or address(0) if not found\n';
	source += '     */\n';
	source +=
		'    function getFacetAddress(string memory facetName) internal pure returns (address) {\n';

	let firstFacet = true;
	for (const [facetName, facetData] of Object.entries(facets)) {
		const constantName =
			facetName
				.replace(/Facet$/, '')
				.replace(/([A-Z])/g, '_$1')
				.toUpperCase()
				.replace(/^_/, '') + '_FACET';

		const condition = firstFacet ? 'if' : 'else if';
		source += `        ${condition} (keccak256(bytes(facetName)) == keccak256(bytes("${facetName}"))) {\n`;
		source += `            return ${constantName};\n`;
		source += '        }\n';
		firstFacet = false;
	}
	source += '        return address(0);\n';
	source += '    }\n\n';

	source += '    /**\n';
	source += '     * @notice Get function selector by facet and function name\n';
	source += '     * @param facetName The name of the facet\n';
	source += '     * @param functionName The name of the function\n';
	source += '     * @return The function selector, or bytes4(0) if not found\n';
	source +=
		'     * @dev Note: This is a simplified lookup. For production use, consider storing\n';
	source += '     *      a more comprehensive mapping of function names to selectors.\n';
	source += '     */\n';
	source +=
		'    function getSelector(string memory facetName, string memory functionName) internal pure returns (bytes4) {\n';
	source += '        // Placeholder implementation - extend based on your needs\n';
	source += '        // For now, returns bytes4(0)\n';
	source += '        facetName; functionName; // Silence unused variable warnings\n';
	source += '        return bytes4(0);\n';
	source += '    }\n';

	// Close library
	source += '}\n';

	// Write to file if output path provided
	const finalPath =
		outputPath ??
		join(process.cwd(), 'test', 'foundry', 'helpers', 'DiamondDeployment.sol');

	// Ensure directory exists
	const dir = join(finalPath, '..');
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
		log('Created helper directory:', dir);
	}

	writeFileSync(finalPath, source, 'utf-8');
	log('Generated Solidity helper library at:', finalPath);

	return finalPath;
}

/**
 * Update foundry.toml with helper library remapping
 */
export function updateFoundryConfig(helperPath: string): void {
	log('Updating foundry.toml with helper library remapping');

	// Implementation in later sub-task
	throw new Error('Not implemented yet');
}
