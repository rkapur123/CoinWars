const Web3 = require('web3')
const TruffleContract = require('truffle-contract')
const ERC20 = require('../solidity/build/contracts/ERC20.json')
const WarFactory = require('../solidity/build/contracts/WarFactory.json')
const HDWalletProvider = require("truffle-hdwallet-provider")
const CoinMarketCap = require('coinmarketcap-api')
const TokenDecimals = require('./token_decimals')
const Big = require('big.js')

const accessToken = 'vXJ9MlTj969EuStvmyPN'

// don't forget to replace this with your own mnemonic
const mnemonic = 'region fish wave balcony example useful pattern length genre defense crater push'

const app = {

  address: '0x0',
  web3: null,

  setWeb3: function() {
    const provider = new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/${accessToken}`, 0)
    this.web3 = new Web3(provider)
    this.address = provider.getAddress()
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

  getDecimalsInCoin: function(coin) {
    if (!coin) return 18
    let _coin = TokenDecimals[coin.toLowerCase()]
    if (_coin) {
      return _coin['decimals']
    }
    return 18
  },

  getMultFactorForCoin: function(coin) {
    let factor = 1
    for (let i = 0; i < this.getDecimalsInCoin(coin); i++) {
      factor = factor * 10;
    }
    return factor
  },

  getDecimals: function(coin) {
    if (coin) {
      return coin['decimals']
    }
    return 18
  },

  close: async function() {
    this.setWeb3()
    try {
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
        const warfactory = await this.getContract(WarFactory)
        const war = await warfactory.getWarAtIndex(warIndex)
        const coin1_address = war[1]
        const coin2_address = war[2]
        const from_block = war[5]
        const to_block = war[6]
        const coinWarAddress = war[7]

        const coin1 = await tokenContract.at(coin1_address)
        const coin2 = await tokenContract.at(coin2_address)

        const filter = {
          fromBlock: from_block,
          toBlock: to_block
        }

        let currentBlock = await this.web3.eth.getBlock('latest')
        if (currentBlock.number < to_block) {
          throw new Error('The war is currently on going ! Please wait')
        }

        let coin1Addresses = []
        let coin1Bets = []
        let coin2Addresses = []
        let coin2Bets = []

        const coinMarketCapClient = new CoinMarketCap()
        const coin1_sym = await coin1.symbol()
        const coin2_sym = await coin2.symbol()
        const coin1Id = TokenDecimals[coin1_sym.toLowerCase()]['id']
        const coin2Id = TokenDecimals[coin2_sym.toLowerCase()]['id']

        // get first coin price
        const coin1_data = await coinMarketCapClient
          .getTicker({ limit: 1, currency: coin1Id })
        const coin1_price = coin1_data[0].price_usd

        const coin2_data = await coinMarketCapClient
          .getTicker({ limit: 1, currency: coin2Id })
        const coin2_price = coin2_data[0].price_usd

        let coin1TotalBetPrice = 0, coin2TotalBetPrice = 0

        coin1.Transfer({ _to: coinWarAddress }, filter).get((error, rc1) => {
          let _price1 = 0
          for (let j = 0; j < rc1.length; j++) {
            const data = rc1[j].args
            coin1Addresses.push(data._from)
            coin1Bets.push(data._value.toNumber())
            _price1 += data._value.toNumber()
            console.log(_price1)
          }
          let _bigPrice1 = new Big(_price1)
          coin1TotalBetPrice = _bigPrice1
            .times(coin1_price)
            .div(this.getMultFactorForCoin(coin1_sym))
            .toFixed(this.getDecimals(coin1_sym))

          coin2.Transfer({ _to: coinWarAddress }, filter).get(async (err, rc2) => {

              let _price2 = 0
              for (let j = 0; j < rc2.length; j++) {
                const data = rc2[j].args
                coin2Addresses.push(data._from)
                coin2Bets.push(data._value.toNumber())
                _price2 += data._value.toNumber()
                console.log(_price2)
              }

              let _bigPrice2 = new Big(_price2)
              coin2TotalBetPrice = _bigPrice2
                .times(coin2_price)
                .div(this.getMultFactorForCoin(coin2_sym))
                .toFixed(this.getDecimals(coin2_sym))

              console.log('coin1 total bet price', coin1TotalBetPrice)
              console.log('coin2 total bet price', coin2TotalBetPrice)

              if (coin1TotalBetPrice >= coin2TotalBetPrice) {
                // coin1 wins
                // call the warfactory closeWarAtIndex here
                await warfactory.closeWarAtIndex(
                  warIndex, coin1Addresses , coin1Bets, coin1_address,
                  coin2Addresses, coin2Bets, coin2_address, {from : `${this.address}`, gas: 5000000 }
                )
              } else {
                // coin2 wins
                // call the warfactory closeWarAtIndex here
                await warfactory.closeWarAtIndex(
                  warIndex, coin2Addresses , coin2Bets, coin2_address,
                  coin1Addresses, coin1Bets, coin1_address, {from : `${this.address}`, gas: 5000000 }
                )
              }
              console.log(`War at index ${warIndex} has been successfully closed`)
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
