import { Toast } from "../toasts/toasts.js";
document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendarWk');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth', // Vista semanal
        editable: true, // Permitir edición de eventos
        events: [], // Puedes cargar eventos desde la base de datos si es necesario
        dateClick: async function (info) {
            // Mostrar un selector de recetas al hacer clic en un día
            const fecha = info.dateStr;
        
            // Obtener recetas desde el servidor
            const response = await fetch('/recetas/recetaPorFecha');
            const recetas = await response.json();
            console.log('Recetas obtenidas:', recetas);
            console.log(info.dateStr);
            console.log('Día seleccionado:', fecha);

            const recipeSelector = document.createElement('select');
            recipeSelector.innerHTML = '<option value="">Selecciona una receta</option>';
            recetas.forEach(receta => {
                const option = document.createElement('option');
                option.value = receta.id; // Usa el ID de la receta
                option.textContent = receta.nombre; // Usa el nombre de la receta
                recipeSelector.appendChild(option);
            });

            const saveButton = document.createElement('button');
            saveButton.textContent = 'Guardar';
            saveButton.addEventListener('click', () => {
                const recetaId = recipeSelector.value;
                console.log('Id receta: ', recipeSelector.value);
                if (recetaId) {
                    fetch('/usuarios/calendario/aniadir', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ fecha, recetaId }),
                    })
                        .then(response => response.json())
                        .then(data => {
                            Toast.show(data.message, 'success', 3000);
                            calendar.addEvent({
                                title: recetas.find(r => r.id == recetaId).nombre, // Mostrar el nombre de la receta
                                start: fecha,
                            });
                        })
                        .catch(error => {
                            Toast.show(error, 'error', 3000);
                        });
                } else {
                    alert('Por favor selecciona una receta.');
                }
            });

            // Mostrar el selector y botón en el día seleccionado
            const content = document.createElement('div');
            content.appendChild(recipeSelector);
            content.appendChild(saveButton);

            const popup = document.createElement('div');
            popup.style.position = 'absolute';
            popup.style.background = '#fff';
            popup.style.border = '1px solid #ccc';
            popup.style.padding = '10px';
            popup.style.zIndex = '1000';
            popup.style.top = `${info.jsEvent.pageY}px`;
            popup.style.left = `${info.jsEvent.pageX}px`;
            popup.appendChild(content);

            document.body.appendChild(popup);

            // Cerrar el popup al hacer clic fuera
            document.addEventListener('click', function closePopup(event) {
                if (!popup.contains(event.target)) {
                    popup.remove();
                    document.removeEventListener('click', closePopup);
                }
            });
        },
    });

    calendar.render();
});