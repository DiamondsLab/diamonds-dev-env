// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "../../contracts/examplediamond/ExampleDiamond.sol";
import "../../contracts/examplediamond/ExampleOwnershipFacet.sol";
import "../../contracts/examplediamond/ExampleInitFacet.sol";
import "../../contracts/examplediamond/ExampleUpgradeFacet.sol";
import "../../contracts/examplediamond/ExampleConstantsFacet.sol";
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
    address public constantsFacetAddress;
    address public owner;

    /// @notice Deploys a complete Diamond contract with all facets
    /// @dev Deploys in the following order:
    ///      1. DiamondCutFacet
    ///      2. ExampleDiamond (with DiamondCutFacet)
    ///      3. DiamondLoupeFacet
    ///      4. ExampleOwnershipFacet
    ///      5. ExampleInitFacet
    ///      6. ExampleUpgradeFacet
    ///      7. ExampleConstantsFacet
    ///      8. Execute diamond cut to add all facets
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

        // Step 7: Deploy ExampleConstantsFacet
        ExampleConstantsFacet constantsFacet = new ExampleConstantsFacet();
        constantsFacetAddress = address(constantsFacet);

        // Step 8: Prepare diamond cut to add all facets
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](5);

        // Add DiamondLoupeFacet
        bytes4[] memory loupeSelectors = new bytes4[](5);
        loupeSelectors[0] = DiamondLoupeFacet.facets.selector;
        loupeSelectors[1] = DiamondLoupeFacet.facetFunctionSelectors.selector;
        loupeSelectors[2] = DiamondLoupeFacet.facetAddresses.selector;
        loupeSelectors[3] = DiamondLoupeFacet.facetAddress.selector;
        loupeSelectors[4] = 0x01ffc9a7; // supportsInterface
        cut[0] = IDiamondCut.FacetCut({
            facetAddress: diamondLoupeFacetAddress,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: loupeSelectors
        });

        // Add ExampleOwnershipFacet
        bytes4[] memory ownershipSelectors = new bytes4[](12);
        ownershipSelectors[0] = ExampleOwnershipFacet.DEFAULT_ADMIN_ROLE.selector;
        ownershipSelectors[1] = ExampleOwnershipFacet.UPGRADER_ROLE.selector;
        ownershipSelectors[2] = ExampleOwnershipFacet.getRoleAdmin.selector;
        ownershipSelectors[3] = ExampleOwnershipFacet.getRoleMember.selector;
        ownershipSelectors[4] = ExampleOwnershipFacet.getRoleMemberCount.selector;
        ownershipSelectors[5] = ExampleOwnershipFacet.grantRole.selector;
        ownershipSelectors[6] = ExampleOwnershipFacet.hasRole.selector;
        ownershipSelectors[7] = ExampleOwnershipFacet.owner.selector;
        ownershipSelectors[8] = ExampleOwnershipFacet.renounceRole.selector;
        ownershipSelectors[9] = ExampleOwnershipFacet.revokeRole.selector;
        ownershipSelectors[10] = ExampleOwnershipFacet.transferOwnership.selector;
        ownershipSelectors[11] = 0x01ffc9a7; // supportsInterface (duplicate, will be skipped)
        cut[1] = IDiamondCut.FacetCut({
            facetAddress: ownershipFacetAddress,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: ownershipSelectors
        });

        // Add ExampleInitFacet
        bytes4[] memory initSelectors = new bytes4[](3);
        initSelectors[0] = ExampleInitFacet.init.selector;
        initSelectors[1] = ExampleInitFacet.exampleInit.selector;
        initSelectors[2] = ExampleInitFacet.reInit.selector;
        cut[2] = IDiamondCut.FacetCut({
            facetAddress: initFacetAddress,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: initSelectors
        });

        // Add ExampleUpgradeFacet
        bytes4[] memory upgradeSelectors = new bytes4[](3);
        upgradeSelectors[0] = ExampleUpgradeFacet.getCurrentVersion.selector;
        upgradeSelectors[1] = ExampleUpgradeFacet.getUpgradeHistory.selector;
        upgradeSelectors[2] = ExampleUpgradeFacet.setVersion.selector;
        cut[3] = IDiamondCut.FacetCut({
            facetAddress: upgradeFacetAddress,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: upgradeSelectors
        });

        // Add ExampleConstantsFacet
        bytes4[] memory constantsSelectors = new bytes4[](1);
        constantsSelectors[0] = ExampleConstantsFacet.getConstants.selector;
        cut[4] = IDiamondCut.FacetCut({
            facetAddress: constantsFacetAddress,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: constantsSelectors
        });

        // Execute the diamond cut
        IDiamondCut(diamondAddress).diamondCut(cut, address(0), "");
    }

    /// @notice Returns the deployed Diamond address
    /// @return The address of the deployed ExampleDiamond
    function getDiamondAddress() external view returns (address) {
        return diamondAddress;
    }

    /// @notice Returns all deployed facet addresses
    /// @return Array of facet addresses in order: [DiamondCut, DiamondLoupe, Ownership, Init, Upgrade, Constants]
    function getFacetAddresses() external view returns (address[6] memory) {
        return [
            diamondCutFacetAddress,
            diamondLoupeFacetAddress,
            ownershipFacetAddress,
            initFacetAddress,
            upgradeFacetAddress,
            constantsFacetAddress
        ];
    }

    /// @notice Returns the owner of the deployed Diamond
    /// @return The owner address
    function getOwner() external view returns (address) {
        return owner;
    }
}
