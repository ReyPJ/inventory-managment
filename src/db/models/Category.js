import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Category = sequelize.define("Category", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
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
});

export default Category;
