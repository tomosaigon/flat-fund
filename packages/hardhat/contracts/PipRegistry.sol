// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ILongShortPair {
	function pairName() external view returns (string memory);
}

// Priced Item Pairs (LSPs) Registry
contract PipRegistry is Ownable {
    bool public paused;
    address[] public whitelist;

    event AddressAdded(address indexed addedBy, address indexed newAddress);
    event ContractPaused(address indexed pausedBy);
    event ContractUnpaused(address indexed unpausedBy);

    constructor() {
        paused = false;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    function pauseContract() public onlyOwner {
        paused = true;
        emit ContractPaused(msg.sender);
    }

    function unpauseContract() public onlyOwner {
        paused = false;
        emit ContractUnpaused(msg.sender);
    }

    function addAddress(address newAddress) public whenNotPaused {
        require(newAddress != address(0), "Invalid address");
        // assume if it has pairName then it's a LSP || revert
        ILongShortPair(newAddress).pairName();
        
        whitelist.push(newAddress);
        emit AddressAdded(msg.sender, newAddress);
    }

    function getAddress(uint256 index) public view returns (address) {
        require(index < whitelist.length, "Index out of bounds");
        return whitelist[index];
    }

    function getWhitelistLength() public view returns (uint256) {
        return whitelist.length;
    }
}
