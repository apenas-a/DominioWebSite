import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { castingState, phaseProgress, easeInOut, easeOut, lerp } from '@/components/casting/CastingTimeline';
import { usePourPoints } from '@/components/casting/CastingContext';
import { moltenSurfaceShader } from '@/components/casting/shaders/moltenShaders';

export default function PouringLadle({ debugFlow = false }: { debugFlow?: boolean }) {
  const ladlePivotRef = useRef<THREE.Group>(null);
  const metalRef = useRef<THREE.Mesh>(null);
  const spoutMarkerRef = useRef<THREE.Mesh>(null);
  const fillMarkerRef = useRef<THREE.Mesh>(null);
  const pourPoints = usePourPoints();
  const metalShaderRef = useRef(new THREE.ShaderMaterial({
    uniforms: moltenSurfaceShader.uniforms(),
    vertexShader: moltenSurfaceShader.vertexShader,
    fragmentShader: moltenSurfaceShader.fragmentShader,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  }));

  const { bodyMat } = useMemo(() => {
    return {
      bodyMat: new THREE.MeshStandardMaterial({ color: '#2a2d34', roughness: 0.7, metalness: 0.6 })
    };
  }, []);

  useFrame(({ clock }) => {
    const p = castingState.progress;
    let posX = 25, posY = 0.5;
    let metalLevel = 0;
    let tiltAngle = 0;

    if (p < 0.40) { posX = 25; posY = 0.5; }
    else if (p <= 0.42) { posX = lerp(25, 1.5, easeOut((p-0.40)/0.02)); posY = 0.5; }
    else if (p <= 0.50) { posX = 1.5; posY = 0.5; }
    else if (p <= 0.58) {
      const t = easeInOut(phaseProgress(p, 'LADLE_TO_MOLD'));
      posX = lerp(1.5, 0.5, t);
      posY = lerp(0.5, 3.5, t < 0.5 ? t * 2 * 1.2 : 1.2 - (t - 0.5) * 2 * 0.5);
    }
    else if (p <= 0.68) { posX = 0.5; posY = 3.5; }
    else if (p <= 0.72) { posX = lerp(0.5, 25, (p-0.68)/0.04); posY = 3.5; }
    else { posX = 25; posY = 3.5; }

    if (p < 0.42) metalLevel = 0;
    else if (p <= 0.50) metalLevel = easeOut(phaseProgress(p, 'FURNACE_POUR'));
    else if (p < 0.58) metalLevel = 1;
    else if (p <= 0.68) metalLevel = lerp(1, 0.05, phaseProgress(p, 'LADLE_POUR'));
    else metalLevel = 0;

    if (p < 0.58) tiltAngle = 0;
    else if (p <= 0.62) tiltAngle = lerp(0, -0.75, easeInOut((p-0.58)/0.04));
    else if (p <= 0.68) tiltAngle = -0.75;
    else if (p <= 0.70) tiltAngle = lerp(-0.75, 0, (p-0.68)/0.02);
    else tiltAngle = 0;

    if (ladlePivotRef.current) {
      ladlePivotRef.current.position.set(posX, posY, 0);
      ladlePivotRef.current.rotation.z = tiltAngle;
    }

    if (metalRef.current) {
      metalRef.current.scale.y = Math.max(0.001, metalLevel);
    }

    if (metalShaderRef.current) {
      metalShaderRef.current.uniforms.uTime.value = clock.getElapsedTime();
      metalShaderRef.current.uniforms.uIntensity.value = metalLevel > 0.01 ? 1 : 0;
    }

    spoutMarkerRef.current?.getWorldPosition(pourPoints.ladleSpout.current);
    fillMarkerRef.current?.getWorldPosition(pourPoints.ladleFill.current);
  });

  return (
    <group ref={ladlePivotRef}>
      <group position={[-0.6, -0.55, 0]}>
        <mesh material={bodyMat}>
          <cylinderGeometry args={[0.7, 0.5, 1.1, 24]} />
        </mesh>
        
        <mesh position={[0.7, 0.55, 0]} material={bodyMat}>
          <boxGeometry args={[0.2, 0.1, 0.3]} />
        </mesh>
        <mesh ref={spoutMarkerRef} position={[0.8, 0.6, 0]} visible={debugFlow}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="red" />
        </mesh>
        
        <mesh ref={fillMarkerRef} position={[0, 0.55, 0]} visible={debugFlow}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="blue" />
        </mesh>

        <mesh position={[0, 0, 0]} material={bodyMat} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.6, 16]} />
        </mesh>

        <mesh position={[0, 0.55, 0]} material={bodyMat}>
          <torusGeometry args={[0.8, 0.05, 16, 32, Math.PI]} />
        </mesh>

        <mesh ref={metalRef} position={[0, -0.5, 0]} material={metalShaderRef.current}>
          <cylinderGeometry args={[0.65, 0.45, 1.0, 24]} />
        </mesh>
      </group>
    </group>
  );
}
