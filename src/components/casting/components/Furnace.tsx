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
   
   Correções de Sequência & Colisão:
   1. Vaso oco com cavidade refratária profunda e bico orgânico.
   2. Enchimento linear suave (0.27 -> 0.34) até quase a boca.
   3. Basculamento e vazamento na panela (0.34 -> 0.485).
   4. Retorno à posição vertical (0.485 -> 0.505) ANTES de recuar.
   5. Recuo completo para fora da cena (X = 25) entre 0.505 e 0.535,
      evitando qualquer colisão com a panela ou com o molde.
───────────────────────────────────────────────────────────── */

// Dimensions
const SHELL_R_TOP = 1.35;
const SHELL_R_BOT = 1.22;
const CAVITY_R_TOP = 1.12;
const CAVITY_R_BOT = 1.02;
const HEIGHT = 2.70;
const FLOOR_Y = -HEIGHT / 2 + 0.15; // -1.20
const MAX_FILL_H = HEIGHT - 0.40;   // 2.30 (stops right below mouth rim)
const PISTON_AXIS = new THREE.Vector3(0, 1, 0);
const TILT_AXIS = new THREE.Vector3(0, 0, 1);

function alignCylinder(
  group: THREE.Group | null,
  start: THREE.Vector3,
  end: THREE.Vector3,
  direction: THREE.Vector3,
  midpoint: THREE.Vector3
) {
  if (!group) return;

  direction.subVectors(end, start);
  const length = direction.length();
  if (length < 0.001) return;

  midpoint.addVectors(start, end).multiplyScalar(0.5);
  group.position.copy(midpoint);
  group.quaternion.setFromUnitVectors(PISTON_AXIS, direction.normalize());
  group.scale.set(1, length, 1);
}

export default function Furnace({ debugFlow = false }: { debugFlow?: boolean }) {
  const machineRef = useRef<THREE.Group>(null);
  const pivotRef = useRef<THREE.Group>(null);
  const metalMeshRef = useRef<THREE.Mesh>(null);
  const spoutMarkerRef = useRef<THREE.Mesh>(null);
  const furnacePointLightRef = useRef<THREE.PointLight>(null);
  const pistonBarrelRefs = useRef<Array<THREE.Group | null>>([]);
  const pistonRodRefs = useRef<Array<THREE.Group | null>>([]);
  const pourPoints = usePourPoints();

  const pistonKinematics = useMemo(() => ({
    anchors: [
      new THREE.Vector3(-2.12, -2.40, 1.56),
      new THREE.Vector3(-2.12, -2.40, -1.56),
    ],
    // Attachment ears are welded to the tilting shell, so they inherit the
    // furnace rotation while the anchors remain on the floor-mounted base.
    attachmentLocal: [
      new THREE.Vector3(-0.58, -1.48, 1.40),
      new THREE.Vector3(-0.58, -1.48, -1.40),
    ],
    attachment: new THREE.Vector3(),
    barrelEnd: new THREE.Vector3(),
    direction: new THREE.Vector3(),
    midpoint: new THREE.Vector3(),
  }), []);

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
  const { shellMat, rimMat, refractoryMat, floorMat, coilMat, spoutMat, frameMat, pistonMat, rodMat } = useMemo(() => ({
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
      color: '#343b48',
      roughness: 0.34,
      metalness: 0.92,
    }),
    // Painted structural steel for the tilting cradle and trunnions
    frameMat: new THREE.MeshStandardMaterial({
      color: '#10141c',
      roughness: 0.48,
      metalness: 0.82,
    }),
    pistonMat: new THREE.MeshStandardMaterial({
      color: '#27313c',
      roughness: 0.36,
      metalness: 0.92,
    }),
    rodMat: new THREE.MeshStandardMaterial({
      color: '#a8b2bc',
      roughness: 0.18,
      metalness: 1.0,
    }),
  }), []);

  // ── Pre-build Geometry for the Metal Plug (Anchor at base) ───
  const metalGeom = useMemo(() => {
    const geom = new THREE.CylinderGeometry(
      CAVITY_R_TOP - 0.02,
      CAVITY_R_BOT - 0.02,
      MAX_FILL_H,
      36,
      1
    );
    geom.translate(0, MAX_FILL_H / 2, 0);
    return geom;
  }, []);

  // Forward-facing triangular casting lip. Its centreline stays almost level,
  // so the liquid leaves the furnace as a fall instead of following a bent pipe.
  const spoutGeom = useMemo(() => {
    const baseX = CAVITY_R_TOP - 0.04;
    const shape = new THREE.Shape();
    shape.moveTo(baseX, HEIGHT / 2 - 0.08);
    shape.lineTo(baseX, HEIGHT / 2 - 0.42);
    shape.lineTo(CAVITY_R_TOP + 0.92, HEIGHT / 2 - 0.26);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.44,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 2,
    });
    geometry.translate(0, 0, -0.22);
    return geometry;
  }, []);

  // ── Scroll Animation Loop ───────────────────────────────────
  useFrame(({ clock }) => {
    const p = castingState.progress;

    // 1. Entrance & Exit Movement
    // Stage 03-04 (0.15 -> 0.20): Enters to stationary position X = 0.70
    // Stage 04-07 (0.20 -> 0.485): Stays at X = 0.70
    // Post-Pour (0.485 -> 0.505): Un-tilts to vertical
    // Exit (0.505 -> 0.535): Retreats left, away from the receiving ladle.
    let posX = 25;
    if (p < 0.15) {
      posX = 25;
    } else if (p <= 0.20) {
      posX = lerp(25, 0.70, easeOut(phaseProgress(p, 'TRANSITION_FURNACE')));
    } else if (p < 0.485) {
      posX = 0.70;
    } else if (p <= 0.535) {
      // The ladle occupies the right side of the bay, so the furnace leaves
      // through its own (left) service lane instead of cutting through it.
      const exitT = (p - 0.485) / (0.535 - 0.485);
      posX = lerp(0.70, -25, easeInOut(exitT));
    } else {
      posX = -25;
    }

    // 2. Furnace Tilt
    // Tilts forward during FURNACE_TILT (0.34 -> 0.42)
    // Holds tilt during FURNACE_POUR (0.42 -> 0.485)
    // Returns smoothly to vertical upright (0.485 -> 0.505) BEFORE retreating
    let tiltAngle = 0;
    if (p < 0.34) {
      tiltAngle = 0;
    } else if (p <= 0.42) {
      tiltAngle = lerp(0, -0.92, easeInOut(phaseProgress(p, 'FURNACE_TILT')));
    } else if (p < 0.485) {
      tiltAngle = -0.92;
    } else if (p <= 0.505) {
      const returnT = (p - 0.485) / (0.505 - 0.485);
      tiltAngle = lerp(-0.92, 0, easeInOut(returnT));
    } else {
      tiltAngle = 0;
    }

    const isActive = p >= 0.27 && p <= 0.485;
    const vibration = isActive ? Math.sin(clock.getElapsedTime() * 7.0) * 0.009 : 0;
    const activeTilt = tiltAngle + vibration;

    if (machineRef.current) {
      machineRef.current.position.set(posX, 2.2, 0);
    }

    if (pivotRef.current) {
      // Barely perceptible furnace vibration makes the heating stage feel alive
      // without affecting the scroll-controlled choreography.
      pivotRef.current.position.y = vibration * 0.35;
      pivotRef.current.rotation.z = activeTilt;
    }

    // Hydraulic actuators bridge the stationary platform and the rotating
    // shell. The dark barrel extends most of the run while the chrome rod
    // reaches the shell's moving attachment ear.
    for (let index = 0; index < pistonKinematics.anchors.length; index++) {
      const anchor = pistonKinematics.anchors[index];
      pistonKinematics.attachment
        .copy(pistonKinematics.attachmentLocal[index])
        .applyAxisAngle(TILT_AXIS, activeTilt);
      pistonKinematics.barrelEnd.lerpVectors(anchor, pistonKinematics.attachment, 0.64);

      alignCylinder(
        pistonBarrelRefs.current[index],
        anchor,
        pistonKinematics.barrelEnd,
        pistonKinematics.direction,
        pistonKinematics.midpoint
      );
      alignCylinder(
        pistonRodRefs.current[index],
        pistonKinematics.barrelEnd,
        pistonKinematics.attachment,
        pistonKinematics.direction,
        pistonKinematics.midpoint
      );
    }

    // 3. Metal Filling Level (Linear with scroll, zero lag)
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
      heatIntensity = 0.2 + fillRatio * 0.8;
    } else if (p < 0.42) {
      fillRatio = 1.0;
      isVisible = true;
      heatIntensity = 1.0;
    } else if (p <= 0.485) {
      // Drains as metal pours into ladle
      const drainProgress = (p - 0.42) / (0.485 - 0.42);
      fillRatio = lerp(1.0, 0.05, drainProgress);
      isVisible = true;
      heatIntensity = lerp(1.0, 0.5, drainProgress);
    } else {
      fillRatio = 0;
      isVisible = false;
      heatIntensity = 0;
    }

    // Apply scale to metal mesh
    if (metalMeshRef.current) {
      metalMeshRef.current.visible = isVisible;
      if (isVisible) {
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
    <group ref={machineRef}>
      <group ref={pivotRef}>
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

        {/* ═══ 3. TOP COLLAR & MOUTH RIM ═══ */}
        <mesh position={[0, HEIGHT / 2 - 0.05, 0]} material={rimMat}>
          <cylinderGeometry args={[SHELL_R_TOP + 0.08, SHELL_R_TOP, 0.14, 48, 1, true]} />
        </mesh>
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

        {/* ═══ 8. MOVING TRUNNIONS, ACTUATOR EARS & POURING LIP ═══ */}
        <mesh position={[0, -0.15, 1.48]} rotation={[Math.PI / 2, 0, 0]} material={frameMat}>
          <cylinderGeometry args={[0.14, 0.14, 0.28, 16]} />
        </mesh>
        <mesh position={[0, -0.15, -1.48]} rotation={[Math.PI / 2, 0, 0]} material={frameMat}>
          <cylinderGeometry args={[0.14, 0.14, 0.28, 16]} />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side} position={[0.97, -0.28, side * 1.40]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={pistonMat}>
              <cylinderGeometry args={[0.15, 0.15, 0.20, 14]} />
            </mesh>
            <mesh position={[0, 0, side * 0.13]} material={rodMat}>
              <sphereGeometry args={[0.16, 14, 14]} />
            </mesh>
          </group>
        ))}
        <mesh geometry={spoutGeom} material={spoutMat} />
        <mesh position={[CAVITY_R_TOP + 0.92, HEIGHT / 2 - 0.26, 0]} material={rimMat}>
          <boxGeometry args={[0.09, 0.15, 0.48]} />
        </mesh>
        <mesh
          ref={spoutMarkerRef}
          position={[CAVITY_R_TOP + 0.92, HEIGHT / 2 - 0.26, 0]}
          visible={debugFlow}
        >
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="yellow" />
        </mesh>

        {/* ═══ 9. SCROLL-DRIVEN LIQUID METAL MESH ═══ */}
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

      {/* ═══ FLOOR-MOUNTED TILTING STATION (does not rotate) ═══ */}
      <group position={[-SHELL_R_TOP - 0.20, -HEIGHT / 2 + 0.15, 0]}>
        {/* Double steel plinth bolted into the foundry floor */}
        <mesh position={[0, -1.70, 0]} material={frameMat}>
          <boxGeometry args={[3.10, 0.24, 3.75]} />
        </mesh>
        <mesh position={[0, -1.54, 0]} material={pistonMat}>
          <boxGeometry args={[2.90, 0.16, 3.20]} />
        </mesh>

        {/* Two rigid A-frame pedestals retain the furnace at its trunnions */}
        {[-1, 1].map((side) => (
          <group key={side} position={[-0.55, -0.72, side * 1.55]}>
            <mesh position={[0, 0.34, 0]} material={frameMat}>
              <boxGeometry args={[0.28, 1.36, 0.26]} />
            </mesh>
            <mesh position={[-0.34, -0.26, 0]} rotation={[0, 0, -0.24 * side]} material={frameMat}>
              <boxGeometry args={[0.20, 0.92, 0.28]} />
            </mesh>
            <mesh position={[0.10, 0.92, 0]} rotation={[Math.PI / 2, 0, 0]} material={pistonMat}>
              <cylinderGeometry args={[0.23, 0.23, 0.30, 16]} />
            </mesh>
          </group>
        ))}

        {/* Anchor clevises for the hydraulic cylinders */}
        {[-1, 1].map((side) => (
          <group key={`anchor-${side}`} position={[-0.57, -1.20, side * 1.56]}>
            <mesh material={pistonMat}>
              <boxGeometry args={[0.52, 0.32, 0.42]} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={rodMat}>
              <cylinderGeometry args={[0.12, 0.12, 0.56, 14]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Two live hydraulic pistons: fixed barrel + telescoping chrome rod */}
      {[-1, 1].map((side, index) => (
        <group key={`piston-${side}`}>
          <group ref={(element) => { pistonBarrelRefs.current[index] = element; }}>
            <mesh material={pistonMat}>
              <cylinderGeometry args={[0.18, 0.20, 1, 16]} />
            </mesh>
          </group>
          <group ref={(element) => { pistonRodRefs.current[index] = element; }}>
            <mesh material={rodMat}>
              <cylinderGeometry args={[0.075, 0.075, 1, 14]} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}
