'use client';
import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';

Chart.register(MatrixController, MatrixElement);

export default function HeatmapAnimales({ data, semanasLabels, animales }) {
  const canvasRef = useRef();
  //console.log('heatmap data', data);
  //console.log('heatmap semanalabels', semanasLabels);


  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');

    if (window.heatmapChartInstance) {
      window.heatmapChartInstance.destroy();
    }

    window.heatmapChartInstance = new Chart(ctx, {
      type: 'matrix',
      data: {
        datasets: [{
          label: 'Animales vs Semanas',
          data,
          backgroundColor: ctx => {
            const raw = ctx.raw;
            if (!raw || raw.v === undefined || raw.y === undefined) return 'rgba(0,0,0,0)';
            const value = raw.v;
            const row = raw.y;
            const maxValRow = Math.max(...data.filter(d => d.y === row).map(d => d.v));
            const alpha = maxValRow > 0 ? value / maxValRow : 0;
            return `rgba(63, 81, 181, ${alpha})`;
          },
          borderColor: 'white',
          borderWidth: 1,
          width: () => 20,
          height: () => 20,
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: () => '',
              label: ctx => {
                const semana = semanasLabels[ctx.raw.x];
                const animal = ctx.chart.data.datasets[0].data.find(d => d.x === ctx.raw.x && d.y === ctx.raw.y).animal;
                return `${animal} - Semana ${semana}: ${ctx.raw.v}`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            ticks: {
              callback: value => semanasLabels[value] ?? ''
            }
          },
          y: {
            type: 'linear',
            position: 'left',
            ticks: {
              callback: value => animales[value]?.replace('percibe-', '') ?? ''
            }
            
          }
        }
      }
    });
  }, [data, semanasLabels]);

  if (!data || data.length === 0) {
    return (
      <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e0e0e0' }}>
        <p style={{ color: '#666' }}>Sin datos</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ textAlign: 'center' }}>Animales vs Semanas</h3>
      <canvas ref={canvasRef} />
    </div>
  );
}