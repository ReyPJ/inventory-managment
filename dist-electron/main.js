import { app as A, ipcMain as $, BrowserWindow as Pe } from "electron";
import w from "path";
import { fileURLToPath as Oe } from "url";
import v from "process";
import { Sequelize as F, DataTypes as I, Op as B } from "sequelize";
import x from "fs";
import je from "util";
import Ce from "os";
function Ae(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var M = { exports: {} };
function we(e) {
  throw new Error('Could not dynamically require "' + e + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var z = {}, ae;
function S() {
  return ae || (ae = 1, z.getBooleanOption = (e, r) => {
    let o = !1;
    if (r in e && typeof (o = e[r]) != "boolean")
      throw new TypeError(`Expected the "${r}" option to be a boolean`);
    return o;
  }, z.cppdb = Symbol(), z.inspect = Symbol.for("nodejs.util.inspect.custom")), z;
}
var G, ne;
function Ee() {
  if (ne) return G;
  ne = 1;
  const e = { value: "SqliteError", writable: !0, enumerable: !1, configurable: !0 };
  function r(o, i) {
    if (new.target !== r)
      return new r(o, i);
    if (typeof i != "string")
      throw new TypeError("Expected second argument to be a string");
    Error.call(this, o), e.value = "" + o, Object.defineProperty(this, "message", e), Error.captureStackTrace(this, r), this.code = i;
  }
  return Object.setPrototypeOf(r, Error), Object.setPrototypeOf(r.prototype, Error.prototype), Object.defineProperty(r.prototype, "name", e), G = r, G;
}
var U = { exports: {} }, J, ie;
function De() {
  if (ie) return J;
  ie = 1;
  var e = w.sep || "/";
  J = r;
  function r(o) {
    if (typeof o != "string" || o.length <= 7 || o.substring(0, 7) != "file://")
      throw new TypeError("must pass in a file:// URI to convert to a file path");
    var i = decodeURI(o.substring(7)), n = i.indexOf("/"), a = i.substring(0, n), s = i.substring(n + 1);
    return a == "localhost" && (a = ""), a && (a = e + e + a), s = s.replace(/^(.+)\|/, "$1:"), e == "\\" && (s = s.replace(/\//g, "\\")), /^.+\:/.test(s) || (s = e + s), a + s;
  }
  return J;
}
var ce;
function _e() {
  return ce || (ce = 1, function(e, r) {
    var o = x, i = w, n = De(), a = i.join, s = i.dirname, u = o.accessSync && function(t) {
      try {
        o.accessSync(t);
      } catch {
        return !1;
      }
      return !0;
    } || o.existsSync || i.existsSync, g = {
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
    function b(t) {
      typeof t == "string" ? t = { bindings: t } : t || (t = {}), Object.keys(g).map(function(m) {
        m in t || (t[m] = g[m]);
      }), t.module_root || (t.module_root = r.getRoot(r.getFileName())), i.extname(t.bindings) != ".node" && (t.bindings += ".node");
      for (var p = typeof __webpack_require__ == "function" ? __non_webpack_require__ : we, c = [], l = 0, d = t.try.length, y, h, f; l < d; l++) {
        y = a.apply(
          null,
          t.try[l].map(function(m) {
            return t[m] || m;
          })
        ), c.push(y);
        try {
          return h = t.path ? p.resolve(y) : p(y), t.path || (h.path = y), h;
        } catch (m) {
          if (m.code !== "MODULE_NOT_FOUND" && m.code !== "QUALIFIED_PATH_RESOLUTION_FAILED" && !/not find/i.test(m.message))
            throw m;
        }
      }
      throw f = new Error(
        `Could not locate the bindings file. Tried:
` + c.map(function(m) {
          return t.arrow + m;
        }).join(`
`)
      ), f.tries = c, f;
    }
    e.exports = r = b, r.getFileName = function(p) {
      var c = Error.prepareStackTrace, l = Error.stackTraceLimit, d = {}, y;
      Error.stackTraceLimit = 10, Error.prepareStackTrace = function(f, m) {
        for (var C = 0, te = m.length; C < te; C++)
          if (y = m[C].getFileName(), y !== __filename)
            if (p) {
              if (y !== p)
                return;
            } else
              return;
      }, Error.captureStackTrace(d), d.stack, Error.prepareStackTrace = c, Error.stackTraceLimit = l;
      var h = "file://";
      return y.indexOf(h) === 0 && (y = n(y)), y;
    }, r.getRoot = function(p) {
      for (var c = s(p), l; ; ) {
        if (c === "." && (c = process.cwd()), u(a(c, "package.json")) || u(a(c, "node_modules")))
          return c;
        if (l === c)
          throw new Error(
            'Could not find module root given file: "' + p + '". Do you have a `package.json` file? '
          );
        l = c, c = a(c, "..");
      }
    };
  }(U, U.exports)), U.exports;
}
var _ = {}, le;
function Se() {
  if (le) return _;
  le = 1;
  const { cppdb: e } = S();
  return _.prepare = function(o) {
    return this[e].prepare(o, this, !1);
  }, _.exec = function(o) {
    return this[e].exec(o), this;
  }, _.close = function() {
    return this[e].close(), this;
  }, _.loadExtension = function(...o) {
    return this[e].loadExtension(...o), this;
  }, _.defaultSafeIntegers = function(...o) {
    return this[e].defaultSafeIntegers(...o), this;
  }, _.unsafeMode = function(...o) {
    return this[e].unsafeMode(...o), this;
  }, _.getters = {
    name: {
      get: function() {
        return this[e].name;
      },
      enumerable: !0
    },
    open: {
      get: function() {
        return this[e].open;
      },
      enumerable: !0
    },
    inTransaction: {
      get: function() {
        return this[e].inTransaction;
      },
      enumerable: !0
    },
    readonly: {
      get: function() {
        return this[e].readonly;
      },
      enumerable: !0
    },
    memory: {
      get: function() {
        return this[e].memory;
      },
      enumerable: !0
    }
  }, _;
}
var H, se;
function Le() {
  if (se) return H;
  se = 1;
  const { cppdb: e } = S(), r = /* @__PURE__ */ new WeakMap();
  H = function(a) {
    if (typeof a != "function") throw new TypeError("Expected first argument to be a function");
    const s = this[e], u = o(s, this), { apply: g } = Function.prototype, b = {
      default: { value: i(g, a, s, u.default) },
      deferred: { value: i(g, a, s, u.deferred) },
      immediate: { value: i(g, a, s, u.immediate) },
      exclusive: { value: i(g, a, s, u.exclusive) },
      database: { value: this, enumerable: !0 }
    };
    return Object.defineProperties(b.default.value, b), Object.defineProperties(b.deferred.value, b), Object.defineProperties(b.immediate.value, b), Object.defineProperties(b.exclusive.value, b), b.default.value;
  };
  const o = (n, a) => {
    let s = r.get(n);
    if (!s) {
      const u = {
        commit: n.prepare("COMMIT", a, !1),
        rollback: n.prepare("ROLLBACK", a, !1),
        savepoint: n.prepare("SAVEPOINT `	_bs3.	`", a, !1),
        release: n.prepare("RELEASE `	_bs3.	`", a, !1),
        rollbackTo: n.prepare("ROLLBACK TO `	_bs3.	`", a, !1)
      };
      r.set(n, s = {
        default: Object.assign({ begin: n.prepare("BEGIN", a, !1) }, u),
        deferred: Object.assign({ begin: n.prepare("BEGIN DEFERRED", a, !1) }, u),
        immediate: Object.assign({ begin: n.prepare("BEGIN IMMEDIATE", a, !1) }, u),
        exclusive: Object.assign({ begin: n.prepare("BEGIN EXCLUSIVE", a, !1) }, u)
      });
    }
    return s;
  }, i = (n, a, s, { begin: u, commit: g, rollback: b, savepoint: t, release: p, rollbackTo: c }) => function() {
    let d, y, h;
    s.inTransaction ? (d = t, y = p, h = c) : (d = u, y = g, h = b), d.run();
    try {
      const f = n.call(a, this, arguments);
      return y.run(), f;
    } catch (f) {
      throw s.inTransaction && (h.run(), h !== b && y.run()), f;
    }
  };
  return H;
}
var W, de;
function Ne() {
  if (de) return W;
  de = 1;
  const { getBooleanOption: e, cppdb: r } = S();
  return W = function(i, n) {
    if (n == null && (n = {}), typeof i != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof n != "object") throw new TypeError("Expected second argument to be an options object");
    const a = e(n, "simple"), s = this[r].prepare(`PRAGMA ${i}`, this, !0);
    return a ? s.pluck().get() : s.all();
  }, W;
}
var K, ue;
function Re() {
  if (ue) return K;
  ue = 1;
  const e = x, r = w, { promisify: o } = je, { cppdb: i } = S(), n = o(e.access);
  K = async function(u, g) {
    if (g == null && (g = {}), typeof u != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof g != "object") throw new TypeError("Expected second argument to be an options object");
    u = u.trim();
    const b = "attached" in g ? g.attached : "main", t = "progress" in g ? g.progress : null;
    if (!u) throw new TypeError("Backup filename cannot be an empty string");
    if (u === ":memory:") throw new TypeError('Invalid backup filename ":memory:"');
    if (typeof b != "string") throw new TypeError('Expected the "attached" option to be a string');
    if (!b) throw new TypeError('The "attached" option cannot be an empty string');
    if (t != null && typeof t != "function") throw new TypeError('Expected the "progress" option to be a function');
    await n(r.dirname(u)).catch(() => {
      throw new TypeError("Cannot save backup because the directory does not exist");
    });
    const p = await n(u).then(() => !1, () => !0);
    return a(this[i].backup(this, b, u, p), t || null);
  };
  const a = (s, u) => {
    let g = 0, b = !0;
    return new Promise((t, p) => {
      setImmediate(function c() {
        try {
          const l = s.transfer(g);
          if (!l.remainingPages) {
            s.close(), t(l);
            return;
          }
          if (b && (b = !1, g = 100), u) {
            const d = u(l);
            if (d !== void 0)
              if (typeof d == "number" && d === d) g = Math.max(0, Math.min(2147483647, Math.round(d)));
              else throw new TypeError("Expected progress callback to return a number or undefined");
          }
          setImmediate(c);
        } catch (l) {
          s.close(), p(l);
        }
      });
    });
  };
  return K;
}
var X, pe;
function qe() {
  if (pe) return X;
  pe = 1;
  const { cppdb: e } = S();
  return X = function(o) {
    if (o == null && (o = {}), typeof o != "object") throw new TypeError("Expected first argument to be an options object");
    const i = "attached" in o ? o.attached : "main";
    if (typeof i != "string") throw new TypeError('Expected the "attached" option to be a string');
    if (!i) throw new TypeError('The "attached" option cannot be an empty string');
    return this[e].serialize(i);
  }, X;
}
var Q, fe;
function ze() {
  if (fe) return Q;
  fe = 1;
  const { getBooleanOption: e, cppdb: r } = S();
  return Q = function(i, n, a) {
    if (n == null && (n = {}), typeof n == "function" && (a = n, n = {}), typeof i != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof a != "function") throw new TypeError("Expected last argument to be a function");
    if (typeof n != "object") throw new TypeError("Expected second argument to be an options object");
    if (!i) throw new TypeError("User-defined function name cannot be an empty string");
    const s = "safeIntegers" in n ? +e(n, "safeIntegers") : 2, u = e(n, "deterministic"), g = e(n, "directOnly"), b = e(n, "varargs");
    let t = -1;
    if (!b) {
      if (t = a.length, !Number.isInteger(t) || t < 0) throw new TypeError("Expected function.length to be a positive integer");
      if (t > 100) throw new RangeError("User-defined functions cannot have more than 100 arguments");
    }
    return this[r].function(a, i, t, s, u, g), this;
  }, Q;
}
var Y, ge;
function ke() {
  if (ge) return Y;
  ge = 1;
  const { getBooleanOption: e, cppdb: r } = S();
  Y = function(a, s) {
    if (typeof a != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof s != "object" || s === null) throw new TypeError("Expected second argument to be an options object");
    if (!a) throw new TypeError("User-defined function name cannot be an empty string");
    const u = "start" in s ? s.start : null, g = o(s, "step", !0), b = o(s, "inverse", !1), t = o(s, "result", !1), p = "safeIntegers" in s ? +e(s, "safeIntegers") : 2, c = e(s, "deterministic"), l = e(s, "directOnly"), d = e(s, "varargs");
    let y = -1;
    if (!d && (y = Math.max(i(g), b ? i(b) : 0), y > 0 && (y -= 1), y > 100))
      throw new RangeError("User-defined functions cannot have more than 100 arguments");
    return this[r].aggregate(u, g, b, t, a, y, p, c, l), this;
  };
  const o = (n, a, s) => {
    const u = a in n ? n[a] : null;
    if (typeof u == "function") return u;
    if (u != null) throw new TypeError(`Expected the "${a}" option to be a function`);
    if (s) throw new TypeError(`Missing required option "${a}"`);
    return null;
  }, i = ({ length: n }) => {
    if (Number.isInteger(n) && n >= 0) return n;
    throw new TypeError("Expected function.length to be a positive integer");
  };
  return Y;
}
var Z, ye;
function Be() {
  if (ye) return Z;
  ye = 1;
  const { cppdb: e } = S();
  Z = function(l, d) {
    if (typeof l != "string") throw new TypeError("Expected first argument to be a string");
    if (!l) throw new TypeError("Virtual table module name cannot be an empty string");
    let y = !1;
    if (typeof d == "object" && d !== null)
      y = !0, d = p(o(d, "used", l));
    else {
      if (typeof d != "function") throw new TypeError("Expected second argument to be a function or a table definition object");
      d = r(d);
    }
    return this[e].table(d, l, y), this;
  };
  function r(c) {
    return function(d, y, h, ...f) {
      const m = {
        module: d,
        database: y,
        table: h
      }, C = g.call(c, m, f);
      if (typeof C != "object" || C === null)
        throw new TypeError(`Virtual table module "${d}" did not return a table definition object`);
      return o(C, "returned", d);
    };
  }
  function o(c, l, d) {
    if (!u.call(c, "rows"))
      throw new TypeError(`Virtual table module "${d}" ${l} a table definition without a "rows" property`);
    if (!u.call(c, "columns"))
      throw new TypeError(`Virtual table module "${d}" ${l} a table definition without a "columns" property`);
    const y = c.rows;
    if (typeof y != "function" || Object.getPrototypeOf(y) !== b)
      throw new TypeError(`Virtual table module "${d}" ${l} a table definition with an invalid "rows" property (should be a generator function)`);
    let h = c.columns;
    if (!Array.isArray(h) || !(h = [...h]).every((j) => typeof j == "string"))
      throw new TypeError(`Virtual table module "${d}" ${l} a table definition with an invalid "columns" property (should be an array of strings)`);
    if (h.length !== new Set(h).size)
      throw new TypeError(`Virtual table module "${d}" ${l} a table definition with duplicate column names`);
    if (!h.length)
      throw new RangeError(`Virtual table module "${d}" ${l} a table definition with zero columns`);
    let f;
    if (u.call(c, "parameters")) {
      if (f = c.parameters, !Array.isArray(f) || !(f = [...f]).every((j) => typeof j == "string"))
        throw new TypeError(`Virtual table module "${d}" ${l} a table definition with an invalid "parameters" property (should be an array of strings)`);
    } else
      f = s(y);
    if (f.length !== new Set(f).size)
      throw new TypeError(`Virtual table module "${d}" ${l} a table definition with duplicate parameter names`);
    if (f.length > 32)
      throw new RangeError(`Virtual table module "${d}" ${l} a table definition with more than the maximum number of 32 parameters`);
    for (const j of f)
      if (h.includes(j))
        throw new TypeError(`Virtual table module "${d}" ${l} a table definition with column "${j}" which was ambiguously defined as both a column and parameter`);
    let m = 2;
    if (u.call(c, "safeIntegers")) {
      const j = c.safeIntegers;
      if (typeof j != "boolean")
        throw new TypeError(`Virtual table module "${d}" ${l} a table definition with an invalid "safeIntegers" property (should be a boolean)`);
      m = +j;
    }
    let C = !1;
    if (u.call(c, "directOnly") && (C = c.directOnly, typeof C != "boolean"))
      throw new TypeError(`Virtual table module "${d}" ${l} a table definition with an invalid "directOnly" property (should be a boolean)`);
    return [
      `CREATE TABLE x(${[
        ...f.map(t).map((j) => `${j} HIDDEN`),
        ...h.map(t)
      ].join(", ")});`,
      i(y, new Map(h.map((j, xe) => [j, f.length + xe])), d),
      f,
      m,
      C
    ];
  }
  function i(c, l, d) {
    return function* (...h) {
      const f = h.map((m) => Buffer.isBuffer(m) ? Buffer.from(m) : m);
      for (let m = 0; m < l.size; ++m)
        f.push(null);
      for (const m of c(...h))
        if (Array.isArray(m))
          n(m, f, l.size, d), yield f;
        else if (typeof m == "object" && m !== null)
          a(m, f, l, d), yield f;
        else
          throw new TypeError(`Virtual table module "${d}" yielded something that isn't a valid row object`);
    };
  }
  function n(c, l, d, y) {
    if (c.length !== d)
      throw new TypeError(`Virtual table module "${y}" yielded a row with an incorrect number of columns`);
    const h = l.length - d;
    for (let f = 0; f < d; ++f)
      l[f + h] = c[f];
  }
  function a(c, l, d, y) {
    let h = 0;
    for (const f of Object.keys(c)) {
      const m = d.get(f);
      if (m === void 0)
        throw new TypeError(`Virtual table module "${y}" yielded a row with an undeclared column "${f}"`);
      l[m] = c[f], h += 1;
    }
    if (h !== d.size)
      throw new TypeError(`Virtual table module "${y}" yielded a row with missing columns`);
  }
  function s({ length: c }) {
    if (!Number.isInteger(c) || c < 0)
      throw new TypeError("Expected function.length to be a positive integer");
    const l = [];
    for (let d = 0; d < c; ++d)
      l.push(`$${d + 1}`);
    return l;
  }
  const { hasOwnProperty: u } = Object.prototype, { apply: g } = Function.prototype, b = Object.getPrototypeOf(function* () {
  }), t = (c) => `"${c.replace(/"/g, '""')}"`, p = (c) => () => c;
  return Z;
}
var ee, he;
function Me() {
  if (he) return ee;
  he = 1;
  const e = function() {
  };
  return ee = function(o, i) {
    return Object.assign(new e(), this);
  }, ee;
}
var re, me;
function Ue() {
  if (me) return re;
  me = 1;
  const e = x, r = w, o = S(), i = Ee();
  let n;
  function a(u, g) {
    if (new.target == null)
      return new a(u, g);
    let b;
    if (Buffer.isBuffer(u) && (b = u, u = ":memory:"), u == null && (u = ""), g == null && (g = {}), typeof u != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof g != "object") throw new TypeError("Expected second argument to be an options object");
    if ("readOnly" in g) throw new TypeError('Misspelled option "readOnly" should be "readonly"');
    if ("memory" in g) throw new TypeError('Option "memory" was removed in v7.0.0 (use ":memory:" filename instead)');
    const t = u.trim(), p = t === "" || t === ":memory:", c = o.getBooleanOption(g, "readonly"), l = o.getBooleanOption(g, "fileMustExist"), d = "timeout" in g ? g.timeout : 5e3, y = "verbose" in g ? g.verbose : null, h = "nativeBinding" in g ? g.nativeBinding : null;
    if (c && p && !b) throw new TypeError("In-memory/temporary databases cannot be readonly");
    if (!Number.isInteger(d) || d < 0) throw new TypeError('Expected the "timeout" option to be a positive integer');
    if (d > 2147483647) throw new RangeError('Option "timeout" cannot be greater than 2147483647');
    if (y != null && typeof y != "function") throw new TypeError('Expected the "verbose" option to be a function');
    if (h != null && typeof h != "string" && typeof h != "object") throw new TypeError('Expected the "nativeBinding" option to be a string or addon object');
    let f;
    if (h == null ? f = n || (n = _e()("better_sqlite3.node")) : typeof h == "string" ? f = (typeof __non_webpack_require__ == "function" ? __non_webpack_require__ : we)(r.resolve(h).replace(/(\.node)?$/, ".node")) : f = h, f.isInitialized || (f.setErrorConstructor(i), f.isInitialized = !0), !p && !e.existsSync(r.dirname(t)))
      throw new TypeError("Cannot open database because the directory does not exist");
    Object.defineProperties(this, {
      [o.cppdb]: { value: new f.Database(t, u, p, c, l, d, y || null, b || null) },
      ...s.getters
    });
  }
  const s = Se();
  return a.prototype.prepare = s.prepare, a.prototype.transaction = Le(), a.prototype.pragma = Ne(), a.prototype.backup = Re(), a.prototype.serialize = qe(), a.prototype.function = ze(), a.prototype.aggregate = ke(), a.prototype.table = Be(), a.prototype.loadExtension = s.loadExtension, a.prototype.exec = s.exec, a.prototype.close = s.close, a.prototype.defaultSafeIntegers = s.defaultSafeIntegers, a.prototype.unsafeMode = s.unsafeMode, a.prototype[o.inspect] = Me(), re = a, re;
}
var be;
function Ve() {
  return be || (be = 1, M.exports = Ue(), M.exports.SqliteError = Ee()), M.exports;
}
var Fe = Ve();
const Ge = /* @__PURE__ */ Ae(Fe), ve = v.env.NODE_ENV === "production" || typeof v.versions == "object" && typeof v.versions.electron == "string";
console.log("¿Modo empaquetado?:", ve);
let D, V;
if (ve)
  try {
    v.env.APPDATA ? V = v.env.APPDATA : v.platform === "darwin" ? V = w.join(
      v.env.HOME,
      "/Library/Application Support"
    ) : V = w.join(v.env.HOME, "/.local/share");
    const e = w.join(V, "sistema-inventario");
    if (!x.existsSync(e))
      try {
        x.mkdirSync(e, { recursive: !0 }), console.log("Directorio creado:", e);
      } catch (r) {
        console.error("Error al crear directorio de datos:", r);
      }
    D = w.join(e, "inventory-database.sqlite"), console.log("Ruta de base de datos en producción:", D);
  } catch (e) {
    console.error("Error al obtener ruta de datos:", e);
    try {
      v.resourcesPath ? D = w.join(v.resourcesPath, "database.sqlite") : D = w.join(w.dirname(v.execPath), "database.sqlite"), console.log("Usando ruta fallback para base de datos:", D);
    } catch (r) {
      console.error("Error en fallback de ruta:", r), D = w.join(Ce.tmpdir(), "inventory-database.sqlite"), console.log("Usando ruta temporal para base de datos:", D);
    }
  }
else
  D = w.join(v.cwd(), "database.sqlite"), console.log("Ruta de base de datos en desarrollo:", D);
const N = new F({
  dialect: "sqlite",
  storage: D,
  logging: !1,
  // Cambiar a console.log para ver consultas SQL durante depuración
  dialectOptions: {
    // Usar better-sqlite3 que es más confiable en Electron
    dialectModule: Ge
  }
});
N.authenticate().then(() => {
  console.log("Conexión a la base de datos establecida correctamente.");
}).catch((e) => {
  console.error("Error al conectar a la base de datos:", e);
});
const P = N.define("Product", {
  id: {
    type: I.INTEGER,
    primaryKey: !0,
    autoIncrement: !0
  },
  barcode: {
    type: I.STRING,
    allowNull: !1,
    unique: !0
  },
  name: {
    type: I.STRING,
    allowNull: !1
  },
  description: {
    type: I.TEXT,
    allowNull: !0
  },
  price: {
    type: I.DECIMAL(10, 2),
    allowNull: !1,
    defaultValue: 0
  },
  stock: {
    type: I.INTEGER,
    allowNull: !1,
    defaultValue: 0
  },
  synced: {
    type: I.BOOLEAN,
    defaultValue: !1
  },
  modified: {
    type: I.BOOLEAN,
    defaultValue: !0
  },
  deletedLocally: {
    type: I.BOOLEAN,
    defaultValue: !1
  },
  lastSync: {
    type: I.DATE,
    allowNull: !0
  },
  syncError: {
    type: I.TEXT,
    allowNull: !0
  },
  remoteId: {
    type: I.INTEGER,
    allowNull: !0
  },
  CategoryId: {
    type: I.INTEGER,
    allowNull: !0,
    references: {
      model: "Categories",
      key: "id"
    }
  }
}), E = N.define("Category", {
  id: {
    type: I.INTEGER,
    primaryKey: !0,
    autoIncrement: !0
  },
  name: {
    type: I.STRING,
    allowNull: !1,
    unique: !0
  },
  description: {
    type: I.TEXT,
    allowNull: !0
  },
  synced: {
    type: I.BOOLEAN,
    defaultValue: !1
  },
  modified: {
    type: I.BOOLEAN,
    defaultValue: !0
  },
  deletedLocally: {
    type: I.BOOLEAN,
    defaultValue: !1
  }
});
E.hasMany(P);
P.belongsTo(E);
async function Je() {
  try {
    await N.sync();
    const e = ["PS4", "PS5"];
    for (const r of e)
      await E.findOrCreate({
        where: { name: r }
      });
    return console.log("Base de datos inicializada correctamente"), !0;
  } catch (e) {
    return console.error("Error al inicializar la base de datos:", e), !1;
  }
}
const He = /* @__PURE__ */ new Set(), oe = /* @__PURE__ */ new Set(), Te = (e) => {
  e && (He.add(e), console.log(`Producto ID ${e} marcado como eliminado localmente`));
}, We = (e) => {
  if (!e) {
    console.error("No se puede marcar como eliminada una categoría sin ID");
    return;
  }
  const r = Number(e);
  oe.add(r), console.log(`Categoría ID ${r} marcada como eliminada localmente`), console.log(`Estado actual de categorías eliminadas: ${Array.from(oe)}`);
  try {
    const o = Array.from(oe);
    localStorage.setItem("locallyDeletedCategoryIds", JSON.stringify(o)), console.log(`IDs de categorías eliminadas guardados en localStorage: ${o}`);
  } catch (o) {
    console.error("Error guardando IDs de categorías eliminadas:", o);
  }
}, Ke = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  markCategoryAsDeleted: We,
  markProductAsDeleted: Te
}, Symbol.toStringTag, { value: "Module" })), R = (e) => e ? JSON.parse(JSON.stringify(e)) : null;
async function Xe() {
  try {
    const e = await P.findAll({
      include: [E],
      order: [["updatedAt", "DESC"]]
    });
    return R(e);
  } catch (e) {
    return console.error("Error al obtener productos:", e), [];
  }
}
async function Qe() {
  try {
    const e = await P.findAll({
      where: {
        deletedLocally: !1
      },
      include: [E],
      order: [["updatedAt", "DESC"]]
    });
    return R(e);
  } catch (e) {
    return console.error("Error al obtener productos activos:", e), [];
  }
}
async function Ye(e) {
  try {
    const r = await P.findByPk(e, {
      include: [E]
    });
    return R(r);
  } catch (r) {
    return console.error("Error al obtener el producto:", r), null;
  }
}
async function Ze(e) {
  try {
    const r = await P.findOne({
      where: {
        barcode: e,
        deletedLocally: !1
        // Solo buscar en productos activos
      },
      include: [E]
    });
    return R(r);
  } catch (r) {
    return console.error("Error al obtener el producto por codigo de barras:", r), null;
  }
}
async function er(e) {
  try {
    const r = {
      ...e,
      modified: !0,
      synced: !1
    }, o = await P.create(r);
    return R(o);
  } catch (r) {
    throw console.error("Error al crear el producto:", r), r;
  }
}
async function rr(e, r) {
  try {
    const o = await P.findByPk(e);
    if (!o) return null;
    const i = {
      ...r,
      modified: !0,
      synced: !1
    };
    return await o.update(i), R(o);
  } catch (o) {
    throw console.error("Error al actualizar el producto:", o), o;
  }
}
async function or(e) {
  try {
    const r = await P.findByPk(e);
    return r ? (await r.update({
      deletedLocally: !0,
      modified: !0,
      synced: !1
    }), Te(e), !0) : !1;
  } catch (r) {
    return console.error("Error al eliminar el producto:", r), !1;
  }
}
async function tr(e) {
  try {
    const r = await P.findAll({
      where: {
        [B.and]: [
          {
            [B.or]: [
              { name: { [B.like]: `%${e}%` } },
              { barcode: { [B.like]: `%${e}%` } }
            ]
          },
          { deletedLocally: !1 }
          // Solo buscar en productos activos
        ]
      },
      include: [E]
    });
    return R(r);
  } catch (r) {
    return console.error("Error al buscar productos:", r), [];
  }
}
async function ar(e) {
  try {
    const { syncedProducts: r, serverProducts: o } = e;
    let i = 0, n = 0, a = 0;
    const s = [], u = {};
    try {
      (await E.findAll()).forEach((p) => {
        u[p.id] = p;
      }), console.log(`Categorías disponibles en BD local: ${Object.keys(u).length}`), console.log(`IDs de categorías: ${Object.keys(u).join(", ")}`);
    } catch (t) {
      console.error("Error al obtener categorías para el mapa:", t);
    }
    if (r && r.created && Array.isArray(r.created)) {
      console.log(`Procesando ${r.created.length} productos creados`);
      for (const t of r.created)
        try {
          const p = await P.findOne({
            where: { barcode: t.barcode }
          });
          if (p) {
            const c = {
              synced: !0,
              modified: !1,
              lastSync: /* @__PURE__ */ new Date(),
              syncError: null,
              remoteId: t.id
            };
            if (t.CategoryId || t.category_id) {
              const l = t.CategoryId || t.category_id;
              u[l] ? (console.log(`Asignando categoría ${l} a producto ${t.name}`), c.CategoryId = l) : console.log(`Categoría ${l} no encontrada para producto ${t.name}`);
            }
            await p.update(c), i++;
          }
        } catch (p) {
          console.error(`Error al actualizar producto creado ${t.barcode}:`, p), s.push({
            barcode: t.barcode,
            name: t.name || "Nombre desconocido",
            reason: "error_actualizacion_producto_creado",
            error: p.message
          }), a++;
        }
    }
    if (r && r.updated && Array.isArray(r.updated)) {
      console.log(`Procesando ${r.updated.length} productos actualizados`);
      for (const t of r.updated)
        try {
          const p = await P.findOne({
            where: { barcode: t.barcode }
          });
          if (p) {
            const c = {
              synced: !0,
              modified: !1,
              lastSync: /* @__PURE__ */ new Date(),
              syncError: null,
              remoteId: t.id
            };
            if (t.CategoryId || t.category_id) {
              const l = t.CategoryId || t.category_id;
              u[l] ? (console.log(`Asignando categoría ${l} a producto ${t.name}`), c.CategoryId = l) : console.log(`Categoría ${l} no encontrada para producto ${t.name}`);
            }
            await p.update(c), i++;
          }
        } catch (p) {
          console.error(`Error al actualizar producto ${t.barcode}:`, p), s.push({
            barcode: t.barcode,
            name: t.name || "Nombre desconocido",
            reason: "error_actualizacion_producto_existente",
            error: p.message
          }), a++;
        }
    }
    const b = (await P.findAll({
      where: { deletedLocally: !0 }
    })).map((t) => t.barcode);
    if (console.log(
      `Verificando ${(o == null ? void 0 : o.length) || 0} productos del servidor contra ${b.length} códigos eliminados localmente`
    ), o && Array.isArray(o))
      for (const t of o)
        try {
          const p = await P.findOne({
            where: { barcode: t.barcode }
          });
          if (b.includes(t.barcode)) {
            console.log(
              `Producto con barcode ${t.barcode} no agregado porque fue eliminado localmente`
            ), s.push({
              barcode: t.barcode,
              name: t.name,
              reason: "eliminado_localmente",
              id: t.id
            }), a++;
            continue;
          }
          if (p) {
            if ((t.CategoryId || t.category_id) && p.CategoryId !== (t.CategoryId || t.category_id)) {
              const c = t.CategoryId || t.category_id;
              u[c] && (console.log(`Actualizando CategoryId de producto existente ${p.name} a ${c}`), await p.update({
                CategoryId: c,
                synced: !0,
                modified: !1,
                lastSync: /* @__PURE__ */ new Date()
              }), i++);
            }
          } else {
            let c = {
              ...t,
              synced: !0,
              modified: !1,
              deletedLocally: !1,
              lastSync: /* @__PURE__ */ new Date(),
              remoteId: t.id
            };
            if (t.CategoryId || t.category_id) {
              const l = t.CategoryId || t.category_id;
              l === "N/A" || l === null || l === void 0 ? (console.log(`Categoría inválida para producto ${t.name}: ${l}`), c.CategoryId = null) : u[l] ? (console.log(`Asignando categoría ${l} a nuevo producto ${t.name}`), c.CategoryId = l) : (console.log(`Categoría ${l} no encontrada para producto ${t.name}`), console.log(`CATEGORÍA FALTANTE: El producto ${t.name} (${t.barcode}) requiere la categoría ID=${l} que no existe localmente`), s.push({
                barcode: t.barcode,
                name: t.name,
                reason: "categoria_no_encontrada",
                categoryId: l
              }), c.CategoryId = null);
            } else
              console.log(`Producto ${t.name} no tiene categoría asignada`);
            try {
              (!c.id || c.id === "N/A") && (console.log(`⚠️ PRODUCTO SIN ID: ${c.name} (${c.barcode})`), delete c.id);
              const l = await P.create(c);
              console.log(`Producto creado: ${JSON.stringify({
                id: l.id,
                name: l.name,
                CategoryId: l.CategoryId
              })}`), n++;
            } catch (l) {
              console.error(`Error al crear producto ${c.name} (${c.barcode}):`, l), console.error("Detalles del producto con error:", JSON.stringify(c, null, 2)), s.push({
                barcode: t.barcode,
                name: t.name,
                reason: "error_validacion",
                error: l.message,
                details: {
                  id: c.id || "N/A",
                  fields: Object.keys(c).join(", ")
                }
              }), a++;
            }
          }
        } catch (p) {
          console.error(`Error procesando producto ${t.barcode}:`, p), s.push({
            barcode: t.barcode,
            name: t.name || "Nombre desconocido",
            reason: "error_procesamiento",
            error: p.message
          }), a++;
        }
    return s.length > 0 && (console.log("=========================================="), console.log(`DETALLE DE PRODUCTOS OMITIDOS (${s.length}):`), s.forEach((t, p) => {
      console.log(`Producto omitido #${p + 1}:`), console.log(`  ID: ${t.id || "N/A"}`), console.log(`  Barcode: ${t.barcode}`), console.log(`  Nombre: ${t.name}`), console.log(`  Razón: ${t.reason}`), t.error && console.log(`  Error: ${t.error}`);
    }), console.log("==========================================")), { updated: i, added: n, skipped: a, skippedProducts: s };
  } catch (r) {
    if (console.error(
      "Error al actualizar productos después de sincronización:",
      r
    ), r.name === "SequelizeForeignKeyConstraintError")
      return console.error("Error de restricción de clave foránea. Probablemente una categoría no existe en la base de datos local."), console.error("Detalles:", {
        name: r.name,
        message: r.message,
        sql: r.sql,
        table: r.table || "Desconocida"
      }), {
        updated: 0,
        added: 0,
        skipped: 0,
        error: "Error de restricción de clave foránea. Las categorías referenciadas por los productos no existen en la base de datos local."
      };
    throw r;
  }
}
async function nr() {
  try {
    const e = await P.findAll({
      where: { deletedLocally: !0 }
    });
    for (const r of e)
      await r.destroy();
    return e.length;
  } catch (e) {
    return console.error("Error al purgar productos eliminados:", e), 0;
  }
}
function k(e) {
  return e ? Array.isArray(e) ? e.map((r) => r.toJSON ? r.toJSON() : r) : e.toJSON ? e.toJSON() : e : null;
}
async function ir() {
  try {
    try {
      const e = await E.findAll({
        where: {
          deletedLocally: !1
        }
      });
      return k(e) || [];
    } catch (e) {
      console.error("Error al filtrar por deletedLocally, obteniendo todas las categorías:", e);
      const r = await E.findAll();
      return k(r) || [];
    }
  } catch (e) {
    return console.error("Error al obtener las categorias: ", e), [];
  }
}
async function cr(e) {
  try {
    const r = await E.findByPk(e);
    return k(r);
  } catch (r) {
    return console.error("Error al obtener la categoria:", r), null;
  }
}
async function lr(e) {
  try {
    const r = await E.create({
      ...e,
      modified: !0
    });
    return k(r);
  } catch (r) {
    throw console.error("Error al crear la categoria:", r), r;
  }
}
async function sr(e, r) {
  try {
    const o = await E.findByPk(e);
    return o ? (await o.update({
      ...r,
      modified: !0
    }), k(o)) : null;
  } catch (o) {
    throw console.error("Error al actualizar la categoria: ", o), o;
  }
}
async function dr(e) {
  try {
    const r = await E.findByPk(e);
    if (!r) return null;
    await r.update({
      deletedLocally: !0,
      modified: !0,
      synced: !1
    });
    try {
      const { markCategoryAsDeleted: o } = await Promise.resolve().then(() => Ke);
      typeof o == "function" && o(e);
    } catch (o) {
      console.error("Error al registrar categoría eliminada en servicio de sincronización:", o);
    }
    return !0;
  } catch (r) {
    return console.error("Error al eliminar la categoria:", r), !1;
  }
}
async function ur(e) {
  try {
    console.log("Procesando actualización de categorías después de sincronización");
    const r = {
      updated: 0,
      added: 0,
      skipped: 0
    }, { categoriesToUpdateLocally: o } = e;
    if (!o)
      return console.warn("No hay datos de categorías para actualizar localmente"), r;
    if (console.log("Datos de categorías a actualizar:", JSON.stringify(o)), o.created && Array.isArray(o.created)) {
      console.log(`Procesando ${o.created.length} categorías nuevas`);
      for (const i of o.created)
        try {
          let n = await E.findOne({
            where: { name: i.name }
          });
          if (n)
            await n.update({
              ...i,
              synced: !0,
              modified: !1
            }), console.log(`Categoría actualizada: ${n.name}, ID: ${n.id}`), r.updated++;
          else {
            const a = await E.create({
              ...i,
              synced: !0,
              modified: !1
            });
            console.log(`Categoría creada: ${a.name}, ID: ${a.id}`), r.added++;
          }
        } catch (n) {
          console.error(`Error al procesar categoría nueva ${i.name}:`, n), r.skipped++;
        }
    }
    if (o.updated && Array.isArray(o.updated)) {
      console.log(`Procesando ${o.updated.length} categorías actualizadas`);
      for (const i of o.updated)
        try {
          let n = await E.findOne({
            where: { id: i.id }
          });
          if (n)
            await n.update({
              ...i,
              synced: !0,
              modified: !1
            }), console.log(`Categoría actualizada: ${n.name}, ID: ${n.id}`), r.updated++;
          else if (n = await E.findOne({
            where: { name: i.name }
          }), n)
            await n.update({
              ...i,
              synced: !0,
              modified: !1
            }), console.log(`Categoría actualizada por nombre: ${n.name}, ID actualizado a: ${i.id}`), r.updated++;
          else {
            const a = await E.create({
              ...i,
              synced: !0,
              modified: !1
            });
            console.log(`Categoría creada desde actualización: ${a.name}, ID: ${a.id}`), r.added++;
          }
        } catch (n) {
          console.error(`Error al procesar categoría actualizada ${i.name}:`, n), r.skipped++;
        }
    }
    if (o.deleted && Array.isArray(o.deleted) && o.deleted.length > 0) {
      console.log(`Procesando ${o.deleted.length} categorías eliminadas`);
      for (const i of o.deleted)
        try {
          const n = await E.findByPk(i);
          n ? (await n.destroy(), console.log(`Categoría eliminada: ID ${i}`)) : console.log(`Categoría ID ${i} no encontrada para eliminar`);
        } catch (n) {
          console.error(`Error al eliminar categoría ID ${i}:`, n);
        }
    }
    if (e.serverCategories && Array.isArray(e.serverCategories)) {
      console.log(`Adicionalmente, verificando ${e.serverCategories.length} categorías recibidas del servidor`);
      const i = {};
      (await E.findAll()).forEach((a) => {
        i[a.id] = a;
      });
      for (const a of e.serverCategories)
        try {
          if (a.id && !i[a.id] && !await E.findOne({
            where: { name: a.name }
          })) {
            const u = await E.create({
              ...a,
              synced: !0,
              modified: !1
            });
            console.log(`Categoría creada desde serverCategories: ${u.name}, ID: ${u.id}`), r.added++;
          }
        } catch (s) {
          console.error(`Error al procesar categoría del servidor ${a.name}:`, s);
        }
    }
    return console.log(`Sincronización de categorías completada: ${r.updated} actualizadas, ${r.added} agregadas, ${r.skipped} omitidas`), r;
  } catch (r) {
    throw console.error("Error al actualizar categorías después de sincronización:", r), r;
  }
}
async function pr() {
  try {
    const e = await E.findAll({
      where: {
        deletedLocally: !0
      }
    });
    console.log(`Encontradas ${e.length} categorías a purgar`);
    for (const r of e)
      await r.destroy();
    return e.length;
  } catch (e) {
    return console.error("Error al purgar categorías eliminadas:", e), 0;
  }
}
async function fr(e) {
  try {
    return (await e.describeTable("Products")).description ? console.log('ℹ️ La columna "description" ya existe en la tabla Products') : (await e.addColumn("Products", "description", {
      type: F.TEXT,
      allowNull: !0
    }), console.log(
      '✅ Columna "description" añadida correctamente a la tabla Products'
    )), Promise.resolve();
  } catch (r) {
    return console.error("❌ Error al migrar:", r), Promise.reject(r);
  }
}
const gr = Oe(import.meta.url), O = w.dirname(gr), Ie = A.isPackaged, L = Ie || v.env.NODE_ENV === "production";
console.log("¿Aplicación empaquetada?:", Ie);
console.log("¿Modo producción?:", L);
console.log("Ruta de __dirname:", O);
const q = L ? w.join(O, "../dist") : w.join(O, "../dist/");
console.log("Ruta de distPath:", q);
console.log("Esta ruta existe:", x.existsSync(q));
let T;
function $e() {
  let e;
  if (L) {
    if (e = w.join(O, "preload-simple.js"), !x.existsSync(e)) {
      const r = [
        w.join(O, "../dist-electron/preload-simple.js"),
        w.join(v.resourcesPath, "preload-simple.js"),
        w.join(A.getAppPath(), "electron/preload-simple.js")
      ];
      for (const o of r)
        try {
          if (x.existsSync(o)) {
            e = o, console.log("Preload encontrado en:", e);
            break;
          }
        } catch (i) {
          console.error(`Error al verificar ${o}:`, i);
        }
    }
  } else
    e = w.join(O, "preload.js");
  if (console.log("Usando preload desde:", e), T = new Pe({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: e,
      nodeIntegration: !0,
      // Desactivado para seguridad
      contextIsolation: !0,
      // Importante para prevenir ataques de "prototype pollution"
      enableRemoteModule: !1,
      // Desactivado por seguridad
      sandbox: !1,
      // Necesario para que el preload funcione correctamente
      devTools: !L
      // Habilitar DevTools para depuración
    },
    // Configuración adicional para ventana de producción
    show: !1,
    // No mostrar hasta que esté lista
    minWidth: 1024,
    minHeight: 768,
    title: "Sistema de Inventario",
    autoHideMenuBar: L,
    // Ocultar barra de menú en producción
    menuBarVisible: !L
    // No mostrar el menú en producción
  }), T.webContents.on("before-input-event", (r, o) => {
    o.control && o.shift && o.key.toLowerCase() === "i" && (console.log("Abriendo DevTools"), T.webContents.openDevTools(), r.preventDefault());
  }), T.once("ready-to-show", () => {
    T.show();
  }), !L)
    T.webContents.openDevTools({ mode: "right" }), T.loadURL("http://localhost:5173");
  else {
    let r;
    (async () => {
      try {
        if (r = w.join(q, "index.html"), console.log("Intentando cargar desde:", r), !x.existsSync(r)) {
          console.log(
            "No se encontró index.html en la ruta principal, probando alternativas..."
          );
          const o = [
            w.join(O, "../../dist/index.html"),
            w.join(O, "../dist/index.html"),
            w.join(v.cwd(), "dist/index.html"),
            w.join(A.getAppPath(), "dist/index.html")
          ];
          console.log("Rutas alternativas a probar:", o);
          for (const i of o)
            if (console.log(`Comprobando ${i}: ${x.existsSync(i)}`), x.existsSync(i)) {
              r = i, console.log("Usando ruta alternativa:", r);
              break;
            }
          if (!x.existsSync(r)) {
            console.log(
              "No se encontró index.html en ninguna ruta alternativa"
            ), console.log("Usando HTML mínimo de emergencia"), T.loadURL(`data:text/html,
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
                  distPath: ${q}
                  __dirname: ${O}
                  cwd: ${v.cwd()}
                  appPath: ${A.getAppPath()}
                  resourcesPath: ${v.resourcesPath || "N/A"}
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
        console.log("Cargando desde:", r), console.log("El archivo existe:", x.existsSync(r));
        try {
          x.existsSync(r) ? T.loadFile(r).catch((o) => {
            console.error("Error al cargar el archivo:", o), T.loadURL(
              "data:text/html,<html><body><h1>Error al cargar la aplicación</h1><p>" + o.message + "</p></body></html>"
            );
          }) : (console.error("No se encontró el archivo index.html"), T.loadURL(
            "data:text/html,<html><body><h1>Error al cargar la aplicación</h1><p>No se encontró el archivo index.html</p></body></html>"
          ));
        } catch (o) {
          console.error("Error en loadFile:", o), T.loadURL(
            "data:text/html,<html><body><h1>Error al cargar la aplicación</h1><p>" + o.message + "</p></body></html>"
          );
        }
      } catch (o) {
        console.error("Error al intentar cargar el HTML:", o), T.loadURL(
          "data:text/html,<html><body><h1>Error</h1><p>" + o.message + "</p></body></html>"
        );
      }
    })().catch((o) => {
      console.error("Error al cargar el HTML:", o), T.loadURL(
        "data:text/html,<html><body><h1>Error</h1><p>" + o.message + "</p></body></html>"
      );
    });
  }
  T.on("closed", function() {
    T = null;
  });
}
function yr() {
  console.log("Configurando manejadores IPC..."), $.on("restart-app", () => {
    console.log("Reiniciando aplicación..."), A.relaunch(), A.exit(0);
  }), $.handle("get-all-products", async () => {
    try {
      console.log("Manejador: Obteniendo todos los productos");
      const e = await Xe();
      return console.log("Productos obtenidos:", e.length), e;
    } catch (e) {
      return console.error("Error al obtener productos:", e), [];
    }
  }), $.handle("get-all-active-products", async () => {
    try {
      console.log("Manejador: Obteniendo productos activos");
      const e = await Qe();
      return console.log("Productos activos obtenidos:", e.length), e;
    } catch (e) {
      return console.error("Error al obtener productos activos:", e), [];
    }
  }), $.handle("get-product-by-id", async (e, r) => {
    try {
      console.log("Manejador: Obteniendo producto por ID:", r);
      const o = await Ye(r);
      return console.log("Producto por ID:", o), o;
    } catch (o) {
      return console.error("Error al obtener producto por ID:", o), null;
    }
  }), $.handle("get-product-by-barcode", async (e, r) => {
    try {
      console.log(
        "Manejador: Obteniendo producto por código de barras:",
        r
      );
      const o = await Ze(r);
      return console.log("Producto por código de barras:", o), o;
    } catch (o) {
      return console.error("Error al obtener producto por código:", o), null;
    }
  }), $.handle("create-product", async (e, r) => {
    try {
      console.log("Manejador: Creando producto:", r);
      const o = await er(r);
      return console.log("Producto creado:", o), o;
    } catch (o) {
      return console.error("Error al crear producto:", o), null;
    }
  }), $.handle("update-product", async (e, r) => {
    try {
      if (console.log("Manejador: Update product payload recibido:", r), !r || !r.id)
        return console.error("Estructura de payload inválida:", r), null;
      const { id: o, productData: i } = r;
      console.log("Actualizando producto:", o, i);
      const n = await rr(o, i);
      return console.log("Producto actualizado:", n), n;
    } catch (o) {
      return console.error("Error al actualizar producto:", o), null;
    }
  }), $.handle("delete-product", async (e, r) => {
    try {
      console.log("Manejador: Eliminando producto:", r);
      const o = await or(r);
      return console.log("Producto eliminado:", o), o;
    } catch (o) {
      return console.error("Error al eliminar producto:", o), !1;
    }
  }), $.handle("search-products", async (e, r) => {
    try {
      console.log("Manejador: Buscando productos:", r);
      const o = await tr(r);
      return console.log("Productos encontrados:", o.length), o;
    } catch (o) {
      return console.error("Error al buscar productos:", o), [];
    }
  }), $.handle("update-products-after-sync", async (e, r) => {
    try {
      console.log(
        "Manejador: Actualizando productos después de sincronización"
      );
      const o = await ar(r);
      return console.log("Resultado de actualización post-sincronización:", o), o;
    } catch (o) {
      throw console.error(
        "Error al actualizar productos después de sincronización:",
        o
      ), o;
    }
  }), $.handle("purge-deleted-products", async () => {
    try {
      console.log("Manejador: Purgando productos eliminados");
      const e = await nr();
      return console.log("Productos purgados:", e), e;
    } catch (e) {
      return console.error("Error al purgar productos eliminados:", e), 0;
    }
  }), $.handle("get-all-categories", async () => {
    try {
      console.log("Manejador: Obteniendo todas las categorías");
      const e = await ir();
      return console.log("Categorías obtenidas:", e.length), e;
    } catch (e) {
      return console.error("Error al obtener categorías:", e), [];
    }
  }), $.handle("get-category-by-id", async (e, r) => {
    try {
      console.log("Manejador: Obteniendo categoría por ID:", r);
      const o = await cr(r);
      return console.log("Categoría por ID:", o), o;
    } catch (o) {
      return console.error("Error al obtener categoría por ID:", o), null;
    }
  }), $.handle("create-category", async (e, r) => {
    try {
      console.log("Manejador: Creando categoría:", r);
      const o = await lr(r);
      return console.log("Categoría creada:", o), o;
    } catch (o) {
      return console.error("Error al crear categoría:", o), null;
    }
  }), $.handle("update-category", async (e, r) => {
    try {
      if (console.log("Manejador: Update category payload recibido:", r), !r || !r.id)
        return console.error(
          "Estructura de payload inválida para categoría:",
          r
        ), null;
      const { id: o, categoryData: i } = r;
      console.log("Actualizando categoría:", o, i);
      const n = await sr(o, i);
      return console.log("Categoría actualizada:", n), n;
    } catch (o) {
      return console.error("Error al actualizar categoría:", o), null;
    }
  }), $.handle("delete-category", async (e, r) => {
    try {
      console.log("Manejador: Eliminando categoría:", r);
      const o = await dr(r);
      return console.log("Categoría eliminada:", o), o;
    } catch (o) {
      return console.error("Error al eliminar categoría:", o), !1;
    }
  }), $.handle("update-categories-after-sync", async (e, r) => {
    try {
      console.log("Manejador: Actualizando categorías después de sincronización");
      const o = await ur(r);
      return console.log("Resultado de actualización de categorías post-sincronización:", o), o;
    } catch (o) {
      return console.error("Error al actualizar categorías después de sincronización:", o), { updated: 0, added: 0, skipped: 0 };
    }
  }), $.handle("purge-deleted-categories", async () => {
    try {
      console.log("Manejador: Purgando categorías eliminadas");
      const e = await pr();
      return console.log("Categorías purgadas:", e), e;
    } catch (e) {
      return console.error("Error al purgar categorías eliminadas:", e), 0;
    }
  }), console.log("Manejadores IPC configurados correctamente");
}
async function hr() {
  try {
    console.log("Inicializando base de datos..."), await Je(), console.log("Base de datos inicializada correctamente");
    try {
      await fr(N.getQueryInterface(), F), console.log("Migración addDescription aplicada correctamente");
      try {
        console.log("Intentando cargar el script de migración deletedLocally...");
        let e = null;
        const r = [
          "../scripts/add-deletedLocally-to-categories.js",
          "./scripts/add-deletedLocally-to-categories.js",
          "../resources/scripts/add-deletedLocally-to-categories.js",
          w.join(A.getAppPath(), "scripts/add-deletedLocally-to-categories.js"),
          w.join(O, "../scripts/add-deletedLocally-to-categories.js"),
          w.join(O, "../../scripts/add-deletedLocally-to-categories.js")
        ];
        for (const o of r)
          try {
            if (console.log(`Intentando cargar migración desde: ${o}`), e = await import(o).catch(() => null), e) {
              console.log(`Módulo encontrado en: ${o}`);
              break;
            }
          } catch {
            console.log(`No se encontró en: ${o}`);
          }
        if (e && e.default)
          console.log("Script de migración encontrado, ejecutando..."), await e.default(), console.log("Migración addDeletedLocallyToCategories aplicada correctamente");
        else {
          console.warn("No se pudo cargar el módulo de migración. Verificando column manualmente");
          try {
            (await N.getQueryInterface().describeTable("Categories")).deletedLocally ? console.log("La columna deletedLocally ya existe") : (console.log("Añadiendo columna deletedLocally directamente"), await N.getQueryInterface().addColumn("Categories", "deletedLocally", {
              type: F.BOOLEAN,
              defaultValue: !1
            }), console.log("Columna deletedLocally añadida correctamente"));
          } catch (o) {
            console.error("Error al aplicar migración directa:", o);
          }
        }
      } catch (e) {
        console.error("Error al aplicar migración deletedLocally (no crítico):", e);
      }
    } catch (e) {
      console.error(
        "Error al aplicar migraciones (no crítico):",
        e
      );
    }
    return !0;
  } catch (e) {
    return console.error("Error crítico al inicializar la base de datos:", e), T && T.loadURL(`data:text/html,
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
            <pre>${e.message}</pre>
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
A.whenReady().then(async () => {
  console.log("Aplicación inicializando..."), console.log("Ambiente:", v.env.NODE_ENV || "development"), console.log("Directorio de la aplicación:", O), console.log("Ruta de dist:", q);
  try {
    console.log(
      "Archivo index.html existe:",
      x.existsSync(w.join(q, "index.html"))
    ), console.log("Listado de directorios:");
    try {
      const e = w.join(O, "../../");
      console.log("Contenido de directorio raíz:", x.readdirSync(e)), x.existsSync(w.join(O, "../dist")) && console.log(
        "Contenido de ../dist:",
        x.readdirSync(w.join(O, "../dist"))
      );
    } catch (e) {
      console.error("Error al listar directorios:", e);
    }
  } catch (e) {
    console.error("Error al verificar archivo:", e);
  }
  try {
    await hr();
  } catch (e) {
    console.error("Error fatal en la base de datos:", e);
  }
  try {
    yr();
  } catch (e) {
    console.error("Error al configurar IPC handlers:", e);
  }
  try {
    $e(), console.log("Ventana creada con éxito");
  } catch (e) {
    console.error("Error al crear ventana:", e);
  }
});
A.on("window-all-closed", function() {
  v.platform !== "darwin" && A.quit();
});
A.on("activate", function() {
  T === null && $e();
});
v.on("uncaughtException", (e) => {
  console.error("Error no capturado:", e);
});
v.on("unhandledRejection", (e, r) => {
  console.error(`Promesa ${r} rechazada no manejada:`, e);
});
