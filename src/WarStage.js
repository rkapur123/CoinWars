import React, {Component} from 'react'
import { Button, Row, Col, ButtonGroup, Label, Image, ProgressBar } from 'react-bootstrap'
import ReactTimeout from 'react-timeout'
import BlockTracker from 'eth-block-tracker'
import hexToDec from 'hex-to-dec'
import CoinMarketCap from 'coinmarketcap-api'
import Big from 'big.js'
import TokenDecimals from './token_decimals'

// change this value to 50000 or more
const MAX_PROGRESS_PRICE = 50000

class WarStage extends Component {

  state = {
    coin: false,
    bid: 0,
    showBid: 0,
    message: false,
    coinWarBalance: 0,
    block: 0,
    netCoin1Balance: 0,
    netCoin2Balance: 0,
    netCoin1Bet: 0,
    netCoin2Bet: 0,
    coin1_usd: 0,
    coin2_usd: 0,
    coinSelected: false,
    coin1Image: null,
    coin2Image: null,
    overtake: 0,
    startTime: 0
  }

  async componentDidMount() {
    this.coins = new Map()
    const { coin1Address, coin2Address,
      coinWarAddress, fromBlock, toBlock } = this.props.opponents

    // get coinwar instance
    this.coinwarsInstance = await this.props.coinWarContract.at(coinWarAddress)

    // get erc20 coins instances
    this.coin1 = await this.props.erc20Contract.at(coin1Address)
    this.coins.set(coin1Address, this.coin1)
    this.coin2 = await this.props.erc20Contract.at(coin2Address)
    this.coins.set(coin2Address, this.coin2)

    // get coin1 balance
    const c1_balance = await this.coin1.balanceOf(this.props.account)

    // get coin2 balance
    const c2_balance = await this.coin2.balanceOf(this.props.account)

    this.setState({
      netCoin1Balance: c1_balance.toNumber(),
      netCoin2Balance: c2_balance.toNumber()
    })

    const coin1Event = await this.coin1.Transfer({}, { fromBlock, toBlock })
    coin1Event.watch(async (error, results) => {
      console.log('COIN1_EVENT', results.args._value.toNumber())
      const coinWarBalance = await this.coin1.balanceOf(coinWarAddress)
      const myBalance = await this.coin1.balanceOf(this.props.account)
      this.setState({
        netCoin1Balance: myBalance.toNumber(),
        netCoin1Bet: coinWarBalance.toNumber()
      })
      this.props.reload(coinWarBalance)
    })

    const coin2Event = await this.coin2.Transfer({}, { fromBlock, toBlock })
    coin2Event.watch(async (error, results) => {
      console.log('COIN2_EVENT', results.args._value.toNumber())
      const coinWarBalance = await this.coin2.balanceOf(coinWarAddress)
      const myBalance = await this.coin2.balanceOf(this.props.account)
      this.setState({
        netCoin2Balance: myBalance.toNumber(),
        netCoin2Bet: coinWarBalance.toNumber()
      })
      this.props.reload(coinWarBalance)
    })

    // get latest block event
    const blockTracker = new BlockTracker({ provider: this.props.provider })
    blockTracker.on('block', (newBlock) => {
      this.setState({ block: hexToDec(newBlock.number) })
      // await this.getTime(hexToDec(newBlock.number))
    })
    blockTracker.start()

    // get price from coinmarketcap after every 3 seconds
    this.props.setTimeout(this.getCoinsPrice, 3000)
  }

  getCoinsId = (coin) => {
    let _coin = TokenDecimals[coin.toLowerCase()]
    if (_coin) {
      return _coin['id']
    }
    return false
  }

  getCoinsPrice = async () => {
    const { coin1, coin2 } = this.props.opponents
    const coin1_id = this.getCoinsId(coin1)
    const coin2_id = this.getCoinsId(coin2)
    this.coinMarketCapClient = new CoinMarketCap()
    if (coin1_id) {
      await this.getCoin1USD(coin1_id)
    }
    if (coin2_id) {
      await this.getCoin2USD(coin2_id)
    }
  }

  async getCoin1USD(coin_id) {
    try {
      const coin_data = await this.coinMarketCapClient
        .getTicker({ limit: 1, currency: coin_id })
      if (coin_data) {
        this.setState({ coin1_usd: coin_data[0].price_usd })
      }
    } catch (error) {
      console.log(error)
    }
  }

  async getCoin2USD(coin_id) {
    try {
      const coin_data = await this.coinMarketCapClient
        .getTicker({ limit: 1, currency: coin_id })
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
    const { coin, coinSelected, showBid } = this.state
    const _coin = this.coins.get(coin)
    if (_coin) {
      const _bid = new Big(parseFloat(showBid))
      const _amount = _bid
        .times(this.getMultFactorForCoin(coinSelected))
        .toFixed(this.getDecimalsInCoin(coinSelected))
      console.log(`Bet ${_amount} placed for ${coinSelected}`)

      const bet = await _coin.transfer(coinWarAddress, _amount,
        { from: `${this.props.account}`, gas: 5000000 })
      console.log('Transfer initialiated', bet)
    } else {
      console.log('no coin found ...')
    }
  }

  overtake = () => {
    this.refs.amount.value = 300
  }

  formatted = (bid, coinSelected) => {
    if (!bid) bid = 0
    const _bid = new Big(parseFloat(bid))
    const _amount = _bid
      .div(this.getMultFactorForCoin(coinSelected))
      .toFixed(this.getDecimalsInCoin(coinSelected))
    return _amount
  }

  bidForm = () => {
    const { coin1, coin2, coin1Address, coin2Address } = this.props.opponents
    const { coin, bid, showBid, coinSelected } = this.state
    return (
      <form style={{ marginTop: -50 }} onSubmit={this.handleSubmit.bind(this)}>
        <div className="form-group">
          <ButtonGroup>
            <Button active={coin === coin1Address ? true : false}
              onClick={() => this.setState({ coin: coin1Address, coinSelected: coin1 })}>{coin1}</Button>
            <Button active={coin === coin2Address ? true : false}
              onClick={() => this.setState({ coin: coin2Address, coinSelected: coin2 })}>{coin2}</Button>
          </ButtonGroup>
        </div>
        <input type="hidden" name="coin" value={coin} />
        <div className="form-group">
          <Button bsStyle="info"
            style={{ width: '100%' }}
            disabled={!coin}
            onClick={this.overtake}>Overtake</Button>
        </div>
        <div className="form-group">
          <input type="number" className="form-control" name="amount"
            value={bid}
            onChange={(e) => {
              this.setState({
                bid: e.target.value,
                showBid: this.formatted(e.target.value, coinSelected)
              })
            }}
            disabled={!coin}
            placeholder="bet amount e.g. 100"
            required />
        </div>
        <div className="form-group">
          <input type="number" className="form-control" name="final_amount"
            ref="show_amount"
            value={showBid}
            disabled
            placeholder="bet amount e.g. 100"
            required />
        </div>
        <div className="form-group">
          <button type="submit" disabled={!coin} className="btn btn-block btn-primary">Submit</button>
        </div>
      </form>
    )
  }

  placeBid = () => {
    const { toBlock, fromBlock } = this.props.opponents
    const { block } = this.state

    const _fromBlock = parseInt(fromBlock, 10)
    const _toBlock = parseInt(toBlock, 10)

    if (block >= _fromBlock && block <= _toBlock) {
      return this.bidForm()
    } else if (block < _fromBlock) {
      return (
        <div>Currently this war is not running</div>
      )
    } else if (block > _toBlock) {
      return (
        <div>
          <div style={{ paddingBottom: 20 }}>Game Over</div>
          <div><em>This war is over ! You will be allowed to withdraw funds shortly. Please check your accounts page</em></div>
        </div>
      )
    }
  }

  // get the average block time
  getBlockAverageTime = async () => {
    const span = 100
    const times = []
    const { web3 } = this.props
    const currentNumber = await web3.eth.getBlockNumber()

    const firstBlock = await web3.eth.getBlock(currentNumber - span)
    let prevTimestamp = firstBlock.timestamp

    for (let i = currentNumber - span + 1; i <= currentNumber; i++) {
      const block = await web3.eth.getBlock(i)
      let time = block.timestamp - prevTimestamp
      prevTimestamp = block.timestamp
      times.push(time)
    }
    return Math.round(times.reduce((a, b) => a + b) / times.length)
  }

  getDecimals = (coin) => {
    if (coin) {
      return coin['decimals']
    }
    return 18
  }

  getTokenDecimals = coin => {
    let count = 10
    for (let i = 0; i < this.getDecimals(coin); i++) {
      count *= 10
    }
    return count;
  }

  // the price of bet amount (is usd)
  getNumberOfTokensBetPrice = (coin, bet_amount, price_usd) => {
    if (!bet_amount) bet_amount = 0
    let _coin = TokenDecimals[coin.toLowerCase()]
    let x = new Big(price_usd)
    let y = x
      .times(bet_amount)
      .toFixed(this.getDecimals(_coin))
    return y
  }

  // get number of tokens bet (amount)
  getNumberOfTokensBet = (coin, bet_amount) => {
    if (!bet_amount) bet_amount = 0
    let _coin = TokenDecimals[coin.toLowerCase()]
    let x = new Big(bet_amount)
    let y = x
      .toFixed(this.getDecimals(_coin))
    return y
  }

  // get decimal value for a coin
  getDecimalsInCoin = (coin) => {
    if (!coin) return 18
    let _coin = TokenDecimals[coin.toLowerCase()]
    if (_coin) {
      return _coin['decimals']
    }
    return 18
  }

  getMultFactorForCoin = coin => {
    let factor = 1
    for (let i = 0; i < this.getDecimalsInCoin(coin); i++) {
      factor = factor * 10;
    }
    return factor
  }

  getTime = async (currentBlock) => {
    const { fromBlock } = this.props.opponents
    this.getBlockAverageTime()
      .then(avgTime => {
        if (currentBlock < fromBlock) {
          let _startTime = avgTime * (fromBlock - currentBlock)
          this.setState({ startTime: _startTime })
        }
      })
  }

  render() {
    const { coin1, coin2, toBlock } = this.props.opponents
    const { netCoin1Balance, netCoin2Balance,
      netCoin1Bet, netCoin2Bet, coin1_usd,
      coin2_usd, startTime, block } = this.state

    const coin1_balance = this.getNumberOfTokensBet(coin1, netCoin1Balance)
    const coin2_balance = this.getNumberOfTokensBet(coin2, netCoin2Balance)

    const coin1_bet_amount = this.getNumberOfTokensBet(coin1, netCoin1Bet)
    const coin2_bet_amount = this.getNumberOfTokensBet(coin2, netCoin2Bet)

    const coin1_bet_price = this.getNumberOfTokensBetPrice(coin1, netCoin1Bet, coin1_usd)
    const coin2_bet_price = this.getNumberOfTokensBetPrice(coin2, netCoin2Bet, coin2_usd)

    const coin1Progress = parseFloat((coin1_bet_price / MAX_PROGRESS_PRICE) * 100)
    const coin2Progress = parseFloat((coin2_bet_price / MAX_PROGRESS_PRICE) * 100)

    return (
      <div>
        <div className="time_notif">{startTime} seconds / {block}# {toBlock}</div>
        <div>Balance {coin1}: <Label bsStyle="info">{coin1_balance.toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2')}</Label> tokens</div>
        <div>Balance {coin2}: <Label bsStyle="success">{coin2_balance.toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2')}</Label> tokens</div>
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
              <span>${coin1_bet_price.toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2')}/<span className="balance">{coin1_bet_amount.toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2')}</span> {coin1}</span>
              <ProgressBar striped bsStyle="info" active now={coin1Progress} label={`60%`} srOnly />
            </div>
            <div className="progress_wrap bottom">
              <span>${coin2_bet_price.toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2')}/<span className="balance">{coin2_bet_amount.toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2')}</span> {coin2}</span>
              <ProgressBar striped bsStyle="success" active now={coin2Progress} label={`${coin2Progress}%`} srOnly />
            </div>
          </Col>
          <Col xs={4} md={4}>
            <div style={{ paddingLeft: 20, paddingRight: 20 }}>
              {this.placeBid()}
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

export default ReactTimeout(WarStage)
