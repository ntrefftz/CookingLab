export class Contiene {
    static #getByIngredienteYFacturaStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;

    static initStatements(db) {
        if (this.#getByIngredienteYFacturaStmt !== null) return;

        // Obtener la relación entre un ingrediente y una factura
        this.#getByIngredienteYFacturaStmt = db.prepare('SELECT * FROM Contiene WHERE id_ingrediente = @id_ingrediente AND id_factura = @id_factura');

        // Insertar una nueva relación entre un ingrediente y una factura
        this.#insertStmt = db.prepare('INSERT INTO Contiene(id_ingrediente, id_factura, cantidad) VALUES (@id_ingrediente, @id_factura, @cantidad)');

        // Actualizar una relación existente
        this.#updateStmt = db.prepare('UPDATE Contiene SET cantidad = @cantidad WHERE id_ingrediente = @id_ingrediente AND id_factura = @id_factura');

        // Eliminar una relación
        this.#deleteStmt = db.prepare('DELETE FROM Contiene WHERE id_ingrediente = @id_ingrediente AND id_factura = @id_factura');
    }

    // Obtener la relación entre un ingrediente y una factura específica
    static getRelacion(id_ingrediente, id_factura) {
        const contiene = this.#getByIngredienteYFacturaStmt.get({ id_ingrediente, id_factura });
        if (!contiene) throw new RelacionNoEncontrada(id_ingrediente, id_factura);
        return contiene;
    }

    // Añadir una nueva relación entre un ingrediente y una factura
    static addRelacion(id_ingrediente, id_factura, cantidad) {
        if (cantidad <= 0) throw new Error("La cantidad debe ser mayor a 0");

        try {
            this.#insertStmt.run({ id_ingrediente, id_factura, cantidad });
            return { mensaje: "Relación entre ingrediente y factura añadida correctamente" };
        } catch (e) {
            if (e.code === 'SQLITE_CONSTRAINT') throw new RelacionYaExiste(id_ingrediente, id_factura);
            throw new ErrorDatos("No se pudo añadir la relación", { cause: e });
        }
    }

    // Actualizar una relación existente entre un ingrediente y una factura
    static updateRelacion(id_ingrediente, id_factura, cantidad) {
        if (cantidad <= 0) throw new Error("La cantidad debe ser mayor a 0");

        const result = this.#updateStmt.run({ id_ingrediente, id_factura, cantidad });
        if (result.changes === 0) throw new RelacionNoEncontrada(id_ingrediente, id_factura);
        return { mensaje: "Relación actualizada correctamente" };
    }

    // Eliminar una relación entre un ingrediente y una factura
    static deleteRelacion(id_ingrediente, id_factura) {
        const result = this.#deleteStmt.run({ id_ingrediente, id_factura });
        if (result.changes === 0) throw new RelacionNoEncontrada(id_ingrediente, id_factura);
        return { mensaje: "Relación eliminada correctamente" };
    }
}

// ERRORES
// No se encuentra la relación entre un ingrediente y una factura
export class RelacionNoEncontrada extends Error {
    constructor(id_ingrediente, id_factura, options) {
        super(`Relación no encontrada entre el ingrediente con ID ${id_ingrediente} y la factura con ID ${id_factura}`, options);
        this.name = "RelacionNoEncontrada";
    }
}

// La relación ya existe
export class RelacionYaExiste extends Error {
    constructor(id_ingrediente, id_factura, options) {
        super(`La relación entre el ingrediente con ID ${id_ingrediente} y la factura con ID ${id_factura} ya existe`, options);
        this.name = "RelacionYaExiste";
    }
}

// Error genérico
export class ErrorDatos extends Error {
    constructor(mensaje, options) {
        super(mensaje, options);
        this.name = "ErrorDatos";
    }
}
