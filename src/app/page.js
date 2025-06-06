'use client';
import { useMemo, useState, useEffect } from "react";
import {contarRespuestasPorSemana } from "./utils/procesarRespuesta";
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


//const res = await apiClient.get('/respuestas');
//const data = res.data;


export default function Dashboard() {
  const animales = [
    "percibe-aves", "percibe-peces", "percibe-ganado", "percibe-ranas", "percibe-insectos"
  ];


  const [mesActual, setMesActual] = useState(new Date());
  const [barDataBasura, setBarDataBasura] = useState([]);
  const [barDataAgua, setBarDataAgua] = useState([]);
  const [heatmapMatrix, setHeatmapMatrix] = useState([]);
  const [grafDataNombre, setGrafDataNombre] = useState([]);

  const cambiarMes = (delta) => {
  const nuevoMes = new Date(mesActual);
  nuevoMes.setMonth(mesActual.getMonth() + delta);
  setMesActual(nuevoMes);
  };

  useEffect(() => {
    //const porSemana = contarRespuestasPorSemana(data);
    const porSemana = contarRespuestasPorSemana(respuestasJson);
    const semanas = Object.keys(porSemana).sort();

    // Filtra semanas del mes visible
    const semanasFiltradas = semanas.filter(semana => {
    const fecha = new Date(semana);
    return (
      fecha.getFullYear() === mesActual.getFullYear() &&
      fecha.getMonth() === mesActual.getMonth()
    );
    });

    const basura = [];
    const agua = [];
    const heatmap = [];
    const nombres = [];

    semanasFiltradas.forEach((semana, xIndex) => {
      let siNombre = 0, noNombre = 0;
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
          if (item === "conoce-nombre-humedal") {
            respuesta === "si" ? siNombre++ : noNombre++;
          }
          if (animales.includes(item) && respuesta === "si") {
            animalContadores[item]++;
          }
        });
      });

      basura.push({ name: semana, si: siBasura, no: noBasura });
      agua.push({ name: semana, si: siAgua, no: noAgua });
      nombres.push({ name: semana, si: siNombre, no: noNombre});

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
    setGrafDataNombre(nombres);
    setHeatmapMatrix(heatmap);
  }, [mesActual]);

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
            max: 5.5,
            ticks: { stepSize: 1, display: false },
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


  //grafico de pastel datos
  const pieData = useMemo(() => {
    const totalSi = grafDataNombre.reduce((sum, item) => sum + item.si, 0);
    const totalNo = grafDataNombre.reduce((sum, item) => sum + item.no, 0);

    return [
      { name: 'Sí', value: totalSi },
      { name: 'No', value: totalNo }
    ];
  }, [grafDataNombre]);
  const colors = ['#2f9e90', '#216b62'];
  //end of grafico de pastel datos

  return (
    <div className="bigCaja">
      <div className="titulo1">MIRADAL DASHBOARD</div>
      <div className="mes-navegacion">
        <button onClick={() => cambiarMes(-1)}>⬅️</button>
        <span>{mesActual.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
        <button onClick={() => cambiarMes(1)}>➡️</button>
      </div>
      

      <div>
        <div className="titulo2">¿Sabe Miraflores el nombre de su humedal?</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                data = {pieData}             
                outerRadius={100}
                >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        <div className="titulo2">


          ¿Se percibieron Animales?
        </div>
        <div className="heatmap-wrapper">
          <div className="heatmap-labels">
            {['Aves', 'Ganado', 'Insectos', 'Peces', 'Ranas'].map((label, idx) => (
              <div key={idx} className="heatmap-label">{label}</div>
            ))}
          </div>
          <div className="heatmap-canvas-container">
            <canvas id="heatmapCanvas" />
          </div>
        </div>

        <div className="titulo2">


          ¿Se observó basura?
        </div>
          <div className="chart-container">
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


          ¿Percibieron agua turbia?
        </div>
        <div className="chart-container">
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