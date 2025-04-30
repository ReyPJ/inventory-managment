# API de Sincronización de Inventario

API REST para sincronizar inventario entre una aplicación de escritorio y una aplicación móvil, con soporte para consultas de precios a Mercado Libre.

## Tabla de Contenidos

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Autenticación](#autenticación)
- [Endpoints](#endpoints)
  - [Tenants](#tenants)
  - [Productos](#productos)
  - [Categorías](#categorías)
  - [Sincronización](#sincronización)
  - [Generales](#generales)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Integración con Electron](#integración-con-electron)

## Requisitos

- Python 3.10+
- FastAPI
- SQLAlchemy
- SQLite

## Instalación

1. Clonar el repositorio
2. Instalar dependencias: `pip install -r requirements.txt`
3. Crear archivo `.env` con:
   ```
   ADMIN_API_KEY=tu_clave_admin_secreta
   DATABASE_URL=sqlite+aiosqlite:///./inventory.db
   ```
4. Ejecutar: `uvicorn main:app --reload`
5. Inicializar tenants predefinidos: `python init_tenants.py`

## Autenticación

Todos los endpoints (excepto `/` y `/ping`) requieren autenticación mediante una API Key.

**Header requerido:**

```
X-API-Key: tu_clave_secreta
```

La API soporta dos tipos de autenticación:

1. **Admin API Key**: Para gestionar tenants
2. **Tenant API Key**: Para gestionar datos de un negocio específico

### API Keys Predefinidas

- **Admin**: Definida en tu archivo `.env` como `ADMIN_API_KEY`
- **Casa**: `cs_b7f6da13c8e54291bd76a452c9f38e7a`
- **Negocio**: `ng_3e5f91d082a649d7bc408e71af26de59`

## Endpoints

### Tenants

#### POST `/tenants/`

Crea un nuevo tenant (requiere Admin API Key).

**Solicitud:**

```json
{
  "name": "Mi Negocio",
  "description": "Descripción del negocio",
  "api_key": "mi_api_key_personalizada" // Opcional
}
```

**Respuesta:**

```json
{
  "id": 1,
  "name": "Mi Negocio",
  "description": "Descripción del negocio",
  "api_key": "mi_api_key_personalizada"
}
```

#### GET `/tenants/`

Lista todos los tenants (requiere Admin API Key).

#### GET `/tenants/me`

Obtiene información del tenant actual (basado en la API Key usada).

### Productos

#### GET `/products/`

Obtiene todos los productos del tenant asociado a la API Key.

**Respuesta:**

```json
[
  {
    "id": 1,
    "barcode": "123456789",
    "name": "Producto 1",
    "description": "Descripción del producto",
    "price": 100.0,
    "stock": 10,
    "synced": true,
    "category_id": 1,
    "tenant_id": 1
  }
]
```

#### GET `/products/{product_id}`

Obtiene un producto específico por ID (solo si pertenece al tenant de la API Key).

### Categorías

#### GET `/categories/`

Obtiene todas las categorías del tenant asociado a la API Key.

#### GET `/categories/{category_id}`

Obtiene una categoría específica por ID (solo si pertenece al tenant de la API Key).

### Sincronización

Para evitar eliminar datos creados por otras instancias, la sincronización debe seguir un flujo en dos pasos:

#### Paso 1: Obtener datos actuales

Primero, obtener todos los productos actuales del servidor:

```javascript
async function getServerProducts() {
  const response = await fetch("http://localhost:8000/products/", {
    headers: {
      "X-API-Key": "cs_b7f6da13c8e54291bd76a452c9f38e7a",
    },
  });

  return await response.json();
}
```

#### Paso 2: Sincronizar con datos actualizados

Después de actualizar la base de datos local con los datos del servidor, enviar todos los productos y la lista completa de IDs:

```javascript
async function syncProducts(products, allKnownIds) {
  const response = await fetch("http://localhost:8000/sync/products/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "cs_b7f6da13c8e54291bd76a452c9f38e7a",
    },
    body: JSON.stringify({
      products: products,
      ids: {
        ids: allKnownIds,
      },
    }),
  });

  return await response.json();
}
```

> **IMPORTANTE**: Siempre realizar primero el paso 1 (obtener datos actuales) y luego el paso 2 (sincronizar) para evitar eliminaciones no deseadas cuando se trabaja con múltiples dispositivos.

### Generales

#### GET `/ping`

Verifica si la API está funcionando.

#### GET `/`

Endpoint raíz con información básica.

## Ejemplos de Uso

### Configuración inicial para un negocio

El script `init_tenants.py` ya crea automáticamente los tenants "Casa" y "Negocio" con sus respectivas API keys.

Si quieres crear un tenant adicional manualmente:

```javascript
async function createTenant(name, description, apiKey) {
  const response = await fetch("http://localhost:8000/tenants/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "tu_admin_key",
    },
    body: JSON.stringify({
      name: name,
      description: description,
      api_key: apiKey,
    }),
  });

  return await response.json();
}
```

### Sincronización de productos desde Electron (Casa)

```javascript
async function syncProducts(products, existingIds) {
  const response = await fetch("http://localhost:8000/sync/products/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "cs_b7f6da13c8e54291bd76a452c9f38e7a",
    },
    body: JSON.stringify({
      products: products,
      ids: {
        ids: existingIds,
      },
    }),
  });

  return await response.json();
}
```

### Obtener todos los productos desde la app móvil (Negocio)

```javascript
async function getProducts() {
  const response = await fetch("http://localhost:8000/products/", {
    headers: {
      "X-API-Key": "ng_3e5f91d082a649d7bc408e71af26de59",
    },
  });

  return await response.json();
}
```

## Integración con Electron

Para integrar esta API con tu aplicación Electron, sigue estos pasos:

1. **Instala Axios o Fetch en tu app Electron**
2. **Configura la URL base y la API Key del tenant**
3. **Implementa funciones de sincronización**
   - Al iniciar la app: Obtén datos desde la API
   - Al cerrar la app: Sincroniza cambios a la API
   - Periódicamente: Sincroniza cambios según sea necesario
4. **Maneja la sincronización bidireccional**
   - Mantén un registro de IDs de productos en la app de escritorio
   - Envía la lista completa de IDs en cada sincronización

### Ejemplo de Cliente en Electron (Casa)

```javascript
const { app } = require("electron");
const axios = require("axios");

const API_URL = "http://localhost:8000";
const API_KEY = "cs_b7f6da13c8e54291bd76a452c9f38e7a"; // API key de Casa

// Configuración de Axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  },
});

// Función para obtener todos los productos del servidor
async function getServerProducts() {
  try {
    const response = await apiClient.get("/products/");
    return response.data;
  } catch (error) {
    console.error("Error al obtener productos del servidor:", error);
    throw error;
  }
}

// Función para sincronizar productos
async function syncProducts(products, existingIds) {
  try {
    const response = await apiClient.post("/sync/products/", {
      products: products,
      ids: {
        ids: existingIds,
      },
    });

    console.log("Sincronización completada:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al sincronizar:", error);
    throw error;
  }
}

// Función de sincronización completa en dos pasos
async function fullSync(localProducts, locallyDeletedIds = []) {
  try {
    // PASO 1: Obtener productos del servidor
    const serverProducts = await getServerProducts();

    // Filtrar productos del servidor que están marcados para eliminar
    const filteredServerProducts = serverProducts.filter(
      (product) => !locallyDeletedIds.includes(product.id)
    );

    // Combinar productos del servidor con productos locales
    let allKnownProducts = mergeProducts(
      localProducts.filter((p) => !p.deletedLocally),
      filteredServerProducts
    );

    // Obtener todos los IDs conocidos (excluyendo eliminados)
    let allKnownIds = allKnownProducts
      .map((p) => p.id)
      .filter((id) => id !== undefined);

    // PASO 2: Enviar sincronización con la lista filtrada de IDs
    return await syncProducts(
      // Solo enviamos los productos modificados localmente y no eliminados
      localProducts.filter((p) => p.modified && !p.deletedLocally),
      // Enviamos todos los IDs que conocemos (excepto los que queremos eliminar)
      allKnownIds
    );
  } catch (error) {
    console.error("Error en sincronización completa:", error);
    throw error;
  }
}

// Función de ejemplo para combinar productos locales y del servidor
function mergeProducts(localProducts, serverProducts) {
  // Crear un mapa de productos locales indexados por barcode
  const localProductMap = {};
  localProducts.forEach((product) => {
    localProductMap[product.barcode] = product;
  });

  // Combinar con productos del servidor
  const result = [...localProducts];

  // Agregar productos del servidor que no existen localmente
  serverProducts.forEach((serverProduct) => {
    if (!localProductMap[serverProduct.barcode]) {
      // Es un producto nuevo del servidor
      result.push({
        ...serverProduct,
        synced: true, // Marcarlo como sincronizado
      });
    }
  });

  return result;
}

// Sincronizar al iniciar y cerrar la app
app.on("ready", async () => {
  try {
    // Obtener productos locales y los marcados para eliminar
    const localProducts = getLocalProducts();
    const locallyDeletedIds = getLocallyDeletedProductIds();

    // Sincronización completa al iniciar
    const syncResult = await fullSync(localProducts, locallyDeletedIds);
    console.log("Sincronización inicial completada");

    // Actualizar BD local con los resultados
    updateLocalDatabase(syncResult);

    // Si la sincronización fue exitosa, eliminar definitivamente
    // los productos marcados como eliminados
    if (syncResult) {
      removeLocallyDeletedProducts();
    }

    // Resto de la inicialización de la app...
  } catch (error) {
    console.error("Error al sincronizar al inicio:", error);
  }
});

app.on("before-quit", async (event) => {
  // Prevenir cierre inmediato
  event.preventDefault();

  try {
    // Obtener productos locales y los marcados para eliminar
    const localProducts = getLocalProducts();
    const locallyDeletedIds = getLocallyDeletedProductIds();

    // Sincronización completa al cerrar
    const syncResult = await fullSync(localProducts, locallyDeletedIds);

    // Si la sincronización fue exitosa, eliminar definitivamente
    // los productos marcados como eliminados
    if (syncResult) {
      removeLocallyDeletedProducts();
    }

    // Ahora permitir que la app se cierre
    app.exit();
  } catch (error) {
    console.error("Error al sincronizar antes de salir:", error);
    app.exit(1); // Salir con código de error
  }
});

// Estas funciones deben ser implementadas según tu manejo de BD local
function getLocalProducts() {
  /* ... */
}
function getLocallyDeletedProductIds() {
  /* ... */
}
function updateLocalDatabase(syncResult) {
  /* ... */
}
function removeLocallyDeletedProducts() {
  /* ... */
}
```
