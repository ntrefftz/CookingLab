import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { Usuario, RolesEnum } from './Usuario.js';

//Para registrar en logs los intentos de inicio de sesion y los errores
//import { logger } from './logger.js';

export function viewConfiguracion(req, res) {
    let contenido = 'paginas/configuracion';
    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function viewPerfil(req, res) {
    if (!req.session.login) {
        return res.redirect('/usuarios/login');
    }

    const usuario = {
        id: req.session.userId,  
        username: req.session.username,
        password: req.session.password, 
        nombre: req.session.nombre,
        apellido: req.session.apellido,
        correo: req.session.correo,
        direccion: req.session.direccion,
        rol: req.session.rol  
    };

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

export function viewCalendario(req, res) {
    let contenido = 'paginas/calendario';
    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function viewLogin(req, res) {
    let contenido = 'paginas/login';
    if (req.session != null && req.session.login) {
        contenido = 'paginas/home'
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function viewRegister(req, res) {
    let contenido = 'paginas/register';
    if (req.session != null && req.session.login) {
        contenido = 'paginas/home'
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function doLogin(req, res) {

    // Verifica si hay errores en las validaciones
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //Cambio paara los mensajes flash
        /*const errores = result.mapped();
        const datos = matchedData(req);

        return res.render('pagina', {
            contenido: 'paginas/login',
            error: 'Usuario o contraseña incorrectos',
            session: req.session
        });*/
        return res.render('pagina', {
            contenido: 'paginas/login',
            error: errors.array().map(err => err.msg).join(', ') // Muestra los errores en un solo mensaje
        });
    }

    body('username').escape();
    body('password').escape();
    // Capturo las variables username y password
    const username = req.body.username.trim();
    const password = req.body.password.trim();

    try {
        const usuario = Usuario.login(username, password);
        
        req.session.login = true;
        req.session.userId = usuario.id;
        req.session.username = usuario.username;
        req.session.nombre = usuario.nombre;
        req.session.apellido = usuario.apellido || ''; 
        req.session.correo = usuario.correo || '';
        req.session.direccion = usuario.direccion || '';
        req.session.rol = usuario.rol;
        req.session.esAdmin = usuario.rol === RolesEnum.ADMIN;

        // Modificaciones para flash
        /*res.setFlash(`Encantado de verte de nuevo, ${usuario.nombre}!`);
        logger.info(`Usuario ${username} ha iniciado sesión.`);
        return res.redirect('../vistas/paginas/home.ejs');*/

        //Ahora en vez de renderizar la vista, redirigimos a la página de inicio
        return res.render('pagina', {
            contenido: 'paginas/home',
            session: req.session
        });

    } catch (e) {
        //Cambio para los mensajes Flash
        /*logger.warn(`Fallo en el login del usuario '${username}': ${e.message}`);
        req.session.flashMsg = 'El usuario o contraseña no son válidos';
        return res.redirect('/usuarios/login');*/

        res.render('pagina', {
            contenido: 'paginas/login',
            error: 'El usuario o contraseña no son válidos'
        })
    }
}

export function doRegister(req, res) {

    // Verifica si hay errores en las validaciones
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('pagina', {
            contenido: 'paginas/register',
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
        const usuario = Usuario.register(username, password, nombre, apellido, correo, direccion);
        
        req.session.login = true;
        req.session.userId = usuario.id;
        req.session.username = usuario.username;
        req.session.nombre = usuario.nombre;
        req.session.apellido = usuario.apellido || '';
        req.session.correo = usuario.correo || '';
        req.session.direccion = usuario.direccion || '';
        req.session.rol = usuario.rol;
        req.session.esAdmin = usuario.rol === RolesEnum.ADMIN;

        return res.render('pagina', {
            contenido: 'paginas/home',
            session: req.session
        });

    } catch (e) {
        res.render('pagina', {
            contenido: 'paginas/register',
            error: 'Error al guardar los datos ' + e
        })
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
    const contenido = 'paginas/editarPerfil';
    const id = req.query.id;
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
        console.error('Error al modificar perfil:', e);
        
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