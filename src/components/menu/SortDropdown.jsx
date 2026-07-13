import { ChevronDown } from 'lucide-react'
import { SORT_OPTIONS } from '../../data/shopCategories'

export default function SortDropdown({ value, onChange }) {
  return (
    <div className="relative">
      <label htmlFor="sort-products" className="sr-only">Sort products</label>
      <select
        id="sort-products"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-full border border-blush bg-cream py-3 pl-5 pr-10 text-sm font-medium text-cocoa outline-none transition-colors focus:border-caramel cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-caramel" />
    </div>
  )
}
