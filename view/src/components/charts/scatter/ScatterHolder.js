import React, { Component } from 'react'

import Scatter from './Scatter.js'
import Loading from '../../loading/Loading'

const config =  require('../../../config.json')

class ScatterHolder extends Component {

  constructor(props) {
    super()
    this.state = {
      loading: true,
      data: false,
      time_range: 'daily'
    }
  }

  componentDidMount() {
    fetch(config.api_url + "scatter/daily")
    .then(response => response.json() )
    .then(data => {
      this.setState({ data: data, loading: false })
    })
    .catch(e => console.log(e))
  }

  changeData(time_range) {
    if(time_range !== this.state.time_range) {
      this.setState({data: '', loading: true})
      fetch(config.api_url + "scatter/" + time_range)
      .then(response => response.json() )
      .then(data => {
        this.setState({ data: data, loading: false, time_range: time_range })
      })
      .catch(e => console.log(e))
    }
  }

  render() {
    return <div id="scatter_holder" className="section">
      <h2>Top 100 articles posted {this.state.time_range === "daily" ? "today" : this.state.time_range === "hourly" ? "in the last hour" : "in the last week"}:</h2>
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <p className={this.state.time_range === 'weekly' ? 'nav-link active' : 'nav-link'} onClick={ (e) => this.changeData("weekly") }>Weekly</p>
        </li>
        <li className="nav-item">
          <p className={this.state.time_range === 'daily' ? 'nav-link active' : 'nav-link'} onClick={ (e) => this.changeData("daily") }>Daily</p>
        </li>
        <li className="nav-item">
          <p className={this.state.time_range === 'hourly' ? 'nav-link active' : 'nav-link'} onClick={ (e) => this.changeData("hourly") }>Hourly</p>
        </li>
      </ul>
      {!this.state.loading ? <Scatter id={"scatter"} data={this.state.data} time_range={this.state.time_range} /> : <Loading />}
    </div>
  }

}

export default ScatterHolder
