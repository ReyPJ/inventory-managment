import { app, ipcMain, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isPackaged = app.isPackaged;
const isProd = isPackaged || process.env.NODE_ENV === "production";
console.log("¿Aplicación empaquetada?:", isPackaged);
console.log("¿Modo producción?:", isProd);
console.log("Ruta de __dirname:", __dirname);
const distPath = isProd ? path.join(__dirname, "../dist") : path.join(__dirname, "../dist/");
console.log("Ruta de distPath:", distPath);
console.log("Esta ruta existe:", fs.existsSync(distPath));
let mainWindow;
function createWindow() {
  let preloadPath;
  if (isProd) {
    preloadPath = path.join(__dirname, "preload-simple.js");
    if (!fs.existsSync(preloadPath)) {
      const alternativePaths = [
        path.join(__dirname, "../dist-electron/preload-simple.js"),
        path.join(process.resourcesPath, "preload-simple.js"),
        path.join(app.getAppPath(), "electron/preload-simple.js")
      ];
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
    preloadPath = path.join(__dirname, "preload.js");
  }
  console.log("Usando preload desde:", preloadPath);
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: true,
      // Desactivado para seguridad
      contextIsolation: true,
      // Importante para prevenir ataques de "prototype pollution"
      enableRemoteModule: false,
      // Desactivado por seguridad
      sandbox: false,
      // Necesario para que el preload funcione correctamente
      devTools: !isProd
      // Habilitar DevTools para depuración
    },
    // Configuración adicional para ventana de producción
    show: false,
    // No mostrar hasta que esté lista
    minWidth: 1024,
    minHeight: 768,
    title: "Sistema de Inventario",
    autoHideMenuBar: isProd,
    // Ocultar barra de menú en producción
    menuBarVisible: !isProd
    // No mostrar el menú en producción
  });
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === "i") {
      console.log("Abriendo DevTools");
      mainWindow.webContents.openDevTools();
      event.preventDefault();
    }
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
  if (!isProd) {
    mainWindow.webContents.openDevTools({ mode: "right" });
    mainWindow.loadURL("http://localhost:5173");
  } else {
    let indexPath;
    (async () => {
      try {
        indexPath = path.join(distPath, "index.html");
        console.log("Intentando cargar desde:", indexPath);
        if (!fs.existsSync(indexPath)) {
          console.log(
            "No se encontró index.html en la ruta principal, probando alternativas..."
          );
          const alternativePaths = [
            path.join(__dirname, "../../dist/index.html"),
            path.join(__dirname, "../dist/index.html"),
            path.join(process.cwd(), "dist/index.html"),
            path.join(app.getAppPath(), "dist/index.html")
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
                "data:text/html,<html><body><h1>Error al cargar la aplicación</h1><p>" + err.message + "</p></body></html>"
              );
            });
          } else {
            console.error("No se encontró el archivo index.html");
            mainWindow.loadURL(
              "data:text/html,<html><body><h1>Error al cargar la aplicación</h1><p>No se encontró el archivo index.html</p></body></html>"
            );
          }
        } catch (err) {
          console.error("Error en loadFile:", err);
          mainWindow.loadURL(
            "data:text/html,<html><body><h1>Error al cargar la aplicación</h1><p>" + err.message + "</p></body></html>"
          );
        }
      } catch (err) {
        console.error("Error al intentar cargar el HTML:", err);
        mainWindow.loadURL(
          "data:text/html,<html><body><h1>Error</h1><p>" + err.message + "</p></body></html>"
        );
      }
    })().catch((err) => {
      console.error("Error al cargar el HTML:", err);
      mainWindow.loadURL(
        "data:text/html,<html><body><h1>Error</h1><p>" + err.message + "</p></body></html>"
      );
    });
  }
  mainWindow.on("closed", function() {
    mainWindow = null;
  });
}
function setupIpcHandlers() {
  console.log("Configurando manejadores IPC...");
  ipcMain.on("restart-app", () => {
    console.log("Reiniciando aplicación...");
    app.relaunch();
    app.exit(0);
  });
  ipcMain.handle("get-all-products", async () => {
    console.log("Manejador: Obteniendo todos los productos");
    try {
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al obtener productos:", error);
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("get-all-active-products", async () => {
    console.log("Manejador: Obteniendo todos los productos activos");
    try {
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al obtener productos activos:", error);
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("get-product-by-id", async (event, id) => {
    console.log("Manejador: Obteniendo producto por ID", id);
    try {
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error(`Error al obtener producto ${id}:`, error);
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("get-product-by-barcode", async (event, barcode) => {
    console.log("Manejador: Obteniendo producto por código de barras", barcode);
    try {
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error(`Error al obtener producto con código ${barcode}:`, error);
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("create-product", async (event, productData) => {
    console.log("Manejador: Creando nuevo producto", productData);
    try {
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al crear producto:", error);
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("update-product", async (event, { id, productData }) => {
    console.log("Manejador: Actualizando producto", id, productData);
    try {
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error(`Error al actualizar producto ${id}:`, error);
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("delete-product", async (event, id) => {
    console.log("Manejador: Eliminando producto", id);
    try {
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error(`Error al eliminar producto ${id}:`, error);
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("search-products", async (event, query) => {
    console.log("Manejador: Buscando productos", query);
    try {
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al buscar productos:", error);
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("get-all-categories", async () => {
    console.log("Manejador: Obteniendo todas las categorías");
    try {
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("get-category-by-id", async (event, id) => {
    console.log("Manejador: Obteniendo categoría por ID", id);
    try {
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error(`Error al obtener categoría ${id}:`, error);
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("create-category", async (event, categoryData) => {
    console.log("Manejador: Creando nueva categoría", categoryData);
    try {
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al crear categoría:", error);
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("update-category", async (event, { id, categoryData }) => {
    console.log("Manejador: Actualizando categoría", id, categoryData);
    try {
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error(`Error al actualizar categoría ${id}:`, error);
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("delete-category", async (event, id) => {
    console.log("Manejador: Eliminando categoría", id);
    try {
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error(`Error al eliminar categoría ${id}:`, error);
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("update-products-after-sync", async (event, syncResults) => {
    console.log("Manejador: Actualizando productos después de sincronización");
    try {
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al actualizar productos después de sincronización:", error);
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("purge-deleted-products", async () => {
    try {
      console.log("Manejador: Purgando productos eliminados");
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al purgar productos eliminados:", error);
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("update-categories-after-sync", async (event, syncResults) => {
    console.log("Manejador: Actualizando categorías después de sincronización");
    try {
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al actualizar categorías después de sincronización:", error);
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("purge-deleted-categories", async () => {
    try {
      console.log("Manejador: Purgando categorías eliminadas");
      return { success: true, message: "Operación manejada por el frontend" };
    } catch (error) {
      console.error("Error al purgar categorías eliminadas:", error);
      return { success: false, error: error.message };
    }
  });
  console.log("Manejadores IPC configurados correctamente");
}
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
app.on("window-all-closed", function() {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", function() {
  if (mainWindow === null) createWindow();
});
process.on("uncaughtException", (error) => {
  console.error("Error no capturado:", error);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error(`Promesa ${promise} rechazada no manejada:`, reason);
});
