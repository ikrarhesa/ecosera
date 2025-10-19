import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import { assertEnv } from "./utils/env";
import { ErrorBoundary } from "./components/ErrorBoundary";

assertEnv();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <React.StrictMode>
      <BrowserRouter>
        <ToastProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ToastProvider>
      </BrowserRouter>
    </React.StrictMode>
  </ErrorBoundary>,
)
