import { Sequelize } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";

// Ubicación relativa para guardar la base de datos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Guardamos la base de datos en la carpeta raíz del proyecto
const dbPath = path.join(__dirname, "../../../database.sqlite");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false, // cambiar a false para producción
});

export default sequelize;
