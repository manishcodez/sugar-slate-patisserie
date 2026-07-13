# Sugar & Slate Patisserie

A complete bakery website with online ordering, admin dashboard, customer accounts, and custom cake builder.

**Stack:** React 19 + Vite + Tailwind v4 (frontend) · Express + SQLite (backend)

---

## Quick Start

### 1. Install dependencies

```bash
npm install
npm install --prefix server
```

### 2. Environment files

Copy examples and edit if needed:

```bash
copy .env.example .env
copy server\.env.example server\.env
```

**Frontend `.env`** (required):
```
VITE_API_BASE_URL=http://localhost:3000/api
```

**Server `server/.env`** (minimum):
```
PORT=3000
JWT_SECRET=your-long-random-secret
CLIENT_ORIGIN=http://localhost:5173
SEED_ADMIN_EMAIL=admin@sugarslate.com
SEED_ADMIN_PASSWORD=Admin@2026
```

### 3. Run (two terminals)

**Terminal 1 — API:**
```bash
cd server
npm run dev
```

**Terminal 2 — Website:**
```bash
npm run dev
```

Open **http://localhost:5173**

---

## Default Admin Login

| Field | Value |
|-------|-------|
| URL | `http://localhost:5173/#admin` |
| Email | `admin@sugarslate.com` |
| Password | `Admin@2026` (change in `server/.env` before selling) |

---

## Features

### Customer website
- Menu with categories, search, wishlist
- Cart + checkout (demo mode — no real payment)
- Custom cake builder (7-step wizard)
- Gallery, blog, testimonials, reviews
- Loyalty rewards + coupons
- Pincode delivery checker (Varanasi area)
- Customer portal (orders, profile, addresses, tracking)
- Contact form + feedback + newsletter

### Admin dashboard (`#admin`)
- **Products** — add, edit, delete, reset menu
- **Orders** — view orders, update status, expand line items
- **Customers** — registered users, Make Admin
- **Custom Cakes** — cake builder requests with full detail view
- **Inbox** — contact + feedback messages
- **Newsletter** — subscriber list from footer signups
- **Reviews** — approve or hide customer reviews before they go live
- **Settings** — setup info

---

## Security (before going live)

| Setting | Why |
|---------|-----|
| Change `JWT_SECRET` in `server/.env` | Prevents forged login tokens |
| Change `SEED_ADMIN_PASSWORD` | Remove default admin password |
| Set `ALLOW_DEV_RESET=false` in production | Stops password reset codes in API responses |
| Configure SMTP | Sends real password-reset emails |
| Replace placeholder phone/email in `constants.js` | Buyer branding |

Checkout totals are **validated on the server** — customers cannot tamper with prices or coupons. Guest order tracking requires **order ID + email**.

---

## Payments (optional — later)

Online payments use **Razorpay**. Without keys, checkout runs in **demo mode** (orders still save to database).

To enable later, add to `server/.env`:
```
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
```

---

## Email (optional)

Order confirmation emails when SMTP is configured in `server/.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=app-password
SMTP_FROM=Sugar & Slate <orders@sugarslate.com>
```

---

## Customization for a buyer

| What to change | File |
|----------------|------|
| Shop name, phone, email, address | `src/data/constants.js` |
| Admin seed credentials | `server/.env` |
| Menu products | Admin panel or `server/src/data/seedProducts.js` |
| Delivery pincodes | `src/data/deliveryZones.js` |
| Logo / colors | CSS variables in `src/index.css` |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend |
| `npm run server` | Start API |
| `npm run build` | Production build |
| `npm run lint` | Run oxlint |
| `npm run fetch-images` | Download product images |

---

## Selling this website

Include for the buyer:
1. Full source code
2. This README + `server/README.md`
3. Default admin credentials (changed to their own)
4. 30 min setup walkthrough

**Demo mode checkout** works out of the box. Buyer adds their own Razorpay + domain when ready.

---

## License

Private / commercial — sold as a complete bakery website product.
