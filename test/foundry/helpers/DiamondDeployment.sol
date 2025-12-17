// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DiamondDeployment
 * @notice Auto-generated deployment data for ExampleDiamond
 * @dev This library provides constants and helper functions for accessing
 *      deployment data in Forge tests. It is auto-generated from the deployment
 *      record and should not be edited manually.
 *
 * Generated from: diamonds/ExampleDiamond/deployments/examplediamond-hardhat-31337.json
 * Generated at: 2025-12-17T00:37:43.473Z
 *
 * To regenerate this file:
 *   npx hardhat diamonds-forge:generate-helpers --diamond ExampleDiamond
 *
 * ⚠️  DO NOT EDIT MANUALLY - Changes will be overwritten on next generation
 */
library DiamondDeployment {
    /// @notice Address of the deployed ExampleDiamond contract
    /// @dev This is the main Diamond proxy address
    address constant DIAMOND_ADDRESS = 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512;

    /// @notice Address of the deployer account
    /// @dev Account that deployed the Diamond
    address constant DEPLOYER_ADDRESS = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

    // ========================================
    // Facet Addresses
    // ========================================

    /// @notice Address of DiamondCutFacet implementation
    address constant DIAMOND_CUT_FACET = 0x5FbDB2315678afecb367f032d93F642f64180aa3;
    /// @notice Address of DiamondLoupeFacet implementation
    address constant DIAMOND_LOUPE_FACET = 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0;
    /// @notice Address of ExampleOwnershipFacet implementation
    address constant EXAMPLE_OWNERSHIP_FACET = 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9;
    /// @notice Address of ExampleInitFacet implementation
    address constant EXAMPLE_INIT_FACET = 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9;
    /// @notice Address of ExampleUpgradeFacet implementation
    address constant EXAMPLE_UPGRADE_FACET = 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707;

    // ========================================
    // Helper Functions
    // ========================================

    /**
     * @notice Get the Diamond contract address
     * @return The address of the deployed Diamond proxy
     */
    function getDiamondAddress() internal pure returns (address) {
        return DIAMOND_ADDRESS;
    }

    /**
     * @notice Get the deployer address
     * @return The address of the deployer account
     */
    function getDeployerAddress() internal pure returns (address) {
        return DEPLOYER_ADDRESS;
    }

    /**
     * @notice Get facet implementation address by name
     * @param facetName The name of the facet
     * @return The address of the facet implementation
     */
    function getFacetAddress(string memory facetName) internal pure returns (address) {
        if (keccak256(bytes(facetName)) == keccak256(bytes("DiamondCutFacet"))) {
            return DIAMOND_CUT_FACET;
        }
        else if (keccak256(bytes(facetName)) == keccak256(bytes("DiamondLoupeFacet"))) {
            return DIAMOND_LOUPE_FACET;
        }
        else if (keccak256(bytes(facetName)) == keccak256(bytes("ExampleOwnershipFacet"))) {
            return EXAMPLE_OWNERSHIP_FACET;
        }
        else if (keccak256(bytes(facetName)) == keccak256(bytes("ExampleInitFacet"))) {
            return EXAMPLE_INIT_FACET;
        }
        else if (keccak256(bytes(facetName)) == keccak256(bytes("ExampleUpgradeFacet"))) {
            return EXAMPLE_UPGRADE_FACET;
        }
        return address(0);
    }
}
