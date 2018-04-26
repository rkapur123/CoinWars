pragma solidity ^0.4.18;

import { ERC20 } from "./ERC20.sol";

contract TokenFaucet {

  ERC20 public eos;
  ERC20 public tron;
  ERC20 public binance;
  ERC20 public ven;

  mapping (address => bool) hasWithdrawn;


  function TokenFaucet()
    public
  {

    eos = ERC20(address(0xd0cd0114d255ddee071d863c77dfb63889c6cea0));
    tron = ERC20(address(0x4b3855f4df12101dbc3c06931796e70174d3e99e));
    binance = ERC20(address(0x3cf183515226770bc10ae3261fa224b575cdc33b));
    ven = ERC20(address(0x64721e96f8ba064fb5f4a7432f8026b2ddec6a52));

  }

  function withdrawTokens()
    public
    onlyOneWithdraw
  {
    hasWithdrawn[msg.sender] = true;

    eos.transfer(msg.sender, 1000000000000000000000);
    tron.transfer(msg.sender, 200000000000);
    binance.transfer(msg.sender, 1000000000000000000000);
    ven.transfer(msg.sender, 2500000000000000000000);
  }

  modifier onlyOneWithdraw() {
    require(hasWithdrawn[msg.sender] == false);
    _ ;
  }

}
