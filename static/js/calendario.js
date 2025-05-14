document.addEventListener("DOMContentLoaded", () => {
    const prevDayBtn = document.getElementById("prev-day-btn");
    const todayBtn = document.getElementById("today-btn");
    const nextDayBtn = document.getElementById("next-day-btn");
    const currentDateSpan = document.getElementById("current-date");
    const recetaSeleccionada = document.getElementById("receta-seleccionada");

    let currentDate = new Date();
    const today = new Date();

    function formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function updateDateDisplay() {
        const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
        currentDateSpan.textContent = currentDate.toLocaleDateString("es-ES", options);
    }

    async function loadRecetaDelDia(date) {
        try {
            let receta;
            console.log("Cargando receta del día para la fecha:", formatDate(date));
            const response = await fetch('/recetas/recetaPorFecha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fecha: formatDate(date) }),
            });

            const recetaID = await response.json();
            console.log("Receta ID:", recetaID);

            if (!isNaN(recetaID.id_receta)) {
                receta = null;
                const recetaResponse = await fetch(`/recetas/getReceta/${recetaID.id_receta}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                receta = await recetaResponse.json();
                console.log("Receta del día:", receta);

                if (!isNaN(receta.id)) {
                    recetaSeleccionada.innerHTML = `
                    <img src="/recetas/imagen/${receta.imagen_url}" alt="Imagen de la receta" />
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
            }else {
                recetaSeleccionada.innerHTML = "<p>No hay receta disponible para esta fecha.</p>";
            }
        } catch (error) {
            console.error("Error al cargar la receta del día:", error);
        }
    }

    prevDayBtn.addEventListener("click", () => {
        currentDate.setDate(currentDate.getDate() - 1);
        updateDateDisplay();
        loadRecetaDelDia(currentDate);
    });

    todayBtn.addEventListener("click", () => {
        currentDate = new Date(today);
        updateDateDisplay();
        loadRecetaDelDia(currentDate);
    });

    nextDayBtn.addEventListener("click", () => {
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + 1);
        if (nextDate <= today) {
            currentDate = nextDate;
            updateDateDisplay();
            loadRecetaDelDia(currentDate);
        }
    });

    updateDateDisplay();
    loadRecetaDelDia(currentDate);
});