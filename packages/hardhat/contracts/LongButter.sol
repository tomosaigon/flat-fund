// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LongButter is ERC20, Ownable {
    constructor() ERC20("Long Butter Nov 2023", "LBUTTER1123") {}

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }
}
