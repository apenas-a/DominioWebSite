import { useRef, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SPECTROMAXxR3FProps {
  sectionRef: React.RefObject<HTMLElement>;
  onProgressUpdate?: (progress: number) => void;
}

/**
 * CameraRig Component: Orchestrates camera position and lookAt via GSAP ScrollTrigger
 */
function CameraRig({
  sectionRef,
  onProgressUpdate,
}: {
  sectionRef: React.RefObject<HTMLElement>;
  onProgressUpdate?: (progress: number) => void;
}) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(4.5, 3.2, 5.0));
  const targetLookAt = useRef(new THREE.Vector3(0, 1.2, 0));

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          onUpdate: (self) => {
            if (onProgressUpdate) onProgressUpdate(self.progress);
          },
        },
      });

      // Scroll 0% -> 30%: Overview [4.5, 3.2, 5.0] -> lookAt [0, 1.2, 0]
      // Scroll 30% -> 70%: Cinematic Zoom to spark chamber [1.2, 1.6, 2.1] -> lookAt [0.4, 1.3, 0.2]
      tl.to(
        targetPos.current,
        {
          x: 1.2,
          y: 1.6,
          z: 2.1,
          ease: "power2.inOut",
        },
        0.3
      ).to(
        targetLookAt.current,
        {
          x: 0.4,
          y: 1.3,
          z: 0.2,
          ease: "power2.inOut",
        },
        0.3
      );
    }, el);

    return () => ctx.revert();
  }, [sectionRef, onProgressUpdate]);

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.1);
    camera.lookAt(targetLookAt.current);
  });

  return null;
}

/**
 * Dynamic Canvas 2D Live Telemetry Screen
 */
function TelemetryScreen({ sparkActive }: { sparkActive: boolean }) {
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  const { canvas, ctx } = useMemo(() => {
    const cvs = document.createElement("canvas");
    cvs.width = 512;
    cvs.height = 320;
    const c = cvs.getContext("2d")!;
    return { canvas: cvs, ctx: c };
  }, []);

  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    textureRef.current = tex;
    return tex;
  }, [canvas]);

  useFrame(({ clock }) => {
    if (!ctx) return;
    const time = clock.getElapsedTime();

    // Dark software background
    ctx.fillStyle = "#0a0f18";
    ctx.fillRect(0, 0, 512, 320);

    // Top Header Bar
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, 512, 36);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 13px monospace";
    ctx.fillText("SPECTROMAXx — TELEMETRIA ESPECTRAL NBR ISO/IEC 17025", 14, 23);

    ctx.fillStyle = sparkActive ? "#22c55e" : "#94a3b8";
    ctx.font = "bold 11px monospace";
    ctx.fillText(sparkActive ? "QUEIMA: ATIVA (PULSO 8.0 kW)" : "STANDBY (REPOUSO)", 310, 23);

    // Dotted Grid
    ctx.strokeStyle = "rgba(51, 65, 85, 0.5)";
    ctx.lineWidth = 1;
    for (let x = 40; x < 360; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 45);
      ctx.lineTo(x, 270);
      ctx.stroke();
    }
    for (let y = 60; y < 270; y += 35) {
      ctx.beginPath();
      ctx.moveTo(35, y);
      ctx.lineTo(360, y);
      ctx.stroke();
    }

    // Spectrum Peak Lines (C, Si, Mn, P, S)
    ctx.strokeStyle = "#00d4ff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const basePeaks = [
      { x: 50, h: 30, label: "Fe" },
      { x: 80, h: sparkActive ? 150 : 40, label: "Fe" },
      { x: 110, h: 45, label: "" },
      { x: 140, h: sparkActive ? 195 : 35, label: "C" },
      { x: 170, h: 60, label: "" },
      { x: 200, h: sparkActive ? 165 : 30, label: "Si" },
      { x: 230, h: 50, label: "" },
      { x: 260, h: sparkActive ? 135 : 25, label: "Mn" },
      { x: 290, h: sparkActive ? 90 : 20, label: "P" },
      { x: 320, h: sparkActive ? 115 : 20, label: "S" },
      { x: 350, h: 30, label: "" },
    ];

    ctx.moveTo(35, 260);

    basePeaks.forEach((p, idx) => {
      const osc = sparkActive ? Math.sin(time * 15 + idx * 2) * 16 : Math.sin(time * 2 + idx) * 2;
      const peakY = 260 - Math.max(10, p.h + osc);
      ctx.lineTo(p.x, peakY);
    });

    ctx.lineTo(360, 260);
    ctx.stroke();

    // Area Fill
    const grad = ctx.createLinearGradient(0, 60, 0, 260);
    grad.addColorStop(0, sparkActive ? "rgba(0, 212, 255, 0.4)" : "rgba(56, 189, 248, 0.1)");
    grad.addColorStop(1, "rgba(0, 212, 255, 0.0)");
    ctx.fillStyle = grad;
    ctx.fill();

    // Labels
    basePeaks.forEach((p) => {
      if (p.label) {
        ctx.fillStyle = "#ffaa00";
        ctx.font = "bold 10px monospace";
        ctx.fillText(p.label, p.x - 6, 275);
      }
    });

    // Right Panel - Chemical Analysis
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(370, 45, 132, 260);
    ctx.strokeStyle = "#334155";
    ctx.strokeRect(370, 45, 132, 260);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 11px monospace";
    ctx.fillText("COMPOSIÇÃO %", 380, 65);

    const elements = [
      { name: "Fe", val: sparkActive ? "93.85%" : "---" },
      { name: "C", val: sparkActive ? " 3.42%" : "---" },
      { name: "Si", val: sparkActive ? " 2.15%" : "---" },
      { name: "Mn", val: sparkActive ? " 0.45%" : "---" },
      { name: "P", val: sparkActive ? " 0.02%" : "---" },
      { name: "S", val: sparkActive ? " 0.01%" : "---" },
    ];

    elements.forEach((el, i) => {
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "11px monospace";
      ctx.fillText(`${el.name}: ${el.val}`, 380, 92 + i * 22);
    });

    ctx.fillStyle = sparkActive ? "#22c55e" : "#475569";
    ctx.fillRect(380, 245, 112, 28);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 11px monospace";
    ctx.fillText(sparkActive ? "✓ CONFORME" : "AGUARDANDO", 390, 263);

    texture.needsUpdate = true;
  });

  return (
    <mesh position={[0, 0.92, 0.042]}>
      <planeGeometry args={[1.6, 1.08]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

/**
 * Instanced Spark Particles System
 */
function SparkParticles({ sparkActive }: { sparkActive: boolean }) {
  const count = 60;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 2.5;
      temp.push({
        x: 0,
        y: 0,
        z: 0,
        vx: Math.cos(angle) * speed * 0.6,
        vy: 1.0 + Math.random() * 2.5,
        vz: Math.sin(angle) * speed * 0.6,
        scale: 0.03 + Math.random() * 0.05,
        life: Math.random(),
      });
    }
    return temp;
  }, [count]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    particles.forEach((p, i) => {
      if (sparkActive) {
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.z += p.vz * delta;
        p.vy -= 9.8 * delta * 0.3; // gravity
        p.life -= delta * 2.5;

        if (p.life <= 0 || p.y < 0) {
          p.x = 0;
          p.y = 0;
          p.z = 0;
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.8 + Math.random() * 2.5;
          p.vx = Math.cos(angle) * speed * 0.6;
          p.vy = 1.0 + Math.random() * 2.5;
          p.vz = Math.sin(angle) * speed * 0.6;
          p.life = 1.0;
        }
      } else {
        p.scale = 0;
      }

      dummy.position.set(0.15 + p.x, 1.92 + p.y, 0.85 + p.z);
      const currentScale = sparkActive ? p.scale * p.life : 0;
      dummy.scale.set(currentScale, currentScale, currentScale);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshBasicMaterial color="#00d4ff" />
    </instancedMesh>
  );
}

/**
 * SPECTROMAXx 3D Laboratory Scene Components
 */
function SpectrometerLabScene({ scrollProgress }: { scrollProgress: number }) {
  const sparkActive = scrollProgress >= 0.65;
  const sparkLightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (sparkLightRef.current) {
      if (sparkActive) {
        const pulse = 2.0 + Math.sin(clock.getElapsedTime() * 30.0) * 3.0 + Math.random() * 3.0;
        sparkLightRef.current.intensity = pulse;
      } else {
        sparkLightRef.current.intensity = 0;
      }
    }
  });

  return (
    <group position={[0, -0.9, 0]}>
      {/* ===== 1. BANCADA LABORATORIAL ===== */}
      {/* Epoxy Resin Dark Gray Top Surface */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[6.4, 0.22, 3.6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.25} metalness={0.15} />
      </mesh>

      {/* Structural Lower Cabinet with Bevelled Panels */}
      <mesh position={[0, 0.0, 0]}>
        <boxGeometry args={[6.3, 1.8, 3.4]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Rubber Feet at Corners */}
      {[-3.0, 3.0].map((x) =>
        [-1.5, 1.5].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -0.95, z]}>
            <cylinderGeometry args={[0.12, 0.14, 0.1, 16]} />
            <meshStandardMaterial color="#020617" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* ===== 2. ESPECTRÔMETRO SPECTROMAXx ===== */}
      <group position={[1.1, 1.11, 0.1]}>
        {/* Lower Chassis: Industrial Graphite */}
        <mesh position={[0, 0.34, 0]}>
          <boxGeometry args={[2.9, 0.68, 2.4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
        </mesh>

        {/* Upper Chassis: Brushed Aluminum */}
        <mesh position={[0, 1.07, 0]}>
          <boxGeometry args={[2.9, 0.78, 2.4]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.25} metalness={0.85} />
        </mesh>

        {/* Front-Left Spark Chamber Cutout */}
        <mesh position={[-0.95, 0.82, 0.75]}>
          <boxGeometry args={[0.85, 0.68, 0.85]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>

        {/* Specimen Stage & Machined Metal Disc */}
        <mesh position={[-0.95, 0.58, 0.75]}>
          <cylinderGeometry args={[0.24, 0.24, 0.2, 24]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.3} />
        </mesh>

        <mesh position={[-0.95, 0.71, 0.75]}>
          <cylinderGeometry args={[0.15, 0.15, 0.06, 24]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.2} />
        </mesh>

        {/* Clamping Support Arm & Copper Electrode Probe Pin */}
        <mesh position={[-0.95, 0.98, 0.75]}>
          <cylinderGeometry args={[0.035, 0.012, 0.3, 16]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Stroboscopic Electric Blue Spark Beam Mesh */}
        <mesh position={[-0.95, 0.82, 0.75]}>
          <cylinderGeometry args={[0.02, 0.045, 0.22, 12]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00d4ff"
            emissiveIntensity={sparkActive ? 6.0 : 0}
            roughness={0.1}
          />
        </mesh>

        {/* Dynamic Blue-Cyan PointLight bound to Electrode */}
        <pointLight
          ref={sparkLightRef}
          color="#00d4ff"
          position={[-0.95, 0.82, 0.75]}
          distance={6.0}
        />
      </group>

      {/* Instanced Spark Particles System */}
      <SparkParticles sparkActive={sparkActive} />

      {/* ===== 3. TERMINAL DE TELEMETRIA ===== */}
      <group position={[-1.6, 1.11, 0.1]}>
        {/* Stand Base & Articulated Stem */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.04, 20]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.8} />
        </mesh>

        <mesh position={[0, 0.31, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.58, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
        </mesh>

        {/* Widescreen Monitor Frame */}
        <mesh position={[0, 0.92, 0]}>
          <boxGeometry args={[1.7, 1.18, 0.08]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.8} />
        </mesh>

        {/* Dynamic 2D Telemetry Canvas Texture Screen */}
        <TelemetryScreen sparkActive={sparkActive} />

        {/* Technical Keyboard & Mouse */}
        <mesh position={[0, 0.025, 0.9]}>
          <boxGeometry args={[1.35, 0.03, 0.48]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.4} />
        </mesh>

        <mesh position={[0.95, 0.025, 0.9]}>
          <cylinderGeometry args={[0.07, 0.08, 0.04, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.5} />
        </mesh>
      </group>

      {/* Industrial Grid Floor */}
      <gridHelper args={[40, 30, 0x00d4ff, 0x1e293b]} position={[0, -0.9, 0]} />
    </group>
  );
}

/**
 * Post-Processing Effects Component
 */
function PostEffects() {
  return (
    <EffectComposer disableNormalPass>
      <Bloom
        luminanceThreshold={0.85}
        mipmapBlur
        intensity={1.5}
        radius={0.4}
      />
      <ChromaticAberration offset={new THREE.Vector2(0.0008, 0.0008)} />
      <Vignette es={false} offset={0.3} darkness={0.65} />
    </EffectComposer>
  );
}

/**
 * Main R3F SPECTROMAXx Lab Component
 */
export default function SPECTROMAXxR3F({
  sectionRef,
  onProgressUpdate,
}: SPECTROMAXxR3FProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleProgress = (p: number) => {
    setScrollProgress(p);
    if (onProgressUpdate) onProgressUpdate(p);
  };

  return (
    <div className="w-full h-full min-h-[450px] sm:min-h-[550px] rounded-2xl overflow-hidden relative border border-white/10 glass-dark shadow-2xl">
      <Canvas
        gl={{
          antialias: !isMobileDevice(),
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        {/* Reduced Ambient & Overhead Soft Directional Light */}
        <color attach="background" args={["#0a0f18"]} />
        <ambientLight color="#0a0f18" intensity={0.4} />
        <directionalLight position={[5, 12, 8]} color="#ffffff" intensity={1.2} />
        <directionalLight position={[-8, 6, -5]} color="#38bdf8" intensity={0.6} />

        {/* Camera Rig driven by ScrollTrigger */}
        <CameraRig sectionRef={sectionRef} onProgressUpdate={handleProgress} />

        {/* 3D Lab Scene */}
        <SpectrometerLabScene scrollProgress={scrollProgress} />

        {/* Post-processing */}
        <PostEffects />
      </Canvas>
    </div>
  );
}
