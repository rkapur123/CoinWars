import React, {Component} from 'react'
import { Table, Label, Button } from 'react-bootstrap'
import Big from 'big.js'

export default class Account extends Component {

  state = {
    results: [],
    withdrawn: false
  }

  componentWillMount = () => {
    this.setState({ loading: true })
  }

  componentDidMount = async () => {
    const { account } = this.props
    const warResults = []
    const wfInstance = await this.props.warFactoryContract.deployed()
    const warsCount = await wfInstance.getWarsCount()
    const wCount = warsCount.toNumber()
    if (wCount > 0) {
      for (let j = 1; j <= wCount; j++) {
        const results = await wfInstance.getResultsAtIndexForUser(j - 1, account)
        const isOnGoing = await wfInstance.isWarClosedAtIndex(j - 1)
        if (!isOnGoing) {
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
            winnerTokenAmount: new Big(results[2]),
            looserTokenAmount: new Big(results[3]),
            winnerTokenTotalBet: new Big(results[4]),
            looserTokenTotalBet: new Big(results[5])
          })
        }
      }
      console.log(warResults)
      this.setState({ results: warResults, loading: false })
    }
  }

  withdraw = async () => {
    const { account } = this.props
    if (this.coinwarsInstance) {
      await this.coinwarsInstance.withdraw({ from: account, gas: 5000000 })
      this.setState({ withdrawn: true })
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

    const warsClosed = this.state.results.map((item, index) => {
      const { token1, token2, winner, looser,
        winnerTokenAmount, looserTokenAmount, winnerTokenTotalBet, looserTokenTotalBet } = item

      let arith = 0
      const _winnerTokenAmt = winnerTokenAmount.toFixed(10)

      if (_winnerTokenAmt > 0) {
        arith = winnerTokenAmount
          .div(winnerTokenTotalBet)
          .times(looserTokenTotalBet)
          .toFixed(5)
      }

      console.log(arith)

      return (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{`${token1} vs ${token2}`}</td>
          <td>
            <Label bsStyle="primary">{winnerTokenAmount.toString()}</Label> {winner},
              <Label style={{ marginLeft: 10 }} bsStyle="success">{looserTokenAmount.toString()}</Label> {looser}
          </td>
          <td>{winner}</td>
          <td>{arith} {(_winnerTokenAmt > 0 && (withdrawn !== true)) && (
              <Button bsStyle="success" bsSize="large" onClick={this.withdraw.bind(this)}>Withdraw</Button>
            )}</td>
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
