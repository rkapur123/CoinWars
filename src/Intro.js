import React from 'react'
import { Grid, Row, Col } from 'react-bootstrap'
import step_1 from './resources/step_1.png'
import step_2 from './resources/step_2.png'
import step_3 from './resources/step_3.png'

const Intro = () => (
  <div className="intro">
    <Grid>
      <Row>
        <Col xs={4} md={4} lg={4}>
          <div style={{ minHeight: 100, paddingTop: 60 }}>
            <img style={{ maxWidth: '100%' }} src={step_1} alt="step 1" />
          </div>
          <div style={{paddingTop:80}}>
            <p className="numberFont">1.</p>
            <p className="instructionFont">Choose your token</p>
          </div>
        </Col>
        <Col xs={4} md={4} lg={4}>
          <div style={{ minHeight: 100, paddingTop: 60 }}>
            <img style={{ maxWidth: '100%' }} src={step_2} alt="step 2"/>
          </div>
          <div style={{paddingTop:60}}>
            <p className="numberFont">2.</p>
            <p className="instructionFont">Race to Raise the Most Capital</p>
          </div>
        </Col>
        <Col xs={3} md={3} lg={3}>
          <div style={{ minHeight: 10, paddingTop: 20 }}>
            <img style={{ maxWidth: '100%' }} src={step_3} alt="step 3"  />
          </div>
          <div style={{paddingTop:20}}>
            <p className="numberFont">3.</p>
            <p className="instructionFont">Winner Takes All</p>
          </div>
        </Col>
      </Row>
    </Grid>
  </div>
);

export default Intro
