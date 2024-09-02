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
    const ws = new WebSocket('ws://localhost:3000/data'); // Update with your WebSocket URL

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSensorData(data);
      const newDataHistory = {
        dhtTemp: [...dataHistory.dhtTemp, data.dhtTemp],
        humidity: [...dataHistory.humidity, data.humidity],
        temperature: [...dataHistory.temperature, data.temperature],
        pressure: [...dataHistory.pressure, data.pressure],
        altitude: [...dataHistory.altitude, data.altitude],
        accelX: [...dataHistory.accelX, data.accelX],
        accelY: [...dataHistory.accelY, data.accelY],
        accelZ: [...dataHistory.accelZ, data.accelZ],
        labels: [...dataHistory.labels, new Date().toLocaleTimeString()],
      };
      setDataHistory(newDataHistory);
      saveToLocalStorage(newDataHistory);

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
  }, [dataHistory]);

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
    <div className="bg-gradient-to-r from-black via-gray-900 to-gray-800 p-8 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0">{generateStars(200)}</div> {/* Increased number of stars */}
      <div className="container mx-auto relative z-10">
        <header className="text-center mb-12">
          <motion.h1
            className="text-6xl font-extrabold text-red-500 mb-4 drop-shadow-lg"
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
          <div className="text-center text-red-500 text-3xl">Loading...</div>
        ) : (
          <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-black shadow-2xl rounded-3xl p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* DHT11 Sensor Data */}
              <motion.div
                className="bg-gray-900 p-8 rounded-2xl shadow-lg border border-red-500 hover:shadow-red-600 transition-shadow duration-300"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
              >
                <h2 className="text-4xl font-bold text-red-500 mb-6">🌡️ DHT11 Sensor Data</h2>
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
                className="bg-gray-900 p-8 rounded-2xl shadow-lg border border-red-500 hover:shadow-red-600 transition-shadow duration-300"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
              >
                <h2 className="text-4xl font-bold text-red-500 mb-6">🌦️ BMP280 Sensor Data</h2>
                <p className="text-lg text-gray-300 mb-4">
                  <strong>Pressure:</strong> {sensorData.pressure !== null ? `${sensorData.pressure.toFixed(2)} hPa` : 'N/A'}
                </p>
                <Line ref={chartRefs.pressure} data={createChartData('Pressure (hPa)', dataHistory.pressure)} options={{ plugins: { tooltip: { enabled: true } }}} />
                <p className="text-lg text-gray-300 mt-6 mb-4">
                  <strong>Altitude:</strong> {sensorData.altitude !== null ? `${sensorData.altitude.toFixed(2)} m` : 'N/A'}
                </p>
                <Line ref={chartRefs.altitude} data={createChartData('Altitude (m)', dataHistory.altitude)} options={{ plugins: { tooltip: { enabled: true } }}} />
              </motion.div>
            </div>

            <div className="bg-gray-900 p-8 rounded-2xl shadow-lg mt-12 border border-red-500 hover:shadow-red-600 transition-shadow duration-300">
              <h2 className="text-4xl font-bold text-red-500 mb-6">📈 Accelerometer Data</h2>
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
            </div>

            <div className="mt-12 flex justify-center gap-4">
              <button
                onClick={() => exportAllChartsAsPDF(Object.values(chartRefs))}
                className="bg-red-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-red-600 transition-colors duration-300"
              >
                Export Charts as PDF
              </button>
              <CSVLink
                data={[
                  ['Timestamp', 'DHT11 Temperature (°C)', 'Humidity (%)', 'Pressure (hPa)', 'Altitude (m)', 'Accel X (m/s²)', 'Accel Y (m/s²)', 'Accel Z (m/s²)'],
                  ...dataHistory.labels.map((label, index) => [
                    label,
                    dataHistory.dhtTemp[index],
                    dataHistory.humidity[index],
                    dataHistory.pressure[index],
                    dataHistory.altitude[index],
                    dataHistory.accelX[index],
                    dataHistory.accelY[index],
                    dataHistory.accelZ[index],
                  ]),
                ]}
                filename="sensor-data.csv"
                className="bg-blue-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-blue-600 transition-colors duration-300"
              >
                Export Data as CSV
              </CSVLink>
              <button
                onClick={resetData}
                className="bg-gray-600 text-white px-6 py-3 rounded-full shadow-md hover:bg-gray-700 transition-colors duration-300"
              >
                Reset Data
              </button>
            </div>
          </div>
        )}
        <div className="mt-12">
          <ThreeDModel />
        </div>
      </div>
    </div>
  );
};

export default App;
