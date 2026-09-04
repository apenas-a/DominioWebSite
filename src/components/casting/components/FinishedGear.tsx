import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  castingState,
  phaseProgress,
  easeInOut,
  easeOut,
  lerp,
} from '@/components/casting/CastingTimeline';
import {
  createGearGeometry,
  DEFAULT_GEAR_PARAMS,
} from '@/components/casting/geometry/createGearShape';
import { gearCastingShader } from '@/components/casting/shaders/moltenShaders';

/* ─────────────────────────────────────────────────────────────
   Dynamic Molten & Solidifying Gear Mesh (Refs. 15, 16, 17)
   
   Melhorias:
   1. Alinhamento exato com o leito da cavidade de areia em Y = 0.71.
   2. Preenchimento dente por dente com malha líquida incandescente
      reativa ao scroll (Stage 09 e 10: 0.585 -> 0.73).
   3. Shader de temperatura: transiciona gradualmente de ~1400°C
      (incandescente com bloom) para vermelho fosco e aço grafite (Ref. 17).
   4. Extração suave e rotação final de apresentação (Stage 14 e 15).
───────────────────────────────────────────────────────────── */

const CAVITY_Y = 0.71;

export default function FinishedGear() {
  const meshRef = useRef<THREE.Mesh>(null);
  const gearLightRef = useRef<THREE.PointLight>(null);
  const continuousRotation = useRef(0);

  const geometry = useMemo(() => createGearGeometry(DEFAULT_GEAR_PARAMS), []);

  const gearShaderMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: gearCastingShader.uniforms(),
        vertexShader: gearCastingShader.vertexShader,
        fragmentShader: gearCastingShader.fragmentShader,
        transparent: true,
        depthWrite: true,
        side: THREE.DoubleSide,
      }),
    []
  );

  useFrame(({ clock }) => {
    const p = castingState.progress;
    const mesh = meshRef.current;
    if (!mesh) return;

    // Invisible before ladle starts pouring into sprue
    if (p < 0.585) {
      mesh.visible = false;
      if (gearLightRef.current) gearLightRef.current.intensity = 0;
      return;
    }

    mesh.visible = true;

    // 1. Spatial Kinematics (in cavity at Y = 0.71, extracts at p >= 0.94)
    let posX = 0;
    let posY = CAVITY_Y;
    let posZ = 0;
    let rotY = 0;

    if (p < 0.94) {
      posX = 0;
      posY = CAVITY_Y;
      posZ = 0;
      rotY = 0;
    } else if (p <= 0.96) {
      const t = (p - 0.94) / 0.02;
      posY = lerp(CAVITY_Y, 2.5, easeOut(t));
    } else if (p <= 0.98) {
      const t = (p - 0.96) / 0.02;
      posX = lerp(0, 3, easeInOut(t));
      posY = lerp(2.5, 1.5, t);
    } else {
      posX = 3;
      posY = 1.5;
      continuousRotation.current += 0.01;
      rotY = continuousRotation.current;
    }

    mesh.position.set(posX, posY, posZ);
    mesh.rotation.y = rotY;

    // 2. Tooth-by-Tooth Fill Progression (Ref. 16: 0.59 -> 0.70)
    let fillProgress = 0;
    if (p < 0.59) {
      fillProgress = 0;
    } else if (p <= 0.70) {
      // Linear fill with scroll as metal pours from sprue
      fillProgress = THREE.MathUtils.clamp((p - 0.59) / (0.70 - 0.59), 0.001, 1.0);
    } else {
      // Fully filled cavity
      fillProgress = 1.0;
    }

    // 3. Thermal Shader Cooling Progression (Ref. 17: 0.75 -> 0.82)
    let temperature = 1.0;
    if (p < 0.75) {
      // White/yellow hot ~1400°C during pouring and ignition
      temperature = 1.0;
    } else if (p <= 0.82) {
      // Stage 11 (Ref. 17): Cools smoothly from 1400°C -> dull red -> 25°C
      const coolingT = phaseProgress(p, 'COOLING');
      temperature = lerp(1.0, 0.0, easeInOut(coolingT));
    } else {
      // Fully cooled solid iron
      temperature = 0.0;
    }

    // Update Shader Uniforms
    gearShaderMat.uniforms.uTime.value = clock.getElapsedTime();
    gearShaderMat.uniforms.uFillProgress.value = fillProgress;
    gearShaderMat.uniforms.uTemperature.value = temperature;

    // 4. Reactive Radiant Thermal Point Light
    if (gearLightRef.current) {
      if (p >= 0.585 && p <= 0.82) {
        gearLightRef.current.position.set(posX, posY + 0.25, posZ);
        const flicker = 0.90 + Math.sin(clock.getElapsedTime() * 20.0) * 0.10;
        gearLightRef.current.intensity = fillProgress * temperature * 9.0 * flicker;
      } else {
        gearLightRef.current.intensity = 0;
      }
    }
  });

  return (
    <>
      <mesh ref={meshRef} geometry={geometry} material={gearShaderMat} renderOrder={5} />
      <pointLight
        ref={gearLightRef}
        color="#ff6600"
        distance={8.0}
        decay={2}
        intensity={0}
      />
    </>
  );
}


