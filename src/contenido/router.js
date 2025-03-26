import express from 'express';
import { viewIndex, viewContenidoAdmin, viewCesta, viewCestaCompra, viewContacto, viewCondiciones, viewConocenos } from './controllers.js';

const contenidoRouter = express.Router();

contenidoRouter.get('/', viewIndex);
contenidoRouter.get('/admin', viewContenidoAdmin);
contenidoRouter.get('/contacto', viewContacto);
contenidoRouter.get('/condiciones', viewCondiciones);
contenidoRouter.get('/conocenos', viewConocenos);
contenidoRouter.get('/cesta', viewCesta);
contenidoRouter.get('/cestaCompra', viewCestaCompra);

export default contenidoRouter;