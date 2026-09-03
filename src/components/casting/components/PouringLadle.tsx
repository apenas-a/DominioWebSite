import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  castingState,
  phaseProgress,
  easeInOut,
  easeOut,
  lerp,
} from '@/components/casting/CastingTimeline';
import { usePourPoints } from '@/components/casting/CastingContext';
import { moltenSurfaceShader } from '@/components/casting/shaders/moltenShaders';

/* ─────────────────────────────────────────────────────────────
   Industrial Pouring Ladle (Panela Cônica de Vazamento)
   
   Correções de Geometria Dinâmica & Colisão:
   1. Malha líquida cônica adaptativa: Expande-se radialmente de
      acordo com a inclinação exata das paredes internas cônicas,
      sem interpenetrar a base ou as paredes.
   2. Menisco líquido côncavo no topo: Superfície fluida côncava
      realista, em vez de tampa plana.
   3. Alinhamento exato no molde: Na etapa "Panela sobre o Molde"
      (Stage 08), a base e o foco de luz incandescente alinham-se
      com precisão milimétrica sobre o canal de alimentação (sprue)
      em X = 1.0.
   4. Sem colisão com o forno: A panela aguarda o forno retornar à
      vertical e recuar (p >= 0.51) antes de elevar-se e mover-se.
───────────────────────────────────────────────────────────── */

// Dimensions
const R_TOP_OUTER = 0.74;
const R_BOT_OUTER = 0.54;
const R_TOP_INNER = 0.68;
const R_BOT_INNER = 0.49;
const HEIGHT = 1.20;
const FLOOR_Y = -HEIGHT / 2 + 0.08; // -0.52
const CAVITY_H = HEIGHT - 0.16;     // 1.04

// Locations
const RECEIVE_X = 0.70;             // Centered below furnace spout
const RECEIVE_Y = 0.20;             // On the floor
const MOLD_SPRUE_X = 1.00;          // Exact center of mold sprue funnel
const MOLD_HOVER_Y = 3.18;          // Base hovers at Y ~ 2.58 directly over sprue mouth (Y = 2.37)

// Profile segment count for LatheGeometry
const LATHE_SEGMENTS = 24;
const NUM_PROFILE_POINTS = 6;

// Helper: builds initial conical lathe geometry
function createInitialLadleLiquidGeometry() {
  const dummyPoints = [
    new THREE.Vector2(0, FLOOR_Y),
    new THREE.Vector2(R_BOT_INNER, FLOOR_Y),
    new THREE.Vector2(R_BOT_INNER, FLOOR_Y + 0.01),
    new THREE.Vector2(R_BOT_INNER * 0.68, FLOOR_Y + 0.01),
    new THREE.Vector2(R_BOT_INNER * 0.32, FLOOR_Y + 0.005),
    new THREE.Vector2(0, FLOOR_Y),
  ];
  return new THREE.LatheGeometry(dummyPoints, LATHE_SEGMENTS);
}

// Helper: dynamically updates vertex positions to conform to cone slope with concave meniscus
function updateLadleLiquidGeometry(geom: THREE.BufferGeometry, fillRatio: number) {
  const f = THREE.MathUtils.clamp(fillRatio, 0.001, 1.0);
  const yBot = FLOOR_Y + 0.01;
  const yTop = yBot + f * CAVITY_H;
  const rBot = R_BOT_INNER;
  // Radially expands matching the cone wall slope:
  const rTop = rBot + f * (R_TOP_INNER - rBot);
  // Concave liquid meniscus dip in center:
  const meniscus = 0.038 * Math.sqrt(f);

  const profile = [
    [0, yBot],                             // 0: bottom center
    [rBot, yBot],                          // 1: bottom corner at refractory floor
    [rTop, yTop],                          // 2: top meniscus rim touching conical wall
    [rTop * 0.68, yTop - meniscus * 0.48], // 3: concave meniscus curve
    [rTop * 0.32, yTop - meniscus * 0.84], // 4: concave meniscus inner dip
    [0, yTop - meniscus],                  // 5: lowest point of concave meniscus in center
  ];

  const posAttr = geom.attributes.position as THREE.BufferAttribute;
  const posArr = posAttr.array as Float32Array;

  for (let j = 0; j <= LATHE_SEGMENTS; j++) {
    const phi = (j / LATHE_SEGMENTS) * Math.PI * 2;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);

    for (let i = 0; i < NUM_PROFILE_POINTS; i++) {
      const r = profile[i][0];
      const y = profile[i][1];
      const idx = (j * NUM_PROFILE_POINTS + i) * 3;
      posArr[idx] = r * sinPhi;
      posArr[idx + 1] = y;
      posArr[idx + 2] = r * cosPhi;
    }
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export default function PouringLadle({ debugFlow = false }: { debugFlow?: boolean }) {
  const ladlePivotRef = useRef<THREE.Group>(null);
  const metalMeshRef = useRef<THREE.Mesh>(null);
  const spoutMarkerRef = useRef<THREE.Mesh>(null);
  const fillMarkerRef = useRef<THREE.Mesh>(null);
  const ladleLightRef = useRef<THREE.PointLight>(null);
  const sprueFocusLightRef = useRef<THREE.PointLight>(null);
  const pourPoints = usePourPoints();

  // ── Molten Metal Shader ─────────────────────────────────────
  const metalShaderMat = useRef(
    new THREE.ShaderMaterial({
      uniforms: moltenSurfaceShader.uniforms(),
      vertexShader: moltenSurfaceShader.vertexShader,
      fragmentShader: moltenSurfaceShader.fragmentShader,
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide,
    })
  );

  // ── Materials ────────────────────────────────────────────────
  const { bodyMat, refractoryMat, rimMat } = useMemo(() => ({
    bodyMat: new THREE.MeshStandardMaterial({
      color: '#1e2129',
      roughness: 0.60,
      metalness: 0.85,
      side: THREE.FrontSide,
    }),
    refractoryMat: new THREE.MeshStandardMaterial({
      color: '#181512',
      roughness: 0.96,
      metalness: 0.04,
      side: THREE.BackSide,
    }),
    rimMat: new THREE.MeshStandardMaterial({
      color: '#282d38',
      roughness: 0.40,
      metalness: 0.90,
    }),
  }), []);

  // ── Pre-allocate Dynamic Conical Liquid Geometry ────────────
  const dynamicLiquidGeom = useMemo(() => createInitialLadleLiquidGeometry(), []);

  // ── Scroll Animation Loop ───────────────────────────────────
  useFrame(({ clock }) => {
    const p = castingState.progress;

    // 1. Ladle Position & Trajectory (Collision-Free Sequence)
    // • p < 0.28: Off-screen right (X = 20)
    // • p in [0.28, 0.33]: Enters to RECEIVE_X (0.70) under furnace spout
    // • p in [0.33, 0.50]: Stationary at RECEIVE_X receiving furnace pour
    // • p in [0.50, 0.52]: Waits while furnace returns upright and begins exit
    // • p in [0.52, 0.56]: Lifts up and glides to mold sprue station (X = 1.00, Y = 3.18)
    // • p in [0.56, 0.58]: Stationary hovering precisely above mold sprue (Stage 08)
    // • p in [0.58, 0.68]: Tilts and pours into mold sprue (Stage 09)
    // • p > 0.68: Retreats away
    let posX = 20;
    let posY = RECEIVE_Y;
    let tiltAngle = 0;
    let fillRatio = 0;
    let isVisible = false;

    if (p < 0.28) {
      posX = 20;
      posY = RECEIVE_Y;
    } else if (p <= 0.33) {
      const entryT = (p - 0.28) / (0.33 - 0.28);
      posX = lerp(20, RECEIVE_X, easeOut(entryT));
      posY = RECEIVE_Y;
    } else if (p <= 0.51) {
      // Stationary receiving furnace pour
      posX = RECEIVE_X;
      posY = RECEIVE_Y;
    } else if (p <= 0.56) {
      // Smooth arc travel to mold sprue station (X = 1.00, Y = 3.18)
      const travelT = easeInOut((p - 0.51) / (0.56 - 0.51));
      posX = lerp(RECEIVE_X, MOLD_SPRUE_X, travelT);
      // Lift vertically first, then settle
      posY = lerp(RECEIVE_Y, MOLD_HOVER_Y, Math.sin(travelT * (Math.PI / 2)));
    } else if (p <= 0.58) {
      // Stage 08: Exact precision hover directly over mold sprue
      posX = MOLD_SPRUE_X;
      posY = MOLD_HOVER_Y;
    } else if (p <= 0.68) {
      // Stage 09: Above mold sprue pouring
      posX = MOLD_SPRUE_X;
      posY = MOLD_HOVER_Y;
    } else if (p <= 0.73) {
      // Exiting scene
      const exitT = (p - 0.68) / 0.05;
      posX = lerp(MOLD_SPRUE_X, 22, easeInOut(exitT));
      posY = MOLD_HOVER_Y;
    } else {
      posX = 22;
      posY = MOLD_HOVER_Y;
    }

    // 2. Liquid Metal Level (Filling from furnace, draining into mold)
    if (p < 0.42) {
      fillRatio = 0;
      isVisible = false;
    } else if (p <= 0.485) {
      // Fills smoothly as furnace pours into ladle
      const pourT = (p - 0.42) / (0.485 - 0.42);
      fillRatio = THREE.MathUtils.clamp(pourT * 1.0, 0.001, 1.0);
      isVisible = true;
    } else if (p < 0.58) {
      // Full during transport and stage 08
      fillRatio = 1.0;
      isVisible = true;
    } else if (p <= 0.68) {
      // Drains into mold sprue
      const moldPourT = phaseProgress(p, 'LADLE_POUR');
      fillRatio = THREE.MathUtils.clamp(1.0 - moldPourT * 0.95, 0.03, 1.0);
      isVisible = true;
    } else {
      fillRatio = 0;
      isVisible = false;
    }

    // 3. Ladle Tilt when Pouring into Mold (Stage 09: 0.58 -> 0.68)
    if (p >= 0.58 && p <= 0.68) {
      const moldPourT = phaseProgress(p, 'LADLE_POUR');
      if (moldPourT < 0.20) {
        tiltAngle = lerp(0, -0.76, easeInOut(moldPourT / 0.20));
      } else if (moldPourT < 0.85) {
        tiltAngle = -0.76;
      } else {
        tiltAngle = lerp(-0.76, 0, (moldPourT - 0.85) / 0.15);
      }
    }

    if (ladlePivotRef.current) {
      ladlePivotRef.current.position.set(posX, posY, 0);
      ladlePivotRef.current.rotation.z = tiltAngle;
    }

    // 4. Update Dynamic Conical Liquid Geometry
    if (metalMeshRef.current) {
      metalMeshRef.current.visible = isVisible;
      if (isVisible) {
        updateLadleLiquidGeometry(dynamicLiquidGeom, fillRatio);
      }
    }

    // 5. Shader Uniforms
    if (metalShaderMat.current) {
      metalShaderMat.current.uniforms.uTime.value = clock.getElapsedTime();
      metalShaderMat.current.uniforms.uIntensity.value = isVisible ? 1.0 : 0;
    }

    // 6. Glowing Lights
    // Internal liquid core light
    if (ladleLightRef.current) {
      ladleLightRef.current.intensity = isVisible ? fillRatio * 6.5 : 0;
    }
    // Downwards sprue focus light at ladle base (highlights sprue funnel directly below)
    if (sprueFocusLightRef.current) {
      const isAboveSprue = p >= 0.53 && p <= 0.68;
      sprueFocusLightRef.current.intensity = isVisible && isAboveSprue ? fillRatio * 7.5 : 0;
    }

    // 7. World-space tracking points
    spoutMarkerRef.current?.getWorldPosition(pourPoints.ladleSpout.current);
    fillMarkerRef.current?.getWorldPosition(pourPoints.ladleFill.current);
  });

  return (
    <group ref={ladlePivotRef}>
      {/* Ladle body centered on origin of ladlePivotRef */}
      <group position={[0, 0, 0]}>

        {/* ═══ 1. OUTER STEEL SHELL (Open-ended truncated cone) ═══ */}
        <mesh material={bodyMat}>
          <cylinderGeometry args={[R_TOP_OUTER, R_BOT_OUTER, HEIGHT, 36, 1, true]} />
        </mesh>

        {/* ═══ 2. INNER REFRACTORY LINING (BackSide visible inside) ═══ */}
        <mesh material={refractoryMat}>
          <cylinderGeometry
            args={[R_TOP_INNER, R_BOT_INNER, HEIGHT - 0.02, 36, 1, true]}
          />
        </mesh>

        {/* ═══ 3. REFRACTORY FLOOR ═══ */}
        <mesh
          position={[0, FLOOR_Y, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={refractoryMat}
        >
          <circleGeometry args={[R_BOT_INNER, 32]} />
        </mesh>

        {/* ═══ 4. TOP COLLAR & MOUTH RIM ═══ */}
        <mesh position={[0, HEIGHT / 2, 0]} rotation={[Math.PI / 2, 0, 0]} material={rimMat}>
          <torusGeometry args={[R_TOP_OUTER - 0.01, 0.065, 16, 36]} />
        </mesh>

        {/* ═══ 5. POURING LIP SPOUT ═══ */}
        <group position={[R_TOP_OUTER - 0.02, HEIGHT / 2 - 0.03, 0]}>
          <mesh material={rimMat} rotation={[0, 0, -Math.PI / 4.5]}>
            <cylinderGeometry args={[0.08, 0.16, 0.35, 16]} />
          </mesh>
          <mesh ref={spoutMarkerRef} position={[0.38, -0.16, 0]} visible={debugFlow}>
            <sphereGeometry args={[0.04]} />
            <meshBasicMaterial color="red" />
          </mesh>
        </group>

        {/* Marker at top center of mouth (target for furnace pour stream) */}
        <mesh ref={fillMarkerRef} position={[0, HEIGHT / 2 + 0.04, 0]} visible={debugFlow}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="cyan" />
        </mesh>

        {/* ═══ 6. TRUNNION ARM & SUPPORT RINGS ═══ */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={rimMat}>
          <cylinderGeometry args={[0.045, 0.045, 1.9, 14]} />
        </mesh>
        <mesh position={[0, 0, 0.95]} material={rimMat}>
          <sphereGeometry args={[0.08, 12, 12]} />
        </mesh>
        <mesh position={[0, 0, -0.95]} material={rimMat}>
          <sphereGeometry args={[0.08, 12, 12]} />
        </mesh>

        {/* Base reinforcing band */}
        <mesh position={[0, -HEIGHT / 2 + 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} material={rimMat}>
          <torusGeometry args={[R_BOT_OUTER + 0.04, 0.05, 12, 36]} />
        </mesh>

        {/* ═══ 7. DYNAMIC ADAPTIVE CONICAL LIQUID METAL MESH ═══ */}
        <mesh
          ref={metalMeshRef}
          geometry={dynamicLiquidGeom}
          material={metalShaderMat.current}
          visible={false}
        />

        {/* ═══ 8. INCANDESCENT CORE POINT LIGHT ═══ */}
        <pointLight
          ref={ladleLightRef}
          position={[0, HEIGHT / 2 + 0.15, 0]}
          color="#ff6600"
          distance={10}
          decay={2}
          intensity={0}
        />

        {/* ═══ 9. SPRUE FOCUS LIGHT AT BASE (Focuses on sprue funnel) ═══ */}
        <pointLight
          ref={sprueFocusLightRef}
          position={[0, FLOOR_Y - 0.15, 0]}
          color="#ff5500"
          distance={6}
          decay={2}
          intensity={0}
        />
      </group>
    </group>
  );
}
