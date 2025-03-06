import { Usuario } from "./usuarios/Usuario.js";
import { Ingrediente } from "./recetas/Ingredientes.js"; // Nuevo import
import { Receta } from "./recetas/Recetas.js"; // Nuevo import

export function inicializaModelos(db) {
    Usuario.initStatements(db);
    Ingrediente.initStatements(db); // Inicializa ingredientes
    Receceta.initStatements(db); // Inicializa recetas
}