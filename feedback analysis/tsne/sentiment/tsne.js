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
heightBar = 200
marginBar = {left:60, right:20, top:60, bottom:60}
var svgBar = d3.select('#chart-bar').append('svg')
  .attr('width', widthBar)
  .attr('height', heightBar)

var colorMap = (sentiment) => ({
  'positive':'#019875',
  'neutral': 'grey',
  'negative':'#D64541'
})[sentiment]

// -- FUNCTIONS --
function plotTSNE(data) {
  // TODO filter based on average information?
  // TODO circle size based on average information

  var gTSNE = svgTSNE.append('g')

  //  var rMap = d3.scaleLinear()
  //    .domain(d3.extent(data, d => d.comments.length))
  //    .rangeRound([1,8])

  sentiment_alpha_map = [
    {sentiment:'positive', min:.2, max:.7},
    {sentiment:'neutral', min:.4, max:.8},
    {sentiment:'negative', min:.6, max:.9}
  ]

  sentiment_alpha_map.forEach(function (s) {
    s['map'] = d3.scaleLinear()
      .domain(d3.extent(
        data.filter(d => d.label == s.sentiment),
        d => d.comments.length))
      .range([s.min, s.max])
  })

  console.log(sentiment_alpha_map)

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
      .attr('opacity', d => sentiment_alpha_map.find(x => x.sentiment == d.label).map(d.comments.length))

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
    .text(d => d.comments)

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
    .text('Information')

  gAxis.append('text')
    .attr('x', 20)
    .attr('y', heightTSNE/2)
    .attr('dy','-3px')
    .style('font-weight', '600')
    .style('fill', 'black')
    .style('font-family', 'sans-serif')
    .style('font-size', '10px')
    .style('text-anchor', 'start')
    .text('Navigation')

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
    .text('User-friendly')

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
    .text('Suggestions')

}

function plotBar(data) {
  sentiment_aggregate = [
    {sentiment:'positive'},
    {sentiment:'neutral'},
    {sentiment:'negative'}
  ]

  sentiment_aggregate.forEach(function(s) {
    s['total'] = data.filter(x => x.label == s.sentiment).length
  })

  console.log(sentiment_aggregate)

  var yMap = d3.scaleBand()
    .domain(sentiment_aggregate.map(x => x.sentiment))
    .rangeRound([marginBar.top, heightBar - marginBar.bottom])
    .padding(.2)

  var xMap = d3.scaleLinear()
    .domain([0, d3.max(sentiment_aggregate, x => x.total)])
    .rangeRound([marginBar.left, widthBar - marginBar.right])

  var gBar = svgBar.append('g')

  gBar.selectAll('rect')
    .data(sentiment_aggregate)
    .enter().append('rect')
    .attr('x', xMap(0))
    .attr('y', d => yMap(d.sentiment))
    .attr('width', d => xMap(d.total) - xMap(0))
    .attr('height', yMap.bandwidth())
    .style('fill', d => colorMap(d.sentiment))

  var xAxis = d3.axisTop(xMap)
    .ticks(4)
    .tickSize(2)
    .tickSizeOuter(0)

  var yAxis = d3.axisLeft(yMap).tickSize(0);

  gXAxis = gBar.append('g')
  gXAxis.attr('transform', 'translate(0' + ',' + marginBar.top + ')')
    .call(xAxis)

  gYAxis = gBar.append('g')
  gYAxis.attr('transform', 'translate(' + (marginBar.left - 2) + ', 0)')
    .call(yAxis)

  gYAxis.select('.domain').remove()
  gYAxis.selectAll('text').style('font-weight', '600').style('text-transform', 'capitalize');

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
  'data/tsne_sentiments.csv',
  function(d) {
    d.x = +d.x
    d.y = +d.y
    return d
  },
  function(e, d) {
    if(e) throw e
    console.log(d)
    // positive, neutral then negative so that negative is overlayed on
    order = ['positive', 'neutral', 'negative']
    d = d.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label))
    plotTSNE(d)
    plotBar(d)
  }
)
