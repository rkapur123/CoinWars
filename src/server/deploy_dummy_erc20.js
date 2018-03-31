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
    var mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"; // 12 word mnemonic
    var addrArray = []
    for (i = 0; i < 10; i++) {
      var provider = new HDWalletProvider(mnemonic, "http://localhost:8545", i);
      addrArray.push(provider.getAddress())
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

      // deploy third token
      const token3Contract = await this.deployDummyToken(1000, 'Dummy Token 3', 18, 'DT3')
      console.log(`Third token DT3 has been deployed at ${token3Contract.address}`)

      // deploy fourth token
      const token4Contract = await this.deployDummyToken(1000, 'Dummy Token 4', 18, 'DT4')
      console.log(`Fourth token DT4 has been deployed at ${token4Contract.address}`)

      let balance2 = await token2Contract.balanceOf(this.address)
      console.log(`Balance (DT2) of ${this.address} is`, balance2.toNumber())

      let balance3 = await token3Contract.balanceOf(this.address)
      console.log(`Balance (DT3) of ${this.address} is`, balance3.toNumber())

      let balance4 = await token4Contract.balanceOf(this.address)
      console.log(`Balance (DT4) of ${this.address} is`, balance4.toNumber())

      console.log('_____________________#######__________')

      // create dummy balances DT1
      await token1Contract.transfer(addrArray[1], 150, { from: `${this.address}`, gas: 5000000 })
      console.log(`150 DT1 successfully transferred to ` + addrArray[1])
      await token1Contract.transfer(addrArray[2], 50, { from: `${this.address}`, gas: 5000000 })
      console.log(`50 DT1 successfully transferred to ` + addrArray[2])
      await token1Contract.transfer(addrArray[3], 200, { from: `${this.address}`, gas: 5000000 })
      console.log(`200 DT1 successfully transferred to ` + addrArray[3])

      console.log('__________________________________')

      // create dummy balances DT2
      await token2Contract.transfer(addrArray[1], 200, { from: `${this.address}`, gas: 5000000 })
      console.log(`200 DT2 successfully transferred to ` + addrArray[1])
      await token2Contract.transfer(addrArray[2], 80, { from: `${this.address}`, gas: 5000000 })
      console.log(`80 DT2 successfully transferred to ` + addrArray[2])
      await token2Contract.transfer(addrArray[3], 160, { from: `${this.address}`, gas: 5000000 })
      console.log(`160 DT2 successfully transferred to ` + addrArray[3])

      console.log('__________________________________')

      // create dummy balances DT3
      await token3Contract.transfer(addrArray[1], 250, { from: `${this.address}`, gas: 5000000 })
      console.log(`200 DT3 successfully transferred to ` + addrArray[1])
      await token3Contract.transfer(addrArray[2], 120, { from: `${this.address}`, gas: 5000000 })
      console.log(`80 DT3 successfully transferred to ` + addrArray[2])
      await token3Contract.transfer(addrArray[3], 180, { from: `${this.address}`, gas: 5000000 })
      console.log(`160 DT3 successfully transferred to ` + addrArray[3])

      console.log('__________________________________')

      // create dummy balances DT4
      await token4Contract.transfer(addrArray[1], 120, { from: `${this.address}`, gas: 5000000 })
      console.log(`200 DT4 successfully transferred to ` + addrArray[1])
      await token4Contract.transfer(addrArray[2], 200, { from: `${this.address}`, gas: 5000000 })
      console.log(`80 DT4 successfully transferred to ` + addrArray[2])
      await token4Contract.transfer(addrArray[3], 140, { from: `${this.address}`, gas: 5000000 })
      console.log(`160 DT4 successfully transferred to ` + addrArray[3])

      console.log('____________________########____________')

      balance1 = await token1Contract.balanceOf(this.address)
      console.log(`Final Balance (DT1) of ${this.address} is`, balance1.toNumber())

      balance2 = await token2Contract.balanceOf(this.address)
      console.log(`Final Balance (DT2) of ${this.address} is`, balance2.toNumber())

      balance3 = await token3Contract.balanceOf(this.address)
      console.log(`Final Balance (DT3) of ${this.address} is`, balance3.toNumber())

      balance4 = await token4Contract.balanceOf(this.address)
      console.log(`Final Balance (DT4) of ${this.address} is`, balance4.toNumber())

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
