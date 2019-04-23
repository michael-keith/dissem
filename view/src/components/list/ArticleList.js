import React, { Component } from 'react'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import './ArticleList.css'
import Spark from '../charts/sparks/Spark'

import Loading from '../loading/Loading'

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
    fetch("http://localhost:3001/list/daily")
    .then(response => response.json() )
    .then(data => {
      this.setState({ data: data, loading: false })
    })
    .catch(e => console.log(e))
  }

  changeData(time_range) {
    if(time_range != this.state.time_range) {
      this.setState({data: '', loading: true})
      fetch("http://localhost:3001/list/" + time_range)
      .then(response => response.json() )
      .then(data => {
        this.setState({ data: data, loading: false, time_range: time_range })
      })
      .catch(e => console.log(e))
    }
  }

  renderItems() {
    if(!this.state.loading) {
      return this.state.data.map( (item, index) => {
        return <div key={index} >
          <div className={'item ' + item.source}>
            <span className={"badge " + item.source}>{item.source}</span>
            <a className="item_title" href={item.link}>{item.title ? item.title : item.link}</a>
            <p className="item_sub">{item.date}</p>
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
      <div id="article_list" class="section">
        <h2>Most popular articles: {this.state.time_range}</h2>
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
        { this.renderItems() }
      </div>
    )
  }

}

export default ArticleList
