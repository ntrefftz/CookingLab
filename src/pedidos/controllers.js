import { Ingrediente } from '../recetas/Ingredientes.js';
import { Realiza } from './Realiza.js';
import { Pedido } from './Pedidos.js';
import { Contiene } from './Contiene.js';

export function viewCesta(req, res) {
    let contenido = 'paginas/noPermisos';
    let total = 0;
    let ingredientes = [];
    let pedido = null;

    if (req.session != null && req.session.nombre != null) {
        contenido = 'paginas/cesta';
        try{
            pedido = Realiza.getByUsuario(req.session.id);
        }catch (e) {
            if(e.name === 'RelacionNoEncontrada'){
                const nPedido = Pedido.addPedido(0, 0, 0);
                Realiza.addRelacion(req.session.userId, nPedido.id);
                pedido  = { id : nPedido.id };
            }
        }
        ingredientes = Contiene.getByPedido(pedido.id);
        ingredientes.forEach(ingrediente => {
            total += Ingrediente.getById(ingrediente.id_ingrediente).precio;
        });
        Pedido.updatePedido(pedido.id, total, 0, 0);
    }
    res.render('pagina', {
        contenido,
        precio : total,
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
