import { Toast } from "../toasts/toasts.js";

export async function cambiarPermisos(selectElement) {
    const userId = selectElement.getAttribute('data-id');
    const nuevoRol = selectElement.value;

    try {
        console.log("Cambiando permisos para el usuario con ID:", userId, "a rol:", nuevoRol);
        const response = await fetch(`/usuarios/cambiarPermisos/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rol: nuevoRol }),
        });

        if (!response.ok) {
            throw new Error('Error al cambiar los permisos');
        }

        const resultado = await response.json();
        Toast.show(resultado.mensaje, 'success', 3000);
    } catch (error) {
        console.error(error);
        alert('Hubo un problema al actualizar los permisos.');
    }
} 
window.cambiarPermisos = cambiarPermisos;