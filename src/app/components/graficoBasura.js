'use client';
import React from 'react';
import { Bar } from 'react-chartjs-2';

export default function GraficoBasura({ dataPorSemana }) {
  if (!dataPorSemana || dataPorSemana.length === 0) {
    return (
      <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee' }}>
        <p style={{ color: '#666' }}>Sin datos</p>
      </div>
    );
  }

  const labels = dataPorSemana.map(d => d.semana);

  const siData = dataPorSemana.map(d => {
    const val = d.data.find(x => x.name.toLowerCase() === 'sí');
    return val?.value ?? 0;
  });

  const noData = dataPorSemana.map(d => {
    const val = d.data.find(x => x.name.toLowerCase() === 'no');
    return val?.value ?? 0;
  });

  const total = siData.reduce((a, b) => a + b, 0) + noData.reduce((a, b) => a + b, 0);
  if (total === 0) {
    return (
      <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee' }}>
        <p style={{ color: '#666' }}>Sin datos</p>
      </div>
    );
  }

  const chartData = {
    labels,
    datasets: [
      { label: 'Sí', data: siData, backgroundColor: '#0f2a19' },
      { label: 'No', data: noData, backgroundColor: '#004b28' },
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { stacked: true }, y: { stacked: true } },
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Percepción de Desechos por Semana' } }
  };

  return <div style={{ height: 300 }}><Bar data={chartData} options={options} /></div>;
}