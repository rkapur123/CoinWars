import React, {Component} from 'react'
import {PanelGroup, Panel } from 'react-bootstrap'

export default class Home extends Component {

  constructor(props, context) {
    super(props, context);

    this.handleSelect = this.handleSelect.bind(this);

    this.state = {
      activeKey: '1'
    };
  }

  handleSelect(activeKey) {
    this.setState({ activeKey });
  }

  render() {
    return (
      <div className="intro">


        <h1 style={{paddingBottom:20}}> General Questions </h1>


        <PanelGroup
        accordion
        id="accordion-controlled-example"
        activeKey={this.state.activeKey}
        onSelect={this.handleSelect}
        >
          <Panel eventKey="1">
            <Panel.Heading>
              <Panel.Title toggle>What is CryptoGamez?</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible>CryptoGamez is a gaming portal built on the Ethereum Blockchain. Our games are 100% provably fair and publicly verifiable.</Panel.Body>
          </Panel>
          <Panel eventKey="2">
            <Panel.Heading>
              <Panel.Title toggle>What is Coin Wars?</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible>Coin Wars is an ERC20 racing game. Each Coin War features two tokens. The token to raise more capital within the time limit, wins the other teams tokens.</Panel.Body>
          </Panel>

          <Panel eventKey="3">
            <Panel.Heading>
              <Panel.Title toggle>How do I place a bet?</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible>
              <ol>
                <li>Install Metamask</li>
                <li>Send tokens to Metamask Address</li>
                <li>Submit your tokens to a CoinWar</li>
              </ol>

            </Panel.Body>
          </Panel>
          <Panel eventKey="4">
            <Panel.Heading>
              <Panel.Title toggle>Where do I deposit tokens?</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible>Deposit your tokens at your Metamask desired address. This will be the same address you can withdraw your winnings from.</Panel.Body>
          </Panel>

          <Panel eventKey="5">
            <Panel.Heading>
              <Panel.Title toggle>How are winners and loosers decided?</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible> The team that raises the most capital within the time limit wins. To better your odds at winning shill the CoinWar on your tokens Telegram.
            </Panel.Body>
          </Panel>
          <Panel eventKey="6">
            <Panel.Heading>
              <Panel.Title toggle>How much can I win?</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible>The winnings are divided proportionally based on the size of your bet. This proportion is calculated as such: (Your Bet) / (Total Bet on Token) .</Panel.Body>
          </Panel>

          <Panel eventKey="7">
            <Panel.Heading>
              <Panel.Title toggle>How can I withdraw my winnings?</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible>All Coin War results are lcoated in the Account page.</Panel.Body>
          </Panel>

          <Panel eventKey="8">
            <Panel.Heading>
              <Panel.Title toggle>How can I contact you?</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible> You can email us at hello@cryptogamez.io or message @rahul or @sunny directly on Discord.
            </Panel.Body>
          </Panel>
          <Panel eventKey="9">
            <Panel.Heading>
              <Panel.Title toggle>What are the transaction fees?</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible>Transaction fee of 5% is taken from the loosing team. </Panel.Body>
          </Panel>


        </PanelGroup>


      </div>
    )
  }
}
