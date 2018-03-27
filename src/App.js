import React, { Component } from 'react'
import logo from './logo.svg'
import Web3 from 'web3'
import TruffleContract from 'truffle-contract'
import CoinWars from './solidity/build/contracts/CoinWar.json'
import WarFactory from './solidity/build/contracts/WarFactory.json'
import './App.css'
import CoinItem from './CoinItem'

class App extends Component {

  constructor() {
    super()
    this.state = {
      account: false,
      balance: 0
    }

    if (typeof window.web3 !== 'undefined') {
      this.web3Provider = window.web3.currentProvider
    } else {
      this.web3Provider = new Web3.providers.HttpProvider("http://localhost:8545")
    }

    this.web3 = new Web3(this.web3Provider)
    this.coinwars = TruffleContract(CoinWars)
    this.warfactory = TruffleContract(WarFactory)
    this.coinwars.setProvider(this.web3Provider)
    this.warfactory.setProvider(this.web3Provider)
  }

  componentDidMount = () => {
    this.web3.eth.getCoinbase(async (err, account) => {
      const balanceRaw = await this.web3.eth.getBalance(account)
      const balance = await this.web3.utils.fromWei(balanceRaw)
      this.setState({ account, balance })
    })
  }

  render() {
    const { account } = this.state

    if (!account) {
      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to COIN WARS</h1>
          </header>
          <p>Loading Dapp ....</p>
        </div>
      )
    }

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to COIN WARS</h1>
        </header>
        <p style={{ margin: '20px 0 10px' }}>Your Address:
          <strong style={{ color: '#1e617d' }}>{this.state.account}</strong></p>
        <p>Balance: <strong>{this.state.balance}</strong> ether</p>
        <div>
          <CoinItem
            web3={this.web3}
            warfactory={this.warfactory}
            account={this.state.account} />
        </div>
      </div>
    );
  }
}

export default App;
