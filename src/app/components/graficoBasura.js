'use client';
import React from 'react';
import { Bar } from 'react-chartjs-2';

export default function GraficoBasura({ data }) {
  const siObj = data.find(d => d.name.toLowerCase() === 'sí');
  const noObj = data.find(d => d.name.toLowerCase() === 'no');

  const si = siObj?.value ?? 0;
  const no = noObj?.value ?? 0;
  const total = si + no;

  if (total === 0) {
    return (
      <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee' }}>
        <p style={{ color: '#666' }}>Sin datos</p>
      </div>
    );
  }

  const chartData = {
    labels: ['Total'],
    datasets: [
      { label: 'Sí', data: [si], backgroundColor: '#343a40' },
      { label: 'No', data: [no], backgroundColor: '#56B4A9' },
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { stacked: true }, y: { stacked: true } },
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Percepción de Desechos' } }
  };

  return <Bar data={chartData} options={options} />;
}