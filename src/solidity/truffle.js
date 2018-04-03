var HDWalletProvider = require("truffle-hdwallet-provider")
const accessToken = 'vXJ9MlTj969EuStvmyPN'
const mnemonic = 'region fish wave balcony example useful pattern length genre defense crater push'

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
       host: "localhost",
       port: 8545,
       network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/${accessToken}`)
      },
      network_id: 3,
      gas: 4700000
    }
  }
};
