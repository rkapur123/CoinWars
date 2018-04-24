import React, {Component} from 'react'
import { Alert, Glyphicon } from 'react-bootstrap'
import Web3 from 'web3'
import TruffleContract from 'truffle-contract'
import CoinWars from './solidity/build/contracts/CoinWar.json'
import WarFactory from './solidity/build/contracts/WarFactory.json'
import abi from 'human-standard-token-abi'

// only for test network
import TokenFaucet from './solidity/build/contracts/TokenFaucet.json'

const CURRENT_NETWORK = 'rinkeby'

export default (WrappedComponent) => {

  class Web3Container extends Component {
    constructor() {
      super()
      this.state = {
        account: false,
        currentBlock: 0,
        loading: false,
        error: false
      }
    }

    initialize = () => {
      this.coinwars = TruffleContract(CoinWars)
      this.warfactory = TruffleContract(WarFactory)
      this.coinwars.setProvider(this.web3Provider)
      this.warfactory.setProvider(this.web3Provider)
      this.erc20 = TruffleContract({ abi })
      this.erc20.setProvider(this.web3Provider)

      // only for test network
      this.tokenFaucet = TruffleContract(TokenFaucet)
      this.tokenFaucet.setProvider(this.web3Provider)
    }

    loadWeb3 = async () => {
      if (typeof window.web3 !== 'undefined') {
        this.web3Provider = window.web3.currentProvider
        this.web3 = new Web3(this.web3Provider)

        const account = await this.web3.eth.getCoinbase()
        if (!account) {
          this.setState({ error: `Please make sure that you are logged into your MetaMask` })
        } else {
          const network = await this.web3.eth.net.getNetworkType()
          if (network === CURRENT_NETWORK) {
            this.initialize()
            this.setState({ account, error: false })
          } else {
            this.setState({ account: null, error: `Please make sure you are connected to the Rinkeby network` })
          }
        }
      } else {
        this.setState({ error: `Please make sure that MetaMask is installed` })
      }
    }

    componentDidMount = () => {
      this.loadWeb3()
    }

    render() {
      const { account, error } = this.state

      if (error) {
        return (
          <div style={{ marginTop: 50 }}>
            <Alert bsStyle="danger">
              <div style={{ padding: 20 }}>
                <Glyphicon glyph="exclamation-sign" style={{ fontSize: 30, marginBottom: 10 }} />
                <h4>Oh snap! You got an error!</h4>
                <p>{error}</p>
                <small style={{ fontSize: 13 }}>For more information visit <a target="__blank" href="https://metamask.io/">MetaMask</a></small>
              </div>
            </Alert>
          </div>
        )
      }

      const newProps = Object.assign({}, this.props, {
        web3: this.web3,
        account,
        provider: this.web3Provider,
        warFactoryContract: this.warfactory,
        coinWarContract: this.coinwars,
        erc20Contract: this.erc20,
        tokenFaucet: this.tokenFaucet // only test
      })

      return account && <WrappedComponent {...newProps} />

    }
  }

  return Web3Container
}
