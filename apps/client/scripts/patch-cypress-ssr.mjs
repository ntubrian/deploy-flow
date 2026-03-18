import { readFileSync, writeFileSync } from 'node:fs'

const reactLibPath = new URL('../.output/server/_libs/react.mjs', import.meta.url)
const originalSnippet = 'reactJsxDevRuntime_production.jsxDEV = void 0;'
const patchedSnippet =
  'reactJsxDevRuntime_production.jsxDEV = jsxRuntimeExports.jsx;'

const source = readFileSync(reactLibPath, 'utf8')

if (!source.includes(originalSnippet) && !source.includes(patchedSnippet)) {
  throw new Error(`Unable to patch ${reactLibPath.pathname}: jsxDEV snippet not found`)
}

if (source.includes(patchedSnippet)) {
  process.exit(0)
}

writeFileSync(reactLibPath, source.replace(originalSnippet, patchedSnippet))
