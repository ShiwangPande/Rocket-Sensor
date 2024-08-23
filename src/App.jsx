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
          pdf.addImage(img, 'PNG', 10, 10, 180, 160); // Adjust dimensions as needed
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
    combinedTemp: null,
    pressure: null,
    altitude: null,
    accelX: null,
    accelY: null,
    accelZ: null,
  });
  const [dataHistory, setDataHistory] = useState({
    dhtTemp: [],
    humidity: [],
    temperature: [],
    combinedTemp: [],
    pressure: [],
    altitude: [],
    accelX: [],
    accelY: [],
    accelZ: [],
    labels: [],
  });
  const [loading, setLoading] = useState(true);

  const chartRefs = {
    dhtTemp: useRef(null),
    humidity: useRef(null),
    temperature: useRef(null),
    combinedTemp: useRef(null),
    pressure: useRef(null),
    altitude: useRef(null),
    accelX: useRef(null),
    accelY: useRef(null),
    accelZ: useRef(null),
  };

  // Establish WebSocket connection
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000/data'); // Update with your WebSocket URL

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSensorData(data);
      setDataHistory(prev => ({
        dhtTemp: [...prev.dhtTemp, data.dhtTemp],
        humidity: [...prev.humidity, data.humidity],
        temperature: [...prev.temperature, data.temperature],
        combinedTemp: [...prev.combinedTemp, data.combinedTemp],
        pressure: [...prev.pressure, data.pressure],
        altitude: [...prev.altitude, data.altitude],
        accelX: [...prev.accelX, data.accelX],
        accelY: [...prev.accelY, data.accelY],
        accelZ: [...prev.accelZ, data.accelZ],
        labels: [...prev.labels, new Date().toLocaleTimeString()],
      }));

      // Play sound and show notification if temperature exceeds threshold
      if (data.temperature > 37) { // Adjust threshold as needed
        playAlertSound(); // Play the alert sound
      }

      setLoading(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };

    return () => {
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
        pointRadius: 2,
      },
    ],
  });

  const generateStars = (numStars) => {
    const stars = [];
    for (let i = 0; i < numStars; i++) {
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const size = Math.random() * 2 + 1; // Size between 1 and 3px
      stars.push(
        <div
          key={i}
          className="star"
          style={{ top: `${top}%`, left: `${left}%`, width: `${size}px`, height: `${size}px` }}
        />
      );
    }
    return stars;
  };

  return (
    <div className="bg-gradient-to-r from-black via-gray-800 to-gray-900 p-8 min-h-screen relative">
      <div className="absolute inset-0">{generateStars(100)}</div> {/* Adjust the number of stars as needed */}
      <div className="container mx-auto relative z-10">
        <header className="text-center mb-12">
          <motion.h1
            className="text-6xl font-extrabold text-red-400 mb-4 drop-shadow-lg"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            🚀 Rocket Sensor Dashboard
          </motion.h1>
          <p className="text-xl text-gray-300 italic">
            Real-time monitoring of your rocket's vitals
          </p>
        </header>

        {loading ? (
          <div className="text-center text-red-400 text-3xl">Loading...</div>
        ) : (
          <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-black shadow-2xl rounded-3xl p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* DHT11 Sensor Data */}
              <motion.div
                className="bg-gray-900 p-8 rounded-2xl shadow-lg border border-red-500 hover:shadow-red-500 transition-shadow duration-300"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
              >
                <h2 className="text-4xl font-bold text-red-400 mb-6">🌡️ DHT11 Sensor Data</h2>
                <p className="text-lg text-gray-300 mb-4">
                  <strong>Humidity:</strong> {sensorData.humidity !== null ? `${sensorData.humidity.toFixed(2)} %` : 'N/A'}
                </p>
                <Line ref={chartRefs.humidity} data={createChartData('DHT11 Humidity (%)', dataHistory.humidity)} options={{ plugins: { tooltip: { enabled: true } }}} />
                <p className="text-lg text-gray-300 mt-6 mb-4">
                  <strong>Temperature:</strong> {sensorData.dhtTemp !== null ? `${sensorData.dhtTemp.toFixed(2)} °C` : 'N/A'}
                </p>
                <Line ref={chartRefs.dhtTemp} data={createChartData('DHT11 Temperature (°C)', dataHistory.dhtTemp)} options={{ plugins: { tooltip: { enabled: true } }}} />
              </motion.div>

              {/* BMP280 Sensor Data */}
              <motion.div
                className="bg-gray-900 p-8 rounded-2xl shadow-lg border border-red-500 hover:shadow-red-500 transition-shadow duration-300"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
              >
                <h2 className="text-4xl font-bold text-red-400 mb-6">📡 BMP280 Sensor Data</h2>
                <p className="text-lg text-gray-300 mb-4">
                  <strong>Temperature:</strong> {sensorData.temperature !== null ? `${sensorData.temperature.toFixed(2)} °C` : 'N/A'}
                </p>
                <Line ref={chartRefs.temperature} data={createChartData('BMP280 Temperature (°C)', dataHistory.temperature)} options={{ plugins: { tooltip: { enabled: true } }}} />
                <p className="text-lg text-gray-300 mt-6 mb-4">
                  <strong>Combined Temperature:</strong> {sensorData.combinedTemp !== null ? `${sensorData.combinedTemp.toFixed(2)} °C` : 'N/A'}
                </p>
                <Line ref={chartRefs.combinedTemp} data={createChartData('Combined Temperature (°C)', dataHistory.combinedTemp)} options={{ plugins: { tooltip: { enabled: true } }}} />
                <p className="text-lg text-gray-300 mt-6 mb-4">
                  <strong>Pressure:</strong> {sensorData.pressure !== null ? `${sensorData.pressure.toFixed(2)} hPa` : 'N/A'}
                </p>
                <Line ref={chartRefs.pressure} data={createChartData('Pressure (hPa)', dataHistory.pressure)} options={{ plugins: { tooltip: { enabled: true } }}} />
                <p className="text-lg text-gray-300 mt-6 mb-4">
                  <strong>Altitude:</strong> {sensorData.altitude !== null ? `${sensorData.altitude.toFixed(2)} meters` : 'N/A'}
                </p>
                <Line ref={chartRefs.altitude} data={createChartData('Altitude (m)', dataHistory.altitude)} options={{ plugins: { tooltip: { enabled: true } }}} />
              </motion.div>
            </div>

            {/* Accelerometer Data */}
            <motion.div
              className="bg-gray-900 p-8 rounded-2xl shadow-lg border border-red-500 hover:shadow-red-500 transition-shadow duration-300 mt-12"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-4xl font-bold text-red-400 mb-6">📊 Accelerometer Data</h2>
              <p className="text-lg text-gray-300 mb-4">
                <strong>X-Axis:</strong> {sensorData.accelX !== null ? `${sensorData.accelX.toFixed(2)} m/s²` : 'N/A'}
              </p>
              <Line ref={chartRefs.accelX} data={createChartData('Accelerometer X-Axis (m/s²)', dataHistory.accelX)} options={{ plugins: { tooltip: { enabled: true } }}} />
              <p className="text-lg text-gray-300 mt-6 mb-4">
                <strong>Y-Axis:</strong> {sensorData.accelY !== null ? `${sensorData.accelY.toFixed(2)} m/s²` : 'N/A'}
              </p>
              <Line ref={chartRefs.accelY} data={createChartData('Accelerometer Y-Axis (m/s²)', dataHistory.accelY)} options={{ plugins: { tooltip: { enabled: true } }}} />
              <p className="text-lg text-gray-300 mt-6 mb-4">
                <strong>Z-Axis:</strong> {sensorData.accelZ !== null ? `${sensorData.accelZ.toFixed(2)} m/s²` : 'N/A'}
              </p>
              <Line ref={chartRefs.accelZ} data={createChartData('Accelerometer Z-Axis (m/s²)', dataHistory.accelZ)} options={{ plugins: { tooltip: { enabled: true } }}} />
            </motion.div>

            {/* Export Buttons */}
            <div className="mt-12 flex justify-between">
              <button
                onClick={() => exportAllChartsAsPDF(Object.values(chartRefs))}
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-300"
              >
                Export All Charts as PDF
              </button>
              <CSVLink
                data={[
                  ['Time', 'DHT11 Humidity', 'DHT11 Temperature', 'BMP280 Temperature', 'Combined Temperature', 'Pressure', 'Altitude', 'Accel X', 'Accel Y', 'Accel Z'],
                  ...dataHistory.labels.map((label, index) => [
                    label,
                    dataHistory.humidity[index] || '',
                    dataHistory.dhtTemp[index] || '',
                    dataHistory.temperature[index] || '',
                    dataHistory.combinedTemp[index] || '',
                    dataHistory.pressure[index] || '',
                    dataHistory.altitude[index] || '',
                    dataHistory.accelX[index] || '',
                    dataHistory.accelY[index] || '',
                    dataHistory.accelZ[index] || '',
                  ]),
                ]}
                filename="sensor_data.csv"
                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300"
              >
                Export Data as CSV
              </CSVLink>
            </div>
          </div>
        )}
      </div>
    <div>
      <ThreeDModel/>
    </div>
    </div>
  );
};

export default App;
