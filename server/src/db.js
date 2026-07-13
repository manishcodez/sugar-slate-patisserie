import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import { SEED_PRODUCTS } from './data/seedProducts.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function openDatabase(dbPath) {
  try {
    const { default: Database } = await import('better-sqlite3')
    const db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    console.log('[db] using better-sqlite3')
    return db
  } catch {
    const { DatabaseSync } = await import('node:sqlite')
    const db = new DatabaseSync(dbPath)
    db.exec('PRAGMA journal_mode = WAL')
    db.exec('PRAGMA foreign_keys = ON')
    console.log('[db] using node:sqlite (dev fallback)')
    return db
  }
}

const dbPath = process.env.DATABASE_PATH
  || path.join(__dirname, '..', 'data', 'sugar-slate.db')

fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const db = await openDatabase(dbPath)

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      phone TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      type TEXT DEFAULT 'checkout',
      status TEXT NOT NULL DEFAULT 'confirmed',
      total REAL DEFAULT 0,
      customer_name TEXT,
      customer_email TEXT,
      customer_phone TEXT,
      payload TEXT NOT NULL,
      timeline TEXT DEFAULT '[]',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      label TEXT DEFAULT 'Home',
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address_line1 TEXT NOT NULL,
      address_line2 TEXT DEFAULT '',
      city TEXT NOT NULL,
      pincode TEXT NOT NULL,
      instructions TEXT DEFAULT '',
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      quote TEXT NOT NULL,
      rating INTEGER NOT NULL,
      photo TEXT,
      product_id TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT DEFAULT '',
      subject TEXT DEFAULT '',
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      category TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      email TEXT PRIMARY KEY,
      subscribed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS custom_cake_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      estimated_min REAL,
      estimated_max REAL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS loyalty (
      user_id TEXT PRIMARY KEY,
      points INTEGER NOT NULL DEFAULT 0,
      history TEXT NOT NULL DEFAULT '[]',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price REAL NOT NULL,
      original_price REAL,
      category TEXT NOT NULL,
      badge TEXT,
      image_key TEXT NOT NULL DEFAULT 'default',
      rating REAL DEFAULT 4.5,
      review_count INTEGER DEFAULT 0,
      popularity INTEGER DEFAULT 50,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `)

  seedAdmin()
  seedProducts()
  migrateSchema()
}

function migrateSchema() {
  try {
    db.exec('ALTER TABLE reviews ADD COLUMN approved INTEGER NOT NULL DEFAULT 1')
  } catch {
    /* column exists */
  }
}

function seedProducts() {
  const count = db.prepare('SELECT COUNT(*) as c FROM products').get().c
  if (count > 0) return
  const now = new Date().toISOString()
  const insert = db.prepare(`
    INSERT INTO products (
      id, name, description, price, original_price, category, badge,
      image_key, rating, review_count, popularity, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const p of SEED_PRODUCTS) {
    insert.run(
      p.id, p.name, p.description, p.price, p.original_price, p.category, p.badge,
      p.image_key, p.rating, p.review_count, p.popularity, now, now,
    )
  }
}

function seedAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@sugarslate.com').toLowerCase()
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (exists) return

  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@2026'
  const hash = bcrypt.hashSync(password, 10)
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, phone, created_at)
    VALUES (?, ?, ?, ?, 'admin', '', ?)
  `).run(`admin-${Date.now()}`, process.env.SEED_ADMIN_NAME || 'Sugar & Slate Admin', email, hash, now)
}

export function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function parseJson(raw, fallback = null) {
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function publicUser(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    phone: row.phone || '',
    createdAt: row.created_at,
  }
}

export function createNotification(userId, title, message) {
  if (!userId) return
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, read, created_at)
    VALUES (?, ?, ?, ?, 0, ?)
  `).run(newId('notif'), userId, title, message, new Date().toISOString())
}

export default db
