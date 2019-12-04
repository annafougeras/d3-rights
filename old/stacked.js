let width = 800
let height = 400

const margin = {left: 80, right:40, top:40, bottom:40}

function stackedFlightsPerYear(trajets) {
  let rawData = d3.nest()
    .key(function(d) { return d.annee;})
    .key(function(d) {return d.FSC})
    .rollup(function(v) { return d3.sum(v, function(d) { return d.NVOLS; }); })
    .entries(trajets);

  displayStackedData(rawData);
}

function stackedCO2EmissionsPerYear(emissions) {
  let rawData = d3.nest()
    .key(function(d) { return d.annee;})
    .key(function(d) {return d.FSC})
    .rollup(function(v) { return d3.sum(v, function(d) { return d.CO2; }); })
    .entries(emissions);

  displayStackedData(rawData);
}

function displayStackedData(rawData) {
  const svg = d3.select("body").append("svg").attr("width", width).attr("height", height);
  let data = []

  rawData.forEach(function(year){
    year['date'] = new Date(year.key);
    year.values.forEach(function(fsc) {
      year[fsc.key] = fsc.value;
    });
    data.push({'date': year['date']})
    year.values.forEach(function(fsc) {
      data[data.length-1][fsc.key] = fsc.value;
    });
  });

  data.pop();
  data.sort((a, b) => b.date - a.date);
  data['columns'] = ['date', 'LC', 'MC', 'CC'];
  data['y'] = 'CO2 emissions';

  let series = d3.stack().keys(data.columns.slice(1))(data)

  let area = d3.area()
  .x(d => x(d.data.date))
  .y0(d => y(d[0]))
  .y1(d => y(d[1]))

  let x = d3.scaleUtc()
  .domain(d3.extent(data, d => d.date))
  .range([margin.left, width - margin.right])

  let y = d3.scaleLinear()
    .domain([0, d3.max(series, d => d3.max(d, d => d[1]))]).nice()
    .range([height - margin.bottom, margin.top])

  const color = d3.scaleOrdinal()
    .domain(data.columns.slice(1))
    .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.columns.length-1).reverse());

  let yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(data.y))

  let xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

  svg.append("g")
    .selectAll("path")
    .data(series)
    .join("path")
      .attr("fill", ({key}) => color(key))
      .attr("d", area)
    .append("title")
      .text(({key}) => key);

  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .call(yAxis);

  return svg.node();
}


