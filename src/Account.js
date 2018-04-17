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
    console.log(player, value.toNumber(), player)
    let _finalAmount = _amount
      .div(this.getMultFactorForCoin(player))
      .toFixed(this.getDecimalsInCoin(player))
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

          console.log(results)

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

  getLabel = (labelType, amount, labelTxt) => {
    if (amount === "0.0") return null
    return (
      <span>
        <Label bsStyle={labelType}>{amount} {labelTxt}</Label>
      </span>
    )
  }

  singleCoinPlayer = (amount, isWinner = true, token) => {
    const label = isWinner ? 'success' : 'danger'
    const _amount = isWinner ? `+${amount}` : `-${amount}`
    return (
      <span>
        <Label bsStyle={label} style={{ marginRight: 5 }}>{_amount} {token}</Label>
        {isWinner && <Button bsStyle="success" onClick={this.withdraw}>Withdraw</Button>}
      </span>
    )
  }

  doubleCoinPlayer = (winner, amountWinner, looser, amountLooser) => {
    return (
      <span>
        <Label bsStyle="success" style={{ marginRight: 5 }}>+{amountWinner} {looser}</Label>
        <Label bsStyle="danger" style={{ marginRight: 5 }}>-{amountLooser} {looser}</Label>
        <Button bsStyle="success" onClick={this.withdraw}>Withdraw</Button>
      </span>
    )
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

      if (new Big(winnerTokenAmount).eq(0) && new Big(looserTokenAmount).eq(0)) {
        return null
      }

      let amount = 0
      let amountWinner = 0, amountLooser = 0
      let arith = 0

      let amountDisplay = null

      if (new Big(winnerTokenAmount).eq(0) && new Big(looserTokenAmount).gt(0)) {
        // only Looser
        console.log(`${token1}vs${token2} - only looser`)
        amount = looserTokenAmount.toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2')
        amountDisplay = this.singleCoinPlayer(amount, false, looser)
      } else if (new Big(winnerTokenAmount).gt(0) && new Big(looserTokenAmount).eq(0)) {
        // only Winner
        console.log(`${token1}vs${token2} - only winner`)
        arith = new Big(winnerTokenAmount)
          .div(winnerTokenTotalBet)
          .times(looserTokenTotalBet)
        amount = arith.toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2')
        amountDisplay = this.singleCoinPlayer(amount, true, looser)
      } else if (new Big(winnerTokenAmount).gt(0) && new Big(looserTokenAmount).gt(0)) {
        // both winner and looser
        console.log(`${token1}vs${token2} - both winner and looser`)
        arith = new Big(winnerTokenAmount)
          .div(winnerTokenTotalBet)
          .times(looserTokenTotalBet)
        amountWinner = arith.toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2')
        amountLooser = looserTokenAmount.toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2')
        amountDisplay = this.doubleCoinPlayer(winner, amountWinner, looser, amountLooser)
      }

      const _winnerTokenAmount = winnerTokenAmount.toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2')
      const _looserTokenAmount = looserTokenAmount.toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2')

      return (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{`${token1} vs ${token2}`}</td>
          <td>
            {this.getLabel('primary', _winnerTokenAmount, winner)}
            <span style={{ marginLeft: 10 }}>
              {this.getLabel('success', _looserTokenAmount, looser)}
            </span>
          </td>
          <td>{winner}</td>
          <td>
            {amountDisplay}
          </td>
        </tr>
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
