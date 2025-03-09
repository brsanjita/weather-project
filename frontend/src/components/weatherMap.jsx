import React, { useEffect, useState } from 'react';
import { LayersControl, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet';
import 'leaflet.heat'; // Import leaflet.heat for heatmap functionality
import { Spinner } from 'react-bootstrap';
import { MapContainer, useMap } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet for custom icons

const WeatherMap = React.memo(() => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heatmapType, setHeatmapType] = useState(''); // State to manage heatmap type
  const [heatmapLayer, setHeatmapLayer] = useState(null); // State to manage the active heatmap layer
  const [selectedHour, setSelectedHour] = useState(0); // State to manage the selected hour for the seek toggle

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/stations/24hour', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json(); 
        setLoading(false);
        setStations(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stations:', error);
        setLoading(false);
      }
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

  const getHeatmapData = () => {
    if (heatmapType === 'temperature') {
      return stations.map(station => [station.latitude, station.longitude, station.temperature24h[selectedHour]]);
    } else if (heatmapType === 'rainfall') {
      return stations.map(station => [station.latitude, station.longitude, station.rainfall24h[selectedHour]]);
    }
    return [];
  };

  const MapWithHeatmap = () => {
    const map = useMap();

    useEffect(() => {
      // Remove the existing heatmap layer if it exists
      if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
      }

      const heatmapData = getHeatmapData();
      let newHeatmapLayer = null;

      if (heatmapData.length > 0) {
        if (heatmapType === 'temperature') {
          newHeatmapLayer = L.heatLayer(heatmapData, { radius: 25, gradient: { 0: 'blue', 0.5: 'yellow', 1: 'red' } });
        } else if (heatmapType === 'rainfall') {
          newHeatmapLayer = L.heatLayer(heatmapData, { radius: 25, gradient: { 0: 'darkblue', 0.5: 'darkgreen', 1: 'black' } });
        }
        map.addLayer(newHeatmapLayer);
        setHeatmapLayer(newHeatmapLayer);
      }

      return () => {
        if (newHeatmapLayer) {
          map.removeLayer(newHeatmapLayer);
        }
      };
    }, [stations, map, heatmapType, selectedHour]);

    return null; // This component does not render anything
  };

  const handleSeekChange = (event) => {
    const hour = parseInt(event.target.value, 10); // Ensure hour is an integer
    setSelectedHour(hour); // Update the selected hour state
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh' }}>
      <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'white', padding: '5px', borderRadius: '2px' }}>
        <div>Use the slider below and select the respective heatmap to observe weather in last 24hrs.</div>
        <input
          type="range"
          min="0"
          max="23"
          step="1"
          value={selectedHour}
          onChange={handleSeekChange}
          style={{ marginRight: '10px' }}
        />

        <select style={{ marginBottom: '10px' }} onChange={(e) => {
          const selectedValue = e.target.value;
          console.log(`${selectedValue} Heatmap selected`);
          setHeatmapType(selectedValue);
          setHeatmapLayer(null); // Reset heatmap layer when selection changes
        }}>
          <option value="">Select Heatmap</option>
          <option value="temperature">Temperature Heatmap</option>
          <option value="rainfall">Rainfall Heatmap</option>
        </select>
      </div>
      <MapContainer 
        center={[39.8283, -98.5795]} 
        zoom={4} 
        minZoom={0} 
        maxBounds={[[24.396308, -125.0], [49.384358, -66.93457]]} // Set bounds for the map
        maxBoundsVisble={true} // Prevent the map from moving out of visibility
        style={{ height: '600px', width: '800px', position: 'relative', marginTop: '10px' }}
      >
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
          {stations && stations.map(station => (
            <Marker 
              key={`${station._id}-${station.temperature24h}`} 
              position={[station.latitude, station.longitude]} 
              icon={dotIcon}
            >
              <Popup>
                {station.name}<br />Temperature: {station.temperature24h[selectedHour]}°C<br />Humidity: {station.humidity}%<br />Wind Speed: {station.windSpeed} m/s<br />Rainfall: {station.rainfall24h[selectedHour]} mm<br />Description: {station.description}
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
      <div className="task-bar" style={{ position: 'absolute', right: '10px', bottom: '10px', backgroundColor: 'white', padding: '10px', borderRadius: '5px' }}>
        <div className="legend" style={{ fontSize: '12px' }}>
          <h4 style={{ fontSize: '10px' }}>Heatmap Legend</h4>
          <div><span style={{ backgroundColor: 'red', width: '15px', height: '15px', display: 'inline-block' }}></span> High Temperature</div>
          <div><span style={{ backgroundColor: 'yellow', width: '15px', height: '15px', display: 'inline-block' }}></span> Medium Temperature</div>
          <div><span style={{ backgroundColor: 'blue', width: '15px', height: '15px', display: 'inline-block' }}></span> Low Temperature</div>
          <div><span style={{ backgroundColor: 'black', width: '15px', height: '15px', display: 'inline-block' }}></span> High Rainfall</div>
          <div><span style={{ backgroundColor: 'darkgreen', width: '15px', height: '15px', display: 'inline-block' }}></span> Medium Rainfall</div>
          <div><span style={{ backgroundColor: 'darkblue', width: '15px', height: '15px', display: 'inline-block' }}></span> Low Rainfall</div>
        </div>
      </div>
    </div>
  );
});

export default WeatherMap;
