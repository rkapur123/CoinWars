pragma solidity ^0.4.18;

import { ERC20 } from "./ERC20.sol";

contract CoinManager {


  mapping (string => address) dummyERC20s;
  address public owner;

  function CoinManager()
    public
  {
    owner = msg.sender;
  }

  function CreateTokenWithID(string ID, uint initialAmount, string tokenName)
    public
  {
    ERC20 token = new ERC20(initialAmount, tokenName, 18, "");
    dummyERC20s[ID] = address(token);
  }

  function GetTokenWithID(string ID)
    public
    view
    returns (address)
  {
    return dummyERC20s[ID];
  }


}
