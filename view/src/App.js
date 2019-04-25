import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link } from "react-router-dom"

import './App.css'

import Index from './pages/Index'

class App extends Component {

  render() {
    const base_url = process.env.PUBLIC_URL
    return (
      <Router>
        <Route exact path={base_url + "/"} component={Index} />
      </Router>
    )
  }
}

export default App;
