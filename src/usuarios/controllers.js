import { body } from 'express-validator';
import { Usuario, UsuarioYaExiste, RolesEnum } from './Usuario.js';
import { validationResult, matchedData } from 'express-validator';
import { render } from '../utils/render.js';
import { logger } from '../logger.js';
import { CalendarioSemanal } from './CalendarioSemanal.js';


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
        let contenido;
        if (req.session != null && req.session.login && req.session.esAdmin) {
            contenido = "paginas/gestionUsuarios";
        }
        else if (!req.session.login) {
            logger.info(`No se ha iniciado sesión :|`);
            return res.redirect('/usuarios/login');
        }
        else {
            res.setFlash(`No dispone de permisos para ver esta página`);
            logger.info(`Se ha intentado acceder a la lista de perfiles sin permisos de adminstrador :|`);
            return res.redirect('/usuarios/home');
        }
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
    if (!req.session.login) {
        return res.redirect('/usuarios/login');
    }

    const usuario = Usuario.getUsuarioById(req.session.userId);

    console.log("Usuario desde session:", usuario);

    res.render('pagina', {
        contenido: 'paginas/perfil',
        usuario: usuario,
        session: req.session
    });
}

export function viewMisRecetas(req, res) {
    let contenido = 'paginas/misRecetas';
    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function viewHistorial(req, res) {
    let contenido = 'paginas/historial';
    res.render('pagina', {
        contenido,
        session: req.session
    });
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

    console.log("Recetas entre", lunesEstaSemana, "y", domingoProximaSemana);
    console.log("Recetas de la semana:", recetasSemana);

    res.render('pagina', {
        contenido,
        session: req.session,
        inicioSemana: lunesEstaSemana.toISOString(),
        recetasSemana
    });
}

export function viewLogin(req, res) {
    let contenido = 'paginas/login';
    if (req.session != null && req.session.login) {
        contenido = 'paginas/home'
    }
    render(req, res, contenido, {
        errores: {},
        datos: {}
    });
}

export function viewRegister(req, res) {
    let contenido = 'paginas/register';
    if (req.session != null && req.session.login) {
        contenido = 'paginas/home'
    }
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
    let contenido;
    const id = parseInt(req.query.id);
    const perfil = Usuario.getUsuarioById(id);

    if (req.session != null && req.session.login && (req.session.esAdmin || req.session.userId === id)) {
        contenido = 'paginas/editarPerfil';
    }
    else if (!req.session.login) {
        logger.info(`Se ha intentado editar un perfil sin inicar sesion :|`);
        return res.redirect('/usuarios/login');
    }
    else {
        res.setFlash(`No se puede editar el perfil de otro usuario`);
        logger.info(`Se ha intentado acceder a un perfil ajeno :|`);
        return res.redirect('/usuarios/home');
    }

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

    body('username').escape();
    body('nombre').escape();
    body('apellido').escape();
    body('correo').escape();
    body('direccion').escape();

    const id = req.query.id;
    if (!id) {
        return res.render('pagina', {
            contenido: 'paginas/editarPerfil',
            error: 'ID de usuario no proporcionado',
            session: req.session
        });
    }

    try {
        const username = req.body.username?.trim() || '';
        const rawPassword = req.body.password?.trim() || '';
        const nombre = req.body.nombre?.trim() || '';
        const apellido = req.body.apellido?.trim() || '';
        const correo = req.body.correo?.trim() || '';
        const direccion = req.body.direccion?.trim() || '';

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

        return res.render('pagina', {
            contenido: 'paginas/perfil',
            session: req.session,
            usuario: usuarioActualizado,
            success: 'Perfil actualizado correctamente'
        });

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

export function aniadirRecetaACalendario(req, res) {
    //console.log(" Intentando buscar los id en controller:");

    const recetaId = req.body.recetaId;
    const fecha = req.body.fecha;
    const usuarioId = req.session.userId;

    //console.log("   id_receta:", recetaId);
    //console.log("   id_usuario:", usuarioId);
    //console.log("   fecha:", fecha);

    try {
        CalendarioSemanal.asignarRecetaAUsuario(recetaId, usuarioId, fecha);
        res.redirect('/usuarios/micalendario');
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
        CalendarioSemanal.eliminarRecetaDeUsuario(usuarioId, fecha);
        res.redirect('/usuarios/micalendario');
    } catch (e) {
        console.error("Error al eliminar receta del calendario:", e);
        res.render('pagina', {
            contenido: 'paginas/error',
            session: req.session,
            error: "No se pudo eliminar la receta del calendario"
        });
    }
}

export function eliminarPerfil(req, res) {
    const id = req.query.id;
    try {
        Usuario.borrarUsuario(id);
        req.json = { mensaje: 'Usuario borrado con éxito'};
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
