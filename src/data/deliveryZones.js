export const DELIVERY_ZONES = {
  near: { id: 'near', label: '0–5 km', fee: 0, description: 'Free delivery' },
  mid: { id: 'mid', label: '5–10 km', fee: 50, description: '₹50 delivery charge' },
  far: { id: 'far', label: '10–25 km', fee: 100, description: '₹100 delivery charge' },
  extended: { id: 'extended', label: '25+ km', fee: 150, description: '₹150 delivery charge' },
}

/** Named pincodes for Varanasi city & nearby towns */
export const SERVICEABLE_PINCODES = {
  221001: { zone: 'near', area: 'Godowlia / Cantt' },
  221002: { zone: 'near', area: 'Lanka / BHU' },
  221003: { zone: 'near', area: 'Sigra' },
  221004: { zone: 'mid', area: 'Cantonment' },
  221005: { zone: 'mid', area: 'Shivpur' },
  221006: { zone: 'far', area: 'Ramnagar' },
  221007: { zone: 'far', area: 'Chunar Road' },
  221008: { zone: 'far', area: 'Rajatalab' },
  221010: { zone: 'mid', area: 'Mahmoorganj' },
  221011: { zone: 'far', area: 'Sarnath' },
  221012: { zone: 'far', area: 'Pindra' },
  221307: { zone: 'near', area: 'Mirzamurad' },
  221106: { zone: 'mid', area: 'Varanasi South' },
  221108: { zone: 'mid', area: 'Varanasi East' },
  221109: { zone: 'mid', area: 'Varanasi West' },
  221201: { zone: 'far', area: 'Aurai' },
  221302: { zone: 'far', area: 'Babatpur' },
  221311: { zone: 'far', area: 'Varanasi Rural' },
  232101: { zone: 'extended', area: 'Chandauli' },
  232104: { zone: 'extended', area: 'Mughalsarai' },
  232108: { zone: 'extended', area: 'Chandauli District' },
  231001: { zone: 'extended', area: 'Mirzapur' },
  231304: { zone: 'extended', area: 'Mirzapur Rural' },
  275201: { zone: 'extended', area: 'Ghazipur' },
  275305: { zone: 'extended', area: 'Ghazipur Rural' },
  821101: { zone: 'extended', area: 'Bhabua' },
  821105: { zone: 'extended', area: 'Kaimur' },
  821109: { zone: 'extended', area: 'Mohania' },
  821110: { zone: 'extended', area: 'Kudra' },
  821111: { zone: 'extended', area: 'Durgawati' },
}

/** Prefix rules — Varanasi district + nearby districts */
const REGION_PREFIXES = [
  { prefix: '221', zone: 'mid', area: 'Varanasi & surroundings' },
  { prefix: '232', zone: 'extended', area: 'Chandauli & nearby' },
  { prefix: '231', zone: 'extended', area: 'Mirzapur & nearby' },
  { prefix: '275', zone: 'extended', area: 'Ghazipur & nearby' },
  { prefix: '821', zone: 'extended', area: 'Kaimur / Mohania & nearby' },
]

function zoneFromPrefix(code) {
  const match = REGION_PREFIXES.find((r) => code.startsWith(r.prefix))
  if (!match) return null
  const zone = DELIVERY_ZONES[match.zone]
  return {
    valid: true,
    available: true,
    pincode: code,
    area: match.area,
    zone: match.zone,
    zoneLabel: zone.label,
    fee: zone.fee,
    feeLabel: zone.fee === 0 ? 'Free' : `₹${zone.fee}`,
    message: `Delivery Available — ${match.area} (${zone.label}, ${zone.fee === 0 ? 'Free' : `₹${zone.fee}`})`,
  }
}

export function checkPincode(pincode) {
  const code = String(pincode).trim()
  if (!/^\d{6}$/.test(code)) {
    return { valid: false, available: false, message: 'Enter a valid 6-digit pincode' }
  }

  const entry = SERVICEABLE_PINCODES[code]
  if (entry) {
    const zone = DELIVERY_ZONES[entry.zone]
    return {
      valid: true,
      available: true,
      pincode: code,
      area: entry.area,
      zone: entry.zone,
      zoneLabel: zone.label,
      fee: zone.fee,
      feeLabel: zone.fee === 0 ? 'Free' : `₹${zone.fee}`,
      message: `Delivery Available — ${entry.area} (${zone.label}, ${zone.fee === 0 ? 'Free' : `₹${zone.fee}`})`,
    }
  }

  const byPrefix = zoneFromPrefix(code)
  if (byPrefix) return byPrefix

  return {
    valid: true,
    available: false,
    message: "Sorry, we don't deliver to this pincode yet. Try Pickup or contact us.",
  }
}

export function getDeliveryFee(pincode) {
  const result = checkPincode(pincode)
  if (!result.available) return null
  return result.fee
}
