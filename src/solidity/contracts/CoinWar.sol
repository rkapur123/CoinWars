pragma solidity ^0.4.18;

//import { ERC20 } from "./ERC20.sol";

contract ERC20 {

  function balanceOf(address _owner) public view returns (uint256 balance);
  function transfer(address _to, uint256 _value) public returns (bool success);

}


contract CoinWar {


  ERC20 public token1;
  ERC20 public token2;



  struct Team {
    ERC20 tokenContract;
    mapping (address => uint) tokenMapping;
    uint totalBet;
  }

  Team public winner;
  Team public looser;

  address public owner;
  uint public ownerFee;

  uint public fromBlock;
  uint public toBlock;

  //uint public burnAmount;
  bool public afterFee;


  event LogAddress(address addr);
  event LogString(string str);
  event LogUint(uint number);



  function CoinWar(address _token1, address _token2, uint _fromBlock, uint _toBlock)
    public
  {

    require(_token1 != address(0));
    require(_token2 != address(0));

    token1 = ERC20(_token1);
    token2 = ERC20(_token2);

    fromBlock = _fromBlock;
    toBlock = _toBlock;


    owner = msg.sender;

  }

  function setResults(address[] winningAddresses, uint[] winningBets, address winningContract, address[] loosingAddresses, uint[] loosingBets, address loosingContract)
    public
    onlyOwner
    onlyAfterBlock
  {
    require(winningAddresses.length == winningBets.length);
    require(loosingAddresses.length == loosingBets.length);

    require(winningContract != loosingContract);
    require((winningContract == address(token1)) || (winningContract == address(token2)));
    require((loosingContract == address(token1)) || (loosingContract == address(token2)));

    winner.tokenContract = ERC20(winningContract);
    looser.tokenContract = ERC20(loosingContract);


    for (uint i = 0; i < winningAddresses.length; i++) {
      winner.tokenMapping[winningAddresses[i]] += winningBets[i];
      winner.totalBet += winningBets[i];
    }

    for (uint j = 0; j < loosingAddresses.length; j++) {
      looser.tokenMapping[loosingAddresses[j]] += loosingBets[j];
      looser.totalBet += loosingBets[j];
    }

    //burn and take fee
    takeOwnerFee();

  }

  function takeOwnerFee()
    internal
  {

    //require()
    if (looser.totalBet != 0) {

      // 10% of total bets lost in the loosing coin
      //burnAmount = fractionOf(looser.totalBet, 1, 10);

      // 5% of the total bets lost in the loosing coin
      ownerFee = fractionOf(looser.totalBet, 1, 20);

      //looser.totalBet -= burnAmount;
      looser.totalBet -= ownerFee;

      //"0x000000000000000000000000000000000000dEaD" --> burn address to be added
      //looser.tokenContract.transfer(address(looser.tokenContract), burnAmount);

      // the loosing owner pays fees to the owner of CoinWar contract
      looser.tokenContract.transfer(owner, ownerFee);
    }

    afterFee = true;
  }

  function withdraw()
    public
    onlyAfterFee
  {
    //add modifier to make sure burn and setResults passed
    uint userBet = winner.tokenMapping[msg.sender];

    require(userBet != 0);
    require(winner.totalBet != 0);

    uint winnings = fractionOf(looser.totalBet, userBet, winner.totalBet);

    require(winnings != 0);

    winner.tokenMapping[msg.sender] = 0;
    looser.tokenContract.transfer(msg.sender, winnings);
    winner.tokenContract.transfer(msg.sender, userBet);
  }

  /* Helpers */

  function fractionOf(uint amount, uint numerator, uint denominator)
    public
    pure
    returns (uint)
  {

    if (amount >= denominator)
      return (amount*numerator)/denominator;

    uint scalar;
    scalar = (denominator/amount) + 1;

    return (amount*numerator*scalar)/(denominator*scalar);

  }

  /* Getters */

  function getUserBalance(address user)
    public
    view
    returns (uint, uint)
  {
    return (token1.balanceOf(user), token2.balanceOf(user));
  }

  function getUserBet(address user)
    public
    view
    returns (uint, uint, uint, uint, uint)
  {
    if (address(winner.tokenContract) == address(token1)) {
      return (1, winner.tokenMapping[user],looser.tokenMapping[user], winner.totalBet, looser.totalBet);
    } else if (address(winner.tokenContract) == address(token2)) {
      return (2, winner.tokenMapping[user],looser.tokenMapping[user], winner.totalBet, looser.totalBet);
    } else {
      return (0, 0, 0, 0, 0);
    }


  }

  function getTeamBet(address team)
    public
    view
    returns (uint)
  {
    if (address(winner.tokenContract) == team)
      return winner.totalBet;
    return looser.totalBet;
  }

  /* Modifiers */

  modifier onlyOwner() {
    require(msg.sender == owner);
    _ ;
  }

  modifier onlyAfterBlock() {
    //require(block.number >= toBlock);
    _ ;
  }

  modifier onlyAfterFee() {
    require(afterFee == true);
    _ ;
  }















}
