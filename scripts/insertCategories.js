import { Category, sequelize, initDatabase } from "../src/db/index.js";

async function insertTestCategories() {
  try {
    // Inicializar la base de datos primero
    await initDatabase();

    // Categorías de prueba
    const categories = [
      { name: "PS4", description: "Juegos y accesorios para PlayStation 4" },
      { name: "PS5", description: "Juegos y accesorios para PlayStation 5" },
      {
        name: "Switch",
        description: "Juegos y accesorios para Nintendo Switch",
      },
    ];

    // Borrar categorías existentes (opcional)
    await Category.destroy({ where: {} });

    // Insertar nuevas categorías
    for (const cat of categories) {
      await Category.create(cat);
      console.log(`Categoría creada: ${cat.name}`);
    }

    // Verificar que se hayan insertado correctamente
    const allCategories = await Category.findAll();
    console.log(
      "Categorías en la base de datos:",
      allCategories.map((c) => c.toJSON())
    );

    console.log("¡Proceso completado!");

    // Cerrar la conexión
    await sequelize.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

insertTestCategories();
