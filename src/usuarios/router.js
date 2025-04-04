import {body} from 'express-validator';
import express from 'express';
import { viewConfiguracion, viewHistorial, viewPerfil, viewMisRecetas, viewCalendario, viewLogin, doLogin, doLogout,
     viewRegister, doRegister, viewModificarPerfil, modificarPerfil, viewHome } from './controllers.js';

const usuariosRouter = express.Router();


usuariosRouter.get('/configuracion', viewConfiguracion);
usuariosRouter.get('/perfil', viewPerfil);
usuariosRouter.get('/historial', viewHistorial);
usuariosRouter.get('/misrecetas', viewMisRecetas);
usuariosRouter.get('/micalendario', viewCalendario);
usuariosRouter.get('/login', viewLogin);
usuariosRouter.get('/perfil/modificar', viewModificarPerfil);
usuariosRouter.get('/home', viewHome);

usuariosRouter.post('/login', 
    body('username', 'El nombre no puede ser vacío').trim().notEmpty(),
    body('password', 'La contraseña no puede ser vacía').trim().notEmpty(),
    doLogin
);

usuariosRouter.get('/logout', doLogout);
usuariosRouter.get('/register', viewRegister);

usuariosRouter.post('/register', 
    body('username', 'Sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i),
    body('username', 'El usuario no puede ser vacío').trim().notEmpty(),
    body('nombre', 'El nombre no puede ser vacío').trim().notEmpty(),  //Asegura que el nombre no esté vacío
    body('password', 'La contraseña tiene que tener entre 6 y 10 caracteres').trim().isLength({ min: 6, max: 10 }),
    doRegister
);

usuariosRouter.post('/perfil/modificar', 
    body('username').trim().notEmpty().withMessage('El nombre de usuario es requerido'),
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
    body('apellido').trim().notEmpty().withMessage('El apellido es requerido'),
    body('correo').trim().isEmail().withMessage('Correo electrónico inválido'),
    body('direccion').optional().trim(),
    body('password').optional().trim(),
    modificarPerfil
);

export default usuariosRouter;