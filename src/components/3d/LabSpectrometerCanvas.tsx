import { useRef, useEffect } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isMobileDevice } from "@/hooks/useThreeScene";

gsap.registerPlugin(ScrollTrigger);

interface LabSpectrometerCanvasProps {
  sectionRef: React.RefObject<HTMLElement>;
  onProgressUpdate?: (progress: number) => void;
}

/**
 * High-Resolution SPECTROMAXx 3D Lab Station Model (Pure WebGL)
 */
function createHighResSpectrometerLab() {
  const labGroup = new THREE.Group();

  // ----- 1. BANCADA LABORATORIAL -----
  const benchGroup = new THREE.Group();
  labGroup.add(benchGroup);

  // Epoxy Resin Dark Gray Top Surface (roughness: 0.25, metalness: 0.15)
  const benchTop = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 0.22, 3.6),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25, metalness: 0.15 })
  );
  benchTop.position.y = 1.0;
  benchGroup.add(benchTop);

  // Structural Lower Cabinet with Bevelled Panels
  const cabinetBase = new THREE.Mesh(
    new THREE.BoxGeometry(6.3, 1.8, 3.4),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.2 })
  );
  cabinetBase.position.y = 0.0;
  benchGroup.add(cabinetBase);

  // Rubber Feet at Base Corners
  [ -3.0, 3.0 ].forEach((x) => {
    [ -1.5, 1.5 ].forEach((z) => {
      const foot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.14, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.9 })
      );
      foot.position.set(x, -0.95, z);
      benchGroup.add(foot);
    });
  });

  // Cabinet handles
  for (let d = -1.8; d <= 1.8; d += 1.8) {
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.4, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.9, roughness: 0.2 })
    );
    handle.position.set(d, 0.1, 1.72);
    benchGroup.add(handle);
  }

  // Test Tube Rack
  const rackBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.15, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
  );
  rackBase.position.set(-2.5, 1.18, -1.0);
  benchGroup.add(rackBase);

  const colors = [0x00d4ff, 0xffaa00, 0xef4444, 0x10b981];
  colors.forEach((col, idx) => {
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.4, 16),
      new THREE.MeshPhysicalMaterial({
        color: col,
        transparent: true,
        opacity: 0.85,
        roughness: 0.1,
        transmission: 0.6,
      })
    );
    tube.position.set(-2.75 + idx * 0.16, 1.35, -1.0);
    benchGroup.add(tube);
  });

  // ----- 2. ESPECTRÔMETRO SPECTROMAXx (Direita) -----
  const specGroup = new THREE.Group();
  specGroup.position.set(1.1, 1.11, 0.1);
  labGroup.add(specGroup);

  // Lower Chassis: Industrial Graphite
  const specBase = new THREE.Mesh(
    new THREE.BoxGeometry(2.9, 0.68, 2.4),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.6 })
  );
  specBase.position.y = 0.34;
  specGroup.add(specBase);

  // Upper Chassis: Brushed Aluminum
  const specTop = new THREE.Mesh(
    new THREE.BoxGeometry(2.9, 0.78, 2.4),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.25, metalness: 0.85 })
  );
  specTop.position.y = 1.07;
  specGroup.add(specTop);

  // Front-Left Spark Chamber Cutout
  const chamberCutout = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.68, 0.85),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
  );
  chamberCutout.position.set(-0.95, 0.82, 0.75);
  specGroup.add(chamberCutout);

  // Specimen Stage & Machined Metal Disc
  const sampleStage = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.2, 24),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.3 })
  );
  sampleStage.position.set(-0.95, 0.58, 0.75);
  specGroup.add(sampleStage);

  const metalSample = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.06, 24),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.2 })
  );
  metalSample.position.set(-0.95, 0.71, 0.75);
  specGroup.add(metalSample);

  // Clamping Support Arm & Copper Electrode Probe Pin
  const electrodePin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.012, 0.3, 16),
    new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 })
  );
  electrodePin.position.set(-0.95, 0.98, 0.75);
  specGroup.add(electrodePin);

  // Electric Spark Arc Beam Mesh
  const sparkArcMat = new THREE.MeshStandardMaterial({
    color: 0x00d4ff,
    emissive: 0x00d4ff,
    emissiveIntensity: 0,
    roughness: 0.1,
  });
  const sparkArc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.045, 0.22, 12),
    sparkArcMat
  );
  sparkArc.position.set(-0.95, 0.82, 0.75);
  specGroup.add(sparkArc);

  // Blue-Cyan PointLight bound to Electrode
  const sparkLight = new THREE.PointLight(0x00d4ff, 0, 6.0);
  sparkLight.position.set(-0.95, 0.82, 0.75);
  specGroup.add(sparkLight);

  // Spark Particles
  const sparkParticleCount = 60;
  const sparkGeo = new THREE.BufferGeometry();
  const sparkPos = new Float32Array(sparkParticleCount * 3);
  const sparkVel = new Float32Array(sparkParticleCount * 3);

  for (let i = 0; i < sparkParticleCount * 3; i += 3) {
    sparkPos[i] = -0.95;
    sparkPos[i + 1] = 0.74;
    sparkPos[i + 2] = 0.75;

    const angle = Math.random() * Math.PI * 2;
    const speed = 0.6 + Math.random() * 2.2;
    sparkVel[i] = Math.cos(angle) * speed * 0.5;
    sparkVel[i + 1] = 0.6 + Math.random() * 2.0;
    sparkVel[i + 2] = Math.sin(angle) * speed * 0.5;
  }
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
  const sparkParticleMat = new THREE.PointsMaterial({
    color: 0x00d4ff,
    size: 0.08,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });
  const sparkParticles = new THREE.Points(sparkGeo, sparkParticleMat);
  specGroup.add(sparkParticles);

  // ----- 3. TERMINAL DE TELEMETRIA -----
  const pcGroup = new THREE.Group();
  pcGroup.position.set(-1.6, 1.11, 0.1);
  labGroup.add(pcGroup);

  // Base & Stem
  const pcBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.04, 20),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.8 })
  );
  pcBase.position.y = 0.02;
  pcGroup.add(pcBase);

  const pcStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.58, 12),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.8 })
  );
  pcStem.position.y = 0.31;
  pcGroup.add(pcStem);

  // Monitor Bezel Frame
  const pcFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 1.18, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 })
  );
  pcFrame.position.set(0, 0.92, 0);
  pcGroup.add(pcFrame);

  // Dynamic 2D Telemetry Canvas Texture Screen
  const canvas2D = document.createElement("canvas");
  canvas2D.width = 512;
  canvas2D.height = 320;
  const ctx2D = canvas2D.getContext("2d")!;

  const canvasTexture = new THREE.CanvasTexture(canvas2D);
  canvasTexture.minFilter = THREE.LinearFilter;
  canvasTexture.magFilter = THREE.LinearFilter;

  const pcScreenMat = new THREE.MeshBasicMaterial({ map: canvasTexture });
  const pcScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 1.08),
    pcScreenMat
  );
  pcScreen.position.set(0, 0.92, 0.042);
  pcGroup.add(pcScreen);

  // Keyboard & Mouse
  const keyboard = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 0.03, 0.48),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.4 })
  );
  keyboard.position.set(0, 0.025, 0.9);
  pcGroup.add(keyboard);

  const mouse = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.08, 0.04, 16),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.5 })
  );
  mouse.position.set(0.95, 0.025, 0.9);
  pcGroup.add(mouse);

  // Function to render spectrum graph & telemetric data on Canvas 2D
  const updateSpectrumCanvas = (time: number, isSparkActive: boolean) => {
    if (!ctx2D) return;

    ctx2D.fillStyle = "#0a0f18";
    ctx2D.fillRect(0, 0, 512, 320);

    ctx2D.fillStyle = "#1e293b";
    ctx2D.fillRect(0, 0, 512, 36);

    ctx2D.fillStyle = "#38bdf8";
    ctx2D.font = "bold 13px monospace";
    ctx2D.fillText("SPECTROMAXx — TELEMETRIA ESPECTRAL NBR ISO/IEC 17025", 14, 23);

    ctx2D.fillStyle = isSparkActive ? "#22c55e" : "#94a3b8";
    ctx2D.font = "bold 11px monospace";
    ctx2D.fillText(isSparkActive ? "QUEIMA: ATIVA (PULSO 8.0 kW)" : "STANDBY (REPOUSO)", 310, 23);

    ctx2D.strokeStyle = "rgba(51, 65, 85, 0.5)";
    ctx2D.lineWidth = 1;
    for (let x = 40; x < 360; x += 40) {
      ctx2D.beginPath();
      ctx2D.moveTo(x, 45);
      ctx2D.lineTo(x, 270);
      ctx2D.stroke();
    }
    for (let y = 60; y < 270; y += 35) {
      ctx2D.beginPath();
      ctx2D.moveTo(35, y);
      ctx2D.lineTo(360, y);
      ctx2D.stroke();
    }

    ctx2D.strokeStyle = "#00d4ff";
    ctx2D.lineWidth = 2.5;
    ctx2D.beginPath();

    const basePeaks = [
      { x: 50, h: 30, label: "Fe" },
      { x: 80, h: isSparkActive ? 150 : 35, label: "Fe" },
      { x: 110, h: 45, label: "" },
      { x: 140, h: isSparkActive ? 195 : 30, label: "C" },
      { x: 170, h: 60, label: "" },
      { x: 200, h: isSparkActive ? 165 : 25, label: "Si" },
      { x: 230, h: 50, label: "" },
      { x: 260, h: isSparkActive ? 135 : 20, label: "Mn" },
      { x: 290, h: isSparkActive ? 90 : 18, label: "P" },
      { x: 320, h: isSparkActive ? 115 : 18, label: "S" },
      { x: 350, h: 30, label: "" },
    ];

    ctx2D.moveTo(35, 260);

    basePeaks.forEach((p, idx) => {
      const osc = isSparkActive ? Math.sin(time * 15 + idx * 2) * 16 : Math.sin(time * 2 + idx) * 2;
      const peakY = 260 - Math.max(10, p.h + osc);
      ctx2D.lineTo(p.x, peakY);
    });

    ctx2D.lineTo(360, 260);
    ctx2D.stroke();

    const grad = ctx2D.createLinearGradient(0, 60, 0, 260);
    grad.addColorStop(0, isSparkActive ? "rgba(0, 212, 255, 0.4)" : "rgba(56, 189, 248, 0.1)");
    grad.addColorStop(1, "rgba(0, 212, 255, 0.0)");
    ctx2D.fillStyle = grad;
    ctx2D.fill();

    basePeaks.forEach((p) => {
      if (p.label) {
        ctx2D.fillStyle = "#ffaa00";
        ctx2D.font = "bold 10px monospace";
        ctx2D.fillText(p.label, p.x - 6, 275);
      }
    });

    ctx2D.fillStyle = "#0f172a";
    ctx2D.fillRect(370, 45, 132, 260);
    ctx2D.strokeStyle = "#334155";
    ctx2D.strokeRect(370, 45, 132, 260);

    ctx2D.fillStyle = "#94a3b8";
    ctx2D.font = "bold 11px monospace";
    ctx2D.fillText("COMPOSIÇÃO %", 380, 65);

    const elements = [
      { name: "Fe", val: isSparkActive ? "93.85%" : "---" },
      { name: "C", val: isSparkActive ? " 3.42%" : "---" },
      { name: "Si", val: isSparkActive ? " 2.15%" : "---" },
      { name: "Mn", val: isSparkActive ? " 0.45%" : "---" },
      { name: "P", val: isSparkActive ? " 0.02%" : "---" },
      { name: "S", val: isSparkActive ? " 0.01%" : "---" },
    ];

    elements.forEach((el, i) => {
      ctx2D.fillStyle = "#e2e8f0";
      ctx2D.font = "11px monospace";
      ctx2D.fillText(`${el.name}: ${el.val}`, 380, 92 + i * 22);
    });

    ctx2D.fillStyle = isSparkActive ? "#22c55e" : "#475569";
    ctx2D.fillRect(380, 245, 112, 28);
    ctx2D.fillStyle = "#0f172a";
    ctx2D.font = "bold 11px monospace";
    ctx2D.fillText(isSparkActive ? "✓ CONFORME" : "AGUARDANDO", 390, 263);

    canvasTexture.needsUpdate = true;
  };

  return {
    labGroup,
    sparkArcMat,
    sparkLight,
    sparkParticleMat,
    sparkGeo,
    sparkVel,
    sparkParticleCount,
    updateSpectrumCanvas,
  };
}

const LabSpectrometerCanvas = ({
  sectionRef,
  onProgressUpdate,
}: LabSpectrometerCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const sectionEl = sectionRef.current;
    if (!container || !sectionEl) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 550;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0a0f18");

    // Camera with GSAP Controlled Scrub Vectors
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(4.5, 3.2, 5.0);
    const cameraTarget = new THREE.Vector3(0, 1.2, 0);
    camera.lookAt(cameraTarget);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobileDevice(),
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileDevice() ? 1 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Post-Processing Bloom
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.5, // Strength
      0.4, // Radius
      0.85 // High threshold (glow only on spark arc & status LEDs)
    );
    composer.addPass(bloomPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x0a0f18, 0.4);
    scene.add(ambientLight);

    const mainDirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainDirLight.position.set(5, 12, 8);
    scene.add(mainDirLight);

    const cyanRimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    cyanRimLight.position.set(-8, 6, -5);
    scene.add(cyanRimLight);

    // Floor & Industrial Grid
    const grid = new THREE.GridHelper(40, 30, 0x00d4ff, 0x1e293b);
    grid.position.y = -0.9;
    scene.add(grid);

    // Instantiate 3D SPECTROMAXx Lab Station
    const {
      labGroup,
      sparkArcMat,
      sparkLight,
      sparkParticleMat,
      sparkGeo,
      sparkVel,
      sparkParticleCount,
      updateSpectrumCanvas,
    } = createHighResSpectrometerLab();
    labGroup.position.set(0, -0.9, 0);
    scene.add(labGroup);

    // Camera Scrub Targets
    const targetPos = new THREE.Vector3(4.5, 3.2, 5.0);
    const targetLookAt = new THREE.Vector3(0, 1.2, 0);
    let currentScrollProgress = 0;

    // GSAP ScrollTrigger for Camera Scrub
    const ctx = gsap.context(() => {
      if (prefersReduced) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          onUpdate: (self) => {
            currentScrollProgress = self.progress;
            if (onProgressUpdate) onProgressUpdate(self.progress);
          },
        },
      });

      // Scroll 0% -> 30%: Overview [4.5, 3.2, 5.0] looking at [0, 1.2, 0]
      // Scroll 30% -> 70%: Zoom in smoothly (ease: power2.inOut) to spark chamber [1.2, 1.6, 2.1] looking at [0.4, 1.3, 0.2]
      tl.to(
        targetPos,
        {
          x: 1.2,
          y: 1.6,
          z: 2.1,
          ease: "power2.inOut",
        },
        0.3
      ).to(
        targetLookAt,
        {
          x: 0.4,
          y: 1.3,
          z: 0.2,
          ease: "power2.inOut",
        },
        0.3
      );
    }, sectionEl);

    // ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 550;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Animation Loop (60 FPS)
    let animId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate);
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const timeSec = currentTime / 1000;
      const isSparkActive = currentScrollProgress >= 0.65;

      // Smooth camera lerp
      camera.position.lerp(targetPos, 0.1);
      cameraTarget.lerp(targetLookAt, 0.1);
      camera.lookAt(cameraTarget);

      // Stroboscopic Spark Arc Light Pulse (2.0 to 8.0)
      if (sparkLight && sparkArcMat) {
        if (isSparkActive) {
          const pulse = 2.0 + Math.sin(timeSec * 35.0) * 3.0 + Math.random() * 3.0;
          sparkLight.intensity = pulse;
          sparkArcMat.emissiveIntensity = pulse;
          sparkParticleMat.opacity = 0.9;
        } else {
          sparkLight.intensity = 0;
          sparkArcMat.emissiveIntensity = 0;
          sparkParticleMat.opacity = 0;
        }
      }

      // Update Canvas 2D Spectrum Graph
      if (updateSpectrumCanvas) {
        updateSpectrumCanvas(timeSec, isSparkActive);
      }

      // Spark Particles
      if (isSparkActive) {
        const posArr = sparkGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < sparkParticleCount; i++) {
          const idx = i * 3;
          posArr[idx] += sparkVel[idx] * delta;
          posArr[idx + 1] += sparkVel[idx + 1] * delta;
          posArr[idx + 2] += sparkVel[idx + 2] * delta;

          sparkVel[idx + 1] -= 9.8 * delta * 0.25;

          if (posArr[idx + 1] < 0.7) {
            posArr[idx] = -0.95;
            posArr[idx + 1] = 0.74;
            posArr[idx + 2] = 0.75;

            const angle = Math.random() * Math.PI * 2;
            const speed = 0.6 + Math.random() * 2.2;
            sparkVel[idx] = Math.cos(angle) * speed * 0.5;
            sparkVel[idx + 1] = 0.6 + Math.random() * 2.0;
            sparkVel[idx + 2] = Math.sin(angle) * speed * 0.5;
          }
        }
        sparkGeo.attributes.position.needsUpdate = true;
      }

      composer.render();
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      ctx.revert();

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      renderer.dispose();
      composer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [sectionRef, onProgressUpdate]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[450px] sm:min-h-[550px] rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl glass-dark"
    />
  );
};

export default LabSpectrometerCanvas;
