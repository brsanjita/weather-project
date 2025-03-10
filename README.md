# Weather Project

## Overview
This project is a weather application that provides real-time weather data for various stations across the USA. It consists of a backend server built with Node.js and Express, and a frontend application built with React.

## Features
- Real-time weather data display.
- Interactive map with weather station markers.
- Heatmaps for temperature and rainfall.
- Data caching for improved performance.

## File Descriptions

### Backend

- **server.js**: 
  - Sets up the Express server and connects to the MongoDB database.
  - Defines API routes for fetching weather station data.
  - Handles requests to fetch all stations and individual station data.
  - Ensures proper error handling and logging for API requests.

- **populateDatabase.js**: 
  - Connects to the MongoDB database and generates random weather station data.
  - Inserts 500 randomly generated stations into the database.
  - Can be modified to change the number of stations or data characteristics.

- **routes/stations.js**: 
  - Defines routes for fetching weather data for all stations and specific stations.
  - Includes a route to fetch 24-hour weather data for all stations.
  - Implements middleware for validating requests and handling errors.

- **models/Station.js**: 
  - Defines the Mongoose schema for the weather station data, including fields for temperature, humidity, wind speed, and more.
  - Includes methods for data validation and transformation.

- **cache.js**: 
  - Contains functions for caching weather data to improve performance and reduce database load.
  - Implements strategies for cache expiration and invalidation.

### Setup Instructions for Running the Application

### Backend

- **server.js**: 
  - Sets up the Express server and connects to the MongoDB database.
  - Defines API routes for fetching weather station data.
  - Handles requests to fetch all stations and individual station data.
  - Ensures proper error handling and logging for API requests.

- **populateDatabase.js**: 
  - Connects to the MongoDB database and generates random weather station data.
  - Inserts 500 randomly generated stations into the database.
  - Can be modified to change the number of stations or data characteristics.

- **routes/stations.js**: 
  - Defines routes for fetching weather data for all stations and specific stations.
  - Includes a route to fetch 24-hour weather data for all stations.
  - Implements middleware for validating requests and handling errors.

- **models/Station.js**: 
  - Defines the Mongoose schema for the weather station data, including fields for temperature, humidity, wind speed, and more.
  - Includes methods for data validation and transformation.

- **cache.js**: 
  - Contains functions for caching weather data to improve performance and reduce database load.
  - Implements strategies for cache expiration and invalidation.

### Setup Instructions for Running the Application
  - Sets up the Express server and connects to the MongoDB database.
  - Defines API routes for fetching weather station data.
  - Handles requests to fetch all stations and individual station data.

- **populateDatabase.js**: 
  - Connects to the MongoDB database and generates random weather station data.
  - Inserts 500 randomly generated stations into the database.

- **routes/stations.js**: 
  - Defines routes for fetching weather data for all stations and specific stations.
  - Includes a route to fetch 24-hour weather data for all stations.

- **models/Station.js**: 
  - Defines the Mongoose schema for the weather station data, including fields for temperature, humidity, wind speed, and more.

- **cache.js**: 
  - Contains functions for caching weather data to improve performance and reduce database load.

### Frontend

- **src/app.js**: 
  - The main entry point for the React application.
  - Renders the `WeatherMap` component.

- **src/components/weatherMap.jsx**: 
  - Displays a map with weather station data using Leaflet.
  - Fetches data from the backend and allows users to view temperature and rainfall heatmaps.
  - Includes interactive markers for each weather station with detailed information.

## Setup Instructions for Running the Application

### Prerequisites
- Node.js and npm installed on your machine.
- MongoDB installed and running.

### MongoDB Setup
- Install MongoDB on your machine by following the official installation guide.
- Start the MongoDB service:
   ```bash
   mongod
   ```
- Optionally, create a new database and user for the application.

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Populate the database with random station data:
   ```bash
   node populateDatabase.js
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the frontend application:
   ```bash
   npm start
   ```

### Running the Application
- The backend server will run on `http://localhost:4000`.
- The frontend application will run on `http://localhost:3000`.

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Populate the database with random station data:
   ```bash
   node populateDatabase.js
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the frontend application:
   ```bash
   npm start
   ```

## Running the Application
- The backend server will run on `http://localhost:4000`.
- The frontend application will run on `http://localhost:3000`.

## Conclusion
This README provides an overview of the project structure, file functionalities, and setup instructions. For any issues or further assistance, please refer to the project documentation or contact the project maintainers.
