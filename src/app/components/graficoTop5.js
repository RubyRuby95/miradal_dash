'use client';
import React from 'react';

export default function GraficoTop5({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ backgroundColor: '#f5f5f5', padding: 20, textAlign: 'center' }}>
        <h3>Top 5 Animales más mencionados</h3>
        <p style={{ color: '#999' }}>Sin datos</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ textAlign: 'center' }}>Top 5 Animales más mencionados</h3>
      <ul style={{ listStyle: 'none', padding: 0, textAlign: 'center' }}>
        {data.map((item, index) => (
          <li key={index}>
            <strong>{index + 1}.</strong> {item.nombre} ({item.cantidad} menciones)
          </li>
        ))}
      </ul>
    </div>
  );
}