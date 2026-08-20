import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import {
  Box,
  Flame,
  Droplets,
  Wrench,
  Sparkles,
  ChevronDown,
  Layers,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  Activity,
  FileCheck,
} from "lucide-react";
import { isMobileDevice } from "@/hooks/useThreeScene";

gsap.registerPlugin(ScrollTrigger);

// 5 Scrollytelling Stages Data
const STAGES = [
  {
    id: 1,
    number: "01",
    tag: "01. Moldagem & Areia",
    title: "Fechamento da Caixa de Moldagem",
    icon: Box,
    temp: "25 °C",
    material: "Areia Verde Sintética",
    description:
      "A engrenagem modelo conforma uma cavidade côncava perfeita na caixa de areia inferior (drag). A tampa superior (cope) desce e veda o conjunto com acabamento sólido de areia marrom e sprue centralizado.",
    highlights: [
      "Engrenagem 3D procedural posicionada na cavidade da base",
      "Compactação automatizada de areia verde sintética",
      "Tampa cope sólida marrom sem sobreposição visual de faces",
      "Bocal de alimentação (sprue) perfeitamente centralizado no topo",
    ],
  },
  {
    id: 2,
    number: "02",
    tag: "02. Fusão no Forno",
    title: "Aquecimento Uniforme no Forno de Indução",
    icon: Flame,
    temp: "1520 °C",
    material: "Ferro Nodular / Cinzento",
    description:
      "No forno de indução, a massa metálica ocupa todo o diâmetro do cadinho. Aquecida por bobinas de cobre até 1500°C, toda a superfície do caldo incandesce de forma homogênea e uniforme.",
    highlights: [
      "Malha de metal cobrindo 100% do diâmetro interno do cadinho",
      "Incandescência uniforme em toda a massa metálica (emissive #ff4400)",
      "PointLight centralizada abrangendo todo o interior do forno",
      "Efeito Bloom de pós-processamento para brilho térmico limpo",
    ],
  },
  {
    id: 3,
    number: "03",
    tag: "03. Sangria do Forno",
    title: "Basculamento e Preenchimento da Panela",
    icon: Droplets,
    temp: "1480 °C",
    material: "Inoculação na Concha",
    description:
      "O forno bascula pelo pivô do bico e descarrega o fluido incandescente no centro exato da abertura da panela. O nível interno da panela eleva-se progressivamente enquanto o caldo incandesce.",
    highlights: [
      "Centro da panela posicionado na projeção vertical do bico do forno",
      "Fluxo incandescente caindo no centro exato da abertura superior",
      "Elevação dinâmica do nível interno de metal na panela (scale.y)",
      "Inoculação direta para refino de grãos e nodularização",
    ],
  },
  {
    id: 4,
    number: "04",
    tag: "04. Vazamento no Molde",
    title: "Preenchimento da Cavidade do Molde",
    icon: Wrench,
    temp: "1420 °C",
    material: "Preenchimento Estanque",
    description:
      "A panela cheia desloca-se alinhando seu bico sobre o canal de alimentação do molde. Basculando pelo bico, vaza o fluido no sprue e a engrenagem dentro da cavidade aquece e incandesce.",
    highlights: [
      "Bico da panela alinhado exatamente sobre o sprue do molde",
      "Fluxo incandescente GLSL caindo no centro do canal de alimentação",
      "Respingos e faíscas incandescentes no impacto com a areia",
      "Aquecimento incandescente da engrenagem 3D dentro do molde",
    ],
  },
  {
    id: 5,
    number: "05",
    tag: "05. Controle de Qualidade",
    title: "Espectrometria SPECTROMAXx em Tempo Real",
    icon: Sparkles,
    temp: "25 °C / Amb.",
    material: "Certificação Espectrométrica",
    description:
      "Na bancada de ensaio 3D com o espectrômetro SPECTROMAXx, a amostra sofre um disparo de centelha azul elétrica. Os picos de leitura espectrométrica oscilam ao vivo no monitor, certificando 100% da liga.",
    highlights: [
      "Estação laboratorial 3D com espectrômetro SPECTROMAXx",
      "Arco de centelha azul elétrico (#00d4ff) durante o ensaio",
      "Gráfico de picos espectrométricos animado em tempo real via Canvas 2D",
      "Aprovação imediata de composição química (Fe, C, Si, Mn, Cr)",
    ],
  },
];

// ============================================================================
// 1. MODULAR 3D MODEL GENERATORS (Pivots & Precise Geometry)
// ============================================================================

/**
 * 1. O Molde (Caixa de Areia Bipartida com Cavidade Côncava e Engrenagem Procedural)
 */
function createMold() {
  const moldGroup = new THREE.Group();

  const sandMat = new THREE.MeshStandardMaterial({
    color: 0x5c4d3e, // Rich clean sand brown
    roughness: 0.95,
    metalness: 0.05,
  });

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x2b303a,
    roughness: 0.45,
    metalness: 0.85,
  });

  // Base / Fundo (Drag) com Cavidade Côncava Central
  const dragGroup = new THREE.Group();
  moldGroup.add(dragGroup);

  // Drag outer frame
  const dragFrame = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.18, 3.7), frameMat);
  dragFrame.position.y = 0.09;
  dragGroup.add(dragFrame);

  // Drag sand floor base
  const dragFloor = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 3.6), sandMat);
  dragFloor.position.y = 0.28;
  dragGroup.add(dragFloor);

  // Sand Cavity Walls forming a concave 1.8x1.8 center cavity
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 3.6), sandMat);
  leftWall.position.set(-1.35, 0.7, 0);
  dragGroup.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 3.6), sandMat);
  rightWall.position.set(1.35, 0.7, 0);
  dragGroup.add(rightWall);

  const frontWall = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 0.9), sandMat);
  frontWall.position.set(0, 0.7, 1.35);
  dragGroup.add(frontWall);

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 0.9), sandMat);
  backWall.position.set(0, 0.7, -1.35);
  dragGroup.add(backWall);

  // Tampa / Superior (Cope) - Solid 100% sand brown MeshStandardMaterial on ALL faces
  const moldTop = new THREE.Group();
  moldTop.position.y = 2.8; // Starts open in Stage 1
  moldGroup.add(moldTop);

  // Clean cope sand block (no overlapping geometry on top face)
  const copeSand = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.85, 3.6), sandMat);
  copeSand.position.y = 0.425;
  moldTop.add(copeSand);

  // Side-only steel frame around perimeter (open top so sand material stays 100% visible on top face)
  const sideFrameMat = frameMat;
  const fLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 3.7), sideFrameMat);
  fLeft.position.set(-1.81, 0.425, 0);
  moldTop.add(fLeft);

  const fRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 3.7), sideFrameMat);
  fRight.position.set(1.81, 0.425, 0);
  moldTop.add(fRight);

  const fFront = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.85, 0.08), sideFrameMat);
  fFront.position.set(0, 0.425, 1.81);
  moldTop.add(fFront);

  const fBack = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.85, 0.08), sideFrameMat);
  fBack.position.set(0, 0.425, -1.81);
  moldTop.add(fBack);

  // Sprue funnel cup (canal de alimentação) on top face at (0, 0.85, 0)
  const sprueFunnel = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.55, 24), sandMat);
  sprueFunnel.rotation.x = Math.PI;
  sprueFunnel.position.set(0, 1.125, 0);
  moldTop.add(sprueFunnel);

  const sprueLip = new THREE.Mesh(
    new THREE.TorusGeometry(0.43, 0.04, 12, 24),
    frameMat
  );
  sprueLip.rotation.x = Math.PI / 2;
  sprueLip.position.set(0, 1.4, 0);
  moldTop.add(sprueLip);

  // Engrenagem 3D Procedural no Interior da Cavidade
  const pieceMat = new THREE.MeshStandardMaterial({
    color: 0x3a404d, // Metallic industrial gray
    emissive: 0x000000,
    emissiveIntensity: 0,
    roughness: 0.4,
    metalness: 0.85,
  });

  const pieceGroup = new THREE.Group();
  pieceGroup.position.set(0, 0.65, 0);
  moldGroup.add(pieceGroup);

  // Cilindro central com furo
  const pieceHub = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.35, 32), pieceMat);
  pieceGroup.add(pieceHub);

  const pieceHole = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.38, 24), frameMat);
  pieceGroup.add(pieceHole);

  // 8 Dentes distribuídos radialmente
  for (let g = 0; g < 8; g++) {
    const angle = (g / 8) * Math.PI * 2;
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.35, 0.32), pieceMat);
    tooth.position.set(Math.cos(angle) * 1.2, 0, Math.sin(angle) * 1.2);
    tooth.rotation.y = -angle;
    pieceGroup.add(tooth);
  }

  return { moldGroup, moldTop, pieceGroup, pieceMat };
}

/**
 * 2. O Forno de Indução (Com Aquecimento Uniforme em Todo o Cadinho)
 * PIVÔ DA ROTAÇÃO: Posicionado no bico de despejo (top spout lip at 0,0,0)
 */
function createFurnace() {
  const furnacePivot = new THREE.Group(); // Pivot at spout lip (0, 0, 0)

  const furnaceBody = new THREE.Group();
  furnaceBody.position.set(-1.4, -1.2, 0);
  furnacePivot.add(furnaceBody);

  // Corpo Externo
  const outerBody = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.5, 2.4, 32),
    new THREE.MeshStandardMaterial({ color: 0x252932, roughness: 0.5, metalness: 0.85 })
  );
  furnaceBody.add(outerBody);

  // Bico de despejo at top edge
  const spout = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.28, 0.55),
    new THREE.MeshStandardMaterial({ color: 0x333846, roughness: 0.4, metalness: 0.85 })
  );
  spout.position.set(1.4, 1.2, 0);
  spout.rotation.z = -0.3;
  furnaceBody.add(spout);

  // Bobinas de Cobre
  const coilMat = new THREE.MeshStandardMaterial({
    color: 0xcd7f32,
    roughness: 0.2,
    metalness: 0.8,
  });

  for (let c = 0; c < 5; c++) {
    const coil = new THREE.Mesh(new THREE.TorusGeometry(1.58, 0.06, 16, 32), coilMat);
    coil.rotation.x = Math.PI / 2;
    coil.position.y = -0.7 + c * 0.32;
    furnaceBody.add(coil);
  }

  // Cadinho Interno (Parede Refratária oca com diâmetro interno 1.25)
  const refractoryLining = new THREE.Mesh(
    new THREE.CylinderGeometry(1.25, 1.25, 2.42, 32, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x424652, roughness: 0.9, metalness: 0.1 })
  );
  furnaceBody.add(refractoryLining);

  // Metal Interno - Disco que PREENCHE COMPLETAMENTE O DIÂMETRO INTERNO DO CADINHO (1.24)
  const furnaceMeltMat = new THREE.MeshStandardMaterial({
    color: 0x181a20,
    emissive: 0x000000,
    emissiveIntensity: 0,
    roughness: 0.1,
  });

  const furnaceMelt = new THREE.Mesh(new THREE.CylinderGeometry(1.24, 1.24, 0.15, 32), furnaceMeltMat);
  furnaceMelt.position.y = 1.0;
  furnaceBody.add(furnaceMelt);

  // PointLight interno no CENTRO EXATO do interior do forno (abrangendo toda a superfície)
  const furnaceLight = new THREE.PointLight(0xff4400, 0, 12.0);
  furnaceLight.position.set(0, 1.0, 0); // Positioned in center of crucible top
  furnaceBody.add(furnaceLight);

  return { furnacePivot, furnaceMeltMat, furnaceLight };
}

/**
 * 3. A Panela de Fundição (Ladle)
 * PIVÔ DA ROTAÇÃO: Posicionado no centro da abertura superior da panela (0,0,0)
 */
function createLadle() {
  const ladlePivot = new THREE.Group(); // Pivot at top opening center (0, 0, 0)

  const ladleBody = new THREE.Group();
  // Bucket center is at (0, -0.65, 0) so opening center is at local (0, 0, 0) of ladlePivot!
  ladleBody.position.set(0, -0.65, 0);
  ladlePivot.add(ladleBody);

  // Bucket - CylinderGeometry levemente cônico (radiusTop > radiusBottom)
  const bucket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.6, 1.3, 32),
    new THREE.MeshStandardMaterial({ color: 0x222730, roughness: 0.5, metalness: 0.85 })
  );
  ladleBody.add(bucket);

  // Spout lip extending to local (+0.7, +0.65, 0) relative to ladleBody center
  const ladleSpout = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.18, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x303644, roughness: 0.4, metalness: 0.85 })
  );
  ladleSpout.position.set(0.7, 0.65, 0);
  ladleSpout.rotation.z = -0.25;
  ladleBody.add(ladleSpout);

  // Eixos de Rotação / Suportes Laterais (Trunnions)
  const trunnions = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 1.9, 16),
    new THREE.MeshStandardMaterial({ color: 0x3a4050, roughness: 0.4, metalness: 0.9 })
  );
  trunnions.rotation.x = Math.PI / 2;
  trunnions.position.y = 0.22;
  ladleBody.add(trunnions);

  // Alça / Crane Bail Handle
  const bail = new THREE.Mesh(
    new THREE.TorusGeometry(0.9, 0.05, 8, 24, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x272c36, roughness: 0.4, metalness: 0.85 })
  );
  bail.position.y = 0.65;
  ladleBody.add(bail);

  // Nível do Metal Líquido dentro da panela (Cilindro com pivô na base para escala Y de 0 a 1)
  const ladleMeltMat = new THREE.MeshStandardMaterial({
    color: 0x181a20,
    emissive: 0x000000,
    emissiveIntensity: 0,
    roughness: 0.1,
  });

  const ladleMeltGeo = new THREE.CylinderGeometry(0.72, 0.58, 0.9, 32);
  ladleMeltGeo.translate(0, 0.45, 0); // Pivot at bottom of cylinder for vertical filling animation

  const ladleMelt = new THREE.Mesh(ladleMeltGeo, ladleMeltMat);
  ladleMelt.position.y = -0.45; // Placed at bottom of bucket
  ladleMelt.scale.set(1, 0, 1); // Initially empty (scale.y = 0)
  ladleBody.add(ladleMelt);

  // PointLight interno da panela em seu centro
  const ladleLight = new THREE.PointLight(0xff4400, 0, 10);
  ladleLight.position.set(0, 0.2, 0);
  ladlePivot.add(ladleLight);

  return { ladlePivot, ladleMelt, ladleMeltMat, ladleLight };
}

/**
 * 4. Fluido Incandescente Avançado (GLSL Shader Material)
 */
function createLiquidFlow(height: number) {
  const streamGeo = new THREE.CylinderGeometry(0.07, 0.1, height, 32, 40);
  // Pivot at top origin (0,0,0) for natural scaling downwards
  streamGeo.translate(0, -height / 2, 0);

  const streamMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorCore: { value: new THREE.Color("#ffffff") },
      uColorHot: { value: new THREE.Color("#ffaa00") },
      uColorMolten: { value: new THREE.Color("#ff4400") },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      uniform float uTime;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        vec3 pos = position;
        
        // Fluid wave oscillation along height
        float wave1 = sin(pos.y * 10.0 - uTime * 12.0) * 0.035;
        float wave2 = cos(pos.y * 16.0 + uTime * 14.0) * 0.025;
        
        float t = 1.0 - uv.y;
        pos.x += (wave1 + wave2) * t;
        pos.z += (wave2 - wave1) * t;

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorCore;
      uniform vec3 uColorHot;
      uniform vec3 uColorMolten;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;

      float rand(vec2 n) { 
        return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
      }

      void main() {
        vec2 st = vec2(vUv.x * 4.0, vUv.y * 10.0 - uTime * 8.0);
        float noise = rand(floor(st)) * 0.12;
        float streak = sin(vUv.y * 24.0 - uTime * 18.0 + vUv.x * 8.0) * 0.5 + 0.5;

        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.5);

        float coreFactor = smoothstep(0.45, 0.0, abs(vUv.x - 0.5));
        
        vec3 baseColor = mix(uColorMolten, uColorHot, streak + noise);
        baseColor = mix(baseColor, uColorCore, coreFactor * 0.9);

        // Emissive intensity multiplier > 4.0 triggers UnrealBloomPass for intense thermal bloom
        vec3 finalGlow = baseColor * (4.2 + fresnel * 3.0);

        gl_FragColor = vec4(finalGlow, 0.95);
      }
    `,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  });

  const streamMesh = new THREE.Mesh(streamGeo, streamMat);
  streamMesh.scale.set(0, 0, 0); // Initially hidden

  return { streamMesh, streamMat };
}

/**
 * 5. Sistema de Partículas (Faíscas e Respingos de Impacto)
 */
function createSparkSplashSystem() {
  const count = 160;
  const sparkGeo = new THREE.BufferGeometry();
  const sparkPositions = new Float32Array(count * 3);
  const sparkVelocities = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    sparkPositions[i] = 0;
    sparkPositions[i + 1] = 0;
    sparkPositions[i + 2] = 0;

    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 2.0;
    sparkVelocities[i] = Math.cos(angle) * speed * 0.6;
    sparkVelocities[i + 1] = 0.8 + Math.random() * 2.2;
    sparkVelocities[i + 2] = Math.sin(angle) * speed * 0.6;
  }

  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));

  const sparkMat = new THREE.PointsMaterial({
    color: 0xffaa00,
    size: 0.12,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });

  const sparkMesh = new THREE.Points(sparkGeo, sparkMat);

  return { sparkMesh, sparkGeo, sparkMat, sparkVelocities, count };
}

/**
 * 6. Estação de Controle de Qualidade / Espectrometria (SPECTROMAXx 3D Lab)
 */
function createLabStation() {
  const labGroup = new THREE.Group();

  // ----- 1. MESA / BANCADA LABORATORIAL -----
  const benchGroup = new THREE.Group();
  labGroup.add(benchGroup);

  // Bench top slab (Granite / Melamine)
  const benchTop = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 0.2, 3.4),
    new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.3, metalness: 0.1 })
  );
  benchTop.position.y = 1.0;
  benchGroup.add(benchTop);

  // Cabinet Base (Dark Gray Slate)
  const cabinetBase = new THREE.Mesh(
    new THREE.BoxGeometry(6.1, 1.8, 3.2),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.2 })
  );
  cabinetBase.position.y = 0.0;
  benchGroup.add(cabinetBase);

  // Cabinet doors accent lines
  const doorTrim = new THREE.Mesh(
    new THREE.BoxGeometry(6.12, 0.04, 3.22),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.7 })
  );
  doorTrim.position.y = 0.0;
  benchGroup.add(doorTrim);

  // ----- 2. ESPECTRÔMETRO SPECTROMAXx (Direita) -----
  const specGroup = new THREE.Group();
  specGroup.position.set(1.1, 1.1, 0.2);
  labGroup.add(specGroup);

  // Lower Dark Base Body
  const specBase = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.65, 2.3),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.6 })
  );
  specBase.position.y = 0.325;
  specGroup.add(specBase);

  // Upper Light Aluminum Body
  const specTop = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.75, 2.3),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.75 })
  );
  specTop.position.y = 1.025;
  specGroup.add(specTop);

  // Front-Left Spark Chamber Alcove (Cutout)
  const chamberCutout = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.65, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, metalness: 0.1 })
  );
  chamberCutout.position.set(-0.9, 0.8, 0.7);
  specGroup.add(chamberCutout);

  // Sample Specimen Stage inside chamber
  const sampleStage = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.18, 24),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.3 })
  );
  sampleStage.position.set(-0.9, 0.57, 0.7);
  specGroup.add(sampleStage);

  // Metal Sample Button (Disc)
  const metalSample = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.05, 20),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.2 })
  );
  metalSample.position.set(-0.9, 0.685, 0.7);
  specGroup.add(metalSample);

  // Spark Electrode Probe Pin
  const electrodePin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.01, 0.28, 16),
    new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 })
  );
  electrodePin.position.set(-0.9, 0.95, 0.7);
  specGroup.add(electrodePin);

  // Electric Spark Arc Beam
  const sparkArcMat = new THREE.MeshStandardMaterial({
    color: 0x00d4ff,
    emissive: 0x00d4ff,
    emissiveIntensity: 5.0,
    roughness: 0.1,
  });
  const sparkArc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.04, 0.2, 12),
    sparkArcMat
  );
  sparkArc.position.set(-0.9, 0.79, 0.7);
  specGroup.add(sparkArc);

  // Blue Spark PointLight
  const sparkLight = new THREE.PointLight(0x00d4ff, 0, 5.0);
  sparkLight.position.set(-0.9, 0.8, 0.7);
  specGroup.add(sparkLight);

  // Spectrometer Side Vent Grilles
  for (let v = 0; v < 4; v++) {
    const vent = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.08, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
    );
    vent.position.set(1.41, 0.35 + v * 0.12, 0.2);
    specGroup.add(vent);
  }

  // ----- 3. MONITOR DO COMPUTADOR E TELA COM CANVAS 2D -----
  const pcGroup = new THREE.Group();
  pcGroup.position.set(-1.6, 1.1, 0.1);
  labGroup.add(pcGroup);

  // Base & Stem
  const pcBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.04, 20),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.8 })
  );
  pcBase.position.y = 0.02;
  pcGroup.add(pcBase);

  const pcStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.55, 12),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.8 })
  );
  pcStem.position.y = 0.3;
  pcGroup.add(pcStem);

  // Monitor Bezel Frame
  const pcFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 1.15, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 })
  );
  pcFrame.position.set(0, 0.9, 0);
  pcGroup.add(pcFrame);

  // Create Dynamic Canvas 2D for Real-Time Live Spectrum Graph
  const canvas2D = document.createElement("canvas");
  canvas2D.width = 512;
  canvas2D.height = 320;
  const ctx2D = canvas2D.getContext("2d")!;

  const canvasTexture = new THREE.CanvasTexture(canvas2D);
  canvasTexture.minFilter = THREE.LinearFilter;
  canvasTexture.magFilter = THREE.LinearFilter;

  const pcScreenMat = new THREE.MeshBasicMaterial({ map: canvasTexture });
  const pcScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.55, 1.05),
    pcScreenMat
  );
  pcScreen.position.set(0, 0.9, 0.042);
  pcGroup.add(pcScreen);

  // Keyboard & Mouse
  const keyboard = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.03, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.4 })
  );
  keyboard.position.set(0, 0.025, 0.85);
  pcGroup.add(keyboard);

  const mouse = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.08, 0.04, 16),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.5 })
  );
  mouse.position.set(0.9, 0.025, 0.85);
  pcGroup.add(mouse);

  // Function to render the real-time dynamic spectrum graph on canvas 2D
  const updateSpectrumCanvas = (time: number, isSparking: boolean) => {
    if (!ctx2D) return;

    // Dark software background
    ctx2D.fillStyle = "#0f172a";
    ctx2D.fillRect(0, 0, 512, 320);

    // Top Header Bar
    ctx2D.fillStyle = "#1e293b";
    ctx2D.fillRect(0, 0, 512, 36);

    ctx2D.fillStyle = "#38bdf8";
    ctx2D.font = "bold 14px monospace";
    ctx2D.fillText("SPECTROMAXx — ANÁLISE ESPECTROMÉTRICA AO VIVO", 14, 23);

    ctx2D.fillStyle = isSparking ? "#22c55e" : "#e2e8f0";
    ctx2D.font = "bold 11px monospace";
    ctx2D.fillText(isSparking ? "STATUS: CENTELHAMENTO ATIVO" : "STATUS: AGUARDANDO", 310, 23);

    // Grid lines
    ctx2D.strokeStyle = "rgba(51, 65, 85, 0.6)";
    ctx2D.lineWidth = 1;
    for (let x = 40; x < 360; x += 40) {
      ctx2D.beginPath();
      ctx2D.moveTo(x, 45);
      ctx2D.lineTo(x, 270);
      ctx2D.stroke();
    }
    for (let y = 60; y < 270; y += 35) {
      ctx2D.beginPath();
      ctx2D.moveTo(35, y);
      ctx2D.lineTo(360, y);
      ctx2D.stroke();
    }

    // Spectrum Graph Peaks (Fe, C, Si, Mn, Cr, Ni)
    ctx2D.strokeStyle = "#38bdf8";
    ctx2D.lineWidth = 2;
    ctx2D.beginPath();

    const basePeaks = [
      { x: 50, h: 40 },
      { x: 80, h: 140 }, // Fe peak
      { x: 110, h: 60 },
      { x: 140, h: 190 }, // C peak
      { x: 170, h: 80 },
      { x: 200, h: 160 }, // Si peak
      { x: 230, h: 50 },
      { x: 260, h: 130 }, // Mn peak
      { x: 290, h: 70 },
      { x: 320, h: 110 }, // Cr/Ni peak
      { x: 350, h: 30 },
    ];

    ctx2D.moveTo(35, 260);

    basePeaks.forEach((p, idx) => {
      // Oscillate peak heights when sparking
      const oscillation = isSparking ? Math.sin(time * 12 + idx) * 12 : 0;
      const peakY = 260 - (p.h + oscillation);
      ctx2D.lineTo(p.x, peakY);
    });

    ctx2D.lineTo(360, 260);
    ctx2D.stroke();

    // Fill under graph with gradient glow
    const grad = ctx2D.createLinearGradient(0, 60, 0, 260);
    grad.addColorStop(0, "rgba(56, 189, 248, 0.35)");
    grad.addColorStop(1, "rgba(56, 189, 248, 0.0)");
    ctx2D.fillStyle = grad;
    ctx2D.fill();

    // Element Peak Labels
    ctx2D.fillStyle = "#ffaa00";
    ctx2D.font = "bold 10px monospace";
    ctx2D.fillText("Fe", 75, 105);
    ctx2D.fillText("C", 137, 55);
    ctx2D.fillText("Si", 195, 85);
    ctx2D.fillText("Mn", 255, 115);

    // Right Side Analysis Readout Panel
    ctx2D.fillStyle = "#0f172a";
    ctx2D.fillRect(370, 45, 132, 260);
    ctx2D.strokeStyle = "#334155";
    ctx2D.strokeRect(370, 45, 132, 260);

    ctx2D.fillStyle = "#94a3b8";
    ctx2D.font = "bold 11px monospace";
    ctx2D.fillText("COMPOSIÇÃO %", 380, 65);

    const elements = [
      { name: "Fe", val: "93.85%" },
      { name: "C", val: " 3.42%" },
      { name: "Si", val: " 2.15%" },
      { name: "Mn", val: " 0.45%" },
      { name: "P", val: " 0.02%" },
      { name: "S", val: " 0.01%" },
    ];

    elements.forEach((el, i) => {
      ctx2D.fillStyle = "#e2e8f0";
      ctx2D.font = "11px monospace";
      ctx2D.fillText(`${el.name}: ${el.val}`, 380, 92 + i * 22);
    });

    ctx2D.fillStyle = "#22c55e";
    ctx2D.fillRect(380, 245, 112, 28);
    ctx2D.fillStyle = "#0f172a";
    ctx2D.font = "bold 11px monospace";
    ctx2D.fillText("✓ APROVADO", 395, 263);

    canvasTexture.needsUpdate = true;
  };

  return { labGroup, sparkArcMat, sparkLight, updateSpectrumCanvas };
}

// ============================================================================
// MAIN PROCESS COMPONENT
// ============================================================================
const Process = () => {
  const mainRef = useRef<HTMLElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const canvasContainer = canvasContainerRef.current;
    const mainSection = mainRef.current;
    if (!canvasContainer || !mainSection) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ----------------------------------------------------
    // 1. THREE.JS SCENE SETUP
    // ----------------------------------------------------
    const width = canvasContainer.clientWidth || window.innerWidth;
    const height = canvasContainer.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0f0f11");
    scene.fog = new THREE.FogExp2("#0f0f11", 0.015); // Light fog for open visual clarity

    // Open isometric camera angle (camera position set to 0, 6, 15)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 6, 15);
    const cameraTarget = new THREE.Vector3(0, 0.8, 0);
    camera.lookAt(cameraTarget);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobileDevice(),
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileDevice() ? 1 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    canvasContainer.appendChild(renderer.domElement);

    // ----------------------------------------------------
    // POST-PROCESSING: EFFECT COMPOSER WITH UNREAL BLOOM
    // ----------------------------------------------------
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.3, // Strength
      0.4, // Radius
      0.85 // Threshold: only intense emissive liquid glows, machinery stays crisp
    );
    composer.addPass(bloomPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // ----------------------------------------------------
    // 2. LIGHTING SETUP (Bright Ambient & Multi-Directional Fill)
    // ----------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Strong ambient light
    scene.add(ambientLight);

    const mainDirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    mainDirLight.position.set(10, 18, 12);
    scene.add(mainDirLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.8);
    rimLight.position.set(-12, 10, -10);
    scene.add(rimLight);

    const frontFillLight = new THREE.DirectionalLight(0xffaa66, 0.6);
    frontFillLight.position.set(0, 6, 12);
    scene.add(frontFillLight);

    // Industrial Grid & Floor
    const grid = new THREE.GridHelper(60, 40, 0xff5500, 0x242834);
    grid.position.y = -0.5;
    scene.add(grid);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x0f0f11, roughness: 0.6, metalness: 0.8 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.51;
    scene.add(floor);

    // ----------------------------------------------------
    // 3. INSTANTIATE MODULAR 3D MODELS
    // ----------------------------------------------------

    // 1. Mold (Caixa de Areia Bipartida com Cavidade Côncava e Engrenagem 3D)
    const { moldGroup, moldTop, pieceGroup, pieceMat } = createMold();
    moldGroup.position.set(0, -0.5, 0); // Stage 1 starts centered
    scene.add(moldGroup);

    // 2. Induction Furnace (Forno com Pivô no Bico de Despejo)
    const { furnacePivot, furnaceMeltMat, furnaceLight } = createFurnace();
    furnacePivot.position.set(22, 2.5, 0); // Initially far right out of scene
    scene.add(furnacePivot);

    // 3. Ladle (Panela de Fundição com Pivô na Abertura Superior)
    const { ladlePivot, ladleMelt, ladleMeltMat, ladleLight } = createLadle();
    ladlePivot.position.set(22, 0, 0); // Initially far right out of scene
    scene.add(ladlePivot);

    // 4. SPECTROMAXx 3D Lab Station (Quality Control Stage 5)
    const { labGroup, sparkArcMat, sparkLight, updateSpectrumCanvas } = createLabStation();
    labGroup.position.set(22, -0.5, 0); // Initially far right out of scene
    scene.add(labGroup);

    // 5. Fluid Liquid Streams (GLSL Shader)
    // Stream 1: Furnace spout -> Ladle opening
    const { streamMesh: stream1, streamMat: stream1Mat } = createLiquidFlow(2.2);
    stream1.position.set(-2.2, 2.5, 0); // Positioned at furnace spout tip location
    scene.add(stream1);

    // Stream 2: Ladle spout -> Mold sprue funnel
    const { streamMesh: stream2, streamMat: stream2Mat } = createLiquidFlow(1.5);
    stream2.position.set(0, 3.0, 0); // Positioned above mold sprue funnel
    scene.add(stream2);

    // 6. Spark Splash System
    const {
      sparkMesh,
      sparkGeo,
      sparkMat,
      sparkVelocities,
      count: sparkCount,
    } = createSparkSplashSystem();
    sparkMesh.position.set(0, 1.5, 0);
    scene.add(sparkMesh);

    // ----------------------------------------------------
    // 4. STRICT GSAP SCROLLTRIGGER TIMELINE (Mathematical Alignment)
    // ----------------------------------------------------
    const ctx = gsap.context(() => {
      if (prefersReduced) return;

      const masterTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: mainSection,
          start: "top top",
          end: "bottom bottom",
          scrub: 1, // Smooth scrolling interaction
          pin: "#webgl-canvas-container",
          onUpdate: (self) => {
            const progress = self.progress;
            setScrollProgress(progress);

            // Active step indicator update
            if (progress < 0.2) setActiveStep(0);
            else if (progress < 0.45) setActiveStep(1);
            else if (progress < 0.7) setActiveStep(2);
            else if (progress < 0.9) setActiveStep(3);
            else setActiveStep(4);
          },
        },
      });

      // ====================================================
      // FASE 1: MOLDAGEM (Scroll 0% a 20%)
      // Mold centered at (0, -0.5, 0). Gear sitting inside drag cavity.
      // ====================================================
      masterTimeline
        // Mold upper cope closes onto drag base
        .to(moldTop.position, { y: 0.75, duration: 0.18, ease: "power2.inOut" }, 0)
        // Camera stays focused on open overview at (0, 6, 15)
        .to(camera.position, { x: 0, y: 6, z: 15, duration: 0.2 }, 0)
        .to(cameraTarget, { x: 0, y: 0.8, z: 0, duration: 0.2 }, 0);

      // ----------------------------------------------------
      // TRANSIÇÃO 1 (20% -> 25%): Mold exits left, Furnace enters to center
      // ----------------------------------------------------
      masterTimeline
        .to(moldGroup.position, { x: -18, duration: 0.05, ease: "power2.in" }, 0.2)
        .to(furnacePivot.position, { x: 0, y: 2.5, z: 0, duration: 0.05, ease: "power2.out" }, 0.2)
        .to(camera.position, { x: 0, y: 6, z: 14, duration: 0.05 }, 0.2)
        .to(cameraTarget, { x: 0, y: 1.0, z: 0, duration: 0.05 }, 0.2);

      // ====================================================
      // FASE 2: FUSÃO NO FORNO (Scroll 25% a 45%)
      // Furnace centered at (0, 2.5, 0). Molten disk fills full diameter (1.24) uniformly
      // ====================================================
      masterTimeline
        // Metal inside furnace liquefies & glows incandescent (#ff4400) UNIFORMLY across 100% of top surface
        .to(
          furnaceMeltMat.color,
          { r: 1.0, g: 1.0, b: 1.0, duration: 0.18, ease: "power1.in" },
          0.25
        )
        .to(
          furnaceMeltMat.emissive,
          { r: 1.0, g: 0.27, b: 0.0, duration: 0.18, ease: "power1.in" },
          0.25
        )
        .to(furnaceMeltMat, { emissiveIntensity: 2.5, duration: 0.18 }, 0.25)
        .to(furnaceLight, { intensity: 8.0, duration: 0.18 }, 0.25);

      // ====================================================
      // FASE 3: VAZAMENTO FORNO -> PANELA (Scroll 45% a 70%)
      // Furnace spout at (-2.2, 2.5, 0), Ladle opening center positioned under spout at (-2.2, 0.3, 0)
      // ====================================================
      masterTimeline
        .to(furnacePivot.position, { x: -2.2, y: 2.5, z: 0, duration: 0.05, ease: "power2.inOut" }, 0.45)
        .to(ladlePivot.position, { x: -2.2, y: 0.3, z: 0, duration: 0.05, ease: "power2.out" }, 0.45)
        .to(sparkMesh.position, { x: -2.2, y: 0.3, z: 0, duration: 0.05 }, 0.45)
        .to(camera.position, { x: -0.8, y: 6.0, z: 14, duration: 0.05 }, 0.45)
        .to(cameraTarget, { x: -2.2, y: 1.0, z: 0, duration: 0.05 }, 0.45)
        // Furnace tilts around spout pivot
        .to(furnacePivot.rotation, { z: -0.65, duration: 0.15, ease: "power2.inOut" }, 0.5)
        // Fluid Shader Stream 1 expands downwards into ladle center
        .to(stream1.scale, { x: 1, y: 1, z: 1, duration: 0.08, ease: "power1.in" }, 0.52)
        // Internal liquid level inside ladle fills up (scale.y: 0 -> 1) & glows incandescent
        .to(ladleMelt.scale, { y: 1.0, duration: 0.14, ease: "power1.inOut" }, 0.52)
        .to(
          ladleMeltMat.color,
          { r: 1.0, g: 1.0, b: 1.0, duration: 0.12, ease: "power2.in" },
          0.54
        )
        .to(
          ladleMeltMat.emissive,
          { r: 1.0, g: 0.27, b: 0.0, duration: 0.12, ease: "power2.in" },
          0.54
        )
        .to(ladleMeltMat, { emissiveIntensity: 2.5, duration: 0.12 }, 0.54)
        .to(ladleLight, { intensity: 6.0, duration: 0.12 }, 0.54)
        // End of stream 1 & furnace un-tilts
        .to(stream1.scale, { x: 0, y: 0, z: 0, duration: 0.05 }, 0.66)
        .to(furnacePivot.rotation, { z: 0, duration: 0.05 }, 0.65);

      // ====================================================
      // FASE 4: ENCHIMENTO DO MOLDE (Scroll 70% a 90%)
      // Furnace exits left (-18, 2.5, 0), Mold returns to center (0, -0.5, 0),
      // Ladle spout positioned directly above mold sprue funnel (0, 3.0, 0)
      // ====================================================
      masterTimeline
        .to(furnacePivot.position, { x: -18, duration: 0.03 }, 0.7)
        .to(moldGroup.position, { x: 0, y: -0.5, z: 0, duration: 0.03, ease: "power2.out" }, 0.7)
        .to(ladlePivot.position, { x: -0.7, y: 3.0, z: 0, duration: 0.03, ease: "power2.out" }, 0.7)
        .to(sparkMesh.position, { x: 0, y: 1.5, z: 0, duration: 0.03 }, 0.7)
        .to(camera.position, { x: 0, y: 6.0, z: 14, duration: 0.03 }, 0.7)
        .to(cameraTarget, { x: 0, y: 0.8, z: 0, duration: 0.03 }, 0.7)
        // Ladle tilts to pour from its spout into mold sprue funnel
        .to(ladlePivot.rotation, { z: -0.65, duration: 0.1, ease: "power2.inOut" }, 0.73)
        // Fluid Shader Stream 2 expands into sprue
        .to(stream2.scale, { x: 1, y: 1, z: 1, duration: 0.06 }, 0.74)
        // Spark splash particles activate at mold sprue
        .to(sparkMat, { opacity: 0.95, duration: 0.06 }, 0.75)
        // Internal 3D gear in mold heats up incandescent (0xffffff / emissive #ff4400)
        .to(
          pieceMat.color,
          { r: 1.0, g: 1.0, b: 1.0, duration: 0.1, ease: "power1.in" },
          0.76
        )
        .to(
          pieceMat.emissive,
          { r: 1.0, g: 0.27, b: 0.0, duration: 0.1, ease: "power1.in" },
          0.76
        )
        .to(pieceMat, { emissiveIntensity: 2.5, duration: 0.1 }, 0.76)
        // Ladle empties (scale.y: 1 -> 0.2) as it pours
        .to(ladleMelt.scale, { y: 0.2, duration: 0.12, ease: "power1.out" }, 0.75)
        // Stream 2 ends, sparks fade, ladle un-tilts & exits right
        .to(stream2.scale, { x: 0, y: 0, z: 0, duration: 0.04 }, 0.86)
        .to(sparkMat, { opacity: 0, duration: 0.04 }, 0.86)
        .to(ladlePivot.rotation, { z: 0, duration: 0.04 }, 0.86)
        .to(ladlePivot.position, { x: 18, duration: 0.04 }, 0.87);

      // ====================================================
      // FASE 5: ESPECTROMETRIA / CONTROLE DE QUALIDADE (Scroll 90% a 100%)
      // Mold exits left (-18, -0.5, 0), SPECTROMAXx Lab Station enters center (0, -0.5, 0)
      // ====================================================
      masterTimeline
        .to(moldGroup.position, { x: -18, duration: 0.04, ease: "power2.in" }, 0.9)
        .to(labGroup.position, { x: 0, y: -0.5, z: 0, duration: 0.04, ease: "power2.out" }, 0.9)
        .to(sparkLight, { intensity: 4.5, duration: 0.08 }, 0.92)
        .to(sparkArcMat, { emissiveIntensity: 5.0, duration: 0.08 }, 0.92)
        .to(camera.position, { x: 0, y: 5.5, z: 12.5, duration: 0.09, ease: "power3.inOut" }, 0.91)
        .to(cameraTarget, { x: 0, y: 0.9, z: 0, duration: 0.09, ease: "power3.inOut" }, 0.91);
    }, mainRef);

    // ----------------------------------------------------
    // 5. RESIZE OBSERVER
    // ----------------------------------------------------
    const handleResize = () => {
      if (!canvasContainer) return;
      const w = canvasContainer.clientWidth || window.innerWidth;
      const h = canvasContainer.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvasContainer);
    window.addEventListener("resize", handleResize);

    // ----------------------------------------------------
    // 6. ANIMATION LOOP (60 FPS STABLE)
    // ----------------------------------------------------
    let animId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate);
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Update camera target
      camera.lookAt(cameraTarget);

      // Animate GLSL Shader uniforms (uTime)
      if (stream1Mat) stream1Mat.uniforms.uTime.value += delta;
      if (stream2Mat) stream2Mat.uniforms.uTime.value += delta;

      // Rotate final gear piece in Stage 5 inside mold if active
      if (pieceGroup) {
        pieceGroup.rotation.y += delta * 0.35;
      }

      // Update SPECTROMAXx Live Canvas 2D Spectrum Texture when Stage 5 is active
      if (updateSpectrumCanvas) {
        const isSparkingStage = activeStep === 4;
        updateSpectrumCanvas(currentTime / 1000, isSparkingStage);
      }

      // Spark particles animation
      if (sparkMat.opacity > 0) {
        const posArr = sparkGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < sparkCount; i++) {
          const idx = i * 3;
          posArr[idx] += sparkVelocities[idx] * delta;
          posArr[idx + 1] += sparkVelocities[idx + 1] * delta;
          posArr[idx + 2] += sparkVelocities[idx + 2] * delta;

          // Gravity effect
          sparkVelocities[idx + 1] -= 9.8 * delta * 0.2;

          if (posArr[idx + 1] < 0) {
            posArr[idx] = 0;
            posArr[idx + 1] = 0;
            posArr[idx + 2] = 0;

            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 2.0;
            sparkVelocities[idx] = Math.cos(angle) * speed * 0.6;
            sparkVelocities[idx + 1] = 0.8 + Math.random() * 2.2;
            sparkVelocities[idx + 2] = Math.sin(angle) * speed * 0.6;
          }
        }
        sparkGeo.attributes.position.needsUpdate = true;
      }

      // Render scene through EffectComposer
      composer.render();
    };

    animId = requestAnimationFrame(animate);

    // ----------------------------------------------------
    // 7. CLEANUP
    // ----------------------------------------------------
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      ctx.revert();

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      renderer.dispose();
      composer.dispose();
      if (canvasContainer.contains(renderer.domElement)) {
        canvasContainer.removeChild(renderer.domElement);
      }
    };
  }, [activeStep]);

  const currentStage = STAGES[activeStep];
  const Icon = currentStage.icon;

  return (
    <section
      id="processo-scroll-container"
      ref={mainRef}
      className="relative w-full bg-[#0f0f11]"
      style={{ height: "500vh" }}
    >
      {/* ========================================================= */}
      {/* PINNED FULLSCREEN 3D WEBGL CANVAS */}
      {/* ========================================================= */}
      <div
        id="webgl-canvas-container"
        className="sticky top-0 h-screen w-full overflow-hidden z-0"
      >
        <div ref={canvasContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Cinematic Vignette Overlays */}
        <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent via-[#0f0f11]/30 to-[#0f0f11]/95" />
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#0f0f11]/90 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f0f11]/95 to-transparent pointer-events-none" />

        {/* ========================================================= */}
        {/* FLOATING HUD INTERFACE & SCROLLYTELLING CARDS */}
        {/* ========================================================= */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-8 md:p-12 pointer-events-none">
          
          {/* Top Header & Navigation (Clean UI — Floating Orçamento button removed) */}
          <div className="flex items-center justify-between pointer-events-auto">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#ff5500]/30 bg-[#ff5500]/10 backdrop-blur-md text-[11px] uppercase tracking-[0.2em] text-[#ff5500] mb-2">
                <Layers size={13} />
                Jornada de Transformação 3D
              </div>
              <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-tight text-white">
                Processo de <span className="text-gradient-molten">Fundição</span>
              </h1>
            </div>
          </div>

          {/* Floating Text Cards on Left Side */}
          <div className="my-auto max-w-lg self-start pointer-events-auto">
            <div className="glass-dark edge-glow p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl transition-all duration-500">
              
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span
                    className="text-4xl sm:text-5xl font-heading font-bold text-transparent select-none leading-none"
                    style={{ WebkitTextStroke: "1px rgba(255,255,255,0.4)" }}
                  >
                    {currentStage.number}
                  </span>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#ff5500]/40 bg-[#ff5500]/10 text-[10px] uppercase font-bold tracking-wider text-[#ff5500]">
                      <Icon size={12} />
                      {currentStage.tag}
                    </div>
                    <h2 className="font-heading text-lg sm:text-xl font-bold uppercase text-white mt-1 leading-snug">
                      {currentStage.title}
                    </h2>
                  </div>
                </div>

                {/* Temperature Indicator */}
                <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end gap-1 text-xs text-[#ff5500] font-mono font-semibold">
                    <Thermometer size={14} />
                    {currentStage.temp}
                  </div>
                  <p className="text-[10px] text-foreground/50 uppercase tracking-widest mt-0.5">
                    Temperatura
                  </p>
                </div>
              </div>

              {/* Stage Description */}
              <p className="text-foreground/80 leading-relaxed text-xs sm:text-sm mb-5">
                {currentStage.description}
              </p>

              {/* Technical Bullet Highlights */}
              <div className="space-y-2 mb-6 pt-3 border-t border-white/5">
                {currentStage.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-foreground/75">
                    <CheckCircle2 size={14} className="text-[#ff5500] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Stage 5 Special Quality Control HUD Table */}
              {activeStep === 4 ? (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-foreground/80 space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px] text-cyan-400 font-bold border-b border-cyan-500/20 pb-1">
                    <span className="flex items-center gap-1.5">
                      <Activity size={13} className="animate-pulse text-cyan-400" />
                      ESPECTRÔMETRO SPECTROMAXx
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <FileCheck size={13} />
                      APROVADO 100%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] text-foreground/70 pt-1">
                    <div className="bg-black/30 p-1.5 rounded border border-white/5 text-center">
                      <span className="text-foreground/40 block">CARBONO (C)</span>
                      <strong className="text-white">3.42 %</strong>
                    </div>
                    <div className="bg-black/30 p-1.5 rounded border border-white/5 text-center">
                      <span className="text-foreground/40 block">SILÍCIO (Si)</span>
                      <strong className="text-white">2.15 %</strong>
                    </div>
                    <div className="bg-black/30 p-1.5 rounded border border-white/5 text-center">
                      <span className="text-foreground/40 block">MANGANÊS (Mn)</span>
                      <strong className="text-white">0.45 %</strong>
                    </div>
                  </div>
                </div>
              ) : (
                /* Material Badge Footer for Stages 1 to 4 */
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-foreground/70">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-cyan-400" />
                    <span>{currentStage.material}</span>
                  </div>
                  <span className="font-mono text-[#ff5500] text-[11px] font-semibold">
                    Etapa 0{activeStep + 1} de 05
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Progress Bar & Stepper Controls */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto pb-4">
            
            {/* Scroll Indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-foreground/50 uppercase tracking-widest">
              <ChevronDown size={15} className="animate-bounce text-[#ff5500]" />
              <span>Role para explorar a jornada 3D</span>
            </div>

            {/* Stepper Dots & Progress Track */}
            <div className="flex items-center gap-2 glass-dark px-4 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
              {STAGES.map((st, idx) => {
                const isActive = idx === activeStep;
                const isPassed = idx < activeStep;
                return (
                  <div key={st.id} className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        isActive
                          ? "bg-[#ff5500] scale-125 shadow-[0_0_12px_rgba(255,85,0,0.8)]"
                          : isPassed
                          ? "bg-[#ff5500]/60"
                          : "bg-white/20"
                      }`}
                      title={st.title}
                    />
                    <span className={`text-[11px] font-mono font-semibold ${isActive ? "text-white" : "text-foreground/40"}`}>
                      {st.number}
                    </span>
                    {idx < STAGES.length - 1 && (
                      <div className="w-4 sm:w-8 h-[2px] bg-white/10 relative overflow-hidden">
                        <div
                          className="h-full bg-[#ff5500] transition-all duration-200"
                          style={{
                            width:
                              scrollProgress >= (idx + 1) * 0.2
                                ? "100%"
                                : scrollProgress > idx * 0.2
                                ? `${((scrollProgress - idx * 0.2) / 0.2) * 100}%`
                                : "0%",
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
