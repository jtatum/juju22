#!/usr/bin/env node
/* eslint-env node */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const [, , rawId, rawName] = process.argv

if (!rawId) {
  console.error('Usage: npm run create:plugin <plugin-id> [plugin name]')
  process.exit(1)
}

const pluginId = rawId.trim()
const pluginName = (rawName ?? pluginId).trim()

const scriptDir = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(scriptDir, '..')
const templateDir = resolve(rootDir, 'templates', 'plugin-basic')
const targetDir = resolve(rootDir, 'plugins-external', pluginId)

if (!existsSync(templateDir)) {
  console.error('Template directory not found:', templateDir)
  process.exit(1)
}

if (existsSync(targetDir)) {
  console.error('Plugin directory already exists:', targetDir)
  process.exit(1)
}

mkdirSync(targetDir, { recursive: true })
cpSync(templateDir, targetDir, { recursive: true })

const manifestPath = join(targetDir, 'manifest.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
manifest.id = pluginId
manifest.name = pluginName
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

console.log(`✔ Created plugin ${pluginId}`)
console.log(targetDir)
