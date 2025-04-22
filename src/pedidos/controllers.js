import { Ingrediente } from '../recetas/Ingredientes.js';
import { Receta } from '../recetas/Recetas.js'; // Ruta relativa correcta
import { logger } from '../logger.js';

export function viewCesta(req, res) {
    let contenido = 'paginas/noPermisos';
    if (req.session != null && req.session.nombre != null) {
        contenido = 'paginas/cesta';
    }
    res.render('pagina', {
        contenido,
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
