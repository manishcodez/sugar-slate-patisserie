import { useState, useEffect } from 'react'
import { LogOut, Plus, Pencil, Trash2, Shield, RotateCcw, Settings, Package, Users, ShoppingBag, Mail, Cake, Star, Newspaper, Store, ExternalLink } from 'lucide-react'
import { useProducts } from '../../context/ProductsContext'
import { useAuth } from '../../context/AuthContext'
import { fetchCustomerStatsApi, fetchAdminOrdersApi } from '../../services/api/adminApi'
import { CATEGORIES } from '../../data/categories'
import Button from '../ui/Button'
import OwnerDashboardGate from './OwnerDashboardGate'
import AdminSettings from './AdminSettings'
import AdminCustomers from './AdminCustomers'
import AdminOrders from './AdminOrders'
import AdminInbox from './AdminInbox'
import AdminCustomCakes from './AdminCustomCakes'
import AdminNewsletter from './AdminNewsletter'
import AdminReviews from './AdminReviews'

const EDITABLE_CATEGORIES = CATEGORIES.filter((c) => c !== 'All')

export default function AdminPanel() {
  const { products, updateProduct, addProduct, deleteProduct, resetProducts } = useProducts()
  const { user, isAdmin, logout } = useAuth()
  const [panelTab, setPanelTab] = useState('products')
  const [customerCount, setCustomerCount] = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', price: '', category: '' })
  const [newForm, setNewForm] = useState({ name: '', price: '', category: EDITABLE_CATEGORIES[0] })
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!isAdmin) return
    fetchCustomerStatsApi()
      .then((res) => setCustomerCount(res.data?.total ?? 0))
      .catch(() => {})
    fetchAdminOrdersApi()
      .then((res) => setOrderCount(res.data?.orders?.length ?? 0))
      .catch(() => {})
  }, [isAdmin])

  const startEdit = (product) => {
    setEditingId(product.id)
    setEditForm({ name: product.name, price: String(product.price), category: product.category })
  }

  const saveEdit = () => {
    if (!editForm.name.trim() || !editForm.price) return
    updateProduct(editingId, {
      name: editForm.name.trim(),
      price: Number(editForm.price),
      category: editForm.category,
    })
    setEditingId(null)
    setStatus('Product updated successfully.')
    setTimeout(() => setStatus(''), 3000)
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newForm.name.trim() || !newForm.price) return
    addProduct(newForm)
    setNewForm({ name: '', price: '', category: EDITABLE_CATEGORIES[0] })
    setStatus('New product added.')
    setTimeout(() => setStatus(''), 3000)
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}" from the menu?`)) {
      deleteProduct(id)
      setStatus('Product removed.')
      setTimeout(() => setStatus(''), 3000)
    }
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col bg-cream">
        <header className="border-b border-blush bg-cream/95 px-5 py-4 md:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-caramel" />
              <span className="font-display text-lg text-cocoa">Sugar & Slate — Owner Dashboard</span>
            </div>
            <a
              href="/"
              className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-caramel/40 bg-caramel/10 px-3 py-2 text-sm font-medium text-caramel transition-colors hover:bg-caramel hover:text-cream"
            >
              <Store size={14} /> View Shop Website
            </a>
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center px-5 py-10">
          <OwnerDashboardGate />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-50 border-b border-blush bg-cream/95 backdrop-blur-md">
        <div className="section-container flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-caramel" />
            <div>
              <p className="font-display text-lg text-cocoa">Store Dashboard</p>
              <p className="text-xs text-espresso/60">{user.name} — shop owner</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-blush px-3 py-2 text-sm text-cocoa transition-colors hover:border-caramel hover:text-caramel"
            >
              <ExternalLink size={14} /> View Website
            </a>
            <Button variant="secondary" onClick={logout} className="gap-2">
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </div>
      </header>
    <section id="admin" className="section-padding pb-16">
      <div className="section-container">
        <div className="mb-8">
          <p className="text-sm text-espresso/60">
            Manage menu, orders, customers, messages, and reviews.
          </p>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto rounded-[var(--radius-sm)] bg-blush/50 p-1 scrollbar-thin">
          {[
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: orderCount > 0 ? `Orders (${orderCount})` : 'Orders', icon: ShoppingBag },
            { id: 'customers', label: customerCount > 0 ? `Customers (${customerCount})` : 'Customers', icon: Users },
            { id: 'custom-cakes', label: 'Custom Cakes', icon: Cake },
            { id: 'inbox', label: 'Inbox', icon: Mail },
            { id: 'newsletter', label: 'Newsletter', icon: Newspaper },
            { id: 'reviews', label: 'Reviews', icon: Star },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPanelTab(id)}
              className={`flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                panelTab === id ? 'bg-caramel text-cream' : 'text-espresso/70 hover:text-cocoa'
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {panelTab === 'settings' ? (
          <AdminSettings />
        ) : panelTab === 'customers' ? (
          <AdminCustomers />
        ) : panelTab === 'orders' ? (
          <AdminOrders />
        ) : panelTab === 'custom-cakes' ? (
          <AdminCustomCakes />
        ) : panelTab === 'inbox' ? (
          <AdminInbox />
        ) : panelTab === 'newsletter' ? (
          <AdminNewsletter />
        ) : panelTab === 'reviews' ? (
          <AdminReviews />
        ) : (
          <div className="space-y-8">
            {status && (
              <p className="rounded-[var(--radius-sm)] bg-sage/15 px-4 py-3 text-center text-sm font-medium text-sage">
                {status}
              </p>
            )}

            <form onSubmit={handleAdd} className="rounded-[var(--radius-md)] border border-blush bg-blush/30 p-5">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg text-cocoa">
                <Plus size={18} className="text-caramel" /> Add New Product
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <input
                  value={newForm.name}
                  onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Product name"
                  className="rounded-[var(--radius-sm)] border border-blush bg-cream px-3 py-2.5 outline-none focus:border-caramel"
                  required
                />
                <input
                  type="number"
                  min="1"
                  value={newForm.price}
                  onChange={(e) => setNewForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="Price (₹)"
                  className="rounded-[var(--radius-sm)] border border-blush bg-cream px-3 py-2.5 outline-none focus:border-caramel"
                  required
                />
                <select
                  value={newForm.category}
                  onChange={(e) => setNewForm((f) => ({ ...f, category: e.target.value }))}
                  className="rounded-[var(--radius-sm)] border border-blush bg-cream px-3 py-2.5 outline-none focus:border-caramel"
                >
                  {EDITABLE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="mt-4 gap-2" magnetic>
                <Plus size={16} /> Add Product
              </Button>
            </form>

            <div className="overflow-hidden rounded-[var(--radius-md)] border border-blush bg-cream shadow-warm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-blush bg-blush/50">
                      <th className="px-4 py-3 font-semibold text-cocoa">ID</th>
                      <th className="px-4 py-3 font-semibold text-cocoa">Name</th>
                      <th className="px-4 py-3 font-semibold text-cocoa">Price (₹)</th>
                      <th className="px-4 py-3 font-semibold text-cocoa">Category</th>
                      <th className="px-4 py-3 font-semibold text-cocoa">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-blush/60 last:border-0">
                        <td className="px-4 py-3 text-espresso/60">{product.id}</td>
                        <td className="px-4 py-3">
                          {editingId === product.id ? (
                            <input
                              value={editForm.name}
                              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                              className="w-full rounded border border-blush px-2 py-1 outline-none focus:border-caramel"
                            />
                          ) : (
                            <span className="font-medium text-cocoa">{product.name}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingId === product.id ? (
                            <input
                              type="number"
                              value={editForm.price}
                              onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                              className="w-24 rounded border border-blush px-2 py-1 outline-none focus:border-caramel"
                            />
                          ) : (
                            `₹${product.price.toLocaleString('en-IN')}`
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingId === product.id ? (
                            <select
                              value={editForm.category}
                              onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                              className="rounded border border-blush px-2 py-1 outline-none focus:border-caramel"
                            >
                              {EDITABLE_CATEGORIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-espresso/70">{product.category}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {editingId === product.id ? (
                              <>
                                <button type="button" onClick={saveEdit} className="text-xs font-semibold text-sage hover:underline">Save</button>
                                <button type="button" onClick={() => setEditingId(null)} className="text-xs text-espresso/50 hover:underline">Cancel</button>
                              </>
                            ) : (
                              <>
                                <button type="button" onClick={() => startEdit(product)} className="flex items-center gap-1 text-xs font-semibold text-caramel hover:underline">
                                  <Pencil size={12} /> Edit
                                </button>
                                <button type="button" onClick={() => handleDelete(product.id, product.name)} className="flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline">
                                  <Trash2 size={12} /> Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all products to defaults?')) {
                    resetProducts()
                    setStatus('Products reset to defaults.')
                  }
                }}
                className="inline-flex items-center gap-2 text-sm text-espresso/50 hover:text-caramel"
              >
                <RotateCcw size={14} /> Reset to Default Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
    </div>
  )
}
