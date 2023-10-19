// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Consignment {
	using ECDSA for bytes32;

	address public baseCurrency;
	address public quoteCurrency;
	mapping(address => uint256) public baseBalances;
	mapping(address => uint256) public quoteBalances;
	mapping(address => uint256) public nonces;

	constructor(address _baseCurrency, address _quoteCurrency) {
		baseCurrency = _baseCurrency;
		quoteCurrency = _quoteCurrency;
	}

	function depositBase(uint256 amount) external {
		require(amount > 0, "Amount must be greater than 0");
		require(
			IERC20(baseCurrency).transferFrom(
				msg.sender,
				address(this),
				amount
			),
			"Base token transfer failed"
		);
		baseBalances[msg.sender] += amount;
	}

	function depositQuote(uint256 amount) external {
		require(amount > 0, "Amount must be greater than 0");
		require(
			IERC20(quoteCurrency).transferFrom(
				msg.sender,
				address(this),
				amount
			),
			"Quote token transfer failed"
		);
		quoteBalances[msg.sender] += amount;
	}

	function withdrawBase(uint256 amount) external {
		require(
			amount <= baseBalances[msg.sender],
			"Insufficient base balance"
		);
		baseBalances[msg.sender] -= amount;
		require(
			IERC20(baseCurrency).transfer(msg.sender, amount),
			"Base token transfer failed"
		);
	}

	function withdrawQuote(uint256 amount) external {
		require(
			amount <= quoteBalances[msg.sender],
			"Insufficient quote balance"
		);
		quoteBalances[msg.sender] -= amount;
		require(
			IERC20(quoteCurrency).transfer(msg.sender, amount),
			"Quote token transfer failed"
		);
	}

    function updateNonce(uint256 newNonce) external {
        nonces[msg.sender] = newNonce;
    }
    
	function takeOffer(
		bool buyOrSell, // offer was "wanting to buy?""
		uint256 maxBaseAmount,
		uint256 price, // in 1e18
		uint256 nonce,
		bytes calldata signature,
		uint256 baseAmount
	) external {
		require(maxBaseAmount >= baseAmount, "Amount exceeds maximum allowed");
		require(nonces[msg.sender] < nonce, "Invalid nonce");

		bytes32 messageHash = keccak256(
			abi.encodePacked(
				address(this),
				buyOrSell,
				maxBaseAmount,
				price,
				nonce
			)
		);

		address recoveredSigner = messageHash.toEthSignedMessageHash().recover(
			signature
		);

		uint256 quoteAmount = (baseAmount * price) / 1e18;

		if (buyOrSell) {
			require(
				baseBalances[msg.sender] >= baseAmount,
				"Insufficient base balance"
			);
			require(
				quoteBalances[recoveredSigner] >= quoteAmount,
				"Insufficient quote balance"
			);
			baseBalances[msg.sender] -= baseAmount;
			quoteBalances[recoveredSigner] -= quoteAmount;
		} else {
			require(
				quoteBalances[msg.sender] >= quoteAmount,
				"Insufficient quote balance"
			);
			require(
				baseBalances[recoveredSigner] >= baseAmount,
				"Insufficient base balance"
			);
			quoteBalances[msg.sender] -= quoteAmount;
			baseBalances[recoveredSigner] -= baseAmount;
		}

		nonces[msg.sender] = nonce;
		emit TradeExecuted(
			msg.sender,
			recoveredSigner,
			buyOrSell,
			baseAmount,
            quoteAmount,
			price
		);
	}

	event TradeExecuted(
		address indexed taker,
		address indexed offerer,
		bool buyOrSell,
		uint256 baseAmount,
		uint256 quoteAmount,
		uint256 price
	);
}
