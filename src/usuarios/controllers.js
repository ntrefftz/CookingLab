import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { Usuario, RolesEnum } from './Usuario.js';

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
        //CAMBIO PARA GUARDAR EL ID DEL USUARIO
        req.session.userId = usuario.id;

        req.session.nombre = usuario.nombre;
        req.session.esAdmin = usuario.rol === RolesEnum.ADMIN;

        return res.render('pagina', {
            contenido: 'paginas/home',
            session: req.session
        });

    } catch (e) {
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
        //CAMBIO PARA GUARDAR EL ID DEL USUARIO
        req.session.userId = usuario.id;
        req.session.nombre = usuario.nombre;
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
