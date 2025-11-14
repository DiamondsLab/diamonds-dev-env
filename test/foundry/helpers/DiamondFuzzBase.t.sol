// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "./DiamondABILoader.sol";

/// @title DiamondFuzzBase Unit Tests
/// @notice Unit tests for DiamondFuzzBase helper library structure and compilation
/// @dev Task 3.15-3.18: Test helper functions compile and have correct structure
/// @dev Note: Full integration tests require deployed Diamond (see README)
contract DiamondFuzzBaseTest is Test {
    /// @notice Test that DiamondABILoader can load ABI file
    /// @dev This tests the underlying ABI loading functionality
    function test_ABI_Loading() public {
        string memory abiPath = "./diamond-abi/ExampleDiamond.json";
        string memory abiJson = DiamondABILoader.loadDiamondABI(abiPath);

        assertTrue(bytes(abiJson).length > 0, "ABI should be loaded");
        console.log("ABI loaded, size:", bytes(abiJson).length);
    }

    /// @notice Test that selectors can be extracted from ABI
    /// @dev Verifies selector extraction works
    function test_Extract_Selectors() public {
        string memory abiPath = "./diamond-abi/ExampleDiamond.json";
        string memory abiJson = DiamondABILoader.loadDiamondABI(abiPath);
        bytes4[] memory selectors = DiamondABILoader.extractSelectors(abiJson);

        assertTrue(selectors.length > 0, "Should extract selectors");
        console.log("Selectors extracted:", selectors.length);
    }

    /// @notice Test that signatures can be extracted from ABI
    /// @dev Verifies signature extraction works
    function test_Extract_Signatures() public {
        string memory abiPath = "./diamond-abi/ExampleDiamond.json";
        string memory abiJson = DiamondABILoader.loadDiamondABI(abiPath);
        string[] memory signatures = DiamondABILoader.extractSignatures(abiJson);

        assertTrue(signatures.length > 0, "Should extract signatures");
        console.log("Signatures extracted:", signatures.length);
    }

    /// @notice Test that deployment file can be read
    /// @dev Verifies deployment file exists and is readable
    function test_Deployment_File_Readable() public {
        string memory deploymentPath = "./.forge-diamond-address";
        string memory deploymentJson = vm.readFile(deploymentPath);

        assertTrue(bytes(deploymentJson).length > 0, "Deployment file should exist");
        console.log("Deployment file size:", bytes(deploymentJson).length);
    }

    /// @notice Test that Diamond address can be parsed from deployment file
    /// @dev Verifies deployment file has correct structure
    function test_Parse_Diamond_Address() public {
        string memory deploymentPath = "./.forge-diamond-address";
        string memory deploymentJson = vm.readFile(deploymentPath);

        bytes memory addressBytes = vm.parseJson(deploymentJson, ".diamondAddress");
        address diamondAddress = abi.decode(addressBytes, (address));

        assertTrue(diamondAddress != address(0), "Diamond address should not be zero");
        console.log("Diamond address from file:", diamondAddress);
    }

    /// @notice Test selector-signature correspondence
    /// @dev Verifies selectors match their signatures
    function test_Selector_Signature_Match() public {
        string memory abiPath = "./diamond-abi/ExampleDiamond.json";
        string memory abiJson = DiamondABILoader.loadDiamondABI(abiPath);
        
        bytes4[] memory selectors = DiamondABILoader.extractSelectors(abiJson);
        string[] memory signatures = DiamondABILoader.extractSignatures(abiJson);

        assertEq(selectors.length, signatures.length, "Selector/signature count must match");

        // Verify first few selectors match their signatures
        for (uint256 i = 0; i < selectors.length && i < 5; i++) {
            bytes4 selector = selectors[i];
            string memory signature = signatures[i];

            bytes4 expectedSelector = bytes4(keccak256(bytes(signature)));
            assertEq(
                selector,
                expectedSelector,
                string(abi.encodePacked("Selector mismatch for: ", signature))
            );

            console.log("Verified:", signature);
        }
    }

    /// @notice Test that standard Diamond functions are in ABI
    /// @dev Verifies expected Diamond functions exist
    function test_Standard_Diamond_Functions() public {
        string memory abiPath = "./diamond-abi/ExampleDiamond.json";
        string memory abiJson = DiamondABILoader.loadDiamondABI(abiPath);
        string[] memory signatures = DiamondABILoader.extractSignatures(abiJson);

        bool hasOwner = false;
        bool hasFacets = false;
        bool hasDiamondCut = false;

        for (uint256 i = 0; i < signatures.length; i++) {
            string memory sig = signatures[i];

            if (keccak256(bytes(sig)) == keccak256(bytes("owner()"))) {
                hasOwner = true;
            }
            if (keccak256(bytes(sig)) == keccak256(bytes("facets()"))) {
                hasFacets = true;
            }
            // DiamondCut signature in our ABI uses tuple format
            if (keccak256(bytes(sig)) == keccak256(bytes("diamondCut(tuple[],address,bytes)"))) {
                hasDiamondCut = true;
            }
        }

        assertTrue(hasOwner, "Diamond should have owner()");
        assertTrue(hasFacets, "Diamond should have facets()");
        assertTrue(hasDiamondCut, "Diamond should have diamondCut()");
    }

    /// @notice Test comprehensive ABI extraction
    /// @dev Verifies all expected functions are loaded
    function test_Comprehensive_ABI_Extraction() public {
        string memory abiPath = "./diamond-abi/ExampleDiamond.json";
        string memory abiJson = DiamondABILoader.loadDiamondABI(abiPath);
        string[] memory signatures = DiamondABILoader.extractSignatures(abiJson);

        // Log functions for verification
        console.log("\n=== Diamond Functions ===");
        for (uint256 i = 0; i < signatures.length && i < 25; i++) {
            console.log(i, ":", signatures[i]);
        }

        // Verify minimum expected count
        assertTrue(signatures.length >= 20, "Should have at least 20 functions");
    }
}

