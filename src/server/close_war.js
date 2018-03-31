const Web3 = require('web3')
const TruffleContract = require('truffle-contract')
const ERC20 = require('../solidity/build/contracts/ERC20.json')
const WarFactory = require('../solidity/build/contracts/WarFactory.json')
const WarList = require('./warlist')

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

  close: async function() {
    this.setWeb3()
    try {
      this.address = await this.getAddress()

      const tokenContract = TruffleContract(ERC20)
      tokenContract.setProvider(this.web3.currentProvider)
      if (typeof tokenContract.currentProvider.sendAsync !== 'function') {
        tokenContract.currentProvider.sendAsync = function () {
          return tokenContract.currentProvider.send.apply(
            tokenContract.currentProvider, arguments
          )
        }
      }

      const warIndex = process.argv[2]
      if (warIndex) {
        let wars = WarList.wars
        const { coin1_address, coin2_address,
             from_block, to_block } = wars[warIndex]

        const warfactory = await this.getContract(WarFactory)
        const war = await warfactory.getWarAtIndex(warIndex)
        const coinWarAddress = war[7]

        const coin1 = await tokenContract.at(coin1_address)
        const coin2 = await tokenContract.at(coin2_address)

        const filter = {
          fromBlock: from_block,
          toBlock: to_block
        }

        let coin1Addresses = []
        let coin1Bets = []
        let coin2Addresses = []
        let coin2Bets = []

        coin1.Transfer({ _to: coinWarAddress }, filter).get((error, rc1) => {
          if (rc1.length > 0) {
            for (let j = 0; j < rc1.length; j++) {
              const data = rc1[j].args
              coin1Addresses.push(data._from)
              coin1Bets.push(data._value.toNumber())
              console.log(data)
            }
          }
          coin2.Transfer({ _to: coinWarAddress }, filter).get(async (err, rc2) => {
            console.log('__________________________________________________________')

            if (rc2.length > 0) {
              for (let j = 0; j < rc2.length; j++) {
                const data = rc2[j].args
                coin2Addresses.push(data._from)
                coin2Bets.push(data._value.toNumber())
                console.log(data)
              }

              // call the warfactory closeWarAtIndex here
              await warfactory.closeWarAtIndex(
                warIndex, coin1Addresses , coin1Bets, coin1_address,
                coin2Addresses, coin2Bets, coin2_address, {from : `${this.address}`, gas: 5000000 }
              )

              console.log(`War at index ${warIndex} has been successfully closed`)

            }

          })
        })

      } else {
        console.log('Please specify the index of war which is to be closed e.g. node close_war.js <war index>')
      }
    } catch (error) {
      console.log(error)
    }
  }
};

(function() {
  // initialize the server
  app.close()
})()
