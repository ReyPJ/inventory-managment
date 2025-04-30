# Gestión de Tenants y API Keys

Este documento describe cómo utilizar el sistema multi-tenant para manejar diferentes instancias del inventario.

## API Keys Predefinidas

El sistema viene con las siguientes API keys predefinidas:

- **Admin**: `ADMIN_API_KEY` (definida en tu archivo `.env`)
- **Casa**: `cs_b7f6da13c8e54291bd76a452c9f38e7a`
- **Negocio**: `ng_3e5f91d082a649d7bc408e71af26de59`

## Inicialización de Tenants

Para inicializar los tenants predefinidos, ejecuta:

```bash
python init_tenants.py
```

Este script crea automáticamente los tenants "Casa" y "Negocio" con sus respectivas API keys.

## Uso en Aplicación de Escritorio

### Para Casa

Configura tu aplicación Electron/Desktop para usar la API key de Casa:

```javascript
const API_KEY = "cs_b7f6da13c8e54291bd76a452c9f38e7a";
```

### Para Negocio

Configura tu aplicación Electron/Desktop para usar la API key de Negocio:

```javascript
const API_KEY = "ng_3e5f91d082a649d7bc408e71af26de59";
```

## Uso en Aplicación Móvil

De la misma manera, configura tu app móvil con la API key correspondiente.

### Para Casa

```javascript
const apiKey = "cs_b7f6da13c8e54291bd76a452c9f38e7a";
```

### Para Negocio

```javascript
const apiKey = "ng_3e5f91d082a649d7bc408e71af26de59";
```

## Creación de Nuevos Tenants

Para crear un nuevo tenant (requiere la API key de administrador):

```javascript
async function createTenant(name, description, customApiKey = null) {
  const data = {
    name: name,
    description: description,
  };

  // Si se proporciona una API key personalizada
  if (customApiKey) {
    data.api_key = customApiKey;
  }

  const response = await fetch("http://localhost:8000/tenants/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "TU_ADMIN_API_KEY", // La API key de administrador
    },
    body: JSON.stringify(data),
  });

  return await response.json();
}

// Ejemplo de uso
createTenant(
  "Mi Tienda",
  "Inventario de mi tienda",
  "mt_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
);
```

## Flujo de Sincronización Correcto

Para evitar conflictos entre múltiples dispositivos del mismo tenant, es **imprescindible** usar el flujo de sincronización en dos pasos:

### Paso 1: Obtener datos actuales

Primero, obtener todos los productos actuales del servidor para integrarlo con los datos locales. Este paso es crucial para no eliminar accidentalmente productos agregados por otros dispositivos.

### Paso 2: Sincronizar con lista completa de IDs

Después de combinar los datos locales con los del servidor, enviar la sincronización incluyendo:

- Solo los productos modificados localmente (para actualizar)
- La lista completa de todos los IDs conocidos (locales + servidor), **excluyendo los marcados para eliminar**

### Manejo de eliminaciones

Para eliminar productos correctamente:

1. Cuando un usuario elimina un producto localmente, márcalo como "eliminado localmente" pero no lo borres de la base de datos
2. Al sincronizar, excluye los productos marcados como "eliminados" de la lista de IDs que envías
3. El servidor interpretará que estos IDs deben eliminarse ya que no están en la lista

### Ejemplo de flujo completo

```javascript
// 1. Obtener productos del servidor
const serverProducts = await getProductsFromServer();

// 2. Filtrar productos del servidor que están marcados para eliminar
const filteredServerProducts = serverProducts.filter(
  (product) => !locallyDeletedIds.includes(product.id)
);

// 3. Combinar con productos locales (excepto los eliminados)
const allProducts = mergeLocalAndServerProducts(
  localProducts.filter((p) => !p.deletedLocally),
  filteredServerProducts
);

// 4. Obtener todos los IDs (excluyendo los marcados para eliminar)
const allKnownIds = getAllProductIds(allProducts);

// 5. Sincronizar
const result = await syncProducts(
  localProducts.filter((p) => p.modified && !p.deletedLocally),
  allKnownIds // Esta lista ya excluye los IDs que queremos eliminar
);

// 6. Después de una sincronización exitosa, eliminar definitivamente
// los productos marcados como eliminados de la base de datos local
removeLocallyDeletedProducts();
```

Este flujo garantiza que:

- Se detectan y aplican todas las eliminaciones locales
- No se eliminan accidentalmente productos agregados por otros dispositivos
- Se mantiene la integridad de los datos entre múltiples dispositivos

## Consideraciones de Seguridad

- Mantén tus API keys seguras y no las expongas públicamente
- La API key de admin tiene privilegios elevados y debe protegerse especialmente
- Cada tenant solo puede acceder a sus propios datos, aislados de otros tenants
