export class Receta {
    static #getByIdStmt = null;
    static #getByUsuarioStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;
    static #getAllStmt = null;

    static #searchByNameStmt = null;
    static #searchByIngredientStmt = null;
    static #getAllNact = null;
    static #activarRecetaStmt = null;

    static initStatements(db) {
        if (this.#getByIdStmt !== null) return;

        this.#getByIdStmt = db.prepare('SELECT * FROM Recetas WHERE id = @id');
        this.#getByUsuarioStmt = db.prepare('SELECT * FROM Recetas WHERE id_usuario = @id_usuario AND activo = 1');
        this.#insertStmt = db.prepare('INSERT INTO Recetas(nombre, descripcion, tiempo_prep_segs, dificultad, id_usuario, activo, imagen_url, imagen_url) VALUES (@nombre, @descripcion, @tiempo_prep_segs, @dificultad, @id_usuario, @activo, @imagen_url, @imagen_url)');
        this.#updateStmt = db.prepare('UPDATE Recetas SET nombre = @nombre, descripcion = @descripcion, tiempo_prep_segs = @tiempo_prep_segs, dificultad = @dificultad, activo = @activo, imagen_url = @imagen_url, imagen_url = @imagen_url WHERE id = @id');
        this.#deleteStmt = db.prepare('DELETE FROM Recetas WHERE id = @id');
        this.#getAllStmt = db.prepare('SELECT * FROM Recetas WHERE activo = 1');
        this.#getAllNact = db.prepare('SELECT * FROM Recetas WHERE activo = 0');
        this.#activarRecetaStmt = db.prepare('UPDATE Recetas SET activo = 1 WHERE id = @id');

        this.#searchByNameStmt = db.prepare('SELECT * FROM Recetas WHERE nombre LIKE @nombre AND activo = 1');
        this.#searchByIngredientStmt = db.prepare(`
            SELECT DISTINCT R.* 
            FROM Recetas R
            JOIN tiene T ON R.id = T.id_receta
            JOIN Ingredientes I ON T.id_ingrediente = I.id
            WHERE I.nombre LIKE '%' || @ingrediente || '%' COLLATE NOCASE
            AND R.activo = 1
        `);
    }

    static getRecetaById(id) {
        const receta = this.#getByIdStmt.get({ id });
        if (!receta) throw new RecetaNoEncontrada(id);

        return new Receta(
            receta.id,
            receta.nombre,
            receta.descripcion,
            receta.tiempo_prep_segs,
            receta.dificultad,
            receta.id_usuario,
            receta.activo,
            receta.imagen_url
        );
    }

    static getRecetasByUsuario(id_usuario) {
        const recetas = this.#getByUsuarioStmt.all({ id_usuario });

        return recetas.map(receta => new Receta(
            receta.id,
            receta.nombre,
            receta.descripcion,
            receta.tiempo_prep_segs,
            receta.dificultad,
            receta.id_usuario,
            receta.activo,
            receta.imagen_url
        ));
    }

    static getAllRecetas() {
        const recetas = this.#getAllStmt.all();

        return recetas.map(receta => new Receta(
            receta.id,
            receta.nombre,
            receta.descripcion,
            receta.tiempo_prep_segs,
            receta.dificultad,
            receta.id_usuario,
            receta.activo,
            receta.imagen_url
        ));
    }

    static getAllRecetasNact() {
        const recetas = this.#getAllNact.all();

        return recetas.map(receta => new Receta(
            receta.id,
            receta.nombre,
            receta.descripcion,
            receta.tiempo_prep_segs,
            receta.dificultad,
            receta.id_usuario,
            receta.activo,
            receta.imagen_url
        ));
    }

    static addReceta(nombre, descripcion, tiempo_prep_segs, dificultad, id_usuario, activo = 1, imagen_url) {
        try {
            const result = this.#insertStmt.run({ nombre, descripcion, tiempo_prep_segs, dificultad, id_usuario, activo, imagen_url });
            return result;
        } catch (e) {
            throw new ErrorDatos("No se pudo añadir la receta", { cause: e });
        }
    }

    static updateReceta(id, nombre, descripcion, tiempo_prep_segs, dificultad, activo, imagen_url) {
        const result = this.#updateStmt.run({ id, nombre, descripcion, tiempo_prep_segs, dificultad, activo, imagen_url });
        if (result.changes === 0) throw new RecetaNoEncontrada(id);
        return true;
    }

    static deleteReceta(id) {
        this.#deleteStmt.run({ id });

        return true;
    }

    static searchByName(nombre) {
        const recetas = this.#searchByNameStmt.all({ nombre: `%${nombre}%` });
        return recetas.map(receta => new Receta(
            receta.id,
            receta.nombre,
            receta.descripcion,
            receta.tiempo_prep_segs,
            receta.dificultad,
            receta.id_usuario,
            receta.activo,
            receta.imagen_url
        ));

    }

    static searchByIngredient(ingrediente) {

        const recetas = this.#searchByIngredientStmt.all({ ingrediente: ingrediente });
        return recetas.map(receta => new Receta(
            receta.id,
            receta.nombre,
            receta.descripcion,
            receta.tiempo_prep_segs,
            receta.dificultad,
            receta.id_usuario,
            receta.activo,
            receta.imagen_url
        ));
    }

    static aceptarSugerencia(id) {
        const result = this.#activarRecetaStmt.run({ id });
        if (result.changes === 0) throw new RecetaNoEncontrada(id);
        return true;
    }

    id;
    nombre;
    descripcion;
    tiempo_prep_segs;
    dificultad;
    id_usuario;
    activo;
    imagen_url;



    constructor(id, nombre, descripcion, tiempo_prep_segs, dificultad, id_usuario, activo, imagen_url) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.tiempo_prep_segs = tiempo_prep_segs;
        this.dificultad = dificultad;
        this.id_usuario = id_usuario;
        this.activo = activo;
        this.imagen_url = imagen_url;

    }

}

// ERRORES
export class RecetaNoEncontrada extends Error {
    constructor(id, options) {
        super(`Receta no encontrada: ${id}`, options);
        this.name = "RecetaNoEncontrada";
    }
}

export class ErrorDatos extends Error {
    constructor(mensaje, options) {
        super(mensaje, options);
        this.name = "ErrorDatos";
    }
}
