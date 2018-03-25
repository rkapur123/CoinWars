import React, {Component} from 'react'
import { Button, Row, Col, ButtonGroup } from 'react-bootstrap'

export default class WarStage extends Component {
  render() {
    const { coin1, coin2, toBlock, coin1Balance, coin2Balance } = this.props.opponents
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
              <span>$30000/{coin1Balance} {coin1}</span>
              <div className="progress">
                <div className="progress-bar progress-bar-striped" role="progressbar" style={{ width: '10%' }} aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
            </div>
            <div className="progress_wrap bottom">
              <span>$30000/{coin2Balance} {coin2}</span>
              <div className="progress">
                <div className="progress-bar progress-bar-striped" role="progressbar" style={{ width: '30%' }} aria-valuenow="30" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
            </div>
          </Col>
          <Col xs={4} md={4}>
            <form>
              <div className="form-group">
                <ButtonGroup>
                  <Button>{coin1}</Button>
                  <Button>{coin2}</Button>
                </ButtonGroup>
              </div>
              <div className="form-group">
                <button type="button" className="btn btn-block btn-info">Overtake</button>
              </div>
              <div className="form-group">
                <input type="number" className="form-control" id="validationDefault01" placeholder="bet amount e.g. 100" required />
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
