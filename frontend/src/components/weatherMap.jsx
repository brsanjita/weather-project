import React, { useEffect, useState } from 'react';
import { LayersControl, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet';
import 'leaflet.heat'; // Import leaflet.heat for heatmap functionality
import { Spinner } from 'react-bootstrap';
import { MapContainer, useMap } from 'react-leaflet';
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

  const heatmapData = stations.map(station => [station.latitude, station.longitude, station.temperature]); // Assuming temperature is used for heatmap

  const MapWithHeatmap = () => {
    const map = useMap();

    useEffect(() => {
      const heatmapLayer = L.heatLayer(heatmapData, { radius: 25 }).addTo(map);
      return () => {
        map.removeLayer(heatmapLayer);
      };
    }, [heatmapData, map]);

    return null; // This component does not render anything
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <MapContainer center={[39.8283, -98.5795]} zoom={4} style={{ height: '600px', width: '800px' }}>
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
        <MapWithHeatmap />
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
