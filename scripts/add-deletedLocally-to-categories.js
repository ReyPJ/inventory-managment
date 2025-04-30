// Script para añadir la columna deletedLocally a la tabla Categories
import fs from 'fs';
import path from 'path';
import BetterSqlite3 from 'better-sqlite3';
import os from 'os';

// Determinar la ruta de la base de datos según el sistema operativo
let dbPath;

if (process.env.APPDATA) {
  // Windows
  dbPath = path.join(process.env.APPDATA, 'sistema-inventario', 'inventory-database.sqlite');
} else if (process.platform === 'darwin') {
  // macOS
  dbPath = path.join(process.env.HOME, 'Library/Application Support', 'sistema-inventario', 'inventory-database.sqlite');
} else {
  // Linux y otros
  dbPath = path.join(process.env.HOME, '.local/share', 'sistema-inventario', 'inventory-database.sqlite');
}

// Verificar que la base de datos existe
if (!fs.existsSync(dbPath)) {
  console.error(`ERROR: La base de datos no existe en ${dbPath}`);
  process.exit(1);
}

console.log('=== ACTUALIZACIÓN DE ESTRUCTURA DE BASE DE DATOS ===');
console.log(`Base de datos a modificar: ${dbPath}`);

// Hacer una copia de seguridad
const backupPath = `${dbPath}.${Date.now()}.backup`;
fs.copyFileSync(dbPath, backupPath);
console.log(`Se creó una copia de seguridad en: ${backupPath}`);

// Abrir la base de datos con better-sqlite3
const db = new BetterSqlite3(dbPath);
console.log('Conectado a la base de datos');

// Función para verificar si una columna existe en una tabla
function columnExists(tableName, columnName) {
  const result = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return result.some(column => column.name === columnName);
}

// Actualizar la estructura
async function updateDatabaseStructure() {
  try {
    // Comenzar transacción
    db.exec('BEGIN TRANSACTION');
    
    // Examinar la estructura actual
    console.log("Analizando la estructura de la base de datos...");
    
    // Listar todas las tablas
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log("Tablas encontradas:", tables.map(t => t.name).join(', '));
    
    // Verificar si existe la tabla Categories
    if (!tables.some(t => t.name === 'Categories')) {
      throw new Error("La tabla 'Categories' no existe en la base de datos");
    }
    
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
    const sampleCategories = db.prepare("SELECT id, name, deletedLocally FROM Categories LIMIT 5").all();
    console.log("Muestra de categorías en la base de datos:");
    sampleCategories.forEach(category => {
      console.log(`  - #${category.id}: ${category.name}, deletedLocally: ${category.deletedLocally}`);
    });
    
  } catch (error) {
    console.error('ERROR DURANTE LA ACTUALIZACIÓN:', error);
    db.exec('ROLLBACK');
    process.exit(1);
  } finally {
    // Cerrar conexión
    db.close();
  }
}

// Ejecutar la actualización
updateDatabaseStructure(); 