import React from 'react';
import { WMSTileLayer } from 'react-leaflet';

const RadarLayer = ({ selectedHour, time }) => {
  return (
    <WMSTileLayer
      url="https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi"
      layers={`nexrad-n0q-900913${time ? `-m${time}m` : ''}`}
      format="image/jpeg"
      transparent={true}
      opacity={100.0}
      version='1.1.1'
      time={new Date().toISOString()}
      attribution="Weather data © IEM NEXRAD"
    />
  );
};

export default RadarLayer;
