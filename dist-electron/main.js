import { app as g, ipcMain as l, BrowserWindow as C } from "electron";
import a from "path";
import { fileURLToPath as j } from "url";
import t from "process";
import { Sequelize as v, DataTypes as p, Op as x } from "sequelize";
import c from "fs";
const D = j(import.meta.url), I = a.dirname(D);
let u;
const N = t.env.NODE_ENV === "production" || t.type === "browser";
console.log("¿Es aplicación empaquetada?:", N);
console.log("Tipo de proceso:", t.type);
console.log("NODE_ENV:", t.env.NODE_ENV);
let E;
if (N)
  try {
    t.env.APPDATA ? E = t.env.APPDATA : t.platform === "darwin" ? E = a.join(t.env.HOME, "/Library/Application Support") : E = a.join(t.env.HOME, "/.local/share");
    const o = a.join(E, "sistema-inventario");
    if (!c.existsSync(o))
      try {
        c.mkdirSync(o, { recursive: !0 }), console.log("Directorio creado:", o);
      } catch (r) {
        console.error("Error al crear directorio de datos:", r);
      }
    u = a.join(o, "inventory-database.sqlite"), console.log("Ruta de base de datos en producción:", u);
  } catch (o) {
    console.error("Error al obtener ruta de datos:", o);
    try {
      t.resourcesPath ? u = a.join(t.resourcesPath, "database.sqlite") : u = a.join(a.dirname(t.execPath), "database.sqlite"), console.log("Usando ruta fallback para base de datos:", u);
    } catch (r) {
      console.error("Error en fallback de ruta:", r), u = a.join(require("os").tmpdir(), "inventory-database.sqlite"), console.log("Usando ruta temporal para base de datos:", u);
    }
  }
else
  u = a.join(I, "../../../database.sqlite"), console.log("Ruta de base de datos en desarrollo:", u);
console.log(`Base de datos usando ruta final: ${u}`);
const w = new v({
  dialect: "sqlite",
  storage: u,
  logging: console.log
  // Activar logging para depuración
}), h = w.define("Product", {
  id: {
    type: p.INTEGER,
    primaryKey: !0,
    autoIncrement: !0
  },
  barcode: {
    type: p.STRING,
    allowNull: !1,
    unique: !0
  },
  name: {
    type: p.STRING,
    allowNull: !1
  },
  description: {
    type: p.TEXT,
    allowNull: !0
  },
  price: {
    type: p.DECIMAL(10, 2),
    allowNull: !1,
    defaultValue: 0
  },
  stock: {
    type: p.INTEGER,
    allowNull: !1,
    defaultValue: 0
  },
  synced: {
    type: p.BOOLEAN,
    defaultValue: !1
  }
}), d = w.define("Category", {
  id: {
    type: p.INTEGER,
    primaryKey: !0,
    autoIncrement: !0
  },
  name: {
    type: p.STRING,
    allowNull: !1,
    unique: !0
  },
  description: {
    type: p.TEXT,
    allowNull: !0
  }
});
d.hasMany(h);
h.belongsTo(d);
async function O() {
  try {
    await w.sync();
    const o = ["PS4", "PS5"];
    for (const r of o)
      await d.findOrCreate({
        where: { name: r }
      });
    return console.log("Base de datos inicializada correctamente"), !0;
  } catch (o) {
    return console.error("Error al inicializar la base de datos:", o), !1;
  }
}
function f(o) {
  return o ? Array.isArray(o) ? o.map((r) => r.toJSON ? r.toJSON() : r) : o.toJSON ? o.toJSON() : o : null;
}
async function T() {
  try {
    const o = await h.findAll({
      include: [d],
      order: [["updatedAt", "DESC"]]
    });
    return f(o);
  } catch (o) {
    return console.error("Error al obtener productos:", o), [];
  }
}
async function R(o) {
  try {
    const r = await h.findByPk(o, {
      include: [d]
    });
    return f(r);
  } catch (r) {
    return console.error("Error al obtener el producto:", r), null;
  }
}
async function k(o) {
  try {
    const r = await h.findOne({
      where: { barcode: o },
      include: [d]
    });
    return f(r);
  } catch (r) {
    return console.error("Error al obtener el producto por codigo de barras:", r), null;
  }
}
async function _(o) {
  try {
    const r = await h.create(o);
    return f(r);
  } catch (r) {
    throw console.error("Error al crear el producto:", r), r;
  }
}
async function M(o, r) {
  try {
    const e = await h.findByPk(o);
    return e ? (await e.update(r), f(e)) : null;
  } catch (e) {
    throw console.error("Error al actualizar el producto:", e), e;
  }
}
async function B(o) {
  try {
    const r = await h.findByPk(o);
    return r ? (await r.destroy(), !0) : !1;
  } catch (r) {
    return console.error("Error al eliminar el producto:", r), !1;
  }
}
async function z(o) {
  try {
    const r = await h.findAll({
      where: {
        [x.or]: [
          { name: { [x.like]: `%${o}%` } },
          { barcode: { [x.like]: `%${o}%` } }
        ]
      },
      include: [d]
    });
    return f(r);
  } catch (r) {
    return console.error("Error al buscar productos:", r), [];
  }
}
function P(o) {
  return o ? Array.isArray(o) ? o.map((r) => r.toJSON ? r.toJSON() : r) : o.toJSON ? o.toJSON() : o : null;
}
async function L() {
  try {
    const o = await d.findAll();
    return P(o) || [];
  } catch (o) {
    return console.error("Error al obtener las categorias: ", o), [];
  }
}
async function U(o) {
  try {
    const r = await d.findByPk(o);
    return P(r);
  } catch (r) {
    return console.error("Error al obtener la categoria:", r), null;
  }
}
async function $(o) {
  try {
    const r = await d.create(o);
    return P(r);
  } catch (r) {
    throw console.error("Error al crear la categoria:", r), r;
  }
}
async function q(o, r) {
  try {
    const e = await d.findByPk(o);
    return e ? (await e.update(r), P(e)) : null;
  } catch (e) {
    throw console.error("Error al crear la categoria: ", e), e;
  }
}
async function J(o) {
  try {
    const r = await d.findByPk(o);
    return r ? (await r.destroy(), !0) : null;
  } catch (r) {
    return console.error("Error al eliminar la categoria:", r), !1;
  }
}
async function V(o) {
  try {
    return (await o.describeTable("Products")).description ? console.log('ℹ️ La columna "description" ya existe en la tabla Products') : (await o.addColumn("Products", "description", {
      type: v.TEXT,
      allowNull: !0
    }), console.log(
      '✅ Columna "description" añadida correctamente a la tabla Products'
    )), Promise.resolve();
  } catch (r) {
    return console.error("❌ Error al migrar:", r), Promise.reject(r);
  }
}
const H = j(import.meta.url), i = a.dirname(H), S = g.isPackaged, y = S || t.env.NODE_ENV === "production";
console.log("¿Aplicación empaquetada?:", S);
console.log("¿Modo producción?:", y);
console.log("Ruta de __dirname:", i);
const m = y ? a.join(i, "../dist") : a.join(i, "../dist/");
console.log("Ruta de distPath:", m);
console.log("Esta ruta existe:", c.existsSync(m));
let n;
function A() {
  let o;
  if (y) {
    if (o = a.join(i, "preload-simple.js"), !c.existsSync(o)) {
      const r = [
        a.join(i, "../dist-electron/preload-simple.js"),
        a.join(t.resourcesPath, "preload-simple.js"),
        a.join(g.getAppPath(), "electron/preload-simple.js")
      ];
      for (const e of r)
        try {
          if (c.existsSync(e)) {
            o = e, console.log("Preload encontrado en:", o);
            break;
          }
        } catch (s) {
          console.error(`Error al verificar ${e}:`, s);
        }
    }
  } else
    o = a.join(i, "preload.js");
  if (console.log("Usando preload desde:", o), n = new C({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: o,
      nodeIntegration: !0,
      // Desactivado para seguridad
      contextIsolation: !0,
      // Importante para prevenir ataques de "prototype pollution"
      enableRemoteModule: !1,
      // Desactivado por seguridad
      sandbox: !1,
      // Necesario para que el preload funcione correctamente
      devTools: !y
      // Habilitar DevTools para depuración
    },
    // Configuración adicional para ventana de producción
    show: !1,
    // No mostrar hasta que esté lista
    minWidth: 1024,
    minHeight: 768,
    title: "Sistema de Inventario",
    autoHideMenuBar: y,
    // Ocultar barra de menú en producción
    menuBarVisible: !y
    // No mostrar el menú en producción
  }), n.webContents.on("before-input-event", (r, e) => {
    e.control && e.shift && e.key.toLowerCase() === "i" && (console.log("Abriendo DevTools"), n.webContents.openDevTools(), r.preventDefault());
  }), n.once("ready-to-show", () => {
    n.show();
  }), !y)
    n.webContents.openDevTools({ mode: "right" }), n.loadURL("http://localhost:5173");
  else {
    let r;
    (async () => {
      try {
        if (r = a.join(m, "index.html"), console.log("Intentando cargar desde:", r), !c.existsSync(r)) {
          console.log("No se encontró index.html en la ruta principal, probando alternativas...");
          const e = [
            a.join(i, "../../dist/index.html"),
            a.join(i, "../dist/index.html"),
            a.join(t.cwd(), "dist/index.html"),
            a.join(g.getAppPath(), "dist/index.html")
          ];
          console.log("Rutas alternativas a probar:", e);
          for (const s of e)
            if (console.log(`Comprobando ${s}: ${c.existsSync(s)}`), c.existsSync(s)) {
              r = s, console.log("Usando ruta alternativa:", r);
              break;
            }
          if (!c.existsSync(r)) {
            console.log("No se encontró index.html en ninguna ruta alternativa"), console.log("Usando HTML mínimo de emergencia"), n.loadURL(`data:text/html,
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
                  distPath: ${m}
                  __dirname: ${i}
                  cwd: ${t.cwd()}
                  appPath: ${g.getAppPath()}
                  resourcesPath: ${t.resourcesPath || "N/A"}
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
        console.log("Cargando desde:", r), console.log("El archivo existe:", c.existsSync(r));
        try {
          c.existsSync(r) ? n.loadFile(r).catch((e) => {
            console.error("Error al cargar el archivo:", e), n.loadURL("data:text/html,<html><body><h1>Error al cargar la aplicación</h1><p>" + e.message + "</p></body></html>");
          }) : (console.error("No se encontró el archivo index.html"), n.loadURL("data:text/html,<html><body><h1>Error al cargar la aplicación</h1><p>No se encontró el archivo index.html</p></body></html>"));
        } catch (e) {
          console.error("Error en loadFile:", e), n.loadURL("data:text/html,<html><body><h1>Error al cargar la aplicación</h1><p>" + e.message + "</p></body></html>");
        }
      } catch (e) {
        console.error("Error al intentar cargar el HTML:", e), n.loadURL("data:text/html,<html><body><h1>Error</h1><p>" + e.message + "</p></body></html>");
      }
    })().catch((e) => {
      console.error("Error al cargar el HTML:", e), n.loadURL("data:text/html,<html><body><h1>Error</h1><p>" + e.message + "</p></body></html>");
    });
  }
  n.on("closed", function() {
    n = null;
  });
}
function G() {
  console.log("Configurando manejadores IPC..."), l.on("restart-app", () => {
    console.log("Reiniciando aplicación..."), g.relaunch(), g.exit(0);
  }), l.handle("get-all-products", async () => {
    try {
      console.log("Manejador: Obteniendo todos los productos");
      const o = await T();
      return console.log("Productos obtenidos:", o.length), o;
    } catch (o) {
      return console.error("Error al obtener productos:", o), [];
    }
  }), l.handle("get-product-by-id", async (o, r) => {
    try {
      console.log("Manejador: Obteniendo producto por ID:", r);
      const e = await R(r);
      return console.log("Producto por ID:", e), e;
    } catch (e) {
      return console.error("Error al obtener producto por ID:", e), null;
    }
  }), l.handle("get-product-by-barcode", async (o, r) => {
    try {
      console.log("Manejador: Obteniendo producto por código de barras:", r);
      const e = await k(r);
      return console.log("Producto por código de barras:", e), e;
    } catch (e) {
      return console.error("Error al obtener producto por código:", e), null;
    }
  }), l.handle("create-product", async (o, r) => {
    try {
      console.log("Manejador: Creando producto:", r);
      const e = await _(r);
      return console.log("Producto creado:", e), e;
    } catch (e) {
      return console.error("Error al crear producto:", e), null;
    }
  }), l.handle("update-product", async (o, r) => {
    try {
      if (console.log("Manejador: Update product payload recibido:", r), !r || !r.id)
        return console.error("Estructura de payload inválida:", r), null;
      const { id: e, productData: s } = r;
      console.log("Actualizando producto:", e, s);
      const b = await M(e, s);
      return console.log("Producto actualizado:", b), b;
    } catch (e) {
      return console.error("Error al actualizar producto:", e), null;
    }
  }), l.handle("delete-product", async (o, r) => {
    try {
      console.log("Manejador: Eliminando producto:", r);
      const e = await B(r);
      return console.log("Producto eliminado:", e), e;
    } catch (e) {
      return console.error("Error al eliminar producto:", e), !1;
    }
  }), l.handle("search-products", async (o, r) => {
    try {
      console.log("Manejador: Buscando productos:", r);
      const e = await z(r);
      return console.log("Productos encontrados:", e.length), e;
    } catch (e) {
      return console.error("Error al buscar productos:", e), [];
    }
  }), l.handle("get-all-categories", async () => {
    try {
      console.log("Manejador: Obteniendo todas las categorías");
      const o = await L();
      return console.log("Categorías obtenidas:", o.length), o;
    } catch (o) {
      return console.error("Error al obtener categorías:", o), [];
    }
  }), l.handle("get-category-by-id", async (o, r) => {
    try {
      console.log("Manejador: Obteniendo categoría por ID:", r);
      const e = await U(r);
      return console.log("Categoría por ID:", e), e;
    } catch (e) {
      return console.error("Error al obtener categoría por ID:", e), null;
    }
  }), l.handle("create-category", async (o, r) => {
    try {
      console.log("Manejador: Creando categoría:", r);
      const e = await $(r);
      return console.log("Categoría creada:", e), e;
    } catch (e) {
      return console.error("Error al crear categoría:", e), null;
    }
  }), l.handle("update-category", async (o, r) => {
    try {
      if (console.log("Manejador: Update category payload recibido:", r), !r || !r.id)
        return console.error("Estructura de payload inválida para categoría:", r), null;
      const { id: e, categoryData: s } = r;
      console.log("Actualizando categoría:", e, s);
      const b = await q(e, s);
      return console.log("Categoría actualizada:", b), b;
    } catch (e) {
      return console.error("Error al actualizar categoría:", e), null;
    }
  }), l.handle("delete-category", async (o, r) => {
    try {
      console.log("Manejador: Eliminando categoría:", r);
      const e = await J(r);
      return console.log("Categoría eliminada:", e), e;
    } catch (e) {
      return console.error("Error al eliminar categoría:", e), !1;
    }
  }), console.log("Manejadores IPC configurados correctamente");
}
async function F() {
  try {
    console.log("Inicializando base de datos..."), await O(), console.log("Base de datos inicializada correctamente");
    try {
      await V(w.getQueryInterface(), v), console.log("Migraciones aplicadas correctamente");
    } catch (o) {
      console.error("Error al aplicar migraciones (no crítico):", o);
    }
    return !0;
  } catch (o) {
    return console.error("Error crítico al inicializar la base de datos:", o), n && n.loadURL(`data:text/html,
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Error de Base de Datos</title>
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
            <h1>Error en la Base de Datos</h1>
            <p>Ocurrió un error al inicializar la base de datos:</p>
            <pre>${o.message}</pre>
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
g.whenReady().then(async () => {
  console.log("Aplicación inicializando..."), console.log("Ambiente:", t.env.NODE_ENV || "development"), console.log("Directorio de la aplicación:", i), console.log("Ruta de dist:", m);
  try {
    console.log("Archivo index.html existe:", c.existsSync(a.join(m, "index.html"))), console.log("Listado de directorios:");
    try {
      const o = a.join(i, "../../");
      console.log("Contenido de directorio raíz:", c.readdirSync(o)), c.existsSync(a.join(i, "../dist")) && console.log("Contenido de ../dist:", c.readdirSync(a.join(i, "../dist")));
    } catch (o) {
      console.error("Error al listar directorios:", o);
    }
  } catch (o) {
    console.error("Error al verificar archivo:", o);
  }
  try {
    await F();
  } catch (o) {
    console.error("Error fatal en la base de datos:", o);
  }
  try {
    G();
  } catch (o) {
    console.error("Error al configurar IPC handlers:", o);
  }
  try {
    A(), console.log("Ventana creada con éxito");
  } catch (o) {
    console.error("Error al crear ventana:", o);
  }
});
g.on("window-all-closed", function() {
  t.platform !== "darwin" && g.quit();
});
g.on("activate", function() {
  n === null && A();
});
t.on("uncaughtException", (o) => {
  console.error("Error no capturado:", o);
});
t.on("unhandledRejection", (o, r) => {
  console.error("Promesa rechazada no manejada:", o);
});
