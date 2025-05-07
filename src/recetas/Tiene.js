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
            return { mensaje: "Ingrediente añadido a la receta correctamente." };
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
        return ingredientes;
    }

    static deleteIngrediente(id_ingrediente){
        this.#deleteIngredienteStmt.run({id_ingrediente});
        return true;
    }

    // Obtener todas las recetas que contienen un ingrediente
    static getRecetasByIngrediente(idIngrediente) {
        if (!this.#getByIngredienteStmt) {
            throw new Error("La consulta 'getByIngredienteStmt' no está inicializada.");
        }
        const recetas = this.#getByIngredienteStmt.all({ id_ingrediente: idIngrediente });
        if (recetas.length === 0) throw new Error("No se encontraron recetas con este ingrediente.");
        return recetas;
    }

    // Actualizar la cantidad de un ingrediente en una receta
    static updateCantidadIngrediente(idReceta, idIngrediente, cantidad) {
        const result = this.#updateStmt.run({ id_ingrediente: idIngrediente, id_receta: idReceta, cantidad });
        if (result.changes === 0) throw new Error("No se pudo actualizar la cantidad del ingrediente en la receta.");
        return { mensaje: "Cantidad de ingrediente actualizada correctamente." };
    }
}

export class ErrorDatos extends Error {
    constructor(mensaje, options) {
        super(mensaje, options);
        this.name = "ErrorDatos";
    }
}
