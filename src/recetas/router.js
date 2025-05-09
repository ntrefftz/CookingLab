import express from 'express';
import asyncHandler from 'express-async-handler';
import { viewRecetasDetalle, viewRecetasLista, viewModificarReceta, eliminarReceta, modificarReceta, viewAniadirReceta, 
    aniadirReceta, aniadirRecetaCarrito, buscarReceta,
    viewIngredientesLista, viewIngredientesDetalle, viewModificarIngrediente, eliminarIngrediente, modificarIngrediente, 
    viewAniadirIngrediente, aniadirIngrediente, aniadirIngredienteCarrito, actualizarStock, viewGestionStock
     
} from './controllers.js';

const recetasRouter = express.Router();

recetasRouter.get('/catalogo', asyncHandler(viewRecetasLista));
recetasRouter.get('/receta', asyncHandler(viewRecetasDetalle));
recetasRouter.get('/receta/modificar', asyncHandler(viewModificarReceta));
recetasRouter.post('/receta/eliminar', asyncHandler(eliminarReceta));
recetasRouter.post('/receta/modificar', asyncHandler(modificarReceta));
recetasRouter.get('/receta/aniadir', asyncHandler(viewAniadirReceta));
recetasRouter.post('/receta/aniadir', asyncHandler(aniadirReceta));
recetasRouter.post('/receta/aniadirCarritoReceta', asyncHandler(aniadirRecetaCarrito));


recetasRouter.get('/ingrediente', asyncHandler(viewIngredientesLista));
recetasRouter.get('/ingredienteInd', asyncHandler(viewIngredientesDetalle));
recetasRouter.get('/ingredienteInd/modificar',asyncHandler(viewModificarIngrediente));
recetasRouter.post('/ingredienteInd/eliminar', asyncHandler(eliminarIngrediente));
recetasRouter.post('/ingredienteInd/modificar', asyncHandler(modificarIngrediente));
recetasRouter.get('/ingredienteInd/aniadir',asyncHandler( viewAniadirIngrediente));
recetasRouter.post('/ingredienteInd/aniadir', asyncHandler(aniadirIngrediente));
recetasRouter.post('/ingredienteInd/aniadirCarritoIng', asyncHandler(aniadirIngredienteCarrito));
recetasRouter.post('/ingrediente/actualizarStock', asyncHandler(actualizarStock));

recetasRouter.get('/buscarReceta', asyncHandler(buscarReceta));
recetasRouter.get('/stock', asyncHandler(viewGestionStock));

recetasRouter.post('/receta/aceptarSugerencia', asyncHandler(aceptarSugerenciaReceta));
recetasRouter.get('/sugerencias', asyncHandler(viewSugerencias));

export default recetasRouter;