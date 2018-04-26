const Web3 = require('web3')
const TruffleContract = require('truffle-contract')
const WarFactory = require('../solidity/build/contracts/WarFactory.json')
const WarList = require('./warlist')
const abi = require('human-standard-token-abi')
const CoinMarketCap = require('coinmarketcap-api')
const TokenDecimals = require('./token_decimals')
const Big = require('big.js')

const mnemonic = 'region fish wave balcony example useful pattern length genre defense crater push'
const accessToken = 'vXJ9MlTj969EuStvmyPN'

const server = {
  network: null,
  web3: null,
  address: '0x0',
  provider: null,
  warfactory: null,
  coinMarketCapClient: null,

  setWeb3: function() {
    this.provider = new Web3.providers.HttpProvider(`https://${this.network}.infura.io/${accessToken}`)
    this.web3 = new Web3(this.provider)
    if (!process.argv[3]) {
      throw new Error('Please provide your ethereum address')
    }
    this.address = process.argv[3]
  },

  getTokenInstance: async function(address) {
    const erc20Contract = TruffleContract({ abi })
    erc20Contract.setProvider(this.provider)
    const erc20 = await erc20Contract.at(address)
    return erc20
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

  init: async function() {
    this.network = process.argv[2] || 'rinkeby'
    if (this.network !== 'rinkeby' &&
      this.network !== 'mainnet') {
        throw new Error(`Network ${this.network} not found`)
      }
    this.setWeb3()
    this.warfactory = await this.getContract(WarFactory)
    this.coinMarketCapClient = new CoinMarketCap()
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

  closeWar: async function(war, latestBlock) {
    const fromBlock = Number(war[5])
    const toBlock = Number(war[6])
    const coinWarAddress = war[7].toString(10)

    if (latestBlock > toBlock) {
      const coin1 = war[0].split(' ')[0]
      const coin2 = war[0].split(' ')[1]
      const coin1Address = war[1].toString(10)
      const coin2Address = war[2].toString(10)

      const coin1Inst = await this.getTokenInstance(coin1Address)
      const coin2Inst = await this.getTokenInstance(coin2Address)

      let coin1Addresses = []
      let coin1Bets = []
      let coin2Addresses = []
      let coin2Bets = []

      const coin1Id = TokenDecimals[coin1.toLowerCase()]['id']
      const coin2Id = TokenDecimals[coin2.toLowerCase()]['id']

      console.log(coin1Id, coin2Id)

      // get first coin price
      const coin1_data = await this.coinMarketCapClient
        .getTicker({ limit: 1, currency: coin1Id })
      const coin1_price = coin1_data[0].price_usd

      // get second coin price
      const coin2_data = await this.coinMarketCapClient
        .getTicker({ limit: 1, currency: coin2Id })
      const coin2_price = coin2_data[0].price_usd

      let coin1TotalBetPrice = 0, coin2TotalBetPrice = 0

      const filter = {
        fromBlock,
        toBlock
      };

      coin1Inst.Transfer({ _to: coinWarAddress }, filter).get((error, rc1) => {

        let _price1 = 0
        for (let j = 0; j < rc1.length; j++) {
          const data = rc1[j].args
          coin1Addresses.push(data._from)
          coin1Bets.push(data._value.toNumber())
          _price1 += data._value.toNumber()
        }
        let _bigPrice1 = new Big(_price1)
        coin1TotalBetPrice = _bigPrice1
          .times(coin1_price)
          .div(this.getMultFactorForCoin(coin1_sym))
          .toFixed(this.getDecimals(coin1_sym))

        coin2Inst.Transfer({ _to: coinWarAddress }, filter).get(async (err, rc2) => {
          let _price2 = 0
          for (let j = 0; j < rc2.length; j++) {
            const data = rc2[j].args
            coin2Addresses.push(data._from)
            coin2Bets.push(data._value.toNumber())
            _price2 += data._value.toNumber()
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
          console.log(`War ${coin1} vs ${coin2} has been successfully closed`)
        })
      })
    } // end of if
  },

  perform: async function(latestBlock) {
    const _warsCount = await this.warfactory.getWarsCount()
    const warsCount = Number(_warsCount)
    if (warsCount > 0) {
      for (let i = 0; i < warsCount; i++) {
        const war = await this.warfactory.getWarAtIndex(i)
        const isOnGoing = await this.warfactory.isWarClosedAtIndex(i)
        if (isOnGoing[0]) {
          this.closeWar(war, latestBlock)
        }
      }
    } else {
      console.log('No wars are deployed ...')
    }
  },

  run: function() {
    try {
      const pollingTime = process.argv[4] || 10000
      setInterval(async () => {
        const latestBlock = await this.web3.eth.getBlock('latest')
        this.perform(Number(latestBlock.number))
      }, pollingTime)
    } catch (error) {
      throw new Error(error)
    }

  }
};

(function() {
  // initialize the server
  server.init()
  server.run()
})()
