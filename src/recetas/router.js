import express from 'express';
import { viewRecetasDetalle, viewRecetasLista, viewModificarReceta } from './controllers.js';

const recetasRouter = express.Router();

recetasRouter.get('/catalogo', viewRecetasLista);
recetasRouter.get('/receta/:id', viewRecetasDetalle);
recetasRouter.get('/modificar', viewModificarReceta);

export default recetasRouter;