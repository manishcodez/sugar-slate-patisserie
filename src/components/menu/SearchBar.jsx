import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search cakes, pastries, hampers...' }) {
  return (
    <div className="relative max-w-md flex-1">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-espresso/40" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-blush bg-cream py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-caramel"
        aria-label="Search products"
      />
    </div>
  )
}
