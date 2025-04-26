import { app, ipcMain, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";
import { Sequelize, DataTypes, Op } from "sequelize";
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
const dbPath = path.join(__dirname$1, "../../../database.sqlite");
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false
  // cambiar a false para producción
});
const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  barcode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  synced: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});
const Category = sequelize.define("Category", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});
Category.hasMany(Product);
Product.belongsTo(Category);
async function initDatabase() {
  try {
    await sequelize.sync();
    const defaultCategories = ["PS4", "PS5"];
    for (const catName of defaultCategories) {
      await Category.findOrCreate({
        where: { name: catName }
      });
    }
    console.log("Base de datos inicializada correctamente");
    return true;
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
    return false;
  }
}
function toJSON$1(data) {
  if (!data) return null;
  if (Array.isArray(data)) {
    return data.map((item) => item.toJSON ? item.toJSON() : item);
  }
  return data.toJSON ? data.toJSON() : data;
}
async function getAllProducts() {
  try {
    const products = await Product.findAll({
      include: [Category],
      order: [["updatedAt", "DESC"]]
    });
    return toJSON$1(products);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    return [];
  }
}
async function getProductById(id) {
  try {
    const product = await Product.findByPk(id, {
      include: [Category]
    });
    return toJSON$1(product);
  } catch (err) {
    console.error("Error al obtener el producto:", err);
    return null;
  }
}
async function getProductByBarcode(barcode) {
  try {
    const product = await Product.findOne({
      where: { barcode },
      include: [Category]
    });
    return toJSON$1(product);
  } catch (err) {
    console.error("Error al obtener el producto por codigo de barras:", err);
    return null;
  }
}
async function createProduct(productData) {
  try {
    const product = await Product.create(productData);
    return toJSON$1(product);
  } catch (err) {
    console.error("Error al crear el producto:", err);
    throw err;
  }
}
async function updateProduct(id, productData) {
  try {
    const product = await Product.findByPk(id);
    if (!product) return null;
    await product.update(productData);
    return toJSON$1(product);
  } catch (err) {
    console.error("Error al actualizar el producto:", err);
    throw err;
  }
}
async function deleteProduct(id) {
  try {
    const product = await Product.findByPk(id);
    if (!product) return false;
    await product.destroy();
    return true;
  } catch (err) {
    console.error("Error al eliminar el producto:", err);
    return false;
  }
}
async function searchProducts(query) {
  try {
    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { barcode: { [Op.like]: `%${query}%` } }
        ]
      },
      include: [Category]
    });
    return toJSON$1(products);
  } catch (err) {
    console.error("Error al buscar productos:", err);
    return [];
  }
}
function toJSON(data) {
  if (!data) return null;
  if (Array.isArray(data)) {
    return data.map((item) => item.toJSON ? item.toJSON() : item);
  }
  return data.toJSON ? data.toJSON() : data;
}
async function getAllCategories() {
  try {
    const categories = await Category.findAll();
    return toJSON(categories) || [];
  } catch (error) {
    console.error("Error al obtener las categorias: ", error);
    return [];
  }
}
async function getCategoryById(id) {
  try {
    const category = await Category.findByPk(id);
    return toJSON(category);
  } catch (error) {
    console.error("Error al obtener la categoria:", error);
    return null;
  }
}
async function createCategory(categoryData) {
  try {
    const category = await Category.create(categoryData);
    return toJSON(category);
  } catch (error) {
    console.error("Error al crear la categoria:", error);
    throw error;
  }
}
async function updateCategory(id, categoryData) {
  try {
    const category = await Category.findByPk(id);
    if (!category) return null;
    await category.update(categoryData);
    return toJSON(category);
  } catch (error) {
    console.error("Error al crear la categoria: ", error);
    throw error;
  }
}
async function deleteCategory(id) {
  try {
    const category = await Category.findByPk(id);
    if (!category) return null;
    await category.destroy();
    return true;
  } catch (error) {
    console.error("Error al eliminar la categoria:", error);
    return false;
  }
}
async function up(queryInterface) {
  try {
    const tableInfo = await queryInterface.describeTable("Products");
    if (!tableInfo.description) {
      await queryInterface.addColumn("Products", "description", {
        type: Sequelize.TEXT,
        allowNull: true
      });
      console.log(
        '✅ Columna "description" añadida correctamente a la tabla Products'
      );
    } else {
      console.log('ℹ️ La columna "description" ya existe en la tabla Products');
    }
    return Promise.resolve();
  } catch (error) {
    console.error("❌ Error al migrar:", error);
    return Promise.reject(error);
  }
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools({ mode: "right" });
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  mainWindow.on("closed", function() {
    mainWindow = null;
  });
}
function setupIpcHandlers() {
  ipcMain.handle("get-all-products", async () => {
    return await getAllProducts();
  });
  ipcMain.handle("get-product-by-id", async (_, id) => {
    return await getProductById(id);
  });
  ipcMain.handle("get-product-by-barcode", async (_, barcode) => {
    return await getProductByBarcode(barcode);
  });
  ipcMain.handle("create-product", async (_, productData) => {
    return await createProduct(productData);
  });
  ipcMain.handle("update-product", async (_, { id, productData }) => {
    return await updateProduct(id, productData);
  });
  ipcMain.handle("delete-product", async (_, id) => {
    return await deleteProduct(id);
  });
  ipcMain.handle("search-products", async (_, query) => {
    return await searchProducts(query);
  });
  ipcMain.handle("get-all-categories", async () => {
    return await getAllCategories();
  });
  ipcMain.handle("get-category-by-id", async (_, id) => {
    return await getCategoryById(id);
  });
  ipcMain.handle("create-category", async (_, categoryData) => {
    return await createCategory(categoryData);
  });
  ipcMain.handle("update-category", async (_, { id, categoryData }) => {
    return await updateCategory(id, categoryData);
  });
  ipcMain.handle("delete-category", async (_, id) => {
    return await deleteCategory(id);
  });
}
app.whenReady().then(async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    await up(queryInterface);
    console.log("✅ Migraciones completadas correctamente");
  } catch (error) {
    console.error("❌ Error al ejecutar migraciones:", error);
  }
  await initDatabase();
  setupIpcHandlers();
  createWindow();
});
app.on("window-all-closed", function() {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", function() {
  if (mainWindow === null) createWindow();
});
