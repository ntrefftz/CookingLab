import { Toast } from "../toasts/toasts.js";

document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendarWk');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridWeek', // Vista semanal
        editable: true, // Permitir edición de eventos
        events: [], // Puedes cargar eventos desde la base de datos si es necesario
        dateClick: async function (info) {
            const fecha = info.dateStr;

            // Verificar si hay una receta asociada con la fecha
            const response = await fetch(`/usuarios/calendario/consultarReceta?fecha=${fecha}`);
            const data = await response.json();

            const popup = document.createElement('div');
            popup.style.position = 'absolute';
            popup.style.background = '#fff';
            popup.style.border = '1px solid #ccc';
            popup.style.padding = '10px';
            popup.style.zIndex = '1000';
            popup.style.top = `${info.jsEvent.pageY}px`;
            popup.style.left = `${info.jsEvent.pageX}px`;

            if (data.receta) {
                // Mostrar información de la receta
                const recetaInfo = document.createElement('div');
                recetaInfo.innerHTML = `
                    <h3>${data.receta.nombre}</h3>
                    <p>${data.receta.descripcion}</p>
                `;
                popup.appendChild(recetaInfo);
            } else {
                // Mostrar botón para añadir receta
                const form = document.createElement('form');
                form.action = '/recetas/catalogo';
                form.method = 'GET';

                const origenInput = document.createElement('input');
                origenInput.type = 'hidden';
                origenInput.name = 'origen';
                origenInput.value = 'calendario';

                const fechaInput = document.createElement('input');
                fechaInput.type = 'hidden';
                fechaInput.name = 'fecha';
                fechaInput.value = fecha;

                const addButton = document.createElement('button');
                addButton.textContent = 'Añadir Receta';

                form.appendChild(origenInput);
                form.appendChild(fechaInput);
                form.appendChild(addButton);
                popup.appendChild(form);
            }

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
