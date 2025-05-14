import { Ingrediente } from '../recetas/Ingredientes.js';
import { Receta } from '../recetas/Recetas.js'; 
import { logger } from '../logger.js';


export function viewIndex(req, res) {
    try {
        const todasRecetas = Receta.getAllRecetas();
        const todosIngredientes = Ingrediente.getAllIngredientes();
        
        const hayRecetas = todasRecetas.length > 0;
        const ultimasRecetas = hayRecetas 
            ? todasRecetas.slice(-5).reverse() 
            : [];
        
        const hayIngredientes = todosIngredientes.length > 0;
        const ultimosIngredientes = hayIngredientes 
            ? todosIngredientes.slice(-5).reverse()
         : [];

        let recetaDelDia = req.session.recetaDelDia;
        const hoy = new Date();
        const ultimaActualizacion = new Date(req.session.recetaDelDiaFecha || 0);
        
        if (!recetaDelDia || (hoy - ultimaActualizacion) > 24*60*60*1000) {
            recetaDelDia = todasRecetas[Math.floor(Math.random() * todasRecetas.length)];
            req.session.recetaDelDia = recetaDelDia; 
            req.session.recetaDelDiaFecha = hoy;
        }
        
        res.render('pagina', {
            contenido: 'paginas/index',
            session: req.session,
            ultimasRecetas,
            recetaDelDia,
            ultimosIngredientes
        });
        
    } catch (error) {
        logger.error('Error en viewIndex:', error);
        
        res.status(500).render('pagina', {
            contenido: 'paginas/error',
            session: req.session,
            mensajeError: 'Error al cargar los datos.'
        });
    }
}

export function viewContacto(req, res) {
    let contenido = 'paginas/contacto';

    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function viewCondiciones(req, res) {
    let contenido = 'paginas/condiciones';

    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function viewConocenos(req, res) {
    let contenido = 'paginas/conocenos';

    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function viewCesta(req, res) {
    let contenido = 'paginas/cesta';
    const listaCompra = generarlistaCompra(req);

    res.render('pagina', {
        contenido,
        listaCompra,
        session: req.session
    });
}

export function viewCompraReceta(req, res) {
    res.render('pagina', {
        contenido: 'paginas/compraReceta',
        session: req.session
    });
}

