import express from 'express';
import asyncHandler from 'express-async-handler';
import { autenticado } from '../middleware/auth.js';
import { viewIndex, viewCesta, viewCompraReceta, viewContacto, viewCondiciones, viewConocenos } from './controllers.js';

const contenidoRouter = express.Router();

contenidoRouter.get('/', viewIndex);

contenidoRouter.get('/contacto',  asyncHandler(viewContacto));
contenidoRouter.get('/condiciones',  asyncHandler(viewCondiciones));
contenidoRouter.get('/conocenos',  asyncHandler(viewConocenos));
//contenidoRouter.get('/cesta', autenticado('usuarios/login', '/cesta'), asyncHandler(viewCesta));
contenidoRouter.get('/compraReceta', autenticado('usuarios/login', '/compraReceta'), asyncHandler(viewCompraReceta));

export default contenidoRouter;