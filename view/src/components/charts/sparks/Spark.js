import React, { Component } from 'react'
import * as d3 from "d3";

import './Spark.css'

class Spark extends Component {

  static defaultProps = {
    height: 35
  }

  constructor() {
    super()
    this.state = {
    }

  }

  componentDidMount() {
    if(!this.props.width) { this.width = document.getElementById(this.props.id).clientWidth }
    this.drawChart()
  }

  updateChart() {

  }

  drawChart() {
    const data = this.props.data

    const margin = {top: 2, right: 25, bottom: 8, left: 3}
    let width = this.width - margin.left - margin.right
    let height = this.props.height

    const svg = d3.select("#" + this.props.id).append("svg")
    .attr("width", this.width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    //Time setup
    let time_format = "%Y-%m-%d %H"
    let offset = -24
    let display_format = "%H"
    let tick_num = 15
    if(this.props.time_range === "daily") { time_format = "%Y-%m-%d %H"; offset = -24; display_format = "%_I%p"; tick_num = 10}
    else if(this.props.time_range === "hourly") { time_format = "%Y-%m-%d %H:%M"; offset = -1; display_format = "%_H:%M"; tick_num = 5}
    else if(this.props.time_range === "weekly") { time_format = "%Y-%m-%d"; offset = -168; display_format = "%a"; tick_num = 5}

    let parseTime = d3.timeParse(time_format)
    let formatTime = d3.timeFormat(time_format)

    let min_date = formatTime( d3.timeHour.offset(new Date(), offset) )
    let max_date = formatTime( new Date() )
    // let min_date = formatTime( parseTime(data[0].df) )
    // let max_date = formatTime( parseTime(data[data.length-1].df) )

    //X axis
    const x = d3.scaleTime().range([margin.left, width])
    .domain([parseTime( min_date ), parseTime( max_date ) ])

    const xAxis = d3.axisBottom(x)
    .ticks(tick_num)
    .tickSize(5, 10)
    .tickSizeOuter(0)
    .tickFormat(d3.timeFormat(display_format))

    //Append x axis
    svg.append("g")
    .attr("class", "sparkline_axis")
    .attr("transform", "translate(0,"+ (height - margin.bottom) +")")
    .call(xAxis)
    .selectAll("text")
    .attr("y", 7)
    .attr("x", 7)

    //Get max y value
    let max = d3.max( data, (d) => d.total )

    //Y axis
    const y = d3.scaleLinear().range([height - margin.bottom, margin.top ])
    .domain([0, max])

    const yAxis = d3.axisLeft(y)
    .tickFormat(function(d){return d})

    //Line data paths
    let line_func = d3.line()
    .x(function (d) {return x( parseTime(d.df) ) })
    .y(function (d) {return y(d.total)})
    .curve(d3.curveBasis)

    let area_func = d3.area()
    .x(function(d) { return x( parseTime(d.df) ) })
    .y0(height - margin.bottom)
    .y1(function(d) { return y(d.total) })
    .curve(d3.curveBasis)

    let chart = svg.append('g')
    .attr('class', 'sparkline')

    chart.datum(data)
    .append("path")
    .attr("class", "area")
    .attr("d", area_func)

    chart.datum(data)
    .append("path")
    .attr("class", (d) => "line " + this.props.source)
    .attr("d", line_func)

  }

  render(){
    return <div id={this.props.id}></div>
  }
}

export default Spark
