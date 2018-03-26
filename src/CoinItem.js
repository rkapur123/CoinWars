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

  loadWars = async wfInstance => {
    const warsList = []
    let warsCount = await wfInstance.getWarsCount.call({ from: this.props.account })
    let wCount = warsCount.toNumber()
    console.log('Wars Count', wCount)
    if (wCount > 0) {
      for (let j = 1; j <= wCount; j++) {
        const wars = await wfInstance.getWarAtIndex(j - 1)
        const coin1 = wars[0].split(' ')[0]
        const coin2 = wars[0].split(' ')[1]
        const coin1Address = wars[1].toString(10)
        const coin2Address = wars[2].toString(10)
        const coin1Balance = wars[3].toString(10)
        const coin2Balance = wars[4].toString(10)
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
    const wfInstance = await this.props.warfactory.deployed()
    var newWarEvent = wfInstance.NewWarStarted()
    var _self = this
    newWarEvent.watch(function(error, result) {
      _self.loadWars(wfInstance)
    })

    this.loadWars(wfInstance)
  }

  render() {
    const warList = this.state.wars.map((item, index) => {
      console.log(item)
      return (
        <div key={index}>
          <WarStage
            web3={this.props.web3}
            opponents={item}
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
