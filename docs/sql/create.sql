BEGIN TRANSACTION;
DROP TABLE IF EXISTS "Diaria";
CREATE TABLE "Diaria" (
	"dia"	DATE NOT NULL,
	"id_receta"	INTEGER NOT NULL,
	PRIMARY KEY("dia","id_receta"),
	FOREIGN KEY("id_receta") REFERENCES "Recetas"("id")
);
DROP TABLE IF EXISTS "Ingredientes";
CREATE TABLE "Ingredientes" (
	"id"	INTEGER NOT NULL,
	"nombre"	TEXT NOT NULL UNIQUE,
	"categoria"	TEXT NOT NULL,
	"precio"	REAL NOT NULL CHECK("precio" >= 0),
	"stock"	INTEGER NOT NULL DEFAULT 0 CHECK("stock" >= 0),
	"activo"	INTEGER NOT NULL DEFAULT 1 CHECK("activo" IN (0, 1)),
	"imagen_url"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "Pedidos";
CREATE TABLE "Pedidos" (
	"id"	INTEGER NOT NULL,
	"precio_total"	REAL NOT NULL CHECK("precio_total" >= 0),
	"enviado"	INTEGER NOT NULL DEFAULT 0 CHECK("enviado" IN (0, 1)),
	"pagado"	INTEGER NOT NULL DEFAULT 1 CHECK("pagado" IN (0, 1)),
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "Recetas";
CREATE TABLE "Recetas" (
	"id"	INTEGER NOT NULL,
	"nombre"	TEXT NOT NULL,
	"descripcion"	TEXT NOT NULL,
	"tiempo_prep_segs"	INTEGER NOT NULL CHECK("tiempo_prep_segs" > 0),
	"dificultad"	INTEGER NOT NULL CHECK("dificultad" BETWEEN 0 AND 5),
	"id_usuario"	INTEGER NOT NULL,
	"activo"	INTEGER NOT NULL DEFAULT 1 CHECK("activo" IN (0, 1)),
	"imagen_url"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "Cesta";
CREATE TABLE "Cesta" (
	"id_usuario"	INTEGER NOT NULL,
	"id_ingrediente"	INTEGER NOT NULL,
	"cantidad"	INTEGER NOT NULL CHECK("cantidad" > 0),
	PRIMARY KEY("id_usuario", "id_ingrediente"),
	FOREIGN KEY("id_ingrediente") REFERENCES "Ingredientes"("id"),
	FOREIGN KEY("id_usuario") REFERENCES "Usuarios"("id")
);
DROP TABLE IF EXISTS "Usuarios";
CREATE TABLE "Usuarios" (
	"username"	TEXT NOT NULL UNIQUE,
	"password"	TEXT NOT NULL,
	"nombre"	TEXT NOT NULL,
	"apellido"	TEXT,
	"correo"	TEXT UNIQUE,
	"direccion"	TEXT,
	"rol"	TEXT NOT NULL DEFAULT 'U' CHECK("rol" IN ('U', 'A', 'C')),
	"activo"	INTEGER CHECK("activo" IN (0, 1)),
	"id"	INTEGER NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "calendario_Semanal";
CREATE TABLE "calendario_Semanal" (
	"id_receta"	INTEGER NOT NULL,
	"id_usuario"	INTEGER NOT NULL,
	"fecha"	DATE NOT NULL,
	PRIMARY KEY("id_receta","id_usuario","fecha"),
	FOREIGN KEY("id_receta") REFERENCES "Recetas"("id"),
	FOREIGN KEY("id_usuario") REFERENCES "Usuarios"("id")
);
DROP TABLE IF EXISTS "contiene";
CREATE TABLE "contiene" (
	"id_ingrediente"	INTEGER NOT NULL,
	"id_pedidos"	INTEGER NOT NULL,
	"cantidad"	INTEGER NOT NULL CHECK("cantidad" > 0),
	PRIMARY KEY("id_ingrediente","id_pedidos"),
	FOREIGN KEY("id_pedidos") REFERENCES "Pedidos"("id"),
	FOREIGN KEY("id_ingrediente") REFERENCES "Ingredientes"("id")
);
DROP TABLE IF EXISTS "guardado";
CREATE TABLE "guardado" (
	"id_usuario"	INTEGER NOT NULL,
	"id_receta"	INTEGER NOT NULL,
	"guardado"	INTEGER NOT NULL CHECK("guardado" BETWEEN 0 AND 1),
	PRIMARY KEY("id_usuario","id_receta"),
	FOREIGN KEY("id_receta") REFERENCES "Recetas"("id"),
	FOREIGN KEY("id_usuario") REFERENCES "Usuarios"("id")
);
DROP TABLE IF EXISTS "realiza";
CREATE TABLE "realiza" (
	"id_usuario"	INTEGER NOT NULL,
	"id_pedido"	INTEGER NOT NULL,
	PRIMARY KEY("id_usuario","id_pedido"),
	FOREIGN KEY("id_pedido") REFERENCES "Pedidos"("id"),
	FOREIGN KEY("id_usuario") REFERENCES "Usuarios"("id")
);
DROP TABLE IF EXISTS "tiene";
CREATE TABLE "tiene" (
	"id_ingrediente"	INTEGER NOT NULL,
	"id_receta"	INTEGER NOT NULL,
	"cantidad"	INTEGER NOT NULL CHECK("cantidad" > 0),
	"cantidad_esp"	INTEGER NOT NULL CHECK("cantidad_esp" > 0),
	PRIMARY KEY("id_ingrediente","id_receta"),
	FOREIGN KEY("id_ingrediente") REFERENCES "Ingredientes"("id"),
	FOREIGN KEY("id_receta") REFERENCES "Recetas"("id")
);
DROP TABLE IF EXISTS "valoraciones";
CREATE TABLE "valoraciones" (
	"id_usuario"	INTEGER NOT NULL,
	"id_receta"	INTEGER NOT NULL,
	"valoracion"	INTEGER NOT NULL CHECK("valoracion" BETWEEN 0 AND 5),
	PRIMARY KEY("id_usuario","id_receta"),
	FOREIGN KEY("id_receta") REFERENCES "Recetas"("id"),
	FOREIGN KEY("id_usuario") REFERENCES "Usuarios"("id")
);
COMMIT;
