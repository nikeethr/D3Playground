// - global -

var width = 1040;
var height = 500;
var g_drawBars = true;

var svg = d3.select('body').append('svg')
	.attr('width', width)
	.attr('height', height);

var margin = 
{
	top: 20,
	left: 20,
	bottom: 20,
	right: 20
};

// - helpers -

const parseFloatAnySeparator = (x) => {
	return x.replace(/[^0-9.-]/g, '');
}

const numbersWithCommas = (x) => {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const isXWithinYWithPadding = (x, y, p) => {
	return x + 2*p < y;
}


function calculateDataBarWidth(data, maxBarWidth = 100) {
	var metricMax = d3.max(data.map(x => x.value));

	for (var i = 0; i < data.length; i++) {
		data[i]['barWidth'] = data[i].value * maxBarWidth / metricMax;
	}
}


// todo: mapHeader and mapColor can be made generic

function mapHeader(key) {
	switch (key) {
		case 'page_title':		return 'Page Title';
		case 'page': 			return 'Page';
		case 'unique_pageviews':	return 'Unique Pageviews';
	}

	return '';
}

function mapColor(key) {
	switch (key) {
		case 'unique_pageviews':	return 'darkslategrey';
	}

	return 'black';
}

// - table functions -

function drawTable(data) {
	var metrics = Object.keys(data[0]);
	var gPrev = null;

	// table settings
	var headerSize = 20;
	var headerPadding = 4;
	var columnPadding = 8;
	var rowHeight = 24;
	var barHeight = 18;
	var barWidth = 150;

	var dataHeight = rowHeight * data.length;

	const yOffset = (x) => {
		return (rowHeight - barHeight) / 2 + x * rowHeight;
	}

	var tX = margin.left;
	var tY = margin.top + headerPadding + headerSize;

	// Add placeholder for first column background fill - [1]
	leadingColumnBG = svg.append('g')
		.attr('transform', 'translate(' + (tX + columnPadding) + ',' + tY + ')')
		.append('rect');

	var gAll = svg.append('g');
	
	for (var i = 0; i < metrics.length; i++) {
		tX += columnPadding;
		var dataColumn = data.map(x => x[metrics[i]]);

		if (gPrev != null) {
			tX += gPrev.node().getBBox().width;
		}

		
		// Add placeholder for row dividors - [2]
		var rowLines = gAll.selectAll('.line-row');

		rowLines.data(data).enter()
			.append('line')
				.attr('class', 'line-row');

		var g = gAll.append('g')
			.attr('transform', 'translate(' 
				+ tX + ',' 
				+ tY + ')');
		
		// Insert header
		g.append('text')
			.attr('class', 'text-header')
			.attr('x', -columnPadding / 2)
			.attr('y', -headerPadding)
			.text(mapHeader(metrics[i]));

		// Insert header underline
		g.append('line')
			.attr('class', 'line-header')
			.attr('x1', -columnPadding / 2 - .5) // "-.5" to cover column line
			.attr('y1', 0)
			.attr('x2', g.node().getBBox().width) // this is the lazy way to do it...
			.attr('y2', 0);

		// Insert column lines
		g.append('line')
			.attr('class', 'line-column')
			.attr('x1', -columnPadding / 2)
			.attr('y1', 0)
			.attr('x2', -columnPadding / 2)
			.attr('y2', dataHeight);

		var gCell = g.selectAll('g-cell')
			.data(dataColumn).enter()
			.append('g');

		// numeric - draw bars
		var isNumeric = 
			typeof data[0][metrics[i]] == "object"
			&& 'value' in data[0][metrics[i]]
			&& typeof data[0][metrics[i]]['value'] == "number";

		if (isNumeric) {
			if (g_drawBars) {
				calculateDataBarWidth(dataColumn, barWidth);

				gCell.append('rect')
					.attr('x', 0)
					.attr('y', function(d, i) { return yOffset(i); })
					.attr('width', function(d) { return d.barWidth; })
					.attr('height', barHeight)
					.attr('fill',  mapColor(metrics[i]));
			}

			// add value text

			function getValueTextXOffset(d) {
				return g_drawBars ? (isXWithinYWithPadding(this.getBBox().width, d.barWidth, 4) ? 2 : d.barWidth + 2) : 2;
			}

			function getValueTextFill (d) {
				var dflt = mapColor(metrics[i]);
				return g_drawBars ? (isXWithinYWithPadding(this.getBBox().width, d.barWidth, 4) ? "#fff" : dflt) : dflt;
			}

			var valueText = gCell
				.append('text')
					.attr('class', 'text-value')
					.text(function(d) { return numbersWithCommas(d.value); })
					.attr('x', getValueTextXOffset)
					.attr('y', function(d, i) { return yOffset(i) + barHeight / 2; })
					.attr('fill', getValueTextFill);

			// add comparison text

			if ('change' in data[0][metrics[i]]) {
				function getComparisonTextXOffset(d) {
					// Add text to end of current group width (with padding of 2)
					return this.parentElement.getBBox().width + 3;
				}

				function getComparisonTextFill(d) {
					// If change is +ve, e.g. 160%, style it differently to if it is -ve, e.g. -23.4%.
					return +parseFloatAnySeparator(d.change) >= 0 ? 'text-comparison pos' : 'text-comparison neg';
				}

				function getTextContent(d) {
					return +parseFloatAnySeparator(d.change) > 0 ? '+' + d.change : d.change;
				}

				var comparisonText = gCell
					.append('text') 
					.attr('class', getComparisonTextFill)
					.attr('y', function(d, i) { return yOffset(i) + barHeight / 2;}) // same y-alignment as value text
					.attr('x', getComparisonTextXOffset)
					.text(getTextContent);
			}

		} else {
			// add default text

			var text = gCell
				.append('text')
					.attr('class', 'text-default')
					.text(function(d) { return d; })
					.attr('x', 0)
					.attr('y', function(d, i) { return yOffset(i) + barHeight / 2; });
		}
		
		// Make first column darker shade - [2]

		if (i == 0 && leadingColumnBG != null) {
			leadingColumnBG
				.attr('class', 'leading-column-bg')
				.attr('x', -columnPadding / 2)
				.attr('width', g.node().getBBox().width)
				.attr('height', dataHeight);
		}

		gPrev = g;
	}

	// Add row dividers - [1]
	rowLines.attr('x1', margin.left + columnPadding / 2)
		.attr('y1', function(d, i) { return tY + (i + 1) * rowHeight; })
		.attr('x2', gAll.node().getBBox().width)
		.attr('y2', function(d, i) { return tY + (i + 1) * rowHeight; });
}

// - main -

d3.csv('data/test.csv', 
	function(d) {
		return {
			page_title: d['Page Title'],
			unique_pageviews: 
				{
					value: +parseFloatAnySeparator(d['Unique Pageviews']),
					change: d['Unique Pageviews Change']
				},
			page: d['Page']
		};
	},
	function(e, d) {
		if(e) throw e;
		console.log(d);
		drawTable(d);
	}
)
