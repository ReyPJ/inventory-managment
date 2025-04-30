import { app as A, ipcMain as P, BrowserWindow as $e } from "electron";
import w from "path";
import { fileURLToPath as je } from "url";
import v from "process";
import { Sequelize as F, DataTypes as x, Op as B } from "sequelize";
import I from "fs";
import Oe from "util";
import Ce from "os";
function Ae(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var M = { exports: {} };
function we(e) {
  throw new Error('Could not dynamically require "' + e + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var N = {}, ae;
function S() {
  return ae || (ae = 1, N.getBooleanOption = (e, r) => {
    let o = !1;
    if (r in e && typeof (o = e[r]) != "boolean")
      throw new TypeError(`Expected the "${r}" option to be a boolean`);
    return o;
  }, N.cppdb = Symbol(), N.inspect = Symbol.for("nodejs.util.inspect.custom")), N;
}
var G, ne;
function Ee() {
  if (ne) return G;
  ne = 1;
  const e = { value: "SqliteError", writable: !0, enumerable: !1, configurable: !0 };
  function r(o, n) {
    if (new.target !== r)
      return new r(o, n);
    if (typeof n != "string")
      throw new TypeError("Expected second argument to be a string");
    Error.call(this, o), e.value = "" + o, Object.defineProperty(this, "message", e), Error.captureStackTrace(this, r), this.code = n;
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
    var n = decodeURI(o.substring(7)), t = n.indexOf("/"), a = n.substring(0, t), c = n.substring(t + 1);
    return a == "localhost" && (a = ""), a && (a = e + e + a), c = c.replace(/^(.+)\|/, "$1:"), e == "\\" && (c = c.replace(/\//g, "\\")), /^.+\:/.test(c) || (c = e + c), a + c;
  }
  return J;
}
var ce;
function _e() {
  return ce || (ce = 1, function(e, r) {
    var o = I, n = w, t = De(), a = n.join, c = n.dirname, p = o.accessSync && function(s) {
      try {
        o.accessSync(s);
      } catch {
        return !1;
      }
      return !0;
    } || o.existsSync || n.existsSync, f = {
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
    function i(s) {
      typeof s == "string" ? s = { bindings: s } : s || (s = {}), Object.keys(f).map(function(m) {
        m in s || (s[m] = f[m]);
      }), s.module_root || (s.module_root = r.getRoot(r.getFileName())), n.extname(s.bindings) != ".node" && (s.bindings += ".node");
      for (var b = typeof __webpack_require__ == "function" ? __non_webpack_require__ : we, l = [], u = 0, d = s.try.length, y, h, g; u < d; u++) {
        y = a.apply(
          null,
          s.try[u].map(function(m) {
            return s[m] || m;
          })
        ), l.push(y);
        try {
          return h = s.path ? b.resolve(y) : b(y), s.path || (h.path = y), h;
        } catch (m) {
          if (m.code !== "MODULE_NOT_FOUND" && m.code !== "QUALIFIED_PATH_RESOLUTION_FAILED" && !/not find/i.test(m.message))
            throw m;
        }
      }
      throw g = new Error(
        `Could not locate the bindings file. Tried:
` + l.map(function(m) {
          return s.arrow + m;
        }).join(`
`)
      ), g.tries = l, g;
    }
    e.exports = r = i, r.getFileName = function(b) {
      var l = Error.prepareStackTrace, u = Error.stackTraceLimit, d = {}, y;
      Error.stackTraceLimit = 10, Error.prepareStackTrace = function(g, m) {
        for (var C = 0, te = m.length; C < te; C++)
          if (y = m[C].getFileName(), y !== __filename)
            if (b) {
              if (y !== b)
                return;
            } else
              return;
      }, Error.captureStackTrace(d), d.stack, Error.prepareStackTrace = l, Error.stackTraceLimit = u;
      var h = "file://";
      return y.indexOf(h) === 0 && (y = t(y)), y;
    }, r.getRoot = function(b) {
      for (var l = c(b), u; ; ) {
        if (l === "." && (l = process.cwd()), p(a(l, "package.json")) || p(a(l, "node_modules")))
          return l;
        if (u === l)
          throw new Error(
            'Could not find module root given file: "' + b + '". Do you have a `package.json` file? '
          );
        u = l, l = a(l, "..");
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
    const c = this[e], p = o(c, this), { apply: f } = Function.prototype, i = {
      default: { value: n(f, a, c, p.default) },
      deferred: { value: n(f, a, c, p.deferred) },
      immediate: { value: n(f, a, c, p.immediate) },
      exclusive: { value: n(f, a, c, p.exclusive) },
      database: { value: this, enumerable: !0 }
    };
    return Object.defineProperties(i.default.value, i), Object.defineProperties(i.deferred.value, i), Object.defineProperties(i.immediate.value, i), Object.defineProperties(i.exclusive.value, i), i.default.value;
  };
  const o = (t, a) => {
    let c = r.get(t);
    if (!c) {
      const p = {
        commit: t.prepare("COMMIT", a, !1),
        rollback: t.prepare("ROLLBACK", a, !1),
        savepoint: t.prepare("SAVEPOINT `	_bs3.	`", a, !1),
        release: t.prepare("RELEASE `	_bs3.	`", a, !1),
        rollbackTo: t.prepare("ROLLBACK TO `	_bs3.	`", a, !1)
      };
      r.set(t, c = {
        default: Object.assign({ begin: t.prepare("BEGIN", a, !1) }, p),
        deferred: Object.assign({ begin: t.prepare("BEGIN DEFERRED", a, !1) }, p),
        immediate: Object.assign({ begin: t.prepare("BEGIN IMMEDIATE", a, !1) }, p),
        exclusive: Object.assign({ begin: t.prepare("BEGIN EXCLUSIVE", a, !1) }, p)
      });
    }
    return c;
  }, n = (t, a, c, { begin: p, commit: f, rollback: i, savepoint: s, release: b, rollbackTo: l }) => function() {
    let d, y, h;
    c.inTransaction ? (d = s, y = b, h = l) : (d = p, y = f, h = i), d.run();
    try {
      const g = t.call(a, this, arguments);
      return y.run(), g;
    } catch (g) {
      throw c.inTransaction && (h.run(), h !== i && y.run()), g;
    }
  };
  return H;
}
var W, de;
function Re() {
  if (de) return W;
  de = 1;
  const { getBooleanOption: e, cppdb: r } = S();
  return W = function(n, t) {
    if (t == null && (t = {}), typeof n != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof t != "object") throw new TypeError("Expected second argument to be an options object");
    const a = e(t, "simple"), c = this[r].prepare(`PRAGMA ${n}`, this, !0);
    return a ? c.pluck().get() : c.all();
  }, W;
}
var K, ue;
function qe() {
  if (ue) return K;
  ue = 1;
  const e = I, r = w, { promisify: o } = Oe, { cppdb: n } = S(), t = o(e.access);
  K = async function(p, f) {
    if (f == null && (f = {}), typeof p != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof f != "object") throw new TypeError("Expected second argument to be an options object");
    p = p.trim();
    const i = "attached" in f ? f.attached : "main", s = "progress" in f ? f.progress : null;
    if (!p) throw new TypeError("Backup filename cannot be an empty string");
    if (p === ":memory:") throw new TypeError('Invalid backup filename ":memory:"');
    if (typeof i != "string") throw new TypeError('Expected the "attached" option to be a string');
    if (!i) throw new TypeError('The "attached" option cannot be an empty string');
    if (s != null && typeof s != "function") throw new TypeError('Expected the "progress" option to be a function');
    await t(r.dirname(p)).catch(() => {
      throw new TypeError("Cannot save backup because the directory does not exist");
    });
    const b = await t(p).then(() => !1, () => !0);
    return a(this[n].backup(this, i, p, b), s || null);
  };
  const a = (c, p) => {
    let f = 0, i = !0;
    return new Promise((s, b) => {
      setImmediate(function l() {
        try {
          const u = c.transfer(f);
          if (!u.remainingPages) {
            c.close(), s(u);
            return;
          }
          if (i && (i = !1, f = 100), p) {
            const d = p(u);
            if (d !== void 0)
              if (typeof d == "number" && d === d) f = Math.max(0, Math.min(2147483647, Math.round(d)));
              else throw new TypeError("Expected progress callback to return a number or undefined");
          }
          setImmediate(l);
        } catch (u) {
          c.close(), b(u);
        }
      });
    });
  };
  return K;
}
var X, pe;
function ze() {
  if (pe) return X;
  pe = 1;
  const { cppdb: e } = S();
  return X = function(o) {
    if (o == null && (o = {}), typeof o != "object") throw new TypeError("Expected first argument to be an options object");
    const n = "attached" in o ? o.attached : "main";
    if (typeof n != "string") throw new TypeError('Expected the "attached" option to be a string');
    if (!n) throw new TypeError('The "attached" option cannot be an empty string');
    return this[e].serialize(n);
  }, X;
}
var Q, fe;
function Ne() {
  if (fe) return Q;
  fe = 1;
  const { getBooleanOption: e, cppdb: r } = S();
  return Q = function(n, t, a) {
    if (t == null && (t = {}), typeof t == "function" && (a = t, t = {}), typeof n != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof a != "function") throw new TypeError("Expected last argument to be a function");
    if (typeof t != "object") throw new TypeError("Expected second argument to be an options object");
    if (!n) throw new TypeError("User-defined function name cannot be an empty string");
    const c = "safeIntegers" in t ? +e(t, "safeIntegers") : 2, p = e(t, "deterministic"), f = e(t, "directOnly"), i = e(t, "varargs");
    let s = -1;
    if (!i) {
      if (s = a.length, !Number.isInteger(s) || s < 0) throw new TypeError("Expected function.length to be a positive integer");
      if (s > 100) throw new RangeError("User-defined functions cannot have more than 100 arguments");
    }
    return this[r].function(a, n, s, c, p, f), this;
  }, Q;
}
var Y, ge;
function ke() {
  if (ge) return Y;
  ge = 1;
  const { getBooleanOption: e, cppdb: r } = S();
  Y = function(a, c) {
    if (typeof a != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof c != "object" || c === null) throw new TypeError("Expected second argument to be an options object");
    if (!a) throw new TypeError("User-defined function name cannot be an empty string");
    const p = "start" in c ? c.start : null, f = o(c, "step", !0), i = o(c, "inverse", !1), s = o(c, "result", !1), b = "safeIntegers" in c ? +e(c, "safeIntegers") : 2, l = e(c, "deterministic"), u = e(c, "directOnly"), d = e(c, "varargs");
    let y = -1;
    if (!d && (y = Math.max(n(f), i ? n(i) : 0), y > 0 && (y -= 1), y > 100))
      throw new RangeError("User-defined functions cannot have more than 100 arguments");
    return this[r].aggregate(p, f, i, s, a, y, b, l, u), this;
  };
  const o = (t, a, c) => {
    const p = a in t ? t[a] : null;
    if (typeof p == "function") return p;
    if (p != null) throw new TypeError(`Expected the "${a}" option to be a function`);
    if (c) throw new TypeError(`Missing required option "${a}"`);
    return null;
  }, n = ({ length: t }) => {
    if (Number.isInteger(t) && t >= 0) return t;
    throw new TypeError("Expected function.length to be a positive integer");
  };
  return Y;
}
var Z, ye;
function Be() {
  if (ye) return Z;
  ye = 1;
  const { cppdb: e } = S();
  Z = function(u, d) {
    if (typeof u != "string") throw new TypeError("Expected first argument to be a string");
    if (!u) throw new TypeError("Virtual table module name cannot be an empty string");
    let y = !1;
    if (typeof d == "object" && d !== null)
      y = !0, d = b(o(d, "used", u));
    else {
      if (typeof d != "function") throw new TypeError("Expected second argument to be a function or a table definition object");
      d = r(d);
    }
    return this[e].table(d, u, y), this;
  };
  function r(l) {
    return function(d, y, h, ...g) {
      const m = {
        module: d,
        database: y,
        table: h
      }, C = f.call(l, m, g);
      if (typeof C != "object" || C === null)
        throw new TypeError(`Virtual table module "${d}" did not return a table definition object`);
      return o(C, "returned", d);
    };
  }
  function o(l, u, d) {
    if (!p.call(l, "rows"))
      throw new TypeError(`Virtual table module "${d}" ${u} a table definition without a "rows" property`);
    if (!p.call(l, "columns"))
      throw new TypeError(`Virtual table module "${d}" ${u} a table definition without a "columns" property`);
    const y = l.rows;
    if (typeof y != "function" || Object.getPrototypeOf(y) !== i)
      throw new TypeError(`Virtual table module "${d}" ${u} a table definition with an invalid "rows" property (should be a generator function)`);
    let h = l.columns;
    if (!Array.isArray(h) || !(h = [...h]).every((O) => typeof O == "string"))
      throw new TypeError(`Virtual table module "${d}" ${u} a table definition with an invalid "columns" property (should be an array of strings)`);
    if (h.length !== new Set(h).size)
      throw new TypeError(`Virtual table module "${d}" ${u} a table definition with duplicate column names`);
    if (!h.length)
      throw new RangeError(`Virtual table module "${d}" ${u} a table definition with zero columns`);
    let g;
    if (p.call(l, "parameters")) {
      if (g = l.parameters, !Array.isArray(g) || !(g = [...g]).every((O) => typeof O == "string"))
        throw new TypeError(`Virtual table module "${d}" ${u} a table definition with an invalid "parameters" property (should be an array of strings)`);
    } else
      g = c(y);
    if (g.length !== new Set(g).size)
      throw new TypeError(`Virtual table module "${d}" ${u} a table definition with duplicate parameter names`);
    if (g.length > 32)
      throw new RangeError(`Virtual table module "${d}" ${u} a table definition with more than the maximum number of 32 parameters`);
    for (const O of g)
      if (h.includes(O))
        throw new TypeError(`Virtual table module "${d}" ${u} a table definition with column "${O}" which was ambiguously defined as both a column and parameter`);
    let m = 2;
    if (p.call(l, "safeIntegers")) {
      const O = l.safeIntegers;
      if (typeof O != "boolean")
        throw new TypeError(`Virtual table module "${d}" ${u} a table definition with an invalid "safeIntegers" property (should be a boolean)`);
      m = +O;
    }
    let C = !1;
    if (p.call(l, "directOnly") && (C = l.directOnly, typeof C != "boolean"))
      throw new TypeError(`Virtual table module "${d}" ${u} a table definition with an invalid "directOnly" property (should be a boolean)`);
    return [
      `CREATE TABLE x(${[
        ...g.map(s).map((O) => `${O} HIDDEN`),
        ...h.map(s)
      ].join(", ")});`,
      n(y, new Map(h.map((O, Ie) => [O, g.length + Ie])), d),
      g,
      m,
      C
    ];
  }
  function n(l, u, d) {
    return function* (...h) {
      const g = h.map((m) => Buffer.isBuffer(m) ? Buffer.from(m) : m);
      for (let m = 0; m < u.size; ++m)
        g.push(null);
      for (const m of l(...h))
        if (Array.isArray(m))
          t(m, g, u.size, d), yield g;
        else if (typeof m == "object" && m !== null)
          a(m, g, u, d), yield g;
        else
          throw new TypeError(`Virtual table module "${d}" yielded something that isn't a valid row object`);
    };
  }
  function t(l, u, d, y) {
    if (l.length !== d)
      throw new TypeError(`Virtual table module "${y}" yielded a row with an incorrect number of columns`);
    const h = u.length - d;
    for (let g = 0; g < d; ++g)
      u[g + h] = l[g];
  }
  function a(l, u, d, y) {
    let h = 0;
    for (const g of Object.keys(l)) {
      const m = d.get(g);
      if (m === void 0)
        throw new TypeError(`Virtual table module "${y}" yielded a row with an undeclared column "${g}"`);
      u[m] = l[g], h += 1;
    }
    if (h !== d.size)
      throw new TypeError(`Virtual table module "${y}" yielded a row with missing columns`);
  }
  function c({ length: l }) {
    if (!Number.isInteger(l) || l < 0)
      throw new TypeError("Expected function.length to be a positive integer");
    const u = [];
    for (let d = 0; d < l; ++d)
      u.push(`$${d + 1}`);
    return u;
  }
  const { hasOwnProperty: p } = Object.prototype, { apply: f } = Function.prototype, i = Object.getPrototypeOf(function* () {
  }), s = (l) => `"${l.replace(/"/g, '""')}"`, b = (l) => () => l;
  return Z;
}
var ee, he;
function Me() {
  if (he) return ee;
  he = 1;
  const e = function() {
  };
  return ee = function(o, n) {
    return Object.assign(new e(), this);
  }, ee;
}
var re, me;
function Ue() {
  if (me) return re;
  me = 1;
  const e = I, r = w, o = S(), n = Ee();
  let t;
  function a(p, f) {
    if (new.target == null)
      return new a(p, f);
    let i;
    if (Buffer.isBuffer(p) && (i = p, p = ":memory:"), p == null && (p = ""), f == null && (f = {}), typeof p != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof f != "object") throw new TypeError("Expected second argument to be an options object");
    if ("readOnly" in f) throw new TypeError('Misspelled option "readOnly" should be "readonly"');
    if ("memory" in f) throw new TypeError('Option "memory" was removed in v7.0.0 (use ":memory:" filename instead)');
    const s = p.trim(), b = s === "" || s === ":memory:", l = o.getBooleanOption(f, "readonly"), u = o.getBooleanOption(f, "fileMustExist"), d = "timeout" in f ? f.timeout : 5e3, y = "verbose" in f ? f.verbose : null, h = "nativeBinding" in f ? f.nativeBinding : null;
    if (l && b && !i) throw new TypeError("In-memory/temporary databases cannot be readonly");
    if (!Number.isInteger(d) || d < 0) throw new TypeError('Expected the "timeout" option to be a positive integer');
    if (d > 2147483647) throw new RangeError('Option "timeout" cannot be greater than 2147483647');
    if (y != null && typeof y != "function") throw new TypeError('Expected the "verbose" option to be a function');
    if (h != null && typeof h != "string" && typeof h != "object") throw new TypeError('Expected the "nativeBinding" option to be a string or addon object');
    let g;
    if (h == null ? g = t || (t = _e()("better_sqlite3.node")) : typeof h == "string" ? g = (typeof __non_webpack_require__ == "function" ? __non_webpack_require__ : we)(r.resolve(h).replace(/(\.node)?$/, ".node")) : g = h, g.isInitialized || (g.setErrorConstructor(n), g.isInitialized = !0), !b && !e.existsSync(r.dirname(s)))
      throw new TypeError("Cannot open database because the directory does not exist");
    Object.defineProperties(this, {
      [o.cppdb]: { value: new g.Database(s, p, b, l, u, d, y || null, i || null) },
      ...c.getters
    });
  }
  const c = Se();
  return a.prototype.prepare = c.prepare, a.prototype.transaction = Le(), a.prototype.pragma = Re(), a.prototype.backup = qe(), a.prototype.serialize = ze(), a.prototype.function = Ne(), a.prototype.aggregate = ke(), a.prototype.table = Be(), a.prototype.loadExtension = c.loadExtension, a.prototype.exec = c.exec, a.prototype.close = c.close, a.prototype.defaultSafeIntegers = c.defaultSafeIntegers, a.prototype.unsafeMode = c.unsafeMode, a.prototype[o.inspect] = Me(), re = a, re;
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
    if (!I.existsSync(e))
      try {
        I.mkdirSync(e, { recursive: !0 }), console.log("Directorio creado:", e);
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
const R = new F({
  dialect: "sqlite",
  storage: D,
  logging: !1,
  // Cambiar a console.log para ver consultas SQL durante depuración
  dialectOptions: {
    // Usar better-sqlite3 que es más confiable en Electron
    dialectModule: Ge
  }
});
R.authenticate().then(() => {
  console.log("Conexión a la base de datos establecida correctamente.");
}).catch((e) => {
  console.error("Error al conectar a la base de datos:", e);
});
const $ = R.define("Product", {
  id: {
    type: x.INTEGER,
    primaryKey: !0,
    autoIncrement: !0
  },
  barcode: {
    type: x.STRING,
    allowNull: !1,
    unique: !0
  },
  name: {
    type: x.STRING,
    allowNull: !1
  },
  description: {
    type: x.TEXT,
    allowNull: !0
  },
  price: {
    type: x.DECIMAL(10, 2),
    allowNull: !1,
    defaultValue: 0
  },
  stock: {
    type: x.INTEGER,
    allowNull: !1,
    defaultValue: 0
  },
  synced: {
    type: x.BOOLEAN,
    defaultValue: !1
  },
  modified: {
    type: x.BOOLEAN,
    defaultValue: !0
  },
  deletedLocally: {
    type: x.BOOLEAN,
    defaultValue: !1
  },
  lastSync: {
    type: x.DATE,
    allowNull: !0
  },
  syncError: {
    type: x.TEXT,
    allowNull: !0
  },
  remoteId: {
    type: x.INTEGER,
    allowNull: !0
  },
  CategoryId: {
    type: x.INTEGER,
    allowNull: !0,
    references: {
      model: "Categories",
      key: "id"
    }
  }
}), E = R.define("Category", {
  id: {
    type: x.INTEGER,
    primaryKey: !0,
    autoIncrement: !0
  },
  name: {
    type: x.STRING,
    allowNull: !1,
    unique: !0
  },
  description: {
    type: x.TEXT,
    allowNull: !0
  },
  synced: {
    type: x.BOOLEAN,
    defaultValue: !1
  },
  modified: {
    type: x.BOOLEAN,
    defaultValue: !0
  },
  deletedLocally: {
    type: x.BOOLEAN,
    defaultValue: !1
  }
});
E.hasMany($);
$.belongsTo(E);
async function Je() {
  try {
    await R.sync();
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
}, Symbol.toStringTag, { value: "Module" })), q = (e) => e ? JSON.parse(JSON.stringify(e)) : null;
async function Xe() {
  try {
    const e = await $.findAll({
      include: [E],
      order: [["updatedAt", "DESC"]]
    });
    return q(e);
  } catch (e) {
    return console.error("Error al obtener productos:", e), [];
  }
}
async function Qe() {
  try {
    const e = await $.findAll({
      where: {
        deletedLocally: !1
      },
      include: [E],
      order: [["updatedAt", "DESC"]]
    });
    return q(e);
  } catch (e) {
    return console.error("Error al obtener productos activos:", e), [];
  }
}
async function Ye(e) {
  try {
    const r = await $.findByPk(e, {
      include: [E]
    });
    return q(r);
  } catch (r) {
    return console.error("Error al obtener el producto:", r), null;
  }
}
async function Ze(e) {
  try {
    const r = await $.findOne({
      where: {
        barcode: e,
        deletedLocally: !1
        // Solo buscar en productos activos
      },
      include: [E]
    });
    return q(r);
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
    }, o = await $.create(r);
    return q(o);
  } catch (r) {
    throw console.error("Error al crear el producto:", r), r;
  }
}
async function rr(e, r) {
  try {
    const o = await $.findByPk(e);
    if (!o) return null;
    const n = {
      ...r,
      modified: !0,
      synced: !1
    };
    return await o.update(n), q(o);
  } catch (o) {
    throw console.error("Error al actualizar el producto:", o), o;
  }
}
async function or(e) {
  try {
    const r = await $.findByPk(e);
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
    const r = await $.findAll({
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
    return q(r);
  } catch (r) {
    return console.error("Error al buscar productos:", r), [];
  }
}
async function ar(e) {
  try {
    const { syncedProducts: r, serverProducts: o } = e;
    let n = 0, t = 0, a = 0;
    const c = {};
    try {
      (await E.findAll()).forEach((s) => {
        c[s.id] = s;
      }), console.log(`Categorías disponibles en BD local: ${Object.keys(c).length}`), console.log(`IDs de categorías: ${Object.keys(c).join(", ")}`);
    } catch (i) {
      console.error("Error al obtener categorías para el mapa:", i);
    }
    if (r && r.created && Array.isArray(r.created)) {
      console.log(`Procesando ${r.created.length} productos creados`);
      for (const i of r.created)
        try {
          const s = await $.findOne({
            where: { barcode: i.barcode }
          });
          if (s) {
            const b = {
              synced: !0,
              modified: !1,
              lastSync: /* @__PURE__ */ new Date(),
              syncError: null,
              remoteId: i.id
            };
            if (i.CategoryId || i.category_id) {
              const l = i.CategoryId || i.category_id;
              c[l] ? (console.log(`Asignando categoría ${l} a producto ${i.name}`), b.CategoryId = l) : console.log(`Categoría ${l} no encontrada para producto ${i.name}`);
            }
            await s.update(b), n++;
          }
        } catch (s) {
          console.error(`Error al actualizar producto creado ${i.barcode}:`, s);
        }
    }
    if (r && r.updated && Array.isArray(r.updated)) {
      console.log(`Procesando ${r.updated.length} productos actualizados`);
      for (const i of r.updated)
        try {
          const s = await $.findOne({
            where: { barcode: i.barcode }
          });
          if (s) {
            const b = {
              synced: !0,
              modified: !1,
              lastSync: /* @__PURE__ */ new Date(),
              syncError: null,
              remoteId: i.id
            };
            if (i.CategoryId || i.category_id) {
              const l = i.CategoryId || i.category_id;
              c[l] ? (console.log(`Asignando categoría ${l} a producto ${i.name}`), b.CategoryId = l) : console.log(`Categoría ${l} no encontrada para producto ${i.name}`);
            }
            await s.update(b), n++;
          }
        } catch (s) {
          console.error(`Error al actualizar producto ${i.barcode}:`, s);
        }
    }
    const f = (await $.findAll({
      where: { deletedLocally: !0 }
    })).map((i) => i.barcode);
    if (console.log(
      `Verificando ${(o == null ? void 0 : o.length) || 0} productos del servidor contra ${f.length} códigos eliminados localmente`
    ), o && Array.isArray(o))
      for (const i of o)
        try {
          const s = await $.findOne({
            where: { barcode: i.barcode }
          });
          if (f.includes(i.barcode)) {
            console.log(
              `Producto con barcode ${i.barcode} no agregado porque fue eliminado localmente`
            ), a++;
            continue;
          }
          if (s) {
            if ((i.CategoryId || i.category_id) && s.CategoryId !== (i.CategoryId || i.category_id)) {
              const b = i.CategoryId || i.category_id;
              c[b] && (console.log(`Actualizando CategoryId de producto existente ${s.name} a ${b}`), await s.update({
                CategoryId: b,
                synced: !0,
                modified: !1,
                lastSync: /* @__PURE__ */ new Date()
              }), n++);
            }
          } else {
            let b = {
              ...i,
              synced: !0,
              modified: !1,
              deletedLocally: !1,
              lastSync: /* @__PURE__ */ new Date(),
              remoteId: i.id
            };
            if (i.CategoryId || i.category_id) {
              const u = i.CategoryId || i.category_id;
              c[u] ? (console.log(`Asignando categoría ${u} a nuevo producto ${i.name}`), b.CategoryId = u) : (console.log(`Categoría ${u} no encontrada para producto ${i.name}`), b.CategoryId = null);
            } else
              console.log(`Producto ${i.name} no tiene categoría asignada`);
            const l = await $.create(b);
            console.log(`Producto creado: ${JSON.stringify({
              id: l.id,
              name: l.name,
              CategoryId: l.CategoryId
            })}`), t++;
          }
        } catch (s) {
          console.error(`Error procesando producto ${i.barcode}:`, s), a++;
        }
    return { updated: n, added: t, skipped: a };
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
    const e = await $.findAll({
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
      for (const n of o.created)
        try {
          let t = await E.findOne({
            where: { name: n.name }
          });
          if (t)
            await t.update({
              ...n,
              synced: !0,
              modified: !1
            }), console.log(`Categoría actualizada: ${t.name}, ID: ${t.id}`), r.updated++;
          else {
            const a = await E.create({
              ...n,
              synced: !0,
              modified: !1
            });
            console.log(`Categoría creada: ${a.name}, ID: ${a.id}`), r.added++;
          }
        } catch (t) {
          console.error(`Error al procesar categoría nueva ${n.name}:`, t), r.skipped++;
        }
    }
    if (o.updated && Array.isArray(o.updated)) {
      console.log(`Procesando ${o.updated.length} categorías actualizadas`);
      for (const n of o.updated)
        try {
          let t = await E.findOne({
            where: { id: n.id }
          });
          if (t)
            await t.update({
              ...n,
              synced: !0,
              modified: !1
            }), console.log(`Categoría actualizada: ${t.name}, ID: ${t.id}`), r.updated++;
          else if (t = await E.findOne({
            where: { name: n.name }
          }), t)
            await t.update({
              ...n,
              synced: !0,
              modified: !1
            }), console.log(`Categoría actualizada por nombre: ${t.name}, ID actualizado a: ${n.id}`), r.updated++;
          else {
            const a = await E.create({
              ...n,
              synced: !0,
              modified: !1
            });
            console.log(`Categoría creada desde actualización: ${a.name}, ID: ${a.id}`), r.added++;
          }
        } catch (t) {
          console.error(`Error al procesar categoría actualizada ${n.name}:`, t), r.skipped++;
        }
    }
    if (o.deleted && Array.isArray(o.deleted) && o.deleted.length > 0) {
      console.log(`Procesando ${o.deleted.length} categorías eliminadas`);
      for (const n of o.deleted)
        try {
          const t = await E.findByPk(n);
          t ? (await t.destroy(), console.log(`Categoría eliminada: ID ${n}`)) : console.log(`Categoría ID ${n} no encontrada para eliminar`);
        } catch (t) {
          console.error(`Error al eliminar categoría ID ${n}:`, t);
        }
    }
    if (e.serverCategories && Array.isArray(e.serverCategories)) {
      console.log(`Adicionalmente, verificando ${e.serverCategories.length} categorías recibidas del servidor`);
      const n = {};
      (await E.findAll()).forEach((a) => {
        n[a.id] = a;
      });
      for (const a of e.serverCategories)
        try {
          if (a.id && !n[a.id] && !await E.findOne({
            where: { name: a.name }
          })) {
            const p = await E.create({
              ...a,
              synced: !0,
              modified: !1
            });
            console.log(`Categoría creada desde serverCategories: ${p.name}, ID: ${p.id}`), r.added++;
          }
        } catch (c) {
          console.error(`Error al procesar categoría del servidor ${a.name}:`, c);
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
const gr = je(import.meta.url), j = w.dirname(gr), xe = A.isPackaged, L = xe || v.env.NODE_ENV === "production";
console.log("¿Aplicación empaquetada?:", xe);
console.log("¿Modo producción?:", L);
console.log("Ruta de __dirname:", j);
const z = L ? w.join(j, "../dist") : w.join(j, "../dist/");
console.log("Ruta de distPath:", z);
console.log("Esta ruta existe:", I.existsSync(z));
let T;
function Pe() {
  let e;
  if (L) {
    if (e = w.join(j, "preload-simple.js"), !I.existsSync(e)) {
      const r = [
        w.join(j, "../dist-electron/preload-simple.js"),
        w.join(v.resourcesPath, "preload-simple.js"),
        w.join(A.getAppPath(), "electron/preload-simple.js")
      ];
      for (const o of r)
        try {
          if (I.existsSync(o)) {
            e = o, console.log("Preload encontrado en:", e);
            break;
          }
        } catch (n) {
          console.error(`Error al verificar ${o}:`, n);
        }
    }
  } else
    e = w.join(j, "preload.js");
  if (console.log("Usando preload desde:", e), T = new $e({
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
        if (r = w.join(z, "index.html"), console.log("Intentando cargar desde:", r), !I.existsSync(r)) {
          console.log(
            "No se encontró index.html en la ruta principal, probando alternativas..."
          );
          const o = [
            w.join(j, "../../dist/index.html"),
            w.join(j, "../dist/index.html"),
            w.join(v.cwd(), "dist/index.html"),
            w.join(A.getAppPath(), "dist/index.html")
          ];
          console.log("Rutas alternativas a probar:", o);
          for (const n of o)
            if (console.log(`Comprobando ${n}: ${I.existsSync(n)}`), I.existsSync(n)) {
              r = n, console.log("Usando ruta alternativa:", r);
              break;
            }
          if (!I.existsSync(r)) {
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
                  distPath: ${z}
                  __dirname: ${j}
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
        console.log("Cargando desde:", r), console.log("El archivo existe:", I.existsSync(r));
        try {
          I.existsSync(r) ? T.loadFile(r).catch((o) => {
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
  console.log("Configurando manejadores IPC..."), P.on("restart-app", () => {
    console.log("Reiniciando aplicación..."), A.relaunch(), A.exit(0);
  }), P.handle("get-all-products", async () => {
    try {
      console.log("Manejador: Obteniendo todos los productos");
      const e = await Xe();
      return console.log("Productos obtenidos:", e.length), e;
    } catch (e) {
      return console.error("Error al obtener productos:", e), [];
    }
  }), P.handle("get-all-active-products", async () => {
    try {
      console.log("Manejador: Obteniendo productos activos");
      const e = await Qe();
      return console.log("Productos activos obtenidos:", e.length), e;
    } catch (e) {
      return console.error("Error al obtener productos activos:", e), [];
    }
  }), P.handle("get-product-by-id", async (e, r) => {
    try {
      console.log("Manejador: Obteniendo producto por ID:", r);
      const o = await Ye(r);
      return console.log("Producto por ID:", o), o;
    } catch (o) {
      return console.error("Error al obtener producto por ID:", o), null;
    }
  }), P.handle("get-product-by-barcode", async (e, r) => {
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
  }), P.handle("create-product", async (e, r) => {
    try {
      console.log("Manejador: Creando producto:", r);
      const o = await er(r);
      return console.log("Producto creado:", o), o;
    } catch (o) {
      return console.error("Error al crear producto:", o), null;
    }
  }), P.handle("update-product", async (e, r) => {
    try {
      if (console.log("Manejador: Update product payload recibido:", r), !r || !r.id)
        return console.error("Estructura de payload inválida:", r), null;
      const { id: o, productData: n } = r;
      console.log("Actualizando producto:", o, n);
      const t = await rr(o, n);
      return console.log("Producto actualizado:", t), t;
    } catch (o) {
      return console.error("Error al actualizar producto:", o), null;
    }
  }), P.handle("delete-product", async (e, r) => {
    try {
      console.log("Manejador: Eliminando producto:", r);
      const o = await or(r);
      return console.log("Producto eliminado:", o), o;
    } catch (o) {
      return console.error("Error al eliminar producto:", o), !1;
    }
  }), P.handle("search-products", async (e, r) => {
    try {
      console.log("Manejador: Buscando productos:", r);
      const o = await tr(r);
      return console.log("Productos encontrados:", o.length), o;
    } catch (o) {
      return console.error("Error al buscar productos:", o), [];
    }
  }), P.handle("update-products-after-sync", async (e, r) => {
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
  }), P.handle("purge-deleted-products", async () => {
    try {
      console.log("Manejador: Purgando productos eliminados");
      const e = await nr();
      return console.log("Productos purgados:", e), e;
    } catch (e) {
      return console.error("Error al purgar productos eliminados:", e), 0;
    }
  }), P.handle("get-all-categories", async () => {
    try {
      console.log("Manejador: Obteniendo todas las categorías");
      const e = await ir();
      return console.log("Categorías obtenidas:", e.length), e;
    } catch (e) {
      return console.error("Error al obtener categorías:", e), [];
    }
  }), P.handle("get-category-by-id", async (e, r) => {
    try {
      console.log("Manejador: Obteniendo categoría por ID:", r);
      const o = await cr(r);
      return console.log("Categoría por ID:", o), o;
    } catch (o) {
      return console.error("Error al obtener categoría por ID:", o), null;
    }
  }), P.handle("create-category", async (e, r) => {
    try {
      console.log("Manejador: Creando categoría:", r);
      const o = await lr(r);
      return console.log("Categoría creada:", o), o;
    } catch (o) {
      return console.error("Error al crear categoría:", o), null;
    }
  }), P.handle("update-category", async (e, r) => {
    try {
      if (console.log("Manejador: Update category payload recibido:", r), !r || !r.id)
        return console.error(
          "Estructura de payload inválida para categoría:",
          r
        ), null;
      const { id: o, categoryData: n } = r;
      console.log("Actualizando categoría:", o, n);
      const t = await sr(o, n);
      return console.log("Categoría actualizada:", t), t;
    } catch (o) {
      return console.error("Error al actualizar categoría:", o), null;
    }
  }), P.handle("delete-category", async (e, r) => {
    try {
      console.log("Manejador: Eliminando categoría:", r);
      const o = await dr(r);
      return console.log("Categoría eliminada:", o), o;
    } catch (o) {
      return console.error("Error al eliminar categoría:", o), !1;
    }
  }), P.handle("update-categories-after-sync", async (e, r) => {
    try {
      console.log("Manejador: Actualizando categorías después de sincronización");
      const o = await ur(r);
      return console.log("Resultado de actualización de categorías post-sincronización:", o), o;
    } catch (o) {
      return console.error("Error al actualizar categorías después de sincronización:", o), { updated: 0, added: 0, skipped: 0 };
    }
  }), P.handle("purge-deleted-categories", async () => {
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
      await fr(R.getQueryInterface(), F), console.log("Migración addDescription aplicada correctamente");
      try {
        console.log("Intentando cargar el script de migración deletedLocally...");
        let e = null;
        const r = [
          "../scripts/add-deletedLocally-to-categories.js",
          "./scripts/add-deletedLocally-to-categories.js",
          "../resources/scripts/add-deletedLocally-to-categories.js",
          w.join(A.getAppPath(), "scripts/add-deletedLocally-to-categories.js"),
          w.join(j, "../scripts/add-deletedLocally-to-categories.js"),
          w.join(j, "../../scripts/add-deletedLocally-to-categories.js")
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
            (await R.getQueryInterface().describeTable("Categories")).deletedLocally ? console.log("La columna deletedLocally ya existe") : (console.log("Añadiendo columna deletedLocally directamente"), await R.getQueryInterface().addColumn("Categories", "deletedLocally", {
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
  console.log("Aplicación inicializando..."), console.log("Ambiente:", v.env.NODE_ENV || "development"), console.log("Directorio de la aplicación:", j), console.log("Ruta de dist:", z);
  try {
    console.log(
      "Archivo index.html existe:",
      I.existsSync(w.join(z, "index.html"))
    ), console.log("Listado de directorios:");
    try {
      const e = w.join(j, "../../");
      console.log("Contenido de directorio raíz:", I.readdirSync(e)), I.existsSync(w.join(j, "../dist")) && console.log(
        "Contenido de ../dist:",
        I.readdirSync(w.join(j, "../dist"))
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
    Pe(), console.log("Ventana creada con éxito");
  } catch (e) {
    console.error("Error al crear ventana:", e);
  }
});
A.on("window-all-closed", function() {
  v.platform !== "darwin" && A.quit();
});
A.on("activate", function() {
  T === null && Pe();
});
v.on("uncaughtException", (e) => {
  console.error("Error no capturado:", e);
});
v.on("unhandledRejection", (e, r) => {
  console.error(`Promesa ${r} rechazada no manejada:`, e);
});
