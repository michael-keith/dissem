import React, { Component } from 'react'
import * as d3 from "d3";

import './Timeline.css'

class Timeline extends Component {

  static defaultProps = {
    id: "timeline_holder",
    data: "",
    data_url: "",
    height: 0,
    width: 0,
  }

  constructor() {
    super();
    this.state = {
      timeline_data: "",
      test: 0
    }

  }

  componentDidMount() {
    if(!this.props.width) { this.width = document.getElementById(this.props.id).clientWidth }

    fetch(this.props.data_url)
    .then(response => response.json() )
    .then(data => this.setState({ timeline_data: data }) )
    .then( () => this.drawChart() )
    .catch(e => console.log(e))
  }

  updateChart() {
  }

  drawChart() {
    let data = this.state.timeline_data

    const margin = {top: 40, right: 25, bottom: 20, left: 10}
    const line_margin = {top: 90, left: 120}
    let circle_size = 5
    let width = this.width - margin.left - margin.right
    let height = ( (data.length + 2) * line_margin.top ) - margin.top - margin.bottom

    const svg = d3.select("#" + this.props.id)
    .html("")
    .append("svg")
    .attr("width", this.width + margin.left + margin.right)
    .attr("height", ( (data.length + 2) * line_margin.top ) + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    //Time setup
    let time_format = "%Y-%m-%d %H:%M"
    let parseTime = d3.timeParse(time_format)
    let formatTime = d3.timeFormat(time_format)
    let min_date = formatTime( d3.timeHour.offset(new Date(), -24) )
    let max_date = formatTime( new Date() )

    //Axis
    const x = d3.scaleTime().range([line_margin.left, width])
    .domain([parseTime( min_date ), parseTime( max_date ) ])

    const xAxisTop = d3.axisTop(x)
    .ticks(d3.timeHour.every(1))
    .tickSize(5, 0)
    .tickSizeOuter(0)
    .tickFormat(d3.timeFormat("%H:%M"))

    const xAxisBottom = d3.axisBottom(x)
    .ticks(d3.timeHour.every(1))
    .tickSize(5, 0)
    .tickSizeOuter(0)
    .tickFormat(d3.timeFormat("%H:%M"))

    //Top Axis
    svg.append("g")
    .attr("class", "timeline_axis")
    .attr("transform", "translate(0,0)")
    .call(xAxisTop)

    //Bottom Axis
    svg.append("g")
    .attr("class", "timeline_axis")
    .attr("transform", "translate(0,"+ ( (data.length + 1) * line_margin.top ) +")")
    .call(xAxisBottom)

    //Parent node setup
    let lines = svg.selectAll()
    .data(data)
    .enter()
    .append("g")
    .attr( "index", (d,i) => i )  //Set parent index here so that it can be accessed from nested elements.

    //Line text
    lines.append("text")
    .text( (d,i)=> d.name )
    .attr("x", 0)
    .attr("y", (d,i) => ( (i + 1) * line_margin.top) )

    lines.append("text")
    .text( (d,i)=> d.articles.length + " articles" )
    .attr("x", 0)
    .attr("y", (d,i) => ( (i + 1) * line_margin.top) + 20 )

    //Line
    lines.append("line")
    .attr("class", "timeline_line")
    .attr("x1", line_margin.left)
    .attr("x2", width )
    .attr("y1", (d,i) => (i + 1) * line_margin.top )
    .attr("y2", (d,i) => (i + 1) * line_margin.top )

    //Article Circles
    let circles = lines.selectAll()
    .data( (d,i) => d.articles )
    .enter()
    .append("circle")
    .attr("class", (d,i) => x(parseTime(d.date)) <= line_margin.left ? "timeline_circle hide" : "timeline_circle" ) //Hide if outside x axis range
    .attr("cx", (d,i) => x(parseTime(d.date)) )
    .attr("cy", function(d, i) {
      if( d.date_pos > 10 ) { return ((+this.parentNode.getAttribute("index") + 1) * line_margin.top) }
      if( d.date_pos === 0 ) { return ((+this.parentNode.getAttribute("index") + 1) * line_margin.top) }
      else if( d.date_pos % 2 ) { return ((+this.parentNode.getAttribute("index") + 1) * line_margin.top) - ( Math.ceil(d.date_pos/2) * 10 ) }
      else { return ((+this.parentNode.getAttribute("index") + 1) * line_margin.top) + ( Math.floor(d.date_pos/2) * 10) }
    })
    .attr("r", circle_size)

    //Mouseover div
    let tooltip = d3.select("body").append("timeline_tooltip")
    .attr("class", "timeline_tooltip")
    .style("opacity", 0)

    circles.on("mouseover", function(d){
      tooltip.transition()
      .duration(100)
      .style("opacity", .9);
      tooltip.html( d.source + ": " + d.title + "<br/>" + d.date )
      .style("left", (d3.event.pageX + circle_size) + "px")
      .style("top", (d3.event.pageY - 28) + "px")

      circles.transition()
      .duration(150)
      .style("opacity", 0.3)

      d3.select(this).transition()
      .duration(0)
      .style("opacity", 1)
    })

    circles.on("mouseout", (d) => {
      tooltip.transition()
      .duration(100)
      .style("opacity", 0);

      circles.transition()
      .duration(300)
      .style("opacity", 1)
    })

  }

  render(){
    return <div id={this.props.id}>LOADING</div>
  }
}

export default Timeline;
