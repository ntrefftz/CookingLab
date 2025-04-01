import express from 'express';
import { viewRecetasDetalle, viewRecetasLista, viewModificarReceta, eliminarReceta, modificarReceta, viewAniadirReceta, aniadirReceta,
    viewIngredientesLista, viewIngredientesDetalle, viewModificarIngrediente, eliminarIngrediente, modificarIngrediente, 
    //viewAniadirIngrediente, aniadirIngrediente
    viewAniadirIngrediente, aniadirIngrediente, buscarReceta
     
} from './controllers.js';

const recetasRouter = express.Router();

recetasRouter.get('/catalogo', viewRecetasLista);
recetasRouter.get('/receta', viewRecetasDetalle);
recetasRouter.get('/receta/modificar', viewModificarReceta);
recetasRouter.get('/receta/eliminar', eliminarReceta);
recetasRouter.post('/receta/modificar', modificarReceta);
recetasRouter.get('/receta/aniadir', viewAniadirReceta);
recetasRouter.post('/receta/aniadir', aniadirReceta);


recetasRouter.get('/ingrediente', viewIngredientesLista);
recetasRouter.get('/ingredienteInd', viewIngredientesDetalle);
recetasRouter.get('/ingredienteInd/modificar', viewModificarIngrediente);
recetasRouter.get('/ingredienteInd/eliminar', eliminarIngrediente);
recetasRouter.post('/ingredienteInd/modificar', modificarIngrediente);
recetasRouter.get('/ingredienteInd/aniadir', viewAniadirIngrediente);
recetasRouter.post('/ingredienteInd/aniadir', aniadirIngrediente);


recetasRouter.get('/buscarReceta', buscarReceta);

export default recetasRouter;