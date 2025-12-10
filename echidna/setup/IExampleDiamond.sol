// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "contracts-starter/contracts/interfaces/IDiamondCut.sol";
import "contracts-starter/contracts/interfaces/IDiamondLoupe.sol";

/// @title IExampleDiamond
/// @notice Interface for ExampleDiamond combining all facet functions
/// @dev This interface is generated from the diamond-abi and includes all functions
///      exposed by the Diamond proxy contract across all its facets
interface IExampleDiamond {
    // ============================================
    // Events
    // ============================================

    event DiamondCut(IDiamondCut.FacetCut[] _diamondCut, address _init, bytes _calldata);
    event InitLog(address indexed sender, string initializer);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

    // ============================================
    // DiamondCutFacet Functions
    // ============================================

    /// @notice Add/replace/remove any number of functions and optionally execute a function with delegatecall
    /// @param _diamondCut Contains the facet addresses and function selectors
    /// @param _init The address of the contract or facet to execute _calldata
    /// @param _calldata A function call, including function selector and arguments
    function diamondCut(
        IDiamondCut.FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external;

    // ============================================
    // DiamondLoupeFacet Functions
    // ============================================

    /// @notice Gets all facet addresses and their four byte function selectors
    /// @return facets_ Facet
    function facets() external view returns (IDiamondLoupe.Facet[] memory facets_);

    /// @notice Gets all the function selectors supported by a specific facet
    /// @param _facet The facet address
    /// @return facetFunctionSelectors_
    function facetFunctionSelectors(address _facet) external view returns (bytes4[] memory facetFunctionSelectors_);

    /// @notice Get all the facet addresses used by a diamond
    /// @return facetAddresses_
    function facetAddresses() external view returns (address[] memory facetAddresses_);

    /// @notice Gets the facet that supports the given selector
    /// @param _functionSelector The function selector
    /// @return facetAddress_ The facet address
    function facetAddress(bytes4 _functionSelector) external view returns (address facetAddress_);

    /// @notice Query if a contract implements an interface
    /// @param interfaceId The interface identifier, as specified in ERC-165
    /// @return True if the contract implements `interfaceID`
    function supportsInterface(bytes4 interfaceId) external view returns (bool);

    // ============================================
    // ExampleOwnershipFacet Functions
    // ============================================

    function DEFAULT_ADMIN_ROLE() external view returns (bytes32);
    function UPGRADER_ROLE() external view returns (bytes32);
    function getRoleAdmin(bytes32 role) external view returns (bytes32);
    function getRoleMember(bytes32 role, uint256 index) external view returns (address);
    function getRoleMemberCount(bytes32 role) external view returns (uint256);
    function grantRole(bytes32 role, address account) external;
    function hasRole(bytes32 role, address account) external view returns (bool);
    function owner() external view returns (address owner_);
    function renounceRole(bytes32 role, address callerConfirmation) external;
    function revokeRole(bytes32 role, address account) external;
    function transferOwnership(address newOwner) external;

    // ============================================
    // ExampleInitFacet Functions
    // ============================================

    function init(address deployer) external;
    function exampleInit(address deployer) external;
    function reInit() external;

    // ============================================
    // ExampleUpgradeFacet Functions
    // ============================================

    struct UpgradeRecord {
        uint256 version;
        uint256 timestamp;
        address upgradedBy;
        string description;
    }

    function getCurrentVersion() external view returns (uint256);
    function getUpgradeHistory() external view returns (UpgradeRecord[] memory);
    function setVersion(uint256 newVersion, string memory description) external;

    // ============================================
    // ExampleConstantsFacet Functions
    // ============================================

    struct Constants {
        string name;
        string version;
        uint256 chainId;
    }

    function getConstants() external view returns (Constants memory);
}
