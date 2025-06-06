import { parseISO, startOfWeek, format } from "date-fns";

//divide por semanas las respuestas del json
export function agruparPorSemana(respuestas) {
  const semanas = {};

  respuestas.forEach((resp) => {
    const fecha = parseISO(resp.timestamp, "yyyy-MM-dd HH:mm:ss", new Date());
    const inicioSemana = startOfWeek(fecha, { weekStartsOn: 1 }); // Lunes
    const claveSemana = format(inicioSemana, "yyyy-MM-dd");

    if (!semanas[claveSemana]) semanas[claveSemana] = [];
    semanas[claveSemana].push(resp);
  });

  return semanas;
}

//procesa las respuestas
export function contarRespuestasPorSemana(respuestas) {
  const agrupado = {};

  respuestas.forEach(({ timestamp, respuestas }) => {
    const fecha = parseISO(timestamp);
    const inicioSemana = startOfWeek(fecha, { weekStartsOn: 1 });
    const clave = format(inicioSemana, 'yyyy-MM-dd');

    if (!agrupado[clave]) agrupado[clave] = [];

    agrupado[clave].push(respuestas);
  });

  return agrupado;
}