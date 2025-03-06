const mongoose = require('mongoose');
const Station = require('./models/Station'); // Assuming Station model is defined

const uri = 'mongodb://127.0.0.1:27017/testWeatherDB'; // MongoDB connection string

const generateSampleData = (num) => {
    const stations = [];
    for (let i = 1; i <= num; i++) {
        stations.push({
            name: `Station ${i}`,
            latitude: (Math.random() * 180 - 90).toFixed(4), // Random latitude between -90 and 90
            longitude: (Math.random() * 360 - 180).toFixed(4), // Random longitude between -180 and 180
            temperature: Math.floor(Math.random() * 40), // Random temperature between 0 and 40
            humidity: Math.floor(Math.random() * 100), // Random humidity between 0 and 100
            windSpeed: (Math.random() * 20).toFixed(2), // Random wind speed between 0 and 20
            lastUpdated: new Date(),
        });
    }
    return stations;
};

const sampleData = generateSampleData(500);

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('Connected to the database');
        await Station.insertMany(sampleData);
        console.log('Sample data inserted');
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });
