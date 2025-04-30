# Script de Migración de Base de Datos

Este script transfiere los datos de la base de datos antigua del Sistema de Inventario a la nueva estructura compatible con better-sqlite3.

## Problema que soluciona

La nueva versión del Sistema de Inventario usa:
1. Un nuevo motor de base de datos (better-sqlite3 en lugar de sqlite3)
2. Una nueva ubicación para almacenar la base de datos
3. Campos adicionales para la sincronización (`synced`, `modified`, `deletedLocally`, etc.)

## Instrucciones de uso

1. Asegúrate de que la aplicación esté cerrada antes de ejecutar el script
2. Navega a la carpeta `scripts` en una terminal
3. Instala las dependencias necesarias:

```bash
npm install
```

4. Ejecuta el script de migración:

```bash
npm run migrate
```

5. El script:
   - Leerá todos los productos y categorías de la base de datos antigua
   - Creará o actualizará la nueva base de datos en la ubicación correcta para tu sistema operativo
   - Añadirá todos los campos necesarios para la nueva versión
   - Mostrará un resumen de los datos migrados

6. Una vez completada la migración, inicia la aplicación normalmente

## Ubicación de la nueva base de datos

- **Windows**: `%APPDATA%\sistema-inventario\inventory-database.sqlite`
- **macOS**: `~/Library/Application Support/sistema-inventario/inventory-database.sqlite`
- **Linux**: `~/.local/share/sistema-inventario/inventory-database.sqlite`

## Solución de problemas

Si encuentras algún error:

1. Verifica que la aplicación no esté en ejecución mientras ejecutas el script
2. Asegúrate de tener permisos de escritura en la carpeta de destino
3. Si continúa el problema, revisa los mensajes de error para identificar la causa 