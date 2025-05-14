import { body } from 'express-validator';
import { Receta } from './Recetas.js';
import { Ingrediente } from './Ingredientes.js';
import { Tiene } from './Tiene.js';
import { logger } from '../logger.js';
import { Cesta } from '../pedidos/Cesta.js';
import { Diaria } from './Diaria.js';
import { join } from 'node:path';
import { config } from '../config.js';
import { CalendarioSemanal } from '../usuarios/CalendarioSemanal.js';
import { Guardado } from '../usuarios/Guardado.js';

export function viewRecetasLista(req, res) {

    const esDesdeCalendario = req.query.origen === 'calendario';  
    const esDesdeMisRecetas = req.query.origen === 'misRecetas';

    const fecha = req.query.fecha || null; 


    const rows = Receta.getAllRecetas();
    const contenido = 'paginas/catalogo';
    res.render('pagina', {
        contenido,
        session: req.session,
        recetas: rows,
        fecha, 
        esDesdeCalendario,  
        esDesdeMisRecetas 
    });
}

export function viewGestionStock(req, res) {
    const rows = Ingrediente.getAllIngredientes();
    const contenido = 'paginas/gestionStock';
    res.render('pagina', {
        contenido,
        session: req.session,
        ingredientes: rows,
    });
}

export function viewRecetasDetalle(req, res) {
    
    const contenido = 'paginas/receta';
    const id = req.query.id;
    const receta = Receta.getRecetaById(id);
    const esDeSugerencias = req.query.origen === 'sugerencias'; 


    const ingredientes = Tiene.getIngredientesByReceta(id);

    ingredientes.forEach(ingrediente => {
        const ingredienteDetails = Ingrediente.getIngredienteById(ingrediente.id_ingrediente);
        ingrediente.nombre = ingredienteDetails.nombre;
        ingrediente.unidad_medida = ingredienteDetails.unidad_medida; 
    });

    receta.ingredientes = ingredientes;

    res.render('pagina', {
        contenido,
        session: req.session,
        recetas: receta,
        esDeSugerencias
    });
}

export function eliminarReceta(req, res) {
    const id = req.body.id;
    
    try {
        const ingredientes = Tiene.getIngredientesByReceta(id);

        ingredientes.forEach(ing => {
            Tiene.removeIngredienteFromReceta(id, ing.id_ingrediente);
        });

        CalendarioSemanal.eliminarRecetas(id);
        Diaria.eliminarReceta(id);
        Guardado.removeRecetas(id);
        Receta.deleteReceta(id);

        res.redirect('/recetas/catalogo');
    } catch (error) {
        logger.error("Error al eliminar la receta:", error);
        res.status(500).send("Error al eliminar la receta.");
    }
}

export function viewModificarReceta(req, res) {
    const contenido = 'paginas/editarReceta';
    const id = req.query.id;
    const receta = Receta.getRecetaById(id);
    const ingredientes = Tiene.getIngredientesByReceta(id);

    const listaIngredientes = Ingrediente.getAllIngredientes();

    // Asociar los ingredientes a la receta
    ingredientes.forEach(ingrediente => {
        const ingredienteDetails = Ingrediente.getIngredienteById(ingrediente.id_ingrediente);
        ingrediente.nombre = ingredienteDetails.nombre;
    });

    receta.ingredientes = ingredientes;

    res.render('pagina', {
        contenido,
        session: req.session,
        recetas: receta,
        listaIngredientes
    });
}

export function modificarReceta(req, res) {
    const imagen = req.file ? req.file.filename : "";
    let imagen_url = null;

    body('nombre').escape();
    body('descripcion').escape();
    body('difilcultad').escape();
    body('tiempo_prep_segs').escape();
    // XXX Usar matchedData
    const nombre = req.body.nombre.trim();
    const descripcion = req.body.descripcion.trim();
    const dificultad = req.body.dificultad.trim();
    const tiempo_prep_segs = req.body.tiempo_prep_segs.trim();
    const id = req.query.id;

    if (!imagen) {
        let receta = Receta.getRecetaById(id);
        imagen_url = receta.imagen_url;
    }
    else
        imagen_url = imagen;


    Receta.updateReceta(id, nombre, descripcion, tiempo_prep_segs * 60, dificultad, 1, imagen_url);

    const receta = Receta.getRecetaById(id);
    const ingredientes = Tiene.getIngredientesByReceta(id);

    if (!receta) {
        return res.status(404).send('Receta no encontrada');
    }

    if (!Array.isArray(ingredientes)) {
        return res.status(500).send('Los ingredientes no son un Array');
    }

    // nos aseguramos de que cada ingrediente tenga un nombre
    ingredientes.forEach(ingrediente => {
        const ingredienteDetails = Ingrediente.getIngredienteById(ingrediente.id_ingrediente);
        if (ingredienteDetails && ingredienteDetails.nombre) {
            ingrediente.nombre = ingredienteDetails.nombre;
        } else {
            ingrediente.nombre = 'Desconocido'; // Si no se encuentra el ingrediente
        }
    });
    // Asignamos los ingredientes modificados a la receta
    receta.ingredientes = ingredientes;

    const ingredientesSeleccionados = req.body['ingredientesSeleccionados'] || []; 

    const ingredientesArray = Array.isArray(ingredientesSeleccionados)
        ? ingredientesSeleccionados
        : ingredientesSeleccionados ? [ingredientesSeleccionados] : [];

    const cantidadesArray = req.body.cantidades || [];
    const cantidadesEspArray = req.body.cantidad_especifica || [];

    const cantidades = {};
    const cantidadesEsp = {};

    // Creamos punteros separados para recorrer los arrays de cantidades
    let cantIndex = 0;
    let cantEspIndex = 0;

    ingredientesArray.forEach((id) => {
        // Saltar hasta encontrar un valor válido en cantidades
        let cantidad;
        while (cantIndex < cantidadesArray.length) {
            cantidad = parseFloat(cantidadesArray[cantIndex]);
            cantIndex++;
            if (!isNaN(cantidad)) break;
        }
        cantidades[id] = !isNaN(cantidad) ? cantidad : 1;

        // Lo mismo para cantidad específica
        let cantidadEsp;
        while (cantEspIndex < cantidadesEspArray.length) {
            cantidadEsp = parseFloat(cantidadesEspArray[cantEspIndex]);
            cantEspIndex++;
            if (!isNaN(cantidadEsp)) break;
        }
        cantidadesEsp[id] = !isNaN(cantidadEsp) ? cantidadEsp : 1;
    });

    // Añadir cada ingrediente con su cantidad
    for (const ingredienteId of ingredientesArray) {
        if (ingredienteId) {
            const cantidad = cantidades[ingredienteId] || 1;
            const cantidad_esp = cantidadesEsp[ingredienteId] || 1;
            Tiene.addIngredienteToReceta(id, ingredienteId, cantidad, cantidad_esp);
        }
    }

    const ingredientesAEliminar = req.body['ingredientesAEliminar'] || [];

    // Verificamos si eliminar esos ingredientes dejaría la receta vacía
    if (ingredientes.length - ingredientesAEliminar.length < 1) {
        return res.status(400).send('No puedes eliminar todos los ingredientes. La receta debe tener al menos uno.');
    }

    const ingredientesEliminarArray = Array.isArray(ingredientesAEliminar)
        ? ingredientesAEliminar
        : ingredientesAEliminar ? [ingredientesAEliminar] : [];

    // Eliminar cada ingrediente
    for (const ingredienteId of ingredientesEliminarArray) {
        if (ingredienteId) {
            const cantidad = cantidades[ingredienteId] || 1;
            Tiene.removeIngredienteFromReceta(id, ingredienteId, cantidad);
        }
    }

    res.redirect('/recetas/receta?id=' + id);
}

export function viewAniadirReceta(req, res) {
    const contenido = 'paginas/aniadirReceta';
    const ingredientes = Ingrediente.getAllIngredientes(); 

    res.render('pagina', {
        contenido,
        session: req.session,
        ingredientes,
        error: null
    });

}

export function aniadirReceta(req, res) {
    // XXX Faltan validaciones con express-validator + lógica apropiada para verificar la existencia y/o tipos de los parámetros
    logger.debug("Sesión actual:", req.session);
    const imagen = req.file ? req.file.filename : "";
    let imagen_url = null;

    body('nombre').escape();
    body('descripcion').escape();
    body('dificultad').escape();
    body('tiempo_prep_segs').escape();

    const nombre = req.body.nombre.trim();
    const descripcion = req.body.descripcion.trim();
    const dificultad = req.body.dificultad.trim();
    const tiempo_prep_segs = req.body.tiempo_prep_segs.trim();
    const id_usuario = req.session.userId;

    const activo = req.session.esAdmin ? 1 : 0; 

    const ingredientes = Ingrediente.getAllIngredientes();


    if (!id_usuario) {
        logger.error("Error: No se ha proporcionado un ID de usuario válido");
        return res.status(400).send('No se ha proporcionado un ID de usuario válido');
    }
    if (!imagen) {
        imagen_url = "default"; 
    }
    else {
        imagen_url = imagen;
    }

    try {
        const ingredientesSeleccionados = req.body.ingredientes || [];
        const ingredientesArray = Array.isArray(ingredientesSeleccionados)
            ? ingredientesSeleccionados
            : ingredientesSeleccionados ? [ingredientesSeleccionados] : [];

        if (ingredientesArray.length === 0) {
            return res.status(400).send('Debes seleccionar al menos un ingrediente');
        }
        const result = Receta.addReceta(nombre, descripcion, tiempo_prep_segs * 60, dificultad, id_usuario, activo, imagen_url);

        const recetaId = result.lastInsertRowid;

        ingredientesArray.forEach((id) => {
            const cantidad = parseFloat(req.body.cantidades_unidad[id]) || 1;
            const cantidadEsp = parseFloat(req.body.cantidades_esp[id]) || 1;

            Tiene.addIngredienteToReceta(recetaId, id, cantidad, cantidadEsp);
        });

        res.redirect('/recetas/catalogo');
    } catch (error) {
        logger.error(error);
        res.status(500).send('Error al añadir la receta');
    }
}

export function aniadirRecetaCarrito(req, res) {
    try {
        const id_receta = req.body.id;
        const user = req.session.userId;


        if (!user) {
            logger.info('No autenticado');
            return res.redirect('/usuarios/login');
        }

        if (!id_receta || isNaN(parseInt(id_receta))) {
            return res.status(400).send('ID de receta inválido');
        }

        // Obtener todos los ingredientes de la receta usando la clase Tiene
        let ingredientes;
        try {
            ingredientes = Tiene.getIngredientesByReceta(id_receta);
        } catch (e) {
            if (e.message.includes("No se encontraron ingredientes")) {
                return res.status(404).send('La receta no tiene ingredientes');
            }
            throw e;
        }

        // Añadir cada ingrediente al carrito
        for (const ingrediente of ingredientes) {
            try {
                const ingReceta = Cesta.getByUserAndIngredient(user, ingrediente.id_ingrediente);

                if (!ingReceta) {
                    Cesta.addCesta(user, ingrediente.id_ingrediente, ingrediente.cantidad);
                } else {
                    const nuevaCantidad = ingReceta.cantidad + ingrediente.cantidad;
                    Cesta.updateCesta(user, ingrediente.id_ingrediente, nuevaCantidad);
                }
            } catch (e) {
                logger.error(`Error al procesar ingrediente ${ingrediente.id_ingrediente}: ${e.message}`);
                continue;
            }
        }

        res.redirect('/pedidos/cesta');
    } catch (e) {
        logger.error(e);
        res.status(500).send('Error al añadir los ingredientes al carrito');
    }
}

//--------------------------------------------------------------------

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
    const id = req.body.id;
    Cesta.borrarIngrediente(id);
    Tiene.deleteIngrediente(id);
    Ingrediente.deleteIngrediente(id);
    res.redirect('/recetas/ingrediente');
}

export function modificarIngrediente(req, res) {
    const imagen = req.file ? req.file.filename : "";
    let imagen_url = null;

    body('nombre').escape();
    body('categoria').escape();
    body('precio').escape();
    body('stock').escape();
    body('unidad_medida').escape();

    const nombre = req.body.nombre.trim();
    const categoria = req.body.categoria.trim();
    const precio = req.body.precio.trim();
    const stock = req.body.stock.trim();
    const id = req.query.id;
    const unidad_medida = req.body.unidad_medida.trim() || 'unidad';



    if (!imagen) {
        const ing = Ingrediente.getIngredienteById(id);
        imagen_url = ing.imagen_url;
    }
    else
        imagen_url = imagen;

    Ingrediente.updateIngrediente(id, nombre, categoria, precio, stock, unidad_medida, imagen_url);
    const ingrediente = Ingrediente.getIngredienteById(id);
    res.redirect('/recetas/ingrediente');
}

export function viewAniadirIngrediente(req, res) {
    logger.debug("Sesión actual:", req.session);
    const contenido = 'paginas/aniadirIngrediente';
    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function aniadirIngrediente(req, res) {
    logger.debug("Sesión actual:", req.session);
    const imagen = req.file ? req.file.filename : "";
    let imagen_url = null;

    body('nombre').escape();
    body('categoria').escape();
    body('precio').escape();
    body('stock').escape();
    body('unidad_medida').escape();

    const nombre = req.body.nombre.trim();
    const precio = req.body.precio.trim();
    const categoria = req.body.categoria.trim();
    const stock = req.body.stock.trim();
    const id_usuario = req.session.userId;  //asusmimos que el ID de usuario está en la sesión
    const activo = 1;  //asumimos que las recetas añadidas son activas por defecto
    const unidad_medida = req.body.unidad_medida.trim() || 'unidad';


    if (!imagen) {
        imagen_url = "default";
    }
    else {
        imagen_url = imagen;

    }

    if (!id_usuario) {
        logger.error("Error: No se ha proporcionado un ID de usuario válido");
        return res.status(400).send('No se ha proporcionado un ID de usuario válido');
    }

    try {
        Ingrediente.addIngrediente(nombre, categoria, precio, stock, unidad_medida, imagen_url);
        res.redirect('/recetas/ingrediente');
    } catch (error) {
        logger.error(error);
        res.status(500).send('Error al añadir el ingrediente');
    }
}

export function aniadirIngredienteCarrito(req, res) {
    try {
        const id = req.body.id;
        const user = req.session.userId;
        if (!user) {
            logger.info('No autenticado');
            return res.redirect('/usuarios/login');
        }

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).send('ID de ingrediente inválido');
        }

        const ingrediente = Cesta.getByUserAndIngredient(user, id);

        if (!ingrediente) {
            Cesta.addCesta(user, id, 1);
        }
        else {
            const cantidad = ingrediente.cantidad + 1;
            Cesta.updateCesta(user, id, cantidad);
        }

        res.redirect('/pedidos/cesta');
    } catch (e) {
        logger.error(e);
        res.status(500).send('Error al añadir el ingrediente al carrito');
    }
}

export function buscarReceta(req, res) {

    let { tipo = 'nombre', termino = '', orden = 'relevancia' } = req.query;

    //Importante!! Si no no funciona
    termino = termino.trim().replace(/\s+/g, ' ');

    if (!termino) {
        return res.render('pagina', {
            contenido: 'paginas/busqueda',
            session: req.session,
            recetas: [],
            termino: '',
            orden,
            tipo,
            error: 'Ingrese un término de búsqueda'
        });
    }

    try {

        let recetas = [];
        const terminoBusqueda = `%${termino}%`;

        if (tipo === 'nombre') {
            recetas = Receta.searchByName(termino);
        } else if (tipo === 'ingrediente') {
            recetas = Receta.searchByIngredient(termino);
        }
        switch (orden) {
            case 'valoraciones':
                recetas.sort((a, b) => (b.valoracion_promedio || 0) - (a.valoracion_promedio || 0));
                break;

            case 'dificultad':
                recetas.sort((a, b) => a.dificultad - b.dificultad);
                break;

            case 'tiempo':
                recetas.sort((a, b) => a.tiempo_prep_segs - b.tiempo_prep_segs);
                break;

            case 'relevancia':
            default:
                recetas.sort((a, b) => {
                    const aMatch = a.nombre.toLowerCase().includes(termino.toLowerCase()) ? 1 : 0;
                    const bMatch = b.nombre.toLowerCase().includes(termino.toLowerCase()) ? 1 : 0;
                    return bMatch - aMatch;
                });
                break;
        }

        // XXX Aprender que hace ;) pista: object destructuring para copiar y añadir nuevas propiedades
        // XXX Lo normal sería que la clase Receta ya tuviera estas dos propiedades :(

        //IMPORTANTE sin esto no funciona, no se muy bien que hace es de CHATgpt
        //Transforma las cosas para que se vean correctamente por pantalla
        const resultados = recetas.map(receta => ({
            ...receta,
            tiempo_minutos: Math.ceil(receta.tiempo_prep_segs / 60),
            valoracion: receta.valoracion_promedio?.toFixed(1) || 'N/A'
        }));

        res.render('pagina', {
            contenido: 'paginas/busqueda',
            session: req.session,
            recetas: resultados,
            termino,
            orden,
            tipo,
            error: resultados.length === 0 ? `No se encontraron recetas para "${termino}"` : null
        });

    } catch (error) {
        logger.error('Error en búsqueda:', error);
        res.render('pagina', {
            contenido: 'paginas/busqueda',
            session: req.session,
            recetas: [],
            termino,
            orden,
            tipo,
            error: 'Ocurrió un error al realizar la búsqueda'
        });
    }
}

export async function actualizarStock(req, res) {

    const { id, stock } = req.body;

    try {
        Ingrediente.setStock(id, stock);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al actualizar el stock' });
    }
}

export function viewCalendarioRecetaDiaria(req, res) {
    const contenido = 'paginas/calendarioRecetaDelDia';
    const fecha = req.query.fecha || null;

    res.render('pagina', {
        contenido,
        session: req.session,
        fecha
    });
}

export async function jsonRecetas(req, res) {
    try {
        const recetas = await Receta.getAllRecetas();
        res.json(recetas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las recetas.' });
    }
}

export async function jsonRecetaDiaria(req, res) {
    try {
        const recetasDiarias = await Diaria.getTodasLasRecetas();

        if (!Array.isArray(recetasDiarias)) {
            return res.json([]);
        }

        const recetasCompletas = await Promise.all(
            recetasDiarias.map(async (recetaDiaria) => {
                const receta = await Receta.getRecetaById(recetaDiaria.id_receta);
                return {
                    title: receta.nombre,
                    start: recetaDiaria.dia,
                    id: receta.id,
                };
            })
        );

        res.json(recetasCompletas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las recetas para el calendario.' });
    }
}

export async function aniadirRecetaDiaria(req, res) {
    const { fecha, recetaId } = req.body;
    let recetaDiaria = null;
    try {
        try {
            recetaDiaria = Diaria.getRecetaPorDia(fecha);
        }
        catch (DiariaNoEncontrada) {
            logger.debug("No hay receta asignada a este día, Insertando una nueva");
        }
        if (recetaDiaria) {
            Diaria.updateRecetaPorDia(fecha, recetaId);
            return res.json({ message: 'Receta actualizada en el calendario con éxito.' });
        }
        else {
            Diaria.asignarRecetaADia(fecha, recetaId);
            res.json({ message: 'Receta añadida al calendario con éxito.' });
        }

    } catch (error) {
        res.status(500).json({ message: 'Error al añadir la receta al calendario.' });
    }
}

export async function getRecetaDiariaPorDia(req, res) {

    const { fecha } = req.body;
    try {

        const receta = Diaria.getRecetaPorDia(fecha);
        return res.json(receta);
    }
    catch (DiariaNoEncontrada) {
        return res.json({});
    }

}

export async function getRecetaPorID(req, res) {
    const id = req.params.id;
    try {
        const receta = Receta.getRecetaById(id);
        return res.json(receta);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la receta por ID.' });
    }
}

export function aceptarSugerenciaReceta(req, res) {

    const id = req.body.id;
    try {
        Receta.aceptarSugerencia(id);
        res.redirect('/recetas/catalogo');
    } catch (error) {
        logger.error("Error al aceptar la sugerencia de receta:", error);
        res.status(500).send("Error al aceptar la sugerencia de receta.");
    }
}

export function viewSugerencias(req, res) {

    const rows = Receta.getAllRecetasNact();
    const contenido = 'paginas/sugerencias';

    res.render('pagina', {
        contenido,
        session: req.session,
        recetas: rows
    });
}


export function viewImagen(request, response) {
    response.sendFile(join(config.uploads, request.params.id));
}

