// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockPairButter {
    string public pairName;
    address public longToken;
    address public shortToken;

    constructor(string memory _pairName, address _longToken, address _shortToken) {
        pairName = _pairName;
        longToken = _longToken;
        shortToken = _shortToken;
    }
}
