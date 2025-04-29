import { Ingrediente } from '../recetas/Ingredientes.js';
import { Realiza } from './Realiza.js';
import { Pedido } from './Pedidos.js';
import { Contiene } from './Contiene.js';
import { Cesta } from './Cesta.js';

export function viewCesta(req, res) {
    let contenido = 'paginas/noPermisos';
    if (req.session != null && req.session.nombre != null) {
        contenido = 'paginas/cesta';
    }
    const id_usuario = req.session.userId;
    try {
        const cesta = Cesta.getById(id_usuario);

        if (cesta.length === 0) {
            // Si la cesta está vacía, renderiza con un precio total de 0
            return res.render('pagina', {
                contenido,
                session: req.session,
                ingredientes: [],
                precioTotal: "0.00" // Asegúrate de pasar precioTotal
            });
        }

        const ingredientes = cesta.map(item => {
            const ingrediente = Ingrediente.getIngredienteById(item.id_ingrediente);
            const precio = parseFloat(ingrediente.precio) || 0; // Asegúrate de que el precio sea válido
            return {
                id: ingrediente.id,
                nombre: ingrediente.nombre,
                precio: (precio * item.cantidad).toFixed(2),
                cantidad: item.cantidad
            };
        });

        const precioTotal = ingredientes.reduce((total, ing) => total + parseFloat(ing.precio), 0).toFixed(2);

        res.render('pagina', {
            contenido,
            session: req.session,
            ingredientes,
            precioTotal // Pasa precioTotal al renderizador
        });
    } catch (error) {
        console.error("Error al obtener la cesta:", error);
        res.render('pagina', {
            contenido,
            session: req.session,
            ingredientes: [],
            precioTotal: "0.00", // Asegúrate de pasar precioTotal en caso de error
            error: "No se pudo obtener la cesta"
        });
    }
}

export function aumentarIngredienteDeCesta(req, res) {
    try{
        const id_usuario = req.session.userId; // ID del usuario desde la sesión
        const id_ingrediente = req.body.id; // ID del ingrediente desde el cuerpo de la solicitud
        // Validar que el usuario haya iniciado sesión
        if (!id_usuario) {
            return res.status(401).send('Usuario no autenticado');
        }
        // Validar que el ID del ingrediente sea válido
        if (!id_ingrediente || isNaN(parseInt(id_ingrediente))) {
            return res.status(400).send('ID de ingrediente inválido');
        }
        // Obtener el ingrediente de la cesta
        const ingrediente = Cesta.getByUserAndIngredient(id_usuario, id_ingrediente);

        Cesta.updateCesta(id_usuario, id_ingrediente, ingrediente.cantidad + 1);
        res.status(200).send({ mensaje: 'Ingrediente aumentado correctamente' });
    }
    catch (error) {
        console.error('Error al aumentar el ingrediente de la cesta:', error);
        res.status(500).send('Error al aumentar el ingrediente de la cesta');
    }
}

export function eliminarIngredienteDeCesta(req, res) {
    try {
        const id_usuario = req.session.userId; // ID del usuario desde la sesión
        const id_ingrediente = req.body.id; // ID del ingrediente desde el cuerpo de la solicitud

        // Validar que el usuario haya iniciado sesión
        if (!id_usuario) {
            return res.status(401).send('Usuario no autenticado');
        }

        // Validar que el ID del ingrediente sea válido
        if (!id_ingrediente || isNaN(parseInt(id_ingrediente))) {
            return res.status(400).send('ID de ingrediente inválido');
        }

        // Eliminar el ingrediente de la cesta
        const ingrediente = Cesta.getByUserAndIngredient(id_usuario, id_ingrediente);
        if(ingrediente.cantidad <= 1){
            Cesta.deleteCesta(id_usuario, id_ingrediente);
        }
        else{
            Cesta.updateCesta(id_usuario, id_ingrediente, ingrediente.cantidad - 1);
        }

        res.status(200).send({ mensaje: 'Ingrediente eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el ingrediente de la cesta:', error);
        res.status(500).send('Error al eliminar el ingrediente de la cesta');
    }
}

export function viewCompraReceta(req, res) {
    let contenido = 'paginas/noPermisos';
    if (req.session != null && req.session.nombre != null) {
        contenido = 'paginas/compraReceta';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
}
