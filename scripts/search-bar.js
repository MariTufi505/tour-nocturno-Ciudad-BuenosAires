// ==========================================
// BÚSQUEDA CON AUTOCOMPLETADO
// ==========================================

const PLACES_JSON_URL = "/data/places.json";

let lugaresCacheados = null;

async function obtenerLugares() {
  if (lugaresCacheados) return lugaresCacheados;
  try {
    const res = await fetch(PLACES_JSON_URL);
    if (!res.ok) throw new Error("No se pudo cargar places.json");
    lugaresCacheados = await res.json();
    return lugaresCacheados;
  } catch (e) {
    console.error("Error cargando lugares:", e);
    return [];
  }
}

function crearDropdown(inputEl) {
  const dropdown = document.createElement("ul");
  dropdown.id = "search-dropdown";
  dropdown.setAttribute("role", "listbox");
  dropdown.setAttribute("aria-label", "Sugerencias de búsqueda");

  Object.assign(dropdown.style, {
    position: "absolute",
    top: "100%",
    left: "0",
    right: "0",
    marginTop: "8px",
    backgroundColor: "#18181f",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "10px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    zIndex: "200",
    listStyle: "none",
    padding: "6px",
    maxHeight: "320px",
    overflowY: "auto",
    display: "none",
  });

  // El wrapper del input necesita position: relative para que el dropdown se posicione bien
  const wrapper = inputEl.closest(".site-search");
  if (wrapper) {
    wrapper.style.position = "relative";
    wrapper.appendChild(dropdown);
  }

  return dropdown;
}

function renderDropdown(dropdown, inputEl, lugares, query) {
  dropdown.innerHTML = "";

  if (!lugares.length) {
    const empty = document.createElement("li");
    empty.textContent = "Sin resultados";
    Object.assign(empty.style, {
      padding: "10px 12px",
      color: "rgba(240,237,248,0.35)",
      fontSize: "0.875rem",
      fontFamily: "'DM Sans', sans-serif",
    });
    dropdown.appendChild(empty);
    dropdown.style.display = "block";
    return;
  }

  lugares.forEach((lugar) => {
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    li.setAttribute("tabindex", "0");
    li.setAttribute("data-lugar-id", lugar.id);

    // Resaltar la parte que coincide con el query
    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const nombreResaltado = lugar.nombre.replace(
      regex,
      '<mark style="background:rgba(124,58,237,0.35);color:#f0edf8;border-radius:3px;padding:0 2px;">$1</mark>',
    );

    li.innerHTML = `
      <span class="search-result__name">${nombreResaltado}</span>
      <span class="search-result__meta">${lugar.barrio} · ${lugar.categoria}</span>
    `;

    Object.assign(li.style, {
      display: "flex",
      flexDirection: "column",
      gap: "2px",
      padding: "10px 12px",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "background 150ms ease",
      fontFamily: "'DM Sans', sans-serif",
    });

    const nameEl = li.querySelector(".search-result__name");
    Object.assign(nameEl.style, {
      fontSize: "0.9375rem",
      fontWeight: "500",
      color: "#f0edf8",
    });

    const metaEl = li.querySelector(".search-result__meta");
    Object.assign(metaEl.style, {
      fontSize: "0.75rem",
      color: "rgba(240,237,248,0.45)",
    });

    li.addEventListener("mouseenter", () => {
      li.style.background = "rgba(124,58,237,0.12)";
    });
    li.addEventListener("mouseleave", () => {
      li.style.background = "transparent";
    });

    const irALugar = () => {
      dropdown.style.display = "none";
      inputEl.value = "";
      abrirModalBusqueda(lugar);
    };

    li.addEventListener("mousedown", (e) => {
      e.preventDefault(); // evita que el input pierda foco y dispare el cierre
      irALugar();
    });
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        irALugar();
      }
      // Navegar con flechas
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = li.nextElementSibling;
        if (next) next.focus();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = li.previousElementSibling;
        if (prev) prev.focus();
        else inputEl.focus();
      }
    });

    dropdown.appendChild(li);
  });

  dropdown.style.display = "block";
}

function iniciarBusqueda() {
  const inputEl = document.getElementById("search-input");
  if (!inputEl) return;

  const dropdown = crearDropdown(inputEl);
  let debounceTimer = null;

  inputEl.addEventListener("input", async () => {
    clearTimeout(debounceTimer);
    const query = inputEl.value.trim();

    if (!query) {
      dropdown.style.display = "none";
      return;
    }

    debounceTimer = setTimeout(async () => {
      const lugares = await obtenerLugares();
      const filtrados = lugares.filter(
        (l) =>
          l.nombre.toLowerCase().includes(query.toLowerCase()) ||
          l.barrio.toLowerCase().includes(query.toLowerCase()) ||
          l.categoria.toLowerCase().includes(query.toLowerCase()),
      );
      renderDropdown(dropdown, inputEl, filtrados, query);
    }, 150);
  });

  // Flechas desde el input bajan al primer resultado
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const first = dropdown.querySelector("li");
      if (first) first.focus();
    }
    if (e.key === "Escape") {
      dropdown.style.display = "none";
      inputEl.blur();
    }
  });

  // Cerrar al hacer click fuera
  document.addEventListener("click", (e) => {
    if (!inputEl.closest(".site-search").contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

  // Evitar que el form haga submit si hay query
  inputEl.closest("form")?.addEventListener("submit", (e) => {
    e.preventDefault();
  });
}

// ==========================================
// MODAL DE BÚSQUEDA
// Usa el modal existente de la página si está disponible (places.html),
// o crea uno propio si no existe (index.html u otras páginas).
// ==========================================

let favoritosSearch =
  JSON.parse(localStorage.getItem("lugaresFavoritos")) || [];

function asegurarModal() {
  if (document.getElementById("placeModal")) {
    // El modal ya existe — nos aseguramos de que tenga los listeners
    const modal = document.getElementById("placeModal");
    if (!modal.dataset.searchListeners) {
      modal.dataset.searchListeners = "true";
      modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrarModalBusqueda();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") cerrarModalBusqueda();
      });
    }
    return;
  }

  const modal = document.createElement("div");
  modal.id = "placeModal";
  modal.className = "place-modal";
  modal.dataset.searchListeners = "true";

  const content = document.createElement("div");
  content.id = "placeModalContent";
  content.className = "place-modal__content";

  modal.appendChild(content);
  document.body.appendChild(modal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModalBusqueda();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarModalBusqueda();
  });
}

function abrirModalBusqueda(lugar) {
  if (typeof abrirModal === "function") {
    abrirModal(lugar);
    return;
  }

  asegurarModal();

  favoritosSearch = JSON.parse(localStorage.getItem("lugaresFavoritos")) || [];
  const esFav = favoritosSearch.includes(lugar.id);

  const contenido = document.getElementById("placeModalContent");
  contenido.innerHTML = `
    <article class="place-detail">
      <button class="place-detail__close" aria-label="Cerrar">×</button>

      <button class="place-detail__favorite">
        ${esFav ? "❤️ En favoritos" : "♡ Agregar a favoritos"}
      </button>

      <div class="place-detail__image">Imagen</div>

      <div class="place-detail__info">
        <h2>${lugar.nombre}</h2>
        <p>${lugar.informacion}</p>
        <p><strong>Horario:</strong> ${lugar.horarios_nocturnos}</p>
        <p><strong>Precio:</strong> ${lugar.precio}</p>
        <p><strong>Ubicación:</strong> ${lugar.ubicacion_exacta}</p>
      </div>
    </article>
  `;

  document.getElementById("placeModal").classList.add("place-modal--open");

  contenido
    .querySelector(".place-detail__close")
    .addEventListener("click", cerrarModalBusqueda);

  const btnFav = contenido.querySelector(".place-detail__favorite");
  btnFav.addEventListener("click", () => {
    favoritosSearch =
      JSON.parse(localStorage.getItem("lugaresFavoritos")) || [];
    const idx = favoritosSearch.indexOf(lugar.id);
    if (idx === -1) favoritosSearch.push(lugar.id);
    else favoritosSearch.splice(idx, 1);
    localStorage.setItem("lugaresFavoritos", JSON.stringify(favoritosSearch));
    btnFav.textContent = favoritosSearch.includes(lugar.id)
      ? "❤️ En favoritos"
      : "♡ Agregar a favoritos";
  });
}

function cerrarModalBusqueda() {
  const modal = document.getElementById("placeModal");
  if (modal) modal.classList.remove("place-modal--open");
}

// ==========================================
// INIT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  iniciarBusqueda();
});
