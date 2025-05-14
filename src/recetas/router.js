import express from 'express';
import { config } from '../config.js';
import multer from 'multer';
import asyncHandler from 'express-async-handler';
import { autenticado, tieneRol } from '../middleware/auth.js';
import { body } from 'express-validator';

import {
    viewRecetasDetalle, viewRecetasLista, viewModificarReceta, eliminarReceta, modificarReceta, viewAniadirReceta,
    aniadirReceta, aniadirRecetaCarrito, buscarReceta,
    viewIngredientesLista, viewIngredientesDetalle, viewModificarIngrediente, eliminarIngrediente, modificarIngrediente,
    viewAniadirIngrediente, aniadirIngrediente, aniadirIngredienteCarrito, actualizarStock, viewGestionStock, jsonRecetas, viewCalendarioRecetaDiaria,
    aniadirRecetaDiaria, getRecetaDiariaPorDia, jsonRecetaDiaria, getRecetaPorID, aceptarSugerenciaReceta, viewSugerencias, viewImagen

} from './controllers.js';

const recetasRouter = express.Router();

const upload = multer({ dest: config.uploads });
recetasRouter.get('/catalogo', asyncHandler(viewRecetasLista));
recetasRouter.get('/receta', asyncHandler(viewRecetasDetalle));
recetasRouter.get('/receta/modificar', autenticado('/usuarios/login', '/compraReceta'), tieneRol("A"), asyncHandler(viewModificarReceta));
recetasRouter.post('/receta/eliminar', asyncHandler(eliminarReceta));
recetasRouter.post('/receta/modificar', upload.single('foto'),
    body('nombre', 'Sólo puede contener letras').trim().matches(/^[A-Z]*$/i),
    body('tiempo_prep_segs', 'Solo puede ser un numero').trim().notEmpty().matches(/^[0-9]*$/i),
    body('dificultad', 'Debe de ser un valor entre 1 y 5 ').trim().notEmpty().matches(/^[0-5]*$/i),  //Asegura que el nombre no esté vacío
    body('descripción', 'No puede ser un texto vacío').trim().notEmpty(),
    asyncHandler(modificarReceta));
recetasRouter.get('/receta/aniadir', autenticado('/usuarios/login', '/aniadir'), tieneRol("A", "C"), asyncHandler(viewAniadirReceta));
recetasRouter.post('/receta/aniadir', upload.single('foto'),
    body('nombre', 'Sólo puede contener números y letras').trim().matches(/^[A-Z]*$/i),
    body('tiempo_prep_segs', 'Solo puede ser un numero').trim().notEmpty().matches(/^[0-9]*$/i),
    body('dificultad', 'Debe de ser un valor entre 1 y 5 ').trim().notEmpty().matches(/^[1-5]*$/i),  //Asegura que el nombre no esté vacío
    body('descripción', 'No puede ser un texto vacío').trim().notEmpty(),
    asyncHandler(aniadirReceta));
recetasRouter.post('/receta/aniadirCarritoReceta', asyncHandler(aniadirRecetaCarrito));


recetasRouter.get('/ingrediente', asyncHandler(viewIngredientesLista));

recetasRouter.get('/ingredienteInd', asyncHandler(viewIngredientesDetalle));

recetasRouter.get('/ingredienteInd/modificar', autenticado('/usuarios/login', '/ingredienteInd/modificar'), tieneRol("A"), asyncHandler(viewModificarIngrediente));

recetasRouter.post('/ingredienteInd/eliminar', asyncHandler(eliminarIngrediente));
recetasRouter.post('/ingredienteInd/modificar', upload.single('foto'),
    // body('nombre', 'Sólo puede contener letras').trim().matches(/^[A-Z]*$/i), intentada validación con express, redirige automáticamente a aniadirReceta()
    // body('categoria', 'Solo puede ser un numero').trim().notEmpty().matches(/^[0-9]*$/i),
    // body('precio', 'Solo puede ser un numero').trim().notEmpty().matches(/^[0-9]*$/i),
    // body('stock', 'Solo puede ser un numero').trim().notEmpty().matches(/^[0-9]*$/i), asyncHandler(aniadirReceta),
    // body('unidad_medida', 'No puede ser blanco').trim().notEmpty().matches(/^[A-Z0-9]*$/i), asyncHandler(aniadirReceta),
    asyncHandler(modificarIngrediente));
recetasRouter.get('/ingredienteInd/aniadir', autenticado('/usuarios/login', '/ingredienteInd/aniadir'), tieneRol("A", "C"), asyncHandler(viewAniadirIngrediente));
recetasRouter.post('/ingredienteInd/aniadir', upload.single('foto'),
    // body('nombre', 'Sólo puede contener letras').trim().matches(/^[A-Z]*$/i),
    // body('categoria', 'Solo puede ser un numero').trim().notEmpty().matches(/^[0-9]*$/i),
    // body('precio', 'Solo puede ser un numero').trim().notEmpty().matches(/^[0-9]*$/i),
    // body('stock', 'Solo puede ser un numero').trim().notEmpty().matches(/^[0-9]*$/i), asyncHandler(aniadirReceta),
    // body('unidad_medida', 'No puede ser blanco').trim().notEmpty().matches(/^[A-Z0-9]*$/i), asyncHandler(aniadirReceta),
    // body('stock', 'Solo puede ser un numero').trim().notEmpty().matches(/^[0-9]*$/i), asyncHandler(aniadirReceta),
    asyncHandler(aniadirIngrediente));
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
recetasRouter.get('/sugerencias', autenticado('/usuarios/login', '/ingredienteInd/aniadir'), tieneRol("A", "C"), asyncHandler(viewSugerencias));

recetasRouter.get("/imagen/:id", viewImagen);
export default recetasRouter;