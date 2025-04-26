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
    const category = await Category.create(categoryData);
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
    await category.update(categoryData);
    return toJSON(category);
  } catch (error) {
    console.error("Error al crear la categoria: ", error);
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
