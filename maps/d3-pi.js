var width = 960;
var height = 500;
var color = d3.scaleOrdinal(d3.schemeCategory20);
const numberWithCommas = 
(x) => {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function PreprocessData(d) {
	return d;
}

function CombineLowContributers(d) {
}

function GetScreenDurationExtremes(d) {
}

function DrawInnerArc(d, svg) {
	var radius = 100;
	var thickness = 40;

	var path = d3.arc()
		.innerRadius(radius - thickness/2)
		.outerRadius(radius + thickness/2);

	var pie = d3.pie()
		.sort(null)
		.value(function(d) { return d["ScreenViews"]; });

	var gPie = svg.append("g")
		.attr("transform",
			  "translate(" + width/2 + "," + height/2 + ")");

	var innerArc = gPie.selectAll("innerArc")
		.data(pie(d))
		.enter()
		.append("g")
		.attr("class", "arc")

	var sumViews = d3.sum(d.map(x => x['ScreenViews']));
	var maxDuration = 300;

	function handleInnerArcMouseover(d, i) {
		elem = d3.select(this)

		innerArc.selectAll("path").style("opacity", .2);
		elem.style("opacity", 1.);

		var percentage = (100 * d.value / sumViews).toPrecision(3);
		var percentageString = 
			percentage >= 1
			? percentage + "%"
			: "<1%" ;

		var usersString = d.value.toLocaleString() + " users";
		
		d3.select("#screenname").text(d.data['ScreenName'])
		d3.select("#percentage").text(percentageString);
		d3.select("#numusers").text(usersString);
		d3.select("#explanation").style("visibility", "");
		d3.select("#duration").style("visibility", "");

		DrawOuterArc(d, gPie, maxDuration);
	}

	function handleInnerArcMouseout(d, i) {
		d3.select(this)
		innerArc.selectAll("path")
			.style("opacity", 1.)
		d3.select("#explanation").style("visibility", "hidden");
		d3.select("#duration").style("visibility", "hidden");

		RemoveOuterArc(gPie);
	}
	
	innerArc.append("path")
		.attr("d", path)
		.attr("fill", function(d, i) { return color(i); })
		.on("mouseover", handleInnerArcMouseover)
		.on("mouseout", handleInnerArcMouseout);
}

function RemoveOuterArc(svg) {
	svg.selectAll("#outerArc").remove();
}

function DrawOuterArc(d, svg, tD) {
	var radius = 140;
	var thickness = 16;

	var data = [d.data.ScreenDuration, tD - d.data.ScreenDuration];

	var path = d3.arc()
		.innerRadius(radius - thickness/2)
		.outerRadius(radius + thickness/2);

	var pie = d3.pie()
		.sort(null)
		.value(function(d) { return d3.max([d3.min([d, tD]), 0]); });

	var outerArc = svg.selectAll("outerArc")
		.data(pie(data))
		.enter()
		.append("g")
		.attr("class", "arc")
		.attr("id", "outerArc");

	var outerArcCol = ["#fe9929", "#bababa"] ;

	outerArc.append("path")
		.attr("d", path)
		.attr("fill", function(d, i) { return outerArcCol[i % 2]; });

	var durationStr = 
		d.data.ScreenDuration > tD
		? '>' + tD + ' min'
		: d.data.ScreenDuration + ' min';

	d3.select("#duration").text(durationStr);
}

d3.csv("screen.csv",
	function(d) {
		return {
			ScreenName: d.ScreenName,
			ScreenViews: +d.ScreenViews,
			ScreenDuration: +d.ScreenDuration
		};
	}, 
	function(e, d) {
		if (e) throw e;
		var data = PreprocessData(d);
		var svg = d3.select("#chart")
			.append("svg")
			.attr("width", width)
			.attr("height", height);
		DrawInnerArc(data, svg);
	}
);
