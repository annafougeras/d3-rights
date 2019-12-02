function mapFlights(trajets, aeroports, fsc) {
  const width = 800
  const height = 600

  let trajetsLC = trajets.filter(trajet => trajet.FSC == fsc)

  let trajetsPerApt =  d3.nest()
  .key(function(d) { return d.DEP; })
  .rollup(function(v) { return d3.sum(v, function(d) { return d.NVOLS; }); })
  .entries(trajetsLC);

  trajetsPerApt.forEach((row)=>{
    let result = aeroports.filter(function(aeroport){
      return aeroport.APT_OACI == row.key
    })
     row.lat = result[0].APT_LAT
     row.long = result[0].APT_LONG
     row.name = result[0].APT_NOM
  })

  const path = d3.geoPath()

  const svg = d3.select("body").append("svg").attr("width", width).attr("height", height);
  const projection = d3.geoConicConformal()
    .center([2.454071, 46.279229])
    .scale(2600)
    .translate([width / 2, height / 2]);

  //we create a function to scale the area of the circles. This is visually more accurate than scaling the circle radius.
  const scaleCircleAreaBuilder = (data) => {
    let maxValue = d3.max(data, d=>d.value)
    let maxCircleRadius = 30
    let maxCircleArea = Math.PI * Math.pow(maxCircleRadius,2)
    let circleAreaScale = d3.scaleLinear().domain([0,maxValue]).range([0,maxCircleArea])
    return function circleRadius(d) {
      let area = circleAreaScale(d)
      return Math.sqrt(area/Math.PI)
    }
  }

  let scaleArea = scaleCircleAreaBuilder(trajetsPerApt)

  path.projection(projection)

  return d3.json("https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/metropole.geojson").then(function(france) {
    // this code will draw the french border by creating a path
    svg.append("path")
    .datum(france)
    .attr("fill", "lightgrey")
    .attr("stroke", "white")
    .attr("stroke-linejoin", "round")
    .attr("d", path);

    //we use the projection function to place tje circles
    svg.append("g")
    .selectAll("path")
    .data(trajetsPerApt)
    .join("circle")
    .attr("cx",d=>projection([d.long, d.lat])[0])
    .attr("cy",d=>projection([d.long, d.lat])[1])
    .attr('r', d=>scaleArea(d.value))
    .attr('opacity',0.5)
    .attr('fill', 'darkred')
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)

    //we add the names of the airports
    /*svg.append("g")
    .selectAll("text")
    .data(trajetsPerApt)
    .join("text")
    .attr("x",d=>projection([d.long, d.lat])[0]-10)
    .attr("y",d=>projection([d.long, d.lat])[1])
    .text(d=>d.name)
    .style("text-anchor", "end")
    .style("font-size", "10px")
    .style("font", "10px sans-serif")*/

    //we create the legend
    const legend = svg.append("g")
      .attr("fill", "#777")
      .attr("transform", "translate(700,500)")
      .attr("text-anchor", "middle")
      .style("font", "10px sans-serif")
    .selectAll("g")
      .data([10000, 200000, 1000000])
    .join("g");

    legend.append("circle")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("cy", d => -scaleArea(d))
      .attr("r", scaleArea);

    legend.append("text")
      .attr("y", d => -2 * scaleArea(d))
      .attr("dy", "1.3em")
      .text(d3.format(".1s"));

    svg.append("text")
    .attr("x", 650)
    .attr("y", 520)
    .style("font-size", "12px")
    .style("font", "10px sans-serif")
    .text(fsc + " flights departures")

    return svg.node()
  });


}