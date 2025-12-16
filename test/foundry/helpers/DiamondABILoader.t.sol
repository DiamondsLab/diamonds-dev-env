// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.19;

// import "forge-std/Test.sol";
// import "../helpers/DiamondABILoader.sol";

// /// @title Diamond ABI Loader Tests
// /// @notice Validates the DiamondABILoader library functionality
// /// @dev Tests for Tasks 1.1-1.5: ABI loading, parsing, selector extraction, and verification
// contract DiamondABILoaderTest is Test {
//     using DiamondABILoader for string;

//     string constant DIAMOND_ABI_PATH = "./diamond-abi/ExampleDiamond.json";
//     string abiJson;

//     function setUp() public {
//         // Load the Diamond ABI once for all tests
//         abiJson = DiamondABILoader.loadDiamondABI(DIAMOND_ABI_PATH);
//     }

//     /// @notice Task 1.1 & 1.2: Test loading Diamond ABI file
//     function test_LoadDiamondABI() public {
//         string memory loadedAbi = DiamondABILoader.loadDiamondABI(DIAMOND_ABI_PATH);

//         // Verify we got data
//         assertTrue(bytes(loadedAbi).length > 0, "ABI should not be empty");

//         console.log("Successfully loaded Diamond ABI");
//         console.log("File size:", bytes(loadedAbi).length, "bytes");
//     }

//     /// @notice Task 1.3: Test extracting function selectors
//     function test_ExtractSelectors() public {
//         bytes4[] memory selectors = DiamondABILoader.extractSelectors(abiJson);

//         // Should have multiple functions
//         assertTrue(selectors.length > 0, "Should extract at least one selector");

//         console.log("Extracted", selectors.length, "function selectors");

//         // Log first few selectors for verification
//         console.log("\nFirst 10 selectors:");
//         uint256 displayCount = selectors.length < 10 ? selectors.length : 10;
//         for (uint256 i = 0; i < displayCount; i++) {
//             console.log("  Selector", i, ":");
//             console.logBytes4(selectors[i]);
//         }

//         // Verify no zero selectors (unless fallback)
//         for (uint256 i = 0; i < selectors.length; i++) {
//             assertTrue(selectors[i] != bytes4(0), "Selector should not be zero");
//         }
//     }

//     /// @notice Task 1.4: Test extracting function signatures
//     function test_ExtractSignatures() public {
//         string[] memory signatures = DiamondABILoader.extractSignatures(abiJson);

//         // Should have multiple functions
//         assertTrue(signatures.length > 0, "Should extract at least one signature");

//         console.log("Extracted", signatures.length, "function signatures");

//         // Log first few signatures for verification
//         console.log("\nFirst 10 signatures:");
//         uint256 displayCount = signatures.length < 10 ? signatures.length : 10;
//         for (uint256 i = 0; i < displayCount; i++) {
//             console.log("  Signature", i, ":", signatures[i]);
//         }

//         // Verify signatures are not empty
//         for (uint256 i = 0; i < signatures.length; i++) {
//             assertTrue(bytes(signatures[i]).length > 0, "Signature should not be empty");
//             // All signatures should contain parentheses
//             assertTrue(_containsChar(signatures[i], "("), "Signature should contain (");
//             assertTrue(_containsChar(signatures[i], ")"), "Signature should contain )");
//         }
//     }

//     /// @notice Task 1.3 & 1.4: Test selector-signature correspondence
//     function test_SelectorSignatureCorrespondence() public {
//         bytes4[] memory selectors = DiamondABILoader.extractSelectors(abiJson);
//         string[] memory signatures = DiamondABILoader.extractSignatures(abiJson);

//         // Should have same count
//         assertEq(selectors.length, signatures.length, "Selector and signature count should match");

//         console.log("\nVerifying selector-signature pairs:");

//         // Verify each selector matches its signature
//         uint256 displayCount = selectors.length < 5 ? selectors.length : 5;
//         for (uint256 i = 0; i < displayCount; i++) {
//             bytes4 expectedSelector = bytes4(keccak256(bytes(signatures[i])));

//             console.log("\nPair", i, ":");
//             console.log("  Signature:", signatures[i]);
//             console.log("  Expected selector:");
//             console.logBytes4(expectedSelector);
//             console.log("  Actual selector:");
//             console.logBytes4(selectors[i]);

//             assertEq(selectors[i], expectedSelector, "Selector should match signature hash");
//         }
//     }

//     /// @notice Test getFunctionInfo for known functions
//     function test_GetFunctionInfo_Owner() public {
//         DiamondABILoader.FunctionInfo memory info = DiamondABILoader.getFunctionInfo(
//             abiJson,
//             "owner"
//         );

//         assertTrue(info.exists, "owner() function should exist");
//         assertEq(info.name, "owner", "Function name should match");
//         assertEq(info.signature, "owner()", "Function signature should match");

//         // owner() should be: bytes4(keccak256("owner()")) = 0x8da5cb5b
//         bytes4 expectedSelector = bytes4(keccak256("owner()"));
//         assertEq(info.selector, expectedSelector, "Selector should match");

//         assertTrue(info.isView, "owner() should be a view function");

//         console.log("\nFunction info for 'owner':");
//         console.log("  Name:", info.name);
//         console.log("  Signature:", info.signature);
//         console.log("  Selector:");
//         console.logBytes4(info.selector);
//         console.log("  Is view:", info.isView);
//     }

//     /// @notice Test getFunctionInfo for function with parameters
//     function test_GetFunctionInfo_TransferOwnership() public {
//         DiamondABILoader.FunctionInfo memory info = DiamondABILoader.getFunctionInfo(
//             abiJson,
//             "transferOwnership"
//         );

//         assertTrue(info.exists, "transferOwnership() function should exist");
//         assertEq(info.name, "transferOwnership", "Function name should match");
//         assertEq(info.signature, "transferOwnership(address)", "Function signature should match");

//         // transferOwnership(address) should be: bytes4(keccak256("transferOwnership(address)")) = 0xf2fde38b
//         bytes4 expectedSelector = bytes4(keccak256("transferOwnership(address)"));
//         assertEq(info.selector, expectedSelector, "Selector should match");

//         assertFalse(info.isView, "transferOwnership() should not be a view function");

//         console.log("\nFunction info for 'transferOwnership':");
//         console.log("  Name:", info.name);
//         console.log("  Signature:", info.signature);
//         console.log("  Selector:");
//         console.logBytes4(info.selector);
//         console.log("  Is view:", info.isView);
//     }

//     /// @notice Test getFunctionInfo for access control functions
//     function test_GetFunctionInfo_GrantRole() public {
//         DiamondABILoader.FunctionInfo memory info = DiamondABILoader.getFunctionInfo(
//             abiJson,
//             "grantRole"
//         );

//         assertTrue(info.exists, "grantRole() function should exist");
//         assertEq(info.name, "grantRole", "Function name should match");
//         assertEq(info.signature, "grantRole(bytes32,address)", "Function signature should match");

//         // grantRole(bytes32,address) selector
//         bytes4 expectedSelector = bytes4(keccak256("grantRole(bytes32,address)"));
//         assertEq(info.selector, expectedSelector, "Selector should match");

//         console.log("\nFunction info for 'grantRole':");
//         console.log("  Name:", info.name);
//         console.log("  Signature:", info.signature);
//         console.log("  Selector:");
//         console.logBytes4(info.selector);
//     }

//     /// @notice Test getFunctionInfo for non-existent function
//     function test_GetFunctionInfo_NonExistent() public {
//         DiamondABILoader.FunctionInfo memory info = DiamondABILoader.getFunctionInfo(
//             abiJson,
//             "nonExistentFunction"
//         );

//         assertFalse(info.exists, "Non-existent function should not exist");
//         assertEq(info.name, "", "Name should be empty");
//         assertEq(info.signature, "", "Signature should be empty");
//         assertEq(info.selector, bytes4(0), "Selector should be zero");
//     }

//     /// @notice Task 1.5: Test verifySelectorsMatch with matching selectors
//     function test_VerifySelectorsMatch_Success() public {
//         bytes4[] memory extracted = new bytes4[](3);
//         extracted[0] = bytes4(keccak256("owner()"));
//         extracted[1] = bytes4(keccak256("transferOwnership(address)"));
//         extracted[2] = bytes4(keccak256("grantRole(bytes32,address)"));

//         bytes4[] memory deployed = new bytes4[](5);
//         deployed[0] = bytes4(keccak256("owner()"));
//         deployed[1] = bytes4(keccak256("renounceOwnership()"));
//         deployed[2] = bytes4(keccak256("transferOwnership(address)"));
//         deployed[3] = bytes4(keccak256("grantRole(bytes32,address)"));
//         deployed[4] = bytes4(keccak256("revokeRole(bytes32,address)"));

//         bool matches = DiamondABILoader.verifySelectorsMatch(extracted, deployed);
//         assertTrue(matches, "All extracted selectors should exist in deployed");

//         console.log("Successfully verified selector matching");
//     }

//     /// @notice Task 1.5: Test verifySelectorsMatch with missing selectors
//     function test_VerifySelectorsMatch_Failure() public {
//         bytes4[] memory extracted = new bytes4[](3);
//         extracted[0] = bytes4(keccak256("owner()"));
//         extracted[1] = bytes4(keccak256("nonExistentFunction()"));
//         extracted[2] = bytes4(keccak256("grantRole(bytes32,address)"));

//         bytes4[] memory deployed = new bytes4[](3);
//         deployed[0] = bytes4(keccak256("owner()"));
//         deployed[1] = bytes4(keccak256("transferOwnership(address)"));
//         deployed[2] = bytes4(keccak256("grantRole(bytes32,address)"));

//         bool matches = DiamondABILoader.verifySelectorsMatch(extracted, deployed);
//         assertFalse(matches, "Should fail when extracted selector missing from deployed");

//         console.log("Correctly detected missing selector");
//     }

//     /// @notice Test comprehensive ABI extraction
//     function test_ComprehensiveABIExtraction() public {
//         bytes4[] memory selectors = DiamondABILoader.extractSelectors(abiJson);
//         string[] memory signatures = DiamondABILoader.extractSignatures(abiJson);

//         console.log("\n=== Comprehensive ABI Extraction Report ===");
//         console.log("Total functions:", selectors.length);

//         // Display all function info
//         console.log("\nAll functions:");
//         for (uint256 i = 0; i < selectors.length; i++) {
//             console.log("\n  Function", i, ":");
//             console.log("    Signature:", signatures[i]);
//             console.log("    Selector:");
//             console.logBytes4(selectors[i]);
//         }

//         // Verify consistency
//         assertEq(selectors.length, signatures.length, "Should have matching counts");
//         assertTrue(selectors.length >= 10, "Should have at least 10 functions in ExampleDiamond");
//     }

//     /// @notice Helper to check if a string contains a character
//     function _containsChar(string memory str, string memory char) private pure returns (bool) {
//         bytes memory strBytes = bytes(str);
//         bytes memory charBytes = bytes(char);

//         if (charBytes.length != 1 || strBytes.length == 0) {
//             return false;
//         }

//         bytes1 targetChar = charBytes[0];
//         for (uint256 i = 0; i < strBytes.length; i++) {
//             if (strBytes[i] == targetChar) {
//                 return true;
//             }
//         }

//         return false;
//     }
// }
