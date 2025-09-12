// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Etalase from "./pages/Etalase";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";

export default function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/etalase" element={<Etalase />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    
  );
}
