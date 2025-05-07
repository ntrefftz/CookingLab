export class Receta {
    static #getByIdStmt = null;
    static #getByUsuarioStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;
    static #getAllStmt = null;

    static #searchByNameStmt = null;
    static #searchByIngredientStmt = null;

    static initStatements(db) {
        if (this.#getByIdStmt !== null) return;

        this.#getByIdStmt = db.prepare('SELECT * FROM Recetas WHERE id = @id');
        this.#getByUsuarioStmt = db.prepare('SELECT * FROM Recetas WHERE id_usuario = @id_usuario AND activo = 1'); // Obtener recetas activas por usuario
        this.#insertStmt = db.prepare('INSERT INTO Recetas(nombre, descripcion, tiempo_prep_segs, dificultad, id_usuario, activo) VALUES (@nombre, @descripcion, @tiempo_prep_segs, @dificultad, @id_usuario, @activo)');
        this.#updateStmt = db.prepare('UPDATE Recetas SET nombre = @nombre, descripcion = @descripcion, tiempo_prep_segs = @tiempo_prep_segs, dificultad = @dificultad, activo = @activo WHERE id = @id');
        this.#deleteStmt = db.prepare('DELETE FROM Recetas WHERE id = @id');
        this.#getAllStmt = db.prepare('SELECT * FROM Recetas WHERE activo = 1'); // Obtener todas las recetas activas
        
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
        return receta;
    }

    static getRecetasByUsuario(id_usuario) {
        return this.#getByUsuarioStmt.all({ id_usuario });
    }

    static getAllRecetas() {
        return this.#getAllStmt.all();
    }

    static addReceta(nombre, descripcion, tiempo_prep_segs, dificultad, id_usuario, activo = 1) {
        try {
            const result = this.#insertStmt.run({ nombre, descripcion, tiempo_prep_segs, dificultad, id_usuario, activo });
            return { mensaje: "Receta añadida correctamente", id: result.lastInsertRowid };
        } catch (e) {
            throw new ErrorDatos("No se pudo añadir la receta", { cause: e });
        }
    }

    static updateReceta(id, nombre, descripcion, tiempo_prep_segs, dificultad, activo) {
        const result = this.#updateStmt.run({ id, nombre, descripcion, tiempo_prep_segs, dificultad, activo });
        if (result.changes === 0) throw new RecetaNoEncontrada(id);
        return { mensaje: "Receta actualizada correctamente" };
    }

    static deleteReceta(id) {
        const result = this.#deleteStmt.run({ id });
        return true;
    }

    static searchByName(nombre) {
        return this.#searchByNameStmt.all({ nombre: `%${nombre}%` });
    
        //Si queremos añadir paginacion entonces:
        /*return this.#searchByNameStmt.all({ 
        nombre: `%${nombre}%`,
        limit,
        offset 
        });*/
    }
    
    static searchByIngredient(ingrediente) {
        return this.#searchByIngredientStmt.all({ ingrediente: ingrediente });
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
