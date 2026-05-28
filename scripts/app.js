const URL_JSON = './data/places.json';

document.addEventListener('DOMContentLoaded', () => {
  const contenedor = document.getElementById('contenedor-cards-index');
  console.log(contenedor);
  cargarLugares(contenedor);
});

async function cargarLugares(contenedor) {

  try {
    const respuesta = await fetch(URL_JSON);

    if (!respuesta.ok) {
      throw new Error('No se pudo cargar el JSON');
    }

    const lugares = await respuesta.json();
    console.log(lugares);
    renderizarCards(lugares, contenedor);

  } catch(error) {
    console.error('Error cargando JSON:', error);
  }

}

function renderizarCards(lugares, contenedor) {
  contenedor.innerHTML = '';
  const lugaresAMostrar = lugares.slice(0, 3);
  lugaresAMostrar.forEach((lugar) => {
    const card = document.createElement('li');
    card.classList.add('card');

    card.innerHTML = `
      <article class="card__inner">
        <figure class="card__media">
          <img
            class="card__img"
            src="${lugar.imagen}"
            alt="${lugar.nombre}"
          >

          <div class="card__gradient"></div>

          <span class="card__badge">
            ${lugar.categoria}
          </span>

        </figure>

        <div class="card__body">

          <h3 class="card__title">
            ${lugar.nombre}
          </h3>

          <div class="card__location">

            <span class="card__location-text">
              📍 ${lugar.barrio}
            </span>

          </div>

          <p class="card__description">
            ${lugar.informacion.substring(0, 120)}...
          </p>

          <footer class="card__footer">

            <button class="card__btn" type="button">
              Ver más
            </button>

          </footer>

        </div>

      </article>
    `;

    contenedor.appendChild(card);

  });

}