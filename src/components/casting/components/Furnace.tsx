import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { castingState, phaseProgress, easeInOut, easeOut, lerp } from '@/components/casting/CastingTimeline';
import { usePourPoints } from '@/components/casting/CastingContext';
import { moltenSurfaceShader } from '@/components/casting/shaders/moltenShaders';

export default function Furnace({ debugFlow = false }: { debugFlow?: boolean }) {
  const pivotRef = useRef<THREE.Group>(null);
  const metalRef = useRef<THREE.Mesh>(null);
  const spoutMarkerRef = useRef<THREE.Mesh>(null);
  const pourPoints = usePourPoints();
  const metalShaderRef = useRef(new THREE.ShaderMaterial({
    uniforms: moltenSurfaceShader.uniforms(),
    vertexShader: moltenSurfaceShader.vertexShader,
    fragmentShader: moltenSurfaceShader.fragmentShader,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  }));

  const { outerMat, innerMat, coilMat } = useMemo(() => {
    return {
      outerMat: new THREE.MeshStandardMaterial({ color: '#1a1c23', roughness: 0.6, metalness: 0.7 }),
      innerMat: new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: 0.9, metalness: 0.1 }),
      coilMat: new THREE.MeshStandardMaterial({ color: '#b87333', roughness: 0.3, metalness: 0.8 })
    };
  }, []);

  useFrame(({ clock }) => {
    const p = castingState.progress;
    let pivotX = 0;
    let metalLevel = 0;
    let tiltAngle = 0;

    if (p < 0.15) pivotX = 25;
    else if (p <= 0.20) pivotX = lerp(25, 0, easeOut(phaseProgress(p, 'TRANSITION_FURNACE')));
    else if (p < 0.50) pivotX = 0;
    else if (p <= 0.55) pivotX = lerp(0, -25, easeInOut(Math.min(1, (p-0.50)/0.05)));
    else pivotX = -25;

    if (p < 0.27) metalLevel = 0;
    else if (p <= 0.34) metalLevel = easeOut(phaseProgress(p, 'FURNACE_FILL'));
    else if (p < 0.42) metalLevel = 1;
    else if (p <= 0.50) metalLevel = lerp(1, 0.1, phaseProgress(p, 'FURNACE_POUR'));
    else metalLevel = 0;

    if (p < 0.34) tiltAngle = 0;
    else if (p <= 0.42) tiltAngle = lerp(0, -0.85, easeInOut(phaseProgress(p, 'FURNACE_TILT')));
    else if (p < 0.50) tiltAngle = -0.85;
    else if (p <= 0.52) tiltAngle = lerp(-0.85, 0, Math.min(1, (p-0.50)/0.02));
    else tiltAngle = 0;

    if (pivotRef.current) {
      pivotRef.current.position.x = pivotX;
      pivotRef.current.position.y = 2.5;
      pivotRef.current.rotation.z = tiltAngle;
    }

    if (metalRef.current) {
      metalRef.current.scale.y = Math.max(0.001, metalLevel);
    }

    if (metalShaderRef.current) {
      metalShaderRef.current.uniforms.uTime.value = clock.getElapsedTime();
      metalShaderRef.current.uniforms.uIntensity.value = metalLevel > 0.01 ? 1 : 0;
    }

    if (spoutMarkerRef.current) {
      spoutMarkerRef.current.getWorldPosition(pourPoints.furnaceSpout.current);
    }
  });

  return (
    <group ref={pivotRef}>
      <group position={[-1.5, -1.4, 0]}>
        <mesh material={outerMat}>
          <cylinderGeometry args={[1.4, 1.3, 2.8, 32]} />
        </mesh>
        <mesh material={innerMat} position={[0, 0.1, 0]}>
          <cylinderGeometry args={[1.25, 1.25, 2.8, 32, 1, true]} />
        </mesh>
        
        <mesh position={[1.5, 1.4, 0]} material={outerMat}>
          <boxGeometry args={[0.5, 0.3, 0.4]} />
        </mesh>
        <mesh ref={spoutMarkerRef} position={[1.75, 1.55, 0]} visible={debugFlow}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="red" />
        </mesh>

        {[...Array(4)].map((_, i) => (
          <mesh key={i} position={[0, -0.8 + i * 0.5, 0]} material={coilMat} rotation={[Math.PI/2, 0, 0]}>
            <torusGeometry args={[1.45, 0.05, 16, 32]} />
          </mesh>
        ))}

        <mesh material={outerMat} position={[0, -1.5, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.2, 32]} />
        </mesh>

        <mesh ref={metalRef} position={[0, -1.3, 0]} material={metalShaderRef.current}>
          <cylinderGeometry args={[1.2, 1.2, 2.6, 32]} />
        </mesh>
      </group>
    </group>
  );
}
