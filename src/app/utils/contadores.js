
export function countSiNo(respsBloque, itemKey) {
  const tallies = (respsBloque || []).reduce((acc, entry) => {
    let arr;
    if (Array.isArray(entry)) {
      // viene como bloque: cada entry es Array de {item, respuesta}
      arr = entry;
    } else if (entry && Array.isArray(entry.respuestas)) {
      // viene como data global: entry.respuestas es el array
      arr = entry.respuestas;
    } else {
      return acc;
    }
    const r = arr.find(r => r.item === itemKey);
    if (!r) return acc;
    r.respuesta === 'si' ? acc.si++ : acc.no++;
    return acc;
  }, { si: 0, no: 0 });
  return [
    { name: 'Sí', value: tallies.si },
    { name: 'No', value: tallies.no },
  ];
}

export function countNivel(respsBloque, itemKey, niveles) {
  const tally = niveles.reduce((acc, n) => {
    acc[n] = 0;
    return acc;
  }, {});

  respsBloque.forEach(resps => {
    if (!Array.isArray(resps)) return; // Validación

    const r = resps.find(r => r.item === itemKey);
    if (r && niveles.includes(r.respuesta)) {
      tally[r.respuesta]++;
    }
  });

  return niveles.map(n => ({ name: n, value: tally[n] }));
}