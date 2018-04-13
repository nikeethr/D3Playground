// -- helpers --

Array.prototype.groupBy = function(prop) {
	return this.reduce(function(groups, item) {
		var val = item[prop];
		groups[val] = groups[val] || [];
		groups[val].push(item);
		return groups;
	}, {});
}

Object.prototype.summarise_each = function(prop, f) {
	var summary = [];
	keys = Object.keys(this);
	for (var i = 0; i < keys.length; i++) {
		var summary_elem = {};
		var items = this[keys[i]]
		summary_elem['name'] = keys[i];

		prop.forEach(function(p) {
			summary_elem[p] = items.reduce(function(accumulator, item) {
				return f(accumulator, item[p]);
			}, 0);

		});

		summary.push(summary_elem);
	}
	return summary;
}

// -- functions --

function plotAxis(xMap, yMap, yOffset, xLab, yLab) {
	var xAxis = d3.axisBottom(xMap)
		.ticks(3);

	var xAxisGrid = d3.axisTop(xMap)
		.ticks(3)
		.tickSize(yOffset - margin.top)
		.tickFormat("")

	var yAxis = d3.axisLeft(yMap)
		.tickSize(0);

	var gAxisGrid = svg.append('g')
		.attr('transform', 'translate(' + 0 + ',' + yOffset + ')');

	var gAxisBottom = svg.append('g')
		.attr('transform', 'translate(' + 0 + ',' + yOffset + ')');

	var gAxisLeft = svg.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + 0 + ')');

	gAxisBottom.call(xAxis);
	gAxisLeft.call(yAxis);
	gAxisGrid.call(xAxisGrid);
	gAxisGrid.selectAll('line')
		.attr('stroke', 'lightgray')
		.attr('stroke-dasharray', '1,2');

	gAxisGrid.select(".domain").remove()
	gAxisBottom.select(".domain").remove()
	gAxisLeft.select(".domain").remove()

	var xLabel = gAxisBottom.append('text')
			.attr('dx', (width - margin.right) / 2)
			.attr('dy', 30)
			.style('font-family', 'sans-serif')
			.style('font-size', '10px')
			.style('font-weight', 'bold')
			.style('text-anchor', 'start')
			.style('fill', 'black')
			.style('text-transform', 'capitalize')
			.text(xLab);

	var yLabel = gAxisLeft.append('text')
			.attr('dy', margin.top - 5)
			.style('font-family', 'sans-serif')
			.style('font-size', '10px')
			.style('font-weight', 'bold')
			.style('text-anchor', 'end')
			.style('fill', 'black')
			.style('text-transform', 'capitalize')
			.text(yLab);
}

function plotBar(d, xMap, yMap, metric, color) {
	gBar = svg.append('g');
	gBar.selectAll('.bar')
		.data(d)
		.enter().append('rect')
			.attr('x', function(d) { return xMap(0); })
			.attr('y', function(d) { return yMap(d.name); })
			.attr('width', function(d) { return xMap(d[metric]) - xMap(0); })
			.attr('height', yMap.bandwidth)
			.attr('class', 'bar')
			.style('fill', color)
			.style('shape-rendering', 'crispEdges');
}

function barHover(xMap, yMap) {
	var g = null;

	function handleMouseOver(d, i) {
		g = svg.append('g');
		var text = g.append('text')
			.attr('x', xMap(0))
			.attr('y', yMap(d.name) - 2)
			.style('fill', 'black')
			.style('font-family', 'sans-serif')
			.style('font-size', '9px');

		text.append('tspan').text('| ');
		text.append('tspan').style('font-weight', 'bold').text('Unique Events: ');
		text.append('tspan').text(d.uniqueEvents);
		text.append('tspan').text(' | ');
		text.append('tspan').style('font-weight', 'bold').text('Total Events: ');
		text.append('tspan').text(d.events);
		text.append('tspan').text(' |');

		svg.selectAll('.bar')
			.attr('fill-opacity', function(d_) {
				return d_.name == d.name ? 1.0 : 0.3;
			});
	}

	function handleMouseOut(d, i) {
		g.remove();
		svg.selectAll('.bar').attr('fill-opacity', 1.0);
	}

	var x = svg.selectAll('.bar');
	x.on('mouseover', handleMouseOver)
	 .on('mouseout', handleMouseOut)
}

function plotCustomLegend() {
	var padding = 4;
	var xStart = width - margin.right + 10;
	var yStart = margin.top + 5;
	var rectWidth = 10;

	var g = svg.append('g')
		.attr('transform', 'translate(' + xStart + ',' + yStart + ')');
	// unique events
	g.append('rect')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', rectWidth)
		.attr('height', rectWidth)
		.style('fill', 'coral')
		.style('shape-rendering', 'crispEdges');

	g.append('text')
		.attr('x', rectWidth + padding)
		.attr('y', rectWidth / 2)
		.style('fill', 'black')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('alignment-baseline', 'central')
		.style('text-transform', 'capitalize')
		.text('unique events')

	// events
	var xOffset = 0;

	g.append('rect')
		.attr('x', xOffset)
		.attr('y', rectWidth + padding)
		.attr('width', rectWidth)
		.attr('height', rectWidth)
		.style('fill', 'coral')
		.style('shape-rendering', 'crispEdges');

	xOffset += rectWidth + padding / 2;
	
	var plus = g.append('text')
		.attr('x', xOffset)
		.attr('y', rectWidth + padding + rectWidth / 2)
		.style('fill', 'black')
		.style('font-family', 'sans-serif')
		.style('font-size', '12px')
		.style('alignment-baseline', 'central')
		.text('+')
	
	xOffset += plus.node().getBBox().width + padding / 2;

	g.append('rect')
		.attr('x', xOffset)
		.attr('y', rectWidth + padding)
		.style('width', rectWidth)
		.style('height', rectWidth)
		.style('fill', 'steelblue')
		.style('shape-rendering', 'crispEdges');

	xOffset += rectWidth + padding;

	g.append('text')
		.attr('x', xOffset)
		.attr('y', rectWidth + padding + rectWidth / 2)
		.style('fill', 'black')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
		.style('alignment-baseline', 'central')
		.style('text-transform', 'capitalize')
		.text('total events')

}

function plotTitle(selection , group) {
	d3.select("#title").style("margin-left", margin.left + "px");
	var title = d3.select("#title")
		.append('text')
		.style('font-family', 'sans-serif')
		.style('font-size', '12px')
		.style('fill', 'black');
	
	title.append('tspan')
		.style('text-transform', 'capitalize')
		.style('font-weight', 'bold')
		.text(group + ' ');

	title.append('tspan').text(selection);
}

function plotSummaryBar(eventCount, uniqueEventCount, group) {
	// var groupLabelPlural = getPlural(group);
	var groupLabelPlural = 'categories';

	var xMap = d3.scaleLinear()
		.domain([0, eventCount.total])
		.rangeRound([margin.left, width - margin.right]);

	var summaryWidth = width;
	var summaryHeight = 115;
	var barWidth = 20;
	var padding = 17;

	var summarySVG = d3.select("#bar-summary")
		.append('svg')
		.attr('width', summaryWidth)
		.attr('height', summaryHeight);

	var xAxis = d3.axisTop(xMap).ticks(3).tickSize(-5);

	var gAxis = summarySVG.append('g')
		.attr('transform', 'translate(' + 0 + ',' + margin.top + ')');

	gAxis.call(xAxis);

	var gSummaryEvents= summarySVG.append('g');

	var yOffset = margin.top + 7 + padding;

	var textEvents = gSummaryEvents.append('text')
		.attr('x', xMap(0))
		.attr('y', yOffset - 4)
		.style('fill', 'black')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px');

	textEvents.append('tspan').text('Events: ').style('font-weight', 'bold');
	textEvents.append('tspan').text(eventCount.current)
	textEvents.append('tspan').text(' [ ' + 
		Math.round((eventCount.current / eventCount.total) * 100) + 
		'% of all events]')
		.style('font-size', '9px');

	gSummaryEvents.append('rect')
		.attr('x', xMap(0))
		.attr('y', yOffset)
		.attr('width', xMap(eventCount.total) - xMap(0))
		.attr('height', barWidth)
		.style('stroke', 'steelblue')
		.style('fill', 'none')
		.style('shape-rendering', 'crispEdges')

	gSummaryEvents.append('rect')
		.attr('x', xMap(0))
		.attr('y', yOffset)
		.attr('width', xMap(eventCount.current) - xMap(0))
		.attr('height', barWidth)
		.style('fill', 'steelblue')
		.style('shape-rendering', 'crispEdges')
	
	var gSummaryUniqueEvents= summarySVG.append('g');

	yOffset = yOffset + barWidth + padding;

	var textUniqueEvents = gSummaryUniqueEvents.append('text')
		.attr('x', xMap(0))
		.attr('y', yOffset - 4)
		.style('fill', 'black')
		.style('font-family', 'sans-serif')
		.style('font-size', '10px');

	textUniqueEvents.append('tspan').text('Unique Events: ').style('font-weight', 'bold');
	textUniqueEvents.append('tspan').text(uniqueEventCount.current)
	textUniqueEvents.append('tspan').text(' [ ' + 
		Math.round((uniqueEventCount.current / uniqueEventCount.total) * 100) + 
		'% of all unique events]')
		.style('font-size', '9px');

	gSummaryUniqueEvents.append('rect')
		.attr('x', xMap(0))
		.attr('y', yOffset)
		.attr('width', xMap(uniqueEventCount.total) - xMap(0))
		.attr('height', barWidth)
		.style('stroke', 'coral')
		.style('fill', 'none')
		.style('shape-rendering', 'crispEdges')

	gSummaryUniqueEvents.append('rect')
		.attr('x', xMap(0))
		.attr('y', yOffset)
		.attr('width', xMap(uniqueEventCount.current) - xMap(0))
		.attr('height', barWidth)
		.style('fill', 'coral')
		.style('shape-rendering', 'crispEdges')

	gSummaryUniqueEvents.append('line')
		.attr('x1', margin.left - 10)
		.attr('y1', summaryHeight - 1)
		.attr('x2', summaryWidth - margin.right + 10)
		.attr('y2', summaryHeight - 1)
		.style('stroke', 'black')
		.style('shape-rendering', 'crispEdges');
}

function updateBarChart(selection, group, from=null, to=null) {
	if (table_data == null)
		return;

	d3.select("#title").selectAll('text').remove()
	d3.select("#bar-summary").selectAll('svg').remove()
	d3.select("#bar-chart").selectAll('g').remove()

	// Title
	plotTitle(selection, group);

	// Summary bar

	var eventCount = {};
	var uniqueEventCount = {};

	if (group == 'link') {
		if (from == null || to == null)
			return;

		eventCount = 
			{
				current: table_data
							.filter(x => 
								(x[from.group] == from.selection
								&& x[to.group] == to.selection))
							.reduce((a, i) => a + i.events, 0),
				total: table_data
							.reduce((a, i) => a + i.events, 0)
			};

		uniqueEventCount = 
			{
				current: table_data
							.filter(x => 
								(x[from.group] == from.selection
								&& x[to.group] == to.selection))
							.reduce((a, i) => a + i.uniqueEvents, 0),
				total: table_data
							.reduce((a, i) => a + i.uniqueEvents, 0)
			};

	} else {

		eventCount = 
			{
				current: table_data
							.filter(x => (x[group] == selection))
							.reduce((a, i) => a + i.events, 0),
				total: table_data
							.reduce((a, i) => a + i.events, 0)
			};

		uniqueEventCount = 
			{
				current: table_data
							.filter(x => (x[group] == selection))
							.reduce((a, i) => a + i.uniqueEvents, 0),
				total: table_data
							.reduce((a, i) => a + i.uniqueEvents, 0)
			};
	}
	
	if (Object.keys(eventCount).length === 0 || Object.keys(uniqueEventCount).length === 0)
		return;

	var totalUniqueEvents = table_data.reduce((a, i) => a + i.uniqueEvents, 0);

	plotSummaryBar(eventCount, uniqueEventCount, group)

	// Bar chart
	var grouped = null;
	var groupby = '';

	if (group == 'category' || group == 'action') {
		switch(group) {
			case 'category':
				groupby = 'action'
				break;
			case 'action':
				groupby = 'category'
				break;
			default:
				break;
		}

		grouped = table_data
				.filter(x => (x[group] == selection))
				.groupBy(groupby)
				.summarise_each(['events', 'uniqueEvents'], (x, y) => x + y);
	}

	if (grouped != null) {
		// grouped = [{name: hi, events: 10, uniqueEvents:5}, ...]
		var TOP_BARS = 5
		var total_height = height - (margin.top + margin.bottom);

		if (grouped.length <= TOP_BARS) {
			total_height = total_height / (TOP_BARS + 1) * grouped.length;
		}

		grouped.sort((x, y) => x['events'] < y['events']);

		var bar_data = [];
		if (grouped.length > TOP_BARS) {
			var top_bars = grouped.slice(0, TOP_BARS);
			var other = grouped.slice(TOP_BARS).reduce(function(accumulator, item) {
					accumulator['name'] = accumulator['name'] || 'other';
					accumulator['events'] = accumulator['events'] || 0;
					accumulator['uniqueEvents'] = accumulator['uniqueEvents'] || 0;

					accumulator['events'] += item['events'];
					accumulator['uniqueEvents'] += item['uniqueEvents'];

					return accumulator;
				}, {});
			top_bars.push(other);
			bar_data = top_bars;
		} else {
			bar_data = grouped;
		}

		var names = bar_data.map(x => x.name);
		var values = bar_data.map(x => x.events);

		var xMap = d3.scaleLinear()
			.domain([0, d3.max(values)])
			.rangeRound([margin.left, width - margin.right]);

		var yMap = d3.scaleBand()
			.domain(names)
			.rangeRound([margin.top, total_height])
			.padding(0.4)
			.paddingOuter(0.1);

		plotAxis(xMap, yMap, total_height, 'event count', groupby);
		plotBar(bar_data, xMap, yMap, 'events', 'steelblue');
		plotBar(bar_data, xMap, yMap, 'uniqueEvents', 'coral');
		plotCustomLegend();
		barHover(xMap, yMap);
	}
}

// -- main --

var graph_data = null;
var table_data = null;
var width = 400;
var height = 250;
var margin = {top:20, left:75, bottom:20, right:120};
var svg = d3.select('#bar-chart').append('svg')
	.attr('width', width)
	.attr('height', height);

var q = d3.queue();

q.defer(d3.json, 'rng_graph.json');
q.defer(d3.csv, 'rng_data.csv', function (d) { 
	d.uniqueEvents = +d.uniqueEvents;
	d.events = +d.events;
	return d; 
});

q.awaitAll(function(e, ds) {
	if (e) throw e;

	var graph_data = ds[0];
	table_data = ds[1];

	var selection = 'category1';
	var group = 'category';

	updateBarChart(selection, group);
})
