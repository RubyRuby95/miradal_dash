'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function GaleriaFotos({ fotos = [], abierta, onClose }) {
  const [fotoActual, setFotoActual] = useState(0);

  const handleAnterior = () => {
    setFotoActual((prev) => (prev === 0 ? fotos.length - 1 : prev - 1));
  };

  const handleSiguiente = () => {
    setFotoActual((prev) => (prev === fotos.length - 1 ? 0 : prev + 1));
  };

  if (!abierta || fotos.length === 0) return null;

  return (
    <div className="galeria-modal">
      <div className="galeria-contenido">
        <div className="galeria-img-wrapper" style={{ position: 'relative', width: '100%', height: '300px' }}>
          <Image
            src={fotos[fotoActual]}
            alt={`Foto ${fotoActual + 1}`}
            layout="fill"
            objectFit="contain"
            className="galeria-img"
          />
        </div>
        <div className="galeria-controles">
          <button onClick={handleAnterior} className="galeria-flecha">←</button>
          <button onClick={handleSiguiente} className="galeria-flecha">→</button>
        </div>
        <button onClick={onClose} className="galeria-cerrar">✕</button>
      </div>
    </div>
  );
}