// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

/// @title Test JSON parsing behavior
contract JSONParseTest is Test {
    function test_ParseEmptyArray() public {
        string memory json = '{"inputs": []}';

        // Try to parse the inputs array
        bytes memory inputsBytes = vm.parseJson(json, ".inputs");
        console.log("Inputs bytes length:", inputsBytes.length);

        // Try to access first element
        try vm.parseJson(json, ".inputs[0]") returns (bytes memory elem) {
            console.log("Element bytes length:", elem.length);
            fail("Should not succeed parsing empty array element");
        } catch (bytes memory reason) {
            console.log("Correctly threw error on empty array access");
            console.logBytes(reason);
        }
    }

    function test_ParseArrayWithElement() public pure {
        string memory json = '{"inputs": [{"type": "address"}]}';

        // Try to parse the inputs array
        bytes memory inputsBytes = vm.parseJson(json, ".inputs");
        console.log("Inputs bytes length:", inputsBytes.length);

        // Try to access first element
        bytes memory elem = vm.parseJson(json, ".inputs[0].type");
        string memory typeStr = abi.decode(elem, (string));
        console.log("Type:", typeStr);

        assertEq(typeStr, "address");
    }
}
