import express from 'express';
import { viewRecetasDetalle, viewRecetasLista, viewModificarReceta, eliminarReceta, modificarReceta } from './controllers.js';

const recetasRouter = express.Router();

recetasRouter.get('/catalogo', viewRecetasLista);
recetasRouter.get('/receta', viewRecetasDetalle);
recetasRouter.get('/receta/modificar', viewModificarReceta);
recetasRouter.get('/receta/eliminar', eliminarReceta);
recetasRouter.post('/receta/modificar', modificarReceta);

export default recetasRouter;