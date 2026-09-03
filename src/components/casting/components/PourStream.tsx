import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { castingState } from '@/components/casting/CastingTimeline';
import { usePourPoints } from '@/components/casting/CastingContext';
import { pourStreamShader } from '@/components/casting/shaders/moltenShaders';

/* ─────────────────────────────────────────────────────────────
   Incandescent Molten Pour Stream (Fluxo de Metal Líquido)
   
   Features:
   • Mathematically exact alignment from spout lip to ladle center
     using quaternion orientation between src and tgt.
   • Stream 1: Furnace -> Ladle (active during FURNACE_POUR: 0.42 - 0.50)
   • Stream 2: Ladle -> Mold Sprue (active during LADLE_POUR: 0.59 - 0.67)
   • Dynamic thickness and glowing incandescence shader
   • Splash point light at impact target for realistic illumination
───────────────────────────────────────────────────────────── */

export default function PourStream() {
  const stream1Ref = useRef<THREE.Mesh>(null);
  const stream2Ref = useRef<THREE.Mesh>(null);
  const splashLight1Ref = useRef<THREE.PointLight>(null);
  const splashLight2Ref = useRef<THREE.PointLight>(null);
  const pourPoints = usePourPoints();

  // ── Shaders ────────────────────────────────────────────────
  const streamMaterial1 = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: pourStreamShader.uniforms(),
        vertexShader: pourStreamShader.vertexShader,
        fragmentShader: pourStreamShader.fragmentShader,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  );

  const streamMaterial2 = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: pourStreamShader.uniforms(),
        vertexShader: pourStreamShader.vertexShader,
        fragmentShader: pourStreamShader.fragmentShader,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  );

  // Centered cylinder of height 1.0 (aligned with Y axis)
  const streamGeom = useMemo(() => {
    // Slightly tapered top (spout) to bottom (impact)
    return new THREE.CylinderGeometry(0.055, 0.08, 1.0, 16, 16);
  }, []);

  const vDir = useMemo(() => new THREE.Vector3(), []);
  const vMid = useMemo(() => new THREE.Vector3(), []);
  const upVec = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useFrame(({ clock }) => {
    const p = castingState.progress;
    const time = clock.getElapsedTime();

    // ═══ 1. FURNACE -> LADLE STREAM (Stage 07: 0.42 to 0.50) ═══
    if (p >= 0.42 && p <= 0.50) {
      if (stream1Ref.current) {
        stream1Ref.current.visible = true;
        const src = pourPoints.furnaceSpout.current;
        const tgt = pourPoints.ladleFill.current;

        const dist = src.distanceTo(tgt);
        if (dist > 0.1) {
          // Midpoint
          vMid.addVectors(src, tgt).multiplyScalar(0.5);
          stream1Ref.current.position.copy(vMid);

          // Direction from bottom (tgt) to top (src) so cylinder aligns with +Y
          vDir.subVectors(src, tgt).normalize();
          stream1Ref.current.quaternion.setFromUnitVectors(upVec, vDir);

          // Flow start/end tapering
          let scaleFactor = 1.0;
          if (p < 0.43) {
            scaleFactor = (p - 0.42) / 0.01; // smooth expansion
          } else if (p > 0.49) {
            scaleFactor = (0.50 - p) / 0.01; // smooth cutoff
          }
          scaleFactor = THREE.MathUtils.clamp(scaleFactor, 0.1, 1.0);

          stream1Ref.current.scale.set(scaleFactor * 1.3, dist, scaleFactor * 1.3);

          streamMaterial1.uniforms.uTime.value = time;
          streamMaterial1.uniforms.uOpacity.value = scaleFactor;

          // Splash point light at ladle entry
          if (splashLight1Ref.current) {
            splashLight1Ref.current.position.copy(tgt);
            splashLight1Ref.current.intensity = scaleFactor * 7.5;
          }
        }
      }
    } else {
      if (stream1Ref.current) stream1Ref.current.visible = false;
      if (splashLight1Ref.current) splashLight1Ref.current.intensity = 0;
    }

    // ═══ 2. LADLE -> MOLD STREAM (Stage 09: 0.59 to 0.67) ══════
    if (p >= 0.59 && p <= 0.67) {
      if (stream2Ref.current) {
        stream2Ref.current.visible = true;
        const src = pourPoints.ladleSpout.current;
        const tgt = pourPoints.moldSprue.current;

        const dist = src.distanceTo(tgt);
        if (dist > 0.1) {
          vMid.addVectors(src, tgt).multiplyScalar(0.5);
          stream2Ref.current.position.copy(vMid);

          vDir.subVectors(src, tgt).normalize();
          stream2Ref.current.quaternion.setFromUnitVectors(upVec, vDir);

          let scaleFactor = 1.0;
          if (p < 0.60) {
            scaleFactor = (p - 0.59) / 0.01;
          } else if (p > 0.66) {
            scaleFactor = (0.67 - p) / 0.01;
          }
          scaleFactor = THREE.MathUtils.clamp(scaleFactor, 0.1, 1.0);

          stream2Ref.current.scale.set(scaleFactor * 1.2, dist, scaleFactor * 1.2);

          streamMaterial2.uniforms.uTime.value = time;
          streamMaterial2.uniforms.uOpacity.value = scaleFactor;

          if (splashLight2Ref.current) {
            splashLight2Ref.current.position.copy(tgt);
            splashLight2Ref.current.intensity = scaleFactor * 6.0;
          }
        }
      }
    } else {
      if (stream2Ref.current) stream2Ref.current.visible = false;
      if (splashLight2Ref.current) splashLight2Ref.current.intensity = 0;
    }
  });

  return (
    <>
      <mesh
        ref={stream1Ref}
        geometry={streamGeom}
        material={streamMaterial1}
        visible={false}
      />
      <pointLight
        ref={splashLight1Ref}
        color="#ff7700"
        distance={8}
        decay={2}
        intensity={0}
      />

      <mesh
        ref={stream2Ref}
        geometry={streamGeom}
        material={streamMaterial2}
        visible={false}
      />
      <pointLight
        ref={splashLight2Ref}
        color="#ff6600"
        distance={7}
        decay={2}
        intensity={0}
      />
    </>
  );
}
