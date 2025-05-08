import { Toast } from "../toasts/toasts.js";

document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendarWk');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth', // Vista mensual
        editable: true, // Permitir edición de eventos
        events: async function (fetchInfo, successCallback, failureCallback) {
            try {
                // Cargar los eventos desde el backend
                const response = await fetch('/recetas/obtenerRecetasCalendario', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const recetas = await response.json();

                if (!Array.isArray(recetas)) {
                    throw new Error('La respuesta no es un array válido.');
                }

                // Pasar los eventos al calendario
                successCallback(recetas);
            } catch (error) {
                console.error('Error al cargar los eventos:', error);
                failureCallback(error);
            }
        },
        dateClick: async function (info) {
            // Lógica para manejar el clic en una fecha
            const fecha = info.dateStr;

            try {
                // Obtener las recetas disponibles para la fecha seleccionada
                const response = await fetch('/recetas/recetaPorFecha', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ fecha: fecha }),
                });
                const recetas = await response.json();
                console.log('Recetas obtenidas:', recetas);

                // Crear un selector de recetas
                const recipeSelector = document.createElement('select');
                recipeSelector.innerHTML = '<option value="">Selecciona una receta</option>';
                recetas.forEach(receta => {
                    const option = document.createElement('option');
                    option.value = receta.id; // Usa el ID de la receta
                    option.textContent = receta.nombre; // Usa el nombre de la receta
                    recipeSelector.appendChild(option);
                });

                // Crear un botón para guardar la receta seleccionada
                const saveButton = document.createElement('button');
                saveButton.textContent = 'Guardar';
                saveButton.addEventListener('click', async () => {
                    const recetaId = recipeSelector.value;
                    if (recetaId) {
                        try {
                            const saveResponse = await fetch('/recetas/aniadirRecetaDiaria', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ fecha, recetaId }),
                            });
                            const saveData = await saveResponse.json();

                            Toast.show(saveData.message, 'success', 3000);

                            // Añadir el evento al calendario
                            calendar.addEvent({
                                title: recetas.find(r => r.id == recetaId).nombre,
                                start: fecha,
                            });
                        } catch (error) {
                            Toast.show('Error al guardar la receta.', 'error', 3000);
                        }
                    } else {
                        alert('Por favor selecciona una receta.');
                    }
                });

                // Mostrar el selector y el botón en un popup
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
            } catch (error) {
                console.error('Error al manejar el clic en la fecha:', error);
            }
        },
    });

    calendar.render();
});