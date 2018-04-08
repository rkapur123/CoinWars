const Web3 = require('web3')
const TruffleContract = require('truffle-contract')
const ERC20 = require('../solidity/build/contracts/ERC20.json')
const HDWalletProvider = require("truffle-hdwallet-provider")

const accessToken = 'vXJ9MlTj969EuStvmyPN'

// don't forget to replace this with your own mnemonic
const mnemonic = 'chalk when job clarify trigger tongue only close glimpse hour multiply start'

const server = {
  address: '0x0',
  web3: null,

  init: async function() {
    const provider = new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/${accessToken}`, 0)
    this.web3 = new Web3(provider)

    var addrArray = []
    for (i = 0; i < 4; i++) {
      var providers = new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/${accessToken}`, i);
      addrArray.push(providers.getAddress())
      console.log(providers.getAddress());
    }

    try {
      this.address = addrArray[0]

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

      console.log('_____________________#######__________')

      // create dummy balances TRX
      // 0x77bc416c65fc676f6dc598cda2797496280b2170 - 1800
      await token1Contract.transfer(addrArray[1], 50000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`50000000000 TRX successfully transferred to ` + addrArray[1])

      await token1Contract.transfer('0x9fa877509a7b5d90bdbdf911aeeaacce12857521', 50000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`50000000000 TRX successfully transferred to 0x9fa877509a7b5d90bdbdf911aeeaacce12857521`)

      // 0x37c69511c5ba54798accf6a6be6ac87de31a09b1 - 2500
      //await token1Contract.transfer(addrArray[2], 2500, { from: `${this.address}`, gas: 5000000 })
      //console.log(`2500 DT1 successfully transferred to ` + addrArray[2])

      // 0x6b9788ad7bcd694b15beb4e3a9b62f43b348b14a - 1200
      //await token1Contract.transfer(addrArray[3], 1200, { from: `${this.address}`, gas: 5000000 })
      //console.log(`1200 DT1 successfully transferred to ` + addrArray[3])

      console.log('__________________________________')

      // create dummy balances EOS
      // 0x77bc416c65fc676f6dc598cda2797496280b2170 - 2000
      await token2Contract.transfer(addrArray[1], 500000000000000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`500000000 EOS successfully transferred to ` + addrArray[1])

      await token2Contract.transfer('0x9fa877509a7b5d90bdbdf911aeeaacce12857521', 500000000000000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`500000000 EOS successfully transferred to 0x9fa877509a7b5d90bdbdf911aeeaacce12857521`)
      // 0x37c69511c5ba54798accf6a6be6ac87de31a09b1 - 3200
      //await token2Contract.transfer(addrArray[2], 3200, { from: `${this.address}`, gas: 5000000 })
      //console.log(`3200 DT2 successfully transferred to ` + addrArray[2])
      // 0x6b9788ad7bcd694b15beb4e3a9b62f43b348b14a - 1150
      //await token2Contract.transfer(addrArray[3], 1150, { from: `${this.address}`, gas: 5000000 })
      //console.log(`1150 DT2 successfully transferred to ` + addrArray[3])

      console.log('__________________________________')

      // create dummy balances BNB
      // 0x77bc416c65fc676f6dc598cda2797496280b2170 - 2500
      await token3Contract.transfer(addrArray[1], 98596191000000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`98596191 BNB successfully transferred to ` + addrArray[1])

      await token3Contract.transfer('0x9fa877509a7b5d90bdbdf911aeeaacce12857521', 98596191000000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`98596191 BNB successfully transferred to 0x9fa877509a7b5d90bdbdf911aeeaacce12857521`)
      // 0x37c69511c5ba54798accf6a6be6ac87de31a09b1 - 1200
      //await token3Contract.transfer(addrArray[2], 1200, { from: `${this.address}`, gas: 5000000 })
      //console.log(`1200 DT3 successfully transferred to ` + addrArray[2])
      // 0x6b9788ad7bcd694b15beb4e3a9b62f43b348b14a - 1800
      //await token3Contract.transfer(addrArray[3], 1800, { from: `${this.address}`, gas: 5000000 })
      //console.log(`1800 DT3 successfully transferred to ` + addrArray[3])

      console.log('__________________________________')

      // create dummy balances VEN
      // 0x77bc416c65fc676f6dc598cda2797496280b2170 - 1400
      await token4Contract.transfer(addrArray[1], 500000000000000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`500000000 VEN successfully transferred to ` + addrArray[1])

      await token4Contract.transfer('0x9fa877509a7b5d90bdbdf911aeeaacce12857521', 500000000000000000000000000, { from: `${this.address}`, gas: 5000000 })
      console.log(`500000000 VEN successfully transferred to 0x9fa877509a7b5d90bdbdf911aeeaacce12857521`)
      // 0x37c69511c5ba54798accf6a6be6ac87de31a09b1 - 1600
      //await token4Contract.transfer(addrArray[2], 1600, { from: `${this.address}`, gas: 5000000 })
      //console.log(`1600 DT4 successfully transferred to ` + addrArray[2])
      // 0x6b9788ad7bcd694b15beb4e3a9b62f43b348b14a - 1200
      //await token4Contract.transfer(addrArray[3], 1200, { from: `${this.address}`, gas: 5000000 })
      //console.log(`1200 DT4 successfully transferred to ` + addrArray[3])

      console.log('____________________########____________')

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
