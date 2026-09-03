import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { castingState, phaseProgress, lerp, PHASES } from '@/components/casting/CastingTimeline';

export default function SceneLighting() {
  const heatLightRef = useRef<THREE.PointLight>(null);
  const cavityLightRef = useRef<THREE.DirectionalLight>(null);

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
      {/* Key light — main directional, slightly warm */}
      <directionalLight position={[10, 18, 8]} intensity={1.4} color="#fff5ee" castShadow={false} />
      {/* Rim/fill lights */}
      <directionalLight position={[-8, 10, -8]} intensity={0.3} color="#7dd3fc" />
      <directionalLight position={[0, 5, 12]} intensity={0.35} color="#ffaa66" />
      {/* Top-down technical cavity light — strong overhead for mold-open phases */}
      <directionalLight
        ref={cavityLightRef}
        position={[1.5, 12, 2]}
        intensity={1.6}
        color="#e8d5b0"
        castShadow={false}
      />
      {/* Ambient */}
      <ambientLight intensity={0.4} color="#ffffff" />
      {/* Dynamic heat point light */}
      <pointLight ref={heatLightRef} position={[0, 2, 0]} intensity={0} color="#ff4400" distance={15} decay={2} />
    </>
  );
}
