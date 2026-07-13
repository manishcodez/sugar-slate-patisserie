import classicCakes from '../assets/images/categories/classic-cakes.jpg'
import gourmetCakes from '../assets/images/categories/gourmet-cakes.jpg'
import designerCakes from '../assets/images/categories/designer-cakes.jpg'
import photoCakes from '../assets/images/categories/photo-cakes.jpg'
import pastriesDesserts from '../assets/images/categories/pastries-desserts.jpg'
import giftHampers from '../assets/images/categories/gift-hampers.jpg'
import { CATEGORIES, CUSTOM_CAKES_CATEGORY } from './categories'

export const SHOP_CATEGORIES = [
  {
    id: 'classic',
    name: 'Classic Cakes',
    filter: 'Cakes',
    image: classicCakes,
    description: 'Timeless favourites, perfected',
  },
  {
    id: 'custom',
    name: 'Custom Cakes',
    filter: CUSTOM_CAKES_CATEGORY,
    scrollTo: '#custom-cakes',
    image: designerCakes,
    description: 'Design your dream cake',
  },
  {
    id: 'gourmet',
    name: 'Gourmet Cakes',
    filter: 'Cakes',
    image: gourmetCakes,
    description: 'Premium ingredients, elevated flavours',
  },
  {
    id: 'photo',
    name: 'Photo Cakes',
    filter: CUSTOM_CAKES_CATEGORY,
    searchHint: 'Photo',
    image: photoCakes,
    description: 'Personalised edible memories',
  },
  {
    id: 'pastries',
    name: 'Pastries & Desserts',
    filter: 'Pastries',
    image: pastriesDesserts,
    description: 'French finesse meets Indian soul',
  },
  {
    id: 'hampers',
    name: 'Gift Hampers',
    filter: 'Hampers',
    image: giftHampers,
    description: 'Curated boxes for gifting',
  },
]

export const FILTER_TABS = CATEGORIES

export const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
]
