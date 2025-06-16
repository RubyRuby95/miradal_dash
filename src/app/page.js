'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';

import TarjetaGiratoria from './components/TarjetaGiratoria';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);

//Componente grafico de torta
const GraficoDeTorta = ({ titulo, etiquetas, valores }) => {
  const data = {
    labels: etiquetas,
    datasets: [{
      label: titulo,
      data: valores,
      backgroundColor: ["#343a40", "#56B4A9"],
      borderColor: ["#ffffff", "#ffffff"],
      borderWidth: 2,
    }],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" }, title: { display: true, text: titulo } },
  };
  return <Pie data={data} options={options} />;
};

//Componente grafico de barras apiladas
const GraficoDeComparacion = ({ titulo, dataSi, dataNo, labels }) => {
  const data = {
    labels,
    datasets: [
      { label: 'Sí', data: dataSi, backgroundColor: '#343a40' },
      { label: 'No', data: dataNo, backgroundColor: '#56B4A9' },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: !!titulo, text: titulo, font: { size: 16 } },
    },
    scales: { x: { stacked: true }, y: { stacked: true } },
  };
  return <div style={{ position: 'relative', height: '100%', width: '100%' }}><Bar options={options} data={data} /></div>;
};

//Componente Heatmap
const HeatmapAnimales = ({ datos, dias }) => (
  <div className="heatmap-container" style={{ maxWidth: '380px', width: '100%' }}>
    <h2 className="chart-title">Percepción Semanal de Animales</h2>
    <div className="heatmap-grid" style={{ gridTemplateColumns: `80px repeat(${dias}, 1fr)` }}>
      <div />
      {Array.from({ length: dias }).map((_, i) => (
          <div key={`day-label-${i}`} className="heatmap-day-label" />
      ))}
      {datos.map((item) => (
        <React.Fragment key={item.animal}>
          <div className="heatmap-label">{item.animal}</div>
          {item.valores.map((valor, index) => (
            <div
              key={`${item.animal}-${index}`}
              className={`heatmap-cell ${valor > 0 ? 'active' : ''}`}
              title={`Cantidad: ${valor}`}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  </div>
);

//Datos para los graficos
const diasDeLaSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const datosAnimalesMayo = [
  { animal: 'Aves', valores: [1, 0, 0, 1, 0] },
  { animal: 'Ganado', valores: [0, 1, 0, 0, 1] },
  { animal: 'Insectos', valores: [1, 1, 0, 1, 1] },
  { animal: 'Peces', valores: [0, 0, 1, 0, 0] },
  { animal: 'Ranas', valores: [0, 0, 0, 1, 0] },
];
const datosTortaConocimiento = { etiquetas: ["No", "Sí"], valores: [80, 20] };
const datosAguaTurbia = { si: [70, 75, 62, 80, 65], no: [30, 25, 38, 20, 35] };
const datosBasura = { si: [60, 55, 78, 45, 72], no: [40, 45, 22, 55, 28] };
const datosOlor = {
    etiquetas: ["1\nNo hay olor", "2", "3", "4", "5\nMuy mal olor"],
    valores: [180, 160, 195, 170, 210]
};

//Principio pagina
export default function DashboardPage() {
  const logoPath = "/logo-uach.png";

  return (
    <main className="main-container">
        <div className="main-card-wrapper">
            <div className="section-header-main">
                <h1>MIRADAL DASHBOARD</h1>
                <div className="logo-container">
                <Image src={logoPath} alt="Logo Universidad Austral de Chile" width={150} height={64} style={{ objectFit: 'contain' }} />
                </div>
            </div>
            
            <div className="main-card-content-area">
                {/*Tarjeta de Introduccion*/}
                <div className="dashboard-card-static">
                    <h2 className="chart-title">Bienvenido al Dashboard de Miradal</h2>
                    <p>
                        Esta página presenta una visualización de los datos recopilados sobre la percepción ambiental del Humedal Miraflores en Valdivia.
                        Cada tarjeta interactiva muestra un aspecto diferente del estudio. Haz clic en los botones para explorar los graficos.
                    </p>
                </div>
            
                <div className="dashboard-grid">

                    {/*Grafico de Torta*/}
                    <div className="dashboard-card">
                    <TarjetaGiratoria
                        infoAdicional="El 80% de los encuestados no conoce el nombre del humedal. Haz clic para ver el grafico."
                    >
                        <GraficoDeTorta titulo="¿Sabe Miraflores el nombre de su humedal?" etiquetas={datosTortaConocimiento.etiquetas} valores={datosTortaConocimiento.valores} />
                    </TarjetaGiratoria>
                    </div>

                    {/*Heatmap*/}
                    <div className="dashboard-card">
                    <TarjetaGiratoria
                        infoAdicional="Avistamientos de animales durante la semana. Haz clic para ver el detalle."
                    >
                        <HeatmapAnimales datos={datosAnimalesMayo} dias={5} />
                    </TarjetaGiratoria>
                    </div>
                    
                    {/*Grafico de Agua Turbia*/}
                    <div className="dashboard-card">
                    <TarjetaGiratoria 
                        infoAdicional="La turbidez del agua es un indicador clave de la salud del humedal. Haz clic para ver los datos."
                    >
                        <GraficoDeComparacion titulo="¿Percibieron agua turbia?" dataSi={datosAguaTurbia.si} dataNo={datosAguaTurbia.no} labels={diasDeLaSemana} />
                    </TarjetaGiratoria>
                    </div>
                    
                    {/*Grafico de Basura*/}
                    <div className="dashboard-card">
                    <TarjetaGiratoria
                        infoAdicional="La presencia de basura es perjudicial para el ecosistema. Haz clic para ver los reportes."
                    >
                        <GraficoDeComparacion titulo="¿Se observó basura?" dataSi={datosBasura.si} dataNo={datosBasura.no} labels={diasDeLaSemana} />
                    </TarjetaGiratoria>
                    </div>
                    
                    {/*Grafico de Olor*/}
                    <div className="dashboard-card">
                    <TarjetaGiratoria
                        infoAdicional="Percepción de mal olor registrada durante la semana. Haz clic para ver los detalles."
                    >
                        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
                            <Line
                                data={{
                                    labels: datosOlor.etiquetas,
                                    datasets: [{
                                        label: 'Nivel de Percepción',
                                        data: datosOlor.valores,
                                        borderColor: '#56B4A9',
                                        backgroundColor: 'rgba(86, 180, 169, 0.2)',
                                        tension: 0.4,
                                        fill: true,
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'top' }, title: { text: '¿Huele mal?', display: true } }
                                }}
                            />
                        </div>
                    </TarjetaGiratoria>
                    </div>
                </div>
            </div>
        </div>
    </main>
  );
}
