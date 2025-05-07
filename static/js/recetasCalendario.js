document.addEventListener('DOMContentLoaded', async () => {
    const calendar = document.getElementById('calendarWk');
    const recetaInfo = document.getElementById('recetaInfo');
    const recetaNombre = document.getElementById('recetaNombre');
    const recetaImagen = document.getElementById('recetaImagen');
    const editarReceta = document.getElementById('editarReceta');
    const agregarReceta = document.getElementById('agregarReceta');

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    // Obtener recetas del mes
    const recetas = await fetch('/recetas/mes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fecha: `${year}-${String(month).padStart(2, '0')}-01` }),
    }).then(res => res.json());

    // Renderizar calendario (simplificado)
    for (let day = 1; day <= 31; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.textContent = day;
        dayDiv.classList.add('day');
        dayDiv.dataset.day = day;

        const receta = recetas.find(r => new Date(r.fecha).getDate() === day);
        if (receta) {
            dayDiv.classList.add('has-receta');
        }

        dayDiv.addEventListener('click', () => {
            if (receta) {
                recetaNombre.textContent = receta.nombre;
                recetaImagen.src = receta.imagen;
                editarReceta.style.display = 'block';
                agregarReceta.style.display = 'none';
            } else {
                recetaNombre.textContent = 'Sin receta';
                recetaImagen.src = '';
                editarReceta.style.display = 'none';
                agregarReceta.style.display = 'block';
            }
            recetaInfo.style.display = 'block';
        });

        calendar.appendChild(dayDiv);
    }
});