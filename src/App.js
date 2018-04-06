import React, { Component } from 'react'
import { Grid, Row, Col, Navbar, Nav, NavItem } from 'react-bootstrap'
import Particles from 'react-particles-js';
import logo from './logo.svg'
import step_1 from './resources/step_1.png'
import step_2 from './resources/step_2.png'
import step_3 from './resources/step_3.png'
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
      balance1: 0,
      balance2: 0
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
      this.setState({ account })
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
        {/*
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to COIN WARS</h1>
        </header>
        */}

        

        <Navbar fixedTop>
          <Navbar.Header>
            <Navbar.Brand>
              <a href="#home">CryptoGamez</a>
            </Navbar.Brand>
          </Navbar.Header>
          <Nav pullRight>
            <NavItem eventKey={1} href="#account">Account</NavItem>
            <NavItem eventKey={2} href="#Faq">Faq</NavItem>
          </Nav>
        </Navbar>

        <div className="intro">
        <Grid>
          <Row>
            <Col xs={4} md={4}>
              <img src={step_1}/>
            </Col>
            <Col xs={4} md={4}>
              <img src={step_2}/>
            </Col>
            <Col xs={4} md={4}>
              <img src={step_3}/>
            </Col>
          </Row>
          <Row>
            <Col xs={4} md={4}>
              <p>Step 1</p>
              <p>Choose your token</p>
            </Col>
            <Col xs={4} md={4}>
              <p>Step 2</p>
              <p>Race to Raise the Most Capital</p>
            </Col>
            <Col xs={4} md={4}>
              <p>Step 3</p>
              <p>Winner Takes All</p>
            </Col>
          </Row>
        </Grid>
        </div>




        <p style={{ margin: '20px 0 10px' }}>Your Address:
          <strong style={{ color: '#1e617d' }}>{this.state.account}</strong></p>
        <div>
          <CoinItem
            web3={this.web3}
            coinwars={this.coinwars}
            warfactory={this.warfactory}
            account={this.state.account}
            getBalanceCoin1={(balance) => this.setState({ balance1: balance.toNumber() })}
            getBalanceCoin2={balance => this.setState({ balance2: balance.toNumber() })}
          />

        </div>
      </div>
    );
  }
}

export default App;
