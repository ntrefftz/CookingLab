import { Ingrediente } from '../recetas/Ingredientes.js';
import { Realiza } from './Realiza.js';
import { Pedido } from './Pedidos.js';
import { Contiene } from './Contiene.js';
import { Cesta } from './Cesta.js';

export function viewCesta(req, res) {
    let contenido = 'paginas/cesta';
    const id_usuario = req.session.userId;
    try {
        const cesta = Cesta.getById(id_usuario);

        if (cesta.length === 0) {
            return res.render('pagina', {
                contenido,
                session: req.session,
                ingredientes: [],
                precioTotal: "0.00"
            });
        }

        const ingredientes = cesta.map(item => {
            const ingrediente = Ingrediente.getIngredienteById(item.id_ingrediente);
            const precio = parseFloat(ingrediente.precio) || 0;
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
            precioTotal
        });
    } catch (error) {
        console.error("Error al obtener la cesta:", error);
        res.render('pagina', {
            contenido,
            session: req.session,
            ingredientes: [],
            precioTotal: "0.00",
            error: "No se pudo obtener la cesta"
        });
    }
}

export function aumentarIngredienteDeCesta(req, res) {
    try {
        const id_usuario = req.session.userId;
        const id_ingrediente = req.body.id;

        if (!id_usuario) {
            return res.status(401).send('Usuario no autenticado');
        }

        if (!id_ingrediente || isNaN(parseInt(id_ingrediente))) {
            return res.status(400).send('ID de ingrediente inválido');
        }

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
        const id_usuario = req.session.userId;
        const id_ingrediente = req.body.id;

        if (!id_usuario) {
            return res.status(401).send('Usuario no autenticado');
        }

        if (!id_ingrediente || isNaN(parseInt(id_ingrediente))) {
            return res.status(400).send('ID de ingrediente inválido');
        }

        const ingrediente = Cesta.getByUserAndIngredient(id_usuario, id_ingrediente);
        if (ingrediente.cantidad <= 1) {
            Cesta.deleteCesta(id_usuario, id_ingrediente);
        }
        else {
            Cesta.updateCesta(id_usuario, id_ingrediente, ingrediente.cantidad - 1);
        }

        res.status(200).send({ mensaje: 'Ingrediente eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el ingrediente de la cesta:', error);
        res.status(500).send('Error al eliminar el ingrediente de la cesta');
    }
}

export function viewCompraReceta(req, res) {
    res.render('pagina', {
        contenido: 'paginas/compraReceta',
        session: req.session
    });
}

export function tramitarPedido(req, res) {
    try {
        const id_usuario = req.session.userId;

        const cesta = Cesta.getById(id_usuario);
        if (cesta.length === 0) {
            return res.status(400).json({ error: 'La cesta está vacía' });
        }
        const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        // Procesar los ingredientes
        const ingredientes = cesta.map(item => {
            const ingrediente = Ingrediente.getIngredienteById(item.id_ingrediente);
            const precio = parseFloat(ingrediente.precio) || 0;
            return {
                id: ingrediente.id,
                nombre: ingrediente.nombre,
                precio: (precio * item.cantidad).toFixed(2),
                cantidad: item.cantidad
            };
        });

        const precioTotal = ingredientes.reduce((total, ing) => total + parseFloat(ing.precio), 0).toFixed(2);

        // Crear el pedido
        const pedido = Pedido.addPedido(fecha, hora, precioTotal, 0, 0);
        ingredientes.forEach(ingrediente => {
            Contiene.addRelacion(ingrediente.id, pedido.id, ingrediente.cantidad);
        });

        Cesta.clearCesta(id_usuario);
        Realiza.addRelacion(id_usuario, pedido.id);

        // Responder con JSON
        res.status(200).json({ mensaje: 'Pedido tramitado correctamente', pedidoId: pedido.id });
    } catch (error) {
        console.error('Error al tramitar el pedido:', error);
        res.status(500).json({ error: 'Error al tramitar el pedido' });
    }
}

export function viewConfirmarPedido(req, res) {
    let contenido = 'paginas/confirmarPedido';

    try {
        const id_pedido = req.query.id;
        const pedido = Pedido.getPedidoById(id_pedido);
        const ingredientes = Contiene.getByPedido(id_pedido);
        ingredientes.forEach(ing => {
            const ingredienteInfo = Ingrediente.getIngredienteById(ing.id_ingrediente);
            if (ingredienteInfo) {
                ing.nombre = ingredienteInfo.nombre;
                ing.precio = (parseFloat(ingredienteInfo.precio) * ing.cantidad).toFixed(2);
            } else {
                logger.error(`Ingrediente no encontrado para id: ${ing.id_ingrediente}`);
            }
        });
        const precioTotal = ingredientes.reduce((total, ing) => total + parseFloat(ing.precio), 0).toFixed(2);

        res.render('pagina', {
            contenido,
            session: req.session,
            pedido,
            ingredientes,
            precioTotal
        });
    }
    catch (error) {
        console.error('Error al confirmar el pedido:', error);
        res.status(500).send('Error al confirmar el pedido');
    }

}

export function comprarPedido(req, res) {
    try {
        const id_pedido = req.body.id;
        Pedido.updatePedido(id_pedido, 0, 1);
        const ingredientes = Contiene.getByPedido(id_pedido);
        ingredientes.forEach(ingrediente => {
            const id_ingrediente = ingrediente.id_ingrediente;
            const cantidad = ingrediente.cantidad;
            Ingrediente.reducirStock(id_ingrediente, cantidad);
        });
        res.redirect('/');
    }
    catch (error) {
        Contiene.deletePedido(req.body.id);
        Realiza.deletePedido(req.body.id);
        Pedido.deletePedido(req.body.id);
        console.error('Error al comprar el pedido:', error);
        res.render('pagina', {
            contenido: 'paginas/errorStock',
            session: req.session,
            error: 'Error al comprar el pedido'
        });
    }
}

export function cancelarPedido(req, res) {
    try {
        const id_pedido = req.body.id;
        Contiene.deletePedido(id_pedido);
        Realiza.deletePedido(id_pedido);
        Pedido.deletePedido(id_pedido);
        res.redirect('/pedidos/cesta');
    }
    catch (error) {
        console.error('Error al cancelar el pedido:', error);
        res.status(500).send('Error al cancelar el pedido');
    }
}