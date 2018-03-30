const Web3 = require('web3')
const TruffleContract = require('truffle-contract')
const WarFactory = require('../solidity/build/contracts/WarFactory.json')
const CoinWar = require('../solidity/build/contracts/CoinWar.json')

const app = {

  address: '0x0',
  web3: null,

  setWeb3: function() {
    let web3_provider
    if (typeof web3 !== 'undefined') {
      web3_provider = web3.currentProvider;
    } else {
      // set the provider you want from Web3.providers
      web3_provider = new Web3.providers.HttpProvider("http://localhost:8545")
    }
    this.web3 = new Web3(web3_provider)
  },

  getAddress: async function() {
    const account = await this.web3.eth.getCoinbase()
    return account
  },

  getContract: async function(contractDefinition) {
    const contract = TruffleContract(contractDefinition)
    contract.setProvider(this.web3.currentProvider)

    // Dirty hack for web3@1.0.0 support for localhost testrpc
    // see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
    if (typeof contract.currentProvider.sendAsync !== 'function') {
      contract.currentProvider.sendAsync = function () {
        return contract.currentProvider.send.apply(
          contract.currentProvider, arguments
        )
      }
    }

    const instance = await contract.deployed()
    return instance
  },

  withdraw: async function() {
    this.setWeb3()
    try {
      this.address = await this.getAddress()
      const address = process.argv[2]
      if (address) {
        const warAtIndex = process.argv[3]
        const warfactory = await this.getContract(WarFactory)
        const war = await warfactory.getWarAtIndex(warAtIndex)
        const coinWarAddress = war[7]

        const coinWar = TruffleContract(CoinWar)
        coinWar.setProvider(this.web3.currentProvider)
        const coinWarInstance = await coinWar.at(coinWarAddress)
        await coinWarInstance.withdraw({ from: address, gas: 5000000 })
      } else {
        console.log('Please specify the player address in order to withdraw')
      }
    } catch (error) {
      console.log(error)
    }
  }
};

(function() {
  // initialize the server
  app.withdraw()
})()
