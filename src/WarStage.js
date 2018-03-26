import React, {Component} from 'react'
import { Button, Row, Col, ButtonGroup } from 'react-bootstrap'
import ERC20 from './solidity/build/contracts/ERC20.json'
import TruffleContract from 'truffle-contract'

export default class WarStage extends Component {

  state = {
    coin: false,
    bid: 0,
    message: false,
    coinWarBalance: 0
  }

  async componentDidMount() {
    let _self = this
    this.tokenContract = TruffleContract(ERC20)
    this.tokenContract.setProvider(this.props.web3.currentProvider)

    this.coins = new Map()
    const { coin1Address, coin2Address, coinWarAddress } = this.props.opponents
    const coin1 = await this.tokenContract.at(coin1Address)
    const coin1Event = await coin1.Transfer({}, { fromBlock: 0, toBlock: 'latest' })
    coin1Event.watch(async function(error, results) {
      const coinWarBalance =  await coin1.balanceOf(coinWarAddress)
      _self.props.reload(coinWarBalance)
    })

    this.coins.set(coin1Address, coin1)

    const coin2 = await this.tokenContract.at(coin2Address)
    const coin2Event = await coin2.Transfer({}, { fromBlock: 0, toBlock: 'latest' })
    coin2Event.watch(async function(error, results) {
      const coinWarBalance = await coin2.balanceOf(coinWarAddress)
      _self.props.reload(coinWarBalance)
    })

    this.coins.set(coin2Address, coin2)
  }

  async handleSubmit(e) {
    e.preventDefault()
    const { coinWarAddress } = this.props.opponents
    await this.coins.get(this.state.coin).transfer(coinWarAddress, this.state.bid,
      { from: `${this.props.account}`, gas: 5000000 })
  }

  render() {
    const { coin1, coin2, toBlock,
      coin1Address, coin2Address, coin1Balance,
      coin2Balance } = this.props.opponents
    return (
      <div>
        <div className="time_notif">11:50:00 / Block# {toBlock}</div>
        <Row className="show-grid">
          <Col xs={2} md={2}>
            <div className="coin">
              <Button
                bsClass="coin-btn"
                bsSize="lg" bsStyle="info">{coin1}</Button>
            </div>
            <div className="coin">
              <Button
                bsClass="coin-btn"
                bsSize="lg" bsStyle="success">{coin2}</Button>
            </div>
          </Col>
          <Col xs={6} md={6}>
            <div className="progress_wrap">
              <span>$30000/<span className="balance">{coin1Balance}</span> {coin1}</span>
              <div className="progress">
                <div className="progress-bar progress-bar-striped" role="progressbar" style={{ width: '10%' }} aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
            </div>
            <div className="progress_wrap bottom">
              <span>$30000/<span className="balance">{coin2Balance}</span> {coin2}</span>
              <div className="progress">
                <div className="progress-bar progress-bar-striped" role="progressbar" style={{ width: '30%' }} aria-valuenow="30" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
            </div>
          </Col>
          <Col xs={4} md={4}>
            <form onSubmit={this.handleSubmit.bind(this)}>
              <div className="form-group">
                <ButtonGroup>
                  <Button active={this.state.coin === coin1Address ? true : false}
                    onClick={() => this.setState({ coin: coin1Address })}>{coin1}</Button>
                  <Button active={this.state.coin === coin2Address ? true : false}
                    onClick={() => this.setState({ coin: coin2Address })}>{coin2}</Button>
                </ButtonGroup>
              </div>
              <input type="hidden" name="coin" value={this.state.coin} />
              <div className="form-group">
                <button type="button" className="btn btn-block btn-info">Overtake</button>
              </div>
              <div className="form-group">
                <input type="number" className="form-control" name="amount"
                  value={this.state.bid}
                  onChange={(e) => this.setState({ bid: e.target.value })}
                  placeholder="bet amount e.g. 100"
                  required />
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-block btn-primary">Submit</button>
              </div>
            </form>
          </Col>
        </Row>
      </div>
    )
  }
}
