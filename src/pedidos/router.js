import { body } from 'express-validator';
import express from 'express';

import { viewCesta, viewCompraReceta, eliminarIngredienteDeCesta, aumentarIngredienteDeCesta, 
    tramitarPedido, confirmarPedido, comprarPedido, cancelarPedido
 } from './controllers.js';
import asyncHandler from 'express-async-handler';
const pedidosRouter = express.Router();

pedidosRouter.get('/cesta', asyncHandler(viewCesta));
pedidosRouter.get('/compraReceta', asyncHandler(viewCompraReceta));
pedidosRouter.post('/cesta/eliminar', asyncHandler(eliminarIngredienteDeCesta));
pedidosRouter.post('/cesta/aumentar', asyncHandler(aumentarIngredienteDeCesta));

pedidosRouter.post('/tramitarPedido', asyncHandler(tramitarPedido));
pedidosRouter.get('/confirmarPedido', asyncHandler(confirmarPedido));
pedidosRouter.post('/comprarPedido', asyncHandler(comprarPedido));
pedidosRouter.post('/cancelarPedido', asyncHandler(cancelarPedido));

export default pedidosRouter;