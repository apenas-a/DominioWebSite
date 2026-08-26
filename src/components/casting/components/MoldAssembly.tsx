import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { castingState, phaseProgress, easeInOut, easeOut, lerp } from '@/components/casting/CastingTimeline';
import { usePourPoints } from '@/components/casting/CastingContext';

export default function MoldAssembly({ debugFlow = false }: { debugFlow?: boolean }) {
  const mainGroupRef = useRef<THREE.Group>(null);
  const copeRef = useRef<THREE.Group>(null);
  const sprueMarkerRef = useRef<THREE.Mesh>(null);
  const pourPoints = usePourPoints();

  const { frameMat, sandMat, cavityMat } = useMemo(() => {
    return {
      frameMat: new THREE.MeshStandardMaterial({ color: '#2b303a', roughness: 0.45, metalness: 0.85 }),
      sandMat: new THREE.MeshStandardMaterial({ color: '#5c4d3e', roughness: 0.95, metalness: 0.05 }),
      cavityMat: new THREE.MeshStandardMaterial({ color: '#1a1510', roughness: 0.98, metalness: 0.02 })
    };
  }, []);

  useFrame(() => {
    const p = castingState.progress;
    let copeY = 0.7;
    let moldX = 0;

    if (p <= 0.08) copeY = 2.6;
    else if (p <= 0.15) copeY = lerp(2.6, 0.7, phaseProgress(p, 'MOLD_CLOSE'));
    else if (p < 0.82) copeY = 0.7;
    else if (p <= 0.89) copeY = lerp(0.7, 2.6, phaseProgress(p, 'MOLD_OPEN_REVEAL'));
    else copeY = 2.6;

    if (p <= 0.15) moldX = 0;
    else if (p <= 0.20) moldX = lerp(0, -20, easeInOut(phaseProgress(p, 'TRANSITION_FURNACE')));
    else if (p < 0.50) moldX = -20;
    else if (p <= 0.55) moldX = lerp(-20, 0, easeOut(Math.min(1, (p-0.50)/0.05)));
    else moldX = 0;

    if (mainGroupRef.current) {
      mainGroupRef.current.position.x = moldX;
    }
    if (copeRef.current) {
      copeRef.current.position.y = copeY;
    }

    if (sprueMarkerRef.current) {
      sprueMarkerRef.current.getWorldPosition(pourPoints.moldSprue.current);
    }
  });

  return (
    <group ref={mainGroupRef}>
      <group position={[0, 0, 0]}>
        <mesh material={frameMat}>
          <boxGeometry args={[4, 0.15, 4]} />
        </mesh>
        <mesh position={[0, 0.3, 0]} material={sandMat}>
          <boxGeometry args={[3.8, 0.6, 3.8]} />
        </mesh>
        <mesh position={[0, 0.601, 0]} material={cavityMat}>
          <cylinderGeometry args={[0.9, 0.9, 0.25, 32]} />
        </mesh>
        <mesh position={[1.8, 0.6, 1.8]} material={frameMat}><cylinderGeometry args={[0.05, 0.05, 0.2]} /></mesh>
        <mesh position={[-1.8, 0.6, 1.8]} material={frameMat}><cylinderGeometry args={[0.05, 0.05, 0.2]} /></mesh>
        <mesh position={[1.8, 0.6, -1.8]} material={frameMat}><cylinderGeometry args={[0.05, 0.05, 0.2]} /></mesh>
        <mesh position={[-1.8, 0.6, -1.8]} material={frameMat}><cylinderGeometry args={[0.05, 0.05, 0.2]} /></mesh>
      </group>

      <group ref={copeRef}>
        <mesh position={[0, 0.35, 0]} material={sandMat}>
          <boxGeometry args={[3.8, 0.7, 3.8]} />
        </mesh>
        <mesh position={[0, 0.7, 0]} material={frameMat}>
          <boxGeometry args={[4, 0.15, 4]} />
        </mesh>
        <mesh position={[1, 0.75, 0]} material={cavityMat}>
          <cylinderGeometry args={[0.3, 0.1, 0.8, 16]} />
        </mesh>
        <mesh ref={sprueMarkerRef} position={[1, 1.2, 0]} visible={debugFlow}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="red" />
        </mesh>
      </group>
    </group>
  );
}
