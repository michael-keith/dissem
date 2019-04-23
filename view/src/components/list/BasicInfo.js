import React, { Component } from 'react'

import Spark from '../charts/sparks/Spark'
import Barchart from '../charts/Barchart/Barchart'

class BasicInfo extends Component {

  constructor() {
    super()
    this.state = {
      loading: true,
      daily_sparkline_data: false,
      total_tweets: false
    }
  }

  componentDidMount() {
    fetch("http://localhost:3001/basic_info/sparkline/daily")
    .then(response => response.json() )
    .then(data => {
      this.setState({ daily_total_data: data, loading: false })
    })
    .catch(e => console.log(e))

    fetch("http://localhost:3001/basic_info/total")
    .then(response => response.json() )
    .then(data => {
      this.setState({ total_tweets: data, loading: false })
    })
    .catch(e => console.log(e))
  }

  renderSparkline() {
    if(!this.state.loading) {
      return <div className="Total">
        <Spark id={'totals_spark'} className="sparkline_total" data={this.state.daily_total_data} time_range={"daily"} height={80} source="Total"/>
      </div>
    }
    else {return "LOADING..."}
  }

  render() {
    return (
      <div>
        <div className="section">
          <h2>Total tweets:</h2>
          <p className="sub_title">{this.state.total_tweets ? this.state.total_tweets[0].total.toLocaleString() + " tweets by " + this.state.total_tweets[0].users.toLocaleString() : ""} unique users</p>
          { this.renderSparkline() }
        </div>
      </div>
    )
  }

}

export default BasicInfo
