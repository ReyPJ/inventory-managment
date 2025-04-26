import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";
import { initDatabase } from "../src/db/index.js";

import * as productApi from "../src/db/api/productApi.js";
import * as categoryApi from "../src/db/api/categoryApi.js";

// Importar el script de migración
import { up as addDescriptionMigration } from "./migrations/20230511-add-description.js";
import { Sequelize } from "sequelize";
import sequelize from "../src/db/config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mantener una referencia global del objeto window
let mainWindow;

function createWindow() {
  // Crear la ventana del navegador
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    // Configuración adicional para ventana de producción
    show: false, // No mostrar hasta que esté lista
    minWidth: 1024,
    minHeight: 768,
    title: "Sistema de Inventario",
  });

  // Mostrar ventana cuando esté lista para evitar parpadeos
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // En desarrollo, carga desde el servidor de Vite
  if (process.env.NODE_ENV === "development") {
    // Abrir DevTools
    mainWindow.webContents.openDevTools({ mode: "right" });
    // Cargar la URL del servidor de desarrollo de Vite
    mainWindow.loadURL("http://localhost:5173");
  } else {
    // En producción, carga desde archivos construidos
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Emitido cuando la ventana es cerrada
  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

// Manejador de eventos IPC para obtener todos los productos y categorias
function setupIpcHandlers() {
  // Productos
  ipcMain.handle("get-all-products", async () => {
    return await productApi.getAllProducts();
  });

  ipcMain.handle("get-product-by-id", async (_, id) => {
    return await productApi.getProductById(id);
  });

  ipcMain.handle("get-product-by-barcode", async (_, barcode) => {
    return await productApi.getProductByBarcode(barcode);
  });

  ipcMain.handle("create-product", async (_, productData) => {
    return await productApi.createProduct(productData);
  });

  ipcMain.handle("update-product", async (_, { id, productData }) => {
    return await productApi.updateProduct(id, productData);
  });

  ipcMain.handle("delete-product", async (_, id) => {
    return await productApi.deleteProduct(id);
  });

  ipcMain.handle("search-products", async (_, query) => {
    return await productApi.searchProducts(query);
  });

  // Categorias
  ipcMain.handle("get-all-categories", async () => {
    return await categoryApi.getAllCategories();
  });

  ipcMain.handle("get-category-by-id", async (_, id) => {
    return await categoryApi.getCategoryById(id);
  });

  ipcMain.handle("create-category", async (_, categoryData) => {
    return await categoryApi.createCategory(categoryData);
  });

  ipcMain.handle("update-category", async (_, { id, categoryData }) => {
    return await categoryApi.updateCategory(id, categoryData);
  });

  ipcMain.handle("delete-category", async (_, id) => {
    return await categoryApi.deleteCategory(id);
  });
}

// Preparar la base de datos para producción
async function setupDatabase() {
  try {
    // Crear una instancia para que el script de migración pueda usar queryInterface
    const queryInterface = sequelize.getQueryInterface();

    // Ejecutar la migración para añadir la columna description
    await addDescriptionMigration(queryInterface);
    console.log("✅ Migraciones completadas correctamente");

    await initDatabase();
    console.log("✅ Base de datos inicializada correctamente");
  } catch (error) {
    console.error("❌ Error al configurar la base de datos:", error);
  }
}

// Inicializar la aplicación
app.whenReady().then(async () => {
  await setupDatabase();
  setupIpcHandlers();
  createWindow();
});

// Manejar cierre de ventanas
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// Recrear ventana en macOS cuando se hace clic en el dock
app.on("activate", function () {
  if (mainWindow === null) createWindow();
});

// Manejar errores no capturados
process.on("uncaughtException", (error) => {
  console.error("Error no capturado:", error);
});
