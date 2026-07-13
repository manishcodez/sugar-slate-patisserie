import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function toVar(slug) {
  return slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())
}

function parseMenuItems() {
  const content = fs.readFileSync(path.join(ROOT, 'src/data/menuItems.js'), 'utf8')
  const blocks = content.split(/\n\s*{\s*\n/).slice(1)
  const items = []

  for (const block of blocks) {
    const id = block.match(/id:\s*(\d+)/)?.[1]
    const name = block.match(/name:\s*'([^']+)'/)?.[1]
    if (id && name) {
      const slug = slugify(name)
      items.push({ id: Number(id), name, slug, varName: toVar(slug) })
    }
  }

  return items
}

function updateMenuItems() {
  const products = parseMenuItems()
  const imports = products
    .map((p) => `import ${p.varName} from '../assets/images/products/${p.slug}.jpg'`)
    .join('\n')

  let content = fs.readFileSync(path.join(ROOT, 'src/data/menuItems.js'), 'utf8')
  content = content.replace(/import \{ GALLERY_IMAGES, MENU_IMAGES \} from '\.\/images'\n\n/, `${imports}\n\n`)

  for (const product of products) {
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].includes(`id: ${product.id},`)) continue
      for (let j = i; j < Math.min(i + 6, lines.length); j++) {
        if (/image: (?:MENU_IMAGES|GALLERY_IMAGES)\./.test(lines[j])) {
          lines[j] = lines[j].replace(/image: (?:MENU_IMAGES|GALLERY_IMAGES)\.\w+/, `image: ${product.varName}`)
          break
        }
      }
      break
    }
    content = lines.join('\n')
  }

  fs.writeFileSync(path.join(ROOT, 'src/data/menuItems.js'), content)
  console.log(`Updated menuItems.js (${products.length} products)`)
}

function updateGallery() {
  const targets = [
    ['marigold-indian-wedding-cake', 'marigold'],
    ['gold-drip-birthday-celebration', 'birthday'],
    ['corporate-dessert-spread', 'corporate'],
    ['floral-fondant-masterpiece', 'westernWedding'],
    ['artisan-pastry-selection', 'pastry'],
    ['naked-rustic-celebration', 'naked'],
    ['macaron-tower-display', 'macaron'],
    ['seasonal-fruit-tart-collection', 'fruit'],
    ['elegant-tiered-wedding', 'tiered'],
    ['rasmalai-dessert-bar', 'rasmalai'],
    ['jalebi-saffron-display', 'jalebi'],
    ['indian-wedding-showcase', 'indianWedding'],
    ['mango-kulfi-parfait-station', 'kulfi'],
    ['festive-mithai-platter', 'indianSweets'],
  ]

  const imports = targets
    .map(([slug]) => `import ${toVar(slug)} from '../assets/images/gallery/${slug}.jpg'`)
    .join('\n')

  let content = fs.readFileSync(path.join(ROOT, 'src/data/gallery.js'), 'utf8')
  content = content.replace(/import \{ GALLERY_IMAGES \} from '\.\/images'\n\n/, `${imports}\n\n`)

  for (const [slug, oldKey] of targets) {
    content = content.replace(`image: GALLERY_IMAGES.${oldKey}`, `image: ${toVar(slug)}`)
  }

  fs.writeFileSync(path.join(ROOT, 'src/data/gallery.js'), content)
  console.log(`Updated gallery.js (${targets.length} items)`)
}

function updateShopCategories() {
  const targets = [
    ['classic-cakes', 'MENU_IMAGES.velvet'],
    ['gourmet-cakes', 'MENU_IMAGES.chocolate'],
    ['designer-cakes', 'MENU_IMAGES.weddingIndian'],
    ['photo-cakes', 'GALLERY_IMAGES.birthday'],
    ['pastries-desserts', 'MENU_IMAGES.rasmalai'],
    ['gift-hampers', 'GALLERY_IMAGES.indianSweets'],
  ]

  const imports = targets
    .map(([slug]) => `import ${toVar(slug)} from '../assets/images/categories/${slug}.jpg'`)
    .join('\n')

  let content = fs.readFileSync(path.join(ROOT, 'src/data/shopCategories.js'), 'utf8')
  content = content.replace(/import \{ GALLERY_IMAGES, MENU_IMAGES \} from '\.\/images'\n\n/, `${imports}\n\n`)

  for (const [slug, oldRef] of targets) {
    content = content.replace(`image: ${oldRef}`, `image: ${toVar(slug)}`)
  }

  fs.writeFileSync(path.join(ROOT, 'src/data/shopCategories.js'), content)
  console.log(`Updated shopCategories.js (${targets.length} categories)`)
}

updateMenuItems()
updateGallery()
updateShopCategories()
