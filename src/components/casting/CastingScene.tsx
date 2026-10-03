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
import FoundryBackdrop from './components/FoundryBackdrop';
import MoltenEmbers from './components/MoltenEmbers';

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
      <FoundryBackdrop />
      
      <MoldAssembly debugFlow={debug} />
      <Furnace debugFlow={debug} />
      <PouringLadle debugFlow={debug} />
      <PourStream />
      <MoltenEmbers />
      <MoldIgnitionParticles />
      <FinishedGear />
      
    </CastingProvider>
  );
}
