import express from 'express';
import { viewContenidoAdmin, viewContenidoNormal, viewContacto, viewCondiciones } from './controllers.js';

const contenidoRouter = express.Router();

contenidoRouter.get('/normal', viewContenidoNormal);
contenidoRouter.get('/admin', viewContenidoAdmin);
contenidoRouter.get('/contacto', viewContacto);
contenidoRouter.get('/condiciones', viewCondiciones);

export default contenidoRouter;