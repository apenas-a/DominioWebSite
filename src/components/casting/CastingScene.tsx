import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CastingProvider } from './CastingContext';
import { castingState } from './CastingTimeline';
import MoldAssembly from './components/MoldAssembly';
import Furnace from './components/Furnace';
import PouringLadle from './components/PouringLadle';
import PourStream from './components/PourStream';
import CameraRig from './components/CameraRig';
import MoldIgnitionParticles from './components/MoldIgnitionParticles';
import FinishedGear from './components/FinishedGear';
import SceneLighting from './components/SceneLighting';

interface CastingSceneProps {
  progressRef: React.MutableRefObject<number>;
  debug?: boolean;
}

export default function CastingScene({ progressRef, debug = false }: CastingSceneProps) {
  // Sync scroll progress to shared castingState every frame
  useFrame(() => {
    castingState.progress = progressRef.current;
    castingState.debug = debug;
  });

  return (
    <CastingProvider>
      <CameraRig />
      <SceneLighting />
      
      <MoldAssembly debugFlow={debug} />
      <Furnace debugFlow={debug} />
      <PouringLadle debugFlow={debug} />
      <PourStream />
      <MoldIgnitionParticles />
      <FinishedGear />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#111114" roughness={0.9} metalness={0.3} />
      </mesh>
      
      {/* Grid */}
      <gridHelper args={[60, 40, '#441808', '#1a1d24']} position={[0, -0.49, 0]} />
    </CastingProvider>
  );
}
