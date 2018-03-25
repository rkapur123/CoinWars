const CoinWar = artifacts.require("./CoinWar.sol");
const ERC20 = artifacts.require("./ERC20.sol");
const WarFactory = artifacts.require("./WarFactory.sol");
const CoinManager = artifacts.require("./CoinManager.sol");

contract("CoinWar", async(accounts) => {

  it("should create and manager ERC20s", async() => {
    /*let coinManager = await CoinManager.deployed();
    await coinManager.CreateTokenWithID(1, 100, "Tron");
    let dummy20 = await ERC20.at(await coinManager.GetTokenWithID(1));
    console.log(await dummy20.name.call() + " token deployed");*/
    let warFactory = await WarFactory.deployed(accounts[0]);
    let winner = await ERC20.new(200, "Base1", 18, "B1");
    let looser = await ERC20.new(200, "Base2", 18, "B2");

    let coinWar = await CoinWar.new(winner.address, looser.address, 0, 100);

    await warFactory.createCoinWar("B1 B2", coinWar.address, "ID");
    let createdWar = await warFactory.getWarAtIndex(0);
    console.log(createdWar);
    //let coinWar = await CoinWar.at(createdWar[1]);
    //console.log(coinWar);



  });
  /*it("should create a war factory", async() => {
    Create War Factory and 2 ERC20 tokens
    let warFactory = await WarFactory.deployed(accounts[0]);
    let winner = await ERC20.new(200, "Base1", 18, "B1");
    let looser = await ERC20.new(200, "Base2", 18, "B2");

     Create Coin War from 2 ERC20 and Block Numbers {0,100}
    await warFactory.createCoinWar("B1 B2", winner.address, looser.address, 0, 100);
    let createdWar = await warFactory.getWarAtIndex(0);
    let coinWar = await CoinWar.at(createdWar[1]);


     Transfer Submitted Bet For Each ERC20 to CoinWar contract
    let winnerAddr = [accounts[1], accounts[3]];
    let winnerBets = [20, 20];
    await winner.transfer(coinWar.address, 40);
    console.log("Winning Coin Bet " + await winner.balanceOf(coinWar.address));

    let looserAddr = [accounts[2], accounts[4]];
    let looserBets = [10, 15];
    await looser.transfer(coinWar.address, 25);
    console.log("Loosing Coin Bet " + await looser.balanceOf(coinWar.address));

    Close coin war by passing submitted bets
    await warFactory.closeWarAtIndex(0, winnerAddr, winnerBets, winner.address, looserAddr, looserBets, looser.address);



    Log Amount Burned and Owner Fee
    console.log("10% Burned " + (await coinWar.burnAmount.call()).toString());
    console.log("5% Owner Fee " + (await coinWar.ownerFee.call()).toString());



    Withdraw Winnings
    console.log("Coinwar contract balance before withdraw " + (await looser.balanceOf(coinWar.address)));
    await coinWar.withdraw({from:accounts[3]});
    console.log("Winner 1 winnings " + (await looser.balanceOf(accounts[3])));
    await coinWar.withdraw({from:accounts[1]});
    console.log("Winner 2 winnings " + (await looser.balanceOf(accounts[1])));



  });*/

  /*it("should log event 20 times", async () => {
    let instance = await CoinWar.deployed(accounts[0]);
    //console.log(instance.address);

    const filter = await web3.eth.filter({
      fromBlock: 1,
      toBlock: 'latest',
      address: instance.address,
      topics: [web3.sha3('LogEvent(string,uint256,bool)')]
    });



    for (i = 0; i < 20; i++) {
      await instance.CallEvent();
    }

    filter.get((error, result) => {
      console.log(result);
    });



    //console.log(filter);

  });*/
})
