import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { castingState } from '@/components/casting/CastingTimeline';
import { usePourPoints } from '@/components/casting/CastingContext';
import { pourStreamShader } from '@/components/casting/shaders/moltenShaders';

/* ─────────────────────────────────────────────────────────────
   Incandescent Molten Pour Stream & Dynamic Particle Systems
   (Ref. 15 — Vazamento Dinâmico no Molde)
   
   Melhorias:
   1. Malha líquida incandescente com afunilamento físico (gravidade).
   2. Sistema de partículas de fluido: gotículas e faíscas incandescentes
      jorrando em alta velocidade ao longo do fluxo do bico ao sprue.
   3. Emissor de respingos (splash/impact) no bocal do canal de alimentação,
      com partículas em dispersão radial e luz pulsante de impacto.
───────────────────────────────────────────────────────────── */

const NUM_STREAM_PARTICLES = 75;
const NUM_SPLASH_PARTICLES = 45;

export default function PourStream() {
  const stream1Ref = useRef<THREE.Mesh>(null);
  const stream2Ref = useRef<THREE.Mesh>(null);
  const streamParticlesRef = useRef<THREE.Points>(null);
  const splashParticlesRef = useRef<THREE.Points>(null);
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

  // Controlled stream from furnace (Stage 07)
  const stream1Geom = useMemo(() => {
    return new THREE.CylinderGeometry(0.026, 0.040, 1.0, 16, 16);
  }, []);

  // Tapered fluid geometry: wider at ladle spout (0.046), narrows at bottom sprue entry (0.025)
  const stream2Geom = useMemo(() => {
    const geom = new THREE.CylinderGeometry(0.046, 0.025, 1.0, 20, 24);
    return geom;
  }, []);

  // ── Particle Systems Geometries & State ─────────────────────
  // 1. Flowing Stream Particles
  const { streamParticlesGeom, streamParticleData } = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(NUM_STREAM_PARTICLES * 3);
    const colors = new Float32Array(NUM_STREAM_PARTICLES * 3);
    const data: { progress: number; speed: number; offsetR: number; offsetAngle: number }[] = [];

    const cWhite = new THREE.Color('#ffffff');
    const cOrange = new THREE.Color('#ff7700');
    const cRed = new THREE.Color('#ff2200');

    for (let i = 0; i < NUM_STREAM_PARTICLES; i++) {
      const progress = Math.random();
      const speed = 1.2 + Math.random() * 1.8;
      const offsetR = 0.01 + Math.random() * 0.025;
      const offsetAngle = Math.random() * Math.PI * 2;
      data.push({ progress, speed, offsetR, offsetAngle });

      // Color gradient: white-hot at top, fiery orange in middle, glowing red-orange at bottom
      const col = progress < 0.4 ? cWhite.clone().lerp(cOrange, progress / 0.4) : cOrange.clone().lerp(cRed, (progress - 0.4) / 0.6);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return { streamParticlesGeom: geom, streamParticleData: data };
  }, []);

  // 2. Splash / Spark Particles at Sprue Mouth
  const { splashParticlesGeom, splashParticleData } = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(NUM_SPLASH_PARTICLES * 3);
    const colors = new Float32Array(NUM_SPLASH_PARTICLES * 3);
    const data: { pos: THREE.Vector3; vel: THREE.Vector3; life: number; maxLife: number }[] = [];

    const cYellow = new THREE.Color('#fff280');
    const cOrange = new THREE.Color('#ff5500');

    for (let i = 0; i < NUM_SPLASH_PARTICLES; i++) {
      data.push({
        pos: new THREE.Vector3(0, 0, 0),
        vel: new THREE.Vector3(0, 0, 0),
        life: 1.0,
        maxLife: 0.25 + Math.random() * 0.35,
      });

      const col = cYellow.clone().lerp(cOrange, Math.random());
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return { splashParticlesGeom: geom, splashParticleData: data };
  }, []);

  const particleMat = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  const splashMat = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.90,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  const vDir = useMemo(() => new THREE.Vector3(), []);
  const vMid = useMemo(() => new THREE.Vector3(), []);
  const upVec = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useFrame(({ clock }, delta) => {
    const p = castingState.progress;
    const time = clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);

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

          vDir.subVectors(src, tgt).normalize();
          stream1Ref.current.quaternion.setFromUnitVectors(upVec, vDir);

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

    // ═══ 2. LADLE -> MOLD STREAM & PARTICLES (Ref. 15: 0.585 to 0.675) ═════
    const isLadlePouring = p >= 0.585 && p <= 0.675;

    if (isLadlePouring) {
      const src = pourPoints.ladleSpout.current;
      const tgt = pourPoints.moldSprue.current;
      const dist = src.distanceTo(tgt);

      // Tapering factor on start/finish of pour
      let scaleFactor = 1.0;
      if (p < 0.595) {
        scaleFactor = (p - 0.585) / 0.01;
      } else if (p > 0.665) {
        scaleFactor = (0.675 - p) / 0.01;
      }
      scaleFactor = THREE.MathUtils.clamp(scaleFactor, 0.05, 1.0);

      // ── A. Dynamic Fluid Stream Mesh ──
      if (stream2Ref.current && dist > 0.04) {
        stream2Ref.current.visible = true;
        vMid.addVectors(src, tgt).multiplyScalar(0.5);
        stream2Ref.current.position.copy(vMid);

        vDir.subVectors(src, tgt).normalize();
        stream2Ref.current.quaternion.setFromUnitVectors(upVec, vDir);

        stream2Ref.current.scale.set(scaleFactor, dist, scaleFactor);

        streamMaterial2.uniforms.uTime.value = time;
        streamMaterial2.uniforms.uOpacity.value = scaleFactor;
      }

      // ── B. Stream Droplet Particles ──
      if (streamParticlesRef.current) {
        streamParticlesRef.current.visible = true;
        const posAttr = streamParticlesGeom.attributes.position as THREE.BufferAttribute;
        const posArr = posAttr.array as Float32Array;

        for (let i = 0; i < NUM_STREAM_PARTICLES; i++) {
          const item = streamParticleData[i];
          // Gravity acceleration along path
          item.progress += (item.speed + item.progress * 2.0) * dt;
          if (item.progress > 1.0) {
            item.progress = Math.random() * 0.08;
            item.offsetAngle = Math.random() * Math.PI * 2;
          }

          // Interpolated point along streamline
          const t = item.progress;
          const px = THREE.MathUtils.lerp(src.x, tgt.x, t);
          const py = THREE.MathUtils.lerp(src.y, tgt.y, t);
          const pz = THREE.MathUtils.lerp(src.z, tgt.z, t);

          // Stream cross section radius narrows as it accelerates
          const currentR = item.offsetR * (1.0 - t * 0.55);
          const jitterX = Math.cos(item.offsetAngle) * currentR;
          const jitterZ = Math.sin(item.offsetAngle) * currentR;

          posArr[i * 3] = px + jitterX;
          posArr[i * 3 + 1] = py;
          posArr[i * 3 + 2] = pz + jitterZ;
        }
        posAttr.needsUpdate = true;
        particleMat.opacity = scaleFactor * 0.95;
      }

      // ── C. Splash & Sparks at Sprue Funnel Entry ──
      if (splashParticlesRef.current) {
        splashParticlesRef.current.visible = true;
        const posAttr = splashParticlesGeom.attributes.position as THREE.BufferAttribute;
        const posArr = posAttr.array as Float32Array;

        for (let i = 0; i < NUM_SPLASH_PARTICLES; i++) {
          const item = splashParticleData[i];
          item.life += dt;

          if (item.life >= item.maxLife) {
            item.life = 0;
            item.pos.copy(tgt);
            // Spawn radially outward and slightly upward
            const angle = Math.random() * Math.PI * 2;
            const spd = 0.4 + Math.random() * 1.1;
            item.vel.set(
              Math.cos(angle) * spd,
              0.6 + Math.random() * 0.9,
              Math.sin(angle) * spd
            );
          } else {
            // Apply physics: gravity and movement
            item.vel.y -= 4.8 * dt;
            item.pos.x += item.vel.x * dt;
            item.pos.y += item.vel.y * dt;
            item.pos.z += item.vel.z * dt;
          }

          posArr[i * 3] = item.pos.x;
          posArr[i * 3 + 1] = item.pos.y;
          posArr[i * 3 + 2] = item.pos.z;
        }
        posAttr.needsUpdate = true;
        splashMat.opacity = scaleFactor * 0.85;
      }

      // ── D. High-Temperature Reactive Impact Light ──
      if (splashLight2Ref.current) {
        splashLight2Ref.current.position.copy(tgt);
        const flicker = 0.85 + Math.sin(time * 38.0) * 0.15;
        splashLight2Ref.current.intensity = scaleFactor * 8.5 * flicker;
      }
    } else {
      if (stream2Ref.current) stream2Ref.current.visible = false;
      if (streamParticlesRef.current) streamParticlesRef.current.visible = false;
      if (splashParticlesRef.current) splashParticlesRef.current.visible = false;
      if (splashLight2Ref.current) splashLight2Ref.current.intensity = 0;
    }
  });

  return (
    <>
      {/* Furnace -> Ladle Stream */}
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

      {/* Ladle -> Mold Sprue Stream (Ref. 15) */}
      <mesh
        ref={stream2Ref}
        geometry={stream2Geom}
        material={streamMaterial2}
        visible={false}
      />

      {/* Flowing Molten Droplets Particles */}
      <points
        ref={streamParticlesRef}
        geometry={streamParticlesGeom}
        material={particleMat}
        visible={false}
      />

      {/* Impact Sparks & Splash Emitter at Sprue Funnel */}
      <points
        ref={splashParticlesRef}
        geometry={splashParticlesGeom}
        material={splashMat}
        visible={false}
      />

      {/* Reactive Sprue Impact Light */}
      <pointLight
        ref={splashLight2Ref}
        color="#ff5500"
        distance={7.5}
        decay={2}
        intensity={0}
      />
    </>
  );
}

