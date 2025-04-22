import { Ingrediente } from '../recetas/Ingredientes.js';
import { Receta } from '../recetas/Recetas.js'; // Ruta relativa correcta
import { logger } from '../logger.js';
import { Realiza } from './Realiza.js';
import { Pedido } from './Pedidos.js';
import { Contiene } from './Contiene.js';

export function viewCesta(req, res) {
    let contenido = 'paginas/noPermisos';
    if (req.session != null && req.session.nombre != null) {
        contenido = 'paginas/cesta';
        const pedido = null;
        try{
            pedido = Realiza.getByUsuario(req.session.id);
        }catch (e) {
            if(e.name === 'RelacionNoEncontrada'){
                pedido = Pedido.addPedido(0, 0, 0);
                Realiza.addRelacion(req.session.id, pedido.id, 0);
            }
        }
        const ingredientes = Contiene.getByPedido(pedido.id);
        const precio = 0;
        ingredientes.forEach(ingrediente => {
            precio += Ingrediente.getById(ingrediente.id_ingrediente).precio;
        });
        Pedido.updatePedido(pedido.id, precio, 0, 0);
    }
    res.render('pagina', {
        contenido,
        precio,
        ingredientes,
        session: req.session
    });
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
