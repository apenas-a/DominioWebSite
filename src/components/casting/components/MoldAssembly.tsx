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
function SandSurfaceLines({ y, mat }: { y: number; mat: THREE.Material }) {
  // subtle thin raised lines simulating sand grain strata
  const lines = [-1.2, -0.7, -0.2, 0.2, 0.7, 1.2];
  return (
    <>
      {lines.map((z, i) => (
        <mesh key={i} position={[0, y, z]} material={mat}>
          <boxGeometry args={[3.4, 0.012, 0.018]} />
        </mesh>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN MOLD ASSEMBLY
───────────────────────────────────────────────────────────────── */
export default function MoldAssembly({ debugFlow = false }: { debugFlow?: boolean }) {
  const mainGroupRef = useRef<THREE.Group>(null);
  const copeRef = useRef<THREE.Group>(null);
  const sprueMarkerRef = useRef<THREE.Mesh>(null);
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
      // slight bumpiness via roughness contrast
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

    return { frameMat, sandMat, cavityMat, sandTopMat, runnerMat, sprueMat };
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

    if (mainGroupRef.current) mainGroupRef.current.position.x = moldX;
    if (copeRef.current) copeRef.current.position.y = copeY;
    if (sprueMarkerRef.current) {
      sprueMarkerRef.current.getWorldPosition(pourPoints.moldSprue.current);
    }
  });

  const { frameMat, sandMat, cavityMat, sandTopMat, runnerMat, sprueMat } = mats;

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
      <group position={[0, 0, 0]}>

        {/* Bottom metal frame plate */}
        <mesh material={frameMat} position={[0, -FRAME_T / 2, 0]}>
          <boxGeometry args={[DRAG_W, FRAME_T, DRAG_D]} />
        </mesh>

        {/* Sand body fill */}
        <mesh material={sandMat} position={[0, SAND_H / 2, 0]}>
          <boxGeometry args={[DRAG_W - 0.18, SAND_H, DRAG_D - 0.18]} />
        </mesh>

        {/* Top sand surface — slightly lighter tone */}
        <mesh material={sandTopMat} position={[0, SAND_H + 0.004, 0]}>
          <boxGeometry args={[DRAG_W - 0.18, 0.01, DRAG_D - 0.18]} />
        </mesh>

        {/* Side frame walls */}
        {/* Front wall */}
        <mesh material={frameMat} position={[0, SAND_H / 2, DRAG_D / 2 + 0.04]}>
          <boxGeometry args={[DRAG_W, SAND_H + FRAME_T * 2, 0.1]} />
        </mesh>
        {/* Back wall */}
        <mesh material={frameMat} position={[0, SAND_H / 2, -DRAG_D / 2 - 0.04]}>
          <boxGeometry args={[DRAG_W, SAND_H + FRAME_T * 2, 0.1]} />
        </mesh>
        {/* Left wall */}
        <mesh material={frameMat} position={[-DRAG_W / 2 - 0.04, SAND_H / 2, 0]}>
          <boxGeometry args={[0.1, SAND_H + FRAME_T * 2, DRAG_D + 0.18]} />
        </mesh>
        {/* Right wall */}
        <mesh material={frameMat} position={[DRAG_W / 2 + 0.04, SAND_H / 2, 0]}>
          <boxGeometry args={[0.1, SAND_H + FRAME_T * 2, DRAG_D + 0.18]} />
        </mesh>

        {/* ── GEAR CAVITY — the main impression ── */}
        {/* Cavity base platform (dark sand pad) */}
        <mesh material={cavityMat} position={[0, SAND_H - 0.025, 0]}>
          <cylinderGeometry args={[1.18, 1.18, 0.055, 40]} />
        </mesh>

        {/* Actual extruded gear negative (sits proud of sand by depth) */}
        <primitive
          object={new THREE.Mesh(gearCavityGeom, cavityMat)}
          position={[0, SAND_H - 0.01, 0]}
        />

        {/* Center hole marker — very deep dark circle */}
        <mesh material={cavityMat} position={[0, SAND_H + 0.005, 0]}>
          <cylinderGeometry args={[0.21, 0.21, 0.04, 20]} />
        </mesh>

        {/* ── RUNNERS / CHANNELS ── */}
        {/* Main runner from sprue hole to gear — horizontal */}
        <RunnerChannel
          from={[1.0, SAND_H + 0.0, 0.0]}
          to={[1.15, SAND_H + 0.0, 0.0]}
          width={0.12}
          depth={0.1}
          material={runnerMat}
        />
        {/* Gate channel reaching into gear cavity */}
        <RunnerChannel
          from={[1.0, SAND_H, 0]}
          to={[1.16, SAND_H, 0]}
          width={0.1}
          depth={0.09}
          material={runnerMat}
        />

        {/* Left branch runner */}
        <RunnerChannel
          from={[-1.12, SAND_H, 0]}
          to={[-0.12, SAND_H, 0]}
          width={0.09}
          depth={0.085}
          material={runnerMat}
        />
        {/* Right branch runner (short) */}
        <RunnerChannel
          from={[1.12, SAND_H, 0.55]}
          to={[0.12, SAND_H, 0.55]}
          width={0.075}
          depth={0.08}
          material={runnerMat}
        />
        {/* Diagonal runner — connects lateral risers */}
        <RunnerChannel
          from={[-1.12, SAND_H, 0.0]}
          to={[-1.12, SAND_H, 0.9]}
          width={0.07}
          depth={0.07}
          material={runnerMat}
        />

        {/* ── RISERS (overflow / gas vents) ── */}
        <Riser position={[-1.12, SAND_H + 0.16, 0.9]} mat={cavityMat} frameMat={frameMat} />
        <Riser position={[-1.12, SAND_H + 0.16, -0.9]} mat={cavityMat} frameMat={frameMat} />

        {/* ── SAND SURFACE ETCH LINES (grain texture) ── */}
        <SandSurfaceLines y={SAND_H + 0.007} mat={sandTopMat} />

        {/* ── ALIGNMENT GUIDE PINS ── */}
        <DragCornerPins mat={frameMat} />
      </group>

      {/* ═══════════════════════════════════════════
          COPE (TOP FLASK)  — animated Y position
      ══════════════════════════════════════════════ */}
      <group ref={copeRef} position={[0, 2.8, 0]}>

        {/* Sand body */}
        <mesh material={sandMat} position={[0, COPE_SAND_H / 2, 0]}>
          <boxGeometry args={[DRAG_W - 0.18, COPE_SAND_H, DRAG_D - 0.18]} />
        </mesh>

        {/* Bottom sand surface */}
        <mesh material={sandTopMat} position={[0, -0.005, 0]}>
          <boxGeometry args={[DRAG_W - 0.18, 0.012, DRAG_D - 0.18]} />
        </mesh>

        {/* Side frame walls — cope */}
        <mesh material={frameMat} position={[0, COPE_SAND_H / 2, DRAG_D / 2 + 0.04]}>
          <boxGeometry args={[DRAG_W, COPE_SAND_H + FRAME_T * 2, 0.1]} />
        </mesh>
        <mesh material={frameMat} position={[0, COPE_SAND_H / 2, -DRAG_D / 2 - 0.04]}>
          <boxGeometry args={[DRAG_W, COPE_SAND_H + FRAME_T * 2, 0.1]} />
        </mesh>
        <mesh material={frameMat} position={[-DRAG_W / 2 - 0.04, COPE_SAND_H / 2, 0]}>
          <boxGeometry args={[0.1, COPE_SAND_H + FRAME_T * 2, DRAG_D + 0.18]} />
        </mesh>
        <mesh material={frameMat} position={[DRAG_W / 2 + 0.04, COPE_SAND_H / 2, 0]}>
          <boxGeometry args={[0.1, COPE_SAND_H + FRAME_T * 2, DRAG_D + 0.18]} />
        </mesh>

        {/* Top metal lid plate */}
        <mesh material={frameMat} position={[0, COPE_SAND_H + FRAME_T / 2, 0]}>
          <boxGeometry args={[DRAG_W, FRAME_T, DRAG_D]} />
        </mesh>

        {/* ── SPRUE CUP mounted on top lid ── */}
        <group position={[0, COPE_SAND_H + FRAME_T, 0]}>
          <SprueCup mat={sprueMat} />
        </group>

        {/* Sprue through-hole in cope sand */}
        <mesh material={cavityMat} position={[1.0, COPE_SAND_H / 2, 0]}>
          <cylinderGeometry args={[0.11, 0.11, COPE_SAND_H + 0.02, 14]} />
        </mesh>

        {/* Guide pin holes (receives the drag pins) */}
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

        {/* Surface etch lines on cope underside */}
        <SandSurfaceLines y={0.008} mat={sandTopMat} />

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
