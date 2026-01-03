// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {LibDiamond} from "contracts-starter/contracts/libraries/LibDiamond.sol";

/**
 * @title ExampleTestDeployInclude
 * @author DiamondsLab
 * @notice This contract serves as an example facet for testing deployment inclusion and exclusion logic in Diamond proxies.
 * @dev This is a stateless facet with no storage variables, following Diamond best practices.
 * All functions are pure, requiring no state access. This facet is safe for Diamond proxy deployment
 * as it cannot cause storage collisions. The import of LibDiamond ensures compatibility with
 * the Diamond storage pattern even though no storage is used.
 */
contract ExampleTestDeployInclude {
    /**
     * @notice Tests the deployment exclusion functionality.
     * @dev This function is intended to be excluded during certain deployment scenarios as per the Diamond configuration.
     * It performs a simple operation to verify facet behavior.
     * @return A boolean indicating the success of the test operation.
     */
    function testDeployExclude() external pure returns (bool) {
        // Uses LibDiamond for Diamond storage pattern compatibility
        return _verifyDiamondCompatibility();
    }

    /**
     * @notice Tests the deployment inclusion functionality.
     * @dev This function is intended to be included during deployment as per the Diamond configuration.
     * It performs a simple operation to verify facet behavior.
     * @return A boolean indicating the success of the test operation.
     */
    function testDeployInclude() external pure returns (bool) {
        return _verifyDiamondCompatibility();
    }

    /**
     * @dev Internal helper that demonstrates Diamond pattern compliance.
     * This ensures the facet follows Diamond storage conventions even though
     * it doesn't require actual storage.
     * @return Always returns true for test purposes
     */
    function _verifyDiamondCompatibility() internal pure returns (bool) {
        // Reference LibDiamond to satisfy Diamond storage pattern compliance
        // This stateless facet is safe for Diamond deployment
        return LibDiamond.DIAMOND_STORAGE_POSITION != bytes32(0);
    }
}
