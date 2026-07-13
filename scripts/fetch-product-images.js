import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const API_KEY = 'l81SzgGGRv6fwGcjT1aE9z8f1SeJJSUQbBd6klB0dUWECc67lTXyyQsp'
const DELAY_MS = 250

const FOOD_KEYWORDS = [
  'cake', 'dessert', 'pastry', 'sweet', 'cupcake', 'tart', 'pie', 'cookie',
  'bakery', 'chocolate', 'cream', 'fruit', 'macaron', 'croissant', 'eclair',
  'cheesecake', 'mousse', 'frosting', 'baking', 'bread', 'donut', 'muffin',
  'candy', 'confection', 'fondant', 'icing', 'ganache', 'tiramisu', 'kulfi',
  'mithai', 'ladoo', 'barfi', 'jalebi', 'rasmalai', 'hamper', 'truffle',
  'bundt', 'sponge', 'biscuit', 'sugar', 'vanilla', 'caramel', 'pistachio',
  'saffron', 'almond', 'coconut', 'berry', 'waffle', 'pudding', 'custard',
  'treat', 'confectionery', 'patisserie',
]

const REJECT_KEYWORDS = [
  'wedding couple', 'bride and groom', 'bride', 'groom', 'portrait', 'person',
  'people', 'woman', 'man', 'child', 'family', 'couple', 'model', 'face',
  'building', 'architecture', 'palace', 'monastery', 'temple', 'church',
  'mosque', 'castle', 'landscape', 'mountain', 'cityscape', 'street', 'skyline',
  'office', 'business meeting', 'hand holding', 'hands holding', 'selfie',
  'fashion', 'clothing', 'dress', 'suit', 'jewelry', 'makeup', 'hair',
  'flower field', 'garden path', 'forest', 'ocean', 'beach sunset', 'travel',
  'car ', 'vehicle', 'dog', 'cat', 'pet', 'animal',
]

const PRODUCT_QUERIES = {
  'Kaju Katli Fusion Cake': 'kaju katli indian sweet cake dessert',
  'Gulab Jamun Cheesecake': 'gulab jamun cheesecake indian dessert',
  'Saffron Pistachio Cake': 'saffron pistachio layer cake dessert',
  'Mango Kulfi Cake': 'mango kulfi cake indian dessert',
  'Indian Wedding Tiered Cake': 'indian wedding tiered marigold cake dessert',
  'Motichoor Ladoo Cupcakes': 'motichoor ladoo cupcakes indian sweets',
  'Rasmalai Trifle': 'rasmalai trifle indian dessert layers',
  'Jalebi Swirl Tart': 'jalebi tart indian sweet dessert pastry',
  'Badam Halwa Pastry': 'almond halwa pastry indian dessert',
  'Thandai Macaron Box': 'thandai macaron colorful dessert cookies',
  'Velvet Rose Layer Cake': 'rose layer cake dessert pink frosting',
  'Midnight Ganache Torte': 'dark chocolate ganache cake dessert',
  'Vanilla Bean Cheesecake': 'vanilla bean cheesecake dessert slice',
  'Chocolate Truffle Delight': 'chocolate truffle cake dessert',
  'Photo Memory Cake': 'custom photo printed birthday cake dessert',
  'Designer Floral Cake': 'floral buttercream designer cake dessert',
  'Lemon Lavender Cupcakes': 'lemon lavender cupcakes dessert',
  'Red Velvet Cupcakes': 'red velvet cupcakes cream cheese frosting',
  'Salted Caramel Éclair': 'salted caramel eclair choux pastry',
  'Almond Croissant': 'almond croissant french pastry bakery',
  'Champagne Macaron Box': 'champagne macaron pastel dessert cookies',
  'Coconut Barfi Cookies': 'coconut barfi indian sweet cookies',
  'Autumn Spice Bundt': 'autumn spice bundt cake dessert',
  'Diwali Mithai Hamper': 'diwali mithai sweets gift box indian',
  'Celebration Sweet Box': 'assorted pastries dessert gift box',
  'Premium Dessert Hamper': 'premium dessert hamper gift pastries',
  'Pistachio Rose Macarons': 'pistachio rose macaron dessert cookies',
  'Tiramisu Jar': 'tiramisu dessert glass jar italian',
  'Coconut Ladoo Cake': 'coconut ladoo cake indian dessert',
  'Rose Milk Cake': 'rose milk cake indian dessert sponge',
}

const CATEGORY_FALLBACKS = {
  'Indian Specials': 'indian dessert mithai cake',
  'Seasonal Specials': 'seasonal artisan cake dessert',
  Cakes: 'artisan celebration layer cake dessert',
  Cupcakes: 'gourmet cupcakes bakery dessert',
  Pastries: 'french pastry dessert bakery',
  Cookies: 'artisan cookies macarons dessert',
  Hampers: 'dessert gift box hamper pastries',
}

const GALLERY_TARGETS = [
  { slug: 'marigold-indian-wedding-cake', title: 'Marigold Indian Wedding Cake', query: 'indian wedding marigold decorated cake dessert' },
  { slug: 'gold-drip-birthday-celebration', title: 'Gold Drip Birthday Celebration', query: 'gold drip birthday cake celebration dessert' },
  { slug: 'corporate-dessert-spread', title: 'Corporate Dessert Spread', query: 'corporate dessert catering pastry spread' },
  { slug: 'floral-fondant-masterpiece', title: 'Floral Fondant Masterpiece', query: 'floral fondant wedding cake dessert' },
  { slug: 'artisan-pastry-selection', title: 'Artisan Pastry Selection', query: 'artisan pastry bakery selection dessert' },
  { slug: 'naked-rustic-celebration', title: 'Naked Rustic Celebration', query: 'naked rustic layer cake dessert fruit' },
  { slug: 'macaron-tower-display', title: 'Macaron Tower Display', query: 'macaron tower display dessert colorful' },
  { slug: 'seasonal-fruit-tart-collection', title: 'Seasonal Fruit Tart Collection', query: 'seasonal fruit tart pastry dessert' },
  { slug: 'elegant-tiered-wedding', title: 'Elegant Tiered Wedding', query: 'elegant tiered wedding cake dessert white' },
  { slug: 'rasmalai-dessert-bar', title: 'Rasmalai Dessert Bar', query: 'rasmalai indian dessert bar sweets' },
  { slug: 'jalebi-saffron-display', title: 'Jalebi & Saffron Display', query: 'jalebi saffron indian sweets display' },
  { slug: 'indian-wedding-showcase', title: 'Indian Wedding Showcase', query: 'indian wedding celebration cake dessert ornate' },
  { slug: 'mango-kulfi-parfait-station', title: 'Mango Kulfi Parfait Station', query: 'mango kulfi parfait dessert indian' },
  { slug: 'festive-mithai-platter', title: 'Festive Mithai Platter', query: 'festive indian mithai platter sweets' },
]

const SHOP_CATEGORY_TARGETS = [
  { slug: 'classic-cakes', name: 'Classic Cakes', query: 'classic vanilla layer cake dessert elegant' },
  { slug: 'gourmet-cakes', name: 'Gourmet Cakes', query: 'gourmet chocolate luxury cake dessert' },
  { slug: 'designer-cakes', name: 'Designer Cakes', query: 'designer celebration ornate cake dessert' },
  { slug: 'photo-cakes', name: 'Photo Cakes', query: 'custom photo print birthday cake dessert' },
  { slug: 'pastries-desserts', name: 'Pastries & Desserts', query: 'french pastries dessert bakery assortment' },
  { slug: 'gift-hampers', name: 'Gift Hampers', query: 'dessert gift hamper box pastries sweets' },
]

const BROAD_FALLBACKS = [
  'artisan cake dessert bakery',
  'gourmet pastry dessert close up',
  'handcrafted sweet bakery treat',
  'indian dessert mithai sweets',
]

const usedPhotoIds = new Set()
const results = []

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isFoodRelevant(alt) {
  const text = (alt || '').toLowerCase()
  if (!text.trim()) return false
  if (REJECT_KEYWORDS.some((word) => text.includes(word))) return false
  return FOOD_KEYWORDS.some((word) => text.includes(word))
}

function buildProductQuery(product) {
  if (PRODUCT_QUERIES[product.name]) return PRODUCT_QUERIES[product.name]

  const nameWords = product.name
    .replace(/[®™]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()

  return `${nameWords} dessert bakery`
}

function getCategoryFallback(category) {
  return CATEGORY_FALLBACKS[category] || 'artisan cake dessert bakery'
}

function parseMenuItems() {
  const filePath = path.join(ROOT, 'src/data/menuItems.js')
  const content = fs.readFileSync(filePath, 'utf8')
  const blocks = content.split(/\n\s*{\s*\n/).slice(1)
  const items = []

  for (const block of blocks) {
    const id = block.match(/id:\s*(\d+)/)?.[1]
    const name = block.match(/name:\s*'([^']+)'/)?.[1]
    const description = block.match(/description:\s*'([^']+)'/)?.[1]
    const category = block.match(/category:\s*'([^']+)'/)?.[1]
    if (id && name) {
      items.push({
        id: Number(id),
        name,
        description: description || '',
        category: category || 'Cakes',
        slug: slugify(name),
      })
    }
  }

  return items
}

async function searchPexels(query, perPage = 5) {
  const url = new URL('https://api.pexels.com/v1/search')
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', String(perPage))
  url.searchParams.set('orientation', 'landscape')

  const response = await fetch(url, {
    headers: { Authorization: API_KEY },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Pexels API error ${response.status}: ${body}`)
  }

  const data = await response.json()
  return data.photos || []
}

function pickPhoto(photos) {
  for (const photo of photos) {
    if (usedPhotoIds.has(photo.id)) continue
    if (!isFoodRelevant(photo.alt)) continue
    return photo
  }
  return null
}

async function findUniquePhoto(queries) {
  for (const query of queries) {
    const photos = await searchPexels(query)
    await sleep(DELAY_MS)

    const photo = pickPhoto(photos)
    if (photo) return { photo, query }
  }
  return null
}

async function downloadPhoto(photo, outputPath) {
  const imageUrl = photo.src.large || photo.src.medium || photo.src.original
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Download failed ${response.status} for photo ${photo.id}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, buffer)
}

async function fetchForTarget({
  label,
  slug,
  queries,
  outputDir,
  type,
}) {
  const outputPath = path.join(ROOT, outputDir, `${slug}.jpg`)
  const uniqueQueries = [...new Set(queries.filter(Boolean))]

  try {
    const match = await findUniquePhoto(uniqueQueries)
    if (!match) {
      results.push({
        type,
        label,
        slug,
        status: 'FAILED',
        filename: null,
        query: uniqueQueries.join(' | '),
        alt: null,
        photoId: null,
      })
      return
    }

    const { photo, query } = match
    await downloadPhoto(photo, outputPath)
    usedPhotoIds.add(photo.id)

    results.push({
      type,
      label,
      slug,
      status: 'OK',
      filename: `${slug}.jpg`,
      query,
      alt: photo.alt,
      photoId: photo.id,
      path: outputPath,
    })
  } catch (error) {
    results.push({
      type,
      label,
      slug,
      status: 'FAILED',
      filename: null,
      query: uniqueQueries.join(' | '),
      alt: null,
      photoId: null,
      error: error.message,
    })
  }
}

function printReport() {
  const byType = {
    product: results.filter((r) => r.type === 'product'),
    gallery: results.filter((r) => r.type === 'gallery'),
    category: results.filter((r) => r.type === 'category'),
  }

  console.log('\n' + '='.repeat(72))
  console.log('FETCH REPORT')
  console.log('='.repeat(72))

  for (const [type, items] of Object.entries(byType)) {
    console.log(`\n${type.toUpperCase()} (${items.length} targets)`)
    console.log('-'.repeat(72))
    for (const item of items) {
      if (item.status === 'OK') {
        console.log(`✓ ${item.label}`)
        console.log(`  → ${item.filename} (photo #${item.photoId})`)
        console.log(`  query: "${item.query}"`)
        console.log(`  alt: "${item.alt}"`)
      } else {
        console.log(`✗ FAILED: ${item.label}`)
        console.log(`  tried: ${item.query}`)
        if (item.error) console.log(`  error: ${item.error}`)
      }
    }
    const ok = items.filter((i) => i.status === 'OK').length
    console.log(`\n${type} summary: ${ok}/${items.length} succeeded`)
  }

  const totalOk = results.filter((r) => r.status === 'OK').length
  const totalFailed = results.filter((r) => r.status === 'FAILED').length
  console.log('\n' + '='.repeat(72))
  console.log(`TOTAL: ${totalOk} succeeded, ${totalFailed} failed, ${results.length} targets`)
  console.log(`Unique Pexels photo IDs used: ${usedPhotoIds.size}`)
  console.log('='.repeat(72))
}

async function main() {
  console.log('Fetching unique food images from Pexels Search API...\n')

  const products = parseMenuItems()
  console.log(`Parsed ${products.length} products from menuItems.js`)

  for (const product of products) {
    const primaryQuery = buildProductQuery(product)
    const categoryFallback = getCategoryFallback(product.category)
    const queries = [primaryQuery, categoryFallback, ...BROAD_FALLBACKS]

    await fetchForTarget({
      type: 'product',
      label: product.name,
      slug: product.slug,
      queries,
      outputDir: 'src/assets/images/products',
    })
  }

  for (const item of GALLERY_TARGETS) {
    await fetchForTarget({
      type: 'gallery',
      label: item.title,
      slug: item.slug,
      queries: [item.query, 'celebration cake dessert bakery', ...BROAD_FALLBACKS],
      outputDir: 'src/assets/images/gallery',
    })
  }

  for (const item of SHOP_CATEGORY_TARGETS) {
    await fetchForTarget({
      type: 'category',
      label: item.name,
      slug: item.slug,
      queries: [item.query, 'artisan cake dessert patisserie', ...BROAD_FALLBACKS],
      outputDir: 'src/assets/images/categories',
    })
  }

  printReport()

  const failed = results.filter((r) => r.status === 'FAILED')
  if (failed.length > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
