// -- GLOBAL --

// TODO store it this way instead...
// tsne_data = {
//   svg:
//   width:
//   height:
// }

widthTSNE = 400
heightTSNE = 400
marginTSNE = {left:60, right:60, top:60, bottom:60}
var svgTSNE = d3.select('#chart-tsne').append('svg')
  .attr('width', widthTSNE)
  .attr('height', heightTSNE)

widthBar = 250
heightBar = 320
marginBar = {left:100, right:10, top:60, bottom:60}
var svgBar = d3.select('#chart-bar').append('svg')
  .attr('width', widthBar)
  .attr('height', heightBar)

sentiment = 'positive'
K = 14

commentMap = {
  0: 'really, like, functional',
  1: 'good work, thanks',
  2: 'new, useful',
  3: 'radar, zoom, speed',
  4: 'positive feedback',
  5: 'easy to use',
  6: 'readible, clean design',
  7: 'fantastic, navigation',
  8: 'weather, rain, wind',
  9: 'love',
  10: 'looks, feel, fast',
  11: 'informative',
  12: 'iPhone app',
  13: 'make an app!',
}

// -- FUNCTIONS --

function getColorScale(sentiment, domain) {
  var scale;

  switch(sentiment) {
    case 'positive':
      scale = d3.interpolateYlGnBu
      break
    case 'negative':
      scale = d3.interpolateYlOrRd
      break
    case 'neutral':
      scale = d3.interpolateGreys
      break
    default:
      scale = d3.interpolateGreys
      break
  }


  var range = [...Array(domain.length).keys()].map(x => scale((x+1)/(domain.length + 1)))
  var colorMap = d3.scaleOrdinal()
    .domain(domain)
    .range(range)

  return colorMap
}


function plotTSNE(data) {
  // TODO filter based on average information?
  // TODO circle size based on average information

  var gTSNE = svgTSNE.append('g')

  //  var rMap = d3.scaleLinear()
  //    .domain(d3.extent(data, d => d.comments.length))
  //    .rangeRound([1,8])

  var labels = new Set(data.map(d => d.label))
  var colorMap = getColorScale(sentiment, Array.from(labels))
  var alpha_map = Array.from(labels).map(d => ({
    label: d,
    map: d3.scaleLinear()
      .domain(d3.extent(
        data.filter(x => x.label == d),
        x => x.comments.length))
      .range([.5, 1.])
  }))

  console.log(alpha_map)

  var aMap = d3.scaleLinear()
    .domain(d3.extent(data, d => d.comments.length))
    .range([.4, 1.])

  var xMap = d3.scaleLinear()
    .domain(d3.extent(data, d => d.x))
    .rangeRound([marginTSNE.left, widthTSNE - marginTSNE.right])

  var yMap = d3.scaleLinear()
    .domain(d3.extent(data, d => d.y))
    .rangeRound([marginTSNE.top, widthTSNE - marginTSNE.bottom])

  var gCircle = gTSNE.selectAll('circle')
    .data(data)
    .enter().append('g')
      .attr('opacity', d => alpha_map.find(x => x.label == d.label).map(d.comments.length))

  gCircle.append('circle')
    .attr('r', 2)
    .attr('cx', d => xMap(d.x))
    .attr('cy', d => xMap(d.y))
    .style('fill', d => colorMap(d.label))

  gCircle.append('circle')
    .attr('r', 4)
    .attr('cx', d => xMap(d.x))
    .attr('cy', d => xMap(d.y))
    .style('stroke', d => colorMap(d.label))
    .style('fill', 'none')

  gCircle.append('title')
    .text(d => '[Cluster: ' + d.label + ']: ' + d.comments)

  // axis
  var gAxis = svgTSNE.append('g')

  // x axis
  gAxis.append('line')
    .attr('x1', 20)
    .attr('y1', heightTSNE / 2)
    .attr('x2', widthTSNE-20)
    .attr('y2', heightTSNE / 2)
    .style('stroke', 'black')
    .style('stroke-width', '1px')
    .style('shape-rendering', 'crispEdges')
    .style('stroke-dasharray', '2,1')

  gAxis.append('text')
    .attr('x', widthTSNE-20)
    .attr('y', heightTSNE/2)
    .attr('dy','-3px')
    .style('font-weight', '600')
    .style('fill', 'black')
    .style('font-family', 'sans-serif')
    .style('font-size', '10px')
    .style('text-anchor', 'end')
    .text('Layout, navigation')

  gAxis.append('text')
    .attr('x', 20)
    .attr('y', heightTSNE/2)
    .attr('dy','-3px')
    .style('font-weight', '600')
    .style('fill', 'black')
    .style('font-family', 'sans-serif')
    .style('font-size', '10px')
    .style('text-anchor', 'start')
    .text('Praise, app')

  // y axis
  gAxis.append('line')
    .attr('x1', widthTSNE / 2)
    .attr('y1', 40)
    .attr('x2', widthTSNE / 2)
    .attr('y2', heightTSNE - 40)
    .style('stroke', 'black')
    .style('stroke-width', '1px')
    .style('shape-rendering', 'crispEdges')
    .style('stroke-dasharray', '2,1')

  gAxis.append('text')
    .attr('x', widthTSNE/2)
    .attr('y', 40)
    .attr('dx','5px')
    .style('font-weight', '600')
    .style('fill', 'black')
    .style('font-family', 'sans-serif')
    .style('font-size', '10px')
    .style('text-anchor', 'start')
    .style('writing-mode', 'tb')
    .text('Looks, feel')

  gAxis.append('text')
    .attr('x', widthTSNE / 2)
    .attr('y', heightTSNE - 40)
    .attr('dx','5px')
    .style('font-weight', '600')
    .style('fill', 'black')
    .style('font-family', 'sans-serif')
    .style('font-size', '10px')
    .style('text-anchor', 'end')
    .style('writing-mode', 'tb')
    .text('Information, radar')

}

function plotBar(data) {
  var labels = new Set(data.map(d => d.label))
  var colorMap = getColorScale(sentiment, Array.from(labels))
  var data_aggregate = Array.from(labels).map(d => ({
    label: d,
    total: data.filter(x => x.label == d).length
  }))

  console.log(data_aggregate)

  var yMap = d3.scaleBand()
    .domain(data_aggregate.map(x => x.label))
    .rangeRound([marginBar.top, heightBar - marginBar.bottom])
    .padding(.2)

  var xMap = d3.scaleLinear()
    .domain([0, d3.max(data_aggregate, x => x.total)])
    .rangeRound([marginBar.left, widthBar - marginBar.right])

  var gBar = svgBar.append('g')

  gBar.selectAll('rect')
    .data(data_aggregate)
    .enter().append('rect')
    .attr('x', xMap(0))
    .attr('y', d => yMap(d.label))
    .attr('width', d => xMap(d.total) - xMap(0))
    .attr('height', yMap.bandwidth())
    .style('fill', d => colorMap(d.label))

  var xAxis = d3.axisTop(xMap)
    .ticks(4)
    .tickSize(2)
    .tickSizeOuter(0)

  var yAxis = d3.axisLeft(yMap)
    .tickSize(0)
    .tickFormat(d => commentMap[d])

  gXAxis = gBar.append('g')
  gXAxis.attr('transform', 'translate(0' + ',' + marginBar.top + ')')
    .call(xAxis)

  gYAxis = gBar.append('g')
  gYAxis.attr('transform', 'translate(' + (marginBar.left - 2) + ', 0)')
    .call(yAxis)

  gYAxis.select('.domain').remove()
  gYAxis.selectAll('text')
    .style('font-size', '9px')
    .style('font-weight', '600')
    .style('text-transform');

  gXAxis.append('text')
    .attr('x', marginBar.left + (widthBar - marginBar.right - marginBar.left) / 2)
    .attr('y', -20)
    .style('font-weight', '600')
    .style('fill', 'black')
    .style('text-anchor', 'middle')
    .text('Comments')
}

// -- MAIN --
d3.csv(
  'data/tsne_' + sentiment + '_' + K + '.csv',
  function(d) {
    d.x = +d.x
    d.y = +d.y
    return d
  },
  function(e, d) {
    if(e) throw e
    console.log(d)
    plotTSNE(d)
    plotBar(d)
  }
)
