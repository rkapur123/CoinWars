import React, {Component} from 'react'
import { Button, Row, Col, ButtonGroup, Label } from 'react-bootstrap'
import ERC20 from './solidity/build/contracts/ERC20.json'
import TruffleContract from 'truffle-contract'
import ReactTimeout from 'react-timeout'

class WarStage extends Component {

  state = {
    coin: false,
    bid: 0,
    message: false,
    coinWarBalance: 0,
    block: 0,
    coin1TokenBalance: 0,
    coin2TokenBalance: 0,
    withdrawn: false
  }

  async componentDidMount() {
    let _self = this
    this.tokenContract = TruffleContract(ERC20)
    this.tokenContract.setProvider(this.props.web3.currentProvider)

    this.coins = new Map()
    const { coin1Address, coin2Address, coinWarAddress } = this.props.opponents

    // get coinwar instance
    this.coinwarsInstance = await this.props.coinwars.at(coinWarAddress)

    const coin1 = await this.tokenContract.at(coin1Address)
    const coin1Event = await coin1.Transfer({}, { fromBlock: 0, toBlock: 'latest' })
    coin1Event.watch(async function(error, results) {
      const coinWarBalance =  await coin1.balanceOf(coinWarAddress)
      const myBalance = await coin1.balanceOf(_self.props.account)
      if (_self.props.getBalanceCoin1) {
        _self.props.getBalanceCoin1(myBalance)
        _self.setState({ coin1TokenBalance: myBalance.toNumber() })
      }
      _self.props.reload(coinWarBalance)
    })

    this.coins.set(coin1Address, coin1)

    const coin2 = await this.tokenContract.at(coin2Address)
    const coin2Event = await coin2.Transfer({}, { fromBlock: 0, toBlock: 'latest' })
    coin2Event.watch(async function(error, results) {
      const coinWarBalance = await coin2.balanceOf(coinWarAddress)
      const myBalance = await coin2.balanceOf(_self.props.account)
      if (_self.props.getBalanceCoin2) {
        _self.props.getBalanceCoin2(myBalance)
        _self.setState({ coin2TokenBalance: myBalance.toNumber() })
      }
      _self.props.reload(coinWarBalance)
    })

    this.coins.set(coin2Address, coin2)

    // fire after 1 second
    this.props.setInterval(this.scanBlock.bind(this), 1500)

    this.webSocket = new WebSocket("ws://localhost:8080")
    this.webSocket.onopen = function (event) {
      _self.webSocket.send(`War between ${coin1Address} and ${coin2Address}`)
    }
    this.webSocket.onmessage = function(message) {
      const { data } = message
      console.log(data)
    }
  }

  componentWillUnmount = () => {
    this.webSocket.close()
  }

  scanBlock = () => {
    const _self = this
    const { web3 } = this.props
    web3.eth.getBlockNumber(function(err, block) {
      console.log(block)
      _self.setState({ block })
    })
  }

  handleData = data => {
    console.log(data)
  }

  async handleSubmit(e) {
    e.preventDefault()
    const { coinWarAddress } = this.props.opponents
    const coin = this.coins.get(this.state.coin)
    if (coin) {
      const bet = await coin.transfer(coinWarAddress, this.state.bid,
        { from: `${this.props.account}`, gas: 5000000 })
      console.log('Transfer initialiated', bet)
    } else {
      console.log('no coin found ...')
    }
  }

  withdraw = async () => {
    const { account } = this.props
    if (this.coinwarsInstance) {
      await this.coinwarsInstance.withdraw({ from: account, gas: 5000000 })
      this.setState({ withdrawn: true })
    }
  }

  placeBid = () => {
    const { coin1, coin2, fromBlock, toBlock, coin1Address, coin2Address } = this.props.opponents
    const { block, coin, bid } = this.state

    if (block >= parseInt(fromBlock) && block <= parseInt(toBlock)) {
      return (
        <form onSubmit={this.handleSubmit.bind(this)}>
          <div className="form-group">
            <ButtonGroup>
              <Button active={coin === coin1Address ? true : false}
                onClick={() => this.setState({ coin: coin1Address })}>{coin1}</Button>
              <Button active={coin === coin2Address ? true : false}
                onClick={() => this.setState({ coin: coin2Address })}>{coin2}</Button>
            </ButtonGroup>
          </div>
          <input type="hidden" name="coin" value={coin} />
          <div className="form-group">
            <button type="button" className="btn btn-block btn-info">Overtake</button>
          </div>
          <div className="form-group">
            <input type="number" className="form-control" name="amount"
              value={bid}
              onChange={(e) => this.setState({ bid: e.target.value })}
              placeholder="bet amount e.g. 100"
              required />
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-block btn-primary">Submit</button>
          </div>
        </form>
      )
    } else if (block < parseInt(fromBlock)) {
      return (
        <div>Currently this war is not running</div>
      )
    } else if (block > parseInt(toBlock)) {
      return (
        <div>
          <div style={{ paddingBottom: 20 }}>Game Over</div>
          {!this.state.withdrawn ? (
            <Button bsStyle="success" bsSize="large" onClick={this.withdraw.bind(this)}>Withdraw</Button>
          ) : (
            <div><em>Money has been withdrawn ! Please don't forget to participate in the next game</em></div>
          )}
        </div>
      )
    }
  }

  render() {
    const { coin1, coin2, toBlock,
      coin1Address, coin2Address, coin1Balance,
      coin2Balance } = this.props.opponents
    const { coin1TokenBalance, coin2TokenBalance } = this.state
    return (
      <div>
        <div className="time_notif">11:50:00 / {this.state.block}# {toBlock}</div>
        <div>Balance {coin1}: <Label bsStyle="info">{coin1TokenBalance}</Label> tokens</div>
        <div>Balance {coin2}: <Label bsStyle="success">{coin2TokenBalance}</Label> tokens</div>
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
            {this.placeBid()}
          </Col>
        </Row>
      </div>
    )
  }
}

export default ReactTimeout(WarStage)
