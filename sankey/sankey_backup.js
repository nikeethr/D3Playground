// global
var width = 900;
var height = 600;
var margin = { top:20, left:20, bottom:20, right:20 };

var svg = d3.select('body')
	.append('svg')
	.attr('width', width)
	.attr('height', height)

// functions
function plotSankey(d) {
	var sankey = d3.sankey()
		.nodeWidth(15)
		.nodePadding(10)
		.extent([
					[margin.left, margin.top],
				 	[width - margin.left - margin.right, height - margin.top - margin.bottom]
				])

	var graph = sankey(d);
	console.log(graph);

	var color = d3.scaleOrdinal(d3.schemeCategory20);

	var drawLinks = svg.append('g')
	
	var drawNodes = svg.append('g')
	
	drawLinks.selectAll('path')
		.data(graph.links)
		.enter().append('path')
			.sort(function(a, b) {
				return a.width < b.width;
			})
			.attr('d', d3.sankeyLinkHorizontal())
			.attr('class', 'link')
			.style('stroke-width', function(d) { 
				return d.width; 
			});
	
	var drawNode = drawNodes.selectAll('.node')
		.data(graph.nodes)
		.enter().append('g')
			.attr('transform', function(d) {
				return 'translate(' + d.x0 + ',' + d.y0 + ')';
			})
			.attr('class', 'node')

	drawNode
		.append('rect')
			.attr('width', function (d) {
				return d.x1 - d.x0;	
			})
			.attr('height', function(d) {
				return d.y1 - d.y0;
			})
			.style('fill', function(d) {
				// To have the same color for similar categories (everything before space)
				return color(d.name.replace(/ .*/, ''));
				// return color(d.name);
			})
	
	drawNode
		.append('text')
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
}

// main
d3.json('data/rng_graph.json', function(e, d) {
	if (e) throw e;
	plotSankey(d)
});
