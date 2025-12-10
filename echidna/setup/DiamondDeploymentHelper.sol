// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "../../contracts/examplediamond/ExampleDiamond.sol";
import "../../contracts/examplediamond/ExampleOwnershipFacet.sol";
import "../../contracts/examplediamond/ExampleInitFacet.sol";
import "../../contracts/examplediamond/ExampleUpgradeFacet.sol";
import "contracts-starter/contracts/facets/DiamondCutFacet.sol";
import "contracts-starter/contracts/facets/DiamondLoupeFacet.sol";
import "contracts-starter/contracts/interfaces/IDiamondCut.sol";

/// @title DiamondDeploymentHelper
/// @notice Helper contract to deploy Diamond contracts for Echidna fuzzing tests
/// @dev This contract handles the deployment of ExampleDiamond with all its facets
contract DiamondDeploymentHelper {
    address public diamondAddress;
    address public diamondCutFacetAddress;
    address public diamondLoupeFacetAddress;
    address public ownershipFacetAddress;
    address public initFacetAddress;
    address public upgradeFacetAddress;
    address public owner;

    IDiamondCut.FacetCut[] private facetCuts;

    /// @notice Deploys a complete Diamond contract with all facets
    /// @dev Deploys in the following order:
    ///      1. DiamondCutFacet
    ///      2. ExampleDiamond (with DiamondCutFacet)
    ///      3. DiamondLoupeFacet
    ///      4. ExampleOwnershipFacet
    ///      5. ExampleInitFacet
    ///      6. ExampleUpgradeFacet
    ///      7. Execute diamond cut to add all facets
    constructor() {
        // Set the owner to the deployer (Echidna)
        owner = msg.sender;

        // Step 1: Deploy DiamondCutFacet
        DiamondCutFacet diamondCutFacet = new DiamondCutFacet();
        diamondCutFacetAddress = address(diamondCutFacet);

        // Step 2: Deploy ExampleDiamond with owner and DiamondCutFacet
        ExampleDiamond diamond = new ExampleDiamond(owner, diamondCutFacetAddress);
        diamondAddress = address(diamond);

        // Step 3: Deploy DiamondLoupeFacet
        DiamondLoupeFacet diamondLoupeFacet = new DiamondLoupeFacet();
        diamondLoupeFacetAddress = address(diamondLoupeFacet);

        // Step 4: Deploy ExampleOwnershipFacet
        ExampleOwnershipFacet ownershipFacet = new ExampleOwnershipFacet();
        ownershipFacetAddress = address(ownershipFacet);

        // Step 5: Deploy ExampleInitFacet
        ExampleInitFacet initFacet = new ExampleInitFacet();
        initFacetAddress = address(initFacet);

        // Step 6: Deploy ExampleUpgradeFacet
        ExampleUpgradeFacet upgradeFacet = new ExampleUpgradeFacet();
        upgradeFacetAddress = address(upgradeFacet);

        // Step 7: Prepare diamond cut to add all facets
        // Note: We can't execute the cut here because only the owner can call diamondCut
        // Store the cuts for the test contract to execute

        // Add DiamondLoupeFacet
        bytes4[] memory loupeSelectors = new bytes4[](5);
        loupeSelectors[0] = bytes4(keccak256("facets()"));
        loupeSelectors[1] = bytes4(keccak256("facetFunctionSelectors(address)"));
        loupeSelectors[2] = bytes4(keccak256("facetAddresses()"));
        loupeSelectors[3] = bytes4(keccak256("facetAddress(bytes4)"));
        loupeSelectors[4] = bytes4(keccak256("supportsInterface(bytes4)"));
        facetCuts.push(
            IDiamondCut.FacetCut({
                facetAddress: diamondLoupeFacetAddress,
                action: IDiamondCut.FacetCutAction.Add,
                functionSelectors: loupeSelectors
            })
        );

        // Add ExampleOwnershipFacet
        bytes4[] memory ownershipSelectors = new bytes4[](11);
        ownershipSelectors[0] = bytes4(keccak256("DEFAULT_ADMIN_ROLE()"));
        ownershipSelectors[1] = bytes4(keccak256("UPGRADER_ROLE()"));
        ownershipSelectors[2] = bytes4(keccak256("getRoleAdmin(bytes32)"));
        ownershipSelectors[3] = bytes4(keccak256("getRoleMember(bytes32,uint256)"));
        ownershipSelectors[4] = bytes4(keccak256("getRoleMemberCount(bytes32)"));
        ownershipSelectors[5] = bytes4(keccak256("grantRole(bytes32,address)"));
        ownershipSelectors[6] = bytes4(keccak256("hasRole(bytes32,address)"));
        ownershipSelectors[7] = bytes4(keccak256("owner()"));
        ownershipSelectors[8] = bytes4(keccak256("renounceRole(bytes32,address)"));
        ownershipSelectors[9] = bytes4(keccak256("revokeRole(bytes32,address)"));
        ownershipSelectors[10] = bytes4(keccak256("transferOwnership(address)"));
        facetCuts.push(
            IDiamondCut.FacetCut({
                facetAddress: ownershipFacetAddress,
                action: IDiamondCut.FacetCutAction.Add,
                functionSelectors: ownershipSelectors
            })
        );

        // Add ExampleInitFacet
        bytes4[] memory initSelectors = new bytes4[](3);
        initSelectors[0] = bytes4(keccak256("init(address)"));
        initSelectors[1] = bytes4(keccak256("exampleInit(address)"));
        initSelectors[2] = bytes4(keccak256("reInit()"));
        facetCuts.push(
            IDiamondCut.FacetCut({
                facetAddress: initFacetAddress,
                action: IDiamondCut.FacetCutAction.Add,
                functionSelectors: initSelectors
            })
        );

        // Add ExampleUpgradeFacet
        bytes4[] memory upgradeSelectors = new bytes4[](3);
        upgradeSelectors[0] = bytes4(keccak256("getCurrentVersion()"));
        upgradeSelectors[1] = bytes4(keccak256("getUpgradeHistory()"));
        upgradeSelectors[2] = bytes4(keccak256("setVersion(uint256,string)"));
        facetCuts.push(
            IDiamondCut.FacetCut({
                facetAddress: upgradeFacetAddress,
                action: IDiamondCut.FacetCutAction.Add,
                functionSelectors: upgradeSelectors
            })
        );

        // Note: The diamond cut must be executed by the owner (deployer)
        // We store the cut data and let the test contract execute it
        // For now, we skip the diamond cut in constructor
        // The test contract will need to execute it after deployment
    }

    /// @notice Returns the deployed Diamond address
    /// @return The address of the deployed ExampleDiamond
    function getDiamondAddress() external view returns (address) {
        return diamondAddress;
    }

    /// @notice Returns all deployed facet addresses
    /// @return Array of facet addresses in order: [DiamondCut, DiamondLoupe, Ownership, Init, Upgrade]
    function getFacetAddresses() external view returns (address[5] memory) {
        return [
            diamondCutFacetAddress,
            diamondLoupeFacetAddress,
            ownershipFacetAddress,
            initFacetAddress,
            upgradeFacetAddress
        ];
    }

    /// @notice Returns the owner of the deployed Diamond
    /// @return The owner address
    function getOwner() external view returns (address) {
        return owner;
    }

    /// @notice Returns the facet cuts that need to be executed
    /// @return Array of facet cuts
    function getFacetCuts() external view returns (IDiamondCut.FacetCut[] memory) {
        return facetCuts;
    }
}
