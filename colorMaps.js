// Score des droits de l'homme en 2017
drawHumanRightsScore();

// Violations des droits de l'homme en 2014
// drawHumanRightsViolations();

// Ratio des richesses détenues par les 10% les plus riches en 2010
// drawIncomeShare();

// Liberté de la presse en 2019
// drawPressFreedom();

function drawIncomeShare() {
    const path = "https://raw.githubusercontent.com/vincentfougeras/d3-rights/master/datasets/income-share-held-by-richest-10.csv"
    d3.csv(path, function(error, rawData) {
        rawData = rawData.filter(el => el.Year == 2010)
        rawData = rawData.map(el => ({'key' : el.Code,
                                        'doc_count': +el['Incomeshareheldbyhighest10percent'],
                                    }))
        //rawData = rawData.filter(el => el.doc_count !== "")
        drawMap(rawData, false)
    })
}

function drawPressFreedom() {
    const path = "https://raw.githubusercontent.com/vincentfougeras/d3-rights/master/datasets/world-press-freedom.csv"
    d3.csv(path, function(error, rawData) {
        rawData = rawData.filter(el => el.Year == 2019)
        rawData = rawData.map(el => ({'key' : el.Code,
                                        'doc_count': +el['PressFreedomScore'],
                                    }))
        //rawData = rawData.filter(el => el.doc_count !== "")
        drawMap(rawData, false)
    })
}

function drawHumanRightsScore() {
    const path = "https://raw.githubusercontent.com/vincentfougeras/d3-rights/master/datasets/human-rights-scores.csv"
    d3.csv(path, function(error, rawData) {
        rawData = rawData.filter(el => el.Year == 2017)
        rawData = rawData.map(el => ({'key' : el.Code,
                                        'doc_count': +el['HR'],
                                    }))
        //rawData = rawData.filter(el => el.doc_count !== "")
        drawMap(rawData, true)
    })
}

function drawHumanRightsViolations() {
    const path = "https://raw.githubusercontent.com/vincentfougeras/d3-rights/master/datasets/human-rights-violations.csv"
    d3.csv(path, function(error, rawData) {
        rawData = rawData.filter(el => el.Year == 2014)
        rawData = rawData.map(el => ({'key' : el.Code,
                                        'doc_count': +el['HRV'],
                                    }))
        //rawData = rawData.filter(el => el.doc_count !== "")
        drawMap(rawData, false)
    })
}

/* Data example :
[
    {
        "key": "USA",
        "doc_count": 4231922
    },
    {
        "key": "CAN",
        "doc_count": 817866
    },
*/
function drawMap(data, redToGreen = false) {
    var palette = ['#009933','#669900','#99cc00','#cccc00','#c7dc09','#edf933','#ffcc00', '#ff9933', '#ff6600','#ff5050'];
    if(redToGreen) {
        palette = palette.reverse();
    }
    var width = 960, height = 960;
    var minDocCount = 0, quantiles = {};
    // projection definitions
    var projection = d3.geo.mercator()
        .scale((width + 1) / 2 / Math.PI)
        .translate([width/2, height/2])
        .precision(.1);
    var path = d3.geo.path().projection(projection);
    var graticule = d3.geo.graticule();
    // SVG related definitions
    var svg = d3.select('body').append('svg')
                .attr({'width': width, 'height': height})
                .append('g');
    var filter = svg.append('defs')
        .append('filter')
        .attr({'x':0, 'y':0, 'width':1, 'height':1, 'id':'gray-background'});
    filter.append('feFlood')
        .attr('flood-color', '#f2f2f2')
        .attr('result', 'COLOR');
    filter.append('feMorphology')
        .attr('operator', 'dilate')
        .attr('radius', '.9')
        .attr('in', 'SourceAlpha')
        .attr('result', 'MORPHED');
    filter.append('feComposite')
        .attr('in', 'SourceGraphic')
        .attr('in2', 'MORPHED')
        .attr('result', 'COMP1');
    filter.append('feComposite')
        .attr('in', 'COMP1')
        .attr('in2', 'COLOR');

    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);

    d3.json('https://raw.githubusercontent.com/vincentfougeras/d3-rights/master/datasets/world.json', function(error, world) {
        if (error) return console.error(error);
        processWorldD(world, data);
        //localStorage.setItem('worldmapData', JSON.stringify(world));
    });

    function processWorldD(world, data) {
            for(var idx=0; idx < data.length; idx++) {
                var cCode = data[idx].key.toUpperCase();
                var doc_count = data[idx].doc_count;
                for(var wdx=0; wdx < world.objects.subunits.geometries.length; wdx++) {
                    var cName = world.objects.subunits.geometries[wdx].id.toUpperCase();
                    if (cCode === cName) {
                        world.objects.subunits.geometries[wdx].properties.doc_count = doc_count;
                    }
                }
            }
            var subunits = topojson.feature(world, world.objects.subunits);
            subunits.features = subunits.features.filter(function(d){ return d.id !== "ATA"; });
            console.log('subunits',subunits);
            minDocCount = d3.min(subunits.features, function(d){ return d.properties.doc_count; });
            console.log('minDocCount',minDocCount);
            var doc_counts = subunits.features.map(function(d){ return d.properties.doc_count; });
            doc_counts = doc_counts.filter(function(d){ return d; }).sort(d3.ascending);
            //console.log('doc_counts',doc_counts);
            quantiles['0.95'] = d3.quantile(doc_counts, '0.95');
            var countries = svg.selectAll('path.subunit')
                .data(subunits.features).enter();
            countries.insert('path', '.graticule')
                .attr('class', function(d) { return 'subunit ca'+d.id; })
                .style('fill', heatColor)
                .attr('d', path)
                .on('mouseover',mouseoverLegend).on('mouseout',mouseoutLegend)
                .on('click', coutryclicked);

            countries.append('svg:text')
                .attr('class', function(d){ return 'subunit-label la'+d.id+d.properties.name.replace(/[ \.#']+/g,''); })
                //.attr('transform', function(d) { return 'translate('+ path.centroid(d) +')'; })
                .attr('transform', function(d) { return 'translate('+(width-(5*d.properties.name.length))+','+(15)+')'; })
                .attr('dy', '.35em')
                .attr('filter', 'url(#gray-background)')
                .append('svg:tspan')
                .attr('x', 0)
                .attr('dy', 5)
                .text(function(d) { return d.properties.name; })
                .append('svg:tspan')
                .attr('x', 0)
                .attr('dy', 20)
                .text(function(d) { return d.properties.doc_count ? d.properties.doc_count : ''; });
    }

    function mouseoverLegend(datum, index) {
        d3.selectAll('.subunit-label.la'+datum.id+datum.properties.name.replace(/[ \.#']+/g,''))
            .style('display', 'inline-block');
        d3.selectAll('.subunit.ca'+datum.id)
            .style('fill', '#cc6699');
    }

    function mouseoutLegend(datum, index) {
        d3.selectAll('.subunit-label.la'+datum.id+datum.properties.name.replace(/[ \.#']+/g,''))
            .style('display', 'none');
        d3.selectAll('.subunit.ca'+datum.id)
            .style('fill', heatColor(datum));
    }

    function coutryclicked(datum, index) {
        //filter event for this country should be applied here
        console.log('coutryclicked datum', datum);
    }
    function heatColor(d) {
        if (quantiles['0.95'] === 0 && minDocCount === 0) return '#F0F0F0';
        if (!d.properties.doc_count) return '#F0F0F0';
        if (d.properties.doc_count > quantiles['0.95']) return palette[(palette.length - 1)];
        if (quantiles['0.95'] == minDocCount) return palette[(palette.length-1)];
        var diffDocCount = quantiles['0.95'] - minDocCount;
        var paletteInterval = diffDocCount / palette.length;
        var diffDocCountDatum = quantiles['0.95'] - d.properties.doc_count;
        var diffDatumDiffDoc = diffDocCount - diffDocCountDatum;
        var approxIdx = diffDatumDiffDoc / paletteInterval;
        if (!approxIdx || Math.floor(approxIdx) === 0) approxIdx = 0;
        else approxIdx = Math.floor(approxIdx) - 1;
        return palette[approxIdx];
    }
}