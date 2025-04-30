import { Op } from "sequelize";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { markProductAsDeleted } from "../../utils/syncService.js";

// Función helper para convertir modelos a JSON
const toJSON = (data) => {
  return data ? JSON.parse(JSON.stringify(data)) : null;
};

// Obtener todos los productos (incluyendo los marcados como eliminados)
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

// Obtener todos los productos activos (excluyendo los marcados como eliminados)
export async function getAllActiveProducts() {
  try {
    const products = await Product.findAll({
      where: {
        deletedLocally: false,
      },
      include: [Category],
      order: [["updatedAt", "DESC"]],
    });
    return toJSON(products);
  } catch (err) {
    console.error("Error al obtener productos activos:", err);
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
      where: {
        barcode,
        deletedLocally: false, // Solo buscar en productos activos
      },
      include: [Category],
    });
    return toJSON(product);
  } catch (err) {
    console.error("Error al obtener el producto por codigo de barras:", err);
    return null;
  }
}

// Crear un nuevo producto
export async function createProduct(productData) {
  try {
    // Marcar como modificado y no sincronizado
    const data = {
      ...productData,
      modified: true,
      synced: false,
    };

    const product = await Product.create(data);
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

    // Marcar como modificado y no sincronizado
    const data = {
      ...productData,
      modified: true,
      synced: false,
    };

    await product.update(data);
    return toJSON(product);
  } catch (err) {
    console.error("Error al actualizar el producto:", err);
    throw err;
  }
}

// Eliminar un producto (marcado como eliminado localmente)
export async function deleteProduct(id) {
  try {
    const product = await Product.findByPk(id);
    if (!product) return false;

    // Marcar como eliminado localmente en lugar de eliminar físicamente
    await product.update({
      deletedLocally: true,
      modified: true,
      synced: false,
    });

    // Registrar en el servicio de sincronización
    markProductAsDeleted(id);

    return true;
  } catch (err) {
    console.error("Error al eliminar el producto:", err);
    return false;
  }
}

// Buscar productos por su nombre (solo activos)
export async function searchProducts(query) {
  try {
    const products = await Product.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { name: { [Op.like]: `%${query}%` } },
              { barcode: { [Op.like]: `%${query}%` } },
            ],
          },
          { deletedLocally: false }, // Solo buscar en productos activos
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

// Actualizar productos después de una sincronización exitosa
export async function updateProductsAfterSync(syncResults) {
  try {
    const { syncedProducts, serverProducts } = syncResults;

    // Contadores para estadísticas
    let updated = 0;
    let added = 0;
    let skipped = 0;

    // 1. Marcar productos locales como sincronizados
    if (syncedProducts && Array.isArray(syncedProducts)) {
      for (const syncedProduct of syncedProducts) {
        const localProduct = await Product.findOne({
          where: { barcode: syncedProduct.barcode },
        });

        if (localProduct) {
          await localProduct.update({
            synced: true,
            modified: false,
            lastSync: new Date(),
            syncError: null,
            remoteId: syncedProduct.id,
          });
          updated++;
        }
      }
    }

    // Obtener todos los productos marcados como eliminados localmente
    const deletedProducts = await Product.findAll({
      where: { deletedLocally: true },
    });
    const locallyDeletedBarcodes = deletedProducts.map((p) => p.barcode);

    console.log(
      `Verificando ${
        serverProducts?.length || 0
      } productos del servidor contra ${
        locallyDeletedBarcodes.length
      } códigos eliminados localmente`
    );

    // 2. Agregar productos nuevos del servidor (solo si no fueron eliminados localmente)
    if (serverProducts && Array.isArray(serverProducts)) {
      for (const serverProduct of serverProducts) {
        try {
          // Verificar si ya existe localmente o si está en la lista de eliminados
          const exists = await Product.findOne({
            where: { barcode: serverProduct.barcode },
          });

          // Si el producto está en la lista de barcodes eliminados, no lo agregamos
          if (locallyDeletedBarcodes.includes(serverProduct.barcode)) {
            console.log(
              `Producto con barcode ${serverProduct.barcode} no agregado porque fue eliminado localmente`
            );
            skipped++;
            continue;
          }

          if (!exists) {
            // Verificar si el producto tiene CategoryId y si la categoría existe
            let productData = {
              ...serverProduct,
              synced: true,
              modified: false,
              deletedLocally: false,
              lastSync: new Date(),
              remoteId: serverProduct.id,
            };

            // Si tiene CategoryId, verificar que la categoría exista
            if (serverProduct.CategoryId) {
              const categoryExists = await Category.findByPk(serverProduct.CategoryId);
              
              if (!categoryExists) {
                console.log(`Categoría ID ${serverProduct.CategoryId} no encontrada para producto ${serverProduct.name}. Estableciendo CategoryId como null.`);
                // Si la categoría no existe, establecer CategoryId como null
                productData.CategoryId = null;
              }
            }

            // Es un producto nuevo del servidor, agregarlo localmente
            await Product.create(productData);
            added++;
          }
        } catch (error) {
          console.error(`Error procesando producto ${serverProduct.barcode}:`, error);
          skipped++;
        }
      }
    }

    return { updated, added, skipped };
  } catch (err) {
    console.error(
      "Error al actualizar productos después de sincronización:",
      err
    );
    
    // Manejar específicamente errores de restricción de clave foránea
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      console.error("Error de restricción de clave foránea. Probablemente una categoría no existe en la base de datos local.");
      console.error("Detalles:", {
        name: err.name,
        message: err.message,
        sql: err.sql,
        table: err.table || 'Desconocida'
      });
      
      // Devolver información del error pero permitir continuar con la sincronización
      return { 
        updated: 0, 
        added: 0, 
        skipped: 0,
        error: "Error de restricción de clave foránea. Las categorías referenciadas por los productos no existen en la base de datos local." 
      };
    }
    
    throw err;
  }
}

// Limpiar productos marcados como eliminados después de sincronización exitosa
export async function purgeDeletedProducts() {
  try {
    // Obtener todos los productos marcados como eliminados
    const deleted = await Product.findAll({
      where: { deletedLocally: true },
    });

    // Eliminar físicamente de la base de datos
    for (const product of deleted) {
      await product.destroy();
    }

    return deleted.length;
  } catch (err) {
    console.error("Error al purgar productos eliminados:", err);
    return 0;
  }
}
