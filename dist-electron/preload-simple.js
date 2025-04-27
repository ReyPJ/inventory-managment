/* eslint-disable */
// Preload script siguiendo las mejores prácticas de seguridad para Electron
const { contextBridge, ipcRenderer } = require('electron');

// Lista de canales válidos para enviar/recibir por IPC
const validSendChannels = [
  'get-all-products',
  'get-product-by-id',
  'get-product-by-barcode',
  'create-product',
  'update-product',
  'delete-product',
  'search-products',
  'get-all-categories',
  'get-category-by-id',
  'create-category',
  'update-category',
  'delete-category'
];

// Exponer solo APIs específicas y controladas al proceso de renderizado
contextBridge.exposeInMainWorld('electronAPI', {
  // Productos
  getAllProducts: () => ipcRenderer.invoke('get-all-products'),
  getProductById: (id) => ipcRenderer.invoke('get-product-by-id', id),
  getProductByBarcode: (barcode) => ipcRenderer.invoke('get-product-by-barcode', barcode),
  createProduct: (productData) => ipcRenderer.invoke('create-product', productData),
  updateProduct: (id, productData) => ipcRenderer.invoke('update-product', { id, productData }),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
  searchProducts: (query) => ipcRenderer.invoke('search-products', query),
  
  // Categorías
  getAllCategories: () => ipcRenderer.invoke('get-all-categories'),
  getCategoryById: (id) => ipcRenderer.invoke('get-category-by-id', id),
  createCategory: (categoryData) => ipcRenderer.invoke('create-category', categoryData),
  updateCategory: (id, categoryData) => ipcRenderer.invoke('update-category', { id, categoryData }),
  deleteCategory: (id) => ipcRenderer.invoke('delete-category', id)
}); 