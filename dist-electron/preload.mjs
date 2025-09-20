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
  execute: "plugins:execute-action",
  statuses: "plugins:statuses",
  getConfig: "plugins:get-config",
  saveConfig: "plugins:save-config"
};
const ruleChannels = {
  list: "rules:list",
  get: "rules:get",
  save: "rules:save",
  delete: "rules:delete",
  test: "rules:test"
};
const variableChannels = {
  list: "variables:list",
  get: "variables:get",
  set: "variables:set",
  increment: "variables:increment",
  reset: "variables:reset",
  snapshot: "variables:snapshot"
};
const { contextBridge, ipcRenderer } = electron__namespace;
const aidleBridge = {
  plugins: {
    list: () => ipcRenderer.invoke(pluginChannels.list),
    get: (pluginId) => ipcRenderer.invoke(pluginChannels.get, pluginId),
    executeAction: (pluginId, actionId, params) => ipcRenderer.invoke(pluginChannels.execute, { pluginId, actionId, params }),
    listStatuses: () => ipcRenderer.invoke(pluginChannels.statuses),
    getConfig: (pluginId) => ipcRenderer.invoke(pluginChannels.getConfig, pluginId),
    saveConfig: (pluginId, config) => ipcRenderer.invoke(pluginChannels.saveConfig, { pluginId, config })
  },
  rules: {
    list: () => ipcRenderer.invoke(ruleChannels.list),
    get: (ruleId) => ipcRenderer.invoke(ruleChannels.get, ruleId),
    save: (rule) => ipcRenderer.invoke(ruleChannels.save, rule),
    delete: (ruleId) => ipcRenderer.invoke(ruleChannels.delete, ruleId),
    test: (rule, data) => ipcRenderer.invoke(ruleChannels.test, { rule, data })
  },
  variables: {
    list: (scope, ownerId) => ipcRenderer.invoke(variableChannels.list, { scope, ownerId }),
    get: (scope, key, ownerId) => ipcRenderer.invoke(variableChannels.get, { scope, key, ownerId }),
    set: (scope, key, value, ownerId) => ipcRenderer.invoke(variableChannels.set, { scope, key, value, ownerId }),
    increment: (scope, key, amount = 1, ownerId) => ipcRenderer.invoke(variableChannels.increment, { scope, key, amount, ownerId }),
    reset: (scope, key, ownerId) => ipcRenderer.invoke(variableChannels.reset, { scope, key, ownerId }),
    snapshot: (ruleId, pluginId) => ipcRenderer.invoke(variableChannels.snapshot, { ruleId, pluginId })
  },
  events: {
    onPluginTrigger: (handler) => {
      const listener = (_event, payload) => handler(payload);
      ipcRenderer.on("events:plugin-trigger", listener);
      return () => ipcRenderer.off("events:plugin-trigger", listener);
    },
    onPluginStatus: (handler) => {
      const listener = (_event, payload) => handler(payload);
      ipcRenderer.on("events:plugin-status", listener);
      return () => ipcRenderer.off("events:plugin-status", listener);
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
    },
    onPluginStatusBootstrap: (handler) => {
      const listener = (_event, entries) => handler(entries);
      ipcRenderer.on("events:plugin-status-bootstrap", listener);
      return () => ipcRenderer.off("events:plugin-status-bootstrap", listener);
    },
    onVariableMutation: (handler) => {
      const listener = (_event, mutation) => handler(mutation);
      ipcRenderer.on("events:variables-mutated", listener);
      return () => ipcRenderer.off("events:variables-mutated", listener);
    }
  }
};
contextBridge.exposeInMainWorld("aidle", aidleBridge);
