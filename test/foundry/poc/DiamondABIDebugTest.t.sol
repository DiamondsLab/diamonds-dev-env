// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

/// @title Simple Diamond ABI Debug Test
/// @notice Simplified test to debug the revert issue
contract DiamondABIDebugTest is Test {
    string constant DIAMOND_ABI_PATH = "./diamond-abi/ExampleDiamond.json";

    function test_CountFunctions() public {
        string memory abiJson = vm.readFile(DIAMOND_ABI_PATH);

        uint256 functionCount = 0;
        uint256 totalCount = 0;

        // Count all entries and functions
        for (uint256 i = 0; i < 500; i++) {
            string memory indexPath = string(abi.encodePacked(".abi[", vm.toString(i), "]"));

            try vm.parseJson(abiJson, string(abi.encodePacked(indexPath, ".type"))) returns (
                bytes memory typeBytes
            ) {
                totalCount++;
                string memory entryType = abi.decode(typeBytes, (string));

                if (keccak256(bytes(entryType)) == keccak256(bytes("function"))) {
                    functionCount++;
                }
            } catch {
                console.log("Stopped at index:", i);
                break;
            }
        }

        console.log("Total ABI entries:", totalCount);
        console.log("Function entries:", functionCount);

        assertTrue(functionCount > 0, "Should have at least one function");
    }

    function test_ExtractFirstFunction() public {
        string memory abiJson = vm.readFile(DIAMOND_ABI_PATH);

        // Find first function and extract its info
        for (uint256 i = 0; i < 200; i++) {
            string memory indexPath = string(abi.encodePacked(".abi[", vm.toString(i), "]"));

            try vm.parseJson(abiJson, string(abi.encodePacked(indexPath, ".type"))) returns (
                bytes memory typeBytes
            ) {
                string memory entryType = abi.decode(typeBytes, (string));

                if (keccak256(bytes(entryType)) == keccak256(bytes("function"))) {
                    // Found a function - get name
                    string memory functionName = abi.decode(
                        vm.parseJson(abiJson, string(abi.encodePacked(indexPath, ".name"))),
                        (string)
                    );

                    console.log("First function found at index:", i);
                    console.log("Function name:", functionName);

                    // Try to build signature
                    string memory signature = functionName;
                    signature = string(abi.encodePacked(signature, "("));

                    // Check if inputs array has elements by checking first element
                    // vm.parseJson returns 0-length bytes for empty array access
                    bytes memory firstInputBytes = vm.parseJson(
                        abiJson,
                        string(abi.encodePacked(indexPath, ".inputs[0].type"))
                    );

                    uint256 inputCount = 0;
                    if (firstInputBytes.length > 0) {
                        // Has at least one input
                        inputCount = 1;
                        for (uint256 j = 1; j < 20; j++) {
                            bytes memory inputBytes = vm.parseJson(
                                abiJson,
                                string(
                                    abi.encodePacked(
                                        indexPath,
                                        ".inputs[",
                                        vm.toString(j),
                                        "].type"
                                    )
                                )
                            );
                            if (inputBytes.length == 0) {
                                break;
                            }
                            inputCount++;
                        }
                    }

                    console.log("Input count:", inputCount);

                    // Build parameter list
                    for (uint256 j = 0; j < inputCount; j++) {
                        string memory inputPath = string(
                            abi.encodePacked(indexPath, ".inputs[", vm.toString(j), "].type")
                        );
                        string memory paramType = abi.decode(
                            vm.parseJson(abiJson, inputPath),
                            (string)
                        );

                        console.log("  Param", j, ":", paramType);

                        signature = string(abi.encodePacked(signature, paramType));
                        if (j < inputCount - 1) {
                            signature = string(abi.encodePacked(signature, ","));
                        }
                    }

                    signature = string(abi.encodePacked(signature, ")"));

                    console.log("Full signature:", signature);

                    bytes4 selector = bytes4(keccak256(bytes(signature)));
                    console.log("Selector:");
                    console.logBytes4(selector);

                    return; // Success - exit test
                }
            } catch {
                break;
            }
        }

        fail("Should find at least one function");
    }
}
