import { body } from 'express-validator';
import express from 'express';
import {
    viewConfiguracion, viewHistorial, viewPerfil, viewMisRecetas, viewCalendario, viewLogin, doLogin, doLogout,
    viewRegister, doRegister, viewModificarPerfil, modificarPerfil, viewHome, aniadirRecetaACalendario, eliminarRecetaDeCalendario
} from './controllers.js';
import asyncHandler from 'express-async-handler';
const usuariosRouter = express.Router();


usuariosRouter.get('/configuracion', asyncHandler(viewConfiguracion));
usuariosRouter.get('/perfil', asyncHandler(viewPerfil));
usuariosRouter.get('/historial', asyncHandler(viewHistorial));
usuariosRouter.get('/misrecetas', asyncHandler(viewMisRecetas));
usuariosRouter.get('/micalendario', asyncHandler(viewCalendario));
usuariosRouter.get('/login', asyncHandler(viewLogin));
usuariosRouter.get('/perfil/modificar', asyncHandler(viewModificarPerfil));
usuariosRouter.get('/home', asyncHandler(viewHome));

usuariosRouter.post('/login',
    body('username', 'El nombre no puede ser vacío').trim().notEmpty(),
    body('password', 'La contraseña no puede ser vacía').trim().notEmpty(),
    asyncHandler(doLogin)
);

usuariosRouter.get('/logout', asyncHandler(doLogout));
usuariosRouter.get('/register',asyncHandler(viewRegister));

usuariosRouter.post('/register',
    body('username', 'Sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i),
    body('username', 'El usuario no puede ser vacío').trim().notEmpty(),
    body('nombre', 'El nombre no puede ser vacío').trim().notEmpty(),  //Asegura que el nombre no esté vacío
    body('password', 'La contraseña tiene que tener entre 6 y 10 caracteres').trim().isLength({ min: 6, max: 10 }),
    body('apellido').trim().notEmpty().withMessage('El apellido es requerido'),
    body('correo').trim().isEmail().withMessage('Correo electrónico inválido'),
    body('direccion').optional().trim(),
    asyncHandler(doRegister)
);

usuariosRouter.post('/perfil/modificar',
    body('username').trim().notEmpty().withMessage('El nombre de usuario es requerido'),
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
    body('apellido').trim().notEmpty().withMessage('El apellido es requerido'),
    body('correo').trim().isEmail().withMessage('Correo electrónico inválido'),
    body('direccion').optional().trim(),
    body('password').optional().trim(),
    asyncHandler(modificarPerfil)
);

//Para el calendario semanal del usuario
usuariosRouter.post('/calendario/aniadir', asyncHandler(aniadirRecetaACalendario));
usuariosRouter.post('/calendario/eliminar', asyncHandler(eliminarRecetaDeCalendario));


export default usuariosRouter;