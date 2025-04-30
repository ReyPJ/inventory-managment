/* eslint-disable */
// Preload script siguiendo las mejores prácticas de seguridad para Electron
const { contextBridge, ipcRenderer } = require("electron");

// Diagnóstico para preload-simple.js
console.log("🔍 [DIAGNÓSTICO] preload-simple.js iniciado");
console.log("🔍 [DIAGNÓSTICO] Entorno:", process.env.NODE_ENV);

// Lista de canales válidos para enviar/recibir por IPC
const validSendChannels = [
  "get-all-products",
  "get-all-active-products",
  "get-product-by-id",
  "get-product-by-barcode",
  "create-product",
  "update-product",
  "delete-product",
  "search-products",
  "get-all-categories",
  "get-category-by-id",
  "create-category",
  "update-category",
  "delete-category",
  "update-products-after-sync",
  "purge-deleted-products",
  "update-categories-after-sync",
  "purge-deleted-categories",
];

// Exponer solo APIs específicas y controladas al proceso de renderizado
contextBridge.exposeInMainWorld("electronAPI", {
  // Productos
  getAllProducts: () => ipcRenderer.invoke("get-all-products"),
  getAllActiveProducts: () => ipcRenderer.invoke("get-all-active-products"),
  getProductById: (id) => ipcRenderer.invoke("get-product-by-id", id),
  getProductByBarcode: (barcode) =>
    ipcRenderer.invoke("get-product-by-barcode", barcode),
  createProduct: (productData) =>
    ipcRenderer.invoke("create-product", productData),
  updateProduct: (id, productData) =>
    ipcRenderer.invoke("update-product", { id, productData }),
  deleteProduct: (id) => ipcRenderer.invoke("delete-product", id),
  searchProducts: (query) => ipcRenderer.invoke("search-products", query),
  
  // Funciones para sincronización de productos
  updateProductsAfterSync: (syncResults) => 
    ipcRenderer.invoke("update-products-after-sync", syncResults),
  purgeDeletedProducts: () => 
    ipcRenderer.invoke("purge-deleted-products"),

  // Categorías
  getAllCategories: () => ipcRenderer.invoke("get-all-categories"),
  getCategoryById: (id) => ipcRenderer.invoke("get-category-by-id", id),
  createCategory: (categoryData) =>
    ipcRenderer.invoke("create-category", categoryData),
  updateCategory: (id, categoryData) =>
    ipcRenderer.invoke("update-category", { id, categoryData }),
  deleteCategory: (id) => ipcRenderer.invoke("delete-category", id),
  
  // Funciones para sincronización de categorías
  updateCategoriesAfterSync: (syncResults) => 
    ipcRenderer.invoke("update-categories-after-sync", syncResults),
  purgeDeletedCategories: () => 
    ipcRenderer.invoke("purge-deleted-categories"),
});

console.log("✅ [DIAGNÓSTICO] preload-simple.js cargado correctamente");
