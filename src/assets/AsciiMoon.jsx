import React, { memo } from 'react';
import { useCurvedAsciiMoon } from '../hooks/useCurvedAsciiMoon';

// Wrapped in React.memo to prevent re-renders
const AsciiMoon = memo(() => {
  const moonArt = useCurvedAsciiMoon();

  if (!moonArt) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '1rem',    
        right: '-1rem',  
        zIndex: 50,
        pointerEvents: 'none',
        transform: 'rotate(23.44deg) translateZ(0)', // Added translateZ(0) to fix flickering
        transformOrigin: 'center center',
        color: '#52525b',      
        opacity: 1.0,          
        mixBlendMode: 'screen',
        willChange: 'transform' // Hint to browser to optimize for changes
      }}
    >
      <pre style={{ 
        fontFamily: 'monospace', 
        margin: 0, 
        textAlign: 'right',
        fontWeight: 'bold',
        transform: 'scaleX(0.725)', 
        transformOrigin: 'center center',
        fontSize: '3px',       
        lineHeight: '3px',     
        letterSpacing: '0px', 
      }}>
        {moonArt}
      </pre>
    </div>
  );
});

export default AsciiMoon;