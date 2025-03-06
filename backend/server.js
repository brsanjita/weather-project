// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Station = require('./models/Station');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1) Connect to MongoDB
// Replace the connection string with your own MongoDB URI
mongoose.connect('mongodb://127.0.0.1:27017/testWeatherDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

const { getCachedStations, getWeatherData } = require('./cache'); // Import caching and weather data functions

// 2) Routes
// Fetch all stations with current weather data
app.get('/api/stations', async (req, res) => {
  console.log('Fetching all stations'); // Log when fetching stations
  try {
    const stations = await getWeatherData(); // Fetch weather data directly
    if (!stations || stations.length === 0) {
      return res.status(404).json({ error: 'No stations found' }); // Handle case where no stations are found
    }
    res.json(stations); // Send the fetched stations as a response
  } catch (err) { // Handle any errors that occur during the fetch
    res.status(500).json({ error: err.message });
  }
});

// Optionally, a route to fetch a single station by ID
app.get('/api/stations/:id', async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }
    res.json(station);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3) Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
