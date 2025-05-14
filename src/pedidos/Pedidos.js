export class Pedido {
    static #getByIdStmt = null;
    static #getAllStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;

    static initStatements(db) {
        if (this.#getByIdStmt !== null) return;

        this.#getByIdStmt = db.prepare('SELECT * FROM Pedidos WHERE id = @id');
        this.#getAllStmt = db.prepare('SELECT * FROM Pedidos WHERE pagado = 1');
        this.#insertStmt = db.prepare('INSERT INTO Pedidos(fecha, hora, precio_total, enviado, pagado) VALUES (@fecha, @hora, @precio_total, @enviado, @pagado)');
        this.#updateStmt = db.prepare('UPDATE Pedidos SET enviado = @enviado, pagado = @pagado WHERE id = @id');
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

    static addPedido(fecha, hora, precio_total, enviado = 0, pagado = 0) {
        try {
            const result = this.#insertStmt.run({ fecha, hora, precio_total, enviado, pagado });
            return { id: result.lastInsertRowid };
        } catch (e) {
            throw new ErrorDatos("No se pudo añadir el pedido", { cause: e });
        }
    }

    static updatePedido(id, enviado, pagado) {
        const result = this.#updateStmt.run({ id, enviado, pagado });
        if (result.changes === 0) throw new PedidoNoEncontrado(id);
        return true;
    }

    static deletePedido(id) {
        const result = this.#deleteStmt.run({ id });
        return true;
    }

    id;
    fecha;
    hora;
    precio_total;
    enviado;
    pagado;
    constructor(id, fecha, hora, precio_total, enviado, pagado) {
        this.id = id;
        this.fecha = fecha;
        this.hora = hora;
        this.precio_total = precio_total;
        this.enviado = enviado;
        this.pagado = pagado;
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
