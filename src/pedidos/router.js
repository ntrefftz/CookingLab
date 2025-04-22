import express from 'express';
import { viewCesta, viewCompraReceta } from './controllers.js';

const pedidosRouter = express.Router();

pedidosRouter.get('/cesta', viewCesta);
pedidosRouter.get('/compraReceta', viewCompraReceta);

export default pedidosRouter;