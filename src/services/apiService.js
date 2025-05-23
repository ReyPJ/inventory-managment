// Servicio para manejar las comunicaciones con la API externa

// URL base de la API
const API_URL = "http://localhost:8000/api"; // Cambiar esto por la URL real de la API

// Variable para almacenar los tokens
let authTokens = {
  access: null,
  refresh: null,
};

// Función para iniciar sesión
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error(`Error de autenticación: ${response.status}`);
    }

    const data = await response.json();

    // Guardar tokens
    authTokens.access = data.access;
    authTokens.refresh = data.refresh;

    // Guardar en localStorage para persistencia
    localStorage.setItem("authTokens", JSON.stringify(authTokens));
    localStorage.setItem("currentUser", username);

    return { success: true, user: username };
  } catch (error) {
    console.error("Error en login:", error);
    return { success: false, error: error.message };
  }
};

// Función para cerrar sesión
export const logout = () => {
  authTokens = { access: null, refresh: null };
  localStorage.removeItem("authTokens");
  localStorage.removeItem("currentUser");
  return { success: true };
};

// Cargar tokens guardados al iniciar
export const loadStoredAuth = () => {
  try {
    const storedTokens = localStorage.getItem("authTokens");
    if (storedTokens) {
      authTokens = JSON.parse(storedTokens);
      return true;
    }
  } catch (error) {
    console.error("Error cargando tokens guardados:", error);
  }
  return false;
};

// Verificar si hay una sesión activa
export const isAuthenticated = () => {
  return !!authTokens.access;
};

// Obtener el usuario actual
export const getCurrentUser = () => {
  return localStorage.getItem("currentUser");
};

// Función para hacer peticiones autenticadas
const fetchWithAuth = async (endpoint, options = {}) => {
  // Si no hay token de acceso, intentar cargar del localStorage
  if (!authTokens.access) {
    loadStoredAuth();
  }

  // Si aún no hay token, retornar error
  if (!authTokens.access) {
    throw new Error("No autenticado");
  }

  // Añadir token de acceso a las cabeceras
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${authTokens.access}`,
    "Content-Type": options.headers?.["Content-Type"] || "application/json",
  };

  // Hacer la petición
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Si la respuesta es 401 (token expirado o inválido)
  // Implementar manejo de refresh token aquí si es necesario

  return response;
};

// CATEGORÍAS

// Obtener todas las categorías
export const getAllCategories = async () => {
  try {
    const response = await fetchWithAuth("/categories/");

    if (!response.ok) {
      throw new Error(`Error al obtener categorías: ${response.status}`);
    }

    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error("Error en getAllCategories:", error);
    throw error;
  }
};

// Obtener una categoría por ID
export const getCategoryById = async (id) => {
  try {
    const response = await fetchWithAuth(`/categories/${id}/`);

    if (!response.ok) {
      throw new Error(`Error al obtener categoría: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en getCategoryById (${id}):`, error);
    throw error;
  }
};

// Crear una nueva categoría
export const createCategory = async (categoryData) => {
  try {
    const response = await fetchWithAuth("/categories/create/", {
      method: "POST",
      body: JSON.stringify({
        name: categoryData.name,
        description: categoryData.description || "",
      }),
    });

    if (!response.ok) {
      throw new Error(`Error al crear categoría: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en createCategory:", error);
    throw error;
  }
};

// Actualizar una categoría
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await fetchWithAuth(`/categories/${id}/update/`, {
      method: "PUT",
      body: JSON.stringify({
        name: categoryData.name,
        description: categoryData.description || "",
      }),
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar categoría: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en updateCategory (${id}):`, error);
    throw error;
  }
};

// Eliminar una categoría
export const deleteCategory = async (id) => {
  try {
    const response = await fetchWithAuth(`/categories/${id}/delete/`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar categoría: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error(`Error en deleteCategory (${id}):`, error);
    throw error;
  }
};

// PRODUCTOS

// Obtener todos los productos
export const getAllProducts = async () => {
  try {
    const response = await fetchWithAuth("/products/");

    if (!response.ok) {
      throw new Error(`Error al obtener productos: ${response.status}`);
    }

    const products = await response.json();
    return products;
  } catch (error) {
    console.error("Error en getAllProducts:", error);
    throw error;
  }
};

// Obtener un producto por ID
export const getProductById = async (id) => {
  try {
    const response = await fetchWithAuth(`/products/${id}/`);

    if (!response.ok) {
      throw new Error(`Error al obtener producto: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en getProductById (${id}):`, error);
    throw error;
  }
};

// Obtener un producto por código de barras
export const getProductByBarcode = async (barcode) => {
  try {
    // Como no hay endpoint específico para buscar por barcode, filtramos manualmente
    const allProducts = await getAllProducts();
    return allProducts.find((product) => product.barcode === barcode) || null;
  } catch (error) {
    console.error(`Error en getProductByBarcode (${barcode}):`, error);
    throw error;
  }
};

// Crear un nuevo producto
export const createProduct = async (productData) => {
  try {
    const response = await fetchWithAuth("/products/create/", {
      method: "POST",
      body: JSON.stringify({
        barcode: productData.barcode,
        name: productData.name,
        description: productData.description || "",
        price: productData.price.toString(),
        stock: productData.stock,
        category: productData.category,
        sku: productData.sku || "",
        image_url: productData.image_url || null,
        is_active: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error al crear producto: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en createProduct:", error);
    throw error;
  }
};

// Actualizar un producto
export const updateProduct = async (id, productData) => {
  try {
    const response = await fetchWithAuth(`/products/${id}/update/`, {
      method: "PUT",
      body: JSON.stringify({
        barcode: productData.barcode,
        name: productData.name,
        description: productData.description || "",
        price: productData.price.toString(),
        stock: productData.stock,
        category: productData.category,
        sku: productData.sku || "",
        image_url: productData.image_url || null,
        is_active: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar producto: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en updateProduct (${id}):`, error);
    throw error;
  }
};

// Eliminar un producto
export const deleteProduct = async (id) => {
  try {
    const response = await fetchWithAuth(`/products/${id}/delete/`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar producto: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error(`Error en deleteProduct (${id}):`, error);
    throw error;
  }
};

// Buscar productos
export const searchProducts = async (query) => {
  try {
    // Como no hay endpoint específico para búsqueda, filtramos manualmente
    const allProducts = await getAllProducts();

    const lowerQuery = query.toLowerCase();
    return allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.barcode.includes(lowerQuery) ||
        (product.description &&
          product.description.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    console.error(`Error en searchProducts (${query}):`, error);
    throw error;
  }
};
