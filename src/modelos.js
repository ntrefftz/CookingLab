import { Usuario } from "./usuarios/Usuario.js";
import { Ingrediente } from "./recetas/Ingredientes.js"; // Nuevo import
import { Receta } from "./recetas/Recetas.js"; // Nuevo import
import { Tiene } from "./recetas/Tiene.js"; // Nuevo import para Tiene

export function inicializaModelos(db) {
    Usuario.initStatements(db);
    Ingrediente.initStatements(db); // Inicializa ingredientes
    Receta.initStatements(db); // Inicializa recetas
    Tiene.initStatements(db); // Inicializa las consultas de 'Tiene'

}