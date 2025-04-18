BEGIN TRANSACTION;
INSERT INTO "Ingredientes" VALUES (1,'Harina','Granos',1.5,100,1, NULL);
INSERT INTO "Ingredientes" VALUES (2,'Azúcar','Endulzantes',1.0,50,1, NULL);
INSERT INTO "Ingredientes" VALUES (3,'Sal','Condimentos',0.5,200,1, NULL);
INSERT INTO "Ingredientes" VALUES (4,'Leche','Lácteos',2.0,30,1, NULL);
INSERT INTO "Ingredientes" VALUES (5,'Huevos','Proteínas',3.0,40,1, NULL);
INSERT INTO "Ingredientes" VALUES (6,'Tomate','Verduras',1.2,60,1, NULL);
INSERT INTO "Ingredientes" VALUES (7,'Queso','Lácteos',4.0,20,1, NULL);
INSERT INTO "Ingredientes" VALUES (8,'Aceite','Grasas',5.5,25,1, NULL);
INSERT INTO "Ingredientes" VALUES (9,'Pollo','Carnes',6.0,15,1, NULL);
INSERT INTO "Ingredientes" VALUES (10,'Pasta','Carbohidratos',2.5,80,1, NULL);
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

-- Relación para Empanadas (id_receta 9)
INSERT INTO "tiene" VALUES (9, 9, 300);  -- Pollo
INSERT INTO "tiene" VALUES (1, 9, 250);  -- Harina

UPDATE "Recetas" SET "imagen_url" = 'https://www.hola.com/horizon/landscape/2f4a35cad37e-sopa-tomate-t.jpg' WHERE "id" = 3;
UPDATE "Recetas" SET "imagen_url" = 'https://media.istockphoto.com/id/1280329631/es/foto/pizza-margherita-italiana-con-tomates-y-queso-mozzarella-sobre-tabla-de-cortar-de-madera-de.jpg?s=612x612&w=0&k=20&c=3i8gzmaA2vbfIQRetPK1SLh0l6u_CC_HniYuBT884aU=' WHERE "id" = 4;
UPDATE "Recetas" SET "imagen_url" = 'https://www.recetasderechupete.com/wp-content/uploads/2020/11/Arroz-con-pollo-cubano-3-1200x803.jpg' WHERE "id" = 5;
UPDATE "Recetas" SET "imagen_url" = 'https://peopleenespanol.com/thmb/xv-XKxUO3fRnBnsM7E6tdSigSLI=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/pasta-alfredo.jpg-2000-69428c009d434a03848151670738a5bc.jpg' WHERE "id" = 6;
UPDATE "Recetas" SET "imagen_url" = 'https://www.hogarmania.com/archivos/201611/tostada-francesa-pain-perdu-receta-10-668x400x80xX.jpg' WHERE "id" = 7;
UPDATE "Recetas" SET "imagen_url" = 'https://cdn0.uncomo.com/es/posts/6/3/7/como_hacer_un_omelette_de_queso_31736_orig.jpg' WHERE "id" = 8;
UPDATE "Recetas" SET "imagen_url" = 'https://peopleenespanol.com/thmb/px5GarUe0rxAr66lKEaboMetCHM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-1158987157-2000-25ff8f49b6af4027ac4a62eed28effd7.jpg' WHERE "id" = 9;
UPDATE "Recetas" SET "imagen_url" = 'https://recetasdecocina.elmundo.es/wp-content/uploads/2020/01/churros-receta.jpg' WHERE "id" = 10;

UPDATE "Ingredientes" SET "imagen_url" = 'https://www.pastasgallo.es/wp-content/uploads/2020/11/pack_harina_trigo.png' WHERE "id" = 1;
UPDATE "Ingredientes" SET "imagen_url" = 'https://sgfm.elcorteingles.es/SGFM/dctm/MEDIA03/202002/05/00120930500044____2__600x600.jpg' WHERE "id" = 2;
UPDATE "Ingredientes" SET "imagen_url" = 'https://www.salineraespanola.com/wp-content/uploads/2017/04/Salinera-Espanola_Sal-marina-fina-seca_Leda_pack-1kg-800x801.jpg' WHERE "id" = 3;
UPDATE "Ingredientes" SET "imagen_url" = 'https://sgfm.elcorteingles.es/SGFM/dctm/MEDIA03/202306/20/00120912100029____15__1200x1200.jpg' WHERE "id" = 4;
UPDATE "Ingredientes" SET "imagen_url" = 'https://phantom-elmundo.unidadeditorial.es/27ff9dd1d9c43d565aa90024c3bbfe2e/crop/28x939/3072x2968/resize/746/f/webp/assets/multimedia/imagenes/2021/10/07/16336039175865.jpg' WHERE "id" = 5;
UPDATE "Ingredientes" SET "imagen_url" = 'https://fundaciondelcorazon.com/images/stories/notas-de-prensa/tomate.jpg' WHERE "id" = 6;
UPDATE "Ingredientes" SET "imagen_url" = 'https://sgfm.elcorteingles.es/SGFM/dctm/MEDIA03/202204/29/00118385800034____3__1200x1200.jpg' WHERE "id" = 7;
UPDATE "Ingredientes" SET "imagen_url" = 'https://sgfm.elcorteingles.es/SGFM/dctm/MEDIA03/202310/10/00120902600079____17__600x600.jpg' WHERE "id" = 8;
UPDATE "Ingredientes" SET "imagen_url" = 'https://sgfm.elcorteingles.es/SGFM/dctm/MEDIA03/202302/28/00118460511332____2__600x600.jpg' WHERE "id" = 9;
UPDATE "Ingredientes" SET "imagen_url" = 'https://sgfm.elcorteingles.es/SGFM/dctm/MEDIA03/202104/14/00118003501204____7__600x600.jpg' WHERE "id" = 10;

COMMIT;
