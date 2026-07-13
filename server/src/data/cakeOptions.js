/** Cake builder options served to the frontend API */
export const CAKE_OPTIONS = {
  shapes: [
    { id: 'round', label: 'Round', priceMod: 0 },
    { id: 'square', label: 'Square', priceMod: 200 },
    { id: 'heart', label: 'Heart', priceMod: 400 },
    { id: 'rectangle', label: 'Rectangle', priceMod: 150 },
  ],
  sizes: [
    { id: '6in', label: '6" Round', servings: '8–10 guests', basePrice: 1800 },
    { id: '8in', label: '8" Round', servings: '14–18 guests', basePrice: 2800 },
    { id: '10in', label: '10" Round', servings: '24–30 guests', basePrice: 3800 },
    { id: 'tiered', label: 'Tiered (2–3)', servings: '40–80 guests', basePrice: 7500 },
  ],
  sponges: [
    { id: 'vanilla-sponge', label: 'Vanilla Sponge', priceMod: 0 },
    { id: 'chocolate-sponge', label: 'Chocolate Sponge', priceMod: 100 },
    { id: 'red-velvet', label: 'Red Velvet', priceMod: 200 },
    { id: 'carrot', label: 'Carrot Walnut', priceMod: 150 },
  ],
  creams: [
    { id: 'buttercream', label: 'Buttercream', priceMod: 0 },
    { id: 'whipped-cream', label: 'Whipped Cream', priceMod: 0 },
    { id: 'cream-cheese', label: 'Cream Cheese Frosting', priceMod: 150 },
    { id: 'ganache', label: 'Chocolate Ganache', priceMod: 200 },
  ],
  fillings: [
    { id: 'none', label: 'No Filling', priceMod: 0 },
    { id: 'fruit', label: 'Fresh Fruit', priceMod: 250 },
    { id: 'chocolate-mousse', label: 'Chocolate Mousse', priceMod: 300 },
    { id: 'nutella', label: 'Nutella', priceMod: 350 },
    { id: 'cream-cheese-fill', label: 'Cream Cheese', priceMod: 280 },
  ],
  layers: [
    { id: '1', label: '1 Layer', count: 1, priceMod: 0 },
    { id: '2', label: '2 Layers', count: 2, priceMod: 400 },
    { id: '3', label: '3 Layers', count: 3, priceMod: 800 },
    { id: '4', label: '4 Layers', count: 4, priceMod: 1200 },
  ],
  themes: [
    { id: 'classic', label: 'Classic Elegant', priceMod: 0 },
    { id: 'floral', label: 'Floral Garden', priceMod: 300 },
    { id: 'minimal', label: 'Minimal Modern', priceMod: 0 },
    { id: 'festive', label: 'Festive Celebration', priceMod: 400 },
    { id: 'kids', label: 'Kids Party', priceMod: 350 },
  ],
}

export function estimateCakePrice(payload) {
  const size = CAKE_OPTIONS.sizes.find((s) => s.id === payload.sizeId)
  const shape = CAKE_OPTIONS.shapes.find((s) => s.id === payload.shapeId)
  const sponge = CAKE_OPTIONS.sponges.find((s) => s.id === payload.spongeId)
  const cream = CAKE_OPTIONS.creams.find((c) => c.id === payload.creamId)
  const filling = CAKE_OPTIONS.fillings.find((f) => f.id === payload.fillingId)
  const layers = CAKE_OPTIONS.layers.find((l) => l.id === payload.layersId)
  const theme = CAKE_OPTIONS.themes.find((t) => t.id === payload.themeId)

  let base = payload.basePrice || 1600
  if (size) base += Math.round(size.basePrice * 0.2)
  base += shape?.priceMod || 0
  base += sponge?.priceMod || 0
  base += cream?.priceMod || 0
  base += filling?.priceMod || 0
  base += layers?.priceMod || 0
  base += theme?.priceMod || 0
  if (payload.hasPhoto) base += 400

  const min = Math.round(base)
  const max = Math.round(min * 1.2)
  return { min, max }
}
