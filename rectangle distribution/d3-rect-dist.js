var width = 960
var height = 500
var svg = d3.select("#chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)

// functions
function SortData(d) {
    // screen views
    var screenNames = Array.from(new Set(d.map(x => x.screenName)));
    var screenNameViews = [];
    for (i = 0; i < screenNames.length; i++) {
        tot = 0;
        for (j = 0; j < d.length; j++) {
            if (screenNames[i] == d[j].screenName)
                tot += d[j].screenViews;
        }
        screenNameViews.push({
            screenName: screenNames[i],
            screenViews: tot
        });
    }

    screenNameViews.sort(function(a, b) {
        return a.screenViews < b.screenViews;
    });

    // repeat for state
    var regions = Array.from(new Set(d.map(x => x.region)));
    var regionViews = [];
    for (i = 0; i < regions.length; i++) {
        tot = 0;
        for (j = 0; j < d.length; j++) {
            if (regions[i] == d[j].region)
                tot += d[j].screenViews;
        }
        regionViews.push({
            region: regions[i],
            screenViews: tot
        });
    }

    regionViews.sort(function(a, b) {
        return a.screenViews < b.screenViews;
    });
}

function DrawRectDist(d, svg) {
}

// main
d3.csv("test.csv", function(d) {
        return {
            screenName: d.screenName,
            region: d.region,
            type: d.type,
            screenViews: +d.screenViews
        };
    },
    function(e,d) {
        if (e) throw e;
        SortData(d)
        // DrawRectDist(d, svg);
    }
);
