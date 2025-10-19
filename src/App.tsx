
// src/App.tsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Etalase from "./pages/Etalase";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import AddProduct from "./pages/AddProduct";
import ELearning from "./pages/ELearning";
import ModuleDetail from "./pages/ModuleDetail";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import OnboardingWelcome from "./pages/onboarding/OnboardingWelcome";
import OnboardingKurasiLokal from "./pages/onboarding/OnboardingKurasiLokal";
import OnboardingHandmadeOtentik from "./pages/onboarding/OnboardingHandmadeOtentik";
import OnboardingKualitasTerjamin from "./pages/onboarding/OnboardingKualitasTerjamin";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(() => typeof window === "undefined");

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsReady(true);
      return;
    }

    const hasCompleted = window.localStorage.getItem("ecosera:onboardingCompleted") === "true";
    const isOnboardingRoute = location.pathname.startsWith("/onboarding");

    if (hasCompleted) {
      if (isOnboardingRoute) {
        navigate("/", { replace: true });
        return;
      }
      setIsReady(true);
      return;
    }

    if (!isOnboardingRoute) {
      navigate("/onboarding/welcome", { replace: true });
      return;
    }

    setIsReady(true);
  }, [location.pathname, navigate]);

  if (!isReady) {
    return null;
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<Navigate to="/onboarding/welcome" replace />} />
      <Route path="/onboarding/welcome" element={<OnboardingWelcome />} />
      <Route path="/onboarding/kurasi-lokal" element={<OnboardingKurasiLokal />} />
      <Route path="/onboarding/handmade-otentik" element={<OnboardingHandmadeOtentik />} />
      <Route path="/onboarding/kualitas-terjamin" element={<OnboardingKualitasTerjamin />} />
      <Route path="/" element={<Home />} />
      <Route path="/etalase" element={<Etalase />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/add-product" element={<AddProduct />} />
      <Route path="/e-learning" element={<ELearning />} />
      <Route path="/e-learning/:moduleId" element={<ModuleDetail />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
