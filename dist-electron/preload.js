const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("api", {
  // Productos
  getAllProducts: () => ipcRenderer.invoke("get-all-products"),
  getProductById: (id) => ipcRenderer.invoke("get-product-by-id", id),
  getProductByBarcode: (barcode) => ipcRenderer.invoke("get-product-by-barcode", barcode),
  createProduct: (productData) => ipcRenderer.invoke("create-product", productData),
  updateProduct: (id, productData) => ipcRenderer.invoke("update-product", { id, productData }),
  deleteProduct: (id) => ipcRenderer.invoke("delete-product", id),
  searchProducts: (query) => ipcRenderer.invoke("search-products", query),
  // Categorías
  getAllCategories: () => ipcRenderer.invoke("get-all-categories"),
  getCategoryById: (id) => ipcRenderer.invoke("get-category-by-id", id),
  createCategory: (categoryData) => ipcRenderer.invoke("create-category", categoryData),
  updateCategory: (id, categoryData) => ipcRenderer.invoke("update-category", { id, categoryData }),
  deleteCategory: (id) => ipcRenderer.invoke("delete-category", id)
});
