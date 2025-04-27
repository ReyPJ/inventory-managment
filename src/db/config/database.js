import { Sequelize } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";
import fs from "fs";

// Ubicación relativa para guardar la base de datos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determinar la ruta de la base de datos basado en el entorno
let dbPath;

// Verificar si estamos en el entorno empaquetado de Electron
const isPackaged = process.env.NODE_ENV === 'production' || process.type === 'browser';
console.log("¿Es aplicación empaquetada?:", isPackaged);
console.log("Tipo de proceso:", process.type);
console.log("NODE_ENV:", process.env.NODE_ENV);

// Manejo mejorado para entornos de producción y desarrollo
let userDataPath;
if (isPackaged) {
  try {
    // En Electron asar, necesitamos usar una ruta fuera del paquete
    if (process.env.APPDATA) {
      // Windows
      userDataPath = process.env.APPDATA;
    } else if (process.platform === "darwin") {
      // macOS
      userDataPath = path.join(process.env.HOME, "/Library/Application Support");
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
    console.log("Ruta de base de datos en producción:", dbPath);
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
      dbPath = path.join(require('os').tmpdir(), "inventory-database.sqlite");
      console.log("Usando ruta temporal para base de datos:", dbPath);
    }
  }
} else {
  // En desarrollo, usamos la base de datos en la raíz del proyecto
  dbPath = path.join(__dirname, "../../../database.sqlite");
  console.log("Ruta de base de datos en desarrollo:", dbPath);
}

console.log(`Base de datos usando ruta final: ${dbPath}`);

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: console.log, // Activar logging para depuración
});

export default sequelize;
