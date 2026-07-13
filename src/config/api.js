/**
 * API configuration — set VITE_API_BASE_URL in .env when backend is ready.
 * Example: VITE_API_BASE_URL=http://localhost:3000/api
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
export const API_ENABLED = Boolean(API_BASE_URL)

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    profile: '/auth/profile',
    me: '/auth/me',
  },
  orders: {
    list: '/orders',
    create: '/orders',
    byId: (id) => `/orders/${id}`,
    track: (id) => `/orders/${id}/tracking`,
  },
  customCakes: {
    create: '/custom-cakes',
    options: '/custom-cakes/options',
    estimate: '/custom-cakes/estimate',
  },
  checkout: {
    create: '/checkout',
    validate: '/checkout/validate',
  },
  addresses: {
    list: '/addresses',
    create: '/addresses',
    update: (id) => `/addresses/${id}`,
    delete: (id) => `/addresses/${id}`,
    default: (id) => `/addresses/${id}/default`,
  },
  wishlist: {
    list: '/wishlist',
    add: '/wishlist',
    remove: (productId) => `/wishlist/${productId}`,
  },
  notifications: {
    list: '/notifications',
    markRead: (id) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
  },
  reviews: {
    list: '/reviews',
    create: '/reviews',
  },
  contact: {
    submit: '/contact',
  },
  feedback: {
    submit: '/feedback',
  },
  newsletter: {
    subscribe: '/newsletter/subscribe',
    unsubscribe: '/newsletter/unsubscribe',
  },
  admin: {
    customers: '/admin/customers',
    customerStats: '/admin/customers/stats',
    makeAdmin: (id) => `/admin/customers/${id}/make-admin`,
    orders: '/admin/orders',
    orderStatus: (id) => `/admin/orders/${id}/status`,
    products: '/admin/products',
    product: (id) => `/admin/products/${id}`,
    productsReset: '/admin/products/reset',
    customCakes: '/admin/custom-cakes',
    customCakeStatus: (id) => `/admin/custom-cakes/${id}/status`,
    messages: '/admin/messages',
    newsletter: '/admin/newsletter',
    reviews: '/admin/reviews',
    reviewApprove: (id) => `/admin/reviews/${id}/approve`,
    reviewDelete: (id) => `/admin/reviews/${id}`,
  },
  products: {
    list: '/products',
    byId: (id) => `/products/${id}`,
  },
  loyalty: {
    balance: '/loyalty',
  },
  payments: {
    config: '/payments/config',
    razorpayCreate: '/payments/razorpay/create-order',
    razorpayVerify: '/payments/razorpay/verify',
  },
}
