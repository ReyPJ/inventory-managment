# Sistema de Inventario

Aplicación de escritorio para gestión de inventario sin conexión con soporte para lectores de código de barras, construida con Electron, React y SQLite.

## Características

- Gestión de productos y categorías (CRUD completo)
- Soporte para lectores de código de barras
- Búsqueda de información de productos en línea mediante código de barras (cuando hay conexión)
- Base de datos local SQLite que funciona sin conexión
- Interfaz moderna con React

## Requisitos

- Node.js (versión 18+)
- npm o yarn

## Desarrollo

Para ejecutar la aplicación en modo desarrollo:

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run electron:dev
```

## Construcción para Windows

Para construir la aplicación como un ejecutable para Windows:

```bash
# Construir la aplicación
npm run build:win
```

El archivo ejecutable se generará en la carpeta `release` y estará listo para ser instalado en cualquier sistema Windows.

## Configuración

La aplicación guarda la base de datos en:

- **Desarrollo**: en la raíz del proyecto como `database.sqlite`
- **Producción**: en la carpeta de datos del usuario de la aplicación

## Notas

- La sincronización con una API de FastAPI está planificada para futuras versiones
- Se recomienda hacer backup periódicos de la base de datos
