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
  // Data states
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Heatmap states
  const [heatmapType, setHeatmapType] = useState('');
  const [heatmapLayer, setHeatmapLayer] = useState(null);
  // We'll use selectedHourSlider as the slider value (0-23) and then compute effective hour as (23 - slider)
  const [selectedHourSlider, setSelectedHourSlider] = useState(0);
  const effectiveHour = 23 - selectedHourSlider; // 0 slider = 23 hrs ago, 23 slider = 0 hrs ago

  // Radar settings
  const NEXRAD_URL = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi';
  const NEXRAD_LAYER = 'nexrad-n0q-900913';
  const [showRadar, setShowRadar] = useState(false);
  const [radarFrame, setRadarFrame] = useState(0);
  const [radarPlaying, setRadarPlaying] = useState(false);
  // Radar offsets (in minutes) for past 1hr at 5-minute intervals: [0, 5, 10, ... , 60]
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

  // Compute WMSTileLayer layer name for radar
  const computedLayerName = radarFrame === 0 
    ? NEXRAD_LAYER 
    : `${NEXRAD_LAYER}-m${radarOffsets[radarFrame].toString().padStart(2, '0')}m`;

  // Fetch station data
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

  // Custom marker icon
  const dotIcon = new L.Icon({
    iconUrl: '/dot-icon.png',
    iconSize: [10, 10],
    iconAnchor: [5, 5],
    popupAnchor: [0, -5]
  });

  // Build heatmap data using effectiveHour (i.e. 23 - selectedHourSlider)
  const getHeatmapData = () => {
    if (heatmapType === 'temperature') {
      return stations.map(station => [station.latitude, station.longitude, station.temperature24h[effectiveHour]]);
    } else if (heatmapType === 'rainfall') {
      return stations.map(station => [station.latitude, station.longitude, station.rainfall24h[effectiveHour]]);
    }
    return [];
  };

  // Heatmap layer management component
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
    }, [stations, map, heatmapType, effectiveHour]);
    return null;
  };

  // Handler for the heatmap slider (updates selectedHourSlider)
  const handleHeatmapSeekChange = (event) => {
    const sliderValue = parseInt(event.target.value, 10);
    setSelectedHourSlider(sliderValue);
  };

  // Handler for the radar slider (updates radarFrame)
  const handleRadarSeekChange = (event) => {
    const frame = parseInt(event.target.value, 10);
    setRadarFrame(frame);
    setRadarPlaying(false);
  };

  const handlePlayPause = () => {
    setRadarPlaying(prev => !prev);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}>
      {/* Heatmap Controls */}
      <div style={{
          width: '800px',
          margin: '10px auto',
          padding: '10px',
          backgroundColor: '#f8f8f8',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
        <h3>Heatmap Controls</h3>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Select Heatmap:</label>
          <select 
            onChange={(e) => {
              const selectedValue = e.target.value;
              setHeatmapType(selectedValue);
              setHeatmapLayer(null);
            }}
            style={{ padding: '5px', fontSize: '14px' }}
          >
            <option value="">--Select Heatmap--</option>
            <option value="temperature">Temperature Heatmap</option>
            <option value="rainfall">Rainfall Heatmap</option>
          </select>
        </div>
        {heatmapType && (
          <div style={{ marginTop: '10px' }}>
            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>
              Hour: {effectiveHour} {effectiveHour === 1 ? 'hr ago' : 'hrs ago'}
            </label>
            <input
              type="range"
              min="0"
              max="23"
              step="1"
              value={selectedHourSlider}
              onChange={handleHeatmapSeekChange}
              style={{ width: '300px' }}
            />
          </div>
        )}
      </div>
      
      {/* Radar Controls */}
      <div style={{
          width: '800px',
          margin: '10px auto',
          padding: '10px',
          backgroundColor: '#f8f8f8',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
        <h3>Radar Controls</h3>
        <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>
          Use the Radar slider to see past 1hr changes:
        </div>
        <div style={{ marginBottom: '5px' }}>
          <label>
            <input 
              type="checkbox" 
              checked={showRadar} 
              onChange={e => setShowRadar(e.target.checked)}
              style={{ marginRight: '5px' }}
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
              onChange={handleRadarSeekChange}
              style={{ width: '300px', marginRight: '10px' }}
            />
            <button onClick={handlePlayPause} style={{ padding: '5px 10px', fontSize: '14px' }}>
              {radarPlaying ? 'Pause' : 'Play'}
            </button>
            <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
              {radarOffsets[radarFrame] === 0 ? 'Current' : `${radarOffsets[radarFrame]} min ago`}
            </span>
          </div>
        )}
      </div>
      
      {/* Map and Legend Container */}
      <div style={{ position: 'relative', width: '800px', height: '600px', margin: '20px auto' }}>
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
                <Popup style={{ fontSize: '14px' }}>
                  <strong>{station.name}</strong><br />
                  Temperature: {station.temperature24h[effectiveHour]}°C<br />
                  Humidity: {station.humidity}%<br />
                  Wind Speed: {station.windSpeed} m/s<br />
                  Rainfall: {station.rainfall24h[effectiveHour]} mm<br />
                  Description: {station.description}
                </Popup>
              </Marker>
            ))}
            {/* <Marker position={[39.8283, -98.5795]} icon={dotIcon}>
              <Popup style={{ fontSize: '14px' }}>Center of the USA</Popup>
            </Marker> */}
          </LayerGroup>
        </MapContainer>
        {/* Legend overlay */}
        <div 
          className="legend"
          style={{
            position: 'absolute',
            bottom: '15px',
            right: '15px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            lineHeight: '1.2em',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Legend</div>
          {heatmapType === 'temperature' && (
            <div style={{ marginBottom: '5px' }}>
              <div>Temperature Heatmap:</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ backgroundColor: 'blue', width: '15px', height: '15px', marginRight: '5px' }}></span>
                Low
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ backgroundColor: 'yellow', width: '15px', height: '15px', marginRight: '5px' }}></span>
                Medium
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ backgroundColor: 'red', width: '15px', height: '15px', marginRight: '5px' }}></span>
                High
              </div>
            </div>
          )}
          {heatmapType === 'rainfall' && (
            <div style={{ marginBottom: '5px' }}>
              <div>Rainfall Heatmap:</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ backgroundColor: 'darkblue', width: '15px', height: '15px', marginRight: '5px' }}></span>
                Low
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ backgroundColor: 'darkgreen', width: '15px', height: '15px', marginRight: '5px' }}></span>
                Medium
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ backgroundColor: 'black', width: '15px', height: '15px', marginRight: '5px' }}></span>
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
