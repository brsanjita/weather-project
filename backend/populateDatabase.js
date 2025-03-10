const mongoose = require('mongoose');
const Station = require('./models/Station');

async function generateStations() {
  try {
    // Connect to MongoDB (options are deprecated in Node.js Driver 4+)
    await mongoose.connect('mongodb://localhost:27017/testWeatherDB');
    console.log('MongoDB connected');

    // Clear existing stations
    await Station.deleteMany({});

    const stations = [];
    const numStations = 500; // Generate 500 stations

    for (let i = 0; i < numStations; i++) {
      // Generate a base temperature between 0 and 50°C
      const baseTemperature = Math.random() * 50;
      // Generate a base rainfall between 0 and 20 mm
      const baseRainfall = Math.random() * 20;

      // Generate temperature24h: add a noise of ±5°C; clamp to 0.
      const temperature24h = Array.from({ length: 24 }, () => 
        Math.max(0, baseTemperature + (Math.random() * 10 - 5)).toFixed(2)
      );
      
      // Generate rainfall24h: add a noise of ±2 mm; clamp to 0.
      const rainfall24h = Array.from({ length: 24 }, () => 
        Math.max(0, baseRainfall + (Math.random() * 4 - 2)).toFixed(2)
      );

      const station = {
        name: `Station ${i + 1}`,
        latitude: parseFloat((Math.random() * (49.384358 - 24.396308) + 24.396308).toFixed(6)),
        longitude: parseFloat((Math.random() * (-66.93457 - (-125.0)) + (-125.0)).toFixed(6)),
        temperature24h,
        rainfall24h,
        temperature: temperature24h[temperature24h.length - 1],
        rainfall: rainfall24h[rainfall24h.length - 1],
        humidity: Math.floor(Math.random() * 100),
        windSpeed: (Math.random() * 20).toFixed(2),
        description: `Station located at ${((Math.random() * 180 - 90).toFixed(4))}, ${((Math.random() * 360 - 180).toFixed(4))}`
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
