const Web3 = require('web3')
const TruffleContract = require('truffle-contract')
const WarFactory = require('../solidity/build/contracts/WarFactory.json')
const CoinWars = require('../solidity/build/contracts/CoinWar.json')
const WarList = require('./warlist')

const server = {
  address: '0x0',
  web3: null,
  coinwars: null,
  warfactory: null,

  init: async function() {
    let web3_provider
    if (typeof web3 !== 'undefined') {
      web3_provider = web3.currentProvider;
    } else {
      // set the provider you want from Web3.providers
      web3_provider = new Web3.providers.HttpProvider("http://localhost:8545")
    }
    this.web3 = new Web3(web3_provider)

    try {
      this.address = await this.getAddress()
      this.warfactory = await this.getContract(WarFactory)

      // deploy wars
      let wars = WarList.wars
      for (let i = 0; i < wars.length; i++) {
        const { coin1_name, coin2_name,
          coin1_address, coin2_address,
          from_block, to_block, id } = wars[i]

        // create coin war instance
        let coinWarInstance = await this.getCoinWarContract(
          CoinWars, coin1_address, coin2_address, from_block, to_block
        )

        await this.warfactory.createCoinWar(
          `${coin1_name} ${coin2_name}`,
          coinWarInstance.address,
          id, { from: `${this.address}`, gas: `500000` }
        )

        console.log(`Successfully created coinwar for ${coin1_name} and ${coin2_name}`)
      }

    } catch(error) {
      console.log(error)
    }
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

  getCoinWarContract: async function(contractDefinition, coin1Addr, coin2Addr, fromBlock, toBlock) {
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

    const instance = await contract.deployed(coin1Addr, coin2Addr, fromBlock, toBlock)
    return instance
  }

};

(function() {
  // initialize the server
  server.init()
})()
