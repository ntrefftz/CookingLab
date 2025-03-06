import { body } from 'express-validator';
import { Receta } from './Recetas.js';
import { Ingrediente } from './Ingredientes.js';

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


export function viewIngredientesLista(req, res) {
    const rows = Ingrediente.getAllIngredientes();
    const contenido = 'paginas/ingrediente';
    res.render('pagina', {
        contenido,
        session: req.session,
        ingredientes: rows
    });
}

export function viewIngredientesDetalle(req, res) {
    const contenido = 'paginas/ingredienteInd';
    const id = req.query.id;
    const ingrediente = Ingrediente.getIngredienteById(id);
    res.render('pagina', {
        contenido,
        session: req.session,
        ingredientes: ingrediente
    });
}

export function viewModificarIngrediente(req, res) {
    const contenido = 'paginas/editarIng';
    const id = req.query.id;
    const ingrediente = Ingrediente.getIngredienteById(id);
    res.render('pagina', {
        contenido,
        session: req.session,
        ingredientes: ingrediente
    });
}

export function eliminarIngrediente(req, res) {
    const contenido = 'paginas/eliminadaIng';
    const id = req.query.id;
    Ingrediente.deleteIngrediente(id);
    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function modificarIngrediente(req, res) {
    body('nombre').escape();
    body('categoria').escape();
    body('precio').escape();
    body('stock').escape();

    const nombre = req.body.nombre.trim();
    const categoria = req.body.categoria.trim();
    const precio = req.body.precio.trim();
    const stock = req.body.stock.trim();
    const id = req.query.id;
    const contenido = 'paginas/ingredienteInd';
    Ingrediente.updateIngrediente(id, nombre, categoria, precio, stock);
    const ingrediente = Ingrediente.getIngredienteById(id);
    res.render('pagina', {
        contenido,
        session: req.session,
        ingredientes: ingrediente
    });
}