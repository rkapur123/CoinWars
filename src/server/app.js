const Web3 = require('web3')
const TruffleContract = require('truffle-contract')
const WarFactory = require('../solidity/build/contracts/WarFactory.json')
const CoinWars = require('../solidity/build/contracts/CoinWar.json')
const WarList = require('./warlist')
const http = require('http')
const HDWalletProvider = require("truffle-hdwallet-provider")

const accessToken = 'vXJ9MlTj969EuStvmyPN'

// don't forget to replace this with your own mnemonic
const mnemonic = 'region fish wave balcony example useful pattern length genre defense crater push'

const server = {
  address: '0x0',
  web3: null,
  coinwars: null,
  warfactory: null,

  init: async function() {
    let web3_provider = new Web3.providers.HttpProvider(`https://rinkeby.infura.io/${accessToken}`)
    this.web3 = new Web3(web3_provider)

    // this.address = await this.getAddress()

    const provider = new HDWalletProvider(
      mnemonic, `https://rinkeby.infura.io/${accessToken}`, 0)

    this.address = provider.getAddress()
    console.log(this.address)

    try {

      this.warfactory = await this.getContract(WarFactory)
      //console.log('warfactory deployed successfully', this.warfactory)

      // deploy wars
      let wars = WarList.wars
      for (let i = 0; i < wars.length; i++) {
        const { coin1_name, coin2_name,
          coin1_address, coin2_address,
          from_block, to_block } = wars[i]

        // create coin war instance
        // getting error here
        await this.warfactory.createCoinWar(
          `${coin1_name} ${coin2_name}`,
          coin1_address,
          coin2_address,
          from_block,
          to_block,
          { from: `${this.address}`, gas: 5000000 }
        )

        console.log(`Successfully created coinwar for ${coin1_name} and ${coin2_name} by ${this.address}`)
        console.log('_________________________##########__________________________')
      }

    } catch(error) {
      console.log(error)
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
    const instance = await contract.new(coin1Addr, coin2Addr, fromBlock, toBlock, { from: `${this.address}`, gas: 5000000 })
    return instance
  }

};

(async function() {
  await server.init()
  console.log('Coin Wars have been deployed')
})()
