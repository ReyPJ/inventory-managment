const { contextBridge: r, ipcRenderer: t } = require("electron");
r.exposeInMainWorld("api", {
  // Productos
  getAllProducts: () => t.invoke("get-all-products"),
  getProductById: (e) => t.invoke("get-product-by-id", e),
  getProductByBarcode: (e) => t.invoke("get-product-by-barcode", e),
  createProduct: (e) => t.invoke("create-product", e),
  updateProduct: (e, o) => t.invoke("update-product", { id: e, productData: o }),
  deleteProduct: (e) => t.invoke("delete-product", e),
  searchProducts: (e) => t.invoke("search-products", e),
  // Categorías
  getAllCategories: () => t.invoke("get-all-categories"),
  getCategoryById: (e) => t.invoke("get-category-by-id", e),
  createCategory: (e) => t.invoke("create-category", e),
  updateCategory: (e, o) => t.invoke("update-category", { id: e, categoryData: o }),
  deleteCategory: (e) => t.invoke("delete-category", e)
});
