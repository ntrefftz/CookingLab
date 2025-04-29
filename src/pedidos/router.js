import { body } from 'express-validator';
import express from 'express';

import { viewCesta, viewCompraReceta, eliminarIngredienteDeCesta, aumentarIngredienteDeCesta } from './controllers.js';
import asyncHandler from 'express-async-handler';
const pedidosRouter = express.Router();

pedidosRouter.get('/cesta', asyncHandler(viewCesta));
pedidosRouter.get('/compraReceta', asyncHandler(viewCompraReceta));
pedidosRouter.post('/cesta/eliminar', asyncHandler(eliminarIngredienteDeCesta));
pedidosRouter.post('/cesta/aumentar', asyncHandler(aumentarIngredienteDeCesta));

export default pedidosRouter;