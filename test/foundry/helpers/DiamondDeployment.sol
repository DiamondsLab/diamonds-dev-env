// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DiamondDeployment
 * @notice Auto-generated deployment data for ExampleDiamond
 * @dev This library provides constants and helper functions for accessing
 *      deployment data in Forge tests. It is auto-generated from the deployment
 *      record and should not be edited manually.
 *
 * Generated from: diamonds/ExampleDiamond/deployments/examplediamond-localhost-31337.json
 * Generated at: 2025-11-17T17:32:34.943Z
 *
 * To regenerate this file:
 *   npx hardhat forge:generate-helpers --diamond ExampleDiamond
 *
 * ⚠️  DO NOT EDIT MANUALLY - Changes will be overwritten on next generation
 */
library DiamondDeployment {
    /// @notice Address of the deployed ExampleDiamond contract
    /// @dev This is the main Diamond proxy address
    address constant DIAMOND_ADDRESS = 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0;

    // ========================================
    // Facet Addresses
    // ========================================
    // These constants provide direct access to facet implementation addresses

    /// @notice Address of DiamondCutFacet implementation
    address constant DIAMOND_CUT_FACET = 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512;
    /// @notice Address of DiamondLoupeFacet implementation
    address constant DIAMOND_LOUPE_FACET = 0xa513E6E4b8f2a923D98304ec87F64353C4D5C853;
    /// @notice Address of ExampleOwnershipFacet implementation
    address constant EXAMPLE_OWNERSHIP_FACET = 0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6;
    /// @notice Address of ExampleInitFacet implementation
    address constant EXAMPLE_INIT_FACET = 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318;
    /// @notice Address of ExampleUpgradeFacet implementation
    address constant EXAMPLE_UPGRADE_FACET = 0x610178dA211FEF7D417bC0e6FeD39F05609AD788;

    // ========================================
    // Function Selectors
    // ========================================
    // These constants provide function selectors for each facet
    // Useful for low-level calls and selector verification

    /// @dev Selectors for DiamondCutFacet
    bytes4 constant DIAMONDCUT_SEL_1f931c1c = 0x1f931c1c;

    /// @dev Selectors for DiamondLoupeFacet
    bytes4 constant DIAMONDLOUPE_SEL_cdffacc6 = 0xcdffacc6;
    bytes4 constant DIAMONDLOUPE_SEL_52ef6b2c = 0x52ef6b2c;
    bytes4 constant DIAMONDLOUPE_SEL_adfca15e = 0xadfca15e;
    bytes4 constant DIAMONDLOUPE_SEL_7a0ed627 = 0x7a0ed627;
    bytes4 constant DIAMONDLOUPE_SEL_01ffc9a7 = 0x01ffc9a7;

    /// @dev Selectors for ExampleOwnershipFacet
    bytes4 constant EXAMPLEOWNERSHIP_SEL_a217fddf = 0xa217fddf;
    bytes4 constant EXAMPLEOWNERSHIP_SEL_248a9ca3 = 0x248a9ca3;
    bytes4 constant EXAMPLEOWNERSHIP_SEL_9010d07c = 0x9010d07c;
    bytes4 constant EXAMPLEOWNERSHIP_SEL_ca15c873 = 0xca15c873;
    bytes4 constant EXAMPLEOWNERSHIP_SEL_2f2ff15d = 0x2f2ff15d;
    bytes4 constant EXAMPLEOWNERSHIP_SEL_91d14854 = 0x91d14854;
    bytes4 constant EXAMPLEOWNERSHIP_SEL_8da5cb5b = 0x8da5cb5b;
    bytes4 constant EXAMPLEOWNERSHIP_SEL_36568abe = 0x36568abe;
    bytes4 constant EXAMPLEOWNERSHIP_SEL_d547741f = 0xd547741f;
    bytes4 constant EXAMPLEOWNERSHIP_SEL_f2fde38b = 0xf2fde38b;
    bytes4 constant EXAMPLEOWNERSHIP_SEL_f72c0d8b = 0xf72c0d8b;

    /// @dev Selectors for ExampleInitFacet
    bytes4 constant EXAMPLEINIT_SEL_c47ea632 = 0xc47ea632;
    bytes4 constant EXAMPLEINIT_SEL_d4fb2a3e = 0xd4fb2a3e;
    bytes4 constant EXAMPLEINIT_SEL_fef41fe4 = 0xfef41fe4;

    /// @dev Selectors for ExampleUpgradeFacet
    bytes4 constant EXAMPLEUPGRADE_SEL_d3ce6863 = 0xd3ce6863;
    bytes4 constant EXAMPLEUPGRADE_SEL_034899bc = 0x034899bc;
    bytes4 constant EXAMPLEUPGRADE_SEL_c52046de = 0xc52046de;

    // ========================================
    // Helper Functions
    // ========================================

    /**
     * @notice Get the Diamond contract address
     * @return The address of the deployed Diamond proxy
     * @dev Use this in tests instead of hardcoding addresses
     */
    function getDiamondAddress() internal pure returns (address) {
        return DIAMOND_ADDRESS;
    }

    /**
     * @notice Get facet implementation address by name
     * @param facetName The name of the facet (e.g., "ExampleOwnershipFacet")
     * @return The address of the facet implementation, or address(0) if not found
     * @dev This performs string comparison to find the facet
     * @dev Available facets:
     *      - DiamondCutFacet
     *      - DiamondLoupeFacet
     *      - ExampleOwnershipFacet
     *      - ExampleInitFacet
     *      - ExampleUpgradeFacet
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

    /**
     * @notice Get function selector by facet and function name
     * @param facetName The name of the facet
     * @param functionName The name of the function
     * @return The function selector, or bytes4(0) if not found
     * @dev This is a simplified implementation that returns bytes4(0) for all queries.
     *      For specific selectors, use the constants defined above.
     *      Future versions may include a comprehensive selector mapping.
     */
    function getSelector(string memory facetName, string memory functionName) internal pure returns (bytes4) {
        // Silence unused variable warnings
        facetName;
        functionName;
        
        // TODO: Implement comprehensive selector lookup
        // For now, use the selector constants defined above directly
        return bytes4(0);
    }
}
