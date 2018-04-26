const Web3 = require('web3')
const TruffleContract = require('truffle-contract')
const TokenFaucet = require('../solidity/build/contracts/TokenFaucet.json')
const ERC20 = require('../solidity/build/contracts/ERC20.json')
const HDWalletProvider = require("truffle-hdwallet-provider")

const accessToken = 'vXJ9MlTj969EuStvmyPN'

const mnemonicRahul = 'chalk when job clarify trigger tongue only close glimpse hour multiply start'

// set data here for token distribution
const data = [
  {
    token_address: '0x4b3855f4df12101dbc3c06931796e70174d3e99e', // TRX
    value: 25000000000000000
  },
  {
    token_address: '0xd0cd0114d255ddee071d863c77dfb63889c6cea0', // EOS
    value: 250000000000000000000000000
  },
  {
    token_address: '0x3cf183515226770bc10ae3261fa224b575cdc33b', // BNB
    value: 49298095500000000000000000
  },
  {
    token_address: '0x64721e96f8ba064fb5f4a7432f8026b2ddec6a52', // VEN
    value: 250000000000000000000000000
  }
]

const app = {
  address: '0x0',
  web3: null,
  provider: null,

  getContract: async function(contractDefinition) {
    const contract = TruffleContract(contractDefinition)
    contract.setProvider(this.provider)

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

  init: async function() {
    const provider = new HDWalletProvider(mnemonicRahul, `https://rinkeby.infura.io/${accessToken}`, 1)
    this.web3 = new Web3(provider)
    this.address = provider.getAddress()
    this.provider = provider

    const faucet = await this.getContract(TokenFaucet)

    // const erc20 = await this.getContract(ERC20)
    const erc20 = TruffleContract(ERC20)
    erc20.setProvider(provider)

    for(let i = 0; i < data.length; i++) {
      const { token_address, value } = data[i]
      // get the token instance
      const tokenInstance = await erc20.at(token_address)
      const tokenName = await tokenInstance.symbol()
      await tokenInstance.transfer(faucet.address, value,
        { from: `${this.address}`, gas: 5000000 })
      console.log(`Success ${value} tokens of ${tokenName} have been transferred to the faucet address ${faucet.address}`)
      console.log(`___________________________________________________________`)
    }
  }
};

(function() {
  // initialize the server
  try {
    app.init()
  } catch (error) {
    console.log(error)
  }
})()
