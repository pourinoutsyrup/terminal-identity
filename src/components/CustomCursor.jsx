import { useState, useEffect } from 'react';

export default function CustomCursor({ glyph = '✦' }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>
      <div
        className="fixed pointer-events-none z-[9999] text-zinc-400 text-sm"
        style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
      >
        {glyph}
      </div>
    </>
  );
}