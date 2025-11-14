// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "./DiamondABILoader.sol";

/// @title DiamondFuzzBase
/// @notice Abstract base contract for Diamond fuzzing tests with helper functions
/// @dev Inherit from this contract to create Diamond fuzzing tests
/// @custom:task Task 3.0: Develop reusable Diamond testing library
/// @custom:usage contract MyFuzzTest is DiamondFuzzBase { ... }
abstract contract DiamondFuzzBase is Test {
    using DiamondABILoader for string;

    /// @notice Deployed Diamond contract address
    /// @dev Loaded from deployment file in setUp()
    address internal diamond;

    /// @notice Diamond ABI JSON content
    /// @dev Loaded from diamond-abi/ExampleDiamond.json
    string internal diamondABI;

    /// @notice Array of all function selectors in the Diamond
    bytes4[] internal diamondSelectors;

    /// @notice Array of all function signatures in the Diamond
    string[] internal diamondSignatures;

    /// @notice Mapping of selector to function name for debugging
    mapping(bytes4 => string) internal selectorToName;

    /// @notice Error for failed Diamond calls
    error DiamondCallFailed(bytes4 selector, bytes data, bytes returnData);

    /// @notice Error for unexpected Diamond success
    error DiamondCallUnexpectedSuccess(bytes4 selector, bytes data, bytes returnData);

    /// @notice Event emitted when Diamond is loaded
    event DiamondLoaded(address indexed diamondAddress, uint256 functionCount);

    /// @notice Event emitted for gas measurement
    event GasMeasurement(bytes4 indexed selector, string functionName, uint256 gasUsed);

    /// @notice Load deployed Diamond address from deployment file
    /// @dev Task 3.5: Reads .forge-diamond-address file created by deployment script
    /// @return diamondAddress The deployed Diamond contract address
    function _loadDiamondAddress() internal view returns (address diamondAddress) {
        string memory deploymentPath = "./.forge-diamond-address";
        string memory deploymentJson = vm.readFile(deploymentPath);

        // Parse the diamondAddress field
        bytes memory addressBytes = vm.parseJson(deploymentJson, ".diamondAddress");
        diamondAddress = abi.decode(addressBytes, (address));

        require(diamondAddress != address(0), "DiamondFuzzBase: Invalid Diamond address");
        require(diamondAddress.code.length > 0, "DiamondFuzzBase: Diamond has no code");

        return diamondAddress;
    }

    /// @notice Load and parse Diamond ABI file
    /// @dev Task 3.6: Uses DiamondABILoader to extract selectors and signatures
    function _loadDiamondABI() internal {
        string memory abiPath = "./diamond-abi/ExampleDiamond.json";

        // Load ABI JSON
        diamondABI = DiamondABILoader.loadDiamondABI(abiPath);

        // Extract selectors and signatures
        diamondSelectors = DiamondABILoader.extractSelectors(diamondABI);
        diamondSignatures = DiamondABILoader.extractSignatures(diamondABI);

        require(diamondSelectors.length > 0, "DiamondFuzzBase: No selectors found");
        require(
            diamondSelectors.length == diamondSignatures.length,
            "DiamondFuzzBase: Selector/signature count mismatch"
        );

        // Build selector to name mapping for debugging
        for (uint256 i = 0; i < diamondSelectors.length; i++) {
            selectorToName[diamondSelectors[i]] = diamondSignatures[i];
        }

        emit DiamondLoaded(diamond, diamondSelectors.length);
    }

    /// @notice Call a Diamond function with selector and encoded arguments
    /// @dev Task 3.7: Low-level call helper for non-payable functions
    /// @param selector The function selector (bytes4)
    /// @param data The encoded function arguments (without selector)
    /// @return success Whether the call succeeded
    /// @return returnData The raw return data from the call
    function _callDiamond(
        bytes4 selector,
        bytes memory data
    ) internal returns (bool success, bytes memory returnData) {
        bytes memory callData = abi.encodePacked(selector, data);
        (success, returnData) = diamond.call(callData);
    }

    /// @notice Call a Diamond function with value (for payable functions)
    /// @dev Task 3.8: Low-level call helper for payable functions
    /// @param selector The function selector (bytes4)
    /// @param data The encoded function arguments (without selector)
    /// @param value The ETH value to send with the call
    /// @return success Whether the call succeeded
    /// @return returnData The raw return data from the call
    function _callDiamondWithValue(
        bytes4 selector,
        bytes memory data,
        uint256 value
    ) internal returns (bool success, bytes memory returnData) {
        bytes memory callData = abi.encodePacked(selector, data);
        (success, returnData) = diamond.call{value: value}(callData);
    }

    /// @notice Expect a Diamond call to revert with specific error
    /// @dev Task 3.9: Helper for testing expected reverts
    /// @param selector The function selector to call
    /// @param data The encoded function arguments
    /// @param expectedError The expected error data (can be empty to expect any revert)
    function _expectDiamondRevert(
        bytes4 selector,
        bytes memory data,
        bytes memory expectedError
    ) internal {
        (bool success, bytes memory returnData) = _callDiamond(selector, data);

        if (success) {
            revert DiamondCallUnexpectedSuccess(selector, data, returnData);
        }

        if (expectedError.length > 0) {
            // Verify exact error match
            assertEq(returnData, expectedError, "Unexpected error data");
        }
        // If expectedError is empty, just verify it reverted (which we already did)
    }

    /// @notice Verify function selector routes to expected facet address
    /// @dev Task 3.10: Uses DiamondLoupe to check facet routing
    /// @param selector The function selector to check
    /// @param expectedFacet The expected facet address (address(0) to just verify it exists)
    /// @return facetAddress The actual facet address for this selector
    function _verifyFacetRouting(
        bytes4 selector,
        address expectedFacet
    ) internal view returns (address facetAddress) {
        // Call facetAddress(bytes4) from DiamondLoupe
        bytes memory callData = abi.encodeWithSignature("facetAddress(bytes4)", selector);
        (bool success, bytes memory returnData) = diamond.staticcall(callData);

        require(success, "DiamondFuzzBase: facetAddress call failed");
        facetAddress = abi.decode(returnData, (address));

        if (expectedFacet != address(0)) {
            assertEq(facetAddress, expectedFacet, "Selector routes to unexpected facet");
        } else {
            assertTrue(facetAddress != address(0), "Selector has no facet");
        }

        return facetAddress;
    }

    /// @notice Measure gas consumption of a Diamond function call
    /// @dev Task 3.11: Gas profiling helper for optimization testing
    /// @param selector The function selector to call
    /// @param data The encoded function arguments
    /// @return gasUsed The gas consumed by the call
    function _measureDiamondGas(
        bytes4 selector,
        bytes memory data
    ) internal returns (uint256 gasUsed) {
        uint256 gasBefore = gasleft();
        (bool success, bytes memory returnData) = _callDiamond(selector, data);
        uint256 gasAfter = gasleft();

        if (!success) {
            revert DiamondCallFailed(selector, data, returnData);
        }

        gasUsed = gasBefore - gasAfter;
        emit GasMeasurement(selector, selectorToName[selector], gasUsed);

        return gasUsed;
    }

    /// @notice Get the Diamond owner address
    /// @dev Task 3.12: Helper to get owner for ownership checks
    /// @return owner The current Diamond owner address
    function _getDiamondOwner() internal view returns (address owner) {
        // Call owner() function - standard in ExampleOwnershipFacet
        bytes memory callData = abi.encodeWithSignature("owner()");
        (bool success, bytes memory returnData) = diamond.staticcall(callData);

        require(success, "DiamondFuzzBase: owner() call failed");
        owner = abi.decode(returnData, (address));

        return owner;
    }

    /// @notice Check if an address has a specific role
    /// @dev Helper for access control testing
    /// @param role The role identifier (bytes32)
    /// @param account The address to check
    /// @return hasRole True if the account has the role
    function _hasRole(bytes32 role, address account) internal view returns (bool hasRole) {
        bytes memory callData = abi.encodeWithSignature("hasRole(bytes32,address)", role, account);
        (bool success, bytes memory returnData) = diamond.staticcall(callData);

        if (!success) {
            return false;
        }

        hasRole = abi.decode(returnData, (bool));
        return hasRole;
    }

    /// @notice Grant a role to an address (requires appropriate permissions)
    /// @dev Helper for access control testing
    /// @param role The role identifier
    /// @param account The address to grant the role to
    function _grantRole(bytes32 role, address account) internal {
        bytes4 selector = bytes4(keccak256("grantRole(bytes32,address)"));
        bytes memory data = abi.encode(role, account);
        (bool success, bytes memory returnData) = _callDiamond(selector, data);

        if (!success) {
            revert DiamondCallFailed(selector, data, returnData);
        }
    }

    /// @notice Revoke a role from an address (requires appropriate permissions)
    /// @dev Helper for access control testing
    /// @param role The role identifier
    /// @param account The address to revoke the role from
    function _revokeRole(bytes32 role, address account) internal {
        bytes4 selector = bytes4(keccak256("revokeRole(bytes32,address)"));
        bytes memory data = abi.encode(role, account);
        (bool success, bytes memory returnData) = _callDiamond(selector, data);

        if (!success) {
            revert DiamondCallFailed(selector, data, returnData);
        }
    }

    /// @notice Get all function selectors in the Diamond
    /// @dev Helper to access loaded selectors
    /// @return selectors Array of all function selectors
    function _getDiamondSelectors() internal view returns (bytes4[] memory selectors) {
        return diamondSelectors;
    }

    /// @notice Get all function signatures in the Diamond
    /// @dev Helper to access loaded signatures
    /// @return signatures Array of all function signatures
    function _getDiamondSignatures() internal view returns (string[] memory signatures) {
        return diamondSignatures;
    }

    /// @notice Get function name for a selector
    /// @dev Helper for debugging and logging
    /// @param selector The function selector
    /// @return name The function signature/name
    function _getFunctionName(bytes4 selector) internal view returns (string memory name) {
        return selectorToName[selector];
    }

    /// @notice Setup function that loads Diamond address and ABI
    /// @dev Task 3.13: Override this in child contracts if needed, but call super.setUp()
    function setUp() public virtual {
        // Load Diamond address from deployment file
        diamond = _loadDiamondAddress();

        // Load and parse Diamond ABI
        _loadDiamondABI();

        // Log for debugging
        console.log("Diamond loaded at:", diamond);
        console.log("Functions found:", diamondSelectors.length);
    }
}
