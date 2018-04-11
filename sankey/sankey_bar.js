Array.prototype.groupBy = function(prop) {
    return this.reduce(function(groups, item) {
        var val = item[prop];
        groups[val] = groups[val] || [];
        groups[val].push(item);
        return groups;
    }, {});
}

Object.prototype.summarise_each = function(prop, f) {
    var summary = [];
    keys = Object.keys(this);
    for (var i = 0; i < keys.length; i++) {
        summary.push(
            {
                name: keys[i],
                value: this[keys[i]].reduce(function(accumulator, item) {
                    return f(accumulator, item[prop]);
                }, 0)
            }
        )
    }
    return summary;
}

var width = 500;
var height = 500;
var margin = {top:20, left:20, bottom:20, right:20};
var svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);

var q = d3.queue();
q.defer(d3.json, 'rng_graph.json');
q.defer(d3.csv, 'rng_data.csv', function (d) { 
    d.uniqueEvents = +d.uniqueEvents;
    return d; 
});

q.awaitAll(function(e, ds) {
    if (e) throw e;

    graph_data = ds[0]
    table_data = ds[1]

    selection = 'category1'
    group = 'category'

    switch (group) {
        case 'category':
            var grouped = table_data
                .filter(x => (x['category'] == selection))
                .groupBy('action')
                .summarise_each('uniqueEvents', (x, y) => x + y);
            break;
        case 'action':
            break;
        default:
            break;
    }
})
