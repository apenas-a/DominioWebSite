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
   Industrial Pouring Ladle (Panela de Vazamento)
   
   Design requirements:
   1. Hollow conical vessel with dark refractory interior and
      well-defined top mouth rim and pouring lip.
   2. Present and centered directly below the furnace spout:
      Arrives by p=0.33 so it is already waiting during tilt (0.34-0.42)
      and centered below the pour stream (0.42-0.50).
   3. Molten metal filling: The liquid metal rises smoothly inside
      the ladle as it receives the stream (p=0.42 -> 0.50).
   4. High incandescence: Intense glowing core point light casting
      heat on the environment and ladle body.
   5. Transport to mold (0.50-0.58) and mold pour (0.58-0.68).
───────────────────────────────────────────────────────────── */

// Dimensions
const R_TOP = 0.76;
const R_BOT = 0.56;
const HEIGHT = 1.20;
const CAVITY_H = 1.05;
const FLOOR_Y = -HEIGHT / 2 + 0.08;

// Exact receiving position under the furnace spout
const RECEIVE_X = 0.70;
const RECEIVE_Y = 0.20; // sits on the floor

export default function PouringLadle({ debugFlow = false }: { debugFlow?: boolean }) {
  const ladlePivotRef = useRef<THREE.Group>(null);
  const metalMeshRef = useRef<THREE.Mesh>(null);
  const spoutMarkerRef = useRef<THREE.Mesh>(null);
  const fillMarkerRef = useRef<THREE.Mesh>(null);
  const ladleLightRef = useRef<THREE.PointLight>(null);
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
    // Industrial steel shell
    bodyMat: new THREE.MeshStandardMaterial({
      color: '#1e2129',
      roughness: 0.60,
      metalness: 0.85,
      side: THREE.FrontSide,
    }),
    // Refractory lining inside ladle
    refractoryMat: new THREE.MeshStandardMaterial({
      color: '#181512',
      roughness: 0.96,
      metalness: 0.04,
      side: THREE.BackSide,
    }),
    // Heavy rim and trunnion mounting
    rimMat: new THREE.MeshStandardMaterial({
      color: '#282d38',
      roughness: 0.40,
      metalness: 0.90,
    }),
  }), []);

  // ── Pre-build Geometry for Metal Fill (anchored at base) ─────
  const metalGeom = useMemo(() => {
    const geom = new THREE.CylinderGeometry(
      R_TOP - 0.04,
      R_BOT - 0.04,
      CAVITY_H,
      32,
      1
    );
    geom.translate(0, CAVITY_H / 2, 0); // Origin at bottom face
    return geom;
  }, []);

  // ── Scroll Animation Loop ───────────────────────────────────
  useFrame(({ clock }) => {
    const p = castingState.progress;

    // 1. Ladle Position & Trajectory
    // Stage 01-04 (0.00-0.27): Off-screen (x=20)
    // Stage 05 (0.27-0.34): Arrives smoothly to RECEIVE_X by p=0.33
    // Stage 06-07 (0.34-0.50): Stays steady at RECEIVE_X receiving pour
    // Stage 08 (0.50-0.58): Moves towards mold (x=0.5, y=3.2)
    // Stage 09 (0.58-0.68): Pours into mold
    // Stage 10+ (0.68+): Moves away
    let posX = 20;
    let posY = RECEIVE_Y;
    let tiltAngle = 0;
    let fillRatio = 0;
    let isVisible = false;

    if (p < 0.28) {
      posX = 20;
      posY = RECEIVE_Y;
    } else if (p <= 0.33) {
      // Slides smoothly into position under furnace spout
      const entryT = (p - 0.28) / (0.33 - 0.28);
      posX = lerp(20, RECEIVE_X, easeOut(entryT));
      posY = RECEIVE_Y;
    } else if (p <= 0.50) {
      // Locked directly below furnace spout during tilt and furnace pour
      posX = RECEIVE_X;
      posY = RECEIVE_Y;
    } else if (p <= 0.58) {
      // Moves from furnace area to mold area
      const travelT = easeInOut(phaseProgress(p, 'LADLE_TO_MOLD'));
      posX = lerp(RECEIVE_X, 0.45, travelT);
      posY = lerp(RECEIVE_Y, 3.2, Math.sin(travelT * Math.PI)); // arc movement
    } else if (p <= 0.68) {
      // Above mold pouring
      posX = 0.45;
      posY = 3.2;
    } else if (p <= 0.72) {
      // Exiting scene
      const exitT = (p - 0.68) / 0.04;
      posX = lerp(0.45, 20, easeInOut(exitT));
      posY = 3.2;
    } else {
      posX = 20;
      posY = 3.2;
    }

    // 2. Ladle Filling & Emptying
    if (p < 0.42) {
      fillRatio = 0;
      isVisible = false;
    } else if (p <= 0.50) {
      // Fills smoothly as furnace pours into ladle
      const pourT = phaseProgress(p, 'FURNACE_POUR');
      fillRatio = THREE.MathUtils.clamp(pourT * 1.02, 0.001, 1.0);
      isVisible = true;
    } else if (p < 0.58) {
      // Full during transport
      fillRatio = 1.0;
      isVisible = true;
    } else if (p <= 0.68) {
      // Drains into mold
      const moldPourT = phaseProgress(p, 'LADLE_POUR');
      fillRatio = THREE.MathUtils.clamp(1.0 - moldPourT * 0.95, 0.05, 1.0);
      isVisible = true;
    } else {
      fillRatio = 0;
      isVisible = false;
    }

    // 3. Tilt when pouring into mold (Stage 09: 0.58 -> 0.68)
    if (p >= 0.58 && p <= 0.68) {
      const moldPourT = phaseProgress(p, 'LADLE_POUR');
      if (moldPourT < 0.2) {
        tiltAngle = lerp(0, -0.78, easeInOut(moldPourT / 0.2));
      } else if (moldPourT < 0.85) {
        tiltAngle = -0.78;
      } else {
        tiltAngle = lerp(-0.78, 0, (moldPourT - 0.85) / 0.15);
      }
    }

    if (ladlePivotRef.current) {
      ladlePivotRef.current.position.set(posX, posY, 0);
      ladlePivotRef.current.rotation.z = tiltAngle;
    }

    // 4. Update metal mesh scale and visibility
    if (metalMeshRef.current) {
      metalMeshRef.current.visible = isVisible;
      if (isVisible) {
        metalMeshRef.current.scale.set(1, Math.max(0.001, fillRatio), 1);
      }
    }

    // 5. Shader uniforms
    if (metalShaderMat.current) {
      metalShaderMat.current.uniforms.uTime.value = clock.getElapsedTime();
      metalShaderMat.current.uniforms.uIntensity.value = isVisible ? 1.0 : 0;
    }

    // 6. Glowing core light
    if (ladleLightRef.current) {
      ladleLightRef.current.intensity = isVisible ? fillRatio * 6.0 : 0;
    }

    // 7. Update pour tracking points
    spoutMarkerRef.current?.getWorldPosition(pourPoints.ladleSpout.current);
    fillMarkerRef.current?.getWorldPosition(pourPoints.ladleFill.current);
  });

  return (
    <group ref={ladlePivotRef}>
      {/* Centered ladle body with pivot near spout for pour */}
      <group position={[-0.45, -0.45, 0]}>

        {/* ═══ 1. OUTER STEEL SHELL (Open-ended truncated cone) ═══ */}
        <mesh material={bodyMat}>
          <cylinderGeometry args={[R_TOP, R_BOT, HEIGHT, 36, 1, true]} />
        </mesh>

        {/* ═══ 2. INNER REFRACTORY LINING (BackSide visible inside) ═══ */}
        <mesh material={refractoryMat}>
          <cylinderGeometry
            args={[R_TOP - 0.05, R_BOT - 0.04, HEIGHT - 0.02, 36, 1, true]}
          />
        </mesh>

        {/* ═══ 3. REFRACTORY FLOOR ═══ */}
        <mesh
          position={[0, FLOOR_Y, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={refractoryMat}
        >
          <circleGeometry args={[R_BOT - 0.05, 32]} />
        </mesh>

        {/* ═══ 4. TOP COLLAR & MOUTH RIM ═══ */}
        <mesh position={[0, HEIGHT / 2, 0]} rotation={[Math.PI / 2, 0, 0]} material={rimMat}>
          <torusGeometry args={[R_TOP - 0.01, 0.065, 16, 36]} />
        </mesh>

        {/* ═══ 5. POURING LIP ═══ */}
        <group position={[R_TOP - 0.04, HEIGHT / 2 - 0.04, 0]}>
          <mesh material={rimMat} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.08, 0.16, 0.35, 16]} />
          </mesh>
          <mesh ref={spoutMarkerRef} position={[0.42, -0.18, 0]} visible={debugFlow}>
            <sphereGeometry args={[0.04]} />
            <meshBasicMaterial color="red" />
          </mesh>
        </group>

        {/* Marker at top center of mouth (target for furnace pour stream) */}
        <mesh ref={fillMarkerRef} position={[0, HEIGHT / 2 + 0.05, 0]} visible={debugFlow}>
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
          <torusGeometry args={[R_BOT + 0.04, 0.05, 12, 36]} />
        </mesh>

        {/* ═══ 7. LIQUID METAL MESH (Scales smoothly from bottom) ═══ */}
        <mesh
          ref={metalMeshRef}
          position={[0, FLOOR_Y, 0]}
          geometry={metalGeom}
          material={metalShaderMat.current}
          visible={false}
        />

        {/* ═══ 8. INCANDESCENT CORE POINT LIGHT ═══ */}
        <pointLight
          ref={ladleLightRef}
          position={[0, HEIGHT / 2 + 0.2, 0]}
          color="#ff6600"
          distance={10}
          decay={2}
          intensity={0}
        />
      </group>
    </group>
  );
}
