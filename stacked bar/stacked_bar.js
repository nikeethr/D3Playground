// Globals

var width = 960;
var height = 500;
var svg = d3.select("#chart")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

var margin = {t:100, r:100, b:100, l:100};
var heightIn = height - margin.t - margin.b;
var widthIn = width - margin.r - margin.l;
var colorScheme = d3.schemeCategory10;

// Functions
function DrawStackedBar(dStack) {
	var uniquefPri = Array.from(new Set(dStack.map(x => x.fPri)));
	var uniquefSec = Array.from(new Set(dStack.map(x => x.fSec)));

	var maxStackEnd = d3.max(dStack.map(x => x.stackEnd));
	
	var colorMap = d3.scaleOrdinal(colorScheme)
		.domain(uniquefSec);

	var yAxis = d3.scaleBand()
		.rangeRound([margin.t, heightIn])
		.domain(uniquefPri)
		.padding(0.1);

	var xAxis = d3.scaleLinear()
		.rangeRound([margin.l, widthIn])
		.domain([0, maxStackEnd]);

	var axisPadding = 5;
	
	svg.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + (heightIn + axisPadding) + ")")
		.call(d3.axisBottom(xAxis));

	svg.append("g")
		.attr("class", "axis axis--y")
		.attr("transform", "translate(" + (margin.l - axisPadding) + ",0)")
		.call(d3.axisLeft(yAxis));
	
	svg.selectAll(".bar")
		.data(dStack)
		.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d) { return xAxis(d.stackStart); })
			.attr("y", function(d) { return yAxis(d.fPri); })
			.attr("width", function(d) { return xAxis(d.stackEnd) - xAxis(d.stackStart); })
			.attr("height", yAxis.bandwidth())
			.style("fill", function(d) { return colorMap(d.fSec); });

	return;
}

function StackBars(fPri, fSec, m, d) {
	function SortFeatures(f, m, d, asc = true) {
		var fList = [];
		var fUnique = new Set(d.map(x => x[f]))	

		fUnique.forEach(function(v) {
			console.log(v);
			var sum = 0;
			for (i = 0; i < d.length; i++) {
				if (d[i][f] == v) {
					sum += d[i][m];
				}
			}

			fList.push({k: v, v: sum});
		});

		if (asc)
			fList.sort(function(a, b) { return a.v < b.v; });
		else 
			fList.sort(function(a, b) { return a.v > b.v; });

		return fList;
	}

	var fPriUnique = SortFeatures(fPri, m, d);
	var fSecUnique = SortFeatures(fSec, m, d);

	var dStack = [];

	for (i = 0; i < fPriUnique.length; i++) {
		var vStart = 0;
		for (j = 0; j < fSecUnique.length; j++) {
			for (k = 0; k < d.length; k++) {
				if (d[k][fPri] == fPriUnique[i].k &&
					d[k][fSec] == fSecUnique[j].k) {
					var vEnd = vStart + d[k][m];
					dStack.push({
						fPri: fPriUnique[i].k,
						fSec: fSecUnique[j].k,
						stackStart: vStart,
						stackEnd: vEnd
					});

					vStart = vEnd;
				}
			}
		}
	}

	console.log(dStack)

	return dStack;

	// sort fPri metric to get stack order
	// for each fSec, stack bars and add to list
	// sort fSec by metric to get bar order
}

// Main
d3.csv('x.csv',
	function(d) {
		return {
			sn: d["Social Network"],
			rp: d["Relevant Pages"],
			s: +d["Sessions"]
		};
	}, 
	function(e, d) {
		if(e) throw e;
		dStack = StackBars('sn', 'rp', 's', d);
		DrawStackedBar(dStack);
	}
);
