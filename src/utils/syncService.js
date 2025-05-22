/**
 * Servicio para sincronización con la API externa
 *
 * Maneja la comunicación bidireccional entre la aplicación Electron
 * y el servidor de sincronización.
 */

// Almacenamiento para la configuración de sincronización
let syncConfig = {
  apiUrl: "https://apilogisctica.com/api", // URL por defecto, cambiará en producción
  apiKey: null,
  tenant: null,
  lastSyncTime: null,
  isConfigured: false,
};

// Cache para almacenar productos eliminados localmente
const locallyDeletedProducts = new Set();

// Cache para almacenar categorías eliminadas localmente
const locallyDeletedCategories = new Set();

/**
 * Inicializa el servicio de sincronización con la API key del tenant
 * @param {string} apiKey - API key del tenant (cs_* para Casa, ng_* para Negocio)
 * @param {string} apiUrl - URL base de la API (opcional)
 * @returns {Promise<boolean>} - True si la configuración es exitosa
 */
export const initializeSyncService = async (apiKey, apiUrl = null) => {
  try {
    // Actualizar la URL si se proporciona
    if (apiUrl) {
      syncConfig.apiUrl = apiUrl;
    }

    syncConfig.apiKey = apiKey;

    // Determinar el tenant basado en el prefijo de la API key
    if (apiKey.startsWith("cs_")) {
      syncConfig.tenant = "Casa";
    } else if (apiKey.startsWith("ng_")) {
      syncConfig.tenant = "Negocio";
    } else {
      throw new Error("API key no válida");
    }

    // Verificar la conexión y validar la API key
    const isValid = await validateApiKey();
    if (!isValid) {
      throw new Error("No se pudo validar la API key con el servidor");
    }

    // Guardar la configuración en localStorage para persistencia
    saveConfig();

    // Cargar categorías y productos eliminados localmente
    loadDeletedCategoryIds();

    syncConfig.isConfigured = true;
    console.log(
      `Servicio de sincronización inicializado para tenant: ${syncConfig.tenant}`
    );

    return true;
  } catch (error) {
    console.error("Error al inicializar el servicio de sincronización:", error);
    return false;
  }
};

/**
 * Valida la API key con el servidor
 * @returns {Promise<boolean>} - True si la API key es válida
 */
const validateApiKey = async () => {
  try {
    // Intentar obtener información del tenant actual con la API key
    const response = await fetch(`${syncConfig.apiUrl}/tenants/me`, {
      headers: {
        "X-API-Key": syncConfig.apiKey,
      },
    });

    if (!response.ok) {
      console.error("Error al validar API key:", response.status);
      return false;
    }

    const tenantInfo = await response.json();
    console.log("Información del tenant validada:", tenantInfo);
    return true;
  } catch (error) {
    console.error("Error de conexión al validar API key:", error);
    return false;
  }
};

/**
 * Guarda la configuración actual en localStorage
 */
const saveConfig = () => {
  try {
    localStorage.setItem(
      "syncConfig",
      JSON.stringify({
        apiUrl: syncConfig.apiUrl,
        apiKey: syncConfig.apiKey,
        tenant: syncConfig.tenant,
        lastSyncTime: syncConfig.lastSyncTime,
      })
    );
  } catch (error) {
    console.error("Error al guardar configuración:", error);
  }
};

/**
 * Carga la configuración guardada previamente
 * @returns {boolean} - True si se cargó una configuración válida
 */
export const loadSavedConfig = () => {
  try {
    const savedConfig = localStorage.getItem("syncConfig");
    if (!savedConfig) return false;

    const config = JSON.parse(savedConfig);

    // Verificar que contenga los campos necesarios
    if (!config.apiKey) return false;

    // Actualizar la configuración global con los valores guardados
    syncConfig = {
      ...syncConfig,
      apiUrl: config.apiUrl || syncConfig.apiUrl,
      apiKey: config.apiKey,
      tenant:
        config.tenant ||
        (config.apiKey.startsWith("cs_")
          ? "Casa"
          : config.apiKey.startsWith("ng_")
          ? "Negocio"
          : null),
      lastSyncTime: config.lastSyncTime,
      isConfigured: true,
    };

    console.log(`Configuración cargada para tenant: ${syncConfig.tenant}`);
    return true;
  } catch (error) {
    console.error("Error al cargar configuración guardada:", error);
    return false;
  }
};

/**
 * Verifica si el servicio de sincronización está configurado
 * @returns {boolean}
 */
export const isSyncConfigured = () => {
  return syncConfig.isConfigured;
};

/**
 * Obtiene la información de configuración actual
 * @returns {Object} Configuración actual
 */
export const getSyncConfig = () => {
  return { ...syncConfig }; // Devolver copia para evitar modificaciones directas
};

/**
 * Filtrar categorías modificadas para sincronizar
 * @param {Array} categories - Lista de categorías
 * @returns {Array} - Lista de categorías preparadas para la sincronización
 */
const prepareCategoriesToSync = (categories) => {
  console.log("Preparando categorías para sincronización:", categories);
  
  // Filtrar categorías y asegurarse de que tengan todos los campos necesarios
  return categories.map(category => {
    // Verificar si la categoría tiene un ID válido (no undefined/null/"")
    const hasValidId = category.id !== undefined && 
                       category.id !== null && 
                       category.id !== "";
                       
    // Log para debugging
    console.log(`Preparando categoría para sync: nombre=${category.name}, id=${hasValidId ? category.id : 'sin ID'}`);
    
    // Construir objeto con los campos necesarios
    return {
      // Solo incluir ID si existe y es válido
      ...(hasValidId && { id: Number(category.id) }),
      name: category.name,
      description: category.description || '',
    };
  });
};

/**
 * Proceso completo de sincronización en dos pasos
 * @param {Array} localProducts - Productos locales
 * @param {Array} localCategories - Categorías locales
 * @returns {Promise<Object>} - Resultado de la sincronización
 */
export const fullSyncProcess = async (localProducts, localCategories = []) => {
  if (!syncConfig.isConfigured) {
    throw new Error("El servicio de sincronización no está configurado");
  }

  try {
    // Variable para almacenar todos los resultados de la sincronización
    const syncResults = {
      success: true,
      serverProducts: [],
      syncedProducts: null,
      deletedBarcodes: [],
      serverCategories: [],
      syncedCategories: null,
      deletedCategoryIds: [],
      categoriesToUpdateLocally: {
        created: [],
        updated: [],
        deleted: []
      }
    };
    
    console.log("====== ESTADO INICIAL DE SINCRONIZACIÓN ======");
    console.log(`Categorías eliminadas localmente (almacenadas): ${Array.from(locallyDeletedCategories)}`);
  
    // PASO 1: Obtener productos y categorías del servidor
    const serverProducts = await getServerProducts();
    const serverCategories = await getServerCategories();
    
    // Construir un mapa de categorías por ID para facilitar su acceso
    const categoriesById = {};
    serverCategories.forEach(category => {
      if (category.id) {
        categoriesById[category.id] = category;
      }
    });
    
    console.log('Mapa de categorías por ID:', categoriesById);
    
    console.log(`Obtenidos ${serverProducts.length} productos del servidor`);
    console.log(`Obtenidas ${serverCategories.length} categorías del servidor`);

    // Agregar log detallado de los productos locales para comparación
    console.log('====== ANÁLISIS DE PRODUCTOS LOCALES ======');
    console.log(`Total productos locales: ${localProducts.length}`);
    
    // Mostrar estadísticas de productos locales
    const localProductsWithCategory = localProducts.filter(p => p.category_id || p.CategoryId);
    console.log(`Productos locales con categoría asignada: ${localProductsWithCategory.length}/${localProducts.length}`);
    
    // Mostrar algunos ejemplos de productos locales con sus categorías
    const sampleSize = Math.min(localProducts.length, 3);
    for (let i = 0; i < sampleSize; i++) {
      const p = localProducts[i];
      console.log(`Producto local ${i+1}/${sampleSize}:`);
      console.log(`  ID: ${p.id}, Barcode: ${p.barcode}, Nombre: ${p.name}`);
      console.log(`  Categoría: category_id=${p.category_id}, CategoryId=${p.CategoryId}`);
    }
    console.log('===========================================');

    // Actualizar syncResults con los datos del servidor
    syncResults.serverProducts = serverProducts;
    syncResults.serverCategories = serverCategories;

    // Sincronizar productos
    const deletedProducts = localProducts.filter((p) => p.deletedLocally);
    const deletedBarcodes = deletedProducts.map((p) => p.barcode);
    
    // Guardar en syncResults
    syncResults.deletedBarcodes = deletedBarcodes;

    console.log(
      `Productos marcados como eliminados localmente: ${deletedBarcodes.length}`
    );

    // Filtrar productos del servidor que coinciden con códigos de barra de productos eliminados
    const filteredServerProducts = serverProducts.filter(
      (product) => !deletedBarcodes.includes(product.barcode)
    );
    
    // Actualizar syncResults
    syncResults.serverProducts = filteredServerProducts;

    console.log(
      `Productos filtrados del servidor después de excluir eliminados: ${filteredServerProducts.length}`
    );

    // Combinar productos del servidor con productos locales
    const allKnownProducts = mergeProducts(
      localProducts.filter((p) => !p.deletedLocally),
      filteredServerProducts
    );

    // Obtener todos los IDs de productos conocidos (excluyendo eliminados)
    const allKnownProductIds = allKnownProducts
      .map((p) => p.id)
      .filter((id) => id !== undefined && id !== null);
      
    // Sincronizar categorías - Ahora usamos directamente los IDs almacenados en locallyDeletedCategories
    console.log("====== ANÁLISIS DE CATEGORÍAS ELIMINADAS ======");
    console.log(`IDs en locallyDeletedCategories: ${Array.from(locallyDeletedCategories)}`);
    
    // Obtener IDs de categorías marcadas como eliminadas localmente
    // Combinamos tanto las categorías marcadas en la base de datos como las almacenadas en locallyDeletedCategories
    const dbDeletedCategories = localCategories.filter(c => c.deletedLocally).map(c => c.id);
    const allDeletedCategoryIds = Array.from(new Set([
      ...Array.from(locallyDeletedCategories),
      ...dbDeletedCategories
    ]));
    
    // Registrar las categorías eliminadas con más detalle
    console.log(`Categorías en la BD marcadas como deletedLocally: ${dbDeletedCategories.length}`);
    dbDeletedCategories.forEach(id => console.log(`  - Categoría ID ${id} marcada como eliminada en la BD`));
    
    console.log(`IDs guardados en locallyDeletedCategories: ${Array.from(locallyDeletedCategories).length}`);
    
    // Guardar en syncResults todos los IDs de categorías eliminadas
    syncResults.deletedCategoryIds = allDeletedCategoryIds;
    
    console.log(
      `Categorías marcadas como eliminadas (combinadas): ${allDeletedCategoryIds.length} - IDs: ${allDeletedCategoryIds}`
    );
    
    // Filtrar categorías del servidor que no han sido eliminadas localmente
    const filteredServerCategories = serverCategories.filter(
      (category) => !allDeletedCategoryIds.includes(category.id)
    );
    
    // Actualizar syncResults
    syncResults.serverCategories = filteredServerCategories;
    
    console.log(
      `Categorías filtradas del servidor después de excluir eliminadas: ${filteredServerCategories.length}`
    );
    
    // IMPORTANTE: Solo considerar categorías no eliminadas para la combinación
    // Filtrar categorías locales que no están marcadas como eliminadas
    const activeLocalCategories = localCategories.filter(c => !c.deletedLocally && !allDeletedCategoryIds.includes(c.id));
    console.log(`Categorías locales activas (no eliminadas): ${activeLocalCategories.length}`);
    
    // Combinamos solo las categorías no eliminadas
    const allKnownCategories = mergeCategories(
      activeLocalCategories,
      filteredServerCategories
    );
    
    // IMPORTANTE: Excluir explícitamente los IDs de categorías eliminadas de la lista de IDs conocidos
    // Esta es la parte clave que corrige el problema
    const allKnownCategoryIds = allKnownCategories
      .map((c) => c.id)
      .filter((id) => id !== undefined && id !== null && !allDeletedCategoryIds.includes(id));
    
    console.log(`IDs de categorías conocidas (para mantener): ${allKnownCategoryIds}`);
    console.log(`IDs de categorías marcadas como eliminadas: ${allDeletedCategoryIds}`);

    // PASO 2: Sincronizar primero las categorías y luego los productos
    console.log("PASO 2A: Sincronizando categorías primero");
    
    // Ya no filtramos por deletedLocally porque lo hicimos antes al definir activeLocalCategories
    // Solo enviamos categorías modificadas que no estén eliminadas
    const categoriesToSync = activeLocalCategories.filter(c => c.modified);
    console.log(`Categorías modificadas para sincronizar: ${categoriesToSync.length}`);
    
    // Si no hay categorías modificadas pero hay categorías locales, forzar la sincronización de todas
    // Esto asegura que en la primera sincronización todas las categorías se envíen al servidor
    let categoriesToSend = categoriesToSync;
    if (categoriesToSync.length === 0 && activeLocalCategories.length > 0) {
      console.log(`No hay categorías modificadas, pero hay ${activeLocalCategories.length} categorías locales. Forzando sincronización de todas las categorías.`);
      categoriesToSend = activeLocalCategories;
      console.log(`Enviando ${categoriesToSend.length} categorías no eliminadas al servidor`);
    }
    
    // Preparar las categorías para el envío asegurando que tengan todos los campos necesarios
    const preparedCategories = prepareCategoriesToSync(categoriesToSend);
    
    // Depurar lo que se envía al servidor
    console.log("Datos enviados al servidor para sincronización de categorías:", {
      categories: preparedCategories,
      ids: { ids: allKnownCategoryIds }
    });
    
    // Ahora sincronizamos las categorías con el servidor
    const categorySyncResult = await syncCategories(
      preparedCategories,
      allKnownCategoryIds
    );
    
    // Guardar resultado en syncResults
    syncResults.syncedCategories = categorySyncResult;
    
    console.log("Resultado de sincronización de categorías:", categorySyncResult);
    
    // PASO 2B: Actualizar las categorías locales con los datos recibidos del servidor
    // Esto asegura que las categorías estén disponibles antes de sincronizar productos
    if (categorySyncResult) {
      try {
        console.log("Procesando resultados de categorías recibidos del servidor");
        
        // Si tenemos categorías creadas en el servidor, las agregamos al listado
        if (categorySyncResult.created && categorySyncResult.created.length > 0) {
          console.log(`Recibidas ${categorySyncResult.created.length} categorías nuevas del servidor`);
          
          // Preparar categorías nuevas para actualización local
          const newCategories = categorySyncResult.created.map(category => ({
            ...category,
            synced: true,      // Marcar como sincronizada
            modified: false,   // No necesita sincronización adicional
            syncedAt: new Date().toISOString()
          }));
          
          // Guardar en los resultados
          syncResults.categoriesToUpdateLocally.created = newCategories;
          
          // Actualizar el mapa de categorías
          newCategories.forEach(category => {
            if (category.id) {
              categoriesById[category.id] = category;
            }
          });
        }
        
        // Si tenemos categorías actualizadas en el servidor, las agregamos al listado
        if (categorySyncResult.updated && categorySyncResult.updated.length > 0) {
          console.log(`Recibidas ${categorySyncResult.updated.length} categorías actualizadas del servidor`);
          
          // Preparar categorías actualizadas para actualización local
          const updatedCategories = categorySyncResult.updated.map(category => ({
            ...category,
            synced: true,      // Marcar como sincronizada
            modified: false,   // No necesita sincronización adicional
            syncedAt: new Date().toISOString()
          }));
          
          // Guardar en los resultados
          syncResults.categoriesToUpdateLocally.updated = updatedCategories;
          
          // Actualizar el mapa de categorías
          updatedCategories.forEach(category => {
            if (category.id) {
              categoriesById[category.id] = category;
            }
          });
        }
        
        // Si tenemos categorías eliminadas del servidor, guardarlas para actualización local
        if (categorySyncResult.deleted && categorySyncResult.deleted.length > 0) {
          console.log(`Recibidos ${categorySyncResult.deleted.length} IDs de categorías eliminadas del servidor`);
          syncResults.categoriesToUpdateLocally.deleted = categorySyncResult.deleted;
        }
      } catch (error) {
        console.error("Error procesando categorías para actualización local:", error);
      }
    }
    
    // PASO 2C: Ahora que las categorías están actualizadas, sincronizamos productos
    console.log("PASO 2C: Sincronizando productos");
    
    // Preparar productos para sincronización asegurando que la información de categoría esté correcta
    const productsToSync = localProducts
      .filter((p) => p.modified && !p.deletedLocally)
      .map(product => {
        // Crear una copia del producto
        const preparedProduct = { ...product };
        
        // Asegurar que tanto category_id como CategoryId estén presentes y sincronizados
        if (product.category_id && !product.CategoryId) {
          preparedProduct.CategoryId = Number(product.category_id);
        } else if (!product.category_id && product.CategoryId) {
          preparedProduct.category_id = Number(product.CategoryId);
        }
        
        return preparedProduct;
      });
    
    console.log(`Productos preparados para sincronización: ${productsToSync.length}`);
    productsToSync.forEach(p => 
      console.log(`  - ID: ${p.id}, Barcode: ${p.barcode}, Nombre: ${p.name}, CategoryId: ${p.CategoryId}, category_id: ${p.category_id}`)
    );
    
    const productSyncResult = await syncProducts(
      productsToSync,
      allKnownProductIds
    );
    
    // Guardar resultado en syncResults
    syncResults.syncedProducts = productSyncResult;

    // Preparar productos recibidos del servidor para actualización local
    if (productSyncResult) {
      try {
        console.log("Procesando resultados de productos recibidos del servidor");
        
        // Creamos un mapa de productos locales indexados por barcode para rápido acceso
        const localProductMap = {};
        localProducts.forEach(p => {
          if (p.barcode) {
            localProductMap[p.barcode] = p;
          }
        });
        
        // Si tenemos productos creados en el servidor, los preparamos para actualización local
        if (productSyncResult.created && productSyncResult.created.length > 0) {
          console.log(`Recibidos ${productSyncResult.created.length} productos nuevos del servidor`);
          console.log('====== PRODUCTOS NUEVOS DEL SERVIDOR ======');
          
          // Mostrar estadísticas de categorías en los productos nuevos
          const newWithCategory = productSyncResult.created.filter(p => p.category_id || p.CategoryId);
          console.log(`Productos nuevos con categoría: ${newWithCategory.length}/${productSyncResult.created.length}`);
          
          // Mostrar ejemplos de productos nuevos
          const sampleSize = Math.min(productSyncResult.created.length, 3);
          for (let i = 0; i < sampleSize; i++) {
            const p = productSyncResult.created[i];
            console.log(`Producto nuevo ${i+1}/${sampleSize}:`);
            console.log(`  ID: ${p.id}, Barcode: ${p.barcode}, Nombre: ${p.name}`);
            console.log(`  Categoría: category_id=${p.category_id}, CategoryId=${p.CategoryId}`);
          }
          console.log('===========================================');

          
          // Asegurar que los productos nuevos tengan correctamente asignada la categoría
          productSyncResult.created.forEach(product => {
            // Verificar si el ID es válido, si no, eliminarlo para que la base de datos asigne uno nuevo
            if (!product.id || product.id === 'N/A' || product.id === '') {
              console.log(`Corrigiendo producto con ID inválido: ${product.name} (${product.barcode})`);
              delete product.id;
            }
            
            // Si tiene CategoryId pero no category_id, o viceversa, sincronizarlos
            if (product.CategoryId && !product.category_id) {
              product.category_id = Number(product.CategoryId);
              
              // Verificar si existe la categoría y asignar su nombre si existe
              if (categoriesById[product.CategoryId]) {
                product.categoryName = categoriesById[product.CategoryId].name;
              }
            } else if (!product.CategoryId && product.category_id) {
              product.CategoryId = Number(product.category_id);
              
              // Verificar si existe la categoría y asignar su nombre si existe
              if (categoriesById[product.category_id]) {
                product.categoryName = categoriesById[product.category_id].name;
              }
            } else if (product.CategoryId && product.category_id) {
              // Si ambos están presentes, asegurar que el objeto de categoría esté asignado
              if (categoriesById[product.CategoryId]) {
                product.categoryName = categoriesById[product.CategoryId].name;
              }
            }
            
            // Marcar como sincronizado
            product.synced = true;
            product.modified = false;
            product.syncedAt = new Date().toISOString();
          });
        }
        
        // Si tenemos productos actualizados en el servidor
        if (productSyncResult.updated && productSyncResult.updated.length > 0) {
          console.log(`Recibidos ${productSyncResult.updated.length} productos actualizados del servidor`);
          console.log('====== PRODUCTOS ACTUALIZADOS DEL SERVIDOR ======');
          
          // Mostrar estadísticas de categorías en los productos actualizados
          const updatedWithCategory = productSyncResult.updated.filter(p => p.category_id || p.CategoryId);
          console.log(`Productos actualizados con categoría: ${updatedWithCategory.length}/${productSyncResult.updated.length}`);
          
          // Mostrar ejemplos de productos actualizados
          const sampleSize = Math.min(productSyncResult.updated.length, 3);
          for (let i = 0; i < sampleSize; i++) {
            const p = productSyncResult.updated[i];
            console.log(`Producto actualizado ${i+1}/${sampleSize}:`);
            console.log(`  ID: ${p.id}, Barcode: ${p.barcode}, Nombre: ${p.name}`);
            console.log(`  Categoría: category_id=${p.category_id}, CategoryId=${p.CategoryId}`);
            
            // Verificar si el ID es válido, si no, eliminarlo para que la base de datos asigne uno nuevo
            if (!p.id || p.id === 'N/A' || p.id === '') {
              console.log(`Corrigiendo producto actualizado con ID inválido: ${p.name} (${p.barcode})`);
              delete p.id;
            }
            
            // Si tiene una versión local, mostrar la diferencia
            if (p.barcode && localProductMap[p.barcode]) {
              const localP = localProductMap[p.barcode];
              console.log(`  Versión local: category_id=${localP.category_id}, CategoryId=${localP.CategoryId}`);
            }
          }
          console.log('===========================================');
          
          // Asegurar que los productos actualizados tengan correctamente asignada la categoría
          productSyncResult.updated.forEach(product => {
            // Verificar si el ID es válido, si no, eliminarlo para que la base de datos asigne uno nuevo
            if (!product.id || product.id === 'N/A' || product.id === '') {
              console.log(`Corrigiendo producto actualizado con ID inválido: ${product.name} (${product.barcode})`);
              delete product.id;
            }
            
            // Si tiene CategoryId pero no category_id, o viceversa, sincronizarlos
            if (product.CategoryId && !product.category_id) {
              product.category_id = Number(product.CategoryId);
              
              // Verificar si existe la categoría y asignar su nombre si existe
              if (categoriesById[product.CategoryId]) {
                product.categoryName = categoriesById[product.CategoryId].name;
              }
            } else if (!product.CategoryId && product.category_id) {
              product.CategoryId = Number(product.category_id);
              
              // Verificar si existe la categoría y asignar su nombre si existe
              if (categoriesById[product.category_id]) {
                product.categoryName = categoriesById[product.category_id].name;
              }
            } else if (product.CategoryId && product.category_id) {
              // Si ambos están presentes, asegurar que el objeto de categoría esté asignado
              if (categoriesById[product.CategoryId]) {
                product.categoryName = categoriesById[product.CategoryId].name;
              }
            }
            
            // Marcar como sincronizado
            product.synced = true;
            product.modified = false;
            product.syncedAt = new Date().toISOString();
          });
        }
      } catch (error) {
        console.error("Error procesando productos para actualización local:", error);
      }
    }

    // Actualizar timestamp de última sincronización
    syncConfig.lastSyncTime = new Date().toISOString();
    saveConfig();

    // Limpiar listas de elementos eliminados localmente si la sincronización fue exitosa
    if (productSyncResult && categorySyncResult) {
      locallyDeletedProducts.clear();
      locallyDeletedCategories.clear();
    }

    return syncResults;
  } catch (error) {
    console.error("Error en proceso de sincronización completa:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Obtiene todos los productos del servidor
 * @returns {Promise<Array>} - Lista de productos del servidor
 */
const getServerProducts = async () => {
  try {
    const response = await fetch(`${syncConfig.apiUrl}/products/`, {
      headers: {
        "X-API-Key": syncConfig.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener productos: ${response.status}`);
    }

    const products = await response.json();
    
    // Log detallado de los productos recibidos del servidor
    console.log(`Recibidos ${products.length} productos del servidor`);
    console.log('====== DATOS DE PRODUCTOS DEL SERVIDOR ======');
    
    // Mostrar los primeros 5 productos como muestra (o todos si hay menos de 5)
    const sampleSize = Math.min(products.length, 5);
    for (let i = 0; i < sampleSize; i++) {
      const p = products[i];
      console.log(`Producto ${i+1}/${sampleSize}:`);
      console.log(`  ID: ${p.id}, Barcode: ${p.barcode}, Nombre: ${p.name}`);
      console.log(`  Categoría: category_id=${p.category_id}, CategoryId=${p.CategoryId}`);
      console.log(`  Otros campos: price=${p.price}, remoteId=${p.remoteId}`);
    }
    
    // Verificar problemas con categorías en todos los productos
    const productsWithoutCategory = products.filter(p => !p.category_id && !p.CategoryId);
    console.log(`Productos sin categoría asignada: ${productsWithoutCategory.length}/${products.length}`);
    
    // Verificar inconsistencias entre category_id y CategoryId
    const inconsistentProducts = products.filter(p => 
      (p.category_id && !p.CategoryId) || (!p.category_id && p.CategoryId) ||
      (p.category_id && p.CategoryId && p.category_id !== p.CategoryId)
    );
    if (inconsistentProducts.length > 0) {
      console.log(`ADVERTENCIA: ${inconsistentProducts.length} productos tienen inconsistencias entre category_id y CategoryId`);
      
      // Mostrar hasta 3 ejemplos de inconsistencias
      const sampleSize = Math.min(inconsistentProducts.length, 3);
      for (let i = 0; i < sampleSize; i++) {
        const p = inconsistentProducts[i];
        console.log(`  Producto inconsistente ${i+1}: ID=${p.id}, Barcode=${p.barcode}`);
        console.log(`    category_id=${p.category_id}, CategoryId=${p.CategoryId}`);
      }
    }
    
    console.log('===========================================');
    
    return products;
  } catch (error) {
    console.error("Error al obtener productos del servidor:", error);
    throw error;
  }
};

/**
 * Sincroniza productos con el servidor
 * @param {Array} products - Productos modificados para sincronizar
 * @param {Array} allKnownIds - Lista de todos los IDs conocidos (para control de eliminaciones)
 * @returns {Promise<Object>} - Resultado de la sincronización
 */
const syncProducts = async (products, allKnownIds) => {
  try {
    // Log detallado para depuración
    console.log('Enviando productos al servidor:', JSON.stringify({
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        barcode: p.barcode,
        category_id: p.category_id,
        CategoryId: p.CategoryId // Este es importante para Electron
      })),
      ids: { ids: allKnownIds }
    }, null, 2));
    
    const response = await fetch(`${syncConfig.apiUrl}/sync/products/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": syncConfig.apiKey,
      },
      body: JSON.stringify({
        products: products,
        ids: {
          ids: allKnownIds,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error al sincronizar productos: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    console.log('Respuesta del servidor para productos:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("Error al sincronizar productos:", error);
    throw error;
  }
};

/**
 * Combina productos locales y del servidor
 * @param {Array} localProducts - Productos locales
 * @param {Array} serverProducts - Productos del servidor
 * @returns {Array} - Lista combinada de productos
 */
const mergeProducts = (localProducts, serverProducts) => {
  // Crear un mapa de productos locales indexados por barcode
  const localProductMap = {};
  localProducts.forEach((product) => {
    localProductMap[product.barcode] = product;
  });

  // Combinar con productos del servidor
  const result = [...localProducts];

  // Agregar productos del servidor que no existen localmente
  serverProducts.forEach((serverProduct) => {
    // Verificación y corrección de ID inválido
    if (!serverProduct.id || serverProduct.id === 'N/A' || serverProduct.id === '') {
      console.log(`Detectado producto del servidor con ID inválido: ${serverProduct.name} (${serverProduct.barcode})`);
      // No eliminamos el ID aquí para mantener la referencia, se eliminará antes de insertar en BD
    }
    
    if (!localProductMap[serverProduct.barcode]) {
      // Es un producto nuevo del servidor
      // Asegurarse de que tanto category_id como CategoryId estén presentes
      const newProduct = {
        ...serverProduct,
        synced: true, // Marcarlo como sincronizado
        syncedAt: new Date().toISOString()
      };
      
      // Asegurar que la categoría esté correctamente asignada
      if (serverProduct.category_id && !serverProduct.CategoryId) {
        newProduct.CategoryId = serverProduct.category_id;
      } else if (!serverProduct.category_id && serverProduct.CategoryId) {
        newProduct.category_id = serverProduct.CategoryId;
      }
      
      result.push(newProduct);
    }
  });

  return result;
};

/**
 * Marca un producto como eliminado localmente
 * @param {number} productId - ID del producto a marcar como eliminado
 */
export const markProductAsDeleted = (productId) => {
  if (!productId) return;
  locallyDeletedProducts.add(productId);
  console.log(`Producto ID ${productId} marcado como eliminado localmente`);
};

/**
 * Comprueba si hay conexión a internet
 * @returns {Promise<boolean>} - True si hay conexión
 */
export const checkInternetConnection = async () => {
  try {
    await fetch("https://www.google.com", {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      timeout: 5000,
    });
    return true;
  } catch {
    console.log("Sin conexión a internet");
    return false;
  }
};

/**
 * Obtiene la fecha y hora de la última sincronización
 * @returns {string|null} - Timestamp de la última sincronización o null
 */
export const getLastSyncTime = () => {
  return syncConfig.lastSyncTime;
};

// Exponer constantes para identificar los tenants
export const TENANTS = {
  CASA: {
    name: "Casa",
    apiKey: "cs_b7f6da13c8e54291bd76a452c9f38e7a",
  },
  NEGOCIO: {
    name: "Negocio",
    apiKey: "ng_3e5f91d082a649d7bc408e71af26de59",
  },
};

/**
 * Obtiene todas las categorías del servidor
 * @returns {Promise<Array>} - Lista de categorías del servidor
 */
const getServerCategories = async () => {
  try {
    const response = await fetch(`${syncConfig.apiUrl}/categories/`, {
      headers: {
        "X-API-Key": syncConfig.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener categorías: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener categorías del servidor:", error);
    throw error;
  }
};

/**
 * Sincroniza categorías con el servidor
 * @param {Array} categories - Categorías modificadas para sincronizar
 * @param {Array} allKnownIds - Lista de todos los IDs conocidos (para control de eliminaciones)
 * @returns {Promise<Object>} - Resultado de la sincronización
 */
const syncCategories = async (categories, allKnownIds) => {
  try {
    // Log detallado para depuración
    console.log('Enviando categorías al servidor:', JSON.stringify({
      categories,
      ids: { ids: allKnownIds }
    }, null, 2));
    
    const response = await fetch(`${syncConfig.apiUrl}/sync/categories/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": syncConfig.apiKey,
      },
      body: JSON.stringify({
        categories: categories,
        ids: {
          ids: allKnownIds,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error al sincronizar categorías: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    console.log('Respuesta del servidor para categorías:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("Error al sincronizar categorías:", error);
    throw error;
  }
};

/**
 * Combina categorías locales y del servidor
 * @param {Array} localCategories - Categorías locales
 * @param {Array} serverCategories - Categorías del servidor
 * @returns {Array} - Lista combinada de categorías
 */
const mergeCategories = (localCategories, serverCategories) => {
  // Crear un mapa de categorías locales indexadas por ID y nombre
  const localCategoryMap = {};
  const localCategoryNameMap = {};
  
  localCategories.forEach((category) => {
    if (category.id) {
      localCategoryMap[category.id] = category;
    }
    if (category.name) {
      localCategoryNameMap[category.name] = category;
    }
  });

  // Combinar con categorías del servidor
  const result = [...localCategories];

  // Agregar categorías del servidor que no existen localmente
  serverCategories.forEach((serverCategory) => {
    // Verificar si ya existe localmente por ID
    const existsById = serverCategory.id && localCategoryMap[serverCategory.id];
    
    // Si no existe por ID, verificar por nombre
    const existsByName = !existsById && 
                         serverCategory.name && 
                         localCategoryNameMap[serverCategory.name];
    
    if (!existsById && !existsByName) {
      // Es una categoría nueva del servidor
      result.push({
        ...serverCategory,
        synced: true, // Marcarla como sincronizada
        syncedAt: new Date().toISOString()
      });
    }
  });

  return result;
};

/**
 * Marca una categoría como eliminada localmente
 * @param {number} categoryId - ID de la categoría a marcar como eliminada
 */
export const markCategoryAsDeleted = (categoryId) => {
  if (!categoryId) {
    console.error("No se puede marcar como eliminada una categoría sin ID");
    return;
  }
  
  // Convertir a número si es un string
  const numericId = Number(categoryId);
  
  locallyDeletedCategories.add(numericId);
  console.log(`Categoría ID ${numericId} marcada como eliminada localmente`);
  console.log(`Estado actual de categorías eliminadas: ${Array.from(locallyDeletedCategories)}`);
  
  // Guardar los IDs eliminados localmente en localStorage para persistencia
  try {
    const deletedIds = Array.from(locallyDeletedCategories);
    localStorage.setItem('locallyDeletedCategoryIds', JSON.stringify(deletedIds));
    console.log(`IDs de categorías eliminadas guardados en localStorage: ${deletedIds}`);
  } catch (error) {
    console.error('Error guardando IDs de categorías eliminadas:', error);
  }
};

/**
 * Cargar IDs de categorías eliminadas localmente desde localStorage
 * Esta función debe llamarse al iniciar la aplicación
 */
export const loadDeletedCategoryIds = () => {
  try {
    const storedIds = localStorage.getItem('locallyDeletedCategoryIds');
    if (storedIds) {
      const deletedIds = JSON.parse(storedIds);
      // Limpiar el Set antes de cargar los nuevos IDs
      locallyDeletedCategories.clear();
      deletedIds.forEach(id => locallyDeletedCategories.add(Number(id)));
      console.log(`Cargados ${deletedIds.length} IDs de categorías eliminadas localmente: ${deletedIds}`);
    } else {
      console.log('No se encontraron IDs de categorías eliminadas en localStorage');
    }
  } catch (error) {
    console.error('Error cargando IDs de categorías eliminadas:', error);
  }
};
