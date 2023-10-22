// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MultiAssetWeightedVault.sol";

contract MultiAssetWeightedVaultFactory {
    address[] public deployedVaults;

    function createVault(
        ERC20[] memory multiAssets,
        uint16[] memory multiAssetWeights,
        string memory name,
        string memory symbol
    ) public {
        address newVault = address(new MultiAssetWeightedVault(multiAssets, multiAssetWeights, name, symbol));
        deployedVaults.push(newVault);
    }
    function foo(
        string memory name,
        string memory symbol
    ) public {
        // address newVault = address(new MultiAssetWeightedVault(name, symbol));
        // deployedVaults.push(newVault);
    }

    function getDeployedVaults() public view returns (address[] memory) {
        return deployedVaults;
    }
}
