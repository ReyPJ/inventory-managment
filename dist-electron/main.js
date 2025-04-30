import { app, ipcMain, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import process$1 from "process";
import { Sequelize, DataTypes, Op } from "sequelize";
import fs from "fs";
import require$$2 from "util";
import os from "os";
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var lib = { exports: {} };
function commonjsRequire(path2) {
  throw new Error('Could not dynamically require "' + path2 + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var util = {};
var hasRequiredUtil;
function requireUtil() {
  if (hasRequiredUtil) return util;
  hasRequiredUtil = 1;
  util.getBooleanOption = (options, key) => {
    let value = false;
    if (key in options && typeof (value = options[key]) !== "boolean") {
      throw new TypeError(`Expected the "${key}" option to be a boolean`);
    }
    return value;
  };
  util.cppdb = Symbol();
  util.inspect = Symbol.for("nodejs.util.inspect.custom");
  return util;
}
var sqliteError;
var hasRequiredSqliteError;
function requireSqliteError() {
  if (hasRequiredSqliteError) return sqliteError;
  hasRequiredSqliteError = 1;
  const descriptor = { value: "SqliteError", writable: true, enumerable: false, configurable: true };
  function SqliteError(message, code) {
    if (new.target !== SqliteError) {
      return new SqliteError(message, code);
    }
    if (typeof code !== "string") {
      throw new TypeError("Expected second argument to be a string");
    }
    Error.call(this, message);
    descriptor.value = "" + message;
    Object.defineProperty(this, "message", descriptor);
    Error.captureStackTrace(this, SqliteError);
    this.code = code;
  }
  Object.setPrototypeOf(SqliteError, Error);
  Object.setPrototypeOf(SqliteError.prototype, Error.prototype);
  Object.defineProperty(SqliteError.prototype, "name", descriptor);
  sqliteError = SqliteError;
  return sqliteError;
}
var bindings = { exports: {} };
var fileUriToPath_1;
var hasRequiredFileUriToPath;
function requireFileUriToPath() {
  if (hasRequiredFileUriToPath) return fileUriToPath_1;
  hasRequiredFileUriToPath = 1;
  var sep = path.sep || "/";
  fileUriToPath_1 = fileUriToPath;
  function fileUriToPath(uri) {
    if ("string" != typeof uri || uri.length <= 7 || "file://" != uri.substring(0, 7)) {
      throw new TypeError("must pass in a file:// URI to convert to a file path");
    }
    var rest = decodeURI(uri.substring(7));
    var firstSlash = rest.indexOf("/");
    var host = rest.substring(0, firstSlash);
    var path2 = rest.substring(firstSlash + 1);
    if ("localhost" == host) host = "";
    if (host) {
      host = sep + sep + host;
    }
    path2 = path2.replace(/^(.+)\|/, "$1:");
    if (sep == "\\") {
      path2 = path2.replace(/\//g, "\\");
    }
    if (/^.+\:/.test(path2)) ;
    else {
      path2 = sep + path2;
    }
    return host + path2;
  }
  return fileUriToPath_1;
}
var hasRequiredBindings;
function requireBindings() {
  if (hasRequiredBindings) return bindings.exports;
  hasRequiredBindings = 1;
  (function(module, exports) {
    var fs$1 = fs, path$1 = path, fileURLToPath2 = requireFileUriToPath(), join = path$1.join, dirname = path$1.dirname, exists = fs$1.accessSync && function(path2) {
      try {
        fs$1.accessSync(path2);
      } catch (e) {
        return false;
      }
      return true;
    } || fs$1.existsSync || path$1.existsSync, defaults = {
      arrow: process.env.NODE_BINDINGS_ARROW || " → ",
      compiled: process.env.NODE_BINDINGS_COMPILED_DIR || "compiled",
      platform: process.platform,
      arch: process.arch,
      nodePreGyp: "node-v" + process.versions.modules + "-" + process.platform + "-" + process.arch,
      version: process.versions.node,
      bindings: "bindings.node",
      try: [
        // node-gyp's linked version in the "build" dir
        ["module_root", "build", "bindings"],
        // node-waf and gyp_addon (a.k.a node-gyp)
        ["module_root", "build", "Debug", "bindings"],
        ["module_root", "build", "Release", "bindings"],
        // Debug files, for development (legacy behavior, remove for node v0.9)
        ["module_root", "out", "Debug", "bindings"],
        ["module_root", "Debug", "bindings"],
        // Release files, but manually compiled (legacy behavior, remove for node v0.9)
        ["module_root", "out", "Release", "bindings"],
        ["module_root", "Release", "bindings"],
        // Legacy from node-waf, node <= 0.4.x
        ["module_root", "build", "default", "bindings"],
        // Production "Release" buildtype binary (meh...)
        ["module_root", "compiled", "version", "platform", "arch", "bindings"],
        // node-qbs builds
        ["module_root", "addon-build", "release", "install-root", "bindings"],
        ["module_root", "addon-build", "debug", "install-root", "bindings"],
        ["module_root", "addon-build", "default", "install-root", "bindings"],
        // node-pre-gyp path ./lib/binding/{node_abi}-{platform}-{arch}
        ["module_root", "lib", "binding", "nodePreGyp", "bindings"]
      ]
    };
    function bindings2(opts) {
      if (typeof opts == "string") {
        opts = { bindings: opts };
      } else if (!opts) {
        opts = {};
      }
      Object.keys(defaults).map(function(i2) {
        if (!(i2 in opts)) opts[i2] = defaults[i2];
      });
      if (!opts.module_root) {
        opts.module_root = exports.getRoot(exports.getFileName());
      }
      if (path$1.extname(opts.bindings) != ".node") {
        opts.bindings += ".node";
      }
      var requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : commonjsRequire;
      var tries = [], i = 0, l = opts.try.length, n, b, err;
      for (; i < l; i++) {
        n = join.apply(
          null,
          opts.try[i].map(function(p) {
            return opts[p] || p;
          })
        );
        tries.push(n);
        try {
          b = opts.path ? requireFunc.resolve(n) : requireFunc(n);
          if (!opts.path) {
            b.path = n;
          }
          return b;
        } catch (e) {
          if (e.code !== "MODULE_NOT_FOUND" && e.code !== "QUALIFIED_PATH_RESOLUTION_FAILED" && !/not find/i.test(e.message)) {
            throw e;
          }
        }
      }
      err = new Error(
        "Could not locate the bindings file. Tried:\n" + tries.map(function(a) {
          return opts.arrow + a;
        }).join("\n")
      );
      err.tries = tries;
      throw err;
    }
    module.exports = exports = bindings2;
    exports.getFileName = function getFileName(calling_file) {
      var origPST = Error.prepareStackTrace, origSTL = Error.stackTraceLimit, dummy = {}, fileName;
      Error.stackTraceLimit = 10;
      Error.prepareStackTrace = function(e, st) {
        for (var i = 0, l = st.length; i < l; i++) {
          fileName = st[i].getFileName();
          if (fileName !== __filename) {
            if (calling_file) {
              if (fileName !== calling_file) {
                return;
              }
            } else {
              return;
            }
          }
        }
      };
      Error.captureStackTrace(dummy);
      dummy.stack;
      Error.prepareStackTrace = origPST;
      Error.stackTraceLimit = origSTL;
      var fileSchema = "file://";
      if (fileName.indexOf(fileSchema) === 0) {
        fileName = fileURLToPath2(fileName);
      }
      return fileName;
    };
    exports.getRoot = function getRoot(file) {
      var dir = dirname(file), prev;
      while (true) {
        if (dir === ".") {
          dir = process.cwd();
        }
        if (exists(join(dir, "package.json")) || exists(join(dir, "node_modules"))) {
          return dir;
        }
        if (prev === dir) {
          throw new Error(
            'Could not find module root given file: "' + file + '". Do you have a `package.json` file? '
          );
        }
        prev = dir;
        dir = join(dir, "..");
      }
    };
  })(bindings, bindings.exports);
  return bindings.exports;
}
var wrappers = {};
var hasRequiredWrappers;
function requireWrappers() {
  if (hasRequiredWrappers) return wrappers;
  hasRequiredWrappers = 1;
  const { cppdb } = requireUtil();
  wrappers.prepare = function prepare(sql) {
    return this[cppdb].prepare(sql, this, false);
  };
  wrappers.exec = function exec(sql) {
    this[cppdb].exec(sql);
    return this;
  };
  wrappers.close = function close() {
    this[cppdb].close();
    return this;
  };
  wrappers.loadExtension = function loadExtension(...args) {
    this[cppdb].loadExtension(...args);
    return this;
  };
  wrappers.defaultSafeIntegers = function defaultSafeIntegers(...args) {
    this[cppdb].defaultSafeIntegers(...args);
    return this;
  };
  wrappers.unsafeMode = function unsafeMode(...args) {
    this[cppdb].unsafeMode(...args);
    return this;
  };
  wrappers.getters = {
    name: {
      get: function name() {
        return this[cppdb].name;
      },
      enumerable: true
    },
    open: {
      get: function open() {
        return this[cppdb].open;
      },
      enumerable: true
    },
    inTransaction: {
      get: function inTransaction() {
        return this[cppdb].inTransaction;
      },
      enumerable: true
    },
    readonly: {
      get: function readonly() {
        return this[cppdb].readonly;
      },
      enumerable: true
    },
    memory: {
      get: function memory() {
        return this[cppdb].memory;
      },
      enumerable: true
    }
  };
  return wrappers;
}
var transaction;
var hasRequiredTransaction;
function requireTransaction() {
  if (hasRequiredTransaction) return transaction;
  hasRequiredTransaction = 1;
  const { cppdb } = requireUtil();
  const controllers = /* @__PURE__ */ new WeakMap();
  transaction = function transaction2(fn) {
    if (typeof fn !== "function") throw new TypeError("Expected first argument to be a function");
    const db = this[cppdb];
    const controller = getController(db, this);
    const { apply } = Function.prototype;
    const properties = {
      default: { value: wrapTransaction(apply, fn, db, controller.default) },
      deferred: { value: wrapTransaction(apply, fn, db, controller.deferred) },
      immediate: { value: wrapTransaction(apply, fn, db, controller.immediate) },
      exclusive: { value: wrapTransaction(apply, fn, db, controller.exclusive) },
      database: { value: this, enumerable: true }
    };
    Object.defineProperties(properties.default.value, properties);
    Object.defineProperties(properties.deferred.value, properties);
    Object.defineProperties(properties.immediate.value, properties);
    Object.defineProperties(properties.exclusive.value, properties);
    return properties.default.value;
  };
  const getController = (db, self) => {
    let controller = controllers.get(db);
    if (!controller) {
      const shared = {
        commit: db.prepare("COMMIT", self, false),
        rollback: db.prepare("ROLLBACK", self, false),
        savepoint: db.prepare("SAVEPOINT `	_bs3.	`", self, false),
        release: db.prepare("RELEASE `	_bs3.	`", self, false),
        rollbackTo: db.prepare("ROLLBACK TO `	_bs3.	`", self, false)
      };
      controllers.set(db, controller = {
        default: Object.assign({ begin: db.prepare("BEGIN", self, false) }, shared),
        deferred: Object.assign({ begin: db.prepare("BEGIN DEFERRED", self, false) }, shared),
        immediate: Object.assign({ begin: db.prepare("BEGIN IMMEDIATE", self, false) }, shared),
        exclusive: Object.assign({ begin: db.prepare("BEGIN EXCLUSIVE", self, false) }, shared)
      });
    }
    return controller;
  };
  const wrapTransaction = (apply, fn, db, { begin, commit, rollback, savepoint, release, rollbackTo }) => function sqliteTransaction() {
    let before, after, undo;
    if (db.inTransaction) {
      before = savepoint;
      after = release;
      undo = rollbackTo;
    } else {
      before = begin;
      after = commit;
      undo = rollback;
    }
    before.run();
    try {
      const result = apply.call(fn, this, arguments);
      after.run();
      return result;
    } catch (ex) {
      if (db.inTransaction) {
        undo.run();
        if (undo !== rollback) after.run();
      }
      throw ex;
    }
  };
  return transaction;
}
var pragma;
var hasRequiredPragma;
function requirePragma() {
  if (hasRequiredPragma) return pragma;
  hasRequiredPragma = 1;
  const { getBooleanOption, cppdb } = requireUtil();
  pragma = function pragma2(source, options) {
    if (options == null) options = {};
    if (typeof source !== "string") throw new TypeError("Expected first argument to be a string");
    if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
    const simple = getBooleanOption(options, "simple");
    const stmt = this[cppdb].prepare(`PRAGMA ${source}`, this, true);
    return simple ? stmt.pluck().get() : stmt.all();
  };
  return pragma;
}
var backup;
var hasRequiredBackup;
function requireBackup() {
  if (hasRequiredBackup) return backup;
  hasRequiredBackup = 1;
  const fs$1 = fs;
  const path$1 = path;
  const { promisify } = require$$2;
  const { cppdb } = requireUtil();
  const fsAccess = promisify(fs$1.access);
  backup = async function backup2(filename, options) {
    if (options == null) options = {};
    if (typeof filename !== "string") throw new TypeError("Expected first argument to be a string");
    if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
    filename = filename.trim();
    const attachedName = "attached" in options ? options.attached : "main";
    const handler = "progress" in options ? options.progress : null;
    if (!filename) throw new TypeError("Backup filename cannot be an empty string");
    if (filename === ":memory:") throw new TypeError('Invalid backup filename ":memory:"');
    if (typeof attachedName !== "string") throw new TypeError('Expected the "attached" option to be a string');
    if (!attachedName) throw new TypeError('The "attached" option cannot be an empty string');
    if (handler != null && typeof handler !== "function") throw new TypeError('Expected the "progress" option to be a function');
    await fsAccess(path$1.dirname(filename)).catch(() => {
      throw new TypeError("Cannot save backup because the directory does not exist");
    });
    const isNewFile = await fsAccess(filename).then(() => false, () => true);
    return runBackup(this[cppdb].backup(this, attachedName, filename, isNewFile), handler || null);
  };
  const runBackup = (backup2, handler) => {
    let rate = 0;
    let useDefault = true;
    return new Promise((resolve, reject) => {
      setImmediate(function step() {
        try {
          const progress = backup2.transfer(rate);
          if (!progress.remainingPages) {
            backup2.close();
            resolve(progress);
            return;
          }
          if (useDefault) {
            useDefault = false;
            rate = 100;
          }
          if (handler) {
            const ret = handler(progress);
            if (ret !== void 0) {
              if (typeof ret === "number" && ret === ret) rate = Math.max(0, Math.min(2147483647, Math.round(ret)));
              else throw new TypeError("Expected progress callback to return a number or undefined");
            }
          }
          setImmediate(step);
        } catch (err) {
          backup2.close();
          reject(err);
        }
      });
    });
  };
  return backup;
}
var serialize;
var hasRequiredSerialize;
function requireSerialize() {
  if (hasRequiredSerialize) return serialize;
  hasRequiredSerialize = 1;
  const { cppdb } = requireUtil();
  serialize = function serialize2(options) {
    if (options == null) options = {};
    if (typeof options !== "object") throw new TypeError("Expected first argument to be an options object");
    const attachedName = "attached" in options ? options.attached : "main";
    if (typeof attachedName !== "string") throw new TypeError('Expected the "attached" option to be a string');
    if (!attachedName) throw new TypeError('The "attached" option cannot be an empty string');
    return this[cppdb].serialize(attachedName);
  };
  return serialize;
}
var _function;
var hasRequired_function;
function require_function() {
  if (hasRequired_function) return _function;
  hasRequired_function = 1;
  const { getBooleanOption, cppdb } = requireUtil();
  _function = function defineFunction(name, options, fn) {
    if (options == null) options = {};
    if (typeof options === "function") {
      fn = options;
      options = {};
    }
    if (typeof name !== "string") throw new TypeError("Expected first argument to be a string");
    if (typeof fn !== "function") throw new TypeError("Expected last argument to be a function");
    if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
    if (!name) throw new TypeError("User-defined function name cannot be an empty string");
    const safeIntegers = "safeIntegers" in options ? +getBooleanOption(options, "safeIntegers") : 2;
    const deterministic = getBooleanOption(options, "deterministic");
    const directOnly = getBooleanOption(options, "directOnly");
    const varargs = getBooleanOption(options, "varargs");
    let argCount = -1;
    if (!varargs) {
      argCount = fn.length;
      if (!Number.isInteger(argCount) || argCount < 0) throw new TypeError("Expected function.length to be a positive integer");
      if (argCount > 100) throw new RangeError("User-defined functions cannot have more than 100 arguments");
    }
    this[cppdb].function(fn, name, argCount, safeIntegers, deterministic, directOnly);
    return this;
  };
  return _function;
}
var aggregate;
var hasRequiredAggregate;
function requireAggregate() {
  if (hasRequiredAggregate) return aggregate;
  hasRequiredAggregate = 1;
  const { getBooleanOption, cppdb } = requireUtil();
  aggregate = function defineAggregate(name, options) {
    if (typeof name !== "string") throw new TypeError("Expected first argument to be a string");
    if (typeof options !== "object" || options === null) throw new TypeError("Expected second argument to be an options object");
    if (!name) throw new TypeError("User-defined function name cannot be an empty string");
    const start = "start" in options ? options.start : null;
    const step = getFunctionOption(options, "step", true);
    const inverse = getFunctionOption(options, "inverse", false);
    const result = getFunctionOption(options, "result", false);
    const safeIntegers = "safeIntegers" in options ? +getBooleanOption(options, "safeIntegers") : 2;
    const deterministic = getBooleanOption(options, "deterministic");
    const directOnly = getBooleanOption(options, "directOnly");
    const varargs = getBooleanOption(options, "varargs");
    let argCount = -1;
    if (!varargs) {
      argCount = Math.max(getLength(step), inverse ? getLength(inverse) : 0);
      if (argCount > 0) argCount -= 1;
      if (argCount > 100) throw new RangeError("User-defined functions cannot have more than 100 arguments");
    }
    this[cppdb].aggregate(start, step, inverse, result, name, argCount, safeIntegers, deterministic, directOnly);
    return this;
  };
  const getFunctionOption = (options, key, required) => {
    const value = key in options ? options[key] : null;
    if (typeof value === "function") return value;
    if (value != null) throw new TypeError(`Expected the "${key}" option to be a function`);
    if (required) throw new TypeError(`Missing required option "${key}"`);
    return null;
  };
  const getLength = ({ length }) => {
    if (Number.isInteger(length) && length >= 0) return length;
    throw new TypeError("Expected function.length to be a positive integer");
  };
  return aggregate;
}
var table;
var hasRequiredTable;
function requireTable() {
  if (hasRequiredTable) return table;
  hasRequiredTable = 1;
  const { cppdb } = requireUtil();
  table = function defineTable(name, factory) {
    if (typeof name !== "string") throw new TypeError("Expected first argument to be a string");
    if (!name) throw new TypeError("Virtual table module name cannot be an empty string");
    let eponymous = false;
    if (typeof factory === "object" && factory !== null) {
      eponymous = true;
      factory = defer(parseTableDefinition(factory, "used", name));
    } else {
      if (typeof factory !== "function") throw new TypeError("Expected second argument to be a function or a table definition object");
      factory = wrapFactory(factory);
    }
    this[cppdb].table(factory, name, eponymous);
    return this;
  };
  function wrapFactory(factory) {
    return function virtualTableFactory(moduleName, databaseName, tableName, ...args) {
      const thisObject = {
        module: moduleName,
        database: databaseName,
        table: tableName
      };
      const def = apply.call(factory, thisObject, args);
      if (typeof def !== "object" || def === null) {
        throw new TypeError(`Virtual table module "${moduleName}" did not return a table definition object`);
      }
      return parseTableDefinition(def, "returned", moduleName);
    };
  }
  function parseTableDefinition(def, verb, moduleName) {
    if (!hasOwnProperty.call(def, "rows")) {
      throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition without a "rows" property`);
    }
    if (!hasOwnProperty.call(def, "columns")) {
      throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition without a "columns" property`);
    }
    const rows = def.rows;
    if (typeof rows !== "function" || Object.getPrototypeOf(rows) !== GeneratorFunctionPrototype) {
      throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "rows" property (should be a generator function)`);
    }
    let columns = def.columns;
    if (!Array.isArray(columns) || !(columns = [...columns]).every((x) => typeof x === "string")) {
      throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "columns" property (should be an array of strings)`);
    }
    if (columns.length !== new Set(columns).size) {
      throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with duplicate column names`);
    }
    if (!columns.length) {
      throw new RangeError(`Virtual table module "${moduleName}" ${verb} a table definition with zero columns`);
    }
    let parameters;
    if (hasOwnProperty.call(def, "parameters")) {
      parameters = def.parameters;
      if (!Array.isArray(parameters) || !(parameters = [...parameters]).every((x) => typeof x === "string")) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "parameters" property (should be an array of strings)`);
      }
    } else {
      parameters = inferParameters(rows);
    }
    if (parameters.length !== new Set(parameters).size) {
      throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with duplicate parameter names`);
    }
    if (parameters.length > 32) {
      throw new RangeError(`Virtual table module "${moduleName}" ${verb} a table definition with more than the maximum number of 32 parameters`);
    }
    for (const parameter of parameters) {
      if (columns.includes(parameter)) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with column "${parameter}" which was ambiguously defined as both a column and parameter`);
      }
    }
    let safeIntegers = 2;
    if (hasOwnProperty.call(def, "safeIntegers")) {
      const bool = def.safeIntegers;
      if (typeof bool !== "boolean") {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "safeIntegers" property (should be a boolean)`);
      }
      safeIntegers = +bool;
    }
    let directOnly = false;
    if (hasOwnProperty.call(def, "directOnly")) {
      directOnly = def.directOnly;
      if (typeof directOnly !== "boolean") {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "directOnly" property (should be a boolean)`);
      }
    }
    const columnDefinitions = [
      ...parameters.map(identifier).map((str) => `${str} HIDDEN`),
      ...columns.map(identifier)
    ];
    return [
      `CREATE TABLE x(${columnDefinitions.join(", ")});`,
      wrapGenerator(rows, new Map(columns.map((x, i) => [x, parameters.length + i])), moduleName),
      parameters,
      safeIntegers,
      directOnly
    ];
  }
  function wrapGenerator(generator, columnMap, moduleName) {
    return function* virtualTable(...args) {
      const output = args.map((x) => Buffer.isBuffer(x) ? Buffer.from(x) : x);
      for (let i = 0; i < columnMap.size; ++i) {
        output.push(null);
      }
      for (const row of generator(...args)) {
        if (Array.isArray(row)) {
          extractRowArray(row, output, columnMap.size, moduleName);
          yield output;
        } else if (typeof row === "object" && row !== null) {
          extractRowObject(row, output, columnMap, moduleName);
          yield output;
        } else {
          throw new TypeError(`Virtual table module "${moduleName}" yielded something that isn't a valid row object`);
        }
      }
    };
  }
  function extractRowArray(row, output, columnCount, moduleName) {
    if (row.length !== columnCount) {
      throw new TypeError(`Virtual table module "${moduleName}" yielded a row with an incorrect number of columns`);
    }
    const offset = output.length - columnCount;
    for (let i = 0; i < columnCount; ++i) {
      output[i + offset] = row[i];
    }
  }
  function extractRowObject(row, output, columnMap, moduleName) {
    let count = 0;
    for (const key of Object.keys(row)) {
      const index = columnMap.get(key);
      if (index === void 0) {
        throw new TypeError(`Virtual table module "${moduleName}" yielded a row with an undeclared column "${key}"`);
      }
      output[index] = row[key];
      count += 1;
    }
    if (count !== columnMap.size) {
      throw new TypeError(`Virtual table module "${moduleName}" yielded a row with missing columns`);
    }
  }
  function inferParameters({ length }) {
    if (!Number.isInteger(length) || length < 0) {
      throw new TypeError("Expected function.length to be a positive integer");
    }
    const params = [];
    for (let i = 0; i < length; ++i) {
      params.push(`$${i + 1}`);
    }
    return params;
  }
  const { hasOwnProperty } = Object.prototype;
  const { apply } = Function.prototype;
  const GeneratorFunctionPrototype = Object.getPrototypeOf(function* () {
  });
  const identifier = (str) => `"${str.replace(/"/g, '""')}"`;
  const defer = (x) => () => x;
  return table;
}
var inspect;
var hasRequiredInspect;
function requireInspect() {
  if (hasRequiredInspect) return inspect;
  hasRequiredInspect = 1;
  const DatabaseInspection = function Database() {
  };
  inspect = function inspect2(depth, opts) {
    return Object.assign(new DatabaseInspection(), this);
  };
  return inspect;
}
var database;
var hasRequiredDatabase;
function requireDatabase() {
  if (hasRequiredDatabase) return database;
  hasRequiredDatabase = 1;
  const fs$1 = fs;
  const path$1 = path;
  const util2 = requireUtil();
  const SqliteError = requireSqliteError();
  let DEFAULT_ADDON;
  function Database(filenameGiven, options) {
    if (new.target == null) {
      return new Database(filenameGiven, options);
    }
    let buffer;
    if (Buffer.isBuffer(filenameGiven)) {
      buffer = filenameGiven;
      filenameGiven = ":memory:";
    }
    if (filenameGiven == null) filenameGiven = "";
    if (options == null) options = {};
    if (typeof filenameGiven !== "string") throw new TypeError("Expected first argument to be a string");
    if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
    if ("readOnly" in options) throw new TypeError('Misspelled option "readOnly" should be "readonly"');
    if ("memory" in options) throw new TypeError('Option "memory" was removed in v7.0.0 (use ":memory:" filename instead)');
    const filename = filenameGiven.trim();
    const anonymous = filename === "" || filename === ":memory:";
    const readonly = util2.getBooleanOption(options, "readonly");
    const fileMustExist = util2.getBooleanOption(options, "fileMustExist");
    const timeout = "timeout" in options ? options.timeout : 5e3;
    const verbose = "verbose" in options ? options.verbose : null;
    const nativeBinding = "nativeBinding" in options ? options.nativeBinding : null;
    if (readonly && anonymous && !buffer) throw new TypeError("In-memory/temporary databases cannot be readonly");
    if (!Number.isInteger(timeout) || timeout < 0) throw new TypeError('Expected the "timeout" option to be a positive integer');
    if (timeout > 2147483647) throw new RangeError('Option "timeout" cannot be greater than 2147483647');
    if (verbose != null && typeof verbose !== "function") throw new TypeError('Expected the "verbose" option to be a function');
    if (nativeBinding != null && typeof nativeBinding !== "string" && typeof nativeBinding !== "object") throw new TypeError('Expected the "nativeBinding" option to be a string or addon object');
    let addon;
    if (nativeBinding == null) {
      addon = DEFAULT_ADDON || (DEFAULT_ADDON = requireBindings()("better_sqlite3.node"));
    } else if (typeof nativeBinding === "string") {
      const requireFunc = typeof __non_webpack_require__ === "function" ? __non_webpack_require__ : commonjsRequire;
      addon = requireFunc(path$1.resolve(nativeBinding).replace(/(\.node)?$/, ".node"));
    } else {
      addon = nativeBinding;
    }
    if (!addon.isInitialized) {
      addon.setErrorConstructor(SqliteError);
      addon.isInitialized = true;
    }
    if (!anonymous && !fs$1.existsSync(path$1.dirname(filename))) {
      throw new TypeError("Cannot open database because the directory does not exist");
    }
    Object.defineProperties(this, {
      [util2.cppdb]: { value: new addon.Database(filename, filenameGiven, anonymous, readonly, fileMustExist, timeout, verbose || null, buffer || null) },
      ...wrappers2.getters
    });
  }
  const wrappers2 = requireWrappers();
  Database.prototype.prepare = wrappers2.prepare;
  Database.prototype.transaction = requireTransaction();
  Database.prototype.pragma = requirePragma();
  Database.prototype.backup = requireBackup();
  Database.prototype.serialize = requireSerialize();
  Database.prototype.function = require_function();
  Database.prototype.aggregate = requireAggregate();
  Database.prototype.table = requireTable();
  Database.prototype.loadExtension = wrappers2.loadExtension;
  Database.prototype.exec = wrappers2.exec;
  Database.prototype.close = wrappers2.close;
  Database.prototype.defaultSafeIntegers = wrappers2.defaultSafeIntegers;
  Database.prototype.unsafeMode = wrappers2.unsafeMode;
  Database.prototype[util2.inspect] = requireInspect();
  database = Database;
  return database;
}
var hasRequiredLib;
function requireLib() {
  if (hasRequiredLib) return lib.exports;
  hasRequiredLib = 1;
  lib.exports = requireDatabase();
  lib.exports.SqliteError = requireSqliteError();
  return lib.exports;
}
var libExports = requireLib();
const betterSqlite3 = /* @__PURE__ */ getDefaultExportFromCjs(libExports);
const isPackaged$1 = process$1.env.NODE_ENV === "production" || typeof process$1.versions === "object" && typeof process$1.versions.electron === "string";
console.log("¿Modo empaquetado?:", isPackaged$1);
let dbPath;
let userDataPath;
if (isPackaged$1) {
  try {
    if (process$1.env.APPDATA) {
      userDataPath = process$1.env.APPDATA;
    } else if (process$1.platform === "darwin") {
      userDataPath = path.join(
        process$1.env.HOME,
        "/Library/Application Support"
      );
    } else {
      userDataPath = path.join(process$1.env.HOME, "/.local/share");
    }
    const appDataPath = path.join(userDataPath, "sistema-inventario");
    if (!fs.existsSync(appDataPath)) {
      try {
        fs.mkdirSync(appDataPath, { recursive: true });
        console.log("Directorio creado:", appDataPath);
      } catch (mkdirErr) {
        console.error("Error al crear directorio de datos:", mkdirErr);
      }
    }
    dbPath = path.join(appDataPath, "inventory-database.sqlite");
    console.log("Ruta de base de datos en producción:", dbPath);
  } catch (err) {
    console.error("Error al obtener ruta de datos:", err);
    try {
      if (process$1.resourcesPath) {
        dbPath = path.join(process$1.resourcesPath, "database.sqlite");
      } else {
        dbPath = path.join(path.dirname(process$1.execPath), "database.sqlite");
      }
      console.log("Usando ruta fallback para base de datos:", dbPath);
    } catch (e) {
      console.error("Error en fallback de ruta:", e);
      dbPath = path.join(os.tmpdir(), "inventory-database.sqlite");
      console.log("Usando ruta temporal para base de datos:", dbPath);
    }
  }
} else {
  dbPath = path.join(process$1.cwd(), "database.sqlite");
  console.log("Ruta de base de datos en desarrollo:", dbPath);
}
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false,
  // Cambiar a console.log para ver consultas SQL durante depuración
  dialectOptions: {
    // Usar better-sqlite3 que es más confiable en Electron
    dialectModule: betterSqlite3
  }
});
sequelize.authenticate().then(() => {
  console.log("Conexión a la base de datos establecida correctamente.");
}).catch((err) => {
  console.error("Error al conectar a la base de datos:", err);
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
  },
  modified: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  deletedLocally: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastSync: {
    type: DataTypes.DATE,
    allowNull: true
  },
  syncError: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  remoteId: {
    type: DataTypes.INTEGER,
    allowNull: true
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
const locallyDeletedProducts = /* @__PURE__ */ new Set();
const markProductAsDeleted = (productId) => {
  if (!productId) return;
  locallyDeletedProducts.add(productId);
  console.log(`Producto ID ${productId} marcado como eliminado localmente`);
};
const toJSON$1 = (data) => {
  return data ? JSON.parse(JSON.stringify(data)) : null;
};
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
async function getAllActiveProducts() {
  try {
    const products = await Product.findAll({
      where: {
        deletedLocally: false
      },
      include: [Category],
      order: [["updatedAt", "DESC"]]
    });
    return toJSON$1(products);
  } catch (err) {
    console.error("Error al obtener productos activos:", err);
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
      where: {
        barcode,
        deletedLocally: false
        // Solo buscar en productos activos
      },
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
    const data = {
      ...productData,
      modified: true,
      synced: false
    };
    const product = await Product.create(data);
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
    const data = {
      ...productData,
      modified: true,
      synced: false
    };
    await product.update(data);
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
    await product.update({
      deletedLocally: true,
      modified: true,
      synced: false
    });
    markProductAsDeleted(id);
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
        [Op.and]: [
          {
            [Op.or]: [
              { name: { [Op.like]: `%${query}%` } },
              { barcode: { [Op.like]: `%${query}%` } }
            ]
          },
          { deletedLocally: false }
          // Solo buscar en productos activos
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
async function updateProductsAfterSync(syncResults) {
  try {
    const { syncedProducts, serverProducts } = syncResults;
    let updated = 0;
    let added = 0;
    let skipped = 0;
    if (syncedProducts && Array.isArray(syncedProducts)) {
      for (const syncedProduct of syncedProducts) {
        const localProduct = await Product.findOne({
          where: { barcode: syncedProduct.barcode }
        });
        if (localProduct) {
          await localProduct.update({
            synced: true,
            modified: false,
            lastSync: /* @__PURE__ */ new Date(),
            syncError: null,
            remoteId: syncedProduct.id
          });
          updated++;
        }
      }
    }
    const deletedProducts = await Product.findAll({
      where: { deletedLocally: true }
    });
    const locallyDeletedBarcodes = deletedProducts.map((p) => p.barcode);
    console.log(
      `Verificando ${(serverProducts == null ? void 0 : serverProducts.length) || 0} productos del servidor contra ${locallyDeletedBarcodes.length} códigos eliminados localmente`
    );
    if (serverProducts && Array.isArray(serverProducts)) {
      for (const serverProduct of serverProducts) {
        try {
          const exists = await Product.findOne({
            where: { barcode: serverProduct.barcode }
          });
          if (locallyDeletedBarcodes.includes(serverProduct.barcode)) {
            console.log(
              `Producto con barcode ${serverProduct.barcode} no agregado porque fue eliminado localmente`
            );
            skipped++;
            continue;
          }
          if (!exists) {
            let productData = {
              ...serverProduct,
              synced: true,
              modified: false,
              deletedLocally: false,
              lastSync: /* @__PURE__ */ new Date(),
              remoteId: serverProduct.id
            };
            if (serverProduct.CategoryId) {
              const categoryExists = await Category.findByPk(serverProduct.CategoryId);
              if (!categoryExists) {
                console.log(`Categoría ID ${serverProduct.CategoryId} no encontrada para producto ${serverProduct.name}. Estableciendo CategoryId como null.`);
                productData.CategoryId = null;
              }
            }
            await Product.create(productData);
            added++;
          }
        } catch (error) {
          console.error(`Error procesando producto ${serverProduct.barcode}:`, error);
          skipped++;
        }
      }
    }
    return { updated, added, skipped };
  } catch (err) {
    console.error(
      "Error al actualizar productos después de sincronización:",
      err
    );
    if (err.name === "SequelizeForeignKeyConstraintError") {
      console.error("Error de restricción de clave foránea. Probablemente una categoría no existe en la base de datos local.");
      console.error("Detalles:", {
        name: err.name,
        message: err.message,
        sql: err.sql,
        table: err.table || "Desconocida"
      });
      return {
        updated: 0,
        added: 0,
        skipped: 0,
        error: "Error de restricción de clave foránea. Las categorías referenciadas por los productos no existen en la base de datos local."
      };
    }
    throw err;
  }
}
async function purgeDeletedProducts() {
  try {
    const deleted = await Product.findAll({
      where: { deletedLocally: true }
    });
    for (const product of deleted) {
      await product.destroy();
    }
    return deleted.length;
  } catch (err) {
    console.error("Error al purgar productos eliminados:", err);
    return 0;
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
    const category = await Category.create({
      ...categoryData,
      modified: true
    });
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
    await category.update({
      ...categoryData,
      modified: true
    });
    return toJSON(category);
  } catch (error) {
    console.error("Error al actualizar la categoria: ", error);
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
async function updateCategoriesAfterSync(syncResults) {
  try {
    console.log("Procesando actualización de categorías después de sincronización");
    const result = {
      updated: 0,
      added: 0,
      skipped: 0
    };
    if (!syncResults.serverCategories || !Array.isArray(syncResults.serverCategories)) {
      console.warn("No hay categorías del servidor para actualizar");
      return result;
    }
    for (const serverCategory of syncResults.serverCategories) {
      try {
        let existingCategory = await Category.findOne({
          where: { name: serverCategory.name }
        });
        if (existingCategory) {
          await existingCategory.update({
            ...serverCategory,
            synced: true,
            deletedLocally: false
          });
          result.updated++;
        } else {
          await Category.create({
            ...serverCategory,
            synced: true
          });
          result.added++;
        }
      } catch (categoryError) {
        console.error(`Error al procesar categoría ${serverCategory.name}:`, categoryError);
        result.skipped++;
      }
    }
    console.log(`Sincronización de categorías completada: ${result.updated} actualizadas, ${result.added} agregadas, ${result.skipped} omitidas`);
    return result;
  } catch (error) {
    console.error("Error al actualizar categorías después de sincronización:", error);
    throw error;
  }
}
async function purgeDeletedCategories() {
  try {
    const categoriesToDelete = await Category.findAll({
      where: {
        deletedLocally: true
      }
    });
    console.log(`Encontradas ${categoriesToDelete.length} categorías a purgar`);
    for (const category of categoriesToDelete) {
      await category.destroy();
    }
    return categoriesToDelete.length;
  } catch (error) {
    console.error("Error al purgar categorías eliminadas:", error);
    return 0;
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
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename$1);
const isPackaged = app.isPackaged;
const isProd = isPackaged || process$1.env.NODE_ENV === "production";
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
        path.join(process$1.resourcesPath, "preload-simple.js"),
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
            path.join(process$1.cwd(), "dist/index.html"),
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
                  cwd: ${process$1.cwd()}
                  appPath: ${app.getAppPath()}
                  resourcesPath: ${process$1.resourcesPath || "N/A"}
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
    try {
      console.log("Manejador: Obteniendo todos los productos");
      const products = await getAllProducts();
      console.log("Productos obtenidos:", products.length);
      return products;
    } catch (error) {
      console.error("Error al obtener productos:", error);
      return [];
    }
  });
  ipcMain.handle("get-all-active-products", async () => {
    try {
      console.log("Manejador: Obteniendo productos activos");
      const products = await getAllActiveProducts();
      console.log("Productos activos obtenidos:", products.length);
      return products;
    } catch (error) {
      console.error("Error al obtener productos activos:", error);
      return [];
    }
  });
  ipcMain.handle("get-product-by-id", async (_, id) => {
    try {
      console.log("Manejador: Obteniendo producto por ID:", id);
      const product = await getProductById(id);
      console.log("Producto por ID:", product);
      return product;
    } catch (error) {
      console.error("Error al obtener producto por ID:", error);
      return null;
    }
  });
  ipcMain.handle("get-product-by-barcode", async (_, barcode) => {
    try {
      console.log(
        "Manejador: Obteniendo producto por código de barras:",
        barcode
      );
      const product = await getProductByBarcode(barcode);
      console.log("Producto por código de barras:", product);
      return product;
    } catch (error) {
      console.error("Error al obtener producto por código:", error);
      return null;
    }
  });
  ipcMain.handle("create-product", async (_, productData) => {
    try {
      console.log("Manejador: Creando producto:", productData);
      const product = await createProduct(productData);
      console.log("Producto creado:", product);
      return product;
    } catch (error) {
      console.error("Error al crear producto:", error);
      return null;
    }
  });
  ipcMain.handle("update-product", async (_, payload) => {
    try {
      console.log("Manejador: Update product payload recibido:", payload);
      if (!payload || !payload.id) {
        console.error("Estructura de payload inválida:", payload);
        return null;
      }
      const { id, productData } = payload;
      console.log("Actualizando producto:", id, productData);
      const product = await updateProduct(id, productData);
      console.log("Producto actualizado:", product);
      return product;
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      return null;
    }
  });
  ipcMain.handle("delete-product", async (_, id) => {
    try {
      console.log("Manejador: Eliminando producto:", id);
      const result = await deleteProduct(id);
      console.log("Producto eliminado:", result);
      return result;
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      return false;
    }
  });
  ipcMain.handle("search-products", async (_, query) => {
    try {
      console.log("Manejador: Buscando productos:", query);
      const products = await searchProducts(query);
      console.log("Productos encontrados:", products.length);
      return products;
    } catch (error) {
      console.error("Error al buscar productos:", error);
      return [];
    }
  });
  ipcMain.handle("update-products-after-sync", async (_, syncResults) => {
    try {
      console.log(
        "Manejador: Actualizando productos después de sincronización"
      );
      const result = await updateProductsAfterSync(syncResults);
      console.log("Resultado de actualización post-sincronización:", result);
      return result;
    } catch (error) {
      console.error(
        "Error al actualizar productos después de sincronización:",
        error
      );
      throw error;
    }
  });
  ipcMain.handle("purge-deleted-products", async () => {
    try {
      console.log("Manejador: Purgando productos eliminados");
      const count = await purgeDeletedProducts();
      console.log("Productos purgados:", count);
      return count;
    } catch (error) {
      console.error("Error al purgar productos eliminados:", error);
      return 0;
    }
  });
  ipcMain.handle("get-all-categories", async () => {
    try {
      console.log("Manejador: Obteniendo todas las categorías");
      const categories = await getAllCategories();
      console.log("Categorías obtenidas:", categories.length);
      return categories;
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      return [];
    }
  });
  ipcMain.handle("get-category-by-id", async (_, id) => {
    try {
      console.log("Manejador: Obteniendo categoría por ID:", id);
      const category = await getCategoryById(id);
      console.log("Categoría por ID:", category);
      return category;
    } catch (error) {
      console.error("Error al obtener categoría por ID:", error);
      return null;
    }
  });
  ipcMain.handle("create-category", async (_, categoryData) => {
    try {
      console.log("Manejador: Creando categoría:", categoryData);
      const category = await createCategory(categoryData);
      console.log("Categoría creada:", category);
      return category;
    } catch (error) {
      console.error("Error al crear categoría:", error);
      return null;
    }
  });
  ipcMain.handle("update-category", async (_, payload) => {
    try {
      console.log("Manejador: Update category payload recibido:", payload);
      if (!payload || !payload.id) {
        console.error(
          "Estructura de payload inválida para categoría:",
          payload
        );
        return null;
      }
      const { id, categoryData } = payload;
      console.log("Actualizando categoría:", id, categoryData);
      const category = await updateCategory(id, categoryData);
      console.log("Categoría actualizada:", category);
      return category;
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      return null;
    }
  });
  ipcMain.handle("delete-category", async (_, id) => {
    try {
      console.log("Manejador: Eliminando categoría:", id);
      const result = await deleteCategory(id);
      console.log("Categoría eliminada:", result);
      return result;
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      return false;
    }
  });
  ipcMain.handle("update-categories-after-sync", async (_, syncResults) => {
    try {
      console.log("Manejador: Actualizando categorías después de sincronización");
      const result = await updateCategoriesAfterSync(syncResults);
      console.log("Resultado de actualización de categorías post-sincronización:", result);
      return result;
    } catch (error) {
      console.error("Error al actualizar categorías después de sincronización:", error);
      return { updated: 0, added: 0, skipped: 0 };
    }
  });
  ipcMain.handle("purge-deleted-categories", async () => {
    try {
      console.log("Manejador: Purgando categorías eliminadas");
      const count = await purgeDeletedCategories();
      console.log("Categorías purgadas:", count);
      return count;
    } catch (error) {
      console.error("Error al purgar categorías eliminadas:", error);
      return 0;
    }
  });
  console.log("Manejadores IPC configurados correctamente");
}
async function setupDatabase() {
  try {
    console.log("Inicializando base de datos...");
    await initDatabase();
    console.log("Base de datos inicializada correctamente");
    try {
      await up(sequelize.getQueryInterface(), Sequelize);
      console.log("Migraciones aplicadas correctamente");
    } catch (migrationError) {
      console.error(
        "Error al aplicar migraciones (no crítico):",
        migrationError
      );
    }
    return true;
  } catch (error) {
    console.error("Error crítico al inicializar la base de datos:", error);
    if (mainWindow) {
      mainWindow.loadURL(`data:text/html,
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
  console.log("Ambiente:", process$1.env.NODE_ENV || "development");
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
  if (process$1.platform !== "darwin") app.quit();
});
app.on("activate", function() {
  if (mainWindow === null) createWindow();
});
process$1.on("uncaughtException", (error) => {
  console.error("Error no capturado:", error);
});
process$1.on("unhandledRejection", (reason, promise) => {
  console.error(`Promesa ${promise} rechazada no manejada:`, reason);
});
