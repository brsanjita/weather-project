// updateWeather.js
const mongoose = require('mongoose');
const Station = require('./models/Station');

async function generateStations() {
  try {
    // Connect to DB
    await mongoose.connect('mongodb://127.0.0.1:27017/weatherDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Clear existing stations to avoid duplicates
    await Station.deleteMany({});

    const stationsToInsert = [];
    for (let i = 0; i < 500; i++) {
      const randomLat = 30 + Math.random() * 20;  // Example lat range
      const randomLon = -120 + Math.random() * 20; // Example lon range
      const stationName = `Station-${i}`;

      stationsToInsert.push({
        name: stationName,
        latitude: randomLat,
        longitude: randomLon,
        temperature: Math.round(Math.random() * 30), // 0-30 C
        humidity: Math.round(Math.random() * 100),
        windSpeed: Math.round(Math.random() * 10),
        lastUpdated: new Date()
      });
    }

    await Station.insertMany(stationsToInsert);
    console.log('Stations generated and inserted successfully!');

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

generateStations();
