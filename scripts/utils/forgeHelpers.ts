/**
 * @file forgeHelpers.ts
 * @description Utility functions for Forge fuzzing framework
 * Generates Solidity helper libraries from Diamond deployment data
 */

import type { DeployedDiamondData } from '@diamondslab/diamonds';
import debug from 'debug';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const log: debug.Debugger = debug('forgeHelpers');

/**
 * Generate Solidity helper library from Diamond deployment data
 *
 * Creates a library with Diamond address, facet addresses, and function selectors
 * that can be imported in Forge tests for easy access to deployment data.
 *
 * Generated library structure:
 * - Address constants for Diamond and all facets
 * - Bytes4 constants for all function selectors
 * - Helper functions for querying addresses and selectors
 *
 * @param diamondName - Name of the Diamond (e.g., "ExampleDiamond")
 * @param networkName - Network name (e.g., "localhost", "hardhat")
 * @param chainId - Chain ID of the network
 * @param diamondAddress - Deployed Diamond contract address
 * @param deploymentData - Full deployment data from deployment record
 * @param outputPath - Optional custom output path (default: test/foundry/helpers/DiamondDeployment.sol)
 * @returns Path to the generated Solidity library file
 *
 * @example
 * const path = generateSolidityHelperLibrary(
 *   "ExampleDiamond",
 *   "localhost",
 *   31337,
 *   "0x5FbDB2315678afecb367f032d93F642f64180aa3",
 *   deploymentData
 * );
 */
export function generateSolidityHelperLibrary(
	diamondName: string,
	networkName: string,
	chainId: bigint | number,
	diamondAddress: string,
	deploymentData: DeployedDiamondData,
	outputPath?: string,
): string {
	log('Generating Solidity helper library for', diamondName);

	const timestamp = new Date().toISOString();
	const networkInfo = `${networkName}-${chainId}`;
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
	source += ` * @dev This library provides constants and helper functions for accessing\n`;
	source += ` *      deployment data in Forge tests. It is auto-generated from the deployment\n`;
	source += ` *      record and should not be edited manually.\n`;
	source += ` *\n`;
	source += ` * Generated from: ${deploymentFilePath}\n`;
	source += ` * Generated at: ${timestamp}\n`;
	source += ` *\n`;
	source += ` * To regenerate this file:\n`;
	source += ` *   npx hardhat forge:generate-helpers --diamond ${diamondName}\n`;
	source += ` *\n`;
	source += ` * ⚠️  DO NOT EDIT MANUALLY - Changes will be overwritten on next generation\n`;
	source += ' */\n';
	source += 'library DiamondDeployment {\n';

	// Add Diamond address constant with comment
	source += `    /// @notice Address of the deployed ${diamondName} contract\n`;
	source += `    /// @dev This is the main Diamond proxy address\n`;
	source += `    address constant DIAMOND_ADDRESS = ${diamondAddress};\n\n`;

	// Add facet addresses with comments
	source += '    // ========================================\n';
	source += '    // Facet Addresses\n';
	source += '    // ========================================\n';
	source +=
		'    // These constants provide direct access to facet implementation addresses\n\n';
	const facets = deploymentData.DeployedFacets ?? {};
	for (const [facetName, facetData] of Object.entries(facets)) {
		const constantName =
			facetName
				.replace(/Facet$/, '')
				.replace(/([A-Z])/g, '_$1')
				.toUpperCase()
				.replace(/^_/, '') + '_FACET';

		source += `    /// @notice Address of ${facetName} implementation\n`;
		source += `    address constant ${constantName} = ${facetData.address};\n`;
	}
	source += '\n';

	// Add function selectors per facet with comments
	source += '    // ========================================\n';
	source += '    // Function Selectors\n';
	source += '    // ========================================\n';
	source += '    // These constants provide function selectors for each facet\n';
	source += '    // Useful for low-level calls and selector verification\n\n';
	for (const [facetName, facetData] of Object.entries(facets)) {
		if (facetData.funcSelectors && facetData.funcSelectors.length > 0) {
			source += `    /// @dev Selectors for ${facetName}\n`;

			for (const selector of facetData.funcSelectors) {
				const selectorName = `${facetName.replace(/Facet$/, '').toUpperCase()}_${selector.replace('0x', 'SEL_')}`;
				source += `    bytes4 constant ${selectorName} = ${selector};\n`;
			}
			source += '\n';
		}
	}

	// Add helper functions
	source += '    // ========================================\n';
	source += '    // Helper Functions\n';
	source += '    // ========================================\n\n';

	source += '    /**\n';
	source += '     * @notice Get the Diamond contract address\n';
	source += '     * @return The address of the deployed Diamond proxy\n';
	source += '     * @dev Use this in tests instead of hardcoding addresses\n';
	source += '     */\n';
	source += '    function getDiamondAddress() internal pure returns (address) {\n';
	source += '        return DIAMOND_ADDRESS;\n';
	source += '    }\n\n';

	source += '    /**\n';
	source += '     * @notice Get facet implementation address by name\n';
	source +=
		'     * @param facetName The name of the facet (e.g., "ExampleOwnershipFacet")\n';
	source +=
		'     * @return The address of the facet implementation, or address(0) if not found\n';
	source += '     * @dev This performs string comparison to find the facet\n';
	source += '     * @dev Available facets:\n';
	for (const facetName of Object.keys(facets)) {
		source += `     *      - ${facetName}\n`;
	}
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
		'     * @dev This is a simplified implementation that returns bytes4(0) for all queries.\n';
	source += '     *      For specific selectors, use the constants defined above.\n';
	source += '     *      Future versions may include a comprehensive selector mapping.\n';
	source += '     */\n';
	source +=
		'    function getSelector(string memory facetName, string memory functionName) internal pure returns (bytes4) {\n';
	source += '        // Silence unused variable warnings\n';
	source += '        facetName;\n';
	source += '        functionName;\n';
	source += '        \n';
	source += '        // TODO: Implement comprehensive selector lookup\n';
	source += '        // For now, use the selector constants defined above directly\n';
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
