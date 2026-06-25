import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  color: string;
}

export const ParticlesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const scrollRef = useRef({ y: window.scrollY, speed: 0, targetSpeed: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    const particleCount = 70; // Reduced from 100 for better perf

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const initParticles = () => {
      particles = [];
      // Violet/indigo/white palette to match new design system
      const colors = [
        "rgba(167, 139, 250,", // violet-400
        "rgba(139, 92, 246,",  // violet-500
        "rgba(192, 132, 252,", // purple-400
        "rgba(255, 255, 255,", // white
        "rgba(99, 102, 241,",  // indigo-500
        "rgba(6, 182, 212,",   // cyan-500 (accent)
      ];

      for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 2 + 0.4;
        const baseAlpha = Math.random() * 0.28 + 0.04;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -(Math.random() * 0.4 + 0.08),
          radius,
          alpha: baseAlpha,
          baseAlpha,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    initParticles();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const handleMouseLeave = () => { mouseRef.current.active = false; };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - scrollRef.current.y;
      scrollRef.current.y = currentScrollY;
      scrollRef.current.targetSpeed = diff * 0.12;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });

    const render = () => {
      // Clear with slight transparency for motion trail
      ctx.fillStyle = "rgba(2, 4, 10, 0.22)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      scrollRef.current.speed += (scrollRef.current.targetSpeed - scrollRef.current.speed) * 0.1;
      scrollRef.current.targetSpeed *= 0.85;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy - scrollRef.current.speed * (p.radius * 0.55);

        if (mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const limit = 110;

          if (distance < limit) {
            const force = (limit - distance) / limit;
            const angle = Math.atan2(dy, dx);
            p.x += Math.cos(angle) * force * 1.4;
            p.y += Math.sin(angle) * force * 1.4;
            p.alpha = Math.min(p.baseAlpha * 2.8, 0.75);
          } else {
            p.alpha += (p.baseAlpha - p.alpha) * 0.05;
          }
        } else {
          p.alpha += (p.baseAlpha - p.alpha) * 0.05;
        }

        if (p.x < 0) p.x = canvas.width;
        else if (p.x > canvas.width) p.x = 0;

        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        } else if (p.y > canvas.height) {
          p.y = 0;
          p.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowBlur = p.radius > 1.2 ? 6 : 0;
        ctx.shadowColor = "rgba(139, 92, 246, 0.5)";
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-10"
      style={{ mixBlendMode: "screen", opacity: 0.65 }}
    />
  );
};
