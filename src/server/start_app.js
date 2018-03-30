const Web3 = require('web3')

module.exports = {
  address: '0x0',
  web3: null,

  // initialize web3
  setWeb3: function() {
    let web3_provider
    if (typeof web3 !== 'undefined') {
      web3_provider = web3.currentProvider;
    } else {
      // set the provider you want from Web3.providers
      web3_provider = new Web3.providers.WebsocketProvider('ws://localhost:8545')
    }
    this.web3 = new Web3(web3_provider)
  },

  getAddress: async function() {
    const account = await this.web3.eth.getCoinbase()
    return account
  },

  // start the application
  start: function(callback) {
    this.setWeb3()
    this.web3.eth.subscribe('newBlockHeaders', function(error) {
      if (error) console.log(error)
    }).on('data', function(blockHeader) {
      const { number } = blockHeader
      callback(number)
    })
  }

};
