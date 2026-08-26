import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { castingState } from '@/components/casting/CastingTimeline';
import { usePourPoints } from '@/components/casting/CastingContext';
import { pourStreamShader } from '@/components/casting/shaders/moltenShaders';

export default function PourStream() {
  const stream1Ref = useRef<THREE.Mesh>(null);
  const stream2Ref = useRef<THREE.Mesh>(null);
  const pourPoints = usePourPoints();
  
  const streamMaterial1 = useMemo(() => new THREE.ShaderMaterial({
    uniforms: pourStreamShader.uniforms(),
    vertexShader: pourStreamShader.vertexShader,
    fragmentShader: pourStreamShader.fragmentShader,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  }), []);
  const streamMaterial2 = useMemo(() => new THREE.ShaderMaterial({
    uniforms: pourStreamShader.uniforms(),
    vertexShader: pourStreamShader.vertexShader,
    fragmentShader: pourStreamShader.fragmentShader,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  }), []);
  
  const geometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.06, 0.08, 1, 8, 16);
    geo.translate(0, -0.5, 0); // Origin at top
    return geo;
  }, []);

  useFrame(({ clock }) => {
    const p = castingState.progress;
    
    // Furnace to Ladle
    if (p >= 0.44 && p <= 0.49) {
      if (stream1Ref.current) {
        stream1Ref.current.visible = true;
        const src = pourPoints.furnaceSpout.current;
        const tgt = pourPoints.ladleFill.current;
        
        stream1Ref.current.position.copy(src);
        stream1Ref.current.lookAt(tgt);
        stream1Ref.current.rotateX(Math.PI / 2);
        
        const dist = src.distanceTo(tgt);
        stream1Ref.current.scale.set(1, dist, 1);
        
        streamMaterial1.uniforms.uTime.value = clock.getElapsedTime();
      }
    } else {
      if (stream1Ref.current) stream1Ref.current.visible = false;
    }

    // Ladle to Mold
    if (p >= 0.60 && p <= 0.67) {
      if (stream2Ref.current) {
        stream2Ref.current.visible = true;
        const src = pourPoints.ladleSpout.current;
        const tgt = pourPoints.moldSprue.current;
        
        stream2Ref.current.position.copy(src);
        stream2Ref.current.lookAt(tgt);
        stream2Ref.current.rotateX(Math.PI / 2);
        
        const dist = src.distanceTo(tgt);
        stream2Ref.current.scale.set(1, dist, 1);
        
        streamMaterial2.uniforms.uTime.value = clock.getElapsedTime();
      }
    } else {
      if (stream2Ref.current) stream2Ref.current.visible = false;
    }
  });

  return (
    <>
      <mesh ref={stream1Ref} geometry={geometry} material={streamMaterial1} visible={false} />
      <mesh ref={stream2Ref} geometry={geometry} material={streamMaterial2} visible={false} />
    </>
  );
}
