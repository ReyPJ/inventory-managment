/* eslint-disable */
// Código de preload modificado para funcionar tanto en producción como en desarrollo
const { contextBridge, ipcRenderer } =
  typeof require !== "undefined" ? require("electron") : window.electron;

// Función para mostrar logs en la consola
const log = (msg, ...args) => {
  console.log(`[Preload] ${msg}`, ...args);
};

try {
  log("Inicializando preload.js");

  // Intentar exponer la API a través de contextBridge
  contextBridge.exposeInMainWorld("electronAPI", {
    // Productos
    getAllProducts: () => {
      log("Llamando a getAllProducts");
      return ipcRenderer.invoke("get-all-products");
    },
    getAllActiveProducts: () => {
      log("Llamando a getAllActiveProducts");
      return ipcRenderer.invoke("get-all-active-products");
    },
    getProductById: (id) => {
      log("Llamando a getProductById:", id);
      return ipcRenderer.invoke("get-product-by-id", id);
    },
    getProductByBarcode: (barcode) => {
      log("Llamando a getProductByBarcode:", barcode);
      return ipcRenderer.invoke("get-product-by-barcode", barcode);
    },
    createProduct: (productData) => {
      log("Llamando a createProduct");
      return ipcRenderer.invoke("create-product", productData);
    },
    updateProduct: (id, productData) => {
      log("Llamando a updateProduct - ID:", id);
      return ipcRenderer.invoke("update-product", { id, productData });
    },
    deleteProduct: (id) => {
      log("Llamando a deleteProduct:", id);
      return ipcRenderer.invoke("delete-product", id);
    },
    searchProducts: (query) => {
      log("Llamando a searchProducts:", query);
      return ipcRenderer.invoke("search-products", query);
    },
    updateProductsAfterSync: (syncResults) => {
      log("Llamando a updateProductsAfterSync");
      return ipcRenderer.invoke("update-products-after-sync", syncResults);
    },
    purgeDeletedProducts: () => {
      log("Llamando a purgeDeletedProducts");
      return ipcRenderer.invoke("purge-deleted-products");
    },

    // Categorías
    getAllCategories: () => {
      log("Llamando a getAllCategories");
      return ipcRenderer.invoke("get-all-categories");
    },
    getCategoryById: (id) => {
      log("Llamando a getCategoryById:", id);
      return ipcRenderer.invoke("get-category-by-id", id);
    },
    createCategory: (categoryData) => {
      log("Llamando a createCategory");
      return ipcRenderer.invoke("create-category", categoryData);
    },
    updateCategory: (id, categoryData) => {
      log("Llamando a updateCategory - ID:", id);
      return ipcRenderer.invoke("update-category", { id, categoryData });
    },
    deleteCategory: (id) => {
      log("Llamando a deleteCategory:", id);
      return ipcRenderer.invoke("delete-category", id);
    },
  });

  log("preload.js inicializado correctamente");
} catch (error) {
  console.error("[Preload] Error al inicializar:", error);
}
