import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import reactRefresh from 'eslint-plugin-react-refresh'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  js.configs.recommended,
  ...compat.extends('plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended'),
  {
    ignores: ['dist', 'dist-electron'],
  },
  {
    files: ['src/main/**/*.{ts,tsx}', 'electron/**/*.{ts,tsx}', 'src/plugins/**/*.{js,ts}', 'tests/**/*.{js,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
  },
  {
    files: ['scripts/**/*.{js,mjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['src/plugins/**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]
