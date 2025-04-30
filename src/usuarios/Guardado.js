export class Guardado {
    static #insertOrUpdateStmt = null;
    static #deleteStmt = null;
    static #getByUsuarioStmt = null;
    static #getByRecetaStmt = null;

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
    }

    // Marcar una receta como favorita
    static addRecetaToFavoritos(idUsuario, idReceta) {
        try {
            this.#insertOrUpdateStmt.run({ id_usuario: idUsuario, id_receta: idReceta });
            return { mensaje: "Receta añadida a favoritos." };
        } catch (e) {
            throw new Error("No se pudo añadir la receta a favoritos.", { cause: e });
        }
    }

    // Quitar una receta de favoritos
    static removeRecetaFromFavoritos(idUsuario, idReceta) {
        const result = this.#deleteStmt.run({ id_usuario: idUsuario, id_receta: idReceta });
        if (result.changes === 0) throw new Error("La receta no estaba marcada como favorita.");
        return { mensaje: "Receta eliminada de favoritos." };
    }

    // Obtener las recetas favoritas de un usuario
    static getFavoritosByUsuario(idUsuario) {
        const favoritos = this.#getByUsuarioStmt.all({ id_usuario: idUsuario });
        return favoritos; // Devuelve [] si no hay ninguno
    }

    // Obtener los usuarios que guardaron una receta como favorita
    static getUsuariosByReceta(idReceta) {
        const usuarios = this.#getByRecetaStmt.all({ id_receta: idReceta });
        if (usuarios.length === 0) throw new Error("Ningún usuario ha guardado esta receta como favorita.");
        return usuarios;
    }
}

export class ErrorDatos extends Error {
    constructor(mensaje, options) {
        super(mensaje, options);
        this.name = "ErrorDatos";
    }
}
