import kajuKatliFusionCake from '../assets/images/products/kaju-katli-fusion-cake.jpg'
import gulabJamunCheesecake from '../assets/images/products/gulab-jamun-cheesecake.jpg'
import saffronPistachioCake from '../assets/images/products/saffron-pistachio-cake.jpg'
import mangoKulfiCake from '../assets/images/products/mango-kulfi-cake.jpg'
import indianWeddingTieredCake from '../assets/images/products/indian-wedding-tiered-cake.jpg'
import motichoorLadooCupcakes from '../assets/images/products/motichoor-ladoo-cupcakes.jpg'
import rasmalaiTrifle from '../assets/images/products/rasmalai-trifle.jpg'
import jalebiSwirlTart from '../assets/images/products/jalebi-swirl-tart.jpg'
import badamHalwaPastry from '../assets/images/products/badam-halwa-pastry.jpg'
import thandaiMacaronBox from '../assets/images/products/thandai-macaron-box.jpg'
import velvetRoseLayerCake from '../assets/images/products/velvet-rose-layer-cake.jpg'
import midnightGanacheTorte from '../assets/images/products/midnight-ganache-torte.jpg'
import vanillaBeanCheesecake from '../assets/images/products/vanilla-bean-cheesecake.jpg'
import chocolateTruffleDelight from '../assets/images/products/chocolate-truffle-delight.jpg'
import photoMemoryCake from '../assets/images/products/photo-memory-cake.jpg'
import designerFloralCake from '../assets/images/products/designer-floral-cake.jpg'
import lemonLavenderCupcakes from '../assets/images/products/lemon-lavender-cupcakes.jpg'
import redVelvetCupcakes from '../assets/images/products/red-velvet-cupcakes.jpg'
import saltedCaramelEclair from '../assets/images/products/salted-caramel-eclair.jpg'
import almondCroissant from '../assets/images/products/almond-croissant.jpg'
import champagneMacaronBox from '../assets/images/products/champagne-macaron-box.jpg'
import coconutBarfiCookies from '../assets/images/products/coconut-barfi-cookies.jpg'
import autumnSpiceBundt from '../assets/images/products/autumn-spice-bundt.jpg'
import diwaliMithaiHamper from '../assets/images/products/diwali-mithai-hamper.jpg'
import celebrationSweetBox from '../assets/images/products/celebration-sweet-box.jpg'
import premiumDessertHamper from '../assets/images/products/premium-dessert-hamper.jpg'
import pistachioRoseMacarons from '../assets/images/products/pistachio-rose-macarons.jpg'
import tiramisuJar from '../assets/images/products/tiramisu-jar.jpg'
import coconutLadooCake from '../assets/images/products/coconut-ladoo-cake.jpg'
import roseMilkCake from '../assets/images/products/rose-milk-cake.jpg'
import { CATEGORIES, INDIAN_MITHAI_CATEGORY, CUSTOM_CAKES_CATEGORY } from './categories'

export { CATEGORIES, INDIAN_MITHAI_CATEGORY, CUSTOM_CAKES_CATEGORY }

export const MENU_ITEMS = [
  {
    id: 1, name: 'Kaju Katli Fusion Cake', description: 'Silken cashew fudge layers with cardamom and edible silver leaf.',
    price: 2800, originalPrice: 3400, category: INDIAN_MITHAI_CATEGORY, badge: 'Bestseller',
    image: kajuKatliFusionCake, rating: 4.9, reviewCount: 1240, popularity: 98,
  },
  {
    id: 2, name: 'Gulab Jamun Cheesecake', description: 'Baked cheesecake swirled with warm gulab jamun compote and saffron cream.',
    price: 3200, originalPrice: 3999, category: INDIAN_MITHAI_CATEGORY, badge: 'Premium',
    image: gulabJamunCheesecake, rating: 4.8, reviewCount: 980, popularity: 95,
  },
  {
    id: 3, name: 'Saffron Pistachio Cake', description: 'Fluffy saffron sponge with pistachio praline buttercream.',
    price: 2600, category: INDIAN_MITHAI_CATEGORY, image: saffronPistachioCake, rating: 4.7, reviewCount: 756, popularity: 88,
  },
  {
    id: 4, name: 'Mango Kulfi Cake', description: 'Alphonso mango mousse atop vanilla sponge with kulfi-spiced cream.',
    price: 2400, category: 'Seasonal Specials', badge: 'Seasonal',
    image: mangoKulfiCake, rating: 4.8, reviewCount: 620, popularity: 82,
  },
  {
    id: 5, name: 'Indian Wedding Tiered Cake', description: 'Three-tier masterpiece with marigold florals and rasmalai cream.',
    price: 8500, originalPrice: 9999, category: 'Cakes', badge: 'Premium',
    image: indianWeddingTieredCake, rating: 5.0, reviewCount: 412, popularity: 90,
  },
  {
    id: 6, name: 'Motichoor Ladoo Cupcakes', description: 'Saffron cupcakes crowned with motichoor crumble and rose petals.',
    price: 180, category: 'Cupcakes', badge: 'Bestseller',
    image: motichoorLadooCupcakes, rating: 4.6, reviewCount: 2100, popularity: 92,
  },
  {
    id: 7, name: 'Rasmalai Trifle', description: 'Layers of spongy rasmalai, rabri cream, and pistachio crumble.',
    price: 450, category: 'Pastries', image: rasmalaiTrifle, rating: 4.7, reviewCount: 890, popularity: 78,
  },
  {
    id: 8, name: 'Jalebi Swirl Tart', description: 'Buttery tart with rabri custard and crisp jalebi spirals.',
    price: 380, category: 'Pastries', badge: 'Seasonal',
    image: jalebiSwirlTart, rating: 4.5, reviewCount: 540, popularity: 72,
  },
  {
    id: 9, name: 'Badam Halwa Pastry', description: 'Flaky puff pastry encasing warm almond halwa with cardamom.',
    price: 220, category: 'Pastries', image: badamHalwaPastry, rating: 4.6, reviewCount: 430, popularity: 70,
  },
  {
    id: 10, name: 'Thandai Macaron Box', description: 'Twelve macarons in thandai, rose, and pistachio flavours.',
    price: 1200, originalPrice: 1499, category: 'Cookies', badge: 'Premium',
    image: thandaiMacaronBox, rating: 4.8, reviewCount: 670, popularity: 85,
  },
  {
    id: 11, name: 'Velvet Rose Layer Cake', description: 'Rose-infused sponge with mascarpone cream and fresh berries.',
    price: 2200, category: 'Cakes', image: velvetRoseLayerCake, rating: 4.7, reviewCount: 1580, popularity: 87,
  },
  {
    id: 12, name: 'Midnight Ganache Torte', description: 'Belgian dark chocolate layers with espresso buttercream.',
    price: 2400, originalPrice: 2899, category: 'Cakes', badge: 'Premium',
    image: midnightGanacheTorte, rating: 4.9, reviewCount: 1120, popularity: 91,
  },
  {
    id: 13, name: 'Vanilla Bean Cheesecake', description: 'Silky New York-style cheesecake on a buttery biscuit crust.',
    price: 1800, category: 'Cakes', image: vanillaBeanCheesecake, rating: 4.6, reviewCount: 940, popularity: 80,
  },
  {
    id: 14, name: 'Chocolate Truffle Delight', description: 'Decadent chocolate sponge with ganache drip and gold leaf.',
    price: 2100, category: 'Cakes', image: chocolateTruffleDelight, rating: 4.8, reviewCount: 870, popularity: 84,
  },
  {
    id: 15, name: 'Photo Memory Cake', description: 'Custom edible photo print on vanilla buttercream — your moment, edible.',
    price: 1950, originalPrice: 2499, category: CUSTOM_CAKES_CATEGORY, badge: 'Trending',
    image: photoMemoryCake, rating: 4.7, reviewCount: 650, popularity: 86,
  },
  {
    id: 16, name: 'Designer Floral Cake', description: 'Hand-piped buttercream florals on vanilla chiffon layers.',
    price: 3500, category: CUSTOM_CAKES_CATEGORY, image: designerFloralCake, rating: 4.9, reviewCount: 520, popularity: 83,
  },
  {
    id: 17, name: 'Lemon Lavender Cupcakes', description: 'Zesty lemon cake with lavender Swiss meringue buttercream.',
    price: 160, category: 'Cupcakes', image: lemonLavenderCupcakes, rating: 4.5, reviewCount: 1800, popularity: 79,
  },
  {
    id: 18, name: 'Red Velvet Cupcakes', description: 'Classic red velvet with cream cheese frosting and cocoa dust.',
    price: 170, originalPrice: 220, category: 'Cupcakes', image: redVelvetCupcakes, rating: 4.6, reviewCount: 1450, popularity: 81,
  },
  {
    id: 19, name: 'Salted Caramel Éclair', description: 'Choux pastry with caramel crème pâtissière and chocolate cap.',
    price: 280, category: 'Pastries', image: saltedCaramelEclair, rating: 4.7, reviewCount: 720, popularity: 76,
  },
  {
    id: 20, name: 'Almond Croissant', description: 'Flaky laminated dough with frangipane and toasted almonds.',
    price: 200, category: 'Pastries', image: almondCroissant, rating: 4.8, reviewCount: 1100, popularity: 88,
  },
  {
    id: 21, name: 'Champagne Macaron Box', description: 'Twelve hand-piped macarons in champagne and vanilla bean.',
    price: 1200, category: 'Cookies', image: champagneMacaronBox, rating: 4.9, reviewCount: 890, popularity: 90,
  },
  {
    id: 22, name: 'Coconut Barfi Cookies', description: 'Buttery shortbread infused with coconut and condensed milk.',
    price: 350, originalPrice: 450, category: 'Cookies', image: coconutBarfiCookies, rating: 4.4, reviewCount: 380, popularity: 65,
  },
  {
    id: 23, name: 'Autumn Spice Bundt', description: 'Brown butter cake with cinnamon, nutmeg, and maple glaze.',
    price: 1600, category: 'Seasonal Specials', badge: 'Seasonal',
    image: autumnSpiceBundt, rating: 4.6, reviewCount: 290, popularity: 68,
  },
  {
    id: 24, name: 'Diwali Mithai Hamper', description: 'Assorted kaju katli, ladoo, barfi, and artisan chocolates in a gift box.',
    price: 2499, originalPrice: 2999, category: 'Hampers', badge: 'Bestseller',
    image: diwaliMithaiHamper, rating: 4.9, reviewCount: 560, popularity: 94,
  },
  {
    id: 25, name: 'Celebration Sweet Box', description: 'Curated selection of pastries, macarons, and mini cakes for gifting.',
    price: 1899, category: 'Hampers', image: celebrationSweetBox, rating: 4.7, reviewCount: 340, popularity: 77,
  },
  {
    id: 26, name: 'Premium Dessert Hamper', description: 'Luxury assortment with rasmalai trifle, éclairs, and saffron cake slices.',
    price: 3200, category: 'Hampers', badge: 'Premium',
    image: premiumDessertHamper, rating: 4.8, reviewCount: 210, popularity: 73,
  },
  {
    id: 27, name: 'Pistachio Rose Macarons', description: 'Delicate pistachio shells with rose ganache filling — box of 6.',
    price: 650, category: 'Cookies', image: pistachioRoseMacarons, rating: 4.7, reviewCount: 480, popularity: 74,
  },
  {
    id: 28, name: 'Tiramisu Jar', description: 'Classic Italian tiramisu layered in an elegant glass jar.',
    price: 420, originalPrice: 520, category: 'Pastries', image: tiramisuJar, rating: 4.8, reviewCount: 620, popularity: 82,
  },
  {
    id: 29, name: 'Coconut Ladoo Cake', description: 'Moist coconut sponge with coconut cream frosting and toasted flakes.',
    price: 1900, category: INDIAN_MITHAI_CATEGORY, image: coconutLadooCake, rating: 4.5, reviewCount: 390, popularity: 71,
  },
  {
    id: 30, name: 'Rose Milk Cake', description: 'Fluffy sponge soaked in rose milk syrup with whipped cream layers.',
    price: 1750, category: INDIAN_MITHAI_CATEGORY, badge: 'New',
    image: roseMilkCake, rating: 4.6, reviewCount: 280, popularity: 69,
  },
  {
    id: 31, name: 'Bespoke Tiered Custom Cake', description: 'Fully personalised tiered cake — choose flavour, weight, design & message in our Cake Builder.',
    price: 4500, category: CUSTOM_CAKES_CATEGORY, badge: 'Custom',
    image: indianWeddingTieredCake, rating: 4.9, reviewCount: 180, popularity: 85,
  },
]

export const BESTSELLERS = MENU_ITEMS
  .filter((item) => item.badge === 'Bestseller' || item.popularity >= 88)
  .slice(0, 10)

export function formatReviews(count) {
  if (count >= 1000) return `(${(count / 1000).toFixed(1)}k Reviews)`
  return `(${count} Reviews)`
}

export function getDiscountPercent(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

export function filterAndSortProducts(items, { category, search, sortBy }) {
  let result = [...items]

  if (category && category !== 'All') {
    result = result.filter((item) => item.category === category)
  }

  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q),
    )
  }

  switch (sortBy) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      result.sort((a, b) => b.rating - a.rating)
      break
    default:
      result.sort((a, b) => b.popularity - a.popularity)
  }

  return result
}
