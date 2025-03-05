import { Receta } from './Recetas.js';
export function viewRecetasLista(req, res) {
    const rows = Receta.getAllRecetas();
    const contenido = 'paginas/catalogo';
    res.render('pagina', {
        contenido,
        session: req.session,
        recetas: rows
    });
}

export function viewRecetasDetalle(req, res) {
    // TODO
    const contenido = 'paginas/recetasDetalle';
    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function viewModificarRecetas(req, res) {
    // TODO
    const contenido = 'paginas/modificarRecetas';
    res.render('pagina', {
        contenido,
        session: req.session
    });
}