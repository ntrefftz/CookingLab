export async function actualizarStock(input) {
        const id = input.dataset.id;
        const nuevoStock = input.value;

        try {
            console.log(`Actualizando stock para ID: ${id}, Nuevo stock: ${nuevoStock}`);
            const respuesta = await fetch('/recetas/ingrediente/actualizarStock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, stock: nuevoStock })
            });

            if (!respuesta.ok) {
                throw new Error('Error al actualizar el stock');
            }

            const resultado = await respuesta.json();
            alert('Stock actualizado correctamente');
        } catch (error) {
            console.error(error);
            alert('Hubo un problema al actualizar el stock');
        }
    }

    window.actualizarStock = actualizarStock;