import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, extname, join } from 'node:path'
import vm from 'node:vm'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type { PluginModule } from '../../shared/plugins/types'

const allowedModules = new Set([
  'events',
  'path',
  'url',
  'buffer',
  'timers',
  'util',
])

const allowedNodePrefixes = ['node:']

function createSandboxedRequire(entryPath: string) {
  const localRequire = createRequire(entryPath)
  return (specifier: string) => {
    if (specifier.startsWith('./') || specifier.startsWith('../') || specifier.startsWith('/')) {
      return localRequire(specifier)
    }

    if (allowedNodePrefixes.some((prefix) => specifier.startsWith(prefix))) {
      return localRequire(specifier)
    }

    if (allowedModules.has(specifier)) {
      return localRequire(specifier)
    }

    throw new Error(`Module '${specifier}' is not allowed in sandboxed plugin`)
  }
}

function createProcessProxy(pluginId: string) {
  const allowedKeys = new Set(['env', 'versions', 'platform', 'arch'])
  const target = {
    env: process.env,
    versions: process.versions,
    platform: process.platform,
    arch: process.arch,
  }

  return new Proxy(target, {
    get(obj, prop: string) {
      if (!allowedKeys.has(prop)) {
        throw new Error(`Access to process.${prop} is not permitted for plugin ${pluginId}`)
      }
      return obj[prop as keyof typeof obj]
    },
  })
}

export class PluginSandbox {
  private readonly entryPath: string

  constructor(entryPath: string) {
    this.entryPath = entryPath
  }

  async load(pluginId: string): Promise<PluginModule> {
    const resolvedPath = this.resolveEntry(this.entryPath)
    if (!existsSync(resolvedPath)) {
      throw new Error(`Plugin entry not found at ${resolvedPath}`)
    }

    const code = await readFile(resolvedPath, 'utf-8')
    const script = new vm.Script(code, {
      filename: resolvedPath,
      displayErrors: true,
    })

    const module = { exports: {} as PluginModule }
    const sandbox = vm.createContext({
      module,
      exports: module.exports,
      require: createSandboxedRequire(resolvedPath),
      __dirname: dirname(resolvedPath),
      __filename: resolvedPath,
      console,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      Buffer,
      process: createProcessProxy(pluginId),
    })

    script.runInContext(sandbox, { timeout: 5000 })
    const exported = sandbox.module.exports ?? sandbox.exports

    if (!exported) {
      throw new Error(`Plugin at ${resolvedPath} did not export a module`)
    }

    return exported.default ?? exported
  }

  private resolveEntry(entry: string) {
    const extension = extname(entry)
    if (extension === '.mjs' || extension === '.cjs' || extension === '.js') {
      return entry
    }

    if (extension === '') {
      return `${entry}.js`
    }

    throw new Error(`Unsupported plugin entry extension: ${extension}`)
  }
}

export const resolvePluginEntry = (pluginRoot: string, main: string) => {
  const entryUrl = pathToFileURL(join(pluginRoot, main))
  return fileURLToPath(entryUrl)
}
