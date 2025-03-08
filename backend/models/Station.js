 const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema({
  name: String,
  latitude: Number,
  longitude: Number,
  temperature: Number,
  rainfall: Number,
  humidity: Number,
  windSpeed: Number,
  description: String,
  temperature24h: [Number], // Array to hold temperature data for the last 24 hours
  rainfall24h: [Number] // Array to hold rainfall data for the last 24 hours
});


module.exports = mongoose.model('Station', StationSchema);
