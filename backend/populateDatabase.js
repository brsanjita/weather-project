const mongoose = require('mongoose');
const Station = require('./models/Station');

async function generateStations() {
  try {
    // Connect to DB
    await mongoose.connect('mongodb://127.0.0.1:27017/testWeatherDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear existing stations
    await Station.deleteMany({});

    const stations = [];
    const numStations = 500; // Generate 500 stations

    for (let i = 0; i < numStations; i++) {
      const station = {
        name: `Station ${i + 1}`,
        latitude: (Math.random() * (49.384358 - 24.396308) + 24.396308).toFixed(6), // Random latitude in the USA
        longitude: (Math.random() * (-66.93457 - -125.0) + -125.0).toFixed(6), // Random longitude in the USA
        temperature: Math.floor(Math.random() * 100), // Random temperature
        humidity: Math.floor(Math.random() * 100), // Random humidity
        windSpeed: (Math.random() * 20).toFixed(2), // Random wind speed
      };
      stations.push(station);
    }

    await Station.insertMany(stations);
    console.log(`${numStations} stations generated successfully.`);
  } catch (error) {
    console.error('Error generating stations:', error);
  } finally {
    mongoose.connection.close();
  }
}

generateStations();
