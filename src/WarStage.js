import React, {Component} from 'react'
import { Button, Row, Col, ButtonGroup, Label, Image, ProgressBar } from 'react-bootstrap'
import ERC20 from './solidity/build/contracts/ERC20.json'
import TruffleContract from 'truffle-contract'
import ReactTimeout from 'react-timeout'
import BlockTracker from 'eth-block-tracker'
import hexToDec from 'hex-to-dec'
import CoinMarketCap from 'coinmarketcap-api'

// change this value to 50000 or more
const MAX_PROGRESS_PRICE = 100

class WarStage extends Component {

  state = {
    coin: false,
    bid: 0,
    message: false,
    coinWarBalance: 0,
    block: 0,
    coin1TokenBalance: 0,
    coin2TokenBalance: 0,
    withdrawn: false,
    warClosed: false,
    coin1_usd: 0,
    coin2_usd: 0,
    coin1Image: null,
    coin2Image: null
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

    // war closed event
    const wfInstance = await this.props.warfactory.deployed()
    const warClosedEvent = await wfInstance.WarClosed()
    warClosedEvent.watch(function(error, results) {
      _self.setState({ warClosed: true })
    })

    const provider = this.props.web3.currentProvider
    const blockTracker = new BlockTracker({ provider })
    blockTracker.on('block', (newBlock) => {
      console.log(newBlock)
      _self.setState({ block: hexToDec(newBlock.number) })
    })
    blockTracker.start()

    // get price
    this.coinMarketCapClient = new CoinMarketCap()
    const coin1_name = await coin1.name()
    const coin2_name = await coin2.name()
    await this.getCoin1USD(coin1_name)
    await this.getCoin2USD(coin2_name)
  }

  async getCoin1USD(coin_name) {
    try {
      const coin_data = await this.coinMarketCapClient
        .getTicker({ limit: 1, currency: coin_name })
      if (coin_data) {
        this.setState({ coin1_usd: coin_data[0].price_usd })
      }
    } catch (error) {
      console.log(error)
    }
  }

  async getCoin2USD(coin_name) {
    try {
      const coin_data = await this.coinMarketCapClient
        .getTicker({ limit: 1, currency: coin_name })
      if (coin_data) {
        this.setState({ coin2_usd: coin_data[0].price_usd })
      }
    } catch (error) {
      console.log(error)
    }
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

  close = () => {
    if (!this.state.warClosed) {
      return (
        <div><em>This was has ended ! You will be allowed to withdraw funds shortly.</em></div>
      )
    } else {
      if (!this.state.withdrawn) {
        return (<Button bsStyle="success" bsSize="large" onClick={this.withdraw.bind(this)}>Withdraw</Button>)
      } else {
        return (<div><em>Money has been withdrawn ! Please don't forget to participate in the next game</em></div>)
      }
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
          {this.close()}
        </div>
      )
    }
  }

  placeBid2 = () => {
    const { coin1, coin2, fromBlock, toBlock, coin1Address, coin2Address } = this.props.opponents
    const { block, coin, bid } = this.state

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
  }

  render() {
    const { coin1, coin2, toBlock,
      coin1Address, coin2Address, coin1Balance,
      coin2Balance } = this.props.opponents
    const { coin1TokenBalance, coin2TokenBalance, coin1_usd, coin2_usd } = this.state
    let coin1_bet_cost = parseFloat(coin1Balance * coin1_usd).toFixed(3)
    let coin2_bet_cost = parseFloat(coin2Balance * coin2_usd).toFixed(3)

    const coin1Progress = parseFloat((coin1_bet_cost / MAX_PROGRESS_PRICE) * 100)
    const coin2Progress = parseFloat((coin2_bet_cost / MAX_PROGRESS_PRICE) * 100)

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
                bsSize="lg" bsStyle="info">
                <Image
                  style={{ maxWidth: 64 }}
                  src={require(`./128/color/${coin1.toLowerCase()}.png`)} />
              </Button>
            </div>
            <div className="coin">
              <Button
                bsClass="coin-btn"
                bsSize="lg" bsStyle="success">
                <Image
                  style={{ maxWidth: 64 }}
                  src={require(`./128/color/${coin2.toLowerCase()}.png`)} />
              </Button>
            </div>
          </Col>
          <Col xs={6} md={6}>
            <div className="progress_wrap">
              <span>${coin1_bet_cost}/<span className="balance">{coin1Balance}</span> {coin1}</span>
              <ProgressBar striped active now={coin1Progress} label={`60%`} srOnly />
            </div>
            <div className="progress_wrap bottom">
              <span>${coin2_bet_cost}/<span className="balance">{coin2Balance}</span> {coin2}</span>
              <ProgressBar striped active now={coin2Progress} label={`${coin2Progress}%`} srOnly />
            </div>
          </Col>
          <Col xs={4} md={4}>
            {this.placeBid2()}
          </Col>
        </Row>
      </div>
    )
  }
}

export default ReactTimeout(WarStage)
