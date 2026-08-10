import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RotateCcw, Sparkles, Sun, ShieldCheck } from "lucide-react";
import { isMobileDevice } from "@/hooks/useThreeScene";

interface Product3DViewerProps {
  alloyType?: "nodular" | "vermicular" | "cinzento" | "aco";
  title?: string;
}

const Product3DViewer = ({ alloyType = "nodular", title = "Modelo 3D Interativo" }: Product3DViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const mainMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const [roughness, setRoughness] = useState<number>(0.3);
  const [metalness, setMetalness] = useState<number>(0.85);
  const [isGlowing, setIsGlowing] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const width = container.clientWidth || 350;
    const height = container.clientHeight || 350;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 4.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobileDevice(),
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileDevice() ? 1 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Group for complex casting piece (Automotive Brake Disc / Flange geometry)
    const productGroup = new THREE.Group();
    meshGroupRef.current = productGroup;
    scene.add(productGroup);

    // Materials based on alloyType
    const baseColor =
      alloyType === "vermicular"
        ? "#5a4d41"
        : alloyType === "cinzento"
        ? "#484e56"
        : alloyType === "aco"
        ? "#737e8c"
        : "#555d68"; // nodular

    const mainMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(baseColor),
      metalness: 0.85,
      roughness: 0.3,
      emissive: new THREE.Color("#000000"),
      emissiveIntensity: 0,
    });
    mainMaterialRef.current = mainMaterial;

    // Disc rotor plate
    const rotorGeom = new THREE.CylinderGeometry(1.5, 1.5, 0.25, 48);
    const rotorMesh = new THREE.Mesh(rotorGeom, mainMaterial);
    productGroup.add(rotorMesh);

    // Inner hat bell
    const hatGeom = new THREE.CylinderGeometry(0.85, 0.95, 0.5, 32);
    const hatMesh = new THREE.Mesh(hatGeom, mainMaterial);
    hatMesh.position.y = 0.25;
    productGroup.add(hatMesh);

    // Center hub hole
    const centerHoleGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.52, 24);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x0f1115 });
    const holeMesh = new THREE.Mesh(centerHoleGeom, holeMat);
    holeMesh.position.y = 0.25;
    productGroup.add(holeMesh);

    // Ventilated cooling ribs inside disc
    const ribCount = 16;
    for (let i = 0; i < ribCount; i++) {
      const angle = (i / ribCount) * Math.PI * 2;
      const ribGeom = new THREE.BoxGeometry(0.5, 0.12, 0.08);
      const ribMesh = new THREE.Mesh(ribGeom, mainMaterial);
      ribMesh.position.x = Math.cos(angle) * 1.15;
      ribMesh.position.z = Math.sin(angle) * 1.15;
      ribMesh.rotation.y = -angle;
      productGroup.add(ribMesh);
    }

    // Lug bolt holes (4 holes)
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const boltGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.53, 16);
      const boltMesh = new THREE.Mesh(boltGeom, holeMat);
      boltMesh.position.x = Math.cos(angle) * 0.65;
      boltMesh.position.z = Math.sin(angle) * 0.65;
      boltMesh.position.y = 0.25;
      productGroup.add(boltMesh);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff781e, 0.6);
    dirLight2.position.set(-5, -3, -5);
    scene.add(dirLight2);

    // Mouse drag rotation control
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !productGroup) return;
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y,
      };

      productGroup.rotation.y += deltaMove.x * 0.01;
      productGroup.rotation.x += deltaMove.y * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 350;
      const h = container.clientHeight || 350;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (productGroup && isRotating && !isDragging && !prefersReduced) {
        productGroup.rotation.y += delta * 0.4;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);

      rotorGeom.dispose();
      hatGeom.dispose();
      centerHoleGeom.dispose();
      holeMat.dispose();
      mainMaterial.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [alloyType, isRotating]);

  // Update material properties dynamically
  useEffect(() => {
    const mat = mainMaterialRef.current;
    if (!mat) return;
    mat.roughness = roughness;
    mat.metalness = metalness;
    if (isGlowing) {
      mat.emissive.set("#ff4500");
      mat.emissiveIntensity = 0.6;
    } else {
      mat.emissive.set("#000000");
      mat.emissiveIntensity = 0;
    }
  }, [roughness, metalness, isGlowing]);

  const resetView = () => {
    if (meshGroupRef.current) {
      meshGroupRef.current.rotation.set(0, 0, 0);
    }
    setRoughness(0.3);
    setMetalness(0.85);
    setIsGlowing(false);
  };

  return (
    <div className="glass-dark border border-accent/20 rounded-xl p-4 flex flex-col items-center relative overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-accent" />
          <span className="font-heading text-sm uppercase font-bold text-foreground">
            {title}
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase text-accent/80 bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
          WebGL 3D
        </span>
      </div>

      {/* 3D Canvas container */}
      <div
        ref={containerRef}
        className="w-full h-[280px] sm:h-[320px] cursor-grab active:cursor-grabbing relative"
      />

      <p className="text-[11px] text-foreground/50 mb-4 italic">
        Arraste com o mouse para girar o componente em 360°
      </p>

      {/* Material Inspector Controls */}
      <div className="w-full grid grid-cols-2 gap-3 bg-background/50 p-3 rounded-lg border border-border/40 text-xs">
        <div>
          <label className="text-[10px] font-mono uppercase text-foreground/60 block mb-1">
            Rugosidade ({roughness.toFixed(2)})
          </label>
          <input
            type="range"
            min="0.05"
            max="0.95"
            step="0.05"
            value={roughness}
            onChange={(e) => setRoughness(parseFloat(e.target.value))}
            className="w-full accent-accent h-1 bg-border rounded cursor-pointer"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-foreground/60 block mb-1">
            Metalicidade ({metalness.toFixed(2)})
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={metalness}
            onChange={(e) => setMetalness(parseFloat(e.target.value))}
            className="w-full accent-accent h-1 bg-border rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Quick Action Toggles */}
      <div className="w-full flex items-center justify-between gap-2 mt-3">
        <button
          type="button"
          onClick={() => setIsGlowing(!isGlowing)}
          className={`flex-1 py-1.5 px-2 rounded text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border ${
            isGlowing
              ? "bg-accent/20 border-accent text-accent font-bold"
              : "bg-background/40 border-border/40 text-foreground/70 hover:text-foreground"
          }`}
        >
          <Sparkles size={13} />
          {isGlowing ? "Aquecimento On" : "Simular Calor"}
        </button>

        <button
          type="button"
          onClick={() => setIsRotating(!isRotating)}
          className={`flex-1 py-1.5 px-2 rounded text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border ${
            isRotating
              ? "bg-accent/20 border-accent text-accent font-bold"
              : "bg-background/40 border-border/40 text-foreground/70 hover:text-foreground"
          }`}
        >
          <Sun size={13} />
          {isRotating ? "Rotação On" : "Pausado"}
        </button>

        <button
          type="button"
          onClick={resetView}
          className="p-1.5 rounded bg-background/40 border border-border/40 text-foreground/70 hover:text-accent transition-colors"
          title="Resetar Câmera"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
};

export default Product3DViewer;
