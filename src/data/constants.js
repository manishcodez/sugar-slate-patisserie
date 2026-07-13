export const FOUNDER = {
  name: 'Rupanjali Kumari',
  brand: 'CodeWithRupanjali',
  developerRole: 'Website Developer',
  developerTagline: 'Aspiring Software Developer | AI Enthusiast | Programmer',
  email: 'rupanjalikumari264@gmail.com',
  /** Add GF's real WhatsApp number when ready, e.g. '+91 98XXXXXXXX' */
  phone: '',
  whatsapp: '',
  github: 'https://github.com/CodeWithRupanjali',
  linkedin: 'https://www.linkedin.com/in/codewithrupanjali',
}

export const BAKERY = {
  name: 'Sugar & Slate Patisserie',
  tagline: 'Where French patisserie artistry meets the soul of Indian celebration.',
  address: 'Mirzamurad, Varanasi District, Uttar Pradesh, India - 221307',
  phone: FOUNDER.phone,
  email: FOUNDER.email,
  whatsapp: FOUNDER.whatsapp || FOUNDER.phone.replace(/\D/g, ''),
  hours: 'Open daily: 9am – 8pm',
  coordinates: {
    lat: 25.3176552,
    lng: 82.9739044,
  },
  social: {
    instagram: '',
    facebook: 'https://www.facebook.com/',
    pinterest: 'https://www.pinterest.com/',
  },
}

export const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Menu', href: '#menu' },
  { label: 'Blog', href: '#blog' },
  { label: 'Custom Cakes', href: '#custom-cakes' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Rewards', href: '#rewards' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
]

export const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT || ''

const { lat, lng } = BAKERY.coordinates

export const GOOGLE_MAPS_EMBED_URL =
  `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`

export const GOOGLE_MAPS_DIRECTIONS_URL =
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

/** @deprecated Use GOOGLE_MAPS_EMBED_URL */
export const MAP_EMBED_URL = GOOGLE_MAPS_EMBED_URL
