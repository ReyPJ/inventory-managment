import { Sequelize } from "sequelize";
import path from "path";
import fs from "fs";
import process from "process";
// Importar better-sqlite3 usando import estático
import betterSqlite3 from "better-sqlite3";
// Importar os para manejo del directorio temporal
import os from "os";

// Determinar si la aplicación está empaquetada
const isPackaged =
  process.env.NODE_ENV === "production" ||
  (typeof process.versions === "object" &&
    typeof process.versions.electron === "string");

console.log("¿Modo empaquetado?:", isPackaged);

// Determinar la ruta de la base de datos
let dbPath;

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
      dbPath = path.join(os.tmpdir(), "inventory-database.sqlite");
      console.log("Usando ruta temporal para base de datos:", dbPath);
    }
  }
} else {
  // En desarrollo, usar una ruta relativa al directorio del proyecto
  dbPath = path.join(process.cwd(), "database.sqlite");
  console.log("Ruta de base de datos en desarrollo:", dbPath);
}

// Crear la instancia de Sequelize con mejor manejo de errores
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false, // Cambiar a console.log para ver consultas SQL durante depuración
  dialectOptions: {
    // Usar better-sqlite3 que es más confiable en Electron
    dialectModule: betterSqlite3,
  },
});

// Manejar errores de conexión
sequelize
  .authenticate()
  .then(() => {
    console.log("Conexión a la base de datos establecida correctamente.");
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos:", err);
  });

export default sequelize;
