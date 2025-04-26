/**
 * Utilidad para buscar información de productos en internet por su código de barras
 *
 * Este módulo permite:
 * 1. Buscar un producto por su código de barras en APIs públicas
 * 2. Extraer información relevante para videojuegos
 */

/**
 * Verifica si hay conexión a internet
 * @returns {Promise<boolean>} true si hay conexión, false si no
 */
const checkInternetConnection = async () => {
  try {
    // Intentar acceder a un recurso confiable y rápido
    await fetch("https://www.cloudflare.com/cdn-cgi/trace", {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      timeout: 5000,
    });
    return true;
  } catch (error) {
    console.warn("Sin conexión a internet:", error.message);
    return false;
  }
};

/**
 * Busca información de un videojuego por su código de barras
 * Utiliza una combinación de APIs abiertas para encontrar información
 *
 * @param {string} barcode - Código de barras a buscar
 * @param {Function} updateStatus - Función para actualizar el estado de búsqueda en la UI
 * @returns {Promise<Object|null>} Información del producto o null si no se encuentra
 */
export const searchProductByBarcode = async (
  barcode,
  updateStatus = () => {}
) => {
  try {
    console.log(`Iniciando búsqueda para código de barras: ${barcode}`);
    updateStatus("Buscando en base de datos local...");

    // Para asegurar que no haya espacios ni caracteres extraños
    barcode = barcode.trim();

    // Si sabemos que es un código de Nintendo, podemos tener una lista de productos conocidos
    // Esto es útil para casos donde las APIs externas fallan o cambian
    const knownProducts = {
      "045496590444": {
        name: "1-2-Switch - Nintendo Switch",
        description:
          "Juego de fiesta exclusivo para Nintendo Switch que aprovecha las características de los Joy-Con para mini-juegos divertidos.",
        price: 49.99,
        stock: 0,
      },
      // Puedes agregar más juegos conocidos aquí
    };

    // Revisar primero si es un producto conocido
    if (knownProducts[barcode]) {
      console.log(
        `Producto encontrado en base de datos local: ${knownProducts[barcode].name}`
      );
      return knownProducts[barcode];
    }

    // Verificar conexión a internet antes de buscar en APIs externas
    const hasInternet = await checkInternetConnection();
    if (!hasInternet) {
      updateStatus("Sin conexión a internet. Usando sólo datos locales.");
      console.log(
        "Sin conexión a internet. No se pueden consultar APIs externas."
      );
      return defaultProductFromBarcode(barcode);
    }

    // Intento 1: Buscar en Open Library por ISBN (útil para juegos que tienen ISBN)
    updateStatus("Buscando en OpenLibrary...");
    let productInfo = await searchOpenLibrary(barcode);
    if (productInfo) {
      console.log("Producto encontrado en Open Library");
      return productInfo;
    }

    // Intento 2: Si no se encuentra, buscar en UPC API (prioridad principal)
    updateStatus("Buscando en base de datos UPC...");
    productInfo = await searchUPCItemDB(barcode);
    if (productInfo) {
      return productInfo;
    }

    // Intento 3: Si todo falla, usar la búsqueda online
    updateStatus(
      "No se encontró en bases de datos. Buscando en APIs adicionales..."
    );
    productInfo = await searchProductOnline(barcode);
    if (productInfo) {
      console.log("Referencias encontradas mediante búsqueda online");
      return productInfo;
    }

    console.log(
      `No se pudo encontrar información para el código ${barcode} en ninguna API`
    );
    updateStatus("No se encontró información para este código de barras");
    return null;
  } catch (error) {
    console.error("Error detallado al buscar producto:", error);
    updateStatus("Error al buscar producto");

    // Como último recurso, devolvemos un objeto genérico usando nuestra función dedicada
    return defaultProductFromBarcode(barcode);
  }
};

/**
 * Busca en Open Library por ISBN
 * @param {string} barcode
 * @returns {Promise<Object|null>}
 */
const searchOpenLibrary = async (barcode) => {
  try {
    // Open Library API para ISBNs
    const response = await fetch(
      `https://openlibrary.org/isbn/${barcode}.json`
    );

    if (!response.ok) return null;

    const data = await response.json();

    return {
      name: data.title,
      description: data.subtitle || `${data.title} - ISBN: ${barcode}`,
      // Devolver valores por defecto para los campos obligatorios
      price: 0,
      stock: 0,
    };
  } catch (error) {
    console.log("Error buscando en Open Library:", error);
    return null;
  }
};

/**
 * Busca en UPC Item DB
 * @param {string} barcode
 * @returns {Promise<Object|null>}
 */
const searchUPCItemDB = async (barcode) => {
  try {
    console.log(`Buscando código de barras en UPC ItemDB: ${barcode}`);

    // Probar con un proxy CORS alternativo
    const corsProxy = "https://api.allorigins.win/get?url=";
    const targetUrl = `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`;

    const response = await fetch(
      `${corsProxy}${encodeURIComponent(targetUrl)}`
    );

    if (!response.ok) {
      console.log(`Error en la respuesta de UPC ItemDB: ${response.status}`);
      return null;
    }

    // Este proxy devuelve los datos en un campo "contents"
    const responseData = await response.json();
    if (!responseData.contents) {
      return null;
    }

    // Parsear el contenido que viene como string
    const data = JSON.parse(responseData.contents);

    // Verificar si encontramos resultados
    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      console.log(`Producto encontrado: ${item.title}`);

      return {
        name: item.title,
        description: item.description || `UPC: ${barcode}`,
        price: item.lowest_recorded_price || 0,
        stock: 0, // Por defecto sin stock
      };
    }

    console.log(
      `No se encontraron resultados para el código ${barcode} en UPC ItemDB`
    );
    return null;
  } catch (error) {
    console.error("Error detallado buscando en UPC Item DB:", error);
    return null;
  }
};

/**
 * Busca un código de barras en internet en las APIs
 * @param {string} barcode - Código de barras a buscar
 * @returns {Promise<string|null>} - Datos del producto o null si falla
 */
const searchProductInAPIs = async (barcode) => {
  try {
    console.log(`Buscando información para el código: ${barcode}`);

    // ========= MÉTODO 1: USAR API DE BÚSQUEDA DE PRODUCTOS =========
    try {
      // Para apps Electron, esta API funcionaría mejor desde el proceso principal con Node.js
      // En un entorno web, podemos simular esto con una API más permisiva
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        {
          cache: "no-store",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.status === 1) {
          console.log("✅ Producto encontrado en base de datos OpenFoodFacts");
          return JSON.stringify(data);
        }
      }
    } catch (error) {
      console.warn("Error al buscar en OpenFoodFacts:", error.message);
    }

    // Si no se encuentra ninguna información, devolver un objeto simple
    console.log(
      "❌ No se encontró información en las bases de datos para:",
      barcode
    );

    return JSON.stringify({
      type: "not_found",
      barcode,
      message: `No se encontró información de este producto en las bases de datos.`,
      isHTML: false,
      searchFailed: true,
    });
  } catch (error) {
    console.error("Error al buscar información del producto:", error);
    return null;
  }
};

/**
 * Busca información de un código de barras y devuelve resultados
 * @param {string} barcode - Código de barras a buscar
 * @returns {Promise<Object|null>} - Información del producto o null si no se encuentra
 */
export const searchProductOnline = async (barcode) => {
  console.log(`🔍 Buscando información para el código de barras: ${barcode}`);
  try {
    // Buscar el código de barras usando nuestras APIs alternativas
    const resultData = await searchProductInAPIs(barcode);
    if (!resultData) {
      console.log("❌ No se pudo obtener información del producto");
      // Devolver un producto básico con información limitada
      return {
        name: `Videojuego/Producto con código ${barcode}`,
        description:
          "No se pudo encontrar información en línea. Es posible que necesites conexión a internet para buscar este código.",
        barcode,
        price: 0,
        stock: 0,
        searchFailed: true,
      };
    }

    // Intentar parsear los resultados
    let data;
    try {
      data = JSON.parse(resultData);
    } catch (e) {
      console.warn("Error al parsear los resultados:", e.message);
      return defaultProductFromBarcode(barcode);
    }

    // Comprobar si no se encontró resultado
    if (data.type === "not_found") {
      console.log("⚠️ No se encontró información para el código:", barcode);

      return {
        name: `Producto con código ${barcode}`,
        description: data.message,
        barcode,
        price: 0,
        stock: 0,
        searchFailed: true,
      };
    }

    // Comprobar si es de Open Food Facts
    if (data.status === 1 && data.product) {
      const product = data.product;
      console.log(
        "✅ Producto encontrado en Open Food Facts:",
        product.product_name
      );

      return {
        name: product.product_name || `Producto ${barcode}`,
        description: product.generic_name || `Código de barras: ${barcode}`,
        barcode,
        price: 0, // Open Food Facts no proporciona precios
        stock: 0,
        imageUrl: product.image_url,
        brand: product.brands,
        category: product.categories,
      };
    }

    // Si llegamos aquí, tenemos datos pero no podemos interpretarlos
    console.log("⚠️ Datos recibidos pero en formato desconocido");
    return {
      name: `Producto con código ${barcode}`,
      description:
        "Se encontró información pero no pudo ser procesada correctamente.",
      barcode,
      price: 0,
      stock: 0,
      rawData:
        typeof data === "object"
          ? JSON.stringify(data).substring(0, 200) + "..."
          : "Datos no disponibles",
    };
  } catch (error) {
    console.error(
      "❌ Error al buscar información del código de barras:",
      error
    );
    // Devolver un objeto básico para mantener la consistencia
    return defaultProductFromBarcode(barcode);
  }
};

/**
 * Crea un objeto de producto predeterminado basado en el código de barras
 * @param {string} barcode - Código de barras
 * @returns {Object} Objeto de producto básico
 */
export const defaultProductFromBarcode = (barcode) => {
  return {
    name: `Producto con código ${barcode}`,
    description: `No se pudo encontrar información. Código de barras: ${barcode}`,
    price: 0,
    stock: 0,
  };
};
