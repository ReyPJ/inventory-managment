// Función para verificar la conexión a internet
export const checkInternetConnection = async () => {
  try {
    // Intenta hacer una petición a Google para verificar la conexión
    await fetch("https://www.google.com", {
      method: "HEAD",
      mode: "no-cors", // No necesitamos leer la respuesta
      cache: "no-store", // No usar caché
      timeout: 2000, // Timeout de 2 segundos
    });
    return true;
  } catch (error) {
    console.log("No hay conexión a internet:", error);
    return false;
  }
};

// Función para limpiar y acortar un título de producto
const cleanProductTitle = (title, barcode) => {
  if (!title) return `Producto ${barcode}`;

  // Primero quitamos todo después de ciertos separadores
  let cleanName = title.split(" - ")[0].split(",")[0].split(":")[0];

  // Eliminar el código de barras si está en el título
  cleanName = cleanName.replace(barcode, "").trim();

  // Eliminar palabras repetidas (como "Nintendo Nintendo")
  const words = cleanName.split(" ");
  const uniqueWords = [];
  const lowerWords = [];

  for (const word of words) {
    if (!lowerWords.includes(word.toLowerCase())) {
      uniqueWords.push(word);
      lowerWords.push(word.toLowerCase());
    }
  }

  // Reunir las palabras únicas
  cleanName = uniqueWords.join(" ");

  // Si el título es muy largo, lo cortamos
  if (cleanName.length > 40) {
    cleanName = cleanName.substring(0, 40) + "...";
  }

  return cleanName;
};

// Función para buscar directamente con Google
const searchGoogleDirect = async (barcode) => {
  try {
    // Usamos DuckDuckGo que generalmente no tiene problemas CORS
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${barcode}+product&format=json`
    );
    const data = await response.json();

    if (data && data.RelatedTopics && data.RelatedTopics.length > 0) {
      const result = data.RelatedTopics[0];
      const title = result.Text || `Producto ${barcode}`;

      // Limpiar el título
      const cleanName = cleanProductTitle(title, barcode);

      return {
        name: cleanName,
        description: result.Result || "",
        barcode: barcode,
        price: "Precio no encontrado",
        imageUrl: result.Icon?.URL || null,
      };
    }

    // Fallback alternativo usando Bing
    const bingResponse = await fetch(
      `https://api.allorigins.win/get?url=${encodeURIComponent(
        `https://www.bing.com/search?q=${barcode}+product`
      )}`
    );

    const htmlData = await bingResponse.json();
    const html = htmlData.contents;

    // Extraer título de los resultados (esto es una extracción básica)
    const titleMatch = html.match(/<h2[^>]*>(.*?)<\/h2>/);
    if (titleMatch && titleMatch[1]) {
      const rawTitle = titleMatch[1].replace(/<[^>]*>/g, "");
      const cleanName = cleanProductTitle(rawTitle, barcode);

      return {
        name: cleanName,
        description: "Información obtenida de búsqueda web",
        barcode: barcode,
        price: "Precio no encontrado",
        imageUrl: null,
      };
    }

    return null;
  } catch (error) {
    console.error("Error en búsqueda directa:", error);
    return null;
  }
};

// Función para buscar un producto por código de barras
export const searchProductByBarcode = async (barcode, statusCallback) => {
  try {
    // Preparamos resultados vacíos iniciales
    let productFound = null;

    // Informar del estado si hay callback
    if (statusCallback) statusCallback("Verificando conexión a internet...");

    // Verificar conexión a internet
    const hasInternet = await checkInternetConnection();
    if (!hasInternet) {
      if (statusCallback) statusCallback("Sin conexión a internet");
      return {
        name: `Producto ${barcode}`,
        description: "Sin conexión a internet para buscar información",
        barcode: barcode,
        price: "Precio no encontrado",
        imageUrl: null,
        searchFailed: true,
      };
    }

    // Caso especial: Si es un ISBN, intentar primero con Open Library
    if (barcode.length === 10 || barcode.length === 13) {
      try {
        if (statusCallback) statusCallback("Buscando como ISBN...");
        const isbnResponse = await fetch(
          `https://openlibrary.org/api/books?bibkeys=ISBN:${barcode}&format=json&jscmd=data`
        );
        const isbnData = await isbnResponse.json();

        if (isbnData[`ISBN:${barcode}`]) {
          const book = isbnData[`ISBN:${barcode}`];
          productFound = {
            name: book.title,
            description: book.subtitle || book.by_statement || "",
            barcode: barcode,
            price: "Precio no encontrado",
            imageUrl: book.cover?.medium || null,
          };
          console.log("Libro encontrado:", productFound);
          return productFound;
        }
      } catch (isbnError) {
        console.log("Error buscando como ISBN:", isbnError);
        // Continuamos con otros métodos
      }
    }

    if (!productFound) {
      // Intentamos la API Open Food Facts que generalmente no tiene problemas de CORS
      try {
        if (statusCallback) statusCallback("Buscando producto alimenticio...");
        const response = await fetch(
          `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
        );
        const data = await response.json();

        if (data.status === 1) {
          const product = data.product;
          // Limpiar el título
          const cleanName = cleanProductTitle(product.product_name, barcode);

          productFound = {
            name: cleanName,
            description: product.generic_name || product.ingredients_text || "",
            barcode: barcode,
            price: product.price ? product.price : "Precio no encontrado",
            imageUrl: product.image_url || null,
          };
          console.log("Producto alimenticio encontrado:", productFound);
          return productFound;
        }
      } catch (foodApiError) {
        console.log("Error en API Open Food Facts:", foodApiError);
        // Continuamos con el siguiente método
      }
    }

    if (!productFound) {
      // Intentamos UPC Item DB
      try {
        if (statusCallback) statusCallback("Buscando en base de datos UPC...");
        // Usamos allorigins.win como proxy para evitar CORS
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
          `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`
        )}`;

        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (data && data.contents) {
          const result = JSON.parse(data.contents);

          if (result.items && result.items.length > 0) {
            const item = result.items[0];

            // Limpiar el título
            const cleanName = cleanProductTitle(item.title, barcode);

            // Acortar descripción si existe
            const shortDesc = item.description
              ? item.description.substring(0, 500) +
                (item.description.length > 500 ? "..." : "")
              : "";

            // Obtener precio si existe
            const price =
              item.lowest_recorded_price ||
              item.highest_recorded_price ||
              "Precio no encontrado";

            productFound = {
              name: cleanName,
              description: shortDesc,
              barcode: barcode,
              price: price,
              imageUrl:
                item.images && item.images.length > 0 ? item.images[0] : null,
            };
            console.log("Producto UPC encontrado:", productFound);
            return productFound;
          }
        }
      } catch (upcError) {
        console.log("Error en proxy para UPC API:", upcError);
      }
    }

    if (!productFound) {
      // Última opción: búsqueda mediante Google/Bing
      if (statusCallback) statusCallback("Buscando información en la web...");
      const directSearchResult = await searchGoogleDirect(barcode);
      if (directSearchResult) {
        console.log("Producto encontrado en búsqueda web:", directSearchResult);
        return directSearchResult;
      }
    }

    // Si todo falla, devolvemos un producto genérico
    if (statusCallback)
      statusCallback("No se encontró información del producto");
    console.log("Generando información genérica para:", barcode);
    return {
      name: `Producto ${barcode}`,
      description: "Sin descripción disponible",
      barcode: barcode,
      price: "Precio no encontrado",
      imageUrl: null,
      searchFailed: true,
    };
  } catch (error) {
    console.error("Error crítico buscando producto:", error);
    if (statusCallback) statusCallback("Error en la búsqueda");
    // En caso de error crítico, devolvemos igualmente un resultado para no bloquear la UI
    return {
      name: `Producto ${barcode}`,
      description: "Error en la búsqueda: " + error.message,
      barcode: barcode,
      price: "Precio no encontrado",
      imageUrl: null,
      searchFailed: true,
    };
  }
};
