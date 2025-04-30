import Category from "../models/Category.js";

// Función helper para convertir los objetos de Sequelize a objetos planos
function toJSON(data) {
  if (!data) return null;
  if (Array.isArray(data)) {
    return data.map((item) => (item.toJSON ? item.toJSON() : item));
  }
  return data.toJSON ? data.toJSON() : data;
}

// Obtener todas las categorias
export async function getAllCategories() {
  try {
    const categories = await Category.findAll();
    return toJSON(categories) || [];
  } catch (error) {
    console.error("Error al obtener las categorias: ", error);
    return [];
  }
}

// Obtener una categoria por ID
export async function getCategoryById(id) {
  try {
    const category = await Category.findByPk(id);
    return toJSON(category);
  } catch (error) {
    console.error("Error al obtener la categoria:", error);
    return null;
  }
}

// Crear una nueva categoria
export async function createCategory(categoryData) {
  try {
    // Asegurarse de que la categoría se marque como modificada para la sincronización
    const category = await Category.create({
      ...categoryData,
      modified: true
    });
    return toJSON(category);
  } catch (error) {
    console.error("Error al crear la categoria:", error);
    throw error;
  }
}

// Actualizar una categoria existente
export async function updateCategory(id, categoryData) {
  try {
    const category = await Category.findByPk(id);
    if (!category) return null;
    // Asegurarse de que la categoría se marque como modificada para la sincronización
    await category.update({
      ...categoryData,
      modified: true
    });
    return toJSON(category);
  } catch (error) {
    console.error("Error al actualizar la categoria: ", error);
    throw error;
  }
}

// Eliminar una categoria
export async function deleteCategory(id) {
  try {
    const category = await Category.findByPk(id);
    if (!category) return null;
    await category.destroy();
    return true;
  } catch (error) {
    console.error("Error al eliminar la categoria:", error);
    return false;
  }
}

// Actualizar categorías después de la sincronización
export async function updateCategoriesAfterSync(syncResults) {
  try {
    console.log("Procesando actualización de categorías después de sincronización");
    
    // Inicializar contadores para el reporte
    const result = {
      updated: 0,
      added: 0,
      skipped: 0
    };
    
    // Verificar que tenemos categorías del servidor para procesar
    if (!syncResults.serverCategories || !Array.isArray(syncResults.serverCategories)) {
      console.warn("No hay categorías del servidor para actualizar");
      return result;
    }
    
    // Marcamos categorías como sincronizadas y creamos las nuevas
    for (const serverCategory of syncResults.serverCategories) {
      try {
        // Buscar si ya existe la categoría en la base de datos local
        let existingCategory = await Category.findOne({ 
          where: { name: serverCategory.name }
        });
        
        if (existingCategory) {
          // Actualizar la categoría existente
          await existingCategory.update({
            ...serverCategory,
            synced: true,
            deletedLocally: false
          });
          result.updated++;
        } else {
          // Crear nueva categoría
          await Category.create({
            ...serverCategory,
            synced: true
          });
          result.added++;
        }
      } catch (categoryError) {
        console.error(`Error al procesar categoría ${serverCategory.name}:`, categoryError);
        result.skipped++;
      }
    }
    
    console.log(`Sincronización de categorías completada: ${result.updated} actualizadas, ${result.added} agregadas, ${result.skipped} omitidas`);
    return result;
  } catch (error) {
    console.error("Error al actualizar categorías después de sincronización:", error);
    throw error;
  }
}

// Eliminar físicamente las categorías marcadas como eliminadas localmente
export async function purgeDeletedCategories() {
  try {
    // Buscar categorías marcadas como eliminadas localmente
    const categoriesToDelete = await Category.findAll({
      where: {
        deletedLocally: true
      }
    });
    
    console.log(`Encontradas ${categoriesToDelete.length} categorías a purgar`);
    
    // Eliminar cada categoría de la base de datos
    for (const category of categoriesToDelete) {
      await category.destroy();
    }
    
    return categoriesToDelete.length;
  } catch (error) {
    console.error("Error al purgar categorías eliminadas:", error);
    return 0;
  }
}
