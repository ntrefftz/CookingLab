export class Cesta {
    static #getByIdStmt = null;
    static #insertStmt = null;
    static #deleteStmt = null;
    static #updateStmt = null;

    static initStatements(db) {
        if (this.#getByIdStmt !== null) return;

        this.#getByIdStmt = db.prepare('SELECT * FROM Cesta WHERE id_usuario = @id_usuario');
        this.#insertStmt = db.prepare('INSERT INTO Cesta(id_usuario, id_ingrediente, cantidad) VALUES (@id_usuario, @id_ingrediente, @cantidad)');
        this.#deleteStmt = db.prepare('DELETE FROM Cesta WHERE id_usuario = @id_usuario AND id_ingrediente = @id_ingrediente');
        this.#updateStmt = db.prepare('UPDATE Cesta SET cantidad = @cantidad WHERE id_usuario = @id_usuario AND id_ingrediente = @id_ingrediente');
    }

    static getById(id_usuario) {
        const cesta = this.#getByIdStmt.all({ id_usuario });
        if (!cesta || cesta.length === 0) throw new CestaNoEncontrada(id_usuario);
        return cesta;
    }
    static addCesta(id_usuario, id_ingrediente, cantidad) {
        try {
            const result = this.#insertStmt.run({ id_usuario, id_ingrediente, cantidad });
            return { mensaje: "Cesta añadida correctamente", id: result.lastInsertRowid };
        } catch (e) {
            throw new ErrorDatos("No se pudo añadir la cesta", { cause: e });
        }
    }
    static deleteCesta(id_usuario, id_ingrediente) {
        const result = this.#deleteStmt.run({ id_usuario, id_ingrediente });
        if (result.changes === 0) throw new CestaNoEncontrada(id_usuario);
        return { mensaje: "Cesta eliminada correctamente" };
    }
    static updateCesta(id_usuario, id_ingrediente, cantidad) {
        if (cantidad <= 0) {
            throw new ErrorDatos("La cantidad debe ser mayor que cero");
        }
        const result = this.#updateStmt.get({ id_usuario, id_ingrediente });
        if (!result) {
            throw new CestaNoEncontrada(id_usuario);
        }
        this.#updateStmt.run({ id_usuario, id_ingrediente, cantidad });
        return { mensaje: "Cesta actualizada correctamente" };
    }
}

//ERRORES
export class CestaNoEncontrada extends Error {
    constructor(id_usuario, options) {
        super(`Cesta no encontrada: ${id_usuario}`, options);
        this.name = "CestaNoEncontrada";
    }
}
export class ErrorDatos extends Error {
    constructor(mensaje, options) {
        super(mensaje, options);
        this.name = "ErrorDatos";
    }
}
