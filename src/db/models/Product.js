import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  barcode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  synced: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  modified: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  deletedLocally: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  lastSync: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  syncError: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  remoteId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

export default Product;
