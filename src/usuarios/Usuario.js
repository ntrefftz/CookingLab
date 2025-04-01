
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
        this.#insertStmt = db.prepare('INSERT INTO Usuarios(username, password, nombre, apellido, correo, direccion, rol, activo) VALUES (@username, @password, @nombre, @apellido, @correo, @direccion, @rol, @activo)');
        this.#updateStmt = db.prepare('UPDATE Usuarios SET username = @username, password = @password, rol = @rol, nombre = @nombre, apellido = @apellido, correo = @correo, direccion = @direccion, activo = @activo WHERE id = @id');
    }

    static getUsuarioByUsername(username) {
        const usuario = this.#getByUsernameStmt.get({ username });
        console.log(usuario);
        if (usuario === undefined) throw new UsuarioNoEncontrado(username);
        const { password, nombre, apellido, correo, direccion, rol, activo, id } = usuario;
        console.log(usuario);
        console.log("Usuario creado en getUsuarioByUsername:", new Usuario(
            usuario.username, 
            usuario.password, 
            usuario.nombre, 
            usuario.apellido, 
            usuario.correo, 
            usuario.direccion, 
            usuario.rol,  // <-- Aquí debería imprimir 'A'
            usuario.activo, 
            usuario.id
        ));

        return new Usuario(username, password, nombre, apellido, correo, direccion, rol, activo, id);
    }

    static #insert(usuario) {
        let result = null;
        try {
            console.log('Insertando...');
            const username = usuario.#username;
            const password = usuario.#password;
            const nombre = usuario.nombre;
            const apellido = usuario.apellido;
            const correo = usuario.correo;
            const direccion = usuario.direccion;
            const rol = usuario.rol;
            const activo = usuario.activo;
            const id = usuario.id;
            const datos = { username, password, nombre, apellido, correo, direccion, rol, activo, id };

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
        const username = usuario.#username;
        const password = usuario.#password;
        const nombre = usuario.nombre;
        const apellido = usuario.apellido;
        const correo = usuario.correo;
        const direccion = usuario.direccion;
        const rol = usuario.rol;
        const activo = usuario.activo;
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
        // XXX: En el ej3 / P3 lo cambiaremos para usar async / await o Promises
        console.log(usuario.#password);
        console.log("Rol del usuario en login:", usuario.rol);

        if (!bcrypt.compareSync(password, usuario.#password)) throw new UsuarioOPasswordNoValido(username);
        
        /*let esAdmin;
        if (usuario.rol === RolesEnum.ADMIN) {
            esAdmin = true;
        } else {
            esAdmin = false;
        }*/

        return { 
            id: usuario.id, 
            username: usuario.username, 
            nombre: usuario.nombre, 
            esAdmin: usuario.rol === RolesEnum.ADMIN     
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
        //this.rol = rol;
        //this.rol = rol ?? RolesEnum.USUARIO; // Asegura que nunca sea undefined;
        //this.#rol = rol?.toString() || RolesEnum.USUARIO // Asegura que nunca sea undefined;
        this.#rol = rol.toString(); // Asegurarse que es string

        this.#id = id;
    }

    get rol() {
        return this.#rol;
    }

    get id() {
        return this.#id;
    }

    set password(nuevoPassword) {
        // XXX: En el ej3 / P3 lo cambiaremos para usar async / await o Promises
        //this.#password = bcrypt.hashSync(nuevoPassword);
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
        super(`Pruebe con otro correo electronico, Usuario: ${username}`, options);
        this.name = 'UsuarioYaExiste';
    }
}