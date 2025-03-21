import {body} from 'express-validator';
import express from 'express';
import { viewLogin, doLogin, doLogout, viewRegister, doRegister } from './controllers.js';

const usuariosRouter = express.Router();

usuariosRouter.get('/login', viewLogin);
//usuariosRouter.post('/login', doLogin);

usuariosRouter.post('/login', 
    body('username', 'El nombre no puede ser vacío').trim().notEmpty(),
    body('password', 'La contraseña no puede ser vacía').trim().notEmpty(),
    doLogin
);

usuariosRouter.get('/logout', doLogout);
usuariosRouter.get('/logout', doLogout);
usuariosRouter.get('/register', viewRegister);

//usuariosRouter.post('/register', doRegister);
usuariosRouter.post('/register', 
    body('username', 'Sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i),
    body('username', 'El usuario no puede ser vacío').trim().notEmpty(),
    body('nombre', 'El nombre no puede ser vacío').trim().notEmpty(),  //Asegura que el nombre no esté vacío
    body('password', 'La contraseña tiene que tener entre 6 y 10 caracteres').trim().isLength({ min: 6, max: 10 }),
    doRegister
);
export default usuariosRouter;