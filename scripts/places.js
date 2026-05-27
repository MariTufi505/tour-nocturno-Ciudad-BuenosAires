// ==========================================
// CONFIGURACIÓN GLOBAL Y LOCALSTORAGE
// ==========================================
const URL_JSON = 'places.json';
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