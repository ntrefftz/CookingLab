export class Contiene {
    static #getByIngredienteYPedidosStmt = null;
    static #getByPedidosStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;
    static #deletePedidoStmt = null;

    static initStatements(db) {
        if (this.#getByIngredienteYPedidosStmt !== null) return;

        // Obtener la relación entre un ingrediente y una factura
        this.#getByIngredienteYPedidosStmt = db.prepare('SELECT * FROM Contiene WHERE id_ingrediente = @id_ingrediente AND id_pedidos = @id_pedidos');

        this.#getByPedidosStmt = db.prepare('SELECT * FROM Contiene WHERE id_pedidos = @id_pedidos');

        // Insertar una nueva relación entre un ingrediente y una factura
        this.#insertStmt = db.prepare('INSERT INTO Contiene(id_ingrediente, id_pedidos, cantidad) VALUES (@id_ingrediente, @id_pedidos, @cantidad)');

        // Actualizar una relación existente
        this.#updateStmt = db.prepare('UPDATE Contiene SET cantidad = @cantidad WHERE id_ingrediente = @id_ingrediente AND id_pedidos = @id_pedidos');

        // Eliminar una relación
        this.#deleteStmt = db.prepare('DELETE FROM Contiene WHERE id_ingrediente = @id_ingrediente AND id_pedidos = @id_pedidos');
    
        // Eliminar una relación por ID de pedido
        this.#deletePedidoStmt = db.prepare('DELETE FROM Contiene WHERE id_pedidos = @id_pedidos');
    }

    static getByPedido(id_pedidos) {
        const contiene = this.#getByPedidosStmt.all({ id_pedidos });
        if (!contiene) throw new RelacionNoEncontrada(id_pedidos);
        return contiene;
    }

    // Obtener la relación entre un ingrediente y una factura específica
    static getRelacion(id_ingrediente, id_pedidos) {
        const contiene = this.#getByIngredienteYPedidosStmt.get({ id_ingrediente, id_pedidos });
        if (!contiene) throw new RelacionNoEncontrada(id_ingrediente, id_pedidos);
        return contiene;
    }

    // Añadir una nueva relación entre un ingrediente y una factura
    static addRelacion(id_ingrediente, id_pedidos, cantidad) {
        if (cantidad <= 0) throw new Error("La cantidad debe ser mayor a 0");

        try {
            this.#insertStmt.run({ id_ingrediente, id_pedidos, cantidad });
            return { mensaje: "Relación entre ingrediente y factura añadida correctamente" };
        } catch (e) {
            if (e.code === 'SQLITE_CONSTRAINT') throw new RelacionYaExiste(id_ingrediente, id_pedidos);
            throw new ErrorDatos("No se pudo añadir la relación", { cause: e });
        }
    }

    // Actualizar una relación existente entre un ingrediente y una factura
    static updateRelacion(id_ingrediente, id_pedidos, cantidad) {
        if (cantidad <= 0) throw new Error("La cantidad debe ser mayor a 0");

        const result = this.#updateStmt.run({ id_ingrediente, id_pedidos, cantidad });
        if (result.changes === 0) throw new RelacionNoEncontrada(id_ingrediente, id_pedidos);
        return { mensaje: "Relación actualizada correctamente" };
    }

    // Eliminar una relación entre un ingrediente y una factura
    static deleteRelacion(id_ingrediente, id_pedidos) {
        const result = this.#deleteStmt.run({ id_ingrediente, id_pedidos });
        if (result.changes === 0) throw new RelacionNoEncontrada(id_ingrediente, id_pedidos);
        return { mensaje: "Relación eliminada correctamente" };
    }

    static deletePedido(id_pedidos) {
        const result = this.#deletePedidoStmt.run({ id_pedidos });
        return { mensaje: "Pedido eliminado correctamente" };
    }
}

// ERRORES
// No se encuentra la relación entre un ingrediente y una factura
export class RelacionNoEncontrada extends Error {
    constructor(id_ingrediente, id_pedidos, options) {
        super(`Relación no encontrada entre el ingrediente con ID ${id_ingrediente} y la factura con ID ${id_pedidos}`, options);
        this.name = "RelacionNoEncontrada";
    }
}

// La relación ya existe
export class RelacionYaExiste extends Error {
    constructor(id_ingrediente, id_pedidos, options) {
        super(`La relación entre el ingrediente con ID ${id_ingrediente} y la factura con ID ${id_pedidos} ya existe`, options);
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
