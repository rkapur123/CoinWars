import React, {Component} from 'react'
import { Button, Row, Col, ButtonGroup, OverlayTrigger, Tooltip,
  Image, ProgressBar } from 'react-bootstrap'
import ReactTimeout from 'react-timeout'
import BlockTracker from 'eth-block-tracker'
import hexToDec from 'hex-to-dec'
import CoinMarketCap from 'coinmarketcap-api'
import Big from 'big.js'
import TokenDecimals from './token_decimals'
import moment from 'moment'
import momentDurationFormat from 'moment-duration-format'

momentDurationFormat(moment)
typeof moment.duration.fn.format === "function";
typeof moment.duration.format === "function";

const API_REFRESH_RATE = 60000

const LinkWithTooltip = ({ id, children, href, tooltip }) => {
  return (
    <OverlayTrigger
      overlay={<Tooltip id={id}>{tooltip}</Tooltip>}
      placement="top"
      delayShow={300}
      delayHide={150}
    >
      <a style={{ color: 'white', textDecoration: 'none' }} href={href}>{children}</a>
    </OverlayTrigger>
  );
}


class WarStage extends Component {

  state = {
    coin: false,
    bid: 0,
    message: false,
    coinWarBalance: 0,
    block: 0,
    netCoin1Bet: 0,
    netCoin2Bet: 0,
    coin1_usd: 0,
    coin2_usd: 0,
    coinSelected: false,
    coin1Image: null,
    coin2Image: null,
    overtake: 0,
    startTime: 0,
    myToken1BetPercentage: 0,
    myToken2BetPercentage: 0,
    myToken1BetPrice: 0,
    myToken2BetPrice: 0,
    myToken1BetAmount: 0,
    myToken2BetAmount: 0,
    tooglePrice: true
  }

  componentWillMount() {
    this.MAX_PROGRESS_PRICE = 0

    // get initial price
    this.getCoinsPrice()
  }

  async componentDidMount() {
    this.coins = new Map()
    const { coin1, coin2, coin1Address, coin2Address,
      coinWarAddress, fromBlock, toBlock } = this.props.opponents

    // query for block
    this.getBlock()

    // get coinwar instance
    this.coinwarsInstance = await this.props.coinWarContract.at(coinWarAddress)

    // get erc20 coins instances
    this.coin1 = await this.props.erc20Contract.at(coin1Address)
    this.coins.set(coin1Address, this.coin1)
    this.coin2 = await this.props.erc20Contract.at(coin2Address)
    this.coins.set(coin2Address, this.coin2)

    const coin1Event = await this.coin1.Transfer({}, { fromBlock, toBlock })
    coin1Event.watch(async (error, results) => {
      let _percentage = 0, _myBetPrice = 0, _myBetAmount = 0
      const coinWarBalance = await this.coin1.balanceOf(coinWarAddress)

      const { _from, _value, _to } = results.args
      if (_from === this.props.account && _to === coinWarAddress) {
        const _amt = _value.toNumber()
        if (_amt > 0) {
          _myBetPrice = new Big(_amt)
            .times(this.state.coin1_usd)
            .div(this.getMultFactorForCoin(coin1))

          _myBetAmount = new Big(_amt)
            .div(this.getMultFactorForCoin(coin1))

          _percentage = (_amt / coinWarBalance.toNumber()) * 100
        }
      }

      this.setState({
        netCoin1Bet: coinWarBalance.toNumber(),
        myToken1BetPrice: _myBetPrice,
        myToken1BetAmount: _myBetAmount,
        myToken1BetPercentage: _percentage.toFixed(2)
      })
      this.props.reload(coinWarBalance)
    })

    const coin2Event = await this.coin2.Transfer({}, { fromBlock, toBlock })
    coin2Event.watch(async (error, results) => {
      let _percentage = 0, _myBetPrice = 0, _myBetAmount = 0
      const coinWarBalance = await this.coin2.balanceOf(coinWarAddress)

      const { _from, _value, _to } = results.args
      if (_from === this.props.account && _to === coinWarAddress) {
        const _amt = _value.toNumber()
        if (_amt > 0) {
          _myBetPrice = new Big(_amt)
            .times(this.state.coin2_usd)
            .div(this.getMultFactorForCoin(coin2))

          _myBetAmount = new Big(_amt)
            .div(this.getMultFactorForCoin(coin2))

          _percentage = (_amt / coinWarBalance.toNumber()) * 100
        }
      }

      this.setState({
        netCoin2Bet: coinWarBalance.toNumber(),
        myToken2BetPrice: _myBetPrice,
        myToken2BetAmount: _myBetAmount,
        myToken2BetPercentage: _percentage.toFixed(2)
      })
      this.props.reload(coinWarBalance)
    })

    // get price from coinmarketcap after every 60 seconds
    this.props.setInterval(this.getCoinsPrice, API_REFRESH_RATE)
  }

  getBlock = async () => {
    const averageBlockTime = await this.getBlockAverageTime()

    // get latest block event
    const blockTracker = new BlockTracker({ provider: this.props.provider })
    blockTracker.on('block', (newBlock) => {
      this.getTime(hexToDec(newBlock.number), averageBlockTime)
    })
    blockTracker.start()
  }

  componentWillUnmount() {
    this.props.clearInterval(this.getCoinsPrice)
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
    const { coin, coinSelected, bid } = this.state
    const _coin = this.coins.get(coin)
    if (_coin) {
      const _bid = new Big(parseFloat(bid))
      const _amount = _bid
        .times(this.getMultFactorForCoin(coinSelected))
        .toFixed(this.getDecimalsInCoin(coinSelected))
      console.log(`Bet ${_amount} placed for ${coinSelected}`)

      const bet = await _coin.transfer(coinWarAddress, _amount,
        { from: `${this.props.account}`, gas: 5000000 })
      console.log('Transfer initialiated', bet)
      this.setState({ coin: false, bid: 0 })
    } else {
      console.log('no coin found ...')
    }
  }

  // get normalized bet amount
  getNormalizedBetAmount = (coin, bet_amount) => {
    const _bet = new Big(bet_amount)
    const bet = _bet
      .div(this.getMultFactorForCoin(coin))
      .toFixed(this.getDecimalsInCoin(coin))
    return bet
  }

  overtake = async (coin) => {
    const { coin1, coin2 } = this.props.opponents
    const { netCoin1Bet, netCoin2Bet, coin1_usd, coin2_usd } = this.state

    const coin1_bet_price = new Big(this.getNumberOfTokensBetPrice(coin1, netCoin1Bet, coin1_usd))
    const coin2_bet_price = new Big(this.getNumberOfTokensBetPrice(coin2, netCoin2Bet, coin2_usd))

    let overtakeAmount = 0

    if (coin === coin1) {
      if (coin2_bet_price.gt(coin1_bet_price)) {
        let c2_price = new Big(coin2_bet_price)
        overtakeAmount = c2_price
          .plus(coin2_usd)
          .div(coin1_usd)
          .minus(this.getNormalizedBetAmount(coin, netCoin1Bet))
          .toFixed(this.getDecimalsInCoin(coin))
        console.log(`You can overtake ${coin2} by `, overtakeAmount)
      } else {
        console.log(`You cannot overtake ${coin2} as its price is less or equal to ${coin1}`)
      }
    } else if (coin === coin2) {
      if (coin1_bet_price.gt(coin2_bet_price)) {
        let c1_price = new Big(coin1_bet_price)
        overtakeAmount = c1_price
          .plus(coin1_usd)
          .div(coin2_usd)
          .minus(this.getNormalizedBetAmount(coin, netCoin2Bet))
          .toFixed(this.getDecimalsInCoin(coin))
        console.log(`You can overtake ${coin1} by `, overtakeAmount)
      } else {
        console.log(`You cannot overtake ${coin1} as its price is less or equal to ${coin2}`)
      }
    }

    this.setState({ bid: overtakeAmount })
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
    const { coin, bid, coinSelected } = this.state
    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <div className="form-group">
          <ButtonGroup className="flex_btn_group">
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
            onClick={this.overtake.bind(this, coinSelected)}>Overtake</Button>
        </div>
        <div className="form-group">
          <input type="number" className="form-control" name="amount"
            value={bid}
            onChange={(e) => {
              this.setState({
                bid: e.target.value
              })
            }}
            disabled={!coin}
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
      .div(this.getMultFactorForCoin(coin))
      .toFixed(this.getDecimals(_coin))
    return y
  }

  // get number of tokens bet (amount)
  getNumberOfTokensBet = (coin, bet_amount) => {
    if (!bet_amount) bet_amount = 0
    let _coin = TokenDecimals[coin.toLowerCase()]
    let x = new Big(bet_amount)
    let y = x
      .div(this.getMultFactorForCoin(coin))
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

  getMaxProgressPrice = (coin1_bet_price, coin2_bet_price, max_progress_price) => {
    let new_max_progress_price = max_progress_price
    let price = Math.max(coin1_bet_price, coin2_bet_price)
    if (price > max_progress_price) {
      let factor = price / max_progress_price
      new_max_progress_price = new_max_progress_price * (factor)
    }
    return new_max_progress_price
  }

  getTime = (currentBlock, avgTime) => {
    const { fromBlock, toBlock } = this.props.opponents
    if (currentBlock < fromBlock) {
      let _startTime = avgTime * (fromBlock - currentBlock)
      let _formattedTime = moment.duration(_startTime, "seconds").format('h:mm:ss')
      this.setState({ startTime: `${_formattedTime} To Begin!`, block: currentBlock })
    } else if (currentBlock >= fromBlock && currentBlock <= toBlock) {
      let _startTime = avgTime * (toBlock - currentBlock)
      let _formattedTime = moment.duration(_startTime, "seconds").format('h:mm:ss')
      this.setState({ startTime: `${_formattedTime} Remaining!`, block: currentBlock })
    } else if (currentBlock > toBlock) {
      this.setState({ startTime: `Game Over`, block: currentBlock })
    }
  }

  getDisplayAmount = (amount, decimal = 2, isCurrency = false) => {
    const amt = new Big(amount)
      .toFixed(decimal)
      .toString()
      .replace(/^0+(\d)|(\d)0+$/gm, '$1$2')

    if (isCurrency) return `$ ${amt}`
    return amt
  }

  togglePrice = () => {
    const { togglePrice } = this.state
    this.setState({ togglePrice: !this.state.togglePrice })
  }

  render() {
    const { coin1, coin2, toBlock } = this.props.opponents
    const { netCoin1Bet, netCoin2Bet, coin1_usd,
      coin2_usd, startTime, block, myToken1BetPrice, myToken2BetPrice,
      myToken1BetPercentage, myToken2BetPercentage, togglePrice,
      myToken1BetAmount, myToken2BetAmount } = this.state

    const coin1_bet_amount = this.getNumberOfTokensBet(coin1, netCoin1Bet)
    const coin2_bet_amount = this.getNumberOfTokensBet(coin2, netCoin2Bet)

    const coin1_bet_price = this.getNumberOfTokensBetPrice(coin1, netCoin1Bet, coin1_usd)
    const coin2_bet_price = this.getNumberOfTokensBetPrice(coin2, netCoin2Bet, coin2_usd)

    let _maxProgressPrice
    if (this.MAX_PROGRESS_PRICE === 0) {
      _maxProgressPrice = Math.max(coin1_bet_price, coin2_bet_price)
      this.MAX_PROGRESS_PRICE = _maxProgressPrice
    } else {
      _maxProgressPrice = this.getMaxProgressPrice(
        coin1_bet_price,
        coin2_bet_price,
        this.MAX_PROGRESS_PRICE
      )
    }

    const coin1Progress = parseFloat((coin1_bet_price / _maxProgressPrice) * 100)
    const coin2Progress = parseFloat((coin2_bet_price / _maxProgressPrice) * 100)

    return (
      <div>
        <Row className="show-grid">
          <Col xs={2} md={2}>
            <div className="coin" style={{ marginTop: 130 }}>
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
            <div style={{ fontFamily: 'Open Sans', textAlign: 'center', fontSize: 30, fontWeight:'bold' }}>
              <span>{`${coin1} vs ${coin2}`}</span>
            </div>
            <div onClick={this.togglePrice.bind(this)}>
              <div className="time_notif">
                {startTime !== 0 ? `${startTime}` : null}
              </div>
              <div className="progress_wrap">
                <div style={{ marginTop: 15, textAlign: 'left' }}>
                  <LinkWithTooltip tooltip={`${this.getDisplayAmount(myToken1BetPercentage)}%`} href="#" id="tooltip-1">
                    {this.getDisplayAmount(
                      togglePrice ? myToken1BetAmount : myToken1BetPrice,
                      2, togglePrice ? false : true
                    )}
                  </LinkWithTooltip>{togglePrice && ` ${coin1}`}
                </div>
                <div style={{ marginTop: -18, textAlign: 'right' }}>
                  <span className="balance">
                    {this.getDisplayAmount(
                      togglePrice ? coin1_bet_amount : coin1_bet_price,
                      2, togglePrice ? false : true
                    )}
                  </span> <span>{coin1}</span>
                  <ProgressBar striped bsStyle="info" active now={coin1Progress} />
                </div>
              </div>
              <div className="progress_wrap bottom">
                <div style={{ textAlign: 'left', marginTop: 3 }}>
                  <LinkWithTooltip tooltip={`${this.getDisplayAmount(myToken2BetPercentage)}%`} href="#" id="tooltip-2">
                    {this.getDisplayAmount(
                      togglePrice ?  myToken2BetAmount : myToken2BetPrice,
                      2, togglePrice ? false : true
                    )}
                  </LinkWithTooltip>{togglePrice && ` ${coin2}`}
                </div>
                <div style={{ marginTop: -18, textAlign: 'right' }}>
                  <span className="balance">
                    {this.getDisplayAmount(
                      togglePrice ? coin2_bet_amount : coin2_bet_price,
                      2, togglePrice ? false : true
                    )}
                  </span> <span>{coin2}</span>
                  <ProgressBar striped bsStyle="success" active now={coin2Progress} />
                </div>
              </div>
            </div>
          </Col>
          <Col xs={4} md={4}>
            <div style={{ paddingLeft: 20, paddingRight: 20, marginTop: 120 }}>
              {this.placeBid()}
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

export default ReactTimeout(WarStage)
