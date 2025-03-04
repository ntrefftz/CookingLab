import express from 'express';
import { viewContenidoAdmin, viewContenidoNormal, viewContacto } from './controllers.js';

const contenidoRouter = express.Router();

contenidoRouter.get('/normal', viewContenidoNormal);

contenidoRouter.get('/admin', viewContenidoAdmin);

contenidoRouter.get('/contacto', viewContacto);

export default contenidoRouter;