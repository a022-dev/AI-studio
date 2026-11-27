import { MouseEvent, ReactNode, useState } from 'react';

interface TiltAlbumCardProps {
  children: ReactNode;
  className?: string;
  accentHex?: string;
  coverUrl?: string;
}

export function TiltAlbumCard({
  children,
  className = '',
  accentHex = '#1DB954',
  coverUrl,
}: TiltAlbumCardProps) {
  const [transform, setTransform] = useState(
    'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
  );
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
      )}deg) scale3d(1.018, 1.018, 1.018)`
    );
    setGlarePos({ x: px * 100, y: py * 100, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)');
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const foilAngle = Math.round(105 + (glarePos.x - 50) * 0.9);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
      }}
      className={`group/tilt relative ${className}`}
    >
      {/* Dynamic Ambient Backlight extracted from album cover */}
      {coverUrl && (
        <img
          src={coverUrl}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute inset-3 -z-10 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] rounded-2xl object-cover opacity-0 blur-2xl transition-opacity duration-300 group-hover/tilt:opacity-45 dark:group-hover/tilt:opacity-55"
        />
      )}

      {/* Subtle interactive specular light sheen + holographic foil sweep */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-xl transition-opacity duration-200"
        style={{
          opacity: glarePos.opacity * 0.22,
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, ${accentHex}66, transparent 58%), linear-gradient(${foilAngle}deg, transparent 22%, rgba(255,255,255,0.45) 42%, rgba(168,85,247,0.22) 52%, rgba(56,189,248,0.24) 60%, transparent 78%)`,
        }}
      />
      {children}
    </div>
  );
}
