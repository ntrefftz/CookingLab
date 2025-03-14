export class Pedido {
    static #getByIdStmt = null;
    static #getAllStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;

    static initStatements(db) {
        if (this.#getByIdStmt !== null) return;

        this.#getByIdStmt = db.prepare('SELECT * FROM Pedidos WHERE id = @id');
        this.#getAllStmt = db.prepare('SELECT * FROM Pedidos WHERE activo = 1');
        this.#insertStmt = db.prepare('INSERT INTO Pedidos(precio_total, enviado, activo) VALUES (@precio_total, @enviado, @activo)');
        this.#updateStmt = db.prepare('UPDATE Pedidos SET precio_total = @precio_total, enviado = @enviado, activo = @activo WHERE id = @id');
        this.#deleteStmt = db.prepare('DELETE FROM Pedidos WHERE id = @id');
    }

    static getPedidoById(id) {
        const pedido = this.#getByIdStmt.get({ id });
        if (!pedido) throw new PedidoNoEncontrado(id);
        return pedido;
    }

    static getAllPedidos() {
        return this.#getAllStmt.all();
    }

    static addPedido(precio_total, enviado = 0, activo = 1) {
        try {
            const result = this.#insertStmt.run({ precio_total, enviado, activo });
            return { mensaje: "Pedido añadido correctamente", id: result.lastInsertRowid };
        } catch (e) {
            throw new ErrorDatos("No se pudo añadir el pedido", { cause: e });
        }
    }

    static updatePedido(id, precio_total, enviado, activo) {
        const result = this.#updateStmt.run({ id, precio_total, enviado, activo });
        if (result.changes === 0) throw new PedidoNoEncontrado(id);
        return { mensaje: "Pedido actualizado correctamente" };
    }

    static deletePedido(id) {
        const result = this.#deleteStmt.run({ id });
        if (result.changes === 0) throw new PedidoNoEncontrado(id);
        return { mensaje: "Pedido eliminado correctamente" };
    }
}

//ERRORES
export class PedidoNoEncontrado extends Error {
    constructor(id, options) {
        super(`Pedido no encontrado: ${id}`, options);
        this.name = "PedidoNoEncontrado";
    }
}

export class ErrorDatos extends Error {
    constructor(mensaje, options) {
        super(mensaje, options);
        this.name = "ErrorDatos";
    }
}
