import React, { Component } from 'react'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Navbar from '../components/navbar/Navbar'
import Timeline from '../components/charts/timeline/Timeline'
import Loading from '../components/loading/Loading'

const config =  require('../config.json')

class Index extends React.Component {

  constructor() {
    super()
    this.state = {
      'timeline_data': false,
      'loading': false
    }
  }

  componentDidMount() {
    fetch(config.api_url + "timeline")
    .then(response => response.json() )
    .then(data => {
      this.setState({ timeline_data: data, loading: false })
    })
    .catch(e => console.log(e))
  }

  render() {
    return (
      <div id="page">
        <Navbar />
        <Container fluid={true}>
          <Row>
            <Col md={12}>
              {this.state.timeline_data ? <Timeline id={"timeline"} data={this.state.timeline_data}/> : <Loading />}
            </Col>
          </Row>
        </Container>
      </div>
    )
  }

}



export default Index
