import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Box,
  Flame,
  Droplets,
  Wrench,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Layers,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
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
      "O modelo geométrico é posicionado entre as caixas bipartidas (tampa e fundo). A areia verde rica em bentonita é compactada sob alta pressão, conformando a cavidade e o canal de descida (sprue).",
    highlights: [
      "Caixa bipartida (tampa cope e fundo drag) com pinos de precisão",
      "Compactação automatizada de alta densidade superficial",
      "Confecção do canal de descida (sprue) e bocal de alimentação",
      "Pintura refratária para acabamento liso e isento de incrustações",
    ],
  },
  {
    id: 2,
    number: "02",
    tag: "02. Fusão no Forno",
    title: "Aquecimento no Forno de Indução",
    icon: Flame,
    temp: "1520 °C",
    material: "Ferro Nodular / Cinzento",
    description:
      "No forno de indução, bobinas de cobre de alta frequência aquecem as sucatas e ligas até ultrapassarem 1500°C. O metal liquefaz-se e passa a brilhar com intensa cor alaranjada incandescente.",
    highlights: [
      "Fusão por indução eletromagnética de alta potência",
      "Cadinho com revestimento refratário de alta durabilidade",
      "Descoriamento e controle de espectrometria óptica",
      "Elevação da emissividade térmica e luz pontual intensa",
    ],
  },
  {
    id: 3,
    number: "03",
    tag: "03. Sangria do Forno",
    title: "Basculamento e Transferência para a Panela",
    icon: Droplets,
    temp: "1480 °C",
    material: "Inoculação na Concha",
    description:
      "O forno bascula suavemente pelo seu bico de despejo e derrama um fluxo contínuo de metal líquido incandescente para a panela de transporte. Ocorre a inoculação direta para refino de grãos.",
    highlights: [
      "Pivô de rotação posicionado diretamente no bico de despejo",
      "Fluxo laminar contínuo sem oxidação turbulenta",
      "Panela com revestimento refratário pré-aquecido",
      "Captação total do metal incandescente pela panela",
    ],
  },
  {
    id: 4,
    number: "04",
    tag: "04. Vazamento no Molde",
    title: "Preenchimento da Cavidade da Peça",
    icon: Wrench,
    temp: "1420 °C",
    material: "Preenchimento Estanque",
    description:
      "O forno recua e a panela cheia se posiciona sobre a caixa de moldagem fechada. Inclinando-se, vaza o metal incandescente pelo bocal de alimentação, preenchendo todos os detalhes da peça.",
    highlights: [
      "Posicionamento preciso do bocal da panela sobre o sprue",
      "Vazamento ritmado com faíscas incandescentes de alívio",
      "Preenchimento 100% estanque da cavidade de areia",
      "Início da formação da estrutura cristalina da liga",
    ],
  },
  {
    id: 5,
    number: "05",
    tag: "05. Solidificação e Desmoldagem",
    title: "Resfriamento e Revelação da Peça Acabada",
    icon: Sparkles,
    temp: "25 °C / Amb.",
    material: "Peça Metálica Estrutural",
    description:
      "Após a solidificação da liga, a tampa do molde se abre novamente. A peça transiciona de laranja incandescente para cinza metálico escuro, pronta para desmoldagem vibratória e usinagem.",
    highlights: [
      "Desmoldagem com separação vibratória da areia",
      "Transição térmica progressiva de incandescente para metálico",
      "Corte dos canais de alimentação e rebarbação final",
      "Inspeção dimensional e espectrométrica 100% aprovada",
    ],
  },
];

// ============================================================================
// 3D MODEL GENERATOR FUNCTIONS (Clean & Modular with Exact Pivots)
// ============================================================================

/**
 * 1. O Molde (Caixa de Areia Bipartida)
 */
function createMold() {
  const moldGroup = new THREE.Group();

  const sandMat = new THREE.MeshStandardMaterial({
    color: 0x4a4035,
    roughness: 0.95,
    metalness: 0.05,
  });

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x22262e,
    roughness: 0.45,
    metalness: 0.85,
  });

  // Base / Fundo (Drag)
  const dragSand = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.8, 3.0), sandMat);
  dragSand.position.y = 0.4;
  moldGroup.add(dragSand);

  const dragFrame = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.15, 3.1), frameMat);
  dragFrame.position.y = 0.075;
  moldGroup.add(dragFrame);

  // Tampa / Superior (Cope) - moves up/down in Y
  const moldTop = new THREE.Group();
  moldTop.position.y = 2.4; // Starts open in Stage 1
  moldGroup.add(moldTop);

  const copeSand = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.8, 3.0), sandMat);
  copeSand.position.y = 0.4;
  moldTop.add(copeSand);

  const copeFrame = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.15, 3.1), frameMat);
  copeFrame.position.y = 0.725;
  moldTop.add(copeFrame);

  // Sprue funnel cup (canal de alimentação) on top of upper mold
  const sprueFunnel = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.5, 24), sandMat);
  sprueFunnel.rotation.x = Math.PI;
  sprueFunnel.position.set(0, 1.05, 0);
  moldTop.add(sprueFunnel);

  const sprueLip = new THREE.Mesh(
    new THREE.TorusGeometry(0.41, 0.04, 12, 24),
    frameMat
  );
  sprueLip.rotation.x = Math.PI / 2;
  sprueLip.position.set(0, 1.3, 0);
  moldTop.add(sprueLip);

  // Inside Cast Piece (Gear/Flange)
  const pieceMat = new THREE.MeshStandardMaterial({
    color: 0x2c3038,
    emissive: 0x000000,
    emissiveIntensity: 0,
    roughness: 0.35,
    metalness: 0.9,
  });

  const pieceGroup = new THREE.Group();
  pieceGroup.position.set(0, 0.8, 0);
  moldGroup.add(pieceGroup);

  const pieceHub = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.35, 32), pieceMat);
  pieceGroup.add(pieceHub);

  const pieceHole = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.38, 20), frameMat);
  pieceGroup.add(pieceHole);

  for (let g = 0; g < 8; g++) {
    const angle = (g / 8) * Math.PI * 2;
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.3), pieceMat);
    tooth.position.set(Math.cos(angle) * 1.15, 0, Math.sin(angle) * 1.15);
    tooth.rotation.y = -angle;
    pieceGroup.add(tooth);
  }

  return { moldGroup, moldTop, pieceGroup, pieceMat };
}

/**
 * 2. O Forno de Indução
 * PIVÔ DA ROTAÇÃO: Posicionado exatamente no bico de despejo (top spout lip)
 */
function createFurnace() {
  const furnacePivot = new THREE.Group(); // Pivot at spout (0, 0, 0)

  const furnaceBody = new THREE.Group();
  // Offset body so spout lip aligns at local (0, 0, 0) of furnacePivot
  furnaceBody.position.set(-1.3, -1.2, 0);
  furnacePivot.add(furnaceBody);

  // Corpo Externo - CylinderGeometry cinza metálico
  const outerBody = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.4, 2.3, 32),
    new THREE.MeshStandardMaterial({ color: 0x1d2128, roughness: 0.55, metalness: 0.85 })
  );
  furnaceBody.add(outerBody);

  // Bico de despejo / Spout lip at top edge
  const spout = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.25, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x2b303c, roughness: 0.4, metalness: 0.85 })
  );
  spout.position.set(1.3, 1.2, 0);
  spout.rotation.z = -0.3;
  furnaceBody.add(spout);

  // Bobinas de Cobre empilhadas ao redor do corpo
  const coilMat = new THREE.MeshStandardMaterial({
    color: 0xcd7f32,
    roughness: 0.2,
    metalness: 0.8,
  });

  for (let c = 0; c < 5; c++) {
    const coil = new THREE.Mesh(new THREE.TorusGeometry(1.48, 0.055, 16, 32), coilMat);
    coil.rotation.x = Math.PI / 2;
    coil.position.y = -0.65 + c * 0.3;
    furnaceBody.add(coil);
  }

  // Cadinho Interno (Parede Refratária oca)
  const refractoryLining = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.1, 2.32, 32, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x3d414a, roughness: 0.9, metalness: 0.1 })
  );
  furnaceBody.add(refractoryLining);

  // Metal Interno - Disco no topo do cadinho
  const furnaceMeltMat = new THREE.MeshStandardMaterial({
    color: 0x14171c,
    emissive: 0x000000,
    emissiveIntensity: 0,
    roughness: 0.1,
  });

  const furnaceMelt = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.1, 32), furnaceMeltMat);
  furnaceMelt.position.y = 0.95;
  furnaceBody.add(furnaceMelt);

  // PointLight interno vinculado ao metal líquido
  const furnaceLight = new THREE.PointLight(0xff5500, 0, 10);
  furnaceLight.position.set(-0.5, 0.2, 0);
  furnacePivot.add(furnaceLight);

  return { furnacePivot, furnaceMeltMat, furnaceLight };
}

/**
 * 3. A Panela de Fundição (Ladle)
 * PIVÔ DA ROTAÇÃO: Posicionado no bico/eixo de despejo
 */
function createLadle() {
  const ladlePivot = new THREE.Group();

  const ladleBody = new THREE.Group();
  // Offset body so spout top rim aligns with pivot at (0, 0, 0)
  ladleBody.position.set(-0.65, -0.6, 0);
  ladlePivot.add(ladleBody);

  // Bucket - CylinderGeometry levemente cônico (radiusTop > radiusBottom)
  const bucket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75, 0.55, 1.2, 32),
    new THREE.MeshStandardMaterial({ color: 0x20242c, roughness: 0.5, metalness: 0.85 })
  );
  ladleBody.add(bucket);

  // Spout lip
  const ladleSpout = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.15, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x2c323f, roughness: 0.4, metalness: 0.85 })
  );
  ladleSpout.position.set(0.65, 0.6, 0);
  ladleSpout.rotation.z = -0.25;
  ladleBody.add(ladleSpout);

  // Eixos de Rotação / Suportes Laterais (Trunnions)
  const trunnions = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 1.8, 16),
    new THREE.MeshStandardMaterial({ color: 0x333844, roughness: 0.4, metalness: 0.9 })
  );
  trunnions.rotation.x = Math.PI / 2;
  trunnions.position.y = 0.2;
  ladleBody.add(trunnions);

  // Alça / Crane Bail Handle
  const bail = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.045, 8, 24, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x252a33, roughness: 0.4, metalness: 0.85 })
  );
  bail.position.y = 0.6;
  ladleBody.add(bail);

  // Nível do Metal Líquido dentro da panela
  const ladleMeltMat = new THREE.MeshStandardMaterial({
    color: 0x14171c,
    emissive: 0x000000,
    emissiveIntensity: 0,
    roughness: 0.1,
  });

  const ladleMelt = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.1, 24), ladleMeltMat);
  ladleMelt.position.y = 0.45;
  ladleBody.add(ladleMelt);

  // PointLight interno da panela
  const ladleLight = new THREE.PointLight(0xff5500, 0, 8);
  ladleLight.position.set(0, 0.2, 0);
  ladlePivot.add(ladleLight);

  return { ladlePivot, ladleMeltMat, ladleLight };
}

/**
 * 4. O Fluxo de Metal (Vazamento Incandescente)
 */
function createMetalStream(height: number) {
  const streamGeo = new THREE.CylinderGeometry(0.05, 0.08, height, 16);
  // Translate geometry so top origin is at (0,0,0) for natural Y scaling downwards
  streamGeo.translate(0, -height / 2, 0);

  const streamMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xff5500,
    emissiveIntensity: 5.0,
    roughness: 0.1,
  });

  const streamMesh = new THREE.Mesh(streamGeo, streamMat);
  streamMesh.scale.set(0, 0, 0); // Initially hidden

  return streamMesh;
}

/**
 * 5. Sistema de Partículas (Faíscas Incandescentes)
 */
function createSparkSystem() {
  const count = 120;
  const sparkGeo = new THREE.BufferGeometry();
  const sparkPositions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    sparkPositions[i] = (Math.random() - 0.5) * 1.5;
    sparkPositions[i + 1] = Math.random() * 1.5;
    sparkPositions[i + 2] = (Math.random() - 0.5) * 1.5;
  }

  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));

  const sparkMat = new THREE.PointsMaterial({
    color: 0xff5500,
    size: 0.08,
    transparent: true,
    opacity: 0,
  });

  const sparkSystem = new THREE.Points(sparkGeo, sparkMat);
  return { sparkSystem, sparkGeo, sparkMat };
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
    scene.background = new THREE.Color("#050505");
    scene.fog = new THREE.FogExp2("#050505", 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Initial camera frame for Mold in Stage 1
    camera.position.set(0, 2.0, 5.5);
    const cameraTarget = new THREE.Vector3(0, 0.4, 0);
    camera.lookAt(cameraTarget);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobileDevice(),
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileDevice() ? 1 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2; // Natural bloom for emissive metals
    canvasContainer.appendChild(renderer.domElement);

    // ----------------------------------------------------
    // 2. LIGHTING SETUP
    // ----------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0x1a1c22, 0.8);
    scene.add(ambientLight);

    const coldDirLight = new THREE.DirectionalLight(0xdde5f0, 0.75);
    coldDirLight.position.set(6, 14, 8);
    scene.add(coldDirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.3);
    rimLight.position.set(-8, 5, -6);
    scene.add(rimLight);

    // Industrial Grid & Floor
    const grid = new THREE.GridHelper(60, 40, 0xff5500, 0x1a1d24);
    grid.position.y = -0.5;
    scene.add(grid);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.6, metalness: 0.8 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.51;
    scene.add(floor);

    // ----------------------------------------------------
    // 3. INSTANTIATE MODULAR 3D MODELS
    // ----------------------------------------------------

    // 1. Mold (Caixa de Areia)
    const { moldGroup, moldTop, pieceGroup, pieceMat } = createMold();
    moldGroup.position.set(0, -0.5, 0); // Stage 1 starts centered
    scene.add(moldGroup);

    // 2. Induction Furnace (Forno de Indução com Pivô no Bico)
    const { furnacePivot, furnaceMeltMat, furnaceLight } = createFurnace();
    furnacePivot.position.set(16, 1.2, 0); // Initially far right out of scene
    scene.add(furnacePivot);

    // 3. Ladle (Panela de Fundição)
    const { ladlePivot, ladleMeltMat, ladleLight } = createLadle();
    ladlePivot.position.set(16, 0, 0); // Initially far right out of scene
    scene.add(ladlePivot);

    // 4. Metal Streams
    // Stream 1: Furnace spout pouring down into Ladle
    const stream1 = createMetalStream(1.25);
    stream1.position.set(-1.2, 1.6, 0); // Positioned at furnace spout tip location
    scene.add(stream1);

    // Stream 2: Ladle pouring down into Mold Sprue
    const stream2 = createMetalStream(1.35);
    stream2.position.set(0, 1.9, 0); // Positioned above mold sprue
    scene.add(stream2);

    // 5. Spark Particles
    const { sparkSystem, sparkGeo, sparkMat } = createSparkSystem();
    sparkSystem.position.set(0, 0.6, 0);
    scene.add(sparkSystem);

    // ----------------------------------------------------
    // 4. STRICT GSAP SCROLLTRIGGER TIMELINE (No Overlaps)
    // ----------------------------------------------------
    const ctx = gsap.context(() => {
      if (prefersReduced) return;

      const masterTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: mainSection,
          start: "top top",
          end: "bottom bottom",
          scrub: 1, // Smooth interaction
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
      // Apenas a caixa de molde está no centro.
      // ====================================================
      masterTimeline
        // Mold upper cope closes onto drag base
        .to(moldTop.position, { y: 0.7, duration: 0.18, ease: "power2.inOut" }, 0)
        // Camera stays focused on mold
        .to(camera.position, { x: 0, y: 1.8, z: 5.2, duration: 0.2 }, 0)
        .to(cameraTarget, { x: 0, y: 0.4, z: 0, duration: 0.2 }, 0);

      // ----------------------------------------------------
      // TRANSIÇÃO 1 (20% -> 25%): Molde sai à esquerda, Forno entra pela direita
      // ----------------------------------------------------
      masterTimeline
        .to(moldGroup.position, { x: -16, duration: 0.05, ease: "power2.in" }, 0.2)
        .to(furnacePivot.position, { x: 0, y: 1.2, z: 0, duration: 0.05, ease: "power2.out" }, 0.2)
        .to(camera.position, { x: 0, y: 1.8, z: 5.0, duration: 0.05 }, 0.2)
        .to(cameraTarget, { x: 0, y: 0.8, z: 0, duration: 0.05 }, 0.2);

      // ====================================================
      // FASE 2: FUSÃO NO FORNO (Scroll 25% a 45%)
      // O Forno de Indução está no centro.
      // ====================================================
      masterTimeline
        // Metal inside furnace liquefies & glows incandescent (0xffffff / emissive 0xff5500)
        .to(
          furnaceMeltMat.color,
          { r: 1.0, g: 1.0, b: 1.0, duration: 0.18, ease: "power1.in" },
          0.25
        )
        .to(
          furnaceMeltMat.emissive,
          { r: 1.0, g: 0.33, b: 0.0, duration: 0.18, ease: "power1.in" },
          0.25
        )
        .to(furnaceMeltMat, { emissiveIntensity: 5.0, duration: 0.18 }, 0.25)
        .to(furnaceLight, { intensity: 6.0, duration: 0.18 }, 0.25);

      // ====================================================
      // FASE 3: VAZAMENTO FORNO -> PANELA (Scroll 45% a 70%)
      // Furnace shifts left to (-1.2), Ladle enters at (0.6, -0.1)
      // ====================================================
      masterTimeline
        // Reposition furnace slightly left and bring ladle under spout
        .to(furnacePivot.position, { x: -1.2, y: 1.6, z: 0, duration: 0.05, ease: "power2.inOut" }, 0.45)
        .to(ladlePivot.position, { x: 0.6, y: -0.1, z: 0, duration: 0.05, ease: "power2.out" }, 0.45)
        .to(camera.position, { x: -0.2, y: 1.8, z: 5.4, duration: 0.05 }, 0.45)
        .to(cameraTarget, { x: -0.3, y: 0.6, z: 0, duration: 0.05 }, 0.45)
        // Furnace tilts (basculamento pelo bico/pivô)
        .to(furnacePivot.rotation, { z: -0.65, duration: 0.15, ease: "power2.inOut" }, 0.5)
        // Stream 1 flows down into ladle
        .to(stream1.scale, { x: 1, y: 1, z: 1, duration: 0.08, ease: "power1.in" }, 0.52)
        // Ladle metal fills up & glows incandescent
        .to(
          ladleMeltMat.color,
          { r: 1.0, g: 1.0, b: 1.0, duration: 0.12, ease: "power2.in" },
          0.54
        )
        .to(
          ladleMeltMat.emissive,
          { r: 1.0, g: 0.33, b: 0.0, duration: 0.12, ease: "power2.in" },
          0.54
        )
        .to(ladleMeltMat, { emissiveIntensity: 5.0, duration: 0.12 }, 0.54)
        .to(ladleLight, { intensity: 5.0, duration: 0.12 }, 0.54)
        // End of pouring: stream 1 shrinks back, furnace un-tilts
        .to(stream1.scale, { x: 0, y: 0, z: 0, duration: 0.05 }, 0.66)
        .to(furnacePivot.rotation, { z: 0, duration: 0.05 }, 0.65);

      // ====================================================
      // FASE 4: ENCHIMENTO DO MOLDE (Scroll 70% a 90%)
      // Furnace recedes left, Mold returns to center (0, -0.5), Ladle moves above mold (1.2, 1.9)
      // ====================================================
      masterTimeline
        // Furnace exits left
        .to(furnacePivot.position, { x: -16, duration: 0.03 }, 0.7)
        // Mold returns to center
        .to(moldGroup.position, { x: 0, y: -0.5, z: 0, duration: 0.03, ease: "power2.out" }, 0.7)
        // Ladle positions above mold sprue
        .to(ladlePivot.position, { x: 1.2, y: 1.9, z: 0, duration: 0.03, ease: "power2.out" }, 0.7)
        .to(camera.position, { x: 0.3, y: 1.9, z: 5.2, duration: 0.03 }, 0.7)
        .to(cameraTarget, { x: 0, y: 0.6, z: 0, duration: 0.03 }, 0.7)
        // Ladle tilts to pour into sprue
        .to(ladlePivot.rotation, { z: -0.65, duration: 0.1, ease: "power2.inOut" }, 0.73)
        // Stream 2 flows into sprue cup
        .to(stream2.scale, { x: 1, y: 1, z: 1, duration: 0.06 }, 0.74)
        // Sparks appear at mold sprue
        .to(sparkMat, { opacity: 0.9, duration: 0.06 }, 0.75)
        // Internal cast piece in mold heats up incandescent (0xffffff / emissive 0xff5500)
        .to(
          pieceMat.color,
          { r: 1.0, g: 1.0, b: 1.0, duration: 0.1, ease: "power1.in" },
          0.76
        )
        .to(
          pieceMat.emissive,
          { r: 1.0, g: 0.33, b: 0.0, duration: 0.1, ease: "power1.in" },
          0.76
        )
        .to(pieceMat, { emissiveIntensity: 5.0, duration: 0.1 }, 0.76)
        // End of pour: stream 2 shrinks, sparks fade, ladle un-tilts and exits right
        .to(stream2.scale, { x: 0, y: 0, z: 0, duration: 0.04 }, 0.86)
        .to(sparkMat, { opacity: 0, duration: 0.04 }, 0.86)
        .to(ladlePivot.rotation, { z: 0, duration: 0.04 }, 0.86)
        .to(ladlePivot.position, { x: 16, duration: 0.04 }, 0.87);

      // ====================================================
      // FASE 5: DESMOLDAGEM E PEÇA FINAL (Scroll 90% a 100%)
      // Only Mold in scene, opens up, piece cools to graphite steel
      // ====================================================
      masterTimeline
        // Mold upper cope opens up
        .to(moldTop.position, { y: 2.6, duration: 0.08, ease: "power2.out" }, 0.9)
        // Piece cools down: glowing orange -> dark metallic graphite steel
        .to(
          pieceMat.emissive,
          { r: 0.0, g: 0.0, b: 0.0, duration: 0.09, ease: "power2.out" },
          0.91
        )
        .to(pieceMat, { emissiveIntensity: 0, duration: 0.09 }, 0.91)
        .to(
          pieceMat.color,
          { r: 0.23, g: 0.26, b: 0.32, duration: 0.09, ease: "power2.out" },
          0.91
        )
        // Camera moves in for final close-up of the piece
        .to(camera.position, { x: 0, y: 1.2, z: 3.8, duration: 0.09, ease: "power3.inOut" }, 0.91)
        .to(cameraTarget, { x: 0, y: 0.35, z: 0, duration: 0.09, ease: "power3.inOut" }, 0.91);
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

      // Always update camera target
      camera.lookAt(cameraTarget);

      // Rotation of final piece in Stage 5
      if (pieceGroup) {
        pieceGroup.rotation.y += delta * 0.35;
      }

      // Spark particles movement
      if (sparkMat.opacity > 0) {
        const posArr = sparkGeo.attributes.position.array as Float32Array;
        for (let i = 1; i < posArr.length; i += 3) {
          posArr[i] += delta * 1.2;
          if (posArr[i] > 1.8) {
            posArr[i] = 0;
          }
        }
        sparkGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
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
      if (canvasContainer.contains(renderer.domElement)) {
        canvasContainer.removeChild(renderer.domElement);
      }
    };
  }, []);

  const currentStage = STAGES[activeStep];
  const Icon = currentStage.icon;

  return (
    <section
      id="processo-scroll-container"
      ref={mainRef}
      className="relative w-full bg-[#050505]"
      style={{ height: "500vh" }} // Provides scroll height for 5 distinct stages
    >
      {/* ========================================================= */}
      {/* PINNED FULLSCREEN 3D WEBGL CANVAS */}
      {/* ========================================================= */}
      <div
        id="webgl-canvas-container"
        className="sticky top-0 h-screen w-full overflow-hidden z-0"
      >
        <div ref={canvasContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Cinematic Vignette & Gradient Overlays */}
        <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent via-[#050505]/30 to-[#050505]/95" />
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#050505]/90 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505]/95 to-transparent pointer-events-none" />

        {/* ========================================================= */}
        {/* FLOATING HUD INTERFACE & SCROLLYTELLING CARDS */}
        {/* ========================================================= */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-8 md:p-12 pointer-events-none">
          
          {/* Top Header & Navigation */}
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

            <div className="hidden lg:flex items-center gap-4">
              <Link
                to="/orcamento"
                className="gradient-molten text-white px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 hover:scale-105 shadow-lg shadow-[#ff5500]/20 flex items-center gap-2"
              >
                Solicitar Orçamento
                <ArrowRight size={14} />
              </Link>
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

              {/* Material Badge Footer */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-foreground/70">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-cyan-400" />
                  <span>{currentStage.material}</span>
                </div>
                <span className="font-mono text-[#ff5500] text-[11px] font-semibold">
                  Etapa 0{activeStep + 1} de 05
                </span>
              </div>
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
