// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

/// @title Diamond ABI Loader
/// @notice Helper library to load and parse Diamond ABI files in Forge tests
/// @dev Uses vm.readFile() and vm.parseJson() cheatcodes to extract function information
/// @custom:task Task 1.0: Setup Diamond ABI loading infrastructure
library DiamondABILoader {
    using stdJson for string;

    /// @notice Structure to hold parsed function information
    struct FunctionInfo {
        string name; // Function name (e.g., "owner")
        string signature; // Full signature (e.g., "owner()")
        bytes4 selector; // Function selector (bytes4(keccak256("owner()")))
        bool isView; // True if view/pure function
        bool exists; // True if function was found
    }

    /// @notice Load Diamond ABI from file path
    /// @dev Task 1.2: Create POC test reading Diamond ABI file
    /// @param abiPath Path to the Diamond ABI JSON file (e.g., "./diamond-abi/ExampleDiamond.json")
    /// @return abiJson The raw JSON string content
    function loadDiamondABI(string memory abiPath) internal view returns (string memory abiJson) {
        Vm vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
        abiJson = vm.readFile(abiPath);
        require(bytes(abiJson).length > 0, "DiamondABILoader: Empty ABI file");
    }

    /// @notice Extract all function selectors from Diamond ABI
    /// @dev Task 1.3: Extract function selectors for validation
    /// @param abiJson The raw JSON string from Diamond ABI file
    /// @return selectors Array of function selectors found in the ABI
    function extractSelectors(
        string memory abiJson
    ) internal pure returns (bytes4[] memory selectors) {
        Vm vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

        // First pass: count functions (optimized to stop early if possible)
        uint256 functionCount = 0;
        uint256 maxIndex = 0;

        for (uint256 i = 0; i < 300; i++) {
            bytes memory typeBytes = vm.parseJson(
                abiJson,
                string(abi.encodePacked(".abi[", vm.toString(i), "].type"))
            );
            if (typeBytes.length == 0) {
                maxIndex = i;
                break;
            }
            string memory entryType = abi.decode(typeBytes, (string));
            if (keccak256(bytes(entryType)) == keccak256(bytes("function"))) {
                functionCount++;
            }
        }

        require(functionCount > 0, "DiamondABILoader: No functions found in ABI");

        // Allocate and populate in single pass
        selectors = new bytes4[](functionCount);
        uint256 selectorIndex = 0;

        for (uint256 i = 0; i < maxIndex && selectorIndex < functionCount; i++) {
            bytes memory typeBytes = vm.parseJson(
                abiJson,
                string(abi.encodePacked(".abi[", vm.toString(i), "].type"))
            );
            string memory entryType = abi.decode(typeBytes, (string));

            if (keccak256(bytes(entryType)) == keccak256(bytes("function"))) {
                string memory indexPath = string(abi.encodePacked(".abi[", vm.toString(i), "]"));

                // Extract function name
                string memory functionName = abi.decode(
                    vm.parseJson(abiJson, string(abi.encodePacked(indexPath, ".name"))),
                    (string)
                );

                // Build signature and compute selector
                string memory signature = _buildSignature(vm, abiJson, indexPath, functionName);
                selectors[selectorIndex] = bytes4(keccak256(bytes(signature)));
                selectorIndex++;
            }
        }

        return selectors;
    }

    /// @notice Extract function signatures from Diamond ABI
    /// @dev Task 1.4: Extract function signatures for call encoding
    /// @param abiJson The raw JSON string from Diamond ABI file
    /// @return signatures Array of function signatures (e.g., ["owner()", "transferOwnership(address)"])
    function extractSignatures(
        string memory abiJson
    ) internal pure returns (string[] memory signatures) {
        Vm vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

        // First pass: count functions
        uint256 functionCount = 0;
        uint256 maxIndex = 0;

        for (uint256 i = 0; i < 300; i++) {
            bytes memory typeBytes = vm.parseJson(
                abiJson,
                string(abi.encodePacked(".abi[", vm.toString(i), "].type"))
            );
            if (typeBytes.length == 0) {
                maxIndex = i;
                break;
            }
            string memory entryType = abi.decode(typeBytes, (string));
            if (keccak256(bytes(entryType)) == keccak256(bytes("function"))) {
                functionCount++;
            }
        }

        require(functionCount > 0, "DiamondABILoader: No functions found in ABI");

        // Allocate and populate in single pass
        signatures = new string[](functionCount);
        uint256 signatureIndex = 0;

        for (uint256 i = 0; i < maxIndex && signatureIndex < functionCount; i++) {
            bytes memory typeBytes = vm.parseJson(
                abiJson,
                string(abi.encodePacked(".abi[", vm.toString(i), "].type"))
            );
            string memory entryType = abi.decode(typeBytes, (string));

            if (keccak256(bytes(entryType)) == keccak256(bytes("function"))) {
                string memory indexPath = string(abi.encodePacked(".abi[", vm.toString(i), "]"));

                // Extract function name
                string memory functionName = abi.decode(
                    vm.parseJson(abiJson, string(abi.encodePacked(indexPath, ".name"))),
                    (string)
                );

                // Build and store signature
                signatures[signatureIndex] = _buildSignature(vm, abiJson, indexPath, functionName);
                signatureIndex++;
            }
        }

        return signatures;
    }

    /// @notice Get detailed information about a specific function by name
    /// @dev Combines Tasks 1.3 & 1.4: Extract selector and signature for a named function
    /// @param abiJson The raw JSON string from Diamond ABI file
    /// @param targetFunctionName The name of the function to find
    /// @return info FunctionInfo struct with name, signature, selector, and metadata
    function getFunctionInfo(
        string memory abiJson,
        string memory targetFunctionName
    ) internal pure returns (FunctionInfo memory info) {
        Vm vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

        info.exists = false;

        for (uint256 i = 0; i < 300; i++) {
            bytes memory typeBytes = vm.parseJson(
                abiJson,
                string(abi.encodePacked(".abi[", vm.toString(i), "].type"))
            );
            if (typeBytes.length == 0) {
                break; // Reached end of ABI array
            }

            string memory entryType = abi.decode(typeBytes, (string));

            if (keccak256(bytes(entryType)) == keccak256(bytes("function"))) {
                string memory indexPath = string(abi.encodePacked(".abi[", vm.toString(i), "]"));

                // Extract function name
                string memory functionName = abi.decode(
                    vm.parseJson(abiJson, string(abi.encodePacked(indexPath, ".name"))),
                    (string)
                );

                // Check if this is the target function
                if (keccak256(bytes(functionName)) == keccak256(bytes(targetFunctionName))) {
                    info.name = functionName;
                    info.signature = _buildSignature(vm, abiJson, indexPath, functionName);
                    info.selector = bytes4(keccak256(bytes(info.signature)));

                    // Check if view/pure
                    bytes memory mutabilityBytes = vm.parseJson(
                        abiJson,
                        string(abi.encodePacked(indexPath, ".stateMutability"))
                    );
                    if (mutabilityBytes.length > 0) {
                        string memory mutability = abi.decode(mutabilityBytes, (string));
                        info.isView = (keccak256(bytes(mutability)) == keccak256(bytes("view")) ||
                            keccak256(bytes(mutability)) == keccak256(bytes("pure")));
                    }

                    info.exists = true;
                    return info;
                }
            }
        }

        return info;
    }

    /// @notice Build function signature from ABI entry
    /// @dev Internal helper to construct signatures like "transfer(address,uint256)"
    /// @param vm The Vm instance for cheatcodes
    /// @param abiJson The raw JSON string from Diamond ABI file
    /// @param indexPath The JSON path to the function entry (e.g., ".abi[5]")
    /// @param functionName The name of the function
    /// @return signature The complete function signature
    function _buildSignature(
        Vm vm,
        string memory abiJson,
        string memory indexPath,
        string memory functionName
    ) private pure returns (string memory signature) {
        // Start with function name
        signature = functionName;
        signature = string(abi.encodePacked(signature, "("));

        // Try to access first input element's type
        // vm.parseJson returns 0-length bytes for empty array access
        bytes memory firstInputBytes = vm.parseJson(
            abiJson,
            string(abi.encodePacked(indexPath, ".inputs[0].type"))
        );

        if (firstInputBytes.length > 0) {
            // Has at least one input
            uint256 inputCount = 1;

            // Count remaining inputs
            for (uint256 j = 1; j < 20; j++) {
                bytes memory inputBytes = vm.parseJson(
                    abiJson,
                    string(abi.encodePacked(indexPath, ".inputs[", vm.toString(j), "].type"))
                );
                if (inputBytes.length == 0) {
                    break;
                }
                inputCount++;
            }

            // Build parameter list
            for (uint256 j = 0; j < inputCount; j++) {
                string memory inputPath = string(
                    abi.encodePacked(indexPath, ".inputs[", vm.toString(j), "].type")
                );
                string memory paramType = abi.decode(vm.parseJson(abiJson, inputPath), (string));

                signature = string(abi.encodePacked(signature, paramType));
                if (j < inputCount - 1) {
                    signature = string(abi.encodePacked(signature, ","));
                }
            }
        }
        // If firstInputBytes.length == 0, inputs array is empty (no parameters)

        signature = string(abi.encodePacked(signature, ")"));
        return signature;
    }

    /// @notice Verify that extracted selectors match deployed Diamond's selectors
    /// @dev Task 1.5: Verify selectors match deployment via DiamondLoupe
    /// @param extractedSelectors Array of selectors from ABI file
    /// @param deployedSelectors Array of selectors from DiamondLoupe.facetFunctionSelectors()
    /// @return matches True if all extracted selectors exist in deployed selectors
    function verifySelectorsMatch(
        bytes4[] memory extractedSelectors,
        bytes4[] memory deployedSelectors
    ) internal pure returns (bool matches) {
        if (extractedSelectors.length == 0 || deployedSelectors.length == 0) {
            return false;
        }

        // Check that all extracted selectors exist in deployed selectors
        uint256 matchCount = 0;
        for (uint256 i = 0; i < extractedSelectors.length; i++) {
            for (uint256 j = 0; j < deployedSelectors.length; j++) {
                if (extractedSelectors[i] == deployedSelectors[j]) {
                    matchCount++;
                    break;
                }
            }
        }

        return matchCount == extractedSelectors.length;
    }
}
