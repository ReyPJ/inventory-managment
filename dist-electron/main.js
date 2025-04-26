import { app as y, ipcMain as o, BrowserWindow as _ } from "electron";
import l from "path";
import { fileURLToPath as E } from "url";
import n from "process";
import { Sequelize as b, DataTypes as c, Op as h } from "sequelize";
const O = E(import.meta.url), g = l.dirname(O);
let u, m;
if (n.env.NODE_ENV === "production" && n.type)
  try {
    m = n.env.APPDATA || (n.platform === "darwin" ? n.env.HOME + "/Library/Application Support" : n.env.HOME + "/.local/share"), u = l.join(m, "inventory-db", "database.sqlite");
  } catch (r) {
    console.error("Error al obtener ruta de datos:", r), u = l.join(g, "../../../database.sqlite");
  }
else
  u = l.join(g, "../../../database.sqlite");
try {
  const r = l.dirname(u);
  r.includes("inventory-db") && console.log(`Asegurando que el directorio existe: ${r}`);
} catch (r) {
  console.error("Error al crear directorio:", r);
}
console.log(`Base de datos usando ruta: ${u}`);
const f = new b({
  dialect: "sqlite",
  storage: u,
  logging: n.env.NODE_ENV === "development"
  // solo logging en desarrollo
}), s = f.define("Product", {
  id: {
    type: c.INTEGER,
    primaryKey: !0,
    autoIncrement: !0
  },
  barcode: {
    type: c.STRING,
    allowNull: !1,
    unique: !0
  },
  name: {
    type: c.STRING,
    allowNull: !1
  },
  description: {
    type: c.TEXT,
    allowNull: !0
  },
  price: {
    type: c.DECIMAL(10, 2),
    allowNull: !1,
    defaultValue: 0
  },
  stock: {
    type: c.INTEGER,
    allowNull: !1,
    defaultValue: 0
  },
  synced: {
    type: c.BOOLEAN,
    defaultValue: !1
  }
}), a = f.define("Category", {
  id: {
    type: c.INTEGER,
    primaryKey: !0,
    autoIncrement: !0
  },
  name: {
    type: c.STRING,
    allowNull: !1,
    unique: !0
  },
  description: {
    type: c.TEXT,
    allowNull: !0
  }
});
a.hasMany(s);
s.belongsTo(a);
async function S() {
  try {
    await f.sync();
    const r = ["PS4", "PS5"];
    for (const e of r)
      await a.findOrCreate({
        where: { name: e }
      });
    return console.log("Base de datos inicializada correctamente"), !0;
  } catch (r) {
    return console.error("Error al inicializar la base de datos:", r), !1;
  }
}
function d(r) {
  return r ? Array.isArray(r) ? r.map((e) => e.toJSON ? e.toJSON() : e) : r.toJSON ? r.toJSON() : r : null;
}
async function A() {
  try {
    const r = await s.findAll({
      include: [a],
      order: [["updatedAt", "DESC"]]
    });
    return d(r);
  } catch (r) {
    return console.error("Error al obtener productos:", r), [];
  }
}
async function I(r) {
  try {
    const e = await s.findByPk(r, {
      include: [a]
    });
    return d(e);
  } catch (e) {
    return console.error("Error al obtener el producto:", e), null;
  }
}
async function T(r) {
  try {
    const e = await s.findOne({
      where: { barcode: r },
      include: [a]
    });
    return d(e);
  } catch (e) {
    return console.error("Error al obtener el producto por codigo de barras:", e), null;
  }
}
async function v(r) {
  try {
    const e = await s.create(r);
    return d(e);
  } catch (e) {
    throw console.error("Error al crear el producto:", e), e;
  }
}
async function B(r, e) {
  try {
    const t = await s.findByPk(r);
    return t ? (await t.update(e), d(t)) : null;
  } catch (t) {
    throw console.error("Error al actualizar el producto:", t), t;
  }
}
async function C(r) {
  try {
    const e = await s.findByPk(r);
    return e ? (await e.destroy(), !0) : !1;
  } catch (e) {
    return console.error("Error al eliminar el producto:", e), !1;
  }
}
async function D(r) {
  try {
    const e = await s.findAll({
      where: {
        [h.or]: [
          { name: { [h.like]: `%${r}%` } },
          { barcode: { [h.like]: `%${r}%` } }
        ]
      },
      include: [a]
    });
    return d(e);
  } catch (e) {
    return console.error("Error al buscar productos:", e), [];
  }
}
function w(r) {
  return r ? Array.isArray(r) ? r.map((e) => e.toJSON ? e.toJSON() : e) : r.toJSON ? r.toJSON() : r : null;
}
async function J() {
  try {
    const r = await a.findAll();
    return w(r) || [];
  } catch (r) {
    return console.error("Error al obtener las categorias: ", r), [];
  }
}
async function j(r) {
  try {
    const e = await a.findByPk(r);
    return w(e);
  } catch (e) {
    return console.error("Error al obtener la categoria:", e), null;
  }
}
async function k(r) {
  try {
    const e = await a.create(r);
    return w(e);
  } catch (e) {
    throw console.error("Error al crear la categoria:", e), e;
  }
}
async function q(r, e) {
  try {
    const t = await a.findByPk(r);
    return t ? (await t.update(e), w(t)) : null;
  } catch (t) {
    throw console.error("Error al crear la categoria: ", t), t;
  }
}
async function R(r) {
  try {
    const e = await a.findByPk(r);
    return e ? (await e.destroy(), !0) : null;
  } catch (e) {
    return console.error("Error al eliminar la categoria:", e), !1;
  }
}
async function x(r) {
  try {
    return (await r.describeTable("Products")).description ? console.log('ℹ️ La columna "description" ya existe en la tabla Products') : (await r.addColumn("Products", "description", {
      type: b.TEXT,
      allowNull: !0
    }), console.log(
      '✅ Columna "description" añadida correctamente a la tabla Products'
    )), Promise.resolve();
  } catch (e) {
    return console.error("❌ Error al migrar:", e), Promise.reject(e);
  }
}
const V = E(import.meta.url), p = l.dirname(V), N = n.env.NODE_ENV === "production", $ = N ? l.join(p, "../") : l.join(p, "../dist/");
let i;
function P() {
  if (i = new _({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: l.join(p, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0,
      sandbox: !0
    },
    // Configuración adicional para ventana de producción
    show: !1,
    // No mostrar hasta que esté lista
    minWidth: 1024,
    minHeight: 768,
    title: "Sistema de Inventario"
  }), i.once("ready-to-show", () => {
    i.show();
  }), !N)
    i.webContents.openDevTools({ mode: "right" }), i.loadURL("http://localhost:5173");
  else {
    const r = l.join($, "index.html");
    console.log("Cargando desde:", r), i.loadFile(r);
  }
  i.on("closed", function() {
    i = null;
  });
}
function z() {
  o.handle("get-all-products", async () => await A()), o.handle("get-product-by-id", async (r, e) => await I(e)), o.handle("get-product-by-barcode", async (r, e) => await T(e)), o.handle("create-product", async (r, e) => await v(e)), o.handle("update-product", async (r, { id: e, productData: t }) => await B(e, t)), o.handle("delete-product", async (r, e) => await C(e)), o.handle("search-products", async (r, e) => await D(e)), o.handle("get-all-categories", async () => await J()), o.handle("get-category-by-id", async (r, e) => await j(e)), o.handle("create-category", async (r, e) => await k(e)), o.handle("update-category", async (r, { id: e, categoryData: t }) => await q(e, t)), o.handle("delete-category", async (r, e) => await R(e));
}
async function G() {
  try {
    const r = f.getQueryInterface();
    await x(r), console.log("✅ Migraciones completadas correctamente"), await S(), console.log("✅ Base de datos inicializada correctamente");
  } catch (r) {
    console.error("❌ Error al configurar la base de datos:", r);
  }
}
y.whenReady().then(async () => {
  console.log("Ambiente:", n.env.NODE_ENV || "development"), console.log("Directorio de la aplicación:", p), await G(), z(), P();
});
y.on("window-all-closed", function() {
  n.platform !== "darwin" && y.quit();
});
y.on("activate", function() {
  i === null && P();
});
n.on("uncaughtException", (r) => {
  console.error("Error no capturado:", r);
});
