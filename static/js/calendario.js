document.addEventListener("DOMContentLoaded", () => {
    const prevDayBtn = document.getElementById("prev-day-btn");
    const currentDateSpan = document.getElementById("current-date");
    const recetaSeleccionada = document.getElementById("receta-seleccionada");

    // Fecha actual
    let currentDate = new Date();

    // Función para formatear la fecha como "YYYY-MM-DD"
    function formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    // Función para actualizar la fecha mostrada
    function updateDateDisplay() {
        const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
        currentDateSpan.textContent = currentDate.toLocaleDateString("es-ES", options);
    }

    // Función para cargar la receta del día
    async function loadRecetaDelDia(date) {
        try {
            const response = await fetch(`/recetas/recetaPorFecha?fecha=${formatDate(date)}`);
            const receta = await response.json();

            if (receta) {
                recetaSeleccionada.innerHTML = `
                    <img src="${receta.imagen_url}" alt="Imagen de la receta" />
                    <p></p>
                    <a href="/recetas/receta?id=${receta.id}">
                        <h4>${receta.nombre}</h4>
                    </a>
                    <p>Tiempo preparación: ${Math.floor(receta.tiempo_prep_segs / 60)} minutos</p>
                    <p>Dificultad: ${receta.dificultad}</p>
                `;
            } else {
                recetaSeleccionada.innerHTML = "<p>No hay receta disponible para esta fecha.</p>";
            }
        } catch (error) {
            console.error("Error al cargar la receta del día:", error);
        }
    }

    // Evento para retroceder un día
    prevDayBtn.addEventListener("click", () => {
        currentDate.setDate(currentDate.getDate() - 1); // Retrocede un día
        updateDateDisplay();
        loadRecetaDelDia(currentDate);
    });

    // Inicializar la vista
    updateDateDisplay();
    loadRecetaDelDia(currentDate);
});