'use client';
import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';

export default function GraficoNombres({ data }) {
  const pieData = useMemo(() => {
    const totalSi = data.find(d => d.name.toLowerCase() === 'sí')?.value || 0;
    const totalNo = data.find(d => d.name.toLowerCase() === 'no')?.value || 0;

    const total = totalSi + totalNo;

    if (total === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          data: [1],
          backgroundColor: ['#ccc'],
          borderColor: ['#fff'],
          borderWidth: 2
        }]
      };
    }

    return {
      labels: ['Sí', 'No'],
      datasets: [{
        data: [totalSi, totalNo],
        backgroundColor: ['#004b28', '#0f2a19'],
        borderColor: ['#fff', '#fff'],
        borderWidth: 2
      }]
    };
  }, [data]);

  const total = useMemo(() => {
    return data.reduce((sum, d) => sum + d.value, 0);
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: {
        display: true,
        text: total === 0 ? 'No hay datos de nombres' : '¿Conoce el nombre del humedal?'
      },
    },
  };

  return (
    <div style={{ width: '80%', height: '80%' }}>
      <Pie data={pieData} options={options} />
    </div>
  );
}