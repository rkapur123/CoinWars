import React, {Component} from 'react'

export default class Account extends Component {

  state = {
    results: []
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
        const tokens = results[0].split(' ')
        warResults.push({
          token1: tokens[0],
          token2: tokens[1],
          winner: parseInt(results[1], 10),
          winnerTokenAmount: results[2],
          looserTokenAmount: results[3],
          winnerTokenTotalBet: results[4],
          looserTokenTotalBet: results[5],
          isOngoing: isOnGoing
        })
      }
      console.log(warResults)
      this.setState({ results: warResults, loading: false })
    }
  }

  loadData = () => {
    const { loading } = this.state
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
    return (
      <div className="intro">
        <h1>Accounts Page</h1>
        <p>Your Account: {this.props.account}</p>
        <div style={{ padding: 50 }}>
          <div>Your Data</div>
        </div>
      </div>
    )
  }

  render() {
    return this.loadData()
  }
}
