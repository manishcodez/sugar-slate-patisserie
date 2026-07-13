import { Router } from 'express'
import db, { newId } from '../db.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

function formatAddress(row) {
  return {
    id: row.id,
    label: row.label,
    name: row.name,
    phone: row.phone,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    pincode: row.pincode,
    instructions: row.instructions,
    isDefault: Boolean(row.is_default),
  }
}

router.get('/', authRequired, (req, res) => {
  const rows = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC')
    .all(req.user.id)
  res.json({ addresses: rows.map(formatAddress) })
})

router.post('/', authRequired, (req, res) => {
  const b = req.body || {}
  if (!b.name?.trim() || !b.phone?.trim() || !b.addressLine1?.trim() || !b.pincode?.trim() || !b.city?.trim()) {
    return res.status(400).json({ error: 'Please fill all required address fields' })
  }

  const count = db.prepare('SELECT COUNT(*) as c FROM addresses WHERE user_id = ?').get(req.user.id).c
  const id = newId('addr')
  const now = new Date().toISOString()
  const isDefault = count === 0 ? 1 : 0

  db.prepare(`
    INSERT INTO addresses (
      id, user_id, label, name, phone, address_line1, address_line2, city, pincode, instructions, is_default, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, req.user.id, b.label || 'Home', b.name.trim(), b.phone.trim(),
    b.addressLine1.trim(), b.addressLine2 || '', b.city.trim(), b.pincode.trim(),
    b.instructions || '', isDefault, now,
  )

  const row = db.prepare('SELECT * FROM addresses WHERE id = ?').get(id)
  res.status(201).json(formatAddress(row))
})

router.put('/:id', authRequired, (req, res) => {
  const row = db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!row) return res.status(404).json({ error: 'Address not found' })

  const b = req.body || {}
  db.prepare(`
    UPDATE addresses SET
      label = ?, name = ?, phone = ?, address_line1 = ?, address_line2 = ?,
      city = ?, pincode = ?, instructions = ?
    WHERE id = ? AND user_id = ?
  `).run(
    b.label ?? row.label,
    b.name ?? row.name,
    b.phone ?? row.phone,
    b.addressLine1 ?? row.address_line1,
    b.addressLine2 ?? row.address_line2,
    b.city ?? row.city,
    b.pincode ?? row.pincode,
    b.instructions ?? row.instructions,
    req.params.id,
    req.user.id,
  )

  const updated = db.prepare('SELECT * FROM addresses WHERE id = ?').get(req.params.id)
  res.json(formatAddress(updated))
})

router.delete('/:id', authRequired, (req, res) => {
  const result = db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Address not found' })
  res.json({ ok: true })
})

router.patch('/:id/default', authRequired, (req, res) => {
  const row = db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!row) return res.status(404).json({ error: 'Address not found' })

  db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id)
  db.prepare('UPDATE addresses SET is_default = 1 WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

export default router
