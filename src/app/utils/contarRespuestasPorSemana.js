import { parseISO, startOfWeek, format } from "date-fns";

//cuenta respuestas por semana
export function contarRespuestasPorSemana(listarespuestas) {
  const agrupado = {};
  listarespuestas.forEach(({ timestamp, respuestas }) => {
    const fecha = parseISO(timestamp);
    const inicioSemana = startOfWeek(fecha, { weekStartsOn: 1 });
    const clave = format(inicioSemana, 'yyyy-MM-dd');

    if (!agrupado[clave]) agrupado[clave] = [];

    agrupado[clave].push(respuestas);
  });

  return agrupado;
}