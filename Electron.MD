# Guía para Integrar la API con Electron

## Cambios Importantes en la API

Hemos simplificado la API y eliminado las adaptaciones específicas para Electron. Ahora el frontend de Electron deberá adaptarse a nuestra API y no al revés. A continuación, se describen los cambios más importantes y cómo adaptarse a ellos.

## Autenticación

El sistema ahora utiliza autenticación JWT:

1. Para iniciar sesión, haz una petición POST a `/api/login/` con:

   ```json
   {
     "username": "casa", // o "negocio"
     "password": "Casa123" // "Negocio123"
   }
   ```

2. Recibirás tokens de acceso y refresco:

   ```json
   {
     "refresh": "token_de_refresco_aquí",
     "access": "token_de_acceso_aquí"
   }
   ```

3. Para todas las peticiones siguientes, incluye el token de acceso en la cabecera:
   ```
   Authorization: Bearer token_de_acceso_aquí
   ```

## Cambios en los Modelos

### Categorías

**Antes:**

```json
{
  "id": 1,
  "Id": 1,
  "name": "Ejemplo",
  "description": "Descripción",
  "tenant": 2,
  "products": []
}
```

**Ahora:**

```json
{
  "id": 1,
  "name": "Ejemplo",
  "description": "Descripción",
  "owner": "casa"
}
```

**Adaptación necesaria:**

- Reemplazar referencias a `Id` por `id`
- Cambiar `tenant` por `owner`
- No esperar un array de `products` en la respuesta

### Productos

**Antes:**

```json
{
  "id": 1,
  "barcode": "12345",
  "name": "Producto Ejemplo",
  "description": "Descripción",
  "price": "10.99",
  "stock": 10,
  "synced": false,
  "category": 1,
  "tenant": 2,
  "CategoryId": 1,
  "sku": "ABC123",
  "image_url": "https://ejemplo.com/imagen.jpg",
  "is_active": true,
  "external_id": null,
  "weight": null,
  "created_at": "2023-07-01T12:00:00Z",
  "updated_at": "2023-07-01T12:00:00Z"
}
```

**Ahora:**

```json
{
  "id": 1,
  "barcode": "12345",
  "name": "Producto Ejemplo",
  "description": "Descripción",
  "price": "10.99",
  "stock": 10,
  "category": 1,
  "owner": "casa",
  "sku": "ABC123",
  "image_url": "https://ejemplo.com/imagen.jpg",
  "is_active": true,
  "external_id": null,
  "weight": null,
  "created_at": "2023-07-01T12:00:00Z",
  "updated_at": "2023-07-01T12:00:00Z"
}
```

**Adaptación necesaria:**

- Eliminar uso de `CategoryId` y usar `category` en su lugar
- Cambiar `tenant` por `owner`
- El campo `synced` ha sido eliminado

## Endpoints de la API

### Categorías

- `GET /api/categories/` - Listar categorías
- `GET /api/categories/<id>/` - Obtener detalle de categoría
- `POST /api/categories/create/` - Crear categoría
- `PUT /api/categories/<id>/update/` - Actualizar categoría
- `DELETE /api/categories/<id>/delete/` - Eliminar categoría

### Productos

- `GET /api/products/` - Listar productos
- `GET /api/products/<id>/` - Obtener detalle de producto
- `POST /api/products/create/` - Crear producto
- `PUT /api/products/<id>/update/` - Actualizar producto
- `DELETE /api/products/<id>/delete/` - Eliminar producto

## Campos de E-commerce

Estos campos están disponibles en la API pero no son necesarios para la aplicación Electron:

- `sku`
- `image_url`
- `external_id`
- `weight`

Puedes dejarlos en blanco o null al crear o actualizar productos.

## Filtrado y Permisos

- Cada usuario (`casa` o `negocio`) solo puede ver y manipular sus propios datos
- El campo `owner` se establece automáticamente según el usuario autenticado
- No es necesario enviar el campo `owner` en las peticiones POST/PUT
