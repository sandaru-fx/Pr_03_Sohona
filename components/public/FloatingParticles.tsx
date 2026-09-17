"use client";

import { useEffect, useRef } from "react";

/**
 * Subtle floating light particles rendered on a <canvas>.
 * Simulates drifting candle-light motes rising gently upward.
 * Purely decorative — pointer-events: none.
 */
export function FloatingParticles({
  count = 30,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    type Particle = {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      speedX: number;
      speedY: number;
      pulseSpeed: number;
      pulseOffset: number;
    };

    const particles: Particle[] = [];

    function resize() {
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = width * window.devicePixelRatio;
      canvas!.height = height * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.8 + 0.6,
          opacity: Math.random() * 0.4 + 0.1,
          speedX: (Math.random() - 0.5) * 0.15,
          speedY: -(Math.random() * 0.2 + 0.05),
          pulseSpeed: Math.random() * 0.008 + 0.003,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, width, height);

      const time = Date.now() * 0.001;

      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Pulsing opacity
        const pulse = Math.sin(time * p.pulseSpeed * 100 + p.pulseOffset);
        const currentOpacity = p.opacity * (0.6 + 0.4 * pulse);

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(220, 184, 113, ${currentOpacity})`;
        ctx!.fill();

        // Subtle glow around larger particles
        if (p.radius > 1.2) {
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(220, 184, 113, ${currentOpacity * 0.15})`;
          ctx!.fill();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    resize();
    initParticles();
    animate();

    window.addEventListener("resize", () => {
      resize();
      initParticles();
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden="true"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
