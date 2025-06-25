export function extraerComentarios(listarespuestas) {
  return listarespuestas
    .map(r => {
      if (!r?.respuestas) return; // <-- evitamos errores
      const comentarioObj = r.respuestas.find(item => item.item === "comentario");
      const fecha = r.timestamp ?? null;
      return comentarioObj ? { texto: comentarioObj.respuesta, timestamp: fecha } : null;
    })
    .filter(Boolean); // Elimina los nulos
}