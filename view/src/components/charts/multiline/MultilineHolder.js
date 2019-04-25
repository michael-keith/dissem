import React, { Component } from 'react'

import Multiline from './Multiline.js'
import Loading from '../../loading/Loading'

const config =  require('../../../config.json')

class MultilineHolder extends Component {

  constructor(props) {
    super()
    this.state = {
      loading: true,
      data: false,
      time_range: 'daily'
    }
  }

  componentDidMount() {
    fetch(config.api_url + "multiline/daily")
    .then(response => response.json() )
    .then(data => {
      this.setState({ data: data, loading: false })
    })
    .catch(e => console.log(e))
  }

  changeData(time_range) {
    if(time_range != this.state.time_range) {
      this.setState({data: '', loading: true})
      fetch(config.api_url + "multiline/" + time_range)
      .then(response => response.json() )
      .then(data => {
        this.setState({ data: data, loading: false, time_range: time_range })
      })
      .catch(e => console.log(e))
    }
  }

  render() {
    return <div id="multiline_holder" className="section">
      <h2>Totals tweets for each news organisation ({this.state.time_range}):</h2>
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <p className={this.state.time_range == 'weekly' ? 'nav-link active' : 'nav-link'} onClick={ (e) => this.changeData("weekly") }>Weekly</p>
        </li>
        <li className="nav-item">
          <p className={this.state.time_range == 'daily' ? 'nav-link active' : 'nav-link'} onClick={ (e) => this.changeData("daily") }>Daily</p>
        </li>
        <li className="nav-item">
          <p className={this.state.time_range == 'hourly' ? 'nav-link active' : 'nav-link'} onClick={ (e) => this.changeData("hourly") }>Hourly</p>
        </li>
      </ul>
      {!this.state.loading ? <Multiline id={"multiline"} data={this.state.data} time_range={this.state.time_range} /> : <Loading />}
    </div>
  }

}

export default MultilineHolder
