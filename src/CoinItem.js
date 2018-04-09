import React, {Component} from 'react'
import { Alert } from 'react-bootstrap'
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
    const wfInstance = await this.props.warFactoryContract.deployed()
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

  componentDidMount = () => {
    this.loadWars()
  }

  render() {
    const warsArray = this.state.wars
      .filter(filteredItem => {
        const _toBlock = parseInt(filteredItem.toBlock, 10)
        return _toBlock > this.props.currentBlock
      })

    const warList = warsArray
      .map((item, index) => {
        return (
          <div className="war_stage_item" key={index}>
            <WarStage
              { ...this.props }
              opponents={item}
              reload={balance => this.loadWars()}
            />
          </div>
        )
    })

    return (
      <div className="stage_wrap">
        <p style={{ margin: '20px 0 10px', padding: '20px 0' }}>Your Address:
          <strong style={{ color: '#1e617d' }}> {this.props.account}</strong>
        </p>
        {this.state.message && (
          <Alert bsStyle="warning">
            <strong>Holy guacamole!</strong> {this.state.message}
          </Alert>
        )}
        {warList}
      </div>
    )
  }
}
