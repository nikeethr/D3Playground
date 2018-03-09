// -- globals --
firstChartXPadding = 60;

var width = 250;
var widthFC = width + firstChartXPadding;
var height = 500;
var heightLeading = 150;

var m = {t:20, l:40, b:20, r:20};
var mFC = {t:20, l:m.l + firstChartXPadding, b:20, r:20};
var mL = {t:10, l:30, b:10, r:0};
var mLFC = {t:10, l:mL.l + firstChartXPadding, b:10, r:0};

var svgCollection = 
{
	users: d3.select('#chart-users').append('svg').attr('width', width).attr('height', height),
	sessions: d3.select('#chart-sessions').append('svg').attr('width', width).attr('height', height),
	pageviews: d3.select('#chart-pageviews').append('svg').attr('width', width).attr('height', height)
};

// -- helpers --
function parseFloatAnySeparator(str) {
	str = str.replace(new RegExp('[^0-9.]','g'),'');
    return parseFloat(str);
}

function parseFloatSeparator(str, sep) {
	str = str.replace(new RegExp(sep, 'g'), '');
    return parseFloat(str);
}

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// -- chart functions --

function plotLeadingBarChart(metric, svg, dataBefore, dataEvent, dataAfter, first) {
	var heightOther = height - heightLeading;
	var MAIN_BAR_HEIGHT = Math.floor(heightOther / 25);
	var MAIN_BAR_HEIGHT_HEAD = MAIN_BAR_HEIGHT * 1.5;
	var ROWS_OTHER = dataEvent.length - 1;


	var gTitle = svg.append('g');

	// title
	var titleYOffset = 40;
	var titleXOffset = first ? widthFC * .6 : width * .6;
	gTitle.append('text')
		.attr('class', 'title-text')
		.attr('x', titleXOffset)
		.attr('y', titleYOffset)
		.attr('text-anchor', 'end')
		.text(metric);

	// legend - belongs in title
	var legendLineX = titleXOffset + 4;
	var legendStartY = titleYOffset - 28;
	var legendEndY = titleYOffset + 8
	gTitle.append('line')
		.attr('class', 'legend-line')
		.attr('x1', legendLineX)
		.attr('y1', legendStartY)
		.attr('x2', legendLineX)
		.attr('y2', legendEndY);

	legendData = ['during event', 'before event', 'after event'];
	var legendMap = d3.scaleBand()
		.rangeRound([legendStartY, legendEndY])
		.domain(legendData)
		.padding(.1)

	gTitle.selectAll('.legend-bar')
		.data(legendData).enter()
		.append('rect')
			.attr('class', function(d, i) {
				switch(i) {
					case 0: return 'bar-event';
					case 1: return 'bar-before';
					case 2: return 'bar-after';
				}})
			.attr('x', legendLineX + 4)
			.attr('y', legendMap)
			.attr('width', legendMap.bandwidth())
			.attr('height', legendMap.bandwidth());

	gTitle.selectAll('.legend-text')
		.data(legendData).enter()
		.append('text')
			.attr('class', 'legend-text')
			.attr('x', legendLineX + legendMap.bandwidth() + 6)
			.attr('y', function(d) { return legendMap(d); })
			.attr('dy' , 7.5)
			.attr('text-anchor', 'start')
			.text(function(d) { return d; });
	
	var legendOffset = legendLineX + 4

	// head
	var gHead = svg.append('g')
		.attr('transform', 'translate(0,' + heightLeading + ')');

	var maxMetric = d3.max([dataBefore[0][metric], dataEvent[0][metric], dataAfter[0][metric]]);

	var xStart = first ? mLFC.l : mL.l;
	var xEnd = first
		? widthFC - mLFC.r
		: width - mL.r;

	var xMapHead = d3.scaleLinear()
		.rangeRound([xStart, xEnd])
		.domain([0, maxMetric]);
	
	// axis
	var axisOffset = 4 + MAIN_BAR_HEIGHT_HEAD * 3;
	gHead.append('g')
		.attr('class', 'grid-head')
		.attr('transform', 'translate(0,' + (-axisOffset) + ')')
		.call(d3.axisTop(xMapHead)
			.ticks(3)
			.tickSizeOuter(0)
			.tickFormat(d3.formatPrefix(".1", 1e6)));


	// before
	var beforeBarOffset = 2 + 7 * MAIN_BAR_HEIGHT_HEAD / 4;
	gHead.append('rect')
		.attr('class', 'bar-before')
		.attr('x', xMapHead(0))
		.attr('y', -beforeBarOffset)
		.attr('width', xMapHead(dataBefore[0][metric]) - xMapHead(0))
		.attr('height', MAIN_BAR_HEIGHT_HEAD / 2);


	// event
	var eventBarOffset = 2 + MAIN_BAR_HEIGHT_HEAD * 3;
	gHead.append('rect')
		.attr('class', 'bar-event')
		.attr('x', xMapHead(0))
		.attr('y', -eventBarOffset)
		.attr('width', xMapHead(dataEvent[0][metric]) - xMapHead(0))
		.attr('height', MAIN_BAR_HEIGHT_HEAD);

	// label
	if (first) {
		var labelPadding = 4;
		var labelOffset = eventBarOffset - 15;
		gHead.append('text')
			.attr('class', 'scale-band-text-head')
			.attr('x', xMapHead(0) - labelPadding)
			.attr('y', -labelOffset)
			.attr('text-anchor', 'end')
			.text(dataEvent[0]['city']);
	}

	// text
	gHead.append('text')
			.attr('class', 'data-text-head')
			.attr('x', xMapHead(dataEvent[0][metric]) - 4)
			.attr('y', -eventBarOffset)
			.attr('dy', 15)
			.attr('text-anchor', 'end')
			.text(numberWithCommas(dataEvent[0][metric]));
	
	// after
	var afterBarOffset = 2 + MAIN_BAR_HEIGHT_HEAD;
	gHead.append('rect')
		.attr('class', 'bar-after')
		.attr('x', xMapHead(0))
		.attr('y', -afterBarOffset)
		.attr('width', xMapHead(dataAfter[0][metric]) - xMapHead(0))
		.attr('height', MAIN_BAR_HEIGHT_HEAD / 2);

	// non-head
	var gOther = svg.append('g')
		.attr('transform', 'translate(0,' + heightLeading + ')');
	
	// find max element
	maxMetric = 0;
	ds = [dataBefore, dataEvent, dataAfter];
	for (var i = 0; i < ds.length; i++) {
		ds[i] = ds[i].slice(start=1);
		maxMetric = d3.max(ds[i].map(x => x[metric]).concat(maxMetric));
	}

	var xStart = m.l;
	var xEnd = width - m.r;

	var gScale = svg.selectAll('scale-band')
			.data(ds[0]).enter()

	var lineOffset = heightLeading - 2;

	gScale.append('line')
			.attr('class', 'scale-band-line')
			.attr('x1', 0)
			.attr('y1', function(d, i) { return lineOffset + (3 * i * MAIN_BAR_HEIGHT); })
			.attr('x2', first ? widthFC : width)
			.attr('y2', function(d, i) { return lineOffset + (3 * i * MAIN_BAR_HEIGHT); });

	if (first) {
		svg.attr('width', widthFC);
		xStart = mFC.l;
		xEnd = widthFC - mFC.r;

		// draw scale bands
		var textOuterPadding = 6;
		var textYOffset = heightLeading;
		var gScale = svg.selectAll('scale-band')
			.data(ds[0]).enter()

		gScale.append('text')
			.attr('class', 'scale-band-text')
			.attr('x', mFC.l - textOuterPadding)
			.attr('y', function(d, i) { return textYOffset + (3 * i * MAIN_BAR_HEIGHT); })
			.attr('dy', '0.71em')
			.attr('text-anchor', 'end')
			.text(function(d) { return d['city']; });
	}
	
	var xMap = d3.scaleLinear()
		.rangeRound([xStart, xEnd])
		.domain([0, maxMetric]);

	var axisPadding = 5;
	var axisYPos = MAIN_BAR_HEIGHT * 3 * ROWS_OTHER + axisPadding;

	// x axis
	gOther.append('g')
		.attr('class', 'grid')
		.attr('transform', 'translate(0,' + axisYPos + ')')
		.call(d3.axisBottom(xMap)
			.ticks(4)
			.tickSizeInner(-(axisYPos + 2))
			.tickSizeOuter(0));

	// before chart
	var beforeOffset = MAIN_BAR_HEIGHT + MAIN_BAR_HEIGHT / 4;
	gOther.selectAll('.bar-before')
		.data(ds[0]).enter()
		.append('rect')
  		.attr('class', 'bar-before')
			.attr('x', xMap(0))
			.attr('y', function(d, i) { return beforeOffset + (3 * i * MAIN_BAR_HEIGHT); })
			.attr('width', function(d) { return xMap(d[metric]) - xMap(0); })
			.attr('height', MAIN_BAR_HEIGHT / 2);

	// event chart
	gOther.selectAll('.bar-event')
		.data(ds[1]).enter()
		.append('rect')
			.attr('class', 'bar-event')
			.attr('x', xMap(0))
			.attr('y', function(d, i) { return (3 * i * MAIN_BAR_HEIGHT); })
			.attr('width', function(d) { return xMap(d[metric]) - xMap(0); })
			.attr('height', MAIN_BAR_HEIGHT);

	// text
	gOther.selectAll('.data-text')
		.data(ds[1]).enter()
		.append('text')
			.attr('class', 'data-text')
			.attr('x', function(d) { return xMap(d[metric]) - 2; })
			.attr('y', function(d, i) { return (3 * i * MAIN_BAR_HEIGHT); })
			.attr('dy', 10)
			.attr('text-anchor', 'end')
			.text(function(d) { return numberWithCommas(d[metric])});
		
	// after chart
	var afterOffset = 2 * MAIN_BAR_HEIGHT;
	gOther.selectAll('.bar-after')
		.data(ds[2]).enter()
		.append('rect')
  		.attr('class', 'bar-after')
			.attr('x', xMap(0))
			.attr('y', function(d, i) { return afterOffset + (3 * i * MAIN_BAR_HEIGHT); })
			.attr('width', function(d) { return xMap(d[metric]) - xMap(0); })
			.attr('height', MAIN_BAR_HEIGHT / 2);
}

// -- main --

var csvs = [
	'data/vic-20171124-20171128.csv',
	'data/vic-20171129-20171203.csv',
	'data/vic-20171204-20171208.csv'
];

var q = d3.queue();

for (var i = 0; i < csvs.length; i++) {
	q.defer(d3.csv, csvs[i], function(d) {
		return {
			city: d['City'],
			sessions: parseFloatAnySeparator(d['Sessions']),
			users: parseFloatAnySeparator(d['Users']),
			pageviews: parseFloatAnySeparator(d['Pageviews'])
		};
	});
}

q.awaitAll(function(e, ds) {
	if (e) throw e;

	var headRows = 6; // Top 6 cities are extracted
	var dataEvent = ds[1].sort(function(a, b) {
		a['Sessions'] < b['Sessions'];
	});

	dataEvent = dataEvent.slice(0, headRows);

	// re-order cities

	var cityOrder = dataEvent.map(x => x.city);

	function extractCities(cityOrder, data) {
		var dataOut = [];
		for (var i = 0; i < cityOrder.length; i++) {
			var city = cityOrder[i];
			var result = data.filter(x => x.city === city);
			if (result.length == 0) throw 'city not found in dataset!';
			dataOut = dataOut.concat(result[0]);
		}
		return dataOut;
	}

	var dataBefore = extractCities(cityOrder, ds[0]);
	var dataAfter = extractCities(cityOrder, ds[2]);

	var metrics = ['users', 'sessions', 'pageviews'];
	for (var i = 0; i < metrics.length; i++) {
		plotLeadingBarChart(metrics[i], svgCollection[metrics[i]], dataBefore, dataEvent, dataAfter, i === 0);
	}

});
