// -- GLOBAL --
sentiment = 'negative'
filename = 'data/' + sentiment + '_wordcloud.json'

// 1
var seed = 1;
var height = 400

// word cloud
var widthWC = 400
var heightWC = height
var svgWC =  d3.select('#chart-cloud').append('svg')
  .attr('width', widthWC)
  .attr('height', heightWC)
var marginWC = {left:20, right:20, top:20, bottom:20}

// top words
var widthTW = 260
var heightTW = height
var svgTW =  d3.select('#chart-top-20').append('svg')
  .attr('width', widthTW)
  .attr('height', heightTW)
var marginTW = {left:80, right:60, top:20, bottom:20}

// colors
// reds
// greens
// neutrals

// -- FUNCTIONS --
function random() {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function getColorScale(sentiment, domain) {
  var scale;

  switch(sentiment) {
    case 'positive':
      scale = d3.interpolateBuGn
      break
    case 'negative':
      scale = d3.interpolateOrRd
      break
    case 'negative':
      scale = d3.interpolateGreys
      break
    default:
      scale = d3.interpolateGreys
      break
  }

  return d3.scaleSequential(scale).domain(domain)
}

function removeNumeric(wordDict) {
  keys = Object.keys(wordDict)
  reContainsNumeric = /.*\d.*/

  for (var i = 0; i < keys.length; i++) {
    if (keys[i].match(reContainsNumeric) != null) {
      delete wordDict[keys[i]]
    }
  }
}

function createWordEntries(wordDict, maxWords) {
  var minSize = 10, maxSize = 60 //px

  // TODO sort and slice to get max Words after creating entries
  words = d3.entries(wordDict)
  words = words.sort((a,b) => b.value - a.value)
  wordEntries = words.slice(0, maxWords)

  var sizeMap = d3.scaleLinear()
    .domain(d3.extent(wordEntries, x => x.value))
    .range([minSize, maxSize])

  return wordEntries.map(function(word) {
    word['size'] = sizeMap(word.value)
    return word
  })
}

function drawWordCloud(words) {
  var layout = d3.layout.cloud().size(
      [
        widthWC - marginWC.left - marginWC.right,
        heightWC - marginWC.top - marginWC.bottom
      ]
    )
    .words(words)
    .padding(5)
    .spiral('archimedean')
    .rotate(() => ~~(Math.random() * 2) * 90)
    .font('Sans-serif')
    .fontSize(d => d.size)
    .text(d => d.key)
    .on('end', drawWords)

  layout.start()
  layout.stop()
}

function drawWords(words) {
  colorScale = getColorScale(sentiment, d3.extent(words, x => x.value))

  svgWC.append('g')
    .attr('transform','translate(' +
      (marginWC.left + (widthWC - marginWC.left - marginWC.right) / 2) + ',' +
      (marginWC.top + (heightWC - marginWC.top - marginWC.bottom) / 2) + ')')
    .selectAll('text')
      .data(words)
      .enter().append('text')
      .style('font-size', d => d.size + 'px')
      .style('font-family', 'Sans-serif')
      .style('text-anchor', 'middle')
      .style('fill', d => colorScale(d.value))
      .attr('transform', function(d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .text(d => d.key);
}

// bar plot
//
function getSentimentColor(sentiment) {
  switch (sentiment) {
    case 'positive':
      return "#019875"
    case 'negative':
      return '#D64541'
    case 'neutral':
      return 'grey'
    default:
      return 'grey'
  }

  return 'grey'
}

function plotTopWords(wordEntries, maxWords) {
  // assumptions:
  // 1) sorted descending i.e. by tf-idf
  // 2) maxWords < total entries
  
  var data = wordEntries.slice(0, maxWords)
  var fill = getSentimentColor(sentiment)
  var colorScale = getColorScale(sentiment, d3.extent(wordEntries, x => x.value))

  var xMap = d3.scaleLinear()
    .domain([0, d3.max(data, x => x.value)])
    .rangeRound([marginTW.left, widthTW - marginTW.right])

  var yMap = d3.scaleBand()
    .domain(data.map(x => x.key))
    .rangeRound([marginTW.top, heightTW - marginTW.bottom])
    .padding(0.2)
    .paddingOuter(0.1)

  var gBar = svgTW.append('g')
  var gItem = gBar.selectAll('g').data(data).enter().append('g')
  gItem.attr('transform', d => 'translate(' + [xMap(0), yMap(d.key)] + ')')

  gItem.append('rect')
    .attr('width', d => xMap(d.value) - xMap(0))
    .attr('height', yMap.bandwidth())
    .style('fill', d => colorScale(d.value))

  gItem.append('text')
    .attr('text-anchor', 'end')
    .attr('alignment-baseline', 'central')
    .attr('dy', yMap.bandwidth()/2)
    .attr('dx', -5)
    .style('font-family', 'sans-serif')
    .style('font-size', '11px')
    .style('font-weight', '600')
    .style('fill', 'black')
    .text(d => d.key)

  // axis
  var xAxis = d3.axisTop(xMap)
    .tickSize(3)
    .tickSizeOuter(0)
    .ticks(3)
  var gAxis = gBar.append('g')
  gAxis.attr('transform', 'translate(' + [0, marginTW.top]  + ')')
  gAxis.call(xAxis)

  gAxis.append('text')
    .attr('text-anchor', 'start')
    .attr('x', xMap(d3.max(data, d => d.value)) + 6)
    .style('font-family', 'sans-serif')
    .style('font-size', '10px')
    .style('font-weight', '600')
    .style('fill', 'black')
    .text('TF-IDF')
}

// -- MAIN --
d3.json(filename, function(e, d) {
  if (e) throw e;

  // TODO check if remove numeric helps or hurts
  // removeNumeric(d)
  wordEntries = createWordEntries(d, 200)
  drawWordCloud(wordEntries)
  plotTopWords(wordEntries, 20)
})
