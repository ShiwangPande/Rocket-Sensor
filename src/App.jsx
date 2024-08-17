import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const App = () => {
  const [sensorData, setSensorData] = useState({
    temperature: null,
    pressure: null,
    altitude: null,
    humidity: null,
    dhtTemp: null,
  });

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/data');
      const data = await response.json();
      setSensorData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000); // Fetch data every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="bg-gradient-to-r from-space via-gray-800 to-gray-900 p-8 min-h-screen">
      <div className="container mx-auto">
        <header className="text-center mb-12">
          <motion.h1
            className="text-6xl font-bold text-rocket mb-4"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            🚀 Rocket Sensor Dashboard
          </motion.h1>
          <p className="text-xl text-gray-300">Monitoring data from your rocket's sensors</p>
        </header>
        <div className="bg-space shadow-xl rounded-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              className="bg-gray-900 p-6 rounded-lg shadow-lg border border-flame"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-4xl font-semibold text-rocket mb-4">📡 BMP280 Sensor Data</h2>
              <p className="text-lg text-gray-300"><strong>Temperature:</strong> {sensorData.temperature !== null ? sensorData.temperature.toFixed(2) + ' °C' : 'N/A'}</p>
              <p className="text-lg text-gray-300"><strong>Pressure:</strong> {sensorData.pressure !== null ? sensorData.pressure.toFixed(2) + ' Pa' : 'N/A'}</p>
              <p className="text-lg text-gray-300"><strong>Altitude:</strong> {sensorData.altitude !== null ? sensorData.altitude.toFixed(2) + ' m' : 'N/A'}</p>
            </motion.div>
            <motion.div
              className="bg-gray-900 p-6 rounded-lg shadow-lg border border-flame"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-4xl font-semibold text-rocket mb-4">🌡️ DHT11 Sensor Data</h2>
              <p className="text-lg text-gray-300"><strong>Humidity:</strong> {sensorData.humidity !== null ? sensorData.humidity.toFixed(2) + ' %' : 'N/A'}</p>
              <p className="text-lg text-gray-300"><strong>Temperature:</strong> {sensorData.dhtTemp !== null ? sensorData.dhtTemp.toFixed(2) + ' °C' : 'N/A'}</p>
            </motion.div>
            <motion.div
              className="bg-gray-900 p-6 rounded-lg shadow-lg border border-flame col-span-2"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-4xl font-semibold text-rocket mb-4">📊 Full Sensor Data</h2>
              <p className="text-lg text-gray-300"><strong>Raw BMP280 Temperature:</strong> {sensorData.temperature !== null ? sensorData.temperature.toFixed(2) + ' °C' : 'N/A'}</p>
              <p className="text-lg text-gray-300"><strong>Raw BMP280 Pressure:</strong> {sensorData.pressure !== null ? sensorData.pressure.toFixed(2) + ' Pa' : 'N/A'}</p>
              <p className="text-lg text-gray-300"><strong>Raw BMP280 Altitude:</strong> {sensorData.altitude !== null ? sensorData.altitude.toFixed(2) + ' m' : 'N/A'}</p>
              <p className="text-lg text-gray-300"><strong>Raw DHT11 Humidity:</strong> {sensorData.humidity !== null ? sensorData.humidity.toFixed(2) + ' %' : 'N/A'}</p>
              <p className="text-lg text-gray-300"><strong>Raw DHT11 Temperature:</strong> {sensorData.dhtTemp !== null ? sensorData.dhtTemp.toFixed(2) + ' °C' : 'N/A'}</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
