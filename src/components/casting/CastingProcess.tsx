import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CastingScene from './CastingScene';
import { useResponsiveQuality } from './hooks/useResponsiveQuality';
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
  Eye,
  Cog,
  type LucideIcon,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// 15 stages data for floating HUD
interface StageData {
  id: number;
  number: string;
  tag: string;
  title: string;
  icon: LucideIcon;
  temp: string;
  material: string;
  desc: string;
  range: [number, number];
}

const STAGES: StageData[] = [
  { id: 1, number: '01', tag: 'Molde Aberto', title: 'Caixa de Moldagem Aberta', icon: Box, temp: '25°C', material: 'Areia Verde Sintética', desc: 'A cavidade negativa da engrenagem é revelada na areia de moldagem, exibindo dentes, furo central e canais de alimentação.', range: [0, 0.08] },
  { id: 2, number: '02', tag: 'Fechamento', title: 'Fechamento do Molde', icon: Box, temp: '25°C', material: 'Areia Verde Sintética', desc: 'A tampa superior desce com precisão pelos pinos-guia e veda o conjunto, selando a cavidade.', range: [0.08, 0.15] },
  { id: 3, number: '03', tag: 'Transição', title: 'Transição para o Forno', icon: Layers, temp: '—', material: '—', desc: 'O molde fechado é transportado até a estação de fusão.', range: [0.15, 0.20] },
  { id: 4, number: '04', tag: 'Forno Vazio', title: 'Forno de Indução Vazio', icon: Flame, temp: '200°C', material: 'Ferro Nodular', desc: 'Interior aquecido do cadinho, pronto para receber a carga metálica.', range: [0.20, 0.27] },
  { id: 5, number: '05', tag: 'Fusão', title: 'Enchimento e Fusão', icon: Flame, temp: '1520°C', material: 'Ferro Fundido', desc: 'O metal líquido preenche o cadinho com incandescência uniforme e ondulações suaves.', range: [0.27, 0.34] },
  { id: 6, number: '06', tag: 'Basculamento', title: 'Inclinação do Forno', icon: Wrench, temp: '1500°C', material: 'Ferro Líquido', desc: 'O forno bascula pelo pivô do bico de vazamento para iniciar o despejo.', range: [0.34, 0.42] },
  { id: 7, number: '07', tag: 'Vazamento', title: 'Forno Despejando na Panela', icon: Droplets, temp: '1480°C', material: 'Inoculação na Concha', desc: 'O metal incandescente flui da boca do forno ao centro exato da abertura da panela.', range: [0.42, 0.50] },
  { id: 8, number: '08', tag: 'Transporte', title: 'Alinhamento sobre o Sprue', icon: Wrench, temp: '1460°C', material: 'Liga Inoculada', desc: 'A panela cônica tem seu eixo perfeitamente alinhado e centrado sobre a abertura do canal de alimentação (sprue) do molde de engrenagem.', range: [0.50, 0.58] },
  { id: 9, number: '09', tag: 'Vazamento', title: 'Vazamento Dinâmico no Molde', icon: Droplets, temp: '1420°C', material: 'Fluxo Fluido Incandescente', desc: 'A panela inclina-se suavemente sobre seu pivô mantendo o bico diretamente sobre a abertura do sprue, despejando um fluxo contínuo incandescente de partículas fluidas.', range: [0.58, 0.68] },
  { id: 10, number: '10', tag: 'Preenchimento & Ignição', title: 'Preenchimento e Ignição no Molde', icon: Flame, temp: '1400°C', material: 'Conformação dente a dente', desc: 'O metal líquido sobe na cavidade conformando a engrenagem dente por dente. Ao completar o preenchimento, pequenas labaredas e fumaça dinâmica emanam dos risers de alívio.', range: [0.68, 0.75] },
  { id: 11, number: '11', tag: 'Resfriamento', title: 'Solidificação e Resfriamento', icon: Thermometer, temp: '1400°C → 25°C', material: 'Transformação de Fase', desc: 'A panela afasta-se suavemente do molde enquanto a engrenagem transiciona termicamente de incandescência viva (~1400°C) para vermelho fosco e aço resfriado.', range: [0.75, 0.82] },
  { id: 12, number: '12', tag: 'Abertura', title: 'Abertura do Molde', icon: Box, temp: '80°C', material: 'Peça Solidificada', desc: 'A tampa é levantada revelando a peça solidificada no interior da cavidade.', range: [0.82, 0.89] },
  { id: 13, number: '13', tag: 'Revelação', title: 'Peça Revelada', icon: Eye, temp: '60°C', material: 'Engrenagem Bruta', desc: 'A engrenagem solidificada aparece aninhada na cavidade com brilho residual.', range: [0.89, 0.94] },
  { id: 14, number: '14', tag: 'Extração', title: 'Peça Fora do Molde', icon: Sparkles, temp: '40°C', material: 'Desmoldagem', desc: 'A peça é removida verticalmente da cavidade e posicionada para apresentação.', range: [0.94, 0.98] },
  { id: 15, number: '15', tag: 'Produto Final', title: 'Produto Final', icon: Cog, temp: '25°C', material: 'Engrenagem Acabada', desc: 'Peça finalizada, resfriada e pronta para uso industrial com rotação de apresentação.', range: [0.98, 1.0] },
];

export default function CastingProcess() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const quality = useResponsiveQuality();
  const [activeStage, setActiveStage] = useState(0);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        // Throttled state update for HUD (not every frame - ScrollTrigger throttles automatically)
        const stageIdx = STAGES.findIndex(
          (s) => self.progress >= s.range[0] && self.progress < s.range[1]
        );
        setActiveStage(stageIdx >= 0 ? stageIdx : STAGES.length - 1);
        setScrollPct(Math.round(self.progress * 100));
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  const currentStage = STAGES[activeStage];
  const Icon = currentStage.icon;

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#0a0a0c]"
      style={{ height: '600vh' }}
    >
      {/* Sticky Canvas Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* R3F Canvas */}
        <div className="absolute inset-0">
          <Canvas
            dpr={quality.dpr}
            gl={{
              antialias: quality.level !== 'low',
              powerPreference: 'high-performance',
              alpha: false,
              stencil: false,
            }}
            camera={{ fov: 45, near: 0.1, far: 100 }}
            onCreated={({ gl }) => {
              gl.toneMapping = 4; // ACESFilmicToneMapping
              gl.toneMappingExposure = 1.2;
            }}
          >
            <color attach="background" args={['#0a0a0c']} />
            <fog attach="fog" args={['#0a0a0c', 30, 60]} />

            <Suspense fallback={null}>
              <CastingScene progressRef={progressRef} />
            </Suspense>

            {quality.bloomEnabled && (
              <EffectComposer>
                <Bloom
                  intensity={quality.bloomStrength}
                  luminanceThreshold={0.8}
                  luminanceSmoothing={0.4}
                  mipmapBlur
                />
              </EffectComposer>
            )}
          </Canvas>
        </div>

        {/* Vignette Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0a0a0c]/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#0a0a0c]/90 to-transparent" />
        </div>

        {/* HUD Overlay */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-8 md:p-12 pointer-events-none">
          {/* Top Header */}
          <div className="flex items-center justify-between pointer-events-auto">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#ff5500]/30 bg-[#ff5500]/10 backdrop-blur-md text-[11px] uppercase tracking-[0.2em] text-[#ff5500] mb-2">
                <Layers size={13} />
                Processo de Fundição 3D
              </div>
              <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-tight text-white">
                Fundição de <span className="text-[#ff5500]">Engrenagem</span>
              </h1>
            </div>
            <div className="hidden sm:block text-right">
              <div className="font-mono text-sm text-white/60">{scrollPct}%</div>
            </div>
          </div>

          {/* Center Left Card */}
          <div className="my-auto max-w-md self-start pointer-events-auto">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-7 shadow-2xl">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span
                    className="text-4xl font-bold text-transparent leading-none"
                    style={{ WebkitTextStroke: '1px rgba(255,255,255,0.35)' }}
                  >
                    {currentStage.number}
                  </span>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[#ff5500]/40 bg-[#ff5500]/10 text-[10px] uppercase font-bold tracking-wider text-[#ff5500]">
                      <Icon size={11} />
                      {currentStage.tag}
                    </div>
                    <h2 className="text-base sm:text-lg font-bold uppercase text-white mt-1 leading-snug">
                      {currentStage.title}
                    </h2>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end gap-1 text-xs text-[#ff5500] font-mono font-semibold">
                    <Thermometer size={13} />
                    {currentStage.temp}
                  </div>
                </div>
              </div>

              <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-4">
                {currentStage.desc}
              </p>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={13} className="text-cyan-400" />
                  <span>{currentStage.material}</span>
                </div>
                <span className="font-mono text-[#ff5500] text-[11px] font-semibold">
                  Etapa {currentStage.number} / 15
                </span>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto pb-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/40 uppercase tracking-widest">
              <ChevronDown size={14} className="animate-bounce text-[#ff5500]" />
              <span>Role para explorar o processo</span>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
              {STAGES.map((st, idx) => (
                <div
                  key={st.id}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    idx === activeStage
                      ? 'bg-[#ff5500] scale-125 shadow-[0_0_8px_rgba(255,85,0,0.7)]'
                      : idx < activeStage
                      ? 'bg-[#ff5500]/50'
                      : 'bg-white/15'
                  }`}
                  title={st.title}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
