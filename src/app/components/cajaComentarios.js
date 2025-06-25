'use client';
import React from 'react';

export default function CajaComentarios({ comentarios }) {
  if (comentarios.length === 0) {
    return <div className="comentarios-container">No hay comentarios disponibles.</div>;
  }

  return (
    <div className="comentarios-container">
      <h2>Comentarios de los participantes</h2>
      <ul className="comentarios-lista">
        {comentarios.map((c, i) => (
          <li key={i} className="comentario-item">
            <p className="comentario-texto">🗨️ {c.texto}</p>
            {c.timestamp && <p className="comentario-fecha">🕒 {c.timestamp}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}