var rMax = 70; // radius of main circle
var rMin = 4; // radius of main circle

var width = 1200;
var height = 1200;

svg = d3.select("#tree").append("svg")
	.attr('width', width)
	.attr('height', height);

// - tree functions -

function plotTree(d) {
	var maxVal = d.views;
	var minVal = d3.min(d.group.map(x => d3.min(x.group.map(x => x.views))));

	var rMap = d3.scaleLinear()
		.domain([minVal, maxVal])
		.range([rMin, rMax])
		.clamp(false)
	
	var r1Padding = 50;
	var r1 = 2 * rMax + r1Padding; // radius of first level ring
	var r2 = r1 * 0.7;

	var gTree = svg.append('g')
		.attr('transform', 'translate('
			+ (width / 2) + ','
			+ (height / 2) + ')');

	// level 1 - ring
	gTree.append('circle')
		.attr('class', 'level-one-ring')
		.attr("cx", 0)
		.attr("cy", 0)
		.attr('r', r1);


	var treeEnter = gTree.selectAll('.tree')
		.data(d.group)
		.enter()

	// level 1 - links
	
	var delTheta = 2 * Math.PI / d.group.length;

	treeEnter.append('line')
		.attr("class", "links")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function(d, i) { return r1 * Math.cos(delTheta * (i - 0.5)); })
		.attr("y2", function(d, i) { return r1 * Math.sin(delTheta * (i - 0.5)); });

	// level 2 - ring

	gLevelTwo = treeEnter.append('g')
		.attr('transform', function(d ,i) {
			var x = r1 * Math.cos(delTheta * (i - 0.5));
			var y = r1 * Math.sin(delTheta * (i - 0.5));
			return 'translate(' + x + ',' + y + ') rotate(' + ((delTheta * (i-0.5) + Math.PI / 2) / Math.PI * 180) + ')';
		});
	

	var arc = d3.arc().outerRadius(r2)
		.innerRadius(0)
		.startAngle(-Math.PI / 3)
		.endAngle(Math.PI / 3);

	gLevelTwo.append("path")
		.attr("class", "level-two-arc")
		.attr("d", arc);
		
	// level 2 - links
	var maxItemsLevelTwo = d3.max(d.group.map(x => x.group.length));
	var maxViewsLevelTwo = d3.max(d.group.map(x => d3.max(x.group.map(x => x.views))));
	var delThetaLevelTwo =  d3.min([2 * Math.PI / 3 / maxItemsLevelTwo, 2 * Math.asin(rMap(maxViewsLevelTwo) / r2)]);

	gLevelTwo.selectAll('.links')
		.data(function(d) { return d.group; })
		.enter()
		.append('line')
			.attr("class", "level-two-links")
			.attr("x1", 0)
			.attr("y1", 0)
			.attr("x2", function(d, i) { 
				var sign = i % 2 ? 1 : -1;
				return r2 * Math.cos(-Math.PI / 2 + sign * delThetaLevelTwo * Math.ceil(i / 2));
			})
			.attr("y2", function(d, i) { 
				var sign = i % 2 ? 1 : -1;
				return r2 * Math.sin(-Math.PI / 2 + sign * delThetaLevelTwo * Math.ceil(i / 2));
			});

	// draw level 1 - circles
	
	gTree.append('circle')
		.attr('class', 'main-circle-outline')
		.attr("cx", 0)
		.attr("cy", 0)
		.attr('r', rMax + 2);

	gTree.append('circle')
		.attr('class', 'main-circle')
		.attr("cx", 0)
		.attr("cy", 0)
		.attr('r', rMax);

	treeEnter.append('circle')
		.attr('class', 'level-one-circle-outline')
		.attr("cx", function(d, i) { return r1 * Math.cos(delTheta * (i - 0.5)); })
		.attr("cy", function(d, i) { return r1 * Math.sin(delTheta * (i - 0.5)); })
		.attr('r', function(d, i) { return rMap(d.views) + 2; } );

	treeEnter.append('circle')
		.attr('class', 'level-one-circle')
		.attr("cx", function(d, i) { return r1 * Math.cos(delTheta * (i - 0.5)); })
		.attr("cy", function(d, i) { return r1 * Math.sin(delTheta * (i - 0.5)); })
		.attr('r', function(d, i) { return rMap(d.views); } );
	
	// draw level 2 - circles
	gLevelTwo.selectAll('.nodes')
		.data(function(d) { return d.group; })
		.enter()
		.append('circle')
			.attr('class', 'level-two-circle-outline')
			.attr("cx", function(d, i) { 
					var sign = i % 2 ? 1 : -1;
					return r2 * Math.cos(-Math.PI / 2 + sign * delThetaLevelTwo * Math.ceil(i / 2));
				})
			.attr("cy", function(d, i) { 
				var sign = i % 2 ? 1 : -1;
				return r2 * Math.sin(-Math.PI / 2 + sign * delThetaLevelTwo * Math.ceil(i / 2));
			})
			.attr('r', function(d, i) { return rMap(d.views); } );
}

// - main -
d3.json('data/data.json', function(e, d) {
	if (e) throw e;
	console.log(d)
	plotTree(d);
})
