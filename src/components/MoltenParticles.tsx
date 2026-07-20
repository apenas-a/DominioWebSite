import { useEffect, useRef } from "react";

const MoltenParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      layer: "fast" | "slow";
    }> = [];

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const createParticles = () => {
      particles = [];
      const particleCount = Math.floor(window.innerWidth / 15);
      
      for (let i = 0; i < particleCount; i++) {
        const isFast = Math.random() > 0.7;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: isFast ? Math.random() * 2.5 + 1 : Math.random() * 1.5 + 0.5,
          speedY: isFast ? Math.random() * -1.5 - 0.5 : Math.random() * -0.5 - 0.1,
          speedX: (Math.random() - 0.5) * (isFast ? 0.8 : 0.3),
          opacity: isFast ? Math.random() * 0.5 + 0.2 : Math.random() * 0.3 + 0.1,
          layer: isFast ? "fast" : "slow",
        });
      }
    };

    createParticles();

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        if (p.layer === "fast") {
          gradient.addColorStop(0, `rgba(255, 120, 30, ${p.opacity})`);
          gradient.addColorStop(1, "rgba(255, 120, 30, 0)");
        } else {
          gradient.addColorStop(0, `rgba(180, 180, 180, ${p.opacity})`);
          gradient.addColorStop(1, "rgba(180, 180, 180, 0)");
        }
        
        ctx.fillStyle = gradient;
        ctx.fill();

        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < 0 || p.x > canvas.width) {
          p.speedX *= -1;
        }
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    drawParticles();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
};

export default MoltenParticles;
