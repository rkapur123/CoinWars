pragma solidity ^0.4.18;


import { CoinWar } from "./CoinWar.sol";

contract WarFactory {


  struct War {
    string opponents;
    CoinWar coinWar;
    bool isOngoing;
    string warID;
  }

  War[] public allWars;
  uint public ongGoingWars = 10;

  address public owner;

  function WarFactory()
    public
  {
    owner = msg.sender;
  }

  event NewWarStarted(string warID);

  /* function createCoinWar(string _opponents, address _tokeOne, address _tokenTwo, uint _fromBlock, uint _toBlock)
    public
    onlyOwner
  {
    ongGoingWars += 1;
    CoinWar newWar = new CoinWar(_tokeOne, _tokenTwo, _fromBlock, _toBlock);
    allWars.push(War(_opponents, newWar, true));

  } */

  function createCoinWar(string _opponents, address _coinWarAddress, string _warID) public onlyOwner {
    ongGoingWars += 1;
    allWars.push(War(_opponents, CoinWar(_coinWarAddress), true, _warID));
    NewWarStarted(_warID);
  }

  function closeWarAtIndex(uint index, address[] winningAddresses, uint[] winningBets, address winningContract, address[] loosingAddresses, uint[] loosingBets, address loosingContract)
    public
    onlyOwner
  {
    ongGoingWars -= 1;
    allWars[index].isOngoing = false;
    CoinWar(allWars[index].coinWar).setResults(winningAddresses, winningBets, winningContract, loosingAddresses, loosingBets, loosingContract);
  }

  function getWarAtIndex(uint index)
    public
    view
    returns (string,address, address, uint, uint, uint, uint, address)
  {
    CoinWar coinWar = CoinWar(allWars[index].coinWar);
    var (balance1, balance2) = coinWar.getOpponentsBalance();
    return (allWars[index].opponents, address(coinWar.token1()), address(coinWar.token2()), balance1, balance2, coinWar.fromBlock(), coinWar.toBlock(), address(coinWar));
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _ ;
  }

  function getWarsCount() public view returns (uint) {
    return allWars.length;
  }

}
