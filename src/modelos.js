import { Usuario } from "./usuarios/Usuario.js";
import { Ingrediente } from "./recetas/Ingredientes.js"; 
import { Receta } from "./recetas/Recetas.js";
import { Tiene } from "./recetas/Tiene.js"; // Nuevo import para Tiene
import { CalendarioSemanal } from "./usuarios/CalendarioSemanal.js"; // Nuevo import para CalendarioSemanal

export function inicializaModelos(db) {
    Usuario.initStatements(db);
    Ingrediente.initStatements(db); // Inicializa ingredientes
    Receta.initStatements(db); // Inicializa recetas
    Tiene.initStatements(db); // Inicializa las consultas de 'Tiene'
    CalendarioSemanal.initStatements(db); // Inicializa el calendario semanal
}