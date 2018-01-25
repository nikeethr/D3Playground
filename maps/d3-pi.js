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

	var innerArc = gPie.selectAll("arc")
		.data(pie(d))
		.enter()
		.append("g")
		.attr("class", "arc")

	var sumViews = d3.sum(d.map(x => x['ScreenViews']));

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
	}

	function handleInnerArcMouseout(d, i) {
		d3.select(this)
		innerArc.selectAll("path")
			.style("opacity", 1.)
		d3.select("#explanation").style("visibility", "hidden");
	}
	
	innerArc.append("path")
		.attr("d", path)
		.attr("fill", function(d, i) { return color(i); })
		.on("mouseover", handleInnerArcMouseover)
		.on("mouseout", handleInnerArcMouseout);
}


function DrawOuterArc(d, svg) {
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
