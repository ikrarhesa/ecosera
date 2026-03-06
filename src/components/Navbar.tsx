import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import BottomNavbar from "./BottomNavbar";

interface NavbarProps {
  showSearchBar?: boolean;
  children?: React.ReactNode;
}

export default function Navbar({
  showSearchBar = false,
  children,
}: NavbarProps) {
  const location = useLocation();
  const path = location.pathname;

  // Pages that SHOULD HAVE the main Ecosera Header
  const showHeader =
    path === "/" ||
    path === "/etalase" ||
    path === "/wishlist" ||
    path === "/e-learning" ||
    path.startsWith("/e-learning/");

  // Pages that SHOULD HAVE the Bottom Navigation Bar
  const showBottomNav =
    path === "/" ||
    path === "/etalase" ||
    path === "/wishlist";

  return (
    <>
      {showHeader && <Header />}

      {/* Optional Additional Content */}
      {showSearchBar && children && (
        <div className="px-4 pb-2">
          {children}
        </div>
      )}

      {showBottomNav && <BottomNavbar />}
    </>
  );
}
