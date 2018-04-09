import React from 'react'

import Intro from './Intro'
import CoinItem from './CoinItem'
import arrow from './resources/arrow.png'

const Home = (props) => (
  <div>
    <p className="coinWar"> Coin Wars </p>
    <Intro />
    <p className="playNow"> Play Now </p>
    <div className="arrow bounce">
      <img src={arrow} alt="arrow"/>
    </div>
    <div className="war_wrap">
      <CoinItem {...props} />
    </div>
  </div>
)

export default Home
