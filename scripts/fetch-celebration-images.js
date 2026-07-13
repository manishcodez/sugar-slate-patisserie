import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const API_KEY = 'l81SzgGGRv6fwGcjT1aE9z8f1SeJJSUQbBd6klB0dUWECc67lTXyyQsp'
const DELAY_MS = 300
const OUTPUT_DIR = 'src/assets/images/celebrations'

const PEOPLE_KEYWORDS = [
  'people', 'person', 'family', 'friends', 'group', 'couple', 'child', 'children',
  'woman', 'women', 'man', 'men', 'girl', 'boy', 'mother', 'father', 'grandmother',
  'grandfather', 'bride', 'groom', 'guests', 'crowd', 'team', 'colleagues',
  'celebration', 'party', 'smiling', 'laughing', 'together',
]

const REJECT_KEYWORDS = [
  'building', 'architecture', 'landscape', 'mountain', 'ocean', 'empty', 'solo portrait',
  'headshot', 'studio portrait', 'fashion model', 'makeup tutorial', 'car ', 'vehicle',
  'dog', 'cat', 'pet only', 'food only', 'close up food', 'flat lay', 'ingredients',
]

const CELEBRATION_TARGETS = [
  {
    slug: 'customer-diwali-mithai-1',
    label: 'Diwali family sweets',
    queries: [
      'indian family diwali celebration home',
      'family celebrating diwali sweets india',
      'diwali festival family diyas home',
    ],
    orientation: 'portrait',
  },
  {
    slug: 'wedding-cake-cutting-2',
    label: 'Wedding cake cutting',
    queries: [
      'bride groom wedding cake cutting',
      'indian wedding cake cutting ceremony',
      'couple cutting wedding cake celebration',
    ],
    orientation: 'landscape',
  },
  {
    slug: 'birthday-cake-feeding-3',
    label: 'Child birthday cake',
    queries: [
      'child birthday cake celebration happy',
      'kids birthday party cake candles',
      'toddler birthday cake family',
    ],
    orientation: 'square',
  },
  {
    slug: 'customer-holi-sweets-4',
    label: 'Holi celebration',
    queries: [
      'holi festival family celebration colors india',
      'friends holi celebration laughing',
      'indian holi party family',
    ],
    orientation: 'landscape',
  },
  {
    slug: 'customer-raksha-bandhan-5',
    label: 'Raksha Bandhan siblings',
    queries: [
      'raksha bandhan siblings celebration india',
      'brother sister rakhi festival india',
      'indian raksha bandhan family',
    ],
    orientation: 'portrait',
  },
  {
    slug: 'anniversary-cake-celebration-6',
    label: 'Anniversary celebration',
    queries: [
      'elderly couple anniversary celebration cake',
      'grandparents anniversary family cake',
      'couple anniversary dinner celebration',
    ],
    orientation: 'portrait',
  },
  {
    slug: 'corporate-diwali-party-7',
    label: 'Corporate Diwali party',
    queries: [
      'office diwali party team celebration',
      'corporate team party celebration india',
      'colleagues office festival celebration',
    ],
    orientation: 'landscape',
  },
  {
    slug: 'grandma-birthday-cake-8',
    label: 'Grandma birthday',
    queries: [
      'grandmother birthday cake family',
      'grandma birthday celebration family',
      'elderly woman birthday party family',
    ],
    orientation: 'square',
  },
  {
    slug: 'wedding-mehendi-sweets-9',
    label: 'Wedding mehendi',
    queries: [
      'indian mehendi ceremony women celebration',
      'bridal mehendi wedding women friends',
      'indian wedding mehendi party women',
    ],
    orientation: 'portrait',
  },
  {
    slug: 'customer-diwali-hamper-10',
    label: 'Diwali home celebration',
    queries: [
      'family diwali celebration home lights',
      'indian family festival celebration home',
      'diwali home family gathering india',
    ],
    orientation: 'landscape',
  },
]

const BROAD_FALLBACKS = [
  'birthday party people cake celebration',
  'wedding celebration people india',
  'family festival celebration india',
  'friends party dessert celebration',
]

const usedPhotoIds = new Set()
const results = []

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isPeopleRelevant(alt) {
  const text = (alt || '').toLowerCase()
  if (!text.trim()) return false
  if (REJECT_KEYWORDS.some((word) => text.includes(word))) return false
  return PEOPLE_KEYWORDS.some((word) => text.includes(word))
}

async function searchPexels(query, orientation = 'landscape') {
  const url = new URL('https://api.pexels.com/v1/search')
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', '15')
  if (orientation) url.searchParams.set('orientation', orientation)

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
    if (!isPeopleRelevant(photo.alt)) continue
    return photo
  }

  for (const photo of photos) {
    if (usedPhotoIds.has(photo.id)) continue
    const text = (photo.alt || '').toLowerCase()
    if (REJECT_KEYWORDS.some((word) => text.includes(word))) continue
    return photo
  }

  return null
}

async function findUniquePhoto(queries, orientation) {
  for (const query of queries) {
    const photos = await searchPexels(query, orientation)
    await sleep(DELAY_MS)
    const photo = pickPhoto(photos)
    if (photo) return { photo, query }
  }

  for (const query of BROAD_FALLBACKS) {
    const photos = await searchPexels(query, orientation)
    await sleep(DELAY_MS)
    const photo = pickPhoto(photos)
    if (photo) return { photo, query }
  }

  return null
}

async function downloadPhoto(photo, outputPath) {
  const imageUrl = photo.src.large2x || photo.src.large || photo.src.medium
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Download failed ${response.status} for photo ${photo.id}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, buffer)
}

async function fetchTarget(target) {
  const outputPath = path.join(ROOT, OUTPUT_DIR, `${target.slug}.jpg`)
  const queries = [...new Set(target.queries)]

  try {
    const match = await findUniquePhoto(queries, target.orientation)
    if (!match) {
      results.push({ ...target, status: 'FAILED', error: 'No matching photo found' })
      return
    }

    const { photo, query } = match
    await downloadPhoto(photo, outputPath)
    usedPhotoIds.add(photo.id)

    results.push({
      ...target,
      status: 'OK',
      filename: `${target.slug}.jpg`,
      query,
      alt: photo.alt,
      photoId: photo.id,
      path: outputPath,
    })
  } catch (error) {
    results.push({ ...target, status: 'FAILED', error: error.message })
  }
}

async function main() {
  console.log('Fetching people celebration photos from Pexels...\n')

  for (const target of CELEBRATION_TARGETS) {
    await fetchTarget(target)
  }

  console.log('\n' + '='.repeat(72))
  for (const item of results) {
    if (item.status === 'OK') {
      console.log(`✓ ${item.label} → ${item.filename} (#${item.photoId})`)
      console.log(`  alt: "${item.alt}"`)
    } else {
      console.log(`✗ ${item.label} — ${item.error}`)
    }
  }

  const ok = results.filter((r) => r.status === 'OK').length
  console.log('='.repeat(72))
  console.log(`Done: ${ok}/${results.length} succeeded`)
  if (ok < results.length) process.exitCode = 1
}

main().catch((error) => {
  console.error('Fatal:', error)
  process.exit(1)
})
