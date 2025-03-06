const NodeCache = require('node-cache');
const Station = require('./models/Station'); // Import Station model

const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

const getCachedStations = async () => { 
  const cachedData = cache.get('stations');
  if (cachedData) {
    return cachedData;
  }

  const stations = await Station.find({}); // Ensure this fetches the correct data
  console.log('Fetched stations:', stations); // Log the fetched stations for debugging
  cache.set('stations', stations);
  return stations;
};

// Define the getWeatherData function
const getWeatherData = async () => {
  console.log('Fetching weather data...'); // Log when fetching weather data
  return await getCachedStations(); // Fetch stations from cache or database
};

module.exports = { getCachedStations, getWeatherData };
