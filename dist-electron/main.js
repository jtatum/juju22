import * as tn from "electron";
import Tu from "electron";
import X, { existsSync as xe, mkdirSync as Xr, createWriteStream as la, readdirSync as Vf } from "node:fs";
import ae, { join as $e, dirname as Uf, extname as Iu, basename as Bf } from "node:path";
import { pathToFileURL as Kf, fileURLToPath as Au } from "node:url";
import { createRequire as ku } from "node:module";
import { EventEmitter as zf } from "node:events";
import Di from "fs";
import rn from "path";
import Gf from "util";
import ce from "node:process";
import { promisify as pe, isDeepStrictEqual as xf } from "node:util";
import pt from "node:crypto";
import Yf from "node:assert";
import nn from "node:os";
import { readFile as qu } from "node:fs/promises";
import Fi from "process";
import Hf from "buffer";
import ua from "node:vm";
class Jf {
  emitter = new zf();
  emit(r) {
    this.emitter.emit(r.type, r.payload);
  }
  onPluginTrigger(r) {
    return this.emitter.on("plugin-trigger", r), () => this.emitter.off("plugin-trigger", r);
  }
}
function Tt(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Mt = { exports: {} };
function Cu(e) {
  throw new Error('Could not dynamically require "' + e + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var mt = {}, fa;
function Me() {
  return fa || (fa = 1, mt.getBooleanOption = (e, r) => {
    let a = !1;
    if (r in e && typeof (a = e[r]) != "boolean")
      throw new TypeError(`Expected the "${r}" option to be a boolean`);
    return a;
  }, mt.cppdb = Symbol(), mt.inspect = Symbol.for("nodejs.util.inspect.custom")), mt;
}
var Pn, da;
function Lu() {
  if (da) return Pn;
  da = 1;
  const e = { value: "SqliteError", writable: !0, enumerable: !1, configurable: !0 };
  function r(a, d) {
    if (new.target !== r)
      return new r(a, d);
    if (typeof d != "string")
      throw new TypeError("Expected second argument to be a string");
    Error.call(this, a), e.value = "" + a, Object.defineProperty(this, "message", e), Error.captureStackTrace(this, r), this.code = d;
  }
  return Object.setPrototypeOf(r, Error), Object.setPrototypeOf(r.prototype, Error.prototype), Object.defineProperty(r.prototype, "name", e), Pn = r, Pn;
}
var Dt = { exports: {} }, Tn, ha;
function Wf() {
  if (ha) return Tn;
  ha = 1;
  var e = rn.sep || "/";
  Tn = r;
  function r(a) {
    if (typeof a != "string" || a.length <= 7 || a.substring(0, 7) != "file://")
      throw new TypeError("must pass in a file:// URI to convert to a file path");
    var d = decodeURI(a.substring(7)), p = d.indexOf("/"), c = d.substring(0, p), o = d.substring(p + 1);
    return c == "localhost" && (c = ""), c && (c = e + e + c), o = o.replace(/^(.+)\|/, "$1:"), e == "\\" && (o = o.replace(/\//g, "\\")), /^.+\:/.test(o) || (o = e + o), c + o;
  }
  return Tn;
}
var pa;
function Xf() {
  return pa || (pa = 1, (function(e, r) {
    var a = Di, d = rn, p = Wf(), c = d.join, o = d.dirname, u = a.accessSync && function(t) {
      try {
        a.accessSync(t);
      } catch {
        return !1;
      }
      return !0;
    } || a.existsSync || d.existsSync, l = {
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
    function i(t) {
      typeof t == "string" ? t = { bindings: t } : t || (t = {}), Object.keys(l).map(function(v) {
        v in t || (t[v] = l[v]);
      }), t.module_root || (t.module_root = r.getRoot(r.getFileName())), d.extname(t.bindings) != ".node" && (t.bindings += ".node");
      for (var s = typeof __webpack_require__ == "function" ? __non_webpack_require__ : Cu, n = [], f = 0, h = t.try.length, y, m, g; f < h; f++) {
        y = c.apply(
          null,
          t.try[f].map(function(v) {
            return t[v] || v;
          })
        ), n.push(y);
        try {
          return m = t.path ? s.resolve(y) : s(y), t.path || (m.path = y), m;
        } catch (v) {
          if (v.code !== "MODULE_NOT_FOUND" && v.code !== "QUALIFIED_PATH_RESOLUTION_FAILED" && !/not find/i.test(v.message))
            throw v;
        }
      }
      throw g = new Error(
        `Could not locate the bindings file. Tried:
` + n.map(function(v) {
          return t.arrow + v;
        }).join(`
`)
      ), g.tries = n, g;
    }
    e.exports = r = i, r.getFileName = function(s) {
      var n = Error.prepareStackTrace, f = Error.stackTraceLimit, h = {}, y;
      Error.stackTraceLimit = 10, Error.prepareStackTrace = function(g, v) {
        for (var w = 0, b = v.length; w < b; w++)
          if (y = v[w].getFileName(), y !== __filename)
            if (s) {
              if (y !== s)
                return;
            } else
              return;
      }, Error.captureStackTrace(h), h.stack, Error.prepareStackTrace = n, Error.stackTraceLimit = f;
      var m = "file://";
      return y.indexOf(m) === 0 && (y = p(y)), y;
    }, r.getRoot = function(s) {
      for (var n = o(s), f; ; ) {
        if (n === "." && (n = process.cwd()), u(c(n, "package.json")) || u(c(n, "node_modules")))
          return n;
        if (f === n)
          throw new Error(
            'Could not find module root given file: "' + s + '". Do you have a `package.json` file? '
          );
        f = n, n = c(n, "..");
      }
    };
  })(Dt, Dt.exports)), Dt.exports;
}
var ke = {}, ma;
function Qf() {
  if (ma) return ke;
  ma = 1;
  const { cppdb: e } = Me();
  return ke.prepare = function(a) {
    return this[e].prepare(a, this, !1);
  }, ke.exec = function(a) {
    return this[e].exec(a), this;
  }, ke.close = function() {
    return this[e].close(), this;
  }, ke.loadExtension = function(...a) {
    return this[e].loadExtension(...a), this;
  }, ke.defaultSafeIntegers = function(...a) {
    return this[e].defaultSafeIntegers(...a), this;
  }, ke.unsafeMode = function(...a) {
    return this[e].unsafeMode(...a), this;
  }, ke.getters = {
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
  }, ke;
}
var In, ya;
function Zf() {
  if (ya) return In;
  ya = 1;
  const { cppdb: e } = Me(), r = /* @__PURE__ */ new WeakMap();
  In = function(c) {
    if (typeof c != "function") throw new TypeError("Expected first argument to be a function");
    const o = this[e], u = a(o, this), { apply: l } = Function.prototype, i = {
      default: { value: d(l, c, o, u.default) },
      deferred: { value: d(l, c, o, u.deferred) },
      immediate: { value: d(l, c, o, u.immediate) },
      exclusive: { value: d(l, c, o, u.exclusive) },
      database: { value: this, enumerable: !0 }
    };
    return Object.defineProperties(i.default.value, i), Object.defineProperties(i.deferred.value, i), Object.defineProperties(i.immediate.value, i), Object.defineProperties(i.exclusive.value, i), i.default.value;
  };
  const a = (p, c) => {
    let o = r.get(p);
    if (!o) {
      const u = {
        commit: p.prepare("COMMIT", c, !1),
        rollback: p.prepare("ROLLBACK", c, !1),
        savepoint: p.prepare("SAVEPOINT `	_bs3.	`", c, !1),
        release: p.prepare("RELEASE `	_bs3.	`", c, !1),
        rollbackTo: p.prepare("ROLLBACK TO `	_bs3.	`", c, !1)
      };
      r.set(p, o = {
        default: Object.assign({ begin: p.prepare("BEGIN", c, !1) }, u),
        deferred: Object.assign({ begin: p.prepare("BEGIN DEFERRED", c, !1) }, u),
        immediate: Object.assign({ begin: p.prepare("BEGIN IMMEDIATE", c, !1) }, u),
        exclusive: Object.assign({ begin: p.prepare("BEGIN EXCLUSIVE", c, !1) }, u)
      });
    }
    return o;
  }, d = (p, c, o, { begin: u, commit: l, rollback: i, savepoint: t, release: s, rollbackTo: n }) => function() {
    let h, y, m;
    o.inTransaction ? (h = t, y = s, m = n) : (h = u, y = l, m = i), h.run();
    try {
      const g = p.call(c, this, arguments);
      if (g && typeof g.then == "function")
        throw new TypeError("Transaction function cannot return a promise");
      return y.run(), g;
    } catch (g) {
      throw o.inTransaction && (m.run(), m !== i && y.run()), g;
    }
  };
  return In;
}
var An, ga;
function ed() {
  if (ga) return An;
  ga = 1;
  const { getBooleanOption: e, cppdb: r } = Me();
  return An = function(d, p) {
    if (p == null && (p = {}), typeof d != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof p != "object") throw new TypeError("Expected second argument to be an options object");
    const c = e(p, "simple"), o = this[r].prepare(`PRAGMA ${d}`, this, !0);
    return c ? o.pluck().get() : o.all();
  }, An;
}
var kn, va;
function td() {
  if (va) return kn;
  va = 1;
  const e = Di, r = rn, { promisify: a } = Gf, { cppdb: d } = Me(), p = a(e.access);
  kn = async function(u, l) {
    if (l == null && (l = {}), typeof u != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof l != "object") throw new TypeError("Expected second argument to be an options object");
    u = u.trim();
    const i = "attached" in l ? l.attached : "main", t = "progress" in l ? l.progress : null;
    if (!u) throw new TypeError("Backup filename cannot be an empty string");
    if (u === ":memory:") throw new TypeError('Invalid backup filename ":memory:"');
    if (typeof i != "string") throw new TypeError('Expected the "attached" option to be a string');
    if (!i) throw new TypeError('The "attached" option cannot be an empty string');
    if (t != null && typeof t != "function") throw new TypeError('Expected the "progress" option to be a function');
    await p(r.dirname(u)).catch(() => {
      throw new TypeError("Cannot save backup because the directory does not exist");
    });
    const s = await p(u).then(() => !1, () => !0);
    return c(this[d].backup(this, i, u, s), t || null);
  };
  const c = (o, u) => {
    let l = 0, i = !0;
    return new Promise((t, s) => {
      setImmediate(function n() {
        try {
          const f = o.transfer(l);
          if (!f.remainingPages) {
            o.close(), t(f);
            return;
          }
          if (i && (i = !1, l = 100), u) {
            const h = u(f);
            if (h !== void 0)
              if (typeof h == "number" && h === h) l = Math.max(0, Math.min(2147483647, Math.round(h)));
              else throw new TypeError("Expected progress callback to return a number or undefined");
          }
          setImmediate(n);
        } catch (f) {
          o.close(), s(f);
        }
      });
    });
  };
  return kn;
}
var qn, $a;
function rd() {
  if ($a) return qn;
  $a = 1;
  const { cppdb: e } = Me();
  return qn = function(a) {
    if (a == null && (a = {}), typeof a != "object") throw new TypeError("Expected first argument to be an options object");
    const d = "attached" in a ? a.attached : "main";
    if (typeof d != "string") throw new TypeError('Expected the "attached" option to be a string');
    if (!d) throw new TypeError('The "attached" option cannot be an empty string');
    return this[e].serialize(d);
  }, qn;
}
var Cn, wa;
function nd() {
  if (wa) return Cn;
  wa = 1;
  const { getBooleanOption: e, cppdb: r } = Me();
  return Cn = function(d, p, c) {
    if (p == null && (p = {}), typeof p == "function" && (c = p, p = {}), typeof d != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof c != "function") throw new TypeError("Expected last argument to be a function");
    if (typeof p != "object") throw new TypeError("Expected second argument to be an options object");
    if (!d) throw new TypeError("User-defined function name cannot be an empty string");
    const o = "safeIntegers" in p ? +e(p, "safeIntegers") : 2, u = e(p, "deterministic"), l = e(p, "directOnly"), i = e(p, "varargs");
    let t = -1;
    if (!i) {
      if (t = c.length, !Number.isInteger(t) || t < 0) throw new TypeError("Expected function.length to be a positive integer");
      if (t > 100) throw new RangeError("User-defined functions cannot have more than 100 arguments");
    }
    return this[r].function(c, d, t, o, u, l), this;
  }, Cn;
}
var Ln, ba;
function sd() {
  if (ba) return Ln;
  ba = 1;
  const { getBooleanOption: e, cppdb: r } = Me();
  Ln = function(c, o) {
    if (typeof c != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof o != "object" || o === null) throw new TypeError("Expected second argument to be an options object");
    if (!c) throw new TypeError("User-defined function name cannot be an empty string");
    const u = "start" in o ? o.start : null, l = a(o, "step", !0), i = a(o, "inverse", !1), t = a(o, "result", !1), s = "safeIntegers" in o ? +e(o, "safeIntegers") : 2, n = e(o, "deterministic"), f = e(o, "directOnly"), h = e(o, "varargs");
    let y = -1;
    if (!h && (y = Math.max(d(l), i ? d(i) : 0), y > 0 && (y -= 1), y > 100))
      throw new RangeError("User-defined functions cannot have more than 100 arguments");
    return this[r].aggregate(u, l, i, t, c, y, s, n, f), this;
  };
  const a = (p, c, o) => {
    const u = c in p ? p[c] : null;
    if (typeof u == "function") return u;
    if (u != null) throw new TypeError(`Expected the "${c}" option to be a function`);
    if (o) throw new TypeError(`Missing required option "${c}"`);
    return null;
  }, d = ({ length: p }) => {
    if (Number.isInteger(p) && p >= 0) return p;
    throw new TypeError("Expected function.length to be a positive integer");
  };
  return Ln;
}
var jn, Ea;
function id() {
  if (Ea) return jn;
  Ea = 1;
  const { cppdb: e } = Me();
  jn = function(f, h) {
    if (typeof f != "string") throw new TypeError("Expected first argument to be a string");
    if (!f) throw new TypeError("Virtual table module name cannot be an empty string");
    let y = !1;
    if (typeof h == "object" && h !== null)
      y = !0, h = s(a(h, "used", f));
    else {
      if (typeof h != "function") throw new TypeError("Expected second argument to be a function or a table definition object");
      h = r(h);
    }
    return this[e].table(h, f, y), this;
  };
  function r(n) {
    return function(h, y, m, ...g) {
      const v = {
        module: h,
        database: y,
        table: m
      }, w = l.call(n, v, g);
      if (typeof w != "object" || w === null)
        throw new TypeError(`Virtual table module "${h}" did not return a table definition object`);
      return a(w, "returned", h);
    };
  }
  function a(n, f, h) {
    if (!u.call(n, "rows"))
      throw new TypeError(`Virtual table module "${h}" ${f} a table definition without a "rows" property`);
    if (!u.call(n, "columns"))
      throw new TypeError(`Virtual table module "${h}" ${f} a table definition without a "columns" property`);
    const y = n.rows;
    if (typeof y != "function" || Object.getPrototypeOf(y) !== i)
      throw new TypeError(`Virtual table module "${h}" ${f} a table definition with an invalid "rows" property (should be a generator function)`);
    let m = n.columns;
    if (!Array.isArray(m) || !(m = [...m]).every(($) => typeof $ == "string"))
      throw new TypeError(`Virtual table module "${h}" ${f} a table definition with an invalid "columns" property (should be an array of strings)`);
    if (m.length !== new Set(m).size)
      throw new TypeError(`Virtual table module "${h}" ${f} a table definition with duplicate column names`);
    if (!m.length)
      throw new RangeError(`Virtual table module "${h}" ${f} a table definition with zero columns`);
    let g;
    if (u.call(n, "parameters")) {
      if (g = n.parameters, !Array.isArray(g) || !(g = [...g]).every(($) => typeof $ == "string"))
        throw new TypeError(`Virtual table module "${h}" ${f} a table definition with an invalid "parameters" property (should be an array of strings)`);
    } else
      g = o(y);
    if (g.length !== new Set(g).size)
      throw new TypeError(`Virtual table module "${h}" ${f} a table definition with duplicate parameter names`);
    if (g.length > 32)
      throw new RangeError(`Virtual table module "${h}" ${f} a table definition with more than the maximum number of 32 parameters`);
    for (const $ of g)
      if (m.includes($))
        throw new TypeError(`Virtual table module "${h}" ${f} a table definition with column "${$}" which was ambiguously defined as both a column and parameter`);
    let v = 2;
    if (u.call(n, "safeIntegers")) {
      const $ = n.safeIntegers;
      if (typeof $ != "boolean")
        throw new TypeError(`Virtual table module "${h}" ${f} a table definition with an invalid "safeIntegers" property (should be a boolean)`);
      v = +$;
    }
    let w = !1;
    if (u.call(n, "directOnly") && (w = n.directOnly, typeof w != "boolean"))
      throw new TypeError(`Virtual table module "${h}" ${f} a table definition with an invalid "directOnly" property (should be a boolean)`);
    return [
      `CREATE TABLE x(${[
        ...g.map(t).map(($) => `${$} HIDDEN`),
        ...m.map(t)
      ].join(", ")});`,
      d(y, new Map(m.map(($, E) => [$, g.length + E])), h),
      g,
      v,
      w
    ];
  }
  function d(n, f, h) {
    return function* (...m) {
      const g = m.map((v) => Buffer.isBuffer(v) ? Buffer.from(v) : v);
      for (let v = 0; v < f.size; ++v)
        g.push(null);
      for (const v of n(...m))
        if (Array.isArray(v))
          p(v, g, f.size, h), yield g;
        else if (typeof v == "object" && v !== null)
          c(v, g, f, h), yield g;
        else
          throw new TypeError(`Virtual table module "${h}" yielded something that isn't a valid row object`);
    };
  }
  function p(n, f, h, y) {
    if (n.length !== h)
      throw new TypeError(`Virtual table module "${y}" yielded a row with an incorrect number of columns`);
    const m = f.length - h;
    for (let g = 0; g < h; ++g)
      f[g + m] = n[g];
  }
  function c(n, f, h, y) {
    let m = 0;
    for (const g of Object.keys(n)) {
      const v = h.get(g);
      if (v === void 0)
        throw new TypeError(`Virtual table module "${y}" yielded a row with an undeclared column "${g}"`);
      f[v] = n[g], m += 1;
    }
    if (m !== h.size)
      throw new TypeError(`Virtual table module "${y}" yielded a row with missing columns`);
  }
  function o({ length: n }) {
    if (!Number.isInteger(n) || n < 0)
      throw new TypeError("Expected function.length to be a positive integer");
    const f = [];
    for (let h = 0; h < n; ++h)
      f.push(`$${h + 1}`);
    return f;
  }
  const { hasOwnProperty: u } = Object.prototype, { apply: l } = Function.prototype, i = Object.getPrototypeOf(function* () {
  }), t = (n) => `"${n.replace(/"/g, '""')}"`, s = (n) => () => n;
  return jn;
}
var Mn, Sa;
function ad() {
  if (Sa) return Mn;
  Sa = 1;
  const e = function() {
  };
  return Mn = function(a, d) {
    return Object.assign(new e(), this);
  }, Mn;
}
var Dn, _a;
function od() {
  if (_a) return Dn;
  _a = 1;
  const e = Di, r = rn, a = Me(), d = Lu();
  let p;
  function c(u, l) {
    if (new.target == null)
      return new c(u, l);
    let i;
    if (Buffer.isBuffer(u) && (i = u, u = ":memory:"), u == null && (u = ""), l == null && (l = {}), typeof u != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof l != "object") throw new TypeError("Expected second argument to be an options object");
    if ("readOnly" in l) throw new TypeError('Misspelled option "readOnly" should be "readonly"');
    if ("memory" in l) throw new TypeError('Option "memory" was removed in v7.0.0 (use ":memory:" filename instead)');
    const t = u.trim(), s = t === "" || t === ":memory:", n = a.getBooleanOption(l, "readonly"), f = a.getBooleanOption(l, "fileMustExist"), h = "timeout" in l ? l.timeout : 5e3, y = "verbose" in l ? l.verbose : null, m = "nativeBinding" in l ? l.nativeBinding : null;
    if (n && s && !i) throw new TypeError("In-memory/temporary databases cannot be readonly");
    if (!Number.isInteger(h) || h < 0) throw new TypeError('Expected the "timeout" option to be a positive integer');
    if (h > 2147483647) throw new RangeError('Option "timeout" cannot be greater than 2147483647');
    if (y != null && typeof y != "function") throw new TypeError('Expected the "verbose" option to be a function');
    if (m != null && typeof m != "string" && typeof m != "object") throw new TypeError('Expected the "nativeBinding" option to be a string or addon object');
    let g;
    if (m == null ? g = p || (p = Xf()("better_sqlite3.node")) : typeof m == "string" ? g = (typeof __non_webpack_require__ == "function" ? __non_webpack_require__ : Cu)(r.resolve(m).replace(/(\.node)?$/, ".node")) : g = m, g.isInitialized || (g.setErrorConstructor(d), g.isInitialized = !0), !s && !e.existsSync(r.dirname(t)))
      throw new TypeError("Cannot open database because the directory does not exist");
    Object.defineProperties(this, {
      [a.cppdb]: { value: new g.Database(t, u, s, n, f, h, y || null, i || null) },
      ...o.getters
    });
  }
  const o = Qf();
  return c.prototype.prepare = o.prepare, c.prototype.transaction = Zf(), c.prototype.pragma = ed(), c.prototype.backup = td(), c.prototype.serialize = rd(), c.prototype.function = nd(), c.prototype.aggregate = sd(), c.prototype.table = id(), c.prototype.loadExtension = o.loadExtension, c.prototype.exec = o.exec, c.prototype.close = o.close, c.prototype.defaultSafeIntegers = o.defaultSafeIntegers, c.prototype.unsafeMode = o.unsafeMode, c.prototype[a.inspect] = ad(), Dn = c, Dn;
}
var Na;
function cd() {
  return Na || (Na = 1, Mt.exports = od(), Mt.exports.SqliteError = Lu()), Mt.exports;
}
var ld = cd();
const ud = /* @__PURE__ */ Tt(ld), Ye = (e) => {
  const r = typeof e;
  return e !== null && (r === "object" || r === "function");
}, Fn = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), fd = new Set("0123456789");
function sn(e) {
  const r = [];
  let a = "", d = "start", p = !1;
  for (const c of e)
    switch (c) {
      case "\\": {
        if (d === "index")
          throw new Error("Invalid character in an index");
        if (d === "indexEnd")
          throw new Error("Invalid character after an index");
        p && (a += c), d = "property", p = !p;
        break;
      }
      case ".": {
        if (d === "index")
          throw new Error("Invalid character in an index");
        if (d === "indexEnd") {
          d = "property";
          break;
        }
        if (p) {
          p = !1, a += c;
          break;
        }
        if (Fn.has(a))
          return [];
        r.push(a), a = "", d = "property";
        break;
      }
      case "[": {
        if (d === "index")
          throw new Error("Invalid character in an index");
        if (d === "indexEnd") {
          d = "index";
          break;
        }
        if (p) {
          p = !1, a += c;
          break;
        }
        if (d === "property") {
          if (Fn.has(a))
            return [];
          r.push(a), a = "";
        }
        d = "index";
        break;
      }
      case "]": {
        if (d === "index") {
          r.push(Number.parseInt(a, 10)), a = "", d = "indexEnd";
          break;
        }
        if (d === "indexEnd")
          throw new Error("Invalid character after an index");
      }
      default: {
        if (d === "index" && !fd.has(c))
          throw new Error("Invalid character in an index");
        if (d === "indexEnd")
          throw new Error("Invalid character after an index");
        d === "start" && (d = "property"), p && (p = !1, a += "\\"), a += c;
      }
    }
  switch (p && (a += "\\"), d) {
    case "property": {
      if (Fn.has(a))
        return [];
      r.push(a);
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      r.push("");
      break;
    }
  }
  return r;
}
function Vi(e, r) {
  if (typeof r != "number" && Array.isArray(e)) {
    const a = Number.parseInt(r, 10);
    return Number.isInteger(a) && e[a] === e[r];
  }
  return !1;
}
function ju(e, r) {
  if (Vi(e, r))
    throw new Error("Cannot use string index");
}
function dd(e, r, a) {
  if (!Ye(e) || typeof r != "string")
    return a === void 0 ? e : a;
  const d = sn(r);
  if (d.length === 0)
    return a;
  for (let p = 0; p < d.length; p++) {
    const c = d[p];
    if (Vi(e, c) ? e = p === d.length - 1 ? void 0 : null : e = e[c], e == null) {
      if (p !== d.length - 1)
        return a;
      break;
    }
  }
  return e === void 0 ? a : e;
}
function Ra(e, r, a) {
  if (!Ye(e) || typeof r != "string")
    return e;
  const d = e, p = sn(r);
  for (let c = 0; c < p.length; c++) {
    const o = p[c];
    ju(e, o), c === p.length - 1 ? e[o] = a : Ye(e[o]) || (e[o] = typeof p[c + 1] == "number" ? [] : {}), e = e[o];
  }
  return d;
}
function hd(e, r) {
  if (!Ye(e) || typeof r != "string")
    return !1;
  const a = sn(r);
  for (let d = 0; d < a.length; d++) {
    const p = a[d];
    if (ju(e, p), d === a.length - 1)
      return delete e[p], !0;
    if (e = e[p], !Ye(e))
      return !1;
  }
}
function pd(e, r) {
  if (!Ye(e) || typeof r != "string")
    return !1;
  const a = sn(r);
  if (a.length === 0)
    return !1;
  for (const d of a) {
    if (!Ye(e) || !(d in e) || Vi(e, d))
      return !1;
    e = e[d];
  }
  return !0;
}
const Be = nn.homedir(), Ui = nn.tmpdir(), { env: ft } = ce, md = (e) => {
  const r = ae.join(Be, "Library");
  return {
    data: ae.join(r, "Application Support", e),
    config: ae.join(r, "Preferences", e),
    cache: ae.join(r, "Caches", e),
    log: ae.join(r, "Logs", e),
    temp: ae.join(Ui, e)
  };
}, yd = (e) => {
  const r = ft.APPDATA || ae.join(Be, "AppData", "Roaming"), a = ft.LOCALAPPDATA || ae.join(Be, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: ae.join(a, e, "Data"),
    config: ae.join(r, e, "Config"),
    cache: ae.join(a, e, "Cache"),
    log: ae.join(a, e, "Log"),
    temp: ae.join(Ui, e)
  };
}, gd = (e) => {
  const r = ae.basename(Be);
  return {
    data: ae.join(ft.XDG_DATA_HOME || ae.join(Be, ".local", "share"), e),
    config: ae.join(ft.XDG_CONFIG_HOME || ae.join(Be, ".config"), e),
    cache: ae.join(ft.XDG_CACHE_HOME || ae.join(Be, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: ae.join(ft.XDG_STATE_HOME || ae.join(Be, ".local", "state"), e),
    temp: ae.join(Ui, r, e)
  };
};
function vd(e, { suffix: r = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return r && (e += `-${r}`), ce.platform === "darwin" ? md(e) : ce.platform === "win32" ? yd(e) : gd(e);
}
const De = (e, r) => function(...d) {
  return e.apply(void 0, d).catch(r);
}, qe = (e, r) => function(...d) {
  try {
    return e.apply(void 0, d);
  } catch (p) {
    return r(p);
  }
}, $d = ce.getuid ? !ce.getuid() : !1, wd = 1e4, Se = () => {
}, oe = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!oe.isNodeError(e))
      return !1;
    const { code: r } = e;
    return r === "ENOSYS" || !$d && (r === "EINVAL" || r === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!oe.isNodeError(e))
      return !1;
    const { code: r } = e;
    return r === "EMFILE" || r === "ENFILE" || r === "EAGAIN" || r === "EBUSY" || r === "EACCESS" || r === "EACCES" || r === "EACCS" || r === "EPERM";
  },
  onChangeError: (e) => {
    if (!oe.isNodeError(e))
      throw e;
    if (!oe.isChangeErrorOk(e))
      throw e;
  }
};
class bd {
  constructor() {
    this.interval = 25, this.intervalId = void 0, this.limit = wd, this.queueActive = /* @__PURE__ */ new Set(), this.queueWaiting = /* @__PURE__ */ new Set(), this.init = () => {
      this.intervalId || (this.intervalId = setInterval(this.tick, this.interval));
    }, this.reset = () => {
      this.intervalId && (clearInterval(this.intervalId), delete this.intervalId);
    }, this.add = (r) => {
      this.queueWaiting.add(r), this.queueActive.size < this.limit / 2 ? this.tick() : this.init();
    }, this.remove = (r) => {
      this.queueWaiting.delete(r), this.queueActive.delete(r);
    }, this.schedule = () => new Promise((r) => {
      const a = () => this.remove(d), d = () => r(a);
      this.add(d);
    }), this.tick = () => {
      if (!(this.queueActive.size >= this.limit)) {
        if (!this.queueWaiting.size)
          return this.reset();
        for (const r of this.queueWaiting) {
          if (this.queueActive.size >= this.limit)
            break;
          this.queueWaiting.delete(r), this.queueActive.add(r), r();
        }
      }
    };
  }
}
const Ed = new bd(), Fe = (e, r) => function(d) {
  return function p(...c) {
    return Ed.schedule().then((o) => {
      const u = (i) => (o(), i), l = (i) => {
        if (o(), Date.now() >= d)
          throw i;
        if (r(i)) {
          const t = Math.round(100 * Math.random());
          return new Promise((n) => setTimeout(n, t)).then(() => p.apply(void 0, c));
        }
        throw i;
      };
      return e.apply(void 0, c).then(u, l);
    });
  };
}, Ve = (e, r) => function(d) {
  return function p(...c) {
    try {
      return e.apply(void 0, c);
    } catch (o) {
      if (Date.now() > d)
        throw o;
      if (r(o))
        return p.apply(void 0, c);
      throw o;
    }
  };
}, me = {
  attempt: {
    /* ASYNC */
    chmod: De(pe(X.chmod), oe.onChangeError),
    chown: De(pe(X.chown), oe.onChangeError),
    close: De(pe(X.close), Se),
    fsync: De(pe(X.fsync), Se),
    mkdir: De(pe(X.mkdir), Se),
    realpath: De(pe(X.realpath), Se),
    stat: De(pe(X.stat), Se),
    unlink: De(pe(X.unlink), Se),
    /* SYNC */
    chmodSync: qe(X.chmodSync, oe.onChangeError),
    chownSync: qe(X.chownSync, oe.onChangeError),
    closeSync: qe(X.closeSync, Se),
    existsSync: qe(X.existsSync, Se),
    fsyncSync: qe(X.fsync, Se),
    mkdirSync: qe(X.mkdirSync, Se),
    realpathSync: qe(X.realpathSync, Se),
    statSync: qe(X.statSync, Se),
    unlinkSync: qe(X.unlinkSync, Se)
  },
  retry: {
    /* ASYNC */
    close: Fe(pe(X.close), oe.isRetriableError),
    fsync: Fe(pe(X.fsync), oe.isRetriableError),
    open: Fe(pe(X.open), oe.isRetriableError),
    readFile: Fe(pe(X.readFile), oe.isRetriableError),
    rename: Fe(pe(X.rename), oe.isRetriableError),
    stat: Fe(pe(X.stat), oe.isRetriableError),
    write: Fe(pe(X.write), oe.isRetriableError),
    writeFile: Fe(pe(X.writeFile), oe.isRetriableError),
    /* SYNC */
    closeSync: Ve(X.closeSync, oe.isRetriableError),
    fsyncSync: Ve(X.fsyncSync, oe.isRetriableError),
    openSync: Ve(X.openSync, oe.isRetriableError),
    readFileSync: Ve(X.readFileSync, oe.isRetriableError),
    renameSync: Ve(X.renameSync, oe.isRetriableError),
    statSync: Ve(X.statSync, oe.isRetriableError),
    writeSync: Ve(X.writeSync, oe.isRetriableError),
    writeFileSync: Ve(X.writeFileSync, oe.isRetriableError)
  }
}, Sd = "utf8", Oa = 438, _d = 511, Nd = {}, Rd = nn.userInfo().uid, Od = nn.userInfo().gid, Pd = 1e3, Td = !!ce.getuid;
ce.getuid && ce.getuid();
const Pa = 128, Id = (e) => e instanceof Error && "code" in e, Ta = (e) => typeof e == "string", Vn = (e) => e === void 0, Ad = ce.platform === "linux", Mu = ce.platform === "win32", Bi = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
Mu || Bi.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
Ad && Bi.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
class kd {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (r) => {
      if (!this.exited) {
        this.exited = !0;
        for (const a of this.callbacks)
          a();
        r && (Mu && r !== "SIGINT" && r !== "SIGTERM" && r !== "SIGKILL" ? ce.kill(ce.pid, "SIGTERM") : ce.kill(ce.pid, r));
      }
    }, this.hook = () => {
      ce.once("exit", () => this.exit());
      for (const r of Bi)
        try {
          ce.once(r, () => this.exit(r));
        } catch {
        }
    }, this.register = (r) => (this.callbacks.add(r), () => {
      this.callbacks.delete(r);
    }), this.hook();
  }
}
const qd = new kd(), Cd = qd.register, ye = {
  /* VARIABLES */
  store: {},
  /* API */
  create: (e) => {
    const r = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), p = `.tmp-${Date.now().toString().slice(-10)}${r}`;
    return `${e}${p}`;
  },
  get: (e, r, a = !0) => {
    const d = ye.truncate(r(e));
    return d in ye.store ? ye.get(e, r, a) : (ye.store[d] = a, [d, () => delete ye.store[d]]);
  },
  purge: (e) => {
    ye.store[e] && (delete ye.store[e], me.attempt.unlink(e));
  },
  purgeSync: (e) => {
    ye.store[e] && (delete ye.store[e], me.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in ye.store)
      ye.purgeSync(e);
  },
  truncate: (e) => {
    const r = ae.basename(e);
    if (r.length <= Pa)
      return e;
    const a = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(r);
    if (!a)
      return e;
    const d = r.length - Pa;
    return `${e.slice(0, -r.length)}${a[1]}${a[2].slice(0, -d)}${a[3]}`;
  }
};
Cd(ye.purgeSyncAll);
function Du(e, r, a = Nd) {
  if (Ta(a))
    return Du(e, r, { encoding: a });
  const d = Date.now() + ((a.timeout ?? Pd) || -1);
  let p = null, c = null, o = null;
  try {
    const u = me.attempt.realpathSync(e), l = !!u;
    e = u || e, [c, p] = ye.get(e, a.tmpCreate || ye.create, a.tmpPurge !== !1);
    const i = Td && Vn(a.chown), t = Vn(a.mode);
    if (l && (i || t)) {
      const s = me.attempt.statSync(e);
      s && (a = { ...a }, i && (a.chown = { uid: s.uid, gid: s.gid }), t && (a.mode = s.mode));
    }
    if (!l) {
      const s = ae.dirname(e);
      me.attempt.mkdirSync(s, {
        mode: _d,
        recursive: !0
      });
    }
    o = me.retry.openSync(d)(c, "w", a.mode || Oa), a.tmpCreated && a.tmpCreated(c), Ta(r) ? me.retry.writeSync(d)(o, r, 0, a.encoding || Sd) : Vn(r) || me.retry.writeSync(d)(o, r, 0, r.length, 0), a.fsync !== !1 && (a.fsyncWait !== !1 ? me.retry.fsyncSync(d)(o) : me.attempt.fsync(o)), me.retry.closeSync(d)(o), o = null, a.chown && (a.chown.uid !== Rd || a.chown.gid !== Od) && me.attempt.chownSync(c, a.chown.uid, a.chown.gid), a.mode && a.mode !== Oa && me.attempt.chmodSync(c, a.mode);
    try {
      me.retry.renameSync(d)(c, e);
    } catch (s) {
      if (!Id(s) || s.code !== "ENAMETOOLONG")
        throw s;
      me.retry.renameSync(d)(c, ye.truncate(e));
    }
    p(), c = null;
  } finally {
    o && me.attempt.closeSync(o), c && ye.purge(c);
  }
}
var Ft = { exports: {} }, Un = {}, Ce = {}, Ke = {}, Bn = {}, Kn = {}, zn = {}, Ia;
function Qr() {
  return Ia || (Ia = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class r {
    }
    e._CodeOrName = r, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class a extends r {
      constructor(v) {
        if (super(), !e.IDENTIFIER.test(v))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = v;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return !1;
      }
      get names() {
        return { [this.str]: 1 };
      }
    }
    e.Name = a;
    class d extends r {
      constructor(v) {
        super(), this._items = typeof v == "string" ? [v] : v;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const v = this._items[0];
        return v === "" || v === '""';
      }
      get str() {
        var v;
        return (v = this._str) !== null && v !== void 0 ? v : this._str = this._items.reduce((w, b) => `${w}${b}`, "");
      }
      get names() {
        var v;
        return (v = this._names) !== null && v !== void 0 ? v : this._names = this._items.reduce((w, b) => (b instanceof a && (w[b.str] = (w[b.str] || 0) + 1), w), {});
      }
    }
    e._Code = d, e.nil = new d("");
    function p(g, ...v) {
      const w = [g[0]];
      let b = 0;
      for (; b < v.length; )
        u(w, v[b]), w.push(g[++b]);
      return new d(w);
    }
    e._ = p;
    const c = new d("+");
    function o(g, ...v) {
      const w = [f(g[0])];
      let b = 0;
      for (; b < v.length; )
        w.push(c), u(w, v[b]), w.push(c, f(g[++b]));
      return l(w), new d(w);
    }
    e.str = o;
    function u(g, v) {
      v instanceof d ? g.push(...v._items) : v instanceof a ? g.push(v) : g.push(s(v));
    }
    e.addCodeArg = u;
    function l(g) {
      let v = 1;
      for (; v < g.length - 1; ) {
        if (g[v] === c) {
          const w = i(g[v - 1], g[v + 1]);
          if (w !== void 0) {
            g.splice(v - 1, 3, w);
            continue;
          }
          g[v++] = "+";
        }
        v++;
      }
    }
    function i(g, v) {
      if (v === '""')
        return g;
      if (g === '""')
        return v;
      if (typeof g == "string")
        return v instanceof a || g[g.length - 1] !== '"' ? void 0 : typeof v != "string" ? `${g.slice(0, -1)}${v}"` : v[0] === '"' ? g.slice(0, -1) + v.slice(1) : void 0;
      if (typeof v == "string" && v[0] === '"' && !(g instanceof a))
        return `"${g}${v.slice(1)}`;
    }
    function t(g, v) {
      return v.emptyStr() ? g : g.emptyStr() ? v : o`${g}${v}`;
    }
    e.strConcat = t;
    function s(g) {
      return typeof g == "number" || typeof g == "boolean" || g === null ? g : f(Array.isArray(g) ? g.join(",") : g);
    }
    function n(g) {
      return new d(f(g));
    }
    e.stringify = n;
    function f(g) {
      return JSON.stringify(g).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = f;
    function h(g) {
      return typeof g == "string" && e.IDENTIFIER.test(g) ? new d(`.${g}`) : p`[${g}]`;
    }
    e.getProperty = h;
    function y(g) {
      if (typeof g == "string" && e.IDENTIFIER.test(g))
        return new d(`${g}`);
      throw new Error(`CodeGen: invalid export name: ${g}, use explicit $id name mapping`);
    }
    e.getEsmExportName = y;
    function m(g) {
      return new d(g.toString());
    }
    e.regexpCode = m;
  })(zn)), zn;
}
var Gn = {}, Aa;
function ka() {
  return Aa || (Aa = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const r = Qr();
    class a extends Error {
      constructor(i) {
        super(`CodeGen: "code" for ${i} not defined`), this.value = i.value;
      }
    }
    var d;
    (function(l) {
      l[l.Started = 0] = "Started", l[l.Completed = 1] = "Completed";
    })(d || (e.UsedValueState = d = {})), e.varKinds = {
      const: new r.Name("const"),
      let: new r.Name("let"),
      var: new r.Name("var")
    };
    class p {
      constructor({ prefixes: i, parent: t } = {}) {
        this._names = {}, this._prefixes = i, this._parent = t;
      }
      toName(i) {
        return i instanceof r.Name ? i : this.name(i);
      }
      name(i) {
        return new r.Name(this._newName(i));
      }
      _newName(i) {
        const t = this._names[i] || this._nameGroup(i);
        return `${i}${t.index++}`;
      }
      _nameGroup(i) {
        var t, s;
        if (!((s = (t = this._parent) === null || t === void 0 ? void 0 : t._prefixes) === null || s === void 0) && s.has(i) || this._prefixes && !this._prefixes.has(i))
          throw new Error(`CodeGen: prefix "${i}" is not allowed in this scope`);
        return this._names[i] = { prefix: i, index: 0 };
      }
    }
    e.Scope = p;
    class c extends r.Name {
      constructor(i, t) {
        super(t), this.prefix = i;
      }
      setValue(i, { property: t, itemIndex: s }) {
        this.value = i, this.scopePath = (0, r._)`.${new r.Name(t)}[${s}]`;
      }
    }
    e.ValueScopeName = c;
    const o = (0, r._)`\n`;
    class u extends p {
      constructor(i) {
        super(i), this._values = {}, this._scope = i.scope, this.opts = { ...i, _n: i.lines ? o : r.nil };
      }
      get() {
        return this._scope;
      }
      name(i) {
        return new c(i, this._newName(i));
      }
      value(i, t) {
        var s;
        if (t.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const n = this.toName(i), { prefix: f } = n, h = (s = t.key) !== null && s !== void 0 ? s : t.ref;
        let y = this._values[f];
        if (y) {
          const v = y.get(h);
          if (v)
            return v;
        } else
          y = this._values[f] = /* @__PURE__ */ new Map();
        y.set(h, n);
        const m = this._scope[f] || (this._scope[f] = []), g = m.length;
        return m[g] = t.ref, n.setValue(t, { property: f, itemIndex: g }), n;
      }
      getValue(i, t) {
        const s = this._values[i];
        if (s)
          return s.get(t);
      }
      scopeRefs(i, t = this._values) {
        return this._reduceValues(t, (s) => {
          if (s.scopePath === void 0)
            throw new Error(`CodeGen: name "${s}" has no value`);
          return (0, r._)`${i}${s.scopePath}`;
        });
      }
      scopeCode(i = this._values, t, s) {
        return this._reduceValues(i, (n) => {
          if (n.value === void 0)
            throw new Error(`CodeGen: name "${n}" has no value`);
          return n.value.code;
        }, t, s);
      }
      _reduceValues(i, t, s = {}, n) {
        let f = r.nil;
        for (const h in i) {
          const y = i[h];
          if (!y)
            continue;
          const m = s[h] = s[h] || /* @__PURE__ */ new Map();
          y.forEach((g) => {
            if (m.has(g))
              return;
            m.set(g, d.Started);
            let v = t(g);
            if (v) {
              const w = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              f = (0, r._)`${f}${w} ${g} = ${v};${this.opts._n}`;
            } else if (v = n?.(g))
              f = (0, r._)`${f}${v}${this.opts._n}`;
            else
              throw new a(g);
            m.set(g, d.Completed);
          });
        }
        return f;
      }
    }
    e.ValueScope = u;
  })(Gn)), Gn;
}
var qa;
function W() {
  return qa || (qa = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const r = Qr(), a = ka();
    var d = Qr();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return d._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return d.str;
    } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
      return d.strConcat;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return d.nil;
    } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
      return d.getProperty;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return d.stringify;
    } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
      return d.regexpCode;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return d.Name;
    } });
    var p = ka();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return p.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return p.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return p.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return p.varKinds;
    } }), e.operators = {
      GT: new r._Code(">"),
      GTE: new r._Code(">="),
      LT: new r._Code("<"),
      LTE: new r._Code("<="),
      EQ: new r._Code("==="),
      NEQ: new r._Code("!=="),
      NOT: new r._Code("!"),
      OR: new r._Code("||"),
      AND: new r._Code("&&"),
      ADD: new r._Code("+")
    };
    class c {
      optimizeNodes() {
        return this;
      }
      optimizeNames(_, R) {
        return this;
      }
    }
    class o extends c {
      constructor(_, R, M) {
        super(), this.varKind = _, this.name = R, this.rhs = M;
      }
      render({ es5: _, _n: R }) {
        const M = _ ? a.varKinds.var : this.varKind, Y = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${M} ${this.name}${Y};` + R;
      }
      optimizeNames(_, R) {
        if (_[this.name.str])
          return this.rhs && (this.rhs = q(this.rhs, _, R)), this;
      }
      get names() {
        return this.rhs instanceof r._CodeOrName ? this.rhs.names : {};
      }
    }
    class u extends c {
      constructor(_, R, M) {
        super(), this.lhs = _, this.rhs = R, this.sideEffects = M;
      }
      render({ _n: _ }) {
        return `${this.lhs} = ${this.rhs};` + _;
      }
      optimizeNames(_, R) {
        if (!(this.lhs instanceof r.Name && !_[this.lhs.str] && !this.sideEffects))
          return this.rhs = q(this.rhs, _, R), this;
      }
      get names() {
        const _ = this.lhs instanceof r.Name ? {} : { ...this.lhs.names };
        return z(_, this.rhs);
      }
    }
    class l extends u {
      constructor(_, R, M, Y) {
        super(_, M, Y), this.op = R;
      }
      render({ _n: _ }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + _;
      }
    }
    class i extends c {
      constructor(_) {
        super(), this.label = _, this.names = {};
      }
      render({ _n: _ }) {
        return `${this.label}:` + _;
      }
    }
    class t extends c {
      constructor(_) {
        super(), this.label = _, this.names = {};
      }
      render({ _n: _ }) {
        return `break${this.label ? ` ${this.label}` : ""};` + _;
      }
    }
    class s extends c {
      constructor(_) {
        super(), this.error = _;
      }
      render({ _n: _ }) {
        return `throw ${this.error};` + _;
      }
      get names() {
        return this.error.names;
      }
    }
    class n extends c {
      constructor(_) {
        super(), this.code = _;
      }
      render({ _n: _ }) {
        return `${this.code};` + _;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(_, R) {
        return this.code = q(this.code, _, R), this;
      }
      get names() {
        return this.code instanceof r._CodeOrName ? this.code.names : {};
      }
    }
    class f extends c {
      constructor(_ = []) {
        super(), this.nodes = _;
      }
      render(_) {
        return this.nodes.reduce((R, M) => R + M.render(_), "");
      }
      optimizeNodes() {
        const { nodes: _ } = this;
        let R = _.length;
        for (; R--; ) {
          const M = _[R].optimizeNodes();
          Array.isArray(M) ? _.splice(R, 1, ...M) : M ? _[R] = M : _.splice(R, 1);
        }
        return _.length > 0 ? this : void 0;
      }
      optimizeNames(_, R) {
        const { nodes: M } = this;
        let Y = M.length;
        for (; Y--; ) {
          const J = M[Y];
          J.optimizeNames(_, R) || (D(_, J.names), M.splice(Y, 1));
        }
        return M.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((_, R) => V(_, R.names), {});
      }
    }
    class h extends f {
      render(_) {
        return "{" + _._n + super.render(_) + "}" + _._n;
      }
    }
    class y extends f {
    }
    class m extends h {
    }
    m.kind = "else";
    class g extends h {
      constructor(_, R) {
        super(R), this.condition = _;
      }
      render(_) {
        let R = `if(${this.condition})` + super.render(_);
        return this.else && (R += "else " + this.else.render(_)), R;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const _ = this.condition;
        if (_ === !0)
          return this.nodes;
        let R = this.else;
        if (R) {
          const M = R.optimizeNodes();
          R = this.else = Array.isArray(M) ? new m(M) : M;
        }
        if (R)
          return _ === !1 ? R instanceof g ? R : R.nodes : this.nodes.length ? this : new g(G(_), R instanceof g ? [R] : R.nodes);
        if (!(_ === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(_, R) {
        var M;
        if (this.else = (M = this.else) === null || M === void 0 ? void 0 : M.optimizeNames(_, R), !!(super.optimizeNames(_, R) || this.else))
          return this.condition = q(this.condition, _, R), this;
      }
      get names() {
        const _ = super.names;
        return z(_, this.condition), this.else && V(_, this.else.names), _;
      }
    }
    g.kind = "if";
    class v extends h {
    }
    v.kind = "for";
    class w extends v {
      constructor(_) {
        super(), this.iteration = _;
      }
      render(_) {
        return `for(${this.iteration})` + super.render(_);
      }
      optimizeNames(_, R) {
        if (super.optimizeNames(_, R))
          return this.iteration = q(this.iteration, _, R), this;
      }
      get names() {
        return V(super.names, this.iteration.names);
      }
    }
    class b extends v {
      constructor(_, R, M, Y) {
        super(), this.varKind = _, this.name = R, this.from = M, this.to = Y;
      }
      render(_) {
        const R = _.es5 ? a.varKinds.var : this.varKind, { name: M, from: Y, to: J } = this;
        return `for(${R} ${M}=${Y}; ${M}<${J}; ${M}++)` + super.render(_);
      }
      get names() {
        const _ = z(super.names, this.from);
        return z(_, this.to);
      }
    }
    class $ extends v {
      constructor(_, R, M, Y) {
        super(), this.loop = _, this.varKind = R, this.name = M, this.iterable = Y;
      }
      render(_) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(_);
      }
      optimizeNames(_, R) {
        if (super.optimizeNames(_, R))
          return this.iterable = q(this.iterable, _, R), this;
      }
      get names() {
        return V(super.names, this.iterable.names);
      }
    }
    class E extends h {
      constructor(_, R, M) {
        super(), this.name = _, this.args = R, this.async = M;
      }
      render(_) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(_);
      }
    }
    E.kind = "func";
    class S extends f {
      render(_) {
        return "return " + super.render(_);
      }
    }
    S.kind = "return";
    class N extends h {
      render(_) {
        let R = "try" + super.render(_);
        return this.catch && (R += this.catch.render(_)), this.finally && (R += this.finally.render(_)), R;
      }
      optimizeNodes() {
        var _, R;
        return super.optimizeNodes(), (_ = this.catch) === null || _ === void 0 || _.optimizeNodes(), (R = this.finally) === null || R === void 0 || R.optimizeNodes(), this;
      }
      optimizeNames(_, R) {
        var M, Y;
        return super.optimizeNames(_, R), (M = this.catch) === null || M === void 0 || M.optimizeNames(_, R), (Y = this.finally) === null || Y === void 0 || Y.optimizeNames(_, R), this;
      }
      get names() {
        const _ = super.names;
        return this.catch && V(_, this.catch.names), this.finally && V(_, this.finally.names), _;
      }
    }
    class P extends h {
      constructor(_) {
        super(), this.error = _;
      }
      render(_) {
        return `catch(${this.error})` + super.render(_);
      }
    }
    P.kind = "catch";
    class j extends h {
      render(_) {
        return "finally" + super.render(_);
      }
    }
    j.kind = "finally";
    class A {
      constructor(_, R = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...R, _n: R.lines ? `
` : "" }, this._extScope = _, this._scope = new a.Scope({ parent: _ }), this._nodes = [new y()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(_) {
        return this._scope.name(_);
      }
      // reserves unique name in the external scope
      scopeName(_) {
        return this._extScope.name(_);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(_, R) {
        const M = this._extScope.value(_, R);
        return (this._values[M.prefix] || (this._values[M.prefix] = /* @__PURE__ */ new Set())).add(M), M;
      }
      getScopeValue(_, R) {
        return this._extScope.getValue(_, R);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(_) {
        return this._extScope.scopeRefs(_, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(_, R, M, Y) {
        const J = this._scope.toName(R);
        return M !== void 0 && Y && (this._constants[J.str] = M), this._leafNode(new o(_, J, M)), J;
      }
      // `const` declaration (`var` in es5 mode)
      const(_, R, M) {
        return this._def(a.varKinds.const, _, R, M);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(_, R, M) {
        return this._def(a.varKinds.let, _, R, M);
      }
      // `var` declaration with optional assignment
      var(_, R, M) {
        return this._def(a.varKinds.var, _, R, M);
      }
      // assignment code
      assign(_, R, M) {
        return this._leafNode(new u(_, R, M));
      }
      // `+=` code
      add(_, R) {
        return this._leafNode(new l(_, e.operators.ADD, R));
      }
      // appends passed SafeExpr to code or executes Block
      code(_) {
        return typeof _ == "function" ? _() : _ !== r.nil && this._leafNode(new n(_)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(..._) {
        const R = ["{"];
        for (const [M, Y] of _)
          R.length > 1 && R.push(","), R.push(M), (M !== Y || this.opts.es5) && (R.push(":"), (0, r.addCodeArg)(R, Y));
        return R.push("}"), new r._Code(R);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(_, R, M) {
        if (this._blockNode(new g(_)), R && M)
          this.code(R).else().code(M).endIf();
        else if (R)
          this.code(R).endIf();
        else if (M)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(_) {
        return this._elseNode(new g(_));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new m());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(g, m);
      }
      _for(_, R) {
        return this._blockNode(_), R && this.code(R).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(_, R) {
        return this._for(new w(_), R);
      }
      // `for` statement for a range of values
      forRange(_, R, M, Y, J = this.opts.es5 ? a.varKinds.var : a.varKinds.let) {
        const ne = this._scope.toName(_);
        return this._for(new b(J, ne, R, M), () => Y(ne));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(_, R, M, Y = a.varKinds.const) {
        const J = this._scope.toName(_);
        if (this.opts.es5) {
          const ne = R instanceof r.Name ? R : this.var("_arr", R);
          return this.forRange("_i", 0, (0, r._)`${ne}.length`, (te) => {
            this.var(J, (0, r._)`${ne}[${te}]`), M(J);
          });
        }
        return this._for(new $("of", Y, J, R), () => M(J));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(_, R, M, Y = this.opts.es5 ? a.varKinds.var : a.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(_, (0, r._)`Object.keys(${R})`, M);
        const J = this._scope.toName(_);
        return this._for(new $("in", Y, J, R), () => M(J));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(v);
      }
      // `label` statement
      label(_) {
        return this._leafNode(new i(_));
      }
      // `break` statement
      break(_) {
        return this._leafNode(new t(_));
      }
      // `return` statement
      return(_) {
        const R = new S();
        if (this._blockNode(R), this.code(_), R.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(S);
      }
      // `try` statement
      try(_, R, M) {
        if (!R && !M)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const Y = new N();
        if (this._blockNode(Y), this.code(_), R) {
          const J = this.name("e");
          this._currNode = Y.catch = new P(J), R(J);
        }
        return M && (this._currNode = Y.finally = new j(), this.code(M)), this._endBlockNode(P, j);
      }
      // `throw` statement
      throw(_) {
        return this._leafNode(new s(_));
      }
      // start self-balancing block
      block(_, R) {
        return this._blockStarts.push(this._nodes.length), _ && this.code(_).endBlock(R), this;
      }
      // end the current self-balancing block
      endBlock(_) {
        const R = this._blockStarts.pop();
        if (R === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const M = this._nodes.length - R;
        if (M < 0 || _ !== void 0 && M !== _)
          throw new Error(`CodeGen: wrong number of nodes: ${M} vs ${_} expected`);
        return this._nodes.length = R, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(_, R = r.nil, M, Y) {
        return this._blockNode(new E(_, R, M)), Y && this.code(Y).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(E);
      }
      optimize(_ = 1) {
        for (; _-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(_) {
        return this._currNode.nodes.push(_), this;
      }
      _blockNode(_) {
        this._currNode.nodes.push(_), this._nodes.push(_);
      }
      _endBlockNode(_, R) {
        const M = this._currNode;
        if (M instanceof _ || R && M instanceof R)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${R ? `${_.kind}/${R.kind}` : _.kind}"`);
      }
      _elseNode(_) {
        const R = this._currNode;
        if (!(R instanceof g))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = R.else = _, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const _ = this._nodes;
        return _[_.length - 1];
      }
      set _currNode(_) {
        const R = this._nodes;
        R[R.length - 1] = _;
      }
    }
    e.CodeGen = A;
    function V(T, _) {
      for (const R in _)
        T[R] = (T[R] || 0) + (_[R] || 0);
      return T;
    }
    function z(T, _) {
      return _ instanceof r._CodeOrName ? V(T, _.names) : T;
    }
    function q(T, _, R) {
      if (T instanceof r.Name)
        return M(T);
      if (!Y(T))
        return T;
      return new r._Code(T._items.reduce((J, ne) => (ne instanceof r.Name && (ne = M(ne)), ne instanceof r._Code ? J.push(...ne._items) : J.push(ne), J), []));
      function M(J) {
        const ne = R[J.str];
        return ne === void 0 || _[J.str] !== 1 ? J : (delete _[J.str], ne);
      }
      function Y(J) {
        return J instanceof r._Code && J._items.some((ne) => ne instanceof r.Name && _[ne.str] === 1 && R[ne.str] !== void 0);
      }
    }
    function D(T, _) {
      for (const R in _)
        T[R] = (T[R] || 0) - (_[R] || 0);
    }
    function G(T) {
      return typeof T == "boolean" || typeof T == "number" || T === null ? !T : (0, r._)`!${C(T)}`;
    }
    e.not = G;
    const F = O(e.operators.AND);
    function B(...T) {
      return T.reduce(F);
    }
    e.and = B;
    const K = O(e.operators.OR);
    function L(...T) {
      return T.reduce(K);
    }
    e.or = L;
    function O(T) {
      return (_, R) => _ === r.nil ? R : R === r.nil ? _ : (0, r._)`${C(_)} ${T} ${C(R)}`;
    }
    function C(T) {
      return T instanceof r.Name ? T : (0, r._)`(${T})`;
    }
  })(Kn)), Kn;
}
var Q = {}, Ca;
function ee() {
  if (Ca) return Q;
  Ca = 1, Object.defineProperty(Q, "__esModule", { value: !0 }), Q.checkStrictMode = Q.getErrorPath = Q.Type = Q.useFunc = Q.setEvaluated = Q.evaluatedPropsToName = Q.mergeEvaluated = Q.eachItem = Q.unescapeJsonPointer = Q.escapeJsonPointer = Q.escapeFragment = Q.unescapeFragment = Q.schemaRefOrVal = Q.schemaHasRulesButRef = Q.schemaHasRules = Q.checkUnknownRules = Q.alwaysValidSchema = Q.toHash = void 0;
  const e = W(), r = Qr();
  function a($) {
    const E = {};
    for (const S of $)
      E[S] = !0;
    return E;
  }
  Q.toHash = a;
  function d($, E) {
    return typeof E == "boolean" ? E : Object.keys(E).length === 0 ? !0 : (p($, E), !c(E, $.self.RULES.all));
  }
  Q.alwaysValidSchema = d;
  function p($, E = $.schema) {
    const { opts: S, self: N } = $;
    if (!S.strictSchema || typeof E == "boolean")
      return;
    const P = N.RULES.keywords;
    for (const j in E)
      P[j] || b($, `unknown keyword: "${j}"`);
  }
  Q.checkUnknownRules = p;
  function c($, E) {
    if (typeof $ == "boolean")
      return !$;
    for (const S in $)
      if (E[S])
        return !0;
    return !1;
  }
  Q.schemaHasRules = c;
  function o($, E) {
    if (typeof $ == "boolean")
      return !$;
    for (const S in $)
      if (S !== "$ref" && E.all[S])
        return !0;
    return !1;
  }
  Q.schemaHasRulesButRef = o;
  function u({ topSchemaRef: $, schemaPath: E }, S, N, P) {
    if (!P) {
      if (typeof S == "number" || typeof S == "boolean")
        return S;
      if (typeof S == "string")
        return (0, e._)`${S}`;
    }
    return (0, e._)`${$}${E}${(0, e.getProperty)(N)}`;
  }
  Q.schemaRefOrVal = u;
  function l($) {
    return s(decodeURIComponent($));
  }
  Q.unescapeFragment = l;
  function i($) {
    return encodeURIComponent(t($));
  }
  Q.escapeFragment = i;
  function t($) {
    return typeof $ == "number" ? `${$}` : $.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  Q.escapeJsonPointer = t;
  function s($) {
    return $.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  Q.unescapeJsonPointer = s;
  function n($, E) {
    if (Array.isArray($))
      for (const S of $)
        E(S);
    else
      E($);
  }
  Q.eachItem = n;
  function f({ mergeNames: $, mergeToName: E, mergeValues: S, resultToName: N }) {
    return (P, j, A, V) => {
      const z = A === void 0 ? j : A instanceof e.Name ? (j instanceof e.Name ? $(P, j, A) : E(P, j, A), A) : j instanceof e.Name ? (E(P, A, j), j) : S(j, A);
      return V === e.Name && !(z instanceof e.Name) ? N(P, z) : z;
    };
  }
  Q.mergeEvaluated = {
    props: f({
      mergeNames: ($, E, S) => $.if((0, e._)`${S} !== true && ${E} !== undefined`, () => {
        $.if((0, e._)`${E} === true`, () => $.assign(S, !0), () => $.assign(S, (0, e._)`${S} || {}`).code((0, e._)`Object.assign(${S}, ${E})`));
      }),
      mergeToName: ($, E, S) => $.if((0, e._)`${S} !== true`, () => {
        E === !0 ? $.assign(S, !0) : ($.assign(S, (0, e._)`${S} || {}`), y($, S, E));
      }),
      mergeValues: ($, E) => $ === !0 ? !0 : { ...$, ...E },
      resultToName: h
    }),
    items: f({
      mergeNames: ($, E, S) => $.if((0, e._)`${S} !== true && ${E} !== undefined`, () => $.assign(S, (0, e._)`${E} === true ? true : ${S} > ${E} ? ${S} : ${E}`)),
      mergeToName: ($, E, S) => $.if((0, e._)`${S} !== true`, () => $.assign(S, E === !0 ? !0 : (0, e._)`${S} > ${E} ? ${S} : ${E}`)),
      mergeValues: ($, E) => $ === !0 ? !0 : Math.max($, E),
      resultToName: ($, E) => $.var("items", E)
    })
  };
  function h($, E) {
    if (E === !0)
      return $.var("props", !0);
    const S = $.var("props", (0, e._)`{}`);
    return E !== void 0 && y($, S, E), S;
  }
  Q.evaluatedPropsToName = h;
  function y($, E, S) {
    Object.keys(S).forEach((N) => $.assign((0, e._)`${E}${(0, e.getProperty)(N)}`, !0));
  }
  Q.setEvaluated = y;
  const m = {};
  function g($, E) {
    return $.scopeValue("func", {
      ref: E,
      code: m[E.code] || (m[E.code] = new r._Code(E.code))
    });
  }
  Q.useFunc = g;
  var v;
  (function($) {
    $[$.Num = 0] = "Num", $[$.Str = 1] = "Str";
  })(v || (Q.Type = v = {}));
  function w($, E, S) {
    if ($ instanceof e.Name) {
      const N = E === v.Num;
      return S ? N ? (0, e._)`"[" + ${$} + "]"` : (0, e._)`"['" + ${$} + "']"` : N ? (0, e._)`"/" + ${$}` : (0, e._)`"/" + ${$}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return S ? (0, e.getProperty)($).toString() : "/" + t($);
  }
  Q.getErrorPath = w;
  function b($, E, S = $.opts.strictSchema) {
    if (S) {
      if (E = `strict mode: ${E}`, S === !0)
        throw new Error(E);
      $.self.logger.warn(E);
    }
  }
  return Q.checkStrictMode = b, Q;
}
var Vt = {}, La;
function Pe() {
  if (La) return Vt;
  La = 1, Object.defineProperty(Vt, "__esModule", { value: !0 });
  const e = W(), r = {
    // validation function arguments
    data: new e.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new e.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new e.Name("instancePath"),
    parentData: new e.Name("parentData"),
    parentDataProperty: new e.Name("parentDataProperty"),
    rootData: new e.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new e.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new e.Name("vErrors"),
    // null or array of validation errors
    errors: new e.Name("errors"),
    // counter of validation errors
    this: new e.Name("this"),
    // "globals"
    self: new e.Name("self"),
    scope: new e.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new e.Name("json"),
    jsonPos: new e.Name("jsonPos"),
    jsonLen: new e.Name("jsonLen"),
    jsonPart: new e.Name("jsonPart")
  };
  return Vt.default = r, Vt;
}
var ja;
function an() {
  return ja || (ja = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const r = W(), a = ee(), d = Pe();
    e.keywordError = {
      message: ({ keyword: m }) => (0, r.str)`must pass "${m}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: m, schemaType: g }) => g ? (0, r.str)`"${m}" keyword must be ${g} ($data)` : (0, r.str)`"${m}" keyword is invalid ($data)`
    };
    function p(m, g = e.keywordError, v, w) {
      const { it: b } = m, { gen: $, compositeRule: E, allErrors: S } = b, N = s(m, g, v);
      w ?? (E || S) ? l($, N) : i(b, (0, r._)`[${N}]`);
    }
    e.reportError = p;
    function c(m, g = e.keywordError, v) {
      const { it: w } = m, { gen: b, compositeRule: $, allErrors: E } = w, S = s(m, g, v);
      l(b, S), $ || E || i(w, d.default.vErrors);
    }
    e.reportExtraError = c;
    function o(m, g) {
      m.assign(d.default.errors, g), m.if((0, r._)`${d.default.vErrors} !== null`, () => m.if(g, () => m.assign((0, r._)`${d.default.vErrors}.length`, g), () => m.assign(d.default.vErrors, null)));
    }
    e.resetErrorsCount = o;
    function u({ gen: m, keyword: g, schemaValue: v, data: w, errsCount: b, it: $ }) {
      if (b === void 0)
        throw new Error("ajv implementation error");
      const E = m.name("err");
      m.forRange("i", b, d.default.errors, (S) => {
        m.const(E, (0, r._)`${d.default.vErrors}[${S}]`), m.if((0, r._)`${E}.instancePath === undefined`, () => m.assign((0, r._)`${E}.instancePath`, (0, r.strConcat)(d.default.instancePath, $.errorPath))), m.assign((0, r._)`${E}.schemaPath`, (0, r.str)`${$.errSchemaPath}/${g}`), $.opts.verbose && (m.assign((0, r._)`${E}.schema`, v), m.assign((0, r._)`${E}.data`, w));
      });
    }
    e.extendErrors = u;
    function l(m, g) {
      const v = m.const("err", g);
      m.if((0, r._)`${d.default.vErrors} === null`, () => m.assign(d.default.vErrors, (0, r._)`[${v}]`), (0, r._)`${d.default.vErrors}.push(${v})`), m.code((0, r._)`${d.default.errors}++`);
    }
    function i(m, g) {
      const { gen: v, validateName: w, schemaEnv: b } = m;
      b.$async ? v.throw((0, r._)`new ${m.ValidationError}(${g})`) : (v.assign((0, r._)`${w}.errors`, g), v.return(!1));
    }
    const t = {
      keyword: new r.Name("keyword"),
      schemaPath: new r.Name("schemaPath"),
      // also used in JTD errors
      params: new r.Name("params"),
      propertyName: new r.Name("propertyName"),
      message: new r.Name("message"),
      schema: new r.Name("schema"),
      parentSchema: new r.Name("parentSchema")
    };
    function s(m, g, v) {
      const { createErrors: w } = m.it;
      return w === !1 ? (0, r._)`{}` : n(m, g, v);
    }
    function n(m, g, v = {}) {
      const { gen: w, it: b } = m, $ = [
        f(b, v),
        h(m, v)
      ];
      return y(m, g, $), w.object(...$);
    }
    function f({ errorPath: m }, { instancePath: g }) {
      const v = g ? (0, r.str)`${m}${(0, a.getErrorPath)(g, a.Type.Str)}` : m;
      return [d.default.instancePath, (0, r.strConcat)(d.default.instancePath, v)];
    }
    function h({ keyword: m, it: { errSchemaPath: g } }, { schemaPath: v, parentSchema: w }) {
      let b = w ? g : (0, r.str)`${g}/${m}`;
      return v && (b = (0, r.str)`${b}${(0, a.getErrorPath)(v, a.Type.Str)}`), [t.schemaPath, b];
    }
    function y(m, { params: g, message: v }, w) {
      const { keyword: b, data: $, schemaValue: E, it: S } = m, { opts: N, propertyName: P, topSchemaRef: j, schemaPath: A } = S;
      w.push([t.keyword, b], [t.params, typeof g == "function" ? g(m) : g || (0, r._)`{}`]), N.messages && w.push([t.message, typeof v == "function" ? v(m) : v]), N.verbose && w.push([t.schema, E], [t.parentSchema, (0, r._)`${j}${A}`], [d.default.data, $]), P && w.push([t.propertyName, P]);
    }
  })(Bn)), Bn;
}
var Ma;
function Ld() {
  if (Ma) return Ke;
  Ma = 1, Object.defineProperty(Ke, "__esModule", { value: !0 }), Ke.boolOrEmptySchema = Ke.topBoolOrEmptySchema = void 0;
  const e = an(), r = W(), a = Pe(), d = {
    message: "boolean schema is false"
  };
  function p(u) {
    const { gen: l, schema: i, validateName: t } = u;
    i === !1 ? o(u, !1) : typeof i == "object" && i.$async === !0 ? l.return(a.default.data) : (l.assign((0, r._)`${t}.errors`, null), l.return(!0));
  }
  Ke.topBoolOrEmptySchema = p;
  function c(u, l) {
    const { gen: i, schema: t } = u;
    t === !1 ? (i.var(l, !1), o(u)) : i.var(l, !0);
  }
  Ke.boolOrEmptySchema = c;
  function o(u, l) {
    const { gen: i, data: t } = u, s = {
      gen: i,
      keyword: "false schema",
      data: t,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: u
    };
    (0, e.reportError)(s, d, void 0, l);
  }
  return Ke;
}
var he = {}, ze = {}, Da;
function Fu() {
  if (Da) return ze;
  Da = 1, Object.defineProperty(ze, "__esModule", { value: !0 }), ze.getRules = ze.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], r = new Set(e);
  function a(p) {
    return typeof p == "string" && r.has(p);
  }
  ze.isJSONType = a;
  function d() {
    const p = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...p, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, p.number, p.string, p.array, p.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return ze.getRules = d, ze;
}
var Le = {}, Fa;
function Vu() {
  if (Fa) return Le;
  Fa = 1, Object.defineProperty(Le, "__esModule", { value: !0 }), Le.shouldUseRule = Le.shouldUseGroup = Le.schemaHasRulesForType = void 0;
  function e({ schema: d, self: p }, c) {
    const o = p.RULES.types[c];
    return o && o !== !0 && r(d, o);
  }
  Le.schemaHasRulesForType = e;
  function r(d, p) {
    return p.rules.some((c) => a(d, c));
  }
  Le.shouldUseGroup = r;
  function a(d, p) {
    var c;
    return d[p.keyword] !== void 0 || ((c = p.definition.implements) === null || c === void 0 ? void 0 : c.some((o) => d[o] !== void 0));
  }
  return Le.shouldUseRule = a, Le;
}
var Va;
function Zr() {
  if (Va) return he;
  Va = 1, Object.defineProperty(he, "__esModule", { value: !0 }), he.reportTypeError = he.checkDataTypes = he.checkDataType = he.coerceAndCheckDataType = he.getJSONTypes = he.getSchemaTypes = he.DataType = void 0;
  const e = Fu(), r = Vu(), a = an(), d = W(), p = ee();
  var c;
  (function(v) {
    v[v.Correct = 0] = "Correct", v[v.Wrong = 1] = "Wrong";
  })(c || (he.DataType = c = {}));
  function o(v) {
    const w = u(v.type);
    if (w.includes("null")) {
      if (v.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!w.length && v.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      v.nullable === !0 && w.push("null");
    }
    return w;
  }
  he.getSchemaTypes = o;
  function u(v) {
    const w = Array.isArray(v) ? v : v ? [v] : [];
    if (w.every(e.isJSONType))
      return w;
    throw new Error("type must be JSONType or JSONType[]: " + w.join(","));
  }
  he.getJSONTypes = u;
  function l(v, w) {
    const { gen: b, data: $, opts: E } = v, S = t(w, E.coerceTypes), N = w.length > 0 && !(S.length === 0 && w.length === 1 && (0, r.schemaHasRulesForType)(v, w[0]));
    if (N) {
      const P = h(w, $, E.strictNumbers, c.Wrong);
      b.if(P, () => {
        S.length ? s(v, w, S) : m(v);
      });
    }
    return N;
  }
  he.coerceAndCheckDataType = l;
  const i = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function t(v, w) {
    return w ? v.filter((b) => i.has(b) || w === "array" && b === "array") : [];
  }
  function s(v, w, b) {
    const { gen: $, data: E, opts: S } = v, N = $.let("dataType", (0, d._)`typeof ${E}`), P = $.let("coerced", (0, d._)`undefined`);
    S.coerceTypes === "array" && $.if((0, d._)`${N} == 'object' && Array.isArray(${E}) && ${E}.length == 1`, () => $.assign(E, (0, d._)`${E}[0]`).assign(N, (0, d._)`typeof ${E}`).if(h(w, E, S.strictNumbers), () => $.assign(P, E))), $.if((0, d._)`${P} !== undefined`);
    for (const A of b)
      (i.has(A) || A === "array" && S.coerceTypes === "array") && j(A);
    $.else(), m(v), $.endIf(), $.if((0, d._)`${P} !== undefined`, () => {
      $.assign(E, P), n(v, P);
    });
    function j(A) {
      switch (A) {
        case "string":
          $.elseIf((0, d._)`${N} == "number" || ${N} == "boolean"`).assign(P, (0, d._)`"" + ${E}`).elseIf((0, d._)`${E} === null`).assign(P, (0, d._)`""`);
          return;
        case "number":
          $.elseIf((0, d._)`${N} == "boolean" || ${E} === null
              || (${N} == "string" && ${E} && ${E} == +${E})`).assign(P, (0, d._)`+${E}`);
          return;
        case "integer":
          $.elseIf((0, d._)`${N} === "boolean" || ${E} === null
              || (${N} === "string" && ${E} && ${E} == +${E} && !(${E} % 1))`).assign(P, (0, d._)`+${E}`);
          return;
        case "boolean":
          $.elseIf((0, d._)`${E} === "false" || ${E} === 0 || ${E} === null`).assign(P, !1).elseIf((0, d._)`${E} === "true" || ${E} === 1`).assign(P, !0);
          return;
        case "null":
          $.elseIf((0, d._)`${E} === "" || ${E} === 0 || ${E} === false`), $.assign(P, null);
          return;
        case "array":
          $.elseIf((0, d._)`${N} === "string" || ${N} === "number"
              || ${N} === "boolean" || ${E} === null`).assign(P, (0, d._)`[${E}]`);
      }
    }
  }
  function n({ gen: v, parentData: w, parentDataProperty: b }, $) {
    v.if((0, d._)`${w} !== undefined`, () => v.assign((0, d._)`${w}[${b}]`, $));
  }
  function f(v, w, b, $ = c.Correct) {
    const E = $ === c.Correct ? d.operators.EQ : d.operators.NEQ;
    let S;
    switch (v) {
      case "null":
        return (0, d._)`${w} ${E} null`;
      case "array":
        S = (0, d._)`Array.isArray(${w})`;
        break;
      case "object":
        S = (0, d._)`${w} && typeof ${w} == "object" && !Array.isArray(${w})`;
        break;
      case "integer":
        S = N((0, d._)`!(${w} % 1) && !isNaN(${w})`);
        break;
      case "number":
        S = N();
        break;
      default:
        return (0, d._)`typeof ${w} ${E} ${v}`;
    }
    return $ === c.Correct ? S : (0, d.not)(S);
    function N(P = d.nil) {
      return (0, d.and)((0, d._)`typeof ${w} == "number"`, P, b ? (0, d._)`isFinite(${w})` : d.nil);
    }
  }
  he.checkDataType = f;
  function h(v, w, b, $) {
    if (v.length === 1)
      return f(v[0], w, b, $);
    let E;
    const S = (0, p.toHash)(v);
    if (S.array && S.object) {
      const N = (0, d._)`typeof ${w} != "object"`;
      E = S.null ? N : (0, d._)`!${w} || ${N}`, delete S.null, delete S.array, delete S.object;
    } else
      E = d.nil;
    S.number && delete S.integer;
    for (const N in S)
      E = (0, d.and)(E, f(N, w, b, $));
    return E;
  }
  he.checkDataTypes = h;
  const y = {
    message: ({ schema: v }) => `must be ${v}`,
    params: ({ schema: v, schemaValue: w }) => typeof v == "string" ? (0, d._)`{type: ${v}}` : (0, d._)`{type: ${w}}`
  };
  function m(v) {
    const w = g(v);
    (0, a.reportError)(w, y);
  }
  he.reportTypeError = m;
  function g(v) {
    const { gen: w, data: b, schema: $ } = v, E = (0, p.schemaRefOrVal)(v, $, "type");
    return {
      gen: w,
      keyword: "type",
      data: b,
      schema: $.type,
      schemaCode: E,
      schemaValue: E,
      parentSchema: $,
      params: {},
      it: v
    };
  }
  return he;
}
var yt = {}, Ua;
function jd() {
  if (Ua) return yt;
  Ua = 1, Object.defineProperty(yt, "__esModule", { value: !0 }), yt.assignDefaults = void 0;
  const e = W(), r = ee();
  function a(p, c) {
    const { properties: o, items: u } = p.schema;
    if (c === "object" && o)
      for (const l in o)
        d(p, l, o[l].default);
    else c === "array" && Array.isArray(u) && u.forEach((l, i) => d(p, i, l.default));
  }
  yt.assignDefaults = a;
  function d(p, c, o) {
    const { gen: u, compositeRule: l, data: i, opts: t } = p;
    if (o === void 0)
      return;
    const s = (0, e._)`${i}${(0, e.getProperty)(c)}`;
    if (l) {
      (0, r.checkStrictMode)(p, `default is ignored for: ${s}`);
      return;
    }
    let n = (0, e._)`${s} === undefined`;
    t.useDefaults === "empty" && (n = (0, e._)`${n} || ${s} === null || ${s} === ""`), u.if(n, (0, e._)`${s} = ${(0, e.stringify)(o)}`);
  }
  return yt;
}
var Oe = {}, ie = {}, Ba;
function Te() {
  if (Ba) return ie;
  Ba = 1, Object.defineProperty(ie, "__esModule", { value: !0 }), ie.validateUnion = ie.validateArray = ie.usePattern = ie.callValidateCode = ie.schemaProperties = ie.allSchemaProperties = ie.noPropertyInData = ie.propertyInData = ie.isOwnProperty = ie.hasPropFunc = ie.reportMissingProp = ie.checkMissingProp = ie.checkReportMissingProp = void 0;
  const e = W(), r = ee(), a = Pe(), d = ee();
  function p(v, w) {
    const { gen: b, data: $, it: E } = v;
    b.if(t(b, $, w, E.opts.ownProperties), () => {
      v.setParams({ missingProperty: (0, e._)`${w}` }, !0), v.error();
    });
  }
  ie.checkReportMissingProp = p;
  function c({ gen: v, data: w, it: { opts: b } }, $, E) {
    return (0, e.or)(...$.map((S) => (0, e.and)(t(v, w, S, b.ownProperties), (0, e._)`${E} = ${S}`)));
  }
  ie.checkMissingProp = c;
  function o(v, w) {
    v.setParams({ missingProperty: w }, !0), v.error();
  }
  ie.reportMissingProp = o;
  function u(v) {
    return v.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  ie.hasPropFunc = u;
  function l(v, w, b) {
    return (0, e._)`${u(v)}.call(${w}, ${b})`;
  }
  ie.isOwnProperty = l;
  function i(v, w, b, $) {
    const E = (0, e._)`${w}${(0, e.getProperty)(b)} !== undefined`;
    return $ ? (0, e._)`${E} && ${l(v, w, b)}` : E;
  }
  ie.propertyInData = i;
  function t(v, w, b, $) {
    const E = (0, e._)`${w}${(0, e.getProperty)(b)} === undefined`;
    return $ ? (0, e.or)(E, (0, e.not)(l(v, w, b))) : E;
  }
  ie.noPropertyInData = t;
  function s(v) {
    return v ? Object.keys(v).filter((w) => w !== "__proto__") : [];
  }
  ie.allSchemaProperties = s;
  function n(v, w) {
    return s(w).filter((b) => !(0, r.alwaysValidSchema)(v, w[b]));
  }
  ie.schemaProperties = n;
  function f({ schemaCode: v, data: w, it: { gen: b, topSchemaRef: $, schemaPath: E, errorPath: S }, it: N }, P, j, A) {
    const V = A ? (0, e._)`${v}, ${w}, ${$}${E}` : w, z = [
      [a.default.instancePath, (0, e.strConcat)(a.default.instancePath, S)],
      [a.default.parentData, N.parentData],
      [a.default.parentDataProperty, N.parentDataProperty],
      [a.default.rootData, a.default.rootData]
    ];
    N.opts.dynamicRef && z.push([a.default.dynamicAnchors, a.default.dynamicAnchors]);
    const q = (0, e._)`${V}, ${b.object(...z)}`;
    return j !== e.nil ? (0, e._)`${P}.call(${j}, ${q})` : (0, e._)`${P}(${q})`;
  }
  ie.callValidateCode = f;
  const h = (0, e._)`new RegExp`;
  function y({ gen: v, it: { opts: w } }, b) {
    const $ = w.unicodeRegExp ? "u" : "", { regExp: E } = w.code, S = E(b, $);
    return v.scopeValue("pattern", {
      key: S.toString(),
      ref: S,
      code: (0, e._)`${E.code === "new RegExp" ? h : (0, d.useFunc)(v, E)}(${b}, ${$})`
    });
  }
  ie.usePattern = y;
  function m(v) {
    const { gen: w, data: b, keyword: $, it: E } = v, S = w.name("valid");
    if (E.allErrors) {
      const P = w.let("valid", !0);
      return N(() => w.assign(P, !1)), P;
    }
    return w.var(S, !0), N(() => w.break()), S;
    function N(P) {
      const j = w.const("len", (0, e._)`${b}.length`);
      w.forRange("i", 0, j, (A) => {
        v.subschema({
          keyword: $,
          dataProp: A,
          dataPropType: r.Type.Num
        }, S), w.if((0, e.not)(S), P);
      });
    }
  }
  ie.validateArray = m;
  function g(v) {
    const { gen: w, schema: b, keyword: $, it: E } = v;
    if (!Array.isArray(b))
      throw new Error("ajv implementation error");
    if (b.some((j) => (0, r.alwaysValidSchema)(E, j)) && !E.opts.unevaluated)
      return;
    const N = w.let("valid", !1), P = w.name("_valid");
    w.block(() => b.forEach((j, A) => {
      const V = v.subschema({
        keyword: $,
        schemaProp: A,
        compositeRule: !0
      }, P);
      w.assign(N, (0, e._)`${N} || ${P}`), v.mergeValidEvaluated(V, P) || w.if((0, e.not)(N));
    })), v.result(N, () => v.reset(), () => v.error(!0));
  }
  return ie.validateUnion = g, ie;
}
var Ka;
function Md() {
  if (Ka) return Oe;
  Ka = 1, Object.defineProperty(Oe, "__esModule", { value: !0 }), Oe.validateKeywordUsage = Oe.validSchemaType = Oe.funcKeywordCode = Oe.macroKeywordCode = void 0;
  const e = W(), r = Pe(), a = Te(), d = an();
  function p(n, f) {
    const { gen: h, keyword: y, schema: m, parentSchema: g, it: v } = n, w = f.macro.call(v.self, m, g, v), b = i(h, y, w);
    v.opts.validateSchema !== !1 && v.self.validateSchema(w, !0);
    const $ = h.name("valid");
    n.subschema({
      schema: w,
      schemaPath: e.nil,
      errSchemaPath: `${v.errSchemaPath}/${y}`,
      topSchemaRef: b,
      compositeRule: !0
    }, $), n.pass($, () => n.error(!0));
  }
  Oe.macroKeywordCode = p;
  function c(n, f) {
    var h;
    const { gen: y, keyword: m, schema: g, parentSchema: v, $data: w, it: b } = n;
    l(b, f);
    const $ = !w && f.compile ? f.compile.call(b.self, g, v, b) : f.validate, E = i(y, m, $), S = y.let("valid");
    n.block$data(S, N), n.ok((h = f.valid) !== null && h !== void 0 ? h : S);
    function N() {
      if (f.errors === !1)
        A(), f.modifying && o(n), V(() => n.error());
      else {
        const z = f.async ? P() : j();
        f.modifying && o(n), V(() => u(n, z));
      }
    }
    function P() {
      const z = y.let("ruleErrs", null);
      return y.try(() => A((0, e._)`await `), (q) => y.assign(S, !1).if((0, e._)`${q} instanceof ${b.ValidationError}`, () => y.assign(z, (0, e._)`${q}.errors`), () => y.throw(q))), z;
    }
    function j() {
      const z = (0, e._)`${E}.errors`;
      return y.assign(z, null), A(e.nil), z;
    }
    function A(z = f.async ? (0, e._)`await ` : e.nil) {
      const q = b.opts.passContext ? r.default.this : r.default.self, D = !("compile" in f && !w || f.schema === !1);
      y.assign(S, (0, e._)`${z}${(0, a.callValidateCode)(n, E, q, D)}`, f.modifying);
    }
    function V(z) {
      var q;
      y.if((0, e.not)((q = f.valid) !== null && q !== void 0 ? q : S), z);
    }
  }
  Oe.funcKeywordCode = c;
  function o(n) {
    const { gen: f, data: h, it: y } = n;
    f.if(y.parentData, () => f.assign(h, (0, e._)`${y.parentData}[${y.parentDataProperty}]`));
  }
  function u(n, f) {
    const { gen: h } = n;
    h.if((0, e._)`Array.isArray(${f})`, () => {
      h.assign(r.default.vErrors, (0, e._)`${r.default.vErrors} === null ? ${f} : ${r.default.vErrors}.concat(${f})`).assign(r.default.errors, (0, e._)`${r.default.vErrors}.length`), (0, d.extendErrors)(n);
    }, () => n.error());
  }
  function l({ schemaEnv: n }, f) {
    if (f.async && !n.$async)
      throw new Error("async keyword in sync schema");
  }
  function i(n, f, h) {
    if (h === void 0)
      throw new Error(`keyword "${f}" failed to compile`);
    return n.scopeValue("keyword", typeof h == "function" ? { ref: h } : { ref: h, code: (0, e.stringify)(h) });
  }
  function t(n, f, h = !1) {
    return !f.length || f.some((y) => y === "array" ? Array.isArray(n) : y === "object" ? n && typeof n == "object" && !Array.isArray(n) : typeof n == y || h && typeof n > "u");
  }
  Oe.validSchemaType = t;
  function s({ schema: n, opts: f, self: h, errSchemaPath: y }, m, g) {
    if (Array.isArray(m.keyword) ? !m.keyword.includes(g) : m.keyword !== g)
      throw new Error("ajv implementation error");
    const v = m.dependencies;
    if (v?.some((w) => !Object.prototype.hasOwnProperty.call(n, w)))
      throw new Error(`parent schema must have dependencies of ${g}: ${v.join(",")}`);
    if (m.validateSchema && !m.validateSchema(n[g])) {
      const b = `keyword "${g}" value is invalid at path "${y}": ` + h.errorsText(m.validateSchema.errors);
      if (f.validateSchema === "log")
        h.logger.error(b);
      else
        throw new Error(b);
    }
  }
  return Oe.validateKeywordUsage = s, Oe;
}
var je = {}, za;
function Dd() {
  if (za) return je;
  za = 1, Object.defineProperty(je, "__esModule", { value: !0 }), je.extendSubschemaMode = je.extendSubschemaData = je.getSubschema = void 0;
  const e = W(), r = ee();
  function a(c, { keyword: o, schemaProp: u, schema: l, schemaPath: i, errSchemaPath: t, topSchemaRef: s }) {
    if (o !== void 0 && l !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (o !== void 0) {
      const n = c.schema[o];
      return u === void 0 ? {
        schema: n,
        schemaPath: (0, e._)`${c.schemaPath}${(0, e.getProperty)(o)}`,
        errSchemaPath: `${c.errSchemaPath}/${o}`
      } : {
        schema: n[u],
        schemaPath: (0, e._)`${c.schemaPath}${(0, e.getProperty)(o)}${(0, e.getProperty)(u)}`,
        errSchemaPath: `${c.errSchemaPath}/${o}/${(0, r.escapeFragment)(u)}`
      };
    }
    if (l !== void 0) {
      if (i === void 0 || t === void 0 || s === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: l,
        schemaPath: i,
        topSchemaRef: s,
        errSchemaPath: t
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  je.getSubschema = a;
  function d(c, o, { dataProp: u, dataPropType: l, data: i, dataTypes: t, propertyName: s }) {
    if (i !== void 0 && u !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: n } = o;
    if (u !== void 0) {
      const { errorPath: h, dataPathArr: y, opts: m } = o, g = n.let("data", (0, e._)`${o.data}${(0, e.getProperty)(u)}`, !0);
      f(g), c.errorPath = (0, e.str)`${h}${(0, r.getErrorPath)(u, l, m.jsPropertySyntax)}`, c.parentDataProperty = (0, e._)`${u}`, c.dataPathArr = [...y, c.parentDataProperty];
    }
    if (i !== void 0) {
      const h = i instanceof e.Name ? i : n.let("data", i, !0);
      f(h), s !== void 0 && (c.propertyName = s);
    }
    t && (c.dataTypes = t);
    function f(h) {
      c.data = h, c.dataLevel = o.dataLevel + 1, c.dataTypes = [], o.definedProperties = /* @__PURE__ */ new Set(), c.parentData = o.data, c.dataNames = [...o.dataNames, h];
    }
  }
  je.extendSubschemaData = d;
  function p(c, { jtdDiscriminator: o, jtdMetadata: u, compositeRule: l, createErrors: i, allErrors: t }) {
    l !== void 0 && (c.compositeRule = l), i !== void 0 && (c.createErrors = i), t !== void 0 && (c.allErrors = t), c.jtdDiscriminator = o, c.jtdMetadata = u;
  }
  return je.extendSubschemaMode = p, je;
}
var ge = {}, xn, Ga;
function Uu() {
  return Ga || (Ga = 1, xn = function e(r, a) {
    if (r === a) return !0;
    if (r && a && typeof r == "object" && typeof a == "object") {
      if (r.constructor !== a.constructor) return !1;
      var d, p, c;
      if (Array.isArray(r)) {
        if (d = r.length, d != a.length) return !1;
        for (p = d; p-- !== 0; )
          if (!e(r[p], a[p])) return !1;
        return !0;
      }
      if (r.constructor === RegExp) return r.source === a.source && r.flags === a.flags;
      if (r.valueOf !== Object.prototype.valueOf) return r.valueOf() === a.valueOf();
      if (r.toString !== Object.prototype.toString) return r.toString() === a.toString();
      if (c = Object.keys(r), d = c.length, d !== Object.keys(a).length) return !1;
      for (p = d; p-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(a, c[p])) return !1;
      for (p = d; p-- !== 0; ) {
        var o = c[p];
        if (!e(r[o], a[o])) return !1;
      }
      return !0;
    }
    return r !== r && a !== a;
  }), xn;
}
var Yn = { exports: {} }, xa;
function Fd() {
  if (xa) return Yn.exports;
  xa = 1;
  var e = Yn.exports = function(d, p, c) {
    typeof p == "function" && (c = p, p = {}), c = p.cb || c;
    var o = typeof c == "function" ? c : c.pre || function() {
    }, u = c.post || function() {
    };
    r(p, o, u, d, "", d);
  };
  e.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0,
    if: !0,
    then: !0,
    else: !0
  }, e.arrayKeywords = {
    items: !0,
    allOf: !0,
    anyOf: !0,
    oneOf: !0
  }, e.propsKeywords = {
    $defs: !0,
    definitions: !0,
    properties: !0,
    patternProperties: !0,
    dependencies: !0
  }, e.skipKeywords = {
    default: !0,
    enum: !0,
    const: !0,
    required: !0,
    maximum: !0,
    minimum: !0,
    exclusiveMaximum: !0,
    exclusiveMinimum: !0,
    multipleOf: !0,
    maxLength: !0,
    minLength: !0,
    pattern: !0,
    format: !0,
    maxItems: !0,
    minItems: !0,
    uniqueItems: !0,
    maxProperties: !0,
    minProperties: !0
  };
  function r(d, p, c, o, u, l, i, t, s, n) {
    if (o && typeof o == "object" && !Array.isArray(o)) {
      p(o, u, l, i, t, s, n);
      for (var f in o) {
        var h = o[f];
        if (Array.isArray(h)) {
          if (f in e.arrayKeywords)
            for (var y = 0; y < h.length; y++)
              r(d, p, c, h[y], u + "/" + f + "/" + y, l, u, f, o, y);
        } else if (f in e.propsKeywords) {
          if (h && typeof h == "object")
            for (var m in h)
              r(d, p, c, h[m], u + "/" + f + "/" + a(m), l, u, f, o, m);
        } else (f in e.keywords || d.allKeys && !(f in e.skipKeywords)) && r(d, p, c, h, u + "/" + f, l, u, f, o);
      }
      c(o, u, l, i, t, s, n);
    }
  }
  function a(d) {
    return d.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return Yn.exports;
}
var Ya;
function on() {
  if (Ya) return ge;
  Ya = 1, Object.defineProperty(ge, "__esModule", { value: !0 }), ge.getSchemaRefs = ge.resolveUrl = ge.normalizeId = ge._getFullPath = ge.getFullPath = ge.inlineRef = void 0;
  const e = ee(), r = Uu(), a = Fd(), d = /* @__PURE__ */ new Set([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum",
    "const"
  ]);
  function p(y, m = !0) {
    return typeof y == "boolean" ? !0 : m === !0 ? !o(y) : m ? u(y) <= m : !1;
  }
  ge.inlineRef = p;
  const c = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function o(y) {
    for (const m in y) {
      if (c.has(m))
        return !0;
      const g = y[m];
      if (Array.isArray(g) && g.some(o) || typeof g == "object" && o(g))
        return !0;
    }
    return !1;
  }
  function u(y) {
    let m = 0;
    for (const g in y) {
      if (g === "$ref")
        return 1 / 0;
      if (m++, !d.has(g) && (typeof y[g] == "object" && (0, e.eachItem)(y[g], (v) => m += u(v)), m === 1 / 0))
        return 1 / 0;
    }
    return m;
  }
  function l(y, m = "", g) {
    g !== !1 && (m = s(m));
    const v = y.parse(m);
    return i(y, v);
  }
  ge.getFullPath = l;
  function i(y, m) {
    return y.serialize(m).split("#")[0] + "#";
  }
  ge._getFullPath = i;
  const t = /#\/?$/;
  function s(y) {
    return y ? y.replace(t, "") : "";
  }
  ge.normalizeId = s;
  function n(y, m, g) {
    return g = s(g), y.resolve(m, g);
  }
  ge.resolveUrl = n;
  const f = /^[a-z_][-a-z0-9._]*$/i;
  function h(y, m) {
    if (typeof y == "boolean")
      return {};
    const { schemaId: g, uriResolver: v } = this.opts, w = s(y[g] || m), b = { "": w }, $ = l(v, w, !1), E = {}, S = /* @__PURE__ */ new Set();
    return a(y, { allKeys: !0 }, (j, A, V, z) => {
      if (z === void 0)
        return;
      const q = $ + A;
      let D = b[z];
      typeof j[g] == "string" && (D = G.call(this, j[g])), F.call(this, j.$anchor), F.call(this, j.$dynamicAnchor), b[A] = D;
      function G(B) {
        const K = this.opts.uriResolver.resolve;
        if (B = s(D ? K(D, B) : B), S.has(B))
          throw P(B);
        S.add(B);
        let L = this.refs[B];
        return typeof L == "string" && (L = this.refs[L]), typeof L == "object" ? N(j, L.schema, B) : B !== s(q) && (B[0] === "#" ? (N(j, E[B], B), E[B] = j) : this.refs[B] = q), B;
      }
      function F(B) {
        if (typeof B == "string") {
          if (!f.test(B))
            throw new Error(`invalid anchor "${B}"`);
          G.call(this, `#${B}`);
        }
      }
    }), E;
    function N(j, A, V) {
      if (A !== void 0 && !r(j, A))
        throw P(V);
    }
    function P(j) {
      return new Error(`reference "${j}" resolves to more than one schema`);
    }
  }
  return ge.getSchemaRefs = h, ge;
}
var Ha;
function It() {
  if (Ha) return Ce;
  Ha = 1, Object.defineProperty(Ce, "__esModule", { value: !0 }), Ce.getData = Ce.KeywordCxt = Ce.validateFunctionCode = void 0;
  const e = Ld(), r = Zr(), a = Vu(), d = Zr(), p = jd(), c = Md(), o = Dd(), u = W(), l = Pe(), i = on(), t = ee(), s = an();
  function n(I) {
    if ($(I) && (S(I), b(I))) {
      m(I);
      return;
    }
    f(I, () => (0, e.topBoolOrEmptySchema)(I));
  }
  Ce.validateFunctionCode = n;
  function f({ gen: I, validateName: k, schema: U, schemaEnv: x, opts: H }, Z) {
    H.code.es5 ? I.func(k, (0, u._)`${l.default.data}, ${l.default.valCxt}`, x.$async, () => {
      I.code((0, u._)`"use strict"; ${v(U, H)}`), y(I, H), I.code(Z);
    }) : I.func(k, (0, u._)`${l.default.data}, ${h(H)}`, x.$async, () => I.code(v(U, H)).code(Z));
  }
  function h(I) {
    return (0, u._)`{${l.default.instancePath}="", ${l.default.parentData}, ${l.default.parentDataProperty}, ${l.default.rootData}=${l.default.data}${I.dynamicRef ? (0, u._)`, ${l.default.dynamicAnchors}={}` : u.nil}}={}`;
  }
  function y(I, k) {
    I.if(l.default.valCxt, () => {
      I.var(l.default.instancePath, (0, u._)`${l.default.valCxt}.${l.default.instancePath}`), I.var(l.default.parentData, (0, u._)`${l.default.valCxt}.${l.default.parentData}`), I.var(l.default.parentDataProperty, (0, u._)`${l.default.valCxt}.${l.default.parentDataProperty}`), I.var(l.default.rootData, (0, u._)`${l.default.valCxt}.${l.default.rootData}`), k.dynamicRef && I.var(l.default.dynamicAnchors, (0, u._)`${l.default.valCxt}.${l.default.dynamicAnchors}`);
    }, () => {
      I.var(l.default.instancePath, (0, u._)`""`), I.var(l.default.parentData, (0, u._)`undefined`), I.var(l.default.parentDataProperty, (0, u._)`undefined`), I.var(l.default.rootData, l.default.data), k.dynamicRef && I.var(l.default.dynamicAnchors, (0, u._)`{}`);
    });
  }
  function m(I) {
    const { schema: k, opts: U, gen: x } = I;
    f(I, () => {
      U.$comment && k.$comment && z(I), j(I), x.let(l.default.vErrors, null), x.let(l.default.errors, 0), U.unevaluated && g(I), N(I), q(I);
    });
  }
  function g(I) {
    const { gen: k, validateName: U } = I;
    I.evaluated = k.const("evaluated", (0, u._)`${U}.evaluated`), k.if((0, u._)`${I.evaluated}.dynamicProps`, () => k.assign((0, u._)`${I.evaluated}.props`, (0, u._)`undefined`)), k.if((0, u._)`${I.evaluated}.dynamicItems`, () => k.assign((0, u._)`${I.evaluated}.items`, (0, u._)`undefined`));
  }
  function v(I, k) {
    const U = typeof I == "object" && I[k.schemaId];
    return U && (k.code.source || k.code.process) ? (0, u._)`/*# sourceURL=${U} */` : u.nil;
  }
  function w(I, k) {
    if ($(I) && (S(I), b(I))) {
      E(I, k);
      return;
    }
    (0, e.boolOrEmptySchema)(I, k);
  }
  function b({ schema: I, self: k }) {
    if (typeof I == "boolean")
      return !I;
    for (const U in I)
      if (k.RULES.all[U])
        return !0;
    return !1;
  }
  function $(I) {
    return typeof I.schema != "boolean";
  }
  function E(I, k) {
    const { schema: U, gen: x, opts: H } = I;
    H.$comment && U.$comment && z(I), A(I), V(I);
    const Z = x.const("_errs", l.default.errors);
    N(I, Z), x.var(k, (0, u._)`${Z} === ${l.default.errors}`);
  }
  function S(I) {
    (0, t.checkUnknownRules)(I), P(I);
  }
  function N(I, k) {
    if (I.opts.jtd)
      return G(I, [], !1, k);
    const U = (0, r.getSchemaTypes)(I.schema), x = (0, r.coerceAndCheckDataType)(I, U);
    G(I, U, !x, k);
  }
  function P(I) {
    const { schema: k, errSchemaPath: U, opts: x, self: H } = I;
    k.$ref && x.ignoreKeywordsWithRef && (0, t.schemaHasRulesButRef)(k, H.RULES) && H.logger.warn(`$ref: keywords ignored in schema at path "${U}"`);
  }
  function j(I) {
    const { schema: k, opts: U } = I;
    k.default !== void 0 && U.useDefaults && U.strictSchema && (0, t.checkStrictMode)(I, "default is ignored in the schema root");
  }
  function A(I) {
    const k = I.schema[I.opts.schemaId];
    k && (I.baseId = (0, i.resolveUrl)(I.opts.uriResolver, I.baseId, k));
  }
  function V(I) {
    if (I.schema.$async && !I.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function z({ gen: I, schemaEnv: k, schema: U, errSchemaPath: x, opts: H }) {
    const Z = U.$comment;
    if (H.$comment === !0)
      I.code((0, u._)`${l.default.self}.logger.log(${Z})`);
    else if (typeof H.$comment == "function") {
      const fe = (0, u.str)`${x}/$comment`, Re = I.scopeValue("root", { ref: k.root });
      I.code((0, u._)`${l.default.self}.opts.$comment(${Z}, ${fe}, ${Re}.schema)`);
    }
  }
  function q(I) {
    const { gen: k, schemaEnv: U, validateName: x, ValidationError: H, opts: Z } = I;
    U.$async ? k.if((0, u._)`${l.default.errors} === 0`, () => k.return(l.default.data), () => k.throw((0, u._)`new ${H}(${l.default.vErrors})`)) : (k.assign((0, u._)`${x}.errors`, l.default.vErrors), Z.unevaluated && D(I), k.return((0, u._)`${l.default.errors} === 0`));
  }
  function D({ gen: I, evaluated: k, props: U, items: x }) {
    U instanceof u.Name && I.assign((0, u._)`${k}.props`, U), x instanceof u.Name && I.assign((0, u._)`${k}.items`, x);
  }
  function G(I, k, U, x) {
    const { gen: H, schema: Z, data: fe, allErrors: Re, opts: be, self: Ee } = I, { RULES: de } = Ee;
    if (Z.$ref && (be.ignoreKeywordsWithRef || !(0, t.schemaHasRulesButRef)(Z, de))) {
      H.block(() => Y(I, "$ref", de.all.$ref.definition));
      return;
    }
    be.jtd || B(I, k), H.block(() => {
      for (const Ne of de.rules)
        Ze(Ne);
      Ze(de.post);
    });
    function Ze(Ne) {
      (0, a.shouldUseGroup)(Z, Ne) && (Ne.type ? (H.if((0, d.checkDataType)(Ne.type, fe, be.strictNumbers)), F(I, Ne), k.length === 1 && k[0] === Ne.type && U && (H.else(), (0, d.reportTypeError)(I)), H.endIf()) : F(I, Ne), Re || H.if((0, u._)`${l.default.errors} === ${x || 0}`));
    }
  }
  function F(I, k) {
    const { gen: U, schema: x, opts: { useDefaults: H } } = I;
    H && (0, p.assignDefaults)(I, k.type), U.block(() => {
      for (const Z of k.rules)
        (0, a.shouldUseRule)(x, Z) && Y(I, Z.keyword, Z.definition, k.type);
    });
  }
  function B(I, k) {
    I.schemaEnv.meta || !I.opts.strictTypes || (K(I, k), I.opts.allowUnionTypes || L(I, k), O(I, I.dataTypes));
  }
  function K(I, k) {
    if (k.length) {
      if (!I.dataTypes.length) {
        I.dataTypes = k;
        return;
      }
      k.forEach((U) => {
        T(I.dataTypes, U) || R(I, `type "${U}" not allowed by context "${I.dataTypes.join(",")}"`);
      }), _(I, k);
    }
  }
  function L(I, k) {
    k.length > 1 && !(k.length === 2 && k.includes("null")) && R(I, "use allowUnionTypes to allow union type keyword");
  }
  function O(I, k) {
    const U = I.self.RULES.all;
    for (const x in U) {
      const H = U[x];
      if (typeof H == "object" && (0, a.shouldUseRule)(I.schema, H)) {
        const { type: Z } = H.definition;
        Z.length && !Z.some((fe) => C(k, fe)) && R(I, `missing type "${Z.join(",")}" for keyword "${x}"`);
      }
    }
  }
  function C(I, k) {
    return I.includes(k) || k === "number" && I.includes("integer");
  }
  function T(I, k) {
    return I.includes(k) || k === "integer" && I.includes("number");
  }
  function _(I, k) {
    const U = [];
    for (const x of I.dataTypes)
      T(k, x) ? U.push(x) : k.includes("integer") && x === "number" && U.push("integer");
    I.dataTypes = U;
  }
  function R(I, k) {
    const U = I.schemaEnv.baseId + I.errSchemaPath;
    k += ` at "${U}" (strictTypes)`, (0, t.checkStrictMode)(I, k, I.opts.strictTypes);
  }
  class M {
    constructor(k, U, x) {
      if ((0, c.validateKeywordUsage)(k, U, x), this.gen = k.gen, this.allErrors = k.allErrors, this.keyword = x, this.data = k.data, this.schema = k.schema[x], this.$data = U.$data && k.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, t.schemaRefOrVal)(k, this.schema, x, this.$data), this.schemaType = U.schemaType, this.parentSchema = k.schema, this.params = {}, this.it = k, this.def = U, this.$data)
        this.schemaCode = k.gen.const("vSchema", te(this.$data, k));
      else if (this.schemaCode = this.schemaValue, !(0, c.validSchemaType)(this.schema, U.schemaType, U.allowUndefined))
        throw new Error(`${x} value must be ${JSON.stringify(U.schemaType)}`);
      ("code" in U ? U.trackErrors : U.errors !== !1) && (this.errsCount = k.gen.const("_errs", l.default.errors));
    }
    result(k, U, x) {
      this.failResult((0, u.not)(k), U, x);
    }
    failResult(k, U, x) {
      this.gen.if(k), x ? x() : this.error(), U ? (this.gen.else(), U(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(k, U) {
      this.failResult((0, u.not)(k), void 0, U);
    }
    fail(k) {
      if (k === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(k), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(k) {
      if (!this.$data)
        return this.fail(k);
      const { schemaCode: U } = this;
      this.fail((0, u._)`${U} !== undefined && (${(0, u.or)(this.invalid$data(), k)})`);
    }
    error(k, U, x) {
      if (U) {
        this.setParams(U), this._error(k, x), this.setParams({});
        return;
      }
      this._error(k, x);
    }
    _error(k, U) {
      (k ? s.reportExtraError : s.reportError)(this, this.def.error, U);
    }
    $dataError() {
      (0, s.reportError)(this, this.def.$dataError || s.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, s.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(k) {
      this.allErrors || this.gen.if(k);
    }
    setParams(k, U) {
      U ? Object.assign(this.params, k) : this.params = k;
    }
    block$data(k, U, x = u.nil) {
      this.gen.block(() => {
        this.check$data(k, x), U();
      });
    }
    check$data(k = u.nil, U = u.nil) {
      if (!this.$data)
        return;
      const { gen: x, schemaCode: H, schemaType: Z, def: fe } = this;
      x.if((0, u.or)((0, u._)`${H} === undefined`, U)), k !== u.nil && x.assign(k, !0), (Z.length || fe.validateSchema) && (x.elseIf(this.invalid$data()), this.$dataError(), k !== u.nil && x.assign(k, !1)), x.else();
    }
    invalid$data() {
      const { gen: k, schemaCode: U, schemaType: x, def: H, it: Z } = this;
      return (0, u.or)(fe(), Re());
      function fe() {
        if (x.length) {
          if (!(U instanceof u.Name))
            throw new Error("ajv implementation error");
          const be = Array.isArray(x) ? x : [x];
          return (0, u._)`${(0, d.checkDataTypes)(be, U, Z.opts.strictNumbers, d.DataType.Wrong)}`;
        }
        return u.nil;
      }
      function Re() {
        if (H.validateSchema) {
          const be = k.scopeValue("validate$data", { ref: H.validateSchema });
          return (0, u._)`!${be}(${U})`;
        }
        return u.nil;
      }
    }
    subschema(k, U) {
      const x = (0, o.getSubschema)(this.it, k);
      (0, o.extendSubschemaData)(x, this.it, k), (0, o.extendSubschemaMode)(x, k);
      const H = { ...this.it, ...x, items: void 0, props: void 0 };
      return w(H, U), H;
    }
    mergeEvaluated(k, U) {
      const { it: x, gen: H } = this;
      x.opts.unevaluated && (x.props !== !0 && k.props !== void 0 && (x.props = t.mergeEvaluated.props(H, k.props, x.props, U)), x.items !== !0 && k.items !== void 0 && (x.items = t.mergeEvaluated.items(H, k.items, x.items, U)));
    }
    mergeValidEvaluated(k, U) {
      const { it: x, gen: H } = this;
      if (x.opts.unevaluated && (x.props !== !0 || x.items !== !0))
        return H.if(U, () => this.mergeEvaluated(k, u.Name)), !0;
    }
  }
  Ce.KeywordCxt = M;
  function Y(I, k, U, x) {
    const H = new M(I, U, k);
    "code" in U ? U.code(H, x) : H.$data && U.validate ? (0, c.funcKeywordCode)(H, U) : "macro" in U ? (0, c.macroKeywordCode)(H, U) : (U.compile || U.validate) && (0, c.funcKeywordCode)(H, U);
  }
  const J = /^\/(?:[^~]|~0|~1)*$/, ne = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function te(I, { dataLevel: k, dataNames: U, dataPathArr: x }) {
    let H, Z;
    if (I === "")
      return l.default.rootData;
    if (I[0] === "/") {
      if (!J.test(I))
        throw new Error(`Invalid JSON-pointer: ${I}`);
      H = I, Z = l.default.rootData;
    } else {
      const Ee = ne.exec(I);
      if (!Ee)
        throw new Error(`Invalid JSON-pointer: ${I}`);
      const de = +Ee[1];
      if (H = Ee[2], H === "#") {
        if (de >= k)
          throw new Error(be("property/index", de));
        return x[k - de];
      }
      if (de > k)
        throw new Error(be("data", de));
      if (Z = U[k - de], !H)
        return Z;
    }
    let fe = Z;
    const Re = H.split("/");
    for (const Ee of Re)
      Ee && (Z = (0, u._)`${Z}${(0, u.getProperty)((0, t.unescapeJsonPointer)(Ee))}`, fe = (0, u._)`${fe} && ${Z}`);
    return fe;
    function be(Ee, de) {
      return `Cannot access ${Ee} ${de} levels up, current level is ${k}`;
    }
  }
  return Ce.getData = te, Ce;
}
var Ut = {}, Ja;
function cn() {
  if (Ja) return Ut;
  Ja = 1, Object.defineProperty(Ut, "__esModule", { value: !0 });
  class e extends Error {
    constructor(a) {
      super("validation failed"), this.errors = a, this.ajv = this.validation = !0;
    }
  }
  return Ut.default = e, Ut;
}
var Bt = {}, Wa;
function At() {
  if (Wa) return Bt;
  Wa = 1, Object.defineProperty(Bt, "__esModule", { value: !0 });
  const e = on();
  class r extends Error {
    constructor(d, p, c, o) {
      super(o || `can't resolve reference ${c} from id ${p}`), this.missingRef = (0, e.resolveUrl)(d, p, c), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(d, this.missingRef));
    }
  }
  return Bt.default = r, Bt;
}
var _e = {}, Xa;
function ln() {
  if (Xa) return _e;
  Xa = 1, Object.defineProperty(_e, "__esModule", { value: !0 }), _e.resolveSchema = _e.getCompilingSchema = _e.resolveRef = _e.compileSchema = _e.SchemaEnv = void 0;
  const e = W(), r = cn(), a = Pe(), d = on(), p = ee(), c = It();
  class o {
    constructor(g) {
      var v;
      this.refs = {}, this.dynamicAnchors = {};
      let w;
      typeof g.schema == "object" && (w = g.schema), this.schema = g.schema, this.schemaId = g.schemaId, this.root = g.root || this, this.baseId = (v = g.baseId) !== null && v !== void 0 ? v : (0, d.normalizeId)(w?.[g.schemaId || "$id"]), this.schemaPath = g.schemaPath, this.localRefs = g.localRefs, this.meta = g.meta, this.$async = w?.$async, this.refs = {};
    }
  }
  _e.SchemaEnv = o;
  function u(m) {
    const g = t.call(this, m);
    if (g)
      return g;
    const v = (0, d.getFullPath)(this.opts.uriResolver, m.root.baseId), { es5: w, lines: b } = this.opts.code, { ownProperties: $ } = this.opts, E = new e.CodeGen(this.scope, { es5: w, lines: b, ownProperties: $ });
    let S;
    m.$async && (S = E.scopeValue("Error", {
      ref: r.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const N = E.scopeName("validate");
    m.validateName = N;
    const P = {
      gen: E,
      allErrors: this.opts.allErrors,
      data: a.default.data,
      parentData: a.default.parentData,
      parentDataProperty: a.default.parentDataProperty,
      dataNames: [a.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: E.scopeValue("schema", this.opts.code.source === !0 ? { ref: m.schema, code: (0, e.stringify)(m.schema) } : { ref: m.schema }),
      validateName: N,
      ValidationError: S,
      schema: m.schema,
      schemaEnv: m,
      rootId: v,
      baseId: m.baseId || v,
      schemaPath: e.nil,
      errSchemaPath: m.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let j;
    try {
      this._compilations.add(m), (0, c.validateFunctionCode)(P), E.optimize(this.opts.code.optimize);
      const A = E.toString();
      j = `${E.scopeRefs(a.default.scope)}return ${A}`, this.opts.code.process && (j = this.opts.code.process(j, m));
      const z = new Function(`${a.default.self}`, `${a.default.scope}`, j)(this, this.scope.get());
      if (this.scope.value(N, { ref: z }), z.errors = null, z.schema = m.schema, z.schemaEnv = m, m.$async && (z.$async = !0), this.opts.code.source === !0 && (z.source = { validateName: N, validateCode: A, scopeValues: E._values }), this.opts.unevaluated) {
        const { props: q, items: D } = P;
        z.evaluated = {
          props: q instanceof e.Name ? void 0 : q,
          items: D instanceof e.Name ? void 0 : D,
          dynamicProps: q instanceof e.Name,
          dynamicItems: D instanceof e.Name
        }, z.source && (z.source.evaluated = (0, e.stringify)(z.evaluated));
      }
      return m.validate = z, m;
    } catch (A) {
      throw delete m.validate, delete m.validateName, j && this.logger.error("Error compiling schema, function code:", j), A;
    } finally {
      this._compilations.delete(m);
    }
  }
  _e.compileSchema = u;
  function l(m, g, v) {
    var w;
    v = (0, d.resolveUrl)(this.opts.uriResolver, g, v);
    const b = m.refs[v];
    if (b)
      return b;
    let $ = n.call(this, m, v);
    if ($ === void 0) {
      const E = (w = m.localRefs) === null || w === void 0 ? void 0 : w[v], { schemaId: S } = this.opts;
      E && ($ = new o({ schema: E, schemaId: S, root: m, baseId: g }));
    }
    if ($ !== void 0)
      return m.refs[v] = i.call(this, $);
  }
  _e.resolveRef = l;
  function i(m) {
    return (0, d.inlineRef)(m.schema, this.opts.inlineRefs) ? m.schema : m.validate ? m : u.call(this, m);
  }
  function t(m) {
    for (const g of this._compilations)
      if (s(g, m))
        return g;
  }
  _e.getCompilingSchema = t;
  function s(m, g) {
    return m.schema === g.schema && m.root === g.root && m.baseId === g.baseId;
  }
  function n(m, g) {
    let v;
    for (; typeof (v = this.refs[g]) == "string"; )
      g = v;
    return v || this.schemas[g] || f.call(this, m, g);
  }
  function f(m, g) {
    const v = this.opts.uriResolver.parse(g), w = (0, d._getFullPath)(this.opts.uriResolver, v);
    let b = (0, d.getFullPath)(this.opts.uriResolver, m.baseId, void 0);
    if (Object.keys(m.schema).length > 0 && w === b)
      return y.call(this, v, m);
    const $ = (0, d.normalizeId)(w), E = this.refs[$] || this.schemas[$];
    if (typeof E == "string") {
      const S = f.call(this, m, E);
      return typeof S?.schema != "object" ? void 0 : y.call(this, v, S);
    }
    if (typeof E?.schema == "object") {
      if (E.validate || u.call(this, E), $ === (0, d.normalizeId)(g)) {
        const { schema: S } = E, { schemaId: N } = this.opts, P = S[N];
        return P && (b = (0, d.resolveUrl)(this.opts.uriResolver, b, P)), new o({ schema: S, schemaId: N, root: m, baseId: b });
      }
      return y.call(this, v, E);
    }
  }
  _e.resolveSchema = f;
  const h = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function y(m, { baseId: g, schema: v, root: w }) {
    var b;
    if (((b = m.fragment) === null || b === void 0 ? void 0 : b[0]) !== "/")
      return;
    for (const S of m.fragment.slice(1).split("/")) {
      if (typeof v == "boolean")
        return;
      const N = v[(0, p.unescapeFragment)(S)];
      if (N === void 0)
        return;
      v = N;
      const P = typeof v == "object" && v[this.opts.schemaId];
      !h.has(S) && P && (g = (0, d.resolveUrl)(this.opts.uriResolver, g, P));
    }
    let $;
    if (typeof v != "boolean" && v.$ref && !(0, p.schemaHasRulesButRef)(v, this.RULES)) {
      const S = (0, d.resolveUrl)(this.opts.uriResolver, g, v.$ref);
      $ = f.call(this, w, S);
    }
    const { schemaId: E } = this.opts;
    if ($ = $ || new o({ schema: v, schemaId: E, root: w, baseId: g }), $.schema !== $.root.schema)
      return $;
  }
  return _e;
}
const Vd = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Ud = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Bd = "object", Kd = ["$data"], zd = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, Gd = !1, xd = {
  $id: Vd,
  description: Ud,
  type: Bd,
  required: Kd,
  properties: zd,
  additionalProperties: Gd
};
var Kt = {}, gt = { exports: {} }, Hn, Qa;
function Bu() {
  if (Qa) return Hn;
  Qa = 1;
  const e = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), r = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
  function a(n) {
    let f = "", h = 0, y = 0;
    for (y = 0; y < n.length; y++)
      if (h = n[y].charCodeAt(0), h !== 48) {
        if (!(h >= 48 && h <= 57 || h >= 65 && h <= 70 || h >= 97 && h <= 102))
          return "";
        f += n[y];
        break;
      }
    for (y += 1; y < n.length; y++) {
      if (h = n[y].charCodeAt(0), !(h >= 48 && h <= 57 || h >= 65 && h <= 70 || h >= 97 && h <= 102))
        return "";
      f += n[y];
    }
    return f;
  }
  const d = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
  function p(n) {
    return n.length = 0, !0;
  }
  function c(n, f, h) {
    if (n.length) {
      const y = a(n);
      if (y !== "")
        f.push(y);
      else
        return h.error = !0, !1;
      n.length = 0;
    }
    return !0;
  }
  function o(n) {
    let f = 0;
    const h = { error: !1, address: "", zone: "" }, y = [], m = [];
    let g = !1, v = !1, w = c;
    for (let b = 0; b < n.length; b++) {
      const $ = n[b];
      if (!($ === "[" || $ === "]"))
        if ($ === ":") {
          if (g === !0 && (v = !0), !w(m, y, h))
            break;
          if (++f > 7) {
            h.error = !0;
            break;
          }
          b > 0 && n[b - 1] === ":" && (g = !0), y.push(":");
          continue;
        } else if ($ === "%") {
          if (!w(m, y, h))
            break;
          w = p;
        } else {
          m.push($);
          continue;
        }
    }
    return m.length && (w === p ? h.zone = m.join("") : v ? y.push(m.join("")) : y.push(a(m))), h.address = y.join(""), h;
  }
  function u(n) {
    if (l(n, ":") < 2)
      return { host: n, isIPV6: !1 };
    const f = o(n);
    if (f.error)
      return { host: n, isIPV6: !1 };
    {
      let h = f.address, y = f.address;
      return f.zone && (h += "%" + f.zone, y += "%25" + f.zone), { host: h, isIPV6: !0, escapedHost: y };
    }
  }
  function l(n, f) {
    let h = 0;
    for (let y = 0; y < n.length; y++)
      n[y] === f && h++;
    return h;
  }
  function i(n) {
    let f = n;
    const h = [];
    let y = -1, m = 0;
    for (; m = f.length; ) {
      if (m === 1) {
        if (f === ".")
          break;
        if (f === "/") {
          h.push("/");
          break;
        } else {
          h.push(f);
          break;
        }
      } else if (m === 2) {
        if (f[0] === ".") {
          if (f[1] === ".")
            break;
          if (f[1] === "/") {
            f = f.slice(2);
            continue;
          }
        } else if (f[0] === "/" && (f[1] === "." || f[1] === "/")) {
          h.push("/");
          break;
        }
      } else if (m === 3 && f === "/..") {
        h.length !== 0 && h.pop(), h.push("/");
        break;
      }
      if (f[0] === ".") {
        if (f[1] === ".") {
          if (f[2] === "/") {
            f = f.slice(3);
            continue;
          }
        } else if (f[1] === "/") {
          f = f.slice(2);
          continue;
        }
      } else if (f[0] === "/" && f[1] === ".") {
        if (f[2] === "/") {
          f = f.slice(2);
          continue;
        } else if (f[2] === "." && f[3] === "/") {
          f = f.slice(3), h.length !== 0 && h.pop();
          continue;
        }
      }
      if ((y = f.indexOf("/", 1)) === -1) {
        h.push(f);
        break;
      } else
        h.push(f.slice(0, y)), f = f.slice(y);
    }
    return h.join("");
  }
  function t(n, f) {
    const h = f !== !0 ? escape : unescape;
    return n.scheme !== void 0 && (n.scheme = h(n.scheme)), n.userinfo !== void 0 && (n.userinfo = h(n.userinfo)), n.host !== void 0 && (n.host = h(n.host)), n.path !== void 0 && (n.path = h(n.path)), n.query !== void 0 && (n.query = h(n.query)), n.fragment !== void 0 && (n.fragment = h(n.fragment)), n;
  }
  function s(n) {
    const f = [];
    if (n.userinfo !== void 0 && (f.push(n.userinfo), f.push("@")), n.host !== void 0) {
      let h = unescape(n.host);
      if (!r(h)) {
        const y = u(h);
        y.isIPV6 === !0 ? h = `[${y.escapedHost}]` : h = n.host;
      }
      f.push(h);
    }
    return (typeof n.port == "number" || typeof n.port == "string") && (f.push(":"), f.push(String(n.port))), f.length ? f.join("") : void 0;
  }
  return Hn = {
    nonSimpleDomain: d,
    recomposeAuthority: s,
    normalizeComponentEncoding: t,
    removeDotSegments: i,
    isIPv4: r,
    isUUID: e,
    normalizeIPv6: u,
    stringArrayToHexStripped: a
  }, Hn;
}
var Jn, Za;
function Yd() {
  if (Za) return Jn;
  Za = 1;
  const { isUUID: e } = Bu(), r = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu, a = (
    /** @type {const} */
    [
      "http",
      "https",
      "ws",
      "wss",
      "urn",
      "urn:uuid"
    ]
  );
  function d($) {
    return a.indexOf(
      /** @type {*} */
      $
    ) !== -1;
  }
  function p($) {
    return $.secure === !0 ? !0 : $.secure === !1 ? !1 : $.scheme ? $.scheme.length === 3 && ($.scheme[0] === "w" || $.scheme[0] === "W") && ($.scheme[1] === "s" || $.scheme[1] === "S") && ($.scheme[2] === "s" || $.scheme[2] === "S") : !1;
  }
  function c($) {
    return $.host || ($.error = $.error || "HTTP URIs must have a host."), $;
  }
  function o($) {
    const E = String($.scheme).toLowerCase() === "https";
    return ($.port === (E ? 443 : 80) || $.port === "") && ($.port = void 0), $.path || ($.path = "/"), $;
  }
  function u($) {
    return $.secure = p($), $.resourceName = ($.path || "/") + ($.query ? "?" + $.query : ""), $.path = void 0, $.query = void 0, $;
  }
  function l($) {
    if (($.port === (p($) ? 443 : 80) || $.port === "") && ($.port = void 0), typeof $.secure == "boolean" && ($.scheme = $.secure ? "wss" : "ws", $.secure = void 0), $.resourceName) {
      const [E, S] = $.resourceName.split("?");
      $.path = E && E !== "/" ? E : void 0, $.query = S, $.resourceName = void 0;
    }
    return $.fragment = void 0, $;
  }
  function i($, E) {
    if (!$.path)
      return $.error = "URN can not be parsed", $;
    const S = $.path.match(r);
    if (S) {
      const N = E.scheme || $.scheme || "urn";
      $.nid = S[1].toLowerCase(), $.nss = S[2];
      const P = `${N}:${E.nid || $.nid}`, j = b(P);
      $.path = void 0, j && ($ = j.parse($, E));
    } else
      $.error = $.error || "URN can not be parsed.";
    return $;
  }
  function t($, E) {
    if ($.nid === void 0)
      throw new Error("URN without nid cannot be serialized");
    const S = E.scheme || $.scheme || "urn", N = $.nid.toLowerCase(), P = `${S}:${E.nid || N}`, j = b(P);
    j && ($ = j.serialize($, E));
    const A = $, V = $.nss;
    return A.path = `${N || E.nid}:${V}`, E.skipEscape = !0, A;
  }
  function s($, E) {
    const S = $;
    return S.uuid = S.nss, S.nss = void 0, !E.tolerant && (!S.uuid || !e(S.uuid)) && (S.error = S.error || "UUID is not valid."), S;
  }
  function n($) {
    const E = $;
    return E.nss = ($.uuid || "").toLowerCase(), E;
  }
  const f = (
    /** @type {SchemeHandler} */
    {
      scheme: "http",
      domainHost: !0,
      parse: c,
      serialize: o
    }
  ), h = (
    /** @type {SchemeHandler} */
    {
      scheme: "https",
      domainHost: f.domainHost,
      parse: c,
      serialize: o
    }
  ), y = (
    /** @type {SchemeHandler} */
    {
      scheme: "ws",
      domainHost: !0,
      parse: u,
      serialize: l
    }
  ), m = (
    /** @type {SchemeHandler} */
    {
      scheme: "wss",
      domainHost: y.domainHost,
      parse: y.parse,
      serialize: y.serialize
    }
  ), w = (
    /** @type {Record<SchemeName, SchemeHandler>} */
    {
      http: f,
      https: h,
      ws: y,
      wss: m,
      urn: (
        /** @type {SchemeHandler} */
        {
          scheme: "urn",
          parse: i,
          serialize: t,
          skipNormalize: !0
        }
      ),
      "urn:uuid": (
        /** @type {SchemeHandler} */
        {
          scheme: "urn:uuid",
          parse: s,
          serialize: n,
          skipNormalize: !0
        }
      )
    }
  );
  Object.setPrototypeOf(w, null);
  function b($) {
    return $ && (w[
      /** @type {SchemeName} */
      $
    ] || w[
      /** @type {SchemeName} */
      $.toLowerCase()
    ]) || void 0;
  }
  return Jn = {
    wsIsSecure: p,
    SCHEMES: w,
    isValidSchemeName: d,
    getSchemeHandler: b
  }, Jn;
}
var eo;
function Hd() {
  if (eo) return gt.exports;
  eo = 1;
  const { normalizeIPv6: e, removeDotSegments: r, recomposeAuthority: a, normalizeComponentEncoding: d, isIPv4: p, nonSimpleDomain: c } = Bu(), { SCHEMES: o, getSchemeHandler: u } = Yd();
  function l(m, g) {
    return typeof m == "string" ? m = /** @type {T} */
    n(h(m, g), g) : typeof m == "object" && (m = /** @type {T} */
    h(n(m, g), g)), m;
  }
  function i(m, g, v) {
    const w = v ? Object.assign({ scheme: "null" }, v) : { scheme: "null" }, b = t(h(m, w), h(g, w), w, !0);
    return w.skipEscape = !0, n(b, w);
  }
  function t(m, g, v, w) {
    const b = {};
    return w || (m = h(n(m, v), v), g = h(n(g, v), v)), v = v || {}, !v.tolerant && g.scheme ? (b.scheme = g.scheme, b.userinfo = g.userinfo, b.host = g.host, b.port = g.port, b.path = r(g.path || ""), b.query = g.query) : (g.userinfo !== void 0 || g.host !== void 0 || g.port !== void 0 ? (b.userinfo = g.userinfo, b.host = g.host, b.port = g.port, b.path = r(g.path || ""), b.query = g.query) : (g.path ? (g.path[0] === "/" ? b.path = r(g.path) : ((m.userinfo !== void 0 || m.host !== void 0 || m.port !== void 0) && !m.path ? b.path = "/" + g.path : m.path ? b.path = m.path.slice(0, m.path.lastIndexOf("/") + 1) + g.path : b.path = g.path, b.path = r(b.path)), b.query = g.query) : (b.path = m.path, g.query !== void 0 ? b.query = g.query : b.query = m.query), b.userinfo = m.userinfo, b.host = m.host, b.port = m.port), b.scheme = m.scheme), b.fragment = g.fragment, b;
  }
  function s(m, g, v) {
    return typeof m == "string" ? (m = unescape(m), m = n(d(h(m, v), !0), { ...v, skipEscape: !0 })) : typeof m == "object" && (m = n(d(m, !0), { ...v, skipEscape: !0 })), typeof g == "string" ? (g = unescape(g), g = n(d(h(g, v), !0), { ...v, skipEscape: !0 })) : typeof g == "object" && (g = n(d(g, !0), { ...v, skipEscape: !0 })), m.toLowerCase() === g.toLowerCase();
  }
  function n(m, g) {
    const v = {
      host: m.host,
      scheme: m.scheme,
      userinfo: m.userinfo,
      port: m.port,
      path: m.path,
      query: m.query,
      nid: m.nid,
      nss: m.nss,
      uuid: m.uuid,
      fragment: m.fragment,
      reference: m.reference,
      resourceName: m.resourceName,
      secure: m.secure,
      error: ""
    }, w = Object.assign({}, g), b = [], $ = u(w.scheme || v.scheme);
    $ && $.serialize && $.serialize(v, w), v.path !== void 0 && (w.skipEscape ? v.path = unescape(v.path) : (v.path = escape(v.path), v.scheme !== void 0 && (v.path = v.path.split("%3A").join(":")))), w.reference !== "suffix" && v.scheme && b.push(v.scheme, ":");
    const E = a(v);
    if (E !== void 0 && (w.reference !== "suffix" && b.push("//"), b.push(E), v.path && v.path[0] !== "/" && b.push("/")), v.path !== void 0) {
      let S = v.path;
      !w.absolutePath && (!$ || !$.absolutePath) && (S = r(S)), E === void 0 && S[0] === "/" && S[1] === "/" && (S = "/%2F" + S.slice(2)), b.push(S);
    }
    return v.query !== void 0 && b.push("?", v.query), v.fragment !== void 0 && b.push("#", v.fragment), b.join("");
  }
  const f = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  function h(m, g) {
    const v = Object.assign({}, g), w = {
      scheme: void 0,
      userinfo: void 0,
      host: "",
      port: void 0,
      path: "",
      query: void 0,
      fragment: void 0
    };
    let b = !1;
    v.reference === "suffix" && (v.scheme ? m = v.scheme + ":" + m : m = "//" + m);
    const $ = m.match(f);
    if ($) {
      if (w.scheme = $[1], w.userinfo = $[3], w.host = $[4], w.port = parseInt($[5], 10), w.path = $[6] || "", w.query = $[7], w.fragment = $[8], isNaN(w.port) && (w.port = $[5]), w.host)
        if (p(w.host) === !1) {
          const N = e(w.host);
          w.host = N.host.toLowerCase(), b = N.isIPV6;
        } else
          b = !0;
      w.scheme === void 0 && w.userinfo === void 0 && w.host === void 0 && w.port === void 0 && w.query === void 0 && !w.path ? w.reference = "same-document" : w.scheme === void 0 ? w.reference = "relative" : w.fragment === void 0 ? w.reference = "absolute" : w.reference = "uri", v.reference && v.reference !== "suffix" && v.reference !== w.reference && (w.error = w.error || "URI is not a " + v.reference + " reference.");
      const E = u(v.scheme || w.scheme);
      if (!v.unicodeSupport && (!E || !E.unicodeSupport) && w.host && (v.domainHost || E && E.domainHost) && b === !1 && c(w.host))
        try {
          w.host = URL.domainToASCII(w.host.toLowerCase());
        } catch (S) {
          w.error = w.error || "Host's domain name can not be converted to ASCII: " + S;
        }
      (!E || E && !E.skipNormalize) && (m.indexOf("%") !== -1 && (w.scheme !== void 0 && (w.scheme = unescape(w.scheme)), w.host !== void 0 && (w.host = unescape(w.host))), w.path && (w.path = escape(unescape(w.path))), w.fragment && (w.fragment = encodeURI(decodeURIComponent(w.fragment)))), E && E.parse && E.parse(w, v);
    } else
      w.error = w.error || "URI can not be parsed.";
    return w;
  }
  const y = {
    SCHEMES: o,
    normalize: l,
    resolve: i,
    resolveComponent: t,
    equal: s,
    serialize: n,
    parse: h
  };
  return gt.exports = y, gt.exports.default = y, gt.exports.fastUri = y, gt.exports;
}
var to;
function Jd() {
  if (to) return Kt;
  to = 1, Object.defineProperty(Kt, "__esModule", { value: !0 });
  const e = Hd();
  return e.code = 'require("ajv/dist/runtime/uri").default', Kt.default = e, Kt;
}
var ro;
function Ku() {
  return ro || (ro = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var r = It();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return r.KeywordCxt;
    } });
    var a = W();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return a._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return a.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return a.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return a.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return a.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return a.CodeGen;
    } });
    const d = cn(), p = At(), c = Fu(), o = ln(), u = W(), l = on(), i = Zr(), t = ee(), s = xd, n = Jd(), f = (L, O) => new RegExp(L, O);
    f.code = "new RegExp";
    const h = ["removeAdditional", "useDefaults", "coerceTypes"], y = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]), m = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    }, g = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, v = 200;
    function w(L) {
      var O, C, T, _, R, M, Y, J, ne, te, I, k, U, x, H, Z, fe, Re, be, Ee, de, Ze, Ne, Nn, Rn;
      const ht = L.strict, On = (O = L.code) === null || O === void 0 ? void 0 : O.optimize, oa = On === !0 || On === void 0 ? 1 : On || 0, ca = (T = (C = L.code) === null || C === void 0 ? void 0 : C.regExp) !== null && T !== void 0 ? T : f, Ff = (_ = L.uriResolver) !== null && _ !== void 0 ? _ : n.default;
      return {
        strictSchema: (M = (R = L.strictSchema) !== null && R !== void 0 ? R : ht) !== null && M !== void 0 ? M : !0,
        strictNumbers: (J = (Y = L.strictNumbers) !== null && Y !== void 0 ? Y : ht) !== null && J !== void 0 ? J : !0,
        strictTypes: (te = (ne = L.strictTypes) !== null && ne !== void 0 ? ne : ht) !== null && te !== void 0 ? te : "log",
        strictTuples: (k = (I = L.strictTuples) !== null && I !== void 0 ? I : ht) !== null && k !== void 0 ? k : "log",
        strictRequired: (x = (U = L.strictRequired) !== null && U !== void 0 ? U : ht) !== null && x !== void 0 ? x : !1,
        code: L.code ? { ...L.code, optimize: oa, regExp: ca } : { optimize: oa, regExp: ca },
        loopRequired: (H = L.loopRequired) !== null && H !== void 0 ? H : v,
        loopEnum: (Z = L.loopEnum) !== null && Z !== void 0 ? Z : v,
        meta: (fe = L.meta) !== null && fe !== void 0 ? fe : !0,
        messages: (Re = L.messages) !== null && Re !== void 0 ? Re : !0,
        inlineRefs: (be = L.inlineRefs) !== null && be !== void 0 ? be : !0,
        schemaId: (Ee = L.schemaId) !== null && Ee !== void 0 ? Ee : "$id",
        addUsedSchema: (de = L.addUsedSchema) !== null && de !== void 0 ? de : !0,
        validateSchema: (Ze = L.validateSchema) !== null && Ze !== void 0 ? Ze : !0,
        validateFormats: (Ne = L.validateFormats) !== null && Ne !== void 0 ? Ne : !0,
        unicodeRegExp: (Nn = L.unicodeRegExp) !== null && Nn !== void 0 ? Nn : !0,
        int32range: (Rn = L.int32range) !== null && Rn !== void 0 ? Rn : !0,
        uriResolver: Ff
      };
    }
    class b {
      constructor(O = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), O = this.opts = { ...O, ...w(O) };
        const { es5: C, lines: T } = this.opts.code;
        this.scope = new u.ValueScope({ scope: {}, prefixes: y, es5: C, lines: T }), this.logger = V(O.logger);
        const _ = O.validateFormats;
        O.validateFormats = !1, this.RULES = (0, c.getRules)(), $.call(this, m, O, "NOT SUPPORTED"), $.call(this, g, O, "DEPRECATED", "warn"), this._metaOpts = j.call(this), O.formats && N.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), O.keywords && P.call(this, O.keywords), typeof O.meta == "object" && this.addMetaSchema(O.meta), S.call(this), O.validateFormats = _;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: O, meta: C, schemaId: T } = this.opts;
        let _ = s;
        T === "id" && (_ = { ...s }, _.id = _.$id, delete _.$id), C && O && this.addMetaSchema(_, _[T], !1);
      }
      defaultMeta() {
        const { meta: O, schemaId: C } = this.opts;
        return this.opts.defaultMeta = typeof O == "object" ? O[C] || O : void 0;
      }
      validate(O, C) {
        let T;
        if (typeof O == "string") {
          if (T = this.getSchema(O), !T)
            throw new Error(`no schema with key or ref "${O}"`);
        } else
          T = this.compile(O);
        const _ = T(C);
        return "$async" in T || (this.errors = T.errors), _;
      }
      compile(O, C) {
        const T = this._addSchema(O, C);
        return T.validate || this._compileSchemaEnv(T);
      }
      compileAsync(O, C) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: T } = this.opts;
        return _.call(this, O, C);
        async function _(te, I) {
          await R.call(this, te.$schema);
          const k = this._addSchema(te, I);
          return k.validate || M.call(this, k);
        }
        async function R(te) {
          te && !this.getSchema(te) && await _.call(this, { $ref: te }, !0);
        }
        async function M(te) {
          try {
            return this._compileSchemaEnv(te);
          } catch (I) {
            if (!(I instanceof p.default))
              throw I;
            return Y.call(this, I), await J.call(this, I.missingSchema), M.call(this, te);
          }
        }
        function Y({ missingSchema: te, missingRef: I }) {
          if (this.refs[te])
            throw new Error(`AnySchema ${te} is loaded but ${I} cannot be resolved`);
        }
        async function J(te) {
          const I = await ne.call(this, te);
          this.refs[te] || await R.call(this, I.$schema), this.refs[te] || this.addSchema(I, te, C);
        }
        async function ne(te) {
          const I = this._loading[te];
          if (I)
            return I;
          try {
            return await (this._loading[te] = T(te));
          } finally {
            delete this._loading[te];
          }
        }
      }
      // Adds schema to the instance
      addSchema(O, C, T, _ = this.opts.validateSchema) {
        if (Array.isArray(O)) {
          for (const M of O)
            this.addSchema(M, void 0, T, _);
          return this;
        }
        let R;
        if (typeof O == "object") {
          const { schemaId: M } = this.opts;
          if (R = O[M], R !== void 0 && typeof R != "string")
            throw new Error(`schema ${M} must be string`);
        }
        return C = (0, l.normalizeId)(C || R), this._checkUnique(C), this.schemas[C] = this._addSchema(O, T, C, _, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(O, C, T = this.opts.validateSchema) {
        return this.addSchema(O, C, !0, T), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(O, C) {
        if (typeof O == "boolean")
          return !0;
        let T;
        if (T = O.$schema, T !== void 0 && typeof T != "string")
          throw new Error("$schema must be a string");
        if (T = T || this.opts.defaultMeta || this.defaultMeta(), !T)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const _ = this.validate(T, O);
        if (!_ && C) {
          const R = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(R);
          else
            throw new Error(R);
        }
        return _;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(O) {
        let C;
        for (; typeof (C = E.call(this, O)) == "string"; )
          O = C;
        if (C === void 0) {
          const { schemaId: T } = this.opts, _ = new o.SchemaEnv({ schema: {}, schemaId: T });
          if (C = o.resolveSchema.call(this, _, O), !C)
            return;
          this.refs[O] = C;
        }
        return C.validate || this._compileSchemaEnv(C);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(O) {
        if (O instanceof RegExp)
          return this._removeAllSchemas(this.schemas, O), this._removeAllSchemas(this.refs, O), this;
        switch (typeof O) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const C = E.call(this, O);
            return typeof C == "object" && this._cache.delete(C.schema), delete this.schemas[O], delete this.refs[O], this;
          }
          case "object": {
            const C = O;
            this._cache.delete(C);
            let T = O[this.opts.schemaId];
            return T && (T = (0, l.normalizeId)(T), delete this.schemas[T], delete this.refs[T]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(O) {
        for (const C of O)
          this.addKeyword(C);
        return this;
      }
      addKeyword(O, C) {
        let T;
        if (typeof O == "string")
          T = O, typeof C == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), C.keyword = T);
        else if (typeof O == "object" && C === void 0) {
          if (C = O, T = C.keyword, Array.isArray(T) && !T.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (q.call(this, T, C), !C)
          return (0, t.eachItem)(T, (R) => D.call(this, R)), this;
        F.call(this, C);
        const _ = {
          ...C,
          type: (0, i.getJSONTypes)(C.type),
          schemaType: (0, i.getJSONTypes)(C.schemaType)
        };
        return (0, t.eachItem)(T, _.type.length === 0 ? (R) => D.call(this, R, _) : (R) => _.type.forEach((M) => D.call(this, R, _, M))), this;
      }
      getKeyword(O) {
        const C = this.RULES.all[O];
        return typeof C == "object" ? C.definition : !!C;
      }
      // Remove keyword
      removeKeyword(O) {
        const { RULES: C } = this;
        delete C.keywords[O], delete C.all[O];
        for (const T of C.rules) {
          const _ = T.rules.findIndex((R) => R.keyword === O);
          _ >= 0 && T.rules.splice(_, 1);
        }
        return this;
      }
      // Add format
      addFormat(O, C) {
        return typeof C == "string" && (C = new RegExp(C)), this.formats[O] = C, this;
      }
      errorsText(O = this.errors, { separator: C = ", ", dataVar: T = "data" } = {}) {
        return !O || O.length === 0 ? "No errors" : O.map((_) => `${T}${_.instancePath} ${_.message}`).reduce((_, R) => _ + C + R);
      }
      $dataMetaSchema(O, C) {
        const T = this.RULES.all;
        O = JSON.parse(JSON.stringify(O));
        for (const _ of C) {
          const R = _.split("/").slice(1);
          let M = O;
          for (const Y of R)
            M = M[Y];
          for (const Y in T) {
            const J = T[Y];
            if (typeof J != "object")
              continue;
            const { $data: ne } = J.definition, te = M[Y];
            ne && te && (M[Y] = K(te));
          }
        }
        return O;
      }
      _removeAllSchemas(O, C) {
        for (const T in O) {
          const _ = O[T];
          (!C || C.test(T)) && (typeof _ == "string" ? delete O[T] : _ && !_.meta && (this._cache.delete(_.schema), delete O[T]));
        }
      }
      _addSchema(O, C, T, _ = this.opts.validateSchema, R = this.opts.addUsedSchema) {
        let M;
        const { schemaId: Y } = this.opts;
        if (typeof O == "object")
          M = O[Y];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof O != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let J = this._cache.get(O);
        if (J !== void 0)
          return J;
        T = (0, l.normalizeId)(M || T);
        const ne = l.getSchemaRefs.call(this, O, T);
        return J = new o.SchemaEnv({ schema: O, schemaId: Y, meta: C, baseId: T, localRefs: ne }), this._cache.set(J.schema, J), R && !T.startsWith("#") && (T && this._checkUnique(T), this.refs[T] = J), _ && this.validateSchema(O, !0), J;
      }
      _checkUnique(O) {
        if (this.schemas[O] || this.refs[O])
          throw new Error(`schema with key or id "${O}" already exists`);
      }
      _compileSchemaEnv(O) {
        if (O.meta ? this._compileMetaSchema(O) : o.compileSchema.call(this, O), !O.validate)
          throw new Error("ajv implementation error");
        return O.validate;
      }
      _compileMetaSchema(O) {
        const C = this.opts;
        this.opts = this._metaOpts;
        try {
          o.compileSchema.call(this, O);
        } finally {
          this.opts = C;
        }
      }
    }
    b.ValidationError = d.default, b.MissingRefError = p.default, e.default = b;
    function $(L, O, C, T = "error") {
      for (const _ in L) {
        const R = _;
        R in O && this.logger[T](`${C}: option ${_}. ${L[R]}`);
      }
    }
    function E(L) {
      return L = (0, l.normalizeId)(L), this.schemas[L] || this.refs[L];
    }
    function S() {
      const L = this.opts.schemas;
      if (L)
        if (Array.isArray(L))
          this.addSchema(L);
        else
          for (const O in L)
            this.addSchema(L[O], O);
    }
    function N() {
      for (const L in this.opts.formats) {
        const O = this.opts.formats[L];
        O && this.addFormat(L, O);
      }
    }
    function P(L) {
      if (Array.isArray(L)) {
        this.addVocabulary(L);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const O in L) {
        const C = L[O];
        C.keyword || (C.keyword = O), this.addKeyword(C);
      }
    }
    function j() {
      const L = { ...this.opts };
      for (const O of h)
        delete L[O];
      return L;
    }
    const A = { log() {
    }, warn() {
    }, error() {
    } };
    function V(L) {
      if (L === !1)
        return A;
      if (L === void 0)
        return console;
      if (L.log && L.warn && L.error)
        return L;
      throw new Error("logger must implement log, warn and error methods");
    }
    const z = /^[a-z_$][a-z0-9_$:-]*$/i;
    function q(L, O) {
      const { RULES: C } = this;
      if ((0, t.eachItem)(L, (T) => {
        if (C.keywords[T])
          throw new Error(`Keyword ${T} is already defined`);
        if (!z.test(T))
          throw new Error(`Keyword ${T} has invalid name`);
      }), !!O && O.$data && !("code" in O || "validate" in O))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function D(L, O, C) {
      var T;
      const _ = O?.post;
      if (C && _)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: R } = this;
      let M = _ ? R.post : R.rules.find(({ type: J }) => J === C);
      if (M || (M = { type: C, rules: [] }, R.rules.push(M)), R.keywords[L] = !0, !O)
        return;
      const Y = {
        keyword: L,
        definition: {
          ...O,
          type: (0, i.getJSONTypes)(O.type),
          schemaType: (0, i.getJSONTypes)(O.schemaType)
        }
      };
      O.before ? G.call(this, M, Y, O.before) : M.rules.push(Y), R.all[L] = Y, (T = O.implements) === null || T === void 0 || T.forEach((J) => this.addKeyword(J));
    }
    function G(L, O, C) {
      const T = L.rules.findIndex((_) => _.keyword === C);
      T >= 0 ? L.rules.splice(T, 0, O) : (L.rules.push(O), this.logger.warn(`rule ${C} is not defined`));
    }
    function F(L) {
      let { metaSchema: O } = L;
      O !== void 0 && (L.$data && this.opts.$data && (O = K(O)), L.validateSchema = this.compile(O, !0));
    }
    const B = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function K(L) {
      return { anyOf: [L, B] };
    }
  })(Un)), Un;
}
var zt = {}, Gt = {}, xt = {}, no;
function Wd() {
  if (no) return xt;
  no = 1, Object.defineProperty(xt, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return xt.default = e, xt;
}
var Ue = {}, so;
function Ki() {
  if (so) return Ue;
  so = 1, Object.defineProperty(Ue, "__esModule", { value: !0 }), Ue.callRef = Ue.getValidate = void 0;
  const e = At(), r = Te(), a = W(), d = Pe(), p = ln(), c = ee(), o = {
    keyword: "$ref",
    schemaType: "string",
    code(i) {
      const { gen: t, schema: s, it: n } = i, { baseId: f, schemaEnv: h, validateName: y, opts: m, self: g } = n, { root: v } = h;
      if ((s === "#" || s === "#/") && f === v.baseId)
        return b();
      const w = p.resolveRef.call(g, v, f, s);
      if (w === void 0)
        throw new e.default(n.opts.uriResolver, f, s);
      if (w instanceof p.SchemaEnv)
        return $(w);
      return E(w);
      function b() {
        if (h === v)
          return l(i, y, h, h.$async);
        const S = t.scopeValue("root", { ref: v });
        return l(i, (0, a._)`${S}.validate`, v, v.$async);
      }
      function $(S) {
        const N = u(i, S);
        l(i, N, S, S.$async);
      }
      function E(S) {
        const N = t.scopeValue("schema", m.code.source === !0 ? { ref: S, code: (0, a.stringify)(S) } : { ref: S }), P = t.name("valid"), j = i.subschema({
          schema: S,
          dataTypes: [],
          schemaPath: a.nil,
          topSchemaRef: N,
          errSchemaPath: s
        }, P);
        i.mergeEvaluated(j), i.ok(P);
      }
    }
  };
  function u(i, t) {
    const { gen: s } = i;
    return t.validate ? s.scopeValue("validate", { ref: t.validate }) : (0, a._)`${s.scopeValue("wrapper", { ref: t })}.validate`;
  }
  Ue.getValidate = u;
  function l(i, t, s, n) {
    const { gen: f, it: h } = i, { allErrors: y, schemaEnv: m, opts: g } = h, v = g.passContext ? d.default.this : a.nil;
    n ? w() : b();
    function w() {
      if (!m.$async)
        throw new Error("async schema referenced by sync schema");
      const S = f.let("valid");
      f.try(() => {
        f.code((0, a._)`await ${(0, r.callValidateCode)(i, t, v)}`), E(t), y || f.assign(S, !0);
      }, (N) => {
        f.if((0, a._)`!(${N} instanceof ${h.ValidationError})`, () => f.throw(N)), $(N), y || f.assign(S, !1);
      }), i.ok(S);
    }
    function b() {
      i.result((0, r.callValidateCode)(i, t, v), () => E(t), () => $(t));
    }
    function $(S) {
      const N = (0, a._)`${S}.errors`;
      f.assign(d.default.vErrors, (0, a._)`${d.default.vErrors} === null ? ${N} : ${d.default.vErrors}.concat(${N})`), f.assign(d.default.errors, (0, a._)`${d.default.vErrors}.length`);
    }
    function E(S) {
      var N;
      if (!h.opts.unevaluated)
        return;
      const P = (N = s?.validate) === null || N === void 0 ? void 0 : N.evaluated;
      if (h.props !== !0)
        if (P && !P.dynamicProps)
          P.props !== void 0 && (h.props = c.mergeEvaluated.props(f, P.props, h.props));
        else {
          const j = f.var("props", (0, a._)`${S}.evaluated.props`);
          h.props = c.mergeEvaluated.props(f, j, h.props, a.Name);
        }
      if (h.items !== !0)
        if (P && !P.dynamicItems)
          P.items !== void 0 && (h.items = c.mergeEvaluated.items(f, P.items, h.items));
        else {
          const j = f.var("items", (0, a._)`${S}.evaluated.items`);
          h.items = c.mergeEvaluated.items(f, j, h.items, a.Name);
        }
    }
  }
  return Ue.callRef = l, Ue.default = o, Ue;
}
var io;
function zu() {
  if (io) return Gt;
  io = 1, Object.defineProperty(Gt, "__esModule", { value: !0 });
  const e = Wd(), r = Ki(), a = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    r.default
  ];
  return Gt.default = a, Gt;
}
var Yt = {}, Ht = {}, ao;
function Xd() {
  if (ao) return Ht;
  ao = 1, Object.defineProperty(Ht, "__esModule", { value: !0 });
  const e = W(), r = e.operators, a = {
    maximum: { okStr: "<=", ok: r.LTE, fail: r.GT },
    minimum: { okStr: ">=", ok: r.GTE, fail: r.LT },
    exclusiveMaximum: { okStr: "<", ok: r.LT, fail: r.GTE },
    exclusiveMinimum: { okStr: ">", ok: r.GT, fail: r.LTE }
  }, d = {
    message: ({ keyword: c, schemaCode: o }) => (0, e.str)`must be ${a[c].okStr} ${o}`,
    params: ({ keyword: c, schemaCode: o }) => (0, e._)`{comparison: ${a[c].okStr}, limit: ${o}}`
  }, p = {
    keyword: Object.keys(a),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: d,
    code(c) {
      const { keyword: o, data: u, schemaCode: l } = c;
      c.fail$data((0, e._)`${u} ${a[o].fail} ${l} || isNaN(${u})`);
    }
  };
  return Ht.default = p, Ht;
}
var Jt = {}, oo;
function Qd() {
  if (oo) return Jt;
  oo = 1, Object.defineProperty(Jt, "__esModule", { value: !0 });
  const e = W(), a = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: d }) => (0, e.str)`must be multiple of ${d}`,
      params: ({ schemaCode: d }) => (0, e._)`{multipleOf: ${d}}`
    },
    code(d) {
      const { gen: p, data: c, schemaCode: o, it: u } = d, l = u.opts.multipleOfPrecision, i = p.let("res"), t = l ? (0, e._)`Math.abs(Math.round(${i}) - ${i}) > 1e-${l}` : (0, e._)`${i} !== parseInt(${i})`;
      d.fail$data((0, e._)`(${o} === 0 || (${i} = ${c}/${o}, ${t}))`);
    }
  };
  return Jt.default = a, Jt;
}
var Wt = {}, Xt = {}, co;
function Zd() {
  if (co) return Xt;
  co = 1, Object.defineProperty(Xt, "__esModule", { value: !0 });
  function e(r) {
    const a = r.length;
    let d = 0, p = 0, c;
    for (; p < a; )
      d++, c = r.charCodeAt(p++), c >= 55296 && c <= 56319 && p < a && (c = r.charCodeAt(p), (c & 64512) === 56320 && p++);
    return d;
  }
  return Xt.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', Xt;
}
var lo;
function eh() {
  if (lo) return Wt;
  lo = 1, Object.defineProperty(Wt, "__esModule", { value: !0 });
  const e = W(), r = ee(), a = Zd(), p = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: c, schemaCode: o }) {
        const u = c === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${u} than ${o} characters`;
      },
      params: ({ schemaCode: c }) => (0, e._)`{limit: ${c}}`
    },
    code(c) {
      const { keyword: o, data: u, schemaCode: l, it: i } = c, t = o === "maxLength" ? e.operators.GT : e.operators.LT, s = i.opts.unicode === !1 ? (0, e._)`${u}.length` : (0, e._)`${(0, r.useFunc)(c.gen, a.default)}(${u})`;
      c.fail$data((0, e._)`${s} ${t} ${l}`);
    }
  };
  return Wt.default = p, Wt;
}
var Qt = {}, uo;
function th() {
  if (uo) return Qt;
  uo = 1, Object.defineProperty(Qt, "__esModule", { value: !0 });
  const e = Te(), r = W(), d = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: p }) => (0, r.str)`must match pattern "${p}"`,
      params: ({ schemaCode: p }) => (0, r._)`{pattern: ${p}}`
    },
    code(p) {
      const { data: c, $data: o, schema: u, schemaCode: l, it: i } = p, t = i.opts.unicodeRegExp ? "u" : "", s = o ? (0, r._)`(new RegExp(${l}, ${t}))` : (0, e.usePattern)(p, u);
      p.fail$data((0, r._)`!${s}.test(${c})`);
    }
  };
  return Qt.default = d, Qt;
}
var Zt = {}, fo;
function rh() {
  if (fo) return Zt;
  fo = 1, Object.defineProperty(Zt, "__esModule", { value: !0 });
  const e = W(), a = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: d, schemaCode: p }) {
        const c = d === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${c} than ${p} properties`;
      },
      params: ({ schemaCode: d }) => (0, e._)`{limit: ${d}}`
    },
    code(d) {
      const { keyword: p, data: c, schemaCode: o } = d, u = p === "maxProperties" ? e.operators.GT : e.operators.LT;
      d.fail$data((0, e._)`Object.keys(${c}).length ${u} ${o}`);
    }
  };
  return Zt.default = a, Zt;
}
var er = {}, ho;
function nh() {
  if (ho) return er;
  ho = 1, Object.defineProperty(er, "__esModule", { value: !0 });
  const e = Te(), r = W(), a = ee(), p = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: c } }) => (0, r.str)`must have required property '${c}'`,
      params: ({ params: { missingProperty: c } }) => (0, r._)`{missingProperty: ${c}}`
    },
    code(c) {
      const { gen: o, schema: u, schemaCode: l, data: i, $data: t, it: s } = c, { opts: n } = s;
      if (!t && u.length === 0)
        return;
      const f = u.length >= n.loopRequired;
      if (s.allErrors ? h() : y(), n.strictRequired) {
        const v = c.parentSchema.properties, { definedProperties: w } = c.it;
        for (const b of u)
          if (v?.[b] === void 0 && !w.has(b)) {
            const $ = s.schemaEnv.baseId + s.errSchemaPath, E = `required property "${b}" is not defined at "${$}" (strictRequired)`;
            (0, a.checkStrictMode)(s, E, s.opts.strictRequired);
          }
      }
      function h() {
        if (f || t)
          c.block$data(r.nil, m);
        else
          for (const v of u)
            (0, e.checkReportMissingProp)(c, v);
      }
      function y() {
        const v = o.let("missing");
        if (f || t) {
          const w = o.let("valid", !0);
          c.block$data(w, () => g(v, w)), c.ok(w);
        } else
          o.if((0, e.checkMissingProp)(c, u, v)), (0, e.reportMissingProp)(c, v), o.else();
      }
      function m() {
        o.forOf("prop", l, (v) => {
          c.setParams({ missingProperty: v }), o.if((0, e.noPropertyInData)(o, i, v, n.ownProperties), () => c.error());
        });
      }
      function g(v, w) {
        c.setParams({ missingProperty: v }), o.forOf(v, l, () => {
          o.assign(w, (0, e.propertyInData)(o, i, v, n.ownProperties)), o.if((0, r.not)(w), () => {
            c.error(), o.break();
          });
        }, r.nil);
      }
    }
  };
  return er.default = p, er;
}
var tr = {}, po;
function sh() {
  if (po) return tr;
  po = 1, Object.defineProperty(tr, "__esModule", { value: !0 });
  const e = W(), a = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: d, schemaCode: p }) {
        const c = d === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${c} than ${p} items`;
      },
      params: ({ schemaCode: d }) => (0, e._)`{limit: ${d}}`
    },
    code(d) {
      const { keyword: p, data: c, schemaCode: o } = d, u = p === "maxItems" ? e.operators.GT : e.operators.LT;
      d.fail$data((0, e._)`${c}.length ${u} ${o}`);
    }
  };
  return tr.default = a, tr;
}
var rr = {}, nr = {}, mo;
function zi() {
  if (mo) return nr;
  mo = 1, Object.defineProperty(nr, "__esModule", { value: !0 });
  const e = Uu();
  return e.code = 'require("ajv/dist/runtime/equal").default', nr.default = e, nr;
}
var yo;
function ih() {
  if (yo) return rr;
  yo = 1, Object.defineProperty(rr, "__esModule", { value: !0 });
  const e = Zr(), r = W(), a = ee(), d = zi(), c = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i: o, j: u } }) => (0, r.str)`must NOT have duplicate items (items ## ${u} and ${o} are identical)`,
      params: ({ params: { i: o, j: u } }) => (0, r._)`{i: ${o}, j: ${u}}`
    },
    code(o) {
      const { gen: u, data: l, $data: i, schema: t, parentSchema: s, schemaCode: n, it: f } = o;
      if (!i && !t)
        return;
      const h = u.let("valid"), y = s.items ? (0, e.getSchemaTypes)(s.items) : [];
      o.block$data(h, m, (0, r._)`${n} === false`), o.ok(h);
      function m() {
        const b = u.let("i", (0, r._)`${l}.length`), $ = u.let("j");
        o.setParams({ i: b, j: $ }), u.assign(h, !0), u.if((0, r._)`${b} > 1`, () => (g() ? v : w)(b, $));
      }
      function g() {
        return y.length > 0 && !y.some((b) => b === "object" || b === "array");
      }
      function v(b, $) {
        const E = u.name("item"), S = (0, e.checkDataTypes)(y, E, f.opts.strictNumbers, e.DataType.Wrong), N = u.const("indices", (0, r._)`{}`);
        u.for((0, r._)`;${b}--;`, () => {
          u.let(E, (0, r._)`${l}[${b}]`), u.if(S, (0, r._)`continue`), y.length > 1 && u.if((0, r._)`typeof ${E} == "string"`, (0, r._)`${E} += "_"`), u.if((0, r._)`typeof ${N}[${E}] == "number"`, () => {
            u.assign($, (0, r._)`${N}[${E}]`), o.error(), u.assign(h, !1).break();
          }).code((0, r._)`${N}[${E}] = ${b}`);
        });
      }
      function w(b, $) {
        const E = (0, a.useFunc)(u, d.default), S = u.name("outer");
        u.label(S).for((0, r._)`;${b}--;`, () => u.for((0, r._)`${$} = ${b}; ${$}--;`, () => u.if((0, r._)`${E}(${l}[${b}], ${l}[${$}])`, () => {
          o.error(), u.assign(h, !1).break(S);
        })));
      }
    }
  };
  return rr.default = c, rr;
}
var sr = {}, go;
function ah() {
  if (go) return sr;
  go = 1, Object.defineProperty(sr, "__esModule", { value: !0 });
  const e = W(), r = ee(), a = zi(), p = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: c }) => (0, e._)`{allowedValue: ${c}}`
    },
    code(c) {
      const { gen: o, data: u, $data: l, schemaCode: i, schema: t } = c;
      l || t && typeof t == "object" ? c.fail$data((0, e._)`!${(0, r.useFunc)(o, a.default)}(${u}, ${i})`) : c.fail((0, e._)`${t} !== ${u}`);
    }
  };
  return sr.default = p, sr;
}
var ir = {}, vo;
function oh() {
  if (vo) return ir;
  vo = 1, Object.defineProperty(ir, "__esModule", { value: !0 });
  const e = W(), r = ee(), a = zi(), p = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: c }) => (0, e._)`{allowedValues: ${c}}`
    },
    code(c) {
      const { gen: o, data: u, $data: l, schema: i, schemaCode: t, it: s } = c;
      if (!l && i.length === 0)
        throw new Error("enum must have non-empty array");
      const n = i.length >= s.opts.loopEnum;
      let f;
      const h = () => f ?? (f = (0, r.useFunc)(o, a.default));
      let y;
      if (n || l)
        y = o.let("valid"), c.block$data(y, m);
      else {
        if (!Array.isArray(i))
          throw new Error("ajv implementation error");
        const v = o.const("vSchema", t);
        y = (0, e.or)(...i.map((w, b) => g(v, b)));
      }
      c.pass(y);
      function m() {
        o.assign(y, !1), o.forOf("v", t, (v) => o.if((0, e._)`${h()}(${u}, ${v})`, () => o.assign(y, !0).break()));
      }
      function g(v, w) {
        const b = i[w];
        return typeof b == "object" && b !== null ? (0, e._)`${h()}(${u}, ${v}[${w}])` : (0, e._)`${u} === ${b}`;
      }
    }
  };
  return ir.default = p, ir;
}
var $o;
function Gu() {
  if ($o) return Yt;
  $o = 1, Object.defineProperty(Yt, "__esModule", { value: !0 });
  const e = Xd(), r = Qd(), a = eh(), d = th(), p = rh(), c = nh(), o = sh(), u = ih(), l = ah(), i = oh(), t = [
    // number
    e.default,
    r.default,
    // string
    a.default,
    d.default,
    // object
    p.default,
    c.default,
    // array
    o.default,
    u.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    l.default,
    i.default
  ];
  return Yt.default = t, Yt;
}
var ar = {}, et = {}, wo;
function xu() {
  if (wo) return et;
  wo = 1, Object.defineProperty(et, "__esModule", { value: !0 }), et.validateAdditionalItems = void 0;
  const e = W(), r = ee(), d = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: c } }) => (0, e.str)`must NOT have more than ${c} items`,
      params: ({ params: { len: c } }) => (0, e._)`{limit: ${c}}`
    },
    code(c) {
      const { parentSchema: o, it: u } = c, { items: l } = o;
      if (!Array.isArray(l)) {
        (0, r.checkStrictMode)(u, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      p(c, l);
    }
  };
  function p(c, o) {
    const { gen: u, schema: l, data: i, keyword: t, it: s } = c;
    s.items = !0;
    const n = u.const("len", (0, e._)`${i}.length`);
    if (l === !1)
      c.setParams({ len: o.length }), c.pass((0, e._)`${n} <= ${o.length}`);
    else if (typeof l == "object" && !(0, r.alwaysValidSchema)(s, l)) {
      const h = u.var("valid", (0, e._)`${n} <= ${o.length}`);
      u.if((0, e.not)(h), () => f(h)), c.ok(h);
    }
    function f(h) {
      u.forRange("i", o.length, n, (y) => {
        c.subschema({ keyword: t, dataProp: y, dataPropType: r.Type.Num }, h), s.allErrors || u.if((0, e.not)(h), () => u.break());
      });
    }
  }
  return et.validateAdditionalItems = p, et.default = d, et;
}
var or = {}, tt = {}, bo;
function Yu() {
  if (bo) return tt;
  bo = 1, Object.defineProperty(tt, "__esModule", { value: !0 }), tt.validateTuple = void 0;
  const e = W(), r = ee(), a = Te(), d = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(c) {
      const { schema: o, it: u } = c;
      if (Array.isArray(o))
        return p(c, "additionalItems", o);
      u.items = !0, !(0, r.alwaysValidSchema)(u, o) && c.ok((0, a.validateArray)(c));
    }
  };
  function p(c, o, u = c.schema) {
    const { gen: l, parentSchema: i, data: t, keyword: s, it: n } = c;
    y(i), n.opts.unevaluated && u.length && n.items !== !0 && (n.items = r.mergeEvaluated.items(l, u.length, n.items));
    const f = l.name("valid"), h = l.const("len", (0, e._)`${t}.length`);
    u.forEach((m, g) => {
      (0, r.alwaysValidSchema)(n, m) || (l.if((0, e._)`${h} > ${g}`, () => c.subschema({
        keyword: s,
        schemaProp: g,
        dataProp: g
      }, f)), c.ok(f));
    });
    function y(m) {
      const { opts: g, errSchemaPath: v } = n, w = u.length, b = w === m.minItems && (w === m.maxItems || m[o] === !1);
      if (g.strictTuples && !b) {
        const $ = `"${s}" is ${w}-tuple, but minItems or maxItems/${o} are not specified or different at path "${v}"`;
        (0, r.checkStrictMode)(n, $, g.strictTuples);
      }
    }
  }
  return tt.validateTuple = p, tt.default = d, tt;
}
var Eo;
function ch() {
  if (Eo) return or;
  Eo = 1, Object.defineProperty(or, "__esModule", { value: !0 });
  const e = Yu(), r = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (a) => (0, e.validateTuple)(a, "items")
  };
  return or.default = r, or;
}
var cr = {}, So;
function lh() {
  if (So) return cr;
  So = 1, Object.defineProperty(cr, "__esModule", { value: !0 });
  const e = W(), r = ee(), a = Te(), d = xu(), c = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: o } }) => (0, e.str)`must NOT have more than ${o} items`,
      params: ({ params: { len: o } }) => (0, e._)`{limit: ${o}}`
    },
    code(o) {
      const { schema: u, parentSchema: l, it: i } = o, { prefixItems: t } = l;
      i.items = !0, !(0, r.alwaysValidSchema)(i, u) && (t ? (0, d.validateAdditionalItems)(o, t) : o.ok((0, a.validateArray)(o)));
    }
  };
  return cr.default = c, cr;
}
var lr = {}, _o;
function uh() {
  if (_o) return lr;
  _o = 1, Object.defineProperty(lr, "__esModule", { value: !0 });
  const e = W(), r = ee(), d = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: p, max: c } }) => c === void 0 ? (0, e.str)`must contain at least ${p} valid item(s)` : (0, e.str)`must contain at least ${p} and no more than ${c} valid item(s)`,
      params: ({ params: { min: p, max: c } }) => c === void 0 ? (0, e._)`{minContains: ${p}}` : (0, e._)`{minContains: ${p}, maxContains: ${c}}`
    },
    code(p) {
      const { gen: c, schema: o, parentSchema: u, data: l, it: i } = p;
      let t, s;
      const { minContains: n, maxContains: f } = u;
      i.opts.next ? (t = n === void 0 ? 1 : n, s = f) : t = 1;
      const h = c.const("len", (0, e._)`${l}.length`);
      if (p.setParams({ min: t, max: s }), s === void 0 && t === 0) {
        (0, r.checkStrictMode)(i, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if (s !== void 0 && t > s) {
        (0, r.checkStrictMode)(i, '"minContains" > "maxContains" is always invalid'), p.fail();
        return;
      }
      if ((0, r.alwaysValidSchema)(i, o)) {
        let w = (0, e._)`${h} >= ${t}`;
        s !== void 0 && (w = (0, e._)`${w} && ${h} <= ${s}`), p.pass(w);
        return;
      }
      i.items = !0;
      const y = c.name("valid");
      s === void 0 && t === 1 ? g(y, () => c.if(y, () => c.break())) : t === 0 ? (c.let(y, !0), s !== void 0 && c.if((0, e._)`${l}.length > 0`, m)) : (c.let(y, !1), m()), p.result(y, () => p.reset());
      function m() {
        const w = c.name("_valid"), b = c.let("count", 0);
        g(w, () => c.if(w, () => v(b)));
      }
      function g(w, b) {
        c.forRange("i", 0, h, ($) => {
          p.subschema({
            keyword: "contains",
            dataProp: $,
            dataPropType: r.Type.Num,
            compositeRule: !0
          }, w), b();
        });
      }
      function v(w) {
        c.code((0, e._)`${w}++`), s === void 0 ? c.if((0, e._)`${w} >= ${t}`, () => c.assign(y, !0).break()) : (c.if((0, e._)`${w} > ${s}`, () => c.assign(y, !1).break()), t === 1 ? c.assign(y, !0) : c.if((0, e._)`${w} >= ${t}`, () => c.assign(y, !0)));
      }
    }
  };
  return lr.default = d, lr;
}
var Wn = {}, No;
function Gi() {
  return No || (No = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const r = W(), a = ee(), d = Te();
    e.error = {
      message: ({ params: { property: l, depsCount: i, deps: t } }) => {
        const s = i === 1 ? "property" : "properties";
        return (0, r.str)`must have ${s} ${t} when property ${l} is present`;
      },
      params: ({ params: { property: l, depsCount: i, deps: t, missingProperty: s } }) => (0, r._)`{property: ${l},
    missingProperty: ${s},
    depsCount: ${i},
    deps: ${t}}`
      // TODO change to reference
    };
    const p = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(l) {
        const [i, t] = c(l);
        o(l, i), u(l, t);
      }
    };
    function c({ schema: l }) {
      const i = {}, t = {};
      for (const s in l) {
        if (s === "__proto__")
          continue;
        const n = Array.isArray(l[s]) ? i : t;
        n[s] = l[s];
      }
      return [i, t];
    }
    function o(l, i = l.schema) {
      const { gen: t, data: s, it: n } = l;
      if (Object.keys(i).length === 0)
        return;
      const f = t.let("missing");
      for (const h in i) {
        const y = i[h];
        if (y.length === 0)
          continue;
        const m = (0, d.propertyInData)(t, s, h, n.opts.ownProperties);
        l.setParams({
          property: h,
          depsCount: y.length,
          deps: y.join(", ")
        }), n.allErrors ? t.if(m, () => {
          for (const g of y)
            (0, d.checkReportMissingProp)(l, g);
        }) : (t.if((0, r._)`${m} && (${(0, d.checkMissingProp)(l, y, f)})`), (0, d.reportMissingProp)(l, f), t.else());
      }
    }
    e.validatePropertyDeps = o;
    function u(l, i = l.schema) {
      const { gen: t, data: s, keyword: n, it: f } = l, h = t.name("valid");
      for (const y in i)
        (0, a.alwaysValidSchema)(f, i[y]) || (t.if(
          (0, d.propertyInData)(t, s, y, f.opts.ownProperties),
          () => {
            const m = l.subschema({ keyword: n, schemaProp: y }, h);
            l.mergeValidEvaluated(m, h);
          },
          () => t.var(h, !0)
          // TODO var
        ), l.ok(h));
    }
    e.validateSchemaDeps = u, e.default = p;
  })(Wn)), Wn;
}
var ur = {}, Ro;
function fh() {
  if (Ro) return ur;
  Ro = 1, Object.defineProperty(ur, "__esModule", { value: !0 });
  const e = W(), r = ee(), d = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: p }) => (0, e._)`{propertyName: ${p.propertyName}}`
    },
    code(p) {
      const { gen: c, schema: o, data: u, it: l } = p;
      if ((0, r.alwaysValidSchema)(l, o))
        return;
      const i = c.name("valid");
      c.forIn("key", u, (t) => {
        p.setParams({ propertyName: t }), p.subschema({
          keyword: "propertyNames",
          data: t,
          dataTypes: ["string"],
          propertyName: t,
          compositeRule: !0
        }, i), c.if((0, e.not)(i), () => {
          p.error(!0), l.allErrors || c.break();
        });
      }), p.ok(i);
    }
  };
  return ur.default = d, ur;
}
var fr = {}, Oo;
function Hu() {
  if (Oo) return fr;
  Oo = 1, Object.defineProperty(fr, "__esModule", { value: !0 });
  const e = Te(), r = W(), a = Pe(), d = ee(), c = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: !0,
    trackErrors: !0,
    error: {
      message: "must NOT have additional properties",
      params: ({ params: o }) => (0, r._)`{additionalProperty: ${o.additionalProperty}}`
    },
    code(o) {
      const { gen: u, schema: l, parentSchema: i, data: t, errsCount: s, it: n } = o;
      if (!s)
        throw new Error("ajv implementation error");
      const { allErrors: f, opts: h } = n;
      if (n.props = !0, h.removeAdditional !== "all" && (0, d.alwaysValidSchema)(n, l))
        return;
      const y = (0, e.allSchemaProperties)(i.properties), m = (0, e.allSchemaProperties)(i.patternProperties);
      g(), o.ok((0, r._)`${s} === ${a.default.errors}`);
      function g() {
        u.forIn("key", t, (E) => {
          !y.length && !m.length ? b(E) : u.if(v(E), () => b(E));
        });
      }
      function v(E) {
        let S;
        if (y.length > 8) {
          const N = (0, d.schemaRefOrVal)(n, i.properties, "properties");
          S = (0, e.isOwnProperty)(u, N, E);
        } else y.length ? S = (0, r.or)(...y.map((N) => (0, r._)`${E} === ${N}`)) : S = r.nil;
        return m.length && (S = (0, r.or)(S, ...m.map((N) => (0, r._)`${(0, e.usePattern)(o, N)}.test(${E})`))), (0, r.not)(S);
      }
      function w(E) {
        u.code((0, r._)`delete ${t}[${E}]`);
      }
      function b(E) {
        if (h.removeAdditional === "all" || h.removeAdditional && l === !1) {
          w(E);
          return;
        }
        if (l === !1) {
          o.setParams({ additionalProperty: E }), o.error(), f || u.break();
          return;
        }
        if (typeof l == "object" && !(0, d.alwaysValidSchema)(n, l)) {
          const S = u.name("valid");
          h.removeAdditional === "failing" ? ($(E, S, !1), u.if((0, r.not)(S), () => {
            o.reset(), w(E);
          })) : ($(E, S), f || u.if((0, r.not)(S), () => u.break()));
        }
      }
      function $(E, S, N) {
        const P = {
          keyword: "additionalProperties",
          dataProp: E,
          dataPropType: d.Type.Str
        };
        N === !1 && Object.assign(P, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), o.subschema(P, S);
      }
    }
  };
  return fr.default = c, fr;
}
var dr = {}, Po;
function dh() {
  if (Po) return dr;
  Po = 1, Object.defineProperty(dr, "__esModule", { value: !0 });
  const e = It(), r = Te(), a = ee(), d = Hu(), p = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(c) {
      const { gen: o, schema: u, parentSchema: l, data: i, it: t } = c;
      t.opts.removeAdditional === "all" && l.additionalProperties === void 0 && d.default.code(new e.KeywordCxt(t, d.default, "additionalProperties"));
      const s = (0, r.allSchemaProperties)(u);
      for (const m of s)
        t.definedProperties.add(m);
      t.opts.unevaluated && s.length && t.props !== !0 && (t.props = a.mergeEvaluated.props(o, (0, a.toHash)(s), t.props));
      const n = s.filter((m) => !(0, a.alwaysValidSchema)(t, u[m]));
      if (n.length === 0)
        return;
      const f = o.name("valid");
      for (const m of n)
        h(m) ? y(m) : (o.if((0, r.propertyInData)(o, i, m, t.opts.ownProperties)), y(m), t.allErrors || o.else().var(f, !0), o.endIf()), c.it.definedProperties.add(m), c.ok(f);
      function h(m) {
        return t.opts.useDefaults && !t.compositeRule && u[m].default !== void 0;
      }
      function y(m) {
        c.subschema({
          keyword: "properties",
          schemaProp: m,
          dataProp: m
        }, f);
      }
    }
  };
  return dr.default = p, dr;
}
var hr = {}, To;
function hh() {
  if (To) return hr;
  To = 1, Object.defineProperty(hr, "__esModule", { value: !0 });
  const e = Te(), r = W(), a = ee(), d = ee(), p = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(c) {
      const { gen: o, schema: u, data: l, parentSchema: i, it: t } = c, { opts: s } = t, n = (0, e.allSchemaProperties)(u), f = n.filter((b) => (0, a.alwaysValidSchema)(t, u[b]));
      if (n.length === 0 || f.length === n.length && (!t.opts.unevaluated || t.props === !0))
        return;
      const h = s.strictSchema && !s.allowMatchingProperties && i.properties, y = o.name("valid");
      t.props !== !0 && !(t.props instanceof r.Name) && (t.props = (0, d.evaluatedPropsToName)(o, t.props));
      const { props: m } = t;
      g();
      function g() {
        for (const b of n)
          h && v(b), t.allErrors ? w(b) : (o.var(y, !0), w(b), o.if(y));
      }
      function v(b) {
        for (const $ in h)
          new RegExp(b).test($) && (0, a.checkStrictMode)(t, `property ${$} matches pattern ${b} (use allowMatchingProperties)`);
      }
      function w(b) {
        o.forIn("key", l, ($) => {
          o.if((0, r._)`${(0, e.usePattern)(c, b)}.test(${$})`, () => {
            const E = f.includes(b);
            E || c.subschema({
              keyword: "patternProperties",
              schemaProp: b,
              dataProp: $,
              dataPropType: d.Type.Str
            }, y), t.opts.unevaluated && m !== !0 ? o.assign((0, r._)`${m}[${$}]`, !0) : !E && !t.allErrors && o.if((0, r.not)(y), () => o.break());
          });
        });
      }
    }
  };
  return hr.default = p, hr;
}
var pr = {}, Io;
function ph() {
  if (Io) return pr;
  Io = 1, Object.defineProperty(pr, "__esModule", { value: !0 });
  const e = ee(), r = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(a) {
      const { gen: d, schema: p, it: c } = a;
      if ((0, e.alwaysValidSchema)(c, p)) {
        a.fail();
        return;
      }
      const o = d.name("valid");
      a.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, o), a.failResult(o, () => a.reset(), () => a.error());
    },
    error: { message: "must NOT be valid" }
  };
  return pr.default = r, pr;
}
var mr = {}, Ao;
function mh() {
  if (Ao) return mr;
  Ao = 1, Object.defineProperty(mr, "__esModule", { value: !0 });
  const r = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: Te().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return mr.default = r, mr;
}
var yr = {}, ko;
function yh() {
  if (ko) return yr;
  ko = 1, Object.defineProperty(yr, "__esModule", { value: !0 });
  const e = W(), r = ee(), d = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: p }) => (0, e._)`{passingSchemas: ${p.passing}}`
    },
    code(p) {
      const { gen: c, schema: o, parentSchema: u, it: l } = p;
      if (!Array.isArray(o))
        throw new Error("ajv implementation error");
      if (l.opts.discriminator && u.discriminator)
        return;
      const i = o, t = c.let("valid", !1), s = c.let("passing", null), n = c.name("_valid");
      p.setParams({ passing: s }), c.block(f), p.result(t, () => p.reset(), () => p.error(!0));
      function f() {
        i.forEach((h, y) => {
          let m;
          (0, r.alwaysValidSchema)(l, h) ? c.var(n, !0) : m = p.subschema({
            keyword: "oneOf",
            schemaProp: y,
            compositeRule: !0
          }, n), y > 0 && c.if((0, e._)`${n} && ${t}`).assign(t, !1).assign(s, (0, e._)`[${s}, ${y}]`).else(), c.if(n, () => {
            c.assign(t, !0), c.assign(s, y), m && p.mergeEvaluated(m, e.Name);
          });
        });
      }
    }
  };
  return yr.default = d, yr;
}
var gr = {}, qo;
function gh() {
  if (qo) return gr;
  qo = 1, Object.defineProperty(gr, "__esModule", { value: !0 });
  const e = ee(), r = {
    keyword: "allOf",
    schemaType: "array",
    code(a) {
      const { gen: d, schema: p, it: c } = a;
      if (!Array.isArray(p))
        throw new Error("ajv implementation error");
      const o = d.name("valid");
      p.forEach((u, l) => {
        if ((0, e.alwaysValidSchema)(c, u))
          return;
        const i = a.subschema({ keyword: "allOf", schemaProp: l }, o);
        a.ok(o), a.mergeEvaluated(i);
      });
    }
  };
  return gr.default = r, gr;
}
var vr = {}, Co;
function vh() {
  if (Co) return vr;
  Co = 1, Object.defineProperty(vr, "__esModule", { value: !0 });
  const e = W(), r = ee(), d = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: c }) => (0, e.str)`must match "${c.ifClause}" schema`,
      params: ({ params: c }) => (0, e._)`{failingKeyword: ${c.ifClause}}`
    },
    code(c) {
      const { gen: o, parentSchema: u, it: l } = c;
      u.then === void 0 && u.else === void 0 && (0, r.checkStrictMode)(l, '"if" without "then" and "else" is ignored');
      const i = p(l, "then"), t = p(l, "else");
      if (!i && !t)
        return;
      const s = o.let("valid", !0), n = o.name("_valid");
      if (f(), c.reset(), i && t) {
        const y = o.let("ifClause");
        c.setParams({ ifClause: y }), o.if(n, h("then", y), h("else", y));
      } else i ? o.if(n, h("then")) : o.if((0, e.not)(n), h("else"));
      c.pass(s, () => c.error(!0));
      function f() {
        const y = c.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, n);
        c.mergeEvaluated(y);
      }
      function h(y, m) {
        return () => {
          const g = c.subschema({ keyword: y }, n);
          o.assign(s, n), c.mergeValidEvaluated(g, s), m ? o.assign(m, (0, e._)`${y}`) : c.setParams({ ifClause: y });
        };
      }
    }
  };
  function p(c, o) {
    const u = c.schema[o];
    return u !== void 0 && !(0, r.alwaysValidSchema)(c, u);
  }
  return vr.default = d, vr;
}
var $r = {}, Lo;
function $h() {
  if (Lo) return $r;
  Lo = 1, Object.defineProperty($r, "__esModule", { value: !0 });
  const e = ee(), r = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: a, parentSchema: d, it: p }) {
      d.if === void 0 && (0, e.checkStrictMode)(p, `"${a}" without "if" is ignored`);
    }
  };
  return $r.default = r, $r;
}
var jo;
function Ju() {
  if (jo) return ar;
  jo = 1, Object.defineProperty(ar, "__esModule", { value: !0 });
  const e = xu(), r = ch(), a = Yu(), d = lh(), p = uh(), c = Gi(), o = fh(), u = Hu(), l = dh(), i = hh(), t = ph(), s = mh(), n = yh(), f = gh(), h = vh(), y = $h();
  function m(g = !1) {
    const v = [
      // any
      t.default,
      s.default,
      n.default,
      f.default,
      h.default,
      y.default,
      // object
      o.default,
      u.default,
      c.default,
      l.default,
      i.default
    ];
    return g ? v.push(r.default, d.default) : v.push(e.default, a.default), v.push(p.default), v;
  }
  return ar.default = m, ar;
}
var wr = {}, rt = {}, Mo;
function Wu() {
  if (Mo) return rt;
  Mo = 1, Object.defineProperty(rt, "__esModule", { value: !0 }), rt.dynamicAnchor = void 0;
  const e = W(), r = Pe(), a = ln(), d = Ki(), p = {
    keyword: "$dynamicAnchor",
    schemaType: "string",
    code: (u) => c(u, u.schema)
  };
  function c(u, l) {
    const { gen: i, it: t } = u;
    t.schemaEnv.root.dynamicAnchors[l] = !0;
    const s = (0, e._)`${r.default.dynamicAnchors}${(0, e.getProperty)(l)}`, n = t.errSchemaPath === "#" ? t.validateName : o(u);
    i.if((0, e._)`!${s}`, () => i.assign(s, n));
  }
  rt.dynamicAnchor = c;
  function o(u) {
    const { schemaEnv: l, schema: i, self: t } = u.it, { root: s, baseId: n, localRefs: f, meta: h } = l.root, { schemaId: y } = t.opts, m = new a.SchemaEnv({ schema: i, schemaId: y, root: s, baseId: n, localRefs: f, meta: h });
    return a.compileSchema.call(t, m), (0, d.getValidate)(u, m);
  }
  return rt.default = p, rt;
}
var nt = {}, Do;
function Xu() {
  if (Do) return nt;
  Do = 1, Object.defineProperty(nt, "__esModule", { value: !0 }), nt.dynamicRef = void 0;
  const e = W(), r = Pe(), a = Ki(), d = {
    keyword: "$dynamicRef",
    schemaType: "string",
    code: (c) => p(c, c.schema)
  };
  function p(c, o) {
    const { gen: u, keyword: l, it: i } = c;
    if (o[0] !== "#")
      throw new Error(`"${l}" only supports hash fragment reference`);
    const t = o.slice(1);
    if (i.allErrors)
      s();
    else {
      const f = u.let("valid", !1);
      s(f), c.ok(f);
    }
    function s(f) {
      if (i.schemaEnv.root.dynamicAnchors[t]) {
        const h = u.let("_v", (0, e._)`${r.default.dynamicAnchors}${(0, e.getProperty)(t)}`);
        u.if(h, n(h, f), n(i.validateName, f));
      } else
        n(i.validateName, f)();
    }
    function n(f, h) {
      return h ? () => u.block(() => {
        (0, a.callRef)(c, f), u.let(h, !0);
      }) : () => (0, a.callRef)(c, f);
    }
  }
  return nt.dynamicRef = p, nt.default = d, nt;
}
var br = {}, Fo;
function wh() {
  if (Fo) return br;
  Fo = 1, Object.defineProperty(br, "__esModule", { value: !0 });
  const e = Wu(), r = ee(), a = {
    keyword: "$recursiveAnchor",
    schemaType: "boolean",
    code(d) {
      d.schema ? (0, e.dynamicAnchor)(d, "") : (0, r.checkStrictMode)(d.it, "$recursiveAnchor: false is ignored");
    }
  };
  return br.default = a, br;
}
var Er = {}, Vo;
function bh() {
  if (Vo) return Er;
  Vo = 1, Object.defineProperty(Er, "__esModule", { value: !0 });
  const e = Xu(), r = {
    keyword: "$recursiveRef",
    schemaType: "string",
    code: (a) => (0, e.dynamicRef)(a, a.schema)
  };
  return Er.default = r, Er;
}
var Uo;
function Eh() {
  if (Uo) return wr;
  Uo = 1, Object.defineProperty(wr, "__esModule", { value: !0 });
  const e = Wu(), r = Xu(), a = wh(), d = bh(), p = [e.default, r.default, a.default, d.default];
  return wr.default = p, wr;
}
var Sr = {}, _r = {}, Bo;
function Sh() {
  if (Bo) return _r;
  Bo = 1, Object.defineProperty(_r, "__esModule", { value: !0 });
  const e = Gi(), r = {
    keyword: "dependentRequired",
    type: "object",
    schemaType: "object",
    error: e.error,
    code: (a) => (0, e.validatePropertyDeps)(a)
  };
  return _r.default = r, _r;
}
var Nr = {}, Ko;
function _h() {
  if (Ko) return Nr;
  Ko = 1, Object.defineProperty(Nr, "__esModule", { value: !0 });
  const e = Gi(), r = {
    keyword: "dependentSchemas",
    type: "object",
    schemaType: "object",
    code: (a) => (0, e.validateSchemaDeps)(a)
  };
  return Nr.default = r, Nr;
}
var Rr = {}, zo;
function Nh() {
  if (zo) return Rr;
  zo = 1, Object.defineProperty(Rr, "__esModule", { value: !0 });
  const e = ee(), r = {
    keyword: ["maxContains", "minContains"],
    type: "array",
    schemaType: "number",
    code({ keyword: a, parentSchema: d, it: p }) {
      d.contains === void 0 && (0, e.checkStrictMode)(p, `"${a}" without "contains" is ignored`);
    }
  };
  return Rr.default = r, Rr;
}
var Go;
function Rh() {
  if (Go) return Sr;
  Go = 1, Object.defineProperty(Sr, "__esModule", { value: !0 });
  const e = Sh(), r = _h(), a = Nh(), d = [e.default, r.default, a.default];
  return Sr.default = d, Sr;
}
var Or = {}, Pr = {}, xo;
function Oh() {
  if (xo) return Pr;
  xo = 1, Object.defineProperty(Pr, "__esModule", { value: !0 });
  const e = W(), r = ee(), a = Pe(), p = {
    keyword: "unevaluatedProperties",
    type: "object",
    schemaType: ["boolean", "object"],
    trackErrors: !0,
    error: {
      message: "must NOT have unevaluated properties",
      params: ({ params: c }) => (0, e._)`{unevaluatedProperty: ${c.unevaluatedProperty}}`
    },
    code(c) {
      const { gen: o, schema: u, data: l, errsCount: i, it: t } = c;
      if (!i)
        throw new Error("ajv implementation error");
      const { allErrors: s, props: n } = t;
      n instanceof e.Name ? o.if((0, e._)`${n} !== true`, () => o.forIn("key", l, (m) => o.if(h(n, m), () => f(m)))) : n !== !0 && o.forIn("key", l, (m) => n === void 0 ? f(m) : o.if(y(n, m), () => f(m))), t.props = !0, c.ok((0, e._)`${i} === ${a.default.errors}`);
      function f(m) {
        if (u === !1) {
          c.setParams({ unevaluatedProperty: m }), c.error(), s || o.break();
          return;
        }
        if (!(0, r.alwaysValidSchema)(t, u)) {
          const g = o.name("valid");
          c.subschema({
            keyword: "unevaluatedProperties",
            dataProp: m,
            dataPropType: r.Type.Str
          }, g), s || o.if((0, e.not)(g), () => o.break());
        }
      }
      function h(m, g) {
        return (0, e._)`!${m} || !${m}[${g}]`;
      }
      function y(m, g) {
        const v = [];
        for (const w in m)
          m[w] === !0 && v.push((0, e._)`${g} !== ${w}`);
        return (0, e.and)(...v);
      }
    }
  };
  return Pr.default = p, Pr;
}
var Tr = {}, Yo;
function Ph() {
  if (Yo) return Tr;
  Yo = 1, Object.defineProperty(Tr, "__esModule", { value: !0 });
  const e = W(), r = ee(), d = {
    keyword: "unevaluatedItems",
    type: "array",
    schemaType: ["boolean", "object"],
    error: {
      message: ({ params: { len: p } }) => (0, e.str)`must NOT have more than ${p} items`,
      params: ({ params: { len: p } }) => (0, e._)`{limit: ${p}}`
    },
    code(p) {
      const { gen: c, schema: o, data: u, it: l } = p, i = l.items || 0;
      if (i === !0)
        return;
      const t = c.const("len", (0, e._)`${u}.length`);
      if (o === !1)
        p.setParams({ len: i }), p.fail((0, e._)`${t} > ${i}`);
      else if (typeof o == "object" && !(0, r.alwaysValidSchema)(l, o)) {
        const n = c.var("valid", (0, e._)`${t} <= ${i}`);
        c.if((0, e.not)(n), () => s(n, i)), p.ok(n);
      }
      l.items = !0;
      function s(n, f) {
        c.forRange("i", f, t, (h) => {
          p.subschema({ keyword: "unevaluatedItems", dataProp: h, dataPropType: r.Type.Num }, n), l.allErrors || c.if((0, e.not)(n), () => c.break());
        });
      }
    }
  };
  return Tr.default = d, Tr;
}
var Ho;
function Th() {
  if (Ho) return Or;
  Ho = 1, Object.defineProperty(Or, "__esModule", { value: !0 });
  const e = Oh(), r = Ph(), a = [e.default, r.default];
  return Or.default = a, Or;
}
var Ir = {}, Ar = {}, Jo;
function Ih() {
  if (Jo) return Ar;
  Jo = 1, Object.defineProperty(Ar, "__esModule", { value: !0 });
  const e = W(), a = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: d }) => (0, e.str)`must match format "${d}"`,
      params: ({ schemaCode: d }) => (0, e._)`{format: ${d}}`
    },
    code(d, p) {
      const { gen: c, data: o, $data: u, schema: l, schemaCode: i, it: t } = d, { opts: s, errSchemaPath: n, schemaEnv: f, self: h } = t;
      if (!s.validateFormats)
        return;
      u ? y() : m();
      function y() {
        const g = c.scopeValue("formats", {
          ref: h.formats,
          code: s.code.formats
        }), v = c.const("fDef", (0, e._)`${g}[${i}]`), w = c.let("fType"), b = c.let("format");
        c.if((0, e._)`typeof ${v} == "object" && !(${v} instanceof RegExp)`, () => c.assign(w, (0, e._)`${v}.type || "string"`).assign(b, (0, e._)`${v}.validate`), () => c.assign(w, (0, e._)`"string"`).assign(b, v)), d.fail$data((0, e.or)($(), E()));
        function $() {
          return s.strictSchema === !1 ? e.nil : (0, e._)`${i} && !${b}`;
        }
        function E() {
          const S = f.$async ? (0, e._)`(${v}.async ? await ${b}(${o}) : ${b}(${o}))` : (0, e._)`${b}(${o})`, N = (0, e._)`(typeof ${b} == "function" ? ${S} : ${b}.test(${o}))`;
          return (0, e._)`${b} && ${b} !== true && ${w} === ${p} && !${N}`;
        }
      }
      function m() {
        const g = h.formats[l];
        if (!g) {
          $();
          return;
        }
        if (g === !0)
          return;
        const [v, w, b] = E(g);
        v === p && d.pass(S());
        function $() {
          if (s.strictSchema === !1) {
            h.logger.warn(N());
            return;
          }
          throw new Error(N());
          function N() {
            return `unknown format "${l}" ignored in schema at path "${n}"`;
          }
        }
        function E(N) {
          const P = N instanceof RegExp ? (0, e.regexpCode)(N) : s.code.formats ? (0, e._)`${s.code.formats}${(0, e.getProperty)(l)}` : void 0, j = c.scopeValue("formats", { key: l, ref: N, code: P });
          return typeof N == "object" && !(N instanceof RegExp) ? [N.type || "string", N.validate, (0, e._)`${j}.validate`] : ["string", N, j];
        }
        function S() {
          if (typeof g == "object" && !(g instanceof RegExp) && g.async) {
            if (!f.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${b}(${o})`;
          }
          return typeof w == "function" ? (0, e._)`${b}(${o})` : (0, e._)`${b}.test(${o})`;
        }
      }
    }
  };
  return Ar.default = a, Ar;
}
var Wo;
function Qu() {
  if (Wo) return Ir;
  Wo = 1, Object.defineProperty(Ir, "__esModule", { value: !0 });
  const r = [Ih().default];
  return Ir.default = r, Ir;
}
var Ge = {}, Xo;
function Zu() {
  return Xo || (Xo = 1, Object.defineProperty(Ge, "__esModule", { value: !0 }), Ge.contentVocabulary = Ge.metadataVocabulary = void 0, Ge.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], Ge.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), Ge;
}
var Qo;
function Ah() {
  if (Qo) return zt;
  Qo = 1, Object.defineProperty(zt, "__esModule", { value: !0 });
  const e = zu(), r = Gu(), a = Ju(), d = Eh(), p = Rh(), c = Th(), o = Qu(), u = Zu(), l = [
    d.default,
    e.default,
    r.default,
    (0, a.default)(!0),
    o.default,
    u.metadataVocabulary,
    u.contentVocabulary,
    p.default,
    c.default
  ];
  return zt.default = l, zt;
}
var kr = {}, vt = {}, Zo;
function kh() {
  if (Zo) return vt;
  Zo = 1, Object.defineProperty(vt, "__esModule", { value: !0 }), vt.DiscrError = void 0;
  var e;
  return (function(r) {
    r.Tag = "tag", r.Mapping = "mapping";
  })(e || (vt.DiscrError = e = {})), vt;
}
var ec;
function ef() {
  if (ec) return kr;
  ec = 1, Object.defineProperty(kr, "__esModule", { value: !0 });
  const e = W(), r = kh(), a = ln(), d = At(), p = ee(), o = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: u, tagName: l } }) => u === r.DiscrError.Tag ? `tag "${l}" must be string` : `value of tag "${l}" must be in oneOf`,
      params: ({ params: { discrError: u, tag: l, tagName: i } }) => (0, e._)`{error: ${u}, tag: ${i}, tagValue: ${l}}`
    },
    code(u) {
      const { gen: l, data: i, schema: t, parentSchema: s, it: n } = u, { oneOf: f } = s;
      if (!n.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const h = t.propertyName;
      if (typeof h != "string")
        throw new Error("discriminator: requires propertyName");
      if (t.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!f)
        throw new Error("discriminator: requires oneOf keyword");
      const y = l.let("valid", !1), m = l.const("tag", (0, e._)`${i}${(0, e.getProperty)(h)}`);
      l.if((0, e._)`typeof ${m} == "string"`, () => g(), () => u.error(!1, { discrError: r.DiscrError.Tag, tag: m, tagName: h })), u.ok(y);
      function g() {
        const b = w();
        l.if(!1);
        for (const $ in b)
          l.elseIf((0, e._)`${m} === ${$}`), l.assign(y, v(b[$]));
        l.else(), u.error(!1, { discrError: r.DiscrError.Mapping, tag: m, tagName: h }), l.endIf();
      }
      function v(b) {
        const $ = l.name("valid"), E = u.subschema({ keyword: "oneOf", schemaProp: b }, $);
        return u.mergeEvaluated(E, e.Name), $;
      }
      function w() {
        var b;
        const $ = {}, E = N(s);
        let S = !0;
        for (let A = 0; A < f.length; A++) {
          let V = f[A];
          if (V?.$ref && !(0, p.schemaHasRulesButRef)(V, n.self.RULES)) {
            const q = V.$ref;
            if (V = a.resolveRef.call(n.self, n.schemaEnv.root, n.baseId, q), V instanceof a.SchemaEnv && (V = V.schema), V === void 0)
              throw new d.default(n.opts.uriResolver, n.baseId, q);
          }
          const z = (b = V?.properties) === null || b === void 0 ? void 0 : b[h];
          if (typeof z != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${h}"`);
          S = S && (E || N(V)), P(z, A);
        }
        if (!S)
          throw new Error(`discriminator: "${h}" must be required`);
        return $;
        function N({ required: A }) {
          return Array.isArray(A) && A.includes(h);
        }
        function P(A, V) {
          if (A.const)
            j(A.const, V);
          else if (A.enum)
            for (const z of A.enum)
              j(z, V);
          else
            throw new Error(`discriminator: "properties/${h}" must have "const" or "enum"`);
        }
        function j(A, V) {
          if (typeof A != "string" || A in $)
            throw new Error(`discriminator: "${h}" values must be unique strings`);
          $[A] = V;
        }
      }
    }
  };
  return kr.default = o, kr;
}
var qr = {};
const qh = "https://json-schema.org/draft/2020-12/schema", Ch = "https://json-schema.org/draft/2020-12/schema", Lh = { "https://json-schema.org/draft/2020-12/vocab/core": !0, "https://json-schema.org/draft/2020-12/vocab/applicator": !0, "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0, "https://json-schema.org/draft/2020-12/vocab/validation": !0, "https://json-schema.org/draft/2020-12/vocab/meta-data": !0, "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0, "https://json-schema.org/draft/2020-12/vocab/content": !0 }, jh = "meta", Mh = "Core and Validation specifications meta-schema", Dh = [{ $ref: "meta/core" }, { $ref: "meta/applicator" }, { $ref: "meta/unevaluated" }, { $ref: "meta/validation" }, { $ref: "meta/meta-data" }, { $ref: "meta/format-annotation" }, { $ref: "meta/content" }], Fh = ["object", "boolean"], Vh = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", Uh = { definitions: { $comment: '"definitions" has been replaced by "$defs".', type: "object", additionalProperties: { $dynamicRef: "#meta" }, deprecated: !0, default: {} }, dependencies: { $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.', type: "object", additionalProperties: { anyOf: [{ $dynamicRef: "#meta" }, { $ref: "meta/validation#/$defs/stringArray" }] }, deprecated: !0, default: {} }, $recursiveAnchor: { $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".', $ref: "meta/core#/$defs/anchorString", deprecated: !0 }, $recursiveRef: { $comment: '"$recursiveRef" has been replaced by "$dynamicRef".', $ref: "meta/core#/$defs/uriReferenceString", deprecated: !0 } }, Bh = {
  $schema: qh,
  $id: Ch,
  $vocabulary: Lh,
  $dynamicAnchor: jh,
  title: Mh,
  allOf: Dh,
  type: Fh,
  $comment: Vh,
  properties: Uh
}, Kh = "https://json-schema.org/draft/2020-12/schema", zh = "https://json-schema.org/draft/2020-12/meta/applicator", Gh = { "https://json-schema.org/draft/2020-12/vocab/applicator": !0 }, xh = "meta", Yh = "Applicator vocabulary meta-schema", Hh = ["object", "boolean"], Jh = { prefixItems: { $ref: "#/$defs/schemaArray" }, items: { $dynamicRef: "#meta" }, contains: { $dynamicRef: "#meta" }, additionalProperties: { $dynamicRef: "#meta" }, properties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, propertyNames: { format: "regex" }, default: {} }, dependentSchemas: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, propertyNames: { $dynamicRef: "#meta" }, if: { $dynamicRef: "#meta" }, then: { $dynamicRef: "#meta" }, else: { $dynamicRef: "#meta" }, allOf: { $ref: "#/$defs/schemaArray" }, anyOf: { $ref: "#/$defs/schemaArray" }, oneOf: { $ref: "#/$defs/schemaArray" }, not: { $dynamicRef: "#meta" } }, Wh = { schemaArray: { type: "array", minItems: 1, items: { $dynamicRef: "#meta" } } }, Xh = {
  $schema: Kh,
  $id: zh,
  $vocabulary: Gh,
  $dynamicAnchor: xh,
  title: Yh,
  type: Hh,
  properties: Jh,
  $defs: Wh
}, Qh = "https://json-schema.org/draft/2020-12/schema", Zh = "https://json-schema.org/draft/2020-12/meta/unevaluated", ep = { "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0 }, tp = "meta", rp = "Unevaluated applicator vocabulary meta-schema", np = ["object", "boolean"], sp = { unevaluatedItems: { $dynamicRef: "#meta" }, unevaluatedProperties: { $dynamicRef: "#meta" } }, ip = {
  $schema: Qh,
  $id: Zh,
  $vocabulary: ep,
  $dynamicAnchor: tp,
  title: rp,
  type: np,
  properties: sp
}, ap = "https://json-schema.org/draft/2020-12/schema", op = "https://json-schema.org/draft/2020-12/meta/content", cp = { "https://json-schema.org/draft/2020-12/vocab/content": !0 }, lp = "meta", up = "Content vocabulary meta-schema", fp = ["object", "boolean"], dp = { contentEncoding: { type: "string" }, contentMediaType: { type: "string" }, contentSchema: { $dynamicRef: "#meta" } }, hp = {
  $schema: ap,
  $id: op,
  $vocabulary: cp,
  $dynamicAnchor: lp,
  title: up,
  type: fp,
  properties: dp
}, pp = "https://json-schema.org/draft/2020-12/schema", mp = "https://json-schema.org/draft/2020-12/meta/core", yp = { "https://json-schema.org/draft/2020-12/vocab/core": !0 }, gp = "meta", vp = "Core vocabulary meta-schema", $p = ["object", "boolean"], wp = { $id: { $ref: "#/$defs/uriReferenceString", $comment: "Non-empty fragments not allowed.", pattern: "^[^#]*#?$" }, $schema: { $ref: "#/$defs/uriString" }, $ref: { $ref: "#/$defs/uriReferenceString" }, $anchor: { $ref: "#/$defs/anchorString" }, $dynamicRef: { $ref: "#/$defs/uriReferenceString" }, $dynamicAnchor: { $ref: "#/$defs/anchorString" }, $vocabulary: { type: "object", propertyNames: { $ref: "#/$defs/uriString" }, additionalProperties: { type: "boolean" } }, $comment: { type: "string" }, $defs: { type: "object", additionalProperties: { $dynamicRef: "#meta" } } }, bp = { anchorString: { type: "string", pattern: "^[A-Za-z_][-A-Za-z0-9._]*$" }, uriString: { type: "string", format: "uri" }, uriReferenceString: { type: "string", format: "uri-reference" } }, Ep = {
  $schema: pp,
  $id: mp,
  $vocabulary: yp,
  $dynamicAnchor: gp,
  title: vp,
  type: $p,
  properties: wp,
  $defs: bp
}, Sp = "https://json-schema.org/draft/2020-12/schema", _p = "https://json-schema.org/draft/2020-12/meta/format-annotation", Np = { "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0 }, Rp = "meta", Op = "Format vocabulary meta-schema for annotation results", Pp = ["object", "boolean"], Tp = { format: { type: "string" } }, Ip = {
  $schema: Sp,
  $id: _p,
  $vocabulary: Np,
  $dynamicAnchor: Rp,
  title: Op,
  type: Pp,
  properties: Tp
}, Ap = "https://json-schema.org/draft/2020-12/schema", kp = "https://json-schema.org/draft/2020-12/meta/meta-data", qp = { "https://json-schema.org/draft/2020-12/vocab/meta-data": !0 }, Cp = "meta", Lp = "Meta-data vocabulary meta-schema", jp = ["object", "boolean"], Mp = { title: { type: "string" }, description: { type: "string" }, default: !0, deprecated: { type: "boolean", default: !1 }, readOnly: { type: "boolean", default: !1 }, writeOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 } }, Dp = {
  $schema: Ap,
  $id: kp,
  $vocabulary: qp,
  $dynamicAnchor: Cp,
  title: Lp,
  type: jp,
  properties: Mp
}, Fp = "https://json-schema.org/draft/2020-12/schema", Vp = "https://json-schema.org/draft/2020-12/meta/validation", Up = { "https://json-schema.org/draft/2020-12/vocab/validation": !0 }, Bp = "meta", Kp = "Validation vocabulary meta-schema", zp = ["object", "boolean"], Gp = { type: { anyOf: [{ $ref: "#/$defs/simpleTypes" }, { type: "array", items: { $ref: "#/$defs/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, const: !0, enum: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/$defs/nonNegativeInteger" }, minLength: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, maxItems: { $ref: "#/$defs/nonNegativeInteger" }, minItems: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, maxContains: { $ref: "#/$defs/nonNegativeInteger" }, minContains: { $ref: "#/$defs/nonNegativeInteger", default: 1 }, maxProperties: { $ref: "#/$defs/nonNegativeInteger" }, minProperties: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, required: { $ref: "#/$defs/stringArray" }, dependentRequired: { type: "object", additionalProperties: { $ref: "#/$defs/stringArray" } } }, xp = { nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { $ref: "#/$defs/nonNegativeInteger", default: 0 }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, Yp = {
  $schema: Fp,
  $id: Vp,
  $vocabulary: Up,
  $dynamicAnchor: Bp,
  title: Kp,
  type: zp,
  properties: Gp,
  $defs: xp
};
var tc;
function Hp() {
  if (tc) return qr;
  tc = 1, Object.defineProperty(qr, "__esModule", { value: !0 });
  const e = Bh, r = Xh, a = ip, d = hp, p = Ep, c = Ip, o = Dp, u = Yp, l = ["/properties"];
  function i(t) {
    return [
      e,
      r,
      a,
      d,
      p,
      s(this, c),
      o,
      s(this, u)
    ].forEach((n) => this.addMetaSchema(n, void 0, !1)), this;
    function s(n, f) {
      return t ? n.$dataMetaSchema(f, l) : f;
    }
  }
  return qr.default = i, qr;
}
var rc;
function Jp() {
  return rc || (rc = 1, (function(e, r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.MissingRefError = r.ValidationError = r.CodeGen = r.Name = r.nil = r.stringify = r.str = r._ = r.KeywordCxt = r.Ajv2020 = void 0;
    const a = Ku(), d = Ah(), p = ef(), c = Hp(), o = "https://json-schema.org/draft/2020-12/schema";
    class u extends a.default {
      constructor(f = {}) {
        super({
          ...f,
          dynamicRef: !0,
          next: !0,
          unevaluated: !0
        });
      }
      _addVocabularies() {
        super._addVocabularies(), d.default.forEach((f) => this.addVocabulary(f)), this.opts.discriminator && this.addKeyword(p.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        const { $data: f, meta: h } = this.opts;
        h && (c.default.call(this, f), this.refs["http://json-schema.org/schema"] = o);
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
      }
    }
    r.Ajv2020 = u, e.exports = r = u, e.exports.Ajv2020 = u, Object.defineProperty(r, "__esModule", { value: !0 }), r.default = u;
    var l = It();
    Object.defineProperty(r, "KeywordCxt", { enumerable: !0, get: function() {
      return l.KeywordCxt;
    } });
    var i = W();
    Object.defineProperty(r, "_", { enumerable: !0, get: function() {
      return i._;
    } }), Object.defineProperty(r, "str", { enumerable: !0, get: function() {
      return i.str;
    } }), Object.defineProperty(r, "stringify", { enumerable: !0, get: function() {
      return i.stringify;
    } }), Object.defineProperty(r, "nil", { enumerable: !0, get: function() {
      return i.nil;
    } }), Object.defineProperty(r, "Name", { enumerable: !0, get: function() {
      return i.Name;
    } }), Object.defineProperty(r, "CodeGen", { enumerable: !0, get: function() {
      return i.CodeGen;
    } });
    var t = cn();
    Object.defineProperty(r, "ValidationError", { enumerable: !0, get: function() {
      return t.default;
    } });
    var s = At();
    Object.defineProperty(r, "MissingRefError", { enumerable: !0, get: function() {
      return s.default;
    } });
  })(Ft, Ft.exports)), Ft.exports;
}
var Wp = Jp(), Cr = { exports: {} }, Xn = {}, nc;
function Xp() {
  return nc || (nc = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
    function r(A, V) {
      return { validate: A, compare: V };
    }
    e.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: r(c, o),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: r(l(!0), i),
      "date-time": r(n(!0), f),
      "iso-time": r(l(), t),
      "iso-date-time": r(n(), h),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri: g,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      // uri-template: https://tools.ietf.org/html/rfc6570
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      // For the source: https://gist.github.com/dperini/729294
      // For test cases: https://mathiasbynens.be/demo/url-regex
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex: j,
      // uuid: http://tools.ietf.org/html/rfc4122
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      // JSON-pointer: https://tools.ietf.org/html/rfc6901
      // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
      // byte: https://github.com/miguelmota/is-base64
      byte: w,
      // signed 32 bit integer
      int32: { type: "number", validate: E },
      // signed 64 bit integer
      int64: { type: "number", validate: S },
      // C-type float
      float: { type: "number", validate: N },
      // C-type double
      double: { type: "number", validate: N },
      // hint to the UI to hide input strings
      password: !0,
      // unchecked string payload
      binary: !0
    }, e.fastFormats = {
      ...e.fullFormats,
      date: r(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, o),
      time: r(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, i),
      "date-time": r(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, f),
      "iso-time": r(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, t),
      "iso-date-time": r(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, h),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    }, e.formatNames = Object.keys(e.fullFormats);
    function a(A) {
      return A % 4 === 0 && (A % 100 !== 0 || A % 400 === 0);
    }
    const d = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, p = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function c(A) {
      const V = d.exec(A);
      if (!V)
        return !1;
      const z = +V[1], q = +V[2], D = +V[3];
      return q >= 1 && q <= 12 && D >= 1 && D <= (q === 2 && a(z) ? 29 : p[q]);
    }
    function o(A, V) {
      if (A && V)
        return A > V ? 1 : A < V ? -1 : 0;
    }
    const u = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function l(A) {
      return function(z) {
        const q = u.exec(z);
        if (!q)
          return !1;
        const D = +q[1], G = +q[2], F = +q[3], B = q[4], K = q[5] === "-" ? -1 : 1, L = +(q[6] || 0), O = +(q[7] || 0);
        if (L > 23 || O > 59 || A && !B)
          return !1;
        if (D <= 23 && G <= 59 && F < 60)
          return !0;
        const C = G - O * K, T = D - L * K - (C < 0 ? 1 : 0);
        return (T === 23 || T === -1) && (C === 59 || C === -1) && F < 61;
      };
    }
    function i(A, V) {
      if (!(A && V))
        return;
      const z = (/* @__PURE__ */ new Date("2020-01-01T" + A)).valueOf(), q = (/* @__PURE__ */ new Date("2020-01-01T" + V)).valueOf();
      if (z && q)
        return z - q;
    }
    function t(A, V) {
      if (!(A && V))
        return;
      const z = u.exec(A), q = u.exec(V);
      if (z && q)
        return A = z[1] + z[2] + z[3], V = q[1] + q[2] + q[3], A > V ? 1 : A < V ? -1 : 0;
    }
    const s = /t|\s/i;
    function n(A) {
      const V = l(A);
      return function(q) {
        const D = q.split(s);
        return D.length === 2 && c(D[0]) && V(D[1]);
      };
    }
    function f(A, V) {
      if (!(A && V))
        return;
      const z = new Date(A).valueOf(), q = new Date(V).valueOf();
      if (z && q)
        return z - q;
    }
    function h(A, V) {
      if (!(A && V))
        return;
      const [z, q] = A.split(s), [D, G] = V.split(s), F = o(z, D);
      if (F !== void 0)
        return F || i(q, G);
    }
    const y = /\/|:/, m = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function g(A) {
      return y.test(A) && m.test(A);
    }
    const v = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function w(A) {
      return v.lastIndex = 0, v.test(A);
    }
    const b = -2147483648, $ = 2 ** 31 - 1;
    function E(A) {
      return Number.isInteger(A) && A <= $ && A >= b;
    }
    function S(A) {
      return Number.isInteger(A);
    }
    function N() {
      return !0;
    }
    const P = /[^\\]\\Z/;
    function j(A) {
      if (P.test(A))
        return !1;
      try {
        return new RegExp(A), !0;
      } catch {
        return !1;
      }
    }
  })(Xn)), Xn;
}
var Qn = {}, Lr = { exports: {} }, jr = {}, sc;
function Qp() {
  if (sc) return jr;
  sc = 1, Object.defineProperty(jr, "__esModule", { value: !0 });
  const e = zu(), r = Gu(), a = Ju(), d = Qu(), p = Zu(), c = [
    e.default,
    r.default,
    (0, a.default)(),
    d.default,
    p.metadataVocabulary,
    p.contentVocabulary
  ];
  return jr.default = c, jr;
}
const Zp = "http://json-schema.org/draft-07/schema#", em = "http://json-schema.org/draft-07/schema#", tm = "Core schema meta-schema", rm = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, nm = ["object", "boolean"], sm = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, im = {
  $schema: Zp,
  $id: em,
  title: tm,
  definitions: rm,
  type: nm,
  properties: sm,
  default: !0
};
var ic;
function tf() {
  return ic || (ic = 1, (function(e, r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.MissingRefError = r.ValidationError = r.CodeGen = r.Name = r.nil = r.stringify = r.str = r._ = r.KeywordCxt = r.Ajv = void 0;
    const a = Ku(), d = Qp(), p = ef(), c = im, o = ["/properties"], u = "http://json-schema.org/draft-07/schema";
    class l extends a.default {
      _addVocabularies() {
        super._addVocabularies(), d.default.forEach((h) => this.addVocabulary(h)), this.opts.discriminator && this.addKeyword(p.default);
      }
      _addDefaultMetaSchema() {
        if (super._addDefaultMetaSchema(), !this.opts.meta)
          return;
        const h = this.opts.$data ? this.$dataMetaSchema(c, o) : c;
        this.addMetaSchema(h, u, !1), this.refs["http://json-schema.org/schema"] = u;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(u) ? u : void 0);
      }
    }
    r.Ajv = l, e.exports = r = l, e.exports.Ajv = l, Object.defineProperty(r, "__esModule", { value: !0 }), r.default = l;
    var i = It();
    Object.defineProperty(r, "KeywordCxt", { enumerable: !0, get: function() {
      return i.KeywordCxt;
    } });
    var t = W();
    Object.defineProperty(r, "_", { enumerable: !0, get: function() {
      return t._;
    } }), Object.defineProperty(r, "str", { enumerable: !0, get: function() {
      return t.str;
    } }), Object.defineProperty(r, "stringify", { enumerable: !0, get: function() {
      return t.stringify;
    } }), Object.defineProperty(r, "nil", { enumerable: !0, get: function() {
      return t.nil;
    } }), Object.defineProperty(r, "Name", { enumerable: !0, get: function() {
      return t.Name;
    } }), Object.defineProperty(r, "CodeGen", { enumerable: !0, get: function() {
      return t.CodeGen;
    } });
    var s = cn();
    Object.defineProperty(r, "ValidationError", { enumerable: !0, get: function() {
      return s.default;
    } });
    var n = At();
    Object.defineProperty(r, "MissingRefError", { enumerable: !0, get: function() {
      return n.default;
    } });
  })(Lr, Lr.exports)), Lr.exports;
}
var ac;
function am() {
  return ac || (ac = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
    const r = tf(), a = W(), d = a.operators, p = {
      formatMaximum: { okStr: "<=", ok: d.LTE, fail: d.GT },
      formatMinimum: { okStr: ">=", ok: d.GTE, fail: d.LT },
      formatExclusiveMaximum: { okStr: "<", ok: d.LT, fail: d.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: d.GT, fail: d.LTE }
    }, c = {
      message: ({ keyword: u, schemaCode: l }) => (0, a.str)`should be ${p[u].okStr} ${l}`,
      params: ({ keyword: u, schemaCode: l }) => (0, a._)`{comparison: ${p[u].okStr}, limit: ${l}}`
    };
    e.formatLimitDefinition = {
      keyword: Object.keys(p),
      type: "string",
      schemaType: "string",
      $data: !0,
      error: c,
      code(u) {
        const { gen: l, data: i, schemaCode: t, keyword: s, it: n } = u, { opts: f, self: h } = n;
        if (!f.validateFormats)
          return;
        const y = new r.KeywordCxt(n, h.RULES.all.format.definition, "format");
        y.$data ? m() : g();
        function m() {
          const w = l.scopeValue("formats", {
            ref: h.formats,
            code: f.code.formats
          }), b = l.const("fmt", (0, a._)`${w}[${y.schemaCode}]`);
          u.fail$data((0, a.or)((0, a._)`typeof ${b} != "object"`, (0, a._)`${b} instanceof RegExp`, (0, a._)`typeof ${b}.compare != "function"`, v(b)));
        }
        function g() {
          const w = y.schema, b = h.formats[w];
          if (!b || b === !0)
            return;
          if (typeof b != "object" || b instanceof RegExp || typeof b.compare != "function")
            throw new Error(`"${s}": format "${w}" does not define "compare" function`);
          const $ = l.scopeValue("formats", {
            key: w,
            ref: b,
            code: f.code.formats ? (0, a._)`${f.code.formats}${(0, a.getProperty)(w)}` : void 0
          });
          u.fail$data(v($));
        }
        function v(w) {
          return (0, a._)`${w}.compare(${i}, ${t}) ${p[s].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    const o = (u) => (u.addKeyword(e.formatLimitDefinition), u);
    e.default = o;
  })(Qn)), Qn;
}
var oc;
function om() {
  return oc || (oc = 1, (function(e, r) {
    Object.defineProperty(r, "__esModule", { value: !0 });
    const a = Xp(), d = am(), p = W(), c = new p.Name("fullFormats"), o = new p.Name("fastFormats"), u = (i, t = { keywords: !0 }) => {
      if (Array.isArray(t))
        return l(i, t, a.fullFormats, c), i;
      const [s, n] = t.mode === "fast" ? [a.fastFormats, o] : [a.fullFormats, c], f = t.formats || a.formatNames;
      return l(i, f, s, n), t.keywords && (0, d.default)(i), i;
    };
    u.get = (i, t = "full") => {
      const n = (t === "fast" ? a.fastFormats : a.fullFormats)[i];
      if (!n)
        throw new Error(`Unknown format "${i}"`);
      return n;
    };
    function l(i, t, s, n) {
      var f, h;
      (f = (h = i.opts.code).formats) !== null && f !== void 0 || (h.formats = (0, p._)`require("ajv-formats/dist/formats").${n}`);
      for (const y of t)
        i.addFormat(y, s[y]);
    }
    e.exports = r = u, Object.defineProperty(r, "__esModule", { value: !0 }), r.default = u;
  })(Cr, Cr.exports)), Cr.exports;
}
var cm = om();
const rf = /* @__PURE__ */ Tt(cm), lm = (e, r, a, d) => {
  if (a === "length" || a === "prototype" || a === "arguments" || a === "caller")
    return;
  const p = Object.getOwnPropertyDescriptor(e, a), c = Object.getOwnPropertyDescriptor(r, a);
  !um(p, c) && d || Object.defineProperty(e, a, c);
}, um = function(e, r) {
  return e === void 0 || e.configurable || e.writable === r.writable && e.enumerable === r.enumerable && e.configurable === r.configurable && (e.writable || e.value === r.value);
}, fm = (e, r) => {
  const a = Object.getPrototypeOf(r);
  a !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, a);
}, dm = (e, r) => `/* Wrapped ${e}*/
${r}`, hm = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), pm = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), mm = (e, r, a) => {
  const d = a === "" ? "" : `with ${a.trim()}() `, p = dm.bind(null, d, r.toString());
  Object.defineProperty(p, "name", pm);
  const { writable: c, enumerable: o, configurable: u } = hm;
  Object.defineProperty(e, "toString", { value: p, writable: c, enumerable: o, configurable: u });
};
function ym(e, r, { ignoreNonConfigurable: a = !1 } = {}) {
  const { name: d } = e;
  for (const p of Reflect.ownKeys(r))
    lm(e, r, p, a);
  return fm(e, r), mm(e, r, d), e;
}
const cc = (e, r = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: a = 0,
    maxWait: d = Number.POSITIVE_INFINITY,
    before: p = !1,
    after: c = !0
  } = r;
  if (a < 0 || d < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!p && !c)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let o, u, l;
  const i = function(...t) {
    const s = this, n = () => {
      o = void 0, u && (clearTimeout(u), u = void 0), c && (l = e.apply(s, t));
    }, f = () => {
      u = void 0, o && (clearTimeout(o), o = void 0), c && (l = e.apply(s, t));
    }, h = p && !o;
    return clearTimeout(o), o = setTimeout(n, a), d > 0 && d !== Number.POSITIVE_INFINITY && !u && (u = setTimeout(f, d)), h && (l = e.apply(s, t)), l;
  };
  return ym(i, e), i.cancel = () => {
    o && (clearTimeout(o), o = void 0), u && (clearTimeout(u), u = void 0);
  }, i;
};
var Mr = { exports: {} }, Zn, lc;
function un() {
  if (lc) return Zn;
  lc = 1;
  const e = "2.0.0", r = 256, a = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, d = 16, p = r - 6;
  return Zn = {
    MAX_LENGTH: r,
    MAX_SAFE_COMPONENT_LENGTH: d,
    MAX_SAFE_BUILD_LENGTH: p,
    MAX_SAFE_INTEGER: a,
    RELEASE_TYPES: [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ],
    SEMVER_SPEC_VERSION: e,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  }, Zn;
}
var es, uc;
function fn() {
  return uc || (uc = 1, es = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...r) => console.error("SEMVER", ...r) : () => {
  }), es;
}
var fc;
function kt() {
  return fc || (fc = 1, (function(e, r) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: a,
      MAX_SAFE_BUILD_LENGTH: d,
      MAX_LENGTH: p
    } = un(), c = fn();
    r = e.exports = {};
    const o = r.re = [], u = r.safeRe = [], l = r.src = [], i = r.safeSrc = [], t = r.t = {};
    let s = 0;
    const n = "[a-zA-Z0-9-]", f = [
      ["\\s", 1],
      ["\\d", p],
      [n, d]
    ], h = (m) => {
      for (const [g, v] of f)
        m = m.split(`${g}*`).join(`${g}{0,${v}}`).split(`${g}+`).join(`${g}{1,${v}}`);
      return m;
    }, y = (m, g, v) => {
      const w = h(g), b = s++;
      c(m, b, g), t[m] = b, l[b] = g, i[b] = w, o[b] = new RegExp(g, v ? "g" : void 0), u[b] = new RegExp(w, v ? "g" : void 0);
    };
    y("NUMERICIDENTIFIER", "0|[1-9]\\d*"), y("NUMERICIDENTIFIERLOOSE", "\\d+"), y("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${n}*`), y("MAINVERSION", `(${l[t.NUMERICIDENTIFIER]})\\.(${l[t.NUMERICIDENTIFIER]})\\.(${l[t.NUMERICIDENTIFIER]})`), y("MAINVERSIONLOOSE", `(${l[t.NUMERICIDENTIFIERLOOSE]})\\.(${l[t.NUMERICIDENTIFIERLOOSE]})\\.(${l[t.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASEIDENTIFIER", `(?:${l[t.NONNUMERICIDENTIFIER]}|${l[t.NUMERICIDENTIFIER]})`), y("PRERELEASEIDENTIFIERLOOSE", `(?:${l[t.NONNUMERICIDENTIFIER]}|${l[t.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASE", `(?:-(${l[t.PRERELEASEIDENTIFIER]}(?:\\.${l[t.PRERELEASEIDENTIFIER]})*))`), y("PRERELEASELOOSE", `(?:-?(${l[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${l[t.PRERELEASEIDENTIFIERLOOSE]})*))`), y("BUILDIDENTIFIER", `${n}+`), y("BUILD", `(?:\\+(${l[t.BUILDIDENTIFIER]}(?:\\.${l[t.BUILDIDENTIFIER]})*))`), y("FULLPLAIN", `v?${l[t.MAINVERSION]}${l[t.PRERELEASE]}?${l[t.BUILD]}?`), y("FULL", `^${l[t.FULLPLAIN]}$`), y("LOOSEPLAIN", `[v=\\s]*${l[t.MAINVERSIONLOOSE]}${l[t.PRERELEASELOOSE]}?${l[t.BUILD]}?`), y("LOOSE", `^${l[t.LOOSEPLAIN]}$`), y("GTLT", "((?:<|>)?=?)"), y("XRANGEIDENTIFIERLOOSE", `${l[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), y("XRANGEIDENTIFIER", `${l[t.NUMERICIDENTIFIER]}|x|X|\\*`), y("XRANGEPLAIN", `[v=\\s]*(${l[t.XRANGEIDENTIFIER]})(?:\\.(${l[t.XRANGEIDENTIFIER]})(?:\\.(${l[t.XRANGEIDENTIFIER]})(?:${l[t.PRERELEASE]})?${l[t.BUILD]}?)?)?`), y("XRANGEPLAINLOOSE", `[v=\\s]*(${l[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[t.XRANGEIDENTIFIERLOOSE]})(?:${l[t.PRERELEASELOOSE]})?${l[t.BUILD]}?)?)?`), y("XRANGE", `^${l[t.GTLT]}\\s*${l[t.XRANGEPLAIN]}$`), y("XRANGELOOSE", `^${l[t.GTLT]}\\s*${l[t.XRANGEPLAINLOOSE]}$`), y("COERCEPLAIN", `(^|[^\\d])(\\d{1,${a}})(?:\\.(\\d{1,${a}}))?(?:\\.(\\d{1,${a}}))?`), y("COERCE", `${l[t.COERCEPLAIN]}(?:$|[^\\d])`), y("COERCEFULL", l[t.COERCEPLAIN] + `(?:${l[t.PRERELEASE]})?(?:${l[t.BUILD]})?(?:$|[^\\d])`), y("COERCERTL", l[t.COERCE], !0), y("COERCERTLFULL", l[t.COERCEFULL], !0), y("LONETILDE", "(?:~>?)"), y("TILDETRIM", `(\\s*)${l[t.LONETILDE]}\\s+`, !0), r.tildeTrimReplace = "$1~", y("TILDE", `^${l[t.LONETILDE]}${l[t.XRANGEPLAIN]}$`), y("TILDELOOSE", `^${l[t.LONETILDE]}${l[t.XRANGEPLAINLOOSE]}$`), y("LONECARET", "(?:\\^)"), y("CARETTRIM", `(\\s*)${l[t.LONECARET]}\\s+`, !0), r.caretTrimReplace = "$1^", y("CARET", `^${l[t.LONECARET]}${l[t.XRANGEPLAIN]}$`), y("CARETLOOSE", `^${l[t.LONECARET]}${l[t.XRANGEPLAINLOOSE]}$`), y("COMPARATORLOOSE", `^${l[t.GTLT]}\\s*(${l[t.LOOSEPLAIN]})$|^$`), y("COMPARATOR", `^${l[t.GTLT]}\\s*(${l[t.FULLPLAIN]})$|^$`), y("COMPARATORTRIM", `(\\s*)${l[t.GTLT]}\\s*(${l[t.LOOSEPLAIN]}|${l[t.XRANGEPLAIN]})`, !0), r.comparatorTrimReplace = "$1$2$3", y("HYPHENRANGE", `^\\s*(${l[t.XRANGEPLAIN]})\\s+-\\s+(${l[t.XRANGEPLAIN]})\\s*$`), y("HYPHENRANGELOOSE", `^\\s*(${l[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${l[t.XRANGEPLAINLOOSE]})\\s*$`), y("STAR", "(<|>)?=?\\s*\\*"), y("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), y("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(Mr, Mr.exports)), Mr.exports;
}
var ts, dc;
function xi() {
  if (dc) return ts;
  dc = 1;
  const e = Object.freeze({ loose: !0 }), r = Object.freeze({});
  return ts = (d) => d ? typeof d != "object" ? e : d : r, ts;
}
var rs, hc;
function nf() {
  if (hc) return rs;
  hc = 1;
  const e = /^[0-9]+$/, r = (d, p) => {
    const c = e.test(d), o = e.test(p);
    return c && o && (d = +d, p = +p), d === p ? 0 : c && !o ? -1 : o && !c ? 1 : d < p ? -1 : 1;
  };
  return rs = {
    compareIdentifiers: r,
    rcompareIdentifiers: (d, p) => r(p, d)
  }, rs;
}
var ns, pc;
function we() {
  if (pc) return ns;
  pc = 1;
  const e = fn(), { MAX_LENGTH: r, MAX_SAFE_INTEGER: a } = un(), { safeRe: d, t: p } = kt(), c = xi(), { compareIdentifiers: o } = nf();
  class u {
    constructor(i, t) {
      if (t = c(t), i instanceof u) {
        if (i.loose === !!t.loose && i.includePrerelease === !!t.includePrerelease)
          return i;
        i = i.version;
      } else if (typeof i != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof i}".`);
      if (i.length > r)
        throw new TypeError(
          `version is longer than ${r} characters`
        );
      e("SemVer", i, t), this.options = t, this.loose = !!t.loose, this.includePrerelease = !!t.includePrerelease;
      const s = i.trim().match(t.loose ? d[p.LOOSE] : d[p.FULL]);
      if (!s)
        throw new TypeError(`Invalid Version: ${i}`);
      if (this.raw = i, this.major = +s[1], this.minor = +s[2], this.patch = +s[3], this.major > a || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > a || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > a || this.patch < 0)
        throw new TypeError("Invalid patch version");
      s[4] ? this.prerelease = s[4].split(".").map((n) => {
        if (/^[0-9]+$/.test(n)) {
          const f = +n;
          if (f >= 0 && f < a)
            return f;
        }
        return n;
      }) : this.prerelease = [], this.build = s[5] ? s[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(i) {
      if (e("SemVer.compare", this.version, this.options, i), !(i instanceof u)) {
        if (typeof i == "string" && i === this.version)
          return 0;
        i = new u(i, this.options);
      }
      return i.version === this.version ? 0 : this.compareMain(i) || this.comparePre(i);
    }
    compareMain(i) {
      return i instanceof u || (i = new u(i, this.options)), o(this.major, i.major) || o(this.minor, i.minor) || o(this.patch, i.patch);
    }
    comparePre(i) {
      if (i instanceof u || (i = new u(i, this.options)), this.prerelease.length && !i.prerelease.length)
        return -1;
      if (!this.prerelease.length && i.prerelease.length)
        return 1;
      if (!this.prerelease.length && !i.prerelease.length)
        return 0;
      let t = 0;
      do {
        const s = this.prerelease[t], n = i.prerelease[t];
        if (e("prerelease compare", t, s, n), s === void 0 && n === void 0)
          return 0;
        if (n === void 0)
          return 1;
        if (s === void 0)
          return -1;
        if (s === n)
          continue;
        return o(s, n);
      } while (++t);
    }
    compareBuild(i) {
      i instanceof u || (i = new u(i, this.options));
      let t = 0;
      do {
        const s = this.build[t], n = i.build[t];
        if (e("build compare", t, s, n), s === void 0 && n === void 0)
          return 0;
        if (n === void 0)
          return 1;
        if (s === void 0)
          return -1;
        if (s === n)
          continue;
        return o(s, n);
      } while (++t);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(i, t, s) {
      if (i.startsWith("pre")) {
        if (!t && s === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (t) {
          const n = `-${t}`.match(this.options.loose ? d[p.PRERELEASELOOSE] : d[p.PRERELEASE]);
          if (!n || n[1] !== t)
            throw new Error(`invalid identifier: ${t}`);
        }
      }
      switch (i) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", t, s);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", t, s);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", t, s), this.inc("pre", t, s);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", t, s), this.inc("pre", t, s);
          break;
        case "release":
          if (this.prerelease.length === 0)
            throw new Error(`version ${this.raw} is not a prerelease`);
          this.prerelease.length = 0;
          break;
        case "major":
          (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
          break;
        case "minor":
          (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
          break;
        case "patch":
          this.prerelease.length === 0 && this.patch++, this.prerelease = [];
          break;
        // This probably shouldn't be used publicly.
        // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
        case "pre": {
          const n = Number(s) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [n];
          else {
            let f = this.prerelease.length;
            for (; --f >= 0; )
              typeof this.prerelease[f] == "number" && (this.prerelease[f]++, f = -2);
            if (f === -1) {
              if (t === this.prerelease.join(".") && s === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(n);
            }
          }
          if (t) {
            let f = [t, n];
            s === !1 && (f = [t]), o(this.prerelease[0], t) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = f) : this.prerelease = f;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${i}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return ns = u, ns;
}
var ss, mc;
function dt() {
  if (mc) return ss;
  mc = 1;
  const e = we();
  return ss = (a, d, p = !1) => {
    if (a instanceof e)
      return a;
    try {
      return new e(a, d);
    } catch (c) {
      if (!p)
        return null;
      throw c;
    }
  }, ss;
}
var is, yc;
function gm() {
  if (yc) return is;
  yc = 1;
  const e = dt();
  return is = (a, d) => {
    const p = e(a, d);
    return p ? p.version : null;
  }, is;
}
var as, gc;
function vm() {
  if (gc) return as;
  gc = 1;
  const e = dt();
  return as = (a, d) => {
    const p = e(a.trim().replace(/^[=v]+/, ""), d);
    return p ? p.version : null;
  }, as;
}
var os, vc;
function $m() {
  if (vc) return os;
  vc = 1;
  const e = we();
  return os = (a, d, p, c, o) => {
    typeof p == "string" && (o = c, c = p, p = void 0);
    try {
      return new e(
        a instanceof e ? a.version : a,
        p
      ).inc(d, c, o).version;
    } catch {
      return null;
    }
  }, os;
}
var cs, $c;
function wm() {
  if ($c) return cs;
  $c = 1;
  const e = dt();
  return cs = (a, d) => {
    const p = e(a, null, !0), c = e(d, null, !0), o = p.compare(c);
    if (o === 0)
      return null;
    const u = o > 0, l = u ? p : c, i = u ? c : p, t = !!l.prerelease.length;
    if (!!i.prerelease.length && !t) {
      if (!i.patch && !i.minor)
        return "major";
      if (i.compareMain(l) === 0)
        return i.minor && !i.patch ? "minor" : "patch";
    }
    const n = t ? "pre" : "";
    return p.major !== c.major ? n + "major" : p.minor !== c.minor ? n + "minor" : p.patch !== c.patch ? n + "patch" : "prerelease";
  }, cs;
}
var ls, wc;
function bm() {
  if (wc) return ls;
  wc = 1;
  const e = we();
  return ls = (a, d) => new e(a, d).major, ls;
}
var us, bc;
function Em() {
  if (bc) return us;
  bc = 1;
  const e = we();
  return us = (a, d) => new e(a, d).minor, us;
}
var fs, Ec;
function Sm() {
  if (Ec) return fs;
  Ec = 1;
  const e = we();
  return fs = (a, d) => new e(a, d).patch, fs;
}
var ds, Sc;
function _m() {
  if (Sc) return ds;
  Sc = 1;
  const e = dt();
  return ds = (a, d) => {
    const p = e(a, d);
    return p && p.prerelease.length ? p.prerelease : null;
  }, ds;
}
var hs, _c;
function Ie() {
  if (_c) return hs;
  _c = 1;
  const e = we();
  return hs = (a, d, p) => new e(a, p).compare(new e(d, p)), hs;
}
var ps, Nc;
function Nm() {
  if (Nc) return ps;
  Nc = 1;
  const e = Ie();
  return ps = (a, d, p) => e(d, a, p), ps;
}
var ms, Rc;
function Rm() {
  if (Rc) return ms;
  Rc = 1;
  const e = Ie();
  return ms = (a, d) => e(a, d, !0), ms;
}
var ys, Oc;
function Yi() {
  if (Oc) return ys;
  Oc = 1;
  const e = we();
  return ys = (a, d, p) => {
    const c = new e(a, p), o = new e(d, p);
    return c.compare(o) || c.compareBuild(o);
  }, ys;
}
var gs, Pc;
function Om() {
  if (Pc) return gs;
  Pc = 1;
  const e = Yi();
  return gs = (a, d) => a.sort((p, c) => e(p, c, d)), gs;
}
var vs, Tc;
function Pm() {
  if (Tc) return vs;
  Tc = 1;
  const e = Yi();
  return vs = (a, d) => a.sort((p, c) => e(c, p, d)), vs;
}
var $s, Ic;
function dn() {
  if (Ic) return $s;
  Ic = 1;
  const e = Ie();
  return $s = (a, d, p) => e(a, d, p) > 0, $s;
}
var ws, Ac;
function Hi() {
  if (Ac) return ws;
  Ac = 1;
  const e = Ie();
  return ws = (a, d, p) => e(a, d, p) < 0, ws;
}
var bs, kc;
function sf() {
  if (kc) return bs;
  kc = 1;
  const e = Ie();
  return bs = (a, d, p) => e(a, d, p) === 0, bs;
}
var Es, qc;
function af() {
  if (qc) return Es;
  qc = 1;
  const e = Ie();
  return Es = (a, d, p) => e(a, d, p) !== 0, Es;
}
var Ss, Cc;
function Ji() {
  if (Cc) return Ss;
  Cc = 1;
  const e = Ie();
  return Ss = (a, d, p) => e(a, d, p) >= 0, Ss;
}
var _s, Lc;
function Wi() {
  if (Lc) return _s;
  Lc = 1;
  const e = Ie();
  return _s = (a, d, p) => e(a, d, p) <= 0, _s;
}
var Ns, jc;
function of() {
  if (jc) return Ns;
  jc = 1;
  const e = sf(), r = af(), a = dn(), d = Ji(), p = Hi(), c = Wi();
  return Ns = (u, l, i, t) => {
    switch (l) {
      case "===":
        return typeof u == "object" && (u = u.version), typeof i == "object" && (i = i.version), u === i;
      case "!==":
        return typeof u == "object" && (u = u.version), typeof i == "object" && (i = i.version), u !== i;
      case "":
      case "=":
      case "==":
        return e(u, i, t);
      case "!=":
        return r(u, i, t);
      case ">":
        return a(u, i, t);
      case ">=":
        return d(u, i, t);
      case "<":
        return p(u, i, t);
      case "<=":
        return c(u, i, t);
      default:
        throw new TypeError(`Invalid operator: ${l}`);
    }
  }, Ns;
}
var Rs, Mc;
function Tm() {
  if (Mc) return Rs;
  Mc = 1;
  const e = we(), r = dt(), { safeRe: a, t: d } = kt();
  return Rs = (c, o) => {
    if (c instanceof e)
      return c;
    if (typeof c == "number" && (c = String(c)), typeof c != "string")
      return null;
    o = o || {};
    let u = null;
    if (!o.rtl)
      u = c.match(o.includePrerelease ? a[d.COERCEFULL] : a[d.COERCE]);
    else {
      const f = o.includePrerelease ? a[d.COERCERTLFULL] : a[d.COERCERTL];
      let h;
      for (; (h = f.exec(c)) && (!u || u.index + u[0].length !== c.length); )
        (!u || h.index + h[0].length !== u.index + u[0].length) && (u = h), f.lastIndex = h.index + h[1].length + h[2].length;
      f.lastIndex = -1;
    }
    if (u === null)
      return null;
    const l = u[2], i = u[3] || "0", t = u[4] || "0", s = o.includePrerelease && u[5] ? `-${u[5]}` : "", n = o.includePrerelease && u[6] ? `+${u[6]}` : "";
    return r(`${l}.${i}.${t}${s}${n}`, o);
  }, Rs;
}
var Os, Dc;
function Im() {
  if (Dc) return Os;
  Dc = 1;
  class e {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(a) {
      const d = this.map.get(a);
      if (d !== void 0)
        return this.map.delete(a), this.map.set(a, d), d;
    }
    delete(a) {
      return this.map.delete(a);
    }
    set(a, d) {
      if (!this.delete(a) && d !== void 0) {
        if (this.map.size >= this.max) {
          const c = this.map.keys().next().value;
          this.delete(c);
        }
        this.map.set(a, d);
      }
      return this;
    }
  }
  return Os = e, Os;
}
var Ps, Fc;
function Ae() {
  if (Fc) return Ps;
  Fc = 1;
  const e = /\s+/g;
  class r {
    constructor(D, G) {
      if (G = p(G), D instanceof r)
        return D.loose === !!G.loose && D.includePrerelease === !!G.includePrerelease ? D : new r(D.raw, G);
      if (D instanceof c)
        return this.raw = D.value, this.set = [[D]], this.formatted = void 0, this;
      if (this.options = G, this.loose = !!G.loose, this.includePrerelease = !!G.includePrerelease, this.raw = D.trim().replace(e, " "), this.set = this.raw.split("||").map((F) => this.parseRange(F.trim())).filter((F) => F.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const F = this.set[0];
        if (this.set = this.set.filter((B) => !y(B[0])), this.set.length === 0)
          this.set = [F];
        else if (this.set.length > 1) {
          for (const B of this.set)
            if (B.length === 1 && m(B[0])) {
              this.set = [B];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let D = 0; D < this.set.length; D++) {
          D > 0 && (this.formatted += "||");
          const G = this.set[D];
          for (let F = 0; F < G.length; F++)
            F > 0 && (this.formatted += " "), this.formatted += G[F].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(D) {
      const F = ((this.options.includePrerelease && f) | (this.options.loose && h)) + ":" + D, B = d.get(F);
      if (B)
        return B;
      const K = this.options.loose, L = K ? l[i.HYPHENRANGELOOSE] : l[i.HYPHENRANGE];
      D = D.replace(L, V(this.options.includePrerelease)), o("hyphen replace", D), D = D.replace(l[i.COMPARATORTRIM], t), o("comparator trim", D), D = D.replace(l[i.TILDETRIM], s), o("tilde trim", D), D = D.replace(l[i.CARETTRIM], n), o("caret trim", D);
      let O = D.split(" ").map((R) => v(R, this.options)).join(" ").split(/\s+/).map((R) => A(R, this.options));
      K && (O = O.filter((R) => (o("loose invalid filter", R, this.options), !!R.match(l[i.COMPARATORLOOSE])))), o("range list", O);
      const C = /* @__PURE__ */ new Map(), T = O.map((R) => new c(R, this.options));
      for (const R of T) {
        if (y(R))
          return [R];
        C.set(R.value, R);
      }
      C.size > 1 && C.has("") && C.delete("");
      const _ = [...C.values()];
      return d.set(F, _), _;
    }
    intersects(D, G) {
      if (!(D instanceof r))
        throw new TypeError("a Range is required");
      return this.set.some((F) => g(F, G) && D.set.some((B) => g(B, G) && F.every((K) => B.every((L) => K.intersects(L, G)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(D) {
      if (!D)
        return !1;
      if (typeof D == "string")
        try {
          D = new u(D, this.options);
        } catch {
          return !1;
        }
      for (let G = 0; G < this.set.length; G++)
        if (z(this.set[G], D, this.options))
          return !0;
      return !1;
    }
  }
  Ps = r;
  const a = Im(), d = new a(), p = xi(), c = hn(), o = fn(), u = we(), {
    safeRe: l,
    t: i,
    comparatorTrimReplace: t,
    tildeTrimReplace: s,
    caretTrimReplace: n
  } = kt(), { FLAG_INCLUDE_PRERELEASE: f, FLAG_LOOSE: h } = un(), y = (q) => q.value === "<0.0.0-0", m = (q) => q.value === "", g = (q, D) => {
    let G = !0;
    const F = q.slice();
    let B = F.pop();
    for (; G && F.length; )
      G = F.every((K) => B.intersects(K, D)), B = F.pop();
    return G;
  }, v = (q, D) => (o("comp", q, D), q = E(q, D), o("caret", q), q = b(q, D), o("tildes", q), q = N(q, D), o("xrange", q), q = j(q, D), o("stars", q), q), w = (q) => !q || q.toLowerCase() === "x" || q === "*", b = (q, D) => q.trim().split(/\s+/).map((G) => $(G, D)).join(" "), $ = (q, D) => {
    const G = D.loose ? l[i.TILDELOOSE] : l[i.TILDE];
    return q.replace(G, (F, B, K, L, O) => {
      o("tilde", q, F, B, K, L, O);
      let C;
      return w(B) ? C = "" : w(K) ? C = `>=${B}.0.0 <${+B + 1}.0.0-0` : w(L) ? C = `>=${B}.${K}.0 <${B}.${+K + 1}.0-0` : O ? (o("replaceTilde pr", O), C = `>=${B}.${K}.${L}-${O} <${B}.${+K + 1}.0-0`) : C = `>=${B}.${K}.${L} <${B}.${+K + 1}.0-0`, o("tilde return", C), C;
    });
  }, E = (q, D) => q.trim().split(/\s+/).map((G) => S(G, D)).join(" "), S = (q, D) => {
    o("caret", q, D);
    const G = D.loose ? l[i.CARETLOOSE] : l[i.CARET], F = D.includePrerelease ? "-0" : "";
    return q.replace(G, (B, K, L, O, C) => {
      o("caret", q, B, K, L, O, C);
      let T;
      return w(K) ? T = "" : w(L) ? T = `>=${K}.0.0${F} <${+K + 1}.0.0-0` : w(O) ? K === "0" ? T = `>=${K}.${L}.0${F} <${K}.${+L + 1}.0-0` : T = `>=${K}.${L}.0${F} <${+K + 1}.0.0-0` : C ? (o("replaceCaret pr", C), K === "0" ? L === "0" ? T = `>=${K}.${L}.${O}-${C} <${K}.${L}.${+O + 1}-0` : T = `>=${K}.${L}.${O}-${C} <${K}.${+L + 1}.0-0` : T = `>=${K}.${L}.${O}-${C} <${+K + 1}.0.0-0`) : (o("no pr"), K === "0" ? L === "0" ? T = `>=${K}.${L}.${O}${F} <${K}.${L}.${+O + 1}-0` : T = `>=${K}.${L}.${O}${F} <${K}.${+L + 1}.0-0` : T = `>=${K}.${L}.${O} <${+K + 1}.0.0-0`), o("caret return", T), T;
    });
  }, N = (q, D) => (o("replaceXRanges", q, D), q.split(/\s+/).map((G) => P(G, D)).join(" ")), P = (q, D) => {
    q = q.trim();
    const G = D.loose ? l[i.XRANGELOOSE] : l[i.XRANGE];
    return q.replace(G, (F, B, K, L, O, C) => {
      o("xRange", q, F, B, K, L, O, C);
      const T = w(K), _ = T || w(L), R = _ || w(O), M = R;
      return B === "=" && M && (B = ""), C = D.includePrerelease ? "-0" : "", T ? B === ">" || B === "<" ? F = "<0.0.0-0" : F = "*" : B && M ? (_ && (L = 0), O = 0, B === ">" ? (B = ">=", _ ? (K = +K + 1, L = 0, O = 0) : (L = +L + 1, O = 0)) : B === "<=" && (B = "<", _ ? K = +K + 1 : L = +L + 1), B === "<" && (C = "-0"), F = `${B + K}.${L}.${O}${C}`) : _ ? F = `>=${K}.0.0${C} <${+K + 1}.0.0-0` : R && (F = `>=${K}.${L}.0${C} <${K}.${+L + 1}.0-0`), o("xRange return", F), F;
    });
  }, j = (q, D) => (o("replaceStars", q, D), q.trim().replace(l[i.STAR], "")), A = (q, D) => (o("replaceGTE0", q, D), q.trim().replace(l[D.includePrerelease ? i.GTE0PRE : i.GTE0], "")), V = (q) => (D, G, F, B, K, L, O, C, T, _, R, M) => (w(F) ? G = "" : w(B) ? G = `>=${F}.0.0${q ? "-0" : ""}` : w(K) ? G = `>=${F}.${B}.0${q ? "-0" : ""}` : L ? G = `>=${G}` : G = `>=${G}${q ? "-0" : ""}`, w(T) ? C = "" : w(_) ? C = `<${+T + 1}.0.0-0` : w(R) ? C = `<${T}.${+_ + 1}.0-0` : M ? C = `<=${T}.${_}.${R}-${M}` : q ? C = `<${T}.${_}.${+R + 1}-0` : C = `<=${C}`, `${G} ${C}`.trim()), z = (q, D, G) => {
    for (let F = 0; F < q.length; F++)
      if (!q[F].test(D))
        return !1;
    if (D.prerelease.length && !G.includePrerelease) {
      for (let F = 0; F < q.length; F++)
        if (o(q[F].semver), q[F].semver !== c.ANY && q[F].semver.prerelease.length > 0) {
          const B = q[F].semver;
          if (B.major === D.major && B.minor === D.minor && B.patch === D.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Ps;
}
var Ts, Vc;
function hn() {
  if (Vc) return Ts;
  Vc = 1;
  const e = Symbol("SemVer ANY");
  class r {
    static get ANY() {
      return e;
    }
    constructor(t, s) {
      if (s = a(s), t instanceof r) {
        if (t.loose === !!s.loose)
          return t;
        t = t.value;
      }
      t = t.trim().split(/\s+/).join(" "), o("comparator", t, s), this.options = s, this.loose = !!s.loose, this.parse(t), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, o("comp", this);
    }
    parse(t) {
      const s = this.options.loose ? d[p.COMPARATORLOOSE] : d[p.COMPARATOR], n = t.match(s);
      if (!n)
        throw new TypeError(`Invalid comparator: ${t}`);
      this.operator = n[1] !== void 0 ? n[1] : "", this.operator === "=" && (this.operator = ""), n[2] ? this.semver = new u(n[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(t) {
      if (o("Comparator.test", t, this.options.loose), this.semver === e || t === e)
        return !0;
      if (typeof t == "string")
        try {
          t = new u(t, this.options);
        } catch {
          return !1;
        }
      return c(t, this.operator, this.semver, this.options);
    }
    intersects(t, s) {
      if (!(t instanceof r))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new l(t.value, s).test(this.value) : t.operator === "" ? t.value === "" ? !0 : new l(this.value, s).test(t.semver) : (s = a(s), s.includePrerelease && (this.value === "<0.0.0-0" || t.value === "<0.0.0-0") || !s.includePrerelease && (this.value.startsWith("<0.0.0") || t.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && t.operator.startsWith(">") || this.operator.startsWith("<") && t.operator.startsWith("<") || this.semver.version === t.semver.version && this.operator.includes("=") && t.operator.includes("=") || c(this.semver, "<", t.semver, s) && this.operator.startsWith(">") && t.operator.startsWith("<") || c(this.semver, ">", t.semver, s) && this.operator.startsWith("<") && t.operator.startsWith(">")));
    }
  }
  Ts = r;
  const a = xi(), { safeRe: d, t: p } = kt(), c = of(), o = fn(), u = we(), l = Ae();
  return Ts;
}
var Is, Uc;
function pn() {
  if (Uc) return Is;
  Uc = 1;
  const e = Ae();
  return Is = (a, d, p) => {
    try {
      d = new e(d, p);
    } catch {
      return !1;
    }
    return d.test(a);
  }, Is;
}
var As, Bc;
function Am() {
  if (Bc) return As;
  Bc = 1;
  const e = Ae();
  return As = (a, d) => new e(a, d).set.map((p) => p.map((c) => c.value).join(" ").trim().split(" ")), As;
}
var ks, Kc;
function km() {
  if (Kc) return ks;
  Kc = 1;
  const e = we(), r = Ae();
  return ks = (d, p, c) => {
    let o = null, u = null, l = null;
    try {
      l = new r(p, c);
    } catch {
      return null;
    }
    return d.forEach((i) => {
      l.test(i) && (!o || u.compare(i) === -1) && (o = i, u = new e(o, c));
    }), o;
  }, ks;
}
var qs, zc;
function qm() {
  if (zc) return qs;
  zc = 1;
  const e = we(), r = Ae();
  return qs = (d, p, c) => {
    let o = null, u = null, l = null;
    try {
      l = new r(p, c);
    } catch {
      return null;
    }
    return d.forEach((i) => {
      l.test(i) && (!o || u.compare(i) === 1) && (o = i, u = new e(o, c));
    }), o;
  }, qs;
}
var Cs, Gc;
function Cm() {
  if (Gc) return Cs;
  Gc = 1;
  const e = we(), r = Ae(), a = dn();
  return Cs = (p, c) => {
    p = new r(p, c);
    let o = new e("0.0.0");
    if (p.test(o) || (o = new e("0.0.0-0"), p.test(o)))
      return o;
    o = null;
    for (let u = 0; u < p.set.length; ++u) {
      const l = p.set[u];
      let i = null;
      l.forEach((t) => {
        const s = new e(t.semver.version);
        switch (t.operator) {
          case ">":
            s.prerelease.length === 0 ? s.patch++ : s.prerelease.push(0), s.raw = s.format();
          /* fallthrough */
          case "":
          case ">=":
            (!i || a(s, i)) && (i = s);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${t.operator}`);
        }
      }), i && (!o || a(o, i)) && (o = i);
    }
    return o && p.test(o) ? o : null;
  }, Cs;
}
var Ls, xc;
function Lm() {
  if (xc) return Ls;
  xc = 1;
  const e = Ae();
  return Ls = (a, d) => {
    try {
      return new e(a, d).range || "*";
    } catch {
      return null;
    }
  }, Ls;
}
var js, Yc;
function Xi() {
  if (Yc) return js;
  Yc = 1;
  const e = we(), r = hn(), { ANY: a } = r, d = Ae(), p = pn(), c = dn(), o = Hi(), u = Wi(), l = Ji();
  return js = (t, s, n, f) => {
    t = new e(t, f), s = new d(s, f);
    let h, y, m, g, v;
    switch (n) {
      case ">":
        h = c, y = u, m = o, g = ">", v = ">=";
        break;
      case "<":
        h = o, y = l, m = c, g = "<", v = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (p(t, s, f))
      return !1;
    for (let w = 0; w < s.set.length; ++w) {
      const b = s.set[w];
      let $ = null, E = null;
      if (b.forEach((S) => {
        S.semver === a && (S = new r(">=0.0.0")), $ = $ || S, E = E || S, h(S.semver, $.semver, f) ? $ = S : m(S.semver, E.semver, f) && (E = S);
      }), $.operator === g || $.operator === v || (!E.operator || E.operator === g) && y(t, E.semver))
        return !1;
      if (E.operator === v && m(t, E.semver))
        return !1;
    }
    return !0;
  }, js;
}
var Ms, Hc;
function jm() {
  if (Hc) return Ms;
  Hc = 1;
  const e = Xi();
  return Ms = (a, d, p) => e(a, d, ">", p), Ms;
}
var Ds, Jc;
function Mm() {
  if (Jc) return Ds;
  Jc = 1;
  const e = Xi();
  return Ds = (a, d, p) => e(a, d, "<", p), Ds;
}
var Fs, Wc;
function Dm() {
  if (Wc) return Fs;
  Wc = 1;
  const e = Ae();
  return Fs = (a, d, p) => (a = new e(a, p), d = new e(d, p), a.intersects(d, p)), Fs;
}
var Vs, Xc;
function Fm() {
  if (Xc) return Vs;
  Xc = 1;
  const e = pn(), r = Ie();
  return Vs = (a, d, p) => {
    const c = [];
    let o = null, u = null;
    const l = a.sort((n, f) => r(n, f, p));
    for (const n of l)
      e(n, d, p) ? (u = n, o || (o = n)) : (u && c.push([o, u]), u = null, o = null);
    o && c.push([o, null]);
    const i = [];
    for (const [n, f] of c)
      n === f ? i.push(n) : !f && n === l[0] ? i.push("*") : f ? n === l[0] ? i.push(`<=${f}`) : i.push(`${n} - ${f}`) : i.push(`>=${n}`);
    const t = i.join(" || "), s = typeof d.raw == "string" ? d.raw : String(d);
    return t.length < s.length ? t : d;
  }, Vs;
}
var Us, Qc;
function Vm() {
  if (Qc) return Us;
  Qc = 1;
  const e = Ae(), r = hn(), { ANY: a } = r, d = pn(), p = Ie(), c = (s, n, f = {}) => {
    if (s === n)
      return !0;
    s = new e(s, f), n = new e(n, f);
    let h = !1;
    e: for (const y of s.set) {
      for (const m of n.set) {
        const g = l(y, m, f);
        if (h = h || g !== null, g)
          continue e;
      }
      if (h)
        return !1;
    }
    return !0;
  }, o = [new r(">=0.0.0-0")], u = [new r(">=0.0.0")], l = (s, n, f) => {
    if (s === n)
      return !0;
    if (s.length === 1 && s[0].semver === a) {
      if (n.length === 1 && n[0].semver === a)
        return !0;
      f.includePrerelease ? s = o : s = u;
    }
    if (n.length === 1 && n[0].semver === a) {
      if (f.includePrerelease)
        return !0;
      n = u;
    }
    const h = /* @__PURE__ */ new Set();
    let y, m;
    for (const N of s)
      N.operator === ">" || N.operator === ">=" ? y = i(y, N, f) : N.operator === "<" || N.operator === "<=" ? m = t(m, N, f) : h.add(N.semver);
    if (h.size > 1)
      return null;
    let g;
    if (y && m) {
      if (g = p(y.semver, m.semver, f), g > 0)
        return null;
      if (g === 0 && (y.operator !== ">=" || m.operator !== "<="))
        return null;
    }
    for (const N of h) {
      if (y && !d(N, String(y), f) || m && !d(N, String(m), f))
        return null;
      for (const P of n)
        if (!d(N, String(P), f))
          return !1;
      return !0;
    }
    let v, w, b, $, E = m && !f.includePrerelease && m.semver.prerelease.length ? m.semver : !1, S = y && !f.includePrerelease && y.semver.prerelease.length ? y.semver : !1;
    E && E.prerelease.length === 1 && m.operator === "<" && E.prerelease[0] === 0 && (E = !1);
    for (const N of n) {
      if ($ = $ || N.operator === ">" || N.operator === ">=", b = b || N.operator === "<" || N.operator === "<=", y) {
        if (S && N.semver.prerelease && N.semver.prerelease.length && N.semver.major === S.major && N.semver.minor === S.minor && N.semver.patch === S.patch && (S = !1), N.operator === ">" || N.operator === ">=") {
          if (v = i(y, N, f), v === N && v !== y)
            return !1;
        } else if (y.operator === ">=" && !d(y.semver, String(N), f))
          return !1;
      }
      if (m) {
        if (E && N.semver.prerelease && N.semver.prerelease.length && N.semver.major === E.major && N.semver.minor === E.minor && N.semver.patch === E.patch && (E = !1), N.operator === "<" || N.operator === "<=") {
          if (w = t(m, N, f), w === N && w !== m)
            return !1;
        } else if (m.operator === "<=" && !d(m.semver, String(N), f))
          return !1;
      }
      if (!N.operator && (m || y) && g !== 0)
        return !1;
    }
    return !(y && b && !m && g !== 0 || m && $ && !y && g !== 0 || S || E);
  }, i = (s, n, f) => {
    if (!s)
      return n;
    const h = p(s.semver, n.semver, f);
    return h > 0 ? s : h < 0 || n.operator === ">" && s.operator === ">=" ? n : s;
  }, t = (s, n, f) => {
    if (!s)
      return n;
    const h = p(s.semver, n.semver, f);
    return h < 0 ? s : h > 0 || n.operator === "<" && s.operator === "<=" ? n : s;
  };
  return Us = c, Us;
}
var Bs, Zc;
function Um() {
  if (Zc) return Bs;
  Zc = 1;
  const e = kt(), r = un(), a = we(), d = nf(), p = dt(), c = gm(), o = vm(), u = $m(), l = wm(), i = bm(), t = Em(), s = Sm(), n = _m(), f = Ie(), h = Nm(), y = Rm(), m = Yi(), g = Om(), v = Pm(), w = dn(), b = Hi(), $ = sf(), E = af(), S = Ji(), N = Wi(), P = of(), j = Tm(), A = hn(), V = Ae(), z = pn(), q = Am(), D = km(), G = qm(), F = Cm(), B = Lm(), K = Xi(), L = jm(), O = Mm(), C = Dm(), T = Fm(), _ = Vm();
  return Bs = {
    parse: p,
    valid: c,
    clean: o,
    inc: u,
    diff: l,
    major: i,
    minor: t,
    patch: s,
    prerelease: n,
    compare: f,
    rcompare: h,
    compareLoose: y,
    compareBuild: m,
    sort: g,
    rsort: v,
    gt: w,
    lt: b,
    eq: $,
    neq: E,
    gte: S,
    lte: N,
    cmp: P,
    coerce: j,
    Comparator: A,
    Range: V,
    satisfies: z,
    toComparators: q,
    maxSatisfying: D,
    minSatisfying: G,
    minVersion: F,
    validRange: B,
    outside: K,
    gtr: L,
    ltr: O,
    intersects: C,
    simplifyRange: T,
    subset: _,
    SemVer: a,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: r.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: r.RELEASE_TYPES,
    compareIdentifiers: d.compareIdentifiers,
    rcompareIdentifiers: d.rcompareIdentifiers
  }, Bs;
}
var Bm = Um();
const st = /* @__PURE__ */ Tt(Bm), Km = Object.prototype.toString, zm = "[object Uint8Array]", Gm = "[object ArrayBuffer]";
function cf(e, r, a) {
  return e ? e.constructor === r ? !0 : Km.call(e) === a : !1;
}
function lf(e) {
  return cf(e, Uint8Array, zm);
}
function xm(e) {
  return cf(e, ArrayBuffer, Gm);
}
function Ym(e) {
  return lf(e) || xm(e);
}
function Hm(e) {
  if (!lf(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function Jm(e) {
  if (!Ym(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function el(e, r) {
  if (e.length === 0)
    return new Uint8Array(0);
  r ??= e.reduce((p, c) => p + c.length, 0);
  const a = new Uint8Array(r);
  let d = 0;
  for (const p of e)
    Hm(p), a.set(p, d), d += p.length;
  return a;
}
const tl = {
  utf8: new globalThis.TextDecoder("utf8")
};
function rl(e, r = "utf8") {
  return Jm(e), tl[r] ??= new globalThis.TextDecoder(r), tl[r].decode(e);
}
function Wm(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const Xm = new globalThis.TextEncoder();
function Ks(e) {
  return Wm(e), Xm.encode(e);
}
Array.from({ length: 256 }, (e, r) => r.toString(16).padStart(2, "0"));
const Qm = rf.default, nl = "aes-256-cbc", it = () => /* @__PURE__ */ Object.create(null), Zm = (e) => e != null, ey = (e, r) => {
  const a = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), d = typeof r;
  if (a.has(d))
    throw new TypeError(`Setting a value of type \`${d}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, Jr = "__internal__", zs = `${Jr}.migrations.version`;
class ty {
  path;
  events;
  #n;
  #t;
  #e;
  #r = {};
  constructor(r = {}) {
    const a = {
      configName: "config",
      fileExtension: "json",
      projectSuffix: "nodejs",
      clearInvalidConfig: !1,
      accessPropertiesByDotNotation: !0,
      configFileMode: 438,
      ...r
    };
    if (!a.cwd) {
      if (!a.projectName)
        throw new Error("Please specify the `projectName` option.");
      a.cwd = vd(a.projectName, { suffix: a.projectSuffix }).config;
    }
    if (this.#e = a, a.schema ?? a.ajvOptions ?? a.rootSchema) {
      if (a.schema && typeof a.schema != "object")
        throw new TypeError("The `schema` option must be an object.");
      const o = new Wp.Ajv2020({
        allErrors: !0,
        useDefaults: !0,
        ...a.ajvOptions
      });
      Qm(o);
      const u = {
        ...a.rootSchema,
        type: "object",
        properties: a.schema
      };
      this.#n = o.compile(u);
      for (const [l, i] of Object.entries(a.schema ?? {}))
        i?.default && (this.#r[l] = i.default);
    }
    a.defaults && (this.#r = {
      ...this.#r,
      ...a.defaults
    }), a.serialize && (this._serialize = a.serialize), a.deserialize && (this._deserialize = a.deserialize), this.events = new EventTarget(), this.#t = a.encryptionKey;
    const d = a.fileExtension ? `.${a.fileExtension}` : "";
    this.path = ae.resolve(a.cwd, `${a.configName ?? "config"}${d}`);
    const p = this.store, c = Object.assign(it(), a.defaults, p);
    if (a.migrations) {
      if (!a.projectVersion)
        throw new Error("Please specify the `projectVersion` option.");
      this._migrate(a.migrations, a.projectVersion, a.beforeEachMigration);
    }
    this._validate(c);
    try {
      Yf.deepEqual(p, c);
    } catch {
      this.store = c;
    }
    a.watch && this._watch();
  }
  get(r, a) {
    if (this.#e.accessPropertiesByDotNotation)
      return this._get(r, a);
    const { store: d } = this;
    return r in d ? d[r] : a;
  }
  set(r, a) {
    if (typeof r != "string" && typeof r != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof r}`);
    if (typeof r != "object" && a === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(r))
      throw new TypeError(`Please don't use the ${Jr} key, as it's used to manage this module internal operations.`);
    const { store: d } = this, p = (c, o) => {
      ey(c, o), this.#e.accessPropertiesByDotNotation ? Ra(d, c, o) : d[c] = o;
    };
    if (typeof r == "object") {
      const c = r;
      for (const [o, u] of Object.entries(c))
        p(o, u);
    } else
      p(r, a);
    this.store = d;
  }
  has(r) {
    return this.#e.accessPropertiesByDotNotation ? pd(this.store, r) : r in this.store;
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...r) {
    for (const a of r)
      Zm(this.#r[a]) && this.set(a, this.#r[a]);
  }
  delete(r) {
    const { store: a } = this;
    this.#e.accessPropertiesByDotNotation ? hd(a, r) : delete a[r], this.store = a;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    this.store = it();
    for (const r of Object.keys(this.#r))
      this.reset(r);
  }
  onDidChange(r, a) {
    if (typeof r != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof r}`);
    if (typeof a != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof a}`);
    return this._handleChange(() => this.get(r), a);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(r) {
    if (typeof r != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof r}`);
    return this._handleChange(() => this.store, r);
  }
  get size() {
    return Object.keys(this.store).length;
  }
  /**
      Get all the config as an object or replace the current config with an object.
  
      @example
      ```
      console.log(config.store);
      //=> {name: 'John', age: 30}
      ```
  
      @example
      ```
      config.store = {
          hello: 'world'
      };
      ```
      */
  get store() {
    try {
      const r = X.readFileSync(this.path, this.#t ? null : "utf8"), a = this._encryptData(r), d = this._deserialize(a);
      return this._validate(d), Object.assign(it(), d);
    } catch (r) {
      if (r?.code === "ENOENT")
        return this._ensureDirectory(), it();
      if (this.#e.clearInvalidConfig && r.name === "SyntaxError")
        return it();
      throw r;
    }
  }
  set store(r) {
    this._ensureDirectory(), this._validate(r), this._write(r), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [r, a] of Object.entries(this.store))
      yield [r, a];
  }
  _encryptData(r) {
    if (!this.#t)
      return typeof r == "string" ? r : rl(r);
    try {
      const a = r.slice(0, 16), d = pt.pbkdf2Sync(this.#t, a.toString(), 1e4, 32, "sha512"), p = pt.createDecipheriv(nl, d, a), c = r.slice(17), o = typeof c == "string" ? Ks(c) : c;
      return rl(el([p.update(o), p.final()]));
    } catch {
    }
    return r.toString();
  }
  _handleChange(r, a) {
    let d = r();
    const p = () => {
      const c = d, o = r();
      xf(o, c) || (d = o, a.call(this, o, c));
    };
    return this.events.addEventListener("change", p), () => {
      this.events.removeEventListener("change", p);
    };
  }
  _deserialize = (r) => JSON.parse(r);
  _serialize = (r) => JSON.stringify(r, void 0, "	");
  _validate(r) {
    if (!this.#n || this.#n(r) || !this.#n.errors)
      return;
    const d = this.#n.errors.map(({ instancePath: p, message: c = "" }) => `\`${p.slice(1)}\` ${c}`);
    throw new Error("Config schema violation: " + d.join("; "));
  }
  _ensureDirectory() {
    X.mkdirSync(ae.dirname(this.path), { recursive: !0 });
  }
  _write(r) {
    let a = this._serialize(r);
    if (this.#t) {
      const d = pt.randomBytes(16), p = pt.pbkdf2Sync(this.#t, d.toString(), 1e4, 32, "sha512"), c = pt.createCipheriv(nl, p, d);
      a = el([d, Ks(":"), c.update(Ks(a)), c.final()]);
    }
    if (ce.env.SNAP)
      X.writeFileSync(this.path, a, { mode: this.#e.configFileMode });
    else
      try {
        Du(this.path, a, { mode: this.#e.configFileMode });
      } catch (d) {
        if (d?.code === "EXDEV") {
          X.writeFileSync(this.path, a, { mode: this.#e.configFileMode });
          return;
        }
        throw d;
      }
  }
  _watch() {
    this._ensureDirectory(), X.existsSync(this.path) || this._write(it()), ce.platform === "win32" ? X.watch(this.path, { persistent: !1 }, cc(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 100 })) : X.watchFile(this.path, { persistent: !1 }, cc(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 5e3 }));
  }
  _migrate(r, a, d) {
    let p = this._get(zs, "0.0.0");
    const c = Object.keys(r).filter((u) => this._shouldPerformMigration(u, p, a));
    let o = { ...this.store };
    for (const u of c)
      try {
        d && d(this, {
          fromVersion: p,
          toVersion: u,
          finalVersion: a,
          versions: c
        });
        const l = r[u];
        l?.(this), this._set(zs, u), p = u, o = { ...this.store };
      } catch (l) {
        throw this.store = o, new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${l}`);
      }
    (this._isVersionInRangeFormat(p) || !st.eq(p, a)) && this._set(zs, a);
  }
  _containsReservedKey(r) {
    return typeof r == "object" && Object.keys(r)[0] === Jr ? !0 : typeof r != "string" ? !1 : this.#e.accessPropertiesByDotNotation ? !!r.startsWith(`${Jr}.`) : !1;
  }
  _isVersionInRangeFormat(r) {
    return st.clean(r) === null;
  }
  _shouldPerformMigration(r, a, d) {
    return this._isVersionInRangeFormat(r) ? a !== "0.0.0" && st.satisfies(a, r) ? !1 : st.satisfies(d, r) : !(st.lte(r, a) || st.gt(r, d));
  }
  _get(r, a) {
    return dd(this.store, r, a);
  }
  _set(r, a) {
    const { store: d } = this;
    Ra(d, r, a), this.store = d;
  }
}
const { app: Wr, ipcMain: Li, shell: ry } = Tu;
let sl = !1;
const il = () => {
  if (!Li || !Wr)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: Wr.getPath("userData"),
    appVersion: Wr.getVersion()
  };
  return sl || (Li.on("electron-store-get-data", (r) => {
    r.returnValue = e;
  }), sl = !0), e;
};
class ny extends ty {
  constructor(r) {
    let a, d;
    if (ce.type === "renderer") {
      const p = Tu.ipcRenderer.sendSync("electron-store-get-data");
      if (!p)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: a, appVersion: d } = p);
    } else Li && Wr && ({ defaultCwd: a, appVersion: d } = il());
    r = {
      name: "config",
      ...r
    }, r.projectVersion ||= d, r.cwd ? r.cwd = ae.isAbsolute(r.cwd) ? r.cwd : ae.join(a, r.cwd) : r.cwd = a, r.configName = r.name, delete r.name, super(r);
  }
  static initRenderer() {
    il();
  }
  async openInEditor() {
    const r = await ry.openPath(this.path);
    if (r)
      throw new Error(r);
  }
}
const { app: sy } = tn, iy = {
  theme: {
    type: "string",
    enum: ["light", "dark", "system"],
    default: "system"
  },
  telemetry: {
    type: "boolean",
    default: !0
  }
};
class ay extends ny {
  constructor() {
    super({
      name: "settings",
      cwd: uf(),
      schema: iy,
      fileExtension: "json"
    });
  }
}
class en {
  db;
  static mapRow = (r) => ({
    ...r,
    definition: JSON.parse(r.definition)
  });
  constructor() {
    const r = $e(uf(), "rules.db");
    this.db = new ud(r), this.initialize();
  }
  initialize() {
    this.db.prepare(`
        CREATE TABLE IF NOT EXISTS rules (
          id TEXT PRIMARY KEY,
          definition TEXT NOT NULL,
          enabled INTEGER NOT NULL DEFAULT 1,
          updated_at TEXT NOT NULL
        );
      `).run();
  }
  upsertRule(r, a, d = !0) {
    this.db.prepare(`
      INSERT INTO rules (id, definition, enabled, updated_at)
      VALUES (@id, @definition, @enabled, @updated_at)
      ON CONFLICT(id) DO UPDATE SET
        definition = excluded.definition,
        enabled = excluded.enabled,
        updated_at = excluded.updated_at;
    `).run({
      id: r,
      definition: JSON.stringify(a),
      enabled: d ? 1 : 0,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  deleteRule(r) {
    this.db.prepare("DELETE FROM rules WHERE id = ?").run(r);
  }
  getRule(r) {
    const a = this.db.prepare("SELECT * FROM rules WHERE id = ?").get(r);
    if (a)
      return en.mapRow(a);
  }
  listRules() {
    return this.db.prepare("SELECT * FROM rules ORDER BY updated_at DESC").all().map(en.mapRow);
  }
}
class oy {
  settings = new ay();
  rules = new en();
}
const uf = () => {
  const e = $e(sy.getPath("userData"), "data");
  return xe(e) || Xr(e, { recursive: !0 }), e;
};
var cy = tf();
const ly = /* @__PURE__ */ Tt(cy);
var se = {}, Gs = {}, xs = {}, ue = {}, al;
function re() {
  if (al) return ue;
  al = 1;
  const e = Symbol.for("yaml.alias"), r = Symbol.for("yaml.document"), a = Symbol.for("yaml.map"), d = Symbol.for("yaml.pair"), p = Symbol.for("yaml.scalar"), c = Symbol.for("yaml.seq"), o = Symbol.for("yaml.node.type"), u = (m) => !!m && typeof m == "object" && m[o] === e, l = (m) => !!m && typeof m == "object" && m[o] === r, i = (m) => !!m && typeof m == "object" && m[o] === a, t = (m) => !!m && typeof m == "object" && m[o] === d, s = (m) => !!m && typeof m == "object" && m[o] === p, n = (m) => !!m && typeof m == "object" && m[o] === c;
  function f(m) {
    if (m && typeof m == "object")
      switch (m[o]) {
        case a:
        case c:
          return !0;
      }
    return !1;
  }
  function h(m) {
    if (m && typeof m == "object")
      switch (m[o]) {
        case e:
        case a:
        case p:
        case c:
          return !0;
      }
    return !1;
  }
  const y = (m) => (s(m) || f(m)) && !!m.anchor;
  return ue.ALIAS = e, ue.DOC = r, ue.MAP = a, ue.NODE_TYPE = o, ue.PAIR = d, ue.SCALAR = p, ue.SEQ = c, ue.hasAnchor = y, ue.isAlias = u, ue.isCollection = f, ue.isDocument = l, ue.isMap = i, ue.isNode = h, ue.isPair = t, ue.isScalar = s, ue.isSeq = n, ue;
}
var Dr = {}, ol;
function mn() {
  if (ol) return Dr;
  ol = 1;
  var e = re();
  const r = Symbol("break visit"), a = Symbol("skip children"), d = Symbol("remove node");
  function p(s, n) {
    const f = l(n);
    e.isDocument(s) ? c(null, s.contents, f, Object.freeze([s])) === d && (s.contents = null) : c(null, s, f, Object.freeze([]));
  }
  p.BREAK = r, p.SKIP = a, p.REMOVE = d;
  function c(s, n, f, h) {
    const y = i(s, n, f, h);
    if (e.isNode(y) || e.isPair(y))
      return t(s, h, y), c(s, y, f, h);
    if (typeof y != "symbol") {
      if (e.isCollection(n)) {
        h = Object.freeze(h.concat(n));
        for (let m = 0; m < n.items.length; ++m) {
          const g = c(m, n.items[m], f, h);
          if (typeof g == "number")
            m = g - 1;
          else {
            if (g === r)
              return r;
            g === d && (n.items.splice(m, 1), m -= 1);
          }
        }
      } else if (e.isPair(n)) {
        h = Object.freeze(h.concat(n));
        const m = c("key", n.key, f, h);
        if (m === r)
          return r;
        m === d && (n.key = null);
        const g = c("value", n.value, f, h);
        if (g === r)
          return r;
        g === d && (n.value = null);
      }
    }
    return y;
  }
  async function o(s, n) {
    const f = l(n);
    e.isDocument(s) ? await u(null, s.contents, f, Object.freeze([s])) === d && (s.contents = null) : await u(null, s, f, Object.freeze([]));
  }
  o.BREAK = r, o.SKIP = a, o.REMOVE = d;
  async function u(s, n, f, h) {
    const y = await i(s, n, f, h);
    if (e.isNode(y) || e.isPair(y))
      return t(s, h, y), u(s, y, f, h);
    if (typeof y != "symbol") {
      if (e.isCollection(n)) {
        h = Object.freeze(h.concat(n));
        for (let m = 0; m < n.items.length; ++m) {
          const g = await u(m, n.items[m], f, h);
          if (typeof g == "number")
            m = g - 1;
          else {
            if (g === r)
              return r;
            g === d && (n.items.splice(m, 1), m -= 1);
          }
        }
      } else if (e.isPair(n)) {
        h = Object.freeze(h.concat(n));
        const m = await u("key", n.key, f, h);
        if (m === r)
          return r;
        m === d && (n.key = null);
        const g = await u("value", n.value, f, h);
        if (g === r)
          return r;
        g === d && (n.value = null);
      }
    }
    return y;
  }
  function l(s) {
    return typeof s == "object" && (s.Collection || s.Node || s.Value) ? Object.assign({
      Alias: s.Node,
      Map: s.Node,
      Scalar: s.Node,
      Seq: s.Node
    }, s.Value && {
      Map: s.Value,
      Scalar: s.Value,
      Seq: s.Value
    }, s.Collection && {
      Map: s.Collection,
      Seq: s.Collection
    }, s) : s;
  }
  function i(s, n, f, h) {
    if (typeof f == "function")
      return f(s, n, h);
    if (e.isMap(n))
      return f.Map?.(s, n, h);
    if (e.isSeq(n))
      return f.Seq?.(s, n, h);
    if (e.isPair(n))
      return f.Pair?.(s, n, h);
    if (e.isScalar(n))
      return f.Scalar?.(s, n, h);
    if (e.isAlias(n))
      return f.Alias?.(s, n, h);
  }
  function t(s, n, f) {
    const h = n[n.length - 1];
    if (e.isCollection(h))
      h.items[s] = f;
    else if (e.isPair(h))
      s === "key" ? h.key = f : h.value = f;
    else if (e.isDocument(h))
      h.contents = f;
    else {
      const y = e.isAlias(h) ? "alias" : "scalar";
      throw new Error(`Cannot replace node with ${y} parent`);
    }
  }
  return Dr.visit = p, Dr.visitAsync = o, Dr;
}
var cl;
function ff() {
  if (cl) return xs;
  cl = 1;
  var e = re(), r = mn();
  const a = {
    "!": "%21",
    ",": "%2C",
    "[": "%5B",
    "]": "%5D",
    "{": "%7B",
    "}": "%7D"
  }, d = (c) => c.replace(/[!,[\]{}]/g, (o) => a[o]);
  class p {
    constructor(o, u) {
      this.docStart = null, this.docEnd = !1, this.yaml = Object.assign({}, p.defaultYaml, o), this.tags = Object.assign({}, p.defaultTags, u);
    }
    clone() {
      const o = new p(this.yaml, this.tags);
      return o.docStart = this.docStart, o;
    }
    /**
     * During parsing, get a Directives instance for the current document and
     * update the stream state according to the current version's spec.
     */
    atDocument() {
      const o = new p(this.yaml, this.tags);
      switch (this.yaml.version) {
        case "1.1":
          this.atNextDocument = !0;
          break;
        case "1.2":
          this.atNextDocument = !1, this.yaml = {
            explicit: p.defaultYaml.explicit,
            version: "1.2"
          }, this.tags = Object.assign({}, p.defaultTags);
          break;
      }
      return o;
    }
    /**
     * @param onError - May be called even if the action was successful
     * @returns `true` on success
     */
    add(o, u) {
      this.atNextDocument && (this.yaml = { explicit: p.defaultYaml.explicit, version: "1.1" }, this.tags = Object.assign({}, p.defaultTags), this.atNextDocument = !1);
      const l = o.trim().split(/[ \t]+/), i = l.shift();
      switch (i) {
        case "%TAG": {
          if (l.length !== 2 && (u(0, "%TAG directive should contain exactly two parts"), l.length < 2))
            return !1;
          const [t, s] = l;
          return this.tags[t] = s, !0;
        }
        case "%YAML": {
          if (this.yaml.explicit = !0, l.length !== 1)
            return u(0, "%YAML directive should contain exactly one part"), !1;
          const [t] = l;
          if (t === "1.1" || t === "1.2")
            return this.yaml.version = t, !0;
          {
            const s = /^\d+\.\d+$/.test(t);
            return u(6, `Unsupported YAML version ${t}`, s), !1;
          }
        }
        default:
          return u(0, `Unknown directive ${i}`, !0), !1;
      }
    }
    /**
     * Resolves a tag, matching handles to those defined in %TAG directives.
     *
     * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
     *   `'!local'` tag, or `null` if unresolvable.
     */
    tagName(o, u) {
      if (o === "!")
        return "!";
      if (o[0] !== "!")
        return u(`Not a valid tag: ${o}`), null;
      if (o[1] === "<") {
        const s = o.slice(2, -1);
        return s === "!" || s === "!!" ? (u(`Verbatim tags aren't resolved, so ${o} is invalid.`), null) : (o[o.length - 1] !== ">" && u("Verbatim tags must end with a >"), s);
      }
      const [, l, i] = o.match(/^(.*!)([^!]*)$/s);
      i || u(`The ${o} tag has no suffix`);
      const t = this.tags[l];
      if (t)
        try {
          return t + decodeURIComponent(i);
        } catch (s) {
          return u(String(s)), null;
        }
      return l === "!" ? o : (u(`Could not resolve tag: ${o}`), null);
    }
    /**
     * Given a fully resolved tag, returns its printable string form,
     * taking into account current tag prefixes and defaults.
     */
    tagString(o) {
      for (const [u, l] of Object.entries(this.tags))
        if (o.startsWith(l))
          return u + d(o.substring(l.length));
      return o[0] === "!" ? o : `!<${o}>`;
    }
    toString(o) {
      const u = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [], l = Object.entries(this.tags);
      let i;
      if (o && l.length > 0 && e.isNode(o.contents)) {
        const t = {};
        r.visit(o.contents, (s, n) => {
          e.isNode(n) && n.tag && (t[n.tag] = !0);
        }), i = Object.keys(t);
      } else
        i = [];
      for (const [t, s] of l)
        t === "!!" && s === "tag:yaml.org,2002:" || (!o || i.some((n) => n.startsWith(s))) && u.push(`%TAG ${t} ${s}`);
      return u.join(`
`);
    }
  }
  return p.defaultYaml = { explicit: !1, version: "1.2" }, p.defaultTags = { "!!": "tag:yaml.org,2002:" }, xs.Directives = p, xs;
}
var Ys = {}, Hs = {}, at = {}, ll;
function Qi() {
  if (ll) return at;
  ll = 1;
  var e = re(), r = mn();
  function a(o) {
    if (/[\x00-\x19\s,[\]{}]/.test(o)) {
      const l = `Anchor must not contain whitespace or control characters: ${JSON.stringify(o)}`;
      throw new Error(l);
    }
    return !0;
  }
  function d(o) {
    const u = /* @__PURE__ */ new Set();
    return r.visit(o, {
      Value(l, i) {
        i.anchor && u.add(i.anchor);
      }
    }), u;
  }
  function p(o, u) {
    for (let l = 1; ; ++l) {
      const i = `${o}${l}`;
      if (!u.has(i))
        return i;
    }
  }
  function c(o, u) {
    const l = [], i = /* @__PURE__ */ new Map();
    let t = null;
    return {
      onAnchor: (s) => {
        l.push(s), t ?? (t = d(o));
        const n = p(u, t);
        return t.add(n), n;
      },
      /**
       * With circular references, the source node is only resolved after all
       * of its child nodes are. This is why anchors are set only after all of
       * the nodes have been created.
       */
      setAnchors: () => {
        for (const s of l) {
          const n = i.get(s);
          if (typeof n == "object" && n.anchor && (e.isScalar(n.node) || e.isCollection(n.node)))
            n.node.anchor = n.anchor;
          else {
            const f = new Error("Failed to resolve repeated object (this should not happen)");
            throw f.source = s, f;
          }
        }
      },
      sourceObjects: i
    };
  }
  return at.anchorIsValid = a, at.anchorNames = d, at.createNodeAnchors = c, at.findNewAnchor = p, at;
}
var Js = {}, Ws = {}, ul;
function df() {
  if (ul) return Ws;
  ul = 1;
  function e(r, a, d, p) {
    if (p && typeof p == "object")
      if (Array.isArray(p))
        for (let c = 0, o = p.length; c < o; ++c) {
          const u = p[c], l = e(r, p, String(c), u);
          l === void 0 ? delete p[c] : l !== u && (p[c] = l);
        }
      else if (p instanceof Map)
        for (const c of Array.from(p.keys())) {
          const o = p.get(c), u = e(r, p, c, o);
          u === void 0 ? p.delete(c) : u !== o && p.set(c, u);
        }
      else if (p instanceof Set)
        for (const c of Array.from(p)) {
          const o = e(r, p, c, c);
          o === void 0 ? p.delete(c) : o !== c && (p.delete(c), p.add(o));
        }
      else
        for (const [c, o] of Object.entries(p)) {
          const u = e(r, p, c, o);
          u === void 0 ? delete p[c] : u !== o && (p[c] = u);
        }
    return r.call(a, d, p);
  }
  return Ws.applyReviver = e, Ws;
}
var Xs = {}, fl;
function Je() {
  if (fl) return Xs;
  fl = 1;
  var e = re();
  function r(a, d, p) {
    if (Array.isArray(a))
      return a.map((c, o) => r(c, String(o), p));
    if (a && typeof a.toJSON == "function") {
      if (!p || !e.hasAnchor(a))
        return a.toJSON(d, p);
      const c = { aliasCount: 0, count: 1, res: void 0 };
      p.anchors.set(a, c), p.onCreate = (u) => {
        c.res = u, delete p.onCreate;
      };
      const o = a.toJSON(d, p);
      return p.onCreate && p.onCreate(o), o;
    }
    return typeof a == "bigint" && !p?.keep ? Number(a) : a;
  }
  return Xs.toJS = r, Xs;
}
var dl;
function Zi() {
  if (dl) return Js;
  dl = 1;
  var e = df(), r = re(), a = Je();
  class d {
    constructor(c) {
      Object.defineProperty(this, r.NODE_TYPE, { value: c });
    }
    /** Create a copy of this node.  */
    clone() {
      const c = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
      return this.range && (c.range = this.range.slice()), c;
    }
    /** A plain JavaScript representation of this node. */
    toJS(c, { mapAsMap: o, maxAliasCount: u, onAnchor: l, reviver: i } = {}) {
      if (!r.isDocument(c))
        throw new TypeError("A document argument is required");
      const t = {
        anchors: /* @__PURE__ */ new Map(),
        doc: c,
        keep: !0,
        mapAsMap: o === !0,
        mapKeyWarned: !1,
        maxAliasCount: typeof u == "number" ? u : 100
      }, s = a.toJS(this, "", t);
      if (typeof l == "function")
        for (const { count: n, res: f } of t.anchors.values())
          l(f, n);
      return typeof i == "function" ? e.applyReviver(i, { "": s }, "", s) : s;
    }
  }
  return Js.NodeBase = d, Js;
}
var hl;
function yn() {
  if (hl) return Hs;
  hl = 1;
  var e = Qi(), r = mn(), a = re(), d = Zi(), p = Je();
  let c = class extends d.NodeBase {
    constructor(l) {
      super(a.ALIAS), this.source = l, Object.defineProperty(this, "tag", {
        set() {
          throw new Error("Alias nodes cannot have tags");
        }
      });
    }
    /**
     * Resolve the value of this alias within `doc`, finding the last
     * instance of the `source` anchor before this node.
     */
    resolve(l, i) {
      let t;
      i?.aliasResolveCache ? t = i.aliasResolveCache : (t = [], r.visit(l, {
        Node: (n, f) => {
          (a.isAlias(f) || a.hasAnchor(f)) && t.push(f);
        }
      }), i && (i.aliasResolveCache = t));
      let s;
      for (const n of t) {
        if (n === this)
          break;
        n.anchor === this.source && (s = n);
      }
      return s;
    }
    toJSON(l, i) {
      if (!i)
        return { source: this.source };
      const { anchors: t, doc: s, maxAliasCount: n } = i, f = this.resolve(s, i);
      if (!f) {
        const y = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
        throw new ReferenceError(y);
      }
      let h = t.get(f);
      if (h || (p.toJS(f, null, i), h = t.get(f)), !h || h.res === void 0) {
        const y = "This should not happen: Alias anchor was not resolved?";
        throw new ReferenceError(y);
      }
      if (n >= 0 && (h.count += 1, h.aliasCount === 0 && (h.aliasCount = o(s, f, t)), h.count * h.aliasCount > n)) {
        const y = "Excessive alias count indicates a resource exhaustion attack";
        throw new ReferenceError(y);
      }
      return h.res;
    }
    toString(l, i, t) {
      const s = `*${this.source}`;
      if (l) {
        if (e.anchorIsValid(this.source), l.options.verifyAliasOrder && !l.anchors.has(this.source)) {
          const n = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new Error(n);
        }
        if (l.implicitKey)
          return `${s} `;
      }
      return s;
    }
  };
  function o(u, l, i) {
    if (a.isAlias(l)) {
      const t = l.resolve(u), s = i && t && i.get(t);
      return s ? s.count * s.aliasCount : 0;
    } else if (a.isCollection(l)) {
      let t = 0;
      for (const s of l.items) {
        const n = o(u, s, i);
        n > t && (t = n);
      }
      return t;
    } else if (a.isPair(l)) {
      const t = o(u, l.key, i), s = o(u, l.value, i);
      return Math.max(t, s);
    }
    return 1;
  }
  return Hs.Alias = c, Hs;
}
var $t = {}, Qs = {}, Fr = {}, pl;
function le() {
  if (pl) return Fr;
  pl = 1;
  var e = re(), r = Zi(), a = Je();
  const d = (c) => !c || typeof c != "function" && typeof c != "object";
  let p = class extends r.NodeBase {
    constructor(o) {
      super(e.SCALAR), this.value = o;
    }
    toJSON(o, u) {
      return u?.keep ? this.value : a.toJS(this.value, o, u);
    }
    toString() {
      return String(this.value);
    }
  };
  return p.BLOCK_FOLDED = "BLOCK_FOLDED", p.BLOCK_LITERAL = "BLOCK_LITERAL", p.PLAIN = "PLAIN", p.QUOTE_DOUBLE = "QUOTE_DOUBLE", p.QUOTE_SINGLE = "QUOTE_SINGLE", Fr.Scalar = p, Fr.isScalarValue = d, Fr;
}
var ml;
function gn() {
  if (ml) return Qs;
  ml = 1;
  var e = yn(), r = re(), a = le();
  const d = "tag:yaml.org,2002:";
  function p(o, u, l) {
    if (u) {
      const i = l.filter((s) => s.tag === u), t = i.find((s) => !s.format) ?? i[0];
      if (!t)
        throw new Error(`Tag ${u} not found`);
      return t;
    }
    return l.find((i) => i.identify?.(o) && !i.format);
  }
  function c(o, u, l) {
    if (r.isDocument(o) && (o = o.contents), r.isNode(o))
      return o;
    if (r.isPair(o)) {
      const g = l.schema[r.MAP].createNode?.(l.schema, null, l);
      return g.items.push(o), g;
    }
    (o instanceof String || o instanceof Number || o instanceof Boolean || typeof BigInt < "u" && o instanceof BigInt) && (o = o.valueOf());
    const { aliasDuplicateObjects: i, onAnchor: t, onTagObj: s, schema: n, sourceObjects: f } = l;
    let h;
    if (i && o && typeof o == "object") {
      if (h = f.get(o), h)
        return h.anchor ?? (h.anchor = t(o)), new e.Alias(h.anchor);
      h = { anchor: null, node: null }, f.set(o, h);
    }
    u?.startsWith("!!") && (u = d + u.slice(2));
    let y = p(o, u, n.tags);
    if (!y) {
      if (o && typeof o.toJSON == "function" && (o = o.toJSON()), !o || typeof o != "object") {
        const g = new a.Scalar(o);
        return h && (h.node = g), g;
      }
      y = o instanceof Map ? n[r.MAP] : Symbol.iterator in Object(o) ? n[r.SEQ] : n[r.MAP];
    }
    s && (s(y), delete l.onTagObj);
    const m = y?.createNode ? y.createNode(l.schema, o, l) : typeof y?.nodeClass?.from == "function" ? y.nodeClass.from(l.schema, o, l) : new a.Scalar(o);
    return u ? m.tag = u : y.default || (m.tag = y.tag), h && (h.node = m), m;
  }
  return Qs.createNode = c, Qs;
}
var yl;
function ea() {
  if (yl) return $t;
  yl = 1;
  var e = gn(), r = re(), a = Zi();
  function d(o, u, l) {
    let i = l;
    for (let t = u.length - 1; t >= 0; --t) {
      const s = u[t];
      if (typeof s == "number" && Number.isInteger(s) && s >= 0) {
        const n = [];
        n[s] = i, i = n;
      } else
        i = /* @__PURE__ */ new Map([[s, i]]);
    }
    return e.createNode(i, void 0, {
      aliasDuplicateObjects: !1,
      keepUndefined: !1,
      onAnchor: () => {
        throw new Error("This should not happen, please report a bug.");
      },
      schema: o,
      sourceObjects: /* @__PURE__ */ new Map()
    });
  }
  const p = (o) => o == null || typeof o == "object" && !!o[Symbol.iterator]().next().done;
  let c = class extends a.NodeBase {
    constructor(u, l) {
      super(u), Object.defineProperty(this, "schema", {
        value: l,
        configurable: !0,
        enumerable: !1,
        writable: !0
      });
    }
    /**
     * Create a copy of this collection.
     *
     * @param schema - If defined, overwrites the original's schema
     */
    clone(u) {
      const l = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
      return u && (l.schema = u), l.items = l.items.map((i) => r.isNode(i) || r.isPair(i) ? i.clone(u) : i), this.range && (l.range = this.range.slice()), l;
    }
    /**
     * Adds a value to the collection. For `!!map` and `!!omap` the value must
     * be a Pair instance or a `{ key, value }` object, which may not have a key
     * that already exists in the map.
     */
    addIn(u, l) {
      if (p(u))
        this.add(l);
      else {
        const [i, ...t] = u, s = this.get(i, !0);
        if (r.isCollection(s))
          s.addIn(t, l);
        else if (s === void 0 && this.schema)
          this.set(i, d(this.schema, t, l));
        else
          throw new Error(`Expected YAML collection at ${i}. Remaining path: ${t}`);
      }
    }
    /**
     * Removes a value from the collection.
     * @returns `true` if the item was found and removed.
     */
    deleteIn(u) {
      const [l, ...i] = u;
      if (i.length === 0)
        return this.delete(l);
      const t = this.get(l, !0);
      if (r.isCollection(t))
        return t.deleteIn(i);
      throw new Error(`Expected YAML collection at ${l}. Remaining path: ${i}`);
    }
    /**
     * Returns item at `key`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    getIn(u, l) {
      const [i, ...t] = u, s = this.get(i, !0);
      return t.length === 0 ? !l && r.isScalar(s) ? s.value : s : r.isCollection(s) ? s.getIn(t, l) : void 0;
    }
    hasAllNullValues(u) {
      return this.items.every((l) => {
        if (!r.isPair(l))
          return !1;
        const i = l.value;
        return i == null || u && r.isScalar(i) && i.value == null && !i.commentBefore && !i.comment && !i.tag;
      });
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     */
    hasIn(u) {
      const [l, ...i] = u;
      if (i.length === 0)
        return this.has(l);
      const t = this.get(l, !0);
      return r.isCollection(t) ? t.hasIn(i) : !1;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    setIn(u, l) {
      const [i, ...t] = u;
      if (t.length === 0)
        this.set(i, l);
      else {
        const s = this.get(i, !0);
        if (r.isCollection(s))
          s.setIn(t, l);
        else if (s === void 0 && this.schema)
          this.set(i, d(this.schema, t, l));
        else
          throw new Error(`Expected YAML collection at ${i}. Remaining path: ${t}`);
      }
    }
  };
  return $t.Collection = c, $t.collectionFromPath = d, $t.isEmptyPath = p, $t;
}
var Vr = {}, Zs = {}, Ur = {}, wt = {}, gl;
function vn() {
  if (gl) return wt;
  gl = 1;
  const e = (d) => d.replace(/^(?!$)(?: $)?/gm, "#");
  function r(d, p) {
    return /^\n+$/.test(d) ? d.substring(1) : p ? d.replace(/^(?! *$)/gm, p) : d;
  }
  const a = (d, p, c) => d.endsWith(`
`) ? r(c, p) : c.includes(`
`) ? `
` + r(c, p) : (d.endsWith(" ") ? "" : " ") + c;
  return wt.indentComment = r, wt.lineComment = a, wt.stringifyComment = e, wt;
}
var ei = {}, ot = {}, vl;
function uy() {
  if (vl) return ot;
  vl = 1;
  const e = "flow", r = "block", a = "quoted";
  function d(c, o, u = "flow", { indentAtStart: l, lineWidth: i = 80, minContentWidth: t = 20, onFold: s, onOverflow: n } = {}) {
    if (!i || i < 0)
      return c;
    i < t && (t = 0);
    const f = Math.max(1 + t, 1 + i - o.length);
    if (c.length <= f)
      return c;
    const h = [], y = {};
    let m = i - o.length;
    typeof l == "number" && (l > i - Math.max(2, t) ? h.push(0) : m = i - l);
    let g, v, w = !1, b = -1, $ = -1, E = -1;
    u === r && (b = p(c, b, o.length), b !== -1 && (m = b + f));
    for (let N; N = c[b += 1]; ) {
      if (u === a && N === "\\") {
        switch ($ = b, c[b + 1]) {
          case "x":
            b += 3;
            break;
          case "u":
            b += 5;
            break;
          case "U":
            b += 9;
            break;
          default:
            b += 1;
        }
        E = b;
      }
      if (N === `
`)
        u === r && (b = p(c, b, o.length)), m = b + o.length + f, g = void 0;
      else {
        if (N === " " && v && v !== " " && v !== `
` && v !== "	") {
          const P = c[b + 1];
          P && P !== " " && P !== `
` && P !== "	" && (g = b);
        }
        if (b >= m)
          if (g)
            h.push(g), m = g + f, g = void 0;
          else if (u === a) {
            for (; v === " " || v === "	"; )
              v = N, N = c[b += 1], w = !0;
            const P = b > E + 1 ? b - 2 : $ - 1;
            if (y[P])
              return c;
            h.push(P), y[P] = !0, m = P + f, g = void 0;
          } else
            w = !0;
      }
      v = N;
    }
    if (w && n && n(), h.length === 0)
      return c;
    s && s();
    let S = c.slice(0, h[0]);
    for (let N = 0; N < h.length; ++N) {
      const P = h[N], j = h[N + 1] || c.length;
      P === 0 ? S = `
${o}${c.slice(0, j)}` : (u === a && y[P] && (S += `${c[P]}\\`), S += `
${o}${c.slice(P + 1, j)}`);
    }
    return S;
  }
  function p(c, o, u) {
    let l = o, i = o + 1, t = c[i];
    for (; t === " " || t === "	"; )
      if (o < i + u)
        t = c[++o];
      else {
        do
          t = c[++o];
        while (t && t !== `
`);
        l = o, i = o + 1, t = c[i];
      }
    return l;
  }
  return ot.FOLD_BLOCK = r, ot.FOLD_FLOW = e, ot.FOLD_QUOTED = a, ot.foldFlowLines = d, ot;
}
var $l;
function $n() {
  if ($l) return ei;
  $l = 1;
  var e = le(), r = uy();
  const a = (n, f) => ({
    indentAtStart: f ? n.indent.length : n.indentAtStart,
    lineWidth: n.options.lineWidth,
    minContentWidth: n.options.minContentWidth
  }), d = (n) => /^(%|---|\.\.\.)/m.test(n);
  function p(n, f, h) {
    if (!f || f < 0)
      return !1;
    const y = f - h, m = n.length;
    if (m <= y)
      return !1;
    for (let g = 0, v = 0; g < m; ++g)
      if (n[g] === `
`) {
        if (g - v > y)
          return !0;
        if (v = g + 1, m - v <= y)
          return !1;
      }
    return !0;
  }
  function c(n, f) {
    const h = JSON.stringify(n);
    if (f.options.doubleQuotedAsJSON)
      return h;
    const { implicitKey: y } = f, m = f.options.doubleQuotedMinMultiLineLength, g = f.indent || (d(n) ? "  " : "");
    let v = "", w = 0;
    for (let b = 0, $ = h[b]; $; $ = h[++b])
      if ($ === " " && h[b + 1] === "\\" && h[b + 2] === "n" && (v += h.slice(w, b) + "\\ ", b += 1, w = b, $ = "\\"), $ === "\\")
        switch (h[b + 1]) {
          case "u":
            {
              v += h.slice(w, b);
              const E = h.substr(b + 2, 4);
              switch (E) {
                case "0000":
                  v += "\\0";
                  break;
                case "0007":
                  v += "\\a";
                  break;
                case "000b":
                  v += "\\v";
                  break;
                case "001b":
                  v += "\\e";
                  break;
                case "0085":
                  v += "\\N";
                  break;
                case "00a0":
                  v += "\\_";
                  break;
                case "2028":
                  v += "\\L";
                  break;
                case "2029":
                  v += "\\P";
                  break;
                default:
                  E.substr(0, 2) === "00" ? v += "\\x" + E.substr(2) : v += h.substr(b, 6);
              }
              b += 5, w = b + 1;
            }
            break;
          case "n":
            if (y || h[b + 2] === '"' || h.length < m)
              b += 1;
            else {
              for (v += h.slice(w, b) + `

`; h[b + 2] === "\\" && h[b + 3] === "n" && h[b + 4] !== '"'; )
                v += `
`, b += 2;
              v += g, h[b + 2] === " " && (v += "\\"), b += 1, w = b + 1;
            }
            break;
          default:
            b += 1;
        }
    return v = w ? v + h.slice(w) : h, y ? v : r.foldFlowLines(v, g, r.FOLD_QUOTED, a(f, !1));
  }
  function o(n, f) {
    if (f.options.singleQuote === !1 || f.implicitKey && n.includes(`
`) || /[ \t]\n|\n[ \t]/.test(n))
      return c(n, f);
    const h = f.indent || (d(n) ? "  " : ""), y = "'" + n.replace(/'/g, "''").replace(/\n+/g, `$&
${h}`) + "'";
    return f.implicitKey ? y : r.foldFlowLines(y, h, r.FOLD_FLOW, a(f, !1));
  }
  function u(n, f) {
    const { singleQuote: h } = f.options;
    let y;
    if (h === !1)
      y = c;
    else {
      const m = n.includes('"'), g = n.includes("'");
      m && !g ? y = o : g && !m ? y = c : y = h ? o : c;
    }
    return y(n, f);
  }
  let l;
  try {
    l = new RegExp(`(^|(?<!
))
+(?!
|$)`, "g");
  } catch {
    l = /\n+(?!\n|$)/g;
  }
  function i({ comment: n, type: f, value: h }, y, m, g) {
    const { blockQuote: v, commentString: w, lineWidth: b } = y.options;
    if (!v || /\n[\t ]+$/.test(h))
      return u(h, y);
    const $ = y.indent || (y.forceBlockIndent || d(h) ? "  " : ""), E = v === "literal" ? !0 : v === "folded" || f === e.Scalar.BLOCK_FOLDED ? !1 : f === e.Scalar.BLOCK_LITERAL ? !0 : !p(h, b, $.length);
    if (!h)
      return E ? `|
` : `>
`;
    let S, N;
    for (N = h.length; N > 0; --N) {
      const F = h[N - 1];
      if (F !== `
` && F !== "	" && F !== " ")
        break;
    }
    let P = h.substring(N);
    const j = P.indexOf(`
`);
    j === -1 ? S = "-" : h === P || j !== P.length - 1 ? (S = "+", g && g()) : S = "", P && (h = h.slice(0, -P.length), P[P.length - 1] === `
` && (P = P.slice(0, -1)), P = P.replace(l, `$&${$}`));
    let A = !1, V, z = -1;
    for (V = 0; V < h.length; ++V) {
      const F = h[V];
      if (F === " ")
        A = !0;
      else if (F === `
`)
        z = V;
      else
        break;
    }
    let q = h.substring(0, z < V ? z + 1 : V);
    q && (h = h.substring(q.length), q = q.replace(/\n+/g, `$&${$}`));
    let G = (A ? $ ? "2" : "1" : "") + S;
    if (n && (G += " " + w(n.replace(/ ?[\r\n]+/g, " ")), m && m()), !E) {
      const F = h.replace(/\n+/g, `
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${$}`);
      let B = !1;
      const K = a(y, !0);
      v !== "folded" && f !== e.Scalar.BLOCK_FOLDED && (K.onOverflow = () => {
        B = !0;
      });
      const L = r.foldFlowLines(`${q}${F}${P}`, $, r.FOLD_BLOCK, K);
      if (!B)
        return `>${G}
${$}${L}`;
    }
    return h = h.replace(/\n+/g, `$&${$}`), `|${G}
${$}${q}${h}${P}`;
  }
  function t(n, f, h, y) {
    const { type: m, value: g } = n, { actualString: v, implicitKey: w, indent: b, indentStep: $, inFlow: E } = f;
    if (w && g.includes(`
`) || E && /[[\]{},]/.test(g))
      return u(g, f);
    if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(g))
      return w || E || !g.includes(`
`) ? u(g, f) : i(n, f, h, y);
    if (!w && !E && m !== e.Scalar.PLAIN && g.includes(`
`))
      return i(n, f, h, y);
    if (d(g)) {
      if (b === "")
        return f.forceBlockIndent = !0, i(n, f, h, y);
      if (w && b === $)
        return u(g, f);
    }
    const S = g.replace(/\n+/g, `$&
${b}`);
    if (v) {
      const N = (A) => A.default && A.tag !== "tag:yaml.org,2002:str" && A.test?.test(S), { compat: P, tags: j } = f.doc.schema;
      if (j.some(N) || P?.some(N))
        return u(g, f);
    }
    return w ? S : r.foldFlowLines(S, b, r.FOLD_FLOW, a(f, !1));
  }
  function s(n, f, h, y) {
    const { implicitKey: m, inFlow: g } = f, v = typeof n.value == "string" ? n : Object.assign({}, n, { value: String(n.value) });
    let { type: w } = n;
    w !== e.Scalar.QUOTE_DOUBLE && /[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(v.value) && (w = e.Scalar.QUOTE_DOUBLE);
    const b = (E) => {
      switch (E) {
        case e.Scalar.BLOCK_FOLDED:
        case e.Scalar.BLOCK_LITERAL:
          return m || g ? u(v.value, f) : i(v, f, h, y);
        case e.Scalar.QUOTE_DOUBLE:
          return c(v.value, f);
        case e.Scalar.QUOTE_SINGLE:
          return o(v.value, f);
        case e.Scalar.PLAIN:
          return t(v, f, h, y);
        default:
          return null;
      }
    };
    let $ = b(w);
    if ($ === null) {
      const { defaultKeyType: E, defaultStringType: S } = f.options, N = m && E || S;
      if ($ = b(N), $ === null)
        throw new Error(`Unsupported default string type ${N}`);
    }
    return $;
  }
  return ei.stringifyString = s, ei;
}
var wl;
function wn() {
  if (wl) return Ur;
  wl = 1;
  var e = Qi(), r = re(), a = vn(), d = $n();
  function p(l, i) {
    const t = Object.assign({
      blockQuote: !0,
      commentString: a.stringifyComment,
      defaultKeyType: null,
      defaultStringType: "PLAIN",
      directives: null,
      doubleQuotedAsJSON: !1,
      doubleQuotedMinMultiLineLength: 40,
      falseStr: "false",
      flowCollectionPadding: !0,
      indentSeq: !0,
      lineWidth: 80,
      minContentWidth: 20,
      nullStr: "null",
      simpleKeys: !1,
      singleQuote: null,
      trueStr: "true",
      verifyAliasOrder: !0
    }, l.schema.toStringOptions, i);
    let s;
    switch (t.collectionStyle) {
      case "block":
        s = !1;
        break;
      case "flow":
        s = !0;
        break;
      default:
        s = null;
    }
    return {
      anchors: /* @__PURE__ */ new Set(),
      doc: l,
      flowCollectionPadding: t.flowCollectionPadding ? " " : "",
      indent: "",
      indentStep: typeof t.indent == "number" ? " ".repeat(t.indent) : "  ",
      inFlow: s,
      options: t
    };
  }
  function c(l, i) {
    if (i.tag) {
      const n = l.filter((f) => f.tag === i.tag);
      if (n.length > 0)
        return n.find((f) => f.format === i.format) ?? n[0];
    }
    let t, s;
    if (r.isScalar(i)) {
      s = i.value;
      let n = l.filter((f) => f.identify?.(s));
      if (n.length > 1) {
        const f = n.filter((h) => h.test);
        f.length > 0 && (n = f);
      }
      t = n.find((f) => f.format === i.format) ?? n.find((f) => !f.format);
    } else
      s = i, t = l.find((n) => n.nodeClass && s instanceof n.nodeClass);
    if (!t) {
      const n = s?.constructor?.name ?? (s === null ? "null" : typeof s);
      throw new Error(`Tag not resolved for ${n} value`);
    }
    return t;
  }
  function o(l, i, { anchors: t, doc: s }) {
    if (!s.directives)
      return "";
    const n = [], f = (r.isScalar(l) || r.isCollection(l)) && l.anchor;
    f && e.anchorIsValid(f) && (t.add(f), n.push(`&${f}`));
    const h = l.tag ?? (i.default ? null : i.tag);
    return h && n.push(s.directives.tagString(h)), n.join(" ");
  }
  function u(l, i, t, s) {
    if (r.isPair(l))
      return l.toString(i, t, s);
    if (r.isAlias(l)) {
      if (i.doc.directives)
        return l.toString(i);
      if (i.resolvedAliases?.has(l))
        throw new TypeError("Cannot stringify circular structure without alias nodes");
      i.resolvedAliases ? i.resolvedAliases.add(l) : i.resolvedAliases = /* @__PURE__ */ new Set([l]), l = l.resolve(i.doc);
    }
    let n;
    const f = r.isNode(l) ? l : i.doc.createNode(l, { onTagObj: (m) => n = m });
    n ?? (n = c(i.doc.schema.tags, f));
    const h = o(f, n, i);
    h.length > 0 && (i.indentAtStart = (i.indentAtStart ?? 0) + h.length + 1);
    const y = typeof n.stringify == "function" ? n.stringify(f, i, t, s) : r.isScalar(f) ? d.stringifyString(f, i, t, s) : f.toString(i, t, s);
    return h ? r.isScalar(f) || y[0] === "{" || y[0] === "[" ? `${h} ${y}` : `${h}
${i.indent}${y}` : y;
  }
  return Ur.createStringifyContext = p, Ur.stringify = u, Ur;
}
var bl;
function fy() {
  if (bl) return Zs;
  bl = 1;
  var e = re(), r = le(), a = wn(), d = vn();
  function p({ key: c, value: o }, u, l, i) {
    const { allNullValues: t, doc: s, indent: n, indentStep: f, options: { commentString: h, indentSeq: y, simpleKeys: m } } = u;
    let g = e.isNode(c) && c.comment || null;
    if (m) {
      if (g)
        throw new Error("With simple keys, key nodes cannot have comments");
      if (e.isCollection(c) || !e.isNode(c) && typeof c == "object") {
        const V = "With simple keys, collection cannot be used as a key value";
        throw new Error(V);
      }
    }
    let v = !m && (!c || g && o == null && !u.inFlow || e.isCollection(c) || (e.isScalar(c) ? c.type === r.Scalar.BLOCK_FOLDED || c.type === r.Scalar.BLOCK_LITERAL : typeof c == "object"));
    u = Object.assign({}, u, {
      allNullValues: !1,
      implicitKey: !v && (m || !t),
      indent: n + f
    });
    let w = !1, b = !1, $ = a.stringify(c, u, () => w = !0, () => b = !0);
    if (!v && !u.inFlow && $.length > 1024) {
      if (m)
        throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
      v = !0;
    }
    if (u.inFlow) {
      if (t || o == null)
        return w && l && l(), $ === "" ? "?" : v ? `? ${$}` : $;
    } else if (t && !m || o == null && v)
      return $ = `? ${$}`, g && !w ? $ += d.lineComment($, u.indent, h(g)) : b && i && i(), $;
    w && (g = null), v ? (g && ($ += d.lineComment($, u.indent, h(g))), $ = `? ${$}
${n}:`) : ($ = `${$}:`, g && ($ += d.lineComment($, u.indent, h(g))));
    let E, S, N;
    e.isNode(o) ? (E = !!o.spaceBefore, S = o.commentBefore, N = o.comment) : (E = !1, S = null, N = null, o && typeof o == "object" && (o = s.createNode(o))), u.implicitKey = !1, !v && !g && e.isScalar(o) && (u.indentAtStart = $.length + 1), b = !1, !y && f.length >= 2 && !u.inFlow && !v && e.isSeq(o) && !o.flow && !o.tag && !o.anchor && (u.indent = u.indent.substring(2));
    let P = !1;
    const j = a.stringify(o, u, () => P = !0, () => b = !0);
    let A = " ";
    if (g || E || S) {
      if (A = E ? `
` : "", S) {
        const V = h(S);
        A += `
${d.indentComment(V, u.indent)}`;
      }
      j === "" && !u.inFlow ? A === `
` && (A = `

`) : A += `
${u.indent}`;
    } else if (!v && e.isCollection(o)) {
      const V = j[0], z = j.indexOf(`
`), q = z !== -1, D = u.inFlow ?? o.flow ?? o.items.length === 0;
      if (q || !D) {
        let G = !1;
        if (q && (V === "&" || V === "!")) {
          let F = j.indexOf(" ");
          V === "&" && F !== -1 && F < z && j[F + 1] === "!" && (F = j.indexOf(" ", F + 1)), (F === -1 || z < F) && (G = !0);
        }
        G || (A = `
${u.indent}`);
      }
    } else (j === "" || j[0] === `
`) && (A = "");
    return $ += A + j, u.inFlow ? P && l && l() : N && !P ? $ += d.lineComment($, u.indent, h(N)) : b && i && i(), $;
  }
  return Zs.stringifyPair = p, Zs;
}
var ti = {}, Br = {}, El;
function hf() {
  if (El) return Br;
  El = 1;
  var e = Fi;
  function r(d, ...p) {
    d === "debug" && console.log(...p);
  }
  function a(d, p) {
    (d === "debug" || d === "warn") && (typeof e.emitWarning == "function" ? e.emitWarning(p) : console.warn(p));
  }
  return Br.debug = r, Br.warn = a, Br;
}
var bt = {}, Sl;
function ta() {
  if (Sl) return bt;
  Sl = 1;
  var e = re(), r = le();
  const a = "<<", d = {
    identify: (u) => u === a || typeof u == "symbol" && u.description === a,
    default: "key",
    tag: "tag:yaml.org,2002:merge",
    test: /^<<$/,
    resolve: () => Object.assign(new r.Scalar(Symbol(a)), {
      addToJSMap: c
    }),
    stringify: () => a
  }, p = (u, l) => (d.identify(l) || e.isScalar(l) && (!l.type || l.type === r.Scalar.PLAIN) && d.identify(l.value)) && u?.doc.schema.tags.some((i) => i.tag === d.tag && i.default);
  function c(u, l, i) {
    if (i = u && e.isAlias(i) ? i.resolve(u.doc) : i, e.isSeq(i))
      for (const t of i.items)
        o(u, l, t);
    else if (Array.isArray(i))
      for (const t of i)
        o(u, l, t);
    else
      o(u, l, i);
  }
  function o(u, l, i) {
    const t = u && e.isAlias(i) ? i.resolve(u.doc) : i;
    if (!e.isMap(t))
      throw new Error("Merge sources must be maps or map aliases");
    const s = t.toJSON(null, u, Map);
    for (const [n, f] of s)
      l instanceof Map ? l.has(n) || l.set(n, f) : l instanceof Set ? l.add(n) : Object.prototype.hasOwnProperty.call(l, n) || Object.defineProperty(l, n, {
        value: f,
        writable: !0,
        enumerable: !0,
        configurable: !0
      });
    return l;
  }
  return bt.addMergeToJSMap = c, bt.isMergeKey = p, bt.merge = d, bt;
}
var _l;
function pf() {
  if (_l) return ti;
  _l = 1;
  var e = hf(), r = ta(), a = wn(), d = re(), p = Je();
  function c(u, l, { key: i, value: t }) {
    if (d.isNode(i) && i.addToJSMap)
      i.addToJSMap(u, l, t);
    else if (r.isMergeKey(u, i))
      r.addMergeToJSMap(u, l, t);
    else {
      const s = p.toJS(i, "", u);
      if (l instanceof Map)
        l.set(s, p.toJS(t, s, u));
      else if (l instanceof Set)
        l.add(s);
      else {
        const n = o(i, s, u), f = p.toJS(t, n, u);
        n in l ? Object.defineProperty(l, n, {
          value: f,
          writable: !0,
          enumerable: !0,
          configurable: !0
        }) : l[n] = f;
      }
    }
    return l;
  }
  function o(u, l, i) {
    if (l === null)
      return "";
    if (typeof l != "object")
      return String(l);
    if (d.isNode(u) && i?.doc) {
      const t = a.createStringifyContext(i.doc, {});
      t.anchors = /* @__PURE__ */ new Set();
      for (const n of i.anchors.keys())
        t.anchors.add(n.anchor);
      t.inFlow = !0, t.inStringifyKey = !0;
      const s = u.toString(t);
      if (!i.mapKeyWarned) {
        let n = JSON.stringify(s);
        n.length > 40 && (n = n.substring(0, 36) + '..."'), e.warn(i.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${n}. Set mapAsMap: true to use object keys.`), i.mapKeyWarned = !0;
      }
      return s;
    }
    return JSON.stringify(l);
  }
  return ti.addPairToJSMap = c, ti;
}
var Nl;
function We() {
  if (Nl) return Vr;
  Nl = 1;
  var e = gn(), r = fy(), a = pf(), d = re();
  function p(o, u, l) {
    const i = e.createNode(o, void 0, l), t = e.createNode(u, void 0, l);
    return new c(i, t);
  }
  let c = class mf {
    constructor(u, l = null) {
      Object.defineProperty(this, d.NODE_TYPE, { value: d.PAIR }), this.key = u, this.value = l;
    }
    clone(u) {
      let { key: l, value: i } = this;
      return d.isNode(l) && (l = l.clone(u)), d.isNode(i) && (i = i.clone(u)), new mf(l, i);
    }
    toJSON(u, l) {
      const i = l?.mapAsMap ? /* @__PURE__ */ new Map() : {};
      return a.addPairToJSMap(l, i, this);
    }
    toString(u, l, i) {
      return u?.doc ? r.stringifyPair(this, u, l, i) : JSON.stringify(this);
    }
  };
  return Vr.Pair = c, Vr.createPair = p, Vr;
}
var ri = {}, ni = {}, Kr = {}, si = {}, Rl;
function yf() {
  if (Rl) return si;
  Rl = 1;
  var e = re(), r = wn(), a = vn();
  function d(u, l, i) {
    return (l.inFlow ?? u.flow ? c : p)(u, l, i);
  }
  function p({ comment: u, items: l }, i, { blockItemPrefix: t, flowChars: s, itemIndent: n, onChompKeep: f, onComment: h }) {
    const { indent: y, options: { commentString: m } } = i, g = Object.assign({}, i, { indent: n, type: null });
    let v = !1;
    const w = [];
    for (let $ = 0; $ < l.length; ++$) {
      const E = l[$];
      let S = null;
      if (e.isNode(E))
        !v && E.spaceBefore && w.push(""), o(i, w, E.commentBefore, v), E.comment && (S = E.comment);
      else if (e.isPair(E)) {
        const P = e.isNode(E.key) ? E.key : null;
        P && (!v && P.spaceBefore && w.push(""), o(i, w, P.commentBefore, v));
      }
      v = !1;
      let N = r.stringify(E, g, () => S = null, () => v = !0);
      S && (N += a.lineComment(N, n, m(S))), v && S && (v = !1), w.push(t + N);
    }
    let b;
    if (w.length === 0)
      b = s.start + s.end;
    else {
      b = w[0];
      for (let $ = 1; $ < w.length; ++$) {
        const E = w[$];
        b += E ? `
${y}${E}` : `
`;
      }
    }
    return u ? (b += `
` + a.indentComment(m(u), y), h && h()) : v && f && f(), b;
  }
  function c({ items: u }, l, { flowChars: i, itemIndent: t }) {
    const { indent: s, indentStep: n, flowCollectionPadding: f, options: { commentString: h } } = l;
    t += n;
    const y = Object.assign({}, l, {
      indent: t,
      inFlow: !0,
      type: null
    });
    let m = !1, g = 0;
    const v = [];
    for (let $ = 0; $ < u.length; ++$) {
      const E = u[$];
      let S = null;
      if (e.isNode(E))
        E.spaceBefore && v.push(""), o(l, v, E.commentBefore, !1), E.comment && (S = E.comment);
      else if (e.isPair(E)) {
        const P = e.isNode(E.key) ? E.key : null;
        P && (P.spaceBefore && v.push(""), o(l, v, P.commentBefore, !1), P.comment && (m = !0));
        const j = e.isNode(E.value) ? E.value : null;
        j ? (j.comment && (S = j.comment), j.commentBefore && (m = !0)) : E.value == null && P?.comment && (S = P.comment);
      }
      S && (m = !0);
      let N = r.stringify(E, y, () => S = null);
      $ < u.length - 1 && (N += ","), S && (N += a.lineComment(N, t, h(S))), !m && (v.length > g || N.includes(`
`)) && (m = !0), v.push(N), g = v.length;
    }
    const { start: w, end: b } = i;
    if (v.length === 0)
      return w + b;
    if (!m) {
      const $ = v.reduce((E, S) => E + S.length + 2, 2);
      m = l.options.lineWidth > 0 && $ > l.options.lineWidth;
    }
    if (m) {
      let $ = w;
      for (const E of v)
        $ += E ? `
${n}${s}${E}` : `
`;
      return `${$}
${s}${b}`;
    } else
      return `${w}${f}${v.join(" ")}${f}${b}`;
  }
  function o({ indent: u, options: { commentString: l } }, i, t, s) {
    if (t && s && (t = t.replace(/^\n+/, "")), t) {
      const n = a.indentComment(l(t), u);
      i.push(n.trimStart());
    }
  }
  return si.stringifyCollection = d, si;
}
var Ol;
function Xe() {
  if (Ol) return Kr;
  Ol = 1;
  var e = yf(), r = pf(), a = ea(), d = re(), p = We(), c = le();
  function o(l, i) {
    const t = d.isScalar(i) ? i.value : i;
    for (const s of l)
      if (d.isPair(s) && (s.key === i || s.key === t || d.isScalar(s.key) && s.key.value === t))
        return s;
  }
  let u = class extends a.Collection {
    static get tagName() {
      return "tag:yaml.org,2002:map";
    }
    constructor(i) {
      super(d.MAP, i), this.items = [];
    }
    /**
     * A generic collection parsing method that can be extended
     * to other node classes that inherit from YAMLMap
     */
    static from(i, t, s) {
      const { keepUndefined: n, replacer: f } = s, h = new this(i), y = (m, g) => {
        if (typeof f == "function")
          g = f.call(t, m, g);
        else if (Array.isArray(f) && !f.includes(m))
          return;
        (g !== void 0 || n) && h.items.push(p.createPair(m, g, s));
      };
      if (t instanceof Map)
        for (const [m, g] of t)
          y(m, g);
      else if (t && typeof t == "object")
        for (const m of Object.keys(t))
          y(m, t[m]);
      return typeof i.sortMapEntries == "function" && h.items.sort(i.sortMapEntries), h;
    }
    /**
     * Adds a value to the collection.
     *
     * @param overwrite - If not set `true`, using a key that is already in the
     *   collection will throw. Otherwise, overwrites the previous value.
     */
    add(i, t) {
      let s;
      d.isPair(i) ? s = i : !i || typeof i != "object" || !("key" in i) ? s = new p.Pair(i, i?.value) : s = new p.Pair(i.key, i.value);
      const n = o(this.items, s.key), f = this.schema?.sortMapEntries;
      if (n) {
        if (!t)
          throw new Error(`Key ${s.key} already set`);
        d.isScalar(n.value) && c.isScalarValue(s.value) ? n.value.value = s.value : n.value = s.value;
      } else if (f) {
        const h = this.items.findIndex((y) => f(s, y) < 0);
        h === -1 ? this.items.push(s) : this.items.splice(h, 0, s);
      } else
        this.items.push(s);
    }
    delete(i) {
      const t = o(this.items, i);
      return t ? this.items.splice(this.items.indexOf(t), 1).length > 0 : !1;
    }
    get(i, t) {
      const n = o(this.items, i)?.value;
      return (!t && d.isScalar(n) ? n.value : n) ?? void 0;
    }
    has(i) {
      return !!o(this.items, i);
    }
    set(i, t) {
      this.add(new p.Pair(i, t), !0);
    }
    /**
     * @param ctx - Conversion context, originally set in Document#toJS()
     * @param {Class} Type - If set, forces the returned collection type
     * @returns Instance of Type, Map, or Object
     */
    toJSON(i, t, s) {
      const n = s ? new s() : t?.mapAsMap ? /* @__PURE__ */ new Map() : {};
      t?.onCreate && t.onCreate(n);
      for (const f of this.items)
        r.addPairToJSMap(t, n, f);
      return n;
    }
    toString(i, t, s) {
      if (!i)
        return JSON.stringify(this);
      for (const n of this.items)
        if (!d.isPair(n))
          throw new Error(`Map items must all be pairs; found ${JSON.stringify(n)} instead`);
      return !i.allNullValues && this.hasAllNullValues(!1) && (i = Object.assign({}, i, { allNullValues: !0 })), e.stringifyCollection(this, i, {
        blockItemPrefix: "",
        flowChars: { start: "{", end: "}" },
        itemIndent: i.indent || "",
        onChompKeep: s,
        onComment: t
      });
    }
  };
  return Kr.YAMLMap = u, Kr.findPair = o, Kr;
}
var Pl;
function qt() {
  if (Pl) return ni;
  Pl = 1;
  var e = re(), r = Xe();
  const a = {
    collection: "map",
    default: !0,
    nodeClass: r.YAMLMap,
    tag: "tag:yaml.org,2002:map",
    resolve(d, p) {
      return e.isMap(d) || p("Expected a mapping for this tag"), d;
    },
    createNode: (d, p, c) => r.YAMLMap.from(d, p, c)
  };
  return ni.map = a, ni;
}
var ii = {}, ai = {}, Tl;
function Qe() {
  if (Tl) return ai;
  Tl = 1;
  var e = gn(), r = yf(), a = ea(), d = re(), p = le(), c = Je();
  let o = class extends a.Collection {
    static get tagName() {
      return "tag:yaml.org,2002:seq";
    }
    constructor(i) {
      super(d.SEQ, i), this.items = [];
    }
    add(i) {
      this.items.push(i);
    }
    /**
     * Removes a value from the collection.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     *
     * @returns `true` if the item was found and removed.
     */
    delete(i) {
      const t = u(i);
      return typeof t != "number" ? !1 : this.items.splice(t, 1).length > 0;
    }
    get(i, t) {
      const s = u(i);
      if (typeof s != "number")
        return;
      const n = this.items[s];
      return !t && d.isScalar(n) ? n.value : n;
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     */
    has(i) {
      const t = u(i);
      return typeof t == "number" && t < this.items.length;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     *
     * If `key` does not contain a representation of an integer, this will throw.
     * It may be wrapped in a `Scalar`.
     */
    set(i, t) {
      const s = u(i);
      if (typeof s != "number")
        throw new Error(`Expected a valid index, not ${i}.`);
      const n = this.items[s];
      d.isScalar(n) && p.isScalarValue(t) ? n.value = t : this.items[s] = t;
    }
    toJSON(i, t) {
      const s = [];
      t?.onCreate && t.onCreate(s);
      let n = 0;
      for (const f of this.items)
        s.push(c.toJS(f, String(n++), t));
      return s;
    }
    toString(i, t, s) {
      return i ? r.stringifyCollection(this, i, {
        blockItemPrefix: "- ",
        flowChars: { start: "[", end: "]" },
        itemIndent: (i.indent || "") + "  ",
        onChompKeep: s,
        onComment: t
      }) : JSON.stringify(this);
    }
    static from(i, t, s) {
      const { replacer: n } = s, f = new this(i);
      if (t && Symbol.iterator in Object(t)) {
        let h = 0;
        for (let y of t) {
          if (typeof n == "function") {
            const m = t instanceof Set ? y : String(h++);
            y = n.call(t, m, y);
          }
          f.items.push(e.createNode(y, void 0, s));
        }
      }
      return f;
    }
  };
  function u(l) {
    let i = d.isScalar(l) ? l.value : l;
    return i && typeof i == "string" && (i = Number(i)), typeof i == "number" && Number.isInteger(i) && i >= 0 ? i : null;
  }
  return ai.YAMLSeq = o, ai;
}
var Il;
function Ct() {
  if (Il) return ii;
  Il = 1;
  var e = re(), r = Qe();
  const a = {
    collection: "seq",
    default: !0,
    nodeClass: r.YAMLSeq,
    tag: "tag:yaml.org,2002:seq",
    resolve(d, p) {
      return e.isSeq(d) || p("Expected a sequence for this tag"), d;
    },
    createNode: (d, p, c) => r.YAMLSeq.from(d, p, c)
  };
  return ii.seq = a, ii;
}
var oi = {}, Al;
function bn() {
  if (Al) return oi;
  Al = 1;
  var e = $n();
  const r = {
    identify: (a) => typeof a == "string",
    default: !0,
    tag: "tag:yaml.org,2002:str",
    resolve: (a) => a,
    stringify(a, d, p, c) {
      return d = Object.assign({ actualString: !0 }, d), e.stringifyString(a, d, p, c);
    }
  };
  return oi.string = r, oi;
}
var zr = {}, ci = {}, kl;
function ra() {
  if (kl) return ci;
  kl = 1;
  var e = le();
  const r = {
    identify: (a) => a == null,
    createNode: () => new e.Scalar(null),
    default: !0,
    tag: "tag:yaml.org,2002:null",
    test: /^(?:~|[Nn]ull|NULL)?$/,
    resolve: () => new e.Scalar(null),
    stringify: ({ source: a }, d) => typeof a == "string" && r.test.test(a) ? a : d.options.nullStr
  };
  return ci.nullTag = r, ci;
}
var li = {}, ql;
function gf() {
  if (ql) return li;
  ql = 1;
  var e = le();
  const r = {
    identify: (a) => typeof a == "boolean",
    default: !0,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
    resolve: (a) => new e.Scalar(a[0] === "t" || a[0] === "T"),
    stringify({ source: a, value: d }, p) {
      if (a && r.test.test(a)) {
        const c = a[0] === "t" || a[0] === "T";
        if (d === c)
          return a;
      }
      return d ? p.options.trueStr : p.options.falseStr;
    }
  };
  return li.boolTag = r, li;
}
var Et = {}, ui = {}, Cl;
function Lt() {
  if (Cl) return ui;
  Cl = 1;
  function e({ format: r, minFractionDigits: a, tag: d, value: p }) {
    if (typeof p == "bigint")
      return String(p);
    const c = typeof p == "number" ? p : Number(p);
    if (!isFinite(c))
      return isNaN(c) ? ".nan" : c < 0 ? "-.inf" : ".inf";
    let o = JSON.stringify(p);
    if (!r && a && (!d || d === "tag:yaml.org,2002:float") && /^\d/.test(o)) {
      let u = o.indexOf(".");
      u < 0 && (u = o.length, o += ".");
      let l = a - (o.length - u - 1);
      for (; l-- > 0; )
        o += "0";
    }
    return o;
  }
  return ui.stringifyNumber = e, ui;
}
var Ll;
function vf() {
  if (Ll) return Et;
  Ll = 1;
  var e = le(), r = Lt();
  const a = {
    identify: (c) => typeof c == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (c) => c.slice(-3).toLowerCase() === "nan" ? NaN : c[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
    stringify: r.stringifyNumber
  }, d = {
    identify: (c) => typeof c == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
    resolve: (c) => parseFloat(c),
    stringify(c) {
      const o = Number(c.value);
      return isFinite(o) ? o.toExponential() : r.stringifyNumber(c);
    }
  }, p = {
    identify: (c) => typeof c == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
    resolve(c) {
      const o = new e.Scalar(parseFloat(c)), u = c.indexOf(".");
      return u !== -1 && c[c.length - 1] === "0" && (o.minFractionDigits = c.length - u - 1), o;
    },
    stringify: r.stringifyNumber
  };
  return Et.float = p, Et.floatExp = d, Et.floatNaN = a, Et;
}
var St = {}, jl;
function $f() {
  if (jl) return St;
  jl = 1;
  var e = Lt();
  const r = (u) => typeof u == "bigint" || Number.isInteger(u), a = (u, l, i, { intAsBigInt: t }) => t ? BigInt(u) : parseInt(u.substring(l), i);
  function d(u, l, i) {
    const { value: t } = u;
    return r(t) && t >= 0 ? i + t.toString(l) : e.stringifyNumber(u);
  }
  const p = {
    identify: (u) => r(u) && u >= 0,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^0o[0-7]+$/,
    resolve: (u, l, i) => a(u, 2, 8, i),
    stringify: (u) => d(u, 8, "0o")
  }, c = {
    identify: r,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9]+$/,
    resolve: (u, l, i) => a(u, 0, 10, i),
    stringify: e.stringifyNumber
  }, o = {
    identify: (u) => r(u) && u >= 0,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^0x[0-9a-fA-F]+$/,
    resolve: (u, l, i) => a(u, 2, 16, i),
    stringify: (u) => d(u, 16, "0x")
  };
  return St.int = c, St.intHex = o, St.intOct = p, St;
}
var fi = {}, Ml;
function dy() {
  if (Ml) return fi;
  Ml = 1;
  var e = qt(), r = ra(), a = Ct(), d = bn(), p = gf(), c = vf(), o = $f();
  const u = [
    e.map,
    a.seq,
    d.string,
    r.nullTag,
    p.boolTag,
    o.intOct,
    o.int,
    o.intHex,
    c.floatNaN,
    c.floatExp,
    c.float
  ];
  return fi.schema = u, fi;
}
var di = {}, Dl;
function hy() {
  if (Dl) return di;
  Dl = 1;
  var e = le(), r = qt(), a = Ct();
  function d(l) {
    return typeof l == "bigint" || Number.isInteger(l);
  }
  const p = ({ value: l }) => JSON.stringify(l), c = [
    {
      identify: (l) => typeof l == "string",
      default: !0,
      tag: "tag:yaml.org,2002:str",
      resolve: (l) => l,
      stringify: p
    },
    {
      identify: (l) => l == null,
      createNode: () => new e.Scalar(null),
      default: !0,
      tag: "tag:yaml.org,2002:null",
      test: /^null$/,
      resolve: () => null,
      stringify: p
    },
    {
      identify: (l) => typeof l == "boolean",
      default: !0,
      tag: "tag:yaml.org,2002:bool",
      test: /^true$|^false$/,
      resolve: (l) => l === "true",
      stringify: p
    },
    {
      identify: d,
      default: !0,
      tag: "tag:yaml.org,2002:int",
      test: /^-?(?:0|[1-9][0-9]*)$/,
      resolve: (l, i, { intAsBigInt: t }) => t ? BigInt(l) : parseInt(l, 10),
      stringify: ({ value: l }) => d(l) ? l.toString() : JSON.stringify(l)
    },
    {
      identify: (l) => typeof l == "number",
      default: !0,
      tag: "tag:yaml.org,2002:float",
      test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
      resolve: (l) => parseFloat(l),
      stringify: p
    }
  ], o = {
    default: !0,
    tag: "",
    test: /^/,
    resolve(l, i) {
      return i(`Unresolved plain scalar ${JSON.stringify(l)}`), l;
    }
  }, u = [r.map, a.seq].concat(c, o);
  return di.schema = u, di;
}
var hi = {}, Fl;
function wf() {
  if (Fl) return hi;
  Fl = 1;
  var e = Hf, r = le(), a = $n();
  const d = {
    identify: (p) => p instanceof Uint8Array,
    // Buffer inherits from Uint8Array
    default: !1,
    tag: "tag:yaml.org,2002:binary",
    /**
     * Returns a Buffer in node and an Uint8Array in browsers
     *
     * To use the resulting buffer as an image, you'll want to do something like:
     *
     *   const blob = new Blob([buffer], { type: 'image/jpeg' })
     *   document.querySelector('#photo').src = URL.createObjectURL(blob)
     */
    resolve(p, c) {
      if (typeof e.Buffer == "function")
        return e.Buffer.from(p, "base64");
      if (typeof atob == "function") {
        const o = atob(p.replace(/[\n\r]/g, "")), u = new Uint8Array(o.length);
        for (let l = 0; l < o.length; ++l)
          u[l] = o.charCodeAt(l);
        return u;
      } else
        return c("This environment does not support reading binary tags; either Buffer or atob is required"), p;
    },
    stringify({ comment: p, type: c, value: o }, u, l, i) {
      if (!o)
        return "";
      const t = o;
      let s;
      if (typeof e.Buffer == "function")
        s = t instanceof e.Buffer ? t.toString("base64") : e.Buffer.from(t.buffer).toString("base64");
      else if (typeof btoa == "function") {
        let n = "";
        for (let f = 0; f < t.length; ++f)
          n += String.fromCharCode(t[f]);
        s = btoa(n);
      } else
        throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
      if (c ?? (c = r.Scalar.BLOCK_LITERAL), c !== r.Scalar.QUOTE_DOUBLE) {
        const n = Math.max(u.options.lineWidth - u.indent.length, u.options.minContentWidth), f = Math.ceil(s.length / n), h = new Array(f);
        for (let y = 0, m = 0; y < f; ++y, m += n)
          h[y] = s.substr(m, n);
        s = h.join(c === r.Scalar.BLOCK_LITERAL ? `
` : " ");
      }
      return a.stringifyString({ comment: p, type: c, value: s }, u, l, i);
    }
  };
  return hi.binary = d, hi;
}
var Gr = {}, _t = {}, Vl;
function na() {
  if (Vl) return _t;
  Vl = 1;
  var e = re(), r = We(), a = le(), d = Qe();
  function p(u, l) {
    if (e.isSeq(u))
      for (let i = 0; i < u.items.length; ++i) {
        let t = u.items[i];
        if (!e.isPair(t)) {
          if (e.isMap(t)) {
            t.items.length > 1 && l("Each pair must have its own sequence indicator");
            const s = t.items[0] || new r.Pair(new a.Scalar(null));
            if (t.commentBefore && (s.key.commentBefore = s.key.commentBefore ? `${t.commentBefore}
${s.key.commentBefore}` : t.commentBefore), t.comment) {
              const n = s.value ?? s.key;
              n.comment = n.comment ? `${t.comment}
${n.comment}` : t.comment;
            }
            t = s;
          }
          u.items[i] = e.isPair(t) ? t : new r.Pair(t);
        }
      }
    else
      l("Expected a sequence for this tag");
    return u;
  }
  function c(u, l, i) {
    const { replacer: t } = i, s = new d.YAMLSeq(u);
    s.tag = "tag:yaml.org,2002:pairs";
    let n = 0;
    if (l && Symbol.iterator in Object(l))
      for (let f of l) {
        typeof t == "function" && (f = t.call(l, String(n++), f));
        let h, y;
        if (Array.isArray(f))
          if (f.length === 2)
            h = f[0], y = f[1];
          else
            throw new TypeError(`Expected [key, value] tuple: ${f}`);
        else if (f && f instanceof Object) {
          const m = Object.keys(f);
          if (m.length === 1)
            h = m[0], y = f[h];
          else
            throw new TypeError(`Expected tuple with one key, not ${m.length} keys`);
        } else
          h = f;
        s.items.push(r.createPair(h, y, i));
      }
    return s;
  }
  const o = {
    collection: "seq",
    default: !1,
    tag: "tag:yaml.org,2002:pairs",
    resolve: p,
    createNode: c
  };
  return _t.createPairs = c, _t.pairs = o, _t.resolvePairs = p, _t;
}
var Ul;
function bf() {
  if (Ul) return Gr;
  Ul = 1;
  var e = re(), r = Je(), a = Xe(), d = Qe(), p = na();
  class c extends d.YAMLSeq {
    constructor() {
      super(), this.add = a.YAMLMap.prototype.add.bind(this), this.delete = a.YAMLMap.prototype.delete.bind(this), this.get = a.YAMLMap.prototype.get.bind(this), this.has = a.YAMLMap.prototype.has.bind(this), this.set = a.YAMLMap.prototype.set.bind(this), this.tag = c.tag;
    }
    /**
     * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
     * but TypeScript won't allow widening the signature of a child method.
     */
    toJSON(l, i) {
      if (!i)
        return super.toJSON(l);
      const t = /* @__PURE__ */ new Map();
      i?.onCreate && i.onCreate(t);
      for (const s of this.items) {
        let n, f;
        if (e.isPair(s) ? (n = r.toJS(s.key, "", i), f = r.toJS(s.value, n, i)) : n = r.toJS(s, "", i), t.has(n))
          throw new Error("Ordered maps must not include duplicate keys");
        t.set(n, f);
      }
      return t;
    }
    static from(l, i, t) {
      const s = p.createPairs(l, i, t), n = new this();
      return n.items = s.items, n;
    }
  }
  c.tag = "tag:yaml.org,2002:omap";
  const o = {
    collection: "seq",
    identify: (u) => u instanceof Map,
    nodeClass: c,
    default: !1,
    tag: "tag:yaml.org,2002:omap",
    resolve(u, l) {
      const i = p.resolvePairs(u, l), t = [];
      for (const { key: s } of i.items)
        e.isScalar(s) && (t.includes(s.value) ? l(`Ordered maps must not include duplicate keys: ${s.value}`) : t.push(s.value));
      return Object.assign(new c(), i);
    },
    createNode: (u, l, i) => c.from(u, l, i)
  };
  return Gr.YAMLOMap = c, Gr.omap = o, Gr;
}
var pi = {}, xr = {}, Bl;
function py() {
  if (Bl) return xr;
  Bl = 1;
  var e = le();
  function r({ value: p, source: c }, o) {
    return c && (p ? a : d).test.test(c) ? c : p ? o.options.trueStr : o.options.falseStr;
  }
  const a = {
    identify: (p) => p === !0,
    default: !0,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
    resolve: () => new e.Scalar(!0),
    stringify: r
  }, d = {
    identify: (p) => p === !1,
    default: !0,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
    resolve: () => new e.Scalar(!1),
    stringify: r
  };
  return xr.falseTag = d, xr.trueTag = a, xr;
}
var Nt = {}, Kl;
function my() {
  if (Kl) return Nt;
  Kl = 1;
  var e = le(), r = Lt();
  const a = {
    identify: (c) => typeof c == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (c) => c.slice(-3).toLowerCase() === "nan" ? NaN : c[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
    stringify: r.stringifyNumber
  }, d = {
    identify: (c) => typeof c == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
    resolve: (c) => parseFloat(c.replace(/_/g, "")),
    stringify(c) {
      const o = Number(c.value);
      return isFinite(o) ? o.toExponential() : r.stringifyNumber(c);
    }
  }, p = {
    identify: (c) => typeof c == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
    resolve(c) {
      const o = new e.Scalar(parseFloat(c.replace(/_/g, ""))), u = c.indexOf(".");
      if (u !== -1) {
        const l = c.substring(u + 1).replace(/_/g, "");
        l[l.length - 1] === "0" && (o.minFractionDigits = l.length);
      }
      return o;
    },
    stringify: r.stringifyNumber
  };
  return Nt.float = p, Nt.floatExp = d, Nt.floatNaN = a, Nt;
}
var ct = {}, zl;
function yy() {
  if (zl) return ct;
  zl = 1;
  var e = Lt();
  const r = (l) => typeof l == "bigint" || Number.isInteger(l);
  function a(l, i, t, { intAsBigInt: s }) {
    const n = l[0];
    if ((n === "-" || n === "+") && (i += 1), l = l.substring(i).replace(/_/g, ""), s) {
      switch (t) {
        case 2:
          l = `0b${l}`;
          break;
        case 8:
          l = `0o${l}`;
          break;
        case 16:
          l = `0x${l}`;
          break;
      }
      const h = BigInt(l);
      return n === "-" ? BigInt(-1) * h : h;
    }
    const f = parseInt(l, t);
    return n === "-" ? -1 * f : f;
  }
  function d(l, i, t) {
    const { value: s } = l;
    if (r(s)) {
      const n = s.toString(i);
      return s < 0 ? "-" + t + n.substr(1) : t + n;
    }
    return e.stringifyNumber(l);
  }
  const p = {
    identify: r,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "BIN",
    test: /^[-+]?0b[0-1_]+$/,
    resolve: (l, i, t) => a(l, 2, 2, t),
    stringify: (l) => d(l, 2, "0b")
  }, c = {
    identify: r,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^[-+]?0[0-7_]+$/,
    resolve: (l, i, t) => a(l, 1, 8, t),
    stringify: (l) => d(l, 8, "0")
  }, o = {
    identify: r,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9][0-9_]*$/,
    resolve: (l, i, t) => a(l, 0, 10, t),
    stringify: e.stringifyNumber
  }, u = {
    identify: r,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^[-+]?0x[0-9a-fA-F_]+$/,
    resolve: (l, i, t) => a(l, 2, 16, t),
    stringify: (l) => d(l, 16, "0x")
  };
  return ct.int = o, ct.intBin = p, ct.intHex = u, ct.intOct = c, ct;
}
var Yr = {}, Gl;
function Ef() {
  if (Gl) return Yr;
  Gl = 1;
  var e = re(), r = We(), a = Xe();
  class d extends a.YAMLMap {
    constructor(o) {
      super(o), this.tag = d.tag;
    }
    add(o) {
      let u;
      e.isPair(o) ? u = o : o && typeof o == "object" && "key" in o && "value" in o && o.value === null ? u = new r.Pair(o.key, null) : u = new r.Pair(o, null), a.findPair(this.items, u.key) || this.items.push(u);
    }
    /**
     * If `keepPair` is `true`, returns the Pair matching `key`.
     * Otherwise, returns the value of that Pair's key.
     */
    get(o, u) {
      const l = a.findPair(this.items, o);
      return !u && e.isPair(l) ? e.isScalar(l.key) ? l.key.value : l.key : l;
    }
    set(o, u) {
      if (typeof u != "boolean")
        throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof u}`);
      const l = a.findPair(this.items, o);
      l && !u ? this.items.splice(this.items.indexOf(l), 1) : !l && u && this.items.push(new r.Pair(o));
    }
    toJSON(o, u) {
      return super.toJSON(o, u, Set);
    }
    toString(o, u, l) {
      if (!o)
        return JSON.stringify(this);
      if (this.hasAllNullValues(!0))
        return super.toString(Object.assign({}, o, { allNullValues: !0 }), u, l);
      throw new Error("Set items must all have null values");
    }
    static from(o, u, l) {
      const { replacer: i } = l, t = new this(o);
      if (u && Symbol.iterator in Object(u))
        for (let s of u)
          typeof i == "function" && (s = i.call(u, s, s)), t.items.push(r.createPair(s, null, l));
      return t;
    }
  }
  d.tag = "tag:yaml.org,2002:set";
  const p = {
    collection: "map",
    identify: (c) => c instanceof Set,
    nodeClass: d,
    default: !1,
    tag: "tag:yaml.org,2002:set",
    createNode: (c, o, u) => d.from(c, o, u),
    resolve(c, o) {
      if (e.isMap(c)) {
        if (c.hasAllNullValues(!0))
          return Object.assign(new d(), c);
        o("Set items must all have null values");
      } else
        o("Expected a mapping for this tag");
      return c;
    }
  };
  return Yr.YAMLSet = d, Yr.set = p, Yr;
}
var Rt = {}, xl;
function Sf() {
  if (xl) return Rt;
  xl = 1;
  var e = Lt();
  function r(o, u) {
    const l = o[0], i = l === "-" || l === "+" ? o.substring(1) : o, t = (n) => u ? BigInt(n) : Number(n), s = i.replace(/_/g, "").split(":").reduce((n, f) => n * t(60) + t(f), t(0));
    return l === "-" ? t(-1) * s : s;
  }
  function a(o) {
    let { value: u } = o, l = (n) => n;
    if (typeof u == "bigint")
      l = (n) => BigInt(n);
    else if (isNaN(u) || !isFinite(u))
      return e.stringifyNumber(o);
    let i = "";
    u < 0 && (i = "-", u *= l(-1));
    const t = l(60), s = [u % t];
    return u < 60 ? s.unshift(0) : (u = (u - s[0]) / t, s.unshift(u % t), u >= 60 && (u = (u - s[0]) / t, s.unshift(u))), i + s.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
  }
  const d = {
    identify: (o) => typeof o == "bigint" || Number.isInteger(o),
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
    resolve: (o, u, { intAsBigInt: l }) => r(o, l),
    stringify: a
  }, p = {
    identify: (o) => typeof o == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
    resolve: (o) => r(o, !1),
    stringify: a
  }, c = {
    identify: (o) => o instanceof Date,
    default: !0,
    tag: "tag:yaml.org,2002:timestamp",
    // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
    // may be omitted altogether, resulting in a date format. In such a case, the time part is
    // assumed to be 00:00:00Z (start of day, UTC).
    test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
    resolve(o) {
      const u = o.match(c.test);
      if (!u)
        throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
      const [, l, i, t, s, n, f] = u.map(Number), h = u[7] ? Number((u[7] + "00").substr(1, 3)) : 0;
      let y = Date.UTC(l, i - 1, t, s || 0, n || 0, f || 0, h);
      const m = u[8];
      if (m && m !== "Z") {
        let g = r(m, !1);
        Math.abs(g) < 30 && (g *= 60), y -= 6e4 * g;
      }
      return new Date(y);
    },
    stringify: ({ value: o }) => o?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
  };
  return Rt.floatTime = p, Rt.intTime = d, Rt.timestamp = c, Rt;
}
var Yl;
function gy() {
  if (Yl) return pi;
  Yl = 1;
  var e = qt(), r = ra(), a = Ct(), d = bn(), p = wf(), c = py(), o = my(), u = yy(), l = ta(), i = bf(), t = na(), s = Ef(), n = Sf();
  const f = [
    e.map,
    a.seq,
    d.string,
    r.nullTag,
    c.trueTag,
    c.falseTag,
    u.intBin,
    u.intOct,
    u.int,
    u.intHex,
    o.floatNaN,
    o.floatExp,
    o.float,
    p.binary,
    l.merge,
    i.omap,
    t.pairs,
    s.set,
    n.intTime,
    n.floatTime,
    n.timestamp
  ];
  return pi.schema = f, pi;
}
var Hl;
function vy() {
  if (Hl) return zr;
  Hl = 1;
  var e = qt(), r = ra(), a = Ct(), d = bn(), p = gf(), c = vf(), o = $f(), u = dy(), l = hy(), i = wf(), t = ta(), s = bf(), n = na(), f = gy(), h = Ef(), y = Sf();
  const m = /* @__PURE__ */ new Map([
    ["core", u.schema],
    ["failsafe", [e.map, a.seq, d.string]],
    ["json", l.schema],
    ["yaml11", f.schema],
    ["yaml-1.1", f.schema]
  ]), g = {
    binary: i.binary,
    bool: p.boolTag,
    float: c.float,
    floatExp: c.floatExp,
    floatNaN: c.floatNaN,
    floatTime: y.floatTime,
    int: o.int,
    intHex: o.intHex,
    intOct: o.intOct,
    intTime: y.intTime,
    map: e.map,
    merge: t.merge,
    null: r.nullTag,
    omap: s.omap,
    pairs: n.pairs,
    seq: a.seq,
    set: h.set,
    timestamp: y.timestamp
  }, v = {
    "tag:yaml.org,2002:binary": i.binary,
    "tag:yaml.org,2002:merge": t.merge,
    "tag:yaml.org,2002:omap": s.omap,
    "tag:yaml.org,2002:pairs": n.pairs,
    "tag:yaml.org,2002:set": h.set,
    "tag:yaml.org,2002:timestamp": y.timestamp
  };
  function w(b, $, E) {
    const S = m.get($);
    if (S && !b)
      return E && !S.includes(t.merge) ? S.concat(t.merge) : S.slice();
    let N = S;
    if (!N)
      if (Array.isArray(b))
        N = [];
      else {
        const P = Array.from(m.keys()).filter((j) => j !== "yaml11").map((j) => JSON.stringify(j)).join(", ");
        throw new Error(`Unknown schema "${$}"; use one of ${P} or define customTags array`);
      }
    if (Array.isArray(b))
      for (const P of b)
        N = N.concat(P);
    else typeof b == "function" && (N = b(N.slice()));
    return E && (N = N.concat(t.merge)), N.reduce((P, j) => {
      const A = typeof j == "string" ? g[j] : j;
      if (!A) {
        const V = JSON.stringify(j), z = Object.keys(g).map((q) => JSON.stringify(q)).join(", ");
        throw new Error(`Unknown custom tag ${V}; use one of ${z}`);
      }
      return P.includes(A) || P.push(A), P;
    }, []);
  }
  return zr.coreKnownTags = v, zr.getTags = w, zr;
}
var Jl;
function Nf() {
  if (Jl) return ri;
  Jl = 1;
  var e = re(), r = qt(), a = Ct(), d = bn(), p = vy();
  const c = (u, l) => u.key < l.key ? -1 : u.key > l.key ? 1 : 0;
  let o = class _f {
    constructor({ compat: l, customTags: i, merge: t, resolveKnownTags: s, schema: n, sortMapEntries: f, toStringDefaults: h }) {
      this.compat = Array.isArray(l) ? p.getTags(l, "compat") : l ? p.getTags(null, l) : null, this.name = typeof n == "string" && n || "core", this.knownTags = s ? p.coreKnownTags : {}, this.tags = p.getTags(i, this.name, t), this.toStringOptions = h ?? null, Object.defineProperty(this, e.MAP, { value: r.map }), Object.defineProperty(this, e.SCALAR, { value: d.string }), Object.defineProperty(this, e.SEQ, { value: a.seq }), this.sortMapEntries = typeof f == "function" ? f : f === !0 ? c : null;
    }
    clone() {
      const l = Object.create(_f.prototype, Object.getOwnPropertyDescriptors(this));
      return l.tags = this.tags.slice(), l;
    }
  };
  return ri.Schema = o, ri;
}
var mi = {}, Wl;
function $y() {
  if (Wl) return mi;
  Wl = 1;
  var e = re(), r = wn(), a = vn();
  function d(p, c) {
    const o = [];
    let u = c.directives === !0;
    if (c.directives !== !1 && p.directives) {
      const n = p.directives.toString(p);
      n ? (o.push(n), u = !0) : p.directives.docStart && (u = !0);
    }
    u && o.push("---");
    const l = r.createStringifyContext(p, c), { commentString: i } = l.options;
    if (p.commentBefore) {
      o.length !== 1 && o.unshift("");
      const n = i(p.commentBefore);
      o.unshift(a.indentComment(n, ""));
    }
    let t = !1, s = null;
    if (p.contents) {
      if (e.isNode(p.contents)) {
        if (p.contents.spaceBefore && u && o.push(""), p.contents.commentBefore) {
          const h = i(p.contents.commentBefore);
          o.push(a.indentComment(h, ""));
        }
        l.forceBlockIndent = !!p.comment, s = p.contents.comment;
      }
      const n = s ? void 0 : () => t = !0;
      let f = r.stringify(p.contents, l, () => s = null, n);
      s && (f += a.lineComment(f, "", i(s))), (f[0] === "|" || f[0] === ">") && o[o.length - 1] === "---" ? o[o.length - 1] = `--- ${f}` : o.push(f);
    } else
      o.push(r.stringify(p.contents, l));
    if (p.directives?.docEnd)
      if (p.comment) {
        const n = i(p.comment);
        n.includes(`
`) ? (o.push("..."), o.push(a.indentComment(n, ""))) : o.push(`... ${n}`);
      } else
        o.push("...");
    else {
      let n = p.comment;
      n && t && (n = n.replace(/^\n+/, "")), n && ((!t || s) && o[o.length - 1] !== "" && o.push(""), o.push(a.indentComment(i(n), "")));
    }
    return o.join(`
`) + `
`;
  }
  return mi.stringifyDocument = d, mi;
}
var Xl;
function En() {
  if (Xl) return Ys;
  Xl = 1;
  var e = yn(), r = ea(), a = re(), d = We(), p = Je(), c = Nf(), o = $y(), u = Qi(), l = df(), i = gn(), t = ff();
  let s = class Rf {
    constructor(h, y, m) {
      this.commentBefore = null, this.comment = null, this.errors = [], this.warnings = [], Object.defineProperty(this, a.NODE_TYPE, { value: a.DOC });
      let g = null;
      typeof y == "function" || Array.isArray(y) ? g = y : m === void 0 && y && (m = y, y = void 0);
      const v = Object.assign({
        intAsBigInt: !1,
        keepSourceTokens: !1,
        logLevel: "warn",
        prettyErrors: !0,
        strict: !0,
        stringKeys: !1,
        uniqueKeys: !0,
        version: "1.2"
      }, m);
      this.options = v;
      let { version: w } = v;
      m?._directives ? (this.directives = m._directives.atDocument(), this.directives.yaml.explicit && (w = this.directives.yaml.version)) : this.directives = new t.Directives({ version: w }), this.setSchema(w, m), this.contents = h === void 0 ? null : this.createNode(h, g, m);
    }
    /**
     * Create a deep copy of this Document and its contents.
     *
     * Custom Node values that inherit from `Object` still refer to their original instances.
     */
    clone() {
      const h = Object.create(Rf.prototype, {
        [a.NODE_TYPE]: { value: a.DOC }
      });
      return h.commentBefore = this.commentBefore, h.comment = this.comment, h.errors = this.errors.slice(), h.warnings = this.warnings.slice(), h.options = Object.assign({}, this.options), this.directives && (h.directives = this.directives.clone()), h.schema = this.schema.clone(), h.contents = a.isNode(this.contents) ? this.contents.clone(h.schema) : this.contents, this.range && (h.range = this.range.slice()), h;
    }
    /** Adds a value to the document. */
    add(h) {
      n(this.contents) && this.contents.add(h);
    }
    /** Adds a value to the document. */
    addIn(h, y) {
      n(this.contents) && this.contents.addIn(h, y);
    }
    /**
     * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
     *
     * If `node` already has an anchor, `name` is ignored.
     * Otherwise, the `node.anchor` value will be set to `name`,
     * or if an anchor with that name is already present in the document,
     * `name` will be used as a prefix for a new unique anchor.
     * If `name` is undefined, the generated anchor will use 'a' as a prefix.
     */
    createAlias(h, y) {
      if (!h.anchor) {
        const m = u.anchorNames(this);
        h.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        !y || m.has(y) ? u.findNewAnchor(y || "a", m) : y;
      }
      return new e.Alias(h.anchor);
    }
    createNode(h, y, m) {
      let g;
      if (typeof y == "function")
        h = y.call({ "": h }, "", h), g = y;
      else if (Array.isArray(y)) {
        const z = (D) => typeof D == "number" || D instanceof String || D instanceof Number, q = y.filter(z).map(String);
        q.length > 0 && (y = y.concat(q)), g = y;
      } else m === void 0 && y && (m = y, y = void 0);
      const { aliasDuplicateObjects: v, anchorPrefix: w, flow: b, keepUndefined: $, onTagObj: E, tag: S } = m ?? {}, { onAnchor: N, setAnchors: P, sourceObjects: j } = u.createNodeAnchors(
        this,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        w || "a"
      ), A = {
        aliasDuplicateObjects: v ?? !0,
        keepUndefined: $ ?? !1,
        onAnchor: N,
        onTagObj: E,
        replacer: g,
        schema: this.schema,
        sourceObjects: j
      }, V = i.createNode(h, S, A);
      return b && a.isCollection(V) && (V.flow = !0), P(), V;
    }
    /**
     * Convert a key and a value into a `Pair` using the current schema,
     * recursively wrapping all values as `Scalar` or `Collection` nodes.
     */
    createPair(h, y, m = {}) {
      const g = this.createNode(h, null, m), v = this.createNode(y, null, m);
      return new d.Pair(g, v);
    }
    /**
     * Removes a value from the document.
     * @returns `true` if the item was found and removed.
     */
    delete(h) {
      return n(this.contents) ? this.contents.delete(h) : !1;
    }
    /**
     * Removes a value from the document.
     * @returns `true` if the item was found and removed.
     */
    deleteIn(h) {
      return r.isEmptyPath(h) ? this.contents == null ? !1 : (this.contents = null, !0) : n(this.contents) ? this.contents.deleteIn(h) : !1;
    }
    /**
     * Returns item at `key`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    get(h, y) {
      return a.isCollection(this.contents) ? this.contents.get(h, y) : void 0;
    }
    /**
     * Returns item at `path`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    getIn(h, y) {
      return r.isEmptyPath(h) ? !y && a.isScalar(this.contents) ? this.contents.value : this.contents : a.isCollection(this.contents) ? this.contents.getIn(h, y) : void 0;
    }
    /**
     * Checks if the document includes a value with the key `key`.
     */
    has(h) {
      return a.isCollection(this.contents) ? this.contents.has(h) : !1;
    }
    /**
     * Checks if the document includes a value at `path`.
     */
    hasIn(h) {
      return r.isEmptyPath(h) ? this.contents !== void 0 : a.isCollection(this.contents) ? this.contents.hasIn(h) : !1;
    }
    /**
     * Sets a value in this document. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    set(h, y) {
      this.contents == null ? this.contents = r.collectionFromPath(this.schema, [h], y) : n(this.contents) && this.contents.set(h, y);
    }
    /**
     * Sets a value in this document. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    setIn(h, y) {
      r.isEmptyPath(h) ? this.contents = y : this.contents == null ? this.contents = r.collectionFromPath(this.schema, Array.from(h), y) : n(this.contents) && this.contents.setIn(h, y);
    }
    /**
     * Change the YAML version and schema used by the document.
     * A `null` version disables support for directives, explicit tags, anchors, and aliases.
     * It also requires the `schema` option to be given as a `Schema` instance value.
     *
     * Overrides all previously set schema options.
     */
    setSchema(h, y = {}) {
      typeof h == "number" && (h = String(h));
      let m;
      switch (h) {
        case "1.1":
          this.directives ? this.directives.yaml.version = "1.1" : this.directives = new t.Directives({ version: "1.1" }), m = { resolveKnownTags: !1, schema: "yaml-1.1" };
          break;
        case "1.2":
        case "next":
          this.directives ? this.directives.yaml.version = h : this.directives = new t.Directives({ version: h }), m = { resolveKnownTags: !0, schema: "core" };
          break;
        case null:
          this.directives && delete this.directives, m = null;
          break;
        default: {
          const g = JSON.stringify(h);
          throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${g}`);
        }
      }
      if (y.schema instanceof Object)
        this.schema = y.schema;
      else if (m)
        this.schema = new c.Schema(Object.assign(m, y));
      else
        throw new Error("With a null YAML version, the { schema: Schema } option is required");
    }
    // json & jsonArg are only used from toJSON()
    toJS({ json: h, jsonArg: y, mapAsMap: m, maxAliasCount: g, onAnchor: v, reviver: w } = {}) {
      const b = {
        anchors: /* @__PURE__ */ new Map(),
        doc: this,
        keep: !h,
        mapAsMap: m === !0,
        mapKeyWarned: !1,
        maxAliasCount: typeof g == "number" ? g : 100
      }, $ = p.toJS(this.contents, y ?? "", b);
      if (typeof v == "function")
        for (const { count: E, res: S } of b.anchors.values())
          v(S, E);
      return typeof w == "function" ? l.applyReviver(w, { "": $ }, "", $) : $;
    }
    /**
     * A JSON representation of the document `contents`.
     *
     * @param jsonArg Used by `JSON.stringify` to indicate the array index or
     *   property name.
     */
    toJSON(h, y) {
      return this.toJS({ json: !0, jsonArg: h, mapAsMap: !1, onAnchor: y });
    }
    /** A YAML representation of the document. */
    toString(h = {}) {
      if (this.errors.length > 0)
        throw new Error("Document with errors cannot be stringified");
      if ("indent" in h && (!Number.isInteger(h.indent) || Number(h.indent) <= 0)) {
        const y = JSON.stringify(h.indent);
        throw new Error(`"indent" option must be a positive integer, not ${y}`);
      }
      return o.stringifyDocument(this, h);
    }
  };
  function n(f) {
    if (a.isCollection(f))
      return !0;
    throw new Error("Expected a YAML collection as document contents");
  }
  return Ys.Document = s, Ys;
}
var lt = {}, Ql;
function Sn() {
  if (Ql) return lt;
  Ql = 1;
  class e extends Error {
    constructor(c, o, u, l) {
      super(), this.name = c, this.code = u, this.message = l, this.pos = o;
    }
  }
  class r extends e {
    constructor(c, o, u) {
      super("YAMLParseError", c, o, u);
    }
  }
  class a extends e {
    constructor(c, o, u) {
      super("YAMLWarning", c, o, u);
    }
  }
  const d = (p, c) => (o) => {
    if (o.pos[0] === -1)
      return;
    o.linePos = o.pos.map((s) => c.linePos(s));
    const { line: u, col: l } = o.linePos[0];
    o.message += ` at line ${u}, column ${l}`;
    let i = l - 1, t = p.substring(c.lineStarts[u - 1], c.lineStarts[u]).replace(/[\n\r]+$/, "");
    if (i >= 60 && t.length > 80) {
      const s = Math.min(i - 39, t.length - 79);
      t = "…" + t.substring(s), i -= s - 1;
    }
    if (t.length > 80 && (t = t.substring(0, 79) + "…"), u > 1 && /^ *$/.test(t.substring(0, i))) {
      let s = p.substring(c.lineStarts[u - 2], c.lineStarts[u - 1]);
      s.length > 80 && (s = s.substring(0, 79) + `…
`), t = s + t;
    }
    if (/[^ ]/.test(t)) {
      let s = 1;
      const n = o.linePos[1];
      n && n.line === u && n.col > l && (s = Math.max(1, Math.min(n.col - l, 80 - i)));
      const f = " ".repeat(i) + "^".repeat(s);
      o.message += `:

${t}
${f}
`;
    }
  };
  return lt.YAMLError = e, lt.YAMLParseError = r, lt.YAMLWarning = a, lt.prettifyError = d, lt;
}
var yi = {}, Hr = {}, gi = {}, vi = {}, $i = {}, Zl;
function _n() {
  if (Zl) return $i;
  Zl = 1;
  function e(r, { flow: a, indicator: d, next: p, offset: c, onError: o, parentIndent: u, startOnNewline: l }) {
    let i = !1, t = l, s = l, n = "", f = "", h = !1, y = !1, m = null, g = null, v = null, w = null, b = null, $ = null, E = null;
    for (const P of r)
      switch (y && (P.type !== "space" && P.type !== "newline" && P.type !== "comma" && o(P.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space"), y = !1), m && (t && P.type !== "comment" && P.type !== "newline" && o(m, "TAB_AS_INDENT", "Tabs are not allowed as indentation"), m = null), P.type) {
        case "space":
          !a && (d !== "doc-start" || p?.type !== "flow-collection") && P.source.includes("	") && (m = P), s = !0;
          break;
        case "comment": {
          s || o(P, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
          const j = P.source.substring(1) || " ";
          n ? n += f + j : n = j, f = "", t = !1;
          break;
        }
        case "newline":
          t ? n ? n += P.source : (!$ || d !== "seq-item-ind") && (i = !0) : f += P.source, t = !0, h = !0, (g || v) && (w = P), s = !0;
          break;
        case "anchor":
          g && o(P, "MULTIPLE_ANCHORS", "A node can have at most one anchor"), P.source.endsWith(":") && o(P.offset + P.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", !0), g = P, E ?? (E = P.offset), t = !1, s = !1, y = !0;
          break;
        case "tag": {
          v && o(P, "MULTIPLE_TAGS", "A node can have at most one tag"), v = P, E ?? (E = P.offset), t = !1, s = !1, y = !0;
          break;
        }
        case d:
          (g || v) && o(P, "BAD_PROP_ORDER", `Anchors and tags must be after the ${P.source} indicator`), $ && o(P, "UNEXPECTED_TOKEN", `Unexpected ${P.source} in ${a ?? "collection"}`), $ = P, t = d === "seq-item-ind" || d === "explicit-key-ind", s = !1;
          break;
        case "comma":
          if (a) {
            b && o(P, "UNEXPECTED_TOKEN", `Unexpected , in ${a}`), b = P, t = !1, s = !1;
            break;
          }
        // else fallthrough
        default:
          o(P, "UNEXPECTED_TOKEN", `Unexpected ${P.type} token`), t = !1, s = !1;
      }
    const S = r[r.length - 1], N = S ? S.offset + S.source.length : c;
    return y && p && p.type !== "space" && p.type !== "newline" && p.type !== "comma" && (p.type !== "scalar" || p.source !== "") && o(p.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space"), m && (t && m.indent <= u || p?.type === "block-map" || p?.type === "block-seq") && o(m, "TAB_AS_INDENT", "Tabs are not allowed as indentation"), {
      comma: b,
      found: $,
      spaceBefore: i,
      comment: n,
      hasNewline: h,
      anchor: g,
      tag: v,
      newlineAfterProp: w,
      end: N,
      start: E ?? N
    };
  }
  return $i.resolveProps = e, $i;
}
var wi = {}, eu;
function sa() {
  if (eu) return wi;
  eu = 1;
  function e(r) {
    if (!r)
      return null;
    switch (r.type) {
      case "alias":
      case "scalar":
      case "double-quoted-scalar":
      case "single-quoted-scalar":
        if (r.source.includes(`
`))
          return !0;
        if (r.end) {
          for (const a of r.end)
            if (a.type === "newline")
              return !0;
        }
        return !1;
      case "flow-collection":
        for (const a of r.items) {
          for (const d of a.start)
            if (d.type === "newline")
              return !0;
          if (a.sep) {
            for (const d of a.sep)
              if (d.type === "newline")
                return !0;
          }
          if (e(a.key) || e(a.value))
            return !0;
        }
        return !1;
      default:
        return !0;
    }
  }
  return wi.containsNewline = e, wi;
}
var bi = {}, tu;
function Of() {
  if (tu) return bi;
  tu = 1;
  var e = sa();
  function r(a, d, p) {
    if (d?.type === "flow-collection") {
      const c = d.end[0];
      c.indent === a && (c.source === "]" || c.source === "}") && e.containsNewline(d) && p(c, "BAD_INDENT", "Flow end indicator should be more indented than parent", !0);
    }
  }
  return bi.flowIndentCheck = r, bi;
}
var Ei = {}, ru;
function Pf() {
  if (ru) return Ei;
  ru = 1;
  var e = re();
  function r(a, d, p) {
    const { uniqueKeys: c } = a.options;
    if (c === !1)
      return !1;
    const o = typeof c == "function" ? c : (u, l) => u === l || e.isScalar(u) && e.isScalar(l) && u.value === l.value;
    return d.some((u) => o(u.key, p));
  }
  return Ei.mapIncludes = r, Ei;
}
var nu;
function wy() {
  if (nu) return vi;
  nu = 1;
  var e = We(), r = Xe(), a = _n(), d = sa(), p = Of(), c = Pf();
  const o = "All mapping items must start at the same column";
  function u({ composeNode: l, composeEmptyNode: i }, t, s, n, f) {
    const h = f?.nodeClass ?? r.YAMLMap, y = new h(t.schema);
    t.atRoot && (t.atRoot = !1);
    let m = s.offset, g = null;
    for (const v of s.items) {
      const { start: w, key: b, sep: $, value: E } = v, S = a.resolveProps(w, {
        indicator: "explicit-key-ind",
        next: b ?? $?.[0],
        offset: m,
        onError: n,
        parentIndent: s.indent,
        startOnNewline: !0
      }), N = !S.found;
      if (N) {
        if (b && (b.type === "block-seq" ? n(m, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key") : "indent" in b && b.indent !== s.indent && n(m, "BAD_INDENT", o)), !S.anchor && !S.tag && !$) {
          g = S.end, S.comment && (y.comment ? y.comment += `
` + S.comment : y.comment = S.comment);
          continue;
        }
        (S.newlineAfterProp || d.containsNewline(b)) && n(b ?? w[w.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
      } else S.found?.indent !== s.indent && n(m, "BAD_INDENT", o);
      t.atKey = !0;
      const P = S.end, j = b ? l(t, b, S, n) : i(t, P, w, null, S, n);
      t.schema.compat && p.flowIndentCheck(s.indent, b, n), t.atKey = !1, c.mapIncludes(t, y.items, j) && n(P, "DUPLICATE_KEY", "Map keys must be unique");
      const A = a.resolveProps($ ?? [], {
        indicator: "map-value-ind",
        next: E,
        offset: j.range[2],
        onError: n,
        parentIndent: s.indent,
        startOnNewline: !b || b.type === "block-scalar"
      });
      if (m = A.end, A.found) {
        N && (E?.type === "block-map" && !A.hasNewline && n(m, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings"), t.options.strict && S.start < A.found.offset - 1024 && n(j.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key"));
        const V = E ? l(t, E, A, n) : i(t, m, $, null, A, n);
        t.schema.compat && p.flowIndentCheck(s.indent, E, n), m = V.range[2];
        const z = new e.Pair(j, V);
        t.options.keepSourceTokens && (z.srcToken = v), y.items.push(z);
      } else {
        N && n(j.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values"), A.comment && (j.comment ? j.comment += `
` + A.comment : j.comment = A.comment);
        const V = new e.Pair(j);
        t.options.keepSourceTokens && (V.srcToken = v), y.items.push(V);
      }
    }
    return g && g < m && n(g, "IMPOSSIBLE", "Map comment with trailing content"), y.range = [s.offset, m, g ?? m], y;
  }
  return vi.resolveBlockMap = u, vi;
}
var Si = {}, su;
function by() {
  if (su) return Si;
  su = 1;
  var e = Qe(), r = _n(), a = Of();
  function d({ composeNode: p, composeEmptyNode: c }, o, u, l, i) {
    const t = i?.nodeClass ?? e.YAMLSeq, s = new t(o.schema);
    o.atRoot && (o.atRoot = !1), o.atKey && (o.atKey = !1);
    let n = u.offset, f = null;
    for (const { start: h, value: y } of u.items) {
      const m = r.resolveProps(h, {
        indicator: "seq-item-ind",
        next: y,
        offset: n,
        onError: l,
        parentIndent: u.indent,
        startOnNewline: !0
      });
      if (!m.found)
        if (m.anchor || m.tag || y)
          y && y.type === "block-seq" ? l(m.end, "BAD_INDENT", "All sequence items must start at the same column") : l(n, "MISSING_CHAR", "Sequence item without - indicator");
        else {
          f = m.end, m.comment && (s.comment = m.comment);
          continue;
        }
      const g = y ? p(o, y, m, l) : c(o, m.end, h, null, m, l);
      o.schema.compat && a.flowIndentCheck(u.indent, y, l), n = g.range[2], s.items.push(g);
    }
    return s.range = [u.offset, n, f ?? n], s;
  }
  return Si.resolveBlockSeq = d, Si;
}
var _i = {}, Ni = {}, iu;
function jt() {
  if (iu) return Ni;
  iu = 1;
  function e(r, a, d, p) {
    let c = "";
    if (r) {
      let o = !1, u = "";
      for (const l of r) {
        const { source: i, type: t } = l;
        switch (t) {
          case "space":
            o = !0;
            break;
          case "comment": {
            d && !o && p(l, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const s = i.substring(1) || " ";
            c ? c += u + s : c = s, u = "";
            break;
          }
          case "newline":
            c && (u += i), o = !0;
            break;
          default:
            p(l, "UNEXPECTED_TOKEN", `Unexpected ${t} at node end`);
        }
        a += i.length;
      }
    }
    return { comment: c, offset: a };
  }
  return Ni.resolveEnd = e, Ni;
}
var au;
function Ey() {
  if (au) return _i;
  au = 1;
  var e = re(), r = We(), a = Xe(), d = Qe(), p = jt(), c = _n(), o = sa(), u = Pf();
  const l = "Block collections are not allowed within flow collections", i = (s) => s && (s.type === "block-map" || s.type === "block-seq");
  function t({ composeNode: s, composeEmptyNode: n }, f, h, y, m) {
    const g = h.start.source === "{", v = g ? "flow map" : "flow sequence", w = m?.nodeClass ?? (g ? a.YAMLMap : d.YAMLSeq), b = new w(f.schema);
    b.flow = !0;
    const $ = f.atRoot;
    $ && (f.atRoot = !1), f.atKey && (f.atKey = !1);
    let E = h.offset + h.start.source.length;
    for (let A = 0; A < h.items.length; ++A) {
      const V = h.items[A], { start: z, key: q, sep: D, value: G } = V, F = c.resolveProps(z, {
        flow: v,
        indicator: "explicit-key-ind",
        next: q ?? D?.[0],
        offset: E,
        onError: y,
        parentIndent: h.indent,
        startOnNewline: !1
      });
      if (!F.found) {
        if (!F.anchor && !F.tag && !D && !G) {
          A === 0 && F.comma ? y(F.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${v}`) : A < h.items.length - 1 && y(F.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${v}`), F.comment && (b.comment ? b.comment += `
` + F.comment : b.comment = F.comment), E = F.end;
          continue;
        }
        !g && f.options.strict && o.containsNewline(q) && y(
          q,
          // checked by containsNewline()
          "MULTILINE_IMPLICIT_KEY",
          "Implicit keys of flow sequence pairs need to be on a single line"
        );
      }
      if (A === 0)
        F.comma && y(F.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${v}`);
      else if (F.comma || y(F.start, "MISSING_CHAR", `Missing , between ${v} items`), F.comment) {
        let B = "";
        e: for (const K of z)
          switch (K.type) {
            case "comma":
            case "space":
              break;
            case "comment":
              B = K.source.substring(1);
              break e;
            default:
              break e;
          }
        if (B) {
          let K = b.items[b.items.length - 1];
          e.isPair(K) && (K = K.value ?? K.key), K.comment ? K.comment += `
` + B : K.comment = B, F.comment = F.comment.substring(B.length + 1);
        }
      }
      if (!g && !D && !F.found) {
        const B = G ? s(f, G, F, y) : n(f, F.end, D, null, F, y);
        b.items.push(B), E = B.range[2], i(G) && y(B.range, "BLOCK_IN_FLOW", l);
      } else {
        f.atKey = !0;
        const B = F.end, K = q ? s(f, q, F, y) : n(f, B, z, null, F, y);
        i(q) && y(K.range, "BLOCK_IN_FLOW", l), f.atKey = !1;
        const L = c.resolveProps(D ?? [], {
          flow: v,
          indicator: "map-value-ind",
          next: G,
          offset: K.range[2],
          onError: y,
          parentIndent: h.indent,
          startOnNewline: !1
        });
        if (L.found) {
          if (!g && !F.found && f.options.strict) {
            if (D)
              for (const T of D) {
                if (T === L.found)
                  break;
                if (T.type === "newline") {
                  y(T, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                  break;
                }
              }
            F.start < L.found.offset - 1024 && y(L.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
          }
        } else G && ("source" in G && G.source && G.source[0] === ":" ? y(G, "MISSING_CHAR", `Missing space after : in ${v}`) : y(L.start, "MISSING_CHAR", `Missing , or : between ${v} items`));
        const O = G ? s(f, G, L, y) : L.found ? n(f, L.end, D, null, L, y) : null;
        O ? i(G) && y(O.range, "BLOCK_IN_FLOW", l) : L.comment && (K.comment ? K.comment += `
` + L.comment : K.comment = L.comment);
        const C = new r.Pair(K, O);
        if (f.options.keepSourceTokens && (C.srcToken = V), g) {
          const T = b;
          u.mapIncludes(f, T.items, K) && y(B, "DUPLICATE_KEY", "Map keys must be unique"), T.items.push(C);
        } else {
          const T = new a.YAMLMap(f.schema);
          T.flow = !0, T.items.push(C);
          const _ = (O ?? K).range;
          T.range = [K.range[0], _[1], _[2]], b.items.push(T);
        }
        E = O ? O.range[2] : L.end;
      }
    }
    const S = g ? "}" : "]", [N, ...P] = h.end;
    let j = E;
    if (N && N.source === S)
      j = N.offset + N.source.length;
    else {
      const A = v[0].toUpperCase() + v.substring(1), V = $ ? `${A} must end with a ${S}` : `${A} in block collection must be sufficiently indented and end with a ${S}`;
      y(E, $ ? "MISSING_CHAR" : "BAD_INDENT", V), N && N.source.length !== 1 && P.unshift(N);
    }
    if (P.length > 0) {
      const A = p.resolveEnd(P, j, f.options.strict, y);
      A.comment && (b.comment ? b.comment += `
` + A.comment : b.comment = A.comment), b.range = [h.offset, j, A.offset];
    } else
      b.range = [h.offset, j, j];
    return b;
  }
  return _i.resolveFlowCollection = t, _i;
}
var ou;
function Sy() {
  if (ou) return gi;
  ou = 1;
  var e = re(), r = le(), a = Xe(), d = Qe(), p = wy(), c = by(), o = Ey();
  function u(i, t, s, n, f, h) {
    const y = s.type === "block-map" ? p.resolveBlockMap(i, t, s, n, h) : s.type === "block-seq" ? c.resolveBlockSeq(i, t, s, n, h) : o.resolveFlowCollection(i, t, s, n, h), m = y.constructor;
    return f === "!" || f === m.tagName ? (y.tag = m.tagName, y) : (f && (y.tag = f), y);
  }
  function l(i, t, s, n, f) {
    const h = n.tag, y = h ? t.directives.tagName(h.source, ($) => f(h, "TAG_RESOLVE_FAILED", $)) : null;
    if (s.type === "block-seq") {
      const { anchor: $, newlineAfterProp: E } = n, S = $ && h ? $.offset > h.offset ? $ : h : $ ?? h;
      S && (!E || E.offset < S.offset) && f(S, "MISSING_CHAR", "Missing newline after block sequence props");
    }
    const m = s.type === "block-map" ? "map" : s.type === "block-seq" ? "seq" : s.start.source === "{" ? "map" : "seq";
    if (!h || !y || y === "!" || y === a.YAMLMap.tagName && m === "map" || y === d.YAMLSeq.tagName && m === "seq")
      return u(i, t, s, f, y);
    let g = t.schema.tags.find(($) => $.tag === y && $.collection === m);
    if (!g) {
      const $ = t.schema.knownTags[y];
      if ($ && $.collection === m)
        t.schema.tags.push(Object.assign({}, $, { default: !1 })), g = $;
      else
        return $ ? f(h, "BAD_COLLECTION_TYPE", `${$.tag} used for ${m} collection, but expects ${$.collection ?? "scalar"}`, !0) : f(h, "TAG_RESOLVE_FAILED", `Unresolved tag: ${y}`, !0), u(i, t, s, f, y);
    }
    const v = u(i, t, s, f, y, g), w = g.resolve?.(v, ($) => f(h, "TAG_RESOLVE_FAILED", $), t.options) ?? v, b = e.isNode(w) ? w : new r.Scalar(w);
    return b.range = v.range, b.tag = y, g?.format && (b.format = g.format), b;
  }
  return gi.composeCollection = l, gi;
}
var Ri = {}, Oi = {}, cu;
function Tf() {
  if (cu) return Oi;
  cu = 1;
  var e = le();
  function r(p, c, o) {
    const u = c.offset, l = a(c, p.options.strict, o);
    if (!l)
      return { value: "", type: null, comment: "", range: [u, u, u] };
    const i = l.mode === ">" ? e.Scalar.BLOCK_FOLDED : e.Scalar.BLOCK_LITERAL, t = c.source ? d(c.source) : [];
    let s = t.length;
    for (let w = t.length - 1; w >= 0; --w) {
      const b = t[w][1];
      if (b === "" || b === "\r")
        s = w;
      else
        break;
    }
    if (s === 0) {
      const w = l.chomp === "+" && t.length > 0 ? `
`.repeat(Math.max(1, t.length - 1)) : "";
      let b = u + l.length;
      return c.source && (b += c.source.length), { value: w, type: i, comment: l.comment, range: [u, b, b] };
    }
    let n = c.indent + l.indent, f = c.offset + l.length, h = 0;
    for (let w = 0; w < s; ++w) {
      const [b, $] = t[w];
      if ($ === "" || $ === "\r")
        l.indent === 0 && b.length > n && (n = b.length);
      else {
        b.length < n && o(f + b.length, "MISSING_CHAR", "Block scalars with more-indented leading empty lines must use an explicit indentation indicator"), l.indent === 0 && (n = b.length), h = w, n === 0 && !p.atRoot && o(f, "BAD_INDENT", "Block scalar values in collections must be indented");
        break;
      }
      f += b.length + $.length + 1;
    }
    for (let w = t.length - 1; w >= s; --w)
      t[w][0].length > n && (s = w + 1);
    let y = "", m = "", g = !1;
    for (let w = 0; w < h; ++w)
      y += t[w][0].slice(n) + `
`;
    for (let w = h; w < s; ++w) {
      let [b, $] = t[w];
      f += b.length + $.length + 1;
      const E = $[$.length - 1] === "\r";
      if (E && ($ = $.slice(0, -1)), $ && b.length < n) {
        const N = `Block scalar lines must not be less indented than their ${l.indent ? "explicit indentation indicator" : "first line"}`;
        o(f - $.length - (E ? 2 : 1), "BAD_INDENT", N), b = "";
      }
      i === e.Scalar.BLOCK_LITERAL ? (y += m + b.slice(n) + $, m = `
`) : b.length > n || $[0] === "	" ? (m === " " ? m = `
` : !g && m === `
` && (m = `

`), y += m + b.slice(n) + $, m = `
`, g = !0) : $ === "" ? m === `
` ? y += `
` : m = `
` : (y += m + $, m = " ", g = !1);
    }
    switch (l.chomp) {
      case "-":
        break;
      case "+":
        for (let w = s; w < t.length; ++w)
          y += `
` + t[w][0].slice(n);
        y[y.length - 1] !== `
` && (y += `
`);
        break;
      default:
        y += `
`;
    }
    const v = u + l.length + c.source.length;
    return { value: y, type: i, comment: l.comment, range: [u, v, v] };
  }
  function a({ offset: p, props: c }, o, u) {
    if (c[0].type !== "block-scalar-header")
      return u(c[0], "IMPOSSIBLE", "Block scalar header not found"), null;
    const { source: l } = c[0], i = l[0];
    let t = 0, s = "", n = -1;
    for (let m = 1; m < l.length; ++m) {
      const g = l[m];
      if (!s && (g === "-" || g === "+"))
        s = g;
      else {
        const v = Number(g);
        !t && v ? t = v : n === -1 && (n = p + m);
      }
    }
    n !== -1 && u(n, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${l}`);
    let f = !1, h = "", y = l.length;
    for (let m = 1; m < c.length; ++m) {
      const g = c[m];
      switch (g.type) {
        case "space":
          f = !0;
        // fallthrough
        case "newline":
          y += g.source.length;
          break;
        case "comment":
          o && !f && u(g, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters"), y += g.source.length, h = g.source.substring(1);
          break;
        case "error":
          u(g, "UNEXPECTED_TOKEN", g.message), y += g.source.length;
          break;
        /* istanbul ignore next should not happen */
        default: {
          const v = `Unexpected token in block scalar header: ${g.type}`;
          u(g, "UNEXPECTED_TOKEN", v);
          const w = g.source;
          w && typeof w == "string" && (y += w.length);
        }
      }
    }
    return { mode: i, indent: t, chomp: s, comment: h, length: y };
  }
  function d(p) {
    const c = p.split(/\n( *)/), o = c[0], u = o.match(/^( *)/), i = [u?.[1] ? [u[1], o.slice(u[1].length)] : ["", o]];
    for (let t = 1; t < c.length; t += 2)
      i.push([c[t], c[t + 1]]);
    return i;
  }
  return Oi.resolveBlockScalar = r, Oi;
}
var Pi = {}, lu;
function If() {
  if (lu) return Pi;
  lu = 1;
  var e = le(), r = jt();
  function a(t, s, n) {
    const { offset: f, type: h, source: y, end: m } = t;
    let g, v;
    const w = (E, S, N) => n(f + E, S, N);
    switch (h) {
      case "scalar":
        g = e.Scalar.PLAIN, v = d(y, w);
        break;
      case "single-quoted-scalar":
        g = e.Scalar.QUOTE_SINGLE, v = p(y, w);
        break;
      case "double-quoted-scalar":
        g = e.Scalar.QUOTE_DOUBLE, v = o(y, w);
        break;
      /* istanbul ignore next should not happen */
      default:
        return n(t, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${h}`), {
          value: "",
          type: null,
          comment: "",
          range: [f, f + y.length, f + y.length]
        };
    }
    const b = f + y.length, $ = r.resolveEnd(m, b, s, n);
    return {
      value: v,
      type: g,
      comment: $.comment,
      range: [f, b, $.offset]
    };
  }
  function d(t, s) {
    let n = "";
    switch (t[0]) {
      /* istanbul ignore next should not happen */
      case "	":
        n = "a tab character";
        break;
      case ",":
        n = "flow indicator character ,";
        break;
      case "%":
        n = "directive indicator character %";
        break;
      case "|":
      case ">": {
        n = `block scalar indicator ${t[0]}`;
        break;
      }
      case "@":
      case "`": {
        n = `reserved character ${t[0]}`;
        break;
      }
    }
    return n && s(0, "BAD_SCALAR_START", `Plain value cannot start with ${n}`), c(t);
  }
  function p(t, s) {
    return (t[t.length - 1] !== "'" || t.length === 1) && s(t.length, "MISSING_CHAR", "Missing closing 'quote"), c(t.slice(1, -1)).replace(/''/g, "'");
  }
  function c(t) {
    let s, n;
    try {
      s = new RegExp(`(.*?)(?<![ 	])[ 	]*\r?
`, "sy"), n = new RegExp(`[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`, "sy");
    } catch {
      s = /(.*?)[ \t]*\r?\n/sy, n = /[ \t]*(.*?)[ \t]*\r?\n/sy;
    }
    let f = s.exec(t);
    if (!f)
      return t;
    let h = f[1], y = " ", m = s.lastIndex;
    for (n.lastIndex = m; f = n.exec(t); )
      f[1] === "" ? y === `
` ? h += y : y = `
` : (h += y + f[1], y = " "), m = n.lastIndex;
    const g = /[ \t]*(.*)/sy;
    return g.lastIndex = m, f = g.exec(t), h + y + (f?.[1] ?? "");
  }
  function o(t, s) {
    let n = "";
    for (let f = 1; f < t.length - 1; ++f) {
      const h = t[f];
      if (!(h === "\r" && t[f + 1] === `
`))
        if (h === `
`) {
          const { fold: y, offset: m } = u(t, f);
          n += y, f = m;
        } else if (h === "\\") {
          let y = t[++f];
          const m = l[y];
          if (m)
            n += m;
          else if (y === `
`)
            for (y = t[f + 1]; y === " " || y === "	"; )
              y = t[++f + 1];
          else if (y === "\r" && t[f + 1] === `
`)
            for (y = t[++f + 1]; y === " " || y === "	"; )
              y = t[++f + 1];
          else if (y === "x" || y === "u" || y === "U") {
            const g = { x: 2, u: 4, U: 8 }[y];
            n += i(t, f + 1, g, s), f += g;
          } else {
            const g = t.substr(f - 1, 2);
            s(f - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${g}`), n += g;
          }
        } else if (h === " " || h === "	") {
          const y = f;
          let m = t[f + 1];
          for (; m === " " || m === "	"; )
            m = t[++f + 1];
          m !== `
` && !(m === "\r" && t[f + 2] === `
`) && (n += f > y ? t.slice(y, f + 1) : h);
        } else
          n += h;
    }
    return (t[t.length - 1] !== '"' || t.length === 1) && s(t.length, "MISSING_CHAR", 'Missing closing "quote'), n;
  }
  function u(t, s) {
    let n = "", f = t[s + 1];
    for (; (f === " " || f === "	" || f === `
` || f === "\r") && !(f === "\r" && t[s + 2] !== `
`); )
      f === `
` && (n += `
`), s += 1, f = t[s + 1];
    return n || (n = " "), { fold: n, offset: s };
  }
  const l = {
    0: "\0",
    // null character
    a: "\x07",
    // bell character
    b: "\b",
    // backspace
    e: "\x1B",
    // escape character
    f: "\f",
    // form feed
    n: `
`,
    // line feed
    r: "\r",
    // carriage return
    t: "	",
    // horizontal tab
    v: "\v",
    // vertical tab
    N: "",
    // Unicode next line
    _: " ",
    // Unicode non-breaking space
    L: "\u2028",
    // Unicode line separator
    P: "\u2029",
    // Unicode paragraph separator
    " ": " ",
    '"': '"',
    "/": "/",
    "\\": "\\",
    "	": "	"
  };
  function i(t, s, n, f) {
    const h = t.substr(s, n), m = h.length === n && /^[0-9a-fA-F]+$/.test(h) ? parseInt(h, 16) : NaN;
    if (isNaN(m)) {
      const g = t.substr(s - 2, n + 2);
      return f(s - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${g}`), g;
    }
    return String.fromCodePoint(m);
  }
  return Pi.resolveFlowScalar = a, Pi;
}
var uu;
function _y() {
  if (uu) return Ri;
  uu = 1;
  var e = re(), r = le(), a = Tf(), d = If();
  function p(u, l, i, t) {
    const { value: s, type: n, comment: f, range: h } = l.type === "block-scalar" ? a.resolveBlockScalar(u, l, t) : d.resolveFlowScalar(l, u.options.strict, t), y = i ? u.directives.tagName(i.source, (v) => t(i, "TAG_RESOLVE_FAILED", v)) : null;
    let m;
    u.options.stringKeys && u.atKey ? m = u.schema[e.SCALAR] : y ? m = c(u.schema, s, y, i, t) : l.type === "scalar" ? m = o(u, s, l, t) : m = u.schema[e.SCALAR];
    let g;
    try {
      const v = m.resolve(s, (w) => t(i ?? l, "TAG_RESOLVE_FAILED", w), u.options);
      g = e.isScalar(v) ? v : new r.Scalar(v);
    } catch (v) {
      const w = v instanceof Error ? v.message : String(v);
      t(i ?? l, "TAG_RESOLVE_FAILED", w), g = new r.Scalar(s);
    }
    return g.range = h, g.source = s, n && (g.type = n), y && (g.tag = y), m.format && (g.format = m.format), f && (g.comment = f), g;
  }
  function c(u, l, i, t, s) {
    if (i === "!")
      return u[e.SCALAR];
    const n = [];
    for (const h of u.tags)
      if (!h.collection && h.tag === i)
        if (h.default && h.test)
          n.push(h);
        else
          return h;
    for (const h of n)
      if (h.test?.test(l))
        return h;
    const f = u.knownTags[i];
    return f && !f.collection ? (u.tags.push(Object.assign({}, f, { default: !1, test: void 0 })), f) : (s(t, "TAG_RESOLVE_FAILED", `Unresolved tag: ${i}`, i !== "tag:yaml.org,2002:str"), u[e.SCALAR]);
  }
  function o({ atKey: u, directives: l, schema: i }, t, s, n) {
    const f = i.tags.find((h) => (h.default === !0 || u && h.default === "key") && h.test?.test(t)) || i[e.SCALAR];
    if (i.compat) {
      const h = i.compat.find((y) => y.default && y.test?.test(t)) ?? i[e.SCALAR];
      if (f.tag !== h.tag) {
        const y = l.tagString(f.tag), m = l.tagString(h.tag), g = `Value may be parsed as either ${y} or ${m}`;
        n(s, "TAG_RESOLVE_FAILED", g, !0);
      }
    }
    return f;
  }
  return Ri.composeScalar = p, Ri;
}
var Ti = {}, fu;
function Ny() {
  if (fu) return Ti;
  fu = 1;
  function e(r, a, d) {
    if (a) {
      d ?? (d = a.length);
      for (let p = d - 1; p >= 0; --p) {
        let c = a[p];
        switch (c.type) {
          case "space":
          case "comment":
          case "newline":
            r -= c.source.length;
            continue;
        }
        for (c = a[++p]; c?.type === "space"; )
          r += c.source.length, c = a[++p];
        break;
      }
    }
    return r;
  }
  return Ti.emptyScalarPosition = e, Ti;
}
var du;
function Ry() {
  if (du) return Hr;
  du = 1;
  var e = yn(), r = re(), a = Sy(), d = _y(), p = jt(), c = Ny();
  const o = { composeNode: u, composeEmptyNode: l };
  function u(t, s, n, f) {
    const h = t.atKey, { spaceBefore: y, comment: m, anchor: g, tag: v } = n;
    let w, b = !0;
    switch (s.type) {
      case "alias":
        w = i(t, s, f), (g || v) && f(s, "ALIAS_PROPS", "An alias node must not specify any properties");
        break;
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
      case "block-scalar":
        w = d.composeScalar(t, s, v, f), g && (w.anchor = g.source.substring(1));
        break;
      case "block-map":
      case "block-seq":
      case "flow-collection":
        w = a.composeCollection(o, t, s, n, f), g && (w.anchor = g.source.substring(1));
        break;
      default: {
        const $ = s.type === "error" ? s.message : `Unsupported token (type: ${s.type})`;
        f(s, "UNEXPECTED_TOKEN", $), w = l(t, s.offset, void 0, null, n, f), b = !1;
      }
    }
    return g && w.anchor === "" && f(g, "BAD_ALIAS", "Anchor cannot be an empty string"), h && t.options.stringKeys && (!r.isScalar(w) || typeof w.value != "string" || w.tag && w.tag !== "tag:yaml.org,2002:str") && f(v ?? s, "NON_STRING_KEY", "With stringKeys, all keys must be strings"), y && (w.spaceBefore = !0), m && (s.type === "scalar" && s.source === "" ? w.comment = m : w.commentBefore = m), t.options.keepSourceTokens && b && (w.srcToken = s), w;
  }
  function l(t, s, n, f, { spaceBefore: h, comment: y, anchor: m, tag: g, end: v }, w) {
    const b = {
      type: "scalar",
      offset: c.emptyScalarPosition(s, n, f),
      indent: -1,
      source: ""
    }, $ = d.composeScalar(t, b, g, w);
    return m && ($.anchor = m.source.substring(1), $.anchor === "" && w(m, "BAD_ALIAS", "Anchor cannot be an empty string")), h && ($.spaceBefore = !0), y && ($.comment = y, $.range[2] = v), $;
  }
  function i({ options: t }, { offset: s, source: n, end: f }, h) {
    const y = new e.Alias(n.substring(1));
    y.source === "" && h(s, "BAD_ALIAS", "Alias cannot be an empty string"), y.source.endsWith(":") && h(s + n.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", !0);
    const m = s + n.length, g = p.resolveEnd(f, m, t.strict, h);
    return y.range = [s, m, g.offset], g.comment && (y.comment = g.comment), y;
  }
  return Hr.composeEmptyNode = l, Hr.composeNode = u, Hr;
}
var hu;
function Oy() {
  if (hu) return yi;
  hu = 1;
  var e = En(), r = Ry(), a = jt(), d = _n();
  function p(c, o, { offset: u, start: l, value: i, end: t }, s) {
    const n = Object.assign({ _directives: o }, c), f = new e.Document(void 0, n), h = {
      atKey: !1,
      atRoot: !0,
      directives: f.directives,
      options: f.options,
      schema: f.schema
    }, y = d.resolveProps(l, {
      indicator: "doc-start",
      next: i ?? t?.[0],
      offset: u,
      onError: s,
      parentIndent: 0,
      startOnNewline: !0
    });
    y.found && (f.directives.docStart = !0, i && (i.type === "block-map" || i.type === "block-seq") && !y.hasNewline && s(y.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker")), f.contents = i ? r.composeNode(h, i, y, s) : r.composeEmptyNode(h, y.end, l, null, y, s);
    const m = f.contents.range[2], g = a.resolveEnd(t, m, !1, s);
    return g.comment && (f.comment = g.comment), f.range = [u, m, g.offset], f;
  }
  return yi.composeDoc = p, yi;
}
var pu;
function Af() {
  if (pu) return Gs;
  pu = 1;
  var e = Fi, r = ff(), a = En(), d = Sn(), p = re(), c = Oy(), o = jt();
  function u(t) {
    if (typeof t == "number")
      return [t, t + 1];
    if (Array.isArray(t))
      return t.length === 2 ? t : [t[0], t[1]];
    const { offset: s, source: n } = t;
    return [s, s + (typeof n == "string" ? n.length : 1)];
  }
  function l(t) {
    let s = "", n = !1, f = !1;
    for (let h = 0; h < t.length; ++h) {
      const y = t[h];
      switch (y[0]) {
        case "#":
          s += (s === "" ? "" : f ? `

` : `
`) + (y.substring(1) || " "), n = !0, f = !1;
          break;
        case "%":
          t[h + 1]?.[0] !== "#" && (h += 1), n = !1;
          break;
        default:
          n || (f = !0), n = !1;
      }
    }
    return { comment: s, afterEmptyLine: f };
  }
  class i {
    constructor(s = {}) {
      this.doc = null, this.atDirectives = !1, this.prelude = [], this.errors = [], this.warnings = [], this.onError = (n, f, h, y) => {
        const m = u(n);
        y ? this.warnings.push(new d.YAMLWarning(m, f, h)) : this.errors.push(new d.YAMLParseError(m, f, h));
      }, this.directives = new r.Directives({ version: s.version || "1.2" }), this.options = s;
    }
    decorate(s, n) {
      const { comment: f, afterEmptyLine: h } = l(this.prelude);
      if (f) {
        const y = s.contents;
        if (n)
          s.comment = s.comment ? `${s.comment}
${f}` : f;
        else if (h || s.directives.docStart || !y)
          s.commentBefore = f;
        else if (p.isCollection(y) && !y.flow && y.items.length > 0) {
          let m = y.items[0];
          p.isPair(m) && (m = m.key);
          const g = m.commentBefore;
          m.commentBefore = g ? `${f}
${g}` : f;
        } else {
          const m = y.commentBefore;
          y.commentBefore = m ? `${f}
${m}` : f;
        }
      }
      n ? (Array.prototype.push.apply(s.errors, this.errors), Array.prototype.push.apply(s.warnings, this.warnings)) : (s.errors = this.errors, s.warnings = this.warnings), this.prelude = [], this.errors = [], this.warnings = [];
    }
    /**
     * Current stream status information.
     *
     * Mostly useful at the end of input for an empty stream.
     */
    streamInfo() {
      return {
        comment: l(this.prelude).comment,
        directives: this.directives,
        errors: this.errors,
        warnings: this.warnings
      };
    }
    /**
     * Compose tokens into documents.
     *
     * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
     * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
     */
    *compose(s, n = !1, f = -1) {
      for (const h of s)
        yield* this.next(h);
      yield* this.end(n, f);
    }
    /** Advance the composer by one CST token. */
    *next(s) {
      switch (e.env.LOG_STREAM && console.dir(s, { depth: null }), s.type) {
        case "directive":
          this.directives.add(s.source, (n, f, h) => {
            const y = u(s);
            y[0] += n, this.onError(y, "BAD_DIRECTIVE", f, h);
          }), this.prelude.push(s.source), this.atDirectives = !0;
          break;
        case "document": {
          const n = c.composeDoc(this.options, this.directives, s, this.onError);
          this.atDirectives && !n.directives.docStart && this.onError(s, "MISSING_CHAR", "Missing directives-end/doc-start indicator line"), this.decorate(n, !1), this.doc && (yield this.doc), this.doc = n, this.atDirectives = !1;
          break;
        }
        case "byte-order-mark":
        case "space":
          break;
        case "comment":
        case "newline":
          this.prelude.push(s.source);
          break;
        case "error": {
          const n = s.source ? `${s.message}: ${JSON.stringify(s.source)}` : s.message, f = new d.YAMLParseError(u(s), "UNEXPECTED_TOKEN", n);
          this.atDirectives || !this.doc ? this.errors.push(f) : this.doc.errors.push(f);
          break;
        }
        case "doc-end": {
          if (!this.doc) {
            const f = "Unexpected doc-end without preceding document";
            this.errors.push(new d.YAMLParseError(u(s), "UNEXPECTED_TOKEN", f));
            break;
          }
          this.doc.directives.docEnd = !0;
          const n = o.resolveEnd(s.end, s.offset + s.source.length, this.doc.options.strict, this.onError);
          if (this.decorate(this.doc, !0), n.comment) {
            const f = this.doc.comment;
            this.doc.comment = f ? `${f}
${n.comment}` : n.comment;
          }
          this.doc.range[2] = n.offset;
          break;
        }
        default:
          this.errors.push(new d.YAMLParseError(u(s), "UNEXPECTED_TOKEN", `Unsupported token ${s.type}`));
      }
    }
    /**
     * Call at end of input to yield any remaining document.
     *
     * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
     * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
     */
    *end(s = !1, n = -1) {
      if (this.doc)
        this.decorate(this.doc, !0), yield this.doc, this.doc = null;
      else if (s) {
        const f = Object.assign({ _directives: this.directives }, this.options), h = new a.Document(void 0, f);
        this.atDirectives && this.onError(n, "MISSING_CHAR", "Missing directives-end indicator line"), h.range = [0, n, n], this.decorate(h, !1), yield h;
      }
    }
  }
  return Gs.Composer = i, Gs;
}
var ve = {}, Ot = {}, mu;
function Py() {
  if (mu) return Ot;
  mu = 1;
  var e = Tf(), r = If(), a = Sn(), d = $n();
  function p(t, s = !0, n) {
    if (t) {
      const f = (h, y, m) => {
        const g = typeof h == "number" ? h : Array.isArray(h) ? h[0] : h.offset;
        if (n)
          n(g, y, m);
        else
          throw new a.YAMLParseError([g, g + 1], y, m);
      };
      switch (t.type) {
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return r.resolveFlowScalar(t, s, f);
        case "block-scalar":
          return e.resolveBlockScalar({ options: { strict: s } }, t, f);
      }
    }
    return null;
  }
  function c(t, s) {
    const { implicitKey: n = !1, indent: f, inFlow: h = !1, offset: y = -1, type: m = "PLAIN" } = s, g = d.stringifyString({ type: m, value: t }, {
      implicitKey: n,
      indent: f > 0 ? " ".repeat(f) : "",
      inFlow: h,
      options: { blockQuote: !0, lineWidth: -1 }
    }), v = s.end ?? [
      { type: "newline", offset: -1, indent: f, source: `
` }
    ];
    switch (g[0]) {
      case "|":
      case ">": {
        const w = g.indexOf(`
`), b = g.substring(0, w), $ = g.substring(w + 1) + `
`, E = [
          { type: "block-scalar-header", offset: y, indent: f, source: b }
        ];
        return l(E, v) || E.push({ type: "newline", offset: -1, indent: f, source: `
` }), { type: "block-scalar", offset: y, indent: f, props: E, source: $ };
      }
      case '"':
        return { type: "double-quoted-scalar", offset: y, indent: f, source: g, end: v };
      case "'":
        return { type: "single-quoted-scalar", offset: y, indent: f, source: g, end: v };
      default:
        return { type: "scalar", offset: y, indent: f, source: g, end: v };
    }
  }
  function o(t, s, n = {}) {
    let { afterKey: f = !1, implicitKey: h = !1, inFlow: y = !1, type: m } = n, g = "indent" in t ? t.indent : null;
    if (f && typeof g == "number" && (g += 2), !m)
      switch (t.type) {
        case "single-quoted-scalar":
          m = "QUOTE_SINGLE";
          break;
        case "double-quoted-scalar":
          m = "QUOTE_DOUBLE";
          break;
        case "block-scalar": {
          const w = t.props[0];
          if (w.type !== "block-scalar-header")
            throw new Error("Invalid block scalar header");
          m = w.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
          break;
        }
        default:
          m = "PLAIN";
      }
    const v = d.stringifyString({ type: m, value: s }, {
      implicitKey: h || g === null,
      indent: g !== null && g > 0 ? " ".repeat(g) : "",
      inFlow: y,
      options: { blockQuote: !0, lineWidth: -1 }
    });
    switch (v[0]) {
      case "|":
      case ">":
        u(t, v);
        break;
      case '"':
        i(t, v, "double-quoted-scalar");
        break;
      case "'":
        i(t, v, "single-quoted-scalar");
        break;
      default:
        i(t, v, "scalar");
    }
  }
  function u(t, s) {
    const n = s.indexOf(`
`), f = s.substring(0, n), h = s.substring(n + 1) + `
`;
    if (t.type === "block-scalar") {
      const y = t.props[0];
      if (y.type !== "block-scalar-header")
        throw new Error("Invalid block scalar header");
      y.source = f, t.source = h;
    } else {
      const { offset: y } = t, m = "indent" in t ? t.indent : -1, g = [
        { type: "block-scalar-header", offset: y, indent: m, source: f }
      ];
      l(g, "end" in t ? t.end : void 0) || g.push({ type: "newline", offset: -1, indent: m, source: `
` });
      for (const v of Object.keys(t))
        v !== "type" && v !== "offset" && delete t[v];
      Object.assign(t, { type: "block-scalar", indent: m, props: g, source: h });
    }
  }
  function l(t, s) {
    if (s)
      for (const n of s)
        switch (n.type) {
          case "space":
          case "comment":
            t.push(n);
            break;
          case "newline":
            return t.push(n), !0;
        }
    return !1;
  }
  function i(t, s, n) {
    switch (t.type) {
      case "scalar":
      case "double-quoted-scalar":
      case "single-quoted-scalar":
        t.type = n, t.source = s;
        break;
      case "block-scalar": {
        const f = t.props.slice(1);
        let h = s.length;
        t.props[0].type === "block-scalar-header" && (h -= t.props[0].source.length);
        for (const y of f)
          y.offset += h;
        delete t.props, Object.assign(t, { type: n, source: s, end: f });
        break;
      }
      case "block-map":
      case "block-seq": {
        const h = { type: "newline", offset: t.offset + s.length, indent: t.indent, source: `
` };
        delete t.items, Object.assign(t, { type: n, source: s, end: [h] });
        break;
      }
      default: {
        const f = "indent" in t ? t.indent : -1, h = "end" in t && Array.isArray(t.end) ? t.end.filter((y) => y.type === "space" || y.type === "comment" || y.type === "newline") : [];
        for (const y of Object.keys(t))
          y !== "type" && y !== "offset" && delete t[y];
        Object.assign(t, { type: n, indent: f, source: s, end: h });
      }
    }
  }
  return Ot.createScalarToken = c, Ot.resolveAsScalar = p, Ot.setScalarValue = o, Ot;
}
var Ii = {}, yu;
function Ty() {
  if (yu) return Ii;
  yu = 1;
  const e = (d) => "type" in d ? r(d) : a(d);
  function r(d) {
    switch (d.type) {
      case "block-scalar": {
        let p = "";
        for (const c of d.props)
          p += r(c);
        return p + d.source;
      }
      case "block-map":
      case "block-seq": {
        let p = "";
        for (const c of d.items)
          p += a(c);
        return p;
      }
      case "flow-collection": {
        let p = d.start.source;
        for (const c of d.items)
          p += a(c);
        for (const c of d.end)
          p += c.source;
        return p;
      }
      case "document": {
        let p = a(d);
        if (d.end)
          for (const c of d.end)
            p += c.source;
        return p;
      }
      default: {
        let p = d.source;
        if ("end" in d && d.end)
          for (const c of d.end)
            p += c.source;
        return p;
      }
    }
  }
  function a({ start: d, key: p, sep: c, value: o }) {
    let u = "";
    for (const l of d)
      u += l.source;
    if (p && (u += r(p)), c)
      for (const l of c)
        u += l.source;
    return o && (u += r(o)), u;
  }
  return Ii.stringify = e, Ii;
}
var Ai = {}, gu;
function Iy() {
  if (gu) return Ai;
  gu = 1;
  const e = Symbol("break visit"), r = Symbol("skip children"), a = Symbol("remove item");
  function d(c, o) {
    "type" in c && c.type === "document" && (c = { start: c.start, value: c.value }), p(Object.freeze([]), c, o);
  }
  d.BREAK = e, d.SKIP = r, d.REMOVE = a, d.itemAtPath = (c, o) => {
    let u = c;
    for (const [l, i] of o) {
      const t = u?.[l];
      if (t && "items" in t)
        u = t.items[i];
      else
        return;
    }
    return u;
  }, d.parentCollection = (c, o) => {
    const u = d.itemAtPath(c, o.slice(0, -1)), l = o[o.length - 1][0], i = u?.[l];
    if (i && "items" in i)
      return i;
    throw new Error("Parent collection not found");
  };
  function p(c, o, u) {
    let l = u(o, c);
    if (typeof l == "symbol")
      return l;
    for (const i of ["key", "value"]) {
      const t = o[i];
      if (t && "items" in t) {
        for (let s = 0; s < t.items.length; ++s) {
          const n = p(Object.freeze(c.concat([[i, s]])), t.items[s], u);
          if (typeof n == "number")
            s = n - 1;
          else {
            if (n === e)
              return e;
            n === a && (t.items.splice(s, 1), s -= 1);
          }
        }
        typeof l == "function" && i === "key" && (l = l(o, c));
      }
    }
    return typeof l == "function" ? l(o, c) : l;
  }
  return Ai.visit = d, Ai;
}
var vu;
function ia() {
  if (vu) return ve;
  vu = 1;
  var e = Py(), r = Ty(), a = Iy();
  const d = "\uFEFF", p = "", c = "", o = "", u = (s) => !!s && "items" in s, l = (s) => !!s && (s.type === "scalar" || s.type === "single-quoted-scalar" || s.type === "double-quoted-scalar" || s.type === "block-scalar");
  function i(s) {
    switch (s) {
      case d:
        return "<BOM>";
      case p:
        return "<DOC>";
      case c:
        return "<FLOW_END>";
      case o:
        return "<SCALAR>";
      default:
        return JSON.stringify(s);
    }
  }
  function t(s) {
    switch (s) {
      case d:
        return "byte-order-mark";
      case p:
        return "doc-mode";
      case c:
        return "flow-error-end";
      case o:
        return "scalar";
      case "---":
        return "doc-start";
      case "...":
        return "doc-end";
      case "":
      case `
`:
      case `\r
`:
        return "newline";
      case "-":
        return "seq-item-ind";
      case "?":
        return "explicit-key-ind";
      case ":":
        return "map-value-ind";
      case "{":
        return "flow-map-start";
      case "}":
        return "flow-map-end";
      case "[":
        return "flow-seq-start";
      case "]":
        return "flow-seq-end";
      case ",":
        return "comma";
    }
    switch (s[0]) {
      case " ":
      case "	":
        return "space";
      case "#":
        return "comment";
      case "%":
        return "directive-line";
      case "*":
        return "alias";
      case "&":
        return "anchor";
      case "!":
        return "tag";
      case "'":
        return "single-quoted-scalar";
      case '"':
        return "double-quoted-scalar";
      case "|":
      case ">":
        return "block-scalar-header";
    }
    return null;
  }
  return ve.createScalarToken = e.createScalarToken, ve.resolveAsScalar = e.resolveAsScalar, ve.setScalarValue = e.setScalarValue, ve.stringify = r.stringify, ve.visit = a.visit, ve.BOM = d, ve.DOCUMENT = p, ve.FLOW_END = c, ve.SCALAR = o, ve.isCollection = u, ve.isScalar = l, ve.prettyToken = i, ve.tokenType = t, ve;
}
var ki = {}, $u;
function kf() {
  if ($u) return ki;
  $u = 1;
  var e = ia();
  function r(l) {
    switch (l) {
      case void 0:
      case " ":
      case `
`:
      case "\r":
      case "	":
        return !0;
      default:
        return !1;
    }
  }
  const a = new Set("0123456789ABCDEFabcdef"), d = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()"), p = new Set(",[]{}"), c = new Set(` ,[]{}
\r	`), o = (l) => !l || c.has(l);
  class u {
    constructor() {
      this.atEnd = !1, this.blockScalarIndent = -1, this.blockScalarKeep = !1, this.buffer = "", this.flowKey = !1, this.flowLevel = 0, this.indentNext = 0, this.indentValue = 0, this.lineEndPos = null, this.next = null, this.pos = 0;
    }
    /**
     * Generate YAML tokens from the `source` string. If `incomplete`,
     * a part of the last line may be left as a buffer for the next call.
     *
     * @returns A generator of lexical tokens
     */
    *lex(i, t = !1) {
      if (i) {
        if (typeof i != "string")
          throw TypeError("source is not a string");
        this.buffer = this.buffer ? this.buffer + i : i, this.lineEndPos = null;
      }
      this.atEnd = !t;
      let s = this.next ?? "stream";
      for (; s && (t || this.hasChars(1)); )
        s = yield* this.parseNext(s);
    }
    atLineEnd() {
      let i = this.pos, t = this.buffer[i];
      for (; t === " " || t === "	"; )
        t = this.buffer[++i];
      return !t || t === "#" || t === `
` ? !0 : t === "\r" ? this.buffer[i + 1] === `
` : !1;
    }
    charAt(i) {
      return this.buffer[this.pos + i];
    }
    continueScalar(i) {
      let t = this.buffer[i];
      if (this.indentNext > 0) {
        let s = 0;
        for (; t === " "; )
          t = this.buffer[++s + i];
        if (t === "\r") {
          const n = this.buffer[s + i + 1];
          if (n === `
` || !n && !this.atEnd)
            return i + s + 1;
        }
        return t === `
` || s >= this.indentNext || !t && !this.atEnd ? i + s : -1;
      }
      if (t === "-" || t === ".") {
        const s = this.buffer.substr(i, 3);
        if ((s === "---" || s === "...") && r(this.buffer[i + 3]))
          return -1;
      }
      return i;
    }
    getLine() {
      let i = this.lineEndPos;
      return (typeof i != "number" || i !== -1 && i < this.pos) && (i = this.buffer.indexOf(`
`, this.pos), this.lineEndPos = i), i === -1 ? this.atEnd ? this.buffer.substring(this.pos) : null : (this.buffer[i - 1] === "\r" && (i -= 1), this.buffer.substring(this.pos, i));
    }
    hasChars(i) {
      return this.pos + i <= this.buffer.length;
    }
    setNext(i) {
      return this.buffer = this.buffer.substring(this.pos), this.pos = 0, this.lineEndPos = null, this.next = i, null;
    }
    peek(i) {
      return this.buffer.substr(this.pos, i);
    }
    *parseNext(i) {
      switch (i) {
        case "stream":
          return yield* this.parseStream();
        case "line-start":
          return yield* this.parseLineStart();
        case "block-start":
          return yield* this.parseBlockStart();
        case "doc":
          return yield* this.parseDocument();
        case "flow":
          return yield* this.parseFlowCollection();
        case "quoted-scalar":
          return yield* this.parseQuotedScalar();
        case "block-scalar":
          return yield* this.parseBlockScalar();
        case "plain-scalar":
          return yield* this.parsePlainScalar();
      }
    }
    *parseStream() {
      let i = this.getLine();
      if (i === null)
        return this.setNext("stream");
      if (i[0] === e.BOM && (yield* this.pushCount(1), i = i.substring(1)), i[0] === "%") {
        let t = i.length, s = i.indexOf("#");
        for (; s !== -1; ) {
          const f = i[s - 1];
          if (f === " " || f === "	") {
            t = s - 1;
            break;
          } else
            s = i.indexOf("#", s + 1);
        }
        for (; ; ) {
          const f = i[t - 1];
          if (f === " " || f === "	")
            t -= 1;
          else
            break;
        }
        const n = (yield* this.pushCount(t)) + (yield* this.pushSpaces(!0));
        return yield* this.pushCount(i.length - n), this.pushNewline(), "stream";
      }
      if (this.atLineEnd()) {
        const t = yield* this.pushSpaces(!0);
        return yield* this.pushCount(i.length - t), yield* this.pushNewline(), "stream";
      }
      return yield e.DOCUMENT, yield* this.parseLineStart();
    }
    *parseLineStart() {
      const i = this.charAt(0);
      if (!i && !this.atEnd)
        return this.setNext("line-start");
      if (i === "-" || i === ".") {
        if (!this.atEnd && !this.hasChars(4))
          return this.setNext("line-start");
        const t = this.peek(3);
        if ((t === "---" || t === "...") && r(this.charAt(3)))
          return yield* this.pushCount(3), this.indentValue = 0, this.indentNext = 0, t === "---" ? "doc" : "stream";
      }
      return this.indentValue = yield* this.pushSpaces(!1), this.indentNext > this.indentValue && !r(this.charAt(1)) && (this.indentNext = this.indentValue), yield* this.parseBlockStart();
    }
    *parseBlockStart() {
      const [i, t] = this.peek(2);
      if (!t && !this.atEnd)
        return this.setNext("block-start");
      if ((i === "-" || i === "?" || i === ":") && r(t)) {
        const s = (yield* this.pushCount(1)) + (yield* this.pushSpaces(!0));
        return this.indentNext = this.indentValue + 1, this.indentValue += s, yield* this.parseBlockStart();
      }
      return "doc";
    }
    *parseDocument() {
      yield* this.pushSpaces(!0);
      const i = this.getLine();
      if (i === null)
        return this.setNext("doc");
      let t = yield* this.pushIndicators();
      switch (i[t]) {
        case "#":
          yield* this.pushCount(i.length - t);
        // fallthrough
        case void 0:
          return yield* this.pushNewline(), yield* this.parseLineStart();
        case "{":
        case "[":
          return yield* this.pushCount(1), this.flowKey = !1, this.flowLevel = 1, "flow";
        case "}":
        case "]":
          return yield* this.pushCount(1), "doc";
        case "*":
          return yield* this.pushUntil(o), "doc";
        case '"':
        case "'":
          return yield* this.parseQuotedScalar();
        case "|":
        case ">":
          return t += yield* this.parseBlockScalarHeader(), t += yield* this.pushSpaces(!0), yield* this.pushCount(i.length - t), yield* this.pushNewline(), yield* this.parseBlockScalar();
        default:
          return yield* this.parsePlainScalar();
      }
    }
    *parseFlowCollection() {
      let i, t, s = -1;
      do
        i = yield* this.pushNewline(), i > 0 ? (t = yield* this.pushSpaces(!1), this.indentValue = s = t) : t = 0, t += yield* this.pushSpaces(!0);
      while (i + t > 0);
      const n = this.getLine();
      if (n === null)
        return this.setNext("flow");
      if ((s !== -1 && s < this.indentNext && n[0] !== "#" || s === 0 && (n.startsWith("---") || n.startsWith("...")) && r(n[3])) && !(s === this.indentNext - 1 && this.flowLevel === 1 && (n[0] === "]" || n[0] === "}")))
        return this.flowLevel = 0, yield e.FLOW_END, yield* this.parseLineStart();
      let f = 0;
      for (; n[f] === ","; )
        f += yield* this.pushCount(1), f += yield* this.pushSpaces(!0), this.flowKey = !1;
      switch (f += yield* this.pushIndicators(), n[f]) {
        case void 0:
          return "flow";
        case "#":
          return yield* this.pushCount(n.length - f), "flow";
        case "{":
        case "[":
          return yield* this.pushCount(1), this.flowKey = !1, this.flowLevel += 1, "flow";
        case "}":
        case "]":
          return yield* this.pushCount(1), this.flowKey = !0, this.flowLevel -= 1, this.flowLevel ? "flow" : "doc";
        case "*":
          return yield* this.pushUntil(o), "flow";
        case '"':
        case "'":
          return this.flowKey = !0, yield* this.parseQuotedScalar();
        case ":": {
          const h = this.charAt(1);
          if (this.flowKey || r(h) || h === ",")
            return this.flowKey = !1, yield* this.pushCount(1), yield* this.pushSpaces(!0), "flow";
        }
        // fallthrough
        default:
          return this.flowKey = !1, yield* this.parsePlainScalar();
      }
    }
    *parseQuotedScalar() {
      const i = this.charAt(0);
      let t = this.buffer.indexOf(i, this.pos + 1);
      if (i === "'")
        for (; t !== -1 && this.buffer[t + 1] === "'"; )
          t = this.buffer.indexOf("'", t + 2);
      else
        for (; t !== -1; ) {
          let f = 0;
          for (; this.buffer[t - 1 - f] === "\\"; )
            f += 1;
          if (f % 2 === 0)
            break;
          t = this.buffer.indexOf('"', t + 1);
        }
      const s = this.buffer.substring(0, t);
      let n = s.indexOf(`
`, this.pos);
      if (n !== -1) {
        for (; n !== -1; ) {
          const f = this.continueScalar(n + 1);
          if (f === -1)
            break;
          n = s.indexOf(`
`, f);
        }
        n !== -1 && (t = n - (s[n - 1] === "\r" ? 2 : 1));
      }
      if (t === -1) {
        if (!this.atEnd)
          return this.setNext("quoted-scalar");
        t = this.buffer.length;
      }
      return yield* this.pushToIndex(t + 1, !1), this.flowLevel ? "flow" : "doc";
    }
    *parseBlockScalarHeader() {
      this.blockScalarIndent = -1, this.blockScalarKeep = !1;
      let i = this.pos;
      for (; ; ) {
        const t = this.buffer[++i];
        if (t === "+")
          this.blockScalarKeep = !0;
        else if (t > "0" && t <= "9")
          this.blockScalarIndent = Number(t) - 1;
        else if (t !== "-")
          break;
      }
      return yield* this.pushUntil((t) => r(t) || t === "#");
    }
    *parseBlockScalar() {
      let i = this.pos - 1, t = 0, s;
      e: for (let f = this.pos; s = this.buffer[f]; ++f)
        switch (s) {
          case " ":
            t += 1;
            break;
          case `
`:
            i = f, t = 0;
            break;
          case "\r": {
            const h = this.buffer[f + 1];
            if (!h && !this.atEnd)
              return this.setNext("block-scalar");
            if (h === `
`)
              break;
          }
          // fallthrough
          default:
            break e;
        }
      if (!s && !this.atEnd)
        return this.setNext("block-scalar");
      if (t >= this.indentNext) {
        this.blockScalarIndent === -1 ? this.indentNext = t : this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
        do {
          const f = this.continueScalar(i + 1);
          if (f === -1)
            break;
          i = this.buffer.indexOf(`
`, f);
        } while (i !== -1);
        if (i === -1) {
          if (!this.atEnd)
            return this.setNext("block-scalar");
          i = this.buffer.length;
        }
      }
      let n = i + 1;
      for (s = this.buffer[n]; s === " "; )
        s = this.buffer[++n];
      if (s === "	") {
        for (; s === "	" || s === " " || s === "\r" || s === `
`; )
          s = this.buffer[++n];
        i = n - 1;
      } else if (!this.blockScalarKeep)
        do {
          let f = i - 1, h = this.buffer[f];
          h === "\r" && (h = this.buffer[--f]);
          const y = f;
          for (; h === " "; )
            h = this.buffer[--f];
          if (h === `
` && f >= this.pos && f + 1 + t > y)
            i = f;
          else
            break;
        } while (!0);
      return yield e.SCALAR, yield* this.pushToIndex(i + 1, !0), yield* this.parseLineStart();
    }
    *parsePlainScalar() {
      const i = this.flowLevel > 0;
      let t = this.pos - 1, s = this.pos - 1, n;
      for (; n = this.buffer[++s]; )
        if (n === ":") {
          const f = this.buffer[s + 1];
          if (r(f) || i && p.has(f))
            break;
          t = s;
        } else if (r(n)) {
          let f = this.buffer[s + 1];
          if (n === "\r" && (f === `
` ? (s += 1, n = `
`, f = this.buffer[s + 1]) : t = s), f === "#" || i && p.has(f))
            break;
          if (n === `
`) {
            const h = this.continueScalar(s + 1);
            if (h === -1)
              break;
            s = Math.max(s, h - 2);
          }
        } else {
          if (i && p.has(n))
            break;
          t = s;
        }
      return !n && !this.atEnd ? this.setNext("plain-scalar") : (yield e.SCALAR, yield* this.pushToIndex(t + 1, !0), i ? "flow" : "doc");
    }
    *pushCount(i) {
      return i > 0 ? (yield this.buffer.substr(this.pos, i), this.pos += i, i) : 0;
    }
    *pushToIndex(i, t) {
      const s = this.buffer.slice(this.pos, i);
      return s ? (yield s, this.pos += s.length, s.length) : (t && (yield ""), 0);
    }
    *pushIndicators() {
      switch (this.charAt(0)) {
        case "!":
          return (yield* this.pushTag()) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
        case "&":
          return (yield* this.pushUntil(o)) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
        case "-":
        // this is an error
        case "?":
        // this is an error outside flow collections
        case ":": {
          const i = this.flowLevel > 0, t = this.charAt(1);
          if (r(t) || i && p.has(t))
            return i ? this.flowKey && (this.flowKey = !1) : this.indentNext = this.indentValue + 1, (yield* this.pushCount(1)) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
        }
      }
      return 0;
    }
    *pushTag() {
      if (this.charAt(1) === "<") {
        let i = this.pos + 2, t = this.buffer[i];
        for (; !r(t) && t !== ">"; )
          t = this.buffer[++i];
        return yield* this.pushToIndex(t === ">" ? i + 1 : i, !1);
      } else {
        let i = this.pos + 1, t = this.buffer[i];
        for (; t; )
          if (d.has(t))
            t = this.buffer[++i];
          else if (t === "%" && a.has(this.buffer[i + 1]) && a.has(this.buffer[i + 2]))
            t = this.buffer[i += 3];
          else
            break;
        return yield* this.pushToIndex(i, !1);
      }
    }
    *pushNewline() {
      const i = this.buffer[this.pos];
      return i === `
` ? yield* this.pushCount(1) : i === "\r" && this.charAt(1) === `
` ? yield* this.pushCount(2) : 0;
    }
    *pushSpaces(i) {
      let t = this.pos - 1, s;
      do
        s = this.buffer[++t];
      while (s === " " || i && s === "	");
      const n = t - this.pos;
      return n > 0 && (yield this.buffer.substr(this.pos, n), this.pos = t), n;
    }
    *pushUntil(i) {
      let t = this.pos, s = this.buffer[t];
      for (; !i(s); )
        s = this.buffer[++t];
      return yield* this.pushToIndex(t, !1);
    }
  }
  return ki.Lexer = u, ki;
}
var qi = {}, wu;
function qf() {
  if (wu) return qi;
  wu = 1;
  class e {
    constructor() {
      this.lineStarts = [], this.addNewLine = (a) => this.lineStarts.push(a), this.linePos = (a) => {
        let d = 0, p = this.lineStarts.length;
        for (; d < p; ) {
          const o = d + p >> 1;
          this.lineStarts[o] < a ? d = o + 1 : p = o;
        }
        if (this.lineStarts[d] === a)
          return { line: d + 1, col: 1 };
        if (d === 0)
          return { line: 0, col: a };
        const c = this.lineStarts[d - 1];
        return { line: d, col: a - c + 1 };
      };
    }
  }
  return qi.LineCounter = e, qi;
}
var Ci = {}, bu;
function Cf() {
  if (bu) return Ci;
  bu = 1;
  var e = Fi, r = ia(), a = kf();
  function d(t, s) {
    for (let n = 0; n < t.length; ++n)
      if (t[n].type === s)
        return !0;
    return !1;
  }
  function p(t) {
    for (let s = 0; s < t.length; ++s)
      switch (t[s].type) {
        case "space":
        case "comment":
        case "newline":
          break;
        default:
          return s;
      }
    return -1;
  }
  function c(t) {
    switch (t?.type) {
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
      case "flow-collection":
        return !0;
      default:
        return !1;
    }
  }
  function o(t) {
    switch (t.type) {
      case "document":
        return t.start;
      case "block-map": {
        const s = t.items[t.items.length - 1];
        return s.sep ?? s.start;
      }
      case "block-seq":
        return t.items[t.items.length - 1].start;
      /* istanbul ignore next should not happen */
      default:
        return [];
    }
  }
  function u(t) {
    if (t.length === 0)
      return [];
    let s = t.length;
    e: for (; --s >= 0; )
      switch (t[s].type) {
        case "doc-start":
        case "explicit-key-ind":
        case "map-value-ind":
        case "seq-item-ind":
        case "newline":
          break e;
      }
    for (; t[++s]?.type === "space"; )
      ;
    return t.splice(s, t.length);
  }
  function l(t) {
    if (t.start.type === "flow-seq-start")
      for (const s of t.items)
        s.sep && !s.value && !d(s.start, "explicit-key-ind") && !d(s.sep, "map-value-ind") && (s.key && (s.value = s.key), delete s.key, c(s.value) ? s.value.end ? Array.prototype.push.apply(s.value.end, s.sep) : s.value.end = s.sep : Array.prototype.push.apply(s.start, s.sep), delete s.sep);
  }
  class i {
    /**
     * @param onNewLine - If defined, called separately with the start position of
     *   each new line (in `parse()`, including the start of input).
     */
    constructor(s) {
      this.atNewLine = !0, this.atScalar = !1, this.indent = 0, this.offset = 0, this.onKeyLine = !1, this.stack = [], this.source = "", this.type = "", this.lexer = new a.Lexer(), this.onNewLine = s;
    }
    /**
     * Parse `source` as a YAML stream.
     * If `incomplete`, a part of the last line may be left as a buffer for the next call.
     *
     * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
     *
     * @returns A generator of tokens representing each directive, document, and other structure.
     */
    *parse(s, n = !1) {
      this.onNewLine && this.offset === 0 && this.onNewLine(0);
      for (const f of this.lexer.lex(s, n))
        yield* this.next(f);
      n || (yield* this.end());
    }
    /**
     * Advance the parser by the `source` of one lexical token.
     */
    *next(s) {
      if (this.source = s, e.env.LOG_TOKENS && console.log("|", r.prettyToken(s)), this.atScalar) {
        this.atScalar = !1, yield* this.step(), this.offset += s.length;
        return;
      }
      const n = r.tokenType(s);
      if (n)
        if (n === "scalar")
          this.atNewLine = !1, this.atScalar = !0, this.type = "scalar";
        else {
          switch (this.type = n, yield* this.step(), n) {
            case "newline":
              this.atNewLine = !0, this.indent = 0, this.onNewLine && this.onNewLine(this.offset + s.length);
              break;
            case "space":
              this.atNewLine && s[0] === " " && (this.indent += s.length);
              break;
            case "explicit-key-ind":
            case "map-value-ind":
            case "seq-item-ind":
              this.atNewLine && (this.indent += s.length);
              break;
            case "doc-mode":
            case "flow-error-end":
              return;
            default:
              this.atNewLine = !1;
          }
          this.offset += s.length;
        }
      else {
        const f = `Not a YAML token: ${s}`;
        yield* this.pop({ type: "error", offset: this.offset, message: f, source: s }), this.offset += s.length;
      }
    }
    /** Call at end of input to push out any remaining constructions */
    *end() {
      for (; this.stack.length > 0; )
        yield* this.pop();
    }
    get sourceToken() {
      return {
        type: this.type,
        offset: this.offset,
        indent: this.indent,
        source: this.source
      };
    }
    *step() {
      const s = this.peek(1);
      if (this.type === "doc-end" && (!s || s.type !== "doc-end")) {
        for (; this.stack.length > 0; )
          yield* this.pop();
        this.stack.push({
          type: "doc-end",
          offset: this.offset,
          source: this.source
        });
        return;
      }
      if (!s)
        return yield* this.stream();
      switch (s.type) {
        case "document":
          return yield* this.document(s);
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return yield* this.scalar(s);
        case "block-scalar":
          return yield* this.blockScalar(s);
        case "block-map":
          return yield* this.blockMap(s);
        case "block-seq":
          return yield* this.blockSequence(s);
        case "flow-collection":
          return yield* this.flowCollection(s);
        case "doc-end":
          return yield* this.documentEnd(s);
      }
      yield* this.pop();
    }
    peek(s) {
      return this.stack[this.stack.length - s];
    }
    *pop(s) {
      const n = s ?? this.stack.pop();
      if (!n)
        yield { type: "error", offset: this.offset, source: "", message: "Tried to pop an empty stack" };
      else if (this.stack.length === 0)
        yield n;
      else {
        const f = this.peek(1);
        switch (n.type === "block-scalar" ? n.indent = "indent" in f ? f.indent : 0 : n.type === "flow-collection" && f.type === "document" && (n.indent = 0), n.type === "flow-collection" && l(n), f.type) {
          case "document":
            f.value = n;
            break;
          case "block-scalar":
            f.props.push(n);
            break;
          case "block-map": {
            const h = f.items[f.items.length - 1];
            if (h.value) {
              f.items.push({ start: [], key: n, sep: [] }), this.onKeyLine = !0;
              return;
            } else if (h.sep)
              h.value = n;
            else {
              Object.assign(h, { key: n, sep: [] }), this.onKeyLine = !h.explicitKey;
              return;
            }
            break;
          }
          case "block-seq": {
            const h = f.items[f.items.length - 1];
            h.value ? f.items.push({ start: [], value: n }) : h.value = n;
            break;
          }
          case "flow-collection": {
            const h = f.items[f.items.length - 1];
            !h || h.value ? f.items.push({ start: [], key: n, sep: [] }) : h.sep ? h.value = n : Object.assign(h, { key: n, sep: [] });
            return;
          }
          /* istanbul ignore next should not happen */
          default:
            yield* this.pop(), yield* this.pop(n);
        }
        if ((f.type === "document" || f.type === "block-map" || f.type === "block-seq") && (n.type === "block-map" || n.type === "block-seq")) {
          const h = n.items[n.items.length - 1];
          h && !h.sep && !h.value && h.start.length > 0 && p(h.start) === -1 && (n.indent === 0 || h.start.every((y) => y.type !== "comment" || y.indent < n.indent)) && (f.type === "document" ? f.end = h.start : f.items.push({ start: h.start }), n.items.splice(-1, 1));
        }
      }
    }
    *stream() {
      switch (this.type) {
        case "directive-line":
          yield { type: "directive", offset: this.offset, source: this.source };
          return;
        case "byte-order-mark":
        case "space":
        case "comment":
        case "newline":
          yield this.sourceToken;
          return;
        case "doc-mode":
        case "doc-start": {
          const s = {
            type: "document",
            offset: this.offset,
            start: []
          };
          this.type === "doc-start" && s.start.push(this.sourceToken), this.stack.push(s);
          return;
        }
      }
      yield {
        type: "error",
        offset: this.offset,
        message: `Unexpected ${this.type} token in YAML stream`,
        source: this.source
      };
    }
    *document(s) {
      if (s.value)
        return yield* this.lineEnd(s);
      switch (this.type) {
        case "doc-start": {
          p(s.start) !== -1 ? (yield* this.pop(), yield* this.step()) : s.start.push(this.sourceToken);
          return;
        }
        case "anchor":
        case "tag":
        case "space":
        case "comment":
        case "newline":
          s.start.push(this.sourceToken);
          return;
      }
      const n = this.startBlockValue(s);
      n ? this.stack.push(n) : yield {
        type: "error",
        offset: this.offset,
        message: `Unexpected ${this.type} token in YAML document`,
        source: this.source
      };
    }
    *scalar(s) {
      if (this.type === "map-value-ind") {
        const n = o(this.peek(2)), f = u(n);
        let h;
        s.end ? (h = s.end, h.push(this.sourceToken), delete s.end) : h = [this.sourceToken];
        const y = {
          type: "block-map",
          offset: s.offset,
          indent: s.indent,
          items: [{ start: f, key: s, sep: h }]
        };
        this.onKeyLine = !0, this.stack[this.stack.length - 1] = y;
      } else
        yield* this.lineEnd(s);
    }
    *blockScalar(s) {
      switch (this.type) {
        case "space":
        case "comment":
        case "newline":
          s.props.push(this.sourceToken);
          return;
        case "scalar":
          if (s.source = this.source, this.atNewLine = !0, this.indent = 0, this.onNewLine) {
            let n = this.source.indexOf(`
`) + 1;
            for (; n !== 0; )
              this.onNewLine(this.offset + n), n = this.source.indexOf(`
`, n) + 1;
          }
          yield* this.pop();
          break;
        /* istanbul ignore next should not happen */
        default:
          yield* this.pop(), yield* this.step();
      }
    }
    *blockMap(s) {
      const n = s.items[s.items.length - 1];
      switch (this.type) {
        case "newline":
          if (this.onKeyLine = !1, n.value) {
            const f = "end" in n.value ? n.value.end : void 0;
            (Array.isArray(f) ? f[f.length - 1] : void 0)?.type === "comment" ? f?.push(this.sourceToken) : s.items.push({ start: [this.sourceToken] });
          } else n.sep ? n.sep.push(this.sourceToken) : n.start.push(this.sourceToken);
          return;
        case "space":
        case "comment":
          if (n.value)
            s.items.push({ start: [this.sourceToken] });
          else if (n.sep)
            n.sep.push(this.sourceToken);
          else {
            if (this.atIndentedComment(n.start, s.indent)) {
              const h = s.items[s.items.length - 2]?.value?.end;
              if (Array.isArray(h)) {
                Array.prototype.push.apply(h, n.start), h.push(this.sourceToken), s.items.pop();
                return;
              }
            }
            n.start.push(this.sourceToken);
          }
          return;
      }
      if (this.indent >= s.indent) {
        const f = !this.onKeyLine && this.indent === s.indent, h = f && (n.sep || n.explicitKey) && this.type !== "seq-item-ind";
        let y = [];
        if (h && n.sep && !n.value) {
          const m = [];
          for (let g = 0; g < n.sep.length; ++g) {
            const v = n.sep[g];
            switch (v.type) {
              case "newline":
                m.push(g);
                break;
              case "space":
                break;
              case "comment":
                v.indent > s.indent && (m.length = 0);
                break;
              default:
                m.length = 0;
            }
          }
          m.length >= 2 && (y = n.sep.splice(m[1]));
        }
        switch (this.type) {
          case "anchor":
          case "tag":
            h || n.value ? (y.push(this.sourceToken), s.items.push({ start: y }), this.onKeyLine = !0) : n.sep ? n.sep.push(this.sourceToken) : n.start.push(this.sourceToken);
            return;
          case "explicit-key-ind":
            !n.sep && !n.explicitKey ? (n.start.push(this.sourceToken), n.explicitKey = !0) : h || n.value ? (y.push(this.sourceToken), s.items.push({ start: y, explicitKey: !0 })) : this.stack.push({
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken], explicitKey: !0 }]
            }), this.onKeyLine = !0;
            return;
          case "map-value-ind":
            if (n.explicitKey)
              if (n.sep)
                if (n.value)
                  s.items.push({ start: [], key: null, sep: [this.sourceToken] });
                else if (d(n.sep, "map-value-ind"))
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: y, key: null, sep: [this.sourceToken] }]
                  });
                else if (c(n.key) && !d(n.sep, "newline")) {
                  const m = u(n.start), g = n.key, v = n.sep;
                  v.push(this.sourceToken), delete n.key, delete n.sep, this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: m, key: g, sep: v }]
                  });
                } else y.length > 0 ? n.sep = n.sep.concat(y, this.sourceToken) : n.sep.push(this.sourceToken);
              else if (d(n.start, "newline"))
                Object.assign(n, { key: null, sep: [this.sourceToken] });
              else {
                const m = u(n.start);
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: m, key: null, sep: [this.sourceToken] }]
                });
              }
            else
              n.sep ? n.value || h ? s.items.push({ start: y, key: null, sep: [this.sourceToken] }) : d(n.sep, "map-value-ind") ? this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: [], key: null, sep: [this.sourceToken] }]
              }) : n.sep.push(this.sourceToken) : Object.assign(n, { key: null, sep: [this.sourceToken] });
            this.onKeyLine = !0;
            return;
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar": {
            const m = this.flowScalar(this.type);
            h || n.value ? (s.items.push({ start: y, key: m, sep: [] }), this.onKeyLine = !0) : n.sep ? this.stack.push(m) : (Object.assign(n, { key: m, sep: [] }), this.onKeyLine = !0);
            return;
          }
          default: {
            const m = this.startBlockValue(s);
            if (m) {
              if (m.type === "block-seq") {
                if (!n.explicitKey && n.sep && !d(n.sep, "newline")) {
                  yield* this.pop({
                    type: "error",
                    offset: this.offset,
                    message: "Unexpected block-seq-ind on same line with key",
                    source: this.source
                  });
                  return;
                }
              } else f && s.items.push({ start: y });
              this.stack.push(m);
              return;
            }
          }
        }
      }
      yield* this.pop(), yield* this.step();
    }
    *blockSequence(s) {
      const n = s.items[s.items.length - 1];
      switch (this.type) {
        case "newline":
          if (n.value) {
            const f = "end" in n.value ? n.value.end : void 0;
            (Array.isArray(f) ? f[f.length - 1] : void 0)?.type === "comment" ? f?.push(this.sourceToken) : s.items.push({ start: [this.sourceToken] });
          } else
            n.start.push(this.sourceToken);
          return;
        case "space":
        case "comment":
          if (n.value)
            s.items.push({ start: [this.sourceToken] });
          else {
            if (this.atIndentedComment(n.start, s.indent)) {
              const h = s.items[s.items.length - 2]?.value?.end;
              if (Array.isArray(h)) {
                Array.prototype.push.apply(h, n.start), h.push(this.sourceToken), s.items.pop();
                return;
              }
            }
            n.start.push(this.sourceToken);
          }
          return;
        case "anchor":
        case "tag":
          if (n.value || this.indent <= s.indent)
            break;
          n.start.push(this.sourceToken);
          return;
        case "seq-item-ind":
          if (this.indent !== s.indent)
            break;
          n.value || d(n.start, "seq-item-ind") ? s.items.push({ start: [this.sourceToken] }) : n.start.push(this.sourceToken);
          return;
      }
      if (this.indent > s.indent) {
        const f = this.startBlockValue(s);
        if (f) {
          this.stack.push(f);
          return;
        }
      }
      yield* this.pop(), yield* this.step();
    }
    *flowCollection(s) {
      const n = s.items[s.items.length - 1];
      if (this.type === "flow-error-end") {
        let f;
        do
          yield* this.pop(), f = this.peek(1);
        while (f && f.type === "flow-collection");
      } else if (s.end.length === 0) {
        switch (this.type) {
          case "comma":
          case "explicit-key-ind":
            !n || n.sep ? s.items.push({ start: [this.sourceToken] }) : n.start.push(this.sourceToken);
            return;
          case "map-value-ind":
            !n || n.value ? s.items.push({ start: [], key: null, sep: [this.sourceToken] }) : n.sep ? n.sep.push(this.sourceToken) : Object.assign(n, { key: null, sep: [this.sourceToken] });
            return;
          case "space":
          case "comment":
          case "newline":
          case "anchor":
          case "tag":
            !n || n.value ? s.items.push({ start: [this.sourceToken] }) : n.sep ? n.sep.push(this.sourceToken) : n.start.push(this.sourceToken);
            return;
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar": {
            const h = this.flowScalar(this.type);
            !n || n.value ? s.items.push({ start: [], key: h, sep: [] }) : n.sep ? this.stack.push(h) : Object.assign(n, { key: h, sep: [] });
            return;
          }
          case "flow-map-end":
          case "flow-seq-end":
            s.end.push(this.sourceToken);
            return;
        }
        const f = this.startBlockValue(s);
        f ? this.stack.push(f) : (yield* this.pop(), yield* this.step());
      } else {
        const f = this.peek(2);
        if (f.type === "block-map" && (this.type === "map-value-ind" && f.indent === s.indent || this.type === "newline" && !f.items[f.items.length - 1].sep))
          yield* this.pop(), yield* this.step();
        else if (this.type === "map-value-ind" && f.type !== "flow-collection") {
          const h = o(f), y = u(h);
          l(s);
          const m = s.end.splice(1, s.end.length);
          m.push(this.sourceToken);
          const g = {
            type: "block-map",
            offset: s.offset,
            indent: s.indent,
            items: [{ start: y, key: s, sep: m }]
          };
          this.onKeyLine = !0, this.stack[this.stack.length - 1] = g;
        } else
          yield* this.lineEnd(s);
      }
    }
    flowScalar(s) {
      if (this.onNewLine) {
        let n = this.source.indexOf(`
`) + 1;
        for (; n !== 0; )
          this.onNewLine(this.offset + n), n = this.source.indexOf(`
`, n) + 1;
      }
      return {
        type: s,
        offset: this.offset,
        indent: this.indent,
        source: this.source
      };
    }
    startBlockValue(s) {
      switch (this.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return this.flowScalar(this.type);
        case "block-scalar-header":
          return {
            type: "block-scalar",
            offset: this.offset,
            indent: this.indent,
            props: [this.sourceToken],
            source: ""
          };
        case "flow-map-start":
        case "flow-seq-start":
          return {
            type: "flow-collection",
            offset: this.offset,
            indent: this.indent,
            start: this.sourceToken,
            items: [],
            end: []
          };
        case "seq-item-ind":
          return {
            type: "block-seq",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: [this.sourceToken] }]
          };
        case "explicit-key-ind": {
          this.onKeyLine = !0;
          const n = o(s), f = u(n);
          return f.push(this.sourceToken), {
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: f, explicitKey: !0 }]
          };
        }
        case "map-value-ind": {
          this.onKeyLine = !0;
          const n = o(s), f = u(n);
          return {
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: f, key: null, sep: [this.sourceToken] }]
          };
        }
      }
      return null;
    }
    atIndentedComment(s, n) {
      return this.type !== "comment" || this.indent <= n ? !1 : s.every((f) => f.type === "newline" || f.type === "space");
    }
    *documentEnd(s) {
      this.type !== "doc-mode" && (s.end ? s.end.push(this.sourceToken) : s.end = [this.sourceToken], this.type === "newline" && (yield* this.pop()));
    }
    *lineEnd(s) {
      switch (this.type) {
        case "comma":
        case "doc-start":
        case "doc-end":
        case "flow-seq-end":
        case "flow-map-end":
        case "map-value-ind":
          yield* this.pop(), yield* this.step();
          break;
        case "newline":
          this.onKeyLine = !1;
        // fallthrough
        case "space":
        case "comment":
        default:
          s.end ? s.end.push(this.sourceToken) : s.end = [this.sourceToken], this.type === "newline" && (yield* this.pop());
      }
    }
  }
  return Ci.Parser = i, Ci;
}
var ut = {}, Eu;
function Ay() {
  if (Eu) return ut;
  Eu = 1;
  var e = Af(), r = En(), a = Sn(), d = hf(), p = re(), c = qf(), o = Cf();
  function u(n) {
    const f = n.prettyErrors !== !1;
    return { lineCounter: n.lineCounter || f && new c.LineCounter() || null, prettyErrors: f };
  }
  function l(n, f = {}) {
    const { lineCounter: h, prettyErrors: y } = u(f), m = new o.Parser(h?.addNewLine), g = new e.Composer(f), v = Array.from(g.compose(m.parse(n)));
    if (y && h)
      for (const w of v)
        w.errors.forEach(a.prettifyError(n, h)), w.warnings.forEach(a.prettifyError(n, h));
    return v.length > 0 ? v : Object.assign([], { empty: !0 }, g.streamInfo());
  }
  function i(n, f = {}) {
    const { lineCounter: h, prettyErrors: y } = u(f), m = new o.Parser(h?.addNewLine), g = new e.Composer(f);
    let v = null;
    for (const w of g.compose(m.parse(n), !0, n.length))
      if (!v)
        v = w;
      else if (v.options.logLevel !== "silent") {
        v.errors.push(new a.YAMLParseError(w.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
        break;
      }
    return y && h && (v.errors.forEach(a.prettifyError(n, h)), v.warnings.forEach(a.prettifyError(n, h))), v;
  }
  function t(n, f, h) {
    let y;
    typeof f == "function" ? y = f : h === void 0 && f && typeof f == "object" && (h = f);
    const m = i(n, h);
    if (!m)
      return null;
    if (m.warnings.forEach((g) => d.warn(m.options.logLevel, g)), m.errors.length > 0) {
      if (m.options.logLevel !== "silent")
        throw m.errors[0];
      m.errors = [];
    }
    return m.toJS(Object.assign({ reviver: y }, h));
  }
  function s(n, f, h) {
    let y = null;
    if (typeof f == "function" || Array.isArray(f) ? y = f : h === void 0 && f && (h = f), typeof h == "string" && (h = h.length), typeof h == "number") {
      const m = Math.round(h);
      h = m < 1 ? void 0 : m > 8 ? { indent: 8 } : { indent: m };
    }
    if (n === void 0) {
      const { keepUndefined: m } = h ?? f ?? {};
      if (!m)
        return;
    }
    return p.isDocument(n) && !y ? n.toString(h) : new r.Document(n, y, h).toString(h);
  }
  return ut.parse = t, ut.parseAllDocuments = l, ut.parseDocument = i, ut.stringify = s, ut;
}
var Su;
function ky() {
  if (Su) return se;
  Su = 1;
  var e = Af(), r = En(), a = Nf(), d = Sn(), p = yn(), c = re(), o = We(), u = le(), l = Xe(), i = Qe(), t = ia(), s = kf(), n = qf(), f = Cf(), h = Ay(), y = mn();
  return se.Composer = e.Composer, se.Document = r.Document, se.Schema = a.Schema, se.YAMLError = d.YAMLError, se.YAMLParseError = d.YAMLParseError, se.YAMLWarning = d.YAMLWarning, se.Alias = p.Alias, se.isAlias = c.isAlias, se.isCollection = c.isCollection, se.isDocument = c.isDocument, se.isMap = c.isMap, se.isNode = c.isNode, se.isPair = c.isPair, se.isScalar = c.isScalar, se.isSeq = c.isSeq, se.Pair = o.Pair, se.Scalar = u.Scalar, se.YAMLMap = l.YAMLMap, se.YAMLSeq = i.YAMLSeq, se.CST = t, se.Lexer = s.Lexer, se.LineCounter = n.LineCounter, se.Parser = f.Parser, se.parse = h.parse, se.parseAllDocuments = h.parseAllDocuments, se.parseDocument = h.parseDocument, se.stringify = h.stringify, se.visit = y.visit, se.visitAsync = y.visitAsync, se;
}
var qy = ky();
const Cy = /* @__PURE__ */ Tt(qy), { app: _u } = tn, Nu = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};
class Ly {
  name;
  level;
  stream = null;
  constructor(r, a = process.env.AIDLE_LOG_LEVEL ?? "info") {
    this.name = r, this.level = a;
  }
  debug(r, a) {
    this.write("debug", r, a);
  }
  info(r, a) {
    this.write("info", r, a);
  }
  warn(r, a) {
    this.write("warn", r, a);
  }
  error(r, a) {
    this.write("error", r, a);
  }
  write(r, a, d) {
    if (Nu[r] < Nu[this.level]) return;
    const c = `${(/* @__PURE__ */ new Date()).toISOString()} [${r.toUpperCase()}] [${this.name}] ${a}`, o = this.ensureStream();
    o && (d ? o.write(`${c} ${JSON.stringify(d)}
`) : o.write(`${c}
`)), process.env.NODE_ENV !== "production" && console[r === "debug" ? "log" : r](c, d ?? "");
  }
  ensureStream() {
    if (this.stream) return this.stream;
    const r = this.resolveLogFile();
    try {
      this.stream = la(r, { flags: "a" });
    } catch (a) {
      if (a && typeof a == "object" && "code" in a && a.code === "ENOENT") {
        const d = $e(_u.getPath("userData"), "logs");
        xe(d) || Xr(d, { recursive: !0 }), this.stream = la(r, { flags: "a" });
      } else
        this.stream = null;
    }
    return this.stream;
  }
  resolveLogFile() {
    const r = $e(_u.getPath("userData"), "logs");
    return xe(r) || Xr(r, { recursive: !0 }), $e(r, "aidle.log");
  }
}
const ji = (e) => new Ly(e), jy = /* @__PURE__ */ new Set([
  "events",
  "path",
  "url",
  "buffer",
  "timers",
  "util"
]), My = ["node:"];
function Dy(e) {
  const r = ku(e);
  return (a) => {
    if (a.startsWith("./") || a.startsWith("../") || a.startsWith("/") || My.some((d) => a.startsWith(d)) || jy.has(a))
      return r(a);
    throw new Error(`Module '${a}' is not allowed in sandboxed plugin`);
  };
}
function Fy(e) {
  const r = /* @__PURE__ */ new Set(["env", "versions", "platform", "arch"]), a = {
    env: process.env,
    versions: process.versions,
    platform: process.platform,
    arch: process.arch
  };
  return new Proxy(a, {
    get(d, p) {
      if (!r.has(p))
        throw new Error(`Access to process.${p} is not permitted for plugin ${e}`);
      return d[p];
    }
  });
}
class Vy {
  entryPath;
  constructor(r) {
    this.entryPath = r;
  }
  async load(r) {
    const a = this.resolveEntry(this.entryPath);
    if (!xe(a))
      throw new Error(`Plugin entry not found at ${a}`);
    const d = await qu(a, "utf-8"), p = new ua.Script(d, {
      filename: a
    }), c = { exports: {} }, o = ua.createContext({
      module: c,
      exports: c.exports,
      require: Dy(a),
      __dirname: Uf(a),
      __filename: a,
      console,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      Buffer,
      process: Fy(r)
    });
    p.runInContext(o, { timeout: 5e3 });
    const u = o.module.exports ?? o.exports;
    if (!u)
      throw new Error(`Plugin at ${a} did not export a module`);
    return u.default ?? u;
  }
  resolveEntry(r) {
    const a = Iu(r);
    if (a === ".mjs" || a === ".cjs" || a === ".js")
      return r;
    if (a === "")
      return `${r}.js`;
    throw new Error(`Unsupported plugin entry extension: ${a}`);
  }
}
const Uy = (e, r) => {
  const a = Kf($e(e, r));
  return Au(a);
}, By = {
  $id: "Aidle.PluginManifest",
  type: "object",
  required: ["id", "name", "version", "author", "main"],
  additionalProperties: !1,
  properties: {
    id: { type: "string", pattern: "^[a-z0-9-]+$" },
    name: { type: "string" },
    version: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+$" },
    author: { type: "string" },
    description: { type: "string" },
    homepage: { type: "string", format: "uri" },
    license: { type: "string" },
    main: { type: "string" },
    triggers: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "name"],
        additionalProperties: !1,
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          schema: { type: "object", additionalProperties: !0 }
        }
      }
    },
    actions: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "name"],
        additionalProperties: !1,
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          schema: { type: "object", additionalProperties: !0 }
        }
      }
    },
    configSchema: { type: "object", additionalProperties: !0 },
    permissions: {
      type: "array",
      items: { type: "string" }
    },
    dependencies: {
      type: "object",
      required: [],
      additionalProperties: { type: "string" }
    }
  }
}, Ky = By;
class zy {
  options;
  eventBus;
  stores;
  logger;
  ajv = new ly({ allErrors: !0, allowUnionTypes: !0 });
  validator;
  plugins = /* @__PURE__ */ new Map();
  constructor(r, a, d, p = ji("PluginManager")) {
    this.options = r, this.eventBus = a, this.stores = d, this.logger = p, rf(this.ajv), this.validator = this.ajv.compile(Ky);
  }
  listLoaded() {
    return Array.from(this.plugins.values());
  }
  getPlugin(r) {
    return this.plugins.get(r);
  }
  async executeAction(r, a, d) {
    const p = this.plugins.get(r);
    if (!p)
      throw new Error(`Plugin ${r} is not loaded`);
    await p.instance.executeAction(a, d);
  }
  async loadPlugins() {
    const r = this.collectPluginDirectories(), a = [];
    for (const d of r)
      try {
        const p = await this.readManifest(d);
        if (!p) continue;
        await this.loadPlugin(d, p);
      } catch (p) {
        this.logger.error(`Failed to load plugin at ${d}`, { error: p }), a.push(p instanceof Error ? p : new Error(String(p)));
      }
    if (a.length > 0) {
      const d = a.map((p) => p.message).join("; ");
      throw new Error(`PluginManager encountered errors while loading plugins: ${d}`);
    }
  }
  async unloadAll() {
    for (const [r, a] of this.plugins)
      try {
        await a.instance.stopListening?.(), await a.instance.destroy?.();
      } catch (d) {
        this.logger.error(`Error while unloading plugin ${r}`, { error: d });
      }
    this.plugins.clear();
  }
  collectPluginDirectories() {
    const { builtInDirectory: r, externalDirectory: a } = this.options, d = [];
    for (const p of [r, a]) {
      if (!p || !xe(p)) continue;
      const c = Vf(p, { withFileTypes: !0 });
      for (const o of c)
        o.isDirectory() && d.push($e(p, o.name));
    }
    return d;
  }
  async readManifest(r) {
    const a = this.findManifestFile(r);
    if (!a) {
      this.logger.warn(`No manifest found for plugin at ${r}`);
      return;
    }
    const d = await qu(a, "utf-8"), p = this.parseManifestContents(d, Iu(a));
    if (!this.validator(p)) {
      const c = this.validator.errors?.map((o) => `${o.instancePath} ${o.message}`).join(", ");
      throw new Error(`Invalid manifest for plugin ${r}: ${c}`);
    }
    return p;
  }
  findManifestFile(r) {
    const a = ["manifest.json", "manifest.yaml", "manifest.yml"];
    for (const d of a) {
      const p = $e(r, d);
      if (xe(p))
        return p;
    }
  }
  parseManifestContents(r, a) {
    return a === ".yaml" || a === ".yml" ? Cy.parse(r) : JSON.parse(r);
  }
  async loadPlugin(r, a) {
    if (this.plugins.get(a.id)) {
      this.logger.warn(`Plugin ${a.id} already loaded. Skipping duplicate at ${r}`);
      return;
    }
    const p = Uy(r, a.main), o = await new Vy(p).load(a.id);
    this.validatePluginModule(o, a);
    const u = ji(`plugin:${a.id}`), l = (n, f) => {
      this.eventBus.emit({
        type: "plugin-trigger",
        payload: {
          pluginId: a.id,
          triggerId: n,
          data: f,
          timestamp: Date.now()
        }
      });
    }, i = {
      logger: u,
      eventBus: this.eventBus,
      settings: this.stores.settings,
      emitTrigger: l
    };
    await o.initialize?.(i);
    const t = o.registerTriggers?.() ?? [], s = o.registerActions?.() ?? [];
    this.plugins.set(a.id, {
      manifest: a,
      instance: o,
      context: i,
      triggers: t,
      actions: s
    }), await o.startListening?.(), this.logger.info(`Loaded plugin ${a.id}@${a.version} from ${Bf(r)}`);
  }
  validatePluginModule(r, a) {
    const d = [
      "initialize",
      "registerTriggers",
      "registerActions",
      "startListening",
      "stopListening",
      "executeAction",
      "destroy"
    ];
    for (const p of d)
      if (typeof r[p] != "function")
        throw new Error(`Plugin ${a.id} is missing required function '${String(p)}'`);
  }
}
const Gy = () => $e(process.env.APP_ROOT ?? process.cwd(), "src", "plugins"), xy = () => $e(process.cwd(), "plugins-external"), Yy = (e) => {
  const { ipcMain: r } = tn;
  r.handle("plugins:list", () => e.listLoaded().map((a) => ({
    id: a.manifest.id,
    name: a.manifest.name,
    version: a.manifest.version,
    author: a.manifest.author,
    triggers: a.triggers,
    actions: a.actions
  }))), r.handle("plugins:get", (a, d) => {
    const p = e.getPlugin(d);
    return p ? {
      manifest: p.manifest,
      triggers: p.triggers,
      actions: p.actions
    } : null;
  }), r.handle("plugins:execute-action", async (a, d) => {
    const { pluginId: p, actionId: c, params: o } = d;
    return await e.executeAction(p, c, o), { status: "ok" };
  });
}, Hy = (e, r) => {
  const a = r.onPluginTrigger((d) => {
    e.isDestroyed() || e.webContents.send("events:plugin-trigger", d);
  });
  e.on("closed", () => {
    a();
  });
}, Jy = ku(import.meta.url), Lf = Au(new URL(".", import.meta.url)), { app: He, BrowserWindow: jf, Menu: Ru } = tn;
process.env.APP_ROOT = process.env.APP_ROOT ?? $e(Lf, "..");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL ? $e(process.env.APP_ROOT, "public") : $e(process.env.APP_ROOT, "dist");
const Mf = new Jf();
let Pt = null, Ou = null, Mi = null, Pu = !1;
const aa = (e, r) => {
  Mi ? Mi.error(e, { error: r }) : console.error(e, r);
};
function Wy(e) {
  xe(e) || Xr(e, { recursive: !0 });
}
async function Df() {
  const e = new jf({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    show: !1,
    title: "Aidle",
    backgroundColor: "#0f172a",
    webPreferences: {
      preload: $e(Lf, "preload.mjs"),
      contextIsolation: !0
    }
  });
  return e.once("ready-to-show", () => {
    e.show();
  }), process.env.VITE_DEV_SERVER_URL ? (await e.loadURL(process.env.VITE_DEV_SERVER_URL), e.webContents.openDevTools({ mode: "detach" })) : await e.loadFile($e(process.env.APP_ROOT, "dist", "index.html")), Hy(e, Mf), e;
}
function Xy() {
  const e = [
    {
      label: He.name,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" }
      ]
    },
    {
      label: "File",
      submenu: [{ role: "close" }]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "zoom" }, { role: "front" }]
    },
    {
      role: "help",
      submenu: [
        {
          label: "Learn More",
          click: async () => {
            const { shell: r } = Jy("electron");
            await r.openExternal("https://aidle.app");
          }
        }
      ]
    }
  ];
  Ru.setApplicationMenu(Ru.buildFromTemplate(e));
}
async function Qy() {
  await He.whenReady(), Mi = ji("main"), Xy(), Ou = new oy();
  const e = {
    builtInDirectory: Gy(),
    externalDirectory: xy()
  };
  Wy(e.externalDirectory), Pt = new zy(e, Mf, Ou), Yy(Pt);
  const r = await Df();
  try {
    await Pt.loadPlugins();
  } catch (a) {
    aa("Failed to load plugins", a), r.webContents.send("main-process-error", "Failed to load plugins. See logs for details.");
  }
}
Qy();
He.on("window-all-closed", () => {
  process.platform !== "darwin" && He.quit();
});
He.on("activate", () => {
  jf.getAllWindows().length === 0 && Df().catch((e) => {
    aa("Failed to recreate main window", e);
  });
});
He.on("before-quit", async (e) => {
  if (Pt && !Pu) {
    e.preventDefault(), Pu = !0;
    try {
      await Pt.unloadAll();
    } catch (r) {
      aa("Error while shutting down plugins", r);
    }
    He.exit();
  }
});
