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
    // Modificar para excluir categorías marcadas como eliminadas localmente
    const categories = await Category.findAll({
      where: {
        deletedLocally: false
      }
    });
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
    
    // En lugar de eliminarla físicamente, marcarla como eliminada localmente
    await category.update({
      deletedLocally: true,
      modified: true,
      synced: false
    });
    
    // Registrar en el servicio de sincronización
    try {
      const { markCategoryAsDeleted } = await import('../../utils/syncService.js');
      if (typeof markCategoryAsDeleted === 'function') {
        markCategoryAsDeleted(id);
      }
    } catch (error) {
      console.error('Error al registrar categoría eliminada en servicio de sincronización:', error);
    }
    
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
    
    // Verificar si tenemos datos de categorías recibidos del servidor
    const { categoriesToUpdateLocally } = syncResults;
    if (!categoriesToUpdateLocally) {
      console.warn("No hay datos de categorías para actualizar localmente");
      return result;
    }
    
    console.log("Datos de categorías a actualizar:", JSON.stringify(categoriesToUpdateLocally));
    
    // Procesar categorías creadas en el servidor
    if (categoriesToUpdateLocally.created && Array.isArray(categoriesToUpdateLocally.created)) {
      console.log(`Procesando ${categoriesToUpdateLocally.created.length} categorías nuevas`);
      
      for (const serverCategory of categoriesToUpdateLocally.created) {
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
              modified: false
            });
            console.log(`Categoría actualizada: ${existingCategory.name}, ID: ${existingCategory.id}`);
            result.updated++;
          } else {
            // Crear nueva categoría
            const newCategory = await Category.create({
              ...serverCategory,
              synced: true,
              modified: false
            });
            console.log(`Categoría creada: ${newCategory.name}, ID: ${newCategory.id}`);
            result.added++;
          }
        } catch (categoryError) {
          console.error(`Error al procesar categoría nueva ${serverCategory.name}:`, categoryError);
          result.skipped++;
        }
      }
    }
    
    // Procesar categorías actualizadas del servidor
    if (categoriesToUpdateLocally.updated && Array.isArray(categoriesToUpdateLocally.updated)) {
      console.log(`Procesando ${categoriesToUpdateLocally.updated.length} categorías actualizadas`);
      
      for (const serverCategory of categoriesToUpdateLocally.updated) {
        try {
          // Buscar si ya existe la categoría en la base de datos local
          let existingCategory = await Category.findOne({ 
            where: { id: serverCategory.id }
          });
          
          if (existingCategory) {
            // Actualizar la categoría existente
            await existingCategory.update({
              ...serverCategory,
              synced: true,
              modified: false
            });
            console.log(`Categoría actualizada: ${existingCategory.name}, ID: ${existingCategory.id}`);
            result.updated++;
          } else {
            // La categoría no existe localmente, intentar buscarla por nombre
            existingCategory = await Category.findOne({ 
              where: { name: serverCategory.name }
            });
            
            if (existingCategory) {
              // Actualizar la categoría existente, incluyendo su ID
              await existingCategory.update({
                ...serverCategory,
                synced: true,
                modified: false
              });
              console.log(`Categoría actualizada por nombre: ${existingCategory.name}, ID actualizado a: ${serverCategory.id}`);
              result.updated++;
            } else {
              // Crear la categoría como nueva
              const newCategory = await Category.create({
                ...serverCategory,
                synced: true,
                modified: false
              });
              console.log(`Categoría creada desde actualización: ${newCategory.name}, ID: ${newCategory.id}`);
              result.added++;
            }
          }
        } catch (categoryError) {
          console.error(`Error al procesar categoría actualizada ${serverCategory.name}:`, categoryError);
          result.skipped++;
        }
      }
    }
    
    // Procesar IDs de categorías eliminadas del servidor
    if (categoriesToUpdateLocally.deleted && Array.isArray(categoriesToUpdateLocally.deleted) && categoriesToUpdateLocally.deleted.length > 0) {
      console.log(`Procesando ${categoriesToUpdateLocally.deleted.length} categorías eliminadas`);
      
      for (const categoryId of categoriesToUpdateLocally.deleted) {
        try {
          // Buscar la categoría por ID
          const categoryToDelete = await Category.findByPk(categoryId);
          
          if (categoryToDelete) {
            // Eliminar físicamente la categoría
            await categoryToDelete.destroy();
            console.log(`Categoría eliminada: ID ${categoryId}`);
          } else {
            console.log(`Categoría ID ${categoryId} no encontrada para eliminar`);
          }
        } catch (deleteError) {
          console.error(`Error al eliminar categoría ID ${categoryId}:`, deleteError);
        }
      }
    }
    
    // Verificar también las categorías del servidor
    if (syncResults.serverCategories && Array.isArray(syncResults.serverCategories)) {
      console.log(`Adicionalmente, verificando ${syncResults.serverCategories.length} categorías recibidas del servidor`);
      
      // Crear un mapa de categorías locales por ID para referencia rápida
      const localCategoriesById = {};
      const allLocalCategories = await Category.findAll();
      allLocalCategories.forEach(cat => {
        localCategoriesById[cat.id] = cat;
      });
      
      for (const serverCategory of syncResults.serverCategories) {
        try {
          // Si la categoría no existe localmente, crearla
          if (serverCategory.id && !localCategoriesById[serverCategory.id]) {
            // Verificar si ya existe una categoría con el mismo nombre
            const existingByName = await Category.findOne({
              where: { name: serverCategory.name }
            });
            
            if (!existingByName) {
              const newCategory = await Category.create({
                ...serverCategory,
                synced: true,
                modified: false
              });
              console.log(`Categoría creada desde serverCategories: ${newCategory.name}, ID: ${newCategory.id}`);
              result.added++;
            }
          }
        } catch (error) {
          console.error(`Error al procesar categoría del servidor ${serverCategory.name}:`, error);
        }
      }
    }
    
    console.log(`Sincronización de categorías completada: ${result.updated} actualizadas, ${result.added} agregadas, ${result.skipped} omitidas`);
    return result;
  } catch (error) {
    console.error("Error al actualizar categorías después de sincronización:", error);
    throw error;
  }
}

// Eliminar físicamente las categorías que deberían ser eliminadas
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

// Nueva función para eliminar categorías basada en IDs específicos
export async function deleteCategoriesByIds(categoryIds) {
  if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
    console.log("No hay IDs de categorías para eliminar");
    return 0;
  }
  
  try {
    console.log(`Eliminando categorías con IDs: ${categoryIds.join(', ')}`);
    let deletedCount = 0;
    
    for (const id of categoryIds) {
      const category = await Category.findByPk(id);
      if (category) {
        await category.destroy();
        deletedCount++;
      }
    }
    
    console.log(`${deletedCount} categorías eliminadas correctamente`);
    return deletedCount;
  } catch (error) {
    console.error("Error al eliminar categorías por IDs:", error);
    return 0;
  }
}
