'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { getWeek, getYear } from "date-fns";

import apiClient from "../../lib/apiClients";
import TarjetaGiratoria from "./components/TarjetaGiratoria";
import { contarRespuestasPorSemana } from "./utils/contarRespuestasPorSemana";
import { agruparSemanasPorBloques } from "./utils/agruparSemanasPorBloque";
import { getTop5 } from "./utils/getsTop5";
import { countSiNo, countNivel, esRespuestaValida } from "./utils/contadores";

import GraficoNombres from './components/graficoNombres';
import GraficoBasura from './components/graficoBasura';
import GraficoAguaTurbia from './components/graficoAguaTurbia';
import GraficoTop5 from './components/graficoTop5';
import GraficoOlores from './components/graficoOlores';
import HeatmapAnimales from './components/heatmapAnimales';

//intento de caja de comentarios:
import CajaComentarios from './components/cajaComentarios';
import { extraerComentarios } from './utils/extraerComentarios';

//intento caja comentarios end

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);


export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [bloqueIndex, setBloqueIndex] = useState(0);

  // Cargar datos
 useEffect(() => {
    const fetchRespuestas = async () => {
      try {
        //*USO DE JSON LOCAL DE PRUEBA */
        /*
        const res = await fetch('./data/respuestas.json');
        const json= await res.json();
        setData(json);
        */
        /*fin*/

        /*LLAMADA A API (ANTIGUA) */
        const res = await apiClient.get("/api/obtenerRespuestas");
        const json = await res.data;
        //console.log('lo q llega de api', json);
        /*fin*/
      
        setData(json);


      /*SUPER LLAMADA A API */
      /*
      const res = await apiClient.get("/api/obtenerRespuestas");
      const listaBase = res.data; 

      //Obtener todas las respuestas usando los id
      const respuestasCompletas = await Promise.all(
        listaBase.map(async (entrada) => {
          try {
            const detalle = await apiClient.get(`/api/obtenerRespuestas/${entrada.id}`);
            return {
              id: entrada.id,
              timestamp: entrada.created_at,
              respuestas: detalle.data //  esto debe ser el array de {item, respuesta}
            };
          } catch (error) {
            console.warn(`Error cargando detalle de ${entrada.id}:`, error);
            return null; 
          }
        })
      );

      // Filtrar los que vinieron nulos por error
      const respuestasFiltradas = respuestasCompletas.filter(Boolean);

      setData(respuestasFiltradas);
*/
      /*FIN SUPER LLAMADA A API*/

        // Calcular semana actual
        const hoy = new Date();
        const semanaActual = getWeek(hoy, { weekStartsOn: 1 });
        const añoActual = getYear(hoy);
        const claveActual = `${añoActual}-S${semanaActual}`;

        const respuestasSemanaTemp = contarRespuestasPorSemana(json); //!!!!

        // Completar semanas faltantes
        const años = [...new Set(Object.keys(respuestasSemanaTemp).map(k => k.split('-S')[0]))];
        años.forEach(año => {
          for (let i = 1; i <= 52; i++) {
            const clave = `${año}-S${i}`;
            if (!respuestasSemanaTemp[clave]) respuestasSemanaTemp[clave] = [];
          }
        });

        // Calcular bloques y buscar índice del actual
        const bloquesTemp = agruparSemanasPorBloques(respuestasSemanaTemp, 4);
        const indexBloqueActual = bloquesTemp.findIndex(b => b.includes(claveActual));

        if (indexBloqueActual !== -1) {
          setBloqueIndex(indexBloqueActual);
        }

      } catch (error) {
        console.error('Error al procesar datos:', error);
      }
    };
    fetchRespuestas();
  }, []);

  
  const respuestasSemana = useMemo(() => {
    if (!data) return {};
    const agrupadas = contarRespuestasPorSemana(data);

    // Asegurar que haya 52 semanas para cada año presente
    const años = [...new Set(Object.keys(agrupadas).map(k => k.split('-S')[0]))];

    años.forEach(año => {
      for (let i = 1; i <= 52; i++) {
        const clave = `${año}-S${i}`;
        if (!agrupadas[clave]) agrupadas[clave] = [];
      }
    });

    return agrupadas;
  }, [data]);
  //console.log('resp por semana', respuestasSemana);
  const bloques = useMemo(() => {
    return agruparSemanasPorBloques(respuestasSemana, 4);
  }, [respuestasSemana]);
  //console.log('bloques', bloques);

  const semanas = useMemo(() => bloques[bloqueIndex] || [], [bloques, bloqueIndex]);
  const rangoSemanas = useMemo(() => {
    if (semanas.length === 0) return '';

    const semanasSeparadas = semanas.map(s => {
      const [año, semana] = s.split('-S');
      return { año: parseInt(año), semana: parseInt(semana) };
    }).filter(({ año, semana }) => !isNaN(año) && !isNaN(semana));

    const años = [...new Set(semanasSeparadas.map(s => s.año))].sort();
    const semanasNumeros = semanasSeparadas.map(s => s.semana);

    const añoTexto = años.length === 1
      ? `${años[0]}`
      : `${años[0]}–${años[años.length - 1]}`;

    const minSemana = Math.min(...semanasNumeros);
    const maxSemana = Math.max(...semanasNumeros);

    let semanasTexto = '';
    // Si hay semanas no consecutivas como 52,1,2,3... las mostramos completas
    if (semanasNumeros.length > 0) {
      const ordenadas = [...new Set(semanasNumeros)].sort((a, b) => a - b);
      if (ordenadas[0] === minSemana && ordenadas[ordenadas.length - 1] === maxSemana && ordenadas.length === (maxSemana - minSemana + 1)) {
        semanasTexto = `Semanas ${minSemana}–${maxSemana}`;
      } else {
        semanasTexto = `Semanas ${ordenadas.join(', ')}`;
      }
    }

    return `${añoTexto} - ${semanasTexto}`;
  }, [semanas]);
  //console.log('semanas', semanas);
  const respuestasBloque = semanas
    .flatMap((s) => respuestasSemana[s] || [])
    .filter(Array.isArray); // <--- solo arrays válidos


  const animales = useMemo(() => (
    ['percibe-aves', 'percibe-peces', 'percibe-ganado', 'percibe-ranas', 'percibe-insectos']
  ), []);
  const heatmapData = useMemo(() => {
    const celdas = [];

    animales.forEach((animal, yIndex) => {

      semanas.forEach((semana, xIndex) => {
        const respuestasArray = respuestasSemana[semana] || [];

        // Aplanar todos los arrays de respuestas individuales
        const respuestas = respuestasArray.flat();

        // Filtrar por coincidencias del animal con respuesta "si"
        const total = respuestas.filter(r =>
          esRespuestaValida(r) && r.item === animal && r.respuesta === 'si'
        ).length;
        celdas.push({
          x: xIndex,
          y: yIndex,
          v: total,
          animal: animal.replace('percibe-', '')
        });
      });
    });

    return celdas;
  }, [semanas, respuestasSemana, animales]);
  const top5 = useMemo(() => {
    if (!data) return [];
    return getTop5(data);
  }, [data]);
  //console.log('datos top5', top5);

  // Datos de cada gráfico
  const nombresSiNo = countSiNo(data, 'conoce-nombre-humedal');
  //console.log('datos de nombres', nombresSiNo);

  const basuraPorSemana = semanas.map(semana => {
    const respuestas = (respuestasSemana[semana] || []).flat();
    return {
      semana,
      data: countSiNo(respuestas, 'percibe-desechos')
    };
  });
  //console.log('datos basura', basuraPorSemana);
  const aguaPorSemana = semanas.map(semana => {
    const respuestas = (respuestasSemana[semana] || []).flat();
    return {
      semana,
      data: countSiNo(respuestas, 'percibe-agua-turbia')
    };
  });
    //console.log('datos agua', aguaPorSemana);

  const oloresData = countNivel(respuestasBloque, 'huele', ['1', '2', '3']);
  //console.log('datos olores', oloresData);

  const logoPath = '/logo-uach.png';
  // Mostrar "Cargando..." mientras no hay datos
  if (!data) {
    return (
      <main className="main-container">
        <div className="dashboard-card">Cargando datos...</div>
      </main>
    );
  }

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
                      infoAdicional={
                          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                            <p><strong>🌿 ¿Conoces el Humedal &quot;El Bosque&quot;?</strong></p>
                          <div style={{ textAlign: 'justify', fontSize: '12px', fontWeight: 'normal' }}>
                            <p>
                              Muchos estudiantes lo ven todos los días al pasar por el Campus Miraflores de la UACh,
                              pero pocos saben cómo se llama o cuán valioso es.
                            </p>

                            <p>
                              🚰 Este humedal forma parte de una red de humedales urbanos que incluye los sectores
                              Bosque–Miraflores–Las Mulatas–Guacamayo y que fue declarada área protegida en 2021,
                              protegiendo aproximadamente 387 hectáreas. 😲
                            </p>
                            <p>
                              Entonces la parte que pasa por nuestro campus pertenece al humedal &quot;El bosque&quot;, 
                              de ahí su nombre, el cual probablemente no conocías. 🤭
                            </p>

                            <p>
                              📊 Mira este gráfico y descubre cuántas personas aún no lo conocen, y las que sí. ⬇️
                            </p>
                          </div>
                        </div>
                      }
                        
                      fotos={[
                        "/data/fotos/humedal1.png",
                        "/data/fotos/humedal2.png",
                        "/data/fotos/humedal3.png",
                        "/data/fotos/humedal4.png",
                        "/data/fotos/humedal5.png"

                      ]}
                    >
                      <div className="nombres-y-top5">
                        <div className="grafico-nombres">
                          <GraficoNombres data={nombresSiNo} />
                        </div>
                        <div className="tabla-top5">
                          <GraficoTop5 data={top5} />
                        </div>
                      </div>
                    </TarjetaGiratoria>
                    </div>
                
                    {/*Heatmap*/}
                    <div className="dashboard-card">
                        <TarjetaGiratoria
                            infoAdicional={
                            <div>
                              <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                🦫 ¿Sabías quiénes habitan el Humedal El Bosque?
                              </div>
                              <div style={{ textAlign: 'justify', fontSize: '12px' }}>
                                <p>
                                  Este humedal, visible desde el Campus Miraflores, alberga una sorprendente variedad de fauna que muchos ignoran:
                                </p>

                                <p>
                                  <strong>Mamíferos:</strong> coipo y huillín (este último en peligro de extinción).<br />
                                  <strong>Peces nativos:</strong> pocha del sur, puye y lamprea de bolsa.<br />
                                  <strong>Anfibios:</strong> rana moteada, ranita de antifaz y rana grande chilena.<br />
                                  <strong>Aves:</strong> más de 46 especies registradas, incluyendo garzas, patos y aves del bosque valdiviano.<br />
                                </p>

                                <p>
                                  📊 Mira este gráfico para ver su actividad durante las semanas.⬇️
                                </p>
                              </div>
                            </div>
                            }
      
                            fotos={[
                                "/data/fotos/coipo.png",
                                "/data/fotos/huillin.png",
                                "/data/fotos/pochadelsur.png",
                                "/data/fotos/garzachica.png",
                                "/data/fotos/patoreal.png",
                                "/data/fotos/pimpollo.png",
                                "/data/fotos/chuncho.png",
                                "/data/fotos/puye.png",
                                "/data/fotos/ranaceja.png"
                            ]}>

                            <div className='bloque-nav'>
                                <button onClick={() => setBloqueIndex(i => Math.max(i-1, 0))} disabled={bloqueIndex === 0}>⬅️</button>
                                ({rangoSemanas}) 
                                <button onClick={() => setBloqueIndex(i => Math.min(i+1, bloques.length-1))} disabled={bloqueIndex >= bloques.length-1}>➡️</button>
                            </div>
                            <HeatmapAnimales data={heatmapData} semanasLabels={semanas} animales={animales} />
                        </TarjetaGiratoria>
                    </div>

                    {/*Grafico de Basura*/}
                    <div className="dashboard-card">
                        <TarjetaGiratoria
                            infoAdicional={
                            <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                              <p><strong>🚮 La basura también habla del cuidado que damos al Humedal El Bosque</strong></p>
                            <div style={{ textAlign: 'justify', fontSize: '12px', fontWeight: 'normal' }}>
                                <p>
                                  Cada papel, botella o bolsa que se acumula en sus alrededores no solo contamina el paisaje sino que 
                                  también pone en riesgo a las especies que habitan allí y afecta la salud del ecosistema.
                                </p>

                                <p>
                                  📊 Este gráfico muestra cómo ha variado la presencia de basura a lo largo de las semanas. ⬇️
                                </p>

                                <p>
                                  Refleja nuestros hábitos y cuánto nos falta por mejorar.
                                  👉Pequeñas acciones como no botar residuos y recoger lo que vemos pueden marcar una gran diferencia.
                                  ♻️
                                </p>
                              </div>
                            </div>
                            }
                        >
                            <div className='bloque-nav'>
                                <button onClick={() => setBloqueIndex(i => Math.max(i-1, 0))} disabled={bloqueIndex === 0}>⬅️</button>
                                ({rangoSemanas}) 
                                <button onClick={() => setBloqueIndex(i => Math.min(i+1, bloques.length-1))} disabled={bloqueIndex >= bloques.length-1}>➡️</button>
                            </div>
                            <GraficoBasura dataPorSemana={basuraPorSemana} />
                        </TarjetaGiratoria>
                    </div>

                    {/*Grafico de Agua Turbia*/}
                    <div className="dashboard-card">
                        <TarjetaGiratoria
                            infoAdicional={
                              <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                <p><strong>💧 ¿Qué tan limpia está su agua?</strong></p>
                                <div style={{ textAlign: 'justify', fontSize: '12px', fontWeight: 'normal' }}>
                                  <p>
                                    El agua de un humedal puede tener distintos niveles de turbiedad, 
                                    lo que nos habla de su calidad y de posibles impactos ambientales.
                                  </p>

                                  <p>
                                  Esta puede aumentar por lluvias intensas, presencia de desechos, o por el paso de animales como el ganado. Esto afecta no solo la apariencia del agua, sino también a las especies que viven en ella.
                                  </p>

                                  <p>
                                    📊 Este gráfico muestra cómo ha variado la turbiedad del agua en distintas semanas. ⬇️
                                  </p>

                                  <p>
                                    👉 Observar estos datos nos ayuda a entender cómo estamos afectando al humedal y por qué es urgente protegerlo.
                                  </p>
                                </div>
                              </div>
                            }
                        >
                            <div className='bloque-nav'>
                                <button onClick={() => setBloqueIndex(i => Math.max(i-1, 0))} disabled={bloqueIndex === 0}>⬅️</button>
                                ({rangoSemanas}) 
                                <button onClick={() => setBloqueIndex(i => Math.min(i+1, bloques.length-1))} disabled={bloqueIndex >= bloques.length-1}>➡️</button>
                            </div>
                            <GraficoAguaTurbia dataPorSemana={aguaPorSemana} />
                        </TarjetaGiratoria>
                    </div>

                    {/*Grafico de Olor*/}
                    <div className="dashboard-card">
                        <TarjetaGiratoria
                            infoAdicional={
                              <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                <p><strong>👃 ¿A qué huele el humedal?</strong></p>
                                <div style={{ textAlign: 'justify', fontSize: '12px', fontWeight: 'normal' }}>
                                  <p>
                                    El olor del Humedal El Bosque es un indicador de su estado.
                                    Cuando el humedal está sano, su aroma suele ser neutro o vegetal. Pero cuando hay acumulación de materia orgánica,
                                    contaminación o poca circulación de agua, puede generar olores desagradables. 💩
                                  </p>

                                  <p>
                                    📊 Este gráfico muestra cómo ha cambiado la intensidad del olor en las últimas semanas. ⬇️
                                  </p>

                                  <p>
                                    👉 Prestar atención al olor es una forma sencilla de cuidar este ecosistema.
                                    Si algo huele mal, es porque el humedal nos está diciendo algo. ¡Escuchémoslo!
                                  </p>
                                </div>
                              </div>
                            }
                        >
                            <div className='bloque-nav'>
                                <button onClick={() => setBloqueIndex(i => Math.max(i-1, 0))} disabled={bloqueIndex === 0}>⬅️</button>
                                ({rangoSemanas}) 
                                <button onClick={() => setBloqueIndex(i => Math.min(i+1, bloques.length-1))} disabled={bloqueIndex >= bloques.length-1}>➡️</button>
                            </div>
                            <GraficoOlores data={oloresData} />
                        </TarjetaGiratoria>
                    </div>
                </div>
                <CajaComentarios comentarios={extraerComentarios(data)} />
            </div>
          
        </div>
    </main>
  );
}
