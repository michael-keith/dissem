import React, { Component } from 'react'
import * as d3 from "d3"

import './Barchart.css'

class Timeline extends Component {

  static defaultProps = {
    id: "barchart",
    data: [],
    height: 350,
    width: 0
  }

  componentDidMount() {
    if(!this.props.width) { this.width = document.getElementById(this.props.id).clientWidth }
    this.drawChart()
  }

  drawChart() {
    const data = this.props.data
    const margin = {top: 0, right: 10, bottom: 20, left: 80};
    let width = this.width - margin.left - margin.right
    let height = this.props.height - margin.top - margin.bottom

    const svg = d3.select("#" + this.props.id).append("svg")
    .attr("width", this.width + margin.left + margin.right)
    .attr("height", this.props.height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.right + ")")

    const y = d3.scaleBand()
    .range([0, height])
    .domain(data.map((d) => d.source ))
    .padding(0.3)

    const x = d3.scaleLinear()
    .range([0, (width - margin.right) ])
    .domain([0, d3.max( data, (d) => d.total ) * 1.03 ])

    const xAxis = d3.axisBottom(x)
    .ticks(5)

    const yAxis = d3.axisLeft(y)

    svg.append('g')
    .attr('transform', 'translate(0,' + height+')')
    .call(xAxis)

    svg.append('g')
    .call(yAxis)

    const make_x_gridlines = () => {
      return d3.axisBottom(x)
    }

    const make_y_gridlines = () => {
      return d3.axisLeft(y)
    }

    svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(0," + (height)  +")")
    .call(make_x_gridlines()
    .tickSize(-height + margin.bottom + margin.top)
    .tickSizeOuter(0)
    .tickFormat(""))

    svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(0,0)")
    .call(make_y_gridlines()
    .tickSize(-width)
    .tickSizeOuter(0)
    .tickFormat(""))

    svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("y", (d,i) => y(d.source) )
    .attr("x", 0)
    .attr("width", (d,i) =>  x(d.total) )
    .attr("height", (d,i) => y.bandwidth() )
    .attr("class", (d) => "bar " + d.source)
  }

  render(){
    return <div id={this.props.id}></div>
  }
}

export default Timeline;
