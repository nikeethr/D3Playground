// -- GLOBAL --
var heightBar = 150, heightSeries = 400, widthBar = 600, widthSeries = 600;
var margin = { top: 20, left: 60, bottom: 20, right: 60};

var svgBar = d3.select('#chart-bar')
  .append('svg')
  .attr('width', widthBar)
  .attr('height', heightBar);

var svgSeries = d3.select('#chart-time-series')
  .append('svg')
  .attr('width', widthSeries)
  .attr('height', heightSeries);

var midWidth = widthBar * .7;
var midHeight = heightSeries / 2;
var midPadding = 10;

// -- FUNCTIONS --
function plotSentimentBar(data) {
  // Plot bar chart

  // x-y mapping
  xMax = d3.max(data.map(x => x['comments']));

  var xMap = d3.scaleLinear()
    .domain([0, xMax])
    .rangeRound([margin.left, midWidth - midPadding]);

  yDomain = data.map(x => x["sentiment"]);

  var yMap = d3.scaleBand()
    .domain(yDomain)
    .rangeRound([margin.top, heightBar - margin.bottom])
    .padding(0.2);

  var g = svgBar.append('g')

  // bar plot
  var gBar = g.append('g')
  gBar.selectAll('.bar')
    .data(data)
    .enter().append('rect')
      .attr('x', xMap(0))
      .attr('y', d => yMap(d['sentiment']))
      .attr('width', d => xMap(d['comments']) - xMap(0))
      .attr('height', yMap.bandwidth())
      .style('fill', d => getSentimentColor(d['sentiment']));

  // axis
  var xAxis = d3.axisTop(xMap)
    .ticks(4)
    .tickSizeOuter(0);
    // .tickFormat(function(d) {
    //   return this.parentNode.nextSibling ? d : d + ' comments';
    // });

  var yAxis = d3.axisLeft(yMap).tickSize(0);

  gXAxis = gBar.append('g')
  gXAxis.attr('transform', 'translate(0' + ',' + margin.top + ')')
    .call(xAxis);

  gYAxis = gBar.append('g')
  gYAxis.attr('transform', 'translate(' + (margin.left - 2) + ', 0)')
    .call(yAxis);

  gYAxis.select('.domain').remove();
  gYAxis.selectAll('text').style('font-weight', '600').style('text-transform', 'capitalize');

  // Plot stat table
  var gTable = g.append('g');
  var textData;
  var xNext;
  var tablePadding = 10;
  
  // render numbers
  textData = data.map(function(x) {
    return { 
      'sentiment': x.sentiment,
      'text': x.comments
    };
  });

  xNext = renderTextColumn(midWidth + midPadding, yMap, textData, gTable, 'Comments');

  // render percentage

  textData = data.map(function(x) {
   return { 
     'sentiment': x.sentiment,
     'text': (x.comments / d3.sum(data.map(x => x.comments)) * 100).toFixed(2) + "%"
   };
  });

  xNext = renderTextColumn(xNext + tablePadding, yMap, textData, gTable, 'Proportion');

  // render pie
  renderPieColumn(xNext, yMap, data, gTable);

  // dividers
  var lineWidth = g.node().getBBox().width;
  var lineX = g.node().getBBox().x;
  var gDividers = g.append('g');

  gDividers.selectAll('.line')
    .data(data)
    .enter().append('line')
      .attr('x1', lineX)
      .attr('y1', d => yMap(d.sentiment) + 1.1 * yMap.bandwidth())
      .attr('x2', lineWidth + lineX)
      .attr('y2', d => yMap(d.sentiment) + 1.1 * yMap.bandwidth())
      .style('stroke', 'black')
      .style('shape-rendering', 'crispEdges')

  gDividers.selectAll('line:last-of-type').style('stroke', 'none')
}

function renderPieColumn(x, yMap, data, g) {
  var gColumn = g.append('g');

  var pie  = d3.pie()
    .sort(null)
    .value(d => d.comments);

  var path = d3.arc()
    .outerRadius(12)
    .innerRadius(4);

  gPie = gColumn.selectAll('g')
    .data(data).enter()
    .append('g')
      .attr('transform', function(d) {
        var xCoord = 12 + x;
        var yCoord = yMap(d['sentiment']) + yMap.bandwidth() / 2;
        return 'translate(' + xCoord + ',' + yCoord + ')';
      })

  gPie.selectAll(".arc")
    .data(function(d) {
      var d_ = pie(data);
      d_.forEach(function(elem) {
        elem["current"] = d["sentiment"]
      })
      return d_;
    })
    .enter().append("path")
      .attr("d", path)
      .style("fill", d => getSentimentColor(d.data["sentiment"]))
      .style("opacity", d => d.data["sentiment"] == d["current"] ? 1. : .1)
      .attr("shape-rendering", "geometricPrescision")

  var xNext = x + gColumn.node().getBBox().width;
  return xNext
}

// e.g. textData = [{sentiment: 'positive', text: 10.5%}, ...]
function renderTextColumn(x, yMap, textData, g, header) {
  var gColumn = g.append('g');

  gColumn.append("text")
    .attr("x", x)
    .attr("y", margin.top)
    .style("font-family", "sans-serif")
    .style("font-size", "10px")
    .style("font-weight", "600")
    .style("alignment-baseline", "top")
    .text(header);


  gColumn.selectAll(".text")
    .data(textData).enter()
    .append("text")
      .attr("x", x)
      .attr("y", d => yMap(d['sentiment']) + yMap.bandwidth()/2)
      .style("font-family", "sans-serif")
      .style("font-size", "11px")
      .style("alignment-baseline", "central")
      .text(d => d['text']);

  var xNext = x + gColumn.node().getBBox().width;
  return xNext;
}

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

function drawLine(data, color, xLab, yLab, xMap, yMap) {
  var g = svgSeries.append('g');

  var line = d3.line()
    .x(d => xMap(d.mid_date))
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
    .attr('r', 3)
    .style('fill', 'white')
    .style('stroke-width', 2)
    .style('stroke', color);
}

function plotTimeSeries(data) {
  // Plot usage + comments
  var xMap = d3.scaleTime()
    .domain([d3.min(data, d => d.start_date), d3.max(data, d => d.end_date)])
    .rangeRound([margin.left, widthSeries - margin.right]);

  var yMapUsage = d3.scaleLinear() 
    .domain([0, d3.max(data, d => d.sessions)])
    .rangeRound([midHeight, margin.top]);

  var yMapComments = d3.scaleLinear() 
    .domain([0, d3.max(data, d => d.total_comments)])
    .rangeRound([midHeight, margin.top]);

  // Axis
  var tickValues = data.map(d => d.start_date);

  var xAxis = d3.axisBottom(xMap)
    .tickValues(tickValues)
    .tickFormat(d3.timeFormat("%b, %Y"))
    .tickSizeOuter(0)
    .tickSizeInner(-(midHeight - margin.top))

  var gXAxis = svgSeries.append('g')
    .attr('transform', 'translate(0, ' + (midHeight) + ')')
    .call(xAxis)

  gXAxis.selectAll('text')
    .attr('transform', 'rotate(90)')
    .attr('dx', -30)
    .attr('dy', -8)
    .style('fill', 'dimgrey')
    .style('opacity', '.5')
    .style('font-size', '10px')
    .style('font-family', 'Verdana')

  gXAxis.selectAll('.tick').select('line')
    .style('stroke', 'dimgrey')
    .style('opacity', '.5')

  var yAxisComments = d3.axisLeft(yMapComments)
    .tickSizeOuter(0)
    .ticks(5);

  var gYAxisComments = svgSeries.append('g');
  gYAxisComments.attr('transform', 'translate(' + margin.left + ',0)')
    .call(yAxisComments);

  gCommentsLab = gYAxisComments.append('g');
  gCommentsLab.append('text')
    .attr('y', margin.top - 5)
    .attr('fill', 'black')
    .attr('font-weight', 'bold')
    .style('text-anchor', 'middle')
    .text('Total comments')
  gCommentsLab.append('rect')
    .attr('width', 20)
    .attr('height', 2)
    .attr('fill', 'darkorange')
    .attr('y', margin.top - 8)
    .attr('x', 40)
    .attr('shape-rendering', 'crispEdges')
  gCommentsLab.append('circle')
    .attr('r', 3) 
    .attr('cx', 50)
    .attr('cy', margin.top - 7.5)
    .attr('stroke', 'darkorange')
    .attr('stroke-width', 2)
    .attr('fill', 'white')

  var yAxisUsage = d3.axisRight(yMapUsage)
    .tickSizeOuter(0)
    .ticks(5);

  var gYAxisUsage = svgSeries.append('g');
  gYAxisUsage.attr('transform', 'translate(' + (widthSeries - margin.right) + ',0)')
    .call(yAxisUsage);

  gUsageLab = gYAxisUsage.append('g');
  gUsageLab.append('text')
    .attr('y', margin.top - 5)
    .attr('fill', 'black')
    .attr('font-weight', 'bold')
    .style('text-anchor', 'middle')
    .text('Sessions')
  gUsageLab.append('rect')
    .attr('width', 20)
    .attr('height', 2)
    .attr('fill', 'steelblue')
    .attr('y', margin.top - 8)
    .attr('x', -45)
    .attr('shape-rendering', 'crispEdges')
  gUsageLab.append('circle')
    .attr('r', 3) 
    .attr('cx', -35)
    .attr('cy', margin.top - 7.5)
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2)
    .attr('fill', 'white')

  // Lines
  drawLine(data, 'steelblue', 'mid_date', 'sessions', xMap, yMapUsage);
  drawLine(data, 'darkorange', 'mid_date', 'total_comments', xMap, yMapComments);

  // Plot stacked bar
  stackSentiments(data)
  var gStackedBar = svgSeries.append('g')
  
  var gBars = gStackedBar.selectAll('.barGroup')
    .data(data)
    .enter().append('g')
      .attr('transform', function(d) {
        return 'translate(' + xMap(d.start_date) + ',' + (midHeight + 2) + ')'
      })

  // relative to midHeight
  var yMapBar = d3.scaleLinear()
    .domain([0, 100])
    .range([0, midHeight - margin.bottom])

  var xAxisBar = d3.axisBottom(xMap)
    .tickValues(tickValues)
    .tickFormat('')
    .tickSizeOuter(0)
    .tickSizeInner(midHeight - margin.bottom + 2)

  var gXAxisBar = svgSeries.append('g')
    .attr('transform', 'translate(0, ' + (midHeight) + ')')
    .call(xAxisBar)

  var yAxisBar = d3.axisLeft(yMapBar)
    .tickValues([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
    .tickFormat(d => d + '%')
  var gYAxisBar = svgSeries.append('g');
  gYAxisBar.attr('transform', 'translate(' + margin.left + ',' + midHeight + ')')
    .call(yAxisBar)

  gYAxisBar.append('text')
    .attr('y', midHeight - margin.bottom + 15)
    .attr('fill', 'black')
    .attr('font-weight', '600')
    .text('Sentiment proportion')
    .style('text-anchor', 'middle')

  gXAxisBar.selectAll('.tick').select('line')
    .style('stroke', 'dimgrey')
    .style('opacity', '.5')

  gBars.selectAll('rect')
    .data(function(d) {
      var d_ = d.stacked;
      d.stacked.forEach(function(d_) {
        d_['width'] = xMap(d['end_date']) - xMap(d['start_date']);
      })
      return d.stacked;
    })
    .enter().append('rect')
      .attr('x', 4)
      .attr('y', d => yMapBar(d.start))
      .attr('height', d => yMapBar(d.end) - yMapBar(d.start))
      .attr('width', d => d.width - 8)
      .style('fill', d => getSentimentColor(d.sentiment))
      .style('stroke', 'white')
      .style('shape-rendering', 'crispEdges')
}

function stackSentiments(data) {
  order = ['negative', 'neutral', 'positive'] 
  data.forEach(function(d) {
    var sum = 0;
    var stack = 0;
    d['stacked'] = [];
    for (i = 0; i < order.length; i++)
      sum = sum + d[order[i]];
    for (i = 0; i < order.length; i++) {
      prp = d[order[i]] / sum * 100;
      d['stacked'].push({
        sentiment: order[i],
        start: stack,
        end: stack + prp
      })
      stack = stack + prp
    }
  })
}

// -- MAIN --
d3.queue()
  .defer(d3.csv, 'data/sentiment_aggregate.csv', function(d) { 
    d.comments = +d.comments;
    return d;
  })
  .defer(d3.json, 'data/grouped_3month_data.json')
  .awaitAll(function(e, allData) {
    if (e) throw e;

    var dBar = allData[0];
    var dTimeSeries = allData[1].data;

    // bar plot
    var order = ["positive", "neutral", "negative"]
    dBar.sort(function(a, b) {
      return order.indexOf(a["sentiment"]) - order.indexOf(b["sentiment"])
    });
    plotSentimentBar(dBar);

    // time series plot
    var parseTime = d3.timeParse("%Y-%m-%d")
    var dateKeys = ['start_date', 'mid_date', 'end_date']
    dTimeSeries.forEach(function(d) {
      dateKeys.forEach(function(i) {
        d[i] = parseTime(d[i])
      })
    });
    console.log(dTimeSeries)
    plotTimeSeries(dTimeSeries)
  });
