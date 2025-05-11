import { body } from 'express-validator';
import { Receta } from './Recetas.js';
import { Ingrediente } from './Ingredientes.js';
import { Tiene } from './Tiene.js';
import { logger } from '../logger.js';
import { Cesta } from '../pedidos/Cesta.js';
import { Diaria } from './Diaria.js';

export function viewRecetasLista(req, res) {

    // Verificamos si la solicitud viene del calendario
    const esDesdeCalendario = req.query.origen === 'calendario';  // Se obtiene el parámetro 'origen'
    const esDesdeMisRecetas = req.query.origen === 'misRecetas';

    const fecha = req.query.fecha || null; // Fecha seleccionada, si viene desde el calendario


    const rows = Receta.getAllRecetas();
    const contenido = 'paginas/catalogo';
    res.render('pagina', {
        contenido,
        session: req.session,
        recetas: rows,
        fecha, // Importante para usarla luego al añadir receta al calendario
        //diaSeleccionado,     // Enviamos el día seleccionado
        esDesdeCalendario,  // Enviamos el flag que indica si proviene del calendario
        esDesdeMisRecetas // Enviamos el flag que indica si proviene de misRecetas
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

    // Obtener los ingredientes de la receta
    const ingredientes = Tiene.getIngredientesByReceta(id);
    // Asociar los ingredientes a la receta
    ingredientes.forEach(ingrediente => {
        const ingredienteDetails = Ingrediente.getIngredienteById(ingrediente.id_ingrediente);
        ingrediente.nombre = ingredienteDetails.nombre;
        ingrediente.unidad_medida = ingredienteDetails.unidad_medida; // Añadir unidad de medida
    });

    receta.ingredientes = ingredientes;

    res.render('pagina', {
        contenido,
        session: req.session,
        recetas: receta
    });
}

export function eliminarReceta(req, res) {
    const id = req.body.id;
    try {
        const ingredientes = Tiene.getIngredientesByReceta(id);

        //Eliminar las relaciones con ingredientes
        ingredientes.forEach(ing => {
            Tiene.removeIngredienteFromReceta(id, ing.id_ingrediente);
        });
     
        //Eliminar la receta
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
    
    let receta = Receta.getRecetaById(id);
    const imagen_url = receta.imagen_url;

    Receta.updateReceta(id, nombre, descripcion, tiempo_prep_segs * 60, dificultad, 1, imagen_url);
    receta = Receta.getRecetaById(id);

    const ingredientes = Tiene.getIngredientesByReceta(id);

    const listaIngredientes = Ingrediente.getAllIngredientes();

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

    const ingredientesSeleccionados = req.body['ingredientesSeleccionados[]'] || []; // array de ingredientes que vienen del form

    // Convertir a array si no lo es (puede ser string si solo se selecciona uno)
    const ingredientesArray = Array.isArray(ingredientesSeleccionados)
        ? ingredientesSeleccionados
        : ingredientesSeleccionados ? [ingredientesSeleccionados] : [];


    const cantidades = {};
    const cantidadesEsp = {};

    for (const key in req.body) {
        if (key.startsWith('cantidades[')) {
            const match = key.match(/\[(\d+)\]/);
            if (match) {
                const id = match[1];
                cantidades[id] = req.body[key] || 1; // Por defecto a 1 si está vacío
            }
        }
        if (key.startsWith('cantidad_especifica[')) {
            const match = key.match(/\[(\d+)\]/);
            if (match) {
                const id = match[1];
                cantidadesEsp[id] = req.body[key] || 1; // Por defecto a 1 si está vacío
            }
        }
    }

    // Añadir cada ingrediente con su cantidad
    for (const ingredienteId of ingredientesArray) {
        if (ingredienteId) {
            const cantidad = cantidades[ingredienteId] || 1;
            const cantidad_esp = cantidadesEsp[ingredienteId] || 1;
            Tiene.addIngredienteToReceta(id, ingredienteId, cantidad, cantidad_esp);
        }
    }

    const ingredientesAEliminar = req.body['ingredientesAEliminar[]'] || [];

    // Cantidad de ingredientes que se quieren eliminar
    //const cantidadAEliminar = ingredientesEliminarArray.length;

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
    const ingredientes = Ingrediente.getAllIngredientes(); // Lista de ingredientes

    res.render('pagina', {
        contenido,
        session: req.session,
        ingredientes,
        error: null
    });

}

export function aniadirReceta(req, res) {
    // Verifica si userId está definido
    logger.debug("Sesión actual:", req.session);

    body('nombre').escape();
    body('descripcion').escape();
    body('dificultad').escape();
    body('tiempo_prep_segs').escape();

    const nombre = req.body.nombre.trim();
    const descripcion = req.body.descripcion.trim();
    const dificultad = req.body.dificultad.trim();
    const tiempo_prep_segs = req.body.tiempo_prep_segs.trim();
    const id_usuario = req.session.userId;  //asusmimos que el ID de usuario está en la sesión
    const activo = 1;  //asumimos que las recetas añadidas son activas por defecto
    const imagen_url = req.body.imagen_url.trim(); // URL de la imagen, se obtiene del formulario

    //const imagen_url = "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fes%2Ffotos%2Fno-encontrado-mensaje-de-error-fotos&psig=AOvVaw3yClaJKuZYliDgG5DHGhJC&ust=1745919601499000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCLCLvr-3-owDFQAAAAAdAAAAABAE"; // Imagen por defecto

    const ingredientes = Ingrediente.getAllIngredientes();


    if (!id_usuario) {
        logger.error("Error: No se ha proporcionado un ID de usuario válido");

        return res.status(400).send('No se ha proporcionado un ID de usuario válido');
    }

    try {
        const result = Receta.addReceta(nombre, descripcion, tiempo_prep_segs * 60, dificultad, id_usuario, activo, imagen_url);

        const recetaId = result.id;

        const ingredientesSeleccionados = req.body['ingredientes[]'] || []; // array de ingredientes que vienen del form
        
        // Cantidades normales (primer valor del array)
        const cantidades = {};
        for (const key in req.body) {
            const match = key.match(/^cantidades\[(\d+)\]$/);
            if (match) {
                const id = match[1];
                const valor = req.body[key];

                let cantidad = '1';

                if (Array.isArray(valor)) {
                    cantidad = valor[0] && valor[0].trim() !== '' ? valor[0] : '1';
                } else {
                    cantidad = valor && valor.trim() !== '' ? valor : '1';
                }

                const cantidadNum = parseInt(cantidad, 10);
                cantidades[id] = isNaN(cantidadNum) || cantidadNum <= 0 ? 1 : cantidadNum;
            }
        }

        // Cantidades específicas (segundo valor del array)
        const cantidad_esp = {};
        for (const key in req.body) {
            const match = key.match(/^cantidades\[(\d+)\]$/);
            if (match) {
                const id = match[1];
                const valor = req.body[key];

                let cantidad = '1';

                if (Array.isArray(valor)) {
                    cantidad = valor[1] && valor[1].trim() !== '' ? valor[1] : '1';
                }

                const cantidadNum = parseInt(cantidad, 10);
                if (!isNaN(cantidadNum) && cantidadNum > 0) {
                    cantidad_esp[id] = cantidadNum;
                }
            }
        }


        // Convertir a array si no lo es (puede ser string si solo se selecciona uno)
        const ingredientesArray = Array.isArray(ingredientesSeleccionados)
            ? ingredientesSeleccionados
            : ingredientesSeleccionados ? [ingredientesSeleccionados] : [];

                
        // Añadir cada ingrediente con su cantidad
        for (const ingredienteId of ingredientesArray) {
            if (ingredienteId) {
                const cantidad = cantidades[ingredienteId] || 1;
                const cantidadEspecifica = cantidad_esp[ingredienteId] || 1; 

                Tiene.addIngredienteToReceta(recetaId, ingredienteId, cantidad, cantidadEspecifica);

            }
        }

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
                // Continuar con el siguiente ingrediente aunque falle uno
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

    body('nombre').escape();
    body('categoria').escape();
    body('precio').escape();
    body('stock').escape();    

    const nombre = req.body.nombre.trim();
    const categoria = req.body.categoria.trim();
    const precio = req.body.precio.trim();
    const stock = req.body.stock.trim();
    const id = req.query.id;
    const unidad_medida = req.body.unidad_medida.trim() || 'unidad';
    const contenido = 'paginas/ingredienteInd';

    let ingrediente = Ingrediente.getIngredienteById(id);
    const imagen_url = ingrediente.imagen_url;
    Ingrediente.updateIngrediente(id, nombre, categoria, precio, stock, unidad_medida, imagen_url);
    ingrediente = Ingrediente.getIngredienteById(id);
    res.render('pagina', {
        contenido,
        session: req.session,
        ingredientes: ingrediente
    });
}

export function viewAniadirIngrediente(req, res) {
    // Verifica si userId está definido
    logger.debug("Sesión actual:", req.session);
    const contenido = 'paginas/aniadirIngrediente';
    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function aniadirIngrediente(req, res) {
    // Verifica si userId está definido
    logger.debug("Sesión actual:", req.session);

    body('nombre').escape();
    body('precio').escape();
    body('categoria').escape();
    body('stock').escape();

    const nombre = req.body.nombre.trim();
    const precio = req.body.precio.trim();
    const categoria = req.body.categoria.trim();
    const stock = req.body.stock.trim();
    const id_usuario = req.session.userId;  //asusmimos que el ID de usuario está en la sesión
    const activo = 1;  //asumimos que las recetas añadidas son activas por defecto
    const unidad_medida = req.body.unidad_medida.trim() || 'unidad';
    const imagen_url = req.body.imagen_url.trim(); // URL de la imagen, se obtiene del formulario


    if (!imagen_url == null || !imagen_url == undefined) {
        // Si no se proporciona una URL de imagen, se asigna una por defecto
        imagen_url = "https://www.pastasgallo.es/wp-content/uploads/2020/11/pack_harina_trigo.png"; // Imagen por defecto
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

//--------------------------------------------------------------------

export function buscarReceta(req, res) {
    //tipo (si es búsqueda por nombre o ingrediente) y termino (el texto)
    let { tipo = 'nombre', termino = '', orden = 'relevancia' } = req.query;

    //Importante!! Si no no funciona
    termino = termino.trim().replace(/\s+/g, ' '); // quitar espacios

    //Comprobar que hay un texto
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
        const terminoBusqueda = `%${termino}%`; //Para no distinguir entre mayusculas y minusculas

        if (tipo === 'nombre') {
            recetas = Receta.searchByName(termino);
        } else if (tipo === 'ingrediente') {
            recetas = Receta.searchByIngredient(termino);
        }

        // Ordenar según lo que se haya seleccionado
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
                // Ordenar por mejor coincidencia primero
                recetas.sort((a, b) => {
                    //coincidencia exacta
                    const aMatch = a.nombre.toLowerCase().includes(termino.toLowerCase()) ? 1 : 0;

                    //coincidencia parcial
                    const bMatch = b.nombre.toLowerCase().includes(termino.toLowerCase()) ? 1 : 0;
                    return bMatch - aMatch;
                });
                break;
        }

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
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al actualizar el stock' });
    }
}


export function viewCalendarioRecetaDiaria(req, res) {
    const contenido = 'paginas/calendarioRecetaDelDia';
    const fecha = req.query.fecha || null; // Fecha seleccionada, si viene desde el calendario

    res.render('pagina', {
        contenido,
        session: req.session,
        fecha
    });
}


export async function jsonRecetas(req, res) {
    try {
        const recetas = await Receta.getAllRecetas(); // Ajusta el nombre de tu tabla
        res.json(recetas); // Devuelve las recetas como JSON
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las recetas.' });
    }
}

export async function jsonRecetaDiaria(req, res) {
    try {
        const recetasDiarias = await Diaria.getTodasLasRecetas(); // [{ id_receta, dia }, ...]

        if (!Array.isArray(recetasDiarias)) {
            return res.json([]); // Devuelve un array vacío si no hay recetas
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
        console.error('Error al obtener las recetas para el calendario:', error);
        res.status(500).json({ message: 'Error al obtener las recetas para el calendario.' });
    }
}

export async function aniadirRecetaDiaria(req, res) {
    const { fecha, recetaId } = req.body; // Asegúrate de que el cuerpo de la solicitud contenga estos datos
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
        console.error(error);
        res.status(500).json({ message: 'Error al añadir la receta al calendario.' });
    }
}
export async function getRecetaDiariaPorDia(req, res) {

    const { fecha } = req.body; // Asegúrate de que el cuerpo de la solicitud contenga estos datos
    try {
        
        const receta = Diaria.getRecetaPorDia(fecha);
        return res.json(receta);
    } 
    catch (DiariaNoEncontrada){
        return res.json({});
    }
   
}

export async function getRecetaPorID(req, res) {
    const id = req.params.id; // Asegúrate de que el cuerpo de la solicitud contenga estos datos
    try {
        const receta = Receta.getRecetaById(id);
        return res.json(receta);
    } catch (error) {
        console.error(error);
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
    
    // Obtener las recetas no activas (sugerencias)
    if(!req.session.login) {
        return res.redirect('/usuarios/login');
    }
    const rows = Receta.getAllRecetasNact();

    // Definir los parámetros a enviar a la vista
    const contenido = 'paginas/sugerencias'; // Referencia a la vista 'sugerencias.ejs'
    //const esDesdeCalendario = false; // Define si es desde el calendario
    //const esDesdeMisRecetas = false; // Define si es desde mis recetas

    // Renderizar la vista con los parámetros necesarios
    res.render('pagina', {
        contenido,
        session: req.session,
        recetas: rows
    });
}

