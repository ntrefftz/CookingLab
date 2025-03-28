BEGIN TRANSACTION;
INSERT INTO "Ingredientes" VALUES (1,'Harina','Granos',1.5,100,1);
INSERT INTO "Ingredientes" VALUES (2,'Azúcar','Endulzantes',1.0,50,1);
INSERT INTO "Ingredientes" VALUES (3,'Sal','Condimentos',0.5,200,1);
INSERT INTO "Ingredientes" VALUES (4,'Leche','Lácteos',2.0,30,1);
INSERT INTO "Ingredientes" VALUES (5,'Huevos','Proteínas',3.0,40,1);
INSERT INTO "Ingredientes" VALUES (6,'Tomate','Verduras',1.2,60,1);
INSERT INTO "Ingredientes" VALUES (7,'Queso','Lácteos',4.0,20,1);
INSERT INTO "Ingredientes" VALUES (8,'Aceite','Grasas',5.5,25,1);
INSERT INTO "Ingredientes" VALUES (9,'Pollo','Carnes',6.0,15,1);
INSERT INTO "Ingredientes" VALUES (10,'Pasta','Carbohidratos',2.5,80,1);
INSERT INTO "Pedidos" VALUES (1,25.5,0,1);
INSERT INTO "Pedidos" VALUES (2,14.0,1,1);
INSERT INTO "Pedidos" VALUES (3,30.75,0,1);
INSERT INTO "Pedidos" VALUES (4,22.1,1,1);
INSERT INTO "Pedidos" VALUES (5,45.6,0,1);
INSERT INTO "Pedidos" VALUES (6,33.2,1,1);
INSERT INTO "Pedidos" VALUES (7,19.8,0,1);
INSERT INTO "Pedidos" VALUES (8,50.0,1,1);
INSERT INTO "Pedidos" VALUES (9,28.9,0,1);
INSERT INTO "Pedidos" VALUES (10,15.6,1,1);
INSERT INTO "Recetas" VALUES (3,'Sopa de Tomate','Sopa caliente con tomates frescos.',1800,2,3,1,NULL);
INSERT INTO "Recetas" VALUES (4,'Pizza Margarita','Pizza clásica con tomate y queso.',2700,3,4,1,NULL);
INSERT INTO "Recetas" VALUES (5,'Arroz con Pollo','Plato típico con arroz y pollo.',3200,3,5,1,NULL);
INSERT INTO "Recetas" VALUES (6,'Pasta Alfredo','Pasta con crema y queso parmesano.',2500,2,6,1,NULL);
INSERT INTO "Recetas" VALUES (7,'Tostadas Francesas','Tostadas dulces con huevo y leche.',1800,2,7,1,NULL);
INSERT INTO "Recetas" VALUES (8,'Omelette de Queso','Huevo batido con queso fundido.',900,1,8,1,NULL);
INSERT INTO "Recetas" VALUES (9,'Empanadas','Empanadas rellenas de carne.',4200,4,9,1,NULL);
INSERT INTO "Recetas" VALUES (10,'Churros','Postre frito con azúcar y canela.',2400,3,10,1,NULL);
INSERT INTO "Usuarios" VALUES ('user','$2b$10$JdCg8yL3rRkkr.hhx1rjqOe30F9lhBlqA1sjYJW6ymzYExvQFHyjy','Usuario','Default','user@cookinglabs.com','C/ Calle 14, Madrid','U',1,1);
INSERT INTO "Usuarios" VALUES ('admin','$2b$10$Htah5iG9eKj8ItIItpzK6uvny3c5/QjdZaLwwmFy32RPrfVspNgYS','Administrador','Default','admin@cookinglab.com','C/ Avenida 106, Segovia','A',1,2);


-- Relaciones entre recetas e ingredientes
-- Relaciones para Pizza Margarita (id_receta 4)
INSERT INTO "tiene" VALUES (7, 4, 200);  -- Queso
INSERT INTO "tiene" VALUES (6, 4, 150);  -- Tomate
INSERT INTO "tiene" VALUES (1, 4, 300);  -- Harina
INSERT INTO "tiene" VALUES (5, 4, 2);    -- Huevos

-- Relaciones para Sopa de Tomate (id_receta 3)
INSERT INTO "tiene" VALUES (6, 3, 400);  -- Tomate
INSERT INTO "tiene" VALUES (3, 3, 10);   -- Sal

-- Relaciones para Arroz con Pollo (id_receta 5)
INSERT INTO "tiene" VALUES (9, 5, 500);  -- Pollo

-- Relaciones para Tostadas Francesas (id_receta 7)
INSERT INTO "tiene" VALUES (5, 7, 4);    -- Huevos
INSERT INTO "tiene" VALUES (4, 7, 200);  -- Leche

-- Relaciones para Omelette de Queso (id_receta 8)
INSERT INTO "tiene" VALUES (5, 8, 3);    -- Huevos
INSERT INTO "tiene" VALUES (7, 8, 150);  -- Queso

-- Relaciones para Pasta Alfredo (id_receta 6)
INSERT INTO "tiene" VALUES (10, 6, 300); -- Pasta
INSERT INTO "tiene" VALUES (7, 6, 200);  -- Queso

-- Relaciones para Churros (id_receta 10)
INSERT INTO "tiene" VALUES (1, 10, 250); -- Harina
INSERT INTO "tiene" VALUES (2, 10, 50);  -- Azúcar
COMMIT;
