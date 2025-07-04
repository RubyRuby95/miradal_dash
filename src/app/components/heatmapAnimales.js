'use client';
import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';

Chart.register(MatrixController, MatrixElement);

export default function HeatmapAnimales({ data, semanasLabels, animales }) {
  const canvasRef = useRef();

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (window.heatmapChartInstance) {
      window.heatmapChartInstance.destroy();
    }

    window.heatmapChartInstance = new Chart(ctx, {
      type: 'matrix',
      data: {
        datasets: [
          {
            label: 'Animales vs Semanas',
            data,
            backgroundColor: ctx => {
              const raw = ctx.raw;
              if (!raw || raw.v === undefined || raw.y === undefined) return 'rgba(0,0,0,0)';
              const value = raw.v;
              const row = raw.y;
              const maxValRow = Math.max(...data.filter(d => d.y === row).map(d => d.v));
              const alpha = maxValRow > 0 ? value / maxValRow : 0;
              return `rgba(0, 75, 9, ${alpha})`;
            },
            borderColor: 'white',
            width: ({ chart }) => {
              const area = chart.chartArea;
              if (!area) return 20;
              return Math.max((area.width - 0) / semanasLabels.length - 2, 10);
            },
            height: ({ chart }) => {
              const area = chart.chartArea;
              if (!area) return 20;
              return Math.max((area.height - 0) / animales.length - 2, 10);
            }
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Percepción de Animales por Semana' },
          tooltip: {
            callbacks: {
              title: () => '',
              label: ctx => {
                const semana = semanasLabels[ctx.raw.x];
                const animal = ctx.chart.data.datasets[0].data.find(
                  d => d.x === ctx.raw.x && d.y === ctx.raw.y
                )?.animal;
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

    return () => {
      if (window.heatmapChartInstance) {
        window.heatmapChartInstance.destroy();
        delete window.heatmapChartInstance;
      }
    };
  }, [data, semanasLabels, animales]);

  if (!data || data.length === 0) {
    return (
      <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e0e0e0' }}>
        <p style={{ color: '#666' }}>Sin datos</p>
      </div>
    );
  }

  return (
    <div className="heatmap-responsive-wrapper">
      <div style={{ flex: 1, position: 'relative' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}