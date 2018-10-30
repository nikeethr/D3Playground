    var width = 300;
    var height = 300;

    var mapColorStatic = "#fee6ce";
    var colorCircles = d3.scaleLinear()
        .domain([1, 100]) // todo: scale by value
        .range(["#deebf7", "#3182bd"]);

    var projection = d3.geoMercator()
        .scale(300)
        .center([133.8, -25.3])
        .translate([width/2, height/2])

    path = d3.geoPath().projection(projection)

    function renderMaps(geo, data) {
        var visWrapper = d3.select('#mapChart')
            .append('svg')
            .attr("width", width * data.length)
            .attr("height", height);

        createMap(visWrapper, geo, data);
    }

    function renderDeviceBar(data) {
        deviceData = convertDataToDeviceBar(data);

        // create linear interp (so one end reaches (edge - padding)
        var scaleMax = d3.max(deviceData.map(
                        x => d3.max(x.entries.map(
                                x => d3.max([x['r'], x['n']])))));

        var padding = 10;
        var margin = 40;
        var xLeft = d3.scaleLinear().rangeRound([margin, width - padding]);
        var xRight = d3.scaleLinear().rangeRound([padding, width - margin]);
        xLeft.domain([scaleMax, 0]);
        xRight.domain([0, scaleMax]);

        var deviceChart = d3.select('#deviceChart').append('svg')
            .attr("width", width * 2)
            .attr("height", height);

        deviceChart.append("g")
            .attr("class", "axis axis--x")
            .call(d3.axisBottom(xLeft).ticks(5));

        deviceChart.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(" + width + ",0)")
            .call(d3.axisBottom(xRight).ticks(5));

        // color schemes
        var numPalette = '4';
        var colorsR = colorbrewer['YlOrBr'][numPalette];
        var colorsN = colorbrewer['PuBu'][numPalette];

        // iterate through data and plot
        var barVerticalOffset = 30;
        var barWidth = 20;
        var barPadding = 5;
        var nextOffset = 50;

        for (var i = 0; i < deviceData.length; i++) {

            var gText = deviceChart.append("text")
                .text(deviceData[i].type.toUpperCase())
                .attr('x', width)
                .attr('y', nextOffset - 10)
                .style("font-family", "Helvetica")
                .style("font-size", '15px')
                .style("fill", "#333")
                .style("text-anchor", "middle");

            var gLeft = deviceChart.append("g")
                .attr("transform", "translate(0," + nextOffset + ")");

            var returningUserData = deviceData[i].entries.map(x => x['r']);

            // returning users
            gLeft.selectAll('rect')
                .data(returningUserData)
                .enter()
                .append('rect')
                .attr('x', function(d) { return xLeft(d); })
                .attr('y', function(d, i) { return i*(barWidth + barPadding); })
                .attr('width', function(d) { return xLeft(0) - xLeft(d); })
                .attr('height', barWidth)
                .style('fill', function(d, i) { return colorsR[colorsR.length-i-1]; })
                .style('opacity', .8);

            // new users 
            var gRight = deviceChart.append("g")
                .attr("transform", "translate(" + width + "," + nextOffset + ")");

            var newUserData = deviceData[i].entries.map(x => x['n']);

            gRight.selectAll('rect')
                .data(newUserData)
                .enter()
                .append('rect')
                .attr('x', function(d) { return xRight(0); })
                .attr('y', function(d, i) { return i*(barWidth + barPadding); })
                .attr('width', function(d) { return xRight(d) - xRight(0); })
                .attr('height', barWidth)
                .style('fill', function(d, i) { return colorsN[colorsR.length-i-1]; })
                .style('opacity', .8);

            nextOffset += returningUserData.length * (barWidth + barPadding) + barVerticalOffset;

        }
    }

    function convertDataToDeviceBar(data) {
        var ret = 
            [
                { 
                    type: 'Android',
                    entries:
                    [
                        {
                            n: 100,
                            r: 10
                        },
                        {
                            n: 20,
                            r: 40
                        }
                    ],
                },
                { 
                    type: 'iOS',
                    entries:
                    [
                        {
                            n: 33,
                            r: 66
                        },
                        {
                            n: 10,
                            r: 90
                        }
                    ],
                }
            ]
            
        return ret
    }

    function createMap(svg, geo, data) {
        for (var i = 0; i < data.length; i++) {
            var mapLayer = svg.append('g')
                .classed('map-layer', true)
                .attr("transform", "translate(" + (i * width) + ",0)");

            mapLayer.selectAll('path')
                .data(geo.features)
                .enter()
                .append('path')
                .attr('d', path)
                .attr('fill', mapColorStatic)
                .attr('opacity', .5)
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut);

            var circles = mapLayer.selectAll("c")
                .data(data[i])
                .enter()
                .append("circle")
                .attr("cx", function (d) { return projection([d.lng, d.lat])[0]; })
                .attr("cy", function (d) { return projection([d.lng, d.lat])[1]; })
                .attr("r", function(d) { return d.value / 3; }) // todo: scale by all values
                .attr('opacity', .5)
                .style("fill", function(d) { return colorCircles(d.value); })
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut);
        }
    }

    function handleMouseOver(d, i) {
        d3.select(this)
            .attr('opacity', 1.)
    }

    function handleMouseOut(d, i) {
        d3.select(this)
            .attr('opacity', .5)
    }

    function swapMaps(m, i, j) {
        [m[i], m[j]] = [m[j], m[i]];
    }

    // load map
    var geoAusStates = [];
    var mapData = [];
    var csvFileNames = ['A', 'B'];

    var q = d3.queue();

    q.defer(d3.json, "states.min.geojson");
    for (i = 0; i < csvFileNames.length; i++) {
        q.defer(d3.csv, csvFileNames[i] + ".csv", function(d) {
            return {    
                city: d.city,
                lat: +d.lat,
                lng: +d.lng,
                value: +d.value
            };

        });
    }
    q.awaitAll(function(e, files) {
        geoAusStates = files[0];
        for (var i = 1; i < files.length; i++)
            mapData.push(files[i]);

        renderMaps(geoAusStates, mapData)
        renderDeviceBar(mapData)
    });

