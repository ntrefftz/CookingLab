/*
https://www.digitalocean.com/community/tutorials/nodejs-express-basics
https://www.digitalocean.com/community/tutorials/how-to-use-ejs-to-template-your-node-application
https://ejs.co/
https://expressjs.com/en/starter/hello-world.html
https://appsupport.academy/play-by-play-nodejs-express-sessions-storage-configuration
*/
import express from 'express';
import session from 'express-session';
import { config } from './config.js';
import usuariosRouter from './usuarios/router.js';
import contenidoRouter from './contenido/router.js';
import recetasRouter from './recetas/router.js';

//Modificacion para Flash
import { flashMessages } from './middleware/flash.js';

export const app = express();

app.set('view engine', 'ejs');
app.set('views', config.vistas);

app.use(express.urlencoded({ extended: false }));
app.use(session(config.session));

//Modificacion para Flash
app.use(flashMessages);

app.use('/', express.static(config.recursos));
app.use('/', contenidoRouter);
app.use('/usuarios', usuariosRouter);
app.use('/contenido', contenidoRouter);
app.use('/recetas', recetasRouter);
