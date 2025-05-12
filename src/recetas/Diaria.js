export class Diaria {
    static #getByDiaStmt = null; // Para obtener la receta de un día específico
    static #insertStmt = null;   // Para insertar la receta en un día
    static #deleteStmt = null;   // Para eliminar la receta de un día
    static #getAllStmt = null;   // Para obtener todas las recetas asignadas a los días
    static #updateStmt = null;   // Para actualizar la receta de un día específico
    static #deleteRecetaStmt = null; // Para eliminar la receta de un día específico

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
    
        this.#deleteRecetaStmt = db.prepare('DELETE FROM Diaria WHERE id_receta = @id_receta');
      
       //Actualizar la receta asignada a un día específico
        this.#updateStmt = db.prepare('UPDATE Diaria SET id_receta = @id_receta WHERE dia = @dia');

    }

    // Obtener la receta asignada a un día específico
    static getRecetaPorDia(dia) {
        const receta = this.#getByDiaStmt.get({ dia });
        if (!receta) throw new DiariaNoEncontrada(dia);
        return new Diaria(receta.id_receta, receta.dia);
    }

     // Obtener todas las recetas asignadas a los días
     static getTodasLasRecetas() {
        const recetas = this.#getAllStmt.all();
        return recetas.map(receta => new Diaria(receta.id_receta, receta.dia));
        
    }

    static updateRecetaPorDia(dia, id_receta) {
        try {
            this.#updateStmt.run({ dia, id_receta });
            return true; //TODO MENSAJE { mensaje: "Receta actualizada correctamente" };
        } catch (e) {
            if (e.code === 'SQLITE_CONSTRAINT') throw new DiariaYaExiste(dia);
            throw new ErrorDatos("No se pudo actualizar la receta", { cause: e });
        }
    }
   

    // Asignar una receta a un día específico
    static asignarRecetaADia(dia, id_receta) {
        try {
            this.#insertStmt.run({ dia, id_receta });
            return true; //TODO MENSAJE { mensaje: "Receta asignada al día correctamente" };
        } catch (e) {
            if (e.code === 'SQLITE_CONSTRAINT') throw new DiariaYaExiste(dia);
            throw new ErrorDatos("No se pudo asignar la receta al día", { cause: e });
        }
    }

    // Eliminar la receta de un día específico
    static eliminarRecetaDeDia(dia) {
        const result = this.#deleteStmt.run({ dia });
        if (result.changes === 0) throw new DiariaNoEncontrada(dia);
        return true; //TODO MENSAJE { mensaje: "Receta eliminada del día correctamente" };
    }

    static eliminarReceta(id_receta){
        this.#deleteRecetaStmt.run({ id_receta });
        return true;
    }

    id_receta;
    dia;
    constructor(id_receta, dia) {
        this.id_receta = id_receta;
        this.dia = dia;
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
