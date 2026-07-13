import { Shield, Store, LogIn } from 'lucide-react'
import Button from '../ui/Button'

export default function OwnerDashboardGate() {
  const openLogin = () => {
    window.location.href = '/'
    setTimeout(() => window.dispatchEvent(new CustomEvent('ss-open-auth')), 100)
  }

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mb-4 flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-caramel/15">
          <Shield size={26} className="text-caramel" />
        </div>
      </div>
      <h1 className="mb-2 font-display text-3xl text-cocoa">Store Dashboard</h1>
      <p className="mb-6 text-sm text-espresso/70">
        Login on the shop website with your owner account. After login, click <strong>Dashboard</strong> in the header.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button href="/" variant="secondary" className="gap-2">
          <Store size={16} /> Go to Shop Website
        </Button>
        <Button type="button" className="gap-2" magnetic onClick={openLogin}>
          <LogIn size={16} /> Login
        </Button>
      </div>
    </div>
  )
}
