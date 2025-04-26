/**
 * Utilidad para buscar información de productos en internet por su código de barras
 *
 * Este módulo permite:
 * 1. Buscar un producto por su código de barras en APIs públicas
 * 2. Extraer información relevante para videojuegos
 */

/**
 * Busca información de un videojuego por su código de barras
 * Utiliza una combinación de APIs abiertas para encontrar información
 *
 * @param {string} barcode - Código de barras a buscar
 * @returns {Promise<Object|null>} Información del producto o null si no se encuentra
 */
export const searchProductByBarcode = async (barcode) => {
  try {
    console.log(`Iniciando búsqueda para código de barras: ${barcode}`);

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

    // Intento 1: Buscar en Open Library por ISBN (útil para juegos que tienen ISBN)
    let productInfo = await searchOpenLibrary(barcode);
    if (productInfo) {
      console.log("Producto encontrado en Open Library");
      return productInfo;
    }

    // Intento 2: Si no se encuentra, buscar en UPC API (prioridad principal)
    productInfo = await searchUPCItemDB(barcode);
    if (productInfo) {
      return productInfo;
    }

    // Intento 3: Si todo falla, hacer una búsqueda básica en Google
    productInfo = await searchGoogleForBarcode(barcode);
    if (productInfo) {
      console.log("Producto encontrado mediante búsqueda en Google");
      return productInfo;
    }

    console.log(
      `No se pudo encontrar información para el código ${barcode} en ninguna API`
    );
    return null;
  } catch (error) {
    console.error("Error detallado al buscar producto:", error);

    // Como último recurso, devolvemos un objeto genérico
    return {
      name: `Producto con código ${barcode}`,
      description: `No se pudo encontrar información. Código de barras: ${barcode}`,
      price: 0,
      stock: 0,
    };
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

    // UPC Item DB API (nota: en producción deberías usar tu propia API key)
    const response = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`
    );

    if (!response.ok) {
      console.log(`Error en la respuesta de UPC ItemDB: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log(
      `Respuesta de UPC ItemDB: ${JSON.stringify(data).substring(0, 100)}...`
    );

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
 * Realiza una búsqueda en Google y extrae información básica
 * Esta es la opción de último recurso
 * @param {string} barcode
 * @returns {Promise<Object|null>}
 */
const searchGoogleForBarcode = async (barcode) => {
  try {
    // Usamos la API de búsqueda de Google (o un proxy público para demostración)
    // En producción, deberías implementar tu propia solución o usar una API pagada
    const response = await fetch(
      `https://serpapi.com/search.json?q=${barcode}+videogame&api_key=demo`
    );

    if (!response.ok) {
      // Como fallback, simplemente devolvemos un nombre genérico basado en el código de barras
      return {
        name: `Producto con código ${barcode}`,
        description: `Producto encontrado con código de barras: ${barcode}`,
        price: 0,
        stock: 0,
      };
    }

    const data = await response.json();

    // Si hay resultados, tomamos el primer título
    if (data.organic_results && data.organic_results.length > 0) {
      return {
        name: data.organic_results[0].title,
        description:
          data.organic_results[0].snippet || `Código de barras: ${barcode}`,
        price: 0,
        stock: 0,
      };
    }

    return null;
  } catch (error) {
    console.log("Error en búsqueda de Google:", error);
    // Devolvemos un objeto básico como último recurso
    return {
      name: `Producto con código ${barcode}`,
      description: `No se pudo encontrar información. Código de barras: ${barcode}`,
      price: 0,
      stock: 0,
    };
  }
};
