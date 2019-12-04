const width = 800
const height = 600
const margin = ({top: 20, right: 30, bottom: 30, left: 40})

function scatterplotGDPvsHRS() {
    const path = "https://raw.githubusercontent.com/vincentfougeras/d3-rights/master/datasets/human-rights-score-vs-gdp-per-capita.csv"
    d3.csv(path).then(function(rawData) {
        rawData = rawData.filter(el => el.Year == 2017)
        rawData = rawData.map(el => ({'name' : el.Entity,
                                      'x': el['GDP per capita, PPP (in constant 2011 int-$) (constant 2011 international $)'],
                                      'y': el['Human rights protection score'],
                                    }))
        rawData = rawData.filter(el => el.x !== "" && el.y !== "")
        rawData['x'] = 'GDP per capita'
        rawData['y'] = 'Human rights protection score'
        console.log(rawData)
        drawScatterplot(rawData)
    })
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
        .domain(d3.extent(data, d => +d.y)).nice()
        .range([height - margin.bottom, margin.top])

    let x = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.x)).nice()
        .range([margin.left, width - margin.right])

    let yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.y))

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
            .text(data.x))



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
        .attr("transform", d => `translate(${x(d.x)},${y(d.y)})`)
        .call(g => g.append("circle")
            .attr("stroke", "steelblue")
            .attr("fill", "none")
            .attr("r", 3))
        .call(g => g.append("text")
            .attr("dy", "0.35em")
            .attr("x", 7)
            .text(d => d.name));
}