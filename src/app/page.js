'use client';
import { useState, useEffect } from "react";
import {agruparPorSemana, contarRespuestasPorSemana } from "./utils/procesarRespuesta";
import respuestasJson from "../../public/data/respuestas.json";
//import apiClient from "../../lib/apiClient";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import {
  Chart,
  registerables
} from 'chart.js';

import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';

Chart.register(...registerables, MatrixController, MatrixElement);

const animales = [
  "percibe-aves", "percibe-peces", "percibe-ganado", "percibe-ranas", "percibe-insectos"
];

//const res = await apiClient.get('/respuestas');
//const data = res.data;


export default function Dashboard() {
  const [barDataBasura, setBarDataBasura] = useState([]);
  const [barDataAgua, setBarDataAgua] = useState([]);
  const [heatmapMatrix, setHeatmapMatrix] = useState([]);

  useEffect(() => {
    //const porSemana = contarRespuestasPorSemana(respuestasJson);
    const porSemana = contarRespuestasPorSemana(respuestasJson);
    const semanas = Object.keys(porSemana).sort();

    const basura = [];
    const agua = [];
    const heatmap = [];

    semanas.forEach((semana, xIndex) => {
      let siBasura = 0, noBasura = 0;
      let siAgua = 0, noAgua = 0;
      const animalContadores = {
        "percibe-aves": 0,
        "percibe-peces": 0,
        "percibe-ganado": 0,
        "percibe-ranas": 0,
        "percibe-insectos": 0,
      };

      porSemana[semana].forEach((resps) => {
        resps.forEach(({ item, respuesta }) => {
          if (item === "percibe-desechos") {
            respuesta === "si" ? siBasura++ : noBasura++;
          }
          if (item === "percibe-agua-turbia") {
            respuesta === "si" ? siAgua++ : noAgua++;
          }
          if (animales.includes(item) && respuesta === "si") {
            animalContadores[item]++;
          }
        });
      });

      basura.push({ name: semana, si: siBasura, no: noBasura });
      agua.push({ name: semana, si: siAgua, no: noAgua });

      animales.forEach((animal, yIndex) => {
        heatmap.push({
          x: xIndex,
          y: yIndex,
          v: animalContadores[animal],
        });
      });
    });

    setBarDataBasura(basura);
    setBarDataAgua(agua);
    setHeatmapMatrix(heatmap);
  }, []);

  useEffect(() => {
    const canvas = document.getElementById('heatmapCanvas');
    if (!canvas || !heatmapMatrix.length) return;

    const chart = new Chart(canvas, {
      type: 'matrix',
      data: {
        datasets: [{
          label: 'Percepción de animales',
          data: heatmapMatrix,
          backgroundColor(ctx) {
            const value = ctx.raw.v;
            const alpha = Math.min(1, value / 10);
            return `rgba(0, 150, 0, ${alpha})`;
          },
          width: ({ chart }) => {
          const area = chart.chartArea;
          return area ? area.width / 7 - 4 : 40;
          },
          height: ({ chart }) => {
          const area = chart.chartArea;
          return area ? area.height / 5 - 4 : 40;
          },
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            min: -0.5,
            max: 6.5,
            ticks: { stepSize: 1 },
            grid: { display: false }
          },
          y: {
            type: 'linear',
            min: -0.5,
            max: animales.length - 0.5,
            ticks: {
              stepSize: 1,
              callback: (val) => animales[val]
            },
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(ctx) {
                return `Cantidad: ${ctx.raw.v}`;
              }
            }
          }
        }
      }
    });

    return () => chart.destroy();
  }, [heatmapMatrix]);

  return (
    <div className="bigCaja">
      <div className="titulo1">MIRADAL DASHBOARD</div>
      

      <div>
        <div className="titulo2">
          Heatmap de Percepción de Animales
        </div>
        <div className="heat">
          <canvas id="heatmapCanvas" />
        </div>

          <div className="titulo2">Percepción de Desechos</div>
        <div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barDataBasura}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="si" stackId="a" fill="#2d4b42" />
              <Bar dataKey="no" stackId="a" fill="#36bbaa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="titulo2">
          Percepción de Agua Turbia
        </div>
        <div >
         
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barDataAgua}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="si" stackId="b" fill="#2d4b42" />
              <Bar dataKey="no" stackId="b" fill="#36bbaa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
      </div>
    </div>
  );
}