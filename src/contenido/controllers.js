export function viewContenidoAdmin(req, res) {
    let contenido = 'paginas/noPermisos';
    if (req.session != null && req.session.login && req.session.nombre === 'Administrador') {
        contenido = 'paginas/admin';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function viewContacto(req, res) {
    let contenido = 'paginas/contacto';

    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function viewCondiciones(req, res) {
    let contenido = 'paginas/condiciones';

    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function viewConocenos(req, res) {
    let contenido = 'paginas/conocenos';

    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function viewCesta(req, res) {
    let contenido = 'paginas/cesta';

    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function viewCestaCompra(req, res) {
    let contenido = 'paginas/noPermisos';
    if (req.session != null && req.session.nombre != null) {
        contenido = 'paginas/cestaCompra';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
}