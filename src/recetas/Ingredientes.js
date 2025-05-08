export class Ingrediente {
    static #getByIdStmt = null;
    static #getByNombreStmt = null;
    static #insertStmt = null;
    static #deleteStmt = null;
    static #getAllStmt = null;
    static #updateStmt = null;
    static #reduceStockStmt = null;
    static #existsStmt = null;
    static #setStock = null;

    static initStatements(db) {
        if (this.#getByIdStmt !== null) return;

        this.#getByIdStmt = db.prepare('SELECT * FROM Ingredientes WHERE id = @id');
        this.#getByNombreStmt = db.prepare('SELECT * FROM Ingredientes WHERE nombre = @nombre');
        this.#insertStmt = db.prepare('INSERT INTO Ingredientes(nombre, categoria, precio, stock, unidad_medida, imagen_url) VALUES (@nombre, @categoria, @precio, @stock, @unidad_medida, @imagen_url)');
        this.#deleteStmt = db.prepare('DELETE FROM Ingredientes WHERE id = @id');
        this.#getAllStmt = db.prepare('SELECT * FROM Ingredientes');
        this.#updateStmt = db.prepare('UPDATE Ingredientes SET nombre = @nombre, categoria = @categoria, precio = @precio, stock = @stock WHERE id = @id');
        this.#reduceStockStmt = db.prepare('UPDATE Ingredientes SET stock = stock - @cantidad WHERE id = @id AND stock >= @cantidad');
        this.#existsStmt = db.prepare('SELECT COUNT(*) as count FROM Ingredientes WHERE nombre = @nombre');
        this.#setStock = db.prepare('UPDATE Ingredientes SET stock = @stock WHERE id = @id');
    }

    static getIngredienteById(id) {
        const ingrediente = this.#getByIdStmt.get({ id });
        if (!ingrediente) throw new IngredienteNoEncontrado(id);
        return ingrediente;
    }

    static getIngredienteByNombre(nombre) {
        const ingrediente = this.#getByNombreStmt.get({ nombre });
        if (!ingrediente) throw new IngredienteNoEncontrado(nombre);
        return ingrediente;
    }

    static getAllIngredientes() {
        return this.#getAllStmt.all();
    }

    static addIngrediente(nombre, categoria, precio, stock = 0, unidad_medida, imagen_url) {
        try {
            this.#insertStmt.run({ nombre, categoria, precio, stock, unidad_medida, imagen_url});
            return { mensaje: "Ingrediente añadido correctamente" };
        } catch (e) {
            if (e.code === 'SQLITE_CONSTRAINT') throw new IngredienteYaExiste(nombre);
            throw new ErrorDatos("No se pudo añadir el ingrediente", { cause: e });
        }
    }

    static deleteIngrediente(id) {
        const result = this.#deleteStmt.run({ id });
        if (result.changes === 0) throw new IngredienteNoEncontrado(id);
        return { mensaje: "Ingrediente eliminada correctamente" };
    }

    static updateIngrediente(id, nombre, categoria, precio, stock) {
        const result = this.#updateStmt.run({ id, nombre, categoria, precio, stock });
        if (result.changes === 0) throw new IngredienteNoEncontrado(id);
        return { mensaje: "Ingrediente actualizado correctamente" };
    }
    
    static reducirStock(id, cantidad) {
        const result = this.#reduceStockStmt.run({ id, cantidad });
        if (result.changes === 0) throw new StockInsuficiente(id, cantidad);
        return { mensaje: "Stock actualizado correctamente" };
    }

    static existeIngrediente(nombre) {
        const result = this.#existsStmt.get({ nombre });
        return result.count > 0;
    }
    static setStock(id, stock) {
        const result = this.#setStock.run({ id, stock });
        if (result.changes === 0) throw new IngredienteNoEncontrado(id);
        return { mensaje: "Stock actualizado correctamente" };
    }
}

//ERRORES
export class IngredienteNoEncontrado extends Error {
    constructor(nombre, options) {
        super(`Ingrediente no encontrado: ${nombre}`, options);
        this.name = "IngredienteNoEncontrado";
    }
}

export class IngredienteYaExiste extends Error {
    constructor(nombre, options) {
        super(`El ingrediente ya existe: ${nombre}`, options);
        this.name = "IngredienteYaExiste";
    }
}

export class StockInsuficiente extends Error {
    constructor(id, cantidad, options) {
        super(`Stock insuficiente para el ingrediente con ID ${id}. Se intentó reducir en ${cantidad}`, options);
        this.name = "StockInsuficiente";
    }
}

export class ErrorDatos extends Error {
    constructor(mensaje, options) {
        super(mensaje, options);
        this.name = "ErrorDatos";
    }
}
