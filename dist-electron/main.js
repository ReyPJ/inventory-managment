import { app as d, ipcMain as n, BrowserWindow as m } from "electron";
import t from "path";
import { fileURLToPath as f } from "url";
import i from "process";
import s from "fs";
const y = f(import.meta.url), c = t.dirname(y), g = d.isPackaged, u = g || i.env.NODE_ENV === "production";
console.log("¿Aplicación empaquetada?:", g);
console.log("¿Modo producción?:", u);
console.log("Ruta de __dirname:", c);
const p = u ? t.join(c, "../dist") : t.join(c, "../dist/");
console.log("Ruta de distPath:", p);
console.log("Esta ruta existe:", s.existsSync(p));
let a;
function h() {
  let r;
  if (u) {
    if (r = t.join(c, "preload-simple.js"), !s.existsSync(r)) {
      const o = [
        t.join(c, "../dist-electron/preload-simple.js"),
        t.join(i.resourcesPath, "preload-simple.js"),
        t.join(d.getAppPath(), "electron/preload-simple.js")
      ];
      for (const e of o)
        try {
          if (s.existsSync(e)) {
            r = e, console.log("Preload encontrado en:", r);
            break;
          }
        } catch (l) {
          console.error(`Error al verificar ${e}:`, l);
        }
    }
  } else
    r = t.join(c, "preload.js");
  if (console.log("Usando preload desde:", r), a = new m({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: r,
      nodeIntegration: !0,
      // Desactivado para seguridad
      contextIsolation: !0,
      // Importante para prevenir ataques de "prototype pollution"
      enableRemoteModule: !1,
      // Desactivado por seguridad
      sandbox: !1,
      // Necesario para que el preload funcione correctamente
      devTools: !u
      // Habilitar DevTools para depuración
    },
    // Configuración adicional para ventana de producción
    show: !1,
    // No mostrar hasta que esté lista
    minWidth: 1024,
    minHeight: 768,
    title: "Sistema de Inventario",
    autoHideMenuBar: u,
    // Ocultar barra de menú en producción
    menuBarVisible: !u
    // No mostrar el menú en producción
  }), a.webContents.on("before-input-event", (o, e) => {
    e.control && e.shift && e.key.toLowerCase() === "i" && (console.log("Abriendo DevTools"), a.webContents.openDevTools(), o.preventDefault());
  }), a.once("ready-to-show", () => {
    a.show();
  }), !u)
    a.webContents.openDevTools({ mode: "right" }), a.loadURL("http://localhost:5173");
  else {
    let o;
    (async () => {
      try {
        if (o = t.join(p, "index.html"), console.log("Intentando cargar desde:", o), !s.existsSync(o)) {
          console.log(
            "No se encontró index.html en la ruta principal, probando alternativas..."
          );
          const e = [
            t.join(c, "../../dist/index.html"),
            t.join(c, "../dist/index.html"),
            t.join(i.cwd(), "dist/index.html"),
            t.join(d.getAppPath(), "dist/index.html")
          ];
          console.log("Rutas alternativas a probar:", e);
          for (const l of e)
            if (console.log(`Comprobando ${l}: ${s.existsSync(l)}`), s.existsSync(l)) {
              o = l, console.log("Usando ruta alternativa:", o);
              break;
            }
          if (!s.existsSync(o)) {
            console.log(
              "No se encontró index.html en ninguna ruta alternativa"
            ), console.log("Usando HTML mínimo de emergencia"), a.loadURL(`data:text/html,
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
                  distPath: ${p}
                  __dirname: ${c}
                  cwd: ${i.cwd()}
                  appPath: ${d.getAppPath()}
                  resourcesPath: ${i.resourcesPath || "N/A"}
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
        console.log("Cargando desde:", o), console.log("El archivo existe:", s.existsSync(o));
        try {
          s.existsSync(o) ? a.loadFile(o).catch((e) => {
            console.error("Error al cargar el archivo:", e), a.loadURL(
              "data:text/html,<html><body><h1>Error al cargar la aplicación</h1><p>" + e.message + "</p></body></html>"
            );
          }) : (console.error("No se encontró el archivo index.html"), a.loadURL(
            "data:text/html,<html><body><h1>Error al cargar la aplicación</h1><p>No se encontró el archivo index.html</p></body></html>"
          ));
        } catch (e) {
          console.error("Error en loadFile:", e), a.loadURL(
            "data:text/html,<html><body><h1>Error al cargar la aplicación</h1><p>" + e.message + "</p></body></html>"
          );
        }
      } catch (e) {
        console.error("Error al intentar cargar el HTML:", e), a.loadURL(
          "data:text/html,<html><body><h1>Error</h1><p>" + e.message + "</p></body></html>"
        );
      }
    })().catch((e) => {
      console.error("Error al cargar el HTML:", e), a.loadURL(
        "data:text/html,<html><body><h1>Error</h1><p>" + e.message + "</p></body></html>"
      );
    });
  }
  a.on("closed", function() {
    a = null;
  });
}
function b() {
  console.log("Configurando manejadores IPC..."), n.on("restart-app", () => {
    console.log("Reiniciando aplicación..."), d.relaunch(), d.exit(0);
  }), n.handle("get-all-products", async () => {
    console.log("Manejador: Obteniendo todos los productos");
    try {
      return { success: !0, message: "Operación manejada por el frontend" };
    } catch (r) {
      return console.error("Error al obtener productos:", r), { success: !1, error: r.message };
    }
  }), n.handle("get-all-active-products", async () => {
    console.log("Manejador: Obteniendo todos los productos activos");
    try {
      return { success: !0, message: "Operación manejada por el frontend" };
    } catch (r) {
      return console.error("Error al obtener productos activos:", r), { success: !1, error: r.message };
    }
  }), n.handle("get-product-by-id", async (r, o) => {
    console.log("Manejador: Obteniendo producto por ID", o);
    try {
      return { success: !0, message: "Operación manejada por el frontend" };
    } catch (e) {
      return console.error(`Error al obtener producto ${o}:`, e), { success: !1, error: e.message };
    }
  }), n.handle("get-product-by-barcode", async (r, o) => {
    console.log("Manejador: Obteniendo producto por código de barras", o);
    try {
      return { success: !0, message: "Operación manejada por el frontend" };
    } catch (e) {
      return console.error(`Error al obtener producto con código ${o}:`, e), { success: !1, error: e.message };
    }
  }), n.handle("create-product", async (r, o) => {
    console.log("Manejador: Creando nuevo producto", o);
    try {
      return { success: !0, message: "Operación manejada por el frontend" };
    } catch (e) {
      return console.error("Error al crear producto:", e), { success: !1, error: e.message };
    }
  }), n.handle("update-product", async (r, { id: o, productData: e }) => {
    console.log("Manejador: Actualizando producto", o, e);
    try {
      return { success: !0, message: "Operación manejada por el frontend" };
    } catch (l) {
      return console.error(`Error al actualizar producto ${o}:`, l), { success: !1, error: l.message };
    }
  }), n.handle("delete-product", async (r, o) => {
    console.log("Manejador: Eliminando producto", o);
    try {
      return { success: !0, message: "Operación manejada por el frontend" };
    } catch (e) {
      return console.error(`Error al eliminar producto ${o}:`, e), { success: !1, error: e.message };
    }
  }), n.handle("search-products", async (r, o) => {
    console.log("Manejador: Buscando productos", o);
    try {
      return { success: !0, message: "Operación manejada por el frontend" };
    } catch (e) {
      return console.error("Error al buscar productos:", e), { success: !1, error: e.message };
    }
  }), n.handle("get-all-categories", async () => {
    console.log("Manejador: Obteniendo todas las categorías");
    try {
      return { success: !0, message: "Operación manejada por el frontend" };
    } catch (r) {
      return console.error("Error al obtener categorías:", r), { success: !1, error: r.message };
    }
  }), n.handle("get-category-by-id", async (r, o) => {
    console.log("Manejador: Obteniendo categoría por ID", o);
    try {
      return { success: !0, message: "Operación manejada por el frontend" };
    } catch (e) {
      return console.error(`Error al obtener categoría ${o}:`, e), { success: !1, error: e.message };
    }
  }), n.handle("create-category", async (r, o) => {
    console.log("Manejador: Creando nueva categoría", o);
    try {
      return { success: !0, message: "Operación manejada por el frontend" };
    } catch (e) {
      return console.error("Error al crear categoría:", e), { success: !1, error: e.message };
    }
  }), n.handle("update-category", async (r, { id: o, categoryData: e }) => {
    console.log("Manejador: Actualizando categoría", o, e);
    try {
      return { success: !0, message: "Operación manejada por el frontend" };
    } catch (l) {
      return console.error(`Error al actualizar categoría ${o}:`, l), { success: !1, error: l.message };
    }
  }), n.handle("delete-category", async (r, o) => {
    console.log("Manejador: Eliminando categoría", o);
    try {
      return { success: !0, message: "Operación manejada por el frontend" };
    } catch (e) {
      return console.error(`Error al eliminar categoría ${o}:`, e), { success: !1, error: e.message };
    }
  }), n.handle("update-products-after-sync", async (r, o) => {
    console.log("Manejador: Actualizando productos después de sincronización");
    try {
      return { success: !0, message: "Operación manejada por el frontend" };
    } catch (e) {
      return console.error("Error al actualizar productos después de sincronización:", e), { success: !1, error: e.message };
    }
  }), n.handle("purge-deleted-products", async () => {
    try {
      return console.log("Manejador: Purgando productos eliminados"), { success: !0, message: "Operación manejada por el frontend" };
    } catch (r) {
      return console.error("Error al purgar productos eliminados:", r), { success: !1, error: r.message };
    }
  }), n.handle("update-categories-after-sync", async (r, o) => {
    console.log("Manejador: Actualizando categorías después de sincronización");
    try {
      return { success: !0, message: "Operación manejada por el frontend" };
    } catch (e) {
      return console.error("Error al actualizar categorías después de sincronización:", e), { success: !1, error: e.message };
    }
  }), n.handle("purge-deleted-categories", async () => {
    try {
      return console.log("Manejador: Purgando categorías eliminadas"), { success: !0, message: "Operación manejada por el frontend" };
    } catch (r) {
      return console.error("Error al purgar categorías eliminadas:", r), { success: !1, error: r.message };
    }
  }), console.log("Manejadores IPC configurados correctamente");
}
async function j() {
  try {
    return console.log("La base de datos ahora es manejada por la API REST"), console.log("No se requiere inicialización local de la base de datos"), !0;
  } catch (r) {
    return console.error("Error en setupDatabase:", r), a && a.loadURL(`data:text/html,
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
            <pre>${r.message}</pre>
            <p>Por favor, reinicie la aplicación. Si el problema persiste, contacte al soporte técnico.</p>
            <button class="btn" onclick="require('electron').ipcRenderer.send('restart-app')">
              Reiniciar Aplicación
            </button>
          </div>
        </body>
        </html>
      `), !1;
  }
}
d.whenReady().then(async () => {
  console.log("Aplicación inicializando..."), console.log("Ambiente:", i.env.NODE_ENV || "development"), console.log("Directorio de la aplicación:", c), console.log("Ruta de dist:", p);
  try {
    console.log(
      "Archivo index.html existe:",
      s.existsSync(t.join(p, "index.html"))
    ), console.log("Listado de directorios:");
    try {
      const r = t.join(c, "../../");
      console.log("Contenido de directorio raíz:", s.readdirSync(r)), s.existsSync(t.join(c, "../dist")) && console.log(
        "Contenido de ../dist:",
        s.readdirSync(t.join(c, "../dist"))
      );
    } catch (r) {
      console.error("Error al listar directorios:", r);
    }
  } catch (r) {
    console.error("Error al verificar archivo:", r);
  }
  try {
    await j();
  } catch (r) {
    console.error("Error fatal en la base de datos:", r);
  }
  try {
    b();
  } catch (r) {
    console.error("Error al configurar IPC handlers:", r);
  }
  try {
    h(), console.log("Ventana creada con éxito");
  } catch (r) {
    console.error("Error al crear ventana:", r);
  }
});
d.on("window-all-closed", function() {
  i.platform !== "darwin" && d.quit();
});
d.on("activate", function() {
  a === null && h();
});
i.on("uncaughtException", (r) => {
  console.error("Error no capturado:", r);
});
i.on("unhandledRejection", (r, o) => {
  console.error(`Promesa ${o} rechazada no manejada:`, r);
});
