import React from "react";
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
  return (
    <>
      <Header />

      {/* Optional Additional Content */}
      {showSearchBar && children && (
        <div className="px-4 pb-2">
          {children}
        </div>
      )}

      <BottomNavbar />
    </>
  );
}
