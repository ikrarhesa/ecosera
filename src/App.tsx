// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
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
import AdminDashboard from "./pages/admin/AdminDashboard";
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
import PublicLayout from "./layouts/PublicLayout";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/etalase" element={<PublicLayout><Etalase /></PublicLayout>} />
        <Route path="/product/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
        <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
        <Route path="/wishlist" element={<PublicLayout><Wishlist /></PublicLayout>} />
        <Route path="/search" element={<PublicLayout><Search /></PublicLayout>} />
        <Route path="/shop/:seller_id" element={<PublicLayout><SellerShop /></PublicLayout>} />
        <Route path="/e-learning" element={<PublicLayout><ELearning /></PublicLayout>} />
        <Route path="/e-learning/:moduleId" element={<PublicLayout><ModuleDetail /></PublicLayout>} />

        {/* Admin login (public) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected admin routes — wrapped in AdminLayout (sidebar) */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/shops" element={<AdminShops />} />
          <Route path="/admin/shops/new" element={<AdminShopNew />} />
          <Route path="/admin/shops/:seller_id/edit" element={<AdminShopEdit />} />
          <Route path="/admin/shops/:seller_id/products" element={<AdminProducts />} />
          <Route path="/admin/shops/:seller_id/products/new" element={<AdminProductNew />} />
          <Route path="/admin/shops/:seller_id/products/:product_id/edit" element={<AdminProductEdit />} />
          <Route path="/admin/marketing" element={<AdminMarketing />} />
          <Route path="/admin/marketing/new" element={<AdminMarketingNew />} />
          <Route path="/admin/marketing/:id/edit" element={<AdminMarketingEdit />} />
          <Route path="/admin/trending" element={<AdminTrending />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
