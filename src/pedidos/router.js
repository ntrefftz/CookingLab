import { body } from 'express-validator';
import express from 'express';
import asyncHandler from 'express-async-handler';
import { autenticado} from '../middleware/auth.js';

import { viewCesta, viewCompraReceta, eliminarIngredienteDeCesta, aumentarIngredienteDeCesta, 
    tramitarPedido, viewConfirmarPedido, comprarPedido, cancelarPedido
 } from './controllers.js';

const pedidosRouter = express.Router();

pedidosRouter.get('/cesta', autenticado('/usuarios/login', '/cesta'), asyncHandler(viewCesta));
pedidosRouter.get('/compraReceta',autenticado('/usuarios/login', '/compraReceta'), asyncHandler(viewCompraReceta));
pedidosRouter.post('/cesta/eliminar', asyncHandler(eliminarIngredienteDeCesta));
pedidosRouter.post('/cesta/aumentar', asyncHandler(aumentarIngredienteDeCesta));

pedidosRouter.post('/tramitarPedido', asyncHandler(tramitarPedido));
pedidosRouter.get('/confirmarPedido', autenticado('/usuarios/login', '/confirmarPedido'), asyncHandler(viewConfirmarPedido));
pedidosRouter.post('/comprarPedido',  asyncHandler(comprarPedido));
pedidosRouter.post('/cancelarPedido', asyncHandler(cancelarPedido));

export default pedidosRouter;