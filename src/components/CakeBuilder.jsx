import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInViewSection } from '../hooks/useInViewSection'
import {
  Heart, Cake, Gem, Briefcase, Baby, Sparkles,
  Flower2, Crown, Star, MessageSquare, Cookie,
  Check, ChevronLeft, ChevronRight, AlertCircle, Upload, X, ImageIcon,
} from 'lucide-react'
import {
  OCCASIONS, SIZES, WEIGHTS, SHAPES, FLAVORS, SPONGES, CREAMS, FILLINGS, LAYERS, THEMES,
  DESIGN_STYLES, ADDONS,
  MESSAGE_MAX_LENGTH, CUSTOM_CAKE_MIN_LEAD_DAYS, BLACKOUT_DATES,
  calculateEstimatedPrice,
} from '../data/cakeBuilder'
import { submitCustomCakeApi } from '../services/api/customCakesApi'
import { useNotification } from '../context/NotificationContext'
import { checkPincode } from '../data/deliveryZones'
import {
  isSameDayAvailable, getTodayKey, getSlotAvailability, bookSlot,
} from '../data/deliverySlots'
import DatePicker from './ui/DatePicker'
import SlotSelector from './SlotSelector'
import { isValidEmail, isValidPhone } from '../utils/validation'
import { SectionHeading } from './ui/Animations'
import Button from './ui/Button'

const ICON_MAP = {
  Heart, Cake, Gem, Briefcase, Baby, Sparkles,
  Flower2, Crown, Star, MessageSquare, Cookie,
}

const STEPS = [
  'Occasion',
  'Size & Weight',
  'Flavor & Filling',
  'Design Style',
  'Add-ons & Personalization',
  'Delivery Details',
  'Contact & Review',
]

const INITIAL = {
  occasion: '',
  shape: '',
  size: '',
  weight: '',
  customWeightKg: '3.5',
  flavor: '',
  sponge: '',
  cream: '',
  filling: '',
  layers: '',
  theme: '',
  design: '',
  addons: [],
  cakeMessage: '',
  photoPreview: null,
  photoName: '',
  deliveryType: 'delivery',
  pincode: '',
  orderType: 'advance',
  date: '',
  timeSlot: '',
  timeSlotId: '',
  address: '',
  name: '',
  phone: '',
  email: '',
  instructions: '',
}

const MAX_PHOTO_SIZE = 5 * 1024 * 1024

function SelectCard({ selected, onClick, children, className = '' }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`relative rounded-[var(--radius-md)] border-2 p-4 text-left transition-colors ${
        selected
          ? 'border-caramel bg-caramel/5 shadow-glow'
          : 'border-blush bg-cream hover:border-champagne'
      } ${className}`}
      whileTap={{ scale: 0.97 }}
      animate={selected ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {selected && (
        <motion.span
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-caramel text-cream"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        >
          <Check size={14} />
        </motion.span>
      )}
      {children}
    </motion.button>
  )
}

function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-sm text-red-700" role="alert">
      <AlertCircle size={14} />
      {message}
    </p>
  )
}

function CakeMockup({ message, photoPreview, flavorColor }) {
  return (
    <div className="mx-auto w-full max-w-[220px]">
      <p className="mb-2 text-center text-xs font-medium uppercase tracking-wider text-espresso/50">
        Live Preview
      </p>
      <div className="relative mx-auto">
        <div
          className="mx-auto h-28 w-44 rounded-t-full border-2 border-cocoa/20 shadow-warm"
          style={{ backgroundColor: flavorColor || '#F5E6C8' }}
        />
        <div
          className="mx-auto h-6 w-52 rounded-b-lg border-2 border-t-0 border-cocoa/20"
          style={{ backgroundColor: flavorColor ? `${flavorColor}cc` : '#E8D5B5' }}
        />
        {photoPreview && (
          <div className="absolute left-1/2 top-4 h-14 w-14 -translate-x-1/2 overflow-hidden rounded-full border-2 border-cream shadow-warm">
            <img src={photoPreview} alt="Photo cake preview" className="h-full w-full object-cover" />
          </div>
        )}
        {message && (
          <div className="absolute inset-x-0 bottom-8 flex justify-center px-2">
            <span className="rounded-full bg-cream/95 px-3 py-1 font-display text-xs font-semibold text-cocoa shadow-warm">
              {message}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function OrderSummary({ form, estimatedPrice }) {
  const occasion = OCCASIONS.find((o) => o.id === form.occasion)
  const size = SIZES.find((s) => s.id === form.size)
  const shape = SHAPES.find((s) => s.id === form.shape)
  const weight = WEIGHTS.find((w) => w.id === form.weight)
  const flavor = FLAVORS.find((f) => f.id === form.flavor)
  const sponge = SPONGES.find((s) => s.id === form.sponge)
  const cream = CREAMS.find((c) => c.id === form.cream)
  const filling = FILLINGS.find((f) => f.id === form.filling)
  const layers = LAYERS.find((l) => l.id === form.layers)
  const theme = THEMES.find((t) => t.id === form.theme)
  const design = DESIGN_STYLES.find((d) => d.id === form.design)
  const selectedAddons = ADDONS.filter((a) => form.addons.includes(a.id))

  return (
    <div className="rounded-[var(--radius-md)] bg-blush/50 p-4 sm:p-5">
      <h4 className="font-display text-base text-cocoa mb-3 sm:text-lg sm:mb-4">Order Summary</h4>
      <dl className="space-y-2 text-sm">
        {occasion && <div className="flex justify-between gap-3"><dt className="shrink-0 text-espresso/60">Occasion</dt><dd className="min-w-0 text-right">{occasion.label}</dd></div>}
        {shape && <div className="flex justify-between"><dt className="text-espresso/60">Shape</dt><dd>{shape.label}</dd></div>}
        {size && <div className="flex justify-between"><dt className="text-espresso/60">Size</dt><dd>{size.label}</dd></div>}
        {weight && (
          <div className="flex justify-between">
            <dt className="text-espresso/60">Weight</dt>
            <dd>{weight.isCustom ? `${form.customWeightKg} kg` : weight.label}</dd>
          </div>
        )}
        {flavor && <div className="flex justify-between"><dt className="text-espresso/60">Flavor</dt><dd>{flavor.label}</dd></div>}
        {sponge && <div className="flex justify-between"><dt className="text-espresso/60">Sponge</dt><dd>{sponge.label}</dd></div>}
        {cream && <div className="flex justify-between"><dt className="text-espresso/60">Cream</dt><dd>{cream.label}</dd></div>}
        {filling && filling.id !== 'none' && <div className="flex justify-between"><dt className="text-espresso/60">Filling</dt><dd>{filling.label}</dd></div>}
        {layers && <div className="flex justify-between"><dt className="text-espresso/60">Layers</dt><dd>{layers.label}</dd></div>}
        {theme && <div className="flex justify-between"><dt className="text-espresso/60">Theme</dt><dd>{theme.label}</dd></div>}
        {design && <div className="flex justify-between"><dt className="text-espresso/60">Design</dt><dd>{design.label}</dd></div>}
        {form.photoPreview && <div className="flex justify-between"><dt className="text-espresso/60">Photo</dt><dd>Uploaded</dd></div>}
        {form.cakeMessage && <div className="flex justify-between"><dt className="text-espresso/60">Message</dt><dd className="max-w-[140px] truncate text-right">&ldquo;{form.cakeMessage}&rdquo;</dd></div>}
        {selectedAddons.length > 0 && (
          <div>
            <dt className="text-espresso/60">Add-ons</dt>
            <dd className="mt-1">{selectedAddons.map((a) => a.label).join(', ')}</dd>
          </div>
        )}
        {form.date && (
          <div className="flex justify-between">
            <dt className="text-espresso/60">Date</dt>
            <dd>{form.orderType === 'same-day' ? 'Today (Same-Day)' : form.date}</dd>
          </div>
        )}
        {form.timeSlot && (
          <div className="flex justify-between">
            <dt className="text-espresso/60">Slot</dt>
            <dd>{form.timeSlot}</dd>
          </div>
        )}
      </dl>
      <div className="mt-4 border-t border-caramel/20 pt-4">
        <p className="text-sm text-espresso/60">Estimated Price</p>
        <p className="font-display text-xl text-caramel sm:text-2xl">
          ₹{estimatedPrice.min.toLocaleString('en-IN')} – ₹{estimatedPrice.max.toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  )
}

export default function CakeBuilder() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [summaryOpen, setSummaryOpen] = useState(false)
  const fileInputRef = useRef(null)
  const { inView: sectionInView } = useInViewSection('custom-cakes')
  const { showNotification, pushInbox } = useNotification()

  const flavor = FLAVORS.find((f) => f.id === form.flavor)

  const update = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'orderType') {
        next.date = value === 'same-day' ? getTodayKey() : ''
        next.timeSlot = ''
        next.timeSlotId = ''
      }
      if (key === 'date') {
        next.timeSlot = ''
        next.timeSlotId = ''
      }
      return next
    })
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const selectSlot = (slotId, slotLabel) => {
    setForm((prev) => ({ ...prev, timeSlotId: slotId, timeSlot: slotLabel }))
    setErrors((prev) => ({ ...prev, timeSlot: '' }))
  }

  const toggleAddon = (id) => {
    setForm((prev) => {
      const addons = prev.addons.includes(id)
        ? prev.addons.filter((a) => a !== id)
        : [...prev.addons, id]
      return {
        ...prev,
        addons,
        cakeMessage: id === 'message' && prev.addons.includes('message') ? '' : prev.cakeMessage,
      }
    })
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photo: 'Please upload an image file (JPG, PNG, or WebP)' }))
      return
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setErrors((prev) => ({ ...prev, photo: 'Image must be under 5 MB' }))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      update('photoPreview', reader.result)
      update('photoName', file.name)
      setErrors((prev) => ({ ...prev, photo: '' }))
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    update('photoPreview', null)
    update('photoName', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const estimatedPrice = useMemo(
    () => calculateEstimatedPrice({
      sizeId: form.size,
      weightId: form.weight,
      shapeId: form.shape,
      spongeId: form.sponge,
      creamId: form.cream,
      fillingId: form.filling,
      layersId: form.layers,
      themeId: form.theme,
      addons: form.addons,
      customWeightKg: form.customWeightKg,
      hasPhoto: !!form.photoPreview,
      messageText: form.cakeMessage,
    }),
    [form.size, form.weight, form.shape, form.sponge, form.cream, form.filling, form.layers, form.theme, form.addons, form.customWeightKg, form.photoPreview, form.cakeMessage],
  )

  const validateStep = () => {
    const e = {}
    switch (step) {
      case 0:
        if (!form.occasion) e.occasion = 'Please select an occasion'
        break
      case 1:
        if (!form.shape) e.shape = 'Please select a shape'
        if (!form.size) e.size = 'Please select a size'
        if (!form.weight) e.weight = 'Please select a weight'
        if (form.weight === '3kg+' && (!form.customWeightKg || Number(form.customWeightKg) < 3))
          e.customWeightKg = 'Enter weight of 3 kg or more'
        break
      case 2:
        if (!form.flavor) e.flavor = 'Please select a flavor'
        if (!form.sponge) e.sponge = 'Please select a sponge'
        if (!form.cream) e.cream = 'Please select a cream'
        if (!form.filling) e.filling = 'Please select a filling'
        if (!form.layers) e.layers = 'Please select number of layers'
        if (!form.theme) e.theme = 'Please select a theme'
        break
      case 3:
        if (!form.design) e.design = 'Please select a design style'
        break
      case 4:
        if (form.addons.includes('message') && !form.cakeMessage.trim())
          e.cakeMessage = 'Enter your cake message (max 30 characters)'
        break
      case 5: {
        const effectiveDate = form.orderType === 'same-day' ? getTodayKey() : form.date
        if (form.orderType === 'same-day') {
          if (!isSameDayAvailable()) {
            e.orderType = 'Same-day orders close at 2:00 PM — please choose Advance Order'
          }
        } else {
          if (!form.date) e.date = 'Please select a date'
          else {
            const selected = new Date(form.date)
            const min = new Date()
            min.setHours(0, 0, 0, 0)
            min.setDate(min.getDate() + CUSTOM_CAKE_MIN_LEAD_DAYS)
            if (selected < min) {
              e.date = `Custom cakes require at least ${CUSTOM_CAKE_MIN_LEAD_DAYS} days advance notice`
            }
            if (BLACKOUT_DATES.includes(form.date)) {
              e.date = 'This date is fully booked — please choose another'
            }
          }
        }
        if (!form.timeSlotId) e.timeSlot = 'Please select a time slot'
        else if (effectiveDate) {
          const avail = getSlotAvailability(effectiveDate, form.timeSlotId)
          if (!avail.available) e.timeSlot = 'This slot is fully booked'
        }
        if (form.deliveryType === 'delivery') {
          if (!form.address.trim()) e.address = 'Please enter a delivery address'
          if (!form.pincode.trim()) e.pincode = 'Please enter your delivery pincode'
          else {
            const zone = checkPincode(form.pincode)
            if (!zone.available) e.pincode = zone.message || 'Sorry, we do not deliver to this pincode'
          }
        }
        break
      }
      case 6:
        if (!form.name.trim()) e.name = 'Name is required'
        if (!form.email.trim()) e.email = 'Email is required'
        else if (!isValidEmail(form.email)) e.email = 'Please enter a valid email'
        if (!form.phone.trim()) e.phone = 'Phone is required'
        else if (!isValidPhone(form.phone)) e.phone = 'Please enter a valid phone number'
        break
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const back = () => setStep((s) => Math.max(s - 1, 0))

  const submit = async () => {
    if (!validateStep()) return
    const effectiveDate = form.orderType === 'same-day' ? getTodayKey() : form.date
    if (effectiveDate && form.timeSlotId) bookSlot(effectiveDate, form.timeSlotId)

    setSubmitting(true)
    setSubmitError('')
    const payload = {
      ...form,
      type: 'custom-cake',
      deliveryDate: effectiveDate,
      deliveryTime: form.timeSlot,
      estimatedPrice,
      status: 'pending',
    }
    const res = await submitCustomCakeApi(payload)
    setSubmitting(false)

    if (res.ok) {
      setSubmitted(true)
      pushInbox({
        title: 'Custom Cake Request Received',
        message: `Your custom cake request has been submitted. Reference: ${res.data?.id || 'pending'}`,
      })
      showNotification('Custom cake request submitted successfully!', 5000)
    } else {
      setSubmitError(res.error || 'Failed to submit request. Please try again.')
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100

  if (submitted) {
    return (
      <section id="custom-cakes" className="section-padding bg-blush">
        <div className="section-container max-w-lg text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sage/20"
          >
            <Check size={40} className="text-sage" />
          </motion.div>
          <h2 className="mb-4">Order Request Received!</h2>
          <p className="text-espresso/80">
            Thank you, {form.name}. Our pastry team will review your custom cake
            request and respond within 24–48 hours with a detailed quote and
            design consultation options.
          </p>
          <Button className="mt-8" onClick={() => { setSubmitted(false); setStep(0); setForm(INITIAL) }}>
            Start New Order
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section id="custom-cakes" className="section-padding bg-blush">
      <div className="section-container">
        <SectionHeading
          eyebrow="Design Your Dream Cake"
          title="Custom Cake Builder"
          subtitle="Create your perfect celebration centerpiece in seven simple steps. Our team will bring your vision to life."
        />

        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm text-espresso/60">
            <span>Step {step + 1} of {STEPS.length}: {STEPS[step]}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-cream">
            <motion.div
              className="h-full rounded-full bg-caramel"
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          </div>
        </div>

        <div className="grid gap-8 pb-32 lg:grid-cols-3 lg:pb-0">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 40, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {step === 0 && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {OCCASIONS.map((occ) => {
                        const Icon = ICON_MAP[occ.icon]
                        return (
                          <SelectCard key={occ.id} selected={form.occasion === occ.id} onClick={() => update('occasion', occ.id)}>
                            <Icon size={24} className="mb-2 text-caramel" />
                            <p className="font-medium text-cocoa">{occ.label}</p>
                          </SelectCard>
                        )
                      })}
                    </div>
                    <FieldError message={errors.occasion} />
                  </>
                )}

                {step === 1 && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="mb-3 font-display text-lg text-cocoa">Cake Shape</h3>
                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                        {SHAPES.map((shape) => (
                          <SelectCard key={shape.id} selected={form.shape === shape.id} onClick={() => update('shape', shape.id)}>
                            <p className="font-medium text-cocoa">{shape.label}</p>
                          </SelectCard>
                        ))}
                      </div>
                      <FieldError message={errors.shape} />
                    </div>
                    <div>
                      <h3 className="mb-3 font-display text-lg text-cocoa">Cake Size</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {SIZES.map((size) => (
                          <SelectCard key={size.id} selected={form.size === size.id} onClick={() => update('size', size.id)}>
                            <p className="font-display text-lg text-cocoa">{size.label}</p>
                            <p className="text-sm text-espresso/60">{size.servings}</p>
                          </SelectCard>
                        ))}
                      </div>
                      <FieldError message={errors.size} />
                    </div>
                    <div>
                      <h3 className="mb-3 font-display text-lg text-cocoa">Cake Weight</h3>
                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {WEIGHTS.map((w) => (
                          <SelectCard key={w.id} selected={form.weight === w.id} onClick={() => update('weight', w.id)}>
                            <p className="font-display text-lg text-cocoa">{w.label}</p>
                            <p className="mt-1 font-semibold text-caramel">From ₹{w.basePrice.toLocaleString('en-IN')}</p>
                          </SelectCard>
                        ))}
                      </div>
                      <FieldError message={errors.weight} />
                      {form.weight === '3kg+' && (
                        <div className="mt-4">
                          <label htmlFor="custom-weight" className="mb-1 block text-sm font-medium">
                            Exact Weight (kg) <span className="text-caramel">*</span>
                          </label>
                          <input
                            id="custom-weight"
                            type="number"
                            min="3"
                            step="0.5"
                            value={form.customWeightKg}
                            onChange={(e) => update('customWeightKg', e.target.value)}
                            className="w-full max-w-xs rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 outline-none focus:border-caramel"
                          />
                          <FieldError message={errors.customWeightKg} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="mb-3 font-display text-lg text-cocoa">Flavour</h3>
                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {FLAVORS.map((f) => (
                          <SelectCard key={f.id} selected={form.flavor === f.id} onClick={() => update('flavor', f.id)}>
                            <span className="mb-2 inline-block h-6 w-6 rounded-full border border-espresso/10" style={{ backgroundColor: f.color }} />
                            <p className="font-medium text-cocoa">{f.label}</p>
                          </SelectCard>
                        ))}
                      </div>
                      <FieldError message={errors.flavor} />
                    </div>
                    <div>
                      <h3 className="mb-3 font-display text-lg text-cocoa">Sponge</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {SPONGES.map((s) => (
                          <SelectCard key={s.id} selected={form.sponge === s.id} onClick={() => update('sponge', s.id)}>
                            <p className="font-medium text-cocoa">{s.label}</p>
                          </SelectCard>
                        ))}
                      </div>
                      <FieldError message={errors.sponge} />
                    </div>
                    <div>
                      <h3 className="mb-3 font-display text-lg text-cocoa">Cream</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {CREAMS.map((c) => (
                          <SelectCard key={c.id} selected={form.cream === c.id} onClick={() => update('cream', c.id)}>
                            <p className="font-medium text-cocoa">{c.label}</p>
                          </SelectCard>
                        ))}
                      </div>
                      <FieldError message={errors.cream} />
                    </div>
                    <div>
                      <h3 className="mb-3 font-display text-lg text-cocoa">Filling</h3>
                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {FILLINGS.map((f) => (
                          <SelectCard key={f.id} selected={form.filling === f.id} onClick={() => update('filling', f.id)}>
                            <p className="font-medium text-cocoa">{f.label}</p>
                          </SelectCard>
                        ))}
                      </div>
                      <FieldError message={errors.filling} />
                    </div>
                    <div>
                      <h3 className="mb-3 font-display text-lg text-cocoa">Number of Layers</h3>
                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                        {LAYERS.map((l) => (
                          <SelectCard key={l.id} selected={form.layers === l.id} onClick={() => update('layers', l.id)}>
                            <p className="font-medium text-cocoa">{l.label}</p>
                          </SelectCard>
                        ))}
                      </div>
                      <FieldError message={errors.layers} />
                    </div>
                    <div>
                      <h3 className="mb-3 font-display text-lg text-cocoa">Theme</h3>
                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {THEMES.map((t) => (
                          <SelectCard key={t.id} selected={form.theme === t.id} onClick={() => update('theme', t.id)}>
                            <p className="font-medium text-cocoa">{t.label}</p>
                          </SelectCard>
                        ))}
                      </div>
                      <FieldError message={errors.theme} />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {DESIGN_STYLES.map((style) => (
                        <SelectCard
                          key={style.id}
                          selected={form.design === style.id}
                          onClick={() => update('design', style.id)}
                          className="overflow-hidden p-0"
                        >
                          <div className="aspect-[4/3] w-full overflow-hidden bg-blush">
                            <img
                              src={style.image}
                              alt={`${style.label} cake design style`}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <p className="p-3 font-medium text-cocoa">{style.label}</p>
                        </SelectCard>
                      ))}
                    </div>
                    <FieldError message={errors.design} />
                  </>
                )}

                {step === 4 && (
                  <div className="space-y-8">
                    <div className="rounded-[var(--radius-md)] border border-blush bg-cream p-5">
                      <h3 className="mb-3 flex items-center gap-2 font-display text-lg text-cocoa">
                        <ImageIcon size={20} className="text-caramel" />
                        Photo Memory Cake
                      </h3>
                      <p className="mb-4 text-sm text-espresso/70">
                        Upload a photo for edible printing on your cake (+₹400)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      {form.photoPreview ? (
                        <div className="flex items-start gap-4">
                          <img src={form.photoPreview} alt="Uploaded cake photo" className="h-24 w-24 rounded-[var(--radius-sm)] object-cover shadow-warm" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-cocoa">{form.photoName}</p>
                            <button type="button" onClick={removePhoto} className="mt-2 flex items-center gap-1 text-sm text-caramel hover:underline">
                              <X size={14} /> Remove photo
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border-2 border-dashed border-caramel/40 bg-blush/30 py-8 text-cocoa transition-colors hover:border-caramel hover:bg-blush/50"
                        >
                          <Upload size={20} className="text-caramel" />
                          <span className="font-medium">Upload Photo (JPG, PNG, WebP — max 5 MB)</span>
                        </button>
                      )}
                      <FieldError message={errors.photo} />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {ADDONS.map((addon) => {
                        const Icon = ICON_MAP[addon.icon]
                        const selected = form.addons.includes(addon.id)
                        return (
                          <SelectCard key={addon.id} selected={selected} onClick={() => toggleAddon(addon.id)}>
                            <div className="flex items-center gap-3">
                              <Icon size={20} className="text-caramel" />
                              <div>
                                <p className="font-medium text-cocoa">{addon.label}</p>
                                <p className="text-sm text-caramel">+₹{addon.price.toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                          </SelectCard>
                        )
                      })}
                    </div>

                    {form.addons.includes('message') && (
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label htmlFor="cake-message" className="mb-1 block text-sm font-medium">
                            Cake Message <span className="text-caramel">*</span>
                            <span className="ml-2 text-espresso/50">({form.cakeMessage.length}/{MESSAGE_MAX_LENGTH})</span>
                          </label>
                          <input
                            id="cake-message"
                            type="text"
                            maxLength={MESSAGE_MAX_LENGTH}
                            value={form.cakeMessage}
                            onChange={(e) => update('cakeMessage', e.target.value)}
                            placeholder="e.g. Happy Birthday Aarav!"
                            className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 font-display text-lg outline-none focus:border-caramel"
                          />
                          <FieldError message={errors.cakeMessage} />
                        </div>
                        <CakeMockup
                          message={form.cakeMessage}
                          photoPreview={form.photoPreview}
                          flavorColor={flavor?.color}
                        />
                      </div>
                    )}

                    {!form.addons.includes('message') && (form.photoPreview || form.flavor) && (
                      <CakeMockup message="" photoPreview={form.photoPreview} flavorColor={flavor?.color} />
                    )}
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-5">
                    <div className="flex gap-3">
                      {['delivery', 'pickup'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => update('deliveryType', type)}
                          className={`flex-1 rounded-[var(--radius-sm)] border-2 py-3 font-medium capitalize transition-colors ${
                            form.deliveryType === type ? 'border-caramel bg-caramel/10 text-cocoa' : 'border-blush text-espresso/70'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Order Type</label>
                      <div className="flex gap-3">
                        {[
                          { id: 'same-day', label: 'Same-Day', hint: 'Order before 2 PM' },
                          { id: 'advance', label: 'Advance Order', hint: `${CUSTOM_CAKE_MIN_LEAD_DAYS}+ days notice` },
                        ].map((type) => {
                          const disabled = type.id === 'same-day' && !isSameDayAvailable()
                          return (
                            <button
                              key={type.id}
                              type="button"
                              disabled={disabled}
                              onClick={() => update('orderType', type.id)}
                              className={`flex-1 rounded-[var(--radius-sm)] border-2 px-3 py-3 text-left transition-colors ${
                                form.orderType === type.id
                                  ? 'border-caramel bg-caramel/10'
                                  : disabled
                                    ? 'cursor-not-allowed border-blush/50 opacity-50'
                                    : 'border-blush hover:border-caramel/50'
                              }`}
                            >
                              <span className="block text-sm font-medium text-cocoa">{type.label}</span>
                              <span className="text-xs text-espresso/60">{type.hint}</span>
                            </button>
                          )
                        })}
                      </div>
                      <FieldError message={errors.orderType} />
                    </div>

                    {form.orderType === 'advance' ? (
                      <DatePicker
                        value={form.date}
                        onChange={(d) => update('date', d)}
                        minLeadDays={CUSTOM_CAKE_MIN_LEAD_DAYS}
                        blackoutDates={BLACKOUT_DATES}
                        label="Preferred Delivery Date"
                      />
                    ) : (
                      <div className="rounded-[var(--radius-sm)] border border-sage/30 bg-sage/10 px-4 py-3 text-sm text-espresso">
                        <strong>Same-Day Delivery</strong> — scheduled for today ({getTodayKey()})
                      </div>
                    )}
                    <FieldError message={errors.date} />

                    <SlotSelector
                      orderType={form.orderType}
                      date={form.orderType === 'same-day' ? getTodayKey() : form.date}
                      selectedSlot={form.timeSlotId}
                      onSelect={selectSlot}
                      error={errors.timeSlot}
                    />

                    {form.deliveryType === 'delivery' && (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="pincode" className="mb-1 block text-sm font-medium">Delivery Pincode <span className="text-caramel">*</span></label>
                          <input
                            id="pincode"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={form.pincode}
                            onChange={(e) => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 outline-none focus:border-caramel"
                            placeholder="6-digit pincode"
                          />
                          <FieldError message={errors.pincode} />
                        </div>
                        <div>
                          <label htmlFor="address" className="mb-1 block text-sm font-medium">Delivery Address <span className="text-caramel">*</span></label>
                          <textarea id="address" rows={3} value={form.address} onChange={(e) => update('address', e.target.value)} className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 outline-none focus:border-caramel" />
                          <FieldError message={errors.address} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 6 && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="cb-name" className="mb-1 block text-sm font-medium">Full Name <span className="text-caramel">*</span></label>
                        <input id="cb-name" type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 outline-none focus:border-caramel" />
                        <FieldError message={errors.name} />
                      </div>
                      <div>
                        <label htmlFor="cb-phone" className="mb-1 block text-sm font-medium">Phone <span className="text-caramel">*</span></label>
                        <input id="cb-phone" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 outline-none focus:border-caramel" />
                        <FieldError message={errors.phone} />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="cb-email" className="mb-1 block text-sm font-medium">Email <span className="text-caramel">*</span></label>
                      <input id="cb-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 outline-none focus:border-caramel" />
                      <FieldError message={errors.email} />
                    </div>
                    <div>
                      <label htmlFor="cb-instructions" className="mb-1 block text-sm font-medium">Special Instructions</label>
                      <textarea id="cb-instructions" rows={4} value={form.instructions} onChange={(e) => update('instructions', e.target.value)} placeholder="Color themes, dietary needs, delivery notes..." className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 outline-none focus:border-caramel" />
                    </div>
                    <div className="lg:hidden">
                      <OrderSummary form={form} estimatedPrice={estimatedPrice} />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="secondary" size="sm" onClick={back} disabled={step === 0} className="flex w-full items-center justify-center gap-1 sm:w-auto">
                <ChevronLeft size={18} /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button size="sm" onClick={next} className="flex w-full items-center justify-center gap-1 sm:w-auto" magnetic>
                  Continue <ChevronRight size={18} />
                </Button>
              ) : (
                <Button onClick={submit} size="sm" magnetic disabled={submitting} className="w-full !px-4 !py-2.5 !text-sm sm:w-auto">
                  {submitting ? 'Submitting...' : (
                    <>
                      <span className="sm:hidden">Submit Order</span>
                      <span className="hidden sm:inline">Submit Custom Order Request</span>
                    </>
                  )}
                </Button>
              )}
            </div>
            {submitError && (
              <p className="mt-3 flex items-center gap-1 text-sm text-red-700" role="alert">
                <AlertCircle size={14} /> {submitError}
              </p>
            )}
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <OrderSummary form={form} estimatedPrice={estimatedPrice} />
              {(form.cakeMessage || form.photoPreview) && (
                <CakeMockup message={form.cakeMessage} photoPreview={form.photoPreview} flavorColor={flavor?.color} />
              )}
            </div>
          </div>
        </div>

        {sectionInView && (
          <button
            type="button"
            className="fixed bottom-[max(5.5rem,env(safe-area-inset-bottom))] left-4 right-4 z-40 rounded-full bg-caramel px-4 py-2.5 text-center text-sm font-semibold text-cream shadow-warm-lg lg:hidden"
            onClick={() => setSummaryOpen(!summaryOpen)}
          >
            View Order Summary ({estimatedPrice.min > 0 ? `₹${estimatedPrice.min.toLocaleString('en-IN')}+` : '—'})
          </button>
        )}

        <AnimatePresence>
          {summaryOpen && (
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[var(--radius-lg)] bg-cream p-6 shadow-warm-lg lg:hidden"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <OrderSummary form={form} estimatedPrice={estimatedPrice} />
              <button type="button" onClick={() => setSummaryOpen(false)} className="mt-4 w-full rounded-[var(--radius-sm)] bg-blush py-2 text-cocoa">Close</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
