export function getTop5(data) {
  const conteo = {};

  data.forEach((entrada) => {
    const nombreItem = entrada.respuestas.find(
      (r) => r.item === "nombre-humedal-preproc"
    );

    if (nombreItem && nombreItem.respuesta.trim() !== "") {
      const nombre = nombreItem.respuesta.toLowerCase().trim();
      conteo[nombre] = (conteo[nombre] || 0) + 1;
    }
  });

  const topHumedales = Object.entries(conteo)
    .sort((a, b) => b[1] - a[1]) // orden descendente por cantidad
    .slice(0, 5) // máximo 5
    .map(([nombre, cantidad]) => ({ nombre, cantidad }));

  return topHumedales;
} 