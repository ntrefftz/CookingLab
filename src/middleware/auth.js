import { RolesEnum } from '../usuarios/Usuario.js';
export function autenticado(urlNoAutenticado = '/usuarios/login', urlAutenticado) {
    return (req, res, next) => {
        if (req.session != null && req.session.login) {
            return next();
        }
        else if (urlNoAutenticado != undefined) {
            return res.redirect(urlNoAutenticado);
        }
        next();
    }
}

export function tieneRol(rol1 = RolesEnum.U, rol2 = null) {
    return (req, res, next) => {
        if (req.session != null){
            if ((rol1 === RolesEnum.ADMIN ||rol2 === RolesEnum.ADMIN  ) && req.session.esAdmin) return next();
            else if (rol1 === RolesEnum.COCINERO ||rol2 === RolesEnum.COCINERO   && req.session.esCocinero) return next();
        }

        res.render('pagina', {
            contenido: 'paginas/noPermisos',
            session: req.session
        });
    }
}