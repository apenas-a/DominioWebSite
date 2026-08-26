import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { castingState, phaseProgress, lerp, PHASES } from '@/components/casting/CastingTimeline';

export default function SceneLighting() {
  const heatLightRef = useRef<THREE.PointLight>(null);
  const heatLight2Ref = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const p = castingState.progress;
    
    // Heat light intensity follows hot metal phases
    let heatIntensity = 0;
    if (p >= 0.27 && p < 0.50) {
      // Furnace has metal - strong heat light
      heatIntensity = p < 0.34 ? lerp(0, 6, phaseProgress(p, 'FURNACE_FILL')) : 6;
    } else if (p >= 0.42 && p < 0.70) {
      // Ladle has metal
      heatIntensity = 4;
    } else if (p >= 0.60 && p < 0.82) {
      // Mold is hot
      heatIntensity = lerp(5, 0, p < 0.75 ? 0 : phaseProgress(p, 'COOLING'));
    }
    
    if (heatLightRef.current) {
      heatLightRef.current.intensity = heatIntensity;
      // Position heat light near the active hot element
      if (p < 0.50) {
        heatLightRef.current.position.set(0, 2, 0); // furnace area
      } else if (p < 0.58) {
        heatLightRef.current.position.lerp(new THREE.Vector3(0, 2, 0), 0.1); // moving
      } else {
        heatLightRef.current.position.set(0, 1, 0); // mold area  
      }
    }
  });

  return (
    <>
      {/* Key light */}
      <directionalLight position={[10, 15, 10]} intensity={1.2} color="#ffffff" />
      {/* Rim/fill lights */}
      <directionalLight position={[-8, 10, -8]} intensity={0.35} color="#7dd3fc" />
      <directionalLight position={[0, 5, 12]} intensity={0.4} color="#ffaa66" />
      {/* Ambient */}
      <ambientLight intensity={0.45} color="#ffffff" />
      {/* Dynamic heat lights */}
      <pointLight ref={heatLightRef} position={[0, 2, 0]} intensity={0} color="#ff4400" distance={15} decay={2} />
      <pointLight ref={heatLight2Ref} position={[0, 1, 0]} intensity={0} color="#ff6600" distance={10} decay={2} />
    </>
  );
}
