'use client';
import { useState } from "react";
import GaleriaFotos from "./galeriaFotos";

export default function TarjetaGiratoria({ children, infoAdicional, fotos }) {
  const [volteado, setVolteado] = useState(false);
  const [galeriaAbierta, setGaleriaAbierta] = useState(false);

  const handleFlip = (e) => {
    e.stopPropagation();
    setVolteado(!volteado);
  };

  const handleAbrirGaleria = (e) => {
    e.stopPropagation();
    setGaleriaAbierta(true);
  };

  const handleCerrarGaleria = () => {
    setGaleriaAbierta(false);
  };

  return (
    <>
      <div className="flip-card">
        <div className={`flip-inner ${volteado ? "flipped" : ""}`}>
          <div className="flip-front">
            {/* SOLUCIÓN: Se cambió la etiqueta <p> por <div> para evitar el error. */}
            <div className="flip-text">{infoAdicional}</div>
            <div className="botones-container">
              <button onClick={handleFlip} className="flip-button">
                Ver Gráfico
              </button>
              {/* El botón de ver fotos solo se muestra si la propiedad 'fotos' existe y tiene contenido */}
              {fotos && fotos.length > 0 && (
                <button onClick={handleAbrirGaleria} className="flip-button">
                  Ver fotos
                </button>
              )}
            </div>
          </div>
          <div className="flip-back">
            <div className="flip-content">
              {children}
            </div>
            <button onClick={handleFlip} className="flip-button">
              Ver Información
            </button>
          </div>
        </div>
      </div>
      {/* La galería solo se renderiza si hay fotos */}
      {fotos && fotos.length > 0 && (
        <GaleriaFotos 
          fotos={fotos} 
          abierta={galeriaAbierta} 
          onClose={handleCerrarGaleria} 
        />
      )}
    </>
  );
}
