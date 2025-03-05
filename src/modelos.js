import { Usuario } from "./usuarios/Usuario.js";
import { Ingrediente } from "./recetas/Ingredientes.js"; // Nuevo import


export function inicializaModelos(db) {
    Usuario.initStatements(db);
    Ingrediente.initStatements(db); // Inicializa ingredientes

}