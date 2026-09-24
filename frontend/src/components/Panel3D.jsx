import { useState, useRef, useCallback } from 'react';
import './Panel3D.css';

/**
 * Panel3D provides hyper-realistic 3D perspective bending and tilt.
 * As the user moves their cursor over the panel, it bends in 3D space
 * with specular lighting glare and depth elevation.
 */
export default function Panel3D({
  children,
  className = '',
  maxAngle = 7,
  glow = 'white',
  enableTilt = true,
  onClick,
  style = {}
}) {
  const panelRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('');
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!enableTilt || !panelRef.current) return;
    if (document.documentElement.getAttribute('data-theme') === 'light') return;
    const rect = panelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const px = (x / rect.width - 0.5); // -0.5 to 0.5
    const py = (y / rect.height - 0.5);

    const rotX = -py * maxAngle;
    const rotY = px * maxAngle;

    setTransformStyle(`perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(8px) scale3d(1.008, 1.008, 1.008)`);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 1
    });
  }, [enableTilt, maxAngle]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransformStyle('perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)');
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={panelRef}
      className={`panel-3d-wrapper glow-${glow} ${isHovered ? 'is-bending' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: transformStyle,
        ...style
      }}
    >
      {/* Dynamic Specular Sheen Glare (Monochrome White & Silver) */}
      <div
        className="panel-glare"
        style={{
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 35%, transparent 70%)`,
          opacity: glarePos.opacity
        }}
      />
      {/* Inner Content with 3D Depth */}
      <div className="panel-content-depth">
        {children}
      </div>
    </div>
  );
}
