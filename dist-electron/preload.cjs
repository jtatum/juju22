"use strict";
const electron = require("electron");
const { contextBridge, ipcRenderer } = electron;
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
const juju22Bridge = {
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
    },
    onError: (handler) => {
      const listener = (_event, error) => handler(error);
      ipcRenderer.on("error:reported", listener);
      return () => ipcRenderer.off("error:reported", listener);
    },
    onErrorRecovered: (handler) => {
      const listener = (_event, recovery) => handler(recovery);
      ipcRenderer.on("error:recovered", listener);
      return () => ipcRenderer.off("error:recovered", listener);
    },
    onCircuitOpened: (handler) => {
      const listener = (_event, circuit) => handler(circuit);
      ipcRenderer.on("circuit:opened", listener);
      return () => ipcRenderer.off("circuit:opened", listener);
    },
    onCircuitClosed: (handler) => {
      const listener = (_event, circuit) => handler(circuit);
      ipcRenderer.on("circuit:closed", listener);
      return () => ipcRenderer.off("circuit:closed", listener);
    },
    // Generic event listeners for custom events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on: (channel, callback) => {
      const listener = (_event, ...args) => callback(...args);
      ipcRenderer.on(channel, listener);
      return () => ipcRenderer.off(channel, listener);
    },
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
  },
  settings: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: (key) => ipcRenderer.invoke("settings:get", key),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set: (key, value) => ipcRenderer.invoke("settings:set", key, value),
    has: (key) => ipcRenderer.invoke("settings:has", key),
    delete: (key) => ipcRenderer.invoke("settings:delete", key),
    clear: () => ipcRenderer.invoke("settings:clear")
  },
  backup: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create: (label) => ipcRenderer.invoke("backup:create", label),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    list: () => ipcRenderer.invoke("backup:list"),
    restore: (backupId) => ipcRenderer.invoke("backup:restore", backupId),
    delete: (backupId) => ipcRenderer.invoke("backup:delete", backupId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSettings: () => ipcRenderer.invoke("backup:getSettings"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateSettings: (settings) => ipcRenderer.invoke("backup:updateSettings", settings)
  },
  importExport: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exportRules: (ruleIds) => ipcRenderer.invoke("import-export:exportRules", ruleIds),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    importRules: () => ipcRenderer.invoke("import-export:importRules")
  },
  performance: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getMetrics: () => ipcRenderer.invoke("performance:getMetrics"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getMemoryMetrics: () => ipcRenderer.invoke("performance:getMemoryMetrics"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    detectMemoryLeaks: () => ipcRenderer.invoke("performance:detectMemoryLeaks")
  },
  // Generic invoke for any custom IPC handlers (for backwards compatibility during migration)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
};
contextBridge.exposeInMainWorld("juju22", juju22Bridge);
