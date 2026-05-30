/**
 * places.js — Motor del mapa interactivo de Buenos Aires
 * Secretos de la Ciudad © 2026
 *
 * Arquitectura:
 *  1. GEO DATA   – Polígonos SVG de comunas y barrios (coordenadas geográficas reales)
 *  2. PROJECTION – Mercator simple → píxeles SVG
 *  3. RENDERER   – Construye SVG dinámico, inyecta marcadores, leyenda y filtros
 *  4. PANEL      – Lógica del panel lateral de detalles
 *  5. INTERACTION– Zoom / pan, hover, click, favoritos
 */

"use strict";

/* ============================================================
   1. GEO DATA — Barrios de CABA (polígonos en lat/lng)
   Fuente: datos oficiales GCBA + ajuste manual para SVG
   ============================================================ */

const COMUNAS = {
  1:  { nombre: "Comuna 1",  color: "#6c63ff", barrios: ["San Nicolás","Monserrat","San Telmo","Constitución","Retiro","Puerto Madero"] },
  2:  { nombre: "Comuna 2",  color: "#c084fc", barrios: ["Recoleta"] },
  3:  { nombre: "Comuna 3",  color: "#78716c", barrios: ["Balvanera","San Cristóbal"] },
  4:  { nombre: "Comuna 4",  color: "#84cc16", barrios: ["La Boca","Barracas","Parque Patricios","Nueva Pompeya"] },
  5:  { nombre: "Comuna 5",  color: "#94a3b8", barrios: ["Almagro","Boedo"] },
  6:  { nombre: "Comuna 6",  color: "#64748b", barrios: ["Caballito"] },
  7:  { nombre: "Comuna 7",  color: "#38bdf8", barrios: ["Flores","Parque Chacabuco"] },
  8:  { nombre: "Comuna 8",  color: "#ef4444", barrios: ["Villa Soldati","Villa Lugano","Villa Riachuelo"] },
  9:  { nombre: "Comuna 9",  color: "#14b8a6", barrios: ["Liniers","Mataderos","Parque Avellaneda"] },
  10: { nombre: "Comuna 10", color: "#22c55e", barrios: ["Monte Castro","Versalles","Floresta","Vélez Sársfield","Villa Luro","Villa Real"] },
  11: { nombre: "Comuna 11", color: "#3b82f6", barrios: ["Villa del Parque","Villa Devoto","Villa General Mitre","Villa Santa Rita"] },
  12: { nombre: "Comuna 12", color: "#f59e0b", barrios: ["Coghlan","Saavedra","Villa Urquiza","Villa Pueyrredón"] },
  13: { nombre: "Comuna 13", color: "#a78bfa", barrios: ["Belgrano","Colegiales","Núñez"] },
  14: { nombre: "Comuna 14", color: "#94a3b8", barrios: ["Palermo"] },
  15: { nombre: "Comuna 15", color: "#a3e635", barrios: ["Agronomía","Chacarita","La Paternal","Parque Chas","Villa Crespo","Villa Ortúzar"] },
};

/* ============================================================
   POLÍGONOS DE BARRIOS — coordenadas [lng, lat] reales CABA
   (simplificados para rendimiento SVG, 8–20 puntos por barrio)
   ============================================================ */
const BARRIOS_GEO = {
  // COMUNA 1
  "San Nicolás": [[-58.389,-34.596],[-58.374,-34.596],[-58.374,-34.607],[-58.389,-34.607]],
  "Monserrat":   [[-58.389,-34.607],[-58.374,-34.607],[-58.374,-34.616],[-58.389,-34.616]],
  "San Telmo":   [[-58.380,-34.615],[-58.368,-34.615],[-58.368,-34.624],[-58.380,-34.624]],
  "Constitución":[[-58.389,-34.616],[-58.375,-34.616],[-58.375,-34.626],[-58.389,-34.626]],
  "Retiro":      [[-58.389,-34.585],[-58.368,-34.585],[-58.368,-34.596],[-58.374,-34.596],[-58.374,-34.600],[-58.389,-34.600]],
  "Puerto Madero":[[-58.368,-34.595],[-58.357,-34.595],[-58.357,-34.640],[-58.368,-34.640]],
  // COMUNA 2
  "Recoleta":    [[-58.410,-34.585],[-58.389,-34.585],[-58.389,-34.600],[-58.410,-34.600]],
  // COMUNA 3
  "Balvanera":   [[-58.410,-34.600],[-58.389,-34.600],[-58.389,-34.616],[-58.410,-34.616]],
  "San Cristóbal":[[-58.410,-34.616],[-58.389,-34.616],[-58.389,-34.628],[-58.410,-34.628]],
  // COMUNA 4
  "La Boca":     [[-58.368,-34.624],[-58.357,-34.624],[-58.357,-34.645],[-58.368,-34.645]],
  "Barracas":    [[-58.389,-34.626],[-58.368,-34.626],[-58.368,-34.645],[-58.389,-34.645]],
  "Parque Patricios":[[-58.410,-34.628],[-58.389,-34.628],[-58.389,-34.645],[-58.410,-34.645]],
  "Nueva Pompeya":[[-58.430,-34.638],[-58.410,-34.638],[-58.410,-34.658],[-58.430,-34.658]],
  // COMUNA 5
  "Almagro":     [[-58.430,-34.600],[-58.410,-34.600],[-58.410,-34.616],[-58.430,-34.616]],
  "Boedo":       [[-58.430,-34.616],[-58.410,-34.616],[-58.410,-34.632],[-58.430,-34.632]],
  // COMUNA 6
  "Caballito":   [[-58.453,-34.600],[-58.430,-34.600],[-58.430,-34.626],[-58.453,-34.626]],
  // COMUNA 7
  "Flores":      [[-58.470,-34.618],[-58.430,-34.618],[-58.430,-34.640],[-58.470,-34.640]],
  "Parque Chacabuco":[[-58.453,-34.626],[-58.430,-34.626],[-58.430,-34.642],[-58.453,-34.642]],
  // COMUNA 8
  "Villa Soldati":[[-58.453,-34.658],[-58.430,-34.658],[-58.430,-34.672],[-58.453,-34.672]],
  "Villa Lugano":[[-58.480,-34.658],[-58.453,-34.658],[-58.453,-34.685],[-58.480,-34.685]],
  "Villa Riachuelo":[[-58.453,-34.672],[-58.430,-34.672],[-58.430,-34.692],[-58.453,-34.692]],
  // COMUNA 9
  "Liniers":     [[-58.520,-34.640],[-58.490,-34.640],[-58.490,-34.658],[-58.520,-34.658]],
  "Mataderos":   [[-58.520,-34.658],[-58.490,-34.658],[-58.490,-34.680],[-58.520,-34.680]],
  "Parque Avellaneda":[[-58.490,-34.640],[-58.470,-34.640],[-58.470,-34.660],[-58.490,-34.660]],
  // COMUNA 10
  "Monte Castro":[[-58.516,-34.618],[-58.495,-34.618],[-58.495,-34.635],[-58.516,-34.635]],
  "Versalles":   [[-58.535,-34.628],[-58.516,-34.628],[-58.516,-34.645],[-58.535,-34.645]],
  "Floresta":    [[-58.495,-34.628],[-58.470,-34.628],[-58.470,-34.642],[-58.495,-34.642]],
  "Vélez Sársfield":[[-58.516,-34.635],[-58.495,-34.635],[-58.495,-34.648],[-58.516,-34.648]],
  "Villa Luro":  [[-58.516,-34.648],[-58.495,-34.648],[-58.495,-34.660],[-58.516,-34.660]],
  "Villa Real":  [[-58.535,-34.618],[-58.516,-34.618],[-58.516,-34.632],[-58.535,-34.632]],
  // COMUNA 11
  "Villa del Parque":[[-58.495,-34.600],[-58.470,-34.600],[-58.470,-34.618],[-58.495,-34.618]],
  "Villa Devoto":[[-58.520,-34.600],[-58.495,-34.600],[-58.495,-34.620],[-58.520,-34.620]],
  "Villa General Mitre":[[-58.470,-34.600],[-58.453,-34.600],[-58.453,-34.615],[-58.470,-34.615]],
  "Villa Santa Rita":[[-58.495,-34.612],[-58.470,-34.612],[-58.470,-34.628],[-58.495,-34.628]],
  // COMUNA 12
  "Coghlan":     [[-58.480,-34.557],[-58.460,-34.557],[-58.460,-34.570],[-58.480,-34.570]],
  "Saavedra":    [[-58.480,-34.545],[-58.455,-34.545],[-58.455,-34.565],[-58.480,-34.565]],
  "Villa Urquiza":[[-58.500,-34.570],[-58.462,-34.570],[-58.462,-34.590],[-58.500,-34.590]],
  "Villa Pueyrredón":[[-58.520,-34.576],[-58.500,-34.576],[-58.500,-34.596],[-58.520,-34.596]],
  // COMUNA 13
  "Belgrano":    [[-58.460,-34.557],[-58.430,-34.557],[-58.430,-34.575],[-58.460,-34.575]],
  "Colegiales":  [[-58.443,-34.575],[-58.420,-34.575],[-58.420,-34.590],[-58.443,-34.590]],
  "Núñez":       [[-58.460,-34.538],[-58.430,-34.538],[-58.430,-34.557],[-58.460,-34.557]],
  // COMUNA 14
  "Palermo":     [[-58.430,-34.575],[-58.389,-34.575],[-58.389,-34.600],[-58.430,-34.600]],
  // COMUNA 15
  "Agronomía":   [[-58.487,-34.588],[-58.462,-34.588],[-58.462,-34.600],[-58.487,-34.600]],
  "Chacarita":   [[-58.453,-34.588],[-58.430,-34.588],[-58.430,-34.600],[-58.453,-34.600]],
  "La Paternal": [[-58.470,-34.595],[-58.453,-34.595],[-58.453,-34.608],[-58.470,-34.608]],
  "Parque Chas": [[-58.470,-34.580],[-58.453,-34.580],[-58.453,-34.596],[-58.470,-34.596]],
  "Villa Crespo":[[-58.430,-34.590],[-58.410,-34.590],[-58.410,-34.600],[-58.430,-34.600]],
  "Villa Ortúzar":[[-58.462,-34.575],[-58.443,-34.575],[-58.443,-34.590],[-58.462,-34.590]],
};

/* Asignar colores por barrio usando la info de comunas */
const BARRIO_COMUNA = {};
const BARRIO_COLOR  = {};
Object.entries(COMUNAS).forEach(([id, c]) => {
  c.barrios.forEach(b => {
    BARRIO_COMUNA[b] = parseInt(id);
    BARRIO_COLOR[b]  = c.color;
  });
});

/* ============================================================
   2. PROJECTION — Mercator simplificada lat/lng → SVG px
   ============================================================ */
const SVG_W = 900, SVG_H = 780;

// Bounding box de CABA
const GEO_BOUNDS = {
  minLng: -58.535, maxLng: -58.347,
  minLat: -34.705, maxLat: -34.527
};

function project([lng, lat]) {
  const px = (lng - GEO_BOUNDS.minLng) / (GEO_BOUNDS.maxLng - GEO_BOUNDS.minLng) * SVG_W;
  const py = (1 - (lat - GEO_BOUNDS.minLat) / (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat)) * SVG_H;
  return [px, py];
}

function latlngToSVG(lat, lng) {
  return project([lng, lat]);
}

function polygonToPath(coords) {
  return coords.map((pt, i) => {
    const [x, y] = project(pt);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ') + ' Z';
}

/* ============================================================
   3. ESTADO GLOBAL
   ============================================================ */
const STATE = {
  lugares: [],
  filtroActivo: 'todos',
  lugarSeleccionado: null,
  favoritos: new Set(JSON.parse(localStorage.getItem('sdc-favoritos') || '[]')),
  zoom: 1,
  panX: 0,
  panY: 0,
  isDragging: false,
  dragStart: null,
};

function saveFavoritos() {
  localStorage.setItem('sdc-favoritos', JSON.stringify([...STATE.favoritos]));
}

/* ============================================================
   4. CARGA DE DATOS
   ============================================================ */
async function cargarLugares() {
  try {
    // Intenta fetch relativo; si falla usa los datos embebidos desde el DOM/script
    const res = await fetch('./places.json').catch(() => fetch('../data/places.json'));
    if (!res.ok) throw new Error('fetch failed');
    return await res.json();
  } catch {
    // Fallback: datos embebidos para que el mapa funcione siempre
    return LUGARES_FALLBACK;
  }
}

/* ============================================================
   5. CATEGORÍAS Y COLORES DE MARCADORES
   ============================================================ */
const CATEGORIA_CONFIG = {
  "Teatro / Cultura":   { color: "#f59e0b", icon: "🎭" },
  "Tango / Gastronomía":{ color: "#ec4899", icon: "💃" },
  "Paseo Urbano":       { color: "#06b6d4", icon: "🌉" },
  "Avenida Cultural":   { color: "#a78bfa", icon: "🎪" },
  "Ciencia / Cultura":  { color: "#34d399", icon: "🔭" },
  "Gastronomía / Cultura":{ color: "#fb923c", icon: "🥢" },
  "Vida Nocturna":      { color: "#f472b6", icon: "🍻" },
  "Centro Cultural":    { color: "#818cf8", icon: "🎨" },
  "Turismo Histórico":  { color: "#fbbf24", icon: "📸" },
  "Espacio Verde":      { color: "#4ade80", icon: "🌿" },
};

function getCatConfig(cat) {
  return CATEGORIA_CONFIG[cat] || { color: "#6c63ff", icon: "📍" };
}

/* ============================================================
   6. RENDER DEL SVG
   ============================================================ */
function buildSVG(lugares, filtroActivo) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `0 0 ${SVG_W} ${SVG_H}`);
  svg.setAttribute("xmlns", ns);
  svg.style.cssText = "width:100%;height:100%;display:block;";
  svg.id = "mapa-svg";

  // — Defs (sombras, glow, clip) —
  const defs = document.createElementNS(ns, "defs");
  defs.innerHTML = `
    <filter id="f-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.55)"/>
    </filter>
    <filter id="f-glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="f-marker-shadow">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="rgba(0,0,0,0.6)"/>
    </filter>
    <radialGradient id="bg-grad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#0d0d1a"/>
    </radialGradient>
    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse" opacity="0.06">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#6c63ff" stroke-width="0.5"/>
    </pattern>
  `;
  svg.appendChild(defs);

  // — Fondo —
  const bg = document.createElementNS(ns, "rect");
  bg.setAttribute("width", SVG_W); bg.setAttribute("height", SVG_H);
  bg.setAttribute("fill", "url(#bg-grad)");
  svg.appendChild(bg);

  const gridRect = document.createElementNS(ns, "rect");
  gridRect.setAttribute("width", SVG_W); gridRect.setAttribute("height", SVG_H);
  gridRect.setAttribute("fill", "url(#grid)");
  svg.appendChild(gridRect);

  // — Grupo principal (zoom/pan) —
  const g = document.createElementNS(ns, "g");
  g.id = "mapa-g";
  svg.appendChild(g);

  // — Capa barrios —
  const gBarrios = document.createElementNS(ns, "g");
  gBarrios.id = "layer-barrios";

  Object.entries(BARRIOS_GEO).forEach(([nombre, coords]) => {
    const color = BARRIO_COLOR[nombre] || "#4a5568";
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", polygonToPath(coords));
    path.setAttribute("fill", color);
    path.setAttribute("fill-opacity", "0.22");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-opacity", "0.7");
    path.setAttribute("stroke-width", "1.2");
    path.setAttribute("stroke-linejoin", "round");
    path.dataset.barrio = nombre;
    path.classList.add("barrio-path");

    // Etiqueta del barrio
    const cx = coords.reduce((s, c) => s + project(c)[0], 0) / coords.length;
    const cy = coords.reduce((s, c) => s + project(c)[1], 0) / coords.length;
    const text = document.createElementNS(ns, "text");
    text.setAttribute("x", cx); text.setAttribute("y", cy);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("fill", "#e2e8f0");
    text.setAttribute("fill-opacity", "0.6");
    text.setAttribute("font-size", "7.5");
    text.setAttribute("font-family", "system-ui, sans-serif");
    text.setAttribute("font-weight", "500");
    text.setAttribute("pointer-events", "none");
    text.textContent = nombre;

    gBarrios.appendChild(path);
    gBarrios.appendChild(text);
  });
  g.appendChild(gBarrios);

  // — Capa límites de comunas (por encima de barrios) —
  const gComunas = document.createElementNS(ns, "g");
  gComunas.id = "layer-comunas";

  // Unimos los polígonos de barrios de cada comuna para dibujar el contorno
  Object.entries(COMUNAS).forEach(([id, c]) => {
    c.barrios.forEach(b => {
      if (!BARRIOS_GEO[b]) return;
      const path = document.createElementNS(ns, "path");
      path.setAttribute("d", polygonToPath(BARRIOS_GEO[b]));
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", c.color);
      path.setAttribute("stroke-opacity", "0.9");
      path.setAttribute("stroke-width", "1.8");
      path.setAttribute("stroke-linejoin", "round");
      path.setAttribute("pointer-events", "none");
      gComunas.appendChild(path);
    });
  });
  g.appendChild(gComunas);

  // — Río de la Plata —
  const rioLabel = document.createElementNS(ns, "text");
  rioLabel.setAttribute("x", SVG_W - 60); rioLabel.setAttribute("y", 120);
  rioLabel.setAttribute("text-anchor", "middle");
  rioLabel.setAttribute("fill", "#7dd3fc");
  rioLabel.setAttribute("fill-opacity", "0.55");
  rioLabel.setAttribute("font-size", "11");
  rioLabel.setAttribute("font-style", "italic");
  rioLabel.setAttribute("font-family", "Georgia, serif");
  rioLabel.setAttribute("pointer-events", "none");
  rioLabel.textContent = "Río de la Plata";
  g.appendChild(rioLabel);

  // — Capa marcadores —
  const gMarcadores = document.createElementNS(ns, "g");
  gMarcadores.id = "layer-marcadores";

  const lugaresVisibles = filtroActivo === 'todos'
    ? lugares
    : lugares.filter(l => l.categoria === filtroActivo);

  lugaresVisibles.forEach(lugar => {
    const [x, y] = latlngToSVG(lugar.coordenadas.latitud, lugar.coordenadas.longitud);
    const cfg = getCatConfig(lugar.categoria);
    const isFav = STATE.favoritos.has(lugar.id);

    const gM = document.createElementNS(ns, "g");
    gM.dataset.id = lugar.id;
    gM.classList.add("mapa-marcador");
    gM.setAttribute("cursor", "pointer");
    gM.setAttribute("filter", "url(#f-marker-shadow)");

    // Pulse ring
    const pulse = document.createElementNS(ns, "circle");
    pulse.setAttribute("cx", x); pulse.setAttribute("cy", y);
    pulse.setAttribute("r", 18);
    pulse.setAttribute("fill", cfg.color);
    pulse.setAttribute("fill-opacity", "0.15");
    pulse.setAttribute("stroke", cfg.color);
    pulse.setAttribute("stroke-width", "1");
    pulse.setAttribute("stroke-opacity", "0.4");
    pulse.classList.add("marker-pulse");

    // Pin body
    const pinBody = document.createElementNS(ns, "circle");
    pinBody.setAttribute("cx", x); pinBody.setAttribute("cy", y - 2);
    pinBody.setAttribute("r", 11);
    pinBody.setAttribute("fill", cfg.color);
    pinBody.setAttribute("fill-opacity", "0.92");

    // Icono texto
    const icon = document.createElementNS(ns, "text");
    icon.setAttribute("x", x); icon.setAttribute("y", y + 1);
    icon.setAttribute("text-anchor", "middle");
    icon.setAttribute("dominant-baseline", "middle");
    icon.setAttribute("font-size", "11");
    icon.setAttribute("pointer-events", "none");
    icon.textContent = cfg.icon;

    // Estrella favorito
    if (isFav) {
      const star = document.createElementNS(ns, "text");
      star.setAttribute("x", x + 9); star.setAttribute("y", y - 11);
      star.setAttribute("font-size", "9");
      star.setAttribute("pointer-events", "none");
      star.textContent = "⭐";
      gM.appendChild(star);
    }

    gM.appendChild(pulse);
    gM.appendChild(pinBody);
    gM.appendChild(icon);

    // Tooltip nombre
    const tooltipG = document.createElementNS(ns, "g");
    tooltipG.classList.add("marker-tooltip");
    tooltipG.setAttribute("opacity", "0");
    tooltipG.setAttribute("pointer-events", "none");

    const tooltipRect = document.createElementNS(ns, "rect");
    const tLabel = lugar.nombre;
    const tW = Math.min(tLabel.length * 6.5 + 16, 200);
    tooltipRect.setAttribute("x", x - tW/2); tooltipRect.setAttribute("y", y - 36);
    tooltipRect.setAttribute("width", tW); tooltipRect.setAttribute("height", 20);
    tooltipRect.setAttribute("rx", "10"); tooltipRect.setAttribute("ry", "10");
    tooltipRect.setAttribute("fill", "rgba(10,10,20,0.9)");
    tooltipRect.setAttribute("stroke", cfg.color);
    tooltipRect.setAttribute("stroke-width", "1");

    const tooltipText = document.createElementNS(ns, "text");
    tooltipText.setAttribute("x", x); tooltipText.setAttribute("y", y - 22);
    tooltipText.setAttribute("text-anchor", "middle");
    tooltipText.setAttribute("dominant-baseline", "middle");
    tooltipText.setAttribute("fill", "#ffffff");
    tooltipText.setAttribute("font-size", "10");
    tooltipText.setAttribute("font-family", "system-ui, sans-serif");
    tooltipText.textContent = tLabel;

    tooltipG.appendChild(tooltipRect);
    tooltipG.appendChild(tooltipText);
    gM.appendChild(tooltipG);

    // Eventos
    gM.addEventListener("mouseenter", () => {
      tooltipG.setAttribute("opacity", "1");
      pinBody.setAttribute("r", "13");
    });
    gM.addEventListener("mouseleave", () => {
      tooltipG.setAttribute("opacity", "0");
      pinBody.setAttribute("r", "11");
    });
    gM.addEventListener("click", (e) => {
      e.stopPropagation();
      seleccionarLugar(lugar.id);
    });

    gMarcadores.appendChild(gM);
  });
  g.appendChild(gMarcadores);

  return svg;
}

/* ============================================================
   7. RENDER FILTROS
   ============================================================ */
function renderizarFiltros(lugares) {
  const nav = document.getElementById("mapa-filtros");
  if (!nav) return;

  const categorias = ['todos', ...new Set(lugares.map(l => l.categoria))];

  nav.innerHTML = categorias.map(cat => {
    const cfg = getCatConfig(cat);
    const activo = STATE.filtroActivo === cat;
    const label = cat === 'todos' ? '📍 Todos' : `${cfg.icon} ${cat}`;
    return `
      <button
        class="map-filter-btn btn btn--ghost"
        data-cat="${cat}"
        style="
          padding: 8px 14px;
          border: 1.5px solid ${activo ? cfg.color : 'rgba(255,255,255,0.12)'};
          background: ${activo ? cfg.color + '22' : 'transparent'};
          color: ${activo ? cfg.color : 'var(--color-text-muted)'};
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600;
          width: 100%;
        "
        aria-pressed="${activo}"
      >${label}</button>
    `;
  }).join('');

  // Contador
  const count = STATE.filtroActivo === 'todos'
    ? lugares.length
    : lugares.filter(l => l.categoria === STATE.filtroActivo).length;
  const contador = document.getElementById("mapa-contador");
  if (contador) contador.textContent = count;

  nav.querySelectorAll('.map-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      STATE.filtroActivo = btn.dataset.cat;
      renderizarMapa();
      renderizarFiltros(STATE.lugares);
    });
  });
}

/* ============================================================
   8. RENDER LEYENDA
   ============================================================ */
function renderizarLeyenda() {
  const leyenda = document.getElementById("mapa-leyenda");
  if (!leyenda) return;

  const cats = [...new Set(STATE.lugares.map(l => l.categoria))];
  leyenda.innerHTML = `
    <style>
      .map-legend {
        background: rgba(10,10,20,0.82);
        backdrop-filter: blur(10px);
        border-top: 1px solid rgba(108,99,255,0.25);
        padding: 10px 16px;
        display: flex; flex-wrap: wrap; gap: 10px 18px;
        align-items: center;
      }
      .map-legend__item {
        display: flex; align-items: center; gap: 6px;
        font-size: 11px; color: rgba(226,232,240,0.7);
      }
      .map-legend__dot {
        width: 10px; height: 10px; border-radius: 50%;
      }
    </style>
    ${cats.map(cat => {
      const cfg = getCatConfig(cat);
      return `<span class="map-legend__item">
        <span class="map-legend__dot" style="background:${cfg.color}"></span>
        ${cat}
      </span>`;
    }).join('')}
  `;
}

/* ============================================================
   9. RENDER MAPA PRINCIPAL
   ============================================================ */
function renderizarMapa() {
  const contenedor = document.getElementById("mapa-contenedor");
  if (!contenedor) return;

  contenedor.innerHTML = '';
  const svg = buildSVG(STATE.lugares, STATE.filtroActivo);
  contenedor.appendChild(svg);

  // Restaurar transform
  const g = svg.querySelector("#mapa-g");
  aplicarTransform(g);

  // Setup zoom/pan
  setupZoomPan(svg, g);

  // Estilos animación de pulso
  const style = document.createElement("style");
  style.textContent = `
    @keyframes marker-pulse {
      0%   { r: 14; opacity: 0.3; }
      50%  { r: 20; opacity: 0.1; }
      100% { r: 14; opacity: 0.3; }
    }
    .marker-pulse { animation: marker-pulse 2.4s ease-in-out infinite; }
    .mapa-marcador { transition: transform 0.15s ease; }
    .mapa-marcador:hover { transform-origin: center; }
    .barrio-path { transition: fill-opacity 0.2s; }
    .barrio-path:hover { fill-opacity: 0.38 !important; }
    .marker-tooltip { transition: opacity 0.15s; }
  `;
  svg.appendChild(style);
}

/* ============================================================
   10. ZOOM / PAN
   ============================================================ */
function aplicarTransform(g) {
  if (!g) return;
  g.setAttribute("transform", `translate(${STATE.panX},${STATE.panY}) scale(${STATE.zoom})`);
}

function setupZoomPan(svg, g) {
  // Wheel zoom
  svg.addEventListener("wheel", (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    const rect = svg.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width * SVG_W;
    const my = (e.clientY - rect.top) / rect.height * SVG_H;

    const newZoom = Math.min(Math.max(STATE.zoom * factor, 0.6), 5);
    STATE.panX = mx - (mx - STATE.panX) * (newZoom / STATE.zoom);
    STATE.panY = my - (my - STATE.panY) * (newZoom / STATE.zoom);
    STATE.zoom = newZoom;
    aplicarTransform(g);
  }, { passive: false });

  // Pan drag
  svg.addEventListener("mousedown", (e) => {
    STATE.isDragging = true;
    STATE.dragStart = { x: e.clientX - STATE.panX, y: e.clientY - STATE.panY };
    svg.style.cursor = "grabbing";
  });
  window.addEventListener("mousemove", (e) => {
    if (!STATE.isDragging) return;
    STATE.panX = e.clientX - STATE.dragStart.x;
    STATE.panY = e.clientY - STATE.dragStart.y;
    aplicarTransform(g);
  });
  window.addEventListener("mouseup", () => {
    STATE.isDragging = false;
    svg.style.cursor = "grab";
  });
  svg.style.cursor = "grab";

  // Touch zoom/pan
  let lastTouches = [];
  svg.addEventListener("touchstart", (e) => { lastTouches = [...e.touches]; });
  svg.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && lastTouches.length === 1) {
      const dx = e.touches[0].clientX - lastTouches[0].clientX;
      const dy = e.touches[0].clientY - lastTouches[0].clientY;
      STATE.panX += dx; STATE.panY += dy;
      aplicarTransform(g);
    } else if (e.touches.length === 2 && lastTouches.length === 2) {
      const d0 = Math.hypot(lastTouches[0].clientX - lastTouches[1].clientX, lastTouches[0].clientY - lastTouches[1].clientY);
      const d1 = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const factor = d1 / d0;
      STATE.zoom = Math.min(Math.max(STATE.zoom * factor, 0.6), 5);
      aplicarTransform(g);
    }
    lastTouches = [...e.touches];
  }, { passive: false });

  // Reset doble clic
  svg.addEventListener("dblclick", () => {
    STATE.zoom = 1; STATE.panX = 0; STATE.panY = 0;
    aplicarTransform(g);
  });
}

/* ============================================================
   11. PANEL LATERAL — Selección y detalle
   ============================================================ */
function seleccionarLugar(id) {
  const lugar = STATE.lugares.find(l => l.id === id);
  if (!lugar) return;
  STATE.lugarSeleccionado = id;

  // Resaltar marcador activo
  document.querySelectorAll(".mapa-marcador").forEach(m => {
    m.style.opacity = m.dataset.id == id ? "1" : "0.45";
    if (m.dataset.id == id) {
      m.querySelector("circle:not(.marker-pulse)")?.setAttribute("r", "14");
    }
  });

  mostrarPanel(lugar);
}

function mostrarPanel(lugar) {
  const panel = document.getElementById("mapa-panel");
  const detalle = document.getElementById("mapa-panel-detalle");
  const empty = document.getElementById("mapa-panel-empty");
  if (!panel) return;

  panel.removeAttribute("hidden");
  detalle.removeAttribute("hidden");
  empty.setAttribute("hidden", "");

  const cfg = getCatConfig(lugar.categoria);
  const isFav = STATE.favoritos.has(lugar.id);

  // Imagen placeholder con gradiente temático
  const media = document.getElementById("mapa-panel-media");
  if (media) {
    media.innerHTML = `
      <div style="
        height: 140px;
        background: linear-gradient(135deg, ${cfg.color}33, ${cfg.color}11);
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        font-size: 52px;
        margin-bottom: 16px;
        border: 1px solid ${cfg.color}44;
        position: relative; overflow: hidden;
      ">
        <div style="position:absolute;inset:0;background:radial-gradient(circle at 30% 50%, ${cfg.color}22, transparent 70%)"></div>
        <span style="position:relative;filter:drop-shadow(0 0 12px ${cfg.color})">${cfg.icon}</span>
        <div style="position:absolute;bottom:8px;right:10px;font-size:10px;color:${cfg.color};font-weight:700;letter-spacing:0.05em;text-transform:uppercase">${lugar.barrio}</div>
      </div>
    `;
  }

  setEl("mapa-panel-categoria", lugar.categoria, { color: cfg.color, fontWeight: "700" });
  setEl("mapa-panel-nombre", lugar.nombre);
  setEl("mapa-panel-barrio", lugar.barrio);
  setEl("mapa-panel-info", lugar.informacion);
  setEl("mapa-panel-horario", lugar.horarios_nocturnos);
  setEl("mapa-panel-precio", lugar.precio);
  setEl("mapa-panel-accesibilidad", lugar.accesibilidad);

  // Recomendaciones
  const recList = document.getElementById("mapa-panel-recomendaciones");
  if (recList) {
    recList.innerHTML = lugar.recomendaciones.map(r => `<li>${r}</li>`).join('');
  }

  // Tags
  const tagsList = document.getElementById("mapa-panel-tags");
  if (tagsList) {
    tagsList.innerHTML = lugar.ideal_para.map(tag => `
      <li style="
        padding: 4px 12px;
        border-radius: 20px;
        background: ${cfg.color}22;
        border: 1px solid ${cfg.color}55;
        color: ${cfg.color};
        font-size: 11px; font-weight: 600;
        list-style: none;
      ">${tag}</li>
    `).join('');
  }

  // Botón favorito
  const btnFav = document.getElementById("mapa-panel-btn-favorito");
  if (btnFav) {
    actualizarBtnFavorito(btnFav, isFav, cfg.color);
    btnFav.onclick = () => toggleFavorito(lugar.id, cfg.color);
  }

  // Botón cerrar
  const btnCerrar = document.getElementById("mapa-panel-btn-cerrar");
  if (btnCerrar) btnCerrar.onclick = cerrarPanel;
}

function setEl(id, valor, styles = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = valor;
  Object.assign(el.style, styles);
}

function actualizarBtnFavorito(btn, isFav, color) {
  btn.querySelector(".map-panel__btn-favorito-icon").textContent = isFav ? "❤️" : "🤍";
  btn.querySelector(".map-panel__btn-favorito-label").textContent = isFav ? "En favoritos" : "Agregar a favoritos";
  btn.style.borderColor = isFav ? color : '';
  btn.style.color = isFav ? color : '';
  btn.setAttribute("aria-pressed", isFav);
}

function toggleFavorito(id, color) {
  if (STATE.favoritos.has(id)) {
    STATE.favoritos.delete(id);
  } else {
    STATE.favoritos.add(id);
  }
  saveFavoritos();
  const btnFav = document.getElementById("mapa-panel-btn-favorito");
  if (btnFav) actualizarBtnFavorito(btnFav, STATE.favoritos.has(id), color);

  // Re-renderizar para actualizar estrella en marcador
  renderizarMapa();
  // Re-seleccionar para mantener panel
  seleccionarLugar(id);
}

function cerrarPanel() {
  STATE.lugarSeleccionado = null;
  const panel = document.getElementById("mapa-panel");
  const detalle = document.getElementById("mapa-panel-detalle");
  const empty = document.getElementById("mapa-panel-empty");
  if (panel) panel.setAttribute("hidden", "");
  if (detalle) detalle.setAttribute("hidden", "");
  if (empty) empty.removeAttribute("hidden");

  document.querySelectorAll(".mapa-marcador").forEach(m => {
    m.style.opacity = "1";
  });
}

/* ============================================================
   12. BOTONES DE CONTROL DE ZOOM (UI extra)
   ============================================================ */
function inyectarControlesZoom() {
  const stage = document.querySelector(".map-stage");
  if (!stage || document.getElementById("zoom-controls")) return;

  const div = document.createElement("div");
  div.id = "zoom-controls";
  div.style.cssText = `
    position: absolute; top: 12px; right: 12px; z-index: 20;
    display: flex; flex-direction: column; gap: 4px;
  `;
  div.innerHTML = `
    <button id="z-in"  title="Acercar"  style="${zBtnStyle()}">＋</button>
    <button id="z-out" title="Alejar"   style="${zBtnStyle()}">－</button>
    <button id="z-rst" title="Restablecer" style="${zBtnStyle('small')}">⌂</button>
  `;
  stage.appendChild(div);

  function zBtnStyle(sz = 'normal') {
    return `
      width:32px; height:32px; border-radius:8px;
      background:rgba(10,10,20,0.85); border:1px solid rgba(108,99,255,0.4);
      color:#e2e8f0; font-size:${sz === 'small' ? '14' : '18'}px;
      cursor:pointer; display:flex; align-items:center; justify-content:center;
      backdrop-filter:blur(8px);
    `;
  }

  function remap(factor) {
    const g = document.querySelector("#mapa-g");
    STATE.zoom = Math.min(Math.max(STATE.zoom * factor, 0.6), 5);
    aplicarTransform(g);
  }

  document.getElementById("z-in").onclick  = () => remap(1.25);
  document.getElementById("z-out").onclick = () => remap(0.8);
  document.getElementById("z-rst").onclick = () => {
    STATE.zoom = 1; STATE.panX = 0; STATE.panY = 0;
    aplicarTransform(document.querySelector("#mapa-g"));
  };
}

/* ============================================================
   13. BÚSQUEDA EN TIEMPO REAL
   ============================================================ */
function setupBusqueda() {
  const input = document.getElementById("search-input");
  if (!input) return;

  input.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      renderizarMapa();
      return;
    }
    const coincidencias = STATE.lugares.filter(l =>
      l.nombre.toLowerCase().includes(q) ||
      l.barrio.toLowerCase().includes(q) ||
      l.categoria.toLowerCase().includes(q) ||
      l.informacion.toLowerCase().includes(q)
    );

    const contenedor = document.getElementById("mapa-contenedor");
    if (!contenedor) return;
    contenedor.innerHTML = '';
    const svg = buildSVG(coincidencias, 'todos');
    contenedor.appendChild(svg);

    const g = svg.querySelector("#mapa-g");
    aplicarTransform(g);
    setupZoomPan(svg, g);

    const contador = document.getElementById("mapa-contador");
    if (contador) contador.textContent = coincidencias.length;
  });
}

/* ============================================================
   14. INIT
   ============================================================ */
async function init() {
  // Mostrar loading
  const loading = document.getElementById("mapa-loading");
  const error   = document.getElementById("mapa-error");
  const panel   = document.getElementById("mapa-panel");

  if (panel) panel.setAttribute("hidden", "");

  try {
    const data = await cargarLugares();
    STATE.lugares = data;

    if (loading) loading.setAttribute("hidden", "");

    renderizarMapa();
    renderizarFiltros(STATE.lugares);
    renderizarLeyenda();
    inyectarControlesZoom();
    setupBusqueda();

  } catch (e) {
    console.error("Error inicializando mapa:", e);
    if (loading) loading.setAttribute("hidden", "");
    if (error)   error.removeAttribute("hidden");
  }
}

/* ============================================================
   15. DATOS FALLBACK (embebidos para cuando no hay servidor)
   ============================================================ */
const LUGARES_FALLBACK = [
  { id:1, nombre:"Teatro Colón",        categoria:"Teatro / Cultura",    barrio:"San Nicolás", zona_comuna:"San Nicolás — Comuna 1", ubicacion_exacta:"Cerrito 628",               coordenadas:{latitud:-34.6011,longitud:-58.3831}, horarios_nocturnos:"20:00 a 23:00",                  precio:"Alto",         accesibilidad:"Alta",  recomendaciones:["Reservar con anticipación","Llegar temprano","Ideal para fotografía nocturna"],          informacion:"El Teatro Colón es considerado uno de los teatros líricos más importantes del mundo gracias a su acústica y arquitectura monumental. Durante la noche, el edificio iluminado sobre Avenida 9 de Julio genera una atmósfera elegante y clásica.", ideal_para:["Turistas","Parejas","Amantes de la cultura"] },
  { id:2, nombre:"El Querandí",         categoria:"Tango / Gastronomía", barrio:"San Telmo",   zona_comuna:"San Telmo — Comuna 1",   ubicacion_exacta:"Perú 322",                  coordenadas:{latitud:-34.6122,longitud:-58.3734}, horarios_nocturnos:"20:00 a 23:30",                  precio:"Alto",         accesibilidad:"Media", recomendaciones:["Ideal para primera experiencia de tango","Reservar con anticipación","Elegir opción con cena"],  informacion:"El Querandí funciona dentro de un edificio histórico con decoración clásica y ambiente íntimo. El espectáculo combina tango, música en vivo y relatos históricos sobre Buenos Aires.",                  ideal_para:["Turistas internacionales","Parejas","Amantes del tango"] },
  { id:3, nombre:"Puerto Madero",       categoria:"Paseo Urbano",        barrio:"Puerto Madero",zona_comuna:"Puerto Madero — C1",     ubicacion_exacta:"Zona del Puente de la Mujer",coordenadas:{latitud:-34.6118,longitud:-58.3631}, horarios_nocturnos:"Acceso libre toda la noche",     precio:"Sin costo",    accesibilidad:"Alta",  recomendaciones:["Ideal para caminatas nocturnas","Excelente fotografía urbana","Cenar frente al río"],          informacion:"Puerto Madero es el sector más moderno de Buenos Aires y durante la noche se transforma gracias a las luces reflejadas sobre los diques.",                                                            ideal_para:["Turistas","Parejas","Fotógrafos"] },
  { id:4, nombre:"Avenida Corrientes",  categoria:"Avenida Cultural",    barrio:"San Nicolás", zona_comuna:"Comunas 1 y 3",          ubicacion_exacta:"Tramo Callao - 9 de Julio", coordenadas:{latitud:-34.6037,longitud:-58.3925}, horarios_nocturnos:"Actividad intensa hasta madrugada",precio:"Variable",     accesibilidad:"Alta",  recomendaciones:["Combinar teatro y pizza","Recorrer librerías nocturnas","Ideal para caminar"],               informacion:"La Avenida Corrientes es conocida como la calle que nunca duerme debido a su intensa actividad cultural y gastronómica nocturna.",                                                                    ideal_para:["Turistas","Amigos","Amantes del teatro"] },
  { id:5, nombre:"Planetario Galileo",  categoria:"Ciencia / Cultura",   barrio:"Palermo",     zona_comuna:"Palermo — Comuna 14",    ubicacion_exacta:"Av. Sarmiento s/n",         coordenadas:{latitud:-34.5692,longitud:-58.4115}, horarios_nocturnos:"Funciones y observaciones según agenda",precio:"Bajo",      accesibilidad:"Alta",  recomendaciones:["Ir en noches despejadas","Consultar agenda astronómica","Ideal para familias"],               informacion:"El Planetario se encuentra rodeado por los Bosques de Palermo y de noche adquiere un aspecto futurista gracias a su iluminación exterior.",                                                          ideal_para:["Familias","Estudiantes","Parejas"] },
  { id:6, nombre:"Barrio Chino",        categoria:"Gastronomía / Cultura",barrio:"Belgrano",    zona_comuna:"Belgrano — Comuna 13",   ubicacion_exacta:"Arribeños y Mendoza",       coordenadas:{latitud:-34.5615,longitud:-58.4497}, horarios_nocturnos:"18:00 a 00:00",                  precio:"Bajo/Medio",   accesibilidad:"Alta",  recomendaciones:["Probar comida callejera asiática","Visitar supermercados orientales","Ideal para fotografías"],   informacion:"El Barrio Chino ofrece una experiencia nocturna distinta dentro de Buenos Aires gracias a sus luces, faroles y gastronomía asiática.",                                                               ideal_para:["Jóvenes","Turistas","Foodies"] },
  { id:7, nombre:"Plaza Serrano",       categoria:"Vida Nocturna",       barrio:"Palermo",     zona_comuna:"Palermo Soho — C14",     ubicacion_exacta:"Serrano y Honduras",        coordenadas:{latitud:-34.5881,longitud:-58.4299}, horarios_nocturnos:"Bares hasta 03:00",              precio:"Medio",        accesibilidad:"Alta",  recomendaciones:["Ideal para grupos de amigos","Recorrer bares temáticos","Visitar fines de semana"],            informacion:"Plaza Serrano es uno de los principales centros de vida nocturna de Buenos Aires, rodeado de bares, cervecerías y restaurantes con estilos muy variados.",                                           ideal_para:["Jóvenes","Grupos de amigos","Turistas"] },
  { id:8, nombre:"Usina del Arte",      categoria:"Centro Cultural",     barrio:"La Boca",     zona_comuna:"La Boca — Comuna 4",     ubicacion_exacta:"Caffarena 1",               coordenadas:{latitud:-34.6283,longitud:-58.3649}, horarios_nocturnos:"Hasta aprox. 23:00",             precio:"Gratuito/Bajo",accesibilidad:"Alta",  recomendaciones:["Consultar agenda cultural","Ideal para conciertos","Combinar con paseo por La Boca"],          informacion:"La Usina del Arte es uno de los centros culturales más importantes del sur de la ciudad, con arquitectura industrial restaurada y espectáculos gratuitos.",                                          ideal_para:["Familias","Turistas","Amantes del arte"] },
  { id:9, nombre:"Caminito",            categoria:"Turismo Histórico",   barrio:"La Boca",     zona_comuna:"La Boca — Comuna 4",     ubicacion_exacta:"Caminito y Magallanes",     coordenadas:{latitud:-34.6356,longitud:-58.3648}, horarios_nocturnos:"Recomendable hasta 22:00",       precio:"Sin costo",    accesibilidad:"Media", recomendaciones:["Ir acompañado","Mantenerse en zonas turísticas","Ideal para fotografía"],                      informacion:"Caminito conserva su identidad colorida y artística incluso durante la noche, con restaurantes y espacios de tango con música en vivo.",                                                             ideal_para:["Turistas","Fotógrafos","Parejas"] },
  { id:10,nombre:"Parque Centenario",   categoria:"Espacio Verde",       barrio:"Caballito",   zona_comuna:"Caballito — Comuna 6",   ubicacion_exacta:"Av. Díaz Vélez y Marechal", coordenadas:{latitud:-34.6067,longitud:-58.4356}, horarios_nocturnos:"Bares cercanos hasta madrugada", precio:"Sin costo",    accesibilidad:"Alta",  recomendaciones:["Combinar con bares cercanos","Ideal para caminatas","Visitar cafés de la zona"],               informacion:"Parque Centenario es uno de los espacios verdes más importantes del centro geográfico de Buenos Aires, con bares y restaurantes modernos en sus alrededores.",                                       ideal_para:["Familias","Amigos","Estudiantes"] },
];

/* ============================================================
   ARRANQUE
   ============================================================ */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}