import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { castingState, lerp, smoothstep } from '@/components/casting/CastingTimeline';

const KEYFRAMES = [
  { p: 0.00, pos: [5.5, 6.5, 6.5],  target: [0, 0.6, 0] },     // Stage 01 — looking down at open mold
  { p: 0.04, pos: [4.5, 5.5, 6.0],  target: [0, 0.8, 0] },     // slight push in
  { p: 0.10, pos: [4.5, 4.5, 6.0],  target: [0, 0.6, 0] },     // close start
  { p: 0.17, pos: [5, 4.5, 7],      target: [0, 1.2, 0] },
  { p: 0.23, pos: [4.2, 5.2, 6.2],  target: [-0.2, 1.4, 0] },   // Stage 04: clear overhead view into hollow furnace
  { p: 0.30, pos: [4.0, 4.6, 5.8],  target: [-0.1, 1.4, 0] },   // Stage 05: smooth view of rising molten metal
  { p: 0.38, pos: [4.2, 3.8, 6.0],  target: [0.2, 1.3, 0] },    // Stage 06: tilt view showing both furnace and ladle
  { p: 0.46, pos: [4.5, 3.4, 5.8],  target: [0.5, 1.1, 0] },    // Stage 07: pouring stream into ladle
  { p: 0.55, pos: [4.8, 3.8, 5.8],  target: [0.6, 1.8, 0] },    // Stage 08: panela alinhada sobre o sprue (X=1.0)
  { p: 0.60, pos: [4.4, 3.3, 5.2],  target: [0.4, 1.2, 0] },    // Stage 09a: início do vazamento e transição para raio-X
  { p: 0.66, pos: [3.9, 2.8, 4.7],  target: [0.2, 0.85, 0] },   // Stage 09b: inspeção raio-x do preenchimento dente a dente
  { p: 0.72, pos: [3.7, 2.6, 4.5],  target: [0.1, 0.85, 0] },   // Stage 10: preenchimento completo e ignição nos risers
  { p: 0.78, pos: [4.2, 3.0, 5.0],  target: [0.0, 0.80, 0] },   // Stage 11: resfriamento no molde transparente
  { p: 0.85, pos: [5.2, 4.8, 6.2],  target: [0.0, 0.80, 0] },   // Stage 12: abertura do molde revelando a peça
  { p: 0.92, pos: [4.5, 3.0, 5.0],  target: [0.0, 0.50, 0] },   // Stage 13: peça sólida na cavidade
  { p: 0.96, pos: [5.0, 3.0, 5.5],  target: [2.0, 1.20, 0] },   // Stage 14: extração vertical da peça
  { p: 1.00, pos: [4.5, 2.5, 5.0],  target: [3.0, 1.50, 0] },   // Stage 15: produto final
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
