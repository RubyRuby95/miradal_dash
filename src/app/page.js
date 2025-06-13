'use client';
import { useMemo, useState, useEffect } from "react";
import {contarRespuestasPorSemana } from "./utils/contarRespuestasPorSemana";
import { getTop5 } from "./utils/getTop5";
import { apiClient } from "../../lib/apiClient";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import {
  Chart,
  registerables
} from 'chart.js';

import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';

Chart.register(...registerables, MatrixController, MatrixElement);


export default function Dashboard() {

  //llamada a api
const [data, setData] = useState(null);

const fetchUsuarios = async () => {
  try{
      const res = await apiClient.get("/obtenerRespuestas");
      setData(res.data);
      console.log('Datos Recibidos:', res);
      } catch (error){
        console.error("error al procesar datos:", error);
      }
};

  //fin llamada a api



  const animales = [
    "percibe-aves", "percibe-peces", "percibe-ganado", "percibe-ranas", "percibe-insectos"
  ];
  const [mesActual, setMesActual] = useState(new Date());
  const [barDataBasura, setBarDataBasura] = useState([]);
  const [barDataAgua, setBarDataAgua] = useState([]);
  const [heatmapMatrix, setHeatmapMatrix] = useState([]);
  const [grafDataNombre, setGrafDataNombre] = useState([]);
  const [top5, setTop5] = useState([]);
  const [hueleData, setHueleData] = useState([]);
  const [semanasLabels, setSemanasLabels] = useState([]);
  const cambiarMes = (delta) => {
  const nuevoMes = new Date(mesActual);
  nuevoMes.setMonth(mesActual.getMonth() + delta);
  setMesActual(nuevoMes);
  };

  
  useEffect(() => {
    
    const cargarYProcesar = async () => {
      try {
        const res = await fetchUsuarios();
        //const res = await fetch("/data/respuestas.json");
        const json = await res.json();
        setData(json); // aún se usa para guardar en el estado
      
      //const porSemana = contarRespuestasPorSemana(data);
      const porSemana = contarRespuestasPorSemana(json);
      const semanas = Object.keys(porSemana).sort();
      setTop5(getTop5(json));
      



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
      const nombres = [];
      let hueleContador = { "1": 0, "2": 0, "3": 0 };

      const animalSemanal = {};
        animales.forEach(animal => {
          animalSemanal[animal] = Array(semanasFiltradas.length).fill(0);
        });

        semanasFiltradas.forEach((semana, xIdx) => {
          porSemana[semana].forEach((resps) => {
            resps.forEach(({ item, respuesta }) => {
              if (animales.includes(item) && respuesta === "si") {
                animalSemanal[item][xIdx]++;
              }
            });
          });
        });

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
            if (item === "huele" && ["1", "2", "3"].includes(respuesta)) {
              hueleContador[respuesta]++;
            }
          });
        });
        basura.push({ name: semana, si: siBasura, no: noBasura });
        agua.push({ name: semana, si: siAgua, no: noAgua });
        nombres.push({ name: semana, si: siNombre, no: noNombre});
      });


        const heatmap = [];
        animales.forEach((animal) => {
          const max = Math.max(...animalSemanal[animal]);
          const safeMax = max === 0 ? 1 : max;
          animalSemanal[animal].forEach((v, xIdx) => {
            const semana = semanasLabels[xIdx]; // eje X: nombre real de la semana
            const animalNombre = nombreAnimal[animal]; // eje Y: nombre legible del animal
            if (!isNaN(v) && !isNaN(safeMax)) {
              heatmap.push({ x: semana, y: animalNombre, v, maxFila: safeMax });
            }
          });
        });

      setHeatmapMatrix(heatmap);
      setBarDataBasura(basura);
      setBarDataAgua(agua);
      setGrafDataNombre(nombres);
      setSemanasLabels(semanasFiltradas);
      setHueleData([
        { name: "No huele", value: hueleContador["1"] },
        { name: "Hay olores, pero no son molestos", value: hueleContador["2"] },
        { name: "Hay olores desagradables", value: hueleContador["3"] },
      ]);
      
      } catch (error) {
        console.error("Error al cargar o procesar datos:", error);
      }
     };
    cargarYProcesar();
  }, [mesActual]);

  const top5sorted = [...top5].sort((a, b) => b.count - a.count).slice(0, 5);
  

  useEffect(() => {
    const canvas = document.getElementById('heatmapCanvas');
    if (!canvas || !heatmapMatrix.length) return;

    console.log("HeatmapMatrix:", heatmapMatrix);

    const chart = new Chart(canvas, {
      type: 'matrix',
      data: {
        datasets: [{
          label: 'Percepción de animales',
          data: heatmapMatrix,
          backgroundColor: ({ raw }) => {
            const { v, maxFila } = raw;
            const intensity = v / maxFila;
            // Evitar "NaN" o división por cero
            if (isNaN(intensity) || intensity <= 0) return 'rgba(200,200,200,0.3)'; // gris claro para 0
            return `rgba(0, 123, 255, ${intensity})`; // azul con intensidad
          },
          width: ({ chart }) => (chart.chartArea || {}).width / semanasLabels.length - 1,
          height: ({ chart }) => (chart.chartArea || {}).height / animales.length - 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 20
        },
        scales: {
          x: {
            type: 'category',
            labels: semanasLabels, // ← debe coincidir con heatmap[x]
            ticks: { autoSkip: false },
            grid: { display: false }
          },
          y: {
            type: 'category',
            labels: animales.map(key => nombreAnimal[key]), // ← debe coincidir con heatmap[y]
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title(ctx) {
                const x = ctx[0].raw.x;
                return semanasLabels[x];
              },
              label(ctx) {
                const animal = animales[ctx.raw.y];
                return `${animal}: ${ctx.raw.v}`;
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

  const nombreAnimal = {
    "percibe-aves": "Aves",
    "percibe-peces": "Peces",
    "percibe-ganado": "Ganado",
    "percibe-ranas": "Ranas",
    "percibe-insectos": "Insectos"
  };

  return (
    <div className="bigCaja">
      <div className="titulo1">MIRADAL DASHBOARD</div>
      <div className="mes-navegacion">
        <button onClick={() => cambiarMes(-1)}>⬅️</button>
        <span>{mesActual.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
        <button onClick={() => cambiarMes(1)}>➡️</button>
      </div>
      

      <div className="bigCaja">
        <div className="titulo2">¿Sabe Miraflores el nombre de su humedal?</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                data = {pieData}             
                outerRadius={100}
                label
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
          Top 5 nombres más repetidos
        </div>
        {top5sorted.length > 0 ? (
        <>
          <div className="chart-container" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...top5sorted].sort((a, b) => b.count - a.count)} // ordenar descendiente
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" type="category" interval={0} angle={-45} textAnchor="end" />
                <YAxis type="number" />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#4CAF50">
                  <LabelList dataKey="count" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
         </>
        ) : (
          <div>Cargando gráfico...</div>
        )}
        


        <div className="titulo2">
          ¿Se percibieron Animales?
        </div>
        
          <div className="heatmap-canvas-container">
            <canvas id="heatmapCanvas" />
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
        <div className="titulo2">
          Percepción del olor del humedal
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={hueleData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {hueleData.map((entry, index) => (
                  <Cell key={`slice-${index}`} fill={["#2f9e90", "#216b62", "#26302d"][index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}