// Script de migración para añadir el campo description a la tabla Products
import { Sequelize } from "sequelize";

export async function up(queryInterface) {
  try {
    // Verificar si la columna ya existe
    const tableInfo = await queryInterface.describeTable("Products");

    if (!tableInfo.description) {
      // Añadir la columna description si no existe
      await queryInterface.addColumn("Products", "description", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
      console.log(
        '✅ Columna "description" añadida correctamente a la tabla Products'
      );
    } else {
      console.log('ℹ️ La columna "description" ya existe en la tabla Products');
    }

    return Promise.resolve();
  } catch (error) {
    console.error("❌ Error al migrar:", error);
    return Promise.reject(error);
  }
}

// Función para revertir la migración
export async function down(queryInterface) {
  try {
    await queryInterface.removeColumn("Products", "description");
    console.log(
      '✅ Columna "description" eliminada correctamente de la tabla Products'
    );
    return Promise.resolve();
  } catch (error) {
    console.error("❌ Error al revertir la migración:", error);
    return Promise.reject(error);
  }
}
