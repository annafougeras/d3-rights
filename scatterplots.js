const width = 800
const height = 600
const margin = ({top: 20, right: 30, bottom: 30, left: 40})

function scatterplotGDPvsHRS() {
    const path = "https://raw.githubusercontent.com/vincentfougeras/d3-rights/master/datasets/human-rights-score-vs-gdp-per-capita.csv"
    d3.csv(path).then(function(rawData) {
        rawData = rawData.filter(el => el.Year == 2017)
        rawData = rawData.map(el => ({'name' : el.Entity,
                                        'x': el['Human rights protection score'],
                                        'y': el['GDP per capita, PPP (in constant 2011 int-$) (constant 2011 international $)'],
                                    }))
        rawData = rawData.filter(el => el.x !== "" && el.y !== "")
        rawData['x'] = 'Human rights protection score'
        rawData['y'] = 'GDP per capita'
        drawScatterplot(rawData)
    })
}

function scatterplotPressVsHRS() {
    const path1 = "https://raw.githubusercontent.com/vincentfougeras/d3-rights/master/datasets/human-rights-scores.csv"
    const path2 = "https://raw.githubusercontent.com/vincentfougeras/d3-rights/master/datasets/world-press-freedom.csv"
    d3.csv(path1).then(function(rawData1) {
        d3.csv(path2).then(function(rawData2) {
            rawData1 = rawData1.filter(el => el.Year == 2017)
            rawData2 = rawData2.filter(el => el.Year == 2017)

            rawData = mergeArrays(rawData1, rawData2)

            rawData = rawData.map(el => ({'name' : el.Entity,
                                        'x': el['HR'],
                                        'y': el['PressFreedomScore'],
                                        }))

            rawData = rawData.filter(el => !!el.x && !!el.y)
            rawData['x'] = 'Human rights protection score'
            rawData['y'] = 'Freedom of press score'
            drawScatterplot(rawData)
        })
    })
}

function incomeShareVsHRS() {
    const path1 = "https://raw.githubusercontent.com/vincentfougeras/d3-rights/master/datasets/human-rights-scores.csv"
    const path2 = "https://raw.githubusercontent.com/vincentfougeras/d3-rights/master/datasets/income-share-held-by-richest-10.csv"
    d3.csv(path1).then(function(rawData1) {
        d3.csv(path2).then(function(rawData2) {
            rawData1 = rawData1.filter(el => el.Year == 2017)
            rawData2 = rawData2.filter(el => el.Year == 2010)

            rawData = mergeArrays(rawData1, rawData2)

            rawData = rawData.map(el => ({'name' : el.Entity,
                                        'x': el['HR'],
                                        'y': el['Incomeshareheldbyhighest10percent'],
                                        }))
                                        console.log(rawData);

            rawData = rawData.filter(el => !!el.x && !!el.y)
            rawData['x'] = 'Human rights protection score'
            rawData['y'] = 'Income share held by richest 10%'

            drawScatterplot(rawData)
        })
    })
}

function mergeArrays(arr1, arr2) {
    let merged = [];

    for(let i=0; i<arr1.length; i++) {
        merged.push({
            ...arr1[i],
            ...(arr2.find((itmInner) => itmInner.Code === arr1[i].Code))}
        );
    }

    return merged;
}

/* Data example :
data = Array(32) [
  0: Object {name: "Mazda RX4", x: 21, y: 110}
  1: Object {name: "Mazda RX4 Wag", x: 21, y: 110}
  ...
  x: "Miles per gallon"
  y: "Horsepower"
*/

function drawScatterplot(data) {
    let y = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.x)).nice()
        .range([height - margin.bottom, margin.top])

    let x = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.y)).nice()
        .range([margin.left, width - margin.right])

    let yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.x))

    let xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", width - margin.right)
            .attr("y", -4)
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .text(data.y))



    const svg = d3.select("body").append("svg").attr("width", width).attr("height", height)

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    svg.append("g")
        .attr("stroke-width", 1.5)
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
      .selectAll("g")
      .data(data)
      .join("g")
        .attr("transform", d => `translate(${x(d.y)},${y(d.x)})`)
        .attr("class", "point")
        .call(g => g.append("circle")
            .attr("stroke", "steelblue")
            .attr("fill", "none")
            .attr("r", 3))
        .call(g => g.append("text")
            .attr("dy", "0.35em")
            .attr("x", 7)

            .on('mouseover',mouseoverPoint).on('mouseout',mouseoutPoint)
            .text(d => d.name));

    function mouseoverPoint(event) {
        document.querySelectorAll('.point').forEach(function(elt) {
            if (elt.getElementsByTagName('text')[0].innerHTML != event.name) {
                elt.setAttribute('opacity', '0.2');
            }
        })
    }

    function mouseoutPoint() {
        document.querySelectorAll('.point').forEach(function(elt) {
            elt.setAttribute('opacity', '1');
        })
    }
}