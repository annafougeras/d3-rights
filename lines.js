function linesEmissionsPerYear(emissions, category, legendEnd) {
  let rawData = d3.nest()
  .key(function(d) {return d.FSC})
    .key(function(d) { return d.annee})
    .rollup(function(v) { return d3.sum(v, function(d) { return d[category]; }); })
    .entries(emissions);
  drawLines(rawData, category + ' emissions ' + legendEnd);
}

function drawLines(rawData, title) {
  const svg = d3.select("body").append("svg").attr("width", width).attr("height", height);

  let data = []

  data['series'] = []
  rawData.forEach(function(fsc){
    data['series'].push({'name': fsc.key, 'values': []});
    fsc.values.forEach(function(yearCO2) {
      data['series'][data['series'].length-1].values.push(yearCO2.value);
    });
  });

  data['dates'] = [];
  rawData[0].values.forEach(function(value){
    data['dates'].push(new Date(value.key));
  });

  data['y'] = title;

  // Remove last year
  data['dates'].pop();
  data['series'].forEach(function(nameValues){
    nameValues.values.pop();
  });

  let x = d3.scaleUtc()
    .domain(d3.extent(data.dates))
    .range([margin.left, width - margin.right])

  let y = d3.scaleLinear()
    .domain([0, d3.max(data.series, d => d3.max(d.values))]).nice()
    .range([height - margin.bottom, margin.top])

  let xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

  let yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(data.y))

  let line = d3.line()
    .defined(d => !isNaN(d))
    .x((d, i) => x(data.dates[i]))
    .y(d => y(d))


  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .call(yAxis);

  const path = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
    .selectAll("path")
    .data(data.series)
    .join("path")
      .style("mix-blend-mode", "multiply")
      .attr("d", d => line(d.values));

  svg.call(hover, path, data, x, y);

  return svg.node();
}

function hover(svg, path, data, x, y) {
  svg
      .style("position", "relative");

  if ("ontouchstart" in document) svg
      .style("-webkit-tap-highlight-color", "transparent")
      .on("touchmove", moved)
      .on("touchstart", entered)
      .on("touchend", left)
  else svg
      .on("mousemove", moved)
      .on("mouseenter", entered)
      .on("mouseleave", left);

  const dot = svg.append("g")
      .attr("display", "none");

  dot.append("circle")
      .attr("r", 2.5);

  dot.append("text")
      .style("font", "10px sans-serif")
      .attr("text-anchor", "middle")
      .attr("y", -8);

  function moved() {
    d3.event.preventDefault();
    const ym = y.invert(d3.event.layerY);
    const xm = x.invert(d3.event.layerX);
    const i1 = d3.bisectLeft(data.dates, xm, 1);
    const i0 = i1 - 1;
    const i = xm - data.dates[i0] > data.dates[i1] - xm ? i1 : i0;
    const s = data.series.reduce((a, b) => Math.abs(a.values[i] - ym) < Math.abs(b.values[i] - ym) ? a : b);
    path.attr("stroke", d => d === s ? null : "#ddd").filter(d => d === s).raise();
    dot.attr("transform", `translate(${x(data.dates[i])},${y(s.values[i])})`);
    dot.select("text").text(s.name);
  }

  function entered() {
    path.style("mix-blend-mode", null).attr("stroke", "#ddd");
    dot.attr("display", null);
  }

  function left() {
    path.style("mix-blend-mode", "multiply").attr("stroke", null);
    dot.attr("display", "none");
  }
}