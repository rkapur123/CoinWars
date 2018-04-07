import React, { Component } from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'
import './App.css'

// main components
import Home from './Home'
import Account from './Account'
import Faq from './Faq'

class App extends Component {

  render() {
    return (
      <div className="App">
        {/*
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to COIN WARS</h1>
        </header>
        */}

        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="container">
            <div className="navbar-header">
              <NavLink to="/" className="navbar-brand">CryptoGamez</NavLink>
            </div>
            <ul className="nav navbar-nav navbar-right">
              <li>
                <NavLink to="/" className="game">Home</NavLink>
              </li>
              <li>
                <NavLink to="/account">Account</NavLink>
              </li>
              <li>
                <NavLink to="/faq">Faq</NavLink>
              </li>
            </ul>
          </div>
        </nav>

        <main>
          <Switch>
            <Route exact path='/' component={Home}/>
            <Route path='/account' component={Account}/>
            <Route path='/faq' component={Faq}/>
          </Switch>
        </main>
      </div>
    );
  }
}

export default App;
