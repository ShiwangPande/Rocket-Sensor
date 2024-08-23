import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Environment, Stars } from '@react-three/drei';
import Rocket from './Rocket';

const ThreeDModel = () => {
  const [flameActive, setFlameActive] = useState(false);
  const rocketRef = useRef();

  const igniteRocket = () => {
    setFlameActive(true);
    setTimeout(() => setFlameActive(false), 3000); // Flame lasts for 3 seconds
  };

  return (
    <div className="relative mt-12">
      <h2 className="text-4xl font-bold text-red-400 mb-6 text-center">🔧 3D Rocket Model</h2>
      <div className="w-full h-96 bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        <Canvas>
          <Stage environment="sunset" intensity={0.7}>
            <Rocket ref={rocketRef} engineFlame={flameActive} />
            <Stars radius={100} depth={50} count={2000} factor={7} />
          </Stage>
          <OrbitControls
            target={[0, 0, 0]} // Center the target to the origin
            position={[0, 5, 10]} // Adjusted zoom level to fit the rocket model
            enableZoom={true}
            zoomSpeed={1.2}
            enablePan={true}
          />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} color="#FF0000" />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow color="#FFFF00" />
          <Environment preset="sunset" />
        </Canvas>
      </div>
      <div className="absolute bottom-10 right-10">
        <button 
          onClick={igniteRocket} 
          style={{
            padding: '10px 20px',
            background: '#FF5733',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            fontSize: '16px'
          }}
        >
          {flameActive ? 'Ignited' : 'Ignite'}
        </button>
      </div>
    </div>
  );
};

export default ThreeDModel;
