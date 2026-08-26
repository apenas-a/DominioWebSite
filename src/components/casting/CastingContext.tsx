import { createContext, useContext, useRef } from 'react';
import * as THREE from 'three';

export interface PourPoints {
  furnaceSpout: React.MutableRefObject<THREE.Vector3>;
  ladleFill: React.MutableRefObject<THREE.Vector3>;
  ladleSpout: React.MutableRefObject<THREE.Vector3>;
  moldSprue: React.MutableRefObject<THREE.Vector3>;
}

const CastingCtx = createContext<PourPoints | null>(null);

export function usePourPoints(): PourPoints {
  const ctx = useContext(CastingCtx);
  if (!ctx) throw new Error('usePourPoints must be used within CastingProvider');
  return ctx;
}

export function CastingProvider({ children }: { children: React.ReactNode }) {
  const pourPoints: PourPoints = {
    furnaceSpout: useRef(new THREE.Vector3(25, 2.5, 0)),
    ladleFill: useRef(new THREE.Vector3(25, 0, 0)),
    ladleSpout: useRef(new THREE.Vector3(25, 0, 0)),
    moldSprue: useRef(new THREE.Vector3(0, 2.5, 0)),
  };

  return <CastingCtx.Provider value={pourPoints}>{children}</CastingCtx.Provider>;
}
