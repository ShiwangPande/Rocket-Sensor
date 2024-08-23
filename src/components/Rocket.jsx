import { forwardRef } from 'react';
import { useTexture } from '@react-three/drei';
import bodyTexture from './body.jpg';
import noseTexture from './nose.jpg';
import finTexture from './fin.jpg';
import flameTexture from './flame.jpg'; // Optional: Add a flame texture if desired

const Rocket = forwardRef(({ engineFlame }, ref) => {
  const [bodyTex] = useTexture([bodyTexture]);
  const [noseTex] = useTexture([noseTexture]);
  const [finTex] = useTexture([finTexture]);
  const [flameTex] = useTexture([flameTexture]);

  return (
    <group ref={ref} scale={[1, 1, 1]} position={[0, 0, 0]}>
      {/* Rocket Body */}
      <mesh>
        <cylinderGeometry args={[1, 1, 6, 64]} />
        <meshStandardMaterial map={bodyTex} roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Rocket Nose Cone */}
      <mesh position={[0, 3.75, 0]}>
        <coneGeometry args={[1, 2, 64]} />
        <meshStandardMaterial map={noseTex} roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Rocket Fins */}
      <mesh position={[-1.2, -1.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.2, 1.6, 0.2]} />
        <meshStandardMaterial map={finTex} roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[1.2, -1.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.2, 1.6, 0.2]} />
        <meshStandardMaterial map={finTex} roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Rocket Engine */}
      <mesh position={[0, -3.2, 0]}>
        <cylinderGeometry args={[0.8, 1.2, 1, 32]} />
        <meshStandardMaterial color="#333" roughness={0.4} metalness={0.9} />
        <mesh position={[0, -0.5, 0]}>
          <coneGeometry args={[0.8, 0.4, 32]} />
          <meshStandardMaterial color="#444" roughness={0.4} metalness={0.9} />
        </mesh>
        {/* Engine Flame Effect */}
        {engineFlame && (
          <mesh position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.8, 1, 32]} />
            <meshStandardMaterial map={flameTex} emissive="#FF4500" emissiveIntensity={1.5} />
          </mesh>
        )}
      </mesh>
    </group>
  );
});

export default Rocket;
