export class Diaria {
    static #getByDiaStmt = null; // Para obtener la receta de un día específico
    static #insertStmt = null;   // Para insertar la receta en un día
    static #deleteStmt = null;   // Para eliminar la receta de un día
    static #getAllStmt = null;   // Para obtener todas las recetas asignadas a los días

    static initStatements(db) {
        if (this.#getByDiaStmt !== null) return;

        // Consulta para obtener la receta asignada a un día específico
        this.#getByDiaStmt = db.prepare('SELECT * FROM Diaria WHERE dia = @dia');
        
        // Insertar una receta para un día específico
        this.#insertStmt = db.prepare('INSERT INTO Diaria(dia, id_receta) VALUES (@dia, @id_receta)');
        
        // Eliminar la receta asignada a un día específico
        this.#deleteStmt = db.prepare('DELETE FROM Diaria WHERE dia = @dia');
        
        // Obtener todas las recetas asignadas a los días
        this.#getAllStmt = db.prepare('SELECT * FROM Diaria');
    }

    // Obtener la receta asignada a un día específico
    static getRecetaPorDia(dia) {
        const receta = this.#getByDiaStmt.get({dia});
        if (!receta) throw new DiariaNoEncontrada(dia);
        return receta;
    }

    // Obtener todas las recetas asignadas a los días
    static getTodasLasRecetas() {
        return this.#getAllStmt.all();
    }

    // Asignar una receta a un día específico
    static asignarRecetaADia(dia, id_receta) {
        try {
            this.#insertStmt.run({ dia, id_receta });
            return { mensaje: "Receta asignada al día correctamente" };
        } catch (e) {
            if (e.code === 'SQLITE_CONSTRAINT') throw new DiariaYaExiste(dia);
            throw new ErrorDatos("No se pudo asignar la receta al día", { cause: e });
        }
    }

    // Eliminar la receta de un día específico
    static eliminarRecetaDeDia(dia) {
        const result = this.#deleteStmt.run({ dia });
        if (result.changes === 0) throw new DiariaNoEncontrada(dia);
        return { mensaje: "Receta eliminada del día correctamente" };
    }
}

//ERRORES 
export class DiariaNoEncontrada extends Error {
    constructor(dia, options) {
        super(`Receta no encontrada para el día ${dia}`, options);
        this.name = "DiariaNoEncontrada";
    }
}

export class DiariaYaExiste extends Error {
    constructor(dia, options) {
        super(`Ya existe una receta asignada para el día ${dia}`, options);
        this.name = "DiariaYaExiste";
    }
}

export class ErrorDatos extends Error {
    constructor(mensaje, options) {
        super(mensaje, options);
        this.name = "ErrorDatos";
    }
}
