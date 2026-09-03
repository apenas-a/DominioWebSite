import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { castingState } from '@/components/casting/CastingTimeline';
import { usePourPoints } from '@/components/casting/CastingContext';
import { pourStreamShader } from '@/components/casting/shaders/moltenShaders';

/* ─────────────────────────────────────────────────────────────
   Incandescent Molten Pour Stream (Fluxo Fino e Controlado)
   
   Melhorias:
   • Fluxo fino e controlado (Ref. 10 e 11) saindo do bico do forno.
   • Sincronização exata com o basculamento do forno (0.42 a 0.485).
   • Fluxo panela -> molde perfeitamente direcionado ao sprue (0.585 a 0.67).
   • Orientação por quatérnion exato e iluminação pontual de impacto.
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

  // Fine, controlled industrial stream (delicate and precise, not a thick block)
  const stream1Geom = useMemo(() => {
    return new THREE.CylinderGeometry(0.026, 0.040, 1.0, 16, 16);
  }, []);

  const stream2Geom = useMemo(() => {
    return new THREE.CylinderGeometry(0.028, 0.042, 1.0, 16, 16);
  }, []);

  const vDir = useMemo(() => new THREE.Vector3(), []);
  const vMid = useMemo(() => new THREE.Vector3(), []);
  const upVec = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useFrame(({ clock }) => {
    const p = castingState.progress;
    const time = clock.getElapsedTime();

    // ═══ 1. FURNACE -> LADLE STREAM (Stage 07: 0.42 to 0.485) ═══
    if (p >= 0.42 && p <= 0.485) {
      if (stream1Ref.current) {
        stream1Ref.current.visible = true;
        const src = pourPoints.furnaceSpout.current;
        const tgt = pourPoints.ladleFill.current;

        const dist = src.distanceTo(tgt);
        if (dist > 0.05) {
          vMid.addVectors(src, tgt).multiplyScalar(0.5);
          stream1Ref.current.position.copy(vMid);

          // Vector from target to source aligns cylinder along +Y
          vDir.subVectors(src, tgt).normalize();
          stream1Ref.current.quaternion.setFromUnitVectors(upVec, vDir);

          // Smooth entry and exit tapering
          let scaleFactor = 1.0;
          if (p < 0.43) {
            scaleFactor = (p - 0.42) / 0.01;
          } else if (p > 0.475) {
            scaleFactor = (0.485 - p) / 0.01;
          }
          scaleFactor = THREE.MathUtils.clamp(scaleFactor, 0.1, 1.0);

          stream1Ref.current.scale.set(scaleFactor, dist, scaleFactor);

          streamMaterial1.uniforms.uTime.value = time;
          streamMaterial1.uniforms.uOpacity.value = scaleFactor;

          // Splash point light at ladle entry
          if (splashLight1Ref.current) {
            splashLight1Ref.current.position.copy(tgt);
            splashLight1Ref.current.intensity = scaleFactor * 8.0;
          }
        }
      }
    } else {
      if (stream1Ref.current) stream1Ref.current.visible = false;
      if (splashLight1Ref.current) splashLight1Ref.current.intensity = 0;
    }

    // ═══ 2. LADLE -> MOLD STREAM (Stage 09: 0.585 to 0.67) ═════
    if (p >= 0.585 && p <= 0.67) {
      if (stream2Ref.current) {
        stream2Ref.current.visible = true;
        const src = pourPoints.ladleSpout.current;
        const tgt = pourPoints.moldSprue.current;

        const dist = src.distanceTo(tgt);
        if (dist > 0.05) {
          vMid.addVectors(src, tgt).multiplyScalar(0.5);
          stream2Ref.current.position.copy(vMid);

          vDir.subVectors(src, tgt).normalize();
          stream2Ref.current.quaternion.setFromUnitVectors(upVec, vDir);

          let scaleFactor = 1.0;
          if (p < 0.595) {
            scaleFactor = (p - 0.585) / 0.01;
          } else if (p > 0.66) {
            scaleFactor = (0.67 - p) / 0.01;
          }
          scaleFactor = THREE.MathUtils.clamp(scaleFactor, 0.1, 1.0);

          stream2Ref.current.scale.set(scaleFactor, dist, scaleFactor);

          streamMaterial2.uniforms.uTime.value = time;
          streamMaterial2.uniforms.uOpacity.value = scaleFactor;

          if (splashLight2Ref.current) {
            splashLight2Ref.current.position.copy(tgt);
            splashLight2Ref.current.intensity = scaleFactor * 7.0;
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
        geometry={stream1Geom}
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
        geometry={stream2Geom}
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
