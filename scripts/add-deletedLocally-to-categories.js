// Script para añadir la columna deletedLocally a la tabla Categories
import fs from 'fs';
import path from 'path';
import BetterSqlite3 from 'better-sqlite3';
import os from 'os';

// Función principal de migración que será exportada
export default async function runMigration() {
  // Determinar si la aplicación está empaquetada (similar a database.js)
  const isPackaged =
    process.env.NODE_ENV === "production" ||
    (typeof process.versions === "object" &&
    typeof process.versions.electron === "string");

  console.log("¿Modo empaquetado en migración?:", isPackaged);

  // Determinar la ruta de la base de datos usando la misma lógica que database.js
  let dbPath;
  let userDataPath;

  try {
    if (isPackaged) {
      try {
        // En Electron asar, necesitamos usar una ruta fuera del paquete
        if (process.env.APPDATA) {
          // Windows
          userDataPath = process.env.APPDATA;
        } else if (process.platform === 'darwin') {
          // macOS
          userDataPath = path.join(
            process.env.HOME,
            "/Library/Application Support"
          );
        } else {
          // Linux y otros
          userDataPath = path.join(process.env.HOME, "/.local/share");
        }

        // Crear una ruta específica para la aplicación
        const appDataPath = path.join(userDataPath, "sistema-inventario");

        // Asegurar que el directorio existe
        if (!fs.existsSync(appDataPath)) {
          try {
            fs.mkdirSync(appDataPath, { recursive: true });
            console.log("Directorio creado:", appDataPath);
          } catch (mkdirErr) {
            console.error("Error al crear directorio de datos:", mkdirErr);
          }
        }

        // Usar una ubicación fija con nombre descriptivo
        dbPath = path.join(appDataPath, "inventory-database.sqlite");
        console.log("Ruta de base de datos para migración en producción:", dbPath);
      } catch (err) {
        console.error("Error al obtener ruta de datos:", err);
        // Fallback a la ruta del extraResources
        try {
          if (process.resourcesPath) {
            dbPath = path.join(process.resourcesPath, "database.sqlite");
          } else {
            dbPath = path.join(path.dirname(process.execPath), "database.sqlite");
          }
          console.log("Usando ruta fallback para base de datos:", dbPath);
        } catch (e) {
          console.error("Error en fallback de ruta:", e);
          // Último recurso: usar una ruta en el directorio temporal
          dbPath = path.join(os.tmpdir(), "inventory-database.sqlite");
          console.log("Usando ruta temporal para base de datos:", dbPath);
        }
      }
    } else {
      // En desarrollo, usar una ruta relativa al directorio del proyecto
      dbPath = path.join(process.cwd(), "database.sqlite");
      console.log("Ruta de base de datos para migración en desarrollo:", dbPath);
    }
    
    // Verificar que la base de datos existe
    if (!fs.existsSync(dbPath)) {
      console.error(`ERROR: La base de datos no existe en ${dbPath}`);
      console.log("Intentando buscar la base de datos en otras ubicaciones comunes...");
      
      // Lista de ubicaciones donde la base de datos podría estar
      const possibleLocations = [
        // Ubicaciones en diferentes plataformas 
        path.join(process.cwd(), "database.sqlite"),
        path.join(os.homedir(), ".local/share/sistema-inventario/inventory-database.sqlite"),
        path.join(os.homedir(), "AppData/Roaming/sistema-inventario/inventory-database.sqlite"),
        path.join(os.homedir(), "Library/Application Support/sistema-inventario/inventory-database.sqlite"),
        // Si estamos en una aplicación empaquetada
        process.resourcesPath ? path.join(process.resourcesPath, "database.sqlite") : null,
        // En el directorio temporal
        path.join(os.tmpdir(), "inventory-database.sqlite")
      ].filter(Boolean);
      
      for (const location of possibleLocations) {
        console.log(`Verificando: ${location}`);
        if (fs.existsSync(location)) {
          console.log(`¡Base de datos encontrada en ${location}!`);
          dbPath = location;
          break;
        }
      }
      
      if (!fs.existsSync(dbPath)) {
        throw new Error(`Base de datos no encontrada en ninguna ubicación común`);
      }
    }
    
    console.log('=== ACTUALIZACIÓN DE ESTRUCTURA DE BASE DE DATOS ===');
    console.log(`Base de datos a modificar: ${dbPath}`);
    
    // Hacer una copia de seguridad solo si es posible (si no, continuar sin ella)
    try {
      const backupPath = `${dbPath}.${Date.now()}.backup`;
      fs.copyFileSync(dbPath, backupPath);
      console.log(`Se creó una copia de seguridad en: ${backupPath}`);
    } catch (backupError) {
      console.warn("No se pudo crear copia de seguridad, continuando sin ella:", backupError.message);
    }
    
    // Abrir la base de datos con better-sqlite3
    const db = new BetterSqlite3(dbPath, { verbose: console.log });
    console.log('Conectado a la base de datos');
    
    // Función para verificar si una columna existe en una tabla
    function columnExists(tableName, columnName) {
      const result = db.prepare(`PRAGMA table_info(${tableName})`).all();
      return result.some(column => column.name === columnName);
    }

    // Actualizar la estructura
    try {
      // Verificar si la tabla Categories existe
      const tablesQuery = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      const tables = tablesQuery.map(t => t.name);
      console.log("Tablas encontradas:", tables.join(', '));
      
      if (!tables.includes('Categories')) {
        console.error("La tabla 'Categories' no existe. Se intentará crearla.");
        
        // Intentar crear la tabla Categories si no existe
        db.exec(`
          CREATE TABLE IF NOT EXISTS Categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            synced BOOLEAN DEFAULT 0,
            modified BOOLEAN DEFAULT 1,
            deletedLocally BOOLEAN DEFAULT 0,
            createdAt TEXT,
            updatedAt TEXT
          )
        `);
        console.log("Tabla Categories creada correctamente");
        return true;
      }
      
      // Comenzar transacción
      db.exec('BEGIN TRANSACTION');
      
      // Examinar la estructura actual
      console.log("Analizando la estructura de la base de datos...");
      
      // Mostrar esquema de Categories
      const categoryColumns = db.prepare("PRAGMA table_info(Categories)").all();
      console.log("Columnas actuales en Categories:", categoryColumns.map(c => c.name).join(', '));
      
      // Contar categorías
      const categoryCount = db.prepare("SELECT COUNT(*) as count FROM Categories").get();
      console.log(`Total de categorías en la base de datos: ${categoryCount.count}`);
      
      // Añadir columna deletedLocally a Categories
      if (!columnExists('Categories', 'deletedLocally')) {
        console.log("Añadiendo columna 'deletedLocally' a la tabla Categories");
        db.exec("ALTER TABLE Categories ADD COLUMN deletedLocally BOOLEAN DEFAULT 0");
        console.log("Columna 'deletedLocally' añadida exitosamente");
      } else {
        console.log("La columna 'deletedLocally' ya existe en Categories");
      }
      
      // Añadir columnas synced y modified si no existen
      if (!columnExists('Categories', 'synced')) {
        console.log("Añadiendo columna 'synced' a la tabla Categories");
        db.exec("ALTER TABLE Categories ADD COLUMN synced BOOLEAN DEFAULT 0");
      }
      
      if (!columnExists('Categories', 'modified')) {
        console.log("Añadiendo columna 'modified' a la tabla Categories");
        db.exec("ALTER TABLE Categories ADD COLUMN modified BOOLEAN DEFAULT 1");
      }
      
      // Finalizar transacción
      db.exec('COMMIT');
      
      console.log('=== ACTUALIZACIÓN COMPLETADA CON ÉXITO ===');
      
      // Mostrar algunas categorías como verificación
      try {
        const sampleCategories = db.prepare("SELECT id, name, deletedLocally FROM Categories LIMIT 5").all();
        console.log("Muestra de categorías en la base de datos:");
        sampleCategories.forEach(category => {
          console.log(`  - #${category.id}: ${category.name}, deletedLocally: ${category.deletedLocally}`);
        });
      } catch (sampleError) {
        console.warn("No se pudieron mostrar categorías de ejemplo:", sampleError.message);
      }
      
      return true;
    } catch (error) {
      console.error('ERROR DURANTE LA ACTUALIZACIÓN:', error);
      try {
        db.exec('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error en rollback:', rollbackError);
      }
      throw error;
    } finally {
      // Cerrar conexión
      try {
        db.close();
      } catch (closeError) {
        console.error('Error al cerrar la conexión:', closeError);
      }
    }
  } catch (mainError) {
    console.error("ERROR PRINCIPAL EN MIGRACIÓN:", mainError);
    return false;
  }
}

// Ejecutar la migración cuando se llama directamente como script
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
    .then(() => console.log('Migración completada exitosamente'))
    .catch(err => {
      console.error('Error en migración:', err);
      process.exit(1);
    });
} 