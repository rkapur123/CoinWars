var ERC20 = artifacts.require("ERC20");
var CoinWar = artifacts.require("CoinWar");
var WarFactory = artifacts.require("WarFactory");
var CoinManager = artifacts.require("CoinManager");

module.exports = deployer => {
  /*
  deployer.deploy(Base1, 100, "Base1", 18, "B1")
    .then(resp => {
      // add you code here ...
      return deployer.deploy(Base2, 100, "Base2", 18, "B2")
        .then(resp => {
          // add your code here ...
          return deployer.deploy(CoinWar, Base1.address, Base2.address);
        })
        .catch(error => console.log(error))
    })
    .catch(error => console.log(error))
    */
  deployer.deploy(ERC20, 100, "Winner", 18, "W")
    .then(resp => {
      return deployer.deploy(ERC20, 100, "Looser", 18, "L")
    })
    .then(resp => {
      return deployer.deploy(CoinWar, ERC20.address, ERC20.address, 0, 100)
    })
  deployer.deploy(CoinManager)
  deployer.deploy(WarFactory)
};
