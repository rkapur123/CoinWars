const Web3 = require('web3')
const TruffleContract = require('truffle-contract')
const ERC20 = require('../solidity/build/contracts/ERC20.json')
const HDWalletProvider = require("truffle-hdwallet-provider")

const accessToken = 'vXJ9MlTj969EuStvmyPN'

// don't forget to replace this with your own mnemonic
const mnemonic = 'region fish wave balcony example useful pattern length genre defense crater push'

const server = {
  address: '0x0',
  web3: null,

  init: async function() {
    let web3_provider
    if (typeof web3 !== 'undefined') {
      web3_provider = web3.currentProvider;
    } else {
      // set the provider you want from Web3.providers
      web3_provider = new Web3.providers.HttpProvider(`https://rinkeby.infura.io/${accessToken}`)
    }
    this.web3 = new Web3(web3_provider)

    var addrArray = []
    for (i = 0; i < 4; i++) {
      var provider = new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/${accessToken}`, i);
      addrArray.push(provider.getAddress())
      console.log(provider.getAddress());
    }

    try {
      this.address = addrArray[0]

      // deploy first token
      const token1Contract = await this.deployDummyToken(10000, 'Dummy Token 1', 18, 'DT1')
      console.log(`First token DT1 has been deployed at ${token1Contract.address}`)

      let balance1 = await token1Contract.balanceOf(this.address)
      console.log(`Balance (DT1) of ${this.address} is`, balance1.toNumber())

      // deploy second token
      const token2Contract = await this.deployDummyToken(10000, 'Dummy Token 2', 18, 'DT2')
      console.log(`Second token DT2 has been deployed at ${token2Contract.address}`)

      // deploy third token
      const token3Contract = await this.deployDummyToken(10000, 'Dummy Token 3', 18, 'DT3')
      console.log(`Third token DT3 has been deployed at ${token3Contract.address}`)

      // deploy fourth token
      const token4Contract = await this.deployDummyToken(10000, 'Dummy Token 4', 18, 'DT4')
      console.log(`Fourth token DT4 has been deployed at ${token4Contract.address}`)

      let balance2 = await token2Contract.balanceOf(this.address)
      console.log(`Balance (DT2) of ${this.address} is`, balance2.toNumber())

      let balance3 = await token3Contract.balanceOf(this.address)
      console.log(`Balance (DT3) of ${this.address} is`, balance3.toNumber())

      let balance4 = await token4Contract.balanceOf(this.address)
      console.log(`Balance (DT4) of ${this.address} is`, balance4.toNumber())

      console.log('_____________________#######__________')

      // create dummy balances DT1
      // 0x77bc416c65fc676f6dc598cda2797496280b2170 - 1800
      await token1Contract.transfer(addrArray[1], 1800, { from: `${this.address}`, gas: 5000000 })
      console.log(`1800 DT1 successfully transferred to ` + addrArray[1])

      // 0x37c69511c5ba54798accf6a6be6ac87de31a09b1 - 2500
      await token1Contract.transfer(addrArray[2], 2500, { from: `${this.address}`, gas: 5000000 })
      console.log(`2500 DT1 successfully transferred to ` + addrArray[2])

      // 0x6b9788ad7bcd694b15beb4e3a9b62f43b348b14a - 1200
      await token1Contract.transfer(addrArray[3], 1200, { from: `${this.address}`, gas: 5000000 })
      console.log(`1200 DT1 successfully transferred to ` + addrArray[3])

      console.log('__________________________________')

      // create dummy balances DT2
      // 0x77bc416c65fc676f6dc598cda2797496280b2170 - 2000
      await token2Contract.transfer(addrArray[1], 2000, { from: `${this.address}`, gas: 5000000 })
      console.log(`2000 DT2 successfully transferred to ` + addrArray[1])
      // 0x37c69511c5ba54798accf6a6be6ac87de31a09b1 - 3200
      await token2Contract.transfer(addrArray[2], 3200, { from: `${this.address}`, gas: 5000000 })
      console.log(`3200 DT2 successfully transferred to ` + addrArray[2])
      // 0x6b9788ad7bcd694b15beb4e3a9b62f43b348b14a - 1150
      await token2Contract.transfer(addrArray[3], 1150, { from: `${this.address}`, gas: 5000000 })
      console.log(`1150 DT2 successfully transferred to ` + addrArray[3])

      console.log('__________________________________')

      // create dummy balances DT3
      // 0x77bc416c65fc676f6dc598cda2797496280b2170 - 2500
      await token3Contract.transfer(addrArray[1], 2500, { from: `${this.address}`, gas: 5000000 })
      console.log(`2500 DT3 successfully transferred to ` + addrArray[1])
      // 0x37c69511c5ba54798accf6a6be6ac87de31a09b1 - 1200
      await token3Contract.transfer(addrArray[2], 1200, { from: `${this.address}`, gas: 5000000 })
      console.log(`1200 DT3 successfully transferred to ` + addrArray[2])
      // 0x6b9788ad7bcd694b15beb4e3a9b62f43b348b14a - 1800
      await token3Contract.transfer(addrArray[3], 1800, { from: `${this.address}`, gas: 5000000 })
      console.log(`1800 DT3 successfully transferred to ` + addrArray[3])

      console.log('__________________________________')

      // create dummy balances DT4
      // 0x77bc416c65fc676f6dc598cda2797496280b2170 - 1400
      await token4Contract.transfer(addrArray[1], 1400, { from: `${this.address}`, gas: 5000000 })
      console.log(`1400 DT4 successfully transferred to ` + addrArray[1])
      // 0x37c69511c5ba54798accf6a6be6ac87de31a09b1 - 1600
      await token4Contract.transfer(addrArray[2], 1600, { from: `${this.address}`, gas: 5000000 })
      console.log(`1600 DT4 successfully transferred to ` + addrArray[2])
      // 0x6b9788ad7bcd694b15beb4e3a9b62f43b348b14a - 1200
      await token4Contract.transfer(addrArray[3], 1200, { from: `${this.address}`, gas: 5000000 })
      console.log(`1200 DT4 successfully transferred to ` + addrArray[3])

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
