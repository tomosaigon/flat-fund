// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@tableland/evm/contracts/utils/TablelandDeployments.sol";
import "@tableland/evm/contracts/utils/SQLHelpers.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface ILongShortPair {
  function pairName() external view returns (string memory);
}

// placeholding 'matcher' because 'orders' table from Studio broken:
// Something went wrong!
// 1484161257

// Try again

contract TableOrders {
  uint256 public _tableId = 7922;
  // matcher_80001_7922
  string private constant _TABLE_PREFIX = "matcher";
  string private constant _SCHEMA = "token text, xmtp text";

  constructor() {
    // Already created from Studio
    _tableId = TablelandDeployments.get().create(
        address(this),
        SQLHelpers.toCreateFromSchema(_SCHEMA, _TABLE_PREFIX)
    );
  }

  // Insert data into a table
  function insert() public payable {
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
        "token,text",
        string.concat(
          Strings.toString(1337), // Convert to a string
          ",",
          SQLHelpers.quote(Strings.toHexString(msg.sender)) // Wrap strings in single quotes
        )
      )
    );
  }

  function onOrder(address token, address xmtp) public {
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
        "token,text",
        string.concat(
          SQLHelpers.quote(Strings.toHexString(token)),
          ",",
          SQLHelpers.quote(Strings.toHexString(xmtp)) // Wrap strings in single quotes
        )
      )
    );
  }
}
