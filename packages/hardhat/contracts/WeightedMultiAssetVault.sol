// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "solmate/src/mixins/ERC4626.sol";
import { ERC20 } from "solmate/src/tokens/ERC20.sol";
import { SafeTransferLib } from "solmate/src/utils/SafeTransferLib.sol";
import { FixedPointMathLib } from "solmate/src/utils/FixedPointMathLib.sol";

contract WeightedMultiAssetVault is ERC4626 {
	using SafeTransferLib for ERC20;
	using FixedPointMathLib for uint256;

	ERC20[] public multiAssets;
	uint[] public multiAssetWeights;

    // _multiAssets[0] is the "base" asset
	constructor(
		ERC20[] memory _multiAssets,
		uint[] memory _multiAssetWeights,
		string memory _name,
		string memory _symbol
	) ERC4626(_multiAssets[0], _name, _symbol) {
		// ERC20(_name, _symbol, 18) {
		require(
			_multiAssets.length == _multiAssetWeights.length,
			"Assets and weights length mismatch."
		);
		multiAssets = _multiAssets;
		multiAssetWeights = _multiAssetWeights;
	}

	function totalAssets() public view override returns (uint256) {
        return multiAssets[0].balanceOf(address(this));
	}

	// function beforeWithdraw(uint256 assets, uint256 shares) internal override {
	// }

	// function afterDeposit(uint256 assets, uint256 shares) internal override {
	// }

	function deposit(
		uint256 amount,
		address receiver
	) public override returns (uint256) {
		// Start at index 1 as index 0 is transferred in the base contract
		for (uint i = 1; i < multiAssets.length; i++) {
			uint256 weightedAmount = (amount * multiAssetWeights[i]) / 100;
			multiAssets[i].safeTransferFrom(
				msg.sender,
				address(this),
				weightedAmount
			);
		}
		return super.deposit(amount, receiver);
	}

	function mint(
		uint256 shares,
		address receiver
	) public override returns (uint256 assets) {
		for (uint i = 1; i < multiAssets.length; i++) {
			uint256 weightedShares = (shares * multiAssetWeights[i]) / 100;
			multiAssets[i].safeTransferFrom(
				msg.sender,
				address(this),
				weightedShares
			);
		}
		return super.mint(shares, receiver);
	}

	function withdraw(
		uint256 amount,
		address receiver,
		address owner
	) public override returns (uint256) {
		for (uint i = 1; i < multiAssets.length; i++) {
			uint256 weightedAmount = (amount * multiAssetWeights[i]) / 100;
			multiAssets[i].safeTransfer(receiver, weightedAmount);
		}
		return super.withdraw(amount, receiver, owner);
	}

	function redeem(
		uint256 shares,
		address receiver,
		address owner
	) public override returns (uint256) {
		for (uint i = 1; i < multiAssets.length; i++) {
			uint256 weightedShares = (shares * multiAssetWeights[i]) / 100;
			multiAssets[i].safeTransfer(receiver, weightedShares);
		}
		return super.redeem(shares, receiver, owner);
	}
}
