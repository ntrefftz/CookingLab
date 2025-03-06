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
    const contenido = 'paginas/receta';
    const id = req.query.id;
    const receta = Receta.getRecetaById(id);
    res.render('pagina', {
        contenido,
        session: req.session,
        recetas: receta
    });
}

export function viewModificarReceta(req, res) {
    // TODO
    const contenido = 'paginas/modificarReceta';
    res.render('pagina', {
        contenido,
        session: req.session
    });
}

/*

export function administrarRecetas(req, res) {
    // TODO
    const contenido = 'paginas/administrarRecetas';
    //if cocinero

    //else if admin

    res.render('pagina', {
        contenido,
        session: req.session
    });
}*/