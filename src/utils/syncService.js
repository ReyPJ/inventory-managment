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
    // PASO 1: Obtener productos y categorías del servidor
    const serverProducts = await getServerProducts();
    const serverCategories = await getServerCategories();
    
    console.log(`Obtenidos ${serverProducts.length} productos del servidor`);
    console.log(`Obtenidas ${serverCategories.length} categorías del servidor`);

    // Sincronizar productos
    const deletedProducts = localProducts.filter((p) => p.deletedLocally);
    const deletedBarcodes = deletedProducts.map((p) => p.barcode);

    console.log(
      `Productos marcados como eliminados localmente: ${deletedBarcodes.length}`
    );

    // Filtrar productos del servidor que coinciden con códigos de barra de productos eliminados
    const filteredServerProducts = serverProducts.filter(
      (product) => !deletedBarcodes.includes(product.barcode)
    );

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
      .filter((id) => id !== undefined);
      
    // Sincronizar categorías
    const deletedCategories = localCategories.filter((c) => c.deletedLocally);
    const deletedCategoryIds = deletedCategories.map((c) => c.id);
    
    console.log(
      `Categorías marcadas como eliminadas localmente: ${deletedCategoryIds.length}`
    );
    
    // Filtrar categorías del servidor que no han sido eliminadas localmente
    const filteredServerCategories = serverCategories.filter(
      (category) => !deletedCategoryIds.includes(category.id)
    );
    
    console.log(
      `Categorías filtradas del servidor después de excluir eliminadas: ${filteredServerCategories.length}`
    );
    
    // Combinar categorías del servidor con categorías locales
    const allKnownCategories = mergeCategories(
      localCategories.filter((c) => !c.deletedLocally),
      filteredServerCategories
    );
    
    // Obtener todos los IDs de categorías conocidas (excluyendo eliminadas)
    const allKnownCategoryIds = allKnownCategories
      .map((c) => c.id)
      .filter((id) => id !== undefined);

    // PASO 2: Enviar sincronización con las listas filtradas de IDs
    const productSyncResult = await syncProducts(
      // Solo enviamos los productos modificados localmente y no eliminados
      localProducts.filter((p) => p.modified && !p.deletedLocally),
      allKnownProductIds
    );
    
    // Filtrar categorías modificadas para sincronizar
    const categoriesToSync = localCategories.filter((c) => c.modified && !c.deletedLocally);
    console.log(`Categorías modificadas para sincronizar: ${categoriesToSync.length}`);
    
    // Si no hay categorías modificadas pero hay categorías locales, forzar la sincronización de todas
    // Esto asegura que en la primera sincronización todas las categorías se envíen al servidor
    let categoriesToSend = categoriesToSync;
    if (categoriesToSync.length === 0 && localCategories.length > 0) {
      console.log(`No hay categorías modificadas, pero hay ${localCategories.length} categorías locales. Forzando sincronización de todas las categorías.`);
      categoriesToSend = localCategories.filter(c => !c.deletedLocally);
      console.log(`Enviando ${categoriesToSend.length} categorías no eliminadas al servidor`);
    }
    
    // Ahora sincronizamos las categorías con el servidor
    const categorySyncResult = await syncCategories(
      categoriesToSend,
      allKnownCategoryIds
    );

    // Actualizar timestamp de última sincronización
    syncConfig.lastSyncTime = new Date().toISOString();
    saveConfig();

    // Limpiar listas de elementos eliminados localmente si la sincronización fue exitosa
    if (productSyncResult && categorySyncResult) {
      locallyDeletedProducts.clear();
      locallyDeletedCategories.clear();
    }

    return {
      success: true,
      serverProducts: filteredServerProducts,
      syncedProducts: productSyncResult,
      deletedBarcodes: deletedBarcodes,
      serverCategories: filteredServerCategories,
      syncedCategories: categorySyncResult,
      deletedCategoryIds: deletedCategoryIds,
    };
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

    return await response.json();
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
      throw new Error(`Error al sincronizar productos: ${response.status}`);
    }

    return await response.json();
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
    if (!localProductMap[serverProduct.barcode]) {
      // Es un producto nuevo del servidor
      result.push({
        ...serverProduct,
        synced: true, // Marcarlo como sincronizado
      });
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
      throw new Error(`Error al sincronizar categorías: ${response.status}`);
    }

    return await response.json();
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
  // Crear un mapa de categorías locales indexadas por nombre
  const localCategoryMap = {};
  localCategories.forEach((category) => {
    localCategoryMap[category.name] = category;
  });

  // Combinar con categorías del servidor
  const result = [...localCategories];

  // Agregar categorías del servidor que no existen localmente
  serverCategories.forEach((serverCategory) => {
    if (!localCategoryMap[serverCategory.name]) {
      // Es una categoría nueva del servidor
      result.push({
        ...serverCategory,
        synced: true, // Marcarla como sincronizada
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
  if (!categoryId) return;
  locallyDeletedCategories.add(categoryId);
  console.log(`Categoría ID ${categoryId} marcada como eliminada localmente`);
};
