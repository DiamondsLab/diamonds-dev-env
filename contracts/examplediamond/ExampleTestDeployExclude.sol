// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

/**
 * @title ExampleTestDeployExclude
 * @author DiamondsLab
 * @notice This contract serves as an example facet for testing deployment inclusion and exclusion logic in Diamond proxies.
 * @dev This facet includes two test functions to demonstrate selective deployment behaviors based on configuration.
 */
contract ExampleTestDeployExclude {
  /**
   * @notice Tests the deployment exclusion functionality.
   * @dev This function is intended to be excluded during certain deployment scenarios as per the Diamond configuration.
   * It performs a simple operation to verify facet behavior.
   * @return A boolean indicating the success of the test operation.
   */
  function testDeployExclude() external pure returns (bool) {
    return true;
  }

  /**
   * @notice Tests the deployment inclusion functionality.
   * @dev This function is intended to be included during deployment as per the Diamond configuration.
   * It performs a simple operation to verify facet behavior.
   * @return A boolean indicating the success of the test operation.
   */
  function testDeployInclude() external pure returns (bool) {
    return true;
  }
}