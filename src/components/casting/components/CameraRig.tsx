import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { castingState, lerp, smoothstep } from '@/components/casting/CastingTimeline';

const KEYFRAMES = [
  { p: 0.00, pos: [7, 5, 8],    target: [0, 0.5, 0] },
  { p: 0.04, pos: [6, 5, 7],    target: [0, 0.8, 0] },
  { p: 0.10, pos: [5.5, 4.5, 6.5], target: [0, 0.6, 0] },
  { p: 0.17, pos: [5, 4, 7],    target: [0, 1.0, 0] },
  { p: 0.23, pos: [5, 5, 7],    target: [0, 1.5, 0] },
  { p: 0.30, pos: [4, 4, 6],    target: [0, 1.2, 0] },
  { p: 0.38, pos: [4, 3.5, 6],  target: [-0.5, 1.5, 0] },
  { p: 0.46, pos: [5, 4, 7],    target: [0.5, 1.0, 0] },
  { p: 0.54, pos: [6, 5, 8],    target: [0, 1.2, 0] },
  { p: 0.63, pos: [4.5, 4, 6],  target: [0, 1.8, 0] },
  { p: 0.71, pos: [5, 4, 7],    target: [0, 0.5, 0] },
  { p: 0.78, pos: [5, 4, 7],    target: [0, 0.5, 0] },
  { p: 0.85, pos: [6, 5, 7],    target: [0, 0.8, 0] },
  { p: 0.92, pos: [4.5, 3, 5],  target: [0, 0.5, 0] },
  { p: 0.96, pos: [5, 3, 5.5],  target: [2, 1.2, 0] },
  { p: 1.00, pos: [4.5, 2.5, 5], target: [3, 1.5, 0] },
];

export default function CameraRig() {
  const { camera } = useThree();
  const currentTarget = useRef(new THREE.Vector3());
  
  const isMobile = useMemo(() => window.innerWidth < 768, []);

  useFrame(() => {
    const p = castingState.progress;
    
    let kf1 = KEYFRAMES[0];
    let kf2 = KEYFRAMES[KEYFRAMES.length - 1];
    
    for (let i = 0; i < KEYFRAMES.length - 1; i++) {
      if (p >= KEYFRAMES[i].p && p <= KEYFRAMES[i + 1].p) {
        kf1 = KEYFRAMES[i];
        kf2 = KEYFRAMES[i + 1];
        break;
      }
    }
    
    const range = kf2.p - kf1.p;
    let t = range > 0 ? (p - kf1.p) / range : 0;
    t = smoothstep(0, 1, t);
    
    let x = lerp(kf1.pos[0], kf2.pos[0], t);
    let y = lerp(kf1.pos[1], kf2.pos[1], t);
    let z = lerp(kf1.pos[2], kf2.pos[2], t);
    
    let tx = lerp(kf1.target[0], kf2.target[0], t);
    let ty = lerp(kf1.target[1], kf2.target[1], t);
    let tz = lerp(kf1.target[2], kf2.target[2], t);
    
    if (isMobile) {
      x *= 0.85;
      y = y * 0.85 + 1;
      z *= 0.85;
    }
    
    camera.position.set(x, y, z);
    currentTarget.current.set(tx, ty, tz);
    camera.lookAt(currentTarget.current);
  });

  return null;
}
