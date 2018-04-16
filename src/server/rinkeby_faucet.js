const Web3 = require('web3')
const TruffleContract = require('truffle-contract')
const TokenFaucet = require('../solidity/build/contracts/TokenFaucet.json')
const ERC20 = require('../solidity/build/contracts/ERC20.json')
const HDWalletProvider = require("truffle-hdwallet-provider")

const accessToken = 'vXJ9MlTj969EuStvmyPN'

const mnemonicSunny = 'region fish wave balcony example useful pattern length genre defense crater push'

// set data here for token distribution
const TRANSFER_AMT = 10000000
const data = [
  {
    token_address: '0xa71a212c041e9c3b70d1b7f2f1170bb1d75d0586', // TRX
    value: TRANSFER_AMT
  },
  {
    token_address: '0x84b6962db7114fc45a673db1be75d1c95fcd7dd6', // EOS
    value: TRANSFER_AMT
  },
  {
    token_address: '0x2aa0878102ccf1fe74c9aecad520d0ebe25f3d54', // BNB
    value: TRANSFER_AMT
  },
  {
    token_address: '0x2f701fac7768b45a9c5cb383b7a463ff86abacdc', // VEN
    value: TRANSFER_AMT
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
    const provider = new HDWalletProvider(mnemonicSunny, `https://rinkeby.infura.io/${accessToken}`, 0)
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
