const express = require('express');
const router = express.Router();
const Station = require('../models/Station');

// GET endpoint to fetch 24-hour data for all stations
router.get('/24hour', async (req, res) => {
  const hour = req.query.hour; // Get the hour from query parameters
  let query = {};
  if (hour) {
    query = { 'temperature24h.hour': parseInt(hour) }; // Modify query to filter by hour
  }
  // Fetching data for all stations
  try {
    const stations = await Station.find(query, 'name latitude longitude temperature rainfall humidity windSpeed description temperature24h rainfall24h')
      .sort({ name: 1 }); // Sorting stations by name
    res.json(stations);
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
