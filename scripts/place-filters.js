export function filterPlaces(lugares, filtro, searchQuery) {
  return lugares.filter((l) => {
    const matchFiltro =
      filtro === "todos" || l.categoria === filtro;

    const q = searchQuery.toLowerCase();

    return (
      matchFiltro &&
      (!q ||
        l.nombre.toLowerCase().includes(q) ||
        l.barrio.toLowerCase().includes(q) ||
        (l.zona_comuna || "").toLowerCase().includes(q))
    );
  });
}