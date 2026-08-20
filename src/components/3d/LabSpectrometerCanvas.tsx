import { useRef, useEffect } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { isMobileDevice } from "@/hooks/useThreeScene";

/**
 * High-Resolution SPECTROMAXx 3D Lab Station Model
 */
function createHighResSpectrometerLab() {
  const labGroup = new THREE.Group();

  // ----- 1. MESA / BANCADA LABORATORIAL -----
  const benchGroup = new THREE.Group();
  labGroup.add(benchGroup);

  // Bench Top Slab (Granite / Melamine)
  const benchTop = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 0.22, 3.6),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.15 })
  );
  benchTop.position.y = 1.0;
  benchGroup.add(benchTop);

  // Cabinet Base (Dark Gray Slate)
  const cabinetBase = new THREE.Mesh(
    new THREE.BoxGeometry(6.3, 1.8, 3.4),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.25 })
  );
  cabinetBase.position.y = 0.0;
  benchGroup.add(cabinetBase);

  // Door handles
  for (let d = -1.8; d <= 1.8; d += 1.8) {
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.4, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.9, roughness: 0.2 })
    );
    handle.position.set(d, 0.1, 1.72);
    benchGroup.add(handle);
  }

  // Test Tube Rack on side of bench
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
        opacity: 0.8,
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

  // Lower Dark Base Body
  const specBase = new THREE.Mesh(
    new THREE.BoxGeometry(2.9, 0.68, 2.4),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.65 })
  );
  specBase.position.y = 0.34;
  specGroup.add(specBase);

  // Upper Light Aluminum Body
  const specTop = new THREE.Mesh(
    new THREE.BoxGeometry(2.9, 0.78, 2.4),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.3, metalness: 0.75 })
  );
  specTop.position.y = 1.07;
  specGroup.add(specTop);

  // Curved front overhang lip
  const specLip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 2.9, 16, 1, false, 0, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.8 })
  );
  specLip.rotation.z = Math.PI / 2;
  specLip.position.set(0, 1.45, 1.2);
  specGroup.add(specLip);

  // Front-Left Spark Chamber Alcove (Cutout)
  const chamberCutout = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.68, 0.85),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, metalness: 0.1 })
  );
  chamberCutout.position.set(-0.95, 0.82, 0.75);
  specGroup.add(chamberCutout);

  // Sample Specimen Stage inside chamber
  const sampleStage = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.2, 24),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.3 })
  );
  sampleStage.position.set(-0.95, 0.58, 0.75);
  specGroup.add(sampleStage);

  // Metal Sample Button (Disc)
  const metalSample = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.06, 24),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.2 })
  );
  metalSample.position.set(-0.95, 0.71, 0.75);
  specGroup.add(metalSample);

  // Spark Electrode Probe Pin
  const electrodePin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.012, 0.3, 16),
    new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 })
  );
  electrodePin.position.set(-0.95, 0.98, 0.75);
  specGroup.add(electrodePin);

  // Electric Spark Arc Beam
  const sparkArcMat = new THREE.MeshStandardMaterial({
    color: 0x00d4ff,
    emissive: 0x00d4ff,
    emissiveIntensity: 5.0,
    roughness: 0.1,
  });
  const sparkArc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.045, 0.22, 12),
    sparkArcMat
  );
  sparkArc.position.set(-0.95, 0.82, 0.75);
  specGroup.add(sparkArc);

  // Blue Spark PointLight
  const sparkLight = new THREE.PointLight(0x00d4ff, 4.5, 6.0);
  sparkLight.position.set(-0.95, 0.82, 0.75);
  specGroup.add(sparkLight);

  // Spark Splash Particles
  const sparkParticleCount = 50;
  const sparkGeo = new THREE.BufferGeometry();
  const sparkPos = new Float32Array(sparkParticleCount * 3);
  const sparkVel = new Float32Array(sparkParticleCount * 3);

  for (let i = 0; i < sparkParticleCount * 3; i += 3) {
    sparkPos[i] = -0.95;
    sparkPos[i + 1] = 0.74;
    sparkPos[i + 2] = 0.75;

    const angle = Math.random() * Math.PI * 2;
    const speed = 0.4 + Math.random() * 1.5;
    sparkVel[i] = Math.cos(angle) * speed * 0.5;
    sparkVel[i + 1] = 0.5 + Math.random() * 1.8;
    sparkVel[i + 2] = Math.sin(angle) * speed * 0.5;
  }
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
  const sparkParticleMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.1,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  });
  const sparkParticles = new THREE.Points(sparkGeo, sparkParticleMat);
  specGroup.add(sparkParticles);

  // Spectrometer Side Vent Grilles
  for (let v = 0; v < 5; v++) {
    const vent = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.08, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
    );
    vent.position.set(1.46, 0.35 + v * 0.12, 0.2);
    specGroup.add(vent);
  }

  // ----- 3. MONITOR DO COMPUTADOR E TELA COM CANVAS 2D -----
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

  // Create Dynamic Canvas 2D for Real-Time Live Spectrum Graph
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

  // Function to render the real-time dynamic spectrum graph on canvas 2D
  const updateSpectrumCanvas = (time: number) => {
    if (!ctx2D) return;

    // Dark software background
    ctx2D.fillStyle = "#0f172a";
    ctx2D.fillRect(0, 0, 512, 320);

    // Top Header Bar
    ctx2D.fillStyle = "#1e293b";
    ctx2D.fillRect(0, 0, 512, 36);

    ctx2D.fillStyle = "#38bdf8";
    ctx2D.font = "bold 13px monospace";
    ctx2D.fillText("SPECTROMAXx — LEITURA ESPECTROMÉTRICA AO VIVO", 14, 23);

    ctx2D.fillStyle = "#22c55e";
    ctx2D.font = "bold 11px monospace";
    ctx2D.fillText("STATUS: CENTELHAMENTO ATIVO", 310, 23);

    // Grid lines
    ctx2D.strokeStyle = "rgba(51, 65, 85, 0.6)";
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

    // Spectrum Graph Peaks (Fe, C, Si, Mn, Cr, Ni)
    ctx2D.strokeStyle = "#38bdf8";
    ctx2D.lineWidth = 2;
    ctx2D.beginPath();

    const basePeaks = [
      { x: 50, h: 40 },
      { x: 80, h: 145 }, // Fe peak
      { x: 110, h: 65 },
      { x: 140, h: 195 }, // C peak
      { x: 170, h: 85 },
      { x: 200, h: 165 }, // Si peak
      { x: 230, h: 55 },
      { x: 260, h: 135 }, // Mn peak
      { x: 290, h: 75 },
      { x: 320, h: 115 }, // Cr/Ni peak
      { x: 350, h: 35 },
    ];

    ctx2D.moveTo(35, 260);

    basePeaks.forEach((p, idx) => {
      const oscillation = Math.sin(time * 10 + idx * 1.5) * 14;
      const peakY = 260 - (p.h + oscillation);
      ctx2D.lineTo(p.x, peakY);
    });

    ctx2D.lineTo(360, 260);
    ctx2D.stroke();

    // Fill under graph with gradient glow
    const grad = ctx2D.createLinearGradient(0, 60, 0, 260);
    grad.addColorStop(0, "rgba(56, 189, 248, 0.35)");
    grad.addColorStop(1, "rgba(56, 189, 248, 0.0)");
    ctx2D.fillStyle = grad;
    ctx2D.fill();

    // Element Peak Labels
    ctx2D.fillStyle = "#ffaa00";
    ctx2D.font = "bold 11px monospace";
    ctx2D.fillText("Fe", 75, 100);
    ctx2D.fillText("C", 137, 50);
    ctx2D.fillText("Si", 195, 80);
    ctx2D.fillText("Mn", 255, 110);

    // Right Side Analysis Readout Panel
    ctx2D.fillStyle = "#0f172a";
    ctx2D.fillRect(370, 45, 132, 260);
    ctx2D.strokeStyle = "#334155";
    ctx2D.strokeRect(370, 45, 132, 260);

    ctx2D.fillStyle = "#94a3b8";
    ctx2D.font = "bold 11px monospace";
    ctx2D.fillText("COMPOSIÇÃO %", 380, 65);

    const elements = [
      { name: "Fe", val: "93.85%" },
      { name: "C", val: " 3.42%" },
      { name: "Si", val: " 2.15%" },
      { name: "Mn", val: " 0.45%" },
      { name: "P", val: " 0.02%" },
      { name: "S", val: " 0.01%" },
    ];

    elements.forEach((el, i) => {
      ctx2D.fillStyle = "#e2e8f0";
      ctx2D.font = "11px monospace";
      ctx2D.fillText(`${el.name}: ${el.val}`, 380, 92 + i * 22);
    });

    ctx2D.fillStyle = "#22c55e";
    ctx2D.fillRect(380, 245, 112, 28);
    ctx2D.fillStyle = "#0f172a";
    ctx2D.font = "bold 11px monospace";
    ctx2D.fillText("✓ APROVADO", 395, 263);

    canvasTexture.needsUpdate = true;
  };

  return {
    labGroup,
    sparkArcMat,
    sparkLight,
    sparkGeo,
    sparkVel,
    sparkParticleCount,
    updateSpectrumCanvas,
  };
}

const LabSpectrometerCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0b0f17");

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 7.5);
    const cameraTarget = new THREE.Vector3(0, 1.1, 0);
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
      1.2, // Strength
      0.4, // Radius
      0.85 // Threshold
    );
    composer.addPass(bloomPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(6, 12, 8);
    scene.add(dirLight);

    const cyanRim = new THREE.DirectionalLight(0x38bdf8, 0.7);
    cyanRim.position.set(-8, 6, -5);
    scene.add(cyanRim);

    const warmFill = new THREE.DirectionalLight(0xffaa66, 0.4);
    warmFill.position.set(0, 4, 8);
    scene.add(warmFill);

    // Floor & Industrial Grid
    const grid = new THREE.GridHelper(40, 30, 0x38bdf8, 0x1e293b);
    grid.position.y = -0.9;
    scene.add(grid);

    // Instantiate 3D SPECTROMAXx Lab Station
    const {
      labGroup,
      sparkLight,
      sparkGeo,
      sparkVel,
      sparkParticleCount,
      updateSpectrumCanvas,
    } = createHighResSpectrometerLab();
    labGroup.position.set(0, -0.9, 0);
    scene.add(labGroup);

    // ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 500;
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

      // Smooth floating camera orbit around bench
      camera.position.x = Math.sin(timeSec * 0.4) * 0.4;
      camera.position.y = 3.2 + Math.cos(timeSec * 0.3) * 0.15;
      camera.lookAt(cameraTarget);

      // Electric spark light pulsing
      if (sparkLight) {
        sparkLight.intensity = 3.5 + Math.sin(timeSec * 25.0) * 1.5;
      }

      // Update Canvas 2D Dynamic Spectrum Texture
      if (updateSpectrumCanvas) {
        updateSpectrumCanvas(timeSec);
      }

      // Spark Particles
      const posArr = sparkGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < sparkParticleCount; i++) {
        const idx = i * 3;
        posArr[idx] += sparkVel[idx] * delta;
        posArr[idx + 1] += sparkVel[idx + 1] * delta;
        posArr[idx + 2] += sparkVel[idx + 2] * delta;

        sparkVel[idx + 1] -= 9.8 * delta * 0.15; // Gravity

        if (posArr[idx + 1] < 0.7) {
          posArr[idx] = -0.95;
          posArr[idx + 1] = 0.74;
          posArr[idx + 2] = 0.75;

          const angle = Math.random() * Math.PI * 2;
          const speed = 0.4 + Math.random() * 1.5;
          sparkVel[idx] = Math.cos(angle) * speed * 0.5;
          sparkVel[idx + 1] = 0.5 + Math.random() * 1.8;
          sparkVel[idx + 2] = Math.sin(angle) * speed * 0.5;
        }
      }
      sparkGeo.attributes.position.needsUpdate = true;

      composer.render();
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();

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
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[380px] sm:min-h-[480px] rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl glass-dark"
    />
  );
};

export default LabSpectrometerCanvas;
