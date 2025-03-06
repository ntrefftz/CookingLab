
import bcrypt from "bcryptjs";

export const RolesEnum = Object.freeze({
    USUARIO: 'U',
    ADMIN: 'A',
    COCINERO: 'C'
});

export class Usuario {
    static #getByUsernameStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;

    static initStatements(db) {
        if (this.#getByUsernameStmt !== null) return;
        this.#getByUsernameStmt = db.prepare('SELECT * FROM Usuarios WHERE username = @username');
        this.#insertStmt = db.prepare('INSERT INTO Usuarios(username, password, nombre, apellidos, correo, direccion, rol, activo ) VALUES (@username, @password, @nombre, @apellidos, @correo, @direccion, @rol, @activo )');
        this.#updateStmt = db.prepare('UPDATE Usuarios SET username = @username, password = @password, rol = @rol, nombre = @nombre, apellidos = @apellidos, direccion = @direccion, correo = @correo, activo = @activo WHERE id = @id');
    }

    static getUsuarioByUsername(username) {
        const usuario = this.#getByUsernameStmt.get({ username });
        if (usuario === undefined) throw new UsuarioNoEncontrado(username);

        const datos = { username, password, nombre, apellidos, correo, direccion, rol, activo } = usuario;

        return new Usuario(id, nombre, apellidos, username, password, rol, direccion, correo, activo);

    }

    static #insert(usuario) {
        let result = null;
        try { 
            
            const nombre = usuario.nombre;
            const apellidos = usuario.apellidos;
            const username = usuario.#username;
            const password = usuario.#password;
            const direccion = usuario.direccion;
            const correo = usuario.correo;
            const activo = usuario.activo
            const rol = usuario.rol;

            const datos = { username, password, nombre, apellidos, correo, direccion, rol, activo };
            result = this.#insertStmt.run(datos);

            usuario.#id = result.lastInsertRowid;
        } catch (e) { // SqliteError: https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#class-sqliteerror
            if (e.code === 'SQLITE_CONSTRAINT') {
                throw new UsuarioYaExiste(usuario.#username);
            }
            throw new ErrorDatos('No se ha insertado el usuario', { cause: e });
        }
        return usuario;
    }

    static #update(usuario) {


        const nombre = usuario.nombre;
        const apellidos = usuario.apellidos;
        const username = usuario.#username;
        const password = usuario.#password;
        const rol = usuario.rol;
        const direccion = usuario.direccion;
        const correo = usuario.correo;
        const activo = usuario.activo;

        const datos = { username, password, nombre, apellidos, correo, direccion, rol, activo };

        const result = this.#updateStmt.run(datos);
        if (result.changes === 0) throw new UsuarioNoEncontrado(username);

        return usuario;
    }

    static login(username, password) {
        let usuario = null;
        try {
            usuario = this.getUsuarioByUsername(username);
        } catch (e) {
            throw new UsuarioOPasswordNoValido(username, { cause: e });
        }

        // XXX: En el ej3 / P3 lo cambiaremos para usar async / await o Promises
        if (!bcrypt.compareSync(password, usuario.#password)) throw new UsuarioOPasswordNoValido(username);

        return usuario;
    }

    #id;
    nombre;
    apellidos;
    #username;
    #password;
    rol;
    direccion;
    correo;
    activo;

    constructor(id = null, nombre, apellidos, username, password, rol = RolesEnum.USUARIO, direccion, correo, activo = 0) {
        this.#id = id;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.#username = username;
        this.#password = password;
        this.rol = rol;
        this.direccion = direccion;
        this.correo = correo;
        this.activo = activo;
    }

    get id() {
        return this.#id;
    }

    set password(nuevoPassword) {
        // XXX: En el ej3 / P3 lo cambiaremos para usar async / await o Promises
        this.#password = bcrypt.hashSync(nuevoPassword);
    }

    get username() {
        return this.#username;
    }

    persist() {
        if (this.#id === null) return Usuario.#insert(this);
        return Usuario.#update(this);
    }
}

export class UsuarioNoEncontrado extends Error {
    /**
     * 
     * @param {string} username 
     * @param {ErrorOptions} [options]
     */
    constructor(username, options) {
        super(`Usuario no encontrado: ${username}`, options);
        this.name = 'UsuarioNoEncontrado';
    }
}

export class UsuarioOPasswordNoValido extends Error {
    /**
     * 
     * @param {string} username 
     * @param {ErrorOptions} [options]
     */
    constructor(username, options) {
        super(`Usuario o password no válido: ${username}`, options);
        this.name = 'UsuarioOPasswordNoValido';
    }
}


export class UsuarioYaExiste extends Error {
    /**
     * 
     * @param {string} username 
     * @param {ErrorOptions} [options]
     */
    constructor(username, options) {
        super(`Usuario ya existe: ${username}`, options);
        this.name = 'UsuarioYaExiste';
    }
}