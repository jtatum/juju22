import * as yt from "electron";
import gu, { ipcMain as xt } from "electron";
import W, { createWriteStream as ia, existsSync as Je, mkdirSync as sn, readdirSync as Af } from "node:fs";
import ae, { join as $e, dirname as yu, extname as vu, basename as Of } from "node:path";
import { pathToFileURL as If, fileURLToPath as $u } from "node:url";
import { createRequire as wu } from "node:module";
import { EventEmitter as Pf } from "node:events";
import Tf from "better-sqlite3";
import ce from "node:process";
import { promisify as pe, isDeepStrictEqual as kf } from "node:util";
import wt, { randomBytes as Cf } from "node:crypto";
import Lf from "node:assert";
import ln from "node:os";
import { readFile as bu } from "node:fs/promises";
import qi from "process";
import qf from "buffer";
import an from "node:vm";
import { EventEmitter as Mf } from "events";
const { app: aa } = yt, oa = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};
class Df {
  name;
  level;
  stream = null;
  constructor(e, r = process.env.AIDLE_LOG_LEVEL ?? "info") {
    this.name = e, this.level = r;
  }
  debug(e, r) {
    this.write("debug", e, r);
  }
  info(e, r) {
    this.write("info", e, r);
  }
  warn(e, r) {
    this.write("warn", e, r);
  }
  error(e, r) {
    this.write("error", e, r);
  }
  write(e, r, s) {
    if (oa[e] < oa[this.level]) return;
    const c = `${(/* @__PURE__ */ new Date()).toISOString()} [${e.toUpperCase()}] [${this.name}] ${r}`, o = this.ensureStream();
    o && (s ? o.write(`${c} ${JSON.stringify(s)}
`) : o.write(`${c}
`)), process.env.NODE_ENV !== "production" && console[e === "debug" ? "log" : e](c, s ?? "");
  }
  ensureStream() {
    if (this.stream) return this.stream;
    const e = this.resolveLogFile();
    try {
      this.stream = ia(e, { flags: "a" });
    } catch (r) {
      if (r && typeof r == "object" && "code" in r && r.code === "ENOENT") {
        const s = $e(aa.getPath("userData"), "logs");
        Je(s) || sn(s, { recursive: !0 }), this.stream = ia(e, { flags: "a" });
      } else
        this.stream = null;
    }
    return this.stream;
  }
  resolveLogFile() {
    const e = $e(aa.getPath("userData"), "logs");
    return Je(e) || sn(e, { recursive: !0 }), $e(e, "aidle.log");
  }
}
const Oe = (t) => new Df(t), jf = 200;
class Ff {
  emitter = new Pf();
  logger;
  maxLogEntries;
  logBuffer = [];
  constructor(e) {
    this.logger = e?.logger ?? Oe("EventBus"), this.maxLogEntries = e?.maxLogEntries ?? jf;
  }
  emit(e) {
    this.logger.debug("Event emitted", { type: e.type, payload: e.payload }), this.emitter.emit(e.type, e.payload);
    const r = {
      type: e.type,
      payload: e.payload,
      timestamp: Date.now()
    };
    this.emitter.emit("log", r), this.logBuffer.unshift(r), this.logBuffer.length > this.maxLogEntries && (this.logBuffer.length = this.maxLogEntries);
  }
  emitPluginTrigger(e) {
    this.emit({ type: "plugin.trigger", payload: e });
  }
  emitPluginStatus(e) {
    this.emit({ type: "plugin.status", payload: e });
  }
  emitVariableMutation(e) {
    this.emit({ type: "variables.mutated", payload: e });
  }
  on(e, r) {
    return this.emitter.on(e, r), () => this.emitter.off(e, r);
  }
  onPluginTrigger(e) {
    return this.on("plugin.trigger", e);
  }
  onPluginStatus(e) {
    return this.on("plugin.status", e);
  }
  onVariableMutation(e) {
    return this.on("variables.mutated", e);
  }
  onLog(e) {
    return this.emitter.on("log", e), () => this.emitter.off("log", e);
  }
  getRecentLogEntries(e = this.maxLogEntries) {
    return this.logBuffer.slice(0, e);
  }
}
const Xe = (t) => {
  const e = typeof t;
  return t !== null && (e === "object" || e === "function");
}, qn = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), Vf = new Set("0123456789");
function un(t) {
  const e = [];
  let r = "", s = "start", l = !1;
  for (const c of t)
    switch (c) {
      case "\\": {
        if (s === "index")
          throw new Error("Invalid character in an index");
        if (s === "indexEnd")
          throw new Error("Invalid character after an index");
        l && (r += c), s = "property", l = !l;
        break;
      }
      case ".": {
        if (s === "index")
          throw new Error("Invalid character in an index");
        if (s === "indexEnd") {
          s = "property";
          break;
        }
        if (l) {
          l = !1, r += c;
          break;
        }
        if (qn.has(r))
          return [];
        e.push(r), r = "", s = "property";
        break;
      }
      case "[": {
        if (s === "index")
          throw new Error("Invalid character in an index");
        if (s === "indexEnd") {
          s = "index";
          break;
        }
        if (l) {
          l = !1, r += c;
          break;
        }
        if (s === "property") {
          if (qn.has(r))
            return [];
          e.push(r), r = "";
        }
        s = "index";
        break;
      }
      case "]": {
        if (s === "index") {
          e.push(Number.parseInt(r, 10)), r = "", s = "indexEnd";
          break;
        }
        if (s === "indexEnd")
          throw new Error("Invalid character after an index");
      }
      default: {
        if (s === "index" && !Vf.has(c))
          throw new Error("Invalid character in an index");
        if (s === "indexEnd")
          throw new Error("Invalid character after an index");
        s === "start" && (s = "property"), l && (l = !1, r += "\\"), r += c;
      }
    }
  switch (l && (r += "\\"), s) {
    case "property": {
      if (qn.has(r))
        return [];
      e.push(r);
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      e.push("");
      break;
    }
  }
  return e;
}
function Mi(t, e) {
  if (typeof e != "number" && Array.isArray(t)) {
    const r = Number.parseInt(e, 10);
    return Number.isInteger(r) && t[r] === t[e];
  }
  return !1;
}
function Su(t, e) {
  if (Mi(t, e))
    throw new Error("Cannot use string index");
}
function Uf(t, e, r) {
  if (!Xe(t) || typeof e != "string")
    return r === void 0 ? t : r;
  const s = un(e);
  if (s.length === 0)
    return r;
  for (let l = 0; l < s.length; l++) {
    const c = s[l];
    if (Mi(t, c) ? t = l === s.length - 1 ? void 0 : null : t = t[c], t == null) {
      if (l !== s.length - 1)
        return r;
      break;
    }
  }
  return t === void 0 ? r : t;
}
function ca(t, e, r) {
  if (!Xe(t) || typeof e != "string")
    return t;
  const s = t, l = un(e);
  for (let c = 0; c < l.length; c++) {
    const o = l[c];
    Su(t, o), c === l.length - 1 ? t[o] = r : Xe(t[o]) || (t[o] = typeof l[c + 1] == "number" ? [] : {}), t = t[o];
  }
  return s;
}
function Bf(t, e) {
  if (!Xe(t) || typeof e != "string")
    return !1;
  const r = un(e);
  for (let s = 0; s < r.length; s++) {
    const l = r[s];
    if (Su(t, l), s === r.length - 1)
      return delete t[l], !0;
    if (t = t[l], !Xe(t))
      return !1;
  }
}
function Kf(t, e) {
  if (!Xe(t) || typeof e != "string")
    return !1;
  const r = un(e);
  if (r.length === 0)
    return !1;
  for (const s of r) {
    if (!Xe(t) || !(s in t) || Mi(t, s))
      return !1;
    t = t[s];
  }
  return !0;
}
const xe = ln.homedir(), Di = ln.tmpdir(), { env: mt } = ce, xf = (t) => {
  const e = ae.join(xe, "Library");
  return {
    data: ae.join(e, "Application Support", t),
    config: ae.join(e, "Preferences", t),
    cache: ae.join(e, "Caches", t),
    log: ae.join(e, "Logs", t),
    temp: ae.join(Di, t)
  };
}, zf = (t) => {
  const e = mt.APPDATA || ae.join(xe, "AppData", "Roaming"), r = mt.LOCALAPPDATA || ae.join(xe, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: ae.join(r, t, "Data"),
    config: ae.join(e, t, "Config"),
    cache: ae.join(r, t, "Cache"),
    log: ae.join(r, t, "Log"),
    temp: ae.join(Di, t)
  };
}, Gf = (t) => {
  const e = ae.basename(xe);
  return {
    data: ae.join(mt.XDG_DATA_HOME || ae.join(xe, ".local", "share"), t),
    config: ae.join(mt.XDG_CONFIG_HOME || ae.join(xe, ".config"), t),
    cache: ae.join(mt.XDG_CACHE_HOME || ae.join(xe, ".cache"), t),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: ae.join(mt.XDG_STATE_HOME || ae.join(xe, ".local", "state"), t),
    temp: ae.join(Di, e, t)
  };
};
function Yf(t, { suffix: e = "nodejs" } = {}) {
  if (typeof t != "string")
    throw new TypeError(`Expected a string, got ${typeof t}`);
  return e && (t += `-${e}`), ce.platform === "darwin" ? xf(t) : ce.platform === "win32" ? zf(t) : Gf(t);
}
const je = (t, e) => function(...s) {
  return t.apply(void 0, s).catch(e);
}, Ce = (t, e) => function(...s) {
  try {
    return t.apply(void 0, s);
  } catch (l) {
    return e(l);
  }
}, Hf = ce.getuid ? !ce.getuid() : !1, Jf = 1e4, Ee = () => {
}, oe = {
  /* API */
  isChangeErrorOk: (t) => {
    if (!oe.isNodeError(t))
      return !1;
    const { code: e } = t;
    return e === "ENOSYS" || !Hf && (e === "EINVAL" || e === "EPERM");
  },
  isNodeError: (t) => t instanceof Error,
  isRetriableError: (t) => {
    if (!oe.isNodeError(t))
      return !1;
    const { code: e } = t;
    return e === "EMFILE" || e === "ENFILE" || e === "EAGAIN" || e === "EBUSY" || e === "EACCESS" || e === "EACCES" || e === "EACCS" || e === "EPERM";
  },
  onChangeError: (t) => {
    if (!oe.isNodeError(t))
      throw t;
    if (!oe.isChangeErrorOk(t))
      throw t;
  }
};
class Xf {
  constructor() {
    this.interval = 25, this.intervalId = void 0, this.limit = Jf, this.queueActive = /* @__PURE__ */ new Set(), this.queueWaiting = /* @__PURE__ */ new Set(), this.init = () => {
      this.intervalId || (this.intervalId = setInterval(this.tick, this.interval));
    }, this.reset = () => {
      this.intervalId && (clearInterval(this.intervalId), delete this.intervalId);
    }, this.add = (e) => {
      this.queueWaiting.add(e), this.queueActive.size < this.limit / 2 ? this.tick() : this.init();
    }, this.remove = (e) => {
      this.queueWaiting.delete(e), this.queueActive.delete(e);
    }, this.schedule = () => new Promise((e) => {
      const r = () => this.remove(s), s = () => e(r);
      this.add(s);
    }), this.tick = () => {
      if (!(this.queueActive.size >= this.limit)) {
        if (!this.queueWaiting.size)
          return this.reset();
        for (const e of this.queueWaiting) {
          if (this.queueActive.size >= this.limit)
            break;
          this.queueWaiting.delete(e), this.queueActive.add(e), e();
        }
      }
    };
  }
}
const Wf = new Xf(), Fe = (t, e) => function(s) {
  return function l(...c) {
    return Wf.schedule().then((o) => {
      const f = (u) => (o(), u), d = (u) => {
        if (o(), Date.now() >= s)
          throw u;
        if (e(u)) {
          const n = Math.round(100 * Math.random());
          return new Promise((a) => setTimeout(a, n)).then(() => l.apply(void 0, c));
        }
        throw u;
      };
      return t.apply(void 0, c).then(f, d);
    });
  };
}, Ve = (t, e) => function(s) {
  return function l(...c) {
    try {
      return t.apply(void 0, c);
    } catch (o) {
      if (Date.now() > s)
        throw o;
      if (e(o))
        return l.apply(void 0, c);
      throw o;
    }
  };
}, me = {
  attempt: {
    /* ASYNC */
    chmod: je(pe(W.chmod), oe.onChangeError),
    chown: je(pe(W.chown), oe.onChangeError),
    close: je(pe(W.close), Ee),
    fsync: je(pe(W.fsync), Ee),
    mkdir: je(pe(W.mkdir), Ee),
    realpath: je(pe(W.realpath), Ee),
    stat: je(pe(W.stat), Ee),
    unlink: je(pe(W.unlink), Ee),
    /* SYNC */
    chmodSync: Ce(W.chmodSync, oe.onChangeError),
    chownSync: Ce(W.chownSync, oe.onChangeError),
    closeSync: Ce(W.closeSync, Ee),
    existsSync: Ce(W.existsSync, Ee),
    fsyncSync: Ce(W.fsync, Ee),
    mkdirSync: Ce(W.mkdirSync, Ee),
    realpathSync: Ce(W.realpathSync, Ee),
    statSync: Ce(W.statSync, Ee),
    unlinkSync: Ce(W.unlinkSync, Ee)
  },
  retry: {
    /* ASYNC */
    close: Fe(pe(W.close), oe.isRetriableError),
    fsync: Fe(pe(W.fsync), oe.isRetriableError),
    open: Fe(pe(W.open), oe.isRetriableError),
    readFile: Fe(pe(W.readFile), oe.isRetriableError),
    rename: Fe(pe(W.rename), oe.isRetriableError),
    stat: Fe(pe(W.stat), oe.isRetriableError),
    write: Fe(pe(W.write), oe.isRetriableError),
    writeFile: Fe(pe(W.writeFile), oe.isRetriableError),
    /* SYNC */
    closeSync: Ve(W.closeSync, oe.isRetriableError),
    fsyncSync: Ve(W.fsyncSync, oe.isRetriableError),
    openSync: Ve(W.openSync, oe.isRetriableError),
    readFileSync: Ve(W.readFileSync, oe.isRetriableError),
    renameSync: Ve(W.renameSync, oe.isRetriableError),
    statSync: Ve(W.statSync, oe.isRetriableError),
    writeSync: Ve(W.writeSync, oe.isRetriableError),
    writeFileSync: Ve(W.writeFileSync, oe.isRetriableError)
  }
}, Qf = "utf8", la = 438, Zf = 511, ed = {}, td = ln.userInfo().uid, rd = ln.userInfo().gid, nd = 1e3, sd = !!ce.getuid;
ce.getuid && ce.getuid();
const ua = 128, id = (t) => t instanceof Error && "code" in t, fa = (t) => typeof t == "string", Mn = (t) => t === void 0, ad = ce.platform === "linux", Eu = ce.platform === "win32", ji = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
Eu || ji.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
ad && ji.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
class od {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (e) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        e && (Eu && e !== "SIGINT" && e !== "SIGTERM" && e !== "SIGKILL" ? ce.kill(ce.pid, "SIGTERM") : ce.kill(ce.pid, e));
      }
    }, this.hook = () => {
      ce.once("exit", () => this.exit());
      for (const e of ji)
        try {
          ce.once(e, () => this.exit(e));
        } catch {
        }
    }, this.register = (e) => (this.callbacks.add(e), () => {
      this.callbacks.delete(e);
    }), this.hook();
  }
}
const cd = new od(), ld = cd.register, ge = {
  /* VARIABLES */
  store: {},
  /* API */
  create: (t) => {
    const e = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), l = `.tmp-${Date.now().toString().slice(-10)}${e}`;
    return `${t}${l}`;
  },
  get: (t, e, r = !0) => {
    const s = ge.truncate(e(t));
    return s in ge.store ? ge.get(t, e, r) : (ge.store[s] = r, [s, () => delete ge.store[s]]);
  },
  purge: (t) => {
    ge.store[t] && (delete ge.store[t], me.attempt.unlink(t));
  },
  purgeSync: (t) => {
    ge.store[t] && (delete ge.store[t], me.attempt.unlinkSync(t));
  },
  purgeSyncAll: () => {
    for (const t in ge.store)
      ge.purgeSync(t);
  },
  truncate: (t) => {
    const e = ae.basename(t);
    if (e.length <= ua)
      return t;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(e);
    if (!r)
      return t;
    const s = e.length - ua;
    return `${t.slice(0, -e.length)}${r[1]}${r[2].slice(0, -s)}${r[3]}`;
  }
};
ld(ge.purgeSyncAll);
function _u(t, e, r = ed) {
  if (fa(r))
    return _u(t, e, { encoding: r });
  const s = Date.now() + ((r.timeout ?? nd) || -1);
  let l = null, c = null, o = null;
  try {
    const f = me.attempt.realpathSync(t), d = !!f;
    t = f || t, [c, l] = ge.get(t, r.tmpCreate || ge.create, r.tmpPurge !== !1);
    const u = sd && Mn(r.chown), n = Mn(r.mode);
    if (d && (u || n)) {
      const i = me.attempt.statSync(t);
      i && (r = { ...r }, u && (r.chown = { uid: i.uid, gid: i.gid }), n && (r.mode = i.mode));
    }
    if (!d) {
      const i = ae.dirname(t);
      me.attempt.mkdirSync(i, {
        mode: Zf,
        recursive: !0
      });
    }
    o = me.retry.openSync(s)(c, "w", r.mode || la), r.tmpCreated && r.tmpCreated(c), fa(e) ? me.retry.writeSync(s)(o, e, 0, r.encoding || Qf) : Mn(e) || me.retry.writeSync(s)(o, e, 0, e.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? me.retry.fsyncSync(s)(o) : me.attempt.fsync(o)), me.retry.closeSync(s)(o), o = null, r.chown && (r.chown.uid !== td || r.chown.gid !== rd) && me.attempt.chownSync(c, r.chown.uid, r.chown.gid), r.mode && r.mode !== la && me.attempt.chmodSync(c, r.mode);
    try {
      me.retry.renameSync(s)(c, t);
    } catch (i) {
      if (!id(i) || i.code !== "ENAMETOOLONG")
        throw i;
      me.retry.renameSync(s)(c, ge.truncate(t));
    }
    l(), c = null;
  } finally {
    o && me.attempt.closeSync(o), c && ge.purge(c);
  }
}
function fn(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var zt = { exports: {} }, Dn = {}, Le = {}, ze = {}, jn = {}, Fn = {}, Vn = {}, da;
function on() {
  return da || (da = 1, (function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.regexpCode = t.getEsmExportName = t.getProperty = t.safeStringify = t.stringify = t.strConcat = t.addCodeArg = t.str = t._ = t.nil = t._Code = t.Name = t.IDENTIFIER = t._CodeOrName = void 0;
    class e {
    }
    t._CodeOrName = e, t.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class r extends e {
      constructor(v) {
        if (super(), !t.IDENTIFIER.test(v))
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
    t.Name = r;
    class s extends e {
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
        return (v = this._names) !== null && v !== void 0 ? v : this._names = this._items.reduce((w, b) => (b instanceof r && (w[b.str] = (w[b.str] || 0) + 1), w), {});
      }
    }
    t._Code = s, t.nil = new s("");
    function l(y, ...v) {
      const w = [y[0]];
      let b = 0;
      for (; b < v.length; )
        f(w, v[b]), w.push(y[++b]);
      return new s(w);
    }
    t._ = l;
    const c = new s("+");
    function o(y, ...v) {
      const w = [h(y[0])];
      let b = 0;
      for (; b < v.length; )
        w.push(c), f(w, v[b]), w.push(c, h(y[++b]));
      return d(w), new s(w);
    }
    t.str = o;
    function f(y, v) {
      v instanceof s ? y.push(...v._items) : v instanceof r ? y.push(v) : y.push(i(v));
    }
    t.addCodeArg = f;
    function d(y) {
      let v = 1;
      for (; v < y.length - 1; ) {
        if (y[v] === c) {
          const w = u(y[v - 1], y[v + 1]);
          if (w !== void 0) {
            y.splice(v - 1, 3, w);
            continue;
          }
          y[v++] = "+";
        }
        v++;
      }
    }
    function u(y, v) {
      if (v === '""')
        return y;
      if (y === '""')
        return v;
      if (typeof y == "string")
        return v instanceof r || y[y.length - 1] !== '"' ? void 0 : typeof v != "string" ? `${y.slice(0, -1)}${v}"` : v[0] === '"' ? y.slice(0, -1) + v.slice(1) : void 0;
      if (typeof v == "string" && v[0] === '"' && !(y instanceof r))
        return `"${y}${v.slice(1)}`;
    }
    function n(y, v) {
      return v.emptyStr() ? y : y.emptyStr() ? v : o`${y}${v}`;
    }
    t.strConcat = n;
    function i(y) {
      return typeof y == "number" || typeof y == "boolean" || y === null ? y : h(Array.isArray(y) ? y.join(",") : y);
    }
    function a(y) {
      return new s(h(y));
    }
    t.stringify = a;
    function h(y) {
      return JSON.stringify(y).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    t.safeStringify = h;
    function p(y) {
      return typeof y == "string" && t.IDENTIFIER.test(y) ? new s(`.${y}`) : l`[${y}]`;
    }
    t.getProperty = p;
    function g(y) {
      if (typeof y == "string" && t.IDENTIFIER.test(y))
        return new s(`${y}`);
      throw new Error(`CodeGen: invalid export name: ${y}, use explicit $id name mapping`);
    }
    t.getEsmExportName = g;
    function m(y) {
      return new s(y.toString());
    }
    t.regexpCode = m;
  })(Vn)), Vn;
}
var Un = {}, ha;
function pa() {
  return ha || (ha = 1, (function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.ValueScope = t.ValueScopeName = t.Scope = t.varKinds = t.UsedValueState = void 0;
    const e = on();
    class r extends Error {
      constructor(u) {
        super(`CodeGen: "code" for ${u} not defined`), this.value = u.value;
      }
    }
    var s;
    (function(d) {
      d[d.Started = 0] = "Started", d[d.Completed = 1] = "Completed";
    })(s || (t.UsedValueState = s = {})), t.varKinds = {
      const: new e.Name("const"),
      let: new e.Name("let"),
      var: new e.Name("var")
    };
    class l {
      constructor({ prefixes: u, parent: n } = {}) {
        this._names = {}, this._prefixes = u, this._parent = n;
      }
      toName(u) {
        return u instanceof e.Name ? u : this.name(u);
      }
      name(u) {
        return new e.Name(this._newName(u));
      }
      _newName(u) {
        const n = this._names[u] || this._nameGroup(u);
        return `${u}${n.index++}`;
      }
      _nameGroup(u) {
        var n, i;
        if (!((i = (n = this._parent) === null || n === void 0 ? void 0 : n._prefixes) === null || i === void 0) && i.has(u) || this._prefixes && !this._prefixes.has(u))
          throw new Error(`CodeGen: prefix "${u}" is not allowed in this scope`);
        return this._names[u] = { prefix: u, index: 0 };
      }
    }
    t.Scope = l;
    class c extends e.Name {
      constructor(u, n) {
        super(n), this.prefix = u;
      }
      setValue(u, { property: n, itemIndex: i }) {
        this.value = u, this.scopePath = (0, e._)`.${new e.Name(n)}[${i}]`;
      }
    }
    t.ValueScopeName = c;
    const o = (0, e._)`\n`;
    class f extends l {
      constructor(u) {
        super(u), this._values = {}, this._scope = u.scope, this.opts = { ...u, _n: u.lines ? o : e.nil };
      }
      get() {
        return this._scope;
      }
      name(u) {
        return new c(u, this._newName(u));
      }
      value(u, n) {
        var i;
        if (n.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const a = this.toName(u), { prefix: h } = a, p = (i = n.key) !== null && i !== void 0 ? i : n.ref;
        let g = this._values[h];
        if (g) {
          const v = g.get(p);
          if (v)
            return v;
        } else
          g = this._values[h] = /* @__PURE__ */ new Map();
        g.set(p, a);
        const m = this._scope[h] || (this._scope[h] = []), y = m.length;
        return m[y] = n.ref, a.setValue(n, { property: h, itemIndex: y }), a;
      }
      getValue(u, n) {
        const i = this._values[u];
        if (i)
          return i.get(n);
      }
      scopeRefs(u, n = this._values) {
        return this._reduceValues(n, (i) => {
          if (i.scopePath === void 0)
            throw new Error(`CodeGen: name "${i}" has no value`);
          return (0, e._)`${u}${i.scopePath}`;
        });
      }
      scopeCode(u = this._values, n, i) {
        return this._reduceValues(u, (a) => {
          if (a.value === void 0)
            throw new Error(`CodeGen: name "${a}" has no value`);
          return a.value.code;
        }, n, i);
      }
      _reduceValues(u, n, i = {}, a) {
        let h = e.nil;
        for (const p in u) {
          const g = u[p];
          if (!g)
            continue;
          const m = i[p] = i[p] || /* @__PURE__ */ new Map();
          g.forEach((y) => {
            if (m.has(y))
              return;
            m.set(y, s.Started);
            let v = n(y);
            if (v) {
              const w = this.opts.es5 ? t.varKinds.var : t.varKinds.const;
              h = (0, e._)`${h}${w} ${y} = ${v};${this.opts._n}`;
            } else if (v = a?.(y))
              h = (0, e._)`${h}${v}${this.opts._n}`;
            else
              throw new r(y);
            m.set(y, s.Completed);
          });
        }
        return h;
      }
    }
    t.ValueScope = f;
  })(Un)), Un;
}
var ma;
function X() {
  return ma || (ma = 1, (function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.or = t.and = t.not = t.CodeGen = t.operators = t.varKinds = t.ValueScopeName = t.ValueScope = t.Scope = t.Name = t.regexpCode = t.stringify = t.getProperty = t.nil = t.strConcat = t.str = t._ = void 0;
    const e = on(), r = pa();
    var s = on();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return s._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return s.str;
    } }), Object.defineProperty(t, "strConcat", { enumerable: !0, get: function() {
      return s.strConcat;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return s.nil;
    } }), Object.defineProperty(t, "getProperty", { enumerable: !0, get: function() {
      return s.getProperty;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return s.stringify;
    } }), Object.defineProperty(t, "regexpCode", { enumerable: !0, get: function() {
      return s.regexpCode;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return s.Name;
    } });
    var l = pa();
    Object.defineProperty(t, "Scope", { enumerable: !0, get: function() {
      return l.Scope;
    } }), Object.defineProperty(t, "ValueScope", { enumerable: !0, get: function() {
      return l.ValueScope;
    } }), Object.defineProperty(t, "ValueScopeName", { enumerable: !0, get: function() {
      return l.ValueScopeName;
    } }), Object.defineProperty(t, "varKinds", { enumerable: !0, get: function() {
      return l.varKinds;
    } }), t.operators = {
      GT: new e._Code(">"),
      GTE: new e._Code(">="),
      LT: new e._Code("<"),
      LTE: new e._Code("<="),
      EQ: new e._Code("==="),
      NEQ: new e._Code("!=="),
      NOT: new e._Code("!"),
      OR: new e._Code("||"),
      AND: new e._Code("&&"),
      ADD: new e._Code("+")
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
      constructor(_, R, D) {
        super(), this.varKind = _, this.name = R, this.rhs = D;
      }
      render({ es5: _, _n: R }) {
        const D = _ ? r.varKinds.var : this.varKind, Y = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${D} ${this.name}${Y};` + R;
      }
      optimizeNames(_, R) {
        if (_[this.name.str])
          return this.rhs && (this.rhs = C(this.rhs, _, R)), this;
      }
      get names() {
        return this.rhs instanceof e._CodeOrName ? this.rhs.names : {};
      }
    }
    class f extends c {
      constructor(_, R, D) {
        super(), this.lhs = _, this.rhs = R, this.sideEffects = D;
      }
      render({ _n: _ }) {
        return `${this.lhs} = ${this.rhs};` + _;
      }
      optimizeNames(_, R) {
        if (!(this.lhs instanceof e.Name && !_[this.lhs.str] && !this.sideEffects))
          return this.rhs = C(this.rhs, _, R), this;
      }
      get names() {
        const _ = this.lhs instanceof e.Name ? {} : { ...this.lhs.names };
        return x(_, this.rhs);
      }
    }
    class d extends f {
      constructor(_, R, D, Y) {
        super(_, D, Y), this.op = R;
      }
      render({ _n: _ }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + _;
      }
    }
    class u extends c {
      constructor(_) {
        super(), this.label = _, this.names = {};
      }
      render({ _n: _ }) {
        return `${this.label}:` + _;
      }
    }
    class n extends c {
      constructor(_) {
        super(), this.label = _, this.names = {};
      }
      render({ _n: _ }) {
        return `break${this.label ? ` ${this.label}` : ""};` + _;
      }
    }
    class i extends c {
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
    class a extends c {
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
        return this.code = C(this.code, _, R), this;
      }
      get names() {
        return this.code instanceof e._CodeOrName ? this.code.names : {};
      }
    }
    class h extends c {
      constructor(_ = []) {
        super(), this.nodes = _;
      }
      render(_) {
        return this.nodes.reduce((R, D) => R + D.render(_), "");
      }
      optimizeNodes() {
        const { nodes: _ } = this;
        let R = _.length;
        for (; R--; ) {
          const D = _[R].optimizeNodes();
          Array.isArray(D) ? _.splice(R, 1, ...D) : D ? _[R] = D : _.splice(R, 1);
        }
        return _.length > 0 ? this : void 0;
      }
      optimizeNames(_, R) {
        const { nodes: D } = this;
        let Y = D.length;
        for (; Y--; ) {
          const J = D[Y];
          J.optimizeNames(_, R) || (j(_, J.names), D.splice(Y, 1));
        }
        return D.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((_, R) => V(_, R.names), {});
      }
    }
    class p extends h {
      render(_) {
        return "{" + _._n + super.render(_) + "}" + _._n;
      }
    }
    class g extends h {
    }
    class m extends p {
    }
    m.kind = "else";
    class y extends p {
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
          const D = R.optimizeNodes();
          R = this.else = Array.isArray(D) ? new m(D) : D;
        }
        if (R)
          return _ === !1 ? R instanceof y ? R : R.nodes : this.nodes.length ? this : new y(z(_), R instanceof y ? [R] : R.nodes);
        if (!(_ === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(_, R) {
        var D;
        if (this.else = (D = this.else) === null || D === void 0 ? void 0 : D.optimizeNames(_, R), !!(super.optimizeNames(_, R) || this.else))
          return this.condition = C(this.condition, _, R), this;
      }
      get names() {
        const _ = super.names;
        return x(_, this.condition), this.else && V(_, this.else.names), _;
      }
    }
    y.kind = "if";
    class v extends p {
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
          return this.iteration = C(this.iteration, _, R), this;
      }
      get names() {
        return V(super.names, this.iteration.names);
      }
    }
    class b extends v {
      constructor(_, R, D, Y) {
        super(), this.varKind = _, this.name = R, this.from = D, this.to = Y;
      }
      render(_) {
        const R = _.es5 ? r.varKinds.var : this.varKind, { name: D, from: Y, to: J } = this;
        return `for(${R} ${D}=${Y}; ${D}<${J}; ${D}++)` + super.render(_);
      }
      get names() {
        const _ = x(super.names, this.from);
        return x(_, this.to);
      }
    }
    class $ extends v {
      constructor(_, R, D, Y) {
        super(), this.loop = _, this.varKind = R, this.name = D, this.iterable = Y;
      }
      render(_) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(_);
      }
      optimizeNames(_, R) {
        if (super.optimizeNames(_, R))
          return this.iterable = C(this.iterable, _, R), this;
      }
      get names() {
        return V(super.names, this.iterable.names);
      }
    }
    class S extends p {
      constructor(_, R, D) {
        super(), this.name = _, this.args = R, this.async = D;
      }
      render(_) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(_);
      }
    }
    S.kind = "func";
    class E extends h {
      render(_) {
        return "return " + super.render(_);
      }
    }
    E.kind = "return";
    class N extends p {
      render(_) {
        let R = "try" + super.render(_);
        return this.catch && (R += this.catch.render(_)), this.finally && (R += this.finally.render(_)), R;
      }
      optimizeNodes() {
        var _, R;
        return super.optimizeNodes(), (_ = this.catch) === null || _ === void 0 || _.optimizeNodes(), (R = this.finally) === null || R === void 0 || R.optimizeNodes(), this;
      }
      optimizeNames(_, R) {
        var D, Y;
        return super.optimizeNames(_, R), (D = this.catch) === null || D === void 0 || D.optimizeNames(_, R), (Y = this.finally) === null || Y === void 0 || Y.optimizeNames(_, R), this;
      }
      get names() {
        const _ = super.names;
        return this.catch && V(_, this.catch.names), this.finally && V(_, this.finally.names), _;
      }
    }
    class O extends p {
      constructor(_) {
        super(), this.error = _;
      }
      render(_) {
        return `catch(${this.error})` + super.render(_);
      }
    }
    O.kind = "catch";
    class M extends p {
      render(_) {
        return "finally" + super.render(_);
      }
    }
    M.kind = "finally";
    class T {
      constructor(_, R = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...R, _n: R.lines ? `
` : "" }, this._extScope = _, this._scope = new r.Scope({ parent: _ }), this._nodes = [new g()];
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
        const D = this._extScope.value(_, R);
        return (this._values[D.prefix] || (this._values[D.prefix] = /* @__PURE__ */ new Set())).add(D), D;
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
      _def(_, R, D, Y) {
        const J = this._scope.toName(R);
        return D !== void 0 && Y && (this._constants[J.str] = D), this._leafNode(new o(_, J, D)), J;
      }
      // `const` declaration (`var` in es5 mode)
      const(_, R, D) {
        return this._def(r.varKinds.const, _, R, D);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(_, R, D) {
        return this._def(r.varKinds.let, _, R, D);
      }
      // `var` declaration with optional assignment
      var(_, R, D) {
        return this._def(r.varKinds.var, _, R, D);
      }
      // assignment code
      assign(_, R, D) {
        return this._leafNode(new f(_, R, D));
      }
      // `+=` code
      add(_, R) {
        return this._leafNode(new d(_, t.operators.ADD, R));
      }
      // appends passed SafeExpr to code or executes Block
      code(_) {
        return typeof _ == "function" ? _() : _ !== e.nil && this._leafNode(new a(_)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(..._) {
        const R = ["{"];
        for (const [D, Y] of _)
          R.length > 1 && R.push(","), R.push(D), (D !== Y || this.opts.es5) && (R.push(":"), (0, e.addCodeArg)(R, Y));
        return R.push("}"), new e._Code(R);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(_, R, D) {
        if (this._blockNode(new y(_)), R && D)
          this.code(R).else().code(D).endIf();
        else if (R)
          this.code(R).endIf();
        else if (D)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(_) {
        return this._elseNode(new y(_));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new m());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(y, m);
      }
      _for(_, R) {
        return this._blockNode(_), R && this.code(R).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(_, R) {
        return this._for(new w(_), R);
      }
      // `for` statement for a range of values
      forRange(_, R, D, Y, J = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
        const ne = this._scope.toName(_);
        return this._for(new b(J, ne, R, D), () => Y(ne));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(_, R, D, Y = r.varKinds.const) {
        const J = this._scope.toName(_);
        if (this.opts.es5) {
          const ne = R instanceof e.Name ? R : this.var("_arr", R);
          return this.forRange("_i", 0, (0, e._)`${ne}.length`, (te) => {
            this.var(J, (0, e._)`${ne}[${te}]`), D(J);
          });
        }
        return this._for(new $("of", Y, J, R), () => D(J));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(_, R, D, Y = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(_, (0, e._)`Object.keys(${R})`, D);
        const J = this._scope.toName(_);
        return this._for(new $("in", Y, J, R), () => D(J));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(v);
      }
      // `label` statement
      label(_) {
        return this._leafNode(new u(_));
      }
      // `break` statement
      break(_) {
        return this._leafNode(new n(_));
      }
      // `return` statement
      return(_) {
        const R = new E();
        if (this._blockNode(R), this.code(_), R.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(E);
      }
      // `try` statement
      try(_, R, D) {
        if (!R && !D)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const Y = new N();
        if (this._blockNode(Y), this.code(_), R) {
          const J = this.name("e");
          this._currNode = Y.catch = new O(J), R(J);
        }
        return D && (this._currNode = Y.finally = new M(), this.code(D)), this._endBlockNode(O, M);
      }
      // `throw` statement
      throw(_) {
        return this._leafNode(new i(_));
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
        const D = this._nodes.length - R;
        if (D < 0 || _ !== void 0 && D !== _)
          throw new Error(`CodeGen: wrong number of nodes: ${D} vs ${_} expected`);
        return this._nodes.length = R, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(_, R = e.nil, D, Y) {
        return this._blockNode(new S(_, R, D)), Y && this.code(Y).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(S);
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
        const D = this._currNode;
        if (D instanceof _ || R && D instanceof R)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${R ? `${_.kind}/${R.kind}` : _.kind}"`);
      }
      _elseNode(_) {
        const R = this._currNode;
        if (!(R instanceof y))
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
    t.CodeGen = T;
    function V(I, _) {
      for (const R in _)
        I[R] = (I[R] || 0) + (_[R] || 0);
      return I;
    }
    function x(I, _) {
      return _ instanceof e._CodeOrName ? V(I, _.names) : I;
    }
    function C(I, _, R) {
      if (I instanceof e.Name)
        return D(I);
      if (!Y(I))
        return I;
      return new e._Code(I._items.reduce((J, ne) => (ne instanceof e.Name && (ne = D(ne)), ne instanceof e._Code ? J.push(...ne._items) : J.push(ne), J), []));
      function D(J) {
        const ne = R[J.str];
        return ne === void 0 || _[J.str] !== 1 ? J : (delete _[J.str], ne);
      }
      function Y(J) {
        return J instanceof e._Code && J._items.some((ne) => ne instanceof e.Name && _[ne.str] === 1 && R[ne.str] !== void 0);
      }
    }
    function j(I, _) {
      for (const R in _)
        I[R] = (I[R] || 0) - (_[R] || 0);
    }
    function z(I) {
      return typeof I == "boolean" || typeof I == "number" || I === null ? !I : (0, e._)`!${L(I)}`;
    }
    t.not = z;
    const F = A(t.operators.AND);
    function B(...I) {
      return I.reduce(F);
    }
    t.and = B;
    const K = A(t.operators.OR);
    function q(...I) {
      return I.reduce(K);
    }
    t.or = q;
    function A(I) {
      return (_, R) => _ === e.nil ? R : R === e.nil ? _ : (0, e._)`${L(_)} ${I} ${L(R)}`;
    }
    function L(I) {
      return I instanceof e.Name ? I : (0, e._)`(${I})`;
    }
  })(Fn)), Fn;
}
var Q = {}, ga;
function ee() {
  if (ga) return Q;
  ga = 1, Object.defineProperty(Q, "__esModule", { value: !0 }), Q.checkStrictMode = Q.getErrorPath = Q.Type = Q.useFunc = Q.setEvaluated = Q.evaluatedPropsToName = Q.mergeEvaluated = Q.eachItem = Q.unescapeJsonPointer = Q.escapeJsonPointer = Q.escapeFragment = Q.unescapeFragment = Q.schemaRefOrVal = Q.schemaHasRulesButRef = Q.schemaHasRules = Q.checkUnknownRules = Q.alwaysValidSchema = Q.toHash = void 0;
  const t = X(), e = on();
  function r($) {
    const S = {};
    for (const E of $)
      S[E] = !0;
    return S;
  }
  Q.toHash = r;
  function s($, S) {
    return typeof S == "boolean" ? S : Object.keys(S).length === 0 ? !0 : (l($, S), !c(S, $.self.RULES.all));
  }
  Q.alwaysValidSchema = s;
  function l($, S = $.schema) {
    const { opts: E, self: N } = $;
    if (!E.strictSchema || typeof S == "boolean")
      return;
    const O = N.RULES.keywords;
    for (const M in S)
      O[M] || b($, `unknown keyword: "${M}"`);
  }
  Q.checkUnknownRules = l;
  function c($, S) {
    if (typeof $ == "boolean")
      return !$;
    for (const E in $)
      if (S[E])
        return !0;
    return !1;
  }
  Q.schemaHasRules = c;
  function o($, S) {
    if (typeof $ == "boolean")
      return !$;
    for (const E in $)
      if (E !== "$ref" && S.all[E])
        return !0;
    return !1;
  }
  Q.schemaHasRulesButRef = o;
  function f({ topSchemaRef: $, schemaPath: S }, E, N, O) {
    if (!O) {
      if (typeof E == "number" || typeof E == "boolean")
        return E;
      if (typeof E == "string")
        return (0, t._)`${E}`;
    }
    return (0, t._)`${$}${S}${(0, t.getProperty)(N)}`;
  }
  Q.schemaRefOrVal = f;
  function d($) {
    return i(decodeURIComponent($));
  }
  Q.unescapeFragment = d;
  function u($) {
    return encodeURIComponent(n($));
  }
  Q.escapeFragment = u;
  function n($) {
    return typeof $ == "number" ? `${$}` : $.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  Q.escapeJsonPointer = n;
  function i($) {
    return $.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  Q.unescapeJsonPointer = i;
  function a($, S) {
    if (Array.isArray($))
      for (const E of $)
        S(E);
    else
      S($);
  }
  Q.eachItem = a;
  function h({ mergeNames: $, mergeToName: S, mergeValues: E, resultToName: N }) {
    return (O, M, T, V) => {
      const x = T === void 0 ? M : T instanceof t.Name ? (M instanceof t.Name ? $(O, M, T) : S(O, M, T), T) : M instanceof t.Name ? (S(O, T, M), M) : E(M, T);
      return V === t.Name && !(x instanceof t.Name) ? N(O, x) : x;
    };
  }
  Q.mergeEvaluated = {
    props: h({
      mergeNames: ($, S, E) => $.if((0, t._)`${E} !== true && ${S} !== undefined`, () => {
        $.if((0, t._)`${S} === true`, () => $.assign(E, !0), () => $.assign(E, (0, t._)`${E} || {}`).code((0, t._)`Object.assign(${E}, ${S})`));
      }),
      mergeToName: ($, S, E) => $.if((0, t._)`${E} !== true`, () => {
        S === !0 ? $.assign(E, !0) : ($.assign(E, (0, t._)`${E} || {}`), g($, E, S));
      }),
      mergeValues: ($, S) => $ === !0 ? !0 : { ...$, ...S },
      resultToName: p
    }),
    items: h({
      mergeNames: ($, S, E) => $.if((0, t._)`${E} !== true && ${S} !== undefined`, () => $.assign(E, (0, t._)`${S} === true ? true : ${E} > ${S} ? ${E} : ${S}`)),
      mergeToName: ($, S, E) => $.if((0, t._)`${E} !== true`, () => $.assign(E, S === !0 ? !0 : (0, t._)`${E} > ${S} ? ${E} : ${S}`)),
      mergeValues: ($, S) => $ === !0 ? !0 : Math.max($, S),
      resultToName: ($, S) => $.var("items", S)
    })
  };
  function p($, S) {
    if (S === !0)
      return $.var("props", !0);
    const E = $.var("props", (0, t._)`{}`);
    return S !== void 0 && g($, E, S), E;
  }
  Q.evaluatedPropsToName = p;
  function g($, S, E) {
    Object.keys(E).forEach((N) => $.assign((0, t._)`${S}${(0, t.getProperty)(N)}`, !0));
  }
  Q.setEvaluated = g;
  const m = {};
  function y($, S) {
    return $.scopeValue("func", {
      ref: S,
      code: m[S.code] || (m[S.code] = new e._Code(S.code))
    });
  }
  Q.useFunc = y;
  var v;
  (function($) {
    $[$.Num = 0] = "Num", $[$.Str = 1] = "Str";
  })(v || (Q.Type = v = {}));
  function w($, S, E) {
    if ($ instanceof t.Name) {
      const N = S === v.Num;
      return E ? N ? (0, t._)`"[" + ${$} + "]"` : (0, t._)`"['" + ${$} + "']"` : N ? (0, t._)`"/" + ${$}` : (0, t._)`"/" + ${$}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return E ? (0, t.getProperty)($).toString() : "/" + n($);
  }
  Q.getErrorPath = w;
  function b($, S, E = $.opts.strictSchema) {
    if (E) {
      if (S = `strict mode: ${S}`, E === !0)
        throw new Error(S);
      $.self.logger.warn(S);
    }
  }
  return Q.checkStrictMode = b, Q;
}
var Gt = {}, ya;
function Ie() {
  if (ya) return Gt;
  ya = 1, Object.defineProperty(Gt, "__esModule", { value: !0 });
  const t = X(), e = {
    // validation function arguments
    data: new t.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new t.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new t.Name("instancePath"),
    parentData: new t.Name("parentData"),
    parentDataProperty: new t.Name("parentDataProperty"),
    rootData: new t.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new t.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new t.Name("vErrors"),
    // null or array of validation errors
    errors: new t.Name("errors"),
    // counter of validation errors
    this: new t.Name("this"),
    // "globals"
    self: new t.Name("self"),
    scope: new t.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new t.Name("json"),
    jsonPos: new t.Name("jsonPos"),
    jsonLen: new t.Name("jsonLen"),
    jsonPart: new t.Name("jsonPart")
  };
  return Gt.default = e, Gt;
}
var va;
function dn() {
  return va || (va = 1, (function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.extendErrors = t.resetErrorsCount = t.reportExtraError = t.reportError = t.keyword$DataError = t.keywordError = void 0;
    const e = X(), r = ee(), s = Ie();
    t.keywordError = {
      message: ({ keyword: m }) => (0, e.str)`must pass "${m}" keyword validation`
    }, t.keyword$DataError = {
      message: ({ keyword: m, schemaType: y }) => y ? (0, e.str)`"${m}" keyword must be ${y} ($data)` : (0, e.str)`"${m}" keyword is invalid ($data)`
    };
    function l(m, y = t.keywordError, v, w) {
      const { it: b } = m, { gen: $, compositeRule: S, allErrors: E } = b, N = i(m, y, v);
      w ?? (S || E) ? d($, N) : u(b, (0, e._)`[${N}]`);
    }
    t.reportError = l;
    function c(m, y = t.keywordError, v) {
      const { it: w } = m, { gen: b, compositeRule: $, allErrors: S } = w, E = i(m, y, v);
      d(b, E), $ || S || u(w, s.default.vErrors);
    }
    t.reportExtraError = c;
    function o(m, y) {
      m.assign(s.default.errors, y), m.if((0, e._)`${s.default.vErrors} !== null`, () => m.if(y, () => m.assign((0, e._)`${s.default.vErrors}.length`, y), () => m.assign(s.default.vErrors, null)));
    }
    t.resetErrorsCount = o;
    function f({ gen: m, keyword: y, schemaValue: v, data: w, errsCount: b, it: $ }) {
      if (b === void 0)
        throw new Error("ajv implementation error");
      const S = m.name("err");
      m.forRange("i", b, s.default.errors, (E) => {
        m.const(S, (0, e._)`${s.default.vErrors}[${E}]`), m.if((0, e._)`${S}.instancePath === undefined`, () => m.assign((0, e._)`${S}.instancePath`, (0, e.strConcat)(s.default.instancePath, $.errorPath))), m.assign((0, e._)`${S}.schemaPath`, (0, e.str)`${$.errSchemaPath}/${y}`), $.opts.verbose && (m.assign((0, e._)`${S}.schema`, v), m.assign((0, e._)`${S}.data`, w));
      });
    }
    t.extendErrors = f;
    function d(m, y) {
      const v = m.const("err", y);
      m.if((0, e._)`${s.default.vErrors} === null`, () => m.assign(s.default.vErrors, (0, e._)`[${v}]`), (0, e._)`${s.default.vErrors}.push(${v})`), m.code((0, e._)`${s.default.errors}++`);
    }
    function u(m, y) {
      const { gen: v, validateName: w, schemaEnv: b } = m;
      b.$async ? v.throw((0, e._)`new ${m.ValidationError}(${y})`) : (v.assign((0, e._)`${w}.errors`, y), v.return(!1));
    }
    const n = {
      keyword: new e.Name("keyword"),
      schemaPath: new e.Name("schemaPath"),
      // also used in JTD errors
      params: new e.Name("params"),
      propertyName: new e.Name("propertyName"),
      message: new e.Name("message"),
      schema: new e.Name("schema"),
      parentSchema: new e.Name("parentSchema")
    };
    function i(m, y, v) {
      const { createErrors: w } = m.it;
      return w === !1 ? (0, e._)`{}` : a(m, y, v);
    }
    function a(m, y, v = {}) {
      const { gen: w, it: b } = m, $ = [
        h(b, v),
        p(m, v)
      ];
      return g(m, y, $), w.object(...$);
    }
    function h({ errorPath: m }, { instancePath: y }) {
      const v = y ? (0, e.str)`${m}${(0, r.getErrorPath)(y, r.Type.Str)}` : m;
      return [s.default.instancePath, (0, e.strConcat)(s.default.instancePath, v)];
    }
    function p({ keyword: m, it: { errSchemaPath: y } }, { schemaPath: v, parentSchema: w }) {
      let b = w ? y : (0, e.str)`${y}/${m}`;
      return v && (b = (0, e.str)`${b}${(0, r.getErrorPath)(v, r.Type.Str)}`), [n.schemaPath, b];
    }
    function g(m, { params: y, message: v }, w) {
      const { keyword: b, data: $, schemaValue: S, it: E } = m, { opts: N, propertyName: O, topSchemaRef: M, schemaPath: T } = E;
      w.push([n.keyword, b], [n.params, typeof y == "function" ? y(m) : y || (0, e._)`{}`]), N.messages && w.push([n.message, typeof v == "function" ? v(m) : v]), N.verbose && w.push([n.schema, S], [n.parentSchema, (0, e._)`${M}${T}`], [s.default.data, $]), O && w.push([n.propertyName, O]);
    }
  })(jn)), jn;
}
var $a;
function ud() {
  if ($a) return ze;
  $a = 1, Object.defineProperty(ze, "__esModule", { value: !0 }), ze.boolOrEmptySchema = ze.topBoolOrEmptySchema = void 0;
  const t = dn(), e = X(), r = Ie(), s = {
    message: "boolean schema is false"
  };
  function l(f) {
    const { gen: d, schema: u, validateName: n } = f;
    u === !1 ? o(f, !1) : typeof u == "object" && u.$async === !0 ? d.return(r.default.data) : (d.assign((0, e._)`${n}.errors`, null), d.return(!0));
  }
  ze.topBoolOrEmptySchema = l;
  function c(f, d) {
    const { gen: u, schema: n } = f;
    n === !1 ? (u.var(d, !1), o(f)) : u.var(d, !0);
  }
  ze.boolOrEmptySchema = c;
  function o(f, d) {
    const { gen: u, data: n } = f, i = {
      gen: u,
      keyword: "false schema",
      data: n,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: f
    };
    (0, t.reportError)(i, s, void 0, d);
  }
  return ze;
}
var he = {}, Ge = {}, wa;
function Nu() {
  if (wa) return Ge;
  wa = 1, Object.defineProperty(Ge, "__esModule", { value: !0 }), Ge.getRules = Ge.isJSONType = void 0;
  const t = ["string", "number", "integer", "boolean", "null", "object", "array"], e = new Set(t);
  function r(l) {
    return typeof l == "string" && e.has(l);
  }
  Ge.isJSONType = r;
  function s() {
    const l = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...l, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, l.number, l.string, l.array, l.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return Ge.getRules = s, Ge;
}
var qe = {}, ba;
function Ru() {
  if (ba) return qe;
  ba = 1, Object.defineProperty(qe, "__esModule", { value: !0 }), qe.shouldUseRule = qe.shouldUseGroup = qe.schemaHasRulesForType = void 0;
  function t({ schema: s, self: l }, c) {
    const o = l.RULES.types[c];
    return o && o !== !0 && e(s, o);
  }
  qe.schemaHasRulesForType = t;
  function e(s, l) {
    return l.rules.some((c) => r(s, c));
  }
  qe.shouldUseGroup = e;
  function r(s, l) {
    var c;
    return s[l.keyword] !== void 0 || ((c = l.definition.implements) === null || c === void 0 ? void 0 : c.some((o) => s[o] !== void 0));
  }
  return qe.shouldUseRule = r, qe;
}
var Sa;
function cn() {
  if (Sa) return he;
  Sa = 1, Object.defineProperty(he, "__esModule", { value: !0 }), he.reportTypeError = he.checkDataTypes = he.checkDataType = he.coerceAndCheckDataType = he.getJSONTypes = he.getSchemaTypes = he.DataType = void 0;
  const t = Nu(), e = Ru(), r = dn(), s = X(), l = ee();
  var c;
  (function(v) {
    v[v.Correct = 0] = "Correct", v[v.Wrong = 1] = "Wrong";
  })(c || (he.DataType = c = {}));
  function o(v) {
    const w = f(v.type);
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
  function f(v) {
    const w = Array.isArray(v) ? v : v ? [v] : [];
    if (w.every(t.isJSONType))
      return w;
    throw new Error("type must be JSONType or JSONType[]: " + w.join(","));
  }
  he.getJSONTypes = f;
  function d(v, w) {
    const { gen: b, data: $, opts: S } = v, E = n(w, S.coerceTypes), N = w.length > 0 && !(E.length === 0 && w.length === 1 && (0, e.schemaHasRulesForType)(v, w[0]));
    if (N) {
      const O = p(w, $, S.strictNumbers, c.Wrong);
      b.if(O, () => {
        E.length ? i(v, w, E) : m(v);
      });
    }
    return N;
  }
  he.coerceAndCheckDataType = d;
  const u = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function n(v, w) {
    return w ? v.filter((b) => u.has(b) || w === "array" && b === "array") : [];
  }
  function i(v, w, b) {
    const { gen: $, data: S, opts: E } = v, N = $.let("dataType", (0, s._)`typeof ${S}`), O = $.let("coerced", (0, s._)`undefined`);
    E.coerceTypes === "array" && $.if((0, s._)`${N} == 'object' && Array.isArray(${S}) && ${S}.length == 1`, () => $.assign(S, (0, s._)`${S}[0]`).assign(N, (0, s._)`typeof ${S}`).if(p(w, S, E.strictNumbers), () => $.assign(O, S))), $.if((0, s._)`${O} !== undefined`);
    for (const T of b)
      (u.has(T) || T === "array" && E.coerceTypes === "array") && M(T);
    $.else(), m(v), $.endIf(), $.if((0, s._)`${O} !== undefined`, () => {
      $.assign(S, O), a(v, O);
    });
    function M(T) {
      switch (T) {
        case "string":
          $.elseIf((0, s._)`${N} == "number" || ${N} == "boolean"`).assign(O, (0, s._)`"" + ${S}`).elseIf((0, s._)`${S} === null`).assign(O, (0, s._)`""`);
          return;
        case "number":
          $.elseIf((0, s._)`${N} == "boolean" || ${S} === null
              || (${N} == "string" && ${S} && ${S} == +${S})`).assign(O, (0, s._)`+${S}`);
          return;
        case "integer":
          $.elseIf((0, s._)`${N} === "boolean" || ${S} === null
              || (${N} === "string" && ${S} && ${S} == +${S} && !(${S} % 1))`).assign(O, (0, s._)`+${S}`);
          return;
        case "boolean":
          $.elseIf((0, s._)`${S} === "false" || ${S} === 0 || ${S} === null`).assign(O, !1).elseIf((0, s._)`${S} === "true" || ${S} === 1`).assign(O, !0);
          return;
        case "null":
          $.elseIf((0, s._)`${S} === "" || ${S} === 0 || ${S} === false`), $.assign(O, null);
          return;
        case "array":
          $.elseIf((0, s._)`${N} === "string" || ${N} === "number"
              || ${N} === "boolean" || ${S} === null`).assign(O, (0, s._)`[${S}]`);
      }
    }
  }
  function a({ gen: v, parentData: w, parentDataProperty: b }, $) {
    v.if((0, s._)`${w} !== undefined`, () => v.assign((0, s._)`${w}[${b}]`, $));
  }
  function h(v, w, b, $ = c.Correct) {
    const S = $ === c.Correct ? s.operators.EQ : s.operators.NEQ;
    let E;
    switch (v) {
      case "null":
        return (0, s._)`${w} ${S} null`;
      case "array":
        E = (0, s._)`Array.isArray(${w})`;
        break;
      case "object":
        E = (0, s._)`${w} && typeof ${w} == "object" && !Array.isArray(${w})`;
        break;
      case "integer":
        E = N((0, s._)`!(${w} % 1) && !isNaN(${w})`);
        break;
      case "number":
        E = N();
        break;
      default:
        return (0, s._)`typeof ${w} ${S} ${v}`;
    }
    return $ === c.Correct ? E : (0, s.not)(E);
    function N(O = s.nil) {
      return (0, s.and)((0, s._)`typeof ${w} == "number"`, O, b ? (0, s._)`isFinite(${w})` : s.nil);
    }
  }
  he.checkDataType = h;
  function p(v, w, b, $) {
    if (v.length === 1)
      return h(v[0], w, b, $);
    let S;
    const E = (0, l.toHash)(v);
    if (E.array && E.object) {
      const N = (0, s._)`typeof ${w} != "object"`;
      S = E.null ? N : (0, s._)`!${w} || ${N}`, delete E.null, delete E.array, delete E.object;
    } else
      S = s.nil;
    E.number && delete E.integer;
    for (const N in E)
      S = (0, s.and)(S, h(N, w, b, $));
    return S;
  }
  he.checkDataTypes = p;
  const g = {
    message: ({ schema: v }) => `must be ${v}`,
    params: ({ schema: v, schemaValue: w }) => typeof v == "string" ? (0, s._)`{type: ${v}}` : (0, s._)`{type: ${w}}`
  };
  function m(v) {
    const w = y(v);
    (0, r.reportError)(w, g);
  }
  he.reportTypeError = m;
  function y(v) {
    const { gen: w, data: b, schema: $ } = v, S = (0, l.schemaRefOrVal)(v, $, "type");
    return {
      gen: w,
      keyword: "type",
      data: b,
      schema: $.type,
      schemaCode: S,
      schemaValue: S,
      parentSchema: $,
      params: {},
      it: v
    };
  }
  return he;
}
var bt = {}, Ea;
function fd() {
  if (Ea) return bt;
  Ea = 1, Object.defineProperty(bt, "__esModule", { value: !0 }), bt.assignDefaults = void 0;
  const t = X(), e = ee();
  function r(l, c) {
    const { properties: o, items: f } = l.schema;
    if (c === "object" && o)
      for (const d in o)
        s(l, d, o[d].default);
    else c === "array" && Array.isArray(f) && f.forEach((d, u) => s(l, u, d.default));
  }
  bt.assignDefaults = r;
  function s(l, c, o) {
    const { gen: f, compositeRule: d, data: u, opts: n } = l;
    if (o === void 0)
      return;
    const i = (0, t._)`${u}${(0, t.getProperty)(c)}`;
    if (d) {
      (0, e.checkStrictMode)(l, `default is ignored for: ${i}`);
      return;
    }
    let a = (0, t._)`${i} === undefined`;
    n.useDefaults === "empty" && (a = (0, t._)`${a} || ${i} === null || ${i} === ""`), f.if(a, (0, t._)`${i} = ${(0, t.stringify)(o)}`);
  }
  return bt;
}
var Ae = {}, ie = {}, _a;
function Pe() {
  if (_a) return ie;
  _a = 1, Object.defineProperty(ie, "__esModule", { value: !0 }), ie.validateUnion = ie.validateArray = ie.usePattern = ie.callValidateCode = ie.schemaProperties = ie.allSchemaProperties = ie.noPropertyInData = ie.propertyInData = ie.isOwnProperty = ie.hasPropFunc = ie.reportMissingProp = ie.checkMissingProp = ie.checkReportMissingProp = void 0;
  const t = X(), e = ee(), r = Ie(), s = ee();
  function l(v, w) {
    const { gen: b, data: $, it: S } = v;
    b.if(n(b, $, w, S.opts.ownProperties), () => {
      v.setParams({ missingProperty: (0, t._)`${w}` }, !0), v.error();
    });
  }
  ie.checkReportMissingProp = l;
  function c({ gen: v, data: w, it: { opts: b } }, $, S) {
    return (0, t.or)(...$.map((E) => (0, t.and)(n(v, w, E, b.ownProperties), (0, t._)`${S} = ${E}`)));
  }
  ie.checkMissingProp = c;
  function o(v, w) {
    v.setParams({ missingProperty: w }, !0), v.error();
  }
  ie.reportMissingProp = o;
  function f(v) {
    return v.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, t._)`Object.prototype.hasOwnProperty`
    });
  }
  ie.hasPropFunc = f;
  function d(v, w, b) {
    return (0, t._)`${f(v)}.call(${w}, ${b})`;
  }
  ie.isOwnProperty = d;
  function u(v, w, b, $) {
    const S = (0, t._)`${w}${(0, t.getProperty)(b)} !== undefined`;
    return $ ? (0, t._)`${S} && ${d(v, w, b)}` : S;
  }
  ie.propertyInData = u;
  function n(v, w, b, $) {
    const S = (0, t._)`${w}${(0, t.getProperty)(b)} === undefined`;
    return $ ? (0, t.or)(S, (0, t.not)(d(v, w, b))) : S;
  }
  ie.noPropertyInData = n;
  function i(v) {
    return v ? Object.keys(v).filter((w) => w !== "__proto__") : [];
  }
  ie.allSchemaProperties = i;
  function a(v, w) {
    return i(w).filter((b) => !(0, e.alwaysValidSchema)(v, w[b]));
  }
  ie.schemaProperties = a;
  function h({ schemaCode: v, data: w, it: { gen: b, topSchemaRef: $, schemaPath: S, errorPath: E }, it: N }, O, M, T) {
    const V = T ? (0, t._)`${v}, ${w}, ${$}${S}` : w, x = [
      [r.default.instancePath, (0, t.strConcat)(r.default.instancePath, E)],
      [r.default.parentData, N.parentData],
      [r.default.parentDataProperty, N.parentDataProperty],
      [r.default.rootData, r.default.rootData]
    ];
    N.opts.dynamicRef && x.push([r.default.dynamicAnchors, r.default.dynamicAnchors]);
    const C = (0, t._)`${V}, ${b.object(...x)}`;
    return M !== t.nil ? (0, t._)`${O}.call(${M}, ${C})` : (0, t._)`${O}(${C})`;
  }
  ie.callValidateCode = h;
  const p = (0, t._)`new RegExp`;
  function g({ gen: v, it: { opts: w } }, b) {
    const $ = w.unicodeRegExp ? "u" : "", { regExp: S } = w.code, E = S(b, $);
    return v.scopeValue("pattern", {
      key: E.toString(),
      ref: E,
      code: (0, t._)`${S.code === "new RegExp" ? p : (0, s.useFunc)(v, S)}(${b}, ${$})`
    });
  }
  ie.usePattern = g;
  function m(v) {
    const { gen: w, data: b, keyword: $, it: S } = v, E = w.name("valid");
    if (S.allErrors) {
      const O = w.let("valid", !0);
      return N(() => w.assign(O, !1)), O;
    }
    return w.var(E, !0), N(() => w.break()), E;
    function N(O) {
      const M = w.const("len", (0, t._)`${b}.length`);
      w.forRange("i", 0, M, (T) => {
        v.subschema({
          keyword: $,
          dataProp: T,
          dataPropType: e.Type.Num
        }, E), w.if((0, t.not)(E), O);
      });
    }
  }
  ie.validateArray = m;
  function y(v) {
    const { gen: w, schema: b, keyword: $, it: S } = v;
    if (!Array.isArray(b))
      throw new Error("ajv implementation error");
    if (b.some((M) => (0, e.alwaysValidSchema)(S, M)) && !S.opts.unevaluated)
      return;
    const N = w.let("valid", !1), O = w.name("_valid");
    w.block(() => b.forEach((M, T) => {
      const V = v.subschema({
        keyword: $,
        schemaProp: T,
        compositeRule: !0
      }, O);
      w.assign(N, (0, t._)`${N} || ${O}`), v.mergeValidEvaluated(V, O) || w.if((0, t.not)(N));
    })), v.result(N, () => v.reset(), () => v.error(!0));
  }
  return ie.validateUnion = y, ie;
}
var Na;
function dd() {
  if (Na) return Ae;
  Na = 1, Object.defineProperty(Ae, "__esModule", { value: !0 }), Ae.validateKeywordUsage = Ae.validSchemaType = Ae.funcKeywordCode = Ae.macroKeywordCode = void 0;
  const t = X(), e = Ie(), r = Pe(), s = dn();
  function l(a, h) {
    const { gen: p, keyword: g, schema: m, parentSchema: y, it: v } = a, w = h.macro.call(v.self, m, y, v), b = u(p, g, w);
    v.opts.validateSchema !== !1 && v.self.validateSchema(w, !0);
    const $ = p.name("valid");
    a.subschema({
      schema: w,
      schemaPath: t.nil,
      errSchemaPath: `${v.errSchemaPath}/${g}`,
      topSchemaRef: b,
      compositeRule: !0
    }, $), a.pass($, () => a.error(!0));
  }
  Ae.macroKeywordCode = l;
  function c(a, h) {
    var p;
    const { gen: g, keyword: m, schema: y, parentSchema: v, $data: w, it: b } = a;
    d(b, h);
    const $ = !w && h.compile ? h.compile.call(b.self, y, v, b) : h.validate, S = u(g, m, $), E = g.let("valid");
    a.block$data(E, N), a.ok((p = h.valid) !== null && p !== void 0 ? p : E);
    function N() {
      if (h.errors === !1)
        T(), h.modifying && o(a), V(() => a.error());
      else {
        const x = h.async ? O() : M();
        h.modifying && o(a), V(() => f(a, x));
      }
    }
    function O() {
      const x = g.let("ruleErrs", null);
      return g.try(() => T((0, t._)`await `), (C) => g.assign(E, !1).if((0, t._)`${C} instanceof ${b.ValidationError}`, () => g.assign(x, (0, t._)`${C}.errors`), () => g.throw(C))), x;
    }
    function M() {
      const x = (0, t._)`${S}.errors`;
      return g.assign(x, null), T(t.nil), x;
    }
    function T(x = h.async ? (0, t._)`await ` : t.nil) {
      const C = b.opts.passContext ? e.default.this : e.default.self, j = !("compile" in h && !w || h.schema === !1);
      g.assign(E, (0, t._)`${x}${(0, r.callValidateCode)(a, S, C, j)}`, h.modifying);
    }
    function V(x) {
      var C;
      g.if((0, t.not)((C = h.valid) !== null && C !== void 0 ? C : E), x);
    }
  }
  Ae.funcKeywordCode = c;
  function o(a) {
    const { gen: h, data: p, it: g } = a;
    h.if(g.parentData, () => h.assign(p, (0, t._)`${g.parentData}[${g.parentDataProperty}]`));
  }
  function f(a, h) {
    const { gen: p } = a;
    p.if((0, t._)`Array.isArray(${h})`, () => {
      p.assign(e.default.vErrors, (0, t._)`${e.default.vErrors} === null ? ${h} : ${e.default.vErrors}.concat(${h})`).assign(e.default.errors, (0, t._)`${e.default.vErrors}.length`), (0, s.extendErrors)(a);
    }, () => a.error());
  }
  function d({ schemaEnv: a }, h) {
    if (h.async && !a.$async)
      throw new Error("async keyword in sync schema");
  }
  function u(a, h, p) {
    if (p === void 0)
      throw new Error(`keyword "${h}" failed to compile`);
    return a.scopeValue("keyword", typeof p == "function" ? { ref: p } : { ref: p, code: (0, t.stringify)(p) });
  }
  function n(a, h, p = !1) {
    return !h.length || h.some((g) => g === "array" ? Array.isArray(a) : g === "object" ? a && typeof a == "object" && !Array.isArray(a) : typeof a == g || p && typeof a > "u");
  }
  Ae.validSchemaType = n;
  function i({ schema: a, opts: h, self: p, errSchemaPath: g }, m, y) {
    if (Array.isArray(m.keyword) ? !m.keyword.includes(y) : m.keyword !== y)
      throw new Error("ajv implementation error");
    const v = m.dependencies;
    if (v?.some((w) => !Object.prototype.hasOwnProperty.call(a, w)))
      throw new Error(`parent schema must have dependencies of ${y}: ${v.join(",")}`);
    if (m.validateSchema && !m.validateSchema(a[y])) {
      const b = `keyword "${y}" value is invalid at path "${g}": ` + p.errorsText(m.validateSchema.errors);
      if (h.validateSchema === "log")
        p.logger.error(b);
      else
        throw new Error(b);
    }
  }
  return Ae.validateKeywordUsage = i, Ae;
}
var Me = {}, Ra;
function hd() {
  if (Ra) return Me;
  Ra = 1, Object.defineProperty(Me, "__esModule", { value: !0 }), Me.extendSubschemaMode = Me.extendSubschemaData = Me.getSubschema = void 0;
  const t = X(), e = ee();
  function r(c, { keyword: o, schemaProp: f, schema: d, schemaPath: u, errSchemaPath: n, topSchemaRef: i }) {
    if (o !== void 0 && d !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (o !== void 0) {
      const a = c.schema[o];
      return f === void 0 ? {
        schema: a,
        schemaPath: (0, t._)`${c.schemaPath}${(0, t.getProperty)(o)}`,
        errSchemaPath: `${c.errSchemaPath}/${o}`
      } : {
        schema: a[f],
        schemaPath: (0, t._)`${c.schemaPath}${(0, t.getProperty)(o)}${(0, t.getProperty)(f)}`,
        errSchemaPath: `${c.errSchemaPath}/${o}/${(0, e.escapeFragment)(f)}`
      };
    }
    if (d !== void 0) {
      if (u === void 0 || n === void 0 || i === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: d,
        schemaPath: u,
        topSchemaRef: i,
        errSchemaPath: n
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  Me.getSubschema = r;
  function s(c, o, { dataProp: f, dataPropType: d, data: u, dataTypes: n, propertyName: i }) {
    if (u !== void 0 && f !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: a } = o;
    if (f !== void 0) {
      const { errorPath: p, dataPathArr: g, opts: m } = o, y = a.let("data", (0, t._)`${o.data}${(0, t.getProperty)(f)}`, !0);
      h(y), c.errorPath = (0, t.str)`${p}${(0, e.getErrorPath)(f, d, m.jsPropertySyntax)}`, c.parentDataProperty = (0, t._)`${f}`, c.dataPathArr = [...g, c.parentDataProperty];
    }
    if (u !== void 0) {
      const p = u instanceof t.Name ? u : a.let("data", u, !0);
      h(p), i !== void 0 && (c.propertyName = i);
    }
    n && (c.dataTypes = n);
    function h(p) {
      c.data = p, c.dataLevel = o.dataLevel + 1, c.dataTypes = [], o.definedProperties = /* @__PURE__ */ new Set(), c.parentData = o.data, c.dataNames = [...o.dataNames, p];
    }
  }
  Me.extendSubschemaData = s;
  function l(c, { jtdDiscriminator: o, jtdMetadata: f, compositeRule: d, createErrors: u, allErrors: n }) {
    d !== void 0 && (c.compositeRule = d), u !== void 0 && (c.createErrors = u), n !== void 0 && (c.allErrors = n), c.jtdDiscriminator = o, c.jtdMetadata = f;
  }
  return Me.extendSubschemaMode = l, Me;
}
var ye = {}, Bn, Aa;
function Au() {
  return Aa || (Aa = 1, Bn = function t(e, r) {
    if (e === r) return !0;
    if (e && r && typeof e == "object" && typeof r == "object") {
      if (e.constructor !== r.constructor) return !1;
      var s, l, c;
      if (Array.isArray(e)) {
        if (s = e.length, s != r.length) return !1;
        for (l = s; l-- !== 0; )
          if (!t(e[l], r[l])) return !1;
        return !0;
      }
      if (e.constructor === RegExp) return e.source === r.source && e.flags === r.flags;
      if (e.valueOf !== Object.prototype.valueOf) return e.valueOf() === r.valueOf();
      if (e.toString !== Object.prototype.toString) return e.toString() === r.toString();
      if (c = Object.keys(e), s = c.length, s !== Object.keys(r).length) return !1;
      for (l = s; l-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(r, c[l])) return !1;
      for (l = s; l-- !== 0; ) {
        var o = c[l];
        if (!t(e[o], r[o])) return !1;
      }
      return !0;
    }
    return e !== e && r !== r;
  }), Bn;
}
var Kn = { exports: {} }, Oa;
function pd() {
  if (Oa) return Kn.exports;
  Oa = 1;
  var t = Kn.exports = function(s, l, c) {
    typeof l == "function" && (c = l, l = {}), c = l.cb || c;
    var o = typeof c == "function" ? c : c.pre || function() {
    }, f = c.post || function() {
    };
    e(l, o, f, s, "", s);
  };
  t.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0,
    if: !0,
    then: !0,
    else: !0
  }, t.arrayKeywords = {
    items: !0,
    allOf: !0,
    anyOf: !0,
    oneOf: !0
  }, t.propsKeywords = {
    $defs: !0,
    definitions: !0,
    properties: !0,
    patternProperties: !0,
    dependencies: !0
  }, t.skipKeywords = {
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
  function e(s, l, c, o, f, d, u, n, i, a) {
    if (o && typeof o == "object" && !Array.isArray(o)) {
      l(o, f, d, u, n, i, a);
      for (var h in o) {
        var p = o[h];
        if (Array.isArray(p)) {
          if (h in t.arrayKeywords)
            for (var g = 0; g < p.length; g++)
              e(s, l, c, p[g], f + "/" + h + "/" + g, d, f, h, o, g);
        } else if (h in t.propsKeywords) {
          if (p && typeof p == "object")
            for (var m in p)
              e(s, l, c, p[m], f + "/" + h + "/" + r(m), d, f, h, o, m);
        } else (h in t.keywords || s.allKeys && !(h in t.skipKeywords)) && e(s, l, c, p, f + "/" + h, d, f, h, o);
      }
      c(o, f, d, u, n, i, a);
    }
  }
  function r(s) {
    return s.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return Kn.exports;
}
var Ia;
function hn() {
  if (Ia) return ye;
  Ia = 1, Object.defineProperty(ye, "__esModule", { value: !0 }), ye.getSchemaRefs = ye.resolveUrl = ye.normalizeId = ye._getFullPath = ye.getFullPath = ye.inlineRef = void 0;
  const t = ee(), e = Au(), r = pd(), s = /* @__PURE__ */ new Set([
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
  function l(g, m = !0) {
    return typeof g == "boolean" ? !0 : m === !0 ? !o(g) : m ? f(g) <= m : !1;
  }
  ye.inlineRef = l;
  const c = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function o(g) {
    for (const m in g) {
      if (c.has(m))
        return !0;
      const y = g[m];
      if (Array.isArray(y) && y.some(o) || typeof y == "object" && o(y))
        return !0;
    }
    return !1;
  }
  function f(g) {
    let m = 0;
    for (const y in g) {
      if (y === "$ref")
        return 1 / 0;
      if (m++, !s.has(y) && (typeof g[y] == "object" && (0, t.eachItem)(g[y], (v) => m += f(v)), m === 1 / 0))
        return 1 / 0;
    }
    return m;
  }
  function d(g, m = "", y) {
    y !== !1 && (m = i(m));
    const v = g.parse(m);
    return u(g, v);
  }
  ye.getFullPath = d;
  function u(g, m) {
    return g.serialize(m).split("#")[0] + "#";
  }
  ye._getFullPath = u;
  const n = /#\/?$/;
  function i(g) {
    return g ? g.replace(n, "") : "";
  }
  ye.normalizeId = i;
  function a(g, m, y) {
    return y = i(y), g.resolve(m, y);
  }
  ye.resolveUrl = a;
  const h = /^[a-z_][-a-z0-9._]*$/i;
  function p(g, m) {
    if (typeof g == "boolean")
      return {};
    const { schemaId: y, uriResolver: v } = this.opts, w = i(g[y] || m), b = { "": w }, $ = d(v, w, !1), S = {}, E = /* @__PURE__ */ new Set();
    return r(g, { allKeys: !0 }, (M, T, V, x) => {
      if (x === void 0)
        return;
      const C = $ + T;
      let j = b[x];
      typeof M[y] == "string" && (j = z.call(this, M[y])), F.call(this, M.$anchor), F.call(this, M.$dynamicAnchor), b[T] = j;
      function z(B) {
        const K = this.opts.uriResolver.resolve;
        if (B = i(j ? K(j, B) : B), E.has(B))
          throw O(B);
        E.add(B);
        let q = this.refs[B];
        return typeof q == "string" && (q = this.refs[q]), typeof q == "object" ? N(M, q.schema, B) : B !== i(C) && (B[0] === "#" ? (N(M, S[B], B), S[B] = M) : this.refs[B] = C), B;
      }
      function F(B) {
        if (typeof B == "string") {
          if (!h.test(B))
            throw new Error(`invalid anchor "${B}"`);
          z.call(this, `#${B}`);
        }
      }
    }), S;
    function N(M, T, V) {
      if (T !== void 0 && !e(M, T))
        throw O(V);
    }
    function O(M) {
      return new Error(`reference "${M}" resolves to more than one schema`);
    }
  }
  return ye.getSchemaRefs = p, ye;
}
var Pa;
function Dt() {
  if (Pa) return Le;
  Pa = 1, Object.defineProperty(Le, "__esModule", { value: !0 }), Le.getData = Le.KeywordCxt = Le.validateFunctionCode = void 0;
  const t = ud(), e = cn(), r = Ru(), s = cn(), l = fd(), c = dd(), o = hd(), f = X(), d = Ie(), u = hn(), n = ee(), i = dn();
  function a(P) {
    if ($(P) && (E(P), b(P))) {
      m(P);
      return;
    }
    h(P, () => (0, t.topBoolOrEmptySchema)(P));
  }
  Le.validateFunctionCode = a;
  function h({ gen: P, validateName: k, schema: U, schemaEnv: G, opts: H }, Z) {
    H.code.es5 ? P.func(k, (0, f._)`${d.default.data}, ${d.default.valCxt}`, G.$async, () => {
      P.code((0, f._)`"use strict"; ${v(U, H)}`), g(P, H), P.code(Z);
    }) : P.func(k, (0, f._)`${d.default.data}, ${p(H)}`, G.$async, () => P.code(v(U, H)).code(Z));
  }
  function p(P) {
    return (0, f._)`{${d.default.instancePath}="", ${d.default.parentData}, ${d.default.parentDataProperty}, ${d.default.rootData}=${d.default.data}${P.dynamicRef ? (0, f._)`, ${d.default.dynamicAnchors}={}` : f.nil}}={}`;
  }
  function g(P, k) {
    P.if(d.default.valCxt, () => {
      P.var(d.default.instancePath, (0, f._)`${d.default.valCxt}.${d.default.instancePath}`), P.var(d.default.parentData, (0, f._)`${d.default.valCxt}.${d.default.parentData}`), P.var(d.default.parentDataProperty, (0, f._)`${d.default.valCxt}.${d.default.parentDataProperty}`), P.var(d.default.rootData, (0, f._)`${d.default.valCxt}.${d.default.rootData}`), k.dynamicRef && P.var(d.default.dynamicAnchors, (0, f._)`${d.default.valCxt}.${d.default.dynamicAnchors}`);
    }, () => {
      P.var(d.default.instancePath, (0, f._)`""`), P.var(d.default.parentData, (0, f._)`undefined`), P.var(d.default.parentDataProperty, (0, f._)`undefined`), P.var(d.default.rootData, d.default.data), k.dynamicRef && P.var(d.default.dynamicAnchors, (0, f._)`{}`);
    });
  }
  function m(P) {
    const { schema: k, opts: U, gen: G } = P;
    h(P, () => {
      U.$comment && k.$comment && x(P), M(P), G.let(d.default.vErrors, null), G.let(d.default.errors, 0), U.unevaluated && y(P), N(P), C(P);
    });
  }
  function y(P) {
    const { gen: k, validateName: U } = P;
    P.evaluated = k.const("evaluated", (0, f._)`${U}.evaluated`), k.if((0, f._)`${P.evaluated}.dynamicProps`, () => k.assign((0, f._)`${P.evaluated}.props`, (0, f._)`undefined`)), k.if((0, f._)`${P.evaluated}.dynamicItems`, () => k.assign((0, f._)`${P.evaluated}.items`, (0, f._)`undefined`));
  }
  function v(P, k) {
    const U = typeof P == "object" && P[k.schemaId];
    return U && (k.code.source || k.code.process) ? (0, f._)`/*# sourceURL=${U} */` : f.nil;
  }
  function w(P, k) {
    if ($(P) && (E(P), b(P))) {
      S(P, k);
      return;
    }
    (0, t.boolOrEmptySchema)(P, k);
  }
  function b({ schema: P, self: k }) {
    if (typeof P == "boolean")
      return !P;
    for (const U in P)
      if (k.RULES.all[U])
        return !0;
    return !1;
  }
  function $(P) {
    return typeof P.schema != "boolean";
  }
  function S(P, k) {
    const { schema: U, gen: G, opts: H } = P;
    H.$comment && U.$comment && x(P), T(P), V(P);
    const Z = G.const("_errs", d.default.errors);
    N(P, Z), G.var(k, (0, f._)`${Z} === ${d.default.errors}`);
  }
  function E(P) {
    (0, n.checkUnknownRules)(P), O(P);
  }
  function N(P, k) {
    if (P.opts.jtd)
      return z(P, [], !1, k);
    const U = (0, e.getSchemaTypes)(P.schema), G = (0, e.coerceAndCheckDataType)(P, U);
    z(P, U, !G, k);
  }
  function O(P) {
    const { schema: k, errSchemaPath: U, opts: G, self: H } = P;
    k.$ref && G.ignoreKeywordsWithRef && (0, n.schemaHasRulesButRef)(k, H.RULES) && H.logger.warn(`$ref: keywords ignored in schema at path "${U}"`);
  }
  function M(P) {
    const { schema: k, opts: U } = P;
    k.default !== void 0 && U.useDefaults && U.strictSchema && (0, n.checkStrictMode)(P, "default is ignored in the schema root");
  }
  function T(P) {
    const k = P.schema[P.opts.schemaId];
    k && (P.baseId = (0, u.resolveUrl)(P.opts.uriResolver, P.baseId, k));
  }
  function V(P) {
    if (P.schema.$async && !P.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function x({ gen: P, schemaEnv: k, schema: U, errSchemaPath: G, opts: H }) {
    const Z = U.$comment;
    if (H.$comment === !0)
      P.code((0, f._)`${d.default.self}.logger.log(${Z})`);
    else if (typeof H.$comment == "function") {
      const fe = (0, f.str)`${G}/$comment`, Re = P.scopeValue("root", { ref: k.root });
      P.code((0, f._)`${d.default.self}.opts.$comment(${Z}, ${fe}, ${Re}.schema)`);
    }
  }
  function C(P) {
    const { gen: k, schemaEnv: U, validateName: G, ValidationError: H, opts: Z } = P;
    U.$async ? k.if((0, f._)`${d.default.errors} === 0`, () => k.return(d.default.data), () => k.throw((0, f._)`new ${H}(${d.default.vErrors})`)) : (k.assign((0, f._)`${G}.errors`, d.default.vErrors), Z.unevaluated && j(P), k.return((0, f._)`${d.default.errors} === 0`));
  }
  function j({ gen: P, evaluated: k, props: U, items: G }) {
    U instanceof f.Name && P.assign((0, f._)`${k}.props`, U), G instanceof f.Name && P.assign((0, f._)`${k}.items`, G);
  }
  function z(P, k, U, G) {
    const { gen: H, schema: Z, data: fe, allErrors: Re, opts: be, self: Se } = P, { RULES: de } = Se;
    if (Z.$ref && (be.ignoreKeywordsWithRef || !(0, n.schemaHasRulesButRef)(Z, de))) {
      H.block(() => Y(P, "$ref", de.all.$ref.definition));
      return;
    }
    be.jtd || B(P, k), H.block(() => {
      for (const Ne of de.rules)
        rt(Ne);
      rt(de.post);
    });
    function rt(Ne) {
      (0, r.shouldUseGroup)(Z, Ne) && (Ne.type ? (H.if((0, s.checkDataType)(Ne.type, fe, be.strictNumbers)), F(P, Ne), k.length === 1 && k[0] === Ne.type && U && (H.else(), (0, s.reportTypeError)(P)), H.endIf()) : F(P, Ne), Re || H.if((0, f._)`${d.default.errors} === ${G || 0}`));
    }
  }
  function F(P, k) {
    const { gen: U, schema: G, opts: { useDefaults: H } } = P;
    H && (0, l.assignDefaults)(P, k.type), U.block(() => {
      for (const Z of k.rules)
        (0, r.shouldUseRule)(G, Z) && Y(P, Z.keyword, Z.definition, k.type);
    });
  }
  function B(P, k) {
    P.schemaEnv.meta || !P.opts.strictTypes || (K(P, k), P.opts.allowUnionTypes || q(P, k), A(P, P.dataTypes));
  }
  function K(P, k) {
    if (k.length) {
      if (!P.dataTypes.length) {
        P.dataTypes = k;
        return;
      }
      k.forEach((U) => {
        I(P.dataTypes, U) || R(P, `type "${U}" not allowed by context "${P.dataTypes.join(",")}"`);
      }), _(P, k);
    }
  }
  function q(P, k) {
    k.length > 1 && !(k.length === 2 && k.includes("null")) && R(P, "use allowUnionTypes to allow union type keyword");
  }
  function A(P, k) {
    const U = P.self.RULES.all;
    for (const G in U) {
      const H = U[G];
      if (typeof H == "object" && (0, r.shouldUseRule)(P.schema, H)) {
        const { type: Z } = H.definition;
        Z.length && !Z.some((fe) => L(k, fe)) && R(P, `missing type "${Z.join(",")}" for keyword "${G}"`);
      }
    }
  }
  function L(P, k) {
    return P.includes(k) || k === "number" && P.includes("integer");
  }
  function I(P, k) {
    return P.includes(k) || k === "integer" && P.includes("number");
  }
  function _(P, k) {
    const U = [];
    for (const G of P.dataTypes)
      I(k, G) ? U.push(G) : k.includes("integer") && G === "number" && U.push("integer");
    P.dataTypes = U;
  }
  function R(P, k) {
    const U = P.schemaEnv.baseId + P.errSchemaPath;
    k += ` at "${U}" (strictTypes)`, (0, n.checkStrictMode)(P, k, P.opts.strictTypes);
  }
  class D {
    constructor(k, U, G) {
      if ((0, c.validateKeywordUsage)(k, U, G), this.gen = k.gen, this.allErrors = k.allErrors, this.keyword = G, this.data = k.data, this.schema = k.schema[G], this.$data = U.$data && k.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, n.schemaRefOrVal)(k, this.schema, G, this.$data), this.schemaType = U.schemaType, this.parentSchema = k.schema, this.params = {}, this.it = k, this.def = U, this.$data)
        this.schemaCode = k.gen.const("vSchema", te(this.$data, k));
      else if (this.schemaCode = this.schemaValue, !(0, c.validSchemaType)(this.schema, U.schemaType, U.allowUndefined))
        throw new Error(`${G} value must be ${JSON.stringify(U.schemaType)}`);
      ("code" in U ? U.trackErrors : U.errors !== !1) && (this.errsCount = k.gen.const("_errs", d.default.errors));
    }
    result(k, U, G) {
      this.failResult((0, f.not)(k), U, G);
    }
    failResult(k, U, G) {
      this.gen.if(k), G ? G() : this.error(), U ? (this.gen.else(), U(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(k, U) {
      this.failResult((0, f.not)(k), void 0, U);
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
      this.fail((0, f._)`${U} !== undefined && (${(0, f.or)(this.invalid$data(), k)})`);
    }
    error(k, U, G) {
      if (U) {
        this.setParams(U), this._error(k, G), this.setParams({});
        return;
      }
      this._error(k, G);
    }
    _error(k, U) {
      (k ? i.reportExtraError : i.reportError)(this, this.def.error, U);
    }
    $dataError() {
      (0, i.reportError)(this, this.def.$dataError || i.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, i.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(k) {
      this.allErrors || this.gen.if(k);
    }
    setParams(k, U) {
      U ? Object.assign(this.params, k) : this.params = k;
    }
    block$data(k, U, G = f.nil) {
      this.gen.block(() => {
        this.check$data(k, G), U();
      });
    }
    check$data(k = f.nil, U = f.nil) {
      if (!this.$data)
        return;
      const { gen: G, schemaCode: H, schemaType: Z, def: fe } = this;
      G.if((0, f.or)((0, f._)`${H} === undefined`, U)), k !== f.nil && G.assign(k, !0), (Z.length || fe.validateSchema) && (G.elseIf(this.invalid$data()), this.$dataError(), k !== f.nil && G.assign(k, !1)), G.else();
    }
    invalid$data() {
      const { gen: k, schemaCode: U, schemaType: G, def: H, it: Z } = this;
      return (0, f.or)(fe(), Re());
      function fe() {
        if (G.length) {
          if (!(U instanceof f.Name))
            throw new Error("ajv implementation error");
          const be = Array.isArray(G) ? G : [G];
          return (0, f._)`${(0, s.checkDataTypes)(be, U, Z.opts.strictNumbers, s.DataType.Wrong)}`;
        }
        return f.nil;
      }
      function Re() {
        if (H.validateSchema) {
          const be = k.scopeValue("validate$data", { ref: H.validateSchema });
          return (0, f._)`!${be}(${U})`;
        }
        return f.nil;
      }
    }
    subschema(k, U) {
      const G = (0, o.getSubschema)(this.it, k);
      (0, o.extendSubschemaData)(G, this.it, k), (0, o.extendSubschemaMode)(G, k);
      const H = { ...this.it, ...G, items: void 0, props: void 0 };
      return w(H, U), H;
    }
    mergeEvaluated(k, U) {
      const { it: G, gen: H } = this;
      G.opts.unevaluated && (G.props !== !0 && k.props !== void 0 && (G.props = n.mergeEvaluated.props(H, k.props, G.props, U)), G.items !== !0 && k.items !== void 0 && (G.items = n.mergeEvaluated.items(H, k.items, G.items, U)));
    }
    mergeValidEvaluated(k, U) {
      const { it: G, gen: H } = this;
      if (G.opts.unevaluated && (G.props !== !0 || G.items !== !0))
        return H.if(U, () => this.mergeEvaluated(k, f.Name)), !0;
    }
  }
  Le.KeywordCxt = D;
  function Y(P, k, U, G) {
    const H = new D(P, U, k);
    "code" in U ? U.code(H, G) : H.$data && U.validate ? (0, c.funcKeywordCode)(H, U) : "macro" in U ? (0, c.macroKeywordCode)(H, U) : (U.compile || U.validate) && (0, c.funcKeywordCode)(H, U);
  }
  const J = /^\/(?:[^~]|~0|~1)*$/, ne = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function te(P, { dataLevel: k, dataNames: U, dataPathArr: G }) {
    let H, Z;
    if (P === "")
      return d.default.rootData;
    if (P[0] === "/") {
      if (!J.test(P))
        throw new Error(`Invalid JSON-pointer: ${P}`);
      H = P, Z = d.default.rootData;
    } else {
      const Se = ne.exec(P);
      if (!Se)
        throw new Error(`Invalid JSON-pointer: ${P}`);
      const de = +Se[1];
      if (H = Se[2], H === "#") {
        if (de >= k)
          throw new Error(be("property/index", de));
        return G[k - de];
      }
      if (de > k)
        throw new Error(be("data", de));
      if (Z = U[k - de], !H)
        return Z;
    }
    let fe = Z;
    const Re = H.split("/");
    for (const Se of Re)
      Se && (Z = (0, f._)`${Z}${(0, f.getProperty)((0, n.unescapeJsonPointer)(Se))}`, fe = (0, f._)`${fe} && ${Z}`);
    return fe;
    function be(Se, de) {
      return `Cannot access ${Se} ${de} levels up, current level is ${k}`;
    }
  }
  return Le.getData = te, Le;
}
var Yt = {}, Ta;
function pn() {
  if (Ta) return Yt;
  Ta = 1, Object.defineProperty(Yt, "__esModule", { value: !0 });
  class t extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
  }
  return Yt.default = t, Yt;
}
var Ht = {}, ka;
function jt() {
  if (ka) return Ht;
  ka = 1, Object.defineProperty(Ht, "__esModule", { value: !0 });
  const t = hn();
  class e extends Error {
    constructor(s, l, c, o) {
      super(o || `can't resolve reference ${c} from id ${l}`), this.missingRef = (0, t.resolveUrl)(s, l, c), this.missingSchema = (0, t.normalizeId)((0, t.getFullPath)(s, this.missingRef));
    }
  }
  return Ht.default = e, Ht;
}
var _e = {}, Ca;
function mn() {
  if (Ca) return _e;
  Ca = 1, Object.defineProperty(_e, "__esModule", { value: !0 }), _e.resolveSchema = _e.getCompilingSchema = _e.resolveRef = _e.compileSchema = _e.SchemaEnv = void 0;
  const t = X(), e = pn(), r = Ie(), s = hn(), l = ee(), c = Dt();
  class o {
    constructor(y) {
      var v;
      this.refs = {}, this.dynamicAnchors = {};
      let w;
      typeof y.schema == "object" && (w = y.schema), this.schema = y.schema, this.schemaId = y.schemaId, this.root = y.root || this, this.baseId = (v = y.baseId) !== null && v !== void 0 ? v : (0, s.normalizeId)(w?.[y.schemaId || "$id"]), this.schemaPath = y.schemaPath, this.localRefs = y.localRefs, this.meta = y.meta, this.$async = w?.$async, this.refs = {};
    }
  }
  _e.SchemaEnv = o;
  function f(m) {
    const y = n.call(this, m);
    if (y)
      return y;
    const v = (0, s.getFullPath)(this.opts.uriResolver, m.root.baseId), { es5: w, lines: b } = this.opts.code, { ownProperties: $ } = this.opts, S = new t.CodeGen(this.scope, { es5: w, lines: b, ownProperties: $ });
    let E;
    m.$async && (E = S.scopeValue("Error", {
      ref: e.default,
      code: (0, t._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const N = S.scopeName("validate");
    m.validateName = N;
    const O = {
      gen: S,
      allErrors: this.opts.allErrors,
      data: r.default.data,
      parentData: r.default.parentData,
      parentDataProperty: r.default.parentDataProperty,
      dataNames: [r.default.data],
      dataPathArr: [t.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: S.scopeValue("schema", this.opts.code.source === !0 ? { ref: m.schema, code: (0, t.stringify)(m.schema) } : { ref: m.schema }),
      validateName: N,
      ValidationError: E,
      schema: m.schema,
      schemaEnv: m,
      rootId: v,
      baseId: m.baseId || v,
      schemaPath: t.nil,
      errSchemaPath: m.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, t._)`""`,
      opts: this.opts,
      self: this
    };
    let M;
    try {
      this._compilations.add(m), (0, c.validateFunctionCode)(O), S.optimize(this.opts.code.optimize);
      const T = S.toString();
      M = `${S.scopeRefs(r.default.scope)}return ${T}`, this.opts.code.process && (M = this.opts.code.process(M, m));
      const x = new Function(`${r.default.self}`, `${r.default.scope}`, M)(this, this.scope.get());
      if (this.scope.value(N, { ref: x }), x.errors = null, x.schema = m.schema, x.schemaEnv = m, m.$async && (x.$async = !0), this.opts.code.source === !0 && (x.source = { validateName: N, validateCode: T, scopeValues: S._values }), this.opts.unevaluated) {
        const { props: C, items: j } = O;
        x.evaluated = {
          props: C instanceof t.Name ? void 0 : C,
          items: j instanceof t.Name ? void 0 : j,
          dynamicProps: C instanceof t.Name,
          dynamicItems: j instanceof t.Name
        }, x.source && (x.source.evaluated = (0, t.stringify)(x.evaluated));
      }
      return m.validate = x, m;
    } catch (T) {
      throw delete m.validate, delete m.validateName, M && this.logger.error("Error compiling schema, function code:", M), T;
    } finally {
      this._compilations.delete(m);
    }
  }
  _e.compileSchema = f;
  function d(m, y, v) {
    var w;
    v = (0, s.resolveUrl)(this.opts.uriResolver, y, v);
    const b = m.refs[v];
    if (b)
      return b;
    let $ = a.call(this, m, v);
    if ($ === void 0) {
      const S = (w = m.localRefs) === null || w === void 0 ? void 0 : w[v], { schemaId: E } = this.opts;
      S && ($ = new o({ schema: S, schemaId: E, root: m, baseId: y }));
    }
    if ($ !== void 0)
      return m.refs[v] = u.call(this, $);
  }
  _e.resolveRef = d;
  function u(m) {
    return (0, s.inlineRef)(m.schema, this.opts.inlineRefs) ? m.schema : m.validate ? m : f.call(this, m);
  }
  function n(m) {
    for (const y of this._compilations)
      if (i(y, m))
        return y;
  }
  _e.getCompilingSchema = n;
  function i(m, y) {
    return m.schema === y.schema && m.root === y.root && m.baseId === y.baseId;
  }
  function a(m, y) {
    let v;
    for (; typeof (v = this.refs[y]) == "string"; )
      y = v;
    return v || this.schemas[y] || h.call(this, m, y);
  }
  function h(m, y) {
    const v = this.opts.uriResolver.parse(y), w = (0, s._getFullPath)(this.opts.uriResolver, v);
    let b = (0, s.getFullPath)(this.opts.uriResolver, m.baseId, void 0);
    if (Object.keys(m.schema).length > 0 && w === b)
      return g.call(this, v, m);
    const $ = (0, s.normalizeId)(w), S = this.refs[$] || this.schemas[$];
    if (typeof S == "string") {
      const E = h.call(this, m, S);
      return typeof E?.schema != "object" ? void 0 : g.call(this, v, E);
    }
    if (typeof S?.schema == "object") {
      if (S.validate || f.call(this, S), $ === (0, s.normalizeId)(y)) {
        const { schema: E } = S, { schemaId: N } = this.opts, O = E[N];
        return O && (b = (0, s.resolveUrl)(this.opts.uriResolver, b, O)), new o({ schema: E, schemaId: N, root: m, baseId: b });
      }
      return g.call(this, v, S);
    }
  }
  _e.resolveSchema = h;
  const p = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function g(m, { baseId: y, schema: v, root: w }) {
    var b;
    if (((b = m.fragment) === null || b === void 0 ? void 0 : b[0]) !== "/")
      return;
    for (const E of m.fragment.slice(1).split("/")) {
      if (typeof v == "boolean")
        return;
      const N = v[(0, l.unescapeFragment)(E)];
      if (N === void 0)
        return;
      v = N;
      const O = typeof v == "object" && v[this.opts.schemaId];
      !p.has(E) && O && (y = (0, s.resolveUrl)(this.opts.uriResolver, y, O));
    }
    let $;
    if (typeof v != "boolean" && v.$ref && !(0, l.schemaHasRulesButRef)(v, this.RULES)) {
      const E = (0, s.resolveUrl)(this.opts.uriResolver, y, v.$ref);
      $ = h.call(this, w, E);
    }
    const { schemaId: S } = this.opts;
    if ($ = $ || new o({ schema: v, schemaId: S, root: w, baseId: y }), $.schema !== $.root.schema)
      return $;
  }
  return _e;
}
const md = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", gd = "Meta-schema for $data reference (JSON AnySchema extension proposal)", yd = "object", vd = ["$data"], $d = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, wd = !1, bd = {
  $id: md,
  description: gd,
  type: yd,
  required: vd,
  properties: $d,
  additionalProperties: wd
};
var Jt = {}, St = { exports: {} }, xn, La;
function Ou() {
  if (La) return xn;
  La = 1;
  const t = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), e = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
  function r(a) {
    let h = "", p = 0, g = 0;
    for (g = 0; g < a.length; g++)
      if (p = a[g].charCodeAt(0), p !== 48) {
        if (!(p >= 48 && p <= 57 || p >= 65 && p <= 70 || p >= 97 && p <= 102))
          return "";
        h += a[g];
        break;
      }
    for (g += 1; g < a.length; g++) {
      if (p = a[g].charCodeAt(0), !(p >= 48 && p <= 57 || p >= 65 && p <= 70 || p >= 97 && p <= 102))
        return "";
      h += a[g];
    }
    return h;
  }
  const s = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
  function l(a) {
    return a.length = 0, !0;
  }
  function c(a, h, p) {
    if (a.length) {
      const g = r(a);
      if (g !== "")
        h.push(g);
      else
        return p.error = !0, !1;
      a.length = 0;
    }
    return !0;
  }
  function o(a) {
    let h = 0;
    const p = { error: !1, address: "", zone: "" }, g = [], m = [];
    let y = !1, v = !1, w = c;
    for (let b = 0; b < a.length; b++) {
      const $ = a[b];
      if (!($ === "[" || $ === "]"))
        if ($ === ":") {
          if (y === !0 && (v = !0), !w(m, g, p))
            break;
          if (++h > 7) {
            p.error = !0;
            break;
          }
          b > 0 && a[b - 1] === ":" && (y = !0), g.push(":");
          continue;
        } else if ($ === "%") {
          if (!w(m, g, p))
            break;
          w = l;
        } else {
          m.push($);
          continue;
        }
    }
    return m.length && (w === l ? p.zone = m.join("") : v ? g.push(m.join("")) : g.push(r(m))), p.address = g.join(""), p;
  }
  function f(a) {
    if (d(a, ":") < 2)
      return { host: a, isIPV6: !1 };
    const h = o(a);
    if (h.error)
      return { host: a, isIPV6: !1 };
    {
      let p = h.address, g = h.address;
      return h.zone && (p += "%" + h.zone, g += "%25" + h.zone), { host: p, isIPV6: !0, escapedHost: g };
    }
  }
  function d(a, h) {
    let p = 0;
    for (let g = 0; g < a.length; g++)
      a[g] === h && p++;
    return p;
  }
  function u(a) {
    let h = a;
    const p = [];
    let g = -1, m = 0;
    for (; m = h.length; ) {
      if (m === 1) {
        if (h === ".")
          break;
        if (h === "/") {
          p.push("/");
          break;
        } else {
          p.push(h);
          break;
        }
      } else if (m === 2) {
        if (h[0] === ".") {
          if (h[1] === ".")
            break;
          if (h[1] === "/") {
            h = h.slice(2);
            continue;
          }
        } else if (h[0] === "/" && (h[1] === "." || h[1] === "/")) {
          p.push("/");
          break;
        }
      } else if (m === 3 && h === "/..") {
        p.length !== 0 && p.pop(), p.push("/");
        break;
      }
      if (h[0] === ".") {
        if (h[1] === ".") {
          if (h[2] === "/") {
            h = h.slice(3);
            continue;
          }
        } else if (h[1] === "/") {
          h = h.slice(2);
          continue;
        }
      } else if (h[0] === "/" && h[1] === ".") {
        if (h[2] === "/") {
          h = h.slice(2);
          continue;
        } else if (h[2] === "." && h[3] === "/") {
          h = h.slice(3), p.length !== 0 && p.pop();
          continue;
        }
      }
      if ((g = h.indexOf("/", 1)) === -1) {
        p.push(h);
        break;
      } else
        p.push(h.slice(0, g)), h = h.slice(g);
    }
    return p.join("");
  }
  function n(a, h) {
    const p = h !== !0 ? escape : unescape;
    return a.scheme !== void 0 && (a.scheme = p(a.scheme)), a.userinfo !== void 0 && (a.userinfo = p(a.userinfo)), a.host !== void 0 && (a.host = p(a.host)), a.path !== void 0 && (a.path = p(a.path)), a.query !== void 0 && (a.query = p(a.query)), a.fragment !== void 0 && (a.fragment = p(a.fragment)), a;
  }
  function i(a) {
    const h = [];
    if (a.userinfo !== void 0 && (h.push(a.userinfo), h.push("@")), a.host !== void 0) {
      let p = unescape(a.host);
      if (!e(p)) {
        const g = f(p);
        g.isIPV6 === !0 ? p = `[${g.escapedHost}]` : p = a.host;
      }
      h.push(p);
    }
    return (typeof a.port == "number" || typeof a.port == "string") && (h.push(":"), h.push(String(a.port))), h.length ? h.join("") : void 0;
  }
  return xn = {
    nonSimpleDomain: s,
    recomposeAuthority: i,
    normalizeComponentEncoding: n,
    removeDotSegments: u,
    isIPv4: e,
    isUUID: t,
    normalizeIPv6: f,
    stringArrayToHexStripped: r
  }, xn;
}
var zn, qa;
function Sd() {
  if (qa) return zn;
  qa = 1;
  const { isUUID: t } = Ou(), e = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu, r = (
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
  function s($) {
    return r.indexOf(
      /** @type {*} */
      $
    ) !== -1;
  }
  function l($) {
    return $.secure === !0 ? !0 : $.secure === !1 ? !1 : $.scheme ? $.scheme.length === 3 && ($.scheme[0] === "w" || $.scheme[0] === "W") && ($.scheme[1] === "s" || $.scheme[1] === "S") && ($.scheme[2] === "s" || $.scheme[2] === "S") : !1;
  }
  function c($) {
    return $.host || ($.error = $.error || "HTTP URIs must have a host."), $;
  }
  function o($) {
    const S = String($.scheme).toLowerCase() === "https";
    return ($.port === (S ? 443 : 80) || $.port === "") && ($.port = void 0), $.path || ($.path = "/"), $;
  }
  function f($) {
    return $.secure = l($), $.resourceName = ($.path || "/") + ($.query ? "?" + $.query : ""), $.path = void 0, $.query = void 0, $;
  }
  function d($) {
    if (($.port === (l($) ? 443 : 80) || $.port === "") && ($.port = void 0), typeof $.secure == "boolean" && ($.scheme = $.secure ? "wss" : "ws", $.secure = void 0), $.resourceName) {
      const [S, E] = $.resourceName.split("?");
      $.path = S && S !== "/" ? S : void 0, $.query = E, $.resourceName = void 0;
    }
    return $.fragment = void 0, $;
  }
  function u($, S) {
    if (!$.path)
      return $.error = "URN can not be parsed", $;
    const E = $.path.match(e);
    if (E) {
      const N = S.scheme || $.scheme || "urn";
      $.nid = E[1].toLowerCase(), $.nss = E[2];
      const O = `${N}:${S.nid || $.nid}`, M = b(O);
      $.path = void 0, M && ($ = M.parse($, S));
    } else
      $.error = $.error || "URN can not be parsed.";
    return $;
  }
  function n($, S) {
    if ($.nid === void 0)
      throw new Error("URN without nid cannot be serialized");
    const E = S.scheme || $.scheme || "urn", N = $.nid.toLowerCase(), O = `${E}:${S.nid || N}`, M = b(O);
    M && ($ = M.serialize($, S));
    const T = $, V = $.nss;
    return T.path = `${N || S.nid}:${V}`, S.skipEscape = !0, T;
  }
  function i($, S) {
    const E = $;
    return E.uuid = E.nss, E.nss = void 0, !S.tolerant && (!E.uuid || !t(E.uuid)) && (E.error = E.error || "UUID is not valid."), E;
  }
  function a($) {
    const S = $;
    return S.nss = ($.uuid || "").toLowerCase(), S;
  }
  const h = (
    /** @type {SchemeHandler} */
    {
      scheme: "http",
      domainHost: !0,
      parse: c,
      serialize: o
    }
  ), p = (
    /** @type {SchemeHandler} */
    {
      scheme: "https",
      domainHost: h.domainHost,
      parse: c,
      serialize: o
    }
  ), g = (
    /** @type {SchemeHandler} */
    {
      scheme: "ws",
      domainHost: !0,
      parse: f,
      serialize: d
    }
  ), m = (
    /** @type {SchemeHandler} */
    {
      scheme: "wss",
      domainHost: g.domainHost,
      parse: g.parse,
      serialize: g.serialize
    }
  ), w = (
    /** @type {Record<SchemeName, SchemeHandler>} */
    {
      http: h,
      https: p,
      ws: g,
      wss: m,
      urn: (
        /** @type {SchemeHandler} */
        {
          scheme: "urn",
          parse: u,
          serialize: n,
          skipNormalize: !0
        }
      ),
      "urn:uuid": (
        /** @type {SchemeHandler} */
        {
          scheme: "urn:uuid",
          parse: i,
          serialize: a,
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
  return zn = {
    wsIsSecure: l,
    SCHEMES: w,
    isValidSchemeName: s,
    getSchemeHandler: b
  }, zn;
}
var Ma;
function Ed() {
  if (Ma) return St.exports;
  Ma = 1;
  const { normalizeIPv6: t, removeDotSegments: e, recomposeAuthority: r, normalizeComponentEncoding: s, isIPv4: l, nonSimpleDomain: c } = Ou(), { SCHEMES: o, getSchemeHandler: f } = Sd();
  function d(m, y) {
    return typeof m == "string" ? m = /** @type {T} */
    a(p(m, y), y) : typeof m == "object" && (m = /** @type {T} */
    p(a(m, y), y)), m;
  }
  function u(m, y, v) {
    const w = v ? Object.assign({ scheme: "null" }, v) : { scheme: "null" }, b = n(p(m, w), p(y, w), w, !0);
    return w.skipEscape = !0, a(b, w);
  }
  function n(m, y, v, w) {
    const b = {};
    return w || (m = p(a(m, v), v), y = p(a(y, v), v)), v = v || {}, !v.tolerant && y.scheme ? (b.scheme = y.scheme, b.userinfo = y.userinfo, b.host = y.host, b.port = y.port, b.path = e(y.path || ""), b.query = y.query) : (y.userinfo !== void 0 || y.host !== void 0 || y.port !== void 0 ? (b.userinfo = y.userinfo, b.host = y.host, b.port = y.port, b.path = e(y.path || ""), b.query = y.query) : (y.path ? (y.path[0] === "/" ? b.path = e(y.path) : ((m.userinfo !== void 0 || m.host !== void 0 || m.port !== void 0) && !m.path ? b.path = "/" + y.path : m.path ? b.path = m.path.slice(0, m.path.lastIndexOf("/") + 1) + y.path : b.path = y.path, b.path = e(b.path)), b.query = y.query) : (b.path = m.path, y.query !== void 0 ? b.query = y.query : b.query = m.query), b.userinfo = m.userinfo, b.host = m.host, b.port = m.port), b.scheme = m.scheme), b.fragment = y.fragment, b;
  }
  function i(m, y, v) {
    return typeof m == "string" ? (m = unescape(m), m = a(s(p(m, v), !0), { ...v, skipEscape: !0 })) : typeof m == "object" && (m = a(s(m, !0), { ...v, skipEscape: !0 })), typeof y == "string" ? (y = unescape(y), y = a(s(p(y, v), !0), { ...v, skipEscape: !0 })) : typeof y == "object" && (y = a(s(y, !0), { ...v, skipEscape: !0 })), m.toLowerCase() === y.toLowerCase();
  }
  function a(m, y) {
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
    }, w = Object.assign({}, y), b = [], $ = f(w.scheme || v.scheme);
    $ && $.serialize && $.serialize(v, w), v.path !== void 0 && (w.skipEscape ? v.path = unescape(v.path) : (v.path = escape(v.path), v.scheme !== void 0 && (v.path = v.path.split("%3A").join(":")))), w.reference !== "suffix" && v.scheme && b.push(v.scheme, ":");
    const S = r(v);
    if (S !== void 0 && (w.reference !== "suffix" && b.push("//"), b.push(S), v.path && v.path[0] !== "/" && b.push("/")), v.path !== void 0) {
      let E = v.path;
      !w.absolutePath && (!$ || !$.absolutePath) && (E = e(E)), S === void 0 && E[0] === "/" && E[1] === "/" && (E = "/%2F" + E.slice(2)), b.push(E);
    }
    return v.query !== void 0 && b.push("?", v.query), v.fragment !== void 0 && b.push("#", v.fragment), b.join("");
  }
  const h = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  function p(m, y) {
    const v = Object.assign({}, y), w = {
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
    const $ = m.match(h);
    if ($) {
      if (w.scheme = $[1], w.userinfo = $[3], w.host = $[4], w.port = parseInt($[5], 10), w.path = $[6] || "", w.query = $[7], w.fragment = $[8], isNaN(w.port) && (w.port = $[5]), w.host)
        if (l(w.host) === !1) {
          const N = t(w.host);
          w.host = N.host.toLowerCase(), b = N.isIPV6;
        } else
          b = !0;
      w.scheme === void 0 && w.userinfo === void 0 && w.host === void 0 && w.port === void 0 && w.query === void 0 && !w.path ? w.reference = "same-document" : w.scheme === void 0 ? w.reference = "relative" : w.fragment === void 0 ? w.reference = "absolute" : w.reference = "uri", v.reference && v.reference !== "suffix" && v.reference !== w.reference && (w.error = w.error || "URI is not a " + v.reference + " reference.");
      const S = f(v.scheme || w.scheme);
      if (!v.unicodeSupport && (!S || !S.unicodeSupport) && w.host && (v.domainHost || S && S.domainHost) && b === !1 && c(w.host))
        try {
          w.host = URL.domainToASCII(w.host.toLowerCase());
        } catch (E) {
          w.error = w.error || "Host's domain name can not be converted to ASCII: " + E;
        }
      (!S || S && !S.skipNormalize) && (m.indexOf("%") !== -1 && (w.scheme !== void 0 && (w.scheme = unescape(w.scheme)), w.host !== void 0 && (w.host = unescape(w.host))), w.path && (w.path = escape(unescape(w.path))), w.fragment && (w.fragment = encodeURI(decodeURIComponent(w.fragment)))), S && S.parse && S.parse(w, v);
    } else
      w.error = w.error || "URI can not be parsed.";
    return w;
  }
  const g = {
    SCHEMES: o,
    normalize: d,
    resolve: u,
    resolveComponent: n,
    equal: i,
    serialize: a,
    parse: p
  };
  return St.exports = g, St.exports.default = g, St.exports.fastUri = g, St.exports;
}
var Da;
function _d() {
  if (Da) return Jt;
  Da = 1, Object.defineProperty(Jt, "__esModule", { value: !0 });
  const t = Ed();
  return t.code = 'require("ajv/dist/runtime/uri").default', Jt.default = t, Jt;
}
var ja;
function Iu() {
  return ja || (ja = 1, (function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = void 0;
    var e = Dt();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return e.KeywordCxt;
    } });
    var r = X();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return r._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return r.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return r.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return r.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return r.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return r.CodeGen;
    } });
    const s = pn(), l = jt(), c = Nu(), o = mn(), f = X(), d = hn(), u = cn(), n = ee(), i = bd, a = _d(), h = (q, A) => new RegExp(q, A);
    h.code = "new RegExp";
    const p = ["removeAdditional", "useDefaults", "coerceTypes"], g = /* @__PURE__ */ new Set([
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
    }, y = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, v = 200;
    function w(q) {
      var A, L, I, _, R, D, Y, J, ne, te, P, k, U, G, H, Z, fe, Re, be, Se, de, rt, Ne, kn, Cn;
      const $t = q.strict, Ln = (A = q.code) === null || A === void 0 ? void 0 : A.optimize, na = Ln === !0 || Ln === void 0 ? 1 : Ln || 0, sa = (I = (L = q.code) === null || L === void 0 ? void 0 : L.regExp) !== null && I !== void 0 ? I : h, Rf = (_ = q.uriResolver) !== null && _ !== void 0 ? _ : a.default;
      return {
        strictSchema: (D = (R = q.strictSchema) !== null && R !== void 0 ? R : $t) !== null && D !== void 0 ? D : !0,
        strictNumbers: (J = (Y = q.strictNumbers) !== null && Y !== void 0 ? Y : $t) !== null && J !== void 0 ? J : !0,
        strictTypes: (te = (ne = q.strictTypes) !== null && ne !== void 0 ? ne : $t) !== null && te !== void 0 ? te : "log",
        strictTuples: (k = (P = q.strictTuples) !== null && P !== void 0 ? P : $t) !== null && k !== void 0 ? k : "log",
        strictRequired: (G = (U = q.strictRequired) !== null && U !== void 0 ? U : $t) !== null && G !== void 0 ? G : !1,
        code: q.code ? { ...q.code, optimize: na, regExp: sa } : { optimize: na, regExp: sa },
        loopRequired: (H = q.loopRequired) !== null && H !== void 0 ? H : v,
        loopEnum: (Z = q.loopEnum) !== null && Z !== void 0 ? Z : v,
        meta: (fe = q.meta) !== null && fe !== void 0 ? fe : !0,
        messages: (Re = q.messages) !== null && Re !== void 0 ? Re : !0,
        inlineRefs: (be = q.inlineRefs) !== null && be !== void 0 ? be : !0,
        schemaId: (Se = q.schemaId) !== null && Se !== void 0 ? Se : "$id",
        addUsedSchema: (de = q.addUsedSchema) !== null && de !== void 0 ? de : !0,
        validateSchema: (rt = q.validateSchema) !== null && rt !== void 0 ? rt : !0,
        validateFormats: (Ne = q.validateFormats) !== null && Ne !== void 0 ? Ne : !0,
        unicodeRegExp: (kn = q.unicodeRegExp) !== null && kn !== void 0 ? kn : !0,
        int32range: (Cn = q.int32range) !== null && Cn !== void 0 ? Cn : !0,
        uriResolver: Rf
      };
    }
    class b {
      constructor(A = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), A = this.opts = { ...A, ...w(A) };
        const { es5: L, lines: I } = this.opts.code;
        this.scope = new f.ValueScope({ scope: {}, prefixes: g, es5: L, lines: I }), this.logger = V(A.logger);
        const _ = A.validateFormats;
        A.validateFormats = !1, this.RULES = (0, c.getRules)(), $.call(this, m, A, "NOT SUPPORTED"), $.call(this, y, A, "DEPRECATED", "warn"), this._metaOpts = M.call(this), A.formats && N.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), A.keywords && O.call(this, A.keywords), typeof A.meta == "object" && this.addMetaSchema(A.meta), E.call(this), A.validateFormats = _;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: A, meta: L, schemaId: I } = this.opts;
        let _ = i;
        I === "id" && (_ = { ...i }, _.id = _.$id, delete _.$id), L && A && this.addMetaSchema(_, _[I], !1);
      }
      defaultMeta() {
        const { meta: A, schemaId: L } = this.opts;
        return this.opts.defaultMeta = typeof A == "object" ? A[L] || A : void 0;
      }
      validate(A, L) {
        let I;
        if (typeof A == "string") {
          if (I = this.getSchema(A), !I)
            throw new Error(`no schema with key or ref "${A}"`);
        } else
          I = this.compile(A);
        const _ = I(L);
        return "$async" in I || (this.errors = I.errors), _;
      }
      compile(A, L) {
        const I = this._addSchema(A, L);
        return I.validate || this._compileSchemaEnv(I);
      }
      compileAsync(A, L) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: I } = this.opts;
        return _.call(this, A, L);
        async function _(te, P) {
          await R.call(this, te.$schema);
          const k = this._addSchema(te, P);
          return k.validate || D.call(this, k);
        }
        async function R(te) {
          te && !this.getSchema(te) && await _.call(this, { $ref: te }, !0);
        }
        async function D(te) {
          try {
            return this._compileSchemaEnv(te);
          } catch (P) {
            if (!(P instanceof l.default))
              throw P;
            return Y.call(this, P), await J.call(this, P.missingSchema), D.call(this, te);
          }
        }
        function Y({ missingSchema: te, missingRef: P }) {
          if (this.refs[te])
            throw new Error(`AnySchema ${te} is loaded but ${P} cannot be resolved`);
        }
        async function J(te) {
          const P = await ne.call(this, te);
          this.refs[te] || await R.call(this, P.$schema), this.refs[te] || this.addSchema(P, te, L);
        }
        async function ne(te) {
          const P = this._loading[te];
          if (P)
            return P;
          try {
            return await (this._loading[te] = I(te));
          } finally {
            delete this._loading[te];
          }
        }
      }
      // Adds schema to the instance
      addSchema(A, L, I, _ = this.opts.validateSchema) {
        if (Array.isArray(A)) {
          for (const D of A)
            this.addSchema(D, void 0, I, _);
          return this;
        }
        let R;
        if (typeof A == "object") {
          const { schemaId: D } = this.opts;
          if (R = A[D], R !== void 0 && typeof R != "string")
            throw new Error(`schema ${D} must be string`);
        }
        return L = (0, d.normalizeId)(L || R), this._checkUnique(L), this.schemas[L] = this._addSchema(A, I, L, _, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(A, L, I = this.opts.validateSchema) {
        return this.addSchema(A, L, !0, I), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(A, L) {
        if (typeof A == "boolean")
          return !0;
        let I;
        if (I = A.$schema, I !== void 0 && typeof I != "string")
          throw new Error("$schema must be a string");
        if (I = I || this.opts.defaultMeta || this.defaultMeta(), !I)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const _ = this.validate(I, A);
        if (!_ && L) {
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
      getSchema(A) {
        let L;
        for (; typeof (L = S.call(this, A)) == "string"; )
          A = L;
        if (L === void 0) {
          const { schemaId: I } = this.opts, _ = new o.SchemaEnv({ schema: {}, schemaId: I });
          if (L = o.resolveSchema.call(this, _, A), !L)
            return;
          this.refs[A] = L;
        }
        return L.validate || this._compileSchemaEnv(L);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(A) {
        if (A instanceof RegExp)
          return this._removeAllSchemas(this.schemas, A), this._removeAllSchemas(this.refs, A), this;
        switch (typeof A) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const L = S.call(this, A);
            return typeof L == "object" && this._cache.delete(L.schema), delete this.schemas[A], delete this.refs[A], this;
          }
          case "object": {
            const L = A;
            this._cache.delete(L);
            let I = A[this.opts.schemaId];
            return I && (I = (0, d.normalizeId)(I), delete this.schemas[I], delete this.refs[I]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(A) {
        for (const L of A)
          this.addKeyword(L);
        return this;
      }
      addKeyword(A, L) {
        let I;
        if (typeof A == "string")
          I = A, typeof L == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), L.keyword = I);
        else if (typeof A == "object" && L === void 0) {
          if (L = A, I = L.keyword, Array.isArray(I) && !I.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (C.call(this, I, L), !L)
          return (0, n.eachItem)(I, (R) => j.call(this, R)), this;
        F.call(this, L);
        const _ = {
          ...L,
          type: (0, u.getJSONTypes)(L.type),
          schemaType: (0, u.getJSONTypes)(L.schemaType)
        };
        return (0, n.eachItem)(I, _.type.length === 0 ? (R) => j.call(this, R, _) : (R) => _.type.forEach((D) => j.call(this, R, _, D))), this;
      }
      getKeyword(A) {
        const L = this.RULES.all[A];
        return typeof L == "object" ? L.definition : !!L;
      }
      // Remove keyword
      removeKeyword(A) {
        const { RULES: L } = this;
        delete L.keywords[A], delete L.all[A];
        for (const I of L.rules) {
          const _ = I.rules.findIndex((R) => R.keyword === A);
          _ >= 0 && I.rules.splice(_, 1);
        }
        return this;
      }
      // Add format
      addFormat(A, L) {
        return typeof L == "string" && (L = new RegExp(L)), this.formats[A] = L, this;
      }
      errorsText(A = this.errors, { separator: L = ", ", dataVar: I = "data" } = {}) {
        return !A || A.length === 0 ? "No errors" : A.map((_) => `${I}${_.instancePath} ${_.message}`).reduce((_, R) => _ + L + R);
      }
      $dataMetaSchema(A, L) {
        const I = this.RULES.all;
        A = JSON.parse(JSON.stringify(A));
        for (const _ of L) {
          const R = _.split("/").slice(1);
          let D = A;
          for (const Y of R)
            D = D[Y];
          for (const Y in I) {
            const J = I[Y];
            if (typeof J != "object")
              continue;
            const { $data: ne } = J.definition, te = D[Y];
            ne && te && (D[Y] = K(te));
          }
        }
        return A;
      }
      _removeAllSchemas(A, L) {
        for (const I in A) {
          const _ = A[I];
          (!L || L.test(I)) && (typeof _ == "string" ? delete A[I] : _ && !_.meta && (this._cache.delete(_.schema), delete A[I]));
        }
      }
      _addSchema(A, L, I, _ = this.opts.validateSchema, R = this.opts.addUsedSchema) {
        let D;
        const { schemaId: Y } = this.opts;
        if (typeof A == "object")
          D = A[Y];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof A != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let J = this._cache.get(A);
        if (J !== void 0)
          return J;
        I = (0, d.normalizeId)(D || I);
        const ne = d.getSchemaRefs.call(this, A, I);
        return J = new o.SchemaEnv({ schema: A, schemaId: Y, meta: L, baseId: I, localRefs: ne }), this._cache.set(J.schema, J), R && !I.startsWith("#") && (I && this._checkUnique(I), this.refs[I] = J), _ && this.validateSchema(A, !0), J;
      }
      _checkUnique(A) {
        if (this.schemas[A] || this.refs[A])
          throw new Error(`schema with key or id "${A}" already exists`);
      }
      _compileSchemaEnv(A) {
        if (A.meta ? this._compileMetaSchema(A) : o.compileSchema.call(this, A), !A.validate)
          throw new Error("ajv implementation error");
        return A.validate;
      }
      _compileMetaSchema(A) {
        const L = this.opts;
        this.opts = this._metaOpts;
        try {
          o.compileSchema.call(this, A);
        } finally {
          this.opts = L;
        }
      }
    }
    b.ValidationError = s.default, b.MissingRefError = l.default, t.default = b;
    function $(q, A, L, I = "error") {
      for (const _ in q) {
        const R = _;
        R in A && this.logger[I](`${L}: option ${_}. ${q[R]}`);
      }
    }
    function S(q) {
      return q = (0, d.normalizeId)(q), this.schemas[q] || this.refs[q];
    }
    function E() {
      const q = this.opts.schemas;
      if (q)
        if (Array.isArray(q))
          this.addSchema(q);
        else
          for (const A in q)
            this.addSchema(q[A], A);
    }
    function N() {
      for (const q in this.opts.formats) {
        const A = this.opts.formats[q];
        A && this.addFormat(q, A);
      }
    }
    function O(q) {
      if (Array.isArray(q)) {
        this.addVocabulary(q);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const A in q) {
        const L = q[A];
        L.keyword || (L.keyword = A), this.addKeyword(L);
      }
    }
    function M() {
      const q = { ...this.opts };
      for (const A of p)
        delete q[A];
      return q;
    }
    const T = { log() {
    }, warn() {
    }, error() {
    } };
    function V(q) {
      if (q === !1)
        return T;
      if (q === void 0)
        return console;
      if (q.log && q.warn && q.error)
        return q;
      throw new Error("logger must implement log, warn and error methods");
    }
    const x = /^[a-z_$][a-z0-9_$:-]*$/i;
    function C(q, A) {
      const { RULES: L } = this;
      if ((0, n.eachItem)(q, (I) => {
        if (L.keywords[I])
          throw new Error(`Keyword ${I} is already defined`);
        if (!x.test(I))
          throw new Error(`Keyword ${I} has invalid name`);
      }), !!A && A.$data && !("code" in A || "validate" in A))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function j(q, A, L) {
      var I;
      const _ = A?.post;
      if (L && _)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: R } = this;
      let D = _ ? R.post : R.rules.find(({ type: J }) => J === L);
      if (D || (D = { type: L, rules: [] }, R.rules.push(D)), R.keywords[q] = !0, !A)
        return;
      const Y = {
        keyword: q,
        definition: {
          ...A,
          type: (0, u.getJSONTypes)(A.type),
          schemaType: (0, u.getJSONTypes)(A.schemaType)
        }
      };
      A.before ? z.call(this, D, Y, A.before) : D.rules.push(Y), R.all[q] = Y, (I = A.implements) === null || I === void 0 || I.forEach((J) => this.addKeyword(J));
    }
    function z(q, A, L) {
      const I = q.rules.findIndex((_) => _.keyword === L);
      I >= 0 ? q.rules.splice(I, 0, A) : (q.rules.push(A), this.logger.warn(`rule ${L} is not defined`));
    }
    function F(q) {
      let { metaSchema: A } = q;
      A !== void 0 && (q.$data && this.opts.$data && (A = K(A)), q.validateSchema = this.compile(A, !0));
    }
    const B = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function K(q) {
      return { anyOf: [q, B] };
    }
  })(Dn)), Dn;
}
var Xt = {}, Wt = {}, Qt = {}, Fa;
function Nd() {
  if (Fa) return Qt;
  Fa = 1, Object.defineProperty(Qt, "__esModule", { value: !0 });
  const t = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return Qt.default = t, Qt;
}
var Ue = {}, Va;
function Fi() {
  if (Va) return Ue;
  Va = 1, Object.defineProperty(Ue, "__esModule", { value: !0 }), Ue.callRef = Ue.getValidate = void 0;
  const t = jt(), e = Pe(), r = X(), s = Ie(), l = mn(), c = ee(), o = {
    keyword: "$ref",
    schemaType: "string",
    code(u) {
      const { gen: n, schema: i, it: a } = u, { baseId: h, schemaEnv: p, validateName: g, opts: m, self: y } = a, { root: v } = p;
      if ((i === "#" || i === "#/") && h === v.baseId)
        return b();
      const w = l.resolveRef.call(y, v, h, i);
      if (w === void 0)
        throw new t.default(a.opts.uriResolver, h, i);
      if (w instanceof l.SchemaEnv)
        return $(w);
      return S(w);
      function b() {
        if (p === v)
          return d(u, g, p, p.$async);
        const E = n.scopeValue("root", { ref: v });
        return d(u, (0, r._)`${E}.validate`, v, v.$async);
      }
      function $(E) {
        const N = f(u, E);
        d(u, N, E, E.$async);
      }
      function S(E) {
        const N = n.scopeValue("schema", m.code.source === !0 ? { ref: E, code: (0, r.stringify)(E) } : { ref: E }), O = n.name("valid"), M = u.subschema({
          schema: E,
          dataTypes: [],
          schemaPath: r.nil,
          topSchemaRef: N,
          errSchemaPath: i
        }, O);
        u.mergeEvaluated(M), u.ok(O);
      }
    }
  };
  function f(u, n) {
    const { gen: i } = u;
    return n.validate ? i.scopeValue("validate", { ref: n.validate }) : (0, r._)`${i.scopeValue("wrapper", { ref: n })}.validate`;
  }
  Ue.getValidate = f;
  function d(u, n, i, a) {
    const { gen: h, it: p } = u, { allErrors: g, schemaEnv: m, opts: y } = p, v = y.passContext ? s.default.this : r.nil;
    a ? w() : b();
    function w() {
      if (!m.$async)
        throw new Error("async schema referenced by sync schema");
      const E = h.let("valid");
      h.try(() => {
        h.code((0, r._)`await ${(0, e.callValidateCode)(u, n, v)}`), S(n), g || h.assign(E, !0);
      }, (N) => {
        h.if((0, r._)`!(${N} instanceof ${p.ValidationError})`, () => h.throw(N)), $(N), g || h.assign(E, !1);
      }), u.ok(E);
    }
    function b() {
      u.result((0, e.callValidateCode)(u, n, v), () => S(n), () => $(n));
    }
    function $(E) {
      const N = (0, r._)`${E}.errors`;
      h.assign(s.default.vErrors, (0, r._)`${s.default.vErrors} === null ? ${N} : ${s.default.vErrors}.concat(${N})`), h.assign(s.default.errors, (0, r._)`${s.default.vErrors}.length`);
    }
    function S(E) {
      var N;
      if (!p.opts.unevaluated)
        return;
      const O = (N = i?.validate) === null || N === void 0 ? void 0 : N.evaluated;
      if (p.props !== !0)
        if (O && !O.dynamicProps)
          O.props !== void 0 && (p.props = c.mergeEvaluated.props(h, O.props, p.props));
        else {
          const M = h.var("props", (0, r._)`${E}.evaluated.props`);
          p.props = c.mergeEvaluated.props(h, M, p.props, r.Name);
        }
      if (p.items !== !0)
        if (O && !O.dynamicItems)
          O.items !== void 0 && (p.items = c.mergeEvaluated.items(h, O.items, p.items));
        else {
          const M = h.var("items", (0, r._)`${E}.evaluated.items`);
          p.items = c.mergeEvaluated.items(h, M, p.items, r.Name);
        }
    }
  }
  return Ue.callRef = d, Ue.default = o, Ue;
}
var Ua;
function Pu() {
  if (Ua) return Wt;
  Ua = 1, Object.defineProperty(Wt, "__esModule", { value: !0 });
  const t = Nd(), e = Fi(), r = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    t.default,
    e.default
  ];
  return Wt.default = r, Wt;
}
var Zt = {}, er = {}, Ba;
function Rd() {
  if (Ba) return er;
  Ba = 1, Object.defineProperty(er, "__esModule", { value: !0 });
  const t = X(), e = t.operators, r = {
    maximum: { okStr: "<=", ok: e.LTE, fail: e.GT },
    minimum: { okStr: ">=", ok: e.GTE, fail: e.LT },
    exclusiveMaximum: { okStr: "<", ok: e.LT, fail: e.GTE },
    exclusiveMinimum: { okStr: ">", ok: e.GT, fail: e.LTE }
  }, s = {
    message: ({ keyword: c, schemaCode: o }) => (0, t.str)`must be ${r[c].okStr} ${o}`,
    params: ({ keyword: c, schemaCode: o }) => (0, t._)`{comparison: ${r[c].okStr}, limit: ${o}}`
  }, l = {
    keyword: Object.keys(r),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: s,
    code(c) {
      const { keyword: o, data: f, schemaCode: d } = c;
      c.fail$data((0, t._)`${f} ${r[o].fail} ${d} || isNaN(${f})`);
    }
  };
  return er.default = l, er;
}
var tr = {}, Ka;
function Ad() {
  if (Ka) return tr;
  Ka = 1, Object.defineProperty(tr, "__esModule", { value: !0 });
  const t = X(), r = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: s }) => (0, t.str)`must be multiple of ${s}`,
      params: ({ schemaCode: s }) => (0, t._)`{multipleOf: ${s}}`
    },
    code(s) {
      const { gen: l, data: c, schemaCode: o, it: f } = s, d = f.opts.multipleOfPrecision, u = l.let("res"), n = d ? (0, t._)`Math.abs(Math.round(${u}) - ${u}) > 1e-${d}` : (0, t._)`${u} !== parseInt(${u})`;
      s.fail$data((0, t._)`(${o} === 0 || (${u} = ${c}/${o}, ${n}))`);
    }
  };
  return tr.default = r, tr;
}
var rr = {}, nr = {}, xa;
function Od() {
  if (xa) return nr;
  xa = 1, Object.defineProperty(nr, "__esModule", { value: !0 });
  function t(e) {
    const r = e.length;
    let s = 0, l = 0, c;
    for (; l < r; )
      s++, c = e.charCodeAt(l++), c >= 55296 && c <= 56319 && l < r && (c = e.charCodeAt(l), (c & 64512) === 56320 && l++);
    return s;
  }
  return nr.default = t, t.code = 'require("ajv/dist/runtime/ucs2length").default', nr;
}
var za;
function Id() {
  if (za) return rr;
  za = 1, Object.defineProperty(rr, "__esModule", { value: !0 });
  const t = X(), e = ee(), r = Od(), l = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: c, schemaCode: o }) {
        const f = c === "maxLength" ? "more" : "fewer";
        return (0, t.str)`must NOT have ${f} than ${o} characters`;
      },
      params: ({ schemaCode: c }) => (0, t._)`{limit: ${c}}`
    },
    code(c) {
      const { keyword: o, data: f, schemaCode: d, it: u } = c, n = o === "maxLength" ? t.operators.GT : t.operators.LT, i = u.opts.unicode === !1 ? (0, t._)`${f}.length` : (0, t._)`${(0, e.useFunc)(c.gen, r.default)}(${f})`;
      c.fail$data((0, t._)`${i} ${n} ${d}`);
    }
  };
  return rr.default = l, rr;
}
var sr = {}, Ga;
function Pd() {
  if (Ga) return sr;
  Ga = 1, Object.defineProperty(sr, "__esModule", { value: !0 });
  const t = Pe(), e = X(), s = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: l }) => (0, e.str)`must match pattern "${l}"`,
      params: ({ schemaCode: l }) => (0, e._)`{pattern: ${l}}`
    },
    code(l) {
      const { data: c, $data: o, schema: f, schemaCode: d, it: u } = l, n = u.opts.unicodeRegExp ? "u" : "", i = o ? (0, e._)`(new RegExp(${d}, ${n}))` : (0, t.usePattern)(l, f);
      l.fail$data((0, e._)`!${i}.test(${c})`);
    }
  };
  return sr.default = s, sr;
}
var ir = {}, Ya;
function Td() {
  if (Ya) return ir;
  Ya = 1, Object.defineProperty(ir, "__esModule", { value: !0 });
  const t = X(), r = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: s, schemaCode: l }) {
        const c = s === "maxProperties" ? "more" : "fewer";
        return (0, t.str)`must NOT have ${c} than ${l} properties`;
      },
      params: ({ schemaCode: s }) => (0, t._)`{limit: ${s}}`
    },
    code(s) {
      const { keyword: l, data: c, schemaCode: o } = s, f = l === "maxProperties" ? t.operators.GT : t.operators.LT;
      s.fail$data((0, t._)`Object.keys(${c}).length ${f} ${o}`);
    }
  };
  return ir.default = r, ir;
}
var ar = {}, Ha;
function kd() {
  if (Ha) return ar;
  Ha = 1, Object.defineProperty(ar, "__esModule", { value: !0 });
  const t = Pe(), e = X(), r = ee(), l = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: c } }) => (0, e.str)`must have required property '${c}'`,
      params: ({ params: { missingProperty: c } }) => (0, e._)`{missingProperty: ${c}}`
    },
    code(c) {
      const { gen: o, schema: f, schemaCode: d, data: u, $data: n, it: i } = c, { opts: a } = i;
      if (!n && f.length === 0)
        return;
      const h = f.length >= a.loopRequired;
      if (i.allErrors ? p() : g(), a.strictRequired) {
        const v = c.parentSchema.properties, { definedProperties: w } = c.it;
        for (const b of f)
          if (v?.[b] === void 0 && !w.has(b)) {
            const $ = i.schemaEnv.baseId + i.errSchemaPath, S = `required property "${b}" is not defined at "${$}" (strictRequired)`;
            (0, r.checkStrictMode)(i, S, i.opts.strictRequired);
          }
      }
      function p() {
        if (h || n)
          c.block$data(e.nil, m);
        else
          for (const v of f)
            (0, t.checkReportMissingProp)(c, v);
      }
      function g() {
        const v = o.let("missing");
        if (h || n) {
          const w = o.let("valid", !0);
          c.block$data(w, () => y(v, w)), c.ok(w);
        } else
          o.if((0, t.checkMissingProp)(c, f, v)), (0, t.reportMissingProp)(c, v), o.else();
      }
      function m() {
        o.forOf("prop", d, (v) => {
          c.setParams({ missingProperty: v }), o.if((0, t.noPropertyInData)(o, u, v, a.ownProperties), () => c.error());
        });
      }
      function y(v, w) {
        c.setParams({ missingProperty: v }), o.forOf(v, d, () => {
          o.assign(w, (0, t.propertyInData)(o, u, v, a.ownProperties)), o.if((0, e.not)(w), () => {
            c.error(), o.break();
          });
        }, e.nil);
      }
    }
  };
  return ar.default = l, ar;
}
var or = {}, Ja;
function Cd() {
  if (Ja) return or;
  Ja = 1, Object.defineProperty(or, "__esModule", { value: !0 });
  const t = X(), r = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: s, schemaCode: l }) {
        const c = s === "maxItems" ? "more" : "fewer";
        return (0, t.str)`must NOT have ${c} than ${l} items`;
      },
      params: ({ schemaCode: s }) => (0, t._)`{limit: ${s}}`
    },
    code(s) {
      const { keyword: l, data: c, schemaCode: o } = s, f = l === "maxItems" ? t.operators.GT : t.operators.LT;
      s.fail$data((0, t._)`${c}.length ${f} ${o}`);
    }
  };
  return or.default = r, or;
}
var cr = {}, lr = {}, Xa;
function Vi() {
  if (Xa) return lr;
  Xa = 1, Object.defineProperty(lr, "__esModule", { value: !0 });
  const t = Au();
  return t.code = 'require("ajv/dist/runtime/equal").default', lr.default = t, lr;
}
var Wa;
function Ld() {
  if (Wa) return cr;
  Wa = 1, Object.defineProperty(cr, "__esModule", { value: !0 });
  const t = cn(), e = X(), r = ee(), s = Vi(), c = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i: o, j: f } }) => (0, e.str)`must NOT have duplicate items (items ## ${f} and ${o} are identical)`,
      params: ({ params: { i: o, j: f } }) => (0, e._)`{i: ${o}, j: ${f}}`
    },
    code(o) {
      const { gen: f, data: d, $data: u, schema: n, parentSchema: i, schemaCode: a, it: h } = o;
      if (!u && !n)
        return;
      const p = f.let("valid"), g = i.items ? (0, t.getSchemaTypes)(i.items) : [];
      o.block$data(p, m, (0, e._)`${a} === false`), o.ok(p);
      function m() {
        const b = f.let("i", (0, e._)`${d}.length`), $ = f.let("j");
        o.setParams({ i: b, j: $ }), f.assign(p, !0), f.if((0, e._)`${b} > 1`, () => (y() ? v : w)(b, $));
      }
      function y() {
        return g.length > 0 && !g.some((b) => b === "object" || b === "array");
      }
      function v(b, $) {
        const S = f.name("item"), E = (0, t.checkDataTypes)(g, S, h.opts.strictNumbers, t.DataType.Wrong), N = f.const("indices", (0, e._)`{}`);
        f.for((0, e._)`;${b}--;`, () => {
          f.let(S, (0, e._)`${d}[${b}]`), f.if(E, (0, e._)`continue`), g.length > 1 && f.if((0, e._)`typeof ${S} == "string"`, (0, e._)`${S} += "_"`), f.if((0, e._)`typeof ${N}[${S}] == "number"`, () => {
            f.assign($, (0, e._)`${N}[${S}]`), o.error(), f.assign(p, !1).break();
          }).code((0, e._)`${N}[${S}] = ${b}`);
        });
      }
      function w(b, $) {
        const S = (0, r.useFunc)(f, s.default), E = f.name("outer");
        f.label(E).for((0, e._)`;${b}--;`, () => f.for((0, e._)`${$} = ${b}; ${$}--;`, () => f.if((0, e._)`${S}(${d}[${b}], ${d}[${$}])`, () => {
          o.error(), f.assign(p, !1).break(E);
        })));
      }
    }
  };
  return cr.default = c, cr;
}
var ur = {}, Qa;
function qd() {
  if (Qa) return ur;
  Qa = 1, Object.defineProperty(ur, "__esModule", { value: !0 });
  const t = X(), e = ee(), r = Vi(), l = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: c }) => (0, t._)`{allowedValue: ${c}}`
    },
    code(c) {
      const { gen: o, data: f, $data: d, schemaCode: u, schema: n } = c;
      d || n && typeof n == "object" ? c.fail$data((0, t._)`!${(0, e.useFunc)(o, r.default)}(${f}, ${u})`) : c.fail((0, t._)`${n} !== ${f}`);
    }
  };
  return ur.default = l, ur;
}
var fr = {}, Za;
function Md() {
  if (Za) return fr;
  Za = 1, Object.defineProperty(fr, "__esModule", { value: !0 });
  const t = X(), e = ee(), r = Vi(), l = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: c }) => (0, t._)`{allowedValues: ${c}}`
    },
    code(c) {
      const { gen: o, data: f, $data: d, schema: u, schemaCode: n, it: i } = c;
      if (!d && u.length === 0)
        throw new Error("enum must have non-empty array");
      const a = u.length >= i.opts.loopEnum;
      let h;
      const p = () => h ?? (h = (0, e.useFunc)(o, r.default));
      let g;
      if (a || d)
        g = o.let("valid"), c.block$data(g, m);
      else {
        if (!Array.isArray(u))
          throw new Error("ajv implementation error");
        const v = o.const("vSchema", n);
        g = (0, t.or)(...u.map((w, b) => y(v, b)));
      }
      c.pass(g);
      function m() {
        o.assign(g, !1), o.forOf("v", n, (v) => o.if((0, t._)`${p()}(${f}, ${v})`, () => o.assign(g, !0).break()));
      }
      function y(v, w) {
        const b = u[w];
        return typeof b == "object" && b !== null ? (0, t._)`${p()}(${f}, ${v}[${w}])` : (0, t._)`${f} === ${b}`;
      }
    }
  };
  return fr.default = l, fr;
}
var eo;
function Tu() {
  if (eo) return Zt;
  eo = 1, Object.defineProperty(Zt, "__esModule", { value: !0 });
  const t = Rd(), e = Ad(), r = Id(), s = Pd(), l = Td(), c = kd(), o = Cd(), f = Ld(), d = qd(), u = Md(), n = [
    // number
    t.default,
    e.default,
    // string
    r.default,
    s.default,
    // object
    l.default,
    c.default,
    // array
    o.default,
    f.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    d.default,
    u.default
  ];
  return Zt.default = n, Zt;
}
var dr = {}, nt = {}, to;
function ku() {
  if (to) return nt;
  to = 1, Object.defineProperty(nt, "__esModule", { value: !0 }), nt.validateAdditionalItems = void 0;
  const t = X(), e = ee(), s = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: c } }) => (0, t.str)`must NOT have more than ${c} items`,
      params: ({ params: { len: c } }) => (0, t._)`{limit: ${c}}`
    },
    code(c) {
      const { parentSchema: o, it: f } = c, { items: d } = o;
      if (!Array.isArray(d)) {
        (0, e.checkStrictMode)(f, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      l(c, d);
    }
  };
  function l(c, o) {
    const { gen: f, schema: d, data: u, keyword: n, it: i } = c;
    i.items = !0;
    const a = f.const("len", (0, t._)`${u}.length`);
    if (d === !1)
      c.setParams({ len: o.length }), c.pass((0, t._)`${a} <= ${o.length}`);
    else if (typeof d == "object" && !(0, e.alwaysValidSchema)(i, d)) {
      const p = f.var("valid", (0, t._)`${a} <= ${o.length}`);
      f.if((0, t.not)(p), () => h(p)), c.ok(p);
    }
    function h(p) {
      f.forRange("i", o.length, a, (g) => {
        c.subschema({ keyword: n, dataProp: g, dataPropType: e.Type.Num }, p), i.allErrors || f.if((0, t.not)(p), () => f.break());
      });
    }
  }
  return nt.validateAdditionalItems = l, nt.default = s, nt;
}
var hr = {}, st = {}, ro;
function Cu() {
  if (ro) return st;
  ro = 1, Object.defineProperty(st, "__esModule", { value: !0 }), st.validateTuple = void 0;
  const t = X(), e = ee(), r = Pe(), s = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(c) {
      const { schema: o, it: f } = c;
      if (Array.isArray(o))
        return l(c, "additionalItems", o);
      f.items = !0, !(0, e.alwaysValidSchema)(f, o) && c.ok((0, r.validateArray)(c));
    }
  };
  function l(c, o, f = c.schema) {
    const { gen: d, parentSchema: u, data: n, keyword: i, it: a } = c;
    g(u), a.opts.unevaluated && f.length && a.items !== !0 && (a.items = e.mergeEvaluated.items(d, f.length, a.items));
    const h = d.name("valid"), p = d.const("len", (0, t._)`${n}.length`);
    f.forEach((m, y) => {
      (0, e.alwaysValidSchema)(a, m) || (d.if((0, t._)`${p} > ${y}`, () => c.subschema({
        keyword: i,
        schemaProp: y,
        dataProp: y
      }, h)), c.ok(h));
    });
    function g(m) {
      const { opts: y, errSchemaPath: v } = a, w = f.length, b = w === m.minItems && (w === m.maxItems || m[o] === !1);
      if (y.strictTuples && !b) {
        const $ = `"${i}" is ${w}-tuple, but minItems or maxItems/${o} are not specified or different at path "${v}"`;
        (0, e.checkStrictMode)(a, $, y.strictTuples);
      }
    }
  }
  return st.validateTuple = l, st.default = s, st;
}
var no;
function Dd() {
  if (no) return hr;
  no = 1, Object.defineProperty(hr, "__esModule", { value: !0 });
  const t = Cu(), e = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (r) => (0, t.validateTuple)(r, "items")
  };
  return hr.default = e, hr;
}
var pr = {}, so;
function jd() {
  if (so) return pr;
  so = 1, Object.defineProperty(pr, "__esModule", { value: !0 });
  const t = X(), e = ee(), r = Pe(), s = ku(), c = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: o } }) => (0, t.str)`must NOT have more than ${o} items`,
      params: ({ params: { len: o } }) => (0, t._)`{limit: ${o}}`
    },
    code(o) {
      const { schema: f, parentSchema: d, it: u } = o, { prefixItems: n } = d;
      u.items = !0, !(0, e.alwaysValidSchema)(u, f) && (n ? (0, s.validateAdditionalItems)(o, n) : o.ok((0, r.validateArray)(o)));
    }
  };
  return pr.default = c, pr;
}
var mr = {}, io;
function Fd() {
  if (io) return mr;
  io = 1, Object.defineProperty(mr, "__esModule", { value: !0 });
  const t = X(), e = ee(), s = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: l, max: c } }) => c === void 0 ? (0, t.str)`must contain at least ${l} valid item(s)` : (0, t.str)`must contain at least ${l} and no more than ${c} valid item(s)`,
      params: ({ params: { min: l, max: c } }) => c === void 0 ? (0, t._)`{minContains: ${l}}` : (0, t._)`{minContains: ${l}, maxContains: ${c}}`
    },
    code(l) {
      const { gen: c, schema: o, parentSchema: f, data: d, it: u } = l;
      let n, i;
      const { minContains: a, maxContains: h } = f;
      u.opts.next ? (n = a === void 0 ? 1 : a, i = h) : n = 1;
      const p = c.const("len", (0, t._)`${d}.length`);
      if (l.setParams({ min: n, max: i }), i === void 0 && n === 0) {
        (0, e.checkStrictMode)(u, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if (i !== void 0 && n > i) {
        (0, e.checkStrictMode)(u, '"minContains" > "maxContains" is always invalid'), l.fail();
        return;
      }
      if ((0, e.alwaysValidSchema)(u, o)) {
        let w = (0, t._)`${p} >= ${n}`;
        i !== void 0 && (w = (0, t._)`${w} && ${p} <= ${i}`), l.pass(w);
        return;
      }
      u.items = !0;
      const g = c.name("valid");
      i === void 0 && n === 1 ? y(g, () => c.if(g, () => c.break())) : n === 0 ? (c.let(g, !0), i !== void 0 && c.if((0, t._)`${d}.length > 0`, m)) : (c.let(g, !1), m()), l.result(g, () => l.reset());
      function m() {
        const w = c.name("_valid"), b = c.let("count", 0);
        y(w, () => c.if(w, () => v(b)));
      }
      function y(w, b) {
        c.forRange("i", 0, p, ($) => {
          l.subschema({
            keyword: "contains",
            dataProp: $,
            dataPropType: e.Type.Num,
            compositeRule: !0
          }, w), b();
        });
      }
      function v(w) {
        c.code((0, t._)`${w}++`), i === void 0 ? c.if((0, t._)`${w} >= ${n}`, () => c.assign(g, !0).break()) : (c.if((0, t._)`${w} > ${i}`, () => c.assign(g, !1).break()), n === 1 ? c.assign(g, !0) : c.if((0, t._)`${w} >= ${n}`, () => c.assign(g, !0)));
      }
    }
  };
  return mr.default = s, mr;
}
var Gn = {}, ao;
function Ui() {
  return ao || (ao = 1, (function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.validateSchemaDeps = t.validatePropertyDeps = t.error = void 0;
    const e = X(), r = ee(), s = Pe();
    t.error = {
      message: ({ params: { property: d, depsCount: u, deps: n } }) => {
        const i = u === 1 ? "property" : "properties";
        return (0, e.str)`must have ${i} ${n} when property ${d} is present`;
      },
      params: ({ params: { property: d, depsCount: u, deps: n, missingProperty: i } }) => (0, e._)`{property: ${d},
    missingProperty: ${i},
    depsCount: ${u},
    deps: ${n}}`
      // TODO change to reference
    };
    const l = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: t.error,
      code(d) {
        const [u, n] = c(d);
        o(d, u), f(d, n);
      }
    };
    function c({ schema: d }) {
      const u = {}, n = {};
      for (const i in d) {
        if (i === "__proto__")
          continue;
        const a = Array.isArray(d[i]) ? u : n;
        a[i] = d[i];
      }
      return [u, n];
    }
    function o(d, u = d.schema) {
      const { gen: n, data: i, it: a } = d;
      if (Object.keys(u).length === 0)
        return;
      const h = n.let("missing");
      for (const p in u) {
        const g = u[p];
        if (g.length === 0)
          continue;
        const m = (0, s.propertyInData)(n, i, p, a.opts.ownProperties);
        d.setParams({
          property: p,
          depsCount: g.length,
          deps: g.join(", ")
        }), a.allErrors ? n.if(m, () => {
          for (const y of g)
            (0, s.checkReportMissingProp)(d, y);
        }) : (n.if((0, e._)`${m} && (${(0, s.checkMissingProp)(d, g, h)})`), (0, s.reportMissingProp)(d, h), n.else());
      }
    }
    t.validatePropertyDeps = o;
    function f(d, u = d.schema) {
      const { gen: n, data: i, keyword: a, it: h } = d, p = n.name("valid");
      for (const g in u)
        (0, r.alwaysValidSchema)(h, u[g]) || (n.if(
          (0, s.propertyInData)(n, i, g, h.opts.ownProperties),
          () => {
            const m = d.subschema({ keyword: a, schemaProp: g }, p);
            d.mergeValidEvaluated(m, p);
          },
          () => n.var(p, !0)
          // TODO var
        ), d.ok(p));
    }
    t.validateSchemaDeps = f, t.default = l;
  })(Gn)), Gn;
}
var gr = {}, oo;
function Vd() {
  if (oo) return gr;
  oo = 1, Object.defineProperty(gr, "__esModule", { value: !0 });
  const t = X(), e = ee(), s = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: l }) => (0, t._)`{propertyName: ${l.propertyName}}`
    },
    code(l) {
      const { gen: c, schema: o, data: f, it: d } = l;
      if ((0, e.alwaysValidSchema)(d, o))
        return;
      const u = c.name("valid");
      c.forIn("key", f, (n) => {
        l.setParams({ propertyName: n }), l.subschema({
          keyword: "propertyNames",
          data: n,
          dataTypes: ["string"],
          propertyName: n,
          compositeRule: !0
        }, u), c.if((0, t.not)(u), () => {
          l.error(!0), d.allErrors || c.break();
        });
      }), l.ok(u);
    }
  };
  return gr.default = s, gr;
}
var yr = {}, co;
function Lu() {
  if (co) return yr;
  co = 1, Object.defineProperty(yr, "__esModule", { value: !0 });
  const t = Pe(), e = X(), r = Ie(), s = ee(), c = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: !0,
    trackErrors: !0,
    error: {
      message: "must NOT have additional properties",
      params: ({ params: o }) => (0, e._)`{additionalProperty: ${o.additionalProperty}}`
    },
    code(o) {
      const { gen: f, schema: d, parentSchema: u, data: n, errsCount: i, it: a } = o;
      if (!i)
        throw new Error("ajv implementation error");
      const { allErrors: h, opts: p } = a;
      if (a.props = !0, p.removeAdditional !== "all" && (0, s.alwaysValidSchema)(a, d))
        return;
      const g = (0, t.allSchemaProperties)(u.properties), m = (0, t.allSchemaProperties)(u.patternProperties);
      y(), o.ok((0, e._)`${i} === ${r.default.errors}`);
      function y() {
        f.forIn("key", n, (S) => {
          !g.length && !m.length ? b(S) : f.if(v(S), () => b(S));
        });
      }
      function v(S) {
        let E;
        if (g.length > 8) {
          const N = (0, s.schemaRefOrVal)(a, u.properties, "properties");
          E = (0, t.isOwnProperty)(f, N, S);
        } else g.length ? E = (0, e.or)(...g.map((N) => (0, e._)`${S} === ${N}`)) : E = e.nil;
        return m.length && (E = (0, e.or)(E, ...m.map((N) => (0, e._)`${(0, t.usePattern)(o, N)}.test(${S})`))), (0, e.not)(E);
      }
      function w(S) {
        f.code((0, e._)`delete ${n}[${S}]`);
      }
      function b(S) {
        if (p.removeAdditional === "all" || p.removeAdditional && d === !1) {
          w(S);
          return;
        }
        if (d === !1) {
          o.setParams({ additionalProperty: S }), o.error(), h || f.break();
          return;
        }
        if (typeof d == "object" && !(0, s.alwaysValidSchema)(a, d)) {
          const E = f.name("valid");
          p.removeAdditional === "failing" ? ($(S, E, !1), f.if((0, e.not)(E), () => {
            o.reset(), w(S);
          })) : ($(S, E), h || f.if((0, e.not)(E), () => f.break()));
        }
      }
      function $(S, E, N) {
        const O = {
          keyword: "additionalProperties",
          dataProp: S,
          dataPropType: s.Type.Str
        };
        N === !1 && Object.assign(O, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), o.subschema(O, E);
      }
    }
  };
  return yr.default = c, yr;
}
var vr = {}, lo;
function Ud() {
  if (lo) return vr;
  lo = 1, Object.defineProperty(vr, "__esModule", { value: !0 });
  const t = Dt(), e = Pe(), r = ee(), s = Lu(), l = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(c) {
      const { gen: o, schema: f, parentSchema: d, data: u, it: n } = c;
      n.opts.removeAdditional === "all" && d.additionalProperties === void 0 && s.default.code(new t.KeywordCxt(n, s.default, "additionalProperties"));
      const i = (0, e.allSchemaProperties)(f);
      for (const m of i)
        n.definedProperties.add(m);
      n.opts.unevaluated && i.length && n.props !== !0 && (n.props = r.mergeEvaluated.props(o, (0, r.toHash)(i), n.props));
      const a = i.filter((m) => !(0, r.alwaysValidSchema)(n, f[m]));
      if (a.length === 0)
        return;
      const h = o.name("valid");
      for (const m of a)
        p(m) ? g(m) : (o.if((0, e.propertyInData)(o, u, m, n.opts.ownProperties)), g(m), n.allErrors || o.else().var(h, !0), o.endIf()), c.it.definedProperties.add(m), c.ok(h);
      function p(m) {
        return n.opts.useDefaults && !n.compositeRule && f[m].default !== void 0;
      }
      function g(m) {
        c.subschema({
          keyword: "properties",
          schemaProp: m,
          dataProp: m
        }, h);
      }
    }
  };
  return vr.default = l, vr;
}
var $r = {}, uo;
function Bd() {
  if (uo) return $r;
  uo = 1, Object.defineProperty($r, "__esModule", { value: !0 });
  const t = Pe(), e = X(), r = ee(), s = ee(), l = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(c) {
      const { gen: o, schema: f, data: d, parentSchema: u, it: n } = c, { opts: i } = n, a = (0, t.allSchemaProperties)(f), h = a.filter((b) => (0, r.alwaysValidSchema)(n, f[b]));
      if (a.length === 0 || h.length === a.length && (!n.opts.unevaluated || n.props === !0))
        return;
      const p = i.strictSchema && !i.allowMatchingProperties && u.properties, g = o.name("valid");
      n.props !== !0 && !(n.props instanceof e.Name) && (n.props = (0, s.evaluatedPropsToName)(o, n.props));
      const { props: m } = n;
      y();
      function y() {
        for (const b of a)
          p && v(b), n.allErrors ? w(b) : (o.var(g, !0), w(b), o.if(g));
      }
      function v(b) {
        for (const $ in p)
          new RegExp(b).test($) && (0, r.checkStrictMode)(n, `property ${$} matches pattern ${b} (use allowMatchingProperties)`);
      }
      function w(b) {
        o.forIn("key", d, ($) => {
          o.if((0, e._)`${(0, t.usePattern)(c, b)}.test(${$})`, () => {
            const S = h.includes(b);
            S || c.subschema({
              keyword: "patternProperties",
              schemaProp: b,
              dataProp: $,
              dataPropType: s.Type.Str
            }, g), n.opts.unevaluated && m !== !0 ? o.assign((0, e._)`${m}[${$}]`, !0) : !S && !n.allErrors && o.if((0, e.not)(g), () => o.break());
          });
        });
      }
    }
  };
  return $r.default = l, $r;
}
var wr = {}, fo;
function Kd() {
  if (fo) return wr;
  fo = 1, Object.defineProperty(wr, "__esModule", { value: !0 });
  const t = ee(), e = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(r) {
      const { gen: s, schema: l, it: c } = r;
      if ((0, t.alwaysValidSchema)(c, l)) {
        r.fail();
        return;
      }
      const o = s.name("valid");
      r.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, o), r.failResult(o, () => r.reset(), () => r.error());
    },
    error: { message: "must NOT be valid" }
  };
  return wr.default = e, wr;
}
var br = {}, ho;
function xd() {
  if (ho) return br;
  ho = 1, Object.defineProperty(br, "__esModule", { value: !0 });
  const e = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: Pe().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return br.default = e, br;
}
var Sr = {}, po;
function zd() {
  if (po) return Sr;
  po = 1, Object.defineProperty(Sr, "__esModule", { value: !0 });
  const t = X(), e = ee(), s = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: l }) => (0, t._)`{passingSchemas: ${l.passing}}`
    },
    code(l) {
      const { gen: c, schema: o, parentSchema: f, it: d } = l;
      if (!Array.isArray(o))
        throw new Error("ajv implementation error");
      if (d.opts.discriminator && f.discriminator)
        return;
      const u = o, n = c.let("valid", !1), i = c.let("passing", null), a = c.name("_valid");
      l.setParams({ passing: i }), c.block(h), l.result(n, () => l.reset(), () => l.error(!0));
      function h() {
        u.forEach((p, g) => {
          let m;
          (0, e.alwaysValidSchema)(d, p) ? c.var(a, !0) : m = l.subschema({
            keyword: "oneOf",
            schemaProp: g,
            compositeRule: !0
          }, a), g > 0 && c.if((0, t._)`${a} && ${n}`).assign(n, !1).assign(i, (0, t._)`[${i}, ${g}]`).else(), c.if(a, () => {
            c.assign(n, !0), c.assign(i, g), m && l.mergeEvaluated(m, t.Name);
          });
        });
      }
    }
  };
  return Sr.default = s, Sr;
}
var Er = {}, mo;
function Gd() {
  if (mo) return Er;
  mo = 1, Object.defineProperty(Er, "__esModule", { value: !0 });
  const t = ee(), e = {
    keyword: "allOf",
    schemaType: "array",
    code(r) {
      const { gen: s, schema: l, it: c } = r;
      if (!Array.isArray(l))
        throw new Error("ajv implementation error");
      const o = s.name("valid");
      l.forEach((f, d) => {
        if ((0, t.alwaysValidSchema)(c, f))
          return;
        const u = r.subschema({ keyword: "allOf", schemaProp: d }, o);
        r.ok(o), r.mergeEvaluated(u);
      });
    }
  };
  return Er.default = e, Er;
}
var _r = {}, go;
function Yd() {
  if (go) return _r;
  go = 1, Object.defineProperty(_r, "__esModule", { value: !0 });
  const t = X(), e = ee(), s = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: c }) => (0, t.str)`must match "${c.ifClause}" schema`,
      params: ({ params: c }) => (0, t._)`{failingKeyword: ${c.ifClause}}`
    },
    code(c) {
      const { gen: o, parentSchema: f, it: d } = c;
      f.then === void 0 && f.else === void 0 && (0, e.checkStrictMode)(d, '"if" without "then" and "else" is ignored');
      const u = l(d, "then"), n = l(d, "else");
      if (!u && !n)
        return;
      const i = o.let("valid", !0), a = o.name("_valid");
      if (h(), c.reset(), u && n) {
        const g = o.let("ifClause");
        c.setParams({ ifClause: g }), o.if(a, p("then", g), p("else", g));
      } else u ? o.if(a, p("then")) : o.if((0, t.not)(a), p("else"));
      c.pass(i, () => c.error(!0));
      function h() {
        const g = c.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, a);
        c.mergeEvaluated(g);
      }
      function p(g, m) {
        return () => {
          const y = c.subschema({ keyword: g }, a);
          o.assign(i, a), c.mergeValidEvaluated(y, i), m ? o.assign(m, (0, t._)`${g}`) : c.setParams({ ifClause: g });
        };
      }
    }
  };
  function l(c, o) {
    const f = c.schema[o];
    return f !== void 0 && !(0, e.alwaysValidSchema)(c, f);
  }
  return _r.default = s, _r;
}
var Nr = {}, yo;
function Hd() {
  if (yo) return Nr;
  yo = 1, Object.defineProperty(Nr, "__esModule", { value: !0 });
  const t = ee(), e = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: r, parentSchema: s, it: l }) {
      s.if === void 0 && (0, t.checkStrictMode)(l, `"${r}" without "if" is ignored`);
    }
  };
  return Nr.default = e, Nr;
}
var vo;
function qu() {
  if (vo) return dr;
  vo = 1, Object.defineProperty(dr, "__esModule", { value: !0 });
  const t = ku(), e = Dd(), r = Cu(), s = jd(), l = Fd(), c = Ui(), o = Vd(), f = Lu(), d = Ud(), u = Bd(), n = Kd(), i = xd(), a = zd(), h = Gd(), p = Yd(), g = Hd();
  function m(y = !1) {
    const v = [
      // any
      n.default,
      i.default,
      a.default,
      h.default,
      p.default,
      g.default,
      // object
      o.default,
      f.default,
      c.default,
      d.default,
      u.default
    ];
    return y ? v.push(e.default, s.default) : v.push(t.default, r.default), v.push(l.default), v;
  }
  return dr.default = m, dr;
}
var Rr = {}, it = {}, $o;
function Mu() {
  if ($o) return it;
  $o = 1, Object.defineProperty(it, "__esModule", { value: !0 }), it.dynamicAnchor = void 0;
  const t = X(), e = Ie(), r = mn(), s = Fi(), l = {
    keyword: "$dynamicAnchor",
    schemaType: "string",
    code: (f) => c(f, f.schema)
  };
  function c(f, d) {
    const { gen: u, it: n } = f;
    n.schemaEnv.root.dynamicAnchors[d] = !0;
    const i = (0, t._)`${e.default.dynamicAnchors}${(0, t.getProperty)(d)}`, a = n.errSchemaPath === "#" ? n.validateName : o(f);
    u.if((0, t._)`!${i}`, () => u.assign(i, a));
  }
  it.dynamicAnchor = c;
  function o(f) {
    const { schemaEnv: d, schema: u, self: n } = f.it, { root: i, baseId: a, localRefs: h, meta: p } = d.root, { schemaId: g } = n.opts, m = new r.SchemaEnv({ schema: u, schemaId: g, root: i, baseId: a, localRefs: h, meta: p });
    return r.compileSchema.call(n, m), (0, s.getValidate)(f, m);
  }
  return it.default = l, it;
}
var at = {}, wo;
function Du() {
  if (wo) return at;
  wo = 1, Object.defineProperty(at, "__esModule", { value: !0 }), at.dynamicRef = void 0;
  const t = X(), e = Ie(), r = Fi(), s = {
    keyword: "$dynamicRef",
    schemaType: "string",
    code: (c) => l(c, c.schema)
  };
  function l(c, o) {
    const { gen: f, keyword: d, it: u } = c;
    if (o[0] !== "#")
      throw new Error(`"${d}" only supports hash fragment reference`);
    const n = o.slice(1);
    if (u.allErrors)
      i();
    else {
      const h = f.let("valid", !1);
      i(h), c.ok(h);
    }
    function i(h) {
      if (u.schemaEnv.root.dynamicAnchors[n]) {
        const p = f.let("_v", (0, t._)`${e.default.dynamicAnchors}${(0, t.getProperty)(n)}`);
        f.if(p, a(p, h), a(u.validateName, h));
      } else
        a(u.validateName, h)();
    }
    function a(h, p) {
      return p ? () => f.block(() => {
        (0, r.callRef)(c, h), f.let(p, !0);
      }) : () => (0, r.callRef)(c, h);
    }
  }
  return at.dynamicRef = l, at.default = s, at;
}
var Ar = {}, bo;
function Jd() {
  if (bo) return Ar;
  bo = 1, Object.defineProperty(Ar, "__esModule", { value: !0 });
  const t = Mu(), e = ee(), r = {
    keyword: "$recursiveAnchor",
    schemaType: "boolean",
    code(s) {
      s.schema ? (0, t.dynamicAnchor)(s, "") : (0, e.checkStrictMode)(s.it, "$recursiveAnchor: false is ignored");
    }
  };
  return Ar.default = r, Ar;
}
var Or = {}, So;
function Xd() {
  if (So) return Or;
  So = 1, Object.defineProperty(Or, "__esModule", { value: !0 });
  const t = Du(), e = {
    keyword: "$recursiveRef",
    schemaType: "string",
    code: (r) => (0, t.dynamicRef)(r, r.schema)
  };
  return Or.default = e, Or;
}
var Eo;
function Wd() {
  if (Eo) return Rr;
  Eo = 1, Object.defineProperty(Rr, "__esModule", { value: !0 });
  const t = Mu(), e = Du(), r = Jd(), s = Xd(), l = [t.default, e.default, r.default, s.default];
  return Rr.default = l, Rr;
}
var Ir = {}, Pr = {}, _o;
function Qd() {
  if (_o) return Pr;
  _o = 1, Object.defineProperty(Pr, "__esModule", { value: !0 });
  const t = Ui(), e = {
    keyword: "dependentRequired",
    type: "object",
    schemaType: "object",
    error: t.error,
    code: (r) => (0, t.validatePropertyDeps)(r)
  };
  return Pr.default = e, Pr;
}
var Tr = {}, No;
function Zd() {
  if (No) return Tr;
  No = 1, Object.defineProperty(Tr, "__esModule", { value: !0 });
  const t = Ui(), e = {
    keyword: "dependentSchemas",
    type: "object",
    schemaType: "object",
    code: (r) => (0, t.validateSchemaDeps)(r)
  };
  return Tr.default = e, Tr;
}
var kr = {}, Ro;
function eh() {
  if (Ro) return kr;
  Ro = 1, Object.defineProperty(kr, "__esModule", { value: !0 });
  const t = ee(), e = {
    keyword: ["maxContains", "minContains"],
    type: "array",
    schemaType: "number",
    code({ keyword: r, parentSchema: s, it: l }) {
      s.contains === void 0 && (0, t.checkStrictMode)(l, `"${r}" without "contains" is ignored`);
    }
  };
  return kr.default = e, kr;
}
var Ao;
function th() {
  if (Ao) return Ir;
  Ao = 1, Object.defineProperty(Ir, "__esModule", { value: !0 });
  const t = Qd(), e = Zd(), r = eh(), s = [t.default, e.default, r.default];
  return Ir.default = s, Ir;
}
var Cr = {}, Lr = {}, Oo;
function rh() {
  if (Oo) return Lr;
  Oo = 1, Object.defineProperty(Lr, "__esModule", { value: !0 });
  const t = X(), e = ee(), r = Ie(), l = {
    keyword: "unevaluatedProperties",
    type: "object",
    schemaType: ["boolean", "object"],
    trackErrors: !0,
    error: {
      message: "must NOT have unevaluated properties",
      params: ({ params: c }) => (0, t._)`{unevaluatedProperty: ${c.unevaluatedProperty}}`
    },
    code(c) {
      const { gen: o, schema: f, data: d, errsCount: u, it: n } = c;
      if (!u)
        throw new Error("ajv implementation error");
      const { allErrors: i, props: a } = n;
      a instanceof t.Name ? o.if((0, t._)`${a} !== true`, () => o.forIn("key", d, (m) => o.if(p(a, m), () => h(m)))) : a !== !0 && o.forIn("key", d, (m) => a === void 0 ? h(m) : o.if(g(a, m), () => h(m))), n.props = !0, c.ok((0, t._)`${u} === ${r.default.errors}`);
      function h(m) {
        if (f === !1) {
          c.setParams({ unevaluatedProperty: m }), c.error(), i || o.break();
          return;
        }
        if (!(0, e.alwaysValidSchema)(n, f)) {
          const y = o.name("valid");
          c.subschema({
            keyword: "unevaluatedProperties",
            dataProp: m,
            dataPropType: e.Type.Str
          }, y), i || o.if((0, t.not)(y), () => o.break());
        }
      }
      function p(m, y) {
        return (0, t._)`!${m} || !${m}[${y}]`;
      }
      function g(m, y) {
        const v = [];
        for (const w in m)
          m[w] === !0 && v.push((0, t._)`${y} !== ${w}`);
        return (0, t.and)(...v);
      }
    }
  };
  return Lr.default = l, Lr;
}
var qr = {}, Io;
function nh() {
  if (Io) return qr;
  Io = 1, Object.defineProperty(qr, "__esModule", { value: !0 });
  const t = X(), e = ee(), s = {
    keyword: "unevaluatedItems",
    type: "array",
    schemaType: ["boolean", "object"],
    error: {
      message: ({ params: { len: l } }) => (0, t.str)`must NOT have more than ${l} items`,
      params: ({ params: { len: l } }) => (0, t._)`{limit: ${l}}`
    },
    code(l) {
      const { gen: c, schema: o, data: f, it: d } = l, u = d.items || 0;
      if (u === !0)
        return;
      const n = c.const("len", (0, t._)`${f}.length`);
      if (o === !1)
        l.setParams({ len: u }), l.fail((0, t._)`${n} > ${u}`);
      else if (typeof o == "object" && !(0, e.alwaysValidSchema)(d, o)) {
        const a = c.var("valid", (0, t._)`${n} <= ${u}`);
        c.if((0, t.not)(a), () => i(a, u)), l.ok(a);
      }
      d.items = !0;
      function i(a, h) {
        c.forRange("i", h, n, (p) => {
          l.subschema({ keyword: "unevaluatedItems", dataProp: p, dataPropType: e.Type.Num }, a), d.allErrors || c.if((0, t.not)(a), () => c.break());
        });
      }
    }
  };
  return qr.default = s, qr;
}
var Po;
function sh() {
  if (Po) return Cr;
  Po = 1, Object.defineProperty(Cr, "__esModule", { value: !0 });
  const t = rh(), e = nh(), r = [t.default, e.default];
  return Cr.default = r, Cr;
}
var Mr = {}, Dr = {}, To;
function ih() {
  if (To) return Dr;
  To = 1, Object.defineProperty(Dr, "__esModule", { value: !0 });
  const t = X(), r = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: s }) => (0, t.str)`must match format "${s}"`,
      params: ({ schemaCode: s }) => (0, t._)`{format: ${s}}`
    },
    code(s, l) {
      const { gen: c, data: o, $data: f, schema: d, schemaCode: u, it: n } = s, { opts: i, errSchemaPath: a, schemaEnv: h, self: p } = n;
      if (!i.validateFormats)
        return;
      f ? g() : m();
      function g() {
        const y = c.scopeValue("formats", {
          ref: p.formats,
          code: i.code.formats
        }), v = c.const("fDef", (0, t._)`${y}[${u}]`), w = c.let("fType"), b = c.let("format");
        c.if((0, t._)`typeof ${v} == "object" && !(${v} instanceof RegExp)`, () => c.assign(w, (0, t._)`${v}.type || "string"`).assign(b, (0, t._)`${v}.validate`), () => c.assign(w, (0, t._)`"string"`).assign(b, v)), s.fail$data((0, t.or)($(), S()));
        function $() {
          return i.strictSchema === !1 ? t.nil : (0, t._)`${u} && !${b}`;
        }
        function S() {
          const E = h.$async ? (0, t._)`(${v}.async ? await ${b}(${o}) : ${b}(${o}))` : (0, t._)`${b}(${o})`, N = (0, t._)`(typeof ${b} == "function" ? ${E} : ${b}.test(${o}))`;
          return (0, t._)`${b} && ${b} !== true && ${w} === ${l} && !${N}`;
        }
      }
      function m() {
        const y = p.formats[d];
        if (!y) {
          $();
          return;
        }
        if (y === !0)
          return;
        const [v, w, b] = S(y);
        v === l && s.pass(E());
        function $() {
          if (i.strictSchema === !1) {
            p.logger.warn(N());
            return;
          }
          throw new Error(N());
          function N() {
            return `unknown format "${d}" ignored in schema at path "${a}"`;
          }
        }
        function S(N) {
          const O = N instanceof RegExp ? (0, t.regexpCode)(N) : i.code.formats ? (0, t._)`${i.code.formats}${(0, t.getProperty)(d)}` : void 0, M = c.scopeValue("formats", { key: d, ref: N, code: O });
          return typeof N == "object" && !(N instanceof RegExp) ? [N.type || "string", N.validate, (0, t._)`${M}.validate`] : ["string", N, M];
        }
        function E() {
          if (typeof y == "object" && !(y instanceof RegExp) && y.async) {
            if (!h.$async)
              throw new Error("async format in sync schema");
            return (0, t._)`await ${b}(${o})`;
          }
          return typeof w == "function" ? (0, t._)`${b}(${o})` : (0, t._)`${b}.test(${o})`;
        }
      }
    }
  };
  return Dr.default = r, Dr;
}
var ko;
function ju() {
  if (ko) return Mr;
  ko = 1, Object.defineProperty(Mr, "__esModule", { value: !0 });
  const e = [ih().default];
  return Mr.default = e, Mr;
}
var Ye = {}, Co;
function Fu() {
  return Co || (Co = 1, Object.defineProperty(Ye, "__esModule", { value: !0 }), Ye.contentVocabulary = Ye.metadataVocabulary = void 0, Ye.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], Ye.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), Ye;
}
var Lo;
function ah() {
  if (Lo) return Xt;
  Lo = 1, Object.defineProperty(Xt, "__esModule", { value: !0 });
  const t = Pu(), e = Tu(), r = qu(), s = Wd(), l = th(), c = sh(), o = ju(), f = Fu(), d = [
    s.default,
    t.default,
    e.default,
    (0, r.default)(!0),
    o.default,
    f.metadataVocabulary,
    f.contentVocabulary,
    l.default,
    c.default
  ];
  return Xt.default = d, Xt;
}
var jr = {}, Et = {}, qo;
function oh() {
  if (qo) return Et;
  qo = 1, Object.defineProperty(Et, "__esModule", { value: !0 }), Et.DiscrError = void 0;
  var t;
  return (function(e) {
    e.Tag = "tag", e.Mapping = "mapping";
  })(t || (Et.DiscrError = t = {})), Et;
}
var Mo;
function Vu() {
  if (Mo) return jr;
  Mo = 1, Object.defineProperty(jr, "__esModule", { value: !0 });
  const t = X(), e = oh(), r = mn(), s = jt(), l = ee(), o = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: f, tagName: d } }) => f === e.DiscrError.Tag ? `tag "${d}" must be string` : `value of tag "${d}" must be in oneOf`,
      params: ({ params: { discrError: f, tag: d, tagName: u } }) => (0, t._)`{error: ${f}, tag: ${u}, tagValue: ${d}}`
    },
    code(f) {
      const { gen: d, data: u, schema: n, parentSchema: i, it: a } = f, { oneOf: h } = i;
      if (!a.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const p = n.propertyName;
      if (typeof p != "string")
        throw new Error("discriminator: requires propertyName");
      if (n.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!h)
        throw new Error("discriminator: requires oneOf keyword");
      const g = d.let("valid", !1), m = d.const("tag", (0, t._)`${u}${(0, t.getProperty)(p)}`);
      d.if((0, t._)`typeof ${m} == "string"`, () => y(), () => f.error(!1, { discrError: e.DiscrError.Tag, tag: m, tagName: p })), f.ok(g);
      function y() {
        const b = w();
        d.if(!1);
        for (const $ in b)
          d.elseIf((0, t._)`${m} === ${$}`), d.assign(g, v(b[$]));
        d.else(), f.error(!1, { discrError: e.DiscrError.Mapping, tag: m, tagName: p }), d.endIf();
      }
      function v(b) {
        const $ = d.name("valid"), S = f.subschema({ keyword: "oneOf", schemaProp: b }, $);
        return f.mergeEvaluated(S, t.Name), $;
      }
      function w() {
        var b;
        const $ = {}, S = N(i);
        let E = !0;
        for (let T = 0; T < h.length; T++) {
          let V = h[T];
          if (V?.$ref && !(0, l.schemaHasRulesButRef)(V, a.self.RULES)) {
            const C = V.$ref;
            if (V = r.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, C), V instanceof r.SchemaEnv && (V = V.schema), V === void 0)
              throw new s.default(a.opts.uriResolver, a.baseId, C);
          }
          const x = (b = V?.properties) === null || b === void 0 ? void 0 : b[p];
          if (typeof x != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${p}"`);
          E = E && (S || N(V)), O(x, T);
        }
        if (!E)
          throw new Error(`discriminator: "${p}" must be required`);
        return $;
        function N({ required: T }) {
          return Array.isArray(T) && T.includes(p);
        }
        function O(T, V) {
          if (T.const)
            M(T.const, V);
          else if (T.enum)
            for (const x of T.enum)
              M(x, V);
          else
            throw new Error(`discriminator: "properties/${p}" must have "const" or "enum"`);
        }
        function M(T, V) {
          if (typeof T != "string" || T in $)
            throw new Error(`discriminator: "${p}" values must be unique strings`);
          $[T] = V;
        }
      }
    }
  };
  return jr.default = o, jr;
}
var Fr = {};
const ch = "https://json-schema.org/draft/2020-12/schema", lh = "https://json-schema.org/draft/2020-12/schema", uh = { "https://json-schema.org/draft/2020-12/vocab/core": !0, "https://json-schema.org/draft/2020-12/vocab/applicator": !0, "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0, "https://json-schema.org/draft/2020-12/vocab/validation": !0, "https://json-schema.org/draft/2020-12/vocab/meta-data": !0, "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0, "https://json-schema.org/draft/2020-12/vocab/content": !0 }, fh = "meta", dh = "Core and Validation specifications meta-schema", hh = [{ $ref: "meta/core" }, { $ref: "meta/applicator" }, { $ref: "meta/unevaluated" }, { $ref: "meta/validation" }, { $ref: "meta/meta-data" }, { $ref: "meta/format-annotation" }, { $ref: "meta/content" }], ph = ["object", "boolean"], mh = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", gh = { definitions: { $comment: '"definitions" has been replaced by "$defs".', type: "object", additionalProperties: { $dynamicRef: "#meta" }, deprecated: !0, default: {} }, dependencies: { $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.', type: "object", additionalProperties: { anyOf: [{ $dynamicRef: "#meta" }, { $ref: "meta/validation#/$defs/stringArray" }] }, deprecated: !0, default: {} }, $recursiveAnchor: { $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".', $ref: "meta/core#/$defs/anchorString", deprecated: !0 }, $recursiveRef: { $comment: '"$recursiveRef" has been replaced by "$dynamicRef".', $ref: "meta/core#/$defs/uriReferenceString", deprecated: !0 } }, yh = {
  $schema: ch,
  $id: lh,
  $vocabulary: uh,
  $dynamicAnchor: fh,
  title: dh,
  allOf: hh,
  type: ph,
  $comment: mh,
  properties: gh
}, vh = "https://json-schema.org/draft/2020-12/schema", $h = "https://json-schema.org/draft/2020-12/meta/applicator", wh = { "https://json-schema.org/draft/2020-12/vocab/applicator": !0 }, bh = "meta", Sh = "Applicator vocabulary meta-schema", Eh = ["object", "boolean"], _h = { prefixItems: { $ref: "#/$defs/schemaArray" }, items: { $dynamicRef: "#meta" }, contains: { $dynamicRef: "#meta" }, additionalProperties: { $dynamicRef: "#meta" }, properties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, propertyNames: { format: "regex" }, default: {} }, dependentSchemas: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, propertyNames: { $dynamicRef: "#meta" }, if: { $dynamicRef: "#meta" }, then: { $dynamicRef: "#meta" }, else: { $dynamicRef: "#meta" }, allOf: { $ref: "#/$defs/schemaArray" }, anyOf: { $ref: "#/$defs/schemaArray" }, oneOf: { $ref: "#/$defs/schemaArray" }, not: { $dynamicRef: "#meta" } }, Nh = { schemaArray: { type: "array", minItems: 1, items: { $dynamicRef: "#meta" } } }, Rh = {
  $schema: vh,
  $id: $h,
  $vocabulary: wh,
  $dynamicAnchor: bh,
  title: Sh,
  type: Eh,
  properties: _h,
  $defs: Nh
}, Ah = "https://json-schema.org/draft/2020-12/schema", Oh = "https://json-schema.org/draft/2020-12/meta/unevaluated", Ih = { "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0 }, Ph = "meta", Th = "Unevaluated applicator vocabulary meta-schema", kh = ["object", "boolean"], Ch = { unevaluatedItems: { $dynamicRef: "#meta" }, unevaluatedProperties: { $dynamicRef: "#meta" } }, Lh = {
  $schema: Ah,
  $id: Oh,
  $vocabulary: Ih,
  $dynamicAnchor: Ph,
  title: Th,
  type: kh,
  properties: Ch
}, qh = "https://json-schema.org/draft/2020-12/schema", Mh = "https://json-schema.org/draft/2020-12/meta/content", Dh = { "https://json-schema.org/draft/2020-12/vocab/content": !0 }, jh = "meta", Fh = "Content vocabulary meta-schema", Vh = ["object", "boolean"], Uh = { contentEncoding: { type: "string" }, contentMediaType: { type: "string" }, contentSchema: { $dynamicRef: "#meta" } }, Bh = {
  $schema: qh,
  $id: Mh,
  $vocabulary: Dh,
  $dynamicAnchor: jh,
  title: Fh,
  type: Vh,
  properties: Uh
}, Kh = "https://json-schema.org/draft/2020-12/schema", xh = "https://json-schema.org/draft/2020-12/meta/core", zh = { "https://json-schema.org/draft/2020-12/vocab/core": !0 }, Gh = "meta", Yh = "Core vocabulary meta-schema", Hh = ["object", "boolean"], Jh = { $id: { $ref: "#/$defs/uriReferenceString", $comment: "Non-empty fragments not allowed.", pattern: "^[^#]*#?$" }, $schema: { $ref: "#/$defs/uriString" }, $ref: { $ref: "#/$defs/uriReferenceString" }, $anchor: { $ref: "#/$defs/anchorString" }, $dynamicRef: { $ref: "#/$defs/uriReferenceString" }, $dynamicAnchor: { $ref: "#/$defs/anchorString" }, $vocabulary: { type: "object", propertyNames: { $ref: "#/$defs/uriString" }, additionalProperties: { type: "boolean" } }, $comment: { type: "string" }, $defs: { type: "object", additionalProperties: { $dynamicRef: "#meta" } } }, Xh = { anchorString: { type: "string", pattern: "^[A-Za-z_][-A-Za-z0-9._]*$" }, uriString: { type: "string", format: "uri" }, uriReferenceString: { type: "string", format: "uri-reference" } }, Wh = {
  $schema: Kh,
  $id: xh,
  $vocabulary: zh,
  $dynamicAnchor: Gh,
  title: Yh,
  type: Hh,
  properties: Jh,
  $defs: Xh
}, Qh = "https://json-schema.org/draft/2020-12/schema", Zh = "https://json-schema.org/draft/2020-12/meta/format-annotation", ep = { "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0 }, tp = "meta", rp = "Format vocabulary meta-schema for annotation results", np = ["object", "boolean"], sp = { format: { type: "string" } }, ip = {
  $schema: Qh,
  $id: Zh,
  $vocabulary: ep,
  $dynamicAnchor: tp,
  title: rp,
  type: np,
  properties: sp
}, ap = "https://json-schema.org/draft/2020-12/schema", op = "https://json-schema.org/draft/2020-12/meta/meta-data", cp = { "https://json-schema.org/draft/2020-12/vocab/meta-data": !0 }, lp = "meta", up = "Meta-data vocabulary meta-schema", fp = ["object", "boolean"], dp = { title: { type: "string" }, description: { type: "string" }, default: !0, deprecated: { type: "boolean", default: !1 }, readOnly: { type: "boolean", default: !1 }, writeOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 } }, hp = {
  $schema: ap,
  $id: op,
  $vocabulary: cp,
  $dynamicAnchor: lp,
  title: up,
  type: fp,
  properties: dp
}, pp = "https://json-schema.org/draft/2020-12/schema", mp = "https://json-schema.org/draft/2020-12/meta/validation", gp = { "https://json-schema.org/draft/2020-12/vocab/validation": !0 }, yp = "meta", vp = "Validation vocabulary meta-schema", $p = ["object", "boolean"], wp = { type: { anyOf: [{ $ref: "#/$defs/simpleTypes" }, { type: "array", items: { $ref: "#/$defs/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, const: !0, enum: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/$defs/nonNegativeInteger" }, minLength: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, maxItems: { $ref: "#/$defs/nonNegativeInteger" }, minItems: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, maxContains: { $ref: "#/$defs/nonNegativeInteger" }, minContains: { $ref: "#/$defs/nonNegativeInteger", default: 1 }, maxProperties: { $ref: "#/$defs/nonNegativeInteger" }, minProperties: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, required: { $ref: "#/$defs/stringArray" }, dependentRequired: { type: "object", additionalProperties: { $ref: "#/$defs/stringArray" } } }, bp = { nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { $ref: "#/$defs/nonNegativeInteger", default: 0 }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, Sp = {
  $schema: pp,
  $id: mp,
  $vocabulary: gp,
  $dynamicAnchor: yp,
  title: vp,
  type: $p,
  properties: wp,
  $defs: bp
};
var Do;
function Ep() {
  if (Do) return Fr;
  Do = 1, Object.defineProperty(Fr, "__esModule", { value: !0 });
  const t = yh, e = Rh, r = Lh, s = Bh, l = Wh, c = ip, o = hp, f = Sp, d = ["/properties"];
  function u(n) {
    return [
      t,
      e,
      r,
      s,
      l,
      i(this, c),
      o,
      i(this, f)
    ].forEach((a) => this.addMetaSchema(a, void 0, !1)), this;
    function i(a, h) {
      return n ? a.$dataMetaSchema(h, d) : h;
    }
  }
  return Fr.default = u, Fr;
}
var jo;
function _p() {
  return jo || (jo = 1, (function(t, e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.MissingRefError = e.ValidationError = e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = e.Ajv2020 = void 0;
    const r = Iu(), s = ah(), l = Vu(), c = Ep(), o = "https://json-schema.org/draft/2020-12/schema";
    class f extends r.default {
      constructor(h = {}) {
        super({
          ...h,
          dynamicRef: !0,
          next: !0,
          unevaluated: !0
        });
      }
      _addVocabularies() {
        super._addVocabularies(), s.default.forEach((h) => this.addVocabulary(h)), this.opts.discriminator && this.addKeyword(l.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        const { $data: h, meta: p } = this.opts;
        p && (c.default.call(this, h), this.refs["http://json-schema.org/schema"] = o);
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
      }
    }
    e.Ajv2020 = f, t.exports = e = f, t.exports.Ajv2020 = f, Object.defineProperty(e, "__esModule", { value: !0 }), e.default = f;
    var d = Dt();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return d.KeywordCxt;
    } });
    var u = X();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return u._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return u.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return u.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return u.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return u.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return u.CodeGen;
    } });
    var n = pn();
    Object.defineProperty(e, "ValidationError", { enumerable: !0, get: function() {
      return n.default;
    } });
    var i = jt();
    Object.defineProperty(e, "MissingRefError", { enumerable: !0, get: function() {
      return i.default;
    } });
  })(zt, zt.exports)), zt.exports;
}
var Np = _p(), Vr = { exports: {} }, Yn = {}, Fo;
function Rp() {
  return Fo || (Fo = 1, (function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.formatNames = t.fastFormats = t.fullFormats = void 0;
    function e(T, V) {
      return { validate: T, compare: V };
    }
    t.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: e(c, o),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: e(d(!0), u),
      "date-time": e(a(!0), h),
      "iso-time": e(d(), n),
      "iso-date-time": e(a(), p),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri: y,
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
      regex: M,
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
      int32: { type: "number", validate: S },
      // signed 64 bit integer
      int64: { type: "number", validate: E },
      // C-type float
      float: { type: "number", validate: N },
      // C-type double
      double: { type: "number", validate: N },
      // hint to the UI to hide input strings
      password: !0,
      // unchecked string payload
      binary: !0
    }, t.fastFormats = {
      ...t.fullFormats,
      date: e(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, o),
      time: e(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, u),
      "date-time": e(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, h),
      "iso-time": e(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, n),
      "iso-date-time": e(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, p),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    }, t.formatNames = Object.keys(t.fullFormats);
    function r(T) {
      return T % 4 === 0 && (T % 100 !== 0 || T % 400 === 0);
    }
    const s = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, l = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function c(T) {
      const V = s.exec(T);
      if (!V)
        return !1;
      const x = +V[1], C = +V[2], j = +V[3];
      return C >= 1 && C <= 12 && j >= 1 && j <= (C === 2 && r(x) ? 29 : l[C]);
    }
    function o(T, V) {
      if (T && V)
        return T > V ? 1 : T < V ? -1 : 0;
    }
    const f = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function d(T) {
      return function(x) {
        const C = f.exec(x);
        if (!C)
          return !1;
        const j = +C[1], z = +C[2], F = +C[3], B = C[4], K = C[5] === "-" ? -1 : 1, q = +(C[6] || 0), A = +(C[7] || 0);
        if (q > 23 || A > 59 || T && !B)
          return !1;
        if (j <= 23 && z <= 59 && F < 60)
          return !0;
        const L = z - A * K, I = j - q * K - (L < 0 ? 1 : 0);
        return (I === 23 || I === -1) && (L === 59 || L === -1) && F < 61;
      };
    }
    function u(T, V) {
      if (!(T && V))
        return;
      const x = (/* @__PURE__ */ new Date("2020-01-01T" + T)).valueOf(), C = (/* @__PURE__ */ new Date("2020-01-01T" + V)).valueOf();
      if (x && C)
        return x - C;
    }
    function n(T, V) {
      if (!(T && V))
        return;
      const x = f.exec(T), C = f.exec(V);
      if (x && C)
        return T = x[1] + x[2] + x[3], V = C[1] + C[2] + C[3], T > V ? 1 : T < V ? -1 : 0;
    }
    const i = /t|\s/i;
    function a(T) {
      const V = d(T);
      return function(C) {
        const j = C.split(i);
        return j.length === 2 && c(j[0]) && V(j[1]);
      };
    }
    function h(T, V) {
      if (!(T && V))
        return;
      const x = new Date(T).valueOf(), C = new Date(V).valueOf();
      if (x && C)
        return x - C;
    }
    function p(T, V) {
      if (!(T && V))
        return;
      const [x, C] = T.split(i), [j, z] = V.split(i), F = o(x, j);
      if (F !== void 0)
        return F || u(C, z);
    }
    const g = /\/|:/, m = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function y(T) {
      return g.test(T) && m.test(T);
    }
    const v = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function w(T) {
      return v.lastIndex = 0, v.test(T);
    }
    const b = -2147483648, $ = 2 ** 31 - 1;
    function S(T) {
      return Number.isInteger(T) && T <= $ && T >= b;
    }
    function E(T) {
      return Number.isInteger(T);
    }
    function N() {
      return !0;
    }
    const O = /[^\\]\\Z/;
    function M(T) {
      if (O.test(T))
        return !1;
      try {
        return new RegExp(T), !0;
      } catch {
        return !1;
      }
    }
  })(Yn)), Yn;
}
var Hn = {}, Ur = { exports: {} }, Br = {}, Vo;
function Ap() {
  if (Vo) return Br;
  Vo = 1, Object.defineProperty(Br, "__esModule", { value: !0 });
  const t = Pu(), e = Tu(), r = qu(), s = ju(), l = Fu(), c = [
    t.default,
    e.default,
    (0, r.default)(),
    s.default,
    l.metadataVocabulary,
    l.contentVocabulary
  ];
  return Br.default = c, Br;
}
const Op = "http://json-schema.org/draft-07/schema#", Ip = "http://json-schema.org/draft-07/schema#", Pp = "Core schema meta-schema", Tp = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, kp = ["object", "boolean"], Cp = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, Lp = {
  $schema: Op,
  $id: Ip,
  title: Pp,
  definitions: Tp,
  type: kp,
  properties: Cp,
  default: !0
};
var Uo;
function Uu() {
  return Uo || (Uo = 1, (function(t, e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.MissingRefError = e.ValidationError = e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = e.Ajv = void 0;
    const r = Iu(), s = Ap(), l = Vu(), c = Lp, o = ["/properties"], f = "http://json-schema.org/draft-07/schema";
    class d extends r.default {
      _addVocabularies() {
        super._addVocabularies(), s.default.forEach((p) => this.addVocabulary(p)), this.opts.discriminator && this.addKeyword(l.default);
      }
      _addDefaultMetaSchema() {
        if (super._addDefaultMetaSchema(), !this.opts.meta)
          return;
        const p = this.opts.$data ? this.$dataMetaSchema(c, o) : c;
        this.addMetaSchema(p, f, !1), this.refs["http://json-schema.org/schema"] = f;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(f) ? f : void 0);
      }
    }
    e.Ajv = d, t.exports = e = d, t.exports.Ajv = d, Object.defineProperty(e, "__esModule", { value: !0 }), e.default = d;
    var u = Dt();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return u.KeywordCxt;
    } });
    var n = X();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return n._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return n.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return n.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return n.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return n.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return n.CodeGen;
    } });
    var i = pn();
    Object.defineProperty(e, "ValidationError", { enumerable: !0, get: function() {
      return i.default;
    } });
    var a = jt();
    Object.defineProperty(e, "MissingRefError", { enumerable: !0, get: function() {
      return a.default;
    } });
  })(Ur, Ur.exports)), Ur.exports;
}
var Bo;
function qp() {
  return Bo || (Bo = 1, (function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.formatLimitDefinition = void 0;
    const e = Uu(), r = X(), s = r.operators, l = {
      formatMaximum: { okStr: "<=", ok: s.LTE, fail: s.GT },
      formatMinimum: { okStr: ">=", ok: s.GTE, fail: s.LT },
      formatExclusiveMaximum: { okStr: "<", ok: s.LT, fail: s.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: s.GT, fail: s.LTE }
    }, c = {
      message: ({ keyword: f, schemaCode: d }) => (0, r.str)`should be ${l[f].okStr} ${d}`,
      params: ({ keyword: f, schemaCode: d }) => (0, r._)`{comparison: ${l[f].okStr}, limit: ${d}}`
    };
    t.formatLimitDefinition = {
      keyword: Object.keys(l),
      type: "string",
      schemaType: "string",
      $data: !0,
      error: c,
      code(f) {
        const { gen: d, data: u, schemaCode: n, keyword: i, it: a } = f, { opts: h, self: p } = a;
        if (!h.validateFormats)
          return;
        const g = new e.KeywordCxt(a, p.RULES.all.format.definition, "format");
        g.$data ? m() : y();
        function m() {
          const w = d.scopeValue("formats", {
            ref: p.formats,
            code: h.code.formats
          }), b = d.const("fmt", (0, r._)`${w}[${g.schemaCode}]`);
          f.fail$data((0, r.or)((0, r._)`typeof ${b} != "object"`, (0, r._)`${b} instanceof RegExp`, (0, r._)`typeof ${b}.compare != "function"`, v(b)));
        }
        function y() {
          const w = g.schema, b = p.formats[w];
          if (!b || b === !0)
            return;
          if (typeof b != "object" || b instanceof RegExp || typeof b.compare != "function")
            throw new Error(`"${i}": format "${w}" does not define "compare" function`);
          const $ = d.scopeValue("formats", {
            key: w,
            ref: b,
            code: h.code.formats ? (0, r._)`${h.code.formats}${(0, r.getProperty)(w)}` : void 0
          });
          f.fail$data(v($));
        }
        function v(w) {
          return (0, r._)`${w}.compare(${u}, ${n}) ${l[i].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    const o = (f) => (f.addKeyword(t.formatLimitDefinition), f);
    t.default = o;
  })(Hn)), Hn;
}
var Ko;
function Mp() {
  return Ko || (Ko = 1, (function(t, e) {
    Object.defineProperty(e, "__esModule", { value: !0 });
    const r = Rp(), s = qp(), l = X(), c = new l.Name("fullFormats"), o = new l.Name("fastFormats"), f = (u, n = { keywords: !0 }) => {
      if (Array.isArray(n))
        return d(u, n, r.fullFormats, c), u;
      const [i, a] = n.mode === "fast" ? [r.fastFormats, o] : [r.fullFormats, c], h = n.formats || r.formatNames;
      return d(u, h, i, a), n.keywords && (0, s.default)(u), u;
    };
    f.get = (u, n = "full") => {
      const a = (n === "fast" ? r.fastFormats : r.fullFormats)[u];
      if (!a)
        throw new Error(`Unknown format "${u}"`);
      return a;
    };
    function d(u, n, i, a) {
      var h, p;
      (h = (p = u.opts.code).formats) !== null && h !== void 0 || (p.formats = (0, l._)`require("ajv-formats/dist/formats").${a}`);
      for (const g of n)
        u.addFormat(g, i[g]);
    }
    t.exports = e = f, Object.defineProperty(e, "__esModule", { value: !0 }), e.default = f;
  })(Vr, Vr.exports)), Vr.exports;
}
var Dp = Mp();
const Bu = /* @__PURE__ */ fn(Dp), jp = (t, e, r, s) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const l = Object.getOwnPropertyDescriptor(t, r), c = Object.getOwnPropertyDescriptor(e, r);
  !Fp(l, c) && s || Object.defineProperty(t, r, c);
}, Fp = function(t, e) {
  return t === void 0 || t.configurable || t.writable === e.writable && t.enumerable === e.enumerable && t.configurable === e.configurable && (t.writable || t.value === e.value);
}, Vp = (t, e) => {
  const r = Object.getPrototypeOf(e);
  r !== Object.getPrototypeOf(t) && Object.setPrototypeOf(t, r);
}, Up = (t, e) => `/* Wrapped ${t}*/
${e}`, Bp = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), Kp = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), xp = (t, e, r) => {
  const s = r === "" ? "" : `with ${r.trim()}() `, l = Up.bind(null, s, e.toString());
  Object.defineProperty(l, "name", Kp);
  const { writable: c, enumerable: o, configurable: f } = Bp;
  Object.defineProperty(t, "toString", { value: l, writable: c, enumerable: o, configurable: f });
};
function zp(t, e, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: s } = t;
  for (const l of Reflect.ownKeys(e))
    jp(t, e, l, r);
  return Vp(t, e), xp(t, e, s), t;
}
const xo = (t, e = {}) => {
  if (typeof t != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof t}\``);
  const {
    wait: r = 0,
    maxWait: s = Number.POSITIVE_INFINITY,
    before: l = !1,
    after: c = !0
  } = e;
  if (r < 0 || s < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!l && !c)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let o, f, d;
  const u = function(...n) {
    const i = this, a = () => {
      o = void 0, f && (clearTimeout(f), f = void 0), c && (d = t.apply(i, n));
    }, h = () => {
      f = void 0, o && (clearTimeout(o), o = void 0), c && (d = t.apply(i, n));
    }, p = l && !o;
    return clearTimeout(o), o = setTimeout(a, r), s > 0 && s !== Number.POSITIVE_INFINITY && !f && (f = setTimeout(h, s)), p && (d = t.apply(i, n)), d;
  };
  return zp(u, t), u.cancel = () => {
    o && (clearTimeout(o), o = void 0), f && (clearTimeout(f), f = void 0);
  }, u;
};
var Kr = { exports: {} }, Jn, zo;
function gn() {
  if (zo) return Jn;
  zo = 1;
  const t = "2.0.0", e = 256, r = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, s = 16, l = e - 6;
  return Jn = {
    MAX_LENGTH: e,
    MAX_SAFE_COMPONENT_LENGTH: s,
    MAX_SAFE_BUILD_LENGTH: l,
    MAX_SAFE_INTEGER: r,
    RELEASE_TYPES: [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ],
    SEMVER_SPEC_VERSION: t,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  }, Jn;
}
var Xn, Go;
function yn() {
  return Go || (Go = 1, Xn = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
  }), Xn;
}
var Yo;
function Ft() {
  return Yo || (Yo = 1, (function(t, e) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: r,
      MAX_SAFE_BUILD_LENGTH: s,
      MAX_LENGTH: l
    } = gn(), c = yn();
    e = t.exports = {};
    const o = e.re = [], f = e.safeRe = [], d = e.src = [], u = e.safeSrc = [], n = e.t = {};
    let i = 0;
    const a = "[a-zA-Z0-9-]", h = [
      ["\\s", 1],
      ["\\d", l],
      [a, s]
    ], p = (m) => {
      for (const [y, v] of h)
        m = m.split(`${y}*`).join(`${y}{0,${v}}`).split(`${y}+`).join(`${y}{1,${v}}`);
      return m;
    }, g = (m, y, v) => {
      const w = p(y), b = i++;
      c(m, b, y), n[m] = b, d[b] = y, u[b] = w, o[b] = new RegExp(y, v ? "g" : void 0), f[b] = new RegExp(w, v ? "g" : void 0);
    };
    g("NUMERICIDENTIFIER", "0|[1-9]\\d*"), g("NUMERICIDENTIFIERLOOSE", "\\d+"), g("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${a}*`), g("MAINVERSION", `(${d[n.NUMERICIDENTIFIER]})\\.(${d[n.NUMERICIDENTIFIER]})\\.(${d[n.NUMERICIDENTIFIER]})`), g("MAINVERSIONLOOSE", `(${d[n.NUMERICIDENTIFIERLOOSE]})\\.(${d[n.NUMERICIDENTIFIERLOOSE]})\\.(${d[n.NUMERICIDENTIFIERLOOSE]})`), g("PRERELEASEIDENTIFIER", `(?:${d[n.NONNUMERICIDENTIFIER]}|${d[n.NUMERICIDENTIFIER]})`), g("PRERELEASEIDENTIFIERLOOSE", `(?:${d[n.NONNUMERICIDENTIFIER]}|${d[n.NUMERICIDENTIFIERLOOSE]})`), g("PRERELEASE", `(?:-(${d[n.PRERELEASEIDENTIFIER]}(?:\\.${d[n.PRERELEASEIDENTIFIER]})*))`), g("PRERELEASELOOSE", `(?:-?(${d[n.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${d[n.PRERELEASEIDENTIFIERLOOSE]})*))`), g("BUILDIDENTIFIER", `${a}+`), g("BUILD", `(?:\\+(${d[n.BUILDIDENTIFIER]}(?:\\.${d[n.BUILDIDENTIFIER]})*))`), g("FULLPLAIN", `v?${d[n.MAINVERSION]}${d[n.PRERELEASE]}?${d[n.BUILD]}?`), g("FULL", `^${d[n.FULLPLAIN]}$`), g("LOOSEPLAIN", `[v=\\s]*${d[n.MAINVERSIONLOOSE]}${d[n.PRERELEASELOOSE]}?${d[n.BUILD]}?`), g("LOOSE", `^${d[n.LOOSEPLAIN]}$`), g("GTLT", "((?:<|>)?=?)"), g("XRANGEIDENTIFIERLOOSE", `${d[n.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), g("XRANGEIDENTIFIER", `${d[n.NUMERICIDENTIFIER]}|x|X|\\*`), g("XRANGEPLAIN", `[v=\\s]*(${d[n.XRANGEIDENTIFIER]})(?:\\.(${d[n.XRANGEIDENTIFIER]})(?:\\.(${d[n.XRANGEIDENTIFIER]})(?:${d[n.PRERELEASE]})?${d[n.BUILD]}?)?)?`), g("XRANGEPLAINLOOSE", `[v=\\s]*(${d[n.XRANGEIDENTIFIERLOOSE]})(?:\\.(${d[n.XRANGEIDENTIFIERLOOSE]})(?:\\.(${d[n.XRANGEIDENTIFIERLOOSE]})(?:${d[n.PRERELEASELOOSE]})?${d[n.BUILD]}?)?)?`), g("XRANGE", `^${d[n.GTLT]}\\s*${d[n.XRANGEPLAIN]}$`), g("XRANGELOOSE", `^${d[n.GTLT]}\\s*${d[n.XRANGEPLAINLOOSE]}$`), g("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), g("COERCE", `${d[n.COERCEPLAIN]}(?:$|[^\\d])`), g("COERCEFULL", d[n.COERCEPLAIN] + `(?:${d[n.PRERELEASE]})?(?:${d[n.BUILD]})?(?:$|[^\\d])`), g("COERCERTL", d[n.COERCE], !0), g("COERCERTLFULL", d[n.COERCEFULL], !0), g("LONETILDE", "(?:~>?)"), g("TILDETRIM", `(\\s*)${d[n.LONETILDE]}\\s+`, !0), e.tildeTrimReplace = "$1~", g("TILDE", `^${d[n.LONETILDE]}${d[n.XRANGEPLAIN]}$`), g("TILDELOOSE", `^${d[n.LONETILDE]}${d[n.XRANGEPLAINLOOSE]}$`), g("LONECARET", "(?:\\^)"), g("CARETTRIM", `(\\s*)${d[n.LONECARET]}\\s+`, !0), e.caretTrimReplace = "$1^", g("CARET", `^${d[n.LONECARET]}${d[n.XRANGEPLAIN]}$`), g("CARETLOOSE", `^${d[n.LONECARET]}${d[n.XRANGEPLAINLOOSE]}$`), g("COMPARATORLOOSE", `^${d[n.GTLT]}\\s*(${d[n.LOOSEPLAIN]})$|^$`), g("COMPARATOR", `^${d[n.GTLT]}\\s*(${d[n.FULLPLAIN]})$|^$`), g("COMPARATORTRIM", `(\\s*)${d[n.GTLT]}\\s*(${d[n.LOOSEPLAIN]}|${d[n.XRANGEPLAIN]})`, !0), e.comparatorTrimReplace = "$1$2$3", g("HYPHENRANGE", `^\\s*(${d[n.XRANGEPLAIN]})\\s+-\\s+(${d[n.XRANGEPLAIN]})\\s*$`), g("HYPHENRANGELOOSE", `^\\s*(${d[n.XRANGEPLAINLOOSE]})\\s+-\\s+(${d[n.XRANGEPLAINLOOSE]})\\s*$`), g("STAR", "(<|>)?=?\\s*\\*"), g("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), g("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(Kr, Kr.exports)), Kr.exports;
}
var Wn, Ho;
function Bi() {
  if (Ho) return Wn;
  Ho = 1;
  const t = Object.freeze({ loose: !0 }), e = Object.freeze({});
  return Wn = (s) => s ? typeof s != "object" ? t : s : e, Wn;
}
var Qn, Jo;
function Ku() {
  if (Jo) return Qn;
  Jo = 1;
  const t = /^[0-9]+$/, e = (s, l) => {
    const c = t.test(s), o = t.test(l);
    return c && o && (s = +s, l = +l), s === l ? 0 : c && !o ? -1 : o && !c ? 1 : s < l ? -1 : 1;
  };
  return Qn = {
    compareIdentifiers: e,
    rcompareIdentifiers: (s, l) => e(l, s)
  }, Qn;
}
var Zn, Xo;
function we() {
  if (Xo) return Zn;
  Xo = 1;
  const t = yn(), { MAX_LENGTH: e, MAX_SAFE_INTEGER: r } = gn(), { safeRe: s, t: l } = Ft(), c = Bi(), { compareIdentifiers: o } = Ku();
  class f {
    constructor(u, n) {
      if (n = c(n), u instanceof f) {
        if (u.loose === !!n.loose && u.includePrerelease === !!n.includePrerelease)
          return u;
        u = u.version;
      } else if (typeof u != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof u}".`);
      if (u.length > e)
        throw new TypeError(
          `version is longer than ${e} characters`
        );
      t("SemVer", u, n), this.options = n, this.loose = !!n.loose, this.includePrerelease = !!n.includePrerelease;
      const i = u.trim().match(n.loose ? s[l.LOOSE] : s[l.FULL]);
      if (!i)
        throw new TypeError(`Invalid Version: ${u}`);
      if (this.raw = u, this.major = +i[1], this.minor = +i[2], this.patch = +i[3], this.major > r || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > r || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > r || this.patch < 0)
        throw new TypeError("Invalid patch version");
      i[4] ? this.prerelease = i[4].split(".").map((a) => {
        if (/^[0-9]+$/.test(a)) {
          const h = +a;
          if (h >= 0 && h < r)
            return h;
        }
        return a;
      }) : this.prerelease = [], this.build = i[5] ? i[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(u) {
      if (t("SemVer.compare", this.version, this.options, u), !(u instanceof f)) {
        if (typeof u == "string" && u === this.version)
          return 0;
        u = new f(u, this.options);
      }
      return u.version === this.version ? 0 : this.compareMain(u) || this.comparePre(u);
    }
    compareMain(u) {
      return u instanceof f || (u = new f(u, this.options)), o(this.major, u.major) || o(this.minor, u.minor) || o(this.patch, u.patch);
    }
    comparePre(u) {
      if (u instanceof f || (u = new f(u, this.options)), this.prerelease.length && !u.prerelease.length)
        return -1;
      if (!this.prerelease.length && u.prerelease.length)
        return 1;
      if (!this.prerelease.length && !u.prerelease.length)
        return 0;
      let n = 0;
      do {
        const i = this.prerelease[n], a = u.prerelease[n];
        if (t("prerelease compare", n, i, a), i === void 0 && a === void 0)
          return 0;
        if (a === void 0)
          return 1;
        if (i === void 0)
          return -1;
        if (i === a)
          continue;
        return o(i, a);
      } while (++n);
    }
    compareBuild(u) {
      u instanceof f || (u = new f(u, this.options));
      let n = 0;
      do {
        const i = this.build[n], a = u.build[n];
        if (t("build compare", n, i, a), i === void 0 && a === void 0)
          return 0;
        if (a === void 0)
          return 1;
        if (i === void 0)
          return -1;
        if (i === a)
          continue;
        return o(i, a);
      } while (++n);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(u, n, i) {
      if (u.startsWith("pre")) {
        if (!n && i === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (n) {
          const a = `-${n}`.match(this.options.loose ? s[l.PRERELEASELOOSE] : s[l.PRERELEASE]);
          if (!a || a[1] !== n)
            throw new Error(`invalid identifier: ${n}`);
        }
      }
      switch (u) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", n, i);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", n, i);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", n, i), this.inc("pre", n, i);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", n, i), this.inc("pre", n, i);
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
          const a = Number(i) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [a];
          else {
            let h = this.prerelease.length;
            for (; --h >= 0; )
              typeof this.prerelease[h] == "number" && (this.prerelease[h]++, h = -2);
            if (h === -1) {
              if (n === this.prerelease.join(".") && i === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(a);
            }
          }
          if (n) {
            let h = [n, a];
            i === !1 && (h = [n]), o(this.prerelease[0], n) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = h) : this.prerelease = h;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${u}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return Zn = f, Zn;
}
var es, Wo;
function vt() {
  if (Wo) return es;
  Wo = 1;
  const t = we();
  return es = (r, s, l = !1) => {
    if (r instanceof t)
      return r;
    try {
      return new t(r, s);
    } catch (c) {
      if (!l)
        return null;
      throw c;
    }
  }, es;
}
var ts, Qo;
function Gp() {
  if (Qo) return ts;
  Qo = 1;
  const t = vt();
  return ts = (r, s) => {
    const l = t(r, s);
    return l ? l.version : null;
  }, ts;
}
var rs, Zo;
function Yp() {
  if (Zo) return rs;
  Zo = 1;
  const t = vt();
  return rs = (r, s) => {
    const l = t(r.trim().replace(/^[=v]+/, ""), s);
    return l ? l.version : null;
  }, rs;
}
var ns, ec;
function Hp() {
  if (ec) return ns;
  ec = 1;
  const t = we();
  return ns = (r, s, l, c, o) => {
    typeof l == "string" && (o = c, c = l, l = void 0);
    try {
      return new t(
        r instanceof t ? r.version : r,
        l
      ).inc(s, c, o).version;
    } catch {
      return null;
    }
  }, ns;
}
var ss, tc;
function Jp() {
  if (tc) return ss;
  tc = 1;
  const t = vt();
  return ss = (r, s) => {
    const l = t(r, null, !0), c = t(s, null, !0), o = l.compare(c);
    if (o === 0)
      return null;
    const f = o > 0, d = f ? l : c, u = f ? c : l, n = !!d.prerelease.length;
    if (!!u.prerelease.length && !n) {
      if (!u.patch && !u.minor)
        return "major";
      if (u.compareMain(d) === 0)
        return u.minor && !u.patch ? "minor" : "patch";
    }
    const a = n ? "pre" : "";
    return l.major !== c.major ? a + "major" : l.minor !== c.minor ? a + "minor" : l.patch !== c.patch ? a + "patch" : "prerelease";
  }, ss;
}
var is, rc;
function Xp() {
  if (rc) return is;
  rc = 1;
  const t = we();
  return is = (r, s) => new t(r, s).major, is;
}
var as, nc;
function Wp() {
  if (nc) return as;
  nc = 1;
  const t = we();
  return as = (r, s) => new t(r, s).minor, as;
}
var os, sc;
function Qp() {
  if (sc) return os;
  sc = 1;
  const t = we();
  return os = (r, s) => new t(r, s).patch, os;
}
var cs, ic;
function Zp() {
  if (ic) return cs;
  ic = 1;
  const t = vt();
  return cs = (r, s) => {
    const l = t(r, s);
    return l && l.prerelease.length ? l.prerelease : null;
  }, cs;
}
var ls, ac;
function Te() {
  if (ac) return ls;
  ac = 1;
  const t = we();
  return ls = (r, s, l) => new t(r, l).compare(new t(s, l)), ls;
}
var us, oc;
function em() {
  if (oc) return us;
  oc = 1;
  const t = Te();
  return us = (r, s, l) => t(s, r, l), us;
}
var fs, cc;
function tm() {
  if (cc) return fs;
  cc = 1;
  const t = Te();
  return fs = (r, s) => t(r, s, !0), fs;
}
var ds, lc;
function Ki() {
  if (lc) return ds;
  lc = 1;
  const t = we();
  return ds = (r, s, l) => {
    const c = new t(r, l), o = new t(s, l);
    return c.compare(o) || c.compareBuild(o);
  }, ds;
}
var hs, uc;
function rm() {
  if (uc) return hs;
  uc = 1;
  const t = Ki();
  return hs = (r, s) => r.sort((l, c) => t(l, c, s)), hs;
}
var ps, fc;
function nm() {
  if (fc) return ps;
  fc = 1;
  const t = Ki();
  return ps = (r, s) => r.sort((l, c) => t(c, l, s)), ps;
}
var ms, dc;
function vn() {
  if (dc) return ms;
  dc = 1;
  const t = Te();
  return ms = (r, s, l) => t(r, s, l) > 0, ms;
}
var gs, hc;
function xi() {
  if (hc) return gs;
  hc = 1;
  const t = Te();
  return gs = (r, s, l) => t(r, s, l) < 0, gs;
}
var ys, pc;
function xu() {
  if (pc) return ys;
  pc = 1;
  const t = Te();
  return ys = (r, s, l) => t(r, s, l) === 0, ys;
}
var vs, mc;
function zu() {
  if (mc) return vs;
  mc = 1;
  const t = Te();
  return vs = (r, s, l) => t(r, s, l) !== 0, vs;
}
var $s, gc;
function zi() {
  if (gc) return $s;
  gc = 1;
  const t = Te();
  return $s = (r, s, l) => t(r, s, l) >= 0, $s;
}
var ws, yc;
function Gi() {
  if (yc) return ws;
  yc = 1;
  const t = Te();
  return ws = (r, s, l) => t(r, s, l) <= 0, ws;
}
var bs, vc;
function Gu() {
  if (vc) return bs;
  vc = 1;
  const t = xu(), e = zu(), r = vn(), s = zi(), l = xi(), c = Gi();
  return bs = (f, d, u, n) => {
    switch (d) {
      case "===":
        return typeof f == "object" && (f = f.version), typeof u == "object" && (u = u.version), f === u;
      case "!==":
        return typeof f == "object" && (f = f.version), typeof u == "object" && (u = u.version), f !== u;
      case "":
      case "=":
      case "==":
        return t(f, u, n);
      case "!=":
        return e(f, u, n);
      case ">":
        return r(f, u, n);
      case ">=":
        return s(f, u, n);
      case "<":
        return l(f, u, n);
      case "<=":
        return c(f, u, n);
      default:
        throw new TypeError(`Invalid operator: ${d}`);
    }
  }, bs;
}
var Ss, $c;
function sm() {
  if ($c) return Ss;
  $c = 1;
  const t = we(), e = vt(), { safeRe: r, t: s } = Ft();
  return Ss = (c, o) => {
    if (c instanceof t)
      return c;
    if (typeof c == "number" && (c = String(c)), typeof c != "string")
      return null;
    o = o || {};
    let f = null;
    if (!o.rtl)
      f = c.match(o.includePrerelease ? r[s.COERCEFULL] : r[s.COERCE]);
    else {
      const h = o.includePrerelease ? r[s.COERCERTLFULL] : r[s.COERCERTL];
      let p;
      for (; (p = h.exec(c)) && (!f || f.index + f[0].length !== c.length); )
        (!f || p.index + p[0].length !== f.index + f[0].length) && (f = p), h.lastIndex = p.index + p[1].length + p[2].length;
      h.lastIndex = -1;
    }
    if (f === null)
      return null;
    const d = f[2], u = f[3] || "0", n = f[4] || "0", i = o.includePrerelease && f[5] ? `-${f[5]}` : "", a = o.includePrerelease && f[6] ? `+${f[6]}` : "";
    return e(`${d}.${u}.${n}${i}${a}`, o);
  }, Ss;
}
var Es, wc;
function im() {
  if (wc) return Es;
  wc = 1;
  class t {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(r) {
      const s = this.map.get(r);
      if (s !== void 0)
        return this.map.delete(r), this.map.set(r, s), s;
    }
    delete(r) {
      return this.map.delete(r);
    }
    set(r, s) {
      if (!this.delete(r) && s !== void 0) {
        if (this.map.size >= this.max) {
          const c = this.map.keys().next().value;
          this.delete(c);
        }
        this.map.set(r, s);
      }
      return this;
    }
  }
  return Es = t, Es;
}
var _s, bc;
function ke() {
  if (bc) return _s;
  bc = 1;
  const t = /\s+/g;
  class e {
    constructor(j, z) {
      if (z = l(z), j instanceof e)
        return j.loose === !!z.loose && j.includePrerelease === !!z.includePrerelease ? j : new e(j.raw, z);
      if (j instanceof c)
        return this.raw = j.value, this.set = [[j]], this.formatted = void 0, this;
      if (this.options = z, this.loose = !!z.loose, this.includePrerelease = !!z.includePrerelease, this.raw = j.trim().replace(t, " "), this.set = this.raw.split("||").map((F) => this.parseRange(F.trim())).filter((F) => F.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const F = this.set[0];
        if (this.set = this.set.filter((B) => !g(B[0])), this.set.length === 0)
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
        for (let j = 0; j < this.set.length; j++) {
          j > 0 && (this.formatted += "||");
          const z = this.set[j];
          for (let F = 0; F < z.length; F++)
            F > 0 && (this.formatted += " "), this.formatted += z[F].toString().trim();
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
    parseRange(j) {
      const F = ((this.options.includePrerelease && h) | (this.options.loose && p)) + ":" + j, B = s.get(F);
      if (B)
        return B;
      const K = this.options.loose, q = K ? d[u.HYPHENRANGELOOSE] : d[u.HYPHENRANGE];
      j = j.replace(q, V(this.options.includePrerelease)), o("hyphen replace", j), j = j.replace(d[u.COMPARATORTRIM], n), o("comparator trim", j), j = j.replace(d[u.TILDETRIM], i), o("tilde trim", j), j = j.replace(d[u.CARETTRIM], a), o("caret trim", j);
      let A = j.split(" ").map((R) => v(R, this.options)).join(" ").split(/\s+/).map((R) => T(R, this.options));
      K && (A = A.filter((R) => (o("loose invalid filter", R, this.options), !!R.match(d[u.COMPARATORLOOSE])))), o("range list", A);
      const L = /* @__PURE__ */ new Map(), I = A.map((R) => new c(R, this.options));
      for (const R of I) {
        if (g(R))
          return [R];
        L.set(R.value, R);
      }
      L.size > 1 && L.has("") && L.delete("");
      const _ = [...L.values()];
      return s.set(F, _), _;
    }
    intersects(j, z) {
      if (!(j instanceof e))
        throw new TypeError("a Range is required");
      return this.set.some((F) => y(F, z) && j.set.some((B) => y(B, z) && F.every((K) => B.every((q) => K.intersects(q, z)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(j) {
      if (!j)
        return !1;
      if (typeof j == "string")
        try {
          j = new f(j, this.options);
        } catch {
          return !1;
        }
      for (let z = 0; z < this.set.length; z++)
        if (x(this.set[z], j, this.options))
          return !0;
      return !1;
    }
  }
  _s = e;
  const r = im(), s = new r(), l = Bi(), c = $n(), o = yn(), f = we(), {
    safeRe: d,
    t: u,
    comparatorTrimReplace: n,
    tildeTrimReplace: i,
    caretTrimReplace: a
  } = Ft(), { FLAG_INCLUDE_PRERELEASE: h, FLAG_LOOSE: p } = gn(), g = (C) => C.value === "<0.0.0-0", m = (C) => C.value === "", y = (C, j) => {
    let z = !0;
    const F = C.slice();
    let B = F.pop();
    for (; z && F.length; )
      z = F.every((K) => B.intersects(K, j)), B = F.pop();
    return z;
  }, v = (C, j) => (o("comp", C, j), C = S(C, j), o("caret", C), C = b(C, j), o("tildes", C), C = N(C, j), o("xrange", C), C = M(C, j), o("stars", C), C), w = (C) => !C || C.toLowerCase() === "x" || C === "*", b = (C, j) => C.trim().split(/\s+/).map((z) => $(z, j)).join(" "), $ = (C, j) => {
    const z = j.loose ? d[u.TILDELOOSE] : d[u.TILDE];
    return C.replace(z, (F, B, K, q, A) => {
      o("tilde", C, F, B, K, q, A);
      let L;
      return w(B) ? L = "" : w(K) ? L = `>=${B}.0.0 <${+B + 1}.0.0-0` : w(q) ? L = `>=${B}.${K}.0 <${B}.${+K + 1}.0-0` : A ? (o("replaceTilde pr", A), L = `>=${B}.${K}.${q}-${A} <${B}.${+K + 1}.0-0`) : L = `>=${B}.${K}.${q} <${B}.${+K + 1}.0-0`, o("tilde return", L), L;
    });
  }, S = (C, j) => C.trim().split(/\s+/).map((z) => E(z, j)).join(" "), E = (C, j) => {
    o("caret", C, j);
    const z = j.loose ? d[u.CARETLOOSE] : d[u.CARET], F = j.includePrerelease ? "-0" : "";
    return C.replace(z, (B, K, q, A, L) => {
      o("caret", C, B, K, q, A, L);
      let I;
      return w(K) ? I = "" : w(q) ? I = `>=${K}.0.0${F} <${+K + 1}.0.0-0` : w(A) ? K === "0" ? I = `>=${K}.${q}.0${F} <${K}.${+q + 1}.0-0` : I = `>=${K}.${q}.0${F} <${+K + 1}.0.0-0` : L ? (o("replaceCaret pr", L), K === "0" ? q === "0" ? I = `>=${K}.${q}.${A}-${L} <${K}.${q}.${+A + 1}-0` : I = `>=${K}.${q}.${A}-${L} <${K}.${+q + 1}.0-0` : I = `>=${K}.${q}.${A}-${L} <${+K + 1}.0.0-0`) : (o("no pr"), K === "0" ? q === "0" ? I = `>=${K}.${q}.${A}${F} <${K}.${q}.${+A + 1}-0` : I = `>=${K}.${q}.${A}${F} <${K}.${+q + 1}.0-0` : I = `>=${K}.${q}.${A} <${+K + 1}.0.0-0`), o("caret return", I), I;
    });
  }, N = (C, j) => (o("replaceXRanges", C, j), C.split(/\s+/).map((z) => O(z, j)).join(" ")), O = (C, j) => {
    C = C.trim();
    const z = j.loose ? d[u.XRANGELOOSE] : d[u.XRANGE];
    return C.replace(z, (F, B, K, q, A, L) => {
      o("xRange", C, F, B, K, q, A, L);
      const I = w(K), _ = I || w(q), R = _ || w(A), D = R;
      return B === "=" && D && (B = ""), L = j.includePrerelease ? "-0" : "", I ? B === ">" || B === "<" ? F = "<0.0.0-0" : F = "*" : B && D ? (_ && (q = 0), A = 0, B === ">" ? (B = ">=", _ ? (K = +K + 1, q = 0, A = 0) : (q = +q + 1, A = 0)) : B === "<=" && (B = "<", _ ? K = +K + 1 : q = +q + 1), B === "<" && (L = "-0"), F = `${B + K}.${q}.${A}${L}`) : _ ? F = `>=${K}.0.0${L} <${+K + 1}.0.0-0` : R && (F = `>=${K}.${q}.0${L} <${K}.${+q + 1}.0-0`), o("xRange return", F), F;
    });
  }, M = (C, j) => (o("replaceStars", C, j), C.trim().replace(d[u.STAR], "")), T = (C, j) => (o("replaceGTE0", C, j), C.trim().replace(d[j.includePrerelease ? u.GTE0PRE : u.GTE0], "")), V = (C) => (j, z, F, B, K, q, A, L, I, _, R, D) => (w(F) ? z = "" : w(B) ? z = `>=${F}.0.0${C ? "-0" : ""}` : w(K) ? z = `>=${F}.${B}.0${C ? "-0" : ""}` : q ? z = `>=${z}` : z = `>=${z}${C ? "-0" : ""}`, w(I) ? L = "" : w(_) ? L = `<${+I + 1}.0.0-0` : w(R) ? L = `<${I}.${+_ + 1}.0-0` : D ? L = `<=${I}.${_}.${R}-${D}` : C ? L = `<${I}.${_}.${+R + 1}-0` : L = `<=${L}`, `${z} ${L}`.trim()), x = (C, j, z) => {
    for (let F = 0; F < C.length; F++)
      if (!C[F].test(j))
        return !1;
    if (j.prerelease.length && !z.includePrerelease) {
      for (let F = 0; F < C.length; F++)
        if (o(C[F].semver), C[F].semver !== c.ANY && C[F].semver.prerelease.length > 0) {
          const B = C[F].semver;
          if (B.major === j.major && B.minor === j.minor && B.patch === j.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return _s;
}
var Ns, Sc;
function $n() {
  if (Sc) return Ns;
  Sc = 1;
  const t = Symbol("SemVer ANY");
  class e {
    static get ANY() {
      return t;
    }
    constructor(n, i) {
      if (i = r(i), n instanceof e) {
        if (n.loose === !!i.loose)
          return n;
        n = n.value;
      }
      n = n.trim().split(/\s+/).join(" "), o("comparator", n, i), this.options = i, this.loose = !!i.loose, this.parse(n), this.semver === t ? this.value = "" : this.value = this.operator + this.semver.version, o("comp", this);
    }
    parse(n) {
      const i = this.options.loose ? s[l.COMPARATORLOOSE] : s[l.COMPARATOR], a = n.match(i);
      if (!a)
        throw new TypeError(`Invalid comparator: ${n}`);
      this.operator = a[1] !== void 0 ? a[1] : "", this.operator === "=" && (this.operator = ""), a[2] ? this.semver = new f(a[2], this.options.loose) : this.semver = t;
    }
    toString() {
      return this.value;
    }
    test(n) {
      if (o("Comparator.test", n, this.options.loose), this.semver === t || n === t)
        return !0;
      if (typeof n == "string")
        try {
          n = new f(n, this.options);
        } catch {
          return !1;
        }
      return c(n, this.operator, this.semver, this.options);
    }
    intersects(n, i) {
      if (!(n instanceof e))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new d(n.value, i).test(this.value) : n.operator === "" ? n.value === "" ? !0 : new d(this.value, i).test(n.semver) : (i = r(i), i.includePrerelease && (this.value === "<0.0.0-0" || n.value === "<0.0.0-0") || !i.includePrerelease && (this.value.startsWith("<0.0.0") || n.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && n.operator.startsWith(">") || this.operator.startsWith("<") && n.operator.startsWith("<") || this.semver.version === n.semver.version && this.operator.includes("=") && n.operator.includes("=") || c(this.semver, "<", n.semver, i) && this.operator.startsWith(">") && n.operator.startsWith("<") || c(this.semver, ">", n.semver, i) && this.operator.startsWith("<") && n.operator.startsWith(">")));
    }
  }
  Ns = e;
  const r = Bi(), { safeRe: s, t: l } = Ft(), c = Gu(), o = yn(), f = we(), d = ke();
  return Ns;
}
var Rs, Ec;
function wn() {
  if (Ec) return Rs;
  Ec = 1;
  const t = ke();
  return Rs = (r, s, l) => {
    try {
      s = new t(s, l);
    } catch {
      return !1;
    }
    return s.test(r);
  }, Rs;
}
var As, _c;
function am() {
  if (_c) return As;
  _c = 1;
  const t = ke();
  return As = (r, s) => new t(r, s).set.map((l) => l.map((c) => c.value).join(" ").trim().split(" ")), As;
}
var Os, Nc;
function om() {
  if (Nc) return Os;
  Nc = 1;
  const t = we(), e = ke();
  return Os = (s, l, c) => {
    let o = null, f = null, d = null;
    try {
      d = new e(l, c);
    } catch {
      return null;
    }
    return s.forEach((u) => {
      d.test(u) && (!o || f.compare(u) === -1) && (o = u, f = new t(o, c));
    }), o;
  }, Os;
}
var Is, Rc;
function cm() {
  if (Rc) return Is;
  Rc = 1;
  const t = we(), e = ke();
  return Is = (s, l, c) => {
    let o = null, f = null, d = null;
    try {
      d = new e(l, c);
    } catch {
      return null;
    }
    return s.forEach((u) => {
      d.test(u) && (!o || f.compare(u) === 1) && (o = u, f = new t(o, c));
    }), o;
  }, Is;
}
var Ps, Ac;
function lm() {
  if (Ac) return Ps;
  Ac = 1;
  const t = we(), e = ke(), r = vn();
  return Ps = (l, c) => {
    l = new e(l, c);
    let o = new t("0.0.0");
    if (l.test(o) || (o = new t("0.0.0-0"), l.test(o)))
      return o;
    o = null;
    for (let f = 0; f < l.set.length; ++f) {
      const d = l.set[f];
      let u = null;
      d.forEach((n) => {
        const i = new t(n.semver.version);
        switch (n.operator) {
          case ">":
            i.prerelease.length === 0 ? i.patch++ : i.prerelease.push(0), i.raw = i.format();
          /* fallthrough */
          case "":
          case ">=":
            (!u || r(i, u)) && (u = i);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${n.operator}`);
        }
      }), u && (!o || r(o, u)) && (o = u);
    }
    return o && l.test(o) ? o : null;
  }, Ps;
}
var Ts, Oc;
function um() {
  if (Oc) return Ts;
  Oc = 1;
  const t = ke();
  return Ts = (r, s) => {
    try {
      return new t(r, s).range || "*";
    } catch {
      return null;
    }
  }, Ts;
}
var ks, Ic;
function Yi() {
  if (Ic) return ks;
  Ic = 1;
  const t = we(), e = $n(), { ANY: r } = e, s = ke(), l = wn(), c = vn(), o = xi(), f = Gi(), d = zi();
  return ks = (n, i, a, h) => {
    n = new t(n, h), i = new s(i, h);
    let p, g, m, y, v;
    switch (a) {
      case ">":
        p = c, g = f, m = o, y = ">", v = ">=";
        break;
      case "<":
        p = o, g = d, m = c, y = "<", v = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (l(n, i, h))
      return !1;
    for (let w = 0; w < i.set.length; ++w) {
      const b = i.set[w];
      let $ = null, S = null;
      if (b.forEach((E) => {
        E.semver === r && (E = new e(">=0.0.0")), $ = $ || E, S = S || E, p(E.semver, $.semver, h) ? $ = E : m(E.semver, S.semver, h) && (S = E);
      }), $.operator === y || $.operator === v || (!S.operator || S.operator === y) && g(n, S.semver))
        return !1;
      if (S.operator === v && m(n, S.semver))
        return !1;
    }
    return !0;
  }, ks;
}
var Cs, Pc;
function fm() {
  if (Pc) return Cs;
  Pc = 1;
  const t = Yi();
  return Cs = (r, s, l) => t(r, s, ">", l), Cs;
}
var Ls, Tc;
function dm() {
  if (Tc) return Ls;
  Tc = 1;
  const t = Yi();
  return Ls = (r, s, l) => t(r, s, "<", l), Ls;
}
var qs, kc;
function hm() {
  if (kc) return qs;
  kc = 1;
  const t = ke();
  return qs = (r, s, l) => (r = new t(r, l), s = new t(s, l), r.intersects(s, l)), qs;
}
var Ms, Cc;
function pm() {
  if (Cc) return Ms;
  Cc = 1;
  const t = wn(), e = Te();
  return Ms = (r, s, l) => {
    const c = [];
    let o = null, f = null;
    const d = r.sort((a, h) => e(a, h, l));
    for (const a of d)
      t(a, s, l) ? (f = a, o || (o = a)) : (f && c.push([o, f]), f = null, o = null);
    o && c.push([o, null]);
    const u = [];
    for (const [a, h] of c)
      a === h ? u.push(a) : !h && a === d[0] ? u.push("*") : h ? a === d[0] ? u.push(`<=${h}`) : u.push(`${a} - ${h}`) : u.push(`>=${a}`);
    const n = u.join(" || "), i = typeof s.raw == "string" ? s.raw : String(s);
    return n.length < i.length ? n : s;
  }, Ms;
}
var Ds, Lc;
function mm() {
  if (Lc) return Ds;
  Lc = 1;
  const t = ke(), e = $n(), { ANY: r } = e, s = wn(), l = Te(), c = (i, a, h = {}) => {
    if (i === a)
      return !0;
    i = new t(i, h), a = new t(a, h);
    let p = !1;
    e: for (const g of i.set) {
      for (const m of a.set) {
        const y = d(g, m, h);
        if (p = p || y !== null, y)
          continue e;
      }
      if (p)
        return !1;
    }
    return !0;
  }, o = [new e(">=0.0.0-0")], f = [new e(">=0.0.0")], d = (i, a, h) => {
    if (i === a)
      return !0;
    if (i.length === 1 && i[0].semver === r) {
      if (a.length === 1 && a[0].semver === r)
        return !0;
      h.includePrerelease ? i = o : i = f;
    }
    if (a.length === 1 && a[0].semver === r) {
      if (h.includePrerelease)
        return !0;
      a = f;
    }
    const p = /* @__PURE__ */ new Set();
    let g, m;
    for (const N of i)
      N.operator === ">" || N.operator === ">=" ? g = u(g, N, h) : N.operator === "<" || N.operator === "<=" ? m = n(m, N, h) : p.add(N.semver);
    if (p.size > 1)
      return null;
    let y;
    if (g && m) {
      if (y = l(g.semver, m.semver, h), y > 0)
        return null;
      if (y === 0 && (g.operator !== ">=" || m.operator !== "<="))
        return null;
    }
    for (const N of p) {
      if (g && !s(N, String(g), h) || m && !s(N, String(m), h))
        return null;
      for (const O of a)
        if (!s(N, String(O), h))
          return !1;
      return !0;
    }
    let v, w, b, $, S = m && !h.includePrerelease && m.semver.prerelease.length ? m.semver : !1, E = g && !h.includePrerelease && g.semver.prerelease.length ? g.semver : !1;
    S && S.prerelease.length === 1 && m.operator === "<" && S.prerelease[0] === 0 && (S = !1);
    for (const N of a) {
      if ($ = $ || N.operator === ">" || N.operator === ">=", b = b || N.operator === "<" || N.operator === "<=", g) {
        if (E && N.semver.prerelease && N.semver.prerelease.length && N.semver.major === E.major && N.semver.minor === E.minor && N.semver.patch === E.patch && (E = !1), N.operator === ">" || N.operator === ">=") {
          if (v = u(g, N, h), v === N && v !== g)
            return !1;
        } else if (g.operator === ">=" && !s(g.semver, String(N), h))
          return !1;
      }
      if (m) {
        if (S && N.semver.prerelease && N.semver.prerelease.length && N.semver.major === S.major && N.semver.minor === S.minor && N.semver.patch === S.patch && (S = !1), N.operator === "<" || N.operator === "<=") {
          if (w = n(m, N, h), w === N && w !== m)
            return !1;
        } else if (m.operator === "<=" && !s(m.semver, String(N), h))
          return !1;
      }
      if (!N.operator && (m || g) && y !== 0)
        return !1;
    }
    return !(g && b && !m && y !== 0 || m && $ && !g && y !== 0 || E || S);
  }, u = (i, a, h) => {
    if (!i)
      return a;
    const p = l(i.semver, a.semver, h);
    return p > 0 ? i : p < 0 || a.operator === ">" && i.operator === ">=" ? a : i;
  }, n = (i, a, h) => {
    if (!i)
      return a;
    const p = l(i.semver, a.semver, h);
    return p < 0 ? i : p > 0 || a.operator === "<" && i.operator === "<=" ? a : i;
  };
  return Ds = c, Ds;
}
var js, qc;
function gm() {
  if (qc) return js;
  qc = 1;
  const t = Ft(), e = gn(), r = we(), s = Ku(), l = vt(), c = Gp(), o = Yp(), f = Hp(), d = Jp(), u = Xp(), n = Wp(), i = Qp(), a = Zp(), h = Te(), p = em(), g = tm(), m = Ki(), y = rm(), v = nm(), w = vn(), b = xi(), $ = xu(), S = zu(), E = zi(), N = Gi(), O = Gu(), M = sm(), T = $n(), V = ke(), x = wn(), C = am(), j = om(), z = cm(), F = lm(), B = um(), K = Yi(), q = fm(), A = dm(), L = hm(), I = pm(), _ = mm();
  return js = {
    parse: l,
    valid: c,
    clean: o,
    inc: f,
    diff: d,
    major: u,
    minor: n,
    patch: i,
    prerelease: a,
    compare: h,
    rcompare: p,
    compareLoose: g,
    compareBuild: m,
    sort: y,
    rsort: v,
    gt: w,
    lt: b,
    eq: $,
    neq: S,
    gte: E,
    lte: N,
    cmp: O,
    coerce: M,
    Comparator: T,
    Range: V,
    satisfies: x,
    toComparators: C,
    maxSatisfying: j,
    minSatisfying: z,
    minVersion: F,
    validRange: B,
    outside: K,
    gtr: q,
    ltr: A,
    intersects: L,
    simplifyRange: I,
    subset: _,
    SemVer: r,
    re: t.re,
    src: t.src,
    tokens: t.t,
    SEMVER_SPEC_VERSION: e.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: e.RELEASE_TYPES,
    compareIdentifiers: s.compareIdentifiers,
    rcompareIdentifiers: s.rcompareIdentifiers
  }, js;
}
var ym = gm();
const ot = /* @__PURE__ */ fn(ym), vm = Object.prototype.toString, $m = "[object Uint8Array]", wm = "[object ArrayBuffer]";
function Yu(t, e, r) {
  return t ? t.constructor === e ? !0 : vm.call(t) === r : !1;
}
function Hu(t) {
  return Yu(t, Uint8Array, $m);
}
function bm(t) {
  return Yu(t, ArrayBuffer, wm);
}
function Sm(t) {
  return Hu(t) || bm(t);
}
function Em(t) {
  if (!Hu(t))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof t}\``);
}
function _m(t) {
  if (!Sm(t))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof t}\``);
}
function Mc(t, e) {
  if (t.length === 0)
    return new Uint8Array(0);
  e ??= t.reduce((l, c) => l + c.length, 0);
  const r = new Uint8Array(e);
  let s = 0;
  for (const l of t)
    Em(l), r.set(l, s), s += l.length;
  return r;
}
const Dc = {
  utf8: new globalThis.TextDecoder("utf8")
};
function jc(t, e = "utf8") {
  return _m(t), Dc[e] ??= new globalThis.TextDecoder(e), Dc[e].decode(t);
}
function Nm(t) {
  if (typeof t != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof t}\``);
}
const Rm = new globalThis.TextEncoder();
function Fs(t) {
  return Nm(t), Rm.encode(t);
}
Array.from({ length: 256 }, (t, e) => e.toString(16).padStart(2, "0"));
const Am = Bu.default, Fc = "aes-256-cbc", ct = () => /* @__PURE__ */ Object.create(null), Om = (t) => t != null, Im = (t, e) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), s = typeof e;
  if (r.has(s))
    throw new TypeError(`Setting a value of type \`${s}\` for key \`${t}\` is not allowed as it's not supported by JSON`);
}, rn = "__internal__", Vs = `${rn}.migrations.version`;
class Pm {
  path;
  events;
  #n;
  #t;
  #e;
  #r = {};
  constructor(e = {}) {
    const r = {
      configName: "config",
      fileExtension: "json",
      projectSuffix: "nodejs",
      clearInvalidConfig: !1,
      accessPropertiesByDotNotation: !0,
      configFileMode: 438,
      ...e
    };
    if (!r.cwd) {
      if (!r.projectName)
        throw new Error("Please specify the `projectName` option.");
      r.cwd = Yf(r.projectName, { suffix: r.projectSuffix }).config;
    }
    if (this.#e = r, r.schema ?? r.ajvOptions ?? r.rootSchema) {
      if (r.schema && typeof r.schema != "object")
        throw new TypeError("The `schema` option must be an object.");
      const o = new Np.Ajv2020({
        allErrors: !0,
        useDefaults: !0,
        ...r.ajvOptions
      });
      Am(o);
      const f = {
        ...r.rootSchema,
        type: "object",
        properties: r.schema
      };
      this.#n = o.compile(f);
      for (const [d, u] of Object.entries(r.schema ?? {}))
        u?.default && (this.#r[d] = u.default);
    }
    r.defaults && (this.#r = {
      ...this.#r,
      ...r.defaults
    }), r.serialize && (this._serialize = r.serialize), r.deserialize && (this._deserialize = r.deserialize), this.events = new EventTarget(), this.#t = r.encryptionKey;
    const s = r.fileExtension ? `.${r.fileExtension}` : "";
    this.path = ae.resolve(r.cwd, `${r.configName ?? "config"}${s}`);
    const l = this.store, c = Object.assign(ct(), r.defaults, l);
    if (r.migrations) {
      if (!r.projectVersion)
        throw new Error("Please specify the `projectVersion` option.");
      this._migrate(r.migrations, r.projectVersion, r.beforeEachMigration);
    }
    this._validate(c);
    try {
      Lf.deepEqual(l, c);
    } catch {
      this.store = c;
    }
    r.watch && this._watch();
  }
  get(e, r) {
    if (this.#e.accessPropertiesByDotNotation)
      return this._get(e, r);
    const { store: s } = this;
    return e in s ? s[e] : r;
  }
  set(e, r) {
    if (typeof e != "string" && typeof e != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof e}`);
    if (typeof e != "object" && r === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(e))
      throw new TypeError(`Please don't use the ${rn} key, as it's used to manage this module internal operations.`);
    const { store: s } = this, l = (c, o) => {
      Im(c, o), this.#e.accessPropertiesByDotNotation ? ca(s, c, o) : s[c] = o;
    };
    if (typeof e == "object") {
      const c = e;
      for (const [o, f] of Object.entries(c))
        l(o, f);
    } else
      l(e, r);
    this.store = s;
  }
  has(e) {
    return this.#e.accessPropertiesByDotNotation ? Kf(this.store, e) : e in this.store;
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...e) {
    for (const r of e)
      Om(this.#r[r]) && this.set(r, this.#r[r]);
  }
  delete(e) {
    const { store: r } = this;
    this.#e.accessPropertiesByDotNotation ? Bf(r, e) : delete r[e], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    this.store = ct();
    for (const e of Object.keys(this.#r))
      this.reset(e);
  }
  onDidChange(e, r) {
    if (typeof e != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof e}`);
    if (typeof r != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof r}`);
    return this._handleChange(() => this.get(e), r);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(e) {
    if (typeof e != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof e}`);
    return this._handleChange(() => this.store, e);
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
      const e = W.readFileSync(this.path, this.#t ? null : "utf8"), r = this._encryptData(e), s = this._deserialize(r);
      return this._validate(s), Object.assign(ct(), s);
    } catch (e) {
      if (e?.code === "ENOENT")
        return this._ensureDirectory(), ct();
      if (this.#e.clearInvalidConfig && e.name === "SyntaxError")
        return ct();
      throw e;
    }
  }
  set store(e) {
    this._ensureDirectory(), this._validate(e), this._write(e), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [e, r] of Object.entries(this.store))
      yield [e, r];
  }
  _encryptData(e) {
    if (!this.#t)
      return typeof e == "string" ? e : jc(e);
    try {
      const r = e.slice(0, 16), s = wt.pbkdf2Sync(this.#t, r.toString(), 1e4, 32, "sha512"), l = wt.createDecipheriv(Fc, s, r), c = e.slice(17), o = typeof c == "string" ? Fs(c) : c;
      return jc(Mc([l.update(o), l.final()]));
    } catch {
    }
    return e.toString();
  }
  _handleChange(e, r) {
    let s = e();
    const l = () => {
      const c = s, o = e();
      kf(o, c) || (s = o, r.call(this, o, c));
    };
    return this.events.addEventListener("change", l), () => {
      this.events.removeEventListener("change", l);
    };
  }
  _deserialize = (e) => JSON.parse(e);
  _serialize = (e) => JSON.stringify(e, void 0, "	");
  _validate(e) {
    if (!this.#n || this.#n(e) || !this.#n.errors)
      return;
    const s = this.#n.errors.map(({ instancePath: l, message: c = "" }) => `\`${l.slice(1)}\` ${c}`);
    throw new Error("Config schema violation: " + s.join("; "));
  }
  _ensureDirectory() {
    W.mkdirSync(ae.dirname(this.path), { recursive: !0 });
  }
  _write(e) {
    let r = this._serialize(e);
    if (this.#t) {
      const s = wt.randomBytes(16), l = wt.pbkdf2Sync(this.#t, s.toString(), 1e4, 32, "sha512"), c = wt.createCipheriv(Fc, l, s);
      r = Mc([s, Fs(":"), c.update(Fs(r)), c.final()]);
    }
    if (ce.env.SNAP)
      W.writeFileSync(this.path, r, { mode: this.#e.configFileMode });
    else
      try {
        _u(this.path, r, { mode: this.#e.configFileMode });
      } catch (s) {
        if (s?.code === "EXDEV") {
          W.writeFileSync(this.path, r, { mode: this.#e.configFileMode });
          return;
        }
        throw s;
      }
  }
  _watch() {
    this._ensureDirectory(), W.existsSync(this.path) || this._write(ct()), ce.platform === "win32" ? W.watch(this.path, { persistent: !1 }, xo(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 100 })) : W.watchFile(this.path, { persistent: !1 }, xo(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 5e3 }));
  }
  _migrate(e, r, s) {
    let l = this._get(Vs, "0.0.0");
    const c = Object.keys(e).filter((f) => this._shouldPerformMigration(f, l, r));
    let o = { ...this.store };
    for (const f of c)
      try {
        s && s(this, {
          fromVersion: l,
          toVersion: f,
          finalVersion: r,
          versions: c
        });
        const d = e[f];
        d?.(this), this._set(Vs, f), l = f, o = { ...this.store };
      } catch (d) {
        throw this.store = o, new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${d}`);
      }
    (this._isVersionInRangeFormat(l) || !ot.eq(l, r)) && this._set(Vs, r);
  }
  _containsReservedKey(e) {
    return typeof e == "object" && Object.keys(e)[0] === rn ? !0 : typeof e != "string" ? !1 : this.#e.accessPropertiesByDotNotation ? !!e.startsWith(`${rn}.`) : !1;
  }
  _isVersionInRangeFormat(e) {
    return ot.clean(e) === null;
  }
  _shouldPerformMigration(e, r, s) {
    return this._isVersionInRangeFormat(e) ? r !== "0.0.0" && ot.satisfies(r, e) ? !1 : ot.satisfies(s, e) : !(ot.lte(e, r) || ot.gt(e, s));
  }
  _get(e, r) {
    return Uf(this.store, e, r);
  }
  _set(e, r) {
    const { store: s } = this;
    ca(s, e, r), this.store = s;
  }
}
const { app: nn, ipcMain: ki, shell: Tm } = gu;
let Vc = !1;
const Uc = () => {
  if (!ki || !nn)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const t = {
    defaultCwd: nn.getPath("userData"),
    appVersion: nn.getVersion()
  };
  return Vc || (ki.on("electron-store-get-data", (e) => {
    e.returnValue = t;
  }), Vc = !0), t;
};
class Hi extends Pm {
  constructor(e) {
    let r, s;
    if (ce.type === "renderer") {
      const l = gu.ipcRenderer.sendSync("electron-store-get-data");
      if (!l)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: s } = l);
    } else ki && nn && ({ defaultCwd: r, appVersion: s } = Uc());
    e = {
      name: "config",
      ...e
    }, e.projectVersion ||= s, e.cwd ? e.cwd = ae.isAbsolute(e.cwd) ? e.cwd : ae.join(r, e.cwd) : e.cwd = r, e.configName = e.name, delete e.name, super(e);
  }
  static initRenderer() {
    Uc();
  }
  async openInEditor() {
    const e = await Tm.openPath(this.path);
    if (e)
      throw new Error(e);
  }
}
class km {
  db;
  eventBus;
  logger;
  migrations = [];
  constructor(e, r, s) {
    this.db = e, this.eventBus = r, this.logger = s?.logger ?? Oe("migration-runner"), this.ensureMigrationTable();
  }
  ensureMigrationTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      )
    `);
  }
  registerMigration(e) {
    if (this.migrations.find((r) => r.id === e.id))
      throw new Error(`Migration ${e.id} is already registered`);
    this.migrations.push(e), this.migrations.sort((r, s) => r.id.localeCompare(s.id));
  }
  registerMigrations(e) {
    e.forEach((r) => this.registerMigration(r));
  }
  getAppliedMigrations() {
    return this.db.prepare("SELECT * FROM schema_migrations ORDER BY id ASC").all();
  }
  getPendingMigrations() {
    const e = new Set(this.getAppliedMigrations().map((r) => r.id));
    return this.migrations.filter((r) => !e.has(r.id));
  }
  async runPendingMigrations(e = {}) {
    const r = this.getPendingMigrations();
    if (r.length === 0) {
      this.logger.info("No pending migrations");
      return;
    }
    const s = this.getAppliedMigrations().length;
    this.emitEvent({
      type: "migration.status",
      pendingCount: r.length,
      appliedCount: s
    }), this.logger.info(`Found ${r.length} pending migration(s)`);
    for (const l of r) {
      if (e.dryRun) {
        this.logger.info(`[DRY RUN] Would run migration: ${l.id} - ${l.name}`);
        continue;
      }
      try {
        await this.runMigration(l, e);
      } catch (c) {
        const o = c instanceof Error ? c.message : String(c);
        throw this.logger.error(`Migration ${l.id} failed: ${o}`), this.emitEvent({
          type: "migration.failed",
          migrationId: l.id,
          migrationName: l.name,
          error: o
        }), new Error(`Migration ${l.id} failed: ${o}`);
      }
    }
    this.logger.info("All migrations completed successfully");
  }
  async runMigration(e, r = {}) {
    this.logger.info(`Running migration: ${e.id} - ${e.name}`), this.emitEvent({
      type: "migration.started",
      migrationId: e.id,
      migrationName: e.name
    });
    const s = this.db.transaction(() => {
      e.up(this.db), this.db.prepare("INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)").run(e.id, e.name, (/* @__PURE__ */ new Date()).toISOString());
    });
    try {
      s(), r.verbose && this.logger.info(`Migration ${e.id} completed successfully`), this.emitEvent({
        type: "migration.completed",
        migrationId: e.id,
        migrationName: e.name
      });
    } catch (l) {
      throw this.logger.error(`Failed to apply migration ${e.id}: ${l}`), l;
    }
  }
  async rollbackLastMigration() {
    const e = this.getAppliedMigrations();
    if (e.length === 0) {
      this.logger.info("No migrations to rollback");
      return;
    }
    const r = e[e.length - 1], s = this.migrations.find((c) => c.id === r.id);
    if (!s)
      throw new Error(`Migration ${r.id} not found in registered migrations`);
    if (!s.down)
      throw new Error(`Migration ${r.id} does not support rollback`);
    this.logger.info(`Rolling back migration: ${s.id} - ${s.name}`);
    const l = this.db.transaction(() => {
      s.down(this.db), this.db.prepare("DELETE FROM schema_migrations WHERE id = ?").run(s.id);
    });
    try {
      l(), this.logger.info(`Rollback of ${s.id} completed successfully`);
    } catch (c) {
      throw this.logger.error(`Failed to rollback migration ${s.id}: ${c}`), c;
    }
  }
  emitEvent(e) {
    this.eventBus.emit({ type: "system.migration", payload: e });
  }
  getMigrationStatus() {
    const e = this.getAppliedMigrations(), r = this.getPendingMigrations();
    return {
      applied: e.map((s) => ({
        id: s.id,
        name: s.name,
        appliedAt: s.applied_at
      })),
      pending: r.map((s) => ({
        id: s.id,
        name: s.name
      })),
      total: this.migrations.length
    };
  }
}
const Cm = {
  id: "0001_initial_schema",
  name: "Create initial schema for rules and variables",
  up(t) {
    t.exec(`
      CREATE TABLE IF NOT EXISTS rule_definitions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        trigger_plugin_id TEXT NOT NULL,
        trigger_id TEXT NOT NULL,
        conditions TEXT,
        actions TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        priority INTEGER NOT NULL DEFAULT 0,
        tags TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `), t.exec(`
      CREATE TABLE IF NOT EXISTS variables (
        scope TEXT NOT NULL,
        owner_id TEXT,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (scope, owner_id, key)
      )
    `), t.exec(`
      CREATE INDEX IF NOT EXISTS idx_rules_trigger
      ON rule_definitions(trigger_plugin_id, trigger_id, enabled)
    `), t.exec(`
      CREATE INDEX IF NOT EXISTS idx_rules_priority
      ON rule_definitions(priority DESC, updated_at DESC)
    `), t.exec(`
      CREATE INDEX IF NOT EXISTS idx_variables_scope
      ON variables(scope, owner_id)
    `);
  },
  down(t) {
    t.exec("DROP INDEX IF EXISTS idx_variables_scope"), t.exec("DROP INDEX IF EXISTS idx_rules_priority"), t.exec("DROP INDEX IF EXISTS idx_rules_trigger"), t.exec("DROP TABLE IF EXISTS variables"), t.exec("DROP TABLE IF EXISTS rule_definitions");
  }
}, Lm = {
  id: "0002_seed_variable_defaults",
  name: "Seed default system variables",
  up(t) {
    const e = (/* @__PURE__ */ new Date()).toISOString(), r = [
      { key: "system.version", value: '"1.0.0"' },
      { key: "system.startup_count", value: "0" },
      { key: "system.last_startup", value: `"${e}"` },
      { key: "automation.enabled", value: "true" },
      { key: "automation.total_executions", value: "0" }
    ], s = t.prepare(`
      INSERT OR IGNORE INTO variables (scope, owner_id, key, value, created_at, updated_at)
      VALUES ('global', NULL, ?, ?, ?, ?)
    `);
    for (const l of r)
      s.run(l.key, l.value, e, e);
  },
  down(t) {
    t.prepare(`
      DELETE FROM variables
      WHERE scope = 'global'
        AND owner_id IS NULL
        AND key IN (
          'system.version',
          'system.startup_count',
          'system.last_startup',
          'automation.enabled',
          'automation.total_executions'
        )
    `).run();
  }
}, qm = [
  Cm,
  Lm
], Mm = "aidle.db", { app: Dm } = yt, jm = {
  theme: {
    type: "string",
    enum: ["light", "dark", "system"],
    default: "system"
  },
  telemetry: {
    type: "boolean",
    default: !0
  },
  pluginSecretsKey: {
    type: "string",
    default: ""
  }
};
class Fm extends Hi {
  constructor() {
    super({
      name: "settings",
      cwd: bn(),
      schema: jm,
      fileExtension: "json"
    });
  }
}
class Vm extends Hi {
  constructor(e) {
    super({
      name: `plugin-${e}-config`,
      cwd: bn(),
      fileExtension: "json"
    });
  }
}
class Um extends Hi {
  constructor(e, r) {
    super({
      name: `plugin-${e}-secrets`,
      cwd: bn(),
      fileExtension: "json",
      encryptionKey: r
    });
  }
}
class Bm {
  db;
  constructor(e) {
    this.db = e;
  }
  save(e) {
    const r = this.getRule(e.id), s = (/* @__PURE__ */ new Date()).toISOString(), l = r?.createdAt ?? e.createdAt ?? s, c = s;
    this.db.prepare(`
      INSERT INTO rule_definitions (
        id,
        name,
        description,
        trigger_plugin_id,
        trigger_id,
        conditions,
        actions,
        enabled,
        priority,
        tags,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @name,
        @description,
        @trigger_plugin_id,
        @trigger_id,
        @conditions,
        @actions,
        @enabled,
        @priority,
        @tags,
        @created_at,
        @updated_at
      )
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        trigger_plugin_id = excluded.trigger_plugin_id,
        trigger_id = excluded.trigger_id,
        conditions = excluded.conditions,
        actions = excluded.actions,
        enabled = excluded.enabled,
        priority = excluded.priority,
        tags = excluded.tags,
        updated_at = excluded.updated_at;
    `).run({
      ...e,
      trigger_plugin_id: e.trigger.pluginId,
      trigger_id: e.trigger.triggerId,
      conditions: e.conditions ? JSON.stringify(e.conditions) : null,
      actions: JSON.stringify(e.actions),
      enabled: e.enabled ? 1 : 0,
      priority: e.priority,
      tags: e.tags ? JSON.stringify(e.tags) : null,
      created_at: l,
      updated_at: c
    });
  }
  deleteRule(e) {
    this.db.prepare("DELETE FROM rule_definitions WHERE id = ?").run(e);
  }
  getRule(e) {
    const r = this.db.prepare("SELECT * FROM rule_definitions WHERE id = ?").get(e);
    if (r)
      return this.mapRow(r);
  }
  listRules() {
    return this.db.prepare("SELECT * FROM rule_definitions ORDER BY priority DESC, updated_at DESC").all().map((r) => this.mapRow(r));
  }
  listByTrigger(e) {
    return this.db.prepare(
      `SELECT * FROM rule_definitions
         WHERE trigger_plugin_id = @pluginId AND trigger_id = @triggerId AND enabled = 1
         ORDER BY priority DESC, updated_at DESC`
    ).all({ pluginId: e.pluginId, triggerId: e.triggerId }).map((s) => this.mapRow(s));
  }
  mapRow(e) {
    return {
      id: e.id,
      name: e.name,
      description: e.description ?? void 0,
      trigger: {
        pluginId: e.trigger_plugin_id,
        triggerId: e.trigger_id
      },
      conditions: e.conditions ? JSON.parse(e.conditions) : void 0,
      actions: JSON.parse(e.actions),
      enabled: e.enabled === 1,
      priority: e.priority,
      tags: e.tags ? JSON.parse(e.tags) : void 0,
      createdAt: e.created_at,
      updatedAt: e.updated_at
    };
  }
}
class Km {
  db;
  constructor(e) {
    this.db = e;
  }
  getSnapshot(e, r) {
    const s = this.db.prepare(
      `SELECT * FROM variables
         WHERE scope = 'global'
            OR (scope = 'plugin' AND owner_id = @pluginId)
            OR (scope = 'rule' AND owner_id = @ruleId)`
    ).all({ pluginId: r, ruleId: e }), l = {
      global: {},
      plugin: {},
      rule: {}
    };
    for (const c of s) {
      const o = l[c.scope];
      o[c.key] = this.deserializeValue(c.value);
    }
    return l;
  }
  list(e, r) {
    return this.db.prepare(
      `SELECT * FROM variables
         WHERE scope = @scope
           AND (@ownerId IS NULL OR owner_id = @ownerId)
           AND (scope != 'global' OR owner_id IS NULL)
         ORDER BY key ASC`
    ).all({ scope: e, ownerId: this.resolveOwnerId(e, r) }).map((l) => this.mapRow(l));
  }
  getValue(e) {
    const r = this.findRow(e);
    return r ? this.mapRow(r) : void 0;
  }
  setValue(e, r) {
    const s = this.resolveOwnerId(e.scope, e.ownerId), l = (/* @__PURE__ */ new Date()).toISOString(), o = this.findRow(e)?.created_at ?? l;
    this.db.prepare(
      `INSERT INTO variables (scope, owner_id, key, value, created_at, updated_at)
         VALUES (@scope, @ownerId, @key, @value, @createdAt, @updatedAt)
         ON CONFLICT(scope, owner_id, key) DO UPDATE SET
           value = excluded.value,
           created_at = excluded.created_at,
           updated_at = excluded.updated_at`
    ).run({
      scope: e.scope,
      ownerId: s,
      key: e.key,
      value: this.serializeValue(r),
      createdAt: o,
      updatedAt: l
    });
    const f = this.findRow(e);
    if (!f)
      throw new Error(`Failed to persist variable ${e.scope}:${s ?? "global"}:${e.key}`);
    return this.mapRow(f);
  }
  incrementValue(e, r = 1) {
    return this.db.transaction((l) => {
      const c = this.findRow(e), o = c ? this.deserializeValue(c.value) : 0;
      if (typeof o != "number")
        throw new Error(`Cannot increment non-numeric variable ${e.key}`);
      const f = o + l;
      return this.setValue(e, f);
    })(r);
  }
  deleteValue(e) {
    const r = this.resolveOwnerId(e.scope, e.ownerId);
    return this.db.prepare(
      `DELETE FROM variables
         WHERE scope = @scope
           AND ((@ownerId IS NULL AND owner_id IS NULL) OR owner_id = @ownerId)
           AND key = @key`
    ).run({ scope: e.scope, ownerId: r, key: e.key }).changes > 0;
  }
  findRow(e) {
    const r = this.resolveOwnerId(e.scope, e.ownerId);
    return this.db.prepare(
      `SELECT * FROM variables
         WHERE scope = @scope
           AND ((@ownerId IS NULL AND owner_id IS NULL) OR owner_id = @ownerId)
           AND key = @key`
    ).get({ scope: e.scope, ownerId: r, key: e.key });
  }
  mapRow(e) {
    return {
      scope: e.scope,
      ownerId: e.owner_id ?? void 0,
      key: e.key,
      value: this.deserializeValue(e.value),
      createdAt: e.created_at,
      updatedAt: e.updated_at
    };
  }
  resolveOwnerId(e, r) {
    if (e === "global")
      return null;
    if (!r)
      throw new Error(`Variable scope '${e}' requires an ownerId`);
    return r;
  }
  serializeValue(e) {
    return JSON.stringify(e ?? null);
  }
  deserializeValue(e) {
    try {
      return JSON.parse(e);
    } catch {
      return e;
    }
  }
}
class xm {
  settings = new Fm();
  db;
  rules;
  variables;
  migrationRunner;
  pluginConfigs = /* @__PURE__ */ new Map();
  pluginSecrets = /* @__PURE__ */ new Map();
  secretsKey;
  constructor(e) {
    this.db = zm(), this.migrationRunner = new km(this.db, e), this.migrationRunner.registerMigrations(qm), this.rules = new Bm(this.db), this.variables = new Km(this.db);
    const r = this.settings.get("pluginSecretsKey");
    if (r)
      this.secretsKey = r;
    else {
      const s = Cf(32).toString("hex");
      this.settings.set("pluginSecretsKey", s), this.secretsKey = s;
    }
  }
  async runMigrations() {
    await this.migrationRunner.runPendingMigrations();
  }
  getPluginConfig(e) {
    let r = this.pluginConfigs.get(e);
    return r || (r = new Vm(e), this.pluginConfigs.set(e, r)), r;
  }
  getPluginConfigSnapshot(e) {
    return { ...this.getPluginConfig(e).store };
  }
  setPluginConfigSnapshot(e, r) {
    const s = this.getPluginConfig(e);
    s.store = { ...r };
  }
  getPluginSecrets(e) {
    let r = this.pluginSecrets.get(e);
    return r || (r = new Um(e, this.secretsKey), this.pluginSecrets.set(e, r)), r;
  }
  getAllPluginConfigs() {
    const e = {};
    for (const [r, s] of this.pluginConfigs)
      e[r] = { ...s.store };
    return e;
  }
}
const zm = () => {
  const t = $e(bn(), Mm);
  return new Tf(t);
}, bn = () => {
  const t = $e(Dm.getPath("userData"), "data");
  return Je(t) || sn(t, { recursive: !0 }), t;
};
var Gm = Uu();
const Ym = /* @__PURE__ */ fn(Gm);
var se = {}, Us = {}, Bs = {}, ue = {}, Bc;
function re() {
  if (Bc) return ue;
  Bc = 1;
  const t = Symbol.for("yaml.alias"), e = Symbol.for("yaml.document"), r = Symbol.for("yaml.map"), s = Symbol.for("yaml.pair"), l = Symbol.for("yaml.scalar"), c = Symbol.for("yaml.seq"), o = Symbol.for("yaml.node.type"), f = (m) => !!m && typeof m == "object" && m[o] === t, d = (m) => !!m && typeof m == "object" && m[o] === e, u = (m) => !!m && typeof m == "object" && m[o] === r, n = (m) => !!m && typeof m == "object" && m[o] === s, i = (m) => !!m && typeof m == "object" && m[o] === l, a = (m) => !!m && typeof m == "object" && m[o] === c;
  function h(m) {
    if (m && typeof m == "object")
      switch (m[o]) {
        case r:
        case c:
          return !0;
      }
    return !1;
  }
  function p(m) {
    if (m && typeof m == "object")
      switch (m[o]) {
        case t:
        case r:
        case l:
        case c:
          return !0;
      }
    return !1;
  }
  const g = (m) => (i(m) || h(m)) && !!m.anchor;
  return ue.ALIAS = t, ue.DOC = e, ue.MAP = r, ue.NODE_TYPE = o, ue.PAIR = s, ue.SCALAR = l, ue.SEQ = c, ue.hasAnchor = g, ue.isAlias = f, ue.isCollection = h, ue.isDocument = d, ue.isMap = u, ue.isNode = p, ue.isPair = n, ue.isScalar = i, ue.isSeq = a, ue;
}
var xr = {}, Kc;
function Sn() {
  if (Kc) return xr;
  Kc = 1;
  var t = re();
  const e = Symbol("break visit"), r = Symbol("skip children"), s = Symbol("remove node");
  function l(i, a) {
    const h = d(a);
    t.isDocument(i) ? c(null, i.contents, h, Object.freeze([i])) === s && (i.contents = null) : c(null, i, h, Object.freeze([]));
  }
  l.BREAK = e, l.SKIP = r, l.REMOVE = s;
  function c(i, a, h, p) {
    const g = u(i, a, h, p);
    if (t.isNode(g) || t.isPair(g))
      return n(i, p, g), c(i, g, h, p);
    if (typeof g != "symbol") {
      if (t.isCollection(a)) {
        p = Object.freeze(p.concat(a));
        for (let m = 0; m < a.items.length; ++m) {
          const y = c(m, a.items[m], h, p);
          if (typeof y == "number")
            m = y - 1;
          else {
            if (y === e)
              return e;
            y === s && (a.items.splice(m, 1), m -= 1);
          }
        }
      } else if (t.isPair(a)) {
        p = Object.freeze(p.concat(a));
        const m = c("key", a.key, h, p);
        if (m === e)
          return e;
        m === s && (a.key = null);
        const y = c("value", a.value, h, p);
        if (y === e)
          return e;
        y === s && (a.value = null);
      }
    }
    return g;
  }
  async function o(i, a) {
    const h = d(a);
    t.isDocument(i) ? await f(null, i.contents, h, Object.freeze([i])) === s && (i.contents = null) : await f(null, i, h, Object.freeze([]));
  }
  o.BREAK = e, o.SKIP = r, o.REMOVE = s;
  async function f(i, a, h, p) {
    const g = await u(i, a, h, p);
    if (t.isNode(g) || t.isPair(g))
      return n(i, p, g), f(i, g, h, p);
    if (typeof g != "symbol") {
      if (t.isCollection(a)) {
        p = Object.freeze(p.concat(a));
        for (let m = 0; m < a.items.length; ++m) {
          const y = await f(m, a.items[m], h, p);
          if (typeof y == "number")
            m = y - 1;
          else {
            if (y === e)
              return e;
            y === s && (a.items.splice(m, 1), m -= 1);
          }
        }
      } else if (t.isPair(a)) {
        p = Object.freeze(p.concat(a));
        const m = await f("key", a.key, h, p);
        if (m === e)
          return e;
        m === s && (a.key = null);
        const y = await f("value", a.value, h, p);
        if (y === e)
          return e;
        y === s && (a.value = null);
      }
    }
    return g;
  }
  function d(i) {
    return typeof i == "object" && (i.Collection || i.Node || i.Value) ? Object.assign({
      Alias: i.Node,
      Map: i.Node,
      Scalar: i.Node,
      Seq: i.Node
    }, i.Value && {
      Map: i.Value,
      Scalar: i.Value,
      Seq: i.Value
    }, i.Collection && {
      Map: i.Collection,
      Seq: i.Collection
    }, i) : i;
  }
  function u(i, a, h, p) {
    if (typeof h == "function")
      return h(i, a, p);
    if (t.isMap(a))
      return h.Map?.(i, a, p);
    if (t.isSeq(a))
      return h.Seq?.(i, a, p);
    if (t.isPair(a))
      return h.Pair?.(i, a, p);
    if (t.isScalar(a))
      return h.Scalar?.(i, a, p);
    if (t.isAlias(a))
      return h.Alias?.(i, a, p);
  }
  function n(i, a, h) {
    const p = a[a.length - 1];
    if (t.isCollection(p))
      p.items[i] = h;
    else if (t.isPair(p))
      i === "key" ? p.key = h : p.value = h;
    else if (t.isDocument(p))
      p.contents = h;
    else {
      const g = t.isAlias(p) ? "alias" : "scalar";
      throw new Error(`Cannot replace node with ${g} parent`);
    }
  }
  return xr.visit = l, xr.visitAsync = o, xr;
}
var xc;
function Ju() {
  if (xc) return Bs;
  xc = 1;
  var t = re(), e = Sn();
  const r = {
    "!": "%21",
    ",": "%2C",
    "[": "%5B",
    "]": "%5D",
    "{": "%7B",
    "}": "%7D"
  }, s = (c) => c.replace(/[!,[\]{}]/g, (o) => r[o]);
  class l {
    constructor(o, f) {
      this.docStart = null, this.docEnd = !1, this.yaml = Object.assign({}, l.defaultYaml, o), this.tags = Object.assign({}, l.defaultTags, f);
    }
    clone() {
      const o = new l(this.yaml, this.tags);
      return o.docStart = this.docStart, o;
    }
    /**
     * During parsing, get a Directives instance for the current document and
     * update the stream state according to the current version's spec.
     */
    atDocument() {
      const o = new l(this.yaml, this.tags);
      switch (this.yaml.version) {
        case "1.1":
          this.atNextDocument = !0;
          break;
        case "1.2":
          this.atNextDocument = !1, this.yaml = {
            explicit: l.defaultYaml.explicit,
            version: "1.2"
          }, this.tags = Object.assign({}, l.defaultTags);
          break;
      }
      return o;
    }
    /**
     * @param onError - May be called even if the action was successful
     * @returns `true` on success
     */
    add(o, f) {
      this.atNextDocument && (this.yaml = { explicit: l.defaultYaml.explicit, version: "1.1" }, this.tags = Object.assign({}, l.defaultTags), this.atNextDocument = !1);
      const d = o.trim().split(/[ \t]+/), u = d.shift();
      switch (u) {
        case "%TAG": {
          if (d.length !== 2 && (f(0, "%TAG directive should contain exactly two parts"), d.length < 2))
            return !1;
          const [n, i] = d;
          return this.tags[n] = i, !0;
        }
        case "%YAML": {
          if (this.yaml.explicit = !0, d.length !== 1)
            return f(0, "%YAML directive should contain exactly one part"), !1;
          const [n] = d;
          if (n === "1.1" || n === "1.2")
            return this.yaml.version = n, !0;
          {
            const i = /^\d+\.\d+$/.test(n);
            return f(6, `Unsupported YAML version ${n}`, i), !1;
          }
        }
        default:
          return f(0, `Unknown directive ${u}`, !0), !1;
      }
    }
    /**
     * Resolves a tag, matching handles to those defined in %TAG directives.
     *
     * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
     *   `'!local'` tag, or `null` if unresolvable.
     */
    tagName(o, f) {
      if (o === "!")
        return "!";
      if (o[0] !== "!")
        return f(`Not a valid tag: ${o}`), null;
      if (o[1] === "<") {
        const i = o.slice(2, -1);
        return i === "!" || i === "!!" ? (f(`Verbatim tags aren't resolved, so ${o} is invalid.`), null) : (o[o.length - 1] !== ">" && f("Verbatim tags must end with a >"), i);
      }
      const [, d, u] = o.match(/^(.*!)([^!]*)$/s);
      u || f(`The ${o} tag has no suffix`);
      const n = this.tags[d];
      if (n)
        try {
          return n + decodeURIComponent(u);
        } catch (i) {
          return f(String(i)), null;
        }
      return d === "!" ? o : (f(`Could not resolve tag: ${o}`), null);
    }
    /**
     * Given a fully resolved tag, returns its printable string form,
     * taking into account current tag prefixes and defaults.
     */
    tagString(o) {
      for (const [f, d] of Object.entries(this.tags))
        if (o.startsWith(d))
          return f + s(o.substring(d.length));
      return o[0] === "!" ? o : `!<${o}>`;
    }
    toString(o) {
      const f = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [], d = Object.entries(this.tags);
      let u;
      if (o && d.length > 0 && t.isNode(o.contents)) {
        const n = {};
        e.visit(o.contents, (i, a) => {
          t.isNode(a) && a.tag && (n[a.tag] = !0);
        }), u = Object.keys(n);
      } else
        u = [];
      for (const [n, i] of d)
        n === "!!" && i === "tag:yaml.org,2002:" || (!o || u.some((a) => a.startsWith(i))) && f.push(`%TAG ${n} ${i}`);
      return f.join(`
`);
    }
  }
  return l.defaultYaml = { explicit: !1, version: "1.2" }, l.defaultTags = { "!!": "tag:yaml.org,2002:" }, Bs.Directives = l, Bs;
}
var Ks = {}, xs = {}, lt = {}, zc;
function Ji() {
  if (zc) return lt;
  zc = 1;
  var t = re(), e = Sn();
  function r(o) {
    if (/[\x00-\x19\s,[\]{}]/.test(o)) {
      const d = `Anchor must not contain whitespace or control characters: ${JSON.stringify(o)}`;
      throw new Error(d);
    }
    return !0;
  }
  function s(o) {
    const f = /* @__PURE__ */ new Set();
    return e.visit(o, {
      Value(d, u) {
        u.anchor && f.add(u.anchor);
      }
    }), f;
  }
  function l(o, f) {
    for (let d = 1; ; ++d) {
      const u = `${o}${d}`;
      if (!f.has(u))
        return u;
    }
  }
  function c(o, f) {
    const d = [], u = /* @__PURE__ */ new Map();
    let n = null;
    return {
      onAnchor: (i) => {
        d.push(i), n ?? (n = s(o));
        const a = l(f, n);
        return n.add(a), a;
      },
      /**
       * With circular references, the source node is only resolved after all
       * of its child nodes are. This is why anchors are set only after all of
       * the nodes have been created.
       */
      setAnchors: () => {
        for (const i of d) {
          const a = u.get(i);
          if (typeof a == "object" && a.anchor && (t.isScalar(a.node) || t.isCollection(a.node)))
            a.node.anchor = a.anchor;
          else {
            const h = new Error("Failed to resolve repeated object (this should not happen)");
            throw h.source = i, h;
          }
        }
      },
      sourceObjects: u
    };
  }
  return lt.anchorIsValid = r, lt.anchorNames = s, lt.createNodeAnchors = c, lt.findNewAnchor = l, lt;
}
var zs = {}, Gs = {}, Gc;
function Xu() {
  if (Gc) return Gs;
  Gc = 1;
  function t(e, r, s, l) {
    if (l && typeof l == "object")
      if (Array.isArray(l))
        for (let c = 0, o = l.length; c < o; ++c) {
          const f = l[c], d = t(e, l, String(c), f);
          d === void 0 ? delete l[c] : d !== f && (l[c] = d);
        }
      else if (l instanceof Map)
        for (const c of Array.from(l.keys())) {
          const o = l.get(c), f = t(e, l, c, o);
          f === void 0 ? l.delete(c) : f !== o && l.set(c, f);
        }
      else if (l instanceof Set)
        for (const c of Array.from(l)) {
          const o = t(e, l, c, c);
          o === void 0 ? l.delete(c) : o !== c && (l.delete(c), l.add(o));
        }
      else
        for (const [c, o] of Object.entries(l)) {
          const f = t(e, l, c, o);
          f === void 0 ? delete l[c] : f !== o && (l[c] = f);
        }
    return e.call(r, s, l);
  }
  return Gs.applyReviver = t, Gs;
}
var Ys = {}, Yc;
function Qe() {
  if (Yc) return Ys;
  Yc = 1;
  var t = re();
  function e(r, s, l) {
    if (Array.isArray(r))
      return r.map((c, o) => e(c, String(o), l));
    if (r && typeof r.toJSON == "function") {
      if (!l || !t.hasAnchor(r))
        return r.toJSON(s, l);
      const c = { aliasCount: 0, count: 1, res: void 0 };
      l.anchors.set(r, c), l.onCreate = (f) => {
        c.res = f, delete l.onCreate;
      };
      const o = r.toJSON(s, l);
      return l.onCreate && l.onCreate(o), o;
    }
    return typeof r == "bigint" && !l?.keep ? Number(r) : r;
  }
  return Ys.toJS = e, Ys;
}
var Hc;
function Xi() {
  if (Hc) return zs;
  Hc = 1;
  var t = Xu(), e = re(), r = Qe();
  class s {
    constructor(c) {
      Object.defineProperty(this, e.NODE_TYPE, { value: c });
    }
    /** Create a copy of this node.  */
    clone() {
      const c = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
      return this.range && (c.range = this.range.slice()), c;
    }
    /** A plain JavaScript representation of this node. */
    toJS(c, { mapAsMap: o, maxAliasCount: f, onAnchor: d, reviver: u } = {}) {
      if (!e.isDocument(c))
        throw new TypeError("A document argument is required");
      const n = {
        anchors: /* @__PURE__ */ new Map(),
        doc: c,
        keep: !0,
        mapAsMap: o === !0,
        mapKeyWarned: !1,
        maxAliasCount: typeof f == "number" ? f : 100
      }, i = r.toJS(this, "", n);
      if (typeof d == "function")
        for (const { count: a, res: h } of n.anchors.values())
          d(h, a);
      return typeof u == "function" ? t.applyReviver(u, { "": i }, "", i) : i;
    }
  }
  return zs.NodeBase = s, zs;
}
var Jc;
function En() {
  if (Jc) return xs;
  Jc = 1;
  var t = Ji(), e = Sn(), r = re(), s = Xi(), l = Qe();
  let c = class extends s.NodeBase {
    constructor(d) {
      super(r.ALIAS), this.source = d, Object.defineProperty(this, "tag", {
        set() {
          throw new Error("Alias nodes cannot have tags");
        }
      });
    }
    /**
     * Resolve the value of this alias within `doc`, finding the last
     * instance of the `source` anchor before this node.
     */
    resolve(d, u) {
      let n;
      u?.aliasResolveCache ? n = u.aliasResolveCache : (n = [], e.visit(d, {
        Node: (a, h) => {
          (r.isAlias(h) || r.hasAnchor(h)) && n.push(h);
        }
      }), u && (u.aliasResolveCache = n));
      let i;
      for (const a of n) {
        if (a === this)
          break;
        a.anchor === this.source && (i = a);
      }
      return i;
    }
    toJSON(d, u) {
      if (!u)
        return { source: this.source };
      const { anchors: n, doc: i, maxAliasCount: a } = u, h = this.resolve(i, u);
      if (!h) {
        const g = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
        throw new ReferenceError(g);
      }
      let p = n.get(h);
      if (p || (l.toJS(h, null, u), p = n.get(h)), !p || p.res === void 0) {
        const g = "This should not happen: Alias anchor was not resolved?";
        throw new ReferenceError(g);
      }
      if (a >= 0 && (p.count += 1, p.aliasCount === 0 && (p.aliasCount = o(i, h, n)), p.count * p.aliasCount > a)) {
        const g = "Excessive alias count indicates a resource exhaustion attack";
        throw new ReferenceError(g);
      }
      return p.res;
    }
    toString(d, u, n) {
      const i = `*${this.source}`;
      if (d) {
        if (t.anchorIsValid(this.source), d.options.verifyAliasOrder && !d.anchors.has(this.source)) {
          const a = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new Error(a);
        }
        if (d.implicitKey)
          return `${i} `;
      }
      return i;
    }
  };
  function o(f, d, u) {
    if (r.isAlias(d)) {
      const n = d.resolve(f), i = u && n && u.get(n);
      return i ? i.count * i.aliasCount : 0;
    } else if (r.isCollection(d)) {
      let n = 0;
      for (const i of d.items) {
        const a = o(f, i, u);
        a > n && (n = a);
      }
      return n;
    } else if (r.isPair(d)) {
      const n = o(f, d.key, u), i = o(f, d.value, u);
      return Math.max(n, i);
    }
    return 1;
  }
  return xs.Alias = c, xs;
}
var _t = {}, Hs = {}, zr = {}, Xc;
function le() {
  if (Xc) return zr;
  Xc = 1;
  var t = re(), e = Xi(), r = Qe();
  const s = (c) => !c || typeof c != "function" && typeof c != "object";
  let l = class extends e.NodeBase {
    constructor(o) {
      super(t.SCALAR), this.value = o;
    }
    toJSON(o, f) {
      return f?.keep ? this.value : r.toJS(this.value, o, f);
    }
    toString() {
      return String(this.value);
    }
  };
  return l.BLOCK_FOLDED = "BLOCK_FOLDED", l.BLOCK_LITERAL = "BLOCK_LITERAL", l.PLAIN = "PLAIN", l.QUOTE_DOUBLE = "QUOTE_DOUBLE", l.QUOTE_SINGLE = "QUOTE_SINGLE", zr.Scalar = l, zr.isScalarValue = s, zr;
}
var Wc;
function _n() {
  if (Wc) return Hs;
  Wc = 1;
  var t = En(), e = re(), r = le();
  const s = "tag:yaml.org,2002:";
  function l(o, f, d) {
    if (f) {
      const u = d.filter((i) => i.tag === f), n = u.find((i) => !i.format) ?? u[0];
      if (!n)
        throw new Error(`Tag ${f} not found`);
      return n;
    }
    return d.find((u) => u.identify?.(o) && !u.format);
  }
  function c(o, f, d) {
    if (e.isDocument(o) && (o = o.contents), e.isNode(o))
      return o;
    if (e.isPair(o)) {
      const y = d.schema[e.MAP].createNode?.(d.schema, null, d);
      return y.items.push(o), y;
    }
    (o instanceof String || o instanceof Number || o instanceof Boolean || typeof BigInt < "u" && o instanceof BigInt) && (o = o.valueOf());
    const { aliasDuplicateObjects: u, onAnchor: n, onTagObj: i, schema: a, sourceObjects: h } = d;
    let p;
    if (u && o && typeof o == "object") {
      if (p = h.get(o), p)
        return p.anchor ?? (p.anchor = n(o)), new t.Alias(p.anchor);
      p = { anchor: null, node: null }, h.set(o, p);
    }
    f?.startsWith("!!") && (f = s + f.slice(2));
    let g = l(o, f, a.tags);
    if (!g) {
      if (o && typeof o.toJSON == "function" && (o = o.toJSON()), !o || typeof o != "object") {
        const y = new r.Scalar(o);
        return p && (p.node = y), y;
      }
      g = o instanceof Map ? a[e.MAP] : Symbol.iterator in Object(o) ? a[e.SEQ] : a[e.MAP];
    }
    i && (i(g), delete d.onTagObj);
    const m = g?.createNode ? g.createNode(d.schema, o, d) : typeof g?.nodeClass?.from == "function" ? g.nodeClass.from(d.schema, o, d) : new r.Scalar(o);
    return f ? m.tag = f : g.default || (m.tag = g.tag), p && (p.node = m), m;
  }
  return Hs.createNode = c, Hs;
}
var Qc;
function Wi() {
  if (Qc) return _t;
  Qc = 1;
  var t = _n(), e = re(), r = Xi();
  function s(o, f, d) {
    let u = d;
    for (let n = f.length - 1; n >= 0; --n) {
      const i = f[n];
      if (typeof i == "number" && Number.isInteger(i) && i >= 0) {
        const a = [];
        a[i] = u, u = a;
      } else
        u = /* @__PURE__ */ new Map([[i, u]]);
    }
    return t.createNode(u, void 0, {
      aliasDuplicateObjects: !1,
      keepUndefined: !1,
      onAnchor: () => {
        throw new Error("This should not happen, please report a bug.");
      },
      schema: o,
      sourceObjects: /* @__PURE__ */ new Map()
    });
  }
  const l = (o) => o == null || typeof o == "object" && !!o[Symbol.iterator]().next().done;
  let c = class extends r.NodeBase {
    constructor(f, d) {
      super(f), Object.defineProperty(this, "schema", {
        value: d,
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
    clone(f) {
      const d = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
      return f && (d.schema = f), d.items = d.items.map((u) => e.isNode(u) || e.isPair(u) ? u.clone(f) : u), this.range && (d.range = this.range.slice()), d;
    }
    /**
     * Adds a value to the collection. For `!!map` and `!!omap` the value must
     * be a Pair instance or a `{ key, value }` object, which may not have a key
     * that already exists in the map.
     */
    addIn(f, d) {
      if (l(f))
        this.add(d);
      else {
        const [u, ...n] = f, i = this.get(u, !0);
        if (e.isCollection(i))
          i.addIn(n, d);
        else if (i === void 0 && this.schema)
          this.set(u, s(this.schema, n, d));
        else
          throw new Error(`Expected YAML collection at ${u}. Remaining path: ${n}`);
      }
    }
    /**
     * Removes a value from the collection.
     * @returns `true` if the item was found and removed.
     */
    deleteIn(f) {
      const [d, ...u] = f;
      if (u.length === 0)
        return this.delete(d);
      const n = this.get(d, !0);
      if (e.isCollection(n))
        return n.deleteIn(u);
      throw new Error(`Expected YAML collection at ${d}. Remaining path: ${u}`);
    }
    /**
     * Returns item at `key`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    getIn(f, d) {
      const [u, ...n] = f, i = this.get(u, !0);
      return n.length === 0 ? !d && e.isScalar(i) ? i.value : i : e.isCollection(i) ? i.getIn(n, d) : void 0;
    }
    hasAllNullValues(f) {
      return this.items.every((d) => {
        if (!e.isPair(d))
          return !1;
        const u = d.value;
        return u == null || f && e.isScalar(u) && u.value == null && !u.commentBefore && !u.comment && !u.tag;
      });
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     */
    hasIn(f) {
      const [d, ...u] = f;
      if (u.length === 0)
        return this.has(d);
      const n = this.get(d, !0);
      return e.isCollection(n) ? n.hasIn(u) : !1;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    setIn(f, d) {
      const [u, ...n] = f;
      if (n.length === 0)
        this.set(u, d);
      else {
        const i = this.get(u, !0);
        if (e.isCollection(i))
          i.setIn(n, d);
        else if (i === void 0 && this.schema)
          this.set(u, s(this.schema, n, d));
        else
          throw new Error(`Expected YAML collection at ${u}. Remaining path: ${n}`);
      }
    }
  };
  return _t.Collection = c, _t.collectionFromPath = s, _t.isEmptyPath = l, _t;
}
var Gr = {}, Js = {}, Yr = {}, Nt = {}, Zc;
function Nn() {
  if (Zc) return Nt;
  Zc = 1;
  const t = (s) => s.replace(/^(?!$)(?: $)?/gm, "#");
  function e(s, l) {
    return /^\n+$/.test(s) ? s.substring(1) : l ? s.replace(/^(?! *$)/gm, l) : s;
  }
  const r = (s, l, c) => s.endsWith(`
`) ? e(c, l) : c.includes(`
`) ? `
` + e(c, l) : (s.endsWith(" ") ? "" : " ") + c;
  return Nt.indentComment = e, Nt.lineComment = r, Nt.stringifyComment = t, Nt;
}
var Xs = {}, ut = {}, el;
function Hm() {
  if (el) return ut;
  el = 1;
  const t = "flow", e = "block", r = "quoted";
  function s(c, o, f = "flow", { indentAtStart: d, lineWidth: u = 80, minContentWidth: n = 20, onFold: i, onOverflow: a } = {}) {
    if (!u || u < 0)
      return c;
    u < n && (n = 0);
    const h = Math.max(1 + n, 1 + u - o.length);
    if (c.length <= h)
      return c;
    const p = [], g = {};
    let m = u - o.length;
    typeof d == "number" && (d > u - Math.max(2, n) ? p.push(0) : m = u - d);
    let y, v, w = !1, b = -1, $ = -1, S = -1;
    f === e && (b = l(c, b, o.length), b !== -1 && (m = b + h));
    for (let N; N = c[b += 1]; ) {
      if (f === r && N === "\\") {
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
        S = b;
      }
      if (N === `
`)
        f === e && (b = l(c, b, o.length)), m = b + o.length + h, y = void 0;
      else {
        if (N === " " && v && v !== " " && v !== `
` && v !== "	") {
          const O = c[b + 1];
          O && O !== " " && O !== `
` && O !== "	" && (y = b);
        }
        if (b >= m)
          if (y)
            p.push(y), m = y + h, y = void 0;
          else if (f === r) {
            for (; v === " " || v === "	"; )
              v = N, N = c[b += 1], w = !0;
            const O = b > S + 1 ? b - 2 : $ - 1;
            if (g[O])
              return c;
            p.push(O), g[O] = !0, m = O + h, y = void 0;
          } else
            w = !0;
      }
      v = N;
    }
    if (w && a && a(), p.length === 0)
      return c;
    i && i();
    let E = c.slice(0, p[0]);
    for (let N = 0; N < p.length; ++N) {
      const O = p[N], M = p[N + 1] || c.length;
      O === 0 ? E = `
${o}${c.slice(0, M)}` : (f === r && g[O] && (E += `${c[O]}\\`), E += `
${o}${c.slice(O + 1, M)}`);
    }
    return E;
  }
  function l(c, o, f) {
    let d = o, u = o + 1, n = c[u];
    for (; n === " " || n === "	"; )
      if (o < u + f)
        n = c[++o];
      else {
        do
          n = c[++o];
        while (n && n !== `
`);
        d = o, u = o + 1, n = c[u];
      }
    return d;
  }
  return ut.FOLD_BLOCK = e, ut.FOLD_FLOW = t, ut.FOLD_QUOTED = r, ut.foldFlowLines = s, ut;
}
var tl;
function Rn() {
  if (tl) return Xs;
  tl = 1;
  var t = le(), e = Hm();
  const r = (a, h) => ({
    indentAtStart: h ? a.indent.length : a.indentAtStart,
    lineWidth: a.options.lineWidth,
    minContentWidth: a.options.minContentWidth
  }), s = (a) => /^(%|---|\.\.\.)/m.test(a);
  function l(a, h, p) {
    if (!h || h < 0)
      return !1;
    const g = h - p, m = a.length;
    if (m <= g)
      return !1;
    for (let y = 0, v = 0; y < m; ++y)
      if (a[y] === `
`) {
        if (y - v > g)
          return !0;
        if (v = y + 1, m - v <= g)
          return !1;
      }
    return !0;
  }
  function c(a, h) {
    const p = JSON.stringify(a);
    if (h.options.doubleQuotedAsJSON)
      return p;
    const { implicitKey: g } = h, m = h.options.doubleQuotedMinMultiLineLength, y = h.indent || (s(a) ? "  " : "");
    let v = "", w = 0;
    for (let b = 0, $ = p[b]; $; $ = p[++b])
      if ($ === " " && p[b + 1] === "\\" && p[b + 2] === "n" && (v += p.slice(w, b) + "\\ ", b += 1, w = b, $ = "\\"), $ === "\\")
        switch (p[b + 1]) {
          case "u":
            {
              v += p.slice(w, b);
              const S = p.substr(b + 2, 4);
              switch (S) {
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
                  S.substr(0, 2) === "00" ? v += "\\x" + S.substr(2) : v += p.substr(b, 6);
              }
              b += 5, w = b + 1;
            }
            break;
          case "n":
            if (g || p[b + 2] === '"' || p.length < m)
              b += 1;
            else {
              for (v += p.slice(w, b) + `

`; p[b + 2] === "\\" && p[b + 3] === "n" && p[b + 4] !== '"'; )
                v += `
`, b += 2;
              v += y, p[b + 2] === " " && (v += "\\"), b += 1, w = b + 1;
            }
            break;
          default:
            b += 1;
        }
    return v = w ? v + p.slice(w) : p, g ? v : e.foldFlowLines(v, y, e.FOLD_QUOTED, r(h, !1));
  }
  function o(a, h) {
    if (h.options.singleQuote === !1 || h.implicitKey && a.includes(`
`) || /[ \t]\n|\n[ \t]/.test(a))
      return c(a, h);
    const p = h.indent || (s(a) ? "  " : ""), g = "'" + a.replace(/'/g, "''").replace(/\n+/g, `$&
${p}`) + "'";
    return h.implicitKey ? g : e.foldFlowLines(g, p, e.FOLD_FLOW, r(h, !1));
  }
  function f(a, h) {
    const { singleQuote: p } = h.options;
    let g;
    if (p === !1)
      g = c;
    else {
      const m = a.includes('"'), y = a.includes("'");
      m && !y ? g = o : y && !m ? g = c : g = p ? o : c;
    }
    return g(a, h);
  }
  let d;
  try {
    d = new RegExp(`(^|(?<!
))
+(?!
|$)`, "g");
  } catch {
    d = /\n+(?!\n|$)/g;
  }
  function u({ comment: a, type: h, value: p }, g, m, y) {
    const { blockQuote: v, commentString: w, lineWidth: b } = g.options;
    if (!v || /\n[\t ]+$/.test(p))
      return f(p, g);
    const $ = g.indent || (g.forceBlockIndent || s(p) ? "  " : ""), S = v === "literal" ? !0 : v === "folded" || h === t.Scalar.BLOCK_FOLDED ? !1 : h === t.Scalar.BLOCK_LITERAL ? !0 : !l(p, b, $.length);
    if (!p)
      return S ? `|
` : `>
`;
    let E, N;
    for (N = p.length; N > 0; --N) {
      const F = p[N - 1];
      if (F !== `
` && F !== "	" && F !== " ")
        break;
    }
    let O = p.substring(N);
    const M = O.indexOf(`
`);
    M === -1 ? E = "-" : p === O || M !== O.length - 1 ? (E = "+", y && y()) : E = "", O && (p = p.slice(0, -O.length), O[O.length - 1] === `
` && (O = O.slice(0, -1)), O = O.replace(d, `$&${$}`));
    let T = !1, V, x = -1;
    for (V = 0; V < p.length; ++V) {
      const F = p[V];
      if (F === " ")
        T = !0;
      else if (F === `
`)
        x = V;
      else
        break;
    }
    let C = p.substring(0, x < V ? x + 1 : V);
    C && (p = p.substring(C.length), C = C.replace(/\n+/g, `$&${$}`));
    let z = (T ? $ ? "2" : "1" : "") + E;
    if (a && (z += " " + w(a.replace(/ ?[\r\n]+/g, " ")), m && m()), !S) {
      const F = p.replace(/\n+/g, `
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${$}`);
      let B = !1;
      const K = r(g, !0);
      v !== "folded" && h !== t.Scalar.BLOCK_FOLDED && (K.onOverflow = () => {
        B = !0;
      });
      const q = e.foldFlowLines(`${C}${F}${O}`, $, e.FOLD_BLOCK, K);
      if (!B)
        return `>${z}
${$}${q}`;
    }
    return p = p.replace(/\n+/g, `$&${$}`), `|${z}
${$}${C}${p}${O}`;
  }
  function n(a, h, p, g) {
    const { type: m, value: y } = a, { actualString: v, implicitKey: w, indent: b, indentStep: $, inFlow: S } = h;
    if (w && y.includes(`
`) || S && /[[\]{},]/.test(y))
      return f(y, h);
    if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(y))
      return w || S || !y.includes(`
`) ? f(y, h) : u(a, h, p, g);
    if (!w && !S && m !== t.Scalar.PLAIN && y.includes(`
`))
      return u(a, h, p, g);
    if (s(y)) {
      if (b === "")
        return h.forceBlockIndent = !0, u(a, h, p, g);
      if (w && b === $)
        return f(y, h);
    }
    const E = y.replace(/\n+/g, `$&
${b}`);
    if (v) {
      const N = (T) => T.default && T.tag !== "tag:yaml.org,2002:str" && T.test?.test(E), { compat: O, tags: M } = h.doc.schema;
      if (M.some(N) || O?.some(N))
        return f(y, h);
    }
    return w ? E : e.foldFlowLines(E, b, e.FOLD_FLOW, r(h, !1));
  }
  function i(a, h, p, g) {
    const { implicitKey: m, inFlow: y } = h, v = typeof a.value == "string" ? a : Object.assign({}, a, { value: String(a.value) });
    let { type: w } = a;
    w !== t.Scalar.QUOTE_DOUBLE && /[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(v.value) && (w = t.Scalar.QUOTE_DOUBLE);
    const b = (S) => {
      switch (S) {
        case t.Scalar.BLOCK_FOLDED:
        case t.Scalar.BLOCK_LITERAL:
          return m || y ? f(v.value, h) : u(v, h, p, g);
        case t.Scalar.QUOTE_DOUBLE:
          return c(v.value, h);
        case t.Scalar.QUOTE_SINGLE:
          return o(v.value, h);
        case t.Scalar.PLAIN:
          return n(v, h, p, g);
        default:
          return null;
      }
    };
    let $ = b(w);
    if ($ === null) {
      const { defaultKeyType: S, defaultStringType: E } = h.options, N = m && S || E;
      if ($ = b(N), $ === null)
        throw new Error(`Unsupported default string type ${N}`);
    }
    return $;
  }
  return Xs.stringifyString = i, Xs;
}
var rl;
function An() {
  if (rl) return Yr;
  rl = 1;
  var t = Ji(), e = re(), r = Nn(), s = Rn();
  function l(d, u) {
    const n = Object.assign({
      blockQuote: !0,
      commentString: r.stringifyComment,
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
    }, d.schema.toStringOptions, u);
    let i;
    switch (n.collectionStyle) {
      case "block":
        i = !1;
        break;
      case "flow":
        i = !0;
        break;
      default:
        i = null;
    }
    return {
      anchors: /* @__PURE__ */ new Set(),
      doc: d,
      flowCollectionPadding: n.flowCollectionPadding ? " " : "",
      indent: "",
      indentStep: typeof n.indent == "number" ? " ".repeat(n.indent) : "  ",
      inFlow: i,
      options: n
    };
  }
  function c(d, u) {
    if (u.tag) {
      const a = d.filter((h) => h.tag === u.tag);
      if (a.length > 0)
        return a.find((h) => h.format === u.format) ?? a[0];
    }
    let n, i;
    if (e.isScalar(u)) {
      i = u.value;
      let a = d.filter((h) => h.identify?.(i));
      if (a.length > 1) {
        const h = a.filter((p) => p.test);
        h.length > 0 && (a = h);
      }
      n = a.find((h) => h.format === u.format) ?? a.find((h) => !h.format);
    } else
      i = u, n = d.find((a) => a.nodeClass && i instanceof a.nodeClass);
    if (!n) {
      const a = i?.constructor?.name ?? (i === null ? "null" : typeof i);
      throw new Error(`Tag not resolved for ${a} value`);
    }
    return n;
  }
  function o(d, u, { anchors: n, doc: i }) {
    if (!i.directives)
      return "";
    const a = [], h = (e.isScalar(d) || e.isCollection(d)) && d.anchor;
    h && t.anchorIsValid(h) && (n.add(h), a.push(`&${h}`));
    const p = d.tag ?? (u.default ? null : u.tag);
    return p && a.push(i.directives.tagString(p)), a.join(" ");
  }
  function f(d, u, n, i) {
    if (e.isPair(d))
      return d.toString(u, n, i);
    if (e.isAlias(d)) {
      if (u.doc.directives)
        return d.toString(u);
      if (u.resolvedAliases?.has(d))
        throw new TypeError("Cannot stringify circular structure without alias nodes");
      u.resolvedAliases ? u.resolvedAliases.add(d) : u.resolvedAliases = /* @__PURE__ */ new Set([d]), d = d.resolve(u.doc);
    }
    let a;
    const h = e.isNode(d) ? d : u.doc.createNode(d, { onTagObj: (m) => a = m });
    a ?? (a = c(u.doc.schema.tags, h));
    const p = o(h, a, u);
    p.length > 0 && (u.indentAtStart = (u.indentAtStart ?? 0) + p.length + 1);
    const g = typeof a.stringify == "function" ? a.stringify(h, u, n, i) : e.isScalar(h) ? s.stringifyString(h, u, n, i) : h.toString(u, n, i);
    return p ? e.isScalar(h) || g[0] === "{" || g[0] === "[" ? `${p} ${g}` : `${p}
${u.indent}${g}` : g;
  }
  return Yr.createStringifyContext = l, Yr.stringify = f, Yr;
}
var nl;
function Jm() {
  if (nl) return Js;
  nl = 1;
  var t = re(), e = le(), r = An(), s = Nn();
  function l({ key: c, value: o }, f, d, u) {
    const { allNullValues: n, doc: i, indent: a, indentStep: h, options: { commentString: p, indentSeq: g, simpleKeys: m } } = f;
    let y = t.isNode(c) && c.comment || null;
    if (m) {
      if (y)
        throw new Error("With simple keys, key nodes cannot have comments");
      if (t.isCollection(c) || !t.isNode(c) && typeof c == "object") {
        const V = "With simple keys, collection cannot be used as a key value";
        throw new Error(V);
      }
    }
    let v = !m && (!c || y && o == null && !f.inFlow || t.isCollection(c) || (t.isScalar(c) ? c.type === e.Scalar.BLOCK_FOLDED || c.type === e.Scalar.BLOCK_LITERAL : typeof c == "object"));
    f = Object.assign({}, f, {
      allNullValues: !1,
      implicitKey: !v && (m || !n),
      indent: a + h
    });
    let w = !1, b = !1, $ = r.stringify(c, f, () => w = !0, () => b = !0);
    if (!v && !f.inFlow && $.length > 1024) {
      if (m)
        throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
      v = !0;
    }
    if (f.inFlow) {
      if (n || o == null)
        return w && d && d(), $ === "" ? "?" : v ? `? ${$}` : $;
    } else if (n && !m || o == null && v)
      return $ = `? ${$}`, y && !w ? $ += s.lineComment($, f.indent, p(y)) : b && u && u(), $;
    w && (y = null), v ? (y && ($ += s.lineComment($, f.indent, p(y))), $ = `? ${$}
${a}:`) : ($ = `${$}:`, y && ($ += s.lineComment($, f.indent, p(y))));
    let S, E, N;
    t.isNode(o) ? (S = !!o.spaceBefore, E = o.commentBefore, N = o.comment) : (S = !1, E = null, N = null, o && typeof o == "object" && (o = i.createNode(o))), f.implicitKey = !1, !v && !y && t.isScalar(o) && (f.indentAtStart = $.length + 1), b = !1, !g && h.length >= 2 && !f.inFlow && !v && t.isSeq(o) && !o.flow && !o.tag && !o.anchor && (f.indent = f.indent.substring(2));
    let O = !1;
    const M = r.stringify(o, f, () => O = !0, () => b = !0);
    let T = " ";
    if (y || S || E) {
      if (T = S ? `
` : "", E) {
        const V = p(E);
        T += `
${s.indentComment(V, f.indent)}`;
      }
      M === "" && !f.inFlow ? T === `
` && (T = `

`) : T += `
${f.indent}`;
    } else if (!v && t.isCollection(o)) {
      const V = M[0], x = M.indexOf(`
`), C = x !== -1, j = f.inFlow ?? o.flow ?? o.items.length === 0;
      if (C || !j) {
        let z = !1;
        if (C && (V === "&" || V === "!")) {
          let F = M.indexOf(" ");
          V === "&" && F !== -1 && F < x && M[F + 1] === "!" && (F = M.indexOf(" ", F + 1)), (F === -1 || x < F) && (z = !0);
        }
        z || (T = `
${f.indent}`);
      }
    } else (M === "" || M[0] === `
`) && (T = "");
    return $ += T + M, f.inFlow ? O && d && d() : N && !O ? $ += s.lineComment($, f.indent, p(N)) : b && u && u(), $;
  }
  return Js.stringifyPair = l, Js;
}
var Ws = {}, Hr = {}, sl;
function Wu() {
  if (sl) return Hr;
  sl = 1;
  var t = qi;
  function e(s, ...l) {
    s === "debug" && console.log(...l);
  }
  function r(s, l) {
    (s === "debug" || s === "warn") && (typeof t.emitWarning == "function" ? t.emitWarning(l) : console.warn(l));
  }
  return Hr.debug = e, Hr.warn = r, Hr;
}
var Rt = {}, il;
function Qi() {
  if (il) return Rt;
  il = 1;
  var t = re(), e = le();
  const r = "<<", s = {
    identify: (f) => f === r || typeof f == "symbol" && f.description === r,
    default: "key",
    tag: "tag:yaml.org,2002:merge",
    test: /^<<$/,
    resolve: () => Object.assign(new e.Scalar(Symbol(r)), {
      addToJSMap: c
    }),
    stringify: () => r
  }, l = (f, d) => (s.identify(d) || t.isScalar(d) && (!d.type || d.type === e.Scalar.PLAIN) && s.identify(d.value)) && f?.doc.schema.tags.some((u) => u.tag === s.tag && u.default);
  function c(f, d, u) {
    if (u = f && t.isAlias(u) ? u.resolve(f.doc) : u, t.isSeq(u))
      for (const n of u.items)
        o(f, d, n);
    else if (Array.isArray(u))
      for (const n of u)
        o(f, d, n);
    else
      o(f, d, u);
  }
  function o(f, d, u) {
    const n = f && t.isAlias(u) ? u.resolve(f.doc) : u;
    if (!t.isMap(n))
      throw new Error("Merge sources must be maps or map aliases");
    const i = n.toJSON(null, f, Map);
    for (const [a, h] of i)
      d instanceof Map ? d.has(a) || d.set(a, h) : d instanceof Set ? d.add(a) : Object.prototype.hasOwnProperty.call(d, a) || Object.defineProperty(d, a, {
        value: h,
        writable: !0,
        enumerable: !0,
        configurable: !0
      });
    return d;
  }
  return Rt.addMergeToJSMap = c, Rt.isMergeKey = l, Rt.merge = s, Rt;
}
var al;
function Qu() {
  if (al) return Ws;
  al = 1;
  var t = Wu(), e = Qi(), r = An(), s = re(), l = Qe();
  function c(f, d, { key: u, value: n }) {
    if (s.isNode(u) && u.addToJSMap)
      u.addToJSMap(f, d, n);
    else if (e.isMergeKey(f, u))
      e.addMergeToJSMap(f, d, n);
    else {
      const i = l.toJS(u, "", f);
      if (d instanceof Map)
        d.set(i, l.toJS(n, i, f));
      else if (d instanceof Set)
        d.add(i);
      else {
        const a = o(u, i, f), h = l.toJS(n, a, f);
        a in d ? Object.defineProperty(d, a, {
          value: h,
          writable: !0,
          enumerable: !0,
          configurable: !0
        }) : d[a] = h;
      }
    }
    return d;
  }
  function o(f, d, u) {
    if (d === null)
      return "";
    if (typeof d != "object")
      return String(d);
    if (s.isNode(f) && u?.doc) {
      const n = r.createStringifyContext(u.doc, {});
      n.anchors = /* @__PURE__ */ new Set();
      for (const a of u.anchors.keys())
        n.anchors.add(a.anchor);
      n.inFlow = !0, n.inStringifyKey = !0;
      const i = f.toString(n);
      if (!u.mapKeyWarned) {
        let a = JSON.stringify(i);
        a.length > 40 && (a = a.substring(0, 36) + '..."'), t.warn(u.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${a}. Set mapAsMap: true to use object keys.`), u.mapKeyWarned = !0;
      }
      return i;
    }
    return JSON.stringify(d);
  }
  return Ws.addPairToJSMap = c, Ws;
}
var ol;
function Ze() {
  if (ol) return Gr;
  ol = 1;
  var t = _n(), e = Jm(), r = Qu(), s = re();
  function l(o, f, d) {
    const u = t.createNode(o, void 0, d), n = t.createNode(f, void 0, d);
    return new c(u, n);
  }
  let c = class Zu {
    constructor(f, d = null) {
      Object.defineProperty(this, s.NODE_TYPE, { value: s.PAIR }), this.key = f, this.value = d;
    }
    clone(f) {
      let { key: d, value: u } = this;
      return s.isNode(d) && (d = d.clone(f)), s.isNode(u) && (u = u.clone(f)), new Zu(d, u);
    }
    toJSON(f, d) {
      const u = d?.mapAsMap ? /* @__PURE__ */ new Map() : {};
      return r.addPairToJSMap(d, u, this);
    }
    toString(f, d, u) {
      return f?.doc ? e.stringifyPair(this, f, d, u) : JSON.stringify(this);
    }
  };
  return Gr.Pair = c, Gr.createPair = l, Gr;
}
var Qs = {}, Zs = {}, Jr = {}, ei = {}, cl;
function ef() {
  if (cl) return ei;
  cl = 1;
  var t = re(), e = An(), r = Nn();
  function s(f, d, u) {
    return (d.inFlow ?? f.flow ? c : l)(f, d, u);
  }
  function l({ comment: f, items: d }, u, { blockItemPrefix: n, flowChars: i, itemIndent: a, onChompKeep: h, onComment: p }) {
    const { indent: g, options: { commentString: m } } = u, y = Object.assign({}, u, { indent: a, type: null });
    let v = !1;
    const w = [];
    for (let $ = 0; $ < d.length; ++$) {
      const S = d[$];
      let E = null;
      if (t.isNode(S))
        !v && S.spaceBefore && w.push(""), o(u, w, S.commentBefore, v), S.comment && (E = S.comment);
      else if (t.isPair(S)) {
        const O = t.isNode(S.key) ? S.key : null;
        O && (!v && O.spaceBefore && w.push(""), o(u, w, O.commentBefore, v));
      }
      v = !1;
      let N = e.stringify(S, y, () => E = null, () => v = !0);
      E && (N += r.lineComment(N, a, m(E))), v && E && (v = !1), w.push(n + N);
    }
    let b;
    if (w.length === 0)
      b = i.start + i.end;
    else {
      b = w[0];
      for (let $ = 1; $ < w.length; ++$) {
        const S = w[$];
        b += S ? `
${g}${S}` : `
`;
      }
    }
    return f ? (b += `
` + r.indentComment(m(f), g), p && p()) : v && h && h(), b;
  }
  function c({ items: f }, d, { flowChars: u, itemIndent: n }) {
    const { indent: i, indentStep: a, flowCollectionPadding: h, options: { commentString: p } } = d;
    n += a;
    const g = Object.assign({}, d, {
      indent: n,
      inFlow: !0,
      type: null
    });
    let m = !1, y = 0;
    const v = [];
    for (let $ = 0; $ < f.length; ++$) {
      const S = f[$];
      let E = null;
      if (t.isNode(S))
        S.spaceBefore && v.push(""), o(d, v, S.commentBefore, !1), S.comment && (E = S.comment);
      else if (t.isPair(S)) {
        const O = t.isNode(S.key) ? S.key : null;
        O && (O.spaceBefore && v.push(""), o(d, v, O.commentBefore, !1), O.comment && (m = !0));
        const M = t.isNode(S.value) ? S.value : null;
        M ? (M.comment && (E = M.comment), M.commentBefore && (m = !0)) : S.value == null && O?.comment && (E = O.comment);
      }
      E && (m = !0);
      let N = e.stringify(S, g, () => E = null);
      $ < f.length - 1 && (N += ","), E && (N += r.lineComment(N, n, p(E))), !m && (v.length > y || N.includes(`
`)) && (m = !0), v.push(N), y = v.length;
    }
    const { start: w, end: b } = u;
    if (v.length === 0)
      return w + b;
    if (!m) {
      const $ = v.reduce((S, E) => S + E.length + 2, 2);
      m = d.options.lineWidth > 0 && $ > d.options.lineWidth;
    }
    if (m) {
      let $ = w;
      for (const S of v)
        $ += S ? `
${a}${i}${S}` : `
`;
      return `${$}
${i}${b}`;
    } else
      return `${w}${h}${v.join(" ")}${h}${b}`;
  }
  function o({ indent: f, options: { commentString: d } }, u, n, i) {
    if (n && i && (n = n.replace(/^\n+/, "")), n) {
      const a = r.indentComment(d(n), f);
      u.push(a.trimStart());
    }
  }
  return ei.stringifyCollection = s, ei;
}
var ll;
function et() {
  if (ll) return Jr;
  ll = 1;
  var t = ef(), e = Qu(), r = Wi(), s = re(), l = Ze(), c = le();
  function o(d, u) {
    const n = s.isScalar(u) ? u.value : u;
    for (const i of d)
      if (s.isPair(i) && (i.key === u || i.key === n || s.isScalar(i.key) && i.key.value === n))
        return i;
  }
  let f = class extends r.Collection {
    static get tagName() {
      return "tag:yaml.org,2002:map";
    }
    constructor(u) {
      super(s.MAP, u), this.items = [];
    }
    /**
     * A generic collection parsing method that can be extended
     * to other node classes that inherit from YAMLMap
     */
    static from(u, n, i) {
      const { keepUndefined: a, replacer: h } = i, p = new this(u), g = (m, y) => {
        if (typeof h == "function")
          y = h.call(n, m, y);
        else if (Array.isArray(h) && !h.includes(m))
          return;
        (y !== void 0 || a) && p.items.push(l.createPair(m, y, i));
      };
      if (n instanceof Map)
        for (const [m, y] of n)
          g(m, y);
      else if (n && typeof n == "object")
        for (const m of Object.keys(n))
          g(m, n[m]);
      return typeof u.sortMapEntries == "function" && p.items.sort(u.sortMapEntries), p;
    }
    /**
     * Adds a value to the collection.
     *
     * @param overwrite - If not set `true`, using a key that is already in the
     *   collection will throw. Otherwise, overwrites the previous value.
     */
    add(u, n) {
      let i;
      s.isPair(u) ? i = u : !u || typeof u != "object" || !("key" in u) ? i = new l.Pair(u, u?.value) : i = new l.Pair(u.key, u.value);
      const a = o(this.items, i.key), h = this.schema?.sortMapEntries;
      if (a) {
        if (!n)
          throw new Error(`Key ${i.key} already set`);
        s.isScalar(a.value) && c.isScalarValue(i.value) ? a.value.value = i.value : a.value = i.value;
      } else if (h) {
        const p = this.items.findIndex((g) => h(i, g) < 0);
        p === -1 ? this.items.push(i) : this.items.splice(p, 0, i);
      } else
        this.items.push(i);
    }
    delete(u) {
      const n = o(this.items, u);
      return n ? this.items.splice(this.items.indexOf(n), 1).length > 0 : !1;
    }
    get(u, n) {
      const a = o(this.items, u)?.value;
      return (!n && s.isScalar(a) ? a.value : a) ?? void 0;
    }
    has(u) {
      return !!o(this.items, u);
    }
    set(u, n) {
      this.add(new l.Pair(u, n), !0);
    }
    /**
     * @param ctx - Conversion context, originally set in Document#toJS()
     * @param {Class} Type - If set, forces the returned collection type
     * @returns Instance of Type, Map, or Object
     */
    toJSON(u, n, i) {
      const a = i ? new i() : n?.mapAsMap ? /* @__PURE__ */ new Map() : {};
      n?.onCreate && n.onCreate(a);
      for (const h of this.items)
        e.addPairToJSMap(n, a, h);
      return a;
    }
    toString(u, n, i) {
      if (!u)
        return JSON.stringify(this);
      for (const a of this.items)
        if (!s.isPair(a))
          throw new Error(`Map items must all be pairs; found ${JSON.stringify(a)} instead`);
      return !u.allNullValues && this.hasAllNullValues(!1) && (u = Object.assign({}, u, { allNullValues: !0 })), t.stringifyCollection(this, u, {
        blockItemPrefix: "",
        flowChars: { start: "{", end: "}" },
        itemIndent: u.indent || "",
        onChompKeep: i,
        onComment: n
      });
    }
  };
  return Jr.YAMLMap = f, Jr.findPair = o, Jr;
}
var ul;
function Vt() {
  if (ul) return Zs;
  ul = 1;
  var t = re(), e = et();
  const r = {
    collection: "map",
    default: !0,
    nodeClass: e.YAMLMap,
    tag: "tag:yaml.org,2002:map",
    resolve(s, l) {
      return t.isMap(s) || l("Expected a mapping for this tag"), s;
    },
    createNode: (s, l, c) => e.YAMLMap.from(s, l, c)
  };
  return Zs.map = r, Zs;
}
var ti = {}, ri = {}, fl;
function tt() {
  if (fl) return ri;
  fl = 1;
  var t = _n(), e = ef(), r = Wi(), s = re(), l = le(), c = Qe();
  let o = class extends r.Collection {
    static get tagName() {
      return "tag:yaml.org,2002:seq";
    }
    constructor(u) {
      super(s.SEQ, u), this.items = [];
    }
    add(u) {
      this.items.push(u);
    }
    /**
     * Removes a value from the collection.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     *
     * @returns `true` if the item was found and removed.
     */
    delete(u) {
      const n = f(u);
      return typeof n != "number" ? !1 : this.items.splice(n, 1).length > 0;
    }
    get(u, n) {
      const i = f(u);
      if (typeof i != "number")
        return;
      const a = this.items[i];
      return !n && s.isScalar(a) ? a.value : a;
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     */
    has(u) {
      const n = f(u);
      return typeof n == "number" && n < this.items.length;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     *
     * If `key` does not contain a representation of an integer, this will throw.
     * It may be wrapped in a `Scalar`.
     */
    set(u, n) {
      const i = f(u);
      if (typeof i != "number")
        throw new Error(`Expected a valid index, not ${u}.`);
      const a = this.items[i];
      s.isScalar(a) && l.isScalarValue(n) ? a.value = n : this.items[i] = n;
    }
    toJSON(u, n) {
      const i = [];
      n?.onCreate && n.onCreate(i);
      let a = 0;
      for (const h of this.items)
        i.push(c.toJS(h, String(a++), n));
      return i;
    }
    toString(u, n, i) {
      return u ? e.stringifyCollection(this, u, {
        blockItemPrefix: "- ",
        flowChars: { start: "[", end: "]" },
        itemIndent: (u.indent || "") + "  ",
        onChompKeep: i,
        onComment: n
      }) : JSON.stringify(this);
    }
    static from(u, n, i) {
      const { replacer: a } = i, h = new this(u);
      if (n && Symbol.iterator in Object(n)) {
        let p = 0;
        for (let g of n) {
          if (typeof a == "function") {
            const m = n instanceof Set ? g : String(p++);
            g = a.call(n, m, g);
          }
          h.items.push(t.createNode(g, void 0, i));
        }
      }
      return h;
    }
  };
  function f(d) {
    let u = s.isScalar(d) ? d.value : d;
    return u && typeof u == "string" && (u = Number(u)), typeof u == "number" && Number.isInteger(u) && u >= 0 ? u : null;
  }
  return ri.YAMLSeq = o, ri;
}
var dl;
function Ut() {
  if (dl) return ti;
  dl = 1;
  var t = re(), e = tt();
  const r = {
    collection: "seq",
    default: !0,
    nodeClass: e.YAMLSeq,
    tag: "tag:yaml.org,2002:seq",
    resolve(s, l) {
      return t.isSeq(s) || l("Expected a sequence for this tag"), s;
    },
    createNode: (s, l, c) => e.YAMLSeq.from(s, l, c)
  };
  return ti.seq = r, ti;
}
var ni = {}, hl;
function On() {
  if (hl) return ni;
  hl = 1;
  var t = Rn();
  const e = {
    identify: (r) => typeof r == "string",
    default: !0,
    tag: "tag:yaml.org,2002:str",
    resolve: (r) => r,
    stringify(r, s, l, c) {
      return s = Object.assign({ actualString: !0 }, s), t.stringifyString(r, s, l, c);
    }
  };
  return ni.string = e, ni;
}
var Xr = {}, si = {}, pl;
function Zi() {
  if (pl) return si;
  pl = 1;
  var t = le();
  const e = {
    identify: (r) => r == null,
    createNode: () => new t.Scalar(null),
    default: !0,
    tag: "tag:yaml.org,2002:null",
    test: /^(?:~|[Nn]ull|NULL)?$/,
    resolve: () => new t.Scalar(null),
    stringify: ({ source: r }, s) => typeof r == "string" && e.test.test(r) ? r : s.options.nullStr
  };
  return si.nullTag = e, si;
}
var ii = {}, ml;
function tf() {
  if (ml) return ii;
  ml = 1;
  var t = le();
  const e = {
    identify: (r) => typeof r == "boolean",
    default: !0,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
    resolve: (r) => new t.Scalar(r[0] === "t" || r[0] === "T"),
    stringify({ source: r, value: s }, l) {
      if (r && e.test.test(r)) {
        const c = r[0] === "t" || r[0] === "T";
        if (s === c)
          return r;
      }
      return s ? l.options.trueStr : l.options.falseStr;
    }
  };
  return ii.boolTag = e, ii;
}
var At = {}, ai = {}, gl;
function Bt() {
  if (gl) return ai;
  gl = 1;
  function t({ format: e, minFractionDigits: r, tag: s, value: l }) {
    if (typeof l == "bigint")
      return String(l);
    const c = typeof l == "number" ? l : Number(l);
    if (!isFinite(c))
      return isNaN(c) ? ".nan" : c < 0 ? "-.inf" : ".inf";
    let o = JSON.stringify(l);
    if (!e && r && (!s || s === "tag:yaml.org,2002:float") && /^\d/.test(o)) {
      let f = o.indexOf(".");
      f < 0 && (f = o.length, o += ".");
      let d = r - (o.length - f - 1);
      for (; d-- > 0; )
        o += "0";
    }
    return o;
  }
  return ai.stringifyNumber = t, ai;
}
var yl;
function rf() {
  if (yl) return At;
  yl = 1;
  var t = le(), e = Bt();
  const r = {
    identify: (c) => typeof c == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (c) => c.slice(-3).toLowerCase() === "nan" ? NaN : c[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
    stringify: e.stringifyNumber
  }, s = {
    identify: (c) => typeof c == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
    resolve: (c) => parseFloat(c),
    stringify(c) {
      const o = Number(c.value);
      return isFinite(o) ? o.toExponential() : e.stringifyNumber(c);
    }
  }, l = {
    identify: (c) => typeof c == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
    resolve(c) {
      const o = new t.Scalar(parseFloat(c)), f = c.indexOf(".");
      return f !== -1 && c[c.length - 1] === "0" && (o.minFractionDigits = c.length - f - 1), o;
    },
    stringify: e.stringifyNumber
  };
  return At.float = l, At.floatExp = s, At.floatNaN = r, At;
}
var Ot = {}, vl;
function nf() {
  if (vl) return Ot;
  vl = 1;
  var t = Bt();
  const e = (f) => typeof f == "bigint" || Number.isInteger(f), r = (f, d, u, { intAsBigInt: n }) => n ? BigInt(f) : parseInt(f.substring(d), u);
  function s(f, d, u) {
    const { value: n } = f;
    return e(n) && n >= 0 ? u + n.toString(d) : t.stringifyNumber(f);
  }
  const l = {
    identify: (f) => e(f) && f >= 0,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^0o[0-7]+$/,
    resolve: (f, d, u) => r(f, 2, 8, u),
    stringify: (f) => s(f, 8, "0o")
  }, c = {
    identify: e,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9]+$/,
    resolve: (f, d, u) => r(f, 0, 10, u),
    stringify: t.stringifyNumber
  }, o = {
    identify: (f) => e(f) && f >= 0,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^0x[0-9a-fA-F]+$/,
    resolve: (f, d, u) => r(f, 2, 16, u),
    stringify: (f) => s(f, 16, "0x")
  };
  return Ot.int = c, Ot.intHex = o, Ot.intOct = l, Ot;
}
var oi = {}, $l;
function Xm() {
  if ($l) return oi;
  $l = 1;
  var t = Vt(), e = Zi(), r = Ut(), s = On(), l = tf(), c = rf(), o = nf();
  const f = [
    t.map,
    r.seq,
    s.string,
    e.nullTag,
    l.boolTag,
    o.intOct,
    o.int,
    o.intHex,
    c.floatNaN,
    c.floatExp,
    c.float
  ];
  return oi.schema = f, oi;
}
var ci = {}, wl;
function Wm() {
  if (wl) return ci;
  wl = 1;
  var t = le(), e = Vt(), r = Ut();
  function s(d) {
    return typeof d == "bigint" || Number.isInteger(d);
  }
  const l = ({ value: d }) => JSON.stringify(d), c = [
    {
      identify: (d) => typeof d == "string",
      default: !0,
      tag: "tag:yaml.org,2002:str",
      resolve: (d) => d,
      stringify: l
    },
    {
      identify: (d) => d == null,
      createNode: () => new t.Scalar(null),
      default: !0,
      tag: "tag:yaml.org,2002:null",
      test: /^null$/,
      resolve: () => null,
      stringify: l
    },
    {
      identify: (d) => typeof d == "boolean",
      default: !0,
      tag: "tag:yaml.org,2002:bool",
      test: /^true$|^false$/,
      resolve: (d) => d === "true",
      stringify: l
    },
    {
      identify: s,
      default: !0,
      tag: "tag:yaml.org,2002:int",
      test: /^-?(?:0|[1-9][0-9]*)$/,
      resolve: (d, u, { intAsBigInt: n }) => n ? BigInt(d) : parseInt(d, 10),
      stringify: ({ value: d }) => s(d) ? d.toString() : JSON.stringify(d)
    },
    {
      identify: (d) => typeof d == "number",
      default: !0,
      tag: "tag:yaml.org,2002:float",
      test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
      resolve: (d) => parseFloat(d),
      stringify: l
    }
  ], o = {
    default: !0,
    tag: "",
    test: /^/,
    resolve(d, u) {
      return u(`Unresolved plain scalar ${JSON.stringify(d)}`), d;
    }
  }, f = [e.map, r.seq].concat(c, o);
  return ci.schema = f, ci;
}
var li = {}, bl;
function sf() {
  if (bl) return li;
  bl = 1;
  var t = qf, e = le(), r = Rn();
  const s = {
    identify: (l) => l instanceof Uint8Array,
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
    resolve(l, c) {
      if (typeof t.Buffer == "function")
        return t.Buffer.from(l, "base64");
      if (typeof atob == "function") {
        const o = atob(l.replace(/[\n\r]/g, "")), f = new Uint8Array(o.length);
        for (let d = 0; d < o.length; ++d)
          f[d] = o.charCodeAt(d);
        return f;
      } else
        return c("This environment does not support reading binary tags; either Buffer or atob is required"), l;
    },
    stringify({ comment: l, type: c, value: o }, f, d, u) {
      if (!o)
        return "";
      const n = o;
      let i;
      if (typeof t.Buffer == "function")
        i = n instanceof t.Buffer ? n.toString("base64") : t.Buffer.from(n.buffer).toString("base64");
      else if (typeof btoa == "function") {
        let a = "";
        for (let h = 0; h < n.length; ++h)
          a += String.fromCharCode(n[h]);
        i = btoa(a);
      } else
        throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
      if (c ?? (c = e.Scalar.BLOCK_LITERAL), c !== e.Scalar.QUOTE_DOUBLE) {
        const a = Math.max(f.options.lineWidth - f.indent.length, f.options.minContentWidth), h = Math.ceil(i.length / a), p = new Array(h);
        for (let g = 0, m = 0; g < h; ++g, m += a)
          p[g] = i.substr(m, a);
        i = p.join(c === e.Scalar.BLOCK_LITERAL ? `
` : " ");
      }
      return r.stringifyString({ comment: l, type: c, value: i }, f, d, u);
    }
  };
  return li.binary = s, li;
}
var Wr = {}, It = {}, Sl;
function ea() {
  if (Sl) return It;
  Sl = 1;
  var t = re(), e = Ze(), r = le(), s = tt();
  function l(f, d) {
    if (t.isSeq(f))
      for (let u = 0; u < f.items.length; ++u) {
        let n = f.items[u];
        if (!t.isPair(n)) {
          if (t.isMap(n)) {
            n.items.length > 1 && d("Each pair must have its own sequence indicator");
            const i = n.items[0] || new e.Pair(new r.Scalar(null));
            if (n.commentBefore && (i.key.commentBefore = i.key.commentBefore ? `${n.commentBefore}
${i.key.commentBefore}` : n.commentBefore), n.comment) {
              const a = i.value ?? i.key;
              a.comment = a.comment ? `${n.comment}
${a.comment}` : n.comment;
            }
            n = i;
          }
          f.items[u] = t.isPair(n) ? n : new e.Pair(n);
        }
      }
    else
      d("Expected a sequence for this tag");
    return f;
  }
  function c(f, d, u) {
    const { replacer: n } = u, i = new s.YAMLSeq(f);
    i.tag = "tag:yaml.org,2002:pairs";
    let a = 0;
    if (d && Symbol.iterator in Object(d))
      for (let h of d) {
        typeof n == "function" && (h = n.call(d, String(a++), h));
        let p, g;
        if (Array.isArray(h))
          if (h.length === 2)
            p = h[0], g = h[1];
          else
            throw new TypeError(`Expected [key, value] tuple: ${h}`);
        else if (h && h instanceof Object) {
          const m = Object.keys(h);
          if (m.length === 1)
            p = m[0], g = h[p];
          else
            throw new TypeError(`Expected tuple with one key, not ${m.length} keys`);
        } else
          p = h;
        i.items.push(e.createPair(p, g, u));
      }
    return i;
  }
  const o = {
    collection: "seq",
    default: !1,
    tag: "tag:yaml.org,2002:pairs",
    resolve: l,
    createNode: c
  };
  return It.createPairs = c, It.pairs = o, It.resolvePairs = l, It;
}
var El;
function af() {
  if (El) return Wr;
  El = 1;
  var t = re(), e = Qe(), r = et(), s = tt(), l = ea();
  class c extends s.YAMLSeq {
    constructor() {
      super(), this.add = r.YAMLMap.prototype.add.bind(this), this.delete = r.YAMLMap.prototype.delete.bind(this), this.get = r.YAMLMap.prototype.get.bind(this), this.has = r.YAMLMap.prototype.has.bind(this), this.set = r.YAMLMap.prototype.set.bind(this), this.tag = c.tag;
    }
    /**
     * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
     * but TypeScript won't allow widening the signature of a child method.
     */
    toJSON(d, u) {
      if (!u)
        return super.toJSON(d);
      const n = /* @__PURE__ */ new Map();
      u?.onCreate && u.onCreate(n);
      for (const i of this.items) {
        let a, h;
        if (t.isPair(i) ? (a = e.toJS(i.key, "", u), h = e.toJS(i.value, a, u)) : a = e.toJS(i, "", u), n.has(a))
          throw new Error("Ordered maps must not include duplicate keys");
        n.set(a, h);
      }
      return n;
    }
    static from(d, u, n) {
      const i = l.createPairs(d, u, n), a = new this();
      return a.items = i.items, a;
    }
  }
  c.tag = "tag:yaml.org,2002:omap";
  const o = {
    collection: "seq",
    identify: (f) => f instanceof Map,
    nodeClass: c,
    default: !1,
    tag: "tag:yaml.org,2002:omap",
    resolve(f, d) {
      const u = l.resolvePairs(f, d), n = [];
      for (const { key: i } of u.items)
        t.isScalar(i) && (n.includes(i.value) ? d(`Ordered maps must not include duplicate keys: ${i.value}`) : n.push(i.value));
      return Object.assign(new c(), u);
    },
    createNode: (f, d, u) => c.from(f, d, u)
  };
  return Wr.YAMLOMap = c, Wr.omap = o, Wr;
}
var ui = {}, Qr = {}, _l;
function Qm() {
  if (_l) return Qr;
  _l = 1;
  var t = le();
  function e({ value: l, source: c }, o) {
    return c && (l ? r : s).test.test(c) ? c : l ? o.options.trueStr : o.options.falseStr;
  }
  const r = {
    identify: (l) => l === !0,
    default: !0,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
    resolve: () => new t.Scalar(!0),
    stringify: e
  }, s = {
    identify: (l) => l === !1,
    default: !0,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
    resolve: () => new t.Scalar(!1),
    stringify: e
  };
  return Qr.falseTag = s, Qr.trueTag = r, Qr;
}
var Pt = {}, Nl;
function Zm() {
  if (Nl) return Pt;
  Nl = 1;
  var t = le(), e = Bt();
  const r = {
    identify: (c) => typeof c == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (c) => c.slice(-3).toLowerCase() === "nan" ? NaN : c[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
    stringify: e.stringifyNumber
  }, s = {
    identify: (c) => typeof c == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
    resolve: (c) => parseFloat(c.replace(/_/g, "")),
    stringify(c) {
      const o = Number(c.value);
      return isFinite(o) ? o.toExponential() : e.stringifyNumber(c);
    }
  }, l = {
    identify: (c) => typeof c == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
    resolve(c) {
      const o = new t.Scalar(parseFloat(c.replace(/_/g, ""))), f = c.indexOf(".");
      if (f !== -1) {
        const d = c.substring(f + 1).replace(/_/g, "");
        d[d.length - 1] === "0" && (o.minFractionDigits = d.length);
      }
      return o;
    },
    stringify: e.stringifyNumber
  };
  return Pt.float = l, Pt.floatExp = s, Pt.floatNaN = r, Pt;
}
var ft = {}, Rl;
function eg() {
  if (Rl) return ft;
  Rl = 1;
  var t = Bt();
  const e = (d) => typeof d == "bigint" || Number.isInteger(d);
  function r(d, u, n, { intAsBigInt: i }) {
    const a = d[0];
    if ((a === "-" || a === "+") && (u += 1), d = d.substring(u).replace(/_/g, ""), i) {
      switch (n) {
        case 2:
          d = `0b${d}`;
          break;
        case 8:
          d = `0o${d}`;
          break;
        case 16:
          d = `0x${d}`;
          break;
      }
      const p = BigInt(d);
      return a === "-" ? BigInt(-1) * p : p;
    }
    const h = parseInt(d, n);
    return a === "-" ? -1 * h : h;
  }
  function s(d, u, n) {
    const { value: i } = d;
    if (e(i)) {
      const a = i.toString(u);
      return i < 0 ? "-" + n + a.substr(1) : n + a;
    }
    return t.stringifyNumber(d);
  }
  const l = {
    identify: e,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "BIN",
    test: /^[-+]?0b[0-1_]+$/,
    resolve: (d, u, n) => r(d, 2, 2, n),
    stringify: (d) => s(d, 2, "0b")
  }, c = {
    identify: e,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^[-+]?0[0-7_]+$/,
    resolve: (d, u, n) => r(d, 1, 8, n),
    stringify: (d) => s(d, 8, "0")
  }, o = {
    identify: e,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9][0-9_]*$/,
    resolve: (d, u, n) => r(d, 0, 10, n),
    stringify: t.stringifyNumber
  }, f = {
    identify: e,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^[-+]?0x[0-9a-fA-F_]+$/,
    resolve: (d, u, n) => r(d, 2, 16, n),
    stringify: (d) => s(d, 16, "0x")
  };
  return ft.int = o, ft.intBin = l, ft.intHex = f, ft.intOct = c, ft;
}
var Zr = {}, Al;
function of() {
  if (Al) return Zr;
  Al = 1;
  var t = re(), e = Ze(), r = et();
  class s extends r.YAMLMap {
    constructor(o) {
      super(o), this.tag = s.tag;
    }
    add(o) {
      let f;
      t.isPair(o) ? f = o : o && typeof o == "object" && "key" in o && "value" in o && o.value === null ? f = new e.Pair(o.key, null) : f = new e.Pair(o, null), r.findPair(this.items, f.key) || this.items.push(f);
    }
    /**
     * If `keepPair` is `true`, returns the Pair matching `key`.
     * Otherwise, returns the value of that Pair's key.
     */
    get(o, f) {
      const d = r.findPair(this.items, o);
      return !f && t.isPair(d) ? t.isScalar(d.key) ? d.key.value : d.key : d;
    }
    set(o, f) {
      if (typeof f != "boolean")
        throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof f}`);
      const d = r.findPair(this.items, o);
      d && !f ? this.items.splice(this.items.indexOf(d), 1) : !d && f && this.items.push(new e.Pair(o));
    }
    toJSON(o, f) {
      return super.toJSON(o, f, Set);
    }
    toString(o, f, d) {
      if (!o)
        return JSON.stringify(this);
      if (this.hasAllNullValues(!0))
        return super.toString(Object.assign({}, o, { allNullValues: !0 }), f, d);
      throw new Error("Set items must all have null values");
    }
    static from(o, f, d) {
      const { replacer: u } = d, n = new this(o);
      if (f && Symbol.iterator in Object(f))
        for (let i of f)
          typeof u == "function" && (i = u.call(f, i, i)), n.items.push(e.createPair(i, null, d));
      return n;
    }
  }
  s.tag = "tag:yaml.org,2002:set";
  const l = {
    collection: "map",
    identify: (c) => c instanceof Set,
    nodeClass: s,
    default: !1,
    tag: "tag:yaml.org,2002:set",
    createNode: (c, o, f) => s.from(c, o, f),
    resolve(c, o) {
      if (t.isMap(c)) {
        if (c.hasAllNullValues(!0))
          return Object.assign(new s(), c);
        o("Set items must all have null values");
      } else
        o("Expected a mapping for this tag");
      return c;
    }
  };
  return Zr.YAMLSet = s, Zr.set = l, Zr;
}
var Tt = {}, Ol;
function cf() {
  if (Ol) return Tt;
  Ol = 1;
  var t = Bt();
  function e(o, f) {
    const d = o[0], u = d === "-" || d === "+" ? o.substring(1) : o, n = (a) => f ? BigInt(a) : Number(a), i = u.replace(/_/g, "").split(":").reduce((a, h) => a * n(60) + n(h), n(0));
    return d === "-" ? n(-1) * i : i;
  }
  function r(o) {
    let { value: f } = o, d = (a) => a;
    if (typeof f == "bigint")
      d = (a) => BigInt(a);
    else if (isNaN(f) || !isFinite(f))
      return t.stringifyNumber(o);
    let u = "";
    f < 0 && (u = "-", f *= d(-1));
    const n = d(60), i = [f % n];
    return f < 60 ? i.unshift(0) : (f = (f - i[0]) / n, i.unshift(f % n), f >= 60 && (f = (f - i[0]) / n, i.unshift(f))), u + i.map((a) => String(a).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
  }
  const s = {
    identify: (o) => typeof o == "bigint" || Number.isInteger(o),
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
    resolve: (o, f, { intAsBigInt: d }) => e(o, d),
    stringify: r
  }, l = {
    identify: (o) => typeof o == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
    resolve: (o) => e(o, !1),
    stringify: r
  }, c = {
    identify: (o) => o instanceof Date,
    default: !0,
    tag: "tag:yaml.org,2002:timestamp",
    // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
    // may be omitted altogether, resulting in a date format. In such a case, the time part is
    // assumed to be 00:00:00Z (start of day, UTC).
    test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
    resolve(o) {
      const f = o.match(c.test);
      if (!f)
        throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
      const [, d, u, n, i, a, h] = f.map(Number), p = f[7] ? Number((f[7] + "00").substr(1, 3)) : 0;
      let g = Date.UTC(d, u - 1, n, i || 0, a || 0, h || 0, p);
      const m = f[8];
      if (m && m !== "Z") {
        let y = e(m, !1);
        Math.abs(y) < 30 && (y *= 60), g -= 6e4 * y;
      }
      return new Date(g);
    },
    stringify: ({ value: o }) => o?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
  };
  return Tt.floatTime = l, Tt.intTime = s, Tt.timestamp = c, Tt;
}
var Il;
function tg() {
  if (Il) return ui;
  Il = 1;
  var t = Vt(), e = Zi(), r = Ut(), s = On(), l = sf(), c = Qm(), o = Zm(), f = eg(), d = Qi(), u = af(), n = ea(), i = of(), a = cf();
  const h = [
    t.map,
    r.seq,
    s.string,
    e.nullTag,
    c.trueTag,
    c.falseTag,
    f.intBin,
    f.intOct,
    f.int,
    f.intHex,
    o.floatNaN,
    o.floatExp,
    o.float,
    l.binary,
    d.merge,
    u.omap,
    n.pairs,
    i.set,
    a.intTime,
    a.floatTime,
    a.timestamp
  ];
  return ui.schema = h, ui;
}
var Pl;
function rg() {
  if (Pl) return Xr;
  Pl = 1;
  var t = Vt(), e = Zi(), r = Ut(), s = On(), l = tf(), c = rf(), o = nf(), f = Xm(), d = Wm(), u = sf(), n = Qi(), i = af(), a = ea(), h = tg(), p = of(), g = cf();
  const m = /* @__PURE__ */ new Map([
    ["core", f.schema],
    ["failsafe", [t.map, r.seq, s.string]],
    ["json", d.schema],
    ["yaml11", h.schema],
    ["yaml-1.1", h.schema]
  ]), y = {
    binary: u.binary,
    bool: l.boolTag,
    float: c.float,
    floatExp: c.floatExp,
    floatNaN: c.floatNaN,
    floatTime: g.floatTime,
    int: o.int,
    intHex: o.intHex,
    intOct: o.intOct,
    intTime: g.intTime,
    map: t.map,
    merge: n.merge,
    null: e.nullTag,
    omap: i.omap,
    pairs: a.pairs,
    seq: r.seq,
    set: p.set,
    timestamp: g.timestamp
  }, v = {
    "tag:yaml.org,2002:binary": u.binary,
    "tag:yaml.org,2002:merge": n.merge,
    "tag:yaml.org,2002:omap": i.omap,
    "tag:yaml.org,2002:pairs": a.pairs,
    "tag:yaml.org,2002:set": p.set,
    "tag:yaml.org,2002:timestamp": g.timestamp
  };
  function w(b, $, S) {
    const E = m.get($);
    if (E && !b)
      return S && !E.includes(n.merge) ? E.concat(n.merge) : E.slice();
    let N = E;
    if (!N)
      if (Array.isArray(b))
        N = [];
      else {
        const O = Array.from(m.keys()).filter((M) => M !== "yaml11").map((M) => JSON.stringify(M)).join(", ");
        throw new Error(`Unknown schema "${$}"; use one of ${O} or define customTags array`);
      }
    if (Array.isArray(b))
      for (const O of b)
        N = N.concat(O);
    else typeof b == "function" && (N = b(N.slice()));
    return S && (N = N.concat(n.merge)), N.reduce((O, M) => {
      const T = typeof M == "string" ? y[M] : M;
      if (!T) {
        const V = JSON.stringify(M), x = Object.keys(y).map((C) => JSON.stringify(C)).join(", ");
        throw new Error(`Unknown custom tag ${V}; use one of ${x}`);
      }
      return O.includes(T) || O.push(T), O;
    }, []);
  }
  return Xr.coreKnownTags = v, Xr.getTags = w, Xr;
}
var Tl;
function uf() {
  if (Tl) return Qs;
  Tl = 1;
  var t = re(), e = Vt(), r = Ut(), s = On(), l = rg();
  const c = (f, d) => f.key < d.key ? -1 : f.key > d.key ? 1 : 0;
  let o = class lf {
    constructor({ compat: d, customTags: u, merge: n, resolveKnownTags: i, schema: a, sortMapEntries: h, toStringDefaults: p }) {
      this.compat = Array.isArray(d) ? l.getTags(d, "compat") : d ? l.getTags(null, d) : null, this.name = typeof a == "string" && a || "core", this.knownTags = i ? l.coreKnownTags : {}, this.tags = l.getTags(u, this.name, n), this.toStringOptions = p ?? null, Object.defineProperty(this, t.MAP, { value: e.map }), Object.defineProperty(this, t.SCALAR, { value: s.string }), Object.defineProperty(this, t.SEQ, { value: r.seq }), this.sortMapEntries = typeof h == "function" ? h : h === !0 ? c : null;
    }
    clone() {
      const d = Object.create(lf.prototype, Object.getOwnPropertyDescriptors(this));
      return d.tags = this.tags.slice(), d;
    }
  };
  return Qs.Schema = o, Qs;
}
var fi = {}, kl;
function ng() {
  if (kl) return fi;
  kl = 1;
  var t = re(), e = An(), r = Nn();
  function s(l, c) {
    const o = [];
    let f = c.directives === !0;
    if (c.directives !== !1 && l.directives) {
      const a = l.directives.toString(l);
      a ? (o.push(a), f = !0) : l.directives.docStart && (f = !0);
    }
    f && o.push("---");
    const d = e.createStringifyContext(l, c), { commentString: u } = d.options;
    if (l.commentBefore) {
      o.length !== 1 && o.unshift("");
      const a = u(l.commentBefore);
      o.unshift(r.indentComment(a, ""));
    }
    let n = !1, i = null;
    if (l.contents) {
      if (t.isNode(l.contents)) {
        if (l.contents.spaceBefore && f && o.push(""), l.contents.commentBefore) {
          const p = u(l.contents.commentBefore);
          o.push(r.indentComment(p, ""));
        }
        d.forceBlockIndent = !!l.comment, i = l.contents.comment;
      }
      const a = i ? void 0 : () => n = !0;
      let h = e.stringify(l.contents, d, () => i = null, a);
      i && (h += r.lineComment(h, "", u(i))), (h[0] === "|" || h[0] === ">") && o[o.length - 1] === "---" ? o[o.length - 1] = `--- ${h}` : o.push(h);
    } else
      o.push(e.stringify(l.contents, d));
    if (l.directives?.docEnd)
      if (l.comment) {
        const a = u(l.comment);
        a.includes(`
`) ? (o.push("..."), o.push(r.indentComment(a, ""))) : o.push(`... ${a}`);
      } else
        o.push("...");
    else {
      let a = l.comment;
      a && n && (a = a.replace(/^\n+/, "")), a && ((!n || i) && o[o.length - 1] !== "" && o.push(""), o.push(r.indentComment(u(a), "")));
    }
    return o.join(`
`) + `
`;
  }
  return fi.stringifyDocument = s, fi;
}
var Cl;
function In() {
  if (Cl) return Ks;
  Cl = 1;
  var t = En(), e = Wi(), r = re(), s = Ze(), l = Qe(), c = uf(), o = ng(), f = Ji(), d = Xu(), u = _n(), n = Ju();
  let i = class ff {
    constructor(p, g, m) {
      this.commentBefore = null, this.comment = null, this.errors = [], this.warnings = [], Object.defineProperty(this, r.NODE_TYPE, { value: r.DOC });
      let y = null;
      typeof g == "function" || Array.isArray(g) ? y = g : m === void 0 && g && (m = g, g = void 0);
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
      m?._directives ? (this.directives = m._directives.atDocument(), this.directives.yaml.explicit && (w = this.directives.yaml.version)) : this.directives = new n.Directives({ version: w }), this.setSchema(w, m), this.contents = p === void 0 ? null : this.createNode(p, y, m);
    }
    /**
     * Create a deep copy of this Document and its contents.
     *
     * Custom Node values that inherit from `Object` still refer to their original instances.
     */
    clone() {
      const p = Object.create(ff.prototype, {
        [r.NODE_TYPE]: { value: r.DOC }
      });
      return p.commentBefore = this.commentBefore, p.comment = this.comment, p.errors = this.errors.slice(), p.warnings = this.warnings.slice(), p.options = Object.assign({}, this.options), this.directives && (p.directives = this.directives.clone()), p.schema = this.schema.clone(), p.contents = r.isNode(this.contents) ? this.contents.clone(p.schema) : this.contents, this.range && (p.range = this.range.slice()), p;
    }
    /** Adds a value to the document. */
    add(p) {
      a(this.contents) && this.contents.add(p);
    }
    /** Adds a value to the document. */
    addIn(p, g) {
      a(this.contents) && this.contents.addIn(p, g);
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
    createAlias(p, g) {
      if (!p.anchor) {
        const m = f.anchorNames(this);
        p.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        !g || m.has(g) ? f.findNewAnchor(g || "a", m) : g;
      }
      return new t.Alias(p.anchor);
    }
    createNode(p, g, m) {
      let y;
      if (typeof g == "function")
        p = g.call({ "": p }, "", p), y = g;
      else if (Array.isArray(g)) {
        const x = (j) => typeof j == "number" || j instanceof String || j instanceof Number, C = g.filter(x).map(String);
        C.length > 0 && (g = g.concat(C)), y = g;
      } else m === void 0 && g && (m = g, g = void 0);
      const { aliasDuplicateObjects: v, anchorPrefix: w, flow: b, keepUndefined: $, onTagObj: S, tag: E } = m ?? {}, { onAnchor: N, setAnchors: O, sourceObjects: M } = f.createNodeAnchors(
        this,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        w || "a"
      ), T = {
        aliasDuplicateObjects: v ?? !0,
        keepUndefined: $ ?? !1,
        onAnchor: N,
        onTagObj: S,
        replacer: y,
        schema: this.schema,
        sourceObjects: M
      }, V = u.createNode(p, E, T);
      return b && r.isCollection(V) && (V.flow = !0), O(), V;
    }
    /**
     * Convert a key and a value into a `Pair` using the current schema,
     * recursively wrapping all values as `Scalar` or `Collection` nodes.
     */
    createPair(p, g, m = {}) {
      const y = this.createNode(p, null, m), v = this.createNode(g, null, m);
      return new s.Pair(y, v);
    }
    /**
     * Removes a value from the document.
     * @returns `true` if the item was found and removed.
     */
    delete(p) {
      return a(this.contents) ? this.contents.delete(p) : !1;
    }
    /**
     * Removes a value from the document.
     * @returns `true` if the item was found and removed.
     */
    deleteIn(p) {
      return e.isEmptyPath(p) ? this.contents == null ? !1 : (this.contents = null, !0) : a(this.contents) ? this.contents.deleteIn(p) : !1;
    }
    /**
     * Returns item at `key`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    get(p, g) {
      return r.isCollection(this.contents) ? this.contents.get(p, g) : void 0;
    }
    /**
     * Returns item at `path`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    getIn(p, g) {
      return e.isEmptyPath(p) ? !g && r.isScalar(this.contents) ? this.contents.value : this.contents : r.isCollection(this.contents) ? this.contents.getIn(p, g) : void 0;
    }
    /**
     * Checks if the document includes a value with the key `key`.
     */
    has(p) {
      return r.isCollection(this.contents) ? this.contents.has(p) : !1;
    }
    /**
     * Checks if the document includes a value at `path`.
     */
    hasIn(p) {
      return e.isEmptyPath(p) ? this.contents !== void 0 : r.isCollection(this.contents) ? this.contents.hasIn(p) : !1;
    }
    /**
     * Sets a value in this document. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    set(p, g) {
      this.contents == null ? this.contents = e.collectionFromPath(this.schema, [p], g) : a(this.contents) && this.contents.set(p, g);
    }
    /**
     * Sets a value in this document. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    setIn(p, g) {
      e.isEmptyPath(p) ? this.contents = g : this.contents == null ? this.contents = e.collectionFromPath(this.schema, Array.from(p), g) : a(this.contents) && this.contents.setIn(p, g);
    }
    /**
     * Change the YAML version and schema used by the document.
     * A `null` version disables support for directives, explicit tags, anchors, and aliases.
     * It also requires the `schema` option to be given as a `Schema` instance value.
     *
     * Overrides all previously set schema options.
     */
    setSchema(p, g = {}) {
      typeof p == "number" && (p = String(p));
      let m;
      switch (p) {
        case "1.1":
          this.directives ? this.directives.yaml.version = "1.1" : this.directives = new n.Directives({ version: "1.1" }), m = { resolveKnownTags: !1, schema: "yaml-1.1" };
          break;
        case "1.2":
        case "next":
          this.directives ? this.directives.yaml.version = p : this.directives = new n.Directives({ version: p }), m = { resolveKnownTags: !0, schema: "core" };
          break;
        case null:
          this.directives && delete this.directives, m = null;
          break;
        default: {
          const y = JSON.stringify(p);
          throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${y}`);
        }
      }
      if (g.schema instanceof Object)
        this.schema = g.schema;
      else if (m)
        this.schema = new c.Schema(Object.assign(m, g));
      else
        throw new Error("With a null YAML version, the { schema: Schema } option is required");
    }
    // json & jsonArg are only used from toJSON()
    toJS({ json: p, jsonArg: g, mapAsMap: m, maxAliasCount: y, onAnchor: v, reviver: w } = {}) {
      const b = {
        anchors: /* @__PURE__ */ new Map(),
        doc: this,
        keep: !p,
        mapAsMap: m === !0,
        mapKeyWarned: !1,
        maxAliasCount: typeof y == "number" ? y : 100
      }, $ = l.toJS(this.contents, g ?? "", b);
      if (typeof v == "function")
        for (const { count: S, res: E } of b.anchors.values())
          v(E, S);
      return typeof w == "function" ? d.applyReviver(w, { "": $ }, "", $) : $;
    }
    /**
     * A JSON representation of the document `contents`.
     *
     * @param jsonArg Used by `JSON.stringify` to indicate the array index or
     *   property name.
     */
    toJSON(p, g) {
      return this.toJS({ json: !0, jsonArg: p, mapAsMap: !1, onAnchor: g });
    }
    /** A YAML representation of the document. */
    toString(p = {}) {
      if (this.errors.length > 0)
        throw new Error("Document with errors cannot be stringified");
      if ("indent" in p && (!Number.isInteger(p.indent) || Number(p.indent) <= 0)) {
        const g = JSON.stringify(p.indent);
        throw new Error(`"indent" option must be a positive integer, not ${g}`);
      }
      return o.stringifyDocument(this, p);
    }
  };
  function a(h) {
    if (r.isCollection(h))
      return !0;
    throw new Error("Expected a YAML collection as document contents");
  }
  return Ks.Document = i, Ks;
}
var dt = {}, Ll;
function Pn() {
  if (Ll) return dt;
  Ll = 1;
  class t extends Error {
    constructor(c, o, f, d) {
      super(), this.name = c, this.code = f, this.message = d, this.pos = o;
    }
  }
  class e extends t {
    constructor(c, o, f) {
      super("YAMLParseError", c, o, f);
    }
  }
  class r extends t {
    constructor(c, o, f) {
      super("YAMLWarning", c, o, f);
    }
  }
  const s = (l, c) => (o) => {
    if (o.pos[0] === -1)
      return;
    o.linePos = o.pos.map((i) => c.linePos(i));
    const { line: f, col: d } = o.linePos[0];
    o.message += ` at line ${f}, column ${d}`;
    let u = d - 1, n = l.substring(c.lineStarts[f - 1], c.lineStarts[f]).replace(/[\n\r]+$/, "");
    if (u >= 60 && n.length > 80) {
      const i = Math.min(u - 39, n.length - 79);
      n = "…" + n.substring(i), u -= i - 1;
    }
    if (n.length > 80 && (n = n.substring(0, 79) + "…"), f > 1 && /^ *$/.test(n.substring(0, u))) {
      let i = l.substring(c.lineStarts[f - 2], c.lineStarts[f - 1]);
      i.length > 80 && (i = i.substring(0, 79) + `…
`), n = i + n;
    }
    if (/[^ ]/.test(n)) {
      let i = 1;
      const a = o.linePos[1];
      a && a.line === f && a.col > d && (i = Math.max(1, Math.min(a.col - d, 80 - u)));
      const h = " ".repeat(u) + "^".repeat(i);
      o.message += `:

${n}
${h}
`;
    }
  };
  return dt.YAMLError = t, dt.YAMLParseError = e, dt.YAMLWarning = r, dt.prettifyError = s, dt;
}
var di = {}, en = {}, hi = {}, pi = {}, mi = {}, ql;
function Tn() {
  if (ql) return mi;
  ql = 1;
  function t(e, { flow: r, indicator: s, next: l, offset: c, onError: o, parentIndent: f, startOnNewline: d }) {
    let u = !1, n = d, i = d, a = "", h = "", p = !1, g = !1, m = null, y = null, v = null, w = null, b = null, $ = null, S = null;
    for (const O of e)
      switch (g && (O.type !== "space" && O.type !== "newline" && O.type !== "comma" && o(O.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space"), g = !1), m && (n && O.type !== "comment" && O.type !== "newline" && o(m, "TAB_AS_INDENT", "Tabs are not allowed as indentation"), m = null), O.type) {
        case "space":
          !r && (s !== "doc-start" || l?.type !== "flow-collection") && O.source.includes("	") && (m = O), i = !0;
          break;
        case "comment": {
          i || o(O, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
          const M = O.source.substring(1) || " ";
          a ? a += h + M : a = M, h = "", n = !1;
          break;
        }
        case "newline":
          n ? a ? a += O.source : (!$ || s !== "seq-item-ind") && (u = !0) : h += O.source, n = !0, p = !0, (y || v) && (w = O), i = !0;
          break;
        case "anchor":
          y && o(O, "MULTIPLE_ANCHORS", "A node can have at most one anchor"), O.source.endsWith(":") && o(O.offset + O.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", !0), y = O, S ?? (S = O.offset), n = !1, i = !1, g = !0;
          break;
        case "tag": {
          v && o(O, "MULTIPLE_TAGS", "A node can have at most one tag"), v = O, S ?? (S = O.offset), n = !1, i = !1, g = !0;
          break;
        }
        case s:
          (y || v) && o(O, "BAD_PROP_ORDER", `Anchors and tags must be after the ${O.source} indicator`), $ && o(O, "UNEXPECTED_TOKEN", `Unexpected ${O.source} in ${r ?? "collection"}`), $ = O, n = s === "seq-item-ind" || s === "explicit-key-ind", i = !1;
          break;
        case "comma":
          if (r) {
            b && o(O, "UNEXPECTED_TOKEN", `Unexpected , in ${r}`), b = O, n = !1, i = !1;
            break;
          }
        // else fallthrough
        default:
          o(O, "UNEXPECTED_TOKEN", `Unexpected ${O.type} token`), n = !1, i = !1;
      }
    const E = e[e.length - 1], N = E ? E.offset + E.source.length : c;
    return g && l && l.type !== "space" && l.type !== "newline" && l.type !== "comma" && (l.type !== "scalar" || l.source !== "") && o(l.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space"), m && (n && m.indent <= f || l?.type === "block-map" || l?.type === "block-seq") && o(m, "TAB_AS_INDENT", "Tabs are not allowed as indentation"), {
      comma: b,
      found: $,
      spaceBefore: u,
      comment: a,
      hasNewline: p,
      anchor: y,
      tag: v,
      newlineAfterProp: w,
      end: N,
      start: S ?? N
    };
  }
  return mi.resolveProps = t, mi;
}
var gi = {}, Ml;
function ta() {
  if (Ml) return gi;
  Ml = 1;
  function t(e) {
    if (!e)
      return null;
    switch (e.type) {
      case "alias":
      case "scalar":
      case "double-quoted-scalar":
      case "single-quoted-scalar":
        if (e.source.includes(`
`))
          return !0;
        if (e.end) {
          for (const r of e.end)
            if (r.type === "newline")
              return !0;
        }
        return !1;
      case "flow-collection":
        for (const r of e.items) {
          for (const s of r.start)
            if (s.type === "newline")
              return !0;
          if (r.sep) {
            for (const s of r.sep)
              if (s.type === "newline")
                return !0;
          }
          if (t(r.key) || t(r.value))
            return !0;
        }
        return !1;
      default:
        return !0;
    }
  }
  return gi.containsNewline = t, gi;
}
var yi = {}, Dl;
function df() {
  if (Dl) return yi;
  Dl = 1;
  var t = ta();
  function e(r, s, l) {
    if (s?.type === "flow-collection") {
      const c = s.end[0];
      c.indent === r && (c.source === "]" || c.source === "}") && t.containsNewline(s) && l(c, "BAD_INDENT", "Flow end indicator should be more indented than parent", !0);
    }
  }
  return yi.flowIndentCheck = e, yi;
}
var vi = {}, jl;
function hf() {
  if (jl) return vi;
  jl = 1;
  var t = re();
  function e(r, s, l) {
    const { uniqueKeys: c } = r.options;
    if (c === !1)
      return !1;
    const o = typeof c == "function" ? c : (f, d) => f === d || t.isScalar(f) && t.isScalar(d) && f.value === d.value;
    return s.some((f) => o(f.key, l));
  }
  return vi.mapIncludes = e, vi;
}
var Fl;
function sg() {
  if (Fl) return pi;
  Fl = 1;
  var t = Ze(), e = et(), r = Tn(), s = ta(), l = df(), c = hf();
  const o = "All mapping items must start at the same column";
  function f({ composeNode: d, composeEmptyNode: u }, n, i, a, h) {
    const p = h?.nodeClass ?? e.YAMLMap, g = new p(n.schema);
    n.atRoot && (n.atRoot = !1);
    let m = i.offset, y = null;
    for (const v of i.items) {
      const { start: w, key: b, sep: $, value: S } = v, E = r.resolveProps(w, {
        indicator: "explicit-key-ind",
        next: b ?? $?.[0],
        offset: m,
        onError: a,
        parentIndent: i.indent,
        startOnNewline: !0
      }), N = !E.found;
      if (N) {
        if (b && (b.type === "block-seq" ? a(m, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key") : "indent" in b && b.indent !== i.indent && a(m, "BAD_INDENT", o)), !E.anchor && !E.tag && !$) {
          y = E.end, E.comment && (g.comment ? g.comment += `
` + E.comment : g.comment = E.comment);
          continue;
        }
        (E.newlineAfterProp || s.containsNewline(b)) && a(b ?? w[w.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
      } else E.found?.indent !== i.indent && a(m, "BAD_INDENT", o);
      n.atKey = !0;
      const O = E.end, M = b ? d(n, b, E, a) : u(n, O, w, null, E, a);
      n.schema.compat && l.flowIndentCheck(i.indent, b, a), n.atKey = !1, c.mapIncludes(n, g.items, M) && a(O, "DUPLICATE_KEY", "Map keys must be unique");
      const T = r.resolveProps($ ?? [], {
        indicator: "map-value-ind",
        next: S,
        offset: M.range[2],
        onError: a,
        parentIndent: i.indent,
        startOnNewline: !b || b.type === "block-scalar"
      });
      if (m = T.end, T.found) {
        N && (S?.type === "block-map" && !T.hasNewline && a(m, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings"), n.options.strict && E.start < T.found.offset - 1024 && a(M.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key"));
        const V = S ? d(n, S, T, a) : u(n, m, $, null, T, a);
        n.schema.compat && l.flowIndentCheck(i.indent, S, a), m = V.range[2];
        const x = new t.Pair(M, V);
        n.options.keepSourceTokens && (x.srcToken = v), g.items.push(x);
      } else {
        N && a(M.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values"), T.comment && (M.comment ? M.comment += `
` + T.comment : M.comment = T.comment);
        const V = new t.Pair(M);
        n.options.keepSourceTokens && (V.srcToken = v), g.items.push(V);
      }
    }
    return y && y < m && a(y, "IMPOSSIBLE", "Map comment with trailing content"), g.range = [i.offset, m, y ?? m], g;
  }
  return pi.resolveBlockMap = f, pi;
}
var $i = {}, Vl;
function ig() {
  if (Vl) return $i;
  Vl = 1;
  var t = tt(), e = Tn(), r = df();
  function s({ composeNode: l, composeEmptyNode: c }, o, f, d, u) {
    const n = u?.nodeClass ?? t.YAMLSeq, i = new n(o.schema);
    o.atRoot && (o.atRoot = !1), o.atKey && (o.atKey = !1);
    let a = f.offset, h = null;
    for (const { start: p, value: g } of f.items) {
      const m = e.resolveProps(p, {
        indicator: "seq-item-ind",
        next: g,
        offset: a,
        onError: d,
        parentIndent: f.indent,
        startOnNewline: !0
      });
      if (!m.found)
        if (m.anchor || m.tag || g)
          g && g.type === "block-seq" ? d(m.end, "BAD_INDENT", "All sequence items must start at the same column") : d(a, "MISSING_CHAR", "Sequence item without - indicator");
        else {
          h = m.end, m.comment && (i.comment = m.comment);
          continue;
        }
      const y = g ? l(o, g, m, d) : c(o, m.end, p, null, m, d);
      o.schema.compat && r.flowIndentCheck(f.indent, g, d), a = y.range[2], i.items.push(y);
    }
    return i.range = [f.offset, a, h ?? a], i;
  }
  return $i.resolveBlockSeq = s, $i;
}
var wi = {}, bi = {}, Ul;
function Kt() {
  if (Ul) return bi;
  Ul = 1;
  function t(e, r, s, l) {
    let c = "";
    if (e) {
      let o = !1, f = "";
      for (const d of e) {
        const { source: u, type: n } = d;
        switch (n) {
          case "space":
            o = !0;
            break;
          case "comment": {
            s && !o && l(d, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const i = u.substring(1) || " ";
            c ? c += f + i : c = i, f = "";
            break;
          }
          case "newline":
            c && (f += u), o = !0;
            break;
          default:
            l(d, "UNEXPECTED_TOKEN", `Unexpected ${n} at node end`);
        }
        r += u.length;
      }
    }
    return { comment: c, offset: r };
  }
  return bi.resolveEnd = t, bi;
}
var Bl;
function ag() {
  if (Bl) return wi;
  Bl = 1;
  var t = re(), e = Ze(), r = et(), s = tt(), l = Kt(), c = Tn(), o = ta(), f = hf();
  const d = "Block collections are not allowed within flow collections", u = (i) => i && (i.type === "block-map" || i.type === "block-seq");
  function n({ composeNode: i, composeEmptyNode: a }, h, p, g, m) {
    const y = p.start.source === "{", v = y ? "flow map" : "flow sequence", w = m?.nodeClass ?? (y ? r.YAMLMap : s.YAMLSeq), b = new w(h.schema);
    b.flow = !0;
    const $ = h.atRoot;
    $ && (h.atRoot = !1), h.atKey && (h.atKey = !1);
    let S = p.offset + p.start.source.length;
    for (let T = 0; T < p.items.length; ++T) {
      const V = p.items[T], { start: x, key: C, sep: j, value: z } = V, F = c.resolveProps(x, {
        flow: v,
        indicator: "explicit-key-ind",
        next: C ?? j?.[0],
        offset: S,
        onError: g,
        parentIndent: p.indent,
        startOnNewline: !1
      });
      if (!F.found) {
        if (!F.anchor && !F.tag && !j && !z) {
          T === 0 && F.comma ? g(F.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${v}`) : T < p.items.length - 1 && g(F.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${v}`), F.comment && (b.comment ? b.comment += `
` + F.comment : b.comment = F.comment), S = F.end;
          continue;
        }
        !y && h.options.strict && o.containsNewline(C) && g(
          C,
          // checked by containsNewline()
          "MULTILINE_IMPLICIT_KEY",
          "Implicit keys of flow sequence pairs need to be on a single line"
        );
      }
      if (T === 0)
        F.comma && g(F.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${v}`);
      else if (F.comma || g(F.start, "MISSING_CHAR", `Missing , between ${v} items`), F.comment) {
        let B = "";
        e: for (const K of x)
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
          t.isPair(K) && (K = K.value ?? K.key), K.comment ? K.comment += `
` + B : K.comment = B, F.comment = F.comment.substring(B.length + 1);
        }
      }
      if (!y && !j && !F.found) {
        const B = z ? i(h, z, F, g) : a(h, F.end, j, null, F, g);
        b.items.push(B), S = B.range[2], u(z) && g(B.range, "BLOCK_IN_FLOW", d);
      } else {
        h.atKey = !0;
        const B = F.end, K = C ? i(h, C, F, g) : a(h, B, x, null, F, g);
        u(C) && g(K.range, "BLOCK_IN_FLOW", d), h.atKey = !1;
        const q = c.resolveProps(j ?? [], {
          flow: v,
          indicator: "map-value-ind",
          next: z,
          offset: K.range[2],
          onError: g,
          parentIndent: p.indent,
          startOnNewline: !1
        });
        if (q.found) {
          if (!y && !F.found && h.options.strict) {
            if (j)
              for (const I of j) {
                if (I === q.found)
                  break;
                if (I.type === "newline") {
                  g(I, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                  break;
                }
              }
            F.start < q.found.offset - 1024 && g(q.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
          }
        } else z && ("source" in z && z.source && z.source[0] === ":" ? g(z, "MISSING_CHAR", `Missing space after : in ${v}`) : g(q.start, "MISSING_CHAR", `Missing , or : between ${v} items`));
        const A = z ? i(h, z, q, g) : q.found ? a(h, q.end, j, null, q, g) : null;
        A ? u(z) && g(A.range, "BLOCK_IN_FLOW", d) : q.comment && (K.comment ? K.comment += `
` + q.comment : K.comment = q.comment);
        const L = new e.Pair(K, A);
        if (h.options.keepSourceTokens && (L.srcToken = V), y) {
          const I = b;
          f.mapIncludes(h, I.items, K) && g(B, "DUPLICATE_KEY", "Map keys must be unique"), I.items.push(L);
        } else {
          const I = new r.YAMLMap(h.schema);
          I.flow = !0, I.items.push(L);
          const _ = (A ?? K).range;
          I.range = [K.range[0], _[1], _[2]], b.items.push(I);
        }
        S = A ? A.range[2] : q.end;
      }
    }
    const E = y ? "}" : "]", [N, ...O] = p.end;
    let M = S;
    if (N && N.source === E)
      M = N.offset + N.source.length;
    else {
      const T = v[0].toUpperCase() + v.substring(1), V = $ ? `${T} must end with a ${E}` : `${T} in block collection must be sufficiently indented and end with a ${E}`;
      g(S, $ ? "MISSING_CHAR" : "BAD_INDENT", V), N && N.source.length !== 1 && O.unshift(N);
    }
    if (O.length > 0) {
      const T = l.resolveEnd(O, M, h.options.strict, g);
      T.comment && (b.comment ? b.comment += `
` + T.comment : b.comment = T.comment), b.range = [p.offset, M, T.offset];
    } else
      b.range = [p.offset, M, M];
    return b;
  }
  return wi.resolveFlowCollection = n, wi;
}
var Kl;
function og() {
  if (Kl) return hi;
  Kl = 1;
  var t = re(), e = le(), r = et(), s = tt(), l = sg(), c = ig(), o = ag();
  function f(u, n, i, a, h, p) {
    const g = i.type === "block-map" ? l.resolveBlockMap(u, n, i, a, p) : i.type === "block-seq" ? c.resolveBlockSeq(u, n, i, a, p) : o.resolveFlowCollection(u, n, i, a, p), m = g.constructor;
    return h === "!" || h === m.tagName ? (g.tag = m.tagName, g) : (h && (g.tag = h), g);
  }
  function d(u, n, i, a, h) {
    const p = a.tag, g = p ? n.directives.tagName(p.source, ($) => h(p, "TAG_RESOLVE_FAILED", $)) : null;
    if (i.type === "block-seq") {
      const { anchor: $, newlineAfterProp: S } = a, E = $ && p ? $.offset > p.offset ? $ : p : $ ?? p;
      E && (!S || S.offset < E.offset) && h(E, "MISSING_CHAR", "Missing newline after block sequence props");
    }
    const m = i.type === "block-map" ? "map" : i.type === "block-seq" ? "seq" : i.start.source === "{" ? "map" : "seq";
    if (!p || !g || g === "!" || g === r.YAMLMap.tagName && m === "map" || g === s.YAMLSeq.tagName && m === "seq")
      return f(u, n, i, h, g);
    let y = n.schema.tags.find(($) => $.tag === g && $.collection === m);
    if (!y) {
      const $ = n.schema.knownTags[g];
      if ($ && $.collection === m)
        n.schema.tags.push(Object.assign({}, $, { default: !1 })), y = $;
      else
        return $ ? h(p, "BAD_COLLECTION_TYPE", `${$.tag} used for ${m} collection, but expects ${$.collection ?? "scalar"}`, !0) : h(p, "TAG_RESOLVE_FAILED", `Unresolved tag: ${g}`, !0), f(u, n, i, h, g);
    }
    const v = f(u, n, i, h, g, y), w = y.resolve?.(v, ($) => h(p, "TAG_RESOLVE_FAILED", $), n.options) ?? v, b = t.isNode(w) ? w : new e.Scalar(w);
    return b.range = v.range, b.tag = g, y?.format && (b.format = y.format), b;
  }
  return hi.composeCollection = d, hi;
}
var Si = {}, Ei = {}, xl;
function pf() {
  if (xl) return Ei;
  xl = 1;
  var t = le();
  function e(l, c, o) {
    const f = c.offset, d = r(c, l.options.strict, o);
    if (!d)
      return { value: "", type: null, comment: "", range: [f, f, f] };
    const u = d.mode === ">" ? t.Scalar.BLOCK_FOLDED : t.Scalar.BLOCK_LITERAL, n = c.source ? s(c.source) : [];
    let i = n.length;
    for (let w = n.length - 1; w >= 0; --w) {
      const b = n[w][1];
      if (b === "" || b === "\r")
        i = w;
      else
        break;
    }
    if (i === 0) {
      const w = d.chomp === "+" && n.length > 0 ? `
`.repeat(Math.max(1, n.length - 1)) : "";
      let b = f + d.length;
      return c.source && (b += c.source.length), { value: w, type: u, comment: d.comment, range: [f, b, b] };
    }
    let a = c.indent + d.indent, h = c.offset + d.length, p = 0;
    for (let w = 0; w < i; ++w) {
      const [b, $] = n[w];
      if ($ === "" || $ === "\r")
        d.indent === 0 && b.length > a && (a = b.length);
      else {
        b.length < a && o(h + b.length, "MISSING_CHAR", "Block scalars with more-indented leading empty lines must use an explicit indentation indicator"), d.indent === 0 && (a = b.length), p = w, a === 0 && !l.atRoot && o(h, "BAD_INDENT", "Block scalar values in collections must be indented");
        break;
      }
      h += b.length + $.length + 1;
    }
    for (let w = n.length - 1; w >= i; --w)
      n[w][0].length > a && (i = w + 1);
    let g = "", m = "", y = !1;
    for (let w = 0; w < p; ++w)
      g += n[w][0].slice(a) + `
`;
    for (let w = p; w < i; ++w) {
      let [b, $] = n[w];
      h += b.length + $.length + 1;
      const S = $[$.length - 1] === "\r";
      if (S && ($ = $.slice(0, -1)), $ && b.length < a) {
        const N = `Block scalar lines must not be less indented than their ${d.indent ? "explicit indentation indicator" : "first line"}`;
        o(h - $.length - (S ? 2 : 1), "BAD_INDENT", N), b = "";
      }
      u === t.Scalar.BLOCK_LITERAL ? (g += m + b.slice(a) + $, m = `
`) : b.length > a || $[0] === "	" ? (m === " " ? m = `
` : !y && m === `
` && (m = `

`), g += m + b.slice(a) + $, m = `
`, y = !0) : $ === "" ? m === `
` ? g += `
` : m = `
` : (g += m + $, m = " ", y = !1);
    }
    switch (d.chomp) {
      case "-":
        break;
      case "+":
        for (let w = i; w < n.length; ++w)
          g += `
` + n[w][0].slice(a);
        g[g.length - 1] !== `
` && (g += `
`);
        break;
      default:
        g += `
`;
    }
    const v = f + d.length + c.source.length;
    return { value: g, type: u, comment: d.comment, range: [f, v, v] };
  }
  function r({ offset: l, props: c }, o, f) {
    if (c[0].type !== "block-scalar-header")
      return f(c[0], "IMPOSSIBLE", "Block scalar header not found"), null;
    const { source: d } = c[0], u = d[0];
    let n = 0, i = "", a = -1;
    for (let m = 1; m < d.length; ++m) {
      const y = d[m];
      if (!i && (y === "-" || y === "+"))
        i = y;
      else {
        const v = Number(y);
        !n && v ? n = v : a === -1 && (a = l + m);
      }
    }
    a !== -1 && f(a, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${d}`);
    let h = !1, p = "", g = d.length;
    for (let m = 1; m < c.length; ++m) {
      const y = c[m];
      switch (y.type) {
        case "space":
          h = !0;
        // fallthrough
        case "newline":
          g += y.source.length;
          break;
        case "comment":
          o && !h && f(y, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters"), g += y.source.length, p = y.source.substring(1);
          break;
        case "error":
          f(y, "UNEXPECTED_TOKEN", y.message), g += y.source.length;
          break;
        /* istanbul ignore next should not happen */
        default: {
          const v = `Unexpected token in block scalar header: ${y.type}`;
          f(y, "UNEXPECTED_TOKEN", v);
          const w = y.source;
          w && typeof w == "string" && (g += w.length);
        }
      }
    }
    return { mode: u, indent: n, chomp: i, comment: p, length: g };
  }
  function s(l) {
    const c = l.split(/\n( *)/), o = c[0], f = o.match(/^( *)/), u = [f?.[1] ? [f[1], o.slice(f[1].length)] : ["", o]];
    for (let n = 1; n < c.length; n += 2)
      u.push([c[n], c[n + 1]]);
    return u;
  }
  return Ei.resolveBlockScalar = e, Ei;
}
var _i = {}, zl;
function mf() {
  if (zl) return _i;
  zl = 1;
  var t = le(), e = Kt();
  function r(n, i, a) {
    const { offset: h, type: p, source: g, end: m } = n;
    let y, v;
    const w = (S, E, N) => a(h + S, E, N);
    switch (p) {
      case "scalar":
        y = t.Scalar.PLAIN, v = s(g, w);
        break;
      case "single-quoted-scalar":
        y = t.Scalar.QUOTE_SINGLE, v = l(g, w);
        break;
      case "double-quoted-scalar":
        y = t.Scalar.QUOTE_DOUBLE, v = o(g, w);
        break;
      /* istanbul ignore next should not happen */
      default:
        return a(n, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${p}`), {
          value: "",
          type: null,
          comment: "",
          range: [h, h + g.length, h + g.length]
        };
    }
    const b = h + g.length, $ = e.resolveEnd(m, b, i, a);
    return {
      value: v,
      type: y,
      comment: $.comment,
      range: [h, b, $.offset]
    };
  }
  function s(n, i) {
    let a = "";
    switch (n[0]) {
      /* istanbul ignore next should not happen */
      case "	":
        a = "a tab character";
        break;
      case ",":
        a = "flow indicator character ,";
        break;
      case "%":
        a = "directive indicator character %";
        break;
      case "|":
      case ">": {
        a = `block scalar indicator ${n[0]}`;
        break;
      }
      case "@":
      case "`": {
        a = `reserved character ${n[0]}`;
        break;
      }
    }
    return a && i(0, "BAD_SCALAR_START", `Plain value cannot start with ${a}`), c(n);
  }
  function l(n, i) {
    return (n[n.length - 1] !== "'" || n.length === 1) && i(n.length, "MISSING_CHAR", "Missing closing 'quote"), c(n.slice(1, -1)).replace(/''/g, "'");
  }
  function c(n) {
    let i, a;
    try {
      i = new RegExp(`(.*?)(?<![ 	])[ 	]*\r?
`, "sy"), a = new RegExp(`[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`, "sy");
    } catch {
      i = /(.*?)[ \t]*\r?\n/sy, a = /[ \t]*(.*?)[ \t]*\r?\n/sy;
    }
    let h = i.exec(n);
    if (!h)
      return n;
    let p = h[1], g = " ", m = i.lastIndex;
    for (a.lastIndex = m; h = a.exec(n); )
      h[1] === "" ? g === `
` ? p += g : g = `
` : (p += g + h[1], g = " "), m = a.lastIndex;
    const y = /[ \t]*(.*)/sy;
    return y.lastIndex = m, h = y.exec(n), p + g + (h?.[1] ?? "");
  }
  function o(n, i) {
    let a = "";
    for (let h = 1; h < n.length - 1; ++h) {
      const p = n[h];
      if (!(p === "\r" && n[h + 1] === `
`))
        if (p === `
`) {
          const { fold: g, offset: m } = f(n, h);
          a += g, h = m;
        } else if (p === "\\") {
          let g = n[++h];
          const m = d[g];
          if (m)
            a += m;
          else if (g === `
`)
            for (g = n[h + 1]; g === " " || g === "	"; )
              g = n[++h + 1];
          else if (g === "\r" && n[h + 1] === `
`)
            for (g = n[++h + 1]; g === " " || g === "	"; )
              g = n[++h + 1];
          else if (g === "x" || g === "u" || g === "U") {
            const y = { x: 2, u: 4, U: 8 }[g];
            a += u(n, h + 1, y, i), h += y;
          } else {
            const y = n.substr(h - 1, 2);
            i(h - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${y}`), a += y;
          }
        } else if (p === " " || p === "	") {
          const g = h;
          let m = n[h + 1];
          for (; m === " " || m === "	"; )
            m = n[++h + 1];
          m !== `
` && !(m === "\r" && n[h + 2] === `
`) && (a += h > g ? n.slice(g, h + 1) : p);
        } else
          a += p;
    }
    return (n[n.length - 1] !== '"' || n.length === 1) && i(n.length, "MISSING_CHAR", 'Missing closing "quote'), a;
  }
  function f(n, i) {
    let a = "", h = n[i + 1];
    for (; (h === " " || h === "	" || h === `
` || h === "\r") && !(h === "\r" && n[i + 2] !== `
`); )
      h === `
` && (a += `
`), i += 1, h = n[i + 1];
    return a || (a = " "), { fold: a, offset: i };
  }
  const d = {
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
  function u(n, i, a, h) {
    const p = n.substr(i, a), m = p.length === a && /^[0-9a-fA-F]+$/.test(p) ? parseInt(p, 16) : NaN;
    if (isNaN(m)) {
      const y = n.substr(i - 2, a + 2);
      return h(i - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${y}`), y;
    }
    return String.fromCodePoint(m);
  }
  return _i.resolveFlowScalar = r, _i;
}
var Gl;
function cg() {
  if (Gl) return Si;
  Gl = 1;
  var t = re(), e = le(), r = pf(), s = mf();
  function l(f, d, u, n) {
    const { value: i, type: a, comment: h, range: p } = d.type === "block-scalar" ? r.resolveBlockScalar(f, d, n) : s.resolveFlowScalar(d, f.options.strict, n), g = u ? f.directives.tagName(u.source, (v) => n(u, "TAG_RESOLVE_FAILED", v)) : null;
    let m;
    f.options.stringKeys && f.atKey ? m = f.schema[t.SCALAR] : g ? m = c(f.schema, i, g, u, n) : d.type === "scalar" ? m = o(f, i, d, n) : m = f.schema[t.SCALAR];
    let y;
    try {
      const v = m.resolve(i, (w) => n(u ?? d, "TAG_RESOLVE_FAILED", w), f.options);
      y = t.isScalar(v) ? v : new e.Scalar(v);
    } catch (v) {
      const w = v instanceof Error ? v.message : String(v);
      n(u ?? d, "TAG_RESOLVE_FAILED", w), y = new e.Scalar(i);
    }
    return y.range = p, y.source = i, a && (y.type = a), g && (y.tag = g), m.format && (y.format = m.format), h && (y.comment = h), y;
  }
  function c(f, d, u, n, i) {
    if (u === "!")
      return f[t.SCALAR];
    const a = [];
    for (const p of f.tags)
      if (!p.collection && p.tag === u)
        if (p.default && p.test)
          a.push(p);
        else
          return p;
    for (const p of a)
      if (p.test?.test(d))
        return p;
    const h = f.knownTags[u];
    return h && !h.collection ? (f.tags.push(Object.assign({}, h, { default: !1, test: void 0 })), h) : (i(n, "TAG_RESOLVE_FAILED", `Unresolved tag: ${u}`, u !== "tag:yaml.org,2002:str"), f[t.SCALAR]);
  }
  function o({ atKey: f, directives: d, schema: u }, n, i, a) {
    const h = u.tags.find((p) => (p.default === !0 || f && p.default === "key") && p.test?.test(n)) || u[t.SCALAR];
    if (u.compat) {
      const p = u.compat.find((g) => g.default && g.test?.test(n)) ?? u[t.SCALAR];
      if (h.tag !== p.tag) {
        const g = d.tagString(h.tag), m = d.tagString(p.tag), y = `Value may be parsed as either ${g} or ${m}`;
        a(i, "TAG_RESOLVE_FAILED", y, !0);
      }
    }
    return h;
  }
  return Si.composeScalar = l, Si;
}
var Ni = {}, Yl;
function lg() {
  if (Yl) return Ni;
  Yl = 1;
  function t(e, r, s) {
    if (r) {
      s ?? (s = r.length);
      for (let l = s - 1; l >= 0; --l) {
        let c = r[l];
        switch (c.type) {
          case "space":
          case "comment":
          case "newline":
            e -= c.source.length;
            continue;
        }
        for (c = r[++l]; c?.type === "space"; )
          e += c.source.length, c = r[++l];
        break;
      }
    }
    return e;
  }
  return Ni.emptyScalarPosition = t, Ni;
}
var Hl;
function ug() {
  if (Hl) return en;
  Hl = 1;
  var t = En(), e = re(), r = og(), s = cg(), l = Kt(), c = lg();
  const o = { composeNode: f, composeEmptyNode: d };
  function f(n, i, a, h) {
    const p = n.atKey, { spaceBefore: g, comment: m, anchor: y, tag: v } = a;
    let w, b = !0;
    switch (i.type) {
      case "alias":
        w = u(n, i, h), (y || v) && h(i, "ALIAS_PROPS", "An alias node must not specify any properties");
        break;
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
      case "block-scalar":
        w = s.composeScalar(n, i, v, h), y && (w.anchor = y.source.substring(1));
        break;
      case "block-map":
      case "block-seq":
      case "flow-collection":
        w = r.composeCollection(o, n, i, a, h), y && (w.anchor = y.source.substring(1));
        break;
      default: {
        const $ = i.type === "error" ? i.message : `Unsupported token (type: ${i.type})`;
        h(i, "UNEXPECTED_TOKEN", $), w = d(n, i.offset, void 0, null, a, h), b = !1;
      }
    }
    return y && w.anchor === "" && h(y, "BAD_ALIAS", "Anchor cannot be an empty string"), p && n.options.stringKeys && (!e.isScalar(w) || typeof w.value != "string" || w.tag && w.tag !== "tag:yaml.org,2002:str") && h(v ?? i, "NON_STRING_KEY", "With stringKeys, all keys must be strings"), g && (w.spaceBefore = !0), m && (i.type === "scalar" && i.source === "" ? w.comment = m : w.commentBefore = m), n.options.keepSourceTokens && b && (w.srcToken = i), w;
  }
  function d(n, i, a, h, { spaceBefore: p, comment: g, anchor: m, tag: y, end: v }, w) {
    const b = {
      type: "scalar",
      offset: c.emptyScalarPosition(i, a, h),
      indent: -1,
      source: ""
    }, $ = s.composeScalar(n, b, y, w);
    return m && ($.anchor = m.source.substring(1), $.anchor === "" && w(m, "BAD_ALIAS", "Anchor cannot be an empty string")), p && ($.spaceBefore = !0), g && ($.comment = g, $.range[2] = v), $;
  }
  function u({ options: n }, { offset: i, source: a, end: h }, p) {
    const g = new t.Alias(a.substring(1));
    g.source === "" && p(i, "BAD_ALIAS", "Alias cannot be an empty string"), g.source.endsWith(":") && p(i + a.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", !0);
    const m = i + a.length, y = l.resolveEnd(h, m, n.strict, p);
    return g.range = [i, m, y.offset], y.comment && (g.comment = y.comment), g;
  }
  return en.composeEmptyNode = d, en.composeNode = f, en;
}
var Jl;
function fg() {
  if (Jl) return di;
  Jl = 1;
  var t = In(), e = ug(), r = Kt(), s = Tn();
  function l(c, o, { offset: f, start: d, value: u, end: n }, i) {
    const a = Object.assign({ _directives: o }, c), h = new t.Document(void 0, a), p = {
      atKey: !1,
      atRoot: !0,
      directives: h.directives,
      options: h.options,
      schema: h.schema
    }, g = s.resolveProps(d, {
      indicator: "doc-start",
      next: u ?? n?.[0],
      offset: f,
      onError: i,
      parentIndent: 0,
      startOnNewline: !0
    });
    g.found && (h.directives.docStart = !0, u && (u.type === "block-map" || u.type === "block-seq") && !g.hasNewline && i(g.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker")), h.contents = u ? e.composeNode(p, u, g, i) : e.composeEmptyNode(p, g.end, d, null, g, i);
    const m = h.contents.range[2], y = r.resolveEnd(n, m, !1, i);
    return y.comment && (h.comment = y.comment), h.range = [f, m, y.offset], h;
  }
  return di.composeDoc = l, di;
}
var Xl;
function gf() {
  if (Xl) return Us;
  Xl = 1;
  var t = qi, e = Ju(), r = In(), s = Pn(), l = re(), c = fg(), o = Kt();
  function f(n) {
    if (typeof n == "number")
      return [n, n + 1];
    if (Array.isArray(n))
      return n.length === 2 ? n : [n[0], n[1]];
    const { offset: i, source: a } = n;
    return [i, i + (typeof a == "string" ? a.length : 1)];
  }
  function d(n) {
    let i = "", a = !1, h = !1;
    for (let p = 0; p < n.length; ++p) {
      const g = n[p];
      switch (g[0]) {
        case "#":
          i += (i === "" ? "" : h ? `

` : `
`) + (g.substring(1) || " "), a = !0, h = !1;
          break;
        case "%":
          n[p + 1]?.[0] !== "#" && (p += 1), a = !1;
          break;
        default:
          a || (h = !0), a = !1;
      }
    }
    return { comment: i, afterEmptyLine: h };
  }
  class u {
    constructor(i = {}) {
      this.doc = null, this.atDirectives = !1, this.prelude = [], this.errors = [], this.warnings = [], this.onError = (a, h, p, g) => {
        const m = f(a);
        g ? this.warnings.push(new s.YAMLWarning(m, h, p)) : this.errors.push(new s.YAMLParseError(m, h, p));
      }, this.directives = new e.Directives({ version: i.version || "1.2" }), this.options = i;
    }
    decorate(i, a) {
      const { comment: h, afterEmptyLine: p } = d(this.prelude);
      if (h) {
        const g = i.contents;
        if (a)
          i.comment = i.comment ? `${i.comment}
${h}` : h;
        else if (p || i.directives.docStart || !g)
          i.commentBefore = h;
        else if (l.isCollection(g) && !g.flow && g.items.length > 0) {
          let m = g.items[0];
          l.isPair(m) && (m = m.key);
          const y = m.commentBefore;
          m.commentBefore = y ? `${h}
${y}` : h;
        } else {
          const m = g.commentBefore;
          g.commentBefore = m ? `${h}
${m}` : h;
        }
      }
      a ? (Array.prototype.push.apply(i.errors, this.errors), Array.prototype.push.apply(i.warnings, this.warnings)) : (i.errors = this.errors, i.warnings = this.warnings), this.prelude = [], this.errors = [], this.warnings = [];
    }
    /**
     * Current stream status information.
     *
     * Mostly useful at the end of input for an empty stream.
     */
    streamInfo() {
      return {
        comment: d(this.prelude).comment,
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
    *compose(i, a = !1, h = -1) {
      for (const p of i)
        yield* this.next(p);
      yield* this.end(a, h);
    }
    /** Advance the composer by one CST token. */
    *next(i) {
      switch (t.env.LOG_STREAM && console.dir(i, { depth: null }), i.type) {
        case "directive":
          this.directives.add(i.source, (a, h, p) => {
            const g = f(i);
            g[0] += a, this.onError(g, "BAD_DIRECTIVE", h, p);
          }), this.prelude.push(i.source), this.atDirectives = !0;
          break;
        case "document": {
          const a = c.composeDoc(this.options, this.directives, i, this.onError);
          this.atDirectives && !a.directives.docStart && this.onError(i, "MISSING_CHAR", "Missing directives-end/doc-start indicator line"), this.decorate(a, !1), this.doc && (yield this.doc), this.doc = a, this.atDirectives = !1;
          break;
        }
        case "byte-order-mark":
        case "space":
          break;
        case "comment":
        case "newline":
          this.prelude.push(i.source);
          break;
        case "error": {
          const a = i.source ? `${i.message}: ${JSON.stringify(i.source)}` : i.message, h = new s.YAMLParseError(f(i), "UNEXPECTED_TOKEN", a);
          this.atDirectives || !this.doc ? this.errors.push(h) : this.doc.errors.push(h);
          break;
        }
        case "doc-end": {
          if (!this.doc) {
            const h = "Unexpected doc-end without preceding document";
            this.errors.push(new s.YAMLParseError(f(i), "UNEXPECTED_TOKEN", h));
            break;
          }
          this.doc.directives.docEnd = !0;
          const a = o.resolveEnd(i.end, i.offset + i.source.length, this.doc.options.strict, this.onError);
          if (this.decorate(this.doc, !0), a.comment) {
            const h = this.doc.comment;
            this.doc.comment = h ? `${h}
${a.comment}` : a.comment;
          }
          this.doc.range[2] = a.offset;
          break;
        }
        default:
          this.errors.push(new s.YAMLParseError(f(i), "UNEXPECTED_TOKEN", `Unsupported token ${i.type}`));
      }
    }
    /**
     * Call at end of input to yield any remaining document.
     *
     * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
     * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
     */
    *end(i = !1, a = -1) {
      if (this.doc)
        this.decorate(this.doc, !0), yield this.doc, this.doc = null;
      else if (i) {
        const h = Object.assign({ _directives: this.directives }, this.options), p = new r.Document(void 0, h);
        this.atDirectives && this.onError(a, "MISSING_CHAR", "Missing directives-end indicator line"), p.range = [0, a, a], this.decorate(p, !1), yield p;
      }
    }
  }
  return Us.Composer = u, Us;
}
var ve = {}, kt = {}, Wl;
function dg() {
  if (Wl) return kt;
  Wl = 1;
  var t = pf(), e = mf(), r = Pn(), s = Rn();
  function l(n, i = !0, a) {
    if (n) {
      const h = (p, g, m) => {
        const y = typeof p == "number" ? p : Array.isArray(p) ? p[0] : p.offset;
        if (a)
          a(y, g, m);
        else
          throw new r.YAMLParseError([y, y + 1], g, m);
      };
      switch (n.type) {
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return e.resolveFlowScalar(n, i, h);
        case "block-scalar":
          return t.resolveBlockScalar({ options: { strict: i } }, n, h);
      }
    }
    return null;
  }
  function c(n, i) {
    const { implicitKey: a = !1, indent: h, inFlow: p = !1, offset: g = -1, type: m = "PLAIN" } = i, y = s.stringifyString({ type: m, value: n }, {
      implicitKey: a,
      indent: h > 0 ? " ".repeat(h) : "",
      inFlow: p,
      options: { blockQuote: !0, lineWidth: -1 }
    }), v = i.end ?? [
      { type: "newline", offset: -1, indent: h, source: `
` }
    ];
    switch (y[0]) {
      case "|":
      case ">": {
        const w = y.indexOf(`
`), b = y.substring(0, w), $ = y.substring(w + 1) + `
`, S = [
          { type: "block-scalar-header", offset: g, indent: h, source: b }
        ];
        return d(S, v) || S.push({ type: "newline", offset: -1, indent: h, source: `
` }), { type: "block-scalar", offset: g, indent: h, props: S, source: $ };
      }
      case '"':
        return { type: "double-quoted-scalar", offset: g, indent: h, source: y, end: v };
      case "'":
        return { type: "single-quoted-scalar", offset: g, indent: h, source: y, end: v };
      default:
        return { type: "scalar", offset: g, indent: h, source: y, end: v };
    }
  }
  function o(n, i, a = {}) {
    let { afterKey: h = !1, implicitKey: p = !1, inFlow: g = !1, type: m } = a, y = "indent" in n ? n.indent : null;
    if (h && typeof y == "number" && (y += 2), !m)
      switch (n.type) {
        case "single-quoted-scalar":
          m = "QUOTE_SINGLE";
          break;
        case "double-quoted-scalar":
          m = "QUOTE_DOUBLE";
          break;
        case "block-scalar": {
          const w = n.props[0];
          if (w.type !== "block-scalar-header")
            throw new Error("Invalid block scalar header");
          m = w.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
          break;
        }
        default:
          m = "PLAIN";
      }
    const v = s.stringifyString({ type: m, value: i }, {
      implicitKey: p || y === null,
      indent: y !== null && y > 0 ? " ".repeat(y) : "",
      inFlow: g,
      options: { blockQuote: !0, lineWidth: -1 }
    });
    switch (v[0]) {
      case "|":
      case ">":
        f(n, v);
        break;
      case '"':
        u(n, v, "double-quoted-scalar");
        break;
      case "'":
        u(n, v, "single-quoted-scalar");
        break;
      default:
        u(n, v, "scalar");
    }
  }
  function f(n, i) {
    const a = i.indexOf(`
`), h = i.substring(0, a), p = i.substring(a + 1) + `
`;
    if (n.type === "block-scalar") {
      const g = n.props[0];
      if (g.type !== "block-scalar-header")
        throw new Error("Invalid block scalar header");
      g.source = h, n.source = p;
    } else {
      const { offset: g } = n, m = "indent" in n ? n.indent : -1, y = [
        { type: "block-scalar-header", offset: g, indent: m, source: h }
      ];
      d(y, "end" in n ? n.end : void 0) || y.push({ type: "newline", offset: -1, indent: m, source: `
` });
      for (const v of Object.keys(n))
        v !== "type" && v !== "offset" && delete n[v];
      Object.assign(n, { type: "block-scalar", indent: m, props: y, source: p });
    }
  }
  function d(n, i) {
    if (i)
      for (const a of i)
        switch (a.type) {
          case "space":
          case "comment":
            n.push(a);
            break;
          case "newline":
            return n.push(a), !0;
        }
    return !1;
  }
  function u(n, i, a) {
    switch (n.type) {
      case "scalar":
      case "double-quoted-scalar":
      case "single-quoted-scalar":
        n.type = a, n.source = i;
        break;
      case "block-scalar": {
        const h = n.props.slice(1);
        let p = i.length;
        n.props[0].type === "block-scalar-header" && (p -= n.props[0].source.length);
        for (const g of h)
          g.offset += p;
        delete n.props, Object.assign(n, { type: a, source: i, end: h });
        break;
      }
      case "block-map":
      case "block-seq": {
        const p = { type: "newline", offset: n.offset + i.length, indent: n.indent, source: `
` };
        delete n.items, Object.assign(n, { type: a, source: i, end: [p] });
        break;
      }
      default: {
        const h = "indent" in n ? n.indent : -1, p = "end" in n && Array.isArray(n.end) ? n.end.filter((g) => g.type === "space" || g.type === "comment" || g.type === "newline") : [];
        for (const g of Object.keys(n))
          g !== "type" && g !== "offset" && delete n[g];
        Object.assign(n, { type: a, indent: h, source: i, end: p });
      }
    }
  }
  return kt.createScalarToken = c, kt.resolveAsScalar = l, kt.setScalarValue = o, kt;
}
var Ri = {}, Ql;
function hg() {
  if (Ql) return Ri;
  Ql = 1;
  const t = (s) => "type" in s ? e(s) : r(s);
  function e(s) {
    switch (s.type) {
      case "block-scalar": {
        let l = "";
        for (const c of s.props)
          l += e(c);
        return l + s.source;
      }
      case "block-map":
      case "block-seq": {
        let l = "";
        for (const c of s.items)
          l += r(c);
        return l;
      }
      case "flow-collection": {
        let l = s.start.source;
        for (const c of s.items)
          l += r(c);
        for (const c of s.end)
          l += c.source;
        return l;
      }
      case "document": {
        let l = r(s);
        if (s.end)
          for (const c of s.end)
            l += c.source;
        return l;
      }
      default: {
        let l = s.source;
        if ("end" in s && s.end)
          for (const c of s.end)
            l += c.source;
        return l;
      }
    }
  }
  function r({ start: s, key: l, sep: c, value: o }) {
    let f = "";
    for (const d of s)
      f += d.source;
    if (l && (f += e(l)), c)
      for (const d of c)
        f += d.source;
    return o && (f += e(o)), f;
  }
  return Ri.stringify = t, Ri;
}
var Ai = {}, Zl;
function pg() {
  if (Zl) return Ai;
  Zl = 1;
  const t = Symbol("break visit"), e = Symbol("skip children"), r = Symbol("remove item");
  function s(c, o) {
    "type" in c && c.type === "document" && (c = { start: c.start, value: c.value }), l(Object.freeze([]), c, o);
  }
  s.BREAK = t, s.SKIP = e, s.REMOVE = r, s.itemAtPath = (c, o) => {
    let f = c;
    for (const [d, u] of o) {
      const n = f?.[d];
      if (n && "items" in n)
        f = n.items[u];
      else
        return;
    }
    return f;
  }, s.parentCollection = (c, o) => {
    const f = s.itemAtPath(c, o.slice(0, -1)), d = o[o.length - 1][0], u = f?.[d];
    if (u && "items" in u)
      return u;
    throw new Error("Parent collection not found");
  };
  function l(c, o, f) {
    let d = f(o, c);
    if (typeof d == "symbol")
      return d;
    for (const u of ["key", "value"]) {
      const n = o[u];
      if (n && "items" in n) {
        for (let i = 0; i < n.items.length; ++i) {
          const a = l(Object.freeze(c.concat([[u, i]])), n.items[i], f);
          if (typeof a == "number")
            i = a - 1;
          else {
            if (a === t)
              return t;
            a === r && (n.items.splice(i, 1), i -= 1);
          }
        }
        typeof d == "function" && u === "key" && (d = d(o, c));
      }
    }
    return typeof d == "function" ? d(o, c) : d;
  }
  return Ai.visit = s, Ai;
}
var eu;
function ra() {
  if (eu) return ve;
  eu = 1;
  var t = dg(), e = hg(), r = pg();
  const s = "\uFEFF", l = "", c = "", o = "", f = (i) => !!i && "items" in i, d = (i) => !!i && (i.type === "scalar" || i.type === "single-quoted-scalar" || i.type === "double-quoted-scalar" || i.type === "block-scalar");
  function u(i) {
    switch (i) {
      case s:
        return "<BOM>";
      case l:
        return "<DOC>";
      case c:
        return "<FLOW_END>";
      case o:
        return "<SCALAR>";
      default:
        return JSON.stringify(i);
    }
  }
  function n(i) {
    switch (i) {
      case s:
        return "byte-order-mark";
      case l:
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
    switch (i[0]) {
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
  return ve.createScalarToken = t.createScalarToken, ve.resolveAsScalar = t.resolveAsScalar, ve.setScalarValue = t.setScalarValue, ve.stringify = e.stringify, ve.visit = r.visit, ve.BOM = s, ve.DOCUMENT = l, ve.FLOW_END = c, ve.SCALAR = o, ve.isCollection = f, ve.isScalar = d, ve.prettyToken = u, ve.tokenType = n, ve;
}
var Oi = {}, tu;
function yf() {
  if (tu) return Oi;
  tu = 1;
  var t = ra();
  function e(d) {
    switch (d) {
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
  const r = new Set("0123456789ABCDEFabcdef"), s = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()"), l = new Set(",[]{}"), c = new Set(` ,[]{}
\r	`), o = (d) => !d || c.has(d);
  class f {
    constructor() {
      this.atEnd = !1, this.blockScalarIndent = -1, this.blockScalarKeep = !1, this.buffer = "", this.flowKey = !1, this.flowLevel = 0, this.indentNext = 0, this.indentValue = 0, this.lineEndPos = null, this.next = null, this.pos = 0;
    }
    /**
     * Generate YAML tokens from the `source` string. If `incomplete`,
     * a part of the last line may be left as a buffer for the next call.
     *
     * @returns A generator of lexical tokens
     */
    *lex(u, n = !1) {
      if (u) {
        if (typeof u != "string")
          throw TypeError("source is not a string");
        this.buffer = this.buffer ? this.buffer + u : u, this.lineEndPos = null;
      }
      this.atEnd = !n;
      let i = this.next ?? "stream";
      for (; i && (n || this.hasChars(1)); )
        i = yield* this.parseNext(i);
    }
    atLineEnd() {
      let u = this.pos, n = this.buffer[u];
      for (; n === " " || n === "	"; )
        n = this.buffer[++u];
      return !n || n === "#" || n === `
` ? !0 : n === "\r" ? this.buffer[u + 1] === `
` : !1;
    }
    charAt(u) {
      return this.buffer[this.pos + u];
    }
    continueScalar(u) {
      let n = this.buffer[u];
      if (this.indentNext > 0) {
        let i = 0;
        for (; n === " "; )
          n = this.buffer[++i + u];
        if (n === "\r") {
          const a = this.buffer[i + u + 1];
          if (a === `
` || !a && !this.atEnd)
            return u + i + 1;
        }
        return n === `
` || i >= this.indentNext || !n && !this.atEnd ? u + i : -1;
      }
      if (n === "-" || n === ".") {
        const i = this.buffer.substr(u, 3);
        if ((i === "---" || i === "...") && e(this.buffer[u + 3]))
          return -1;
      }
      return u;
    }
    getLine() {
      let u = this.lineEndPos;
      return (typeof u != "number" || u !== -1 && u < this.pos) && (u = this.buffer.indexOf(`
`, this.pos), this.lineEndPos = u), u === -1 ? this.atEnd ? this.buffer.substring(this.pos) : null : (this.buffer[u - 1] === "\r" && (u -= 1), this.buffer.substring(this.pos, u));
    }
    hasChars(u) {
      return this.pos + u <= this.buffer.length;
    }
    setNext(u) {
      return this.buffer = this.buffer.substring(this.pos), this.pos = 0, this.lineEndPos = null, this.next = u, null;
    }
    peek(u) {
      return this.buffer.substr(this.pos, u);
    }
    *parseNext(u) {
      switch (u) {
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
      let u = this.getLine();
      if (u === null)
        return this.setNext("stream");
      if (u[0] === t.BOM && (yield* this.pushCount(1), u = u.substring(1)), u[0] === "%") {
        let n = u.length, i = u.indexOf("#");
        for (; i !== -1; ) {
          const h = u[i - 1];
          if (h === " " || h === "	") {
            n = i - 1;
            break;
          } else
            i = u.indexOf("#", i + 1);
        }
        for (; ; ) {
          const h = u[n - 1];
          if (h === " " || h === "	")
            n -= 1;
          else
            break;
        }
        const a = (yield* this.pushCount(n)) + (yield* this.pushSpaces(!0));
        return yield* this.pushCount(u.length - a), this.pushNewline(), "stream";
      }
      if (this.atLineEnd()) {
        const n = yield* this.pushSpaces(!0);
        return yield* this.pushCount(u.length - n), yield* this.pushNewline(), "stream";
      }
      return yield t.DOCUMENT, yield* this.parseLineStart();
    }
    *parseLineStart() {
      const u = this.charAt(0);
      if (!u && !this.atEnd)
        return this.setNext("line-start");
      if (u === "-" || u === ".") {
        if (!this.atEnd && !this.hasChars(4))
          return this.setNext("line-start");
        const n = this.peek(3);
        if ((n === "---" || n === "...") && e(this.charAt(3)))
          return yield* this.pushCount(3), this.indentValue = 0, this.indentNext = 0, n === "---" ? "doc" : "stream";
      }
      return this.indentValue = yield* this.pushSpaces(!1), this.indentNext > this.indentValue && !e(this.charAt(1)) && (this.indentNext = this.indentValue), yield* this.parseBlockStart();
    }
    *parseBlockStart() {
      const [u, n] = this.peek(2);
      if (!n && !this.atEnd)
        return this.setNext("block-start");
      if ((u === "-" || u === "?" || u === ":") && e(n)) {
        const i = (yield* this.pushCount(1)) + (yield* this.pushSpaces(!0));
        return this.indentNext = this.indentValue + 1, this.indentValue += i, yield* this.parseBlockStart();
      }
      return "doc";
    }
    *parseDocument() {
      yield* this.pushSpaces(!0);
      const u = this.getLine();
      if (u === null)
        return this.setNext("doc");
      let n = yield* this.pushIndicators();
      switch (u[n]) {
        case "#":
          yield* this.pushCount(u.length - n);
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
          return n += yield* this.parseBlockScalarHeader(), n += yield* this.pushSpaces(!0), yield* this.pushCount(u.length - n), yield* this.pushNewline(), yield* this.parseBlockScalar();
        default:
          return yield* this.parsePlainScalar();
      }
    }
    *parseFlowCollection() {
      let u, n, i = -1;
      do
        u = yield* this.pushNewline(), u > 0 ? (n = yield* this.pushSpaces(!1), this.indentValue = i = n) : n = 0, n += yield* this.pushSpaces(!0);
      while (u + n > 0);
      const a = this.getLine();
      if (a === null)
        return this.setNext("flow");
      if ((i !== -1 && i < this.indentNext && a[0] !== "#" || i === 0 && (a.startsWith("---") || a.startsWith("...")) && e(a[3])) && !(i === this.indentNext - 1 && this.flowLevel === 1 && (a[0] === "]" || a[0] === "}")))
        return this.flowLevel = 0, yield t.FLOW_END, yield* this.parseLineStart();
      let h = 0;
      for (; a[h] === ","; )
        h += yield* this.pushCount(1), h += yield* this.pushSpaces(!0), this.flowKey = !1;
      switch (h += yield* this.pushIndicators(), a[h]) {
        case void 0:
          return "flow";
        case "#":
          return yield* this.pushCount(a.length - h), "flow";
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
          const p = this.charAt(1);
          if (this.flowKey || e(p) || p === ",")
            return this.flowKey = !1, yield* this.pushCount(1), yield* this.pushSpaces(!0), "flow";
        }
        // fallthrough
        default:
          return this.flowKey = !1, yield* this.parsePlainScalar();
      }
    }
    *parseQuotedScalar() {
      const u = this.charAt(0);
      let n = this.buffer.indexOf(u, this.pos + 1);
      if (u === "'")
        for (; n !== -1 && this.buffer[n + 1] === "'"; )
          n = this.buffer.indexOf("'", n + 2);
      else
        for (; n !== -1; ) {
          let h = 0;
          for (; this.buffer[n - 1 - h] === "\\"; )
            h += 1;
          if (h % 2 === 0)
            break;
          n = this.buffer.indexOf('"', n + 1);
        }
      const i = this.buffer.substring(0, n);
      let a = i.indexOf(`
`, this.pos);
      if (a !== -1) {
        for (; a !== -1; ) {
          const h = this.continueScalar(a + 1);
          if (h === -1)
            break;
          a = i.indexOf(`
`, h);
        }
        a !== -1 && (n = a - (i[a - 1] === "\r" ? 2 : 1));
      }
      if (n === -1) {
        if (!this.atEnd)
          return this.setNext("quoted-scalar");
        n = this.buffer.length;
      }
      return yield* this.pushToIndex(n + 1, !1), this.flowLevel ? "flow" : "doc";
    }
    *parseBlockScalarHeader() {
      this.blockScalarIndent = -1, this.blockScalarKeep = !1;
      let u = this.pos;
      for (; ; ) {
        const n = this.buffer[++u];
        if (n === "+")
          this.blockScalarKeep = !0;
        else if (n > "0" && n <= "9")
          this.blockScalarIndent = Number(n) - 1;
        else if (n !== "-")
          break;
      }
      return yield* this.pushUntil((n) => e(n) || n === "#");
    }
    *parseBlockScalar() {
      let u = this.pos - 1, n = 0, i;
      e: for (let h = this.pos; i = this.buffer[h]; ++h)
        switch (i) {
          case " ":
            n += 1;
            break;
          case `
`:
            u = h, n = 0;
            break;
          case "\r": {
            const p = this.buffer[h + 1];
            if (!p && !this.atEnd)
              return this.setNext("block-scalar");
            if (p === `
`)
              break;
          }
          // fallthrough
          default:
            break e;
        }
      if (!i && !this.atEnd)
        return this.setNext("block-scalar");
      if (n >= this.indentNext) {
        this.blockScalarIndent === -1 ? this.indentNext = n : this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
        do {
          const h = this.continueScalar(u + 1);
          if (h === -1)
            break;
          u = this.buffer.indexOf(`
`, h);
        } while (u !== -1);
        if (u === -1) {
          if (!this.atEnd)
            return this.setNext("block-scalar");
          u = this.buffer.length;
        }
      }
      let a = u + 1;
      for (i = this.buffer[a]; i === " "; )
        i = this.buffer[++a];
      if (i === "	") {
        for (; i === "	" || i === " " || i === "\r" || i === `
`; )
          i = this.buffer[++a];
        u = a - 1;
      } else if (!this.blockScalarKeep)
        do {
          let h = u - 1, p = this.buffer[h];
          p === "\r" && (p = this.buffer[--h]);
          const g = h;
          for (; p === " "; )
            p = this.buffer[--h];
          if (p === `
` && h >= this.pos && h + 1 + n > g)
            u = h;
          else
            break;
        } while (!0);
      return yield t.SCALAR, yield* this.pushToIndex(u + 1, !0), yield* this.parseLineStart();
    }
    *parsePlainScalar() {
      const u = this.flowLevel > 0;
      let n = this.pos - 1, i = this.pos - 1, a;
      for (; a = this.buffer[++i]; )
        if (a === ":") {
          const h = this.buffer[i + 1];
          if (e(h) || u && l.has(h))
            break;
          n = i;
        } else if (e(a)) {
          let h = this.buffer[i + 1];
          if (a === "\r" && (h === `
` ? (i += 1, a = `
`, h = this.buffer[i + 1]) : n = i), h === "#" || u && l.has(h))
            break;
          if (a === `
`) {
            const p = this.continueScalar(i + 1);
            if (p === -1)
              break;
            i = Math.max(i, p - 2);
          }
        } else {
          if (u && l.has(a))
            break;
          n = i;
        }
      return !a && !this.atEnd ? this.setNext("plain-scalar") : (yield t.SCALAR, yield* this.pushToIndex(n + 1, !0), u ? "flow" : "doc");
    }
    *pushCount(u) {
      return u > 0 ? (yield this.buffer.substr(this.pos, u), this.pos += u, u) : 0;
    }
    *pushToIndex(u, n) {
      const i = this.buffer.slice(this.pos, u);
      return i ? (yield i, this.pos += i.length, i.length) : (n && (yield ""), 0);
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
          const u = this.flowLevel > 0, n = this.charAt(1);
          if (e(n) || u && l.has(n))
            return u ? this.flowKey && (this.flowKey = !1) : this.indentNext = this.indentValue + 1, (yield* this.pushCount(1)) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
        }
      }
      return 0;
    }
    *pushTag() {
      if (this.charAt(1) === "<") {
        let u = this.pos + 2, n = this.buffer[u];
        for (; !e(n) && n !== ">"; )
          n = this.buffer[++u];
        return yield* this.pushToIndex(n === ">" ? u + 1 : u, !1);
      } else {
        let u = this.pos + 1, n = this.buffer[u];
        for (; n; )
          if (s.has(n))
            n = this.buffer[++u];
          else if (n === "%" && r.has(this.buffer[u + 1]) && r.has(this.buffer[u + 2]))
            n = this.buffer[u += 3];
          else
            break;
        return yield* this.pushToIndex(u, !1);
      }
    }
    *pushNewline() {
      const u = this.buffer[this.pos];
      return u === `
` ? yield* this.pushCount(1) : u === "\r" && this.charAt(1) === `
` ? yield* this.pushCount(2) : 0;
    }
    *pushSpaces(u) {
      let n = this.pos - 1, i;
      do
        i = this.buffer[++n];
      while (i === " " || u && i === "	");
      const a = n - this.pos;
      return a > 0 && (yield this.buffer.substr(this.pos, a), this.pos = n), a;
    }
    *pushUntil(u) {
      let n = this.pos, i = this.buffer[n];
      for (; !u(i); )
        i = this.buffer[++n];
      return yield* this.pushToIndex(n, !1);
    }
  }
  return Oi.Lexer = f, Oi;
}
var Ii = {}, ru;
function vf() {
  if (ru) return Ii;
  ru = 1;
  class t {
    constructor() {
      this.lineStarts = [], this.addNewLine = (r) => this.lineStarts.push(r), this.linePos = (r) => {
        let s = 0, l = this.lineStarts.length;
        for (; s < l; ) {
          const o = s + l >> 1;
          this.lineStarts[o] < r ? s = o + 1 : l = o;
        }
        if (this.lineStarts[s] === r)
          return { line: s + 1, col: 1 };
        if (s === 0)
          return { line: 0, col: r };
        const c = this.lineStarts[s - 1];
        return { line: s, col: r - c + 1 };
      };
    }
  }
  return Ii.LineCounter = t, Ii;
}
var Pi = {}, nu;
function $f() {
  if (nu) return Pi;
  nu = 1;
  var t = qi, e = ra(), r = yf();
  function s(n, i) {
    for (let a = 0; a < n.length; ++a)
      if (n[a].type === i)
        return !0;
    return !1;
  }
  function l(n) {
    for (let i = 0; i < n.length; ++i)
      switch (n[i].type) {
        case "space":
        case "comment":
        case "newline":
          break;
        default:
          return i;
      }
    return -1;
  }
  function c(n) {
    switch (n?.type) {
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
  function o(n) {
    switch (n.type) {
      case "document":
        return n.start;
      case "block-map": {
        const i = n.items[n.items.length - 1];
        return i.sep ?? i.start;
      }
      case "block-seq":
        return n.items[n.items.length - 1].start;
      /* istanbul ignore next should not happen */
      default:
        return [];
    }
  }
  function f(n) {
    if (n.length === 0)
      return [];
    let i = n.length;
    e: for (; --i >= 0; )
      switch (n[i].type) {
        case "doc-start":
        case "explicit-key-ind":
        case "map-value-ind":
        case "seq-item-ind":
        case "newline":
          break e;
      }
    for (; n[++i]?.type === "space"; )
      ;
    return n.splice(i, n.length);
  }
  function d(n) {
    if (n.start.type === "flow-seq-start")
      for (const i of n.items)
        i.sep && !i.value && !s(i.start, "explicit-key-ind") && !s(i.sep, "map-value-ind") && (i.key && (i.value = i.key), delete i.key, c(i.value) ? i.value.end ? Array.prototype.push.apply(i.value.end, i.sep) : i.value.end = i.sep : Array.prototype.push.apply(i.start, i.sep), delete i.sep);
  }
  class u {
    /**
     * @param onNewLine - If defined, called separately with the start position of
     *   each new line (in `parse()`, including the start of input).
     */
    constructor(i) {
      this.atNewLine = !0, this.atScalar = !1, this.indent = 0, this.offset = 0, this.onKeyLine = !1, this.stack = [], this.source = "", this.type = "", this.lexer = new r.Lexer(), this.onNewLine = i;
    }
    /**
     * Parse `source` as a YAML stream.
     * If `incomplete`, a part of the last line may be left as a buffer for the next call.
     *
     * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
     *
     * @returns A generator of tokens representing each directive, document, and other structure.
     */
    *parse(i, a = !1) {
      this.onNewLine && this.offset === 0 && this.onNewLine(0);
      for (const h of this.lexer.lex(i, a))
        yield* this.next(h);
      a || (yield* this.end());
    }
    /**
     * Advance the parser by the `source` of one lexical token.
     */
    *next(i) {
      if (this.source = i, t.env.LOG_TOKENS && console.log("|", e.prettyToken(i)), this.atScalar) {
        this.atScalar = !1, yield* this.step(), this.offset += i.length;
        return;
      }
      const a = e.tokenType(i);
      if (a)
        if (a === "scalar")
          this.atNewLine = !1, this.atScalar = !0, this.type = "scalar";
        else {
          switch (this.type = a, yield* this.step(), a) {
            case "newline":
              this.atNewLine = !0, this.indent = 0, this.onNewLine && this.onNewLine(this.offset + i.length);
              break;
            case "space":
              this.atNewLine && i[0] === " " && (this.indent += i.length);
              break;
            case "explicit-key-ind":
            case "map-value-ind":
            case "seq-item-ind":
              this.atNewLine && (this.indent += i.length);
              break;
            case "doc-mode":
            case "flow-error-end":
              return;
            default:
              this.atNewLine = !1;
          }
          this.offset += i.length;
        }
      else {
        const h = `Not a YAML token: ${i}`;
        yield* this.pop({ type: "error", offset: this.offset, message: h, source: i }), this.offset += i.length;
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
      const i = this.peek(1);
      if (this.type === "doc-end" && (!i || i.type !== "doc-end")) {
        for (; this.stack.length > 0; )
          yield* this.pop();
        this.stack.push({
          type: "doc-end",
          offset: this.offset,
          source: this.source
        });
        return;
      }
      if (!i)
        return yield* this.stream();
      switch (i.type) {
        case "document":
          return yield* this.document(i);
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return yield* this.scalar(i);
        case "block-scalar":
          return yield* this.blockScalar(i);
        case "block-map":
          return yield* this.blockMap(i);
        case "block-seq":
          return yield* this.blockSequence(i);
        case "flow-collection":
          return yield* this.flowCollection(i);
        case "doc-end":
          return yield* this.documentEnd(i);
      }
      yield* this.pop();
    }
    peek(i) {
      return this.stack[this.stack.length - i];
    }
    *pop(i) {
      const a = i ?? this.stack.pop();
      if (!a)
        yield { type: "error", offset: this.offset, source: "", message: "Tried to pop an empty stack" };
      else if (this.stack.length === 0)
        yield a;
      else {
        const h = this.peek(1);
        switch (a.type === "block-scalar" ? a.indent = "indent" in h ? h.indent : 0 : a.type === "flow-collection" && h.type === "document" && (a.indent = 0), a.type === "flow-collection" && d(a), h.type) {
          case "document":
            h.value = a;
            break;
          case "block-scalar":
            h.props.push(a);
            break;
          case "block-map": {
            const p = h.items[h.items.length - 1];
            if (p.value) {
              h.items.push({ start: [], key: a, sep: [] }), this.onKeyLine = !0;
              return;
            } else if (p.sep)
              p.value = a;
            else {
              Object.assign(p, { key: a, sep: [] }), this.onKeyLine = !p.explicitKey;
              return;
            }
            break;
          }
          case "block-seq": {
            const p = h.items[h.items.length - 1];
            p.value ? h.items.push({ start: [], value: a }) : p.value = a;
            break;
          }
          case "flow-collection": {
            const p = h.items[h.items.length - 1];
            !p || p.value ? h.items.push({ start: [], key: a, sep: [] }) : p.sep ? p.value = a : Object.assign(p, { key: a, sep: [] });
            return;
          }
          /* istanbul ignore next should not happen */
          default:
            yield* this.pop(), yield* this.pop(a);
        }
        if ((h.type === "document" || h.type === "block-map" || h.type === "block-seq") && (a.type === "block-map" || a.type === "block-seq")) {
          const p = a.items[a.items.length - 1];
          p && !p.sep && !p.value && p.start.length > 0 && l(p.start) === -1 && (a.indent === 0 || p.start.every((g) => g.type !== "comment" || g.indent < a.indent)) && (h.type === "document" ? h.end = p.start : h.items.push({ start: p.start }), a.items.splice(-1, 1));
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
          const i = {
            type: "document",
            offset: this.offset,
            start: []
          };
          this.type === "doc-start" && i.start.push(this.sourceToken), this.stack.push(i);
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
    *document(i) {
      if (i.value)
        return yield* this.lineEnd(i);
      switch (this.type) {
        case "doc-start": {
          l(i.start) !== -1 ? (yield* this.pop(), yield* this.step()) : i.start.push(this.sourceToken);
          return;
        }
        case "anchor":
        case "tag":
        case "space":
        case "comment":
        case "newline":
          i.start.push(this.sourceToken);
          return;
      }
      const a = this.startBlockValue(i);
      a ? this.stack.push(a) : yield {
        type: "error",
        offset: this.offset,
        message: `Unexpected ${this.type} token in YAML document`,
        source: this.source
      };
    }
    *scalar(i) {
      if (this.type === "map-value-ind") {
        const a = o(this.peek(2)), h = f(a);
        let p;
        i.end ? (p = i.end, p.push(this.sourceToken), delete i.end) : p = [this.sourceToken];
        const g = {
          type: "block-map",
          offset: i.offset,
          indent: i.indent,
          items: [{ start: h, key: i, sep: p }]
        };
        this.onKeyLine = !0, this.stack[this.stack.length - 1] = g;
      } else
        yield* this.lineEnd(i);
    }
    *blockScalar(i) {
      switch (this.type) {
        case "space":
        case "comment":
        case "newline":
          i.props.push(this.sourceToken);
          return;
        case "scalar":
          if (i.source = this.source, this.atNewLine = !0, this.indent = 0, this.onNewLine) {
            let a = this.source.indexOf(`
`) + 1;
            for (; a !== 0; )
              this.onNewLine(this.offset + a), a = this.source.indexOf(`
`, a) + 1;
          }
          yield* this.pop();
          break;
        /* istanbul ignore next should not happen */
        default:
          yield* this.pop(), yield* this.step();
      }
    }
    *blockMap(i) {
      const a = i.items[i.items.length - 1];
      switch (this.type) {
        case "newline":
          if (this.onKeyLine = !1, a.value) {
            const h = "end" in a.value ? a.value.end : void 0;
            (Array.isArray(h) ? h[h.length - 1] : void 0)?.type === "comment" ? h?.push(this.sourceToken) : i.items.push({ start: [this.sourceToken] });
          } else a.sep ? a.sep.push(this.sourceToken) : a.start.push(this.sourceToken);
          return;
        case "space":
        case "comment":
          if (a.value)
            i.items.push({ start: [this.sourceToken] });
          else if (a.sep)
            a.sep.push(this.sourceToken);
          else {
            if (this.atIndentedComment(a.start, i.indent)) {
              const p = i.items[i.items.length - 2]?.value?.end;
              if (Array.isArray(p)) {
                Array.prototype.push.apply(p, a.start), p.push(this.sourceToken), i.items.pop();
                return;
              }
            }
            a.start.push(this.sourceToken);
          }
          return;
      }
      if (this.indent >= i.indent) {
        const h = !this.onKeyLine && this.indent === i.indent, p = h && (a.sep || a.explicitKey) && this.type !== "seq-item-ind";
        let g = [];
        if (p && a.sep && !a.value) {
          const m = [];
          for (let y = 0; y < a.sep.length; ++y) {
            const v = a.sep[y];
            switch (v.type) {
              case "newline":
                m.push(y);
                break;
              case "space":
                break;
              case "comment":
                v.indent > i.indent && (m.length = 0);
                break;
              default:
                m.length = 0;
            }
          }
          m.length >= 2 && (g = a.sep.splice(m[1]));
        }
        switch (this.type) {
          case "anchor":
          case "tag":
            p || a.value ? (g.push(this.sourceToken), i.items.push({ start: g }), this.onKeyLine = !0) : a.sep ? a.sep.push(this.sourceToken) : a.start.push(this.sourceToken);
            return;
          case "explicit-key-ind":
            !a.sep && !a.explicitKey ? (a.start.push(this.sourceToken), a.explicitKey = !0) : p || a.value ? (g.push(this.sourceToken), i.items.push({ start: g, explicitKey: !0 })) : this.stack.push({
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken], explicitKey: !0 }]
            }), this.onKeyLine = !0;
            return;
          case "map-value-ind":
            if (a.explicitKey)
              if (a.sep)
                if (a.value)
                  i.items.push({ start: [], key: null, sep: [this.sourceToken] });
                else if (s(a.sep, "map-value-ind"))
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: g, key: null, sep: [this.sourceToken] }]
                  });
                else if (c(a.key) && !s(a.sep, "newline")) {
                  const m = f(a.start), y = a.key, v = a.sep;
                  v.push(this.sourceToken), delete a.key, delete a.sep, this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: m, key: y, sep: v }]
                  });
                } else g.length > 0 ? a.sep = a.sep.concat(g, this.sourceToken) : a.sep.push(this.sourceToken);
              else if (s(a.start, "newline"))
                Object.assign(a, { key: null, sep: [this.sourceToken] });
              else {
                const m = f(a.start);
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: m, key: null, sep: [this.sourceToken] }]
                });
              }
            else
              a.sep ? a.value || p ? i.items.push({ start: g, key: null, sep: [this.sourceToken] }) : s(a.sep, "map-value-ind") ? this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: [], key: null, sep: [this.sourceToken] }]
              }) : a.sep.push(this.sourceToken) : Object.assign(a, { key: null, sep: [this.sourceToken] });
            this.onKeyLine = !0;
            return;
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar": {
            const m = this.flowScalar(this.type);
            p || a.value ? (i.items.push({ start: g, key: m, sep: [] }), this.onKeyLine = !0) : a.sep ? this.stack.push(m) : (Object.assign(a, { key: m, sep: [] }), this.onKeyLine = !0);
            return;
          }
          default: {
            const m = this.startBlockValue(i);
            if (m) {
              if (m.type === "block-seq") {
                if (!a.explicitKey && a.sep && !s(a.sep, "newline")) {
                  yield* this.pop({
                    type: "error",
                    offset: this.offset,
                    message: "Unexpected block-seq-ind on same line with key",
                    source: this.source
                  });
                  return;
                }
              } else h && i.items.push({ start: g });
              this.stack.push(m);
              return;
            }
          }
        }
      }
      yield* this.pop(), yield* this.step();
    }
    *blockSequence(i) {
      const a = i.items[i.items.length - 1];
      switch (this.type) {
        case "newline":
          if (a.value) {
            const h = "end" in a.value ? a.value.end : void 0;
            (Array.isArray(h) ? h[h.length - 1] : void 0)?.type === "comment" ? h?.push(this.sourceToken) : i.items.push({ start: [this.sourceToken] });
          } else
            a.start.push(this.sourceToken);
          return;
        case "space":
        case "comment":
          if (a.value)
            i.items.push({ start: [this.sourceToken] });
          else {
            if (this.atIndentedComment(a.start, i.indent)) {
              const p = i.items[i.items.length - 2]?.value?.end;
              if (Array.isArray(p)) {
                Array.prototype.push.apply(p, a.start), p.push(this.sourceToken), i.items.pop();
                return;
              }
            }
            a.start.push(this.sourceToken);
          }
          return;
        case "anchor":
        case "tag":
          if (a.value || this.indent <= i.indent)
            break;
          a.start.push(this.sourceToken);
          return;
        case "seq-item-ind":
          if (this.indent !== i.indent)
            break;
          a.value || s(a.start, "seq-item-ind") ? i.items.push({ start: [this.sourceToken] }) : a.start.push(this.sourceToken);
          return;
      }
      if (this.indent > i.indent) {
        const h = this.startBlockValue(i);
        if (h) {
          this.stack.push(h);
          return;
        }
      }
      yield* this.pop(), yield* this.step();
    }
    *flowCollection(i) {
      const a = i.items[i.items.length - 1];
      if (this.type === "flow-error-end") {
        let h;
        do
          yield* this.pop(), h = this.peek(1);
        while (h && h.type === "flow-collection");
      } else if (i.end.length === 0) {
        switch (this.type) {
          case "comma":
          case "explicit-key-ind":
            !a || a.sep ? i.items.push({ start: [this.sourceToken] }) : a.start.push(this.sourceToken);
            return;
          case "map-value-ind":
            !a || a.value ? i.items.push({ start: [], key: null, sep: [this.sourceToken] }) : a.sep ? a.sep.push(this.sourceToken) : Object.assign(a, { key: null, sep: [this.sourceToken] });
            return;
          case "space":
          case "comment":
          case "newline":
          case "anchor":
          case "tag":
            !a || a.value ? i.items.push({ start: [this.sourceToken] }) : a.sep ? a.sep.push(this.sourceToken) : a.start.push(this.sourceToken);
            return;
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar": {
            const p = this.flowScalar(this.type);
            !a || a.value ? i.items.push({ start: [], key: p, sep: [] }) : a.sep ? this.stack.push(p) : Object.assign(a, { key: p, sep: [] });
            return;
          }
          case "flow-map-end":
          case "flow-seq-end":
            i.end.push(this.sourceToken);
            return;
        }
        const h = this.startBlockValue(i);
        h ? this.stack.push(h) : (yield* this.pop(), yield* this.step());
      } else {
        const h = this.peek(2);
        if (h.type === "block-map" && (this.type === "map-value-ind" && h.indent === i.indent || this.type === "newline" && !h.items[h.items.length - 1].sep))
          yield* this.pop(), yield* this.step();
        else if (this.type === "map-value-ind" && h.type !== "flow-collection") {
          const p = o(h), g = f(p);
          d(i);
          const m = i.end.splice(1, i.end.length);
          m.push(this.sourceToken);
          const y = {
            type: "block-map",
            offset: i.offset,
            indent: i.indent,
            items: [{ start: g, key: i, sep: m }]
          };
          this.onKeyLine = !0, this.stack[this.stack.length - 1] = y;
        } else
          yield* this.lineEnd(i);
      }
    }
    flowScalar(i) {
      if (this.onNewLine) {
        let a = this.source.indexOf(`
`) + 1;
        for (; a !== 0; )
          this.onNewLine(this.offset + a), a = this.source.indexOf(`
`, a) + 1;
      }
      return {
        type: i,
        offset: this.offset,
        indent: this.indent,
        source: this.source
      };
    }
    startBlockValue(i) {
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
          const a = o(i), h = f(a);
          return h.push(this.sourceToken), {
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: h, explicitKey: !0 }]
          };
        }
        case "map-value-ind": {
          this.onKeyLine = !0;
          const a = o(i), h = f(a);
          return {
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: h, key: null, sep: [this.sourceToken] }]
          };
        }
      }
      return null;
    }
    atIndentedComment(i, a) {
      return this.type !== "comment" || this.indent <= a ? !1 : i.every((h) => h.type === "newline" || h.type === "space");
    }
    *documentEnd(i) {
      this.type !== "doc-mode" && (i.end ? i.end.push(this.sourceToken) : i.end = [this.sourceToken], this.type === "newline" && (yield* this.pop()));
    }
    *lineEnd(i) {
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
          i.end ? i.end.push(this.sourceToken) : i.end = [this.sourceToken], this.type === "newline" && (yield* this.pop());
      }
    }
  }
  return Pi.Parser = u, Pi;
}
var ht = {}, su;
function mg() {
  if (su) return ht;
  su = 1;
  var t = gf(), e = In(), r = Pn(), s = Wu(), l = re(), c = vf(), o = $f();
  function f(a) {
    const h = a.prettyErrors !== !1;
    return { lineCounter: a.lineCounter || h && new c.LineCounter() || null, prettyErrors: h };
  }
  function d(a, h = {}) {
    const { lineCounter: p, prettyErrors: g } = f(h), m = new o.Parser(p?.addNewLine), y = new t.Composer(h), v = Array.from(y.compose(m.parse(a)));
    if (g && p)
      for (const w of v)
        w.errors.forEach(r.prettifyError(a, p)), w.warnings.forEach(r.prettifyError(a, p));
    return v.length > 0 ? v : Object.assign([], { empty: !0 }, y.streamInfo());
  }
  function u(a, h = {}) {
    const { lineCounter: p, prettyErrors: g } = f(h), m = new o.Parser(p?.addNewLine), y = new t.Composer(h);
    let v = null;
    for (const w of y.compose(m.parse(a), !0, a.length))
      if (!v)
        v = w;
      else if (v.options.logLevel !== "silent") {
        v.errors.push(new r.YAMLParseError(w.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
        break;
      }
    return g && p && (v.errors.forEach(r.prettifyError(a, p)), v.warnings.forEach(r.prettifyError(a, p))), v;
  }
  function n(a, h, p) {
    let g;
    typeof h == "function" ? g = h : p === void 0 && h && typeof h == "object" && (p = h);
    const m = u(a, p);
    if (!m)
      return null;
    if (m.warnings.forEach((y) => s.warn(m.options.logLevel, y)), m.errors.length > 0) {
      if (m.options.logLevel !== "silent")
        throw m.errors[0];
      m.errors = [];
    }
    return m.toJS(Object.assign({ reviver: g }, p));
  }
  function i(a, h, p) {
    let g = null;
    if (typeof h == "function" || Array.isArray(h) ? g = h : p === void 0 && h && (p = h), typeof p == "string" && (p = p.length), typeof p == "number") {
      const m = Math.round(p);
      p = m < 1 ? void 0 : m > 8 ? { indent: 8 } : { indent: m };
    }
    if (a === void 0) {
      const { keepUndefined: m } = p ?? h ?? {};
      if (!m)
        return;
    }
    return l.isDocument(a) && !g ? a.toString(p) : new e.Document(a, g, p).toString(p);
  }
  return ht.parse = n, ht.parseAllDocuments = d, ht.parseDocument = u, ht.stringify = i, ht;
}
var iu;
function gg() {
  if (iu) return se;
  iu = 1;
  var t = gf(), e = In(), r = uf(), s = Pn(), l = En(), c = re(), o = Ze(), f = le(), d = et(), u = tt(), n = ra(), i = yf(), a = vf(), h = $f(), p = mg(), g = Sn();
  return se.Composer = t.Composer, se.Document = e.Document, se.Schema = r.Schema, se.YAMLError = s.YAMLError, se.YAMLParseError = s.YAMLParseError, se.YAMLWarning = s.YAMLWarning, se.Alias = l.Alias, se.isAlias = c.isAlias, se.isCollection = c.isCollection, se.isDocument = c.isDocument, se.isMap = c.isMap, se.isNode = c.isNode, se.isPair = c.isPair, se.isScalar = c.isScalar, se.isSeq = c.isSeq, se.Pair = o.Pair, se.Scalar = f.Scalar, se.YAMLMap = d.YAMLMap, se.YAMLSeq = u.YAMLSeq, se.CST = n, se.Lexer = i.Lexer, se.LineCounter = a.LineCounter, se.Parser = h.Parser, se.parse = p.parse, se.parseAllDocuments = p.parseAllDocuments, se.parseDocument = p.parseDocument, se.stringify = p.stringify, se.visit = g.visit, se.visitAsync = g.visitAsync, se;
}
var yg = gg();
const vg = /* @__PURE__ */ fn(yg), $g = /* @__PURE__ */ new Set([
  "events",
  "path",
  "url",
  "buffer",
  "timers",
  "util",
  "http",
  "https",
  "net",
  "crypto"
]), wg = ["node:"], bg = (t) => t.startsWith("./") || t.startsWith("../") || t.startsWith("/");
function Sg(t, e) {
  const r = wu(t), s = new Set(e?.allowedModules ?? []);
  for (const o of $g)
    s.add(o);
  const l = new Set(e?.allowedNodePrefixes ?? wg), c = new Set(e?.allowedPackages ?? []);
  return (o) => {
    if (bg(o) || [...l].some((f) => o.startsWith(f)) || s.has(o) || c.has(o))
      return r(o);
    throw new Error(`Module '${o}' is not allowed in sandboxed plugin`);
  };
}
function Eg(t) {
  const e = /* @__PURE__ */ new Set(["env", "versions", "platform", "arch"]), r = {
    env: process.env,
    versions: process.versions,
    platform: process.platform,
    arch: process.arch
  };
  return new Proxy(r, {
    get(s, l) {
      if (!e.has(l))
        throw new Error(`Access to process.${l} is not permitted for plugin ${t}`);
      return s[l];
    }
  });
}
class _g {
  entryPath;
  options;
  constructor(e, r) {
    this.entryPath = e, this.options = r;
  }
  async load(e) {
    const r = this.resolveEntry(this.entryPath);
    if (!Je(r))
      throw new Error(`Plugin entry not found at ${r}`);
    const s = await bu(r, "utf-8"), l = new an.Script(s, {
      filename: r
    }), c = { exports: {} }, o = an.createContext({
      module: c,
      exports: c.exports,
      require: Sg(r, this.options),
      __dirname: yu(r),
      __filename: r,
      console,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      Buffer,
      process: Eg(e)
    });
    l.runInContext(o, { timeout: 5e3 });
    const f = o.module.exports ?? o.exports;
    if (!f)
      throw new Error(`Plugin at ${r} did not export a module`);
    return f.default ?? f;
  }
  resolveEntry(e) {
    const r = vu(e);
    if (r === ".mjs" || r === ".cjs" || r === ".js")
      return e;
    if (r === "")
      return `${e}.js`;
    throw new Error(`Unsupported plugin entry extension: ${r}`);
  }
}
const Ng = (t, e) => {
  const r = If($e(t, e));
  return $u(r);
};
class Rg extends Mf {
  state = "CLOSED";
  failures = 0;
  successes = 0;
  lastFailureTime;
  nextAttemptTime;
  totalCalls = 0;
  totalFailures = 0;
  totalSuccesses = 0;
  failureThreshold;
  successThreshold;
  timeout;
  resetTimeout;
  logger;
  name;
  constructor(e, r = {}) {
    super(), this.name = e, this.failureThreshold = r.failureThreshold ?? 5, this.successThreshold = r.successThreshold ?? 2, this.timeout = r.timeout ?? 6e4, this.resetTimeout = r.resetTimeout ?? 3e4, this.logger = r.logger ?? Oe(`CircuitBreaker:${e}`);
  }
  async execute(e) {
    if (this.totalCalls++, this.state === "OPEN")
      if (this.canAttemptReset())
        this.transitionToHalfOpen();
      else {
        const r = new Error(`Circuit breaker is OPEN for ${this.name}`);
        throw r.code = "CIRCUIT_OPEN", r;
      }
    try {
      const r = await this.executeWithTimeout(e);
      return this.onSuccess(), r;
    } catch (r) {
      throw this.onFailure(r), r;
    }
  }
  async executeWithTimeout(e) {
    return new Promise((r, s) => {
      const l = setTimeout(() => {
        s(new Error(`Operation timed out after ${this.timeout}ms`));
      }, this.timeout);
      e().then((c) => {
        clearTimeout(l), r(c);
      }).catch((c) => {
        clearTimeout(l), s(c);
      });
    });
  }
  onSuccess() {
    this.totalSuccesses++, this.failures = 0, this.state === "HALF_OPEN" && (this.successes++, this.successes >= this.successThreshold && this.transitionToClosed());
  }
  onFailure(e) {
    this.totalFailures++, this.failures++, this.lastFailureTime = Date.now(), this.logger.warn(`Circuit breaker ${this.name} failure #${this.failures}`, e), this.state === "HALF_OPEN" ? this.transitionToOpen() : this.state === "CLOSED" && this.failures >= this.failureThreshold && this.transitionToOpen();
  }
  canAttemptReset() {
    return this.nextAttemptTime !== void 0 && Date.now() >= this.nextAttemptTime;
  }
  transitionToOpen() {
    this.state = "OPEN", this.nextAttemptTime = Date.now() + this.resetTimeout, this.successes = 0, this.logger.error(`Circuit breaker ${this.name} transitioned to OPEN`), this.emit("open", this.name);
  }
  transitionToHalfOpen() {
    this.state = "HALF_OPEN", this.successes = 0, this.failures = 0, this.logger.info(`Circuit breaker ${this.name} transitioned to HALF_OPEN`), this.emit("halfOpen", this.name);
  }
  transitionToClosed() {
    this.state = "CLOSED", this.failures = 0, this.successes = 0, this.nextAttemptTime = void 0, this.logger.info(`Circuit breaker ${this.name} transitioned to CLOSED`), this.emit("closed", this.name);
  }
  getStats() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      totalCalls: this.totalCalls,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses
    };
  }
  reset() {
    this.state = "CLOSED", this.failures = 0, this.successes = 0, this.lastFailureTime = void 0, this.nextAttemptTime = void 0, this.logger.info(`Circuit breaker ${this.name} manually reset`), this.emit("reset", this.name);
  }
}
class Ag {
  breakers = /* @__PURE__ */ new Map();
  logger;
  constructor(e) {
    this.logger = e ?? Oe("CircuitBreakerManager");
  }
  getBreaker(e, r) {
    if (!this.breakers.has(e)) {
      const s = { ...r, logger: r?.logger ?? this.logger }, l = new Rg(e, s);
      this.breakers.set(e, l), l.on("open", () => this.onBreakerOpen(e)), l.on("halfOpen", () => this.onBreakerHalfOpen(e)), l.on("closed", () => this.onBreakerClosed(e));
    }
    return this.breakers.get(e);
  }
  getAllStats() {
    const e = /* @__PURE__ */ new Map();
    for (const [r, s] of this.breakers)
      e.set(r, s.getStats());
    return e;
  }
  resetAll() {
    for (const e of this.breakers.values())
      e.reset();
  }
  onBreakerOpen(e) {
    this.logger.warn(`Circuit breaker opened: ${e}`);
  }
  onBreakerHalfOpen(e) {
    this.logger.info(`Circuit breaker half-open: ${e}`);
  }
  onBreakerClosed(e) {
    this.logger.info(`Circuit breaker closed: ${e}`);
  }
}
class Og {
  logger;
  eventBus;
  defaultConfig = {
    maxAttempts: 3,
    initialDelay: 1e3,
    maxDelay: 3e4,
    backoffMultiplier: 2,
    jitter: !0,
    timeout: 6e4,
    retryableErrors: [],
    abortErrors: []
  };
  constructor(e, r) {
    this.eventBus = e, this.logger = r ?? Oe("RetryManager");
  }
  async execute(e, r, s) {
    const l = { ...this.defaultConfig, ...s }, c = Date.now();
    let o;
    for (let f = 1; f <= l.maxAttempts; f++) {
      const d = {
        attempt: f,
        totalAttempts: l.maxAttempts,
        delay: this.calculateDelay(f, l),
        startTime: c
      };
      try {
        this.logger.debug(`Attempting operation ${e} (${f}/${l.maxAttempts})`);
        const u = await this.executeWithTimeout(r, l.timeout);
        return this.emitRetryEvent("retry.success", e, d), {
          success: !0,
          result: u,
          attempts: f,
          duration: Date.now() - c
        };
      } catch (u) {
        if (o = u, d.error = u, this.shouldAbort(u, l)) {
          this.logger.error(`Operation ${e} failed with non-retryable error`, u), this.emitRetryEvent("retry.aborted", e, d);
          break;
        }
        f < l.maxAttempts ? (this.logger.warn(
          `Operation ${e} failed (attempt ${f}/${l.maxAttempts}), retrying in ${d.delay}ms`,
          u
        ), this.emitRetryEvent("retry.attempt", e, d), await this.delay(d.delay)) : (this.logger.error(
          `Operation ${e} failed after ${f} attempts`,
          u
        ), this.emitRetryEvent("retry.exhausted", e, d));
      }
    }
    return {
      success: !1,
      error: o,
      attempts: l.maxAttempts,
      duration: Date.now() - c
    };
  }
  async executeWithRetry(e, r, s) {
    const l = await this.execute(e, r, s);
    if (!l.success)
      throw l.error;
    return l.result;
  }
  async executeWithTimeout(e, r) {
    return new Promise((s, l) => {
      const c = setTimeout(() => {
        l(new Error(`Operation timed out after ${r}ms`));
      }, r);
      e().then((o) => {
        clearTimeout(c), s(o);
      }).catch((o) => {
        clearTimeout(c), l(o);
      });
    });
  }
  calculateDelay(e, r) {
    let s = r.initialDelay * Math.pow(r.backoffMultiplier, e - 1);
    if (s = Math.min(s, r.maxDelay), r.jitter) {
      const l = s * 0.2, c = Math.random() * l - l / 2;
      s += c;
    }
    return Math.round(s);
  }
  shouldAbort(e, r) {
    if (!e || typeof e != "object")
      return !1;
    const s = e, l = s.code ? String(s.code) : s.name ? String(s.name) : void 0;
    return r.abortErrors.length > 0 && l && r.abortErrors.includes(l) ? !0 : r.retryableErrors.length > 0 && l ? !r.retryableErrors.includes(l) : !1;
  }
  async delay(e) {
    return new Promise((r) => setTimeout(r, e));
  }
  emitRetryEvent(e, r, s) {
    this.eventBus && this.eventBus.emit({
      type: "system.retry",
      payload: {
        type: e,
        operation: r,
        attempt: s.attempt,
        totalAttempts: s.totalAttempts,
        delay: s.delay,
        duration: Date.now() - s.startTime,
        error: s.error instanceof Error ? s.error.message : String(s.error)
      }
    });
  }
}
const Ig = {
  API: {
    maxAttempts: 3,
    initialDelay: 1e3,
    maxDelay: 1e4,
    backoffMultiplier: 2,
    jitter: !0,
    retryableErrors: ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND"],
    abortErrors: ["UNAUTHORIZED", "FORBIDDEN"]
  },
  DATABASE: {
    maxAttempts: 5,
    initialDelay: 100,
    maxDelay: 5e3,
    backoffMultiplier: 1.5,
    jitter: !1,
    retryableErrors: ["SQLITE_BUSY", "SQLITE_LOCKED"]
  },
  PLUGIN: {
    maxAttempts: 2,
    initialDelay: 500,
    maxDelay: 3e3,
    backoffMultiplier: 2,
    jitter: !0,
    timeout: 5e3
  },
  NETWORK: {
    maxAttempts: 4,
    initialDelay: 2e3,
    maxDelay: 3e4,
    backoffMultiplier: 2,
    jitter: !0,
    retryableErrors: ["ECONNREFUSED", "EHOSTUNREACH", "ENETUNREACH"]
  }
};
var wf = /* @__PURE__ */ ((t) => (t.PLUGIN = "plugin", t.NETWORK = "network", t.DATABASE = "database", t.VALIDATION = "validation", t.PERMISSION = "permission", t.CONFIGURATION = "configuration", t.SYSTEM = "system", t.UNKNOWN = "unknown", t))(wf || {});
class Pg {
  logger;
  eventBus;
  errorHistory = [];
  maxHistorySize = 100;
  recoveryStrategies = /* @__PURE__ */ new Map();
  constructor(e) {
    this.eventBus = e, this.logger = Oe("ErrorReporter"), this.registerDefaultRecoveryStrategies();
  }
  report(e, r = {}) {
    const s = this.buildContext(e, r), l = this.createReport(e, s);
    return this.logger.error(`Error reported: ${l.userMessage}`, {
      error: e,
      context: s
    }), this.errorHistory.push(l), this.errorHistory.length > this.maxHistorySize && this.errorHistory.shift(), this.emitErrorEvent(l), l.recoverable && this.attemptRecovery(e, s, l), l;
  }
  buildContext(e, r) {
    return {
      category: r.category ?? this.categorizeError(e),
      severity: r.severity ?? this.assessSeverity(e, r.category),
      operation: r.operation,
      pluginId: r.pluginId,
      ruleId: r.ruleId,
      userId: r.userId,
      metadata: r.metadata
    };
  }
  createReport(e, r) {
    const s = this.normalizeError(e), l = this.generateUserMessage(s, r), c = this.generateSuggestions(e, r), o = this.isRecoverable(e, r);
    return {
      id: this.generateErrorId(),
      timestamp: Date.now(),
      error: s,
      context: r,
      userMessage: l,
      suggestions: c,
      recoverable: o,
      autoRecoveryAttempted: !1
    };
  }
  normalizeError(e) {
    if (e instanceof Error)
      return {
        message: e.message,
        code: e.code,
        stack: e.stack
      };
    if (typeof e == "string")
      return { message: e };
    if (e && typeof e == "object") {
      const r = e;
      return {
        message: r.message ? String(r.message) : String(e),
        code: r.code ? String(r.code) : void 0,
        stack: r.stack ? String(r.stack) : void 0
      };
    }
    return { message: String(e) };
  }
  categorizeError(e) {
    const r = this.getErrorMessage(e).toLowerCase(), s = this.getErrorCode(e)?.toLowerCase();
    return s?.includes("econnrefused") || s?.includes("etimedout") || s?.includes("enotfound") || r.includes("network") || r.includes("connection") ? "network" : s?.includes("sqlite") || r.includes("database") || r.includes("sql") ? "database" : r.includes("plugin") || s?.includes("plugin") ? "plugin" : r.includes("invalid") || r.includes("validation") || r.includes("schema") ? "validation" : s?.includes("eacces") || s?.includes("eperm") || r.includes("permission") || r.includes("unauthorized") ? "permission" : r.includes("config") || r.includes("setting") ? "configuration" : "unknown";
  }
  assessSeverity(e, r) {
    const s = this.getErrorMessage(e).toLowerCase();
    return s.includes("crash") || s.includes("fatal") || s.includes("critical") || r === "database" ? "critical" : r === "permission" || s.includes("failed") || s.includes("error") ? "high" : r === "network" || r === "plugin" ? "medium" : "low";
  }
  generateUserMessage(e, r) {
    return {
      network: () => "Network connection issue detected. Please check your internet connection.",
      database: () => "Database operation failed. The application may need to be restarted.",
      plugin: () => `Plugin ${r.pluginId || "unknown"} encountered an error.`,
      validation: () => "Invalid data provided. Please check your input.",
      permission: () => "Permission denied. Please check your access rights.",
      configuration: () => "Configuration error detected. Please review your settings.",
      system: () => "System error occurred. Please try again.",
      unknown: () => `An unexpected error occurred: ${e.message}`
    }[r.category](e);
  }
  generateSuggestions(e, r) {
    const s = this.recoveryStrategies.get(r.category);
    if (s)
      return s.getSuggestions(e, r);
    const l = [];
    switch (r.category) {
      case "network":
        l.push("Check your internet connection"), l.push("Verify the service is accessible"), l.push("Try again in a few moments");
        break;
      case "database":
        l.push("Restart the application"), l.push("Check available disk space"), l.push("Verify database file integrity");
        break;
      case "plugin":
        l.push("Disable and re-enable the plugin"), l.push("Check plugin configuration"), l.push("Update the plugin to the latest version");
        break;
      case "validation":
        l.push("Review the input data format"), l.push("Check for required fields"), l.push("Ensure data types are correct");
        break;
      case "permission":
        l.push("Run the application with appropriate permissions"), l.push("Check file/folder access rights"), l.push("Verify user credentials");
        break;
      case "configuration":
        l.push("Review application settings"), l.push("Reset to default configuration"), l.push("Check configuration file syntax");
        break;
      default:
        l.push("Try the operation again"), l.push("Restart the application if the issue persists"), l.push("Check the logs for more details");
    }
    return l;
  }
  isRecoverable(e, r) {
    const s = this.recoveryStrategies.get(r.category);
    return s ? s.canRecover(e, r) : r.category === "network" || r.category === "plugin" || r.category === "database" && r.severity !== "critical";
  }
  async attemptRecovery(e, r, s) {
    const l = this.recoveryStrategies.get(r.category);
    if (l)
      try {
        this.logger.info(`Attempting auto-recovery for error: ${s.id}`), s.autoRecoveryAttempted = !0, await l.recover(e, r) ? (this.logger.info(`Successfully recovered from error: ${s.id}`), this.emitErrorEvent({
          ...s,
          type: "error.recovered"
        })) : this.logger.warn(`Failed to recover from error: ${s.id}`);
      } catch (c) {
        this.logger.error(`Error during recovery attempt: ${s.id}`, c);
      }
  }
  registerRecoveryStrategy(e, r) {
    this.recoveryStrategies.set(e, r);
  }
  registerDefaultRecoveryStrategies() {
    this.registerRecoveryStrategy("network", {
      canRecover: () => !0,
      recover: async () => (await new Promise((e) => setTimeout(e, 1e3)), !1),
      getSuggestions: () => [
        "Check your network connection",
        "The system will automatically retry",
        "Verify firewall settings"
      ]
    }), this.registerRecoveryStrategy("plugin", {
      canRecover: (e, r) => !!r.pluginId,
      recover: async () => !1,
      getSuggestions: (e, r) => [
        `Plugin ${r.pluginId} will be automatically restarted`,
        "Check plugin logs for details",
        "Update plugin configuration if needed"
      ]
    });
  }
  getErrorMessage(e) {
    return e instanceof Error ? e.message : typeof e == "string" ? e : e && typeof e == "object" && "message" in e ? String(e.message) : String(e);
  }
  getErrorCode(e) {
    if (e && typeof e == "object" && "code" in e)
      return String(e.code);
  }
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  emitErrorEvent(e) {
    if (!this.eventBus) return;
    const r = "type" in e && e.type === "error.recovered";
    this.eventBus.emit({
      type: r ? "system.error.recovered" : "system.error.reported",
      payload: e
    });
  }
  getErrorHistory(e, r = 50) {
    let s = [...this.errorHistory];
    return e && (s = s.filter((l) => l.context.category === e)), s.slice(-r).reverse();
  }
  clearErrorHistory() {
    this.errorHistory.length = 0, this.logger.info("Error history cleared");
  }
  getErrorStatistics() {
    const e = {
      plugin: 0,
      network: 0,
      database: 0,
      validation: 0,
      permission: 0,
      configuration: 0,
      system: 0,
      unknown: 0
    };
    for (const r of this.errorHistory)
      e[r.context.category]++;
    return e;
  }
}
const Tg = {
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
}, kg = Tg;
class Cg {
  options;
  eventBus;
  stores;
  logger;
  ajv = new Ym({ allErrors: !0, allowUnionTypes: !0 });
  validator;
  plugins = /* @__PURE__ */ new Map();
  statuses = /* @__PURE__ */ new Map();
  circuitBreakerManager;
  retryManager;
  errorReporter;
  constructor(e, r, s, l = Oe("PluginManager")) {
    this.options = e, this.eventBus = r, this.stores = s, this.logger = l, Bu(this.ajv), this.validator = this.ajv.compile(kg), this.circuitBreakerManager = new Ag(), this.retryManager = new Og(r, l), this.errorReporter = new Pg(r);
  }
  listLoaded() {
    return Array.from(this.plugins.values());
  }
  getPlugin(e) {
    return this.plugins.get(e);
  }
  listStatuses() {
    return Array.from(this.statuses.entries()).map(([e, r]) => ({ pluginId: e, status: r }));
  }
  getStatus(e) {
    return this.statuses.get(e);
  }
  getConfig(e) {
    if (!this.plugins.get(e))
      throw new Error(`Plugin ${e} is not loaded`);
    return this.stores.getPluginConfigSnapshot(e);
  }
  updateConfig(e, r) {
    const s = this.plugins.get(e);
    if (!s)
      throw new Error(`Plugin ${e} is not loaded`);
    if (s.instance.validateConfig) {
      const l = s.instance.validateConfig(r);
      if (!l.valid)
        throw new Error(`Invalid configuration for plugin ${e}: ${(l.errors ?? []).join(", ")}`);
    }
    return this.stores.setPluginConfigSnapshot(e, r), this.logger.info(`Updated configuration for plugin ${e}`), this.getConfig(e);
  }
  async executeAction(e, r, s) {
    const l = this.plugins.get(e);
    if (!l)
      throw new Error(`Plugin ${e} is not loaded`);
    const c = this.circuitBreakerManager.getBreaker(`plugin:${e}:${r}`, {
      failureThreshold: 3,
      resetTimeout: 3e4,
      timeout: 1e4
    });
    try {
      await c.execute(async () => this.retryManager.executeWithRetry(
        `plugin:${e}:${r}`,
        async () => l.instance.executeAction(r, s),
        Ig.PLUGIN
      ));
    } catch (o) {
      throw this.errorReporter.report(o, {
        category: wf.PLUGIN,
        pluginId: e,
        operation: `executeAction:${r}`,
        metadata: { actionId: r, params: s }
      }), o;
    }
  }
  async loadPlugins() {
    const e = this.collectPluginDirectories(), r = [];
    for (const s of e)
      try {
        const l = await this.readManifest(s);
        if (!l) continue;
        await this.loadPlugin(s, l);
      } catch (l) {
        this.logger.error(`Failed to load plugin at ${s}`, { error: l }), r.push(l instanceof Error ? l : new Error(String(l)));
      }
    if (r.length > 0) {
      const s = r.map((l) => l.message).join("; ");
      throw new Error(`PluginManager encountered errors while loading plugins: ${s}`);
    }
  }
  async unloadAll() {
    for (const [e, r] of this.plugins) {
      try {
        await r.instance.stopListening?.(), await r.instance.destroy?.(), this.eventBus.emitPluginStatus({
          pluginId: e,
          status: {
            state: "disconnected",
            message: "Plugin unloaded",
            at: Date.now()
          }
        });
      } catch (s) {
        this.logger.error(`Error while unloading plugin ${e}`, { error: s });
      }
      this.statuses.delete(e);
    }
    this.plugins.clear();
  }
  collectPluginDirectories() {
    const { builtInDirectory: e, externalDirectory: r } = this.options, s = [];
    for (const l of [e, r]) {
      if (!l || !Je(l)) continue;
      const c = Af(l, { withFileTypes: !0 });
      for (const o of c)
        o.isDirectory() && s.push($e(l, o.name));
    }
    return s;
  }
  async readManifest(e) {
    const r = this.findManifestFile(e);
    if (!r) {
      this.logger.warn(`No manifest found for plugin at ${e}`);
      return;
    }
    const s = await bu(r, "utf-8"), l = this.parseManifestContents(s, vu(r));
    if (!this.validator(l)) {
      const c = this.validator.errors?.map((o) => `${o.instancePath} ${o.message}`).join(", ");
      throw new Error(`Invalid manifest for plugin ${e}: ${c}`);
    }
    return l;
  }
  findManifestFile(e) {
    const r = ["manifest.json", "manifest.yaml", "manifest.yml"];
    for (const s of r) {
      const l = $e(e, s);
      if (Je(l))
        return l;
    }
  }
  parseManifestContents(e, r) {
    return r === ".yaml" || r === ".yml" ? vg.parse(e) : JSON.parse(e);
  }
  async loadPlugin(e, r) {
    if (this.plugins.get(r.id)) {
      this.logger.warn(`Plugin ${r.id} already loaded. Skipping duplicate at ${e}`);
      return;
    }
    const l = Ng(e, r.main), o = await new _g(l, this.buildSandboxOptions(r)).load(r.id);
    this.validatePluginModule(o, r);
    const f = Oe(`plugin:${r.id}`), d = (y, v) => {
      this.eventBus.emitPluginTrigger({
        pluginId: r.id,
        triggerId: y,
        data: v,
        timestamp: Date.now()
      });
    }, u = (y) => {
      const v = {
        ...y,
        at: y.at ?? Date.now()
      };
      this.statuses.set(r.id, v), this.eventBus.emitPluginStatus({
        pluginId: r.id,
        status: v
      });
    }, n = this.stores.getPluginConfig(r.id), i = this.stores.getPluginSecrets(r.id), a = (y) => ({
      get: (v) => y.get(v),
      set: (v, w) => {
        y.set(v, w);
      },
      delete: (v) => {
        y.delete(v);
      },
      clear: () => {
        y.clear();
      }
    }), h = {
      logger: f,
      eventBus: this.eventBus,
      settings: this.stores.settings,
      emitTrigger: d,
      emitStatus: u,
      storage: {
        config: a(n),
        secrets: a(i)
      }
    };
    await o.initialize?.(h);
    const p = o.registerTriggers?.() ?? [], g = o.registerActions?.() ?? [], m = o.getConfigSchema?.();
    this.plugins.set(r.id, {
      manifest: r,
      instance: o,
      context: h,
      triggers: p,
      actions: g,
      configSchema: m
    }), await o.startListening?.(), this.logger.info(`Loaded plugin ${r.id}@${r.version} from ${Of(e)}`), this.statuses.has(r.id) || u({ state: "idle", message: "Plugin loaded" });
  }
  validatePluginModule(e, r) {
    const s = [
      "initialize",
      "registerTriggers",
      "registerActions",
      "startListening",
      "stopListening",
      "executeAction",
      "destroy"
    ];
    for (const l of s)
      if (typeof e[l] != "function")
        throw new Error(`Plugin ${r.id} is missing required function '${String(l)}'`);
  }
  buildSandboxOptions(e) {
    const r = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set();
    if (e.dependencies)
      for (const l of Object.keys(e.dependencies))
        r.add(l);
    if (e.permissions)
      for (const l of e.permissions) {
        const [c, o] = l.split(":");
        c === "module" && o && s.add(o);
      }
    return {
      allowedPackages: Array.from(r),
      allowedModules: Array.from(s)
    };
  }
}
const Lg = () => $e(process.env.APP_ROOT ?? process.cwd(), "src", "plugins"), qg = () => $e(process.cwd(), "plugins-external"), au = /{{\s*([^{}]+)\s*}}/g, Mg = 6, ou = 1e4, Ti = (t, e) => Ci(t, e, 0), Ci = (t, e, r) => {
  if (r > Mg)
    throw new Error("Exceeded maximum expression resolution depth");
  if (typeof t == "string")
    return Dg(t, e);
  if (Array.isArray(t))
    return t.map((s) => Ci(s, e, r + 1));
  if (t && typeof t == "object") {
    const s = {};
    for (const [l, c] of Object.entries(t))
      s[l] = Ci(c, e, r + 1);
    return s;
  }
  return t;
}, Dg = (t, e) => {
  if (!t.includes("{{"))
    return t;
  const r = t.trim();
  if (r.startsWith("{{") && r.endsWith("}}") && r.match(au)?.length === 1) {
    const c = r.slice(2, -2);
    return cu(c, e);
  }
  const l = t.replace(au, (c, o) => {
    const f = cu(o, e);
    return f == null ? "" : typeof f == "object" ? JSON.stringify(f) : String(f);
  });
  return l.length > ou ? l.slice(0, ou) : l;
}, cu = (t, e) => {
  const [r, ...s] = t.split("|").map((c) => c.trim()).filter(Boolean);
  if (!r)
    return;
  let l = Fg(r, e);
  for (const c of s)
    l = jg(c, l);
  return l;
}, jg = (t, e) => {
  switch (t) {
    case "upper":
      return typeof e == "string" ? e.toUpperCase() : e;
    case "lower":
      return typeof e == "string" ? e.toLowerCase() : e;
    case "json":
      return JSON.stringify(e);
    case "number":
      if (typeof e == "number")
        return e;
      if (typeof e == "string") {
        const r = Number(e);
        return Number.isNaN(r) ? e : r;
      }
      return e;
    default:
      return e;
  }
}, Fg = (t, e) => {
  const r = t.split(".").map((c) => c.trim()).filter(Boolean);
  if (r.length === 0)
    return;
  const [s, ...l] = r;
  switch (s) {
    case "variables": {
      const [c, ...o] = l;
      if (!lu(c))
        return;
      const f = e.context.variables[c];
      return Be(f, o);
    }
    case "payload":
      return Be(e.context.payload, l);
    case "context": {
      const [c, ...o] = l;
      if (c === "payload")
        return Be(e.context.payload, o);
      if (c === "trigger")
        return Be(e.context.trigger, o);
      if (c === "locals")
        return Be(e.context.locals ?? {}, o);
      if (c === "variables") {
        const [f, ...d] = o;
        return lu(f) ? Be(e.context.variables[f], d) : void 0;
      }
      return;
    }
    case "trigger":
      return Be(e.context.trigger, l);
    case "locals":
      return Be(e.context.locals ?? {}, l);
    default:
      return;
  }
}, Be = (t, e) => {
  let r = t;
  for (const s of e) {
    if (r == null)
      return;
    if (Array.isArray(r)) {
      const l = Number(s);
      if (Number.isNaN(l))
        return;
      r = r[l];
      continue;
    }
    if (typeof r == "object") {
      r = r[s];
      continue;
    }
    return;
  }
  return r;
}, lu = (t) => t === "global" || t === "plugin" || t === "rule";
class gt {
  static MAX_ACTION_DEPTH = 8;
  static MAX_LOOP_ITERATIONS = 100;
  static SCRIPT_TIMEOUT_MS = 3e3;
  eventBus;
  repository;
  variables;
  pluginManager;
  logger;
  unsubscribe = null;
  constructor(e, r, s, l, c) {
    this.eventBus = e, this.repository = r, this.pluginManager = s, this.variables = l, this.logger = c?.logger ?? Oe("RuleEngine");
  }
  start() {
    this.unsubscribe || (this.logger.info("Rule engine started"), this.unsubscribe = this.eventBus.onPluginTrigger((e) => {
      this.handleTrigger(e);
    }));
  }
  stop() {
    this.unsubscribe && (this.logger.info("Rule engine stopped"), this.unsubscribe(), this.unsubscribe = null);
  }
  listRules() {
    return this.repository.listRules();
  }
  getRule(e) {
    return this.repository.getRule(e);
  }
  saveRule(e) {
    const r = Vg(e);
    return this.repository.save(r), r;
  }
  deleteRule(e) {
    this.repository.deleteRule(e);
  }
  testRule(e, r) {
    const s = {
      trigger: e.trigger,
      payload: r,
      variables: this.variables.getSnapshot(e.id, e.trigger.pluginId),
      locals: {}
    };
    return uu(e, r, s);
  }
  async handleTrigger(e) {
    const r = this.repository.listByTrigger({ pluginId: e.pluginId, triggerId: e.triggerId });
    if (r.length === 0)
      return;
    const s = [];
    for (const l of r)
      try {
        const c = {
          trigger: { pluginId: e.pluginId, triggerId: e.triggerId },
          eventTimestamp: e.timestamp,
          payload: e.data,
          variables: this.variables.getSnapshot(l.id, e.pluginId),
          locals: {}
        }, o = uu(l, e.data, c);
        if (s.push({ ruleId: l.id, matched: o.matched, reason: o.reason }), this.eventBus.emit({
          type: "rule.evaluation",
          payload: {
            ruleId: l.id,
            context: c,
            result: o
          }
        }), !o.matched)
          continue;
        await this.dispatchActions(l, e, c);
      } catch (c) {
        const o = c instanceof Error ? c.message : String(c);
        this.logger.error(`Error while processing rule ${l.id}`, { error: c });
        const f = {
          ruleId: l.id,
          error: o,
          details: c instanceof Error ? { stack: c.stack } : void 0,
          occurredAt: Date.now()
        };
        this.eventBus.emit({ type: "rule.error", payload: f });
      }
    s.length > 0 && (e.matchedRules = s);
  }
  async dispatchActions(e, r, s) {
    await this.executeActionSequence(e, e.actions, r, s, 0);
  }
  async executeActionSequence(e, r, s, l, c) {
    if (!(!r || r.length === 0)) {
      if (c > gt.MAX_ACTION_DEPTH)
        throw new Error(`Maximum action depth exceeded for rule ${e.id}`);
      for (const o of r)
        await this.executeActionNode(e, o, s, l, c);
    }
  }
  async executeActionNode(e, r, s, l, c) {
    switch (r.kind ?? "plugin") {
      case "plugin":
        await this.executePluginAction(e, r, s, l);
        return;
      case "branch":
        await this.executeBranchAction(e, r, s, l, c + 1);
        return;
      case "loop":
        await this.executeLoopAction(e, r, s, l, c + 1);
        return;
      case "random":
        await this.executeRandomAction(e, r, s, l, c + 1);
        return;
      case "script":
        await this.executeScriptAction(e, r, s, l);
        return;
      case "variable":
        await this.executeVariableAction(e, r, s, l);
        return;
      default:
        this.logger.warn(`Encountered unsupported action kind ${r.kind ?? "plugin"} in rule ${e.id}`);
    }
  }
  async executePluginAction(e, r, s, l) {
    const c = {
      ruleId: e.id,
      action: r,
      dispatchedAt: Date.now()
    };
    try {
      const o = r.params ? Ti(r.params, { context: l }) : void 0;
      await this.pluginManager.executeAction(r.pluginId, r.actionId, {
        ...o ?? {},
        __sourceRule: e.id,
        __sourceEvent: {
          pluginId: s.pluginId,
          triggerId: s.triggerId,
          timestamp: s.timestamp
        },
        __context: l
      }), this.eventBus.emit({ type: "rule.action", payload: c });
    } catch (o) {
      const f = o instanceof Error ? o.message : String(o);
      this.logger.error(`Failed to dispatch plugin action ${r.actionId} for rule ${e.id}`, { error: o });
      const d = {
        ruleId: e.id,
        error: f,
        details: {
          action: c,
          error: o instanceof Error ? { stack: o.stack } : void 0
        },
        occurredAt: Date.now()
      };
      this.eventBus.emit({ type: "rule.error", payload: d });
    }
  }
  async executeBranchAction(e, r, s, l, c) {
    for (const o of r.branches)
      if (!o.when || o.when.length === 0 || o.when.every((d) => bf(d, s.data, l))) {
        await this.executeActionSequence(e, o.actions, s, l, c);
        return;
      }
    r.otherwise && r.otherwise.length > 0 && await this.executeActionSequence(e, r.otherwise, s, l, c);
  }
  async executeLoopAction(e, r, s, l, c) {
    const o = r.maxIterations ?? (r.forEach ? Number.MAX_SAFE_INTEGER : 1), f = Math.min(Math.max(o, 0), gt.MAX_LOOP_ITERATIONS);
    if (f <= 0)
      return;
    const d = Math.max(r.delayMs ?? 0, 0);
    if (r.forEach) {
      const u = Sf(s.data, r.forEach.path, l);
      if (!Array.isArray(u)) {
        this.logger.warn(`Loop forEach path '${r.forEach.path}' did not resolve to an array in rule ${e.id}`);
        return;
      }
      const n = r.forEach.as ?? "item", i = Math.min(f, u.length);
      for (let a = 0; a < i; a += 1) {
        const h = this.withLocals(l, {
          [n]: u[a],
          $index: a,
          $value: u[a]
        });
        await this.executeActionSequence(e, r.actions, s, h, c), d > 0 && await du(d);
      }
      return;
    }
    for (let u = 0; u < f; u += 1) {
      const n = this.withLocals(l, { $index: u });
      await this.executeActionSequence(e, r.actions, s, n, c), d > 0 && await du(d);
    }
  }
  async executeRandomAction(e, r, s, l, c) {
    if (!r.from || r.from.length === 0)
      return;
    const o = [...r.from], f = Math.max(
      1,
      Math.min(r.pick ?? 1, r.unique === !1 ? gt.MAX_LOOP_ITERATIONS : o.length)
    );
    if (r.unique === !1) {
      for (let u = 0; u < f; u += 1) {
        const n = o[Math.floor(Math.random() * o.length)];
        await this.executeActionNode(e, n, s, l, c);
      }
      return;
    }
    Bg(o);
    const d = o.slice(0, Math.min(f, o.length));
    for (const u of d)
      await this.executeActionNode(e, u, s, l, c);
  }
  async executeScriptAction(e, r, s, l) {
    try {
      const c = Math.min(Math.max(r.timeoutMs ?? gt.SCRIPT_TIMEOUT_MS, 1), 1e4), o = an.createContext({
        console: this.createScriptConsole(e.id),
        context: l,
        variables: this.variables.createScopedAccessor(e.id, s.pluginId),
        args: r.arguments ?? {},
        helpers: {
          setLocal: (d, u) => {
            l.locals = {
              ...l.locals ?? {},
              [d]: u
            };
          }
        }
      });
      new an.Script(r.code, {
        filename: `rule-${e.id}-script.js`
      }).runInContext(o, { timeout: c });
    } catch (c) {
      const o = c instanceof Error ? c.message : String(c);
      this.logger.error(`Script action failed for rule ${e.id}`, { error: c });
      const f = {
        ruleId: e.id,
        error: o,
        details: {
          action: r,
          error: c instanceof Error ? { stack: c.stack } : void 0
        },
        occurredAt: Date.now()
      };
      this.eventBus.emit({ type: "rule.error", payload: f });
    }
  }
  async executeVariableAction(e, r, s, l) {
    if (!r.key) {
      this.logger.warn(`Variable action missing key in rule ${e.id}`);
      return;
    }
    const c = this.buildVariableKey(r.scope, r.key, e, s), o = { type: "rule", id: e.id };
    try {
      switch (r.operation) {
        case "set": {
          const f = r.value !== void 0 ? Ti(r.value, { context: l }) : null;
          this.variables.setValue(c, f, o);
          break;
        }
        case "increment": {
          const f = r.amount ?? 1, d = Ti(f, { context: l }), u = typeof d == "number" ? d : Number(d);
          if (Number.isNaN(u))
            throw new Error(`Increment amount for variable '${r.key}' must be numeric`);
          this.variables.incrementValue(c, u, o);
          break;
        }
        case "reset": {
          this.variables.deleteValue(c, o);
          break;
        }
        default:
          this.logger.warn(`Unsupported variable operation ${r.operation} in rule ${e.id}`);
      }
    } catch (f) {
      const d = f instanceof Error ? f.message : String(f);
      this.logger.error(`Variable action failed for rule ${e.id}`, { error: f });
      const u = {
        ruleId: e.id,
        error: d,
        details: {
          action: r,
          error: f instanceof Error ? { stack: f.stack } : void 0
        },
        occurredAt: Date.now()
      };
      this.eventBus.emit({ type: "rule.error", payload: u });
    }
  }
  withLocals(e, r) {
    return {
      ...e,
      locals: {
        ...e.locals ?? {},
        ...r
      }
    };
  }
  buildVariableKey(e, r, s, l) {
    if (!r)
      throw new Error("Variable key is required");
    switch (e) {
      case "global":
        return { scope: e, key: r };
      case "plugin":
        return { scope: e, key: r, ownerId: l.pluginId };
      case "rule":
        return { scope: e, key: r, ownerId: s.id };
      default:
        throw new Error(`Unsupported variable scope ${e ?? "unknown"}`);
    }
  }
  createScriptConsole(e) {
    return {
      log: (...r) => this.logger.info(`Rule ${e} script log`, { args: r }),
      warn: (...r) => this.logger.warn(`Rule ${e} script warn`, { args: r }),
      error: (...r) => this.logger.error(`Rule ${e} script error`, { args: r })
    };
  }
}
const Vg = (t) => {
  const e = (/* @__PURE__ */ new Date()).toISOString();
  return {
    ...t,
    createdAt: t.createdAt ?? e,
    updatedAt: e
  };
}, uu = (t, e, r) => {
  if (!t.conditions || t.conditions.length === 0)
    return { ruleId: t.id, matched: !0 };
  for (const s of t.conditions)
    if (!bf(s, e, r))
      return {
        ruleId: t.id,
        matched: !1,
        reason: Ug(s)
      };
  return { ruleId: t.id, matched: !0 };
}, bf = (t, e, r) => {
  const s = Sf(e, t.path, r);
  switch (t.type) {
    case "equals":
      return Mt(s, t.value);
    case "notEquals":
      return !Mt(s, t.value);
    case "includes":
      return Array.isArray(s) ? s.some((l) => Mt(l, t.value)) : typeof s == "string" && typeof t.value == "string" ? s.includes(t.value) : !1;
    default:
      throw new Error(`Unsupported condition type ${t.type}`);
  }
}, Ug = (t) => {
  switch (t.type) {
    case "equals":
      return `Expected ${t.path} to equal ${JSON.stringify(t.value)}`;
    case "notEquals":
      return `Expected ${t.path} to differ from ${JSON.stringify(t.value)}`;
    case "includes":
      return `Expected ${t.path} to include ${JSON.stringify(t.value)}`;
    default:
      throw new Error(`Unsupported condition type ${t.type}`);
  }
}, Sf = (t, e, r) => {
  if (!e) return;
  const s = e.split(".").filter(Boolean);
  if (s.length === 0)
    return;
  const [l, ...c] = s;
  if (l === "variables" && r) {
    const [o, ...f] = c;
    return fu(o) ? Ke(r.variables[o], f) : void 0;
  }
  if (l === "context" && r) {
    const [o, ...f] = c;
    if (o === "payload")
      return Ke(r.payload, f);
    if (o === "trigger")
      return Ke(r.trigger, f);
    if (o === "locals")
      return Ke(r.locals ?? {}, f);
    if (o === "variables") {
      const [d, ...u] = f;
      return fu(d) ? Ke(r.variables[d], u) : void 0;
    }
    return;
  }
  return l === "payload" ? Ke(r?.payload ?? t, c) : l === "locals" ? Ke(r?.locals ?? {}, c) : Ke(t, s);
}, Ke = (t, e) => {
  if (e.length === 0)
    return t;
  let r = t;
  for (const s of e) {
    if (r == null)
      return;
    if (Array.isArray(r)) {
      const l = Number(s);
      if (Number.isNaN(l))
        return;
      r = r[l];
      continue;
    }
    if (typeof r == "object") {
      r = r[s];
      continue;
    }
    return;
  }
  return r;
}, fu = (t) => t === "global" || t === "plugin" || t === "rule", Bg = (t) => {
  for (let e = t.length - 1; e > 0; e -= 1) {
    const r = Math.floor(Math.random() * (e + 1));
    [t[e], t[r]] = [t[r], t[e]];
  }
  return t;
}, du = (t) => new Promise((e) => {
  setTimeout(() => e(), t);
}), Mt = (t, e) => {
  if (t === e) return !0;
  if (typeof t != typeof e) return !1;
  if (Array.isArray(t) && Array.isArray(e))
    return t.length !== e.length ? !1 : t.every((r, s) => Mt(r, e[s]));
  if (t && e && typeof t == "object" && typeof e == "object") {
    const r = Object.keys(t), s = Object.keys(e);
    return r.length !== s.length ? !1 : r.every((l) => Mt(t[l], e[l]));
  }
  return !1;
}, hu = "demo.timer-notification", Kg = (t) => {
  const e = t.getRule(hu);
  return e || t.saveRule({
    id: hu,
    name: "Demo: Timer Completed Notification",
    description: "Sends a notification through the System plugin whenever the demo timer finishes.",
    trigger: {
      pluginId: "system",
      triggerId: "timer.completed"
    },
    conditions: [
      {
        type: "includes",
        path: "timerId",
        value: "demo"
      }
    ],
    actions: [
      {
        pluginId: "system",
        actionId: "notification.send",
        params: {
          title: "Demo Timer",
          message: "The demo timer has completed."
        }
      }
    ],
    enabled: !0,
    priority: 0
  });
}, xg = (t) => {
  const { ipcMain: e } = yt;
  e.handle("plugins:list", () => t.listLoaded().map((r) => ({
    id: r.manifest.id,
    name: r.manifest.name,
    version: r.manifest.version,
    author: r.manifest.author,
    triggers: r.triggers,
    actions: r.actions,
    hasConfigSchema: !!r.configSchema
  }))), e.handle("plugins:get", (r, s) => {
    const l = t.getPlugin(s);
    return l ? {
      manifest: l.manifest,
      triggers: l.triggers,
      actions: l.actions,
      configSchema: l.configSchema
    } : null;
  }), e.handle("plugins:execute-action", async (r, s) => {
    const { pluginId: l, actionId: c, params: o } = s;
    return await t.executeAction(l, c, o), { status: "ok" };
  }), e.handle("plugins:statuses", () => t.listStatuses().map(({ pluginId: r, status: s }) => ({
    pluginId: r,
    status: s
  }))), e.handle("plugins:get-config", (r, s) => t.getConfig(s)), e.handle("plugins:save-config", (r, s) => {
    const { pluginId: l, config: c } = s;
    return { status: "ok", config: t.updateConfig(l, c) };
  });
}, zg = (t, e, r) => {
  const s = e.onPluginTrigger((u) => {
    t.isDestroyed() || t.webContents.send("events:plugin-trigger", u);
  }), l = e.onLog((u) => {
    t.isDestroyed() || t.webContents.send("events:log-entry", u);
  }), c = e.onPluginStatus((u) => {
    t.isDestroyed() || t.webContents.send("events:plugin-status", u);
  }), o = e.onVariableMutation((u) => {
    t.isDestroyed() || t.webContents.send("events:variables-mutated", u);
  }), f = () => {
    t.isDestroyed() || t.webContents.send("events:log-bootstrap", e.getRecentLogEntries(50));
  }, d = () => {
    !t.isDestroyed() && r && t.webContents.send("events:plugin-status-bootstrap", r());
  };
  t.webContents.isLoading() ? (t.webContents.once("did-finish-load", f), t.webContents.once("did-finish-load", d)) : (f(), d()), t.on("closed", () => {
    s(), l(), c(), o();
  });
}, Gg = (t) => {
  const { ipcMain: e } = yt;
  e.handle("rules:list", () => t.listRules()), e.handle("rules:get", (r, s) => t.getRule(s) ?? null), e.handle("rules:save", (r, s) => t.saveRule(s)), e.handle("rules:delete", (r, s) => (t.deleteRule(s), { status: "ok" })), e.handle("rules:test", (r, s) => {
    const { rule: l, data: c } = s;
    return t.testRule(l, c);
  });
};
class Yg {
  repository;
  eventBus;
  logger;
  constructor(e, r, s) {
    this.repository = e, this.eventBus = r, this.logger = s?.logger ?? Oe("VariableService");
  }
  getSnapshot(e, r) {
    return this.repository.getSnapshot(e, r);
  }
  list(e, r) {
    return this.repository.list(e, r);
  }
  getValue(e) {
    return this.repository.getValue(e)?.value;
  }
  setValue(e, r, s) {
    const l = this.repository.getValue(e)?.value, c = this.repository.setValue(e, r);
    return this.publishMutation(c, l, s), c;
  }
  incrementValue(e, r, s) {
    const l = this.repository.getValue(e)?.value;
    let c = typeof l == "number" ? l : void 0;
    l === void 0 && (c = 0);
    const o = this.repository.incrementValue(e, r);
    return this.publishMutation(o, c, s), o;
  }
  deleteValue(e, r) {
    const s = this.repository.getValue(e);
    if (!s)
      return !1;
    const l = this.repository.deleteValue(e);
    return l && this.publishMutation(
      { ...s, value: void 0 },
      s.value,
      r
    ), l;
  }
  getAllVariables() {
    const e = this.repository.list("global"), r = this.repository.list("plugin"), s = this.repository.list("rule");
    return [...e, ...r, ...s];
  }
  set(e, r, s) {
    return this.setValue(e, r, s);
  }
  createScopedAccessor(e, r) {
    const s = (c, o, f) => {
      if (!o)
        throw new Error("Variable key is required");
      return {
        scope: c,
        key: o,
        ownerId: f ?? Hg(c, e, r)
      };
    }, l = (c, o) => ({
      get: (f) => this.getValue(s(c, f, o)),
      set: (f, d) => this.setValue(s(c, f, o), d, { type: "rule", id: e }),
      increment: (f, d = 1) => this.incrementValue(s(c, f, o), d, { type: "rule", id: e }),
      reset: (f) => this.deleteValue(s(c, f, o), { type: "rule", id: e })
    });
    return {
      global: l("global"),
      plugin: l("plugin"),
      rule: l("rule")
    };
  }
  publishMutation(e, r, s) {
    const l = {
      key: {
        scope: e.scope,
        key: e.key,
        ownerId: e.ownerId
      },
      value: e.value,
      previousValue: r,
      mutatedAt: Date.now(),
      source: s
    };
    this.logger.debug("Variable mutated", {
      scope: e.scope,
      key: e.key,
      ownerId: e.ownerId,
      source: s
    }), this.eventBus.emitVariableMutation(l);
  }
}
const Hg = (t, e, r) => {
  switch (t) {
    case "global":
      return;
    case "plugin":
      return r;
    case "rule":
      return e;
    default:
      return;
  }
}, Ct = (t) => {
  if (t === "global" || t === "plugin" || t === "rule")
    return t;
  throw new Error(`Unsupported variable scope '${t}'`);
}, Jg = (t) => {
  const { ipcMain: e } = yt;
  e.handle("variables:list", (r, s) => {
    const l = Ct(s.scope);
    return t.list(l, s.ownerId);
  }), e.handle(
    "variables:get",
    (r, s) => {
      const l = Ct(s.scope);
      return t.getValue({ scope: l, key: s.key, ownerId: s.ownerId }) ?? null;
    }
  ), e.handle(
    "variables:set",
    (r, s) => {
      const l = Ct(s.scope);
      return t.setValue(
        { scope: l, key: s.key, ownerId: s.ownerId },
        s.value,
        { type: "user" }
      );
    }
  ), e.handle(
    "variables:increment",
    (r, s) => {
      const l = Ct(s.scope), c = typeof s.amount == "number" ? s.amount : 1;
      return t.incrementValue(
        { scope: l, key: s.key, ownerId: s.ownerId },
        c,
        { type: "user" }
      );
    }
  ), e.handle("variables:reset", (r, s) => {
    const l = Ct(s.scope);
    return t.deleteValue({ scope: l, key: s.key, ownerId: s.ownerId }, { type: "user" }), { status: "ok" };
  }), e.handle(
    "variables:snapshot",
    (r, s) => t.getSnapshot(s.ruleId, s.pluginId)
  );
};
function Xg(t) {
  xt.handle("migrations:getStatus", () => t.getMigrationStatus()), xt.handle("migrations:runPending", async () => {
    try {
      return await t.runPendingMigrations(), { success: !0 };
    } catch (e) {
      return {
        success: !1,
        error: e instanceof Error ? e.message : String(e)
      };
    }
  }), xt.handle("migrations:getPending", () => t.getPendingMigrations().map((r) => ({
    id: r.id,
    name: r.name
  }))), xt.handle("migrations:getApplied", () => t.getAppliedMigrations().map((r) => ({
    id: r.id,
    name: r.name,
    appliedAt: r.applied_at
  })));
}
const Wg = wu(import.meta.url), Qg = $u(import.meta.url), Ef = yu(Qg), { app: De, BrowserWindow: _f, Menu: pu } = yt;
process.env.APP_ROOT = process.env.APP_ROOT ?? $e(Ef, "..");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL ? $e(process.env.APP_ROOT, "public") : $e(process.env.APP_ROOT, "dist");
const Lt = new Ff();
let He = null, pt = null, Li = null, qt = null, tn = null, mu = !1;
const We = (t, e) => {
  Li ? Li.error(t, { error: e }) : console.error(t, e);
};
process.on("unhandledRejection", (t) => {
  We("Unhandled promise rejection", t);
});
process.on("uncaughtException", (t) => {
  We("Uncaught exception", t);
});
function Zg(t) {
  Je(t) || sn(t, { recursive: !0 });
}
async function Nf() {
  const t = new _f({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    show: !1,
    title: "Aidle",
    backgroundColor: "#0f172a",
    webPreferences: {
      preload: $e(Ef, "preload.mjs"),
      contextIsolation: !0
    }
  });
  return t.once("ready-to-show", () => {
    t.show();
  }), process.env.VITE_DEV_SERVER_URL ? (await t.loadURL(process.env.VITE_DEV_SERVER_URL), t.webContents.openDevTools({ mode: "detach" })) : await t.loadFile($e(process.env.APP_ROOT, "dist", "index.html")), zg(t, Lt, () => He?.listStatuses() ?? []), t;
}
function ey() {
  const t = [
    {
      label: De.name,
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
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "pasteAndMatchStyle" },
        { role: "selectAll" }
      ]
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
            const { shell: e } = Wg("electron");
            await e.openExternal("https://aidle.app");
          }
        }
      ]
    }
  ];
  pu.setApplicationMenu(pu.buildFromTemplate(t));
}
async function ty() {
  await De.whenReady(), Li = Oe("main"), ey(), pt = new xm(Lt);
  try {
    await pt.runMigrations(), Xg(pt.migrationRunner);
  } catch (r) {
    We("Failed to run database migrations", r), De.exit(1);
    return;
  }
  tn = new Yg(pt.variables, Lt);
  const t = {
    builtInDirectory: Lg(),
    externalDirectory: qg()
  };
  Zg(t.externalDirectory), He = new Cg(t, Lt, pt), xg(He), tn && Jg(tn);
  const e = await Nf();
  try {
    await He.loadPlugins(), qt = new gt(Lt, pt.rules, He, tn), qt.start(), Kg(qt), Gg(qt);
  } catch (r) {
    We("Failed to load plugins", r), e.webContents.send("main-process-error", "Failed to load plugins. See logs for details.");
  }
}
ty().catch((t) => {
  We("Unhandled error during bootstrap", t), De.exit(1);
});
De.on("window-all-closed", () => {
  process.platform !== "darwin" && De.quit();
});
De.on("activate", () => {
  _f.getAllWindows().length === 0 && Nf().catch((t) => {
    We("Failed to recreate main window", t);
  });
});
De.on("before-quit", async (t) => {
  if (He && !mu) {
    t.preventDefault(), mu = !0;
    try {
      qt?.stop(), await He.unloadAll();
    } catch (e) {
      We("Error while shutting down plugins", e);
    }
    De.exit();
  }
});
