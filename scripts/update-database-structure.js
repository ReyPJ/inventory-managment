// Script para actualizar la estructura de la base de datos existente
// Añade las columnas necesarias para la nueva versión sin eliminar datos

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
    
    // Verificar si existe la tabla Products
    if (!tables.some(t => t.name === 'Products')) {
      throw new Error("La tabla 'Products' no existe en la base de datos");
    }
    
    // Verificar si existe la tabla Categories
    if (!tables.some(t => t.name === 'Categories')) {
      throw new Error("La tabla 'Categories' no existe en la base de datos");
    }
    
    // Mostrar esquema de Products
    const productColumns = db.prepare("PRAGMA table_info(Products)").all();
    console.log("Columnas actuales en Products:", productColumns.map(c => c.name).join(', '));
    
    // Contar productos
    const productCount = db.prepare("SELECT COUNT(*) as count FROM Products").get();
    console.log(`Total de productos en la base de datos: ${productCount.count}`);
    
    // Añadir columnas faltantes a Products
    console.log("Añadiendo columnas necesarias...");
    
    const columnsToAdd = [
      { name: "synced", type: "BOOLEAN DEFAULT 0" },
      { name: "modified", type: "BOOLEAN DEFAULT 1" },
      { name: "deletedLocally", type: "BOOLEAN DEFAULT 0" },
      { name: "lastSync", type: "DATETIME" },
      { name: "syncError", type: "TEXT" },
      { name: "remoteId", type: "INTEGER" }
    ];
    
    for (const column of columnsToAdd) {
      if (!columnExists('Products', column.name)) {
        console.log(`Añadiendo columna '${column.name}' a la tabla Products`);
        db.exec(`ALTER TABLE Products ADD COLUMN ${column.name} ${column.type}`);
      } else {
        console.log(`La columna '${column.name}' ya existe en Products`);
      }
    }
    
    // Verificar si existe la columna description, si no, añadirla
    if (!columnExists('Products', 'description')) {
      console.log("Añadiendo columna 'description' a Products");
      db.exec("ALTER TABLE Products ADD COLUMN description TEXT");
    }
    
    // Finalizar transacción
    db.exec('COMMIT');
    
    console.log('=== ACTUALIZACIÓN COMPLETADA CON ÉXITO ===');
    
    // Mostrar algunos productos como verificación
    const sampleProducts = db.prepare("SELECT id, name, barcode, price, stock FROM Products LIMIT 5").all();
    console.log("Muestra de productos en la base de datos:");
    sampleProducts.forEach(product => {
      console.log(`  - #${product.id}: ${product.name}, Código: ${product.barcode}, Precio: ${product.price}, Stock: ${product.stock}`);
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