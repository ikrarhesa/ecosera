import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import AppShell from './layouts/AppShell'
import ScrollToTop from './components/ScrollToTop'
import './index.css'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import { ProductsProvider } from './context/ProductsContext'
import { WishlistProvider } from './context/WishlistContext'

// We use the browser's native 'auto' scroll restoration for POP (back/forward).
// ScrollToTop.tsx only handles PUSH (new page) navigations.
if (typeof window !== 'undefined') {
  window.history.scrollRestoration = 'auto'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Scroll to top on PUSH navigations (new page visits).
          Browser handles POP (back/forward) restoration automatically. */}
      <ScrollToTop />
      <ToastProvider>
        <ProductsProvider>
          <WishlistProvider>
            <CartProvider>
              <AppShell>
                <App />
              </AppShell>
            </CartProvider>
          </WishlistProvider>
        </ProductsProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
