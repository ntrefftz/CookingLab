export class Contiene {
    static #getByIngredienteYPedidosStmt = null;
    static #getByPedidosStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;
    static #deletePedidoStmt = null;

    static initStatements(db) {
        if (this.#getByIngredienteYPedidosStmt !== null) return;

        this.#getByIngredienteYPedidosStmt = db.prepare('SELECT * FROM Contiene WHERE id_ingrediente = @id_ingrediente AND id_pedidos = @id_pedidos');

        this.#getByPedidosStmt = db.prepare(`
            SELECT Contiene.cantidad, Contiene.id_ingrediente, Contiene.id_pedidos
            FROM Contiene
            JOIN Ingredientes ON Contiene.id_ingrediente = Ingredientes.id
            WHERE Contiene.id_pedidos = @id_pedidos
        `);
        this.#insertStmt = db.prepare('INSERT INTO Contiene(id_ingrediente, id_pedidos, cantidad) VALUES (@id_ingrediente, @id_pedidos, @cantidad)');
        this.#updateStmt = db.prepare('UPDATE Contiene SET cantidad = @cantidad WHERE id_ingrediente = @id_ingrediente AND id_pedidos = @id_pedidos');
        this.#deleteStmt = db.prepare('DELETE FROM Contiene WHERE id_ingrediente = @id_ingrediente AND id_pedidos = @id_pedidos');
        this.#deletePedidoStmt = db.prepare('DELETE FROM Contiene WHERE id_pedidos = @id_pedidos');
    }

    static getByPedido(id_pedidos) {
        const contiene = this.#getByPedidosStmt.all({ id_pedidos });
        if (!contiene || contiene.length === 0) return [];

        return contiene.map(({ id_ingrediente, id_pedidos, cantidad }) =>
            new Contiene(id_ingrediente, id_pedidos, cantidad)
        );
    }
    

    // Obtener la relación entre un ingrediente y una factura específica
    static getRelacion(id_ingrediente, id_pedidos) {
        const contiene = this.#getByIngredienteYPedidosStmt.get({ id_ingrediente, id_pedidos });
        if (!contiene) throw new RelacionNoEncontrada(id_ingrediente, id_pedidos);
        return new Contiene(contiene.id_ingrediente, contiene.id_pedidos, contiene.cantidad);
    }

    // Añadir una nueva relación entre un ingrediente y una factura
    static addRelacion(id_ingrediente, id_pedidos, cantidad) {
        if (cantidad <= 0) throw new Error("La cantidad debe ser mayor a 0");

        try {
            this.#insertStmt.run({ id_ingrediente, id_pedidos, cantidad });
            return true; 
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
        return true; 
    }

    // Eliminar una relación entre un ingrediente y una factura
    static deleteRelacion(id_ingrediente, id_pedidos) {
        const result = this.#deleteStmt.run({ id_ingrediente, id_pedidos });
        if (result.changes === 0) throw new RelacionNoEncontrada(id_ingrediente, id_pedidos);
        return true; 
    }

    static deletePedido(id_pedidos) {
        const result = this.#deletePedidoStmt.run({ id_pedidos });
        return true;
    }

    id_ingrediente;
    id_pedidos;
    cantidad;
    
    constructor(id_ingrediente, id_pedidos, cantidad) {
        this.id_ingrediente = id_ingrediente;
        this.id_pedidos = id_pedidos;
        this.cantidad = cantidad;
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
