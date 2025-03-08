const mongoose = require('mongoose');
const Station = require('./models/Station');

async function generateStations() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/testWeatherDB', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');

    // Clear existing stations
    await Station.deleteMany({});

    const stations = [];
    const numStations = 500; // Generate 500 stations

    for (let i = 0; i < numStations; i++) {
      const baseTemperature = 20 + Math.random() * 15; // Base temperature between 20 and 35
      const baseRainfall = Math.random() * 10; // Base rainfall between 0 and 10

      const station = {
        name: `Station ${i + 1}`,
        latitude: (Math.random() * (49.384358 - 24.396308) + 24.396308).toFixed(6), // Random latitude in the USA
        longitude: (Math.random() * (-66.93457 - -125.0) + -125.0).toFixed(6), // Random longitude in the USA
        temperature: Math.floor(Math.random() * 100), // Random temperature
        humidity: Math.floor(Math.random() * 100), // Random humidity
        windSpeed: (Math.random() * 20).toFixed(2), // Random wind speed
        rainfall: Math.floor(Math.random() * 50), // Random rainfall data for 24 hours
        description: `Station located at ${((Math.random() * 180 - 90).toFixed(4))}, ${((Math.random() * 360 - 180).toFixed(4))}`,
        temperature24h: Array.from({ length: 24 }, () => (baseTemperature + (Math.random() * 5 - 2.5)).toFixed(2)), // Random temperature for 24 hours
        rainfall24h: Array.from({ length: 24 }, () => (baseRainfall + (Math.random() * 2 - 1)).toFixed(2)) // Random rainfall for 24 hours
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
