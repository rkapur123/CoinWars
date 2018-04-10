import React, {Component} from 'react'
import Web3 from 'web3'
import TruffleContract from 'truffle-contract'
import CoinWars from './solidity/build/contracts/CoinWar.json'
import WarFactory from './solidity/build/contracts/WarFactory.json'
import ERC20 from './solidity/build/contracts/ERC20.json'

const accessToken = 'vXJ9MlTj969EuStvmyPN'

export default (WrappedComponent) => {

  class Web3Container extends Component {
    constructor() {
      super()
      this.state = {
        account: false,
        currentBlock: 0,
        loading: false
      }
      this.loadWeb3()
    }

    loadWeb3 = () => {
      if (typeof window.web3 !== 'undefined') {
        this.web3Provider = window.web3.currentProvider
      } else {
        this.web3Provider =
          new Web3.providers.HttpProvider(`https://rinkeby.infura.io/${accessToken}`)
      }

      this.web3 = new Web3(this.web3Provider)
      this.coinwars = TruffleContract(CoinWars)
      this.warfactory = TruffleContract(WarFactory)
      this.coinwars.setProvider(this.web3Provider)
      this.warfactory.setProvider(this.web3Provider)
      this.erc20 = TruffleContract(ERC20)
      this.erc20.setProvider(this.web3Provider)
    }

    componentDidMount = () => {
      this.web3.eth.getCoinbase(async (err, account) => {
        const currentBlock = await this.web3.eth.getBlock('latest')
        this.setState({ account, currentBlock: currentBlock.number })
      })
    }

    render() {
      const { account, currentBlock } = this.state
      if (!account) {
        return (
          <div style={{ padding: '80px 50px' }}>
            <p>Loading CoinWars ...</p>
          </div>
        )
      }

      const newProps = Object.assign({}, this.props, {
        web3: this.web3,
        account,
        currentBlock,
        provider: this.web3Provider,
        warFactoryContract: this.warfactory,
        coinWarContract: this.coinwars,
        erc20Contract: this.erc20
      })

      return (
        <WrappedComponent {...newProps} />
      )

    }
  }

  return Web3Container
}
