import { body } from 'express-validator';
import express from 'express';

import { viewCesta, viewCompraReceta } from './controllers.js';
import asyncHandler from 'express-async-handler';
const pedidosRouter = express.Router();

pedidosRouter.get('/cesta', asyncHandler(viewCesta));
pedidosRouter.get('/compraReceta', asyncHandler(viewCompraReceta));

export default pedidosRouter;