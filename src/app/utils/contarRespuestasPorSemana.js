import { parseISO, getWeek, getYear } from "date-fns";

export function contarRespuestasPorSemana(listarespuestas) {
  const agrupado = {};

  listarespuestas.forEach(({ timestamp, respuestas }) => {
    const fecha = parseISO(timestamp);
    const semana = getWeek(fecha, { weekStartsOn: 1 });
    const año = getYear(fecha);
    const clave = `${año}-S${semana}`;

    if (!agrupado[clave]) agrupado[clave] = [];

    agrupado[clave].push(respuestas);
  });

  return agrupado;
}