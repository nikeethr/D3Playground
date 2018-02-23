//  -- Global Variables --


// [Bar Plot]
var svgBar = d3.select("#chart_bar")
	.append("svg")
	.attr("width", 850)
	.attr("height", 500);

// [Box Plot]
var svgBox = d3.select("#chart_box")
	.append("svg")
	.attr("width", 300)
	.attr("height", 300);

//  -- Functions --

// [Box Plot]

function DrawBoxPlot() {
	d = {
		median:50,
		lowerBox:40,
		upperBox:80,
		lowerQuart:20,
		upperQuart:100,
		outliers:[5,8,110,120,125]
	};


	var height = svgBox.attr("height");
	var width = svgBox.attr("width");
	var margin = {t:100, r:20, b:100, l:20};
	var heightIn = height - margin.t - margin.b;
	var widthIn = width - margin.r - margin.l;

	var minX = 0, maxX = 140;
	var xAxis = d3.scaleLinear()
		.rangeRound([margin.l, widthIn])
		.domain([minX, maxX]);

	// plot rect
	var gBox = svgBox.append("g");
	var boxHeight = 20;

	// median box
	gBox.append("rect")
		.attr("x", xAxis(d.lowerBox))
		.attr("y", margin.t)
		.attr("width", xAxis(d.upperBox) - xAxis(d.lowerBox))
		.attr("height", boxHeight)
		.attr("class", "medianbox");

	gBox.append("line")
		.attr("x1", xAxis(d.median))
		.attr("y1", margin.t)
		.attr("x2", xAxis(d.median))
		.attr("y2", margin.t + boxHeight)
		.attr("class", "medianline")
	
	// whiskers
	gBox.append("line")
		.attr("x1", xAxis(d.lowerQuart))
		.attr("y1", margin.t + boxHeight/2)
		.attr("x2", xAxis(d.lowerBox))
		.attr("y2", margin.t + boxHeight/2)
		.attr("class", "medianline")

	gBox.append("line")
		.attr("x1", xAxis(d.upperBox))
		.attr("y1", margin.t + boxHeight/2)
		.attr("x2", xAxis(d.upperQuart))
		.attr("y2", margin.t + boxHeight/2)
		.attr("class", "medianline")

	gBox.append("line")
		.attr("x1", xAxis(d.lowerQuart))
		.attr("y1", margin.t + boxHeight - boxHeight/16)
		.attr("x2", xAxis(d.lowerQuart))
		.attr("y2", margin.t + boxHeight/16)
		.attr("class", "medianline")

	gBox.append("line")
		.attr("x1", xAxis(d.upperQuart))
		.attr("y1", margin.t + boxHeight - boxHeight/16)
		.attr("x2", xAxis(d.upperQuart))
		.attr("y2", margin.t + boxHeight/16)
		.attr("class", "medianline");


	// outliers
	gBox.selectAll(".outliers")
		.data(d.outliers)
		.enter().append("circle")
		.attr("cx", function(d) { return xAxis(d); })
		.attr("cy", margin.t + boxHeight/2)
		.attr("r", 3)
		.attr("class", "outliercircle")

	// axis
	var axisPadding = 5;
	gBox.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + (margin.t + boxHeight + axisPadding) + ")")
		.call(d3.axisBottom(xAxis).ticks(4))
		.append("text")
		.attr("fill", "#000")
		.attr("font-weight", "bold")
		.attr("y", -10)
		.attr("x", widthIn)
		.attr("dy", "0.71em")
		.attr("text-anchor", "end")
		.text("Sessions");


	return;
}

function RemoveBoxPlot() {
	d3.select("#chart_box").selectAll("*").remove();
}

// [Stacked Bar]
function DrawStackedBar(dStack) {
	var height = svgBar.attr("height");
	var width = svgBar.attr("width");
	var margin = {t:100, r:20, b:100, l:100};
	var heightIn = height - margin.t - margin.b;
	var widthIn = width - margin.r - margin.l;
	var colorScheme = d3.schemeCategory10;


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
	
	svgBar.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + (heightIn + axisPadding) + ")")
		.call(d3.axisBottom(xAxis))
		.append("text")
		.attr("fill", "#000")
		.attr("font-weight", "bold")
		.attr("y", -10)
		.attr("x", widthIn)
		.attr("dy", "0.71em")
		.attr("text-anchor", "end")
		.text("Sessions");


	svgBar.append("g")
		.attr("class", "axis axis--y")
		.attr("transform", "translate(" + (margin.l - axisPadding) + ",0)")
		.call(d3.axisLeft(yAxis))
		.append("text")
		.attr("fill", "#000")
		.attr("font-weight", "bold")
		.attr("y", margin.t - 10)
		.attr("dy", "0.71em")
		.attr("text-anchor", "end")
		.text("Social Media");

	function handleBarMouseOver(d, i) {
		elem = d3.select(this);
		svgBar.selectAll(".bar").style("opacity", .2);
		elem.style("opacity", 1.);
	}

	function handleBarMouseOut(d, i) {
		svgBar.selectAll(".bar").style("opacity", 1.);
	}
	
	svgBar.selectAll(".bar")
		.data(dStack)
		.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d) { return xAxis(d.stackStart); })
			.attr("y", function(d) { return yAxis(d.fPri); })
			.attr("width", function(d) { return xAxis(d.stackEnd) - xAxis(d.stackStart); })
			.attr("height", yAxis.bandwidth())
			.style("fill", function(d) { return colorMap(d.fSec); })
			.on("mouseover", handleBarMouseOver)
			.on("mouseout", handleBarMouseOut);

	var lgdPadding = 3;
	var lgdHeight = 15;
	var lgdWidth = 20;

	// todo: append group before rect to make relative positions

	var legendGroup = svgBar.append("g")
		.attr("transform", "translate(" + (widthIn + 20) + "," + (margin.t + 5) + ")");

	legendGroup.selectAll(".legendbar")
		.data(uniquefSec)
		.enter().append("rect")
			.attr("class", "legend")
			.attr("y", function(d, i) { return (lgdHeight + lgdPadding) * i; })
			.attr("width", lgdWidth)
			.attr("height", lgdHeight)
			.style("fill", function(d) { return colorMap(d);});

	legendGroup.selectAll(".legendtext")
		.data(uniquefSec)
		.enter().append("text")
			.attr("font-family", "sans-serif")
			.attr("font-size", "10")
			.attr("fill", "#000")
			.attr("x", lgdWidth + 2)
			.attr("y", function(d, i) { return (lgdHeight + lgdPadding) * i;})
			.attr("dy", "1.2em")
			.text(function(d) { return d; })
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
}

// Main
d3.csv("x.csv",
	function(d) {
		return {
			sn: d["Social Network"],
			rp: d["Relevant Pages"],
			s: +d["Sessions"]
		};
	}, 
	function(e, d) {
		if(e) throw e;
		dStack = StackBars("sn", "rp", "s", d);
		DrawStackedBar(dStack);
		DrawBoxPlot();
	}
);
