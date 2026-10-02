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
const RECEIVE_X = 1.90;             // Clear of the furnace foundation during receiving
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
  const lastLiquidFillRef = useRef(-1);
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
  const { bodyMat, refractoryMat, rimMat, frameMat, bandMat, mechanismMat } = useMemo(() => ({
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
    frameMat: new THREE.MeshStandardMaterial({
      color: '#11151d',
      roughness: 0.50,
      metalness: 0.84,
    }),
    bandMat: new THREE.MeshStandardMaterial({
      color: '#303846',
      roughness: 0.32,
      metalness: 0.94,
    }),
    mechanismMat: new THREE.MeshStandardMaterial({
      color: '#8b350f',
      roughness: 0.36,
      metalness: 0.78,
    }),
  }), []);

  // ── Pre-allocate Dynamic Conical Liquid Geometry ────────────
  const dynamicLiquidGeom = useMemo(() => createInitialLadleLiquidGeometry(), []);

  // A curved lip gives the pan a clear direction of pour, instead of the
  // previous diagonal cylinder that could read as a loose metal strip.
  const spoutGeom = useMemo(() => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(R_TOP_OUTER - 0.16, HEIGHT / 2 - 0.04, 0),
      new THREE.Vector3(R_TOP_OUTER + 0.04, HEIGHT / 2 - 0.05, 0),
      new THREE.Vector3(0.90, 0.53, 0),
      new THREE.Vector3(0.98, 0.45, 0),
    ]);
    return new THREE.TubeGeometry(path, 14, 0.10, 10, false);
  }, []);

  // ── Scroll Animation Loop ───────────────────────────────────
  useFrame(({ clock }) => {
    const p = castingState.progress;

    // 1. Ladle Position & Trajectory (Ref. 15, 16, 17 Kinematics)
    // • p < 0.39: Off-screen right while the furnace is being charged
    // • p in [0.39, 0.415]: Enters only after the furnace begins to tilt
    // • p in [0.415, 0.535]: Stationary under the spout, receiving metal
    // • p in [0.535, 0.58]: Lifts after the furnace has cleared the bay
    // • p = 0.58: Axis aligned over the sprue (X = 1.00, Y = 3.25)
    // • p in [0.58, 0.68]: Stage 09 (Ref. 15): Smooth tilt with spout locked directly over sprue mouth (X = 1.00, Y = 2.65)
    // • p in [0.68, 0.75]: Stage 10 (Ref. 16): Upright stable above sprue while mold fills and ignites
    // • p in [0.75, 0.80]: Stage 11 (Ref. 17): Moves smoothly away from mold to right (X = 22) after ignition
    // • p > 0.80: Off-screen
    let posX = 20;
    let posY = RECEIVE_Y;
    let tiltAngle = 0;
    let fillRatio = 0;
    let isVisible = false;

    // Local coordinates of the spout tip relative to ladle center
    const SPOUT_LOCAL_X = 0.98;
    const SPOUT_LOCAL_Y = 0.45;
    // Sprue mouth target coordinates
    const SPRUE_TARGET_X = MOLD_SPRUE_X; // 1.00
    const SPRUE_TARGET_Y = 3.35;          // Clearance over the mold while preserving a visible stream drop
    const UPRIGHT_HOVER_Y = 3.25;

    if (p < 0.39) {
      posX = 20;
      posY = RECEIVE_Y;
    } else if (p <= 0.415) {
      // Keep the furnace-only stages visually clean, then use a short,
      // dedicated hand-off window before the stream starts.
      const entryT = (p - 0.39) / (0.415 - 0.39);
      posX = lerp(20, RECEIVE_X, easeOut(entryT));
      posY = RECEIVE_Y;
    } else if (p <= 0.535) {
      // Stationary receiving furnace pour
      posX = RECEIVE_X;
      posY = RECEIVE_Y;
    } else if (p <= 0.58) {
      // The furnace exits through the opposite lane first; only then does
      // the full ladle lift toward the mold.
      const travelT = easeInOut((p - 0.535) / (0.58 - 0.535));
      posX = lerp(RECEIVE_X, MOLD_SPRUE_X, travelT);
      posY = lerp(RECEIVE_Y, UPRIGHT_HOVER_Y, Math.sin(travelT * (Math.PI / 2)));
    } else if (p <= 0.68) {
      // Stage 09 (Ref. 15): Tilts smoothly with pouring lip locked over sprue mouth
      const moldPourT = phaseProgress(p, 'LADLE_POUR');
      const MAX_TILT = -0.72; // ~41.2 degrees

      let currentTilt = 0;
      let tiltProgress = 0;
      if (moldPourT < 0.20) {
        tiltProgress = easeInOut(moldPourT / 0.20);
        currentTilt = lerp(0, MAX_TILT, tiltProgress);
      } else if (moldPourT < 0.85) {
        tiltProgress = 1.0;
        currentTilt = MAX_TILT;
      } else {
        tiltProgress = 1.0 - easeInOut((moldPourT - 0.85) / 0.15);
        currentTilt = lerp(0, MAX_TILT, tiltProgress);
      }

      tiltAngle = currentTilt;

      // Kinematic rotation of spout vector
      const cosT = Math.cos(currentTilt);
      const sinT = Math.sin(currentTilt);
      const rotSpoutX = SPOUT_LOCAL_X * cosT - SPOUT_LOCAL_Y * sinT;
      const rotSpoutY = SPOUT_LOCAL_X * sinT + SPOUT_LOCAL_Y * cosT;

      // Position pivot so spout tip stays locked right over sprue
      const tiltedPosX = SPRUE_TARGET_X - rotSpoutX;
      const tiltedPosY = SPRUE_TARGET_Y - rotSpoutY;

      posX = lerp(MOLD_SPRUE_X, tiltedPosX, tiltProgress);
      posY = lerp(UPRIGHT_HOVER_Y, tiltedPosY, tiltProgress);
    } else if (p <= 0.75) {
      // Stage 10 (Ref. 16): Upright and stable above sprue while mold fills and ignites
      posX = MOLD_SPRUE_X;
      posY = UPRIGHT_HOVER_Y + 0.10;
      tiltAngle = 0;
    } else if (p <= 0.80) {
      // Stage 11 (Ref. 17): After ignition and full fill, ladle moves smoothly away from mold
      const exitT = easeInOut((p - 0.75) / 0.05);
      posX = lerp(MOLD_SPRUE_X, 22, exitT);
      posY = lerp(UPRIGHT_HOVER_Y + 0.10, 4.0, exitT);
      tiltAngle = 0;
    } else {
      posX = 22;
      posY = 4.0;
      tiltAngle = 0;
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

    if (ladlePivotRef.current) {
      const carryingMetal = p >= 0.42 && p < 0.58;
      // The suspended ladle settles very subtly while full. The pour itself
      // stays kinematically locked to the sprue for a clean, believable hit.
      const settle = carryingMetal ? Math.sin(clock.getElapsedTime() * 4.4) * 0.012 : 0;
      ladlePivotRef.current.position.set(posX, posY + settle, 0);
      ladlePivotRef.current.rotation.z = tiltAngle + settle * 0.22;
    }

    // 3. Update Dynamic Conical Liquid Geometry
    if (metalMeshRef.current) {
      metalMeshRef.current.visible = isVisible;
      if (isVisible && Math.abs(fillRatio - lastLiquidFillRef.current) > 0.001) {
        updateLadleLiquidGeometry(dynamicLiquidGeom, fillRatio);
        lastLiquidFillRef.current = fillRatio;
      }
    }

    // 4. Shader Uniforms
    if (metalShaderMat.current) {
      metalShaderMat.current.uniforms.uTime.value = clock.getElapsedTime();
      metalShaderMat.current.uniforms.uIntensity.value = isVisible ? 1.0 : (p >= 0.68 && p <= 0.75 ? 0.35 : 0);
    }

    // 5. Glowing Lights
    // Internal liquid core light
    if (ladleLightRef.current) {
      ladleLightRef.current.intensity = isVisible ? fillRatio * 6.5 : (p >= 0.68 && p <= 0.75 ? 1.2 : 0);
    }
    // Downwards sprue focus light at ladle base (highlights sprue funnel directly below)
    if (sprueFocusLightRef.current) {
      const isAboveSprue = p >= 0.53 && p <= 0.75;
      sprueFocusLightRef.current.intensity = isAboveSprue ? (isVisible ? fillRatio * 7.5 : 1.5) : 0;
    }

    // 6. World-space tracking points
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

        {/* Heavy reinforcing hoops give the vessel the mass of a foundry ladle. */}
        {[-0.34, 0.03, 0.37].map((y, index) => (
          <mesh
            key={y}
            position={[0, y, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            material={bandMat}
          >
            <torusGeometry args={[R_BOT_OUTER + 0.10 + index * 0.065, 0.045, 10, 36]} />
          </mesh>
        ))}

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
          <torusGeometry args={[R_TOP_OUTER - 0.01, 0.085, 16, 36]} />
        </mesh>

        {/* Thick foot ring, visually separated from the refractory floor. */}
        <mesh position={[0, -HEIGHT / 2 + 0.04, 0]} material={bandMat}>
          <cylinderGeometry args={[R_BOT_OUTER + 0.10, R_BOT_OUTER + 0.14, 0.14, 32]} />
        </mesh>

        {/* ═══ 5. POURING LIP SPOUT ═══ */}
        <mesh geometry={spoutGeom} material={rimMat} />
        <mesh position={[0.98, 0.45, 0]} rotation={[0, Math.PI / 2, 0]} material={rimMat}>
          <torusGeometry args={[0.10, 0.026, 8, 14]} />
        </mesh>
        <mesh ref={spoutMarkerRef} position={[0.98, 0.45, 0]} visible={debugFlow}>
          <sphereGeometry args={[0.04]} />
          <meshBasicMaterial color="red" />
        </mesh>

        {/* Marker at top center of mouth (target for furnace pour stream) */}
        <mesh ref={fillMarkerRef} position={[0, HEIGHT / 2 + 0.04, 0]} visible={debugFlow}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="cyan" />
        </mesh>

        {/* ═══ 6. TRUNNION ARM, LIFTING YOKE & POURING GEAR ═══ */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={frameMat}>
          <cylinderGeometry args={[0.09, 0.09, 2.50, 16]} />
        </mesh>
        <mesh position={[0, 0, 1.25]} material={bandMat}>
          <sphereGeometry args={[0.14, 14, 14]} />
        </mesh>
        <mesh position={[0, 0, -1.25]} material={bandMat}>
          <sphereGeometry args={[0.14, 14, 14]} />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side} position={[-0.12, 0.14, side * 1.22]}>
            <mesh position={[0, 0.50, 0]} rotation={[0, 0, side * 0.13]} material={frameMat}>
              <boxGeometry args={[0.14, 1.02, 0.18]} />
            </mesh>
            <mesh position={[0.30, 0.90, 0]} rotation={[0, 0, side * 0.10]} material={frameMat}>
              <boxGeometry args={[0.78, 0.14, 0.18]} />
            </mesh>
          </group>
        ))}

        {/* Front-side manual gearbox and handwheel, inspired by pouring ladles. */}
        <group position={[-0.14, 0.06, 1.34]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={mechanismMat}>
            <cylinderGeometry args={[0.26, 0.30, 0.24, 16]} />
          </mesh>
          <mesh position={[0, 0, 0.17]} rotation={[Math.PI / 2, 0, 0]} material={bandMat}>
            <cylinderGeometry args={[0.12, 0.12, 0.10, 14]} />
          </mesh>
          <mesh position={[0, 0, 0.25]} material={mechanismMat}>
            <torusGeometry args={[0.46, 0.045, 10, 28]} />
          </mesh>
          {[0, Math.PI / 2, Math.PI / 4, -Math.PI / 4].map((angle) => (
            <mesh key={angle} position={[0, 0, 0.25]} rotation={[0, 0, angle]} material={mechanismMat}>
              <boxGeometry args={[0.80, 0.045, 0.045]} />
            </mesh>
          ))}
        </group>

        {/* Base reinforcing band */}
        <mesh position={[0, -HEIGHT / 2 + 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} material={rimMat}>
          <torusGeometry args={[R_BOT_OUTER + 0.10, 0.06, 12, 36]} />
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
