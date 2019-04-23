import React, { Component } from 'react'
import * as d3 from "d3";

import './Scatter.css'

class Scatter extends Component {

  static defaultProps = {
    id: "scatter",
    data: "",
    data_url: "",
    height: 0,
    width: 0
  }

  constructor() {
    super();
    // this.state = {
    //   data: ""
    // }

  }

  componentDidMount() {
    if(!this.props.width) { this.width = document.getElementById(this.props.id).clientWidth }
    this.drawChart()
    // fetch(this.props.data_url)
    // .then(response => response.json() )
    // .then(data => this.setState({ data: data }) )
    // .then( () => this.drawChart() )
    // .catch(e => console.log(e))
  }

  drawChart() {
    const data = this.props.data

    const margin = {top: 5, right: 30, bottom: 15, left: 20}
    let circle_size = 7
    let width = this.width - margin.left - margin.right
    let height = 250

    const svg = d3.select("#" + this.props.id).html("")
    .append("svg")
    .attr("width", this.width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    //Time setup
    let time_format = "%Y-%m-%d %H:%M"
    let offset = -24
    let display_format = "%H:%M"
    let tick_num = 15
    let grid_x_interval = 1
    if(this.props.time_range == "daily") { offset = -24; display_format = "%H:%M"; tick_num = 10; grid_x_interval = 1}
    else if(this.props.time_range == "hourly") { offset = -1; display_format = "%H:%M"; tick_num = 10; grid_x_interval = 0.5}
    else if(this.props.time_range == "weekly") { offset = -168; display_format = "%a"; tick_num = 7; grid_x_interval = 12}

    let parseTime = d3.timeParse(time_format)
    let formatTime = d3.timeFormat(time_format)

    let min_date = formatTime( d3.timeHour.offset(new Date(), offset) )
    let max_date = formatTime( new Date().setMinutes(0) )
    if(this.props.time_range == "hourly") { max_date = formatTime( new Date() ) }

    //X axis
    const x = d3.scaleTime().range([margin.left, width])
    .domain([parseTime( min_date ), parseTime( max_date ) ])

    const xAxis = d3.axisBottom(x)
    .ticks( d3.timeHour.every(grid_x_interval) )
    .tickSize(5, 0)
    .tickSizeOuter(0)
    .tickFormat(d3.timeFormat(display_format))

    //Append x axis
    svg.append("g")
    .attr("class", "timeline_axis")
    .attr("transform", "translate(0,"+ (height - margin.bottom) +")")
    .call(xAxis)

    let max = d3.max(data, (d) => d.total ) * 1.2

    //Y axis
    const y = d3.scaleLinear().range([height - margin.bottom, margin.top ])
    .domain([0, max])

    const yAxis = d3.axisLeft(y)
    .tickFormat(function(d){return d})

    const make_x_gridlines = () => {
      return d3.axisBottom(x)
    }

    const make_y_gridlines = () => {
      return d3.axisLeft(y)
    }

    svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(0," + (height - margin.bottom)  + ")")
    .call(make_x_gridlines()
    .tickSize(-height + margin.bottom + margin.top)
    .tickSizeOuter(0)
    .tickFormat("")
    .ticks(d3.timeHour.every(grid_x_interval)))

    svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(" + margin.left + ",0)")
    .call(make_y_gridlines()
    .tickSize(-width + margin.left)
    .tickSizeOuter(0)
    .tickFormat(""))

    //Append y axis
    svg.append("g")
    .attr("class", "timeline_axis")
    .attr("transform", "translate(" + margin.left + ", 0)")
    .call(yAxis)

    //Tooltip
    let tooltip = d3.select("#" + this.props.id)
    .append("div")
    .attr("class", "scatter_tooltip")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("opacity", 0)

    let chart = svg.append('g')
    .attr('class', 'scatterChart')

    let circles = chart.selectAll()
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x( parseTime(d.df) ) )
    .attr("cy", (d) => y(d.total) )
    .attr("r", circle_size)
    .attr("class", (d) => "scatter_circle " + d.source)

    //Mouseover function
    circles.on("mouseover", function(d){
      tooltip.attr("class", "scatter_tooltip " + d.source)

      tooltip.transition()
      .duration(100)
      .style("opacity", .9);
      tooltip.html( d.source + ": " + d.title + "<br/>" +  d.total + "<br/>" + d.df )

      circles.transition()
      .duration(150)
      .style("opacity", 0.7)

      d3.select(this).transition()
      .duration(0)
      .style("opacity", 1)

      let tooltip_width = +tooltip.style('width').slice(0, -2)
      let tooltip_height = +tooltip.style('height').slice(0, -2)
      let tooltip_x = +d3.select(this).attr("cx") + margin.left
      let tooltip_y = +d3.select(this).attr("cy") - (tooltip_height/2)

      tooltip.style("left", (tooltip_x) + 10 + "px")
      .style("top", (tooltip_y) + "px")
      if( tooltip_x > (width - tooltip_width) ) {
        tooltip.style("left", tooltip_x - tooltip_width - 10 + "px")
      }

    })

    circles.on("mouseout", (d) => {
      tooltip.attr("class", "scatter_tooltip")

      tooltip.transition()
      .duration(100)
      .style("opacity", 0);

      circles.transition()
      .duration(300)
      .style("opacity", 1)
    })

  }

  render(){
    return <div id={this.props.id}></div>
  }
}

export default Scatter
