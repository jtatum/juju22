"use strict";
const electron = require("electron");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const electron__namespace = /* @__PURE__ */ _interopNamespaceDefault(electron);
const pluginChannels = {
  list: "plugins:list",
  get: "plugins:get",
  execute: "plugins:execute-action"
};
const ruleChannels = {
  list: "rules:list",
  get: "rules:get",
  save: "rules:save",
  delete: "rules:delete"
};
const { contextBridge, ipcRenderer } = electron__namespace;
const aidleBridge = {
  plugins: {
    list: () => ipcRenderer.invoke(pluginChannels.list),
    get: (pluginId) => ipcRenderer.invoke(pluginChannels.get, pluginId),
    executeAction: (pluginId, actionId, params) => ipcRenderer.invoke(pluginChannels.execute, { pluginId, actionId, params })
  },
  rules: {
    list: () => ipcRenderer.invoke(ruleChannels.list),
    get: (ruleId) => ipcRenderer.invoke(ruleChannels.get, ruleId),
    save: (rule) => ipcRenderer.invoke(ruleChannels.save, rule),
    delete: (ruleId) => ipcRenderer.invoke(ruleChannels.delete, ruleId)
  },
  events: {
    onPluginTrigger: (handler) => {
      const listener = (_event, payload) => handler(payload);
      ipcRenderer.on("events:plugin-trigger", listener);
      return () => ipcRenderer.off("events:plugin-trigger", listener);
    },
    onLogEntry: (handler) => {
      const listener = (_event, entry) => handler(entry);
      ipcRenderer.on("events:log-entry", listener);
      return () => ipcRenderer.off("events:log-entry", listener);
    },
    onLogBootstrap: (handler) => {
      const listener = (_event, entries) => handler(entries);
      ipcRenderer.on("events:log-bootstrap", listener);
      return () => ipcRenderer.off("events:log-bootstrap", listener);
    }
  }
};
contextBridge.exposeInMainWorld("aidle", aidleBridge);
