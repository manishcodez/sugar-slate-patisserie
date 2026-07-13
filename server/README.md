# Sugar & Slate API

Express + SQLite backend for the patisserie website.

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

API runs at **http://localhost:3000/api**

Health check: `GET /api/health`

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Default `3000` |
| `JWT_SECRET` | Yes | Long random string for auth tokens |
| `CLIENT_ORIGIN` | Yes | Frontend URL (`http://localhost:5173`) |
| `DATABASE_PATH` | No | SQLite file path (default `./data/sugar-slate.db`) |
| `SEED_ADMIN_*` | No | First-run admin account |
| `RAZORPAY_*` | No | Payment gateway (optional) |
| `SMTP_*` | No | Order confirmation emails (optional) |

## Database

SQLite file created automatically on first run at `server/data/sugar-slate.db`.

Tables: users, orders, products, custom_cake_requests, contact_messages, feedback, newsletter, loyalty, addresses, wishlist, notifications, reviews.

## API Routes

| Prefix | Purpose |
|--------|---------|
| `/api/auth` | Login, signup, profile, password reset |
| `/api/products` | Public menu |
| `/api/checkout` | Validate + create orders |
| `/api/orders` | Customer order history + tracking |
| `/api/admin` | Dashboard (products, orders, customers, inbox) |
| `/api/custom-cakes` | Cake builder submissions |
| `/api/loyalty` | Points balance |
| `/api/payments` | Razorpay (optional) |

All admin routes require JWT + `role: admin`.

## Seed admin

On first start, if no admin exists, one is created from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `.env`.

Promote users to admin: `PATCH /api/admin/customers/:id/make-admin`
