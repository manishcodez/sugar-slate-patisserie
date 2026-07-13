import { Settings } from 'lucide-react'
import { SEED_ADMIN } from '../../data/adminConfig'

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-md)] border border-blush bg-cream p-5">
        <div className="mb-2 flex items-center gap-2">
          <Settings size={18} className="text-caramel" />
          <h2 className="font-display text-lg text-cocoa">Admin Settings</h2>
        </div>
        <p className="text-sm text-espresso/70">
          All customer signups, orders, and messages are saved in the database.
          Manage them from the Customers, Orders, and Inbox tabs.
        </p>
        <div className="mt-4 space-y-1 rounded-[var(--radius-sm)] bg-blush/30 px-4 py-3 text-sm">
          <p><strong>Admin email:</strong> {SEED_ADMIN.email}</p>
          <p className="text-espresso/60">Password is set in server/.env — change before going live.</p>
        </div>
        <p className="mt-4 text-sm text-espresso/60">
          After login on the shop website, use the <strong>Dashboard</strong> button in the header (owner only).
        </p>
        <p className="mt-3 text-sm text-espresso/50">
          Online payments (Razorpay) can be enabled later by adding API keys in server/.env.
        </p>
      </div>
    </div>
  )
}
