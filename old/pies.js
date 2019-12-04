function pieFlightsRepartition(trajets) {
  let rawData = d3.nest()
  .key(function(d) {return d.FSC})
  .rollup(function(v) { return d3.sum(v, function(d) { return d.NVOLS; }); })
  .entries(trajets);
  drawPie(rawData, 'CO2 emissions in kilotonnes');
}

function drawPie(rawData, title) {
  const svg = d3.select("body").append("svg")
  .attr("viewBox", [-width / 2, -height / 2, width, height]);


  let data = rawData.map(el => ({'name': el.key, 'value': el.value}));

  const pie = d3.pie()
  .sort(null)
  .value(d => d.value);

  const radius = Math.min(width, height) / 2 * 0.8;
  const arcLabel = d3.arc().innerRadius(radius).outerRadius(radius);

  const arc = d3.arc()
  .innerRadius(0)
  .outerRadius(Math.min(width, height) / 2 - 1);

  const color = d3.scaleOrdinal()
  .domain(data.map(d => d.name))
  .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());

  const arcs = pie(data);

  svg.append("g")
      .attr("stroke", "white")
    .selectAll("path")
    .data(arcs)
    .join("path")
      .attr("fill", d => color(d.data.name))
      .attr("d", arc)
    .append("title")
      .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);

  svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
      .attr("text-anchor", "middle")
    .selectAll("text")
    .data(arcs)
    .join("text")
      .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
      .call(text => text.append("tspan")
          .attr("y", "-0.4em")
          .attr("font-weight", "bold")
          .text(d => d.data.name))
      .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
          .attr("x", 0)
          .attr("y", "0.7em")
          .attr("fill-opacity", 0.7)
          .text(d => d.data.value.toLocaleString()));

  return svg.node();
}