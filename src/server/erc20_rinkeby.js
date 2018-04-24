const Web3 = require('web3')
const TruffleContract = require('truffle-contract')
const ERC20 = require('../solidity/build/contracts/ERC20.json')
const HDWalletProvider = require("truffle-hdwallet-provider")

const accessToken = 'vXJ9MlTj969EuStvmyPN'

// don't forget to replace this with your own mnemonic
const mnemonicSunny = 'region fish wave balcony example useful pattern length genre defense crater push'
const mnemonicRahul = 'chalk when job clarify trigger tongue only close glimpse hour multiply start'

const server = {
  address: '0x0',
  web3: null,
  sunnyAddresses: [],
  rahulAddresses: [],

  init: async function() {
    const providerRahul = new HDWalletProvider(mnemonicRahul, `https://rinkeby.infura.io/${accessToken}`, 0)
    this.web3 = new Web3(providerRahul)

    // set sunny addresses
    let i
    for (i = 0; i < 3; i++) {
      var providers = new HDWalletProvider(mnemonicSunny, `https://rinkeby.infura.io/${accessToken}`, i);
      this.sunnyAddresses.push(providers.getAddress())
      console.log('Sunny Addresses ________________________')
      console.log(providers.getAddress())
    }

    // set rahul addresses
    for (i = 0; i < 3; i++) {
      var providers = new HDWalletProvider(mnemonicRahul, `https://rinkeby.infura.io/${accessToken}`, i);
      this.rahulAddresses.push(providers.getAddress())
      console.log('Rahul Addresses ________________________')
      console.log(providers.getAddress())
    }

    try {
      this.address = this.rahulAddresses[0]

      // deploy first token
      const token1Contract = await this.deployDummyToken(100000000000000000, 'Tronix', 6, 'TRX')
      console.log(`First token TRX has been deployed at ${token1Contract.address}`)

      // deploy second token
      const token2Contract = await this.deployDummyToken(	1000000000000000000000000000, 'EOS', 18, 'EOS')
      console.log(`Second token EOS has been deployed at ${token2Contract.address}`)

      // deploy third token
      const token3Contract = await this.deployDummyToken(197192382000000000000000000, 'Binance Coin', 18, 'BNB')
      console.log(`Third token BNB has been deployed at ${token3Contract.address}`)

      // deploy fourth token
      const token4Contract = await this.deployDummyToken(1000000000000000000000000000, 'VeChain', 18, 'VEN')
      console.log(`Fourth token VEN has been deployed at ${token4Contract.address}`)

      let balance1 = await token1Contract.balanceOf(this.address)
      console.log(`Balance (TRX) of ${this.address} is`, balance1.toNumber())

      let balance2 = await token2Contract.balanceOf(this.address)
      console.log(`Balance (EOS) of ${this.address} is`, balance2.toNumber())

      let balance3 = await token3Contract.balanceOf(this.address)
      console.log(`Balance (BNB) of ${this.address} is`, balance3.toNumber())

      let balance4 = await token4Contract.balanceOf(this.address)
      console.log(`Balance (VEN) of ${this.address} is`, balance4.toNumber())

      console.log('_____________________#######___________________________')

      // create dummy balances TRX
      await token1Contract.transfer(this.sunnyAddresses[1], 25000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`1,000,000,000,000,000 TRX successfully transferred to ${this.sunnyAddresses[1]}`)

      await token1Contract.transfer(this.sunnyAddresses[2], 25000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`1,000,000,000,000,000 TRX successfully transferred to ${this.sunnyAddresses[2]}`)

      await token1Contract.transfer(this.rahulAddresses[0], 25000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`1,000,000,000,000,000 TRX successfully transferred to ${this.rahulAddresses[0]}`)

      await token1Contract.transfer(this.rahulAddresses[1], 25000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`1,000,000,000,000,000 TRX successfully transferred to ${this.rahulAddresses[1]}`)

      console.log('__________________________________')

      // create dummy balances EOS
      await token2Contract.transfer(this.sunnyAddresses[1], 250000000000000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`10,000,000,000,000,000,000,000,000 EOS successfully transferred to ${this.sunnyAddresses[1]}`)

      await token2Contract.transfer(this.sunnyAddresses[2], 250000000000000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`10,000,000,000,000,000,000,000,000 EOS successfully transferred to ${this.sunnyAddresses[2]}`)

      await token2Contract.transfer(this.rahulAddresses[0], 250000000000000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`10,000,000,000,000,000,000,000,000 EOS successfully transferred to ${this.rahulAddresses[0]}`)

      await token2Contract.transfer(this.rahulAddresses[1], 250000000000000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`10,000,000,000,000,000,000,000,000 EOS successfully transferred to ${this.rahulAddresses[1]}`)

      console.log('__________________________________')

      // create dummy balances BNB
      await token3Contract.transfer(this.sunnyAddresses[1], 49298095500000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`10,596,191,000,000,000,000,000,000 BNB successfully transferred to ${this.sunnyAddresses[1]} `)

      await token3Contract.transfer(this.sunnyAddresses[2], 49298095500000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`10,596,191,000,000,000,000,000,000 BNB successfully transferred to ${this.sunnyAddresses[2]} `)

      await token3Contract.transfer(this.rahulAddresses[0], 49298095500000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`10,596,191,000,000,000,000,000,000 BNB successfully transferred to ${this.rahulAddresses[0]}`)

      await token3Contract.transfer(this.rahulAddresses[1], 49298095500000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`10,596,191,000,000,000,000,000,000 BNB successfully transferred to ${this.rahulAddresses[1]}`)

      console.log('__________________________________')

      // create dummy balances VEN
      await token4Contract.transfer(this.sunnyAddresses[1], 250000000000000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`10,000,000,000,000,000,000,000,000 VEN successfully transferred to ${this.sunnyAddresses[1]}`)

      await token4Contract.transfer(this.sunnyAddresses[2], 250000000000000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`10,000,000,000,000,000,000,000,000 VEN successfully transferred to ${this.sunnyAddresses[2]}`)

      await token4Contract.transfer(this.rahulAddresses[0], 250000000000000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`10,000,000,000,000,000,000,000,000 VEN successfully transferred to ${this.rahulAddresses[0]}`)

      await token4Contract.transfer(this.rahulAddresses[1], 250000000000000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`10,000,000,000,000,000,000,000,000 VEN successfully transferred to ${this.rahulAddresses[1]}`)

      console.log('____________________########__________________________')

      balance1 = await token1Contract.balanceOf(this.address)
      console.log(`Final Balance (TRX) of ${this.address} is`, balance1.toNumber())

      balance2 = await token2Contract.balanceOf(this.address)
      console.log(`Final Balance (EOS) of ${this.address} is`, balance2.toNumber())

      balance3 = await token3Contract.balanceOf(this.address)
      console.log(`Final Balance (BNB) of ${this.address} is`, balance3.toNumber())

      balance4 = await token4Contract.balanceOf(this.address)
      console.log(`Final Balance (VEN) of ${this.address} is`, balance4.toNumber())

    } catch(error) {
      console.log(error)
    }
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
