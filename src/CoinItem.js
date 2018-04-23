import React, {Component} from 'react'
import WarStage from './WarStage'

import { Button, Label } from 'react-bootstrap'

// only for test
const tokensAddress = {
  'eos': '0x84b6962db7114fc45a673db1be75d1c95fcd7dd6',
  'trx': '0xa71a212c041e9c3b70d1b7f2f1170bb1d75d0586',
  'bnb': '0x2aa0878102ccf1fe74c9aecad520d0ebe25f3d54',
  'ven': '0x2f701fac7768b45a9c5cb383b7a463ff86abacdc'
}

export default class CoinItem extends Component {

  constructor() {
    super()
    this.state = {
      wars: [],
      tokenBalance: {
        eos: 0,
        trx: 0,
        bnb: 0,
        ven: 0
      }
    }
    this.wfInstance = null
  }

  loadWars = async (wfInstance) => {
    const warsList = []
    let warsCount = await wfInstance.getWarsCount()
    let wCount = warsCount.toNumber()
    if (wCount > 0) {
      for (let j = 1; j <= wCount; j++) {
        const wars = await wfInstance.getWarAtIndex(j - 1)
        const isOnGoing = await wfInstance.isWarClosedAtIndex(j - 1)
        if (isOnGoing[0]) {
          const coin1 = wars[0].split(' ')[0]
          const coin2 = wars[0].split(' ')[1]
          const coin1Address = wars[1].toString(10)
          const coin2Address = wars[2].toString(10)
          const fromBlock = wars[5].toString(10)
          const toBlock = wars[6].toString(10)
          const coinWarAddress = wars[7].toString(10)

          warsList.push({
            warIndex: j - 1,
            coin1,
            coin2,
            coin1Address,
            coin2Address,
            fromBlock,
            toBlock,
            coinWarAddress
          })
        }
      }
      this.setState({ wars: warsList, message: null })
    } else {
      this.setState({ message: 'No wars are running currently' })
    }
  }

  componentDidMount = async () => {
    this.wfInstance = await this.props.warFactoryContract.deployed()

    const warClosedEvent = await this.wfInstance.WarClosed()
    const newWarCreatedEvent = await this.wfInstance.NewWarCreated()

    // new war created event
    newWarCreatedEvent.watch((error, results) => {
      this.loadWars(this.wfInstance)
    })

    // war closed event
    warClosedEvent.watch((error, results) => {
      this.loadWars(this.wfInstance)
    })
    this.loadWars(this.wfInstance)

    const { erc20Contract } = this.props

    // get token instances and balances
    this.eosInstance = await erc20Contract.at(tokensAddress.eos)
    this.trxInstance = await erc20Contract.at(tokensAddress.trx)
    this.bnbInstance = await erc20Contract.at(tokensAddress.bnb)
    this.venInstance = await erc20Contract.at(tokensAddress.ven)

    this.getTokensBalances()
  }

  // only for test network
  getTokensBalances = async () => {
    const { account } = this.props
    // get instance token
    const eos = await this.eosInstance.balanceOf(account)
    const trx = await this.trxInstance.balanceOf(account)
    const bnb = await this.bnbInstance.balanceOf(account)
    const ven = await this.venInstance.balanceOf(account)

    this.setState({
      eos: eos.toNumber(),
      trx: trx.toNumber(),
      bnb: bnb.toNumber(),
      ven: ven.toNumber()
    })
  }

  // only for test network
  withdrawFromFaucet = async () => {
    const { account, tokenFaucet } = this.props
    const faucetInstance = await tokenFaucet.deployed()
    await faucetInstance.withdrawTokens({ from: `${account}`, gas: 5000000 })

    this.getTokensBalances()
  }

  render() {
    const warList = this.state.wars
      .map((item, index) => {
        return (
          <div className="war_stage_item" key={index}>
            <WarStage
              { ...this.props }
              opponents={item}
              reload={balance => {
                if (this.wfInstance) {
                  this.loadWars(this.wfInstance)
                }
              }}
            />
          </div>
        )
    })

    const { eos, trx, bnb, ven } = this.state

    return (
      <div className="stage_wrap">
        <p style={{ margin: '20px 0 10px', padding: '20px 0' }}>Address:
          <strong > {this.props.account}</strong>
        </p>
        <div style={{ marginBottom: 20 }}>
          <Button bsStyle="success" bsSize="large" style={{backgroundColor: '#27AE60', borderColor: '#27AE60'}} onClick={this.withdrawFromFaucet.bind(this)}>Get Free Tokens!</Button>
          <div style={{ padding: '20px 150px', marginBottom: 50, marginTop: 20 }}>
            <div style={{ display: 'flex', fontSize: 14, justifyContent: 'center' }}>
              <div style={{ flex: 1 }}>
                <h3>
                  <Label bsStyle="primary" style={{ padding: '3px 10px' }}>{eos > 0 ? eos : `0`} EOS</Label>
                </h3>
              </div>
              <div style={{ flex: 1 }}>
                <h3>
                  <Label bsStyle="primary" style={{ padding: '3px 10px' }}>{trx > 0 ? trx : `0`} TRX</Label>
                </h3>
              </div>
              <div style={{ flex: 1 }}>
                <h3>
                  <Label bsStyle="primary" style={{ padding: '3px 10px' }}>{bnb > 0 ? bnb : `0`} BNB</Label>
                </h3>
              </div>
              <div style={{ flex: 1 }}>
                <h3>
                  <Label bsStyle="primary" style={{ padding: '3px 10px' }}>{ven > 0 ? ven : `0`} VEN</Label>
                </h3>
              </div>
            </div>
          </div>
        </div>
        {this.state.message && (
          <p>
            <strong>Holy guacamole!</strong> {this.state.message}
          </p>
        )}
        {warList}
      </div>
    )
  }
}
