pragma solidity ^0.4.18;

import { ERC20 } from "./ERC20.sol";

contract RinkebyWithdraw {


  ERC20 public eos;
  ERC20 public tron;
  ERC20 public binance;
  ERC20 public ven;

  mapping (address => bool) hasWithdrawn;

  function RinkebyWithdraw()
    public
  {

    eos = ERC20(address(0x84b6962db7114fc45a673db1be75d1c95fcd7dd6));
    tron = ERC20(address(0xa71a212c041e9c3b70d1b7f2f1170bb1d75d0586));
    binance = ERC20(address(0x2aa0878102ccf1fe74c9aecad520d0ebe25f3d54));
    ven = ERC20(address(0x2f701fac7768b45a9c5cb383b7a463ff86abacdc));

  }

  function withdrawTokens()
    public
    onlyOneWithdraw
  {
    hasWithdrawn[msg.sender] = true;

    eos.transfer(msg.sender, 100);
    tron.transfer(msg.sender, 100);
    binance.transfer(msg.sender, 100);
    ven.transfer(msg.sender, 100);
  }

  modifier onlyOneWithdraw() {
    require(hasWithdrawn[msg.sender] == false);
    _ ;
  }

}
