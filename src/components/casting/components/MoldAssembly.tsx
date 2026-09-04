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
import { createGearShape2D } from '@/components/casting/geometry/createGearShape';

/* ─────────────────────────────────────────────────────────────────
   Helper: builds an extruded gear impression (negative cavity)
   It is just the gear shape extruded shallow — dark/deep color
   simulates the carved void in the sand.
───────────────────────────────────────────────────────────────── */
function buildGearCavityGeom(): THREE.BufferGeometry {
  const shape = createGearShape2D({
    teethCount: 16,
    innerRadius: 0.22,
    hubRadius: 0.62,
    outerRadius: 1.05,
    thickness: 0.28,
  });
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: 0.28,
    bevelEnabled: false,
    curveSegments: 16,
  });
  geom.rotateX(Math.PI / 2);
  geom.computeBoundingBox();
  const bb = geom.boundingBox!;
  geom.translate(0, -(bb.max.y + bb.min.y) / 2, 0);
  geom.computeVertexNormals();
  return geom;
}

/* ─────────────────────────────────────────────────────────────────
   Helper: builds a simple runner channel (rectangular bar)
   lying flat on the sand surface
───────────────────────────────────────────────────────────────── */
function RunnerChannel({
  from,
  to,
  width = 0.08,
  depth = 0.1,
  material,
}: {
  from: [number, number, number];
  to: [number, number, number];
  width?: number;
  depth?: number;
  material: THREE.Material;
}) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const cx = (from[0] + to[0]) / 2;
  const cy = (from[1] + to[1]) / 2;
  const cz = (from[2] + to[2]) / 2;
  const angle = Math.atan2(dz, dx);

  return (
    <mesh
      position={[cx, cy, cz]}
      rotation={[0, -angle, 0]}
      material={material}
    >
      <boxGeometry args={[length, depth, width]} />
    </mesh>
  );
}

/* ─────────────────────────────────────────────────────────────────
   DRAG PINS — 4 corner alignment pins on the drag (bottom box)
───────────────────────────────────────────────────────────────── */
function DragCornerPins({ mat }: { mat: THREE.Material }) {
  const positions: [number, number, number][] = [
    [1.75, 0.5, 1.75],
    [-1.75, 0.5, 1.75],
    [1.75, 0.5, -1.75],
    [-1.75, 0.5, -1.75],
  ];
  return (
    <>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos} material={mat}>
          <cylinderGeometry args={[0.055, 0.055, 0.55, 12]} />
        </mesh>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SPRUE CUP — the funnel-shaped pouring cup on the cope top
───────────────────────────────────────────────────────────────── */
function SprueCup({ mat }: { mat: THREE.Material }) {
  return (
    <group position={[1.0, 0.0, 0.0]}>
      {/* Outer cup body (wide top, narrow bottom) */}
      <mesh material={mat} position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.38, 0.22, 0.65, 20]} />
      </mesh>
      {/* Sprue channel going down into the cope */}
      <mesh material={mat} position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.10, 0.10, 0.55, 14]} />
      </mesh>
      {/* Rim ring */}
      <mesh material={mat} position={[0, 0.82, 0]}>
        <torusGeometry args={[0.36, 0.03, 8, 24]} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────
   RISER — cylindrical overflow column embedded in the sand
───────────────────────────────────────────────────────────────── */
function Riser({
  position,
  mat,
  frameMat,
}: {
  position: [number, number, number];
  mat: THREE.Material;
  frameMat: THREE.Material;
}) {
  return (
    <group position={position}>
      {/* Dark cavity */}
      <mesh material={mat}>
        <cylinderGeometry args={[0.16, 0.16, 0.32, 14]} />
      </mesh>
      {/* Thin metal ring */}
      <mesh material={frameMat} position={[0, 0.17, 0]}>
        <torusGeometry args={[0.17, 0.018, 8, 20]} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SAND SURFACE DETAIL — etched lines on the sand giving
   the look of packed/compacted mold surface
───────────────────────────────────────────────────────────────── */
function SandSurfaceLines({
  y,
  mat,
  groupRef,
}: {
  y: number;
  mat: THREE.Material;
  groupRef?: React.Ref<THREE.Group>;
}) {
  // subtle thin raised lines simulating sand grain strata
  const lines = [-1.2, -0.7, -0.2, 0.2, 0.7, 1.2];
  return (
    <group ref={groupRef}>
      {lines.map((z, i) => (
        <mesh key={i} position={[0, y, z]} material={mat}>
          <boxGeometry args={[3.4, 0.012, 0.018]} />
        </mesh>
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN MOLD ASSEMBLY
───────────────────────────────────────────────────────────────── */
export default function MoldAssembly({ debugFlow = false }: { debugFlow?: boolean }) {
  const mainGroupRef = useRef<THREE.Group>(null);
  const dragRef = useRef<THREE.Group>(null);
  const copeRef = useRef<THREE.Group>(null);
  const sprueMarkerRef = useRef<THREE.Mesh>(null);
  const cavityNegativeRef = useRef<THREE.Mesh>(null);
  const cavityPadRef = useRef<THREE.Mesh>(null);
  const cavityGhostRef = useRef<THREE.Mesh>(null);
  const moltenSprueRef = useRef<THREE.Mesh>(null);
  const moltenRunnerRef = useRef<THREE.Mesh>(null);
  const moltenRiser1Ref = useRef<THREE.Mesh>(null);
  const moltenRiser2Ref = useRef<THREE.Mesh>(null);
  const sandLinesDragRef = useRef<THREE.Group>(null);
  const sandLinesCopeRef = useRef<THREE.Group>(null);
  const runnersGroupRef = useRef<THREE.Group>(null);
  const copeHolesGroupRef = useRef<THREE.Group>(null);
  const dragPinsRef = useRef<THREE.Group>(null);
  const pourPoints = usePourPoints();

  /* ── Materials ── */
  const mats = useMemo(() => {
    // Metallic black frame
    const frameMat = new THREE.MeshStandardMaterial({
      color: '#1c1f26',
      roughness: 0.38,
      metalness: 0.92,
    });

    // Casting sand — warm tan/brown
    const sandMat = new THREE.MeshStandardMaterial({
      color: '#6b5540',
      roughness: 0.96,
      metalness: 0.03,
    });

    // Cavity / runner surface — deep dark shadow to show depth
    const cavityMat = new THREE.MeshStandardMaterial({
      color: '#110e0b',
      roughness: 0.99,
      metalness: 0.0,
      side: THREE.FrontSide,
    });

    // Sand highlight (lighter band on top surface)
    const sandTopMat = new THREE.MeshStandardMaterial({
      color: '#7d6550',
      roughness: 0.94,
      metalness: 0.02,
    });

    // Runner channel — slightly darker than sand
    const runnerMat = new THREE.MeshStandardMaterial({
      color: '#0f0c09',
      roughness: 0.99,
      metalness: 0.0,
    });

    // Sprue cup — polished dark iron
    const sprueMat = new THREE.MeshStandardMaterial({
      color: '#111318',
      roughness: 0.3,
      metalness: 0.95,
    });

    // Cope & Drag inspection materials — ALWAYS initialized with transparent: true
    const copeSandMat = new THREE.MeshStandardMaterial({
      color: '#7a5e42',
      roughness: 0.55,
      metalness: 0.1,
      transparent: true,
      opacity: 1.0,
      depthWrite: true,
    });
    const dragSandMat = new THREE.MeshStandardMaterial({
      color: '#7a5e42',
      roughness: 0.55,
      metalness: 0.1,
      transparent: true,
      opacity: 1.0,
      depthWrite: true,
    });
    const copeFrameMat = new THREE.MeshStandardMaterial({
      color: '#1c1f26',
      roughness: 0.38,
      metalness: 0.92,
      transparent: true,
      opacity: 1.0,
      depthWrite: true,
    });
    const dragFrameMat = new THREE.MeshStandardMaterial({
      color: '#1c1f26',
      roughness: 0.38,
      metalness: 0.92,
      transparent: true,
      opacity: 1.0,
      depthWrite: true,
    });
    const sandTopDragMat = new THREE.MeshStandardMaterial({
      color: '#7d6550',
      roughness: 0.94,
      metalness: 0.02,
      transparent: true,
      opacity: 1.0,
      depthWrite: true,
    });
    const sandTopCopeMat = new THREE.MeshStandardMaterial({
      color: '#7d6550',
      roughness: 0.94,
      metalness: 0.02,
      transparent: true,
      opacity: 1.0,
      depthWrite: true,
    });

    // Luminous ghost wireframe of the cavity visible during X-ray inspection
    const cavityGhostMat = new THREE.MeshBasicMaterial({
      color: '#ff7700',
      wireframe: true,
      transparent: true,
      opacity: 0.40,
      depthWrite: false,
    });

    // Incandescent Molten Runner / Sprue Material
    const moltenRunnerMat = new THREE.MeshStandardMaterial({
      color: '#ff6600',
      emissive: '#ff4400',
      emissiveIntensity: 4.0,
      roughness: 0.2,
      metalness: 0.8,
    });

    return {
      frameMat,
      sandMat,
      cavityMat,
      sandTopMat,
      runnerMat,
      sprueMat,
      copeSandMat,
      copeFrameMat,
      dragSandMat,
      dragFrameMat,
      sandTopDragMat,
      sandTopCopeMat,
      cavityGhostMat,
      moltenRunnerMat,
    };
  }, []);

  /* ── Gear cavity geometry (reused for both molds) ── */
  const gearCavityGeom = useMemo(() => buildGearCavityGeom(), []);

  /* ── Frame animation ── */
  useFrame(() => {
    const p = castingState.progress;
    let copeY = 0.7;
    let moldX = 0;

    // Phase 01: Mold Open — cope floats high above
    if (p <= 0.08) {
      copeY = 2.8;
    }
    // Phase 02: Mold Close — cope descends
    else if (p <= 0.15) {
      copeY = lerp(2.8, 0.76, easeInOut(phaseProgress(p, 'MOLD_CLOSE')));
    }
    // Phase 03: Transition to furnace — slide left
    else if (p < 0.82) {
      copeY = 0.76;
    }
    // Phase 12: Mold Open Reveal
    else if (p <= 0.89) {
      copeY = lerp(0.76, 2.8, easeOut(phaseProgress(p, 'MOLD_OPEN_REVEAL')));
    } else {
      copeY = 2.8;
    }

    if (p <= 0.15) moldX = 0;
    else if (p <= 0.20) moldX = lerp(0, -20, easeInOut(phaseProgress(p, 'TRANSITION_FURNACE')));
    else if (p < 0.50) moldX = -20;
    else if (p <= 0.55) moldX = lerp(-20, 0, easeOut(Math.min(1, (p - 0.50) / 0.05)));
    else moldX = 0;

    // Semi-transparent X-Ray inspection mode during pouring, filling & cooling (0.575 -> 0.82)
    const isCastingActive = p >= 0.575 && p <= 0.82;
    let inspectAlpha = 1.0;
    if (isCastingActive) {
      if (p < 0.595) {
        inspectAlpha = lerp(1.0, 0.12, (p - 0.575) / 0.02);
      } else if (p > 0.80) {
        inspectAlpha = lerp(0.12, 1.0, (p - 0.80) / 0.02);
      } else {
        inspectAlpha = 0.12;
      }
    }
    const isTransparent = inspectAlpha < 0.99;

    // Cope & Drag sand materials
    mats.copeSandMat.opacity = inspectAlpha;
    mats.copeSandMat.depthWrite = !isTransparent;

    mats.dragSandMat.opacity = inspectAlpha;
    mats.dragSandMat.depthWrite = !isTransparent;

    mats.sandTopCopeMat.opacity = isTransparent ? 0.0 : 1.0;
    mats.sandTopCopeMat.depthWrite = !isTransparent;

    mats.sandTopDragMat.opacity = isTransparent ? 0.0 : 1.0;
    mats.sandTopDragMat.depthWrite = !isTransparent;

    // Outer metal frame walls
    const frameAlpha = isTransparent ? 0.20 : 1.0;
    mats.copeFrameMat.opacity = frameAlpha;
    mats.copeFrameMat.depthWrite = !isTransparent;

    mats.dragFrameMat.opacity = frameAlpha;
    mats.dragFrameMat.depthWrite = !isTransparent;

    // Cavity ghost wireframe
    mats.cavityGhostMat.visible = isTransparent;

    // Toggle internal meshes so they do not occlude the filling piece
    if (cavityNegativeRef.current) {
      cavityNegativeRef.current.visible = !isCastingActive && (p < 0.585 || p >= 0.94);
    }
    if (cavityPadRef.current) {
      cavityPadRef.current.visible = !isCastingActive && (p < 0.585 || p >= 0.94);
    }
    if (sandLinesDragRef.current) {
      sandLinesDragRef.current.visible = !isCastingActive;
    }
    if (sandLinesCopeRef.current) {
      sandLinesCopeRef.current.visible = !isCastingActive;
    }
    if (runnersGroupRef.current) {
      runnersGroupRef.current.visible = !isCastingActive;
    }
    if (copeHolesGroupRef.current) {
      copeHolesGroupRef.current.visible = !isCastingActive;
    }
    if (dragPinsRef.current) {
      dragPinsRef.current.visible = !isCastingActive;
    }

    // Incandescent sprue feed column inside cope
    if (moltenSprueRef.current) {
      moltenSprueRef.current.visible = isCastingActive && p >= 0.59 && p <= 0.75;
    }
    // Incandescent runner channel connecting sprue to gear
    if (moltenRunnerRef.current) {
      moltenRunnerRef.current.visible = isCastingActive && p >= 0.59 && p <= 0.82;
    }
    // Molten metal in risers when filled
    if (moltenRiser1Ref.current) {
      moltenRiser1Ref.current.visible = isCastingActive && p >= 0.67 && p <= 0.82;
    }
    if (moltenRiser2Ref.current) {
      moltenRiser2Ref.current.visible = isCastingActive && p >= 0.67 && p <= 0.82;
    }

    // Molten runner emission & cooling color
    if (p >= 0.585 && p <= 0.75) {
      mats.moltenRunnerMat.emissiveIntensity = 4.0;
      mats.moltenRunnerMat.color.setRGB(1.0, 0.4, 0.0);
    } else if (p > 0.75 && p <= 0.82) {
      const coolT = (p - 0.75) / 0.07;
      mats.moltenRunnerMat.emissiveIntensity = lerp(4.0, 0.0, coolT);
      mats.moltenRunnerMat.color.setRGB(lerp(1.0, 0.18, coolT), lerp(0.4, 0.2, coolT), lerp(0.0, 0.24, coolT));
    } else {
      mats.moltenRunnerMat.emissiveIntensity = 0;
    }

    if (mainGroupRef.current) mainGroupRef.current.position.x = moldX;
    if (copeRef.current) copeRef.current.position.y = copeY;
    if (sprueMarkerRef.current) {
      sprueMarkerRef.current.getWorldPosition(pourPoints.moldSprue.current);
    }
  });

  const {
    frameMat,
    sandMat,
    cavityMat,
    sandTopMat,
    runnerMat,
    sprueMat,
    copeSandMat,
    copeFrameMat,
    dragSandMat,
    dragFrameMat,
    sandTopDragMat,
    sandTopCopeMat,
    cavityGhostMat,
    moltenRunnerMat,
  } = mats;

  /* ─────────────────────────────────────────────────────────────
     DRAG (bottom flask): frame + sand body + gear cavity + runners
  ───────────────────────────────────────────────────────────── */
  const DRAG_W = 4.2;
  const DRAG_D = 4.2;
  const SAND_H = 0.72;
  const FRAME_T = 0.14;

  /* ─────────────────────────────────────────────────────────────
     COPE (top flask): frame + sand body + sprue hole
  ───────────────────────────────────────────────────────────── */
  const COPE_SAND_H = 0.65;

  return (
    <group ref={mainGroupRef}>

      {/* ═══════════════════════════════════════════
          DRAG (BOTTOM FLASK)
      ══════════════════════════════════════════════ */}
      <group ref={dragRef} position={[0, 0, 0]}>

        {/* Bottom metal frame plate */}
        <mesh material={dragFrameMat} position={[0, -FRAME_T / 2, 0]} renderOrder={20}>
          <boxGeometry args={[DRAG_W, FRAME_T, DRAG_D]} />
        </mesh>

        {/* Sand body fill */}
        <mesh material={dragSandMat} position={[0, SAND_H / 2, 0]} renderOrder={20}>
          <boxGeometry args={[DRAG_W - 0.18, SAND_H, DRAG_D - 0.18]} />
        </mesh>

        {/* Top sand surface */}
        <mesh material={sandTopDragMat} position={[0, SAND_H + 0.004, 0]} renderOrder={20}>
          <boxGeometry args={[DRAG_W - 0.18, 0.01, DRAG_D - 0.18]} />
        </mesh>

        {/* Side frame walls */}
        <mesh material={dragFrameMat} position={[0, SAND_H / 2, DRAG_D / 2 + 0.04]} renderOrder={20}>
          <boxGeometry args={[DRAG_W, SAND_H + FRAME_T * 2, 0.1]} />
        </mesh>
        <mesh material={dragFrameMat} position={[0, SAND_H / 2, -DRAG_D / 2 - 0.04]} renderOrder={20}>
          <boxGeometry args={[DRAG_W, SAND_H + FRAME_T * 2, 0.1]} />
        </mesh>
        <mesh material={dragFrameMat} position={[-DRAG_W / 2 - 0.04, SAND_H / 2, 0]} renderOrder={20}>
          <boxGeometry args={[0.1, SAND_H + FRAME_T * 2, DRAG_D + 0.18]} />
        </mesh>
        <mesh material={dragFrameMat} position={[DRAG_W / 2 + 0.04, SAND_H / 2, 0]} renderOrder={20}>
          <boxGeometry args={[0.1, SAND_H + FRAME_T * 2, DRAG_D + 0.18]} />
        </mesh>

        {/* ── GEAR CAVITY — the main impression ── */}
        {/* Cavity base platform (dark sand pad) */}
        <mesh ref={cavityPadRef} material={cavityMat} position={[0, SAND_H - 0.025, 0]}>
          <cylinderGeometry args={[1.18, 1.18, 0.055, 40]} />
        </mesh>

        {/* Actual extruded gear negative (sits proud of sand by depth) */}
        <mesh
          ref={cavityNegativeRef}
          geometry={gearCavityGeom}
          material={cavityMat}
          position={[0, SAND_H - 0.01, 0]}
        />

        {/* Cavity ghost wireframe visible during X-Ray inspection */}
        <mesh
          ref={cavityGhostRef}
          geometry={gearCavityGeom}
          material={cavityGhostMat}
          position={[0, SAND_H - 0.01, 0]}
          renderOrder={15}
        />

        {/* Center hole marker */}
        <mesh material={cavityMat} position={[0, SAND_H + 0.005, 0]}>
          <cylinderGeometry args={[0.21, 0.21, 0.04, 20]} />
        </mesh>

        {/* ── RUNNERS / CHANNELS ── */}
        <group ref={runnersGroupRef}>
          <RunnerChannel
            from={[1.0, SAND_H + 0.0, 0.0]}
            to={[1.15, SAND_H + 0.0, 0.0]}
            width={0.12}
            depth={0.1}
            material={runnerMat}
          />
          <RunnerChannel
            from={[1.0, SAND_H, 0]}
            to={[1.16, SAND_H, 0]}
            width={0.1}
            depth={0.09}
            material={runnerMat}
          />
          <RunnerChannel
            from={[-1.12, SAND_H, 0]}
            to={[-0.12, SAND_H, 0]}
            width={0.09}
            depth={0.085}
            material={runnerMat}
          />
          <RunnerChannel
            from={[1.12, SAND_H, 0.55]}
            to={[0.12, SAND_H, 0.55]}
            width={0.075}
            depth={0.08}
            material={runnerMat}
          />
          <RunnerChannel
            from={[-1.12, SAND_H, 0.0]}
            to={[-1.12, SAND_H, 0.9]}
            width={0.07}
            depth={0.07}
            material={runnerMat}
          />
          <Riser position={[-1.12, SAND_H + 0.16, 0.9]} mat={cavityMat} frameMat={frameMat} />
          <Riser position={[-1.12, SAND_H + 0.16, -0.9]} mat={cavityMat} frameMat={frameMat} />
        </group>

        {/* Incandescent Molten Runner Feed connecting sprue to gear cavity */}
        <mesh
          ref={moltenRunnerRef}
          position={[0.55, SAND_H + 0.012, 0]}
          material={moltenRunnerMat}
          renderOrder={10}
        >
          <boxGeometry args={[0.92, 0.028, 0.10]} />
        </mesh>

        {/* ── SAND SURFACE ETCH LINES (grain texture) ── */}
        <SandSurfaceLines y={SAND_H + 0.007} mat={sandTopMat} groupRef={sandLinesDragRef} />

        {/* ── ALIGNMENT GUIDE PINS ── */}
        <group ref={dragPinsRef}>
          <DragCornerPins mat={frameMat} />
        </group>
      </group>

      {/* ═══════════════════════════════════════════
          COPE (TOP FLASK)  — animated Y position
      ══════════════════════════════════════════════ */}
      <group ref={copeRef} position={[0, 2.8, 0]}>

        {/* Sand body (uses copeSandMat for X-Ray inspection transparency) */}
        <mesh material={copeSandMat} position={[0, COPE_SAND_H / 2, 0]} renderOrder={20}>
          <boxGeometry args={[DRAG_W - 0.18, COPE_SAND_H, DRAG_D - 0.18]} />
        </mesh>

        {/* Bottom sand surface */}
        <mesh material={sandTopCopeMat} position={[0, -0.005, 0]} renderOrder={20}>
          <boxGeometry args={[DRAG_W - 0.18, 0.012, DRAG_D - 0.18]} />
        </mesh>

        {/* Side frame walls — cope (uses copeFrameMat) */}
        <mesh material={copeFrameMat} position={[0, COPE_SAND_H / 2, DRAG_D / 2 + 0.04]} renderOrder={20}>
          <boxGeometry args={[DRAG_W, COPE_SAND_H + FRAME_T * 2, 0.1]} />
        </mesh>
        <mesh material={copeFrameMat} position={[0, COPE_SAND_H / 2, -DRAG_D / 2 - 0.04]} renderOrder={20}>
          <boxGeometry args={[DRAG_W, COPE_SAND_H + FRAME_T * 2, 0.1]} />
        </mesh>
        <mesh material={copeFrameMat} position={[-DRAG_W / 2 - 0.04, COPE_SAND_H / 2, 0]} renderOrder={20}>
          <boxGeometry args={[0.1, COPE_SAND_H + FRAME_T * 2, DRAG_D + 0.18]} />
        </mesh>
        <mesh material={copeFrameMat} position={[DRAG_W / 2 + 0.04, COPE_SAND_H / 2, 0]} renderOrder={20}>
          <boxGeometry args={[0.1, COPE_SAND_H + FRAME_T * 2, DRAG_D + 0.18]} />
        </mesh>

        {/* Top metal lid plate */}
        <mesh material={copeFrameMat} position={[0, COPE_SAND_H + FRAME_T / 2, 0]} renderOrder={20}>
          <boxGeometry args={[DRAG_W, FRAME_T, DRAG_D]} />
        </mesh>

        {/* ── SPRUE CUP mounted on top lid ── */}
        <group position={[0, COPE_SAND_H + FRAME_T, 0]}>
          <SprueCup mat={sprueMat} />
        </group>

        {/* ── TOP RISER RELIEF VENTS ON TOP LID ── */}
        <group position={[-1.12, COPE_SAND_H + FRAME_T, 0.9]}>
          <mesh material={copeFrameMat} position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.16, 0.18, 0.16, 16]} />
          </mesh>
          <mesh material={cavityMat} position={[0, 0.165, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.13, 16]} />
          </mesh>
          <mesh material={sprueMat} position={[0, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.15, 0.02, 8, 20]} />
          </mesh>
        </group>

        <group position={[-1.12, COPE_SAND_H + FRAME_T, -0.9]}>
          <mesh material={copeFrameMat} position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.16, 0.18, 0.16, 16]} />
          </mesh>
          <mesh material={cavityMat} position={[0, 0.165, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.13, 16]} />
          </mesh>
          <mesh material={sprueMat} position={[0, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.15, 0.02, 8, 20]} />
          </mesh>
        </group>

        {/* Cope internal holes (hidden during X-Ray inspection) */}
        <group ref={copeHolesGroupRef}>
          {/* Riser through-holes in cope sand */}
          <mesh material={cavityMat} position={[-1.12, COPE_SAND_H / 2, 0.9]}>
            <cylinderGeometry args={[0.14, 0.14, COPE_SAND_H + 0.02, 14]} />
          </mesh>
          <mesh material={cavityMat} position={[-1.12, COPE_SAND_H / 2, -0.9]}>
            <cylinderGeometry args={[0.14, 0.14, COPE_SAND_H + 0.02, 14]} />
          </mesh>
          {/* Sprue through-hole in cope sand */}
          <mesh material={cavityMat} position={[1.0, COPE_SAND_H / 2, 0]}>
            <cylinderGeometry args={[0.11, 0.11, COPE_SAND_H + 0.02, 14]} />
          </mesh>
          {/* Guide pin holes */}
          {[
            [1.75, COPE_SAND_H / 2, 1.75],
            [-1.75, COPE_SAND_H / 2, 1.75],
            [1.75, COPE_SAND_H / 2, -1.75],
            [-1.75, COPE_SAND_H / 2, -1.75],
          ].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]} material={cavityMat}>
              <cylinderGeometry args={[0.065, 0.065, COPE_SAND_H + 0.04, 10]} />
            </mesh>
          ))}
        </group>

        {/* Incandescent rising metal inside top risers */}
        <mesh
          ref={moltenRiser1Ref}
          position={[-1.12, COPE_SAND_H * 0.45, 0.9]}
          material={moltenRunnerMat}
          renderOrder={10}
        >
          <cylinderGeometry args={[0.10, 0.10, COPE_SAND_H * 0.9, 14]} />
        </mesh>
        <mesh
          ref={moltenRiser2Ref}
          position={[-1.12, COPE_SAND_H * 0.45, -0.9]}
          material={moltenRunnerMat}
          renderOrder={10}
        >
          <cylinderGeometry args={[0.10, 0.10, COPE_SAND_H * 0.9, 14]} />
        </mesh>

        {/* Incandescent sprue feed column inside cope during pouring */}
        <mesh
          ref={moltenSprueRef}
          position={[1.0, COPE_SAND_H / 2, 0]}
          material={moltenRunnerMat}
          renderOrder={10}
        >
          <cylinderGeometry args={[0.075, 0.065, COPE_SAND_H, 16]} />
        </mesh>

        {/* Surface etch lines on cope underside */}
        <SandSurfaceLines y={0.008} mat={sandTopMat} groupRef={sandLinesCopeRef} />

        {/* Invisible marker for sprue world position */}
        <mesh
          ref={sprueMarkerRef}
          position={[1.0, COPE_SAND_H + FRAME_T + 0.82, 0]}
          visible={debugFlow}
        >
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="red" />
        </mesh>
      </group>
    </group>
  );
}
