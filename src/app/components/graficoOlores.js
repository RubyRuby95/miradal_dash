'use client';
import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';

export default function GraficoOlores({ data }) {
  const pieData = useMemo(() => {
    const labelMap = {
      '1': 'No huele',
      '2': 'Hay olores, pero no son molestos',
      '3': 'Hay olores desagradables'
    };

    const labels = data.map(item => labelMap[item.name] || item.name);
    const values = data.map(item => item.value);
    const total = values.reduce((sum, val) => sum + val, 0);

    return {
      total,
      chart: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: ['#168f65', '#07361f', '#0a1d12'],
          borderColor: ['#fff', '#fff', '#fff'],
          borderWidth: 2
        }]
      }
    };
  }, [data]);

  if (pieData.total === 0) {
    return (
      <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee' }}>
        <p style={{ color: '#666' }}>Sin datos</p>
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Percepción de Olores' }
    }
  };

  return <div style={{ height: 300 }}><Pie data={pieData.chart} options={options} /></div>;
}