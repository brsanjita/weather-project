import React, { useEffect, useState } from 'react';
import {
  LayersControl,
  TileLayer,
  Marker,
  Popup,
  LayerGroup,
  MapContainer,
  useMap,
  WMSTileLayer
} from 'react-leaflet';
import 'leaflet.heat';
import { Spinner } from 'react-bootstrap';
import L from 'leaflet';
  
const WeatherMap = React.memo(() => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heatmapType, setHeatmapType] = useState('');
  const [heatmapLayer, setHeatmapLayer] = useState(null);
  const [selectedHour, setSelectedHour] = useState(0);
  const NEXRAD_URL = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi';
  const NEXRAD_LAYER = 'nexrad-n0q-900913';

  // For heatmap selection (rainfall vs. temperature)
  const [selectedLayer, setSelectedLayer] = useState('rain');
  // Toggle for radar overlay display
  const [showRadar, setShowRadar] = useState(false);
  
  // States for radar slider and auto-play
  const [radarFrame, setRadarFrame] = useState(0);
  const [radarPlaying, setRadarPlaying] = useState(false);
  // Define offsets (in minutes) covering the past 1 hour at 5‑minute intervals.
  // This creates an array: [0, 5, 10, ... , 60]
  const radarOffsets = Array.from({ length: Math.floor(60 / 5) + 1 }, (_, i) => i * 5);

  // Auto-advance the radar frame if playing is enabled.
  useEffect(() => {
    let intervalId;
    if (radarPlaying) {
      intervalId = setInterval(() => {
        setRadarFrame(prev => (prev + 1) % radarOffsets.length);
      }, 750);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [radarPlaying, radarOffsets.length]);

  // Compute the layer name based on the current radar frame.
  // When radarFrame is 0, use the base layer; otherwise, append a time offset suffix.
  const computedLayerName = radarFrame === 0 
    ? NEXRAD_LAYER 
    : `${NEXRAD_LAYER}-m${radarOffsets[radarFrame].toString().padStart(2, '0')}m`;

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/stations/24hour', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setStations(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stations:', error);
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  // Create a custom marker icon.
  const dotIcon = new L.Icon({
    iconUrl: '/dot-icon.png',
    iconSize: [10, 10],
    iconAnchor: [5, 5],
    popupAnchor: [0, -5]
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
      if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
      }
      const heatmapData = getHeatmapData();
      let newHeatmapLayer = null;
      if (heatmapData.length > 0) {
        if (heatmapType === 'temperature') {
          newHeatmapLayer = L.heatLayer(heatmapData, {
            radius: 25,
            gradient: { 0: 'blue', 0.5: 'yellow', 1: 'red' }
          });
        } else if (heatmapType === 'rainfall') {
          newHeatmapLayer = L.heatLayer(heatmapData, {
            radius: 25,
            gradient: { 0: 'darkblue', 0.5: 'darkgreen', 1: 'black' }
          });
        }
        map.addLayer(newHeatmapLayer);
        setHeatmapLayer(newHeatmapLayer);
      }
      return () => {
        if (newHeatmapLayer) map.removeLayer(newHeatmapLayer);
      };
    }, [stations, map, heatmapType, selectedHour]);
    return null;
  };

  // Handler for the heatmap slider; updates only selectedHour.
  const handleHeatmapSeekChange = (event) => {
    const hour = parseInt(event.target.value, 10);
    setSelectedHour(hour);
  };

  // The radar slider uses its own inline handler that updates radarFrame.
  const handlePlayPause = () => {
    setRadarPlaying(prev => !prev);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh' }}>
      
      {/* Top controls for heatmap selection */}
      <div style={{ marginBottom: '10px', backgroundColor: 'white', padding: '5px', borderRadius: '2px', textAlign: 'center' }}>
        <div>Select a heatmap below to see the last 24hr change:</div>
        <select style={{ marginBottom: '10px' }} onChange={(e) => {
          const selectedValue = e.target.value;
          console.log(`${selectedValue} Heatmap selected`);
          setHeatmapType(selectedValue);
          setHeatmapLayer(null);
        }}>
          <option value="">Select Heatmap</option>
          <option value="temperature">Temperature Heatmap</option>
          <option value="rainfall">Rainfall Heatmap</option>
        </select>
        {/* Place the heatmap slider below the dropdown */}
        {heatmapType && (
          <div style={{ marginTop: '10px' }}>
            <input
              type="range"
              min="0"
              max="23"
              step="1"
              value={selectedHour}
              onChange={handleHeatmapSeekChange}
            />
          </div>
        )}
      </div>
      
      {/* Radar controls placed in one column */}
      <div style={{ margin: '10px 0', backgroundColor: 'white', padding: '5px', borderRadius: '2px', textAlign: 'center' }}>
        <div>Use the Radar slider to see past 1hr changes:</div>
        <div>
          <label>
            <input 
              type="checkbox" 
              checked={showRadar} 
              onChange={e => setShowRadar(e.target.checked)}
            />
            Radar
          </label>
        </div>
        {showRadar && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '5px' }}>
            <input 
              type="range"
              min="0"
              max={radarOffsets.length - 1}
              value={radarFrame}
              onChange={(e) => {
                const frame = parseInt(e.target.value, 10);
                setRadarFrame(frame);
                setRadarPlaying(false);
              }}
              style={{ marginRight: '10px' }}
            />
            <button onClick={handlePlayPause}>
              {radarPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        )}
      </div>
      
      {/* Wrap MapContainer and legend inside a relative container */}
      <div style={{ position: 'relative', width: '800px', height: '600px', marginTop: '10px' }}>
        <MapContainer 
          center={[39.8283, -98.5795]} 
          zoom={4} 
          minZoom={0} 
          maxBounds={[[24.396308, -125.0], [49.384358, -66.93457]]}
          style={{ width: '100%', height: '100%' }}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Render the radar overlay with a key based on computedLayerName */}
              {showRadar && (
                <WMSTileLayer
                  key={computedLayerName}
                  url={NEXRAD_URL}
                  layers={computedLayerName}
                  format="image/png"
                  transparent={true}
                  version="1.1.1"
                  time={new Date().toISOString()}
                  opacity={0.9}
                  attribution="Weather data © IEM NEXRAD"
                />
              )}
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
                  {station.name}<br />
                  Temperature: {station.temperature24h[selectedHour]}°C<br />
                  Humidity: {station.humidity}%<br />
                  Wind Speed: {station.windSpeed} m/s<br />
                  Rainfall: {station.rainfall24h[selectedHour]} mm<br />
                  Description: {station.description}
                </Popup>
              </Marker>
            ))}
            <Marker position={[39.8283, -98.5795]} icon={dotIcon}>
              <Popup>Center of the USA</Popup>
            </Marker>
          </LayerGroup>
        </MapContainer>
        {/* Legend placed inside the relative container so it overlays the map */}
        <div 
          className="legend"
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            lineHeight: '1.2em',
            zIndex: 1000
          }}
        >
          <div><strong>Legend</strong></div>
          {heatmapType === 'temperature' && (
            <div>
              <div>Temperature Heatmap:</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ backgroundColor: 'blue', width: '15px', height: '15px', display: 'inline-block', marginRight: '5px' }}></span>
                Low
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ backgroundColor: 'yellow', width: '15px', height: '15px', display: 'inline-block', marginRight: '5px' }}></span>
                Medium
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ backgroundColor: 'red', width: '15px', height: '15px', display: 'inline-block', marginRight: '5px' }}></span>
                High
              </div>
            </div>
          )}
          {heatmapType === 'rainfall' && (
            <div>
              <div>Rainfall Heatmap:</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ backgroundColor: 'darkblue', width: '15px', height: '15px', display: 'inline-block', marginRight: '5px' }}></span>
                Low
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ backgroundColor: 'darkgreen', width: '15px', height: '15px', display: 'inline-block', marginRight: '5px' }}></span>
                Medium
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ backgroundColor: 'black', width: '15px', height: '15px', display: 'inline-block', marginRight: '5px' }}></span>
                High
              </div>
            </div>
          )}
          {showRadar && (
            <div>
              <div>Radar Overlay:</div>
              <div style={{ fontSize: '10px' }}>Data from IEM NEXRAD</div>
            </div>
          )}
        </div>
      </div>
      
      {loading && <Spinner animation="border" />}
    </div>
  );
});

export default WeatherMap;
