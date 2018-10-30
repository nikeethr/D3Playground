// -- GLOBAL --
var width = 800
var height = 600
var svg = d3.select('#chart').append('svg')
  .attr('width', width)
  .attr('height', height)
var gTable = svg.append('g')
var margin = {left:20, right:20, top:20, bottom:20}

// -- FUNCTION --

// helpers
const COLUMN_PADDING = 10 //px

const getNextColumnXStart = (gCurrent, padding = COLUMN_PADDING) =>
  gCurrent.node().getBBox().x + gCurrent.node().getBBox().width + padding

const getPreviousColumnXEnd = (gCurrent, padding = COLUMN_PADDING) =>
  gCurrent.node().getBBox().x - padding

const getBBox = (x) => x.node().getBBox()

const sentimentColourMap = (sentiment) => ({
  'positive':'#019875',
  'neutral': 'grey',
  'negative':'#D64541'
})[sentiment]

const ROW_HEIGHT = 20 //px
const TOTAL_COMMENTS = 4925
const AVG_SENTIMENT_SCORE = 0.85

var topicColourMap = {}

function initTopicColourMap(labels) {
  scale = d3.interpolateSpectral
  range = [...Array(labels.length).keys()].map(x => scale(1-(x+1)/(labels.length + 1)))
  topicColourMap = d3.scaleOrdinal()
    .domain(labels)
    .range(range)
}

function attachDefaultFont(text) {
  text.style('font-family', 'sans-serif')
    .style('font-size', '10px')
    .style('fill', 'black')
    .style('alignment-baseline', 'central')
}

function computeColourData(colours) {
  colourData = []
  colourData.push({
    offset: '0%',
    colour: colours[0]
  })

  if (colours.length == 1)
    return colourData

  interval = 100 / (colours.length - 1);

  for (var i = 1; i < colours.length; i++) {
    offset = i * interval
    colourData.push({
      offset: offset + '%',
      colour: colours[i]
    })
  }

  return colourData
}

function attachGradient(colours) {
  // remove existing gradient
  svg.select('linearGradient').remove()

  var gradient = svg.append('defs')
    .append('linearGradient')
      .attr('id', 'gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '100%')
      .attr('y2', '100%')
      .attr('spreadMethod', 'pad')

  colourData = computeColourData(colours)

  gradient.selectAll('stop')
    .data(colourData)
    .enter().append('stop')
      .attr('offset', d => d.offset) 
      .attr('stop-color', d => d.colour) 
      .attr('stop-opacity', 1);
}

// function
function drawHeader(g, header, x, y, anchor) {
  var h = g.append('text')
    .attr('x', x)
    .attr('y', y)
    .style('text-anchor', anchor)
    .style('font-weight', 600)
    .text(header)

  attachDefaultFont(h)
}

function drawTopicColumn(header, topics, rowHeight, xMid, yStart) {
  var gTopics = gTable.append('g')

  drawHeader(gTopics, header, xMid, yStart, 'middle')

  var rowText = gTopics.selectAll('.rowText')
    .data(topics)
    .enter().append('text')
      .attr('x', xMid)
      .attr('y', (d, i) => yStart + (i+1) * rowHeight)
      .style('text-anchor', 'middle')
      .text((d) => d)

  attachDefaultFont(rowText)

  // draw separating lines
  const LINE_PADDING = 5
  var bBox = getBBox(gTopics)
  var xNext = getNextColumnXStart(gTopics, LINE_PADDING)
  var xPrev = getPreviousColumnXEnd(gTopics, LINE_PADDING)
  var y1 = bBox.y
  var y2 = bBox.y + bBox.height

  lineData = [
    {x1: xPrev, y1: y1, x2: xPrev, y2: y2},
    {x1: xNext, y1: y1, x2: xNext, y2: y2}
  ]

  gTopics.selectAll('line')
    .data(lineData)
    .enter().append('line')
      .attr('x1', d => d.x1)
      .attr('y1', d => d.y1)
      .attr('x2', d => d.x2)
      .attr('y2', d => d.y2 + 5)
      .style('stroke', 'black')
      .style('shape-rendering', 'crispEdges')
}

function drawSentimentColumn(header, sentiment, rowHeight, xEnd, yStart) {
  attachGradient([
    sentimentColourMap('negative'),
    sentimentColourMap('neutral'),
    sentimentColourMap('positive')
  ])

  barHeight = rowHeight * .8
  barWidth = 100; //px

  sentimentMap = d3.scaleLinear()
    .domain([0, 1])
    .range([0, barWidth])

  gSentiment = gTable.append('g')

  drawHeader(gSentiment, header, xEnd, yStart, 'end')

  var gMeter = gSentiment.selectAll('g')
    .data(sentiment)
    .enter().append('g')
      .attr('transform', (d,i) => 'translate(' + [
        xEnd - barWidth,
        yStart + (i+1) * rowHeight
      ] + ')')

  gMeter.append('rect')
    .attr('y', -barHeight / 2)
    .attr('width', barWidth)
    .attr('height', barHeight)
    .style('fill', 'url(#gradient)')
    .style('shape-rendering', 'crispEdges')

  gMeter.append('line')
    .attr('x1', sentimentMap(AVG_SENTIMENT_SCORE))
    .attr('y1', -barHeight / 2)
    .attr('x2', sentimentMap(AVG_SENTIMENT_SCORE))
    .attr('y2', +barHeight / 2)
    .style('stroke', 'white')
    .style('shape-rendering', 'crispEdges')

  gMeter.append('circle')
    .attr('r', 2)
    .attr('cx', d => sentimentMap(d))
    .style('fill', 'white')

  gMeter.append('circle')
    .attr('r', 4)
    .attr('cx', d => sentimentMap(d))
    .style('fill', 'none')
    .style('stroke', 'white')
}

function drawCommentsBarColumn(header, barData, rowHeight, xStart, yStart) {
  barHeight = rowHeight * .8
  barWidth = 150

  xMap = d3.scaleLinear()
    .domain([0, d3.max(barData, d => d.count)])
    .range([0, barWidth])

  var axis = d3.axisBottom(xMap)
    .ticks(4)
    .tickSize(-barData.length * rowHeight + 4)
    .tickSizeOuter(0)

  gComments = gTable.append('g')

  var gAxis = gComments.append('g')
    .attr('transform', 'translate(' + [xStart, yStart + (barData.length + .5) * rowHeight] + ')')
    .call(axis)

  gAxis.selectAll('.tick line')
    .style('stroke', 'dimgrey')
    .style('shape-rendering', 'crispEdges')
    .style('stroke-dasharray', '1,1')
    .style('opacity', .3)

  gAxis.selectAll('.domain').remove()
  gAxis.selectAll('.tick text')
    .style('fill', 'dimgrey')

  drawHeader(gComments, header, xStart, yStart, 'start')
  
  var gBar = gComments.selectAll('.gBar')
    .data(barData)
    .enter().append('g')
      .attr('transform', (d,i) => 'translate(' + [
        xStart,
        yStart + (i+1) * rowHeight
      ] + ')')

  gBar.append('rect')
    .attr('y', -barHeight / 2)
    .attr('width', d => xMap(d.count))
    .attr('height', barHeight)
    .style('fill', d => topicColourMap(d.name))
    .style('shape-rendering', 'crispEdges')

  var text = gBar.append('text')
    .text(d => d.count + ' | ' + (100 * d.count / TOTAL_COMMENTS).toFixed(1) + '%')
  
  attachDefaultFont(text)
  
  text
    .attr('x', function(d) {
      padding = 4
      if (this.getBBox().width + padding > xMap(d.count)) {
        return xMap(d.count) + padding / 2
      }
      return xMap(d.count) - padding / 2
    }).style('text-anchor', function(d) {
      if (this.getBBox().width + padding > xMap(d.count)) {
        return 'start'
      }
      return 'end'
    })
    .style('fill', function(d) {
      if (this.getBBox().width + padding > xMap(d.count)) {
        return 'dimgrey'
      }
      return 'white'
    })
    .style('font-weight', 600)

  // note - for circle proportions - not useful in this case
  // var path = d3.arc()
  //   .innerRadius(0)
  //   .outerRadius(barHeight / 2)
  //   .startAngle(0)
  //   .endAngle(d => 2 * Math.PI / TOTAL_COMMENTS * d.count)

  // gBar.append('circle')
  //   .attr('r', barHeight / 2)
  //   .attr('cx', d => xMap(d.count) + barHeight / 2 + 4)
  //   .style('stroke', d => topicColourMap(d.name))
  //   .style('stroke-width', 1.5)
  //   .style('fill', 'none')

  // gBar.append('g').append('path')
  //   .attr('d', path)
  //   .attr('transform', d => 'translate(' + [xMap(d.count) + barHeight / 2 + 4, 0] + ')')
  //   .style('fill', d => topicColourMap(d.name))

  var axisFirst = d3.axisBottom(xMap)
    .ticks(4)
    .tickSize(-barData.length * rowHeight + 4)
    .tickSizeOuter(0)
    .tickFormat('')

  var gAxisFirst = gComments.append('g')
    .attr('transform', 'translate(' + [xStart, yStart + (barData.length + .5) * rowHeight] + ')')
    .call(axisFirst)

  gAxisFirst.selectAll('.tick line')
    .style('stroke', 'none')

  gAxisFirst.selectAll('.tick:first-of-type line')
    .style('shape-rendering', 'crispEdges')
    .style('stroke-dasharray', '1,1')
    .style('stroke', 'dimgrey')

  gAxisFirst.selectAll('.domain').remove()
}

// -- MAIN -- 
d3.json('data/manual_cluster_segmentation.json', function(e, d) {
  if (e) throw e

  d.topics.sort((a, b) => b.count - a.count)
  console.log(d)

  initTopicColourMap(d.topics.map(x => x.name))
  
  drawTopicColumn(
    'Topic',
    d.topics.map(x => x.name),
    ROW_HEIGHT,
    width / 2,
    margin.top
  )

  xEnd = getPreviousColumnXEnd(gTable)

  xStart = drawSentimentColumn(
    'Sentiment Score',
    d.topics.map(x => x.sentiment_score),
    ROW_HEIGHT,
    xEnd,
    margin.top
  )

  xStart = getNextColumnXStart(gTable)

  drawCommentsBarColumn(
    'Comments',
    d.topics.map(x => ({ name: x.name, count: x.count})),
    ROW_HEIGHT,
    xStart,
    margin.top
  )
})
