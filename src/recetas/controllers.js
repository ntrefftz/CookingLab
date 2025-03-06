import { body } from 'express-validator';
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
    const contenido = 'paginas/editarReceta';
    const id = req.query.id;
    const receta = Receta.getRecetaById(id);
    res.render('pagina', {
        contenido,
        session: req.session,
        recetas: receta
    });
}

export function eliminarReceta(req, res) {
    const contenido = 'paginas/eliminada';
    const id = req.query.id;
    Receta.deleteReceta(id);
    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function modificarReceta(req, res) {
    body('nombre').escape();
    body('descripcion').escape();
    body('difilcultad').escape();
    body('tiempo_prep_segs').escape();

    const nombre = req.body.nombre.trim();
    const descripcion = req.body.descripcion.trim();
    const dificultad = req.body.dificultad.trim();
    const tiempo_prep_segs = req.body.tiempo_prep_segs.trim();
    const id = req.query.id;
    const contenido = 'paginas/receta';
    Receta.updateReceta(id, nombre, descripcion, tiempo_prep_segs*60, dificultad, 1);
    const receta = Receta.getRecetaById(id);
    res.render('pagina', {
        contenido,
        session: req.session,
        recetas: receta
    });
}