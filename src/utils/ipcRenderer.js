// No podemos importar ipcRenderer directamente en el renderer process
// Usamos la API expuesta por el preload.js a través de contextBridge

// Productos
export const getAllProducts = async () => {
  try {
    const result = await window.api.getAllProducts();
    return result || [];
  } catch (error) {
    console.error("Error en getAllProducts:", error);
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
    // En producción, esto enviaría un mensaje IPC a la parte principal de Electron
    // En desarrollo, simulamos el acceso a la base de datos

    // Simulación de búsqueda en la base de datos
    const allProducts = await getAllProducts();
    const product = allProducts.find((p) => p.id === id);

    if (product) {
      // Simulamos un pequeño retraso para simular acceso a la base de datos
      await new Promise((resolve) => setTimeout(resolve, 100));
      return product;
    }

    return null;
  } catch (error) {
    console.error("Error al obtener producto por ID:", error);
    throw new Error("Error al obtener producto por ID");
  }
};

export const getProductByBarcode = async (barcode) => {
  try {
    const result = await window.api.getProductByBarcode(barcode);
    return result;
  } catch (error) {
    console.error("Error en getProductByBarcode:", error);
    return null;
  }
};

export const createProduct = async (productData) => {
  try {
    const result = await window.api.createProduct(productData);
    return result;
  } catch (error) {
    console.error("Error en createProduct:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const result = await window.api.updateProduct(id, productData);
    return result;
  } catch (error) {
    console.error("Error en updateProduct:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    return await window.api.deleteProduct(id);
  } catch (error) {
    console.error("Error en deleteProduct:", error);
    return false;
  }
};

export const searchProducts = async (query) => {
  try {
    const result = await window.api.searchProducts(query);
    return result || [];
  } catch (error) {
    console.error("Error en searchProducts:", error);
    return [];
  }
};

// Categorias
export const getAllCategories = async () => {
  try {
    const result = await window.api.getAllCategories();
    return result || [];
  } catch (error) {
    console.error("Error en getAllCategories:", error);
    return [];
  }
};

export const getCategoryById = async (id) => {
  try {
    const result = await window.api.getCategoryById(id);
    return result;
  } catch (error) {
    console.error("Error en getCategoryById:", error);
    return null;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const result = await window.api.createCategory(categoryData);
    return result;
  } catch (error) {
    console.error("Error en createCategory:", error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const result = await window.api.updateCategory(id, categoryData);
    return result;
  } catch (error) {
    console.error("Error en updateCategory:", error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    return await window.api.deleteCategory(id);
  } catch (error) {
    console.error("Error en deleteCategory:", error);
    return false;
  }
};
