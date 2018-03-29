import React, {Component} from 'react'
import { Grid, Alert } from 'react-bootstrap'
import WarStage from './WarStage'

export default class CoinItem extends Component {

  constructor() {
    super()
    this.state = {
      wars: []
    }
  }

  loadWars = async () => {
    const warsList = []
    const wfInstance = await this.props.warfactory.deployed()
    let warsCount = await wfInstance.getWarsCount()
    let wCount = warsCount.toNumber()
    if (wCount > 0) {
      for (let j = 1; j <= wCount; j++) {
        const wars = await wfInstance.getWarAtIndex(j - 1)
        const coin1 = wars[0].split(' ')[0]
        const coin2 = wars[0].split(' ')[1]
        const coin1Address = wars[1].toString(10)
        const coin2Address = wars[2].toString(10)
        const coin1Balance = wars[3].toString(10)
        const coin2Balance = wars[4].toString(10)
        console.log('COIN1 BALANCE', coin1Balance)
        const fromBlock = wars[5].toString(10)
        const toBlock = wars[6].toString(10)
        const coinWarAddress = wars[7].toString(10)
        warsList.push({
          coin1,
          coin2,
          coin1Address,
          coin2Address,
          coin1Balance,
          coin2Balance,
          fromBlock,
          toBlock,
          coinWarAddress
        })
      }
      this.setState({ wars: warsList, message: null })
    } else {
      this.setState({ message: 'No wars are running currently' })
    }
  }

  componentDidMount = async () => {
    this.loadWars()
  }

  render() {
    const warList = this.state.wars.map((item, index) => {
      return (
        <div key={index}>
          <WarStage
            web3={this.props.web3}
            opponents={item}
            reload={(balance) => {
              if (balance > 0) {
                console.log('CoinWar Balance', balance.toNumber())
              }
              this.loadWars()
            }}
            getBalanceCoin2={balance => {
              if (this.props.getBalanceCoin2) { this.props.getBalanceCoin2(balance) }
            }}
            getBalanceCoin1={(balance) => {
              if (this.props.getBalanceCoin1) { this.props.getBalanceCoin1(balance) }
            }}
            account={this.props.account} />
        </div>
      )
    })

    return (
      <Grid>
        {this.state.message && (
          <Alert bsStyle="warning">
            <strong>Holy guacamole!</strong> {this.state.message}
          </Alert>
        )}
        {warList}
      </Grid>
    )
  }
}
