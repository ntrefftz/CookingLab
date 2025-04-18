import express from 'express';
import asyncHandler from 'express-async-handler';
import { viewRecetasDetalle, viewRecetasLista, viewModificarReceta, eliminarReceta, modificarReceta, viewAniadirReceta, aniadirReceta,
    viewIngredientesLista, viewIngredientesDetalle, viewModificarIngrediente, eliminarIngrediente, modificarIngrediente, 
    viewAniadirIngrediente, aniadirIngrediente, buscarReceta
     
} from './controllers.js';

const recetasRouter = express.Router();

recetasRouter.get('/catalogo', asyncHandler(viewRecetasLista));
recetasRouter.get('/receta', asyncHandler(viewRecetasDetalle));
recetasRouter.get('/receta/modificar', asyncHandler(viewModificarReceta));
recetasRouter.get('/receta/eliminar', asyncHandler(eliminarReceta));
recetasRouter.post('/receta/modificar', asyncHandler(modificarReceta));
recetasRouter.get('/receta/aniadir', asyncHandler(viewAniadirReceta));
recetasRouter.post('/receta/aniadir', asyncHandler(aniadirReceta));


recetasRouter.get('/ingrediente', asyncHandler(viewIngredientesLista));
recetasRouter.get('/ingredienteInd', asyncHandler(viewIngredientesDetalle));
recetasRouter.get('/ingredienteInd/modificar',asyncHandler(viewModificarIngrediente));
recetasRouter.get('/ingredienteInd/eliminar', asyncHandler(eliminarIngrediente));
recetasRouter.post('/ingredienteInd/modificar', asyncHandler(modificarIngrediente));
recetasRouter.get('/ingredienteInd/aniadir',asyncHandler( viewAniadirIngrediente));
recetasRouter.post('/ingredienteInd/aniadir', asyncHandler(aniadirIngrediente));


recetasRouter.get('/buscarReceta', asyncHandler(buscarReceta));

export default recetasRouter;