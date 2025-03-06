const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema({
  name: String,
  latitude: Number,
  longitude: Number,
  temperature: Number,
  humidity: Number,
  windSpeed: Number,
  lastUpdated: Date,
  description: String // Added description field for additional information
});

module.exports = mongoose.model('Station', StationSchema);
