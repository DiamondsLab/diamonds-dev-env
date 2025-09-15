// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/** @title Example Upgrade Facet
 *  @dev This facet creates some simple functions that can be called to prove that the
 *  facet was deployed, the selector registered with the diamond and the monitor works for
 *  the Example Diamond.
 */
contract ExampleUpgradeFacet {
    // Function to demonstrate that the facet is deployed
    function isDeployed() external pure returns (bool) {
        return true;
    }

    // Function to demonstrate that the selector is registered
    function getSelector() external pure returns (bytes4) {
        return this.getSelector.selector;
    }

    // Function to demonstrate that the monitor works
    function getMonitorData() external pure returns (string memory) {
        return "Monitor data for ExampleUpgradeFacet";
    }
}