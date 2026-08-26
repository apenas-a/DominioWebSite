import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { castingState, phaseProgress, easeInOut, easeOut, lerp } from '@/components/casting/CastingTimeline';
import { createGearGeometry, DEFAULT_GEAR_PARAMS } from '@/components/casting/geometry/createGearShape';

export default function FinishedGear() {
  const meshRef = useRef<THREE.Mesh>(null);
  const continuousRotation = useRef(0);
  
  const geometry = useMemo(() => createGearGeometry(DEFAULT_GEAR_PARAMS), []);
  
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#5a6170'),
      metalness: 0.85,
      roughness: 0.35,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0,
    });
  }, []);

  useFrame(() => {
    const p = castingState.progress;
    const mesh = meshRef.current;
    if (!mesh) return;
    
    if (p < 0.60) {
      mesh.visible = false;
      return;
    }
    
    mesh.visible = true;
    
    let posX = 0, posY = 0.45, posZ = 0;
    let rotY = 0;
    
    if (p < 0.94) {
      posX = 0; posY = 0.45; posZ = 0; rotY = 0;
    } else if (p <= 0.96) {
      const t = (p - 0.94) / 0.02;
      posY = lerp(0.45, 2.5, easeOut(t));
    } else if (p <= 0.98) {
      const t = (p - 0.96) / 0.02;
      posX = lerp(0, 3, easeInOut(t));
      posY = lerp(2.5, 1.5, t);
    } else {
      posX = 3; posY = 1.5;
      continuousRotation.current += 0.01;
      rotY = continuousRotation.current;
    }
    
    mesh.position.set(posX, posY, posZ);
    mesh.rotation.y = rotY;
    
    // Temperature-based emission
    let temperature = 0;
    if (p < 0.60) temperature = 0;
    else if (p <= 0.68) temperature = lerp(0, 1, (p - 0.60) / 0.08);
    else if (p <= 0.75) temperature = 1;
    else if (p <= 0.82) temperature = lerp(1, 0, phaseProgress(p, 'COOLING'));
    else temperature = 0;
    
    material.emissive.setRGB(
      temperature * 1.0,
      temperature * 0.3,
      0
    );
    material.emissiveIntensity = temperature * 2.5;
    
    material.color.setRGB(
      lerp(0.35, 1.0, temperature),
      lerp(0.38, 0.6, temperature),
      lerp(0.44, 0.3, temperature)
    );
  });

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} />
  );
}

