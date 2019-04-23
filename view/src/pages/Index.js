import React, { Component } from 'react'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Navbar from '../components/navbar/Navbar'
import Timeline from '../components/charts/timeline/Timeline'
import MultilineHolder from '../components/charts/multiline/MultilineHolder'
import ScatterHolder from '../components/charts/scatter/ScatterHolder'
import BarchartHolder from '../components/charts/Barchart/BarchartHolder'

import BasicInfo from '../components/list/BasicInfo'
import ArticleList from '../components/list/ArticleList'

class Index extends React.Component {

  constructor() {
    super()
    this.state = {
      test: 0
    }
  }

  componentDidMount() {

  }

  render() {
    return (
      <div id="page">
        <Navbar />
        <Container fluid={true}>
          <Row>
            <Col md={3}>
              <BasicInfo />
              <BarchartHolder />
            </Col>
            <Col md={3}>
              <ArticleList />
            </Col>
            <Col md={6}>
              <ScatterHolder />
              <MultilineHolder id={"multiline"} data_url="http://localhost:3001/multiline/daily" />
            </Col>
          </Row>
          {/* <Row>
            <Col md={12}>
              <Timeline id={"timeline"} data_url="http://localhost:3001/timeline" test={this.state.test}/>
            </Col>
          </Row> */}
        </Container>
      </div>
    )
  }

}



export default Index
