
import bcrypt from "bcryptjs";
import { logger } from '../logger.js';


export const RolesEnum = Object.freeze({
    USUARIO: 'U',
    ADMIN: 'A',
    COCINERO: 'C'
});

export class Usuario {
    static #getByIdStmt = null;
    static #getByUsernameStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #getAllStmt = null;
    static #deleteStmt = null;

    static initStatements(db) {
        if (this.#getByIdStmt !== null) return;
        if (this.#getByUsernameStmt !== null) return;

        this.#getByIdStmt = db.prepare('SELECT * FROM Usuarios WHERE id = @id');
        this.#getByUsernameStmt = db.prepare('SELECT * FROM Usuarios WHERE username = @username');
        this.#insertStmt = db.prepare('INSERT INTO Usuarios(username, password, nombre, apellido, correo, direccion, rol, activo) VALUES (@username, @password, @nombre, @apellido, @correo, @direccion, @rol, @activo)');
        this.#getAllStmt = db.prepare('SELECT * FROM Usuarios');
        this.#updateStmt = db.prepare('UPDATE Usuarios SET username = @username, password = @password, rol = @rol, nombre = @nombre, apellido = @apellido, correo = @correo, direccion = @direccion, activo = @activo WHERE id = @id');
        this.#deleteStmt = db.prepare('DELETE FROM Usuarios WHERE id = @id');
    }

    static getUsuarioById(id) {
        const usuario = this.#getByIdStmt.get({ id });
        if (!usuario) throw new UsuarioNoEncontrado(id);
        return usuario;
    }

    static cambiarPermisos(id, rol) {
        let usuario = null;
        try {
            usuario = this.#getByIdStmt.get({ id });
            if (!usuario) throw new UsuarioNoEncontrado(id);
            usuario.rol = rol;
            usuario = this.#update(usuario);
        } catch (e) {
            throw new UsuarioNoEncontrado(id, { cause: e });
        }
        return usuario;
    }

    static editarUsuario(usuario) {
        try {
            usuario = this.#update(usuario);
        } catch (e) {
            throw new UsuarioYaExiste(username, { cause: e });
        }
        return usuario;

    }

    static borrarUsuario(id) {
        const usuario = this.#getByIdStmt.get({ id });
        if (!usuario) throw new UsuarioNoEncontrado(id);

        const datosActualizados = {
            id: usuario.id,
            username: usuario.username,
            password: usuario.password,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo,
            direccion: usuario.direccion,
            rol: usuario.rol,
            activo: 0
        };

        const result = this.#updateStmt.run(datosActualizados);

        if (result.changes === 0) throw new UsuarioNoEncontrado(id);
        return { mensaje: "Cuenta desactivada correctamente" };
    }
    static activarUsuario(id) {
        const usuario = this.#getByIdStmt.get({ id });
        if (!usuario) throw new UsuarioNoEncontrado(id);

        const datosActualizados = {
            id: usuario.id,
            username: usuario.username,
            password: usuario.password,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo,
            direccion: usuario.direccion,
            rol: usuario.rol,
            activo: 1  
        };

        const result = this.#updateStmt.run(datosActualizados);

        if (result.changes === 0) throw new UsuarioNoEncontrado(id);
        return { mensaje: "Cuenta activada correctamente" };
    }

    static getUsuarioByUsername(username) {
        const usuario = this.#getByUsernameStmt.get({ username });
        logger.debug('GetUsuarioByUsername:', usuario);

        if (usuario === undefined) throw new UsuarioNoEncontrado(username);
        const { password, nombre, apellido, correo, direccion, rol, activo, id } = usuario;

        return new Usuario(username, password, nombre, apellido, correo, direccion, rol, activo, id);
    }

    static #insert(usuario) {
        let result = null;
        try {
            logger.debug('Insertando...:', usuario);
            const username = usuario.#username;
            const password = usuario.#password;
            const nombre = usuario.nombre;
            const apellido = usuario.apellido;
            const correo = usuario.correo;
            const direccion = usuario.direccion;
            const rol = usuario.rol;
            const activo = usuario.activo;
            const datos = { username, password, nombre, apellido, correo, direccion, rol, activo };

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
        const username = usuario.username;
        const nombre = usuario.nombre;
        const apellido = usuario.apellido;
        const correo = usuario.correo;
        const direccion = usuario.direccion;
        const activo = usuario.activo;
        const id = usuario.id;
        const password = usuario.password;
        const rol = usuario.rol;
        const datos = { username, password, nombre, apellido, correo, direccion, rol, activo, id };

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

        if (usuario.activo === 0) {
            throw new UsuarioOPasswordNoValido(username, { cause: 'Cuenta desactivada' });
        }

        if (!bcrypt.compareSync(password, usuario.#password)) throw new UsuarioOPasswordNoValido(username);

        return {
            id: usuario.id,
            username: usuario.username,
            nombre: usuario.nombre,
            esAdmin: usuario.rol === RolesEnum.ADMIN,
            esCocinero: usuario.rol === RolesEnum.COCINERO,
            rol: usuario.rol
        };
    }

    static register(username, password, nombre, apellido, correo, direccion) {
        let usuario = null;
        try {
            usuario = new Usuario(username, bcrypt.hashSync(password), nombre, apellido, correo, direccion);
            usuario = this.#insert(usuario);
        } catch (e) {
            throw new UsuarioYaExiste(username, { cause: e });
        }


        return usuario;
    }

    static getAllUsuarios() {
        const usuarios = this.#getAllStmt.all();
        if (!usuarios) throw new UsuarioNoEncontrado(id);
        return usuarios;
    }

    #id;
    #username;
    #password;
    nombre;
    apellido;
    correo;
    direccion;
    #rol;
    activo;

    constructor(username, password, nombre, apellido, correo, direccion, rol = RolesEnum.USUARIO, activo = 1, id = null) {
        this.#username = username;
        this.#password = password;
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
        this.direccion = direccion;
        this.activo = activo;
        this.#rol = rol.toString(); 

        this.#id = id;
    }
    get password() {
        return this.#password;
    }
    get rol() {
        return this.#rol;
    }

    get id() {
        return this.#id;
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