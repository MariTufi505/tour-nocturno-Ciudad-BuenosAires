const URL_JSON = './data/places.json';

document.addEventListener('DOMContentLoaded', () => {

  const contenedor = document.getElementById('contenedor-cards-index');

  console.log(contenedor);

  cargarLugares();

});

async function cargarLugares() {

  try {

    const respuesta = await fetch(URL_JSON);

    const lugares = await respuesta.json();

    console.log(lugares);

  } catch(error) {

    console.error('Error cargando JSON:', error);

  }

}