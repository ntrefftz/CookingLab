document.addEventListener('DOMContentLoaded', () => {
    const btnAnadirCesta = document.getElementById('btn-anadir-cesta');
    if (!btnAnadirCesta) {
        console.error('Botón "Añadir todas las recetas a la cesta" no encontrado.');
        return;
    }

    // Obtener las recetas de la semana desde el atributo data
    const recetasSemana = JSON.parse(btnAnadirCesta.dataset.recetas || '[]');
    console.log('Recetas de la semana:', recetasSemana);

    btnAnadirCesta.addEventListener('click', async () => {
        if (recetasSemana.length === 0) {
            alert('No hay recetas para añadir a la cesta.');
            return;
        }

        for (const receta of recetasSemana) {
            console.log(`Añadiendo receta con ID: ${receta.id}`);
            try {
                const response = await fetch('/recetas/receta/aniadirCarritoReceta', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: receta.id_receta })
                });

                if (response.ok) {
                    console.log(`Receta ${receta.id} añadida correctamente.`);
                } else {
                    console.error(`Error al añadir la receta ${receta.id}:`, await response.text());
                }
            } catch (error) {
                console.error(`Error al procesar la receta ${receta.id}:`, error);
            }
        }

        alert('Todas las recetas han sido añadidas a la cesta.');
    });
});