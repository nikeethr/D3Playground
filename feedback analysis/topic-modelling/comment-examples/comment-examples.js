// GLOBAL
var widthBar = 400
var heightBar = 200
var svgBar = d3.select('#chart-bar').append('svg')
  .attr('width', widthBar)
  .attr('height', heightBar)
var marginBar = {top:50, left:100, bottom:30, right:20}

var widthEg = 700
var heightEg = 700
var svgEg = d3.select('#chart-eg').append('svg')
  .attr('width', widthEg)
  .attr('height', heightEg)
var marginEg = {top:30, left:100, bottom:40, right:20}

var topics
var topicColourMap
const current_topic = 'Data Cleaning'

// HELPERS

function initTopicColourMap(labels) {
  scale = d3.interpolateSpectral
  range = [...Array(labels.length).keys()].map(x => scale(1-(x+1)/(labels.length + 1)))
  topicColourMap = d3.scaleOrdinal()
    .domain(labels)
    .range(range)
}

function subtopicColourMap(topic, subTopics) {
  return  d3.scaleOrdinal(d3.schemeCategory10)
}

function attachDefaultFont(text) {
  text.style('font-family', 'sans-serif')
    .style('font-size', '10px')
    .style('fill', 'black')
}

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).filter(x => x != "").reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = parseFloat(text.attr("x")),
        y = parseFloat(text.attr("y")),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

// FUNCTION

function drawSubTopicBar(topicData) {
  var subTopicData = topicData.sub_topics

  subTopicData.sort((a, b) => b.count - a.count)

  var xMap = d3.scaleLinear()
    .domain([0, d3.max(subTopicData, d => d.count)])
    .rangeRound([marginBar.left, widthBar - marginBar.right])

  var yMap = d3.scaleBand()
    .domain(subTopicData.map(d => d.name))
    .rangeRound([marginBar.top, heightBar - marginBar.bottom])
    .padding(0.2)

  cmap = subtopicColourMap(topicData.name, subTopicData.map(d => d.name))

  var gBarChart = svgBar.append('g')
  var gBar = gBarChart.selectAll('.bar')
    .data(subTopicData)
    .enter().append('g')

  gBar.append('rect')
    .attr('x', xMap(0))
    .attr('y', d => yMap(d.name))
    .attr('width', d => xMap(d.count) - xMap(0))
    .attr('height', yMap.bandwidth())
    .style('fill', (d,i) => cmap(i))

  var xAxis = d3.axisBottom(xMap)
    .ticks(5)

  var gXAxis = gBarChart.append('g')
    .attr('transform', 'translate(' + [0, heightBar - marginBar.bottom] + ')')
    .call(xAxis)

  var yAxis = d3.axisLeft(yMap)
    .tickSize(0)

  var gYAxis = gBarChart.append('g')
    .attr('transform', 'translate(' + [marginBar.left, 0] + ')')
    .call(yAxis)

  gYAxis.select('.domain').remove()

  var header = gBarChart.append('text')
    .attr('x', marginBar.left)
    .attr('y', marginBar.top)
    .text(topicData.name)

  attachDefaultFont(header)
  header.style('font-weight', 600)

  var xLab = gBarChart.append('text')
    .attr('x', xMap(0) + (xMap(d3.max(subTopicData, d => d.count)) - xMap(0)) / 2)
    .attr('y', heightBar - marginBar.bottom + 25)
    .text('Comments')
    .style('text-anchor', 'middle')

  attachDefaultFont(xLab)
  xLab.style('font-weight', 600)
}

function drawExamples(topicData) {
  var subTopicData = topicData.sub_topics
  subTopicData.sort((a, b) => b.count - a.count)
  cmap = subtopicColourMap(topicData.name, subTopicData.map(d => d.name))

  padding = 28
  textWidth = widthEg - marginEg.left - marginEg.right
  headerPosY = 12
  yNext = marginEg.top + headerPosY

  var gEg = svgEg.append('g')

  var header = gEg.append('text')
    .attr('x', marginEg.left - 4)
    .attr('y', headerPosY)
    .text('Examples:')
  
  attachDefaultFont(header)

  header.style('font-weight', 600)

  for (var i = 0; i < subTopicData.length; i++) {
    var text = gEg.append('text')
      .attr('x', marginEg.left)
      .attr('y', yNext)
      .attr('dy', 0)
      .text(subTopicData[i].example)

    attachDefaultFont(text)

    text.style('font-size', 11)

    wrap(text, textWidth)

    bBox = text.node().getBBox()
    gEg.append('rect')
      .attr('x', marginEg.left - 4) 
      .attr('y', bBox.y - 4) 
      .attr('width', textWidth + 8)
      .attr('height', bBox.height + 8) 
      .style('fill', 'none')
      .style('stroke', cmap(i))
      .style('stroke-width', 2)
      .style('shape-rendering', 'crispEdges')

    var egLabRect = gEg.append('rect')
    var egLab = gEg.append('text')
      .attr('x', marginEg.left + 4)
      .attr('y', bBox.y - 3)
      .text(topicData.name + ': ' + subTopicData[i].name)

    attachDefaultFont(egLab)

    egLab
      .style('font-weight', 'bold')
      .style('fill', cmap(i))

    bBox = egLab.node().getBBox()

    egLabRect
      .attr('x', bBox.x - 1)
      .attr('y', bBox.y - 1)
      .attr('width', bBox.width + 2)
      .attr('height', bBox.height + 2)
      .style('fill', 'white')
      .style('stroke', cmap(i))
      .style('stroke-width', 1)
      .style('shape-rendering', 'crispEdges')

    bBox = gEg.node().getBBox()
    yNext = bBox.y + bBox.height + padding
  }
}

// MAIN
d3.json('../data/manual_cluster_segmentation.json', function(e, d) {
  if(e) throw e;
  d.topics.sort((a, b) => b.count - a.count)
  initTopicColourMap(d.topics.map(x => x.name))
  console.log(d.topics)
  var topics =  d.topics.map(x => x.name)
  var current_topic_data = d.topics.find(x => x.name == current_topic)
  drawSubTopicBar(current_topic_data)
  drawExamples(current_topic_data)
})
