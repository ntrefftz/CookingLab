import { logger } from "../logger.js"; 

export class Guardado {
    static #insertOrUpdateStmt = null;
    static #deleteStmt = null;
    static #getByUsuarioStmt = null;
    static #getByRecetaStmt = null;
    static #deleteRecetasStmt = null;

    static initStatements(db) {
        if (this.#insertOrUpdateStmt !== null) return;

        this.#insertOrUpdateStmt = db.prepare(`
            INSERT INTO guardado(id_usuario, id_receta, guardado)
            VALUES (@id_usuario, @id_receta, 1)
            ON CONFLICT(id_usuario, id_receta) DO UPDATE SET guardado = 1
        `);
        this.#deleteStmt = db.prepare(`
            UPDATE guardado SET guardado = 0 WHERE id_usuario = @id_usuario AND id_receta = @id_receta
        `);
        this.#getByUsuarioStmt = db.prepare(`
            SELECT * FROM guardado WHERE id_usuario = @id_usuario AND guardado = 1
        `);
        this.#getByRecetaStmt = db.prepare(`
            SELECT * FROM guardado WHERE id_receta = @id_receta AND guardado = 1
        `);

        this.deleteRecetasStmt = db.prepare(`
            DELETE FROM guardado WHERE id_receta = @id_receta`);
    }

    // Marcar una receta como favorita
    static addRecetaToFavoritos(idUsuario, idReceta) {
        try {
            this.#insertOrUpdateStmt.run({ id_usuario: idUsuario, id_receta: idReceta });
            return true; 
        } catch (e) {
            throw new Error("No se pudo añadir la receta a favoritos.", { cause: e });
        }
    }

    static removeRecetaFromFavoritos(idUsuario, idReceta) {
        const result = this.#deleteStmt.run({ id_usuario: idUsuario, id_receta: idReceta });
        console.log("Resultado de intento de borrado:", result);
        if (result.changes === 0) {
            console.warn(`No se pudo eliminar la receta ${idReceta} de favoritos del usuario ${idUsuario}. Verifica si guardado = 1 existe.`);
            throw new Error("La receta no estaba marcada como favorita.");
        }
        return true; 
    }

    // Obtener las recetas favoritas de un usuario
    static getFavoritosByUsuario(idUsuario) {
        const favoritos = this.#getByUsuarioStmt.all({ id_usuario: idUsuario });
        if (favoritos.length === 0) {
            logger.warn("No hay recetas guardadas como favoritas.");
            return [];
        }
        return favoritos.map(({ id_receta, guardado }) => new Guardado(id_receta, idUsuario, guardado));

    }

    static removeRecetas(idReceta){
        this.deleteRecetasStmt.run({ id_receta: idReceta});
        return true;
    }

    // Obtener los usuarios que guardaron una receta como favorita
    static getUsuariosByReceta(idReceta) {
        const usuarios = this.#getByRecetaStmt.all({ id_receta: idReceta });
        if (usuarios.length === 0) throw new Error("Ningún usuario ha guardado esta receta como favorita.");
        console.log("Favoritos obtenidos:", favoritos);
        return usuarios.map(({ id_usuario, guardado }) => new Guardado(idReceta, id_usuario, guardado));
    }


    id_receta;
    id_usuario;
    guardado;

    constructor(id_receta, id_usuario, guardado) {
        this.id_receta = id_receta;
        this.id_usuario = id_usuario;
        this.guardado = guardado;
    }
}

export class ErrorDatos extends Error {
    constructor(mensaje, options) {
        super(mensaje, options);
        this.name = "ErrorDatos";
    }
}
