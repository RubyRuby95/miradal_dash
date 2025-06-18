import { eachWeekOfInterval, startOfYear, endOfYear, format } from 'date-fns';

export function agruparSemanasPorBloques(porSemana, tamañoBloque = 4) {
  // Obtener todos los años presentes en las claves
  const años = [...new Set(Object.keys(porSemana).map(k => k.split('-S')[0]))];

  const bloquesTotales = [];

  años.forEach(año => {
    // Crear las 52 semanas del año: ['2024-S1', '2024-S2', ..., '2024-S52']
    const semanas = Array.from({ length: 52 }, (_, i) => `${año}-S${i + 1}`);

    // Agrupar en bloques de tamaño `tamañoBloque`
    for (let i = 0; i < semanas.length; i += tamañoBloque) {
      const grupo = semanas.slice(i, i + tamañoBloque);
      bloquesTotales.push(grupo);
    }
  });

  return bloquesTotales;
}