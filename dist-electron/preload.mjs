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
const { contextBridge, ipcRenderer } = electron__namespace;
const aidleBridge = {
  plugins: {
    list: () => ipcRenderer.invoke(pluginChannels.list),
    get: (pluginId) => ipcRenderer.invoke(pluginChannels.get, pluginId),
    executeAction: (pluginId, actionId, params) => ipcRenderer.invoke(pluginChannels.execute, { pluginId, actionId, params })
  },
  events: {
    onPluginTrigger: (handler) => {
      const listener = (_event, payload) => handler(payload);
      ipcRenderer.on("events:plugin-trigger", listener);
      return () => ipcRenderer.off("events:plugin-trigger", listener);
    }
  }
};
contextBridge.exposeInMainWorld("aidle", aidleBridge);
