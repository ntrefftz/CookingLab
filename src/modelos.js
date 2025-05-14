import { Usuario } from "./usuarios/Usuario.js";
import { Ingrediente } from "./recetas/Ingredientes.js"; 
import { Receta } from "./recetas/Recetas.js";
import { Tiene } from "./recetas/Tiene.js"; 
import { CalendarioSemanal } from "./usuarios/CalendarioSemanal.js"; 
import { Pedido } from "./pedidos/Pedidos.js"; 
import { Realiza } from "./pedidos/Realiza.js"; 
import { Contiene } from "./pedidos/Contiene.js"; 
import { Cesta } from "./pedidos/Cesta.js";
import { Guardado } from "./usuarios/Guardado.js"; 
import { Diaria } from "./recetas/Diaria.js"; 


export function inicializaModelos(db) {
    Usuario.initStatements(db);
    Ingrediente.initStatements(db); 
    Receta.initStatements(db);
    Tiene.initStatements(db); 
    CalendarioSemanal.initStatements(db); 
    Pedido.initStatements(db); 
    Realiza.initStatements(db); 
    Contiene.initStatements(db); 
    Cesta.initStatements(db); 
    Guardado.initStatements(db); 
    Diaria.initStatements(db);
}