import { parseISO, getWeek, getYear } from "date-fns";
import { constructFromSymbol } from "date-fns/constants";

export function contarRespuestasPorSemana(listarespuestas) {
  const agrupado = {};
  console.log('data', listarespuestas);
  if (!Array.isArray(listarespuestas)) return agrupado;

  listarespuestas.forEach((entrada, i) => {
    const { timestamp, created_at, respuestas } = entrada || {}; //created-at

    // Usar timestamp si existe, si no, usar created_at
    const rawFecha = timestamp || created_at;

    // Validar que timestamp sea una string
    if (!rawFecha || typeof rawFecha !== 'string') {
      console.warn(`!!! Entrada ${i} ignorada: fecha ausente o inválida`, entrada);
      return
    }
    let fecha;
    try {
      fecha = parseISO(rawFecha);
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