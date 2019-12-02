// MAIL : mjesuslobo@gmail.com

d3.csv("https://mjlobo.github.io/teaching/infovis/data/trajets.csv").then(function(trajets) {
  d3.csv("https://mjlobo.github.io/teaching/infovis/data/retards.csv").then(function(retards) {
    d3.csv("https://mjlobo.github.io/teaching/infovis/data/emissions.csv").then(function(emissions) {
      d3.csv("https://mjlobo.github.io/teaching/infovis/data/aeroports.csv").then(function(aeroports) {
      console.log("LOADED")
      dataLoaded(trajets, retards, emissions, aeroports)
      })
    })
  })
})

function dataLoaded(trajets, retards, emissions, aeroports) {

  trajets.forEach(function(trajet){
    trajet.ANMOIS = d3.timeParse("%Y%m")(trajet.ANMOIS)
    trajet.annee = new Date(+trajet.annee,0)
  })

  // Comparer l'évolution des vols court, moyen et long courrier.
  mapFlights(trajets, aeroports, 'CC');
  mapFlights(trajets, aeroports, 'MC');
  mapFlights(trajets, aeroports, 'LC');

  // Répartition des vols en longs, moyens, court courriers
  pieFlightsRepartition(trajets);
  // Nombre de vols augmente, surtout les moyens et longs couriers
  stackedFlightsPerYear(trajets);

  stackedCO2EmissionsPerYear(emissions);
  // Emissions de CO2 augmentent également, à l'exception des courts courier
  // (meilleure efficience, et moins de vols). Les LC ont ainsi dépassé les CC
  // malgré qu'il y ait beaucoup - de vols
  linesEmissionsPerYear(emissions, 'CO2', ' in kilotonnes');
  // Si on regarde par rapport au PEQ, les LC et CC sont plus proches car + de
  // passagers par avion
  linesEmissionsPerYear(emissions, 'PEQ', '');
  linesEmissionsPerYear(emissions, 'NOX', ' in tonnes'); // oxyde d'azote
  linesEmissionsPerYear(emissions, 'COVNM', ' in tonnes'); // méthane
  linesEmissionsPerYear(emissions, 'TSP', ' in tonnes'); // particules
}

