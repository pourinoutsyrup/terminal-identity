import { useState, useEffect } from 'react';

export default function SkyLayer({ density = 50, mode = 'mystic' }) {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: density }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 30,
      size: Math.random() > 0.7 ? 'text-xs' : 'text-[8px]',
      delay: Math.random() * 3
    }));
    setStars(generated);
  }, [density]);

  return (
    <div className="fixed inset-x-0 top-0 h-1/3 pointer-events-none z-40 overflow-hidden">
      {stars.map(s => (
        <span
          key={s.id}
          className={`absolute ${s.size} text-zinc-600 star-flicker`}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            animationDelay: `${s.delay}s`
          }}
        >
          ·
        </span>
      ))}
    </div>
  );
}