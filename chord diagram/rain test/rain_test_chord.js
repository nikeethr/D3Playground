d3.json('data/chord_mat.json', function(e, data) {
  if (e) throw e;
  matrix = data.mat

  plotChord(data)
  plotBar(data)
})

function getColorScheme(label) {
  N = label.length
  scheme = d3.interpolateYlGnBu;

  return d3.scaleOrdinal()
    .domain(label)
    .range(d3.range(N).map(x => scheme((N - x) / N)))
}

function plotBar(data) {
  var width = 450;
  var height = 300;
  var margin = { left: 100, top: 80, bottom: 0, right: 100 };

  var svg = d3.select("#chart-bar").append('svg')
    .attr('width', width)
    .attr('height', height)

  var color = getColorScheme(data.label)

  var dataArray = new Array();

  for (var key in data.count) {
    dataArray.push({
      name: key,
      value: data.count[key]
    });
  }

  dataArray.sort((a,b) => b.value - a.value)

  // error bars
  dataArray = dataArray.map(function(d) {
    d['err_min'] = d.value - d.value * 0.3;
    d['err_max'] = d.value + d.value * 0.3;
    return d;
  })

  var yMap = d3.scaleBand()
    .domain(dataArray.map(x => x.name))
    .rangeRound([margin.top, height - margin.bottom])
    .padding(0.2)
    .paddingInner(0.35)

  var xMap = d3.scaleLinear()
    .domain([0, d3.max(dataArray, x => x.err_max)])
    .rangeRound([margin.left, width - margin.right])

  var g = svg.append('g')

  g.selectAll('.bar')
    .data(dataArray).enter()
    .append('rect')
      .attr('x', xMap(0))
      .attr('y', d => yMap(d.name))
      .attr('width', d => xMap(d.value) - xMap(0))
      .attr('height', yMap.bandwidth())
      .style("fill", function(d, i) { return color(i); })
      .style("fill-opacity", 0.9)
      .style("stroke", function(d, i) { return d3.rgb(color(i)).darker(); })
      .style('shape-rendering', 'crispEdges')

  g.selectAll('.text')
    .data(dataArray).enter()
    .append('text')
      .attr('x', xMap(0) - 4)
      .attr('y', d => yMap(d.name) + yMap.bandwidth() / 2)
      .style('font-weight', 'bold')
      .style('text-anchor', 'end')
      .style('fill', 'black')
      .style('alignment-baseline', 'central')
      .text(function(d, i) { return data.label[i].replace('_', ' ') })

  // err - min
  var gErr = g.selectAll('g')
    .data(dataArray)
    .enter().append('g')
      .attr('transform', function(d) {
          return 'translate(' + [0, yMap(d.name)] + ')'
      })

  gErr.append('line')
    .attr('x1', d => xMap(d.err_min))
    .attr('x2', d => xMap(d.err_min))
    .attr('y1', 4)
    .attr('y2', yMap.bandwidth() - 4)
    .style('shape-rendering', 'crispEdges')

  // err - max
  gErr.append('line')
    .attr('x1', d => xMap(d.err_max))
    .attr('x2', d => xMap(d.err_max))
    .attr('y1', 4)
    .attr('y2', yMap.bandwidth() - 4)
    .style('shape-rendering', 'crispEdges')

  // err - connectors
  gErr.append('line')
    .attr('x1', d => xMap(d.err_min))
    .attr('x2', d => xMap(d.err_max))
    .attr('y1', yMap.bandwidth() / 2)
    .attr('y2', yMap.bandwidth() / 2)
    .style('stroke-dasharray', '1,2')
    .style('shape-rendering', 'crispEdges')

  gErr.selectAll('line')
    .style('stroke', function(d, i){
      return d3.rgb(color(d.name)).darker();
    })

  var xAxis = d3.axisTop(xMap)
    .ticks(4)
    .tickSizeOuter(0);

  var gXAxis = g.append('g')
  gXAxis.attr('transform', 'translate(0' + ',' + margin.top + ')')
    .call(xAxis);
}

function plotChord(data) {
  var width = 650;
  var height = 650;
  var svg = d3.select("#chart-chord").append('svg')
    .attr('width', width)
    .attr('height', height)

  var outerRadius = Math.min(width, height) * 0.5 - 120;
  var innerRadius = outerRadius - 15;

  var chord = d3.chord()
      .padAngle(0.05);

  var arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

  var ribbon = d3.ribbon()
      .radius(innerRadius);

  var color = getColorScheme(data.label)

  var g = svg.append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
      .datum(chord(matrix));

  var group = g.append("g")
      .attr("class", "groups")
    .selectAll("g")
    .data(function(chords) { return chords.groups; })
    .enter().append("g");

  group.append("path")
      .style("fill", function(d) { return color(d.index); })
      .style("stroke", function(d) { return d3.rgb(color(d.index)).darker(); })
      .style("stroke-opacity", .5)
      .attr("d", arc);


  var groupTick = group.selectAll(".group-tick")
    .data(function(d) { return groupTicks(d, 25); })
    .enter().append("g")
      .attr("class", "group-tick")
      .attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + outerRadius + ",0)"; });

  groupTick.append("line")
      .attr("x2", 6);

  groupTick
    .filter(function(d) { return d.value % 100 === 0; })
    .append("text")
      .attr("x", 8)
      .attr("dy", ".35em")
      .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180) translate(-16)" : null; })
      .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      .text(function(d) { return d.value; });
  var gLabel = group.append("g")
    .attr("transform", function(d) { return "rotate(" + ((d.startAngle + d.endAngle) / (2 * Math.PI) * 180  - 90) + ") translate(" + (outerRadius + 30) + ",0)"; });

  gLabel.append('text')
    .text(function(d, i) { return data.label[i].replace('_', ' ').toUpperCase() })
    .style('fill', function(d) { return d3.rgb(color(d.index)).darker() })
    .style('alignment-baseline', 'central')
    .style('font-size', '10')
    .style('font-weight', 'bold')

  gLabel.append('line')
    .attr("x1", -30)
    .attr("x2", -2)
    .style('stroke', function(d) { return d3.rgb(color(d.index)).darker() })
    .style('stroke-width', '4')


  g.append("g")
      .attr("class", "ribbons")
    .selectAll("path")
    .data(function(chords) { return chords; })
    .enter().append("path")
      .attr("d", ribbon)
      .style("fill", function(d) { return color(d.target.index); })
      .style("stroke", function(d) { return d3.rgb(color(d.target.index)).darker(); })
      .style("stroke-opacity", .5)
}

// Returns an array of tick angles and values for a given group and step.
function groupTicks(d, step) {
  var k = (d.endAngle - d.startAngle) / d.value;
  return d3.range(0, d.value, step).map(function(value) {
    return {value: value, angle: value * k + d.startAngle};
  });
}

// TODO
// - get bar chart info (add to json file)
// - horizontal align div and vertical align to middle (or top)
// - define scaleBands
