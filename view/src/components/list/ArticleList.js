import React, { Component } from 'react'

import './ArticleList.css'
import Spark from '../charts/sparks/Spark'

import Loading from '../loading/Loading'

const config =  require('../../config.json')

class ArticleList extends Component {

  constructor(props) {
    super()
    this.state = {
      loading: true,
      data: false,
      time_range: 'daily'
    }
  }

  componentDidMount() {
    fetch(config.api_url + "list/daily")
    .then(response => response.json() )
    .then(data => {
      this.setState({ data: data, loading: false })
    })
    .catch(e => console.log(e))
  }

  changeData(time_range) {
    if(time_range !== this.state.time_range) {
      this.setState({data: '', loading: true})
      fetch(config.api_url + "list/" + time_range)
      .then(response => response.json() )
      .then(data => {
        this.setState({ data: data, loading: false, time_range: time_range })
      })
      .catch(e => console.log(e))
    }
  }

  renderItems() {
    const date_options = {'hour': '2-digit', 'minute': '2-digit', weekday: 'long',year: 'numeric', month: 'long', day: 'numeric', hour12: false}
    if(!this.state.loading) {
      return this.state.data.map( (item, index) => {
        return <div key={index} >
          <div className={'item ' + item.source}>
            <span className={"badge " + item.source}>{item.source}</span>
            <a className="item_title" href={item.link}>{item.title ? item.title : item.link}</a>
            <p className="item_sub">{item.date ? new Date(item.date).toLocaleDateString("en-UK", date_options) : ""}</p>
            <p className="item_sub"><b>{item.total}</b> tweets from <b>{item.users}</b> {item.users > 1 ? "users" : "user"}</p>
            <Spark id={'list_spark_' + index} data={item.spark} time_range={this.state.time_range} source={item.source} />
          </div>
        </div>

      })
    }
    else {return <Loading />}
  }

  render() {
    return (
      <div id="article_list" className="section">
        <h2>Most tweeted articles {this.state.time_range === "daily" ? "in the last 24 hours" : this.state.time_range === "hourly" ? "in the last hour" : "in the last week"}:</h2>
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
        { this.renderItems() }
      </div>
    )
  }

}

export default ArticleList
