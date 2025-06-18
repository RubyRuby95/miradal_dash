'use client';
import { useState } from "react";

export default function TarjetaGiratoria({ children, infoAdicional }) {
  const [volteado, setVolteado] = useState(false);

  //Función para manejar el volteo, detiene la propagación del evento
  const handleFlip = (e) => {
    e.stopPropagation();
    setVolteado(!volteado);
  };

  return (
    <div className="flip-card">
      <div className={`flip-inner ${volteado ? "flipped" : ""}`}>
        {/*Anverso de la tarjeta con su propio boton*/}
        <div className="flip-front">
          <p className="flip-text">{infoAdicional}</p>
          <button onClick={handleFlip} className="flip-button">
            Ver Gráfico
          </button>
        </div>
        {/*Reverso de la tarjeta con el contenido y su boton*/}
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
  );
}
