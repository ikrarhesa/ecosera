import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import AppShell from './components/AppShell'
import ScrollToTop from './components/ScrollToTop'
import './index.css'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import { ProductsProvider } from './context/ProductsContext'
import { WishlistProvider } from './context/WishlistContext'

// Let the browser natively save and restore window scroll on back/forward.
// This is the browser default but we set it explicitly to be safe.
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
