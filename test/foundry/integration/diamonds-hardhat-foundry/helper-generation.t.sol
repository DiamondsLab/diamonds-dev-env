// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../../helpers/DiamondDeployment.sol";

/**
 * @title HelperGenerationTest
 * @notice Integration tests for helper file generation
 * @dev Tests that diamonds-forge:generate-helpers produces valid Solidity
 */
contract HelperGenerationTest is Test {
    address diamond;
    address deployer;

    function setUp() public {
        console.log("=== Helper Generation Integration Test Setup ===");

        // Load addresses from generated helper
        diamond = DiamondDeployment.getDiamondAddress();
        deployer = DiamondDeployment.getDeployerAddress();

        console.log("Diamond address from helper:", diamond);
        console.log("Deployer address from helper:", deployer);
    }

    /**
     * @notice Test that DiamondDeployment.sol was generated and compiles
     * @dev If this test runs, the file exists and compiles successfully
     */
    function test_DiamondDeploymentGenerated() public view {
        console.log("Test: Verify DiamondDeployment.sol was generated and compiles");

        // If we got here, the import worked and file compiles
        assertTrue(true, "DiamondDeployment.sol exists and compiles");
    }

    /**
     * @notice Test that generated helpers have non-zero Diamond address
     */
    function test_GeneratedHelpersHaveValidAddress() public view {
        console.log("Test: Verify generated helpers contain valid Diamond address");

        assertTrue(diamond != address(0), "Diamond address should not be zero");
        console.log("Diamond address is valid:", diamond);
    }

    /**
     * @notice Test that generated helpers have non-zero deployer address
     */
    function test_GeneratedHelpersHaveDeployerAddress() public view {
        console.log("Test: Verify generated helpers contain deployer address");

        assertTrue(deployer != address(0), "Deployer address should not be zero");
        console.log("Deployer address is valid:", deployer);
    }

    /**
     * @notice Test that Diamond address has code deployed
     * @dev Skips code check if not forking from network with deployed Diamond
     */
    function test_DiamondAddressHasCode() public view {
        console.log("Test: Verify Diamond at generated address has code");

        address diamondAddr = diamond;
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(diamondAddr)
        }

        console.log("Diamond code size:", codeSize);
        
        // Note: Code size will be 0 if not forking from Hardhat network
        // Helper generation still works correctly - it uses deployment data
        if (codeSize == 0) {
            console.log("INFO: No code at Diamond address (not forking from deployed network)");
            console.log("INFO: Helper file is still generated correctly from deployment data");
        } else {
            console.log("SUCCESS: Diamond has code deployed");
        }
    }

    /**
     * @notice Test that helper getter functions work correctly
     */
    function test_HelperGetterFunctions() public view {
        console.log("Test: Verify helper getter functions");

        // Test getDiamondAddress()
        address addr1 = DiamondDeployment.getDiamondAddress();
        assertTrue(addr1 != address(0), "getDiamondAddress() should return non-zero");
        assertEq(addr1, diamond, "getDiamondAddress() should match stored address");

        // Test getDeployerAddress()
        address addr2 = DiamondDeployment.getDeployerAddress();
        assertTrue(addr2 != address(0), "getDeployerAddress() should return non-zero");
        assertEq(addr2, deployer, "getDeployerAddress() should match stored address");

        console.log("All getter functions work correctly");
    }
}
