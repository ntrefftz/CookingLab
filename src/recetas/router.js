import express from 'express';
import { config } from '../config.js';
import multer from 'multer';
import asyncHandler from 'express-async-handler';
import { autenticado, tieneRol} from '../middleware/auth.js';

import { viewRecetasDetalle, viewRecetasLista, viewModificarReceta, eliminarReceta, modificarReceta, viewAniadirReceta, 
    aniadirReceta, aniadirRecetaCarrito, buscarReceta,
    viewIngredientesLista, viewIngredientesDetalle, viewModificarIngrediente, eliminarIngrediente, modificarIngrediente,
    viewAniadirIngrediente, aniadirIngrediente, aniadirIngredienteCarrito, actualizarStock, viewGestionStock, jsonRecetas, viewCalendarioRecetaDiaria,
    aniadirRecetaDiaria, getRecetaDiariaPorDia, jsonRecetaDiaria, getRecetaPorID,     aceptarSugerenciaReceta, viewSugerencias, viewImagen

} from './controllers.js';

const recetasRouter = express.Router();

const upload = multer({ dest: config.uploads });
recetasRouter.get('/catalogo', asyncHandler(viewRecetasLista));
recetasRouter.get('/receta', asyncHandler(viewRecetasDetalle));
recetasRouter.get('/receta/modificar' ,autenticado('/usuarios/login', '/compraReceta'), tieneRol("A"), asyncHandler(viewModificarReceta));
recetasRouter.post('/receta/eliminar', asyncHandler(eliminarReceta));
recetasRouter.post('/receta/modificar', upload.single('foto'), asyncHandler(modificarReceta));
recetasRouter.get('/receta/aniadir', autenticado('/usuarios/login', '/aniadir'), tieneRol("A", "C"), asyncHandler(viewAniadirReceta));
recetasRouter.post('/receta/aniadir',  upload.single('foto'), asyncHandler(aniadirReceta));
recetasRouter.post('/receta/aniadirCarritoReceta', asyncHandler(aniadirRecetaCarrito));


recetasRouter.get('/ingrediente', asyncHandler(viewIngredientesLista));

recetasRouter.get('/ingredienteInd', asyncHandler(viewIngredientesDetalle));

recetasRouter.get('/ingredienteInd/modificar',autenticado('/usuarios/login', '/ingredienteInd/modificar'), tieneRol("A"), asyncHandler(viewModificarIngrediente));

recetasRouter.post('/ingredienteInd/eliminar', asyncHandler(eliminarIngrediente));
recetasRouter.post('/ingredienteInd/modificar', upload.single('foto'), asyncHandler(modificarIngrediente));
recetasRouter.get('/ingredienteInd/aniadir', autenticado('/usuarios/login', '/ingredienteInd/aniadir'), tieneRol("A", "C"), asyncHandler( viewAniadirIngrediente));
recetasRouter.post('/ingredienteInd/aniadir', upload.single('foto'), asyncHandler(aniadirIngrediente));
recetasRouter.post('/ingredienteInd/aniadirCarritoIng', asyncHandler(aniadirIngredienteCarrito));
recetasRouter.post('/ingrediente/actualizarStock', asyncHandler(actualizarStock));

recetasRouter.get('/calendarioRecetaDiaria', autenticado('/usuarios/login', '/calendarioRecetaDiaria'), tieneRol("A"), asyncHandler(viewCalendarioRecetaDiaria));
recetasRouter.get('/buscarReceta', asyncHandler(buscarReceta));
recetasRouter.get('/stock', autenticado('/usuarios/login', '/stock'), tieneRol("A"), asyncHandler(viewGestionStock));
recetasRouter.post('/recetaPorFecha', asyncHandler(getRecetaDiariaPorDia));
recetasRouter.post('/aniadirRecetaDiaria', asyncHandler(aniadirRecetaDiaria));
recetasRouter.get('/obtenerRecetasCalendario', asyncHandler(jsonRecetaDiaria));
recetasRouter.post('/obtenerRecetas', asyncHandler(jsonRecetas));
recetasRouter.get('/getReceta/:id', asyncHandler(getRecetaPorID));

recetasRouter.post('/receta/aceptarSugerencia', asyncHandler(aceptarSugerenciaReceta));
recetasRouter.get('/sugerencias',autenticado('/usuarios/login', '/ingredienteInd/aniadir'), tieneRol("A", "C"), asyncHandler(viewSugerencias));

recetasRouter.get("/imagen/:id", viewImagen);
export default recetasRouter;