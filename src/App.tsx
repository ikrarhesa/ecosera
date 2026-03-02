
// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Etalase from "./pages/Etalase";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import AddProduct from "./pages/AddProduct";
import ELearning from "./pages/ELearning";
import ModuleDetail from "./pages/ModuleDetail";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/etalase" element={<Etalase />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/add-product" element={<AddProduct />} />
      <Route path="/e-learning" element={<ELearning />} />
      <Route path="/e-learning/:moduleId" element={<ModuleDetail />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
