// src/App.tsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
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
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/PageTransition";
import Navbar from "./components/Navbar";

// Wrapper that ensures Navbar is included in the page container for base screens
function PublicRoute({ children, level = 0 }: { children: React.ReactNode, level?: number }) {
  return (
    <PageTransition level={level}>
      <Navbar />
      {children}
    </PageTransition>
  )
}

export default function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <AnimatePresence mode="popLayout" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/" element={<PublicRoute level={0}><Home /></PublicRoute>} />
          <Route path="/etalase" element={<PublicRoute level={0}><Etalase /></PublicRoute>} />
          <Route path="/product/:slug" element={<PublicRoute level={1}><ProductDetail /></PublicRoute>} />
          <Route path="/cart" element={<PublicRoute level={1}><Cart /></PublicRoute>} />
          <Route path="/wishlist" element={<PublicRoute level={0}><Wishlist /></PublicRoute>} />
          <Route path="/search" element={<PublicRoute level={1}><Search /></PublicRoute>} />
          <Route path="/shop/:seller_id" element={<PublicRoute level={1}><SellerShop /></PublicRoute>} />
          <Route path="/e-learning" element={<PublicRoute level={0}><ELearning /></PublicRoute>} />
          <Route path="/e-learning/:moduleId" element={<PublicRoute level={1}><ModuleDetail /></PublicRoute>} />

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
      </AnimatePresence>
    </AuthProvider>
  );
}
