import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import jsPDF from 'jspdf';
import { CSVLink } from 'react-csv';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';
import ThreeDModel from './components/ThreeDModel';
import { playAlertSound } from './assets/alertSound';

// Register ChartJS components
ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const loadFromLocalStorage = () => {
  const savedData = localStorage.getItem('sensorDataHistory');
  return savedData ? JSON.parse(savedData) : {
    dhtTemp: [],
    humidity: [],
    temperature: [],
    pressure: [],
    altitude: [],
    accelX: [],
    accelY: [],
    accelZ: [],
    labels: [],
  };
};

const saveToLocalStorage = (dataHistory) => {
  localStorage.setItem('sensorDataHistory', JSON.stringify(dataHistory));
};

const exportAllChartsAsPDF = async (chartRefs) => {
  const pdf = new jsPDF();
  let isFirstPage = true;

  for (const [index, chartRef] of chartRefs.entries()) {
    const canvas = chartRef.current?.toBase64Image();
    if (canvas) {
      const img = new Image();
      img.src = canvas;
      await new Promise(resolve => {
        img.onload = () => {
          if (!isFirstPage) pdf.addPage();
          pdf.addImage(img, 'PNG', 10, 10, 190, 270);
          isFirstPage = false;
          resolve();
        };
      });
    }
  }

  pdf.save('All_Charts.pdf');
};

const App = () => {
  const [sensorData, setSensorData] = useState({
    dhtTemp: null,
    humidity: null,
    temperature: null,
    pressure: null,
    altitude: null,
    accelX: null,
    accelY: null,
    accelZ: null,
  });
  const [dataHistory, setDataHistory] = useState(loadFromLocalStorage());
  const [loading, setLoading] = useState(true);

  const chartRefs = {
    dhtTemp: useRef(null),
    humidity: useRef(null),
    temperature: useRef(null),
    pressure: useRef(null),
    altitude: useRef(null),
    accelX: useRef(null),
    accelY: useRef(null),
    accelZ: useRef(null),
  };

  // Establish WebSocket connection
  useEffect(() => {
    const ws = new WebSocket('wss://rocket-sensor-backend.onrender.com/data'); // Update with your WebSocket URL
  
    const handleWebSocketOpen = () => {
      console.log('WebSocket connected');
      setLoading(false);
    };
  
    const handleWebSocketMessage = (event) => {
      const data = JSON.parse(event.data);
      setSensorData(data);
  
      // Update data history without affecting previous state directly
      setDataHistory(prevDataHistory => {
        const newDataHistory = {
          dhtTemp: [...prevDataHistory.dhtTemp, data.dhtTemp],
          humidity: [...prevDataHistory.humidity, data.humidity],
          temperature: [...prevDataHistory.temperature, data.temperature],
          pressure: [...prevDataHistory.pressure, data.pressure],
          altitude: [...prevDataHistory.altitude, data.altitude],
          accelX: [...prevDataHistory.accelX, data.accelX],
          accelY: [...prevDataHistory.accelY, data.accelY],
          accelZ: [...prevDataHistory.accelZ, data.accelZ],
          labels: [...prevDataHistory.labels, new Date().toLocaleTimeString()],
        };
  
        // Save updated data history to localStorage
        saveToLocalStorage(newDataHistory);
        return newDataHistory;
      });
  
      // Play sound and show notification if temperature exceeds threshold
      if (data.temperature > 37) { // Adjust threshold as needed
        playAlertSound(); // Play the alert sound
      }
    };
  
    const handleWebSocketError = (error) => {
      console.error('WebSocket error:', error);
      // Optionally handle reconnection here
    };
  
    const handleWebSocketClose = () => {
      console.log('WebSocket closed');
      // Optionally handle reconnection here
    };
  
    ws.addEventListener('open', handleWebSocketOpen);
    ws.addEventListener('message', handleWebSocketMessage);
    ws.addEventListener('error', handleWebSocketError);
    ws.addEventListener('close', handleWebSocketClose);
  
    return () => {
      ws.removeEventListener('open', handleWebSocketOpen);
      ws.removeEventListener('message', handleWebSocketMessage);
      ws.removeEventListener('error', handleWebSocketError);
      ws.removeEventListener('close', handleWebSocketClose);
      ws.close();
    };
  }, []);

  const createChartData = (label, data) => ({
    labels: dataHistory.labels,
    datasets: [
      {
        label,
        data,
        fill: false,
        backgroundColor: '#FF6347', // Rocket Red
        borderColor: '#FF6347', // Rocket Red
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#FF6347', // Rocket Red
        pointRadius: 3,
      },
    ],
  });

  const generateStars = (numStars) => {
    const stars = [];
    for (let i = 0; i < numStars; i++) {
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const size = Math.random() * 3 + 1; // Size between 1 and 4px
      stars.push(
        <div
          key={i}
          className="absolute bg-white rounded-full"
          style={{ top: `${top}%`, left: `${left}%`, width: `${size}px`, height: `${size}px` }}
        />
      );
    }
    return stars;
  };

  const resetData = () => {
    const emptyData = {
      dhtTemp: [],
      humidity: [],
      temperature: [],
      pressure: [],
      altitude: [],
      accelX: [],
      accelY: [],
      accelZ: [],
      labels: [],
    };
    setDataHistory(emptyData);
    saveToLocalStorage(emptyData);
  };

  return (
    <div className="bg-gradient-to-r from-black via-gray-900 to-gray-800 p-4 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0">{generateStars(200)}</div> {/* Increased number of stars */}
      <div className="container mx-auto relative z-10">
        <header className="text-center mb-6 sm:mb-12">
          <motion.h1
            className="text-4xl sm:text-6xl font-extrabold text-red-500 mb-4 drop-shadow-lg"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            🚀 Rocket Sensor Dashboard
          </motion.h1>
          <p className="text-lg sm:text-xl text-gray-300 italic">
            Real-time monitoring of your rocket&apos;s vitals
          </p>
        </header>

        {loading ? (
          <div className="text-center text-red-500 text-2xl sm:text-3xl">Loading...</div>
        ) : (
          <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-black shadow-2xl rounded-3xl p-4 sm:p-10">
            {/* Live Data Display */}
            <div className="mb-8 sm:mb-12 p-4 sm:p-6 bg-gray-900 rounded-2xl shadow-lg border border-red-500">
              <h2 className="text-3xl sm:text-4xl font-bold text-red-500 mb-4">📊 Live Sensor Data</h2>
              <p className="text-base sm:text-lg text-gray-300 mb-2">
                <strong>DHT11 Temperature:</strong> {sensorData.dhtTemp !== null ? `${sensorData.dhtTemp.toFixed(2)} °C` : 'N/A'}
              </p>
              <p className="text-base sm:text-lg text-gray-300 mb-2">
                <strong>DHT11 Humidity:</strong> {sensorData.humidity !== null ? `${sensorData.humidity.toFixed(2)} %` : 'N/A'}
              </p>
              <p className="text-base sm:text-lg text-gray-300 mb-2">
                <strong>BMP280 Temperature:</strong> {sensorData.temperature !== null ? `${sensorData.temperature.toFixed(2)} °C` : 'N/A'}
              </p>
              <p className="text-base sm:text-lg text-gray-300 mb-2">
                <strong>Pressure:</strong> {sensorData.pressure !== null ? `${sensorData.pressure.toFixed(2)} hPa` : 'N/A'}
              </p>
              <p className="text-base sm:text-lg text-gray-300 mb-2">
                <strong>Altitude:</strong> {sensorData.altitude !== null ? `${sensorData.altitude.toFixed(2)} m` : 'N/A'}
              </p>
              <p className="text-base sm:text-lg text-gray-300 mb-2">
                <strong>Acceleration X:</strong> {sensorData.accelX !== null ? `${sensorData.accelX.toFixed(2)} m/s²` : 'N/A'}
              </p>
              <p className="text-base sm:text-lg text-gray-300 mb-2">
                <strong>Acceleration Y:</strong> {sensorData.accelY !== null ? `${sensorData.accelY.toFixed(2)} m/s²` : 'N/A'}
              </p>
              <p className="text-base sm:text-lg text-gray-300 mb-2">
                <strong>Acceleration Z:</strong> {sensorData.accelZ !== null ? `${sensorData.accelZ.toFixed(2)} m/s²` : 'N/A'}
              </p>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-red-500">
                <h3 className="text-2xl sm:text-3xl font-semibold text-red-500 mb-4">DHT11 Temperature</h3>
                <Line data={createChartData('DHT11 Temperature (°C)', dataHistory.dhtTemp)} ref={chartRefs.dhtTemp} />
              </div>
              <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-red-500">
                <h3 className="text-2xl sm:text-3xl font-semibold text-red-500 mb-4">DHT11 Humidity</h3>
                <Line data={createChartData('DHT11 Humidity (%)', dataHistory.humidity)} ref={chartRefs.humidity} />
              </div>
              <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-red-500">
                <h3 className="text-2xl sm:text-3xl font-semibold text-red-500 mb-4">BMP280 Temperature</h3>
                <Line data={createChartData('BMP280 Temperature (°C)', dataHistory.temperature)} ref={chartRefs.temperature} />
              </div>
              <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-red-500">
                <h3 className="text-2xl sm:text-3xl font-semibold text-red-500 mb-4">Pressure</h3>
                <Line data={createChartData('Pressure (hPa)', dataHistory.pressure)} ref={chartRefs.pressure} />
              </div>
              <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-red-500">
                <h3 className="text-2xl sm:text-3xl font-semibold text-red-500 mb-4">Altitude</h3>
                <Line data={createChartData('Altitude (m)', dataHistory.altitude)} ref={chartRefs.altitude} />
              </div>
              <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-red-500">
                <h3 className="text-2xl sm:text-3xl font-semibold text-red-500 mb-4">Acceleration X</h3>
                <Line data={createChartData('Accel X (m/s²)', dataHistory.accelX)} ref={chartRefs.accelX} />
              </div>
              <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-red-500">
                <h3 className="text-2xl sm:text-3xl font-semibold text-red-500 mb-4">Acceleration Y</h3>
                <Line data={createChartData('Accel Y (m/s²)', dataHistory.accelY)} ref={chartRefs.accelY} />
              </div>
              <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-red-500">
                <h3 className="text-2xl sm:text-3xl font-semibold text-red-500 mb-4">Acceleration Z</h3>
                <Line data={createChartData('Accel Z (m/s²)', dataHistory.accelZ)} ref={chartRefs.accelZ} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <button
                onClick={() => exportAllChartsAsPDF(Object.values(chartRefs))}
                className="bg-red-500 text-white text-center py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition"
              >
                Export All Charts as PDF
              </button>
              <CSVLink
                data={[
                  ['Time', 'DHT11 Temperature (°C)', 'DHT11 Humidity (%)', 'BMP280 Temperature (°C)', 'Pressure (hPa)', 'Altitude (m)', 'Accel X (m/s²)', 'Accel Y (m/s²)', 'Accel Z (m/s²)'],
                  ...dataHistory.labels.map((label, index) => [
                    label,
                    dataHistory.dhtTemp[index],
                    dataHistory.humidity[index],
                    dataHistory.temperature[index],
                    dataHistory.pressure[index],
                    dataHistory.altitude[index],
                    dataHistory.accelX[index],
                    dataHistory.accelY[index],
                    dataHistory.accelZ[index],
                  ]),
                ]}
                filename="sensor_data.csv"
                className="bg-green-500 text-center text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-600 transition"
              >
                Export Data as CSV
              </CSVLink>
              <button
                onClick={resetData}
                className="bg-yellow-500 text-center text-white py-2 px-4 rounded-lg shadow-md hover:bg-yellow-600 transition"
              >
                Reset Data
              </button>
            </div>
          </div>
        )}
        <ThreeDModel />
      </div>
    </div>
  );
};

export default App;
