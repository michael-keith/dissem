import React, { Component } from 'react'
import * as d3 from "d3";

import './Multiline.css'

class Timeline extends Component {

  static defaultProps = {
    id: "multiline",
    data: "",
    data_url: "",
    height: 0,
    width: 0
  }

  constructor() {
    super();
    this.state = {
      data: ""
    }

  }

  componentDidMount() {
    if(!this.props.width) { this.width = document.getElementById(this.props.id).clientWidth }
    this.drawChart()
  }

  drawChart() {
    const data = this.props.data

    const margin = {top: 5, right: 30, bottom: 15, left: 20}
    let width = this.width - margin.left - margin.right
    let height = 250

    const svg = d3.select("#" + this.props.id).append("svg")
    .attr("width", this.width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    //Time setup
    let time_format = "%Y-%m-%d %H"
    let offset = -24
    let display_format = "%H:%M"
    let tick_num = 15
    let grid_x_interval = 1
    if(this.props.time_range === "daily") { offset = -24; display_format = "%H:%M"; tick_num = 10; grid_x_interval = 1}
    else if(this.props.time_range === "hourly") { time_format = '%Y-%m-%d %H:%M'; offset = -1; display_format = "%H:%M"; tick_num = 10; grid_x_interval = 0.5}
    else if(this.props.time_range === "weekly") { time_format = '%Y-%m-%d'; offset = -168; display_format = "%a"; tick_num = 7; grid_x_interval = 24}

    let parseTime = d3.timeParse(time_format)
    let formatTime = d3.timeFormat(time_format)

    //let min_date = formatTime( d3.timeHour.offset(new Date(), offset) )
    let min_date = formatTime( parseTime(data["BBC"][0].df) )
    let max_date = formatTime( new Date().setMinutes(0) )
    if(this.props.time_range === "hourly") { max_date = formatTime( new Date() ) }

    //X axis
    const x = d3.scaleTime().range([margin.left, width])
    .domain([parseTime( min_date ), parseTime( max_date ) ])

    const xAxis = d3.axisBottom(x)
    .ticks(d3.timeHour.every(grid_x_interval))
    .tickSize(5, 0)
    .tickSizeOuter(0)
    .tickFormat(d3.timeFormat(display_format))

    //Append x axis
    svg.append("g")
    .attr("class", "timeline_axis")
    .attr("transform", "translate(0,"+ (height - margin.bottom) +")")
    .call(xAxis)

    //Get max y value
    let maxes = []
    for(let key in data) {
      let m = d3.max( data[key], (d) => {return d.total} )
      maxes.push(m)
    }
    let max = d3.max(maxes) * 1.1

    //Y axis
    const y = d3.scaleLinear().range([height - margin.bottom, margin.top ])
    .domain([0, max])

    const yAxis = d3.axisLeft(y)
    .tickFormat(function(d){return d})

    //Append y axis
    svg.append("g")
    .attr("class", "timeline_axis")
    .attr("transform", "translate(" + margin.left + ", 0)")
    .call(yAxis)

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

    //Line data paths
    let line_func = d3.line()
    .x(function (d) {return x( parseTime(d.df) )})
    .y(function (d) {return y(d.total)})
    .curve(d3.curveMonotoneX)

    let chart = svg.append('g')
    .attr('class', 'lineChart')

    for(let key in data) {
      chart.datum(data[key])
      .append("path")
      .attr("d", line_func)
      .attr("class", "multiline " + key)
    }

    svg.append("line")
    .attr("class", "scatter_tooltip_line")
    .attr("stroke-dasharray", ("3,3"))
    .attr("stroke", "#000")
    .attr("stroke-width", 2)

    //Mouseover div
    let tooltip = d3.select("#" + this.props.id)
    .append("div")
    .attr("class", "multiline_tooltip")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("opacity", 0)
    .style("top", margin.top + "px")

    let bisectDate = d3.bisector(function(d) { return d.df }).left

    //Mouse move function
    let mouseMove = () => {
      let time = formatTime( x.invert( d3.mouse(mouseArea.node())[0] + margin.left ) )

      tooltip.transition()
      .duration(50)
      .style("opacity", .9)

      svg.select(".scatter_tooltip_line")
      .attr("x1", x(parseTime(time)) )
      .attr("y1", margin.top )
      .attr("x2" , x(parseTime(time)) )
      .attr("y2", height - margin.bottom )
      .attr("stroke-width", 2)

      tooltip.html("")
      tooltip.append("p")
      .html(time)

      let items = []
      for(let key in data) {
        let i =  bisectDate(data[key], time, 1)
        if( data[key][i] ) {
          items.push({"source": data[key][i].source, "total": data[key][i].total })
        }
      }
      items = items.sort( (x,y) => d3.descending(x.total, y.total) )

      tooltip.selectAll()
      .data(items)
      .enter()
      .append("p")
      .html( (d) => d.source + ": " + d.total )
      .append("div")
      .attr("class", (d) => "multiline_circle " + d.source)

      let tooltip_x = x( parseTime(time))
      let tooltip_width = +tooltip.style('width').slice(0, -2)

      tooltip.style("left", tooltip_x + margin.left + 10  + "px")
      if( tooltip_x > (width - tooltip_width) ) {
        tooltip.style("left", tooltip_x + margin.left - tooltip_width - 10  + "px")
      }

    }

    let mouseOut = () => {
      tooltip.transition()
      .duration(100)
      .style("opacity", 0)

      svg.select(".scatter_tooltip_line").transition()
      .duration(50)
      .attr("stroke-width", 0)

    }

    let mouseArea = svg.append("rect")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    // .on("mouseover", function() { focus.style("display", null); })
    // .on("mouseout", function() { focus.style("display", "none"); })
    .on("mousemove", mouseMove)
    .on("mouseout", mouseOut)

  }

  render(){
      return <div id={this.props.id}></div>
  }
}

export default Timeline;
