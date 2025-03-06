import React, { Suspense, lazy } from 'react';
const WeatherMap = lazy(() => import('./components/weatherMap.jsx'));

const App = () => {
    return (
        <div>
            <h1><center>Welcome to the Weather App</center></h1>
            <Suspense fallback={<div>Loading...</div>}>
                <WeatherMap />
            </Suspense>
        </div>
    );
};

export default App;
