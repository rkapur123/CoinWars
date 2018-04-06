import React, {Component} from 'react'
import { Grid, Row, Col } from 'react-bootstrap'
import Web3 from 'web3'
import TruffleContract from 'truffle-contract'
import CoinWars from './solidity/build/contracts/CoinWar.json'
import WarFactory from './solidity/build/contracts/WarFactory.json'

import CoinItem from './CoinItem'
import step_1 from './resources/step_1.png'
import step_2 from './resources/step_2.png'
import step_3 from './resources/step_3.png'

export default class Home extends Component {

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
        <div style={{ padding: '60px 0' }}>
          <p>Loading CoinWars ....</p>
        </div>
      )
    }

    return (
      <div>
        <div className="intro">
          <Grid>
            <Row>
              <Col xs={4} md={4} lg={4}>
                <div style={{ minHeight: 300, paddingTop: 80 }}>
                  <img src={step_1} alt="step 1" />
                </div>
                <div>
                  <p>Step 1</p>
                  <p>Choose your token</p>
                </div>
              </Col>
              <Col xs={4} md={4} lg={4}>
                <div style={{ minHeight: 300, paddingTop: 80 }}>
                  <img src={step_2} alt="step 2" />
                </div>
                <div>
                  <p>Step 2</p>
                  <p>Race to Raise the Most Capital</p>
                </div>
              </Col>
              <Col xs={4} md={4} lg={4}>
                <div style={{ minHeight: 300, paddingTop: 30 }}>
                  <img src={step_3} alt="step 3" />
                </div>
                <div>
                  <p>Step 3</p>
                  <p>Winner Takes All</p>
                </div>
              </Col>
            </Row>
          </Grid>
        </div>

        <p style={{ margin: '20px 0 10px', padding: '20px 0' }}>Your Address:
          <strong style={{ color: '#1e617d' }}>{this.state.account}</strong>
        </p>
        <div className="war_wrap">
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
    )
  }
}
