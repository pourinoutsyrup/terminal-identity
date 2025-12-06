import { useState, useEffect } from 'react';

export default function CometLayer({ frequency = 8000 }) {
  const [comets, setComets] = useState([]);

  useEffect(() => {
    const spawn = () => {
      const id = Date.now();
      setComets(prev => [...prev, { id, x: Math.random() * 80, y: 0 }]);
      setTimeout(() => setComets(prev => prev.filter(c => c.id !== id)), 3000);
    };

    const interval = setInterval(spawn, frequency);
    return () => clearInterval(interval);
  }, [frequency]);

  return (
    <div className="fixed inset-0 pointer-events-none z-45 overflow-hidden">
      {comets.map(c => (
        <div
          key={c.id}
          className="absolute text-zinc-500 text-xs comet-trail"
          style={{ left: `${c.x}%`, top: `${c.y}%` }}
        >
          *---&gt;
        </div>
      ))}
    </div>
  );
}