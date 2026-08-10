import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

interface ThreeSceneOptions {
  antialias?: boolean;
  alpha?: boolean;
  maxPixelRatio?: number;
  autoResize?: boolean;
  onInit?: (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => void;
  onAnimate?: (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, time: number, delta: number) => void;
  onDispose?: () => void;
  onResize?: (width: number, height: number) => void;
}

/**
 * useThreeScene - Manages a Three.js scene with proper lifecycle and cleanup
 * 
 * Features:
 * - Automatic resize handling
 * - Proper disposal of all GPU resources
 * - Pixel ratio limiting for performance
 * - Animation loop management
 * - prefers-reduced-motion support
 */
export function useThreeScene(options: ThreeSceneOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const isDisposedRef = useRef(false);

  const {
    antialias = true,
    alpha = true,
    maxPixelRatio = 1.5,
    autoResize = true,
    onInit,
    onAnimate,
    onDispose,
    onResize,
  } = options;

  // Dispose all scene objects
  const disposeScene = useCallback((scene: THREE.Scene) => {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => {
              disposeMaterial(mat);
            });
          } else {
            disposeMaterial(object.material);
          }
        }
      }
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    isDisposedRef.current = false;

    // Check for reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const { width, height } = container.getBoundingClientRect();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias,
      alpha,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Initialize callback
    onInit?.(scene, camera, renderer);

    // Resize handler
    const handleResize = () => {
      if (isDisposedRef.current || !container) return;
      const { width: w, height: h } = container.getBoundingClientRect();
      if (w === 0 || h === 0) return;
      
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      onResize?.(w, h);
    };

    if (autoResize) {
      const ro = new ResizeObserver(handleResize);
      ro.observe(container);

      // Animation loop
      const clock = clockRef.current;
      clock.start();

      const animate = () => {
        if (isDisposedRef.current) return;
        
        frameIdRef.current = requestAnimationFrame(animate);
        
        if (!prefersReduced && onAnimate) {
          const elapsed = clock.getElapsedTime();
          const delta = clock.getDelta();
          onAnimate(scene, camera, renderer, elapsed, delta);
        }
        
        renderer.render(scene, camera);
      };

      if (!prefersReduced || !onAnimate) {
        // If reduced motion, render once
        if (prefersReduced) {
          renderer.render(scene, camera);
        } else {
          animate();
        }
      } else {
        renderer.render(scene, camera);
      }

      // Start animation
      if (!prefersReduced) {
        animate();
      }

      return () => {
        isDisposedRef.current = true;
        cancelAnimationFrame(frameIdRef.current);
        ro.disconnect();
        
        onDispose?.();
        disposeScene(scene);
        renderer.dispose();
        
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }

        sceneRef.current = null;
        cameraRef.current = null;
        rendererRef.current = null;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    containerRef,
    sceneRef,
    cameraRef,
    rendererRef,
  };
}

function disposeMaterial(material: THREE.Material) {
  material.dispose();
  
  // Dispose textures
  const mat = material as THREE.MeshStandardMaterial;
  if (mat.map) mat.map.dispose();
  if (mat.normalMap) mat.normalMap.dispose();
  if (mat.roughnessMap) mat.roughnessMap.dispose();
  if (mat.metalnessMap) mat.metalnessMap.dispose();
  if (mat.aoMap) mat.aoMap.dispose();
  if (mat.emissiveMap) mat.emissiveMap.dispose();
  if (mat.envMap) mat.envMap.dispose();
}

/**
 * Check if WebGL is available
 */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Check if device is likely mobile (for performance decisions)
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768;
}
