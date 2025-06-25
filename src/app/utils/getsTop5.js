export function getTop5(data) {
  const conteo = {};
  //console.log('the data', data);

  data.forEach((entrada) => {
   if (!entrada?.respuestas) return; // <-- if de item name, cambiar dependiendo el item

    const nombreItem = entrada.respuestas.find(
      (r) => r.item === "nombre-humedal"
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