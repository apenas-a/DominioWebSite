import { useEffect, useRef } from "react";
import * as THREE from "three";
import { isMobileDevice } from "@/hooks/useThreeScene";

interface Process3DCanvasProps {
  currentStep: number; // 0: Matéria-Prima, 1: Fusão, 2: Moldagem, 3: Vazamento, 4: Resfriamento, 5: Acabamento, 6: Inspeção
}

const Process3DCanvas = ({ currentStep }: Process3DCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<THREE.Group | null>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const wireframeRef = useRef<THREE.LineSegments | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 5);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobileDevice(),
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileDevice() ? 1 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // Group for complex industrial casting piece
    const mainGroup = new THREE.Group();
    meshRef.current = mainGroup;
    scene.add(mainGroup);

    // Create complex 3D casting gear/flange geometry
    const outerGeom = new THREE.CylinderGeometry(1.6, 1.6, 0.4, 32);
    const innerGeom = new THREE.CylinderGeometry(0.8, 0.8, 0.8, 24);
    const holeGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.9, 16);

    // Primary metallic material
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#4a4f57"),
      metalness: 0.85,
      roughness: 0.35,
      emissive: new THREE.Color("#000000"),
      emissiveIntensity: 0,
    });
    materialRef.current = baseMaterial;

    // Mesh elements
    const outerMesh = new THREE.Mesh(outerGeom, baseMaterial);
    const innerMesh = new THREE.Mesh(innerGeom, baseMaterial);
    mainGroup.add(outerMesh);
    mainGroup.add(innerMesh);

    // Add teeth around gear flange to look like a real cast piece
    const teethCount = 12;
    for (let i = 0; i < teethCount; i++) {
      const angle = (i / teethCount) * Math.PI * 2;
      const toothGeom = new THREE.BoxGeometry(0.25, 0.4, 0.3);
      const toothMesh = new THREE.Mesh(toothGeom, baseMaterial);
      toothMesh.position.x = Math.cos(angle) * 1.7;
      toothMesh.position.z = Math.sin(angle) * 1.7;
      toothMesh.rotation.y = -angle;
      mainGroup.add(toothMesh);
    }

    // Wireframe inspect overlay for Inspeção step
    const wireGeom = new THREE.WireframeGeometry(outerGeom);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0,
    });
    const wireframe = new THREE.LineSegments(wireGeom, wireMat);
    wireframeRef.current = wireframe;
    mainGroup.add(wireframe);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff781e, 0.6);
    dirLight2.position.set(-5, -2, -5);
    scene.add(dirLight2);

    // Molten heat point light
    const pointLight = new THREE.PointLight(0xff5500, 0, 10);
    pointLight.position.set(0, 0, 0);
    pointLightRef.current = pointLight;
    scene.add(pointLight);

    // ResizeObserver for reliable container resizing
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Animation Loop using performance.now() to avoid THREE.Clock deprecation
    let animId: number;
    let previousTime = performance.now();

    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate);
      const delta = (currentTime - previousTime) / 1000;
      previousTime = currentTime;

      if (mainGroup) {
        mainGroup.rotation.y += delta * 0.5;
        mainGroup.rotation.x = Math.sin(currentTime * 0.0008) * 0.1;
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();

      outerGeom.dispose();
      innerGeom.dispose();
      holeGeom.dispose();
      wireGeom.dispose();
      wireMat.dispose();
      baseMaterial.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Smoothly react to step changes (0 to 6)
  useEffect(() => {
    const mat = materialRef.current;
    const wire = wireframeRef.current;
    const light = pointLightRef.current;
    if (!mat || !wire || !light) return;

    // Step 0: Matéria-Prima (raw metallic scrap, dark industrial tone)
    if (currentStep === 0) {
      mat.color.set("#3a3f47");
      mat.roughness = 0.7;
      mat.metalness = 0.4;
      mat.emissive.set("#000000");
      mat.emissiveIntensity = 0;
      (wire.material as THREE.LineBasicMaterial).opacity = 0;
      light.intensity = 0;
    }
    // Step 1: Fusão (molten incandescent glowing furnace metal)
    else if (currentStep === 1) {
      mat.color.set("#ff3300");
      mat.roughness = 0.2;
      mat.metalness = 0.5;
      mat.emissive.set("#ff4500");
      mat.emissiveIntensity = 1.4;
      (wire.material as THREE.LineBasicMaterial).opacity = 0;
      light.intensity = 3.5;
      light.color.set("#ff5500");
    }
    // Step 2: Moldagem (sand mold feel, organic rough finish)
    else if (currentStep === 2) {
      mat.color.set("#7c7062");
      mat.roughness = 0.85;
      mat.metalness = 0.15;
      mat.emissive.set("#000000");
      mat.emissiveIntensity = 0;
      (wire.material as THREE.LineBasicMaterial).opacity = 0;
      light.intensity = 0;
    }
    // Step 3: Vazamento (liquid glowing orange metal filling mold)
    else if (currentStep === 3) {
      mat.color.set("#ff8c00");
      mat.roughness = 0.15;
      mat.metalness = 0.7;
      mat.emissive.set("#ff2200");
      mat.emissiveIntensity = 1.0;
      (wire.material as THREE.LineBasicMaterial).opacity = 0;
      light.intensity = 2.5;
      light.color.set("#ff6600");
    }
    // Step 4: Resfriamento (cooling metal, darkening core, subtle ember glow)
    else if (currentStep === 4) {
      mat.color.set("#524038");
      mat.roughness = 0.6;
      mat.metalness = 0.6;
      mat.emissive.set("#ff1100");
      mat.emissiveIntensity = 0.25;
      (wire.material as THREE.LineBasicMaterial).opacity = 0;
      light.intensity = 0.5;
      light.color.set("#ff3300");
    }
    // Step 5: Acabamento (shot blasted, clean machined metal)
    else if (currentStep === 5) {
      mat.color.set("#7a8595");
      mat.roughness = 0.3;
      mat.metalness = 0.9;
      mat.emissive.set("#000000");
      mat.emissiveIntensity = 0;
      (wire.material as THREE.LineBasicMaterial).opacity = 0;
      light.intensity = 0;
    }
    // Step 6: Inspeção & Qualidade (cyan high-precision laser scan wireframe)
    else if (currentStep === 6) {
      mat.color.set("#1e293b");
      mat.roughness = 0.35;
      mat.metalness = 0.95;
      mat.emissive.set("#002b36");
      mat.emissiveIntensity = 0.4;
      (wire.material as THREE.LineBasicMaterial).opacity = 0.95;
      (wire.material as THREE.LineBasicMaterial).color.set("#00f0ff");
      light.intensity = 1.5;
      light.color.set("#00f0ff");
    }
  }, [currentStep]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[320px] flex items-center justify-center pointer-events-none"
    />
  );
};

export default Process3DCanvas;
