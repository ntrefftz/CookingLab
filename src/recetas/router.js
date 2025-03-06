import express from 'express';
import { viewRecetasDetalle, viewRecetasLista, viewModificarReceta, eliminarReceta, modificarReceta, 
    viewIngredientesLista, viewIngredientesDetalle, viewModificarIngrediente, eliminarIngrediente, modificarIngrediente
 } from './controllers.js';

const recetasRouter = express.Router();

recetasRouter.get('/catalogo', viewRecetasLista);
recetasRouter.get('/receta', viewRecetasDetalle);
recetasRouter.get('/receta/modificar', viewModificarReceta);
recetasRouter.get('/receta/eliminar', eliminarReceta);
recetasRouter.post('/receta/modificar', modificarReceta);

recetasRouter.get('/ingrediente', viewIngredientesLista);
recetasRouter.get('/ingredienteInd', viewIngredientesDetalle);
recetasRouter.get('/ingredienteInd/modificar', viewModificarIngrediente);
recetasRouter.get('/ingredienteInd/eliminar', eliminarIngrediente);
recetasRouter.post('/ingredienteInd/modificar', modificarIngrediente);

export default recetasRouter;