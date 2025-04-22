export class Realiza {
    static #getByUsuarioYPedidoStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;

    static initStatements(db) {
        if (this.#getByUsuarioYPedidoStmt !== null) return;

        this.#getByUsuarioYPedidoStmt = db.prepare('SELECT * FROM Realiza WHERE id_usuario = @id_usuario AND id_pedido = @id_pedido');
        this.#insertStmt = db.prepare('INSERT INTO Realiza(id_usuario, id_pedido, cantidad) VALUES (@id_usuario, @id_pedido, @cantidad)');
        this.#updateStmt = db.prepare('UPDATE Realiza SET cantidad = @cantidad WHERE id_usuario = @id_usuario AND id_pedido = @id_pedido');
        this.#deleteStmt = db.prepare('DELETE FROM Realiza WHERE id_usuario = @id_usuario AND id_pedido = @id_pedido');
    }

    static getRelacion(id_usuario, id_pedido) {
        const realiza = this.#getByUsuarioYPedidoStmt.get({ id_usuario, id_pedido });
        if (!realiza) throw new RelacionNoEncontrada(id_usuario, id_ingrediente);
        return realiza;
    }

    static addRelacion(id_usuario, id_pedido, cantidad) {
        if (cantidad <= 0) throw new Error("La cantidad debe ser mayor a 0");

        try {
            this.#insertStmt.run({ id_usuario, id_pedido, cantidad });
            return { mensaje: "Relación entre usuario e ingrediente añadida correctamente" };
        } catch (e) {
            if (e.code === 'SQLITE_CONSTRAINT') throw new RelacionYaExiste(id_usuario, id_pedido);
            throw new ErrorDatos("No se pudo añadir la relación", { cause: e });
        }
    }

    static updateRelacion(id_usuario, id_pedido, cantidad) {
        if (cantidad <= 0) throw new Error("La cantidad debe ser mayor a 0");

        const result = this.#updateStmt.run({ id_usuario, id_pedido, cantidad });
        if (result.changes === 0) throw new RelacionNoEncontrada(id_usuario, id_pedido);
        return { mensaje: "Relación actualizada correctamente" };
    }

    static deleteRelacion(id_usuario, id_pedido) {
        const result = this.#deleteStmt.run({ id_usuario, id_pedido });
        if (result.changes === 0) throw new RelacionNoEncontrada(id_usuario, id_pedido);
        return { mensaje: "Relación eliminada correctamente" };
    }
}

export class RelacionNoEncontrada extends Error {
    constructor(id_usuario, id_pedido, options) {
        super(`Relación no encontrada entre el usuario con ID ${id_usuario} y el pedido con ID ${id_pedido}`, options);
        this.name = "RelacionNoEncontrada";
    }
}

export class RelacionYaExiste extends Error {
    constructor(id_usuario, id_pedido, options) {
        super(`La relación entre el usuario con ID ${id_usuario} y el pedido con ID ${id_pedido} ya existe`, options);
        this.name = "RelacionYaExiste";
    }
}

export class ErrorDatos extends Error {
    constructor(mensaje, options) {
        super(mensaje, options);
        this.name = "ErrorDatos";
    }
}
