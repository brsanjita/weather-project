import React, { useEffect, useState } from 'react';
import { LayersControl, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet'; // Import LayersControl and other components
import { Spinner } from 'react-bootstrap'; // Import Spinner for loading state
import { MapContainer } from 'react-leaflet';

const WeatherMap = React.memo(() => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
        const fetchStations = async () => {
      console.log("Fetching stations..."); // Added console log for debugging
      const response = await fetch('http://localhost:4000/api/stations');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log("Fetched data:", data); // Added console log to inspect fetched data
      console.log("Fetching stations..."); // Added console log for debugging
      try {
        const response = await fetch('http://localhost:4000/api/stations');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setStations(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  return (
    <div style={{ width: '600px', margin: '0 auto' }}> {/* Centering the map */}
      <h2><center>Weather Stations</center></h2> 
      <MapContainer center={stations.length > 0 ? [34.0522, -118.2437] : [51.505, -0.09]} zoom={5} style={{ height: '400px', width: '100%' }}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution="&copy; Google Satellite"
              url="http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Terrain">
            <TileLayer
              attribution="&copy; Google Terrain"
              url="http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        <LayerGroup>
          {stations.map(station => (
            <Marker key={station._id} position={[station.latitude, station.longitude]}>
              <Popup>
                {station.name}<br />Temperature: {station.temperature}°C<br />Humidity: {station.humidity}%<br />Wind Speed: {station.windSpeed} m/s<br />Description: {station.description}
              </Popup>
            </Marker>
          ))}
        </LayerGroup>
      </MapContainer>
      {loading && <Spinner animation="border" />} {/* Show loading spinner while fetching data */}
    </div>
  );
});

export default WeatherMap;
