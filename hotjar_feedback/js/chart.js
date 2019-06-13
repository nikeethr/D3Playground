// load timeseries files
// timeseries
// var dataFiles = ["radar_daily.csv", "radar_weekly.csv", "wind_daily.csv", "wind_weekly.csv"]
var dataFiles = [
    "timeseries/dew_point_daily.csv",
    "timeseries/fire_danger_daily.csv",
    "timeseries/dew_point_weekly.csv",
    "timeseries/fire_danger_weekly.csv",
  ]

var promises = []
var parseTime = d3.timeParse("%Y-%m-%d")
var svg = d3.select('#chart').append('svg')

function drawLine(data, gC, color, xLab, yLab, xMap, yMap) {
  var g = gC.append('g');

  var line = d3.line()
    .x(d => xMap(d[xLab]))
    .y(d => yMap(d[yLab]));

  g.append('path')
    .datum(data)
    .style("fill", "none")
    .style("stroke", color)
    .style("stroke-linejoin", "round")
    .style("stroke-linecap", "round")
    .style('stroke-width', 2)
    .attr("d", line);

  g.selectAll('.circle')
    .data(data)
    .enter().append('circle')
    .attr('cx', d => xMap(d[xLab]))
    .attr('cy', d => yMap(d[yLab]))
    .attr('r', 2)
    .style('fill', 'white')
    .style('stroke', color)
    .style('stroke-width', 2)
}

function plotTimeSeries(data) {
  radar_data = data[0]
  wind_data = data[1]
  radar_data_weekly = data[2]
  wind_data_weekly = data[3]

  var g = svg.append('g')
  var gTS = g.append('g')

  axisWidth = 1200
  yOffset = 200

  gTS.append('rect')
    .attr('x', 0)
    .attr('y', -20)
    .attr('width', 10)
    .attr('height', 8)
    .style('fill', 'steelblue')
    .style('shape-rendering', 'crispEdges')

  gTS.append('text')
    .attr('x', 12)
    .attr('y', -19)
    .style('fill', 'steelblue')
    .text('Dew point')

  var bbox = gTS.node().getBBox()

  gTS.append('rect')
    .attr('x', bbox.x + bbox.width + 4)
    .attr('y', -20)
    .attr('width', 10)
    .attr('height', 8)
    .style('fill', 'darkorange')
    .style('shape-rendering', 'crispEdges')

  gTS.append('text')
    .attr('x', bbox.x + bbox.width + 16)
    .attr('y', -19)
    .style('fill', 'darkorange')
    .text('Fire Danger')

  // TODO: min max based on both radar_data and wind_data
  var xMap = d3.scaleTime()
    .domain([d3.min(radar_data, d => d['Date']), d3.max(radar_data, d => d['Date'])])
    .rangeRound([0, axisWidth])

  interval = 7 //days
  dateStart = radar_data[0]['Date']
  dateEnd = radar_data[radar_data.length-1]['Date']

  var tickValues = d3.timeDay.range(dateStart, dateEnd, interval)
  var tickWidth = xMap(tickValues[1]) - xMap(tickValues[0])

  var xAxis = d3.axisBottom(xMap)
    .tickValues(tickValues)
    .tickFormat(d3.timeFormat("%d-%m-%y"))
    .tickSizeOuter(0)

  // TODO: min max based on both radar_data and wind_data
  var yMap = d3.scaleLinear()
    .domain([0, d3.max([d3.max(wind_data, d => d['Comments']), d3.max(radar_data, d => d['Comments'])])])
    .rangeRound([yOffset, 0]);

  var yAxis = d3.axisLeft(yMap)
    .tickSize(-axisWidth)
    .tickSizeOuter(0)
    .tickFormat(d3.format('.0s'))
    .ticks(3)

  // draw timeseries

  drawLine(radar_data, gTS, 'steelblue', 'Date', 'Comments', xMap, yMap);
  drawLine(wind_data, gTS, 'darkorange', 'Date', 'Comments', xMap, yMap);

  // draw axis

  var gXAxis = gTS.append('g')
    .attr('transform', 'translate(' + [0, yOffset] + ')')
    .call(xAxis)

  var gYAxis = gTS.append('g')
    .call(yAxis)

  gYAxis.selectAll('.tick:not(:first-of-type) line')
    .style('stroke-dasharray', '2,2')
    .style('stroke', '#777')

  // Comment distribution

  // TODO: use bbox to get relative position
  var gC = g.append('g')
    .attr('transform', d => 'translate(' + [0, yOffset + 40] + ')')

  var gCRow = gC.selectAll('g').data(tickValues).enter()
    .append('g')
    .attr('transform', d => 'translate(' + [xMap(d), 0] + ')')

  barPad = 10

  gCRow.append('rect')
    .attr('x', barPad / 2)
    .attr('width', tickWidth - barPad)
    .attr('height', 20)
    .style('fill', '#AAA')
    .style('stroke-width', '1')
    .style('stroke', 'white')
    .style('shape-rendering', 'crispEdges')

  // TODO: use stacked bar if we want more than for example wind...

  getRow = (date, data) => {
    return data.find((x) => {
      return x['Date'].getTime() === date.getTime()
    })
  }

  getBarWidth = (date, data) => {
    const total = getRow(date, data)['Total']
    const comments = getRow(date, data)['Comments']
    return (tickWidth - barPad) / total * comments
  }

  gCRow.append('rect')
    .attr('x', barPad / 2)
    .attr('width', (d) => getBarWidth(d, radar_data_weekly))
    .attr('height', 20)
    .style('fill', 'steelblue')
    .style('stroke-width', '1')
    .style('stroke', 'white')
    .style('shape-rendering', 'crispEdges')

  gCRow.append('rect')
    .attr('x', (d) => getBarWidth(d, radar_data_weekly) + barPad/2)
    .attr('width', (d) => getBarWidth(d, wind_data_weekly))
    .attr('height', 20)
    .style('fill', 'darkorange')
    .style('stroke-width', '1')
    .style('stroke', 'white')
    .style('shape-rendering', 'crispEdges')

  gCRow.append('text')
    .attr('y', 25)
    .attr('x', barPad / 2)
    .style('fill', 'steelblue')
    .style('text-anchor', 'left')
    .text(d => {
      comments = getRow(d, radar_data_weekly)['Comments']
      total = getRow(d, radar_data_weekly)['Total']
      pct = comments / total * 100
      return comments + ' | ' + pct.toFixed(1) + '%'
    })

  gCRow.append('text')
    .attr('y', 40)
    .attr('x', barPad / 2)
    .style('fill', 'darkorange')
    .style('text-anchor', 'left')
    .text(d => {
      comments = getRow(d, wind_data_weekly)['Comments']
      total = getRow(d, wind_data_weekly)['Total']
      pct = comments / total * 100
      return comments + ' | ' + pct.toFixed(1) + '%'
    })

  gCRow.append('text')
    .attr('y', 55)
    .attr('x', barPad / 2)
    .style('fill', 'black')
    .style('text-anchor', 'left')
    .text(d => getRow(d, radar_data_weekly)['Total'])

  // Ratings
  maxRating = 5
  barHeight = 15
  barWidth = 25

  offset = gCRow.node().getBBox().height + gCRow.node().getBBox().y + 20

  var gRating = gCRow.append('g')
    .attr('transform', 'translate(' + [0, offset] + ')')

  var splitNumber = (x) => {
    f = Math.floor(x)
    r = x - f
    result = []

    if (!x) return []

    for (var i = 0; i < f; i++) {
      result.push(1)
    }
    result.push(r)
    return result
  }

  gRating.selectAll('.rectRadar').data((d) => {
    return [1,1,1,1,1]
  }).enter().append('rect')
    .attr('x', barPad / 2)
    .attr('y', (d,i) => i * barHeight)
    .attr('width', barWidth)
    .attr('height', barHeight - 4)
    .style('fill', 'none')
    .style('stroke-width', '1')
    .style('stroke', 'steelblue')
    .style('shape-rendering', 'crispEdges')

  gRating.selectAll('.rectRadar').data((d) => {
    return splitNumber(getRow(d, radar_data_weekly)['Rating'])
  }).enter().append('rect')
    .attr('x', barPad / 2)
    .attr('y', (d,i) => (maxRating - i - 1) * barHeight + (barHeight - 4) * (1-d))
    .attr('width', barWidth)
    .attr('height', d => (barHeight - 4) * d)
    .style('fill', 'steelblue')
    .style('shape-rendering', 'crispEdges')

  gRating.selectAll('.rectWind').data((d) => {
    return [1,1,1,1,1]
  }).enter().append('rect')
    .attr('x', barPad / 2 + barWidth + 4)
    .attr('y', (d,i) => i * barHeight)
    .attr('width', barWidth)
    .attr('height', barHeight - 4)
    .style('fill', 'none')
    .style('stroke-width', '1')
    .style('stroke', 'darkorange')
    .style('shape-rendering', 'crispEdges')

  gRating.selectAll('.rectWind').data((d) => {
    return splitNumber(getRow(d, wind_data_weekly)['Rating'])
  }).enter().append('rect')
    .attr('x', barPad / 2 + barWidth + 4)
    .attr('y', (d,i) => (maxRating - i - 1) * barHeight + (barHeight - 4) * (1-d))
    .attr('width', barWidth)
    .attr('height', d => (barHeight - 4) * d)
    .style('fill', 'darkorange')
    .style('shape-rendering', 'crispEdges')

  var textOffset = gRating.node().getBBox().y + gRating.node().getBBox().height + 5

  gRating.append('text')
    .attr('y', textOffset)
    .attr('x', barPad / 2 + barWidth / 2)
    .style('text-anchor', 'middle')
    .style('fill', 'steelblue')
    .text(d => getRow(d, radar_data_weekly)['Rating'].toFixed(1))

  gRating.append('text')
    .attr('y', textOffset)
    .attr('x', barPad / 2 + barWidth / 2 + barWidth + 4)
    .style('text-anchor', 'middle')
    .style('fill', 'darkorange')
    .text(d => getRow(d, wind_data_weekly)['Rating'].toFixed(1))

  gC.append('text')
    .attr('x', -4)
    .attr('y', 2)
    .attr('class', 'row-header')
    .style('text-anchor', 'end')
    .style('font-weight', 600)
    .text('No. Comments')

  gC.append('text')
    .attr('x', -4)
    .attr('y', 23)
    .attr('class', 'row-header')
    .style('text-anchor', 'end')
    .text('Dew point | %')

  gC.append('text')
    .attr('x', -4)
    .attr('y', 38)
    .attr('class', 'row-header')
    .style('text-anchor', 'end')
    .text('Fire Danger | %')

  gC.append('text')
    .attr('x', -4)
    .attr('y', 54)
    .attr('class', 'row-header')
    .style('text-anchor', 'end')
    .text('Total')

  gC.append('text')
    .attr('x', -4)
    .attr('y', 85)
    .attr('class', 'row-header')
    .style('text-anchor', 'end')
    .style('font-weight', 600)
    .text('Ratings')

  gCRow.append('line')
    .attr('y1', -10)
    .attr('y2', 170)
    .attr('stroke', 'grey')
    .style('shape-rendering', 'crispEdges')

  var bbox = svg.node().getBBox()
  g.attr('transform', 'translate(' + [-bbox.x, -bbox.y] + ')')
  svg
    .attr('width', bbox.width)
    .attr('height', bbox.height)
}

Promise.all(dataFiles.map(x => d3.csv('/data/' + x, function(d) {
  function asNumber(x) { return x === '' ? NaN : +x }

  d['Date'] = parseTime(d['Date'] || d['Week'])
  d['Rating'] = asNumber(d['Rating'])
  d['Comments'] = asNumber(d['Comments'])
  d['% Total'] = asNumber(d['% Total'])
  d['Total'] = asNumber(d['Total'])
  return d
}))).then(function(data) {
  console.log(data)
  plotTimeSeries(data)
})
