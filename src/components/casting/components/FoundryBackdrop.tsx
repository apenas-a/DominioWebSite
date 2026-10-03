import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { castingState } from '@/components/casting/CastingTimeline';

const WINDOW_X = [-6.2, -3.1, 0, 3.1, 6.2];
const FLOOR_SEAMS = [-6, -3, 0, 3, 6];

/**
 * A lightweight, code-native foundry set: the distant shell is intentionally
 * understated so it frames the casting sequence without competing with it.
 */
export default function FoundryBackdrop() {
  const windowMaterials = useMemo(
    () => WINDOW_X.map(() => new THREE.MeshStandardMaterial({
      color: '#5a1705',
      emissive: '#ff4d08',
      emissiveIntensity: 0.35,
      roughness: 0.72,
      metalness: 0.15,
    })),
    []
  );
  const exhaustGlowRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const heatActive = castingState.progress >= 0.27 && castingState.progress <= 0.75;
    const flicker = heatActive ? 0.18 + Math.sin(clock.getElapsedTime() * 5.5) * 0.06 : 0;

    windowMaterials.forEach((material, index) => {
      material.emissiveIntensity = 0.22 + flicker + Math.sin(clock.getElapsedTime() * 1.3 + index) * 0.025;
    });

    if (exhaustGlowRef.current) {
      exhaustGlowRef.current.emissiveIntensity = 0.08 + flicker * 0.45;
    }
  });

  return (
    <>
      {/* Rear steel wall, bays and furnace viewing windows */}
      <group position={[0, 3.9, -9.5]}>
        <mesh position={[0, 0, -0.18]}>
          <boxGeometry args={[19, 9.8, 0.36]} />
          <meshStandardMaterial color="#101319" roughness={0.88} metalness={0.42} />
        </mesh>

        {[-8.4, -5.0, -1.55, 1.55, 5.0, 8.4].map((x) => (
          <mesh key={x} position={[x, 0, 0.08]}>
            <boxGeometry args={[0.26, 9.8, 0.30]} />
            <meshStandardMaterial color="#222833" roughness={0.50} metalness={0.86} />
          </mesh>
        ))}

        {[-3.5, 1.15, 4.15].map((y) => (
          <mesh key={y} position={[0, y, 0.10]}>
            <boxGeometry args={[18.4, 0.20, 0.26]} />
            <meshStandardMaterial color="#1b2029" roughness={0.55} metalness={0.78} />
          </mesh>
        ))}

        {WINDOW_X.map((x, index) => (
          <group key={x} position={[x, 2.25, 0.18]}>
            <mesh position={[0, 0, -0.04]}>
              <boxGeometry args={[2.10, 1.48, 0.18]} />
              <meshStandardMaterial color="#08090b" roughness={0.9} metalness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0.10]} material={windowMaterials[index]}>
              <boxGeometry args={[1.62, 0.88, 0.08]} />
            </mesh>
            <mesh position={[0, 0, 0.16]}>
              <boxGeometry args={[0.10, 1.20, 0.10]} />
              <meshStandardMaterial color="#2b3038" roughness={0.45} metalness={0.88} />
            </mesh>
          </group>
        ))}

        {/* High-level industrial ventilation duct */}
        <group position={[-7.25, 3.55, 0.35]}>
          <mesh rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.44, 0.44, 4.3, 18]} />
            <meshStandardMaterial color="#252b35" roughness={0.46} metalness={0.86} />
          </mesh>
          <mesh position={[0, 2.30, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.45, 0.06, 10, 18]} />
            <meshStandardMaterial color="#3a414c" roughness={0.38} metalness={0.92} />
          </mesh>
          <mesh position={[0, -1.20, 0.44]}>
            <circleGeometry args={[0.22, 16]} />
            <meshStandardMaterial
              ref={exhaustGlowRef}
              color="#2c0b03"
              emissive="#ff4d08"
              emissiveIntensity={0.08}
              roughness={0.8}
            />
          </mesh>
        </group>
      </group>

      {/* Ceiling gantry — kept high and behind the action to preserve clear silhouettes */}
      <group position={[0, 7.2, -3.6]}>
        <mesh>
          <boxGeometry args={[18, 0.28, 0.42]} />
          <meshStandardMaterial color="#252b35" roughness={0.48} metalness={0.88} />
        </mesh>
        {[-7.2, -3.6, 0, 3.6, 7.2].map((x) => (
          <mesh key={x} position={[x, -0.70, 0.06]}>
            <boxGeometry args={[0.18, 1.5, 0.24]} />
            <meshStandardMaterial color="#191e26" roughness={0.55} metalness={0.82} />
          </mesh>
        ))}
        <mesh position={[0, -1.30, 0]}>
          <boxGeometry args={[8.3, 0.15, 0.22]} />
          <meshStandardMaterial color="#a33e11" roughness={0.45} metalness={0.75} />
        </mesh>
      </group>

      {/* Cast concrete floor with rails, seams and the site's restrained orange safety line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#111318" roughness={0.92} metalness={0.28} />
      </mesh>
      {FLOOR_SEAMS.map((x) => (
        <mesh key={`seam-x-${x}`} position={[x, -0.485, -3.5]}>
          <boxGeometry args={[0.045, 0.02, 18]} />
          <meshStandardMaterial color="#252a31" roughness={0.78} metalness={0.38} />
        </mesh>
      ))}
      {[-5.5, -1.8, 1.8, 5.5].map((z) => (
        <mesh key={`seam-z-${z}`} position={[0, -0.485, z]}>
          <boxGeometry args={[18, 0.02, 0.045]} />
          <meshStandardMaterial color="#252a31" roughness={0.78} metalness={0.38} />
        </mesh>
      ))}
      {[-1.18, 1.18].map((x) => (
        <mesh key={`rail-${x}`} position={[x, -0.46, -1.6]}>
          <boxGeometry args={[0.13, 0.07, 10.5]} />
          <meshStandardMaterial color="#343942" roughness={0.38} metalness={0.92} />
        </mesh>
      ))}
      <mesh position={[0, -0.47, -5.0]}>
        <boxGeometry args={[13, 0.025, 0.12]} />
        <meshStandardMaterial color="#9b3510" roughness={0.62} metalness={0.38} emissive="#421000" emissiveIntensity={0.24} />
      </mesh>
    </>
  );
}
