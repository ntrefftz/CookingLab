import { Usuario } from "./usuarios/Usuario.js";
import { Ingrediente } from "./recetas/Ingredientes.js"; 
import { Receta } from "./recetas/Recetas.js";
import { Tiene } from "./recetas/Tiene.js"; // Nuevo import para Tiene
import { CalendarioSemanal } from "./usuarios/CalendarioSemanal.js"; // Nuevo import para CalendarioSemanal
import { Pedido } from "./pedidos/Pedidos.js"; // Nuevo import para Pedidos
import { Realiza } from "./pedidos/Realiza.js"; // Nuevo import para Realiza
import { Contiene } from "./pedidos/Contiene.js"; // Nuevo import para Contiene
import { Cesta } from "./pedidos/Cesta.js";
import { Guardado } from "./usuarios/Guardado.js";  // Nuevo import para Guardado
import { Diaria } from "./recetas/Diaria.js"; // Nuevo import para Diaria


export function inicializaModelos(db) {
    Usuario.initStatements(db);
    Ingrediente.initStatements(db); // Inicializa ingredientes
    Receta.initStatements(db); // Inicializa recetas
    Tiene.initStatements(db); // Inicializa las consultas de 'Tiene'
    CalendarioSemanal.initStatements(db); // Inicializa el calendario semanal
    Pedido.initStatements(db); // Inicializa los pedidos
    Realiza.initStatements(db); // Inicializa la relación entre usuarios y pedidos
    Contiene.initStatements(db); // Inicializa la relación entre ingredientes y pedidos
    Cesta.initStatements(db); // Inicializa la cesta
    Guardado.initStatements(db); // Inicializa la relación entre usuarios y recetas guardadas
    Diaria.initStatements(db);
}