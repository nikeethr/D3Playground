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

// Bar functions

function plotAxis(xMap, yMap, yOffset, xLab, yLab) {
	var xAxis = d3.axisBottom(xMap)
		.ticks(3);

	var xAxisGrid = d3.axisTop(xMap)
		.ticks(3)
		.tickSize(yOffset)
		.tickFormat("")

	var yAxis = d3.axisLeft(yMap)
		.tickSize(0);

	var gAxisGrid = svgBar.append('g')
		.attr('transform', 'translate(' + 0 + ',' + (marginBar.top + yOffset) + ')');

	var gAxisBottom = svgBar.append('g')
		.attr('transform', 'translate(' + 0 + ',' + (marginBar.top + yOffset) + ')');

	var gAxisLeft = svgBar.append('g')
		.attr('transform', 'translate(' + marginBar.left + ',' + 0 + ')');

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
			.attr('dx', (barWidth - marginBar.right) / 2)
			.attr('dy', 30)
			.style('font-family', 'sans-serif')
			.style('font-size', '10px')
			.style('font-weight', 'bold')
			.style('text-anchor', 'start')
			.style('fill', 'black')
			.style('text-transform', 'capitalize')
			.text(xLab);

	var yLabel = gAxisLeft.append('text')
			.attr('dy', marginBar.top - 5)
			.style('font-family', 'sans-serif')
			.style('font-size', '10px')
			.style('font-weight', 'bold')
			.style('text-anchor', 'end')
			.style('fill', 'black')
			.style('text-transform', 'capitalize')
			.text(yLab);
}

function plotBar(d, xMap, yMap, metric, color) {
	gBar = svgBar.append('g');
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
		g = svgBar.append('g');
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

		svgBar.selectAll('.bar')
			.attr('fill-opacity', function(d_) {
				return d_.name == d.name ? 1.0 : 0.3;
			});
	}

	function handleMouseOut(d, i) {
		g.remove();
		svgBar.selectAll('.bar').attr('fill-opacity', 1.0);
	}

	var x = svgBar.selectAll('.bar');
	x.on('mouseover', handleMouseOver)
	 .on('mouseout', handleMouseOut)
}

function plotCustomLegend() {
	var padding = 4;
	var xStart = barWidth - marginBar.right + 10;
	var yStart = marginBar.top + 5;
	var rectWidth = 10;

	var g = svgBar.append('g')
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
	d3.select("#title").style("margin-left", marginBar.left + "px");
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
		.rangeRound([marginBar.left, barWidth - marginBar.right]);

	var summaryWidth = barWidth;
	var summaryHeight = 115;
	var bandWidth = 20;
	var padding = 17;

	var summarySVG = d3.select("#bar-summary")
		.append('svg')
		.attr('width', summaryWidth)
		.attr('height', summaryHeight);

	var xAxis = d3.axisTop(xMap).ticks(3).tickSize(-5);

	var gAxis = summarySVG.append('g')
		.attr('transform', 'translate(' + 0 + ',' + marginBar.top + ')');

	gAxis.call(xAxis);

	var gSummaryEvents= summarySVG.append('g');

	var yOffset = marginBar.top + 7 + padding;

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
		.attr('height', bandWidth)
		.style('stroke', 'steelblue')
		.style('fill', 'none')
		.style('shape-rendering', 'crispEdges')

	gSummaryEvents.append('rect')
		.attr('x', xMap(0))
		.attr('y', yOffset)
		.attr('width', xMap(eventCount.current) - xMap(0))
		.attr('height', bandWidth)
		.style('fill', 'steelblue')
		.style('shape-rendering', 'crispEdges')
	
	var gSummaryUniqueEvents= summarySVG.append('g');

	yOffset = yOffset + bandWidth + padding;

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
		.attr('height', bandWidth)
		.style('stroke', 'coral')
		.style('fill', 'none')
		.style('shape-rendering', 'crispEdges')

	gSummaryUniqueEvents.append('rect')
		.attr('x', xMap(0))
		.attr('y', yOffset)
		.attr('width', xMap(uniqueEventCount.current) - xMap(0))
		.attr('height', bandWidth)
		.style('fill', 'coral')
		.style('shape-rendering', 'crispEdges')

	gSummaryUniqueEvents.append('line')
		.attr('x1', marginBar.left - 10)
		.attr('y1', summaryHeight - 1)
		.attr('x2', summaryWidth - marginBar.right + 10)
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

		var N = grouped.length <= TOP_BARS ? grouped.length : TOP_BARS + 1;
		var bar_height = 20;
		var H = bar_height / 0.6;
		var padding_inner = 0.4 * H;
		var padding_outer = 0.1 * H;
		var total_height = (N-1)*(bar_height+padding_inner) + (bar_height+padding_outer) + padding_outer;

		// if (grouped.length <= TOP_BARS) {
		// 	total_height = total_height / (TOP_BARS + 1) * grouped.length;
		// }

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
			.rangeRound([marginBar.left, barWidth - marginBar.right]);

		var yMap = d3.scaleBand()
			.domain(names)
			.rangeRound([marginBar.top, marginBar.top + total_height])
			.paddingInner(0.4)
			.paddingOuter(0.1);

		plotAxis(xMap, yMap, total_height, 'event count', groupby);
		plotBar(bar_data, xMap, yMap, 'events', 'steelblue');
		plotBar(bar_data, xMap, yMap, 'uniqueEvents', 'coral');
		plotCustomLegend();
		barHover(xMap, yMap);
	}
}

// Sankey functions

function initialiseGraph(d) {
	d.links.forEach(function(elem) { elem['active'] = true });
	updateLinkCount(d);
}

function updateLinkCount(d) {
	d.nodes.forEach(function(elem) {
		elem['sourceLinkCount'] = d.links.filter(x => (x.source.name == elem.name) && x.active).length;
		elem['targetLinkCount'] = d.links.filter(x => (x.target.name == elem.name) && x.active).length;
	});
}

function removeLabels(d) {
	for (var i =0; i < d.nodes.length; i++) {
		if (d.nodes[i].name.startsWith('action')) {
			updateLabelsForAction(d.nodes[i].name, d, 'remove');
		}
	}
}

function updateLabelsForAction(a, d, operation) {
	var actionIdx = getNodeIdx(a, d);
	d.links.filter(x => x.source.index == actionIdx).forEach(function(elem) {
		if (operation == 'add')
			elem['active'] = true;
		else if (operation == 'remove')
			elem['active'] = false;
		else
			throw "Invalid operation";
	});
	updateLinkCount(d);
}

function getNodeIdx(a, d) {
	// get action index
	var actionIdx = -1;
	for (var i = 0; i < d.nodes.length; i++) {
		if (d.nodes[i].name == a) {
			actionIdx = d.nodes[i].index;
			break;
		}
	}

	return actionIdx;
}

function resetSelected(graph) {
	graph.nodes.forEach(function(n) {
		n['selected'] = false;
	});

	graph.links.forEach(function(l) {
		l['selected'] = false;
	});

	d3.select("#title").selectAll('text').remove();
	d3.select("#bar-summary").selectAll('svg').remove();
	d3.select("#bar-chart").selectAll('g').remove();
}

function updateSankey(graph) {
	resetSelected(graph);

	graphPlot = sankey(
		{
			nodes: graph.nodes.filter(x => x.targetLinkCount + x.sourceLinkCount > 0),
			links: graph.links.filter(x => x.active)
		}
	)
	
	var link = drawLinks.selectAll(".link")
		.data(graphPlot.links, function(d) { 
				return d.source.name + "-" + d.target.name;
			});
	
	link.enter().append('path')
			.attr('class', 'link')
		.merge(link)
			.sort(function(a, b) {
				return a.width < b.width;
			})
			.style('opacity', .3)
			.style('fill', 'none')
			.style('stroke', 'gray')
			.on('mouseover', function () {d3.select(this).style('opacity', 0.6)})
			.on('mouseout', function() {d3.select(this).style('opacity', 0.4)})
			.on('click', function (d) { 
					d3.selectAll('.link')
						.style('stroke', function(d_) {
							return d_.source.name === d.source.name && d_.target.name === d.target.name
								? 'sandybrown' : 'gray';
						})
					d['selected'] = true;

					var from_index = graph.nodes.map(x => x.name).indexOf(d.source.name)
					var to_index = graph.nodes.map(x => x.name).indexOf(d.target.name)
					var from = 
						{
							selection: d.source.name, 
							group: graph.nodes[from_index].group
						};

					var to = 
						{
							selection: d.target.name, 
							group: graph.nodes[to_index].group
						};
					updateBarChart( d.source.name + " → " + d.target.name, 'link', from, to);
				})
			.transition().duration(ANIMATION_DURATION)
			.attr('stroke-width', function(d) { 
					return d.width; 
				})
			.attr('d', d3.sankeyLinkHorizontal())

	link.exit().remove()

	var node = drawNodes.selectAll('.node')
		.data(graphPlot.nodes, function(d) { return d.name; });
	
	var drawNode = node.enter().append('g')
			.attr('class', 'node')
			.attr('transform', function(d) {
				return 'translate(' + d.x0 + ',' + d.y0 + ')'
			});

	drawNode.append('rect');
	drawNode.append('text');

	var mergeNode = drawNode.merge(node)
		.on('mouseover', function (d) {
			mergeNode.selectAll('rect').style('fill-opacity', function(d_) {
				return d.name == d_.name ? 1 : .5;
			})
			mergeNode.selectAll('rect').style('stroke-opacity', function(d_) {
				return d.name == d_.name ? 1 : .5;
			})
			mergeNode.selectAll('text').style('opacity', function(d_) {
				return d.name == d_.name ? 1 : .5;
			})
			d3.selectAll('.link')
				.style('opacity', function(d_) {
						return d_.source.name === d.name || d_.target.name === d.name
							? .6 : .4;
					})

		})
		.on('mouseout', function (d) {
			mergeNode.selectAll('text').style('opacity', 1);
			mergeNode.selectAll('rect').style('fill-opacity', 1);
			mergeNode.selectAll('rect').style('stroke-opacity', 1);
			d3.selectAll('.link').style('opacity', .4);
		})
						
	mergeNode.select('rect')
			.attr('width', function (d) {
				return d.x1 - d.x0;	
			})
			.style('fill', function(d) {
				// To have the same color for similar categories (everything before space)
				return color(d.name.replace(/ .*/, ''));
				// return color(d.name);
			})
			.on('click', function (d) {
				// todo: different stuff for category etc.
				if (d.name.startsWith('action')) {
					if (d3.event.ctrlKey) {
						updateLabelsForAction(d.name, graph, d.sourceLinkCount > 0 ? 'remove' : 'add');
						updateSankey(graph);
					}
				}

				if (!d3.event.ctrlKey) {
					resetSelected(graph);

					d3.selectAll('.link')
						.style('stroke', function(d_) {
							var selected = d_.source.name === d.name || d_.target.name === d.name;
							d_['selected'] = selected;
							return selected ? 'sandybrown' : 'dimgray';
						})
						.style('opacity', function(d_) {
							return d_.source.name === d.name || d_.target.name === d.name
								? .6 : .4;
						})

					d['selected'] = true;

					updateBarChart(d.name, d.group);
				}
			})
			.transition().duration(ANIMATION_DURATION)
			.attr('height', function(d) {
					return d.y1 - d.y0;
				})
			.style('fill-opacity', 1.)
			.style('stroke-opacity', 1.);

	mergeNode.select('text')
			.text(function(d) {
				return d.name;
			})
			.attr('x', -6)
			.attr('y', function(d) {
				return (d.y1 - d.y0) / 2;
			})
			.attr('text-anchor', 'end')
			.style('opacity', 1.)
		.filter(function(d) { return d.x0 < widthSankey / 2; })
			.attr('x', function(d) {
				return (d.x1 - d.x0) + 6;
			})
			.attr('text-anchor', 'start');
	
	mergeNode.transition().duration(ANIMATION_DURATION)
		.attr('transform', function(d) {
			return 'translate(' + d.x0 + ',' + d.y0 + ')'
		});


	node.exit().remove();
}

function initialiseSankey(d) {
	graph = sankey(d);
	initialiseGraph(graph);
	removeLabels(graph);
	updateSankey(graph);
}

// -- main --

// Bar
var barWidth = 400;
var barHeight = 250;
var marginBar = {top:20, left:75, bottom:20, right:120};
var svgBar = d3.select('#bar-chart').append('svg')
	.attr('width', barWidth)
	.attr('height', barHeight);

// Sankey
var widthSankey = 900;
var heightSankey = 600;
var marginSankey = { top:20, left:20, bottom:20, right:20 };

var svgSankey = d3.select('#sankey-container')
	.append('svg')
	.attr('width', widthSankey)
	.attr('height', heightSankey);

var drawLinks = svgSankey.append('g')
var drawNodes = svgSankey.append('g')

var sankey = d3.sankey()
	.nodeWidth(15)
	.nodePadding(10)
	.nodeAlign(d3.sankeyLeft)
	.extent([
				[marginSankey.left, marginSankey.top],
				[widthSankey - marginSankey.left - marginSankey.right, heightSankey - marginSankey.top - marginSankey.bottom]
			]);

var color = d3.scaleOrdinal(d3.schemeCategory20);
var ANIMATION_DURATION = 500;
var graph = null;
var graphPlot = null;

// Load data

var graph_data = null;
var table_data = null;

var q = d3.queue();

q.defer(d3.json, 'rng_graph.json');
q.defer(d3.csv, 'rng_data.csv', function (d) { 
	d.uniqueEvents = +d.uniqueEvents;
	d.events = +d.events;
	return d; 
});

q.awaitAll(function(e, ds) {
	if (e) throw e;

	graph_data = ds[0];
	table_data = ds[1];

	initialiseSankey(graph_data);
	d3.select("body").on("keydown", function() {
		if (d3.event.keyCode == 82) {
			initialiseSankey(graph_data);
		}
	})
})
