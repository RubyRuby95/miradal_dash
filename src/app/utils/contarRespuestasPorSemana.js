import { parseISO, getWeek, getYear } from "date-fns";

export function contarRespuestasPorSemana(listarespuestas) {
  const agrupado = {};

  if (!Array.isArray(listarespuestas)) return agrupado;

  listarespuestas.forEach((entrada, i) => {
    const { timestamp, respuestas } = entrada || {};

    // Validar que timestamp sea una string
    if (!timestamp || typeof timestamp !== 'string') {
      console.warn(`!!! Entrada ${i} ignorada: timestamp ausente o inválido`, entrada);
      return;
    }

    let fecha;
    try {
      fecha = parseISO(timestamp);
      if (isNaN(fecha)) throw new Error('Fecha inválida');
    } catch (error) {
      console.warn(`!!! Entrada ${i} ignorada: error al parsear fecha → ${timestamp}`);
      return;
    }

    const semana = getWeek(fecha, { weekStartsOn: 1 });
    const año = getYear(fecha);
    const clave = `${año}-S${semana}`;

    if (!agrupado[clave]) agrupado[clave] = [];

    agrupado[clave].push(respuestas);
  });

  return agrupado;
}