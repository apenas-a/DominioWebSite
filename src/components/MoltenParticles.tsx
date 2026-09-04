import { useEffect, useRef, useCallback } from "react";

interface MoltenParticlesProps {
  density?: "low" | "medium" | "high";
  className?: string;
}

const MoltenParticles = ({ density = "medium", className = "" }: MoltenParticlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  interface Particle {
    x: number;
    y: number;
    size: number;
    speedY: number;
    speedX: number;
    opacity: number;
    life: number;
    maxLife: number;
    hue: number;
    type: "ember" | "dust";
  }

  const getDensityCount = useCallback(() => {
    const base = Math.floor(window.innerWidth / 20);
    const isMobile = window.innerWidth < 768;
    const multiplier = density === "high" ? 1.5 : density === "low" ? 0.4 : 0.8;
    return Math.floor(base * multiplier * (isMobile ? 0.4 : 1));
  }, [density]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent?.clientWidth || window.innerWidth;
      canvas.height = parent?.clientHeight || window.innerHeight;
    };

    const createParticles = () => {
      const count = getDensityCount();
      const particles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const isEmber = Math.random() > 0.65;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: isEmber ? Math.random() * 2.5 + 0.8 : Math.random() * 1.2 + 0.3,
          speedY: isEmber ? Math.random() * -1.8 - 0.4 : Math.random() * -0.4 - 0.08,
          speedX: (Math.random() - 0.5) * (isEmber ? 0.6 : 0.2),
          opacity: isEmber ? Math.random() * 0.5 + 0.15 : Math.random() * 0.2 + 0.05,
          life: Math.random() * 100,
          maxLife: 100 + Math.random() * 200,
          hue: isEmber ? 20 + Math.random() * 20 : 30,
          type: isEmber ? "ember" : "dust",
        });
      }

      particlesRef.current = particles;
    };

    resizeCanvas();
    createParticles();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        p.life += 1;

        // Fade in and out based on life
        const lifeRatio = p.life / p.maxLife;
        const fadeFactor = lifeRatio < 0.1 ? lifeRatio * 10 : lifeRatio > 0.8 ? (1 - lifeRatio) * 5 : 1;
        const currentOpacity = p.opacity * fadeFactor;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (p.type === "ember") {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, `hsla(${p.hue}, 100%, 60%, ${currentOpacity})`);
          grad.addColorStop(0.5, `hsla(${p.hue}, 90%, 45%, ${currentOpacity * 0.6})`);
          grad.addColorStop(1, `hsla(${p.hue}, 80%, 30%, 0)`);
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = `rgba(160, 155, 145, ${currentOpacity})`;
        }

        ctx.fill();

        // Move
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.life * 0.02) * 0.15;

        // Reset when out of bounds or life expired
        if (p.y < -10 || p.life > p.maxLife) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
          p.life = 0;
          p.maxLife = 100 + Math.random() * 200;
        }

        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [getDensityCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
      style={{ opacity: 0.5 }}
      aria-hidden="true"
    />
  );
};

export default MoltenParticles;
