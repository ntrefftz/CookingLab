import { body } from 'express-validator';
import express from 'express';
import { autenticado, tieneRol } from '../middleware/auth.js';
import {
    viewConfiguracion, viewHistorial, viewPerfil, viewMisRecetas, viewCalendario, viewLogin, doLogin, doLogout,
    viewRegister, doRegister, viewModificarPerfil, modificarPerfil, viewHome, viewListaUsuario, cambiarPermisos,
    eliminarPerfilUsuario, eliminarPerfilAdmin, aniadirRecetaACalendario, activarUsuario, eliminarRecetaDeCalendario, aniadirRecetaAFavoritos, eliminarRecetaDeFavoritos, viewSugerencias
}
    from './controllers.js';
import asyncHandler from 'express-async-handler';
const usuariosRouter = express.Router();

usuariosRouter.get('/configuracion', autenticado("/usuarios/login", "configuracion"), asyncHandler(viewConfiguracion));
usuariosRouter.get('/perfil', autenticado("/usuarios/login", "/perfil"), asyncHandler(viewPerfil));
usuariosRouter.get('/historial', autenticado("/usuarios/login", "/historial"), asyncHandler(viewHistorial));
usuariosRouter.get('/misrecetas', autenticado("/usuarios/login", "/misrecetas"), asyncHandler(viewMisRecetas));
usuariosRouter.get('/micalendario', autenticado("/usuarios/login", "/micalendario"), asyncHandler(viewCalendario));
usuariosRouter.get('/login', autenticado(null), asyncHandler(viewLogin));
usuariosRouter.get('/perfil/modificar', autenticado("/usuarios/login", "/perfil/modificar"), asyncHandler(viewModificarPerfil));
usuariosRouter.get('/home', autenticado('/usuarios/home'), asyncHandler(viewHome));
usuariosRouter.get('/listaUsuarios', autenticado("/usuarios/login", "configuracion"), tieneRol("A"), asyncHandler(viewListaUsuario));
usuariosRouter.post('/login',
    body('username', 'El nombre no puede ser vacío').trim().notEmpty(),
    body('password', 'La contraseña no puede ser vacía').trim().notEmpty(),
    asyncHandler(doLogin)
);

usuariosRouter.get('/logout', asyncHandler(doLogout));
usuariosRouter.get('/register', autenticado(null, '/usuarios/home'), asyncHandler(viewRegister));
usuariosRouter.get('/sugerencias', autenticado("/usuarios/login", "configuracion"), tieneRol("A", "C"), asyncHandler(viewSugerencias));

usuariosRouter.post('/register',
    body('username', 'Sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i),
    body('username', 'El usuario no puede ser vacío').trim().notEmpty(),
    body('nombre', 'El nombre no puede ser vacío').trim().notEmpty(),  
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
usuariosRouter.post('/cambiarPermisos/:id', asyncHandler(cambiarPermisos));
usuariosRouter.post('/eliminarUsuario', autenticado("/usuarios/login", "/eliminarUsuario"), asyncHandler(eliminarPerfilUsuario));
usuariosRouter.post('/eliminarUsuarioAdmin', autenticado("/usuarios/login", "/eliminarUsuarioAdmin"), tieneRol("A"), asyncHandler(eliminarPerfilAdmin));
usuariosRouter.post('/activarUsuario', autenticado("/usuarios/login", "/activarUsuario"), tieneRol("A"), asyncHandler(activarUsuario));

//Para el calendario semanal del usuario
usuariosRouter.post('/calendario/aniadir', asyncHandler(aniadirRecetaACalendario));
usuariosRouter.post('/calendario/eliminar', asyncHandler(eliminarRecetaDeCalendario));

usuariosRouter.post('/favoritos/aniadir', asyncHandler(aniadirRecetaAFavoritos));
usuariosRouter.post('/favoritos/eliminar', asyncHandler(eliminarRecetaDeFavoritos));

export default usuariosRouter;