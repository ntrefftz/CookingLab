export class Tiene {
    static #insertStmt = null;
    static #deleteStmt = null;
    static #getByRecetaStmt = null;
    static #getByIngredienteStmt = null;
    static #updateStmt = null;
    static #deleteIngredienteStmt = null;

    static initStatements(db) {
        if (this.#insertStmt !== null) return;

        this.#insertStmt = db.prepare('INSERT INTO Tiene(id_ingrediente, id_receta, cantidad, cantidad_esp) VALUES (@id_ingrediente, @id_receta, @cantidad, @cantidad_esp)');
        this.#deleteStmt = db.prepare('DELETE FROM Tiene WHERE id_ingrediente = @id_ingrediente AND id_receta = @id_receta');
        this.#deleteIngredienteStmt = db.prepare('DELETE FROM Tiene WHERE id_ingrediente = @id_ingrediente');
        this.#getByRecetaStmt = db.prepare('SELECT * FROM Tiene WHERE id_receta = @id_receta');
        this.#getByIngredienteStmt = db.prepare('SELECT * FROM Tiene WHERE id_ingrediente = @id_ingrediente');

        this.#updateStmt = db.prepare('UPDATE Tiene SET cantidad = @cantidad WHERE id_ingrediente = @id_ingrediente AND id_receta = @id_receta');
    }

    // Añadir un ingrediente a una receta
    static addIngredienteToReceta(idReceta, idIngrediente, cantidad, cantidad_esp) {
        try {
            this.#insertStmt.run({ id_ingrediente: idIngrediente, id_receta: idReceta, cantidad, cantidad_esp });
            return true;//TODO MENSAJE A CONTROLLER{ mensaje: "Ingrediente añadido a la receta correctamente." };
        } catch (e) {
            if (e.code === 'SQLITE_CONSTRAINT') throw new Error("El ingrediente ya está en la receta.");
            throw new Error("No se pudo añadir el ingrediente a la receta.", { cause: e });
        }
    }

    // Eliminar un ingrediente de una receta
    static removeIngredienteFromReceta(idReceta, idIngrediente) {
        this.#deleteStmt.run({ id_ingrediente: idIngrediente, id_receta: idReceta });
        return true;
    }

    // Obtener todos los ingredientes de una receta
    static getIngredientesByReceta(idReceta) {
        if (!this.#getByRecetaStmt) {
            throw new Error("La consulta 'getByRecetaStmt' no está inicializada.");
        }
        const ingredientes = this.#getByRecetaStmt.all({ id_receta: idReceta });
        if (ingredientes.length === 0) throw new Error("No se encontraron ingredientes para esta receta.");

        // Mapear los resultados a instancias de la clase Tiene
        return ingredientes.map(({ id_ingrediente, id_receta, cantidad, cantidad_esp }) =>
            new Tiene(id_receta, id_ingrediente, cantidad, cantidad_esp)
        );
    }

    static deleteIngrediente(id_ingrediente) {
        this.#deleteIngredienteStmt.run({ id_ingrediente });
        return true;
    }

    // Obtener todas las recetas que contienen un ingrediente
    static getRecetasByIngrediente(idIngrediente) {
        if (!this.#getByIngredienteStmt) {
            throw new Error("La consulta 'getByIngredienteStmt' no está inicializada.");
        }
        const recetas = this.#getByIngredienteStmt.all({ id_ingrediente: idIngrediente });
        if (recetas.length === 0) throw new Error("No se encontraron recetas con este ingrediente.");
        return recetas.map(({ id_ingrediente, id_receta, cantidad, cantidad_esp }) =>
            new Tiene(id_receta, id_ingrediente, cantidad, cantidad_esp)
        );
    }

    // Actualizar la cantidad de un ingrediente en una receta
    static updateCantidadIngrediente(idReceta, idIngrediente, cantidad) {
        const result = this.#updateStmt.run({ id_ingrediente: idIngrediente, id_receta: idReceta, cantidad });
        if (result.changes === 0) throw new Error("No se pudo actualizar la cantidad del ingrediente en la receta.");
        return true; //TODO MENSAJE{ mensaje: "Cantidad de ingrediente actualizada correctamente." };
    }
    
    static updateIngrediente(idReceta, idIngrediente, cantidad, cantidad_esp) { 
        const result = this.#updateStmt.run({ id_ingrediente: idIngrediente, id_receta: idReceta, cantidad, cantidad_esp });
        if (result.changes === 0) throw new Error("No se pudo actualizar la cantidad del ingrediente en la receta.");
        return true; //TODO MENSAJE{ mensaje: "Cantidad de ingrediente actualizada correctamente." };
    }

    id_ingrediente;
    id_receta;
    cantidad;
    cantidad_esp


    constructor(id_receta, id_ingrediente, cantidad, cantidad_esp) {
        this.id_receta = id_receta;
        this.id_ingrediente = id_ingrediente;
        this.cantidad = cantidad;
        this.cantidad_esp = cantidad_esp;
    }

}

export class ErrorDatos extends Error {
    constructor(mensaje, options) {
        super(mensaje, options);
        this.name = "ErrorDatos";
    }
}
