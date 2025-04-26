import { Sequelize } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";

// Ubicación relativa para guardar la base de datos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determinar la ruta de la base de datos basado en el entorno
let dbPath;

// Importar electron solo cuando sea necesario
let app;
try {
  // Durante el build, electron puede no estar disponible
  const electron = await import("electron");
  app = electron.app;
} catch {
  console.log("No se pudo importar electron, usando ruta por defecto");
}

// Verificar si estamos en un entorno empaquetado
if (process.env.NODE_ENV === "production" && app) {
  // En producción (app empaquetada), usamos la carpeta userData para guardar la base de datos
  const userDataPath = app.getPath("userData") || process.cwd();
  dbPath = path.join(userDataPath, "database.sqlite");
} else {
  // En desarrollo, usamos la base de datos en la raíz del proyecto
  dbPath = path.join(__dirname, "../../../database.sqlite");
}

console.log(`Base de datos usando ruta: ${dbPath}`);

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: process.env.NODE_ENV === "development", // solo logging en desarrollo
});

export default sequelize;
