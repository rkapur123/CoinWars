const Web3 = require('web3')
const TruffleContract = require('truffle-contract')
const WarFactory = require('../solidity/build/contracts/WarFactory.json')
const HDWalletProvider = require("truffle-hdwallet-provider")

const mnemonic = 'chalk when job clarify trigger tongue only close glimpse hour multiply start'
const accessToken = 'vXJ9MlTj969EuStvmyPN'


const wars = {

  address: '0x0',
  web3: null,
  warFactory: null,

  init: async function () {
    const provider = new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/${accessToken}`, 0)
    this.web3 = new Web3(provider)
    this.address = provider.getAddress()

  },
  getWars: async function () {
    this.warFactory = await this.getContract(WarFactory)

    var warCount = (await this.warFactory.getWarsCount()).toNumber()
    for (i = 0; i < warCount; i++) {

      const index = (warCount - (i+1));
      const war = await this.warFactory.getWarAtIndex(index)
      const isOpen = await this.warFactory.isWarClosedAtIndex(index)

      console.log("Game: " + war[0] + ", Index: " + index + ", Open: " + isOpen[0])
    }

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
  }
};

(async function() {
  await wars.init();
  await wars.getWars();
  console.log('Coin Wars have been deployed')
})()
