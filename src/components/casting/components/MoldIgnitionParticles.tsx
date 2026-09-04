import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { castingState } from '@/components/casting/CastingTimeline';

/* ─────────────────────────────────────────────────────────────
   Mold Ignition, Flame & Smoke Particle System (Ref. 16)
   
   Funcionalidades:
   1. Emana labaredas (flames) incandescentes e fumaça dinâmica dos
      pontos de alívio (risers/gates) no topo do molde.
   2. Ativado dinamicamente conforme a cavidade da engrenagem é
      completamente preenchida (p entre 0.69 e 0.77).
   3. Dinâmica física de partículas: velocidade vertical turbulenta,
      expansão de volume da fumaça, gradiente térmico de cores e
      iluminação pulsante de fogo.
───────────────────────────────────────────────────────────── */

const NUM_FLAME_PARTICLES = 90;
const NUM_SMOKE_PARTICLES = 65;

// Relief vent positions on top of the closed mold
const VENT_POSITIONS: [number, number, number][] = [
  [-1.12, 1.58, 0.90],   // Riser A (top left-front)
  [-1.12, 1.58, -0.90],  // Riser B (top left-back)
  [1.00, 2.38, 0.0],     // Sprue cup vent
];

export default function MoldIgnitionParticles() {
  const flamePointsRef = useRef<THREE.Points>(null);
  const smokePointsRef = useRef<THREE.Points>(null);
  const lightA = useRef<THREE.PointLight>(null);
  const lightB = useRef<THREE.PointLight>(null);

  // ── 1. Flame Particles Buffer Geometry ──
  const { flameGeom, flameData } = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(NUM_FLAME_PARTICLES * 3);
    const colors = new Float32Array(NUM_FLAME_PARTICLES * 3);
    const data: {
      ventIdx: number;
      pos: THREE.Vector3;
      vel: THREE.Vector3;
      life: number;
      maxLife: number;
      baseR: number;
    }[] = [];

    const cWhite = new THREE.Color('#ffffff');
    const cYellow = new THREE.Color('#ffcc22');
    const cOrange = new THREE.Color('#ff4400');

    for (let i = 0; i < NUM_FLAME_PARTICLES; i++) {
      const ventIdx = i % VENT_POSITIONS.length;
      const v = VENT_POSITIONS[ventIdx];
      data.push({
        ventIdx,
        pos: new THREE.Vector3(v[0], v[1], v[2]),
        vel: new THREE.Vector3(0, 0, 0),
        life: Math.random(),
        maxLife: 0.18 + Math.random() * 0.22,
        baseR: 0.02 + Math.random() * 0.05,
      });

      const col = Math.random() < 0.35 ? cWhite.clone().lerp(cYellow, Math.random()) : cYellow.clone().lerp(cOrange, Math.random());
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return { flameGeom: geom, flameData: data };
  }, []);

  // ── 2. Smoke Particles Buffer Geometry ──
  const { smokeGeom, smokeData } = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(NUM_SMOKE_PARTICLES * 3);
    const colors = new Float32Array(NUM_SMOKE_PARTICLES * 3);
    const data: {
      ventIdx: number;
      pos: THREE.Vector3;
      vel: THREE.Vector3;
      life: number;
      maxLife: number;
    }[] = [];

    const cAsh = new THREE.Color('#2e2b27');
    const cCharcoal = new THREE.Color('#1c1a18');

    for (let i = 0; i < NUM_SMOKE_PARTICLES; i++) {
      const ventIdx = i % VENT_POSITIONS.length;
      const v = VENT_POSITIONS[ventIdx];
      data.push({
        ventIdx,
        pos: new THREE.Vector3(v[0], v[1], v[2]),
        vel: new THREE.Vector3(0, 0, 0),
        life: Math.random(),
        maxLife: 0.55 + Math.random() * 0.50,
      });

      const col = cAsh.clone().lerp(cCharcoal, Math.random());
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return { smokeGeom: geom, smokeData: data };
  }, []);

  // Materials
  const flameMat = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.085,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  const smokeMat = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
  }, []);

  useFrame(({ clock }, delta) => {
    const p = castingState.progress;
    const time = clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);

    // Ignition is active as gear reaches full fill in Stage 10 (Ref. 16: 0.69 to 0.77)
    const isIgnited = p >= 0.69 && p <= 0.77;

    if (isIgnited) {
      // Intensity curve peaking at p = 0.73
      let intensity = 1.0;
      if (p < 0.72) {
        intensity = (p - 0.69) / 0.03;
      } else if (p > 0.74) {
        intensity = (0.77 - p) / 0.03;
      }
      intensity = THREE.MathUtils.clamp(intensity, 0.0, 1.0);

      // 1. Update Flames
      if (flamePointsRef.current) {
        flamePointsRef.current.visible = true;
        const posAttr = flameGeom.attributes.position as THREE.BufferAttribute;
        const posArr = posAttr.array as Float32Array;

        for (let i = 0; i < NUM_FLAME_PARTICLES; i++) {
          const item = flameData[i];
          item.life += dt;

          if (item.life >= item.maxLife) {
            item.life = 0;
            const vent = VENT_POSITIONS[item.ventIdx];
            const theta = Math.random() * Math.PI * 2;
            const r = item.baseR * Math.sqrt(Math.random());
            item.pos.set(vent[0] + Math.cos(theta) * r, vent[1], vent[2] + Math.sin(theta) * r);
            item.vel.set(
              (Math.random() - 0.5) * 0.25,
              1.4 + Math.random() * 1.6,
              (Math.random() - 0.5) * 0.25
            );
          } else {
            // Upward rush with micro turbulence
            item.pos.x += (item.vel.x + Math.sin(time * 15.0 + i) * 0.05) * dt;
            item.pos.y += item.vel.y * dt;
            item.pos.z += (item.vel.z + Math.cos(time * 15.0 + i) * 0.05) * dt;
          }

          posArr[i * 3] = item.pos.x;
          posArr[i * 3 + 1] = item.pos.y;
          posArr[i * 3 + 2] = item.pos.z;
        }

        posAttr.needsUpdate = true;
        flameMat.opacity = intensity * 0.95;
      }

      // 2. Update Smoke
      if (smokePointsRef.current) {
        smokePointsRef.current.visible = true;
        const posAttr = smokeGeom.attributes.position as THREE.BufferAttribute;
        const posArr = posAttr.array as Float32Array;

        for (let i = 0; i < NUM_SMOKE_PARTICLES; i++) {
          const item = smokeData[i];
          item.life += dt;

          if (item.life >= item.maxLife) {
            item.life = 0;
            const vent = VENT_POSITIONS[item.ventIdx];
            const theta = Math.random() * Math.PI * 2;
            const r = 0.05 * Math.sqrt(Math.random());
            // Smoke emerges slightly higher from the flame tip
            item.pos.set(vent[0] + Math.cos(theta) * r, vent[1] + 0.25, vent[2] + Math.sin(theta) * r);
            item.vel.set(
              (Math.random() - 0.5) * 0.35,
              0.55 + Math.random() * 0.65,
              (Math.random() - 0.5) * 0.35
            );
          } else {
            // Billowing expansion and rise
            item.pos.x += item.vel.x * dt;
            item.pos.y += item.vel.y * dt;
            item.pos.z += item.vel.z * dt;
          }

          posArr[i * 3] = item.pos.x;
          posArr[i * 3 + 1] = item.pos.y;
          posArr[i * 3 + 2] = item.pos.z;
        }

        posAttr.needsUpdate = true;
        smokeMat.opacity = intensity * 0.50;
      }

      // 3. Flame Lighting at Risers
      const fireFlicker = 0.85 + Math.sin(time * 35.0) * 0.15;
      if (lightA.current) {
        lightA.current.intensity = intensity * 6.5 * fireFlicker;
      }
      if (lightB.current) {
        lightB.current.intensity = intensity * 6.5 * fireFlicker;
      }
    } else {
      if (flamePointsRef.current) flamePointsRef.current.visible = false;
      if (smokePointsRef.current) smokePointsRef.current.visible = false;
      if (lightA.current) lightA.current.intensity = 0;
      if (lightB.current) lightB.current.intensity = 0;
    }
  });

  return (
    <>
      {/* Dynamic Flames */}
      <points
        ref={flamePointsRef}
        geometry={flameGeom}
        material={flameMat}
        visible={false}
      />

      {/* Dynamic Smoke */}
      <points
        ref={smokePointsRef}
        geometry={smokeGeom}
        material={smokeMat}
        visible={false}
      />

      {/* Relief Point Ignition Lights */}
      <pointLight
        ref={lightA}
        position={[-1.12, 1.85, 0.90]}
        color="#ff5500"
        distance={6.0}
        decay={2}
        intensity={0}
      />
      <pointLight
        ref={lightB}
        position={[-1.12, 1.85, -0.90]}
        color="#ff5500"
        distance={6.0}
        decay={2}
        intensity={0}
      />
    </>
  );
}
