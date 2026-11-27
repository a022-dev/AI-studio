import { MouseEvent, ReactNode, useState } from 'react';

interface TiltAlbumCardProps {
  children: ReactNode;
  className?: string;
  accentHex?: string;
}

export function TiltAlbumCard({
  children,
  className = '',
  accentHex = '#1DB954',
}: TiltAlbumCardProps) {
  const [transform, setTransform] = useState('perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)');
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * 9;
    const rotateX = (0.5 - py) * 9;

    setTransform(
      `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(
        2
      )}deg) scale3d(1.015, 1.015, 1.015)`
    );
    setGlarePos({ x: px * 100, y: py * 100, opacity: 0.14 });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)');
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
      }}
      className={`relative ${className}`}
    >
      {/* Subtle interactive specular light sheen following cursor */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-xl transition-opacity duration-200"
        style={{
          opacity: glarePos.opacity,
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, ${accentHex}55, transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
}
