import React, { useEffect, useRef } from 'react';

export const Confetti = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        dx: (Math.random() - 0.5) * 4,
        dy: Math.random() * 5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 2,
        tilt: Math.random() * 10,
        tiltAngle: Math.random() * Math.PI,
        tiltAngleIncremental: Math.random() * 0.08 + 0.05
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let completed = 0;
      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += p.dy;
        p.x += Math.sin(p.tiltAngle) * 2;
        p.tilt = Math.sin(p.tiltAngle) * 15;

        ctx.beginPath();
        ctx.lineWidth = p.size / 2;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.size / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.size / 2);
        ctx.stroke();

        if (p.y > canvas.height) completed++;
      });

      if (completed < particles.length) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[100] pointer-events-none"
    />
  );
};