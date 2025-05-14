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
            const fecha = info.dateStr;

            // Verificar si ya hay una receta en el calendario para la fecha seleccionada
            const existingEvent = calendar.getEvents().find(event => event.startStr === fecha);

            if (existingEvent) {
                // Mostrar información de la receta existente
                const content = document.createElement('div');
                const recipeInfo = document.createElement('p');
                recipeInfo.textContent = `Receta actual: ${existingEvent.title}`;
                content.appendChild(recipeInfo);

                // Botón para cambiar la receta
                const changeButton = document.createElement('button');
                changeButton.textContent = 'Cambiar receta';
                changeButton.addEventListener('click', async (event) => {
                    event.stopPropagation(); // Detener la propagación del evento para evitar que cierre el popup
                    console.log('Botón "Cambiar receta" clickeado');
                    content.innerHTML = ''; // Limpiar el contenido del popup

                    // Crear un selector de recetas
                    const recipeSelector = document.createElement('select');
                    recipeSelector.innerHTML = '<option value="">Selecciona una receta</option>';
                    console.log('Selector de recetas creado');

                    try {
                        const response = await fetch('/recetas/obtenerRecetas', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ fecha: fecha }),
                        });

                        console.log('Respuesta del fetch obtenida:', response);

                        const recetas = await response.json();
                        recetas.forEach(receta => {
                            const option = document.createElement('option');
                            option.value = receta.id;
                            option.textContent = receta.nombre;
                            recipeSelector.appendChild(option);
                        });

                        console.log('Opciones añadidas al selector:', recipeSelector);

                        // Botón para guardar la nueva receta
                        const saveButton = document.createElement('button');
                        saveButton.textContent = 'Guardar';
                        saveButton.addEventListener('click', async () => {
                            console.log('Botón "Guardar" clickeado');
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

                                    console.log('Receta guardada:', saveData);

                                    Toast.show(saveData.message, 'success', 3000);

                                    // Actualizar el evento en el calendario
                                    existingEvent.remove();
                                    calendar.addEvent({
                                        title: recetas.find(r => r.id == recetaId).nombre,
                                        start: fecha,
                                    });

                                    popup.remove();
                                } catch (error) {
                                    console.error('Error al guardar la receta:', error);
                                    Toast.show('Error al guardar la receta.', 'error', 3000);
                                }
                            } else {
                                alert('Por favor selecciona una receta.');
                            }
                        });

                        // Agregar el selector y el botón al contenido del popup
                        content.appendChild(recipeSelector);
                        content.appendChild(saveButton);
                        console.log('Selector y botón añadidos al popup');
                    } catch (error) {
                        console.error('Error al obtener las recetas:', error);
                    }
                });

                // Agregar el botón al contenido del popup
                content.appendChild(changeButton);

                // Mostrar el popup
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
            } else {
                // Lógica existente para mostrar el selector de recetas
                try {
                    const response = await fetch('/recetas/obtenerRecetas', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ fecha: fecha }),
                    });

                    const recetas = await response.json();

                    const recipeSelector = document.createElement('select');
                    recipeSelector.innerHTML = '<option value="">Selecciona una receta</option>';
                    recetas.forEach(receta => {
                        const option = document.createElement('option');
                        option.value = receta.id;
                        option.textContent = receta.nombre;
                        recipeSelector.appendChild(option);
                    });

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

                                calendar.addEvent({
                                    title: recetas.find(r => r.id == recetaId).nombre,
                                    start: fecha,
                                });

                                popup.remove();
                            } catch (error) {
                                Toast.show('Error al guardar la receta.', 'error', 3000);
                            }
                        } else {
                            alert('Por favor selecciona una receta.');
                        }
                    });

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

                    document.addEventListener('click', function closePopup(event) {
                        if (!popup.contains(event.target)) {
                            popup.remove();
                            document.removeEventListener('click', closePopup);
                        }
                    });
                } catch (error) {
                    console.error('Error al manejar el clic en la fecha:', error);
                }
            }
        },
    });

    calendar.render();
});