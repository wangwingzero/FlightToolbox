// Debug script to check DAAD airport data
var airports = require('./miniprogram/packageC/airportdata.js');

console.log('Total airports:', airports.length);

// Find DAAD airport
var daadAirport = null;
for (var i = 0; i < airports.length; i++) {
  if (airports[i].ICAOCode === 'DAAD') {
    daadAirport = airports[i];
    break;
  }
}

if (daadAirport) {
  console.log('DAAD Airport found:');
  console.log('ICAOCode:', daadAirport.ICAOCode);
  console.log('ShortName:', daadAirport.ShortName);
  console.log('Elevation:', daadAirport.Elevation);
  console.log('Elevation type:', typeof daadAirport.Elevation);
  console.log('Full object:', JSON.stringify(daadAirport, null, 2));
} else {
  console.log('DAAD Airport not found!');
}