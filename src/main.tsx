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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
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
