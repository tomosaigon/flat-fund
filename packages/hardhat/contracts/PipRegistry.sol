// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@tableland/evm/contracts/utils/TablelandDeployments.sol";
import "@tableland/evm/contracts/utils/SQLHelpers.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface ILongShortPair {
	function pairName() external view returns (string memory);
}

// Priced Item Pairs (LSPs) Registry
contract PipRegistry is Ownable {
	bool public paused;
	address[] public whitelist;

	uint256 public _tableId = 8036;
	string private constant _TABLE_PREFIX = "pips";
	// string private constant _SCHEMA = "id integer primary key, addr text";
	// string private constant _SCHEMA = "id integer, addr text";

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
		insert(newAddress);
	}

	function getAddress(uint256 index) public view returns (address) {
		require(index < whitelist.length, "Index out of bounds");
		return whitelist[index];
	}

	function getWhitelistLength() public view returns (uint256) {
		return whitelist.length;
	}

	// Insert data into a table
	function insert(address newAddress) public payable {
		/*  Under the hood, SQL helpers formulates:
		 *
		 *  INSERT INTO {prefix}_{chainId}_{tableId} (token,text) VALUES(
		 *    1
		 *    'msg.sender'
		 *  );
		 */
		TablelandDeployments.get().mutate(
			address(this),
			_tableId,
			SQLHelpers.toInsert(
				_TABLE_PREFIX,
				_tableId,
				"addr",
				// string.concat(
				SQLHelpers.quote(Strings.toHexString(newAddress)) // Wrap strings in single quotes
				// )
			)
		);
	}

	function insertId(uint32 id, address newAddress) public payable {
		/*  Under the hood, SQL helpers formulates:
		 *
		 *  INSERT INTO {prefix}_{chainId}_{tableId} (token,text) VALUES(
		 *    1
		 *    'msg.sender'
		 *  );
		 */
		TablelandDeployments.get().mutate(
			address(this),
			_tableId,
			SQLHelpers.toInsert(
				_TABLE_PREFIX,
				_tableId,
				"id,addr",
				string.concat(
					Strings.toString(id), // Convert to a string
					",",
					SQLHelpers.quote(Strings.toHexString(newAddress)) // Wrap strings in single quotes
				)
			)
		);
	}
}
