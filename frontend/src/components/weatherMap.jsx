import React, { useEffect, useState } from 'react';
import { LayersControl, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet';
import { Spinner } from 'react-bootstrap';
import { MapContainer } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet for custom icons

const WeatherMap = React.memo(() => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStations = async () => {
      const response = await fetch('http://localhost:4000/api/stations');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setStations(data);
      setLoading(false);
    };
    fetchStations();
  }, []);

  // Create a custom icon for the marker
  const dotIcon = new L.Icon({
    iconUrl: '/dot-icon.png', // Updated path to the dot icon image
    iconSize: [10, 10], // Size of the icon
    iconAnchor: [5, 5], // Anchor point of the icon
    popupAnchor: [0, -5] // Popup anchor point
  });

  return (
    <div style={{ width: '800px', margin: '0 auto' }}>
      <h2><center>Weather Stations</center></h2>
      <MapContainer center={[39.8283, -98.5795]} zoom={4} style={{ height: '600px', width: '100%' }}>
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
            <Marker key={station._id} position={[station.latitude, station.longitude]} icon={dotIcon}>
              <Popup>
                {station.name}<br />Temperature: {station.temperature}°C<br />Humidity: {station.humidity}%<br />Wind Speed: {station.windSpeed} m/s<br />Description: {station.description}
              </Popup>
            </Marker>
          ))}
          {/* Marker for the center of the USA */}
          <Marker position={[39.8283, -98.5795]} icon={dotIcon}>
            <Popup>
              Center of the USA
            </Popup>
          </Marker>
        </LayerGroup>
      </MapContainer>
      {loading && <Spinner animation="border" />}
    </div>
  );
});

export default WeatherMap;
