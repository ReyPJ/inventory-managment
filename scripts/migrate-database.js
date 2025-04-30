// Script para migrar datos entre versiones del sistema de inventario
// Transfiere productos y categorías de la base de datos antigua a la nueva estructura

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import BetterSqlite3 from 'better-sqlite3';
import os from 'os';

// Definir rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Ruta de la base de datos antigua (en raíz del proyecto)
const oldDbPath = path.join(projectRoot, 'database.sqlite');

// Determinar la ruta de la nueva base de datos
let newDbPath;

// Detectar la ubicación de datos según el sistema operativo
if (process.env.APPDATA) {
  // Windows
  newDbPath = path.join(process.env.APPDATA, 'sistema-inventario', 'inventory-database.sqlite');
} else if (process.platform === 'darwin') {
  // macOS
  newDbPath = path.join(process.env.HOME, 'Library/Application Support', 'sistema-inventario', 'inventory-database.sqlite');
} else {
  // Linux y otros
  newDbPath = path.join(process.env.HOME, '.local/share', 'sistema-inventario', 'inventory-database.sqlite');
}

// Asegurar que el directorio existe
const newDbDir = path.dirname(newDbPath);
if (!fs.existsSync(newDbDir)) {
  fs.mkdirSync(newDbDir, { recursive: true });
  console.log(`Directorio creado: ${newDbDir}`);
}

// Verificar que la base de datos antigua existe
if (!fs.existsSync(oldDbPath)) {
  console.error(`ERROR: La base de datos original no existe en ${oldDbPath}`);
  process.exit(1);
}

console.log('=== MIGRACIÓN DE BASE DE DATOS ===');
console.log(`Base de datos original: ${oldDbPath}`);
console.log(`Nueva ubicación: ${newDbPath}`);

// Hacer una copia de seguridad de la base de datos nueva si existe
if (fs.existsSync(newDbPath)) {
  const backupPath = `${newDbPath}.${Date.now()}.backup`;
  fs.copyFileSync(newDbPath, backupPath);
  console.log(`Se creó una copia de seguridad de la base de datos actual en: ${backupPath}`);
}

// Abrir la base de datos antigua con sqlite3
const oldDb = new sqlite3.Database(oldDbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos antigua:', err.message);
    process.exit(1);
  }
  console.log('Conectado a la base de datos antigua');
});

// Crear o abrir la base de datos nueva con better-sqlite3
const newDb = new BetterSqlite3(newDbPath);
console.log('Conectado a la nueva base de datos');

// Examinar la estructura de la base de datos antigua
const examineOldDb = () => {
  return new Promise((resolve, reject) => {
    // Listar todas las tablas
    oldDb.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log("Tablas encontradas en la base de datos antigua:", tables.map(t => t.name).join(', '));
      
      // Para cada tabla, ver su esquema y contar registros
      const tablePromises = tables.map(table => {
        return new Promise((resolveTable, rejectTable) => {
          // Obtener esquema
          oldDb.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
            if (err) {
              rejectTable(err);
              return;
            }
            
            console.log(`Esquema de tabla ${table.name}:`);
            columns.forEach(col => {
              console.log(`  - ${col.name} (${col.type})`);
            });
            
            // Contar registros
            oldDb.get(`SELECT COUNT(*) as count FROM ${table.name}`, [], (err, result) => {
              if (err) {
                rejectTable(err);
                return;
              }
              console.log(`  Total registros: ${result.count}`);
              resolveTable();
            });
          });
        });
      });
      
      Promise.all(tablePromises)
        .then(() => resolve())
        .catch(err => reject(err));
    });
  });
};

// Iniciar la migración
async function migrateDatabase() {
  try {
    // Examinar la base de datos antigua primero
    console.log("Analizando la base de datos antigua...");
    await examineOldDb();
    
    // Habilitar claves foráneas y comenzar transacción
    newDb.pragma('foreign_keys = OFF');
    newDb.exec('BEGIN TRANSACTION');

    // Eliminar tablas existentes en la nueva base de datos para evitar conflictos
    console.log("Eliminando tablas existentes en la nueva base de datos...");
    newDb.exec(`DROP TABLE IF EXISTS Products`);
    newDb.exec(`DROP TABLE IF EXISTS Categories`);
    
    // 1. Crear las tablas necesarias
    console.log("Creando nuevas tablas...");
    newDb.exec(`
      CREATE TABLE IF NOT EXISTS "Categories" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "name" VARCHAR(255) NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    newDb.exec(`
      CREATE TABLE IF NOT EXISTS "Products" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "barcode" VARCHAR(255) NOT NULL UNIQUE,
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "price" DECIMAL(10, 2) NOT NULL DEFAULT 0,
        "stock" INTEGER NOT NULL DEFAULT 0,
        "synced" BOOLEAN DEFAULT 0,
        "modified" BOOLEAN DEFAULT 1,
        "deletedLocally" BOOLEAN DEFAULT 0,
        "lastSync" DATETIME,
        "syncError" TEXT,
        "remoteId" INTEGER,
        "CategoryId" INTEGER,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("CategoryId") REFERENCES "Categories" ("id")
      );
    `);

    // 2. Migrar categorías
    console.log('Migrando categorías...');
    await new Promise((resolve, reject) => {
      oldDb.all('SELECT * FROM Categories', [], (err, categories) => {
        if (err) {
          reject(err);
          return;
        }
        
        console.log(`Encontradas ${categories.length} categorías para migrar`);
        
        // Imprimir detalle de las categorías para verificar
        categories.forEach(cat => {
          console.log(`  - Categoría #${cat.id}: ${cat.name}`);
        });
        
        // Insertar cada categoría en la nueva base de datos
        const insertCategoryStmt = newDb.prepare(`
          INSERT OR IGNORE INTO Categories (id, name, createdAt, updatedAt)
          VALUES (?, ?, ?, ?)
        `);

        for (const category of categories) {
          insertCategoryStmt.run(
            category.id, 
            category.name, 
            category.createdAt || new Date().toISOString(),
            category.updatedAt || new Date().toISOString()
          );
        }
        
        console.log('Categorías migradas exitosamente');
        resolve();
      });
    });

    // 3. Migrar productos
    console.log('Migrando productos...');
    await new Promise((resolve, reject) => {
      oldDb.all('SELECT * FROM Products', [], (err, products) => {
        if (err) {
          reject(err);
          return;
        }
        
        console.log(`Encontrados ${products.length} productos para migrar`);
        
        // Imprimir los primeros 3 productos para verificar
        products.slice(0, 3).forEach(prod => {
          console.log(`  - Producto #${prod.id}: ${prod.name}, Código: ${prod.barcode}, Stock: ${prod.stock}`);
        });
        
        if (products.length === 0) {
          console.log("ERROR: No se encontraron productos en la base de datos antigua.");
          console.log("Verificando tabla 'Products'...");
          oldDb.all("PRAGMA table_info(Products)", [], (err, columns) => {
            if (err) {
              console.log("Error al obtener esquema:", err);
              reject(err);
              return;
            }
            console.log("Columnas en tabla Products:", columns.map(c => c.name).join(', '));
            resolve(); // Continuamos aunque no haya productos
          });
          return;
        }
        
        // Insertar cada producto en la nueva base de datos con los campos adicionales
        const insertProductStmt = newDb.prepare(`
          INSERT OR IGNORE INTO Products (
            id, barcode, name, description, price, stock, 
            synced, modified, deletedLocally, CategoryId, 
            createdAt, updatedAt
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const product of products) {
          insertProductStmt.run(
            product.id,
            product.barcode,
            product.name,
            product.description || null,
            product.price,
            product.stock,
            0, // synced = false (no sincronizado aún)
            1, // modified = true (necesita sincronizarse)
            0, // deletedLocally = false (producto activo)
            product.CategoryId,
            product.createdAt || new Date().toISOString(),
            product.updatedAt || new Date().toISOString()
          );
        }
        
        console.log('Productos migrados exitosamente');
        resolve();
      });
    });

    // Finalizar transacción
    newDb.exec('COMMIT');
    
    console.log('=== MIGRACIÓN COMPLETADA CON ÉXITO ===');
    console.log(`Total de datos migrados:`);
    const categoryCount = newDb.prepare('SELECT COUNT(*) as count FROM Categories').get();
    const productCount = newDb.prepare('SELECT COUNT(*) as count FROM Products').get();
    console.log(`- Categorías: ${categoryCount.count}`);
    console.log(`- Productos: ${productCount.count}`);
    
  } catch (error) {
    console.error('ERROR DURANTE LA MIGRACIÓN:', error);
    newDb.exec('ROLLBACK');
    process.exit(1);
  } finally {
    // Cerrar conexiones
    oldDb.close();
    newDb.close();
  }
}

// Ejecutar la migración
migrateDatabase(); 