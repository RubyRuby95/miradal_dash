import { parseISO, format } from "date-fns";

export function extraerComentarios(listarespuestas) {
  return listarespuestas
    .map(r => {
      if (!r?.respuestas) return; 

      const comentarioObj = r.respuestas.find(item => item.item === "comentario");
      if (!comentarioObj || typeof comentarioObj.respuesta !== 'string') return;

      const textoLimpio = comentarioObj.respuesta.trim();
      if (textoLimpio === '') return;

      const fechaOriginal = r.timestamp ?? r.created_at ?? null;
      let fechaFormateada = null;
      if (fechaOriginal) {
        try {
          const fechaParseada = parseISO(fechaOriginal);
          fechaFormateada = format(fechaParseada, "dd/MM/yyyy HH:mm");
        } catch (e) {
          console.warn("Fecha inválida:", fechaOriginal);
        }
      }

      
      return comentarioObj ? { texto: comentarioObj.respuesta, timestamp: fechaFormateada } : null;
    })
    .filter(Boolean);
}