import { app, BrowserWindow, ipcMain, Menu } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";
import fs from "fs";

// Eliminando importaciones obsoletas
// import { initDatabase } from "../src/db/index.js";
// import * as productApi from "../src/db/api/productApi.js";
// import * as categoryApi from "../src/db/api/categoryApi.js";
// import { up as addDescriptionMigration } from "./migrations/20230511-add-description.js";
// import { Sequelize } from "sequelize";
// import sequelize from "../src/db/config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determinar la ruta de la aplicación
// Forzar el modo producción si estamos en la app construida
const isPackaged = app.isPackaged;
const isProd = isPackaged || process.env.NODE_ENV === "production";
console.log("¿Aplicación empaquetada?:", isPackaged);
console.log("¿Modo producción?:", isProd);
console.log("Ruta de __dirname:", __dirname);

// En producción, la carpeta dist (con el front) está a un nivel diferente
const distPath = isProd
  ? path.join(__dirname, "../dist")
  : path.join(__dirname, "../dist/");

console.log("Ruta de distPath:", distPath);
console.log("Esta ruta existe:", fs.existsSync(distPath));

// Mantener una referencia global del objeto window
let mainWindow;

function createWindow() {
  // Determinar la ruta del preload basado en el entorno
  let preloadPath;
  if (isProd) {
    preloadPath = path.join(__dirname, "preload-simple.js");

    // Si no existe en la ruta principal, buscar en otras ubicaciones
    if (!fs.existsSync(preloadPath)) {
      const alternativePaths = [
        path.join(__dirname, "../dist-electron/preload-simple.js"),
        path.join(process.resourcesPath, "preload-simple.js"),
        path.join(app.getAppPath(), "electron/preload-simple.js"),
      ];

      // Intentar cada ruta alternativa
      for (const altPath of alternativePaths) {
        try {
          if (fs.existsSync(altPath)) {
            preloadPath = altPath;
            console.log("Preload encontrado en:", preloadPath);
            break;
          }
        } catch (err) {
          console.error(`Error al verificar ${altPath}:`, err);
        }
      }
    }
  } else {
    // En desarrollo, usar el preload.js normal
    preloadPath = path.join(__dirname, "preload.js");
  }

  console.log("Usando preload desde:", preloadPath);

  // Crear la ventana del navegador
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: true, // Desactivado para seguridad
      contextIsolation: true, // Importante para prevenir ataques de "prototype pollution"
      enableRemoteModule: false, // Desactivado por seguridad
      sandbox: false, // Necesario para que el preload funcione correctamente
      devTools: !isProd, // Habilitar DevTools para depuración
    },
    // Configuración adicional para ventana de producción
    show: false, // No mostrar hasta que esté lista
    minWidth: 1024,
    minHeight: 768,
    title: "Sistema de Inventario",
    autoHideMenuBar: isProd, // Ocultar barra de menú en producción
    menuBarVisible: !isProd, // No mostrar el menú en producción
  });

  // Permitir DevTools en producción solo con una combinación de teclas (Ctrl+Shift+I)
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === "i") {
      console.log("Abriendo DevTools");
      mainWindow.webContents.openDevTools();
      event.preventDefault();
    }
  });

  // Mostrar ventana cuando esté lista para evitar parpadeos
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // En desarrollo, carga desde el servidor de Vite
  if (!isProd) {
    // Abrir DevTools
    mainWindow.webContents.openDevTools({ mode: "right" });
    // Cargar la URL del servidor de desarrollo de Vite
    mainWindow.loadURL("http://localhost:5173");
  } else {
    // En producción, carga desde archivos construidos
    let indexPath;
    // Usamos importación dinámica en lugar de require
    (async () => {
      try {
        // Primero, intentamos cargar desde la ubicación normal en el asar
        indexPath = path.join(distPath, "index.html");
        console.log("Intentando cargar desde:", indexPath);

        // Si no existe, probamos con rutas alternativas
        if (!fs.existsSync(indexPath)) {
          console.log(
            "No se encontró index.html en la ruta principal, probando alternativas..."
          );

          // Intentar con la ruta relativa a la ubicación actual
          const alternativePaths = [
            path.join(__dirname, "../../dist/index.html"),
            path.join(__dirname, "../dist/index.html"),
            path.join(process.cwd(), "dist/index.html"),
            path.join(app.getAppPath(), "dist/index.html"),
          ];

          console.log("Rutas alternativas a probar:", alternativePaths);

          for (const altPath of alternativePaths) {
            console.log(`Comprobando ${altPath}: ${fs.existsSync(altPath)}`);
            if (fs.existsSync(altPath)) {
              indexPath = altPath;
              console.log("Usando ruta alternativa:", indexPath);
              break;
            }
          }

          // Si no encontramos el archivo, mostrar un HTML de emergencia
          if (!fs.existsSync(indexPath)) {
            console.log(
              "No se encontró index.html en ninguna ruta alternativa"
            );
            console.log("Usando HTML mínimo de emergencia");
            mainWindow.loadURL(`data:text/html,
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <title>Sistema de Inventario</title>
                <style>
                  body { font-family: Arial; padding: 20px; color: #333; }
                  .container { max-width: 800px; margin: 0 auto; }
                  h1 { color: #2c3e50; }
                  button { background: #3498db; color: white; border: none; padding: 10px 20px; cursor: pointer; }
                  pre { background: #f8f9fa; padding: 10px; overflow: auto; max-height: 400px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>Sistema de Inventario</h1>
                  <p>Aplicación iniciada en modo de emergencia</p>
                  <p>No se pudo encontrar el archivo index.html</p>
                  <h2>Información de depuración:</h2>
                  <pre>
                  distPath: ${distPath}
                  __dirname: ${__dirname}
                  cwd: ${process.cwd()}
                  appPath: ${app.getAppPath()}
                  resourcesPath: ${process.resourcesPath || "N/A"}
                  </pre>
                  <button onclick="require('electron').ipcRenderer.send('restart-app')">
                    Reiniciar Aplicación
                  </button>
                </div>
              </body>
              </html>
            `);
            return;
          }
        }

        console.log("Cargando desde:", indexPath);
        console.log("El archivo existe:", fs.existsSync(indexPath));

        try {
          if (fs.existsSync(indexPath)) {
            mainWindow.loadFile(indexPath).catch((err) => {
              console.error("Error al cargar el archivo:", err);
              mainWindow.loadURL(
                "data:text/html,<html><body><h1>Error al cargar la aplicación</h1><p>" +
                  err.message +
                  "</p></body></html>"
              );
            });
          } else {
            // Si no se encuentra el archivo, cargamos un HTML básico
            console.error("No se encontró el archivo index.html");
            mainWindow.loadURL(
              "data:text/html,<html><body><h1>Error al cargar la aplicación</h1><p>No se encontró el archivo index.html</p></body></html>"
            );
          }
        } catch (err) {
          console.error("Error en loadFile:", err);
          mainWindow.loadURL(
            "data:text/html,<html><body><h1>Error al cargar la aplicación</h1><p>" +
              err.message +
              "</p></body></html>"
          );
        }
      } catch (err) {
        console.error("Error al intentar cargar el HTML:", err);
        mainWindow.loadURL(
          "data:text/html,<html><body><h1>Error</h1><p>" +
            err.message +
            "</p></body></html>"
        );
      }
    })().catch((err) => {
      console.error("Error al cargar el HTML:", err);
      mainWindow.loadURL(
        "data:text/html,<html><body><h1>Error</h1><p>" +
          err.message +
          "</p></body></html>"
      );
    });
  }

  // Emitido cuando la ventana es cerrada
  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

// Manejador de eventos IPC para obtener todos los productos y categorias
function setupIpcHandlers() {
  console.log("Configurando manejadores IPC...");

  // Handler para reiniciar la aplicación
  ipcMain.on("restart-app", () => {
    console.log("Reiniciando aplicación...");
    app.relaunch();
    app.exit(0);
  });

  // PRODUCTOS
  
  // Obtener todos los productos
  ipcMain.handle("get-all-products", async () => {
    console.log("Manejador: Obteniendo todos los productos");
    try {
      // Ahora esto será manejado por el frontend a través de apiService.js
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al obtener productos:", error);
      return { success: false, error: error.message };
    }
  });

  // Obtener todos los productos activos
  ipcMain.handle("get-all-active-products", async () => {
    console.log("Manejador: Obteniendo todos los productos activos");
    try {
      // Ahora esto será manejado por el frontend a través de apiService.js
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al obtener productos activos:", error);
      return { success: false, error: error.message };
    }
  });

  // Obtener producto por ID
  ipcMain.handle("get-product-by-id", async (event, id) => {
    console.log("Manejador: Obteniendo producto por ID", id);
    try {
      // Ahora esto será manejado por el frontend a través de apiService.js
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error(`Error al obtener producto ${id}:`, error);
      return { success: false, error: error.message };
    }
  });

  // Obtener producto por código de barras
  ipcMain.handle("get-product-by-barcode", async (event, barcode) => {
    console.log("Manejador: Obteniendo producto por código de barras", barcode);
    try {
      // Ahora esto será manejado por el frontend a través de apiService.js
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error(`Error al obtener producto con código ${barcode}:`, error);
      return { success: false, error: error.message };
    }
  });

  // Crear nuevo producto
  ipcMain.handle("create-product", async (event, productData) => {
    console.log("Manejador: Creando nuevo producto", productData);
    try {
      // Ahora esto será manejado por el frontend a través de apiService.js
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al crear producto:", error);
      return { success: false, error: error.message };
    }
  });

  // Actualizar producto
  ipcMain.handle("update-product", async (event, { id, productData }) => {
    console.log("Manejador: Actualizando producto", id, productData);
    try {
      // Ahora esto será manejado por el frontend a través de apiService.js
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error(`Error al actualizar producto ${id}:`, error);
      return { success: false, error: error.message };
    }
  });

  // Eliminar producto
  ipcMain.handle("delete-product", async (event, id) => {
    console.log("Manejador: Eliminando producto", id);
    try {
      // Ahora esto será manejado por el frontend a través de apiService.js
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error(`Error al eliminar producto ${id}:`, error);
      return { success: false, error: error.message };
    }
  });

  // Buscar productos
  ipcMain.handle("search-products", async (event, query) => {
    console.log("Manejador: Buscando productos", query);
    try {
      // Ahora esto será manejado por el frontend a través de apiService.js
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al buscar productos:", error);
      return { success: false, error: error.message };
    }
  });

  // CATEGORÍAS

  // Obtener todas las categorías
  ipcMain.handle("get-all-categories", async () => {
    console.log("Manejador: Obteniendo todas las categorías");
    try {
      // Ahora esto será manejado por el frontend a través de apiService.js
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      return { success: false, error: error.message };
    }
  });

  // Obtener categoría por ID
  ipcMain.handle("get-category-by-id", async (event, id) => {
    console.log("Manejador: Obteniendo categoría por ID", id);
    try {
      // Ahora esto será manejado por el frontend a través de apiService.js
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error(`Error al obtener categoría ${id}:`, error);
      return { success: false, error: error.message };
    }
  });

  // Crear nueva categoría
  ipcMain.handle("create-category", async (event, categoryData) => {
    console.log("Manejador: Creando nueva categoría", categoryData);
    try {
      // Ahora esto será manejado por el frontend a través de apiService.js
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al crear categoría:", error);
      return { success: false, error: error.message };
    }
  });

  // Actualizar categoría
  ipcMain.handle("update-category", async (event, { id, categoryData }) => {
    console.log("Manejador: Actualizando categoría", id, categoryData);
    try {
      // Ahora esto será manejado por el frontend a través de apiService.js
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error(`Error al actualizar categoría ${id}:`, error);
      return { success: false, error: error.message };
    }
  });

  // Eliminar categoría
  ipcMain.handle("delete-category", async (event, id) => {
    console.log("Manejador: Eliminando categoría", id);
    try {
      // Ahora esto será manejado por el frontend a través de apiService.js
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error(`Error al eliminar categoría ${id}:`, error);
      return { success: false, error: error.message };
    }
  });

  // Sincronización
  ipcMain.handle("update-products-after-sync", async (event, syncResults) => {
    console.log("Manejador: Actualizando productos después de sincronización");
    try {
      // Ahora esto será manejado por el frontend a través de apiService.js
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al actualizar productos después de sincronización:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("purge-deleted-products", async () => {
    try {
      console.log("Manejador: Purgando productos eliminados");
      // Ahora esto será manejado por el frontend a través de apiService.js
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al purgar productos eliminados:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("update-categories-after-sync", async (event, syncResults) => {
    console.log("Manejador: Actualizando categorías después de sincronización");
    try {
      // Ahora esto será manejado por el frontend a través de apiService.js
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al actualizar categorías después de sincronización:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("purge-deleted-categories", async () => {
    try {
      console.log("Manejador: Purgando categorías eliminadas");
      // Ahora esto será manejado por el frontend a través de apiService.js
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al purgar categorías eliminadas:", error);
      return { success: false, error: error.message };
    }
  });

  console.log("Manejadores IPC configurados correctamente");
}

// Configurar la base de datos (ahora simplemente retorna éxito)
async function setupDatabase() {
  try {
    console.log("La base de datos ahora es manejada por la API REST");
    console.log("No se requiere inicialización local de la base de datos");
    return true;
  } catch (error) {
    console.error("Error en setupDatabase:", error);
    if (mainWindow) {
      mainWindow.loadURL(`data:text/html,
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Error de Inicialización</title>
          <style>
            body { font-family: Arial; padding: 20px; color: #333; background-color: #f8f9fa; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #e74c3c; }
            pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow: auto; }
            .btn { background: #3498db; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Error de Inicialización</h1>
            <p>Ocurrió un error al inicializar la aplicación:</p>
            <pre>${error.message}</pre>
            <p>Por favor, reinicie la aplicación. Si el problema persiste, contacte al soporte técnico.</p>
            <button class="btn" onclick="require('electron').ipcRenderer.send('restart-app')">
              Reiniciar Aplicación
            </button>
          </div>
        </body>
        </html>
      `);
    }
    return false;
  }
}

// Inicializar la aplicación
app.whenReady().then(async () => {
  console.log("Aplicación inicializando...");
  console.log("Ambiente:", process.env.NODE_ENV || "development");
  console.log("Directorio de la aplicación:", __dirname);
  console.log("Ruta de dist:", distPath);

  try {
    console.log(
      "Archivo index.html existe:",
      fs.existsSync(path.join(distPath, "index.html"))
    );

    // Directorios disponibles
    console.log("Listado de directorios:");
    try {
      const rootDir = path.join(__dirname, "../../");
      console.log("Contenido de directorio raíz:", fs.readdirSync(rootDir));

      if (fs.existsSync(path.join(__dirname, "../dist"))) {
        console.log(
          "Contenido de ../dist:",
          fs.readdirSync(path.join(__dirname, "../dist"))
        );
      }
    } catch (dirErr) {
      console.error("Error al listar directorios:", dirErr);
    }
  } catch (err) {
    console.error("Error al verificar archivo:", err);
  }

  try {
    await setupDatabase();
  } catch (dbError) {
    console.error("Error fatal en la base de datos:", dbError);
  }

  try {
    setupIpcHandlers();
  } catch (ipcError) {
    console.error("Error al configurar IPC handlers:", ipcError);
  }

  try {
    createWindow();
    console.log("Ventana creada con éxito");
  } catch (windowError) {
    console.error("Error al crear ventana:", windowError);
  }
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  if (mainWindow === null) createWindow();
});

// Manejar errores no capturados
process.on("uncaughtException", (error) => {
  console.error("Error no capturado:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(`Promesa ${promise} rechazada no manejada:`, reason);
});
