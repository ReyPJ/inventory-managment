// No podemos importar ipcRenderer directamente en el renderer process
// Usamos la API expuesta por el preload.js a través de contextBridge

// Verificar si la API de Electron está disponible
const electronAPI = window.electronAPI;

// Si la API no está disponible, proporcionar una implementación mock para desarrollo/pruebas
if (!electronAPI) {
  console.warn(
    "API de Electron no disponible. Usando implementación mock para desarrollo."
  );
}

// Helper function para manejar llamadas seguras a la API de Electron
const callAPI = (methodName, ...args) => {
  if (electronAPI && typeof electronAPI[methodName] === "function") {
    return electronAPI[methodName](...args);
  } else {
    console.error(`Método ${methodName} no disponible en electronAPI`);
    return Promise.reject(new Error(`Método ${methodName} no disponible`));
  }
};

// Productos
export const getAllProducts = async () => {
  try {
    const result = await callAPI("getAllProducts");
    return result || [];
  } catch (error) {
    console.error("Error en getAllProducts:", error);
    return [];
  }
};

// Nueva función para obtener sólo productos activos
export const getAllActiveProducts = async () => {
  try {
    const result = await callAPI("getAllActiveProducts");
    return result || [];
  } catch (error) {
    console.error("Error en getAllActiveProducts:", error);
    return [];
  }
};

/**
 * Obtener un producto específico por ID
 * @param {number} id - ID del producto a buscar
 * @returns {Promise<Object|null>} Producto encontrado o null si no existe
 */
export const getProductById = async (id) => {
  try {
    return await callAPI("getProductById", id);
  } catch (error) {
    console.error("Error al obtener producto por ID:", error);
    throw new Error("Error al obtener producto por ID");
  }
};

export const getProductByBarcode = async (barcode) => {
  try {
    return await callAPI("getProductByBarcode", barcode);
  } catch (error) {
    console.error("Error en getProductByBarcode:", error);
    return null;
  }
};

export const createProduct = async (productData) => {
  try {
    return await callAPI("createProduct", productData);
  } catch (error) {
    console.error("Error en createProduct:", error);
    return null;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    return await callAPI("updateProduct", id, productData);
  } catch (error) {
    console.error("Error en updateProduct:", error);
    return null;
  }
};

export const deleteProduct = async (id) => {
  try {
    return await callAPI("deleteProduct", id);
  } catch (error) {
    console.error("Error en deleteProduct:", error);
    return null;
  }
};

export const searchProducts = async (query) => {
  try {
    const result = await callAPI("searchProducts", query);
    return result || [];
  } catch (error) {
    console.error("Error en searchProducts:", error);
    return [];
  }
};

// Categorias
export const getAllCategories = async () => {
  try {
    const result = await callAPI("getAllCategories");
    return result || [];
  } catch (error) {
    console.error("Error en getAllCategories:", error);
    return [];
  }
};

export const getCategoryById = async (id) => {
  try {
    return await callAPI("getCategoryById", id);
  } catch (error) {
    console.error("Error en getCategoryById:", error);
    return null;
  }
};

export const createCategory = async (categoryData) => {
  try {
    return await callAPI("createCategory", categoryData);
  } catch (error) {
    console.error("Error en createCategory:", error);
    return null;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    return await callAPI("updateCategory", id, categoryData);
  } catch (error) {
    console.error("Error en updateCategory:", error);
    return null;
  }
};

export const deleteCategory = async (id) => {
  try {
    return await callAPI("deleteCategory", id);
  } catch (error) {
    console.error("Error en deleteCategory:", error);
    return null;
  }
};

// Nuevas funciones para soportar sincronización
export const updateProductsAfterSync = async (syncResults) => {
  try {
    return await callAPI("updateProductsAfterSync", syncResults);
  } catch (error) {
    console.error("Error en updateProductsAfterSync:", error);
    throw error;
  }
};

export const purgeDeletedProducts = async () => {
  try {
    return await callAPI("purgeDeletedProducts");
  } catch (error) {
    console.error("Error en purgeDeletedProducts:", error);
    return 0;
  }
};

// Nuevas funciones para soportar sincronización de categorías
export const updateCategoriesAfterSync = async (syncResults) => {
  try {
    return await callAPI("updateCategoriesAfterSync", syncResults);
  } catch (error) {
    console.error("Error en updateCategoriesAfterSync:", error);
    // Devolver un objeto similar a updateProductsAfterSync para consistencia
    return { updated: 0, added: 0, skipped: 0 };
  }
};

export const purgeDeletedCategories = async () => {
  try {
    return await callAPI("purgeDeletedCategories");
  } catch (error) {
    console.error("Error en purgeDeletedCategories:", error);
    return 0;
  }
};
