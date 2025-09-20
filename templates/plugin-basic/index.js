/* eslint-env node */
/* global require, module, console */
/* eslint-disable @typescript-eslint/no-require-imports */
const manifest = require('./manifest.json')

/** @type {import('@aidle/plugin-sdk').PluginModule} */
const plugin = {
  manifest,
  async initialize(context) {
    context.logger.info('Example plugin initialized')
  },
  registerTriggers() {
    return []
  },
  registerActions() {
    return []
  },
  async startListening() {},
  async stopListening() {},
  async executeAction(actionId, params) {
    console.log('Example plugin received action', actionId, params)
  },
  async destroy() {},
}

module.exports = plugin
