function abrirModal(lugar) {
    const modal = document.getElementById('placeModal');
    const contenido = document.getElementById('placeModalContent');
    const imagenLugar = `../assets/images/${lugar.imagen}`;

    contenido.innerHTML = `
        <article class="place-detail">
            <button class="place-detail__close">×</button>

            <button class="place-detail__favorite">
            ${favoritos.includes(lugar.id)
                ? '❤️ En favoritos'
                : '♡ Agregar a favoritos'}
            </button>

            <figure class="place-detail__image">
                <img
                    src="${imagenLugar}"
                    alt="${lugar.nombre}"
                    class="place-detail__img"
                >
            </figure>

            <div class="place-detail__info">
                <h2>${lugar.nombre}</h2>

                <p>${lugar.informacion}</p>

                <p><strong>Horario:</strong> ${lugar.horarios_nocturnos}</p>

                <p><strong>Precio:</strong> ${lugar.precio}</p>

                <p><strong>Ubicación:</strong> ${lugar.ubicacion_exacta}</p>
            </div>
        </article>
    `;

    modal.classList.add('place-modal--open');
    console.log('modal abierto');

    const btnCerrar = contenido.querySelector('.place-detail__close');
    btnCerrar.addEventListener('click', cerrarModal);

    const btnFavoritoModal = contenido.querySelector('.place-detail__favorite');
    btnFavoritoModal.addEventListener('click', () => {
    manejarFavorito(lugar.id, btnFavoritoModal);
});
    
}

function cerrarModal() {
    console.log('modal cerrado');
    const modal = document.getElementById('placeModal');
    modal.classList.remove('place-modal--open');
}
