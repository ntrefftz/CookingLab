export class Interactua {

    static #getByUsuarioYRecetaStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;

    static initStatements(db) {
        if (this.#getByUsuarioYRecetaStmt !== null) return;

        //interacción entre un usuario y una receta
        this.#getByUsuarioYRecetaStmt = db.prepare('SELECT * FROM Interactua WHERE id_usuario = @id_usuario AND id_receta = @id_receta');

        //insertar una nueva interacción
        this.#insertStmt = db.prepare('INSERT INTO Interactua(id_usuario, id_receta, valoracion, guardado) VALUES (@id_usuario, @id_receta, @valoracion, @guardado)');

        //actualizar una interacción existente
        this.#updateStmt = db.prepare('UPDATE Interactua SET valoracion = @valoracion, guardado = @guardado WHERE id_usuario = @id_usuario AND id_receta = @id_receta');

        //eliminar una interacción
        this.#deleteStmt = db.prepare('DELETE FROM Interactua WHERE id_usuario = @id_usuario AND id_receta = @id_receta');
    }

    // Obtener la interacción entre un usuario y una receta específica
    static getInteraccion(id_usuario, id_receta) {
        const interaccion = this.#getByUsuarioYRecetaStmt.get({ id_usuario, id_receta });
        if (!interaccion) throw new InteraccionNoEncontrada(id_usuario, id_receta);
        return interaccion;
    }

    // Añadir una nueva interacción (valoración o guardado de receta)
    static addInteraccion(id_usuario, id_receta, valoracion, guardado = 0) {
        try {
            this.#insertStmt.run({ id_usuario, id_receta, valoracion, guardado });
            return { mensaje: "Interacción añadida correctamente" };
        } catch (e) {
            if (e.code === 'SQLITE_CONSTRAINT') throw new InteraccionYaExiste(id_usuario, id_receta);
            throw new ErrorDatos("No se pudo añadir la interacción", { cause: e });
        }
    }

    // Actualizar una interacción existente (valoración y guardado)
    static updateInteraccion(id_usuario, id_receta, valoracion, guardado) {
        const result = this.#updateStmt.run({ id_usuario, id_receta, valoracion, guardado });
        if (result.changes === 0) throw new InteraccionNoEncontrada(id_usuario, id_receta);
        return { mensaje: "Interacción actualizada correctamente" };
    }

    // Eliminar una interacción entre un usuario y una receta
    static deleteInteraccion(id_usuario, id_receta) {
        const result = this.#deleteStmt.run({ id_usuario, id_receta });
        if (result.changes === 0) throw new InteraccionNoEncontrada(id_usuario, id_receta);
        return { mensaje: "Interacción eliminada correctamente" };
    }

    // Actualizar la dificultad de una receta (solo cocineros)
    static updateDificultadReceta(id_receta, dificultad) {
        if (dificultad < 1 || dificultad > 5) throw new Error("La dificultad debe estar entre 1 y 5");
        // Suponemos que existe un campo `dificultad` en la tabla `Recetas`
        try {
            
            // Añadir lógica que se encargue de actualizar el campo 'dificultad'
            
            return { mensaje: "Dificultad de receta actualizada correctamente" };
        } catch (e) {
            throw new ErrorDatos("No se pudo actualizar la dificultad", { cause: e });
        }
    }
}

// ERRORES
// No se encuentra la interacción entre un usuario y una receta
export class InteraccionNoEncontrada extends Error {
    constructor(id_usuario, id_receta, options) {
        super(`Interacción no encontrada para el usuario con ID ${id_usuario} y la receta con ID ${id_receta}`, options);
        this.name = "InteraccionNoEncontrada";
    }
}

// La interacción ya existe
export class InteraccionYaExiste extends Error {
    constructor(id_usuario, id_receta, options) {
        super(`La interacción entre el usuario con ID ${id_usuario} y la receta con ID ${id_receta} ya existe`, options);
        this.name = "InteraccionYaExiste";
    }
}

// Error genérico
export class ErrorDatos extends Error {
    constructor(mensaje, options) {
        super(mensaje, options);
        this.name = "ErrorDatos";
    }
}
