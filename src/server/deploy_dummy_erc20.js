const Web3 = require('web3')
const TruffleContract = require('truffle-contract')
const ERC20 = require('../solidity/build/contracts/ERC20.json')

const server = {
  address: '0x0',
  web3: null,

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

      // deploy first token
      const token1Contract = await this.deployDummyToken(100, 'Dummy Token 1', 18, 'DT1')
      console.log(`First token DT1 has been deployed at ${token1Contract.address}`)

      // deploy second token
      const token2Contract = await this.deployDummyToken(100, 'Dummy Token 2', 18, 'DT2')
      console.log(`Second token DT2 has been deployed at ${token2Contract.address}`)

    } catch(error) {
      console.log(error)
    }
  },

  getAddress: async function() {
    const account = await this.web3.eth.getCoinbase()
    return account
  },

  deployDummyToken: async function(totalAmt, name, decimal, symbol) {
    const tokenContract = TruffleContract(ERC20)
    tokenContract.setProvider(this.web3.currentProvider)
    if (typeof tokenContract.currentProvider.sendAsync !== 'function') {
      tokenContract.currentProvider.sendAsync = function () {
        return tokenContract.currentProvider.send.apply(
          tokenContract.currentProvider, arguments
        )
      }
    }
    const tokenInstance = await tokenContract.new(
      100, 'Dummy Token 1', 18, 'DT1', { from: `${this.address}`, gas: 5000000 }
    )
    return tokenInstance
  }

};

(function() {
  // initialize the server
  server.init()
})()
