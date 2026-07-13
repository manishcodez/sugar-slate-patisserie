import hero from '../assets/images/hero.jpg'
import vanillaBeanCheesecake from '../assets/images/products/vanilla-bean-cheesecake.jpg'
import designerFloralCake from '../assets/images/products/designer-floral-cake.jpg'
import chocolateTruffleDelight from '../assets/images/products/chocolate-truffle-delight.jpg'
import floralFondantMasterpiece from '../assets/images/gallery/floral-fondant-masterpiece.jpg'
import nakedRusticCelebration from '../assets/images/gallery/naked-rustic-celebration.jpg'
import kashiVishwanath from '../assets/images/about/kashi-vishwanath.jpg'
import varanasiGhats from '../assets/images/about/varanasi-ghats.jpg'

/** Famous Indian landmarks — Taj Mahal, India Gate, Kashi Vishwanath, Varanasi Ghats */
export const ABOUT_IMAGES = {
  about1: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=900&q=85&auto=format&fit=crop',
  about2: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=900&q=85&auto=format&fit=crop',
  about3: kashiVishwanath,
  about4: varanasiGhats,
}

export const IMAGES = {
  hero,
  about1: ABOUT_IMAGES.about1,
  about2: ABOUT_IMAGES.about2,
  about3: ABOUT_IMAGES.about3,
  about4: ABOUT_IMAGES.about4,
}

export const DESIGN_IMAGES = {
  minimalist: vanillaBeanCheesecake,
  floral: designerFloralCake,
  drip: chocolateTruffleDelight,
  fondant: floralFondantMasterpiece,
  rustic: nakedRusticCelebration,
}
