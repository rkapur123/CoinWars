import React, {Component} from 'react'
import WarStage from './WarStage'

export default class CoinItem extends Component {

  constructor() {
    super()
    this.state = {
      wars: []
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
      console.log(error, results)
      this.loadWars(this.wfInstance)
    })

    // war closed event
    warClosedEvent.watch((error, results) => {
      this.loadWars(this.wfInstance)
    })
    this.loadWars(this.wfInstance)
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

    return (
      <div className="stage_wrap">
        <p style={{ margin: '20px 0 10px', padding: '20px 0' }}>Address:
          <strong > {this.props.account}</strong>
        </p>
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
