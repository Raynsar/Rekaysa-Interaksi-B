import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const tokensFile = join(root, 'src', 'styles', 'tokens.css')
const tokensCss = readFileSync(tokensFile, 'utf8')

const defined = new Set(
  [...tokensCss.matchAll(/--([a-z0-9-]+)\s*:/g)].map((match) => match[1]),
)

function collectFiles(directory) {
  const result = []
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry)
    if (statSync(fullPath).isDirectory()) {
      result.push(...collectFiles(fullPath))
    } else if (/\.(css|ts|tsx)$/.test(entry)) {
      result.push(fullPath)
    }
  }
  return result
}

const files = collectFiles(join(root, 'src'))
const used = new Map()
const undefinedTokens = new Set()
const violations = []

for (const file of files) {
  const content = readFileSync(file, 'utf8')
  const relativePath = relative(root, file)

  for (const match of content.matchAll(/var\(\s*--([a-z0-9-]+)/g)) {
    const name = match[1]
    used.set(name, (used.get(name) ?? 0) + 1)
    if (!defined.has(name)) undefinedTokens.add(name)
  }

  if (relativePath.endsWith('.css') && !relativePath.endsWith('tokens.css')) {
    const withoutComments = content.replace(/\/\*[\s\S]*?\*\//g, '')
    const hex = [...withoutComments.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0])
    const px = [...withoutComments.matchAll(/\b\d+(?:\.\d+)?px\b/g)].map((m) => m[0])
    if (hex.length || px.length) {
      violations.push({ file: relativePath, hex, px })
    }
  }
}

const unusedTokens = [...defined].filter((name) => !used.has(name)).sort()

const report = {
  tokensDefined: defined.size,
  tokensUsed: used.size,
  varUsages: [...used.values()].reduce((sum, count) => sum + count, 0),
  undefinedTokensUsed: [...undefinedTokens].sort(),
  unusedTokens,
  cssHardcodedViolations: violations,
}

console.log(JSON.stringify(report, null, 2))

if (undefinedTokens.size || violations.length) process.exitCode = 1
