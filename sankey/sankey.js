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

function resetSelected(graph) { graph.nodes.forEach(function(n) {
		n['selected'] = false;
	});

	graph.links.forEach(function(l) {
		l['selected'] = false;
	});
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

// main

var widthSankey = 900;
var heightSankey = 600;
var marginSankey = { top:20, left:20, bottom:20, right:20 };

var svgSankey = d3.select('body')
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

d3.json('data/rng_graph.json', function(e, d) {
	if (e) throw e;
	initialiseSankey(d);
	d3.select("body").on("keydown", function() {
		if (d3.event.keyCode == 82) {
			initialiseSankey(d);
		}
	})
});
