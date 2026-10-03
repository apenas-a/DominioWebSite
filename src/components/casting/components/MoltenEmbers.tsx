import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { castingState } from '@/components/casting/CastingTimeline';
import { usePourPoints } from '@/components/casting/CastingContext';

const FURNACE_EMBER_COUNT = 38;
const LADLE_EMBER_COUNT = 32;

interface EmberParticle {
  phase: number;
  speed: number;
  radius: number;
  angle: number;
}

function createEmberSystem(count: number) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const particles: EmberParticle[] = [];
  const hot = new THREE.Color('#ffc45b');
  const orange = new THREE.Color('#ff5808');

  for (let index = 0; index < count; index++) {
    const phase = Math.random();
    const color = hot.clone().lerp(orange, phase);
    particles.push({
      phase,
      speed: 0.45 + Math.random() * 0.65,
      radius: 0.05 + Math.random() * 0.24,
      angle: Math.random() * Math.PI * 2,
    });
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return { geometry, particles };
}

function updateEmbers(
  geometry: THREE.BufferGeometry,
  particles: EmberParticle[],
  source: THREE.Vector3,
  time: number,
  spread: number
) {
  const positions = geometry.attributes.position.array as Float32Array;

  particles.forEach((particle, index) => {
    const life = (time * particle.speed + particle.phase) % 1;
    const radial = particle.radius * (0.45 + life * 0.95) * spread;
    const drift = time * (0.8 + particle.speed) + particle.angle;

    positions[index * 3] = source.x + Math.cos(drift) * radial;
    positions[index * 3 + 1] = source.y + 0.04 + life * 0.62 - life * life * 0.36;
    positions[index * 3 + 2] = source.z + Math.sin(drift) * radial;
  });

  geometry.attributes.position.needsUpdate = true;
}

/** Lightweight heat sparks for the two vessels, active only in hot phases. */
export default function MoltenEmbers() {
  const furnacePointsRef = useRef<THREE.Points>(null);
  const ladlePointsRef = useRef<THREE.Points>(null);
  const pourPoints = usePourPoints();
  const furnace = useMemo(() => createEmberSystem(FURNACE_EMBER_COUNT), []);
  const ladle = useMemo(() => createEmberSystem(LADLE_EMBER_COUNT), []);
  const furnaceMaterial = useMemo(() => new THREE.PointsMaterial({
    size: 0.052,
    vertexColors: true,
    transparent: true,
    opacity: 0.82,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);
  const ladleMaterial = useMemo(() => new THREE.PointsMaterial({
    size: 0.046,
    vertexColors: true,
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  useFrame(({ clock }) => {
    const progress = castingState.progress;
    const time = clock.getElapsedTime();
    const furnaceActive = progress >= 0.315 && progress <= 0.485;
    const ladleActive = progress >= 0.465 && progress <= 0.68;

    if (furnacePointsRef.current) {
      furnacePointsRef.current.visible = furnaceActive;
      if (furnaceActive) {
        updateEmbers(furnace.geometry, furnace.particles, pourPoints.furnaceSpout.current, time, 1);
        furnaceMaterial.opacity = progress >= 0.42 ? 0.96 : 0.66;
      }
    }

    if (ladlePointsRef.current) {
      ladlePointsRef.current.visible = ladleActive;
      if (ladleActive) {
        updateEmbers(ladle.geometry, ladle.particles, pourPoints.ladleFill.current, time, 0.82);
        ladleMaterial.opacity = progress >= 0.58 ? 0.92 : 0.70;
      }
    }
  });

  return (
    <>
      <points ref={furnacePointsRef} geometry={furnace.geometry} material={furnaceMaterial} visible={false} />
      <points ref={ladlePointsRef} geometry={ladle.geometry} material={ladleMaterial} visible={false} />
    </>
  );
}
