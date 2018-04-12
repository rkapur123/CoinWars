import React, {Component} from 'react'
import { Table, Label, Button } from 'react-bootstrap'
import Big from 'big.js'
import TokenDecimals from './token_decimals'

export default class Account extends Component {

  constructor() {
    super()
    this.state = {
      results: [],
      withdrawn: false,
      warClosed: false
    }
  }

  componentWillMount = () => {
    this.setState({ loading: true })
  }

  getMultFactorForCoin = coin => {
    let factor = 1
    for (let i = 0; i < this.getDecimalsInCoin(coin); i++) {
      factor = factor * 10;
    }
    return factor
  }

  getDecimalsInCoin = (coin) => {
    if (!coin) return 18
    let _coin = TokenDecimals[coin.toLowerCase()]
    if (_coin) {
      return _coin['decimals']
    }
    return 18
  }

  getFomatted = (player, value) => {
    if (!value) value = 0
    let _amount = new Big(value)
    let _finalAmount = _amount
      .div(this.getMultFactorForCoin(player.toLowerCase()))
      .toFixed(this.getDecimalsInCoin(player.toLowerCase()))
    return _finalAmount
  }

  loadWars = async () => {
    const { account } = this.props
    const warResults = []
    const warsCount = await this.wfInstance.getWarsCount()
    const wCount = warsCount.toNumber()
    if (wCount > 0) {
      for (let j = 1; j <= wCount; j++) {
        const results = await this.wfInstance.getResultsAtIndexForUser(j - 1, account)
        const isOnGoing = await this.wfInstance.isWarClosedAtIndex(j - 1)
        if (!isOnGoing[0]) {
          const tokens = results[0].split(' ')
          const _winner = results[1].toNumber()
          let winner, looser
          if (_winner === 1) {
            winner = tokens[0]
            looser = tokens[1]
          } else if (_winner === 2) {
            winner = tokens[1]
            looser = tokens[0]
          }

          warResults.push({
            token1: tokens[0],
            token2: tokens[1],
            winner,
            looser,
            winnerTokenAmount: this.getFomatted(winner, results[2]),
            looserTokenAmount: this.getFomatted(looser, results[3]),
            winnerTokenTotalBet: this.getFomatted(winner, results[4]),
            looserTokenTotalBet: this.getFomatted(looser, results[5]),
            coinWarAddress: isOnGoing[1]
          })
        }
      }
      this.setState({ results: warResults, loading: false })
    }
  }

  componentDidMount = async () => {
    this.wfInstance = await this.props.warFactoryContract.deployed()
    const warClosedEvent = await this.wfInstance.WarClosed()
    warClosedEvent.watch((error, results) => {
      console.log(error, results)
      // FIX THE UPDATE ISSUE
      this.setState({ warClosed: true })
    })
    this.loadWars(this.wfInstance)
  }

  // WE NEED COINWAR ADDRESS FOR THIS FUNCTION TO WORK
  withdraw = async (coinWarAddress) => {
    const { account, coinWarContract } = this.props
    try {
      const coinWarInstance = await coinWarContract.at(coinWarAddress)
      const receipt = await coinWarInstance.withdraw({ from: account, gas: 5000000 })
      console.log(receipt)
      this.setState({ withdrawn: true })
    } catch (error) {
      console.log(error)
    }
  }

  loadData = () => {
    const { loading, withdrawn } = this.state
    if (loading) {
      return (
        <div className="intro">
          <h1>Accounts Page</h1>
          <p>Your Account: {this.props.account}</p>
          <div style={{ padding: 50 }}>
            <div>Loading Account Details ...</div>
          </div>
        </div>
      )
    }

    if (this.state.results.length === 0) {
      return (
        <div className="intro">
          <h1>Accounts Page</h1>
          <p>Your Account: {this.props.account}</p>
          <div style={{ padding: 50 }}>
            <div>No war has been closed as yet ...</div>
          </div>
        </div>
      )
    }

    const warsClosed = this.state.results.map((item, index) => {
      const { token1, token2, winner, looser,
        winnerTokenAmount, looserTokenAmount,
        winnerTokenTotalBet, looserTokenTotalBet, coinWarAddress } = item

      let arith = 0

      if (winnerTokenAmount > 0) {
        let _arith = new Big(winnerTokenAmount)
        arith = _arith
          .div(winnerTokenTotalBet)
          .times(looserTokenTotalBet)
      }

      const _winnerTokenAmount = winnerTokenAmount.toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2')
      const _looserTokenAmount = looserTokenAmount.toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2')

      return (
        (winnerTokenAmount.toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2') !== "0.0") && (looserTokenAmount.toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2') !== "0.0") &&
        (<tr key={index}>
          <td>{index + 1}</td>
          <td>{`${token1} vs ${token2}`}</td>
          <td>
            <Label bsStyle="primary">{_winnerTokenAmount}</Label> {winner},
              <Label style={{ marginLeft: 10 }} bsStyle="success">{_looserTokenAmount}</Label> {looser}
          </td>
          <td>{winner}</td>
          <td>{arith.toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2')} , <span style={{ color: '#8c2828' }}>-{_looserTokenAmount}</span> {(winnerTokenAmount > 0 && (withdrawn !== true)) && (
              <Button bsStyle="success" bsSize="large" onClick={this.withdraw.bind(this, coinWarAddress)}>Withdraw</Button>
            )}</td>
        </tr>)
      )
    })

    return (
      <div className="intro">
        <h1>Accounts Page</h1>
        <p>Your Account: {this.props.account}</p>
        <div style={{ padding: 50 }}>

          <Table responsive style={{ textAlign: 'left' }} bordered>
            <thead>
              <tr>
                <th>#</th>
                <th>GAME</th>
                <th>BET</th>
                <th>WINNER</th>
                <th>WINNINGS</th>
              </tr>
            </thead>
            <tbody>
              {warsClosed}
            </tbody>
          </Table>

        </div>
      </div>
    )
  }

  render() {
    return this.loadData()
  }
}
