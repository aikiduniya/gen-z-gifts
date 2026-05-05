import { useState, useRef, useCallback } from 'react';

interface ImageMagnifierProps {
  src: string;
  alt: string;
  className?: string;
  magnifierSize?: number;
  zoomLevel?: number;
}

const ImageMagnifier = ({ src, alt, className = '', magnifierSize = 180, zoomLevel = 4 }: ImageMagnifierProps) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const [bgPos, setBgPos] = useState({ x: '0%', y: '0%' });
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;

    const { left, top, width, height } = container.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;

    const bgX = ((x / width) * 100).toFixed(2);
    const bgY = ((y / height) * 100).toFixed(2);

    setMagnifierPos({ x: x - magnifierSize / 2, y: y - magnifierSize / 2 });
    setBgPos({ x: `${bgX}%`, y: `${bgY}%` });
  }, [magnifierSize]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    updatePosition(e.clientX, e.clientY);
  }, [updatePosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  }, [updatePosition]);

  return (
    <div
      ref={containerRef}
      className={`relative cursor-crosshair ${className}`}
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
      onMouseMove={handleMouseMove}
      onTouchStart={() => setShowMagnifier(true)}
      onTouchEnd={() => setShowMagnifier(false)}
      onTouchMove={handleTouchMove}
      style={{ touchAction: 'none' }}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" draggable={false} />

      {showMagnifier && (
        <div
          className="absolute pointer-events-none rounded-full border-2 border-primary/40 shadow-xl z-50"
          style={{
            width: magnifierSize,
            height: magnifierSize,
            left: magnifierPos.x,
            top: magnifierPos.y,
            backgroundImage: `url(${src})`,
            backgroundSize: `${zoomLevel * 100}%`,
            backgroundPosition: `${bgPos.x} ${bgPos.y}`,
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  );
};

export default ImageMagnifier;
