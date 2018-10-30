// Replace with your view ID.
var VIEW_ID = "170565291";
var NUM_DAYS = 7;

width = 300;
height = 200;

var svg = d3.select("#bar-chart")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

var margin = { t:20, l:20, b:20, r:20 };
var widthIn = width - margin.l - margin.r;
var heightIn = height - margin.t - margin.b;

// Query the API and print the results to the page.
function queryReports() {
gapi.client.request({
	path: "/v4/reports:batchGet",
	root: "https://analyticsreporting.googleapis.com/",
	method: "POST",
	body: {
		reportRequests: [
				{
					viewId: VIEW_ID,
					dateRanges: [
						{ startDate: "7daysAgo", endDate: "today" }
					],
					metrics: [
						{ expression: "ga:sessions" }
					],
					dimensions: [
						{ name: "ga:date" }
					]
				}
			]
		}
	}).then(plotSessions, console.error.bind(console));
}

function plotSessions(response) {
	var data = response.result.reports[0]["data"];
	var sessions = data["rows"].map(x => +x["metrics"][0]["values"][0]);

	var days = [];
	for (var i = 0; i < NUM_DAYS; i++) days.push(i+1)

	// Test 1: PASS
	// var sessions = [1,2,3,4,5,6,7,8,9];

	// Test 2: PASS
	// var sessions = [1,2,3,4,5];

	// Test 3: PASS
	// var sessions = [1,2,3,4,5,6,7];

	console.log("before:" + sessions.toString());
	if (sessions.length > NUM_DAYS) {
		// slice off excess
		sessions = sessions.slice(sessions.length - NUM_DAYS, sessions.length);
	} else if (sessions.length < NUM_DAYS) {
		// add leading zeros
		var leadingZeros = [];
		for (var i = 0; i < (NUM_DAYS - sessions.length); i++) leadingZeros.push(0);
		sessions = leadingZeros.concat(sessions);
	}
	console.log("after:" + sessions.toString());
		
	var xMap = d3.scaleBand()
		.rangeRound([margin.l, widthIn])
		.domain(days)
		.padding(0.1);

	var yMap = d3.scaleLinear()
		.rangeRound([heightIn, margin.t])
		.domain([d3.min(sessions), d3.max(sessions)]);

	var axisPadding = 4;

	var xAxisGroup = svg.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + heightIn + ")")
		.call(d3.axisBottom(xMap)
				.ticks(NUM_DAYS)
				.tickSizeOuter(0));

	var yAxisGroup = svg.append("g")
		.attr("class", "axis axis--y")
		.attr("transform", "translate(" + margin.l + ",0)")
		.call(d3.axisRight(yMap)
				.ticks(2)
				.tickSize(widthIn)
				.tickFormat(function(d) {
					return this.parentNode.nextSibling
						? d
						: d + " Sessions";
				}));
	
	// todo: remove axis labels

	// todo: append text
	xAxisGroup.selectAll("text").remove();
	yAxisGroup.select(".domain").remove();
	yAxisGroup.selectAll(".tick text").attr("x", 2).attr("dy", -4);
	yAxisGroup.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");

	// bar chart
	chartData = sessions.map(function(v, i) { 
		return {x:days[i], y:v};
	});

	console.log(chartData)

	var barGroup = svg.append("g");
	barGroup.selectAll(".bar")
		.data(chartData).enter()
		.append("rect")
			.attr("class", "bar")
			.attr("x", function(d) { return xMap(d.x); })
			.attr("y", function(d) { return yMap(d.y); })
			.attr("width", xMap.bandwidth())
			.attr("height", function(d) { return yMap(d3.min(sessions)) - yMap(d.y); } );
}

// todo: save the result somewhere rather than display

/*
function displayResults(response) {
	var formattedJson = JSON.stringify(response.result, null, 2);
	document.getElementById("query-output").value = formattedJson;
}
*/
