import sequelize from "./config/database.js";
import Product from "./models/Product.js";
import Category from "./models/Category.js";

// Definir las relaciones
Category.hasMany(Product);
Product.belongsTo(Category);

async function initDatabase() {
  try {
    // Sincronizar la base de datos (crar tablas si no existen)
    await sequelize.sync();

    // Crear categorias por defecto si no existen
    const defaultCategories = ["PS4", "PS5"];

    for (const catName of defaultCategories) {
      await Category.findOrCreate({
        where: { name: catName },
      });
    }
    console.log("Base de datos inicializada correctamente");
    return true;
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
    return false;
  }
}

export { sequelize, Product, Category, initDatabase };
