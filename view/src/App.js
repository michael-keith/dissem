import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link } from "react-router-dom"

import './App.css'
import Index from './pages/Index'
import Timeline from './pages/Timeline'

const config =  require('./config.json')

class App extends Component {

  render() {
    const base_url = process.env.PUBLIC_URL + config.root_path
    console.log(base_url)
    return (
      <Router>
        <Route exact path={base_url + "/"} component={Index} />
        <Route exact path={base_url + "/timeline"} component={Timeline} />
      </Router>
    )
  }
}

export default App;
