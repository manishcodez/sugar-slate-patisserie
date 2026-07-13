import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const DATA_FILES = [
  'src/data/menuItems.js',
  'src/data/gallery.js',
  'src/data/shopCategories.js',
]

function extractImagePaths(content) {
  const matches = content.matchAll(/from '\.\.\/assets\/images\/[^']+'/g)
  return [...matches].map((m) => m[0].replace("from '", '').replace("'", ''))
}

let allPaths = []
const duplicates = new Map()
const missing = []

for (const file of DATA_FILES) {
  const content = fs.readFileSync(path.join(ROOT, file), 'utf8')
  const paths = extractImagePaths(content)
  allPaths.push(...paths.map((p) => ({ file, path: p })))
}

const seen = new Map()
for (const entry of allPaths) {
  const filename = path.basename(entry.path)
  if (seen.has(filename)) {
    duplicates.set(filename, [...(duplicates.get(filename) || [seen.get(filename)]), entry.file])
  } else {
    seen.set(filename, entry.file)
  }

  const fullPath = path.resolve(path.join(ROOT, 'src/data'), entry.path)
  if (!fs.existsSync(fullPath)) {
    missing.push({ file: entry.file, path: entry.path, fullPath })
  }
}

console.log('IMAGE VERIFICATION REPORT')
console.log('='.repeat(60))
console.log(`Total image imports: ${allPaths.length}`)
console.log(`Unique filenames: ${seen.size}`)

if (duplicates.size > 0) {
  console.log('\nDUPLICATE FILENAMES:')
  for (const [filename, files] of duplicates) {
    console.log(`  ${filename} used in: ${files.join(', ')}`)
  }
} else {
  console.log('\nNo duplicate image filenames across products/gallery/categories.')
}

if (missing.length > 0) {
  console.log('\nMISSING FILES:')
  for (const m of missing) {
    console.log(`  ${m.path} (referenced in ${m.file})`)
  }
  process.exitCode = 1
} else {
  console.log('\nAll referenced image files exist on disk.')
}
