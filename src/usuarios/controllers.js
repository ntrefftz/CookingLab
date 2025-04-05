import { body } from 'express-validator';
import { Usuario, UsuarioYaExiste, RolesEnum } from './Usuario.js';
import { validationResult, matchedData } from 'express-validator';
import { render } from '../utils/render.js';

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
            error: 'Usuario o contraseña incorrectos',
            session: req.session,
            datos: {},
            errores: {}
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
        req.log.info(`Usuario ${username} ha iniciado sesión.`);
        return res.redirect('/usuarios/home');

         

    } catch (e) {
        const datos = matchedData(req);
        req.log.warn(`Fallo en el login del usuario  %s`, username);
        req.log.debug('El usuario %s, no ha podido logarse: %s', username, e.message);
        req.session.flashMsg = 'El usuario o contraseña no son válidos';

        return render(req, res, contenido, {
            error: 'Usuario o contraseña incorrectos',
            session: req.session,
            datos: {},
            errores: {}
        });
        return res.redirect('/usuarios/login');
    }
}

export async function doRegister(req, res) {

    // Verifica si hay errores en las validaciones
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        render(req, res, 'paginas/register', {
            errores: {},
            datos: {},
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
        req.log.info(`Usuario ${username} se ha registrado correctamente.`);
        return res.redirect('/usuarios/home');

    } catch (e) {
        let error = 'No se ha podido crear el usuario';
        if (e instanceof UsuarioYaExiste) {
            error = 'El nombre de usuario ya está utilizado';
        }
        req.log.error("Problemas al registrar un nuevo usuario '%s'", username);
        req.log.debug('El usuario no ha podido registrarse: %s', e);
        render(req, res, 'paginas/register', {
            errores: {},
            datos: {}
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
    const contenido = 'paginas/editarPerfil';
    const id = req.query.id;
    const perfil = Usuario.getUsuarioById(id);
    res.render('pagina', {
        contenido,
        session: req.session,
        usuario: perfil
    });
}
export function viewHome(req, res){
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