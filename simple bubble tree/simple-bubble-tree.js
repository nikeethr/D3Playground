var rMax = 70; // radius of main circle
var rMin = 4; // radius of main circle

var width = 1400;
var height = 1000;
var height_circle = 1000;
var width_circle = 1050;

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
			+ (width_circle / 2) + ','
			+ (height_circle / 2) + ')');

	// level 1 - ring
	gTree.append('circle')
		.attr('class', 'level-one-ring')
		.attr("cx", 0)
		.attr("cy", 0)
		.attr('r', r1);


	var treeEnter = gTree.selectAll('.tree')
		.data(d.group)
		.enter();

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

	var colors = d3.scaleOrdinal(d3.schemeCategory10)
		.domain(d.group.map(x => x.name));

	treeEnter.append('circle')
		.attr('class', 'level-one-circle')
		.attr("cx", function(d, i) { return r1 * Math.cos(delTheta * (i - 0.5)); })
		.attr("cy", function(d, i) { return r1 * Math.sin(delTheta * (i - 0.5)); })
		.attr('r', function(d, i) { return rMap(d.views); } )
		.attr('fill', function(d, i) { return colors(d.name); } );

	// draw level 2 - circles

	var gLevelTwoData = gLevelTwo.selectAll('.nodes')
		.data(function(d) { return d.group; })
		.enter()
		.append('g')
			.attr("transform", function(d, i) {
				var sign = i % 2 ? 1 : -1;
				var theta = -Math.PI / 2 + sign * delThetaLevelTwo * Math.ceil(i / 2);
				var x = r2 * Math.cos(theta);
				var y = r2 * Math.sin(theta);
				theta = theta / Math.PI * 180;
				return "translate(" + x + "," + y + ")" + "rotate(" + theta + ")";
			});

	gLevelTwoData.append('circle')
		.attr('class', 'level-two-circle-outline')
		.attr('r', function(d, i) { return rMap(d.views); } )
		.attr('stroke', function(d, i) { 
				var elem = d3.select(this.parentElement.parentElement);
				return colors(elem.datum().name);
			})
		.attr('stroke-opacity', .5);

	// Category

	treeEnter.append('text')
		.attr("class", "text-level-one")
		.attr("transform", function(d, i) {
			var x = (rMax + 4) * Math.cos(delTheta * (i - 0.5));
			var y = (rMax + 4) * Math.sin(delTheta * (i - 0.5));
			var theta = delTheta * (i - 0.5) / Math.PI * 180;
			return "translate(" + x + "," + y + ")" + "rotate(" + theta + ")";
		})
		.attr("dy", -2)
		.text(function(d) { return d.name; });

	// Page title

	gLevelTwoData
		.append('text')
			.attr("transform", function(d, i) {
					var x = rMap(d.views) + 2 // shift by radius + padding
					var sign = i % 2 ? -1 : 1;
					var theta = 0.3 * sign * delThetaLevelTwo * Math.ceil(i / 2);
					theta = theta / Math.PI * 180;
					return "translate(" + x + ",0)" + "rotate(" + theta + ")";
				})
		   .attr("class", "text-level-two")
		   .text(function(d) { return d.name; });

	// Title - main circle
	gTree.append('text')
		.attr('class', 'text-main')
		.text('MELB')

	// Legend
	gLegend = svg.append('g')
		.attr('transform', 'translate(' + 1000 + ',' + 200  + ')')

	legendData = d.group.map(x => x.name).concat('Page Title');
	legendColors = d3.scaleOrdinal(d3.schemeCategory10.slice(0, legendData.length - 1).concat("#fff"))
		.domain(legendData);

	legendMap = d3.scaleBand()
		.rangeRound([0, 100])
		.domain(legendData)
		.padding(.1)

	gLegendElem = gLegend.selectAll('.legend')
		.data(legendData)
		.enter().append('g')
			.attr('transform', function(d, i) {
				var x = 0;
				var y = legendMap(d);
				return 'translate(' + x + ',' + y + ')';
			})

	gLegendElem.append('circle')
		.attr('r', 4)
		.attr('fill', function(d) {
				return legendColors(d);
			})
		.attr('stroke', function (d) {
				return d == "Page Title" ? 'grey' : 'none';
			});

	gLegendElem.append('text')
		.attr('class', 'text-legend')
		.attr('x', 6)
		.text(function(d) { return d });

	// Scale
	var axisMap = d3.scalePow()
		.exponent(1.5)
		.domain([minVal, maxVal])
		.range([0, 200])

	
	var gAxis = gLegend.append('g')
		.attr('transform', 'translate(' + 140 + ',' + 0 + ')');

	var numCirclePoints = 5;
	circleDatum = [];

	for (var i = 0; i <= numCirclePoints; i++) {
		circleDatum.push((maxVal - minVal) / numCirclePoints * i + minVal);
	}

	gAxis.selectAll('.circle-legend')
		.data(circleDatum)
		.enter()
		.append('circle')
			.attr('class', 'circle-legend')
			.attr('r', function(d) { return rMap(d) + 2; })
			.attr('cx', (rMap(maxVal) + 5))
			.attr('cy', function(d) { return axisMap(d); });

	gAxis.selectAll('.line-legend')
		.data(circleDatum)
		.enter()
		.append('line')
			.attr('class', 'line-legend')
			.attr('x1', 0)
			.attr('x2', (rMap(maxVal) + 5))
			.attr('y1', function(d) { return axisMap(d); })
			.attr('y2', function(d) { return axisMap(d); });

	gAxis.selectAll('.x-legend')
		.data(circleDatum)
		.enter()
		.append('text')
			.attr('class', 'text-x-legend')
			.attr('x', (rMap(maxVal) + 5))
			.attr('y', function(d) { return axisMap(d); })
			.text('x');

	var tickValues = d3.range(minVal, maxVal, Math.floor((maxVal - minVal) / numCirclePoints))
	tickValues = tickValues.map(x => x.toPrecision(2))

	var axis = d3.axisLeft(axisMap)
		.tickValues(tickValues);

	gAxis.call(axis);
	gAxis.append('text')
		.attr('class', 'text-legend')
		.attr('y', function(d) { return axisMap(maxVal) + 6; })
		.text('unique pageviews');
}

// - main -
d3.json('data/data.json', function(e, d) {
	if (e) throw e;
	console.log(d)
	plotTree(d);
})
