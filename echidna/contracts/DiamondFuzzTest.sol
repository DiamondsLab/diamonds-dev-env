// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "../setup/DiamondDeploymentHelper.sol";
import "../setup/IExampleDiamond.sol";
import "contracts-starter/contracts/interfaces/IDiamondLoupe.sol";

/// @title DiamondFuzzTest
/// @notice Echidna fuzzing test contract for ExampleDiamond
/// @dev This contract demonstrates how to write Echidna property-based fuzzing tests
///      for Diamond proxy contracts. It deploys a fresh Diamond instance and tests
///      invariants that should always hold true.
///
/// HOW TO USE THIS TEST:
/// 1. The Diamond is deployed automatically in the constructor
/// 2. Write invariant functions starting with "echidna_" that return bool
/// 3. Invariants should return true when the property holds
/// 4. Echidna will try to find inputs that make these functions return false
/// 5. Run tests with: yarn echidna:test
///
/// EXAMPLE INVARIANTS DEMONSTRATED:
/// - Owner address is never zero
/// - Diamond has at least one facet registered
/// - Diamond supports required interfaces
/// - Owner can always be retrieved
contract DiamondFuzzTest {
    // Diamond deployment helper that handles all deployment logic
    DiamondDeploymentHelper public deploymentHelper;

    // The deployed Diamond contract address
    address public diamondAddress;

    // Interface to interact with the Diamond
    IExampleDiamond public diamond;

    // The owner of the Diamond (set during deployment)
    address public owner;

    /// @notice Constructor deploys the Diamond and sets up test environment
    /// @dev This is called once by Echidna before fuzzing begins
    ///      The deployment helper deploys ExampleDiamond with all facets
    constructor() {
        // Deploy the Diamond using the helper contract
        // This handles all facet deployments
        deploymentHelper = new DiamondDeploymentHelper();

        // Get the deployed Diamond address
        diamondAddress = deploymentHelper.getDiamondAddress();

        // Get the owner (deployer of the Diamond) - this is us (the test contract)
        owner = deploymentHelper.getOwner();

        // Verify initial deployment was successful
        require(diamondAddress != address(0), "Diamond deployment failed");
        require(owner == address(this), "Owner mismatch");

        // Execute the diamond cut to add all facets
        // We can do this because we're the owner
        IDiamondCut.FacetCut[] memory cuts = deploymentHelper.getFacetCuts();
        IExampleDiamond(diamondAddress).diamondCut(cuts, address(0), "");

        // Create interface to interact with Diamond
        diamond = IExampleDiamond(diamondAddress);
    }

    // ============================================
    // ECHIDNA INVARIANT TESTS
    // ============================================
    // These functions must always return true.
    // If Echidna finds inputs that make them return false,
    // it will report a failing test case.

    /// @notice Invariant: Diamond owner should never be zero address
    /// @dev This tests that the ownership system is always properly initialized
    /// @return True if owner is not zero address
    function echidna_owner_not_zero() public view returns (bool) {
        address currentOwner = diamond.owner();
        return currentOwner != address(0);
    }

    /// @notice Invariant: Diamond should always have at least one facet
    /// @dev This tests that the Diamond Loupe functionality works and facets are registered
    /// @return True if at least one facet exists
    function echidna_diamond_has_facets() public view returns (bool) {
        IDiamondLoupe.Facet[] memory facets = diamond.facets();
        return facets.length > 0;
    }

    /// @notice Invariant: Diamond should support the IDiamondLoupe interface
    /// @dev Tests that ERC-165 interface support is working correctly
    /// @return True if IDiamondLoupe interface is supported
    function echidna_supports_loupe_interface() public view returns (bool) {
        // IDiamondLoupe interface ID is 0x48e2b093
        bytes4 loupeInterfaceId = 0x48e2b093;
        return diamond.supportsInterface(loupeInterfaceId);
    }

    /// @notice Invariant: Diamond address should remain constant
    /// @dev The Diamond proxy address should never change during testing
    /// @return True if Diamond address matches the initially deployed address
    function echidna_diamond_address_constant() public view returns (bool) {
        return address(diamond) == diamondAddress;
    }

    /// @notice Invariant: DEFAULT_ADMIN_ROLE should exist and be queryable
    /// @dev Tests that the role-based access control interface is working
    /// @return True if we can query the default admin role
    function echidna_admin_role_exists() public view returns (bool) {
        bytes32 adminRole = diamond.DEFAULT_ADMIN_ROLE();
        // Just checking that we can query the role without reverting
        // The role constant should always be accessible
        return adminRole == 0x00; // DEFAULT_ADMIN_ROLE is typically bytes32(0)
    }

    /// @notice Invariant: At least 4 facets should be registered
    /// @dev Tests that all core facets are present (DiamondCut, Loupe, Ownership, Init, Upgrade)
    /// @return True if at least 4 facets exist
    function echidna_minimum_facet_count() public view returns (bool) {
        return diamond.facetAddresses().length >= 4;
    }

    /// @notice Invariant: At least one function selector should be registered
    /// @dev Tests that the Diamond has callable functions
    /// @return True if facets have at least one function selector
    function echidna_has_function_selectors() public view returns (bool) {
        address[] memory facetAddresses = diamond.facetAddresses();
        if (facetAddresses.length == 0) return false;

        // Check first facet has at least one selector
        bytes4[] memory selectors = diamond.facetFunctionSelectors(facetAddresses[0]);
        return selectors.length > 0;
    }

    /// @notice Invariant: Facet addresses should not be zero
    /// @dev Tests that all registered facets have valid addresses
    /// @return True if all facet addresses are non-zero
    function echidna_facets_not_zero() public view returns (bool) {
        address[] memory facetAddresses = diamond.facetAddresses();
        for (uint256 i = 0; i < facetAddresses.length; i++) {
            if (facetAddresses[i] == address(0)) {
                return false;
            }
        }
        return true;
    }

    /// @notice Invariant: Owner query should never revert
    /// @dev Tests that the owner() function is always callable
    /// @return True if owner query succeeds
    function echidna_owner_query_succeeds() public view returns (bool) {
        // If this doesn't revert, the function is working
        address currentOwner = diamond.owner();
        // Return true if we got here (no revert)
        return true;
    }

    // ============================================
    // HELPER FUNCTIONS FOR TESTING
    // ============================================
    // These are utility functions that can be used
    // in more complex test scenarios

    /// @notice Get the number of facets in the Diamond
    /// @return Number of facets
    function getFacetCount() public view returns (uint256) {
        return diamond.facetAddresses().length;
    }

    /// @notice Get the total number of function selectors across all facets
    /// @return Total selector count
    function getTotalSelectorCount() public view returns (uint256) {
        address[] memory facetAddresses = diamond.facetAddresses();
        uint256 totalSelectors = 0;

        for (uint256 i = 0; i < facetAddresses.length; i++) {
            bytes4[] memory selectors = diamond.facetFunctionSelectors(facetAddresses[i]);
            totalSelectors += selectors.length;
        }

        return totalSelectors;
    }

    /// @notice Check if a specific facet address is registered
    /// @param facetAddress The address to check
    /// @return True if the facet is registered
    function isFacetRegistered(address facetAddress) public view returns (bool) {
        address[] memory facetAddresses = diamond.facetAddresses();

        for (uint256 i = 0; i < facetAddresses.length; i++) {
            if (facetAddresses[i] == facetAddress) {
                return true;
            }
        }

        return false;
    }
}

// ============================================
// HOW TO ADD MORE TESTS
// ============================================
//
// 1. Add new invariant functions starting with "echidna_"
// 2. Each function should return bool (true = property holds)
// 3. Use the `diamond` interface to call Diamond functions
// 4. Test different aspects of the Diamond:
//    - State consistency
//    - Access control
//    - Facet management
//    - Upgrade mechanisms
//    - Business logic
//
// EXAMPLE: Test that role count doesn't decrease
//
//   uint256 initialRoleCount;
//
//   function echidna_role_count_never_decreases() public returns (bool) {
//       uint256 currentCount = diamond.getRoleMemberCount(diamond.DEFAULT_ADMIN_ROLE());
//       if (initialRoleCount == 0) {
//           initialRoleCount = currentCount;
//       }
//       return currentCount >= initialRoleCount;
//   }
//
// ============================================
// INTERPRETING ECHIDNA OUTPUT
// ============================================
//
// ✓ echidna_owner_not_zero: passed
//   - Property held for all test sequences
//
// ✗ echidna_some_property: failed
//   - Echidna found a counterexample (sequence of calls that breaks the property)
//   - Check the output for the failing sequence
//
// Coverage: echidna/coverage/
//   - Shows which lines of code were executed during fuzzing
//   - Helps identify untested code paths
//
// Corpus: echidna/corpus/
//   - Contains test sequences that achieved new coverage
//   - Can be reused across test runs for regression testing
