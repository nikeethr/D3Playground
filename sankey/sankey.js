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

function updateSankey(graph) {
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
			})
			.transition().duration(ANIMATION_DURATION)
			.attr('height', function(d) {
					return d.y1 - d.y0;
				});

	mergeNode.select('text')
			.text(function(d) {
				return d.name;
			})
			.attr('x', -6)
			.attr('y', function(d) {
				return (d.y1 - d.y0) / 2;
			})
			.attr('text-anchor', 'end')
		.filter(function(d) { return d.x0 < width / 2; })
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

// main

var width = 900;
var height = 600;
var margin = { top:20, left:20, bottom:20, right:20 };

var svg = d3.select('body')
	.append('svg')
	.attr('width', width)
	.attr('height', height);

var drawLinks = svg.append('g')
var drawNodes = svg.append('g')

var sankey = d3.sankey()
	.nodeWidth(15)
	.nodePadding(10)
	.nodeAlign(d3.sankeyLeft)
	.extent([
				[margin.left, margin.top],
				[width - margin.left - margin.right, height - margin.top - margin.bottom]
			]);

var color = d3.scaleOrdinal(d3.schemeCategory20);
var ANIMATION_DURATION = 500;
var graph = null;
var graphPlot = null;

d3.json('data/rng_graph.json', function(e, d) {
	if (e) throw e;

	graph = sankey(d);
	initialiseGraph(graph);
	removeLabels(graph);
	updateSankey(graph);
});
