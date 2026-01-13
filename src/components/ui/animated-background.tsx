import { useEffect, useRef } from 'react';

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation variables
    let animationFrameId: number;
    let time = 0;
    const speed = 0.0005;

    // Gradient colors - dark gray variations
    const colors = [
      '#1a1a1a', // Very dark gray
      '#2d2d2d', // Dark gray
      '#3a3a3a', // Medium dark gray
      '#2a2a2a', // Dark gray
      '#1f1f1f', // Very dark gray
    ];

    const animate = () => {
      time += speed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create animated gradient
      const gradient = ctx.createLinearGradient(
        canvas.width / 2 + Math.sin(time) * 200,
        canvas.height / 2 + Math.cos(time) * 200,
        canvas.width / 2 + Math.sin(time + Math.PI) * 200,
        canvas.height / 2 + Math.cos(time + Math.PI) * 200
      );

      // Add color stops with animation
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(0.25, colors[1]);
      gradient.addColorStop(0.5, colors[2]);
      gradient.addColorStop(0.75, colors[3]);
      gradient.addColorStop(1, colors[4]);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle moving particles/shapes
      const particleCount = 20;
      for (let i = 0; i < particleCount; i++) {
        const x = (canvas.width / particleCount) * i + Math.sin(time * 2 + i) * 50;
        const y = (canvas.height / particleCount) * i + Math.cos(time * 2 + i) * 50;
        const size = 2 + Math.sin(time + i) * 1;
        const opacity = 0.1 + Math.sin(time + i) * 0.05;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ background: '#1a1a1a' }}
    />
  );
}
