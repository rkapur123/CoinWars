const Web3 = require('web3')
const TruffleContract = require('truffle-contract')
const ERC20 = require('../solidity/build/contracts/ERC20.json')
const HDWalletProvider = require("truffle-hdwallet-provider");


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

    //this.web3.eth.getAccounts().then(function(error, result) { console.log(result)  });
    var mnemonic = "assault crew bench private fit tank type forum grant decade flag impact"; // 12 word mnemonic
    for (i = 0; i < 10; i++) {
      var provider = new HDWalletProvider(mnemonic, "http://localhost:8545", i);
      console.log(provider.getAddress());
    }



    try {
      this.address = await this.getAddress()

      // deploy first token
      const token1Contract = await this.deployDummyToken(1000, 'Dummy Token 1', 18, 'DT1')
      console.log(`First token DT1 has been deployed at ${token1Contract.address}`)

      let balance1 = await token1Contract.balanceOf(this.address)
      console.log(`Balance (DT1) of ${this.address} is`, balance1.toNumber())

      // deploy second token
      const token2Contract = await this.deployDummyToken(1000, 'Dummy Token 2', 18, 'DT2')
      console.log(`Second token DT2 has been deployed at ${token2Contract.address}`)

      let balance2 = await token2Contract.balanceOf(this.address)
      console.log(`Balance (DT2) of ${this.address} is`, balance2.toNumber())

      // create dummy balances DT1
      await token1Contract.transfer('0xf17f52151EbEF6C7334FAD080c5704D77216b732', 150, { from: `${this.address}`, gas: 5000000 })
      console.log(`150 DT1 successfully transferred to 0xf17f52151EbEF6C7334FAD080c5704D77216b732`)
      await token1Contract.transfer('0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef', 50, { from: `${this.address}`, gas: 5000000 })
      console.log(`50 DT1 successfully transferred to 0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef`)
      await token1Contract.transfer('0x821aEa9a577a9b44299B9c15c88cf3087F3b5544', 200, { from: `${this.address}`, gas: 5000000 })
      console.log(`200 DT1 successfully transferred to 0x821aEa9a577a9b44299B9c15c88cf3087F3b5544`)

      // create dummy balances DT2
      await token2Contract.transfer('0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2', 200, { from: `${this.address}`, gas: 5000000 })
      console.log(`200 DT2 successfully transferred to 0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2`)
      await token2Contract.transfer('0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e', 80, { from: `${this.address}`, gas: 5000000 })
      console.log(`80 DT2 successfully transferred to 0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e`)
      await token2Contract.transfer('0x2191eF87E392377ec08E7c08Eb105Ef5448eCED5', 160, { from: `${this.address}`, gas: 5000000 })
      console.log(`160 DT2 successfully transferred to 0x2191eF87E392377ec08E7c08Eb105Ef5448eCED5`)

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
      totalAmt, name, decimal, symbol, { from: `${this.address}`, gas: 5000000 }
    )
    return tokenInstance
  }

};

(function() {
  // initialize the server
  server.init()
})()
