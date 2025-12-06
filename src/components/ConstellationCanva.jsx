import { useEffect, useRef } from 'react';

export default function ConstellationCanvas({ constellations, onClick }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight / 3;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 0.5;

    constellations.forEach(c => {
      ctx.beginPath();
      c.stars.forEach((star, i) => {
        const x = (star.x / 100) * canvas.width;
        const y = (star.y / 100) * canvas.height;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }, [constellations]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 pointer-events-none z-39"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}