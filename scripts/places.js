// ==========================================
// CONFIGURACIÓN GLOBAL Y LOCALSTORAGE
// ==========================================
// Si la página incluye "map.html" en la URL o estamos en una subcarpeta, subimos un nivel
const paginaActual = window.location.pathname;
const URL_JSON = paginaActual.includes('map.html') || paginaActual.includes('places.html') 
    ? '../data/places.json' 
    : './data/places.json';
// Obtenemos los favoritos del localStorage o inicializamos un array vacío
let favoritos = JSON.parse(localStorage.getItem('lugaresFavoritos')) || [];
let datosLugares = []; // Array donde se guardarán los objetos del JSON

// Creamos la "mini ventana" (tooltip) y la agregamos al body
// Variable global para el tooltip
let tooltip; 

document.addEventListener('DOMContentLoaded', () => {
    // 1. Crear el tooltip
    tooltip = document.createElement('div');
    tooltip.id = 'tooltip-resena';
    Object.assign(tooltip.style, {
        position: 'absolute',
        display: 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: '#fff',
        padding: '12px',
        borderRadius: '8px',
        pointerEvents: 'none',
        zIndex: '1000',
        maxWidth: '250px',
        fontSize: '0.9rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
    });
    document.body.appendChild(tooltip);

    // 2. Cargar los contenedores
    const contenedorIndex = document.getElementById('contenedor-cards-index');
    
    // Verificamos que el contenedor exista antes de intentar cargar los datos
    // Esto evita errores en consola si usas este mismo JS en otras páginas (como map.html)
    if (contenedorIndex) {
        cargarDatos(contenedorIndex);
    }
});

// ==========================================
// LÓGICA PRINCIPAL
// ==========================================

// 1. Cargar el JSON y convertirlo a Array de objetos
async function cargarDatos(contenedor) {
    try {
        const respuesta = await fetch(URL_JSON);
        if (!respuesta.ok) throw new Error("Error al cargar el JSON");
        
        datosLugares = await respuesta.json();
        renderizarCards(datosLugares, contenedor);
    } catch (error) {
        console.error("Hubo un problema con la petición Fetch:", error);
        contenedor.innerHTML = '<p>Error al cargar los lugares. Verifica que places.json exista y sea válido.</p>';
    }
}

// 2. Renderizar las Cards en el HTML
function renderizarCards(lugares, contenedor) {
    contenedor.innerHTML = ''; // Limpiamos el contenedor

    // Limitamos el array a 3 elementos si estamos en el inicio
    const lugaresAMostrar = contenedor.id === 'contenedor-cards-index' ? lugares.slice(0, 3) : lugares;

    lugaresAMostrar.forEach(lugar => {
        const card = document.createElement('div');
        card.classList.add('card-lugar');
        
        // Aplicamos estilos base y flexbox para igualar alturas
        Object.assign(card.style, {
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "15px",
            cursor: "pointer",
            position: "relative",
            display: "flex",
            flexDirection: "column"
        });

        const esFavorito = favoritos.includes(lugar.id);

        // Generamos los items de recomendaciones para la lista (si existen)
        const listaRecomendaciones = lugar.recomendaciones && lugar.recomendaciones.length > 0 
            ? lugar.recomendaciones.map(rec => `<li>${rec}</li>`).join('') 
            : '<li>Sin recomendaciones específicas</li>';

        // Inyectamos el HTML. Usamos flex-grow: 1 para empujar el botón hacia abajo.
        card.innerHTML = `
            <div class="card-contenido" style="display: flex; flex-direction: column; flex-grow: 1;">
                <span style="font-size: 0.8rem; color: #666; text-transform: uppercase;">${lugar.categoria}</span>
                <h3 style="margin: 5px 0;">${lugar.nombre}</h3>
                <p style="font-size: 0.9rem; color: #555;">📍 ${lugar.barrio} - ${lugar.ubicacion_exacta}</p>
                
                <p class="descripcion-corta" style="flex-grow: 1;">${lugar.informacion.substring(0, 100)}...</p>
                
                <div class="info-extendida" style="display: none; margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px; flex-grow: 1;">
                    <p style="font-size: 0.9rem;"><strong>Historia/Detalles:</strong> ${lugar.informacion}</p>
                    <p style="font-size: 0.9rem;"><strong>Horario Nocturno:</strong> ${lugar.horarios_nocturnos}</p>
                    <p style="font-size: 0.9rem;"><strong>Precio:</strong> ${lugar.precio} | <strong>Accesibilidad:</strong> ${lugar.accesibilidad}</p>
                    <div style="font-size: 0.9rem; margin-top: 10px;">
                        <strong>Recomendaciones:</strong>
                        <ul style="margin-top: 5px; padding-left: 20px;">
                            ${listaRecomendaciones}
                        </ul>
                    </div>
                </div>
                
                <button class="btn-favorito" style="margin-top: 15px; padding: 8px 12px; cursor: pointer; border: none; border-radius: 4px; background-color: ${esFavorito ? '#ffebee' : '#f0f0f0'}; color: ${esFavorito ? '#c62828' : '#333'}; font-weight: bold; width: 100%;">
                    ${esFavorito ? '❤️ Quitar Favorito' : '🤍 Agregar Favorito'}
                </button>
            </div>
        `;

        // 3. Lógica del Hover (Mini ventana)
        card.addEventListener('mousemove', (e) => {
            const idealParaTexto = lugar.ideal_para ? lugar.ideal_para.join(', ') : 'Todos';
            tooltip.innerHTML = `<strong>Ideal para:</strong><br>${idealParaTexto}`;
            tooltip.style.display = 'block';
            tooltip.style.left = `${e.pageX + 15}px`;
            tooltip.style.top = `${e.pageY + 15}px`;
        });

        card.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });

        // 4. Lógica del Click (Mostrar info extendida)
        card.addEventListener('click', (e) => {
            // Evitamos que al presionar el botón de favorito se abra la tarjeta
            if (e.target.classList.contains('btn-favorito')) return;

            const infoExtendida = card.querySelector('.info-extendida');
            const descCorta = card.querySelector('.descripcion-corta');
            
            if (infoExtendida.style.display === 'none') {
                infoExtendida.style.display = 'block';
                descCorta.style.display = 'none'; // Ocultamos el extracto cuando se expande
            } else {
                infoExtendida.style.display = 'none';
                descCorta.style.display = 'block'; // Mostramos el extracto cuando se contrae
            }
        });

        // 5. Lógica del Botón Favorito (LocalStorage)
        const btnFavorito = card.querySelector('.btn-favorito');
        btnFavorito.addEventListener('click', (e) => {
            e.stopPropagation(); // Seguridad extra para evitar que el click afecte a la card
            manejarFavorito(lugar.id, btnFavorito);
        });

        contenedor.appendChild(card);
    });
}

// Función para añadir/quitar del LocalStorage
function manejarFavorito(idLugar, botonElemento) {
    const indice = favoritos.indexOf(idLugar);

    if (indice === -1) {
        // No está en favoritos, lo agregamos
        favoritos.push(idLugar);
        botonElemento.textContent = '❤️ Quitar Favorito';
        botonElemento.style.backgroundColor = '#ffebee';
        botonElemento.style.color = '#c62828';
    } else {
        // Ya está en favoritos, lo quitamos
        favoritos.splice(indice, 1);
        botonElemento.textContent = '🤍 Agregar Favorito';
        botonElemento.style.backgroundColor = '#f0f0f0';
        botonElemento.style.color = '#333';
    }

    localStorage.setItem('lugaresFavoritos', JSON.stringify(favoritos));
}

// ==========================================
// LÓGICA DEL MAPA INTERACTIVO (map.html)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const mapaContenedor = document.getElementById('mapa-contenedor');
    
    // Solo ejecutamos la lógica del mapa si estamos en map.html
    if (mapaContenedor) {
        inicializarMapaApp();
    }
});

async function inicializarMapaApp() {
    const loading = document.getElementById('mapa-loading');
    const errorContenedor = document.getElementById('mapa-error');
    
    try {
        const respuesta = await fetch(URL_JSON);
        if (!respuesta.ok) throw new Error("Error al cargar el JSON del mapa");
        
        const lugares = await respuesta.json();
        
        // Ocultar loading
        if (loading) loading.style.display = 'none';
        
        // Configurar la interfaz del mapa
        configurarFiltrosMapa(lugares);
        renderizarMapaSvg(lugares, 'Todos');
        configurarBotonCerrarPanel();

    } catch (error) {
        console.error("Error cargando el mapa:", error);
        if (loading) loading.style.display = 'none';
        if (errorContenedor) errorContenedor.hidden = false;
    }
}

// 1. Configuración de Filtros
function configurarFiltrosMapa(lugares) {
    const contenedorFiltros = document.getElementById('mapa-filtros');
    if (!contenedorFiltros) return;

    // Extraer categorías únicas (simplificando la primera parte antes de la barra '/')
    const categoriasSueltas = lugares.map(l => l.categoria.split(' / ')[0].trim());
    const categoriasUnicas = ['Todos', ...new Set(categoriasSueltas)];

    contenedorFiltros.innerHTML = ''; // Limpiar

    categoriasUnicas.forEach(cat => {
        const btn = document.createElement('button');
        btn.textContent = cat;
        btn.classList.add('map-filter-btn');
        // Estilo base por JS (puedes moverlo a tu CSS)
        Object.assign(btn.style, {
            padding: '8px 16px', margin: '4px', borderRadius: '20px',
            border: '1px solid #ccc', background: cat === 'Todos' ? '#333' : '#fff',
            color: cat === 'Todos' ? '#fff' : '#333', cursor: 'pointer'
        });

        btn.addEventListener('click', () => {
            // Actualizar estilos activos
            document.querySelectorAll('.map-filter-btn').forEach(b => {
                b.style.background = '#fff';
                b.style.color = '#333';
            });
            btn.style.background = '#333';
            btn.style.color = '#fff';

            // Re-renderizar mapa con filtro
            renderizarMapaSvg(lugares, cat);
        });

        contenedorFiltros.appendChild(btn);
    });
}

// 2. Renderizado del Mapa Artificial (SVG)
function renderizarMapaSvg(lugares, filtro) {
    const contenedor = document.getElementById('mapa-contenedor');
    const contador = document.getElementById('mapa-contador');
    contenedor.innerHTML = ''; // Limpiar lienzo

    // Filtrar lugares
    const lugaresFiltrados = filtro === 'Todos' 
        ? lugares 
        : lugares.filter(l => l.categoria.includes(filtro));
    
    if (contador) contador.textContent = lugaresFiltrados.length;

    // Dimensiones del lienzo virtual
    const width = 800;
    const height = 800;
    const padding = 50;

    // Crear elemento SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.style.width = "100%";
    svg.style.height = "100%";
    
    /* NOTA: Si en el futuro quieres poner la imagen de los barrios de fondo, 
      puedes descomentar este bloque y agregar tu imagen.
      
      const imagenFondo = document.createElementNS("http://www.w3.org/2000/svg", "image");
      imagenFondo.setAttribute("href", "../assets/buenos-aires-safety-map-768x768.jpg");
      imagenFondo.setAttribute("width", "100%");
      imagenFondo.setAttribute("height", "100%");
      imagenFondo.setAttribute("preserveAspectRatio", "xMidYMid slice");
      svg.appendChild(imagenFondo);
    */

    // Encontrar límites geográficos de CABA aprox (para calcular la proyección)
    // Usamos los máximos y mínimos de los lugares presentes
    const lats = lugares.map(l => l.coordenadas.latitud);
    const lngs = lugares.map(l => l.coordenadas.longitud);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Renderizar los pines (marcadores)
    lugaresFiltrados.forEach(lugar => {
        // Conversión matemática de Lat/Lng a coordenadas X/Y del SVG
        const x = ((lugar.coordenadas.longitud - minLng) / (maxLng - minLng)) * (width - padding * 2) + padding;
        const y = ((maxLat - lugar.coordenadas.latitud) / (maxLat - minLat)) * (height - padding * 2) + padding;

        const grupoPin = document.createElementNS("http://www.w3.org/2000/svg", "g");
        grupoPin.style.cursor = "pointer";
        
        // Círculo del pin
        const pin = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        pin.setAttribute("cx", x);
        pin.setAttribute("cy", y);
        pin.setAttribute("r", "12");
        pin.setAttribute("fill", "#e91e63");
        pin.setAttribute("stroke", "#ffffff");
        pin.setAttribute("stroke-width", "3");
        
        // Animación hover por JS (básica)
        grupoPin.addEventListener('mouseenter', () => pin.setAttribute("r", "16"));
        grupoPin.addEventListener('mouseleave', () => pin.setAttribute("r", "12"));

        // Evento Click para abrir el panel
        grupoPin.addEventListener('click', () => abrirPanelLugar(lugar));

        grupoPin.appendChild(pin);
        svg.appendChild(grupoPin);
    });

    contenedor.appendChild(svg);
}

// 3. Lógica del Panel Lateral
function abrirPanelLugar(lugar) {
    const panel = document.getElementById('mapa-panel');
    const panelEmpty = document.getElementById('mapa-panel-empty');
    const panelDetalle = document.getElementById('mapa-panel-detalle');

    // Mostrar el panel activo
    panel.hidden = false;
    panelEmpty.style.display = 'none';
    panelDetalle.hidden = false;

    // Inyectar datos en el DOM
    document.getElementById('mapa-panel-categoria').textContent = lugar.categoria;
    document.getElementById('mapa-panel-nombre').textContent = lugar.nombre;
    document.getElementById('mapa-panel-barrio').textContent = lugar.barrio;
    document.getElementById('mapa-panel-info').textContent = lugar.informacion;
    document.getElementById('mapa-panel-horario').textContent = lugar.horarios_nocturnos || 'No especificado';
    document.getElementById('mapa-panel-precio').textContent = lugar.precio;
    document.getElementById('mapa-panel-accesibilidad').textContent = lugar.accesibilidad;

    // Recomendaciones (Listas)
    const containerRecomendaciones = document.getElementById('mapa-panel-recomendaciones');
    containerRecomendaciones.innerHTML = lugar.recomendaciones
        ? lugar.recomendaciones.map(r => `<li>${r}</li>`).join('')
        : '<li>Sin recomendaciones.</li>';

    // Tags (Ideal para)
    const containerTags = document.getElementById('mapa-panel-tags');
    containerTags.innerHTML = lugar.ideal_para
        ? lugar.ideal_para.map(tag => `<li class="map-panel__tag" style="display:inline-block; background:#eee; padding:4px 8px; border-radius:4px; margin:2px; font-size:0.8rem;">${tag}</li>`).join('')
        : '';

    // Lógica del botón Favorito (reutilizando variable global "favoritos" de places.js)
    const btnFav = document.getElementById('mapa-panel-btn-favorito');
    
    // Limpiamos listeners previos clonando el nodo para evitar múltiples ejecuciones
    const nuevoBtnFav = btnFav.cloneNode(true);
    btnFav.parentNode.replaceChild(nuevoBtnFav, btnFav);
    
    actualizarVistaBtnFavMapa(nuevoBtnFav, lugar.id);

    nuevoBtnFav.addEventListener('click', () => {
        // Reutilizamos la función que ya hiciste arriba en places.js!
        manejarFavorito(lugar.id, nuevoBtnFav);
        // Modificamos ligeramente la apariencia porque en el mapa el diseño es distinto
        actualizarVistaBtnFavMapa(nuevoBtnFav, lugar.id);
    });
}

function actualizarVistaBtnFavMapa(boton, idLugar) {
    const esFavorito = favoritos.includes(idLugar); // 'favoritos' viene de la parte superior de places.js
    const label = boton.querySelector('.map-panel__btn-favorito-label');
    const icon = boton.querySelector('.map-panel__btn-favorito-icon');
    
    if (label && icon) {
        label.textContent = esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos';
        icon.textContent = esFavorito ? '❤️' : '🤍';
    }
}

function configurarBotonCerrarPanel() {
    const btnCerrar = document.getElementById('mapa-panel-btn-cerrar');
    if (!btnCerrar) return;

    btnCerrar.addEventListener('click', () => {
        document.getElementById('mapa-panel-empty').style.display = 'flex';
        document.getElementById('mapa-panel-detalle').hidden = true;
        // Opcional: Ocultar panel entero en móviles
        if (window.innerWidth < 768) {
            document.getElementById('mapa-panel').hidden = true;
        }
    });
}