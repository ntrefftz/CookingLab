export class CalendarioSemanal {
    static #getByUsuarioYSemanaStmt = null;  // Obtener todas las recetas asignadas a un usuario en una semana
    static #insertStmt = null;               // Asignar una receta a un usuario en un día específico de una semana
    static #deleteStmt = null;               // Eliminar una receta de un usuario en un día específico de una semana
    static #updateStmt = null;               // Actualizar una receta asignada en un día específico
    static #getByUsuarioYFechaStmt = null;   // Obtener receta asignada a un usuario en una fecha específica
    static #getRecetasSemanaStmt = null; //  NUEVA 
    static #getRecetasRangoStmt = null; // NUEVA: porque siguen petando las malditas fechas

    static initStatements(db) {
        if (this.#getByUsuarioYSemanaStmt !== null) return;

        // Obtener todas las recetas asignadas a un usuario en una semana
        this.#getByUsuarioYSemanaStmt = db.prepare(`
            SELECT * FROM Calendario_Semanal 
            WHERE id_usuario = @id_usuario AND fecha BETWEEN @inicioSemana AND @finSemana
        `);

        // Asignar una receta a un usuario en un día de la semana
        this.#insertStmt = db.prepare('INSERT INTO Calendario_Semanal(id_receta, id_usuario, fecha) VALUES (@id_receta, @id_usuario, @fecha)');
        
        // Eliminar una receta asignada a un usuario en un día de la semana
        this.#deleteStmt = db.prepare('DELETE FROM Calendario_Semanal WHERE id_usuario = @id_usuario AND fecha = @fecha');
        
        // Actualizar la receta asignada a un usuario en un día específico
        this.#updateStmt = db.prepare('UPDATE Calendario_Semanal SET id_receta = @id_receta WHERE id_usuario = @id_usuario AND fecha = @fecha');

        //ESTA HAY QUE QUITARLA YA NO LA NECESITAMOS
        // Obtener receta asignada a un usuario en una fecha específica
        this.#getByUsuarioYFechaStmt = db.prepare('SELECT * FROM Calendario_Semanal WHERE id_usuario = @id_usuario AND fecha = @fecha');
    
        // NUEVA: recetas con nombre y fecha
        this.#getRecetasSemanaStmt = db.prepare(`
            SELECT r.id AS id_receta, r.nombre, cs.fecha
            FROM Calendario_Semanal cs
            JOIN Recetas r ON cs.id_receta = r.id
            WHERE cs.id_usuario = @id_usuario AND cs.fecha BETWEEN @inicioSemana AND @finSemana
        `);

        // NUEVA: porque siguen petando las malditas fechas
        this.#getRecetasRangoStmt = db.prepare(`
            SELECT r.id AS id_receta, r.nombre, cs.fecha
            FROM Calendario_Semanal cs
            JOIN Recetas r ON cs.id_receta = r.id
            WHERE cs.id_usuario = @id_usuario AND cs.fecha BETWEEN @inicio AND @fin
        `);
    }
     // YA NO HACE FALTA
    // Obtener todas las recetas asignadas a un usuario en una semana (de lunes a domingo)
    static getRecetasPorUsuarioYSemana(id_usuario, inicioSemana, finSemana) {
        return this.#getByUsuarioYSemanaStmt.all({ id_usuario, inicioSemana, finSemana });
    }

    // Asignar una receta a un usuario en un día específico
    static asignarRecetaAUsuario(id_receta, id_usuario, fecha) {
        console.log(" Intentando asignar receta al calendario:");
        console.log("   id_receta:", id_receta);
        console.log("   id_usuario:", id_usuario);
        console.log("   fecha:", fecha);
    
        try {
            const result = this.#insertStmt.run({ id_receta, id_usuario, fecha });
            console.log("Inserción completada:", result);
            return { mensaje: "Receta asignada correctamente" };
        } catch (e) {
            console.error(" Error al insertar receta en calendario:", e);
            if (e.code === 'SQLITE_CONSTRAINT') throw new CalendarioSemanalYaExiste(id_receta, id_usuario, fecha);
            throw new ErrorDatos("No se pudo asignar la receta al usuario en la fecha", { cause: e });
        }
    }
        
    // YA NO HACE FALTA
    // Actualizar la receta asignada a un usuario en un día específico
    //Ej. si ya hay una receta asignada para ese dia se cambia por la nueva
    static actualizarRecetaDeUsuario(id_receta, id_usuario, fecha) {
        const result = this.#updateStmt.run({ id_receta, id_usuario, fecha });
        if (result.changes === 0) throw new CalendarioSemanalNoEncontrado(id_usuario, fecha);
        return { mensaje: "Receta actualizada correctamente" };
    }

    // Eliminar una receta asignada a un usuario en un día específico
    static eliminarRecetaDeUsuario(id_usuario, fecha) {
        console.log(`Eliminando receta para usuario ${id_usuario} en la fecha ${fecha}`);
        
        const result = this.#deleteStmt.run({ id_usuario, fecha });
    
        if (result.changes === 0) {
            throw new CalendarioSemanalNoEncontrado(id_usuario, fecha);
        }
    
        console.log("Receta eliminada correctamente");
        return { mensaje: "Receta eliminada correctamente" };
    }

    
    // YA NO HACE FALTA
    // Obtener receta asignada a un usuario en una fecha específica
    static getRecetaPorUsuarioYFecha(id_usuario, fecha) {
        const receta = this.#getByUsuarioYFechaStmt.get({ id_usuario, fecha });
        if (!receta) throw new CalendarioSemanalNoEncontrado(id_usuario, fecha);
        return receta;
    }

    //NUEVA
    static getRecetasSemana(id_usuario, inicioSemana) {
        // Calculamos la fecha de fin (domingo)
        const fechaInicio = new Date(inicioSemana);
        const fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaInicio.getDate() + 6); // lunes + 6 días = domingo

        const inicioStr = fechaInicio.toISOString().split('T')[0];
        const finStr = fechaFin.toISOString().split('T')[0];

        return this.#getRecetasSemanaStmt.all({
            id_usuario,
            inicioSemana: inicioStr,
            finSemana: finStr
        });
    }

    static getRecetasRango(id_usuario, inicio, fin) {
        const inicioStr = new Date(inicio).toISOString().split('T')[0];
        const finStr = new Date(fin).toISOString().split('T')[0];
    
        return this.#getRecetasRangoStmt.all({
            id_usuario,
            inicio: inicioStr,
            fin: finStr
        });
    }
    
    
}

//ERRORES
export class CalendarioSemanalNoEncontrado extends Error {
    constructor(id_usuario, fecha, options) {
        super(`Receta no encontrada para el usuario ${id_usuario} en la fecha ${fecha}`, options);
        this.name = "CalendarioSemanalNoEncontrado";
    }
}

export class CalendarioSemanalYaExiste extends Error {
    constructor(id_receta, id_usuario, fecha, options) {
        super(`Ya existe una receta asignada para el usuario ${id_usuario} en la fecha ${fecha}`, options);
        this.name = "CalendarioSemanalYaExiste";
    }
}

export class ErrorDatos extends Error {
    constructor(mensaje, options) {
        super(mensaje, options);
        this.name = "ErrorDatos";
    }
}
