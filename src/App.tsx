
// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Etalase from "./pages/Etalase";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import SellerShop from "./pages/SellerShop";
import ELearning from "./pages/ELearning";
import ModuleDetail from "./pages/ModuleDetail";
import Wishlist from "./pages/Wishlist";
import Search from "./pages/Search";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminShops from "./pages/admin/AdminShops";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductNew from "./pages/admin/AdminProductNew";
import AdminProductEdit from "./pages/admin/AdminProductEdit";
import AdminShopEdit from "./pages/admin/AdminShopEdit";
import AdminShopNew from "./pages/admin/AdminShopNew";
import AdminMarketing from "./pages/admin/AdminMarketing";
import AdminMarketingNew from "./pages/admin/AdminMarketingNew";
import AdminMarketingEdit from "./pages/admin/AdminMarketingEdit";
import AdminTrending from "./pages/admin/AdminTrending";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/etalase" element={<Etalase />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/search" element={<Search />} />
        <Route path="/shop/:seller_id" element={<SellerShop />} />
        <Route path="/e-learning" element={<ELearning />} />
        <Route path="/e-learning/:moduleId" element={<ModuleDetail />} />

        {/* Admin login (public) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected admin routes */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/shops" element={<ProtectedRoute><AdminShops /></ProtectedRoute>} />
        <Route path="/admin/shops/new" element={<ProtectedRoute><AdminShopNew /></ProtectedRoute>} />
        <Route path="/admin/shops/:seller_id/edit" element={<ProtectedRoute><AdminShopEdit /></ProtectedRoute>} />
        <Route path="/admin/shops/:seller_id/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/shops/:seller_id/products/new" element={<ProtectedRoute><AdminProductNew /></ProtectedRoute>} />
        <Route path="/admin/shops/:seller_id/products/:product_id/edit" element={<ProtectedRoute><AdminProductEdit /></ProtectedRoute>} />
        <Route path="/admin/marketing" element={<ProtectedRoute><AdminMarketing /></ProtectedRoute>} />
        <Route path="/admin/marketing/new" element={<ProtectedRoute><AdminMarketingNew /></ProtectedRoute>} />
        <Route path="/admin/marketing/:id/edit" element={<ProtectedRoute><AdminMarketingEdit /></ProtectedRoute>} />
        <Route path="/admin/trending" element={<ProtectedRoute><AdminTrending /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
