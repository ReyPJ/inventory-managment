import { Product, Category } from "../index.js";
import { Op } from "sequelize";

// Función helper para convertir los objetos de Sequelize a objetos planos
function toJSON(data) {
  if (!data) return null;
  if (Array.isArray(data)) {
    return data.map((item) => (item.toJSON ? item.toJSON() : item));
  }
  return data.toJSON ? data.toJSON() : data;
}

// Obtener todos los productos
export async function getAllProducts() {
  try {
    const products = await Product.findAll({
      include: [Category],
      order: [["updatedAt", "DESC"]],
    });
    return toJSON(products);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    return [];
  }
}

// Obtener un producto por ID
export async function getProductById(id) {
  try {
    const product = await Product.findByPk(id, {
      include: [Category],
    });
    return toJSON(product);
  } catch (err) {
    console.error("Error al obtener el producto:", err);
    return null;
  }
}

// Buscar un producto por el codigo de barras
export async function getProductByBarcode(barcode) {
  try {
    const product = await Product.findOne({
      where: { barcode },
      include: [Category],
    });
    return toJSON(product);
  } catch (err) {
    console.error("Error al obtener el producto por codigo de barras:", err);
    return null;
  }
}

// Craar un nuevo producto
export async function createProduct(productData) {
  try {
    const product = await Product.create(productData);
    return toJSON(product);
  } catch (err) {
    console.error("Error al crear el producto:", err);
    throw err; // Propagar el error para manejarlo en el cliente
  }
}

// Actualizar un producto existente
export async function updateProduct(id, productData) {
  try {
    const product = await Product.findByPk(id);
    if (!product) return null;
    await product.update(productData);
    return toJSON(product);
  } catch (err) {
    console.error("Error al actualizar el producto:", err);
    throw err;
  }
}

// Eliminar un producto
export async function deleteProduct(id) {
  try {
    const product = await Product.findByPk(id);
    if (!product) return false;
    await product.destroy();
    return true;
  } catch (err) {
    console.error("Error al eliminar el producto:", err);
    return false;
  }
}

// Buscar productos por su nombre
export async function searchProducts(query) {
  try {
    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { barcode: { [Op.like]: `%${query}%` } },
        ],
      },
      include: [Category],
    });
    return toJSON(products);
  } catch (err) {
    console.error("Error al buscar productos:", err);
    return [];
  }
}
