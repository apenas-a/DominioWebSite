import React, { useRef, useMemo } from 'react';
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
   High-Precision Induction Furnace (Forno de Indução)
   
   Design requirements:
   1. Open, hollow vessel: Looking into top circular mouth reveals
      deep, dark refractory-lined crucible cavity.
   2. Organic pouring spout (calha de vazamento): Smooth, sculpted
      trough integrated into the top rim, NOT a block.
   3. Fluid scroll-driven metal fill: Starts completely empty (mesh hidden),
      smoothly rises from the refractory floor to just below the rim
      ("quase a boca") between scroll 0.27 and 0.34.
   4. Pivot axis: Rotates around the spout edge so the stream pours
      accurately into the ladle waiting below.
   5. Dynamic incandescence & heat glow.
───────────────────────────────────────────────────────────── */

// Dimensions
const SHELL_R_TOP = 1.35;
const SHELL_R_BOT = 1.22;
const CAVITY_R_TOP = 1.12;
const CAVITY_R_BOT = 1.02;
const HEIGHT = 2.70;
const FLOOR_Y = -HEIGHT / 2 + 0.15; // -1.20
const MAX_FILL_H = HEIGHT - 0.40;   // 2.30 (stops right below mouth rim)

export default function Furnace({ debugFlow = false }: { debugFlow?: boolean }) {
  const pivotRef = useRef<THREE.Group>(null);
  const metalMeshRef = useRef<THREE.Mesh>(null);
  const spoutMarkerRef = useRef<THREE.Mesh>(null);
  const furnacePointLightRef = useRef<THREE.PointLight>(null);
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
  const { shellMat, rimMat, refractoryMat, floorMat, coilMat, spoutMat } = useMemo(() => {
    return {
      // Industrial heavy steel outer shell
      shellMat: new THREE.MeshStandardMaterial({
        color: '#181b22',
        roughness: 0.55,
        metalness: 0.85,
        side: THREE.FrontSide,
      }),
      // Machined top rim collar
      rimMat: new THREE.MeshStandardMaterial({
        color: '#222733',
        roughness: 0.40,
        metalness: 0.90,
      }),
      // Dark refractory crucible lining (seen looking inside)
      refractoryMat: new THREE.MeshStandardMaterial({
        color: '#1a1715',
        roughness: 0.96,
        metalness: 0.04,
        side: THREE.BackSide,
      }),
      // Refractory bottom floor
      floorMat: new THREE.MeshStandardMaterial({
        color: '#141210',
        roughness: 0.98,
        metalness: 0.02,
        side: THREE.FrontSide,
      }),
      // Heavy copper induction coils
      coilMat: new THREE.MeshStandardMaterial({
        color: '#c46a28',
        roughness: 0.25,
        metalness: 0.92,
      }),
      // Smooth contoured pouring spout
      spoutMat: new THREE.MeshStandardMaterial({
        color: '#1e222b',
        roughness: 0.45,
        metalness: 0.88,
      }),
    };
  }, []);

  // ── Pre-build Geometry for the Metal Plug (Anchor at base) ───
  const metalGeom = useMemo(() => {
    // Tapered cylinder matching crucible interior
    const geom = new THREE.CylinderGeometry(
      CAVITY_R_TOP - 0.02,
      CAVITY_R_BOT - 0.02,
      MAX_FILL_H,
      36,
      1
    );
    // Shift origin so (0,0,0) is at the bottom face:
    geom.translate(0, MAX_FILL_H / 2, 0);
    return geom;
  }, []);

  // ── Build Sculpted Organic Spout Geometry ───────────────────
  const spoutMeshGroup = useMemo(() => {
    const group = new THREE.Group();

    // 1. Spout channel trough base (curved half-cylinder flared outward)
    const troughGeom = new THREE.CylinderGeometry(0.32, 0.18, 0.70, 16, 1, false, 0, Math.PI);
    troughGeom.rotateZ(-Math.PI / 2); // align along X
    troughGeom.rotateY(Math.PI / 2);
    const trough = new THREE.Mesh(troughGeom, spoutMat);
    trough.position.set(0.35, -0.06, 0);
    trough.rotation.z = -0.32; // slight downward tilt
    group.add(trough);

    // 2. Left and right guide flanges (contain the fluid)
    const flangeGeom = new THREE.BoxGeometry(0.65, 0.18, 0.05);
    const leftFlange = new THREE.Mesh(flangeGeom, spoutMat);
    leftFlange.position.set(0.34, 0.05, 0.16);
    leftFlange.rotation.z = -0.32;
    group.add(leftFlange);

    const rightFlange = new THREE.Mesh(flangeGeom, spoutMat);
    rightFlange.position.set(0.34, 0.05, -0.16);
    rightFlange.rotation.z = -0.32;
    group.add(rightFlange);

    // 3. Smooth rounded pouring lip tip (where the stream separates)
    const lipGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.32, 12);
    lipGeom.rotateX(Math.PI / 2);
    const lip = new THREE.Mesh(lipGeom, spoutMat);
    lip.position.set(0.64, -0.22, 0);
    group.add(lip);

    return group;
  }, [spoutMat]);

  // ── Scroll Animation Loop ───────────────────────────────────
  useFrame(({ clock }) => {
    const p = castingState.progress;

    // 1. Entrance / Exit X position
    let posX = 25;
    if (p < 0.15) {
      posX = 25;
    } else if (p <= 0.20) {
      posX = lerp(25, 0.70, easeOut(phaseProgress(p, 'TRANSITION_FURNACE')));
    } else if (p < 0.50) {
      posX = 0.70;
    } else if (p <= 0.55) {
      posX = lerp(0.70, -25, easeInOut(Math.min(1, (p - 0.50) / 0.05)));
    } else {
      posX = -25;
    }

    // 2. Furnace tilt (tilt angle around the spout pivot)
    // Starts tilting at p=0.34 (Stage 06), reaches pour angle at p=0.42 (Stage 07)
    let tiltAngle = 0;
    if (p < 0.34) {
      tiltAngle = 0;
    } else if (p <= 0.42) {
      tiltAngle = lerp(0, -0.92, easeInOut(phaseProgress(p, 'FURNACE_TILT')));
    } else if (p <= 0.50) {
      tiltAngle = -0.92; // hold pour tilt
    } else if (p <= 0.52) {
      tiltAngle = lerp(-0.92, 0, Math.min(1, (p - 0.50) / 0.02));
    } else {
      tiltAngle = 0;
    }

    if (pivotRef.current) {
      pivotRef.current.position.set(posX, 2.2, 0);
      pivotRef.current.rotation.z = tiltAngle;
    }

    // 3. Metal Filling Level (Linear with scroll, zero lag)
    // Stage 04 (0.20 -> 0.27): Empty vessel, mesh hidden
    // Stage 05 (0.27 -> 0.34): Fills smoothly from 0 to 1
    // Stage 06 (0.34 -> 0.42): Remains full during tilt
    // Stage 07 (0.42 -> 0.50): Drains from 1 to 0.08 as metal pours into ladle
    let fillRatio = 0;
    let isVisible = false;
    let heatIntensity = 0;

    if (p < 0.27) {
      fillRatio = 0;
      isVisible = false;
      heatIntensity = 0;
    } else if (p <= 0.34) {
      // Linear fill responsive to scroll speed
      fillRatio = (p - 0.27) / (0.34 - 0.27);
      fillRatio = THREE.MathUtils.clamp(fillRatio, 0.001, 1.0);
      isVisible = true;
      heatIntensity = 0.2 + fillRatio * 0.8; // transitions from dull red to hot orange
    } else if (p < 0.42) {
      fillRatio = 1.0;
      isVisible = true;
      heatIntensity = 1.0;
    } else if (p <= 0.50) {
      // Drains into ladle
      const drainProgress = phaseProgress(p, 'FURNACE_POUR');
      fillRatio = lerp(1.0, 0.08, drainProgress);
      isVisible = true;
      heatIntensity = lerp(1.0, 0.6, drainProgress);
    } else {
      fillRatio = 0;
      isVisible = false;
      heatIntensity = 0;
    }

    // Apply scale to metal mesh
    if (metalMeshRef.current) {
      metalMeshRef.current.visible = isVisible;
      if (isVisible) {
        // Vertical scale smoothly raises the top surface from bottom floor
        metalMeshRef.current.scale.set(1, Math.max(0.001, fillRatio), 1);
      }
    }

    // Update shader uniforms
    if (metalShaderMat.current) {
      metalShaderMat.current.uniforms.uTime.value = clock.getElapsedTime();
      metalShaderMat.current.uniforms.uIntensity.value = heatIntensity;
    }

    // Dynamic furnace point light inside crucible
    if (furnacePointLightRef.current) {
      furnacePointLightRef.current.intensity = isVisible ? heatIntensity * 4.5 : 0;
    }

    // Update global world position of the spout lip for PourStream
    if (spoutMarkerRef.current) {
      spoutMarkerRef.current.getWorldPosition(pourPoints.furnaceSpout.current);
    }
  });

  return (
    <group ref={pivotRef}>
      {/* 
        Group offset so the tilt axis (0,0,0 of pivotRef) sits right at the spout lip!
        Spout lip is at +X of furnace top rim:
        Furnace center is placed at X = -SHELL_R_TOP, Y = -HEIGHT / 2
      */}
      <group position={[-SHELL_R_TOP - 0.20, -HEIGHT / 2 + 0.15, 0]}>

        {/* ═══ 1. OUTER STEEL SHELL (Open-ended cylinder, hollow) ═══ */}
        <mesh material={shellMat}>
          <cylinderGeometry
            args={[SHELL_R_TOP, SHELL_R_BOT, HEIGHT, 48, 1, true]}
          />
        </mesh>

        {/* ═══ 2. REINFORCED BASE PLATFORM ═══ */}
        <mesh position={[0, -HEIGHT / 2 + 0.08, 0]} material={rimMat}>
          <cylinderGeometry args={[SHELL_R_BOT + 0.15, SHELL_R_BOT + 0.22, 0.20, 48]} />
        </mesh>

        {/* ═══ 3. TOP COLLAR & MOUTH RIM (Clean circular opening) ═══ */}
        {/* Outer collar flange */}
        <mesh position={[0, HEIGHT / 2 - 0.05, 0]} material={rimMat}>
          <cylinderGeometry args={[SHELL_R_TOP + 0.08, SHELL_R_TOP, 0.14, 48, 1, true]} />
        </mesh>
        {/* Rounded smooth rim torus (defines the circular mouth) */}
        <mesh position={[0, HEIGHT / 2, 0]} rotation={[Math.PI / 2, 0, 0]} material={rimMat}>
          <torusGeometry args={[CAVITY_R_TOP + 0.08, 0.085, 20, 48]} />
        </mesh>

        {/* ═══ 4. INNER REFRACTORY CRUCIBLE (Lining inside) ═══ */}
        <mesh material={refractoryMat}>
          <cylinderGeometry
            args={[CAVITY_R_TOP, CAVITY_R_BOT, HEIGHT - 0.05, 48, 1, true]}
          />
        </mesh>

        {/* ═══ 5. REFRACTORY BOTTOM FLOOR DISC ═══ */}
        <mesh
          position={[0, FLOOR_Y, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={floorMat}
        >
          <circleGeometry args={[CAVITY_R_BOT - 0.01, 36]} />
        </mesh>

        {/* ═══ 6. INDUCTION HEATING COILS (5 heavy copper rings) ═══ */}
        {[-0.85, -0.42, 0.0, 0.42, 0.85].map((yPos, idx) => (
          <mesh
            key={idx}
            position={[0, yPos, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            material={coilMat}
          >
            <torusGeometry args={[SHELL_R_TOP + 0.06, 0.065, 16, 48]} />
          </mesh>
        ))}

        {/* ═══ 7. VERTICAL STAVES (Industrial coil structural ties) ═══ */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
          <mesh
            key={idx}
            position={[
              Math.cos(angle) * (SHELL_R_TOP + 0.12),
              0,
              Math.sin(angle) * (SHELL_R_TOP + 0.12),
            ]}
            material={rimMat}
          >
            <boxGeometry args={[0.08, HEIGHT - 0.4, 0.06]} />
          </mesh>
        ))}

        {/* ═══ 8. ORGANIC SCULPTED POURING SPOUT ═══ */}
        <group position={[CAVITY_R_TOP + 0.04, HEIGHT / 2 - 0.06, 0]}>
          <primitive object={spoutMeshGroup} />

          {/* Marker at the tip of the pouring lip for the stream */}
          <mesh ref={spoutMarkerRef} position={[0.66, -0.22, 0]} visible={debugFlow}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial color="yellow" />
          </mesh>
        </group>

        {/* ═══ 9. SCROLL-DRIVEN LIQUID METAL MESH ═══ */}
        {/* Anchored at FLOOR_Y; scaling Y expands upwards cleanly */}
        <mesh
          ref={metalMeshRef}
          position={[0, FLOOR_Y, 0]}
          geometry={metalGeom}
          material={metalShaderMat.current}
          visible={false}
        />

        {/* ═══ 10. CRUCIBLE CORE POINT LIGHT ═══ */}
        <pointLight
          ref={furnacePointLightRef}
          position={[0, 0.5, 0]}
          color="#ff5500"
          distance={12}
          decay={2}
          intensity={0}
        />
      </group>
    </group>
  );
}
