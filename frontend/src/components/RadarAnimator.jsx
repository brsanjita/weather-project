// RadarAnimator.jsx
import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

function RadarAnimator({ active, selectedHour }) {
  console.log("RadarAnimator active:", active); // Debugging log
  const map = useMap();
  const radarLayersRef = useRef([]);
  const intervalRef = useRef();

  useEffect(() => {
    if (!active) return;

    // Define time offsets in minutes (0 is current)
    const offsets = Array.from({ length: 11 }, (_, i) => i * 5); // 0, 5, 10, ..., 50
    const baseLayer = 'nexrad-n0q-900913';

    // Create WMS layers for each timestamp and add them to the map
    radarLayersRef.current = offsets.map(min => {
      console.log("Creating layer for offset:", min); // Debugging log
      const suffix = min === 0 ? '' : `-m${min.toString().padStart(2, '0')}m${selectedHour ? `-${selectedHour}` : ''}`;
      const layerName = baseLayer + suffix;
      const tileLayer = L.tileLayer.wms(
        'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi',
        {
          layers: layerName,
          format: 'image/png',
          transparent: true,
          opacity: 0.0, // start hidden
        }
      );
      tileLayer.addTo(map);
      console.log("Layer added to map:", layerName); // Debugging log
      console.log("Layer name for offset:", layerName); // Additional debugging log for layer names
      return tileLayer;
    });

    // Start animation by cycling through the layers
    let index = 0;
      radarLayersRef.current[index].setOpacity(1.0); // show first frame for testing
      console.log("First layer opacity set to 1.0"); // Debugging log for opacity

    intervalRef.current = setInterval(() => {
      // Hide current frame
      radarLayersRef.current[index].setOpacity(0.0);
      // Move to the next frame (looping back to start)
      index = (index + 1) % radarLayersRef.current.length;
      // Show next frame
      radarLayersRef.current[index].setOpacity(0.9);
    }, 10000); // adjust frame interval as needed
    console.log("Animation interval set to 10000ms"); // Debugging log for interval

    // Cleanup on unmount or toggle change
    return () => {
      clearInterval(intervalRef.current);
      radarLayersRef.current.forEach(layer => map.removeLayer(layer));
      radarLayersRef.current = [];
    };
  }, [active, map]);

  return null;
}

export default RadarAnimator;
