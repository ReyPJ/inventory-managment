import { Sequelize } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";

// Ubicación relativa para guardar la base de datos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determinar la ruta de la base de datos basado en el entorno
let dbPath;

// Manejo simple para entornos de producción y desarrollo
let userDataPath;
if (process.env.NODE_ENV === "production" && process.type) {
  try {
    // En un entorno Electron, esto debería funcionar
    // No necesitamos importar electron directamente
    userDataPath =
      process.env.APPDATA ||
      (process.platform === "darwin"
        ? process.env.HOME + "/Library/Application Support"
        : process.env.HOME + "/.local/share");
    dbPath = path.join(userDataPath, "inventory-db", "database.sqlite");
  } catch (err) {
    console.error("Error al obtener ruta de datos:", err);
    // Fallback a la ruta por defecto
    dbPath = path.join(__dirname, "../../../database.sqlite");
  }
} else {
  // En desarrollo, usamos la base de datos en la raíz del proyecto
  dbPath = path.join(__dirname, "../../../database.sqlite");
}

// Asegurar que el directorio existe
try {
  const dbDir = path.dirname(dbPath);
  // Crear directorios si no existen (en Node.js moderno)
  if (dbDir.includes("inventory-db")) {
    console.log(`Asegurando que el directorio existe: ${dbDir}`);
    // No hacemos nada aquí, Electron se encargará de crear el directorio
  }
} catch (err) {
  console.error("Error al crear directorio:", err);
}

console.log(`Base de datos usando ruta: ${dbPath}`);

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: process.env.NODE_ENV === "development", // solo logging en desarrollo
});

export default sequelize;
