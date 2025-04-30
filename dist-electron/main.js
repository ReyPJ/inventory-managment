import { app as A, ipcMain as x, BrowserWindow as Pe } from "electron";
import m from "path";
import { fileURLToPath as je } from "url";
import E from "process";
import { Sequelize as re, DataTypes as P, Op as M } from "sequelize";
import T from "fs";
import Oe from "util";
import Ie from "os";
function _e(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var L = { exports: {} };
function me(e) {
  throw new Error('Could not dynamically require "' + e + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var B = {}, oe;
function $() {
  return oe || (oe = 1, B.getBooleanOption = (e, r) => {
    let t = !1;
    if (r in e && typeof (t = e[r]) != "boolean")
      throw new TypeError(`Expected the "${r}" option to be a boolean`);
    return t;
  }, B.cppdb = Symbol(), B.inspect = Symbol.for("nodejs.util.inspect.custom")), B;
}
var F, ne;
function we() {
  if (ne) return F;
  ne = 1;
  const e = { value: "SqliteError", writable: !0, enumerable: !1, configurable: !0 };
  function r(t, c) {
    if (new.target !== r)
      return new r(t, c);
    if (typeof c != "string")
      throw new TypeError("Expected second argument to be a string");
    Error.call(this, t), e.value = "" + t, Object.defineProperty(this, "message", e), Error.captureStackTrace(this, r), this.code = c;
  }
  return Object.setPrototypeOf(r, Error), Object.setPrototypeOf(r.prototype, Error.prototype), Object.defineProperty(r.prototype, "name", e), F = r, F;
}
var z = { exports: {} }, G, ae;
function Se() {
  if (ae) return G;
  ae = 1;
  var e = m.sep || "/";
  G = r;
  function r(t) {
    if (typeof t != "string" || t.length <= 7 || t.substring(0, 7) != "file://")
      throw new TypeError("must pass in a file:// URI to convert to a file path");
    var c = decodeURI(t.substring(7)), a = c.indexOf("/"), o = c.substring(0, a), i = c.substring(a + 1);
    return o == "localhost" && (o = ""), o && (o = e + e + o), i = i.replace(/^(.+)\|/, "$1:"), e == "\\" && (i = i.replace(/\//g, "\\")), /^.+\:/.test(i) || (i = e + i), o + i;
  }
  return G;
}
var ie;
function Re() {
  return ie || (ie = 1, function(e, r) {
    var t = T, c = m, a = Se(), o = c.join, i = c.dirname, d = t.accessSync && function(f) {
      try {
        t.accessSync(f);
      } catch {
        return !1;
      }
      return !0;
    } || t.existsSync || c.existsSync, l = {
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
    function g(f) {
      typeof f == "string" ? f = { bindings: f } : f || (f = {}), Object.keys(l).map(function(b) {
        b in f || (f[b] = l[b]);
      }), f.module_root || (f.module_root = r.getRoot(r.getFileName())), c.extname(f.bindings) != ".node" && (f.bindings += ".node");
      for (var w = typeof __webpack_require__ == "function" ? __non_webpack_require__ : me, s = [], u = 0, n = f.try.length, h, y, p; u < n; u++) {
        h = o.apply(
          null,
          f.try[u].map(function(b) {
            return f[b] || b;
          })
        ), s.push(h);
        try {
          return y = f.path ? w.resolve(h) : w(h), f.path || (y.path = h), y;
        } catch (b) {
          if (b.code !== "MODULE_NOT_FOUND" && b.code !== "QUALIFIED_PATH_RESOLUTION_FAILED" && !/not find/i.test(b.message))
            throw b;
        }
      }
      throw p = new Error(
        `Could not locate the bindings file. Tried:
` + s.map(function(b) {
          return f.arrow + b;
        }).join(`
`)
      ), p.tries = s, p;
    }
    e.exports = r = g, r.getFileName = function(w) {
      var s = Error.prepareStackTrace, u = Error.stackTraceLimit, n = {}, h;
      Error.stackTraceLimit = 10, Error.prepareStackTrace = function(p, b) {
        for (var S = 0, te = b.length; S < te; S++)
          if (h = b[S].getFileName(), h !== __filename)
            if (w) {
              if (h !== w)
                return;
            } else
              return;
      }, Error.captureStackTrace(n), n.stack, Error.prepareStackTrace = s, Error.stackTraceLimit = u;
      var y = "file://";
      return h.indexOf(y) === 0 && (h = a(h)), h;
    }, r.getRoot = function(w) {
      for (var s = i(w), u; ; ) {
        if (s === "." && (s = process.cwd()), d(o(s, "package.json")) || d(o(s, "node_modules")))
          return s;
        if (u === s)
          throw new Error(
            'Could not find module root given file: "' + w + '". Do you have a `package.json` file? '
          );
        u = s, s = o(s, "..");
      }
    };
  }(z, z.exports)), z.exports;
}
var D = {}, ce;
function Ae() {
  if (ce) return D;
  ce = 1;
  const { cppdb: e } = $();
  return D.prepare = function(t) {
    return this[e].prepare(t, this, !1);
  }, D.exec = function(t) {
    return this[e].exec(t), this;
  }, D.close = function() {
    return this[e].close(), this;
  }, D.loadExtension = function(...t) {
    return this[e].loadExtension(...t), this;
  }, D.defaultSafeIntegers = function(...t) {
    return this[e].defaultSafeIntegers(...t), this;
  }, D.unsafeMode = function(...t) {
    return this[e].unsafeMode(...t), this;
  }, D.getters = {
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
  }, D;
}
var H, le;
function De() {
  if (le) return H;
  le = 1;
  const { cppdb: e } = $(), r = /* @__PURE__ */ new WeakMap();
  H = function(o) {
    if (typeof o != "function") throw new TypeError("Expected first argument to be a function");
    const i = this[e], d = t(i, this), { apply: l } = Function.prototype, g = {
      default: { value: c(l, o, i, d.default) },
      deferred: { value: c(l, o, i, d.deferred) },
      immediate: { value: c(l, o, i, d.immediate) },
      exclusive: { value: c(l, o, i, d.exclusive) },
      database: { value: this, enumerable: !0 }
    };
    return Object.defineProperties(g.default.value, g), Object.defineProperties(g.deferred.value, g), Object.defineProperties(g.immediate.value, g), Object.defineProperties(g.exclusive.value, g), g.default.value;
  };
  const t = (a, o) => {
    let i = r.get(a);
    if (!i) {
      const d = {
        commit: a.prepare("COMMIT", o, !1),
        rollback: a.prepare("ROLLBACK", o, !1),
        savepoint: a.prepare("SAVEPOINT `	_bs3.	`", o, !1),
        release: a.prepare("RELEASE `	_bs3.	`", o, !1),
        rollbackTo: a.prepare("ROLLBACK TO `	_bs3.	`", o, !1)
      };
      r.set(a, i = {
        default: Object.assign({ begin: a.prepare("BEGIN", o, !1) }, d),
        deferred: Object.assign({ begin: a.prepare("BEGIN DEFERRED", o, !1) }, d),
        immediate: Object.assign({ begin: a.prepare("BEGIN IMMEDIATE", o, !1) }, d),
        exclusive: Object.assign({ begin: a.prepare("BEGIN EXCLUSIVE", o, !1) }, d)
      });
    }
    return i;
  }, c = (a, o, i, { begin: d, commit: l, rollback: g, savepoint: f, release: w, rollbackTo: s }) => function() {
    let n, h, y;
    i.inTransaction ? (n = f, h = w, y = s) : (n = d, h = l, y = g), n.run();
    try {
      const p = a.call(o, this, arguments);
      return h.run(), p;
    } catch (p) {
      throw i.inTransaction && (y.run(), y !== g && h.run()), p;
    }
  };
  return H;
}
var J, se;
function $e() {
  if (se) return J;
  se = 1;
  const { getBooleanOption: e, cppdb: r } = $();
  return J = function(c, a) {
    if (a == null && (a = {}), typeof c != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof a != "object") throw new TypeError("Expected second argument to be an options object");
    const o = e(a, "simple"), i = this[r].prepare(`PRAGMA ${c}`, this, !0);
    return o ? i.pluck().get() : i.all();
  }, J;
}
var W, de;
function qe() {
  if (de) return W;
  de = 1;
  const e = T, r = m, { promisify: t } = Oe, { cppdb: c } = $(), a = t(e.access);
  W = async function(d, l) {
    if (l == null && (l = {}), typeof d != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof l != "object") throw new TypeError("Expected second argument to be an options object");
    d = d.trim();
    const g = "attached" in l ? l.attached : "main", f = "progress" in l ? l.progress : null;
    if (!d) throw new TypeError("Backup filename cannot be an empty string");
    if (d === ":memory:") throw new TypeError('Invalid backup filename ":memory:"');
    if (typeof g != "string") throw new TypeError('Expected the "attached" option to be a string');
    if (!g) throw new TypeError('The "attached" option cannot be an empty string');
    if (f != null && typeof f != "function") throw new TypeError('Expected the "progress" option to be a function');
    await a(r.dirname(d)).catch(() => {
      throw new TypeError("Cannot save backup because the directory does not exist");
    });
    const w = await a(d).then(() => !1, () => !0);
    return o(this[c].backup(this, g, d, w), f || null);
  };
  const o = (i, d) => {
    let l = 0, g = !0;
    return new Promise((f, w) => {
      setImmediate(function s() {
        try {
          const u = i.transfer(l);
          if (!u.remainingPages) {
            i.close(), f(u);
            return;
          }
          if (g && (g = !1, l = 100), d) {
            const n = d(u);
            if (n !== void 0)
              if (typeof n == "number" && n === n) l = Math.max(0, Math.min(2147483647, Math.round(n)));
              else throw new TypeError("Expected progress callback to return a number or undefined");
          }
          setImmediate(s);
        } catch (u) {
          i.close(), w(u);
        }
      });
    });
  };
  return W;
}
var X, ue;
function ke() {
  if (ue) return X;
  ue = 1;
  const { cppdb: e } = $();
  return X = function(t) {
    if (t == null && (t = {}), typeof t != "object") throw new TypeError("Expected first argument to be an options object");
    const c = "attached" in t ? t.attached : "main";
    if (typeof c != "string") throw new TypeError('Expected the "attached" option to be a string');
    if (!c) throw new TypeError('The "attached" option cannot be an empty string');
    return this[e].serialize(c);
  }, X;
}
var K, pe;
function Ne() {
  if (pe) return K;
  pe = 1;
  const { getBooleanOption: e, cppdb: r } = $();
  return K = function(c, a, o) {
    if (a == null && (a = {}), typeof a == "function" && (o = a, a = {}), typeof c != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof o != "function") throw new TypeError("Expected last argument to be a function");
    if (typeof a != "object") throw new TypeError("Expected second argument to be an options object");
    if (!c) throw new TypeError("User-defined function name cannot be an empty string");
    const i = "safeIntegers" in a ? +e(a, "safeIntegers") : 2, d = e(a, "deterministic"), l = e(a, "directOnly"), g = e(a, "varargs");
    let f = -1;
    if (!g) {
      if (f = o.length, !Number.isInteger(f) || f < 0) throw new TypeError("Expected function.length to be a positive integer");
      if (f > 100) throw new RangeError("User-defined functions cannot have more than 100 arguments");
    }
    return this[r].function(o, c, f, i, d, l), this;
  }, K;
}
var Q, fe;
function Be() {
  if (fe) return Q;
  fe = 1;
  const { getBooleanOption: e, cppdb: r } = $();
  Q = function(o, i) {
    if (typeof o != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof i != "object" || i === null) throw new TypeError("Expected second argument to be an options object");
    if (!o) throw new TypeError("User-defined function name cannot be an empty string");
    const d = "start" in i ? i.start : null, l = t(i, "step", !0), g = t(i, "inverse", !1), f = t(i, "result", !1), w = "safeIntegers" in i ? +e(i, "safeIntegers") : 2, s = e(i, "deterministic"), u = e(i, "directOnly"), n = e(i, "varargs");
    let h = -1;
    if (!n && (h = Math.max(c(l), g ? c(g) : 0), h > 0 && (h -= 1), h > 100))
      throw new RangeError("User-defined functions cannot have more than 100 arguments");
    return this[r].aggregate(d, l, g, f, o, h, w, s, u), this;
  };
  const t = (a, o, i) => {
    const d = o in a ? a[o] : null;
    if (typeof d == "function") return d;
    if (d != null) throw new TypeError(`Expected the "${o}" option to be a function`);
    if (i) throw new TypeError(`Missing required option "${o}"`);
    return null;
  }, c = ({ length: a }) => {
    if (Number.isInteger(a) && a >= 0) return a;
    throw new TypeError("Expected function.length to be a positive integer");
  };
  return Q;
}
var Y, he;
function Ce() {
  if (he) return Y;
  he = 1;
  const { cppdb: e } = $();
  Y = function(u, n) {
    if (typeof u != "string") throw new TypeError("Expected first argument to be a string");
    if (!u) throw new TypeError("Virtual table module name cannot be an empty string");
    let h = !1;
    if (typeof n == "object" && n !== null)
      h = !0, n = w(t(n, "used", u));
    else {
      if (typeof n != "function") throw new TypeError("Expected second argument to be a function or a table definition object");
      n = r(n);
    }
    return this[e].table(n, u, h), this;
  };
  function r(s) {
    return function(n, h, y, ...p) {
      const b = {
        module: n,
        database: h,
        table: y
      }, S = l.call(s, b, p);
      if (typeof S != "object" || S === null)
        throw new TypeError(`Virtual table module "${n}" did not return a table definition object`);
      return t(S, "returned", n);
    };
  }
  function t(s, u, n) {
    if (!d.call(s, "rows"))
      throw new TypeError(`Virtual table module "${n}" ${u} a table definition without a "rows" property`);
    if (!d.call(s, "columns"))
      throw new TypeError(`Virtual table module "${n}" ${u} a table definition without a "columns" property`);
    const h = s.rows;
    if (typeof h != "function" || Object.getPrototypeOf(h) !== g)
      throw new TypeError(`Virtual table module "${n}" ${u} a table definition with an invalid "rows" property (should be a generator function)`);
    let y = s.columns;
    if (!Array.isArray(y) || !(y = [...y]).every((O) => typeof O == "string"))
      throw new TypeError(`Virtual table module "${n}" ${u} a table definition with an invalid "columns" property (should be an array of strings)`);
    if (y.length !== new Set(y).size)
      throw new TypeError(`Virtual table module "${n}" ${u} a table definition with duplicate column names`);
    if (!y.length)
      throw new RangeError(`Virtual table module "${n}" ${u} a table definition with zero columns`);
    let p;
    if (d.call(s, "parameters")) {
      if (p = s.parameters, !Array.isArray(p) || !(p = [...p]).every((O) => typeof O == "string"))
        throw new TypeError(`Virtual table module "${n}" ${u} a table definition with an invalid "parameters" property (should be an array of strings)`);
    } else
      p = i(h);
    if (p.length !== new Set(p).size)
      throw new TypeError(`Virtual table module "${n}" ${u} a table definition with duplicate parameter names`);
    if (p.length > 32)
      throw new RangeError(`Virtual table module "${n}" ${u} a table definition with more than the maximum number of 32 parameters`);
    for (const O of p)
      if (y.includes(O))
        throw new TypeError(`Virtual table module "${n}" ${u} a table definition with column "${O}" which was ambiguously defined as both a column and parameter`);
    let b = 2;
    if (d.call(s, "safeIntegers")) {
      const O = s.safeIntegers;
      if (typeof O != "boolean")
        throw new TypeError(`Virtual table module "${n}" ${u} a table definition with an invalid "safeIntegers" property (should be a boolean)`);
      b = +O;
    }
    let S = !1;
    if (d.call(s, "directOnly") && (S = s.directOnly, typeof S != "boolean"))
      throw new TypeError(`Virtual table module "${n}" ${u} a table definition with an invalid "directOnly" property (should be a boolean)`);
    return [
      `CREATE TABLE x(${[
        ...p.map(f).map((O) => `${O} HIDDEN`),
        ...y.map(f)
      ].join(", ")});`,
      c(h, new Map(y.map((O, xe) => [O, p.length + xe])), n),
      p,
      b,
      S
    ];
  }
  function c(s, u, n) {
    return function* (...y) {
      const p = y.map((b) => Buffer.isBuffer(b) ? Buffer.from(b) : b);
      for (let b = 0; b < u.size; ++b)
        p.push(null);
      for (const b of s(...y))
        if (Array.isArray(b))
          a(b, p, u.size, n), yield p;
        else if (typeof b == "object" && b !== null)
          o(b, p, u, n), yield p;
        else
          throw new TypeError(`Virtual table module "${n}" yielded something that isn't a valid row object`);
    };
  }
  function a(s, u, n, h) {
    if (s.length !== n)
      throw new TypeError(`Virtual table module "${h}" yielded a row with an incorrect number of columns`);
    const y = u.length - n;
    for (let p = 0; p < n; ++p)
      u[p + y] = s[p];
  }
  function o(s, u, n, h) {
    let y = 0;
    for (const p of Object.keys(s)) {
      const b = n.get(p);
      if (b === void 0)
        throw new TypeError(`Virtual table module "${h}" yielded a row with an undeclared column "${p}"`);
      u[b] = s[p], y += 1;
    }
    if (y !== n.size)
      throw new TypeError(`Virtual table module "${h}" yielded a row with missing columns`);
  }
  function i({ length: s }) {
    if (!Number.isInteger(s) || s < 0)
      throw new TypeError("Expected function.length to be a positive integer");
    const u = [];
    for (let n = 0; n < s; ++n)
      u.push(`$${n + 1}`);
    return u;
  }
  const { hasOwnProperty: d } = Object.prototype, { apply: l } = Function.prototype, g = Object.getPrototypeOf(function* () {
  }), f = (s) => `"${s.replace(/"/g, '""')}"`, w = (s) => () => s;
  return Y;
}
var Z, ge;
function Me() {
  if (ge) return Z;
  ge = 1;
  const e = function() {
  };
  return Z = function(t, c) {
    return Object.assign(new e(), this);
  }, Z;
}
var ee, ye;
function Le() {
  if (ye) return ee;
  ye = 1;
  const e = T, r = m, t = $(), c = we();
  let a;
  function o(d, l) {
    if (new.target == null)
      return new o(d, l);
    let g;
    if (Buffer.isBuffer(d) && (g = d, d = ":memory:"), d == null && (d = ""), l == null && (l = {}), typeof d != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof l != "object") throw new TypeError("Expected second argument to be an options object");
    if ("readOnly" in l) throw new TypeError('Misspelled option "readOnly" should be "readonly"');
    if ("memory" in l) throw new TypeError('Option "memory" was removed in v7.0.0 (use ":memory:" filename instead)');
    const f = d.trim(), w = f === "" || f === ":memory:", s = t.getBooleanOption(l, "readonly"), u = t.getBooleanOption(l, "fileMustExist"), n = "timeout" in l ? l.timeout : 5e3, h = "verbose" in l ? l.verbose : null, y = "nativeBinding" in l ? l.nativeBinding : null;
    if (s && w && !g) throw new TypeError("In-memory/temporary databases cannot be readonly");
    if (!Number.isInteger(n) || n < 0) throw new TypeError('Expected the "timeout" option to be a positive integer');
    if (n > 2147483647) throw new RangeError('Option "timeout" cannot be greater than 2147483647');
    if (h != null && typeof h != "function") throw new TypeError('Expected the "verbose" option to be a function');
    if (y != null && typeof y != "string" && typeof y != "object") throw new TypeError('Expected the "nativeBinding" option to be a string or addon object');
    let p;
    if (y == null ? p = a || (a = Re()("better_sqlite3.node")) : typeof y == "string" ? p = (typeof __non_webpack_require__ == "function" ? __non_webpack_require__ : me)(r.resolve(y).replace(/(\.node)?$/, ".node")) : p = y, p.isInitialized || (p.setErrorConstructor(c), p.isInitialized = !0), !w && !e.existsSync(r.dirname(f)))
      throw new TypeError("Cannot open database because the directory does not exist");
    Object.defineProperties(this, {
      [t.cppdb]: { value: new p.Database(f, d, w, s, u, n, h || null, g || null) },
      ...i.getters
    });
  }
  const i = Ae();
  return o.prototype.prepare = i.prepare, o.prototype.transaction = De(), o.prototype.pragma = $e(), o.prototype.backup = qe(), o.prototype.serialize = ke(), o.prototype.function = Ne(), o.prototype.aggregate = Be(), o.prototype.table = Ce(), o.prototype.loadExtension = i.loadExtension, o.prototype.exec = i.exec, o.prototype.close = i.close, o.prototype.defaultSafeIntegers = i.defaultSafeIntegers, o.prototype.unsafeMode = i.unsafeMode, o.prototype[t.inspect] = Me(), ee = o, ee;
}
var be;
function ze() {
  return be || (be = 1, L.exports = Le(), L.exports.SqliteError = we()), L.exports;
}
var Ue = ze();
const Ve = /* @__PURE__ */ _e(Ue), Ee = E.env.NODE_ENV === "production" || typeof E.versions == "object" && typeof E.versions.electron == "string";
console.log("¿Modo empaquetado?:", Ee);
let R, U;
if (Ee)
  try {
    E.env.APPDATA ? U = E.env.APPDATA : E.platform === "darwin" ? U = m.join(
      E.env.HOME,
      "/Library/Application Support"
    ) : U = m.join(E.env.HOME, "/.local/share");
    const e = m.join(U, "sistema-inventario");
    if (!T.existsSync(e))
      try {
        T.mkdirSync(e, { recursive: !0 }), console.log("Directorio creado:", e);
      } catch (r) {
        console.error("Error al crear directorio de datos:", r);
      }
    R = m.join(e, "inventory-database.sqlite"), console.log("Ruta de base de datos en producción:", R);
  } catch (e) {
    console.error("Error al obtener ruta de datos:", e);
    try {
      E.resourcesPath ? R = m.join(E.resourcesPath, "database.sqlite") : R = m.join(m.dirname(E.execPath), "database.sqlite"), console.log("Usando ruta fallback para base de datos:", R);
    } catch (r) {
      console.error("Error en fallback de ruta:", r), R = m.join(Ie.tmpdir(), "inventory-database.sqlite"), console.log("Usando ruta temporal para base de datos:", R);
    }
  }
else
  R = m.join(E.cwd(), "database.sqlite"), console.log("Ruta de base de datos en desarrollo:", R);
const C = new re({
  dialect: "sqlite",
  storage: R,
  logging: !1,
  // Cambiar a console.log para ver consultas SQL durante depuración
  dialectOptions: {
    // Usar better-sqlite3 que es más confiable en Electron
    dialectModule: Ve
  }
});
C.authenticate().then(() => {
  console.log("Conexión a la base de datos establecida correctamente.");
}).catch((e) => {
  console.error("Error al conectar a la base de datos:", e);
});
const j = C.define("Product", {
  id: {
    type: P.INTEGER,
    primaryKey: !0,
    autoIncrement: !0
  },
  barcode: {
    type: P.STRING,
    allowNull: !1,
    unique: !0
  },
  name: {
    type: P.STRING,
    allowNull: !1
  },
  description: {
    type: P.TEXT,
    allowNull: !0
  },
  price: {
    type: P.DECIMAL(10, 2),
    allowNull: !1,
    defaultValue: 0
  },
  stock: {
    type: P.INTEGER,
    allowNull: !1,
    defaultValue: 0
  },
  synced: {
    type: P.BOOLEAN,
    defaultValue: !1
  },
  modified: {
    type: P.BOOLEAN,
    defaultValue: !0
  },
  deletedLocally: {
    type: P.BOOLEAN,
    defaultValue: !1
  },
  lastSync: {
    type: P.DATE,
    allowNull: !0
  },
  syncError: {
    type: P.TEXT,
    allowNull: !0
  },
  remoteId: {
    type: P.INTEGER,
    allowNull: !0
  }
}), _ = C.define("Category", {
  id: {
    type: P.INTEGER,
    primaryKey: !0,
    autoIncrement: !0
  },
  name: {
    type: P.STRING,
    allowNull: !1,
    unique: !0
  },
  description: {
    type: P.TEXT,
    allowNull: !0
  }
});
_.hasMany(j);
j.belongsTo(_);
async function Fe() {
  try {
    await C.sync();
    const e = ["PS4", "PS5"];
    for (const r of e)
      await _.findOrCreate({
        where: { name: r }
      });
    return console.log("Base de datos inicializada correctamente"), !0;
  } catch (e) {
    return console.error("Error al inicializar la base de datos:", e), !1;
  }
}
const Ge = /* @__PURE__ */ new Set(), He = (e) => {
  e && (Ge.add(e), console.log(`Producto ID ${e} marcado como eliminado localmente`));
}, k = (e) => e ? JSON.parse(JSON.stringify(e)) : null;
async function Je() {
  try {
    const e = await j.findAll({
      include: [_],
      order: [["updatedAt", "DESC"]]
    });
    return k(e);
  } catch (e) {
    return console.error("Error al obtener productos:", e), [];
  }
}
async function We() {
  try {
    const e = await j.findAll({
      where: {
        deletedLocally: !1
      },
      include: [_],
      order: [["updatedAt", "DESC"]]
    });
    return k(e);
  } catch (e) {
    return console.error("Error al obtener productos activos:", e), [];
  }
}
async function Xe(e) {
  try {
    const r = await j.findByPk(e, {
      include: [_]
    });
    return k(r);
  } catch (r) {
    return console.error("Error al obtener el producto:", r), null;
  }
}
async function Ke(e) {
  try {
    const r = await j.findOne({
      where: {
        barcode: e,
        deletedLocally: !1
        // Solo buscar en productos activos
      },
      include: [_]
    });
    return k(r);
  } catch (r) {
    return console.error("Error al obtener el producto por codigo de barras:", r), null;
  }
}
async function Qe(e) {
  try {
    const r = {
      ...e,
      modified: !0,
      synced: !1
    }, t = await j.create(r);
    return k(t);
  } catch (r) {
    throw console.error("Error al crear el producto:", r), r;
  }
}
async function Ye(e, r) {
  try {
    const t = await j.findByPk(e);
    if (!t) return null;
    const c = {
      ...r,
      modified: !0,
      synced: !1
    };
    return await t.update(c), k(t);
  } catch (t) {
    throw console.error("Error al actualizar el producto:", t), t;
  }
}
async function Ze(e) {
  try {
    const r = await j.findByPk(e);
    return r ? (await r.update({
      deletedLocally: !0,
      modified: !0,
      synced: !1
    }), He(e), !0) : !1;
  } catch (r) {
    return console.error("Error al eliminar el producto:", r), !1;
  }
}
async function er(e) {
  try {
    const r = await j.findAll({
      where: {
        [M.and]: [
          {
            [M.or]: [
              { name: { [M.like]: `%${e}%` } },
              { barcode: { [M.like]: `%${e}%` } }
            ]
          },
          { deletedLocally: !1 }
          // Solo buscar en productos activos
        ]
      },
      include: [_]
    });
    return k(r);
  } catch (r) {
    return console.error("Error al buscar productos:", r), [];
  }
}
async function rr(e) {
  try {
    const { syncedProducts: r, serverProducts: t } = e;
    let c = 0, a = 0, o = 0;
    if (r && Array.isArray(r))
      for (const l of r) {
        const g = await j.findOne({
          where: { barcode: l.barcode }
        });
        g && (await g.update({
          synced: !0,
          modified: !1,
          lastSync: /* @__PURE__ */ new Date(),
          syncError: null,
          remoteId: l.id
        }), c++);
      }
    const d = (await j.findAll({
      where: { deletedLocally: !0 }
    })).map((l) => l.barcode);
    if (console.log(
      `Verificando ${(t == null ? void 0 : t.length) || 0} productos del servidor contra ${d.length} códigos eliminados localmente`
    ), t && Array.isArray(t))
      for (const l of t) {
        const g = await j.findOne({
          where: { barcode: l.barcode }
        });
        if (d.includes(l.barcode)) {
          console.log(
            `Producto con barcode ${l.barcode} no agregado porque fue eliminado localmente`
          ), o++;
          continue;
        }
        g || (await j.create({
          ...l,
          synced: !0,
          modified: !1,
          deletedLocally: !1,
          lastSync: /* @__PURE__ */ new Date(),
          remoteId: l.id
        }), a++);
      }
    return { updated: c, added: a, skipped: o };
  } catch (r) {
    throw console.error(
      "Error al actualizar productos después de sincronización:",
      r
    ), r;
  }
}
async function tr() {
  try {
    const e = await j.findAll({
      where: { deletedLocally: !0 }
    });
    for (const r of e)
      await r.destroy();
    return e.length;
  } catch (e) {
    return console.error("Error al purgar productos eliminados:", e), 0;
  }
}
function V(e) {
  return e ? Array.isArray(e) ? e.map((r) => r.toJSON ? r.toJSON() : r) : e.toJSON ? e.toJSON() : e : null;
}
async function or() {
  try {
    const e = await _.findAll();
    return V(e) || [];
  } catch (e) {
    return console.error("Error al obtener las categorias: ", e), [];
  }
}
async function nr(e) {
  try {
    const r = await _.findByPk(e);
    return V(r);
  } catch (r) {
    return console.error("Error al obtener la categoria:", r), null;
  }
}
async function ar(e) {
  try {
    const r = await _.create(e);
    return V(r);
  } catch (r) {
    throw console.error("Error al crear la categoria:", r), r;
  }
}
async function ir(e, r) {
  try {
    const t = await _.findByPk(e);
    return t ? (await t.update(r), V(t)) : null;
  } catch (t) {
    throw console.error("Error al crear la categoria: ", t), t;
  }
}
async function cr(e) {
  try {
    const r = await _.findByPk(e);
    return r ? (await r.destroy(), !0) : null;
  } catch (r) {
    return console.error("Error al eliminar la categoria:", r), !1;
  }
}
async function lr(e) {
  try {
    return (await e.describeTable("Products")).description ? console.log('ℹ️ La columna "description" ya existe en la tabla Products') : (await e.addColumn("Products", "description", {
      type: re.TEXT,
      allowNull: !0
    }), console.log(
      '✅ Columna "description" añadida correctamente a la tabla Products'
    )), Promise.resolve();
  } catch (r) {
    return console.error("❌ Error al migrar:", r), Promise.reject(r);
  }
}
const sr = je(import.meta.url), I = m.dirname(sr), ve = A.isPackaged, q = ve || E.env.NODE_ENV === "production";
console.log("¿Aplicación empaquetada?:", ve);
console.log("¿Modo producción?:", q);
console.log("Ruta de __dirname:", I);
const N = q ? m.join(I, "../dist") : m.join(I, "../dist/");
console.log("Ruta de distPath:", N);
console.log("Esta ruta existe:", T.existsSync(N));
let v;
function Te() {
  let e;
  if (q) {
    if (e = m.join(I, "preload-simple.js"), !T.existsSync(e)) {
      const r = [
        m.join(I, "../dist-electron/preload-simple.js"),
        m.join(E.resourcesPath, "preload-simple.js"),
        m.join(A.getAppPath(), "electron/preload-simple.js")
      ];
      for (const t of r)
        try {
          if (T.existsSync(t)) {
            e = t, console.log("Preload encontrado en:", e);
            break;
          }
        } catch (c) {
          console.error(`Error al verificar ${t}:`, c);
        }
    }
  } else
    e = m.join(I, "preload.js");
  if (console.log("Usando preload desde:", e), v = new Pe({
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
      devTools: !q
      // Habilitar DevTools para depuración
    },
    // Configuración adicional para ventana de producción
    show: !1,
    // No mostrar hasta que esté lista
    minWidth: 1024,
    minHeight: 768,
    title: "Sistema de Inventario",
    autoHideMenuBar: q,
    // Ocultar barra de menú en producción
    menuBarVisible: !q
    // No mostrar el menú en producción
  }), v.webContents.on("before-input-event", (r, t) => {
    t.control && t.shift && t.key.toLowerCase() === "i" && (console.log("Abriendo DevTools"), v.webContents.openDevTools(), r.preventDefault());
  }), v.once("ready-to-show", () => {
    v.show();
  }), !q)
    v.webContents.openDevTools({ mode: "right" }), v.loadURL("http://localhost:5173");
  else {
    let r;
    (async () => {
      try {
        if (r = m.join(N, "index.html"), console.log("Intentando cargar desde:", r), !T.existsSync(r)) {
          console.log(
            "No se encontró index.html en la ruta principal, probando alternativas..."
          );
          const t = [
            m.join(I, "../../dist/index.html"),
            m.join(I, "../dist/index.html"),
            m.join(E.cwd(), "dist/index.html"),
            m.join(A.getAppPath(), "dist/index.html")
          ];
          console.log("Rutas alternativas a probar:", t);
          for (const c of t)
            if (console.log(`Comprobando ${c}: ${T.existsSync(c)}`), T.existsSync(c)) {
              r = c, console.log("Usando ruta alternativa:", r);
              break;
            }
          if (!T.existsSync(r)) {
            console.log(
              "No se encontró index.html en ninguna ruta alternativa"
            ), console.log("Usando HTML mínimo de emergencia"), v.loadURL(`data:text/html,
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
                  distPath: ${N}
                  __dirname: ${I}
                  cwd: ${E.cwd()}
                  appPath: ${A.getAppPath()}
                  resourcesPath: ${E.resourcesPath || "N/A"}
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
        console.log("Cargando desde:", r), console.log("El archivo existe:", T.existsSync(r));
        try {
          T.existsSync(r) ? v.loadFile(r).catch((t) => {
            console.error("Error al cargar el archivo:", t), v.loadURL(
              "data:text/html,<html><body><h1>Error al cargar la aplicación</h1><p>" + t.message + "</p></body></html>"
            );
          }) : (console.error("No se encontró el archivo index.html"), v.loadURL(
            "data:text/html,<html><body><h1>Error al cargar la aplicación</h1><p>No se encontró el archivo index.html</p></body></html>"
          ));
        } catch (t) {
          console.error("Error en loadFile:", t), v.loadURL(
            "data:text/html,<html><body><h1>Error al cargar la aplicación</h1><p>" + t.message + "</p></body></html>"
          );
        }
      } catch (t) {
        console.error("Error al intentar cargar el HTML:", t), v.loadURL(
          "data:text/html,<html><body><h1>Error</h1><p>" + t.message + "</p></body></html>"
        );
      }
    })().catch((t) => {
      console.error("Error al cargar el HTML:", t), v.loadURL(
        "data:text/html,<html><body><h1>Error</h1><p>" + t.message + "</p></body></html>"
      );
    });
  }
  v.on("closed", function() {
    v = null;
  });
}
function dr() {
  console.log("Configurando manejadores IPC..."), x.on("restart-app", () => {
    console.log("Reiniciando aplicación..."), A.relaunch(), A.exit(0);
  }), x.handle("get-all-products", async () => {
    try {
      console.log("Manejador: Obteniendo todos los productos");
      const e = await Je();
      return console.log("Productos obtenidos:", e.length), e;
    } catch (e) {
      return console.error("Error al obtener productos:", e), [];
    }
  }), x.handle("get-all-active-products", async () => {
    try {
      console.log("Manejador: Obteniendo productos activos");
      const e = await We();
      return console.log("Productos activos obtenidos:", e.length), e;
    } catch (e) {
      return console.error("Error al obtener productos activos:", e), [];
    }
  }), x.handle("get-product-by-id", async (e, r) => {
    try {
      console.log("Manejador: Obteniendo producto por ID:", r);
      const t = await Xe(r);
      return console.log("Producto por ID:", t), t;
    } catch (t) {
      return console.error("Error al obtener producto por ID:", t), null;
    }
  }), x.handle("get-product-by-barcode", async (e, r) => {
    try {
      console.log(
        "Manejador: Obteniendo producto por código de barras:",
        r
      );
      const t = await Ke(r);
      return console.log("Producto por código de barras:", t), t;
    } catch (t) {
      return console.error("Error al obtener producto por código:", t), null;
    }
  }), x.handle("create-product", async (e, r) => {
    try {
      console.log("Manejador: Creando producto:", r);
      const t = await Qe(r);
      return console.log("Producto creado:", t), t;
    } catch (t) {
      return console.error("Error al crear producto:", t), null;
    }
  }), x.handle("update-product", async (e, r) => {
    try {
      if (console.log("Manejador: Update product payload recibido:", r), !r || !r.id)
        return console.error("Estructura de payload inválida:", r), null;
      const { id: t, productData: c } = r;
      console.log("Actualizando producto:", t, c);
      const a = await Ye(t, c);
      return console.log("Producto actualizado:", a), a;
    } catch (t) {
      return console.error("Error al actualizar producto:", t), null;
    }
  }), x.handle("delete-product", async (e, r) => {
    try {
      console.log("Manejador: Eliminando producto:", r);
      const t = await Ze(r);
      return console.log("Producto eliminado:", t), t;
    } catch (t) {
      return console.error("Error al eliminar producto:", t), !1;
    }
  }), x.handle("search-products", async (e, r) => {
    try {
      console.log("Manejador: Buscando productos:", r);
      const t = await er(r);
      return console.log("Productos encontrados:", t.length), t;
    } catch (t) {
      return console.error("Error al buscar productos:", t), [];
    }
  }), x.handle("update-products-after-sync", async (e, r) => {
    try {
      console.log(
        "Manejador: Actualizando productos después de sincronización"
      );
      const t = await rr(r);
      return console.log("Resultado de actualización post-sincronización:", t), t;
    } catch (t) {
      throw console.error(
        "Error al actualizar productos después de sincronización:",
        t
      ), t;
    }
  }), x.handle("purge-deleted-products", async () => {
    try {
      console.log("Manejador: Purgando productos eliminados");
      const e = await tr();
      return console.log("Productos purgados:", e), e;
    } catch (e) {
      return console.error("Error al purgar productos eliminados:", e), 0;
    }
  }), x.handle("get-all-categories", async () => {
    try {
      console.log("Manejador: Obteniendo todas las categorías");
      const e = await or();
      return console.log("Categorías obtenidas:", e.length), e;
    } catch (e) {
      return console.error("Error al obtener categorías:", e), [];
    }
  }), x.handle("get-category-by-id", async (e, r) => {
    try {
      console.log("Manejador: Obteniendo categoría por ID:", r);
      const t = await nr(r);
      return console.log("Categoría por ID:", t), t;
    } catch (t) {
      return console.error("Error al obtener categoría por ID:", t), null;
    }
  }), x.handle("create-category", async (e, r) => {
    try {
      console.log("Manejador: Creando categoría:", r);
      const t = await ar(r);
      return console.log("Categoría creada:", t), t;
    } catch (t) {
      return console.error("Error al crear categoría:", t), null;
    }
  }), x.handle("update-category", async (e, r) => {
    try {
      if (console.log("Manejador: Update category payload recibido:", r), !r || !r.id)
        return console.error(
          "Estructura de payload inválida para categoría:",
          r
        ), null;
      const { id: t, categoryData: c } = r;
      console.log("Actualizando categoría:", t, c);
      const a = await ir(t, c);
      return console.log("Categoría actualizada:", a), a;
    } catch (t) {
      return console.error("Error al actualizar categoría:", t), null;
    }
  }), x.handle("delete-category", async (e, r) => {
    try {
      console.log("Manejador: Eliminando categoría:", r);
      const t = await cr(r);
      return console.log("Categoría eliminada:", t), t;
    } catch (t) {
      return console.error("Error al eliminar categoría:", t), !1;
    }
  }), console.log("Manejadores IPC configurados correctamente");
}
async function ur() {
  try {
    console.log("Inicializando base de datos..."), await Fe(), console.log("Base de datos inicializada correctamente");
    try {
      await lr(C.getQueryInterface(), re), console.log("Migraciones aplicadas correctamente");
    } catch (e) {
      console.error(
        "Error al aplicar migraciones (no crítico):",
        e
      );
    }
    return !0;
  } catch (e) {
    return console.error("Error crítico al inicializar la base de datos:", e), v && v.loadURL(`data:text/html,
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
  console.log("Aplicación inicializando..."), console.log("Ambiente:", E.env.NODE_ENV || "development"), console.log("Directorio de la aplicación:", I), console.log("Ruta de dist:", N);
  try {
    console.log(
      "Archivo index.html existe:",
      T.existsSync(m.join(N, "index.html"))
    ), console.log("Listado de directorios:");
    try {
      const e = m.join(I, "../../");
      console.log("Contenido de directorio raíz:", T.readdirSync(e)), T.existsSync(m.join(I, "../dist")) && console.log(
        "Contenido de ../dist:",
        T.readdirSync(m.join(I, "../dist"))
      );
    } catch (e) {
      console.error("Error al listar directorios:", e);
    }
  } catch (e) {
    console.error("Error al verificar archivo:", e);
  }
  try {
    await ur();
  } catch (e) {
    console.error("Error fatal en la base de datos:", e);
  }
  try {
    dr();
  } catch (e) {
    console.error("Error al configurar IPC handlers:", e);
  }
  try {
    Te(), console.log("Ventana creada con éxito");
  } catch (e) {
    console.error("Error al crear ventana:", e);
  }
});
A.on("window-all-closed", function() {
  E.platform !== "darwin" && A.quit();
});
A.on("activate", function() {
  v === null && Te();
});
E.on("uncaughtException", (e) => {
  console.error("Error no capturado:", e);
});
E.on("unhandledRejection", (e, r) => {
  console.error(`Promesa ${r} rechazada no manejada:`, e);
});
