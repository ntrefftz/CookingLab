import express from 'express';
import { viewRecetasDetalle, viewRecetasLista, viewModificarRecetas } from './controllers.js';

const recetasRouter = express.Router();

recetasRouter.get('/catalogo', viewRecetasLista);
recetasRouter.get('/receta/:id', viewRecetasDetalle);
recetasRouter.get('/modificar', viewModificarRecetas);

export default recetasRouter;