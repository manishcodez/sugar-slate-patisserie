const DELIVERY_ZONES = {
  near: { fee: 0 },
  mid: { fee: 50 },
  far: { fee: 100 },
  extended: { fee: 150 },
}

const SERVICEABLE_PINCODES = {
  221001: 'near', 221002: 'near', 221003: 'near', 221004: 'mid', 221005: 'mid',
  221006: 'far', 221007: 'far', 221008: 'far', 221010: 'mid', 221011: 'far',
  221012: 'far', 221307: 'near', 221106: 'mid', 221108: 'mid', 221109: 'mid',
  221201: 'far', 221302: 'far', 221311: 'far', 232101: 'extended', 232104: 'extended',
  232108: 'extended', 231001: 'extended', 231304: 'extended', 275201: 'extended',
  275305: 'extended', 821101: 'extended', 821105: 'extended', 821109: 'extended',
  821110: 'extended', 821111: 'extended',
}

const REGION_PREFIXES = ['221', '232', '231', '275', '821']

export function checkPincode(pincode) {
  const code = String(pincode || '').trim()
  if (!/^\d{6}$/.test(code)) {
    return { valid: false, available: false, message: 'Invalid pincode' }
  }
  const zoneKey = SERVICEABLE_PINCODES[code]
  if (zoneKey) {
    const zone = DELIVERY_ZONES[zoneKey]
    return { valid: true, available: true, fee: zone.fee, zone: zoneKey }
  }
  const prefix = REGION_PREFIXES.find((p) => code.startsWith(p))
  if (prefix) {
    const zone = DELIVERY_ZONES.mid
    return { valid: true, available: true, fee: zone.fee, zone: 'mid' }
  }
  return { valid: true, available: false, message: 'Delivery not available for this pincode' }
}
