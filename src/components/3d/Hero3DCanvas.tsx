import { useEffect, useRef } from "react";
import * as THREE from "three";
import { isMobileDevice } from "@/hooks/useThreeScene";

const Hero3DCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 15;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobileDevice(),
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileDevice() ? 1 : 1.5));
    container.appendChild(renderer.domElement);

    // Particle geometry - Sparks & Embers
    const particleCount = isMobileDevice() ? 80 : 250;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);

    const moltenOrange = new THREE.Color("#ff781e");
    const moltenGold = new THREE.Color("#ffaa00");
    const hotWhite = new THREE.Color("#fff5e6");
    const steelGray = new THREE.Color("#7a889b");

    for (let i = 0; i < particleCount; i++) {
      // Spread in 3D space
      positions[i * 3] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Velocities for gentle upward drift & wind
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = Math.random() * 0.03 + 0.01;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;

      // Color variation
      const rand = Math.random();
      let color = moltenOrange;
      if (rand > 0.8) color = hotWhite;
      else if (rand > 0.5) color = moltenGold;
      else if (rand > 0.3) color = steelGray;

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 0.4 + 0.1;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const material = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Add subtle ambient glowing ring in background
    const torusGeom = new THREE.TorusGeometry(8, 0.05, 16, 100);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0xff5a2d,
      transparent: true,
      opacity: 0.15,
      wireframe: true,
    });
    const torus = new THREE.Mesh(torusGeom, torusMat);
    torus.rotation.x = Math.PI / 3;
    scene.add(torus);

    // Mouse interactivity
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.0005;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.0005;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Window resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      particles.rotation.y = targetX * 1.5;
      particles.rotation.x = targetY * 1.5;
      torus.rotation.z += 0.002;
      torus.rotation.y += 0.001;

      // Move particle positions upwards
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3 + 1] += velocities[i * 3 + 1];
        posArray[i * 3] += Math.sin(posArray[i * 3 + 1] * 0.5) * 0.005;

        // Reset particle if floating above limit
        if (posArray[i * 3 + 1] > 12) {
          posArray[i * 3 + 1] = -12;
          posArray[i * 3] = (Math.random() - 0.5) * 35;
        }
      }

      posAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      geometry.dispose();
      material.dispose();
      torusGeom.dispose();
      torusMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-1"
      aria-hidden="true"
    />
  );
};

export default Hero3DCanvas;
