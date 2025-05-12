import { body } from 'express-validator';
import { Usuario, UsuarioYaExiste, RolesEnum } from './Usuario.js';
import { validationResult, matchedData } from 'express-validator';
import { render } from '../utils/render.js';
import { logger } from '../logger.js';
import { CalendarioSemanal } from './CalendarioSemanal.js';
import { Guardado } from './Guardado.js';
import { Receta } from '../recetas/Recetas.js';
import { Pedido } from '../pedidos/Pedidos.js';
import { Contiene } from '../pedidos/Contiene.js';
import { Realiza } from '../pedidos/Realiza.js';



export function viewConfiguracion(req, res) {
    if (!req.session.login) {
        logger.info(`No se ha iniciado sesión :|`);
        return res.redirect('/usuarios/login');
    }
    let contenido = 'paginas/configuracion';
    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export async function viewListaUsuario(req, res) {
    try {
        let contenido = "paginas/gestionUsuarios";

        const usuarios = await Usuario.getAllUsuarios();

        res.render('pagina', {
            contenido,
            session: req.session,
            usuarios: usuarios
        });
    } catch (error) {
        logger.error('Error al obtener la lista de usuarios:', error);
        res.status(500).send('Error al cargar la lista de usuarios');
    }
}

export function viewPerfil(req, res) {
    const usuario = Usuario.getUsuarioById(req.session.userId);

    res.render('pagina', {
        contenido: 'paginas/perfil',
        usuario: usuario,
        session: req.session
    });
}

export function viewMisRecetas(req, res) {

    let contenido = 'paginas/misRecetas';

    const recetasGuardadas = Guardado.getFavoritosByUsuario(req.session.userId);

    const recetas = [];

    for (const fav of recetasGuardadas) {
        try {
            const receta = Receta.getRecetaById(fav.id_receta);
            recetas.push(receta);
        } catch (error) {
            console.error(`Error al obtener receta con ID ${fav.id_receta}:`, error.message);
        }
    }

    res.render('pagina', {
        contenido: 'paginas/misRecetas',
        session: req.session,
        recetas: recetas
    });
}

export function viewHistorial(req, res) {
    let contenido = 'paginas/historial';
    try {
        const id_usuario = req.session.userId;
        const relaciones = Realiza.getByUsuario(id_usuario);

        // Si no hay relaciones, el historial está vacío
        if (relaciones.length === 0) {
            return res.render('pagina', {
                contenido: 'paginas/historial',
                session: req.session,
                historial: []
            });
        }

        // Construir el historial
        const historial = relaciones.map(relacion => {
            const pedido = Pedido.getPedidoById(relacion.id_pedido);
            const ingredientes = Contiene.getByPedido(relacion.id_pedido) || [];
            const ingredientesAgrupados = Object.values(
                ingredientes.reduce((acc, ing) => {
                    if (!acc[ing.id_ingrediente]) {
                        acc[ing.id_ingrediente] = { ...ing };
                    } else {
                        acc[ing.id_ingrediente].cantidad += ing.cantidad;
                    }
                    return acc;
                }, {})
            );

            // Calcular el precio total
            const precioTotal = ingredientesAgrupados.reduce((total, ing) => total + parseFloat(ing.precio) * ing.cantidad, 0).toFixed(2);

            return {
                pedido,
                ingredientes,
                precioTotal
            };
        });

        // Renderizar la página con el historial
        res.render('pagina', {
            contenido,
            session: req.session,
            historial
        });
    } catch (error) {
        console.error('Error al obtener el historial de pedidos:', error);
        res.status(500).send('Error al cargar el historial de pedidos');
    }
}

export async function viewCalendario(req, res) {
    const contenido = 'paginas/calendario';
    const hoy = new Date();

    // Lunes de esta semana (semana que contiene "hoy")
    const lunesEstaSemana = new Date(hoy);
    const diaSemana = hoy.getDay(); // 0 = domingo, 1 = lunes, ...
    const offsetLunes = diaSemana === 0 ? -6 : 1 - diaSemana; // para que domingo cuente como fin de semana anterior
    lunesEstaSemana.setDate(hoy.getDate() + offsetLunes);
    lunesEstaSemana.setHours(0, 0, 0, 0);

    // Domingo de la semana siguiente (14 días desde lunes incluido)
    const domingoProximaSemana = new Date(lunesEstaSemana);
    domingoProximaSemana.setDate(lunesEstaSemana.getDate() + 13); // lunes + 13 = domingo siguiente
    domingoProximaSemana.setHours(23, 59, 59, 999);

    // Obtener recetas en el rango de 14 días
    const recetasSemana = await CalendarioSemanal.getRecetasRango(
        req.session.userId,
        lunesEstaSemana,
        domingoProximaSemana
    );

    res.render('pagina', {
        contenido,
        session: req.session,
        inicioSemana: lunesEstaSemana.toISOString(),
        recetasSemana
    });
}

export function viewLogin(req, res) {
    let contenido = 'paginas/login';
    render(req, res, contenido, {
        errores: {},
        datos: {}
    });
}

export function viewRegister(req, res) {
    let contenido = 'paginas/register';
    render(req, res, contenido, {
        errores: {},
        datos: {},
    });
}

export async function doLogin(req, res) {

    let contenido = 'paginas/login';
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errores = errors.mapped();
        const datos = matchedData(req);

        return render(req, res, contenido, {
            session: req.session,
            datos,
            errores,
        });
    }

    body('username').escape();
    body('password').escape();
    const username = req.body.username.trim();
    const password = req.body.password.trim();

    try {
        const usuario = await Usuario.login(username, password);

        req.session.login = true;
        req.session.userId = usuario.id;
        req.session.username = usuario.username;
        req.session.nombre = usuario.nombre;
        req.session.apellido = usuario.apellido || '';
        req.session.correo = usuario.correo || '';
        req.session.direccion = usuario.direccion || '';
        req.session.esAdmin = usuario.rol === RolesEnum.ADMIN;
        req.session.esCocinero = usuario.rol === RolesEnum.COCINERO;

        res.setFlash(`Encantado de verte de nuevo: ${usuario.nombre}`);
        logger.info(`Usuario ${username} ha iniciado sesión.`);
        return res.redirect('/usuarios/home');



    } catch (e) {
        const datos = matchedData(req);
        logger.warn(`Fallo en el login del usuario  %s`, username);
        logger.debug('El usuario %s, no ha podido logarse: %s', username, e.message);
        req.session.flashMsg = 'El usuario o contraseña no son válidos';

        return render(req, res, contenido, {
            error: 'Usuario o contraseña incorrectos',
            session: req.session,
            datos,
            errores: {}
        });

    }
}

export async function doRegister(req, res) {

    // Verifica si hay errores en las validaciones
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errores = errors.mapped();
        const datos = matchedData(req);
        return render(req, res, 'paginas/register', {
            errores,
            datos,
            error: errors.array().map(err => err.msg).join(', ') // Muestra los errores en un solo mensaje
        });

    }

    body('username').escape();
    body('nombre').escape();
    body('apellido').escape();
    body('correo').escape();
    body('direccion').escape();
    // Capturo las variables
    const username = req.body.username.trim();
    const password = req.body.password.trim();
    const nombre = req.body.nombre.trim();
    const apellido = req.body.apellido.trim();
    const correo = req.body.correo.trim();
    const direccion = req.body.direccion.trim();


    try {
        const usuario = await Usuario.register(username, password, nombre, apellido, correo, direccion);

        req.session.login = true;
        req.session.userId = usuario.id;
        req.session.username = usuario.username;
        req.session.nombre = usuario.nombre;
        req.session.apellido = usuario.apellido || '';
        req.session.correo = usuario.correo || '';
        req.session.direccion = usuario.direccion || '';
        req.session.rol = usuario.rol;
        req.session.esAdmin = usuario.rol === RolesEnum.ADMIN;
        req.session.esCocinero = usuario.rol === RolesEnum.COCINERO;


        res.setFlash(`Bienvenido a CookingLab: ${usuario.nombre}`);
        logger.info(`Usuario ${username} se ha registrado correctamente.`);
        return res.redirect('/usuarios/home');

    } catch (e) {
        let error = 'No se ha podido crear el usuario';
        if (e instanceof UsuarioYaExiste) {
            error = 'El nombre de usuario ya está utilizado';
        }

        logger.error("Problemas al registrar un nuevo usuario '%s'", username);
        logger.debug('El usuario no ha podido registrarse: %s', e);

        const datos = matchedData(req);
        return render(req, res, 'paginas/register', {
            errores: {},
            datos,
            error
        });
    }
}

export function doLogout(req, res, next) {
    // https://expressjs.com/en/resources/middleware/session.html
    // logout logic

    // clear the user from the session object and save.
    // this will ensure that re-using the old session id
    // does not have a logged in user
    req.session.login = null
    req.session.nombre = null;
    req.session.esAdmin = null;
    req.session.esCocinero = null;

    req.session.save((err) => {
        if (err) next(err);

        // regenerate the session, which is good practice to help
        // guard against forms of session fixation
        req.session.regenerate((err) => {
            if (err) next(err)
            res.redirect('/');
        })
    })
}

export function viewModificarPerfil(req, res) {
    let contenido = 'paginas/editarPerfil';
    const id = parseInt(req.query.id);
    const perfil = Usuario.getUsuarioById(id);

    res.render('pagina', {
        contenido,
        session: req.session,
        usuario: perfil
    });
}

export function viewHome(req, res) {
    const contenido = 'paginas/home';
    const id = req.session.userId;
    const perfil = Usuario.getUsuarioById(id);
    res.render('pagina', {
        contenido,
        session: req.session,
        usuario: perfil
    });
}

export function modificarPerfil(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('pagina', {
            contenido: 'paginas/editarPerfil',
            error: errors.array().map(err => err.msg).join(', '),
            session: req.session,
            usuario: Usuario.getUsuarioById(req.query.id)
        });
    }

    const datos = matchedData(req);

    if (!id) {
        return res.render('pagina', {
            contenido: 'paginas/editarPerfil',
            error: 'ID de usuario no proporcionado',
            session: req.session
        });
    }

    try {

        const usuarioActual = Usuario.getUsuarioById(id);

        const password = rawPassword
            ? bcrypt.hashSync(rawPassword)
            : usuarioActual.password;

        const usuarioActualizado = new Usuario(
            username,
            password,
            nombre,
            apellido,
            correo,
            direccion,
            usuarioActual.rol,
            usuarioActual.activo,
            id
        );

        usuarioActualizado.persist();

        if (req.session.userId === id) {
            req.session.username = username;
            req.session.nombre = nombre;
            req.session.apellido = apellido;
            req.session.correo = correo;
            req.session.direccion = direccion;
        }


        req.session.flashMsg = 'Perfil actualizado correctamente';
        return res.redirect('/usuarios/perfil');

    } catch (e) {

        logger.error('Error al modificar perfil:', e);

        let errorMessage = 'Error al actualizar el perfil';
        if (e instanceof UsuarioNoEncontrado) {
            errorMessage = 'Usuario no encontrado';
        } else if (e instanceof UsuarioYaExiste) {
            errorMessage = 'El nombre de usuario ya está en uso';
        }

        return res.render('pagina', {
            contenido: 'paginas/editarPerfil',
            session: req.session,
            usuario: Usuario.getUsuarioById(id),
            error: errorMessage
        });
    }
}

export function eliminarPerfil(req, res) {
    const id = req.query.id;
    try {
        Usuario.borrarUsuario(id);
        req.json = { mensaje: 'Usuario borrado con éxito' };
    } catch (error) {
        logger.error('Error al borrar usuario:', error);
        res.status(500).json({ mensaje: 'Error al cambiar permisos', error: error.message });
    }

    return res.redirect('/usuarios/listaUsuarios');
}

export async function cambiarPermisos(req, res) {
    const userId = req.params.id;
    const { rol } = req.body;

    if (!rol) {
        return res.status(400).json({ mensaje: 'El rol es requerido' });
    }

    try {
        const usuarioActualizado = Usuario.cambiarPermisos(userId, rol);
        res.json({ mensaje: 'Permisos actualizados correctamente', usuario: usuarioActualizado });
    } catch (error) {
        logger.error('Error al cambiar permisos:', error);
        res.status(500).json({ mensaje: 'Error al cambiar permisos', error: error.message });
    }
}

export function aniadirRecetaACalendario(req, res) {

    const recetaId = req.body.recetaId;
    const fecha = req.body.fecha;
    const usuarioId = req.session.userId;
    try {
        CalendarioSemanal.asignarRecetaAUsuario(recetaId, usuarioId, fecha);
        res.redirect('/usuarios/micalendario');
        //TODO Añadir mensaje en el controller    
        //return { mensaje: "Receta asignada correctamente" }; (Mensaje Flash?)
    } catch (e) {
        console.error("Error al añadir receta al calendario:", e);
        res.render('pagina', {
            contenido: 'paginas/error',
            session: req.session,
            error: "No se pudo asignar la receta al calendario"
        });
    }
}

export function eliminarRecetaDeCalendario(req, res) {
    const fecha = req.body.fecha;
    const usuarioId = req.session.userId;

    if (!fecha || !usuarioId) {
        return res.render('pagina', {
            contenido: 'paginas/error',
            session: req.session,
            error: "Faltan datos necesarios para eliminar la receta"
        });
    }

    try {

        if (CalendarioSemanal.eliminarRecetaDeUsuario(usuarioId, fecha)) {
            res.redirect('/usuarios/micalendario');
            //TODO Añadir mensaje en el controller {mensaje: "Receta eliminada correctamente" };
        }
    } catch (e) {
        console.error("Error al eliminar receta del calendario:", e);
        res.render('pagina', {
            contenido: 'paginas/error',
            session: req.session,
            error: "No se pudo eliminar la receta del calendario"
        });
    }
}

export function aniadirRecetaAFavoritos(req, res) {
    const recetaId = req.body.recetaId;
    const usuarioId = req.session.userId;

    if (!usuarioId || !recetaId) {
        return res.render('pagina', {
            contenido: 'paginas/error',
            session: req.session,
            error: "Faltan datos necesarios para guardar la receta"
        });
    }

    try {
        Guardado.addRecetaToFavoritos(usuarioId, recetaId);
        res.redirect('/usuarios/misrecetas');
    } catch (e) {
        console.error("Error al guardar receta en favoritos:", e);
        res.render('pagina', {
            contenido: 'paginas/error',
            session: req.session,
            error: "No se pudo guardar la receta en favoritos"
        });
    }
}

export function eliminarRecetaDeFavoritos(req, res) {
    const recetaId = req.body.recetaId;
    const usuarioId = req.session.userId;

    try {
        Guardado.removeRecetaFromFavoritos(usuarioId, recetaId);
        res.redirect('/usuarios/misrecetas');

        //TODO Añadir mensaje en el controller {mensaje: "Receta eliminada de favoritos" };
    } catch (e) {
        console.error("Error al eliminar receta de favoritos:", e);
        res.render('pagina', {
            contenido: 'paginas/error',
            session: req.session,
            error: "No se pudo eliminar la receta de favoritos"
        });
    }
}

export function viewSugerencias(req, res) {
    res.render('pagina', {
        contenido: 'paginas/sugerencias', // Asegúrate de tener esta plantilla
        session: req.session,
    });
}        
