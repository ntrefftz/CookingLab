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
    const id_usuario = req.session.id_usuario;
    try {
        const cesta = Cesta.getById(id_usuario);

        if (!cesta || cesta.length === 0) {
            // Si la cesta está vacía, renderiza con un precio total de 0
            return res.render('pagina', {
                contenido,
                session: req.session,
                ingredientes: [],
                precioTotal: "0.00" // Asegúrate de pasar precioTotal
            });
        }

        const ingredientes = cesta.map(item => {
            const ingrediente = Ingrediente.getById(item.id_ingrediente);
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
