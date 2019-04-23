import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link } from "react-router-dom"

import './App.css'

import Index from './pages/Index'

class App extends Component {
  render() {
    return (
      <Router>
        <Route exact path="/" component={Index} />
      </Router>
    )
  }
}

export default App;
