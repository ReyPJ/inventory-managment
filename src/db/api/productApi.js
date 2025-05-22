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
    
    // Array para almacenar información sobre los productos omitidos
    const skippedProducts = [];

    // Crear un mapa de categorías por ID para referencia rápida
    const categoriesMap = {};
    try {
      const allCategories = await Category.findAll();
      allCategories.forEach(category => {
        categoriesMap[category.id] = category;
      });
      console.log(`Categorías disponibles en BD local: ${Object.keys(categoriesMap).length}`);
      console.log(`IDs de categorías: ${Object.keys(categoriesMap).join(', ')}`);
    } catch (error) {
      console.error("Error al obtener categorías para el mapa:", error);
    }

    // 1. Primero actualizar los productos existentes (los que fueron modificados)
    if (syncedProducts && syncedProducts.created && Array.isArray(syncedProducts.created)) {
      console.log(`Procesando ${syncedProducts.created.length} productos creados`);
      
      for (const syncedProduct of syncedProducts.created) {
        try {
          // Intentar encontrar por barcode
          const localProduct = await Product.findOne({
            where: { barcode: syncedProduct.barcode },
          });

          if (localProduct) {
            // Actualizar con los datos del servidor, incluyendo CategoryId
            const updateData = {
              synced: true,
              modified: false,
              lastSync: new Date(),
              syncError: null,
              remoteId: syncedProduct.id,
            };
            
            // Verificar si el producto viene con CategoryId y si esa categoría existe localmente
            if (syncedProduct.CategoryId || syncedProduct.category_id) {
              const categoryId = syncedProduct.CategoryId || syncedProduct.category_id;
              
              if (categoriesMap[categoryId]) {
                console.log(`Asignando categoría ${categoryId} a producto ${syncedProduct.name}`);
                updateData.CategoryId = categoryId;
              } else {
                console.log(`Categoría ${categoryId} no encontrada para producto ${syncedProduct.name}`);
              }
            }
            
            await localProduct.update(updateData);
            updated++;
          }
        } catch (error) {
          console.error(`Error al actualizar producto creado ${syncedProduct.barcode}:`, error);
          // Registrar este producto omitido con su razón
          skippedProducts.push({
            barcode: syncedProduct.barcode,
            name: syncedProduct.name || 'Nombre desconocido',
            reason: "error_actualizacion_producto_creado",
            error: error.message
          });
          skipped++;
        }
      }
    }
    
    if (syncedProducts && syncedProducts.updated && Array.isArray(syncedProducts.updated)) {
      console.log(`Procesando ${syncedProducts.updated.length} productos actualizados`);
      
      for (const syncedProduct of syncedProducts.updated) {
        try {
          // Intentar encontrar por barcode
          const localProduct = await Product.findOne({
            where: { barcode: syncedProduct.barcode },
          });

          if (localProduct) {
            // Actualizar con los datos del servidor, incluyendo CategoryId
            const updateData = {
              synced: true,
              modified: false,
              lastSync: new Date(),
              syncError: null,
              remoteId: syncedProduct.id,
            };
            
            // Verificar si el producto viene con CategoryId y si esa categoría existe localmente
            if (syncedProduct.CategoryId || syncedProduct.category_id) {
              const categoryId = syncedProduct.CategoryId || syncedProduct.category_id;
              
              if (categoriesMap[categoryId]) {
                console.log(`Asignando categoría ${categoryId} a producto ${syncedProduct.name}`);
                updateData.CategoryId = categoryId;
              } else {
                console.log(`Categoría ${categoryId} no encontrada para producto ${syncedProduct.name}`);
              }
            }
            
            await localProduct.update(updateData);
            updated++;
          }
        } catch (error) {
          console.error(`Error al actualizar producto ${syncedProduct.barcode}:`, error);
          // Registrar este producto omitido con su razón
          skippedProducts.push({
            barcode: syncedProduct.barcode,
            name: syncedProduct.name || 'Nombre desconocido',
            reason: "error_actualizacion_producto_existente",
            error: error.message
          });
          skipped++;
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
            // Registrar este producto omitido con su razón
            skippedProducts.push({
              barcode: serverProduct.barcode,
              name: serverProduct.name,
              reason: "eliminado_localmente",
              id: serverProduct.id
            });
            skipped++;
            continue;
          }

          if (!exists) {
            // Preparar datos del producto para creación
            let productData = {
              ...serverProduct,
              synced: true,
              modified: false,
              deletedLocally: false,
              lastSync: new Date(),
              remoteId: serverProduct.id,
            };

            // Verificar si el producto viene con CategoryId y si esa categoría existe localmente
            if (serverProduct.CategoryId || serverProduct.category_id) {
              // Usar CategoryId si está disponible, sino usar category_id
              const categoryId = serverProduct.CategoryId || serverProduct.category_id;
              
              // Si la categoría es inválida, no asignarla
              if (categoryId === 'N/A' || categoryId === null || categoryId === undefined) {
                console.log(`Categoría inválida para producto ${serverProduct.name}: ${categoryId}`);
                productData.CategoryId = null;
              }
              // Comprobar si la categoría existe en la base de datos local
              else if (categoriesMap[categoryId]) {
                console.log(`Asignando categoría ${categoryId} a nuevo producto ${serverProduct.name}`);
                productData.CategoryId = categoryId;
              } else {
                console.log(`Categoría ${categoryId} no encontrada para producto ${serverProduct.name}`);
                console.log(`CATEGORÍA FALTANTE: El producto ${serverProduct.name} (${serverProduct.barcode}) requiere la categoría ID=${categoryId} que no existe localmente`);
                
                // Registrar este producto como omitido por falta de categoría
                skippedProducts.push({
                  barcode: serverProduct.barcode,
                  name: serverProduct.name,
                  reason: "categoria_no_encontrada",
                  categoryId: categoryId
                });
                
                productData.CategoryId = null; // Establecer explícitamente como null
              }
            } else {
              console.log(`Producto ${serverProduct.name} no tiene categoría asignada`);
            }

            // Es un producto nuevo del servidor, agregarlo localmente
            try {
              // Verificar y corregir ID antes de crear
              if (!productData.id || productData.id === 'N/A') {
                console.log(`⚠️ PRODUCTO SIN ID: ${productData.name} (${productData.barcode})`);
                // Asegurarnos de no enviar un ID inválido
                delete productData.id;
              }
              
              const newProduct = await Product.create(productData);
              
              // Log detallado del producto creado
              console.log(`Producto creado: ${JSON.stringify({
                id: newProduct.id,
                name: newProduct.name,
                CategoryId: newProduct.CategoryId
              })}`);
              
              added++;
            } catch (createError) {
              console.error(`Error al crear producto ${productData.name} (${productData.barcode}):`, createError);
              console.error(`Detalles del producto con error:`, JSON.stringify(productData, null, 2));
              
              // Registrar este producto como omitido por error de validación
              skippedProducts.push({
                barcode: serverProduct.barcode,
                name: serverProduct.name,
                reason: "error_validacion",
                error: createError.message,
                details: {
                  id: productData.id || 'N/A',
                  fields: Object.keys(productData).join(', ')
                }
              });
              skipped++;
            }
          } else {
            // El producto ya existe, podríamos actualizar su CategoryId si es necesario
            // Verificar si el producto del servidor tiene CategoryId y si difiere del local
            if ((serverProduct.CategoryId || serverProduct.category_id) && 
                exists.CategoryId !== (serverProduct.CategoryId || serverProduct.category_id)) {
              
              const categoryId = serverProduct.CategoryId || serverProduct.category_id;
              
              // Verificar que la categoría existe
              if (categoriesMap[categoryId]) {
                console.log(`Actualizando CategoryId de producto existente ${exists.name} a ${categoryId}`);
                await exists.update({ 
                  CategoryId: categoryId,
                  synced: true,
                  modified: false,
                  lastSync: new Date()
                });
                updated++;
              }
            }
          }
        } catch (error) {
          console.error(`Error procesando producto ${serverProduct.barcode}:`, error);
          // Registrar este producto omitido con su razón
          skippedProducts.push({
            barcode: serverProduct.barcode,
            name: serverProduct.name || 'Nombre desconocido',
            reason: "error_procesamiento",
            error: error.message
          });
          skipped++;
        }
      }
    }

    // Log detallado de productos omitidos
    if (skippedProducts.length > 0) {
      console.log(`==========================================`);
      console.log(`DETALLE DE PRODUCTOS OMITIDOS (${skippedProducts.length}):`);
      skippedProducts.forEach((product, index) => {
        console.log(`Producto omitido #${index + 1}:`);
        console.log(`  ID: ${product.id || 'N/A'}`);
        console.log(`  Barcode: ${product.barcode}`);
        console.log(`  Nombre: ${product.name}`);
        console.log(`  Razón: ${product.reason}`);
        if (product.error) {
          console.log(`  Error: ${product.error}`);
        }
      });
      console.log(`==========================================`);
    }

    return { updated, added, skipped, skippedProducts };
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
